(function(){
  const baseInventory=views.inventory;
  const basePurchases=views.purchases;
  const basePlan=views.plan;
  const baseShow=window.show;
  let stockTab='inventory';

  function currentPlan(){return (state.subscription&&state.subscription.plan)||state.plan||'Negocio'}
  function hasStockAccess(){return currentPlan()==='Negocio'||currentPlan()==='Pro'}

  function stockGate(){
    titleEl.textContent='Inventario y compras';
    content.innerHTML=`<div class="card plan-gate-card"><div class="lock">🔒</div><h2>Inventario y compras</h2><p class="muted">Tu plan <b>${esc(currentPlan())}</b> no incluye control de inventario ni compras.</p><p>Disponible desde el plan <b>Negocio</b>.</p><button class="primary" onclick="show('plan')">Ver planes</button></div>`;
  }

  function addTabs(){
    const head=content.querySelector('.page-head');
    const tabs=`<div class="stock-tabs"><button class="${stockTab==='inventory'?'active':''}" onclick="openStockTab('inventory')">Inventario</button><button class="${stockTab==='purchases'?'active':''}" onclick="openStockTab('purchases')">Compras</button></div>`;
    if(head) head.insertAdjacentHTML('afterend',tabs); else content.insertAdjacentHTML('afterbegin',tabs);
  }

  window.openStockTab=function(tab){stockTab=tab==='purchases'?'purchases':'inventory';window.show('inventory')};

  views.inventory=function(){
    if(!hasStockAccess()){stockGate();return}
    if(stockTab==='purchases') basePurchases(); else baseInventory();
    titleEl.textContent='Inventario y compras';
    const h=content.querySelector('.page-head h1');
    if(h) h.textContent=stockTab==='purchases'?'Compras':'Inventario';
    addTabs();
  };

  views.purchases=function(){stockTab='purchases';views.inventory()};

  window.show=function(v){
    if(v==='purchases'){stockTab='purchases';v='inventory'}
    if(v==='inventory'&&!hasStockAccess()){
      setActive('inventory');stockGate();return;
    }
    baseShow(v);
  };

  views.plan=function(){
    if(basePlan) basePlan();
    const tables=content.querySelectorAll('table');
    tables.forEach(table=>{
      [...table.querySelectorAll('tbody tr')].forEach(tr=>{
        const cells=tr.querySelectorAll('td');
        if(cells[0]&&cells[0].textContent.trim()==='Inventario'&&cells[1]) cells[1].textContent='—';
      });
    });
    [...content.querySelectorAll('.card')].forEach(card=>{
      const h=card.querySelector('h2');
      if(h&&h.textContent.trim()==='Emprende'){
        const usage=card.querySelector('.usage');
        if(usage&&!/Inventario/.test(usage.textContent)) usage.insertAdjacentHTML('beforeend','<span>— Inventario y compras</span>');
      }
    });
  };
})();