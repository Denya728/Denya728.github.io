/* DENYA v114 — PROFILE HARD RESET */
(function(){
  var KEY='denya-profile-v114';
  var tabs=[
    ['company','Empresa','✦'],['account','Plan y suscripción','◇'],['customization','Personalización','◈'],
    ['payments','Pagos','₳'],['templates','Plantillas','▧'],['users','Usuarios','♙'],['support','Ayuda y soporte','?']
  ];
  function css(){
    if(document.getElementById(KEY+'-css')) return;
    var s=document.createElement('style'); s.id=KEY+'-css';
    s.textContent=`
#denya114{max-width:1180px;margin:0 auto;padding:8px 4px 40px;color:#302721}
#denya114 *{box-sizing:border-box} #denya114 .phead{margin-bottom:16px}
#denya114 .ey{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#9a806f;font-weight:850}
#denya114 h1{font-size:30px;margin:5px 0} #denya114 .sub{color:#7c7068;font-size:13px;margin:0}
#denya114 .tabs{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;background:#eee8e2;border:1px solid #ddd2c9;padding:5px;border-radius:17px;margin-bottom:16px}
#denya114 .tabs button{border:0;background:transparent;border-radius:12px;padding:11px 5px;color:#74675e;font-weight:750;cursor:pointer}
#denya114 .tabs button.on{background:#fff;color:#2e2621;box-shadow:0 3px 10px #39271812}
#denya114 .ico{display:block;font-size:17px;margin-bottom:4px}
#denya114 .panel{border:1px solid #e3d9d1;border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 10px 32px #4b321b0b}
#denya114 .pbody{padding:20px 25px}.title{padding:21px 25px;border-bottom:1px solid #eee6df}
#denya114 .title h2{margin:4px 0;font-size:21px}.title p{margin:0;color:#7c7068;font-size:12px}
#denya114 .grid{display:grid;grid-template-columns:1.35fr .8fr;gap:15px}.card{border:1px solid #e5dbd3;border-radius:18px;padding:20px;background:#fff}
#denya114 .card h3{margin:3px 0 5px;font-size:17px}.card p{color:#7d7068;font-size:12px;line-height:1.5;margin:0 0 14px}
#denya114 .companybar{display:flex;align-items:end;justify-content:space-between;gap:12px;padding:14px 16px;margin-bottom:15px;border:1px solid #e3d9d1;border-radius:17px;background:#fbf8f5}
#denya114 select,#denya114 input,#denya114 textarea{font:inherit} #denya114 .companybar select{display:block;min-width:280px;margin-top:5px;padding:10px;border:1px solid #d9cec5;border-radius:11px;background:#fff;font-weight:750}
#denya114 .hero{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:25px;border-radius:20px;background:linear-gradient(125deg,#fff,#f8efe8 62%,#ead5c4);border:1px solid #e1d3c8;margin-bottom:15px}
#denya114 .brand{display:flex;align-items:center;gap:15px}.logo{width:76px;height:76px;border-radius:22px;display:grid;place-items:center;background:#5a3a2e;color:white;font-size:27px;font-weight:850}
#denya114 .hero h3{font-size:25px;margin:4px 0}.status{padding:8px 12px;border-radius:999px;background:#f5faf2;border:1px solid #d8e5d3;color:#5e7657;font-size:11px;font-weight:800}
#denya114 .fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.fields label{font-size:11px;font-weight:800;color:#675a51}.full{grid-column:1/-1}
#denya114 .fields input,#denya114 .fields textarea,#denya114 .fields select{width:100%;margin-top:6px;padding:10px 11px;border:1px solid #ddd2c9;border-radius:10px;background:#fff}
#denya114 .actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:15px;border-top:1px solid #eee6df}
#denya114 button.primary,#denya114 button.secondary{border-radius:10px;padding:10px 14px;font-weight:800;cursor:pointer}
#denya114 button.primary{background:#4e3227;color:#fff;border:1px solid #4e3227}.secondary{background:#fff;color:#4e3227;border:1px solid #d8ccc2}
#denya114 .plans,#denya114 .templates,#denya114 .help{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
#denya114 .plan,#denya114 .template,#denya114 .helpitem{border:1px solid #e3d8cf;border-radius:16px;padding:17px}.plan.current{border:2px solid #5b3b2e;padding:16px}
#denya114 .price{font-size:25px;font-weight:850;margin:8px 0}.palette{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
#denya114 .pal{border:1px solid #e3d8cf;border-radius:16px;padding:14px;background:#fff;cursor:pointer;text-align:left}.sw{display:flex;gap:5px;margin-bottom:9px}.sw i{width:28px;height:28px;border-radius:8px}
#denya114 .person{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #eee6df}.avatar{width:38px;height:38px;border-radius:12px;background:#efe4da;display:grid;place-items:center;font-weight:850;color:#654839}.personmain{flex:1}.personmain b{display:block;font-size:12px}.personmain span{font-size:10px;color:#8a7b72}
#denya114 .badge{padding:6px 9px;border-radius:999px;background:#f4eee9;font-size:10px;font-weight:800}.empty{padding:22px;text-align:center;border:1px dashed #d9cec5;border-radius:14px;background:#fbf8f5;color:#7d7067;font-size:12px}
#denya114 .templatepreview{height:145px;background:#f7f2ed;padding:14px}.sheet{height:100%;background:white;border:1px solid #ddd2c9;border-radius:6px;padding:12px}.line{height:6px;background:#ded5ce;border-radius:4px;margin:8px 0}.bigline{height:10px;width:70%}.short{width:45%}
@media(max-width:900px){#denya114 .tabs{grid-template-columns:repeat(4,1fr)}#denya114 .grid{grid-template-columns:1fr}.plans,.templates,.help{grid-template-columns:1fr 1fr!important}.palette{grid-template-columns:repeat(2,1fr)}}
@media(max-width:620px){#denya114 .tabs{grid-template-columns:repeat(2,1fr)}#denya114 .pbody{padding:14px}.fields{grid-template-columns:1fr!important}.full{grid-column:auto}.companybar,.hero{flex-direction:column;align-items:stretch}.companybar select{width:100%;min-width:0}.plans,.templates,.help,.palette{grid-template-columns:1fr!important}}
`;
    document.head.appendChild(s);
  }
  function root(){return document.getElementById('content')}
  function activeOrg(){return (window.DENYACloud&&window.DENYACloud.context&&window.DENYACloud.context.organization)||{}}
  function profile(){return window.state&&state.profile?state.profile:(window.state?state.profile={}:{});}
  function esc(v){return String(v||'').replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function shell(tab,title,desc,body){
    return '<div id="denya114"><div class="phead"><div class="ey">Cuenta · Perfil</div><h1>Perfil</h1><p class="sub">Empresa, suscripción, marca, pagos y equipo.</p></div>'+
      '<div class="tabs">'+tabs.map(function(t){return '<button class="'+(t[0]===tab?'on':'')+'" data-114-tab="'+t[0]+'"><span class="ico">'+t[2]+'</span>'+t[1]+'</button>'}).join('')+
      '</div><div class="panel"><div class="title"><div class="ey">'+title+'</div><h2>'+title+'</h2><p>'+desc+'</p></div><div class="pbody">'+body+'</div></div></div>';
  }
  async function companies(){
    var list=[],c=null;try{c=window.supabase&&window.supabase.createClient?window.supabase.createClient('https://kcinhsldmnvhudivutzv.supabase.co','sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs'):null;if(c){var u=(await c.auth.getUser()).data.user;if(u){var q=await c.from('organizations').select('id,name,slug').eq('owner_user_id',u.id).eq('active',true).order('created_at');if(!q.error)list=q.data||[]}}}catch(e){}return list;
  }
  async function company(){
    var p=profile(),o=activeOrg(),name=p.businessName||o.name||'Mi negocio',cs=await companies(),sel=o.id||localStorage.getItem('denya_active_org')||'';
    var options=cs.map(function(x){return '<option value="'+esc(x.id)+'" '+(x.id===sel?'selected':'')+'>'+esc(x.name)+'</option>'}).join('');
    return shell('company','Empresa','Administra la identidad y los datos de esta empresa.',
      '<div class="companybar"><div><div class="ey">Empresa activa</div><select id="114org">'+options+'</select></div><button class="secondary" id="114add">＋ Agregar empresa</button></div>'+
      '<div class="hero"><div class="brand"><div class="logo">'+esc(name.slice(0,1).toUpperCase())+'</div><div><div class="ey">Identidad de tu negocio</div><h3>'+esc(name)+'</h3><p class="sub">Esta empresa es independiente de las demás.</p></div></div><div class="status">● Empresa activa</div></div>'+
      '<div class="grid"><section class="card"><div class="ey">Información comercial</div><h3>Datos de la empresa</h3><p>Información que puede aparecer en cotizaciones y documentos.</p><div class="fields">'+
      '<label class="full">Nombre<input id="114name" value="'+esc(p.businessName||name)+'"></label>'+
      '<label>Correo<input id="114email" value="'+esc(p.email||'')+'" placeholder="correo@empresa.com"></label><label>WhatsApp<input id="114wa" value="'+esc(p.whatsapp||'')+'" placeholder="+52..."></label>'+
      '<label>Instagram<input id="114ig" value="'+esc(p.instagram||'')+'" placeholder="@empresa"></label><label>Facebook<input id="114fb" value="'+esc(p.facebook||'')+'" placeholder="facebook.com/..."></label>'+
      '<label class="full">Descripción<textarea id="114desc" rows="4">'+esc(p.description||'')+'</textarea></label></div><div class="actions"><button class="primary" id="114save">Guardar cambios</button></div></section>'+
      '<aside class="card"><div class="ey">Estado</div><h3>Perfil de empresa</h3><p>Completa estos datos para tener una presentación profesional.</p><div class="person"><div class="avatar">✓</div><div class="personmain"><b>Información comercial</b><span>Nombre y datos básicos</span></div><span class="badge">Activo</span></div><div class="person"><div class="avatar">✓</div><div class="personmain"><b>Empresa activa</b><span>Los datos se separan por organización</span></div></div></aside></div>');
  }
  function account(){var s=window.state&&state.subscription||{},plan=s.plan||'Negocio',portal='https://billing.stripe.com/p/login/6oUcMY2j23d3aRqf270x200',prices={Emprende:'$249',Negocio:'$449',Pro:'$699'};return shell('account','Plan y suscripción','Aquí está el estado de tu cuenta y tu plan.','<div class="grid"><section class="card"><div class="ey">Plan actual</div><h3>'+esc(plan)+'</h3><p>Tu suscripción está asociada a tu cuenta de SWEETLAB.</p><div class="price">'+(prices[plan]||'—')+' <small>/ mes</small></div><span class="badge">Activo</span></section><section class="card"><div class="ey">Facturación</div><h3>Suscripción</h3><p>Administra ciclo, plan y datos de facturación.</p><button class="primary" id="114manage" onclick="window.location.href=\''+portal+'\'">Administrar suscripción</button></section></div><section class="card" style="margin-top:15px"><h3>Planes disponibles</h3><p>Elige el nivel que mejor corresponda a tu operación.</p><div class="plans">'+[['Emprende','$249'],['Negocio','$449'],['Pro','$699']].map(function(x){return '<div class="plan '+(x[0]===plan?'current':'')+'"><div class="ey">'+(x[0]===plan?'ACTUAL':'PLAN')+'</div><h3>'+x[0]+'</h3><div class="price">'+x[1]+' <small>/ mes</small></div><button class="secondary" data-114-plan="'+x[0]+'" onclick="window.location.href=\''+portal+'\'">'+(x[0]===plan?'Plan actual':'Ver plan')+'</button></div>'}).join('')+'</div></section>')}
  function customization(){return shell('customization','Personalización','Configura una apariencia de marca sin complicarte.','<section class="card"><h3>Elige una paleta</h3><p>Selecciona una combinación lista para usar.</p><div class="palette">'+[['Cacao','#5A3A2E','#F6F0EB','#C49A78'],['Arena','#6B584B','#F5F0EA','#B98F68'],['Rosa suave','#8D5F67','#FAF1F2','#C89AA2'],['Oliva','#53604A','#F1F3ED','#A3B08D'],['Azul noche','#34465A','#F0F4F8','#8EA6BE'],['Terracota','#8A4F3D','#FBF0EB','#C78368'],['Lavanda','#655978','#F4F1F8','#A997C5'],['Negro & crema','#292522','#F4EFE7','#B99A72']].map(function(x){return '<button class="pal" data-114-pal="'+x[1]+'|'+x[2]+'|'+x[3]+'"><div class="sw"><i style="background:'+x[1]+'"></i><i style="background:'+x[2]+'"></i><i style="background:'+x[3]+'"></i></div><b>'+x[0]+'</b></button>'}).join('')+'</div></section><section class="card" style="margin-top:15px"><h3>Colores personalizados</h3><div class="fields"><label>Principal<input id="114c1" type="color" value="#8f6b55"></label><label>Secundario<input id="114c2" type="color" value="#d9c1ae"></label><label>Acento<input id="114c3" type="color" value="#c59b72"></label></div><div class="actions"><button class="primary" id="114colors">Guardar colores</button></div></section>')}
  function templates(){return shell('templates','Plantillas','Selecciona el estilo visual de tus cotizaciones y documentos.','<div class="templates">'+[['Elegante','Premium y sofisticada'],['Clásica','Formal y clara'],['Minimalista','Moderna y limpia']].map(function(x,i){return '<article class="template"><div class="templatepreview"><div class="sheet"><div class="line bigline"></div><div class="line short"></div><div class="line"></div><div class="line"></div></div></div><div style="padding:14px"><b>'+x[0]+'</b><p>'+x[1]+'</p><button class="secondary" data-114-template="'+i+'">Usar plantilla</button></div></article>'}).join('')+'</div>')}
  async function users(){var c=null,org=activeOrg().id||localStorage.getItem('denya_active_org'),rows=[];try{c=window.supabase&&window.supabase.createClient?window.supabase.createClient('https://kcinhsldmnvhudivutzv.supabase.co','sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs'):null;if(c&&org){var q=await c.from('memberships').select('id,invited_email,status,roles(name,code)').eq('organization_id',org);if(!q.error)rows=q.data||[]}}catch(e){}return shell('users','Usuarios y permisos','Administra el acceso de tu equipo en esta empresa.','<div class="grid"><section class="card"><div class="ey">Equipo</div><h3>Usuarios</h3><p>Personas con acceso a esta empresa.</p>'+(rows.length?rows.map(function(r){return '<div class="person"><div class="avatar">'+esc((r.invited_email||'U').slice(0,1).toUpperCase())+'</div><div class="personmain"><b>'+esc(r.invited_email||'Usuario')+'</b><span>'+esc(r.status||'Activo')+'</span></div><span class="badge">'+esc(r.roles&&r.roles.name||'Sin rol')+'</span></div>'}).join(''):'<div class="empty">Aún no hay usuarios adicionales.<br><br>El propietario de la empresa tiene acceso total.</div>')+'</section><section class="card"><div class="ey">Permisos</div><h3>Roles</h3><p>Los permisos se administran por rol y por empresa.</p><div class="empty">Owner · Admin · Sales · Production · Cashier</div></section></div><section class="card" style="margin-top:15px"><h3>Invitar usuario</h3><p>El flujo de invitación se conectará con el sistema de usuarios.</p><div class="fields"><label>Correo<input id="114invite" placeholder="correo@empresa.com"></label><label>Rol<select><option>Admin</option><option>Sales</option><option>Production</option><option>Cashier</option></select></label></div><div class="actions"><button class="primary" id="114inviteBtn">Preparar invitación</button></div></section>')}
  function support(){return shell('support','Ayuda y soporte','Todo el soporte de SWEETLAB desde esta misma página.','<div class="help"><div class="helpitem"><b>¿Necesitas ayuda?</b><p>Consulta dudas sobre funciones y configuración.</p></div><div class="helpitem"><b>Problema técnico</b><p>Reporta errores, pantallas trabadas o conexiones.</p></div><div class="helpitem"><b>Sugerencia</b><p>Comparte ideas para mejorar SWEETLAB.</p></div></div><section class="card" style="margin-top:15px"><h3>Enviar solicitud</h3><p>Describe lo que necesitas y podremos darle seguimiento.</p><div class="fields"><label>Asunto<input id="114subject" placeholder="¿En qué podemos ayudarte?"></label><label>Tipo<select id="114cat"><option>Problema técnico</option><option>Pregunta / ayuda</option><option>Sugerencia</option><option>Facturación</option></select></label><label class="full">Mensaje<textarea id="114msg" rows="5"></textarea></label></div><div class="actions"><button class="primary" id="114ticket">Enviar solicitud</button></div></section>')}
  async function render(tab){
    css(); if(!root()) return;
    var body=tab==='company'?await company():tab==='account'?account():tab==='customization'?customization():tab==='templates'?templates():tab==='users'?await users():tab==='support'?support():null;
    if(tab==='payments' && window.DENYAPayments&&window.DENYAPayments.render){await window.DENYAPayments.render();return;}
    root().innerHTML=body; bind(tab);
  }
  function bind(tab){
    document.querySelectorAll('[data-114-tab]').forEach(function(b){b.onclick=function(e){e.preventDefault();e.stopPropagation();render(b.getAttribute('data-114-tab'));}});
    if(tab==='company'){
      var s=document.getElementById('114org'); if(s)s.onchange=async function(){localStorage.setItem('denya_active_org',this.value);if(window.DENYACloud&&window.DENYACloud.setActiveOrganization)await window.DENYACloud.setActiveOrganization(this.value);await render('company');};
      var a=document.getElementById('114add'); if(a)a.onclick=async function(){if(window.DENYAAccount&&window.DENYAAccount.createCompany){await window.DENYAAccount.createCompany();await render('company')}else alert('No está disponible el flujo para agregar empresa.');};
      var save=document.getElementById('114save'); if(save)save.onclick=function(){var p=profile();p.businessName=document.getElementById('114name').value.trim();p.email=document.getElementById('114email').value.trim();p.whatsapp=document.getElementById('114wa').value.trim();p.instagram=document.getElementById('114ig').value.trim();p.facebook=document.getElementById('114fb').value.trim();p.description=document.getElementById('114desc').value.trim();if(typeof window.save==='function')window.save();render('company');};
    }
    if(tab==='account'){var m=document.getElementById('114manage');if(m)m.onclick=function(e){e.preventDefault();e.stopPropagation();window.location.href='https://billing.stripe.com/p/login/6oUcMY2j23d3aRqf270x200';};}
    if(tab==='customization'){document.querySelectorAll('[data-114-pal]').forEach(function(b){b.onclick=function(){var z=b.dataset['114Pal'].split('|');document.getElementById('114c1').value=z[0];document.getElementById('114c2').value=z[1];document.getElementById('114c3').value=z[2];}});}
    if(tab==='support'){var t=document.getElementById('114ticket');if(t)t.onclick=function(){alert('Solicitud lista para conectar al centro de soporte.');};}
    if(tab==='users'){var i=document.getElementById('114inviteBtn');if(i)i.onclick=function(){alert('Primero selecciona el usuario y rol; el envío se conectará al sistema de invitaciones.');};}
  }
  function openProfile(e){if(e){e.preventDefault();e.stopImmediatePropagation();}render('company');return false;}
  function install(){
    css();
    var pbs=document.querySelectorAll('.nav button[data-view="profile"]');
    pbs.forEach(function(b){b.addEventListener('click',openProfile,true);});
    if(window.views) window.views.profile=function(){render('company');};
    if(location.hash==='#profile')render('company');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.__DENYA_PROFILE_V114={render:render,open:openProfile};
})();