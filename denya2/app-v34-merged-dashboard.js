(function(){
  const rank={Emprende:1,Negocio:2,Pro:3};
  const plan=()=>state.subscription?.plan||state.plan||'Negocio';
  const has=min=>(rank[plan()]||1)>=rank[min];
  const fmtDate=v=>{if(!v)return 'Sin fecha';const d=new Date(v+'T12:00:00');return isNaN(d)?v:d.toLocaleDateString('es-MX',{day:'2-digit',month:'short'})};
  function ensureStyle(){if(document.getElementById('v34merge'))return;const s=document.createElement('style');s.id='v34merge';s.textContent=`
    .v34-section{margin-top:18px}.v34-title{display:flex;justify-content:space-between;align-items:end;gap:12px;margin:0 0 10px}.v34-title h3{margin:2px 0 0;font-size:18px}.v34-ops{display:grid;grid-template-columns:1.35fr 1fr;gap:14px}.v34-row{display:grid;grid-template-columns:82px 1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #eee5de}.v34-row:last-child{border-bottom:0}.v34-alert{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #eee5de}.v34-alert:last-child{border-bottom:0}.v34-lock{background:#fbf8f4;border:1px dashed #d8c7b8;border-radius:14px;padding:14px;color:#7d695d}.v34-sub{color:#8a7770;font-size:12px;margin-top:3px}@media(max-width:900px){.v34-ops{grid-template-columns:1fr}}@media(max-width:650px){.v34-row{grid-template-columns:70px 1fr}.v34-row .badge{grid-column:2;justify-self:start}}
  `;document.head.appendChild(s)}
  const base=views.home;
  views.home=function(){
    base();ensureStyle();
    const quotes=state.quotes||[];
    const accepted=quotes.filter(q=>q.status==='Aceptada');
    const upcoming=[...accepted].filter(q=>!q.event||String(q.event)>=new Date().toISOString().slice(0,10)).sort((a,b)=>String(a.event||'').localeCompare(String(b.event||''))).slice(0,7);
    const low=(state.inventory||[]).filter(i=>i.active!==false&&Number(i.stock)<=Number(i.stockMin??5)).sort((a,b)=>(Number(a.stock)-Number(a.stockMin||0))-(Number(b.stock)-Number(b.stockMin||0))).slice(0,8);
    const block=has('Negocio')?`<div class="v34-section"><div class="v34-title"><div><div class="v33-eyebrow">Operación diaria</div><h3>Qué requiere atención</h3><div class="v34-sub">Conservamos aquí solo la información accionable que no duplica los indicadores de arriba.</div></div></div><div class="v34-ops"><div class="v33-card"><div class="v33-eyebrow">Agenda operativa</div><h3>Próximos pedidos</h3>${upcoming.length?upcoming.map(q=>`<div class="v34-row"><b>${esc(fmtDate(q.event))}</b><div><b>${esc(q.client||'Cliente')}</b><div class="hint">${esc(getProduct(q.productId)?.name||'Pedido')}</div></div><span class="badge ok">${money(q.total)}</span></div>`).join(''):'<div class="empty">No hay pedidos aceptados por entregar.</div>'}</div><div class="v33-card"><div class="v33-eyebrow">Inventario</div><h3>Alertas operativas</h3>${low.length?low.map(i=>`<div class="v34-alert"><span>${esc(i.name)}</span><div style="text-align:right"><b>${Number(i.stock).toFixed(2)} ${esc(i.useUnit||i.unit||'')}</b><div class="hint">Mín. ${Number(i.stockMin||0).toFixed(2)}</div></div></div>`).join(''):'<div class="helper">Inventario sin alertas críticas.</div>'}</div></div></div>`:`<div class="v34-section v34-lock"><b>Operación diaria</b><br>Próximos pedidos y alertas operativas están disponibles desde Negocio.</div>`;
    content.insertAdjacentHTML('beforeend',block);
  };
})();