(function(){
  const oldRenderProfile=window.renderProfile;
  if(typeof oldRenderProfile!=='function') return;

  function tabs(active){
    const items=[['company','Empresa'],['plan','Mi plan'],['subscription','Suscripción'],['templates','Plantillas'],['users','Usuarios']];
    return `<div class="profile-tabs v58-account-tabs">${items.map(([id,label])=>`<button class="${active===id?'active':''}" onclick="renderProfile('${id}')">${label}</button>`).join('')}</div>`;
  }

  function ensureStyle(){
    if(document.getElementById('v58accountstyle'))return;
    const s=document.createElement('style');s.id='v58accountstyle';s.textContent=`
      .v58-account-tabs{margin-bottom:16px}.v58-account-note{margin:0 0 14px;padding:12px 14px;border:1px solid #eadfd4;border-radius:14px;background:#fff}.v58-account-note b{display:block;margin-bottom:3px}
    `;document.head.appendChild(s);
  }

  function normalizeProfilePage(active){
    ensureStyle();
    titleEl.textContent='Perfil';
    if(typeof setActive==='function')setActive('profile');
    const existing=content.querySelector('.profile-tabs');
    if(existing)existing.outerHTML=tabs(active);
    else{
      const head=content.querySelector('.page-head');
      if(head)head.insertAdjacentHTML('afterend',tabs(active));
      else content.insertAdjacentHTML('afterbegin',tabs(active));
    }
  }

  window.renderProfile=function(tab='company'){
    if(tab==='plan'){
      if(typeof views.plan==='function')views.plan();
      normalizeProfilePage('plan');
      return;
    }
    if(tab==='subscription'){
      if(typeof views.subscription==='function')views.subscription();
      normalizeProfilePage('subscription');
      return;
    }
    oldRenderProfile(tab);
    normalizeProfilePage(tab);
    const shell=content.querySelector('.profile-shell');
    if(shell&&tab==='company')shell.insertAdjacentHTML('beforebegin','<div class="v58-account-note"><b>Cuenta y suscripción</b><span class="muted">Tu plan y tu suscripción ahora se administran desde este Perfil, para mantener toda la cuenta en un solo lugar.</span></div>');
  };

  views.profile=()=>window.renderProfile('company');

  const previousShow=window.show;
  window.show=function(v){
    if(v==='profile'){window.renderProfile('company');return}
    if(v==='plan'){window.renderProfile('plan');return}
    if(v==='subscription'){window.renderProfile('subscription');return}
    return previousShow(v);
  };

  function removeStandaloneNav(){
    document.querySelectorAll('.nav button[data-view="plan"],.nav button[data-view="subscription"]').forEach(el=>el.remove());
    const profile=document.querySelector('.nav button[data-view="profile"]');
    if(profile)profile.onclick=()=>window.show('profile');
  }
  removeStandaloneNav();
})();