(function(){
  function pid(){return 'po'+Date.now()+Math.random().toString(36).slice(2,6)}
  function nowText(){return new Date().toLocaleString('es-MX')}
  function ensurePurchases(){if(!Array.isArray(state.purchaseOrders))state.purchaseOrders=[];save()}
  ensurePurchases();

  function requirementsOf(m){return Array.isArray(m?.requirements)?m.requirements:(m?.components||[]).map(c=>({kind:c.kind,qty:Number(c.qty)||0}))}
  function quoteForOrder(o){return state.quotes.find(q=>q.id===o.quoteId)}
  function addMat(map,item,qty){if(!item||!qty)return;const cur=map.get(item.id)||{inventoryId:item.id,name:item.name,unit:item.useUnit||item.unit,qty:0,cost:Number(item.cost)||0};cur.qty+=Number(qty)||0;map.set(item.id,cur)}
  function explodeRecipe(recipe,mult,map,stack=[]){if(!recipe||stack.includes(recipe.id))return;(recipe.components||[]).forEach(c=>{if(c.type==='recipe')explodeRecipe(getRecipe(c.refId),(Number(c.qty)||0)*mult,map,[...stack,recipe.id]);else addMat(map,state.inventory.find(i=>i.id===c.refId),(Number(c.qty)||0)*mult)})}
  function orderMaterials(o){const q=quoteForOrder(o),m=getMeasure(q?.measureId),map=new Map();if(!q)return[];requirementsOf(m).forEach(r=>{const rec=getRecipe(q.selections?.[r.kind]);if(rec)explodeRecipe(rec,Number(r.qty)||0,map)});(q.packages||[]).forEach(p=>addMat(map,state.inventory.find(i=>i.id===p.inventoryId),Number(p.qty)||0));return [...map.values()]}
  function shortages(){
    const needs=new Map();
    (state.orders||[]).filter(o=>!['Entregado y pagado','Cancelado'].includes(o.status)).forEach(o=>orderMaterials(o).forEach(x=>{const c=needs.get(x.inventoryId)||{inventoryId:x.inventoryId,name:x.name,unit:x.unit,need:0,cost:x.cost};c.need+=x.qty;needs.set(x.inventoryId,c)}));
    const openCommit=new Map();
    state.purchaseOrders.filter(p=>!['Recibida','Cancelada'].includes(p.status)).forEach(p=>(p.lines||[]).forEach(l=>openCommit.set(l.inventoryId,(openCommit.get(l.inventoryId)||0)+(Number(l.qty)||0))));\n    (state.inventory||[]).filter(i=>i&&i.active!==false&&Number(i.stockMin)>0&&Number(i.stock)<Number(i.stockMin)).forEach(i=>{if(!needs.has(i.id))needs.set(i.id,{inventoryId:i.id,name:i.name,unit:i.useUnit||i.unit,need:0,cost:Number(i.cost)||0})});
    return [...needs.values()].map(x=>{const inv=state.inventory.find(i=>i.id===x.inventoryId),stock=Number(inv?.stock)||0,ordered=openCommit.get(x.inventoryId)||0,target=Math.max(x.need,Number(inv?.stockMin)||0),raw=Math.max(0,target-stock),shortage=Math.max(0,raw-ordered);return {...x,stock,ordered,target,shortage,buyCost:shortage*(Number(x.cost)||0),supplier:inv?.supplier||''}}).filter(x=>x.shortage>0)
  }

  function openPurchase(id=null,seedLines=null){
    ensurePurchases();
    const po=id?state.purchaseOrders.find(x=>x.id===id):{folio:'COM-'+String(Math.floor(10000+Math.random()*89999)),supplier:'',status:'Borrador',date:new Date().toISOString().slice(0,10),notes:'',lines:seedLines||[]};
    let lines=JSON.parse(JSON.stringify(po.lines||[]));
    if(!lines.length&&seedLines)lines=JSON.parse(JSON.stringify(seedLines));
    const w=modal(id?'Editar compra':'Nueva compra',`
      <div class="form2">
        ${field('Folio de compra','pofolio',po.folio||'')}
        ${field('Proveedor','posupplier',po.supplier||'')}
        ${field('Fecha','podate',po.date||new Date().toISOString().slice(0,10),'date')}
        ${selectField('Estatus','postatus',[{value:'Borrador',label:'Borrador'},{value:'Ordenada',label:'Ordenada / enviada al proveedor'},{value:'Recibida',label:'Recibida'},{value:'Cancelada',label:'Cancelada'}],po.status||'Borrador')}
      </div>
      <div class="section"><div class="page-head" style="margin:0"><div><h3>Materiales</h3><div class="hint">Ajusta cantidad y costo antes de guardar.</div></div><button class="secondary" id="addPoLine">+ Agregar material</button></div><div id="poLines"></div></div>
      <div class="form2" style="margin-top:14px">${area('Notas','ponotes',po.notes||'')}<div class="purchase-total"><span>Total estimado</span><strong id="poTotal">$0</strong></div></div>
    `,wrap=>{
      sync();
      const status=wrap.querySelector('#postatus').value;
      if(!lines.length){toast('Agrega al menos un material');return false}
      const data={id:id||pid(),folio:wrap.querySelector('#pofolio').value.trim()||('COM-'+Date.now()),supplier:wrap.querySelector('#posupplier').value.trim(),date:wrap.querySelector('#podate').value,status,notes:wrap.querySelector('#ponotes').value.trim(),lines:lines.map(l=>({...l,qty:Number(l.qty)||0,unitCost:Number(l.unitCost)||0})),createdAt:po.createdAt||new Date().toISOString()};
      if(id)Object.assign(po,data);else state.purchaseOrders.unshift(data);
      save();show('purchases');toast('Compra guardada');
    });
    function sync(){w.querySelectorAll('[data-pol]').forEach(row=>{const i=Number(row.dataset.pol);lines[i]={inventoryId:row.querySelector('[data-item]').value,qty:Number(row.querySelector('[data-qty]').value)||0,unitCost:Number(row.querySelector('[data-cost]').value)||0};});total()}
    function draw(){w.querySelector('#poLines').innerHTML=lines.map((l,i)=>{const inv=state.inventory.find(x=>x.id===l.inventoryId);return `<div class="purchase-line" data-pol="${i}"><select data-item>${state.inventory.filter(x=>x.active!==false).map(x=>`<option value="${x.id}" ${x.id===l.inventoryId?'selected':''}>${esc(x.name)} · ${esc(x.useUnit||x.unit)}</option>`).join('')}</select><input data-qty type="number" step="0.01" min="0" value="${Number(l.qty)||0}" title="Cantidad"><input data-cost type="number" step="0.0001" min="0" value="${Number(l.unitCost ?? inv?.cost)||0}" title="Costo unitario"><button class="icon" data-rm="${i}">×</button></div>`}).join('')||'<div class="helper">Sin materiales.</div>';w.querySelectorAll('[data-item],[data-qty],[data-cost]').forEach(el=>el.oninput=sync);w.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{sync();lines.splice(Number(b.dataset.rm),1);draw()});total()}
    function total(){const t=lines.reduce((s,l)=>s+(Number(l.qty)||0)*(Number(l.unitCost)||0),0);const el=w.querySelector('#poTotal');if(el)el.textContent=money(t)}
    w.querySelector('#addPoLine').onclick=()=>{sync();const inv=state.inventory.find(x=>x.active!==false);if(inv)lines.push({inventoryId:inv.id,qty:1,unitCost:Number(inv.cost)||0});draw()};
    draw();
  }
  window.openPurchase=openPurchase;

  function createPurchaseFromShortages(){const rows=shortages();if(!rows.length){toast('No hay faltantes pendientes');return}openPurchase(null,rows.map(x=>({inventoryId:x.inventoryId,qty:x.shortage,unitCost:Number(x.cost)||0})))}
  window.createPurchaseFromShortages=createPurchaseFromShortages;

  function receivePurchase(id){
    const po=state.purchaseOrders.find(x=>x.id===id);if(!po||po.status==='Recibida')return;if(!confirm('¿Recibir esta compra? El material entrará al inventario.'))return;
    (po.lines||[]).forEach(l=>{const inv=state.inventory.find(x=>x.id===l.inventoryId);if(!inv)return;const qty=Number(l.qty)||0;inv.stock=(Number(inv.stock)||0)+qty;inv.movements=inv.movements||[];inv.movements.unshift({date:nowText(),type:'Entrada compra',qty,balance:inv.stock,note:po.folio+' · '+(po.supplier||'Proveedor')});if(Number(l.unitCost)>0){inv.cost=Number(l.unitCost);inv.purchaseCost=(Number(inv.purchaseContent)||1)*inv.cost}});
    po.status='Recibida';po.receivedAt=new Date().toISOString();save();show('purchases');toast('Compra recibida e inventario actualizado');
  }
  function cancelPurchase(id){const po=state.purchaseOrders.find(x=>x.id===id);if(!po||po.status==='Recibida')return;if(confirm('¿Cancelar esta compra?')){po.status='Cancelada';save();show('purchases')}}
  window.receivePurchase=receivePurchase;window.cancelPurchase=cancelPurchase;

  views.purchases=function(){
    ensurePurchases();const rows=shortages(),orders=state.purchaseOrders;titleEl.textContent='Compras';const open=orders.filter(x=>!['Recibida','Cancelada'].includes(x.status));const received=orders.filter(x=>x.status==='Recibida');
    content.innerHTML=pageHead('Compras','Convierte faltantes en compras reales y recibe el material directamente al inventario.',`<div class="row-actions"><button class="secondary" onclick="openPurchase()">+ Compra manual</button><button class="primary" onclick="createPurchaseFromShortages()">Generar compra de faltantes</button></div>`)+`
      <div class="grid4"><div class="card kpi"><small>Faltantes pendientes</small><strong>${rows.length}</strong></div><div class="card kpi"><small>Compras abiertas</small><strong>${open.length}</strong></div><div class="card kpi"><small>Por comprar</small><strong>${money(rows.reduce((s,x)=>s+x.buyCost,0))}</strong></div><div class="card kpi"><small>Compras recibidas</small><strong>${received.length}</strong></div></div>
      <div class="section"><div class="page-head" style="margin:0 0 10px"><div><h3>Faltantes sugeridos</h3><div class="hint">Necesidades de pedidos activos menos stock disponible y compras ya abiertas.</div></div></div><div class="table-wrap"><table class="table purchase-table"><thead><tr><th>Material</th><th>Necesario</th><th>Stock</th><th>Ya pedido</th><th>Falta comprar</th><th>Proveedor sugerido</th><th>Costo aprox.</th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${x.need.toFixed(2)} ${esc(x.unit)}</td><td>${x.stock.toFixed(2)} ${esc(x.unit)}</td><td>${x.ordered.toFixed(2)} ${esc(x.unit)}</td><td class="shortage"><b>${x.shortage.toFixed(2)} ${esc(x.unit)}</b></td><td>${esc(x.supplier||'—')}</td><td>${money(x.buyCost)}</td></tr>`).join('')||'<tr><td colspan="7"><div class="empty">No hay faltantes pendientes.</div></td></tr>'}</tbody></table></div></div>
      <div class="section"><div class="page-head" style="margin:0 0 10px"><div><h3>Compras generadas</h3><div class="hint">Da seguimiento desde borrador hasta recepción.</div></div></div>${orders.map(po=>{const total=(po.lines||[]).reduce((s,l)=>s+(Number(l.qty)||0)*(Number(l.unitCost)||0),0);return `<div class="purchase-card"><div><h3>${esc(po.folio)}</h3><div class="muted">${esc(po.supplier||'Sin proveedor')} · ${esc(po.date||'')}</div><div class="usage"><span>${po.lines.length} material(es)</span><span>${money(total)}</span><span class="badge ${po.status==='Recibida'?'ok':po.status==='Cancelada'?'off':'warn'}">${esc(po.status)}</span></div></div><div class="row-actions"><button class="secondary" onclick="openPurchase('${po.id}')">Editar</button>${!['Recibida','Cancelada'].includes(po.status)?`<button class="primary" onclick="receivePurchase('${po.id}')">Recibir material</button><button class="danger" onclick="cancelPurchase('${po.id}')">Cancelar</button>`:''}</div></div>`}).join('')||'<div class="helper">Aún no has generado compras.</div>'}</div>`;
  };
})();