// ================= deck: pitch-deck slides (master chrome, rich text, charts, tables, icon tiles, layouts, PPTX) =================
var DK_DEF={primary:'#8a1c33',accent:'#e03131',font:'Geist',logo:'',sections:['Problem','Analysis','Solution','Implementation'],tracker:'text',pageNo:1,titleBar:1,pptx:'edit'};
var DK_FONTS=['Geist','Inter','Poppins','Montserrat','Plus Jakarta Sans','Roboto','Open Sans','Lato'];
function pjSanDeck(d){
  d=d&&typeof d==='object'?d:{};var o={};for(var k in DK_DEF)o[k]=DK_DEF[k];
  if(validColor(d.primary))o.primary=d.primary;if(validColor(d.accent))o.accent=d.accent;
  if(DK_FONTS.indexOf(d.font)>=0)o.font=d.font;
  if(typeof d.logo==='string'&&d.logo.length<3e6&&PX_IMG_RE.test(d.logo))o.logo=d.logo;
  if(Array.isArray(d.sections))o.sections=d.sections.map(function(s){return String(s).slice(0,40)}).filter(Boolean).slice(0,7);
  if(['text','line','off'].indexOf(d.tracker)>=0)o.tracker=d.tracker;
  ['pageNo','titleBar'].forEach(function(k){if(d[k]!=null)o[k]=d[k]?1:0});
  if(d.pptx==='image')o.pptx='image';
  return o;
}
PROJ.deck=pjSanDeck(null);
function DK(){return PROJ.deck||(PROJ.deck=pjSanDeck(null))}
function dkPal(){var d=DK();return[d.primary,d.accent,'#1971c2','#2f9e44','#f08c00','#6741d9','#0c8599','#868e96']}

// ---------- tiny CSV / table parsing ----------
function dkRows(src){
  var L=String(src||'').replace(/\r/g,'').split('\n').filter(function(l){return l.trim()&&!/^[\s|:\-]+$/.test(l)});
  if(!L.length)return[];
  var sep=L.some(function(l){return l.indexOf('\t')>=0})?'\t':L.some(function(l){return l.indexOf('|')>=0})?'|':L[0].indexOf(';')>=0&&L[0].indexOf(',')<0?';':',';
  return L.map(function(l){
    if(sep==='|')return l.trim().replace(/^\||\|$/g,'').split('|').map(function(c){return c.trim()});
    if(sep!==',')return l.split(sep).map(function(c){return c.trim()});
    var out=[],cur='',q=false;for(var i=0;i<l.length;i++){var ch=l[i];if(ch==='"'){if(q&&l[i+1]==='"'){cur+='"';i++}else q=!q}else if(ch===','&&!q){out.push(cur.trim());cur=''}else cur+=ch}out.push(cur.trim());return out;
  });
}
function dkNum(v){v=String(v==null?'':v).trim();if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(v))v=v.replace(/\./g,'').replace(',','.');else v=v.replace(/,(?=\d{3}\b)/g,'').replace(',','.');var m=/-?\d+(\.\d+)?/.exec(v);return m?parseFloat(m[0]):0}
function dkFmt(v){var a=Math.abs(v);if(a>=1e9)return (v/1e9).toFixed(a>=1e10?0:1).replace('.0','')+' M';if(a>=1e6)return (v/1e6).toFixed(a>=1e7?0:1).replace('.0','')+' jt';if(a>=1e4)return Math.round(v/1e3)+' rb';return String(Math.round(v*10)/10)}

// ---------- rich text: **bold**, ==accent==, _italic_, “- ” bullets, “1. ” numbering ----------
function rtParse(src){
  return String(src||'').split('\n').map(function(line){
    var b=null,m=/^\s*[-•*]\s+/.exec(line);if(m){b='•';line=line.slice(m[0].length)}else{m=/^\s*(\d+)[.)]\s+/.exec(line);if(m){b=m[1]+'.';line=line.slice(m[0].length)}}
    var runs=[];line.split(/(\*\*[^*]+\*\*|==[^=]+==|_[^_\s][^_]*_)/).forEach(function(p){if(!p)return;
      if(/^\*\*[^*]+\*\*$/.test(p))runs.push({t:p.slice(2,-2),b:1});else if(/^==[^=]+==$/.test(p))runs.push({t:p.slice(2,-2),b:1,a:1});else if(/^_[^_].*_$/.test(p))runs.push({t:p.slice(1,-1),i:1});else runs.push({t:p})});
    return{b:b,runs:runs};
  });
}
function rtLayout(n){
  var fs=n.fs||16,lh=Math.round(fs*(n.lh||1.35)),pad=n.pad!=null?n.pad:4,W=Math.max(20,n.w-pad*2),lines=[];
  rtParse(n.label).forEach(function(P){
    var ind=P.b?Math.round(fs*1.25):0,cur={ind:ind,bul:P.b,items:[],w:0};lines.push(cur);
    P.runs.forEach(function(r){var ws=r.t.split(/(\s+)/);ws.forEach(function(w){if(!w)return;var wt=textW(w,fs,r.b?700:400);
      if(cur.w+wt>W-ind&&cur.items.length&&/\S/.test(w)){cur={ind:ind,bul:null,items:[],w:0};lines.push(cur)}
      if(!cur.items.length&&!/\S/.test(w))return;
      var last=cur.items[cur.items.length-1];if(last&&last.b===r.b&&last.a===r.a&&last.i===r.i){last.t+=w}else cur.items.push({t:w,b:r.b,a:r.a,i:r.i});cur.w+=wt})});
  });
  lines.forEach(function(l){var x=l.items[l.items.length-1];if(x)x.t=x.t.replace(/\s+$/,'');l.w=l.items.reduce(function(s,it){return s+textW(it.t,fs,it.b?700:400)},0)});
  return{fs:fs,lh:lh,pad:pad,lines:lines,h:lines.length*lh+pad*2};
}
function drawRtext(n,noLabel){
  var L=rtLayout(n),x=n.x,y=n.y,s='',c=validColor(n.textColor)?n.textColor:TH.text,ac=validColor(n.accent)?n.accent:DK().accent,al=n.align||'left';
  if(n.autoH!==0)n.h=Math.max(L.h,Math.round(L.fs*1.6));
  if(validColor(n.fill)||n.box){s+='<rect x="'+x+'" y="'+y+'" width="'+n.w+'" height="'+n.h+'" rx="'+(n.rad!=null?n.rad:8)+'" fill="'+(validColor(n.fill)?n.fill:'transparent')+'"'+(n.box?' stroke="'+(validColor(n.stroke)?n.stroke:ac)+'" stroke-width="1.5"'+(n.box==='dash'?' stroke-dasharray="6 4"':''):'')+'/>'}
  else s+='<rect x="'+x+'" y="'+y+'" width="'+n.w+'" height="'+n.h+'" fill="transparent"/>';
  if(noLabel&&n.label)return s;
  var top=y+L.pad+(n.vcenter&&n.h>L.h?(n.h-L.h)/2:0);
  L.lines.forEach(function(l,i){
    var by=top+i*L.lh+L.fs*0.95,lx=x+L.pad+l.ind,avail=n.w-L.pad*2-l.ind;
    if(al==='center')lx=x+L.pad+l.ind+(avail-l.w)/2;else if(al==='right')lx=x+n.w-L.pad-l.w;
    if(l.bul)s+='<text x="'+r1(x+L.pad+(al==='center'?(avail-l.w)/2:0))+'" y="'+r1(by)+'" font-size="'+L.fs+'" fill="'+(l.bul==='•'?ac:c)+'" font-weight="700">'+esc(l.bul)+'</text>';
    s+='<text x="'+r1(lx)+'" y="'+r1(by)+'" font-size="'+L.fs+'" fill="'+c+'" style="white-space:pre"'+(n.bold?' font-weight="700"':'')+'>'+l.items.map(function(it){return '<tspan'+(it.b?' font-weight="700"':'')+(it.a?' fill="'+ac+'"':'')+(it.i?' font-style="italic"':'')+'>'+esc(it.t)+'</tspan>'}).join('')+'</text>';
  });
  return s;
}
// ---------- charts ----------
function chData(n){var R=dkRows(n.data);if(R.length<2)return{cats:[],series:[]};var H=R[0];return{cats:R.slice(1).map(function(r){return r[0]}),series:H.slice(1).map(function(name,j){return{name:name,vals:R.slice(1).map(function(r){return dkNum(r[j+1])})}})}}
function niceMax(v){if(v<=0)return 1;var e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e}
function drawChart(n,noLabel){
  var D=chData(n),x=n.x,y=n.y,w=n.w,h=n.h,s='',P=n.colors&&n.colors.length?n.colors:dkPal(),tc=TH.text,mc=TH.muted,gl=TH.name==='dark'?'#2d3644':'#e9ecef',t=n.ctype||'bar';
  s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+(validColor(n.fill)?n.fill:'transparent')+'" rx="8"/>';
  var top=y+6;if(n.label){s+=tblock(x+4,top,[n.label],{fs:14,w:700,anchor:'start',fill:tc});top+=24}
  if(!D.series.length||!D.cats.length)return s+tblock(x+w/2,y+h/2,['Isi data di panel kanan (CSV)'],{fs:12,fill:mc,vcenter:1});
  var showLeg=D.series.length>1||t==='pie'||t==='donut';
  if(showLeg&&t!=='pie'&&t!=='donut'){var lx=x+4;D.series.forEach(function(se,j){s+='<rect x="'+r1(lx)+'" y="'+r1(top+2)+'" width="10" height="10" rx="2" fill="'+P[j%P.length]+'"/>';s+=tblock(lx+14,top,[se.name],{fs:11,anchor:'start',fill:mc});lx+=24+textW(se.name,11)});top+=20}
  if(t==='pie'||t==='donut'){
    var vals=D.series[0].vals,tot=vals.reduce(function(a,b){return a+Math.max(0,b)},0)||1,cx=x+Math.min(w*0.36,(h-(top-y))/2+10),cy=(top+y+h)/2,R=Math.min(w*0.33,(y+h-top)/2-6),ri=t==='donut'?R*0.58:0,a0=-Math.PI/2;
    vals.forEach(function(v,i){var a1=a0+Math.max(0,v)/tot*Math.PI*2,lg=a1-a0>Math.PI?1:0,col=P[i%P.length];
      var p='M'+r1(cx+R*Math.cos(a0))+' '+r1(cy+R*Math.sin(a0))+' A'+r1(R)+' '+r1(R)+' 0 '+lg+' 1 '+r1(cx+R*Math.cos(a1))+' '+r1(cy+R*Math.sin(a1));
      p+=ri?' L'+r1(cx+ri*Math.cos(a1))+' '+r1(cy+ri*Math.sin(a1))+' A'+r1(ri)+' '+r1(ri)+' 0 '+lg+' 0 '+r1(cx+ri*Math.cos(a0))+' '+r1(cy+ri*Math.sin(a0))+' Z':' L'+r1(cx)+' '+r1(cy)+' Z';
      s+='<path d="'+p+'" fill="'+col+'" stroke="'+TH.paper+'" stroke-width="2"/>';
      var am=(a0+a1)/2,pr=Math.round(v/tot*100);if(pr>=4)s+=tblock(cx+(ri?(R+ri)/2:R*0.62)*Math.cos(am),cy+(ri?(R+ri)/2:R*0.62)*Math.sin(am),[pr+'%'],{fs:12,w:700,vcenter:1,fill:onColor(col)});
      a0=a1;});
    if(t==='donut'&&n.center!==0)s+=tblock(cx,cy,[dkFmt(tot)],{fs:16,w:700,vcenter:1,fill:tc});
    var ly=cy-D.cats.length*11;D.cats.forEach(function(c,i){s+='<rect x="'+r1(cx+R+18)+'" y="'+r1(ly+i*22)+'" width="11" height="11" rx="2" fill="'+P[i%P.length]+'"/>'+tblock(cx+R+34,ly+i*22-1,[c+' · '+dkFmt(vals[i])],{fs:11.5,anchor:'start',fill:tc})});
    return s;
  }
  var hb=t==='hbar',stack=t==='stack',L=hb?Math.min(w*0.32,Math.max.apply(null,D.cats.map(function(c){return textW(c,11)}))+12):40,B=hb?8:24,px=x+L,pw=w-L-8,py=top+4,ph=y+h-B-py;
  var mx=0;if(stack)D.cats.forEach(function(c,i){mx=Math.max(mx,D.series.reduce(function(a,se){return a+Math.max(0,se.vals[i])},0))});else D.series.forEach(function(se){se.vals.forEach(function(v){mx=Math.max(mx,v)})});
  mx=niceMax(mx*1.08);var steps=4;
  for(var g=0;g<=steps;g++){var gv=mx*g/steps;if(hb){var gx2=px+pw*g/steps;s+='<line x1="'+r1(gx2)+'" y1="'+r1(py)+'" x2="'+r1(gx2)+'" y2="'+r1(py+ph)+'" stroke="'+gl+'"/>'}else{var gy=py+ph-ph*g/steps;s+='<line x1="'+r1(px)+'" y1="'+r1(gy)+'" x2="'+r1(px+pw)+'" y2="'+r1(gy)+'" stroke="'+gl+'"/>'+tblock(px-6,gy,[dkFmt(gv)],{fs:10.5,anchor:'end',vcenter:1,fill:mc})}}
  var nc=D.cats.length,band=(hb?ph:pw)/nc,ns=D.series.length;
  if(t==='line'||t==='area'){
    D.series.forEach(function(se,j){var col=P[j%P.length],pts=se.vals.map(function(v,i){return[px+band*(i+0.5),py+ph-ph*Math.max(0,v)/mx]});
      if(t==='area')s+='<path d="M'+r1(pts[0][0])+' '+r1(py+ph)+' L'+pts.map(function(p){return r1(p[0])+' '+r1(p[1])}).join(' L')+' L'+r1(pts[pts.length-1][0])+' '+r1(py+ph)+' Z" fill="'+col+'" fill-opacity=".14"/>';
      s+='<path d="M'+pts.map(function(p){return r1(p[0])+' '+r1(p[1])}).join(' L')+'" fill="none" stroke="'+col+'" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
      pts.forEach(function(p,i){s+='<circle cx="'+r1(p[0])+'" cy="'+r1(p[1])+'" r="3.6" fill="'+TH.paper+'" stroke="'+col+'" stroke-width="2"/>';if(n.showVal!==0&&ns===1)s+=tblock(p[0],p[1]-14,[dkFmt(se.vals[i])],{fs:10.5,w:600,fill:tc})});
    });
  }else D.cats.forEach(function(c,i){
    var acc=0;D.series.forEach(function(se,j){var v=Math.max(0,se.vals[i]),col=P[j%P.length],gw=band*0.66,bw=stack?gw:gw/ns,len=(hb?pw:ph)*v/mx;
      if(hb){var by=py+band*i+(band-gw)/2+(stack?0:j*bw),bx=px+(stack?pw*acc/mx:0);s+='<rect x="'+r1(bx)+'" y="'+r1(by)+'" width="'+r1(Math.max(0,len))+'" height="'+r1(bw-2)+'" rx="3" fill="'+col+'"/>';if(n.showVal!==0)s+=tblock(bx+len+5,by+bw/2-1,[dkFmt(se.vals[i])],{fs:10.5,anchor:'start',vcenter:1,fill:tc})}
      else{var bx2=px+band*i+(band-gw)/2+(stack?0:j*bw),top2=py+ph-(stack?ph*(acc+v)/mx:len);s+='<path d="'+topRoundPath(bx2,top2,Math.max(1,bw-2),Math.max(0,stack?ph*v/mx:len),Math.min(4,bw/3))+'" fill="'+col+'"/>';if(n.showVal!==0&&(!stack||j===ns-1))s+=tblock(bx2+(bw-2)/2,top2-15,[dkFmt(stack?acc+v:se.vals[i])],{fs:10.5,w:600,fill:tc})}
      acc+=v});
  });
  D.cats.forEach(function(c,i){if(hb)s+=tblock(px-8,py+band*(i+0.5),[c],{fs:11,anchor:'end',vcenter:1,fill:tc});else s+=tblock(px+band*(i+0.5),py+ph+6,wrapText(c,band-4,11).slice(0,2),{fs:11,fill:mc})});
  s+='<line x1="'+r1(px)+'" y1="'+r1(py+ph)+'" x2="'+r1(px+pw)+'" y2="'+r1(py+ph)+'" stroke="'+mc+'" stroke-opacity=".5"/>';
  return s;
}
// ---------- tables ----------
function tbLayout(n){
  var R=dkRows(n.data),fs=n.fs||12,rh=Math.round(fs*2.1),nc=R.reduce(function(m,r){return Math.max(m,r.length)},0);
  var cw=[];for(var j=0;j<nc;j++){var mw=30;R.forEach(function(r,i){mw=Math.max(mw,textW(r[j]||'',fs,i===0?700:400)+18)});cw.push(mw)}
  var sum=cw.reduce(function(a,b){return a+b},0)||1;cw=cw.map(function(c){return c/sum*n.w});
  return{R:R,fs:fs,rh:rh,cw:cw,nc:nc,h:R.length*rh};
}
function drawTable(n,noLabel){
  var L=tbLayout(n),x=n.x,y=n.y,s='',hf=validColor(n.headerFill)?n.headerFill:DK().primary,tc=TH.text,zb=TH.name==='dark'?'#1d2427':'#f8f9fa',ln=TH.tileLine;
  n.h=Math.max(L.h,40);
  s+='<rect x="'+x+'" y="'+y+'" width="'+n.w+'" height="'+n.h+'" fill="'+TH.paper+'" stroke="'+ln+'" rx="6"/>';
  if(!L.R.length)return s+tblock(x+n.w/2,y+20,['Isi tabel di panel kanan'],{fs:12,fill:TH.muted,vcenter:1});
  L.R.forEach(function(r,i){var yy=y+i*L.rh,cx=x;
    if(i===0)s+='<path d="'+topRoundPath(x,yy,n.w,L.rh,6)+'" fill="'+hf+'"/>';else if(i%2===0)s+='<rect x="'+x+'" y="'+yy+'" width="'+n.w+'" height="'+L.rh+'" fill="'+zb+'"/>';
    if(i>0)s+='<line x1="'+x+'" y1="'+yy+'" x2="'+(x+n.w)+'" y2="'+yy+'" stroke="'+ln+'"/>';
    for(var j=0;j<L.nc;j++){var v=r[j]==null?'':r[j],num=i>0&&j>0&&/^[-+]?[\d.,%\s]+[a-zA-Z%]*$/.test(v)&&/\d/.test(v),w=L.cw[j];
      var t=v;while(t.length>1&&textW(t,L.fs,i===0||(j===0&&n.firstBold!==0)?700:400)>w-12)t=t.slice(0,-2)+'…';
      s+=tblock(num?cx+w-8:cx+8,yy+L.rh/2,[t],{fs:L.fs,anchor:num?'end':'start',vcenter:1,w:i===0||(j===0&&n.firstBold!==0)?700:null,fill:i===0?onColor(hf):tc});
      cx+=w}
  });
  return s;
}
// ---------- icon tile ----------
function drawIconTile(n){
  var f=validColor(n.fill)?n.fill:DK().primary,r=Math.min(n.w,n.h),rad=n.rad!=null?+n.rad:Math.round(r*0.2),sc=r*0.56/24;
  return '<rect x="'+n.x+'" y="'+n.y+'" width="'+n.w+'" height="'+n.h+'" rx="'+rad+'" fill="'+f+'"/>'+iconG(n.icon||'star',n.x+n.w/2-12*sc,n.y+n.h/2-12*sc,sc,validColor(n.textColor)?n.textColor:onColor(f),2);
}
T['rtext']={f:'rtext',n:'Teks kaya',sz:[360,60],lab:'Teks dengan **kata tebal** dan ==kata berwarna==.',kw:'rich text paragraf bullet bold highlight'};
T['chart']={f:'chart',n:'Grafik',sz:[440,260],kw:'chart grafik bar line pie donut data',init:{ctype:'bar',label:'',data:'Tahun,Pendapatan\n2024,120\n2025,180\n2026,260\n2027,390'}};
T['table']={f:'table',n:'Tabel',sz:[480,140],kw:'table tabel data keuangan',init:{data:'Item,2025,2026,2027\nPendapatan,"1.200","2.600","4.100"\nBiaya,"900","1.500","2.100"\nLaba,"300","1.100","2.000"'}};
T['icon-tile']={f:'icon',n:'Ikon kotak',sz:[64,64],kw:'icon ikon tile badge',init:{icon:'zap'}};
RESIZABLE.rtext=1;RESIZABLE.chart=1;RESIZABLE.table=1;RESIZABLE.icon=1;
FAM_LABEL.rtext='Teks kaya';FAM_LABEL.chart='Grafik';FAM_LABEL.table='Tabel';FAM_LABEL.icon='Ikon';
SEC['deck']={n:'Slide & presentasi',keys:['slide','rtext','chart','table','icon-tile','media-img','legend']};
var dkPrim0=primarySecs;primarySecs=function(dt){var p=dkPrim0(dt);if(dt==='deck')return['deck','px-shapes','wire','wire-frames','notes'].concat(p.filter(function(s){return ['deck','px-media','px-shapes','wire','wire-frames','notes','fw-blocks'].indexOf(s)<0}));if(p.indexOf('deck')<0)p.splice(Math.max(0,p.indexOf('px-media')),0,'deck');return p.filter(function(s){return s!=='px-media'||dt!=='deck'})};
DT.deck={ws:'wb',n:'Pitch Deck',pal:['deck','px-shapes','wire','wire-frames','notes'],hint:'Slide 16:9 ala business case competition: judul kesimpulan, logo, tracker bagian, grafik, tabel. Ekspor ke PowerPoint atau PDF.'};
DT_ICON.deck='monitor';
var dkDrawNode0=drawNode;
drawNode=function(n,noLabel){var f=fam(n);if(f==='rtext')return drawRtext(n,noLabel);if(f==='chart')return drawChart(n,noLabel);if(f==='table')return drawTable(n,noLabel);if(f==='icon')return drawIconTile(n);return dkDrawNode0(n,noLabel)};
var dkCustom0=customPreview;
customPreview=function(t){var A=DK().primary,I=TH.ink,M=TH.muted;
  if(t==='rtext')return svgWrap('0 0 48 40','<path d="M6 11H40M6 19H34M6 27H38" stroke="'+M+'" stroke-width="2.4" stroke-linecap="round"/><path d="M6 11H18" stroke="'+I+'" stroke-width="3.2" stroke-linecap="round"/><path d="M14 27H28" stroke="'+A+'" stroke-width="3.2" stroke-linecap="round"/>');
  if(t==='chart')return svgWrap('0 0 48 40','<path d="M6 34H42" stroke="'+M+'" stroke-width="1.4"/><rect x="9" y="22" width="6" height="12" rx="1.5" fill="'+A+'" fill-opacity=".55"/><rect x="19" y="15" width="6" height="19" rx="1.5" fill="'+A+'" fill-opacity=".75"/><rect x="29" y="8" width="6" height="26" rx="1.5" fill="'+A+'"/>');
  if(t==='table')return svgWrap('0 0 48 40','<rect x="4" y="6" width="40" height="28" rx="3" fill="'+TH.paper+'" stroke="'+M+'"/><path d="M4 9a3 3 0 0 1 3-3h34a3 3 0 0 1 3 3v4H4Z" fill="'+A+'"/><path d="M4 20H44M4 27H44M18 13V34M31 13V34" stroke="'+M+'" stroke-opacity=".6"/>');
  if(t==='icon-tile')return svgWrap('0 0 48 40','<rect x="10" y="6" width="28" height="28" rx="6" fill="'+A+'"/>'+iconG('zap',16,12,0.67,'#ffffff',2.2));
  return dkCustom0(t)};
var dkField0=fieldAt;fieldAt=function(n,p){if(n.t==='table'||n.t==='chart')return 'data';return dkField0(n,p)};
TXTF.data=1;

// ---------- slide master chrome ----------
function dkSlideIndex(n){var L=pxSlides();return L.indexOf(n)}
var dkSlide0=pxDrawSlide;
pxDrawSlide=function(n,noLabel){
  var s=dkSlide0(n,noLabel),d=DK();if(n.chrome===0||n.layout==='cover'||n.layout==='close')return s;
  var x=n.x,y=n.y,w=n.w,h=n.h,sc=w/960,tc=validColor(n.textColor)?n.textColor:TH.text;
  if(d.titleBar)s+='<rect x="'+x+'" y="'+r1(y+20*sc)+'" width="'+r1(8*sc)+'" height="'+r1(44*sc)+'" fill="'+d.primary+'"/>';
  if(n.label)s+=tblock(x+34*sc,y+20*sc,[String(n.label).split('\n')[0]],{fs:Math.round(24*sc),w:700,anchor:'start',fill:d.primary});
  if(n.sub)s+=tblock(x+34*sc,y+54*sc,wrapText(n.sub,w-260*sc,Math.round(14*sc)).slice(0,2),{fs:Math.round(14*sc),anchor:'start',fill:tc});
  if(d.logo)s+='<image href="'+(exporting?d.logo:pxBlobUrl(d.logo))+'" x="'+r1(x+w-182*sc)+'" y="'+r1(y+18*sc)+'" width="'+r1(150*sc)+'" height="'+r1(44*sc)+'" preserveAspectRatio="xMaxYMid meet"/>';
  var secs=d.sections||[],ty=y+h-30*sc;
  if(d.tracker!=='off'&&secs.length){
    var x0=x+34*sc,x1=x+w-(d.pageNo?110:34)*sc,step=(x1-x0)/secs.length;
    if(d.tracker==='line')s+='<line x1="'+r1(x0)+'" y1="'+r1(ty-14*sc)+'" x2="'+r1(x1)+'" y2="'+r1(ty-14*sc)+'" stroke="'+d.primary+'" stroke-width="'+r1(2*sc)+'"/>';
    secs.forEach(function(sec,i){var on=n.section===i,cx=x0+step*i+(d.tracker==='line'?0:step/2);
      if(d.tracker==='line'&&on)s+='<circle cx="'+r1(cx+6*sc)+'" cy="'+r1(ty-14*sc)+'" r="'+r1(5*sc)+'" fill="'+d.accent+'"/>';
      s+=tblock(cx,ty,[sec],{fs:Math.round((d.tracker==='line'?11:15)*sc),w:on?700:400,anchor:d.tracker==='line'?'start':'middle',vcenter:1,fill:on?d.accent:(d.tracker==='line'?TH.muted:tc)})});
  }
  if(d.pageNo){var idx=dkSlideIndex(n)+1,bs=46*sc;s+='<rect x="'+r1(x+w-bs)+'" y="'+r1(y+h-bs)+'" width="'+r1(bs)+'" height="'+r1(bs)+'" fill="'+d.primary+'"/>'+tblock(x+w-bs/2,y+h-bs/2,[String(idx)],{fs:Math.round(17*sc),w:700,vcenter:1,fill:onColor(d.primary)})}
  return s;
};

// ---------- slide layouts ----------
function dkPut(sl,t,x,y,w,h,o){var sc=sl.w/960,n=addNode(t,0,0);n.x=Math.round(sl.x+x*sc);n.y=Math.round(sl.y+y*sc);n.w=Math.round(w*sc);n.h=Math.round(h*sc);if(o)for(var k in o)n[k]=o[k];if(n.fs)n.fs=Math.round(n.fs*sc);return n}
var DK_LAYOUTS=[
  ['cover','Sampul','image',function(sl,d){sl.layout='cover';sl.label='Sampul';
    dkPut(sl,'sh-rect',0,0,520,540,{fill:d.primary,uc:1,bw:0,label:''});
    dkPut(sl,'rtext',48,120,430,190,{label:'Nama Strategi:\n==Solusi untuk Masalah Utama==',fs:32,bold:1,textColor:'#ffffff',accent:'#ffd43b',lh:1.25});
    dkPut(sl,'rtext',48,340,420,60,{label:'Subjudul singkat: tujuan, target, dan periode.',fs:15,textColor:'#ffffff'});
    dkPut(sl,'rtext',48,450,420,40,{label:'**Nama Tim** · Nama Kompetisi 2026',fs:13,textColor:'#ffffff'});
    dkPut(sl,'media-img',560,60,360,420,{rad:16,label:''})}],
  ['blank','Judul + isi','layout-template',function(sl){sl.label='Kesimpulan utama slide ini dalam satu kalimat';sl.sub='Konteks singkat atau sumber data.'}],
  ['twocol','Dua kolom','columns-3',function(sl,d){sl.label='Solusi: Aplikasi untuk masalah utama';sl.sub='Tujuan: kurangi waktu, tenaga, dan biaya proses saat ini';
    dkPut(sl,'media-img',40,110,300,370,{rad:14});
    dkPut(sl,'rtext',370,110,550,370,{label:'1. Dirancang **sesederhana mungkin** untuk target pengguna\n2. Membangun **sync engine** agar data lokal dan cloud selalu sama\n3. ==Dampak:== waktu laporan turun dari **2 hari** menjadi **hitungan detik**',fs:17,lh:1.6})}],
  ['cards3','Tiga kartu','layout-grid',function(sl,d){sl.label='Tiga strategi untuk mencapai tujuan';sl.sub='Setiap strategi menjawab satu akar masalah.';
    ['Strategi 1','Strategi 2','Strategi 3'].forEach(function(t,i){var x=40+i*300;dkPut(sl,'sh-rrect',x,110,280,48,{fill:d.primary,uc:1,bw:0,label:t,textColor:'#ffffff',bold:1});
      dkPut(sl,'icon-tile',x,176,56,56,{icon:['target','zap','users'][i],fill:d.accent,uc:1});
      dkPut(sl,'rtext',x,244,280,230,{label:'**Inisiatif utama** dan cara kerjanya.\n- Aksi 1\n- Aksi 2\n- ==Dampak terukur==',fs:15,lh:1.5})})}],
  ['problem','Masalah → akar → pertanyaan','git-merge',function(sl,d){sl.label='Latar belakang: konversi masih rendah';sl.sub='Ringkasan kondisi dan tujuan perusahaan.';
    var H=[['Problem statement',40],['Kebutuhan pelanggan',260],['Akar masalah',480],['How might we…',700]];
    H.forEach(function(h,i){dkPut(sl,'sh-rrect',h[1],108,210,34,{fill:i===3?d.accent:d.primary,uc:1,bw:0,label:h[0],textColor:'#ffffff',bold:1,fs:14})});
    dkPut(sl,'rtext',40,156,210,300,{label:'Bagaimana meningkatkan **conversion rate** segmen utama?',fs:16,align:'center',vcenter:1,box:'solid',autoH:0});
    [0,1,2].forEach(function(k){dkPut(sl,'rtext',260,156+k*102,210,92,{label:'Kebutuhan **'+(k+1)+'** yang belum terpenuhi',fs:14,fill:'#f1f3f5',uc:1,autoH:0,vcenter:1,pad:10});dkPut(sl,'rtext',480,156+k*102,210,92,{label:'Akar masalah **'+(k+1)+'**',fs:14,fill:'#f1f3f5',uc:1,autoH:0,vcenter:1,pad:10});dkPut(sl,'rtext',700,156+k*102,220,92,{label:'Bagaimana kita bisa **…**?',fs:14,box:'solid',autoH:0,vcenter:1,align:'center',pad:10})})}],
  ['stats','Angka kunci','chart-column',function(sl,d){sl.label='Pasarnya besar dan terus tumbuh';sl.sub='Sumber: riset sekunder dan wawancara.';
    [['17 Jt','Pengguna aktif'],['Rp250 M','Transaksi per bulan'],['3,5×','Pertumbuhan 3 tahun']].forEach(function(s,i){dkPut(sl,'rtext',40+i*300,170,270,160,{label:'=='+s[0]+'==\n'+s[1],fs:30,align:'center',bold:0,lh:1.4});if(i)dkPut(sl,'sh-rect',30+i*300,160,2,180,{fill:d.primary,uc:1,bw:0})});
    dkPut(sl,'rtext',140,380,680,80,{label:'Namun, **hanya 25% pengguna** yang bertransaksi lebih dari sekali, sehingga ==retensi== menjadi masalah utama.',fs:17,align:'center',box:'dash',autoH:0,vcenter:1,pad:14})}],
  ['features','Daftar fitur + ikon','list',function(sl,d){sl.label='Fitur utama yang menjawab kebutuhan pengguna';sl.sub='';
    dkPut(sl,'media-img',40,100,300,380,{rad:14});
    [['file-text','Laporan instan','Isi laporan langsung atau pindai kertas, data terisi otomatis.'],['scan-eye','Ekstraksi AI','Foto dokumen, AI mengisi formulir.'],['map-pin','Peta lokasi','Temukan lokasi tujuan dengan akurat.'],['wifi','Offline-first','Tetap bisa dipakai tanpa sinyal.']].forEach(function(f,i){var y=104+i*96;dkPut(sl,'icon-tile',380,y,74,74,{icon:f[0],fill:d.primary,uc:1});dkPut(sl,'rtext',470,y-2,450,80,{label:'**'+f[1]+'**\n'+f[2],fs:16,lh:1.35})})}],
  ['chart','Grafik + insight','chart-line',function(sl,d){sl.label='Proyeksi pendapatan tumbuh 3× dalam 3 tahun';sl.sub='Asumsi: konversi 4%, harga rata-rata Rp45.000.';
    dkPut(sl,'chart',40,110,540,370,{ctype:'bar',label:'Pendapatan (Rp juta)',data:'Tahun,Pendapatan,Biaya\n2026,1200,900\n2027,2600,1500\n2028,4100,2100'});
    dkPut(sl,'rtext',610,120,310,350,{label:'**Insight**\n- Titik impas di ==tahun ke-2==\n- Margin naik dari 25% ke 49%\n- Biaya akuisisi turun karena referral',fs:16,lh:1.6,box:'dash',autoH:0,pad:16})}],
  ['finance','Tabel finansial','table',function(sl,d){sl.label='Investasi kembali dalam 18 bulan';sl.sub='Proyeksi keuangan 3 tahun (Rp juta).';
    dkPut(sl,'table',40,110,560,200,{data:'Komponen,2026,2027,2028\nPendapatan,"1.200","2.600","4.100"\nBiaya operasional,"900","1.500","2.100"\nLaba bersih,"300","1.100","2.000"\nNPV,,,"3.250"',fs:13});
    dkPut(sl,'chart',620,110,300,250,{ctype:'donut',label:'Alokasi dana',data:'Pos,Porsi\nMarketing,40\nProduk,35\nOperasional,25'});
    dkPut(sl,'rtext',40,340,560,120,{label:'==ROI 210%== dengan payback period **18 bulan** dan IRR **42%**.',fs:18,box:'solid',autoH:0,vcenter:1,pad:16})}],
  ['timeline','Timeline implementasi','calendar',function(sl,d){sl.label='Rencana implementasi bertahap selama 12 bulan';sl.sub='';
    var Q=['Q1','Q2','Q3','Q4'];Q.forEach(function(q,i){dkPut(sl,'sh-rrect',260+i*165,110,160,34,{fill:i%2?d.accent:d.primary,uc:1,bw:0,label:q,textColor:'#ffffff',bold:1})});
    [['Riset & MVP',0,1],['Pilot di 2 kota',1,2],['Kampanye pemasaran',1,3],['Skala nasional',2,4],['Evaluasi KPI',3,4]].forEach(function(t,i){var y=160+i*58;dkPut(sl,'rtext',40,y,210,44,{label:'**'+t[0]+'**',fs:14,autoH:0,vcenter:1});dkPut(sl,'sh-rrect',262+t[1]*165,y+6,(t[2]-t[1])*165-8,32,{fill:i%2?d.accent:d.primary,uc:1,bw:0,label:''})})}],
  ['team','Tim','users',function(sl,d){sl.label='Tim kami';sl.sub='';
    ['Nama 1','Nama 2','Nama 3','Nama 4'].forEach(function(nm,i){var x=60+i*220;dkPut(sl,'media-img',x,130,170,170,{rad:85});dkPut(sl,'rtext',x-10,312,190,70,{label:'**'+nm+'**\nPeran · kampus',fs:15,align:'center'})})}],
  ['close','Penutup','heart',function(sl,d){sl.layout='close';sl.label='Penutup';
    dkPut(sl,'sh-rect',0,0,960,540,{fill:d.primary,uc:1,bw:0,label:''});
    dkPut(sl,'rtext',80,190,800,140,{label:'Terima kasih!\n==Mari wujudkan bersama.==',fs:44,bold:1,align:'center',textColor:'#ffffff',accent:'#ffd43b'})}]
];
function dkAddSlide(id){
  var L=DK_LAYOUTS.filter(function(l){return l[0]===id})[0]||DK_LAYOUTS[1],cur=single(),sl=pxNewSlide(cur&&fam(cur)==='slide'?cur:null);
  S.nodes.forEach(function(o){if(o!==sl&&o.t==='text-h'&&o.label==='Judul slide'&&o.x>=sl.x&&o.y>=sl.y&&o.x<sl.x+sl.w&&o.y<sl.y+sl.h)o._kill=1});S.nodes=S.nodes.filter(function(o){return !o._kill});
  var secs=DK().sections,SEC_OF={problem:0,stats:0,chart:1,cards3:2,features:2,twocol:2,finance:3,timeline:3};if(secs.length&&SEC_OF[id]!=null)sl.section=Math.min(secs.length-1,SEC_OF[id]);
  L[3](sl,DK());S.nodes.forEach(autosize);setSel([sl.id]);renderAll();
}
// ---------- page snapshots and deck from the whole project ----------
function dkSnapshot(dt){
  var P=pjPages(),pg=P[dt];if(!pjHas(pg))return null;
  var keep=S,keepT=TH;S=pg;TH=THEMES.light;exporting=true;mUsed={};
  var nodes=pg.nodes.filter(function(n){return fam(n)!=='slide'}),body=drawAll(nodes,pg.edges),defs=markerDefs(),b=bounds(nodes,pg.edges);
  exporting=false;mUsed={};S=keep;TH=keepT;render();
  if(!b)return null;var pad=24,str='<svg xmlns="http://www.w3.org/2000/svg" width="'+Math.ceil(b.w+pad*2)+'" height="'+Math.ceil(b.h+pad*2)+'" viewBox="'+(b.x-pad)+' '+(b.y-pad)+' '+(b.w+pad*2)+' '+(b.h+pad*2)+'" font-family="'+esc(FONT)+'"><defs>'+defs+'</defs>'+body.replace(/ data-(id|eid|lane|halo)="[^"]*"/g,'')+'</svg>';
  try{return{src:'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(str))),w:b.w+pad*2,h:b.h+pad*2}}catch(e){return null}
}
var DK_TITLES={usecase:'Siapa yang memakai sistem dan apa yang mereka lakukan',bpmn:'Alur bisnis dari permintaan sampai selesai',erd:'Struktur data yang mendukung layanan',class:'Model objek inti sistem',arch:'Arsitektur sistem yang skalabel dan aman',sysdesign:'Desain sistem untuk skala besar',n8n:'Otomasi yang menghemat waktu operasional',wire:'Rancangan layar aplikasi',userflow:'Alur pengguna dari awal sampai tujuan',bmc:'Model bisnis yang berkelanjutan',lean:'Model bisnis dalam satu halaman',swot:'Posisi strategis: kekuatan, kelemahan, peluang, ancaman',gds:'Identitas visual produk',gantt:'Rencana implementasi',risk:'Risiko utama dan mitigasinya'};
function dkFromProject(){
  commitEdit();var srcPages=pjFilledList().filter(function(d){return d!=='deck'});var R=prdParse(PROJ.prd);
  if(!srcPages.length&&!PROJ.prd.trim()){toast('Isi PRD atau minimal satu halaman diagram dulu');return}
  var snaps={};srcPages.forEach(function(d){snaps[d]=dkSnapshot(d)});
  pjSwitch('deck');pushUndo();var d=DK(),title=R.title||DOC.title||'Proyek';
  var sl=pxNewSlide(null);dkClearAuto(sl);DK_LAYOUTS[0][3](sl,d);S.nodes.forEach(function(o){if(o.t==='rtext'&&/Judul Strategi Utama/.test(o.label))o.label=title});
  var sum=(prdSplit(PROJ.prd).secs.filter(function(s){return /ringkasan|summary|latar/i.test(s.head||'')})[0]||{lines:[]}).lines.slice(1).join(' ').trim();
  if(sum||R.actors.length){var s2=pxNewSlide(null);dkClearAuto(s2);s2.label='Latar belakang & masalah';s2.section=0;s2.sub='';dkPut(s2,'rtext',40,110,520,360,{label:(sum||'Ringkasan masalah.')+'\n\n'+R.actors.slice(0,4).map(function(a){return '- **'+a.name+'**'+(a.desc?': '+a.desc:'')}).join('\n'),fs:16,lh:1.5});
    if(R.features.length)dkPut(s2,'rtext',590,110,330,360,{label:'**Fitur kunci**\n'+R.features.slice(0,6).map(function(f){return '- '+f.name}).join('\n'),fs:15,lh:1.5,box:'dash',autoH:0,pad:16})}
  var secs=d.sections,order=srcPages.filter(function(p){return snaps[p]});
  order.forEach(function(p,i){var s3=pxNewSlide(null);dkClearAuto(s3);s3.label=DK_TITLES[p]||DT[p].n;s3.sub='Halaman '+DT[p].n+' dari proyek ini · ganti judul dengan kesimpulanmu.';s3.section=Math.min(secs.length-1,1+Math.floor(i*(secs.length-1)/Math.max(1,order.length)));
    var sn=snaps[p],box=[40,100,880,380],sc=Math.min(box[2]/sn.w,box[3]/sn.h,1.4),w=sn.w*sc,h=sn.h*sc;dkPut(s3,'media-img',box[0]+(box[2]-w)/2,box[1]+(box[3]-h)/2,w,h,{src:sn.src,iw:sn.w,ih:sn.h,rad:0,bw:0})});
  var sc=pxNewSlide(null);dkClearAuto(sc);DK_LAYOUTS[DK_LAYOUTS.length-1][3](sc,d);
  S.nodes.forEach(autosize);renderAll();fitView();pxStripOpen(true);pjMarks();toast(pxSlides().length+' slide disusun dari proyek. Ubah judul jadi kalimat kesimpulan.');
}
function dkClearAuto(sl){S.nodes=S.nodes.filter(function(o){return !(o.t==='text-h'&&o.label==='Judul slide'&&o.x>=sl.x&&o.y>=sl.y&&o.x<sl.x+sl.w&&o.y<sl.y+sl.h)})}

// ---------- PowerPoint export ----------
var DK_PPTX_URLS=['https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js','https://unpkg.com/pptxgenjs@3.12.0/dist/pptxgen.bundle.js'];
// Subresource Integrity: the browser refuses the file if a CDN ever serves different bytes.
var DK_PPTX_SRI='sha384-Cck14aA9cifjYolcnjebXRfWGkz5ltHMBiG4px/j8GS+xQcb7OhNQWZYyWjQ+UwQ';
function dkLoadPptx(){
  if(window.PptxGenJS)return Promise.resolve(window.PptxGenJS);
  return new Promise(function(res,rej){var i=0;(function next(){if(i>=DK_PPTX_URLS.length){rej(new Error('Pustaka PowerPoint tidak bisa dimuat. Periksa koneksi.'));return}var sc=document.createElement('script');sc.integrity=DK_PPTX_SRI;sc.crossOrigin='anonymous';sc.src=DK_PPTX_URLS[i++];sc.onload=function(){window.PptxGenJS?res(window.PptxGenJS):next()};sc.onerror=function(){sc.remove();next()};document.head.appendChild(sc)})()});
}
function dkSvgPng(str,w,h,scale){return new Promise(function(res){var img=new Image();img.onload=function(){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*scale));c.height=Math.max(1,Math.round(h*scale));var g=c.getContext('2d');g.scale(scale,scale);g.drawImage(img,0,0);res(c.toDataURL('image/png'))};img.onerror=function(){res(null)};img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(str)})}
function dkPart(nodes,edges,box){
  exporting=true;mUsed={};var keepT=TH;TH=THEMES.light;var body=drawAll(nodes,edges),defs=markerDefs();TH=keepT;exporting=false;mUsed={};
  body=body.replace(/ data-(id|eid|lane|halo)="[^"]*"/g,'');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+Math.ceil(box.w)+'" height="'+Math.ceil(box.h)+'" viewBox="'+box.x+' '+box.y+' '+box.w+' '+box.h+'" font-family="'+esc(FONT)+'"><defs>'+defs+'</defs>'+body+'</svg>';
}
var DK_NATIVE={rtext:1,text:1,chart:1,table:1,img:1};
function dkHex(c){return validColor(c)?c.slice(1).toUpperCase():undefined}
function dkExportPptx(){
  commitEdit();var slides=pxSlides();if(!slides.length){toast('Belum ada slide di halaman ini');return}
  var d=DK(),mode=d.pptx;toast('Menyiapkan PowerPoint…');
  dkLoadPptx().then(function(Pptx){
    var pptx=new Pptx();pptx.layout='LAYOUT_WIDE';pptx.title=DOC.title||'Deck';var W=13.333,font=d.font||'Arial';
    var chain=Promise.resolve();
    slides.forEach(function(sl){chain=chain.then(function(){
      var ps=pptx.addSlide(),k=W/sl.w,X=function(v){return (v-sl.x)*k},Y=function(v){return (v-sl.y)*k},m=pxMembers(sl);
      if(mode==='image'){return new Promise(function(res){pxSlidePng(sl,function(b){if(!b){res();return}var rd=new FileReader();rd.onload=function(){ps.addImage({data:rd.result,x:0,y:0,w:W,h:sl.h*k});res()};rd.readAsDataURL(b)})})}
      ps.background={color:dkHex(validColor(sl.fill)?sl.fill:'#ffffff')};
      // chrome + every non-native element as one picture layer, in draw order; native text, charts, tables and images on top stay editable
      var isSvgImg=function(n){return fam(n)==='img'&&(!n.src||n.src.indexOf('data:image/svg')===0)},raster=m.nodes.filter(function(n){return !DK_NATIVE[fam(n)]||isSvgImg(n)}),box={x:sl.x,y:sl.y,w:sl.w,h:sl.h};
      var p1=dkSvgPng(dkPart(raster,m.edges,box),sl.w,sl.h,2).then(function(png){if(png)ps.addImage({data:png,x:0,y:0,w:W,h:sl.h*k})});
      return p1.then(function(){
        m.nodes.forEach(function(n){var f=fam(n),o={x:X(n.x),y:Y(n.y),w:n.w*k,h:n.h*k};
          if(isSvgImg(n))return;if(f==='img'&&n.src){ps.addImage(Object.assign({data:n.src,sizing:{type:n.fit==='cover'?'cover':'contain',w:o.w,h:o.h}},o));return}
          if(f==='rtext'||f==='text'){var L=rtParse(n.label),ac=dkHex(validColor(n.accent)?n.accent:d.accent),tc=dkHex(validColor(n.textColor)?n.textColor:'#1e1e1e'),runs=[];
            L.forEach(function(P,pi){if(P.b)runs.push({text:P.b+' ',options:{bold:true,color:P.b==='•'?ac:tc}});P.runs.forEach(function(r,ri){runs.push({text:r.t,options:{bold:!!(r.b||n.bold),italic:!!r.i,color:r.a?ac:tc,breakLine:ri===P.runs.length-1&&pi<L.length-1}})});if(!P.runs.length&&pi<L.length-1)runs.push({text:'',options:{breakLine:true}})});
            ps.addText(runs.length?runs:[{text:''}],Object.assign({fontFace:font,fontSize:Math.max(6,Math.round((n.fs||13)*k*72)),align:n.align==='center'?'center':n.align==='right'?'right':'left',valign:n.vcenter?'middle':'top',margin:2,fill:validColor(n.fill)?{color:dkHex(n.fill)}:undefined,line:n.box?{color:dkHex(validColor(n.stroke)?n.stroke:d.accent),width:1.2,dashType:n.box==='dash'?'dash':'solid'}:undefined,paraSpaceAfter:2},o));return}
          if(f==='table'){var R=dkRows(n.data),hf=dkHex(validColor(n.headerFill)?n.headerFill:d.primary);
            ps.addTable(R.map(function(r,i){return r.map(function(c,j){var num=i>0&&j>0&&/\d/.test(c)&&/^[-+]?[\d.,%\s]+[a-zA-Z%]*$/.test(c);return{text:c,options:{bold:i===0||j===0,color:i===0?'FFFFFF':'1E1E1E',fill:i===0?{color:hf}:(i%2===0?{color:'F8F9FA'}:undefined),align:num?'right':'left'}}})}),Object.assign({fontFace:font,fontSize:Math.max(6,Math.round((n.fs||12)*k*72)),border:{type:'solid',pt:0.5,color:'D0D5DD'},rowH:(n.fs||12)*2.1*k},{x:o.x,y:o.y,w:o.w}));return}
          if(f==='chart'){var D=chData(n);if(!D.series.length)return;var t=n.ctype||'bar',CT=pptx.ChartType||pptx.charts,type=t==='line'?CT.line:t==='area'?CT.area:t==='pie'?CT.pie:t==='donut'?CT.doughnut:CT.bar;
            ps.addChart(type,D.series.map(function(se){return{name:se.name,labels:D.cats,values:se.vals}}),Object.assign({barDir:t==='hbar'?'bar':'col',barGrouping:t==='stack'?'stacked':'clustered',chartColors:dkPal().map(dkHex),showValue:n.showVal!==0&&t!=='pie'&&t!=='donut',showPercent:t==='pie'||t==='donut',showLegend:D.series.length>1||t==='pie'||t==='donut',legendPos:'b',showTitle:!!n.label,title:n.label||undefined,titleFontSize:12,catAxisLabelFontSize:10,valAxisLabelFontSize:9,dataLabelFontSize:9,fontFace:font,valGridLine:{color:'E9ECEF',size:0.5}},o))}
        });
      });
    })});
    return chain.then(function(){return pptx.write({outputType:'blob'})}).then(function(blob){return offerFile(slug(DOC.title||'deck')+'.pptx',blob)}).then(function(){toast('PowerPoint siap: '+slides.length+' slide'+(mode==='image'?' (persis seperti layar)':' (teks, grafik, dan tabel bisa diedit)'))});
  }).catch(function(e){toast(String(e&&e.message||'Ekspor PowerPoint gagal'))});
}
// print / PDF keeps web fonts: slides are placed as live SVG instead of images
pxPrintSlides=function(){
  commitEdit();var list=pxSlides();if(!list.length){toast('Belum ada slide');return}
  var old=$('pxPrint');if(old)old.remove();var box=document.createElement('div');box.id='pxPrint';box.setAttribute('aria-hidden','true');
  var st=document.createElement('style');st.textContent='@page{size:'+list[0].w+'px '+list[0].h+'px;margin:0}#pxPrint .pg{width:100vw;height:100vh;page-break-after:always;break-after:page;display:flex}#pxPrint svg{width:100%;height:100%}';box.appendChild(st);
  list.forEach(function(sl){var pg=document.createElement('div');pg.className='pg';pg.innerHTML=pxSlideSvg(sl).replace(/^<svg /,'<svg preserveAspectRatio="xMidYMid meet" ');box.appendChild(pg)});
  document.body.appendChild(box);var done=function(){window.removeEventListener('afterprint',done);setTimeout(function(){box.remove()},400)};window.addEventListener('afterprint',done);
  setTimeout(function(){try{window.print()}catch(e){box.remove();toast('Browser ini memblokir cetak. Pakai “Unduh PNG”.')}},150);
};
// ---------- deck font ----------
var dkApply0=applyStyle;
applyStyle=function(){dkApply0();var d=DK();if(dtOf()==='deck'&&S.style!=='sketch'&&d.font&&d.font!=='Geist'){dkFontLoad(d.font);FONT='"'+d.font+'", '+FONT_CLEAN;svg.setAttribute('font-family',FONT)}};
function dkFontLoad(f){var id='dkf-'+f.replace(/\s+/g,'-');if(document.getElementById(id))return;var l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(f).replace(/%20/g,'+')+':wght@400;600;700&display=swap';l.onload=function(){if(document.fonts)document.fonts.load('700 16px "'+f+'"').then(function(){render()},function(){})};document.head.appendChild(l)}

// ---------- inspector ----------
var dkContent0=contentFields;
contentFields=function(n){
  var f=fam(n),s=dkContent0(n),d=DK();
  if(f==='rtext'){s=field('Teks · **tebal**, ==warna aksen==, _miring_, “- ” poin, “1. ” nomor',areaIn('label',n.label,'',6));
    s+='<div class="fld"><span>Ukuran</span>'+segIn('fs',String(n.fs||16),[['12','S'],['14','M'],['16','L'],['20','XL'],['28','2XL'],['40','3XL']])+'</div>';
    s+='<div class="fld"><span>Rata</span>'+segIn('align',n.align||'',[['','Kiri'],['center','Tengah'],['right','Kanan']])+'</div>';
    s+='<div class="fld"><span>Kotak</span>'+segIn('box',n.box||'',[['','Tanpa'],['solid','Garis'],['dash','Putus-putus']])+'</div>';
    s+='<div class="acts">'+togBtn('bold',n.bold,'Semua tebal')+togBtn('vcenter',n.vcenter,'Tengah vertikal')+'</div>';
    s+=swRow('accent','Warna aksen (==teks==)',n.accent,[d.accent,d.primary,'#1971c2','#2f9e44','#f08c00','#ffd43b'])}
  if(f==='chart'){s=field('Judul grafik',txtIn('label',n.label,'Opsional'));
    s+='<div class="fld"><span>Jenis</span>'+segIn('ctype',n.ctype||'bar',[['bar','Batang'],['hbar','Horizontal'],['stack','Bertumpuk'],['line','Garis'],['area','Area'],['pie','Pie'],['donut','Donut']])+'</div>';
    s+=field('Data · baris pertama = nama seri, kolom pertama = kategori (bisa tempel dari Excel/Sheets)',areaIn('data',n.data,'Tahun,Pendapatan\n2025,120',6,1));
    s+='<div class="acts">'+togBtn('noval',n.showVal===0,'Sembunyikan angka')+'</div>'}
  if(f==='table'){s=field('Data tabel · tempel dari Excel/Sheets, atau pisahkan kolom dengan koma / |',areaIn('data',n.data,'Kolom A,Kolom B',7,1));
    s+='<div class="fld"><span>Ukuran teks</span>'+segIn('fs',String(n.fs||12),[['10','S'],['12','M'],['14','L'],['16','XL']])+'</div>'+swRow('headerFill','Warna header',n.headerFill,[d.primary,d.accent,'#1e1e1e','#1971c2','#2f9e44'])}
  if(f==='icon'){s='<div class="acts"><button type="button" class="sbtn'+(iconOpen?' on':'')+'" data-act="icons">'+ic(n.icon||'star')+'Ganti ikon</button></div>'+(iconOpen?iconGrid(n):'')}
  if(f==='slide'){var secs=d.sections;
    s=field('Judul (kalimat kesimpulan)',areaIn('label',n.label,'Contoh: Konversi naik 2× lewat program referral',2))+field('Subjudul / konteks',txtIn('sub',n.sub,'Opsional'))+s.replace(/^[\s\S]*?(<div class="fld"><span>Rasio)/,'$1');
    s+='<div class="fld"><span>Bagian (tracker)</span>'+segIn('section',n.section==null?'':String(n.section),[['','—']].concat(secs.map(function(x,i){return[String(i),x]})))+'</div>';
    s+='<div class="fld"><span>Tampilan</span>'+segIn('layout',n.layout||'',[['','Dengan header & tracker'],['cover','Sampul'],['close','Penutup']])+'</div>';
    s+=dkDeckSec()}
  return s;
};
NUMK.section=1;
function dkDeckSec(){var d=DK();
  return '<div class="sec"><div class="st">Gaya deck (semua slide)</div>'+
    '<div class="dk-cols"><label class="dk-c"><span>Utama</span><input type="color" data-dk="primary" value="'+d.primary+'"></label><label class="dk-c"><span>Aksen</span><input type="color" data-dk="accent" value="'+d.accent+'"></label>'+
    '<label class="dk-c dk-f"><span>Font</span><select data-dk="font">'+DK_FONTS.map(function(f){return '<option'+(f===d.font?' selected':'')+'>'+f+'</option>'}).join('')+'</select></label></div>'+
    '<div class="dk-pre">'+[['#8a1c33','#e03131'],['#0b3d91','#f59f00'],['#5f3dc4','#d6336c'],['#0e6169','#f08c00'],['#1e1e1e','#1971c2'],['#1864ab','#ffd43b']].map(function(p){return '<button type="button" data-dkpre="'+p.join(',')+'" style="background:linear-gradient(135deg,'+p[0]+' 50%,'+p[1]+' 50%)" title="'+p.join(' + ')+'" aria-label="Palet '+p.join(' dan ')+'"></button>'}).join('')+'</div>'+
    field('Bagian tracker · pisahkan dengan |',txtIn('dk-sections',d.sections.join(' | ')).replace('data-f="dk-sections"','data-dk="sections"'))+
    '<div class="fld"><span>Gaya tracker</span><div class="seg">'+[['text','Teks'],['line','Garis'],['off','Tanpa']].map(function(o){return '<button type="button" data-dkset="tracker" data-v="'+o[0]+'" class="'+(d.tracker===o[0]?'on':'')+'">'+o[1]+'</button>'}).join('')+'</div></div>'+
    '<div class="acts"><button type="button" class="sbtn'+(d.pageNo?' on':'')+'" data-dkset="pageNo">Nomor halaman</button><button type="button" class="sbtn'+(d.titleBar?' on':'')+'" data-dkset="titleBar">Garis judul</button><button type="button" class="sbtn" data-dkset="logo">'+ic('image-plus')+(d.logo?'Ganti logo':'Logo')+'</button>'+(d.logo?'<button type="button" class="sbtn" data-dkset="nologo">'+ic('x')+'Hapus logo</button>':'')+'</div>'+
    '<div class="fld"><span>PowerPoint</span><div class="seg"><button type="button" data-dkset="pptx" data-v="edit" class="'+(d.pptx!=='image'?'on':'')+'">Bisa diedit</button><button type="button" data-dkset="pptx" data-v="image" class="'+(d.pptx==='image'?'on':'')+'">Persis seperti layar</button></div></div>'+
    '<div class="acts"><button type="button" class="sbtn pri-s" data-px="pptx">'+ic('download')+'Unduh .pptx</button><button type="button" class="sbtn" data-px="slides-print">'+ic('printer')+'PDF</button></div></div>';
}
inspBody.addEventListener('change',function(ev){var k=ev.target.getAttribute&&ev.target.getAttribute('data-dk');if(!k)return;var d=DK(),v=ev.target.value;pushUndo();
  if(k==='sections')d.sections=v.split('|').map(function(x){return x.trim()}).filter(Boolean).slice(0,7);else if(k==='font'){d.font=v;applyStyle()}else if(validColor(v))d[k]=v;
  renderAll();scheduleSave()});
inspBody.addEventListener('input',function(ev){var k=ev.target.getAttribute&&ev.target.getAttribute('data-dk');if(k==='primary'||k==='accent'){if(validColor(ev.target.value)){DK()[k]=ev.target.value;render()}}});
inspBody.addEventListener('click',function(ev){
  var pr=ev.target.closest('[data-dkpre]');if(pr){pushUndo();var p=pr.getAttribute('data-dkpre').split(',');DK().primary=p[0];DK().accent=p[1];renderAll();scheduleSave();return}
  var b=ev.target.closest('[data-dkset]');if(!b)return;var k=b.getAttribute('data-dkset'),d=DK();
  if(k==='logo'){dkLogoPick();return}
  pushUndo();if(k==='nologo')d.logo='';else if(k==='tracker'||k==='pptx')d[k]=b.getAttribute('data-v');else d[k]=d[k]?0:1;renderAll();scheduleSave();
});
var dkAct0=pxAct;pxAct=function(ev){var b=ev.target.closest('[data-px]');if(b){var a=b.getAttribute('data-px');
  if(a==='pptx'){dkExportPptx();return}if(a==='dk-layouts'){dkLayoutPop(b);return}if(a==='dk-project'){dkFromProject();return}
  if(a==='togp-noval'){return}}
  return dkAct0(ev)};
// “Sembunyikan angka” maps onto showVal
var dkApplyTog=inspBody.addEventListener('click',function(ev){var t=ev.target.closest('[data-act="togp"][data-k="noval"]');if(!t)return;ev.stopImmediatePropagation();var n=single();if(!n)return;pushUndo();if(n.showVal===0)delete n.showVal;else n.showVal=0;renderAll()},true);
function dkLogoPick(){var inp=document.createElement('input');inp.type='file';inp.accept='image/png,image/jpeg,image/webp,image/svg+xml';inp.onchange=function(){var f=inp.files&&inp.files[0];if(!f)return;pxReadImage(f,function(src){pushUndo();DK().logo=src;renderAll();scheduleSave();toast('Logo dipasang di semua slide')})};inp.click()}
// ---------- slide strip: layouts + deck from project + PPTX ----------
function dkLayoutPop(btn){
  var p=$('dkLay');if(!p){p=document.createElement('div');p.id='dkLay';p.className='pop dk-lay';p.setAttribute('role','menu');document.querySelector('.stage').appendChild(p)}
  if(!p.hidden&&p._open){p.hidden=true;p._open=0;return}
  p.innerHTML='<div class="dk-lay-h"><b>Tambah slide</b><button type="button" class="sbtn" data-px="dk-project">'+ic('sparkles')+'Susun deck dari proyek</button></div><div class="dk-lay-g">'+DK_LAYOUTS.map(function(l){return '<button type="button" data-dklay="'+l[0]+'">'+ic(ICONS[l[2]]?l[2]:'layout-template')+'<span>'+esc(l[1])+'</span></button>'}).join('')+'</div>';
  p.hidden=false;p._open=1;
  var r=btn.getBoundingClientRect(),sr=document.querySelector('.stage').getBoundingClientRect();p.style.left=Math.max(8,Math.min(r.left-sr.left-120,sr.width-460))+'px';p.style.bottom=(sr.bottom-r.top+8)+'px';
}
document.addEventListener('click',function(ev){
  var l=ev.target.closest('[data-dklay]');if(l){$('dkLay').hidden=true;$('dkLay')._open=0;dkAddSlide(l.getAttribute('data-dklay'));return}
  var pj=ev.target.closest('#dkLay [data-px="dk-project"]');if(pj){$('dkLay').hidden=true;$('dkLay')._open=0;dkFromProject();return}
  var p=$('dkLay');if(p&&!p.hidden&&!ev.target.closest('#dkLay')&&!ev.target.closest('[data-px="slide-add"],[data-px="dk-layouts"]')){p.hidden=true;p._open=0}
});
var dkStrip0=pxSyncStrip;
pxSyncStrip=function(force){dkStrip0(force);var el=$('pxStrip');if(!el||el.hidden)return;
  var add=el.querySelector('[data-px="slide-add"]');if(add){add.setAttribute('data-px','dk-layouts');add.title='Tambah slide dari layout'}
  if(!el.querySelector('[data-px="pptx"]')){var pr=el.querySelector('[data-px="slides-png"]');if(pr)pr.insertAdjacentHTML('beforebegin','<button type="button" class="tb" data-px="pptx" title="Unduh PowerPoint (.pptx)" aria-label="Unduh PowerPoint">'+ic('file-down')+'<span class="lbl">PPTX</span></button>')}};
var dkSlBtn=$('btnSlides').onclick;$('btnSlides').onclick=function(){if(dtOf()==='deck'&&!pxSlides().length){pxStripOpen(true);setTimeout(function(){var b=document.querySelector('#pxStrip [data-px="dk-layouts"]');if(b)dkLayoutPop(b)},60);return}dkSlBtn()};
$('pxStrip').addEventListener('click',function(ev){var b=ev.target.closest('[data-px="dk-layouts"],[data-px="pptx"]');if(!b)return;ev.stopImmediatePropagation();if(b.getAttribute('data-px')==='pptx')dkExportPptx();else dkLayoutPop(b)},true);
// Ctrl+K entries
NV_ACTS.push(['pptx','Unduh PowerPoint (.pptx)','file-down','ppt pitch deck slide presentasi',function(){dkExportPptx()}],['deckproj','Susun pitch deck dari proyek','monitor','ppt slide otomatis',function(){dkFromProject()}],['deckpage','Buka halaman Pitch Deck','monitor','slide deck ppt',function(){pjSwitch('deck')}]);
