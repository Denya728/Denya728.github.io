/* SWEETLAB v134 — logo single-source UI fix
   - Only one logo uploader in Perfil > Empresa.
   - The uploaded logo is also rendered in the company circle.
   - Reuses the saved state.profile.logo everywhere.
*/
(function(){
  'use strict';

  function esc(v){
    return String(v||'').replace(/[&<>"']/g,function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
  }
  function profile(){
    window.state=window.state||{};
    state.profile=state.profile||{};
    return state.profile;
  }
  function css(){
    if(document.getElementById('v134fixcss')) return;
    var s=document.createElement('style');
    s.id='v134fixcss';
    s.textContent=`
      #v134-logo-box{display:flex;align-items:center;gap:14px;padding:14px 0}
      #v134-logo-preview{width:76px;height:76px;border:1px solid #e3d9d1;border-radius:18px;background:#fff;display:grid;place-items:center;overflow:hidden;font-size:25px}
      #v134-logo-preview img{width:100%;height:100%;object-fit:contain}
      #v134-logo-file{width:100%}
      #denya114 .hero .logo img{width:100%;height:100%;object-fit:contain;background:#fff;border-radius:inherit}
    `;
    document.head.appendChild(s);
  }

  function setHeroLogo(){
    var root=document.getElementById('denya114');
    if(!root) return;
    var p=profile();
    var heroLogo=root.querySelector('.hero .logo');
    if(!heroLogo) return;
    if(p.logo){
      heroLogo.innerHTML='<img src="'+esc(p.logo)+'" alt="Logo">';
      heroLogo.style.background='#fff';
    }
  }

  function ensureUploader(){
    var root=document.getElementById('denya114');
    if(!root) return;
    var body=root.querySelector('.pbody');
    if(!body) return;

    /* If the authoritative renderer already supplied the uploader, reuse it. */
    var existing=document.getElementById('114logo');
    if(existing){
      setHeroLogo();
      return;
    }

    /* Remove a previous v133 insertion, if any. */
    document.querySelectorAll('#v133-logo-box,#v133-logo-file').forEach(function(x){
      var box=x.id==='v133-logo-box'?x:x.closest('#v133-logo-box');
      if(box) box.remove();
      else x.remove();
    });

    var cards=body.querySelectorAll('.card');
    if(!cards.length) return;
    var target=cards[cards.length-1];
    var p=profile();

    var block=document.createElement('div');
    block.id='v134-logo-card';
    block.innerHTML=
      '<div class="ey">Identidad visual</div>'+
      '<h3>Logotipo de la empresa</h3>'+
      '<p>Sube el logo que quieres utilizar en cotizaciones y documentos.</p>'+
      '<div id="v134-logo-box" style="display:flex;align-items:center;gap:14px;padding:12px 0 16px">'+
        '<div id="v134-logo-preview">'+(p.logo?'<img src="'+esc(p.logo)+'" alt="Logo">':'✦')+'</div>'+
        '<div style="flex:1">'+
          '<input id="v134-logo-file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml">'+
          '<small style="display:block;color:#8a7b72;margin-top:6px">PNG, JPG, WEBP o SVG · máximo 2.5 MB</small>'+
        '</div>'+
      '</div>';

    target.insertBefore(block,target.firstChild);

    var input=document.getElementById('v134-logo-file');
    if(input) input.onchange=function(){
      var f=input.files&&input.files[0];
      if(!f) return;
      if(f.size>2500000){
        alert('El logo debe pesar menos de 2.5 MB.');
        input.value='';
        return;
      }
      var rd=new FileReader();
      rd.onload=function(){
        var p=profile();
        p.logo=rd.result;
        var preview=document.getElementById('v134-logo-preview');
        if(preview) preview.innerHTML='<img src="'+esc(p.logo)+'" alt="Logo">';
        setHeroLogo();
        if(typeof window.save==='function') window.save();
      };
      rd.readAsDataURL(f);
    };
    setHeroLogo();
  }

  function cleanLocks(){
    document.querySelectorAll('.nav button[data-view="inventory"]::after,.nav button[data-view="reports"]::after');
    document.querySelectorAll('.nav button[data-view="inventory"].plan-locked,.nav button[data-view="reports"].plan-locked')
      .forEach(function(b){b.style.opacity='1';b.removeAttribute('title');});
  }

  function run(){
    css();
    ensureUploader();
    setHeroLogo();
    cleanLocks();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);
  else run();

  [300,700,1500,2500].forEach(function(ms){setTimeout(run,ms);});

  new MutationObserver(function(){
    if(!document.getElementById('denya114')) return;
    run();
  }).observe(document.body,{childList:true,subtree:true});
})();