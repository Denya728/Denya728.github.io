(function(){
  const DEFINITIONS={
    Emprende:{users:1,brands:1,finance:'Resumen',modules:{inventory:false,purchases:false,production:false,users:false},features:{advancedClients:false,advancedReports:false,customRoles:false}},
    Negocio:{users:3,brands:2,finance:'Completo',modules:{inventory:true,purchases:true,production:true,users:true},features:{advancedClients:true,advancedReports:false,customRoles:false}},
    Pro:{users:10,brands:5,finance:'Avanzado',modules:{inventory:true,purchases:true,production:true,users:true},features:{advancedClients:true,advancedReports:true,customRoles:true}}
  };
  const currentPlan=()=>state.subscription?.plan||state.plan||'Negocio';
  const planDef=()=>DEFINITIONS[currentPlan()]||DEFINITIONS.Negocio;
  const activeUsers=()=>Array.isArray(state.users)?state.users.filter(u=>u.active!==false):[];
  const brands=()=>Array.isArray(state.businessBrands)?state.businessBrands:[];

  function ensureData(){
    state.subscription=state.subscription||{plan:state.plan||'Negocio',billing:'Mensual',status:'Activa'};
    if(!Array.isArray(state.businessBrands)) state.businessBrands=[{id:'brand-main',name:'SweetLab',active:true}];
    if(!Array.isArray(state.permissionEvents)) state.permissionEvents=[];
    save();
  }
  ensureData();

  function neededFor(module){
    if(['inventory','purchases','production','users'].includes(module))return 'Negocio';
    if(['advancedReports','customRoles'].includes(module))return 'Pro';
    return 'Negocio';
  }
  function canModule(module){
    const d=planDef();
    if(Object.prototype.hasOwnProperty.call(d.modules,module))return !!d.modules[module];
    return true;
  }
  function canFeature(feature){return !!planDef().features[feature]}
  function logDenied(kind,target){
    state.permissionEvents.unshift({id:'perm-'+Date.now(),at:new Date().toISOString(),plan:currentPlan(),kind,target});
    state.permissionEvents=state.permissionEvents.slice(0,80);save();
  }
  function deny(label,needed){
    logDenied('denied',label);
    if(typeof toast==='function')toast(`${label}: disponible desde ${needed}`);
    return false;
  }
  function guardModule(module,label){return canModule(module)||deny(label||module,neededFor(module))}
  function guardFeature(feature,label){return canFeature(feature)||deny(label||feature,neededFor(feature))}

  window.DenyaPlanV54={definitions:DEFINITIONS,currentPlan,planDef,canModule,canFeature,guardModule,guardFeature,userLimit:()=>planDef().users,brandLimit:()=>planDef().brands};

  function ensureStyles(){
    if(document.getElementById('v54permstyle'))return;
    const s=document.createElement('style');s.id='v54permstyle';s.textContent=`
      .v54-planbar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0}.v54-planmetric{border:1px solid #eadfd4;background:#fff;border-radius:14px;padding:13px}.v54-planmetric small{display:block;color:#8e786a;font-size:10px;text-transform:uppercase;letter-spacing:.8px}.v54-planmetric b{display:block;font-size:20px;margin-top:5px}.v54-featuregrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}.v54-feature{border:1px solid #eadfd4;border-radius:13px;padding:12px;background:#fff}.v54-feature.off{opacity:.58}.v54-feature span{font-size:12px;color:#806d60}.plan-locked{opacity:1!important}.plan-locked:after{content:none!important;display:none!important}@media(max-width:800px){.v54-planbar,.v54-featuregrid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.v54-planbar,.v54-featuregrid{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }
  function updateNav(){
    ensureStyles();
    $$('.nav button[data-view]').forEach(b=>{
      const v=b.dataset.view;
      const module=v==='inventory'?'inventory':v==='users'?'users':null;
      if(!module)return;
      const ok=canModule(module);b.classList.toggle('plan-locked',!ok);b.title=ok?'':`Disponible desde ${neededFor(module)}`;
    });
  }

  const showBase=window.show;
  window.show=function(v){
    const map={inventory:'inventory',purchases:'purchases',production:'production',users:'users'};
    if(map[v]&&!guardModule(map[v],v==='inventory'?'Inventario y compras':v==='purchases'?'Compras':v==='production'?'Producción':'Usuarios')){
      setActive(v==='purchases'?'inventory':v);
      titleEl.textContent='Función no incluida';
      content.innerHTML=`<div class="card plan-gate-card"><div class="lock">🔒</div><h2>${esc(v==='inventory'?'Inventario y compras':v==='purchases'?'Compras':v==='production'?'Producción':'Usuarios')}</h2><p class="muted">Tu plan <b>${esc(currentPlan())}</b> no permite usar esta función.</p><p>Disponible desde <b>${neededFor(map[v])}</b>.</p><button class="primary" onclick="show('plan')">Ver mi plan</button></div>`;
      return;
    }
    showBase(v);updateNav();
  };
  $$('.nav button[data-view]').forEach(b=>b.onclick=()=>window.show(b.dataset.view));

  function wrap(name,check){
    const base=window[name];if(typeof base!=='function')return;
    window[name]=function(){if(check()===false)return false;return base.apply(this,arguments)};
  }
  wrap('openStockTab',()=>guardModule('inventory','Inventario y compras'));
  wrap('openAutoPurchasesV52',()=>guardModule('purchases','Compras automáticas'));
  wrap('receiveAutoPurchaseV52',()=>guardModule('purchases','Recibir compras'));
  wrap('receiveAllAutoPurchasesV52',()=>guardModule('purchases','Recibir compras'));
  wrap('openProductionPlanV51',()=>guardModule('production','Planeación de producción'));
  wrap('sendSelectedToProductionV51',()=>guardModule('production','Producción'));

  const orderActionBase=window.orderAction;
  if(typeof orderActionBase==='function')window.orderAction=function(id,action){
    if(['start','ready'].includes(action)&&!guardModule('production','Producción'))return false;
    return orderActionBase.apply(this,arguments);
  };

  const openUserBase=window.openUserV17;
  if(typeof openUserBase==='function')window.openUserV17=function(id){
    if(!guardModule('users','Usuarios'))return false;
    if(!id&&activeUsers().length>=planDef().users){toast(`Tu plan permite hasta ${planDef().users} usuario${planDef().users===1?'':'s'}`);return false}
    return openUserBase.apply(this,arguments);
  };

  window.addBrandV54=function(){
    const limit=planDef().brands;
    if(brands().filter(b=>b.active!==false).length>=limit){toast(`Tu plan permite hasta ${limit} marca${limit===1?'':'s'}`);return}
    const w=modal('Agregar marca',field('Nombre de la marca','v54brand',''),wrap=>{const name=wrap.querySelector('#v54brand').value.trim();if(!name){toast('Escribe el nombre');return false}state.businessBrands.push({id:'brand-'+Date.now(),name,active:true});save();views.plan();toast('Marca agregada')});
    return w;
  };
  window.toggleBrandV54=function(id){const b=brands().find(x=>x.id===id);if(!b)return;if(b.active===false&&brands().filter(x=>x.active!==false).length>=planDef().brands){toast(`Tu plan permite hasta ${planDef().brands} marcas activas`);return}b.active=b.active===false;save();views.plan()};

  const planBase=views.plan;
  views.plan=function(){
    if(planBase)planBase();ensureStyles();
    const d=planDef(),cur=currentPlan(),usersNow=activeUsers().length,brandsNow=brands().filter(b=>b.active!==false).length;
    const head=content.querySelector('.page-head');
    const summary=`<div class="v54-planbar"><div class="v54-planmetric"><small>Plan activo</small><b>${esc(cur)}</b></div><div class="v54-planmetric"><small>Usuarios</small><b>${usersNow} / ${d.users}</b></div><div class="v54-planmetric"><small>Marcas</small><b>${brandsNow} / ${d.brands}</b></div><div class="v54-planmetric"><small>Finanzas</small><b>${esc(d.finance)}</b></div></div><div class="helper"><b>Permisos aplicados:</b> los límites y bloqueos de esta demo ya se validan también al ejecutar acciones, no solo ocultando botones. Como esta versión sigue siendo local/static, la seguridad de servidor llegará con el punto 10.</div>`;
    if(head)head.insertAdjacentHTML('afterend',summary);else content.insertAdjacentHTML('afterbegin',summary);
    const feature=`<div class="v54-featuregrid"><div class="v54-feature ${d.modules.production?'':'off'}"><b>${d.modules.production?'✓':'🔒'} Producción</b><span>${d.modules.production?'Habilitada':'Desde Negocio'}</span></div><div class="v54-feature ${d.modules.purchases?'':'off'}"><b>${d.modules.purchases?'✓':'🔒'} Inventario y compras</b><span>${d.modules.purchases?'Habilitados':'Desde Negocio'}</span></div><div class="v54-feature ${d.features.advancedReports?'':'off'}"><b>${d.features.advancedReports?'✓':'🔒'} Reportes avanzados</b><span>${d.features.advancedReports?'Habilitados':'Solo Pro'}</span></div></div><div class="section"><div class="page-head" style="margin:0"><div><h3>Marcas / negocios</h3><div class="muted">Límite real según tu plan.</div></div><button class="secondary" onclick="addBrandV54()" ${brandsNow>=d.brands?'disabled':''}>+ Marca</button></div>${brands().map(b=>`<div class="v51-line"><span><b>${esc(b.name)}</b><div class="hint">${b.active!==false?'Activa':'Inactiva'}</div></span><button class="secondary" onclick="toggleBrandV54('${b.id}')">${b.active!==false?'Desactivar':'Activar'}</button></div>`).join('')}</div>`;
    content.insertAdjacentHTML('beforeend',feature);updateNav();
  };

  if(!document.querySelector('.nav button[data-view="plan"]')){
    const profile=document.querySelector('.nav button[data-view="profile"]');
    if(profile)profile.insertAdjacentHTML('afterend','<button data-view="plan">Mi plan</button>');
    const planBtn=document.querySelector('.nav button[data-view="plan"]');if(planBtn)planBtn.onclick=()=>window.show('plan');
  }
  updateNav();
})();