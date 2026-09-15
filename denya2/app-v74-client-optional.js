// DENYA v74 · existing customer is optional when creating quotations
(function(){
  const previous=window.newQuote;
  if(typeof previous!=='function') return;

  window.newQuote=function(editId=null){
    const out=previous.apply(this,arguments);
    setTimeout(()=>{
      const modals=[...document.querySelectorAll('.modal-bg .modal')];
      const modal=modals[modals.length-1];
      if(!modal||!modal.querySelector('#qproduct')) return;

      const existing=editId?(state.quotes||[]).find(q=>q.id===editId):null;
      const clientSel=modal.querySelector('#qclient');
      const newClient=modal.querySelector('#qnewclient');
      if(!clientSel) return;

      // Allow a quotation to be created for a brand-new customer without
      // forcing an existing customer from the list.
      let blank=[...clientSel.options].find(o=>o.value==='');
      if(!blank){
        blank=document.createElement('option');
        blank.value='';
        blank.textContent='— Ninguno / cliente nuevo —';
        clientSel.insertBefore(blank,clientSel.firstChild);
      } else {
        blank.textContent='— Ninguno / cliente nuevo —';
      }

      if(existing?.client){
        clientSel.value=existing.client;
      }else{
        clientSel.value='';
      }

      // Make the two fields mutually clear so there is no ambiguity.
      if(newClient){
        newClient.placeholder='Escribe el nombre si es cliente nuevo';
        newClient.addEventListener('input',()=>{
          if(newClient.value.trim()) clientSel.value='';
        });
        clientSel.addEventListener('change',()=>{
          if(clientSel.value) newClient.value='';
        });
      }
    },0);
    return out;
  };
})();
