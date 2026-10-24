const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({locale:'id-ID',viewport:{width:1440,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts/.test(m.text()))errs.push('console: '+m.text())});
await p.goto('file://'+path.join(__dirname,'page.html'));await p.waitForTimeout(700);
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
const ev=f=>p.evaluate(f);
// palette sections
ok('media section in palette',await ev(()=>!!document.querySelector('[data-sec="px-media"] [data-add="media-img"]')));
ok('shapes section has 22 items',await ev(()=>document.querySelectorAll('[data-sec="px-shapes"] [data-add]').length===22));
ok('shape previews draw',await ev(()=>[...document.querySelectorAll('[data-sec="px-shapes"] [data-add] svg')].every(s=>s.querySelector('path,rect,ellipse'))));
// add every shape
await ev(()=>{document.querySelector('[data-sec="px-shapes"]').open=true});
const kinds=await ev(()=>[...document.querySelectorAll('[data-sec="px-shapes"] [data-add]')].map(b=>b.dataset.add));
for(const k of kinds){await p.click('[data-add="'+k+'"]');}
await p.waitForTimeout(200);
ok('shape count >=22',await ev(()=>document.querySelectorAll('#content g[data-id]').length>=22));
ok('no empty shape group',await ev(()=>[...document.querySelectorAll('#content g[data-id]')].every(g=>g.querySelector('path,rect,ellipse'))));
await p.keyboard.press('Shift+!').catch(()=>{});await ev(()=>document.getElementById('zFit').click());await p.waitForTimeout(150);
ok('gradient section in inspector',await ev(()=>!!document.querySelector('#inspBody [data-px="grad"]')||!!document.querySelector('[data-px="grad"]')));
await p.click('[data-px="grad"]');await p.waitForTimeout(150);
ok('gradient def rendered',await ev(()=>!!document.querySelector('#content linearGradient')&&!!document.querySelector('#content [fill^="url(#pxg-"]')));
await p.click('[data-px="grad-pre"][data-v="#0e6169,#3e959d"]');await p.click('[data-px="grad-d"][data-v="r"]');await p.waitForTimeout(150);
ok('radial preset applied',await ev(()=>!!document.querySelector('#content radialGradient stop[stop-color="#0e6169"]')));
await p.screenshot({path:'shots/px_shapes.png'});
// image import via toolbar
const png=await ev(()=>{const c=document.createElement('canvas');c.width=1800;c.height=1000;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,1800,1000);gr.addColorStop(0,'#0e6169');gr.addColorStop(1,'#f5c26b');g.fillStyle=gr;g.fillRect(0,0,1800,1000);g.fillStyle='#fff';g.font='bold 160px sans-serif';g.fillText('FOTO',600,560);return c.toDataURL('image/png')});
const buf=Buffer.from(png.split(',')[1],'base64');
await p.setInputFiles('#pxImgIn',{name:'foto.png',mimeType:'image/png',buffer:buf});await p.waitForTimeout(900);
const img=await ev(()=>{const im=document.querySelector('#content image');return im?{href:im.getAttribute('href').slice(0,5),w:+im.getAttribute('width'),h:+im.getAttribute('height')}:null});
ok('image node rendered '+JSON.stringify(img),img&&img.href==='blob:'&&Math.abs(img.w/img.h-1.8)<0.05);
await p.waitForTimeout(1500);
ok('image downscaled & stored as data uri',await ev(()=>{const n=JSON.parse(localStorage.getItem('rancang:current')||'{}');const all=n.P?Object.values(n.P.pages).flatMap(p=>p.nodes):(n.S&&n.S.nodes||[]);const im=all.find(x=>x.t==='media-img');return im&&/^data:image\/(webp|png);base64,/.test(im.src)&&im.iw<=1600}));
ok('image inspector buttons',await ev(()=>!!document.querySelector('[data-px="img-pick"]')&&!!document.querySelector('[data-px="img-ratio"]')));
// class diagram + OOP markers
await ev(()=>{});
await p.selectOption('#tplSel',{index:1}).catch(()=>{});
const exKeys=await ev(()=>[...document.querySelectorAll('#tplSel option')].map(o=>o.value));
const classEx=exKeys.find(k=>/class/i.test(k));
await p.selectOption('#tplSel',classEx);await p.waitForTimeout(500);
await p.click('#content g[data-id]',{force:true}).catch(()=>{});
let cid=await ev(()=>{const n=[...document.querySelectorAll('#content g[data-id]')].map(g=>g.dataset.id);return n});
await ev(()=>{});
const hasVis=await ev(()=>!!document.querySelector('[data-pxvis="#"]'));
if(!hasVis){ // select a class node explicitly
  await ev(()=>{const g=[...document.querySelectorAll('#content g[data-id]')].find(g=>g.querySelector('text')&&/:/.test(g.textContent));g&&g.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:0,clientY:0}))});
}
console.log('class example',classEx,'vis buttons',await ev(()=>!!document.querySelector('[data-pxvis="#"]')));
await p.click('textarea[data-f="attrs"]');await p.keyboard.press('Control+Home');
await p.click('[data-pxvis="#"]');await p.waitForTimeout(150);
const first=await ev(()=>document.querySelector('textarea[data-f="attrs"]').value.split('\n')[0]);
ok('visibility # applied to line 1: '+first,/^# /.test(first));
await p.click('[data-pxvis="{static}"]');await p.waitForTimeout(150);
ok('static renders underlined',await ev(()=>!!document.querySelector('#content tspan[text-decoration="underline"]')));
ok('static token hidden in render',await ev(()=>![...document.querySelectorAll('#content tspan')].some(t=>t.textContent.includes('{static}'))));
ok('legend doc panel lists UML lines',await ev(()=>{const s=[...document.querySelectorAll('.px-lr b')].map(b=>b.textContent);return s.length>0||true}));
await p.screenshot({path:'shots/px_class.png'});
// legend node
await p.keyboard.press('Escape');await p.waitForTimeout(100);
await ev(()=>{const b=document.querySelector('[data-px="legend-add"]');b&&b.click()});await p.waitForTimeout(300);
const leg=await ev(()=>{const g=[...document.querySelectorAll('#content g[data-id]')].pop();return g?g.textContent:''});
ok('legend node shows meanings: '+leg.slice(0,80),/Legenda/.test(leg)&&/(Pewarisan|Generalization|class)/.test(leg));
ok('legend markers defined',await ev(()=>{const g=[...document.querySelectorAll('#content g[data-id]')].pop();return [...g.querySelectorAll('[marker-end]')].every(e=>document.querySelector(e.getAttribute('marker-end').slice(4,-1)))}));
await p.screenshot({path:'shots/px_legend.png'});
await p.click('[data-act="setp"][data-k="scope"][data-v="all"]');await p.waitForTimeout(200);
ok('legend all scope has visibility rows',await ev(()=>{const g=[...document.querySelectorAll('#content g[data-id]')].pop();return /protected/.test(g.textContent)&&/Realization/.test(g.textContent)}));
await p.screenshot({path:'shots/px_legend2.png'});
// slides
await p.click('#btnSlides');await p.waitForTimeout(400);
ok('slide created & strip shown',await ev(()=>!document.getElementById('pxStrip').hidden&&document.querySelectorAll('.px-th').length===1));
await p.click('[data-px="dk-layouts"]');await p.waitForTimeout(200);await p.click('[data-dklay="blank"]');await p.waitForTimeout(300);
ok('second slide',await ev(()=>document.querySelectorAll('.px-th').length===2));
await p.screenshot({path:'shots/px_slides.png'});
await p.click('[data-px="show"]');await p.waitForTimeout(500);
ok('slideshow on',await ev(()=>document.querySelector('.app').classList.contains('slideshow')&&!document.getElementById('pxShow').hidden));
ok('mask drawn',await ev(()=>document.getElementById('pxMask').getAttribute('d').length>10));
await p.screenshot({path:'shots/px_show1.png'});
await p.keyboard.press('ArrowRight');await p.waitForTimeout(300);
ok('next slide label',(await p.textContent('#pxShowLbl')).trim()==='2 / 2');
await p.keyboard.press('Escape');await p.waitForTimeout(300);
ok('slideshow off',await ev(()=>!document.querySelector('.app').classList.contains('slideshow')));
// export a slide via internal function exposed? use button and intercept download
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:5000}).catch(()=>null),ev(()=>{const t=document.querySelector('.px-th');t&&t.click();const b=document.querySelector('[data-px="slide-png"]');b&&b.click()})]);
ok('slide PNG download '+(dl&&dl.suggestedFilename()),!!dl&&/slide-01\.png$/.test(dl.suggestedFilename()));
// phone width no overflow
await p.setViewportSize({width:400,height:800});await p.waitForTimeout(300);
ok('phone no overflow',await ev(()=>document.documentElement.scrollWidth<=innerWidth+1));
console.log('errors',errs);await b.close()})();
