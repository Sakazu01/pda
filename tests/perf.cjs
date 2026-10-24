const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({locale:'id-ID',viewport:{width:1500,height:950}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'page-hook.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);
const R=[];const ok=(c,m)=>R.push((c?'PASS ':'FAIL ')+m);
for(const [N,E] of [[60,90],[120,180],[200,300]]){
 const r=await p.evaluate(async([N,E])=>{const R=__RS;R.pjSwitch('arch');const S=R.S();S.nodes.length=0;S.edges.length=0;
  const ty=['c-service','c-sql','c-dcache','c-queue','c-web','c-lb7'];const nodes=[],edges=[];
  for(let i=0;i<N;i++)nodes.push(['n'+i,ty[i%ty.length],'Node '+i]);
  let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};
  for(let k=0;k<E;k++){const a=Math.floor(rnd()*N),c=Math.floor(rnd()*N);if(a!==c)edges.push(['n'+a,'n'+c,'sync',k%5?'':'call '+k])}
  R.buildGraph({dir:'LR',nodes,edges},0,0);
  const t0=performance.now();R.renderAll();const t=performance.now()-t0;await new Promise(r=>setTimeout(r,2500));
  // invariant: routed elbow lines avoid every other shape
  let cross=0,routed=0;S.edges.forEach(e=>{const P=R.route(e);if(!P||e.route)return;routed++;for(let i=1;i<P.length;i++){const a=P[i-1],c=P[i],x1=Math.min(a.x,c.x),x2=Math.max(a.x,c.x),y1=Math.min(a.y,c.y),y2=Math.max(a.y,c.y);S.nodes.forEach(n=>{if(n.id===e.from||n.id===e.to||/^z-|^b-/.test(n.t))return;if(x1<n.x+n.w-2&&x2>n.x+2&&y1<n.y+n.h-2&&y2>n.y+2)cross++})}});
  return{t,cross,routed,edges:S.edges.length}},[N,E]);
 ok(r.t<(N>150?300:200),N+' nodes / '+r.edges+' lines: first render '+r.t.toFixed(0)+'ms');
 ok(r.cross===0,N+' nodes: line-through-shape crossings '+r.cross+' after background routing (must be 0)');
}
console.log(R.join('\n'),'\nerrors',errs);await b.close()})();
