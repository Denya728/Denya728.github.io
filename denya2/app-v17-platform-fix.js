(function(){
  const makeId=(p)=>p+Date.now()+Math.random().toString(36).slice(2,6);
  function ensureData(){
    if(!Array.isArray(state.clientRecords)) state.clientRecords=[];
    const names=[...(state.clients||[]),...(state.quotes||[]).map(q=>q.client).filter(Boolean)];
    [...new Set(names)].forEach(name=>{
      if(!state.clientRecords.some(c=>c.name===name)) state.clientRecords.push({id:makeId('c'),name,phone:'',instagram:'',birthday:'',notes:'',active:true});
    });
    if(!Array.isArray(state.calendarEvents)) state.calendarEvents=[];
    if(!Array.isArray(state.users)) state.users=[
      {id:'u1',name:'Propietario SweetLab',email:'owner@sweetlab.mx',role:'Propietario',active:true},
      {id:'u2',name:'Ventas Demo',email:'ventas@sweetlab.mx',role:'Ventas',active:true}
    ];
    if(!state.subscription) state.subscription={plan:state.plan||'Negocio',billing:'Mensual',status:'Activa'};
    save();
  }
  ensureData();

  function openClientV17(id=null){
    const c=id?state.clientRecords.find(x=>x.id===id):{name:'',phone:'',instagram:'',birthday:'',notes:'',active:true};
    modal(id?'Editar cliente':'Nuevo cliente',`<div class="form2">${field('Nombre completo','v17cname',c.name||'')}${field('Teléfono / WhatsApp','v17cphone',c.phone||'')}${field('Instagram','v17cig',c.instagram||'')}${field('Cumpleaños','v17cbday',c.birthday||'','date')}<label class="field">Estado<select id="v17cactive"><option value="1" ${c.active!==false?'selected':''}>Activo</option><option value="0" ${c.active===false?'selected':''}>Inactivo</option></select></label></div><div style="margin-top:12px">${area('Notas','v17cnotes',c.notes||'')}</div>`,w=>{
      const name=w.querySelector('#v17cname').value.trim(); if(!name){toast('Escribe el nombre del cliente');return false}
      const old=c.name;
      const data={id:id||makeId('c'),name,phone:w.querySelector('#v17cphone').value.trim(),instagram:w.querySelector('#v17cig').value.trim(),birthday:w.querySelector('#v17cbday').value,notes:w.querySelector('#v17cnotes').value.trim(),active:w.querySelector('#v17cactive').value==='1'};
      if(id){Object.assign(c,data); if(old!==name){(state.quotes||[]).filter(q=>q.client===old).forEach(q=>q.client=name); const ix=(state.clients||[]).indexOf(old); if(ix>=0)state.clients[ix]=name}}
      else {state.clientRecords.unshift(data); if(!state.clients.includes(name))state.clients.push(name)}
      save(); show('clients'); toast('Cliente guardado');
    });
  }
  function clientHistoryV17(id){
    const c=state.clientRecords.find(x=>x.id===id); if(!c)return;
    const qs=(state.quotes||[]).filter(q=>q.client===c.name).sort((a,b)=>String(b.event||'').localeCompare(String(a.event||'')));
    modal('Historial · '+esc(c.name),`<div class="helper">${esc(c.phone||'Sin teléfono')} ${c.instagram?'· '+esc(c.instagram):''}</div><div class="table-wrap"><table class="table"><thead><tr><th>Folio</th><th>Evento</th><th>Estatus</th><th>Total</th><th>Saldo</th></tr></thead><tbody>${qs.map(q=>`<tr><td><b>${esc(q.folio||'')}</b></td><td>${esc(q.event||'—')}</td><td>${esc(q.status||'')}</td><td>${money(q.total||0)}</td><td>${money(q.balance||0)}</td></tr>`).join('')||'<tr><td colspan="5"><div class="empty">Sin historial todavía.</div></td></tr>'}</tbody></table></div>`,null,'',true);
  }
  window.openClientV17=openClientV17; window.clientHistoryV17=clientHistoryV17;

  views.clients=function(){
    ensureData(); titleEl.textContent='Clientes';
    const cards=state.clientRecords.map(c=>{
      const qs=(state.quotes||[]).filter(q=>q.client===c.name), closed=qs.filter(q=>q.status==='Entregada y pagada'), total=closed.reduce((s,q)=>s+(Number(q.total)||0),0), orders=qs.filter(q=>['Aceptada','Entregada y pagada'].includes(q.status)).length;
      return `<div class="card" data-v17-client="${esc((c.name+' '+(c.phone||'')+' '+(c.instagram||'')).toLowerCase())}"><div class="page-head" style="margin:0"><div><h3 style="margin:0">${esc(c.name)}</h3><div class="muted">${esc(c.phone||'Sin teléfono')} ${c.instagram?'· '+esc(c.instagram):''}</div></div><span class="badge ${c.active!==false?'ok':'off'}">${c.active!==false?'Activo':'Inactivo'}</span></div><div class="grid3" style="margin-top:14px"><div><b>${qs.length}</b><div class="hint">Cotizaciones</div></div><div><b>${orders}</b><div class="hint">Pedidos</div></div><div><b>${money(total)}</b><div class="hint">Comprado</div></div></div><div class="row-actions" style="margin-top:14px"><button class="secondary" onclick="clientHistoryV17('${c.id}')">Historial</button><button class="secondary" onclick="openClientV17('${c.id}')">Editar</button>${c.phone?`<button class="ghost" onclick="window.open('https://wa.me/${String(c.phone).replace(/\D/g,'')}','_blank')">WhatsApp</button>`:''}</div></div>`;
    }).join('');
    content.innerHTML=pageHead('Clientes','Historial, contacto y valor de cada cliente.',`<button class="primary" onclick="openClientV17()">+ Nuevo cliente</button>`)+`<div class="toolbar"><input id="v17ClientSearch" placeholder="Buscar cliente, teléfono o Instagram" style="flex:1"></div><div class="grid2" id="v17ClientGrid">${cards||'<div class="card empty">Aún no hay clientes.</div>'}</div>`;
    const s=$('#v17ClientSearch'); if(s)s.oninput=()=>{const q=s.value.toLowerCase();$$('[data-v17-client]').forEach(el=>el.style.display=el.dataset.v17Client.includes(q)?'':'none')};
  };

  let v17CalDate=new Date();
  const dateKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function openCalEventV17(id=null,date=''){
    const e=id?state.calendarEvents.find(x=>x.id===id):{title:'',date:date||dateKey(new Date()),time:'',category:'General',notes:''};
    modal(id?'Editar evento':'Nuevo evento',`<div class="form2">${field('Título','v17etitle',e.title||'')}${field('Fecha','v17edate',e.date||'','date')}${field('Hora','v17etime',e.time||'','time')}${selectField('Tipo','v17ecat',[{value:'General',label:'General'},{value:'Horneado',label:'Horneado / preparación'},{value:'Entrega',label:'Entrega'},{value:'Mercado',label:'Evento / mercado'},{value:'Recordatorio',label:'Recordatorio'}],e.category||'General')}</div><div style="margin-top:12px">${area('Notas','v17enotes',e.notes||'')}</div>`,w=>{
      const data={id:id||makeId('ev'),title:w.querySelector('#v17etitle').value.trim(),date:w.querySelector('#v17edate').value,time:w.querySelector('#v17etime').value,category:w.querySelector('#v17ecat').value,notes:w.querySelector('#v17enotes').value.trim()};
      if(!data.title||!data.date){toast('Completa título y fecha');return false}
      if(id)Object.assign(e,data); else state.calendarEvents.push(data); save(); show('calendar');
    });
  }
  function deleteCalEventV17(id){if(confirm('¿Eliminar este evento?')){state.calendarEvents=state.calendarEvents.filter(x=>x.id!==id);save();show('calendar')}}
  function moveCalV17(n){v17CalDate=new Date(v17CalDate.getFullYear(),v17CalDate.getMonth()+n,1);show('calendar')}
  window.openCalEventV17=openCalEventV17; window.deleteCalEventV17=deleteCalEventV17; window.moveCalV17=moveCalV17;

  views.calendar=function(){
    ensureData(); titleEl.textContent='Calendario';
    const y=v17CalDate.getFullYear(),m=v17CalDate.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),start=(first.getDay()+6)%7;
    const events=[];
    (state.quotes||[]).forEach(q=>{if(q.event)events.push({date:q.event,title:`${q.client||'Cliente'} · ${getProduct(q.productId)?.name||'Pedido'}`,type:'pedido',status:q.status})});
    (state.calendarEvents||[]).forEach(e=>events.push({...e,type:'general'}));
    let cells=''; for(let i=0;i<start;i++)cells+='<div class="cal-cell empty-day"></div>';
    for(let d=1;d<=last.getDate();d++){
      const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`, day=events.filter(e=>e.date===key);
      cells+=`<div class="cal-cell"><div class="cal-day"><b>${d}</b><button onclick="openCalEventV17(null,'${key}')">+</button></div>${day.map(e=>`<div class="cal-event ${e.type==='pedido'?'order':'general'}">${e.time?esc(e.time)+' ':''}${esc(e.title)}${e.type==='general'?`<span onclick="event.stopPropagation();deleteCalEventV17('${e.id}')">×</span>`:''}</div>`).join('')}</div>`;
    }
    content.innerHTML=pageHead('Calendario','Pedidos, entregas y eventos generales en una sola vista.',`<button class="primary" onclick="openCalEventV17()">+ Evento</button>`)+`<div class="calendar-toolbar"><button class="secondary" onclick="moveCalV17(-1)">←</button><h3>${first.toLocaleDateString('es-MX',{month:'long',year:'numeric'})}</h3><button class="secondary" onclick="moveCalV17(1)">→</button></div><div class="calendar-grid cal-week"><b>Lun</b><b>Mar</b><b>Mié</b><b>Jue</b><b>Vie</b><b>Sáb</b><b>Dom</b></div><div class="calendar-grid">${cells}</div>`;
  };

  function openUserV17(id=null){
    const u=id?state.users.find(x=>x.id===id):{name:'',email:'',role:'Ventas',active:true};
    modal(id?'Editar usuario':'Nuevo usuario',`<div class="form2">${field('Nombre','v17uname',u.name||'')}${field('Correo','v17uemail',u.email||'','email')}${selectField('Rol','v17urole',[{value:'Propietario',label:'Propietario'},{value:'Administrador',label:'Administrador'},{value:'Ventas',label:'Ventas'},{value:'Operaciones',label:'Operaciones / Compras'},{value:'Solo lectura',label:'Solo lectura'}],u.role||'Ventas')}<label class="field">Estado<select id="v17uactive"><option value="1" ${u.active!==false?'selected':''}>Activo</option><option value="0" ${u.active===false?'selected':''}>Inactivo</option></select></label></div>`,w=>{
      const data={id:id||makeId('u'),name:w.querySelector('#v17uname').value.trim(),email:w.querySelector('#v17uemail').value.trim(),role:w.querySelector('#v17urole').value,active:w.querySelector('#v17uactive').value==='1'};
      if(!data.name||!data.email){toast('Completa nombre y correo');return false}
      if(id)Object.assign(u,data); else state.users.push(data); save(); show('users');
    });
  }
  window.openUserV17=openUserV17;
  views.users=function(){
    ensureData(); titleEl.textContent='Usuarios';
    content.innerHTML=pageHead('Usuarios y roles','Personas con acceso al negocio y su función.',`<button class="primary" onclick="openUserV17()">+ Usuario</button>`)+`<div class="grid3">${state.users.map(u=>`<div class="card"><h3 style="margin:0">${esc(u.name)}</h3><div class="muted">${esc(u.email)}</div><div style="margin:14px 0"><span class="badge">${esc(u.role)}</span> <span class="badge ${u.active!==false?'ok':'off'}">${u.active!==false?'Activo':'Inactivo'}</span></div><button class="secondary" onclick="openUserV17('${u.id}')">Editar</button></div>`).join('')}</div>`;
  };

  const plans={
    Emprende:{price:249,users:1,brands:1,features:['Productos','Recetas','Presentaciones','Extras','Clientes','Calendario','Cotizaciones','Pedidos','Inventario básico','PDF de cotización','WhatsApp']},
    Negocio:{price:449,users:3,brands:2,features:['Todo Emprende','Compras','Alertas de stock','Finanzas','Filtros por mes y producto','Historial completo de clientes','Hasta 3 usuarios']},
    Pro:{price:699,users:10,brands:5,features:['Todo Negocio','Usuarios y roles','Finanzas avanzadas','Reportes avanzados','Hasta 5 marcas','Hasta 10 usuarios','Soporte prioritario']}
  };
  window.setDemoPlanV17=function(name){if(!plans[name])return;state.subscription.plan=name;state.plan=name;save();show('plan');toast('Plan simulado: '+name)};
  views.plan=function(){
    ensureData(); titleEl.textContent='Mi plan'; const current=state.subscription.plan||state.plan||'Negocio';
    const rows=[
      ['Productos, recetas, presentaciones y extras','✓','✓','✓'],['Clientes y calendario','✓','✓','✓'],['Cotizaciones, PDF y WhatsApp','✓','✓','✓'],['Pedidos','✓','✓','✓'],['Inventario','Básico','Completo','Completo'],['Compras','—','✓','✓'],['Finanzas','Resumen','Completo','Avanzado'],['Usuarios','1','3','10'],['Marcas / subempresas','1','2','5'],['Roles y permisos','—','—','✓'],['Reportes avanzados','—','—','✓'],['Soporte prioritario','—','—','✓']
    ];
    content.innerHTML=pageHead('Mi plan','Define qué funciones estarán habilitadas para cada suscripción.')+`<div class="grid3">${Object.entries(plans).map(([name,p])=>`<div class="card ${current===name?'plan-current':''}"><div class="muted">${current===name?'PLAN ACTUAL':'PLAN'}</div><h2>${name}</h2><div style="font-size:32px;font-weight:900">${money(p.price)}<span class="muted" style="font-size:14px"> / mes</span></div><div class="usage" style="margin:14px 0">${p.features.map(f=>`<span>✓ ${esc(f)}</span>`).join('')}</div><button class="${current===name?'secondary':'primary'}" onclick="setDemoPlanV17('${name}')">${current===name?'Seleccionado':'Simular este plan'}</button></div>`).join('')}</div><div class="table-wrap" style="margin-top:18px"><table class="table"><thead><tr><th>Función</th><th>Emprende</th><th>Negocio</th><th>Pro</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div><div class="helper" style="margin-top:14px"><b>Importante:</b> esta demo permite simular los planes. En la versión SaaS real, DENYA bloqueará automáticamente los módulos y límites que no correspondan a la suscripción activa.</div>`;
  };
})();