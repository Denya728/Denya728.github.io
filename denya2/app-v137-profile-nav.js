/* SWEETLAB v137 — Profile navigation hard fix */
(function(){
'use strict';
function bind(){
  var b=document.querySelector('nav button[data-view="profile"]');
  if(!b)return;
  b.onclick=function(e){
    if(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();}
    var p=window.__DENYA_PROFILE_V114;
    if(p&&typeof p.open==='function') return p.open(e);
    if(p&&typeof p.render==='function') return p.render('company');
    if(window.views&&typeof window.views.profile==='function') return window.views.profile();
    return false;
  };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
[100,400,900,1600,2500].forEach(function(ms){setTimeout(bind,ms);});
new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
})();