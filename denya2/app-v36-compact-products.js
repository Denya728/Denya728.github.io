(function(){
  function syncProductExtrasV36(p){
    if(!Array.isArray(state.extras))state.extras=[];
    const ids=Array.isArray(p.extraIds)?p.extraIds:[];
    p.extras=ids.map(id=>state.extras.find(x=>x.id===id)).filter(x=>x&&x.active!==false).map(x=>({id:x.id,name:x.name,mode:x.mode||'fixed',price:Number(x.price)||0,category:x.category||'General'}));
  }
  function ensureStyle(){
    if(document.getElementById('v36products'))return;
    const s=document.createElement('style');s.id='v36products';s.textContent=`
      .v36-toolbar{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:10px;margin:14px 0 12px}.v36-toolbar input,.v36-toolbar select{width:100%;border:1px solid #ded3ca;border-radius:12px;padding:11px 12px;background:#fff}.v36-tablewrap{background:#fff;border:1px solid #eadfd4;border-radius:16px;overflow:auto}.v36-table{width:100%;border-collapse:collapse;min-width:980px}.v36-table th{font-size:11px;text-transform:uppercase;letter-spacing:.7px;color:#8d765f;background:#fbf8f4;text-align:left;padding:12px;border-bottom:1px solid #eadfd4}.v36-table td{padding:13px 12px;border-bottom:1px solid #f0e8df;vertical-align:middle}.v36-table tr:last-child td{border-bottom:0}.v36-prodname{font-weight:800}.v36-sub{font-size:12px;color:#8b776c;margin-top:3px}.v36-actions{display:flex;gap:7px;flex-wrap:wrap}.v36-actions button{padding:8px 10px;font-size:12px;border-radius:10px}.v36-more{position:relative}.v36-kebab{min-width:38px}.v36-empty{padding:28px;text-align:center;color:#8b776c}.v36-checks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:10px}.v36-check{display:flex;gap:9px;align-items:flex-start;border:1px solid #eadfd4;border-radius:12px;padding:10px;background:#fff}.v36-check input{margin-top:3px}.v36-price{font-size:12px;color:#7e6c62}.v36-sectiontitle{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:16px}.v36-sectiontitle h3{margin:0}.v36-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}.v36-summary .card{padding:12px 14px}.v36-summary strong{font-size:22px}.v36-more-actions{display:grid;gap:10px}.v36-more-actions button{width:100%;justify-content:center}@media(max-width:850px){.v36-toolbar{grid-template-columns:1fr 1fr}.v36-checks{grid-template-columns:1fr}.v36-summary{grid-template-columns:1fr 1fr}}@media(max-width:560px){.v36-toolbar{grid-template-columns:1fr}.v36-summary{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }
  window.openProduct=function(id=null){
    const p=id?getProduct(id):{name:'',category:'Otro',pricing:'recipe',margin:50,active:true,price:0,extraIds:[]};
    const selected=new Set(p.extraIds||[]);
    const w=modal(id?'Editar producto':'Nuevo producto',`
      <div class="form2">
        ${field('Nombre del producto','pname',p.name||'')}
        ${field('Categoría','pcat',p.category||'Otro')}
        ${selectField('Tipo de precio','ppricing',[{value:'recipe',label:'Calculado por receta / presentación'},{value:'fixed',label:'Precio fijo'}],p.pricing||'recipe')}
        ${field('Precio fijo','pprice',p.price||0,'number','step="0.01" min="0"')}
        ${field('Margen objetivo %','pmargin',p.margin||50,'number','step="1" min="0"')}
        <label class="field">Estado<select id="pactive"><option value="1" ${p.active!==false?'selected':''}>Activo</option><option value="0" ${p.active===false?'selected':''}>Inactivo</option></select></label>
      </div>
      <div class="v36-sectiontitle"><div><h3>Extras aplicables</h3><div class="hint">Solo marca los extras que deben aparecer al cotizar este producto.</div></div><button class="secondary" type="button" id="v36ManageExtras">Administrar extras</button></div>
      <div class="v36-checks">${(state.extras||[]).filter(e=>e.active!==false).map(e=>`<label class="v36-check"><input type="checkbox" data-extra-id="${e.id}" ${selected.has(e.id)?'checked':''}><span><b>${esc(e.name)}</b><span class="v36-price" style="display:block">${e.mode==='fixed'?money(e.price):'Precio libre al cotizar'}</span></span></label>`).join('')||'<div class="helper">No hay extras activos. Puedes crearlos desde el módulo Extras.</div>'}</div>
    `,wrap=>{
      const data={id:id||'p'+Date.now(),name:wrap.querySelector('#pname').value.trim(),category:wrap.querySelector('#pcat').value.trim()||'Otro',pricing:wrap.querySelector('#ppricing').value,price:Number(wrap.querySelector('#pprice').value)||0,margin:Number(wrap.querySelector('#pmargin').value)||50,active:wrap.querySelector('#pactive').value==='1',extraIds:[...wrap.querySelectorAll('[data-extra-id]:checked')].map(x=>x.dataset.extraId)};
      if(!data.name){toast('Escribe el nombre del producto');return false}
      if(id)Object.assign(p,data);else state.products.push(data);
      syncProductExtrasV36(id?p:data);save();show('products');toast('Producto guardado');
    });
    const pricing=w.querySelector('#ppricing'),price=w.querySelector('#pprice');
    const togglePrice=()=>{price.closest('.field').style.opacity=pricing.value==='fixed'?'1':'.45';price.disabled=pricing.value!=='fixed'};pricing.onchange=togglePrice;togglePrice();
    const manage=w.querySelector('#v36ManageExtras');if(manage)manage.onclick=()=>{w.remove();show('extras')};
  };
  window.productMoreV36=function(id){
    const p=getProduct(id);if(!p)return;
    modal('Más acciones · '+esc(p.name),`<div class="v36-more-actions"><button class="secondary" type="button" onclick="document.querySelector('.modal-bg')?.remove();productToPresentation('${p.id}')">Administrar presentaciones</button><button class="secondary" type="button" onclick="document.querySelector('.modal-bg')?.remove();openProduct('${p.id}')">Editar producto</button><button class="${p.active!==false?'danger':'secondary'}" type="button" onclick="document.querySelector('.modal-bg')?.remove();toggleProductV36('${p.id}')">${p.active!==false?'Desactivar producto':'Reactivar producto'}</button><button class="danger" type="button" onclick="document.querySelector('.modal-bg')?.remove();deleteProduct('${p.id}')">Eliminar definitivamente</button></div>`,null,'',false);
  };
  window.toggleProductV36=function(id){const p=getProduct(id);if(!p)return;p.active=!p.active;save();show('products');toast(p.active?'Producto reactivado':'Producto desactivado')};
  views.products=function(){
    ensureStyle();titleEl.textContent='Productos';
    const categories=[...new Set((state.products||[]).map(p=>p.category||'Otro'))].sort();
    const readyCount=(state.products||[]).filter(p=>configurationStatus(p)[1]==='ok').length;
    const incomplete=(state.products||[]).filter(p=>configurationStatus(p)[1]!=='ok'&&p.active!==false).length;
    content.innerHTML=pageHead('Productos','Administra tu catálogo sin mezclar configuraciones. Las presentaciones se gestionan aparte.',`<button class="primary" onclick="openProduct()">+ Agregar producto</button>`)+`
      <div class="v36-summary"><div class="card"><div class="muted">Productos</div><strong>${state.products.length}</strong></div><div class="card"><div class="muted">Listos para cotizar</div><strong>${readyCount}</strong></div><div class="card"><div class="muted">Incompletos</div><strong>${incomplete}</strong></div></div>
      <div class="v36-toolbar"><input id="v36search" placeholder="Buscar producto"><select id="v36cat"><option value="">Todas las categorías</option>${categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select><select id="v36ready"><option value="">Todos</option><option value="ready">Listos para cotizar</option><option value="incomplete">Incompletos</option></select><select id="v36status"><option value="active">Activos</option><option value="inactive">Inactivos</option><option value="all">Todos</option></select></div>
      <div class="v36-tablewrap"><table class="v36-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Presentaciones</th><th>Extras</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${state.products.map(p=>{const st=configurationStatus(p),measures=state.measures.filter(m=>m.productId===p.id).length,extras=(p.extraIds||[]).length;const price=p.pricing==='fixed'?money(p.price||0):`Por receta · ${Number(p.margin)||0}% margen`;return `<tr data-v36-row data-search="${esc((p.name+' '+(p.category||'')).toLowerCase())}" data-cat="${esc(p.category||'Otro')}" data-ready="${st[1]==='ok'?'ready':'incomplete'}" data-active="${p.active!==false?'1':'0'}"><td><div class="v36-prodname">${esc(p.name)}</div><div class="v36-sub">${p.pricing==='fixed'?'Precio fijo':'Calculado por recetas'}</div></td><td>${esc(p.category||'Otro')}</td><td>${price}</td><td><b>${measures}</b></td><td><b>${extras}</b></td><td><span class="badge ${st[1]}">${esc(st[0])}</span></td><td><div class="v36-actions"><button class="secondary" onclick="openProduct('${p.id}')">Editar</button><button class="secondary" onclick="productToPresentation('${p.id}')">Presentaciones</button><button class="ghost v36-kebab" onclick="productMoreV36('${p.id}')">Más</button></div></td></tr>`}).join('')||'<tr><td colspan="7"><div class="v36-empty">Aún no hay productos.</div></td></tr>'}</tbody></table></div>`;
    const search=document.getElementById('v36search'),cat=document.getElementById('v36cat'),ready=document.getElementById('v36ready'),status=document.getElementById('v36status');
    function filter(){const q=search.value.toLowerCase(),c=cat.value,r=ready.value,s=status.value;document.querySelectorAll('[data-v36-row]').forEach(row=>{const okQ=row.dataset.search.includes(q),okC=!c||row.dataset.cat===c,okR=!r||row.dataset.ready===r,okS=s==='all'||(s==='active'&&row.dataset.active==='1')||(s==='inactive'&&row.dataset.active==='0');row.style.display=okQ&&okC&&okR&&okS?'':'none'})}
    search.oninput=filter;cat.onchange=filter;ready.onchange=filter;status.onchange=filter;
  };
})();