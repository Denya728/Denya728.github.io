
// DENYA v76 · public landing + real Supabase auth/onboarding/subscription gate
(function(){
  const SUPABASE_URL='https://kcinhsldmnvhudivutzv.supabase.co';
  const SUPABASE_KEY='sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs';
  const PLANS={
    emprende:{name:'Emprende',monthly:249,annual:2490,tag:'Para empezar',features:['1 usuario','1 marca','Cotizaciones, clientes y operación básica','Finanzas esenciales']},
    negocio:{name:'Negocio',monthly:449,annual:4490,tag:'Más elegido',features:['Hasta 3 usuarios','Hasta 2 marcas','Producción, inventario y compras','Clientes avanzados']},
    pro:{name:'Pro',monthly:699,annual:6990,tag:'Para crecer',features:['Hasta 10 usuarios','Hasta 5 marcas','Roles personalizados','Reportes y control avanzado']}
  };
  let sb=null,session=null,currentOrg=null,billing='monthly';
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
        subscriptionStatus:subscription?.status==='active'?'Activa':'Prueba',
        businessName:currentOrg?.name||brandName,
        brandName,
        email:session.user.email||'',
        logo:currentOrg?.logo_url||''
      });
    }
    document.body.classList.remove('v76-gateway-open');
    const g=gateway();if(g)g.style.display='none';
    addSessionBar();
    try{if(typeof show==='function')show('home')}catch(_){}
  }
  function addSessionBar(){
    document.querySelector('.v76-session-bar')?.remove();
    if(!session)return;
    document.body.insertAdjacentHTML('beforeend',`<div class="v76-session-bar"><span>${esc(session.user.email||'Sesión activa')}</span><button class="v76-link" id="v76Logout">Cerrar sesión</button></div>`);
    document.querySelector('#v76Logout').onclick=logout;
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
      </form><div class="v76-actions"><span class="v76-muted">${loginMode?'¿Aún no tienes cuenta?':'¿Ya tienes cuenta?'}</span><button class="v76-link" onclick="DENYAGateway.${loginMode?'register':'login'}()">${loginMode?'Regístrate':'Inicia sesión'}</button></div></div></div>`;
    document.querySelector('#v76AuthForm').onsubmit=loginMode?doLogin:doRegister;
  }

  async function doRegister(e){
    e.preventDefault();setErr('');
    const btn=document.querySelector('#v76AuthSubmit'),name=document.querySelector('#v76Name').value.trim(),phone=document.querySelector('#v76Phone').value.trim(),email=document.querySelector('#v76Email').value.trim(),password=document.querySelector('#v76Password').value,p2=document.querySelector('#v76Password2').value;
    if(password!==p2){setErr('Las contraseñas no coinciden.');return}
    busy(btn,true,'Creando cuenta…');
    const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname,data:{full_name:name,phone}}});
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
    if(!o.onboarding_completed)return {kind:'onboarding',org:o};
    const {data:s,error:se}=await sb.from('subscriptions').select('*').eq('organization_id',oid).order('created_at',{ascending:false}).limit(1);if(se)throw se;
    const sub=s&&s[0];
    if(!sub||!['active','trialing'].includes(sub.status))return {kind:'plans',org:o};
    if(sub.status==='trialing'&&sub.trial_ends_at&&new Date(sub.trial_ends_at)<new Date())return {kind:'plans',org:o};
    return {kind:'app',org:o,subscription:sub};
  }
  async function routeSession(){
    try{
      const st=await accountState();
      if(st.kind==='guest')return landing();
      if(st.kind==='onboarding')return onboarding(st.org);
      if(st.kind==='plans')return plans();
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
        const {data,error}=await sb.rpc('bootstrap_denya_organization',{org_name:orgName,org_slug:slugify(orgName),first_brand_name:brand});if(error)throw error;oid=data;
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
    const cards=Object.entries(PLANS).map(([code,p])=>`<article class="v76-plan ${code==='negocio'?'featured':''}"><span class="v76-kicker">${esc(p.tag)}</span><h3>${esc(p.name)}</h3><div class="v76-price">$<span>${billing==='annual'?p.annual:p.monthly}</span><small> / ${billing==='annual'?'año':'mes'}</small></div><ul>${p.features.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><button class="v76-btn ${code==='negocio'?'primary':''} wide" onclick="DENYAGateway.choosePlan('${code}')">Continuar con ${esc(p.name)}</button></article>`).join('');
    gateway().innerHTML=`<div class="v76-auth-wrap"><div class="v76-card large"><div class="v76-progress"><span class="on"></span><span class="on"></span><span class="on"></span></div><div style="text-align:center"><span class="v76-kicker">Último paso</span><h1>Elige tu plan</h1><div class="v76-muted">Tu cuenta incluye 14 días de prueba. Elige el nivel con el que quieres comenzar.</div><div class="v76-cycle"><button class="v76-btn ${billing==='monthly'?'active':''}" onclick="DENYAGateway.setBilling('monthly')">Mensual</button><button class="v76-btn ${billing==='annual'?'active':''}" onclick="DENYAGateway.setBilling('annual')">Anual · ahorra</button></div></div><div id="v76Error" class="v76-error"></div><div class="v76-plans">${cards}</div><p class="v76-muted" style="text-align:center;margin-top:15px">Después de elegir el plan verás la configuración de renovación. No guardamos números de tarjeta directamente en DENYA.</p></div></div>`;
  }

  function billingSetup(code){
    const p=PLANS[code];if(!p)return;
    showGateway();
    gateway().innerHTML=`<div class="v76-auth-wrap"><div class="v76-card"><button class="v76-link" onclick="DENYAGateway.plans()">← Cambiar plan</button><span class="v76-kicker" style="margin-top:18px">Plan ${esc(p.name)}</span><h1 style="margin-top:10px">Configura tu renovación</h1><div class="v76-muted">Tienes 14 días gratis y hoy no se hace ningún cargo. Antes de terminar la prueba podrás dejar un método de pago seguro.</div><div id="v76Error" class="v76-error"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px">
        <button type="button" class="v76-btn" onclick="DENYAGateway.paymentPreference('card','${code}')"><b>💳 Tarjeta</b><br><span style="font-size:12px;font-weight:500">Crédito o débito</span></button>
        <button type="button" class="v76-btn" onclick="DENYAGateway.paymentPreference('paypal','${code}')"><b>PayPal</b><br><span style="font-size:12px;font-weight:500">Cuenta PayPal</span></button>
      </div>
      <div id="v76PaymentInfo" class="v76-success" style="display:none"></div>
      <div class="v76-muted" style="margin-top:15px;font-size:12px">Los datos completos de tarjeta deben capturarse en una pasarela certificada (Stripe, PayPal, Mercado Pago, etc.), no directamente en nuestro formulario. La conexión del procesador real sigue pendiente.</div>
      <button class="v76-btn primary wide" style="margin-top:18px" onclick="DENYAGateway.startTrial('${code}')">Iniciar prueba de 14 días</button>
    </div></div>`;
  }

  function paymentPreference(type,code){
    window.__denyaPaymentPreference=type;
    const box=document.querySelector('#v76PaymentInfo');
    if(box){
      box.style.display='block';
      box.innerHTML=type==='card'
        ?'<b>Tarjeta seleccionada.</b><br>La renovación se configurará mediante checkout seguro cuando conectemos el procesador.'
        :'<b>PayPal seleccionado.</b><br>La renovación se configurará mediante PayPal cuando conectemos el procesador.';
    }
  }

  async function choosePlan(code){
    if(!PLANS[code]||!currentOrg?.id)return;
    billingSetup(code);
  }

  async function startTrial(code){
    if(!PLANS[code]||!currentOrg?.id)return;
    setErr('');
    try{
      const now=new Date(),end=new Date(now.getTime()+14*86400000);
      const method=window.__denyaPaymentPreference||null;
      const {data:old}=await sb.from('subscriptions').select('id').eq('organization_id',currentOrg.id).limit(1);
      let q;
      const payload={
        organization_id:currentOrg.id,
        plan_code:code,
        status:'trialing',
        billing_cycle:billing,
        trial_started_at:now.toISOString(),
        trial_ends_at:end.toISOString(),
        cancel_at_period_end:false,
        payment_method_type:method,
        payment_method_status:'not_configured'
      };
      if(old&&old[0])q=await sb.from('subscriptions').update(payload).eq('id',old[0].id).select('*').single();
      else q=await sb.from('subscriptions').insert(payload).select('*').single();
      if(q.error)throw q.error;
      showApp(q.data||payload);
    }catch(err){setErr(err.message||String(err))}
  }

  async function init(){
    mount();
    if(!window.supabase||!window.supabase.createClient){gateway().innerHTML='<div class="v76-auth-wrap"><div class="v76-card"><h2>No se pudo cargar el acceso seguro</h2><p>Recarga la página para intentarlo otra vez.</p></div></div>';return}
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    const {data}=await sb.auth.getSession();session=data.session;
    sb.auth.onAuthStateChange((_event,s)=>{session=s});
    if(session)await routeSession();else landing();
  }

  window.DENYAGateway={home:landing,login:()=>auth('login'),register:()=>auth('register'),choosePlan,startTrial,paymentPreference,plans,setBilling:v=>{billing=v;plans()},logout};
  window.addEventListener('DOMContentLoaded',init);
})();
