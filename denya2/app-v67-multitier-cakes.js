// DENYA v67 · multi-tier cakes on the stable quotation editor (no observers)
(function(){
  const stableNewQuote=window.newQuote;
  if(typeof stableNewQuote!=='function') return;

  const kindCats={
    base:['Bases'],filling:['Rellenos'],cover:['Coberturas','Buttercream','Ganache'],
    syrup:['Jarabes'],decoration:['Decoraciones']
  };
  const kindLabels={base:'Sabor del pastel',filling:'Relleno',cover:'Cobertura',syrup:'Salsa o jarabe',decoration:'Decoración'};
  const reqsOf=m=>Array.isArray(m?.requirements)?m.requirements:(m?.components||[]).map(c=>({kind:c.kind,qty:Number(c.qty)||0}));
  const recipesFor=kind=>(state.recipes||[]).filter(r=>(kindCats[kind]||[]).includes(r.category));
  const isCakeProduct=p=>/pastel/i.test(String(p?.category||''))||/pastel/i.test(String(p?.name||''));

  function floorCost(floor){
    const m=getMeasure(floor.measureId);if(!m)return 0;
    let cost=0;
    reqsOf(m).forEach(r=>{const rec=getRecipe(floor.selections?.[r.kind]);if(rec)cost+=recipeCost(rec)*(Number(r.qty)||0)});
    (m.materials||[]).forEach(mat=>{const inv=(state.inventory||[]).find(i=>i.id===mat.inventoryId);if(inv)cost+=(Number(mat.qty)||0)*(Number(inv.cost)||0)});
    return cost;
  }
  function floorSubtotal(floor,product){
    const cost=floorCost(floor),margin=(Number(product?.margin)||50)/100;
    return margin>=1?cost:cost/(1-margin);
  }

  window.newQuote=function(editId=null){
    const result=stableNewQuote(editId);
    const modal=document.querySelector('.modal-bg:last-of-type .modal');
    const productSel=modal?.querySelector('#qproduct'),measureSel=modal?.querySelector('#qmeasure');
    if(!modal||!productSel||!measureSel)return result;

    const existing=editId?(state.quotes||[]).find(q=>q.id===editId):null;
    let extraFloors=Array.isArray(existing?.floors)?clone(existing.floors.slice(1)):[];
    let baseDisplay={};

    const productSection=productSel.closest('.quote-section');
    if(!productSection)return result;
    const builder=document.createElement('div');builder.className='v67-tier-builder';
    builder.innerHTML=`<div class="v67-tier-head"><div><h3>🎂 Pisos del pastel</h3><div class="hint">El Piso 1 es el pastel principal. Agrega otro piso solo si el diseño lo necesita.</div></div><button type="button" class="secondary" data-v67-add>+ Agregar otro piso</button></div><div class="v67-tier-list" data-v67-list></div>`;
    productSection.appendChild(builder);
    const list=builder.querySelector('[data-v67-list]'),addBtn=builder.querySelector('[data-v67-add]');

    function product(){return getProduct(productSel.value)}
    function measures(){return (state.measures||[]).filter(m=>m.productId===productSel.value)}
    function makeFloor(measureId=''){
      const ms=measures(),mid=measureId||ms[0]?.id||'';const floor={measureId:mid,selections:{}};
      const m=getMeasure(mid);reqsOf(m).forEach(r=>{const recs=recipesFor(r.kind);floor.selections[r.kind]=recs[0]?.id||''});return floor;
    }
    function yieldText(m){return m&&(m.minPeople||m.maxPeople)?`${m.minPeople||0}–${m.maxPeople||0} personas`:'Rendimiento no definido'}
    function render(){
      const cake=isCakeProduct(product());builder.style.display=cake?'block':'none';
      if(!cake){extraFloors=[];syncTotals();return}
      list.innerHTML=extraFloors.length?extraFloors.map((f,i)=>{
        const ms=measures(),m=getMeasure(f.measureId)||ms[0];if(m&&!f.measureId)f.measureId=m.id;
        const reqs=reqsOf(m);
        return `<div class="v67-tier-card" data-v67-floor="${i}"><div class="v67-tier-card-head"><strong>Piso ${i+2}</strong><button type="button" class="ghost" data-v67-remove="${i}">Eliminar piso</button></div><div class="v67-tier-grid"><label class="field">Tamaño / presentación<select data-v67-measure="${i}">${ms.map(x=>`<option value="${esc(x.id)}" ${x.id===f.measureId?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><div class="field"><span>Rendimiento</span><div class="helper" style="margin:0">${esc(yieldText(m))}</div></div></div><div class="v67-tier-options">${reqs.map(r=>{const recs=recipesFor(r.kind);if(!f.selections)f.selections={};if(!f.selections[r.kind])f.selections[r.kind]=recs[0]?.id||'';return `<label class="field">${esc(kindLabels[r.kind]||r.kind)}<select data-v67-kind="${esc(r.kind)}" data-v67-index="${i}">${recs.length?recs.map(rec=>`<option value="${esc(rec.id)}" ${rec.id===f.selections[r.kind]?'selected':''}>${esc(rec.name)}</option>`).join(''):'<option value="">Sin recetas configuradas</option>'}</select></label>`}).join('')}</div><div class="v67-tier-total"><span>Este piso:</span><strong>${money(floorSubtotal(f,product()))}</strong></div></div>`;
      }).join(''):'<div class="helper">Este pastel tiene 1 piso. Usa “Agregar otro piso” para crear un pastel de 2, 3 o más pisos.</div>';
      list.querySelectorAll('[data-v67-remove]').forEach(b=>b.onclick=()=>{extraFloors.splice(Number(b.dataset.v67Remove),1);render();syncTotals()});
      list.querySelectorAll('[data-v67-measure]').forEach(s=>s.onchange=()=>{const i=Number(s.dataset.v67Measure);extraFloors[i]=makeFloor(s.value);render();syncTotals()});
      list.querySelectorAll('[data-v67-kind]').forEach(s=>s.onchange=()=>{const i=Number(s.dataset.v67Index);extraFloors[i].selections[s.dataset.v67Kind]=s.value;render();syncTotals()});
    }
    function num(id){return Number(String(modal.querySelector(id)?.textContent||'0').replace(/[^0-9.-]/g,''))||0}
    function captureBase(){baseDisplay={cost:num('#sumCost'),subtotal:num('#sumSubtotal'),discount:num('#sumDiscount'),total:num('#sumTotal'),deposit:num('#sumDeposit'),balance:num('#sumBalance'),profit:num('#sumProfit')}}
    function syncTotals(){
      if(!baseDisplay.total)captureBase();
      const p=product();if(!isCakeProduct(p))return;
      const extraCost=extraFloors.reduce((s,f)=>s+floorCost(f),0),extraSubtotal=extraFloors.reduce((s,f)=>s+floorSubtotal(f,p),0);
      const disc=modal.querySelector('#useDiscount')?.checked?(Number(modal.querySelector('#qdiscount')?.value)||0):0;
      const extraDiscount=extraSubtotal*disc/100,extraTotal=Math.max(0,extraSubtotal-extraDiscount),dep=(Number(modal.querySelector('#qdeposit')?.value)||0)/100;
      const totals={cost:baseDisplay.cost+extraCost,subtotal:baseDisplay.subtotal+extraSubtotal,discount:baseDisplay.discount+extraDiscount,total:baseDisplay.total+extraTotal,deposit:baseDisplay.deposit+extraTotal*dep,balance:baseDisplay.balance+extraTotal*(1-dep)};totals.profit=totals.total-totals.cost;
      const map={sumCost:'cost',sumSubtotal:'subtotal',sumDiscount:'discount',sumTotal:'total',sumDeposit:'deposit',sumBalance:'balance',sumProfit:'profit'};
      Object.entries(map).forEach(([id,k])=>{const el=modal.querySelector('#'+id);if(el)el.textContent=money(totals[k])});
      modal.dataset.v67Total=String(totals.total);modal.dataset.v67Balance=String(totals.balance);modal.dataset.v67Cost=String(totals.cost);
    }

    addBtn.onclick=()=>{extraFloors.push(makeFloor());render();syncTotals()};
    productSel.addEventListener('change',()=>{extraFloors=[];setTimeout(()=>{captureBase();render();syncTotals()},0)});
    measureSel.addEventListener('change',()=>setTimeout(()=>{captureBase();syncTotals()},0));
    ['#qdeposit','#qdiscount','#useDiscount'].forEach(sel=>modal.querySelector(sel)?.addEventListener('input',()=>setTimeout(()=>{captureBase();syncTotals()},0)));
    modal.querySelector('#useDiscount')?.addEventListener('change',()=>setTimeout(()=>{captureBase();syncTotals()},0));

    const saveBtn=modal.querySelector('[data-save]');
    if(saveBtn){const old=saveBtn.onclick;saveBtn.onclick=()=>{
      captureBase();syncTotals();
      const folio=modal.querySelector('#qfolio')?.value;
      const first={measureId:measureSel.value,selections:clone(existing?.selections||{})};
      const floorData=[first,...clone(extraFloors)];
      const finalTotal=Number(modal.dataset.v67Total)||num('#sumTotal'),finalBalance=Number(modal.dataset.v67Balance)||num('#sumBalance'),finalCost=Number(modal.dataset.v67Cost)||num('#sumCost');
      old&&old();
      const q=(state.quotes||[]).find(x=>x.folio===folio);if(q&&isCakeProduct(getProduct(q.productId))){q.floors=floorData;q.total=finalTotal;q.balance=finalBalance;q.estimatedCost=finalCost;save();}
    }}

    captureBase();render();syncTotals();
    return result;
  };
})();
