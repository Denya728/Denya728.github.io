/* DENYA v143 — navigation recovery: use core show only */
(function(){
  'use strict';
  function go(v){
    try{
      if(v==='profile' && typeof window.renderProfile==='function'){ window.renderProfile('company'); return; }
      if(typeof window.DENYABaseShow==='function'){ window.DENYABaseShow(v); return; }
      throw new Error('Navegación principal no disponible');
    }catch(e){
      console.error('DENYA navigation:',v,e);
      if(typeof window.show==='function') window.show('home');
    }
  }
  document.addEventListener('click',function(e){
    var b=e.target&&e.target.closest&&e.target.closest('.nav button[data-view]');
    if(!b)return;
    var v=b.getAttribute('data-view');
    if(!v)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    go(v);
  },true);
  function boot(){
    if(typeof window.DENYABaseShow==='function') window.DENYABaseShow('home');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else setTimeout(boot,0);
})();