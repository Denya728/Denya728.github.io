(()=>{
  const VERSION='2026-09-04.1';
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const moodMap={green:['😄','Bien'],yellow:['😕','Regular'],red:['😢','Necesita apoyo']};
  const needMap={hug:['🫂','Quiere un abrazo'],space:['🌿','Necesita espacio'],talk:['💬','Quiere platicar'],food:['🍜','Quiere comidita'],distract:['🎮','Quiere distraerse'],calm:['🕯️','Quiere un plan tranquilo']};
  const localDate=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};
  const prettyDate=()=>new Date().toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'});
  const esc=s=>String(s??'');

  function addStyles(){
    if(document.getElementById('homeV2Styles'))return;
    const s=document.createElement('style');
    s.id='homeV2Styles';
    s.textContent=`
      .dayV2{position:relative;overflow:hidden;background:linear-gradient(145deg,#fffaf8 0%,#f7e6e5 100%);border:1px solid #e6cbc9;box-shadow:0 14px 34px rgba(126,48,60,.09);padding:18px}
      .dayV2:after{content:'♡';position:absolute;right:-7px;top:-35px;font:130px Georgia;color:rgba(169,70,82,.055);pointer-events:none}
      .dayHead{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;position:relative;z-index:1}
      .dayDate{font:700 25px Georgia;color:var(--deep);margin-top:4px;text-transform:capitalize}
      .dayMochi{font-size:44px;line-height:1}
      .dayPeople{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0 8px;position:relative;z-index:1}
      .dayPerson{background:rgba(255,255,255,.78);border:1px solid var(--line);border-radius:18px;padding:11px;min-width:0}
      .dayPersonTop{display:flex;gap:8px;align-items:center}.dayFace{font-size:27px}.dayWho{font-weight:900;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.dayState{font-size:11px;color:var(--muted);margin-top:2px}
      .daySignals{display:grid;gap:7px;margin-top:10px;position:relative;z-index:1}
      .daySignal{display:flex;align-items:center;gap:9px;background:rgba(255,255,255,.68);border-radius:15px;padding:10px 11px;font-size:12px;line-height:1.35}.daySignal b{color:var(--deep)}
      .daySignalIcon{font-size:21px;min-width:24px;text-align:center}
      .dayRec{margin-top:12px;background:var(--deep);color:white;border-radius:18px;padding:13px 14px;position:relative;z-index:1}.dayRec .k{color:#f4cfd1}.dayRecTitle{font:700 17px Georgia;margin:4px 0}.dayRecMini{font-size:11px;line-height:1.45;opacity:.86}
      .dayActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;position:relative;z-index:1}.dayActions button{min-height:42px}
      .dayUnread{position:absolute;right:12px;bottom:12px;background:var(--cherry);color:white;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:900;z-index:2}
      .daySoft{background:white!important;color:var(--deep)!important;border:1px solid #e4ccca!important}
      @media(max-width:360px){.dayPeople{grid-template-columns:1fr}.dayDate{font-size:22px}}
    `;
    document.head.appendChild(s);
  }

  function ensureCard(){
    const home=document.getElementById('home'),hello=document.getElementById('hello');
    if(!home||!hello)return null;
    let card=document.getElementById('ourDayV2');
    if(card)return card;
    card=document.createElement('div');
    card.id='ourDayV2';
    card.className='card dayV2';
    card.innerHTML=`<div class="dayHead"><div><div class="k">NUESTRO DÍA ♡</div><div class="dayDate" id="dayDateV2">Hoy</div></div><div class="dayMochi" id="dayMochiV2">🐻💗</div></div><div class="dayPeople"><div class="dayPerson"><div class="dayPersonTop"><span class="dayFace" id="dayMyFace">♡</span><div><div class="dayWho" id="dayMyWho">Tú</div><div class="dayState" id="dayMyState">Sin actualizar</div></div></div></div><div class="dayPerson"><div class="dayPersonTop"><span class="dayFace" id="dayPartnerFace">♡</span><div><div class="dayWho" id="dayPartnerWho">Tu persona</div><div class="dayState" id="dayPartnerState">Sin actualizar</div></div></div></div></div><div class="daySignals" id="daySignalsV2"></div><div class="dayRec"><div class="k">MOCHI RECOMIENDA</div><div class="dayRecTitle" id="dayRecTitleV2">Un ratito para ustedes</div><div class="dayRecMini" id="dayRecMiniV2">Estoy viendo cómo viene su día.</div></div><div class="dayActions"><button class="btn" id="dayPlanV2">Ver Match Time ✦</button><button class="btn daySoft" id="dayNotesV2">Recaditos 💌</button></div><div class="dayUnread hidden" id="dayUnreadV2"></div>`;
    hello.insertAdjacentElement('afterend',card);
    document.getElementById('dayPlanV2').onclick=()=>location.href='date-matcher.html';
    document.getElementById('dayNotesV2').onclick=()=>location.href='recaditos.html';
    return card;
  }

  function text(id,value){const el=document.getElementById(id);if(el)el.textContent=value}

  async function unreadCount(){
    try{
      if(typeof sb==='undefined'||!cid||!me?.id)return 0;
      const {count,error}=await sb.from('notes').select('id',{count:'exact',head:true}).eq('couple_id',cid).neq('author_id',me.id).is('read_at',null);
      return error?0:(count||0);
    }catch{return 0}
  }

  function todaysMood(userId){
    if(!Array.isArray(eng)||!userId)return null;
    return eng.find(x=>x.user_id===userId&&String(x.updated_at||'').slice(0,10)===localDate())||eng.find(x=>x.user_id===userId)||null;
  }
  function todaysNeed(userId){return Array.isArray(care)?care.find(x=>x.user_id===userId&&x.need_date===localDate()):null}

  function todayMatch(){
    try{
      const slots=typeof overlap==='function'?overlap(new Date()):[];
      const now=new Date(),m=now.getHours()*60+now.getMinutes();
      const slot=slots.find(x=>x[1]>m&&x[1]-Math.max(x[0],m)>=30)||slots.find(x=>x[1]>m);
      if(!slot)return null;
      const start=Math.max(slot[0],m),duration=Math.max(0,slot[1]-start);
      return {start,duration};
    }catch{return null}
  }

  async function render(){
    addStyles();if(!ensureCard())return;
    if(typeof me==='undefined'||!me?.id)return;
    text('dayDateV2',prettyDate());
    text('dayMyWho',myProfile?.name||'Tú');
    text('dayPartnerWho',partnerProfile?.name||'Tu persona');
    const mine=todaysMood(me.id),other=todaysMood(typeof partner==='string'?partner:partner?.user_id||partner),otherNeed=todaysNeed(typeof partner==='string'?partner:partner?.user_id||partner);
    const mm=mine?moodMap[mine.level]:null,om=other?moodMap[other.level]:null;
    text('dayMyFace',mm?.[0]||'♡'); text('dayMyState',mm?.[1]||'Sin actualizar');
    text('dayPartnerFace',om?.[0]||'♡'); text('dayPartnerState',om?.[1]||'Sin actualizar');
    const sig=document.getElementById('daySignalsV2');sig.replaceChildren();
    const add=(icon,label,value)=>{const d=document.createElement('div');d.className='daySignal';const i=document.createElement('span');i.className='daySignalIcon';i.textContent=icon;const t=document.createElement('div');const b=document.createElement('b');b.textContent=label+' ';t.append(b,document.createTextNode(value));d.append(i,t);sig.appendChild(d)};
    if(otherNeed){const n=needMap[otherNeed.need_key]||['💗','Necesita cariño'];add(n[0],partnerProfile?.name||'Tu persona',n[1].replace(/^./,c=>c.toLowerCase()))}
    const slot=todayMatch();
    if(slot){const h=Math.floor(slot.duration/60),min=slot.duration%60;add('⏰','Match Time hoy',`${h?h+' h ':''}${min?min+' min':''} disponibles`)}
    else add('📅','Match Time','Hoy no veo un hueco claro todavía');
    const unread=await unreadCount(),badge=document.getElementById('dayUnreadV2');
    if(unread){badge.textContent=`${unread} nuevo${unread===1?'':'s'}`;badge.classList.remove('hidden')}else badge.classList.add('hidden');
    let title='Un ratito juntos también cuenta',mini='No necesitan un plan enorme para hacer tiempo para ustedes.',mochi='🐻💗';
    if(otherNeed?.need_key==='hug'){title='Abrazo primero, plan después 🫂';mini='Tu persona pidió cercanía hoy. Mochi vota por algo cálido y sin prisas.';mochi='🐻🫂'}
    else if(otherNeed?.need_key==='space'){title='Cariño sin presionar 🌿';mini='Hoy conviene dar espacio y dejar una señal bonita de que estás ahí.';mochi='🐻🌿'}
    else if(otherNeed?.need_key==='talk'){title='Un espacio para platicar 💬';mini='Algo tranquilo donde puedan hablar sin sentir que tienen que hacer demasiado.';mochi='🐻💬'}
    else if(otherNeed?.need_key==='food'){title='Comidita + ustedes 🍜';mini='Mochi recomienda algo rico y fácil; cuidar también puede ser una cita.';mochi='🐻🍜'}
    else if(other?.level==='red'){title='Hoy toca cuidarse 🫶';mini='Poquita presión, mucho cariño y un plan suave si ambos tienen energía.';mochi='🐻🫶'}
    else if(other?.level==='yellow'||mine?.level==='yellow'){title='Plan leve, corazón lleno 🕯️';mini='Un plan corto y cómodo encaja mejor con la energía de hoy.';mochi='🐻🕯️'}
    else if(slot&&slot.duration>=120){title='Sí tienen tiempo para un Match ✦';mini='Hay un buen bloque libre hoy. Pueden convertirlo en una cita sin complicarse.';mochi='🐻✨'}
    if(unread){mini+=` Además, tienes ${unread} recadito${unread===1?'':'s'} por ver.`}
    text('dayRecTitleV2',title);text('dayRecMiniV2',mini);text('dayMochiV2',mochi);
    const plan=document.getElementById('dayPlanV2');
    plan.textContent=slot?'Usar este Match Time ❤️':'Buscar próxima cita ✦';
  }

  async function boot(){
    addStyles();ensureCard();
    for(let i=0;i<30;i++){
      try{if(typeof me!=='undefined'&&me?.id&&typeof cid!=='undefined'&&cid){await render();break}}catch{}
      await sleep(250);
    }
    try{
      if(typeof window.load==='function'&&!window.load.__homeV2){
        const original=window.load;
        const wrapped=async function(...args){const out=await original.apply(this,args);await render();return out};
        wrapped.__homeV2=true;window.load=wrapped;
      }
    }catch{}
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
    setInterval(render,60000);
  }
  boot();
})();