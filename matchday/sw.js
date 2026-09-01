self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  const isHome=u.origin===location.origin&&(u.pathname==='/matchday/'||u.pathname==='/matchday/index.html');
  if(!isHome||e.request.mode!=='navigate')return;
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{
    let html=await r.text();
    html=html.replace('<div class="calendar" id="calendar"></div></div><div class="card note">','<div class="calendar" id="calendar"></div><div class="legend"><span>• Horario</span><span>♡ Match Time</span></div></div><div class="card note">');
    html=html.replace("function renderCalendar(){let y=calDate.getFullYear(),m=calDate.getMonth();$('calTitle').textContent=new Date(y,m,1).toLocaleDateString('es-MX',{month:'long',year:'numeric'});let f=new Date(y,m,1),off=(f.getDay()+6)%7,last=new Date(y,m+1,0).getDate(),html='';for(let i=0;i<42;i++){let n=i-off+1,d=new Date(y,m,n),out=n<1||n>last;html+=`<div class=\"day ${out?'out':''}\">${d.getDate()}</div>`}$('calendar').innerHTML=html}","function renderCalendar(){let y=calDate.getFullYear(),m=calDate.getMonth();$('calTitle').textContent=new Date(y,m,1).toLocaleDateString('es-MX',{month:'long',year:'numeric'});let f=new Date(y,m,1),off=(f.getDay()+6)%7,last=new Date(y,m+1,0).getDate(),today=new Date(),html='';for(let i=0;i<42;i++){let n=i-off+1,d=new Date(y,m,n),out=n<1||n>last,dow=d.getDay(),isToday=!out&&d.toDateString()===today.toDateString(),busy=!out&&allSchedules.some(s=>+s.day_of_week===dow),match=!out&&partnerId&&matchForDay(dow).length>0;html+=`<div class=\"day ${out?'out':''} ${isToday?'today':''} ${busy?'hasBusy':''} ${match?'match':''}\">${d.getDate()}</div>`}$('calendar').innerHTML=html}");
    html=html.replace('<div class="sectionTitle">Nuestro calendario ♡</div>','<div class="card" onclick="location.href=\'mascota.html\'" style="display:flex;align-items:center;gap:14px;background:linear-gradient(145deg,#fff8f5,#f2d8d9);cursor:pointer"><div style="font-size:58px">🐻</div><div><div class="kicker">Nuestra racha 🔥</div><div style="font-family:Georgia,serif;font-size:20px;color:var(--deep);font-weight:bold">Mochi</div><div class="mini">Tócame para ver nuestra racha ♡</div></div></div><div class="sectionTitle">Nuestro calendario ♡</div>');
    return new Response(html,{status:r.status,statusText:r.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
  }).catch(()=>fetch(e.request)));
});