(function(){
  const DEPOSIT='Aceptada y anticipo pagado';
  const STATUS_ORDER=['Borrador','Aceptada',DEPOSIT,'Entregada y pagada','Cancelada'];
  let forcing=false;

  function ensureStatus(editId=null){
    const sel=document.getElementById('qstatus');
    if(!sel)return;
    const current=editId?(state.quotes||[]).find(q=>q.id===editId)?.status:sel.value;
    sel.innerHTML=STATUS_ORDER.map(s=>`<option value="${s}">${s}</option>`).join('');
    if(current&&STATUS_ORDER.includes(current))sel.value=current;
    if(!sel.dataset.v46){
      sel.dataset.v46='1';
      sel.addEventListener('change',()=>{
        const dep=document.getElementById('qdeposit');
        if(sel.value===DEPOSIT&&dep&&Number(dep.value)<=0)dep.value='50';
        if(sel.value==='Entregada y pagada'&&dep)dep.value='100';
        forceCalc();
      });
    }
  }

  function forceCalc(){
    if(forcing)return;
    const dep=document.getElementById('qdeposit');
    if(!dep)return;
    forcing=true;
    dep.dispatchEvent(new Event('input',{bubbles:true}));
    forcing=false;
  }

  function wireLiveCalc(){
    const status=document.getElementById('qstatus');
    if(!status)return;
    const root=status.closest('.modal,.modal-card,.modal-wrap,[role="dialog"]')||document.body;
    if(root.dataset?.v46Live)return;
    if(root.dataset)root.dataset.v46Live='1';
    const recalc=e=>{
      if(forcing||e.target?.id==='qdeposit')return;
      if(e.target?.matches?.('input,select'))setTimeout(forceCalc,0);
    };
    root.addEventListener('input',recalc,true);
    root.addEventListener('change',recalc,true);
    setTimeout(forceCalc,0);
    setTimeout(forceCalc,80);
  }

  const previous=window.newQuote;
  window.newQuote=function(editId=null){
    const r=previous&&previous(editId);
    const patch=()=>{ensureStatus(editId);wireLiveCalc();forceCalc();};
    patch();
    requestAnimationFrame(patch);
    setTimeout(patch,0);
    setTimeout(patch,80);
    setTimeout(patch,180);
    return r;
  };

  const observer=new MutationObserver(()=>{
    if(document.getElementById('qstatus')){
      ensureStatus();
      wireLiveCalc();
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
