/* SWEETLAB v135 — single company logo uploader
   Removes the extra v133/v134 uploader and makes the original 114 uploader authoritative.
*/
(function(){
  'use strict';
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
  function p(){window.state=window.state||{};state.profile=state.profile||{};return state.profile;}
  function clean(){
    document.querySelectorAll('#v133-logo-box,#v133-logo-file,#v134-logo-card,#v134-logo-box,#v134-logo-file').forEach(function(x){x.remove();});
    var root=document.getElementById('denya114'); if(!root)return;
    var inputs=root.querySelectorAll('input[type="file"]');
    if(inputs.length>1){for(var i=1;i<inputs.length;i++)inputs[i].remove();}
    var input=root.querySelector('#114logo')||root.querySelector('input[type="file"]');
    if(!input)return;
    input.id='114logo';
    input.accept='image/png,image/jpeg,image/webp,image/svg+xml';
    input.onchange=function(){
      var f=input.files&&input.files[0]; if(!f)return;
      if(f.size>2500000){alert('El logo debe pesar menos de 2.5 MB.');input.value='';return;}
      var rd=new FileReader();
      rd.onload=function(){
        p().logo=rd.result;
        var hero=root.querySelector('.hero .logo');
        if(hero)hero.innerHTML='<img src="'+esc(rd.result)+'" alt="Logo" style="width:100%;height:100%;object-fit:contain;background:#fff;border-radius:inherit">';
        var preview=root.querySelector('#114logoPreview');
        if(preview)preview.innerHTML='<img src="'+esc(rd.result)+'" alt="Logo" style="width:100%;height:100%;object-fit:contain;background:#fff">';
        if(typeof window.save==='function')window.save();
      };
      rd.readAsDataURL(f);
    };
    var logo=p().logo;
    if(logo){
      var hero=root.querySelector('.hero .logo');
      if(hero)hero.innerHTML='<img src="'+esc(logo)+'" alt="Logo" style="width:100%;height:100%;object-fit:contain;background:#fff;border-radius:inherit">';
      var preview=root.querySelector('#114logoPreview');
      if(preview)preview.innerHTML='<img src="'+esc(logo)+'" alt="Logo" style="width:100%;height:100%;object-fit:contain;background:#fff">';
    }
    document.querySelectorAll('.nav button[data-view="inventory"].plan-locked,.nav button[data-view="reports"].plan-locked').forEach(function(b){b.classList.remove('plan-locked');b.style.opacity='1';b.removeAttribute('title');});
  }
  function run(){clean();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  [250,600,1200,2200].forEach(function(ms){setTimeout(run,ms);});
  new MutationObserver(function(){if(document.getElementById('denya114'))run();}).observe(document.body,{childList:true,subtree:true});
})();