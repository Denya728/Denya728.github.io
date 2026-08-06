/* DENYA public renderer v2 — compatible con DENYA Site Studio. */
(function(){
  const API='https://denya-admin.denicake728.workers.dev/api/public/content';
  const pageOrder=[['home',''],['products','Productos'],['events','Eventos'],['promotions','Promociones'],['about','Nuestra historia']];
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const color=(value,fallback)=>/^#[0-9a-f]{6}$/i.test(String(value||''))?value:fallback;
  const safeUrl=value=>{try{const url=new URL(String(value||'#'),location.href);return ['http:','https:'].includes(url.protocol)?url.href:'#'}catch{return'#'}};
  const image=value=>{const url=String(value||'');return /^(data:image\/(png|jpeg|webp|gif);base64,|https?:\/\/)/i.test(url)?url:''};
  function blockHtml(block){
    const c=block.content||{},type=block.block_type||'text',width=['full','half','third'].includes(c.width)?c.width:'full',align=['left','center','right'].includes(c.align)?c.align:'left';
    const style=`--block-bg:${color(c.background,'#fff')};--block-color:${color(c.color,'#211d1b')};--block-align:${align};--block-radius:${Math.max(0,Math.min(48,Number(c.radius)||24))}px;--block-padding:${Math.max(8,Math.min(64,Number(c.padding)||28))}px`;
    const rolcyPose=window.DENYA_ROLCY_POSES?.[c.pose||'principal']||'';
    const mainImage=image(c.imageUrl||(type==='mascot'?rolcyPose:'')),gallery=Array.isArray(c.galleryImages)?c.galleryImages.map(image).filter(Boolean):[];
    const title=c.title?`<h2>${escape(c.title)}</h2>`:'',text=c.text?`<p>${escape(c.text)}</p>`:'',price=c.price?`<strong class="site-price">${escape(c.price)}</strong>`:'';
    const cta=c.ctaLabel?`<a class="site-cta" href="${escape(safeUrl(c.ctaUrl))}" rel="noopener">${escape(c.ctaLabel)}</a>`:'';
    const media=mainImage?`<img class="site-image ${type==='mascot'?`site-mascot motion-${escape(c.motion||'none')}`:''}" src="${escape(mainImage)}" alt="${escape(c.title||'DENYA')}">`:'';
    const galleryHtml=gallery.length?`<div class="site-gallery">${gallery.map(url=>`<img src="${escape(url)}" alt="">`).join('')}</div>`:'';
    return `<article class="site-block ${escape(type)} ${width}" style="${style}">${media}${galleryHtml}<div class="site-copy">${title}${text}${price}${cta}</div></article>`;
  }
  async function fetchPage(brand,page){
    const response=await fetch(`${API}?brand=${encodeURIComponent(brand)}&page=${encodeURIComponent(page)}`,{cache:'no-store'});if(!response.ok)return[];const data=await response.json();return Array.isArray(data.blocks)?data.blocks:[];
  }
  async function renderBrand(brand){
    const section=document.getElementById(brand),root=document.getElementById(`${brand}-managed`);if(!section||!root)return;
    try{
      const groups=await Promise.all(pageOrder.map(async([key,label])=>({key,label,blocks:await fetchPage(brand,key)})));
      if(!groups.some(group=>group.blocks.length))return;
      [...section.children].forEach(child=>{if(child!==root)child.hidden=true});root.hidden=false;
      root.classList.add('denya-site-grid');
      root.innerHTML=groups.filter(group=>group.blocks.length).map(group=>`<div class="site-page-group" data-page="${group.key}">${group.label?`<h2 class="site-section-title">${group.label}</h2>`:''}<div class="site-grid">${group.blocks.map(blockHtml).join('')}</div></div>`).join('');
    }catch(error){console.warn('DENYA Site Studio:',error)}
  }
  const styles=document.createElement('style');styles.textContent=`
    .page{max-width:1240px;padding:0 22px}.denya-site-grid{display:grid;gap:55px}.site-page-group{display:grid;gap:20px}.site-section-title{text-align:left;font-size:clamp(32px,5vw,58px);margin:0}.site-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-auto-flow:row dense;gap:18px}.site-block{grid-column:span 12;background:var(--block-bg);color:var(--block-color);text-align:var(--block-align);border-radius:var(--block-radius);padding:var(--block-padding);box-shadow:0 16px 42px rgba(59,38,29,.1);overflow:hidden;align-content:center}.site-block.half{grid-column:span 6}.site-block.third{grid-column:span 4}.site-block h2{font-size:clamp(28px,4vw,54px);margin:0 0 10px}.site-block p{font-size:clamp(16px,1.8vw,20px)}.site-image{width:100%;max-height:520px;object-fit:cover;border-radius:calc(var(--block-radius) * .7);display:block;margin:0 0 20px}.site-price{display:block;color:#a98213;font-size:clamp(23px,3vw,36px);margin:12px 0}.site-cta{display:inline-block;background:#3b261d;color:#fff;text-decoration:none;border-radius:999px;padding:14px 22px;font-weight:800;margin-top:12px}.site-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.site-gallery img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:18px}.site-mascot{max-width:260px;object-fit:contain;margin:0 auto 14px}.motion-walk{animation:denyaWalk 8s ease-in-out infinite}.motion-float{animation:denyaFloat 2.5s ease-in-out infinite}.motion-wave{animation:denyaWave 1.6s ease-in-out infinite;transform-origin:bottom center}@keyframes denyaWalk{0%,100%{transform:translateX(-32%)}50%{transform:translateX(32%)}}@keyframes denyaFloat{50%{transform:translateY(-14px)}}@keyframes denyaWave{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(4deg)}}
    @media(max-width:760px){.page{padding:0;max-width:520px}.site-block,.site-block.half,.site-block.third{grid-column:span 12}.site-gallery{grid-template-columns:1fr 1fr}.site-grid{gap:14px}.denya-site-grid{gap:38px}}
    @media(prefers-reduced-motion:reduce){.motion-walk,.motion-float,.motion-wave{animation:none}}
  `;document.head.appendChild(styles);
  Promise.all([renderBrand('denicake'),renderBrand('denicrunch')]);
})();
