// ================= DOM =================
import type { DiagramNode, ShapeType } from './types';
import {
  $,
  BPMN_FAM,
  CAT,
  CONTAINER,
  EDGE,
  FAM_LABEL,
  FONT,
  FONT_CLEAN,
  FONT_SKETCH,
  S,
  T,
  TH,
  byId,
  cam,
  catColor,
  center,
  clamp,
  connSrc,
  contents,
  drawAll,
  drawComp,
  eById,
  edgeD,
  esc,
  fam,
  grid,
  hoverId,
  ic,
  labelPoint,
  lsGet,
  lsSet,
  markerDefs,
  nid,
  poolOf,
  pushUndo,
  r1,
  redo,
  route,
  selE,
  selN,
  setEdgePoint,
  set_FONT,
  set_S,
  set_cam,
  set_connSrc,
  set_hoverId,
  set_mUsed,
  set_selE,
  set_selN,
  set_tool,
  showMini,
  size,
  snap,
  snapshot,
  syncPool,
  tool,
  undo,
  validColor,
} from './core';
import { DT, SEC, TREEF, dtOf, isLife, resizable } from '../diagrams/catalog';
import { cellTone, classLayout, smoothPath } from '../diagrams/draw';
import { DOC, closeModal, openModal, saveNow, scheduleSave } from './features';
import { subtree, treeAdd } from '../diagrams/frameworks';
import { renderInsp } from '../editor/inspector';
import { closeDtPop, openPalette, previewSvg, set_uiWs, syncDomain } from '../editor/workspaces';
import { SIM, simApply } from '../editor/simulate';
import { trT } from '../i18n/id';

export var svg: HTMLElement;
export var stage: HTMLElement;
export var content: HTMLElement;
export var over: HTMLElement;
export var measureG: HTMLElement;
export var mdefs: HTMLElement;
export var bgRect: HTMLElement;
export var inspBody: HTMLElement;
export var palBody: HTMLElement;
export var toastEl: HTMLElement;
export function hydrateIcons(root?) {
  (root || document).querySelectorAll('i[data-ic]').forEach(function (el) {
    var tmp = document.createElement('span');
    tmp.innerHTML = ic(el.getAttribute('data-ic'), el.className);
    var s = tmp.firstChild;
    if (el.id) (s as HTMLInputElement).id = el.id;
    el.replaceWith(s);
  });
}
let toastTimer = 0;
export function toast(m, ms?) {
  if (typeof trT === 'function') m = trT(m);
  toastEl.textContent = m;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toastEl.classList.remove('show');
  }, ms || 2600);
}
export function isTyping() {
  var a = document.activeElement;
  return a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || (a as HTMLInputElement).isContentEditable);
}

// ================= camera =================
export function vr() {
  return svg.getBoundingClientRect();
}
export function pt(ev) {
  var r = vr();
  return { x: cam.x + (ev.clientX - r.left) / cam.z, y: cam.y + (ev.clientY - r.top) / cam.z };
}
export function toClient(x, y) {
  var r = vr();
  return { x: r.left + (x - cam.x) * cam.z, y: r.top + (y - cam.y) * cam.z };
}
export function hs(v) {
  return r1((v / cam.z) * 100) / 100;
}
export function applyCam() {
  var r = vr(),
    vw = Math.max(1, r.width) / cam.z,
    vh = Math.max(1, r.height) / cam.z;
  svg.setAttribute('viewBox', cam.x.toFixed(2) + ' ' + cam.y.toFixed(2) + ' ' + vw.toFixed(2) + ' ' + vh.toFixed(2));
  bgRect.setAttribute('x', cam.x.toFixed(2));
  bgRect.setAttribute('y', cam.y.toFixed(2));
  bgRect.setAttribute('width', vw.toFixed(2));
  bgRect.setAttribute('height', vh.toFixed(2));
  bgRect.setAttribute('fill', grid ? (cam.z < 0.45 ? 'url(#gridLg)' : 'url(#gridSm)') : 'transparent');
  $('zReset').textContent = Math.round(cam.z * 100) + '%';
  renderMini();
  positionEditor();
}
export function zoomAt(cx, cy, z) {
  z = clamp(z, 0.1, 4);
  var r = vr(),
    wx = cam.x + (cx - r.left) / cam.z,
    wy = cam.y + (cy - r.top) / cam.z;
  cam.z = z;
  cam.x = wx - (cx - r.left) / z;
  cam.y = wy - (cy - r.top) / z;
  applyCam();
  renderOver();
}
export function zoomBy(f) {
  var r = vr();
  zoomAt(r.left + r.width / 2, r.top + r.height / 2, cam.z * f);
}
export function nodeBounds(n) {
  var f = fam(n),
    b = { x: n.x, y: n.y, w: n.w, h: n.h };
  if (f === 'ev' || f === 'gw' || f === 'data' || (f === 'comp' && n.look === 'tile')) {
    var ex = Math.max(0, (Math.max(120, n.w + 50) - n.w) / 2);
    b = { x: n.x - ex, y: n.y, w: n.w + ex * 2, h: n.h + (n.label ? (n.sub ? 40 : 24) : 0) };
  }
  return b;
}
export function bounds(nodes, edges) {
  var x1 = Infinity,
    y1 = Infinity,
    x2 = -Infinity,
    y2 = -Infinity;
  nodes.forEach(function (n) {
    var b = nodeBounds(n);
    x1 = Math.min(x1, b.x);
    y1 = Math.min(y1, b.y);
    x2 = Math.max(x2, b.x + b.w);
    y2 = Math.max(y2, b.y + b.h);
  });
  (edges || []).forEach(function (e) {
    var p = route(e);
    if (p)
      p.forEach(function (q) {
        x1 = Math.min(x1, q.x);
        y1 = Math.min(y1, q.y);
        x2 = Math.max(x2, q.x);
        y2 = Math.max(y2, q.y);
      });
  });
  if (!isFinite(x1)) return null;
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}
export function fitTo(b, maxZ?) {
  if (!b) return;
  var r = vr(),
    pad = 40,
    top = r.width < 640 ? 64 : 76,
    bot = r.width < 640 ? 72 : 150;
  var z = clamp(
    Math.min((r.width - pad * 2) / Math.max(1, b.w), (r.height - top - bot) / Math.max(1, b.h)),
    0.1,
    maxZ || 1.2,
  );
  var tooSmall = r.width < 640 && z < 0.45;
  if (tooSmall) z = 0.45; /* phones: stay readable, start at the left edge and let the user pan */
  cam.z = z;
  cam.x = tooSmall ? b.x - pad / z : b.x + b.w / 2 - r.width / 2 / z;
  cam.y = b.y + b.h / 2 - (top + (r.height - top - bot) / 2) / z;
  applyCam();
  renderOver();
}
export function fitView() {
  var b = bounds(S.nodes, S.edges);
  if (!b) {
    set_cam({ x: -60, y: -80, z: 1 });
    applyCam();
    return;
  }
  fitTo(b);
}
export function viewCenter() {
  var r = vr();
  return { x: cam.x + r.width / 2 / cam.z, y: cam.y + (r.height / 2 + 10) / cam.z };
}

// ================= selection =================
export function setSel(ids, eid?) {
  set_selN(
    (ids || []).filter(function (id) {
      return byId(id);
    }),
  );
  set_selE(eid && eById(eid) ? eid : null);
  renderOver();
  renderInsp();
}
export function single() {
  return selN.length === 1 && !selE ? byId(selN[0]) : null;
}
export function isCont(n) {
  return !!n && (!!CONTAINER[fam(n)] || !!n.deco);
}
export function isSel(id) {
  return selN.indexOf(id) >= 0;
}

// ================= render =================
export function applyStyle__base() {
  var sk = S.style === 'sketch';
  set_FONT(sk ? FONT_SKETCH : FONT_CLEAN);
  svg.setAttribute('font-family', FONT);
  if (sk) content.setAttribute('filter', 'url(#sketchF)');
  else content.removeAttribute('filter');
  var b = $('tSketch');
  if (b) b.classList.toggle('on', sk);
}
export var applyStyle: typeof applyStyle__base = applyStyle__base;
export function set_applyStyle(v: typeof applyStyle__base) {
  return (applyStyle = v);
}
export function render__base() {
  set_mUsed({});
  content.innerHTML = drawAll(S.nodes, S.edges);
  mdefs.innerHTML = markerDefs();
  $('empty').hidden = !!(S.nodes.length || S.edges.length);
  renderOver();
  renderMini();
  scheduleSave();
  if (typeof simApply === 'function' && SIM.on) simApply(false);
}
export var render: typeof render__base = render__base;
export function set_render(v: typeof render__base) {
  return (render = v);
}
export function renderAll__base() {
  render();
  renderInsp();
}
export var renderAll: typeof renderAll__base = renderAll__base;
export function set_renderAll(v: typeof renderAll__base) {
  return (renderAll = v);
}
export function restore(str) {
  var pdt = S.dt;
  set_S(JSON.parse(str));
  applyStyle();
  if (S.dt !== pdt && typeof syncDomain === 'function') {
    set_uiWs(DT[dtOf()].ws);
    syncDomain();
  }
  set_selN(
    selN.filter(function (id) {
      return byId(id);
    }),
  );
  if (selE && !eById(selE)) set_selE(null);
  renderAll();
  syncUndoBtns();
}
export function doUndo() {
  commitEdit();
  if (!undo.length) return;
  redo.push(snapshot());
  restore(undo.pop());
}
export function doRedo() {
  commitEdit();
  if (!redo.length) return;
  undo.push(snapshot());
  restore(redo.pop());
}
export function syncUndoBtns() {
  var u = $('tUndo'),
    r = $('tRedo');
  if (u) u.disabled = !undo.length;
  if (r) r.disabled = !redo.length;
}

export function portsFor(n) {
  var c = center(n),
    P = { R: { x: n.x + n.w, y: c.y }, L: { x: n.x, y: c.y }, T: { x: c.x, y: n.y }, B: { x: c.x, y: n.y + n.h } },
    s = '',
    off = hs(15),
    sc = TH.sel;
  if (fam(n) === 'comp' && n.look === 'tile' && n.label) P.B.y = n.y + n.h + (n.sub ? 40 : 24);
  Object.keys(P).forEach(function (k) {
    var p = P[k],
      q = { x: p.x + (k === 'R' ? off : k === 'L' ? -off : 0), y: p.y + (k === 'B' ? off : k === 'T' ? -off : 0) };
    s +=
      '<g data-h="port" data-side="' +
      k +
      '" data-nid="' +
      n.id +
      '"><title>Drag to connect, click to add a linked shape</title><circle cx="' +
      r1(q.x) +
      '" cy="' +
      r1(q.y) +
      '" r="' +
      hs(11) +
      '" fill="transparent"/><circle cx="' +
      r1(q.x) +
      '" cy="' +
      r1(q.y) +
      '" r="' +
      hs(6) +
      '" fill="' +
      TH.paper +
      '" stroke="' +
      sc +
      '" stroke-width="' +
      hs(1.6) +
      '"/><circle cx="' +
      r1(q.x) +
      '" cy="' +
      r1(q.y) +
      '" r="' +
      hs(2.2) +
      '" fill="' +
      sc +
      '"/></g>';
  });
  return s;
}
export function renderOver__base() {
  var s = '',
    sc = TH.sel,
    dragging = drag && drag.moved && drag.kind !== 'conn';
  var one = single();
  // halo keeps hover alive between a node and its ports
  var portNode = null;
  if (!dragging && tool !== 'hand' && !(drag && drag.kind === 'marquee')) {
    var h = hoverId && byId(hoverId);
    if (h && !isCont(h)) portNode = h;
    else if (one) portNode = one;
  }
  if (portNode) {
    var hn = portNode,
      pad = hs(16);
    s +=
      '<rect data-id="' +
      hn.id +
      '" data-halo="1" x="' +
      r1(hn.x - pad / 2) +
      '" y="' +
      r1(hn.y - pad / 2) +
      '" width="' +
      r1(hn.w + pad) +
      '" height="' +
      r1(hn.h + pad) +
      '" fill="none" stroke="transparent" stroke-width="' +
      r1(pad * 1.6) +
      '" pointer-events="stroke"/>';
  }
  selN.forEach(function (id) {
    var n = byId(id);
    if (!n) return;
    var p = hs(4);
    s +=
      '<rect x="' +
      r1(n.x - p) +
      '" y="' +
      r1(n.y - p) +
      '" width="' +
      r1(n.w + p * 2) +
      '" height="' +
      r1(n.h + p * 2) +
      '" rx="' +
      hs(5) +
      '" fill="none" stroke="' +
      sc +
      '" stroke-width="' +
      hs(1.5) +
      '" stroke-dasharray="' +
      hs(5) +
      ' ' +
      hs(3) +
      '" pointer-events="none"/>';
  });
  if (one && resizable(one) && !dragging) {
    var k = hs(9),
      pp = hs(4);
    [
      ['nw', one.x - pp, one.y - pp],
      ['ne', one.x + one.w + pp, one.y - pp],
      ['sw', one.x - pp, one.y + one.h + pp],
      ['se', one.x + one.w + pp, one.y + one.h + pp],
    ].forEach(function (c: any) {
      s +=
        '<rect data-h="rs-' +
        c[0] +
        '" x="' +
        r1(c[1] - k / 2) +
        '" y="' +
        r1(c[2] - k / 2) +
        '" width="' +
        k +
        '" height="' +
        k +
        '" rx="' +
        hs(2) +
        '" fill="' +
        TH.paper +
        '" stroke="' +
        sc +
        '" stroke-width="' +
        hs(1.5) +
        '"/>';
    });
  }
  if (portNode && !(drag && drag.kind === 'conn')) s += portsFor(portNode);
  if (selE) {
    var e = eById(selE),
      pts = e && route(e);
    if (pts) {
      s +=
        '<path d="' +
        edgeD(e, pts) +
        '" fill="none" stroke="' +
        sc +
        '" stroke-width="' +
        hs(5) +
        '" stroke-opacity=".28" stroke-linecap="round" pointer-events="none"/>';
      [pts[0], pts[pts.length - 1]].forEach(function (p, i) {
        s +=
          '<g data-h="' +
          (i ? 'end' : 'start') +
          '"><title>Drag this end; drop it on a shape to attach</title><circle cx="' +
          r1(p.x) +
          '" cy="' +
          r1(p.y) +
          '" r="' +
          hs(13) +
          '" fill="transparent"/><circle cx="' +
          r1(p.x) +
          '" cy="' +
          r1(p.y) +
          '" r="' +
          hs(6) +
          '" fill="' +
          (i ? sc : '#13804a') +
          '" stroke="' +
          TH.paper +
          '" stroke-width="' +
          hs(2) +
          '"/></g>';
      });
      if (pts.length === 4 && !e.route) {
        var m = { x: (pts[1].x + pts[2].x) / 2, y: (pts[1].y + pts[2].y) / 2 },
          q = hs(6);
        s +=
          '<rect data-h="mid" x="' +
          r1(m.x - q) +
          '" y="' +
          r1(m.y - q) +
          '" width="' +
          r1(q * 2) +
          '" height="' +
          r1(q * 2) +
          '" rx="' +
          hs(3) +
          '" fill="' +
          TH.paper +
          '" stroke="' +
          sc +
          '" stroke-width="' +
          hs(2) +
          '"><title>Drag to move the bend</title></rect>';
      }
    }
  }
  if (connSrc) {
    var c = byId(connSrc);
    if (c)
      s +=
        '<rect x="' +
        r1(c.x - hs(6)) +
        '" y="' +
        r1(c.y - hs(6)) +
        '" width="' +
        r1(c.w + hs(12)) +
        '" height="' +
        r1(c.h + hs(12)) +
        '" rx="' +
        hs(6) +
        '" fill="none" stroke="#13804a" stroke-width="' +
        hs(2) +
        '" pointer-events="none"/>';
  }
  if (drag && drag.kind === 'pen' && drag.pts.length > 1)
    s +=
      '<path d="' +
      smoothPath(drag.pts) +
      '" fill="none" stroke="' +
      TH.ink +
      '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>';
  if (drag && drag.kind === 'conn' && drag.cur) {
    var src = byId(drag.id),
      a = drag.from || center(src);
    s +=
      '<line x1="' +
      r1(a.x) +
      '" y1="' +
      r1(a.y) +
      '" x2="' +
      r1(drag.cur.x) +
      '" y2="' +
      r1(drag.cur.y) +
      '" stroke="' +
      sc +
      '" stroke-width="' +
      hs(1.8) +
      '" stroke-dasharray="' +
      hs(6) +
      ' ' +
      hs(4) +
      '" pointer-events="none"/>';
    var tg = drag.target && byId(drag.target);
    if (tg)
      s +=
        '<rect x="' +
        r1(tg.x - hs(5)) +
        '" y="' +
        r1(tg.y - hs(5)) +
        '" width="' +
        r1(tg.w + hs(10)) +
        '" height="' +
        r1(tg.h + hs(10)) +
        '" rx="' +
        hs(7) +
        '" fill="' +
        sc +
        '" fill-opacity=".08" stroke="' +
        sc +
        '" stroke-width="' +
        hs(2) +
        '" pointer-events="none"/>';
  }
  if (drag && drag.kind === 'marquee' && drag.cur) {
    var mx = Math.min(drag.sx, drag.cur.x),
      my = Math.min(drag.sy, drag.cur.y);
    s +=
      '<rect x="' +
      r1(mx) +
      '" y="' +
      r1(my) +
      '" width="' +
      r1(Math.abs(drag.cur.x - drag.sx)) +
      '" height="' +
      r1(Math.abs(drag.cur.y - drag.sy)) +
      '" fill="' +
      sc +
      '" fill-opacity=".07" stroke="' +
      sc +
      '" stroke-width="' +
      hs(1) +
      '" pointer-events="none"/>';
  }
  if (drag && drag.guides)
    drag.guides.forEach(function (g) {
      if (g.x != null)
        s +=
          '<line x1="' +
          r1(g.x) +
          '" y1="' +
          r1(g.a - hs(12)) +
          '" x2="' +
          r1(g.x) +
          '" y2="' +
          r1(g.b + hs(12)) +
          '" stroke="' +
          TH.guide +
          '" stroke-width="' +
          hs(1) +
          '" pointer-events="none"/>';
      else
        s +=
          '<line x1="' +
          r1(g.a - hs(12)) +
          '" y1="' +
          r1(g.y) +
          '" x2="' +
          r1(g.b + hs(12)) +
          '" y2="' +
          r1(g.y) +
          '" stroke="' +
          TH.guide +
          '" stroke-width="' +
          hs(1) +
          '" pointer-events="none"/>';
    });
  over.innerHTML = s;
}
export var renderOver: typeof renderOver__base = renderOver__base;
export function set_renderOver(v: typeof renderOver__base) {
  return (renderOver = v);
}

// ================= minimap =================
export var miniSvg: HTMLElement;
export function renderMini() {
  if (!showMini || $('mini').hidden) return;
  var r = vr(),
    view = { x: cam.x, y: cam.y, w: r.width / cam.z, h: r.height / cam.z },
    b = bounds(S.nodes, []),
    u = view;
  if (b) {
    var x1 = Math.min(b.x, view.x),
      y1 = Math.min(b.y, view.y),
      x2 = Math.max(b.x + b.w, view.x + view.w),
      y2 = Math.max(b.y + b.h, view.y + view.h);
    u = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }
  var pad = Math.max(u.w, u.h) * 0.06;
  miniSvg.setAttribute(
    'viewBox',
    r1(u.x - pad) + ' ' + r1(u.y - pad) + ' ' + r1(u.w + pad * 2) + ' ' + r1(u.h + pad * 2),
  );
  var s = '';
  S.nodes.forEach(function (n) {
    var f = fam(n),
      c =
        f === 'comp'
          ? validColor(n.stroke)
            ? n.stroke
            : catColor(T[n.t].cat)
          : f === 'zone'
            ? catColor(T[n.t].cat)
            : f === 'cell'
              ? validColor(n.fill)
                ? n.fill
                : cellTone(n)
              : TREEF[f]
                ? TH.sel
                : f === 'note'
                  ? (T[n.t] || ({} as ShapeType)).fill || TH.note
                  : TH.ink;
    if (f === 'draw') return;
    if (f === 'zone' || f === 'pool' || f === 'group' || f === 'box' || n.deco)
      s +=
        '<rect x="' +
        n.x +
        '" y="' +
        n.y +
        '" width="' +
        n.w +
        '" height="' +
        n.h +
        '" fill="' +
        c +
        '" fill-opacity=".08" stroke="' +
        c +
        '" stroke-opacity=".5" vector-effect="non-scaling-stroke"/>';
    else
      s +=
        '<rect x="' +
        n.x +
        '" y="' +
        n.y +
        '" width="' +
        n.w +
        '" height="' +
        n.h +
        '" rx="4" fill="' +
        c +
        '" fill-opacity=".55"/>';
  });
  s +=
    '<rect x="' +
    r1(view.x) +
    '" y="' +
    r1(view.y) +
    '" width="' +
    r1(view.w) +
    '" height="' +
    r1(view.h) +
    '" fill="' +
    TH.sel +
    '" fill-opacity=".08" stroke="' +
    TH.sel +
    '" stroke-width="1.5" vector-effect="non-scaling-stroke"/>';
  miniSvg.innerHTML = s;
}

// ================= operations =================
export function addNode(t, x, y, extra?) {
  var sz = size(t),
    n: DiagramNode = { id: nid(), t: t, x: snap(x - sz[0] / 2), y: snap(y - sz[1] / 2), w: sz[0], h: sz[1], label: '' },
    f = T[t].f,
    d = T[t];
  if (t === 'pool') {
    n.label = 'Participant name';
    n.lanes = [
      { name: 'Lane 1', h: 120 },
      { name: 'Lane 2', h: 120 },
    ];
    n.x = snap(x - 60);
    n.y = snap(y - 60);
  }
  if (f === 'comp' || f === 'zone') n.label = T[t].n;
  if (f === 'note') n.label = 'Note';
  if (d.lab != null) n.label = d.lab;
  if (d.init) for (var ik in d.init) n[ik] = clone(d.init[ik]);
  if (f === 'comp' && DT[dtOf()].look === 'tile' && !(extra && extra.look)) n.look = 'tile';
  if (extra) for (var k in extra) n[k] = extra[k];
  if (n.look === 'tile') {
    n.w = (extra && extra.w) || 64;
    n.h = (extra && extra.h) || 64;
    n.x = snap(x - n.w / 2);
    n.y = snap(y - n.h / 2);
  }
  if (n.t === 'pool') syncPool(n);
  S.nodes.push(n);
  return n;
}
export var ROUTERS = { 'c-a-router': 1, 'c-a-super': 1, 'c-l-if': 1, 'c-l-switch': 1 };
export var TOOLS = { 'c-a-tool': 1, 'c-a-mcp': 1, 'c-a-sandbox': 1, 'c-a-browser': 1, 'c-l-http': 1 };
export function autoType(a, b) {
  var fa = fam(a),
    fb = fam(b),
    ka = T[a.t].k,
    kb = T[b.t].k;
  if (fa === 'uml' || fb === 'uml') {
    if (isLife(a) && isLife(b)) return 'umsg';
    if (ka === 'actor' || kb === 'actor') return 'uassoc';
    if (ka === 'usecase' && kb === 'usecase') return 'uinc';
    if (['class', 'interface', 'enum'].indexOf(ka) >= 0) return kb === 'interface' ? 'ureal' : 'uassoc';
    return 'uflow';
  }
  if (fa === 'er' || fb === 'er') return ka === 'table' && kb === 'table' ? 'cf' : 'line';
  if (fa === 'dfd' || fb === 'dfd') return 'dflow';
  if (fa === 'c4' || fb === 'c4') return 'c4rel';
  if (TREEF[fa] && fa === fb) return 'line';
  if (fa === 'wf' || fb === 'wf' || fa === 'ux' || fb === 'ux') return 'sync';
  if (fa === 'ann' || fb === 'ann' || fa === 'note' || fb === 'note') return 'assoc';
  if (BPMN_FAM[fa] && BPMN_FAM[fb]) {
    if (fa === 'data' || fb === 'data') return 'data';
    var pa = poolOf(a),
      pb = poolOf(b);
    if (fa === 'pool' || fb === 'pool') return 'msg';
    if (pa && pb && pa !== pb) return 'msg';
    if ((pa && !pb) || (!pa && pb)) return 'msg';
    return 'seq';
  }
  if (fa === 'comp' && fb === 'comp') {
    if (TOOLS[b.t] && T[a.t].cat === 'agent') return 'tool';
    if (ROUTERS[a.t]) return 'route';
    var ca = T[a.t].cat,
      cb = T[b.t].cat;
    if (cb === 'msg' || ca === 'msg') return 'async';
  }
  return 'sync';
}
export function addEdge(from, to, type?) {
  if (from === to) return null;
  var a = byId(from),
    b = byId(to);
  if (!a || !b) return null;
  var ft = type || $('flowSel').value;
  var e = { id: 'e' + S.seq++, from: from, to: to, type: ft === 'auto' ? autoType(a, b) : ft, label: '' };
  styleEdge(e, a, b);
  S.edges.push(e);
  return e;
}
export function styleEdge(e, a, b) {
  var fa = fam(a),
    fb = fam(b),
    k: Record<string, any> = EDGE[e.type] || {};
  if (fa === 'comp' && fb === 'comp' && a.look === 'tile' && b.look === 'tile') e.route = 'curve';
  if (k.lab && !e.label) e.label = k.lab;
  if (k.cf) {
    e.c1 = e.c1 || 'only';
    e.c2 = e.c2 || 'zmany';
  }
  if (TREEF[fa] && fa === fb) {
    if (fa === 'mind') {
      e.route = 'curve';
      e.dir = 'h';
    } else e.dir = 'v';
    e.type = 'line';
  }
  if (isLife(a) && isLife(b)) e.route = 'straight';
  var UC = { actor: 1, usecase: 1 };
  if (UC[(T[a.t] || ({} as ShapeType)).k] && UC[(T[b.t] || ({} as ShapeType)).k]) e.route = 'straight';
  if (fa === 'er' && fb === 'er' && (a.t !== 'er-table' || b.t !== 'er-table')) e.route = 'straight';
}
export function delSel() {
  var ids = {};
  selN.forEach(function (id) {
    ids[id] = 1;
  });
  if (selN.length) {
    S.nodes = S.nodes.filter(function (n) {
      return !ids[n.id];
    });
    S.edges = S.edges.filter(function (e) {
      return !ids[e.from] && !ids[e.to];
    });
  }
  if (selE)
    S.edges = S.edges.filter(function (e) {
      return e.id !== selE;
    });
  set_selN([]);
  set_selE(null);
}
export function clone(o) {
  return JSON.parse(JSON.stringify(o));
}
export var clip = null;
export var pasteN = 0;
export function copySel() {
  if (selE && !selN.length) {
    var e = eById(selE),
      pts = e && route(e);
    if (!pts) return false;
    var c = clone(e);
    c.from = null;
    c.to = null;
    delete c.fromAnchor;
    delete c.toAnchor;
    c.start = { x: pts[0].x, y: pts[0].y };
    c.end = { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y };
    clip = { nodes: [], edges: [c] };
    pasteN = 0;
    return true;
  }
  if (!selN.length) return false;
  var ids = {};
  selN.forEach(function (id) {
    ids[id] = 1;
    var n = byId(id);
    if (isCont(n))
      contents(n).forEach(function (o) {
        ids[o.id] = 1;
      });
  });
  clip = {
    nodes: S.nodes
      .filter(function (n) {
        return ids[n.id];
      })
      .map(clone),
    edges: S.edges
      .filter(function (e) {
        return ids[e.from] && ids[e.to];
      })
      .map(clone),
  };
  pasteN = 0;
  return true;
}
export function pasteClip(at?) {
  if (!clip || (!clip.nodes.length && !clip.edges.length)) return;
  pushUndo();
  pasteN++;
  var dx = 24 * pasteN,
    dy = 24 * pasteN;
  if (at) {
    var b = clip.nodes.length ? bounds(clip.nodes, []) : null;
    if (b) {
      dx = snap(at.x - (b.x + b.w / 2));
      dy = snap(at.y - (b.y + b.h / 2));
    } else {
      var e0 = clip.edges[0];
      dx = snap(at.x - e0.start.x);
      dy = snap(at.y - e0.start.y);
    }
  }
  var map = {},
    nn = [],
    ne = [];
  clip.nodes.forEach(function (o) {
    var n = clone(o);
    n.id = nid();
    n.x = o.x + dx;
    n.y = o.y + dy;
    map[o.id] = n.id;
    S.nodes.push(n);
    nn.push(n.id);
  });
  clip.edges.forEach(function (o) {
    var e = clone(o);
    e.id = 'e' + S.seq++;
    e.from = o.from ? map[o.from] || null : null;
    e.to = o.to ? map[o.to] || null : null;
    if (e.start) e.start = { x: e.start.x + dx, y: e.start.y + dy };
    if (e.end) e.end = { x: e.end.x + dx, y: e.end.y + dy };
    if (e.mx != null) e.mx += dx;
    if (e.my != null) e.my += dy;
    S.edges.push(e);
    ne.push(e.id);
  });
  set_selN(nn);
  set_selE(nn.length ? null : ne[ne.length - 1] || null);
  renderAll();
}
export function dupSel() {
  var kc = clip,
    kp = pasteN;
  if (copySel()) pasteClip();
  clip = kc;
  pasteN = kp;
}
export function toFront() {
  if (!selN.length) return;
  pushUndo();
  var ids = {};
  selN.forEach(function (id) {
    ids[id] = 1;
  });
  S.nodes = S.nodes
    .filter(function (n) {
      return !ids[n.id];
    })
    .concat(
      S.nodes.filter(function (n) {
        return ids[n.id];
      }),
    );
  renderAll();
}
export function toBack() {
  if (!selN.length) return;
  pushUndo();
  var ids = {};
  selN.forEach(function (id) {
    ids[id] = 1;
  });
  S.nodes = S.nodes
    .filter(function (n) {
      return ids[n.id];
    })
    .concat(
      S.nodes.filter(function (n) {
        return !ids[n.id];
      }),
    );
  renderAll();
}
export function align(k) {
  var ns = selN.map(byId).filter(Boolean);
  if (ns.length < 2) return;
  pushUndo();
  var x1 = Math.min.apply(
      null,
      ns.map(function (n) {
        return n.x;
      }),
    ),
    x2 = Math.max.apply(
      null,
      ns.map(function (n) {
        return n.x + n.w;
      }),
    ),
    y1 = Math.min.apply(
      null,
      ns.map(function (n) {
        return n.y;
      }),
    ),
    y2 = Math.max.apply(
      null,
      ns.map(function (n) {
        return n.y + n.h;
      }),
    );
  ns.forEach(function (n) {
    if (k === 'l') n.x = x1;
    else if (k === 'c') n.x = Math.round((x1 + x2) / 2 - n.w / 2);
    else if (k === 'r') n.x = x2 - n.w;
    else if (k === 't') n.y = y1;
    else if (k === 'm') n.y = Math.round((y1 + y2) / 2 - n.h / 2);
    else if (k === 'b') n.y = y2 - n.h;
  });
  renderAll();
}
export function distribute(axis) {
  var ns = selN.map(byId).filter(Boolean);
  if (ns.length < 3) return;
  pushUndo();
  var P = axis === 'h' ? 'x' : 'y',
    D = axis === 'h' ? 'w' : 'h';
  ns.sort(function (a, b) {
    return a[P] - b[P];
  });
  var start = ns[0][P],
    end = Math.max.apply(
      null,
      ns.map(function (n) {
        return n[P] + n[D];
      }),
    ),
    tot = 0;
  ns.forEach(function (n) {
    tot += n[D];
  });
  var gap = (end - start - tot) / (ns.length - 1),
    cur = start;
  ns.forEach(function (n) {
    n[P] = Math.round(cur);
    cur += n[D] + gap;
  });
  renderAll();
}
export function overlaps(x, y, w, h) {
  return S.nodes.some(function (o) {
    var f = fam(o);
    if (isCont(o) || f === 'group') return false;
    return x < o.x + o.w + 12 && x + w + 12 > o.x && y < o.y + o.h + 12 && y + h + 12 > o.y;
  });
}

// ================= recents =================
export function recents() {
  try {
    var r = JSON.parse(lsGet('rancang:recent') || '[]');
    return Array.isArray(r)
      ? r.filter(function (t) {
          return T[t];
        })
      : [];
  } catch (e) {
    return [];
  }
}
export function addRecent(t) {
  var r = recents().filter(function (x) {
    return x !== t;
  });
  r.unshift(t);
  lsSet('rancang:recent', JSON.stringify(r.slice(0, 6)));
}

// ================= inline text editor =================
export var ed = null;
export function editBox(t) {
  if (t.k === 'n') {
    var n = byId(t.id);
    if (!n) return null;
    var f = fam(n),
      kk = T[n.t].k;
    if (t.f === 'attrs' || t.f === 'ops') {
      var L = classLayout(n),
        yy = n.y + L.hH + (t.f === 'ops' ? L.aH : 0);
      return { x: n.x + 4, y: yy + 3, w: n.w - 8, h: Math.max(44, (t.f === 'ops' ? L.oH : L.aH) - 6), left: 1 };
    }
    if (t.f === 'body') {
      if (n.t === 'er-table')
        return { x: n.x + 4, y: n.y + 38, w: Math.max(n.w - 8, 200), h: Math.max(60, n.h - 42), left: 1 };
      if (f === 'cell') {
        var hb = n.head === 'band' ? 38 : n.head === 'chev' ? 46 : n.head === 'none' ? 6 : 30;
        return { x: n.x + 6, y: n.y + hb, w: Math.max(n.w - 12, 140), h: Math.max(60, n.h - hb - 6), left: 1 };
      }
      if (f === 'c4') return { x: n.x + 6, y: n.y + n.h / 2, w: n.w - 12, h: Math.max(50, n.h / 2 - 6) };
      return { x: n.x + 6, y: n.y + n.h / 2 - 10, w: Math.max(n.w - 12, 140), h: Math.max(60, n.h / 2), left: 1 };
    }
    if (f === 'cell') return { x: n.x + 6, y: n.y + 4, w: Math.max(n.w - 12, 140), h: 34 };
    if (f === 'uml' && (kk === 'class' || kk === 'interface' || kk === 'enum'))
      return { x: n.x + 4, y: n.y + 4, w: n.w - 8, h: Math.max(34, classLayout(n).hH - 8) };
    if (n.t === 'er-table') return { x: n.x + 4, y: n.y + 3, w: n.w - 8, h: 30 };
    if (isLife(n)) return { x: n.x - 10, y: n.y + (n.t === 'u-seq-actor' ? 58 : 2), w: n.w + 20, h: 38 };
    if (f === 'uml' && (kk === 'actor' || kk === 'act-decision' || kk === 'choice'))
      return { x: n.x + n.w / 2 - 90, y: n.y + n.h + 3, w: 180, h: 44 };
    if (f === 'box') {
      if (kk === 'frame' || kk === 'phone') return { x: n.x, y: n.y - 28, w: 240, h: 30 };
      if (kk === 'c4b') return { x: n.x + 8, y: n.y + n.h - 44, w: 240, h: 30 };
      return { x: n.x + 8, y: n.y + 4, w: Math.max(160, Math.min(320, n.w - 16)), h: 30 };
    }
    if (
      f === 'mind' ||
      f === 'org' ||
      f === 'page' ||
      f === 'uml' ||
      f === 'er' ||
      f === 'dfd' ||
      f === 'c4' ||
      f === 'ux' ||
      f === 'wf' ||
      f === 'text'
    )
      return { x: n.x + 2, y: n.y + 2, w: Math.max(n.w - 4, 130), h: Math.max(n.h - 4, 36) };
    if (f === 'comp') {
      if (n.look === 'tile') return { x: n.x + n.w / 2 - 90, y: n.y + n.h + 3, w: 180, h: 44 };
      return { x: n.x + 56, y: n.y + 6, w: Math.max(n.w - 62, 110), h: Math.max(n.h - 12, 34) };
    }
    if (f === 'zone') return { x: n.x + 30, y: n.y + 5, w: Math.max(160, Math.min(320, n.w - 40)), h: 30 };
    if (f === 'task' || f === 'ann' || f === 'text' || f === 'group' || f === 'shape' || f === 'note')
      return { x: n.x + 4, y: n.y + 4, w: Math.max(n.w - 8, 120), h: Math.max(n.h - 8, 40) };
    if (f === 'pool') return { x: n.x, y: n.y, w: 240, h: 34 };
    return { x: n.x + n.w / 2 - 85, y: n.y + n.h + 4, w: 170, h: 44 };
  }
  if (t.k === 'e') {
    var e = eById(t.id);
    if (!e) return null;
    var pts = route(e);
    if (!pts) return null;
    var p = labelPoint(e, pts);
    return { x: p.x - 85, y: p.y - 19, w: 170, h: 38 };
  }
  var pl = byId(t.id);
  if (!pl || !pl.lanes || !pl.lanes[t.i]) return null;
  var yy = pl.y;
  for (var i = 0; i < t.i; i++) yy += pl.lanes[i].h;
  return { x: pl.x + 58, y: yy + 4, w: 190, h: 34 };
}
export function positionEditor() {
  if (!ed) return;
  var r = vr(),
    a = toClient(ed.box.x, ed.box.y),
    b = toClient(ed.box.x + ed.box.w, ed.box.y + ed.box.h);
  ed.ta.style.left = a.x - r.left + 'px';
  ed.ta.style.top = a.y - r.top + 'px';
  ed.ta.style.width = Math.max(90, b.x - a.x) + 'px';
  ed.ta.style.height = Math.max(30, b.y - a.y) + 'px';
  ed.ta.style.fontSize = clamp(13 * cam.z, 11, 26) + 'px';
}
export function startEdit(t) {
  commitEdit();
  var box = editBox(t);
  if (!box) return;
  var val;
  if (t.k === 'n') {
    var n = byId(t.id);
    val = n[t.f || 'label'] || '';
    set_selN([n.id]);
    set_selE(null);
  } else if (t.k === 'e') {
    var e = eById(t.id);
    val = e.label || '';
    set_selN([]);
    set_selE(e.id);
  } else {
    var pl = byId(t.id);
    val = pl.lanes[t.i].name;
    set_selN([pl.id]);
    set_selE(null);
  }
  var ta = document.createElement('textarea');
  ta.className = 'edit-ta';
  ta.value = val;
  ta.setAttribute('aria-label', 'Edit text');
  ta.style.fontFamily = FONT;
  if (box.left) ta.style.textAlign = 'left';
  stage.appendChild(ta);
  ed = { t: t, ta: ta, orig: val, box: box };
  positionEditor();
  ta.addEventListener('keydown', function (k) {
    var multi =
      t.f === 'body' ||
      t.f === 'attrs' ||
      t.f === 'ops' ||
      t.f === 'data' ||
      (t.k === 'n' && byId(t.id) && byId(t.id).t === 'rtext');
    if (k.key === 'Enter' && (multi ? k.ctrlKey || k.metaKey : !k.shiftKey)) {
      k.preventDefault();
      commitEdit();
    } else if (k.key === 'Escape') {
      k.preventDefault();
      ta.value = ed ? ed.orig : ta.value;
      commitEdit();
    } else if (k.key === 'Tab') {
      k.preventDefault();
      commitEdit();
    }
    k.stopPropagation();
  });
  ta.addEventListener('blur', function () {
    setTimeout(commitEdit, 0);
  });
  setTimeout(function () {
    ta.focus();
    ta.select();
  }, 0);
  renderOver();
  renderInsp();
}
export function commitEdit() {
  if (!ed) return;
  var e = ed;
  ed = null;
  var v = e.ta.value;
  if (v !== e.orig) {
    pushUndo();
    if (e.t.k === 'n') {
      var n = byId(e.t.id);
      if (n) n[e.t.f || 'label'] = v;
    } else if (e.t.k === 'e') {
      var x = eById(e.t.id);
      if (x) x.label = v;
    } else {
      var p = byId(e.t.id);
      if (p && p.lanes[e.t.i]) p.lanes[e.t.i].name = v;
    }
  }
  if (e.ta.parentNode) e.ta.parentNode.removeChild(e.ta);
  renderAll();
}

// ================= pointer interaction =================
export var drag = null;
export var spaceDown = false;
export var touches = {};
export var pinch = null;
export function nodeAtPoint(cx, cy, exclude) {
  var pe = over.style.pointerEvents;
  over.style.pointerEvents = 'none';
  var els = document.elementsFromPoint(cx, cy);
  over.style.pointerEvents = pe;
  for (var i = 0; i < els.length; i++) {
    var g = els[i].closest && els[i].closest('#content [data-id]');
    if (g && g.getAttribute('data-id') !== exclude) return g.getAttribute('data-id');
  }
  return null;
}
export function fieldAt__base(n, p) {
  var f = fam(n),
    k = T[n.t].k;
  if (f === 'zone') return p.y < n.y + 34 ? 'label' : null;
  if (f === 'box') {
    if (k === 'frame' || k === 'phone') return p.y < n.y + 4 ? 'label' : null;
    if (k === 'c4b') return p.y > n.y + n.h - 50 ? 'label' : null;
    return p.y < n.y + 34 ? 'label' : null;
  }
  if (f === 'pool') return 'label';
  if (f === 'uml' && (k === 'class' || k === 'interface' || k === 'enum')) {
    var L = classLayout(n);
    return p.y < n.y + L.hH ? 'label' : p.y < n.y + L.hH + L.aH ? 'attrs' : L.oH ? 'ops' : 'attrs';
  }
  if (n.t === 'er-table') return p.y < n.y + 36 ? 'label' : 'body';
  if (f === 'cell') {
    if (n.nobody) return 'label';
    var hb = n.head === 'none' ? 0 : n.head === 'band' ? 36 : n.head === 'chev' ? 42 : n.head === 'side' ? 0 : 30;
    if (n.head === 'side') return p.x < n.x + Math.min(n.sideW || 180, n.w * 0.45) ? 'label' : 'body';
    return p.y < n.y + hb ? 'label' : 'body';
  }
  if (f === 'c4') return 'label';
  if (f === 'draw') return null;
  if (n.t === 'u-state' && n.body) return p.y < n.y + 30 ? 'label' : 'body';
  return 'label';
}
export var fieldAt: typeof fieldAt__base = fieldAt__base;
export function set_fieldAt(v: typeof fieldAt__base) {
  return (fieldAt = v);
}
export function startPan(ev) {
  drag = { kind: 'pan', cx: ev.clientX, cy: ev.clientY, x: cam.x, y: cam.y };
  stage.classList.add('panning');
  try {
    svg.setPointerCapture(ev.pointerId);
  } catch (e) {}
}
export function moveSet(ids) {
  var set = {},
    list = [];
  function add(n) {
    if (!set[n.id]) {
      set[n.id] = 1;
      list.push(n);
    }
  }
  ids.forEach(function (id) {
    var n = byId(id);
    if (n) add(n);
  });
  list.slice().forEach(function (n) {
    if (isCont(n)) contents(n).forEach(add);
  });
  return { set: set, list: list };
}
// dragging a framework block moves its whole framework; dragging a tree node moves its subtree (hold Alt for just one)
export function dragSet(ids, alt) {
  var all = ids.slice();
  if (!alt)
    ids.forEach(function (id) {
      var n = byId(id);
      if (!n) return;
      if (n.grp)
        S.nodes.forEach(function (o) {
          if (o.grp === n.grp) all.push(o.id);
        });
      if (TREEF[fam(n)])
        subtree(n).forEach(function (o) {
          all.push(o.id);
        });
    });
  return moveSet(all);
}
export function guideSnap(bb, dx, dy, others) {
  var th = 6 / cam.z,
    gx = null,
    gy = null,
    bx = th + 1,
    by = th + 1;
  var mx = [bb.x + dx, bb.x + dx + bb.w / 2, bb.x + dx + bb.w],
    my = [bb.y + dy, bb.y + dy + bb.h / 2, bb.y + dy + bb.h];
  others.forEach(function (o) {
    var ox = [o.x, o.x + o.w / 2, o.x + o.w],
      oy = [o.y, o.y + o.h / 2, o.y + o.h];
    mx.forEach(function (a, i) {
      ox.forEach(function (b, j) {
        if ((i === 1) !== (j === 1)) return;
        var d = Math.abs(a - b);
        if (d < bx) {
          bx = d;
          gx = { d: b - a, x: b, o: o };
        }
      });
    });
    my.forEach(function (a, i) {
      oy.forEach(function (b, j) {
        if ((i === 1) !== (j === 1)) return;
        var d = Math.abs(a - b);
        if (d < by) {
          by = d;
          gy = { d: b - a, y: b, o: o };
        }
      });
    });
  });
  var res = { dx: dx, dy: dy, guides: [] };
  if (gx) {
    res.dx = dx + gx.d;
    var o = gx.o;
    res.guides.push({ x: gx.x, a: Math.min(o.y, bb.y + res.dy), b: Math.max(o.y + o.h, bb.y + res.dy + bb.h) });
  }
  if (gy) {
    res.dy = gy ? dy + gy.d : dy;
    var q = gy.o;
    res.guides.push({ y: gy.y, a: Math.min(q.x, bb.x + res.dx), b: Math.max(q.x + q.w, bb.x + res.dx + bb.w) });
  }
  return res;
}
export function endPointer(ev) {
  if (ev.pointerType === 'touch') {
    delete touches[ev.pointerId];
    if (pinch) {
      if (Object.keys(touches).length < 2) pinch = null;
      return;
    }
  }
  if (!drag) return;
  var d = drag;
  if (d.kind === 'pan') {
    drag = null;
    stage.classList.remove('panning');
    return;
  }
  if (d.kind === 'pen') {
    drag = null;
    if (d.pts.length > 1) {
      var x1 = Infinity,
        y1 = Infinity,
        x2 = -Infinity,
        y2 = -Infinity;
      d.pts.forEach(function (q) {
        x1 = Math.min(x1, q.x);
        y1 = Math.min(y1, q.y);
        x2 = Math.max(x2, q.x);
        y2 = Math.max(y2, q.y);
      });
      pushUndo();
      var bw = Math.max(1, x2 - x1),
        bh = Math.max(1, y2 - y1);
      S.nodes.push({
        id: nid(),
        t: 'draw',
        x: x1,
        y: y1,
        w: bw,
        h: bh,
        w0: bw,
        h0: bh,
        label: '',
        pts: d.pts.map(function (q) {
          return [r1(q.x - x1), r1(q.y - y1)];
        }),
      });
      render();
    } else renderOver();
    return;
  }
  if (d.kind === 'conn') {
    drag = null;
    if (d.seq) {
      var tb = d.moved && d.target ? byId(d.target) : null,
        la = byId(d.id);
      if (tb && isLife(tb) && la) {
        pushUndo();
        var y0 = d.from.y,
          fs = $('flowSel').value;
        var me = {
          id: 'e' + S.seq++,
          from: la.id,
          to: tb.id,
          type: fs === 'auto' ? 'umsg' : fs,
          label: '',
          route: 'straight',
          fromAnchor: { x: 0.5, y: clamp((y0 - la.y) / la.h, 0.1, 0.995) },
          toAnchor: { x: 0.5, y: clamp((y0 - tb.y) / tb.h, 0.1, 0.995) },
        };
        S.edges.push(me);
        setSel([], me.id);
        renderAll();
        startEdit({ k: 'e', id: me.id });
        return;
      }
      renderOver();
      return;
    }
    if (d.moved && d.target && d.target !== d.id) {
      pushUndo();
      var e = addEdge(d.id, d.target);
      setSel([], e && e.id);
      renderAll();
      return;
    }
    if (d.clickConn && !d.moved) {
      set_connSrc(d.id);
      set_selN([d.id]);
      set_selE(null);
      renderOver();
      renderInsp();
      toast('Now click the target shape');
      return;
    }
    if (!d.clickConn) {
      var src = byId(d.id);
      if (!d.moved) openQuick({ from: d.id, side: d.side, client: { x: ev.clientX, y: ev.clientY } });
      else if (src) openQuick({ from: d.id, at: d.cur, client: { x: ev.clientX, y: ev.clientY } });
    }
    renderOver();
    return;
  }
  if (d.kind === 'endpoint' && d.moved) {
    var edge = eById(d.id),
      opposite = d.start ? edge.to : edge.from,
      tid = nodeAtPoint(ev.clientX, ev.clientY, opposite);
    if (tid) setEdgePoint(edge, d.start, pt(ev), byId(tid));
    drag = null;
    renderAll();
    return;
  }
  if (d.kind === 'marquee') {
    drag = null;
    renderOver();
    renderInsp();
    return;
  }
  drag = null;
  if (d.moved) renderAll();
  else renderOver();
}

// ================= tools =================
export function setTool(t) {
  set_tool(t);
  set_connSrc(null);
  document.querySelectorAll('[data-tool]').forEach(function (b) {
    b.classList.toggle('on', b.getAttribute('data-tool') === t);
  });
  stage.classList.toggle('tool-hand', t === 'hand');
  stage.classList.toggle('tool-connect', t === 'connect');
  stage.classList.toggle('tool-pen', t === 'pen');
  if (t === 'connect') toast('Connect: drag from one shape to another, or click source then target');
  if (t === 'pen') toast('Pen: drag to draw. Press V to go back to select.');
  renderOver();
}

// ================= quick add =================
export var quick = null;
export var quickSel = 0;
export var quickList = [];
export function searchTypes(q) {
  var terms = q.toLowerCase().split(/\s+/).filter(Boolean),
    res = [];
  Object.keys(T).forEach(function (k) {
    var d = T[k],
      hay = (
        d.n +
        ' ' +
        k +
        ' ' +
        (d.kw || '') +
        ' ' +
        (FAM_LABEL[d.f] || '') +
        ' ' +
        (d.cat && CAT[d.cat] ? CAT[d.cat].n : '')
      ).toLowerCase();
    if (
      terms.every(function (t) {
        return hay.indexOf(t) >= 0;
      })
    )
      res.push({ k: k, score: d.n.toLowerCase().indexOf(terms[0]) === 0 ? 0 : 1 });
  });
  res.sort(function (a, b) {
    return a.score - b.score;
  });
  return res.map(function (r) {
    return r.k;
  });
}
export var AI_CATS = { trigger: 1, logic: 1, agent: 1, ai: 1, rag: 1, mem: 1, safe: 1 };
export var SEC_FAM = {
  uml: ['u-usecase', 'u-act-action', 'u-act-decision', 'u-state', 'u-class', 'u-actor', 'u-act-final', 'u-choice'],
  er: ['er-table', 'er-entity', 'er-attr', 'er-key', 'er-rel'],
  dfd: ['dfd-proc', 'dfd-store', 'dfd-ext', 'dfd-procgs'],
  c4: ['c4-container', 'c4-db', 'c4-component', 'c4-system', 'c4-ext', 'c4-person'],
  wf: ['wf-button', 'wf-input', 'wf-text', 'wf-card', 'wf-image', 'wf-list'],
  ux: ['ux-screen', 'fc-decision', 'fc-terminal'],
  cell: ['k-cell', 'nt-yellow', 'text'],
};
export function quickDefaults() {
  var from = quick && quick.from && byId(quick.from),
    f = from ? fam(from) : null,
    base;
  if (f && BPMN_FAM[f])
    base = ['task', 'gw-xor', 'gw-and', 'end', 'inter-timer', 'task-user', 'data-store', 'inter-msg'];
  else if (f === 'shape')
    base = ['fc-process', 'fc-decision', 'fc-io', 'fc-terminal', 'fc-db', 'fc-doc', 'fc-lgend', 'fc-note'];
  else if (f === 'comp' && AI_CATS[T[from.t].cat])
    base = ['c-a-agent', 'c-a-tool', 'c-chat', 'c-l-if', 'c-l-http', 'c-retriever', 'c-a-human', 'fc-lgend'];
  else if (from && SEC_FAM[f]) base = SEC_FAM[f];
  else {
    base = [];
    (DT[dtOf()].pal || []).forEach(function (sid) {
      ((SEC[sid] || {}).keys || []).slice(0, 4).forEach(function (k) {
        if (T[k] && base.indexOf(k) < 0) base.push(k);
      });
    });
    if (!base.length) base = ['c-service', 'c-sql', 'c-cache', 'c-queue', 'c-lb', 'c-apigw', 'c-worker', 'c-storage'];
  }
  var out = [];
  recents()
    .concat(base)
    .forEach(function (t) {
      if (out.indexOf(t) < 0) out.push(t);
    });
  return out.slice(0, 10);
}
export function miniPreview(t) {
  var d = T[t],
    f = d.f,
    n;
  if (f === 'comp') {
    n = { id: 'p', t: t, x: 0, y: 0, w: 40, h: 40, look: 'tile', label: '' };
    return '<svg viewBox="-3 -3 46 46" aria-hidden="true">' + drawComp(n, true) + '</svg>';
  }
  return previewSvg(t);
}
export function renderQuick() {
  var q = $('quickQ').value.trim();
  quickList = q ? searchTypes(q).slice(0, 14) : quickDefaults();
  if (quickSel >= quickList.length) quickSel = 0;
  var s = q ? '' : '<li class="qh">Suggested</li>';
  quickList.forEach(function (t, i) {
    s +=
      '<li><button type="button" role="option" data-q="' +
      t +
      '" class="' +
      (i === quickSel ? 'on' : '') +
      '">' +
      miniPreview(t) +
      '<span>' +
      esc(T[t].n) +
      '</span></button></li>';
  });
  if (!quickList.length) s = '<li class="qh">No match</li>';
  $('quickList').innerHTML = s;
}
export function openQuick(o) {
  closeMenus();
  quick = o;
  quickSel = 0;
  var el = $('quick'),
    r = stage.getBoundingClientRect();
  el.hidden = false;
  var x = clamp(o.client.x - r.left + 10, 8, Math.max(8, r.width - 262)),
    y = clamp(o.client.y - r.top + 10, 8, Math.max(8, r.height - 350));
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  $('quickQ').value = '';
  renderQuick();
  setTimeout(function () {
    $('quickQ').focus();
  }, 0);
}
export function closeQuick() {
  $('quick').hidden = true;
  quick = null;
}
export function placeNear(from, t, side, look) {
  var sz = look === 'tile' ? [64, 64] : size(t),
    c = center(from),
    gap = 80,
    x,
    y;
  side = side || 'R';
  var fh = fam(from) === 'comp' && from.look === 'tile' && from.label ? from.h + 30 : from.h;
  if (side === 'R') {
    x = from.x + from.w + gap + sz[0] / 2;
    y = c.y;
  } else if (side === 'L') {
    x = from.x - gap - sz[0] / 2;
    y = c.y;
  } else if (side === 'T') {
    x = c.x;
    y = from.y - gap - sz[1] / 2;
  } else {
    x = c.x;
    y = from.y + fh + gap + sz[1] / 2;
  }
  var guard = 0;
  while (overlaps(snap(x - sz[0] / 2), snap(y - sz[1] / 2), sz[0], sz[1]) && guard++ < 20) {
    if (side === 'R' || side === 'L') y += sz[1] + 40;
    else x += sz[0] + 40;
  }
  return { x: x, y: y };
}
export function pickQuick(t) {
  var o = quick;
  closeQuick();
  if (!o || !T[t]) return;
  pushUndo();
  var from = o.from && byId(o.from),
    look = from && fam(from) === 'comp' && from.look === 'tile' && T[t].f === 'comp' ? 'tile' : null;
  var p = o.at || (from ? placeNear(from, t, o.side, look) : viewCenter());
  var n = addNode(t, p.x, p.y, look ? { look: 'tile' } : null);
  if (from) {
    var e = addEdge(from.id, n.id);
    if (e && (o.side === 'L' || o.side === 'T') && from.t !== 'fc-lgstart') {
      var tmp = e.from;
      e.from = e.to;
      e.to = tmp;
    }
  }
  addRecent(t);
  set_selN([n.id]);
  set_selE(null);
  renderAll();
  var f = fam(n);
  if (f !== 'zone' && f !== 'pool' && n.t !== 'fc-lgstart' && n.t !== 'fc-lgend') startEdit({ k: 'n', id: n.id });
}

// ================= context menu =================
export function openCtx(ev) {
  closeMenus();
  var ng = ev.target.closest('[data-id]'),
    eg = ev.target.closest('[data-eid]'),
    p = pt(ev),
    client = { x: ev.clientX, y: ev.clientY },
    items;
  if (ng) {
    var id = ng.getAttribute('data-id');
    if (!isSel(id)) setSel([id]);
  } else if (eg) setSel([], eg.getAttribute('data-eid'));
  else setSel([]);
  if (selN.length || selE) {
    items = [
      [
        'pencil',
        'Edit text',
        'Enter',
        function () {
          if (single()) startEdit({ k: 'n', id: selN[0] });
          else if (selE) startEdit({ k: 'e', id: selE });
        },
      ],
      ['copy', 'Duplicate', 'Ctrl+D', dupSel],
      [
        'clipboard-copy',
        'Copy',
        'Ctrl+C',
        function () {
          copySel();
          toast('Copied');
        },
      ],
      [
        'clipboard-copy',
        'Paste here',
        'Ctrl+V',
        function () {
          pasteClip(p);
        },
      ],
      '-',
      ['arrow-up-to-line', 'Bring to front', 'Ctrl+]', toFront],
      ['arrow-down-to-line', 'Send to back', 'Ctrl+[', toBack],
      '-',
      [
        'trash-2',
        'Delete',
        'Del',
        function () {
          pushUndo();
          delSel();
          renderAll();
        },
      ],
    ];
  } else {
    items = [
      [
        'plus',
        'Add shape here…',
        'Dbl-click',
        function () {
          openQuick({ at: p, client: client });
        },
      ],
      [
        'clipboard-copy',
        'Paste here',
        'Ctrl+V',
        function () {
          pasteClip(p);
        },
      ],
      '-',
      [
        'square-dashed',
        'Select all',
        'Ctrl+A',
        function () {
          setSel(
            S.nodes.map(function (n) {
              return n.id;
            }),
          );
        },
      ],
      ['maximize', 'Fit to screen', 'Shift+1', fitView],
    ];
  }
  var el = $('ctx'),
    r = stage.getBoundingClientRect();
  el.innerHTML = items
    .map(function (it, i) {
      return it === '-'
        ? '<hr>'
        : '<button type="button" role="menuitem" data-ci="' +
            i +
            '">' +
            ic(it[0]) +
            '<span>' +
            esc(it[1]) +
            '</span><span class="k">' +
            esc(it[2]) +
            '</span></button>';
    })
    .join('');
  el.hidden = false;
  el.style.left = clamp(ev.clientX - r.left, 6, Math.max(6, r.width - 218)) + 'px';
  el.style.top = clamp(ev.clientY - r.top, 6, Math.max(6, r.height - el.offsetHeight - 6)) + 'px';
  el.onclick = function (e2) {
    var b = e2.target.closest('[data-ci]');
    if (!b) return;
    var it = items[+b.getAttribute('data-ci')];
    el.hidden = true;
    it[3]();
  };
}
export function closeMenus__base() {
  $('ctx').hidden = true;
  closeDtPop();
  if (!$('quick').hidden) closeQuick();
  if (!$('exportMenu').hidden) {
    $('exportMenu').hidden = true;
    $('btnExport').setAttribute('aria-expanded', 'false');
  }
}
export var closeMenus: typeof closeMenus__base = closeMenus__base;
export function set_closeMenus(v: typeof closeMenus__base) {
  return (closeMenus = v);
}

export function install(): void {
  svg = $('svg');
  stage = $('stage');
  content = $('content');
  over = $('over');
  measureG = $('measure');
  mdefs = $('mdefs');
  bgRect = $('bg');
  inspBody = $('inspBody');
  palBody = $('palBody');
  toastEl = $('toast');
  miniSvg = $('miniSvg');
  (function () {
    var down = false;
    function go(ev) {
      var m = (miniSvg as unknown as SVGGraphicsElement).getScreenCTM();
      if (!m) return;
      var p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m.inverse()),
        r = vr();
      cam.x = p.x - r.width / 2 / cam.z;
      cam.y = p.y - r.height / 2 / cam.z;
      applyCam();
      renderOver();
    }
    miniSvg.addEventListener('pointerdown', function (ev) {
      down = true;
      miniSvg.setPointerCapture(ev.pointerId);
      go(ev);
    });
    miniSvg.addEventListener('pointermove', function (ev) {
      if (down) go(ev);
    });
    miniSvg.addEventListener('pointerup', function () {
      down = false;
    });
  })();
  svg.addEventListener('pointerdown', function (ev) {
    closeMenus();
    if (ev.pointerType === 'touch') {
      touches[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      var ids = Object.keys(touches);
      if (ids.length === 2) {
        if (drag && drag.moved && drag.before) {
          restore(drag.before);
          undo.pop();
        }
        var a = touches[ids[0]],
          b = touches[ids[1]],
          r = vr(),
          mx = (a.x + b.x) / 2,
          my = (a.y + b.y) / 2;
        pinch = {
          d: Math.hypot(a.x - b.x, a.y - b.y) || 1,
          z: cam.z,
          wx: cam.x + (mx - r.left) / cam.z,
          wy: cam.y + (my - r.top) / cam.z,
        };
        drag = null;
        return;
      }
    }
    if (ev.button === 2) return;
    commitEdit();
    var p = pt(ev);
    if (ev.button === 1 || spaceDown || tool === 'hand') {
      ev.preventDefault();
      startPan(ev);
      return;
    }
    if (ev.button !== 0) return;
    if (tool === 'pen') {
      drag = { kind: 'pen', pts: [p] };
      try {
        svg.setPointerCapture(ev.pointerId);
      } catch (e) {}
      ev.preventDefault();
      return;
    }
    var h = (ev.target as HTMLInputElement).closest('[data-h]'),
      eg = (ev.target as HTMLInputElement).closest('[data-eid]'),
      ng = (ev.target as HTMLInputElement).closest('[data-id]');
    if (h) {
      var kind = h.getAttribute('data-h');
      if (kind === 'port') {
        var pn = byId(h.getAttribute('data-nid'));
        if (!pn) return;
        var c = h.querySelector('circle');
        drag = {
          kind: 'conn',
          id: pn.id,
          side: h.getAttribute('data-side'),
          from: { x: +c.getAttribute('cx'), y: +c.getAttribute('cy') },
          cur: p,
          sx: ev.clientX,
          sy: ev.clientY,
          moved: false,
        };
      } else if (kind.indexOf('rs-') === 0) {
        var rn = single();
        if (!rn) return;
        drag = {
          kind: 'resize',
          id: rn.id,
          corner: kind.slice(3),
          sx: p.x,
          sy: p.y,
          o: { x: rn.x, y: rn.y, w: rn.w, h: rn.h },
          lanes: rn.lanes
            ? rn.lanes.map(function (l) {
                return l.h;
              })
            : null,
          moved: false,
        };
      } else if (kind === 'start' || kind === 'end') {
        drag = {
          kind: 'endpoint',
          id: selE,
          start: kind === 'start',
          sx: p.x,
          sy: p.y,
          before: snapshot(),
          moved: false,
        };
      } else if (kind === 'mid') {
        var me = eById(selE),
          mp = route(me);
        drag = {
          kind: 'mid',
          id: me.id,
          horiz: Math.abs(mp[1].y - mp[2].y) > Math.abs(mp[1].x - mp[2].x),
          moved: false,
        };
      }
      try {
        svg.setPointerCapture(ev.pointerId);
      } catch (e) {}
      ev.preventDefault();
      renderOver();
      return;
    }
    if (tool === 'connect' && ng) {
      var cid = ng.getAttribute('data-id');
      if (connSrc && connSrc !== cid) {
        pushUndo();
        var ce = addEdge(connSrc, cid);
        set_connSrc(null);
        setSel([], ce && ce.id);
        renderAll();
        return;
      }
      drag = { kind: 'conn', id: cid, cur: p, sx: ev.clientX, sy: ev.clientY, moved: false, clickConn: true };
      try {
        svg.setPointerCapture(ev.pointerId);
      } catch (e) {}
      ev.preventDefault();
      return;
    }
    if (eg && !ng) {
      setSel([], eg.getAttribute('data-eid'));
      var edge = eById(selE),
        epts = route(edge);
      if (epts && !edge.from && !edge.to) {
        drag = {
          kind: 'edge-move',
          id: edge.id,
          sx: p.x,
          sy: p.y,
          points: epts,
          mx: edge.mx,
          my: edge.my,
          before: snapshot(),
          moved: false,
        };
        try {
          svg.setPointerCapture(ev.pointerId);
        } catch (e) {}
        ev.preventDefault();
      }
      return;
    }
    if (ng && tool === 'select' && !(ev.shiftKey || ev.metaKey || ev.ctrlKey)) {
      var ln = byId(ng.getAttribute('data-id'));
      if (
        isLife(ln) &&
        p.y > ln.y + (ln.t === 'u-seq-actor' ? 84 : 42) &&
        Math.abs(p.x - (ln.x + ln.w / 2)) <= 10 + 4 / cam.z
      ) {
        drag = {
          kind: 'conn',
          id: ln.id,
          seq: 1,
          from: { x: ln.x + ln.w / 2, y: p.y },
          cur: p,
          sx: ev.clientX,
          sy: ev.clientY,
          moved: false,
        };
        try {
          svg.setPointerCapture(ev.pointerId);
        } catch (e) {}
        ev.preventDefault();
        renderOver();
        return;
      }
    }
    if (ng) {
      var id = ng.getAttribute('data-id'),
        additive = ev.shiftKey || ev.metaKey || ev.ctrlKey;
      if (additive) {
        if (isSel(id)) {
          set_selN(
            selN.filter(function (x) {
              return x !== id;
            }),
          );
          set_selE(null);
          renderOver();
          renderInsp();
          return;
        }
        set_selN(selN.concat([id]));
        set_selE(null);
      } else if (!isSel(id)) {
        set_selN([id]);
        set_selE(null);
      } else set_selE(null);
      renderInsp();
      var ms = dragSet(selN, ev.altKey),
        lead = byId(id);
      var others = S.nodes.filter(function (o) {
        return !ms.set[o.id] && !isCont(o) && fam(o) !== 'group';
      });
      drag = {
        kind: 'move',
        sx: p.x,
        sy: p.y,
        lead: lead,
        lx: lead.x,
        ly: lead.y,
        items: ms.list.map(function (o) {
          return { n: o, x: o.x, y: o.y };
        }),
        eitems: S.edges
          .filter(function (e) {
            return ms.set[e.from] || ms.set[e.to];
          })
          .map(function (e) {
            return { e: e, mx: e.mx, my: e.my, both: !!(ms.set[e.from] && ms.set[e.to]) };
          }),
        bb: bounds(
          ms.list.filter(function (o) {
            return !isCont(o) || isSel(o.id);
          }),
          [],
        ),
        others: others,
        before: snapshot(),
        moved: false,
        pointerType: ev.pointerType,
      };
      try {
        svg.setPointerCapture(ev.pointerId);
      } catch (e) {}
      ev.preventDefault();
      renderOver();
      return;
    }
    if (ev.pointerType === 'touch') {
      startPan(ev);
      return;
    }
    set_connSrc(null);
    var add = ev.shiftKey || ev.metaKey || ev.ctrlKey;
    drag = { kind: 'marquee', sx: p.x, sy: p.y, cur: null, base: add ? selN.slice() : [], moved: false };
    if (!add) {
      set_selN([]);
      set_selE(null);
      renderInsp();
    }
    try {
      svg.setPointerCapture(ev.pointerId);
    } catch (e) {}
    renderOver();
  });
  svg.addEventListener('pointermove', function (ev) {
    if (ev.pointerType === 'touch' && touches[ev.pointerId]) {
      touches[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      if (pinch) {
        var ids = Object.keys(touches);
        if (ids.length >= 2) {
          var a = touches[ids[0]],
            b = touches[ids[1]],
            r = vr(),
            mx = (a.x + b.x) / 2,
            my = (a.y + b.y) / 2,
            z = clamp((pinch.z * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.d, 0.1, 4);
          cam.z = z;
          cam.x = pinch.wx - (mx - r.left) / z;
          cam.y = pinch.wy - (my - r.top) / z;
          applyCam();
          renderOver();
        }
        return;
      }
    }
    if (!drag) {
      var g =
          (ev.target as HTMLInputElement).closest('[data-id]') || (ev.target as HTMLInputElement).closest('[data-nid]'),
        hid = g ? g.getAttribute('data-id') || g.getAttribute('data-nid') : null;
      if (hid !== hoverId) {
        set_hoverId(hid);
        renderOver();
      }
      return;
    }
    var p = pt(ev);
    if (drag.kind === 'pan') {
      cam.x = drag.x - (ev.clientX - drag.cx) / cam.z;
      cam.y = drag.y - (ev.clientY - drag.cy) / cam.z;
      applyCam();
      renderOver();
      return;
    }
    if (drag.kind === 'pen') {
      var lp = drag.pts[drag.pts.length - 1];
      if (Math.hypot(p.x - lp.x, p.y - lp.y) > 1.5 / cam.z) {
        drag.pts.push(p);
        renderOver();
      }
      return;
    }
    if (drag.kind === 'conn') {
      if (!drag.moved && Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy) > 4) drag.moved = true;
      if (drag.seq) {
        drag.cur = { x: p.x, y: drag.from.y };
        var cc = toClient(p.x, drag.from.y);
        drag.target = drag.moved ? nodeAtPoint(cc.x, cc.y, drag.id) : null;
      } else {
        drag.cur = p;
        drag.target = drag.moved ? nodeAtPoint(ev.clientX, ev.clientY, drag.id) : null;
      }
      renderOver();
      return;
    }
    if (drag.kind === 'marquee') {
      drag.cur = p;
      if (!drag.moved && Math.abs(p.x - drag.sx) + Math.abs(p.y - drag.sy) > 3 / cam.z) drag.moved = true;
      var x1 = Math.min(drag.sx, p.x),
        y1 = Math.min(drag.sy, p.y),
        x2 = Math.max(drag.sx, p.x),
        y2 = Math.max(drag.sy, p.y),
        hit = [];
      S.nodes.forEach(function (n) {
        var full = n.x >= x1 && n.y >= y1 && n.x + n.w <= x2 && n.y + n.h <= y2,
          touch = n.x < x2 && n.x + n.w > x1 && n.y < y2 && n.y + n.h > y1;
        if (isCont(n) || fam(n) === 'group' ? full : touch) hit.push(n.id);
      });
      set_selN(
        drag.base.concat(
          hit.filter(function (id) {
            return drag.base.indexOf(id) < 0;
          }),
        ),
      );
      renderOver();
      return;
    }
    if (drag.kind === 'endpoint') {
      if (!drag.moved) {
        if (Math.abs(p.x - drag.sx) + Math.abs(p.y - drag.sy) < 3 / cam.z) return;
        pushUndo();
        drag.moved = true;
      }
      var ed1 = eById(drag.id);
      setEdgePoint(ed1, drag.start, p, null);
      drag.target = nodeAtPoint(ev.clientX, ev.clientY, drag.start ? ed1.to : ed1.from);
      render();
      return;
    }
    if (drag.kind === 'edge-move') {
      var dx = snap(p.x - drag.sx),
        dy = snap(p.y - drag.sy),
        pts = drag.points;
      if (!drag.moved) {
        if (Math.abs(dx) + Math.abs(dy) < 3) return;
        pushUndo();
        drag.moved = true;
      }
      var em = eById(drag.id);
      setEdgePoint(em, true, { x: pts[0].x + dx, y: pts[0].y + dy }, null);
      setEdgePoint(em, false, { x: pts[pts.length - 1].x + dx, y: pts[pts.length - 1].y + dy }, null);
      if (drag.mx != null) em.mx = drag.mx + dx;
      if (drag.my != null) em.my = drag.my + dy;
      render();
      return;
    }
    if (drag.kind === 'move') {
      var mdx = p.x - drag.sx,
        mdy = p.y - drag.sy;
      if (!drag.moved) {
        if (Math.abs(mdx) + Math.abs(mdy) < 3 / cam.z) return;
        pushUndo();
        drag.moved = true;
      }
      var ddx = mdx,
        ddy = mdy;
      if (grid) {
        ddx = snap(drag.lx + mdx) - drag.lx;
        ddy = snap(drag.ly + mdy) - drag.ly;
      }
      drag.guides = null;
      if (grid && !ev.altKey && drag.bb && drag.others.length && drag.items.length < 60) {
        var gs = guideSnap(drag.bb, ddx, ddy, drag.others);
        ddx = gs.dx;
        ddy = gs.dy;
        drag.guides = gs.guides;
      }
      drag.items.forEach(function (it) {
        it.n.x = Math.round(it.x + ddx);
        it.n.y = Math.round(it.y + ddy);
      });
      drag.eitems.forEach(function (it) {
        var f = it.both ? 1 : 0.5;
        if (it.mx != null) it.e.mx = it.mx + ddx * f;
        if (it.my != null) it.e.my = it.my + ddy * f;
      });
      render();
      return;
    }
    if (drag.kind === 'resize') {
      if (!drag.moved) {
        pushUndo();
        drag.moved = true;
      }
      var n = byId(drag.id),
        o = drag.o,
        c = drag.corner,
        dX = p.x - drag.sx,
        dY = p.y - drag.sy,
        f = fam(n);
      var L = o.x,
        R = o.x + o.w,
        Tt = o.y,
        B = o.y + o.h;
      if (c.indexOf('w') >= 0) L = snap(o.x + dX);
      if (c.indexOf('e') >= 0) R = snap(o.x + o.w + dX);
      if (c.indexOf('n') >= 0) Tt = snap(o.y + dY);
      if (c.indexOf('s') >= 0) B = snap(o.y + o.h + dY);
      var minW = f === 'pool' ? 200 : f === 'zone' ? 120 : 30,
        minH = f === 'pool' && n.lanes && n.lanes.length ? n.lanes.length * 50 : 20;
      if (R - L < minW) {
        if (c.indexOf('w') >= 0) L = R - minW;
        else R = L + minW;
      }
      if (B - Tt < minH) {
        if (c.indexOf('n') >= 0) Tt = B - minH;
        else B = Tt + minH;
      }
      n.x = L;
      n.w = R - L;
      n.y = Tt;
      if (f === 'pool' && n.lanes && n.lanes.length) {
        var sc = (B - Tt) / o.h;
        n.lanes.forEach(function (l, i) {
          l.h = Math.max(50, snap(drag.lanes[i] * sc));
        });
        syncPool(n);
      } else n.h = B - Tt;
      render();
      return;
    }
    if (drag.kind === 'mid') {
      if (!drag.moved) {
        pushUndo();
        drag.moved = true;
      }
      var me = eById(drag.id);
      if (drag.horiz) me.mx = snap(p.x);
      else me.my = snap(p.y);
      render();
      return;
    }
  });
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', function (ev) {
    if (ev.pointerType === 'touch') delete touches[ev.pointerId];
    if (drag && drag.before && drag.moved) {
      var b = drag.before;
      drag = null;
      if (undo[undo.length - 1] === b) undo.pop();
      restore(b);
    } else {
      drag = null;
      stage.classList.remove('panning');
      renderOver();
    }
  });
  svg.addEventListener('pointerleave', function () {
    if (!drag && hoverId) {
      set_hoverId(null);
      renderOver();
    }
  });
  // Hit-test the real point: pointer capture from the first click retargets dblclick to the svg itself.
  svg.addEventListener('dblclick', function (ev) {
    if (tool === 'pen') return;
    var els = document.elementsFromPoint(ev.clientX, ev.clientY);
    function top(sel) {
      for (var i = 0; i < els.length; i++) {
        var g = els[i].closest && els[i].closest(sel);
        if (g) return { g: g, i: i };
      }
      return null;
    }
    var L = top('#content [data-lane]'),
      N = top('#content [data-id]'),
      E = top('#content [data-eid]'),
      dp = pt(ev),
      at = { at: dp, client: { x: ev.clientX, y: ev.clientY } };
    if (L && N && L.i <= N.i) {
      startEdit({ k: 'lane', id: N.g.getAttribute('data-id'), i: +L.g.getAttribute('data-lane') });
      return;
    }
    if (E && (!N || E.i < N.i)) {
      startEdit({ k: 'e', id: E.g.getAttribute('data-eid') });
      return;
    }
    if (N) {
      var n = byId(N.g.getAttribute('data-id'));
      if (n) {
        var fld = fieldAt(n, dp);
        if (fld) {
          startEdit({ k: 'n', id: n.id, f: fld });
          return;
        }
      }
    }
    openQuick(at);
  });
  svg.addEventListener('contextmenu', function (ev) {
    ev.preventDefault();
    openCtx(ev);
  });
  stage.addEventListener(
    'wheel',
    function (ev) {
      if (
        (ev.target as HTMLInputElement).closest('.pop') ||
        (ev.target as HTMLInputElement).closest('.island') ||
        (ev.target as HTMLInputElement).closest('.edit-ta')
      )
        return;
      ev.preventDefault();
      if (ev.ctrlKey || ev.metaKey) {
        zoomAt(ev.clientX, ev.clientY, cam.z * Math.exp(-ev.deltaY * (ev.deltaMode === 1 ? 0.05 : 0.0022)));
        return;
      }
      var k = ev.deltaMode === 1 ? 18 : ev.deltaMode === 2 ? 400 : 1,
        dx = ev.deltaX * k,
        dy = ev.deltaY * k;
      if (ev.shiftKey && !dx) {
        dx = dy;
        dy = 0;
      }
      cam.x += dx / cam.z;
      cam.y += dy / cam.z;
      applyCam();
      renderOver();
    },
    { passive: false },
  );
  if (window.ResizeObserver)
    new ResizeObserver(function () {
      applyCam();
      renderOver();
    }).observe(stage);
  $('quickQ').addEventListener('input', function () {
    quickSel = 0;
    renderQuick();
  });
  $('quickQ').addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      quickSel = Math.min(quickList.length - 1, quickSel + 1);
      renderQuick();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      quickSel = Math.max(0, quickSel - 1);
      renderQuick();
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      if (quickList[quickSel]) pickQuick(quickList[quickSel]);
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      closeQuick();
    }
    ev.stopPropagation();
  });
  $('quickList').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-q]');
    if (b) pickQuick(b.getAttribute('data-q'));
  });
  document.addEventListener(
    'pointerdown',
    function (ev) {
      if (!(ev.target as HTMLInputElement).closest('#ctx')) $('ctx').hidden = true;
      if (
        !(ev.target as HTMLInputElement).closest('#quick') &&
        !(ev.target as HTMLInputElement).closest('[data-h=port]') &&
        !$('quick').hidden &&
        !(ev.target as HTMLInputElement).closest('#svg')
      )
        closeQuick();
      if (!(ev.target as HTMLInputElement).closest('.menu-wrap') && !$('exportMenu').hidden) {
        $('exportMenu').hidden = true;
        $('btnExport').setAttribute('aria-expanded', 'false');
      }
    },
    true,
  );

  // ================= keyboard =================
  document.addEventListener('keydown', function (ev) {
    if (!$('scrim').hidden) {
      if (ev.key === 'Escape') closeModal();
      return;
    }
    if (isTyping()) return;
    var mod = ev.ctrlKey || ev.metaKey,
      k = ev.key;
    if (k === ' ') {
      if (!spaceDown) {
        spaceDown = true;
        stage.classList.add('pan-ready');
      }
      ev.preventDefault();
      return;
    }
    if (mod && (k === 'z' || k === 'Z') && !ev.shiftKey) {
      ev.preventDefault();
      doUndo();
    } else if (mod && (k === 'y' || k === 'Y' || ((k === 'z' || k === 'Z') && ev.shiftKey))) {
      ev.preventDefault();
      doRedo();
    } else if (mod && (k === 'd' || k === 'D')) {
      ev.preventDefault();
      dupSel();
    } else if (mod && (k === 'c' || k === 'C')) {
      if (copySel()) {
        ev.preventDefault();
        toast('Copied');
      }
    } else if (mod && (k === 'x' || k === 'X')) {
      if (copySel()) {
        ev.preventDefault();
        pushUndo();
        delSel();
        renderAll();
      }
    } else if (mod && (k === 'v' || k === 'V')) {
      if (clip) {
        ev.preventDefault();
        pasteClip();
      }
    } else if (mod && (k === 'a' || k === 'A')) {
      ev.preventDefault();
      setSel(
        S.nodes.map(function (n) {
          return n.id;
        }),
      );
    } else if (mod && (k === 's' || k === 'S')) {
      ev.preventDefault();
      saveNow(true);
      toast(DOC.id ? 'Saved' : 'Nothing to save yet');
    } else if (mod && k === '0') {
      ev.preventDefault();
      var r = vr();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1);
    } else if (mod && k === ']') {
      ev.preventDefault();
      toFront();
    } else if (mod && k === '[') {
      ev.preventDefault();
      toBack();
    } else if (mod) return;
    else if (k === '!' || (ev.shiftKey && ev.code === 'Digit1')) {
      ev.preventDefault();
      fitView();
    } else if (k === '@' || (ev.shiftKey && ev.code === 'Digit2')) {
      ev.preventDefault();
      var sb = bounds(selN.map(byId).filter(Boolean), []);
      if (sb) fitTo(sb, 2);
    } else if (k === '+' || k === '=') {
      ev.preventDefault();
      zoomBy(1.2);
    } else if (k === '-' || k === '_') {
      ev.preventDefault();
      zoomBy(1 / 1.2);
    } else if (k === 'Delete' || k === 'Backspace') {
      if (selN.length || selE) {
        ev.preventDefault();
        pushUndo();
        delSel();
        renderAll();
      }
    } else if (k === 'Escape') {
      if (drag && drag.before && drag.moved) {
        var b = drag.before;
        drag = null;
        if (undo[undo.length - 1] === b) undo.pop();
        restore(b);
      } else drag = null;
      set_connSrc(null);
      closeMenus();
      if (tool !== 'select') setTool('select');
      setSel([]);
      $('findings').hidden = true;
    } else if (k === 'Tab') {
      var to = single();
      if (to && TREEF[fam(to)]) {
        ev.preventDefault();
        treeAdd(to, 'child');
      }
    } else if (k === 'Enter' || k === 'F2') {
      var o = single();
      if (o) {
        ev.preventDefault();
        if (k === 'Enter' && TREEF[fam(o)]) treeAdd(o, 'sibling');
        else startEdit({ k: 'n', id: o.id, f: fam(o) === 'cell' && !o.nobody ? 'body' : 'label' });
      } else if (selE) {
        ev.preventDefault();
        startEdit({ k: 'e', id: selE });
      }
    } else if (k === 'p' || k === 'P') setTool('pen');
    else if (k === 'v' || k === 'V') setTool('select');
    else if (k === 'h' || k === 'H') setTool('hand');
    else if (k === 'c' || k === 'C') setTool('connect');
    else if (k === '/') {
      ev.preventDefault();
      openPalette();
      $('palQ').focus();
    } else if (k === '?') {
      ev.preventDefault();
      openModal('mKeys');
    } else if (/^Arrow/.test(k) && (selN.length || selE)) {
      ev.preventDefault();
      var d = ev.shiftKey ? 1 : 10,
        dx = k === 'ArrowLeft' ? -d : k === 'ArrowRight' ? d : 0,
        dy = k === 'ArrowUp' ? -d : k === 'ArrowDown' ? d : 0;
      pushUndo();
      if (selN.length) {
        moveSet(selN).list.forEach(function (o) {
          o.x += dx;
          o.y += dy;
        });
      } else {
        var e = eById(selE),
          pts = e && route(e);
        if (pts) {
          setEdgePoint(e, true, { x: pts[0].x + dx, y: pts[0].y + dy }, null);
          setEdgePoint(e, false, { x: pts[pts.length - 1].x + dx, y: pts[pts.length - 1].y + dy }, null);
          if (e.mx != null) e.mx += dx;
          if (e.my != null) e.my += dy;
        }
      }
      renderAll();
    }
  });
  document.addEventListener('keyup', function (ev) {
    if (ev.key === ' ') {
      spaceDown = false;
      stage.classList.remove('pan-ready');
    }
  });
  window.addEventListener('blur', function () {
    spaceDown = false;
    stage.classList.remove('pan-ready');
  });
}
