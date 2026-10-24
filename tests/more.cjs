const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({locale:'id-ID',viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'page.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(700);
await p.click('#btnLib');await p.waitForTimeout(150);await p.click('#libNew');await p.waitForTimeout(300);
const ws=await p.$$eval('#wsTabs [data-ws]',l=>l.map(b=>b.dataset.ws));console.log('ws',ws.join(','));
const res=[];
for(const w of ws){await p.evaluate(w=>document.querySelector('#wsTabs [data-ws="'+w+'"]').click(),w);await p.waitForTimeout(120);
  const dts=await p.evaluate(()=>{document.getElementById('nvMore').click();const r=[...[...document.querySelectorAll('#nvPick .nv-grp')][0].querySelectorAll('[data-dt]')].map(b=>b.dataset.dt);document.getElementById('nvPickX').click();return r});
  for(const d of dts){await p.evaluate(d=>{document.getElementById('nvMore').click();document.querySelector('#nvPick [data-dt="'+d+'"]').click()},d);await p.waitForTimeout(120);
    const n=await p.evaluate(()=>document.querySelectorAll('#content g[data-id]').length);res.push([w,d,n]);
    if(['prism','smart','prisma','fishbone','m7s','golden','bsc','risk','gantt','raci','blueprint','storymap','ost','rice','tows','lean','pdca','whys','decision','dmaic'].includes(d)){await p.screenshot({path:'shots/mf_'+d+'.png'})}}}
console.log('types',res.length,'empty fw:',res.filter(r=>r[2]===0).map(r=>r[1]).join(','));
const ex=await p.$$eval('#tplSel option',l=>l.map(o=>o.value).filter(v=>/^(sysdesign|threat|cicd|eventstorm):/.test(v)));
for(const k of ex){await p.selectOption('#tplSel',k);await p.waitForTimeout(250);const n=await p.evaluate(()=>document.querySelectorAll('#content g[data-id]').length);console.log(k,n);await p.screenshot({path:'shots/ex_'+k.replace(/[^a-z0-9]+/gi,'_')+'.png'})}
console.log('errors',errs);await b.close()})();
