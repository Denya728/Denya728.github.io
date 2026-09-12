(function(){
  const DEPOSIT='Aceptada y anticipo pagado';
  const STATUSES=['Borrador','Aceptada',DEPOSIT,'Entregada y pagada','Cancelada'];
  function recalcBalance(q){
    const total=Number(q.total)||0;
    const pct=Number(q.deposit)||0;
    if(q.status==='Entregada y pagada'||q.status==='Cancelada')q.balance=0;
    else if(q.status===DEPOSIT){
      const usePct=pct>0?pct:50;
      q.deposit=usePct;
      q.balance=Math.max(0,total-(total*usePct/100));
    } else if(q.status==='Aceptada') q.balance=total;
  }
  const base=views.quotations;
  views.quotations=function(){
    base();
    const rows=[...document.querySelectorAll('#quotesBody tr')];
    rows.forEach((tr,i)=>{
      const q=(state.quotes||[])[i];if(!q)return;
      const sel=tr.querySelector('select.status');if(!sel)return;
      sel.removeAttribute('onchange');
      sel.innerHTML=STATUSES.map(s=>`<option value="${s}" ${q.status===s?'selected':''}>${s}</option>`).join('');
      sel.className='status '+(typeof quoteStatusClass==='function'?quoteStatusClass(q.status):'');
      sel.onchange=()=>{
        q.status=sel.value;
        recalcBalance(q);
        save();
        show('quotations');
      };
    });
    const filter=document.getElementById('quoteFilter');
    if(filter){
      const cur=filter.value;
      filter.innerHTML=['Todos los estatus',...STATUSES].map(s=>`<option value="${s}" ${s===cur?'selected':''}>${s}</option>`).join('');
    }
  };
})();