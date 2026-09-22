/* DENYA v116 — payments -> profile tab routing only
   Does not change Profile visuals or other sections. */
(function(){
  'use strict';
  var map={
    'Empresa':'company',
    'Suscripción':'account',
    'Plan y suscripción':'account',
    'Personalización':'customization',
    'Pagos':'payments',
    'Plantillas':'templates',
    'Usuarios':'users',
    'Ayuda y soporte':'support',
    'Soporte':'support'
  };
  function route(tab){
    var p=window.__DENYA_PROFILE_V114;
    if(p&&typeof p.render==='function') return p.render(tab);
    if(typeof window.renderProfile==='function') return window.renderProfile(tab);
  }
  function handle(e){
    var b=e.target&&e.target.closest&&e.target.closest('.v58-account-tabs button');
    if(!b) return;
    var name=String(b.textContent||'').replace(/\s+/g,' ').trim();
    var tab=map[name];
    if(!tab) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    route(tab);
  }
  document.addEventListener('click',handle,true);
  window.__v105Navigate=function(tab){ return route(tab); };
  window.__DENYA_v116=true;
})();