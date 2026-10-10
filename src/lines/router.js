// ====================================================================
// router · orthogonal connector routing that goes AROUND shapes and
// keeps parallel lines apart (like draw.io / libavoid, in miniature).
//  1. sparse grid from the inflated borders of every shape + port stubs
//  2. A* per edge: length + bend penalty + penalty for channels
//     another line already uses, start/end side chosen by the search
//  3. lines with no free path retry with soft walls (crossing a shape
//     costs a lot), so they cross as few shapes as possible
//  4. nudge: collinear overlapping middle segments are spread 9px apart
// Over budget (90ms) the rest finish in a background pass.
// Manual bends (mx/my), straight/curved lines, sequence lifelines,
// tree families and containers keep the old behaviour.
// ====================================================================
var RT={deep:false,timer:0,routes:{},margin:16,bend:34,used:14,gap:9,soft:520,maxGrid:400000,budget:90,memoKey:'',memo:null};
var RT_SIDES=[{s:'R',nx:1,ny:0,d:0},{s:'L',nx:-1,ny:0,d:1},{s:'B',nx:0,ny:1,d:2},{s:'T',nx:0,ny:-1,d:3}];
var RT_DX=[1,-1,0,0],RT_DY=[0,0,1,-1],RT_OPP=[1,0,3,2];
function rtObstacle(n){var f=fam(n);if(isCont(n)||isLife(n)||n.t==='u-seq-act')return false;return !(f==='pool'||f==='zone'||f==='box'||f==='group'||f==='text'||f==='draw'||f==='slide'||f==='ann')}
function rtEligible(e){
  if(!e.from||!e.to||e.from===e.to)return null;if(e.route==='straight'||e.route==='curve')return null;if(e.mx!=null||e.my!=null)return null;
  var a=byId(e.from),b=byId(e.to);if(!a||!b)return null;
  if(isLife(a)||isLife(b)||isCont(a)||isCont(b))return null;var fa=fam(a),fb=fam(b);if(TREEF[fa]||TREEF[fb]||fa==='mind'||fb==='mind')return null;
  if(!rtObstacle(a)||!rtObstacle(b))return null;
  return[a,b];
}
function rtKey(e,a,b){return [a.x,a.y,a.w,a.h,b.x,b.y,b.w,b.h,e.dir||'',e.fromAnchor?e.fromAnchor.x+','+e.fromAnchor.y:'',e.toAnchor?e.toAnchor.x+','+e.toAnchor.y:''].join('|')}
// the port on side s of node n, or the anchored point with its nearest side
function rtPorts(n,anchor){
  var m=RT.margin,cx=n.x+n.w/2,cy=n.y+n.h/2,out=[];
  if(anchor){var px=n.x+n.w*anchor.x,py=n.y+n.h*anchor.y,dl=[Math.abs(px-(n.x+n.w)),Math.abs(px-n.x),Math.abs(py-(n.y+n.h)),Math.abs(py-n.y)],k=dl.indexOf(Math.min.apply(null,dl)),sd=RT_SIDES[k];
    out.push({p:{x:px,y:py},st:{x:px+sd.nx*m,y:py+sd.ny*m},side:sd});return out}
  RT_SIDES.forEach(function(sd){var p=sd.s==='R'?{x:n.x+n.w,y:cy}:sd.s==='L'?{x:n.x,y:cy}:sd.s==='B'?{x:cx,y:n.y+n.h}:{x:cx,y:n.y};
    if(fam(n)==='ev'||fam(n)==='gw'||shapeKind(n)!=='rect'){/* tips of circles and diamonds are the side midpoints already */}
    out.push({p:p,st:{x:p.x+sd.nx*m,y:p.y+sd.ny*m},side:sd})});
  return out;
}
function rtSidePen(sd,from,to,dir){
  var dx=to.x-from.x,dy=to.y-from.y,L=Math.hypot(dx,dy)||1,dot=(sd.nx*dx+sd.ny*dy)/L,p=(1-dot)*55;
  if(dir==='v'&&sd.ny===0)p+=90;if(dir==='h'&&sd.nx===0)p+=90;return p;
}
// tiny binary heap on [cost, state]
function RtHeap(){this.c=[];this.s=[]}
RtHeap.prototype.push=function(c,s){var C=this.c,S=this.s,i=C.length;C.push(c);S.push(s);while(i>0){var p=(i-1)>>1;if(C[p]<=c)break;C[i]=C[p];S[i]=S[p];i=p}C[i]=c;S[i]=s};
RtHeap.prototype.pop=function(){var C=this.c,S=this.s,top=S[0],tc=C[0],lc=C.pop(),ls=S.pop(),n=C.length;if(n){var i=0;while(true){var l=2*i+1,r=l+1,m=i;var mc=lc;if(l<n&&C[l]<mc){m=l;mc=C[l]}if(r<n&&C[r]<mc){m=r;mc=C[r]}if(m===i)break;C[i]=C[m];S[i]=S[m];i=m}C[i]=lc;S[i]=ls}this.lastCost=tc;return top};
RtHeap.prototype.size=function(){return this.c.length};
function computeRoutes(nodes,edges){
  RT.routes={};
  if(!edges.length||nodes.length>220||edges.length>320)return;
  var todo=[];edges.forEach(function(e){var ab=rtEligible(e);if(ab)todo.push({e:e,a:ab[0],b:ab[1]})});if(!todo.length)return;
  var mk=nodes.map(function(n){return n.id+':'+n.x+','+n.y+','+n.w+','+n.h+(rtObstacle(n)?'':'-')}).join('|')+'#'+todo.map(function(t){var e=t.e;return e.id+'>'+e.from+'>'+e.to+(e.dir||'')+(e.fromAnchor?e.fromAnchor.x+','+e.fromAnchor.y:'')+(e.toAnchor?e.toAnchor.x+','+e.toAnchor.y:'')}).join('|');
  if(mk===RT.memoKey&&RT.memo){RT.routes=RT.memo;return}
  var m=RT.margin,obs=nodes.filter(rtObstacle).map(function(n){return{id:n.id,x1:n.x-m,y1:n.y-m,x2:n.x+n.w+m,y2:n.y+n.h+m}});
  RT.raw=nodes.filter(rtObstacle).map(function(n){return{id:n.id,x1:n.x-6,y1:n.y-6,x2:n.x+n.w+6,y2:n.y+n.h+6}});
  todo=todo.filter(function(t){var st=rtStraight(t.e,t.a,t.b);if(st){RT.routes[t.e.id]={key:rtKey(t.e,t.a,t.b),pts:st};return false}return true});
  var XS={},YS={},addX=function(v){XS[Math.round(v*2)/2]=1},addY=function(v){YS[Math.round(v*2)/2]=1};
  obs.forEach(function(o){addX(o.x1);addX(o.x2);addY(o.y1);addY(o.y2)});
  todo.forEach(function(t){t.pa=rtPorts(t.a,t.e.fromAnchor);t.pb=rtPorts(t.b,t.e.toAnchor);t.pa.concat(t.pb).forEach(function(q){q.st={x:Math.round(q.st.x*2)/2,y:Math.round(q.st.y*2)/2};addX(q.st.x);addY(q.st.y)})});
  var xs=Object.keys(XS).map(Number).sort(function(a,b){return a-b}),ys=Object.keys(YS).map(Number).sort(function(a,b){return a-b}),NX=xs.length,NY=ys.length,G=NX*NY;
  if(G>RT.maxGrid)return;
  var xi={},yi={};xs.forEach(function(v,i){xi[v]=i});ys.forEach(function(v,i){yi[v]=i});
  // blocked points (strictly inside an inflated shape) and blocked unit moves
  var bad=new Uint8Array(G),hB=new Uint8Array(G),vB=new Uint8Array(G),i,j,k;
  obs.forEach(function(o){
    var i0=0;while(i0<NX&&xs[i0]<=o.x1)i0++;var i1=NX-1;while(i1>=0&&xs[i1]>=o.x2)i1--;
    var j0=0;while(j0<NY&&ys[j0]<=o.y1)j0++;var j1=NY-1;while(j1>=0&&ys[j1]>=o.y2)j1--;
    for(j=j0;j<=j1;j++)for(i=i0;i<=i1;i++)bad[j*NX+i]=1;
    // horizontal move (i→i+1) on row j crosses the shape if row is strictly inside and the step overlaps it
    for(j=j0;j<=j1;j++)for(i=0;i<NX-1;i++)if(xs[i]<o.x2&&xs[i+1]>o.x1)hB[j*NX+i]=1;
    for(i=i0;i<=i1;i++)for(j=0;j<NY-1;j++)if(ys[j]<o.y2&&ys[j+1]>o.y1)vB[j*NX+i]=1;
  });
  var used=new Map(),segKey=function(idx,h){return idx*2+(h?0:1)};
  var cost=new Float64Array(G*4),prev=new Int32Array(G*4),stamp=new Int32Array(G*4),T0=performance.now(),EI=0;
  // One A* search. Hard mode treats shapes as walls. Soft mode lets a line
  // pass through a shape at a large cost, so it is chosen only when no free
  // path exists, and then it crosses as few shapes as possible.
  function search(t,soft){
    var e=t.e,ca={x:t.a.x+t.a.w/2,y:t.a.y+t.a.h/2},cb={x:t.b.x+t.b.w/2,y:t.b.y+t.b.h/2},S=++EI;
    var H=new RtHeap(),tg={},best=Infinity,bestS=-1,bestT=null,TX=[],TY=[];
    var g0=function(s){return stamp[s]===S?cost[s]:Infinity},hh=function(id){var x=xs[id%NX],y=ys[(id/NX)|0],b=Infinity;for(var q=0;q<TX.length;q++){var v=Math.abs(x-TX[q])+Math.abs(y-TY[q]);if(v<b)b=v}return b===Infinity?0:b};
    var wall=function(id){return bad[id]?(soft?RT.soft:-1):0};
    t.pb.forEach(function(q){var id=yi[q.st.y]*NX+xi[q.st.x],w=wall(id);if(w<0)return;TX.push(q.st.x);TY.push(q.st.y);(tg[id]=tg[id]||[]).push({q:q,pen:rtSidePen(q.side,cb,ca,e.dir)+w,need:RT_OPP[q.side.d]})});
    t.pa.forEach(function(q){var id=yi[q.st.y]*NX+xi[q.st.x],w=wall(id);if(w<0)return;var st=id*4+q.side.d,c=rtSidePen(q.side,ca,cb,e.dir)+m+w;if(c<g0(st)){stamp[st]=S;cost[st]=c;prev[st]=-2-t.pa.indexOf(q);H.push(c+hh(id),st)}});
    while(H.size()){
      var s=H.pop(),f=H.lastCost,c=g0(s);if(f>=best)break;
      var id=s>>2;if(f>c+hh(id)+1e-6)continue;
      var d=s&3,px=id%NX,py=(id/NX)|0;
      var Tg=tg[id];if(Tg)Tg.forEach(function(g){var fc=c+(d===g.need?0:(d===RT_OPP[g.need]?1e6:RT.bend))+g.pen+m;if(fc<best){best=fc;bestS=s;bestT=g}});
      for(var nd=0;nd<4;nd++){
        if(nd===RT_OPP[d])continue;
        var nx=px+RT_DX[nd],ny=py+RT_DY[nd];if(nx<0||ny<0||nx>=NX||ny>=NY)continue;var nid=ny*NX+nx,w=wall(nid);if(w<0)continue;
        var hor=nd<2,lo=hor?(nd===0?id:nid):(nd===2?id:nid),blk=hor?hB[lo]:vB[lo];if(blk&&!soft)continue;
        var len=hor?Math.abs(xs[nx]-xs[px]):Math.abs(ys[ny]-ys[py]),u=used.get(segKey(lo,hor))||0;
        var nc=c+len+(nd===d?0:RT.bend)+u*RT.used*(1+len/80)+w+(blk?RT.soft:0),ns=nid*4+nd;
        if(nc<g0(ns)){stamp[ns]=S;cost[ns]=nc;prev[ns]=s;H.push(nc+hh(nid),ns)}
      }
    }
    if(bestS<0)return false;
    // rebuild: grid states back to the start stub
    var chain=[],s2=bestS,guard=0,startQ=null;while(s2>=0&&guard++<G*4){chain.push(s2>>2);var pv=prev[s2];if(pv<-1){startQ=t.pa[-2-pv];break}s2=pv}
    chain.reverse();if(!startQ)return false;
    for(k=1;k<chain.length;k++){var a1=chain[k-1],b1=chain[k],h1=(a1%NX)!==(b1%NX),lo1=Math.min(a1,b1);used.set(segKey(lo1,h1),(used.get(segKey(lo1,h1))||0)+1)}
    var pts=[startQ.p];chain.forEach(function(id2){pts.push({x:xs[id2%NX],y:ys[(id2/NX)|0]})});pts.push(bestT.q.p);
    RT.routes[e.id]={key:rtKey(e,t.a,t.b),pts:rtCenterJog(rtSimplify(pts),t.a.id,t.b.id),soft:soft,ia:t.a.id,ib:t.b.id};
    return true;
  }
  var overBudget=function(){return performance.now()-T0>(RT.deep?4000:RT.budget)};
  todo.forEach(function(t){if(overBudget()){t.skip=1;return}t.done=search(t,false)});
  // lines that found no free path try again with soft walls
  todo.forEach(function(t){if(t.skip||t.done)return;if(overBudget()){t.skip=1;return}search(t,true)});
  rtNudge();
  var unfinished=todo.some(function(t){return t.skip});
  if(!unfinished){RT.memoKey=mk;RT.memo=RT.routes}
  else{RT.memoKey='';RT.memo=null;if(!RT.deep&&!RT.timer)RT.timer=setTimeout(function(){RT.timer=0;if(drag&&drag.moved)return;RT.deep=true;try{render();renderOver()}catch(err){}RT.deep=false},60)}
}
function rtSimplify(p){
  var o=[p[0]];for(var i=1;i<p.length;i++){var q=p[i],l=o[o.length-1];if(Math.abs(q.x-l.x)<0.01&&Math.abs(q.y-l.y)<0.01)continue;o.push({x:q.x,y:q.y})}
  var r=[o[0]];for(i=1;i<o.length-1;i++){var a=r[r.length-1],b=o[i],c=o[i+1];if((Math.abs(a.x-b.x)<0.01&&Math.abs(b.x-c.x)<0.01)||(Math.abs(a.y-b.y)<0.01&&Math.abs(b.y-c.y)<0.01))continue;r.push(b)}
  r.push(o[o.length-1]);return r;
}
// spread overlapping collinear middle segments so every line stays visible
function rtNudge(){
  var segs=[];Object.keys(RT.routes).forEach(function(id){var P=RT.routes[id].pts;for(var i=1;i<P.length-2;i++){var a=P[i],b=P[i+1],v=Math.abs(a.x-b.x)<0.01;if(!v&&Math.abs(a.y-b.y)>=0.01)continue;segs.push({id:id,i:i,v:v,c:v?a.x:a.y,lo:v?Math.min(a.y,b.y):Math.min(a.x,b.x),hi:v?Math.max(a.y,b.y):Math.max(a.x,b.x)})}});
  var groups={};segs.forEach(function(s){var k=(s.v?'v':'h')+Math.round(s.c);(groups[k]=groups[k]||[]).push(s)});
  Object.keys(groups).forEach(function(k){
    var g=groups[k].sort(function(a,b){return a.lo-b.lo}),cl=[];
    g.forEach(function(s){var last=cl[cl.length-1];if(last&&s.lo<last.hi-1){last.items.push(s);last.hi=Math.max(last.hi,s.hi)}else cl.push({hi:s.hi,items:[s]})});
    cl.forEach(function(c){
      var it=c.items.filter(function(s,ix,arr){return arr.findIndex(function(o){return o.id===s.id})===ix});if(it.length<2)return;
      it.sort(function(a,b){return (a.lo+a.hi)-(b.lo+b.hi)});
      it.forEach(function(s,n){var off=(n-(it.length-1)/2)*RT.gap,P=RT.routes[s.id].pts;if(s.v){P[s.i].x+=off;P[s.i+1].x+=off}else{P[s.i].y+=off;P[s.i+1].y+=off}});
    });
  });
}
var rtRoute0=route;
route=function(e){
  var r=RT.routes[e.id];if(r){var a=byId(e.from),b=byId(e.to);if(a&&b&&e.mx==null&&e.my==null&&e.route!=='straight'&&e.route!=='curve'&&r.key===rtKey(e,a,b))return r.pts.map(function(p){return{x:p.x,y:p.y}})}
  return rtRoute0(e);
};
function rtShouldRun(){return !(drag&&drag.moved&&(drag.kind==='move'||drag.kind==='resize'))}

// a segment is clear when it touches no shape except the two it connects
function rtClear(p,q,ia,ib){
  var x1=Math.min(p.x,q.x),x2=Math.max(p.x,q.x),y1=Math.min(p.y,q.y),y2=Math.max(p.y,q.y);
  return !RT.raw.some(function(o){return o.id!==ia&&o.id!==ib&&x1<o.x2&&x2>o.x1&&y1<o.y2&&y2>o.y1});
}
// facing sides that overlap → one straight line, no bends at all
function rtStraight(e,a,b){
  if(e.fromAnchor||e.toAnchor)return null;
  var oy1=Math.max(a.y,b.y),oy2=Math.min(a.y+a.h,b.y+b.h),ox1=Math.max(a.x,b.x),ox2=Math.min(a.x+a.w,b.x+b.w),p,q,c;
  if(e.dir!=='v'&&oy2-oy1>=14&&(b.x>=a.x+a.w+12||a.x>=b.x+b.w+12)){
    c=clamp((a.y+a.h/2+b.y+b.h/2)/2,oy1+7,oy2-7);var r=b.x>a.x;p={x:r?a.x+a.w:a.x,y:c};q={x:r?b.x:b.x+b.w,y:c};
    if(rtClear(p,q,a.id,b.id))return[p,q];
  }
  if(e.dir!=='h'&&ox2-ox1>=14&&(b.y>=a.y+a.h+12||a.y>=b.y+b.h+12)){
    c=clamp((a.x+a.w/2+b.x+b.w/2)/2,ox1+7,ox2-7);var d=b.y>a.y;p={x:c,y:d?a.y+a.h:a.y};q={x:c,y:d?b.y:b.y+b.h};
    if(rtClear(p,q,a.id,b.id))return[p,q];
  }
  return null;
}
// a single jog (H-V-H or V-H-V) goes in the middle of the run, not hard against an arrowhead
function rtCenterJog(P,ia,ib){
  if(P.length!==4)return P;
  var h0=Math.abs(P[0].y-P[1].y)<0.01,h2=Math.abs(P[2].y-P[3].y)<0.01,v1=Math.abs(P[1].x-P[2].x)<0.01;
  if(h0&&v1&&h2){var mx=(P[0].x+P[3].x)/2,Q=[P[0],{x:mx,y:P[0].y},{x:mx,y:P[3].y},P[3]];if(rtClear(Q[0],Q[1],ia,ib)&&rtClear(Q[1],Q[2],ia,ib)&&rtClear(Q[2],Q[3],ia,ib))return Q}
  var w0=Math.abs(P[0].x-P[1].x)<0.01,w2=Math.abs(P[2].x-P[3].x)<0.01,u1=Math.abs(P[1].y-P[2].y)<0.01;
  if(w0&&u1&&w2){var my=(P[0].y+P[3].y)/2,R=[P[0],{x:P[0].x,y:my},{x:P[3].x,y:my},P[3]];if(rtClear(R[0],R[1],ia,ib)&&rtClear(R[1],R[2],ia,ib)&&rtClear(R[2],R[3],ia,ib))return R}
  return P;
}

