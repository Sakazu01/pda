const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const R=[];const ok=(c,m)=>R.push((c?'PASS ':'FAIL ')+m);
const ctx=await b.newContext({locale:'id-ID',viewport:{width:1500,height:950},colorScheme:'dark'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'page-hook.html'));await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(900);
const bg=()=>p.evaluate(()=>getComputedStyle(document.body).backgroundColor);
const dark0=await bg();ok(true,'auto on dark device bg='+dark0);
await p.click('#btnTheme');await p.waitForTimeout(200);const l=await bg();ok(l!==dark0,'click → Terang bg='+l);
await p.screenshot({path:'shots/theme-light.png'});
await p.reload();await p.waitForTimeout(900);ok((await bg())===l,'Terang remembered after reload');
// host forcing dark attribute must not win over explicit choice
await p.evaluate(()=>document.documentElement.setAttribute('data-theme','dark'));await p.waitForTimeout(200);ok((await bg())===l,'explicit light survives host data-theme=dark');
await p.click('#btnTheme');await p.waitForTimeout(200);ok((await bg())===dark0,'click → Gelap');
await p.click('#btnTheme');await p.waitForTimeout(200);ok(await p.evaluate(()=>localStorage.getItem('rancang:theme'))==='auto','click → Otomatis');
await p.click('#btnMore');await p.waitForTimeout(100);ok(await p.$('[data-nvm=theme]')!=null,'theme in more menu');
console.log(R.join('\n'),'\nerrors',errs);await b.close()})();
