// ---------- built-in tech logos (tech-stack-icons, MIT) ----------
TECH_EXTRA.forEach(function(x){
  var k='c-'+techKey(x[1]);if(T[k])return;TECH.push(x);T[k]={f:'comp',n:x[1],icon:x[2],cat:x[0],tech:1,kw:'tech stack '+x[1].toLowerCase()};
  var sec=['ai','agent','rag','safe','trigger'].indexOf(x[0])>=0?'tech-ai':(x[0]==='data'||x[0]==='msg')?'tech-data':(x[0]==='compute'||x[0]==='client')?'tech-app':'tech-cloud';
  if(SEC[sec]&&SEC[sec].keys.indexOf(k)<0)SEC[sec].keys.push(k);
});
var TSI_URI={},TSI_BYNORM={};Object.keys(TSI).forEach(function(n){TSI_BYNORM[normName(n)]=n});
function tsiUri(name,dark){var e=TSI[name];if(!e)return null;var dk=!!(dark&&e.k),key=name+(dk?'|d':'');
  if(!TSI_URI[key]){try{TSI_URI[key]={name:name,data:'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(dk?e.k:e.s))),builtin:1}}catch(err){return null}}return TSI_URI[key]}
var tsiCompImg0=compImg;
compImg=function(n){
  var r=tsiCompImg0(n);if(r)return r;var d=T[n.t],dark=TH&&TH.name==='dark';
  if(d&&d.tech&&!n.icon)return tsiUri(d.n,dark)||techMono(d.n);
  if(n.t==='c-logo'&&n.label){var nm=TSI_BYNORM[normName(n.label)];if(nm)return tsiUri(nm,dark)}
  return null;
};

// Tech without an MIT logo in the pack still gets a clear badge: a monogram on
// the product's accent color (no brand artwork), cached like the logos.
var TECH_MONO={'OpenRouter':['OR','#6467f2'],'Pinecone':['Pc','#1c1c1c'],'Qdrant':['Qd','#dc244c'],'Weaviate':['Wv','#2e7d5b'],'Chroma':['Ch','#e8543c'],
  'Kafka':['Kf','#231f20'],'BigQuery':['BQ','#4386fa'],'MinIO':['Mi','#c72e49'],'FastAPI':['FA','#009688'],'Midtrans':['Mt','#0a2e5c'],'Xendit':['Xd','#0063ff'],
  'SendGrid':['SG','#1a82e2'],'WhatsApp API':['WA','#1fa855'],'Google Sheets':['GS','#0f9d58'],'YOLO':['YO','#042aff'],'C':['C','#3949ab'],'Zod':['Z','#3068b7'],
  'Linux':['Lx','#f4c20d'],'Telegram':['Tg','#229ed9'],'Discord':['Dc','#5865f2'],'Gmail':['Gm','#d93025']};
function techMono(name){
  var key='mono|'+name;if(TSI_URI[key])return TSI_URI[key];
  var m=TECH_MONO[name]||[String(name).replace(/[^A-Za-z0-9]/g,'').slice(0,2)||'?','#55606f'],fg=onColor(m[1]),fs=m[0].length>1?44:56;
  var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="22" fill="'+m[1]+'"/><text x="50" y="52" dominant-baseline="central" text-anchor="middle" font-family="system-ui,Segoe UI,Roboto,Arial,sans-serif" font-weight="700" font-size="'+fs+'" fill="'+fg+'">'+esc(m[0])+'</text></svg>';
  return(TSI_URI[key]={name:name,data:'data:image/svg+xml;base64,'+btoa(svg),builtin:1});
}
