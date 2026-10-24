// Security: the shipped page runs under a strict CSP and the folder library is safe.
const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({locale:'id-ID',viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective+' '+e.blockedURI))});
await p.goto('file://'+path.join(__dirname,'page.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);
const R=[];const ok=(c,m)=>R.push((c?'PASS ':'FAIL ')+m);
const meta=await p.evaluate(()=>{const m=document.querySelector('meta[http-equiv="Content-Security-Policy"]');return m?m.content:''});
ok(/script-src 'sha256-/.test(meta)&&!/unsafe-inline[^;]*;?\s*$/.test(meta.split(';').find(x=>/script-src/.test(x))||''),'script-src is hash-locked, no unsafe-inline');
ok(/object-src 'none'/.test(meta)&&/base-uri 'none'/.test(meta),'object-src and base-uri are locked');
// app boots and works under the CSP
ok(await p.evaluate(()=>!!document.querySelector('#content')),'app boots under CSP');
await p.click('#btnLib');await p.waitForTimeout(300);
ok(await p.evaluate(()=>!!document.querySelector('#fdBox')),'library shows the project-folder section');
await p.keyboard.press('Escape');
// injected markup cannot run script even if it reached the DOM
const ran=await p.evaluate(async()=>{window.__pwn=0;const d=document.createElement('div');d.innerHTML='<img src=x onerror="window.__pwn=1">';document.body.appendChild(d);
 const s=document.createElement('script');s.textContent='window.__pwn=2';document.body.appendChild(s);await new Promise(r=>setTimeout(r,300));return window.__pwn});
ok(ran===0,'injected inline handler and script are blocked ('+ran+')');
// only the two deliberate injections above may be refused
const v=await p.evaluate(()=>window.__csp.filter(x=>!/ inline$/.test(x)));
ok(!v.length,'no CSP violations from the app itself'+(v.length?' ('+v.join(', ')+')':''));
console.log(R.join('\n'),'\nerrors',errs);await b.close()})();
