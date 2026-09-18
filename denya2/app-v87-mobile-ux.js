(function(){
  const escV=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const moneyV=v=>typeof money==='function'?money(Number(v)||0):'$'+(Number(v)||0).toFixed(2);

  let currentView=document.querySelector('.nav button.active')?.dataset?.view||'home';
  const viewHistory=[];
  let goingBack=false;
  const baseShow=window.show;
  if(typeof baseShow==='function'){
    window.show=function(v){
      const target=v||'home';
      if(!goingBack&&target!==currentView){
        viewHistory.push(currentView);
        if(viewHistory.length>30)viewHistory.shift();
      }
      currentView=target;
      const out=baseShow(target);
      updateBackButton();
      return out;
    };
  }

  function ensureBackButton(){
    const top=document.querySelector('.top');
    const left=top?.querySelector(':scope > div:first-child');
    if(!top||!left||document.getElementById('v87BackButton'))return;
    left.classList.add('v87-top-left');
    const small=left.querySelector('small'),h2=left.querySelector('h2');
    const text=document.createElement('div');
    text.className='v87-heading-text';
    if(small)text.appendChild(small);
    if(h2)text.appendChild(h2);
    const btn=document.createElement('button');
    btn.id='v87BackButton';
    btn.className='v87-back-button';
    btn.type='button';
    btn.innerHTML='<span aria-hidden="true">←</span><span>Atrás</span>';
    btn.onclick=window.goBackV87;
    left.appendChild(btn);
    left.appendChild(text);
    updateBackButton();
  }

  window.goBackV87=function(){
    let target=viewHistory.pop();
    while(target===currentView&&viewHistory.length)target=viewHistory.pop();
    if(!target)target='home';
    goingBack=true;
    currentView=target;
    try{window.show(target)}finally{goingBack=false;updateBackButton()}
  };

  function updateBackButton(){
    const btn=document.getElementById('v87BackButton');
    if(btn)btn.hidden=currentView==='home'&&viewHistory.length===0;
  }

  function enhanceInventoryMobile(){
    const table=content?.querySelector?.('.inventory-table');
    if(!table||content.querySelector('.v87-inventory-mobile'))return;
    const wrap=document.createElement('div');
    wrap.className='v87-inventory-mobile';
    wrap.innerHTML=`
      <div class="v87-mobile-inventory-help">
        <div><b>Inventario rápido</b><span>En celular mostramos primero existencias y acciones importantes.</span></div>
        <button class="primary" type="button" onclick="openInventoryItem()">+ Artículo</button>
      </div>
      <div class="v87-inventory-cards">
        ${(state.inventory||[]).map(i=>{
          const low=Number(i.stock)<=Number(i.stockMin||0);
          const unit=i.useUnit||i.unit||'';
          const activeItem=i.active!==false;
          const search=(i.name+' '+(i.supplier||'')+' '+(i.brand||'')).toLowerCase();
          return `<article class="v87-inventory-card" data-v87-inv-card data-active="${activeItem?'1':'0'}" data-low="${low?'1':'0'}" data-cat="${escV(i.category||'')}" data-search="${escV(search)}">
            <div class="v87-inventory-card-head">
              <div><h3>${escV(i.name)}</h3><div class="v87-card-meta">${escV(i.category||'Sin categoría')} · ${escV(i.brand||'General')}</div></div>
              <span class="v87-stock-state ${low?'low':'ok'}">${activeItem?(low?'Stock bajo':'Disponible'):'Dado de baja'}</span>
            </div>
            <div class="v87-stock-main"><span>Existencia</span><strong>${Number(i.stock||0).toFixed(2)} ${escV(unit)}</strong><small>Mínimo: ${Number(i.stockMin||0).toFixed(2)} ${escV(unit)}</small></div>
            <div class="v87-inventory-info">
              <div><small>Costo de compra</small><b>${moneyV(i.purchaseCost||0)} / ${escV(i.purchaseUnit||i.unit||'')}</b></div>
              <div><small>Costo por ${escV(unit||'unidad')}</small><b>${moneyV(i.cost||0)}</b></div>
              <div class="full"><small>Proveedor</small><b>${escV(i.supplier||'Sin proveedor')}</b></div>
            </div>
            <div class="v87-inventory-primary-actions">
              <button class="primary" type="button" onclick="adjustInventory('${i.id}')">Ajustar stock</button>
              <button class="secondary" type="button" onclick="openInventoryItem('${i.id}')">Editar</button>
              <button class="ghost" type="button" onclick="inventoryMovements('${i.id}')">Movimientos</button>
            </div>
            <details class="v87-more-actions"><summary>Más opciones</summary><div>
              <button class="${activeItem?'danger':'secondary'}" type="button" onclick="toggleInventory('${i.id}')">${activeItem?'Dar de baja':'Reactivar'}</button>
              <button class="danger" type="button" onclick="deleteInventory('${i.id}')">Eliminar</button>
            </div></details>
          </article>`;
        }).join('')||'<div class="empty">No hay artículos todavía.</div>'}
      </div>`;
    table.closest('.table-wrap')?.insertAdjacentElement('afterend',wrap);

    const search=document.getElementById('invSearch');
    const cat=document.getElementById('invCategory');
    const status=document.getElementById('invStatus');
    const filterCards=()=>{
      const q=(search?.value||'').toLowerCase(),c=cat?.value||'',s=status?.value||'active';
      content.querySelectorAll('[data-v87-inv-card]').forEach(card=>{
        const okQ=(card.dataset.search||'').includes(q);
        const okC=!c||card.dataset.cat===c;
        const okS=s==='all'||(s==='active'&&card.dataset.active==='1')||(s==='inactive'&&card.dataset.active==='0')||(s==='low'&&card.dataset.active==='1'&&card.dataset.low==='1');
        card.style.display=okQ&&okC&&okS?'':'none';
      });
    };
    if(search){const old=search.oninput;search.oninput=e=>{if(typeof old==='function')old.call(search,e);filterCards()}}
    if(cat){const old=cat.onchange;cat.onchange=e=>{if(typeof old==='function')old.call(cat,e);filterCards()}}
    if(status){const old=status.onchange;status.onchange=e=>{if(typeof old==='function')old.call(status,e);filterCards()}}
    filterCards();
  }

  const baseInventory=views.inventory;
  if(typeof baseInventory==='function'){
    views.inventory=function(){
      const out=baseInventory();
      enhanceInventoryMobile();
      return out;
    };
  }

  const baseRenderProfile=window.renderProfile;
  if(typeof baseRenderProfile==='function'){
    window.renderProfile=function(tab='company'){
      const out=baseRenderProfile(tab);
      const tabs=content?.querySelector?.('.profile-tabs');
      if(tabs&&!content.querySelector('.v87-profile-session')){
        tabs.insertAdjacentHTML('afterend','<div class="v87-profile-session"><div><b>Cuenta DENYA</b><span>Administra tu sesión desde tu perfil.</span></div><button class="danger" type="button" onclick="DENYAGateway&&DENYAGateway.logout&&DENYAGateway.logout()">Cerrar sesión</button></div>');
      }
      currentView='profile';
      updateBackButton();
      return out;
    };
    views.profile=()=>window.renderProfile('company');
  }

  function boot(){
    ensureBackButton();
    updateBackButton();
    if(currentView==='inventory')enhanceInventoryMobile();
  }
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',boot);
  else boot();
})();