const { chromium } = require('playwright');const path=require('path');const http=require('http');
const seen=[];
const srv=http.createServer((q,r)=>{
  r.setHeader('Access-Control-Allow-Origin','*');r.setHeader('Access-Control-Allow-Headers','*');r.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(q.method==='OPTIONS'){r.writeHead(204);return r.end()}
  let b='';q.on('data',d=>b+=d);q.on('end',()=>{seen.push({url:q.url,auth:q.headers.authorization||q.headers['x-api-key']||q.headers['x-goog-api-key']||''});
    const isTest=b.indexOf('ok')>=0&&b.indexOf('Reply with only this JSON')>=0;const rev=isTest?'{"ok":true}':JSON.stringify({summary:'Mock review',findings:[{severity:'high',title:'Missing error path',detail:'Add a failure branch.',nodes:[]}]});
    r.setHeader('Content-Type','application/json');
    if(q.url.endsWith('/messages'))return r.end(JSON.stringify({content:[{type:'text',text:'```json\n'+rev+'\n```'}]}));
    if(q.url.includes(':generateContent'))return r.end(JSON.stringify({candidates:[{content:{parts:[{text:rev}]}}]}));
    if(q.url.endsWith('/chat/completions')){if(/bad/.test(q.headers.authorization||'')){r.statusCode=401;return r.end(JSON.stringify({error:{message:'bad key'}}))}return r.end(JSON.stringify({choices:[{message:{content:'Here you go: '+rev}}]}))}
    r.statusCode=404;r.end('{}')})});
srv.listen(8799,async()=>{
const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'page.html'));await p.waitForTimeout(600);
const ok=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
await p.click('#btnLlm');ok('Gen disabled before config',await p.evaluate(()=>document.querySelector('[data-nvm="gen"]').disabled));await p.keyboard.press('Escape');await p.evaluate(()=>document.body.click());
async function cfg(prov,base,model,key,keep){await p.click('#btnLlm');await p.click('[data-nvm="set"]');await p.selectOption('#llmProv',prov);await p.fill('#llmBase',base);await p.fill('#llmModel',model);await p.fill('#llmKey',key);if(keep)await p.check('#llmKeep');await p.click('#llmTest');await p.waitForTimeout(600);const t=await p.textContent('#llmProg');await p.click('#llmSave');await p.waitForTimeout(200);return t}
let t=await cfg('custom','http://localhost:8799/v1','m1','sk-good');ok('oai test: '+t,/Terhubung\. Model/.test(t));
await p.evaluate(()=>document.body.click());await p.click('#btnLlm');ok('Gen enabled after config',await p.evaluate(()=>!document.querySelector('[data-nvm="gen"]').disabled));await p.evaluate(()=>document.body.click());
await p.selectOption('#tplSel','o2c');await p.waitForTimeout(300);
await p.click('#btnLlm');await p.click('[data-nvm="review"]');await p.waitForTimeout(800);
ok('review via oai (fenced prose JSON)',(await p.textContent('#findings, .findings, #mFind, body')).includes('Missing error path'));
t=await cfg('custom','http://localhost:8799/v1','m1','bad-key');ok('401 message: '+t,/ditolak/.test(t));
t=await cfg('anthropic','http://localhost:8799/v1','claude-x','k-ant');ok('anthropic test: '+t,/Terhubung\. Model/.test(t));
t=await cfg('gemini','http://localhost:8799/v1beta','gem','k-gem');ok('gemini test: '+t,/Terhubung\. Model/.test(t));
t=await cfg('custom','http://localhost:1/v1','m','k');ok('unreachable message',/Tidak bisa terhubung/.test(t));
ok('key sent per provider',seen.some(s=>s.auth==='Bearer sk-good')&&seen.some(s=>s.auth==='k-ant')&&seen.some(s=>s.auth==='k-gem'));
ok('key not in localStorage by default',await p.evaluate(()=>!localStorage.getItem('rancang:llmkey')));
await cfg('custom','http://localhost:8799/v1','m1','sk-keep',true);
ok('key persisted only when asked',await p.evaluate(()=>localStorage.getItem('rancang:llmkey')==='sk-keep'));
await p.click('#btnLlm');await p.click('[data-nvm="set"]');await p.click('#llmClear');await p.click('#llmSave');
ok('clear key removes it',await p.evaluate(()=>!localStorage.getItem('rancang:llmkey')));
console.log('errors',errs);await b.close();srv.close()});
