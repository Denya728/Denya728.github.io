// DENYA SWEETLAB v93 · 14-point functional layer
(function(){
  const E=v=>typeof esc==='function'?esc(v??''):String(v??'');
  const M=v=>typeof money==='function'?money(Number(v)||0):new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(v)||0);
  const arr=(k)=>Array.isArray(state[k])?state[k]:[];
  const persist=()=>{if(typeof save==='function')save()};
  const today=new Date();
  const iso=d=>new Date(d).toISOString().slice(0,10);
  const qStatus=q=>String(q?.status||'').toLowerCase();
  function ensureData(){state.focusTasks=Array.isArray(state.focusTasks)?state.focusTasks:[];state.quoteLinks=state.quoteLinks||{};state.clientPreferences=state.clientPreferences||{};state.brandSettings=state.brandSettings||{}}
  ensureData();

  function openBox(title,body,wide=true){
    const w=document.createElement('div');w.className='modal-bg';w.innerHTML='<div class="modal" style="max-width:'+(wide?'980':'620')+'px"><div class="modal-head"><h2>'+E(title)+'</h2><button class="icon" data-x>×</button></div>'+body+'<div class="modal-actions"><button class="secondary" data-x>Cerrar</button></div></div>';
    document.body.appendChild(w);w.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>w.remove());return w;
  }
  function wa(text){const p=state.profile||{},phone=String(p.whatsapp||'').replace(/\D/g,'');const url='https://wa.me/'+(phone||'')+'?text='+encodeURIComponent(text);window.open(url,'_blank')}

  // 1 + 2 + 13: operational center with actionable tasks
  function taskCenter(){
    const tasks=arr('focusTasks'), qs=arr('quotes'), os=arr('orders'), inv=arr('inventory');
    const todayKey=iso(today);
    const auto=[
      ...qs.filter(q=>!['Aceptada','Entregada y pagada','Rechazada','Cancelada'].includes(q.status)).slice(0,4).map(q=>({id:'q:'+q.id,title:'Dar seguimiento a '+(q.client||q.client_name_snapshot||'cliente'),sub:q.folio||'Cotización',view:'quotations'})),
      ...os.filter(o=>!['Entregado y pagado','Cancelado'].includes(o.status)).slice(0,4).map(o=>({id:'o:'+o.id,title:'Revisar pedido '+(o.folio||o.id?.slice(0,6)||''),sub:o.status||'Activo',view:'orders'})),
      ...inv.filter(i=>Number(i.quantity??i.stock??0)<=Number(i.reorder_point??i.minStock??0)).slice(0,4).map(i=>({id:'i:'+i.id,title:'Reponer '+i.name,sub:'Stock '+(i.quantity??i.stock??0)+' '+(i.unit||''),view:'inventory'}))
    ];
    const all=[...tasks,...auto.filter(x=>!tasks.some(t=>t.id===x.id))].slice(0,10);
    return '<div class="section v93-taskbox"><div class="page-head" style="margin:0"><div><h3>Centro de atención</h3><div class="hint">Acciones reales para cerrar hoy.</div></div><button class="secondary" id="v93AddTask">+ Tarea</button></div>'+
      (all.length?all.map((t,i)=>'<div class="v93-task"><input type="checkbox" '+(t.done?'checked':'')+' data-task="'+E(t.id||('a'+i))+'"><button class="v93-task-main" data-view="'+E(t.view||'home')+'"><b>'+E(t.title)+'</b><span>'+E(t.sub||'')+'</span></button></div>').join(''):'<div class="empty">No hay tareas pendientes.</div>')+'</div>';
  }
  function mountTasks(){
    document.getElementById('v93TaskBox')?.remove();
    const b=document.createElement('div');b.id='v93TaskBox';b.innerHTML=taskCenter();content.appendChild(b);
    b.querySelector('#v93AddTask')?.addEventListener('click',()=>{
      const w=modal('Nueva tarea','<div class="form2">'+field('Tarea','v93t')+field('Fecha','v93d',iso(today),'date')+'</div>',x=>{
        const title=x.querySelector('#v93t').value.trim();if(!title)return false;
        state.focusTasks.push({id:'t'+Date.now(),title,sub:'Personal',due:x.querySelector('#v93d').value,done:false});persist();show('home');return true;
      });w.querySelector('[data-save]')?.addEventListener('click',()=>{});
    });
    b.querySelectorAll('[data-task]').forEach(c=>c.onchange=()=>{const id=c.dataset.task;const t=state.focusTasks.find(x=>x.id===id);if(t)t.done=c.checked;persist();mountTasks()});
    b.querySelectorAll('[data-view]').forEach(x=>x.onclick=()=>show(x.dataset.view));
  }

  // 4 + 5 + 8 + 9: real shareable quotation preview using existing state
  window.shareDenyaQuote=function(id){
    const q=arr('quotes').find(x=>x.id===id);if(!q)return;
    const token=btoa(unescape(encodeURIComponent(JSON.stringify({id:q.id,folio:q.folio,client:q.client||q.client_name_snapshot,total:q.total,event:q.event||q.event_date,status:q.status})))).replace(/=+$/,'');
    state.quoteLinks[id]=token;persist();
    const url=location.origin+location.pathname+'#cotizacion='+encodeURIComponent(token);
    const body='<div class="v93-share"><p>Enlace público generado para <b>'+E(q.folio||id)+'</b>.</p><input id="v93url" value="'+E(url)+'" readonly><div class="modal-actions"><button class="primary" id="v93copy">Copiar enlace</button><button class="secondary" id="v93wa">Enviar por WhatsApp</button></div></div>';
    const w=openBox('Compartir cotización',body,false);w.querySelector('#v93copy').onclick=()=>navigator.clipboard?.writeText(url).then(()=>toast('Enlace copiado'));w.querySelector('#v93wa').onclick=()=>wa('Hola '+(q.client||q.client_name_snapshot||'')+', te comparto tu cotización '+(q.folio||'')+': '+url);
  };
  function publicQuote(){
    const raw=location.hash.startsWith('#cotizacion=')?decodeURIComponent(location.hash.slice(12)):'';if(!raw)return;
    try{const x=JSON.parse(decodeURIComponent(escape(atob(raw))));const w=openBox('Cotización '+(x.folio||''),'<div class="v93-public-quote"><h2>'+E(x.folio||'Cotización')+'</h2><p>Cliente: <b>'+E(x.client||'')+'</b></p><p>Evento: '+E(x.event||'')+'</p><div class="v93-total">'+M(x.total)+'</div><p>Estado: '+E(x.status||'')+'</p><div class="modal-actions"><button class="primary" id="v93Accept">Aceptar cotización</button><button class="secondary" id="v93Reject">No aceptar</button></div></div>',false);
      w.querySelector('#v93Accept').onclick=()=>{const q=arr('quotes').find(q=>q.id===x.id);if(q){q.status='Aceptada';persist();toast('Cotización aceptada');show('orders')}w.remove()};
      w.querySelector('#v93Reject').onclick=()=>{const q=arr('quotes').find(q=>q.id===x.id);if(q){q.status='Rechazada';persist();toast('Cotización marcada como rechazada')}w.remove()};
    }catch(_){}
  }

  // 6 + 14: order documents / WhatsApp operational actions
  window.openOrderActions=function(id){
    const o=arr('orders').find(x=>x.id===id);if(!o)return;
    const q=arr('quotes').find(x=>x.id===o.quotation_id||x.id===o.quoteId);
    const client=o.client||q?.client||q?.client_name_snapshot||'cliente';
    const folio=o.folio||o.id?.slice(0,8)||'pedido';
    const text='Hola '+client+', te comparto actualización de tu pedido '+folio+'. Estado: '+(o.status||'En proceso')+'.';
    const w=openBox('Acciones del pedido '+folio,'<div class="v93-action-grid"><button class="primary" id="v93wa">WhatsApp</button><button class="secondary" id="v93print">Imprimir resumen</button><button class="secondary" id="v93pay">Registrar pago</button></div>',false);
    w.querySelector('#v93wa').onclick=()=>wa(text);
    w.querySelector('#v93print').onclick=()=>printOrder(o,q);
    w.querySelector('#v93pay').onclick=()=>{w.remove();openPayment(o)};
  };
  function printOrder(o,q){const win=window.open('','_blank');if(!win)return;win.document.write('<html><body style="font-family:Arial;max-width:760px;margin:40px auto"><h1>DENYA SWEETLAB</h1><h2>Pedido '+E(o.folio||o.id?.slice(0,8)||'')+'</h2><p>Cliente: '+E(o.client||q?.client||q?.client_name_snapshot||'')+'</p><p>Fecha del evento: '+E(o.event_date||q?.event||'')+'</p><p>Estado: '+E(o.status||'')+'</p><h2>'+M(o.total||q?.total||0)+'</h2><script>window.print()<\/script></body></html>');win.document.close()}
  function openPayment(o){const total=Number(o.total)||0;const balance=Number(o.balance)||total;modal('Registrar pago','<div class="form2">'+field('Monto','v93payamount',balance,'number','min="0" step="0.01"')+selectField('Tipo',[{value:'anticipo',label:'Anticipo'},{value:'liquidacion',label:'Liquidación'},{value:'otro',label:'Otro'}].map(x=>x), 'v93paytype')+'</div>',w=>{const amount=Number(w.querySelector('#v93payamount').value)||0;o.balance=Math.max(0,balance-amount);o.status=o.balance<=0?'Entregado y pagado':(o.status||'En proceso');state.finance_transactions=arr('finance_transactions');state.finance_transactions.push({id:'ft'+Date.now(),transaction_type:'income',amount,occurred_at:new Date().toISOString(),description:'Pago pedido '+(o.folio||o.id?.slice(0,8)||'')});persist();show('orders');toast('Pago registrado')});
  }

  // 7: projected inventory consumption from open orders
  function projectedInventory(){
    const inv=arr('inventory'), orders=arr('orders'), rows=[];
    orders.filter(o=>!['Cancelado','Entregado y pagado'].includes(o.status)).forEach(o=>{
      const mats=o.materials||o.payload?.materials||[];mats.forEach(m=>{const i=inv.find(x=>x.id===m.inventoryId||x.id===m.id);if(i)rows.push({i,qty:Number(m.qty)||0})})
    });
    const totals={};rows.forEach(r=>totals[r.i.id]=(totals[r.i.id]||0)+r.qty);
    return Object.entries(totals).filter(([id,q])=>{const i=inv.find(x=>x.id===id);return i&&q>Number(i.quantity??i.stock??0)}).map(([id,q])=>{const i=inv.find(x=>x.id===id);return '<div class="v93-projrow"><b>'+E(i.name)+'</b><span>Necesitas '+E(q)+' '+E(i.unit||'')+' · disponible '+E(i.quantity??i.stock??0)+'</span></div>'}).join('');
  }

  // 8 + 14: finance analytics, P&L style summary
  function financeInsights(){
    const tx=arr('finance_transactions'), income=tx.filter(x=>['income','ingreso','sale'].includes(String(x.transaction_type).toLowerCase())).reduce((s,x)=>s+Number(x.amount||0),0),expense=tx.filter(x=>['expense','egreso','purchase'].includes(String(x.transaction_type).toLowerCase())).reduce((s,x)=>s+Number(x.amount||0),0);
    const quotes=arr('quotes'), sales=quotes.filter(q=>['Aceptada','Entregada y pagada'].includes(q.status)).reduce((s,q)=>s+Number(q.total||0),0),pending=quotes.reduce((s,q)=>s+Math.max(0,Number(q.balance||0)),0);
    return '<div class="section v93-finance"><h3>Resumen financiero</h3><div class="v93-fin-grid"><div><small>Ingresos registrados</small><b>'+M(income)+'</b></div><div><small>Gastos registrados</small><b>'+M(expense)+'</b></div><div><small>Ventas cotizadas/aceptadas</small><b>'+M(sales)+'</b></div><div><small>Por cobrar</small><b>'+M(pending)+'</b></div></div></div>';
  }

  // 9: CRM client profile
  window.openClientProfile=function(id){
    const clients=arr('clientRecords');const c=clients.find(x=>x.id===id)||clients.find(x=>x.full_name===id)||{full_name:id};
    const quotes=arr('quotes').filter(q=>(q.client_id&&q.client_id===c.id)||(q.client||q.client_name_snapshot)===c.full_name);
    const orders=arr('orders').filter(o=>o.client_id===c.id);
    const prefs=state.clientPreferences[c.id||c.full_name]||'';
    openBox('Ficha de cliente', '<div class="v93-client-head"><h2>'+E(c.full_name||c.name||'Cliente')+'</h2><p>'+E(c.phone||'')+' · '+E(c.email||'')+'</p></div><div class="v93-client-stats"><b>'+quotes.length+'<small>Cotizaciones</small></b><b>'+orders.length+'<small>Pedidos</small></b><b>'+M(quotes.reduce((s,q)=>s+Number(q.total||0),0))+'<small>Valor cotizado</small></b></div><label class="field">Preferencias / notas<textarea id="v93pref">'+E(prefs)+'</textarea></label><div class="section"><h3>Historial</h3>'+quotes.slice(0,8).map(q=>'<div class="v93-history"><b>'+E(q.folio||'Cotización')+'</b><span>'+E(q.status||'')+' · '+M(q.total)+'</span></div>').join('')+'</div><div class="modal-actions"><button class="primary" id="v93savepref">Guardar ficha</button></div>',true).querySelector('#v93savepref').onclick=function(){state.clientPreferences[c.id||c.full_name]=document.querySelector('#v93pref').value;persist();toast('Ficha guardada')};
  };

  // 10: notification center becomes data/action based
  window.openDenyaNotifications=function(){const a=typeof attention==='function'?attention():{};const notes=[['Cotizaciones',a.pendingQuotes||0,'quotations'],['Pedidos',a.pendingOrders||0,'orders'],['Inventario',a.lowStock||0,'inventory'],['Por cobrar',M(a.unpaid||0),'finance']];const w=openBox('Notificaciones',notes.map(n=>'<div class="v93-note2" data-v="'+n[2]+'"><b>'+E(n[0])+'</b><span>'+E(n[1])+'</span></div>').join(''),false);w.querySelectorAll('[data-v]').forEach(x=>x.onclick=()=>{w.remove();show(x.dataset.v)})};

  // 11: brand customization actually persisted
  function brandSettings(){
    const p=state.profile||{};return '<div class="section"><h3>Marca y comunicación</h3><div class="form2">'+field('Nombre comercial','v93brand',p.businessName||'Mi marca')+field('WhatsApp','v93waPhone',p.whatsapp||'')+field('Instagram','v93ig',p.instagram||'')+area('Descripción de marca','v93desc',p.description||'')+'</div><button class="primary" id="v93savebrand">Guardar identidad</button></div>';
  }
  function mountProfile(){const old=content.querySelector('.v92-brand-preview')?.parentElement?.parentElement;const b=document.createElement('div');b.innerHTML=brandSettings();content.appendChild(b);b.querySelector('#v93savebrand').onclick=()=>{state.profile=state.profile||{};state.profile.businessName=b.querySelector('#v93brand').value.trim();state.profile.whatsapp=b.querySelector('#v93waPhone').value.trim();state.profile.instagram=b.querySelector('#v93ig').value.trim();state.profile.description=b.querySelector('#v93desc').value;persist();toast('Identidad guardada')}} 

  // 12: mobile quick actions
  function mobileBar(){if(innerWidth>760||document.getElementById('v93MobileBar'))return;const b=document.createElement('div');b.id='v93MobileBar';b.innerHTML='<button data-v="home">⌂<span>Inicio</span></button><button data-v="quotations">▤<span>Cotizar</span></button><button data-v="orders">✓<span>Pedidos</span></button><button data-v="calendar">◷<span>Agenda</span></button><button data-v="clients">◎<span>Clientes</span></button>';document.body.appendChild(b);b.querySelectorAll('[data-v]').forEach(x=>x.onclick=()=>show(x.dataset.v))}
  // 14: analytics
  function analytics(){const qs=arr('quotes'),orders=arr('orders');const total=qs.reduce((s,q)=>s+Number(q.total||0),0),accepted=qs.filter(q=>q.status==='Aceptada'||q.status==='Entregada y pagada').length,conv=qs.length?Math.round(accepted/qs.length*100):0;return '<div class="section"><h3>Analítica de negocio</h3><div class="v93-fin-grid"><div><small>Cotizaciones</small><b>'+qs.length+'</b></div><div><small>Conversión</small><b>'+conv+'%</b></div><div><small>Valor cotizado</small><b>'+M(total)+'</b></div><div><small>Pedidos</small><b>'+orders.length+'</b></div></div></div>'}

  // wire enhancements into existing views without replacing core business logic
  const home=views.home;views.home=function(){home();mountTasks();const f=document.createElement('div');f.innerHTML=financeInsights()+analytics();content.appendChild(f);const pr=projectedInventory();if(pr){const x=document.createElement('div');x.className='section';x.innerHTML='<h3>Consumo proyectado</h3>'+pr;content.appendChild(x)}};
  const prof=views.profile;views.profile=function(){prof();mountProfile()};
  const clientsView=views.clients;views.clients=function(){clientsView();content.querySelectorAll('[data-client-id]').forEach(x=>x.onclick=()=>openClientProfile(x.dataset.clientId))};
  const invView=views.inventory;views.inventory=function(){invView();const p=document.createElement('div');p.className='section';p.innerHTML='<h3>Planeación de reposición</h3><div class="hint">Los materiales por debajo del punto de reorden se pueden convertir en una compra desde el módulo Compras.</div><button class="primary" id="v93buy">Crear borrador de compra</button>';content.appendChild(p);p.querySelector('#v93buy').onclick=()=>{state.purchaseOrders=arr('purchaseOrders');state.purchaseOrders.push({id:'po'+Date.now(),folio:'OC-'+Date.now().toString().slice(-6),status:'Borrador',total:0,notes:'Generada desde planeación de inventario',lines:arr('inventory').filter(i=>Number(i.quantity??i.stock??0)<=Number(i.reorder_point??i.minStock??0)).map(i=>({inventoryId:i.id,name:i.name,qty:0,unit:i.unit}))});persist();show('inventory');toast('Borrador de compra creado')}};
  const fin=views.finance;views.finance=function(){fin();const x=document.createElement('div');x.innerHTML=analytics();content.appendChild(x)};
  const orders=views.orders;views.orders=function(){orders();const b=document.createElement('div');b.className='section';b.innerHTML='<h3>Acciones rápidas</h3><div class="hint">Selecciona un pedido para abrir sus acciones. También puedes usar el resumen desde aquí.</div>';content.appendChild(b)};

  // 5: expose sharing button helper globally for existing quote cards
  window.DENYAExperience={shareQuote:window.shareDenyaQuote,openClient:window.openClientProfile,openOrder:window.openOrderActions,refresh:()=>show(document.querySelector('.nav button.active')?.dataset?.view||'home')};
  window.addEventListener('hashchange',publicQuote);setTimeout(publicQuote,250);setTimeout(mobileBar,400);window.addEventListener('resize',mobileBar);
})();