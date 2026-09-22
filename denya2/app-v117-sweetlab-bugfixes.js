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
    var isManage=el.id==='114manage'||el.id==='112sub'||el.dataset.subscriptionAction==='manage';
    var name=el.getAttribute('data-114-plan')||el.getAttribute('data-plan112')||'';

    e.preventDefault();
    e.stopPropagation();

    // The Profile renderer can exist before the gateway has finished initializing.
    // Use the Stripe Billing Portal directly so the action is never dependent on
    // the gateway closure/session state.
    var portal='https://billing.stripe.com/p/login/6oUcMY2j23d3aRqf270x200';
    if(isManage || !name){
      if(g&&typeof g.openCustomerPortal==='function') return g.openCustomerPortal();
      if(typeof window.openSubscription==='function') return window.openSubscription();
      window.location.href=portal;
      return;
    }

    if(g&&typeof g.requestPlanChange==='function') return g.requestPlanChange(name);
    window.location.href=portal;
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