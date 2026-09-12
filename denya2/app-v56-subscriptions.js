(function(){
  const PLANS={
    Emprende:{monthly:249,annual:2490,label:'Para empezar'},
    Negocio:{monthly:449,annual:4490,label:'Para operar de verdad'},
    Pro:{monthly:699,annual:6990,label:'Extras avanzados'}
  };
  const escSafe=v=>typeof esc==='function'?esc(v):String(v??'');
  const moneySafe=n=>typeof money==='function'?money(Number(n)||0):'$'+(Number(n)||0).toFixed(2);
  const nowIso=()=>new Date().toISOString();
  const addDays=(date,days)=>{const d=date?new Date(date):new Date();d.setDate(d.getDate()+days);return d.toISOString()};
  const dateLabel=v=>v?new Date(v).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}):'—';

  function ensureData(){
    state.subscription=state.subscription||{};
    const s=state.subscription;
    if(!s.plan)s.plan=state.plan||'Negocio';
    if(!s.billing)s.billing='Mensual';
    if(!s.status)s.status='Activa';
    if(typeof s.cancelAtPeriodEnd!=='boolean')s.cancelAtPeriodEnd=false;
    if(!s.startedAt)s.startedAt=nowIso();
    if(s.status==='Activa'&&!s.renewsAt)s.renewsAt=addDays(null,s.billing==='Anual'?365:30);
    if(!state.subscriptionAccount)state.subscriptionAccount={registered:false,name:'',email:'',business:''};
    if(!Array.isArray(state.subscriptionEvents))state.subscriptionEvents=[];
    state.plan=s.plan;
    save();
  }
  ensureData();

  function event(type,detail){
    state.subscriptionEvents=state.subscriptionEvents||[];
    state.subscriptionEvents.unshift({id:'sub-'+Date.now()+Math.random().toString(36).slice(2,5),at:nowIso(),type,detail});
    state.subscriptionEvents=state.subscriptionEvents.slice(0,50);
  }
  function setPlan(name){
    if(!PLANS[name])return false;
    ensureData();
    state.subscription.plan=name;state.plan=name;event('plan',name);save();
    if(typeof toast==='function')toast('Plan actualizado a '+name);
    return true;
  }
  function ensureStyle(){
    if(document.getElementById('v56substyle'))return;
    const s=document.createElement('style');s.id='v56substyle';s.textContent=`
      .v56-hero{display:flex;justify-content:space-between;gap:14px;align-items:center;background:#fff;border:1px solid #eadfd4;border-radius:18px;padding:17px;margin:12px 0;flex-wrap:wrap}.v56-state{display:inline-flex;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:850;background:#e7f4eb}.v56-state.trial{background:#fff0c9}.v56-state.cancel{background:#f3e5df}.v56-state.inactive{background:#eee}.v56-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:14px 0}.v56-card{background:#fff;border:1px solid #eadfd4;border-radius:17px;padding:15px}.v56-card.active{border:2px solid #3a2d27}.v56-card h3{margin:6px 0}.v56-price{font-size:27px;font-weight:900}.v56-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.v56-meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}.v56-metric{background:#fff;border:1px solid #eadfd4;border-radius:14px;padding:12px}.v56-metric small{display:block;color:#907c6f;font-size:10px;text-transform:uppercase;letter-spacing:.7px}.v56-metric b{display:block;margin-top:4px}.v56-timeline{background:#fff;border:1px solid #eadfd4;border-radius:16px;padding:14px}.v56-event{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid #f0e8e2}.v56-event:last-child{border-bottom:0}@media(max-width:850px){.v56-grid,.v56-meta{grid-template-columns:1fr 1fr}}@media(max-width:560px){.v56-grid,.v56-meta{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  window.registerSubscriptionV56=function(){
    ensureData();const a=state.subscriptionAccount||{};
    modal(a.registered?'Editar cuenta':'Crear cuenta',`<div class="form2">${field('Nombre','v56name',a.name||'')}${field('Correo','v56email',a.email||'','email')}${field('Negocio / marca','v56business',a.business||'')}</div><div class="helper">Este registro es local para la demo. El inicio de sesión y almacenamiento real llegarán con la base de datos del punto 10.</div>`,w=>{
      const name=w.querySelector('#v56name').value.trim(),email=w.querySelector('#v56email').value.trim(),business=w.querySelector('#v56business').value.trim();
      if(!name||!email){toast('Completa nombre y correo');return false}
      state.subscriptionAccount={registered:true,name,email,business};event('account','Cuenta registrada');save();show('subscription');toast('Cuenta guardada');
    });
  };

  window.startTrialV56=function(name){
    ensureData();
    if(!state.subscriptionAccount?.registered){registerSubscriptionV56();toast('Primero crea tu cuenta');return}
    if(!PLANS[name])name='Negocio';
    const s=state.subscription;s.plan=name;state.plan=name;s.status='Prueba';s.billing='Mensual';s.trialStartedAt=nowIso();s.trialEndsAt=addDays(null,14);s.renewsAt=null;s.cancelAtPeriodEnd=false;s.cancelledAt=null;event('trial','Prueba de 14 días · '+name);save();show('subscription');toast('Prueba de 14 días iniciada');
  };

  window.activateSubscriptionV56=function(name,billing){
    ensureData();if(!PLANS[name])return;
    if(!state.subscriptionAccount?.registered){registerSubscriptionV56();toast('Primero crea tu cuenta');return}
    const cycle=billing==='Anual'?'Anual':'Mensual',s=state.subscription;
    s.plan=name;state.plan=name;s.billing=cycle;s.status='Activa';s.startedAt=s.startedAt||nowIso();s.renewsAt=addDays(null,cycle==='Anual'?365:30);s.trialEndsAt=null;s.cancelAtPeriodEnd=false;s.cancelledAt=null;s.paymentMethod='Demo •••• 4242';event('activate',`${name} · ${cycle}`);save();show('subscription');toast('Suscripción activada');
  };

  window.changeSubscriptionPlanV56=function(name){
    ensureData();if(!PLANS[name]||name===state.subscription.plan)return;
    const from=state.subscription.plan;setPlan(name);event('change',from+' → '+name);save();show('subscription');
  };

  window.changeBillingV56=function(){
    ensureData();const s=state.subscription,next=s.billing==='Anual'?'Mensual':'Anual';s.billing=next;if(s.status==='Activa')s.renewsAt=addDays(null,next==='Anual'?365:30);event('billing','Ciclo '+next);save();show('subscription');toast('Ciclo cambiado a '+next);
  };

  window.cancelSubscriptionV56=function(){
    ensureData();const s=state.subscription;
    if(s.status==='Prueba'){
      if(!confirm('¿Cancelar la prueba ahora?'))return;s.status='Cancelada';s.cancelledAt=nowIso();s.trialEndsAt=null;s.cancelAtPeriodEnd=false;event('cancel','Prueba cancelada');
    }else{
      if(!confirm('¿Cancelar al final del periodo actual? Mantendrás acceso hasta la fecha de renovación.'))return;s.cancelAtPeriodEnd=true;s.cancelledAt=nowIso();event('cancel','Cancelación programada');
    }
    save();show('subscription');toast('Cancelación registrada');
  };

  window.resumeSubscriptionV56=function(){
    ensureData();const s=state.subscription;s.cancelAtPeriodEnd=false;if(s.status==='Cancelada'){s.status='Activa';s.renewsAt=addDays(null,s.billing==='Anual'?365:30)}s.cancelledAt=null;event('resume','Suscripción reanudada');save();show('subscription');toast('Suscripción reanudada');
  };

  function stateClass(s){return s.status==='Prueba'?'trial':s.cancelAtPeriodEnd?'cancel':s.status==='Activa'?'':'inactive'}
  function statusText(s){if(s.status==='Prueba')return 'Prueba de 14 días';if(s.cancelAtPeriodEnd)return 'Activa · cancela al final del periodo';return s.status||'Sin suscripción'}

  views.subscription=function(){
    ensureData();ensureStyle();titleEl.textContent='Suscripción';
    const s=state.subscription,a=state.subscriptionAccount||{},p=PLANS[s.plan]||PLANS.Negocio;
    const amount=s.billing==='Anual'?p.annual:p.monthly;
    const trialDays=s.status==='Prueba'&&s.trialEndsAt?Math.max(0,Math.ceil((new Date(s.trialEndsAt)-new Date())/86400000)):null;
    const cards=Object.entries(PLANS).map(([name,x])=>`<div class="v56-card ${s.plan===name?'active':''}"><span class="v55-tag">${escSafe(x.label)}</span><h3>${escSafe(name)}</h3><div class="v56-price">${moneySafe(s.billing==='Anual'?x.annual:x.monthly)}<span class="muted" style="font-size:12px"> / ${s.billing==='Anual'?'año':'mes'}</span></div><div class="muted" style="margin-top:7px">${name==='Emprende'?'Lo básico para empezar.':name==='Negocio'?'La operación completa.':'Extras, capacidad y control avanzado.'}</div><div class="v56-actions">${s.status==='Prueba'?`<button class="${s.plan===name?'secondary':'primary'}" onclick="changeSubscriptionPlanV56('${name}')">${s.plan===name?'Plan de prueba':'Cambiar prueba'}</button><button class="primary" onclick="activateSubscriptionV56('${name}','${s.billing}')">Activar</button>`:`<button class="${s.plan===name?'secondary':'primary'}" onclick="changeSubscriptionPlanV56('${name}')">${s.plan===name?'Plan actual':'Cambiar a '+name}</button>`}</div></div>`).join('');
    const history=(state.subscriptionEvents||[]).slice(0,8).map(e=>`<div class="v56-event"><span><b>${escSafe(e.detail||e.type)}</b><div class="hint">${escSafe(e.type)}</div></span><span class="muted">${new Date(e.at).toLocaleString('es-MX')}</span></div>`).join('')||'<div class="empty">Aún no hay movimientos de suscripción.</div>';
    content.innerHTML=pageHead('Suscripción','Registro, prueba, plan, renovación y cancelación en un solo flujo.',`<button class="secondary" onclick="registerSubscriptionV56()">${a.registered?'Editar cuenta':'Crear cuenta'}</button>`)+`
      <div class="v56-hero"><div><span class="v56-state ${stateClass(s)}">${escSafe(statusText(s))}</span><h2 style="margin:8px 0 3px">${escSafe(s.plan)} · ${escSafe(s.billing)}</h2><div class="muted">${a.registered?escSafe(a.email)+(a.business?' · '+escSafe(a.business):''):'Aún no has creado la cuenta de suscripción.'}</div></div><div><b style="font-size:25px">${moneySafe(amount)}</b><div class="muted">${s.billing==='Anual'?'por año':'por mes'}</div></div></div>
      <div class="v56-meta"><div class="v56-metric"><small>Estado</small><b>${escSafe(statusText(s))}</b></div><div class="v56-metric"><small>${s.status==='Prueba'?'Fin de prueba':'Próxima renovación'}</small><b>${dateLabel(s.status==='Prueba'?s.trialEndsAt:s.renewsAt)}</b></div><div class="v56-metric"><small>Ciclo</small><b>${escSafe(s.billing)}</b></div><div class="v56-metric"><small>Método</small><b>${escSafe(s.paymentMethod||'Sin pago real')}</b></div></div>
      ${s.status==='Prueba'?`<div class="helper"><b>Prueba activa:</b> te quedan aproximadamente ${trialDays} día${trialDays===1?'':'s'}. Puedes cambiar de plan durante la prueba o activar cuando quieras.</div>`:''}
      <div class="v56-actions"><button class="secondary" onclick="startTrialV56('${escSafe(s.plan)}')">Iniciar / reiniciar prueba de 14 días</button><button class="secondary" onclick="changeBillingV56()">Cambiar a ${s.billing==='Anual'?'mensual':'anual'}</button>${s.cancelAtPeriodEnd||s.status==='Cancelada'?'<button class="primary" onclick="resumeSubscriptionV56()">Reanudar suscripción</button>':'<button class="secondary" onclick="cancelSubscriptionV56()">Cancelar</button>'}</div>
      <h3 style="margin-top:22px">Elige tu plan</h3><div class="v56-grid">${cards}</div>
      <div class="helper"><b>Pago:</b> por ahora es una simulación local. No se realiza ningún cargo real. La pasarela de pago real se conectará después de definir proveedor de pagos y backend.</div>
      <h3 style="margin-top:20px">Historial de suscripción</h3><div class="v56-timeline">${history}</div>`;
  };

  const oldSetPlan=window.setPlanV55;
  if(typeof oldSetPlan==='function')window.setPlanV55=function(name){ensureData();const ok=setPlan(name);if(ok&&typeof show==='function')show('plan')};

  if(!document.querySelector('.nav button[data-view="subscription"]')){
    const planBtn=document.querySelector('.nav button[data-view="plan"]');
    const anchor=planBtn||document.querySelector('.nav button[data-view="profile"]');
    if(anchor)anchor.insertAdjacentHTML('afterend','<button data-view="subscription">Suscripción</button>');
    const btn=document.querySelector('.nav button[data-view="subscription"]');if(btn)btn.onclick=()=>show('subscription');
  }
})();