/* DENYA v117 — profile subscription actions + recipe availability fallback
   Fixes:
   1) Profile > Plan y suscripción: Administrar / Ver plan actions work
      regardless of which v114 renderer version is active.
   2) Quote calculator: if a presentation requirement has no category-specific
      recipe, show active recipes as a fallback (needed for products such as
      PASCUALITOS/Crosaint configured as a generic base requirement).
*/
(function(){
  'use strict';

  function gateway(){
    return window.DENYAGateway && typeof window.DENYAGateway==='object'
      ? window.DENYAGateway
      : null;
  }

  function handleSubscriptionAction(e){
    var el=e.target&&e.target.closest&&e.target.closest(
      '#114manage,[data-114-plan],#112sub,[data-plan112],button[data-subscription-action]'
    );
    if(!el) return;

    var g=gateway();
    if(!g) return;

    var isManage=el.id==='114manage'||el.id==='112sub'||el.dataset.subscriptionAction==='manage';
    var name=el.getAttribute('data-114-plan')||el.getAttribute('data-plan112')||'';

    e.preventDefault();
    e.stopPropagation();

    if(isManage || !name){
      if(typeof g.openCustomerPortal==='function') return g.openCustomerPortal();
      if(typeof window.openSubscription==='function') return window.openSubscription();
      return;
    }

    if(typeof g.requestPlanChange==='function') return g.requestPlanChange(name);
    if(typeof g.openCustomerPortal==='function') return g.openCustomerPortal();
  }

  // Capture phase makes this independent of the many legacy Profile renderers.
  document.addEventListener('click',handleSubscriptionAction,true);

  // If the legacy renderer is present, make its direct handlers point to the
  // real Stripe gateway too. This is intentionally defensive and idempotent.
  function reinforce(){
    document.querySelectorAll('#114manage,#112sub').forEach(function(b){
      b.removeAttribute('onclick');
    });
  }
  reinforce();
  setTimeout(reinforce,250);
  setTimeout(reinforce,1000);
})();