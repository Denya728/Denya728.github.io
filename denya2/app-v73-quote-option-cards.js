// DENYA v73 · stabilize first-floor quotation options as independent cards
(function(){
  const previous=window.newQuote;
  if(typeof previous!=='function') return;

  function normalize(modal){
    if(!modal||!modal.querySelector('#qproduct')) return;
    const box=modal.querySelector('.v69-floor-one-options>#dynamicComponents')||modal.querySelector('#dynamicComponents');
    if(!box) return;

    box.querySelectorAll(':scope > .section').forEach(sec=>{
      sec.classList.add('v73-option-card');
      const h3=sec.querySelector('h3');
      const hint=sec.querySelector('.hint');
      const field=sec.querySelector('label.field');
      if(hint){
        const txt=hint.textContent||'';
        const m=txt.match(/utiliza\s+([\d.]+)\s+receta/i);
        if(m){
          const qty=Number(m[1]);
          hint.innerHTML=`<b>Usa ${qty} receta${qty===1?'':'s'}</b> · Selecciona la preparación`;
        }
      }
      if(field){
        [...field.childNodes].forEach(n=>{
          if(n.nodeType===3&&/seleccionar receta|preparación/i.test(n.textContent||'')) n.remove();
        });
      }
      if(h3) h3.style.display='block';
    });
  }

  window.newQuote=function(){
    const out=previous.apply(this,arguments);
    setTimeout(()=>{
      const modals=[...document.querySelectorAll('.modal-bg .modal')];
      const modal=modals[modals.length-1];
      normalize(modal);
      const box=modal?.querySelector('#dynamicComponents');
      if(box){
        const obs=new MutationObserver(()=>normalize(modal));
        obs.observe(box,{childList:true,subtree:true});
      }
    },0);
    return out;
  };
})();
