(function(){
  const qFor=o=>(state.quotes||[]).find(q=>q.id===o.quoteId);
  const escSafe=v=>typeof esc==='function'?esc(v):String(v??'');
  const moneySafe=n=>typeof money==='function'?money(Number(n)||0):'$'+(Number(n)||0).toFixed(2);
  let weekStart='';

  function iso(d){return new Date(d).toISOString().slice(0,10)}
  function mondayOf(v){const d=v?new Date(v+'T12:00:00'):new Date();const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return iso(d)}
  function addDays(v,n){const d=new Date(v+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}
  function fmt(v){return new Date(v+'T12:00:00').toLocaleDateString('es-MX',{day:'2-digit',month:'short'})}
  function ensureWeek(){if(!weekStart)weekStart=mondayOf(new Date().toISOString().slice(0,10))}
  function materialsFor(q){try{return typeof window.denyaMaterialsV41==='function'?(window.denyaMaterialsV41(q)||[]):[]}catch(e){return[]}}
  function inventoryItem(id,name){return (state.inventory||[]).find(i=>i.id===id)|| (state.inventory||[]).find(i=>i.name===name)}
  function supplierOf(i){return i?.supplier||i?.provider||i?.vendor||'Sin proveedor'}

  function weeklyPendingOrders(){
    ensureWeek();const end=addDays(weekStart,6);
    return (state.orders||[]).filter(o=>{const q=qFor(o);return o.status==='Pendiente'&&q?.event&&q.event>=weekStart&&q.event<=end});
  }
  function rows(){
    const map=new Map();
    weeklyPendingOrders().forEach(o=>{
      const q=qFor(o);materialsFor(q).forEach(x=>{
        const key=x.inventoryId||x.id||x.name;if(!key)return;
        const inv=inventoryItem(x.inventoryId||x.id,x.name);
        const cur=map.get(key)||{key,inventoryId:inv?.id||x.inventoryId||x.id,name:x.name||inv?.name||'Material',unit:x.unit||inv?.useUnit||inv?.unit||'',need:0,cost:Number(inv?.cost)||Number(x.cost)||0,orderIds:new Set(),folios:new Set(),supplier:supplierOf(inv)};
        cur.need+=Number(x.qty??x.need)||0;cur.orderIds.add(o.id);if(q?.folio)cur.folios.add(q.folio);map.set(key,cur);
      });
    });
    return [...map.values()].map(r=>{const inv=inventoryItem(r.inventoryId,r.name),stock=Number(inv?.stock)||0,shortage=Math.max(0,r.need-stock);return {...r,stock,shortage,buyCost:shortage*r.cost,orderIds:[...r.orderIds],folios:[...r.folios]}}).filter(r=>r.shortage>0).sort((a,b)=>a.supplier.localeCompare(b.supplier)||a.name.localeCompare(b.name));
  }
  function movement(inv,qty,note){inv.movements=Array.isArray(inv.movements)?inv.movements:[];inv.movements.unshift({date:new Date().toLocaleString('es-MX'),type:'Entrada compra',qty,balance:Number(inv.stock)||0,note})}
  function registerReceipt(row,qty){
    const inv=inventoryItem(row.inventoryId,row.name);if(!inv){toast('No encontré este artículo en inventario');return false}
    qty=Number(qty)||0;if(qty<=0)return false;
    inv.stock=(Number(inv.stock)||0)+qty;movement(inv,qty,'Compra automática · semana '+weekStart);
    state.autoPurchaseReceipts=Array.isArray(state.autoPurchaseReceipts)?state.autoPurchaseReceipts:[];
    state.autoPurchaseReceipts.unshift({id:'apr'+Date.now()+Math.random().toString(36).slice(2,5),inventoryId:inv.id,name:inv.name,qty,unit:row.unit,cost:row.cost,total:qty*row.cost,supplier:row.supplier,weekStart,orderIds:row.orderIds,date:new Date().toISOString()});
    save();return true;
  }
  window.receiveAutoPurchaseV52=function(key){const row=rows().find(r=>String(r.key)===String(key));if(!row)return;const value=prompt(`Cantidad recibida de ${row.name} (${row.unit})`,String(Number(row.shortage.toFixed(3))));if(value===null)return;if(registerReceipt(row,value)){toast('Compra recibida e inventario actualizado');render()}};
  window.receiveAllAutoPurchasesV52=function(){const list=rows();if(!list.length){toast('No hay faltantes esta semana');return}if(!confirm(`¿Registrar como recibidos todos los faltantes de esta semana (${list.length} artículos)?`))return;list.forEach(r=>registerReceipt(r,r.shortage));toast('Faltantes recibidos e inventario actualizado');render()};
  window.shiftAutoPurchaseWeekV52=function(n){ensureWeek();weekStart=addDays(weekStart,n*7);render()};
  window.currentAutoPurchaseWeekV52=function(){weekStart=mondayOf(new Date().toISOString().slice(0,10));render()};
  window.openAutoPurchasesV52=function(){ensureWeek();render()};

  function ensureStyle(){if(document.getElementById('v52auto'))return;const s=document.createElement('style');s.id='v52auto';s.textContent=`
    .v52-top{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin:12px 0}.v52-nav{display:flex;gap:8px;align-items:center}.v52-nav b{min-width:180px;text-align:center}.v52-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}.v52-kpi{background:#fff;border:1px solid #eadfd4;border-radius:15px;padding:14px}.v52-kpi small{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#9a7850}.v52-kpi strong{display:block;font-size:23px;margin-top:5px}.v52-supplier{display:inline-flex;padding:5px 8px;border-radius:999px;background:#f2ece7;font-size:10px;font-weight:800}.v52-orders{font-size:11px;color:#8c7a6e;max-width:220px}.v52-history{margin-top:16px}.v52-history .table td{vertical-align:middle}@media(max-width:800px){.v52-kpis{grid-template-columns:1fr 1fr}}@media(max-width:520px){.v52-kpis{grid-template-columns:1fr}.v52-nav{flex-wrap:wrap}}
  `;document.head.appendChild(s)}

  function render(){
    ensureWeek();ensureStyle();const list=rows(),orders=weeklyPendingOrders(),total=list.reduce((s,r)=>s+r.buyCost,0),providers=new Set(list.map(r=>r.supplier)),end=addDays(weekStart,6),receipts=(state.autoPurchaseReceipts||[]).filter(r=>r.weekStart===weekStart);
    titleEl.textContent='Inventario y compras';
    content.innerHTML=pageHead('Compras automáticas','DENYA calcula lo que falta comprar a partir de los pedidos pendientes de la semana y el inventario disponible.',`<button class="secondary" onclick="show('inventory')">Volver a inventario</button>`)+`
      <div class="v52-top"><div class="v52-nav"><button class="secondary" onclick="shiftAutoPurchaseWeekV52(-1)">←</button><b>${escSafe(fmt(weekStart))} – ${escSafe(fmt(end))}</b><button class="secondary" onclick="shiftAutoPurchaseWeekV52(1)">→</button><button class="secondary" onclick="currentAutoPurchaseWeekV52()">Esta semana</button></div><button class="primary" onclick="receiveAllAutoPurchasesV52()" ${list.length?'':'disabled'}>Recibir todos los faltantes</button></div>
      <div class="v52-kpis"><div class="v52-kpi"><small>Pedidos pendientes</small><strong>${orders.length}</strong></div><div class="v52-kpi"><small>Artículos por comprar</small><strong>${list.length}</strong></div><div class="v52-kpi"><small>Proveedores</small><strong>${providers.size}</strong></div><div class="v52-kpi"><small>Compra estimada</small><strong>${moneySafe(total)}</strong></div></div>
      <div class="helper"><b>Cálculo automático:</b> suma los insumos de pedidos todavía en Pendiente, resta el stock actual y muestra únicamente el faltante. Los pedidos que ya iniciaron producción no se vuelven a contar porque su inventario ya fue descontado.</div>
      <div class="table-wrap" style="margin-top:12px"><table class="table"><thead><tr><th>Artículo</th><th>Proveedor</th><th>Necesario</th><th>Disponible</th><th>Comprar</th><th>Costo estimado</th><th>Pedidos</th><th></th></tr></thead><tbody>${list.map(r=>`<tr><td><b>${escSafe(r.name)}</b></td><td><span class="v52-supplier">${escSafe(r.supplier)}</span></td><td>${r.need.toFixed(2)} ${escSafe(r.unit)}</td><td>${r.stock.toFixed(2)} ${escSafe(r.unit)}</td><td class="shortage"><b>${r.shortage.toFixed(2)} ${escSafe(r.unit)}</b></td><td>${moneySafe(r.buyCost)}</td><td><div class="v52-orders">${r.folios.map(escSafe).join(', ')||'—'}</div></td><td><button class="primary" onclick="receiveAutoPurchaseV52('${escSafe(String(r.key))}')">Recibir</button></td></tr>`).join('')||'<tr><td colspan="8"><div class="empty">No hay faltantes para comprar en esta semana.</div></td></tr>'}</tbody></table></div>
      <div class="v52-history"><div class="page-head" style="margin-bottom:8px"><div><h2 style="margin:0">Recepciones de la semana</h2><div class="muted">Cada recepción actualiza el inventario y deja registro.</div></div></div><div class="table-wrap"><table class="table"><thead><tr><th>Fecha</th><th>Artículo</th><th>Proveedor</th><th>Cantidad</th><th>Total estimado</th></tr></thead><tbody>${receipts.map(r=>`<tr><td>${new Date(r.date).toLocaleString('es-MX')}</td><td><b>${escSafe(r.name)}</b></td><td>${escSafe(r.supplier||'Sin proveedor')}</td><td>${Number(r.qty||0).toFixed(2)} ${escSafe(r.unit||'')}</td><td>${moneySafe(r.total||0)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="empty">Todavía no hay recepciones registradas esta semana.</div></td></tr>'}</tbody></table></div></div>`;
  }

  const baseInventory=views.inventory;
  views.inventory=function(){const r=baseInventory&&baseInventory();const h=content.querySelector('.page-head');if(h&&!content.querySelector('[data-v52auto]'))h.insertAdjacentHTML('beforeend','<button class="secondary" data-v52auto onclick="openAutoPurchasesV52()">Compras automáticas</button>');return r};

  const baseOrders=views.orders;
  views.orders=function(){const r=baseOrders&&baseOrders();if(content.querySelector('.v51-days')){const head=content.querySelector('.page-head');if(head&&!content.querySelector('[data-v52plan]'))head.insertAdjacentHTML('beforeend','<button class="secondary" data-v52plan onclick="openAutoPurchasesV52()">Ver compras automáticas</button>')}return r};
})();