(function(){
  function orderForQuoteId(qid){return (state.orders||[]).find(o=>o.quoteId===qid)}
  function quoteForOrderId(oid){const o=(state.orders||[]).find(x=>x.id===oid);return o?(state.quotes||[]).find(q=>q.id===o.quoteId):null}
  function lockedProductionStatus(o){return !!o&&['En producción','Listo','Entregado y pagado'].includes(o.status)}

  const baseNewQuote=window.newQuote;
  window.newQuote=function(editId=null){
    if(editId){
      const o=orderForQuoteId(editId);
      if(lockedProductionStatus(o)){
        toast('Esta cotización ya está en producción. Regresa el pedido a Pendiente antes de cambiar producto, recetas, presentación o materiales.');
        return;
      }
    }
    return baseNewQuote&&baseNewQuote(editId);
  };

  const baseOrderAction=window.orderAction;
  window.orderAction=function(id,act){
    const o=(state.orders||[]).find(x=>x.id===id);
    if(!o)return;
    const valid={
      start:['Pendiente'],
      ready:['En producción'],
      done:['Listo'],
      pending:['En producción','Listo'],
      materials:['Pendiente','En producción','Listo','Entregado y pagado']
    };
    if(valid[act]&&!valid[act].includes(o.status)){
      toast('Acción no disponible para un pedido en estado '+o.status+'.');
      return;
    }
    if(act==='pending'&&!confirm('¿Regresar este pedido a Pendiente? Se repondrá al inventario lo descontado al iniciar producción.'))return;
    return baseOrderAction&&baseOrderAction(id,act);
  };

  const baseOrders=views.orders;
  views.orders=function(){
    baseOrders();
    (state.orders||[]).forEach(o=>{
      if(!['En producción','Listo'].includes(o.status))return;
      const cards=[...content.querySelectorAll('.order-card')];
      const q=quoteForOrderId(o.id);
      const card=cards.find(c=>c.textContent.includes(q?.folio||'__no__'));
      const actions=card&&card.querySelector('.ops-actions');
      if(actions&&!actions.querySelector('[data-back-pending]')){
        actions.insertAdjacentHTML('beforeend',`<button class="ghost" data-back-pending onclick="orderAction('${o.id}','pending')">Regresar a pendiente</button>`);
      }
    });
  };

  const baseProduction=views.production;
  views.production=function(){
    baseProduction();
    (state.orders||[]).forEach(o=>{
      if(!['En producción','Listo'].includes(o.status))return;
      const q=quoteForOrderId(o.id);
      const cards=[...content.querySelectorAll('.card')];
      const card=cards.find(c=>c.textContent.includes(q?.folio||'__no__'));
      const actions=card&&card.querySelector('.ops-actions');
      if(actions&&!actions.querySelector('[data-back-pending]')){
        actions.insertAdjacentHTML('beforeend',`<button class="ghost" data-back-pending onclick="orderAction('${o.id}','pending');show('production')">Regresar a pendiente</button>`);
      }
    });
  };
})();