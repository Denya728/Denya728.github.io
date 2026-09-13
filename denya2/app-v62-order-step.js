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
    pane.dataset.v62Ready='1';

    const product=document.getElementById('qproduct');
    const measure=document.getElementById('qmeasure');
    const dynamic=document.getElementById('dynamicComponents');
    const pkg=document.getElementById('packageBox')?.closest('.quote-section');
    if(!product||!measure||!dynamic)return;

    const intro=document.createElement('div');intro.className='v62-order-intro';
    intro.innerHTML='<div><strong>Arma el pedido</strong><span>Elige primero qué producto es y su tamaño. Después selecciona únicamente lo que llevará este pedido.</span></div><div class="v62-order-summary"><span class="v62-chip" data-v62-product>Producto</span><span class="v62-chip" data-v62-measure>Tamaño</span></div>';
    pane.insertBefore(intro,pane.children[1]||null);

    const topSection=product.closest('.quote-section');
    if(topSection){
      const labels=[...topSection.querySelectorAll('.field')];
      labels.forEach(l=>{
        const txt=(l.firstChild?.textContent||l.querySelector('span')?.textContent||'').trim();
        if(l.querySelector('#qproduct')) l.childNodes[0] && (l.childNodes[0].textContent='Producto');
        if(l.querySelector('#qmeasure')) l.childNodes[0] && (l.childNodes[0].textContent='Tamaño / presentación');
        if(l.querySelector('#qstatus')){l.style.display='none';}
      });
    }

    if(pkg){pkg.classList.add('v62-package-card');const h=pkg.querySelector('h3');if(h)h.textContent='Empaque del pedido';const hint=pkg.querySelector('.hint');if(hint)hint.textContent='Agrega caja, base, bolsa u otro insumo solo si este pedido lo necesita.';const btn=pkg.querySelector('#addPackage');if(btn)btn.textContent='+ Agregar empaque o insumo';}

    function relabelDynamic(){
      [...dynamic.querySelectorAll(':scope > .section')].forEach(sec=>{
        const h=sec.querySelector('h3');if(h)h.textContent=friendlyLabel(h.textContent);
        const hint=sec.querySelector('.hint');if(hint)hint.textContent='Elige la opción que llevará este pedido.';
        const field=sec.querySelector('.field');if(field){const first=[...field.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());if(first)first.textContent='Opción ';}
      });
    }
    function updateChips(){
      const p=intro.querySelector('[data-v62-product]'),m=intro.querySelector('[data-v62-measure]');
      p.textContent=product.options[product.selectedIndex]?.text||'Producto';
      m.textContent=measure.options[measure.selectedIndex]?.text||'Tamaño';
      relabelDynamic();
    }
    product.addEventListener('change',()=>setTimeout(updateChips,0));
    measure.addEventListener('change',()=>setTimeout(updateChips,0));
    new MutationObserver(()=>relabelDynamic()).observe(dynamic,{childList:true,subtree:true});
    updateChips();
  }
  const run=()=>{requestAnimationFrame(enhanceOrderStep);setTimeout(enhanceOrderStep,60);setTimeout(enhanceOrderStep,180)};
  const original=window.newQuote;
  if(typeof original==='function')window.newQuote=function(){const r=original.apply(this,arguments);run();return r;};
  new MutationObserver(()=>{if(document.querySelector('.v61-quote-modal'))run();}).observe(document.body,{childList:true,subtree:true});
})();
