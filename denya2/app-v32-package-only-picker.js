(function(){
  function packagingItems(){
    return (state.inventory||[]).filter(i=>i.active!==false && String(i.category||'').trim().toLowerCase()==='empaques e insumos');
  }
  function applyPackageFilter(root=document){
    const box=root.querySelector?.('#packageBox');
    if(!box)return;
    const allowed=packagingItems();
    box.querySelectorAll('select[data-pi]').forEach(sel=>{
      if(sel.dataset.packageFiltered==='1')return;
      const current=sel.value;
      sel.innerHTML=allowed.length
        ? allowed.map(inv=>`<option value="${esc(inv.id)}" ${inv.id===current?'selected':''}>${esc(inv.name)} · ${money(inv.cost)}/${esc(inv.unit||inv.useUnit||'pz')}</option>`).join('')
        : '<option value="">No hay empaques configurados</option>';
      sel.dataset.packageFiltered='1';
      if(allowed.length){
        const valid=allowed.some(inv=>String(inv.id)===String(current));
        if(!valid){sel.value=allowed[0].id;sel.dispatchEvent(new Event('change',{bubbles:true}));}
      }else{
        sel.disabled=true;
      }
    });
    const helper=box.previousElementSibling;
    if(!allowed.length && box && !box.querySelector('[data-no-packaging]')){
      box.insertAdjacentHTML('afterbegin','<div class="helper" data-no-packaging><b>No hay artículos de empaque disponibles.</b> Ve a Inventario y crea artículos con categoría “Empaques e insumos”.</div>');
    }
  }
  const observer=new MutationObserver(muts=>{
    let relevant=false;
    for(const m of muts){
      if(m.target?.id==='packageBox' || m.target?.closest?.('#packageBox') || [...(m.addedNodes||[])].some(n=>n.nodeType===1&&(n.id==='packageBox'||n.querySelector?.('#packageBox')))){relevant=true;break;}
    }
    if(relevant)setTimeout(()=>applyPackageFilter(document),0);
  });
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{
    if(e.target?.id==='addPackage')setTimeout(()=>applyPackageFilter(document),0);
  });
})();