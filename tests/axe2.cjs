const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
for(const [w,h,sc] of [[1440,900,'light'],[1440,900,'dark'],[400,800,'light'],[400,800,'dark']]){
 const p=await (await b.newContext({viewport:{width:w,height:h},colorScheme:sc,bypassCSP:true})).newPage();
 await p.goto('file://'+path.join(__dirname,'page.html'));await p.waitForTimeout(600);
 const all=new Map();
 for(const v of ['o2c','usecase:Sistem POS Biliar','n8n','swot:Biliar & Kafe']){await p.selectOption('#tplSel',v);await p.waitForTimeout(250);
  await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')}).catch(()=>{});
  const r=await p.evaluate(async()=>{const r=await axe.run(document,{resultTypes:['violations']});return r.violations.map(v=>({id:v.id,n:v.nodes.length,ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' '+((n.any[0]||{}).message||'').slice(0,90))}))});
  r.forEach(x=>all.set(x.id,x))}
 console.log(w+'x'+h+' '+sc+': '+(all.size?JSON.stringify([...all.values()],null,0):'no violations'))}
await b.close()})();
