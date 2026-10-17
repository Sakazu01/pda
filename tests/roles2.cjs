const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts/.test(m.text()))errs.push('console: '+m.text())});
await p.goto('file://'+path.join(__dirname,'page.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(700);
let pass=0,fail=0;const ok=(n,c)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+n)};const ev=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
const LS=async()=>{await W(1100);return ev(()=>JSON.parse(localStorage.getItem('rancang:current')||'{}'))};
const go=async dt=>{await ev(dt=>{const c=document.querySelector('#dtChips [data-dt="'+dt+'"]');if(c)c.click();else{const ws={usecase:'se',erd:'se',class:'se',bpmn:'biz',wire:'ux',n8n:'ai'}[dt];document.querySelector('#wsTabs [data-ws="'+ws+'"]').click();document.querySelector('#dtChips [data-dt="'+dt+'"]').click()}},dt);await W(250)};
const sel=async txt=>{const g=await ev(t=>{const g=[...document.querySelectorAll('#content g[data-id]')].reverse().find(g=>g.textContent.trim().startsWith(t));return g&&g.dataset.id},txt);if(!g)return false;const bb=await (await p.$('#content g[data-id="'+g+'"]')).boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+Math.min(14,bb.height/2));await W(150);return true};
await p.click('#btnLib');await W(200);await p.click('#libNew');await W(300);
await p.click('#vPrd');await p.click('#prdTpl');await p.click('#prdBuild');await W(500);
// ---- Analyst renames a use case slightly -> near-miss
console.log('--- near-miss dan alias');
await go('usecase');ok('select use case',await sel('Bayar booking'));
await p.fill('#inspBody [data-f="label"]','Bayar bookingan');await W(200);await p.keyboard.press('Escape');
await p.click('#vInteg');await W(300);
const t1=await p.textContent('#integIssues');ok('near-miss flagged: '+(t1.match(/“Bayar bookingan”[^.]*/)||[''])[0].slice(0,90),/Bayar bookingan/.test(t1)&&/mirip/.test(t1));
await ev(()=>{const b=[...document.querySelectorAll('[data-pjalias]')].find(b=>/Bayar bookingan/.test(b.closest('.iv-issue').textContent));b&&b.click()});await W(300);
ok('alias resolves near-miss',!/Bayar bookingan”[^|]*mirip/.test(await p.textContent('#integIssues')));
ok('alias stored in dict',await ev(()=>[...document.querySelectorAll('.iv-term [data-dk="alias"]')].some(i=>/Bayar bookingan/.test(i.value))));
// ---- inspector add-to-dictionary + cross-page jump
console.log('--- inspektor kamus & lompat halaman');
await go('erd');await ev(()=>document.getElementById('zFit').click());await W(150);
await ev(()=>document.querySelector('#palBody [data-add="er-table"]').click());await W(300);console.log('   insp:',(await p.textContent('#inspBody')).slice(0,60));
ok('new table selected shows Terhubung section',/Terhubung di proyek/.test(await p.textContent('#inspBody')));
await p.fill('#inspBody [data-f="label"]','Promo');await W(250);
const addBtn=await p.$('#inspBody [data-pj="dict-node"]');ok('Tambah ke kamus offered for unknown table',!!addBtn);
if(addBtn){await addBtn.click();await W(200)}
ok('after adding, dict shows Entitas data',/Entitas data di kamus/.test(await p.textContent('#inspBody')));
await p.keyboard.press('Escape');await sel('Booking');console.log('   sel:',await ev(()=>document.querySelector('#inspBody h3').textContent));ok('Booking links to Class page',await ev(()=>!!document.querySelector('#inspBody [data-pjgo^="class|"]')));
await ev(()=>document.querySelector('#inspBody [data-pjgo^="class|"]').click());await W(400);
ok('jumped to Class with node selected',await ev(()=>document.querySelector('#dtChips [aria-pressed="true"]').dataset.dt)==='class'&&/Booking/.test(await ev(()=>{const i=document.querySelector('#inspBody [data-f="label"]');return i?i.value:''})));
// ---- rebuild current page from PRD then Ctrl+Z restores manual edits
console.log('--- bangun ulang & undo');
await go('erd');const before=await ev(()=>document.querySelectorAll('#content g[data-id]').length);
await p.click('#vPrd');await p.click('#prdBuild');await W(200);await p.click('[data-prdgo="all"]');await W(500);
await p.click('#vPrd');await W(300);
const after=await ev(()=>document.querySelectorAll('#content g[data-id]').length);
ok('rebuild replaced ERD ('+before+'→'+after+')',after===before-1);
console.log('   before undo',await ev(()=>document.querySelectorAll('#content g[data-id]').length),await ev(()=>document.activeElement.id||document.activeElement.tagName));await p.keyboard.press('Control+z');await W(300);console.log('   after undo',await ev(()=>[...document.querySelectorAll('#content g[data-id]')].map(g=>g.textContent.slice(0,12)).join('|')));
ok('Ctrl+Z on ERD restores manual table',(await ev(()=>document.querySelectorAll('#content g[data-id]').length))===before&&/table_name|Promo/.test(await p.textContent('#content')));
// ---- simulation on built BPMN + slides on a page + export PNG
console.log('--- simulasi, slide, ekspor');
await go('bpmn');await p.click('#btnSim');await W(300);ok('simulation runs on generated BPMN',/Langkah 1\//.test(await p.textContent('#simLbl')));await p.keyboard.press('Escape');await W(150);
await p.click('#btnSlides');await W(400);ok('slide created on BPMN page',await ev(()=>document.querySelectorAll('.px-th').length===1));
await go('usecase');ok('use case page has no slides',await ev(()=>document.getElementById('pxStrip').hidden||document.querySelectorAll('.px-th').length===0));
await go('bpmn');ok('back on BPMN: slide still there',await ev(()=>[...document.querySelectorAll('#content g[data-id]')].some(g=>/Slide 1/.test(g.textContent))));
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:6000}).catch(()=>null),(async()=>{await p.click('#btnExport');await W(100);await p.click('[data-exp="png"]')})()]);
ok('PNG export of page '+(dl&&dl.suggestedFilename()),!!dl);
const [dj]=await Promise.all([p.waitForEvent('download',{timeout:6000}).catch(()=>null),(async()=>{await p.click('#btnExport');await W(100);await p.click('[data-exp="json"]')})()]);
let jsonOk=false;if(dj){const fp=await dj.path();const j=JSON.parse(require('fs').readFileSync(fp,'utf8'));jsonOk=j.v===4&&Object.keys(j.pages).length>=10&&j.prd.length>100&&j.dict.length>10}ok('JSON export carries whole project',jsonOk);
const [dm]=await Promise.all([p.waitForEvent('download',{timeout:6000}).catch(()=>null),(async()=>{await p.click('#vPrd');await W(100);await p.click('#prdExp')})()]);
ok('PRD .md export '+(dm&&dm.suggestedFilename()),!!dm&&/\.md$/.test(dm.suggestedFilename()));
// ---- library: second project and back
console.log('--- pustaka proyek');
await p.click('#btnLib');await W(200);await p.click('#libNew');await W(300);
await ev(()=>{if(document.getElementById('vPrd').getAttribute('aria-pressed')!=='true')document.getElementById('vPrd').click()});await p.fill('#prdText','# Proyek Dua\n\n## Aktor\n- **Kasir**: jaga toko\n');await W(1200);
await p.click('#btnLib');await W(300);const items=await ev(()=>[...document.querySelectorAll('#mLib [data-open], #mLib .lib-item, #mLib li')].map(x=>x.textContent.trim().slice(0,40)));
ok('library lists both projects '+JSON.stringify(items.slice(0,3)),items.some(t=>/Booking Studio/.test(t)));
await ev(()=>{const x=[...document.querySelectorAll('#mLib [data-open]')].find(x=>/Booking Studio/.test(x.closest('li,div').textContent));x&&x.click()});await W(600);
ok('reopened first project with PRD & pages',(await p.inputValue('#docTitle'))==='Aplikasi Booking Studio Musik'&&(await ev(()=>document.querySelectorAll('#wsTabs .pj-cnt').length))>=3);
// ---- many images across pages, storage pressure
console.log('--- gambar di banyak halaman');
const png=await ev(()=>{const c=document.createElement('canvas');c.width=1600;c.height=1000;const g=c.getContext('2d');for(let i=0;i<4000;i++){g.fillStyle='hsl('+(i*37%360)+',70%,50%)';g.fillRect(Math.random()*1600,Math.random()*1000,40,40)}return c.toDataURL('image/png')});
const buf=Buffer.from(png.split(',')[1],'base64');
for(const d of ['bpmn','usecase','wire']){await go(d);await p.setInputFiles('#pxImgIn',{name:'n.png',mimeType:'image/png',buffer:buf});await W(900)}
const x=await LS();const imgs=Object.values(x.P.pages).flatMap(pg=>pg.nodes).filter(n=>n.t==='media-img').length;ok('3 images saved across pages ('+Math.round(JSON.stringify(x).length/1024)+'KB)',imgs===3);
ok('save state not error',!/blocked|Too big|error/i.test(await p.textContent('#saveState')));
console.log('RESULT',pass,'pass',fail,'fail');console.log('errors',errs.slice(0,8));await b.close()})();
