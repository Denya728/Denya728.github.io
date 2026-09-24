(function(){
  const invCategories=['Ingredientes','Empaques e insumos','Productos terminados','Otros'];
  const unitOptions=['g','kg','ml','L','pz','caja','bolsa','paquete','docena','otro'];
  function iid(){return 'i'+Date.now()+Math.random().toString(36).slice(2,6)}
  function nowText(){return new Date().toLocaleString('es-MX')}
  function normalizeInventory(){
    state.inventory.forEach(i=>{
      if(!i.category)i.category=/caja|base|bolsa|dowel|empaque/i.test(i.name)?'Empaques e insumos':'Ingredientes';
      if(!i.purchaseUnit)i.purchaseUnit=i.unit||'pz';
      if(!i.useUnit)i.useUnit=i.unit||'pz';
      if(i.purchaseContent==null)i.purchaseContent=1;
      if(i.purchaseCost==null)i.purchaseCost=(Number(i.cost)||0)*(Number(i.purchaseContent)||1);
      if(i.stockMin==null)i.stockMin=0;
      if(!i.supplier)i.supplier='';
      if(!i.brand)i.brand='General';
      if(i.active==null)i.active=true;
      if(!Array.isArray(i.movements))i.movements=[];
      i.cost=(Number(i.purchaseCost)||0)/(Number(i.purchaseContent)||1);
      i.unit=i.useUnit;
    });
    save();
  }
  normalizeInventory();

  function syncRecipeCosts(item){
    state.recipes.forEach(r=>(r.components||[]).forEach(c=>{
      if(c.type==='ingredient'&&c.refId===item.id){c.unitCost=Number(item.cost)||0;c.unit=item.useUnit||item.unit;c.name=item.name}
    }));
  }
  function openInventoryItem(id=null){
    const item=id?state.inventory.find(x=>x.id===id):{name:'',category:'Ingredientes',purchaseUnit:'bolsa',useUnit:'g',purchaseContent:1000,purchaseCost:0,stock:0,stockMin:0,supplier:'',brand:'General',active:true,movements:[]};
    const w=modal(id?'Editar artículo':'Agregar artículo',`
      <div class="helper"><b>Compra vs uso:</b> registra cómo compras el artículo y cómo lo utilizan tus recetas. DENYA calcula el costo unitario automáticamente.</div>
      <div class="form2">
        ${field('Nombre del artículo','iname',item.name||'')}
        ${selectField('Categoría','icat',invCategories.map(x=>({value:x,label:x})),item.category||'Ingredientes')}
        ${selectField('Unidad de compra','ipurchaseunit',unitOptions.map(x=>({value:x,label:x})),item.purchaseUnit||'bolsa')}
        ${field('Contenido del producto','icontent',item.purchaseContent||1,'number','step="0.01" min="0.0001"')}
        ${selectField('Unidad de uso','iuseunit',unitOptions.map(x=>({value:x,label:x})),item.useUnit||item.unit||'pz')}
        ${field('Costo de compra (MXN)','ipurchasecost',item.purchaseCost||0,'number','step="0.01" min="0"')}
        ${field('Stock actual','istock',item.stock||0,'number','step="0.01"')}
        ${field('Stock mínimo','imin',item.stockMin||0,'number','step="0.01" min="0"')}
        ${field('Proveedor principal','isupplier',item.supplier||'')}
        ${field('Marca / subempresa','ibrand',item.brand||'General')}
        <label class="field">Estado<select id="iactive"><option value="1" ${item.active!==false?'selected':''}>Activo</option><option value="0" ${item.active===false?'selected':''}>Dado de baja</option></select></label>
        <div class="unit-cost-preview"><span>Costo por unidad de uso</span><strong id="icostpreview">${money(item.cost||0)}</strong><small id="icostunit">por ${esc(item.useUnit||item.unit||'unidad')}</small></div>
      </div>
    `,wrap=>{
      const name=wrap.querySelector('#iname').value.trim();if(!name){toast('Escribe el nombre del artículo');return false}
      const content=Number(wrap.querySelector('#icontent').value)||1,purchaseCost=Number(wrap.querySelector('#ipurchasecost').value)||0,useUnit=wrap.querySelector('#iuseunit').value;
      const oldStock=Number(item.stock)||0;
      const data={id:id||iid(),name,category:wrap.querySelector('#icat').value,purchaseUnit:wrap.querySelector('#ipurchaseunit').value,useUnit,purchaseContent:content,purchaseCost,cost:purchaseCost/content,unit:useUnit,stock:Number(wrap.querySelector('#istock').value)||0,stockMin:Number(wrap.querySelector('#imin').value)||0,supplier:wrap.querySelector('#isupplier').value.trim(),brand:wrap.querySelector('#ibrand').value.trim()||'General',active:wrap.querySelector('#iactive').value==='1',movements:item.movements||[]};
      if(id){Object.assign(item,data);if(data.stock!==oldStock)item.movements.unshift({date:nowText(),type:'Ajuste',qty:data.stock-oldStock,balance:data.stock,note:'Ajuste desde edición'})}else{data.movements.unshift({date:nowText(),type:'Alta',qty:data.stock,balance:data.stock,note:'Stock inicial'});state.inventory.push(data)}
      syncRecipeCosts(id?item:data);save();show('inventory');toast('Artículo guardado');
    });
    function preview(){const c=Number(w.querySelector('#icontent').value)||1,pc=Number(w.querySelector('#ipurchasecost').value)||0,u=w.querySelector('#iuseunit').value;w.querySelector('#icostpreview').textContent=money(pc/c);w.querySelector('#icostunit').textContent='por '+u}
    w.querySelectorAll('#icontent,#ipurchasecost,#iuseunit').forEach(el=>el.oninput=preview);
  }
  function adjustInventory(id){
    const i=state.inventory.find(x=>x.id===id);if(!i)return;
    const w=modal('Ajustar stock',`<div class="helper"><b>${esc(i.name)}</b> · Stock actual: ${Number(i.stock).toFixed(2)} ${esc(i.useUnit||i.unit)}</div><div class="form2">${selectField('Movimiento','movtype',[{value:'Entrada',label:'Entrada (+)'},{value:'Salida',label:'Salida (-)'},{value:'Conteo',label:'Conteo físico / reemplazar stock'}],'Entrada')}${field('Cantidad','movqty',1,'number','step="0.01" min="0"')}${field('Motivo / nota','movnote','')}</div>`,wrap=>{
      const type=wrap.querySelector('#movtype').value,qty=Number(wrap.querySelector('#movqty').value)||0,note=wrap.querySelector('#movnote').value.trim();let newStock=Number(i.stock)||0,delta=0;
      if(type==='Entrada'){delta=qty;newStock+=qty}else if(type==='Salida'){delta=-qty;newStock=Math.max(0,newStock-qty)}else{delta=qty-newStock;newStock=qty}
      i.stock=newStock;i.movements=i.movements||[];i.movements.unshift({date:nowText(),type,qty:delta,balance:newStock,note});save();show('inventory');toast('Stock actualizado');
    },'Guardar ajuste',false);
  }
  function inventoryMovements(id){
    const i=state.inventory.find(x=>x.id===id);if(!i)return;const rows=(i.movements||[]);
    modal('Movimientos · '+esc(i.name),`<div class="helper">Stock actual: <b>${Number(i.stock).toFixed(2)} ${esc(i.useUnit||i.unit)}</b></div><div class="table-wrap"><table class="table" style="min-width:700px"><thead><tr><th>Fecha</th><th>Tipo</th><th>Movimiento</th><th>Saldo</th><th>Nota</th></tr></thead><tbody>${rows.map(m=>`<tr><td>${esc(m.date||'')}</td><td>${esc(m.type||'')}</td><td class="${Number(m.qty)<0?'shortage':'enough'}">${Number(m.qty)>0?'+':''}${Number(m.qty).toFixed(2)}</td><td>${Number(m.balance).toFixed(2)} ${esc(i.useUnit||i.unit)}</td><td>${esc(m.note||'')}</td></tr>`).join('')||'<tr><td colspan="5"><div class="empty">Sin movimientos registrados.</div></td></tr>'}</tbody></table></div>`,null,'',true);
  }
  function toggleInventory(id){const i=state.inventory.find(x=>x.id===id);if(!i)return;i.active=!i.active;save();show('inventory');toast(i.active?'Artículo reactivado':'Artículo dado de baja')}
  function deleteInventory(id){const used=state.recipes.some(r=>(r.components||[]).some(c=>c.type==='ingredient'&&c.refId===id));if(used){toast('Este artículo está usado en recetas. Mejor dalo de baja.');return}if(confirm('¿Eliminar este artículo definitivamente?')){state.inventory=state.inventory.filter(x=>x.id!==id);save();show('inventory')}}
  window.openInventoryItem=openInventoryItem;window.adjustInventory=adjustInventory;window.inventoryMovements=inventoryMovements;window.toggleInventory=toggleInventory;window.deleteInventory=deleteInventory;

  views.inventory=function(){
    titleEl.textContent='Inventario';
    const active=state.inventory.filter(i=>i.active!==false),low=active.filter(i=>Number(i.stock)<=Number(i.stockMin||0)),value=active.reduce((s,i)=>s+(Number(i.stock)||0)*(Number(i.cost)||0),0);
    content.innerHTML=pageHead('Inventario','Controla ingredientes, empaques e insumos con costos reales y alertas de stock.',`<div class="row-actions"><button class="secondary" onclick="show('purchases')">Ver faltantes / compras</button><button class="primary" onclick="openInventoryItem()">+ Agregar artículo</button></div>`)+`
      <div class="grid4 inventory-kpis"><div class="card kpi"><small>Artículos activos</small><strong>${active.length}</strong></div><div class="card kpi"><small>Stock bajo</small><strong class="${low.length?'profit-neg':''}">${low.length}</strong></div><div class="card kpi"><small>Valor estimado</small><strong>${money(value)}</strong></div><div class="card kpi"><small>Categorías</small><strong>${new Set(active.map(i=>i.category)).size}</strong></div></div>
      <div class="toolbar inventory-toolbar" style="margin-top:14px"><input id="invSearch" placeholder="Buscar artículo, proveedor o marca" style="flex:1"><select id="invCategory"><option value="">Todas las categorías</option>${invCategories.map(c=>`<option>${c}</option>`).join('')}</select><select id="invStatus"><option value="active">Activos</option><option value="low">Stock bajo</option><option value="inactive">Dados de baja</option><option value="all">Todos</option></select></div>
      <div class="table-wrap"><table class="table inventory-table"><thead><tr><th>Artículo</th><th>Categoría</th><th>Compra</th><th>Costo unitario</th><th>Stock</th><th>Mínimo</th><th>Proveedor</th><th>Marca</th><th>Acciones</th></tr></thead><tbody id="invBody">${state.inventory.map(i=>`<tr data-inv-row data-active="${i.active!==false?'1':'0'}" data-low="${Number(i.stock)<=Number(i.stockMin||0)?'1':'0'}" data-cat="${esc(i.category||'')}" data-search="${esc((i.name+' '+(i.supplier||'')+' '+(i.brand||'')).toLowerCase())}"><td><b>${esc(i.name)}</b>${i.active===false?'<div class="hint">Dado de baja</div>':''}</td><td>${esc(i.category||'')}</td><td>${money(i.purchaseCost||0)} / ${esc(i.purchaseUnit||i.unit)}<div class="hint">${Number(i.purchaseContent||1)} ${esc(i.useUnit||i.unit)}</div></td><td><b>${money(i.cost||0)}</b><div class="hint">por ${esc(i.useUnit||i.unit)}</div></td><td><span class="stock-pill ${Number(i.stock)<=Number(i.stockMin||0)?'low':'ok'}">${Number(i.stock).toFixed(2)} ${esc(i.useUnit||i.unit)}</span></td><td>${Number(i.stockMin||0).toFixed(2)} ${esc(i.useUnit||i.unit)}</td><td>${esc(i.supplier||'—')}</td><td>${esc(i.brand||'General')}</td><td><div class="inventory-actions"><button class="secondary" onclick="openInventoryItem('${i.id}')">Editar</button><button class="secondary" onclick="adjustInventory('${i.id}')">Ajustar stock</button><button class="ghost" onclick="inventoryMovements('${i.id}')">Movimientos</button><button class="${i.active!==false?'danger':'secondary'}" onclick="toggleInventory('${i.id}')">${i.active!==false?'Dar de baja':'Reactivar'}</button><button class="danger" onclick="deleteInventory('${i.id}')">Eliminar</button></div></td></tr>`).join('')}</tbody></table></div>`;
    const search=$('#invSearch'),cat=$('#invCategory'),status=$('#invStatus');
    function filter(){const q=search.value.toLowerCase(),c=cat.value,s=status.value;$$('[data-inv-row]').forEach(r=>{const okQ=r.dataset.search.includes(q),okC=!c||r.dataset.cat===c,okS=s==='all'||(s==='active'&&r.dataset.active==='1')||(s==='inactive'&&r.dataset.active==='0')||(s==='low'&&r.dataset.active==='1'&&r.dataset.low==='1');r.style.display=okQ&&okC&&okS?'':'none'})}
    search.oninput=filter;cat.onchange=filter;status.onchange=filter;
  };
})();