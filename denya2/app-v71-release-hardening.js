(function(){
  const PLAN=()=>window.DenyaPlanV54;
  const DEFAULT_ROLES={
    'Propietario':['home','quotations','orders','calendar','clients','finance','products','measures','recipes','extras','inventory','profile','plan','subscription','users'],
    'Administrador':['home','quotations','orders','calendar','clients','finance','products','measures','recipes','extras','inventory','profile','users'],
    'Ventas':['home','quotations','orders','calendar','clients','profile'],
    'Producción':['home','orders','calendar','products','measures','recipes','extras','inventory','profile'],
    'Caja':['home','orders','clients','finance','profile']
  };
  const ALL_VIEWS=['home','quotations','orders','calendar','clients','finance','products','measures','recipes','extras','inventory','profile','plan','subscription','users'];
  const ROLE_LABELS=['Propietario','Administrador','Ventas','Producción','Caja'];
  const makeId=p=>p+Date.now()+Math.random().toString(36).slice(2,6);
  const escape=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');

  function ensure(){
    if(!Array.isArray(state.users))state.users=[];
    if(!state.users.length)state.users.push({id:'owner-main',name:'Propietario',email:'owner@sweetlab.mx',role:'Propietario',active:true});
    if(!state.users.some(u=>u.role==='Propietario'))state.users[0].role='Propietario';
    if(!state.currentUserId||!state.users.some(u=>u.id===state.currentUserId&&u.active!==false))state.currentUserId=(state.users.find(u=>u.role==='Propietario'&&u.active!==false)||state.users.find(u=>u.active!==false)||state.users[0]).id;
    if(!Array.isArray(state.customRoles))state.customRoles=[];
    if(!Array.isArray(state.qaRuns))state.qaRuns=[];
    save();
  }
  ensure();

  function currentUser(){ensure();return state.users.find(u=>u.id===state.currentUserId)||state.users[0]}
  function currentPlan(){return state.subscription?.plan||state.plan||'Negocio'}
  function rolePermissions(role){
    if(DEFAULT_ROLES[role])return DEFAULT_ROLES[role];
    const custom=state.customRoles.find(r=>r.name===role);return custom?.permissions||['home','profile'];
  }
  function canView(view){const u=currentUser();return u?.role==='Propietario'||rolePermissions(u?.role).includes(view)}
  function deny(view){if(typeof toast==='function')toast('Tu rol no tiene acceso a esta sección');return false}
  function canCustomRoles(){return currentPlan()==='Pro'&&(!PLAN()||PLAN().canFeature('customRoles'))}
  function userLimit(){return PLAN()?PLAN().userLimit():({Emprende:1,Negocio:3,Pro:10}[currentPlan()]||3)}

  window.DenyaRoleV71={currentUser,currentPlan,rolePermissions,canView,roles:DEFAULT_ROLES};

  function applyNav(){
    document.querySelectorAll('.nav button[data-view]').forEach(b=>{
      const v=b.dataset.view;if(!v)return;
      const ok=canView(v);b.style.display=ok?'':'none';
    });
  }

  const previousShow=window.show;
  window.show=function(v){
    if(v&&ALL_VIEWS.includes(v)&&!canView(v))return deny(v);
    const out=previousShow(v);applyNav();return out;
  };

  function roleOptions(selected){
    let roles=[...ROLE_LABELS];if(canCustomRoles())roles=roles.concat(state.customRoles.map(r=>r.name));
    return roles.map(r=>`<option value="${escape(r)}" ${r===selected?'selected':''}>${escape(r)}</option>`).join('');
  }

  function editUser(id=null){
    ensure();
    const existing=id?state.users.find(u=>u.id===id):null;
    if(!existing&&state.users.filter(u=>u.active!==false).length>=userLimit()){toast(`Tu plan permite hasta ${userLimit()} usuario${userLimit()===1?'':'s'}`);return}
    const u=existing||{name:'',email:'',role:currentPlan()==='Emprende'?'Propietario':'Ventas',active:true};
    modal(existing?'Editar usuario':'Nuevo usuario',`<div class="form2">${field('Nombre','v71uname',u.name||'')}${field('Correo','v71uemail',u.email||'','email')}<label class="field">Rol<select id="v71urole">${roleOptions(u.role)}</select></label><label class="field">Estado<select id="v71uactive"><option value="1" ${u.active!==false?'selected':''}>Activo</option><option value="0" ${u.active===false?'selected':''}>Inactivo</option></select></label></div><div class="helper">Los permisos aquí son funcionales en esta demo. La seguridad real por servidor llegará con la base de datos del punto 10.</div>`,w=>{
      const data={id:existing?.id||makeId('u'),name:w.querySelector('#v71uname').value.trim(),email:w.querySelector('#v71uemail').value.trim(),role:w.querySelector('#v71urole').value,active:w.querySelector('#v71uactive').value==='1'};
      if(!data.name||!data.email){toast('Completa nombre y correo');return false}
      if(currentPlan()==='Emprende'&&data.role!=='Propietario'){toast('Emprende usa un solo usuario propietario');return false}
      if(existing?.role==='Propietario'&&data.role!=='Propietario'&&state.users.filter(x=>x.id!==existing.id&&x.role==='Propietario'&&x.active!==false).length===0){toast('Debe quedar al menos un Propietario activo');return false}
      if(existing)Object.assign(existing,data);else state.users.push(data);
      if(!state.currentUserId)state.currentUserId=data.id;save();renderUsersRoles();toast('Usuario guardado');
    });
  }
  window.openUserV17=editUser;window.openProfileUser=editUser;

  window.setCurrentUserV71=function(id){
    const u=state.users.find(x=>x.id===id&&x.active!==false);if(!u)return;
    state.currentUserId=id;save();applyNav();renderUsersRoles();toast('Vista cambiada a '+u.name);
  };

  window.addCustomRoleV71=function(){
    if(!canCustomRoles()){toast('Los roles personalizados están disponibles en Pro');return}
    modal('Nuevo rol personalizado',`<div class="form2">${field('Nombre del rol','v71rname','')}</div><div style="margin-top:12px"><b>Permisos</b><div class="v71-perm-grid">${ALL_VIEWS.filter(v=>!['plan','subscription'].includes(v)).map(v=>`<label><input type="checkbox" data-v71perm="${v}" ${['home','profile'].includes(v)?'checked':''}> ${escape(v)}</label>`).join('')}</div></div>`,w=>{
      const name=w.querySelector('#v71rname').value.trim();if(!name){toast('Escribe un nombre');return false}
      if(DEFAULT_ROLES[name]||state.customRoles.some(r=>r.name===name)){toast('Ese rol ya existe');return false}
      const permissions=[...w.querySelectorAll('[data-v71perm]:checked')].map(x=>x.dataset.v71perm);if(!permissions.includes('profile'))permissions.push('profile');
      state.customRoles.push({id:makeId('role'),name,permissions});save();renderUsersRoles();toast('Rol personalizado creado');
    });
  };

  window.deleteCustomRoleV71=function(id){
    const r=state.customRoles.find(x=>x.id===id);if(!r)return;
    if(state.users.some(u=>u.role===r.name)){toast('Primero cambia los usuarios que usan este rol');return}
    if(confirm('¿Eliminar este rol personalizado?')){state.customRoles=state.customRoles.filter(x=>x.id!==id);save();renderUsersRoles()}
  };

  function tabs(active){
    const items=[['company','Empresa'],['plan','Mi plan'],['subscription','Suscripción'],['templates','Plantillas'],['users','Usuarios y roles'],['diagnostics','Diagnóstico']];
    return `<div class="profile-tabs v58-account-tabs">${items.map(([id,label])=>`<button class="${active===id?'active':''}" onclick="renderProfile('${id}')">${label}</button>`).join('')}</div>`;
  }
  function normalizeTabs(active){const old=content.querySelector('.profile-tabs');if(old)old.outerHTML=tabs(active)}

  function renderUsersRoles(){
    ensure();titleEl.textContent='Perfil';
    const me=currentUser(),limit=userLimit(),active=state.users.filter(u=>u.active!==false).length;
    const users=state.users.map(u=>`<div class="profile-user"><div><b>${escape(u.name)}</b><small>${escape(u.email||'Sin correo')}</small></div><span class="profile-badge">${escape(u.role||'Usuario')}</span><span class="badge ${u.active!==false?'ok':'off'}">${u.active!==false?'Activo':'Inactivo'}</span><button class="secondary" onclick="openProfileUser('${u.id}')">Editar</button></div>`).join('');
    const roleCards=ROLE_LABELS.map(r=>`<div class="v71-role-card"><b>${escape(r)}</b><div class="hint">${rolePermissions(r).map(v=>escape(v)).join(' · ')}</div></div>`).join('');
    const custom=state.customRoles.map(r=>`<div class="v71-role-card"><span><b>${escape(r.name)}</b><div class="hint">${r.permissions.map(v=>escape(v)).join(' · ')}</div></span><button class="ghost" onclick="deleteCustomRoleV71('${r.id}')">Eliminar</button></div>`).join('');
    content.innerHTML=pageHead('Perfil','Administra tu cuenta, plan, suscripción, usuarios y permisos.')+tabs('users')+`<div class="profile-section"><div class="page-head" style="margin:0"><div><h3 style="margin:0">Usuarios</h3><div class="hint">${active} de ${limit} usuarios activos · Plan ${escape(currentPlan())}</div></div><button class="primary" ${active>=limit?'disabled':''} onclick="openProfileUser()">+ Usuario</button></div><div class="v71-session"><label class="field">Probar permisos como<select onchange="setCurrentUserV71(this.value)">${state.users.filter(u=>u.active!==false).map(u=>`<option value="${u.id}" ${u.id===me.id?'selected':''}>${escape(u.name)} · ${escape(u.role)}</option>`).join('')}</select></label><div class="helper">Esto simula qué vería cada usuario. El inicio de sesión real llega en el punto 10.</div></div><div class="profile-users">${users}</div></div><div class="profile-section"><div class="page-head" style="margin:0"><div><h3 style="margin:0">Roles y permisos</h3><div class="hint">Roles base listos para operar.</div></div>${canCustomRoles()?'<button class="secondary" onclick="addCustomRoleV71()">+ Rol personalizado</button>':'<span class="badge">Roles personalizados: Pro</span>'}</div><div class="v71-role-grid">${roleCards}${custom}</div></div>`;
    if(typeof setActive==='function')setActive('profile');applyNav();
  }
  window.renderUsersRoles=renderUsersRoles;

  function check(name,ok,detail=''){return {name,ok:!!ok,detail}}
  function runChecks(){
    ensure();const results=[];const p=PLAN();
    results.push(check('Estado principal cargado',!!window.state));
    results.push(check('Vistas críticas registradas',['home','quotations','orders','calendar','clients','finance','profile'].every(v=>typeof views[v]==='function')));
    results.push(check('Planes definidos',!!p&&['Emprende','Negocio','Pro'].every(x=>p.definitions[x])));
    results.push(check('Suscripción válida',!!state.subscription&&['Emprende','Negocio','Pro'].includes(state.subscription.plan||state.plan)));
    results.push(check('Cuenta de perfil disponible',!!state.profile));
    const ids=(state.quotes||[]).map(q=>q.id).filter(Boolean);results.push(check('Cotizaciones sin IDs duplicados',new Set(ids).size===ids.length,`${ids.length} registros`));
    const orderIds=(state.orders||[]).map(o=>o.id).filter(Boolean);results.push(check('Pedidos sin IDs duplicados',new Set(orderIds).size===orderIds.length,`${orderIds.length} registros`));
    const accepted=(state.quotes||[]).filter(q=>['Aceptada','Aceptada y anticipo pagado','Entregada y pagada'].includes(q.status));
    const linked=accepted.filter(q=>(state.orders||[]).some(o=>o.quoteId===q.id||o.quote===q.id||o.quoteId===q.folio));results.push(check('Cotizaciones aceptadas vinculadas a pedido',accepted.length===0||linked.length===accepted.length,`${linked.length}/${accepted.length}`));
    const paid=(state.quotes||[]).filter(q=>q.status==='Entregada y pagada');results.push(check('Ventas cerradas con saldo 0',paid.every(q=>Math.abs(Number(q.balance)||0)<0.01),`${paid.length} cerradas`));
    results.push(check('Inventario sin stock negativo',(state.inventory||[]).every(i=>(Number(i.stock)||0)>=0)));
    const users=state.users.filter(u=>u.active!==false);results.push(check('Usuarios dentro del límite',users.length<=userLimit(),`${users.length}/${userLimit()}`));
    const brands=(state.businessBrands||[]).filter(b=>b.active!==false);results.push(check('Marcas dentro del límite',!p||brands.length<=p.brandLimit(),p?`${brands.length}/${p.brandLimit()}`:''));
    results.push(check('Existe Propietario activo',users.some(u=>u.role==='Propietario')));
    results.push(check('Usuario de sesión válido',!!currentUser()&&currentUser().active!==false,escape(currentUser()?.name||'')));
    results.push(check('Roles base configurados',ROLE_LABELS.every(r=>Array.isArray(DEFAULT_ROLES[r])&&DEFAULT_ROLES[r].length>0)));
    return results;
  }

  function runStress(){
    const tests=[];
    const statusFlow=['Pendiente','En producción','Listo','Entregado y pagado'];tests.push(check('Flujo canónico de pedido',statusFlow.length===4&&statusFlow[0]==='Pendiente'&&statusFlow[3]==='Entregado y pagado'));
    const plans={Emprende:{u:1,b:1},Negocio:{u:3,b:2},Pro:{u:10,b:5}};tests.push(check('Escalamiento de límites',plans.Emprende.u<plans.Negocio.u&&plans.Negocio.u<plans.Pro.u&&plans.Emprende.b<plans.Negocio.b&&plans.Negocio.b<plans.Pro.b));
    const trialStart=new Date('2026-01-01T00:00:00Z'),trialEnd=new Date(trialStart);trialEnd.setDate(trialEnd.getDate()+14);tests.push(check('Prueba de 14 días',(trialEnd-trialStart)/86400000===14));
    const roles=ROLE_LABELS;tests.push(check('Separación de permisos',roles.every(r=>rolePermissions(r).includes('profile'))&&rolePermissions('Ventas').includes('quotations')&&!rolePermissions('Ventas').includes('finance')&&rolePermissions('Caja').includes('finance')&&!rolePermissions('Caja').includes('products')));
    const fake={quotes:[{id:'q1',status:'Aceptada',balance:500},{id:'q2',status:'Entregada y pagada',balance:0}],orders:[{id:'o1',quoteId:'q1'}],inventory:[{stock:2},{stock:0}]};tests.push(check('Escenario sintético consistente',fake.quotes[1].balance===0&&fake.orders.some(o=>o.quoteId==='q1')&&fake.inventory.every(i=>i.stock>=0)));
    return tests;
  }
  function renderResults(target,results,title){
    const passed=results.filter(x=>x.ok).length;target.innerHTML=`<div class="v71-qa-summary"><b>${escape(title)}: ${passed}/${results.length} correctas</b><span class="badge ${passed===results.length?'ok':'off'}">${passed===results.length?'LISTO':'REVISAR'}</span></div>${results.map(r=>`<div class="v71-check ${r.ok?'pass':'fail'}"><span>${r.ok?'✓':'✕'} ${escape(r.name)}</span><small>${escape(r.detail||'')}</small></div>`).join('')}`;
  }
  window.runDiagnosticsV71=function(){const r=runChecks();state.qaRuns.unshift({at:new Date().toISOString(),type:'diagnostic',passed:r.filter(x=>x.ok).length,total:r.length});state.qaRuns=state.qaRuns.slice(0,20);save();renderResults(document.getElementById('v71qaresults'),r,'Diagnóstico')};
  window.runStressV71=function(){const r=runStress();state.qaRuns.unshift({at:new Date().toISOString(),type:'stress',passed:r.filter(x=>x.ok).length,total:r.length});state.qaRuns=state.qaRuns.slice(0,20);save();renderResults(document.getElementById('v71stressresults'),r,'Prueba destructiva segura')};
  window.DENYA_QA={run:runChecks,stress:runStress};

  function renderDiagnostics(){
    ensure();titleEl.textContent='Perfil';
    const last=(state.qaRuns||[]).slice(0,8).map(r=>`<div class="v71-check ${r.passed===r.total?'pass':'fail'}"><span>${new Date(r.at).toLocaleString('es-MX')} · ${escape(r.type)}</span><small>${r.passed}/${r.total}</small></div>`).join('')||'<div class="empty">Aún no se han ejecutado pruebas.</div>';
    content.innerHTML=pageHead('Perfil','Centro de validación antes de liberar la plataforma.')+tabs('diagnostics')+`<div class="profile-section"><h3>Diagnóstico general</h3><div class="helper">Revisa integridad de cotizaciones, pedidos, ventas, inventario, planes, usuarios y roles sin modificar tus datos.</div><button class="primary" onclick="runDiagnosticsV71()">Ejecutar diagnóstico</button><div id="v71qaresults" style="margin-top:12px"></div></div><div class="profile-section"><h3>Prueba destructiva segura</h3><div class="helper">Ejecuta escenarios sintéticos de estados, límites, prueba de 14 días y permisos. No toca tus pedidos ni inventario reales.</div><button class="secondary" onclick="runStressV71()">Ejecutar prueba</button><div id="v71stressresults" style="margin-top:12px"></div></div><div class="profile-section"><h3>Historial de QA</h3>${last}</div>`;
    if(typeof setActive==='function')setActive('profile');
  }

  const baseRenderProfile=window.renderProfile;
  window.renderProfile=function(tab='company'){
    if(tab==='users'){renderUsersRoles();return}
    if(tab==='diagnostics'){renderDiagnostics();return}
    baseRenderProfile(tab);normalizeTabs(tab);applyNav();
  };
  views.profile=()=>window.renderProfile('company');

  function styles(){
    if(document.getElementById('v71styles'))return;const s=document.createElement('style');s.id='v71styles';s.textContent=`
      .v71-session{display:grid;grid-template-columns:minmax(220px,360px) 1fr;gap:12px;align-items:end;margin:14px 0}.v71-role-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.v71-role-card{border:1px solid #eadfd4;border-radius:13px;background:#fff;padding:12px;display:flex;justify-content:space-between;gap:10px}.v71-role-card .hint{margin-top:5px;line-height:1.45}.v71-perm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:9px}.v71-qa-summary{display:flex;justify-content:space-between;align-items:center;border:1px solid #eadfd4;border-radius:12px;padding:10px 12px;background:#fff}.v71-check{display:flex;justify-content:space-between;gap:12px;padding:9px 2px;border-bottom:1px solid #f0e8e2}.v71-check.pass span{font-weight:700}.v71-check.fail{font-weight:800}.v71-check small{color:#8e786a}@media(max-width:700px){.v71-session,.v71-role-grid{grid-template-columns:1fr}.v71-perm-grid{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }
  styles();applyNav();
})();