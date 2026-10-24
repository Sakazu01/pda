const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({locale:'id-ID',viewport:{width:1500,height:950}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'page-hook.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);
const R=[];const ok=(c,m)=>R.push((c?'PASS ':'FAIL ')+m);
await p.selectOption('#tplSel','web3');await p.waitForTimeout(600);
// pick LB -> Web API edge (straight horizontal elbow)
const eid=await p.evaluate(()=>{const S=__RS.S();const f=n=>S.nodes.find(x=>x.label===n);const a=f('Load balancer'),b=f('Web API');return S.edges.find(e=>e.from===a.id&&e.to===b.id).id});
await p.evaluate(id=>__RS.sel([],id),eid);await p.waitForTimeout(200);
const segs=await p.$$('#over [data-h=seg]');ok(segs.length>=1,'segment handle shown on elbow line ('+segs.length+')');
const sb=await segs[0].boundingBox();await p.mouse.move(sb.x+sb.width/2,sb.y+sb.height/2);await p.mouse.down();await p.mouse.move(sb.x+sb.width/2,sb.y-30,{steps:6});await p.mouse.up();await p.waitForTimeout(200);
const e1=await p.evaluate(id=>JSON.parse(JSON.stringify(__RS.S().edges.find(e=>e.id===id))),eid);
ok(e1.fromAnchor&&e1.fromAnchor.y<0.5,'drag straight segment up slides both ends ('+JSON.stringify(e1.fromAnchor)+')');
await p.screenshot({path:'shots/wp-seg.png'});
// make it straight and add a diagonal bend
await p.click('#eBar [data-v=straight]');await p.waitForTimeout(150);
const add=await p.$('#over [data-h=wpadd]');ok(!!add,'+ handle on straight line');
const ab=await add.boundingBox();await p.mouse.move(ab.x+ab.width/2,ab.y+ab.height/2);await p.mouse.down();await p.mouse.move(ab.x+ab.width/2+20,ab.y+90,{steps:6});await p.mouse.up();await p.waitForTimeout(200);
const e2=await p.evaluate(id=>__RS.S().edges.find(e=>e.id===id),eid);ok(e2.wp&&e2.wp.length===1,'bend point added');
const pts=await p.evaluate(id=>__RS.route(__RS.S().edges.find(e=>e.id===id)),eid);ok(pts.length===3&&Math.abs(pts[0].y-pts[1].y)>5&&Math.abs(pts[0].x-pts[1].x)>5,'line goes diagonal');
await p.screenshot({path:'shots/wp-diag.png'});
// curve through points
await p.click('#eBar [data-v=curve]');await p.waitForTimeout(150);ok(/C/.test(await p.evaluate(id=>document.querySelector('#content g[data-eid="'+id+'"] path:nth-of-type(2)').getAttribute('d'),eid)),'curve through bend point');
// dblclick removes point
await p.click('#eBar [data-v=straight]');await p.waitForTimeout(100);const wpH=await p.$('#over [data-h=wp]');const wb=await wpH.boundingBox();await p.mouse.dblclick(wb.x+wb.width/2,wb.y+wb.height/2);await p.waitForTimeout(150);
ok(!(await p.evaluate(id=>__RS.S().edges.find(e=>e.id===id).wp,eid)),'double-click removes bend point');
// move whole selection: wp follows
await p.evaluate(id=>{const e=__RS.S().edges.find(x=>x.id===id);e.wp=[{x:e.wp?0:0,y:0}];},eid);
await p.keyboard.press('Control+z');
// tidy
await p.click('#eBar [data-eb=tidy]');await p.waitForTimeout(100);ok(!(await p.evaluate(id=>__RS.S().edges.find(e=>e.id===id).wp,eid)),'tidy clears bends');
// persistence of wp through save/reload
await p.evaluate(id=>{const e=__RS.S().edges.find(x=>x.id===id);e.route='straight';e.wp=[{x:300,y:900}];__RS.renderAll()},eid);
await p.keyboard.press('Control+s').catch(()=>{});await p.waitForTimeout(400);
await p.evaluate(()=>{/* force save */});
console.log(R.join('\n'),'\nerrors',errs);await b.close()})();
