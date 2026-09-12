(function(){
  const qFor=o=>(state.quotes||[]).find(q=>q.id===o.quoteId);
  const ACTIVE=['Pendiente','En producción','Listo'];
  const PRIORITIES=['Alta','Normal','Baja'];
  const moneySafe=n=>typeof money==='function'?money(Number(n)||0):'$'+(Number(n)||0).toFixed(2);
  const escSafe=v=>typeof esc==='function'?esc(v):String(v??'');
  let selected=new Set();
  let weekStart='';

  function iso(d){return new Date(d).toISOString().slice(0,10)}
  function mondayOf(v){const d=v?new Date(v+'T12:00:00'):new Date();const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return iso(d)}
  function addDays(v,n){const d=new Date(v+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}
  function fmt(v){if(!v)return 'Sin fecha';return new Date(v+'T12:00:00').toLocaleDateString('es-MX',{weekday:'short',day:'2-digit',month:'short'})}
  function ensurePlan(){state.productionPlanning=state.productionPlanning||{};if(!Number(state.productionPlanning.capacityPerDay))state.productionPlanning.capacityPerDay=6;if(!weekStart)weekStart=mondayOf(new Date().toISOString().slice(0,10));}
  function planOrders(){ensurePlan();const end=addDays(weekStart,6);return (state.orders||[]).filter(o=>{const q=qFor(o),d=q?.event;return q&&ACTIVE.includes(o.status)&&d&&d>=weekStart&&d<=end}).sort((a,b)=>String(qFor(a)?.event||'').localeCompare(String(qFor(b)?.event||''))||priorityRank(a)-priorityRank(b));}
  function priorityRank(o){return o?.priority==='Alta'?0:o?.priority==='Baja'?2:1}
  function collectRecipes(q,map){
    const add=id=>{if(!id)return;const r=(state.recipes||[]).find(x=>x.id===id);if(!r)return;const cur=map.get(id)||{id,name:r.name,qty:0};cur.qty+=1;map.set(id,cur)};
    Object.values(q?.selections||{}).forEach(add);
    (q?.tiers||[]).forEach(t=>Object.values(t?.selections||{}).forEach(add));
    (q?.items||[]).forEach(i=>{if(i.recipeId)add(i.recipeId)});
  }
  function materialsFor(q){try{return typeof window.denyaMaterialsV41==='function'?(window.denyaMaterialsV41(q)||[]):[]}catch(e){return[]}}
  function consolidate(rows){
    const recipes=new Map(),mats=new Map();
    rows.forEach(o=>{const q=qFor(o);collectRecipes(q,recipes);materialsFor(q).forEach(x=>{const key=x.inventoryId||x.id||x.name;const cur=mats.get(key)||{name:x.name||'Material',unit:x.unit||'',qty:0,cost:0};cur.qty+=Number(x.qty||x.need)||0;cur.cost+=Number(x.lineCost)||((Number(x.qty||x.need)||0)*(Number(x.cost)||0));mats.set(key,cur)})});
    return {recipes:[...recipes.values()],materials:[...mats.values()]};
  }
  function statusClass(s){return s==='En producción'?'production':s==='Listo'?'ready':''}
  function ensureStyle(){
    if(document.getElementById('v51planning'))return;
    const s=document.createElement('style');s.id='v51planning';s.textContent=`
    .v51-top{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:12px 0;flex-wrap:wrap}.v51-weeknav{display:flex;gap:8px;align-items:center}.v51-weeknav b{min-width:210px;text-align:center}.v51-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}.v51-kpi{background:#fff;border:1px solid #eadfd4;border-radius:15px;padding:14px}.v51-kpi small{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#9a7850}.v51-kpi strong{display:block;font-size:24px;margin-top:5px}.v51-days{display:grid;grid-template-columns:repeat(7,minmax(180px,1fr));gap:10px;overflow:auto;padding-bottom:8px}.v51-day{background:#fff;border:1px solid #eadfd4;border-radius:15px;min-height:210px;padding:10px}.v51-day.over{border-color:#d08a55;background:#fff9f4}.v51-dayhead{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:9px}.v51-order{border:1px solid #eee3da;border-radius:12px;padding:9px;margin:7px 0;background:#fff}.v51-order label{display:flex;gap:7px;align-items:flex-start}.v51-order .meta{font-size:11px;color:#8c7a6e;margin-top:3px}.v51-order select{width:100%;margin-top:7px;border:1px solid #ddd0c5;border-radius:8px;padding:6px;background:#fff}.v51-summary{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.v51-list{background:#fff;border:1px solid #eadfd4;border-radius:15px;padding:14px}.v51-line{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid #f0e8e2}.v51-line:last-child{border-bottom:0}.v51-actions{display:flex;gap:8px;flex-wrap:wrap}.v51-status{display:inline-flex;padding:4px 8px;border-radius:999px;background:#f2ece7;font-size:10px;font-weight:800}.v51-status.production{background:#fff0c9}.v51-status.ready{background:#dff4e8}@media(max-width:900px){.v51-kpis,.v51-summary{grid-template-columns:1fr 1fr}}@media(max-width:620px){.v51-kpis,.v51-summary{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }
  function setPriority(id,val){const o=(state.orders||[]).find(x=>x.id===id);if(!o)return;o.priority=PRIORITIES.includes(val)?val:'Normal';save();render()}
  window.setPriorityV51=setPriority;
  window.togglePlanOrderV51=function(id,on){on?selected.add(id):selected.delete(id)};
  window.shiftPlanWeekV51=function(n){weekStart=addDays(weekStart,n*7);selected.clear();render()};
  window.todayPlanWeekV51=function(){weekStart=mondayOf(new Date().toISOString().slice(0,10));selected.clear();render()};
  window.changeCapacityV51=function(v){ensurePlan();state.productionPlanning.capacityPerDay=Math.max(1,Number(v)||1);save();render()};
  window.sendSelectedToProductionV51=function(){
    const ids=[...selected].filter(id=>{const o=(state.orders||[]).find(x=>x.id===id);return o?.status==='Pendiente'});
    if(!ids.length){toast('Selecciona pedidos pendientes');return}
    if(!confirm(`¿Enviar ${ids.length} pedido${ids.length===1?'':'s'} a producción? Se descontará inventario al iniciar.`))return;
    ids.forEach(id=>{try{orderAction(id,'start')}catch(e){}});selected.clear();setTimeout(render,0);
  };
  window.openProductionPlanV51=function(){ensurePlan();render()};

  function render(){
    ensurePlan();ensureStyle();
    titleEl.textContent='Pedidos y producción';
    const rows=planOrders(),capacity=Number(state.productionPlanning.capacityPerDay)||6,con=consolidate(rows),pending=rows.filter(o=>o.status==='Pendiente').length,prod=rows.filter(o=>o.status==='En producción').length,ready=rows.filter(o=>o.status==='Listo').length;
    const weekLabel=`${fmt(weekStart)} – ${fmt(addDays(weekStart,6))}`;
    const days=Array.from({length:7},(_,i)=>addDays(weekStart,i));
    content.innerHTML=pageHead('Planeación de producción','Organiza la semana, revisa carga, recetas e insumos y manda pedidos a producción.',`<button class="secondary" onclick="show('orders')">Volver a pedidos</button>`)+`
      <div class="v42-tabs"><button onclick="show('orders')">Pedidos</button><button onclick="openOpsTab('production')">Producción</button><button class="active">Planeación semanal</button></div>
      <div class="v51-top"><div class="v51-weeknav"><button class="secondary" onclick="shiftPlanWeekV51(-1)">←</button><b>${escSafe(weekLabel)}</b><button class="secondary" onclick="shiftPlanWeekV51(1)">→</button><button class="secondary" onclick="todayPlanWeekV51()">Esta semana</button></div><label class="field" style="min-width:180px;margin:0">Capacidad por día<input type="number" min="1" value="${capacity}" onchange="changeCapacityV51(this.value)"></label></div>
      <div class="v51-kpis"><div class="v51-kpi"><small>Pedidos semana</small><strong>${rows.length}</strong></div><div class="v51-kpi"><small>Pendientes</small><strong>${pending}</strong></div><div class="v51-kpi"><small>En producción</small><strong>${prod}</strong></div><div class="v51-kpi"><small>Listos</small><strong>${ready}</strong></div></div>
      <div class="v51-actions" style="margin-bottom:12px"><button class="primary" onclick="sendSelectedToProductionV51()">Producir seleccionados</button><span class="muted">Selecciona pedidos pendientes. El inicio de producción usa las reglas actuales de inventario.</span></div>
      <div class="v51-days">${days.map(d=>{const dayRows=rows.filter(o=>qFor(o)?.event===d),over=dayRows.length>capacity;return `<div class="v51-day ${over?'over':''}"><div class="v51-dayhead"><b>${escSafe(fmt(d))}</b><span class="badge ${over?'warn':'ok'}">${dayRows.length}/${capacity}</span></div>${dayRows.map(o=>{const q=qFor(o),p=getProduct(q?.productId),m=getMeasure(q?.measureId);return `<div class="v51-order"><label><input type="checkbox" ${selected.has(o.id)?'checked':''} ${o.status!=='Pendiente'?'disabled':''} onchange="togglePlanOrderV51('${o.id}',this.checked)"><div><b>${escSafe(q?.folio||'')}</b><div class="meta">${escSafe(q?.client||'')} · ${escSafe(p?.name||'')} ${m?.name?'· '+escSafe(m.name):''}</div><div class="meta">${moneySafe(q?.total||0)} · saldo ${moneySafe(q?.balance||0)}</div></div></label><span class="v51-status ${statusClass(o.status)}">${escSafe(o.status)}</span><select onchange="setPriorityV51('${o.id}',this.value)">${PRIORITIES.map(x=>`<option ${String(o.priority||'Normal')===x?'selected':''}>${x}</option>`).join('')}</select></div>`}).join('')||'<div class="empty" style="padding:18px 4px">Sin pedidos</div>'}</div>`}).join('')}</div>
      <div class="v51-summary"><div class="v51-list"><div class="v33-eyebrow">Preparación semanal</div><h3>Recetas a preparar</h3>${con.recipes.map(r=>`<div class="v51-line"><span>${escSafe(r.name)}</span><b>${r.qty} uso${r.qty===1?'':'s'}</b></div>`).join('')||'<div class="empty">No hay recetas calculables en esta semana.</div>'}</div><div class="v51-list"><div class="v33-eyebrow">Abastecimiento</div><h3>Insumos necesarios</h3>${con.materials.map(x=>`<div class="v51-line"><span>${escSafe(x.name)}</span><b>${Number(x.qty||0).toFixed(2)} ${escSafe(x.unit||'')}</b></div>`).join('')||'<div class="empty">No hay insumos calculables en esta semana.</div>'}</div></div>`;
  }

  const baseOrders=views.orders;
  views.orders=function(){const r=baseOrders&&baseOrders();if(content.querySelector('.v49-toolbar')){const tabs=content.querySelector('.v42-tabs');if(tabs&&!tabs.querySelector('[data-v51plan]'))tabs.insertAdjacentHTML('beforeend','<button data-v51plan onclick="openProductionPlanV51()">Planeación semanal</button>');}return r};
})();