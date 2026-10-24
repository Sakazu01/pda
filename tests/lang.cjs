// Interface language: English by default for English browsers, Indonesian for
// Indonesian ones, switchable from the menu and remembered.
const { chromium } = require('playwright');const path=require('path');const {crawl}=require('./lang-crawl.cjs');
(async()=>{const b=await chromium.launch();const R=[];const ok=(c,m)=>R.push((c?'PASS ':'FAIL ')+m);const errs=[];
const open=async(locale)=>{const ctx=await b.newContext({locale,viewport:{width:1440,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.join(__dirname,'page-hook.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);return p};
// English browser → English interface, nothing left in Indonesian
let p=await open('en-US');
ok(await p.evaluate(()=>document.documentElement.lang)==='en','English browser: <html lang="en">');
ok(/Projects/.test(await p.evaluate(()=>document.getElementById('btnLib').textContent)),'English browser: "Projects" button');
const left=await crawl(p);
ok(left.size===0,'English interface has no Indonesian left ('+left.size+(left.size?': '+[...left.keys()].slice(0,5).join(' | '):'')+')');
// the PRD template is English too, and builds the same canvases
await p.evaluate(()=>{document.getElementById('btnLib').click()});await p.waitForTimeout(150);await p.evaluate(()=>document.getElementById('libNew').click());await p.waitForTimeout(300);
await p.evaluate(()=>document.getElementById('vPrd').click());await p.evaluate(()=>document.getElementById('prdTpl').click());await p.waitForTimeout(200);
ok(/## Actors/.test(await p.evaluate(()=>__RS.P().prd)),'English PRD template');
await p.evaluate(()=>document.getElementById('prdBuild').click());await p.waitForTimeout(700);
const built=await p.evaluate(()=>{const P=__RS.P();const pages=Object.keys(P.pages).filter(k=>P.pages[k]&&P.pages[k].nodes&&P.pages[k].nodes.length);const all=JSON.stringify(P.pages);return{n:pages.length,customer:/Customer/.test(all),uc:pages.indexOf('usecase')>=0,erd:pages.indexOf('erd')>=0}});
ok(built.n>=8&&built.customer&&built.uc&&built.erd,'English PRD builds canvases ('+built.n+' pages)');
// switch from the More menu → Indonesian, remembered after reload
await p.evaluate(()=>__RS.pjView('canvas'));
await p.evaluate(()=>document.getElementById('btnMore').click());await p.waitForTimeout(200);
ok(await p.evaluate(()=>!!document.querySelector('[data-nvm="lang"]')),'More menu has a language item');
await Promise.all([p.waitForNavigation(),p.evaluate(()=>document.querySelector('[data-nvm="lang"]').click())]);await p.waitForTimeout(900);
ok(await p.evaluate(()=>document.documentElement.lang)==='id','after switching: Indonesian');
ok(/Proyek/.test(await p.evaluate(()=>document.getElementById('btnLib').textContent)),'after switching: "Proyek" button');
await p.reload();await p.waitForTimeout(800);
ok(await p.evaluate(()=>document.documentElement.lang)==='id','choice is remembered after reload');
await p.context().close();
// Indonesian browser → Indonesian by default
p=await open('id-ID');
ok(await p.evaluate(()=>document.documentElement.lang)==='id','Indonesian browser: Indonesian by default');
ok(/Belum dicek|Tidak terhubung|Terhubung/.test(await p.evaluate(()=>document.getElementById('llmStat').textContent)),'Indonesian browser: AI status in Indonesian');
await p.context().close();
console.log(R.join('\n'),'\nerrors',errs);await b.close()})();
