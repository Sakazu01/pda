const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({locale:'id-ID',viewport:{width:1500,height:950}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'page-hook.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);
await p.selectOption('#tplSel','sysdesign:Payment system');await p.waitForTimeout(600);
const R=[];const ok=(c,m)=>R.push((c?'PASS ':'FAIL ')+m);
// pick node "PSP" and drag it down across others
const g=await p.evaluateHandle(()=>[...document.querySelectorAll('#content > g[data-id]')].find(x=>x.textContent.includes('Fraud')));
const bb=await g.boundingBox();
const t0=Date.now();await p.mouse.move(bb.x+bb.width/2,bb.y+10);await p.mouse.down();for(let i=1;i<=20;i++)await p.mouse.move(bb.x+bb.width/2+i*12,bb.y+10-i*4);const dt=Date.now()-t0;await p.mouse.up();await p.waitForTimeout(300);
ok(dt<3000,'drag 20 steps took '+dt+'ms');
// every routed elbow edge must avoid all non-endpoint shapes
const bad=await p.evaluate(()=>{const S=__RS.S(),out=[];S.edges.forEach(e=>{const P=__RS.route(e);if(!P||e.route)return;for(let i=1;i<P.length;i++){const a=P[i-1],c=P[i],x1=Math.min(a.x,c.x),x2=Math.max(a.x,c.x),y1=Math.min(a.y,c.y),y2=Math.max(a.y,c.y);S.nodes.forEach(n=>{if(n.id===e.from||n.id===e.to||/^z-|^b-/.test(n.t))return;if(x1<n.x+n.w-2&&x2>n.x+2&&y1<n.y+n.h-2&&y2>n.y+2)out.push(e.id+'×'+n.label)})}});return out});
ok(bad.length===0,'no line crosses a shape after drop '+JSON.stringify(bad));
// manual bend still respected
const e0=await p.evaluate(()=>{const e=__RS.S().edges[0];e.mx=e.mx;return e.id});
ok(errs.length===0,'no errors '+errs.join(';'));
console.log(R.join('\n'));await b.close()})();
