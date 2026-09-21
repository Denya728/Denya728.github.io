const URL='https://kcinhsldmnvhudivutzv.supabase.co';
const KEY='sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs';
let sb;
try{
  if(!window.supabase||typeof window.supabase.createClient!=='function')throw new Error('El cliente de Supabase no se cargó correctamente.');
  sb=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
}catch(e){
  const root=document.getElementById('root');
  if(root)root.innerHTML='<div class="a91-login"><div class="a91-brand">✦ DENYA <span>Administración</span></div><h1>No pudimos cargar Administración</h1><p class="a91-muted">Error al iniciar Supabase: '+String(e?.message||e).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))+'</p><button class="a91-btn a91-primary" onclick="location.reload()">Reintentar</button></div>';
  throw e;
}
const root=document.getElementById('root');
let session=null,overview=null,promos=[],tab='dashboard',orgSearch='';
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:2}).format(Number(n)||0);
const date=v=>v?new Date(v).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}):'—';
const dt=v=>v?new Date(v).toLocaleString('es-MX'):'—';
function errBox(msg){const e=document.getElementById('err');if(e){e.textContent=msg||'';e.classList.toggle('show',!!msg)}}
function fatal(msg){root.innerHTML='<div class="a91-login"><div class="a91-brand">✦ DENYA <span>Administración</span></div><h1>No pudimos cargar Administración</h1><p class="a91-muted">'+E(msg||'Error inesperado')+'</p><div class="a91-actions"><button class="a91-btn a91-primary" onclick="location.reload()">Reintentar</button><a class="a91-btn a91-secondary" href="./">Volver a DENYA</a></div></div>'}
function badge(s){
  const t=String(s||'—'),c=/active|Activa|resolved|redeemed/i.test(t)?'ok':/past_due|trial|open|reserved|in_progress/i.test(t)?'warn':/canceled|suspended|closed/i.test(t)?'bad':'';
  return '<span class="a91-badge '+c+'">'+E(t)+'</span>';
}
  document.getElementById('go').onclick=async()=>{
    const email=document.getElementById('email').value.trim(),password=document.getElementById('pass').value,btn=document.getElementById('go');
    if(!email||!password)return errBox('Completa correo y contraseña.');
    btn.disabled=true;btn.textContent='Entrando…';errBox('');
    try{const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;await init()}catch(e){errBox(e.message||String(e))}finally{if(document.getElementById('go')){btn.disabled=false;btn.textContent='Entrar'}}
  };
}
async function isAdmin(){const {data,error}=await sb.rpc('is_platform_admin');if(error)throw error;return data===true}
async function syncPromoStripe(promoId,{silent=false}={}){
  try{
    const {data,error}=await sb.functions.invoke('denya-promo-sync',{body:{promo_id:promoId}});
    if(error||data?.error||data?.needs_secret){
      const msg=error?.message||data?.message||data?.error||'No pudimos sincronizar con Stripe.';
      if(!silent)alert(msg);
      return {ok:false,message:msg,needs_secret:!!data?.needs_secret};
    }
    return {ok:true,data};
  }catch(e){
    if(!silent)alert(e.message||String(e));
    return {ok:false,message:e.message||String(e)};
  }
}
async function adminAction(action,payload={}){
  const {data,error}=await sb.functions.invoke('denya-admin',{body:{action,...payload}});
  if(error)throw error;if(data?.error)throw new Error(data.error);return data;
}
async function load(){
  const [ov,pc]=await Promise.all([
    adminAction('overview'),
    sb.from('promo_codes').select('*').order('created_at',{ascending:false})
  ]);
  if(pc.error)throw pc.error;
  overview=ov||{};promos=pc.data||[];
}
function shell(content){
  root.innerHTML='<div class="a91-shell"><header class="a91-top"><div class="a91-brand">✦ DENYA <span>Administración de plataforma · '+E(session?.user?.email||'')+'</span></div><div class="a91-actions"><a class="a91-btn a91-secondary" href="./">Abrir aplicación</a><button class="a91-btn a91-secondary" onclick="refreshAdmin()">Actualizar</button><button class="a91-btn a91-danger" onclick="logoutAdmin()">Cerrar sesión</button></div></header><nav class="a91-tabs">'+[
    ['dashboard','Resumen'],['organizations','Empresas'],['subscriptions','Suscripciones'],['promos','Promociones'],['redemptions','Redenciones'],['support','Soporte']
  ].map(([id,l])=>'<button class="'+(tab===id?'active':'')+'" onclick="setAdminTab(\''+id+'\')">'+l+'</button>').join('')+'</nav><main>'+content+'</main></div>';
}
function renderDashboard(){
  const m=overview?.metrics||{},orgs=overview?.organizations||[],tickets=overview?.tickets||[];
  const recent=orgs.slice(0,6),open=tickets.filter(t=>['open','in_progress'].includes(t.status)).slice(0,5);
  shell('<div class="a91-grid">'+[
    ['Usuarios',m.users||0,'Miembros activos'],['Empresas activas',m.active_organizations||0,(m.organizations||0)+' totales'],
    ['MRR',money(m.mrr||0),'Ingreso recurrente mensual'],['ARR',money(m.arr||0),'Ingreso recurrente anual'],
    ['Suscripciones activas',m.active_subscriptions||0,'Pagando actualmente'],['Trials',m.trials||0,'Pruebas vigentes'],
    ['Conversión',Number(m.conversion_rate||0).toFixed(1)+'%','Activas sobre ciclo actual'],['Churn',Number(m.churn_rate||0).toFixed(1)+'%','Canceladas sobre activas + canceladas'],
    ['Pagos pendientes',m.past_due||0,'past_due'],['Soporte abierto',m.support_open||0,'Abiertas / en proceso']
  ].map(x=>'<div class="a91-kpi"><small>'+E(x[0])+'</small><strong>'+E(x[1])+'</strong><div class="a91-metric-note">'+E(x[2])+'</div></div>').join('')+'</div>'+
  '<div class="a91-two a91-section"><section class="a91-card"><h3>Empresas recientes</h3>'+recent.map(o=>'<div class="a91-member"><span><b>'+E(o.name)+'</b><br><span class="a91-muted">'+E(o.owner_email||'Sin correo')+'</span></span><span>'+badge(o.subscription_status||'sin plan')+'</span></div>').join('')+'</section><section class="a91-card"><h3>Soporte pendiente</h3>'+open.map(t=>'<div class="a91-member"><span><b>'+E(t.subject)+'</b><br><span class="a91-muted">'+E(t.organization_name)+'</span></span><span>'+badge(t.status)+'</span></div>').join('')+(open.length?'':'<div class="a91-empty">Sin incidencias abiertas.</div>')+'</section></div>');
}
function filteredOrgs(){
  const q=orgSearch.trim().toLowerCase();const rows=overview?.organizations||[];
  if(!q)return rows;
  return rows.filter(o=>[o.name,o.owner_email,o.plan_code,o.subscription_status].some(v=>String(v||'').toLowerCase().includes(q)));
}
function renderOrganizations(){
  const rows=filteredOrgs();
  shell('<div class="a91-search"><input id="orgSearch" placeholder="Buscar empresa, propietario o plan" value="'+E(orgSearch)+'"><select id="orgState"><option value="">Todas</option><option value="active">Activas</option><option value="suspended">Suspendidas</option></select></div>'+
  '<div class="a91-table-wrap"><table class="a91-table"><thead><tr><th>Empresa</th><th>Propietario</th><th>Usuarios</th><th>Plan</th><th>Estado</th><th>Sincronización</th><th>Acciones</th></tr></thead><tbody>'+
  rows.map(o=>'<tr data-active="'+(o.active?'active':'suspended')+'"><td><b>'+E(o.name)+'</b><div class="a91-small a91-muted">'+E(o.slug)+'</div><div class="a91-small">Alta '+date(o.created_at)+'</div></td><td>'+E(o.owner_email||'—')+'</td><td>'+(o.members||[]).length+'<div class="a91-members">'+(o.members||[]).map(m=>'<div class="a91-member"><span>'+E(m.email||m.user_id)+'</span><span>'+E(m.role||m.status)+'</span></div>').join('')+'</div></td><td><b>'+E(o.plan_code||'—')+'</b><div class="a91-small">'+E(o.billing_cycle||'')+'</div></td><td>'+(o.active?badge(o.subscription_status||'Activa'):badge('Suspendida'))+'</td><td>'+date(o.state_updated_at)+'</td><td><div class="a91-row-actions"><button class="a91-btn '+(o.active?'a91-danger':'a91-primary')+'" onclick="toggleOrg(\''+o.id+'\','+(!o.active)+')">'+(o.active?'Suspender':'Reactivar')+'</button><button class="a91-btn a91-secondary" onclick="openOrgDetail(\''+o.id+'\')">Ver</button></div></td></tr>').join('')+
  '</tbody></table></div>');
  const input=document.getElementById('orgSearch');if(input)input.oninput=()=>{orgSearch=input.value;renderOrganizations()};
  const st=document.getElementById('orgState');if(st)st.onchange=()=>document.querySelectorAll('tr[data-active]').forEach(r=>r.style.display=!st.value||r.dataset.active===st.value?'':'none');
}
function renderSubscriptions(){
  const rows=overview?.organizations||[];
  shell('<div class="a91-table-wrap"><table class="a91-table"><thead><tr><th>Empresa</th><th>Plan</th><th>Estado</th><th>Ciclo</th><th>Proveedor</th><th>Periodo / trial</th><th>Acciones</th></tr></thead><tbody>'+
    rows.map(o=>'<tr><td><b>'+E(o.name)+'</b><div class="a91-small a91-muted">'+E(o.owner_email||'')+'</div></td><td>'+E(o.plan_code||'—')+'</td><td>'+badge(o.subscription_status||'sin suscripción')+'</td><td>'+E(o.billing_cycle||'—')+'</td><td>'+E(o.provider||'—')+'</td><td><div class="a91-small">Trial: '+date(o.trial_ends_at)+'</div><div class="a91-small">Periodo: '+date(o.period_ends_at)+'</div></td><td><div class="a91-row-actions">'+(o.provider==='stripe'&&o.provider_customer_id?'<a class="a91-btn a91-secondary" target="_blank" rel="noopener" href="https://dashboard.stripe.com/customers/'+encodeURIComponent(o.provider_customer_id)+'">Abrir Stripe</a>':'<button class="a91-btn a91-secondary" onclick="adminPlan(\''+o.id+'\',\''+E(o.plan_code||'emprende')+'\',\''+E(o.billing_cycle||'monthly')+'\')">Cambiar plan</button>')+'</div></td></tr>').join('')+
  '</tbody></table></div><div class="a91-card a91-section"><b>Suscripciones Stripe</b><p class="a91-muted">Los planes vinculados a Stripe se cambian desde Stripe/Customer Portal para conservar cobros, prorrateos y facturación sincronizados. El cambio manual de administración queda disponible para cuentas no vinculadas a Stripe.</p></div>');
}
function promoCard(p){
  const sync=p.stripe_sync_status||'pending';
  const syncBadge=sync==='synced'?'<span class="a91-badge ok">Stripe sincronizado</span>':sync==='error'?'<span class="a91-badge bad">Error Stripe</span>':'<span class="a91-badge warn">Stripe pendiente</span>';
  return '<tr><td><b>'+E(p.code)+'</b><div class="a91-small a91-muted">'+E(p.description||'')+'</div></td><td>'+E(p.discount_type==='percent'?p.discount_value+'%':money(p.discount_value))+'</td><td>'+E((p.applicable_plan_codes||[]).join(', '))+'</td><td>'+date(p.valid_from)+' → '+date(p.valid_until)+'</td><td>'+E(p.max_redemptions??'∞')+' / '+E(p.max_redemptions_per_user||1)+'</td><td>'+badge(p.active?'Activo':'Inactivo')+'<div style="margin-top:6px">'+syncBadge+'</div>'+(p.stripe_sync_error?'<div class="a91-small a91-muted" style="max-width:240px">'+E(p.stripe_sync_error)+'</div>':'')+'</td><td><div class="a91-row-actions"><button class="a91-btn a91-secondary" onclick="promoModal(\''+p.id+'\')">Editar</button><button class="a91-btn a91-secondary" onclick="syncPromoManual(\''+p.id+'\')">Sincronizar Stripe</button><button class="a91-btn '+(p.active?'a91-danger':'a91-primary')+'" onclick="togglePromo(\''+p.id+'\','+(!p.active)+')">'+(p.active?'Desactivar':'Activar')+'</button></div></td></tr>';
}
function renderPromos(){
  shell('<div class="a91-actions" style="margin-bottom:12px"><button class="a91-btn a91-primary" onclick="promoModal()">+ Crear código</button></div><div class="a91-table-wrap"><table class="a91-table"><thead><tr><th>Código</th><th>Descuento</th><th>Planes</th><th>Vigencia</th><th>Límite total / usuario</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>'+promos.map(promoCard).join('')+(promos.length?'':'<tr><td colspan="7"><div class="a91-empty">No hay promociones.</div></td></tr>')+'</tbody></table></div>');
}
function renderRedemptions(){
  const rows=overview?.redemptions||[];
  shell('<div class="a91-table-wrap"><table class="a91-table"><thead><tr><th>Código</th><th>Empresa</th><th>Usuario</th><th>Estado</th><th>Reservado</th><th>Canjeado</th></tr></thead><tbody>'+rows.map(r=>'<tr><td><b>'+E(r.code||'—')+'</b></td><td>'+E(r.organization_name||'—')+'</td><td>'+E(r.user_email||'—')+'</td><td>'+badge(r.status)+'</td><td>'+dt(r.reserved_at)+'</td><td>'+dt(r.redeemed_at)+'</td></tr>').join('')+(rows.length?'':'<tr><td colspan="6"><div class="a91-empty">Sin redenciones.</div></td></tr>')+'</tbody></table></div>');
}
function renderSupport(){
  const rows=overview?.tickets||[];
  shell('<div class="a91-two"><section><h2>Incidencias</h2>'+rows.map(t=>'<article class="a91-ticket"><div class="a91-ticket-head"><div><b>'+E(t.subject)+'</b><div class="a91-small a91-muted">'+E(t.organization_name)+' · '+E(t.user_email||'')+' · '+dt(t.created_at)+'</div></div>'+badge(t.status)+'</div><p>'+E(t.message)+'</p><div class="a91-row-actions"><button class="a91-btn a91-secondary" onclick="ticketModal(\''+t.id+'\')">Gestionar</button></div>'+(t.admin_notes?'<div class="a91-card" style="margin-top:8px;padding:10px"><b>Nota:</b> '+E(t.admin_notes)+'</div>':'')+'</article>').join('')+(rows.length?'':'<div class="a91-empty">Sin incidencias.</div>')+'</section><aside class="a91-card"><h3>Soporte DENYA</h3><p class="a91-muted">Las incidencias creadas desde Perfil → Soporte aparecen aquí. Puedes marcarlas en proceso, resueltas o cerradas y dejar una nota visible para el cliente.</p></aside></div>');
}
function render(){
  if(tab==='dashboard')return renderDashboard();
  if(tab==='organizations')return renderOrganizations();
  if(tab==='subscriptions')return renderSubscriptions();
  if(tab==='promos')return renderPromos();
  if(tab==='redemptions')return renderRedemptions();
  if(tab==='support')return renderSupport();
}
window.setAdminTab=id=>{tab=id;render()};
window.refreshAdmin=async()=>{try{await load();render()}catch(e){fatal(e.message||String(e))}};
window.logoutAdmin=async()=>{await sb.auth.signOut();session=null;login()};
window.toggleOrg=async(id,active)=>{
  const reason=active?'Reactivación desde Administración':prompt('Motivo de suspensión (opcional):')||'';
  try{await adminAction('set_org_active',{organization_id:id,active,reason});await load();render()}catch(e){alert(e.message||e)}
};
window.openOrgDetail=id=>{
  const o=(overview?.organizations||[]).find(x=>x.id===id);if(!o)return;
  showModal('Empresa · '+o.name,'<div class="a91-form2"><div class="a91-card"><small class="a91-muted">Propietario</small><b>'+E(o.owner_email||'—')+'</b></div><div class="a91-card"><small class="a91-muted">Plan</small><b>'+E(o.plan_code||'—')+' · '+E(o.billing_cycle||'—')+'</b></div><div class="a91-card"><small class="a91-muted">Suscripción</small><b>'+E(o.subscription_status||'—')+'</b></div><div class="a91-card"><small class="a91-muted">Última sincronización</small><b>'+E(dt(o.state_updated_at))+'</b></div></div><h3>Usuarios</h3>'+(o.members||[]).map(m=>'<div class="a91-member"><span>'+E(m.email||m.user_id)+'</span><span>'+E(m.role||m.status)+'</span></div>').join(''),'<button class="a91-btn a91-secondary" data-close>Cerrar</button>');
};
window.adminPlan=(id,current,billing)=>{
  const body='<div class="a91-form2"><label class="a91-field">Plan<select id="aplan"><option value="emprende">Emprende</option><option value="negocio">Negocio</option><option value="pro">Pro</option></select></label><label class="a91-field">Ciclo<select id="abilling"><option value="monthly">Mensual</option><option value="annual">Anual</option></select></label></div><p class="a91-muted">Solo se aplica directamente a cuentas que no están vinculadas a una suscripción Stripe.</p>';
  const m=showModal('Cambiar plan administrativo',body,'<button class="a91-btn a91-secondary" data-close>Cancelar</button><button class="a91-btn a91-primary" id="adminPlanSave">Guardar</button>');
  m.querySelector('#aplan').value=current||'emprende';m.querySelector('#abilling').value=billing||'monthly';
  m.querySelector('#adminPlanSave').onclick=async()=>{try{await adminAction('set_plan',{organization_id:id,plan_code:m.querySelector('#aplan').value,billing_cycle:m.querySelector('#abilling').value});m.remove();await load();render()}catch(e){alert(e.message||e)}};
};
window.promoModal=id=>{
  const p=id?promos.find(x=>x.id===id):null;
  const body='<div class="a91-form2"><label class="a91-field">Código<input id="pcode" value="'+E(p?.code||'')+'" placeholder="BIENVENIDA20"></label><label class="a91-field">Descripción<input id="pdesc" value="'+E(p?.description||'')+'"></label><label class="a91-field">Tipo<select id="ptype"><option value="percent">Porcentaje</option><option value="fixed">Monto fijo</option></select></label><label class="a91-field">Valor<input id="pvalue" type="number" step="0.01" min="0" value="'+E(p?.discount_value||0)+'"></label><label class="a91-field">Válido desde<input id="pfrom" type="datetime-local"></label><label class="a91-field">Válido hasta<input id="puntil" type="datetime-local"></label><label class="a91-field">Máximo total<input id="pmax" type="number" min="1" value="'+E(p?.max_redemptions||'')+'" placeholder="Sin límite"></label><label class="a91-field">Máximo por usuario<input id="puser" type="number" min="1" value="'+E(p?.max_redemptions_per_user||1)+'"></label></div><div class="a91-card a91-section"><b>Planes aplicables</b><div class="a91-actions" style="margin-top:8px">'+['emprende','negocio','pro'].map(x=>'<label><input type="checkbox" name="pplan" value="'+x+'" '+((p?.applicable_plan_codes||['emprende','negocio','pro']).includes(x)?'checked':'')+'> '+x+'</label>').join('')+'</div></div>';
  const m=showModal(id?'Editar promoción':'Crear promoción',body,'<button class="a91-btn a91-secondary" data-close>Cancelar</button><button class="a91-btn a91-primary" id="promoSave">Guardar</button>');
  m.querySelector('#ptype').value=p?.discount_type||'percent';
  const toLocal=v=>v?new Date(new Date(v).getTime()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16):'';
  m.querySelector('#pfrom').value=toLocal(p?.valid_from);m.querySelector('#puntil').value=toLocal(p?.valid_until);
  m.querySelector('#promoSave').onclick=async()=>{
    const code=m.querySelector('#pcode').value.trim().toUpperCase(),description=m.querySelector('#pdesc').value.trim();
    const plans=[...m.querySelectorAll('[name="pplan"]:checked')].map(x=>x.value);
    if(!code||!plans.length)return alert('Completa código y al menos un plan.');
    const payload={code,description,discount_type:m.querySelector('#ptype').value,discount_value:Number(m.querySelector('#pvalue').value)||0,applicable_plan_codes:plans,valid_from:m.querySelector('#pfrom').value?new Date(m.querySelector('#pfrom').value).toISOString():null,valid_until:m.querySelector('#puntil').value?new Date(m.querySelector('#puntil').value).toISOString():null,max_redemptions:m.querySelector('#pmax').value?Number(m.querySelector('#pmax').value):null,max_redemptions_per_user:Number(m.querySelector('#puser').value)||1,active:p?.active??true};
    if(!id)payload.created_by=session.user.id;
    let savedId=id;
    if(id){
      payload.stripe_sync_status='pending';payload.stripe_sync_error=null;
      const {error}=await sb.from('promo_codes').update(payload).eq('id',id);if(error)return alert(error.message);
    }else{
      payload.stripe_sync_status='pending';
      const {data:created,error}=await sb.from('promo_codes').insert(payload).select('id').single();
      if(error)return alert(error.message);savedId=created.id;
    }
    m.remove();
    const sync=await syncPromoStripe(savedId,{silent:true});
    await load();render();
    if(!sync.ok&&sync.needs_secret)alert('La promoción quedó guardada en DENYA. Falta una configuración tuya para sincronizar códigos automáticamente con Stripe.');
  };
};
window.syncPromoManual=async id=>{const r=await syncPromoStripe(id);await load();render();if(r.ok)alert('Promoción sincronizada con Stripe.')};
window.togglePromo=async(id,active)=>{const {error}=await sb.from('promo_codes').update({active,stripe_sync_status:'pending',stripe_sync_error:null}).eq('id',id);if(error)return alert(error.message);await syncPromoStripe(id,{silent:true});await load();render()};
window.ticketModal=id=>{
  const t=(overview?.tickets||[]).find(x=>x.id===id);if(!t)return;
  const body='<p><b>'+E(t.subject)+'</b></p><p class="a91-muted">'+E(t.message)+'</p><label class="a91-field">Estado<select id="tstatus"><option value="open">Abierta</option><option value="in_progress">En proceso</option><option value="resolved">Resuelta</option><option value="closed">Cerrada</option></select></label><label class="a91-field" style="margin-top:10px">Nota visible para el cliente<textarea id="tnotes">'+E(t.admin_notes||'')+'</textarea></label>';
  const m=showModal('Gestionar incidencia',body,'<button class="a91-btn a91-secondary" data-close>Cancelar</button><button class="a91-btn a91-primary" id="ticketSave">Guardar</button>');
  m.querySelector('#tstatus').value=t.status;
  m.querySelector('#ticketSave').onclick=async()=>{try{await adminAction('update_ticket',{ticket_id:id,status:m.querySelector('#tstatus').value,admin_notes:m.querySelector('#tnotes').value.trim()||null})}catch(e){return alert(e.message||e)};m.remove();await load();render()};
};
function showModal(title,body,actions=''){
  const bg=document.createElement('div');bg.className='a91-modal-bg';bg.innerHTML='<div class="a91-modal"><div class="a91-modal-head"><h2>'+E(title)+'</h2><button class="a91-btn a91-secondary" data-close>×</button></div><div style="margin-top:14px">'+body+'</div><div class="a91-modal-actions">'+actions+'</div></div>';
  document.body.appendChild(bg);bg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>bg.remove());return bg;
}
async function init(){
  try{
    const {data,error}=await sb.auth.getSession();if(error)throw error;session=data.session;
    if(!session)return login();
    if(!(await isAdmin())){root.innerHTML='<div class="a91-login"><div class="a91-brand">✦ DENYA <span>Administración</span></div><h1>Acceso no autorizado</h1><p class="a91-muted">Esta cuenta no tiene permisos de administrador de plataforma.</p><button class="a91-btn a91-danger" onclick="logoutAdmin()">Cerrar sesión</button><a class="a91-btn a91-secondary" href="./" style="margin-left:8px">Volver</a></div>';return}
    await load();render();
  }catch(e){console.error(e);fatal(e.message||String(e))}
}
window.addEventListener('unhandledrejection',e=>console.error(e.reason));
init();