// DENYA v72 · polish quotation editor spacing/copy without changing quote logic
(function(){
  const previous=window.newQuote;
  if(typeof previous!=='function') return;

  function tidy(modal){
    if(!modal||!modal.querySelector('#qproduct')) return;
    const box=modal.querySelector('#dynamicComponents');
    if(!box) return;

    const shorten=()=>{
      box.querySelectorAll('.section').forEach(sec=>{
        const hint=sec.querySelector('.hint');
        if(!hint) return;
        const txt=hint.textContent||'';
        const m=txt.match(/utiliza\s+([\d.]+)\s+receta/i);
        if(m){
          const qty=Number(m[1]);
          hint.innerHTML=`<b>Usa ${qty} receta${qty===1?'':'s'}</b><br><span>Selecciona la preparación.</span>`;
        }
        const field=sec.querySelector('label.field');
        if(field){
          const labelNodes=[...field.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());
          labelNodes.forEach(n=>{if(/seleccionar receta/i.test(n.textContent))n.textContent='Preparación'});
        }
      });
    };
    shorten();
    const obs=new MutationObserver(shorten);
    obs.observe(box,{childList:true,subtree:true});
    modal.addEventListener('DOMNodeRemoved',()=>obs.disconnect(),{once:true});
  }

  window.newQuote=function(){
    const out=previous.apply(this,arguments);
    setTimeout(()=>{
      const modals=[...document.querySelectorAll('.modal-bg .modal')];
      tidy(modals[modals.length-1]);
    },0);
    return out;
  };
})();
