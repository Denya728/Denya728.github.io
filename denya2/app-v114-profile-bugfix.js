/* DENYA v114 — profile navigation + Pro reports fix */
(function(){
  const tabs=[
    ['company','Empresa'],['account','Plan y suscripción'],['customization','Personalización'],
    ['payments','Pagos'],['templates','Plantillas'],['users','Usuarios'],['support','Ayuda y soporte']
  ];
  const navHtml=(active)=>'<div class="v112tabs v114tabs">'+tabs.map(t=>'<button class="'+(t[0]===active?'active':'')+'" data-v114="'+t[0]+'"><span class="v112ico">'+({company:'✦',account:'◇',customization:'◈',payments:'₳',templates:'▧',users:'♙',support:'?'}[t[0]])+'</span>'+t[1]+'</button>').join('')+'</div>';

  const baseRender=window.renderProfile;
  if(typeof baseRender!=='function')return;

  async function route(tab){
    if(tab==='payments'){
      if(window.DENYAPayments&&typeof window.DENYAPayments.render==='function'){
        await window.DENYAPayments.render();
        installPaymentNav();
      }else{
        await baseRender(tab);
      }
      return;
    }
    await baseRender(tab);
  }

  function installPaymentNav(){
    const root=document.getElementById('content');
    if(!root)return;
    const old=root.querySelector('.profile-tabs');
    if(!old)return;
    const holder=document.createElement('div');
    holder.innerHTML=navHtml('payments');
    old.replaceWith(holder.firstElementChild);
    bindNav(root);
  }

  function bindNav(root){
    root.querySelectorAll('[data-v114]').forEach(btn=>{
      btn.onclick=(e)=>{e.preventDefault();e.stopPropagation();route(btn.dataset.v114)};
    });
  }

  window.renderProfile=route;
  window.__v114Navigate=route;
  window.__v105Navigate=route;

  // If an older payment renderer inserts its own tabs after this patch,
  // replace them immediately and keep the navigation owned by v114.
  const observer=new MutationObserver(()=>{
    const root=document.getElementById('content');
    if(!root)return;
    if(root.querySelector('#v105PaymentsBody') && !root.querySelector('.v114tabs'))installPaymentNav();
  });
  observer.observe(document.body,{childList:true,subtree:true});

  // Reports: sync the real subscription for the active organization, then
  // bypass the old local-only gate when the organization is actually Pro.
  async function syncPlan(){
    try{
      const c=window.supabase?.createClient?.(
        'https://kcinhsldmnvhudivutzv.supabase.co',
        'sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs'
      );
      if(!c)return;
      const user=(await c.auth.getUser()).data.user;
      if(!user)return;
      let org=window.DENYACloud?.context?.organization?.id||localStorage.getItem('denya_active_org')||'';
      if(!org){
        const q=await c.from('organizations').select('id').eq('owner_user_id',user.id).eq('active',true).order('created_at',{ascending:true}).limit(1).maybeSingle();
        org=q.data?.id||'';
        if(org)localStorage.setItem('denya_active_org',org);
      }
      if(!org)return;
      const q=await c.from('subscriptions').select('plan_code,status,billing_cycle').eq('organization_id',org).maybeSingle();
      if(q.error||!q.data)return;
      const code=String(q.data.plan_code||'').toLowerCase();
      const plan=code==='pro'?'Pro':code==='negocio'?'Negocio':code==='emprende'?'Emprende':null;
      if(!plan)return;
      state.subscription=state.subscription||{};
      state.subscription.plan=plan;
      state.subscription.billing=q.data.billing_cycle==='annual'?'Anual':'Mensual';
      state.subscription.status=q.data.status==='active'?'Activa':q.data.status==='trialing'?'Prueba':q.data.status;
      state.plan=plan;
      if(typeof save==='function')save();
    }catch(_){}
  }

  const oldShow=window.show;
  window.show=function(v){
    if(v==='reports'){
      const plan=String(state?.subscription?.plan||state?.plan||'').trim().toLowerCase();
      if(plan==='pro'){
        if(typeof setActive==='function')setActive('reports');
        if(typeof titleEl!=='undefined')titleEl.textContent='Reportes';
        if(typeof views!=='undefined'&&typeof views.reports==='function')return views.reports();
      }
    }
    return oldShow.apply(this,arguments);
  };

  // Initial sync and keep the normal Profile entry.
  syncPlan();
})();