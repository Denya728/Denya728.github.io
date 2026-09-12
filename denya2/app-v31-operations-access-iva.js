(function(){
  const planRank={Emprende:1,Negocio:2,Pro:3};
  const currentPlan=()=>state.subscription?.plan||state.plan||'Negocio';
  const has=min=>(planRank[currentPlan()]||1)>=planRank[min];
  const fmtDate=v=>{if(!v)return 'Sin fecha';const d=new Date(v+'T12:00:00');return isNaN(d)?v:d.toLocaleDateString('es-MX',{day:'2-digit',month:'short'})};
  const closed=q=>q.status==='Entregada y pagada';
  const orderLike=q=>['Aceptada','Entregada y pagada'].includes(q.status);
  const lockCard=(title,min,text)=>`<div class="card" style="position:relative;overflow:hidden;min-height:150px"><div style="position:absolute;right:-18px;top:-18px;width:90px;height:90px;border-radius:50%;background:#f4ece6"></div><div style="position:relative"><div style="font-size:24px">🔒</div><h3 style="margin:8px 0 4px">${esc(title)}</h3><div class="muted">${esc(text)}</div><div style="margin-top:12px"><span class="badge off">Disponible desde ${min}</span></div></div></div>`;

  views.home=function(){
    titleEl.textContent='Resumen';
    const quotes=state.quotes||[];
    const accepted=quotes.filter(q=>q.status==='Aceptada');
    const sold=quotes.filter(closed);
    const revenue=sold.reduce((s,q)=>s+(Number(q.total)||0),0);
    const outstanding=accepted.reduce((s,q)=>s+(Number(q.balance)||0),0);
    const next=[...accepted].sort((a,b)=>String(a.event||'').localeCompare(String(b.event||''))).slice(0,5);
    const low=(state.inventory||[]).filter(i=>Number(i.stock)<=5).slice(0,6);
    const customerRows={};
    sold.forEach(q=>{const k=q.client||'Sin cliente';if(!customerRows[k])customerRows[k]={name:k,orders:0,total:0,last:''};customerRows[k].orders++;customerRows[k].total+=Number(q.total)||0;if(!customerRows[k].last||String(q.event)>customerRows[k].last)customerRows[k].last=q.event||''});
    const topCustomers=Object.values(customerRows).sort((a,b)=>b.total-a.total).slice(0,6);
    const ops=`<div class="grid3"><div class="card"><div class="muted">Pedidos por entregar</div><strong style="font-size:32px">${accepted.length}</strong><div class="hint">Saldo pendiente ${money(outstanding)}</div></div><div class="card"><div class="muted">Ventas cerradas</div><strong style="font-size:32px">${sold.length}</strong><div class="hint">Total vendido ${money(revenue)}</div></div><div class="card"><div class="muted">Cotizaciones abiertas</div><strong style="font-size:32px">${quotes.filter(q=>q.status==='Borrador').length}</strong><div class="hint">Seguimiento comercial</div></div></div>
      <div class="grid2" style="margin-top:16px"><div class="card"><div class="page-head" style="margin:0 0 8px"><div><h3>Próximos pedidos</h3><div class="hint">Operación diaria tipo DENICAKE</div></div></div>${next.length?next.map(q=>`<div style="display:grid;grid-template-columns:80px 1fr auto;gap:10px;padding:10px 0;border-bottom:1px solid #eee"><b>${esc(fmtDate(q.event))}</b><div><b>${esc(q.client)}</b><div class="hint">${esc(getProduct(q.productId)?.name||'Pedido')}</div></div><span class="badge ok">${money(q.total)}</span></div>`).join(''):'<div class="empty">No hay pedidos aceptados.</div>'}</div><div class="card"><h3 style="margin-top:0">Alertas operativas</h3>${low.length?low.map(i=>`<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #eee"><span>${esc(i.name)}</span><b>${esc(i.stock)} ${esc(i.unit||'')}</b></div>`).join(''):'<div class="helper">Inventario sin alertas críticas.</div>'}</div></div>`;
    const premium=has('Pro')?`<div class="card" style="margin-top:16px"><div class="page-head" style="margin:0 0 10px"><div><h3>Clientes · resumen de compras</h3><div class="hint">Historial consolidado de pedidos comprados por cliente.</div></div><span class="badge ok">PRO</span></div><div class="table-wrap"><table class="table"><thead><tr><th>Cliente</th><th>Pedidos comprados</th><th>Total comprado</th><th>Ticket promedio</th><th>Última compra</th></tr></thead><tbody>${topCustomers.length?topCustomers.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${c.orders}</td><td><b>${money(c.total)}</b></td><td>${money(c.total/c.orders)}</td><td>${esc(fmtDate(c.last))}</td></tr>`).join(''):'<tr><td colspan="5"><div class="empty">Aún no hay ventas cerradas.</div></td></tr>'}</tbody></table></div></div>`:lockCard('Resumen premium de clientes','Pro','Ve cuánto ha comprado cada cliente, cuántos pedidos ha realizado, ticket promedio y última compra.');
    const negocio=has('Negocio')?ops:lockCard('Operaciones del negocio','Negocio','Desbloquea próximos pedidos, saldos por cobrar y alertas de inventario.');
    content.innerHTML=pageHead('Resumen',`Vista operativa según tu plan · ${esc(currentPlan())}`)+`<div class="grid3"><div class="card"><div class="muted">Plan actual</div><strong style="font-size:24px">${esc(currentPlan())}</strong><div class="hint">Las secciones se desbloquean por acceso.</div></div><div class="card"><div class="muted">Pedidos activos</div><strong style="font-size:30px">${quotes.filter(orderLike).length}</strong></div><div class="card"><div class="muted">Ventas acumuladas</div><strong style="font-size:30px">${money(revenue)}</strong></div></div><div style="margin-top:16px">${negocio}</div>${premium}`;
  };

  function syncExtrasForQuote(){
    if(!Array.isArray(state.extras))return;
    (state.products||[]).forEach(p=>{
      const ids=Array.isArray(p.extraIds)?p.extraIds:[];
      if(ids.length){p.extras=ids.map(id=>state.extras.find(x=>x.id===id)).filter(x=>x&&x.active!==false).map(x=>({id:x.id,name:x.name,mode:x.mode||'fixed',price:Number(x.price)||0,category:x.category||'General'}));}
      else if(!Array.isArray(p.extras))p.extras=[];
    });
  }

  const baseNewQuote=window.newQuote;
  if(typeof baseNewQuote==='function'){
    window.newQuote=function(editId=null){
      syncExtrasForQuote();
      baseNewQuote(editId);
      setTimeout(()=>{
        const modalEl=document.querySelector('.modal-bg:last-of-type .modal');if(!modalEl)return;
        const summary=modalEl.querySelector('#sumTotal')?.closest('.quote-section');
        if(summary&&!modalEl.querySelector('#qinvoice')){
          summary.insertAdjacentHTML('beforebegin',`<div class="quote-section"><h3>🧾 Facturación</h3><label style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="qinvoice"> <b>Requiere factura · agregar IVA 16%</b></label><div class="hint" style="margin-top:6px">Al guardar, el IVA se suma al total y queda registrado por separado.</div><div id="ivaPreview" class="helper" style="margin-top:10px;display:none"></div></div>`);
          const existing=editId?(state.quotes||[]).find(q=>q.id===editId):null;
          const chk=modalEl.querySelector('#qinvoice');chk.checked=!!existing?.invoiceRequested;
          const preview=()=>{const base=Number(String(modalEl.querySelector('#sumTotal')?.textContent||'0').replace(/[^0-9.-]/g,''))||0;const iva=base*.16;const box=modalEl.querySelector('#ivaPreview');if(chk.checked){box.style.display='block';box.innerHTML=`Subtotal sin IVA: <b>${money(base)}</b> · IVA 16%: <b>${money(iva)}</b> · Total facturado: <b>${money(base+iva)}</b>`}else box.style.display='none'};
          chk.onchange=preview;preview();
          const saveBtn=modalEl.querySelector('[data-save]');if(saveBtn){const old=saveBtn.onclick;saveBtn.onclick=()=>{const folio=modalEl.querySelector('#qfolio')?.value;const wants=chk.checked;const dep=Number(modalEl.querySelector('#qdeposit')?.value)||50;const base=Number(String(modalEl.querySelector('#sumTotal')?.textContent||'0').replace(/[^0-9.-]/g,''))||0;old&&old();setTimeout(()=>{const q=(state.quotes||[]).find(x=>x.folio===folio);if(!q)return;q.invoiceRequested=wants;q.vatRate=wants?16:0;q.subtotalBeforeVat=base;q.vatAmount=wants?base*.16:0;if(wants){q.total=base+q.vatAmount;q.balance=Math.max(0,q.total*(1-dep/100));}save();},0)}}
        }
      },0);
    };
  }

  const oldClients=views.clients;
  views.clients=function(){oldClients();if(!has('Pro'))return;const head=content.querySelector('.page-head');if(head)head.insertAdjacentHTML('afterend','<div class="helper"><b>PRO:</b> en este plan puedes ver el valor acumulado de cada cliente y su historial de pedidos comprados.</div>');};
})();