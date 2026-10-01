// ================= workspaces & diagram types (UI) =================
var DT_ICON={bpmn:'workflow',vc:'link-2',ff:'target',wsf:'component',org:'network',dikw:'layers',wp:'arrow-right-left',vmodel:'git-merge',gen:'flag',swot:'grid-2x2',bmc:'layout-dashboard',pestel:'layout-grid',vpc:'circle-dot',mcf:'chart-scatter',
  usecase:'person-standing',activity:'git-fork',sequence:'columns-3',class:'table',state:'toggle-right',dfd:'split',erd:'database',
  arch:'server',c4:'boxes',k8s:'ship-wheel',network:'router',dist:'share-2',n8n:'webhook',agent:'bot',rag:'library',multi:'users-round',mlpipe:'brain-circuit',
  userflow:'route',wire:'panels-top-left',journey:'map',sitemap:'folder-tree',persona:'square-user',empathy:'smile',board:'sticky-note',mind:'lightbulb'};
Object.keys(FW).forEach(function(k){if(DT_ICON[k])FW[k].icon=DT_ICON[k]});
var WS_BY={};WS.forEach(function(w){WS_BY[w.id]=w});
var uiWs=null,secOpen={};
var TREE_SEED={org:'Pimpinan | nama\n  Bagian A\n  Bagian B\n  Bagian C',page:'Home | /\n  Tentang | /tentang\n  Produk | /produk\n  Kontak | /kontak',mind:'Ide utama\n  Cabang 1\n  Cabang 2\n  Cabang 3'};
function exShort(k){var n=EX[k].n,i=n.indexOf(' · ');return i>=0?n.slice(i+3):n}
function primarySecs(dt){
  var D=DT[dt],p;
  if(D.fw)p=['fw-blocks',D.ws==='ux'?'fw-ux':'fw-biz'];else p=(D.pal||[]).slice();
  return p.filter(function(s,i){return SEC[s]&&p.indexOf(s)===i});
}
function syncDomain(){
  var dt=dtOf();if(!uiWs||!WS_BY[uiWs])uiWs=DT[dt].ws;
  renderWsTabs();renderChips();renderPalHead();buildPalette();buildFlowSel();buildExamples();renderEmpty();
}
function renderWsTabs(){
  var cur=DT[dtOf()].ws;
  $('wsTabs').innerHTML=WS.map(function(w){var on=w.id===uiWs;return '<button type="button" role="tab" data-ws="'+w.id+'" aria-selected="'+on+'" title="'+esc(w.n)+'">'+ic(w.icon)+'<span class="lbl">'+esc(w.n)+'</span>'+(w.id===cur&&!on?'<span class="cur" title="Current diagram"></span>':'')+'</button>'}).join('');
}
function renderChips(){
  var dt=dtOf(),s='',box=$('dtChips');
  Object.keys(DT).forEach(function(k){if(DT[k].ws!==uiWs)return;s+='<button type="button" class="dt-chip" data-dt="'+k+'" aria-pressed="'+(k===dt)+'" title="'+esc(DT[k].hint)+'">'+ic(DT_ICON[k]||'layout-grid')+'<span>'+esc(DT[k].n)+'</span></button>'});
  box.innerHTML=s;
  var on=box.querySelector('[aria-pressed="true"]');
  if(on&&(on.offsetLeft<box.scrollLeft||on.offsetLeft+on.offsetWidth>box.scrollLeft+box.clientWidth))box.scrollLeft=Math.max(0,on.offsetLeft-16);
}
function renderPalHead(){
  var dt=dtOf(),D=DT[dt],ex=exampleKeys(null,dt);
  $('palType').innerHTML='<div class="pt-row"><span class="pt-badge">'+ic(DT_ICON[dt]||'layout-grid')+'</span><span class="pt-t"><b>'+esc(D.n)+'</b><small>'+esc(WS_BY[D.ws].n)+'</small></span></div><p class="pt-hint">'+esc(D.hint)+'</p>'+
    (ex.length?'<div class="pt-ex"><span>Examples</span>'+ex.slice(0,4).map(function(k){return '<button type="button" data-ex="'+k+'">'+esc(exShort(k))+'</button>'}).join('')+'</div>':'');
}
function buildFlowSel(){
  var sel=$('flowSel'),cur=sel.value||'auto',go=edgeGroupOrder(),pri=edgeGroups(dtOf());
  var s='<option value="auto">Auto line type</option>';
  go.order.forEach(function(g){s+='<optgroup label="'+esc(g)+(pri.indexOf(g)<0?' · other':'')+'">'+go.groups[g].map(function(k){return '<option value="'+k+'">'+esc(EDGE[k].n)+'</option>'}).join('')+'</optgroup>'});
  sel.innerHTML=s;sel.value=EDGE[cur]?cur:'auto';
}
function buildExamples(){
  var s='<option value="">Examples…</option>',order=[uiWs].concat(WS.map(function(w){return w.id}).filter(function(id){return id!==uiWs}));
  order.forEach(function(ws){Object.keys(DT).forEach(function(dt){if(DT[dt].ws!==ws)return;var ks=exampleKeys(null,dt);if(!ks.length)return;s+='<optgroup label="'+esc(DT[dt].n)+' · '+esc(WS_BY[ws].n)+'">'+ks.map(function(k){return '<option value="'+k+'">'+esc(exShort(k))+'</option>'}).join('')+'</optgroup>'})});
  $('tplSel').innerHTML=s;
}
function renderEmpty(){
  var dt=dtOf(),D=DT[dt],ks=exampleKeys(null,dt);
  $('emptyT').textContent='Blank '+D.n+' canvas';
  $('emptyP').textContent=D.hint+' Add shapes from the left panel, double-click the canvas, or start from an example.';
  $('emptyEx').hidden=!ks.length;if(ks.length)$('emptyExL').textContent='Example: '+exShort(ks[0]);
}
function isPristine(){var k=contentKey();return (!S.nodes.length&&!S.edges.length)||(k===lastKey&&(!DOC.id||DOC.example))}
function chooseType(dt,el){
  commitEdit();
  if(!$('dtPop').hidden&&$('dtPop').getAttribute('data-for')===dt){closeDtPop();return}
  closeDtPop();
  if(isPristine()){if(dt!==dtOf())startNew(dt);return}
  openDtPop(dt,el);
}
function openDtPop(dt,el){
  var D=DT[dt],k=dtKind(dt),ks=exampleKeys(null,dt),same=dt===dtOf();
  var here=k==='fw'?'Insert into this canvas':k==='tree'?'Add one to this canvas':same?'':'Use its tools on this canvas';
  var p=$('dtPop');p.setAttribute('data-for',dt);
  p.innerHTML='<div class="dp-h"><span class="pt-badge">'+ic(DT_ICON[dt]||'layout-grid')+'</span><b>'+esc(D.n)+'</b></div><p class="dp-hint">'+esc(D.hint)+'</p>'+
    '<div class="dp-acts"><button type="button" class="btn pri" data-dtgo="new" data-dt="'+dt+'">'+ic('file-plus-2')+'New '+esc(D.n)+'</button>'+(here?'<button type="button" class="btn" data-dtgo="here" data-dt="'+dt+'">'+esc(here)+'</button>':'')+'</div>'+
    (ks.length?'<div class="pt-ex"><span>Examples</span>'+ks.map(function(x){return '<button type="button" data-ex="'+x+'">'+esc(exShort(x))+'</button>'}).join('')+'</div>':'')+
    '<p class="dp-note">A new diagram keeps the current one safe in Diagrams.</p>';
  p.hidden=false;
  var dom=$('domain').getBoundingClientRect(),r=el.getBoundingClientRect(),w=p.offsetWidth;
  p.style.left=Math.round(clamp(r.left-dom.left,0,Math.max(0,dom.width-w)))+'px';p.style.top=Math.round(r.bottom-dom.top+6)+'px';
}
function closeDtPop(){var p=$('dtPop');if(p&&!p.hidden){p.hidden=true;p.removeAttribute('data-for')}}
function seedType(dt,fresh){
  var k=dtKind(dt);
  if(k==='fw'){var spec=FW[DT[dt].fw].build({}),sb=specBounds(spec.nodes),o=fresh?{x:-sb.x,y:-sb.y}:placeOrigin(sb,null);insertBlock(spec,o.x,o.y);return true}
  if(k==='tree'){var b=fresh?null:bounds(S.nodes,[]);buildTree(TREE_SEED[DT[dt].tree],DT[dt].tree,b?snap(b.x+b.w+160):0,b?snap(b.y):0);return true}
  return false;
}
function startNew(dt){
  commitEdit();saveNow();
  loadDoc({title:'Untitled '+DT[dt].n,nodes:[],edges:[],dt:dt},null);
  if(seedType(dt,true)){undo=[];redo=[];syncUndoBtns();lastKey=contentKey();renderAll();fitView();writeWorking()}
}
function startHere(dt){
  commitEdit();pushUndo();
  var before=S.nodes.length;S.dt=dt;uiWs=DT[dt].ws;
  seedType(dt,false);
  selN=[];selE=null;syncDomain();renderAll();
  var added=S.nodes.slice(before);if(added.length)fitTo(bounds(added,[]),1);
  toast(added.length?DT[dt].n+' added beside your diagram':'Now using '+DT[dt].n+' tools on this canvas');
}
function openExample(key,silent){
  var ex=EX[key];if(!ex)return;commitEdit();closeDtPop();
  if(!silent)saveNow();
  S={nodes:[],edges:[],seq:1,dt:ex.dt};
  try{ex.build()}catch(err){if(window.console)console.error(err)}
  var built={title:ex.n+' (contoh)',nodes:S.nodes,edges:S.edges,seq:S.seq,dt:ex.dt,style:S.style};
  loadDoc(built,null,{example:true});
  if(!silent)toast('Opened “'+exShort(key)+'” as a new diagram. Your previous one is in Diagrams.');
}

// ================= palette =================
function isDrawer(el){return getComputedStyle(el).position==='fixed'}
function openPalette(){var p=$('pal');if(isDrawer(p))p.classList.add('open')}
function closeDrawer(){if(isDrawer($('pal')))$('pal').classList.remove('open')}
function palName(t){
  if(t.indexOf('fw:')===0)return DT[t.slice(3)].n;
  if(t.indexOf('u:')===0){var x=ICONLIB[t.slice(2)];return x?x.name:'Icon'}
  return t==='pool-bb'?'Pool (black box)':t==='pool'?'Pool + 2 lanes':T[t].n;
}
function palItem(t){var nm=palName(t);return '<button type="button" class="pal-item" draggable="true" data-add="'+esc(t)+'" title="'+esc(nm)+'">'+previewSvg(t)+'<span>'+esc(nm)+'</span></button>'}
function secHtml(id,open,title){
  var sec=SEC[id];if(!sec)return '';
  var keys=sec.keys.filter(function(k){return k==='pool-bb'||(k.indexOf('fw:')===0?!!FW[k.slice(3)]:!!T[k])});if(!keys.length)return '';
  var wide=id==='fw-biz'||id==='fw-ux';
  return '<details class="pal-sec" data-sec="'+id+'"'+(open?' open':'')+'><summary>'+ic('chevron-right')+esc(title||sec.n)+(sec.cat?'<span class="dot" style="background:'+catColor(sec.cat)+'"></span>':'')+'</summary><div class="pal-grid'+(wide?' wide':'')+'">'+keys.map(palItem).join('')+'</div></details>';
}
function myIconsSec(){
  var ids=Object.keys(ICONLIB).sort(function(a,b){return String(ICONLIB[a].name).localeCompare(String(ICONLIB[b].name))});
  var s='<details class="pal-sec" data-sec="my"'+(secOpen.my!==false?' open':'')+'><summary>'+ic('chevron-right')+'My icons'+(ids.length?'<span class="cnt">'+ids.length+'</span>':'')+'</summary><div class="pal-grid">'+ids.map(function(id){return palItem('u:'+id)}).join('')+'<button type="button" class="pal-item up" data-pal="icons">'+ic('image-plus')+'<span>Upload logos</span></button></div>';
  if(!ids.length)s+='<p class="pal-foot">Drop logo images here. The plain background is removed and the logo is trimmed. Name a file after a tech (gemini.png, qwen.svg) and every matching tech-stack item uses it.</p>';
  return s+'</details>';
}
function buildPalette(){
  var q=$('palQ').value.trim(),s='',dt=dtOf();
  if(q){
    var lq=q.toLowerCase();
    var fwHits=Object.keys(FW).filter(function(k){return (FW[k].n+' '+DT[k].n+' framework canvas matrix').toLowerCase().indexOf(lq)>=0}).map(function(k){return 'fw:'+k});
    var uHits=Object.keys(ICONLIB).filter(function(id){return String(ICONLIB[id].name).toLowerCase().indexOf(lq)>=0}).map(function(id){return 'u:'+id});
    var res=uHits.concat(fwHits,searchTypes(q));
    s=res.length?'<div class="pal-grid" style="padding-top:8px">'+res.slice(0,84).map(palItem).join('')+'</div>':'<p class="pal-empty">Nothing matches “'+esc(q)+'”. Try a product name such as Redis, Kafka, n8n or LangGraph, or a notation such as actor, entity or swot.</p>';
  }else{
    var prim=primarySecs(dt);
    prim.forEach(function(id){s+=secHtml(id,secOpen[id]!==false)});
    var ws=uiWs||DT[dt].ws,more=wsSections(ws).filter(function(id){return prim.indexOf(id)<0});
    if(more.length){s+='<div class="pal-more">'+(ws===DT[dt].ws?'More in ':'From ')+esc(WS_BY[ws].n)+'</div>';more.forEach(function(id){s+=secHtml(id,!!secOpen[id])})}
    s+=myIconsSec();
    if(dt==='bpmn')s+='<p class="pal-foot">Add lanes from the properties panel after you select a pool.</p>';
    if(dt==='n8n'||dt==='agent')s+='<p class="pal-foot">Components land as n8n-style tiles in n8n diagrams. Use START, END and conditional routes for LangGraph-style graphs.</p>';
  }
  palBody.innerHTML=s;
}
var PREV={'u-actor':[30,52],'u-usecase':[84,42],'u-act-initial':[24,24],'u-act-final':[26,26],'u-act-flowfinal':[24,24],'u-act-action':[84,36],'u-act-decision':[36,36],'u-act-bar':[84,8],'u-act-send':[84,36],'u-act-recv':[84,36],'u-state':[84,42],'u-choice':[34,34],'u-seq-act':[12,50],
  'b-boundary':[84,62],'b-package':[84,58],'b-frag':[92,58],'b-c4b':[92,62],'b-frame':[84,58],'b-phone':[34,64],'b-browser':[96,62],
  'er-entity':[84,38],'er-weak':[84,38],'er-attr':[74,36],'er-key':[74,36],'er-multi':[74,36],'er-derived':[74,36],'er-rel':[74,46],'er-idrel':[80,50],
  'dfd-ext':[74,42],'dfd-proc':[56,56],'dfd-procgs':[74,52],'dfd-store':[84,30],
  'c4-person':[62,58],'c4-extperson':[62,58],'c4-system':[84,54],'c4-container':[84,54],'c4-component':[84,54],'c4-db':[72,58],'c4-ext':[84,54],
  'ux-screen':[74,54],'k-cell':[84,58],
  'wf-heading':[84,22],'wf-text':[84,36],'wf-button':[76,28],'wf-input':[84,28],'wf-search':[84,26],'wf-image':[74,52],'wf-card':[66,74],'wf-list':[76,60],'wf-nav':[96,32],'wf-tabbar':[96,34],'wf-checkbox':[60,22],'wf-toggle':[70,24],'wf-avatar':[36,36],'wf-chip':[62,26],'wf-divider':[84,10]};
var PREV_LAB={'wf-heading':'Heading','wf-button':'Button','wf-input':'Email','wf-search':'Search','wf-card':'Card','wf-nav':'App','wf-chip':'Tag','c4-person':'','u-state':''};
var fwPrevCache={};
function svgWrap(vb,inner){return '<svg viewBox="'+vb+'" aria-hidden="true" preserveAspectRatio="xMidYMid meet">'+inner+'</svg>'}
function specBounds(nodes){var x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;nodes.forEach(function(n){x1=Math.min(x1,n.x);y1=Math.min(y1,n.y);x2=Math.max(x2,n.x+n.w);y2=Math.max(y2,n.y+n.h)});return isFinite(x1)?{x:x1,y:y1,w:x2-x1,h:y2-y1}:{x:0,y:0,w:100,h:100}}
function fwPreview(k){
  var key=TH.name+':'+k;if(fwPrevCache[key])return fwPrevCache[key];
  var spec=FW[k].build({}),b=specBounds(spec.nodes),s='';
  spec.nodes.forEach(function(o){if(o.t==='text')return;var n={};for(var x in o)n[x]=o[x];n.id='p';s+=drawNode(n,true)});
  var pad=Math.max(b.w,b.h)*0.03;
  return fwPrevCache[key]=svgWrap(r1(b.x-pad)+' '+r1(b.y-pad)+' '+r1(b.w+pad*2)+' '+r1(b.h+pad*2),s);
}
function customPreview(t){
  var I=TH.ink,F=TH.shape,A=TH.name==='dark'?'#6db5bb':'#0e6169',M=TH.muted,st=' stroke="'+I+'" stroke-width="1.3"';
  if(t==='u-seq-life')return svgWrap('0 0 48 44','<rect x="9" y="2" width="30" height="11" rx="2" fill="'+F+'"'+st+'/><path d="M24 13V42" stroke="'+I+'" stroke-width="1.2" stroke-dasharray="3 2.5"/><rect x="21" y="19" width="6" height="15" fill="'+F+'" stroke="'+I+'" stroke-width="1"/>');
  if(t==='u-seq-actor')return svgWrap('0 0 48 44','<circle cx="24" cy="5" r="3.4" fill="'+F+'"'+st+'/><path d="M24 8.4V16M18.5 11.5H29.5M24 16L19.5 21.5M24 16L28.5 21.5" fill="none"'+st+' stroke-linecap="round"/><path d="M24 25V43" stroke="'+I+'" stroke-width="1.2" stroke-dasharray="3 2.5"/>');
  if(t==='tr-org')return svgWrap('0 0 48 40','<rect x="15" y="2" width="18" height="10" rx="2" fill="'+A+'" fill-opacity=".25" stroke="'+A+'" stroke-width="1.2"/><path d="M24 12V18M9 18H39M9 18V24M24 18V24M39 18V24" fill="none" stroke="'+I+'" stroke-width="1.1"/><rect x="2" y="24" width="14" height="9" rx="2" fill="'+F+'" stroke="'+A+'" stroke-width="1.1"/><rect x="17" y="24" width="14" height="9" rx="2" fill="'+F+'" stroke="'+A+'" stroke-width="1.1"/><rect x="32" y="24" width="14" height="9" rx="2" fill="'+F+'" stroke="'+A+'" stroke-width="1.1"/>');
  if(t==='tr-mind'){var C=MIND_C[TH.name];return svgWrap('0 0 48 40','<path d="M20 20C28 20 26 8 34 8M20 20C28 20 30 20 36 20M20 20C28 20 26 32 34 32" fill="none" stroke="'+C[1]+'" stroke-width="1.6"/><rect x="2" y="14" width="20" height="12" rx="6" fill="'+C[0]+'"/><path d="M34 9H46M36 21H46M34 33H46" stroke="'+C[2]+'" stroke-width="1.8" stroke-linecap="round"/>')}
  if(t==='b-phone')return svgWrap('0 0 48 44','<rect x="15" y="2" width="18" height="40" rx="5" fill="'+F+'" stroke="'+I+'" stroke-width="1.4"/><rect x="20.5" y="4.5" width="7" height="2.4" rx="1.2" fill="'+I+'"/><path d="M18 11H30M18 15H27" stroke="'+M+'" stroke-width="1.6" stroke-linecap="round"/><rect x="18" y="33" width="12" height="4" rx="1.5" fill="'+I+'"/>');
  if(t==='tr-page')return svgWrap('0 0 48 40','<rect x="16" y="2" width="16" height="12" rx="2" fill="'+F+'" stroke="'+M+'" stroke-width="1.1"/><path d="M16 5.5H32" stroke="'+M+'"/><path d="M24 14V19M10 19H38M10 19V24M38 19V24" fill="none" stroke="'+I+'" stroke-width="1.1"/><rect x="3" y="24" width="14" height="12" rx="2" fill="'+F+'" stroke="'+M+'" stroke-width="1.1"/><rect x="31" y="24" width="14" height="12" rx="2" fill="'+F+'" stroke="'+M+'" stroke-width="1.1"/>');
  return null;
}
function previewSvg(t){
  if(t.indexOf('fw:')===0)return fwPreview(t.slice(3));
  if(t.indexOf('u:')===0){var x=ICONLIB[t.slice(2)];return x?'<img src="'+x.data+'" alt="">':''}
  var cp=customPreview(t);if(cp)return cp;
  var real=t==='pool-bb'?'pool':t,d=T[real];if(!d)return '';
  var f=d.f,n={id:'p',t:real,x:0,y:0,w:0,h:0,label:''};
  if(f==='comp'){n.w=40;n.h=40;n.look='tile';return svgWrap('-4 -2 48 44',drawComp(n,true))}
  if(f==='zone'){n.w=64;n.h=44;return svgWrap('-3 -3 70 50',drawZone(n,true))}
  if(f==='shape'){
    var sz={decision:[58,40],connector:[30,30],lgstart:[72,28],lgend:[72,28],ellipse:[58,38]}[d.k]||[60,38];
    n.w=sz[0];n.h=sz[1];var lg=d.k==='lgstart'||d.k==='lgend';if(lg)n.label=d.k==='lgstart'?'START':'END';
    return svgWrap('-4 -4 '+(n.w+8)+' '+(n.h+8),drawShape(n,!lg));
  }
  if(f==='note'){n.w=52;n.h=40;return svgWrap('-4 -4 60 48',drawNote(n,true))}
  var noLab=true;
  if(PREV[real]){n.w=PREV[real][0];n.h=PREV[real][1]}else{var sz2=size(real);n.w=sz2[0];n.h=sz2[1]}
  if(PREV_LAB[real]!=null){n.label=PREV_LAB[real];noLab=false}
  if(real==='u-class'||real==='u-interface'||real==='u-enum'){n.label=real==='u-class'?'Class':real==='u-interface'?'IRepo':'Status';n.attrs=real==='u-enum'?'ON\nOFF':real==='u-class'?'- id\n- name':'';n.ops=real==='u-enum'?'':'+ save()';n.stereo=real==='u-interface'?'interface':real==='u-enum'?'enumeration':'';n.w=92;n.h=classLayout(n).need;noLab=false}
  if(real==='er-table'){n.label='table';n.body='PK id: int\nname: text';n.w=104;n.h=90;noLab=false}
  if(real==='k-cell'){n.head='band';n.tone='#0e6169';noLab=false}
  if(real==='b-frag')n.label='';
  if(real==='pool'){n.w=120;n.h=80;n.lanes=t==='pool'?[{name:'',h:40},{name:'',h:40}]:[]}
  if(real==='group'){n.w=110;n.h=70}
  if(real==='annotation'){n.w=80;n.h=50;n.label='Note';noLab=false}
  if(real==='text'){n.w=80;n.h=30;n.label='Text';noLab=false}
  if(real==='text-h'){n.w=110;n.h=36;n.label='Heading';n.fs=22;n.bold=1;noLab=false}
  if(f==='task'){n.w=90;n.h=56}
  return '<svg viewBox="-6 -6 '+(n.w+12)+' '+(n.h+12)+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'+drawNode(n,noLab)+'</svg>';
}
var FLOWF={ev:1,task:1,gw:1,comp:1,shape:1,uml:1,dfd:1,c4:1,ux:1,er:1};
function placeOrigin(sb,at){
  if(at)return{x:snap(at.x-sb.w/2-sb.x),y:snap(at.y-sb.h/2-sb.y)};
  var b=bounds(S.nodes,[]);
  if(!b)return{x:-sb.x,y:-sb.y};
  return{x:snap(b.x+b.w+140-sb.x),y:snap(b.y-sb.y)};
}
function insertFramework(fw,at){
  if(!FW[fw])return;pushUndo();
  var spec=FW[fw].build({}),sb=specBounds(spec.nodes),o=placeOrigin(sb,at),ids=insertBlock(spec,o.x,o.y);
  selN=[];selE=null;renderAll();fitTo(bounds(ids.map(byId),[]),1);
  toast(DT[fw].n+' inserted. Fill it in from the right panel, or double-click a block.');
}
function addShape(t,x,y,fromClick,extra){
  var real=t==='pool-bb'?'pool':t,f=T[real].f,sz=size(real),base=single(),link=null,look=null;
  if(fromClick&&base&&TREEF[f]&&fam(base)===f){treeAdd(base,'child');closeDrawer();return}
  pushUndo();
  if(fromClick&&isLife({t:real})){
    var lifes=S.nodes.filter(isLife);
    if(lifes.length){
      var n0=addNode(real,0,0);n0.x=snap(Math.max.apply(null,lifes.map(function(o){return o.x+o.w}))+60);n0.y=Math.min.apply(null,lifes.map(function(o){return o.y}));n0.h=Math.max.apply(null,lifes.map(function(o){return o.h}));
      addRecent(real);selN=[n0.id];selE=null;renderAll();closeDrawer();startEdit({k:'n',id:n0.id});return;
    }
  }
  if(fromClick&&base&&FLOWF[fam(base)]&&(FLOWF[f]||f==='data'||f==='ann'||f==='note')&&!isLife(base)&&!isLife({t:real})&&real!=='u-seq-act'){
    if(f==='comp'&&fam(base)==='comp'&&base.look==='tile'){look='tile';sz=[64,64]}
    var bc=center(base),down=DT[dtOf()].dir==='TB';
    if(FLOWF[f]){if(down){x=bc.x;y=base.y+nodeBounds(base).h+70+sz[1]/2}else{x=base.x+base.w+80+sz[0]/2;y=bc.y}}
    else{x=bc.x+(f==='ann'||f==='note'?120:0);y=base.y-sz[1]/2-60}
    var guard=0;while(overlaps(snap(x-sz[0]/2),snap(y-sz[1]/2),sz[0],sz[1])&&guard++<20){if(FLOWF[f]&&!down)y+=sz[1]+40;else x+=sz[0]+30}
    var kb=T[base.t].k,kr=T[real].k;
    if(autoConn&&!(fam(base)==='ev'&&kb==='end')&&base.t!=='fc-lgend'&&kb!=='act-final'&&kb!=='act-flowfinal'&&!(FLOWF[f]&&(kr==='start'||real==='fc-lgstart'||kr==='act-initial')))link=base.id;
  }else if(fromClick&&f!=='pool'&&f!=='group'&&f!=='zone'&&f!=='box'){
    var g2=0;while(overlaps(snap(x-sz[0]/2),snap(y-sz[1]/2),sz[0],sz[1])&&g2++<40){x+=sz[0]+30;if(g2%6===0){x-=6*(sz[0]+30);y+=sz[1]+40}}
  }
  var ex=extra?clone(extra):{};if(look)ex.look='tile';
  var n=t==='pool-bb'?addNode('pool',x,y,{lanes:[],h:110,label:'Participant name'}):addNode(real,x,y,Object.keys(ex).length?ex:null);
  if(link){var ne=addEdge(link,n.id);if(ne&&(f==='ann'||f==='note')){var a=ne.from;ne.from=n.id;ne.to=a}}
  if(TREEF[f])mindSize(n,0);
  addRecent(real);selN=[n.id];selE=null;renderAll();closeDrawer();
  var k=T[real].k,fixed=T[real].fixed||k==='act-bar'||k==='seq-act'||k==='act-decision'||k==='choice'||k==='lgstart'||k==='lgend'||f==='zone'||f==='pool'||f==='group'||f==='box'||f==='data'||f==='ev'||f==='draw'||(f==='wf'&&['image','divider','avatar','tabbar','list','text'].indexOf(k)>=0);
  if(!fixed)startEdit({k:'n',id:n.id,f:'label'});
}
function addFromPalette(t,x,y,fromClick){
  commitEdit();
  if(t.indexOf('fw:')===0){insertFramework(t.slice(3),fromClick?null:{x:x,y:y});closeDrawer();return}
  if(t.indexOf('u:')===0){var id=t.slice(2),icn=ICONLIB[id];if(!icn)return;var tk='c-'+techKey(icn.name);if(T[tk]&&T[tk].tech&&techIconId(T[tk].n)===id)addShape(tk,x,y,fromClick,null);else addShape('c-logo',x,y,fromClick,{img:id,label:icn.name});return}
  if(t!=='pool-bb'&&!T[t])return;
  addShape(t,x,y,fromClick,null);
}

// ================= My icons =================
var iconCloud=null,iconConfirm=null;
var iconLocal={
  all:function(){try{var o=JSON.parse(lsGet('rancang:icons')||'{}');return o&&typeof o==='object'?o:{}}catch(e){return{}}},
  save:function(id,rec){var o=this.all();o[id]=rec;return lsSet('rancang:icons',JSON.stringify(o))?Promise.resolve():Promise.reject({code:'storage_full'})},
  remove:function(id){var o=this.all();delete o[id];lsSet('rancang:icons',JSON.stringify(o));return Promise.resolve()}
};
function iconRec(id){var x=ICONLIB[id];return{name:String(x.name||'Icon').slice(0,40),data:x.data,w:x.w||0,h:x.h||0,createdAt:x.createdAt||Date.now()}}
function iconSave(id){var rec=iconRec(id);if(iconCloud)return iconCloud.doc(id).set(rec).catch(function(){return iconLocal.save(id,rec)});return iconLocal.save(id,rec)}
function iconRemove(id){delete ICONLIB[id];reindexIcons();var p=[iconLocal.remove(id)];if(iconCloud)p.push(iconCloud.doc(id).delete().catch(function(){}));return Promise.all(p)}
function loadLocalIcons(){var o=iconLocal.all();Object.keys(o).forEach(function(id){if(o[id]&&typeof o[id].data==='string'&&o[id].data.indexOf('data:image/')===0)ICONLIB[id]=o[id]});reindexIcons()}
function iconsChanged(){reindexIcons();render();buildPalette();if(!$('mIcons').hidden)renderIcons();if(single())renderInsp()}
function initIconCloud(db,uid){
  try{iconCloud=db.doc('data/users/'+uid+'/lib').collection('icons')}catch(e){iconCloud=null;return}
  iconCloud.orderBy('createdAt','desc').limit(300).get().then(function(snap){
    var have={};
    snap.docs.forEach(function(d){var x=d.data();if(x&&typeof x.data==='string'&&x.data.indexOf('data:image/')===0){ICONLIB[d.id]=x;have[d.id]=1}});
    var loc=iconLocal.all();
    Object.keys(loc).forEach(function(id){if(!have[id]&&loc[id]&&loc[id].data)iconCloud.doc(id).set(loc[id]).then(function(){iconLocal.remove(id)},function(){})});
    iconsChanged();
  }).catch(function(){iconCloud=null});
}
function registerIcons(map,persist){
  if(!map||typeof map!=='object')return;var added=0;
  Object.keys(map).slice(0,60).forEach(function(id){
    var x=map[id];if(!/^[a-z0-9]{3,40}$/i.test(id)||ICONLIB[id]||!x||typeof x.data!=='string'||x.data.indexOf('data:image/')!==0||x.data.length>400000)return;
    ICONLIB[id]={name:String(x.name||'Icon').slice(0,40),data:x.data,w:+x.w||0,h:+x.h||0,createdAt:+x.createdAt||Date.now()};added++;
    if(persist)iconSave(id).catch(function(){});
  });
  if(added)reindexIcons();
}
function usedIcons(){var out={};S.nodes.forEach(function(n){if(fam(n)!=='comp')return;var id=iconIdFor(n);if(id&&!out[id])out[id]=iconRec(id)});return out}
function isImageFile(f){return !!f&&(/^image\/(png|jpe?g|webp|svg\+xml|gif)$/i.test(f.type)||/\.(png|jpe?g|webp|svg|gif)$/i.test(f.name||''))}
function readAs(file,how){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result)};r.onerror=function(){rej({code:'read'})};if(how==='text')r.readAsText(file);else r.readAsDataURL(file)})}
function loadImg(src){return new Promise(function(res,rej){var im=new Image();im.onload=function(){res(im)};im.onerror=function(){rej({code:'decode'})};im.src=src})}
function cleanSvg(txt){
  return String(txt).replace(/<\?xml[\s\S]*?\?>/g,'').replace(/<!DOCTYPE[\s\S]*?>/gi,'').replace(/<!--[\s\S]*?-->/g,'')
    .replace(/<script[\s\S]*?<\/script\s*>/gi,'').replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi,'')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi,'').replace(/(href\s*=\s*["'])\s*javascript:[^"']*/gi,'$1#').trim();
}
function svgUri(txt){return 'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(txt)))}
function alphaBox(id){var d=id.data,w=id.width,h=id.height,x1=w,y1=h,x2=-1,y2=-1,x,y;for(y=0;y<h;y++)for(x=0;x<w;x++)if(d[(y*w+x)*4+3]>12){if(x<x1)x1=x;if(x>x2)x2=x;if(y<y1)y1=y;if(y>y2)y2=y}return x2<0?null:{x:x1,y:y1,w:x2-x1+1,h:y2-y1+1}}
// Flood-fill the plain background in from the image border, feather the edge and un-mix the halo colour.
function knockOut(id){
  var d=id.data,w=id.width,h=id.height,N=w*h,border=[],x,y,i;
  for(x=0;x<w;x++){border.push(x);if(h>1)border.push((h-1)*w+x)}
  for(y=1;y<h-1;y++){border.push(y*w);if(w>1)border.push(y*w+w-1)}
  var transp=0;border.forEach(function(p){if(d[p*4+3]<200)transp++});
  if(transp>border.length*0.25)return false;
  var bins={},bk=null,bc=0;
  function key(p){return (d[p*4]>>4)+'.'+(d[p*4+1]>>4)+'.'+(d[p*4+2]>>4)}
  border.forEach(function(p){var k=key(p);bins[k]=(bins[k]||0)+1;if(bins[k]>bc){bc=bins[k];bk=k}});
  if(bc<border.length*0.45)return false;
  var r=0,g=0,b=0,n=0;border.forEach(function(p){if(key(p)===bk){r+=d[p*4];g+=d[p*4+1];b+=d[p*4+2];n++}});r/=n;g/=n;b/=n;
  var TOL=40,SOFT=96,seen=new Uint8Array(N),q=new Int32Array(N),qh=0,qt=0;
  function dist(p){var dr=d[p*4]-r,dg=d[p*4+1]-g,db=d[p*4+2]-b;return Math.sqrt(dr*dr+dg*dg+db*db)}
  function soften(p,dd){
    var a=(dd-TOL)/(SOFT-TOL);if(a<=0.04){d[p*4+3]=0;return}
    d[p*4]=clamp(Math.round((d[p*4]-r*(1-a))/a),0,255);d[p*4+1]=clamp(Math.round((d[p*4+1]-g*(1-a))/a),0,255);d[p*4+2]=clamp(Math.round((d[p*4+2]-b*(1-a))/a),0,255);
    d[p*4+3]=Math.round(d[p*4+3]*a);
  }
  function visit(p){if(seen[p])return;var dd=dist(p);if(dd<TOL){seen[p]=1;q[qt++]=p}else if(dd<SOFT){seen[p]=2;soften(p,dd)}else seen[p]=3}
  border.forEach(visit);
  while(qh<qt){var p=q[qh++];d[p*4+3]=0;var px=p%w,py=(p-px)/w;if(px>0)visit(p-1);if(px<w-1)visit(p+1);if(py>0)visit(p-w);if(py<h-1)visit(p+w)}
  for(i=0;i<N;i++)if(seen[i]===3)seen[i]=0;
  return qt>0;
}
function rasterIcon(im,removeBg){
  var W=im.naturalWidth,H=im.naturalHeight;if(!W||!H)throw{code:'decode'};
  var sc=Math.min(1,600/Math.max(W,H)),w=Math.max(1,Math.round(W*sc)),h=Math.max(1,Math.round(H*sc));
  var c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d');g.drawImage(im,0,0,w,h);
  var id;try{id=g.getImageData(0,0,w,h)}catch(e){throw{code:'decode'}}
  var removed=removeBg?knockOut(id):false;g.putImageData(id,0,0);
  var bb=alphaBox(id);if(!bb)throw{code:'empty'};
  var pad=Math.round(Math.max(bb.w,bb.h)*0.04),x0=Math.max(0,bb.x-pad),y0=Math.max(0,bb.y-pad),x1=Math.min(w,bb.x+bb.w+pad),y1=Math.min(h,bb.y+bb.h+pad);
  var cw=x1-x0,ch=y1-y0,out=null;
  [256,192,140].some(function(max){
    var s2=Math.min(1,max/Math.max(cw,ch)),ow=Math.max(1,Math.round(cw*s2)),oh=Math.max(1,Math.round(ch*s2));
    var c2=document.createElement('canvas');c2.width=ow;c2.height=oh;var g2=c2.getContext('2d');g2.imageSmoothingQuality='high';g2.drawImage(c,x0,y0,cw,ch,0,0,ow,oh);
    out={data:c2.toDataURL('image/png'),w:ow,h:oh,bg:removed};return out.data.length<180000;
  });
  return out;
}
// Split a sheet (screenshot of many logos with labels) into separate icons: remove the background,
// find connected shapes, drop text labels (short pieces, or pieces sitting right under a logo), keep reading order.
function sheetIcons(im){
  var W=im.naturalWidth,H=im.naturalHeight;if(!W||!H)throw{code:'decode'};
  var sc=Math.min(1,2200/Math.max(W,H)),w=Math.max(1,Math.round(W*sc)),h=Math.max(1,Math.round(H*sc));
  var c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d');g.drawImage(im,0,0,w,h);
  var id;try{id=g.getImageData(0,0,w,h)}catch(e){throw{code:'decode'}}
  if(!knockOut(id))throw{code:'sheet_bg'};g.putImageData(id,0,0);
  var d=id.data,N=w*h,m=new Uint8Array(N),t=new Uint8Array(N),R=3,i,x,y,dx,dy;
  for(i=0;i<N;i++)if(d[i*4+3]>40)m[i]=1;
  for(y=0;y<h;y++)for(x=0;x<w;x++)if(m[y*w+x])for(dy=-R;dy<=R;dy++){var yy=y+dy;if(yy<0||yy>=h)continue;for(dx=-R;dx<=R;dx++){var xx=x+dx;if(xx>=0&&xx<w)t[yy*w+xx]=1}}
  var lab=new Uint8Array(N),q=new Int32Array(N),comps=[];
  for(i=0;i<N;i++){
    if(!t[i]||lab[i])continue;var qh=0,qt=0,x1=w,y1=h,x2=0,y2=0,ink=0;q[qt++]=i;lab[i]=1;
    while(qh<qt){var p=q[qh++],px=p%w,py=(p-px)/w;if(px<x1)x1=px;if(px>x2)x2=px;if(py<y1)y1=py;if(py>y2)y2=py;if(m[p])ink++;
      if(px>0&&t[p-1]&&!lab[p-1]){lab[p-1]=1;q[qt++]=p-1}if(px<w-1&&t[p+1]&&!lab[p+1]){lab[p+1]=1;q[qt++]=p+1}
      if(py>0&&t[p-w]&&!lab[p-w]){lab[p-w]=1;q[qt++]=p-w}if(py<h-1&&t[p+w]&&!lab[p+w]){lab[p+w]=1;q[qt++]=p+w}}
    var cw=Math.max(1,x2-x1+1-2*R),ch=Math.max(1,y2-y1+1-2*R);
    if(ink>=30&&cw*ch>=64)comps.push({x:x1+R,y:y1+R,w:cw,h:ch});
  }
  if(!comps.length)throw{code:'empty'};
  var maxH=Math.max.apply(null,comps.map(function(o){return o.h}));
  var cand=comps.filter(function(o){return o.h>=maxH*0.3&&o.w/o.h<=2.8}).sort(function(a,b){return a.y-b.y}),kept=[];
  cand.forEach(function(a){
    var under=kept.some(function(b){var gap=a.y-(b.y+b.h),dcx=Math.abs((a.x+a.w/2)-(b.x+b.w/2));return gap>=0&&gap<maxH*0.7&&dcx<Math.max(a.w,b.w)*0.6});
    if(!under)kept.push(a);
  });
  kept.sort(function(a,b){return (a.y+a.h/2)-(b.y+b.h/2)});
  var rows=[];kept.forEach(function(o){var cy=o.y+o.h/2,r=rows[rows.length-1];if(!r||cy-r.cy>maxH*0.9)rows.push(r={cy:cy,items:[]});r.items.push(o)});
  var out=[];
  rows.forEach(function(r){r.items.sort(function(a,b){return a.x-b.x}).forEach(function(o){
    var pad=Math.round(Math.max(o.w,o.h)*0.06),x0=Math.max(0,o.x-pad),y0=Math.max(0,o.y-pad),x3=Math.min(w,o.x+o.w+pad),y3=Math.min(h,o.y+o.h+pad),ww=x3-x0,hh=y3-y0;
    var s2=Math.min(1,256/Math.max(ww,hh)),ow=Math.max(1,Math.round(ww*s2)),oh=Math.max(1,Math.round(hh*s2));
    var c2=document.createElement('canvas');c2.width=ow;c2.height=oh;var g2=c2.getContext('2d');g2.imageSmoothingQuality='high';g2.drawImage(c,x0,y0,ww,hh,0,0,ow,oh);
    out.push({data:c2.toDataURL('image/png'),w:ow,h:oh});
  })});
  return out.slice(0,80);
}
function processSheet(file){
  if(file.size>8*1024*1024)return Promise.reject({code:'too_big'});
  if(/svg/i.test(file.type)||/\.svg$/i.test(file.name||''))return processIcon(file,true).then(function(r){return[r]});
  return readAs(file,'url').then(loadImg).then(sheetIcons);
}
function processIcon(file,removeBg){
  if(file.size>4*1024*1024)return Promise.reject({code:'too_big'});
  var isSvg=/svg/i.test(file.type)||/\.svg$/i.test(file.name||'');
  if(isSvg)return readAs(file,'text').then(function(txt){
    txt=cleanSvg(txt);if(!/<svg[\s>]/i.test(txt))throw{code:'not_svg'};if(txt.length>200000)throw{code:'too_big'};
    var uri=svgUri(txt);return loadImg(uri).then(function(im){return{data:uri,w:im.naturalWidth||128,h:im.naturalHeight||128}});
  });
  return readAs(file,'url').then(loadImg).then(function(im){return rasterIcon(im,removeBg)});
}
function iconErr(e){var c=e&&e.code;return c==='sheet_bg'?'could not find a plain background to split on':c==='too_big'?'too large (max 4 MB, or 200 KB for SVG)':c==='empty'?'nothing left after removing the background':c==='not_svg'?'not a valid SVG':'could not read this image'}
function placeIcon(id,x,y){
  var icn=ICONLIB[id];if(!icn)return null;var tk='c-'+techKey(icn.name),useTech=T[tk]&&T[tk].tech&&techIconId(T[tk].n)===id;
  return addNode(useTech?tk:'c-logo',x,y,useTech?null:{img:id,label:icn.name});
}
function uploadIcons(files,at){
  var list=[].slice.call(files||[]).filter(isImageFile).slice(0,80);
  if(!list.length){toast('Choose PNG, JPG, WebP or SVG images');return Promise.resolve([])}
  var rm=$('iconBg')?$('iconBg').checked:true,split=!at&&$('iconSplit')&&$('iconSplit').checked,done=[],prog=$('iconProg');
  var names=split?String($('iconNames').value||'').split(/[,\n]+/).map(function(x){return x.trim().slice(0,40)}).filter(Boolean):[],ni=0;
  return list.reduce(function(p,f,i){return p.then(function(){
    if(prog)prog.textContent=(split?'Splitting ':'Processing ')+(i+1)+' of '+list.length+'…';
    return (split?processSheet(f):processIcon(f,rm).then(function(r){return[r]})).then(function(rs){
      var saves=[];
      rs.forEach(function(r,j){
        var id='i'+newId().slice(1)+j,nm=split?(names[ni]||('Icon '+(ni+1))):(cleanIconName(f.name)||'Icon');ni++;
        ICONLIB[id]={name:nm,data:r.data,w:r.w,h:r.h,createdAt:Date.now()+i*1000+j};done.push(id);
        saves.push(iconSave(id).catch(function(){toast('Kept for this session only: browser storage is full')}));
      });
      if(split&&names.length&&names.length!==rs.length)toast('Found '+rs.length+' logos but '+names.length+' names. Check the names below.',4200);
      return Promise.all(saves);
    },function(e){toast((f.name||'Image')+': '+iconErr(e))});
  })},Promise.resolve()).then(function(){
    iconsChanged();
    if(prog)prog.textContent=done.length?done.length+' icon'+(done.length>1?'s':'')+' added':'';
    if(at&&done.length){pushUndo();var made=[];done.forEach(function(id,i){var n=placeIcon(id,at.x+i*200,at.y);if(n)made.push(n.id)});selN=made;selE=null;renderAll()}
    else if(done.length&&$('mIcons').hidden)toast(done.length+' icon'+(done.length>1?'s':'')+' added to My icons');
    return done;
  });
}
function renderIcons(){
  var ids=Object.keys(ICONLIB).sort(function(a,b){return (ICONLIB[b].createdAt||0)-(ICONLIB[a].createdAt||0)});
  $('iconWhere').textContent=(iconCloud?'Saved privately to your Claude account':'Saved in this browser')+' · '+ids.length+' icon'+(ids.length===1?'':'s')+'. Diagram files (.json) carry the icons they use.';
  $('iconList').innerHTML=ids.length?ids.map(function(id){
    var icn=ICONLIB[id],tk=TECH.filter(function(x){return techIconId(x[1])===id}).map(function(x){return x[1]});
    return '<div class="icon-card"><div class="th"><img src="'+icn.data+'" alt=""></div><input type="text" list="techNames" data-iname="'+id+'" value="'+esc(icn.name)+'" aria-label="Icon name" spellcheck="false">'+
      '<div class="ir"><span class="bind'+(tk.length?' on':'')+'">'+(tk.length?ic('link-2')+'<span>'+esc(tk.join(', '))+'</span>':'<span>Not linked to a tech item</span>')+'</span>'+
      (iconConfirm===id?'<button type="button" class="sbtn del" data-idok="'+id+'">Delete</button>':'<button type="button" class="ibtn" data-idel="'+id+'" aria-label="Delete '+esc(icn.name)+'">'+ic('trash-2')+'</button>')+'</div></div>';
  }).join(''):'<p class="where">No icons yet. Logos you add appear in the left panel under My icons.</p>';
}

// ================= outline editor (trees) =================
var olKind='org';
function treeKindForDoc(){var D=DT[dtOf()];if(D.tree)return D.tree;var t=S.nodes.filter(function(n){return TREEF[fam(n)]})[0];return t?fam(t):'org'}
function serializeTrees(kind){
  computeTree();
  var roots=S.nodes.filter(function(n){return fam(n)===kind&&!TREEP[n.id]}).sort(function(a,b){return a.x-b.x}),lines=[];
  roots.forEach(function(r){(function walk(n,dep,seen){if(seen[n.id]||dep>40)return;seen[n.id]=1;
    lines.push(new Array(dep+1).join('  ')+String(n.label||'').replace(/\s*\n\s*/g,' ')+(n.sub?' | '+String(n.sub).replace(/\s*\n\s*/g,' '):'')+(n.hl?' *':''));
    treeChildren(n).sort(function(a,b){return kind==='mind'?a.y-b.y:a.x-b.x}).forEach(function(c){walk(c,dep+1,seen)});
  })(r,0,{})});
  return lines.join('\n');
}
function prepOutline(){
  olKind=treeKindForDoc();
  $('olText').value=serializeTrees(olKind)||TREE_SEED[olKind];
  $('mOutlineT').textContent='Edit '+({org:'org chart',mind:'mind map',page:'sitemap'}[olKind])+' as outline';
  $('olProg').textContent='';
}
function applyOutline(replace){
  var text=$('olText').value;if(!parseOutline(text).length){$('olProg').textContent='Write at least one line.';return}
  pushUndo();var k=olKind,at=null;
  if(replace){
    var old=S.nodes.filter(function(n){return fam(n)===k}),b=bounds(old,[]),ids={};at=b?{x:snap(b.x),y:snap(b.y)}:null;
    old.forEach(function(n){ids[n.id]=1});S.nodes=S.nodes.filter(function(n){return !ids[n.id]});S.edges=S.edges.filter(function(e){return !ids[e.from]&&!ids[e.to]});
  }
  if(!at){var b2=bounds(S.nodes,[]);at=b2?{x:snap(b2.x+b2.w+160),y:snap(b2.y)}:{x:0,y:0}}
  var made=buildTree(text.split('\n').slice(0,120).join('\n'),k,at.x,at.y);
  selN=[];selE=null;closeModal();renderAll();var bb=bounds(made,[]);if(bb)fitTo(bb,1);
  toast((replace?'Rebuilt ':'Added ')+made.length+' boxes from the outline. Ctrl+Z undoes it.');
}

// ================= type-specific checks =================
function typeChecks(out,nm){
  computeTree();
  var N=S.nodes,E=S.edges,dt=dtOf();
  function ins(n,t){return E.filter(function(e){return e.to===n.id&&(!t||t.indexOf(e.type)>=0)})}
  function outs(n,t){return E.filter(function(e){return e.from===n.id&&(!t||t.indexOf(e.type)>=0)})}
  function deg(n){return E.filter(function(e){return e.from===n.id||e.to===n.id}).length}
  function k(n){return (T[n.t]||{}).k}
  function names(list){return list.slice(0,3).map(nm).join(', ')+(list.length>3?' and '+(list.length-3)+' more':'')}
  // frameworks
  var cells=N.filter(function(n){return fam(n)==='cell'&&!n.deco&&!n.nobody});
  if(cells.length){
    var empty=cells.filter(function(c){return !String(c.body||'').trim()});
    if(empty.length)out.push(['warn',empty.length+' of '+cells.length+' framework blocks are still empty: '+names(empty.map(function(c){return {label:c.qf||c.label,t:c.t}}))+'.',{n:empty.map(function(c){return c.id})}]);
    var thin=cells.filter(function(c){var l=String(c.body||'').split('\n').filter(function(x){return x.trim()});return l.length===1&&l[0].length<18});
    if(thin.length>=2)out.push(['info',thin.length+' blocks hold a single short point. Add the evidence or the reason behind each one.',{n:thin.map(function(c){return c.id})}]);
    var lv=cells.filter(function(c){return c.badge!=null&&!c.badge});
    if(lv.length)out.push(['warn','Set the force level (Tinggi, Sedang or Rendah) for '+names(lv)+'.',{n:lv.map(function(c){return c.id})}]);
    var quads=N.filter(function(n){return fam(n)==='cell'&&GEN_Q.indexOf(n.label)>=0});
    if(quads.length===4&&!quads.some(function(q){return q.hl}))out.push(['warn','No generic strategy is highlighted. Pick the one the organization follows.',{n:quads.map(function(q){return q.id})}]);
  }
  // UML use case
  var ucs=N.filter(function(n){return n.t==='u-usecase'}),actors=N.filter(function(n){return n.t==='u-actor'});
  ucs.forEach(function(u){if(!deg(u))out.push(['warn','Use case '+nm(u)+' is not connected to any actor or use case.',{n:[u.id]}])});
  var bnd=N.filter(function(n){return n.t==='b-boundary'});
  actors.forEach(function(a){if(bnd.some(function(b){return inside(a,b)}))out.push(['err','Actor '+nm(a)+' sits inside the system boundary. Actors are outside the system.',{n:[a.id]}])});
  E.forEach(function(e){var a=byId(e.from),b=byId(e.to);if(!a||!b)return;if((e.type==='uinc'||e.type==='uext')&&(a.t==='u-actor'||b.t==='u-actor'))out.push(['err','«include» and «extend» connect two use cases, never an actor.',{e:e.id}])});
  if(ucs.length&&!bnd.length)out.push(['info','Draw a system boundary around the use cases.',{n:ucs.map(function(u){return u.id})}]);
  // UML activity
  var acts=N.filter(function(n){return fam(n)==='uml'&&/^act-/.test(k(n))});
  if(acts.length&&dt==='activity'){
    if(!acts.some(function(n){return k(n)==='act-initial'}))out.push(['err','The activity has no initial node.',null]);
    if(!acts.some(function(n){return k(n)==='act-final'||k(n)==='act-flowfinal'}))out.push(['warn','The activity has no final node.',null]);
  }
  N.filter(function(n){return k(n)==='act-decision'||k(n)==='choice'}).forEach(function(d){var o=outs(d);if(o.length>=2&&o.some(function(e){return !String(e.label||'').trim()}))out.push(['warn','Label every branch out of decision '+nm(d)+' with a guard, such as [ya] / [tidak].',{n:[d.id]}]);if(o.length===1&&ins(d).length===1)out.push(['info','Decision '+nm(d)+' has one way in and one way out, so it decides nothing.',{n:[d.id]}])});
  N.filter(function(n){return k(n)==='act-action'}).forEach(function(a){if(!ins(a).length||!outs(a).length)out.push(['warn','Action '+nm(a)+' has no '+(!ins(a).length?'incoming':'outgoing')+' flow.',{n:[a.id]}])});
  // UML sequence
  N.filter(isLife).forEach(function(l){if(!deg(l))out.push(['info','Lifeline '+nm(l)+' sends and receives no messages.',{n:[l.id]}])});
  // UML class
  N.filter(function(n){return n.t==='u-class'}).forEach(function(c){if(!String(c.attrs||'').trim()&&!String(c.ops||'').trim())out.push(['info','Class '+nm(c)+' has no attributes or operations.',{n:[c.id]}])});
  // UML state
  var states=N.filter(function(n){return n.t==='u-state'});
  if(states.length&&!N.some(function(n){return n.t==='u-act-initial'}))out.push(['warn','The state machine has no initial state.',{n:[states[0].id]}]);
  var unT=E.filter(function(e){var a=byId(e.from),b=byId(e.to);return a&&b&&a.t==='u-state'&&b.t==='u-state'&&!String(e.label||'').trim()});
  if(unT.length)out.push(['warn',unT.length+' transition'+(unT.length>1?'s have':' has')+' no event label.',{e:unT[0].id}]);
  // DFD
  var dfd=N.filter(function(n){return fam(n)==='dfd'});
  if(dfd.length){
    dfd.filter(function(n){return k(n)==='proc'||k(n)==='procgs'}).forEach(function(p){var i=ins(p).length,o=outs(p).length;if(!i&&!o)out.push(['err','Process '+nm(p)+' has no data flows.',{n:[p.id]}]);else if(!i)out.push(['err','Process '+nm(p)+' has outputs but no input (a “miracle”).',{n:[p.id]}]);else if(!o)out.push(['err','Process '+nm(p)+' has inputs but no output (a “black hole”).',{n:[p.id]}])});
    E.forEach(function(e){
      var a=byId(e.from),b=byId(e.to);if(!a||!b||fam(a)!=='dfd'||fam(b)!=='dfd')return;var ka=k(a),kb=k(b),proc=function(x){return x==='proc'||x==='procgs'};
      if(!proc(ka)&&!proc(kb))out.push(['err','Data must pass through a process: '+nm(a)+' → '+nm(b)+' connects two '+(ka===kb?(ka==='store'?'stores':'external entities'):'non-processes')+'.',{e:e.id}]);
      else if(!String(e.label||'').trim())out.push(['warn','Data flow '+nm(a)+' → '+nm(b)+' has no name. Name the data it carries.',{e:e.id}]);
    });
    dfd.filter(function(n){return k(n)==='store'}).forEach(function(s){var i=ins(s).length,o=outs(s).length;if(!i&&!o)out.push(['warn','Data store '+nm(s)+' is not used.',{n:[s.id]}]);else if(!i)out.push(['info','Data store '+nm(s)+' is only read, never written.',{n:[s.id]}]);else if(!o)out.push(['info','Data store '+nm(s)+' is written but never read.',{n:[s.id]}])});
  }
  // ERD
  N.filter(function(n){return n.t==='er-table'}).forEach(function(t){var cols=parseCols(t.body);if(!cols.some(function(c){return c.key.indexOf('PK')>=0}))out.push(['warn','Table '+nm(t)+' has no primary key (PK).',{n:[t.id]}]);if(!deg(t)&&N.filter(function(n){return n.t==='er-table'}).length>1)out.push(['info','Table '+nm(t)+' is not related to any other table.',{n:[t.id]}])});
  E.forEach(function(e){if(e.type!=='cf')return;var a=byId(e.from),b=byId(e.to);if(!a||!b||a.t!=='er-table'||b.t!=='er-table')return;var many=/many/.test(e.c2||'zmany'),bc=parseCols(b.body);if(many&&!bc.some(function(c){return c.key.indexOf('FK')>=0}))out.push(['info','Table '+nm(b)+' is on the many side of '+nm(a)+' but has no FK column.',{e:e.id}])});
  N.filter(function(n){return n.t==='er-entity'||n.t==='er-weak'}).forEach(function(en){var nb=E.filter(function(e){return e.from===en.id||e.to===en.id}).map(function(e){return byId(e.from===en.id?e.to:e.from)}).filter(Boolean);if(en.t==='er-entity'&&!nb.some(function(o){return o.t==='er-key'}))out.push(['warn','Entity '+nm(en)+' has no key attribute.',{n:[en.id]}])});
  N.filter(function(n){return n.t==='er-attr'||n.t==='er-key'||n.t==='er-multi'||n.t==='er-derived'}).forEach(function(a){if(!deg(a))out.push(['warn','Attribute '+nm(a)+' is not attached to an entity.',{n:[a.id]}])});
  N.filter(function(n){return n.t==='er-rel'||n.t==='er-idrel'}).forEach(function(r){if(deg(r)<2)out.push(['warn','Relationship '+nm(r)+' needs at least two entities.',{n:[r.id]}])});
  // C4
  var c4e=E.filter(function(e){var a=byId(e.from),b=byId(e.to);return a&&b&&(fam(a)==='c4'||fam(b)==='c4')&&!String(e.label||'').trim()});
  if(c4e.length)out.push(['warn',c4e.length+' C4 relationship'+(c4e.length>1?'s have':' has')+' no description. Say what it does and how, e.g. “Reads orders [SQL]”.',{e:c4e[0].id}]);
  var nodesc=N.filter(function(n){return fam(n)==='c4'&&!String(n.body||'').trim()});
  if(nodesc.length)out.push(['info',nodesc.length+' C4 element'+(nodesc.length>1?'s have':' has')+' no description.',{n:nodesc.map(function(n){return n.id})}]);
  // trees
  ['org','mind','page'].forEach(function(f){
    var ns=N.filter(function(n){return fam(n)===f});if(ns.length<2)return;
    var lone=ns.filter(function(n){return !TREEP[n.id]&&!E.some(function(e){return e.from===n.id})});
    if(lone.length)out.push(['warn',lone.length+' box'+(lone.length>1?'es are':' is')+' not connected to the tree: '+names(lone)+'.',{n:lone.map(function(n){return n.id})}]);
    var roots=ns.filter(function(n){return !TREEP[n.id]&&E.some(function(e){return e.from===n.id})});
    if(roots.length>1)out.push(['info','There are '+roots.length+' separate trees. Usually a chart has one root.',{n:roots.map(function(n){return n.id})}]);
    if(f==='org'){var wide=ns.filter(function(n){return treeChildren(n).length>8});if(wide.length)out.push(['info',nm(wide[0])+' has more than 8 direct reports. Consider grouping them.',{n:[wide[0].id]}])}
  });
}

// ================= wiring =================
function bindDomain(){
  $('wsTabs').addEventListener('click',function(ev){var b=ev.target.closest('[data-ws]');if(!b)return;uiWs=b.getAttribute('data-ws');closeDtPop();renderWsTabs();renderChips();buildPalette();buildExamples()});
  $('dtChips').addEventListener('click',function(ev){var b=ev.target.closest('[data-dt]');if(b)chooseType(b.getAttribute('data-dt'),b)});
  $('dtPop').addEventListener('click',function(ev){
    var g=ev.target.closest('[data-dtgo]');
    if(g){var dt=g.getAttribute('data-dt');closeDtPop();if(g.getAttribute('data-dtgo')==='new'){startNew(dt);toast('New '+DT[dt].n+'. Your previous diagram is in Diagrams.')}else startHere(dt);return}
    var x=ev.target.closest('[data-ex]');if(x)openExample(x.getAttribute('data-ex'));
  });
  document.addEventListener('pointerdown',function(ev){if(!$('dtPop').hidden&&!ev.target.closest('#dtPop')&&!ev.target.closest('#dtChips'))closeDtPop()},true);
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closeDtPop()});
  $('palType').addEventListener('click',function(ev){var x=ev.target.closest('[data-ex]');if(x)openExample(x.getAttribute('data-ex'))});
  palBody.addEventListener('click',function(ev){var sm=ev.target.closest('summary');if(!sm)return;var d=sm.parentNode;setTimeout(function(){if(d.hasAttribute('data-sec'))secOpen[d.getAttribute('data-sec')]=d.open},0)});
  var pal=$('pal');
  pal.addEventListener('dragover',function(ev){if([].slice.call(ev.dataTransfer.types||[]).indexOf('Files')>=0){ev.preventDefault();ev.dataTransfer.dropEffect='copy';pal.classList.add('drop-over')}});
  pal.addEventListener('dragleave',function(ev){if(!pal.contains(ev.relatedTarget))pal.classList.remove('drop-over')});
  pal.addEventListener('drop',function(ev){pal.classList.remove('drop-over');var fl=ev.dataTransfer.files;if(fl&&fl.length){ev.preventDefault();uploadIcons(fl,null)}});
  // My icons modal
  $('iconFile').addEventListener('change',function(){var fl=this.files;uploadIcons(fl,null);this.value=''});
  var drop=$('iconDrop');
  drop.addEventListener('dragover',function(ev){ev.preventDefault();drop.classList.add('over')});
  drop.addEventListener('dragleave',function(){drop.classList.remove('over')});
  drop.addEventListener('drop',function(ev){ev.preventDefault();ev.stopPropagation();drop.classList.remove('over');uploadIcons(ev.dataTransfer.files,null)});
  drop.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();$('iconFile').click()}});
  $('iconList').addEventListener('change',function(ev){var inp=ev.target.closest('[data-iname]');if(!inp)return;var id=inp.getAttribute('data-iname'),v=inp.value.trim().slice(0,40);if(!ICONLIB[id]||!v){renderIcons();return}ICONLIB[id].name=v;iconSave(id).catch(function(){});iconsChanged()});
  $('iconList').addEventListener('keydown',function(ev){if(ev.key==='Enter'&&ev.target.matches('[data-iname]'))ev.target.blur()});
  $('iconList').addEventListener('click',function(ev){
    var d=ev.target.closest('[data-idel]');if(d){iconConfirm=d.getAttribute('data-idel');renderIcons();return}
    var ok=ev.target.closest('[data-idok]');if(ok){var id=ok.getAttribute('data-idok');iconConfirm=null;iconRemove(id).then(iconsChanged)}
  });
  $('iconSplit').addEventListener('change',function(){$('iconNamesWrap').hidden=!this.checked});
  $('techNames').innerHTML=TECH.map(function(x){return '<option value="'+esc(x[1])+'">'}).join('');
  // outline modal
  $('olReplace').onclick=function(){applyOutline(true)};$('olAdd').onclick=function(){applyOutline(false)};
  $('olText').addEventListener('keydown',function(ev){
    if(ev.key==='Tab'){ev.preventDefault();var ta=this,s=ta.selectionStart,e=ta.selectionEnd,v=ta.value,ls=v.lastIndexOf('\n',s-1)+1;
      if(ev.shiftKey){if(v.substr(ls,2)==='  '){ta.value=v.slice(0,ls)+v.slice(ls+2);ta.selectionStart=ta.selectionEnd=Math.max(ls,s-2)}}
      else{ta.value=v.slice(0,ls)+'  '+v.slice(ls);ta.selectionStart=s+2;ta.selectionEnd=e+2}}
    else if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();applyOutline(true)}
  });
}
