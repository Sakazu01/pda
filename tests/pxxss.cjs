const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.join(__dirname,'page.html'));await p.waitForTimeout(500);
const doc={title:'x',nodes:[
 {id:'a',t:'media-img',x:0,y:0,w:100,h:80,src:'data:image/png;base64,AAAA" onload="window.__x=1'},
 {id:'b',t:'sh-star',x:200,y:0,w:100,h:100,grad:{a:'red" onload="x',b:'#fff'}},
 {id:'c',t:'sh-hexagon',x:400,y:0,w:100,h:100,grad:{a:'#ff0000',b:'#00ff00',d:'"><script>window.__x=2</script>'},bw:'1" onclick="x',rad:'x'},
 {id:'d',t:'slide',x:0,y:300,w:960,h:540,label:'<img src=x onerror=window.__x=3>',grad:{a:'#111111',b:'#333333',d:'r'}},
 {id:'e',t:'legend',x:600,y:0,w:300,h:200,scope:'"><x',label:'</text><script>window.__x=4</script>'}],edges:[]};
await p.setInputFiles('#fileOpen',{name:'x.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});await p.waitForTimeout(800);
const r=await p.evaluate(()=>({x:window.__x,scripts:document.querySelectorAll('#content script').length,onattr:[...document.querySelectorAll('#content *')].some(e=>[...e.attributes].some(a=>/^on/i.test(a.name))),img:document.querySelectorAll('#content image').length,grads:document.querySelectorAll('#content linearGradient,#content radialGradient').length}));
console.log(JSON.stringify(r),errs);
console.log((r.x===undefined&&!r.scripts&&!r.onattr&&r.img===0&&r.grads===2)?'PASS new-field sanitizing':'FAIL new-field sanitizing');
await b.close()})();
