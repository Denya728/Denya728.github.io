// DENYA v69 · polish Piso 1 + persist complete quotation fields without observers
(function(){
  const previous=window.newQuote;
  if(typeof previous!=='function') return;

  const isCake=p=>/pastel/i.test(String(p?.name||''))||/pastel/i.test(String(p?.category||''));

  window.newQuote=function(editId=null){
    const result=previous(editId);
    const modals=[...document.querySelectorAll('.modal-bg .modal')];
    const modal=modals[modals.length-1];
    if(!modal) return result;

    const existing=editId?(state.quotes||[]).find(q=>q.id===editId):null;
    const productSel=modal.querySelector('#qproduct');
    const measureSel=modal.querySelector('#qmeasure');
    const people=modal.querySelector('#qpeople');
    const dynamic=modal.querySelector('#dynamicComponents');
    const productSection=productSel?.closest('.quote-section');

    // Restore persisted non-core fields when editing.
    const setVal=(id,val)=>{const el=modal.querySelector(id); if(el && val!=null) el.value=val};
    setVal('#qphone',existing?.phone||'');
    setVal('#qig',existing?.instagram||'');
    setVal('#qseller',existing?.seller||'Denilson Ochoa');
    setVal('#qtime',existing?.deliveryTime||'');
    setVal('#qnotes',existing?.notes||'');
    setVal('#qdiscount',existing?.discountPercent||0);
    setVal('#qcoupon',existing?.coupon||'');

    const discountToggle=modal.querySelector('#useDiscount');
    const discountBox=modal.querySelector('#discountBox');
    if(discountToggle){
      discountToggle.checked=!!(existing?.discountPercent||existing?.coupon);
      if(discountBox) discountBox.style.display=discountToggle.checked?'grid':'none';
      discountToggle.dispatchEvent(new Event('change',{bubbles:false}));
    }

    // Make Piso 1 visually match additional tiers, without changing base calculation logic.
    let floorOneCard=null;
    function styleFloorOne(){
      if(!productSection||!measureSel||!people||!dynamic||!isCake(getProduct(productSel?.value))) {
        if(floorOneCard) floorOneCard.style.display='none';
        return;
      }
      if(!floorOneCard){
        floorOneCard=document.createElement('div');
        floorOneCard.className='v69-floor-one-card v67-tier-card';
        floorOneCard.innerHTML='<div class="v67-tier-card-head"><strong>Piso 1</strong><span class="v69-main-badge">Principal</span></div><div class="v69-floor-one-grid"></div><div class="v69-floor-one-options"></div>';

        const builder=productSection.querySelector('.v67-tier-builder');
        productSection.insertBefore(floorOneCard,builder||null);

        const grid=floorOneCard.querySelector('.v69-floor-one-grid');
        const opts=floorOneCard.querySelector('.v69-floor-one-options');
        const measureField=measureSel.closest('.field');
        const peopleField=people.closest('.field')||people;
        if(measureField) grid.appendChild(measureField);
        if(peopleField) grid.appendChild(peopleField);
        opts.appendChild(dynamic);
      }
      floorOneCard.style.display='block';
    }

    styleFloorOne();
    productSel?.addEventListener('change',()=>setTimeout(styleFloorOne,0));

    // Persist all fields after the existing save chain completes.
    const saveBtn=modal.querySelector('[data-save]');
    if(saveBtn){
      const oldSave=saveBtn.onclick;
      saveBtn.onclick=()=>{
        const folio=modal.querySelector('#qfolio')?.value;
        const snapshot={
          phone:modal.querySelector('#qphone')?.value?.trim()||'',
          instagram:modal.querySelector('#qig')?.value?.trim()||'',
          seller:modal.querySelector('#qseller')?.value?.trim()||'',
          deliveryTime:modal.querySelector('#qtime')?.value||'',
          notes:modal.querySelector('#qnotes')?.value?.trim()||'',
          discountPercent:discountToggle?.checked?(Number(modal.querySelector('#qdiscount')?.value)||0):0,
          coupon:discountToggle?.checked?(modal.querySelector('#qcoupon')?.value?.trim()||''):'',
          referenceImageName:modal.querySelector('#qimage')?.files?.[0]?.name||existing?.referenceImageName||''
        };
        oldSave&&oldSave();
        const q=(state.quotes||[]).find(x=>x.folio===folio);
        if(q){
          Object.assign(q,snapshot);
          // Ensure Piso 1 keeps the currently saved selections and measure.
          if(isCake(getProduct(q.productId))){
            if(!Array.isArray(q.floors)||!q.floors.length) q.floors=[{}];
            q.floors[0]={measureId:q.measureId,selections:clone(q.selections||{})};
          }
          save();
        }
      };
    }

    return result;
  };
})();
