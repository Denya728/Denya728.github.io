/* DENYA v142 — navigation recovery */
(function(){
  'use strict';
  function go(v){
    try{
      var map=window.DENYAVIEWS;
      if(!map||typeof map[v]!=='function') throw new Error('Vista no disponible: '+v);
      if(typeof setActive==='function') setActive(v);
      map[v]();
      window.scrollTo({top:0,behavior:'smooth'});
    }catch(e){
      console.error('DENYA navigation:',v,e);
      var c=document.getElementById('content');
      if(c)c.innerHTML='<div class="section"><h2>No se pudo cargar esta sección</h2><p class="muted">Error de navegación: '+String(e&&e.message||e).replace(/[<>&"]/g,'')+'</p><button class="primary" onclick="location.reload()">Recargar</button></div>';
    }
  }
  function boot(){
    var home=window.DENYAVIEWS&&window.DENYAVIEWS.home;
    if(typeof home==='function'){
      if(typeof setActive==='function') setActive('home');
      home();
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
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else setTimeout(boot,0);
  window.DENYAV142={go:go};
})();