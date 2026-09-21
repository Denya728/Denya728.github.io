// DENYA SWEETLAB v92 · UX / automation layer
(function(){
  const E=v=>typeof esc==='function'?esc(v??''):String(v??'');
  const M=v=>typeof money==='function'?money(Number(v)||0):'$'+(Number(v)||0).toFixed(2);
  const originalShow=window.show;
  const originalViews={};
  Object.keys(views||{}).forEach(k=>originalViews[k]=views[k]);
  const navLabels={home:'Inicio',quotations:'Cotizaciones',orders:'Pedidos y producción',calendar:'Calendario',clients:'Clientes',finance:'Finanzas',products:'Productos',measures:'Presentaciones',recipes:'Recetas',extras:'Extras',inventory:'Inventario y compras',profile:'Perfil'};
  function today(){return new Date()}
  function isoDate(d){return new Date(d).toISOString().slice(0,10)}
  function attention(){
    const quotes=Array.isArray(state.quotes)?state.quotes:[];
    const orders=Array.isArray(state.orders)?state.orders:[];
    const inv=Array.isArray(state.inventory)?state.inventory:[];
    const events=Array.isArray(state.calendarEvents)?state.calendarEvents:[];
    const pendingQuotes=quotes.filter(q=>!['Aceptada','Entregada y pagada','Rechazada','Cancelada'].includes(q.status)).length;
    const pendingOrders=orders.filter(o=>!['Entregado y pagado','Cancelado'].includes(o.status)).length;
    const lowStock=inv.filter(i=>Number(i.stock||0)<=Number(i.minStock??i.minimum??0)||Number(i.stock||0)<=0).length;
    const todayKey=isoDate(today());
    const todayEvents=events.filter(e=>String(e.date||e.start||'').slice(0,10)===todayKey).length;
    const unpaid=quotes.reduce((s,q)=>s+Math.max(0,Number(q.balance||0)),0);
    return {pendingQuotes,pendingOrders,lowStock,todayEvents,unpaid};
  }
  function attentionHTML(){
    const a=attention(), d=today().toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'});
    return '<div class="v92-attention">'+
      '<div class="v92-focus"><small>Centro de atención · Hoy</small><h2>'+E(d)+'</h2><div class="muted">Todo lo que merece una acción antes de cerrar el día.</div><div class="v92-focus-actions">'+
      '<button onclick="show(\'quotations\')">Ver cotizaciones</button><button onclick="show(\'orders\')">Producción</button><button onclick="show(\'calendar\')">Calendario</button><button onclick="show(\'inventory\')">Inventario</button></div></div>'+
      '<div class="v92-att-list">'+
      '<div class="v92-att-card"><small>Cotizaciones abiertas</small><strong>'+a.pendingQuotes+'</strong><span>Revisar y dar seguimiento</span></div>'+
      '<div class="v92-att-card"><small>Pedidos activos</small><strong>'+a.pendingOrders+'</strong><span>Producción y entrega</span></div>'+
      '<div class="v92-att-card"><small>Inventario crítico</small><strong>'+a.lowStock+'</strong><span>Materiales para revisar</span></div>'+
      '<div class="v92-att-card"><small>Por cobrar</small><strong>'+M(a.unpaid)+'</strong><span>Saldo de cotizaciones</span></div>'+
      '</div></div>';
  }
  function decorateHome(){
    const existing=document.getElementById('v92Attention'); if(existing)existing.remove();
    const wrap=document.createElement('div');wrap.id='v92Attention';wrap.innerHTML=attentionHTML();
    content.prepend(wrap);
    birthdays();
  }
  function birthdays(){
    const clients=Array.isArray(state.clientRecords)?state.clientRecords:[];
    const now=today(), md=String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    const hits=clients.filter(c=>c.birthday&&String(c.birthday).slice(5,10)===md);
    if(!hits.length)return;
    const box=document.createElement('div');box.className='v92-birthday';
    box.innerHTML='<b>🎂 Cumpleaños de hoy</b><div class="muted" style="margin-top:5px">'+hits.map(c=>E(c.name||'Cliente')).join(', ')+'</div>';
    const att=document.getElementById('v92Attention'); if(att)att.after(box);
  }
  function ensureTop(){
    const top=document.querySelector('.top'); if(!top||document.getElementById('v92TopActions'))return;
    const actions=document.createElement('div');actions.id='v92TopActions';actions.className='v92-top-actions';
    actions.innerHTML='<span class="v92-date">'+E(today().toLocaleDateString('es-MX',{weekday:'short',day:'numeric',month:'short'}))+'</span><button class="v92-top-btn" title="Buscar" onclick="openDenyaCommand()">⌕</button><button class="v92-top-btn v92-bell" title="Notificaciones" onclick="openDenyaNotifications()">♧<i></i></button><button class="v92-top-btn" title="Ayuda" onclick="openDenyaHelp()">?</button>';
    top.appendChild(actions);
  }
  function openDenyaNotifications(){
    const a=attention(),items=[];
    if(a.pendingQuotes)items.push(['Cotizaciones pendientes',a.pendingQuotes+' requieren seguimiento','quotations']);
    if(a.pendingOrders)items.push(['Pedidos activos',a.pendingOrders+' siguen en operación','orders']);
    if(a.lowStock)items.push(['Inventario crítico',a.lowStock+' materiales necesitan revisión','inventory']);
    if(a.unpaid>0)items.push(['Saldos por cobrar',M(a.unpaid)+' registrados en cotizaciones','finance']);
    const bg=document.createElement('div');bg.className='v92-drawer-bg';bg.innerHTML='<aside class="v92-drawer"><div class="v92-drawer-head"><div><small>DENYA SWEETLAB</small><h2>Notificaciones</h2><div class="muted">Centro de atención operativo</div></div><button class="icon" data-x>×</button></div>'+ (items.length?items.map(x=>'<div class="v92-note" data-view="'+x[2]+'"><div>●</div><div><b>'+E(x[0])+'</b><span>'+E(x[1])+'</span></div></div>').join(''):'<div class="empty" style="margin-top:25px">No hay alertas pendientes.</div>')+'</aside>';
    document.body.appendChild(bg);bg.querySelector('[data-x]').onclick=()=>bg.remove();bg.onclick=e=>{if(e.target===bg)bg.remove()};bg.querySelectorAll('.v92-note').forEach(n=>n.onclick=()=>{const v=n.dataset.view;bg.remove();show(v)});
  }
  function openDenyaCommand(){
    const bg=document.createElement('div');bg.className='v92-command-bg';bg.innerHTML='<div class="v92-command"><input id="v92cmd" placeholder="Buscar en SWEETLAB…"><div class="v92-command-list" id="v92cmdlist"></div><div class="v92-kbd">Esc para cerrar · Ctrl/Cmd + K para abrir</div></div>';
    document.body.appendChild(bg);const input=bg.querySelector('#v92cmd'),list=bg.querySelector('#v92cmdlist');
    const render=q=>{const arr=Object.entries(navLabels).filter(([k,l])=>l.toLowerCase().includes(q.toLowerCase())).slice(0,8);list.innerHTML=arr.map(([k,l])=>'<button data-v="'+k+'">✦ '+E(l)+'</button>').join('')};render('');input.oninput=()=>render(input.value);input.focus();list.onclick=e=>{const b=e.target.closest('[data-v]');if(b){bg.remove();show(b.dataset.v)}};bg.onclick=e=>{if(e.target===bg)bg.remove()};input.onkeydown=e=>{if(e.key==='Escape')bg.remove()};
  }
  function openDenyaHelp(){openDenyaCommand();const i=document.getElementById('v92cmd');if(i){i.value='';i.placeholder='Ayuda: escribe una sección para abrirla';}}
  window.openDenyaNotifications=openDenyaNotifications;window.openDenyaCommand=openDenyaCommand;window.openDenyaHelp=openDenyaHelp;
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openDenyaCommand()}});
  function projection(){
    const inv=Array.isArray(state.inventory)?state.inventory:[],low=inv.filter(i=>Number(i.stock||0)<=Number(i.minStock??i.minimum??0));
    if(!low.length)return '';
    return '<div class="v92-projection"><strong>Planeación de compras</strong><p>'+low.slice(0,5).map(i=>E(i.name)+' · stock '+E(i.stock)+' '+E(i.unit||'')).join(' · ')+' · Revisa Compras para generar reposición.</p></div>';
  }
  function brandPanel(){
    const p=state.profile||{};const theme=p.theme||'espresso';
    return '<div class="section"><div class="page-head" style="margin:0"><div><h3>Identidad de marca</h3><div class="hint">Personaliza la presentación de SWEETLAB sin cambiar la lógica de tu negocio.</div></div></div>'+
      '<div class="v92-brand-preview"><span class="star">✦</span><div><b>'+E(p.businessName||'Mi marca')+'</b><div style="font-size:11px;opacity:.72">DENYA SWEETLAB</div></div></div>'+
      '<div class="v92-theme-grid">'+['espresso','marfil','arena'].map(t=>'<button class="v92-theme '+(theme===t?'active':'')+'" data-theme="'+t+'"><em style="background:'+(t==='espresso'?'#2d241e':t==='marfil'?'#f5f0e9':'#d7c0a3')+'"></em><span>'+E(t[0].toUpperCase()+t.slice(1))+'</span></button>').join('')+'</div></div>';
  }
  function saveTheme(t){state.profile=state.profile||{};state.profile.theme=t;save();toast('Tema guardado');show('profile')}
  window.saveDenyaTheme=saveTheme;
  const oldProfile=views.profile;
  views.profile=function(){oldProfile();const box=document.createElement('div');box.innerHTML=brandPanel();content.appendChild(box);box.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>saveTheme(b.dataset.theme))};
  const oldInventory=views.inventory;
  views.inventory=function(){oldInventory();const p=document.createElement('div');p.innerHTML=projection();if(p.firstChild)content.appendChild(p.firstChild)};
  const oldHome=views.home;
  views.home=function(){oldHome();ensureTop();decorateHome()};
  Object.keys(views).forEach(k=>{if(k!=='home'&&k!=='profile'&&k!=='inventory'){const fn=views[k];if(typeof fn==='function'){views[k]=function(){fn();ensureTop()}}}});
  const oldShow=window.show;
  window.show=function(v){ensureTop();oldShow(v);setTimeout(()=>{ensureTop();if(v==='home')decorateHome()},0)};
  // Orders: add a visual status timeline to the first order detail/card when available.
  function addOrderTimeline(){
    if(!document.querySelector('[data-view="orders"].active'))return;
    const target=content.querySelector('.v49-detail-grid,.v51-top,.v42-order-detail,.order-detail,.card');
    if(!target||document.getElementById('v92OrderTimeline'))return;
    const box=document.createElement('div');box.id='v92OrderTimeline';box.className='v92-timeline';
    ['Cotización','Anticipo','Pedido','Producción','Entrega','Pagado'].forEach((s,i)=>box.innerHTML+='<div class="v92-step '+(i<2?'done':'')+'"><div class="v92-dot"></div><span>'+s+'</span></div>');
    target.prepend(box);
  }
  document.addEventListener('click',()=>setTimeout(addOrderTimeline,80));
  // Calendar operational legend
  function calendarLegend(){if(!document.querySelector('[data-view="calendar"].active')||document.getElementById('v92CalendarTools'))return;const h=content.querySelector('.page-head');if(!h)return;const x=document.createElement('div');x.id='v92CalendarTools';x.className='v92-section-tools';x.innerHTML='<button class="v92-chip active">Todos</button><button class="v92-chip">Producción</button><button class="v92-chip">Entrega</button><button class="v92-chip">Personal</button>';h.after(x);x.querySelectorAll('button').forEach(b=>b.onclick=()=>{x.querySelectorAll('button').forEach(q=>q.classList.remove('active'));b.classList.add('active')})}
  const observer=new MutationObserver(()=>{ensureTop();calendarLegend();addOrderTimeline()});observer.observe(content,{childList:true,subtree:true});
  // Non-destructive boot: wait for the existing app to render, then enhance.
  setTimeout(()=>{ensureTop();if((document.querySelector('.nav button.active')||{}).dataset?.view==='home')decorateHome()},500);
})();