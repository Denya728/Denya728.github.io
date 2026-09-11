(function(){
  const planDefs={
    Emprende:{price:249,users:1,brands:1,modules:['home','calendar','clients','products','recipes','measures','extras','quotations','orders','inventory','finance','plan'],finance:'Resumen',purchases:false,roles:false,reports:false},
    Negocio:{price:449,users:3,brands:2,modules:['home','calendar','clients','products','recipes','measures','extras','quotations','orders','inventory','purchases','finance','users','plan'],finance:'Completo',purchases:true,roles:false,reports:false},
    Pro:{price:699,users:10,brands:5,modules:['home','calendar','clients','products','recipes','measures','extras','quotations','orders','inventory','purchases','finance','users','plan'],finance:'Avanzado',purchases:true,roles:true,reports:true}
  };
  function currentPlan(){return (state.subscription&&state.subscription.plan)||state.plan||'Negocio'}
  function def(){return planDefs[currentPlan()]||planDefs.Negocio}
  function planLabelForModule(v){if(v==='purchases')return 'Negocio';if(v==='users')return 'Negocio';return 'Pro'}
  function applyNavLocks(){
    const d=def();
    $$('.nav button[data-view]').forEach(b=>{
      const v=b.dataset.view, ok=d.modules.includes(v);
      b.classList.toggle('plan-locked',!ok);
      b.title=ok?'':`Disponible desde ${planLabelForModule(v)}`;
    });
  }
  function lockedView(v){
    const d=def(),needed=planLabelForModule(v);titleEl.textContent='Función no incluida';
    content.innerHTML=`<div class="card plan-gate-card"><div class="lock">🔒</div><h2>${esc(v==='purchases'?'Compras':v==='users'?'Usuarios':'Esta función')}</h2><p class="muted">Tu plan <b>${esc(currentPlan())}</b> no incluye este módulo.</p><p>Disponible desde el plan <b>${needed}</b>.</p><button class="primary" onclick="show('plan')">Ver planes</button></div>`;
  }
  const baseShow=window.show;
  window.show=function(v){
    if(v!=='plan'&&!def().modules.includes(v)){setActive(v);lockedView(v);return}
    baseShow(v);applyNavLocks();
  };
  $$('.nav button').forEach(b=>b.onclick=()=>window.show(b.dataset.view));

  const oldClients=views.clients;
  views.clients=function(){
    if(typeof state.clientRecords==='undefined'&&oldClients){oldClients();return}
    titleEl.textContent='Clientes';
    const records=state.clientRecords||[];
    const rows=records.map(c=>{
      const qs=(state.quotes||[]).filter(q=>q.client===c.name),closed=qs.filter(q=>q.status==='Entregada y pagada'),total=closed.reduce((s,q)=>s+(Number(q.total)||0),0),orders=qs.filter(q=>['Aceptada','Entregada y pagada'].includes(q.status)).length;
      return `<div class="client-compact-row" data-v18-client="${esc((c.name+' '+(c.phone||'')+' '+(c.instagram||'')).toLowerCase())}"><div><h3>${esc(c.name)}</h3><div class="muted">${c.birthday?'Cumple: '+esc(c.birthday):'Cliente'}</div></div><div class="contact"><div>${esc(c.phone||'Sin teléfono')}</div><div class="hint">${esc(c.instagram||'Sin Instagram')}</div></div><div class="metric"><b>${qs.length}</b><span class="hint">Cotiz.</span></div><div class="metric"><b>${orders}</b><span class="hint">Pedidos</span></div><div class="metric"><b>${money(total)}</b><span class="hint">Comprado</span></div><div><span class="badge ${c.active!==false?'ok':'off'}">${c.active!==false?'Activo':'Inactivo'}</span></div><div class="row-actions"><button class="secondary" onclick="clientHistoryV17('${c.id}')">Historial</button><button class="secondary" onclick="openClientV17('${c.id}')">Editar</button>${c.phone?`<button class="ghost" onclick="window.open('https://wa.me/${String(c.phone).replace(/\D/g,'')}','_blank')">WhatsApp</button>`:''}</div></div>`;
    }).join('');
    content.innerHTML=pageHead('Clientes','Historial, contacto y valor de cada cliente.',`<button class="primary" onclick="openClientV17()">+ Nuevo cliente</button>`)+`<div class="toolbar"><input id="v18ClientSearch" placeholder="Buscar cliente, teléfono o Instagram" style="flex:1"></div><div class="client-list-head"><div>Cliente</div><div>Contacto</div><div>Cotiz.</div><div>Pedidos</div><div>Comprado</div><div>Estado</div><div>Acciones</div></div><div class="client-compact-list">${rows||'<div class="card empty">Aún no hay clientes.</div>'}</div>`;
    const s=$('#v18ClientSearch');if(s)s.oninput=()=>{const q=s.value.toLowerCase();$$('[data-v18-client]').forEach(el=>el.style.display=el.dataset.v18Client.includes(q)?'':'none')};
    applyNavLocks();
  };

  window.setDemoPlanV18=function(name){
    if(!planDefs[name])return;
    state.subscription=state.subscription||{};state.subscription.plan=name;state.plan=name;save();applyNavLocks();views.plan();toast('Plan cambiado a '+name);
  };
  views.plan=function(){
    titleEl.textContent='Mi plan';const cur=currentPlan(),d=def();
    const rows=[
      ['Productos, recetas, presentaciones y extras','✓','✓','✓'],['Clientes y calendario','✓','✓','✓'],['Cotizaciones, PDF y WhatsApp','✓','✓','✓'],['Pedidos','✓','✓','✓'],['Inventario','Básico','Completo','Completo'],['Compras','—','✓','✓'],['Finanzas','Resumen','Completo','Avanzado'],['Usuarios','1 propietario','Hasta 3','Hasta 10'],['Marcas / subempresas','1','2','5'],['Roles personalizados','—','—','✓'],['Reportes avanzados','—','—','✓'],['Soporte prioritario','—','—','✓']
    ];
    content.innerHTML=pageHead('Mi plan','Cambiar el plan modifica de inmediato lo que puedes usar en esta demo.')+`<div class="plan-current-strip"><div><strong>Plan activo: ${esc(cur)}</strong><div class="plan-limit">${d.users} usuario${d.users===1?'':'s'} · ${d.brands} marca${d.brands===1?'':'s'} · Finanzas ${d.finance}</div></div><span class="badge ok">Activo</span></div><div class="grid3">${Object.entries(planDefs).map(([name,p])=>`<div class="card ${cur===name?'plan-card-selected':''}"><div class="muted">${cur===name?'PLAN ACTUAL':'PLAN'}</div><h2>${name}</h2><div style="font-size:32px;font-weight:900">${money(p.price)}<span class="muted" style="font-size:14px"> / mes</span></div><div class="usage" style="margin:14px 0"><span>✓ ${p.users} usuario${p.users===1?'':'s'}</span><span>✓ ${p.brands} marca${p.brands===1?'':'s'}</span><span>${p.purchases?'✓':'—'} Compras</span><span>✓ Finanzas ${p.finance}</span><span>${p.roles?'✓':'—'} Roles personalizados</span></div><button class="${cur===name?'secondary':'primary'}" onclick="setDemoPlanV18('${name}')">${cur===name?'Seleccionado':'Cambiar a '+name}</button></div>`).join('')}</div><div class="table-wrap" style="margin-top:18px"><table class="table"><thead><tr><th>Función</th><th>Emprende</th><th>Negocio</th><th>Pro</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>`;
    applyNavLocks();
  };

  const oldUsers=views.users;
  views.users=function(){
    const d=def();if(!d.modules.includes('users')){lockedView('users');return}
    if(oldUsers)oldUsers();
    const addBtn=content.querySelector('.page-head .primary');
    if(addBtn&&state.users&&state.users.filter(u=>u.active!==false).length>=d.users){addBtn.disabled=true;addBtn.textContent=`Límite de ${d.users} usuarios`;}
    if(!d.roles){content.insertAdjacentHTML('afterbegin',`<div class="helper"><b>Plan ${esc(currentPlan())}:</b> puedes administrar usuarios básicos. Los roles y permisos personalizados están disponibles en Pro.</div>`)}
    applyNavLocks();
  };

  const oldFinance=views.finance;
  views.finance=function(){if(oldFinance)oldFinance();const mode=def().finance;if(mode==='Resumen'){const tb=content.querySelector('.table-wrap');if(tb)tb.style.display='none';const toolbar=content.querySelector('.toolbar');if(toolbar)toolbar.style.display='none';content.insertAdjacentHTML('afterbegin','<div class="helper"><b>Finanzas resumen:</b> Emprende muestra indicadores generales. Detalle por venta y filtros están disponibles en Negocio.</div>')}applyNavLocks()};

  applyNavLocks();
})();