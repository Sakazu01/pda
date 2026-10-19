const { chromium } = require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});const p=await ctx.newPage();
await p.route(/pptxgen\.bundle\.js/,r=>r.fulfill({path:require.resolve('pptxgenjs/dist/pptxgen.bundle.js'),contentType:'application/javascript',headers:{'Access-Control-Allow-Origin':'*'}}));
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|ERR_NAME|net::/.test(m.text()))errs.push('console: '+m.text())});
await p.goto('file://'+path.join(__dirname,'page.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(700);
let pass=0,fail=0;const ok=(n,c)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+n)};const ev=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
await p.click('#btnLib');await W(150);await p.click('#libNew');await W(300);
await p.click('#vPrd');await p.click('#prdTpl');await p.click('#prdBuild');await W(500);
await p.keyboard.press('Control+k');await p.keyboard.type('pitch deck');await W(150);await p.keyboard.press('Enter');await W(400);
ok('on deck page',await ev(()=>document.querySelector('#dtChips [aria-pressed="true"]').dataset.dt)==='deck');
await p.click('#btnSlides');await W(400);await p.click('[data-dklay="blank"]');await W(300);
ok('strip shows PPTX + layout button',await ev(()=>!!document.querySelector('#pxStrip [data-px="pptx"]')&&!!document.querySelector('#pxStrip [data-px="dk-layouts"]')));
// palette & logo
const logo=await ev(()=>{const c=document.createElement('canvas');c.width=300;c.height=88;const g=c.getContext('2d');g.fillStyle='#e03131';g.beginPath();g.roundRect(0,0,300,88,22);g.fill();g.fillStyle='#fff';g.font='bold 44px sans-serif';g.fillText('SILATIK',70,60);return c.toDataURL('image/png')});
await ev(()=>{const g=document.querySelector('#content g[data-id]');});
for(const lay of ['cover','features','problem','stats','chart','finance','timeline','cards3','twocol','team','close']){await p.click('#pxStrip [data-px="dk-layouts"]');await W(150);await p.click('[data-dklay="'+lay+'"]');await W(250)}
const n=await ev(()=>document.querySelectorAll('.px-th').length);ok('slides created: '+n,n===12);
// select first content slide via thumbnail then set deck colors via preset + logo via file chooser
await p.click('.px-th:nth-child(3)');await W(300);
ok('slide inspector has deck style',await ev(()=>!!document.querySelector('[data-dkpre]')));
await p.click('[data-dkpre="#8a1c33,#e03131"]');await W(200);
const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.click('[data-dkset="logo"]')]);await fc.setFiles({name:'logo.png',mimeType:'image/png',buffer:Buffer.from(logo.split(',')[1],'base64')});await W(800);
ok('logo applied',await ev(()=>document.querySelectorAll('#content image').length>=10));
ok('tracker rendered',/Implementation/.test(await p.textContent('#content')));
// screenshots of slides in slideshow
await p.click('#pxStrip [data-px="show"]');await W(500);
for(let i=0;i<12;i++){await p.screenshot({path:'shots/deck_'+String(i+1).padStart(2,'0')+'.png'});await p.keyboard.press('ArrowRight');await W(250)}
await p.keyboard.press('Escape');await W(300);
// rich text + chart rendering
ok('rich text bold/accent tspans',await ev(()=>!!document.querySelector('#content tspan[font-weight="700"]')&&!!document.querySelector('#content tspan[fill]')));
ok('chart bars drawn',await ev(()=>document.querySelectorAll('#content path[d*="Q"]').length>5));
// pptx export
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:30000}).catch(()=>null),p.click('#pxStrip [data-px="pptx"]')]);
ok('pptx downloaded '+(dl&&dl.suggestedFilename()),!!dl);
if(dl){const fp=path.join(__dirname,'shots','deck.pptx');await dl.saveAs(fp);ok('pptx size '+Math.round(fs.statSync(fp).size/1024)+'KB',fs.statSync(fp).size>50000)}
// deck from project
await ev(()=>{document.getElementById('nvSearch').click()});await W(150);await p.keyboard.type('susun pitch deck');await W(150);await p.keyboard.press('Enter');await W(1500);
const n2=await ev(()=>document.querySelectorAll('.px-th').length);ok('deck from project adds slides ('+n2+')',n2>=24);
await p.screenshot({path:'shots/deck_proj.png'});
// persistence
await W(1200);await p.reload();await W(900);
ok('deck style persisted',await ev(()=>{const x=JSON.parse(localStorage.getItem('rancang:current'));return x.P.deck&&x.P.deck.primary==='#8a1c33'&&!!x.P.deck.logo}));
console.log('RESULT',pass,'pass',fail,'fail');console.log('errors',errs.slice(0,6));await b.close()})();
