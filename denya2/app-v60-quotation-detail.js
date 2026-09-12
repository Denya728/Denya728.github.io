(function(){
  const previous=views.quotations;
  if(typeof previous!=='function') return;

  const statusClass=s=>{
    const x=String(s||'').toLowerCase();
    if(x.includes('entregada'))return 'done';
    if(x.includes('anticipo'))return 'deposit';
    if(x.includes('aceptada'))return 'accepted';
    if(x.includes('cancel'))return 'cancelled';
    return 'draft';
  };
  const statusOptions=['Borrador','Aceptada','Aceptada y anticipo pagado','Entregada y pagada','Cancelada'];
  function fmtDate(v){if(!v)return 'Por definir';const d=new Date(v+'T12:00:00');return isNaN(d)?v:d.toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'});}
  function productName(q){return getProduct(q.productId)?.name||'Producto';}
  function measureName(q){return getMeasure(q.measureId)?.name||'Sin presentación';}
  function paidAmount(q){return Math.max(0,(Number(q.total)||0)-(Number(q.balance)||0));}

  function setQuoteStatus(id,status){
    const q=(state.quotes||[]).find(x=>x.id===id);if(!q)return;
    q.status=status;
    const total=Number(q.total)||0,pct=Number(q.deposit)||50;
    if(status==='Entregada y pagada'||status==='Cancelada')q.balance=0;
    else if(status==='Aceptada y anticipo pagado')q.balance=Math.max(0,total-total*pct/100);
    else q.balance=total;
    save();show('quotations');
  }
  window.v60SetQuoteStatus=setQuoteStatus;

  function duplicateQuote(id){
    const q=(state.quotes||[]).find(x=>x.id===id);if(!q)return;
    const copy=clone(q);copy.id='q'+Date.now();copy.folio='COT-'+String(Math.floor(100000+Math.random()*899999));copy.status='Borrador';copy.balance=Number(copy.total)||0;copy.versions=1;
    state.quotes.unshift(copy);save();show('quotations');toast('Cotización duplicada');
  }
  window.v60DuplicateQuote=duplicateQuote;

  function markPaid(id){
    const q=(state.quotes||[]).find(x=>x.id===id);if(!q)return;
    q.status='Entregada y pagada';q.balance=0;save();closeDetail();show('quotations');toast('Cotización marcada como pagada');
  }
  window.v60MarkPaid=markPaid;

  function closeDetail(){document.querySelector('.v60-detail-bg')?.remove();}
  window.v60CloseDetail=closeDetail;

  function openDetail(id){
    const q=(state.quotes||[]).find(x=>x.id===id);if(!q)return;
    closeDetail();
    const bg=document.createElement('div');bg.className='v60-detail-bg';
    const paid=paidAmount(q),pct=q.total?Math.min(100,paid/(Number(q.total)||1)*100):0;
    bg.innerHTML=`<div class="v60-detail-panel">
      <div class="v60-detail-head"><div><div class="v60-eyebrow">COTIZACIÓN</div><h2>${esc(q.folio)}</h2><div class="muted">${esc(q.client||'Cliente')} · ${fmtDate(q.event)}</div></div><button class="icon" onclick="v60CloseDetail()">×</button></div>
      <div class="v60-detail-actions"><button class="primary" onclick="v60CloseDetail();newQuote('${q.id}')">Editar</button>${typeof quotePdf==='function'?`<button class="secondary" onclick="quotePdf('${q.id}')">PDF</button>`:''}<button class="secondary" onclick="v60DuplicateQuote('${q.id}')">Duplicar</button>${typeof quoteWhatsApp==='function'?`<button class="ghost" onclick="quoteWhatsApp('${q.id}')">WhatsApp</button>`:''}</div>
      <div class="v60-status-line"><span class="v60-status ${statusClass(q.status)}">${esc(q.status||'Borrador')}</span><select onchange="v60SetQuoteStatus('${q.id}',this.value)">${statusOptions.map(s=>`<option ${s===q.status?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="v60-detail-grid">
        <section class="v60-detail-card"><h3>Pedido</h3><div class="v60-info-row"><span>Producto</span><b>${esc(productName(q))}</b></div><div class="v60-info-row"><span>Presentación</span><b>${esc(measureName(q))}</b></div><div class="v60-info-row"><span>Fecha del evento</span><b>${fmtDate(q.event)}</b></div><div class="v60-info-row"><span>Versiones</span><b>${Number(q.versions)||1}</b></div></section>
        <section class="v60-detail-card"><h3>Pago</h3><div class="v60-price-main"><span>Total</span><strong>${money(q.total)}</strong></div><div class="v60-progress"><i style="width:${pct}%"></i></div><div class="v60-info-row"><span>Pagado</span><b>${money(paid)}</b></div><div class="v60-info-row"><span>Saldo pendiente</span><b>${money(q.balance)}</b></div><div class="v60-info-row"><span>Anticipo</span><b>${Number(q.deposit)||0}%</b></div>${q.status!=='Entregada y pagada'&&q.status!=='Cancelada'?`<button class="primary v60-paid-btn" onclick="v60MarkPaid('${q.id}')">Marcar entregada y pagada</button>`:''}</section>
      </div>
      <section class="v60-detail-card v60-wide"><h3>Información adicional</h3><div class="v60-info-row"><span>Cliente</span><b>${esc(q.client||'—')}</b></div><div class="v60-info-row"><span>Folio</span><b>${esc(q.folio||'—')}</b></div>${q.notes?`<div class="v60-notes"><span>Notas</span><p>${esc(q.notes)}</p></div>`:''}</section>
    </div>`;
    bg.onclick=e=>{if(e.target===bg)closeDetail();};document.body.appendChild(bg);
  }
  window.v60OpenQuoteDetail=openDetail;

  function renderSimpleTable(){
    const oldBody=document.getElementById('quotesBody');if(!oldBody)return;
    const table=oldBody.closest('table');if(!table)return;
    table.classList.add('v60-quotes-table');
    const thead=table.querySelector('thead');if(thead)thead.innerHTML='<tr><th>Folio</th><th>Cliente</th><th>Evento</th><th>Estatus</th><th>Total</th><th>Acciones</th></tr>';
    const body=table.querySelector('tbody');body.innerHTML=(state.quotes||[]).map(q=>`<tr data-v60-row data-search="${esc((String(q.folio)+' '+String(q.client)+' '+productName(q)+' '+String(q.status)).toLowerCase())}" data-status="${esc(q.status||'Borrador')}"><td><button class="v60-folio" onclick="v60OpenQuoteDetail('${q.id}')">${esc(q.folio)}</button><small>${esc(productName(q))}</small></td><td><b>${esc(q.client||'—')}</b></td><td>${fmtDate(q.event)}</td><td><span class="v60-status ${statusClass(q.status)}">${esc(q.status||'Borrador')}</span></td><td><b>${money(q.total)}</b>${Number(q.balance)>0?`<small>${money(q.balance)} pendiente</small>`:''}</td><td><div class="v60-actions"><button class="secondary" onclick="v60OpenQuoteDetail('${q.id}')">Ver</button><button class="ghost" onclick="newQuote('${q.id}')">Editar</button></div></td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">Todavía no hay cotizaciones.</div></td></tr>';

    const search=document.getElementById('quoteSearch'),filter=document.getElementById('quoteFilter');
    const apply=()=>{const term=(search?.value||'').trim().toLowerCase(),st=filter?.value||'';document.querySelectorAll('[data-v60-row]').forEach(r=>{const okText=!term||r.dataset.search.includes(term);const okStatus=!st||st==='Todos los estatus'||r.dataset.status===st;r.style.display=okText&&okStatus?'':'none';});};
    if(search){search.oninput=apply;search.placeholder='Buscar folio, cliente o producto…';}
    if(filter){filter.onchange=apply;}
    apply();
  }

  views.quotations=function(){previous();requestAnimationFrame(renderSimpleTable);};
  views.quotes=views.quotations;
})();