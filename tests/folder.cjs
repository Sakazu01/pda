// Project folder: save, list (scrollable), rename, open, with a fake directory handle.
const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{
  const files=new Map();window.__files=files;
  const fh=(name)=>({kind:'file',name,getFile:async()=>new File([files.get(name)||''],name,{lastModified:Date.now()}),
    createWritable:async()=>{let buf='';return{write:async(s)=>{buf+=s},close:async()=>{files.set(name,buf)}}}});
  const dir={kind:'directory',name:'Proyek Kuliah',queryPermission:async()=>'granted',requestPermission:async()=>'granted',
    getFileHandle:async(n,o)=>{if(!files.has(n)){if(!(o&&o.create))throw new DOMException('nf','NotFoundError');files.set(n,'')}return fh(n)},
    removeEntry:async(n)=>{files.delete(n)},
    values(){const it=[...files.keys()].map(fh)[Symbol.iterator]();return{next:async()=>it.next()}}};
  window.showDirectoryPicker=async()=>dir;
});
await p.goto('file://'+path.join(__dirname,'page.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);
const R=[];const ok=(c,m)=>R.push((c?'PASS ':'FAIL ')+m);const W=ms=>p.waitForTimeout(ms);
await p.click('#btnLib');await W(200);
ok(await p.isVisible('#fdBox [data-fd="pick"]'),'library offers "Pilih folder"');
await p.click('#libNew');await W(300);
await p.fill('#docTitle','Sistem Kasir');await p.keyboard.press('Enter');
await p.evaluate(()=>document.querySelector('#palBody [data-add]').click());await W(200);
await p.click('#btnLib');await W(200);await p.click('#fdBox [data-fd="pick"]');await W(600);
let names=await p.evaluate(()=>[...window.__files.keys()]);
ok(names.length===1&&/^sistem-kasir--[A-Za-z0-9]+\.pda\.json$/.test(names[0]),'project saved as a .pda.json file ('+names.join(',')+')');
const saved=JSON.parse(await p.evaluate(n=>window.__files.get(n),names[0]));
ok(saved.app==='pda'&&typeof saved.id==='string','file carries app and project id');
// rename replaces the old file instead of leaving a copy
await p.keyboard.press('Escape');await p.fill('#docTitle','Kasir Kafe');await p.keyboard.press('Enter');await W(2600);
names=await p.evaluate(()=>[...window.__files.keys()]);
ok(names.length===1&&/^kasir-kafe--/.test(names[0]),'rename replaces the file ('+names.join(',')+')');
// many files: list scrolls, opening one loads it
await p.evaluate(()=>{for(let i=0;i<40;i++)window.__files.set('lama-'+i+'--a'+i+'.pda.json',JSON.stringify({app:'pda',id:'old'+i,title:'Lama '+i,nodes:[],edges:[]}))});
await p.click('#btnLib');await W(500);
const sc=await p.evaluate(()=>{const l=document.querySelector('.fd-list');return{n:l.children.length,scroll:l.scrollHeight>l.clientHeight,ov:getComputedStyle(l).overflowY}});
ok(sc.n===41&&sc.scroll&&sc.ov==='auto','folder list shows 41 files and scrolls');
await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-fdopen]')].find(x=>/Lama 7$/.test(x.textContent.split('·')[0].trim()+'')||x.querySelector('.t').textContent==='lama 7');b.click()});await W(400);
ok(await p.inputValue('#docTitle')==='Lama 7','opening a folder file loads it');
// a hostile file is rejected, not executed
await p.evaluate(()=>window.__files.set('jahat--zz.pda.json','<script>alert(1)</script>'));
await p.click('#btnLib');await W(400);
await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-fdopen]')].find(x=>x.querySelector('.t').textContent==='jahat');b.click()});await W(300);
ok(await p.inputValue('#docTitle')==='Lama 7','invalid file is refused, current project kept');
console.log(R.join('\n'),'\nerrors',errs);await b.close()})();
