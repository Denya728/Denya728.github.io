(function(){
  const originalNewQuote=window.newQuote;
  if(typeof originalNewQuote!=='function') return;

  function enhanceQuoteModal(){
    const status=document.getElementById('qstatus');
    if(!status)return;
    const modalEl=status.closest('.modal');
    if(!modalEl||modalEl.dataset.v61Quote)return;
    modalEl.dataset.v61Quote='1';modalEl.classList.add('v61-quote-modal');

    const sections=[...modalEl.querySelectorAll(':scope > .quote-section')];
    if(sections.length<5)return;
    const byHeading=text=>sections.find(s=>(s.querySelector('h3')?.textContent||'').toLowerCase().includes(text));
    const client=byHeading('cliente');
    const product=byHeading('producto');
    const packageSec=byHeading('empaque');
    const extras=byHeading('extras');
    const details=byHeading('detalles del pedido');
    const price=byHeading('resumen de precio');
    const discount=sections.find(s=>s.querySelector('#useDiscount'));
    if(!client||!product||!extras||!details||!price)return;

    const head=document.createElement('div');head.className='v61-wizard-head';
    head.innerHTML=`<div class="v61-wizard-progress">
      <button type="button" class="v61-step active" data-v61-step="0"><span><i>1</i>Cliente y evento</span><b></b></button>
      <button type="button" class="v61-step" data-v61-step="1"><span><i>2</i>Pedido</span><b></b></button>
      <button type="button" class="v61-step" data-v61-step="2"><span><i>3</i>Extras</span><b></b></button>
      <button type="button" class="v61-step" data-v61-step="3"><span><i>4</i>Precio y pago</span><b></b></button>
    </div>`;

    const body=document.createElement('div');body.className='v61-wizard-body';
    const panes=[0,1,2,3].map(i=>{const p=document.createElement('div');p.className='v61-wizard-pane'+(i===0?' active':'');p.dataset.v61Pane=i;return p;});
    panes.forEach(p=>body.appendChild(p));

    panes[0].innerHTML='<div class="v61-step-note">Primero identifica al cliente y cuándo necesita su pedido.</div>';
    panes[0].appendChild(client);

    panes[1].innerHTML='<div class="v61-step-note">Elige el producto, presentación y opciones específicas de este pedido.</div>';
    panes[1].appendChild(product);if(packageSec)panes[1].appendChild(packageSec);

    panes[2].innerHTML='<div class="v61-step-note">Agrega únicamente lo adicional que el cliente pidió. Si no aplica, continúa.</div>';
    panes[2].appendChild(extras);if(discount)panes[2].appendChild(discount);

    const mini=document.createElement('div');mini.className='v61-mini-summary';mini.innerHTML='<span>Total estimado</span><strong data-v61-total>$0</strong><span>Saldo</span><strong data-v61-balance>$0</strong>';
    panes[3].appendChild(mini);
    const note=document.createElement('div');note.className='v61-step-note';note.textContent='Revisa pago, comentarios y total antes de guardar.';panes[3].appendChild(note);
    panes[3].appendChild(details);panes[3].appendChild(price);

    const nativeActions=modalEl.querySelector(':scope > .modal-actions');
    const saveBtn=nativeActions?.querySelector('[data-save]');
    const cancelBtn=nativeActions?.querySelector('[data-close]');
    const nav=document.createElement('div');nav.className='v61-wizard-nav';
    nav.innerHTML='<button type="button" class="secondary" data-v61-back>← Anterior</button><div class="v61-nav-right"><button type="button" class="ghost" data-v61-cancel>Cancelar</button><button type="button" class="primary" data-v61-next>Siguiente →</button><button type="button" class="primary" data-v61-save style="display:none">Guardar cotización</button></div>';

    const oldSteps=modalEl.querySelector(':scope > .steps');
    if(oldSteps)oldSteps.after(head);else modalEl.querySelector('.modal-head')?.after(head);
    head.after(body);modalEl.appendChild(nav);

    let current=0;
    const totalOut=mini.querySelector('[data-v61-total]'),balanceOut=mini.querySelector('[data-v61-balance]');
    const updateMini=()=>{const t=document.getElementById('sumTotal')?.textContent||'$0';const b=document.getElementById('sumBalance')?.textContent||'$0';totalOut.textContent=t;balanceOut.textContent=b;};
    const showStep=i=>{
      current=Math.max(0,Math.min(3,i));
      panes.forEach((p,n)=>p.classList.toggle('active',n===current));
      head.querySelectorAll('.v61-step').forEach((b,n)=>{b.classList.toggle('active',n===current);b.classList.toggle('done',n<current);});
      nav.querySelector('[data-v61-back]').style.visibility=current===0?'hidden':'visible';
      nav.querySelector('[data-v61-next]').style.display=current===3?'none':'inline-flex';
      nav.querySelector('[data-v61-save]').style.display=current===3?'inline-flex':'none';
      updateMini();body.scrollTop=0;
    };
    head.querySelectorAll('[data-v61-step]').forEach(b=>b.onclick=()=>showStep(Number(b.dataset.v61Step)));
    nav.querySelector('[data-v61-back]').onclick=()=>showStep(current-1);
    nav.querySelector('[data-v61-next]').onclick=()=>showStep(current+1);
    nav.querySelector('[data-v61-cancel]').onclick=()=>cancelBtn?.click();
    nav.querySelector('[data-v61-save]').onclick=()=>saveBtn?.click();
    modalEl.addEventListener('input',()=>setTimeout(updateMini,0),true);
    modalEl.addEventListener('change',()=>setTimeout(updateMini,0),true);
    setTimeout(updateMini,50);
  }

  window.newQuote=function(){
    const r=originalNewQuote.apply(this,arguments);
    requestAnimationFrame(enhanceQuoteModal);setTimeout(enhanceQuoteModal,20);setTimeout(enhanceQuoteModal,120);
    return r;
  };

  new MutationObserver(()=>{if(document.getElementById('qstatus'))enhanceQuoteModal();}).observe(document.body,{childList:true,subtree:true});
})();
