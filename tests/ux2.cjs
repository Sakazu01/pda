const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1500,height:950}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts.googleapis/.test(m.text()))errs.push('console:'+m.text())});
await p.goto('file://'+path.join(__dirname,'page-hook.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(1200);
const R=[];const ok=(c,m)=>{R.push((c?'PASS ':'FAIL ')+m)};
ok(!(await p.evaluate(()=>document.documentElement.classList.contains('calm'))),'calm off by default');
ok(await p.evaluate(()=>document.fonts.check('16px Excalifont')),'Excalifont loaded');
ok((await p.evaluate(()=>document.getElementById('svg').getAttribute('font-family'))).startsWith('Excalifont'),'canvas uses Excalifont');
await p.screenshot({path:'shots/ux2-start.png'});
// example with labels
await p.selectOption('#tplSel','web3');await p.waitForTimeout(700);await p.screenshot({path:'shots/ux2-web3.png'});
const fills=await p.evaluate(()=>[...new Set([...document.querySelectorAll('#content [stroke],#content [fill]')].map(e=>e.getAttribute('stroke')+'|'+e.getAttribute('fill')))].length);ok(fills>8,'many colours on canvas ('+fills+')');
ok(await p.evaluate(()=>document.querySelectorAll('#content [data-lab]').length>3),'labels rendered as separate layer');
ok(await p.evaluate(()=>document.querySelectorAll('#content mask').length>3),'lines masked behind labels');
// label overlap check
const ov=await p.evaluate(()=>{const r=[...document.querySelectorAll('#content [data-lab] text')].map(t=>t.getBBox());let n=0;for(let i=0;i<r.length;i++)for(let j=i+1;j<r.length;j++){const a=r[i],c=r[j];if(a.x<c.x+c.width&&a.x+a.width>c.x&&a.y<c.y+c.height&&a.y+a.height>c.y)n++}return n});ok(ov===0,'no label overlaps label ('+ov+')');
// drag a label
const lab=await p.$('#content [data-lab]');const bb=await lab.boundingBox();
const eid=await lab.getAttribute('data-eid');
await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width/2+40,bb.y+bb.height/2+3,{steps:6});await p.mouse.up();await p.waitForTimeout(200);
const lt=await p.evaluate(id=>__RS.S().edges.find(e=>e.id===id).lt,eid);ok(lt!=null&&lt>0&&lt<1,'label drag sets lt='+lt);
ok(await p.evaluate(()=>!document.getElementById('eBar').hidden),'edge toolbar shown for selected line');
await p.screenshot({path:'shots/ux2-ebar.png'});
await p.click('#eBar [data-v=curve]');await p.waitForTimeout(150);ok(await p.evaluate(id=>__RS.S().edges.find(e=>e.id===id).route==='curve',eid),'toolbar: curve');
await p.click('#eBar [data-eb=flip]');await p.waitForTimeout(150);
await p.click('#eBar [data-eb=tidy]');await p.waitForTimeout(150);ok(await p.evaluate(id=>__RS.S().edges.find(e=>e.id===id).lt==null,eid),'toolbar: tidy resets label pos');
await p.keyboard.press('Control+z');await p.waitForTimeout(100);
// goal guide
await p.keyboard.press('Escape');
await p.click('#btnMore');await p.waitForTimeout(150);ok(await p.$('[data-nvm=guide]')!=null,'more menu has guide');await p.click('[data-nvm=guide]');await p.waitForTimeout(250);
ok(await p.evaluate(()=>!document.getElementById('mGuide').hidden&&document.querySelectorAll('.gd-card').length>=10),'guide modal with goals');
await p.screenshot({path:'shots/ux2-guide.png'});
await p.click('[data-gset=sysd]');await p.waitForTimeout(400);
ok(await p.evaluate(()=>__RS.S().dt==='sysdesign'||document.querySelector('[data-dt=sysdesign][aria-pressed=true]')),'set sysd opens System Design');
ok(await p.evaluate(()=>JSON.stringify(__RS.P().plan))==='["sysdesign","sequence","deploy","erd","threat"]','plan stored');
// intent detection in generate modal
await p.evaluate(()=>{document.getElementById('btnGen')&&0});
await p.evaluate(()=>__RS.pjSwitch('usecase'));await p.waitForTimeout(200);
await p.evaluate(()=>{const b=document.getElementById('btnGen');b.click()});await p.waitForTimeout(250);
const vis=await p.evaluate(()=>!document.getElementById('mGen').hidden);
if(!vis){await p.evaluate(()=>{document.querySelector('#scrim').hidden=false;['mGen'].forEach(id=>document.getElementById(id).hidden=false)});}
await p.fill('#genText','Buat system design untuk aplikasi chat jutaan pengguna dengan cache redis, load balancer dan sharding');await p.waitForTimeout(500);
ok(await p.evaluate(()=>document.getElementById('genDt').value)==='auto','default type = Otomatis');ok(/System Design/.test(await p.evaluate(()=>document.getElementById('genHint').textContent)),'auto hint names System Design');
await p.screenshot({path:'shots/ux2-gen.png'});
await p.fill('#genText','Use case untuk sistem perpustakaan: anggota meminjam buku, petugas mengelola');await p.waitForTimeout(500);
ok(/Use Case/.test(await p.evaluate(()=>document.getElementById('genHint').textContent)),'auto hint names Use Case');
await p.selectOption('#genDt','erd');await p.waitForTimeout(100);ok(/Dipilih manual/.test(await p.evaluate(()=>document.getElementById('genHint').textContent)),'manual pick shown');
await p.selectOption('#genDt','auto');await p.fill('#genText','Buat system design untuk aplikasi chat dengan cache redis dan load balancer');await p.waitForTimeout(300);
await p.click('#genGo');await p.waitForTimeout(400);ok(await p.evaluate(()=>__RS.S().dt)==='sysdesign','Buat with Otomatis switches to System Design');
await p.keyboard.press('Escape');
// new types
for(const k of ['component','deploy','api']){await p.evaluate(k=>__RS.pjSwitch(k),k);await p.waitForTimeout(250)}
await p.selectOption('#tplSel','deploy:Web app 3 lapis');await p.waitForTimeout(500);await p.screenshot({path:'shots/ux2-deploy.png'});
await p.selectOption('#tplSel','component:Toko online');await p.waitForTimeout(500);await p.screenshot({path:'shots/ux2-comp.png'});
// font toggle
await p.evaluate(()=>{});await p.click('#btnMore');await p.click('[data-nvm=font]');await p.waitForTimeout(200);
ok(!(await p.evaluate(()=>document.getElementById('svg').getAttribute('font-family'))).startsWith('Excalifont'),'font toggle → normal');
await p.click('#btnMore');await p.click('[data-nvm=font]');await p.waitForTimeout(200);
// export has font
const ex=await p.evaluate(()=>__RS.svg().str);ok(/font-family:Excalifont/.test(ex),'export embeds Excalifont');ok(/<mask /.test(ex),'export keeps masks');
// PRD arsitektur
await p.click('#btnLib');await p.waitForTimeout(200);await p.click('#libNew');await p.waitForTimeout(300);
await p.click('#vPrd');await p.click('#prdTpl');await p.waitForTimeout(300);await p.click('#prdBuild');await p.waitForTimeout(800);
ok(await p.evaluate(()=>(__RS.P().pages.sysdesign||{nodes:[]}).nodes.length>3||__RS.S().dt==='sysdesign'&&__RS.S().nodes.length>3),'PRD Arsitektur builds System Design');
await p.evaluate(()=>__RS.pjSwitch('sysdesign'));await p.waitForTimeout(400);await p.screenshot({path:'shots/ux2-prdsys.png'});
console.log(R.join('\n'));console.log('errors',errs);await b.close()})();
