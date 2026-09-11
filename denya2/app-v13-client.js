(function(){
  const previousNewQuote=window.newQuote;
  if(typeof previousNewQuote!=='function') return;

  window.newQuote=function(editId=null){
    previousNewQuote(editId);
    const modal=document.querySelector('.modal-bg .modal');
    if(!modal) return;
    const clientSelect=modal.querySelector('#qclient');
    const newClientInput=modal.querySelector('#qnewclient');
    if(!clientSelect||!newClientInput) return;

    if(![...clientSelect.options].some(o=>o.value==='')){
      const opt=document.createElement('option');
      opt.value='';
      opt.textContent='＋ Cliente nuevo';
      clientSelect.insertBefore(opt,clientSelect.firstChild);
    }

    const label=newClientInput.closest('.field');
    const updateClientMode=()=>{
      const isNew=clientSelect.value==='';
      newClientInput.disabled=!isNew;
      newClientInput.required=isNew;
      newClientInput.placeholder=isNew?'Escribe el nombre del nuevo cliente':'';
      if(label){
        label.style.opacity=isNew?'1':'.55';
        label.querySelector('input').style.background=isNew?'#fff':'#f4f1ed';
      }
      if(isNew){
        newClientInput.value='';
        setTimeout(()=>newClientInput.focus(),0);
      }
    };

    clientSelect.addEventListener('change',updateClientMode);
    if(!editId){
      clientSelect.value='';
    }
    updateClientMode();
  };
})();
