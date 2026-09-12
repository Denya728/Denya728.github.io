(function(){
  const DEPOSIT='Aceptada y anticipo pagado';
  const ym=v=>String(v||'').slice(0,7);
  const moneySafe=n=>typeof money==='function'?money(Number(n)||0):'$'+(Number(n)||0).toFixed(2);
  const qFor=o=>(state.quotes||[]).find(q=>q.id===o.quoteId);

  function ensureDepositDates(){
    let changed=false;
    (state.quotes||[]).forEach(q=>{
      if(q.status===DEPOSIT&&!q.depositPaidAt){q.depositPaidAt=new Date().toISOString();changed=true;}
    });
    if(changed)save();
  }

  function depositAmount(q){
    const total=Number(q?.total)||0;
    const balance=Number(q?.balance);
    if(Number.isFinite(balance)){
      const paid=Math.max(0,total-balance);
      if(paid>0)return paid;
    }
    const pct=Number(q?.deposit)||0;
    return Math.max(0,total*(pct/100));
  }

  function activeDeposits(period){
    const orders=state.orders||[];
    return (state.quotes||[]).filter(q=>{
      if(q.status!==DEPOSIT)return false;
      const o=orders.find(x=>x.quoteId===q.id);
      if(o&&['Entregado y pagado','Cancelado'].includes(o.status))return false;
      return ym(q.depositPaidAt)===period;
    });
  }

  function closedRevenue(period){
    try{
      if(typeof window.denyaFinancePeriodV45==='function'){
        return (window.denyaFinancePeriodV45(period)||[]).reduce((s,x)=>s+(Number(x.revenue)||0),0);
      }
    }catch(e){}
    return (state.orders||[]).filter(o=>o.status==='Entregado y pagado').map(o=>({o,q:qFor(o)})).filter(x=>x.q&&ym(x.o.completedAt||x.q.completedAt||x.q.event)===period).reduce((s,x)=>s+(Number(x.q.total)||0),0);
  }

  function patchSummary(){
    ensureDepositDates();
    const period=state.reportPeriod||new Date().toISOString().slice(0,7);
    const deposits=activeDeposits(period);
    const depositTotal=deposits.reduce((s,q)=>s+depositAmount(q),0);
    const salesTotal=closedRevenue(period);
    const collected=salesTotal+depositTotal;
    const card=[...content.querySelectorAll('.v42-kpi')].find(c=>c.querySelector('small')?.textContent?.trim()==='Cobrado');
    if(card){
      const strong=card.querySelector('strong');if(strong)strong.textContent=moneySafe(collected);
      const note=card.querySelector('span');if(note)note.textContent=`${deposits.length} anticipo${deposits.length===1?'':'s'} cobrado${deposits.length===1?'':'s'} · ${moneySafe(depositTotal)} en anticipos`;
    }
  }

  const baseHome=views.home;
  views.home=function(){
    ensureDepositDates();
    const r=baseHome&&baseHome();
    patchSummary();
    return r;
  };

  const baseQuotations=views.quotations;
  views.quotations=function(){
    const r=baseQuotations&&baseQuotations();
    document.querySelectorAll('#quotesBody select.status').forEach(sel=>{
      sel.addEventListener('change',()=>{
        const tr=sel.closest('tr');
        const folio=tr?.querySelector('td b')?.textContent?.trim();
        const q=(state.quotes||[]).find(x=>x.folio===folio);
        if(q?.status===DEPOSIT&&!q.depositPaidAt){q.depositPaidAt=new Date().toISOString();save();}
      });
    });
    return r;
  };

  ensureDepositDates();
})();