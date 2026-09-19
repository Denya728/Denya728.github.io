// DENYA v91 · real profitability, historical reporting and accounting exports
(function(){
  const moneyV=n=>typeof money==='function'?money(Number(n)||0):new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(n)||0);
  const E=v=>typeof esc==='function'?esc(v??''):String(v??'');
  const ym=v=>String(v||'').slice(0,7);
  const todayYM=()=>new Date().toISOString().slice(0,7);
  const monthLabel=v=>{const [y,m]=String(v||'').split('-').map(Number);return y&&m?new Date(y,m-1,1).toLocaleDateString('es-MX',{month:'long',year:'numeric'}):v};
  const addMonth=(v,n)=>{const [y,m]=String(v).split('-').map(Number);const d=new Date(y,m-1+n,1);return d.toISOString().slice(0,7)};
  const planRank={Emprende:1,Negocio:2,Pro:3};
  const currentPlan=()=>state.subscription?.plan||state.plan||'Emprende';
  const hasPro=()=>Number(planRank[currentPlan()]||1)>=3;

  function ensure(){
    if(!Array.isArray(state.financeTransactions))state.financeTransactions=[];
  }
  function qFor(o){return (state.quotes||[]).find(q=>q.id===o.quoteId)}
  function quoteCost(q){
    try{if(typeof window.denyaQuoteCostV45==='function')return Number(window.denyaQuoteCostV45(q))||0}catch(_){}
    return Number(q?.costEstimated)||0;
  }
  function salesFor(period){
    return (state.orders||[]).filter(o=>o.status==='Entregado y pagado').map(o=>({o,q:qFor(o)}))
      .filter(x=>x.q&&ym(x.o.completedAt||x.q.completedAt||x.q.event)===period)
      .map(x=>({folio:x.q.folio||'',client:x.q.client||'',date:x.o.completedAt||x.q.completedAt||x.q.event||'',revenue:Number(x.q.total)||0,cost:quoteCost(x.q)}));
  }
  function txFor(period){ensure();return state.financeTransactions.filter(t=>ym(t.date||t.occurredAt||t.createdAt)===period)}
  function metrics(period){
    const sales=salesFor(period),tx=txFor(period);
    const salesRevenue=sales.reduce((s,x)=>s+x.revenue,0);
    const direct=sales.reduce((s,x)=>s+x.cost,0);
    const extraIncome=tx.filter(t=>t.type==='income').reduce((s,x)=>s+Math.abs(Number(x.amount)||0),0);
    const refunds=tx.filter(t=>t.type==='refund').reduce((s,x)=>s+Math.abs(Number(x.amount)||0),0);
    const indirect=tx.filter(t=>t.type==='expense').reduce((s,x)=>s+Math.abs(Number(x.amount)||0),0);
    const investment=tx.filter(t=>t.type==='investment').reduce((s,x)=>s+Math.abs(Number(x.amount)||0),0);
    const netRevenue=salesRevenue+extraIncome-refunds;
    const operatingProfit=netRevenue-direct-indirect;
    const cashAfterInvestment=operatingProfit-investment;
    const margin=netRevenue?operatingProfit/netRevenue*100:0;
    const ticket=sales.length?salesRevenue/sales.length:0;
    return {period,sales,tx,salesRevenue,extraIncome,refunds,netRevenue,direct,indirect,investment,operatingProfit,cashAfterInvestment,margin,ticket};
  }
  function id(){return 'ft'+Date.now()+Math.random().toString(36).slice(2,7)}
  window.openFinanceMovementV91=function(existingId=null){
    ensure();
    const t=existingId?state.financeTransactions.find(x=>x.id===existingId):{type:'expense',category:'Costos indirectos',amount:0,date:new Date().toISOString().slice(0,10),description:''};
    if(!t)return;
    const w=modal(existingId?'Editar movimiento':'Nuevo movimiento financiero',`
      <div class="form2">
        ${selectField('Tipo','v91ftType',[
          {value:'income',label:'Ingreso adicional'},
          {value:'expense',label:'Gasto / costo indirecto'},
          {value:'investment',label:'Inversión'},
          {value:'refund',label:'Reembolso / devolución'}
        ],t.type)}
        ${field('Categoría','v91ftCategory',t.category||'')}
        ${field('Importe MXN','v91ftAmount',Number(t.amount)||0,'number','min="0" step="0.01"')}
        ${field('Fecha','v91ftDate',String(t.date||'').slice(0,10)||new Date().toISOString().slice(0,10),'date')}
      </div>
      <div style="margin-top:12px">${area('Descripción / referencia','v91ftDescription',t.description||'')}</div>
      <div class="helper"><b>Cómo afecta la rentabilidad:</b> los gastos indirectos reducen utilidad operativa; las inversiones se muestran por separado para no confundir inversión con gasto corriente.</div>
    `,wrap=>{
      const data={
        id:t.id||id(),type:wrap.querySelector('#v91ftType').value,
        category:wrap.querySelector('#v91ftCategory').value.trim()||'General',
        amount:Math.abs(Number(wrap.querySelector('#v91ftAmount').value)||0),
        date:wrap.querySelector('#v91ftDate').value,
        description:wrap.querySelector('#v91ftDescription').value.trim(),
        createdAt:t.createdAt||new Date().toISOString()
      };
      if(!data.amount){toast('Escribe un importe mayor a 0');return false}
      if(existingId)Object.assign(t,data);else state.financeTransactions.unshift(data);
      save();views.finance();toast('Movimiento guardado');
    });
  };
  window.deleteFinanceMovementV91=function(id){
    if(!confirm('¿Eliminar este movimiento financiero?'))return;
    state.financeTransactions=state.financeTransactions.filter(x=>x.id!==id);save();views.finance();
  };
  function xmlEsc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function sheet(name,rows){
    const body=rows.map(row=>'<Row>'+row.map(cell=>{
      const n=typeof cell==='number'&&Number.isFinite(cell);
      return '<Cell><Data ss:Type="'+(n?'Number':'String')+'">'+xmlEsc(cell)+'</Data></Cell>';
    }).join('')+'</Row>').join('');
    return '<Worksheet ss:Name="'+xmlEsc(name)+'"><Table>'+body+'</Table></Worksheet>';
  }
  window.exportFinanceExcelV91=function(){
    const period=state.reportPeriod||todayYM(),m=metrics(period);
    const summary=[
      ['DENYA SWEETLAB - Reporte financiero',monthLabel(period)],
      ['Concepto','Importe MXN'],
      ['Ventas cerradas',m.salesRevenue],['Ingresos adicionales',m.extraIncome],['Reembolsos',m.refunds],
      ['Ingresos netos',m.netRevenue],['Costo directo',m.direct],['Costos indirectos',m.indirect],
      ['Utilidad operativa',m.operatingProfit],['Margen %',Number(m.margin.toFixed(2))],
      ['Inversión',m.investment],['Resultado después de inversión',m.cashAfterInvestment]
    ];
    const mov=[['Fecha','Tipo','Categoría','Descripción','Importe'],...m.tx.map(t=>[t.date||'',t.type||'',t.category||'',t.description||'',Number(t.amount)||0])];
    const sales=[['Fecha','Folio','Cliente','Venta','Costo directo','Utilidad'],...m.sales.map(s=>[s.date||'',s.folio,s.client,s.revenue,s.cost,s.revenue-s.cost])];
    const history=[['Mes','Ingresos netos','Costo directo','Indirectos','Utilidad operativa','Inversión','Resultado final']];
    for(let i=11;i>=0;i--){const p=addMonth(period,-i),x=metrics(p);history.push([p,x.netRevenue,x.direct,x.indirect,x.operatingProfit,x.investment,x.cashAfterInvestment])}
    const xml='<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'+
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'+
      sheet('Resumen',summary)+sheet('Movimientos',mov)+sheet('Ventas',sales)+sheet('Histórico',history)+'</Workbook>';
    const blob=new Blob([xml],{type:'application/vnd.ms-excel'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='DENYA_Finanzas_'+period+'.xls';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  };
  window.exportFinanceCsvV91=function(){
    ensure();
    const rows=[['Fecha','Tipo','Categoría','Descripción','Importe MXN']];
    state.financeTransactions.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).forEach(t=>rows.push([t.date||'',t.type||'',t.category||'',t.description||'',Number(t.amount)||0]));
    const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='DENYA_Movimientos_Contables.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  };

  function movementLabel(t){return t==='income'?'Ingreso':t==='expense'?'Gasto indirecto':t==='investment'?'Inversión':'Reembolso'}
  function render(){
    ensure();
    const period=state.reportPeriod||todayYM();state.reportPeriod=period;
    const m=metrics(period),prev=metrics(addMonth(period,-1));
    const delta=prev.operatingProfit?((m.operatingProfit-prev.operatingProfit)/Math.abs(prev.operatingProfit))*100:null;
    titleEl.textContent='Finanzas';
    const history=[];
    for(let i=11;i>=0;i--){const p=addMonth(period,-i);history.push(metrics(p))}
    content.innerHTML=pageHead('Finanzas','Rentabilidad real: ventas, costos directos, gastos indirectos e inversión.',`
      <div class="row-actions">
        <button class="secondary" onclick="openFinanceMovementV91()">+ Movimiento</button>
        ${hasPro()?'<button class="secondary" onclick="exportFinanceCsvV91()">CSV contable</button><button class="primary" onclick="exportFinanceExcelV91()">Exportar Excel</button>':''}
      </div>`)+
      `<div class="v91-finance-toolbar">
        <label class="field">Periodo<input id="v91FinancePeriod" type="month" value="${E(period)}"></label>
        <button class="secondary" id="v91FinanceNow">Mes actual</button>
        <div class="v91-compare"><small>Vs. mes anterior</small><b class="${m.operatingProfit>=prev.operatingProfit?'profit-pos':'profit-neg'}">${delta==null?'Sin base':(delta>=0?'+':'')+delta.toFixed(1)+'%'}</b></div>
      </div>
      <div class="v91-finance-kpis">
        <div class="v91-fin-kpi"><small>Ingresos netos</small><strong>${moneyV(m.netRevenue)}</strong><span>Ventas + otros ingresos − reembolsos</span></div>
        <div class="v91-fin-kpi"><small>Costo directo</small><strong>${moneyV(m.direct)}</strong><span>Recetas, materiales y empaque</span></div>
        <div class="v91-fin-kpi"><small>Costos indirectos</small><strong>${moneyV(m.indirect)}</strong><span>Renta, servicios, publicidad, etc.</span></div>
        <div class="v91-fin-kpi"><small>Utilidad operativa</small><strong class="${m.operatingProfit>=0?'profit-pos':'profit-neg'}">${moneyV(m.operatingProfit)}</strong><span>Margen ${m.margin.toFixed(1)}%</span></div>
        <div class="v91-fin-kpi"><small>Inversión</small><strong>${moneyV(m.investment)}</strong><span>Separada del gasto operativo</span></div>
        <div class="v91-fin-kpi"><small>Resultado después de inversión</small><strong class="${m.cashAfterInvestment>=0?'profit-pos':'profit-neg'}">${moneyV(m.cashAfterInvestment)}</strong><span>Flujo real del periodo</span></div>
        <div class="v91-fin-kpi"><small>Pedidos cerrados</small><strong>${m.sales.length}</strong><span>Ticket promedio ${moneyV(m.ticket)}</span></div>
        <div class="v91-fin-kpi"><small>Otros movimientos</small><strong>${m.tx.length}</strong><span>Ingresos, gastos, inversión y devoluciones</span></div>
      </div>
      ${hasPro()?`<div class="v91-history card"><div class="v33-eyebrow">Histórico</div><h3>Últimos 12 meses</h3>
        <div class="table-wrap"><table class="table"><thead><tr><th>Mes</th><th>Ingresos netos</th><th>Directos</th><th>Indirectos</th><th>Utilidad</th><th>Margen</th><th>Inversión</th><th>Resultado final</th></tr></thead><tbody>
        ${history.map(x=>`<tr><td><b>${E(monthLabel(x.period))}</b></td><td>${moneyV(x.netRevenue)}</td><td>${moneyV(x.direct)}</td><td>${moneyV(x.indirect)}</td><td class="${x.operatingProfit>=0?'profit-pos':'profit-neg'}">${moneyV(x.operatingProfit)}</td><td>${x.margin.toFixed(1)}%</td><td>${moneyV(x.investment)}</td><td class="${x.cashAfterInvestment>=0?'profit-pos':'profit-neg'}">${moneyV(x.cashAfterInvestment)}</td></tr>`).join('')}
        </tbody></table></div></div>`:`<div class="helper"><b>Reportes históricos y Excel:</b> disponibles en Pro. El cálculo del mes actual sigue incluyendo tus costos indirectos e inversión.</div>`}
      <div class="v91-fin-grid">
        <div class="card"><div class="v33-eyebrow">Ventas cerradas</div><h3>Rentabilidad por pedido</h3>
          <div class="table-wrap"><table class="table"><thead><tr><th>Folio</th><th>Cliente</th><th>Venta</th><th>Costo directo</th><th>Utilidad bruta</th><th>Margen</th></tr></thead><tbody>
          ${m.sales.map(s=>{const u=s.revenue-s.cost,mg=s.revenue?u/s.revenue*100:0;return `<tr><td><b>${E(s.folio)}</b></td><td>${E(s.client)}</td><td>${moneyV(s.revenue)}</td><td>${moneyV(s.cost)}</td><td class="${u>=0?'profit-pos':'profit-neg'}">${moneyV(u)}</td><td>${mg.toFixed(1)}%</td></tr>`}).join('')||'<tr><td colspan="6"><div class="empty">No hay pedidos entregados y pagados en este periodo.</div></td></tr>'}
          </tbody></table></div>
        </div>
        <div class="card"><div class="v33-eyebrow">Libro de movimientos</div><h3>Gastos, inversión y ajustes</h3>
          <div class="v91-movements">${m.tx.map(t=>`<div class="v91-fin-move"><div><b>${E(t.category||movementLabel(t.type))}</b><small>${E(t.date||'')} · ${E(movementLabel(t.type))}</small><span>${E(t.description||'Sin descripción')}</span></div><div><b>${moneyV(t.amount)}</b><div class="row-actions"><button class="secondary" onclick="openFinanceMovementV91('${t.id}')">Editar</button><button class="danger" onclick="deleteFinanceMovementV91('${t.id}')">×</button></div></div></div>`).join('')||'<div class="empty">Agrega renta, servicios, publicidad, inversiones u otros movimientos para obtener una utilidad más real.</div>'}</div>
        </div>
      </div>`;
    const p=document.getElementById('v91FinancePeriod');if(p)p.onchange=()=>{state.reportPeriod=p.value;save();render()};
    const n=document.getElementById('v91FinanceNow');if(n)n.onclick=()=>{state.reportPeriod=todayYM();save();render()};
  }
  views.finance=render;
})();