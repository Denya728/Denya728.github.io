(function(){
  const URL='https://kcinhsldmnvhudivutzv.supabase.co';
  const KEY='sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs';
  function token(){
    for(const k of Object.keys(localStorage)){
      if(!/^sb-.+-auth-token$/.test(k))continue;
      try{const x=JSON.parse(localStorage.getItem(k)||'null');if(x?.access_token)return x.access_token}catch{}
    }
    return null;
  }
  async function isAdmin(){
    const t=token();if(!t)return false;
    const r=await fetch(URL+'/rest/v1/rpc/is_platform_admin',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:'{}'});
    return r.ok&&(await r.json())===true;
  }
  async function mount(){
    try{
      if(!(await isAdmin()))return;
      const nav=document.querySelector('.nav');if(!nav||document.getElementById('denyaAdminLink'))return;
      const divider=document.createElement('div');divider.className='nav-divider';
      const link=document.createElement('a');link.id='denyaAdminLink';link.href='./admin.html';link.textContent='Administración';link.style.cssText='display:block;text-decoration:none;color:inherit;padding:11px 14px;border-radius:10px;font-weight:800;margin-top:4px';
      nav.appendChild(divider);nav.appendChild(link);
    }catch(e){}
  }
  setTimeout(mount,700);
  setTimeout(mount,2000);
})();