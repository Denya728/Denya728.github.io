// DENYA v75 · launch form requirements: only essential quote data blocks saving
(function(){
  const previous=window.newQuote;
  if(typeof previous!=='function') return;

  const OPTIONAL_IDS=['#qphone','#qig','#qbday','#qevent','#qseller','#qtime','#qnotes','#qimage','#qcoupon','#qdiscount'];

  function markOptional(modal){
    OPTIONAL_IDS.forEach(sel=>{
      const el=modal.querySelector(sel);
      if(!el) return;
      el.removeAttribute('required');
      const field=el.closest('.field');
      if(!field) return;
      const label=[...field.childNodes].find(n=>n.nodeType===3 && n.textContent.trim());
      if(label && !/opcional/i.test(label.textContent)) label.textContent=label.textContent.trim()+' (opcional)';
      const span=field.querySelector(':scope > span');
      if(span && !/opcional/i.test(span.textContent)) span.textContent=span.textContent.trim()+' (opcional)';
    });
    const newClient=modal.querySelector('#qnewclient');
    const clientSel=modal.querySelector('#qclient');
    if(newClient) newClient.removeAttribute('required');
    if(clientSel) clientSel.removeAttribute('required');
  }

  window.newQuote=function(){
    const out=previous.apply(this,arguments);
    setTimeout(()=>{
      const modals=[...document.querySelectorAll('.modal-bg .modal')];
      const modal=modals[modals.length-1];
      if(!modal || !modal.querySelector('#qproduct')) return;
      markOptional(modal);

      const saveBtn=modal.querySelector('[data-save]');
      if(!saveBtn || saveBtn.dataset.v75Guard==='1') return;
      saveBtn.dataset.v75Guard='1';

      // Keep launch validation intentionally small: customer + product + presentation.
      saveBtn.addEventListener('click',(ev)=>{
        const client=(modal.querySelector('#qnewclient')?.value||'').trim() || (modal.querySelector('#qclient')?.value||'').trim();
        const product=modal.querySelector('#qproduct')?.value||'';
        const measure=modal.querySelector('#qmeasure')?.value||'';
        if(!client){
          ev.stopImmediatePropagation();
          toast('Escribe un cliente nuevo o selecciona uno existente');
          modal.querySelector('#qnewclient')?.focus();
          return;
        }
        if(!product){
          ev.stopImmediatePropagation();
          toast('Selecciona un producto');
          modal.querySelector('#qproduct')?.focus();
          return;
        }
        if(!measure){
          ev.stopImmediatePropagation();
          toast('Selecciona una presentación');
          modal.querySelector('#qmeasure')?.focus();
        }
      },true);
    },0);
    return out;
  };
})();