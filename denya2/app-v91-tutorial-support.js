// DENYA v91 · welcome tutorial + support center
(function(){
  const E=v=>typeof esc==='function'?esc(v??''):String(v??'');
  const now=()=>new Date().toISOString();
  function ensureTutorial(){
    state.tutorial=state.tutorial||{completed:false,startedAt:now(),choice:null};
    if(!Array.isArray(state.inventory))state.inventory=[];
    if(!Array.isArray(state.recipes))state.recipes=[];
    if(!Array.isArray(state.products))state.products=[];
    if(!Array.isArray(state.measures))state.measures=[];
    if(!Array.isArray(state.clients))state.clients=[];
    if(!Array.isArray(state.clientRecords))state.clientRecords=[];
    if(!Array.isArray(state.quotes))state.quotes=[];
    if(!Array.isArray(state.orders))state.orders=[];
  }
  function features(){
    return state.__cloud?.features||window.DENYACloud?.context?.plan?.features||{};
  }
  function guideSteps(){
    const f=features();
    const steps=[
      {id:'company',title:'Completa tu empresa',text:'Revisa nombre, logo y datos principales de tu negocio.',view:'profile',done:()=>!!state.profile?.businessName},
      ...(f.inventory===false?[]:[{id:'inventory',title:'Agrega tus ingredientes e insumos',text:'Primero registra los artículos que realmente usas y sus costos. Así las recetas podrán calcularse automáticamente.',view:'inventory',done:()=>state.inventory.length>0}]),
      {id:'recipe',title:'Crea tu primera receta',text:'Ahora usa los ingredientes del inventario. DENYA tomará sus costos automáticamente.',view:'recipes',done:()=>state.recipes.length>0},
      {id:'product',title:'Crea tu primer producto',text:'Agrega algo que vendas: pastel, galletas, cacao, postre, etc.',view:'products',done:()=>state.products.length>0},
      {id:'quote',title:'Crea tu primera cotización',text:'Selecciona cliente, producto, presentación, extras y precio.',view:'quotations',done:()=>state.quotes.length>0},
      {id:'accept',title:'Acepta la cotización',text:'Cuando el cliente confirme, pásala a aceptada y registra el anticipo.',view:'quotations',done:()=>state.quotes.some(q=>['Aceptada','Aceptada y anticipo pagado','Entregada y pagada'].includes(q.status))},
      ...(f.production===false?[]:[{id:'production',title:'Pásala a producción',text:'Convierte el pedido aceptado en trabajo de producción y revisa materiales.',view:'orders',done:()=>state.orders.some(o=>['En producción','Listo','Entregado y pagado'].includes(o.status))}]),
      {id:'delivery',title:'Entrega y cobra',text:'Cierra el pedido como entregado y pagado para que entre a ventas y finanzas.',view:'orders',done:()=>state.orders.some(o=>o.status==='Entregado y pagado')||state.quotes.some(q=>q.status==='Entregada y pagada')}
    ];
    return steps;
  }
  function seedInventory(){
    if(state.inventory.some(x=>x.tutorialGenerated))return;
    state.inventory.push({
      id:'tut_inv_harina',name:'Harina · ejemplo DENYA',category:'Ingredientes',purchaseUnit:'bolsa',useUnit:'g',
      purchaseContent:1000,purchaseCost:32,cost:.032,unit:'g',stock:3000,stockMin:1000,supplier:'Proveedor ejemplo',brand:'General',
      active:true,movements:[{date:new Date().toLocaleString('es-MX'),type:'Alta',qty:3000,balance:3000,note:'Dato creado por tutorial'}],
      tutorialGenerated:true
    });
  }
  function seedRecipe(){
    if(state.recipes.some(x=>x.tutorialGenerated))return;
    seedInventory();
    state.recipes.push({
      id:'tut_recipe_vainilla',name:'Pan vainilla · ejemplo DENYA',category:'Bases',yield:1,unit:'receta',
      procedure:'Mezcla los ingredientes y hornea según tu proceso.',notes:'Dato creado por tutorial',
      components:[{type:'ingredient',refId:'tut_inv_harina',name:'Harina · ejemplo DENYA',qty:500,unit:'g',unitCost:.032}],
      tutorialGenerated:true
    });
  }
  function seedProduct(){
    if(state.products.some(x=>x.tutorialGenerated))return;
    state.products.push({
      id:'tut_product_pastel',name:'Pastel ejemplo DENYA',category:'Pasteles',pricing:'recipe',margin:55,active:true,
      extras:[{name:'Topper ejemplo',mode:'fixed',price:50}],tutorialGenerated:true
    });
    if(!state.measures.some(x=>x.tutorialGenerated)){
      seedRecipe();
      state.measures.push({
        id:'tut_measure_20',productId:'tut_product_pastel',name:'20 cm · ejemplo',minPeople:20,maxPeople:25,
        components:[{kind:'base',label:'Pan / base',required:true,qty:1,recipeIds:['tut_recipe_vainilla']}],
        requirements:[{kind:'base',qty:1}],materials:[],tutorialGenerated:true
      });
    }
  }
  function seedClient(){
    if(!state.clients.includes('Cliente ejemplo DENYA'))state.clients.push('Cliente ejemplo DENYA');
    if(!state.clientRecords.some(c=>c.name==='Cliente ejemplo DENYA'))state.clientRecords.push({
      id:'tut_client',name:'Cliente ejemplo DENYA',phone:'81 0000 0000',instagram:'',birthday:'',notes:'Dato creado por tutorial',active:true,tutorialGenerated:true
    });
  }
  function seedQuote(){
    if(state.quotes.some(x=>x.tutorialGenerated))return;
    seedProduct();seedClient();
    const d=new Date();d.setDate(d.getDate()+7);
    state.quotes.unshift({
      id:'tut_quote',folio:'COT-TUTORIAL',client:'Cliente ejemplo DENYA',event:d.toISOString().slice(0,10),status:'Borrador',
      total:850,balance:425,productId:'tut_product_pastel',measureId:'tut_measure_20',deposit:50,costEstimated:280,
      selections:{base:'tut_recipe_vainilla'},versions:1,tutorialGenerated:true
    });
  }
  function seedAccept(){
    seedQuote();
    const q=state.quotes.find(x=>x.id==='tut_quote');if(q){q.status='Aceptada';q.depositPaidAt=now();q.balance=425}
    if(!state.orders.some(o=>o.tutorialGenerated))state.orders.unshift({id:'tut_order',quoteId:'tut_quote',status:'Pendiente',createdAt:now(),tutorialGenerated:true});
  }
  function seedProduction(){
    seedAccept();const o=state.orders.find(x=>x.id==='tut_order');if(o){o.status='En producción';o.startedAt=now()}
  }
  function seedDelivery(){
    seedProduction();const o=state.orders.find(x=>x.id==='tut_order'),q=state.quotes.find(x=>x.id==='tut_quote');
    if(o){o.status='Entregado y pagado';o.completedAt=now()}
    if(q){q.status='Entregada y pagada';q.balance=0;q.completedAt=now()}
  }
  window.seedTutorialStepV91=function(id){
    ensureTutorial();
    if(id==='product')seedProduct();
    if(id==='recipe')seedRecipe();
    if(id==='inventory')seedInventory();
    if(id==='quote')seedQuote();
    if(id==='accept')seedAccept();
    if(id==='production')seedProduction();
    if(id==='delivery')seedDelivery();
    save();renderGuideV91();toast('Ejemplo del tutorial agregado');
  };
  window.goTutorialStepV91=function(id,view){
    closeGuideV91();
    if(view==='profile'&&typeof renderProfile==='function')renderProfile('company');else if(typeof show==='function')show(view);
    setTimeout(()=>{
      if(id==='product'&&typeof openProduct==='function')openProduct();
      else if(id==='recipe'&&typeof openRecipe==='function')openRecipe();
      else if(id==='inventory'&&typeof openInventoryItem==='function')openInventoryItem();
      else if(id==='quote'&&typeof newQuote==='function')newQuote();
    },80);
  };
  window.keepTutorialDataV91=function(){
    ensureTutorial();state.tutorial.completed=true;state.tutorial.choice='keep';state.tutorial.completedAt=now();save();closeGuideV91();toast('Tutorial completado');
  };
  window.resetTutorialDataV91=function(){
    if(!confirm('¿Empezar desde cero? Solo se eliminarán los datos creados por el tutorial. Tus datos propios se conservarán.'))return;
    const keep=x=>!(x?.tutorialGenerated||String(x?.id||'').startsWith('tut_'));
    state.inventory=state.inventory.filter(keep);
    state.recipes=state.recipes.filter(keep);
    state.products=state.products.filter(keep);
    state.measures=state.measures.filter(keep);
    state.clientRecords=state.clientRecords.filter(keep);
    state.clients=state.clients.filter(x=>x!=='Cliente ejemplo DENYA');
    state.quotes=state.quotes.filter(keep);
    state.orders=state.orders.filter(keep);
    state.purchaseOrders=(state.purchaseOrders||[]).filter(keep);
    state.financeTransactions=(state.financeTransactions||[]).filter(keep);
    state.tutorial.completed=true;state.tutorial.choice='reset';state.tutorial.completedAt=now();
    save();closeGuideV91();try{show('home')}catch(_){}toast('Tu espacio quedó limpio');
  };
  window.closeGuideV91=function(){document.getElementById('v91Guide')?.remove()};
  window.openGuideV91=function(){ensureTutorial();renderGuideV91()};
  function renderGuideV91(){
    ensureTutorial();
    document.getElementById('v91Guide')?.remove();
    const steps=guideSteps(),done=steps.filter(s=>s.done()).length,pct=Math.round(done/Math.max(1,steps.length)*100);
    const finished=done===steps.length;
    document.body.insertAdjacentHTML('beforeend',`<div class="v91-guide" id="v91Guide"><aside class="v91-guide-panel">
      <div class="v91-guide-head"><div><small class="v33-eyebrow">Guía de bienvenida</small><h2>Aprende DENYA paso a paso</h2><div class="muted">${done} de ${steps.length} pasos completados.</div></div><button class="icon" onclick="closeGuideV91()">×</button></div>
      <div class="v91-guide-progress"><i style="width:${pct}%"></i></div>
      ${steps.map((s,i)=>{const ok=s.done();return `<section class="v91-guide-step ${ok?'done':''}"><div class="topline"><b>${i+1}. ${E(s.title)}</b><span class="check">${ok?'✓':'○'}</span></div><p>${E(s.text)}</p><div class="row-actions"><button class="${ok?'secondary':'primary'}" onclick="goTutorialStepV91('${s.id}','${s.view}')">${ok?'Revisar':'Ir a hacerlo'}</button>${!ok&&s.id!=='company'?'<button class="secondary" onclick="seedTutorialStepV91(\''+s.id+'\')">Usar ejemplo</button>':''}</div></section>`}).join('')}
      ${finished?`<section class="v91-guide-finish"><h3>¡Listo! Ya conoces el flujo completo de DENYA.</h3><p class="muted">Puedes conservar la información de práctica o limpiar únicamente lo que creó este tutorial.</p><div class="v91-guide-actions"><button class="primary" onclick="keepTutorialDataV91()">Conservar información</button><button class="secondary" onclick="resetTutorialDataV91()">Empezar desde cero</button></div></section>`:''}
    </aside></div>`);
  }
  function addGuideButton(){
    if(document.getElementById('v91GuideButton'))return;
    const b=document.createElement('button');b.id='v91GuideButton';b.className='v91-guide-button';b.textContent='✓ Guía';b.onclick=openGuideV91;document.body.appendChild(b);
  }

  async function renderSupport(){
    titleEl.textContent='Perfil';
    content.innerHTML=pageHead('Soporte','Envíanos una incidencia, duda de facturación o solicitud de mejora.',`<button class="primary" onclick="openSupportTicketV91()">+ Nueva incidencia</button>`)+
      '<div class="v91-support-shell"><div><h3>Mis incidencias</h3><div id="v91Tickets"><div class="empty">Cargando…</div></div></div><div class="card"><div class="v33-eyebrow">Ayuda</div><h3>¿Qué puedes reportar?</h3><p class="muted">Errores técnicos, dudas de suscripción, problemas con datos o sugerencias de funciones. El equipo de DENYA podrá ver el estado desde Administración.</p><div class="helper"><b>Incluye contexto:</b> qué estabas haciendo, qué esperabas que ocurriera y qué ocurrió realmente.</div></div></div>';
    try{
      const r=await window.DENYACloud?.listSupport?.();
      const rows=r?.tickets||[],box=document.getElementById('v91Tickets');if(!box)return;
      box.innerHTML=rows.map(t=>`<article class="v91-ticket"><div class="v91-ticket-head"><div><b>${E(t.subject)}</b><small>${new Date(t.created_at).toLocaleString('es-MX')} · ${E(t.category)}</small></div><span class="v91-ticket-status ${E(t.status)}">${E(t.status)}</span></div><p>${E(t.message)}</p>${t.admin_notes?'<div class="helper"><b>Respuesta / nota de soporte:</b><br>'+E(t.admin_notes)+'</div>':''}</article>`).join('')||'<div class="empty">Aún no tienes incidencias.</div>';
    }catch(e){const box=document.getElementById('v91Tickets');if(box)box.innerHTML='<div class="helper">No pudimos cargar soporte. Intenta recargar.</div>'}
  }
  views.support=renderSupport;
  window.openSupportTicketV91=function(){
    const w=modal('Nueva incidencia',`<div class="form2">${selectField('Categoría','v91SupportCategory',[{value:'technical',label:'Problema técnico'},{value:'billing',label:'Suscripción / pago'},{value:'feature',label:'Sugerencia de función'},{value:'general',label:'Otra duda'}],'technical')}${selectField('Prioridad','v91SupportPriority',[{value:'normal',label:'Normal'},{value:'high',label:'Alta'},{value:'urgent',label:'Urgente'},{value:'low',label:'Baja'}],'normal')}</div><div style="margin-top:12px">${field('Asunto','v91SupportSubject','')}${area('Cuéntanos qué pasó','v91SupportMessage','')}</div>`,async wrap=>{
      const payload={category:wrap.querySelector('#v91SupportCategory').value,priority:wrap.querySelector('#v91SupportPriority').value,subject:wrap.querySelector('#v91SupportSubject').value.trim(),message:wrap.querySelector('#v91SupportMessage').value.trim()};
      if(!payload.subject||!payload.message){toast('Completa asunto y descripción');return false}
      try{await window.DENYACloud?.createSupport?.(payload);toast('Incidencia enviada');setTimeout(()=>renderProfile?.('support'),150);return true}catch(e){toast('No pudimos enviar la incidencia');return false}
    },'Enviar');
  };

  function maybeWelcome(){
    ensureTutorial();addGuideButton();
    const total=(state.products?.length||0)+(state.quotes?.length||0)+(state.orders?.length||0)+(state.inventory?.length||0);
    if(!state.tutorial.completed&&!state.tutorial.autoShown&&total<=2){
      state.tutorial.autoShown=true;save();setTimeout(openGuideV91,500);
    }
  }
  window.addEventListener('denya:cloud-ready',maybeWelcome);
  if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',()=>{addGuideButton();setTimeout(()=>{if(window.DENYACloud?.ready)maybeWelcome()},1000)});else{addGuideButton();setTimeout(()=>{if(window.DENYACloud?.ready)maybeWelcome()},1000)}
})();