(function(){
  const rank={Emprende:1,Negocio:2,Pro:3};
  const currentPlan=()=>state.subscription?.plan||state.plan||'Negocio';
  const has=min=>(rank[currentPlan()]||1)>=rank[min];
  const ym=v=>String(v||'').slice(0,7);
  const today=()=>new Date().toISOString().slice(0,10);
  const todayYM=()=>today().slice(0,7);
  const monthName=v=>{const [y,m]=String(v||'').split('-').map(Number);return y&&m?new Date(y,m-1,1).toLocaleDateString('es-MX',{month:'long',year:'numeric'}):''};
  const qFor=o=>(state.quotes||[]).find(q=>q.id===o.quoteId);
  const oFor=q=>(state.orders||[]).find(o=>o.quoteId===q.id);
  const moneySafe=n=>typeof money==='function'?money(Number(n)||0):'$'+(Number(n)||0).toFixed(2);
  let opsTab='orders';

  function closedDate(o,q){return ym(o?.completedAt)||ym(q?.completedAt)||ym(q?.event)}
  function quoteCost(q){
    if(Number.isFinite(Number(q?.costEstimated)))return Number(q.costEstimated)||0;
    try{return typeof productMeasureCost==='function'?productMeasureCost(getMeasure(q?.measureId),q?.selections||{}):0}catch(e){return 0}
  }
  function ensureStyle(){
    if(document.getElementById('v42dash'))return;
    const s=document.createElement('style');s.id='v42dash';s.textContent=`
      .v42-period{display:flex;justify-content:space-between;gap:12px;align-items:end;background:#fff;border:1px solid #eadfd4;border-radius:16px;padding:14px 16px;margin-bottom:14px}.v42-period h3{margin:3px 0 0;text-transform:capitalize}.v42-period input{border:1px solid #ded3ca;border-radius:10px;padding:8px 10px;background:#fff}.v42-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.v42-kpi{background:#fff;border:1px solid #eadfd4;border-radius:16px;padding:16px}.v42-kpi small{font-size:10px;letter-spacing:1.2px;text-transform:uppercase;color:#9a7850}.v42-kpi strong{display:block;font-size:26px;margin:7px 0}.v42-grid{display:grid;grid-template-columns:1.4fr 1fr;gap:14px;margin-top:14px}.v42-card{background:#fff;border:1px solid #eadfd4;border-radius:16px;padding:16px}.v42-row{display:grid;grid-template-columns:78px 1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #eee5de}.v42-row:last-child{border-bottom:0}.v42-statuses{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v42-status{display:flex;justify-content:space-between;border:1px solid #eadfd4;border-radius:10px;padding:10px}.v42-tabs{display:flex;gap:8px;margin:0 0 14px}.v42-tabs button{border:1px solid #dccfc4;background:#fff;border-radius:12px;padding:9px 14px;font-weight:700}.v42-tabs button.active{background:#3a2d27;color:#fff;border-color:#3a2d27}.v42-tabs button:disabled{opacity:.45;cursor:not-allowed}@media(max-width:900px){.v42-kpis{grid-template-columns:1fr 1fr}.v42-grid{grid-template-columns:1fr}}@media(max-width:560px){.v42-kpis{grid-template-columns:1fr}.v42-row{grid-template-columns:65px 1fr}.v42-row> :last-child{grid-column:2}}
    `;document.head.appendChild(s);
  }

  function renderHome(period){
    ensureStyle();
    titleEl.textContent='Resumen';
    const chosen=period||state.reportPeriod||todayYM(); state.reportPeriod=chosen; save();
    const orders=state.orders||[],quotes=state.quotes||[];
    const closed=orders.filter(o=>o.status==='Entregado y pagado').map(o=>({o,q:qFor(o)})).filter(x=>x.q&&closedDate(x.o,x.q)===chosen);
    const active=orders.map(o=>({o,q:qFor(o)})).filter(x=>x.q&&!['Entregado y pagado','Cancelado'].includes(x.o.status));
    const upcoming=active.filter(x=>!x.q.event||x.q.event>=today()).sort((a,b)=>String(a.q.event||'').localeCompare(String(b.q.event||''))).slice(0,7);
    const revenue=closed.reduce((s,x)=>s+(Number(x.q.total)||0),0);
    const costs=closed.reduce((s,x)=>s+quoteCost(x.q),0);
    const profit=revenue-costs;
    const outstanding=active.reduce((s,x)=>s+(Number(x.q.balance)||0),0);
    const low=has('Negocio')?(state.inventory||[]).filter(i=>i.active!==false&&Number(i.stock)<=Number(i.stockMin??5)):[];
    const statuses={}; active.forEach(x=>statuses[x.o.status]=(statuses[x.o.status]||0)+1); closed.forEach(x=>statuses['Entregado y pagado']=(statuses['Entregado y pagado']||0)+1);
    const customer={};closed.forEach(({q})=>{const n=q.client||'Sin cliente';const c=customer[n]||(customer[n]={orders:0,total:0});c.orders++;c.total+=Number(q.total)||0});
    content.innerHTML=`
      <div class="v33-hero"><div><div class="v33-eyebrow">Operación del negocio</div><h2>Tu operación, clara y conectada.</h2><p>Este resumen toma los datos reales de Pedidos y usa la fecha en que se cerró la venta; si un pedido antiguo no tiene fecha de cierre, usa la fecha del evento.</p></div><button class="primary" onclick="newQuote()">Nueva cotización</button></div>
      <div class="v42-period"><div><small>Periodo del resumen</small><h3>${esc(monthName(chosen))}</h3></div><div><input id="v42period" type="month" value="${esc(chosen)}"> <button class="secondary" id="v42now">Mes actual</button></div></div>
      <div class="v42-kpis">
        <div class="v42-kpi"><small>Cobrado</small><strong>${moneySafe(revenue)}</strong><span>${closed.length} venta${closed.length===1?'':'s'} cerrada${closed.length===1?'':'s'}</span></div>
        <div class="v42-kpi"><small>Pedidos activos</small><strong>${active.length}</strong><span>Pendientes, producción o listos</span></div>
        <div class="v42-kpi"><small>Por cobrar</small><strong>${moneySafe(outstanding)}</strong><span>Saldo de pedidos activos</span></div>
        <div class="v42-kpi"><small>${has('Negocio')?'Alertas inventario':'Utilidad estimada'}</small><strong>${has('Negocio')?low.length:moneySafe(profit)}</strong><span>${has('Negocio')?'Materiales por reponer':'Ventas menos costo estimado'}</span></div>
      </div>
      <div class="v42-grid">
        <div class="v42-card"><div class="v33-eyebrow">Agenda operativa</div><h3>Próximos pedidos</h3>${upcoming.length?upcoming.map(({o,q})=>`<div class="v42-row"><b>${esc(q.event||'Sin fecha')}</b><div><b>${esc(q.client||'Cliente')}</b><div class="hint">${esc(getProduct(q.productId)?.name||'Pedido')} · ${esc(o.status)}</div></div><b>${moneySafe(q.total)}</b></div>`).join(''):'<div class="empty">No hay pedidos activos próximos.</div>'}</div>
        <div class="v42-card"><div class="v33-eyebrow">Seguimiento</div><h3>Estatus del periodo</h3><div class="v42-statuses">${Object.keys(statuses).length?Object.entries(statuses).map(([k,v])=>`<div class="v42-status"><span>${esc(k)}</span><b>${v}</b></div>`).join(''):'<div class="empty">Sin movimientos.</div>'}</div><div style="margin-top:14px"><div class="v33-eyebrow">Rentabilidad</div><div class="v33-profit-row"><span>Ingresos</span><b>${moneySafe(revenue)}</b></div><div class="v33-profit-row"><span>Costos estimados</span><b>${moneySafe(costs)}</b></div><div class="v33-profit-row"><span>Ganancia estimada</span><b>${moneySafe(profit)}</b></div></div></div>
      </div>
      ${has('Pro')?`<div class="v42-card" style="margin-top:14px"><div class="v33-eyebrow">Pro</div><h3>Compras por cliente</h3><div class="table-wrap"><table class="table"><thead><tr><th>Cliente</th><th>Pedidos</th><th>Total comprado</th><th>Ticket promedio</th></tr></thead><tbody>${Object.entries(customer).sort((a,b)=>b[1].total-a[1].total).map(([n,c])=>`<tr><td><b>${esc(n)}</b></td><td>${c.orders}</td><td>${moneySafe(c.total)}</td><td>${moneySafe(c.total/c.orders)}</td></tr>`).join('')||'<tr><td colspan="4">Sin ventas cerradas en este periodo.</td></tr>'}</tbody></table></div></div>`:''}`;
    const p=document.getElementById('v42period');if(p)p.onchange=()=>renderHome(p.value);
    const n=document.getElementById('v42now');if(n)n.onclick=()=>renderHome(todayYM());
  }
  views.home=function(){renderHome(state.reportPeriod||todayYM())};

  const baseOrders=views.orders;
  const baseProduction=views.production;
  function addOpsTabs(){
    ensureStyle();
    const head=content.querySelector('.page-head');
    const html=`<div class="v42-tabs"><button class="${opsTab==='orders'?'active':''}" onclick="openOpsTab('orders')">Pedidos</button><button class="${opsTab==='production'?'active':''}" ${has('Negocio')?'onclick="openOpsTab(\'production\')"':'disabled title="Disponible desde Negocio"'}>Producción${has('Negocio')?'':' · Negocio'}</button></div>`;
    if(head)head.insertAdjacentHTML('afterend',html);else content.insertAdjacentHTML('afterbegin',html);
  }
  window.openOpsTab=function(tab){
    if(tab==='production'&&!has('Negocio')){toast('Producción está disponible desde el plan Negocio');return}
    opsTab=tab==='production'?'production':'orders';window.show('orders');
  };
  views.orders=function(){
    if(opsTab==='production'&&has('Negocio')) baseProduction(); else {opsTab='orders';baseOrders();}
    titleEl.textContent='Pedidos y producción';
    const h=content.querySelector('.page-head h1'); if(h)h.textContent=opsTab==='production'?'Producción':'Pedidos';
    addOpsTabs();
  };
  views.production=function(){opsTab='production';views.orders()};

  const baseShow=window.show;
  window.show=function(v){
    if(v==='production'){
      if(!has('Negocio')){toast('Producción está disponible desde el plan Negocio');return}
      opsTab='production';v='orders';
    }
    if(v==='orders'&&opsTab!=='production')opsTab='orders';
    return baseShow(v);
  };
})();