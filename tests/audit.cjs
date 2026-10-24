const TMP=(f)=>require('path').join(require('os').tmpdir(),'pda-'+f);
const { chromium } = require('playwright');const path=require('path');const fs=require('fs');
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({locale:'id-ID',viewport:{width:1440,height:900},bypassCSP:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push('pageerror: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|Failed to load resource/.test(m.text()))errs.push('console: '+m.text())});
await p.goto('file://'+path.join(__dirname,'page.html'));await p.waitForTimeout(600);
const R=(n,c,extra)=>console.log((c?'PASS ':'FAIL ')+n+(extra?' :: '+extra:''));
// 1. every example renders, no NaN, no errors
const opts=await p.evaluate(()=>[...document.querySelectorAll('#tplSel option')].map(o=>o.value).filter(Boolean));
let bad=[];
for(const v of opts){await p.selectOption('#tplSel',v);await p.waitForTimeout(120);
  const r=await p.evaluate(()=>{const h=document.getElementById('content').innerHTML;return{nan:/NaN|undefined|Infinity/.test(h),n:document.querySelectorAll('#content > g[data-id]').length}});
  if(r.nan||!r.n)bad.push(v+(r.nan?'(NaN)':'(empty)'))}
R('all '+opts.length+' examples render clean',!bad.length,bad.join(','));
R('no page errors across examples',!errs.length,errs.slice(0,3).join(' | '));
// 2. XSS via import
const evil={app:'rancang',title:'<img src=x onerror="window.__x=1">',nodes:[{id:'a"><script>window.__x=2</script>',t:'task',x:0,y:0,w:120,h:60,label:'<img src=x onerror="window.__x=3">',fill:'red" onload="window.__x=4',tone:'#ff0000" onclick="window.__x=5'},{id:'b',t:'task',x:300,y:0,w:120,h:60,label:'<script>window.__x=6</script>'}],edges:[{id:'e1',from:'a"><script>window.__x=2</script>',to:'b',type:'sync',label:'</text><script>window.__x=7</script>',stroke:'#000" onload="window.__x=8'}],seq:3};
fs.writeFileSync(TMP('evil.json'),JSON.stringify(evil));
await p.setInputFiles('#fileOpen',TMP('evil.json'));await p.waitForTimeout(500);
await p.mouse.move(700,450);await p.waitForTimeout(200);
R('imported evil diagram does not execute script',await p.evaluate(()=>!window.__x),String(await p.evaluate(()=>window.__x)));
R('no injected script/onerror nodes in DOM',await p.evaluate(()=>!document.querySelector('#content script, #content [onerror], #content [onload], #content [onclick], #inspBody script, #inspBody [onerror]')));
// 3. malicious SVG icon
await p.evaluate(()=>{window.__x=0});
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>window.__x=9</script><rect width="10" height="10" onload="window.__x=10"/><foreignObject><img src=x onerror="window.__x=11"></foreignObject><a href="javascript:window.__x=12"><circle r="4"/></a></svg>';
fs.writeFileSync(TMP('evil.svg'),svg);
await p.click('#btnLib').catch(()=>{});await p.keyboard.press('Escape');
const hasIconBtn=await p.evaluate(()=>!!document.querySelector('[data-open-icons], #palUpload, [data-act="icons"]'));
// 4. storage failure
const c2=await b.newContext({locale:'id-ID',viewport:{width:1440,height:900}});await c2.addInitScript(()=>{const t=()=>{throw new Error('blocked')};Object.defineProperty(window,'localStorage',{get:t});Object.defineProperty(window,'sessionStorage',{get:t});});
const q=await c2.newPage();const e2=[];q.on('pageerror',e=>e2.push(e.message));
await q.goto('file://'+path.join(__dirname,'page.html'));await q.waitForTimeout(700);await q.selectOption('#tplSel','o2c');await q.waitForTimeout(300);
R('works with storage blocked',!e2.length&&await q.evaluate(()=>document.querySelectorAll('#content > g[data-id]').length>5),e2.join('|'));
// 5. perf: big diagram
const big={app:'rancang',title:'big',nodes:[],edges:[],seq:2000};
for(let i=0;i<500;i++)big.nodes.push({id:'n'+i,t:'task',x:(i%25)*180,y:Math.floor(i/25)*110,w:140,h:60,label:'Task '+i});
for(let i=1;i<500;i++)big.edges.push({id:'e'+i,from:'n'+(i-1),to:'n'+i,type:'sync'});
fs.writeFileSync(TMP('big.json'),JSON.stringify(big));
const t0=Date.now();await p.setInputFiles('#fileOpen',TMP('big.json'));await p.waitForFunction(()=>document.querySelectorAll('#content > g[data-id]').length>=500,null,{timeout:30000}).catch(()=>{});
R('500 nodes/499 edges load < 4s',Date.now()-t0<4000,(Date.now()-t0)+'ms');
const dr=await p.evaluate(()=>{const t=performance.now();const g=document.querySelector('#content > g[data-id]');for(let i=0;i<5;i++)window.dispatchEvent(new Event('resize'));return performance.now()-t});
await p.mouse.move(700,450);const t1=Date.now();for(let i=0;i<20;i++){await p.mouse.wheel(0,-120)}await p.waitForTimeout(100);
R('20 wheel-zooms on big diagram < 3s',Date.now()-t1<3000,(Date.now()-t1)+'ms');
// 6. axe
await p.selectOption('#tplSel','o2c');await p.waitForTimeout(300);
await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
const ax=await p.evaluate(async()=>{const r=await axe.run(document,{rules:{'color-contrast':{enabled:true}},resultTypes:['violations']});return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes.slice(0,2).map(n=>n.target.join(' ')).join(' ; ')}))});
console.log('AXE',JSON.stringify(ax,null,1));
console.log('ERRORS',errs.slice(0,5));await b.close()})();
