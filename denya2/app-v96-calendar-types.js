// DENYA SWEETLAB v96 · calendar custom event types
(function(){
  const DEFAULT_TYPES=[
    {id:'hornear',label:'Hornear',locked:true},
    {id:'entrega',label:'Entrega',locked:true},
    {id:'evento',label:'Evento',locked:true},
    {id:'personalizado',label:'Personalizado',locked:true}
  ];
  const ensure=()=>{
    state.calendarTypes=Array.isArray(state.calendarTypes)&&state.calendarTypes.length
      ? state.calendarTypes
      : DEFAULT_TYPES.map(x=>({...x}));
  };
  ensure();

  function persist(){if(typeof save==='function')save();}
  function esc2(v){return typeof esc==='function'?esc(v??''):String(v??'');}
  function toast2(msg){if(typeof toast==='function')toast(msg);else alert(msg);}

  function addTypeButton(sel){
    if(!sel || sel.dataset.denyaTypesReady)return;
    sel.dataset.denyaTypesReady='1';
    const wrap=document.createElement('div');
    wrap.className='v96-type-control';
    sel.parentNode.insertBefore(wrap,sel);
    wrap.appendChild(sel);
    const btn=document.createElement('button');
    btn.type='button'; btn.className='secondary v96-manage-types';
    btn.textContent='Gestionar tipos';
    btn.addEventListener('click',function(ev){ ev.preventDefault(); ev.stopPropagation(); openTypeManager(sel); });
    wrap.appendChild(btn);
  }

  function candidateSelects(root=document){
    return [...root.querySelectorAll('select')].filter(s=>{
      if(s.dataset.denyaTypesReady)return false;
      const id=(s.id||'').toLowerCase(), name=(s.name||'').toLowerCase();
      const txt=(s.closest('.field')?.textContent||'').toLowerCase();
      return id==='eventtype'||name==='eventtype'||id.includes('eventtype')||id.includes('event-type')||
             (id.includes('type')&&id.includes('event'))||
             (name.includes('type')&&name.includes('event'))||
             (txt.includes('tipo')&& (txt.includes('evento')||txt.includes('event')));
    });
  }

  function refreshSelect(sel){
    const current=sel.value;
    const html=state.calendarTypes.map(t=>'<option value="'+esc2(t.id)+'">'+esc2(t.label)+'</option>').join('');
    // Evita re-renderizar el select si no cambió: el MutationObserver detecta ese cambio
    // y podía entrar en un ciclo infinito, haciendo que el calendario se congelara.
    if(sel.innerHTML!==html) sel.innerHTML=html;
    if([...sel.options].some(o=>o.value===current)) sel.value=current;
  }

  function openTypeManager(sourceSelect){
    ensure();
    const bg=document.createElement('div');
    bg.className='modal-bg';
    bg.innerHTML='<div class="modal v96-types-modal" style="max-width:620px">'+
      '<div class="modal-head"><div><h2>Tipos de evento</h2><div class="hint">Agrega los tipos que quieras usar en el calendario.</div></div><button class="icon" data-close>×</button></div>'+
      '<div class="v96-add-type"><input id="v96NewType" placeholder="Ej. Reunión, Comprar insumos, Sesión de fotos"><button class="primary" id="v96AddType">+ Agregar tipo</button></div>'+
      '<div id="v96TypeList"></div>'+
      '<div class="modal-actions"><button class="secondary" data-close>Cerrar</button></div></div>';
    document.body.appendChild(bg);
    const list=bg.querySelector('#v96TypeList');
    async function verifyCurrentPassword(){
      if(!window.supabase?.createClient)return false;
      const URL='https://kcinhsldmnvhudivutzv.supabase.co';
      const KEY='sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs';
      const authClient=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}});
      const {data:{session}}=await authClient.auth.getSession();
      const email=session?.user?.email;
      if(!email){toast2('No se encontró la sesión del usuario.');return false;}
      const password=prompt('Para eliminar este tipo, escribe la contraseña de tu cuenta:');
      if(password===null)return false;
      if(!password){toast2('Escribe tu contraseña para continuar.');return false;}
      const {error}=await authClient.auth.signInWithPassword({email,password});
      if(error){toast2('Contraseña incorrecta. No se eliminó el tipo.');return false;}
      return true;
    }
    const draw=()=>{
      list.innerHTML=state.calendarTypes.map(t=>
        '<div class="v96-type-row"><div><b>'+esc2(t.label)+'</b>'+(t.locked?'<span class="hint">Tipo base</span>':'')+'</div>'+
        (t.locked?'<span class="v96-protected">Base</span>':'<button class="danger v96-delete-type" data-id="'+esc2(t.id)+'">Eliminar</button>')+
        '</div>').join('');
      list.querySelectorAll('.v96-delete-type').forEach(b=>b.onclick=async()=>{
        const id=b.dataset.id;
        const target=state.calendarTypes.find(t=>t.id===id);
        if(!target||target.locked)return;
        if(!await verifyCurrentPassword())return;
        const used=(state.calendarEvents||[]).some(e=>String(e.type||e.eventType||'')===id);
        if(used && !confirm('Este tipo ya está usado en eventos. Si lo eliminas, esos eventos conservarán el texto del tipo, pero dejarán de aparecer como opción. ¿Continuar?'))return;
        state.calendarTypes=state.calendarTypes.filter(t=>t.id!==id);
        persist(); refreshAll(); draw(); toast2('Tipo eliminado');
      });
    };
    bg.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();bg.remove();}));
    bg.addEventListener('click',function(ev){if(ev.target===bg)bg.remove();});
    bg.querySelector('#v96AddType').onclick=()=>{
      const input=bg.querySelector('#v96NewType'), label=input.value.trim();
      if(!label)return input.focus();
      if(state.calendarTypes.some(t=>t.label.toLowerCase()===label.toLowerCase()))return toast2('Ese tipo ya existe');
      const id='custom-'+label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+Date.now().toString(36);
      state.calendarTypes.push({id,label,locked:false});
      persist(); refreshAll(); draw(); input.value=''; input.focus(); toast2('Tipo agregado');
    };
    draw();
  }

  function refreshAll(){
    document.querySelectorAll('select[data-denya-types-ready]').forEach(refreshSelect);
  }
  function scan(){candidateSelects().forEach(addTypeButton);refreshAll();}
  const observer=new MutationObserver(()=>scan());
  observer.observe(document.body,{childList:true,subtree:true});
  scan();
  window.DENYACalendarTypes={open:openTypeManager,refresh:refreshAll};
})();