// DENYA v64 - restore one clean quotation editor route after all legacy modules load.
(function(){
  const base=window.__denyaBaseNewQuote;
  if(typeof base!=='function') return;

  window.newQuote=function(editId=null){
    const result=base(editId);

    // Keep the deposit-paid status available without observers or recursive wrappers.
    const sel=document.getElementById('qstatus');
    if(sel){
      const DEPOSIT='Aceptada y anticipo pagado';
      if(!Array.from(sel.options).some(o=>(o.value||o.textContent)===DEPOSIT)){
        const opt=document.createElement('option');
        opt.value=DEPOSIT;
        opt.textContent=DEPOSIT;
        const delivered=Array.from(sel.options).find(o=>(o.value||o.textContent)==='Entregada y pagada');
        sel.insertBefore(opt,delivered||null);
      }
      if(editId){
        const q=(state.quotes||[]).find(x=>x.id===editId);
        if(q?.status) sel.value=q.status;
      }
    }
    return result;
  };
})();
