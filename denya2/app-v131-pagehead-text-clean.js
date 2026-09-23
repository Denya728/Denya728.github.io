(function(){
'use strict';
function clean(){
 const c=document.getElementById('content'); if(!c)return;
 const title=(document.getElementById('title')?.textContent||'').toLowerCase();
 const h=c.querySelector('.page-head h1');
 const sub=c.querySelector('.page-head .muted');
 const head=(h?.textContent||'').toLowerCase();
 if(!/inventario|compras/.test(title+' '+head))return;
 const ph=c.querySelector('.page-head');
 if(ph){
  ph.style.setProperty('background','transparent','important');
  ph.style.setProperty('background-image','none','important');
  ph.querySelectorAll('*').forEach(el=>{el.style.setProperty('background-image','none','important');el.style.setProperty('text-shadow','none','important');});
  if(sub){sub.style.setProperty('position','relative','important');sub.style.setProperty('z-index','10','important');sub.style.setProperty('background','transparent','important');}
  if(!document.getElementById('v131-style')){const s=document.createElement('style');s.id='v131-style';s.textContent='.page-head::before,.page-head::after{content:none!important;display:none!important;background:none!important;background-image:none!important}';document.head.appendChild(s);}
 }
}
clean();new MutationObserver(clean).observe(document.body,{childList:true,subtree:true});window.addEventListener('load',clean);
})();