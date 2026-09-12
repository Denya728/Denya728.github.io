(function(){
  const DEPOSIT='Aceptada y anticipo pagado';
  const ym=v=>String(v||'').slice(0,7);
  const moneySafe=n=>typeof money==='function'?money(Number(n)||0):'$'+(Number(n)||0).toFixed(2);
  const qFor=o=>(state.quotes||[]).find(q=>q.id===o.quoteId);

  function depositAmount(q){
    const total=Number(q?.total)||0;
    const pct=Number(q?.deposit)||0;
    const balance=Number(q?.balance);
    if(q?.status===DEPOSIT){
      if(Number.isFinite(balance)&&balance>=0&&balance<total)return Math.max(0,total-balance);
      return Math.max(0,total*((pct>0?pct:50)/100));
    }
    return 0;
  }

  function depositPeriod(q){
    // El Resumen trabaja por el mes operativo del evento. Si no hay fecha de evento,
    // usamos la fecha real en la que se marcó el anticipo.
    return ym(q?.event)||ym(q?.depositPaidAt)||ym(q?.createdAt);
  }

  function closedRevenue(period){
    return (state.orders||[])
      .filter(o=>o.status==='Entregado y pagado')
      .map(o=>({o,q:qFor(o)}))
      .filter(x=>x.q&&ym(x.o.completedAt||x.q.completedAt||x.q.event)===period)
      .reduce((s,x)=>s+(Number(x.q.total)||0),0);
  }

  function depositRows(period){
    const orders=state.orders||[];
    return (state.quotes||[]).filter(q=>{
      if(q.status!==DEPOSIT)return false;
      const o=orders.find(x=>x.quoteId===q.id);
      if(o&&['Entregado y pagado','Cancelado'].includes(o.status))return false;
      return depositPeriod(q)===period;
    });
  }

  function activeOutstanding(){
    const orders=state.orders||[];
    return orders
      .filter(o=>!['Entregado y pagado','Cancelado'].includes(o.status))
      .map(o=>qFor(o))
      .filter(Boolean)
      .reduce((sum,q)=>{
        const total=Number(q.total)||0;
        if(q.status===DEPOSIT)return sum+Math.max(0,total-depositAmount(q));
        const balance=Number(q.balance);
        return sum+(Number.isFinite(balance)?Math.max(0,balance):total);
      },0);
  }

  function patchSummary(){
    const period=state.reportPeriod||new Date().toISOString().slice(0,7);
    const deposits=depositRows(period);
    const depositTotal=deposits.reduce((s,q)=>s+depositAmount(q),0);
    const salesTotal=closedRevenue(period);
    const collected=salesTotal+depositTotal;
    const outstanding=activeOutstanding();
    const cards=[...document.querySelectorAll('.v42-kpi')];
    const cobrado=cards.find(c=>c.querySelector('small')?.textContent?.trim()==='Cobrado');
    if(cobrado){
      const strong=cobrado.querySelector('strong'); if(strong)strong.textContent=moneySafe(collected);
      const note=cobrado.querySelector('span'); if(note)note.textContent=`${moneySafe(salesTotal)} ventas cerradas + ${moneySafe(depositTotal)} anticipos`;
    }
    const porCobrar=cards.find(c=>c.querySelector('small')?.textContent?.trim()==='Por cobrar');
    if(porCobrar){
      const strong=porCobrar.querySelector('strong'); if(strong)strong.textContent=moneySafe(outstanding);
      const note=porCobrar.querySelector('span'); if(note)note.textContent='Saldo pendiente después de anticipos';
    }
  }

  function bindPeriodControls(){
    const p=document.getElementById('v42period');
    if(p)p.onchange=()=>{state.reportPeriod=p.value;save();views.home();};
    const n=document.getElementById('v42now');
    if(n)n.onclick=()=>{state.reportPeriod=new Date().toISOString().slice(0,7);save();views.home();};
  }

  const baseHome=views.home;
  views.home=function(){
    const r=baseHome&&baseHome();
    patchSummary();
    bindPeriodControls();
    return r;
  };
})();