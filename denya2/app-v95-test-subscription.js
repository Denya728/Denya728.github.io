// DENYA SWEETLAB v95 · controlled plan switching for QA account
(function(){
  const TEST_EMAIL='denilochoa24@gmail.com';
  const SUPABASE_URL='https://kcinhsldmnvhudivutzv.supabase.co';
  const SUPABASE_KEY='sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs';

  async function changeTestPlan(code){
    const normalized=String(code||'').toLowerCase();
    if(!['emprende','negocio','pro'].includes(normalized))return;
    const client=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_KEY);
    if(!client){toast?.('No se pudo conectar con DENYA.');return;}
    const {data:{user}}=await client.auth.getUser();
    if(String(user?.email||'').toLowerCase()!==TEST_EMAIL){
      if(typeof DENYAGateway?.requestPlanChange==='function')return DENYAGateway.requestPlanChange(code);
      return;
    }
    const btns=[...document.querySelectorAll('button')].filter(b=>b.textContent.includes('Cambiar a')||b.textContent.includes('Continuar con'));
    btns.forEach(b=>b.disabled=true);
    try{
      const {data,error}=await client.functions.invoke('denya-workspace',{body:{action:'test_change_plan',plan_code:normalized}});
      if(error||!data?.ok)throw new Error(error?.message||data?.error||'No se pudo cambiar el plan.');
      const sub=data.subscription;
      state.subscription=state.subscription||{};
      state.subscription.plan=normalized==='pro'?'Pro':normalized==='negocio'?'Negocio':'Emprende';
      state.subscription.billing=sub.billing_cycle==='annual'?'Anual':'Mensual';
      state.subscription.status=sub.status==='active'?'Activa':sub.status==='trialing'?'Prueba':sub.status;
      state.subscription.provider=sub.provider||null;
      state.subscription.providerSubscriptionId=sub.provider_subscription_id||null;
      state.subscription.trialEndsAt=sub.trial_ends_at||state.subscription.trialEndsAt||null;
      state.subscription.renewsAt=sub.current_period_ends_at||state.subscription.renewsAt||null;
      state.subscription.cancelAtPeriodEnd=!!sub.cancel_at_period_end;
      state.plan=state.subscription.plan;
      if(typeof save==='function')save();
      if(typeof toast==='function')toast('Plan de prueba cambiado a '+state.subscription.plan);
      if(typeof show==='function')show('subscription');
    }catch(err){
      if(typeof toast==='function')toast(err.message||'No se pudo cambiar el plan.');
    }finally{
      btns.forEach(b=>b.disabled=false);
    }
  }

  const install=()=>{
    if(!window.DENYAGateway)return;
    const original=window.DENYAGateway.requestPlanChange;
    window.DENYAGateway.requestPlanChange=async function(name){
      try{
        const client=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_KEY);
        const {data:{user}}=client?await client.auth.getUser():{data:{user:null}};
        if(String(user?.email||'').toLowerCase()===TEST_EMAIL)return changeTestPlan(name);
      }catch(_){}
      return original?.(name);
    };
    const originalChoose=window.DENYAGateway.choosePlan;
    window.DENYAGateway.choosePlan=async function(code){
      try{
        const client=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_KEY);
        const {data:{user}}=client?await client.auth.getUser():{data:{user:null}};
        if(String(user?.email||'').toLowerCase()===TEST_EMAIL)return changeTestPlan(code);
      }catch(_){}
      return originalChoose?.(code);
    };
  };
  setTimeout(install,250);
  setTimeout(install,1000);
})();