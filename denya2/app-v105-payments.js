// DENYA v105 · Connect payments, balances, refunds and disputes UI
(function(){
  const U="https://kcinhsldmnvhudivutzv.supabase.co";
  const K="sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs";
  const c=()=>window.supabase?.createClient?window.supabase.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}}):null;
  const esc2=v=>typeof esc==="function"?esc(v??""):String(v??"");
  const toast2=m=>typeof toast==="function"?toast(m):alert(m);
  const org=()=>localStorage.getItem("denya_active_org")||window.DENYACloud?.context?.organization?.id||"";
  async function call(action,p={}){const x=c();if(!x)throw new Error("Supabase no disponible");const {data:{session}}=await x.auth.getSession();if(!session)throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");const r=await x.functions.invoke("denya-payments",{body:{action,organization_id:org(),...p}});if(r.error)throw new Error(r.error.message||"Error de conexión");if(r.data?.error)throw new Error(r.data.error);return r.data}
  function style(){if(document.getElementById("v105style"))return;const s=document.createElement("style");s.id="v105style";s.textContent=`
.v105-kpis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:12px 0 16px}.v105-kpi{background:#fff;border:1px solid #eadfd6;border-radius:16px;padding:16px}.v105-kpi small{display:block;color:#7d7067;margin-bottom:5px}.v105-kpi strong{font-size:24px}.v105-card{background:#fff;border:1px solid #eadfd6;border-radius:16px;padding:18px;margin:0 0 14px}.v105-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #eee6df}.v105-row:last-child{border-bottom:0}.v105-muted{color:#7d7067;font-size:13px}.v105-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.v105-status{display:inline-flex;border-radius:999px;padding:5px 9px;font-size:11px;background:#f1ebe5}.v105-danger{color:#9b3b32}.v105-ok{color:#3e7652}.v105-warning{color:#956b20}.v105-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.v105-table{width:100%;border-collapse:collapse}.v105-table th,.v105-table td{text-align:left;padding:10px;border-bottom:1px solid #eee6df;font-size:13px}.v105-empty{padding:18px;text-align:center;color:#857970;background:#faf7f3;border-radius:12px}@media(max-width:760px){.v105-kpis,.v105-grid2{grid-template-columns:1fr}}`;
document.head.appendChild(s)}
  function money(v){return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(Number(v||0))}
  async function renderPayments(){
    style();const root=document.getElementById("content");if(!root)return;
    root.innerHTML=pageHead("Perfil","Pagos, cuenta conectada, saldo, reembolsos y reclamos.")+
      '<div class="profile-tabs v58-account-tabs"><button onclick="renderProfile(\'company\')">Empresa</button><button onclick="renderProfile(\'subscription\')">Suscripción</button><button onclick="renderProfile(\'customization\')">Personalización</button><button class="active">Pagos</button><button onclick="renderProfile(\'templates\')">Plantillas</button><button onclick="renderProfile(\'users\')">Usuarios</button><button onclick="renderProfile(\'support\')">Ayuda y soporte</button></div>'+
      '<div id="v105PaymentsBody"><div class="v105-empty">Cargando configuración de pagos…</div></div>';
    const body=document.getElementById("v105PaymentsBody");
    try{
      let st=await call("status");
      if(!st.connected){
        body.innerHTML='<div class="v105-card"><h3>Configurar pagos online</h3><p class="v105-muted">Cada empresa tendrá su propia cuenta de pagos y su propio saldo. El negocio no necesitará entrar al Dashboard de Stripe.</p><div class="v105-actions"><button class="primary" id="v105Start">Configurar pagos</button></div></div>';
        document.getElementById("v105Start").onclick=async()=>{const b=document.getElementById("v105Start");b.disabled=true;try{await call("create_account",{email:window.DENYACloud?.context?.user?.email||"",business_name:window.DENYACloud?.context?.organization?.name||state?.profile?.businessName||"Mi negocio"});await continueOnboarding()}catch(e){toast2(e.message)}finally{b.disabled=false}};
        return;
      }
      body.innerHTML='<div class="v105-kpis"><div class="v105-kpi"><small>Saldo disponible</small><strong id="v105Available">—</strong></div><div class="v105-kpi"><small>Saldo pendiente</small><strong id="v105Pending">—</strong></div><div class="v105-kpi"><small>Estado</small><strong id="v105State">—</strong></div></div>'+
        '<div class="v105-card"><h3>Cuenta de pagos</h3><div class="v105-muted">Cuenta conectada: '+esc2(st.account.id)+'</div><div class="v105-actions"><button class="secondary" id="v105Onboard">Completar configuración</button><button class="secondary" id="v105Refresh">Actualizar</button></div></div>'+
        '<div class="v105-card"><h3>Reembolsos y reclamos</h3><div class="v105-muted">El negocio decide. SWEETLAB ejecuta la operación en Stripe sin que tengas que entrar a Stripe.</div><div id="v105Refunds" class="v105-empty" style="margin-top:10px">Cargando pagos…</div></div>'+
        '<div class="v105-card"><h3>Agregar fondos para reembolsos</h3><p class="v105-muted">Si no tienes saldo suficiente, aquí puedes iniciar una carga de fondos. El monto se acredita al saldo del negocio una vez liquidado.</p><label>Monto a agregar<input id="v105FundAmount" type="number" min="1" step="0.01" placeholder="1700"></label><div class="v105-actions"><button class="primary" id="v105Fund">Agregar fondos</button></div></div>'+
        '<div class="v105-card"><h3>Disputas / contracargos</h3><div id="v105Disputes" class="v105-empty">Cargando…</div></div>';
      async function refresh(){
        const s=await call("status");document.getElementById("v105Available").textContent=money(s.available_mxn);document.getElementById("v105Pending").textContent=money(s.pending_mxn);document.getElementById("v105State").textContent=s.account.payouts_enabled&&s.account.charges_enabled?"Activo":"Pendiente";
        const ps=await call("payments");const rows=ps.payments||[];
        const rr=await call("list_funding");const refunds=rows.filter(x=>x.status==="succeeded"||x.status==="paid"||x.status==="pending");
        document.getElementById("v105Refunds").innerHTML=refunds.length?refunds.map(p=>'<div class="v105-row"><div><b>'+esc2(p.description||"Pago")+'</b><div class="v105-muted">'+money(p.amount)+' · '+esc2(p.status)+'</div></div><button class="secondary" data-refund="'+esc2(p.id)+'">Solicitar reembolso</button></div>').join(""):'<div class="v105-empty">Todavía no hay pagos registrados.</div>';
        document.querySelectorAll("[data-refund]").forEach(b=>b.onclick=async()=>{const p=rows.find(x=>x.id===b.dataset.refund);if(!p)return;const amount=prompt("Monto del reembolso:",String(p.amount));if(!amount)return;const reason=prompt("Motivo (opcional):","requested_by_customer")||"requested_by_customer";b.disabled=true;try{await call("refund",{payment_id:p.id,amount:Number(amount),reason});toast2("Reembolso enviado");await refresh()}catch(e){if(e.message.includes("Fondos insuficientes")){const ok=confirm(e.message+"\n\n¿Quieres agregar fondos ahora?");if(ok){document.getElementById("v105FundAmount").value=Math.max(0,Number(p.amount)-Number(s.available_mxn||0)).toFixed(2);document.getElementById("v105FundAmount").focus()}}else toast2(e.message)}finally{b.disabled=false}});
        const ds=await call("disputes");document.getElementById("v105Disputes").innerHTML=(ds.disputes||[]).length?(ds.disputes||[]).map(d=>'<div class="v105-row"><div><b>'+esc2(d.reason||"Disputa")+'</b><div class="v105-muted">'+money(pesos(d.amount))+' · '+esc2(d.status)+'</div></div><span class="v105-status">'+esc2(d.status)+'</span></div>').join(""):'<div class="v105-empty">No hay disputas activas.</div>';
      }
      document.getElementById("v105Onboard").onclick=continueOnboarding;document.getElementById("v105Refresh").onclick=refresh;
      document.getElementById("v105Fund").onclick=async()=>{const amount=Number(document.getElementById("v105FundAmount").value);if(!amount||amount<=0)return toast2("Escribe un monto válido.");try{const r=await call("funding_checkout",{amount});location.href=r.url}catch(e){toast2(e.message)}};
      await refresh();
    }catch(e){body.innerHTML='<div class="v105-card"><h3>No se pudo cargar pagos</h3><div class="v105-muted">'+esc2(e.message)+'</div></div>'}
  }
  async function continueOnboarding(){try{const r=await call("onboarding_link");if(r.url)location.href=r.url}catch(e){toast2(e.message)}}
  const old=window.renderProfile;
  window.renderProfile=async function(tab){if(tab==="payments")return renderPayments();return old?old(tab):undefined};
  window.DENYAPayments={render:renderPayments,call};
})();