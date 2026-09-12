(function(){
  const filter={search:'',status:'Activos',month:''};
  const ACTIVE=['Pendiente','En producción','Listo'];
  const qFor=o=>(state.quotes||[]).find(q=>q.id===o.quoteId);
  const safeMoney=n=>typeof money==='function'?money(Number(n)||0):'$'+(Number(n)||0).toFixed(2);
  const today=()=>new Date().toISOString().slice(0,10);

  function ensureStyle(){
    if(document.getElementById('v49orders'))return;
    const s=document.createElement('style');s.id='v49orders';s.textContent=`
      .v49-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) 190px 170px auto;gap:10px;align-items:end;margin:14px 0}.v49-toolbar label{font-size:11px;font-weight:800;color:#765f50;text-transform:uppercase;letter-spacing:.7px}.v49-toolbar input,.v49-toolbar select{width:100%;margin-top:5px;border:1px solid #ded3ca;border-radius:11px;padding:10px 11px;background:#fff}.v49-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}.v49-kpi{background:#fff;border:1px solid #eadfd4;border-radius:15px;padding:14px}.v49-kpi small{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#9a7850}.v49-kpi strong{display:block;font-size:24px;margin-top:5px}.v49-table .table td{vertical-align:middle}.v49-main{font-weight:850}.v49-sub{font-size:12px;color:#8c7c70;margin-top:2px}.v49-status{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:850;background:#f2ece7}.v49-status.production{background:#fff0c9}.v49-status.ready{background:#dff4e8}.v49-status.done{background:#e7edf8}.v49-status.cancel{background:#f5dddd}.v49-actions{display:flex;gap:6px;flex-wrap:wrap}.v49-actions button{padding:7px 9px;border-radius:9px}.v49-empty{padding:28px;text-align:center;color:#8d7b6d}.v49-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v49-detail{border:1px solid #eadfd4;border-radius:12px;padding:11px}.v49-detail small{display:block;color:#907c6f;font-size:10px;text-transform:uppercase}.v49-detail b{display:block;margin-top:4px}.v49-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:14px 0}.v49-step{padding:8px;border-radius:10px;text-align:center;font-size:11px;background:#f3eee9}.v49-step.on{background:#3a2d27;color:#fff}@media(max-width:900px){.v49-toolbar{grid-template-columns:1fr 1fr}.v49-kpis{grid-template-columns:1fr 1fr}}@media(max-width:620px){.v49-toolbar,.v49-kpis,.v49-detail-grid{grid-template-columns:1fr}.v49-table{overflow:auto}.v49-progress{grid-template-columns:1fr 1fr}}
    `;document.head.appendChild(s);
  }
  function statusClass(s){return s==='En producción'?'production':s==='Listo'?'ready':s==='Entregado y pagado'?'done':s==='Cancelado'?'cancel':''}
  function sortOrders(rows){return rows.sort((a,b)=>String(qFor(a)?.event||'9999-99-99').localeCompare(String(qFor(b)?.event||'9999-99-99')))}
  function filtered(){
    let rows=[...(state.orders||[])];
    if(filter.status==='Activos')rows=rows.filter(o=>ACTIVE.includes(o.status));
    else if(filter.status==='Próximos')rows=rows.filter(o=>ACTIVE.includes(o.status)&&qFor(o)?.event>=today());
    else if(filter.status!=='Todos')rows=rows.filter(o=>o.status===filter.status);
    if(filter.month)rows=rows.filter(o=>String(qFor(o)?.event||'').slice(0,7)===filter.month);
    const s=filter.search.trim().toLowerCase();
    if(s)rows=rows.filter(o=>{const q=qFor(o),p=getProduct(q?.productId);return [q?.folio,q?.client,p?.name,q?.event,o.status].some(v=>String(v||'').toLowerCase().includes(s))});
    return sortOrders(rows);
  }
  function quickAction(o){
    if(o.status==='Pendiente')return `<button class="primary" onclick="orderAction('${o.id}','start')">Producir</button>`;
    if(o.status==='En producción')return `<button class="primary" onclick="orderAction('${o.id}','ready')">Marcar listo</button>`;
    if(o.status==='Listo')return `<button class="primary" onclick="orderAction('${o.id}','done')">Entregar + cobrar</button>`;
    return '';
  }
  window.openOrderV49=function(id){
    const o=(state.orders||[]).find(x=>x.id===id),q=qFor(o);if(!o||!q)return;
    const p=getProduct(q.productId),m=getMeasure(q.measureId),steps=['Pendiente','En producción','Listo','Entregado y pagado'];const current=steps.indexOf(o.status);
    modal('Pedido '+esc(q.folio||''),`<div class="helper"><b>${esc(q.client||'Cliente')}</b> · evento ${esc(q.event||'Sin fecha')}</div><div class="v49-progress">${steps.map((s,i)=>`<div class="v49-step ${current>=i?'on':''}">${esc(s)}</div>`).join('')}</div><div class="v49-detail-grid"><div class="v49-detail"><small>Producto</small><b>${esc(p?.name||'')}</b><div class="v49-sub">${esc(m?.name||'')}</div></div><div class="v49-detail"><small>Estatus comercial</small><b>${esc(q.status||'')}</b></div><div class="v49-detail"><small>Total</small><b>${safeMoney(q.total)}</b></div><div class="v49-detail"><small>Saldo pendiente</small><b>${safeMoney(q.balance)}</b></div><div class="v49-detail"><small>Anticipo</small><b>${Number(q.deposit)||0}%</b><div class="v49-sub">${q.depositPaidAt?'Registrado '+new Date(q.depositPaidAt).toLocaleDateString('es-MX'):'Sin fecha de cobro'}</div></div><div class="v49-detail"><small>Creado</small><b>${o.createdAt?new Date(o.createdAt).toLocaleDateString('es-MX'):'—'}</b></div></div><div class="ops-actions" style="margin-top:14px"><button class="secondary" onclick="showMaterials('${o.id}')">Lista de materiales</button>${quickAction(o)}</div>`,null,'',true);
  };
  function renderProfessional(){
    ensureStyle();
    const tabs=content.querySelector('.v42-tabs')?.outerHTML||'';
    const rows=filtered();
    const active=(state.orders||[]).filter(o=>ACTIVE.includes(o.status));
    const upcoming=active.filter(o=>{const d=qFor(o)?.event;return d&&d>=today()}).length;
    const production=active.filter(o=>o.status==='En producción').length;
    const receivable=active.reduce((s,o)=>s+(Number(qFor(o)?.balance)||0),0);
    titleEl.textContent='Pedidos y producción';
    content.innerHTML=pageHead('Pedidos','Control operativo de pedidos, cobros y avance de producción.',`<button class="secondary" onclick="show('quotations')">Ver cotizaciones</button>`)+tabs+`
      <div class="v49-kpis"><div class="v49-kpi"><small>Pedidos activos</small><strong>${active.length}</strong></div><div class="v49-kpi"><small>Próximos</small><strong>${upcoming}</strong></div><div class="v49-kpi"><small>En producción</small><strong>${production}</strong></div><div class="v49-kpi"><small>Por cobrar</small><strong>${safeMoney(receivable)}</strong></div></div>
      <div class="v49-toolbar"><label>Buscar<input id="v49search" placeholder="Folio, cliente, producto..." value="${esc(filter.search)}"></label><label>Estatus<select id="v49status">${['Activos','Todos','Próximos','Pendiente','En producción','Listo','Entregado y pagado','Cancelado'].map(x=>`<option ${filter.status===x?'selected':''}>${x}</option>`).join('')}</select></label><label>Mes del evento<input id="v49month" type="month" value="${esc(filter.month)}"></label><button class="secondary" id="v49clear">Limpiar filtros</button></div>
      <div class="table-wrap v49-table"><table class="table"><thead><tr><th>Fecha</th><th>Pedido / cliente</th><th>Producto</th><th>Estatus</th><th>Total</th><th>Saldo</th><th>Acciones</th></tr></thead><tbody>${rows.map(o=>{const q=qFor(o),p=getProduct(q?.productId),m=getMeasure(q?.measureId);return `<tr><td><b>${esc(q?.event||'—')}</b></td><td><div class="v49-main">${esc(q?.folio||'')}</div><div class="v49-sub">${esc(q?.client||'Sin cliente')}</div></td><td><div class="v49-main">${esc(p?.name||'')}</div><div class="v49-sub">${esc(m?.name||'')}</div></td><td><span class="v49-status ${statusClass(o.status)}">${esc(o.status)}</span></td><td><b>${safeMoney(q?.total)}</b></td><td><b>${safeMoney(q?.balance)}</b></td><td><div class="v49-actions"><button class="secondary" onclick="openOrderV49('${o.id}')">Ver</button><button class="secondary" onclick="showMaterials('${o.id}')">Materiales</button>${quickAction(o)}</div></td></tr>`}).join('')||'<tr><td colspan="7"><div class="v49-empty">No hay pedidos que coincidan con los filtros.</div></td></tr>'}</tbody></table></div>`;
    const s=document.getElementById('v49search'),st=document.getElementById('v49status'),mo=document.getElementById('v49month'),cl=document.getElementById('v49clear');
    if(s)s.oninput=()=>{filter.search=s.value;renderProfessional()};
    if(st)st.onchange=()=>{filter.status=st.value;renderProfessional()};
    if(mo)mo.onchange=()=>{filter.month=mo.value;renderProfessional()};
    if(cl)cl.onclick=()=>{filter.search='';filter.status='Activos';filter.month='';renderProfessional()};
  }
  const baseOrders=views.orders;
  views.orders=function(){
    const r=baseOrders&&baseOrders();
    const activeTab=[...content.querySelectorAll('.v42-tabs button')].find(b=>b.classList.contains('active'));
    if(activeTab&&/Producción/i.test(activeTab.textContent||''))return r;
    renderProfessional();return r;
  };
})();