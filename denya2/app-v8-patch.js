(function(){
  const kindMeta={
    base:{label:'Base / pan',cats:['Bases']},
    filling:{label:'Relleno',cats:['Rellenos']},
    cover:{label:'Cobertura / betún',cats:['Coberturas','Buttercream','Ganache']},
    syrup:{label:'Jarabe / salsa',cats:['Jarabes']},
    decoration:{label:'Decoración / preparación',cats:['Decoraciones']}
  };
  const kindOptions=Object.entries(kindMeta).map(([value,x])=>({value,label:x.label}));

  function reqsOf(m){
    if(Array.isArray(m.requirements)) return m.requirements;
    return (m.components||[]).map(c=>({kind:c.kind,qty:Number(c.qty)||0}));
  }
  function recipesForRequirement(kind){
    const cats=kindMeta[kind]?.cats||[];
    const active=state.recipes.filter(r=>r&&r.active!==false);
    const specific=active.filter(r=>cats.includes(r.category));
    // Keep category matching when it exists. If a business configured a
    // generic requirement (e.g. "base") with a recipe categorized as
    // "Postres completos", still make that enabled recipe selectable.
    return specific.length?specific:active;
  }
  function presentationCost(m,selections,packages){
    let total=0;
    reqsOf(m).forEach(r=>{
      const recipe=getRecipe(selections[r.kind]);
      if(recipe) total+=recipeCost(recipe)*(Number(r.qty)||0);
    });
    (packages||[]).forEach(p=>{
      const item=state.inventory.find(i=>i.id===p.inventoryId);
      if(item) total+=(Number(p.qty)||0)*(Number(item.cost)||0);
    });
    return total;
  }

  openMeasure=function(id=null,productId=''){
    const m=id?getMeasure(id):{productId:productId||state.products.find(p=>p.active)?.id||'',name:'',minPeople:'',maxPeople:'',saleUnit:'',requirements:[]};
    let requirements=clone(reqsOf(m));
    if(!requirements.length) requirements=[{kind:'base',qty:1}];
    const w=modal(id?'Editar presentación':'Nueva presentación',`
      <div class="helper"><b>¿Qué es una presentación?</b> Solo define el tamaño o formato del producto y cuánto consume. Aquí NO eliges sabores, rellenos ni betunes; eso se selecciona al cotizar.</div>
      <div class="form2">
        ${selectField('Producto','mproduct',state.products.filter(p=>p.active).map(p=>({value:p.id,label:p.name})),m.productId)}
        ${field('Nombre de la presentación','mname',m.name||'','text','placeholder="Ej. 20 cm, Caja de 12, Individual, Grande"')}
        ${field('Personas mínimas (opcional)','mmin',m.minPeople||'','number')}
        ${field('Personas máximas (opcional)','mmax',m.maxPeople||'','number')}${selectField('Tipo de venta','munit',[{value:'people',label:'Por personas / tamaño'},{value:'pz',label:'Por pieza (pz)'},{value:'unit',label:'Por unidad'},{value:'pack',label:'Por paquete / set'}],m.saleUnit||'people')}
      </div>
      <div class="section">
        <div class="page-head" style="margin:0">
          <div><h3>Consumo de esta presentación</h3><div class="hint">Indica cuánto utiliza este tamaño de cada tipo de preparación. La receta específica se elegirá después en la cotización.</div></div>
          <button class="secondary" id="addReq">+ Agregar consumo</button>
        </div>
        <div id="reqBox"></div>
      </div>
      <div class="helper"><b>Ejemplo:</b> 20 cm → 1 receta de base + 0.5 receta de relleno + 0.8 receta de cobertura. Luego, al cotizar, eliges si la base será vainilla o chocolate, qué relleno y qué cobertura.</div>
    `,wrap=>{
      sync();
      const data={
        id:id||'m'+Date.now(),
        productId:wrap.querySelector('#mproduct').value,
        name:wrap.querySelector('#mname').value.trim(),
        minPeople:Number(wrap.querySelector('#mmin').value)||'',
        maxPeople:Number(wrap.querySelector('#mmax').value)||'',
        saleUnit:wrap.querySelector('#munit').value||'people',
        requirements:requirements.filter(r=>r.kind&&Number(r.qty)>0),
        components:[],materials:[]
      };
      if(!data.name){toast('Escribe el nombre de la presentación');return false}
      if(!data.requirements.length){toast('Agrega al menos un consumo');return false}
      if(id) Object.assign(m,data); else state.measures.push(data);
      save();show('measures');toast('Presentación guardada');
    });

    function sync(){
      w.querySelectorAll('[data-req-row]').forEach(row=>{
        const i=Number(row.dataset.reqRow);
        requirements[i]={kind:row.querySelector('[data-rkind]').value,qty:Number(row.querySelector('[data-rqty]').value)||0};
      });
    }
    function draw(){
      w.querySelector('#reqBox').innerHTML=requirements.map((r,i)=>`
        <div class="extra-row" data-req-row="${i}" style="display:grid;grid-template-columns:1.2fr 1fr 42px;gap:8px;margin:9px 0">
          <select data-rkind>${kindOptions.map(o=>`<option value="${o.value}" ${o.value===r.kind?'selected':''}>${o.label}</option>`).join('')}</select>
          <label class="field" style="margin:0">Cantidad de receta<input data-rqty type="number" step="0.05" min="0" value="${r.qty||0}"></label>
          <button class="icon" data-rrm="${i}">×</button>
        </div>`).join('');
      w.querySelectorAll('[data-rkind],[data-rqty]').forEach(el=>el.oninput=sync);
      w.querySelectorAll('[data-rrm]').forEach(b=>b.onclick=()=>{requirements.splice(Number(b.dataset.rrm),1);draw()});
    }
    w.querySelector('#addReq').onclick=()=>{sync();requirements.push({kind:'filling',qty:.5});draw()};
    draw();
  };
  window.openMeasure=openMeasure;

  views.measures=function(){
    titleEl.textContent='Presentaciones';
    content.innerHTML=pageHead('Presentaciones','Define tamaños o formatos y cuánto consume cada uno. Los sabores, rellenos, coberturas y empaques se eligen al cotizar.',`<button class="primary" onclick="openMeasure()">+ Nueva presentación</button>`)+`
      <div class="helper"><b>Más simple:</b> una presentación solo responde “¿qué tamaño es?” y “¿cuánto usa?”. No tienes que escoger recetas específicas aquí.</div>
      ${state.measures.length?state.measures.map(m=>{const p=getProduct(m.productId);const reqs=reqsOf(m);return `<div class="card measure-card"><div class="measure-head"><div><h3 style="margin:0">${esc(p?.name||'Producto')} · ${esc(m.name)}</h3><div class="muted">${m.saleUnit&&m.saleUnit!=='people'?(m.saleUnit==='pz'?'Por pieza (pz)':m.saleUnit==='pack'?'Por paquete / set':'Por unidad'):(m.minPeople||m.maxPeople?`${m.minPeople||0}–${m.maxPeople||0} personas`:'Sin rendimiento por personas')}</div></div><div class="row-actions"><button class="secondary" onclick="openMeasure('${m.id}')">Editar</button><button class="danger" onclick="deleteMeasure('${m.id}')">Eliminar</button></div></div><div class="usage">${reqs.map(r=>`<span>${esc(kindMeta[r.kind]?.label||r.kind)}: ${r.qty} receta</span>`).join('')}</div></div>`}).join(''):'<div class="empty card">Aún no hay presentaciones.</div>'}`;
  };

  newQuote=function(editId=null){
    const existing=editId?state.quotes.find(q=>q.id===editId):null;
    let customExtras=clone(existing?.customExtras||[]), packages=clone(existing?.packages||[]), selections=clone(existing?.selections||{});
    const activeProducts=state.products.filter(p=>p.active), initialProduct=existing?.productId||activeProducts[0]?.id||'';
    const w=modal(existing?'Editar cotización':'Nueva cotización',`
      <div class="steps"><span class="on">Cliente</span><span>Producto</span><span>Opciones</span><span>Extras</span><span>Pedido</span><span>Precio</span></div>
      <div class="quote-section"><h3>👤 Cliente</h3><div class="form2">${field('Folio cotización','qfolio',existing?.folio||('COT-'+String(Math.floor(100000+Math.random()*899999))))}${selectField('Cliente existente','qclient',state.clients.map(c=>({value:c,label:c})),existing?.client||state.clients[0])}${field('Nombre completo (si es nuevo)','qnewclient','')}${field('Teléfono / WhatsApp','qphone','')}${field('Usuario Instagram','qig','')}${field('Fecha del evento','qevent',existing?.event||'','date')}${field('Vendedor','qseller','Denilson Ochoa')}</div></div>
      <div class="quote-section"><h3>🍰 Producto</h3><div class="form2">${selectField('Producto','qproduct',activeProducts.map(p=>({value:p.id,label:p.name})),initialProduct)}<label class="field">Estatus<select id="qstatus">${['Borrador','Aceptada','Cancelada','Entregada y pagada'].map(s=>`<option ${s===existing?.status?'selected':''}>${s}</option>`).join('')}</select></label><label class="field">Presentación<select id="qmeasure"></select></label><div id="qpeople" class="field"><span id="qpeopleLabel">Rendimiento</span><div class="helper" style="margin:0">—</div></div><div id="qquantityBox" class="field" style="display:none"><span>Cantidad</span><input id="qquantity" type="number" min="1" step="1" value="1"><div class="hint" style="margin-top:4px">Indica cuántas piezas, unidades o paquetes necesitas.</div></div></div><div id="dynamicComponents"></div></div>
      <div class="quote-section"><h3>📦 Empaque e insumos de esta cotización</h3><div class="hint">Agrega solo lo que realmente llevará este pedido: caja, base, bolsa, dowels, etc. Se suma automáticamente al costo.</div><div id="packageBox"></div><button class="secondary" id="addPackage">+ Agregar empaque / insumo</button></div>
      <div class="quote-section"><h3>✨ Extras</h3><div id="qextras" class="extras-grid"></div><div class="section"><div class="page-head" style="margin:0"><div><h3>Otros extras</h3><div class="hint">Conceptos libres como flores naturales o entrega especial.</div></div><button class="secondary" id="addCustom">+ Agregar otro extra</button></div><div id="customBox"></div></div></div>
      <div class="quote-section"><label style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="useDiscount"> 🎟️ <b>Aplicar cupón o descuento</b></label><div id="discountBox" class="form2" style="display:none;margin-top:10px">${field('Descuento %','qdiscount','0','number')}${field('Cupón / referencia','qcoupon','')}</div></div>
      <div class="quote-section"><h3>📝 Detalles del pedido</h3><div class="form2">${field('Hora de entrega','qtime','','time')}${field('Anticipo %','qdeposit',existing?.deposit||50,'number')}${area('Comentarios del pedido','qnotes','')}${field('Imagen de referencia','qimage','','file')}</div></div>
      <div class="quote-section"><h3>💰 Resumen de precio</h3><div class="summary-grid"><div class="sum"><span>Costo estimado</span><strong id="sumCost">$0</strong></div><div class="sum"><span>Subtotal</span><strong id="sumSubtotal">$0</strong></div><div class="sum"><span>Descuento</span><strong id="sumDiscount">$0</strong></div><div class="sum"><span>Total venta</span><strong id="sumTotal">$0</strong></div><div class="sum"><span>Anticipo</span><strong id="sumDeposit">$0</strong></div><div class="sum"><span>Restante</span><strong id="sumBalance">$0</strong></div><div class="sum"><span>Ganancia estimada</span><strong id="sumProfit">$0</strong></div></div></div>
    `,wrap=>{
      const result=calculateQuote(),client=wrap.querySelector('#qnewclient').value.trim()||wrap.querySelector('#qclient').value;
      if(!client){toast('Selecciona o escribe cliente');return false}
      const data={id:existing?.id||'q'+Date.now(),folio:wrap.querySelector('#qfolio').value,client,event:wrap.querySelector('#qevent').value,status:wrap.querySelector('#qstatus').value,total:result.total,balance:result.balance,productId:wrap.querySelector('#qproduct').value,measureId:wrap.querySelector('#qmeasure').value,quantity:Math.max(1,Number(wrap.querySelector('#qquantity')?.value)||1),deposit:Number(wrap.querySelector('#qdeposit').value)||50,versions:(existing?.versions||0)+1,selections:clone(selections),packages:clone(packages),customExtras:clone(customExtras)};
      if(existing)Object.assign(existing,data);else state.quotes.unshift(data);if(!state.clients.includes(client))state.clients.push(client);save();show('quotations');toast('Cotización guardada');
    },existing?'Guardar cambios':'Guardar cotización');

    const psel=w.querySelector('#qproduct'),msel=w.querySelector('#qmeasure');
    function loadMeasures(){
      const p=getProduct(psel.value),measures=state.measures.filter(m=>m.productId===p.id);
      msel.innerHTML=measures.length?measures.map(m=>`<option value="${m.id}" ${existing?.measureId===m.id?'selected':''}>${esc(m.name)}</option>`).join(''):'<option value="">Sin presentación configurada</option>';
      renderDynamic();if(existing?.quantity&&w.querySelector('#qquantity'))w.querySelector('#qquantity').value=existing.quantity;renderExtras();calc();
    }
    function renderDynamic(){
      const m=getMeasure(msel.value),box=w.querySelector('#dynamicComponents');
      if(!m){box.innerHTML='<div class="helper">Este producto todavía no tiene presentaciones configuradas.</div>';w.querySelector('#qpeople .helper').textContent='—';return}
      const unit=m.saleUnit||'people';
      const qbox=w.querySelector('#qquantityBox'),qlabel=w.querySelector('#qpeopleLabel');
      if(unit==='people'){qlabel.textContent='Rendimiento';w.querySelector('#qpeople .helper').textContent=m.minPeople||m.maxPeople?`${m.minPeople||0}–${m.maxPeople||0} personas`:'No aplica';qbox.style.display='none';}
      else {qlabel.textContent='Presentación';w.querySelector('#qpeople .helper').textContent=unit==='pz'?'Por pieza (pz)':unit==='pack'?'Por paquete / set':'Por unidad';qbox.style.display='block';}
      const reqs=reqsOf(m);
      box.innerHTML=reqs.map(r=>{const recs=recipesForRequirement(r.kind);return `<div class="section"><h3>${esc(kindMeta[r.kind]?.label||r.kind)}</h3><div class="hint">Esta presentación utiliza ${r.qty} receta(s). Elige cuál preparación llevará este pedido.</div>${recs.length?`<label class="field">Seleccionar receta<select data-component="${r.kind}">${recs.map(rec=>`<option value="${rec.id}" ${selections[r.kind]===rec.id?'selected':''}>${esc(rec.name)}</option>`).join('')}</select></label>`:'<div class="helper">No hay recetas disponibles en esta categoría. Créala primero en Recetas.</div>'}</div>`}).join('');
      w.querySelectorAll('[data-component]').forEach(el=>{if(!selections[el.dataset.component])selections[el.dataset.component]=el.value;el.onchange=()=>{selections[el.dataset.component]=el.value;calc()}});
    }
    function renderPackages(){
      w.querySelector('#packageBox').innerHTML=packages.length?packages.map((p,i)=>`<div class="extra-row" style="display:grid;grid-template-columns:1fr 110px 42px;gap:8px;margin:8px 0"><select data-pi="${i}">${state.inventory.map(inv=>`<option value="${inv.id}" ${inv.id===p.inventoryId?'selected':''}>${esc(inv.name)} · ${money(inv.cost)}/${inv.unit}</option>`).join('')}</select><input data-pq="${i}" type="number" step="0.01" min="0" value="${p.qty||1}"><button class="icon" data-prm="${i}">×</button></div>`).join(''):'<div class="helper">Sin empaque o insumos adicionales.</div>';
      w.querySelectorAll('[data-pi]').forEach(el=>el.onchange=()=>{packages[Number(el.dataset.pi)].inventoryId=el.value;calc()});
      w.querySelectorAll('[data-pq]').forEach(el=>el.oninput=()=>{packages[Number(el.dataset.pq)].qty=Number(el.value)||0;calc()});
      w.querySelectorAll('[data-prm]').forEach(b=>b.onclick=()=>{packages.splice(Number(b.dataset.prm),1);renderPackages();calc()});
    }
    function renderExtras(){const p=getProduct(psel.value);w.querySelector('#qextras').innerHTML=(p.extras||[]).length?(p.extras||[]).map((e,i)=>`<label class="extra-card"><input type="checkbox" data-extra="${i}"><span>${esc(e.name)}</span><input type="number" data-extra-price="${i}" value="${e.price||0}" ${e.mode==='fixed'?'readonly':''}></label>`).join(''):'<div class="helper">Este producto no tiene extras configurados.</div>';w.querySelectorAll('[data-extra],[data-extra-price]').forEach(el=>el.oninput=calc)}
    function drawCustom(){w.querySelector('#customBox').innerHTML=customExtras.map((e,i)=>`<div class="extra-row" style="display:grid;grid-template-columns:1fr 100px 130px 42px;gap:8px;margin:8px 0"><input data-ci="${i}" data-k="name" value="${esc(e.name)}" placeholder="Nombre del extra"><input data-ci="${i}" data-k="qty" type="number" value="${e.qty}"><input data-ci="${i}" data-k="price" type="number" value="${e.price}"><button class="icon" data-crm="${i}">×</button></div>`).join('');w.querySelectorAll('[data-ci]').forEach(el=>el.oninput=()=>{customExtras[Number(el.dataset.ci)][el.dataset.k]=el.dataset.k==='name'?el.value:Number(el.value)||0;calc()});w.querySelectorAll('[data-crm]').forEach(b=>b.onclick=()=>{customExtras.splice(Number(b.dataset.crm),1);drawCustom();calc()})}
    function calculateQuote(){
      const p=getProduct(psel.value),m=getMeasure(msel.value),unit=m?.saleUnit||'people',qty=unit==='people'?1:Math.max(1,Number(w.querySelector('#qquantity')?.value)||1);let cost=p.pricing==='fixed'?0:presentationCost(m,selections,packages);cost*=qty;let subtotal=p.pricing==='fixed'?(Number(p.price)||0)*qty:cost/(1-(Number(p.margin)||50)/100);
      (p.extras||[]).forEach((e,i)=>{const cb=w.querySelector(`[data-extra="${i}"]`),pr=w.querySelector(`[data-extra-price="${i}"]`);if(cb?.checked){const val=Number(pr?.value)||0;subtotal+=val;cost+=e.mode==='fixed'?val*.45:val*.5}});
      customExtras.forEach(e=>{subtotal+=(Number(e.qty)||0)*(Number(e.price)||0);cost+=(Number(e.qty)||0)*(Number(e.price)||0)*.5});
      const disc=w.querySelector('#useDiscount').checked?(Number(w.querySelector('#qdiscount').value)||0):0,discount=subtotal*disc/100,total=Math.max(0,subtotal-discount),dep=(Number(w.querySelector('#qdeposit').value)||0)/100,totalDep=total*dep,balance=total-totalDep,profit=total-cost;return{cost,subtotal,discount,total,deposit:totalDep,balance,profit};
    }
    function calc(){const r=calculateQuote();w.querySelector('#sumCost').textContent=money(r.cost);w.querySelector('#sumSubtotal').textContent=money(r.subtotal);w.querySelector('#sumDiscount').textContent='-'+money(r.discount);w.querySelector('#sumTotal').textContent=money(r.total);w.querySelector('#sumDeposit').textContent=money(r.deposit);w.querySelector('#sumBalance').textContent=money(r.balance);w.querySelector('#sumProfit').textContent=money(r.profit)}
    psel.onchange=()=>{selections={};packages=[];renderPackages();loadMeasures()};msel.onchange=()=>{selections={};renderDynamic();calc()};w.querySelector('#qquantity').oninput=calc;w.querySelector('#addPackage').onclick=()=>{packages.push({inventoryId:state.inventory[0]?.id||'',qty:1});renderPackages();calc()};w.querySelector('#addCustom').onclick=()=>{customExtras.push({name:'',qty:1,price:0});drawCustom()};w.querySelector('#useDiscount').onchange=()=>{w.querySelector('#discountBox').style.display=w.querySelector('#useDiscount').checked?'grid':'none';calc()};w.querySelectorAll('#qdiscount,#qdeposit').forEach(el=>el.oninput=calc);renderPackages();loadMeasures();drawCustom();
  };
  window.newQuote=newQuote;

  views.production=function(){
    titleEl.textContent='Producción';
    content.innerHTML=pageHead('Producción','Las cotizaciones aceptadas se convierten en cantidades reales de recetas.')+`<div class="grid2">${state.quotes.filter(q=>q.status==='Aceptada').map(q=>{const p=getProduct(q.productId),m=getMeasure(q.measureId),reqs=reqsOf(m||{});return `<div class="card"><h3>${esc(q.folio)} · ${esc(p?.name||'')}</h3><p class="muted">${esc(q.client)} · ${esc(q.event||'')}</p><div class="usage">${reqs.map(r=>{const rec=getRecipe(q.selections?.[r.kind]);return `<span>${esc(rec?.name||kindMeta[r.kind]?.label||r.kind)}: ${(Number(r.qty)||0)*(Number(q.quantity)||1)} receta(s)</span>`}).join('')}</div></div>`}).join('')||'<div class="card empty">No hay cotizaciones aceptadas.</div>'}<div class="card"><h3>Empaque e insumos</h3><p class="muted">Se toman directamente de cada cotización, no de la presentación.</p></div></div>`;
  };
})();