// Every tech-stack entry shows a logo (or monogram badge), cheaply.
const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:950}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'page-hook.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);
const R=[];const ok=(c,m)=>R.push((c?'PASS ':'FAIL ')+m);
const r=await p.evaluate(()=>{const T=__RS.T,keys=Object.keys(T).filter(k=>T[k].tech);const t0=performance.now();
 const miss=keys.filter(k=>{const im=__RS.compImg({t:k});return !(im&&/^data:image\/svg\+xml;base64,/.test(im.data))}).map(k=>T[k].n);
 const t1=performance.now();keys.forEach(k=>__RS.compImg({t:k}));const t2=performance.now();
 return{n:keys.length,miss,first:t1-t0,cached:t2-t1}});
ok(r.n>=150,'tech catalogue has '+r.n+' entries');
ok(!r.miss.length,'every tech entry has a logo'+(r.miss.length?' (missing: '+r.miss.join(', ')+')':''));
ok(r.first<250,'all logos prepared in '+r.first.toFixed(0)+'ms');
ok(r.cached<20,'cached lookup for all logos '+r.cached.toFixed(1)+'ms');
// a tech-heavy canvas renders logos
await p.evaluate(()=>{const R=__RS;R.pjSwitch('arch');R.buildGraph({dir:'LR',nodes:[['u','c-x-nextjs','Next.js'],['a','c-x-go','Go'],['r','c-x-redis','Redis'],['k','c-kafka','Kafka']],edges:[['u','a','sync','HTTPS'],['a','r','sync','cache'],['a','k','async','events']]},0,0);R.renderAll()});
await p.waitForTimeout(300);
ok(await p.evaluate(()=>document.querySelectorAll('#content image').length)>=3,'logos render on the canvas');
console.log(R.join('\n'),'\nerrors',errs);await b.close()})();
