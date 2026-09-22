/* DENYA v115 — targeted profile fixes only */
(function(){
  function install(){
    var root=document.getElementById('content');
    var profile=window.__DENYA_PROFILE_V114;
    if(!root||!profile||typeof profile.render!=='function') return;

    // Keep the standalone Profile renderer authoritative after Payments.
    window.renderProfile=function(tab){
      if(tab==='subscription') tab='account';
      return profile.render(tab||'company');
    };
    window.__v105Navigate=function(tab){
      return window.renderProfile(tab);
    };

    // Fix only the two subscription actions in Plan y suscripción.
    if(!root.__denya115Bound){
      root.__denya115Bound=true;
      root.addEventListener('click',function(e){
        var manage=e.target.closest&&e.target.closest('#114manage');
        if(manage){
          e.preventDefault();
          if(window.DENYAGateway&&typeof window.DENYAGateway.openCustomerPortal==='function')
            return window.DENYAGateway.openCustomerPortal();
          if(typeof window.openSubscription==='function')
            return window.openSubscription();
          if(window.views&&typeof window.views.subscription==='function')
            return window.views.subscription();
          if(typeof window.toast==='function')
            window.toast('El portal de suscripción todavía no está disponible para esta cuenta.');
          return;
        }
        var plan=e.target.closest&&e.target.closest('[data-114-plan]');
        if(plan){
          e.preventDefault();
          var name=plan.getAttribute('data-114-plan');
          if(window.DENYAGateway&&typeof window.DENYAGateway.requestPlanChange==='function')
            return window.DENYAGateway.requestPlanChange(name);
          if(window.DENYAGateway&&typeof window.DENYAGateway.openCustomerPortal==='function')
            return window.DENYAGateway.openCustomerPortal();
          if(typeof window.toast==='function')
            window.toast('La gestión del plan se abrirá desde el flujo de suscripción.');
        }
      });
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install);
  else install();
  setTimeout(install,300);
  setTimeout(install,1000);
})();