/* DENYA navigation — final compatibility */
(function(){
  'use strict';
  function open(v){
    try{
      if(v==='profile'){
        if(typeof window.renderProfile==='function') return window.renderProfile('company');
        if(window.__DENYA_PROFILE_V114 && typeof window.__DENYA_PROFILE_V114.openProfile==='function') return window.__DENYA_PROFILE_V114.openProfile();
      }
      if(typeof window.DENYABaseShow==='function') return window.DENYABaseShow(v);
      if(typeof window.show==='function') return window.show(v);
      console.error('DENYA navigation unavailable:',v);
    }catch(err){
      console.error('DENYA navigation error:',v,err);
    }
  }
  function bind(){
    var buttons=document.querySelectorAll('.nav button[data-view]');
    buttons.forEach(function(btn){
      btn.onclick=function(e){
        e.preventDefault();
        e.stopPropagation();
        open(btn.getAttribute('data-view'));
      };
    });
  }
  function boot(){
    bind();
    if(typeof window.DENYABaseShow==='function') window.DENYABaseShow('home');
    else if(typeof window.show==='function') window.show('home');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
  window.DENYAV143={open:open,bind:bind};
})();