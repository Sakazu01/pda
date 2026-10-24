const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({locale:'id-ID',viewport:{width:1500,height:950}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'page-hook.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);
const R=[];const ok=(c,m)=>R.push((c?'PASS ':'FAIL ')+m);
const r=await p.evaluate(async()=>{const R=__RS;R.pjSwitch('arch');const S=R.S();S.nodes.length=0;S.edges.length=0;
 const nodes=[],edges=[];for(let i=0;i<40;i++)nodes.push(['n'+i,'c-service','Node '+i]);
 let s=3;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};for(let k=0;k<60;k++){const a=Math.floor(rnd()*40),c=Math.floor(rnd()*40);if(a!==c)edges.push(['n'+a,'n'+c,'sync',''])}
 R.buildGraph({dir:'LR',nodes,edges},0,0);S.nodes.forEach(n=>{n.x=Math.floor(rnd()*900);n.y=Math.floor(rnd()*600)});R.renderAll();
 const before=JSON.stringify(S.nodes.map(n=>[n.x,n.y]));R.tidyLayout();
 let ov=0;S.nodes.forEach((a,i)=>S.nodes.forEach((c,j)=>{if(j>i&&a.x<c.x+c.w&&a.x+a.w>c.x&&a.y<c.y+c.h&&a.y+a.h>c.y)ov++}));
 const moved=JSON.stringify(S.nodes.map(n=>[n.x,n.y]))!==before;R.undo();const back=JSON.stringify(R.S().nodes.map(n=>[n.x,n.y]))===before;
 const menu=[...document.querySelectorAll('[data-nvm]')].length;return{ov,moved,back}});
ok(r.moved,'tidy layout moves shapes');ok(r.ov===0,'tidy layout leaves no overlapping shapes ('+r.ov+')');ok(r.back,'Ctrl+Z restores the old layout');
console.log(R.join('\n'),'\nerrors',errs);await b.close()})();
