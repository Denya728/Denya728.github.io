(function(){
  function requirementsOf(m){return Array.isArray(m?.requirements)?m.requirements:(m?.components||[]).map(c=>({kind:c.kind,qty:Number(c.qty)||0}))}
  function kindLabel(k){return {base:'Base / pan',filling:'Relleno',cover:'Cobertura / betún',syrup:'Jarabe / salsa',decoration:'Decoración / preparación'}[k]||k}
  function ensureOps(){
    if(!Array.isArray(state.orders)) state.orders=[];
    state.quotes.forEach(q=>{
      let o=state.orders.find(x=>x.quoteId===q.id);
      if(['Aceptada','Entregada y pagada'].includes(q.status)&&!o){o={id:'o'+Date.now()+Math.random().toString(36).slice(2,5),quoteId:q.id,status:q.status==='Entregada y pagada'?'Entregado y pagado':'Pendiente',inventoryApplied:false,createdAt:new Date().toISOString()};state.orders.push(o)}
      if(o&&q.status==='Entregada y pagada')o.status='Entregado y pagado';
      if(o&&q.status==='Cancelada')o.status='Cancelado';
    });
    save();
  }
  function quoteForOrder(o){return state.quotes.find(q=>q.id===o.quoteId)}
  function addMaterial(map,item,qty){if(!item||!qty)return;const cur=map.get(item.id)||{inventoryId:item.id,name:item.name,unit:item.unit,qty:0,cost:Number(item.cost)||0};cur.qty+=Number(qty)||0;map.set(item.id,cur)}
  function explodeRecipe(recipe,multiplier,map,stack=[]){
    if(!recipe||stack.includes(recipe.id))return;
    (recipe.components||[]).forEach(c=>{
      if(c.type==='recipe') explodeRecipe(getRecipe(c.refId),(Number(c.qty)||0)*multiplier,map,[...stack,recipe.id]);
      else addMaterial(map,state.inventory.find(i=>i.id===c.refId), (Number(c.qty)||0)*multiplier);
    });
  }
  function orderMaterials(o){
    const q=quoteForOrder(o),m=getMeasure(q?.measureId),map=new Map();
    if(!q)return [];
    requirementsOf(m).forEach(r=>{const rid=q.selections?.[r.kind];const recipe=getRecipe(rid);if(recipe)explodeRecipe(recipe,Number(r.qty)||0,map)});
    (q.packages||[]).forEach(p=>addMaterial(map,state.inventory.find(i=>i.id===p.inventoryId),Number(p.qty)||0));
    return [...map.values()].map(x=>({...x,need:x.qty,stock:Number(state.inventory.find(i=>i.id===x.inventoryId)?.stock)||0,shortage:Math.max(0,x.qty-(Number(state.inventory.find(i=>i.id===x.inventoryId)?.stock)||0)),lineCost:x.qty*x.cost}));
  }
  function orderCost(o){return orderMaterials(o).reduce((s,x)=>s+x.lineCost,0)}
  function orderStatusClass(s){return s==='En producción'?'production':s==='Listo'?'ready':s==='Entregado y pagado'?'done':'pending'}
  function orderAction(id,act){
    ensureOps();const o=state.orders.find(x=>x.id===id),q=quoteForOrder(o);if(!o||!q)return;
    if(act==='materials'){showMaterials(id);return}
    if(act==='start'){
      if(orderMaterials(o).some(x=>x.shortage>0)&&!confirm('Hay faltantes de inventario. ¿Iniciar producción de todos modos?'))return;
      o.status='En producción';o.startedAt=new Date().toISOString();
    }
    if(act==='ready')o.status='Listo';
    if(act==='done'){o.status='Entregado y pagado';o.completedAt=new Date().toISOString();q.status='Entregada y pagada';q.balance=0;}
    if(act==='pending')o.status='Pendiente';
    save();show('orders');toast('Pedido actualizado');
  }
  window.orderAction=orderAction;
  function showMaterials(id){
    const o=state.orders.find(x=>x.id===id),q=quoteForOrder(o),mats=orderMaterials(o),cost=orderCost(o);
    modal('Lista de materiales',`<div class="helper"><b>${esc(q?.folio||'')}</b> · ${esc(q?.client||'')}<br>DENYA desglosa las recetas seleccionadas y las compara contra el inventario actual.</div><div class="section"><div class="material-row material-head"><span>Material</span><span>Necesario</span><span>Stock</span><span>Faltante</span><span>Costo</span></div>${mats.map(x=>`<div class="material-row"><b>${esc(x.name)}</b><span>${x.need.toFixed(2)} ${esc(x.unit)}</span><span>${x.stock.toFixed(2)} ${esc(x.unit)}</span><span class="${x.shortage>0?'shortage':'enough'}">${x.shortage>0?x.shortage.toFixed(2)+' '+esc(x.unit):'Completo'}</span><span>${money(x.lineCost)}</span></div>`).join('')||'<div class="empty">No hay materiales calculables.</div>'}</div><div class="right" style="margin-top:12px"><span class="muted">Costo de materiales estimado</span><div style="font-size:28px;font-weight:900">${money(cost)}</div></div>`,null,'',true)
  }
  window.showMaterials=showMaterials;
  function aggregateShortages(){
    ensureOps();const pending=state.orders.filter(o=>!['Entregado y pagado','Cancelado'].includes(o.status));const needs=new Map();
    pending.forEach(o=>orderMaterials(o).forEach(x=>{const cur=needs.get(x.inventoryId)||{inventoryId:x.inventoryId,name:x.name,unit:x.unit,need:0,cost:x.cost};cur.need+=x.need;needs.set(x.inventoryId,cur)}));
    return [...needs.values()].map(x=>{const inv=state.inventory.find(i=>i.id===x.inventoryId),stock=Number(inv?.stock)||0,shortage=Math.max(0,x.need-stock);return {...x,stock,shortage,buyCost:shortage*x.cost}}).filter(x=>x.shortage>0);
  }
  views.orders=function(){
    ensureOps();titleEl.textContent='Pedidos';
    const orders=state.orders.filter(o=>o.status!=='Cancelado').sort((a,b)=>String(quoteForOrder(a)?.event||'').localeCompare(String(quoteForOrder(b)?.event||'')));
    content.innerHTML=pageHead('Pedidos','Las cotizaciones aceptadas se convierten automáticamente en pedidos.',`<button class="secondary" onclick="show('quotations')">Ver cotizaciones</button>`)+`<div class="ops-flow"><div class="card"><b>1. Cotización aceptada</b><span>Se crea el pedido.</span></div><div class="card"><b>2. Pedido</b><span>Revisa fecha y materiales.</span></div><div class="card"><b>3. Producción</b><span>Inicia elaboración.</span></div><div class="card"><b>4. Listo</b><span>Preparado para entregar.</span></div><div class="card"><b>5. Entregado + pagado</b><span>Se convierte en venta.</span></div></div>${orders.map(o=>{const q=quoteForOrder(o),p=getProduct(q?.productId),m=getMeasure(q?.measureId),mats=orderMaterials(o),missing=mats.filter(x=>x.shortage>0).length;return `<div class="card order-card"><div class="order-head"><div><h3 style="margin:0">${esc(q?.folio||'')} · ${esc(q?.client||'')}</h3><div class="muted">${esc(p?.name||'')} · ${esc(m?.name||'')} · Evento ${esc(q?.event||'Sin fecha')}</div><div class="order-meta"><span class="order-status ${orderStatusClass(o.status)}">${esc(o.status)}</span><span class="badge ${missing?'warn':'ok'}">${missing?missing+' faltante(s)':'Material completo'}</span><span class="badge">Venta ${money(q?.total||0)}</span></div></div><div class="ops-actions"><button class="secondary" onclick="orderAction('${o.id}','materials')">Lista de materiales</button>${o.status==='Pendiente'?`<button class="primary" onclick="orderAction('${o.id}','start')">Iniciar producción</button>`:''}${o.status==='En producción'?`<button class="primary" onclick="orderAction('${o.id}','ready')">Marcar listo</button>`:''}${o.status==='Listo'?`<button class="primary" onclick="orderAction('${o.id}','done')">Entregado y pagado</button>`:''}</div></div></div>`}).join('')||'<div class="card empty">Acepta una cotización para crear tu primer pedido.</div>'}`;
  };
  views.production=function(){
    ensureOps();titleEl.textContent='Producción';const orders=state.orders.filter(o=>['Pendiente','En producción','Listo'].includes(o.status));
    content.innerHTML=pageHead('Producción','Aquí ves qué producir, las recetas elegidas y si faltan materiales.',`<button class="secondary" onclick="show('orders')">Ver pedidos</button>`)+`<div class="grid2">${orders.map(o=>{const q=quoteForOrder(o),p=getProduct(q?.productId),m=getMeasure(q?.measureId),reqs=requirementsOf(m);return `<div class="card"><div class="order-head"><div><h3 style="margin:0">${esc(q?.folio||'')} · ${esc(p?.name||'')}</h3><div class="muted">${esc(q?.client||'')} · ${esc(q?.event||'')}</div></div><span class="order-status ${orderStatusClass(o.status)}">${esc(o.status)}</span></div><div class="usage">${reqs.map(r=>{const rec=getRecipe(q?.selections?.[r.kind]);return `<span>${esc(kindLabel(r.kind))}: ${r.qty} receta · ${esc(rec?.name||'Sin seleccionar')}</span>`}).join('')}</div><div class="ops-actions" style="margin-top:14px"><button class="secondary" onclick="showMaterials('${o.id}')">Lista de materiales</button>${o.status==='Pendiente'?`<button class="primary" onclick="orderAction('${o.id}','start');show('production')">Producir</button>`:''}${o.status==='En producción'?`<button class="primary" onclick="orderAction('${o.id}','ready');show('production')">Listo</button>`:''}</div></div>`}).join('')||'<div class="card empty">No hay pedidos activos para producción.</div>'}</div>`;
  };
  views.purchases=function(){
    const rows=aggregateShortages();titleEl.textContent='Compras';
    content.innerHTML=pageHead('Compras','DENYA compara las necesidades de pedidos activos contra tu inventario.')+`<div class="grid4"><div class="card kpi"><small>Materiales faltantes</small><strong>${rows.length}</strong></div><div class="card kpi"><small>Compra estimada</small><strong>${money(rows.reduce((s,x)=>s+x.buyCost,0))}</strong></div><div class="card kpi"><small>Pedidos activos</small><strong>${state.orders.filter(o=>!['Entregado y pagado','Cancelado'].includes(o.status)).length}</strong></div><div class="card kpi"><small>Inventario</small><strong>${state.inventory.length}</strong></div></div><div class="table-wrap" style="margin-top:14px"><table class="table"><thead><tr><th>Material</th><th>Necesario</th><th>Disponible</th><th>Comprar</th><th>Costo estimado</th></tr></thead><tbody>${rows.map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${x.need.toFixed(2)} ${esc(x.unit)}</td><td>${x.stock.toFixed(2)} ${esc(x.unit)}</td><td class="shortage">${x.shortage.toFixed(2)} ${esc(x.unit)}</td><td>${money(x.buyCost)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="empty">No hay faltantes para los pedidos activos.</div></td></tr>'}</tbody></table></div>`;
  };
  const oldInventory=views.inventory;
  views.inventory=function(){oldInventory();const head=content.querySelector('.page-head');if(head)head.insertAdjacentHTML('beforeend','<button class="secondary" onclick="show(\'purchases\')">Ver faltantes / compras</button>')};
  views.finance=function(){
    ensureOps();titleEl.textContent='Finanzas';const closed=state.orders.filter(o=>o.status==='Entregado y pagado');const revenue=closed.reduce((s,o)=>s+(Number(quoteForOrder(o)?.total)||0),0),cost=closed.reduce((s,o)=>s+orderCost(o),0),profit=revenue-cost,margin=revenue?profit/revenue*100:0;
    content.innerHTML=pageHead('Finanzas','Las ventas entran aquí cuando el pedido queda entregado y pagado.')+`<div class="grid4"><div class="card kpi"><small>Ventas cerradas</small><strong>${money(revenue)}</strong></div><div class="card kpi"><small>Costo estimado</small><strong>${money(cost)}</strong></div><div class="card kpi"><small>Utilidad estimada</small><strong class="${profit>=0?'profit-pos':'profit-neg'}">${money(profit)}</strong></div><div class="card kpi"><small>Margen</small><strong>${margin.toFixed(1)}%</strong></div></div><div class="table-wrap" style="margin-top:14px"><table class="table"><thead><tr><th>Folio</th><th>Cliente</th><th>Venta</th><th>Costo</th><th>Utilidad</th><th>Margen</th></tr></thead><tbody>${closed.map(o=>{const q=quoteForOrder(o),c=orderCost(o),u=(Number(q?.total)||0)-c,mg=q?.total?u/q.total*100:0;return `<tr><td><b>${esc(q?.folio||'')}</b></td><td>${esc(q?.client||'')}</td><td>${money(q?.total||0)}</td><td>${money(c)}</td><td class="${u>=0?'profit-pos':'profit-neg'}">${money(u)}</td><td>${mg.toFixed(1)}%</td></tr>`}).join('')||'<tr><td colspan="6"><div class="empty">Todavía no hay ventas cerradas.</div></td></tr>'}</tbody></table></div>`;
  };
  const oldQuoteAction=window.quoteAction;
  window.quoteAction=function(id,act){if(oldQuoteAction)oldQuoteAction(id,act);ensureOps();save()};
  ensureOps();
})();