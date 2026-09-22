/* DENYA v107 · unified profile shell + payment diagnostics modal
   Replaces the fragmented account renderers at the UI layer.
*/
(function(){
  const E=v=>typeof esc==='function'?esc(v??''):String(v??'');
  const toast2=m=>typeof toast==='function'?toast(m):alert(m);
  const P=()=>{state.profile=state.profile||{};return state.profile};

  const palettes=[
    ['Cacao','#5A3A2E','#F6F0EB','#C49A78'],
    ['Arena','#6B584B','#F5F0EA','#B98F68'],
    ['Rosa suave','#8D5F67','#FAF1F2','#C89AA2'],
    ['Oliva','#53604A','#F1F3ED','#A3B08D'],
    ['Azul noche','#34465A','#F0F4F8','#8EA6BE'],
    ['Terracota','#8A4F3D','#FBF0EB','#C78368'],
    ['Lavanda','#655978','#F4F1F8','#A997C5'],
    ['Negro & crema','#292522','#F4EFE7','#B99A72']
  ];

  function style(){
    if(document.getElementById('v107style'))return;
    const s=document.createElement('style');s.id='v107style';
    s.textContent=`
      .v107-wrap{max-width:1180px}
      .v107-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px}
      .v107-eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.13em;color:#907e71;font-weight:800}
      .v107-head h1{font-size:29px;margin:4px 0 5px;letter-spacing:-.02em}
      .v107-sub{color:#786c63;font-size:14px}
      .v107-tabs{display:flex;gap:5px;flex-wrap:wrap;padding:5px;background:#eee8e2;border:1px solid #e2d9d1;border-radius:15px;margin-bottom:18px}
      .v107-tabs button{border:0;background:transparent;color:#70645c;padding:10px 13px;border-radius:10px;font-weight:700;cursor:pointer}
      .v107-tabs button:hover{background:#f8f5f2}
      .v107-tabs button.active{background:#fff;color:#2a2420;box-shadow:0 2px 7px #00000012}
      .v107-card{background:#fff;border:1px solid #e7ddd5;border-radius:18px;padding:21px;margin-bottom:14px;box-shadow:0 2px 8px #4b33200a}
      .v107-card h3{margin:0 0 6px;font-size:17px}.v107-card h4{margin:0 0 8px}
      .v107-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
      .v107-full{grid-column:1/-1}.v107-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}
      .v107-note{font-size:13px;color:#7c7068;line-height:1.5}.v107-kicker{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#927f71;font-weight:800}
      .v107-company{display:flex;justify-content:space-between;align-items:center;gap:15px;padding-bottom:16px;margin-bottom:17px;border-bottom:1px solid #eee6df}
      .v107-company-name{font-size:21px;font-weight:800}.v107-pill{display:inline-flex;margin-top:5px;padding:5px 9px;border-radius:999px;background:#f3ece6;color:#77695f;font-size:11px}
      .v107-palette-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:13px}
      .v107-palette{border:1px solid #e4dad2;background:#fff;border-radius:14px;padding:11px;text-align:left;cursor:pointer}
      .v107-palette:hover{border-color:#c6b3a5;transform:translateY(-1px)}
      .v107-swatches{display:flex;gap:5px;margin-bottom:8px}.v107-swatch{width:25px;height:25px;border-radius:8px;border:1px solid #00000012}
      .v107-palette b{display:block;font-size:13px}.v107-palette span{font-size:11px;color:#85786f}
      .v107-color-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:13px}
      .v107-color{border:1px solid #e5dcd5;border-radius:13px;padding:10px;background:#fbf9f7}.v107-color label{display:block;font-size:12px;font-weight:700;color:#62574f;margin-bottom:7px}.v107-color input{width:100%;height:40px;border:0;background:transparent;cursor:pointer}
      .v107-preview{border:1px solid #e5dcd5;border-radius:15px;padding:15px;background:#faf8f5;display:flex;align-items:center;gap:12px;margin-top:14px}.v107-preview-dot{width:38px;height:38px;border-radius:12px}
      .v107-kpi-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:13px 0}.v107-kpi{border:1px solid #eadfd6;border-radius:15px;padding:15px;background:#fff}.v107-kpi small{display:block;color:#8b7b70;font-size:11px;text-transform:uppercase;letter-spacing:.06em}.v107-kpi strong{display:block;font-size:22px;margin-top:5px}
      .v107-plan-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.v107-plan{border:1px solid #e5dbd3;border-radius:16px;padding:16px}.v107-plan.active{border:2px solid #5a3a2e;padding:15px}.v107-plan .price{font-size:25px;font-weight:850;margin:7px 0}.v107-plan ul{padding-left:18px;color:#756a63;font-size:13px;line-height:1.65}
      .v107-bank,.v107-ticket{border:1px solid #e7ddd5;border-radius:13px;padding:13px;margin-top:8px}.v107-bank{display:flex;justify-content:space-between;gap:12px}
      .v107-help{background:#f8f4f0;border:1px solid #eadfd6;border-radius:14px;padding:14px;line-height:1.5}
      .v107-modal{position:fixed;inset:0;background:#1e171480;display:flex;align-items:center;justify-content:center;padding:20px;z-index:99999}.v107-modal-box{width:min(560px,100%);background:#fff;border-radius:20px;border:1px solid #e4d9d1;box-shadow:0 20px 60px #0003;padding:22px}.v107-modal-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.v107-close{border:0;background:#f3eee9;border-radius:10px;width:34px;height:34px;font-size:20px;cursor:pointer}.v107-diagnostic{border:1px solid #e6ddd5;border-radius:13px;padding:12px;margin-top:9px;background:#fbf9f7}.v107-ok{color:#3e7652}.v107-warn{color:#956b20}
      @media(max-width:850px){.v107-palette-grid,.v107-plan-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v107-kpi-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:650px){.v107-grid,.v107-color-row,.v107-kpi-grid,.v107-plan-grid{grid-template-columns:1fr}.v107-full{grid-column:auto}.v107-palette-grid{grid-template-columns:1fr 1fr}.v107-tabs{overflow:auto;flex-wrap:nowrap}.v107-tabs button{white-space:nowrap}}
    `;
    document.head.appendChild(s);
  }

  const items=[['company','Empresa'],['account','Plan y suscripción'],['customization','Personalización'],['payments','Pagos'],['templates','Plantillas'],['users','Usuarios'],['support','Ayuda y soporte']];
  const tabs=(active)=>'<div class="v107-tabs">'+items.map(x=>'<button class="'+(active===x[0]?'active':'')+'" onclick="renderProfile(\\''+x[0]+'\\')">'+x[1]+'</button>').join('')+'</div>';
  const head=(title,desc)=>'<div class="v107-head"><div><div class="v107-eyebrow">Cuenta</div><h1>'+E(title)+'</h1><div class="v107-sub">'+E(desc)+'</div></div></div>';

  async function companies(){
    try{
      const c=window.supabase?.createClient?.('https://kcinhsldmnvhudivutzv.supabase.co','sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs',{auth:{persistSession:true,autoRefreshToken:true}});
      if(!c)return[];
      const u=(await c.auth.getUser()).data.user;if(!u)return[];
      const q=await c.from('organizations').select('id,name,slug').eq('owner_user_id',u.id).eq('active',true).order('created_at',{ascending:true});
      return q.data||[];
    }catch(_){return[]}
  }
  async function newCompany(){
    const name=prompt('Nombre de la nueva empresa:','Nueva empresa')?.trim();if(!name)return;
    const brand=prompt('Nombre comercial / marca principal:',name)?.trim()||name;
    try{
      const c=window.supabase.createClient('https://kcinhsldmnvhudivutzv.supabase.co','sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs',{auth:{persistSession:true,autoRefreshToken:true}});
      const r=await c.functions.invoke('denya-workspace',{body:{action:'bootstrap',org_name:name,first_brand_name:brand}});
      if(r.error||r.data?.error)throw new Error(r.error?.message||r.data?.error||'No se pudo crear la empresa');
      localStorage.setItem('denya_active_org',r.data.organization_id);
      if(window.DENYACloud?.setActiveOrganization)await window.DENYACloud.setActiveOrganization(r.data.organization_id);else location.reload();
      toast2('Empresa creada');
      renderProfile('company');
    }catch(e){toast2(e.message||'No se pudo crear la empresa')}
  }

  function company(){
    const p=P(),org=window.DENYACloud?.context?.organization;
    return '<div class="v107-card"><div class="v107-company"><div><div class="v107-kicker">Empresa activa</div><div class="v107-company-name">'+E(org?.name||p.businessName||'Mi negocio')+'</div><span class="v107-pill">Datos del negocio</span></div><button class="secondary" id="v107NewCompany">+ Agregar empresa</button></div><div class="v107-kicker">Información de la empresa</div><div class="v107-grid"><label>Nombre comercial<input id="v107Business" value="'+E(p.businessName||org?.name||'')+'"></label><label>Correo<input id="v107Email" type="email" value="'+E(p.email||'')+'"></label><label>Instagram<input id="v107Ig" value="'+E(p.instagram||'')+'" placeholder="@tuempresa"></label><label>Facebook<input id="v107Fb" value="'+E(p.facebook||'')+'"></label><label>WhatsApp<input id="v107Wa" value="'+E(p.whatsapp||'')+'"></label><label>Dirección<input id="v107Address" value="'+E(p.address||'')+'"></label><label class="v107-full">Descripción<textarea id="v107Desc">'+E(p.description||'')+'</textarea></label></div><div class="v107-actions"><button class="primary" id="v107SaveCompany">Guardar cambios</button></div></div><div class="v107-card"><div class="v107-kicker">Identidad visual</div><h3>Logo de la empresa</h3><div class="v107-note">El logo se utilizará en cotizaciones, documentos y espacios públicos donde corresponda.</div><div class="v107-actions"><input type="file" accept="image/*" id="v107Logo"></div></div>';
  }

  function account(){
    const s=state.subscription||{}, plan=s.plan||state.plan||'Negocio', billing=s.billing||'Mensual', status=s.status||'Activa';
    const prices={Emprende:[249,2490],Negocio:[449,4490],Pro:[699,6990]};
    const price=prices[plan]||prices.Negocio, amount=billing==='Anual'?price[1]:price[0];
    const stripe=s.provider==='stripe';
    const renewal=s.renewsAt?new Date(s.renewsAt).toLocaleDateString('es-MX'):'—';
    const trial=s.trialEndsAt?new Date(s.trialEndsAt).toLocaleDateString('es-MX'):'—';
    const cards=Object.entries(prices).map(([n,v])=>'<div class="v107-plan '+(n===plan?'active':'')+'"><div class="v107-kicker">'+(n===plan?'Plan actual':'Plan')+'</div><h3>'+n+'</h3><div class="price">$'+(billing==='Anual'?v[1].toLocaleString('es-MX'):v[0].toLocaleString('es-MX'))+' <small>/ '+(billing==='Anual'?'año':'mes')+'</small></div><ul><li>'+(n==='Emprende'?'1 usuario · 1 marca':'')+(n==='Negocio'?'Hasta 3 usuarios · 2 marcas':'')+(n==='Pro'?'Hasta 10 usuarios · 5 marcas':'')+'</li><li>'+(n==='Emprende'?'Operación básica':n==='Negocio'?'Producción, inventario y compras':'Control avanzado y reportes')+'</li></ul><button class="secondary" onclick="window.DENYAGateway?.requestPlanChange?.(\''+n.toLowerCase()+'\')">'+(n===plan?'Administrar':'Cambiar a '+n)+'</button></div>').join('');
    return '<div class="v107-card"><div class="v107-company"><div><div class="v107-kicker">Suscripción</div><h3 style="margin-top:4px">'+E(plan)+' · '+E(billing)+'</h3><div class="v107-note">Todo el estado de tu cuenta se administra desde este mismo Perfil.</div></div><span class="v107-pill">'+E(status)+'</span></div><div class="v107-kpi-grid"><div class="v107-kpi"><small>Plan activo</small><strong>'+E(plan)+'</strong></div><div class="v107-kpi"><small>Renovación</small><strong>'+renewal+'</strong></div><div class="v107-kpi"><small>Método</small><strong>'+(stripe?'Stripe':'Pendiente')+'</strong></div></div>'+(status==='Prueba'?'<div class="v107-help"><b>Prueba activa.</b> Termina el '+trial+'.</div>':'')+'<div class="v107-actions">'+(stripe?'<button class="primary" onclick="window.DENYAGateway?.openCustomerPortal?.()">Administrar suscripción</button>':'<button class="primary" onclick="window.DENYAGateway?.openBilling?.(\''+String(plan).toLowerCase()+'\')">Configurar renovación</button>')+'<button class="secondary" onclick="window.DENYAGateway?.plans?.()">Ver planes</button></div></div><div class="v107-card"><div class="v107-kicker">Planes disponibles</div><h3>Elige el nivel que corresponde a tu operación</h3><div class="v107-plan-grid" style="margin-top:13px">'+cards+'</div></div>';
  }

  function customization(){
    const p=P();
    return '<div class="v107-card"><div class="v107-kicker">Estilo de tu espacio</div><h3>Elige una paleta</h3><div class="v107-note">Selecciona una combinación lista para usar. Después puedes ajustar cada color.</div><div class="v107-palette-grid">'+palettes.map((x,i)=>'<button class="v107-palette" data-v107pal="'+i+'"><div class="v107-swatches"><i class="v107-swatch" style="background:'+x[1]+'"></i><i class="v107-swatch" style="background:'+x[2]+'"></i><i class="v107-swatch" style="background:'+x[3]+'"></i></div><b>'+x[0]+'</b><span>Principal · fondo · acento</span></button>').join('')+'</div></div><div class="v107-card"><div class="v107-kicker">Personalización manual</div><h3>Colores de tu marca</h3><div class="v107-note">Los cambios se aplican en la interfaz para que puedas ver el resultado antes de guardarlo.</div><div class="v107-color-row"><div class="v107-color"><label>Color principal</label><input id="v107Primary" type="color" value="'+E(p.primaryColor||'#8f6b55')+'"></div><div class="v107-color"><label>Color secundario</label><input id="v107Secondary" type="color" value="'+E(p.secondaryColor||'#d9c1ae')+'"></div><div class="v107-color"><label>Color de acento</label><input id="v107Accent" type="color" value="'+E(p.accentColor||'#c59b72')+'"></div></div><div class="v107-preview"><div class="v107-preview-dot" id="v107Dot"></div><div><b>Vista previa</b><div class="v107-note">El color principal se usa en acciones y elementos destacados.</div></div></div><div class="v107-actions"><button class="primary" id="v107SaveColors">Guardar personalización</button></div></div>';
  }

  function templates(){return '<div class="v107-card"><div class="v107-kicker">Documentos</div><h3>Plantillas</h3><p class="v107-note">Aquí se administran las plantillas visuales de cotizaciones y documentos.</p><div class="v107-help">Las plantillas existentes de SWEETLAB se mantienen disponibles desde este apartado.</div></div>'}
  function users(){return '<div class="v107-card"><div class="v107-kicker">Equipo</div><h3>Usuarios</h3><p class="v107-note">Administra las personas que tienen acceso a este espacio de trabajo y sus permisos.</p><div class="v107-help">La gestión avanzada de usuarios y roles queda vinculada al plan contratado.</div></div>'}

  async function support(){
    let t=[];try{const r=await window.DENYACloud?.listSupport?.();t=r?.tickets||[]}catch(_){}
    return '<div class="v107-card"><div class="v107-kicker">Centro de ayuda</div><h3>Ayuda y soporte</h3><div class="v107-help">Reporta un error, pregunta algo sobre tu cuenta o propón una mejora. Tu solicitud queda registrada para seguimiento.</div><div class="v107-grid" style="margin-top:14px"><label>Tipo<select id="v107Cat"><option value="technical">Error técnico</option><option value="feature">Proponer mejora</option><option value="general">Pregunta / ayuda</option><option value="billing">Facturación</option></select></label><label>Prioridad<select id="v107Priority"><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option><option value="low">Baja</option></select></label><label class="v107-full">Asunto<input id="v107Subject" placeholder="¿En qué podemos ayudarte?"></label><label class="v107-full">Mensaje<textarea id="v107Message" rows="5" placeholder="Describe qué ocurrió o qué necesitas."></textarea></label></div><div class="v107-actions"><button class="primary" id="v107Ticket">Enviar solicitud</button></div></div><div class="v107-card"><div class="v107-kicker">Seguimiento</div><h3>Mis solicitudes</h3>'+(t.map(x=>'<div class="v107-ticket"><b>'+E(x.subject)+'</b><span class="v107-pill">'+E(x.status||'Abierto')+'</span><div class="v107-note" style="margin-top:6px">'+E(x.message)+'</div>'+(x.admin_notes?'<div class="v107-note"><b>Respuesta:</b> '+E(x.admin_notes)+'</div>':'')+'</div>').join('')||'<div class="v107-note">Todavía no tienes solicitudes.</div>')+'</div>';
  }

  async function payments(){
    if(window.DENYAPayments?.render){await window.DENYAPayments.render();normalizePaymentTabs();return}
    render('company');
  }
  function normalizePaymentTabs(){
    const el=document.querySelector('.profile-tabs.v58-account-tabs');if(el)el.outerHTML=tabs('payments');
    const root=document.getElementById('content');if(root)root.querySelectorAll('.v105-card').forEach(x=>{x.style.borderRadius='18px';x.style.boxShadow='0 2px 8px #4b33200a'});
  }

  async function render(tab='company'){
    style();titleEl.textContent='Perfil';if(typeof setActive==='function')setActive('profile');
    if(tab==='payments')return payments();
    const pane=tab==='company'?company():tab==='account'?account():tab==='customization'?customization():tab==='templates'?templates():tab==='users'?users():await support();
    content.innerHTML='<div class="v107-wrap">'+head(tab==='company'?'Empresa':tab==='account'?'Plan y suscripción':tab==='customization'?'Personalización':tab==='templates'?'Plantillas':tab==='users'?'Usuarios':'Ayuda y soporte',tab==='company'?'Administra los datos que identifican a tu negocio.':tab==='account'?'Plan, suscripción, renovación y estado de tu cuenta.':tab==='customization'?'Haz que SWEETLAB se sienta como tu marca.':tab==='templates'?'Administra la identidad de tus documentos.':tab==='users'?'Administra el acceso de tu equipo.':'Resuelve dudas y da seguimiento a tus solicitudes.')+tabs(tab)+(tab==='company'?'<div id="v107CompanySlot">'+pane+'</div>':pane)+'</div>';

    if(tab==='company'){
      document.getElementById('v107NewCompany').onclick=newCompany;
      document.getElementById('v107SaveCompany').onclick=()=>{const p=P();p.businessName=document.getElementById('v107Business').value.trim()||'Mi negocio';p.email=document.getElementById('v107Email').value.trim();p.instagram=document.getElementById('v107Ig').value.trim();p.facebook=document.getElementById('v107Fb').value.trim();p.whatsapp=document.getElementById('v107Wa').value.trim();p.address=document.getElementById('v107Address').value.trim();p.description=document.getElementById('v107Desc').value.trim();state.businessName=p.businessName;save();toast2('Empresa guardada')};
      document.getElementById('v107Logo').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{P().logo=r.result;save();toast2('Logo actualizado')};r.readAsDataURL(f)};
    }
    if(tab==='customization'){
      const upd=()=>{const p=P();p.primaryColor=document.getElementById('v107Primary').value;p.secondaryColor=document.getElementById('v107Secondary').value;p.accentColor=document.getElementById('v107Accent').value;window.DENYAAccount?.apply?.();const d=document.getElementById('v107Dot');if(d)d.style.background=p.primaryColor};
      document.querySelectorAll('[data-v107pal]').forEach(b=>b.onclick=()=>{const x=palettes[Number(b.dataset.v107pal)],p=P();p.primaryColor=x[1];p.secondaryColor=x[2];p.accentColor=x[3];document.getElementById('v107Primary').value=x[1];document.getElementById('v107Secondary').value=x[2];document.getElementById('v107Accent').value=x[3];upd()});
      ['v107Primary','v107Secondary','v107Accent'].forEach(id=>document.getElementById(id).addEventListener('input',upd));upd();
      document.getElementById('v107SaveColors').onclick=()=>{save();toast2('Personalización guardada')};
    }
    if(tab==='support'){
      document.getElementById('v107Ticket').onclick=async()=>{const subject=document.getElementById('v107Subject').value.trim(),message=document.getElementById('v107Message').value.trim();if(!subject||!message)return toast2('Completa asunto y mensaje');const b=document.getElementById('v107Ticket');b.disabled=true;try{await window.DENYACloud.createSupport({subject,message,category:document.getElementById('v107Cat').value,priority:document.getElementById('v107Priority').value});toast2('Solicitud enviada');render('support')}catch(e){toast2(e?.message||'No se pudo enviar')}finally{b.disabled=false}};
    }
  }

  function closeDiag(){document.getElementById('v107Diag')?.remove()}
  async function diagnostics(){
    closeDiag();
    const m=document.createElement('div');m.id='v107Diag';m.className='v107-modal';
    m.innerHTML='<div class="v107-modal-box"><div class="v107-modal-head"><div><div class="v107-eyebrow">Pagos</div><h2 style="margin:5px 0">Diagnóstico de pagos</h2><div class="v107-note">Revisa el estado de la conexión sin cambiar de pestaña.</div></div><button class="v107-close" aria-label="Cerrar">×</button></div><div id="v107DiagBody" class="v107-diagnostic">Comprobando…</div></div>';
    document.body.appendChild(m);m.querySelector('.v107-close').onclick=closeDiag;m.onclick=e=>{if(e.target===m)closeDiag()};
    const box=m.querySelector('#v107DiagBody');
    try{
      const r=window.DENYAPayments?.call?await window.DENYAPayments.call('status'):{connected:false};
      if(r.connected){box.innerHTML='<b class="v107-ok">Conexión disponible</b><div class="v107-note" style="margin-top:6px">Cuenta conectada: '+E(r.account?.id||'—')+'</div><div class="v107-note">Cobros: '+(r.account?.charges_enabled?'habilitados':'pendientes')+' · Transferencias: '+(r.account?.payouts_enabled?'habilitadas':'pendientes')+'</div><div class="v107-note">Saldo disponible: '+new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(r.available_mxn||0))+'</div>'}
      else box.innerHTML='<b class="v107-warn">Pagos aún no configurados</b><div class="v107-note" style="margin-top:6px">Puedes volver a Pagos y seleccionar “Configurar pagos”.</div>';
    }catch(e){box.innerHTML='<b class="v107-warn">No se pudo comprobar la conexión</b><div class="v107-note" style="margin-top:6px">'+E(e.message||'Error')+'</div>'}
  }
  window.openPaymentDiagnosticsV107=diagnostics;
  document.addEventListener('click',e=>{
    const el=e.target?.closest?.('button,a');
    if(!el)return;
    const tx=(el.textContent||'').trim().toLowerCase();
    if(tx==='diagnóstico'||tx==='diagnostico'||tx.includes('diagnóstico')||tx.includes('diagnostico')){
      e.preventDefault();e.stopImmediatePropagation();diagnostics();
    }
  },true);

  window.renderProfile=render;
  views.profile=()=>render('company');

  document.querySelectorAll('.nav button[data-view="plan"],.nav button[data-view="subscription"]').forEach(x=>x.remove());
  const profileBtn=document.querySelector('.nav button[data-view="profile"]');
  if(profileBtn)profileBtn.onclick=()=>render('company');

  const baseShow=window.show;
  window.show=function(v){
    if(v==='profile'||v==='plan'||v==='subscription'){return render(v==='profile'?'company':'account')}
    return typeof baseShow==='function'?baseShow(v):undefined;
  };
  window.DENYAProfileV107={render,diagnostics};
})();
