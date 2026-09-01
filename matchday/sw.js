self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  const isHome=u.origin===location.origin&&(u.pathname==='/matchday/'||u.pathname==='/matchday/index.html');
  if(!isHome||e.request.mode!=='navigate')return;
  e.respondWith(fetch(e.request).then(async r=>{
    let html=await r.text();
    html=html.replace('<button class="btn primary full" disabled>Encontrar una cita — próximamente</button>','<button class="btn primary full" onclick="location.href=\'date-matcher.html\'">Encontrar nuestra cita ❤️</button>');
    return new Response(html,{status:r.status,statusText:r.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
  }).catch(()=>fetch(e.request)));
});