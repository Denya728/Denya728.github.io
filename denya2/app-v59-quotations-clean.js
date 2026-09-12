(function(){
  const previous=views.quotations;
  if(typeof previous!=='function') return;
  function quoteStats(){
    const qs=state.quotes||[];
    const active=qs.filter(q=>!['Entregada y pagada','Cancelada'].includes(q.status));
    const accepted=qs.filter(q=>['Aceptada','Aceptada y anticipo pagado'].includes(q.status));
    const pending=qs.reduce((s,q)=>s+(Number(q.balance)||0),0);
    const sold=qs.filter(q=>q.status==='Entregada y pagada').reduce((s,q)=>s+(Number(q.total)||0),0);
    return {total:qs.length,active:active.length,accepted:accepted.length,pending,sold};
  }
  function installWorkspace(){
    document.body.dataset.view='quotations';
    const table=document.getElementById('quotesBody');
    if(!table)return;
    const wrap=table.closest('.table-wrap');
    const toolbar=document.getElementById('quoteSearch')?.parentElement;
    if(toolbar)toolbar.classList.add('quote-v59-toolbar');
    if(!document.querySelector('.quote-v59-kpis')){
      const s=quoteStats();
      const kpis=document.createElement('div');
      kpis.className='quote-v59-kpis';
      kpis.innerHTML=`
        <div class="quote-v59-kpi"><small>Cotizaciones</small><strong>${s.total}</strong><span>${s.active} abiertas</span></div>
        <div class="quote-v59-kpi"><small>Aceptadas</small><strong>${s.accepted}</strong><span>en proceso</span></div>
        <div class="quote-v59-kpi"><small>Por cobrar</small><strong>${money(s.pending)}</strong><span>saldo pendiente</span></div>
        <div class="quote-v59-kpi"><small>Ventas cerradas</small><strong>${money(s.sold)}</strong><span>entregadas y pagadas</span></div>`;
      const anchor=toolbar||wrap;
      if(anchor)anchor.parentNode.insertBefore(kpis,anchor);
    }
    const search=document.getElementById('quoteSearch');
    if(search){search.placeholder='Buscar cliente, folio o producto…';search.setAttribute('aria-label','Buscar cotizaciones')}
    const filter=document.getElementById('quoteFilter');
    if(filter)filter.setAttribute('aria-label','Filtrar cotizaciones por estatus');
  }
  views.quotations=function(){
    previous();
    requestAnimationFrame(installWorkspace);
  };
  views.quotes=views.quotations;
  const oldShow=window.show;
  window.show=function(v){
    if(v!=='quotations'&&v!=='quotes')delete document.body.dataset.view;
    return oldShow(v);
  };
})();
