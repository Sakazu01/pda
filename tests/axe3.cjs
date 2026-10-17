const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
for(const [w,h,sc] of [[1440,900,'light'],[1440,900,'dark'],[400,800,'light']]){
 const p=await (await b.newContext({viewport:{width:w,height:h},colorScheme:sc,bypassCSP:true})).newPage();
 await p.goto('file://'+path.join(__dirname,'page.html'));await p.waitForTimeout(600);
 await p.click('#btnLib');await p.waitForTimeout(150);await p.click('#libNew');await p.waitForTimeout(300);
 await p.click('#vPrd');await p.click('#prdTpl');await p.click('#prdBuild');await p.waitForTimeout(400);
 const all=new Map();
 for(const v of ['#vPrd','#vInteg','canvas']){
  if(v==='canvas'){await p.evaluate(()=>document.querySelector('#dtChips [data-dt]').click());await p.waitForTimeout(200);const g=await p.$('#content g[data-id]');if(g){const bb=await g.boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2)}}
  else{if(await p.evaluate(v=>document.querySelector(v).getAttribute('aria-pressed')!=='true',v))await p.click(v)}
  await p.waitForTimeout(300);
  await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')}).catch(()=>{});
  const r=await p.evaluate(async()=>{const r=await axe.run(document,{resultTypes:['violations']});return r.violations.map(v=>({id:v.id,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' '+((n.any[0]||{}).message||'').slice(0,90))}))});
  r.forEach(x=>all.set(x.id+v,x))}
 console.log(w+'x'+h+' '+sc+': '+(all.size?JSON.stringify([...all.entries()],null,0):'no violations'))}
await b.close()})();
