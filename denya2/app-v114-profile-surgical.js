/* DENYA v114 — surgical Profile navigation + plan preservation
   ONLY fixes:
   1) Payments -> Plantillas/other Profile tabs navigation
   2) Profile Plan display must use the existing real plan (never default to Negocio)
*/
(function(){
  'use strict';

  function go(tab){
    if(typeof window.renderProfile==='function'){
      window.renderProfile(tab);
      return false;
    }
    return true;
  }

  // Keep the existing Payments screen exactly as-is, but make its Profile tabs
  // use the current Profile renderer instead of the legacy navigation path.
  function patchPaymentNavigation(){
    if(!window.DENYAPayments || typeof window.DENYAPayments.render!=='function') return;
    if(window.DENYA_v114_paymentPatched) return;
    const original=window.DENYAPayments.render;
    window.DENYAPayments.render=async function(){
      const result=await original.apply(this,arguments);
      const buttons=[...document.querySelectorAll('.v58-account-tabs button')];
      const map={
        'Empresa':'company',
        'Suscripción':'account',
        'Plan y suscripción':'account',
        'Personalización':'customization',
        'Pagos':'payments',
        'Plantillas':'templates',
        'Usuarios':'users',
        'Ayuda y soporte':'support',
        'Soporte':'support'
      };
      buttons.forEach(btn=>{
        const key=String(btn.textContent||'').trim();
        const tab=map[key];
        if(!tab) return;
        btn.onclick=function(ev){
          if(ev){ev.preventDefault();ev.stopPropagation();}
          return go(tab);
        };
      });
      return result;
    };
    window.DENYA_v114_paymentPatched=true;
  }

  // v113 must not invent a fallback plan. Read the plan already maintained by
  // the existing plan-permissions/subscription system.
  function realPlan(){
    try{
      if(window.DenyaPlanV54 && typeof window.DenyaPlanV54.currentPlan==='function'){
        const p=window.DenyaPlanV54.currentPlan();
        if(p) return p;
      }
    }catch(_){}
    const s=window.state && state.subscription;
    if(s && (s.plan==='Emprende'||s.plan==='Negocio'||s.plan==='Pro')) return s.plan;
    if(window.state && (state.plan==='Emprende'||state.plan==='Negocio'||state.plan==='Pro')) return state.plan;
    return null;
  }

  function patchPlanDisplay(){
    const p=realPlan();
    if(!p) return;
    // Correct only the Profile plan panel if it was rendered with a fallback.
    const current=document.querySelector('.v112current h3');
    if(current) current.textContent=p;
    document.querySelectorAll('.v112plans .v112-plan, .v112plans .v112plan').forEach(card=>{
      const title=card.querySelector('h3');
      if(!title) return;
      const name=String(title.textContent||'').trim();
      const active=name===p;
      card.classList.toggle('active',active);
      const eyebrow=card.querySelector('.v112-ey');
      if(eyebrow) eyebrow.textContent=active?'Plan actual':'Disponible';
      const button=card.querySelector('button');
      if(button) button.textContent=active?'Administrar':'Cambiar a '+name;
    });
  }

  // Patch after the v113 renderer is available.
  function install(){
    patchPaymentNavigation();

    if(typeof window.renderProfile==='function' && !window.DENYA_v114_renderPatched){
      const original=window.renderProfile;
      window.renderProfile=async function(tab){
        const result=await original.apply(this,arguments);
        if(tab==='account') patchPlanDisplay();
        return result;
      };
      window.DENYA_v114_renderPatched=true;
    }
  }

  install();
  setTimeout(install,250);
  setTimeout(install,1000);
})();