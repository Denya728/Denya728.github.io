/* SWEETLAB v138 — Profile guaranteed open */
(function(){
'use strict';
function fallback(){
  var c=document.getElementById('content'); if(!c)return;
  c.innerHTML='<div id="denya114" class="profile-v114"><div class="phead"><div><div class="ey">Cuenta</div><h1>Perfil</h1><p class="muted">Administra tu cuenta y tu empresa.</p></div></div><div class="pbody"><div class="card"><div class="ey">Empresa</div><h2>Empresa</h2><p class="muted">Aquí puedes administrar los datos de tu empresa y su identidad visual.</p><button class="primary" id="v138-company">Abrir configuración de empresa</button></div></div></div>';
  var b=document.getElementById('v138-company');
  if(b)b.onclick=function(){var p=window.__DENYA_PROFILE_V114;if(p&&p.render)p.render('company');};
}
function open(e){
  if(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}
  var p=window.__DENYA_PROFILE_V114;
  if(p&&typeof p.render==='function'){
    try{
      var x=p.render('company');
      if(x&&typeof x.catch==='function')x.catch(function(){fallback();});
      setTimeout(function(){if(!document.getElementById('denya114'))fallback();},1200);
      return false;
    }catch(err){fallback();return false;}
  }
  fallback();return false;
}
function bind(){
 var b=document.querySelector('nav button[data-view="profile"]');
 if(!b)return;
 b.onclick=open;
 b.addEventListener('click',open,true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
[200,700,1500,3000].forEach(function(ms){setTimeout(bind,ms);});
})();