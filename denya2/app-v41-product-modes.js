(function(){
  const kindMeta={
    base:{label:'Base / pan',cats:['Bases']},
    filling:{label:'Relleno',cats:['Rellenos']},
    cover:{label:'Cobertura / betún',cats:['Coberturas','Buttercream','Ganache']},
    syrup:{label:'Jarabe / salsa',cats:['Jarabes']},
    decoration:{label:'Decoración / preparación',cats:['Decoraciones']}
  };
  const typeOptions=[
    {value:'cake_single',label:'Pastel sencillo / 1 piso'},
    {value:'cake_tiered',label:'Pastel de varios pisos'},
    {value:'piece',label:'Producto por pieza (cupcakes, galletas, brownies...)'}
  ];
  function reqsOf(m){return Array.isArray(m?.requirements)?m.requirements:(m?.components||[]).map(c=>({kind:c.kind,qty:Number(c.qty)||0}))}
  function recipesFor(kind){const cats=kindMeta[kind]?.cats||[];return (state.recipes||[]).filter(r=>cats.includes(r.category))}
  function ptype(p){
    if(p?.productType)return p.productType;
    const n=String(p?.name||'').toLowerCase();
    if(/cupcake|galleta|macaron|brownie|cake ?pop|pieza/.test(n))return 'piece';
    return 'cake_single';
  }
  function quoteMode(p,m){
    const type=ptype(p);
    if(type==='piece') return 'piece';
    const unit=String(m?.saleUnit||'').toLowerCase();
    const name=String(m?.name||'').toLowerCase();
    if(['pz','unit','pack'].includes(unit)||/individual|pieza|pza|por unidad|paquete|set/.test(name)) return 'piece';
    return type;
  }
  function ensureStyle(){
    if(document.getElementById('v41modes'))return;
    const s=document.createElement('style');s.id='v41modes';s.textContent=`
      .v41-mode{padding:12px 14px;border:1px solid #eadfd4;background:#fffaf5;border-radius:14px;margin:12px 0}.v41-mode b{display:block;margin-bottom:4px}.v41-tier{border:1px solid #eadfd4;border-radius:15px;padding:14px;margin:10px 0;background:#fff}.v41-tier-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}.v41-tier-head h4{margin:0}.v41-tier-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v41-recipes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:10px}.v41-piece{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v41-summary-note{font-size:12px;color:#806e63;margin-top:5px}.v41-type-badge{display:inline-flex;padding:4px 8px;border-radius:999px;background:#f5ece4;color:#765f50;font-size:11px;font-weight:800}@media(max-width:700px){.v41-tier-grid,.v41-recipes,.v41-piece{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }
  ensureStyle();

  // PRODUCTOS: define cómo se cotiza cada producto.
  window.openProduct=function(id=null){
    const p=id?getProduct(id):{name:'',category:'Otro',pricing:'recipe',margin:50,active:true,price:0,extraIds:[],productType:'cake_single'};
    const selected=new Set(p.extraIds||[]);
    const w=modal(id?'Editar producto':'Nuevo producto',`
      <div class="form2">
        ${field('Nombre del producto','pname',p.name||'')}
        ${field('Categoría','pcat',p.category||'Otro')}
        ${selectField('Tipo de producto','ptype',typeOptions,ptype(p))}
        ${selectField('Tipo de precio','ppricing',[{value:'recipe',label:'Calculado por receta / presentación'},{value:'fixed',label:'Precio fijo'}],p.pricing||'recipe')}
        ${field('Precio fijo','pprice',p.price||0,'number','step="0.01" min="0"')}
        ${field('Margen objetivo %','pmargin',p.margin||50,'number','step="1" min="0"')}
        <label class="field">Estado<select id="pactive"><option value="1" ${p.active!==false?'selected':''}>Activo</option><option value="0" ${p.active===false?'selected':''}>Inactivo</option></select></label>
      </div>
      <div class="v41-mode"><b>Tipo de producto</b><span id="v41TypeHelp"></span></div>
      <div class="v36-sectiontitle"><div><h3>Extras aplicables</h3><div class="hint">Solo marca los extras que deben aparecer al cotizar este producto.</div></div><button class="secondary" type="button" id="v36ManageExtras">Administrar extras</button></div>
      <div class="v36-checks">${(state.extras||[]).filter(e=>e.active!==false).map(e=>`<label class="v36-check"><input type="checkbox" data-extra-id="${e.id}" ${selected.has(e.id)?'checked':''}><span><b>${esc(e.name)}</b><span class="v36-price" style="display:block">${e.mode==='fixed'?money(e.price):'Precio libre al cotizar'}</span></span></label>`).join('')||'<div class="helper">No hay extras activos.</div>'}</div>
    `,wrap=>{
      const data={id:id||'p'+Date.now(),name:wrap.querySelector('#pname').value.trim(),category:wrap.querySelector('#pcat').value.trim()||'Otro',productType:wrap.querySelector('#ptype').value,pricing:wrap.querySelector('#ppricing').value,price:Number(wrap.querySelector('#pprice').value)||0,margin:Number(wrap.querySelector('#pmargin').value)||50,active:wrap.querySelector('#pactive').value==='1',extraIds:[...wrap.querySelectorAll('[data-extra-id]:checked')].map(x=>x.dataset.extraId)};
      if(!data.name){toast('Escribe el nombre del producto');return false}
      if(id)Object.assign(p,data);else state.products.push(data);
      const ids=data.extraIds||[];data.extras=ids.map(x=>state.extras.find(e=>e.id===x)).filter(Boolean).map(e=>({id:e.id,name:e.name,mode:e.mode||'fixed',price:Number(e.price)||0,category:e.category||'General'}));
      save();show('products');toast('Producto guardado');
    });
    const pricing=w.querySelector('#ppricing'),price=w.querySelector('#pprice'),type=w.querySelector('#ptype'),help=w.querySelector('#v41TypeHelp');
    const togglePrice=()=>{price.closest('.field').style.opacity=pricing.value==='fixed'?'1':'.45';price.disabled=pricing.value!=='fixed'};
    const helpType=()=>{help.textContent=type.value==='cake_tiered'?'En la cotización podrás configurar cada piso con tamaño y sabores distintos.':type.value==='piece'?'La cotización pedirá cantidad de piezas y calculará recetas según el rendimiento de la presentación.':'Cotización tradicional de un solo tamaño.'};
    pricing.onchange=togglePrice;type.onchange=helpType;togglePrice();helpType();
    const manage=w.querySelector('#v36ManageExtras');if(manage)manage.onclick=()=>{w.remove();show('extras')};
  };

  // PRESENTACIONES: agrega rendimiento por piezas cuando aplica.
  window.openMeasure=function(id=null,productId=''){
    const m=id?getMeasure(id):{productId:productId||state.products.find(p=>p.active)?.id||'',name:'',minPeople:'',maxPeople:'',yieldPieces:12,requirements:[]};
    let requirements=clone(reqsOf(m));if(!requirements.length)requirements=[{kind:'base',qty:1}];
    const product=getProduct(m.productId),isPiece=ptype(product)==='piece';
    const w=modal(id?'Editar presentación':'Nueva presentación',`
      <div class="helper"><b>Presentación:</b> define tamaño/formato y cuánto consume. En productos por pieza también define cuántas piezas rinde una preparación.</div>
      <div class="form2">
        ${selectField('Producto','mproduct',state.products.filter(p=>p.active).map(p=>({value:p.id,label:p.name})),m.productId)}
        ${field('Nombre de la presentación','mname',m.name||'','text','placeholder="Ej. 20 cm, Cupcake estándar, Caja de 12"')}
        <div id="peopleFields" style="display:${isPiece?'none':'contents'}">${field('Personas mínimas (opcional)','mmin',m.minPeople||'','number')}${field('Personas máximas (opcional)','mmax',m.maxPeople||'','number')}</div>
        <div id="pieceField" style="display:${isPiece?'block':'none'}">${field('Piezas que rinde esta preparación','myield',m.yieldPieces||12,'number','step="1" min="1"')}</div>
      </div>
      <div class="section"><div class="page-head" style="margin:0"><div><h3>Consumo de esta presentación</h3><div class="hint">Indica cuántas recetas utiliza este tamaño o lote.</div></div><button class="secondary" id="addReq">+ Agregar consumo</button></div><div id="reqBox"></div></div>
    `,wrap=>{
      sync();const pr=getProduct(wrap.querySelector('#mproduct').value),piece=ptype(pr)==='piece';
      const data={id:id||'m'+Date.now(),productId:wrap.querySelector('#mproduct').value,name:wrap.querySelector('#mname').value.trim(),minPeople:piece?'':(Number(wrap.querySelector('#mmin')?.value)||''),maxPeople:piece?'':(Number(wrap.querySelector('#mmax')?.value)||''),yieldPieces:piece?(Number(wrap.querySelector('#myield')?.value)||1):'',requirements:requirements.filter(r=>r.kind&&Number(r.qty)>0),components:[],materials:[]};
      if(!data.name){toast('Escribe el nombre de la presentación');return false}if(!data.requirements.length){toast('Agrega al menos un consumo');return false}
      if(id)Object.assign(m,data);else state.measures.push(data);save();show('measures');toast('Presentación guardada');
    });
    function sync(){w.querySelectorAll('[data-req-row]').forEach(row=>{const i=Number(row.dataset.reqRow);requirements[i]={kind:row.querySelector('[data-rkind]').value,qty:Number(row.querySelector('[data-rqty]').value)||0}})}
    function draw(){w.querySelector('#reqBox').innerHTML=requirements.map((r,i)=>`<div class="extra-row" data-req-row="${i}" style="display:grid;grid-template-columns:1.2fr 1fr 42px;gap:8px;margin:9px 0"><select data-rkind>${Object.entries(kindMeta).map(([v,x])=>`<option value="${v}" ${v===r.kind?'selected':''}>${x.label}</option>`).join('')}</select><label class="field" style="margin:0">Cantidad de receta<input data-rqty type="number" step="0.05" min="0" value="${r.qty||0}"></label><button class="icon" data-rrm="${i}">×</button></div>`).join('');w.querySelectorAll('[data-rkind],[data-rqty]').forEach(el=>el.oninput=sync);w.querySelectorAll('[data-rrm]').forEach(b=>b.onclick=()=>{requirements.splice(Number(b.dataset.rrm),1);draw()})}
    w.querySelector('#addReq').onclick=()=>{sync();requirements.push({kind:'filling',qty:.5});draw()};
    const psel=w.querySelector('#mproduct');psel.onchange=()=>{const piece=ptype(getProduct(psel.value))==='piece';w.querySelector('#peopleFields').style.display=piece?'none':'contents';w.querySelector('#pieceField').style.display=piece?'block':'none'};draw();
  };

  const guardOrderForQuote=qid=>(state.orders||[]).find(o=>o.quoteId===qid);
  function lockedQuote(editId){const o=editId&&guardOrderForQuote(editId);return !!o&&['En producción','Listo','Entregado y pagado'].includes(o.status)}

  function recipeCostForReq(kind,recipeId,qty){const r=getRecipe(recipeId);return r?recipeCost(r)*(Number(qty)||0):0}
  function quoteMaterialCost(product,mode,measure,selections,tiers,pieceQty,packages){
    let cost=0;
    if(mode==='cake_tiered') tiers.forEach(t=>{const m=getMeasure(t.measureId);reqsOf(m).forEach(r=>cost+=recipeCostForReq(r.kind,t.selections?.[r.kind],r.qty))});
    else if(mode==='piece') {const mult=(Number(pieceQty)||0)/Math.max(1,Number(measure?.yieldPieces)||1);reqsOf(measure).forEach(r=>cost+=recipeCostForReq(r.kind,selections?.[r.kind],(Number(r.qty)||0)*mult))}
    else reqsOf(measure).forEach(r=>cost+=recipeCostForReq(r.kind,selections?.[r.kind],r.qty));
    (packages||[]).forEach(p=>{const i=state.inventory.find(x=>x.id===p.inventoryId);if(i)cost+=(Number(p.qty)||0)*(Number(i.cost)||0)});return cost;
  }

  // COTIZADOR adaptable a 1 piso, varios pisos y productos por pieza.
  window.newQuote=function(editId=null){
    if(editId&&lockedQuote(editId)){toast('Esta cotización ya está en producción. Regresa el pedido a Pendiente antes de editarla.');return}
    const existing=editId?state.quotes.find(q=>q.id===editId):null;
    let customExtras=clone(existing?.customExtras||[]),packages=clone(existing?.packages||[]),selections=clone(existing?.selections||{}),tiers=clone(existing?.tiers||[]),selectedExtraIds=clone(existing?.selectedExtraIds||[]);
    const activeProducts=state.products.filter(p=>p.active!==false),initialProduct=existing?.productId||activeProducts[0]?.id||'';
    const w=modal(existing?'Editar cotización':'Nueva cotización',`
      <div class="steps"><span class="on">Cliente</span><span>Producto</span><span>Configuración</span><span>Extras</span><span>Pedido</span><span>Precio</span></div>
      <div class="quote-section"><h3>👤 Cliente</h3><div class="form2">${field('Folio cotización','qfolio',existing?.folio||('COT-'+String(Math.floor(100000+Math.random()*899999))))}${selectField('Cliente existente','qclient',state.clients.map(c=>({value:c,label:c})),existing?.client||state.clients[0])}${field('Nombre completo (si es nuevo)','qnewclient','')}${field('Teléfono / WhatsApp','qphone',existing?.phone||'')}${field('Usuario Instagram','qig',existing?.instagram||'')}${field('Fecha del evento','qevent',existing?.event||'','date')}${field('Vendedor','qseller',existing?.seller||'')}</div></div>
      <div class="quote-section"><h3>🍰 Producto</h3><div class="form2">${selectField('Producto','qproduct',activeProducts.map(p=>({value:p.id,label:p.name})),initialProduct)}<label class="field">Estatus<select id="qstatus">${['Borrador','Aceptada','Cancelada','Entregada y pagada'].map(s=>`<option ${s===existing?.status?'selected':''}>${s}</option>`).join('')}</select></label></div><div id="qModeBadge" class="v41-mode"></div><div id="qConfigurator"></div></div>
      <div class="quote-section"><h3>📦 Empaque e insumos de esta cotización</h3><div id="packageBox"></div><button class="secondary" id="addPackage">+ Agregar empaque / insumo</button></div>
      <div class="quote-section"><h3>✨ Extras</h3><div id="qextras" class="extras-grid"></div><div class="section"><div class="page-head" style="margin:0"><div><h3>Otros extras</h3><div class="hint">Conceptos libres como flores naturales o entrega especial.</div></div><button class="secondary" id="addCustom">+ Agregar otro extra</button></div><div id="customBox"></div></div></div>
      <div class="quote-section"><label style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="useDiscount" ${Number(existing?.discountPct)>0?'checked':''}> 🎟️ <b>Aplicar cupón o descuento</b></label><div id="discountBox" class="form2" style="display:${Number(existing?.discountPct)>0?'grid':'none'};margin-top:10px">${field('Descuento %','qdiscount',existing?.discountPct||0,'number')}${field('Cupón / referencia','qcoupon',existing?.coupon||'')}</div></div>
      <div class="quote-section"><h3>🧾 Facturación</h3><label style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="qinvoice" ${existing?.invoiceRequested?'checked':''}> <b>Requiere factura · agregar IVA 16%</b></label></div>
      <div class="quote-section"><h3>📝 Detalles del pedido</h3><div class="form2">${field('Hora de entrega','qtime',existing?.time||'','time')}${field('Anticipo %','qdeposit',existing?.deposit??50,'number')}${area('Comentarios del pedido','qnotes',existing?.notes||'')}</div></div>
      <div class="quote-section"><h3>💰 Resumen de precio</h3><div class="summary-grid"><div class="sum"><span>Costo estimado</span><strong id="sumCost">$0</strong></div><div class="sum"><span>Subtotal</span><strong id="sumSubtotal">$0</strong></div><div class="sum"><span>Descuento</span><strong id="sumDiscount">$0</strong></div><div class="sum"><span>IVA</span><strong id="sumVat">$0</strong></div><div class="sum"><span>Total venta</span><strong id="sumTotal">$0</strong></div><div class="sum"><span>Anticipo</span><strong id="sumDeposit">$0</strong></div><div class="sum"><span>Restante</span><strong id="sumBalance">$0</strong></div><div class="sum"><span>Ganancia estimada</span><strong id="sumProfit">$0</strong></div></div><div id="sumDetail" class="v41-summary-note"></div></div>
    `,wrap=>{
      const r=calc(),client=wrap.querySelector('#qnewclient').value.trim()||wrap.querySelector('#qclient').value;
      if(!client){toast('Selecciona o escribe cliente');return false}
      const p=getProduct(wrap.querySelector('#qproduct').value),mode=quoteMode(p,getMeasure(r.measureId));
      if(mode==='cake_tiered'&&tiers.length<2){toast('Un pastel de varios pisos necesita al menos 2 pisos');return false}
      if(mode==='piece'&&(!r.measureId||r.pieceQuantity<=0)){toast('Configura presentación y cantidad de piezas');return false}
      const data={id:existing?.id||'q'+Date.now(),folio:wrap.querySelector('#qfolio').value.trim(),client,phone:wrap.querySelector('#qphone').value.trim(),instagram:wrap.querySelector('#qig').value.trim(),seller:wrap.querySelector('#qseller').value.trim(),event:wrap.querySelector('#qevent').value,time:wrap.querySelector('#qtime').value,notes:wrap.querySelector('#qnotes').value.trim(),status:wrap.querySelector('#qstatus').value,total:r.total,balance:r.balance,productId:p.id,productType:mode,measureId:r.measureId,deposit:Number(wrap.querySelector('#qdeposit').value)||0,versions:(existing?.versions||0)+1,selections:clone(selections),tiers:clone(tiers),pieceQuantity:r.pieceQuantity||0,packages:clone(packages),selectedExtraIds:clone(selectedExtraIds),customExtras:clone(customExtras),discountPct:r.discountPct,coupon:wrap.querySelector('#qcoupon').value.trim(),invoiceRequested:wrap.querySelector('#qinvoice').checked,vatRate:wrap.querySelector('#qinvoice').checked?0.16:0,subtotalBeforeVat:r.afterDiscount,vatAmount:r.vat};
      if(existing)Object.assign(existing,data);else state.quotes.unshift(data);if(!state.clients.includes(client))state.clients.push(client);save();show('quotations');toast('Cotización guardada');
    },existing?'Guardar cambios':'Guardar cotización');

    const psel=w.querySelector('#qproduct');
    function ensureTierDefaults(){const p=getProduct(psel.value),ms=state.measures.filter(m=>m.productId===p.id);if(!tiers.length)tiers=[{measureId:ms[0]?.id||'',selections:{}},{measureId:ms[1]?.id||ms[0]?.id||'',selections:{}}]}
    function renderConfigurator(){
      const p=getProduct(psel.value),ms=state.measures.filter(m=>m.productId===p.id),selectedForMode=existing?.measureId&&ms.some(m=>m.id===existing.measureId)?getMeasure(existing.measureId):ms[0],mode=quoteMode(p,selectedForMode),box=w.querySelector('#qConfigurator'),badge=w.querySelector('#qModeBadge');
      badge.innerHTML=`<b>${typeOptions.find(x=>x.value===mode)?.label||'Producto'}</b><span>${mode==='cake_tiered'?'Configura cada piso por separado.':mode==='piece'?'Indica cuántas piezas necesita el cliente.':'Selecciona tamaño y preparaciones.'}</span>`;
      if(mode==='cake_tiered'){
        ensureTierDefaults();
        box.innerHTML=`<div class="section"><div class="page-head" style="margin:0"><div><h3>Pisos del pastel</h3><div class="hint">Cada piso puede tener tamaño, sabor y relleno diferentes.</div></div><button class="secondary" id="addTier">+ Agregar piso</button></div><div id="tiersBox"></div></div>`;
        drawTiers();box.querySelector('#addTier').onclick=()=>{tiers.push({measureId:ms[0]?.id||'',selections:{}});drawTiers();calc()};
      }else{
        const selectedMeasure=existing?.measureId&&ms.some(m=>m.id===existing.measureId)?existing.measureId:(ms[0]?.id||'');
        box.innerHTML=`<div class="form2"><label class="field">Presentación<select id="qmeasure">${ms.map(m=>`<option value="${m.id}" ${m.id===selectedMeasure?'selected':''}>${esc(m.name)}</option>`).join('')||'<option value="">Sin presentación configurada</option>'}</select></label>${mode==='piece'?`<label class="field">Cantidad de piezas<input id="qpieces" type="number" min="1" step="1" value="${existing?.pieceQuantity||12}"></label>`:'<div id="qpeople" class="field"><span>Rendimiento</span><div class="helper" style="margin:0">—</div></div>'}</div><div id="singleRecipes"></div>`;
        const msel=box.querySelector('#qmeasure');msel.onchange=()=>{renderSingleRecipes();calc()};if(mode==='piece')box.querySelector('#qpieces').oninput=calc;renderSingleRecipes();
      }
      renderExtras();calc();
    }
    function drawTiers(){const p=getProduct(psel.value),ms=state.measures.filter(m=>m.productId===p.id),tb=w.querySelector('#tiersBox');if(!tb)return;tb.innerHTML=tiers.map((t,i)=>{const m=getMeasure(t.measureId)||ms[0],reqs=reqsOf(m);return `<div class="v41-tier" data-tier="${i}"><div class="v41-tier-head"><h4>Piso ${i+1}</h4>${tiers.length>2?`<button class="ghost" data-rm-tier="${i}">Quitar</button>`:''}</div><div class="v41-tier-grid"><label class="field">Tamaño<select data-tier-measure="${i}">${ms.map(x=>`<option value="${x.id}" ${x.id===m?.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label><div class="field"><span>Rendimiento</span><div class="helper" style="margin:0">${m&&(m.minPeople||m.maxPeople)?`${m.minPeople||0}–${m.maxPeople||0} personas`:'—'}</div></div></div><div class="v41-recipes">${reqs.map(r=>{const recs=recipesFor(r.kind),sel=t.selections?.[r.kind]||recs[0]?.id||'';t.selections=t.selections||{};if(!t.selections[r.kind])t.selections[r.kind]=sel;return `<label class="field">${esc(kindMeta[r.kind]?.label||r.kind)} · ${r.qty} receta<select data-tier-kind="${i}" data-kind="${r.kind}">${recs.map(rec=>`<option value="${rec.id}" ${rec.id===sel?'selected':''}>${esc(rec.name)}</option>`).join('')||'<option value="">Sin receta disponible</option>'}</select></label>`}).join('')}</div></div>`}).join('');tb.querySelectorAll('[data-tier-measure]').forEach(el=>el.onchange=()=>{tiers[Number(el.dataset.tierMeasure)].measureId=el.value;drawTiers();calc()});tb.querySelectorAll('[data-tier-kind]').forEach(el=>el.onchange=()=>{const t=tiers[Number(el.dataset.tierKind)];t.selections=t.selections||{};t.selections[el.dataset.kind]=el.value;calc()});tb.querySelectorAll('[data-rm-tier]').forEach(b=>b.onclick=()=>{tiers.splice(Number(b.dataset.rmTier),1);drawTiers();calc()})}
    function renderSingleRecipes(){const p=getProduct(psel.value),m=getMeasure(w.querySelector('#qmeasure')?.value),mode=quoteMode(p,m),box=w.querySelector('#singleRecipes');if(!box)return;if(!m){box.innerHTML='<div class="helper">Este producto todavía no tiene presentación configurada.</div>';return}if(mode!=='piece'&&w.querySelector('#qpeople .helper'))w.querySelector('#qpeople .helper').textContent=m.minPeople||m.maxPeople?`${m.minPeople||0}–${m.maxPeople||0} personas`:'No aplica';const reqs=reqsOf(m);box.innerHTML=`<div class="v41-recipes">${reqs.map(r=>{const recs=recipesFor(r.kind),sel=selections[r.kind]||recs[0]?.id||'';if(!selections[r.kind])selections[r.kind]=sel;return `<label class="field">${esc(kindMeta[r.kind]?.label||r.kind)} · ${r.qty} receta<select data-single-kind="${r.kind}">${recs.map(rec=>`<option value="${rec.id}" ${rec.id===sel?'selected':''}>${esc(rec.name)}</option>`).join('')||'<option value="">Sin receta disponible</option>'}</select></label>`}).join('')}</div>${mode==='piece'?`<div class="helper" style="margin-top:10px">Esta presentación rinde <b>${Number(m.yieldPieces)||1} piezas</b>. DENYA calculará automáticamente las fracciones de receta necesarias.</div>`:''}`;box.querySelectorAll('[data-single-kind]').forEach(el=>el.onchange=()=>{selections[el.dataset.singleKind]=el.value;calc()})}
    function renderPackages(){const box=w.querySelector('#packageBox');box.innerHTML=packages.length?packages.map((p,i)=>`<div class="extra-row" style="display:grid;grid-template-columns:1fr 110px 42px;gap:8px;margin:8px 0"><select data-pi="${i}">${state.inventory.filter(x=>x.active!==false&&x.category==='Empaques e insumos').map(inv=>`<option value="${inv.id}" ${inv.id===p.inventoryId?'selected':''}>${esc(inv.name)} · ${money(inv.cost)}/${esc(inv.unit||inv.useUnit||'')}</option>`).join('')}</select><input data-pq="${i}" type="number" step="0.01" min="0" value="${p.qty||1}"><button class="icon" data-prm="${i}">×</button></div>`).join(''):'<div class="helper">Sin empaques o insumos adicionales.</div>';box.querySelectorAll('[data-pi]').forEach(el=>el.onchange=()=>{packages[Number(el.dataset.pi)].inventoryId=el.value;calc()});box.querySelectorAll('[data-pq]').forEach(el=>el.oninput=()=>{packages[Number(el.dataset.pq)].qty=Number(el.value)||0;calc()});box.querySelectorAll('[data-prm]').forEach(b=>b.onclick=()=>{packages.splice(Number(b.dataset.prm),1);renderPackages();calc()})}
    function renderExtras(){const p=getProduct(psel.value),box=w.querySelector('#qextras');box.innerHTML=(p.extras||[]).length?(p.extras||[]).map(e=>`<label class="extra-card"><input type="checkbox" data-extra-id="${e.id}" ${selectedExtraIds.includes(e.id)?'checked':''}><div><b>${esc(e.name)}</b><div class="hint">${e.mode==='fixed'?money(e.price):'Precio libre'}</div></div></label>`).join(''):'<div class="helper">Este producto no tiene extras asignados.</div>';box.querySelectorAll('[data-extra-id]').forEach(ch=>ch.onchange=()=>{selectedExtraIds=[...box.querySelectorAll('[data-extra-id]:checked')].map(x=>x.dataset.extraId);calc()})}
    function renderCustom(){const box=w.querySelector('#customBox');box.innerHTML=customExtras.map((e,i)=>`<div class="extra-row" style="display:grid;grid-template-columns:1fr 120px 42px;gap:8px;margin:8px 0"><input data-cn="${i}" value="${esc(e.name||'')}"><input data-cp="${i}" type="number" step="0.01" value="${Number(e.price)||0}"><button class="icon" data-crm="${i}">×</button></div>`).join('')||'<div class="helper">Sin extras libres.</div>';box.querySelectorAll('[data-cn]').forEach(el=>el.oninput=()=>customExtras[Number(el.dataset.cn)].name=el.value);box.querySelectorAll('[data-cp]').forEach(el=>el.oninput=()=>{customExtras[Number(el.dataset.cp)].price=Number(el.value)||0;calc()});box.querySelectorAll('[data-crm]').forEach(b=>b.onclick=()=>{customExtras.splice(Number(b.dataset.crm),1);renderCustom();calc()})}
    function calc(){const p=getProduct(psel.value),measure=getMeasure(w.querySelector('#qmeasure')?.value),mode=quoteMode(p,measure),pieceQuantity=mode==='piece'?(Number(w.querySelector('#qpieces')?.value)||0):0,materialCost=quoteMaterialCost(p,mode,measure,selections,tiers,pieceQuantity,packages),stdExtras=(p.extras||[]).filter(e=>selectedExtraIds.includes(e.id)).reduce((s,e)=>s+(Number(e.price)||0),0),freeExtras=customExtras.reduce((s,e)=>s+(Number(e.price)||0),0),baseSale=p.pricing==='fixed'?(Number(p.price)||0)*(mode==='piece'?pieceQuantity:1):materialCost*(1+(Number(p.margin)||0)/100),subtotal=baseSale+stdExtras+freeExtras,discountPct=w.querySelector('#useDiscount').checked?(Number(w.querySelector('#qdiscount').value)||0):0,discount=subtotal*discountPct/100,afterDiscount=Math.max(0,subtotal-discount),vat=w.querySelector('#qinvoice').checked?afterDiscount*.16:0,total=afterDiscount+vat,depositPct=Number(w.querySelector('#qdeposit').value)||0,deposit=total*depositPct/100,balance=Math.max(0,total-deposit),profit=afterDiscount-materialCost;w.querySelector('#sumCost').textContent=money(materialCost);w.querySelector('#sumSubtotal').textContent=money(subtotal);w.querySelector('#sumDiscount').textContent=money(discount);w.querySelector('#sumVat').textContent=money(vat);w.querySelector('#sumTotal').textContent=money(total);w.querySelector('#sumDeposit').textContent=money(deposit);w.querySelector('#sumBalance').textContent=money(balance);w.querySelector('#sumProfit').textContent=money(profit);const detail=w.querySelector('#sumDetail');detail.textContent=mode==='cake_tiered'?`${tiers.length} pisos configurados`:mode==='piece'?`${pieceQuantity} piezas · rendimiento base ${Number(measure?.yieldPieces)||1} por preparación`:'1 presentación';return {materialCost,subtotal,discountPct,afterDiscount,vat,total,balance,measureId:measure?.id||(tiers[0]?.measureId||''),pieceQuantity}}
    psel.onchange=()=>{selections={};tiers=[];selectedExtraIds=[];renderConfigurator();renderPackages();renderCustom()};
    w.querySelector('#addPackage').onclick=()=>{const inv=state.inventory.find(x=>x.active!==false&&x.category==='Empaques e insumos');if(inv)packages.push({inventoryId:inv.id,qty:1});else toast('Primero agrega un artículo de Empaques e insumos al inventario');renderPackages();calc()};
    w.querySelector('#addCustom').onclick=()=>{customExtras.push({name:'',price:0});renderCustom()};
    w.querySelector('#useDiscount').onchange=()=>{w.querySelector('#discountBox').style.display=w.querySelector('#useDiscount').checked?'grid':'none';calc()};
    ['qdiscount','qdeposit'].forEach(id=>{const el=w.querySelector('#'+id);if(el)el.oninput=calc});w.querySelector('#qinvoice').onchange=calc;
    renderConfigurator();renderPackages();renderCustom();calc();
  };

  // Materiales correctos para pisos múltiples y productos por pieza.
  function addMat(map,item,qty){if(!item||!qty)return;const cur=map.get(item.id)||{inventoryId:item.id,name:item.name,unit:item.useUnit||item.unit||'',qty:0,cost:Number(item.cost)||0};cur.qty+=(Number(qty)||0);map.set(item.id,cur)}
  function explodeRecipe(recipe,mult,map,stack=[]){if(!recipe||stack.includes(recipe.id))return;(recipe.components||[]).forEach(c=>{if(c.type==='recipe')explodeRecipe(getRecipe(c.refId),(Number(c.qty)||0)*mult,map,[...stack,recipe.id]);else addMat(map,state.inventory.find(i=>i.id===c.refId),(Number(c.qty)||0)*mult)})}
  function materialsForQuote(q){const p=getProduct(q?.productId),mode=q?.productType||ptype(p),map=new Map();if(!q)return[];const consume=(m,sels,mult=1)=>reqsOf(m).forEach(r=>{const rec=getRecipe(sels?.[r.kind]);if(rec)explodeRecipe(rec,(Number(r.qty)||0)*mult,map)});if(mode==='cake_tiered'&&Array.isArray(q.tiers)&&q.tiers.length)q.tiers.forEach(t=>consume(getMeasure(t.measureId),t.selections,1));else if(mode==='piece'){const m=getMeasure(q.measureId),mult=(Number(q.pieceQuantity)||0)/Math.max(1,Number(m?.yieldPieces)||1);consume(m,q.selections,mult)}else consume(getMeasure(q.measureId),q.selections,1);(q.packages||[]).forEach(pk=>addMat(map,state.inventory.find(i=>i.id===pk.inventoryId),Number(pk.qty)||0));return [...map.values()].map(x=>{const stock=Number(state.inventory.find(i=>i.id===x.inventoryId)?.stock)||0;return {...x,need:x.qty,stock,shortage:Math.max(0,x.qty-stock),lineCost:x.qty*x.cost}})}
  window.denyaMaterialsV41=materialsForQuote;
  window.showMaterialsV41=function(orderId){const o=(state.orders||[]).find(x=>x.id===orderId),q=(state.quotes||[]).find(x=>x.id===o?.quoteId),mats=materialsForQuote(q),cost=mats.reduce((s,x)=>s+x.lineCost,0);modal('Lista de materiales',`<div class="helper"><b>${esc(q?.folio||'')}</b> · ${esc(q?.client||'')}</div><div class="section"><div class="material-row material-head"><span>Material</span><span>Necesario</span><span>Stock</span><span>Faltante</span><span>Costo</span></div>${mats.map(x=>`<div class="material-row"><b>${esc(x.name)}</b><span>${x.need.toFixed(2)} ${esc(x.unit)}</span><span>${x.stock.toFixed(2)} ${esc(x.unit)}</span><span class="${x.shortage>0?'shortage':'enough'}">${x.shortage>0?x.shortage.toFixed(2)+' '+esc(x.unit):'Completo'}</span><span>${money(x.lineCost)}</span></div>`).join('')||'<div class="empty">No hay materiales calculables.</div>'}</div><div class="right"><span class="muted">Costo estimado</span><div style="font-size:28px;font-weight:900">${money(cost)}</div></div>`,null,'',true)};

  const baseOrderAction=window.orderAction;
  window.orderAction=function(id,act){const o=(state.orders||[]).find(x=>x.id===id),q=(state.quotes||[]).find(x=>x.id===o?.quoteId),complex=q&&['cake_tiered','piece'].includes(q.productType||ptype(getProduct(q.productId)));if(complex&&act==='materials'){showMaterialsV41(id);return}if(complex&&act==='start'){const mats=materialsForQuote(q),missing=mats.filter(x=>x.shortage>0);if(missing.length){toast('No hay inventario suficiente para iniciar producción');return}mats.forEach(x=>{const inv=state.inventory.find(i=>i.id===x.inventoryId);if(!inv)return;inv.stock=(Number(inv.stock)||0)-x.qty;inv.movements=inv.movements||[];inv.movements.unshift({date:new Date().toLocaleString('es-MX'),type:'Salida producción',qty:-x.qty,balance:inv.stock,note:'Pedido '+(q.folio||'')})});o.inventoryApplied=true;o.inventoryAppliedAt=new Date().toISOString();o.inventorySnapshot=mats.map(x=>({inventoryId:x.inventoryId,qty:x.qty}));o.status='En producción';o.startedAt=new Date().toISOString();save();show('orders');toast('Producción iniciada e inventario actualizado');return}return baseOrderAction&&baseOrderAction(id,act)};

  const baseProduction=views.production;
  views.production=function(){
    titleEl.textContent='Producción';const orders=(state.orders||[]).filter(o=>['Pendiente','En producción','Listo'].includes(o.status));
    content.innerHTML=pageHead('Producción','Qué preparar por pedido, incluyendo pisos múltiples y productos por pieza.',`<button class="secondary" onclick="show('orders')">Ver pedidos</button>`)+`<div class="grid2">${orders.map(o=>{const q=(state.quotes||[]).find(x=>x.id===o.quoteId),p=getProduct(q?.productId),mode=q?.productType||ptype(p),desc=mode==='cake_tiered'?`${(q.tiers||[]).length} pisos`:mode==='piece'?`${Number(q.pieceQuantity)||0} piezas`:(getMeasure(q?.measureId)?.name||'');const mats=materialsForQuote(q),missing=mats.filter(x=>x.shortage>0).length;return `<div class="card"><div class="order-head"><div><h3 style="margin:0">${esc(q?.folio||'')} · ${esc(p?.name||'')}</h3><div class="muted">${esc(q?.client||'')} · ${esc(q?.event||'')} · ${esc(desc)}</div></div><span class="order-status ${o.status==='En producción'?'production':o.status==='Listo'?'ready':'pending'}">${esc(o.status)}</span></div><div class="usage"><span>${missing?missing+' faltante(s)':'Material completo'}</span><span>${mats.length} materiales</span></div><div class="ops-actions" style="margin-top:14px"><button class="secondary" onclick="showMaterialsV41('${o.id}')">Lista de materiales</button>${o.status==='Pendiente'?`<button class="primary" onclick="orderAction('${o.id}','start');show('production')">Producir</button>`:''}${o.status==='En producción'?`<button class="primary" onclick="orderAction('${o.id}','ready');show('production')">Listo</button><button class="ghost" onclick="orderAction('${o.id}','pending');show('production')">Regresar a pendiente</button>`:''}${o.status==='Listo'?`<button class="ghost" onclick="orderAction('${o.id}','pending');show('production')">Regresar a pendiente</button>`:''}</div></div>`}).join('')||'<div class="card empty">No hay pedidos activos para producción.</div>'}</div>`;
  };
})();