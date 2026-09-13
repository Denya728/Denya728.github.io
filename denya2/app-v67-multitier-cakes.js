// DENYA v68 · multi-tier cakes on stable quotation editor
(function(){
  const previous=window.newQuote;
  if(typeof previous!=='function') return;

  const cats={base:['Bases'],filling:['Rellenos'],cover:['Coberturas','Buttercream','Ganache'],syrup:['Jarabes'],decoration:['Decoraciones']};
  const labels={base:'Sabor del pastel',filling:'Relleno',cover:'Cobertura',syrup:'Salsa o jarabe',decoration:'Decoración'};
  const requirements=m=>Array.isArray(m?.requirements)?m.requirements:(m?.components||[]).map(c=>({kind:c.kind,qty:Number(c.qty)||0}));
  const recipes=kind=>(state.recipes||[]).filter(r=>(cats[kind]||[]).includes(r.category));
  const isCake=p=>/pastel/i.test(String(p?.name||''))||/pastel/i.test(String(p?.category||''));

  function tierCost(tier){
    const m=getMeasure(tier.measureId); if(!m) return 0;
    let cost=0;
    requirements(m).forEach(r=>{
      const rec=getRecipe(tier.selections?.[r.kind]);
      if(rec) cost+=recipeCost(rec)*(Number(r.qty)||0);
    });
    (m.materials||[]).forEach(mat=>{
      const inv=(state.inventory||[]).find(i=>i.id===mat.inventoryId);
      if(inv) cost+=(Number(mat.qty)||0)*(Number(inv.cost)||0);
    });
    return cost;
  }

  window.newQuote=function(editId=null){
    const result=previous(editId);
    const modals=[...document.querySelectorAll('.modal-bg .modal')];
    const modal=modals[modals.length-1];
    if(!modal) return result;

    const productSel=modal.querySelector('#qproduct');
    const measureSel=modal.querySelector('#qmeasure');
    const productSection=productSel?.closest('.quote-section');
    if(!productSel||!measureSel||!productSection) return result;

    const existing=editId?(state.quotes||[]).find(q=>q.id===editId):null;
    let tiers=Array.isArray(existing?.floors)?clone(existing.floors.slice(1)):[];

    const wrap=document.createElement('div');
    wrap.className='v67-tier-builder';
    wrap.innerHTML='<div class="v67-tier-head"><div><h3>🎂 Pisos del pastel</h3><div class="hint">El Piso 1 es el pastel principal. Agrega más pisos cuando el diseño lo necesite.</div></div><button type="button" class="secondary" data-add-tier>+ Agregar otro piso</button></div><div class="v67-tier-list" data-tier-list></div>';
    productSection.appendChild(wrap);

    const list=wrap.querySelector('[data-tier-list]');
    const add=wrap.querySelector('[data-add-tier]');

    function product(){return getProduct(productSel.value)}
    function availableMeasures(){return (state.measures||[]).filter(m=>m.productId===productSel.value)}
    function newTier(mid){
      const ms=availableMeasures();
      const measureId=mid||ms[0]?.id||'';
      const t={measureId,selections:{}};
      requirements(getMeasure(measureId)).forEach(r=>{t.selections[r.kind]=recipes(r.kind)[0]?.id||''});
      return t;
    }
    function priceFor(t){
      const p=product(),cost=tierCost(t),margin=(Number(p?.margin)||50)/100;
      return margin>=1?cost:cost/(1-margin);
    }
    function yieldFor(m){return m&&(m.minPeople||m.maxPeople)?`${m.minPeople||0}–${m.maxPeople||0} personas`:'Sin rendimiento definido'}

    function draw(){
      const cake=isCake(product());
      wrap.style.display=cake?'block':'none';
      if(!cake){tiers=[];return}
      if(!tiers.length){
        list.innerHTML='<div class="helper">Actualmente es un pastel de <b>1 piso</b>. Presiona “Agregar otro piso” para convertirlo en pastel de 2, 3 o más pisos.</div>';
        return;
      }
      const ms=availableMeasures();
      list.innerHTML=tiers.map((t,i)=>{
        if(!t.measureId)t.measureId=ms[0]?.id||'';
        const m=getMeasure(t.measureId);
        const reqs=requirements(m);
        if(!t.selections)t.selections={};
        return `<div class="v67-tier-card" data-tier="${i}">
          <div class="v67-tier-card-head"><strong>Piso ${i+2}</strong><button type="button" class="ghost" data-remove-tier="${i}">Eliminar piso</button></div>
          <div class="v67-tier-grid">
            <label class="field">Tamaño / presentación<select data-tier-measure="${i}">${ms.map(x=>`<option value="${esc(x.id)}" ${x.id===t.measureId?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>
            <div class="field"><span>Rendimiento</span><div class="helper" style="margin:0">${esc(yieldFor(m))}</div></div>
          </div>
          <div class="v67-tier-options">${reqs.map(r=>{
            const rs=recipes(r.kind);
            if(!t.selections[r.kind])t.selections[r.kind]=rs[0]?.id||'';
            return `<label class="field">${esc(labels[r.kind]||r.kind)}<select data-tier-kind="${esc(r.kind)}" data-tier-index="${i}">${rs.length?rs.map(rec=>`<option value="${esc(rec.id)}" ${rec.id===t.selections[r.kind]?'selected':''}>${esc(rec.name)}</option>`).join(''):'<option value="">Sin recetas configuradas</option>'}</select></label>`;
          }).join('')}</div>
          <div class="v67-tier-total"><span>Precio estimado del piso:</span><strong>${money(priceFor(t))}</strong></div>
        </div>`;
      }).join('');

      list.querySelectorAll('[data-remove-tier]').forEach(btn=>btn.onclick=()=>{tiers.splice(Number(btn.dataset.removeTier),1);draw();recalc()});
      list.querySelectorAll('[data-tier-measure]').forEach(sel=>sel.onchange=()=>{tiers[Number(sel.dataset.tierMeasure)]=newTier(sel.value);draw();recalc()});
      list.querySelectorAll('[data-tier-kind]').forEach(sel=>sel.onchange=()=>{tiers[Number(sel.dataset.tierIndex)].selections[sel.dataset.tierKind]=sel.value;draw();recalc()});
    }

    function readMoney(id){return Number(String(modal.querySelector(id)?.textContent||'0').replace(/[^0-9.-]/g,''))||0}
    let base={};
    function captureBase(){base={cost:readMoney('#sumCost'),subtotal:readMoney('#sumSubtotal'),discount:readMoney('#sumDiscount'),total:readMoney('#sumTotal'),deposit:readMoney('#sumDeposit'),balance:readMoney('#sumBalance'),profit:readMoney('#sumProfit')}}
    function recalc(){
      if(!isCake(product()))return;
      const extraCost=tiers.reduce((s,t)=>s+tierCost(t),0);
      const extraSubtotal=tiers.reduce((s,t)=>s+priceFor(t),0);
      const disc=modal.querySelector('#useDiscount')?.checked?(Number(modal.querySelector('#qdiscount')?.value)||0):0;
      const extraDiscount=extraSubtotal*disc/100;
      const extraTotal=extraSubtotal-extraDiscount;
      const dep=(Number(modal.querySelector('#qdeposit')?.value)||0)/100;
      const values={cost:base.cost+extraCost,subtotal:base.subtotal+extraSubtotal,discount:base.discount+extraDiscount,total:base.total+extraTotal,deposit:base.deposit+extraTotal*dep,balance:base.balance+extraTotal*(1-dep)};
      values.profit=values.total-values.cost;
      const ids={sumCost:'cost',sumSubtotal:'subtotal',sumDiscount:'discount',sumTotal:'total',sumDeposit:'deposit',sumBalance:'balance',sumProfit:'profit'};
      Object.entries(ids).forEach(([id,key])=>{const el=modal.querySelector('#'+id);if(el)el.textContent=money(values[key])});
      modal.dataset.tierTotal=String(values.total);
      modal.dataset.tierBalance=String(values.balance);
      modal.dataset.tierCost=String(values.cost);
    }

    add.onclick=()=>{if(!isCake(product()))return;tiers.push(newTier());draw();recalc()};
    productSel.addEventListener('change',()=>setTimeout(()=>{tiers=[];captureBase();draw();recalc()},0));
    measureSel.addEventListener('change',()=>setTimeout(()=>{captureBase();recalc()},0));

    const saveBtn=modal.querySelector('[data-save]');
    if(saveBtn){
      const oldSave=saveBtn.onclick;
      saveBtn.onclick=()=>{
        recalc();
        const folio=modal.querySelector('#qfolio')?.value;
        const finalTotal=Number(modal.dataset.tierTotal)||readMoney('#sumTotal');
        const finalBalance=Number(modal.dataset.tierBalance)||readMoney('#sumBalance');
        const finalCost=Number(modal.dataset.tierCost)||readMoney('#sumCost');
        const floorData=[{measureId:measureSel.value,selections:clone(existing?.selections||{})},...clone(tiers)];
        oldSave&&oldSave();
        const q=(state.quotes||[]).find(x=>x.folio===folio);
        if(q&&isCake(getProduct(q.productId))){q.floors=floorData;q.total=finalTotal;q.balance=finalBalance;q.estimatedCost=finalCost;save();}
      };
    }

    captureBase();
    draw();
    recalc();
    return result;
  };
})();
