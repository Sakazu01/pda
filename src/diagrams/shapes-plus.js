// ================= plus: basic shapes, gradients, images, legend, OOP markers, slides =================
// ---------- meanings of every line type (shown in the legend, the line inspector and the doc panel) ----------
var PX_MEAN={
  sync:'Panggilan langsung; pengirim menunggu balasan',async:'Event/pesan masuk antrean; pengirim tidak menunggu',bi:'Komunikasi dua arah',line:'Hubungan tanpa arah',
  route:'Jalur dipilih berdasarkan kondisi',route2:'Didelegasikan lalu hasilnya kembali',tool:'Agen memanggil tool / fungsi',stream:'Data mengalir terus-menerus (streaming)',
  seq:'Urutan langkah di dalam satu pool',msg:'Pesan antar-pool / partisipan berbeda',def:'Jalur default bila kondisi lain tidak terpenuhi',cond:'Jalur yang hanya dilalui bila syarat terpenuhi',
  data:'Aktivitas membaca / menulis data',assoc:'Menempelkan catatan atau artefak',c4rel:'Relasi antar elemen C4; beri label “menggunakan…”',
  uassoc:'Kedua class saling mengenal (punya referensi)',unav:'A mengenal B, tetapi B tidak mengenal A',uinh:'Pewarisan “is-a”: subclass extends superclass',
  ureal:'Class mengimplementasikan interface (implements)',udep:'Ketergantungan sementara: dipakai sebagai parameter / variabel lokal',
  uagg:'Has-a lemah: bagian tetap hidup walau induk dihapus',ucomp:'Has-a kuat: bagian ikut terhapus bersama induk',
  uinc:'Use case dasar selalu menjalankan use case ini',uext:'Use case opsional yang memperluas use case dasar',uflow:'Aliran kontrol / transisi state',
  umsg:'Pesan sinkron; pemanggil menunggu',uasync:'Pesan asinkron; pemanggil tidak menunggu',uret:'Balasan dari pesan sebelumnya',
  dflow:'Data berpindah antar proses, store, atau entitas eksternal',cf:'Relasi antar tabel dengan kardinalitas'
};
var PX_CF={only:'Tepat satu',one:'Satu',zone:'Nol atau satu',omany:'Satu atau banyak',zmany:'Nol atau banyak',many:'Banyak'};
var PX_VIS=[['+','public','bisa diakses dari mana saja'],['-','private','hanya di dalam class itu sendiri'],['#','protected','class itu dan turunannya'],['~','package','class dalam package yang sama']];
var PX_RULE='Garis penuh = hubungan langsung / struktural · Putus-putus = tidak langsung, opsional, atau sekadar bergantung';

// ---------- new node types ----------
var PX_SHAPES=[['rect','Persegi',[140,90]],['rrect','Persegi membulat',[140,90]],['circle','Lingkaran',[100,100]],['triangle','Segitiga',[120,104]],['rtri','Segitiga siku',[120,104]],
  ['diamond','Belah ketupat',[120,100]],['pentagon','Segi lima',[110,105]],['hexagon','Segi enam',[130,112]],['octagon','Segi delapan',[110,110]],['star','Bintang',[116,110]],
  ['trap','Trapesium',[150,90]],['para','Jajar genjang',[150,80]],['cyl','Silinder',[110,120]],['cube','Kubus',[120,110]],['cloud','Awan',[170,110]],
  ['callout','Balon kata',[170,104]],['arrowR','Panah kanan',[160,72]],['arrowL','Panah kiri',[160,72]],['arrow2','Panah dua arah',[180,72]],['chevron','Chevron',[150,70]],
  ['plus','Plus',[90,90]],['heart','Hati',[100,92]]];
PX_SHAPES.forEach(function(s){T['sh-'+s[0]]={f:'shape',k:'px-'+s[0],n:s[1],sz:s[2],kw:'bentuk shape '+s[0]}});
T['media-img']={f:'img',n:'Gambar',sz:[260,170],kw:'image foto picture logo screenshot gambar'};
T['legend']={f:'legend',n:'Legenda (arti tanda)',sz:[360,200],kw:'legend keterangan simbol notasi garis putus'};
T['slide']={f:'slide',n:'Slide 16:9',sz:[960,540],kw:'slide presentasi frame halaman deck'};
RESIZABLE.img=1;RESIZABLE.legend=1;RESIZABLE.slide=1;CONTAINER.slide=1;
FAM_LABEL.img='Gambar';FAM_LABEL.legend='Legenda';FAM_LABEL.slide='Slide';
NUMK.bw=1;NUMK.rad=1;
SEC['px-media']={n:'Gambar, legenda & slide',keys:['media-img','legend','slide']};
SEC['px-shapes']={n:'Bentuk dasar',keys:PX_SHAPES.map(function(s){return 'sh-'+s[0]})};
secOpen['px-shapes']=false;
var pxPrim0=primarySecs;
primarySecs=function(dt){var p=pxPrim0(dt);['px-media','px-shapes'].forEach(function(s){if(p.indexOf(s)<0)p.push(s)});return p};

// ---------- geometry helpers ----------
function pxFit(raw,x,y,w,h){var a=Infinity,b=Infinity,c=-Infinity,d=-Infinity;raw.forEach(function(p){a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1])});
  return raw.map(function(p){return[x+(p[0]-a)/(c-a||1)*w,y+(p[1]-b)/(d-b||1)*h]})}
function pxReg(n,rot,inner){var o=[];for(var i=0;i<n;i++){var t=rot+i*2*Math.PI/n;o.push([Math.cos(t),Math.sin(t)]);if(inner){var t2=t+Math.PI/n;o.push([Math.cos(t2)*inner,Math.sin(t2)*inner])}}return o}
function pxPoly(p){return 'M'+p.map(function(q){return r1(q[0])+' '+r1(q[1])}).join(' L')+' Z'}
function pxNorm(cmds,x,y,w,h){return cmds.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g,function(m,a,b){return r1(x+(+a)*w)+' '+r1(y+(+b)*h)})}
function pxBW(n){return n.bw!=null&&isFinite(+n.bw)?+n.bw:1.6}

function pxShape(n,noLabel,k){
  var x=n.x,y=n.y,w=n.w,h=n.h,f=validColor(n.fill)?n.fill:TH.shape,st=validColor(n.stroke)?n.stroke:TH.ink,bw=pxBW(n),s='',tw=w-20,tx=x+w/2,ty=y+h/2;
  var a=' fill="'+f+'" stroke="'+(bw?st:'none')+'" stroke-width="'+bw+'" stroke-linejoin="round"';
  function P(d){s+='<path d="'+d+'"'+a+'/>'}
  if(k==='rect'||k==='rrect')s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(k==='rrect'?r1(Math.min(18,h/4,w/4)):0)+'"'+a+'/>';
  else if(k==='circle'){s+='<ellipse cx="'+r1(x+w/2)+'" cy="'+r1(y+h/2)+'" rx="'+r1(w/2)+'" ry="'+r1(h/2)+'"'+a+'/>';tw=w*0.7}
  else if(k==='triangle'){P(pxPoly([[x+w/2,y],[x+w,y+h],[x,y+h]]));tw=w*0.5;ty=y+h*0.64}
  else if(k==='rtri'){P(pxPoly([[x,y],[x+w,y+h],[x,y+h]]));tw=w*0.45;tx=x+w*0.32;ty=y+h*0.68}
  else if(k==='diamond'){P(pxPoly([[x+w/2,y],[x+w,y+h/2],[x+w/2,y+h],[x,y+h/2]]));tw=w*0.56}
  else if(k==='pentagon'){P(pxPoly(pxFit(pxReg(5,-Math.PI/2),x,y,w,h)));tw=w*0.62;ty=y+h*0.56}
  else if(k==='hexagon'){P(pxPoly(pxFit(pxReg(6,0),x,y,w,h)));tw=w*0.66}
  else if(k==='octagon'){P(pxPoly(pxFit(pxReg(8,Math.PI/8),x,y,w,h)));tw=w*0.74}
  else if(k==='star'){P(pxPoly(pxFit(pxReg(5,-Math.PI/2,0.46),x,y,w,h)));tw=w*0.36;ty=y+h*0.56}
  else if(k==='trap'){var t1=w*0.18;P(pxPoly([[x+t1,y],[x+w-t1,y],[x+w,y+h],[x,y+h]]));tw=w-2*t1-8}
  else if(k==='para'){var t2=Math.min(w*0.2,h*0.6);P(pxPoly([[x+t2,y],[x+w,y],[x+w-t2,y+h],[x,y+h]]));tw=w-2*t2-8}
  else if(k==='cyl'){var ry=Math.min(16,h*0.14);P('M'+x+' '+r1(y+ry)+' V'+r1(y+h-ry)+' A'+r1(w/2)+' '+r1(ry)+' 0 0 0 '+(x+w)+' '+r1(y+h-ry)+' V'+r1(y+ry)+' A'+r1(w/2)+' '+r1(ry)+' 0 0 0 '+x+' '+r1(y+ry)+' Z');
    s+='<path d="M'+x+' '+r1(y+ry)+' A'+r1(w/2)+' '+r1(ry)+' 0 0 0 '+(x+w)+' '+r1(y+ry)+'" fill="none" stroke="'+(bw?st:'none')+'" stroke-width="'+bw+'"/>';ty=y+h/2+ry/2}
  else if(k==='cube'){var d=Math.min(20,w*0.18,h*0.18);
    s+='<rect x="'+x+'" y="'+r1(y+d)+'" width="'+r1(w-d)+'" height="'+r1(h-d)+'"'+a+'/>';
    s+='<path d="'+pxPoly([[x,y+d],[x+d,y],[x+w,y],[x+w-d,y+d]])+'"'+a+'/><path d="'+pxPoly([[x,y+d],[x+d,y],[x+w,y],[x+w-d,y+d]])+'" fill="#000" fill-opacity=".05"/>';
    s+='<path d="'+pxPoly([[x+w-d,y+d],[x+w,y],[x+w,y+h-d],[x+w-d,y+h]])+'"'+a+'/><path d="'+pxPoly([[x+w-d,y+d],[x+w,y],[x+w,y+h-d],[x+w-d,y+h]])+'" fill="#000" fill-opacity=".12"/>';
    tx=x+(w-d)/2;ty=y+d+(h-d)/2;tw=w-d-16}
  else if(k==='cloud'){P(pxNorm('M.26 .92 C.08 .92 .0 .74 .1 .6 C.02 .42 .18 .24 .36 .3 C.42 .08 .7 .04 .78 .26 C.96 .24 1 .46 .92 .58 C1 .76 .9 .94 .74 .92 Z',x,y,w,h));tw=w*0.62;ty=y+h*0.6}
  else if(k==='callout'){var yb=y+h*0.78,rr=Math.min(12,h*0.15);P('M'+r1(x+rr)+' '+y+' H'+r1(x+w-rr)+' Q'+(x+w)+' '+y+' '+(x+w)+' '+r1(y+rr)+' V'+r1(yb-rr)+' Q'+(x+w)+' '+r1(yb)+' '+r1(x+w-rr)+' '+r1(yb)+' H'+r1(x+w*0.36)+' L'+r1(x+w*0.18)+' '+(y+h)+' L'+r1(x+w*0.22)+' '+r1(yb)+' H'+r1(x+rr)+' Q'+x+' '+r1(yb)+' '+x+' '+r1(yb-rr)+' V'+r1(y+rr)+' Q'+x+' '+y+' '+r1(x+rr)+' '+y+' Z');ty=(y+yb)/2}
  else if(k==='arrowR'||k==='arrowL'||k==='arrow2'){
    var hl=Math.min(w*0.36,h*0.9),q1=y+h*0.26,q2=y+h*0.74,pts;
    if(k==='arrowR')pts=[[x,q1],[x+w-hl,q1],[x+w-hl,y],[x+w,y+h/2],[x+w-hl,y+h],[x+w-hl,q2],[x,q2]];
    else if(k==='arrowL')pts=[[x+w,q1],[x+hl,q1],[x+hl,y],[x,y+h/2],[x+hl,y+h],[x+hl,q2],[x+w,q2]];
    else{hl=Math.min(w*0.26,h*0.9);pts=[[x,y+h/2],[x+hl,y],[x+hl,q1],[x+w-hl,q1],[x+w-hl,y],[x+w,y+h/2],[x+w-hl,y+h],[x+w-hl,q2],[x+hl,q2],[x+hl,y+h]]}
    P(pxPoly(pts));tw=k==='arrow2'?w-2*hl:w-hl-10;tx=k==='arrowR'?x+(w-hl)/2:k==='arrowL'?x+hl+(w-hl)/2:x+w/2}
  else if(k==='chevron'){var p=Math.min(w*0.3,h*0.5);P(pxPoly([[x,y],[x+w-p,y],[x+w,y+h/2],[x+w-p,y+h],[x,y+h],[x+p,y+h/2]]));tw=w-2*p-6}
  else if(k==='plus'){var t3=Math.min(w,h)*0.32,cx=x+w/2,cy=y+h/2;P(pxPoly([[cx-t3/2,y],[cx+t3/2,y],[cx+t3/2,cy-t3/2],[x+w,cy-t3/2],[x+w,cy+t3/2],[cx+t3/2,cy+t3/2],[cx+t3/2,y+h],[cx-t3/2,y+h],[cx-t3/2,cy+t3/2],[x,cy+t3/2],[x,cy-t3/2],[cx-t3/2,cy-t3/2]]));tw=t3+20}
  else if(k==='heart'){P(pxNorm('M.5 .97 C.16 .72 0 .52 0 .3 C0 .12 .14 0 .3 0 C.4 0 .47 .06 .5 .15 C.53 .06 .6 0 .7 0 C.86 0 1 .12 1 .3 C1 .52 .84 .72 .5 .97 Z',x,y,w,h));tw=w*0.6;ty=y+h*0.42}
  if(!noLabel&&n.label)s+=tblock(tx,ty,wrapText(n.label,Math.max(30,tw),n.fs||13),{fs:n.fs||13,vcenter:1,w:n.bold?700:null,fill:validColor(n.textColor)?n.textColor:TH.text});
  return s;
}
var pxDrawShape0=drawShape;
drawShape=function(n,noLabel){var k=(T[n.t]||{}).k;if(k&&k.indexOf('px-')===0)return pxShape(n,noLabel,k.slice(3));return pxDrawShape0(n,noLabel)};

// ---------- gradients ----------
var PX_GRAD_PRE=[['#ffffff','#d5e9ea'],['#0e6169','#3e959d'],['#f8fafc','#dbe3ee'],['#fff3c4','#ffd6c2'],['#efe6ff','#d9e6ff'],['#ddf4ea','#b9e3ef'],['#1b2230','#3a4458'],['#ffe7d6','#fbcfe8']];
function pxGradOk(g){return !!g&&typeof g==='object'&&validColor(g.a)&&validColor(g.b)}
function pxGradDef(id,g){
  if(g.d==='r')return '<radialGradient id="'+id+'" cx=".5" cy=".45" r=".72"><stop offset="0" stop-color="'+g.a+'"/><stop offset="1" stop-color="'+g.b+'"/></radialGradient>';
  var v={h:[0,0,1,0],v:[0,0,0,1],d:[0,0,1,1],u:[0,1,1,0]}[g.d]||[0,0,0,1];
  return '<linearGradient id="'+id+'" x1="'+v[0]+'" y1="'+v[1]+'" x2="'+v[2]+'" y2="'+v[3]+'"><stop offset="0" stop-color="'+g.a+'"/><stop offset="1" stop-color="'+g.b+'"/></linearGradient>';
}
function pxApplyGrad(s,n){
  var id='pxg-'+n.id,g=document.createElementNS(NS,'g');g.innerHTML=s;
  var els=g.querySelectorAll('rect,path,circle,ellipse,polygon'),hit=null;
  for(var i=0;i<els.length;i++){var fv=els[i].getAttribute('fill');if(fv&&fv!=='none'&&fv!=='transparent'&&!/^url/.test(fv)){hit=els[i];break}}
  if(!hit)return s;hit.setAttribute('fill','url(#'+id+')');hit.removeAttribute('fill-opacity');
  return '<defs>'+pxGradDef(id,n.grad)+'</defs>'+g.innerHTML;
}
// UML: {static} → underline, {abstract} → italic (UML/PlantUML convention)
function pxUmlDeco(s){
  if(s.indexOf('{static}')<0&&s.indexOf('{abstract}')<0)return s;
  return s.replace(/<tspan([^>]*)>([^<]*)<\/tspan>/g,function(m,at,t){var dec='';
    if(t.indexOf('{static}')>=0){t=t.replace(/\s*\{static\}\s*/g,' ').trim();dec+=' text-decoration="underline"'}
    if(t.indexOf('{abstract}')>=0){t=t.replace(/\s*\{abstract\}\s*/g,' ').trim();dec+=' font-style="italic"'}
    return '<tspan'+at+dec+'>'+t+'</tspan>'});
}

// ---------- images ----------
var PX_IMG_RE=/^data:image\/(png|jpeg|gif|webp|avif|svg\+xml);base64,[A-Za-z0-9+\/=]+$/;
var pxBlobs=new Map();
function pxBlobUrl(src){
  var u=pxBlobs.get(src);if(u)return u;
  try{var i=src.indexOf(','),mime=src.slice(5,src.indexOf(';')),bin=atob(src.slice(i+1)),arr=new Uint8Array(bin.length);for(var j=0;j<bin.length;j++)arr[j]=bin.charCodeAt(j);
    u=URL.createObjectURL(new Blob([arr],{type:mime}));}catch(e){u=src}
  if(pxBlobs.size>60){pxBlobs.forEach(function(v){try{URL.revokeObjectURL(v)}catch(e){}});pxBlobs.clear()}
  pxBlobs.set(src,u);return u;
}
function pxDrawImg(n,noLabel){
  var x=n.x,y=n.y,w=n.w,h=n.h,r=n.rad!=null&&isFinite(+n.rad)?+n.rad:10,s='',cid='pxc-'+n.id;
  if(n.src&&PX_IMG_RE.test(n.src)){
    s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+(validColor(n.fill)?n.fill:'transparent')+'"/>';
    s+='<defs><clipPath id="'+cid+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'"/></clipPath></defs>';
    s+='<image href="'+(exporting?n.src:pxBlobUrl(n.src))+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid '+(n.fit==='cover'?'slice':n.fit==='fill'?'none':'meet')+'"'+(n.fit==='fill'?' ':'')+' clip-path="url(#'+cid+')"/>';
    if(n.bw>0||validColor(n.stroke))s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="none" stroke="'+(validColor(n.stroke)?n.stroke:TH.ink)+'" stroke-width="'+(n.bw>0?n.bw:1.6)+'"/>';
  }else if(exporting||PX_SHOW.on){
    s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+TH.shape+'" fill-opacity="0"/>';
  }else{
    var cx=x+w/2,cy=y+h/2,small=w<230;
    s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+TH.shape+'" stroke="'+TH.muted+'" stroke-opacity=".6" stroke-width="1.4" stroke-dasharray="6 5"/>';
    s+=iconG('image-plus',cx-16,cy-(small?16:30),1.33,TH.muted,1.6);
    if(!small)s+=tblock(cx,cy+18,['Klik dua kali untuk memilih gambar'],{fs:12,fill:TH.muted});
  }
  if(!noLabel&&n.label)s+=tblock(x+w/2,y+h+8,wrapText(n.label,Math.max(120,w),12),{fs:12,fill:validColor(n.textColor)?n.textColor:TH.muted});
  return s;
}
function pxReadImage(file,cb){
  if(!file||!/^image\/(png|jpeg|gif|webp|avif|svg\+xml)$/.test(file.type)){toast('Format gambar tidak didukung. Pakai PNG, JPG, WebP, GIF, AVIF atau SVG.');return}
  if(file.size>25e6){toast('Gambar terlalu besar (maksimal 25 MB)');return}
  var rd=new FileReader();
  rd.onerror=function(){toast('Gambar tidak bisa dibaca')};
  rd.onload=function(){
    var url=String(rd.result||'');if(!PX_IMG_RE.test(url)){toast('Gambar tidak bisa dibaca');return}
    var im=new Image();
    im.onerror=function(){toast('Gambar tidak bisa dibuka')};
    im.onload=function(){
      var W=im.naturalWidth||400,H=im.naturalHeight||300;
      if(file.type==='image/svg+xml'){if(url.length>800000){toast('File SVG terlalu besar (maksimal ±600 KB)');return}cb(url,W,H);return}
      var M=1600,sc=Math.min(1,M/Math.max(W,H));
      if(file.type==='image/gif'&&file.size<2e6){cb(url,W,H);return}
      if(sc===1&&file.size<350000){cb(url,W,H);return}
      var c=document.createElement('canvas');c.width=Math.max(1,Math.round(W*sc));c.height=Math.max(1,Math.round(H*sc));
      var g=c.getContext('2d');g.drawImage(im,0,0,c.width,c.height);
      var out=c.toDataURL('image/webp',0.86);if(out.indexOf('data:image/webp')!==0)out=c.toDataURL(file.type==='image/jpeg'?'image/jpeg':'image/png',0.88);
      cb(PX_IMG_RE.test(out)?out:url,c.width,c.height);
    };
    im.src=url;
  };
  rd.readAsDataURL(file);
}
var pxImgTarget=null;
function pxPickImage(target){pxImgTarget=target||null;var inp=$('pxImgIn');inp.value='';inp.click()}
function pxFitBox(W,H,max){var sc=Math.min(1,max/Math.max(W,H));return[Math.max(40,Math.round(W*sc)),Math.max(30,Math.round(H*sc))]}
function pxAddImages(files,at){
  files=[].slice.call(files||[]).filter(function(f){return /^image\//.test(f.type)});if(!files.length)return;
  var base=at||viewCenter(),i=0,added=[];commitEdit();pushUndo();
  (function next(){
    if(i>=files.length){if(added.length){setSel(added);renderAll();toast(added.length>1?added.length+' gambar ditambahkan':'Gambar ditambahkan. Seret sudutnya untuk mengubah ukuran.')}return}
    var f=files[i],k=i++;
    pxReadImage(f,function(src,W,H){
      var sz=pxFitBox(W,H,420),n=addNode('media-img',base.x+k*30,base.y+k*30);
      n.src=src;n.iw=W;n.ih=H;n.w=sz[0];n.h=sz[1];n.x=snap(base.x+k*30-n.w/2);n.y=snap(base.y+k*30-n.h/2);
      n.label='';added.push(n.id);render();next();
    });
  })();
}
function pxReplaceImage(n,file){pxReadImage(file,function(src,W,H){pushUndo();var c=center(n),sz=pxFitBox(W,H,Math.max(n.w,n.h,240));n.src=src;n.iw=W;n.ih=H;n.w=sz[0];n.h=sz[1];n.x=snap(c.x-n.w/2);n.y=snap(c.y-n.h/2);renderAll();toast('Gambar diganti')})}

// ---------- legend ----------
function pxLegendRows(n){
  var dt=dtOf(),types=[],rows=[];
  if(n.scope==='all')types=edgeKeys(dt);
  else S.edges.forEach(function(e){if(EDGE[e.type]&&types.indexOf(e.type)<0)types.push(e.type)});
  if(!types.length)types=edgeKeys(dt).slice(0,8);
  types.forEach(function(k){if(EDGE[k])rows.push({k:'e',type:k,name:EDGE[k].n,mean:PX_MEAN[k]||''})});
  var cfs=[];S.edges.forEach(function(e){if(e.type==='cf'){[e.c1||'only',e.c2||'zmany'].forEach(function(v){if(cfs.indexOf(v)<0)cfs.push(v)})}});
  if(n.scope==='all'&&(dt==='erd'||cfs.length))cfs=CF_OPTS.map(function(o){return o[0]});
  cfs.forEach(function(v){rows.push({k:'cf',v:v,name:PX_CF[v]||v,mean:(CF_OPTS.filter(function(o){return o[0]===v})[0]||['',''])[1].replace(/^[^(]*/,'').trim()})});
  var hasClass=dt==='class'||S.nodes.some(function(o){return o.t==='u-class'||o.t==='u-interface'});
  if(hasClass){PX_VIS.forEach(function(v){rows.push({k:'vis',sym:v[0],name:v[1],mean:v[2]})});
    rows.push({k:'deco',sym:'abc',deco:'underline',name:'{static}',mean:'milik class, bukan objek (digarisbawahi)'});
    rows.push({k:'deco',sym:'abc',deco:'italic',name:'{abstract}',mean:'harus diimplementasikan subclass (miring)'})}
  return rows;
}
function pxSample(row,x,cy,c,w){
  if(row.k==='e'){var k=EDGE[row.type]||EDGE.line,ms=k.cf?'cf-only':k.start,me=k.cf?'cf-zmany':k.end;
    return '<path d="M'+r1(x)+' '+r1(cy)+' H'+r1(x+w)+'" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round"'+(k.dash?' stroke-dasharray="'+k.dash+'"':'')+(me?' marker-end="'+mref(me,c,1.5)+'"':'')+(ms?' marker-start="'+mref(ms,c,1.5)+'"':'')+'/>'}
  if(row.k==='cf')return '<path d="M'+r1(x)+' '+r1(cy)+' H'+r1(x+w)+'" fill="none" stroke="'+c+'" stroke-width="1.5" marker-end="'+mref('cf-'+row.v,c,1.5)+'"/>';
  if(row.k==='vis')return '<text x="'+r1(x+w/2)+'" y="'+r1(cy+6)+'" text-anchor="middle" font-size="17" font-weight="700" font-family="Geist Mono, ui-monospace, monospace" fill="'+c+'">'+esc(row.sym)+'</text>';
  return '<text x="'+r1(x+w/2)+'" y="'+r1(cy+4.5)+'" text-anchor="middle" font-size="13"'+(row.deco==='underline'?' text-decoration="underline"':' font-style="italic"')+' fill="'+c+'">'+row.sym+'</text>';
}
function pxDrawLegend(n,noLabel){
  var rows=pxLegendRows(n),x=n.x,y=n.y,w=Math.max(220,n.w),c=validColor(n.stroke)?n.stroke:TH.ink,tc=validColor(n.textColor)?n.textColor:TH.text,s='',brief=!!n.brief;
  var tx=x+92,mw=w-tx+x-14,yy=y+46,body='';
  rows.forEach(function(r){
    var ml=brief||!r.mean?[]:wrapText(r.mean,mw,11).slice(0,2),rh=brief?24:Math.max(28,20+ml.length*14);
    var cy=yy+(brief?rh/2:11);
    body+=pxSample(r,x+16,cy,c,58);
    body+=tblock(tx,cy,[r.k==='e'&&typeof trT==='function'?trT(r.name):r.name],{fs:12,w:600,vcenter:1,anchor:'start',fill:tc});
    if(ml.length)body+=tblock(tx,cy+8,ml,{fs:11,lh:14,anchor:'start',fill:TH.muted});
    yy+=rh;
  });
  var rl=brief?[]:wrapText(PX_RULE,w-28,10.5),foot=rl.length?rl.length*13+14:4;
  n.w=w;n.h=Math.round(yy-y+foot+6);
  var bg=validColor(n.fill)?n.fill:TH.card;
  s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+n.h+'" rx="10" fill="'+bg+'" stroke="'+TH.ink+'" stroke-opacity=".18" stroke-width="1"/>';
  s+=tblock(x+16,y+14,[n.label||'Legenda'],{fs:13,w:700,anchor:'start',fill:tc});
  s+='<line x1="'+(x+16)+'" y1="'+(y+36)+'" x2="'+(x+w-16)+'" y2="'+(y+36)+'" stroke="'+TH.ink+'" stroke-opacity=".12"/>';
  s+=body;
  if(rl.length)s+='<line x1="'+(x+16)+'" y1="'+r1(yy+4)+'" x2="'+(x+w-16)+'" y2="'+r1(yy+4)+'" stroke="'+TH.ink+'" stroke-opacity=".12"/>'+tblock(x+16,yy+10,rl,{fs:10.5,lh:13,anchor:'start',fill:TH.muted});
  return s;
}
// small standalone sample for HTML panels (own marker defs, so it never depends on what the canvas used)
function pxSampleSvg(row){
  var keep=mUsed;mUsed={};var c=TH.ink,p=pxSample(row,6,12,c,60),defs=markerDefs();mUsed=keep;
  return '<svg class="px-smp" viewBox="0 0 72 24" aria-hidden="true"><defs>'+defs.replace(/id="m-/g,'id="lm-')+'</defs>'+p.replace(/url\(#m-/g,'url(#lm-')+'</svg>';
}

// ---------- slides ----------
var PX_SHOW={on:false,i:0,cam:null};
function pxSlides(){return S.nodes.filter(function(n){return fam(n)==='slide'})}
function pxDrawSlide(n,noLabel){
  var x=n.x,y=n.y,w=n.w,h=n.h,r=n.rad!=null&&isFinite(+n.rad)?+n.rad:8,s='',id='pxg-'+n.id,idx=pxSlides().indexOf(n)+1;
  var fill=pxGradOk(n.grad)?'url(#'+id+')':validColor(n.fill)?n.fill:TH.paper;
  if(pxGradOk(n.grad))s+='<defs>'+pxGradDef(id,n.grad)+'</defs>';
  if(!exporting&&!PX_SHOW.on)s+='<rect x="'+x+'" y="'+(y+6)+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+TH.shadow+'" fill-opacity=".07"/>';
  s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(exporting?0:r)+'" fill="'+fill+'" stroke="'+(validColor(n.stroke)?n.stroke:TH.ink)+'" stroke-opacity="'+(validColor(n.stroke)?1:0.16)+'" stroke-width="'+(validColor(n.stroke)?pxBW(n):1)+'"/>';
  if(!exporting&&!PX_SHOW.on&&!noLabel)s+=tblock(x+2,y-26,['Slide '+(idx||1)+(n.label?' · '+String(n.label).split('\n')[0]:'')],{fs:13,w:600,anchor:'start',fill:TH.muted});
  return s;
}
function pxSlideBox(n){return{x:n.x,y:n.y,w:n.w,h:n.h}}
function pxMembers(sl){
  var b=pxSlideBox(sl),ids={},list=[sl];ids[sl.id]=1;
  S.nodes.forEach(function(o){if(o===sl||fam(o)==='slide')return;var cx=o.x+o.w/2,cy=o.y+o.h/2;if(cx>=b.x&&cx<=b.x+b.w&&cy>=b.y&&cy<=b.y+b.h){list.push(o);ids[o.id]=1}});
  var edges=S.edges.filter(function(e){if(e.from||e.to)return(!e.from||ids[e.from])&&(!e.to||ids[e.to]);var p=route(e);return p&&p.every(function(q){return q.x>=b.x&&q.x<=b.x+b.w&&q.y>=b.y&&q.y<=b.y+b.h})});
  return{nodes:list,edges:edges};
}
function pxSlideSvg(sl){
  var m=pxMembers(sl);exporting=true;mUsed={};
  var body=drawAll(m.nodes,m.edges),defs=markerDefs();exporting=false;mUsed={};render();
  body=body.replace(/ data-(id|eid|lane|halo)="[^"]*"/g,'');var sk=S.style==='sketch';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+sl.w+'" height="'+sl.h+'" viewBox="'+sl.x+' '+sl.y+' '+sl.w+' '+sl.h+'" font-family="'+esc(FONT)+'">'+
    (sk?'<style>@font-face{font-family:Virgil;src:url('+SKETCH_FONT_URI+') format("woff2")}</style>':'')+(usesExcali()?'<style>'+EXCALI_FONT_CSS+'</style>':'')+'<defs>'+defs+(sk?'<filter id="sketchF" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="nz"/><feDisplacementMap in="SourceGraphic" in2="nz" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>':'')+'</defs>'+
    '<g'+(sk?' filter="url(#sketchF)"':'')+'>'+body+'</g></svg>';
}
function pxSlidePng(sl,cb){
  var str=pxSlideSvg(sl),sc=Math.min(2,4000/Math.max(sl.w,sl.h)),img=new Image();
  img.onload=function(){var c=document.createElement('canvas');c.width=Math.round(sl.w*sc);c.height=Math.round(sl.h*sc);var g=c.getContext('2d');g.fillStyle=TH.paper;g.fillRect(0,0,c.width,c.height);g.scale(sc,sc);g.drawImage(img,0,0);c.toBlob(function(b){cb(b)},'image/png')};
  img.onerror=function(){toast('Slide tidak bisa dirender');cb(null)};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(str);
}
function pxExportSlides(which){
  commitEdit();var list=which?[which]:pxSlides();if(!list.length){toast('Belum ada slide');return}
  var base=slug(DOC.title),i=0;
  (function next(){if(i>=list.length)return;var sl=list[i++],num=pxSlides().indexOf(sl)+1;pxSlidePng(sl,function(b){if(b)Promise.resolve(offerFile(base+'-slide-'+(num<10?'0':'')+num+'.png',b)).then(next,next);else next()})})();
}
function pxPrintSlides(){
  commitEdit();var list=pxSlides();if(!list.length){toast('Belum ada slide');return}
  var old=$('pxPrint');if(old)old.remove();
  var box=document.createElement('div');box.id='pxPrint';box.setAttribute('aria-hidden','true');
  var st=document.createElement('style');st.textContent='@page{size:'+list[0].w+'px '+list[0].h+'px;margin:0}';box.appendChild(st);
  list.forEach(function(sl){var im=document.createElement('img');im.alt='';im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(pxSlideSvg(sl));box.appendChild(im)});
  document.body.appendChild(box);
  var done=function(){window.removeEventListener('afterprint',done);setTimeout(function(){box.remove()},400)};
  window.addEventListener('afterprint',done);
  setTimeout(function(){try{window.print()}catch(e){box.remove();toast('Browser ini memblokir cetak. Pakai “Unduh PNG”.')}},150);
}
function pxNewSlide(after,frame){
  commitEdit();pushUndo();
  var all=pxSlides(),ref=after||all[all.length-1],w=ref?ref.w:960,h=ref?ref.h:540,x,y;
  if(frame){var b=frame;var tw=Math.max(b.w+96,(b.h+96)*16/9);w=Math.ceil(tw/10)*10;h=Math.ceil(w*9/16/10)*10;if(h<b.h+96){h=Math.ceil((b.h+96)/10)*10;w=Math.ceil(h*16/9/10)*10}x=snap(b.x+b.w/2-w/2);y=snap(b.y+b.h/2-h/2)}
  else if(ref){x=snap(ref.x+ref.w+120);y=snap(ref.y)}
  else{var bb=bounds(S.nodes,S.edges);if(bb){x=snap(bb.x+bb.w+200);y=snap(bb.y)}else{var c=viewCenter();x=snap(c.x-w/2);y=snap(c.y-h/2)}}
  var sl=addNode('slide',0,0);sl.x=x;sl.y=y;sl.w=w;sl.h=h;sl.label='';
  var ix=S.nodes.indexOf(sl);S.nodes.splice(ix,1);
  var at=after?S.nodes.indexOf(after)+1:(function(){var last=all[all.length-1];return last?S.nodes.indexOf(last)+1:0})();
  S.nodes.splice(at,0,sl);
  if(!frame){var t=addNode('text-h',0,0);t.label='Judul slide';t.fs=34;t.bold=1;t.align='left';t.w=Math.min(720,w-120);t.h=56;t.x=snap(x+64);t.y=snap(y+56)}
  setSel([sl.id]);renderAll();pxStripOpen(true);
  var r=vr();cam.z=Math.min(1,Math.max(0.2,Math.min((r.width-80)/w,(r.height-260)/h)));cam.x=x+w/2-r.width/2/cam.z;cam.y=y+h/2-(r.height/2-40)/cam.z;applyCam();renderOver();
  toast(frame?'Pilihan dibingkai jadi slide':'Slide '+(pxSlides().indexOf(sl)+1)+' dibuat. Taruh teks, bentuk, atau gambar di dalamnya.');
  return sl;
}
function pxMoveSlide(sl,dir){
  var all=pxSlides(),i=all.indexOf(sl),j=i+dir;if(i<0||j<0||j>=all.length)return;pushUndo();
  var other=all[j],a=S.nodes.indexOf(sl),b=S.nodes.indexOf(other);S.nodes[a]=other;S.nodes[b]=sl;renderAll();
}
function pxFocus(sl,full){
  var r=vr(),pad=full?0:60,z=Math.min((r.width-pad*2)/sl.w,(r.height-pad*2-(full?0:200))/sl.h);if(full)z*=0.97;
  cam.z=clamp(z,0.05,8);cam.x=sl.x+sl.w/2-r.width/2/cam.z;cam.y=sl.y+sl.h/2-(full?r.height/2:(r.height/2-40))/cam.z;applyCam();renderOver();
}
function pxMask(){
  var m=$('pxMask');if(!m)return;
  if(!PX_SHOW.on){m.setAttribute('d','');return}
  var sl=pxSlides()[PX_SHOW.i];if(!sl){m.setAttribute('d','');return}
  var B=1e6;m.setAttribute('d','M'+(-B)+' '+(-B)+' H'+B+' V'+B+' H'+(-B)+' Z M'+sl.x+' '+sl.y+' V'+(sl.y+sl.h)+' H'+(sl.x+sl.w)+' V'+sl.y+' Z');
}
function pxShowGo(i){
  var all=pxSlides();if(!all.length)return;PX_SHOW.i=clamp(i,0,all.length-1);
  pxFocus(all[PX_SHOW.i],true);pxMask();
  $('pxShowLbl').textContent=(PX_SHOW.i+1)+' / '+all.length;
  $('pxShowPrev').disabled=PX_SHOW.i<=0;$('pxShowNext').disabled=PX_SHOW.i>=all.length-1;
  var c=content;c.classList.remove('px-fade');void c.getBoundingClientRect();c.classList.add('px-fade');
}
function pxShowStart(from){
  var all=pxSlides();if(!all.length){toast('Buat slide dulu dengan tombol “Slide”');return}
  commitEdit();if(SIM.on)simClose();
  PX_SHOW.on=true;PX_SHOW.cam={x:cam.x,y:cam.y,z:cam.z};selN=[];selE=null;
  document.querySelector('.app').classList.add('present','slideshow');$('pxShow').hidden=false;
  try{var el=document.documentElement;if(el.requestFullscreen&&!document.fullscreenElement)el.requestFullscreen().catch(function(){})}catch(e){}
  render();renderInsp();
  setTimeout(function(){pxShowGo(from!=null?from:0);$('pxShow').focus()},70);
}
function pxShowStop(){
  if(!PX_SHOW.on)return;PX_SHOW.on=false;$('pxShow').hidden=true;
  document.querySelector('.app').classList.remove('present','slideshow');content.classList.remove('px-fade');
  try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(function(){})}catch(e){}
  pxMask();render();
  setTimeout(function(){if(PX_SHOW.cam){cam=PX_SHOW.cam;applyCam();renderOver()}},70);
}

// ---------- slide strip ----------
var pxStripOn=false,pxStripSig='';
function pxStripOpen(on){pxStripOn=on===undefined?!pxStripOn:on;pxSyncStrip(true)}
function pxSyncStrip(force){
  var el=$('pxStrip');if(!el)return;var all=pxSlides();
  var b=$('btnSlides');if(b){b.classList.toggle('on',pxStripOn);b.setAttribute('aria-pressed',pxStripOn?'true':'false')}
  el.hidden=!pxStripOn||PX_SHOW.on;document.body.classList.toggle('px-strip-on',!el.hidden);document.body.classList.toggle('px-show',PX_SHOW.on);if(el.hidden)return;
  var cur=single(),sig=all.map(function(n){return n.id+':'+n.x+','+n.y+','+n.w+','+n.h+(cur===n?'*':'')}).join('|')+'#'+selN.length;
  if(!force&&sig===pxStripSig)return;pxStripSig=sig;
  var s='<div class="px-thumbs" role="list">';
  all.forEach(function(n,i){s+='<button type="button" role="listitem" class="px-th'+(cur===n?' on':'')+'" data-slide="'+n.id+'" title="Slide '+(i+1)+(n.label?' · '+esc(n.label):'')+'"><svg viewBox="'+n.x+' '+n.y+' '+n.w+' '+n.h+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><use href="#content"/></svg><span>'+(i+1)+'</span></button>'});
  s+='<button type="button" class="px-add" data-px="slide-add" title="Tambah slide baru">'+ic('plus')+'<span>Slide</span></button>';
  if(selN.length&&!(cur&&fam(cur)==='slide'))s+='<button type="button" class="px-add" data-px="slide-frame" title="Bingkai elemen yang dipilih menjadi slide">'+ic('frame')+'<span>Bingkai</span></button>';
  s+='</div><span class="tsep"></span><button type="button" class="tb" data-px="show" title="Presentasikan (←/→ untuk pindah, Esc keluar)" aria-label="Presentasikan"'+(all.length?'':' disabled')+'>'+ic('circle-play')+'<span class="lbl">Present</span></button>';
  s+='<button type="button" class="tb" data-px="slides-png" title="Unduh semua slide sebagai PNG" aria-label="Unduh semua slide PNG"'+(all.length?'':' disabled')+'>'+ic('image-down')+'</button>';
  s+='<button type="button" class="tb" data-px="slides-print" title="Cetak / simpan sebagai PDF (satu slide per halaman)" aria-label="Cetak atau PDF"'+(all.length?'':' disabled')+'>'+ic('printer')+'</button>';
  s+='<button type="button" class="tb" data-px="strip-close" title="Tutup panel slide" aria-label="Tutup panel slide">'+ic('x')+'</button>';
  el.innerHTML=s;
}

// ---------- hook into drawing ----------
var pxDrawNode0=drawNode;
drawNode=function(n,noLabel){
  var f=fam(n);
  if(f==='img')return pxDrawImg(n,noLabel);
  if(f==='legend')return pxDrawLegend(n,noLabel);
  if(f==='slide')return pxDrawSlide(n,noLabel);
  var s=pxDrawNode0(n,noLabel);
  if(f==='uml')s=pxUmlDeco(s);
  if(pxGradOk(n.grad)&&f!=='draw'&&f!=='text')s=pxApplyGrad(s,n);
  return s;
};
// slides always sit at the very back; everything else keeps the original layering
drawAll=function(nodes,edges){
  computeTree();
  nodes.forEach(autosize);
  var slides=[],back=[],zones=[],groups=[],others=[];
  nodes.forEach(function(n){var f=fam(n);(f==='slide'?slides:f==='pool'?back:(f==='zone'||f==='box')?zones:(f==='group'||f==='cell'||isLife(n)||n.t==='u-seq-act')?groups:others).push(n)});
  zones.sort(function(a,b){return b.w*b.h-a.w*a.h});
  groups.sort(function(a,b){var la=isLife(a)?1:a.t==='u-seq-act'?2:0,lb=isLife(b)?1:b.t==='u-seq-act'?2:0;if(la!==lb)return la-lb;return b.w*b.h-a.w*a.h});
  var s='';
  slides.concat(back,zones,groups).forEach(function(n){s+='<g data-id="'+n.id+'">'+drawNode(n)+'</g>'});
  edges.forEach(function(e){s+=drawEdge(e)});
  others.forEach(function(n){s+='<g data-id="'+n.id+'">'+drawNode(n)+'</g>'});
  return s;
};
var pxRender0=render;
render=function(){pxRender0();pxSyncStrip();if(PX_SHOW.on)pxMask()};
var pxInsp0=renderInsp;
renderInsp=function(){pxInsp0();pxSyncStrip()};
var pxCustomPrev0=customPreview;
customPreview=function(t){
  var d=T[t];
  if(d&&d.k&&d.k.indexOf('px-')===0){var sz=d.sz,sc=Math.min(56/sz[0],40/sz[1]),n={id:'p',t:t,x:0,y:0,w:Math.round(sz[0]*sc),h:Math.round(sz[1]*sc),label:'',bw:1.3};return svgWrap('-3 -3 '+(n.w+6)+' '+(n.h+6),pxShape(n,true,d.k.slice(3)))}
  var I=TH.ink,F=TH.shape,M=TH.muted,A=TH.name==='dark'?'#6db5bb':'#0e6169';
  if(t==='media-img')return svgWrap('0 0 48 40','<rect x="4" y="5" width="40" height="30" rx="4" fill="'+F+'" stroke="'+I+'" stroke-width="1.3"/><circle cx="15" cy="14" r="3.2" fill="'+A+'" fill-opacity=".55"/><path d="M6 32L18 21L26 28L32 23L42 32" fill="none" stroke="'+I+'" stroke-width="1.3" stroke-linejoin="round"/>');
  if(t==='legend')return svgWrap('0 0 48 40','<rect x="3" y="3" width="42" height="34" rx="4" fill="'+F+'" stroke="'+I+'" stroke-opacity=".5" stroke-width="1.1"/><path d="M8 13H20" stroke="'+I+'" stroke-width="1.4"/><path d="M8 21H20" stroke="'+I+'" stroke-width="1.4" stroke-dasharray="3 2.4"/><path d="M8 29H20" stroke="'+I+'" stroke-width="1.4" stroke-dasharray="1 2.4"/><path d="M24 13H40M24 21H37M24 29H39" stroke="'+M+'" stroke-width="1.6" stroke-linecap="round"/>');
  if(t==='slide')return svgWrap('0 0 48 40','<rect x="3" y="9" width="42" height="24" rx="2.5" fill="'+F+'" stroke="'+I+'" stroke-width="1.3"/><path d="M8 15H26" stroke="'+A+'" stroke-width="2.2" stroke-linecap="round"/><path d="M8 21H22M8 25H19" stroke="'+M+'" stroke-width="1.3" stroke-linecap="round"/><rect x="29" y="18" width="11" height="10" rx="1.5" fill="'+A+'" fill-opacity=".25"/>');
  return pxCustomPrev0(t);
};

// ---------- data safety ----------
function pxScrubNode(n){
  if(n.grad!=null){if(!pxGradOk(n.grad))delete n.grad;else n.grad={a:n.grad.a,b:n.grad.b,d:['h','v','d','u','r'].indexOf(n.grad.d)>=0?n.grad.d:'v'}}
  if(n.src!=null&&!(typeof n.src==='string'&&n.src.length<12e6&&PX_IMG_RE.test(n.src)))delete n.src;
  ['iw','ih','bw','rad'].forEach(function(k){if(n[k]!=null&&!isFinite(+n[k]))delete n[k];else if(n[k]!=null)n[k]=+n[k]});
  if(n.fit!=null&&['cover','meet','fill'].indexOf(n.fit)<0)delete n.fit;
  if(n.scope!=null&&n.scope!=='all')delete n.scope;
  if(n.data!=null)n.data=String(n.data).slice(0,20000);if(n.sub!=null)n.sub=String(n.sub);
  if(n.ctype!=null&&['bar','hbar','stack','line','area','pie','donut'].indexOf(n.ctype)<0)n.ctype='bar';
  if(n.layout!=null&&['cover','close'].indexOf(n.layout)<0)delete n.layout;
  if(n.box!=null&&['solid','dash'].indexOf(n.box)<0)delete n.box;
  ['section','fs','lh','pad','showVal'].forEach(function(k){if(n[k]!=null&&!isFinite(+n[k]))delete n[k];else if(n[k]!=null)n[k]=+n[k]});
  if(n.icon!=null&&!ICONS[n.icon])delete n.icon;
}
var pxSan0=sanitize;
sanitize=function(d){var r=pxSan0(d);r.nodes.forEach(pxScrubNode);return r};
var pxLoad0=loadDoc;
loadDoc=function(){var r=pxLoad0.apply(this,arguments);if(S.nodes.some(function(n){return fam(n)==='img'}))render();pxStripOn=pxSlides().length>0;pxSyncStrip(true);return r};

// ---------- inspector additions ----------
function pxGradSec(n){
  var g=pxGradOk(n.grad)?n.grad:null,s='<div class="sec"><div class="st">Gradasi</div>';
  s+='<div class="acts"><button type="button" class="sbtn'+(g?' on':'')+'" data-px="grad" aria-pressed="'+!!g+'">'+ic('layers')+(g?'Gradasi aktif':'Pakai gradasi')+'</button>'+(g?'<button type="button" class="sbtn" data-px="grad-swap" title="Tukar warna awal dan akhir">'+ic('arrow-right-left')+'Tukar</button>':'')+'</div>';
  if(g){
    s+='<div class="px-grow"><label class="px-cin" title="Warna awal"><span style="background:'+g.a+'"></span><input type="color" data-pxc="a" value="'+g.a+'" aria-label="Warna awal gradasi"></label><span class="px-gbar" style="background:linear-gradient(90deg,'+g.a+','+g.b+')"></span><label class="px-cin" title="Warna akhir"><span style="background:'+g.b+'"></span><input type="color" data-pxc="b" value="'+g.b+'" aria-label="Warna akhir gradasi"></label></div>';
    s+='<div class="fld"><span>Arah</span><div class="seg">'+[['h','→'],['v','↓'],['d','↘'],['u','↗'],['r','◎']].map(function(o){return '<button type="button" data-px="grad-d" data-v="'+o[0]+'" class="'+((g.d||'v')===o[0]?'on':'')+'" title="'+({h:'Horizontal',v:'Vertikal',d:'Diagonal turun',u:'Diagonal naik',r:'Radial'})[o[0]]+'">'+o[1]+'</button>'}).join('')+'</div></div>';
  }
  s+='<div class="fld"><span>Preset</span><div class="px-pre">'+PX_GRAD_PRE.map(function(p){return '<button type="button" data-px="grad-pre" data-v="'+p[0]+','+p[1]+'" style="background:linear-gradient(135deg,'+p[0]+','+p[1]+')" title="'+p[0]+' → '+p[1]+'" aria-label="Gradasi '+p[0]+' ke '+p[1]+'"></button>'}).join('')+'</div></div>';
  return s+'</div>';
}
var pxApp0=appearance;
appearance=function(n){
  var f=fam(n),s=pxApp0(n);
  if(f!=='draw'&&f!=='text'&&f!=='ann'&&f!=='img'&&f!=='pool')s+=pxGradSec(n);
  if((f==='shape'&&String(T[n.t].k).indexOf('px-')===0)||f==='img'||f==='slide')
    s+='<div class="sec"><div class="st">Garis tepi</div><div class="fld"><span>Ketebalan</span>'+segIn('bw',n.bw==null?'':String(n.bw),f==='img'?[['','Tanpa'],['1.5','Tipis'],['3','Tebal']]:[['','Normal'],['0','Tanpa'],['3','Tebal']])+'</div></div>';
  return s;
};
var pxContent0=contentFields;
contentFields=function(n){
  var f=fam(n),s=pxContent0(n);
  if(f==='uml'&&(n.t==='u-class'||n.t==='u-interface'||n.t==='u-abstract')){
    s+='<div class="fld"><span>Penanda OOP · klik ke baris yang dipilih di Attributes / Operations</span><div class="px-vis" role="group" aria-label="Visibilitas">'+
      PX_VIS.map(function(v){return '<button type="button" data-pxvis="'+v[0]+'" title="'+v[1]+': '+v[2]+'"><b>'+v[0]+'</b>'+v[1]+'</button>'}).join('')+
      '<button type="button" data-pxvis="" title="Hapus penanda visibilitas"><b>∅</b>none</button><button type="button" data-pxvis="{static}" title="Static: milik class (digarisbawahi)"><u>static</u></button><button type="button" data-pxvis="{abstract}" title="Abstract (dicetak miring)"><i>abstract</i></button></div></div>';
    s+='<p class="note">Format: <code>- nama: Tipe</code> untuk atribut, <code>+ simpan(id: int): bool</code> untuk method. Tulis <code>{abstract}</code> di nama class untuk class abstrak.</p>';
  }
  if(f==='img'){
    s+='<div class="acts"><button type="button" class="sbtn" data-px="img-pick">'+ic('image-plus')+(n.src?'Ganti gambar':'Pilih gambar')+'</button>'+(n.src&&n.iw?'<button type="button" class="sbtn" data-px="img-ratio" title="Kembalikan ke rasio asli gambar">'+ic('maximize')+'Rasio asli</button>':'')+'</div>';
    s+='<div class="fld"><span>Penyesuaian</span>'+segIn('fit',n.fit||'',[['','Utuh'],['cover','Isi penuh'],['fill','Regangkan']])+'</div>';
    s+='<div class="fld"><span>Sudut</span>'+segIn('rad',n.rad==null?'':String(n.rad),[['0','Tajam'],['','Halus'],['24','Bulat']])+'</div>';
    s=s.replace('>Label<','>Keterangan (opsional)<');
  }
  if(f==='legend'){
    s+='<div class="fld"><span>Isi legenda</span>'+segIn('scope',n.scope||'',[['','Yang dipakai'],['all','Semua notasi']])+'</div>';
    s+='<div class="acts">'+togBtn('brief',n.brief,'Ringkas (tanpa arti)')+'</div><p class="note">Legenda ikut berubah otomatis saat kamu menambah atau mengganti jenis garis.</p>';
  }
  if(f==='slide'){
    var all=pxSlides(),i=all.indexOf(n);
    s+='<div class="fld"><span>Rasio</span><div class="seg">'+[['16:9',16/9],['4:3',4/3],['1:1',1],['9:16',9/16]].map(function(r){return '<button type="button" data-px="slide-ratio" data-v="'+r[1]+'" class="'+(Math.abs(n.w/n.h-r[1])<0.02?'on':'')+'">'+r[0]+'</button>'}).join('')+'</div></div>';
    s+='<div class="acts"><button type="button" class="sbtn" data-px="show-this">'+ic('circle-play')+'Presentasikan dari sini</button><button type="button" class="sbtn" data-px="slide-after">'+ic('plus')+'Slide setelahnya</button>'+
      '<button type="button" class="sbtn" data-px="slide-up"'+(i<=0?' disabled':'')+'><span class="px-rot">'+ic('chevron-right')+'</span>Majukan</button><button type="button" class="sbtn" data-px="slide-down"'+(i>=all.length-1?' disabled':'')+'>'+ic('chevron-right')+'Mundurkan</button>'+
      '<button type="button" class="sbtn" data-px="slide-png">'+ic('image-down')+'Unduh PNG</button></div>';
    s=s.replace('>Label<','>Judul slide (catatan)<');
  }
  return s;
};
var pxEdge0=inspEdge;
inspEdge=function(e){var s=pxEdge0(e),m=PX_MEAN[e.type];if(!m)return s;var k=EDGE[e.type];
  return s.replace('</p>','</p><div class="px-mean">'+pxSampleSvg({k:'e',type:e.type})+'<div><b>Artinya</b><span>'+esc(m)+'</span>'+(k.dash?'<small>Garis putus-putus: hubungan tidak langsung / lemah.</small>':'')+'</div></div>')};
var pxDoc0=inspDoc;
inspDoc=function(){
  var s=pxDoc0(),dt=dtOf(),keys=edgeKeys(dt).filter(function(k){return EDGE[k]}),h='<div class="sec"><div class="st">Tanda & legenda</div><div class="px-leg">';
  keys.slice(0,14).forEach(function(k){h+='<div class="px-lr">'+pxSampleSvg({k:'e',type:k})+'<div><b>'+esc(EDGE[k].n)+'</b><span>'+esc(PX_MEAN[k]||'')+'</span></div></div>'});
  if(dt==='erd')CF_OPTS.forEach(function(o){h+='<div class="px-lr">'+pxSampleSvg({k:'cf',v:o[0]})+'<div><b>'+esc(PX_CF[o[0]])+'</b><span>'+esc(o[1].replace(/^[^(]*/,''))+'</span></div></div>'});
  if(dt==='class')PX_VIS.forEach(function(v){h+='<div class="px-lr"><span class="px-sym">'+esc(v[0])+'</span><div><b>'+v[1]+'</b><span>'+v[2]+'</span></div></div>'});
  h+='<p class="note">'+esc(PX_RULE)+'</p></div><div class="acts"><button type="button" class="sbtn" data-px="legend-add">'+ic('info')+'Sisipkan legenda ke kanvas</button></div></div>';
  var sl=pxSlides();
  h+='<div class="sec"><div class="st">Slide</div><p class="note">'+(sl.length?sl.length+' slide. Elemen yang titik tengahnya di dalam bingkai ikut masuk slide itu.':'Buat bingkai 16:9, isi dengan diagram, teks, bentuk, atau gambar, lalu presentasikan.')+'</p><div class="acts"><button type="button" class="sbtn" data-px="slide-add">'+ic('plus')+'Slide baru</button>'+(sl.length?'<button type="button" class="sbtn" data-px="show">'+ic('circle-play')+'Presentasikan</button><button type="button" class="sbtn" data-px="slides-print">'+ic('printer')+'PDF</button>':'')+'</div></div>';
  return s+h;
};
var pxLastTA='attrs';
inspBody.addEventListener('focusin',function(ev){var f=ev.target.getAttribute&&ev.target.getAttribute('data-f');if(f==='attrs'||f==='ops')pxLastTA=f});
inspBody.addEventListener('mousedown',function(ev){if(ev.target.closest('[data-pxvis]'))ev.preventDefault()});
function pxVisApply(sym){
  var ae=document.activeElement,ta=ae&&ae.matches&&ae.matches('textarea[data-f="attrs"],textarea[data-f="ops"]')?ae:inspBody.querySelector('textarea[data-f="'+pxLastTA+'"]')||inspBody.querySelector('textarea[data-f="attrs"]');
  if(!ta)return;var v=ta.value,a=ta.selectionStart,b=ta.selectionEnd;if(ae!==ta){a=b=v.length}
  if(!v.trim()){v=sym&&sym[0]!=='{'?sym+' ':'';ta.value=v;ta.focus();ta.setSelectionRange(v.length,v.length);ta.dispatchEvent(new Event('input',{bubbles:true}));return}
  var ls=v.lastIndexOf('\n',a-1)+1,le=v.indexOf('\n',b);if(le<0)le=v.length;
  var lines=v.slice(ls,le).split('\n').map(function(l){
    if(!l.trim())return l;
    if(sym==='{static}'||sym==='{abstract}'){return l.indexOf(sym)>=0?l.replace(' '+sym,'').replace(sym,''):l.replace(/\s+$/,'')+' '+sym}
    var m=/^(\s*)([+\-#~])?\s*/.exec(l);return m[1]+(sym?sym+' ':'')+l.slice(m[0].length);
  });
  var out=lines.join('\n');ta.value=v.slice(0,ls)+out+v.slice(le);
  if(document.activeElement!==ta)ta.focus();
  ta.setSelectionRange(ls,ls+out.length);ta.dispatchEvent(new Event('input',{bubbles:true}));
}
inspBody.addEventListener('click',function(ev){
  var vb=ev.target.closest('[data-pxvis]');if(vb){pxVisApply(vb.getAttribute('data-pxvis'));return}
  pxAct(ev);
});
inspBody.addEventListener('input',function(ev){
  var k=ev.target.getAttribute&&ev.target.getAttribute('data-pxc');if(!k)return;
  var n=single();if(!n||!pxGradOk(n.grad)||!validColor(ev.target.value))return;
  n.grad[k]=ev.target.value;n.uc=1;render();
  var bar=inspBody.querySelector('.px-gbar');if(bar)bar.style.background='linear-gradient(90deg,'+n.grad.a+','+n.grad.b+')';
  var sw=ev.target.parentNode.querySelector('span');if(sw)sw.style.background=ev.target.value;
});
inspBody.addEventListener('focusin',function(ev){if(ev.target.getAttribute&&ev.target.getAttribute('data-pxc'))pushUndo()});
inspBody.addEventListener('change',function(ev){if(ev.target.getAttribute&&ev.target.getAttribute('data-pxc'))renderInsp()});
function pxAddLegend(at){
  commitEdit();pushUndo();var bb=bounds(S.nodes.filter(function(o){return fam(o)!=='slide'&&fam(o)!=='legend'}),S.edges),c2=at||viewCenter(),L=addNode('legend',0,0);L.label='Legenda';
  if(at||!bb){L.x=snap(c2.x-180);L.y=snap(c2.y-100)}else{L.x=snap(bb.x+bb.w+60);L.y=snap(bb.y)}
  setSel([L.id]);renderAll();var vb=vr(),lb=L;if(!at&&(lb.x+lb.w>cam.x+vb.width/cam.z||lb.y+lb.h>cam.y+vb.height/cam.z))fitView();toast('Legenda ditambahkan. Isinya mengikuti garis yang kamu pakai.');
}
function pxAct(ev){
  var b=ev.target.closest('[data-px]');if(!b||b.disabled)return;
  var a=b.getAttribute('data-px'),v=b.getAttribute('data-v'),n=single();
  if(a==='grad'){pushUndo();inspTargets().forEach(function(o){if(!o.t)return;if(pxGradOk(o.grad))delete o.grad;else{var base=validColor(o.fill)?o.fill:'#ffffff';o.grad={a:base,b:PX_GRAD_PRE[0][1],d:'v'};o.uc=1}});renderAll();return}
  if(a==='grad-swap'&&n&&pxGradOk(n.grad)){pushUndo();var t=n.grad.a;n.grad.a=n.grad.b;n.grad.b=t;renderAll();return}
  if(a==='grad-d'&&n&&pxGradOk(n.grad)){pushUndo();n.grad.d=v;renderAll();return}
  if(a==='grad-pre'){var p=String(v).split(',');pushUndo();inspTargets().forEach(function(o){if(o.t){o.grad={a:p[0],b:p[1],d:pxGradOk(o.grad)?o.grad.d:'v'};o.uc=1;if(!validColor(o.textColor)&&onColor(p[0])==='#ffffff'&&onColor(p[1])==='#ffffff')o.textColor='#ffffff'}});renderAll();return}
  if(a==='img-pick'&&n){pxPickImage(n);return}
  if(a==='img-ratio'&&n&&n.iw){pushUndo();var c=center(n),sz=pxFitBox(n.iw,n.ih,Math.max(n.w,n.h));n.w=sz[0];n.h=sz[1];n.x=snap(c.x-n.w/2);n.y=snap(c.y-n.h/2);renderAll();return}
  if(a==='legend-add'){pxAddLegend(null);return}
  if(a==='slide-add'){pxNewSlide(null);return}
  if(a==='slide-after'&&n){pxNewSlide(n);return}
  if(a==='slide-frame'){var ns=selN.map(byId).filter(Boolean);if(!ns.length)return;pxNewSlide(null,bounds(ns,S.edges.filter(function(e){return selN.indexOf(e.from)>=0&&selN.indexOf(e.to)>=0})));return}
  if(a==='slide-ratio'&&n){pushUndo();var r=+v,c3=center(n);n.h=Math.round(n.w/r/10)*10;if(r<1){n.h=Math.max(n.h,540);n.w=Math.round(n.h*r/10)*10}n.x=snap(c3.x-n.w/2);n.y=snap(c3.y-n.h/2);renderAll();return}
  if(a==='slide-up'&&n){pxMoveSlide(n,-1);return}
  if(a==='slide-down'&&n){pxMoveSlide(n,1);return}
  if(a==='slide-png'&&n){pxExportSlides(n);return}
  if(a==='slides-png'){pxExportSlides(null);return}
  if(a==='slides-print'){pxPrintSlides();return}
  if(a==='show'){pxShowStart(0);return}
  if(a==='show-this'&&n){pxShowStart(pxSlides().indexOf(n));return}
  if(a==='strip-close'){pxStripOpen(false);return}
}

// ---------- wiring ----------
(function pxInit(){
  var inp=$('pxImgIn');
  inp.addEventListener('change',function(){var fl=[].slice.call(this.files||[]),t=pxImgTarget;pxImgTarget=null;if(!fl.length)return;
    if(t&&byId(t.id))pxReplaceImage(byId(t.id),fl[0]);else pxAddImages(fl,t&&t.at);this.value=''});
  $('tImg').onclick=function(){pxPickImage(null)};
  $('btnSlides').onclick=function(){if(!pxSlides().length){pxNewSlide(null);return}pxStripOpen()};
  $('pxStrip').addEventListener('click',function(ev){
    var th=ev.target.closest('[data-slide]');if(th){var sl=byId(th.getAttribute('data-slide'));if(sl){setSel([sl.id]);pxFocus(sl,false);pxSyncStrip(true)}return}
    pxAct(ev);
  });
  $('pxStrip').addEventListener('dblclick',function(ev){var th=ev.target.closest('[data-slide]');if(th){var i=pxSlides().indexOf(byId(th.getAttribute('data-slide')));if(i>=0)pxShowStart(i)}});
  $('pxShowPrev').onclick=function(ev){ev.stopPropagation();pxShowGo(PX_SHOW.i-1)};
  $('pxShowNext').onclick=function(ev){ev.stopPropagation();pxShowGo(PX_SHOW.i+1)};
  $('pxShowExit').onclick=function(ev){ev.stopPropagation();pxShowStop()};
  $('pxShow').addEventListener('click',function(ev){if(ev.target.closest('.px-sc'))return;var r=this.getBoundingClientRect();pxShowGo(PX_SHOW.i+(ev.clientX<r.left+r.width*0.3?-1:1))});
  document.addEventListener('keydown',function(ev){
    if(!PX_SHOW.on)return;var k=ev.key;
    if(k==='ArrowRight'||k==='PageDown'||k===' '||k==='Enter'||k==='ArrowDown'){ev.preventDefault();ev.stopImmediatePropagation();pxShowGo(PX_SHOW.i+1)}
    else if(k==='ArrowLeft'||k==='PageUp'||k==='Backspace'||k==='ArrowUp'){ev.preventDefault();ev.stopImmediatePropagation();pxShowGo(PX_SHOW.i-1)}
    else if(k==='Home'){ev.preventDefault();ev.stopImmediatePropagation();pxShowGo(0)}
    else if(k==='End'){ev.preventDefault();ev.stopImmediatePropagation();pxShowGo(1e9)}
    else if(k==='Escape'){ev.preventDefault();ev.stopImmediatePropagation();pxShowStop()}
    else{ev.stopImmediatePropagation()}
  },true);
  document.addEventListener('fullscreenchange',function(){if(PX_SHOW.on)setTimeout(function(){pxShowGo(PX_SHOW.i)},80)});
  window.addEventListener('resize',function(){if(PX_SHOW.on)pxShowGo(PX_SHOW.i)});
  // canvas: dropped image files become image nodes; dropping onto the left panel still makes logo icons
  stage.addEventListener('drop',function(ev){
    var dt=ev.dataTransfer;if(!dt||dt.getData('text/rancang'))return;
    var fl=[].slice.call(dt.files||[]).filter(function(f){return /^image\//.test(f.type)});if(!fl.length)return;
    ev.preventDefault();ev.stopPropagation();pxAddImages(fl,pt(ev));
  },true);
  // double-click an image to replace it
  stage.addEventListener('dblclick',function(ev){
    if(tool==='pen')return;var els=document.elementsFromPoint(ev.clientX,ev.clientY),g=null;
    for(var i=0;i<els.length;i++){g=els[i].closest&&els[i].closest('#content [data-id]');if(g)break}
    var n=g&&byId(g.getAttribute('data-id'));
    if(n&&fam(n)==='img'){ev.preventDefault();ev.stopPropagation();setSel([n.id]);pxPickImage(n)}
  },true);
  // paste an image from the clipboard
  document.addEventListener('paste',function(ev){
    var t=ev.target,tag=t&&t.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||(t&&t.isContentEditable)||PX_SHOW.on)return;
    var items=[].slice.call((ev.clipboardData&&ev.clipboardData.items)||[]),files=items.filter(function(i){return i.kind==='file'&&/^image\//.test(i.type)}).map(function(i){return i.getAsFile()}).filter(Boolean);
    if(files.length){ev.preventDefault();pxAddImages(files,viewCenter())}
  });
  // palette: clicking “Gambar” opens the picker straight away
  var pxAddPal0=addFromPalette;
  addFromPalette=function(t,x,y,fromClick){if(t==='media-img'&&fromClick){pxImgTarget={at:{x:x,y:y}};var inp2=$('pxImgIn');inp2.value='';inp2.click();return}
    if(t==='slide'){pxNewSlide(null);return}
    if(t==='legend'){pxAddLegend(fromClick?null:{x:x,y:y});return}
    return pxAddPal0(t,x,y,fromClick)};
})();
