// Walks the interface in English and lists any text still in Indonesian.
// Usage: node tests/lang-crawl.cjs [out.json]   (also used by tests/lang.cjs)
const { chromium } = require('playwright');const path=require('path');const fs=require('fs');
const ID=/\b(dan|yang|untuk|tidak|belum|dengan|atau|ini|dari|sudah|bisa|perlu|halaman|garis|bentuk|proyek|kanvas|pilih|tambah|hapus|simpan|buka|ganti|buat|tutup|jenis|warna|judul|terhubung|isi|seret|klik|tersimpan|sebelumnya|lainnya|baru|semua|cari|rapikan|kamus|bagian|kosong|sedang|dipakai|lewat|saat|kunci|tujuan|dulu|lagi)\b/i;
async function crawl(page){
  const found=new Map();
  const grab=async(where)=>{const r=await page.evaluate((src)=>{const ID=new RegExp(src,'i');const out=[];
    // Indonesian-only words: in the Indonesian side of the dictionaries, never in the English side
    if(!window.__IDW){const w=s=>(String(s).toLowerCase().match(/[a-z]{4,}/g)||[]);const id=new Set(),en=new Set();
      Object.entries(__RS.I18N).forEach(([e,i])=>{w(e).forEach(x=>en.add(x));w(i).forEach(x=>id.add(x))});
      Object.entries(__RS.EN).forEach(([i,e])=>{w(e).forEach(x=>en.add(x));w(i).forEach(x=>id.add(x))});
      // product and tech words used as-is in both languages
      'workflow pipeline router wireframe status page blank canvas supervisor agent enrichment lead home multi story map cluster sharding raft churn prediction booking login slot'.split(' ').forEach(x=>en.add(x));
      window.__IDW=new Set([...id].filter(x=>!en.has(x)))}
    const isId=t=>ID.test(t)||(String(t).toLowerCase().match(/[a-z]{4,}/g)||[]).some(x=>window.__IDW.has(x));
    const skip='#svg,#content,#miniSvg,script,style,textarea,input,#tplSel,.docname,#docTitle,kbd,.lib-item .t,[hidden]';
    const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
    while((n=w.nextNode())){const pe=n.parentElement;if(!pe||pe.closest(skip))continue;const t=n.nodeValue.replace(/\s+/g,' ').trim();if(t.length>1&&isId(t))out.push(t)}
    document.querySelectorAll('[title],[aria-label],[placeholder]').forEach(e=>{if(e.closest('#svg,#content,#miniSvg'))return;['title','aria-label','placeholder'].forEach(a=>{const v=(e.getAttribute(a)||'').replace(/\s+/g,' ').trim();if(v&&isId(v))out.push(v)})});
    return out},ID.source);r.forEach(t=>{if(!found.has(t))found.set(t,where)})};
  const W=(ms)=>page.waitForTimeout(ms);
  await grab('start');
  const dts=await page.evaluate(()=>Object.keys(__RS.DT));
  for(const dt of dts){await page.evaluate((d)=>{try{__RS.pjSwitch(d)}catch(e){}},dt);await W(120);await grab('page:'+dt);
    // select the first shape so the inspector shows its panel
    await page.evaluate(()=>{const S=__RS.S();const n=S.nodes.find(x=>!/^z-|^b-/.test(x.t))||S.nodes[0];if(n)__RS.sel([n.id],null)});await W(60);await grab('insp:'+dt);
    await page.evaluate(()=>{const S=__RS.S();if(S.edges[0])__RS.sel([],S.edges[0].id)});await W(60);await grab('edge:'+dt);
    await page.evaluate(()=>__RS.sel([],null));
  }
  for(const v of ['prd','integ','canvas']){await page.evaluate((x)=>__RS.pjView(x),v);await W(150);await grab('view:'+v)}
  const clicks=[['#btnLib','lib'],['#btnMore','more'],['#btnLlm','ai'],['[data-nvm="set"]','llm']];
  for(const [sel,name] of clicks){await page.evaluate((s)=>{const e=document.querySelector(s);if(e)e.click()},sel);await W(250);await grab('ui:'+name)}
  await page.keyboard.press('Escape');
  for(const id of ['mGen','mKeys','mIcons','mOutline','mGuide']){await page.evaluate((m)=>{try{document.getElementById('scrim').hidden=false;const x=document.getElementById(m);if(x)x.hidden=false}catch(e){}},id);await W(120);await grab('modal:'+id);await page.evaluate((m)=>{const x=document.getElementById(m);if(x)x.hidden=true;document.getElementById('scrim').hidden=true},id)}
  await page.keyboard.press('Control+k');await W(250);await grab('cmd');await page.keyboard.press('Escape');
  return found;
}
module.exports={crawl};
if(require.main===module)(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900},locale:'en-US'})).newPage();
  await p.goto('file://'+path.join(__dirname,'page-hook.html'));await p.evaluate(()=>{localStorage.clear()});await p.reload();await p.waitForTimeout(900);
  const f=await crawl(p);const arr=[...f.entries()].map(([t,w])=>({t,w}));fs.writeFileSync(process.argv[2]||'/tmp/lang-left.json',JSON.stringify(arr,null,1));console.log('left',arr.length);await b.close()})();
