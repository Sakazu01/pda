// edge labels sit ON the line, line is cut behind them, they slide along it
import {
  EDGE,
  FLOWING,
  TH,
  along,
  animate,
  byId,
  clamp,
  curveCtrl,
  drawEdge,
  drawNode,
  eById,
  edgeD,
  exporting,
  fam,
  mref,
  pushUndo,
  r1,
  route,
  selE,
  set_drawAll,
  set_drawEdge,
  set_labelPoint,
  tblock,
  textW,
  tool,
  validColor,
  wrapText,
} from '../core/core';
import { isLife } from '../diagrams/catalog';
import { TREED, autosize, branchColor, computeTree } from '../diagrams/draw';
import { commitEdit, pt, render, renderOver, setSel, spaceDown, svg } from '../core/ui';
import { scheduleSave } from '../core/features';
import { renderInsp } from '../editor/inspector';
import { RT, computeRoutes, rtShouldRun } from './router';

export var LBLQ = null;
export var LBLOBS = null;
export var LBLPL = null;
export var LBLT = {};
export var LMSEQ = 0;
export var LBLSEG = null;
export function segHitsRect(p, q, r) {
  var x1 = Math.min(p.x, q.x),
    x2 = Math.max(p.x, q.x),
    y1 = Math.min(p.y, q.y),
    y2 = Math.max(p.y, q.y);
  if (x2 < r.x || x1 > r.x + r.w || y2 < r.y || y1 > r.y + r.h) return false;
  if (x1 === x2 || y1 === y2) return true;
  for (var i = 0; i <= 10; i++) {
    var t = i / 10,
      x = p.x + (q.x - p.x) * t,
      y = p.y + (q.y - p.y) * t;
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return true;
  }
  return false;
}
export function lblLineClash(bb, eid) {
  if (!LBLSEG) return false;
  for (var i = 0; i < LBLSEG.length; i++) {
    var s = LBLSEG[i];
    if (s.id !== eid && segHitsRect(s.p, s.q, bb)) return true;
  }
  return false;
}
export function edgePoly__base(e, pts) {
  if (e.route !== 'curve') return pts;
  var c = curveCtrl(e, pts),
    o = [];
  for (var i = 0; i <= 24; i++) {
    var t = i / 24,
      u = 1 - t;
    o.push({
      x: u * u * u * c[0].x + 3 * u * u * t * c[1].x + 3 * u * t * t * c[2].x + t * t * t * c[3].x,
      y: u * u * u * c[0].y + 3 * u * u * t * c[1].y + 3 * u * t * t * c[2].y + t * t * t * c[3].y,
    });
  }
  return o;
}
export var edgePoly: typeof edgePoly__base = edgePoly__base;
export function set_edgePoly(v: typeof edgePoly__base) {
  return (edgePoly = v);
}
export function lblBase(e) {
  if (e.lt != null && isFinite(+e.lt)) return clamp(+e.lt, 0.04, 0.96);
  var a = byId(e.from);
  return a && fam(a) === 'gw' ? 0.35 : 0.5;
}
export function nearestT(poly, p) {
  var L = 0,
    seg = [],
    i;
  for (i = 1; i < poly.length; i++) {
    var d = Math.hypot(poly[i].x - poly[i - 1].x, poly[i].y - poly[i - 1].y);
    seg.push(d);
    L += d;
  }
  if (!L) return 0.5;
  var best = 1e18,
    bt = 0.5,
    acc = 0;
  for (i = 1; i < poly.length; i++) {
    var a = poly[i - 1],
      b = poly[i],
      dx = b.x - a.x,
      dy = b.y - a.y,
      l2 = dx * dx + dy * dy,
      r = l2 ? clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1) : 0,
      qx = a.x + dx * r,
      qy = a.y + dy * r,
      dd = (p.x - qx) * (p.x - qx) + (p.y - qy) * (p.y - qy);
    if (dd < best) {
      best = dd;
      bt = (acc + seg[i - 1] * r) / L;
    }
    acc += seg[i - 1];
  }
  return bt;
}
export function lblBox(e, poly, t) {
  var lines = wrapText(e.label, 170, 11),
    lw = 0;
  lines.forEach(function (l) {
    lw = Math.max(lw, textW(l, 11));
  });
  var h = lines.length * 14 + 2,
    w = lw + 10,
    p = along(poly, t);
  return { x: p.x - w / 2, y: p.y - h / 2, w: w, h: h, cx: p.x, cy: p.y, lines: lines };
}
export function rectHit(a, b, m) {
  m = m || 0;
  return a.x < b.x + b.w + m && a.x + a.w + m > b.x && a.y < b.y + b.h + m && a.y + a.h + m > b.y;
}

// drag a label along its line (like Excalidraw)
export var LDRAG = null;
export function ldragEnd(ev) {
  if (!LDRAG) return;
  ev.stopPropagation();
  var m = LDRAG.moved;
  LDRAG = null;
  svg.classList.remove('lab-drag');
  if (m) {
    scheduleSave();
    renderInsp();
  }
  renderOver();
}

export function install(): void {
  set_labelPoint(function (e, pts) {
    var t = LBLT[e.id] != null && e.lt == null ? LBLT[e.id] : lblBase(e);
    return along(edgePoly(e, pts), t);
  });
  set_drawEdge(function (e) {
    var pts = route(e);
    if (!pts) return '';
    var k = EDGE[e.type] || EDGE.line,
      c = validColor(e.stroke) ? e.stroke : TH.ink,
      w = e.width || 1.5,
      d = edgeD(e, pts);
    var ea = byId(e.from),
      eb = byId(e.to);
    if (!validColor(e.stroke) && ea && eb && fam(ea) === 'mind' && fam(eb) === 'mind') {
      c = branchColor(eb);
      if (!e.width) w = (TREED[eb.id] || 0) <= 1 ? 2.4 : 1.6;
    } else if (!validColor(e.stroke) && ea && eb && ea.look === 'tile' && eb.look === 'tile') {
      c = TH.flow;
      if (!e.width) w = 2;
    }
    var ms = k.cf ? 'cf-' + (e.c1 || 'only') : k.start,
      me = k.cf ? 'cf-' + (e.c2 || 'zmany') : k.end;
    var at =
      ' fill="none" stroke="' +
      c +
      '" stroke-width="' +
      w +
      '" stroke-linecap="round" stroke-linejoin="round"' +
      (k.dash ? ' stroke-dasharray="' + k.dash + '"' : '') +
      (me ? ' marker-end="' + mref(me, c, w) + '"' : '') +
      (ms ? ' marker-start="' + mref(ms, c, w) + '"' : '');
    var lab = '',
      mask = '',
      maskAt = '',
      tc = validColor(e.textColor) ? e.textColor : TH.text;
    if (e.label) {
      var poly = edgePoly(e, pts),
        B;
      if (k.above) {
        var vert = Math.abs(pts[pts.length - 1].x - pts[0].x) < Math.abs(pts[pts.length - 1].y - pts[0].y);
        B = lblBox(e, poly, lblBase(e));
        if (!vert) {
          B.y -= B.h / 2 + 5;
          B.cy -= B.h / 2 + 5;
        }
      } else {
        var t0 = lblBase(e);
        B = lblBox(e, poly, t0);
        // pick a spot along the line that collides with nothing yet; a dragged label (e.lt) stays where it was put
        if (e.lt == null && LBLOBS) {
          var cand = [t0, 0.5, 0.38, 0.62, 0.28, 0.72, 0.2, 0.8, 0.14, 0.86],
            ok = null;
          for (var ci = 0; ci < cand.length && !ok; ci++) {
            var bb = lblBox(e, poly, cand[ci]),
              clash =
                LBLPL.some(function (r) {
                  return rectHit(bb, r, 4);
                }) ||
                LBLOBS.some(function (r) {
                  return r.id !== e.from && r.id !== e.to && rectHit(bb, r, 2);
                }) ||
                lblLineClash({ x: bb.x - 2, y: bb.y - 2, w: bb.w + 4, h: bb.h + 4 }, e.id);
            if (!clash) ok = [cand[ci], bb];
          }
          if (ok) {
            B = ok[1];
            LBLT[e.id] = ok[0];
          } else delete LBLT[e.id];
        }
        var minx = 1e9,
          miny = 1e9,
          maxx = -1e9,
          maxy = -1e9;
        poly.forEach(function (q) {
          minx = Math.min(minx, q.x);
          miny = Math.min(miny, q.y);
          maxx = Math.max(maxx, q.x);
          maxy = Math.max(maxy, q.y);
        });
        var mid = 'lm' + ++LMSEQ + '-' + String(e.id).replace(/[^\w-]/g, '');
        mask =
          '<mask id="' +
          mid +
          '" maskUnits="userSpaceOnUse" x="' +
          r1(minx - 60) +
          '" y="' +
          r1(miny - 60) +
          '" width="' +
          r1(maxx - minx + 120) +
          '" height="' +
          r1(maxy - miny + 120) +
          '"><rect x="' +
          r1(minx - 60) +
          '" y="' +
          r1(miny - 60) +
          '" width="' +
          r1(maxx - minx + 120) +
          '" height="' +
          r1(maxy - miny + 120) +
          '" fill="#fff"/><rect x="' +
          r1(B.x - 3) +
          '" y="' +
          r1(B.y - 2) +
          '" width="' +
          r1(B.w + 6) +
          '" height="' +
          r1(B.h + 4) +
          '" rx="4" fill="#000"/></mask>';
        maskAt = ' mask="url(#' + mid + ')"';
      }
      if (LBLPL) LBLPL.push(B);
      lab =
        '<g data-eid="' +
        e.id +
        '" data-lab="1" class="elab"><rect x="' +
        r1(B.x - 4) +
        '" y="' +
        r1(B.y - 3) +
        '" width="' +
        r1(B.w + 8) +
        '" height="' +
        r1(B.h + 6) +
        '" rx="5" fill="transparent"/>' +
        tblock(B.cx, B.cy, B.lines, { fs: 11, lh: 14, vcenter: 1, fill: tc }).replace(
          '<text ',
          '<text stroke="' + TH.paper + '" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke" ',
        ) +
        '</g>';
    }
    var s =
      '<g data-eid="' +
      e.id +
      '">' +
      mask +
      '<path d="' +
      d +
      '" fill="none" stroke="transparent" stroke-width="16"/><path d="' +
      d +
      '"' +
      at +
      maskAt +
      '/>';
    if (animate && !exporting && FLOWING[e.type])
      s +=
        '<path class="flowdot" d="' +
        d +
        '" fill="none" stroke="' +
        (validColor(e.stroke) ? e.stroke : TH.sel) +
        '" stroke-width="' +
        (w + 2.2) +
        '" stroke-linecap="round"' +
        maskAt +
        '/>';
    s += '</g>';
    if (LBLQ) {
      if (lab) LBLQ.push(lab);
      return s;
    }
    return s + lab;
  });
  set_drawAll(function (nodes, edges) {
    computeTree();
    nodes.forEach(autosize);
    if (typeof computeRoutes === 'function' && rtShouldRun())
      try {
        computeRoutes(nodes, edges);
      } catch (err) {
        RT.routes = {};
      }
    var back = [],
      zones = [],
      groups = [],
      others = [];
    nodes.forEach(function (n) {
      var f = fam(n);
      (f === 'pool'
        ? back
        : f === 'zone' || f === 'box'
          ? zones
          : f === 'group' || f === 'cell' || isLife(n) || n.t === 'u-seq-act'
            ? groups
            : others
      ).push(n);
    });
    zones.sort(function (a, b) {
      return b.w * b.h - a.w * a.h;
    });
    groups.sort(function (a, b) {
      var la = isLife(a) ? 1 : a.t === 'u-seq-act' ? 2 : 0,
        lb = isLife(b) ? 1 : b.t === 'u-seq-act' ? 2 : 0;
      if (la !== lb) return la - lb;
      return b.w * b.h - a.w * a.h;
    });
    var s = '';
    back.concat(zones, groups).forEach(function (n) {
      s += '<g data-id="' + n.id + '">' + drawNode(n) + '</g>';
    });
    // labels are drawn last (above shapes) and avoid shapes and each other
    LBLSEG = [];
    edges.forEach(function (e) {
      var P = route(e);
      if (!P) return;
      P = edgePoly(e, P);
      for (var i = 1; i < P.length; i++) LBLSEG.push({ id: e.id, p: P[i - 1], q: P[i] });
    });
    LBLQ = [];
    LBLPL = [];
    LBLOBS = others
      .filter(function (n) {
        return fam(n) !== 'draw' && fam(n) !== 'text';
      })
      .map(function (n) {
        var below = (fam(n) === 'ev' || fam(n) === 'gw' || fam(n) === 'data') && n.label ? 18 : 0;
        return { id: n.id, x: n.x, y: n.y, w: n.w, h: n.h + below };
      });
    try {
      edges.forEach(function (e) {
        s += drawEdge(e);
      });
      others.forEach(function (n) {
        s += '<g data-id="' + n.id + '">' + drawNode(n) + '</g>';
      });
      s += LBLQ.join('');
    } finally {
      LBLQ = null;
      LBLPL = null;
      LBLOBS = null;
      LBLSEG = null;
    }
    return s;
  });
  svg.addEventListener(
    'pointerdown',
    function (ev) {
      if (ev.button !== 0 || tool !== 'select' || spaceDown) return;
      var lb = (ev.target as HTMLInputElement).closest && (ev.target as HTMLInputElement).closest('[data-lab]');
      if (!lb) return;
      var e = eById(lb.getAttribute('data-eid'));
      if (!e) return;
      ev.stopPropagation();
      ev.preventDefault();
      commitEdit();
      if (selE !== e.id) setSel([], e.id);
      LDRAG = { id: e.id, moved: false, sx: ev.clientX, sy: ev.clientY };
      try {
        svg.setPointerCapture(ev.pointerId);
      } catch (_) {}
    },
    true,
  );
  svg.addEventListener(
    'pointermove',
    function (ev) {
      if (!LDRAG) return;
      ev.stopPropagation();
      if (!LDRAG.moved && Math.hypot(ev.clientX - LDRAG.sx, ev.clientY - LDRAG.sy) < 3) return;
      var e = eById(LDRAG.id),
        pts = e && route(e);
      if (!pts) return;
      if (!LDRAG.moved) {
        pushUndo();
        LDRAG.moved = true;
        svg.classList.add('lab-drag');
      }
      e.lt = Math.round(clamp(nearestT(edgePoly(e, pts), pt(ev)), 0.04, 0.96) * 1000) / 1000;
      render();
      renderOver();
    },
    true,
  );
  svg.addEventListener('pointerup', ldragEnd, true);
  svg.addEventListener('pointercancel', ldragEnd, true);
}
