(function(){
  const ym=v=>String(v||'').slice(0,7);
  const todayYM=()=>new Date().toISOString().slice(0,7);
  const qFor=o=>(state.quotes||[]).find(q=>q.id===o.quoteId);
  const moneySafe=n=>typeof money==='function'?money(Number(n)||0):'$'+(Number(n)||0).toFixed(2);
  function closedMonth(o,q){return ym(o?.completedAt)||ym(q?.completedAt)||ym(q?.event)}
  function canonicalCost(q){
    if(!q)return 0;
    if(Number.isFinite(Number(q.costEstimated)))return Number(q.costEstimated)||0;
    try{
      if(typeof window.denyaMaterialsV41==='function'){
        return (window.denyaMaterialsV41(q)||[]).reduce((s,x)=>s+((Number(x.qty??x.need)||0)*(Number(x.cost)||0)),0);
      }
    }catch(e){}
    try{return typeof productMeasureCost==='function'?productMeasureCost(getMeasure(q.measureId),q.selections||{}):0}catch(e){return 0}
  }
  function closedEntries(period){
    return (state.orders||[])
      .filter(o=>o.status==='Entregado y pagado')
      .map(o=>({o,q:qFor(o)}))
      .filter(x=>x.q&&closedMonth(x.o,x.q)===period)
      .map(x=>({...x,cost:canonicalCost(x.q),revenue:Number(x.q.total)||0}));
  }
  window.denyaFinancePeriodV45=closedEntries;
  window.denyaQuoteCostV45=canonicalCost;

  const baseHome=views.home;
  views.home=function(){
    if(baseHome)baseHome();
    const period=state.reportPeriod||todayYM();
    const entries=closedEntries(period);
    const revenue=entries.reduce((s,x)=>s+x.revenue,0);
    const costs=entries.reduce((s,x)=>s+x.cost,0);
    const profit=revenue-costs;
    const cards=[...content.querySelectorAll('.v33-profit-row')];
    cards.forEach(row=>{
      const label=row.querySelector('span')?.textContent?.trim();
      const value=row.querySelector('b');
      if(!value)return;
      if(label==='Ingresos')value.textContent=moneySafe(revenue);
      if(label==='Costos estimados')value.textContent=moneySafe(costs);
      if(label==='Ganancia estimada')value.textContent=moneySafe(profit);
    });
  };

  views.finance=function(){
    const period=state.reportPeriod||todayYM();
    const entries=closedEntries(period);
    const revenue=entries.reduce((s,x)=>s+x.revenue,0);
    const cost=entries.reduce((s,x)=>s+x.cost,0);
    const profit=revenue-cost;
    const margin=revenue?profit/revenue*100:0;
    titleEl.textContent='Finanzas';
    content.innerHTML=pageHead('Finanzas','Mismo periodo y misma fórmula que Resumen. Solo incluye pedidos entregados y pagados del mes seleccionado.')+
      `<div class="toolbar"><label class="field" style="max-width:220px">Periodo<input id="v45FinancePeriod" type="month" value="${esc(period)}"></label><button class="secondary" id="v45Now">Mes actual</button></div>`+
      `<div class="grid4"><div class="card kpi"><small>Ventas cerradas</small><strong>${moneySafe(revenue)}</strong></div><div class="card kpi"><small>Costo estimado</small><strong>${moneySafe(cost)}</strong></div><div class="card kpi"><small>Utilidad estimada</small><strong class="${profit>=0?'profit-pos':'profit-neg'}">${moneySafe(profit)}</strong></div><div class="card kpi"><small>Margen</small><strong>${margin.toFixed(1)}%</strong></div></div>`+
      `<div class="table-wrap" style="margin-top:14px"><table class="table"><thead><tr><th>Folio</th><th>Cliente</th><th>Venta</th><th>Costo</th><th>Utilidad</th><th>Margen</th></tr></thead><tbody>${entries.map(({q,cost,revenue})=>{const u=revenue-cost,mg=revenue?u/revenue*100:0;return `<tr><td><b>${esc(q.folio||'')}</b></td><td>${esc(q.client||'')}</td><td>${moneySafe(revenue)}</td><td>${moneySafe(cost)}</td><td class="${u>=0?'profit-pos':'profit-neg'}">${moneySafe(u)}</td><td>${mg.toFixed(1)}%</td></tr>`}).join('')||'<tr><td colspan="6"><div class="empty">No hay ventas cerradas en este periodo.</div></td></tr>'}</tbody></table></div>`;
    const p=document.getElementById('v45FinancePeriod');if(p)p.onchange=()=>{state.reportPeriod=p.value;save();views.finance()};
    const n=document.getElementById('v45Now');if(n)n.onclick=()=>{state.reportPeriod=todayYM();save();views.finance()};
  };
})();