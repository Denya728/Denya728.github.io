(function(){
  const api=window.DenyaPlanV54;
  if(!api||!api.definitions)return;

  Object.assign(api.definitions.Emprende,{
    users:1,brands:1,finance:'Básico',
    modules:{inventory:false,purchases:false,production:false,users:false},
    features:{advancedClients:false,advancedReports:false,customRoles:false}
  });
  Object.assign(api.definitions.Negocio,{
    users:3,brands:2,finance:'Completo',
    modules:{inventory:true,purchases:true,production:true,users:true},
    features:{advancedClients:true,advancedReports:false,customRoles:false}
  });
  Object.assign(api.definitions.Pro,{
    users:10,brands:5,finance:'Avanzado',
    modules:{inventory:true,purchases:true,production:true,users:true},
    features:{advancedClients:true,advancedReports:true,customRoles:true}
  });

  function ensureStyle(){
    if(document.getElementById('v55planstyle'))return;
    const s=document.createElement('style');s.id='v55planstyle';s.textContent=`
      .v55-intro{background:#fff;border:1px solid #eadfd4;border-radius:16px;padding:16px;margin:12px 0}.v55-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:14px 0}.v55-card{background:#fff;border:1px solid #eadfd4;border-radius:18px;padding:17px;position:relative}.v55-card.recommended{border:2px solid #3a2d27}.v55-tag{display:inline-flex;padding:5px 9px;border-radius:999px;background:#f1ebe6;font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.7px}.v55-card h2{margin:10px 0 4px}.v55-card .v55-why{color:#7f6d61;min-height:42px}.v55-list{margin:13px 0;display:grid;gap:7px}.v55-list div{font-size:13px}.v55-extra{opacity:.78}.v55-compare td,.v55-compare th{text-align:center}.v55-compare td:first-child,.v55-compare th:first-child{text-align:left}@media(max-width:850px){.v55-cards{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  const price={Emprende:249,Negocio:449,Pro:699};
  const copy={
    Emprende:{tag:'Para empezar',title:'Emprende',why:'Lo esencial para cotizar, organizar pedidos y tener control básico sin complicarte.',items:['Cotizaciones y PDF','Clientes básicos','Calendario','Productos, recetas y presentaciones','Pedidos básicos','Finanzas básicas','1 usuario · 1 marca']},
    Negocio:{tag:'Para operar de verdad',title:'Negocio',why:'Cuando ya tienes más movimiento y necesitas controlar producción, inventario, compras y operación diaria.',items:['Todo Emprende','Producción y planeación semanal','Inventario y compras automáticas','Clientes con métricas e historial','Finanzas completas','Hasta 3 usuarios','Hasta 2 marcas']},
    Pro:{tag:'Extras que sí jalan',title:'Pro',why:'No necesitas Pro para operar. Es para quien quiere más control, más personas, más marcas y funciones avanzadas.',items:['Todo Negocio','Reportes avanzados','Roles personalizados','Hasta 10 usuarios','Hasta 5 marcas','Finanzas avanzadas','Más control para equipos y crecimiento']}
  };

  function setPlan(name){
    if(!api.definitions[name])return;
    state.subscription=state.subscription||{};
    state.subscription.plan=name;state.plan=name;save();
    if(typeof toast==='function')toast('Plan cambiado a '+name);
    if(typeof show==='function')show('plan');
  }
  window.setPlanV55=setPlan;

  views.plan=function(){
    ensureStyle();
    titleEl.textContent='Mi plan';
    const cur=api.currentPlan(),d=api.planDef();
    const cards=['Emprende','Negocio','Pro'].map(name=>{
      const c=copy[name],active=cur===name;
      return `<div class="v55-card ${name==='Negocio'?'recommended':''}"><span class="v55-tag">${esc(c.tag)}</span><h2>${esc(c.title)}</h2><div class="v55-why">${esc(c.why)}</div><div style="font-size:30px;font-weight:900;margin-top:10px">${money(price[name])}<span class="muted" style="font-size:13px"> / mes</span></div><div class="v55-list">${c.items.map((x,i)=>`<div class="${name==='Pro'&&i>0?'v55-extra':''}">✓ ${esc(x)}</div>`).join('')}</div><button class="${active?'secondary':'primary'}" onclick="setPlanV55('${name}')">${active?'Plan actual':'Cambiar a '+name}</button></div>`;
    }).join('');
    const rows=[
      ['Cotizaciones, productos y recetas','✓','✓','✓'],
      ['Clientes y calendario','Básico','Completo','Completo'],
      ['Pedidos','Básico','Completo','Completo'],
      ['Producción y planeación','—','✓','✓'],
      ['Inventario y compras','—','✓','✓'],
      ['Finanzas','Básicas','Completas','Avanzadas'],
      ['Usuarios','1','3','10'],
      ['Marcas','1','2','5'],
      ['Reportes avanzados','—','—','✓'],
      ['Roles personalizados','—','—','✓']
    ];
    content.innerHTML=pageHead('Mi plan','Emprende cubre lo esencial, Negocio cubre la operación completa y Pro agrega extras avanzados.')+`<div class="v55-intro"><b>La idea de los planes:</b> nadie debería necesitar Pro para trabajar bien. <b>Negocio</b> es el plan completo para operar; <b>Pro</b> agrega comodidades, capacidad y herramientas avanzadas.</div><div class="v54-planbar"><div class="v54-planmetric"><small>Plan activo</small><b>${esc(cur)}</b></div><div class="v54-planmetric"><small>Usuarios</small><b>${(state.users||[]).filter(u=>u.active!==false).length} / ${d.users}</b></div><div class="v54-planmetric"><small>Marcas</small><b>${(state.businessBrands||[]).filter(b=>b.active!==false).length} / ${d.brands}</b></div><div class="v54-planmetric"><small>Finanzas</small><b>${esc(d.finance)}</b></div></div><div class="v55-cards">${cards}</div><div class="table-wrap"><table class="table v55-compare"><thead><tr><th>Función</th><th>Emprende</th><th>Negocio</th><th>Pro</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>`;
  };
})();