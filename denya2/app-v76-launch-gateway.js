
// DENYA v76 · public landing + real Supabase auth/onboarding/subscription gate
(function(){
  const SUPABASE_URL='https://kcinhsldmnvhudivutzv.supabase.co';
  const SUPABASE_KEY='sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs';
  const PLANS={
    emprende:{name:'Emprende',monthly:249,annual:2490,tag:'Para empezar',features:['1 usuario','1 marca','Cotizaciones, clientes y operación básica','Finanzas esenciales']},
    negocio:{name:'Negocio',monthly:449,annual:4490,tag:'Más elegido',features:['Hasta 3 usuarios','Hasta 2 marcas','Producción, inventario y compras','Clientes avanzados']},
    pro:{name:'Pro',monthly:699,annual:6990,tag:'Para crecer',features:['Hasta 10 usuarios','Hasta 5 marcas','Roles personalizados','Reportes y control avanzado']}
  };
  const STRIPE_PORTAL_LOGIN_URL='https://billing.stripe.com/p/login/6oUcMY2j23d3aRqf270x200';
  const STRIPE_LINKS={
    emprende:{monthly:'https://buy.stripe.com/6oUcMY2j23d3aRqf270x200',annual:'https://buy.stripe.com/14A4gsbTC9Br0cM6vB0x201'},
    negocio:{monthly:'https://buy.stripe.com/8x26oAaPyeVL9Nmg6b0x202',annual:'https://buy.stripe.com/8x2bIU7Dm5lb9Nm07d0x203'},
    pro:{monthly:'https://buy.stripe.com/00w6oA9LucND9Nm3jp0x204',annual:'https://buy.stripe.com/3cI28k2j214V6Ba7zF0x205'}
  };
  let sb=null,session=null,currentOrg=null,billing='monthly',appliedPromo=null;
  let geoPromise=null;
  const geo=()=>geoPromise||(geoPromise=import('https://cdn.jsdelivr.net/npm/country-state-city@3.2.1/+esm'));
  let mxGeoPromise=null;
  const mxGeo=()=>mxGeoPromise||(mxGeoPromise=Promise.all([
    import('https://esm.sh/@webrek/mx-geo@0.9.1'),
    import('https://esm.sh/@webrek/mx-geo@0.9.1/municipios')
  ]));

  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const slugify=v=>(String(v||'denya').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,42)||'negocio')+'-'+Math.random().toString(36).slice(2,6);
  const gateway=()=>document.getElementById('v76Gateway');
  const annualSavings=p=>({regular:p.monthly*12,saved:p.monthly*12-p.annual,percent:Math.round((1-p.annual/(p.monthly*12))*1000)/10});
  const setErr=(msg='')=>{const e=document.querySelector('#v76Error');if(e){e.textContent=msg;e.classList.toggle('show',!!msg)}};
  const busy=(btn,on,text)=>{if(!btn)return; if(on){btn.dataset.old=btn.textContent;btn.textContent=text||'Procesando…'}else btn.textContent=btn.dataset.old||btn.textContent;btn.disabled=!!on};

  function mount(){
    if(document.getElementById('v76Gateway'))return;
    document.body.insertAdjacentHTML('afterbegin','<div id="v76Gateway"></div>');
    document.body.classList.add('v76-auth-ready','v76-gateway-open');
  }
  function showGateway(){document.body.classList.add('v76-gateway-open');const g=gateway();if(g)g.style.display='block'}
  function showApp(subscription=null){
    const planName=subscription?.plan_code&&PLANS[subscription.plan_code]?PLANS[subscription.plan_code].name:'Emprende';
    const brandName=currentOrg?.onboarding_data?.main_brand||currentOrg?.name||'Mi marca';
    if(session?.user?.id&&typeof window.switchDenyaUser==='function'){
      window.switchDenyaUser(session.user.id,{
        planName,
        billing:subscription?.billing_cycle==='annual'?'Anual':'Mensual',
        subscriptionStatus:subscription?.status==='active'?'Activa':subscription?.status==='trialing'?'Prueba':subscription?.status||'Prueba',
        businessName:currentOrg?.name||brandName,
        brandName,
        email:session.user.email||'',
        logo:currentOrg?.logo_url||''
      });
    }
    try{
      if(typeof state!=='undefined'&&subscription){
        state.subscription=state.subscription||{};
        state.subscription.plan=planName;
        state.subscription.billing=subscription.billing_cycle==='annual'?'Anual':'Mensual';
        state.subscription.status=subscription.status==='active'?'Activa':subscription.status==='trialing'?'Prueba':subscription.status||state.subscription.status;
        state.subscription.provider=subscription.provider||null;
        state.subscription.providerSubscriptionId=subscription.provider_subscription_id||null;
        state.subscription.providerCustomerId=subscription.provider_customer_id||null;
        state.subscription.paymentMethod=subscription.provider==='stripe'
          ?'Stripe'
          :(subscription.payment_method_type==='later'?'Pendiente':'Sin método');
        state.subscription.paymentMethodStatus=subscription.payment_method_status||null;
        state.subscription.trialEndsAt=subscription.trial_ends_at||state.subscription.trialEndsAt||null;
        state.subscription.renewsAt=subscription.current_period_ends_at||state.subscription.renewsAt||null;
        state.subscription.cancelAtPeriodEnd=!!subscription.cancel_at_period_end;
        save();
      }
    }catch(syncErr){console.error('Subscription sync failed',syncErr)}
    document.body.classList.remove('v76-gateway-open');
    const g=gateway();if(g)g.style.display='none';
    // La sesión queda disponible desde Perfil; no mostramos una barra permanente.
    document.querySelector('.v76-session-bar')?.remove();
    try{if(typeof show==='function')show('home')}catch(_){}
  }
  function addSessionBar(){
    document.querySelector('.v76-session-bar')?.remove();
    if(!session)return;
    document.body.insertAdjacentHTML('beforeend',`<div class="v76-session-bar"><span>${esc(session.user.email||'Sesión activa')}</span><span id="v76AdminSlot"></span><button class="v76-link" id="v76Logout">Cerrar sesión</button></div>`);
    document.querySelector('#v76Logout').onclick=logout;
    sb.rpc('is_platform_admin').then(({data})=>{
      if(data===true){
        const slot=document.querySelector('#v76AdminSlot');
        if(slot)slot.innerHTML='<a class="v76-link" href="admin.html" style="text-decoration:none">Administración DENYA</a>';
      }
    }).catch(()=>{});
  }

  function landing(){
    showGateway();
    gateway().innerHTML=`<div class="v76-shell">
      <nav class="v76-nav"><div class="v76-brand">✦ DENYA <span>SWEETLAB</span></div><div class="v76-nav-actions"><button class="v76-btn ghost" onclick="DENYAGateway.login()">Iniciar sesión</button><button class="v76-btn primary" onclick="DENYAGateway.register()">Crear cuenta</button></div></nav>
      <section class="v76-hero"><div><span class="v76-kicker">Tu negocio dulce, en un solo lugar</span><h1>Ordena, produce y crece con DENYA.</h1><p>DENYA SWEETLAB reúne cotizaciones, pedidos, producción, recetas, inventario, compras, clientes y finanzas para que una repostería o marca de alimentos deje de operar entre notas, hojas y chats.</p><div class="v76-hero-actions"><button class="v76-btn primary" onclick="DENYAGateway.register()">Empezar ahora</button><button class="v76-btn" onclick="document.querySelector('#v76Features').scrollIntoView({behavior:'smooth'})">Conocer la plataforma</button></div></div>
      <div class="v76-preview"><div class="v76-preview-head"><b>DENYA SWEETLAB</b><span><i class="v76-dot"></i> Operación activa</span></div><div class="v76-kpis"><div class="v76-kpi"><small>Cotizaciones</small><b>24</b></div><div class="v76-kpi"><small>Pedidos</small><b>11</b></div><div class="v76-kpi"><small>Por cobrar</small><b>$8.4k</b></div></div><div class="v76-flow"><div>01 · Cotiza con costos y margen</div><div>02 · Convierte en pedido y producción</div><div>03 · Descuenta inventario y genera compras</div><div>04 · Cierra entrega, cobro y finanzas</div></div></div></section>
      <section class="v76-section" id="v76Features"><div class="v76-section-title"><h2>Hecho para operar de verdad</h2><p>No es solo un cotizador. El mismo pedido acompaña todo el proceso del negocio.</p></div><div class="v76-features">
      <div class="v76-feature"><b>01</b><h3>Cotizaciones inteligentes</h3><p>Productos, presentaciones, recetas, extras, varios pisos, descuentos y anticipos.</p></div>
      <div class="v76-feature"><b>02</b><h3>Producción conectada</h3><p>Del pedido a materiales, inventario, compras y seguimiento sin volver a capturar.</p></div>
      <div class="v76-feature"><b>03</b><h3>Control del negocio</h3><p>Clientes, saldos, ventas, rentabilidad, marcas, usuarios y permisos en una sola plataforma.</p></div>
      </div></section>
      <section class="v76-section"><div class="v76-section-title"><h2>Empieza con el plan que necesitas</h2><p>Crea tu cuenta, configura tu negocio y elige tu plan. Incluimos 14 días de prueba para arrancar.</p></div><div style="text-align:center"><button class="v76-btn primary" onclick="DENYAGateway.register()">Crear mi cuenta</button></div></section>
    </div>`;
  }

  function auth(mode){
    showGateway();const loginMode=mode==='login';
    gateway().innerHTML=`<div class="v76-auth-wrap"><div class="v76-card"><button class="v76-link" onclick="DENYAGateway.home()">← Volver</button><h1 style="margin-top:18px">${loginMode?'Bienvenido de vuelta':'Crea tu cuenta'}</h1><div class="v76-muted">${loginMode?'Entra a tu espacio de trabajo.':'Primero creamos tu acceso; después configuramos tu empresa.'}</div><div id="v76Error" class="v76-error"></div>
      <form id="v76AuthForm" class="v76-form">
      ${loginMode?'':`<label class="v76-field full"><span>Nombre completo</span><input id="v76Name" required autocomplete="name"></label><label class="v76-field full"><span>Teléfono</span><input id="v76Phone" autocomplete="tel"></label>`}
      <label class="v76-field full"><span>Correo electrónico</span><input id="v76Email" type="email" required autocomplete="email"></label>
      <label class="v76-field full"><span>Contraseña</span><input id="v76Password" type="password" minlength="8" required autocomplete="${loginMode?'current-password':'new-password'}"></label>
      ${loginMode?'':`<label class="v76-field full"><span>Confirmar contraseña</span><input id="v76Password2" type="password" minlength="8" required></label>`}
      <div class="v76-field full"><button class="v76-btn primary wide" id="v76AuthSubmit">${loginMode?'Iniciar sesión':'Continuar'}</button></div>
      </form><div class="v76-actions"><span class="v76-muted">${loginMode?'¿Aún no tienes cuenta?':'¿Ya tienes cuenta?'}</span><button class="v76-link" onclick="DENYAGateway.${loginMode?'register':'login'}()">${loginMode?'Regístrate':'Inicia sesión'}</button></div></div>${loginMode?'<div style="margin-top:18px;text-align:center;border-top:1px solid #e7e0d8;padding-top:16px"><button type="button" class="v76-link" id="v76ResendConfirm">Reenviar correo de confirmación</button><div id="v76ResendMsg" class="v76-muted" style="margin-top:8px;font-size:12px"></div></div>':''}</div>`;
    document.querySelector('#v76AuthForm').onsubmit=loginMode?doLogin:doRegister;\n    if(loginMode){\n      const rb=document.querySelector('#v76ResendConfirm');\n      if(rb)rb.onclick=async function(){\n        const email=document.querySelector('#v76Email')?.value.trim();\n        const msg=document.querySelector('#v76ResendMsg');\n        if(!email){if(msg)msg.textContent='Escribe tu correo primero.';return}\n        rb.disabled=true;rb.textContent='Enviando…';\n        try{const {error}=await sb.auth.resend({type:'signup',email,options:{emailRedirectTo:'https://denya728.github.io/denya2/'}});if(error)throw error;if(msg)msg.textContent='Listo. Revisa tu bandeja de entrada y Spam.'}\n        catch(err){if(msg)msg.textContent=err?.message||'No pudimos reenviar el correo.'}\n        finally{rb.disabled=false;rb.textContent='Reenviar correo de confirmación'}\n      };\n    }
  }

  async function doRegister(e){
    e.preventDefault();setErr('');
    const btn=document.querySelector('#v76AuthSubmit'),name=document.querySelector('#v76Name').value.trim(),phone=document.querySelector('#v76Phone').value.trim(),email=document.querySelector('#v76Email').value.trim(),password=document.querySelector('#v76Password').value,p2=document.querySelector('#v76Password2').value;
    if(password!==p2){setErr('Las contraseñas no coinciden.');return}
    busy(btn,true,'Creando cuenta…');
    const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:'https://denya728.github.io/denya2/',data:{full_name:name,phone}}});
    busy(btn,false);
    if(error){setErr(error.message);return}
    if(!data.session){
      gateway().querySelector('.v76-card').innerHTML=`<h2>Revisa tu correo</h2><p class="v76-muted">Te enviamos un enlace a <b>${esc(email)}</b>. Confirma tu cuenta y después inicia sesión para continuar configurando tu empresa.</p><button class="v76-btn primary" onclick="DENYAGateway.login()">Ir a iniciar sesión</button>`;return;
    }
    session=data.session;
    await sb.from('profiles').update({full_name:name,phone}).eq('id',data.user.id);
    await routeSession();
  }
  async function doLogin(e){
    e.preventDefault();setErr('');const btn=document.querySelector('#v76AuthSubmit'),email=document.querySelector('#v76Email').value.trim(),password=document.querySelector('#v76Password').value;
    busy(btn,true,'Entrando…');const {data,error}=await sb.auth.signInWithPassword({email,password});busy(btn,false);
    if(error){setErr(error.message);return}session=data.session;await routeSession();
  }
  async function logout(){
    await sb.auth.signOut();
    session=null;currentOrg=null;
    if(typeof window.switchDenyaUser==='function')window.switchDenyaUser(null);
    document.querySelector('.v76-session-bar')?.remove();
    landing();
  }

  async function accountState(){
    if(!session)return {kind:'guest'};
    const uid=session.user.id;
    const {data:m,error:me}=await sb.from('memberships').select('organization_id,status,created_at').eq('user_id',uid).eq('status','active').order('created_at',{ascending:false}).limit(1);
    if(me)throw me;
    if(!m||!m.length)return {kind:'onboarding'};
    const oid=m[0].organization_id;
    const {data:o,error:oe}=await sb.from('organizations').select('*').eq('id',oid).single();if(oe)throw oe;
    currentOrg=o;
    if(o.active===false)return {kind:'suspended',org:o};
    if(!o.onboarding_completed)return {kind:'onboarding',org:o};
    const {data:s,error:se}=await sb.from('subscriptions').select('*').eq('organization_id',oid).order('created_at',{ascending:false}).limit(1);if(se)throw se;
    const sub=s&&s[0];
    if(sub?.provider==='stripe'&&sub?.provider_subscription_id&&sub.status==='past_due')return {kind:'billing_issue',org:o,subscription:sub};
    if(!sub||!['active','trialing'].includes(sub.status))return {kind:'plans',org:o};
    if(sub.status==='trialing'&&sub.trial_ends_at&&new Date(sub.trial_ends_at)<new Date())return {kind:'plans',org:o};
    if(sub.status==='trialing'&&!sub.payment_method_type)return {kind:'billing',org:o,subscription:sub};
    return {kind:'app',org:o,subscription:sub};
  }
  async function routeSession(){
    try{
      const st=await accountState();
      if(st.kind==='guest')return landing();
      if(st.kind==='onboarding')return onboarding(st.org);
      if(st.kind==='suspended'){
        showGateway();
        gateway().innerHTML=`<div class="v76-auth-wrap"><div class="v76-card"><span class="v76-kicker">Cuenta suspendida</span><h1>Este espacio de trabajo está suspendido</h1><p class="v76-muted">La organización <b>${esc(st.org?.name||'')}</b> está temporalmente suspendida. Tus datos permanecen guardados, pero la operación está bloqueada hasta que Administración DENYA reactive la cuenta.</p><div class="v76-actions"><button class="v76-btn primary" onclick="DENYAGateway.logout()">Cerrar sesión</button></div></div></div>`;
        return;
      }
      if(st.kind==='plans')return plans();
      if(st.kind==='billing_issue'){
        showGateway();
        gateway().innerHTML=`<div class="v76-auth-wrap"><div class="v76-card"><span class="v76-kicker">Pago pendiente</span><h1>Necesitamos actualizar tu método de pago</h1><p class="v76-muted">Tu suscripción de Stripe sigue vinculada a DENYA. Para evitar una segunda suscripción, el checkout nuevo está bloqueado.</p><div class="v76-success" style="display:block;margin:14px 0"><b>Tu información sigue guardada.</b><br>Actualiza tu tarjeta o revisa la factura pendiente desde el portal seguro de Stripe.</div><div class="v76-actions"><button class="v76-btn primary wide" onclick="DENYAGateway.openCustomerPortal()">Abrir portal de facturación</button><button class="v76-btn" onclick="DENYAGateway.logout()">Cerrar sesión</button></div></div></div>`;
        return;
      }
      if(st.kind==='billing')return billingSetup(st.subscription?.plan_code||'emprende');
      showApp(st.subscription);
    }catch(err){console.error(err);showGateway();gateway().innerHTML=`<div class="v76-auth-wrap"><div class="v76-card"><h2>No pudimos cargar tu cuenta</h2><p class="v76-muted">${esc(err.message||err)}</p><button class="v76-btn" onclick="location.reload()">Reintentar</button></div></div>`}
  }

  function onboarding(existingOrg=null){
    showGateway();
    const prior=existingOrg?.onboarding_data||{};
    gateway().innerHTML=`<div class="v76-auth-wrap"><div class="v76-card large"><div class="v76-progress"><span class="on"></span><span class="on"></span><span></span></div><span class="v76-kicker">Configuración inicial</span><h1>Cuéntanos sobre tu negocio</h1><div class="v76-muted">Usaremos esta información para preparar DENYA alrededor de tu operación.</div><div id="v76Error" class="v76-error"></div>
    <form id="v76Onboarding" class="v76-form">
      <label class="v76-field"><span>Nombre de la empresa *</span><input id="v76OrgName" value="${esc(existingOrg?.name||'')}" required></label>
      <label class="v76-field"><span>Marca principal *</span><input id="v76Brand" value="${esc(prior.main_brand||'')}" placeholder="Ej. DENICAKE" required></label>
      <label class="v76-field"><span>Tipo de negocio *</span><select id="v76Type" required><option value="">Selecciona</option><option>Repostería / pastelería</option><option>Alimentos y snacks</option><option>Cafetería</option><option>Panadería</option><option>Otro</option></select></label>
      <label class="v76-field"><span>Tamaño del equipo</span><select id="v76Team"><option>Solo yo</option><option>2–3 personas</option><option>4–10 personas</option><option>11+ personas</option></select></label>
      <label class="v76-field full"><span>¿Qué vendes y cómo funciona tu negocio?</span><textarea id="v76Description" placeholder="Cuéntanos brevemente qué productos manejas y cómo tomas pedidos.">${esc(prior.description||'')}</textarea></label>
      <label class="v76-field"><span>Instagram</span><input id="v76Instagram" value="${esc(prior.instagram||'')}" placeholder="@tuempresa"></label>
      <label class="v76-field"><span>Sitio web</span><input id="v76Website" value="${esc(prior.website||'')}" placeholder="https://"></label>
      <label class="v76-field"><span>País *</span><select id="v76Country" required><option value="">Cargando países…</option></select></label>
      <label class="v76-field"><span>Estado / provincia *</span><select id="v76State" required disabled><option value="">Selecciona país primero</option></select></label>
      <label class="v76-field"><span id="v76LocalityLabel">Ciudad / municipio *</span><select id="v76City" required disabled><option value="">Selecciona estado primero</option></select></label>
      <label class="v76-field"><span>Pedidos aproximados al mes</span><select id="v76Orders"><option>1–20</option><option>21–50</option><option>51–150</option><option>151–500</option><option>500+</option></select></label>
      <div class="v76-field full"><span>¿Dónde vendes?</span><div class="v76-channel-grid"><label class="v76-chip"><input type="checkbox" name="channel" value="Instagram">Instagram</label><label class="v76-chip"><input type="checkbox" name="channel" value="WhatsApp">WhatsApp</label><label class="v76-chip"><input type="checkbox" name="channel" value="Tienda">Tienda física</label><label class="v76-chip"><input type="checkbox" name="channel" value="Eventos">Eventos</label><label class="v76-chip"><input type="checkbox" name="channel" value="Web">Página web</label></div></div>
      <label class="v76-field full"><span>¿Qué quieres mejorar primero?</span><textarea id="v76Goals" placeholder="Ej. cotizar más rápido, controlar inventario, saber mi ganancia…">${esc(prior.goals||'')}</textarea></label>
      <div class="v76-field full"><span>Logo de tu negocio</span><div style="display:flex;gap:13px;align-items:center"><div class="v76-logo-preview" id="v76LogoPreview">${existingOrg?.logo_url?'<img src="'+esc(existingOrg.logo_url)+'" alt="Logo">':'LOGO'}</div><input id="v76Logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></div><div class="v76-muted" style="font-size:12px;margin-top:5px">PNG, JPG, WEBP o SVG · máximo 5 MB</div></div>
      <div class="v76-field full"><button class="v76-btn primary wide" id="v76OnboardingSubmit">Guardar y elegir plan</button></div>
    </form></div></div>`;

    if(prior.business_type) document.querySelector('#v76Type').value=prior.business_type;
    if(prior.team_size) document.querySelector('#v76Team').value=prior.team_size;
    if(prior.monthly_orders) document.querySelector('#v76Orders').value=prior.monthly_orders;
    (prior.channels||[]).forEach(v=>{const x=document.querySelector('[name="channel"][value="'+CSS.escape(v)+'"]');if(x)x.checked=true});

    document.querySelector('#v76Logo').onchange=e=>{
      const file=e.target.files?.[0];if(!file)return;
      if(file.size>5*1024*1024){setErr('El logo no puede pesar más de 5 MB.');e.target.value='';return}
      setErr('');const u=URL.createObjectURL(file);document.querySelector('#v76LogoPreview').innerHTML=`<img src="${u}" alt="Logo">`;
    };
    document.querySelector('#v76Onboarding').onsubmit=saveOnboarding;
    initGeography(prior);
  }

  async function initGeography(prior={}){
    const country=document.querySelector('#v76Country'),state=document.querySelector('#v76State'),city=document.querySelector('#v76City');
    if(!country||!state||!city)return;
    try{
      const {Country,State,City}=await geo();
      const countries=Country.getAllCountries().sort((a,b)=>a.name.localeCompare(b.name,'es'));
      country.innerHTML='<option value="">Selecciona país</option>'+countries.map(c=>`<option value="${esc(c.isoCode)}">${esc(c.name)}</option>`).join('');

      const loadCities=async()=>{
        const cc=country.value,sc=state.value;
        const label=document.querySelector('#v76LocalityLabel');
        if(!cc){city.disabled=true;city.innerHTML='<option value="">Selecciona país primero</option>';if(label)label.textContent='Ciudad / municipio *';return}

        // México: use official municipality-level divisions only (no colonias/localities mixed in).
        if(cc==='MX' && sc && sc!=='__none'){
          try{
            if(label)label.textContent='Municipio *';
            city.disabled=true;
            city.innerHTML='<option value="">Cargando municipios…</option>';
            const [mxBase,mxMun]=await mxGeo();
            const stateName=state.selectedOptions?.[0]?.dataset?.name||state.selectedOptions?.[0]?.textContent||'';
            const match=mxBase.buscaEstado(stateName);
            const municipalities=match?mxMun.municipios(match.cve):[];
            const rows=(municipalities||[]).slice().sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
            city.disabled=false;
            city.innerHTML='<option value="">Selecciona municipio</option>'+rows.map(m=>`<option value="${esc(m.nombre)}" data-cvegeo="${esc(m.cvegeo||'')}">${esc(m.nombre)}</option>`).join('');
            const priorMunicipality=prior.municipality||prior.city||prior.location?.municipality||prior.location?.city;
            if(priorMunicipality&&[...city.options].some(o=>o.value===priorMunicipality))city.value=priorMunicipality;
            return;
          }catch(mxErr){
            console.error('Mexico municipality catalog failed',mxErr);
          }
        }

        if(label)label.textContent='Ciudad / municipio *';
        let cities=sc&&sc!=='__none'?City.getCitiesOfState(cc,sc):City.getCitiesOfCountry(cc);
        cities=(cities||[]).sort((a,b)=>a.name.localeCompare(b.name,'es'));
        city.disabled=false;
        city.innerHTML='<option value="">Selecciona ciudad / municipio</option>'+cities.map(c=>`<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('');
        const priorCity=prior.city||prior.location?.city;
        if(priorCity&&[...city.options].some(o=>o.value===priorCity))city.value=priorCity;
      };
      const loadStates=()=>{
        const cc=country.value;
        const states=cc?State.getStatesOfCountry(cc):[];
        if(!cc){state.disabled=true;state.required=true;state.innerHTML='<option value="">Selecciona país primero</option>';city.disabled=true;city.innerHTML='<option value="">Selecciona estado primero</option>';return}
        if(states.length){
          state.disabled=false;state.required=true;
          state.innerHTML='<option value="">Selecciona estado / provincia</option>'+states.sort((a,b)=>a.name.localeCompare(b.name,'es')).map(x=>`<option value="${esc(x.isoCode)}" data-name="${esc(x.name)}">${esc(x.name)}</option>`).join('');
          const priorStateCode=prior.state_code||prior.location?.state_code;
          const priorState=prior.state||prior.location?.state;
          if(priorStateCode&&[...state.options].some(o=>o.value===priorStateCode))state.value=priorStateCode;
          else if(priorState){const op=[...state.options].find(o=>o.dataset.name===priorState);if(op)state.value=op.value}
        }else{
          state.disabled=true;state.required=false;state.innerHTML='<option value="__none">No aplica</option>';
        }
        loadCities();
      };
      country.onchange=()=>{loadStates()};
      state.onchange=()=>{loadCities()};
      const priorCountryCode=prior.country_code||prior.location?.country_code;
      const priorCountry=prior.country||prior.location?.country;
      if(priorCountryCode&&[...country.options].some(o=>o.value===priorCountryCode))country.value=priorCountryCode;
      else if(priorCountry){const op=countries.find(c=>c.name===priorCountry);if(op)country.value=op.isoCode}
      else if([...country.options].some(o=>o.value==='MX'))country.value='MX';
      loadStates();
    }catch(err){
      console.error('Geography load failed',err);
      country.innerHTML='<option value="MX">México</option>';country.value='MX';
      state.disabled=false;state.required=false;state.innerHTML='<option value="__manual">Escribe ubicación en ciudad</option>';
      city.disabled=false;city.outerHTML='<input id="v76City" required placeholder="Ciudad, estado / provincia">';
      setErr('No pudimos cargar el catálogo geográfico completo. Puedes escribir tu ubicación manualmente.');
    }
  }

  async function uploadLogo(file){
    if(!file)return null;
    const ext=(file.name.split('.').pop()||'png').toLowerCase();
    const path=session.user.id+'/logo-'+Date.now()+'.'+ext;
    const {error}=await sb.storage.from('org-assets').upload(path,file,{upsert:true,contentType:file.type});if(error)throw error;
    return sb.storage.from('org-assets').getPublicUrl(path).data.publicUrl;
  }

  async function saveOnboarding(e){
    e.preventDefault();setErr('');const btn=document.querySelector('#v76OnboardingSubmit');busy(btn,true,'Configurando DENYA…');
    try{
      const orgName=document.querySelector('#v76OrgName').value.trim(),brand=document.querySelector('#v76Brand').value.trim();
      let oid=currentOrg?.id;
      if(!oid){
        const {data,error}=await sb.functions.invoke('denya-workspace',{body:{action:'bootstrap',org_name:orgName,org_slug:slugify(orgName),first_brand_name:brand}});
        if(error||!data?.organization_id)throw new Error(error?.message||data?.error||'No pudimos crear tu empresa.');
        oid=data.organization_id;
      }

      const countryEl=document.querySelector('#v76Country'),stateEl=document.querySelector('#v76State'),cityEl=document.querySelector('#v76City');
      const countryName=countryEl?.selectedOptions?.[0]?.textContent||countryEl?.value||'';
      const stateName=stateEl?.disabled?'':(stateEl?.selectedOptions?.[0]?.dataset?.name||stateEl?.selectedOptions?.[0]?.textContent||'');
      const cityName=cityEl?.value||'';
      const channels=[...document.querySelectorAll('[name="channel"]:checked')].map(x=>x.value);
      const onboarding_data={
        business_type:document.querySelector('#v76Type').value,
        team_size:document.querySelector('#v76Team').value,
        description:document.querySelector('#v76Description').value.trim(),
        instagram:document.querySelector('#v76Instagram').value.trim(),
        website:document.querySelector('#v76Website').value.trim(),
        country:countryName,country_code:countryEl?.value||'',
        state:stateName,state_code:stateEl?.disabled?'':(stateEl?.value||''),
        city:cityName,
        municipality:countryEl?.value==='MX'?cityName:'',
        locality_code:cityEl?.selectedOptions?.[0]?.dataset?.cvegeo||'',
        location_label:[cityName,stateName,countryName].filter(Boolean).join(', '),
        monthly_orders:document.querySelector('#v76Orders').value,
        channels,goals:document.querySelector('#v76Goals').value.trim(),main_brand:brand
      };

      // Save the business first so a logo/network issue never blocks onboarding.
      const basePatch={name:orgName,onboarding_completed:true,onboarding_data};
      const {data:updated,error:ue}=await sb.from('organizations').update(basePatch).eq('id',oid).select('*').single();
      if(ue)throw ue;
      currentOrg=updated||{id:oid,...basePatch};

      const file=document.querySelector('#v76Logo').files?.[0];
      if(file){
        try{
          const logo=await uploadLogo(file);
          if(logo){
            const {error:le}=await sb.from('organizations').update({logo_url:logo}).eq('id',oid);
            if(!le)currentOrg.logo_url=logo;
          }
        }catch(logoErr){console.error('Logo upload failed',logoErr)}
      }
      busy(btn,false);plans();
    }catch(err){busy(btn,false);setErr(err.message||String(err))}
  }

  function plans(){
    showGateway();
    const cards=Object.entries(PLANS).map(([code,p])=>{
      const save=annualSavings(p);
      const priceNote=billing==='annual'
        ?`<div style="margin-top:8px;font-size:12px"><span style="text-decoration:line-through;color:#8a818c">${save.regular.toLocaleString('es-MX')} MXN</span> <b style="color:#2d6a42">Ahorra ${save.saved.toLocaleString('es-MX')} · ${save.percent}% · 2 meses gratis</b></div>`
        :`<div style="margin-top:8px;font-size:12px;color:#746d78">También disponible anual con 2 meses gratis</div>`;
      return `<article class="v76-plan ${code==='negocio'?'featured':''}"><span class="v76-kicker">${esc(p.tag)}</span><h3>${esc(p.name)}</h3><div class="v76-price">$<span>${billing==='annual'?p.annual:p.monthly}</span><small> / ${billing==='annual'?'año':'mes'}</small></div>${priceNote}<ul>${p.features.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><button class="v76-btn ${code==='negocio'?'primary':''} wide" onclick="DENYAGateway.choosePlan('${code}')">Continuar con ${esc(p.name)}</button></article>`;
    }).join('');
    gateway().innerHTML=`<div class="v76-auth-wrap"><div class="v76-card large"><div class="v76-progress"><span class="on"></span><span class="on"></span><span class="on"></span></div><div style="text-align:center"><span class="v76-kicker">Último paso</span><h1>Elige tu plan</h1><div class="v76-muted">Tu cuenta incluye 14 días de prueba. Elige el nivel con el que quieres comenzar.</div><div class="v76-cycle"><button class="v76-btn ${billing==='monthly'?'active':''}" onclick="DENYAGateway.setBilling('monthly')">Mensual</button><button class="v76-btn ${billing==='annual'?'active':''}" onclick="DENYAGateway.setBilling('annual')">Anual · 2 meses gratis</button></div></div><div id="v76Error" class="v76-error"></div><div class="v76-plans">${cards}</div><p class="v76-muted" style="text-align:center;margin-top:15px">Después de elegir el plan verás la configuración de renovación. No guardamos números de tarjeta directamente en DENYA.</p></div></div>`;
  }

  function billingSetup(code){
    const p=PLANS[code];if(!p)return;
    showGateway();
    const basePrice=billing==='annual'?p.annual:p.monthly;
    const promoText=appliedPromo
      ?(appliedPromo.discount_type==='percent'?appliedPromo.discount_value+'% de descuento':'$'+Number(appliedPromo.discount_value).toFixed(2)+' MXN de descuento')
      :'';
    gateway().innerHTML=`<div class="v76-auth-wrap"><div class="v76-card">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
        <button class="v76-link" onclick="DENYAGateway.plans()">← Cambiar plan</button>
        <button class="v76-link" onclick="DENYAGateway.logout()">Cerrar sesión</button>
      </div>
      <span class="v76-kicker" style="margin-top:18px">Plan ${esc(p.name)}</span>
      <h1 style="margin-top:10px">Configura tu renovación</h1>
      <div class="v76-muted">Tienes 14 días gratis y hoy no se hace ningún cargo. Configura tu método de renovación en Stripe para activar la prueba y mantener tu suscripción protegida.</div>
      <div id="v76Error" class="v76-error"></div>

      <div style="margin-top:18px;padding:16px;border:1px solid #e8e0ea;border-radius:16px">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:end;flex-wrap:wrap">
          <div><div class="v76-muted" style="font-size:12px">Precio después de la prueba</div><b style="font-size:22px" id="v76PriceAfterTrial">$ ${basePrice.toLocaleString('es-MX')} MXN / ${billing==='annual'?'año':'mes'}</b>
          ${billing==='annual'?(()=>{const a=annualSavings(p);return `<div style="font-size:12px;margin-top:6px;color:#2d6a42"><b>Plan anual: 2 meses gratis · ahorras ${a.saved.toLocaleString('es-MX')} MXN (${a.percent}%)</b></div>`})():''}</div>
          <div id="v76PromoBadge" class="v76-success" style="display:${appliedPromo?'block':'none'}">${appliedPromo?esc(promoText):''}</div>
        </div>
      </div>

      <div style="margin-top:18px;padding:16px;border:1px solid #e8e0ea;border-radius:16px">
        <b>Código de descuento</b>
        <div class="v76-muted" style="font-size:12px;margin:4px 0 10px">Si tienes una promoción, agrégala antes de continuar.</div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:8px">
          <input id="v76PromoCode" placeholder="Ej. AGOSTO20" value="${appliedPromo?esc(appliedPromo.code):''}" style="padding:12px;border:1px solid #dcd2de;border-radius:12px;text-transform:uppercase">
          <button class="v76-btn" type="button" onclick="DENYAGateway.applyPromo('${code}')">Aplicar</button>
        </div>
        <div id="v76PromoResult" class="v76-muted" style="font-size:12px;margin-top:8px">${appliedPromo?'Código aplicado: '+esc(appliedPromo.code):''}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px">
        <button type="button" class="v76-btn primary" onclick="DENYAGateway.paymentPreference('card','${code}')"><b>💳 Pagar con Stripe</b><br><span style="font-size:12px;font-weight:500">Tarjeta · Apple Pay · Link si están disponibles</span></button>
        <button type="button" class="v76-btn" disabled style="opacity:.55;cursor:not-allowed"><b>PayPal</b><br><span style="font-size:12px;font-weight:500">Próximamente</span></button>
      </div>
      <div id="v76PaymentInfo" class="v76-success" style="display:none"></div>
      <div class="v76-muted" style="margin-top:15px;font-size:12px">El cobro se procesa en Stripe. DENYA nunca recibe ni almacena tu número de tarjeta o CVV. La prueba de 14 días se activa desde Stripe para mantener el plan y el método de pago sincronizados.</div>
    </div></div>`;
    updatePromoPrice(code);
  }

  function updatePromoPrice(code){
    const p=PLANS[code],el=document.querySelector('#v76PriceAfterTrial');if(!p||!el)return;
    const base=billing==='annual'?p.annual:p.monthly;
    let final=base;
    if(appliedPromo){
      if(appliedPromo.discount_type==='percent')final=Math.max(0,base*(1-Number(appliedPromo.discount_value)/100));
      else final=Math.max(0,base-Number(appliedPromo.discount_value));
    }
    el.textContent='$ '+final.toLocaleString('es-MX',{minimumFractionDigits:final%1?2:0,maximumFractionDigits:2})+' MXN / '+(billing==='annual'?'año':'mes');
  }

  async function applyPromo(code){
    const input=document.querySelector('#v76PromoCode'),out=document.querySelector('#v76PromoResult');
    const value=(input?.value||'').trim().toUpperCase();
    if(!value){appliedPromo=null;if(out)out.textContent='Escribe un código.';updatePromoPrice(code);return}
    if(out)out.textContent='Validando…';
    const {data:r,error}=await sb.functions.invoke('denya-workspace',{body:{action:'promo_validate',code:value,plan_code:code}});
    if(error||!r?.valid){
      appliedPromo=null;
      if(out)out.textContent=error?.message||r?.message||'Código no válido.';
      const badge=document.querySelector('#v76PromoBadge');if(badge)badge.style.display='none';
      updatePromoPrice(code);return;
    }
    appliedPromo={promo_id:r.promo_id,code:r.code,description:r.description,discount_type:r.discount_type,discount_value:Number(r.discount_value),remaining_uses:r.remaining_uses};
    if(input)input.value=r.code;
    if(out)out.textContent=(r.description? r.description+' · ':'')+(r.remaining_uses==null?'Sin límite global':r.remaining_uses+' usos disponibles');
    const badge=document.querySelector('#v76PromoBadge');
    if(badge){badge.style.display='block';badge.textContent=r.discount_type==='percent'?r.discount_value+'% de descuento':'$'+Number(r.discount_value).toFixed(2)+' MXN de descuento'}
    updatePromoPrice(code);
  }

  async function paymentPreference(type,code){
    if(type!=='card'){setErr('PayPal todavía no está habilitado. Usa Stripe por ahora.');return}
    try{
      const st=await accountState();
      const existing=st?.subscription;
      if(existing?.provider==='stripe'&&existing?.provider_subscription_id&&['active','trialing','past_due'].includes(existing.status)){
        openCustomerPortal();
        return;
      }
    }catch(_){}
    const link=STRIPE_LINKS[code]?.[billing];
    if(!link||!session?.user?.id||!currentOrg?.id){setErr('No pudimos preparar el checkout. Recarga e inténtalo otra vez.');return}
    if(appliedPromo?.code){
      try{
        const {data:reserved,error:reserveError}=await sb.functions.invoke('denya-workspace',{body:{action:'promo_reserve',code:appliedPromo.code,plan_code:code}});
        if(reserveError||!reserved?.valid){setErr(reserveError?.message||reserved?.message||'No pudimos reservar el código de descuento.');return}
      }catch(e){setErr(e.message||String(e));return}
    }
    const ref=session.user.id+'_'+currentOrg.id;
    const u=new URL(link);
    u.searchParams.set('client_reference_id',ref);
    if(session.user.email)u.searchParams.set('locked_prefilled_email',session.user.email);
    if(appliedPromo?.code)u.searchParams.set('prefilled_promo_code',appliedPromo.code);
    const box=document.querySelector('#v76PaymentInfo');
    if(box){box.style.display='block';box.innerHTML='<b>Abriendo Stripe…</b><br>Regresarás automáticamente a DENYA al terminar.'}
    location.href=u.toString();
  }

  async function choosePlan(code){
    if(!PLANS[code]||!currentOrg?.id)return;
    appliedPromo=null;
    billingSetup(code);
  }

  function openCustomerPortal(){
    if(!session?.user?.email){setErr('No encontramos el correo de tu sesión. Vuelve a iniciar sesión.');return}
    const u=new URL(STRIPE_PORTAL_LOGIN_URL);
    u.searchParams.set('prefilled_email',session.user.email);
    location.href=u.toString();
  }

  function requestPlanChange(name){
    const code=String(name||'').toLowerCase();
    if(!PLANS[code]||!currentOrg?.id)return;
    const liveStripe=typeof state!=='undefined'&&state.subscription?.provider==='stripe'&&state.subscription?.providerSubscriptionId;
    if(liveStripe){
      openCustomerPortal();
      return;
    }
    appliedPromo=null;
    billingSetup(code);
  }

  function closeGateway(){
    document.body.classList.remove('v76-gateway-open');
    const g=gateway();if(g)g.style.display='none';
    try{if(typeof show==='function')show('plan')}catch(_){}
  }

  async function startTrial(code){
    paymentPreference('card',code);
  }

  async function skipPayment(code){
    if(!PLANS[code]||!currentOrg?.id)return;
    setErr('Para proteger tu suscripción, la prueba y el plan se activan únicamente mediante Stripe.');
    billingSetup(code);
  }

  async function stripeReturn(){
    showGateway();
    gateway().innerHTML='<div class="v76-auth-wrap"><div class="v76-card"><span class="v76-kicker">Pago recibido</span><h1>Confirmando tu suscripción…</h1><p class="v76-muted">Stripe está notificando a DENYA. Esto normalmente tarda solo unos segundos.</p><div id="v76Error" class="v76-error"></div></div></div>';
    for(let i=0;i<12;i++){
      try{
        const st=await accountState();
        if(st.kind==='app'&&st.subscription?.provider==='stripe'){
          history.replaceState({},'',location.pathname);
          return showApp(st.subscription);
        }
      }catch(_){}
      await new Promise(r=>setTimeout(r,1200));
    }
    setErr('Stripe confirmó el checkout, pero DENYA todavía está sincronizando la suscripción. Recarga en unos segundos.');
  }

  async function init(){
    mount();
    if(!window.supabase||!window.supabase.createClient){gateway().innerHTML='<div class="v76-auth-wrap"><div class="v76-card"><h2>No se pudo cargar el acceso seguro</h2><p>Recarga la página para intentarlo otra vez.</p></div></div>';return}
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    const {data}=await sb.auth.getSession();session=data.session;
    sb.auth.onAuthStateChange((_event,s)=>{session=s});
    if(session&&new URLSearchParams(location.search).get('stripe')==='success')await stripeReturn();
    else if(session)await routeSession();else landing();
  }

  window.DENYAGateway={home:landing,login:()=>auth('login'),register:()=>auth('register'),choosePlan,requestPlanChange,openCustomerPortal,closeGateway,startTrial,skipPayment,paymentPreference,applyPromo,plans,openBilling:billingSetup,setBilling:v=>{billing=v;appliedPromo=null;plans()},logout};
  window.addEventListener('DOMContentLoaded',init);
})();
