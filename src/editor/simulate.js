// ================= simulation: step-through, token flow, presentation =================
// One timeline: step s lights every node at depth s, dims deeper ones, and sends a token down each edge that arrives there.
var SIM={on:false,step:0,g:null,play:false,tm:0,raf:0,pres:false};
var NS='http://www.w3.org/2000/svg';
function simBuild(){
  var out={},inn={},ids={};
  S.edges.forEach(function(e){if(!byId(e.from)||!byId(e.to))return;ids[e.from]=1;ids[e.to]=1;(out[e.from]=out[e.from]||[]).push(e);inn[e.to]=(inn[e.to]||0)+1});
  var all=Object.keys(ids);if(!all.length)return null;
  var starts=all.filter(function(i){return !inn[i]});
  function pos(a,b){a=byId(a);b=byId(b);return a.x-b.x||a.y-b.y}
  if(!starts.length)starts=[all.slice().sort(pos)[0]];
  starts.sort(pos);
  var depth={},q=starts.slice(),max=0;starts.forEach(function(s){depth[s]=0});
  while(q.length){var u=q.shift();(out[u]||[]).forEach(function(e){if(depth[e.to]==null){depth[e.to]=depth[u]+1;max=Math.max(max,depth[e.to]);q.push(e.to)}})}
  all.forEach(function(i){if(depth[i]==null)depth[i]=0});
  return {depth:depth,max:max,ids:ids};
}
function simLabel(){
  if(!SIM.g)return '';
  var names=[];Object.keys(SIM.g.depth).forEach(function(id){if(SIM.g.depth[id]===SIM.step){var n=byId(id);var l=n&&String(n.label||'').split('\n')[0].trim();if(l)names.push(l)}});
  var tail=names.length?': '+names.slice(0,3).join(', ')+(names.length>3?' +'+(names.length-3):''):'';
  return 'Langkah '+(SIM.step+1)+'/'+(SIM.g.max+1)+tail;
}
function simApply(animateTokens){
  var L=$('simLayer');if(L){cancelAnimationFrame(SIM.raf);L.innerHTML=''}
  content.querySelectorAll('.sim-dim,.sim-cur').forEach(function(el){el.classList.remove('sim-dim');el.classList.remove('sim-cur')});
  if(!SIM.on||!SIM.g)return;
  var g=SIM.g,s=SIM.step,cur=[];
  content.querySelectorAll('g[data-id]').forEach(function(el){var d=g.depth[el.getAttribute('data-id')];if(d==null)return;if(d>s)el.classList.add('sim-dim');else if(d===s)el.classList.add('sim-cur')});
  content.querySelectorAll('g[data-eid]').forEach(function(el){
    var e=null,id=el.getAttribute('data-eid');for(var i=0;i<S.edges.length;i++)if(S.edges[i].id===id){e=S.edges[i];break}
    if(!e)return;var a=g.depth[e.from],b=g.depth[e.to];if(a==null||b==null)return;
    if(b>s||a>s)el.classList.add('sim-dim');else if(b===s&&a<s){el.classList.add('sim-cur');cur.push(e)}
  });
  $('simLbl').textContent=simLabel();
  $('simPrev').disabled=s<=0;$('simNext').disabled=s>=g.max;
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!animateTokens||rm||!L||!cur.length)return;
  var toks=[];
  cur.forEach(function(e){var pts=route(e);if(!pts)return;var p=document.createElementNS(NS,'path');p.setAttribute('d',edgeD(e,pts));L.appendChild(p);p.style.display='none';
    var c=document.createElementNS(NS,'circle');c.setAttribute('r','6');c.setAttribute('fill',TH.sel);c.setAttribute('stroke',TH.paper);c.setAttribute('stroke-width','2');L.appendChild(c);toks.push({p:p,c:c,len:p.getTotalLength()})});
  var t0=performance.now(),D=700;
  (function tick(now){var t=Math.min(1,(now-t0)/D),k=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    toks.forEach(function(o){var pt=o.p.getPointAtLength(o.len*k);o.c.setAttribute('cx',pt.x);o.c.setAttribute('cy',pt.y)});
    if(t<1)SIM.raf=requestAnimationFrame(tick);else toks.forEach(function(o){o.c.remove()})})(t0);
}
function simGo(n,animate){if(!SIM.g)return;SIM.step=Math.max(0,Math.min(SIM.g.max,n));simApply(animate!==false);simPan()}
function simPan(){/* keep the active step on screen: only pan when a current node is outside the view */
  var cn=content.querySelector('g.sim-cur[data-id]');if(!cn)return;var r=cn.getBoundingClientRect(),st=stage.getBoundingClientRect();
  if(r.left<st.left+20||r.right>st.right-20||r.top<st.top+60||r.bottom>st.bottom-80){fitView()}
}
function simStop(){SIM.play=false;clearInterval(SIM.tm);$('simPlay').innerHTML=ic('play');$('simPlay').setAttribute('aria-label','Putar')}
function simTogglePlay(){
  if(SIM.play){simStop();return}
  if(SIM.step>=SIM.g.max)simGo(0,false);
  SIM.play=true;$('simPlay').innerHTML=ic('pause');$('simPlay').setAttribute('aria-label','Jeda');
  SIM.tm=setInterval(function(){if(SIM.step>=SIM.g.max){simStop();return}simGo(SIM.step+1)},1250);
}
function simOpen(){
  var g=simBuild();if(!g){toast('Tambahkan minimal dua simpul yang terhubung untuk menjalankan simulasi');return}
  SIM.on=true;SIM.g=g;SIM.step=0;$('simBar').hidden=false;$('btnSim').classList.add('on');$('btnSim').setAttribute('aria-pressed','true');
  simApply(true);
}
function simClose(){
  simStop();SIM.on=false;SIM.g=null;if(SIM.pres)simPresent(false);
  $('simBar').hidden=true;$('btnSim').classList.remove('on');$('btnSim').setAttribute('aria-pressed','false');simApply(false);
}
function simPresent(on){
  SIM.pres=on===undefined?!SIM.pres:on;document.querySelector('.app').classList.toggle('present',SIM.pres);
  $('simPres').setAttribute('aria-pressed',SIM.pres?'true':'false');
  setTimeout(function(){fitView()},60);
}
(function simInit(){
  $('btnSim').onclick=function(){SIM.on?simClose():simOpen()};
  $('simPrev').onclick=function(){simStop();simGo(SIM.step-1)};
  $('simNext').onclick=function(){simStop();simGo(SIM.step+1)};
  $('simPlay').onclick=simTogglePlay;$('simPres').onclick=function(){simPresent()};$('simClose').onclick=simClose;
  document.addEventListener('keydown',function(ev){
    if(!SIM.on)return;var t=ev.target,tag=t&&t.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable))return;
    if(ev.key==='ArrowRight'){ev.preventDefault();simStop();simGo(SIM.step+1)}
    else if(ev.key==='ArrowLeft'){ev.preventDefault();simStop();simGo(SIM.step-1)}
    else if(ev.key===' '&&tag!=='BUTTON'){ev.preventDefault();simTogglePlay()}
    else if(ev.key==='Escape'){if(SIM.pres)simPresent(false);else simClose()}
  });
})();
