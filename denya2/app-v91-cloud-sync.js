// DENYA v91 · Supabase cloud workspace sync + multi-device authority
(function(){
  const URL='https://kcinhsldmnvhudivutzv.supabase.co';
  const KEY='sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs';
  if(!window.supabase?.createClient)return;
  const sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const localSave=typeof save==='function'?save:()=>{};
  let remoteReady=false,revision=0,dirty=false,saving=false,saveTimer=null,mirrorTimer=null,pollTimer=null,lastSessionId=null;
  let context=null,baseSnapshot=null;

  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  function status(text,mode='ok'){
    let el=document.getElementById('v91CloudStatus');
    const bar=document.querySelector('.v76-session-bar');
    if(!bar)return;
    if(!el){
      el=document.createElement('span');
      el.id='v91CloudStatus';
      el.className='v91-cloud-status';
      const admin=document.getElementById('v76AdminSlot');
      if(admin)admin.insertAdjacentElement('afterend',el); else bar.prepend(el);
    }
    el.dataset.mode=mode;
    el.textContent=text;
  }
  function currentView(){
    return document.querySelector('.nav button.active')?.dataset?.view||'home';
  }
  function snap(v){try{return JSON.parse(JSON.stringify(v))}catch(_){return {}}}
  function changedTopLevelKeys(){
    const a=state&&typeof state==='object'?state:{},b=baseSnapshot&&typeof baseSnapshot==='object'?baseSnapshot:{};
    const keys=new Set([...Object.keys(a),...Object.keys(b)]),out=[];
    for(const k of keys){
      try{if(JSON.stringify(a[k])!==JSON.stringify(b[k]))out.push(k)}catch(_){out.push(k)}
    }
    return out;
  }
  function applyContext(ctx){
    if(!ctx||typeof state==='undefined')return;
    context=ctx;
    const sub=ctx.subscription||{},p=ctx.plan||{};
    const planName=p.name||(sub.plan_code==='pro'?'Pro':sub.plan_code==='negocio'?'Negocio':'Emprende');
    state.plan=planName;
    state.subscription=state.subscription||{};
    Object.assign(state.subscription,{
      plan:planName,
      billing:sub.billing_cycle==='annual'?'Anual':'Mensual',
      status:sub.status==='active'?'Activa':sub.status==='trialing'?'Prueba':sub.status==='past_due'?'Pago pendiente':sub.status==='canceled'?'Cancelada':sub.status||state.subscription.status,
      provider:sub.provider||null,
      providerSubscriptionId:sub.provider_subscription_id||null,
      providerCustomerId:sub.provider_customer_id||null,
      paymentMethod:sub.provider==='stripe'?'Stripe':(sub.payment_method_type==='later'?'Pendiente':'Sin método'),
      paymentMethodStatus:sub.payment_method_status||null,
      trialEndsAt:sub.trial_ends_at||null,
      renewsAt:sub.current_period_ends_at||null,
      cancelAtPeriodEnd:!!sub.cancel_at_period_end
    });
    state.__cloud=state.__cloud||{};
    state.__cloud.plan_code=sub.plan_code||p.code||'emprende';
    state.__cloud.features=p.features||{};
    state.__cloud.user_limit=p.user_limit||1;
    state.__cloud.brand_limit=p.brand_limit||1;
    state.__cloud.role=ctx.role||null;
  }
  async function invoke(body){
    const {data,error}=await sb.functions.invoke('denya-workspace',{body});
    if(error)throw error;
    if(data?.error)throw new Error(data.error);
    return data;
  }
  async function loadRemote({rerender=true,force=false}={}){
    const {data:{session}}=await sb.auth.getSession();
    if(!session?.user?.id)return false;
    lastSessionId=session.user.id;
    localStorage.setItem('denya_active_user',session.user.id);
    const data=await invoke({action:'load'});
    context=data.context||context;
    if(data.state&&typeof data.state==='object'){
      if(force||!remoteReady||Number(data.revision)>revision){
        state=data.state;
        applyContext(data.context);
        revision=Number(data.revision)||0;
        baseSnapshot=snap(state);
        localSave();
        dirty=false;
        if(rerender){
          await wait(30);
          try{show(currentView())}catch(_){}
        }
      }
    }else{
      applyContext(data.context);
      localSave();
      const first=await invoke({action:'save',state,base_revision:0,changed_keys:Object.keys(state||{})});
      if(first.state)state=first.state;
      revision=Number(first.revision)||1;
      applyContext(first.context);
      baseSnapshot=snap(state);
      localSave();
      await invoke({action:'mirror'}).catch(()=>{});
    }
    remoteReady=true;
    status('☁ Sincronizado','ok');
    window.dispatchEvent(new CustomEvent('denya:cloud-ready',{detail:{context,revision}}));
    return true;
  }
  async function pushRemote(){
    if(!remoteReady||saving||!dirty)return;
    const {data:{session}}=await sb.auth.getSession();
    if(!session?.user?.id)return;
    saving=true;status('☁ Guardando…','busy');
    try{
      const changed=changedTopLevelKeys();
      if(!changed.length){dirty=false;status('☁ Sincronizado','ok');return}
      const data=await invoke({action:'save',state,base_revision:revision,changed_keys:changed});
      if(data.state)state=data.state;
      revision=Number(data.revision)||revision;
      applyContext(data.context);
      baseSnapshot=snap(state);
      localSave();
      dirty=false;
      status(data.conflict_merged?'☁ Cambios combinados con otro dispositivo':'☁ Sincronizado','ok');
      clearTimeout(mirrorTimer);
      mirrorTimer=setTimeout(()=>invoke({action:'mirror'}).catch(e=>console.warn('DENYA mirror',e)),3500);
    }catch(e){
      console.error('DENYA cloud save',e);
      status('☁ Pendiente de sincronizar','warn');
    }finally{saving=false}
  }
  function schedulePush(){
    if(!remoteReady)return;
    dirty=true;
    status('☁ Cambios pendientes','busy');
    clearTimeout(saveTimer);
    saveTimer=setTimeout(pushRemote,900);
  }
  if(typeof save==='function'){
    save=function(){
      localSave();
      schedulePush();
    };
  }

  async function poll(){
    if(!remoteReady||dirty||saving)return;
    try{
      const data=await invoke({action:'load'});
      if(Number(data.revision)>revision){
        state=data.state||state;
        applyContext(data.context);
        revision=Number(data.revision)||revision;
        baseSnapshot=snap(state);
        localSave();
        try{show(currentView())}catch(_){}
        status('☁ Actualizado desde otro dispositivo','ok');
      }
    }catch(e){status('☁ Sin conexión','warn')}
  }
  async function boot(){
    try{
      const {data:{session}}=await sb.auth.getSession();
      if(session?.user?.id){
        await wait(500);
        await loadRemote({rerender:true});
      }
    }catch(e){console.error('DENYA cloud boot',e);status('☁ Sin sincronizar','warn')}
    clearInterval(pollTimer);pollTimer=setInterval(poll,12000);
  }
  sb.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_OUT'){
      remoteReady=false;revision=0;dirty=false;context=null;baseSnapshot=null;lastSessionId=null;
      return;
    }
    if(session?.user?.id&&session.user.id!==lastSessionId)setTimeout(()=>loadRemote({rerender:true,force:true}).catch(console.error),600);
  });

  window.DENYACloud={
    get ready(){return remoteReady},
    get revision(){return revision},
    get context(){return context},
    forceSync:async()=>{dirty=true;await pushRemote();await invoke({action:'mirror'});return true},
    reload:()=>loadRemote({rerender:true,force:true}),
    createSupport:async payload=>invoke({action:'support_create',...payload}),
    listSupport:async()=>invoke({action:'support_list'}),
    getPlan:()=>context?.plan||null,
    getRole:()=>context?.role||null
  };
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',boot);else boot();
})();