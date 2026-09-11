(function(){
  function xid(){return 'x'+Date.now()+Math.random().toString(36).slice(2,6)}
  function ensureExtras(){
    if(!Array.isArray(state.extras)) state.extras=[];
    const key=e=>(e.name||'').trim().toLowerCase();
    state.products.forEach(p=>{
      if(!Array.isArray(p.extraIds)) p.extraIds=[];
      (p.extras||[]).forEach(e=>{
        let found=state.extras.find(x=>key(x)===key(e));
        if(!found){found={id:xid(),name:e.name||'Extra',category:'General',mode:e.mode||'fixed',price:Number(e.price)||0,active:true};state.extras.push(found)}
        if(!p.extraIds.includes(found.id))p.extraIds.push(found.id);
      });
    });
    syncAllProducts();
    save();
  }
  function syncProduct(p){
    p.extras=(p.extraIds||[]).map(id=>state.extras.find(x=>x.id===id)).filter(x=>x&&x.active).map(x=>({id:x.id,name:x.name,mode:x.mode,price:Number(x.price)||0,category:x.category||'General'}));
  }
  function syncAllProducts(){state.products.forEach(syncProduct)}
  ensureExtras();

  function openExtra(id=null){
    const e=id?state.extras.find(x=>x.id===id):{name:'',category:'General',mode:'fixed',price:0,active:true};
    const w=modal(id?'Editar extra':'Nuevo extra',`
      <div class="form2">
        ${field('Nombre del extra','xname',e.name||'')}
        ${field('Categoría','xcat',e.category||'General')}
        ${selectField('Tipo de cobro','xmode',[{value:'fixed',label:'Precio fijo'},{value:'free',label:'Precio libre al cotizar'}],e.mode||'fixed')}
        ${field('Precio predeterminado (MXN)','xprice',e.price||0,'number')}
        <label class="field">Estado<select id="xactive"><option value="1" ${e.active!==false?'selected':''}>Activo</option><option value="0" ${e.active===false?'selected':''}>Inactivo</option></select></label>
      </div>
      <div class="helper"><b>Catálogo general:</b> crea el extra una sola vez y luego asígnalo a uno o varios productos. Si cambias su precio aquí, se actualiza en los productos donde aplica.</div>
    `,wrap=>{
      const name=wrap.querySelector('#xname').value.trim();
      if(!name){toast('Escribe el nombre del extra');return false}
      const data={id:id||xid(),name,category:wrap.querySelector('#xcat').value.trim()||'General',mode:wrap.querySelector('#xmode').value,price:Number(wrap.querySelector('#xprice').value)||0,active:wrap.querySelector('#xactive').value==='1'};
      if(id)Object.assign(e,data);else state.extras.push(data);
      syncAllProducts();save();show('extras');toast('Extra guardado');
    });
  }
  function deleteExtra(id){
    if(!confirm('¿Eliminar este extra del catálogo? También dejará de aparecer en los productos que lo usan.'))return;
    state.extras=state.extras.filter(x=>x.id!==id);
    state.products.forEach(p=>p.extraIds=(p.extraIds||[]).filter(x=>x!==id));
    syncAllProducts();save();show('extras');
  }
  window.openExtra=openExtra;window.deleteExtra=deleteExtra;

  views.extras=function(){
    titleEl.textContent='Extras';
    content.innerHTML=pageHead('Extras','Catálogo general de extras. Créalo una vez y úsalo en distintos productos.',`<button class="primary" onclick="openExtra()">+ Nuevo extra</button>`)+`
      <div class="helper"><b>Cómo funciona:</b> aquí administras todos los extras del negocio. Después, en cada producto, solo marcas cuáles aplican.</div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Extra</th><th>Categoría</th><th>Tipo</th><th>Precio</th><th>Productos</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
      ${state.extras.map(e=>{const ps=state.products.filter(p=>(p.extraIds||[]).includes(e.id));return `<tr><td><b>${esc(e.name)}</b></td><td>${esc(e.category||'General')}</td><td>${e.mode==='fixed'?'Precio fijo':'Precio libre'}</td><td>${e.mode==='fixed'?money(e.price):'Al cotizar'}</td><td>${ps.length?ps.map(p=>esc(p.name)).join(', '):'<span class="muted">Sin asignar</span>'}</td><td><span class="badge ${e.active!==false?'ok':'off'}">${e.active!==false?'Activo':'Inactivo'}</span></td><td><div class="row-actions"><button class="secondary" onclick="openExtra('${e.id}')">Editar</button><button class="danger" onclick="deleteExtra('${e.id}')">Eliminar</button></div></td></tr>`}).join('')||'<tr><td colspan="7"><div class="empty">Aún no hay extras.</div></td></tr>'}
      </tbody></table></div>`;
  };

  openProduct=function(id=null){
    const p=id?getProduct(id):{name:'',category:'Otro',pricing:'recipe',margin:50,active:true,price:0,extraIds:[]};
    const selected=new Set(p.extraIds||[]);
    const w=modal(id?'Editar producto':'Agregar producto',`
      <div class="form2">
        ${field('Nombre del producto','pname',p.name||'')}
        ${field('Categoría','pcat',p.category||'Otro')}
        ${selectField('Forma de precio','ppricing',[{value:'recipe',label:'Calculado por recetas/presentación'},{value:'fixed',label:'Precio fijo'}],p.pricing||'recipe')}
        ${field('Precio fijo (si aplica)','pprice',p.price||0,'number')}
        ${field('Margen objetivo %','pmargin',p.margin||50,'number')}
        <label class="field">Estado<select id="pactive"><option value="1" ${p.active!==false?'selected':''}>Activo</option><option value="0" ${p.active===false?'selected':''}>Inactivo</option></select></label>
      </div>
      <div class="section"><div class="page-head" style="margin:0"><div><h3>Extras disponibles para este producto</h3><div class="hint">Marca únicamente los extras que quieres mostrar cuando se cotice este producto.</div></div><button class="secondary" type="button" onclick="show('extras');document.querySelector('.modal-bg')?.remove()">Administrar catálogo</button></div>
      <div class="checks" style="margin-top:10px">${state.extras.filter(e=>e.active!==false).map(e=>`<label class="checkcard"><input type="checkbox" data-extra-id="${e.id}" ${selected.has(e.id)?'checked':''}> <span><b>${esc(e.name)}</b><small class="muted" style="display:block">${e.mode==='fixed'?money(e.price):'Precio libre'}</small></span></label>`).join('')||'<div class="helper">No hay extras activos. Créelos primero en el módulo Extras.</div>'}</div></div>
    `,wrap=>{
      const data={id:id||'p'+Date.now(),name:wrap.querySelector('#pname').value.trim(),category:wrap.querySelector('#pcat').value.trim()||'Otro',pricing:wrap.querySelector('#ppricing').value,price:Number(wrap.querySelector('#pprice').value)||0,margin:Number(wrap.querySelector('#pmargin').value)||50,active:wrap.querySelector('#pactive').value==='1',extraIds:[...wrap.querySelectorAll('[data-extra-id]:checked')].map(x=>x.dataset.extraId)};
      if(!data.name){toast('Escribe el nombre del producto');return false}
      if(id)Object.assign(p,data);else state.products.push(data);
      syncProduct(id?p:data);save();show('products');toast('Producto guardado');
    });
  };
  window.openProduct=openProduct;

  const oldProducts=views.products;
  views.products=function(){
    oldProducts();
    document.querySelectorAll('.product-card').forEach((card,i)=>{
      const p=state.products[i];if(!p)return;
      const hint=card.querySelector('.hint');
      if(hint)hint.textContent=`Presentaciones: ${state.measures.filter(m=>m.productId===p.id).length} · Extras: ${(p.extraIds||[]).length}`;
    });
  };
})();