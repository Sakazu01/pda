// floating line toolbar: route, flip, straighten, label, delete
var EBAR=null;
function ebarBuild(){
  if(EBAR)return EBAR;EBAR=document.createElement('div');EBAR.className='ebar';EBAR.id='eBar';EBAR.hidden=true;EBAR.setAttribute('role','toolbar');EBAR.setAttribute('aria-label','Atur garis (Alt+L untuk fokus, panah kiri/kanan untuk berpindah)');
  EBAR.innerHTML=
    '<button type="button" data-eb="route" data-v="" title="Siku (elbow)" aria-label="Garis siku">'+ic('waypoints')+'</button>'+
    '<button type="button" data-eb="route" data-v="straight" title="Lurus" aria-label="Garis lurus">'+ic('slash')+'</button>'+
    '<button type="button" data-eb="route" data-v="curve" title="Lengkung" aria-label="Garis lengkung">'+ic('spline')+'</button>'+
    '<span class="sep" aria-hidden="true"></span>'+
    '<button type="button" data-eb="label" title="Tulis / ubah label (atau klik dua kali garis)" aria-label="Ubah label">'+ic('type')+'</button>'+
    '<button type="button" data-eb="center" title="Label ke tengah garis" aria-label="Label ke tengah">'+ic('crosshair')+'</button>'+
    '<button type="button" data-eb="flip" title="Balik arah panah" aria-label="Balik arah">'+ic('arrow-left-right')+'</button>'+
    '<button type="button" data-eb="tidy" title="Rapikan: hapus tekukan manual" aria-label="Rapikan garis">'+ic('wand-sparkles')+'</button>'+
    '<span class="sep" aria-hidden="true"></span>'+
    '<button type="button" data-eb="del" class="danger" title="Hapus garis (Delete)" aria-label="Hapus garis">'+ic('trash-2')+'</button>';
  stage.appendChild(EBAR);
  EBAR.addEventListener('pointerdown',function(ev){ev.stopPropagation()});
  EBAR.addEventListener('keydown',function(ev){var bs=[].slice.call(EBAR.querySelectorAll('button:not([hidden])')),i=bs.indexOf(document.activeElement);
    if(ev.key==='Enter'||ev.key===' '){if(i>=0){ev.preventDefault();ev.stopPropagation();bs[i].click();setTimeout(function(){var nb=EBAR.querySelector('[data-eb="'+bs[i].getAttribute('data-eb')+'"]'+(bs[i].getAttribute('data-v')!=null?'[data-v="'+bs[i].getAttribute('data-v')+'"]':''));if(nb&&!EBAR.hidden)nb.focus()},0)}}
    else if(ev.key==='Escape'){ev.stopPropagation();svg.focus&&svg.focus();document.activeElement.blur()}
    else if(ev.key==='ArrowRight'||ev.key==='ArrowLeft'){ev.preventDefault();ev.stopPropagation();var n=bs[(i+(ev.key==='ArrowRight'?1:-1)+bs.length)%bs.length];if(n)n.focus()}});
  EBAR.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-eb]');if(!b)return;var e=eById(selE);if(!e)return;var a=b.getAttribute('data-eb');
    if(a==='label'){startEdit({k:'e',id:e.id});return}
    if(a==='del'){pushUndo();S.edges=S.edges.filter(function(x){return x.id!==e.id});setSel([],null);renderAll();scheduleSave();toast('Garis dihapus. Ctrl+Z membatalkan.');return}
    pushUndo();
    if(a==='route'){var v=b.getAttribute('data-v');if(v)e.route=v;else delete e.route;e.mx=e.my=null}
    else if(a==='center'){delete e.lt;delete LBLT[e.id]}
    else if(a==='flip'){var f=e.from;e.from=e.to;e.to=f;var s0=e.start;e.start=e.end;e.end=s0;var a0=e.fromAnchor;e.fromAnchor=e.toAnchor;e.toAnchor=a0;['start','end','fromAnchor','toAnchor'].forEach(function(k){if(e[k]==null)delete e[k]});if(e.lt!=null)e.lt=Math.round((1-e.lt)*1000)/1000}
    else if(a==='tidy'){tidyEdge(e)}
    renderAll();scheduleSave();
  });
  return EBAR;
}
function tidyEdge(e){e.mx=e.my=null;delete e.lt;delete LBLT[e.id];var a=byId(e.from),b=byId(e.to);if(a&&b&&!isLife(a)&&!isLife(b)){delete e.fromAnchor;delete e.toAnchor}}
function tidyAllEdges(){var n=0;pushUndo();S.edges.forEach(function(e){if(e.mx!=null||e.my!=null||e.lt!=null||e.fromAnchor||e.toAnchor){var a=byId(e.from),b=byId(e.to);if(a&&b&&(isLife(a)||isLife(b)))return;tidyEdge(e);n++}});renderAll();scheduleSave();toast(n?n+' garis dirapikan. Ctrl+Z membatalkan.':'Semua garis sudah rapi.')}
function ebarSync(){
  var el=ebarBuild(),e=selE&&eById(selE),busy=(drag&&drag.moved)||LDRAG&&LDRAG.moved||PJ_VIEW!=='canvas';
  var pts=e&&!busy&&route(e);if(!pts||selN.length){el.hidden=true;return}
  // sit outside the line's bounding box so it never hides the line or its handles
  var r=stage.getBoundingClientRect(),minx=1e9,miny=1e9,maxx=-1e9,maxy=-1e9;edgePoly(e,pts).concat(e.wp||[]).forEach(function(q){minx=Math.min(minx,q.x);miny=Math.min(miny,q.y);maxx=Math.max(maxx,q.x);maxy=Math.max(maxy,q.y)});
  var x=((minx+maxx)/2-cam.x)*cam.z,y0=(miny-cam.y)*cam.z,y1=(maxy-cam.y)*cam.z;
  el.hidden=false;var w=el.offsetWidth||300,h=el.offsetHeight||40,top=y0-h-26;if(top<8)top=y1+26;if(top+h>r.height-8)top=Math.max(8,y0-h-26);
  el.style.left=Math.round(clamp(x-w/2,8,Math.max(8,r.width-w-8)))+'px';el.style.top=Math.round(clamp(top,8,Math.max(8,r.height-h-8)))+'px';
  var cur=e.route||'';[].forEach.call(el.querySelectorAll('[data-eb=route]'),function(b){var on=b.getAttribute('data-v')===cur;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false')});
  el.querySelector('[data-eb=center]').hidden=!(e.label&&e.lt!=null);
}
var ux2RenderOver0=renderOver;renderOver=function(){ux2RenderOver0.apply(this,arguments);try{ebarSync()}catch(err){}};
