(function(){
  function friendlyLabel(raw){
    const x=String(raw||'').trim().toLowerCase();
    if(x.includes('base')||x.includes('pan'))return 'Sabor del pastel';
    if(x.includes('relleno'))return 'Relleno';
    if(x.includes('cobertura')||x.includes('betún')||x.includes('betun'))return 'Cobertura';
    if(x.includes('jarabe')||x.includes('salsa'))return 'Salsa o jarabe';
    if(x.includes('decoración')||x.includes('decoracion')||x.includes('preparación')||x.includes('preparacion'))return 'Decoración';
    return raw;
  }
  function enhanceOrderStep(){
    const modal=document.querySelector('.v61-quote-modal');
    if(!modal)return;
    const pane=modal.querySelector('[data-v61-pane="1"]');
    if(!pane||pane.dataset.v62Ready)return;
    const product=document.getElementById('qproduct');
    const measure=document.getElementById('qmeasure');
    const dynamic=document.getElementById('dynamicComponents');
    const pkg=document.getElementById('packageBox')?.closest('.quote-section');
    if(!product||!measure||!dynamic)return;
    pane.dataset.v62Ready='1';

    const intro=document.createElement('div');intro.className='v62-order-intro';
    intro.innerHTML='<div><strong>Arma el pedido</strong><span>Elige primero qué producto es y su tamaño. Después selecciona únicamente lo que llevará este pedido.</span></div><div class="v62-order-summary"><span class="v62-chip" data-v62-product>Producto</span><span class="v62-chip" data-v62-measure>Tamaño</span></div>';
    pane.insertBefore(intro,pane.children[1]||null);

    const topSection=product.closest('.quote-section');
    if(topSection){
      [...topSection.querySelectorAll('.field')].forEach(l=>{
        if(l.querySelector('#qproduct')){const n=[...l.childNodes].find(x=>x.nodeType===Node.TEXT_NODE&&x.textContent.trim());if(n)n.textContent='Producto';}
        if(l.querySelector('#qmeasure')){const n=[...l.childNodes].find(x=>x.nodeType===Node.TEXT_NODE&&x.textContent.trim());if(n)n.textContent='Tamaño / presentación';}
        if(l.querySelector('#qstatus'))l.style.display='none';
      });
    }

    if(pkg){pkg.classList.add('v62-package-card');const h=pkg.querySelector('h3');if(h&&h.textContent!=='Empaque del pedido')h.textContent='Empaque del pedido';const hint=pkg.querySelector('.hint');if(hint)hint.textContent='Agrega caja, base, bolsa u otro insumo solo si este pedido lo necesita.';const btn=pkg.querySelector('#addPackage');if(btn)btn.textContent='+ Agregar empaque o insumo';}

    let relabelQueued=false;
    function relabelDynamic(){
      if(relabelQueued)return;relabelQueued=true;
      requestAnimationFrame(()=>{
        relabelQueued=false;
        [...dynamic.querySelectorAll(':scope > .section')].forEach(sec=>{
          const h=sec.querySelector('h3');if(h){const next=friendlyLabel(h.textContent);if(h.textContent!==next)h.textContent=next;}
          const hint=sec.querySelector('.hint');if(hint&&hint.textContent!=='Elige la opción que llevará este pedido.')hint.textContent='Elige la opción que llevará este pedido.';
          const field=sec.querySelector('.field');if(field){const first=[...field.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());if(first&&first.textContent.trim()!=='Opción')first.textContent='Opción ';}
        });
      });
    }
    function updateChips(){
      intro.querySelector('[data-v62-product]').textContent=product.options[product.selectedIndex]?.text||'Producto';
      intro.querySelector('[data-v62-measure]').textContent=measure.options[measure.selectedIndex]?.text||'Tamaño';
      relabelDynamic();
    }
    product.addEventListener('change',()=>setTimeout(updateChips,0));
    measure.addEventListener('change',()=>setTimeout(updateChips,0));
    const dynObserver=new MutationObserver(()=>relabelDynamic());
    dynObserver.observe(dynamic,{childList:true});
    updateChips();
  }
  function run(){requestAnimationFrame(enhanceOrderStep);setTimeout(enhanceOrderStep,40);}
  const original=window.newQuote;
  if(typeof original==='function')window.newQuote=function(){const r=original.apply(this,arguments);run();return r;};
})();
