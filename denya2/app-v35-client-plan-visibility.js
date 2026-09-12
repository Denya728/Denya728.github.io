(function(){
  const rank={Emprende:1,Negocio:2,Pro:3};
  const currentPlan=()=>state.subscription?.plan||state.plan||'Negocio';
  const has=min=>(rank[currentPlan()]||1)>=rank[min];

  views.clients=function(){
    titleEl.textContent='Clientes';
    const records=Array.isArray(state.clientRecords)?state.clientRecords:[];
    const showMetrics=has('Negocio');

    const rows=records.map(c=>{
      const qs=(state.quotes||[]).filter(q=>q.client===c.name);
      const purchased=qs.filter(q=>q.status==='Entregada y pagada');
      const total=purchased.reduce((s,q)=>s+(Number(q.total)||0),0);
      const orders=qs.filter(q=>['Aceptada','Entregada y pagada'].includes(q.status)).length;
      const metricCells=showMetrics?`<div class="metric"><b>${qs.length}</b><span class="hint">Cotiz.</span></div><div class="metric"><b>${orders}</b><span class="hint">Pedidos</span></div><div class="metric"><b>${money(total)}</b><span class="hint">Comprado</span></div>`:'';
      return `<div class="client-compact-row" style="grid-template-columns:${showMetrics?'1.6fr 1.2fr .55fr .55fr .75fr .55fr 1fr':'1.8fr 1.4fr .7fr 1fr'}" data-v35-client="${esc((c.name+' '+(c.phone||'')+' '+(c.instagram||'')).toLowerCase())}"><div><h3>${esc(c.name)}</h3><div class="muted">${c.birthday?'Cumple: '+esc(c.birthday):'Cliente'}</div></div><div class="contact"><div>${esc(c.phone||'Sin teléfono')}</div><div class="hint">${esc(c.instagram||'Sin Instagram')}</div></div>${metricCells}<div><span class="badge ${c.active!==false?'ok':'off'}">${c.active!==false?'Activo':'Inactivo'}</span></div><div class="row-actions"><button class="secondary" onclick="clientHistoryV17('${c.id}')">Historial</button><button class="secondary" onclick="openClientV17('${c.id}')">Editar</button>${c.phone?`<button class="ghost" onclick="window.open('https://wa.me/${String(c.phone).replace(/\D/g,'')}','_blank')">WhatsApp</button>`:''}</div></div>`;
    }).join('');

    const headers=showMetrics?`<div>Cliente</div><div>Contacto</div><div>Cotiz.</div><div>Pedidos</div><div>Comprado</div><div>Estado</div><div>Acciones</div>`:`<div>Cliente</div><div>Contacto</div><div>Estado</div><div>Acciones</div>`;
    const note=showMetrics?`<div class="helper"><b>Plan ${esc(currentPlan())}:</b> aquí puedes ver actividad comercial por cliente: cotizaciones, pedidos y total comprado.</div>`:`<div class="helper"><b>Plan Emprende:</b> puedes consultar y administrar la información de tus clientes. Las métricas de cotizaciones, pedidos y comprado están disponibles desde Negocio.</div>`;

    content.innerHTML=pageHead('Clientes','Historial, contacto y valor de cada cliente.',`<button class="primary" onclick="openClientV17()">+ Nuevo cliente</button>`)+note+`<div class="toolbar"><input id="v35ClientSearch" placeholder="Buscar cliente, teléfono o Instagram" style="flex:1"></div><div class="client-list-head" style="grid-template-columns:${showMetrics?'1.6fr 1.2fr .55fr .55fr .75fr .55fr 1fr':'1.8fr 1.4fr .7fr 1fr'}">${headers}</div><div class="client-compact-list">${rows||'<div class="card empty">Aún no hay clientes.</div>'}</div>`;

    const s=document.querySelector('#v35ClientSearch');
    if(s)s.oninput=()=>{const q=s.value.toLowerCase();document.querySelectorAll('[data-v35-client]').forEach(el=>el.style.display=el.dataset.v35Client.includes(q)?'':'none')};
  };
})();