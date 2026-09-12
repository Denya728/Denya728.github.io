(function(){
  const STATUS_DEPOSIT='Aceptada y anticipo pagado';
  const acceptedStatuses=new Set(['Aceptada',STATUS_DEPOSIT]);

  function orderForQuote(qid){return (state.orders||[]).find(o=>o.quoteId===qid)}
  function syncPaymentOrders(){
    if(!Array.isArray(state.orders))state.orders=[];
    (state.quotes||[]).forEach(q=>{
      let o=orderForQuote(q.id);
      if(acceptedStatuses.has(q.status)&&!o){
        o={id:'o'+Date.now()+Math.random().toString(36).slice(2,5),quoteId:q.id,status:'Pendiente',inventoryApplied:false,createdAt:new Date().toISOString()};
        state.orders.push(o);
      }
      if(o){
        o.depositPaid=q.status===STATUS_DEPOSIT||q.status==='Entregada y pagada';
        o.paymentStatus=q.status==='Entregada y pagada'?'Pagado':q.status===STATUS_DEPOSIT?'Anticipo pagado':q.status==='Aceptada'?'Aceptado, anticipo pendiente':'';
        if(q.status==='Entregada y pagada')o.status='Entregado y pagado';
        if(q.status==='Cancelada')o.status='Cancelado';
      }
    });
    save();
  }

  const baseNewQuote=window.newQuote;
  window.newQuote=function(editId=null){
    const result=baseNewQuote&&baseNewQuote(editId);
    const sel=document.querySelector('#qstatus');
    if(sel&&!Array.from(sel.options).some(o=>o.value===STATUS_DEPOSIT)){
      const opt=document.createElement('option');opt.value=STATUS_DEPOSIT;opt.textContent=STATUS_DEPOSIT;
      const delivered=Array.from(sel.options).find(o=>o.value==='Entregada y pagada');
      sel.insertBefore(opt,delivered||null);
      const q=editId&&(state.quotes||[]).find(x=>x.id===editId);if(q?.status===STATUS_DEPOSIT)sel.value=STATUS_DEPOSIT;
    }
    return result;
  };

  const baseQuotations=views.quotations;
  if(baseQuotations)views.quotations=function(){
    baseQuotations();
    const head=content.querySelector('.page-head');
    const flow='<div class="helper"><b>Flujo de pago:</b> Borrador → Aceptada → Aceptada y anticipo pagado → Entregada y pagada.</div>';
    if(head)head.insertAdjacentHTML('afterend',flow);else content.insertAdjacentHTML('afterbegin',flow);
  };

  const baseOrders=views.orders;
  if(baseOrders)views.orders=function(){
    syncPaymentOrders();baseOrders();
    (state.orders||[]).forEach(o=>{
      const q=(state.quotes||[]).find(x=>x.id===o.quoteId);if(!q)return;
      const card=[...content.querySelectorAll('.order-card')].find(c=>c.textContent.includes(q.folio||'__none__'));
      const meta=card&&card.querySelector('.order-meta');
      if(meta&&!meta.querySelector('[data-pay-state]')){
        const txt=q.status===STATUS_DEPOSIT?'Anticipo pagado':q.status==='Entregada y pagada'?'Pagado':'Anticipo pendiente';
        meta.insertAdjacentHTML('beforeend',`<span class="badge ${q.status===STATUS_DEPOSIT||q.status==='Entregada y pagada'?'ok':'warn'}" data-pay-state>${txt}</span>`);
      }
    });
  };

  const baseProduction=views.production;
  if(baseProduction)views.production=function(){syncPaymentOrders();baseProduction()};

  // Importante: no convertimos temporalmente "Aceptada y anticipo pagado" a "Aceptada".
  // Hacerlo provocaba que Resumen guardara el estado temporal y la cotización perdiera su estatus real.
  const baseHome=views.home;
  if(baseHome)views.home=function(){syncPaymentOrders();return baseHome()};

  const baseClients=views.clients;
  if(baseClients)views.clients=function(){return baseClients()};

  const baseQuoteAction=window.quoteAction;
  if(baseQuoteAction)window.quoteAction=function(id,act){const r=baseQuoteAction(id,act);syncPaymentOrders();return r};

  syncPaymentOrders();
})();