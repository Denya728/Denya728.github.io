(function(){
  const DEPOSIT='Aceptada y anticipo pagado';
  function patchStatusSelect(){
    const sel=document.getElementById('qstatus');
    if(!sel)return false;
    const labels=Array.from(sel.options).map(o=>o.value||o.textContent);
    if(!labels.includes(DEPOSIT)){
      const opt=document.createElement('option');
      opt.value=DEPOSIT;
      opt.textContent=DEPOSIT;
      const delivered=Array.from(sel.options).find(o=>(o.value||o.textContent)==='Entregada y pagada');
      sel.insertBefore(opt,delivered||null);
    }
    const modal=sel.closest('.modal,.modal-card,.modal-wrap,[role="dialog"]')||document;
    const editId=modal.querySelector?.('[data-edit-quote-id]')?.dataset?.editQuoteId;
    if(editId){
      const q=(state.quotes||[]).find(x=>x.id===editId);
      if(q?.status===DEPOSIT)sel.value=DEPOSIT;
    }
    return true;
  }

  const previous=window.newQuote;
  window.newQuote=function(editId=null){
    const r=previous&&previous(editId);
    patchStatusSelect();
    requestAnimationFrame(patchStatusSelect);
    setTimeout(patchStatusSelect,0);
    setTimeout(patchStatusSelect,80);
    if(editId){
      setTimeout(()=>{
        const sel=document.getElementById('qstatus');
        const q=(state.quotes||[]).find(x=>x.id===editId);
        if(sel&&q?.status===DEPOSIT)sel.value=DEPOSIT;
      },90);
    }
    return r;
  };

  const observer=new MutationObserver(()=>patchStatusSelect());
  observer.observe(document.body,{childList:true,subtree:true});

  const baseQuotations=views.quotations;
  if(baseQuotations)views.quotations=function(){
    baseQuotations();
    const helper=[...content.querySelectorAll('.helper')].find(x=>x.textContent.includes('Flujo de pago'));
    if(helper)helper.innerHTML='<b>Flujo de pago:</b> Borrador → Aceptada → Aceptada y anticipo pagado → Entregada y pagada.';
  };
})();
