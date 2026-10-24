// ================= drawing: new families =================
import type { Dict } from '../core/types';
import {
  CALM,
  S,
  T,
  TH,
  byId,
  calmHex,
  esc,
  exporting,
  fam,
  iconG,
  mctx,
  r1,
  tblock,
  textW,
  validColor,
  wrapText,
} from '../core/core';
import { TECH_ALIAS, TREEF } from './catalog';

export var MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
export function isLight(c) {
  if (!validColor(c)) return true;
  var r = parseInt(c.substr(1, 2), 16),
    g = parseInt(c.substr(3, 2), 16),
    b = parseInt(c.substr(5, 2), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}
export function onColor(c) {
  return isLight(c) ? '#1b2230' : '#ffffff';
}
export function monoW(t, fs) {
  mctx.font = (fs || 12) + 'px ' + MONO;
  return mctx.measureText(t).width;
}
export function tlist(x, y, lines, o) {
  o = o || {};
  var fs = o.fs || 12,
    lh = o.lh || Math.round(fs * 1.3);
  if (!lines.length) return '';
  var s =
    '<text x="' +
    r1(x) +
    '" y="' +
    r1(y + fs * 0.85) +
    '" font-size="' +
    fs +
    '" fill="' +
    (o.fill || TH.text) +
    '"' +
    (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') +
    (o.ff ? ' font-family="' + esc(o.ff) + '"' : '') +
    (o.op ? ' fill-opacity="' + o.op + '"' : '') +
    (o.it ? ' font-style="italic"' : '') +
    '>';
  lines.forEach(function (l, i) {
    var t = typeof l === 'string' ? { t: l } : l;
    s +=
      '<tspan x="' +
      r1(x + (t.dx || 0)) +
      '" dy="' +
      (i ? lh : 0) +
      '"' +
      (t.b ? ' font-weight="700"' : '') +
      (t.c ? ' fill="' + t.c + '"' : '') +
      '>' +
      esc(t.t || ' ') +
      '</tspan>';
  });
  return s + '</text>';
}
export function bulletize(body, maxW, fs, plain) {
  var out = [];
  String(body || '')
    .split('\n')
    .forEach(function (raw) {
      var it = raw.replace(/^\s*[-•*]\s*/, '').trim();
      if (!it) return;
      if (plain) {
        wrapText(it, maxW, fs).forEach(function (l) {
          out.push({ t: l });
        });
        return;
      }
      wrapText(it, maxW - 12, fs).forEach(function (l, i) {
        out.push(i ? { t: l, dx: 12 } : { t: '• ' + l });
      });
    });
  return out;
}
export function fitList(body, maxW, maxH, plain) {
  var steps = [
    [12, 15],
    [11, 14],
    [10, 13],
    [9, 12],
  ];
  for (var i = 0; i < steps.length; i++) {
    var L = bulletize(body, maxW, steps[i][0], plain);
    if (L.length * steps[i][1] <= maxH || i === steps.length - 1) return { L: L, fs: steps[i][0], lh: steps[i][1] };
  }
  return null; // unreachable: the last step always returns
}
export function topRoundPath(x, y, w, h, r) {
  return (
    'M' +
    x +
    ' ' +
    (y + h) +
    ' V' +
    (y + r) +
    ' Q' +
    x +
    ' ' +
    y +
    ' ' +
    (x + r) +
    ' ' +
    y +
    ' H' +
    (x + w - r) +
    ' Q' +
    (x + w) +
    ' ' +
    y +
    ' ' +
    (x + w) +
    ' ' +
    (y + r) +
    ' V' +
    (y + h) +
    ' Z'
  );
}
export function leftRoundPath(x, y, w, h, r) {
  return (
    'M' +
    (x + w) +
    ' ' +
    y +
    ' H' +
    (x + r) +
    ' Q' +
    x +
    ' ' +
    y +
    ' ' +
    x +
    ' ' +
    (y + r) +
    ' V' +
    (y + h - r) +
    ' Q' +
    x +
    ' ' +
    (y + h) +
    ' ' +
    (x + r) +
    ' ' +
    (y + h) +
    ' H' +
    (x + w) +
    ' Z'
  );
}

// ---------- framework cells ----------
export function cellShapePath(n) {
  var x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    sh = n.shape || 'rect';
  if (sh === 'trap') {
    var a = w * (n.tw0 == null ? 0.6 : n.tw0),
      b = w * (n.tw1 == null ? 1 : n.tw1);
    return (
      'M' +
      r1(x + (w - a) / 2) +
      ' ' +
      y +
      ' H' +
      r1(x + (w + a) / 2) +
      ' L' +
      r1(x + (w + b) / 2) +
      ' ' +
      (y + h) +
      ' H' +
      r1(x + (w - b) / 2) +
      ' Z'
    );
  }
  if (sh === 'arrowR') {
    var pt = Math.min(w * 0.55, 56);
    return (
      'M' +
      x +
      ' ' +
      y +
      ' H' +
      (x + w - pt) +
      ' L' +
      (x + w) +
      ' ' +
      (y + h / 2) +
      ' L' +
      (x + w - pt) +
      ' ' +
      (y + h) +
      ' H' +
      x +
      ' Z'
    );
  }
  if (sh === 'sector') {
    var cx = x + w / 2,
      cy = y + h / 2,
      r = Math.min(w, h) / 2,
      a0 = ((n.a0 || 0) * Math.PI) / 180,
      a1 = ((n.a1 || 90) * Math.PI) / 180,
      large = (n.a1 || 90) - (n.a0 || 0) > 180 ? 1 : 0;
    return (
      'M' +
      r1(cx) +
      ' ' +
      r1(cy) +
      ' L' +
      r1(cx + r * Math.cos(a0)) +
      ' ' +
      r1(cy + r * Math.sin(a0)) +
      ' A' +
      r1(r) +
      ' ' +
      r1(r) +
      ' 0 ' +
      large +
      ' 1 ' +
      r1(cx + r * Math.cos(a1)) +
      ' ' +
      r1(cy + r * Math.sin(a1)) +
      ' Z'
    );
  }
  return null;
}
export function cellTone(n) {
  return validColor(n.tone) ? (n.uc ? n.tone : calmHex(n.tone)) : TH.name === 'dark' ? '#8b97ab' : '#55606f';
}
export var BADGE_C = {
  tinggi: '#b42318',
  high: '#b42318',
  sedang: '#b7791f',
  medium: '#b7791f',
  rendah: '#137a3a',
  low: '#137a3a',
};
export function drawCell(n, noLabel) {
  if (CALM && !n.uc && (validColor(n.fill) || validColor(n.stroke) || validColor(n.textColor)))
    n = Object.assign({}, n, {
      fill: calmHex(n.fill),
      stroke: calmHex(n.stroke),
      textColor: validColor(n.textColor) ? (TH.name === 'dark' ? '#e8eced' : '#192023') : n.textColor,
    });
  var tone = cellTone(n),
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    mode = n.mode || 'soft',
    sh = n.shape || 'rect',
    s = '';
  var hasFill = validColor(n.fill),
    base = hasFill ? n.fill : mode === 'solid' ? tone : TH.card;
  var tc = validColor(n.textColor) ? n.textColor : mode === 'solid' || hasFill ? onColor(base) : TH.text;
  var mc = mode === 'solid' || hasFill ? tc : TH.muted;
  var bare = mode === 'bare',
    st = n.hl ? '#137a3a' : validColor(n.stroke) ? n.stroke : tone,
    sw = n.hl ? 3 : mode === 'solid' || bare ? 0 : 1.3;
  var path = cellShapePath(n),
    rx = Math.min(10, w / 6, h / 6),
    shp;
  if (path) shp = '<path d="' + path + '"';
  else if (sh === 'circle')
    shp =
      '<ellipse cx="' + r1(x + w / 2) + '" cy="' + r1(y + h / 2) + '" rx="' + r1(w / 2) + '" ry="' + r1(h / 2) + '"';
  else shp = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r1(rx) + '"';
  s += shp + ' fill="' + (bare && !hasFill ? 'transparent' : base) + '"/>';
  if (mode === 'soft' && !hasFill)
    s += shp + ' fill="' + tone + '" fill-opacity="' + (TH.name === 'dark' ? 0.17 : 0.09) + '"/>';
  if (sw)
    s +=
      shp +
      ' fill="none" stroke="' +
      st +
      '" stroke-width="' +
      sw +
      '"' +
      (n.hl ? '' : ' stroke-opacity="' + (mode === 'soft' ? 0.6 : 1) + '"') +
      (n.dash ? ' stroke-dasharray="6 4"' : '') +
      '/>';
  if (noLabel && !n.icon) return s;
  var head = n.head || 'plain',
    bx = x + 12,
    by = y + 10,
    bw = w - 24,
    bh = h - 20,
    cx = x + w / 2;
  if (sh === 'circle' && n.bigIcon) head = 'none';
  var rightPad = (n.icon ? 26 : 0) + (n.badge ? 74 : 0),
    ttl = [],
    bandH = 0;
  if (sh === 'sector') {
    var r = Math.min(w, h) / 2,
      span = (n.a1 || 90) - (n.a0 || 0),
      m = (((n.a0 || 0) + span / 2) * Math.PI) / 180,
      k = span >= 180 ? 0.42 : 0.47;
    var tcx = x + w / 2 + Math.cos(m) * r * k,
      tcy = y + h / 2 + Math.sin(m) * r * k,
      tw = span >= 180 ? r * 0.8 : r * 0.66,
      th = span >= 180 ? r * 1.3 : r * 0.62;
    bx = tcx - tw / 2;
    bw = tw;
    by = tcy - th / 2;
    bh = th;
    head = 'ctop';
    cx = tcx;
    rightPad = 0;
  } else if (sh === 'trap') {
    var mn = Math.min(n.tw0 == null ? 0.6 : n.tw0, n.tw1 == null ? 1 : n.tw1);
    bx = x + (w - w * mn) / 2 + 8;
    bw = w * mn - 16;
  } else if (sh === 'arrowR') {
    bw = w - 24 - Math.min(w * 0.55, 56) / 2;
    cx = x + (w - Math.min(w * 0.55, 56) / 2) / 2;
  } else if (sh === 'circle') {
    bx = x + w * 0.18;
    bw = w * 0.64;
    by = y + h * 0.2;
    bh = h * 0.6;
  }
  if (n.pt) {
    by += n.pt;
    bh -= n.pt;
  }
  if (n.pr) bw -= n.pr;
  if (!noLabel) {
    if (head === 'band') {
      ttl = wrapText(n.label || '', w - 24 - rightPad, 13, 700);
      bandH = Math.max(32, ttl.length * 16 + 14);
      s += '<path d="' + topRoundPath(x, y, w, bandH, rx) + '" fill="' + tone + '"/>';
      s += tblock(x + 12, y + (bandH - ttl.length * 16) / 2, ttl, {
        fs: 13,
        lh: 16,
        w: 700,
        anchor: 'start',
        fill: onColor(tone),
      });
      by = y + bandH + 8;
      bh = h - bandH - 16;
    } else if (head === 'side') {
      var sw2 = Math.min(n.sideW || 180, w * 0.45);
      ttl = wrapText(n.label || '', sw2 - 20, 13, 700);
      s += '<path d="' + leftRoundPath(x, y, sw2, h, rx) + '" fill="' + tone + '"/>';
      s += tblock(x + sw2 / 2, y + h / 2, ttl, { fs: 13, lh: 16, w: 700, vcenter: 1, fill: onColor(tone) });
      bx = x + sw2 + 12;
      bw = w - sw2 - 24;
    } else if (head === 'chev') {
      var ch = 40;
      ttl = wrapText(n.label || '', w - 40, 12, 700);
      s +=
        '<path d="M' +
        x +
        ' ' +
        y +
        ' H' +
        (x + w - 14) +
        ' L' +
        (x + w) +
        ' ' +
        (y + ch / 2) +
        ' L' +
        (x + w - 14) +
        ' ' +
        (y + ch) +
        ' H' +
        x +
        (n.first ? '' : ' L' + (x + 14) + ' ' + (y + ch / 2)) +
        ' Z" fill="' +
        tone +
        '"/>';
      s += tblock(x + w / 2, y + ch / 2, ttl, { fs: 12, lh: 14, w: 700, vcenter: 1, fill: onColor(tone) });
      by = y + ch + 10;
      bh = h - ch - 20;
    } else if (head === 'center' && n.vrot) {
      var vcy = y + h / 2;
      ttl = wrapText(n.label || '', h - 24, n.big ? 16 : 14, 700);
      s += tblock(cx, vcy, ttl, {
        fs: n.big ? 16 : 14,
        lh: 18,
        w: 700,
        vcenter: 1,
        fill: tc,
        tr: 'rotate(-90 ' + r1(cx) + ' ' + r1(vcy) + ')',
      });
      by = y + h;
      bh = 0;
    } else if (head === 'center') {
      ttl = wrapText(n.label || '', bw, n.big ? 16 : 14, 700);
      var subL = n.sub ? wrapText(n.sub, bw, 11) : [],
        tot = ttl.length * 18 + subL.length * 14;
      var cy0 = (sh === 'trap' ? y + h / 2 : y + h / 2) - tot / 2;
      s += tblock(cx, cy0, ttl, { fs: n.big ? 16 : 14, lh: 18, w: 700, fill: tc });
      if (subL.length) s += tblock(cx, cy0 + ttl.length * 18, subL, { fs: 11, lh: 14, fill: mc });
      by = cy0 + tot + 6;
      bh = y + h - 10 - by;
    } else if (head === 'ctop' || head === 'plain') {
      ttl = wrapText(n.label || '', head === 'ctop' ? bw - 2 * rightPad : bw - rightPad, 13, 700);
      s += tblock(head === 'ctop' ? cx : bx, by, ttl, {
        fs: 13,
        lh: 16,
        w: 700,
        anchor: head === 'ctop' ? 'middle' : 'start',
        fill: tc,
      });
      by += ttl.length * 16 + (ttl.length ? 6 : 0);
      bh = sh === 'sector' ? bh - ttl.length * 16 - 6 : y + h - 10 - by;
    }
    if (n.sub && head !== 'center') {
      var sl = wrapText(n.sub, bw, 11);
      s += tblock(head === 'ctop' ? cx : bx, by - 2, sl, {
        fs: 11,
        lh: 14,
        fill: mc,
        anchor: head === 'ctop' ? 'middle' : 'start',
      }).replace('<text', '<text font-style="italic"');
      by += sl.length * 14 + 4;
      bh -= sl.length * 14 + 4;
    }
    if (n.badge) {
      var bt = String(n.badge),
        bc = BADGE_C[bt.toLowerCase()] || tone,
        bwid = Math.max(46, textW(bt, 11, 700) + 18),
        bxp = x + w - 12 - (n.icon ? 26 : 0) - bwid,
        byp = head === 'band' ? y + (bandH - 20) / 2 : head === 'chev' ? y + 44 : y + 8;
      s +=
        '<rect x="' +
        r1(bxp) +
        '" y="' +
        r1(byp) +
        '" width="' +
        r1(bwid) +
        '" height="20" rx="10" fill="' +
        bc +
        '"/>' +
        tblock(bxp + bwid / 2, byp + 10, [bt], { fs: 11, w: 700, vcenter: 1, fill: '#ffffff' });
    }
  }
  if (n.icon) {
    var icc = head === 'band' || mode === 'solid' ? onColor(head === 'band' ? tone : base) : tone;
    if (sh === 'circle' && n.bigIcon) {
      var isz = Math.min(w, h) * 0.42;
      s += iconG(n.icon, x + w / 2 - isz / 2, y + h / 2 - isz / 2 - (noLabel || !n.label ? 0 : 10), isz / 24, icc, 1.8);
      if (!noLabel && n.label)
        s += tblock(x + w / 2, y + h / 2 + isz / 2 - 4, wrapText(n.label, w * 0.7, 13, 700), {
          fs: 13,
          w: 700,
          fill: tc,
        });
    } else
      s += iconG(
        n.icon,
        x + w - 30,
        head === 'band' ? y + (bandH - 18) / 2 : head === 'chev' ? y + 46 : y + 9,
        0.75,
        icc,
        2,
      );
  }
  if (noLabel) return s;
  if (!n.nobody && bh > 8) {
    if (n.body) {
      var fl = fitList(n.body, bw, bh, n.plain);
      s += tlist(head === 'ctop' && n.plain ? cx : bx, by, fl.L, {
        fs: fl.fs,
        lh: fl.lh,
        fill: tc,
        anchor: head === 'ctop' && n.plain ? 'middle' : null,
      });
    } else if (n.ph && !exporting) {
      var pl = wrapText(n.ph, bw, 11);
      s += tlist(
        head === 'ctop' ? cx : bx,
        by,
        pl.map(function (t) {
          return { t: t };
        }),
        { fs: 11, lh: 14, fill: mc, op: 0.7, it: 1, anchor: head === 'ctop' ? 'middle' : null },
      );
    }
  }
  if (n.hl) {
    var ht = '✓ ' + (n.hlText || 'Dipilih'),
      hw = Math.max(110, textW(ht, 12, 700) + 28);
    s +=
      '<rect x="' +
      r1(x + w / 2 - hw / 2) +
      '" y="' +
      (y + h - 32) +
      '" width="' +
      r1(hw) +
      '" height="22" rx="11" fill="#137a3a"/>' +
      tblock(x + w / 2, y + h - 21, [ht], { fs: 12, w: 700, vcenter: 1, fill: '#ffffff' });
  }
  return s;
}

// ---------- tree nodes (org / mind / sitemap) ----------
export var TREEP = {};
export var TREED = {};
export var TREEB = {};
export var MIND_C = {
  light: ['#2459d6', '#c2410c', '#0b8174', '#8b3fd9', '#b5175a', '#8f5d00', '#3a8529', '#4b4fc4'],
  dark: ['#7ea6ff', '#ff9a66', '#4fd1bf', '#c39bff', '#ff7cb5', '#f2c25b', '#90d677', '#a3a6ff'],
};
export function computeTree() {
  TREEP = {};
  TREED = {};
  TREEB = {};
  S.edges.forEach(function (e) {
    var a = byId(e.from),
      b = byId(e.to);
    if (a && b && TREEF[fam(a)] && fam(a) === fam(b) && !TREEP[b.id]) TREEP[b.id] = a.id;
  });
  var kidsOf = {};
  Object.keys(TREEP).forEach(function (c) {
    (kidsOf[TREEP[c]] = kidsOf[TREEP[c]] || []).push(c);
  });
  S.nodes.forEach(function (n) {
    if (!TREEF[fam(n)] || TREEP[n.id]) return;
    var q: [string, number, number][] = [[n.id, 0, -1]],
      seen = {};
    while (q.length) {
      var it = q.shift();
      if (seen[it[0]]) continue;
      seen[it[0]] = 1;
      TREED[it[0]] = it[1];
      TREEB[it[0]] = it[2];
      var ks = (kidsOf[it[0]] || [])
        .map(byId)
        .filter(Boolean)
        .sort(function (a, b) {
          return a.y - b.y || a.x - b.x;
        });
      ks.forEach(function (k, i) {
        q.push([k.id, it[1] + 1, it[1] === 0 ? i : it[2]]);
      });
    }
  });
}
export function branchColor(n) {
  var d = TREED[n.id] || 0;
  if (!d) return TH.sel;
  var pal = MIND_C[TH.name].map(calmHex);
  return pal[(TREEB[n.id] >= 0 ? TREEB[n.id] : 0) % pal.length];
}
export function drawTree(n, noLabel) {
  var f = fam(n),
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    s = '',
    tc = validColor(n.textColor) ? n.textColor : TH.text;
  if (f === 'org') {
    var root = !TREEP[n.id],
      tone = validColor(n.stroke) ? n.stroke : TH.name === 'dark' ? '#6db5bb' : '#0e6169';
    s +=
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="9" fill="' +
      (validColor(n.fill) ? n.fill : TH.card) +
      '"/>';
    if (!validColor(n.fill))
      s +=
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        w +
        '" height="' +
        h +
        '" rx="9" fill="' +
        (n.hl ? TH.sel : tone) +
        '" fill-opacity="' +
        (root ? 0.2 : n.hl ? 0.18 : 0.07) +
        '"/>';
    s +=
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="9" fill="none" stroke="' +
      (n.hl ? TH.sel : tone) +
      '" stroke-opacity="' +
      (n.hl ? 1 : 0.6) +
      '" stroke-width="' +
      (n.hl ? 2.4 : 1.3) +
      '"/>';
    if (!noLabel) {
      var L = wrapText(n.label, w - 16, 12, 700),
        Sb = n.sub ? wrapText(n.sub, w - 16, 11) : [],
        th = L.length * 15 + Sb.length * 14,
        ty = y + (h - th) / 2;
      s += tblock(x + w / 2, ty, L, { fs: 12, lh: 15, w: 700, fill: tc });
      if (Sb.length) s += tblock(x + w / 2, ty + L.length * 15, Sb, { fs: 11, lh: 14, fill: TH.muted });
    }
    return s;
  }
  if (f === 'mind') {
    var dep = TREED[n.id] || 0,
      col = validColor(n.stroke) ? n.stroke : branchColor(n);
    if (dep === 0) {
      s +=
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        w +
        '" height="' +
        h +
        '" rx="' +
        r1(Math.min(h / 2, 22)) +
        '" fill="' +
        (validColor(n.fill) ? n.fill : col) +
        '"/>';
      if (!noLabel)
        s += tblock(x + w / 2, y + h / 2, wrapText(n.label, w - 24, 15, 700), {
          fs: 15,
          lh: 18,
          w: 700,
          vcenter: 1,
          fill: validColor(n.textColor) ? n.textColor : onColor(validColor(n.fill) ? n.fill : col),
        });
    } else if (dep === 1) {
      s +=
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        w +
        '" height="' +
        h +
        '" rx="' +
        r1(h / 2) +
        '" fill="' +
        (validColor(n.fill) ? n.fill : TH.card) +
        '"/>';
      if (!validColor(n.fill))
        s +=
          '<rect x="' +
          x +
          '" y="' +
          y +
          '" width="' +
          w +
          '" height="' +
          h +
          '" rx="' +
          r1(h / 2) +
          '" fill="' +
          col +
          '" fill-opacity="' +
          (TH.name === 'dark' ? 0.2 : 0.12) +
          '"/>';
      s +=
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        w +
        '" height="' +
        h +
        '" rx="' +
        r1(h / 2) +
        '" fill="none" stroke="' +
        col +
        '" stroke-width="1.8"/>';
      if (!noLabel)
        s += tblock(x + w / 2, y + h / 2, wrapText(n.label, w - 20, 13, 600), {
          fs: 13,
          lh: 16,
          w: 600,
          vcenter: 1,
          fill: tc,
        });
    } else {
      s +=
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        w +
        '" height="' +
        h +
        '" fill="transparent"/><path d="M' +
        x +
        ' ' +
        (y + h - 1) +
        ' H' +
        (x + w) +
        '" stroke="' +
        col +
        '" stroke-width="2" stroke-linecap="round"/>';
      if (!noLabel)
        s += tblock(x + 4, y + h / 2 - 2, wrapText(n.label, w - 8, 12), {
          fs: 12,
          lh: 15,
          vcenter: 1,
          anchor: 'start',
          fill: tc,
        });
    }
    return s;
  }
  // sitemap page
  s +=
    '<rect x="' +
    x +
    '" y="' +
    y +
    '" width="' +
    w +
    '" height="' +
    h +
    '" rx="9" fill="' +
    (validColor(n.fill) ? n.fill : TH.card) +
    '" stroke="' +
    (validColor(n.stroke) ? n.stroke : TH.cardLine) +
    '" stroke-width="1.3"/>';
  s += '<path d="' + topRoundPath(x, y, w, 16, 9) + '" fill="' + TH.cardLine + '" fill-opacity=".6"/>';
  [0, 1, 2].forEach(function (i) {
    s +=
      '<circle cx="' + (x + 10 + i * 9) + '" cy="' + (y + 8) + '" r="2.6" fill="' + TH.muted + '" fill-opacity=".7"/>';
  });
  if (!noLabel) {
    var PL = wrapText(n.label, w - 16, 12, 700),
      PS = n.sub ? wrapText(n.sub, w - 16, 10.5) : [],
      pth = PL.length * 15 + PS.length * 13,
      py = y + 16 + (h - 16 - pth) / 2;
    s += tblock(x + w / 2, py, PL, { fs: 12, lh: 15, w: 700, fill: tc });
    if (PS.length)
      s += tblock(x + w / 2, py + PL.length * 15, PS, { fs: 10.5, lh: 13, fill: TH.muted }).replace(
        '<text',
        '<text font-family="' + esc(MONO) + '"',
      );
  }
  return s;
}

// ---------- UML ----------
export function classLayout(n) {
  var nameL = wrapText(n.label || '', Math.max(60, n.w - 20), 13, 700),
    st = n.stereo ? 1 : 0,
    hH = 12 + st * 15 + nameL.length * 16 + 8;
  var aL = String(n.attrs || '')
      .split('\n')
      .filter(function (l) {
        return l.trim();
      }),
    oL = String(n.ops || '')
      .split('\n')
      .filter(function (l) {
        return l.trim();
      });
  var aH = Math.max(24, aL.length * 17 + 12),
    oH = n.t === 'u-enum' && !oL.length ? 0 : Math.max(24, oL.length * 17 + 12);
  return { nameL: nameL, hH: hH, aL: aL, oL: oL, aH: aH, oH: oH, need: hH + aH + oH };
}
export function parseCols(body) {
  return String(body || '')
    .split('\n')
    .map(function (l) {
      return l.trim();
    })
    .filter(Boolean)
    .map(function (l) {
      var m = /^((?:PK|FK|UK)(?:\s*[,/]?\s*(?:PK|FK|UK))*)\s+/i.exec(l),
        key = '';
      if (m) {
        key = m[1]
          .toUpperCase()
          .replace(/[\s,/]+/g, ' ')
          .trim();
        l = l.slice(m[0].length);
      }
      var p = l.split(/\s*:\s*/),
        name = p[0],
        type = p.slice(1).join(':');
      if (!type) {
        var q = name.split(/\s+/);
        if (q.length > 1) {
          name = q[0];
          type = q.slice(1).join(' ');
        }
      }
      return { key: key, name: name, type: type };
    });
}
export function autosize(n) {
  var f = fam(n);
  if (f === 'uml' && (n.t === 'u-class' || n.t === 'u-interface' || n.t === 'u-enum')) {
    var L = classLayout(n),
      mw = textW(n.label || '', 13, 700) + 28;
    L.aL.concat(L.oL).forEach(function (t) {
      mw = Math.max(mw, monoW(t, 12) + 24);
    });
    n.w = Math.max(n.w, Math.ceil(mw / 10) * 10);
    n.h = classLayout(n).need;
  } else if (n.t === 'er-table') {
    var cols = parseCols(n.body),
      mw2 = textW(n.label || '', 13, 700) + 28;
    cols.forEach(function (c) {
      mw2 = Math.max(mw2, 40 + textW(c.name, 12) + 24 + monoW(c.type, 11) + 16);
    });
    n.w = Math.max(n.w, Math.ceil(mw2 / 10) * 10);
    n.h = 36 + Math.max(1, cols.length) * 24 + 6;
  }
}
export function stickFigure(cx, top, fw, fh, st, fl) {
  var hr = Math.min(fw * 0.22, fh * 0.14),
    hy = top + hr + 1,
    ly = top + fh * 0.62;
  return (
    '<circle cx="' +
    r1(cx) +
    '" cy="' +
    r1(hy) +
    '" r="' +
    r1(hr) +
    '" fill="' +
    fl +
    '" stroke="' +
    st +
    '" stroke-width="1.6"/><path d="M' +
    r1(cx) +
    ' ' +
    r1(hy + hr) +
    ' V' +
    r1(ly) +
    ' M' +
    r1(cx - fw * 0.38) +
    ' ' +
    r1(top + fh * 0.36) +
    ' H' +
    r1(cx + fw * 0.38) +
    ' M' +
    r1(cx) +
    ' ' +
    r1(ly) +
    ' L' +
    r1(cx - fw * 0.34) +
    ' ' +
    r1(top + fh) +
    ' M' +
    r1(cx) +
    ' ' +
    r1(ly) +
    ' L' +
    r1(cx + fw * 0.34) +
    ' ' +
    r1(top + fh) +
    '" fill="none" stroke="' +
    st +
    '" stroke-width="1.6" stroke-linecap="round"/>'
  );
}
export function drawUml__base(n, noLabel) {
  var k = T[n.t].k,
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    st = validColor(n.stroke) ? n.stroke : TH.ink,
    fl = validColor(n.fill) ? n.fill : TH.shape,
    tc = validColor(n.textColor) ? n.textColor : TH.text,
    s = '',
    a = ' stroke="' + st + '" stroke-width="1.6"',
    cx = x + w / 2,
    cy = y + h / 2;
  var lab = function (maxW, fs?) {
    return noLabel ? '' : tblock(cx, cy, wrapText(n.label, maxW, fs || 12), { fs: fs || 12, vcenter: 1, fill: tc });
  };
  if (k === 'actor') {
    s +=
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="transparent"/>' +
      stickFigure(cx, y, w, h, st, fl);
    if (!noLabel) s += tblock(cx, y + h + 4, wrapText(n.label, Math.max(110, w + 60), 12), { fs: 12, fill: tc });
    return s;
  }
  if (k === 'usecase')
    return (
      '<ellipse cx="' +
      r1(cx) +
      '" cy="' +
      r1(cy) +
      '" rx="' +
      r1(w / 2) +
      '" ry="' +
      r1(h / 2) +
      '" fill="' +
      fl +
      '"' +
      a +
      '/>' +
      lab(w * 0.76)
    );
  if (k === 'act-initial')
    return '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(Math.min(w, h) / 2) + '" fill="' + st + '"/>';
  if (k === 'act-final') {
    var R = Math.min(w, h) / 2;
    return (
      '<circle cx="' +
      r1(cx) +
      '" cy="' +
      r1(cy) +
      '" r="' +
      r1(R - 0.8) +
      '" fill="' +
      fl +
      '"' +
      a +
      '/><circle cx="' +
      r1(cx) +
      '" cy="' +
      r1(cy) +
      '" r="' +
      r1(R - 5.5) +
      '" fill="' +
      st +
      '"/>'
    );
  }
  if (k === 'act-flowfinal') {
    var R2 = Math.min(w, h) / 2 - 0.8,
      q = R2 * 0.7;
    return (
      '<circle cx="' +
      r1(cx) +
      '" cy="' +
      r1(cy) +
      '" r="' +
      r1(R2) +
      '" fill="' +
      fl +
      '"' +
      a +
      '/><path d="M' +
      r1(cx - q) +
      ' ' +
      r1(cy - q) +
      ' L' +
      r1(cx + q) +
      ' ' +
      r1(cy + q) +
      ' M' +
      r1(cx + q) +
      ' ' +
      r1(cy - q) +
      ' L' +
      r1(cx - q) +
      ' ' +
      r1(cy + q) +
      '"' +
      a +
      '/>'
    );
  }
  if (k === 'act-action')
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="' +
      r1(Math.min(16, h / 2)) +
      '" fill="' +
      fl +
      '"' +
      a +
      '/>' +
      lab(w - 20)
    );
  if (k === 'act-decision' || k === 'choice') {
    s =
      '<path d="M' +
      r1(cx) +
      ' ' +
      y +
      ' L' +
      (x + w) +
      ' ' +
      r1(cy) +
      ' L' +
      r1(cx) +
      ' ' +
      (y + h) +
      ' L' +
      x +
      ' ' +
      r1(cy) +
      ' Z" fill="' +
      fl +
      '"' +
      a +
      ' stroke-linejoin="round"/>';
    if (!noLabel && n.label) {
      var dl = wrapText(n.label, 130, 11);
      s += tblock(x + w * 0.72 + 4, y - dl.length * 14 + 4, dl, { fs: 11, lh: 14, anchor: 'start', fill: tc });
    }
    return s;
  }
  if (k === 'act-bar')
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="' + st + '"/>';
  if (k === 'act-send')
    return (
      '<path d="M' +
      x +
      ' ' +
      y +
      ' H' +
      (x + w - 16) +
      ' L' +
      (x + w) +
      ' ' +
      r1(cy) +
      ' L' +
      (x + w - 16) +
      ' ' +
      (y + h) +
      ' H' +
      x +
      ' Z" fill="' +
      fl +
      '"' +
      a +
      ' stroke-linejoin="round"/>' +
      lab(w - 30)
    );
  if (k === 'act-recv')
    return (
      '<path d="M' +
      x +
      ' ' +
      y +
      ' H' +
      (x + w) +
      ' V' +
      (y + h) +
      ' H' +
      x +
      ' L' +
      (x + 16) +
      ' ' +
      r1(cy) +
      ' Z" fill="' +
      fl +
      '"' +
      a +
      ' stroke-linejoin="round"/>' +
      lab(w - 30)
    );
  if (k === 'seq-life') {
    s +=
      '<rect x="' +
      r1(cx - 9) +
      '" y="' +
      (y + 42) +
      '" width="18" height="' +
      Math.max(0, h - 42) +
      '" fill="transparent"/>';
    s +=
      '<path d="M' +
      r1(cx) +
      ' ' +
      (y + 42) +
      ' V' +
      (y + h) +
      '" stroke="' +
      st +
      '" stroke-width="1.3" stroke-dasharray="6 5"/>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="42" rx="6" fill="' + fl + '"' + a + '/>';
    if (!noLabel) s += tblock(cx, y + 21, wrapText(n.label, w - 14, 12, 600), { fs: 12, w: 600, vcenter: 1, fill: tc });
    return s;
  }
  if (k === 'seq-actor') {
    s +=
      '<rect x="' +
      r1(cx - 9) +
      '" y="' +
      (y + 84) +
      '" width="18" height="' +
      Math.max(0, h - 84) +
      '" fill="transparent"/><rect x="' +
      r1(cx - 20) +
      '" y="' +
      y +
      '" width="40" height="62" fill="transparent"/>';
    s += stickFigure(cx, y + 2, 34, 56, st, fl);
    s +=
      '<path d="M' +
      r1(cx) +
      ' ' +
      (y + 84) +
      ' V' +
      (y + h) +
      '" stroke="' +
      st +
      '" stroke-width="1.3" stroke-dasharray="6 5"/>';
    if (!noLabel)
      s += tblock(cx, y + 64, wrapText(n.label, Math.max(90, w), 12, 600).slice(0, 1), { fs: 12, w: 600, fill: tc });
    return s;
  }
  if (k === 'seq-act')
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fl + '"' + a + '/>';
  if (k === 'class' || k === 'interface' || k === 'enum') {
    var L = classLayout(n),
      yy = y;
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="' + fl + '"' + a + '/>';
    s +=
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      L.hH +
      '" rx="4" fill="' +
      (validColor(n.fill) ? n.fill : TH.sel) +
      '" fill-opacity="' +
      (validColor(n.fill) ? 1 : 0.1) +
      '"/>';
    if (!noLabel) {
      if (n.stereo) s += tblock(cx, yy + 9, ['«' + n.stereo + '»'], { fs: 11, fill: TH.muted });
      s += tblock(cx, yy + 9 + (n.stereo ? 15 : 0), L.nameL, { fs: 13, lh: 16, w: 700, fill: tc }).replace(
        '<text',
        k === 'interface' ? '<text font-style="italic"' : '<text',
      );
    }
    yy += L.hH;
    s += '<path d="M' + x + ' ' + yy + ' H' + (x + w) + '"' + a + '/>';
    if (!noLabel && L.aL.length) s += tlist(x + 12, yy + 7, L.aL, { fs: 12, lh: 17, ff: MONO, fill: tc });
    yy += L.aH;
    if (L.oH) {
      s += '<path d="M' + x + ' ' + yy + ' H' + (x + w) + '"' + a + '/>';
      if (!noLabel && L.oL.length) s += tlist(x + 12, yy + 7, L.oL, { fs: 12, lh: 17, ff: MONO, fill: tc });
    }
    return s;
  }
  if (k === 'state') {
    s +=
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="' +
      r1(Math.min(16, h / 2)) +
      '" fill="' +
      fl +
      '"' +
      a +
      '/>';
    if (noLabel) return s;
    if (n.body) {
      var nl = wrapText(n.label, w - 20, 12, 700);
      s += tblock(cx, y + 8, nl, { fs: 12, w: 700, fill: tc });
      var dy = y + 14 + nl.length * 15;
      s += '<path d="M' + x + ' ' + dy + ' H' + (x + w) + '" stroke="' + st + '" stroke-width="1.1"/>';
      var bl = fitList(n.body, w - 20, y + h - dy - 8, true);
      s += tlist(x + 10, dy + 5, bl.L, { fs: bl.fs, lh: bl.lh, fill: tc });
    } else s += lab(w - 20);
    return s;
  }
  return s;
}
export var drawUml: typeof drawUml__base = drawUml__base;
export function set_drawUml(v: typeof drawUml__base) {
  return (drawUml = v);
}

// ---------- containers (boxes) ----------
export function drawBox__base(n, noLabel) {
  var k = T[n.t].k,
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    st = validColor(n.stroke) ? n.stroke : TH.ink,
    tc = validColor(n.textColor) ? n.textColor : TH.text,
    s = '',
    hasFill = validColor(n.fill);
  var hit =
    '<rect x="' +
    x +
    '" y="' +
    y +
    '" width="' +
    w +
    '" height="' +
    h +
    '" rx="' +
    (k === 'phone' ? 40 : 12) +
    '" fill="' +
    (hasFill ? n.fill : TH.paper) +
    '" fill-opacity="' +
    (hasFill ? 1 : 0.001) +
    '"/>';
  if (k === 'boundary') {
    s =
      hit +
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="6" fill="none" stroke="' +
      st +
      '" stroke-width="1.5"/>';
    if (!noLabel)
      s += tblock(x + w / 2, y + 10, wrapText(n.label, w - 30, 13, 700).slice(0, 2), { fs: 13, w: 700, fill: tc });
    return s;
  }
  if (k === 'package') {
    var tw = Math.min(Math.max(90, textW(n.label || '', 12, 700) + 30), w * 0.7);
    s =
      hit +
      '<path d="M' +
      x +
      ' ' +
      (y + 24) +
      ' V' +
      (y + h) +
      ' H' +
      (x + w) +
      ' V' +
      (y + 24) +
      ' Z M' +
      x +
      ' ' +
      (y + 24) +
      ' V' +
      y +
      ' H' +
      r1(x + tw) +
      ' V' +
      (y + 24) +
      '" fill="none" stroke="' +
      st +
      '" stroke-width="1.5" stroke-linejoin="round"/>';
    if (!noLabel)
      s += tblock(x + 10, y + 12, [n.label || ''], { fs: 12, w: 700, anchor: 'start', vcenter: 1, fill: tc });
    return s;
  }
  if (k === 'frag') {
    var op = n.op || 'alt',
      ow = Math.max(44, textW(op, 12, 700) + 22);
    s =
      hit +
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="none" stroke="' +
      st +
      '" stroke-width="1.4"/><path d="M' +
      x +
      ' ' +
      y +
      ' H' +
      r1(x + ow) +
      ' V' +
      (y + 16) +
      ' L' +
      r1(x + ow - 10) +
      ' ' +
      (y + 26) +
      ' H' +
      x +
      ' Z" fill="' +
      TH.shape +
      '" stroke="' +
      st +
      '" stroke-width="1.4"/>' +
      tblock(x + 8, y + 13, [op], { fs: 12, w: 700, anchor: 'start', vcenter: 1, fill: tc });
    if (!noLabel && n.label)
      s += tblock(x + ow + 10, y + 13, [n.label], { fs: 12, anchor: 'start', vcenter: 1, fill: tc });
    if (n.split) {
      var sy = y + h * n.split;
      s +=
        '<path d="M' +
        x +
        ' ' +
        r1(sy) +
        ' H' +
        (x + w) +
        '" stroke="' +
        st +
        '" stroke-width="1.2" stroke-dasharray="7 4"/>';
      if (n.label2) s += tblock(x + 10, sy + 6, [n.label2], { fs: 12, anchor: 'start', fill: tc });
    }
    return s;
  }
  if (k === 'c4b') {
    var bc = validColor(n.stroke) ? n.stroke : TH.muted;
    s =
      hit +
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="8" fill="none" stroke="' +
      bc +
      '" stroke-width="1.6" stroke-dasharray="9 5"/>';
    if (!noLabel) {
      s += tblock(x + 14, y + h - 36, [n.label || ''], { fs: 13, w: 700, anchor: 'start', fill: tc });
      s += tblock(x + 14, y + h - 19, ['[' + (n.sub || 'Software System') + ']'], {
        fs: 11,
        anchor: 'start',
        fill: TH.muted,
      });
    }
    return s;
  }
  if (k === 'frame') {
    s =
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="12" fill="' +
      (hasFill ? n.fill : TH.card) +
      '" stroke="' +
      (validColor(n.stroke) ? n.stroke : TH.cardLine) +
      '" stroke-width="1.3"/>';
    if (!noLabel && n.label) s += tblock(x + 4, y - 20, [n.label], { fs: 13, w: 600, anchor: 'start', fill: TH.muted });
    return s;
  }
  if (k === 'phone') {
    s =
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="40" fill="' +
      (hasFill ? n.fill : TH.card) +
      '" stroke="' +
      st +
      '" stroke-width="2.2"/><rect x="' +
      r1(x + w / 2 - w * 0.16) +
      '" y="' +
      (y + 12) +
      '" width="' +
      r1(w * 0.32) +
      '" height="18" rx="9" fill="' +
      st +
      '" fill-opacity=".85"/>';
    if (!noLabel && n.label) s += tblock(x + 4, y - 20, [n.label], { fs: 13, w: 600, anchor: 'start', fill: TH.muted });
    return s;
  }
  if (k === 'browser') {
    var g1 = TH.name === 'dark' ? '#232a35' : '#eef1f5';
    s =
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="10" fill="' +
      (hasFill ? n.fill : TH.card) +
      '" stroke="' +
      st +
      '" stroke-width="1.6"/><path d="' +
      topRoundPath(x, y, w, 38, 10) +
      '" fill="' +
      g1 +
      '"/><path d="M' +
      x +
      ' ' +
      (y + 38) +
      ' H' +
      (x + w) +
      '" stroke="' +
      st +
      '" stroke-width="1.2"/>';
    ['#ef6b6b', '#f2c14b', '#5ec46f'].forEach(function (c, i) {
      s += '<circle cx="' + (x + 18 + i * 16) + '" cy="' + (y + 19) + '" r="5" fill="' + c + '"/>';
    });
    s +=
      '<rect x="' +
      (x + 76) +
      '" y="' +
      (y + 9) +
      '" width="' +
      Math.max(60, w - 160) +
      '" height="20" rx="10" fill="' +
      TH.card +
      '" stroke="' +
      TH.cardLine +
      '"/>';
    if (!noLabel && n.label)
      s += tblock(x + 90, y + 19, [n.label], { fs: 11, anchor: 'start', vcenter: 1, fill: TH.muted });
    return s;
  }
  return hit;
}
export var drawBox: typeof drawBox__base = drawBox__base;
export function set_drawBox(v: typeof drawBox__base) {
  return (drawBox = v);
}

// ---------- ERD ----------
export function drawEr(n, noLabel) {
  var k = T[n.t].k,
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    st = validColor(n.stroke) ? n.stroke : TH.ink,
    fl = validColor(n.fill) ? n.fill : TH.shape,
    tc = validColor(n.textColor) ? n.textColor : TH.text,
    s = '',
    a = ' stroke="' + st + '" stroke-width="1.6"',
    cx = x + w / 2,
    cy = y + h / 2;
  var lab = function (mw, o?) {
    return noLabel
      ? ''
      : tblock(cx, cy, wrapText(n.label, mw, 12, o && o.b ? 700 : 400), {
          fs: 12,
          vcenter: 1,
          w: o && o.b ? 700 : 0,
          fill: tc,
          deco: o && o.u ? 'underline' : '',
        });
  };
  if (k === 'table') {
    var cols = parseCols(n.body),
      tone = validColor(n.fill) ? n.fill : TH.sel,
      pk = TH.name === 'dark' ? '#f0b04a' : '#a5640a';
    s +=
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + TH.card + '"' + a + '/>';
    s +=
      '<path d="' +
      topRoundPath(x + 0.8, y + 0.8, w - 1.6, 35, 7) +
      '" fill="' +
      tone +
      '" fill-opacity="' +
      (validColor(n.fill) ? 1 : 0.14) +
      '"/><path d="M' +
      x +
      ' ' +
      (y + 36) +
      ' H' +
      (x + w) +
      '" stroke="' +
      st +
      '" stroke-width="1.2"/>';
    if (!noLabel)
      s += tblock(x + 12, y + 18, [n.label || ''], {
        fs: 13,
        w: 700,
        anchor: 'start',
        vcenter: 1,
        fill: validColor(n.fill) ? onColor(n.fill) : tc,
      });
    cols.forEach(function (c, i) {
      var ry = y + 36 + i * 24 + 12;
      if (i)
        s +=
          '<path d="M' +
          (x + 1) +
          ' ' +
          (y + 36 + i * 24) +
          ' H' +
          (x + w - 1) +
          '" stroke="' +
          TH.cardLine +
          '" stroke-width="1"/>';
      if (c.key)
        s += tblock(x + 10, ry, [c.key.replace(' ', '·')], {
          fs: 9.5,
          w: 700,
          anchor: 'start',
          vcenter: 1,
          fill: c.key.indexOf('PK') >= 0 ? pk : TH.muted,
        });
      s += tblock(x + 40, ry, [c.name], {
        fs: 12,
        anchor: 'start',
        vcenter: 1,
        fill: tc,
        w: c.key.indexOf('PK') >= 0 ? 600 : 0,
      });
      if (c.type)
        s += tblock(x + w - 12, ry, [c.type], { fs: 11, anchor: 'end', vcenter: 1, fill: TH.muted }).replace(
          '<text',
          '<text font-family="' + esc(MONO) + '"',
        );
    });
    return s;
  }
  if (k === 'entity')
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="' +
      fl +
      '"' +
      a +
      '/>' +
      lab(w - 16, { b: 1 })
    );
  if (k === 'weak')
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="' +
      fl +
      '"' +
      a +
      '/><rect x="' +
      (x + 4) +
      '" y="' +
      (y + 4) +
      '" width="' +
      (w - 8) +
      '" height="' +
      (h - 8) +
      '" fill="none" stroke="' +
      st +
      '" stroke-width="1.2"/>' +
      lab(w - 20, { b: 1 })
    );
  if (k === 'attr' || k === 'key' || k === 'derived')
    return (
      '<ellipse cx="' +
      r1(cx) +
      '" cy="' +
      r1(cy) +
      '" rx="' +
      r1(w / 2) +
      '" ry="' +
      r1(h / 2) +
      '" fill="' +
      fl +
      '"' +
      a +
      (k === 'derived' ? ' stroke-dasharray="5 3"' : '') +
      '/>' +
      lab(w * 0.78, { u: k === 'key' })
    );
  if (k === 'multi')
    return (
      '<ellipse cx="' +
      r1(cx) +
      '" cy="' +
      r1(cy) +
      '" rx="' +
      r1(w / 2) +
      '" ry="' +
      r1(h / 2) +
      '" fill="' +
      fl +
      '"' +
      a +
      '/><ellipse cx="' +
      r1(cx) +
      '" cy="' +
      r1(cy) +
      '" rx="' +
      r1(w / 2 - 4) +
      '" ry="' +
      r1(h / 2 - 4) +
      '" fill="none" stroke="' +
      st +
      '" stroke-width="1.2"/>' +
      lab(w * 0.72)
    );
  if (k === 'rel' || k === 'idrel') {
    s =
      '<path d="M' +
      r1(cx) +
      ' ' +
      y +
      ' L' +
      (x + w) +
      ' ' +
      r1(cy) +
      ' L' +
      r1(cx) +
      ' ' +
      (y + h) +
      ' L' +
      x +
      ' ' +
      r1(cy) +
      ' Z" fill="' +
      fl +
      '"' +
      a +
      ' stroke-linejoin="round"/>';
    if (k === 'idrel')
      s +=
        '<path d="M' +
        r1(cx) +
        ' ' +
        (y + 7) +
        ' L' +
        (x + w - 11) +
        ' ' +
        r1(cy) +
        ' L' +
        r1(cx) +
        ' ' +
        (y + h - 7) +
        ' L' +
        (x + 11) +
        ' ' +
        r1(cy) +
        ' Z" fill="none" stroke="' +
        st +
        '" stroke-width="1.2" stroke-linejoin="round"/>';
    return s + lab(w * 0.55);
  }
  return s;
}

// ---------- DFD ----------
export function drawDfd(n, noLabel) {
  var k = T[n.t].k,
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    st = validColor(n.stroke) ? n.stroke : TH.ink,
    fl = validColor(n.fill) ? n.fill : TH.shape,
    tc = validColor(n.textColor) ? n.textColor : TH.text,
    s = '',
    cx = x + w / 2,
    cy = y + h / 2;
  if (k === 'ext') {
    s =
      '<rect x="' +
      (x + 4) +
      '" y="' +
      (y + 4) +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="' +
      st +
      '" fill-opacity=".14"/><rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="' +
      fl +
      '" stroke="' +
      st +
      '" stroke-width="2"/>';
    if (!noLabel) s += tblock(cx, cy, wrapText(n.label, w - 16, 12, 700), { fs: 12, w: 700, vcenter: 1, fill: tc });
    return s;
  }
  if (k === 'proc') {
    var rx = w / 2,
      ry = h / 2;
    s =
      '<ellipse cx="' +
      r1(cx) +
      '" cy="' +
      r1(cy) +
      '" rx="' +
      r1(rx) +
      '" ry="' +
      r1(ry) +
      '" fill="' +
      fl +
      '" stroke="' +
      st +
      '" stroke-width="1.7"/>';
    var yl = cy - ry * 0.36,
      half = rx * Math.sqrt(1 - 0.36 * 0.36);
    s +=
      '<path d="M' + r1(cx - half) + ' ' + r1(yl) + ' H' + r1(cx + half) + '" stroke="' + st + '" stroke-width="1.2"/>';
    if (!noLabel) {
      if (n.num) s += tblock(cx, (y + yl) / 2 + 2, [n.num], { fs: 11, w: 700, vcenter: 1, fill: tc });
      s += tblock(cx, (yl + y + h) / 2, wrapText(n.label, w * 0.74, 12), { fs: 12, vcenter: 1, fill: tc });
    }
    return s;
  }
  if (k === 'procgs') {
    s =
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="12" fill="' +
      fl +
      '" stroke="' +
      st +
      '" stroke-width="1.7"/><path d="M' +
      x +
      ' ' +
      (y + 26) +
      ' H' +
      (x + w) +
      '" stroke="' +
      st +
      '" stroke-width="1.2"/>';
    if (!noLabel) {
      if (n.num) s += tblock(x + 12, y + 13, [n.num], { fs: 11, w: 700, anchor: 'start', vcenter: 1, fill: tc });
      s += tblock(cx, y + 26 + (h - 26) / 2, wrapText(n.label, w - 20, 12), { fs: 12, vcenter: 1, fill: tc });
    }
    return s;
  }
  if (k === 'store') {
    var cw = 48;
    s =
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="' +
      fl +
      '"/><path d="M' +
      (x + w) +
      ' ' +
      y +
      ' H' +
      x +
      ' V' +
      (y + h) +
      ' H' +
      (x + w) +
      ' M' +
      (x + cw) +
      ' ' +
      y +
      ' V' +
      (y + h) +
      '" fill="none" stroke="' +
      st +
      '" stroke-width="1.7"/>';
    if (!noLabel) {
      if (n.num) s += tblock(x + cw / 2, cy, [n.num], { fs: 12, w: 700, vcenter: 1, fill: tc });
      s += tblock(x + cw + 10, cy, wrapText(n.label, w - cw - 18, 12).slice(0, 2), {
        fs: 12,
        anchor: 'start',
        vcenter: 1,
        fill: tc,
      });
    }
    return s;
  }
  return s;
}

// ---------- C4 ----------
export var C4C = {
  person: '#08427b',
  extperson: '#686868',
  system: '#1168bd',
  container: '#438dd5',
  component: '#85bbf0',
  db: '#438dd5',
  ext: '#8a8a8a',
};
export function c4Type(n) {
  var k = T[n.t].k,
    s = n.sub;
  return k === 'person'
    ? '[Person]'
    : k === 'extperson'
      ? '[External person]'
      : k === 'system'
        ? '[Software System]'
        : k === 'ext'
          ? '[External system]'
          : k === 'db'
            ? '[Container: ' + (s || 'Database') + ']'
            : k === 'component'
              ? '[Component' + (s ? ': ' + s : '') + ']'
              : '[Container' + (s ? ': ' + s : '') + ']';
}
export function drawC4(n, noLabel) {
  var k = T[n.t].k,
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    fl = validColor(n.fill) ? n.fill : C4C[k],
    tc = validColor(n.textColor) ? n.textColor : onColor(fl),
    s = '',
    top = y,
    bh = h;
  var sto = ' stroke="#000000" stroke-opacity=".18" stroke-width="1.2"';
  if (k === 'person' || k === 'extperson') {
    var r = Math.min(w * 0.19, h * 0.2);
    s += '<circle cx="' + r1(x + w / 2) + '" cy="' + r1(y + r) + '" r="' + r1(r) + '" fill="' + fl + '"' + sto + '/>';
    top = y + r * 1.55;
    bh = y + h - top;
    s +=
      '<rect x="' +
      x +
      '" y="' +
      r1(top) +
      '" width="' +
      w +
      '" height="' +
      r1(bh) +
      '" rx="22" fill="' +
      fl +
      '"' +
      sto +
      '/>';
  } else if (k === 'db') {
    var ry = Math.min(14, h * 0.1);
    s +=
      '<path d="M' +
      x +
      ' ' +
      (y + ry) +
      ' V' +
      (y + h - ry) +
      ' A' +
      w / 2 +
      ' ' +
      ry +
      ' 0 0 0 ' +
      (x + w) +
      ' ' +
      (y + h - ry) +
      ' V' +
      (y + ry) +
      '" fill="' +
      fl +
      '"' +
      sto +
      '/><ellipse cx="' +
      r1(x + w / 2) +
      '" cy="' +
      (y + ry) +
      '" rx="' +
      r1(w / 2) +
      '" ry="' +
      ry +
      '" fill="' +
      fl +
      '"' +
      sto +
      '/>';
    top = y + ry * 2;
    bh = h - ry * 2;
  } else
    s +=
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" fill="' + fl + '"' + sto + '/>';
  if (noLabel) return s;
  var nL = wrapText(n.label, w - 24, 14, 700),
    tL = wrapText(c4Type(n), w - 24, 11),
    dL = n.body ? wrapText(n.body, w - 24, 11) : [];
  var tot = nL.length * 17 + tL.length * 14 + (dL.length ? dL.length * 14 + 8 : 0);
  if (tot > bh - 16) {
    dL = dL.slice(0, Math.max(0, Math.floor((bh - 16 - nL.length * 17 - tL.length * 14 - 8) / 14)));
    tot = nL.length * 17 + tL.length * 14 + (dL.length ? dL.length * 14 + 8 : 0);
  }
  var ty = top + (bh - tot) / 2;
  s += tblock(x + w / 2, ty, nL, { fs: 14, lh: 17, w: 700, fill: tc });
  ty += nL.length * 17;
  s += tblock(x + w / 2, ty, tL, { fs: 11, lh: 14, fill: tc, op: 0.85 });
  ty += tL.length * 14 + 8;
  if (dL.length) s += tblock(x + w / 2, ty, dL, { fs: 11, lh: 14, fill: tc });
  return s;
}

// ---------- user flow & wireframe ----------
export function wfGray() {
  return TH.name === 'dark' ? ['#252c38', '#3a4352'] : ['#eceff4', '#cfd5de'];
}
export function bar(x, y, w, h, c) {
  return (
    '<rect x="' +
    r1(x) +
    '" y="' +
    r1(y) +
    '" width="' +
    r1(Math.max(0, w)) +
    '" height="' +
    h +
    '" rx="' +
    h / 2 +
    '" fill="' +
    c +
    '"/>'
  );
}
export function drawUx(n, noLabel) {
  var x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    g = wfGray(),
    s = '';
  s +=
    '<rect x="' +
    x +
    '" y="' +
    y +
    '" width="' +
    w +
    '" height="' +
    h +
    '" rx="12" fill="' +
    (validColor(n.fill) ? n.fill : TH.card) +
    '" stroke="' +
    (validColor(n.stroke) ? n.stroke : TH.cardLine) +
    '" stroke-width="1.4"/>';
  s += '<path d="' + topRoundPath(x + 0.7, y + 0.7, w - 1.4, 30, 11) + '" fill="' + TH.sel + '" fill-opacity=".12"/>';
  if (!noLabel)
    s += tblock(x + 12, y + 15, [wrapText(n.label, w - 24, 12, 700)[0] || ''], {
      fs: 12,
      w: 700,
      anchor: 'start',
      vcenter: 1,
      fill: validColor(n.textColor) ? n.textColor : TH.text,
    });
  var yy = y + 42;
  [0.82, 0.6, 0.7].forEach(function (f) {
    if (yy + 8 < y + h - 28) {
      s += bar(x + 12, yy, (w - 24) * f, 8, g[1]);
      yy += 16;
    }
  });
  if (h > 90)
    s +=
      '<rect x="' +
      (x + 12) +
      '" y="' +
      (y + h - 34) +
      '" width="' +
      r1(Math.min(110, w - 24)) +
      '" height="22" rx="7" fill="' +
      TH.sel +
      '" fill-opacity=".35"/>';
  return s;
}
export function drawWf(n, noLabel) {
  var k = T[n.t].k,
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    g = wfGray(),
    st = validColor(n.stroke) ? n.stroke : g[1],
    tc = validColor(n.textColor) ? n.textColor : TH.text,
    s = '',
    cy = y + h / 2,
    lab = noLabel ? '' : n.label || '';
  if (k === 'heading') {
    s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="transparent"/>';
    s += lab
      ? tblock(x, cy, [wrapText(lab, w, 18, 700)[0]], { fs: 18, w: 700, anchor: 'start', vcenter: 1, fill: tc })
      : bar(x, cy - 7, w * 0.7, 14, g[1]);
    return s;
  }
  if (k === 'text') {
    s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="transparent"/>';
    if (lab) {
      var fl = fitList(lab, w, h, true);
      s += tlist(x, y, fl.L, { fs: fl.fs, lh: fl.lh, fill: TH.muted });
    } else {
      var yy = y + 4;
      [1, 0.94, 0.98, 0.6].forEach(function (f) {
        if (yy + 8 <= y + h) {
          s += bar(x, yy, w * f, 8, g[1]);
          yy += 15;
        }
      });
    }
    return s;
  }
  if (k === 'button') {
    var bf = validColor(n.fill) ? n.fill : TH.ink;
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="9" fill="' +
      bf +
      '"/>' +
      (lab
        ? tblock(x + w / 2, cy, [lab], {
            fs: 13,
            w: 600,
            vcenter: 1,
            fill: validColor(n.textColor) ? n.textColor : onColor(bf),
          })
        : '')
    );
  }
  if (k === 'input')
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="8" fill="' +
      TH.card +
      '" stroke="' +
      st +
      '" stroke-width="1.5"/>' +
      (lab ? tblock(x + 12, cy, [lab], { fs: 12, anchor: 'start', vcenter: 1, fill: TH.muted }) : '')
    );
  if (k === 'search')
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="' +
      h / 2 +
      '" fill="' +
      g[0] +
      '" stroke="' +
      st +
      '" stroke-width="1.2"/>' +
      iconG('search', x + 12, cy - 8, 0.67, TH.muted, 2) +
      (lab ? tblock(x + 36, cy, [lab], { fs: 12, anchor: 'start', vcenter: 1, fill: TH.muted }) : '')
    );
  if (k === 'image') {
    var isz = Math.min(w, h) * 0.28;
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="8" fill="' +
      g[0] +
      '" stroke="' +
      st +
      '" stroke-width="1.2"/><path d="M' +
      x +
      ' ' +
      y +
      ' L' +
      (x + w) +
      ' ' +
      (y + h) +
      ' M' +
      (x + w) +
      ' ' +
      y +
      ' L' +
      x +
      ' ' +
      (y + h) +
      '" stroke="' +
      st +
      '" stroke-width="1" stroke-opacity=".7"/>' +
      iconG('image', x + w / 2 - isz / 2, cy - isz / 2, isz / 24, TH.muted, 1.6)
    );
  }
  if (k === 'card') {
    var ih = h * 0.5;
    s =
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="12" fill="' +
      TH.card +
      '" stroke="' +
      st +
      '" stroke-width="1.4"/><path d="' +
      topRoundPath(x + 0.7, y + 0.7, w - 1.4, ih, 11) +
      '" fill="' +
      g[0] +
      '"/>';
    s += iconG('image', x + w / 2 - 12, y + ih / 2 - 12, 1, TH.muted, 1.6);
    s += tblock(x + 14, y + ih + 16, [lab || ''], { fs: 13, w: 700, anchor: 'start', vcenter: 1, fill: tc });
    var yy2 = y + ih + 34;
    [0.86, 0.6].forEach(function (f) {
      if (yy2 + 8 < y + h - 8) {
        s += bar(x + 14, yy2, (w - 28) * f, 8, g[1]);
        yy2 += 15;
      }
    });
    return s;
  }
  if (k === 'list') {
    var rows = n.rows || 4,
      rh = h / rows;
    s =
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="10" fill="' +
      TH.card +
      '" stroke="' +
      st +
      '" stroke-width="1.2"/>';
    for (var i = 0; i < rows; i++) {
      var ry = y + i * rh;
      if (i)
        s += '<path d="M' + (x + 12) + ' ' + r1(ry) + ' H' + (x + w - 12) + '" stroke="' + st + '" stroke-width="1"/>';
      var rr = Math.min(14, rh * 0.3);
      s +=
        '<circle cx="' +
        (x + 14 + rr) +
        '" cy="' +
        r1(ry + rh / 2) +
        '" r="' +
        r1(rr) +
        '" fill="' +
        g[1] +
        '"/>' +
        bar(x + 24 + rr * 2, ry + rh / 2 - 9, (w - 60) * 0.7, 8, g[1]) +
        bar(x + 24 + rr * 2, ry + rh / 2 + 3, (w - 60) * 0.45, 7, g[0]);
    }
    return s;
  }
  if (k === 'nav') {
    s =
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="' +
      g[0] +
      '"/><path d="M' +
      x +
      ' ' +
      (y + h) +
      ' H' +
      (x + w) +
      '" stroke="' +
      st +
      '"/>';
    s += iconG('menu', x + 12, cy - 10, 0.84, tc, 2);
    s += tblock(x + 44, cy, [lab], { fs: 14, w: 700, anchor: 'start', vcenter: 1, fill: tc });
    s += '<circle cx="' + (x + w - 26) + '" cy="' + r1(cy) + '" r="13" fill="' + g[1] + '"/>';
    return s;
  }
  if (k === 'tabbar') {
    s =
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="' +
      TH.card +
      '"/><path d="M' +
      x +
      ' ' +
      y +
      ' H' +
      (x + w) +
      '" stroke="' +
      st +
      '"/>';
    ['layout-grid', 'search', 'bell', 'user'].forEach(function (icn, i) {
      var tx = x + (w * (i + 0.5)) / 4;
      s +=
        iconG(icn, tx - 10, y + 10, 0.84, i === 0 ? TH.sel : TH.muted, 2) +
        bar(tx - 14, y + h - 16, 28, 6, i === 0 ? TH.sel : g[1]);
    });
    return s;
  }
  if (k === 'checkbox')
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="transparent"/><rect x="' +
      x +
      '" y="' +
      r1(cy - 9) +
      '" width="18" height="18" rx="4" fill="' +
      TH.sel +
      '"/><path d="M' +
      (x + 4.5) +
      ' ' +
      r1(cy) +
      ' l3.5 3.5 l6 -7" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      tblock(x + 28, cy, [lab], { fs: 12, anchor: 'start', vcenter: 1, fill: tc })
    );
  if (k === 'toggle')
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="transparent"/>' +
      tblock(x, cy, [lab], { fs: 12, anchor: 'start', vcenter: 1, fill: tc }) +
      '<rect x="' +
      (x + w - 40) +
      '" y="' +
      r1(cy - 11) +
      '" width="40" height="22" rx="11" fill="' +
      TH.sel +
      '"/><circle cx="' +
      (x + w - 11) +
      '" cy="' +
      r1(cy) +
      '" r="8" fill="#ffffff"/>'
    );
  if (k === 'avatar') {
    var R = Math.min(w, h) / 2;
    return (
      '<circle cx="' +
      r1(x + w / 2) +
      '" cy="' +
      r1(cy) +
      '" r="' +
      r1(R) +
      '" fill="' +
      g[0] +
      '" stroke="' +
      st +
      '" stroke-width="1.2"/>' +
      iconG('user', x + w / 2 - R * 0.55, cy - R * 0.55, (R * 1.1) / 24, TH.muted, 1.8)
    );
  }
  if (k === 'chip')
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" rx="' +
      h / 2 +
      '" fill="' +
      g[0] +
      '" stroke="' +
      st +
      '" stroke-width="1.2"/>' +
      tblock(x + w / 2, cy, [lab], { fs: 12, vcenter: 1, fill: tc })
    );
  if (k === 'divider')
    return (
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="transparent"/><path d="M' +
      x +
      ' ' +
      r1(cy) +
      ' H' +
      (x + w) +
      '" stroke="' +
      st +
      '" stroke-width="1.5"/>'
    );
  return s;
}

// ---------- pen drawing ----------
export function smoothPath(P) {
  if (!P.length) return '';
  var d = 'M' + r1(P[0].x) + ' ' + r1(P[0].y);
  if (P.length < 3) {
    for (var i = 1; i < P.length; i++) d += ' L' + r1(P[i].x) + ' ' + r1(P[i].y);
    return d;
  }
  for (var j = 1; j < P.length - 1; j++) {
    var m = { x: (P[j].x + P[j + 1].x) / 2, y: (P[j].y + P[j + 1].y) / 2 };
    d += ' Q' + r1(P[j].x) + ' ' + r1(P[j].y) + ' ' + r1(m.x) + ' ' + r1(m.y);
  }
  var L = P[P.length - 1];
  return d + ' L' + r1(L.x) + ' ' + r1(L.y);
}
export function drawDraw(n) {
  var w0 = n.w0 || n.w || 1,
    h0 = n.h0 || n.h || 1,
    sx = n.w / Math.max(1, w0),
    sy = n.h / Math.max(1, h0);
  var P = (n.pts || []).map(function (p) {
      return { x: n.x + p[0] * sx, y: n.y + p[1] * sy };
    }),
    d = smoothPath(P),
    c = validColor(n.stroke) ? n.stroke : TH.ink,
    sw = n.sw || 2.5;
  return (
    '<path d="' +
    d +
    '" fill="none" stroke="transparent" stroke-width="' +
    Math.max(14, sw + 10) +
    '" stroke-linecap="round" stroke-linejoin="round"/><path d="' +
    d +
    '" fill="none" stroke="' +
    c +
    '" stroke-width="' +
    sw +
    '" stroke-linecap="round" stroke-linejoin="round"/>'
  );
}

// ---------- extra markers ----------
export function extraMarker(kind, c, sc, id) {
  if (kind === 'tri')
    return (
      '<marker' +
      id +
      ' viewBox="0 0 14 14" refX="13" refY="7" markerWidth="' +
      r1(15 * sc) +
      '" markerHeight="' +
      r1(15 * sc) +
      '" orient="auto"><path d="M1,1 L13,7 L1,13 z" fill="' +
      TH.paper +
      '" stroke="' +
      c +
      '" stroke-width="1.2" stroke-linejoin="round"/></marker>'
    );
  if (kind === 'diaO' || kind === 'diaF')
    return (
      '<marker' +
      id +
      ' viewBox="0 0 22 12" refX="1" refY="6" markerWidth="' +
      r1(20 * sc) +
      '" markerHeight="' +
      r1(11 * sc) +
      '" orient="auto"><path d="M1,6 L11,1 L21,6 L11,11 z" fill="' +
      (kind === 'diaF' ? c : TH.paper) +
      '" stroke="' +
      c +
      '" stroke-width="1.2" stroke-linejoin="round"/></marker>'
    );
  if (kind.indexOf('cf-') === 0) {
    var t = kind.slice(3),
      p = '',
      circ = '';
    if (t === 'only') p = 'M15,2 V14 M20,2 V14';
    else if (t === 'one') p = 'M18,2 V14';
    else if (t === 'zone') {
      p = 'M20,2 V14';
      circ = '<circle cx="10" cy="8" r="4" fill="' + TH.paper + '" stroke="' + c + '" stroke-width="1.4"/>';
    } else if (t === 'many') p = 'M12,8 L24,1 M12,8 L24,8 M12,8 L24,15';
    else if (t === 'omany') p = 'M8,2 V14 M12,8 L24,1 M12,8 L24,8 M12,8 L24,15';
    else if (t === 'zmany') {
      p = 'M12,8 L24,1 M12,8 L24,8 M12,8 L24,15';
      circ = '<circle cx="6" cy="8" r="4" fill="' + TH.paper + '" stroke="' + c + '" stroke-width="1.4"/>';
    }
    return (
      '<marker' +
      id +
      ' viewBox="0 0 24 16" refX="24" refY="8" markerWidth="' +
      r1(24 * sc) +
      '" markerHeight="' +
      r1(16 * sc) +
      '" orient="auto-start-reverse"><path d="' +
      p +
      '" fill="none" stroke="' +
      c +
      '" stroke-width="1.5"/>' +
      circ +
      '</marker>'
    );
  }
  return '';
}

// ---------- My icons (user uploads) ----------
export var ICONLIB: Dict<any> = {};
export var ICONBYNAME = {};
export function normName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\.(png|svg|jpe?g|webp|gif)$/, '')
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '');
}
export var NAME_JUNK =
  /(^|\s)(logo|logos|icon|logomark|wordmark|mark|symbol|brand|color|colour|colored|full|white|black|dark|light|mono|flat|square|round|official|v\d+|\d+)$/;
export function cleanIconName(s) {
  s = String(s || '')
    .replace(/\.(png|svg|jpe?g|webp|gif)$/i, '')
    .replace(/[_\-.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  var g = 0;
  while (s && NAME_JUNK.test(s.toLowerCase()) && g++ < 5) s = s.replace(/\s*\S+$/, '').trim();
  return s.slice(0, 40);
}
export function reindexIcons() {
  ICONBYNAME = {};
  Object.keys(ICONLIB)
    .sort(function (a, b) {
      return (ICONLIB[b].createdAt || 0) - (ICONLIB[a].createdAt || 0);
    })
    .forEach(function (id) {
      var k = normName(ICONLIB[id].name);
      if (k && !ICONBYNAME[k]) ICONBYNAME[k] = id;
    });
}
export function techIconId(name) {
  var id = ICONBYNAME[normName(name)] || ICONBYNAME[normName(String(name).replace(/\s+(API|CSS|ORM)$/i, ''))];
  if (id) return id;
  var al = TECH_ALIAS[name] || [];
  for (var i = 0; i < al.length; i++) if (ICONBYNAME[al[i]]) return ICONBYNAME[al[i]];
  return null;
}
export function iconIdFor(n) {
  if (n.img && ICONLIB[n.img]) return n.img;
  var d = T[n.t];
  if (d && d.tech && !n.icon) {
    var id = techIconId(d.n);
    if (id) return id;
  }
  if (n.t === 'c-logo' && n.label) {
    var id2 = ICONBYNAME[normName(n.label)];
    if (id2) return id2;
  }
  return null;
}
export function compImg__base(n) {
  var id = iconIdFor(n);
  return id ? ICONLIB[id] : null;
}
export var compImg: typeof compImg__base = compImg__base;
export function set_compImg(v: typeof compImg__base) {
  return (compImg = v);
}
export function imgTag(im, x, y, w, h) {
  return (
    '<image href="' +
    im.data +
    '" x="' +
    r1(x) +
    '" y="' +
    r1(y) +
    '" width="' +
    r1(w) +
    '" height="' +
    r1(h) +
    '" preserveAspectRatio="xMidYMid meet"/>'
  );
}
