// DENYA SWEETLAB v97 · reports access + product categories + cleaner header
(function(){
  function planName(){return String(state?.subscription?.plan||state?.plan||'').trim().toLowerCase()}
  function isPro(){return planName()==='pro'}
  function esc3(v){return typeof esc==='function'?esc(v??''):String(v??'')}
  function toast3(m){if(typeof toast==='function')toast(m);else alert(m)}
  const DEFAULT_CATS=['Pasteles','Postres','Cupcakes','Galletas','Eventos','Bebidas','Otro'];
  function ensureCats(){
    if(!Array.isArray(state.productCategories)||!state.productCategories.length)
      state.productCategories=DEFAULT_CATS.map((label,i)=>({id:'pc-'+i,label,locked:i<6}));
  }
  ensureCats();

  // Remove the decorative avatar with "S"; it adds no useful information.
  function cleanHeader(){
    document.querySelector('.top .avatar')?.remove();
  }

  // Reports: the active plan is read directly from the current subscription state.
  const showBase=window.show;
  window.show=function(v){
    if(v==='reports'){
      if(!isPro()){
        if(typeof setActive==='function')setActive('reports');
        if(typeof titleEl!=='undefined')titleEl.textContent='Reportes';
        if(typeof content!=='undefined')content.innerHTML='<div class="card plan-gate-card"><h2>Reportes</h2><p class="muted">Los reportes descargables están disponibles en el plan <b>Pro</b>.</p><button class="primary" onclick="show(\'profile\')">Ver mi plan</button></div>';
        return;
      }
      if(typeof setActive==='function')setActive('reports');
      if(typeof titleEl!=='undefined')titleEl.textContent='Reportes';
      if(typeof views!=='undefined'&&views.reports)views.reports();
      return;
    }
    return showBase(v);
  };

  function categoryOptions(current){
    ensureCats();
    return state.productCategories.map(c=>({value:c.id,label:c.label}));
  }
  function openCategoryManager(sourceSelect, onRefresh){
    ensureCats();
    const bg=document.createElement('div');bg.className='modal-bg';
    bg.innerHTML='<div class="modal v97-cat-modal" style="max-width:620px"><div class="modal-head"><div><h2>Categorías de producto</h2><div class="hint">Organiza tus productos por categorías. Puedes crear las que necesites.</div></div><button class="icon" data-close>×</button></div>'+
      '<div class="v97-add-cat"><input id="v97CatName" placeholder="Ej. Pasteles personalizados"><button class="primary" id="v97AddCat">+ Agregar categoría</button></div><div id="v97CatList"></div>'+
      '<div class="modal-actions"><button class="secondary" data-close>Cerrar</button></div></div>';
    document.body.appendChild(bg);
    const list=bg.querySelector('#v97CatList');
    const draw=()=>{
      list.innerHTML=state.productCategories.map(c=>'<div class="v97-cat-row"><b>'+esc3(c.label)+'</b>'+(c.locked?'<span class="v97-cat-base">Base</span>':'<button class="danger" data-rm="'+esc3(c.id)+'">Eliminar</button>')+'</div>').join('');
      list.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{
        const id=b.dataset.rm, used=(state.products||[]).some(p=>p.categoryId===id||p.category===id);
        if(used && !confirm('Esta categoría está siendo usada por uno o más productos. ¿Eliminarla de las opciones?'))return;
        state.productCategories=state.productCategories.filter(c=>c.id!==id);save();draw();if(onRefresh)onRefresh();toast3('Categoría eliminada');
      });
    };
    bg.querySelector('[data-close]').onclick=()=>bg.remove();
    bg.querySelector('#v97AddCat').onclick=()=>{
      const input=bg.querySelector('#v97CatName'),label=input.value.trim();
      if(!label)return input.focus();
      if(state.productCategories.some(c=>c.label.toLowerCase()===label.toLowerCase()))return toast3('Esa categoría ya existe');
      state.productCategories.push({id:'pc-'+Date.now(),label,locked:false});save();draw();input.value='';input.focus();if(onRefresh)onRefresh();toast3('Categoría agregada');
    };
    draw();
  }

  // Replace the product category text field with a real selector + category manager.
  const originalOpenProduct=window.openProduct;
  window.openProduct=function(id=null){
    ensureCats();
    const p=id&&typeof getProduct==='function'?getProduct(id):{name:'',category:'Otro',pricing:'recipe',margin:50,active:true,price:0,extras:[]};
    const currentId=state.productCategories.find(c=>c.id===p.categoryId)?.id ||
      state.productCategories.find(c=>c.label===p.category)?.id || state.productCategories.find(c=>c.label==='Otro')?.id;
    const catSelect='<label class="field">Categoría<div class="v97-cat-select"><select id="pcat">'+categoryOptions().map(c=>'<option value="'+esc3(c.value)+'" '+(c.value===currentId?'selected':'')+'>'+esc3(c.label)+'</option>').join('')+'</select><button type="button" class="secondary" id="manageProductCats">Gestionar</button></div></label>';
    // Let the existing modal render all product fields; temporarily intercept the old category input after it renders.
    const result=originalOpenProduct(id);
    const modalEl=document.querySelector('.modal-bg:last-of-type .modal');
    const old=modalEl?.querySelector('#pcat');
    if(!modalEl||!old)return result;
    const oldLabel=old.closest('.field');
    if(!oldLabel)return result;
    const holder=document.createElement('div');holder.innerHTML=catSelect;
    oldLabel.replaceWith(holder.firstElementChild);
    const sel=modalEl.querySelector('#pcat');
    const manage=modalEl.querySelector('#manageProductCats');
    manage.onclick=()=>openCategoryManager(sel,()=>{
      const oldVal=sel.value;sel.innerHTML=categoryOptions().map(c=>'<option value="'+esc3(c.value)+'" '+(c.value===oldVal?'selected':'')+'>'+esc3(c.label)+'</option>').join('');
    });
    // Existing save handler reads #pcat.value, so it remains compatible; store both label and id.
    const saveBtn=modalEl.querySelector('[data-save]');
    if(saveBtn){
      saveBtn.addEventListener('click',()=>{
        setTimeout(()=>{
          const latest=(state.products||[]).find(x=>x.id===id);
          if(latest){latest.categoryId=sel.value;latest.category=state.productCategories.find(c=>c.id===sel.value)?.label||latest.category;save();}
        },0);
      },{once:true});
    }
    return result;
  };

  cleanHeader();
  new MutationObserver(()=>cleanHeader()).observe(document.body,{childList:true,subtree:true});
  window.DENYAProductCategories={open:openCategoryManager};
})();