/* SWEETLAB v133 — final UI fixes
   1) Company logo upload is always available in Profile > Empresa.
   2) Inventory & Purchases / Reports never display plan-lock padlocks.
*/
(function(){
  'use strict';
  function css(){
    if(document.getElementById('v133fixcss'))return;
    var s=document.createElement('style');s.id='v133fixcss';s.textContent=`
      .nav button[data-view="inventory"].plan-locked,
      .nav button[data-view="reports"].plan-locked{opacity:1!important}
      .nav button[data-view="inventory"]::after,
      .nav button[data-view="inventory"].plan-locked::after,
      .nav button[data-view="reports"]::after,
      .nav button[data-view="reports"].plan-locked::after{content:none!important;display:none!important}
      .plan-gate-card .lock,.v33-lock{display:none!important}
      #v133-logo-box{display:flex;align-items:center;gap:14px;padding:14px 0}
      #v133-logo-preview{width:76px;height:76px;border:1px solid #e3d9d1;border-radius:18px;background:#fff;display:grid;place-items:center;overflow:hidden;font-size:25px}
      #v133-logo-preview img{width:100%;height:100%;object-fit:contain}
      #v133-logo-file{width:100%}
    `;document.head.appendChild(s);
  }
  function profile(){window.state=window.state||{};state.profile=state.profile||{};return state.profile}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function installLogo(){
    var root=document.getElementById('denya114');
    if(!root)return;
    var body=root.querySelector('.pbody');
    if(!body||body.querySelector('#v133-logo-file'))return;
    var cards=body.querySelectorAll('.card');
    if(!cards.length)return;
    var target=cards[cards.length-1];
    var p=profile();
    var html='<div class="ey">Identidad visual</div><h3>Logotipo de la empresa</h3><p>Sube el logo que quieres utilizar en cotizaciones y documentos.</p><div id="v133-logo-box"><div id="v133-logo-preview">'+(p.logo?'<img src="'+esc(p.logo)+'">':'✦')+'</div><div style="flex:1"><input id="v133-logo-file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"><small style="display:block;color:#8a7b72;margin-top:6px">PNG, JPG, WEBP o SVG · máximo 2.5 MB</small></div></div>';
    target.innerHTML=html+target.innerHTML;
    var input=document.getElementById('v133-logo-file');
    if(input)input.onchange=function(){
      var f=input.files&&input.files[0];if(!f)return;
      if(f.size>2500000){alert('El logo debe pesar menos de 2.5 MB.');input.value='';return;}
      var rd=new FileReader();
      rd.onload=function(){
        var pr=profile();pr.logo=rd.result;
        var pv=document.getElementById('v133-logo-preview');if(pv)pv.innerHTML='<img src="'+esc(pr.logo)+'">';
        if(typeof window.save==='function')window.save();
      };
      rd.readAsDataURL(f);
    };
  }
  function cleanLocks(){
    document.querySelectorAll('.nav button[data-view="inventory"].plan-locked,.nav button[data-view="reports"].plan-locked').forEach(function(b){
      b.classList.remove('plan-locked');b.removeAttribute('title');
    });
    document.querySelectorAll('.plan-gate-card .lock,.v33-lock').forEach(function(x){x.remove()});
  }
  function run(){css();cleanLocks();installLogo();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setTimeout(run,300);setTimeout(run,1000);setTimeout(run,2000);
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
})();