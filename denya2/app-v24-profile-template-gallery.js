(function(){
  const items=[
    {id:'minimal',name:'Minimalista premium',desc:'Elegante, limpia y con enfoque en el pedido.',min:'Emprende'},
    {id:'editorial',name:'Editorial dulce',desc:'Composición boutique tipo revista.',min:'Negocio'},
    {id:'executive',name:'Ejecutiva',desc:'Propuesta comercial clara y profesional.',min:'Pro'},
    {id:'romantic',name:'Romántica',desc:'Delicada, cálida y pensada para celebraciones.',min:'Pro'},
    {id:'modern',name:'Ficha moderna',desc:'Visual, limpia y fácil de leer en celular.',min:'Pro'},
    {id:'signature',name:'Signature premium',desc:'La más lujosa y completa.',min:'Pro'}
  ];
  const rank={Emprende:1,Negocio:2,Pro:3};
  function plan(){return state.subscription?.plan||state.plan||'Negocio'}
  function ok(t){return rank[plan()]>=rank[t.min]}
  function mini(t){
    const content=`<div class="pt-brand">DENYA</div><div class="pt-title">${t.id==='executive'?'Cotización':t.id==='modern'?'Cotización #0241':'Cotización de pastel'}</div><div class="pt-line sm"></div><div class="pt-grid"><div class="pt-box"><div class="pt-line sm"></div><div class="pt-line"></div><div class="pt-line"></div></div><div class="pt-img"></div></div><div class="pt-box"><div class="pt-line"></div><div class="pt-line sm"></div><div class="pt-line"></div></div><div class="pt-pay"></div>`;
    if(t.id==='editorial')return `<div class="pt-sheet"><div></div><div class="pt-inner">${content}</div></div>`;
    return `<div class="pt-sheet">${content}</div>`;
  }
  function renderGallery(){
    const shell=document.querySelector('.profile-shell');
    if(!shell)return;
    const main=shell.firstElementChild;if(!main)return;
    main.innerHTML=`<div class="profile-section"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px"><div><h3 style="margin-bottom:4px">Plantillas de cotización</h3><div class="hint">Visualiza cualquier diseño antes de elegirlo. Las bloqueadas pueden previsualizarse, pero no seleccionarse.</div></div><span class="badge ok">Plan ${plan()}</span></div><div class="profile-template-gallery">${items.map(t=>{const available=ok(t),selected=state.quoteTemplate===t.id;return `<div class="pt-card ${selected?'selected':''} ${available?'':'locked'}">${selected?'<span class="pt-selected">✓ Seleccionada</span>':''}${!available?`<span class="pt-lock">🔒 ${t.min}</span>`:''}<div class="pt-preview ${t.id}">${mini(t)}</div><div class="pt-meta"><h3>${t.name}</h3><p>${t.desc}</p><div class="pt-actions"><button class="secondary" onclick="previewQuoteTemplate('${t.id}')">Vista previa grande</button><button class="${selected?'secondary':'primary'}" ${available?'':'disabled'} onclick="setProfileTemplate('${t.id}')">${selected?'Seleccionada':available?'Usar plantilla':'No incluida'}</button></div></div></div>`}).join('')}</div><div class="profile-template-note"><b>Acceso por plan:</b> Emprende 1 plantilla · Negocio 2 · Pro las 6. Puedes visualizar todas antes de cambiar de plan.</div></div>`;
  }
  const old=window.renderProfile;
  window.renderProfile=function(tab='company'){
    old(tab);
    if(tab==='templates')renderGallery();
  };
})();