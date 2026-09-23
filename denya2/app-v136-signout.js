/* SWEETLAB v136 — restore sign out control */
(function(){
  'use strict';
  function add(){
    var root=document.getElementById('denya114');
    if(!root||root.querySelector('#v136-signout'))return;
    var body=root.querySelector('.pbody'); if(!body)return;
    var box=document.createElement('div');
    box.id='v136-signout';
    box.style.cssText='margin-top:15px;padding:16px 20px;border:1px solid #e3d9d1;border-radius:18px;background:#fff;display:flex;align-items:center;justify-content:space-between;gap:15px';
    box.innerHTML='<div><div style="font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#9a806f;font-weight:850">Cuenta</div><b style="display:block;margin-top:4px">Cerrar sesión</b><span style="font-size:12px;color:#7c7068">Salir de tu cuenta de SWEETLAB en este dispositivo.</span></div><button id="v136-logout" class="secondary" type="button">Cerrar sesión</button>';
    body.appendChild(box);
    var b=box.querySelector('#v136-logout');
    b.onclick=async function(){
      b.disabled=true;b.textContent='Cerrando…';
      try{
        if(window.supabase&&typeof window.supabase.auth?.signOut==='function') await window.supabase.auth.signOut();
        else if(window.DENYACloud&&typeof window.DENYACloud.signOut==='function') await window.DENYACloud.signOut();
      }catch(e){}
      try{localStorage.removeItem('denya_active_org');}catch(e){}
      location.reload();
    };
  }
  function run(){add();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  [300,800,1500,2500].forEach(function(ms){setTimeout(run,ms);});
  new MutationObserver(function(){if(document.getElementById('denya114'))add();}).observe(document.body,{childList:true,subtree:true});
})();