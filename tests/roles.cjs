const { chromium } = require('playwright');const path=require('path');const http=require('http');
const AI_MD='# Aplikasi Laundry Kiloan\n\n## Ringkasan\nLaundry antar jemput.\n\n## Aktor\n- **Pelanggan**: pesan laundry.\n- **Kurir**: antar jemput.\n\n## Fitur\n- **Pesan jemput** (Pelanggan): pilih jam jemput.\n- **Lacak cucian** (Pelanggan): lihat status.\n- **Update status** (Kurir): ubah status cucian.\n\n## Entitas Data\n### Order\n- id: int [PK]\n- berat_kg: decimal\n\n## Layar\n- **Beranda**: tombol Pesan, daftar order\n';
const srv=http.createServer((q,r)=>{r.setHeader('Access-Control-Allow-Origin','*');r.setHeader('Access-Control-Allow-Headers','*');r.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(q.method==='OPTIONS'){r.writeHead(204);return r.end()}let b='';q.on('data',d=>b+=d);q.on('end',()=>{r.setHeader('Content-Type','application/json');
    let out;if(b.includes('Reply with only this JSON'))out='{"ok":true}';else if(b.includes('format templat PDA'))out=JSON.stringify({markdown:AI_MD});else if(b.includes('memeriksa konsistensi'))out=JSON.stringify({issues:[{severity:'warn',category:'Alur',message:'Alur Booking studio menyebut WhatsApp tapi Otomasi tidak punya langkah gagal kirim.',pages:['n8n Workflow','BPMN']}]});else out='{}';
    r.end(JSON.stringify({choices:[{message:{content:out}}]}))})});
srv.listen(8798,async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/ERR_TUNNEL|fonts|ERR_CONNECTION/.test(m.text()))errs.push('console: '+m.text())});
await p.goto('file://'+path.join(__dirname,'page.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(700);
let pass=0,fail=0;const ok=(n,c)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+n)};const ev=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
const LS=async()=>{await W(1100);return ev(()=>JSON.parse(localStorage.getItem('rancang:current')||'{}'))};
const pages=async()=>{const x=await LS();return x.P?x.P.pages:{}};
const cnt=async dt=>{const pg=(await pages())[dt];return pg?pg.nodes.length:0};
// ===== R1: PM writes PRD from template and builds every canvas =====
console.log('--- R1 PM: PRD → semua kanvas');
await p.click('[data-ex]').catch(()=>{});
await p.click('#btnLib');await W(200);await p.click('#libNew');await W(400);
await p.click('#vPrd');await W(200);
ok('PRD view visible, canvas hidden',await ev(()=>!document.getElementById('prdView').hidden&&getComputedStyle(document.getElementById('stage')).display==='none'));
await p.click('#prdTpl');await W(300);
ok('template preview rendered with section chips',await ev(()=>document.querySelectorAll('#prdPrev h2.md-sec').length>=8&&document.querySelectorAll('#prdPrev .md-map button').length>=10));
ok('map shows 8/8',/8\/8/.test(await p.textContent('#prdStat')));
await p.click('#prdBuild');await W(600);
const built=await ev(()=>[...document.querySelectorAll('#prdMsg [data-pjgo]')].map(b=>b.dataset.pjgo.split('|')[0]));
ok('built pages: '+built.join(','),['usecase','erd','class','bpmn','activity','userflow','sitemap','wire','n8n','gds'].every(d=>built.includes(d)));
ok('title adopted from PRD',(await p.inputValue('#docTitle'))==='Aplikasi Booking Studio Musik');
const P1=await pages();
ok('usecase has 3 actors + 6 use cases',P1.usecase&&P1.usecase.nodes.filter(n=>n.t==='u-actor').length===3&&P1.usecase.nodes.filter(n=>n.t==='u-usecase').length===6);
ok('usecase include/extend edges',P1.usecase.edges.filter(e=>e.type==='uinc').length===4&&P1.usecase.edges.filter(e=>e.type==='uext').length===1);
ok('erd 4 tables + 3 FK relations',P1.erd.nodes.filter(n=>n.t==='er-table').length===4&&P1.erd.edges.filter(e=>e.type==='cf').length===3);
ok('class has no FK attrs',P1.class.nodes.every(n=>!/_id/.test(n.attrs||'')));
ok('bpmn pool with 3 lanes',P1.bpmn.nodes.some(n=>n.t==='pool'&&n.lanes.length===3));
ok('wire 4 phones',P1.wire.nodes.filter(n=>n.t==='b-phone').length===4);
ok('n8n 2 chains, schedule trigger',P1.n8n.nodes.some(n=>n.t==='c-t-schedule')&&P1.n8n.nodes.some(n=>n.t==='c-t-app'));
ok('gds swatches',P1.gds.nodes.filter(n=>n.role==='swatch').length===4);
const D1=(await LS()).P.dict;ok('dict filled from PRD ('+D1.length+')',D1.length>=18&&D1.some(t=>t.name==='Booking'&&t.alias.includes('pemesanan')));
// visit pages and screenshot
for(const d of ['usecase','bpmn','erd','class','wire','n8n','gds','sitemap']){await ev(d=>document.querySelector('#prdMsg [data-pjgo^="'+d+'|"]')?document.querySelector('#prdMsg [data-pjgo^="'+d+'|"]').click():null,d);await W(250);await p.screenshot({path:'shots/r1_'+d+'.png'});await p.click('#vPrd');await W(150)}
// integration view on a clean build
await p.click('#vInteg');await W(300);
const iss1=await ev(()=>[...document.querySelectorAll('.iv-issue p')].map(x=>x.textContent));
console.log('   issues after clean build:',iss1.length,iss1.slice(0,6));
ok('clean build has no important mismatch',await ev(()=>document.querySelectorAll('.iv-issue[data-sev="warn"]').length===0));
ok('matrix shows rows',await ev(()=>document.querySelectorAll('.iv-mx tbody tr').length>15));
await p.screenshot({path:'shots/r1_integ.png'});
// ===== R2: BA switches between workspaces, work survives =====
console.log('--- R2 BA: pindah bagian, isi tetap');
await p.click('#wsTabs [data-ws="biz"]');await W(300);
ok('biz tab opens a biz page',await ev(()=>{const c=document.querySelector('#dtChips [aria-pressed="true"]');return c&&c.dataset.dt}) );
await p.click('#dtChips [data-dt="bpmn"]');await W(300);
const n0=await ev(()=>document.querySelectorAll('#content g[data-id]').length);
await p.click('#wsTabs [data-ws="ai"]');await W(300);
const aiDt=await ev(()=>document.querySelector('#dtChips [aria-pressed="true"]').dataset.dt);
ok('ai tab lands on filled n8n page ('+aiDt+')',aiDt==='n8n');
await p.click('#wsTabs [data-ws="biz"]');await W(300);
ok('back on BPMN with same content',await ev(()=>document.querySelector('#dtChips [aria-pressed="true"]').dataset.dt)==='bpmn'&&(await ev(()=>document.querySelectorAll('#content g[data-id]').length))===n0);
ok('chips mark filled pages',await ev(()=>document.querySelectorAll('#dtChips .pj-has').length>=1)&&await ev(()=>!!document.querySelector('#wsTabs .pj-cnt')));
// per-page undo isolation
await p.keyboard.press('Escape');await ev(()=>document.getElementById('zFit').click());
await p.mouse.dblclick(700,820);await W(200);await p.keyboard.type('task');await p.keyboard.press('Enter');await W(300);
const n1=await ev(()=>document.querySelectorAll('#content g[data-id]').length);
await p.click('#wsTabs [data-ws="se"]');await W(300);await p.keyboard.press('Control+z');await W(200);
await p.click('#wsTabs [data-ws="biz"]');await W(300);
ok('undo on another page did not touch BPMN ('+n0+'→'+n1+')',n1>n0&&(await ev(()=>document.querySelectorAll('#content g[data-id]').length))===n1);
await p.keyboard.press('Control+z');await W(200);
ok('undo on BPMN works',(await ev(()=>document.querySelectorAll('#content g[data-id]').length))===n0);
// ===== R3: persistence =====
console.log('--- R3 reload: proyek utuh');
await W(1100);await p.reload();await W(900);
const P3=await pages();
ok('after reload all 10 pages still there ('+Object.keys(P3).length+')',['usecase','erd','class','bpmn','activity','userflow','sitemap','wire','n8n','gds'].every(d=>P3[d]&&P3[d].nodes.length));
ok('reload kept current page bpmn',await ev(()=>document.querySelector('#dtChips [aria-pressed="true"]').dataset.dt)==='bpmn');
await p.click('#vPrd');await W(200);ok('PRD text survived reload',(await p.inputValue('#prdText')).includes('## Entitas Data'));
// ===== R4: engineer renames entity in ERD -> mismatch detected, alias fixes =====
console.log('--- R4 Engineer: ganti nama tabel → mismatch');
await ev(()=>document.querySelector('#prdPrev [data-pjgo^="erd|"]').click());await W(300);
// select table Pembayaran and rename via inspector
const tid=await ev(()=>{const g=[...document.querySelectorAll('#content g[data-id]')].find(g=>/Pembayaran/.test(g.textContent));return g&&g.dataset.id});
const bb=await (await p.$('#content g[data-id="'+tid+'"]')).boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+10);await W(200);
await p.fill('#inspBody [data-f="label"]','Payment');await W(300);
ok('inspector shows cross-page links',await ev(()=>!!document.querySelector('#inspBody [data-pjgo]')||/Terhubung/.test(document.getElementById('inspBody').textContent)));
await p.click('#vInteg');await W(300);
const iss4=await ev(()=>[...document.querySelectorAll('.iv-issue p')].map(x=>x.textContent).join(' | '));
ok('flags class without ERD table: '+iss4.slice(0,160),/Pembayaran/.test(iss4)&&/Payment/.test(iss4));
// add alias via dictionary: find Pembayaran term and set alias
await ev(()=>{const rows=[...document.querySelectorAll('.iv-term')];const r=rows.find(r=>r.querySelector('[data-dk="name"]').value==='Pembayaran');const a=r.querySelector('[data-dk="alias"]');a.value='Payment';a.dispatchEvent(new Event('change',{bubbles:true}))});await W(600);
const iss4b=await ev(()=>[...document.querySelectorAll('.iv-issue p')].map(x=>x.textContent).join(' | '));
ok('alias resolves Class↔ERD name mismatch',!/tidak punya tabel padanan/.test(iss4b));
// ===== R5: canvas -> PRD roundtrip =====
console.log('--- R5 kanvas → PRD');
await p.click('#vPrd');await W(200);await p.click('#prdFromCanvas');await W(300);
const md5=await p.inputValue('#prdText');
ok('PRD updated with renamed table',/### Payment/.test(md5)&&/## Ringkasan/.test(md5)&&/Tidak ada lagi double booking/.test(md5));
ok('FK kept in roundtrip',/\[FK → Payment\]|booking_id: int \[FK → Booking\]/.test(md5));
ok('revert button works',await (async()=>{await p.click('[data-prdgo="revert"]');await W(200);return !/### Payment/.test(await p.inputValue('#prdText'))})());
// ===== R6: export/import project json =====
console.log('--- R6 ekspor/impor proyek');
const exp=await ev(()=>{const x=JSON.parse(localStorage.getItem('rancang:current'));return {title:x.title,cur:x.P.cur,pages:x.P.pages,prd:x.P.prd,dict:x.P.dict}});
await p.click('#btnLib');await W(200);await p.click('#libNew');await W(400);
ok('new project is empty',(await ev(()=>document.querySelectorAll('#dtChips .pj-has').length))===0);
await p.setInputFiles('#fileOpen',{name:'proj.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exp))});await W(700);
const P6=await pages();ok('imported project has 11 pages',Object.keys(P6).filter(k=>P6[k].nodes.length).length===11);
// legacy v3 file
await p.setInputFiles('#fileOpen',{name:'old.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({title:'Lama',v:3,dt:'erd',nodes:[{id:'n1',t:'er-table',x:0,y:0,w:200,h:100,label:'user',body:'PK id: int'}],edges:[]}))});await W(600);
ok('legacy single-diagram file opens on its page',await ev(()=>document.querySelector('#dtChips [aria-pressed="true"]').dataset.dt)==='erd'&&(await ev(()=>document.querySelectorAll('#content g[data-id]').length))===1);
// ===== R7: free-form PRD + AI normalisation (mock provider) =====
console.log('--- R7 PRD bebas + AI');
await p.click('#btnLlm');await p.click('[data-nvm="set"]');await p.selectOption('#llmProv','custom');await p.fill('#llmBase','http://localhost:8798/v1');await p.fill('#llmModel','m');await p.fill('#llmKey','sk');await p.click('#llmTest');await W(600);await p.click('#llmSave').catch(()=>{});await W(200);await p.keyboard.press('Escape');
await p.click('#vPrd');await W(200);
await p.setInputFiles('#prdFile',{name:'laundry.md',mimeType:'text/markdown',buffer:Buffer.from('# Laundry\n\nKami ingin aplikasi laundry dimana pelanggan bisa pesan jemput dan kurir update status. Data order punya berat.\n')});await W(400);
ok('free-form import suggests AI',/Susun pakai AI/.test(await p.textContent('#prdMsg')));
await p.click('#prdBuild');await W(200);ok('build on free-form warns',/Belum ada bagian/.test(await p.textContent('#prdMsg')));
await p.click('#prdAi');await W(1200);
ok('AI rewrote PRD to template',(await p.inputValue('#prdText')).includes('## Fitur')&&/dirapikan/.test(await p.textContent('#prdMsg')));
await p.click('#prdBuild');await W(500);
const msg7=await p.textContent('#prdMsg');ok('build after AI (confirm or done): '+msg7.slice(0,80),/dibangun|Ganti semua/.test(msg7));
if(/Ganti semua/.test(msg7)){await p.click('[data-prdgo="empty"]');await W(500)}
ok('only empty pages filled; ERD legacy kept',(await pages()).erd.nodes.some(n=>n.label==='user'));
await p.click('#vInteg');await W(200);await p.click('#integAi');await W(1200);
ok('AI integration finding shown',/gagal kirim/.test(await p.textContent('#integIssues')));
// ===== R8: edge cases =====
console.log('--- R8 edge cases');
await p.click('#vPrd');await W(200);
await p.fill('#prdText','# X\n\n## Fitur\n- **<img src=x onerror=window.__pw=1>** (<b>A</b>): "quote" & stuff\n\n## Entitas Data\n### T1\n- a_id: int [FK → TidakAda]\n### T1\n- dup: int\n\n## Alur\n1. langkah tanpa aktor\n\n## Otomasi\n- satu langkah saja\n\n## Layar\n- **Kosong**\n');await W(400);
ok('preview escapes HTML',await ev(()=>!document.querySelector('#prdPrev img')&&window.__pw===undefined));
await p.click('#prdBuild');await W(300);if(await p.$('[data-prdgo="all"]'))await p.click('[data-prdgo="all"]');await W(600);
ok('weird PRD builds without crash',/dibangun/.test(await p.textContent('#prdMsg')));
ok('no script executed on canvas',await ev(()=>window.__pw===undefined&&!document.querySelector('#content img,#content script')));
await p.click('[data-prdgo="undo"]');await W(400);ok('undo build restores',/dibatalkan/.test(await p.textContent('#prdMsg')));
await p.fill('#prdText','');await W(200);await p.click('#prdBuild');await W(200);ok('empty PRD build warns',/Belum ada bagian/.test(await p.textContent('#prdMsg')));
// ===== R9: enterprise scale =====
console.log('--- R9 skala enterprise');
let big='# ERP Enterprise\n\n## Aktor\n';for(let i=0;i<40;i++)big+='- **Role '+i+'**: peran '+i+'\n';
big+='\n## Fitur\n';for(let i=0;i<80;i++)big+='- **Fitur '+i+'** (Role '+(i%40)+', Role '+((i*7)%40)+'): deskripsi'+(i%5===0&&i?' [include: Fitur 0]':'')+'\n';
big+='\n## Entitas Data\n';for(let i=0;i<45;i++){big+='### Tabel'+i+'\n- id: int [PK]\n';for(let j=0;j<8;j++)big+='- kolom_'+j+': varchar(40)\n';if(i)big+='- tabel'+(i-1)+'_id: int [FK → Tabel'+(i-1)+']\n'}
big+='\n## Alur\n';for(let f=0;f<10;f++){big+='### Proses '+f+'\n';for(let s=0;s<15;s++)big+=(s+1)+'. Role '+((f+s)%6)+': langkah '+s+'\n'}
big+='\n## Layar\n';for(let i=0;i<25;i++)big+='- **Layar '+i+'**: tombol Simpan, kolom Nama, daftar data, gambar banner, filter kategori\n';
big+='\n## Otomasi\n';for(let i=0;i<15;i++)big+='- Event '+i+' masuk → Kirim email → Simpan ke database → Kirim WhatsApp\n';
await p.fill('#prdText',big);await W(500);
const t0=Date.now();await p.click('#prdBuild');await W(200);if(await p.$('[data-prdgo="all"]'))await p.click('[data-prdgo="all"]');await p.waitForFunction(()=>/dibangun/.test(document.getElementById('prdMsg').textContent),null,{timeout:60000});const tb=Date.now()-t0;
ok('enterprise PRD built in '+tb+'ms',tb<20000);
const P9=await pages();ok('enterprise: 120 nodes usecase, 45 tables',new Set(P9.usecase.nodes.filter(n=>n.t==='u-usecase').map(n=>n.label)).size===80&&P9.erd.nodes.length===45);
const t1=Date.now();await p.click('#vInteg');await W(100);const ti=Date.now()-t1;ok('integration check on big project fast ('+ti+'ms)',ti<4000);
await p.screenshot({path:'shots/r9_integ.png'});
const t2=Date.now();await ev(()=>document.querySelector('#wsTabs [data-ws="se"]').click());await ev(()=>document.querySelector('#dtChips [data-dt="erd"]').click());await W(300);const tsw=Date.now()-t2;ok('switch to 45-table ERD '+tsw+'ms',tsw<3000);
await p.screenshot({path:'shots/r9_erd.png'});await ev(()=>document.querySelector('#dtChips [data-dt="usecase"]').click());await W(300);await p.screenshot({path:'shots/r9_uc.png'});await ev(()=>document.querySelector('#dtChips [data-dt="class"]').click());await W(300);await p.screenshot({path:'shots/r9_class.png'});
const sz=await ev(()=>localStorage.getItem('rancang:current').length);ok('project size '+Math.round(sz/1024)+'KB saved',sz>50000);
// ===== R10: phone =====
console.log('--- R10 ponsel');
await p.setViewportSize({width:400,height:820});await W(300);
const offs=()=>ev(()=>{const W=innerWidth,o=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.right>W+1&&r.width>0&&!e.closest('[hidden]')&&!e.closest('.dt-chips')&&getComputedStyle(e).position!=='fixed')o.push(e.tagName+'#'+e.id+'.'+String(e.className).slice(0,30)+' '+Math.round(r.right))});return [document.documentElement.scrollWidth,o.slice(0,6)]});
await p.click('#vPrd');await W(200);console.log(await offs());ok('PRD on phone: no h-scroll',await ev(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:'shots/r10_prd.png'});
await p.click('#vInteg');await W(300);console.log(await offs());ok('Integrasi on phone: no h-scroll',await ev(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:'shots/r10_integ.png'});
console.log('RESULT',pass,'pass',fail,'fail');console.log('errors',errs.slice(0,8));await b.close();srv.close()});
