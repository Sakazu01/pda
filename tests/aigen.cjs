const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:950}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'page-hook.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);
const R=[];const ok=(c,m)=>R.push((c?'PASS ':'FAIL ')+m);
ok(await p.evaluate(()=>{const b=document.getElementById('aiFab');const r=b.getBoundingClientRect();return r.width>40&&getComputedStyle(b).display!=='none'}),'AI button visible on canvas');
await p.click('#aiFab');await p.waitForTimeout(300);
const st=await p.evaluate(()=>({gen:!document.getElementById('mGen').hidden,llm:!document.getElementById('mLlm').hidden}));ok(st.gen||st.llm,'AI button opens generate (or AI settings when no model) '+JSON.stringify(st));
if(st.gen){ok(await p.evaluate(()=>document.querySelector('#genMode .on').getAttribute('data-v'))==='add','default: beside previous result');}
await p.screenshot({path:'shots/aifab.png'});
await p.keyboard.press('Escape');await p.click('#vPrd');await p.waitForTimeout(200);ok(await p.evaluate(()=>getComputedStyle(document.getElementById('aiFab')).display==='none'),'hidden on PRD view');
console.log(R.join('\n'),'\nerrors',errs);await b.close()})();
