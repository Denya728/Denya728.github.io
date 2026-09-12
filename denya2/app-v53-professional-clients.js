(function(){
  const rank={Emprende:1,Negocio:2,Pro:3};
  const filters={search:'',status:'Todos',segment:'Todos'};
  const currentPlan=()=>state.subscription?.plan||state.plan||'Negocio';
  const has=min=>(rank[currentPlan()]||1)>=(rank[min]||1);
  const safeMoney=n=>typeof money==='function'?money(Number(n)||0):'$'+(Number(n)||0).toFixed(2);
  const safeEsc=v=>typeof esc==='function'?esc(v):String(v??'');
  const makeId=()=>`c${Date.now()}${Math.random().toString(36).slice(2,6)}`;

  function ensureClients(){
    if(!Array.isArray(state.clientRecords))state.clientRecords=[];
    if(!Array.isArray(state.clients))state.clients=[];
    const names=[...state.clients,...(state.quotes||[]).map(q=>q.client).filter(Boolean)];
    [...new Set(names)].forEach(name=>{
      if(!state.clientRecords.some(c=>String(c.name).trim().toLowerCase()===String(name).trim().toLowerCase())){
        state.clientRecords.push({id:makeId(),name,phone:'',instagram:'',birthday:'',notes:'',active:true});
      }
      if(!state.clients.includes(name))state.clients.push(name);
    });
    save();
  }
  function orderForQuote(q){return (state.orders||[]).find(o=>o.quoteId===q?.id)}
  function isClosed(q){const o=orderForQuote(q);return o?.status==='Entregado y pagado'||q?.status==='Entregada y pagada'}
  function isActiveOrder(q){const o=orderForQuote(q);return o&&!['Entregado y pagado','Cancelado'].includes(o.status)}
  function closedDate(q){const o=orderForQuote(q);return o?.completedAt||q?.completedAt||q?.event||''}
  function validDate(v){const d=v?new Date(String(v).length===10?v+'T12:00:00':v):null;return d&&!isNaN(d)?d:null}
  function fmtDate(v){const d=validDate(v);return d?d.toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}):'—'}
  function productName(q){return getProduct(q?.productId)?.name||q?.productName||'Producto'}

  function stats(c){
    const qs=(state.quotes||[]).filter(q=>q.client===c.name);
    const closed=qs.filter(isClosed).sort((a,b)=>String(closedDate(b)).localeCompare(String(closedDate(a))));
    const active=qs.filter(isActiveOrder);
    const purchased=closed.reduce((s,q)=>s+(Number(q.total)||0),0);
    const pending=active.reduce((s,q)=>s+(Number(q.balance)||0),0);
    const ticket=closed.length?purchased/closed.length:0;
    const dates=closed.map(q=>validDate(closedDate(q))).filter(Boolean).sort((a,b)=>a-b);
    let frequency='Sin compras';
    if(dates.length===1)frequency='1 compra';
    if(dates.length>=2){
      let days=0;for(let i=1;i<dates.length;i++)days+=(dates[i]-dates[i-1])/86400000;
      frequency=`Cada ${Math.max(1,Math.round(days/(dates.length-1)))} días`;
    }
    const products=new Map();
    closed.forEach(q=>{const name=productName(q),cur=products.get(name)||0;products.set(name,cur+1)});
    const favorites=[...products.entries()].sort((a,b)=>b[1]-a[1]);
    return {qs,closed,active,purchased,pending,ticket,frequency,last:closed[0]?closedDate(closed[0]):'',favorites,repeat:closed.length>=2};
  }

  function ensureStyle(){
    if(document.getElementById('v53clients'))return;
    const s=document.createElement('style');s.id='v53clients';s.textContent=`
      .v53-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}.v53-kpi{background:#fff;border:1px solid #eadfd4;border-radius:15px;padding:14px}.v53-kpi small{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#9a7850}.v53-kpi strong{display:block;font-size:24px;margin-top:5px}.v53-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) 170px 180px auto;gap:10px;align-items:end;margin:14px 0}.v53-toolbar label{font-size:11px;font-weight:800;color:#765f50;text-transform:uppercase;letter-spacing:.7px}.v53-toolbar input,.v53-toolbar select{width:100%;margin-top:5px;border:1px solid #ded3ca;border-radius:11px;padding:10px 11px;background:#fff}.v53-table td{vertical-align:middle}.v53-name{font-weight:900}.v53-sub{font-size:12px;color:#8c7c70;margin-top:2px}.v53-money{font-weight:850}.v53-segment{display:inline-flex;padding:5px 8px;border-radius:999px;background:#f1ece7;font-size:10px;font-weight:850}.v53-segment.repeat{background:#e1f1e7}.v53-segment.new{background:#f4eadb}.v53-actions{display:flex;gap:6px;flex-wrap:wrap}.v53-actions button{padding:7px 9px;border-radius:9px}.v53-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}.v53-detail{border:1px solid #eadfd4;border-radius:12px;padding:11px;background:#fff}.v53-detail small{display:block;color:#907c6f;font-size:10px;text-transform:uppercase}.v53-detail b{display:block;margin-top:4px;font-size:16px}.v53-note{white-space:pre-wrap;background:#faf6f2;border:1px solid #eadfd4;border-radius:12px;padding:12px}.v53-favs{display:flex;gap:7px;flex-wrap:wrap}.v53-fav{padding:6px 9px;border-radius:999px;background:#f3eee9;font-size:11px}.v53-empty{padding:28px;text-align:center;color:#8d7b6d}@media(max-width:900px){.v53-kpis,.v53-detail-grid{grid-template-columns:1fr 1fr}.v53-toolbar{grid-template-columns:1fr 1fr}}@media(max-width:620px){.v53-kpis,.v53-detail-grid,.v53-toolbar{grid-template-columns:1fr}.v53-table{overflow:auto}}
    `;document.head.appendChild(s);
  }

  function filteredRecords(){
    const rows=(state.clientRecords||[]).map(c=>({c,s:stats(c)}));
    return rows.filter(({c,s})=>{
      if(filters.status!=='Todos'&&(filters.status==='Activos')!==(c.active!==false))return false;
      if(filters.segment==='Con saldo'&&!(s.pending>0))return false;
      if(filters.segment==='Recurrentes'&&!s.repeat)return false;
      if(filters.segment==='Sin compras'&&s.closed.length)return false;
      const term=filters.search.trim().toLowerCase();
      if(term&&!String([c.name,c.phone,c.instagram,c.notes,s.favorites.map(x=>x[0]).join(' ')].join(' ')).toLowerCase().includes(term))return false;
      return true;
    }).sort((a,b)=>b.s.purchased-a.s.purchased||String(a.c.name).localeCompare(String(b.c.name),'es'));
  }

  window.openClientDetailV53=function(id){
    ensureClients();const c=(state.clientRecords||[]).find(x=>x.id===id);if(!c)return;const s=stats(c);
    const rows=[...s.qs].sort((a,b)=>String(b.event||'').localeCompare(String(a.event||'')));
    const body=`<div class="helper"><b>${safeEsc(c.name)}</b>${c.phone?' · '+safeEsc(c.phone):''}${c.instagram?' · '+safeEsc(c.instagram):''}</div>
      <div class="v53-detail-grid">
        <div class="v53-detail"><small>Comprado acumulado</small><b>${safeMoney(s.purchased)}</b></div>
        <div class="v53-detail"><small>Compras cerradas</small><b>${s.closed.length}</b></div>
        <div class="v53-detail"><small>Ticket promedio</small><b>${safeMoney(s.ticket)}</b></div>
        <div class="v53-detail"><small>Frecuencia</small><b>${safeEsc(s.frequency)}</b></div>
        <div class="v53-detail"><small>Última compra</small><b>${fmtDate(s.last)}</b></div>
        <div class="v53-detail"><small>Saldo pendiente</small><b>${safeMoney(s.pending)}</b></div>
      </div>
      <div class="section"><h3>Productos favoritos</h3><div class="v53-favs">${s.favorites.slice(0,5).map(([name,n])=>`<span class="v53-fav">${safeEsc(name)} · ${n}</span>`).join('')||'<span class="muted">Aún no hay compras cerradas.</span>'}</div></div>
      <div class="section"><h3>Notas</h3><div class="v53-note">${safeEsc(c.notes||'Sin notas para este cliente.')}</div></div>
      <div class="section"><h3>Historial completo</h3><div class="table-wrap"><table class="table"><thead><tr><th>Folio</th><th>Fecha</th><th>Producto</th><th>Estatus</th><th>Total</th><th>Saldo</th></tr></thead><tbody>${rows.map(q=>`<tr><td><b>${safeEsc(q.folio||'')}</b></td><td>${fmtDate(closedDate(q)||q.event)}</td><td>${safeEsc(productName(q))}</td><td>${safeEsc(orderForQuote(q)?.status||q.status||'')}</td><td>${safeMoney(q.total)}</td><td>${safeMoney(q.balance)}</td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">Sin historial todavía.</div></td></tr>'}</tbody></table></div></div>`;
    const w=modal('Cliente · '+safeEsc(c.name),body,null,'',true);
    const actions=w.querySelector('.modal-actions');
    if(actions)actions.insertAdjacentHTML('afterbegin',`${c.phone?`<button class="secondary" onclick="window.open('https://wa.me/${String(c.phone).replace(/\D/g,'')}','_blank')">WhatsApp</button>`:''}<button class="secondary" onclick="document.querySelector('.modal-bg:last-of-type')?.remove();openClientV17('${c.id}')">Editar cliente</button>`);
  };
  window.clientHistoryV17=window.openClientDetailV53;

  function render(){
    ensureClients();ensureStyle();titleEl.textContent='Clientes';
    const records=(state.clientRecords||[]),all=records.map(c=>({c,s:stats(c)}));
    const totalPurchased=all.reduce((n,x)=>n+x.s.purchased,0),pending=all.reduce((n,x)=>n+x.s.pending,0),repeat=all.filter(x=>x.s.repeat).length;
    const showMetrics=has('Negocio'),rows=filteredRecords();
    content.innerHTML=pageHead('Clientes','Historial, recurrencia, valor y seguimiento de cada cliente.',`<button class="primary" onclick="openClientV17()">+ Nuevo cliente</button>`)+
      (showMetrics?`<div class="v53-kpis"><div class="v53-kpi"><small>Clientes</small><strong>${records.length}</strong></div><div class="v53-kpi"><small>Recurrentes</small><strong>${repeat}</strong></div><div class="v53-kpi"><small>Comprado acumulado</small><strong>${safeMoney(totalPurchased)}</strong></div><div class="v53-kpi"><small>Saldo pendiente</small><strong>${safeMoney(pending)}</strong></div></div>`:`<div class="helper"><b>Plan Emprende:</b> puedes administrar contactos y notas. Las métricas, segmentación e historial comercial avanzado están disponibles desde Negocio.</div>`)+
      `<div class="v53-toolbar"><label>Buscar<input id="v53search" placeholder="Nombre, teléfono, Instagram, notas..." value="${safeEsc(filters.search)}"></label><label>Estado<select id="v53status">${['Todos','Activos','Inactivos'].map(x=>`<option ${filters.status===x?'selected':''}>${x}</option>`).join('')}</select></label>${showMetrics?`<label>Segmento<select id="v53segment">${['Todos','Con saldo','Recurrentes','Sin compras'].map(x=>`<option ${filters.segment===x?'selected':''}>${x}</option>`).join('')}</select></label>`:'<div></div>'}<button class="secondary" id="v53clear">Limpiar filtros</button></div>`+
      `<div class="table-wrap v53-table"><table class="table"><thead><tr><th>Cliente</th><th>Contacto</th>${showMetrics?'<th>Comprado</th><th>Frecuencia</th><th>Ticket prom.</th><th>Última compra</th><th>Saldo</th>':''}<th>Acciones</th></tr></thead><tbody>${rows.map(({c,s})=>`<tr><td><div class="v53-name">${safeEsc(c.name)}</div><div class="v53-sub">${c.birthday?'Cumple '+fmtDate(c.birthday):'Cliente'} · <span class="v53-segment ${s.repeat?'repeat':'new'}">${s.repeat?'Recurrente':s.closed.length?'Cliente nuevo':'Sin compras'}</span></div></td><td><div>${safeEsc(c.phone||'Sin teléfono')}</div><div class="v53-sub">${safeEsc(c.instagram||'Sin Instagram')}</div></td>${showMetrics?`<td class="v53-money">${safeMoney(s.purchased)}</td><td>${safeEsc(s.frequency)}</td><td>${safeMoney(s.ticket)}</td><td>${fmtDate(s.last)}</td><td class="v53-money">${safeMoney(s.pending)}</td>`:''}<td><div class="v53-actions">${showMetrics?`<button class="secondary" onclick="openClientDetailV53('${c.id}')">Ver ficha</button>`:''}<button class="secondary" onclick="openClientV17('${c.id}')">Editar</button>${c.phone?`<button class="ghost" onclick="window.open('https://wa.me/${String(c.phone).replace(/\D/g,'')}','_blank')">WhatsApp</button>`:''}</div></td></tr>`).join('')||`<tr><td colspan="${showMetrics?8:3}"><div class="v53-empty">No hay clientes que coincidan con los filtros.</div></td></tr>`}</tbody></table></div>`;
    const se=document.getElementById('v53search'),st=document.getElementById('v53status'),sg=document.getElementById('v53segment'),cl=document.getElementById('v53clear');
    if(se)se.oninput=()=>{filters.search=se.value;render()};
    if(st)st.onchange=()=>{filters.status=st.value;render()};
    if(sg)sg.onchange=()=>{filters.segment=sg.value;render()};
    if(cl)cl.onclick=()=>{filters.search='';filters.status='Todos';filters.segment='Todos';render()};
  }
  views.clients=render;
})();