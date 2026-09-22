/* DENYA v114 — surgical Profile navigation + plan preservation
   ONLY fixes:
   1) Payments -> Plantillas/other Profile tabs navigation
   2) Profile Plan must read the existing subscription from Supabase
*/
(function(){
  'use strict';

  const SUPA_URL='https://kcinhsldmnvhudivutzv.supabase.co';
  const SUPA_KEY='sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs';

  function go(tab){
    if(typeof window.renderProfile==='function'){
      return window.renderProfile(tab);
    }
    return false;
  }

  function patchPaymentNavigation(){
    if(window.DENYA_v114_paymentPatched || !window.DENYAPayments || typeof window.DENYAPayments.render!=='function') return;
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
        const tab=map[String(btn.textContent||'').trim()];
        if(!tab)return;
        btn.onclick=function(ev){
          if(ev){ev.preventDefault();ev.stopPropagation();}
          return go(tab);
        };
      });
      return result;
    };
    window.__v105Navigate=function(tab){return go(tab)};
    window.DENYA_v114_paymentPatched=true;
  }

  async function syncRealPlan(){
    try{
      const client=window.supabase?.createClient?.(SUPA_URL,SUPA_KEY);
      if(!client)return null;
      const user=(await client.auth.getUser()).data.user;
      if(!user)return null;

      let org=window.DENYACloud?.context?.organization?.id||localStorage.getItem('denya_active_org')||'';
      if(!org){
        const q=await client.from('organizations')
          .select('id').eq('owner_user_id',user.id).eq('active',true)
          .order('created_at',{ascending:true}).limit(1).maybeSingle();
        org=q.data?.id||'';
        if(org)localStorage.setItem('denya_active_org',org);
      }
      if(!org)return null;

      const q=await client.from('subscriptions')
        .select('plan_code,status,billing_cycle')
        .eq('organization_id',org).maybeSingle();
      if(q.error||!q.data)return null;

      const code=String(q.data.plan_code||'').toLowerCase();
      const plan=code==='pro'?'Pro':code==='negocio'?'Negocio':code==='emprende'?'Emprende':null;
      if(!plan)return null;

      window.state=window.state||{};
      state.subscription=state.subscription||{};
      state.subscription.plan=plan;
      state.subscription.billing=q.data.billing_cycle==='annual'?'Anual':'Mensual';
      state.subscription.status=q.data.status==='active'?'Activa':q.data.status==='trialing'?'Prueba':q.data.status;
      state.plan=plan;
      if(typeof window.save==='function')window.save();
      return plan;
    }catch(_){return null}
  }

  function patchPlanDisplay(plan){
    if(!plan)return;
    const current=document.querySelector('.v112current h3');
    if(current)current.textContent=plan;

    document.querySelectorAll('.v112plans .v112-plan,.v112plans .v112plan').forEach(card=>{
      const title=card.querySelector('h3');
      if(!title)return;
      const name=String(title.textContent||'').trim();
      const active=name===plan;
      card.classList.toggle('active',active);
      const eyebrow=card.querySelector('.v112-ey');
      if(eyebrow)eyebrow.textContent=active?'Plan actual':'Disponible';
      const button=card.querySelector('button');
      if(button)button.textContent=active?'Administrar':'Cambiar a '+name;
    });
  }

  function install(){
    patchPaymentNavigation();

    if(typeof window.renderProfile==='function' && !window.DENYA_v114_renderPatched){
      const original=window.renderProfile;
      window.renderProfile=async function(tab){
        if(tab==='account'){
          const plan=await syncRealPlan();
          const result=await original.apply(this,arguments);
          patchPlanDisplay(plan);
          return result;
        }
        return original.apply(this,arguments);
      };
      window.DENYA_v114_renderPatched=true;
    }
  }

  install();
  setTimeout(install,250);
  setTimeout(install,1000);
})();