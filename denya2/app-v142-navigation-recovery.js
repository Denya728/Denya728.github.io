/* DENYA v142 — navigation recovery
   Bypasses legacy show() wrappers for primary navigation only.
*/
(function(){
  'use strict';
  function go(v){
    try{
      if(typeof setActive==='function') setActive(v);
      if(window.views && typeof window.views[v]==='function'){
        window.views[v]();
      }else if(typeof views!=='undefined' && typeof views[v]==='function'){
        views[v]();
      }else{
        throw new Error('Vista no disponible: '+v);
      }
      window.scrollTo({top:0,behavior:'smooth'});
    }catch(e){
      console.error('DENYA v142 navigation:',v,e);
      var c=document.getElementById('content');
      if(c)c.innerHTML='<div class="section"><h2>No se pudo cargar esta sección</h2><p class="muted">Error de navegación: '+String(e&&e.message||e).replace(/[<>&"]/g,'')+'</p><button class="primary" onclick="location.reload()">Recargar</button></div>';
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
  window.DENYAV142={go:go};
})();
