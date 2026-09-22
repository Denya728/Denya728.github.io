// DENYA SWEETLAB v94 · downloadable reports
(function(){
  const E=v=>typeof esc==='function'?esc(v??''):String(v??'');
  const M=v=>typeof money==='function'?money(Number(v)||0):new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(v)||0);
  const A=k=>Array.isArray(state[k])?state[k]:[];
  const D=v=>{if(!v)return ''; const d=new Date(v); return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('es-MX');};
  const clean=v=>String(v??'').replace(/<[^>]*>/g,'');
  const dateVal=v=>{if(!v)return ''; const d=new Date(v); return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10)};
  let reportType='sales';

  const configs={
    sales:{title:'Ventas',desc:'Ventas, anticipos, saldos y pedidos cobrados',cols:['Fecha','Folio','Cliente','Marca','Estado','Total','Anticipo','Saldo'],build:buildSales},
    clients:{title:'Clientes',desc:'Actividad comercial y valor por cliente',cols:['Cliente','Teléfono','Email','Cotizaciones','Pedidos','Total cotizado','Total vendido','Última compra'],build:buildClients},
    inventory:{title:'Inventario',desc:'Existencias, costos, valor y reposición',cols:['Material','SKU','Unidad','Stock','Punto reorden','Costo unitario','Valor inventario','Necesidad'],build:buildInventory},
    quotations:{title:'Cotizaciones',desc:'Embudo de cotizaciones y conversión',cols:['Fecha','Folio','Cliente','Estado','Subtotal','Descuento','Total','Anticipo','Saldo'],build:buildQuotations},
    production:{title:'Producción',desc:'Pedidos y trabajos programados',cols:['Fecha','Pedido','Cliente','Estado','Programado','Total','Materiales','Notas'],build:buildProduction}
  };

  function baseOrders(){return A('orders').map(o=>{const q=A('quotes').find(q=>q.id===o.quotation_id||q.id===o.quoteId);return {o,q}})}
  function clientName(o,q){return o?.client||q?.client||q?.client_name_snapshot||''}
  function brand(o,q){return o?.brand_name||q?.brand||q?.brand_name||state?.profile?.businessName||''}
  function buildSales(){return baseOrders().filter(x=>x.o).map(({o,q})=>[D(o.event_date||o.created_at||q?.event_date),o.folio||o.id?.slice(0,8)||'',clientName(o,q),brand(o,q),o.status||'',Number(o.total||q?.total||0),Number(o.deposit_paid||q?.deposit_paid||0),Number(o.balance||q?.balance||0)])}
  function buildClients(){
    const map={};
    A('clientRecords').forEach(c=>{map[c.id||c.full_name]={name:c.full_name||c.name||'',phone:c.phone||'',email:c.email||'',quotes:0,orders:0,quoted:0,sold:0,last:''}});
    A('quotes').forEach(q=>{const key=q.client_id||q.client||q.client_name_snapshot||('q-'+q.id);map[key]??={name:q.client||q.client_name_snapshot||'',phone:'',email:'',quotes:0,orders:0,quoted:0,sold:0,last:''};const c=map[key];c.quotes++;c.quoted+=Number(q.total||0);});
    baseOrders().forEach(({o,q})=>{const key=o.client_id||q?.client_id||clientName(o,q)||('o-'+o.id);map[key]??={name:clientName(o,q),phone:'',email:'',quotes:0,orders:0,quoted:0,sold:0,last:''};const c=map[key];c.orders++;c.sold+=Number(o.total||q?.total||0);const dt=dateVal(o.event_date||o.created_at);if(dt&&dt>c.last)c.last=dt;});
    return Object.values(map).filter(c=>c.name).map(c=>[c.name,c.phone,c.email,c.quotes,c.orders,c.quoted,c.sold,D(c.last)]);
  }
  function buildInventory(){
    return A('inventory').map(i=>{const stock=Number(i.quantity??i.stock??0),cost=Number(i.unit_cost??i.cost??0),reorder=Number(i.reorder_point??i.minStock??0);return [i.name||'',i.sku||'',i.unit||'',stock,reorder,cost,stock*cost,Math.max(0,reorder-stock)]});
  }
  function buildQuotations(){return A('quotes').map(q=>[D(q.event_date||q.created_at),q.folio||q.id?.slice(0,8)||'',q.client||q.client_name_snapshot||'',q.status||'',Number(q.subtotal||0),Number(q.discount||0),Number(q.total||0),Number(q.deposit_paid||0),Number(q.balance??Math.max(0,Number(q.total||0)-Number(q.deposit_paid||0)))])}
  function buildProduction(){
    const jobs=A('production_jobs');if(jobs.length)return jobs.map(j=>{const o=A('orders').find(x=>x.id===j.order_id);const q=A('quotes').find(x=>x.id===o?.quotation_id||x.id===o?.quoteId);return [D(j.planned_for||o?.event_date||j.created_at),o?.folio||o?.id?.slice(0,8)||'',clientName(o,q),j.status||o?.status||'',D(j.planned_for),Number(o?.total||q?.total||0),Array.isArray(j.materials)?j.materials.map(x=>x.name||x.id||'').join(', '):String(j.materials||''),j.notes||'']});return baseOrders().map(({o,q})=>[D(o.event_date||q?.event_date),o.folio||o.id?.slice(0,8)||'',clientName(o,q),o.status||'',D(o.event_date||q?.event_date),Number(o.total||q?.total||0),Array.isArray(o.materials)?o.materials.map(x=>x.name||x.id||'').join(', '):'',o.notes||''])}
  function filterRows(rows,type){
    const from=document.getElementById('v94From')?.value||'',to=document.getElementById('v94To')?.value||'',status=document.getElementById('v94Status')?.value||'';
    if(type==='inventory')return rows.filter(r=>!status||Number(r[3])<=Number(r[4]));
    if(!from&&!to&&!status)return rows;
    const dateIndex=(type==='clients'||type==='inventory')?-1:0;
    return rows.filter(r=>{if(dateIndex<0)return !status||true;const raw=r[dateIndex];let ok=true;if(from)ok=ok&&raw>=D(from);if(to)ok=ok&&raw<=D(to);if(status)ok=ok&&String(r[3]||'').toLowerCase()===status.toLowerCase();return ok});
  }
  function totals(rows,type){
    if(type==='sales')return [rows.length,rows.reduce((s,r)=>s+Number(r[5]||0),0),rows.reduce((s,r)=>s+Number(r[6]||0),0),rows.reduce((s,r)=>s+Number(r[7]||0),0)];
    if(type==='clients')return [rows.length,rows.reduce((s,r)=>s+Number(r[4]||0),0),rows.reduce((s,r)=>s+Number(r[6]||0),0),rows.reduce((s,r)=>s+Number(r[5]||0),0)];
    if(type==='inventory')return [rows.length,rows.reduce((s,r)=>s+Number(r[3]||0),0),rows.reduce((s,r)=>s+Number(r[6]||0),0),rows.reduce((s,r)=>s+Number(r[7]||0),0)];
    if(type==='quotations')return [rows.length,rows.reduce((s,r)=>s+Number(r[6]||0),0),rows.filter(r=>['aceptada','entregada y pagada'].includes(String(r[3]).toLowerCase())).length,rows.length?Math.round(rows.filter(r=>['aceptada','entregada y pagada'].includes(String(r[3]).toLowerCase())).length/rows.length*100):0];
    return [rows.length,rows.reduce((s,r)=>s+Number(r[5]||0),0),rows.filter(r=>/complet|entreg/i.test(String(r[3]))).length,0];
  }
  function summary(type,rows){const t=totals(rows,type);const labels=type==='sales'?['Registros','Total vendido','Anticipos','Saldo']:type==='clients'?['Clientes','Pedidos','Vendido','Cotizado']:type==='inventory'?['Materiales','Unidades','Valor inventario','Por reponer']:type==='quotations'?['Cotizaciones','Valor total','Convertidas','Conversión']:['Trabajos','Valor pedidos','Completados',''];return '<div class="v94-report-summary">'+t.map((x,i)=>'<div><small>'+labels[i]+'</small><b>'+(i===1&&['sales','clients','quotations','production'].includes(type)?M(x):i===2&&['clients','inventory'].includes(type)?M(x):i===3&&type==='quotations'?x+'%':x)+'</b></div>').join('')+'</div>'}
  function renderTable(cols,rows){return '<div class="v94-report-table"><table><thead><tr>'+cols.map(c=>'<th>'+E(c)+'</th>').join('')+'</tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr>'+r.map((v,i)=>'<td>'+E((['sales','clients','inventory','quotations','production'].includes(reportType)&&[5,6,7].includes(i)&&typeof v==='number')?M(v):v)+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+cols.length+'">No hay datos con estos filtros.</td></tr>')+'</tbody></table></div>'}
  function xlsx(rows,cols){
    if(!window.XLSX){toast('No se pudo cargar el exportador Excel.');return}
    const data=[cols,...rows];const ws=XLSX.utils.aoa_to_sheet(data);ws['!cols']=cols.map((_,i)=>({wch:Math.min(32,Math.max(12,Math.max(...data.map(r=>String(r[i]??'').length))+2))}));const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,configs[reportType].title);XLSX.writeFile(wb,'DENYA_'+configs[reportType].title.toUpperCase()+'_'+dateVal(new Date())+'.xlsx');toast('Excel descargado')}
  function csv(rows,cols){const s=[cols,...rows].map(r=>r.map(v=>{v=String(v??'');return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+s],{type:'text/csv;charset=utf-8'}));a.download='DENYA_'+configs[reportType].title.toUpperCase()+'.csv';a.click();URL.revokeObjectURL(a.href)}
  function render(){
    const cfg=configs[reportType],raw=cfg.build(),rows=filterRows(raw,reportType);
    content.innerHTML='<div class="v94-reports-head"><div><h3>Reportes</h3><div class="hint">Consulta y descarga la información operativa de SWEETLAB.</div></div><div class="v94-report-actions"><button class="primary" id="v94Excel">↓ Excel (.xlsx)</button><button class="secondary" id="v94Csv">CSV</button></div></div>'+
      '<div class="v94-report-tabs">'+Object.entries(configs).map(([k,c])=>'<button class="'+(k===reportType?'active':'')+'" data-report="'+k+'">'+E(c.title)+'</button>').join('')+'</div>'+
      '<div class="section"><div class="v94-filters"><label>Desde<input id="v94From" type="date"></label><label>Hasta<input id="v94To" type="date"></label><label>Estado<select id="v94Status"><option value="">Todos</option><option>Aceptada</option><option>Entregada y pagada</option><option>En proceso</option><option>Cancelado</option><option>Rechazada</option><option>Borrador</option></select></label><button class="secondary" id="v94Apply">Aplicar filtros</button><button class="secondary" id="v94Clear">Limpiar</button></div></div>'+
      summary(reportType,rows)+renderTable(cfg.cols,rows);
    content.querySelectorAll('[data-report]').forEach(b=>b.onclick=()=>{reportType=b.dataset.report;render()});
    content.querySelector('#v94Apply').onclick=render;content.querySelector('#v94Clear').onclick=()=>{render()};
    content.querySelector('#v94Excel').onclick=()=>xlsx(filterRows(cfg.build(),reportType),cfg.cols);
    content.querySelector('#v94Csv').onclick=()=>csv(filterRows(cfg.build(),reportType),cfg.cols);
  }
  const oldReports=views.reports;
  views.reports=()=>render();
  views.home=(()=>{const old=views.home;return function(){old();}})();
  window.DENYAReports={open:()=>show('reports'),refresh:render};
  document.addEventListener('DOMContentLoaded',()=>{if(!document.querySelector('script[data-xlsx]')){const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';s.dataset.xlsx='1';document.head.appendChild(s)}});
})();