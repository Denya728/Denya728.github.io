/* DENYA v110 · Profile final shell
   Stable unified Profile. Restores legacy Templates/Users visual when available.
*/
(function(){
  const E=v=>typeof esc==='function'?esc(v??''):String(v??'');
  const toast2=m=>typeof toast==='function'?toast(m):alert(m);
  const P=()=>{state.profile=state.profile||{};return state.profile};
  const SUPA_URL='https://kcinhsldmnvhudivutzv.supabase.co';
  const SUPA_KEY='sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs';
  const tabs=[
    ['company','Empresa'],['account','Plan y suscripción'],['customization','Personalización'],
    ['payments','Pagos'],['templates','Plantillas'],['users','Usuarios'],['support','Ayuda y soporte']
  ];
  const info={
    company:['Empresa','Identidad, datos comerciales y presencia de tu negocio.'],
    account:['Plan y suscripción','Tu plan, estado de cuenta y opciones de renovación.'],
    customization:['Personalización','Haz que SWEETLAB se sienta como tu marca.'],
    payments:['Pagos','Cobros online, cuenta conectada, saldo y reembolsos.'],
    templates:['Plantillas','Elige el diseño que quieres conservar para tus documentos.'],
    users:['Usuarios','Personas, acceso y permisos de tu empresa.'],
    support:['Ayuda y soporte','Centro de ayuda, solicitudes y seguimiento.']
  };
  function css(){
    if(document.getElementById('v110style'))return;
    const s=document.createElement('style');s.id='v110style';s.textContent=`
      .v110{max-width:1180px;margin:auto}
      .v110-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin:4px 0 16px}
      .v110-eyebrow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#947d6e;font-weight:850}
      .v110-head h1{margin:4px 0;font-size:29px;letter-spacing:-.025em}.v110-head p{margin:0;color:#786c63;font-size:13px}
      .v110-tabs{display:flex;gap:4px;overflow:auto;padding:5px;background:#eee8e2;border:1px solid #dfd6ce;border-radius:15px;margin-bottom:15px}
      .v110-tabs button{border:0;background:transparent;color:#70645c;padding:10px 13px;border-radius:10px;font-weight:750;white-space:nowrap;cursor:pointer}
      .v110-tabs button.active{background:#fff;color:#2a2420;box-shadow:0 2px 7px #0001}
      .v110-main{background:#fff;border:1px solid #e4dad2;border-radius:20px;overflow:hidden;box-shadow:0 8px 28px #3c29170d}
      .v110-mainhead{padding:19px 23px;border-bottom:1px solid #eee6df;background:linear-gradient(180deg,#fff,#fcfaf8)}
      .v110-mainhead h2{margin:0;font-size:18px}.v110-mainhead p{margin:5px 0 0;color:#7d7067;font-size:13px}
      .v110-body{padding:20px 23px}
      .v110-hero{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:18px;padding:22px;border:1px solid #e4d9d0;border-radius:20px;background:linear-gradient(135deg,#fffdfb 0%,#f7efe8 100%);margin-bottom:16px;box-shadow:0 10px 28px rgba(70,45,30,.06)}
      .v110-logo{width:72px;height:72px;border-radius:20px;background:linear-gradient(145deg,#5a3a2e,#87604b);color:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:27px;flex:none;box-shadow:0 8px 18px rgba(90,58,46,.16)}
      .v110-companygrid{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.75fr);gap:16px}
      .v110-card{border:1px solid #e5dbd3;border-radius:18px;padding:20px;background:#fff;margin-bottom:14px;box-shadow:0 5px 18px rgba(70,45,30,.035)}
      .v110-cardhead{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:15px}
      .v110-cardhead .v110-eyebrow{margin-bottom:3px}
      .v110-fieldgroup{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .v110-fieldgroup label{display:block}
      .v110-fieldgroup .v110-full{grid-column:1/-1}
      .v110-sidecard{background:linear-gradient(180deg,#fff,#fbf8f5)}
      .v110-mini-stat{display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #eee6df;font-size:12px}
      .v110-mini-stat:last-child{border-bottom:0}
      .v110-mini-stat span{color:#857970}
      .v110-mini-stat b{color:#352c27}
      .v110-brand-preview{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid #e8ded6;border-radius:14px;background:#faf7f3;margin-bottom:12px}
      .v110-brand-preview .v110-logo{width:52px;height:52px;border-radius:15px;font-size:20px}
      .v110-logo img{width:100%;height:100%;object-fit:contain}.v110-hero h3{margin:3px 0;font-size:21px}.v110-hero p{margin:4px 0;color:#756a62;font-size:12px}.v110-hero .primary{margin-left:auto}
      .v110-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:15px}
      .v110-metric{padding:13px 15px;border:1px solid #e7ddd5;border-radius:14px;background:#fff}.v110-metric small{display:block;color:#89796e;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.v110-metric b{display:block;margin-top:4px;font-size:15px}
      .v110-grid2{display:grid;grid-template-columns:1.35fr .85fr;gap:15px}.v110-card{border:1px solid #e5dbd3;border-radius:16px;padding:18px;background:#fff;margin-bottom:14px}.v110-card:last-child{margin-bottom:0}
      .v110-card h3{margin:0 0 5px;font-size:16px}.v110-card p{margin:0 0 13px;color:#7c7068;font-size:12px;line-height:1.5}
      .v110-fields{display:grid;grid-template-columns:1fr 1fr;gap:11px}.v110-full{grid-column:1/-1}.v110-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      .v110-upload{display:flex;gap:12px;align-items:center;padding:13px;border:1px dashed #d8cbc0;border-radius:13px;background:#faf7f4}.v110-logo.small{width:48px;height:48px;border-radius:12px;font-size:18px}
      .v110-callout{padding:13px;border-radius:13px;background:#f8f4f0;border:1px solid #e8ded6;color:#665b54;font-size:12px;line-height:1.5}
      .v110-planhero{display:grid;grid-template-columns:1.4fr .6fr;gap:12px;margin-bottom:14px}.v110-current{padding:18px;border-radius:16px;background:linear-gradient(135deg,#5a3a2e,#795543);color:#fff}.v110-current .v110-eyebrow{color:#eadbd0}.v110-current h3{font-size:23px;margin:5px 0}.v110-current p{color:#eadfd7;margin:0;font-size:12px}.v110-status{padding:18px;border:1px solid #e5dbd3;border-radius:16px}.v110-status b{display:block;font-size:20px;margin-top:5px}.v110-plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.v110-plan{border:1px solid #e4dad2;border-radius:16px;padding:16px}.v110-plan.active{border:2px solid #5a3a2e;padding:15px}.v110-plan .price{font-size:24px;font-weight:850;margin:7px 0}.v110-plan ul{padding-left:17px;color:#766a62;font-size:12px;line-height:1.65}
      .v110-supportgrid{display:grid;grid-template-columns:.8fr 1.2fr;gap:15px}.v110-helpitem{padding:14px;border:1px solid #e5dbd3;border-radius:14px;margin-top:9px;background:#fff}.v110-helpitem b{display:block;margin-bottom:3px}.v110-helpitem span{font-size:12px;color:#7c7068}.v110-tickets{margin-top:14px}.v110-ticket{padding:13px;border:1px solid #e5dbd3;border-radius:13px;margin-top:8px}.v110-tickethead{display:flex;justify-content:space-between;gap:10px}.v110-badge{padding:5px 8px;border-radius:999px;background:#f1ebe5;font-size:10px;white-space:nowrap}
      .v110-legacy{margin:0}.v110-empty{padding:20px;text-align:center;border:1px dashed #d9cec5;border-radius:14px;background:#faf8f5;color:#7d7067}
      @media(max-width:850px){.v110-grid2,.v110-companygrid,.v110-supportgrid,.v110-planhero{grid-template-columns:1fr}.v110-plan-grid{grid-template-columns:1fr 1fr}.v110-metrics{grid-template-columns:1fr 1fr}}
      @media(max-width:620px){.v110-body{padding:14px}.v110-mainhead{padding:16px}.v110-fields,.v110-fieldgroup,.v110-plan-grid,.v110-metrics{grid-template-columns:1fr}.v110-full{grid-column:auto}.v110-hero{grid-template-columns:1fr;align-items:flex-start}.v110-hero .primary{margin-left:0}}
    `;document.head.appendChild(s);
  }
  function shell(tab,body){
    const [title,desc]=info[tab];
    return '<div class="v110"><div class="v110-head"><div><div class="v110-eyebrow">Cuenta · Perfil</div><h1>Perfil</h1><p>Administra tu empresa, cuenta y configuración desde un solo lugar.</p></div></div>'+
      '<div class="v110-tabs">'+tabs.map(x=>'<button class="'+(x[0]===tab?'active':'')+'" data-v110="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'+
      '<div class="v110-main"><div class="v110-mainhead"><h2>'+title+'</h2><p>'+desc+'</p></div><div class="v110-body">'+body+'</div></div></div>';
  }
  function company(){
    const p=P(),o=window.DENYACloud?.context?.organization,n=o?.name||p.businessName||'Mi negocio';
    return '<div class="v110-hero"><div class="v110-logo">'+(p.logo?'<img src="'+E(p.logo)+'">':'✦')+'</div><div><div class="v110-eyebrow">Empresa activa</div><h3>'+E(n)+'</h3><p>Gestiona aquí la identidad y los datos que SWEETLAB usa en tus documentos.</p></div><button class="primary" id="v110New">+ Agregar empresa</button></div>'+
      '<div class="v110-companygrid"><section class="v110-card"><div class="v110-cardhead"><div><div class="v110-eyebrow">Información comercial</div><h3 style="margin:3px 0 0">Datos de tu empresa</h3><p>Esta información puede aparecer en cotizaciones, PDFs y comunicaciones con tus clientes.</p></div><span class="v110-badge">Empresa activa</span></div><div class="v110-fieldgroup"><label>Nombre comercial<input id="v110Business" value="'+E(p.businessName||n)+'"></label><label>Correo<input id="v110Email" type="email" value="'+E(p.email||'')+'"></label><label>WhatsApp<input id="v110Wa" value="'+E(p.whatsapp||'')+'"></label><label>Instagram<input id="v110Ig" value="'+E(p.instagram||'')+'"></label><label>Facebook<input id="v110Fb" value="'+E(p.facebook||'')+'"></label><label>Dirección<input id="v110Address" value="'+E(p.address||'')+'"></label><label class="v110-full">Descripción<textarea id="v110Desc">'+E(p.description||'')+'</textarea></label></div><div class="v110-actions"><button class="primary" id="v110Save">Guardar cambios</button></div></section>'+
      '<aside><section class="v110-card v110-sidecard"><div class="v110-eyebrow">Identidad de marca</div><h3 style="margin:3px 0 5px">Logotipo</h3><p>Se utilizará en tus documentos y espacios donde corresponda.</p><div class="v110-brand-preview"><div class="v110-logo">'+(p.logo?'<img src="'+E(p.logo)+'">':'✦')+'</div><div><b>'+E(n)+'</b><div style="font-size:11px;color:#81766e">Vista previa de tu marca</div></div></div><input style="width:100%" type="file" id="v110Logo" accept="image/*"></section>'+
      '<section class="v110-card v110-sidecard"><div class="v110-eyebrow">Estado del espacio</div><h3 style="margin:3px 0 8px">Todo en un solo lugar</h3><div class="v110-mini-stat"><span>Empresa</span><b>Activa</b></div><div class="v110-mini-stat"><span>Documentos</span><b>Configurados</b></div><div class="v110-mini-stat"><span>Pagos</span><b>Independientes</b></div></section></aside></div>';
  }
  function account(){
    const s=state.subscription||{},plan=s.plan||state.plan||'Sin plan configurado',billing=s.billing||'Mensual',status=s.status||'Pendiente',renew=s.renewsAt?s.renewsAt:'';
    const prices={Emprende:[249,2490,'1 usuario · 1 marca','Operación básica'],Negocio:[449,4490,'Hasta 3 usuarios · 2 marcas','Producción, inventario y compras'],Pro:[699,6990,'Hasta 10 usuarios · 5 marcas','Control avanzado y reportes']};
    const planName=prices[plan]?plan:'Negocio';
    const cards=Object.entries(prices).map(([n,v])=>'<div class="v110-plan '+(n===plan?'active':'')+'"><div class="v110-eyebrow">'+(n===plan?'Plan actual':'Plan')+'</div><h3>'+n+'</h3><div class="price">$'+(billing==='Anual'?v[1].toLocaleString('es-MX'):v[0].toLocaleString('es-MX'))+' <small>/ '+(billing==='Anual'?'año':'mes')+'</small></div><ul><li>'+v[2]+'</li><li>'+v[3]+'</li></ul><button class="secondary" data-plan="'+n.toLowerCase()+'">'+(n===plan?'Administrar':'Cambiar a '+n)+'</button></div>').join('');
    return '<div class="v110-planhero"><section class="v110-current"><div class="v110-eyebrow">Estado actual</div><h3>'+E(plan)+'</h3><p>'+E(billing)+' · '+E(status)+(renew?' · renovación '+new Date(renew).toLocaleDateString('es-MX'):'')+'</p></section><section class="v110-status"><div class="v110-eyebrow">Suscripción</div><b>'+E(status)+'</b><span style="font-size:11px;color:#7d7067">Administrada desde SWEETLAB</span></section></div><section class="v110-card"><h3>Planes disponibles</h3><p>Elige el nivel de operación que corresponda a tu negocio.</p><div class="v110-plan-grid">'+cards+'</div></section><div class="v110-callout"><b>Facturación</b><br>La renovación y los cambios de plan se gestionan desde el flujo de suscripción de SWEETLAB.</div>';
  }
  async function legacy(tab){
    const fn=window.__v102OldProfile;
    if(typeof fn!=='function')return null;
    try{await fn(tab);const html=document.getElementById('content')?.innerHTML||'';if(html)return '<div class="v110-legacy">'+html+'</div>';}catch(_){}
    return null;
  }
  function customization(){
    const p=P();
    const palettes=[['Cacao','#5A3A2E','#F6F0EB','#C49A78'],['Arena','#6B584B','#F5F0EA','#B98F68'],['Rosa suave','#8D5F67','#FAF1F2','#C89AA2'],['Oliva','#53604A','#F1F3ED','#A3B08D'],['Azul noche','#34465A','#F0F4F8','#8EA6BE'],['Terracota','#8A4F3D','#FBF0EB','#C78368'],['Lavanda','#655978','#F4F1F8','#A997C5'],['Negro & crema','#292522','#F4EFE7','#B99A72']];
    return '<section class="v110-card"><h3>Paletas listas para usar</h3><p>Elige una combinación completa y después ajusta los colores si quieres.</p><div class="v110-plan-grid">'+palettes.map((x,i)=>'<button class="v110-plan" data-pal="'+i+'" style="text-align:left;cursor:pointer"><div style="display:flex;gap:5px;margin-bottom:9px"><i style="width:25px;height:25px;border-radius:8px;background:'+x[1]+'"></i><i style="width:25px;height:25px;border-radius:8px;background:'+x[2]+'"></i><i style="width:25px;height:25px;border-radius:8px;background:'+x[3]+'"></i></div><b>'+x[0]+'</b><div style="font-size:11px;color:#81766e;margin-top:4px">Principal · fondo · acento</div></button>').join('')+'</div></section><section class="v110-card"><h3>Colores de tu marca</h3><p>Personaliza los colores principales de SWEETLAB.</p><div class="v110-fields"><label>Color principal<input id="v110c1" type="color" value="'+E(p.primaryColor||'#8f6b55')+'"></label><label>Color secundario<input id="v110c2" type="color" value="'+E(p.secondaryColor||'#d9c1ae')+'"></label><label>Color de acento<input id="v110c3" type="color" value="'+E(p.accentColor||'#c59b72')+'"></label></div><div class="v110-actions"><button class="primary" id="v110SaveColors">Guardar personalización</button></div></section>';
  }
  function fallbackTemplates(){
    return '<section class="v110-card"><h3>Plantillas de documentos</h3><p>Conserva el estilo anterior de SWEETLAB y elige cómo quieres presentar tus cotizaciones.</p><div class="v110-plan-grid"><div class="v110-plan"><div class="v110-eyebrow">Recomendada para tu marca</div><h3>Elegante</h3><div class="v110-callout">Espacios limpios, jerarquía clara y apariencia premium.</div><div class="v110-actions"><button class="secondary">Usar plantilla</button></div></div><div class="v110-plan"><div class="v110-eyebrow">Clásica</div><h3>Clásica</h3><div class="v110-callout">Formal, ordenada y enfocada en la información.</div><div class="v110-actions"><button class="secondary">Usar plantilla</button></div></div><div class="v110-plan"><div class="v110-eyebrow">Simple</div><h3>Minimalista</h3><div class="v110-callout">Moderna, ligera y fácil de leer.</div><div class="v110-actions"><button class="secondary">Usar plantilla</button></div></div></div></section>';
  }
  async function support(){
    let tickets=[];try{const r=await window.DENYACloud?.listSupport?.();tickets=r?.tickets||[]}catch(_){}
    return '<div class="v110-supportgrid"><section><div class="v110-card"><h3>Centro de ayuda</h3><p>Encuentra una solución o envíanos una solicitud desde el mismo espacio.</p><div class="v110-helpitem"><b>Problema técnico</b><span>Errores, pantallas trabadas o funciones que no responden.</span></div><div class="v110-helpitem"><b>Cuenta y facturación</b><span>Plan, suscripción, pagos o cambios de cuenta.</span></div><div class="v110-helpitem"><b>Idea o mejora</b><span>Comparte una propuesta para mejorar SWEETLAB.</span></div></div></section><section><div class="v110-card"><h3>Enviar una solicitud</h3><p>Describe lo que necesitas y podremos darle seguimiento.</p><div class="v110-fields"><label>Tipo<select id="v110Cat"><option value="technical">Problema técnico</option><option value="feature">Proponer mejora</option><option value="general">Pregunta / ayuda</option><option value="billing">Cuenta y facturación</option></select></label><label>Prioridad<select id="v110Priority"><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option><option value="low">Baja</option></select></label><label class="v110-full">Asunto<input id="v110Subject" placeholder="¿En qué podemos ayudarte?"></label><label class="v110-full">Mensaje<textarea id="v110Message" rows="6" placeholder="Describe qué estabas haciendo y qué ocurrió."></textarea></label></div><div class="v110-actions"><button class="primary" id="v110Ticket">Enviar solicitud</button></div></div><div class="v110-card v110-tickets"><h3>Mis solicitudes</h3>'+((tickets.length?tickets.map(t=>'<div class="v110-ticket"><div class="v110-tickethead"><b>'+E(t.subject)+'</b><span class="v110-badge">'+E(t.status||'Abierto')+'</span></div><div style="font-size:12px;color:#7c7068;margin-top:6px">'+E(t.message)+'</div>'+(t.admin_notes?'<div style="font-size:12px;margin-top:7px"><b>Respuesta:</b> '+E(t.admin_notes)+'</div>':'')+'</div>').join(''):'<div class="v110-empty">Todavía no tienes solicitudes.</div>')+'</div></section></div>';
  }
  const baseProfile=window.__v102OldProfile || window.renderProfile;
  const profileTabs=[
    ['company','Empresa'],
    ['account','Plan y suscripción'],
    ['customization','Personalización'],
    ['payments','Pagos'],
    ['templates','Plantillas'],
    ['users','Usuarios'],
    ['support','Ayuda y soporte']
  ];

  function profileNavigation(active){
    return '<div class="profile-tabs v58-account-tabs">'+profileTabs.map(x=>'<button class="'+(active===x[0]?'active':'')+'" onclick="renderProfile(\\''+x[0]+'\\')">'+x[1]+'</button>').join('')+'</div>';
  }

  function profileExtraStyle(){
    if(document.getElementById('v111profileextras'))return;
    const s=document.createElement('style');s.id='v111profileextras';s.textContent=`
      .pfx-wrap{max-width:1120px}
      .pfx-intro{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin:4px 0 18px}
      .pfx-kicker{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#927d70;font-weight:800}
      .pfx-title{font-size:27px;font-weight:760;margin:4px 0 5px;color:#29231f}
      .pfx-sub{font-size:14px;color:#786b63}
      .pfx-card{background:#fff;border:1px solid #e7ddd5;border-radius:18px;padding:22px;margin-bottom:14px;box-shadow:0 3px 12px rgba(60,40,25,.05)}
      .pfx-card h3{margin:0 0 6px;font-size:17px}.pfx-card h4{margin:0 0 10px}
      .pfx-note{font-size:13px;line-height:1.5;color:#7d7169}
      .pfx-toolbar{display:flex;gap:9px;align-items:center;justify-content:space-between;margin:16px 0}
      .pfx-list{display:grid;gap:9px}.pfx-user{display:grid;grid-template-columns:44px 1fr auto;gap:12px;align-items:center;border:1px solid #e8ded6;border-radius:15px;padding:13px 14px}
      .pfx-avatar{width:44px;height:44px;border-radius:14px;background:#f1e8e1;display:grid;place-items:center;font-weight:800;color:#705847}
      .pfx-user-name{font-weight:700;color:#302823}.pfx-user-meta{font-size:12px;color:#867970;margin-top:3px}
      .pfx-role{border:1px solid #e3d7cd;background:#faf7f4;border-radius:10px;padding:7px 10px;font-size:12px;font-weight:700}
      .pfx-empty{padding:26px;text-align:center;border:1px dashed #dfd2c8;border-radius:15px;background:#fcfaf8}
      .pfx-perms{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}
      .pfx-perm{border:1px solid #e9e0d9;border-radius:12px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center}
      .pfx-help-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin:15px 0}
      .pfx-help-item{border:1px solid #e8ded6;border-radius:15px;padding:15px;background:#fcfaf8}
      .pfx-help-icon{font-size:20px;margin-bottom:7px}.pfx-help-item b{display:block;margin-bottom:4px}
      .pfx-form{display:grid;grid-template-columns:1fr 220px;gap:12px;margin-top:15px}
      @media(max-width:760px){.pfx-user{grid-template-columns:40px 1fr}.pfx-role{grid-column:2}.pfx-perms,.pfx-help-grid,.pfx-form{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }
  async function usersPane(){
    profileExtraStyle();
    const client=window.supabase?.createClient?.('https://kcinhsldmnvhudivutzv.supabase.co','sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs',{auth:{persistSession:true,autoRefreshToken:true}});
    let rows=[],roles=[];
    const orgId=window.DENYACloud?.context?.organization?.id||localStorage.getItem('denya_active_org');
    if(client&&orgId){
      const q=await client.from('memberships').select('id,user_id,invited_email,status,created_at,role_id,roles(name,code,permissions)').eq('organization_id',orgId).order('created_at',{ascending:true});
      if(!q.error)rows=q.data||[];
      const rr=await client.from('roles').select('id,name,code,permissions').eq('organization_id',orgId).order('name');
      if(!rr.error)roles=rr.data||[];
    }
    const roleName=r=>r?.roles?.name||'Sin rol';
    return `<div class="pfx-wrap">
      <div class="pfx-intro"><div><div class="pfx-kicker">Equipo</div><div class="pfx-title">Usuarios y permisos</div><div class="pfx-sub">Controla quién puede entrar a esta empresa y qué puede hacer.</div></div><button class="primary" id="pfxInvite">+ Invitar usuario</button></div>
      <div class="pfx-card"><h3>Personas con acceso</h3><div class="pfx-note">Cada persona puede tener un rol diferente. Los permisos se aplican por empresa.</div>
      <div class="pfx-list" style="margin-top:15px">${rows.length?rows.map((r,i)=>`<div class="pfx-user"><div class="pfx-avatar">${(r.invited_email||'U').slice(0,1).toUpperCase()}</div><div><div class="pfx-user-name">${E(r.invited_email||('Usuario '+(i+1)))}</div><div class="pfx-user-meta">${E(r.status||'active')} · acceso a esta empresa</div></div><div class="pfx-role">${E(roleName(r))}</div></div>`).join(''):'<div class="pfx-empty"><b>Aún no hay usuarios adicionales</b><div class="pfx-note">Invita a tu equipo y asigna un rol para comenzar.</div></div>'}</div></div>
      <div class="pfx-card"><h3>Roles disponibles</h3><div class="pfx-note">Estos roles definen las áreas que cada usuario puede utilizar.</div>
      <div class="pfx-list" style="margin-top:15px">${roles.length?roles.map(r=>{const p=r.permissions||{};const keys=Object.keys(p).filter(k=>p[k]);return `<div class="pfx-user"><div class="pfx-avatar">✓</div><div><div class="pfx-user-name">${E(r.name)}</div><div class="pfx-user-meta">${E(r.code)}</div></div><div class="pfx-role">${keys.length} permisos</div></div><div class="pfx-perms" style="margin-top:-4px">${keys.map(k=>`<div class="pfx-perm"><span>${E(k)}</span><b>✓</b></div>`).join('')}</div>`}).join(''):'<div class="pfx-empty">No hay roles configurados para esta empresa.</div>'}</div></div>
      <div class="pfx-card"><h3>Invitar a tu equipo</h3><div class="pfx-note">La invitación se prepara aquí y se asignará el rol seleccionado.</div><div class="pfx-form"><input id="pfxEmail" type="email" placeholder="correo@empresa.com"><select id="pfxRole">${roles.map(r=>`<option value="${E(r.id)}">${E(r.name)}</option>`).join('')}</select></div><div class="v106-actions"><button class="primary" id="pfxSendInvite">Enviar invitación</button></div></div>
    </div>`;
  }
  async function supportDesignedPane(){
    profileExtraStyle();
    let tickets=[];
    try{const r=await window.DENYACloud?.listSupport?.();tickets=r?.tickets||r||[]}catch(_){}
    return `<div class="pfx-wrap"><div class="pfx-intro"><div><div class="pfx-kicker">Centro de ayuda</div><div class="pfx-title">Ayuda y soporte</div><div class="pfx-sub">Encuentra ayuda o envía una solicitud sin salir de SWEETLAB.</div></div></div>
      <div class="pfx-help-grid"><div class="pfx-help-item"><div class="pfx-help-icon">?</div><b>Ayuda con SWEETLAB</b><span class="pfx-note">Preguntas sobre funciones, configuración y uso.</span></div><div class="pfx-help-item"><div class="pfx-help-icon">⚙</div><b>Problemas técnicos</b><span class="pfx-note">Reporta errores o comportamientos inesperados.</span></div><div class="pfx-help-item"><div class="pfx-help-icon">↗</div><b>Mejoras y sugerencias</b><span class="pfx-note">Comparte ideas para mejorar tu espacio.</span></div></div>
      <div class="pfx-card"><h3>Crear una solicitud</h3><div class="pfx-note">Cuéntanos qué necesitas y podrás darle seguimiento desde aquí.</div><div class="v102-grid" style="margin-top:14px"><label>Tipo<select id="pfxCat"><option value="technical">Problema técnico</option><option value="general">Pregunta / ayuda</option><option value="feature">Sugerencia</option><option value="billing">Facturación</option></select></label><label>Prioridad<select id="pfxPriority"><option value="normal">Normal</option><option value="high">Alta</option><option value="urgent">Urgente</option><option value="low">Baja</option></select></label><label class="v102-full">Asunto<input id="pfxSubject" placeholder="¿En qué podemos ayudarte?"></label><label class="v102-full">Mensaje<textarea id="pfxMessage" rows="5" placeholder="Describe lo que ocurrió o lo que necesitas."></textarea></label></div><div class="v106-actions"><button class="primary" id="pfxTicket">Enviar solicitud</button></div></div>
      <div class="pfx-card"><h3>Mis solicitudes</h3><div class="pfx-note">Historial de solicitudes de esta empresa.</div><div class="pfx-list" style="margin-top:13px">${tickets.length?tickets.map(x=>`<div class="pfx-user"><div class="pfx-avatar">#</div><div><div class="pfx-user-name">${E(x.subject)}</div><div class="pfx-user-meta">${E(x.message||'')}</div></div><div class="pfx-role">${E(x.status||'Abierto')}</div></div>`).join(''):'<div class="pfx-empty"><b>Todo en orden</b><div class="pfx-note">Todavía no tienes solicitudes de soporte.</div></div>'}</div></div>
    </div>`;
  }
  async function render(tab='company'){
    if(tab!=='payments' && typeof window.__v105Cancel==='function')window.__v105Cancel();
    if(typeof setActive==='function')setActive('profile');
    titleEl.textContent='Perfil';

    if(tab==='payments'){
      if(window.DENYAPayments?.render){
        try{await window.DENYAPayments.render();return}
        catch(e){toast2(e.message||'No se pudo cargar pagos');return}
      }
    }

    if(tab==='account'){
      if(typeof views.subscription==='function')views.subscription();
      else if(typeof baseProfile==='function')baseProfile('subscription');
      setTimeout(()=>{if(content)content.insertAdjacentHTML('afterbegin',profileNavigation('account'))},0);
      return;
    }

    // IMPORTANT: use the established SWEETLAB Profile renderer for all existing sections.
    if(tab==='users'){
      content.innerHTML=pageHead('Perfil','Usuarios y permisos')+profileNavigation('users')+await usersPane();
      return;
    }
    if(tab==='support'){
      content.innerHTML=pageHead('Perfil','Ayuda y soporte')+profileNavigation('support')+await supportDesignedPane();
      const btn=document.getElementById('pfxTicket');
      if(btn)btn.onclick=async()=>{const subject=document.getElementById('pfxSubject').value.trim(),message=document.getElementById('pfxMessage').value.trim();if(!subject||!message)return toast2('Completa asunto y mensaje');btn.disabled=true;try{await window.DENYACloud.createSupport({subject,message,category:document.getElementById('pfxCat').value,priority:document.getElementById('pfxPriority').value});toast2('Solicitud enviada');render('support')}catch(e){toast2(e?.message||'No se pudo enviar')}finally{btn.disabled=false}};
      return;
    }
    if(typeof baseProfile==='function'){
      await baseProfile(tab==='account'?'subscription':tab);
      const existing=content.querySelector('.profile-tabs');
      if(existing)existing.outerHTML=profileNavigation(tab);
      else content.insertAdjacentHTML('afterbegin',profileNavigation(tab));
      return;
    }

    content.innerHTML=pageHead('Perfil','Perfil')+profileNavigation(tab)+'<div class="empty">No se pudo cargar este apartado.</div>';
  }

  window.renderProfile=render;
  views.profile=()=>render('company');

  window.renderProfile=render;
  views.profile=()=>render('company');
  const pb=document.querySelector('.nav button[data-view="profile"]');if(pb)pb.onclick=()=>render('company');
  document.querySelectorAll('.nav button[data-view="plan"],.nav button[data-view="subscription"]').forEach(x=>x.remove());
  window.DENYAProfileV110={render};
  render('company');
})();