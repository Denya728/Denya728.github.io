(function(){
const URL='https://kcinhsldmnvhudivutzv.supabase.co';
const KEY='sb_publishable_XZ4dtZehhFZkklDkdLuW0g_KE_Gd8Cs';
const SK='denya_admin_session';
const hdr=t=>({apikey:KEY,Authorization:'Bearer '+(t||KEY),'Content-Type':'application/json'});
const get=()=>{try{return JSON.parse(localStorage.getItem(SK)||'null')}catch(e){return null}};
const put=s=>localStorage.setItem(SK,JSON.stringify(s));
async function req(path,opt={}){const r=await fetch(URL+path,{...opt,headers:{...hdr(opt.token),...(opt.headers||{})}});let d=null;try{d=await r.json()}catch(e){}if(!r.ok)return {data:null,error:new Error(d?.msg||d?.message||d?.error_description||d?.error||('HTTP '+r.status))};return {data:d,error:null}}
const auth={
async signInWithPassword(x){const r=await req('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:x.email,password:x.password})});if(r.error)return r;const s={...r.data,expires_at:Math.floor(Date.now()/1000)+(r.data.expires_in||3600)};put(s);return {data:s,error:null}},
async getSession(){let s=get();if(!s?.access_token)return {data:{session:null},error:null};if(!s.expires_at||s.expires_at>Date.now()/1000+60)return {data:{session:s},error:null};if(s.refresh_token){const r=await req('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:s.refresh_token})});if(!r.error){s={...r.data,expires_at:Math.floor(Date.now()/1000)+(r.data.expires_in||3600)};put(s);return {data:{session:s},error:null}}}localStorage.removeItem(SK);return {data:{session:null},error:null}},
async signOut(){localStorage.removeItem(SK);return {error:null}}};
function from(table){let cols='*',filters=[],ord='',method='GET',body;
const q={select(v){cols=v||'*';return q},order(c,o={}){ord=c+'='+(o.ascending===false?'desc':'asc');return q},eq(c,v){filters.push(c+'=eq.'+encodeURIComponent(v));return q},update(v){method='PATCH';body=v;return q},insert(v){method='POST';body=v;return q},single(){return run().then(r=>r.error?r:{data:Array.isArray(r.data)?(r.data[0]||null):r.data,error:null})}};
async function run(){const s=get();if(!s?.access_token)return {data:null,error:new Error('Sesión no disponible.')};let p='/rest/v1/'+table+'?select='+encodeURIComponent(cols);if(ord)p+='&order='+ord;filters.forEach(f=>p+='&'+f);return req(p,{method,body:body===undefined?undefined:JSON.stringify(body),token:s.access_token})};
q.then=(a,b)=>run().then(a,b);return q}
async function rpc(n,args={}){const s=get();if(!s?.access_token)return {data:null,error:new Error('Sesión no disponible.')};return req('/rest/v1/rpc/'+encodeURIComponent(n),{method:'POST',body:JSON.stringify(args),token:s.access_token})}
async function invoke(n,x={}){const s=get();if(!s?.access_token)return {data:null,error:new Error('Sesión no disponible.')};return req('/functions/v1/'+encodeURIComponent(n),{method:'POST',body:JSON.stringify(x.body||{}),token:s.access_token})}
window.supabase={createClient:()=>({auth,from,rpc,functions:{invoke}})};
})();