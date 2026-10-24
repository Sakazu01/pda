// ====================================================================
// waypoints · lines you can shape by hand, like draw.io and Excalidraw
//  · elbow line: drag any segment to slide it (keeps right angles); the
//    end segments slide their end along the shape's side
//  · straight / curved line: drag a "+" in the middle of a segment to add
//    a bend point, drag a point to move it (lines may go diagonal),
//    double-click a point to remove it
//  · e.wp holds the bend points; "Rapikan" removes them again
// ====================================================================
import {
  TH,
  borderPoint,
  byId,
  clamp,
  eById,
  edgeD,
  grid,
  pushUndo,
  r1,
  route,
  selE,
  set_edgeD,
  set_route,
  snap,
} from '../core/core';
import { commitEdit, drag, hs, isTyping, over, pt, render, renderOver, set_renderOver, svg } from '../core/ui';
import { sanitize, scheduleSave, set_sanitize } from '../core/features';
import { renderInsp } from '../editor/inspector';
import { PJ_VIEW } from '../projects/projects';
import { LBLT, LDRAG, edgePoly, set_edgePoly } from './labels';
import { EBAR, set_tidyEdge, tidyEdge } from './toolbar';
import { rtEligible, set_rtEligible } from './router';

export function wpValid(e) {
  return Array.isArray(e.wp) && e.wp.length > 0;
}
export function wpOrtho(P) {
  // insert corners so every segment is horizontal or vertical
  var o = [P[0]];
  for (var i = 1; i < P.length; i++) {
    var a = o[o.length - 1],
      b = P[i];
    if (Math.abs(a.x - b.x) > 0.5 && Math.abs(a.y - b.y) > 0.5) {
      var prevH = o.length > 1 ? Math.abs(o[o.length - 2].y - a.y) < 0.5 : true;
      o.push(prevH ? { x: a.x, y: b.y } : { x: b.x, y: a.y });
    }
    o.push(b);
  }
  return o;
}
export function wpEnd(n, anchor, toward) {
  if (anchor) return { x: n.x + n.w * anchor.x, y: n.y + n.h * anchor.y };
  return borderPoint(n, toward);
}
export var wpRoute0: (e: any) => any[];
// smooth curve through the bend points (Catmull-Rom → cubic Bézier)
export var wpEdgeD0: (e: any, pts: any) => string;
export var wpPoly0: (e: any, pts: any) => any;
// routed lines with hand bends are left alone by the auto-router
export var wpElig0: (e: any) => any[];
export var wpTidy0: (e: any) => void;

// ---------- handles ----------
export function wpHandles() {
  var e = selE && eById(selE);
  if (!e || (drag && drag.moved && drag.kind !== 'wp') || (LDRAG && LDRAG.moved)) return '';
  var P = route(e);
  if (!P || P.length < 2) return '';
  var s = '',
    sc = TH.sel,
    free = e.route === 'straight' || e.route === 'curve';
  if (free) {
    (e.wp || []).forEach(function (p, i) {
      s +=
        '<circle data-h="wp" data-i="' +
        i +
        '" cx="' +
        r1(p.x) +
        '" cy="' +
        r1(p.y) +
        '" r="' +
        hs(6) +
        '" fill="' +
        TH.paper +
        '" stroke="' +
        sc +
        '" stroke-width="' +
        hs(2) +
        '"><title>Seret untuk memindahkan titik tekuk · klik dua kali untuk menghapus</title></circle>';
    });
    var Q = wpValid(e) ? [P[0]].concat(e.wp, [P[P.length - 1]]) : [P[0], P[P.length - 1]];
    for (var i = 0; i < Q.length - 1; i++) {
      var m = { x: (Q[i].x + Q[i + 1].x) / 2, y: (Q[i].y + Q[i + 1].y) / 2 };
      if (Math.hypot(Q[i + 1].x - Q[i].x, Q[i + 1].y - Q[i].y) < hs(36)) continue;
      s +=
        '<g data-h="wpadd" data-i="' +
        i +
        '"><title>Seret untuk menambah titik tekuk</title><circle cx="' +
        r1(m.x) +
        '" cy="' +
        r1(m.y) +
        '" r="' +
        hs(11) +
        '" fill="transparent"/><circle cx="' +
        r1(m.x) +
        '" cy="' +
        r1(m.y) +
        '" r="' +
        hs(5) +
        '" fill="' +
        sc +
        '" fill-opacity=".18" stroke="' +
        sc +
        '" stroke-width="' +
        hs(1.4) +
        '"/><path d="M' +
        r1(m.x - hs(2.6)) +
        ' ' +
        r1(m.y) +
        ' H' +
        r1(m.x + hs(2.6)) +
        ' M' +
        r1(m.x) +
        ' ' +
        r1(m.y - hs(2.6)) +
        ' V' +
        r1(m.y + hs(2.6)) +
        '" stroke="' +
        sc +
        '" stroke-width="' +
        hs(1.4) +
        '"/></g>';
    }
  } else {
    for (var j = 0; j < P.length - 1; j++) {
      var a = P[j],
        b = P[j + 1],
        L = Math.hypot(b.x - a.x, b.y - a.y);
      if (L < hs(28)) continue;
      var hor = Math.abs(a.y - b.y) < 0.5,
        ver = Math.abs(a.x - b.x) < 0.5;
      if (!hor && !ver) continue;
      var mm = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        w = hor ? hs(18) : hs(7),
        h = hor ? hs(7) : hs(18);
      s +=
        '<rect data-h="seg" data-i="' +
        j +
        '" x="' +
        r1(mm.x - w / 2) +
        '" y="' +
        r1(mm.y - h / 2) +
        '" width="' +
        r1(w) +
        '" height="' +
        r1(h) +
        '" rx="' +
        hs(3) +
        '" fill="' +
        TH.paper +
        '" stroke="' +
        sc +
        '" stroke-width="' +
        hs(1.8) +
        '" style="cursor:' +
        (hor ? 'ns-resize' : 'ew-resize') +
        '"><title>Seret untuk menggeser segmen ini</title></rect>';
    }
  }
  return s;
}
export var wpRenderOver0: () => void;

// ---------- dragging ----------
export var WPDRAG = null;
export var WPLAST = null;
export function relAnchor(n, p) {
  return { x: clamp((p.x - n.x) / n.w, 0, 1), y: clamp((p.y - n.y) / n.h, 0, 1) };
}
export function wpEnd2(ev) {
  if (!WPDRAG) return;
  ev.stopPropagation();
  var m = WPDRAG.moved;
  WPDRAG = null;
  if (m) {
    scheduleSave();
    renderInsp();
  }
  renderOver();
}
// keep files honest: only finite numbers, at most 40 points
export var wpSan0: (d: any) => { nodes: any; edges: any; seq: number; style: string; dt: any };

export function install(): void {
  wpRoute0 = route;
  set_route(function (e) {
    if (!wpValid(e)) return wpRoute0(e);
    var a = byId(e.from),
      b = byId(e.to),
      W = e.wp.map(function (p) {
        return { x: p.x, y: p.y };
      });
    var s = a ? wpEnd(a, e.fromAnchor, W[0]) : e.start ? { x: e.start.x, y: e.start.y } : null,
      t = b ? wpEnd(b, e.toAnchor, W[W.length - 1]) : e.end ? { x: e.end.x, y: e.end.y } : null;
    if (!s || !t) return wpRoute0(e);
    var P = [s].concat(W, [t]);
    return e.route ? P : wpOrtho(P);
  });
  wpEdgeD0 = edgeD;
  set_edgeD(function (e, pts) {
    if (!(e.route === 'curve' && wpValid(e))) return wpEdgeD0(e, pts);
    var d = 'M' + r1(pts[0].x) + ' ' + r1(pts[0].y);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i],
        p1 = pts[i],
        p2 = pts[i + 1],
        p3 = pts[i + 2] || p2;
      d +=
        ' C' +
        r1(p1.x + (p2.x - p0.x) / 6) +
        ' ' +
        r1(p1.y + (p2.y - p0.y) / 6) +
        ' ' +
        r1(p2.x - (p3.x - p1.x) / 6) +
        ' ' +
        r1(p2.y - (p3.y - p1.y) / 6) +
        ' ' +
        r1(p2.x) +
        ' ' +
        r1(p2.y);
    }
    return d;
  });
  wpPoly0 = edgePoly;
  set_edgePoly(function (e, pts) {
    return e.route === 'curve' && wpValid(e) ? pts : wpPoly0(e, pts);
  });
  wpElig0 = rtEligible;
  set_rtEligible(function (e) {
    return wpValid(e) ? null : wpElig0(e);
  });
  wpTidy0 = tidyEdge;
  set_tidyEdge(function (e) {
    delete e.wp;
    wpTidy0(e);
  });
  wpRenderOver0 = renderOver;
  set_renderOver(function (this: any) {
    wpRenderOver0.apply(this, arguments);
    var mid = over.querySelector('[data-h=mid]');
    if (mid) mid.remove();
    var h = wpHandles();
    if (h) over.insertAdjacentHTML('beforeend', h);
  });
  svg.addEventListener(
    'pointerdown',
    function (ev) {
      if (ev.button !== 0) return;
      var h =
        (ev.target as HTMLInputElement).closest &&
        (ev.target as HTMLInputElement).closest('[data-h=wp],[data-h=wpadd],[data-h=seg]');
      if (!h) return;
      var e = eById(selE);
      if (!e) return;
      ev.stopPropagation();
      ev.preventDefault();
      commitEdit();
      var kind = h.getAttribute('data-h'),
        i = +h.getAttribute('data-i'),
        P = route(e);
      if (!P) return;
      // second press on the same bend point within 400ms = double-click → remove it
      if (kind === 'wp' && WPLAST && WPLAST.id === e.id && WPLAST.i === i && Date.now() - WPLAST.t < 400) {
        WPLAST = null;
        pushUndo();
        e.wp.splice(i, 1);
        if (!e.wp.length) delete e.wp;
        render();
        renderOver();
        scheduleSave();
        return;
      }
      WPLAST = kind === 'wp' ? { id: e.id, i: i, t: Date.now() } : null;
      WPDRAG = {
        id: e.id,
        kind: kind,
        i: i,
        moved: false,
        sx: ev.clientX,
        sy: ev.clientY,
        P: P.map(function (q) {
          return { x: q.x, y: q.y };
        }),
      };
      try {
        svg.setPointerCapture(ev.pointerId);
      } catch (_) {}
    },
    true,
  );
  svg.addEventListener(
    'pointermove',
    function (ev) {
      if (!WPDRAG) return;
      ev.stopPropagation();
      if (!WPDRAG.moved && Math.hypot(ev.clientX - WPDRAG.sx, ev.clientY - WPDRAG.sy) < 3) return;
      var e = eById(WPDRAG.id);
      if (!e) return;
      var p = pt(ev),
        sn = function (v) {
          return grid && !ev.altKey ? snap(v) : Math.round(v);
        };
      if (!WPDRAG.moved) {
        pushUndo();
        WPDRAG.moved = true;
        if (WPDRAG.kind === 'wpadd') {
          var w = (e.wp || []).slice();
          w.splice(WPDRAG.i, 0, { x: p.x, y: p.y });
          e.wp = w;
          WPDRAG.kind = 'wp';
        }
        if (WPDRAG.kind === 'seg') {
          var P = WPDRAG.P,
            a = byId(e.from),
            b = byId(e.to);
          // pin both ends where they are, then the middle becomes editable points
          if (a) e.fromAnchor = relAnchor(a, P[0]);
          if (b) e.toAnchor = relAnchor(b, P[P.length - 1]);
          e.mx = e.my = null;
          delete e.route;
          WPDRAG.hor = Math.abs(P[WPDRAG.i].y - P[WPDRAG.i + 1].y) < 0.5;
        }
      }
      if (WPDRAG.kind === 'wp') {
        e.wp[WPDRAG.i] = { x: sn(p.x), y: sn(p.y) };
      } else if (WPDRAG.kind === 'seg') {
        var Q = WPDRAG.P.map(function (q) {
            return { x: q.x, y: q.y };
          }),
          k = WPDRAG.i,
          n = Q.length,
          A = byId(e.from),
          B = byId(e.to);
        if (WPDRAG.hor) {
          var ny = sn(p.y);
          if (k === 0 && A) {
            ny = clamp(ny, A.y + 4, A.y + A.h - 4);
            e.fromAnchor = { x: e.fromAnchor ? e.fromAnchor.x : relAnchor(A, Q[0]).x, y: (ny - A.y) / A.h };
          }
          if (k + 1 === n - 1 && B) {
            ny = clamp(ny, B.y + 4, B.y + B.h - 4);
            e.toAnchor = { x: e.toAnchor ? e.toAnchor.x : relAnchor(B, Q[n - 1]).x, y: (ny - B.y) / B.h };
          }
          Q[k].y = ny;
          Q[k + 1].y = ny;
        } else {
          var nx = sn(p.x);
          if (k === 0 && A) {
            nx = clamp(nx, A.x + 4, A.x + A.w - 4);
            e.fromAnchor = { x: (nx - A.x) / A.w, y: e.fromAnchor ? e.fromAnchor.y : relAnchor(A, Q[0]).y };
          }
          if (k + 1 === n - 1 && B) {
            nx = clamp(nx, B.x + 4, B.x + B.w - 4);
            e.toAnchor = { x: (nx - B.x) / B.w, y: e.toAnchor ? e.toAnchor.y : relAnchor(B, Q[n - 1]).y };
          }
          Q[k].x = nx;
          Q[k + 1].x = nx;
        }
        var W = Q.slice(1, -1);
        e.wp = W.length ? W : undefined;
        if (!e.wp) delete e.wp;
      }
      render();
      renderOver();
    },
    true,
  );
  svg.addEventListener('pointerup', wpEnd2, true);
  svg.addEventListener('pointercancel', wpEnd2, true);
  svg.addEventListener(
    'dblclick',
    function (ev) {
      var h = (ev.target as HTMLInputElement).closest && (ev.target as HTMLInputElement).closest('[data-h=wp]');
      if (!h) return;
      var e = eById(selE);
      if (!e || !wpValid(e)) return;
      ev.stopPropagation();
      ev.preventDefault();
      pushUndo();
      e.wp.splice(+h.getAttribute('data-i'), 1);
      if (!e.wp.length) delete e.wp;
      render();
      renderOver();
      scheduleSave();
    },
    true,
  );
  // bend points travel with the selection when both ends move together
  svg.addEventListener('pointermove', function () {
    if (!drag || drag.kind !== 'move' || !drag.moved || !drag.lead) return;
    var dx = drag.lead.x - drag.lx,
      dy = drag.lead.y - drag.ly,
      ch = false;
    drag.eitems.forEach(function (it) {
      if (!it.both || !wpValid(it.e)) return;
      if (!it._wp)
        it._wp = it.e.wp.map(function (q) {
          return { x: q.x, y: q.y };
        });
      it.e.wp = it._wp.map(function (q) {
        return { x: q.x + dx, y: q.y + dy };
      });
      ch = true;
    });
    if (ch) render();
  });
  wpSan0 = sanitize;
  set_sanitize(function (this: any, d) {
    var r = wpSan0.apply(this, arguments);
    (r.edges || []).forEach(function (e) {
      if (e.wp == null) return;
      if (!Array.isArray(e.wp)) {
        delete e.wp;
        return;
      }
      var w = e.wp
        .filter(function (p) {
          return p && isFinite(+p.x) && isFinite(+p.y);
        })
        .slice(0, 40)
        .map(function (p) {
          return { x: +p.x, y: +p.y };
        });
      if (w.length) e.wp = w;
      else delete e.wp;
    });
    return r;
  });
  // ---------- keyboard: everything the line toolbar does, without a mouse ----------
  // Alt+Shift+←/→ slides the label (Alt+←/→ stays page navigation), Alt+L opens the line toolbar for Tab navigation,
  // Alt+S / Alt+K / Alt+C = straight / elbow / curved, Alt+B removes hand bends
  document.addEventListener(
    'keydown',
    function (ev) {
      if (!ev.altKey || isTyping() || !selE || PJ_VIEW !== 'canvas') return;
      var e = eById(selE);
      if (!e) return;
      var k = ev.key.toLowerCase(),
        done = true;
      if ((k === 'arrowleft' || k === 'arrowright') && !ev.shiftKey) return;
      if ((k === 'arrowleft' || k === 'arrowright') && ev.shiftKey && e.label) {
        pushUndo();
        var t = e.lt != null ? +e.lt : LBLT[e.id] != null ? LBLT[e.id] : 0.5;
        e.lt = Math.round(clamp(t + (k === 'arrowright' ? 0.05 : -0.05), 0.04, 0.96) * 1000) / 1000;
      } else if (k === 's') {
        pushUndo();
        e.route = 'straight';
        e.mx = e.my = null;
      } else if (k === 'k') {
        pushUndo();
        delete e.route;
        e.mx = e.my = null;
      } else if (k === 'c') {
        pushUndo();
        e.route = 'curve';
        e.mx = e.my = null;
      } else if (k === 'b') {
        pushUndo();
        tidyEdge(e);
      } else if (k === 'l') {
        var b = EBAR && EBAR.querySelector('button:not([hidden])');
        if (b) b.focus();
      } else done = false;
      if (done) {
        ev.preventDefault();
        ev.stopPropagation();
        if (k !== 'l') {
          render();
          renderOver();
          scheduleSave();
        }
      }
    },
    true,
  );
}
