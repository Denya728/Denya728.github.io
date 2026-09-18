(function(){
  const profilePlans={
    Emprende:{price:249,users:1,templates:1,brands:1},
    Negocio:{price:449,users:3,templates:2,brands:2},
    Pro:{price:699,users:10,templates:6,brands:5}
  };
  const profileTemplates=[
    {id:'minimal',name:'Minimalista premium',min:'Emprende'},
    {id:'editorial',name:'Editorial dulce',min:'Negocio'},
    {id:'executive',name:'Ejecutiva',min:'Pro'},
    {id:'romantic',name:'Romántica',min:'Pro'},
    {id:'modern',name:'Ficha moderna',min:'Pro'},
    {id:'signature',name:'Signature premium',min:'Pro'}
  ];
  const rank={Emprende:1,Negocio:2,Pro:3};
  function ensureProfile(){
    if(!state.profile) state.profile={businessName:state.businessName||document.querySelector('.biz')?.textContent||'SweetLab',facebook:'',instagram:'',whatsapp:'',whatsappType:'business',email:'',address:'',description:'',logo:''};
    if(!state.subscription) state.subscription={plan:state.plan||'Negocio',status:'Activa',billing:'Mensual'};
    if(!Array.isArray(state.users)) state.users=[];
    if(!state.quoteTemplate) state.quoteTemplate='minimal';
    save();
  }
  ensureProfile();
  function esc2(v){return typeof esc==='function'?esc(String(v??'')):String(v??'')}
  function currentPlan(){return state.subscription?.plan||state.plan||'Negocio'}
  function allowedTemplate(t){return rank[currentPlan()]>=rank[t.min]}
  function initials(name){return String(name||'D').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'D'}
  function logoHtml(){const p=state.profile||{};return p.logo?`<img src="${p.logo}" alt="Logo">`:esc2(initials(p.businessName))}
  function saveProfileForm(){
    const g=id=>document.getElementById(id);
    state.profile.businessName=g('pfBusiness').value.trim()||'Mi negocio';
    state.profile.facebook=g('pfFacebook').value.trim();
    state.profile.instagram=g('pfInstagram').value.trim();
    state.profile.whatsapp=g('pfWhatsapp').value.trim();
    state.profile.whatsappType=g('pfWhatsappType').value;
    state.profile.email=g('pfEmail').value.trim();
    state.profile.address=g('pfAddress').value.trim();
    state.profile.description=g('pfDescription').value.trim();
    state.businessName=state.profile.businessName;
    const biz=document.querySelector('.biz');if(biz)biz.textContent=state.profile.businessName;
    const top=document.querySelector('.top small');if(top)top.textContent=state.profile.businessName;
    save();renderProfile('company');toast('Perfil guardado');
  }
  window.saveProfileForm=saveProfileForm;
  window.handleProfileLogo=function(input){const f=input.files&&input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.profile.logo=r.result;save();renderProfile('company');toast('Logo actualizado')};r.readAsDataURL(f)};
  window.removeProfileLogo=function(){state.profile.logo='';save();renderProfile('company')};
  window.setProfilePlan=function(name){
    if(!profilePlans[name])return;
    const cur=currentPlan();
    if(name===cur){toast('Este ya es tu plan actual');return}
    if(window.DENYAGateway&&typeof window.DENYAGateway.requestPlanChange==='function'){
      return window.DENYAGateway.requestPlanChange(name);
    }
    toast('El cambio de plan requiere confirmación de pago.');
  };
  window.setProfileTemplate=function(id){const t=profileTemplates.find(x=>x.id===id);if(!t)return;if(!allowedTemplate(t)){toast('Disponible desde '+t.min);return}state.quoteTemplate=id;save();renderProfile('templates');toast('Plantilla seleccionada')};
  function openProfileUser(id=null){
    if(typeof openUserV17==='function'){openUserV17(id);return}
    if(typeof openUser==='function'){openUser(id);return}
    toast('Gestión de usuarios no disponible en esta vista');
  }
  window.openProfileUser=openProfileUser;
  function socialLink(type,val){if(!val)return '';let href=val;if(type==='wa')href='https://wa.me/'+val.replace(/\D/g,'');else if(!/^https?:/i.test(href))href='https://'+href;return href}
  function companyPane(){const p=state.profile;return `<div class="profile-section"><h3>Datos de la empresa</h3><div class="profile-form"><label>Nombre de la empresa<input id="pfBusiness" value="${esc2(p.businessName)}"></label><label>Correo<input id="pfEmail" type="email" value="${esc2(p.email)}" placeholder="hola@minegocio.com"></label><label>Instagram<input id="pfInstagram" value="${esc2(p.instagram)}" placeholder="instagram.com/miempresa"></label><label>Facebook<input id="pfFacebook" value="${esc2(p.facebook)}" placeholder="facebook.com/miempresa"></label><label>WhatsApp<input id="pfWhatsapp" value="${esc2(p.whatsapp)}" placeholder="81 1234 5678"></label><label>Tipo de WhatsApp<select id="pfWhatsappType"><option value="business" ${p.whatsappType==='business'?'selected':''}>WhatsApp Business</option><option value="normal" ${p.whatsappType==='normal'?'selected':''}>WhatsApp normal</option></select></label><label class="full">Dirección / zona de atención<input id="pfAddress" value="${esc2(p.address)}" placeholder="Monterrey, Nuevo León"></label><label class="full">Descripción del negocio<textarea id="pfDescription" placeholder="Cuéntale a tus clientes qué hace especial a tu negocio">${esc2(p.description)}</textarea></label></div><div class="profile-actions"><button class="primary" onclick="saveProfileForm()">Guardar cambios</button></div></div><div class="profile-section"><h3>Logo de la empresa</h3><div class="profile-logo-box"><div class="profile-logo-preview">${logoHtml()}</div><div><input type="file" accept="image/*" onchange="handleProfileLogo(this)"><div class="hint" style="margin-top:6px">PNG o JPG. Se usará en perfil y cotizaciones.</div>${p.logo?'<button class="ghost" style="margin-top:8px" onclick="removeProfileLogo()">Quitar logo</button>':''}</div></div></div>`}
  function planPane(){const cur=currentPlan();return `<div class="profile-section"><h3>Plan actual</h3><div class="profile-plan-grid">${Object.entries(profilePlans).map(([name,p])=>`<div class="profile-plan-card ${cur===name?'active':''}"><h4>${name}</h4><div class="price">$${p.price} <small>/ mes</small></div><div class="hint">${p.users} usuario${p.users===1?'':'s'} · ${p.templates} plantilla${p.templates===1?'':'s'} · ${p.brands} marca${p.brands===1?'':'s'}</div><button class="${cur===name?'secondary':'primary'}" ${cur===name?'disabled':''} onclick="setProfilePlan('${name}')">${cur===name?'Plan actual':'Cambiar a '+name}</button></div>`).join('')}</div><div class="helper" style="margin-top:12px">Los cambios de plan se aplican únicamente después de confirmarse en el flujo seguro de facturación.</div></div>`}
  function templatePane(){return `<div class="profile-section"><h3>Plantillas disponibles</h3><div class="profile-template-grid">${profileTemplates.map(t=>{const ok=allowedTemplate(t),sel=state.quoteTemplate===t.id;return `<div class="profile-template ${sel?'selected':''} ${ok?'':'locked'}"><div class="mini">${esc2(t.name)}</div><b>${esc2(t.name)}</b><div class="hint">${ok?'Disponible':'Disponible desde '+t.min}</div><button style="margin-top:8px" class="${sel?'secondary':'primary'}" ${ok?'':'disabled'} onclick="setProfileTemplate('${t.id}')">${sel?'Seleccionada':ok?'Usar':'Bloqueada'}</button></div>`}).join('')}</div></div>`}
  function usersPane(){const p=profilePlans[currentPlan()]||profilePlans.Negocio;const active=(state.users||[]).filter(u=>u.active!==false).length;return `<div class="profile-section"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><h3 style="margin-bottom:4px">Usuarios</h3><div class="hint">${active} de ${p.users} usuarios activos</div></div><button class="primary" ${active>=p.users?'disabled':''} onclick="openProfileUser()">${active>=p.users?'Límite alcanzado':'+ Usuario'}</button></div><div class="profile-users">${(state.users||[]).map(u=>`<div class="profile-user"><div><b>${esc2(u.name)}</b><small>${esc2(u.email||'Sin correo')}</small></div><span class="profile-badge">${esc2(u.role||'Usuario')}</span><button class="secondary" onclick="openProfileUser('${u.id}')">Editar</button></div>`).join('')||'<div class="empty">No hay usuarios todavía.</div>'}</div></div>`}
  function summary(){const p=state.profile,cur=currentPlan(),cfg=profilePlans[cur]||profilePlans.Negocio;return `<aside class="profile-summary-card"><div class="profile-summary-logo">${logoHtml()}</div><h2 style="margin:0">${esc2(p.businessName)}</h2><div class="muted">${esc2(p.description||'Tu negocio dentro de DENYA')}</div><div class="profile-links">${p.instagram?`<a target="_blank" href="${socialLink('ig',p.instagram)}">Instagram</a>`:''}${p.facebook?`<a target="_blank" href="${socialLink('fb',p.facebook)}">Facebook</a>`:''}${p.whatsapp?`<a target="_blank" href="${socialLink('wa',p.whatsapp)}">WhatsApp</a>`:''}</div><div class="profile-divider"></div><div><small class="muted">PLAN ACTUAL</small><h3 style="margin:4px 0">${cur}</h3><div class="profile-plan-note">${cfg.users} usuario${cfg.users===1?'':'s'} · ${cfg.templates} plantilla${cfg.templates===1?'':'s'} · ${cfg.brands} marca${cfg.brands===1?'':'s'}</div></div><div class="profile-divider"></div><div><small class="muted">PLANTILLA ACTUAL</small><div style="margin-top:4px"><b>${esc2(profileTemplates.find(t=>t.id===state.quoteTemplate)?.name||'Minimalista premium')}</b></div></div></aside>`}
  window.renderProfile=function(tab='company'){
    ensureProfile();titleEl.textContent='Perfil';
    const tabs=[['company','Empresa'],['plan','Plan'],['templates','Plantillas'],['users','Usuarios']];
    let pane=companyPane();if(tab==='plan')pane=planPane();else if(tab==='templates')pane=templatePane();else if(tab==='users')pane=usersPane();
    content.innerHTML=pageHead('Perfil','Configura tu negocio, redes, plan, plantillas y usuarios.')+`<div class="profile-tabs">${tabs.map(([id,label])=>`<button class="${tab===id?'active':''}" onclick="renderProfile('${id}')">${label}</button>`).join('')}</div><div class="profile-shell"><div>${pane}</div>${summary()}</div>`;
    if(typeof setActive==='function')setActive('profile');
  };
  views.profile=()=>renderProfile('company');
  const oldShow=window.show;
  window.show=function(v){if(v==='profile'){renderProfile('company');return}oldShow(v)};
  $$('.nav button').forEach(b=>b.onclick=()=>window.show(b.dataset.view));
})();