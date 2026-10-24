// ================= block builders =================
import type { DiagramEdge, DiagramNode, Dict } from '../core/types';
import { EDGE, S, T, byId, clamp, fam, nid, pushUndo, set_selE, set_selN, snap, textW } from '../core/core';
import { DT } from './catalog';
import { TREED, TREEP, autosize, computeTree } from './draw';
import { addEdge, addNode, autoType, bounds, commitEdit, renderAll, startEdit, styleEdge } from '../core/ui';
import { TPL, TPL_NAMES, layered } from '../core/features';
import { buildBoard } from '../ai/generate';

export function C(key, x, y, w, h, label, o) {
  var n: Record<string, any> = { key: key, t: 'k-cell', x: x, y: y, w: w, h: h, label: label || '' };
  if (o) for (var k in o) n[k] = o[k];
  return n;
}
export function TX(key, x, y, w, h, label, o) {
  var n: Record<string, any> = { key: key, t: 'text', x: x, y: y, w: w, h: h, label: label || '' };
  if (o) for (var k in o) n[k] = o[k];
  return n;
}
export function E(from, to, type, label?, o?) {
  var e: Record<string, any> = { from: from, to: to, type: type || 'sync', label: label || '' };
  if (o) for (var k in o) e[k] = o[k];
  return e;
}
export function insertBlock(spec, ox, oy) {
  var map = {},
    ids = [],
    grp = 'g' + S.seq++;
  spec.nodes.forEach(function (o) {
    var n = {} as DiagramNode;
    for (var k in o) if (k !== 'key') n[k] = o[k];
    n.id = nid();
    n.grp = grp;
    n.x = Math.round(o.x + ox);
    n.y = Math.round(o.y + oy);
    if (n.t === 'k-cell' && n.body == null) n.body = '';
    if (n.body === '') delete n.body;
    S.nodes.push(n);
    map[o.key] = n.id;
    ids.push(n.id);
  });
  (spec.edges || []).forEach(function (o) {
    var e = { id: 'e' + S.seq++, type: o.type, label: o.label || '' } as DiagramEdge;
    for (var k in o) if (['from', 'to', 'type', 'label'].indexOf(k) < 0) e[k] = o[k];
    e.from = map[o.from];
    e.to = map[o.to];
    if (!e.from || !e.to) return;
    S.edges.push(e);
  });
  return ids;
}
export function lines(t) {
  return String(t || '')
    .split('\n')
    .map(function (x) {
      return x.trim();
    })
    .filter(Boolean);
}
export function titleNode(d, w) {
  return d.judul ? [TX('title', 0, 0, w, 30, d.judul, { fs: 18, bold: 1 })] : [];
}

export var FW: Dict<any> = {
  swot: {
    n: 'SWOT',
    icon: 'grid-2x2',
    build: function (d) {
      var CW = 440,
        CH = 230,
        G = 8,
        X = 36,
        Y = d.judul ? 40 : 0,
        s = titleNode(d, X + CW * 2 + G);
      s.push(
        TX('h1', X, Y, CW, 24, 'Membantu (helpful)', { bold: 1, muted: 1 }),
        TX('h2', X + CW + G, Y, CW, 24, 'Menghambat (harmful)', { bold: 1, muted: 1 }),
      );
      var y0 = Y + 28;
      [
        ['s', 'Strengths (S)', '#137a3a', 'Kekuatan internal yang bisa dikendalikan'],
        ['w', 'Weaknesses (W)', '#b42318', 'Kelemahan internal'],
        ['o', 'Opportunities (O)', '#2459d6', 'Peluang dari luar organisasi'],
        ['t', 'Threats (T)', '#9a5a06', 'Ancaman dari luar organisasi'],
      ].forEach(function (c, i) {
        s.push(
          C(c[0], X + (i % 2) * (CW + G), y0 + Math.floor(i / 2) * (CH + G), CW, CH, c[1], {
            tone: c[2],
            head: 'band',
            body: d[c[0]] || '',
            ph: c[3],
          }),
        );
      });
      s.push(
        TX('int', 0, y0, 30, CH, 'Internal', { rot: -90, bold: 1, muted: 1 }),
        TX('ext', 0, y0 + CH + G, 30, CH, 'Eksternal', { rot: -90, bold: 1, muted: 1 }),
      );
      return { nodes: s, edges: [] };
    },
  },
  bmc: {
    n: 'Business Model Canvas',
    icon: 'layout-dashboard',
    build: function (d) {
      var G = 6,
        CW = 236,
        H = 340,
        HB = 140,
        Y = d.judul ? 40 : 0,
        xs = [0, 1, 2, 3, 4].map(function (i) {
          return i * (CW + G);
        }),
        half = (H - G) / 2,
        W = 5 * CW + 4 * G,
        s = titleNode(d, W);
      var B = '#3d63b8',
        A = '#b7791f',
        Gr = '#137a3a',
        R = '#b42318';
      s.push(
        C('kp', xs[0], Y, CW, H, 'Key Partners', {
          tone: B,
          icon: 'link-2',
          body: d.kp,
          ph: 'Mitra dan pemasok utama',
        }),
      );
      s.push(
        C('ka', xs[1], Y, CW, half, 'Key Activities', {
          tone: B,
          icon: 'list-todo',
          body: d.ka,
          ph: 'Aktivitas terpenting agar model bisnis jalan',
        }),
      );
      s.push(
        C('kr', xs[1], Y + half + G, CW, half, 'Key Resources', {
          tone: B,
          icon: 'boxes',
          body: d.kr,
          ph: 'Sumber daya utama',
        }),
      );
      s.push(
        C('vp', xs[2], Y, CW, H, 'Value Propositions', {
          tone: A,
          icon: 'heart',
          body: d.vp,
          ph: 'Nilai yang diberikan ke pelanggan',
        }),
      );
      s.push(
        C('cr', xs[3], Y, CW, half, 'Customer Relationships', {
          tone: Gr,
          icon: 'message-circle',
          body: d.cr,
          ph: 'Cara menjaga hubungan pelanggan',
        }),
      );
      s.push(
        C('ch', xs[3], Y + half + G, CW, half, 'Channels', {
          tone: Gr,
          icon: 'send',
          body: d.ch,
          ph: 'Cara menjangkau pelanggan',
        }),
      );
      s.push(
        C('cs', xs[4], Y, CW, H, 'Customer Segments', {
          tone: Gr,
          icon: 'users',
          body: d.cs,
          ph: 'Siapa pelanggannya',
        }),
      );
      var hw = (W - G) / 2;
      s.push(
        C('cost', 0, Y + H + G, hw, HB, 'Cost Structure', {
          tone: R,
          icon: 'credit-card',
          body: d.cost,
          ph: 'Biaya terbesar',
        }),
      );
      s.push(
        C('rev', hw + G, Y + H + G, hw, HB, 'Revenue Streams', {
          tone: R,
          icon: 'chart-line',
          body: d.rev,
          ph: 'Sumber pendapatan',
        }),
      );
      return { nodes: s, edges: [] };
    },
  },
  vc: {
    n: 'Value Chain',
    icon: 'git-merge',
    build: function (d) {
      var MW = 100,
        BW = 1000,
        Y = d.judul ? 40 : 0,
        rowH = 64,
        G = 4,
        s = titleNode(d, BW + MW + 8);
      [
        ['infra', 'Firm infrastructure', '#5f6b7a'],
        ['hrm', 'Human resource management', '#c9573a'],
        ['tech', 'Technology development', '#2a8fc6'],
        ['proc', 'Procurement', '#c58a1f'],
      ].forEach(function (r, i) {
        s.push(
          C(r[0], 0, Y + i * (rowH + G), BW, rowH, r[1], {
            tone: r[2],
            head: 'side',
            sideW: 200,
            body: d[r[0]],
            ph: 'Satu baris = satu poin',
          }),
        );
      });
      var py = Y + 4 * (rowH + G),
        cw = 196;
      [
        ['inbound', 'Inbound logistics', '#2f5d8a'],
        ['ops', 'Operations', '#3d73a8'],
        ['outbound', 'Outbound logistics', '#4a86c2'],
        ['mkt', 'Marketing & sales', '#5a9ad6'],
        ['service', 'Service', '#6aaee6'],
      ].forEach(function (c, i) {
        s.push(
          C(c[0], i * (cw + 4), py, cw, 210, c[1], {
            tone: c[2],
            head: 'chev',
            first: i === 0,
            body: d[c[0]],
            ph: 'Satu baris = satu poin',
          }),
        );
      });
      s.push(
        C('margin', BW + 8, Y, MW, py + 210 - Y, d.margin || 'MARGIN', {
          shape: 'arrowR',
          mode: 'solid',
          tone: '#b8913a',
          head: 'center',
          nobody: 1,
          vrot: 1,
          big: 1,
        }),
      );
      s.push(
        TX(
          'foot',
          0,
          py + 218,
          BW + MW + 8,
          22,
          'Atas: aktivitas pendukung (support) · Bawah: aktivitas primer · Margin = Value − Cost',
          { muted: 1, fs: 11 },
        ),
      );
      return { nodes: s, edges: [] };
    },
  },
  ff: {
    n: 'Five Forces',
    icon: 'target',
    build: function (d) {
      var SW = 300,
        CW = 330,
        G = 60,
        Y = d.judul ? 40 : 0,
        xL = 0,
        xC = SW + G,
        xR = xC + CW + G,
        s = titleNode(d, xR + SW);
      function body(k) {
        var a = lines(d[k + '_k']),
          b = lines(d[k + '_s']).map(function (x) {
            return 'SI: ' + x;
          });
        return a.concat(b).join('\n');
      }
      s.push(
        C('nw', xC, Y, CW, 150, 'Threat of new entrants', {
          tone: '#b7791f',
          badge: d.nw_l || '',
          body: body('nw'),
          ph: 'Kondisi, bukti, dan usulan SI (awali dengan "SI:")',
        }),
      );
      s.push(
        C('sup', xL, Y + 210, SW, 180, 'Bargaining power of suppliers', {
          tone: '#2459d6',
          badge: d.sup_l || '',
          body: body('sup'),
          ph: 'Kondisi pemasok',
        }),
      );
      s.push(
        C('riv', xC, Y + 210, CW, 180, 'Rivalry among existing competitors', {
          tone: '#b42318',
          badge: d.riv_l || '',
          body: body('riv'),
          ph: 'Persaingan di industri',
        }),
      );
      s.push(
        C('buy', xR, Y + 210, SW, 180, 'Bargaining power of buyers', {
          tone: '#2459d6',
          badge: d.buy_l || '',
          body: body('buy'),
          ph: 'Kondisi pembeli',
        }),
      );
      s.push(
        C('sub', xC, Y + 450, CW, 150, 'Threat of substitute products / services', {
          tone: '#137a3a',
          badge: d.sub_l || '',
          body: body('sub'),
          ph: 'Produk pengganti',
        }),
      );
      s.push(
        C('kes', 0, Y + 630, xR + SW, 100, 'Kesimpulan', {
          tone: '#55606f',
          body: d.kesimpulan,
          ph: 'Kekuatan mana yang paling menekan dan prioritas SI',
        }),
      );
      return {
        nodes: s,
        edges: [
          E('nw', 'riv', 'sync', '', { dir: 'v' }),
          E('sub', 'riv', 'sync', '', { dir: 'v' }),
          E('sup', 'riv', 'sync', '', { dir: 'h' }),
          E('buy', 'riv', 'sync', '', { dir: 'h' }),
        ],
      };
    },
  },
  wsf: {
    n: 'Work System (Alter)',
    icon: 'component',
    build: function (d) {
      var Y = d.judul ? 40 : 0,
        s = titleNode(d, 860);
      s.push(
        C('frame', 0, Y, 860, 520, '', {
          shape: 'trap',
          tw0: 400 / 860,
          tw1: 1,
          mode: 'solid',
          tone: '#26307a',
          deco: 1,
          nobody: 1,
          head: 'none',
        }),
      );
      s.push(
        C('inner', 14, Y + 10, 832, 500, '', {
          shape: 'trap',
          tw0: 372 / 832,
          tw1: 1,
          tone: '#26307a',
          deco: 1,
          nobody: 1,
          head: 'none',
        }),
      );
      s.push(
        C('cus', 260, Y + 34, 340, 84, 'Customers', {
          tone: '#b7791f',
          head: 'ctop',
          body: d.cus,
          ph: 'Siapa yang dilayani',
        }),
      );
      s.push(
        C('ps', 200, Y + 146, 460, 84, 'Products & Services', {
          tone: '#3a8529',
          head: 'ctop',
          body: d.ps,
          ph: 'Apa yang dihasilkan',
        }),
      );
      s.push(
        C('bp', 140, Y + 258, 580, 100, 'Business Process', {
          tone: '#c2410c',
          head: 'ctop',
          body: d.bp,
          ph: 'Langkah kerja utama',
        }),
      );
      s.push(
        C('par', 75, Y + 390, 230, 100, 'Participants', {
          tone: '#b7791f',
          head: 'ctop',
          body: d.par,
          ph: 'Siapa yang bekerja',
        }),
      );
      s.push(
        C('inf', 315, Y + 390, 230, 100, 'Information', {
          tone: '#c2410c',
          head: 'ctop',
          body: d.inf,
          ph: 'Informasi yang dipakai',
        }),
      );
      s.push(
        C('tec', 555, Y + 390, 230, 100, 'Technology', {
          tone: '#2459d6',
          head: 'ctop',
          body: d.tec,
          ph: 'Teknologi yang dipakai',
        }),
      );
      s.push(
        C('ctx', 0, Y + 532, 426, 100, 'Context (lingkungan)', {
          mode: 'solid',
          tone: '#26307a',
          head: 'ctop',
          body: d.ctx,
          ph: 'Lingkungan eksternal',
        }),
      );
      s.push(
        C('inr', 434, Y + 532, 426, 100, 'Infrastructure', {
          mode: 'solid',
          tone: '#26307a',
          head: 'ctop',
          body: d.inr,
          ph: 'Infrastruktur bersama',
        }),
      );
      var V = { dir: 'v', route: 'straight' };
      return {
        nodes: s,
        edges: [
          E('cus', 'ps', 'bi', '', V),
          E('ps', 'bp', 'bi', '', V),
          E('bp', 'par', 'bi', '', {
            route: 'straight',
            fromAnchor: { x: (190 - 140) / 580, y: 1 },
            toAnchor: { x: 0.5, y: 0 },
          }),
          E('bp', 'inf', 'bi', '', {
            route: 'straight',
            fromAnchor: { x: (430 - 140) / 580, y: 1 },
            toAnchor: { x: 0.5, y: 0 },
          }),
          E('bp', 'tec', 'bi', '', {
            route: 'straight',
            fromAnchor: { x: (670 - 140) / 580, y: 1 },
            toAnchor: { x: 0.5, y: 0 },
          }),
        ],
      };
    },
  },
  dikw: {
    n: 'Piramida DIKW',
    icon: 'layers',
    build: function (d) {
      var Y = d.judul ? 40 : 0,
        PX = 70,
        PW = 440,
        EX = PX + PW + 50,
        EW = 440,
        RH = 90,
        G = 6,
        Ht = 4 * RH + 3 * G,
        s = titleNode(d, EX + EW),
        ed = [];
      var hw = function (yy) {
          return 74 + (yy / Ht) * (PW / 2 - 74);
        },
        showF = d.rumus !== '0';
      [
        ['wis', 'Wisdom', 'knowledge + experience', '#f08a3c', 'Bagaimana memperbaikinya?'],
        ['kno', 'Knowledge', 'information + rules', '#f7ae74', 'Mengapa itu terjadi?'],
        ['inf', 'Information', 'data + context', '#fbd0a8', 'Apa / mana yang paling?'],
        ['dat', 'Data', 'fakta mentah', '#fdecd6', 'Berapa? (fakta mentah)'],
      ].forEach(function (l, i) {
        var yy = i * (RH + G),
          a = hw(yy),
          b = hw(yy + RH);
        s.push(
          C(l[0] + 'L', PX, Y + yy, PW, RH, l[1], {
            shape: 'trap',
            tw0: (2 * a) / PW,
            tw1: (2 * b) / PW,
            fill: l[3],
            stroke: '#c98a55',
            textColor: '#2b1a0e',
            head: 'center',
            sub: showF ? l[2] : '',
            nobody: 1,
          }),
        );
        s.push(C(l[0], EX, Y + yy, EW, RH, '', { tone: '#c98a55', head: 'none', body: d[l[0]], qf: l[1], ph: l[4] }));
        ed.push(
          E(l[0] + 'L', l[0], 'assoc', '', {
            route: 'straight',
            fromAnchor: { x: Math.round((0.5 + (a + b) / 2 / PW) * 1000) / 1000, y: 0.5 },
            toAnchor: { x: 0, y: 0.5 },
          }),
        );
      });
      s.push(
        TX('val', 0, Y, 50, 18, 'Value', { bold: 1, fs: 11 }),
        TX('vol', 0, Y + Ht - 18, 50, 18, 'Volume', { bold: 1, fs: 11 }),
        TX('note', 34, Y + 22, 22, Ht - 44, 'makin ke atas: value naik, volume turun', { rot: -90, muted: 1, fs: 10 }),
      );
      ed.push(
        E('vol', 'val', 'sync', '', { route: 'straight', fromAnchor: { x: 0.5, y: 0 }, toAnchor: { x: 0.5, y: 1 } }),
      );
      return { nodes: s, edges: ed };
    },
  },
  wp: {
    n: 'Bisnis–SI–TI',
    icon: 'arrow-right-left',
    build: function (d) {
      var BW = 290,
        G = 150,
        H = 200,
        Y = d.judul ? 40 : 0,
        W = 3 * BW + 2 * G,
        s = titleNode(d, W),
        ed = [];
      [
        ['b', 'Strategi Bisnis', '#2459d6', 'Ke mana arah bisnis & mengapa?'],
        ['si', 'Strategi SI', '#9a5a06', 'Apa yang dibutuhkan?'],
        ['ti', 'Strategi TI', '#137a3a', 'Bagaimana caranya?'],
      ].forEach(function (c, i) {
        var x = i * (BW + G);
        s.push(C(c[0], x, Y, BW, H, c[1], { tone: c[2], head: 'ctop', body: d[c[0]], ph: 'Satu baris = satu poin' }));
        s.push(TX(c[0] + 'q', x, Y + H + 6, BW, 40, d[c[0] + '_q'] || c[3], { bold: 1, textColor: c[2] }));
      });
      var A = function (f, t, lab, y1) {
        return E(f, t, 'sync', lab, {
          route: 'straight',
          fromAnchor: { x: f === 'b' || (f === 'si' && t === 'ti') ? 1 : 0, y: y1 },
          toAnchor: { x: f === 'b' || (f === 'si' && t === 'ti') ? 0 : 1, y: y1 },
        });
      };
      ed.push(
        A('b', 'si', d.b_si == null ? 'Arahan / kebutuhan bisnis' : d.b_si, 0.36),
        A('si', 'b', d.si_b == null ? 'Mendukung bisnis' : d.si_b, 0.64),
        A('si', 'ti', d.si_ti == null ? 'Needs & prioritas' : d.si_ti, 0.36),
        A('ti', 'si', d.ti_si == null ? 'Infrastruktur & services' : d.ti_si, 0.64),
      );
      if (d.catatan) s.push(TX('cat', 0, Y + H + 56, W, 40, d.catatan, { muted: 1, fs: 11 }));
      return { nodes: s, edges: ed };
    },
  },
  vmodel: {
    n: 'V-model / Level Req.',
    icon: 'git-merge',
    build: function (d) {
      var pairs = [],
        bottom = '';
      String(
        d.pairs ||
          'Business requirements | acceptance criteria | User acceptance testing\nSystem requirements | acceptance criteria | System testing\nHigh-level system design | interface specifications | Integration testing\nUnit/component design | program specification | Unit testing\nDevelopment (programming)',
      )
        .split('\n')
        .forEach(function (l) {
          if (!l.trim()) return;
          var p = l.split('|').map(function (x) {
            return x.trim();
          });
          if (p.length >= 3) pairs.push(p);
          else if (p.length === 2) pairs.push([p[0], '', p[1]]);
          else bottom = p[0];
        });
      var BW = 210,
        DX = 64,
        DY = 84,
        bh = 56,
        n = pairs.length,
        lw = (n - 1) * DX + BW,
        W = lw * 2 + 200,
        Y = d.judul ? 40 : 0,
        s = titleNode(d, W),
        ed = [];
      pairs.forEach(function (p, i) {
        var ext = d.ext === '1' && i === 0,
          y = Y + i * DY;
        s.push(C('L' + i, i * DX, y, BW, bh, p[0], { tone: ext ? '#7a3fe0' : '#2459d6', head: 'center', nobody: 1 }));
        s.push(
          C('R' + i, W - BW - i * DX, y, BW, bh, p[2], {
            tone: ext ? '#7a3fe0' : '#137a3a',
            head: 'center',
            nobody: 1,
          }),
        );
        ed.push(E('L' + i, 'R' + i, 'assoc', p[1], { dir: 'h', route: 'straight' }));
        if (i < n - 1) {
          ed.push(
            E('L' + i, 'L' + (i + 1), 'sync', '', {
              route: 'straight',
              fromAnchor: { x: 0.5, y: 1 },
              toAnchor: { x: 0.35, y: 0 },
            }),
          );
          ed.push(
            E('R' + (i + 1), 'R' + i, 'sync', '', {
              route: 'straight',
              fromAnchor: { x: 0.65, y: 0 },
              toAnchor: { x: 0.5, y: 1 },
            }),
          );
        }
      });
      var H = Y + n * DY;
      if (bottom) {
        var by = Y + n * DY - 10;
        s.push(C('B', W / 2 - 120, by, 240, bh, bottom, { tone: '#b7791f', head: 'center', nobody: 1 }));
        ed.push(
          E('L' + (n - 1), 'B', 'sync', '', {
            route: 'straight',
            fromAnchor: { x: 0.5, y: 1 },
            toAnchor: { x: 0, y: 0.5 },
          }),
          E('B', 'R' + (n - 1), 'sync', '', {
            route: 'straight',
            fromAnchor: { x: 1, y: 0.5 },
            toAnchor: { x: 0.5, y: 1 },
          }),
        );
        H = by + bh + 16;
      }
      if (d.catatan) s.push(TX('cat', 0, H + 6, W, 36, d.catatan, { muted: 1, fs: 11 }));
      return { nodes: s, edges: ed };
    },
  },
  gen: {
    n: 'Strategi Generik',
    icon: 'grid-2x2',
    build: function (d) {
      var x0 = 200,
        CW = 330,
        CH = 140,
        G = 6,
        Y = d.judul ? 40 : 0,
        s = titleNode(d, x0 + 2 * CW + G);
      s.push(
        TX('k', x0, Y, 2 * CW + G, 22, 'Keunggulan bersaing', { bold: 1 }),
        TX('c1', x0, Y + 26, CW, 20, 'Biaya lebih rendah', { muted: 1 }),
        TX('c2', x0 + CW + G, Y + 26, CW, 20, 'Keunikan / diferensiasi', { muted: 1 }),
      );
      var y0 = Y + 52,
        def = {
          cl: 'Harga lebih rendah untuk pasar luas (AirAsia, Walmart)',
          df: 'Keunikan untuk pasar luas (Apple iPhone, FedEx)',
          cf: 'Harga rendah untuk segmen sempit',
          dff: 'Keunikan untuk segmen sempit (butik gaun vintage ukuran besar)',
        };
      [
        ['cl', 'Cost Leadership'],
        ['df', 'Differentiation'],
        ['cf', 'Cost Focus'],
        ['dff', 'Differentiation Focus'],
      ].forEach(function (c, i) {
        s.push(
          C(c[0], x0 + (i % 2) * (CW + G), y0 + Math.floor(i / 2) * (CH + G), CW, CH, c[1], {
            tone: '#55606f',
            head: 'ctop',
            plain: 1,
            body: d['ex_' + c[0]] != null ? d['ex_' + c[0]] : def[c[0]],
            hl: d.pilih === c[0] ? 1 : 0,
            hlText: d.org || 'Pilihan',
          }),
        );
      });
      s.push(
        TX('r1', x0 - 150, y0, 140, CH, 'Luas', { muted: 1 }),
        TX('r2', x0 - 150, y0 + CH + G, 140, CH, 'Sempit (focused niche)', { muted: 1 }),
        TX('ax', 16, y0, 26, 2 * CH + G, 'Cakupan pasar', { rot: -90, bold: 1 }),
      );
      s.push(
        C('alasan', 0, y0 + 2 * CH + G + 18, x0 + 2 * CW + G, 120, 'Alasan pemilihan strategi', {
          tone: '#2459d6',
          body: d.alasan,
          ph: 'Satu baris = satu alasan. Sorot kuadran yang dipilih dari panel kanan.',
        }),
      );
      return { nodes: s, edges: [] };
    },
  },
  pestel: {
    n: 'PESTEL',
    icon: 'layout-grid',
    build: function (d) {
      var CW = 320,
        CH = 210,
        G = 8,
        Y = d.judul ? 40 : 0,
        s = titleNode(d, 3 * CW + 2 * G);
      [
        ['p', 'Political', '#2459d6', 'landmark', 'Regulasi, kebijakan pemerintah, stabilitas politik'],
        ['e', 'Economic', '#137a3a', 'chart-line', 'Inflasi, daya beli, suku bunga, nilai tukar'],
        ['s', 'Social', '#b7791f', 'users', 'Demografi, gaya hidup, budaya, tren'],
        ['t', 'Technological', '#7a3fe0', 'cpu', 'Adopsi teknologi, infrastruktur digital, inovasi'],
        ['en', 'Environmental', '#0b8174', 'earth', 'Iklim, keberlanjutan, regulasi lingkungan'],
        ['l', 'Legal', '#b42318', 'scale', 'Perizinan, perlindungan data, ketenagakerjaan'],
      ].forEach(function (c, i) {
        s.push(
          C(c[0], (i % 3) * (CW + G), Y + Math.floor(i / 3) * (CH + G), CW, CH, c[1], {
            tone: c[2],
            head: 'band',
            icon: c[3],
            body: d[c[0]],
            ph: c[4],
          }),
        );
      });
      return { nodes: s, edges: [] };
    },
  },
  vpc: {
    n: 'Value Proposition Canvas',
    icon: 'target',
    build: function (d) {
      var Y = d.judul ? 40 : 0,
        s = titleNode(d, 840);
      s.push(
        TX('vmT', 0, Y, 360, 26, 'Value Map', { bold: 1, fs: 15 }),
        TX('cpT', 480, Y, 360, 26, 'Customer Profile', { bold: 1, fs: 15 }),
      );
      var y0 = Y + 32;
      s.push(
        C('prod', 0, y0, 180, 360, 'Products & services', {
          tone: '#b7791f',
          head: 'ctop',
          icon: 'package',
          body: d.prod,
          ph: 'Produk dan layanan yang ditawarkan',
        }),
      );
      s.push(
        C('gc', 180, y0, 180, 180, 'Gain creators', {
          tone: '#137a3a',
          head: 'ctop',
          body: d.gc,
          ph: 'Cara menciptakan manfaat',
        }),
      );
      s.push(
        C('pr', 180, y0 + 180, 180, 180, 'Pain relievers', {
          tone: '#b42318',
          head: 'ctop',
          body: d.pr,
          ph: 'Cara mengurangi masalah',
        }),
      );
      s.push(
        C('jobs', 480, y0, 360, 360, 'Customer jobs', {
          shape: 'sector',
          a0: 90,
          a1: 270,
          tone: '#2459d6',
          body: d.jobs,
          ph: 'Tugas yang ingin diselesaikan',
        }),
      );
      s.push(
        C('gains', 480, y0, 360, 360, 'Gains', {
          shape: 'sector',
          a0: -90,
          a1: 0,
          tone: '#137a3a',
          body: d.gains,
          ph: 'Hasil yang diharapkan',
        }),
      );
      s.push(
        C('pains', 480, y0, 360, 360, 'Pains', {
          shape: 'sector',
          a0: 0,
          a1: 90,
          tone: '#b42318',
          body: d.pains,
          ph: 'Hambatan dan risiko',
        }),
      );
      return {
        nodes: s,
        edges: [
          E('gc', 'jobs', 'bi', 'Fit', { route: 'straight', fromAnchor: { x: 1, y: 1 }, toAnchor: { x: 0, y: 0.5 } }),
        ],
      };
    },
  },
  mcf: {
    n: 'Matriks McFarlan',
    icon: 'grid-2x2',
    build: function (d) {
      var CW = 360,
        CH = 200,
        G = 8,
        x0 = 120,
        Y = d.judul ? 40 : 0,
        s = titleNode(d, x0 + 2 * CW + G);
      s.push(
        TX('top', x0, Y, 2 * CW + G, 22, 'Ketergantungan bisnis saat ini', { bold: 1 }),
        TX('hi', x0, Y + 24, CW, 20, 'Tinggi', { muted: 1 }),
        TX('lo', x0 + CW + G, Y + 24, CW, 20, 'Rendah', { muted: 1 }),
      );
      var y0 = Y + 50;
      [
        ['strat', 'Strategic', '#b42318', 'Kritis untuk strategi bisnis di masa depan'],
        ['hipot', 'High potential', '#7a3fe0', 'Bisa penting di masa depan, masih eksperimen'],
        ['keyop', 'Key operational', '#2459d6', 'Bisnis bergantung padanya saat ini'],
        ['supp', 'Support', '#55606f', 'Berguna, tetapi tidak kritis'],
      ].forEach(function (c, i) {
        s.push(
          C(c[0], x0 + (i % 2) * (CW + G), y0 + Math.floor(i / 2) * (CH + G), CW, CH, c[1], {
            tone: c[2],
            head: 'band',
            body: d[c[0]],
            ph: c[3],
          }),
        );
      });
      s.push(
        TX('r1', x0 - 70, y0, 60, CH, 'Tinggi', { muted: 1 }),
        TX('r2', x0 - 70, y0 + CH + G, 60, CH, 'Rendah', { muted: 1 }),
        TX('ax', 12, y0, 26, 2 * CH + G, 'Dampak strategis di masa depan', { rot: -90, bold: 1 }),
      );
      return { nodes: s, edges: [] };
    },
  },
  journey: {
    n: 'Customer Journey',
    icon: 'route',
    build: function (d) {
      var st = d.stages
        ? d.stages
            .split('|')
            .map(function (x) {
              return x.trim();
            })
            .filter(Boolean)
        : ['Awareness', 'Consideration', 'Purchase', 'Use', 'Loyalty'];
      var rows = [
        ['act', 'Actions', '#2459d6'],
        ['tp', 'Touchpoints', '#0b8174'],
        ['feel', 'Thoughts & feelings', '#b7791f'],
        ['pain', 'Pain points', '#b42318'],
        ['opp', 'Opportunities', '#137a3a'],
      ];
      var LW = 150,
        CW = 210,
        HH = 44,
        RH = 118,
        G = 6,
        Y = d.judul ? 40 : 0,
        s = titleNode(d, LW + G + st.length * (CW + G));
      st.forEach(function (name, j) {
        s.push(
          C('s' + j, LW + G + j * (CW + G), Y, CW, HH, name, {
            head: 'chev',
            mode: 'bare',
            tone: j % 2 ? '#3d73a8' : '#2f5d8a',
            first: j === 0,
            nobody: 1,
          }),
        );
      });
      rows.forEach(function (r, i) {
        var y = Y + HH + G + i * (RH + G);
        s.push(C('r' + i, 0, y, LW, RH, r[1], { mode: 'solid', tone: '#55606f', head: 'center', nobody: 1 }));
        st.forEach(function (name, j) {
          s.push(
            C(r[0] + j, LW + G + j * (CW + G), y, CW, RH, '', {
              head: 'none',
              tone: r[2],
              qf: name + ' · ' + r[1],
              body: d[r[0] + j],
            }),
          );
        });
      });
      return { nodes: s, edges: [] };
    },
  },
  persona: {
    n: 'Persona',
    icon: 'square-user',
    build: function (d) {
      var Y = d.judul ? 40 : 0,
        s = titleNode(d, 960);
      s.push(
        C('av', 0, Y, 200, 200, '', {
          shape: 'circle',
          icon: 'user',
          bigIcon: 1,
          head: 'none',
          nobody: 1,
          tone: '#2459d6',
          deco: 1,
        }),
      );
      s.push(
        C('name', 220, Y, 740, 200, d.name || 'Nama persona', {
          head: 'plain',
          sub: d.role || 'Peran · umur · lokasi',
          body: d.bio,
          ph: 'Kutipan atau ringkasan singkat tentang persona',
          tone: '#2459d6',
          qf: 'Profil',
        }),
      );
      [
        ['goals', 'Goals', '#137a3a', 'target', 'Apa yang ingin dicapai'],
        ['pains', 'Pain points', '#b42318', 'triangle-alert', 'Apa yang menyulitkan'],
        ['motiv', 'Motivations', '#b7791f', 'lightbulb', 'Apa yang mendorongnya'],
      ].forEach(function (c, i) {
        s.push(
          C(c[0], i * 325, Y + 220, 310, 220, c[1], { tone: c[2], head: 'band', icon: c[3], body: d[c[0]], ph: c[4] }),
        );
      });
      s.push(
        C('tech', 0, Y + 455, 475, 150, 'Tech & channels', {
          tone: '#7a3fe0',
          head: 'band',
          icon: 'smartphone',
          body: d.tech,
          ph: 'Perangkat dan aplikasi yang dipakai',
        }),
      );
      s.push(
        C('habits', 485, Y + 455, 475, 150, 'Kebiasaan', {
          tone: '#0b8174',
          head: 'band',
          icon: 'calendar',
          body: d.habits,
          ph: 'Rutinitas yang relevan',
        }),
      );
      return { nodes: s, edges: [] };
    },
  },
  empathy: {
    n: 'Empathy Map',
    icon: 'smile',
    build: function (d) {
      var CW = 470,
        CH = 240,
        G = 10,
        Y = d.judul ? 40 : 0,
        s = titleNode(d, 2 * CW + G);
      [
        ['says', 'Says', '#2459d6', 'Apa yang ia ucapkan'],
        ['thinks', 'Thinks', '#7a3fe0', 'Apa yang ia pikirkan'],
        ['does', 'Does', '#0b8174', 'Apa yang ia lakukan'],
        ['feels', 'Feels', '#b7791f', 'Apa yang ia rasakan'],
      ].forEach(function (c, i) {
        s.push(
          C(c[0], (i % 2) * (CW + G), Y + Math.floor(i / 2) * (CH + G), CW, CH, c[1], {
            tone: c[2],
            head: 'plain',
            body: d[c[0]],
            ph: c[3],
          }),
        );
      });
      s.push(
        C('user', CW + G / 2 - 60, Y + CH + G / 2 - 60, 120, 120, d.user || 'User', {
          shape: 'circle',
          icon: 'user',
          bigIcon: 1,
          nobody: 1,
          head: 'none',
          tone: '#2459d6',
          mode: 'soft',
        }),
      );
      s.forEach(function (c) {
        if (c.key === 'feels') c.pt = 58;
        if (c.key === 'does' || c.key === 'says') c.pr = 60;
        if (c.key === 'thinks') c.pt = 0;
      });
      var hw = (2 * CW + G - G) / 2;
      s.push(
        C('pain', 0, Y + 2 * CH + 2 * G + 8, hw, 150, 'Pains', {
          tone: '#b42318',
          head: 'band',
          body: d.pain,
          ph: 'Ketakutan, frustrasi, hambatan',
        }),
      );
      s.push(
        C('gain', hw + G, Y + 2 * CH + 2 * G + 8, hw, 150, 'Gains', {
          tone: '#137a3a',
          head: 'band',
          body: d.gain,
          ph: 'Keinginan, kebutuhan, ukuran sukses',
        }),
      );
      return { nodes: s, edges: [] };
    },
  },
};

// ================= examples data (from the old framework generator) =================
export var FWX = {
  vc: {
    'Warung Baso Malang Agus': {
      judul: 'Value Chain Warung Baso Malang Agus',
      infra: 'Agus mengelola usaha, keuangan, dan pencatatan sederhana',
      hrm: 'Merekrut dan melatih 1–2 pegawai warung',
      tech: 'Resep baso khas dan peralatan dapur\n(Usulan) WhatsApp Business dan aplikasi kasir',
      proc: 'Membeli daging dan bahan dari pemasok langganan\n(Usulan) membandingkan harga beberapa pemasok',
      inbound: 'Menerima dan menyimpan daging & bahan\nMencatat stok bahan harian',
      ops: 'Membuat adonan dan baso\nMeracik kuah dan mangkuk baso',
      outbound: 'Menyajikan di warung\nMengantar pesanan lewat ojek online',
      mkt: 'Promosi lewat media sosial dan spanduk\nPaket hemat untuk penghuni kompleks',
      service: 'Menerima komplain dan masukan\nKartu loyalitas pelanggan',
    },
    'Biliar & Kafe': {
      judul: 'Value Chain Biliar & Kafe',
      infra: 'Owner dan manajer operasional; laporan penjualan & pembelian bulanan',
      hrm: 'Shift siang/middle/malam, absen sidik jari, penggajian',
      tech: 'Sistem admin meja depan, printer CO, CCTV',
      proc: 'Belanja harian bahan dapur dan perlengkapan operasional',
      inbound: 'Menerima dan menyimpan bahan F&B\nStock opname malam',
      ops: 'Sewa meja dengan timer\nDapur menyiapkan pesanan F&B',
      outbound: 'Menyajikan pesanan ke meja\nMenagih dan menerima pembayaran',
      mkt: 'Promosi Instagram\nPromo early check-in, membership',
      service: 'Layanan member, private coaching, nobar',
    },
  },
  ff: {
    'Warung Baso Malang Agus': {
      judul: 'Five Forces Warung Baso Malang Agus',
      riv_k: 'Banyak pedagang Baso Malang lain di kompleks\nProduk mirip, omzet turun',
      riv_l: 'Tinggi',
      riv_s: 'Media sosial untuk diferensiasi merek',
      nw_k: 'Modal kecil, tanpa keahlian khusus, mudah ditiru',
      nw_l: 'Tinggi',
      nw_s: 'Membership/loyalitas sebagai switching cost',
      sub_k: 'Baso Aci sebagai produk baru\nMakanan pesan-antar online',
      sub_l: 'Tinggi',
      sub_s: 'Pemesanan online + kerja sama ojek daring',
      sup_k: 'Harga daging dari pemasok langganan naik\nBergantung pada satu pemasok',
      sup_l: 'Sedang',
      sup_s: 'Pencatatan pembelian untuk membandingkan pemasok',
      buy_k: 'Pelanggan enggan keluar rumah\nMudah pindah ke penjual lain',
      buy_l: 'Tinggi',
      buy_s: 'Program loyalitas digital / kupon',
      kesimpulan:
        'Tekanan terbesar dari rivalry, substitutes, dan buyer power\nSI diprioritaskan untuk pemesanan online dan loyalitas pelanggan',
    },
    'Biliar & Kafe': {
      judul: 'Five Forces Biliar & Kafe',
      riv_k: 'Banyak tempat biliar baru; sebagian tempat lama tutup',
      riv_l: 'Tinggi',
      riv_s: 'Sistem POS terintegrasi agar operasi lebih efisien',
      nw_k: 'Tren biliar sedang "hype"\nModal meja, tempat, dan SDM cukup besar',
      nw_l: 'Sedang',
      nw_s: 'Membership & data pelanggan sebagai switching cost',
      sub_k: 'Hiburan lain: kafe, game center, nobar di tempat lain',
      sub_l: 'Sedang',
      sub_s: 'Nobar & event yang dipromosikan di Instagram',
      sup_k: 'Pemasok bahan F&B dan perlengkapan banyak',
      sup_l: 'Rendah',
      sup_s: 'Pencatatan pembelian untuk membandingkan harga',
      buy_k: 'Pelanggan mudah pindah tempat\nSensitif harga di jam sepi',
      buy_l: 'Tinggi',
      buy_s: 'Membership digital dan booking online',
    },
  },
  wsf: {
    'Biliar & Kafe': {
      judul: 'Work System Framework Biliar & Kafe',
      cus: 'Pemain biliar (walk-in, booking, member)\nPengunjung kafe & nobar',
      ps: 'Sewa meja per jam, membership, private coaching\nMakanan & minuman, nobar',
      bp: 'Check-in & booking meja, pemesanan F&B\nPenyiapan di dapur, penyajian, pembayaran\nStock opname malam, rekap bulanan',
      par: 'Admin/kasir, waiters, kitchen\nOB, satpam, manajer, owner',
      inf: 'Status & durasi meja, captain order\nTagihan, stok, absensi, laporan',
      tec: 'Sistem admin, printer CO\nAbsen sidik jari, Excel, WhatsApp, CCTV',
      ctx: 'Tren biliar naik-turun, banyak pesaing baru\nPelanggan utama pekerja; siang sepi',
      inr: 'Listrik, internet\nInstagram, layanan pembayaran',
    },
    'Warung Baso Malang Agus': {
      judul: 'Work System Framework Warung Baso',
      cus: 'Penghuni kompleks perumahan\nPembeli lewat pesan-antar',
      ps: 'Baso Malang (makan di tempat & bungkus)\nPengantaran',
      bp: 'Memesan → membuat → menyajikan → membayar\nBelanja bahan, mencatat stok',
      par: 'Agus (pemilik), pegawai warung\nKurir ojek online',
      inf: 'Menu & harga, pesanan, tagihan\nStok bahan, catatan penjualan',
      tec: 'Kertas pesanan, kalkulator\nSmartphone + WhatsApp',
      ctx: 'Banyak pedagang baso lain, Baso Aci\nPelanggan enggan keluar rumah',
      inr: 'Listrik, internet\nAplikasi ojek online, pemasok daging',
    },
  },
  dikw: {
    'Penjualan (slide)': {
      judul: 'Piramida DIKW: Penjualan',
      wis: 'Bagaimana kita dapat memperbaikinya?',
      kno: 'Apa yang membuat produk itu tidak berhasil?',
      inf: 'Produk apa yang penjualannya terendah?',
      dat: 'Berapa unit terjual di setiap jalur produksi?',
    },
    'Kelulusan (PG 2021)': {
      judul: 'Piramida DIKW: Kelulusan Mahasiswa',
      wis: 'Bagaimana agar lebih banyak mahasiswa lulus tepat waktu?',
      kno: 'Mengapa prodi XYZ paling sedikit lulus tepat waktu?',
      inf: 'Prodi mana yang terbanyak lulus tepat waktu?',
      dat: 'Jumlah lulusan tepat waktu tiap prodi',
    },
    'Biliar & Kafe': {
      judul: 'Piramida DIKW: Biliar & Kafe',
      wis: 'Atur promo dan jadwal shift agar meja siang terisi',
      kno: 'Siang sepi karena pelanggan utama pekerja kantoran',
      inf: 'Okupansi meja per jam: siang < 30%, malam penuh',
      dat: 'Log jam mulai–selesai setiap meja, tiap transaksi',
    },
  },
  wp: {
    'Versi slide': {
      judul: 'Keselarasan Strategi Bisnis, SI, dan TI (Ward & Peppard)',
      b: 'Keputusan bisnis\nObjectives dan arahan\nPerubahan',
      si: 'Berbasis bisnis\nOrientasi permintaan (demand)\nFokus pada aplikasi',
      ti: 'Berbasis aktivitas\nOrientasi suplai\nFokus pada teknologi',
      catatan:
        'SI selaras jika dikembangkan berdasarkan arah bisnis. Potensi SI/TI juga dapat memberi arahan baru bagi bisnis.',
    },
    'Biliar & Kafe': {
      judul: 'Bisnis–SI–TI pada Biliar & Kafe',
      b: 'Mengisi meja di jam sepi\nMenjaga pelanggan (membership)\nMengendalikan stok & biaya',
      si: 'POS terintegrasi: billing meja + F&B\nCO otomatis ke dapur\nLaporan penjualan vs stok',
      ti: 'Tablet/PC kasir, printer thermal dapur\nAplikasi POS cloud, jaringan lokal\nBackup cloud',
      b_si: 'Kebutuhan & prioritas bisnis',
      si_b: 'Mendukung operasi & keputusan',
    },
  },
  vmodel: {
    'V-model SDLC': {
      judul: 'V-model',
      pairs:
        'Business requirements | acceptance criteria | User acceptance testing\nSystem requirements | acceptance criteria | System testing\nHigh-level system design | interface specifications | Integration testing\nUnit/component design | program specification | Unit testing\nDevelopment (programming)',
      catatan: 'Setiap tahap spesifikasi di kiri dipasangkan dengan tahap pengujian di kanan.',
    },
    'Extended V-model': {
      judul: 'Extended V-model',
      pairs:
        'Feasibility study | business case | Benefits realisation\nBusiness requirements | acceptance criteria | User acceptance testing\nSystem requirements | acceptance criteria | System testing\nHigh-level system design | interface specifications | Integration testing\nUnit/component design | program specification | Unit testing\nDevelopment (programming)',
      ext: '1',
    },
    'Level requirement (RE)': {
      judul: 'Level Requirement dan Pengujiannya',
      pairs:
        'Stakeholder requirements | validating the product | Acceptance test\nSystem requirements | verifying the system | System test\nSubsystem requirements | qualifying subsystems | Subsystem test\nComponent requirements | qualifying components | Component test',
      catatan: 'Setiap level bawah memenuhi (satisfies) level di atasnya.',
    },
  },
  gen: {
    'Warung Baso Malang Agus': {
      judul: 'Strategi Generik Warung Baso Malang Agus',
      org: 'Warung Baso Agus',
      pilih: 'dff',
      alasan:
        'Pasar sempit: penghuni kompleks perumahan\nResep khas dan layanan antar ke rumah membedakan dari pesaing\nPerang harga sulit karena harga daging naik',
    },
    'Biliar & Kafe': {
      judul: 'Strategi Generik Biliar & Kafe',
      org: 'Biliar & Kafe',
      pilih: 'df',
      alasan:
        'Bersaing lewat pengalaman: membership, private coaching, nobar, kafe\nPromo early check-in hanya taktik mengisi jam sepi, bukan cost leadership',
    },
  },
  swot: {
    'Biliar & Kafe': {
      judul: 'Analisis SWOT Biliar & Kafe',
      s: 'Meja dan tempat berkualitas, kafe pelengkap\nMembership dan private coaching',
      w: 'Printer CO dapur tidak terhubung sistem admin\nStok dicatat manual dan difoto ke grup\nRekap bulanan disinkronkan manual di Excel',
      o: 'Tren biliar di kalangan pekerja\nPromosi lewat Instagram dan event nobar\nAplikasi POS cloud yang terjangkau',
      t: 'Banyak tempat biliar baru\nHype biliar menurun, beberapa tempat tutup\nHiburan pengganti (kafe, game center)',
    },
  },
  bmc: {
    'Biliar & Kafe': {
      judul: 'Business Model Canvas Biliar & Kafe',
      cs: 'Pekerja kantoran dan mahasiswa\nKomunitas biliar / member',
      vp: 'Meja biliar berkualitas + kafe\nMembership dan private coaching\nNobar dan event',
      ch: 'Datang langsung (walk-in)\nBooking via WhatsApp\nInstagram',
      cr: 'Membership\nPromo early check-in\nPelayanan personal',
      rev: 'Sewa meja per jam\nPenjualan F&B\nIuran member dan coaching',
      kr: 'Tempat dan meja biliar\nStaf (admin, waiters, kitchen)\nSistem admin',
      ka: 'Operasional meja & timer\nMenyiapkan F&B\nPromosi dan event',
      kp: 'Pemasok bahan F&B\nPemasok perlengkapan biliar\nPenyedia pembayaran digital',
      cost: 'Sewa tempat dan listrik\nGaji staf\nBahan F&B, perawatan meja',
    },
  },
  pestel: {
    'Biliar & Kafe': {
      judul: 'PESTEL Biliar & Kafe',
      p: 'Perizinan usaha hiburan dari pemda\nAturan jam operasional malam',
      e: 'Daya beli pekerja muda naik-turun\nHarga bahan F&B dan listrik naik',
      s: 'Tren nongkrong dan biliar di kalangan pekerja\nKomunitas biliar aktif di media sosial',
      t: 'Pembayaran QRIS meluas\nAplikasi POS cloud murah\nBooking online lewat WhatsApp',
      en: 'Konsumsi listrik lampu & AC tinggi\nPengelolaan sampah kafe',
      l: 'UU Perlindungan Data Pribadi untuk data member\nAturan ketenagakerjaan untuk shift malam',
    },
  },
  vpc: {
    'Biliar & Kafe': {
      judul: 'Value Proposition Canvas Biliar & Kafe',
      prod: 'Sewa meja per jam\nMembership\nKafe & nobar',
      gc: 'Booking online, meja siap saat datang\nPoin member dan promo jam sepi',
      pr: 'Status meja real-time, tidak perlu antre\nTagihan meja + F&B jadi satu',
      jobs: 'Main biliar bersama teman setelah kerja\nNongkrong sambil nobar',
      gains: 'Meja tersedia tepat waktu\nHarga jelas, promo member',
      pains: 'Datang tapi meja penuh\nTagihan F&B terpisah dan lama',
    },
  },
  mcf: {
    'Biliar & Kafe': {
      judul: 'Portofolio Aplikasi Biliar & Kafe',
      strat: 'Booking online + membership',
      hipot: 'Rekomendasi promo berbasis data okupansi\nChatbot WhatsApp',
      keyop: 'POS billing meja + F&B\nCaptain order ke dapur',
      supp: 'Absensi sidik jari\nPenggajian di Excel',
    },
  },
  journey: {
    'Booking meja biliar': {
      judul: 'Customer Journey: Booking Meja Biliar',
      stages: 'Awareness|Consideration|Booking|Experience|Loyalty',
      act0: 'Lihat promo di Instagram',
      act1: 'Cek jam kosong dan harga',
      act2: 'Booking via WhatsApp, bayar DP',
      act3: 'Check-in, main, pesan F&B',
      act4: 'Kumpulkan poin member, datang lagi',
      tp0: 'Instagram, teman',
      tp1: 'WhatsApp admin',
      tp2: 'WhatsApp, QRIS',
      tp3: 'Meja depan, waiters',
      tp4: 'Kartu member, broadcast WA',
      feel0: 'Penasaran',
      feel1: 'Ragu meja masih ada',
      feel2: 'Lega setelah konfirmasi',
      feel3: 'Senang, tapi tagihan membingungkan',
      feel4: 'Merasa dihargai',
      pain0: 'Info jam ramai tidak ada',
      pain1: 'Admin lambat membalas',
      pain2: 'Konfirmasi manual',
      pain3: 'Tagihan meja dan F&B terpisah',
      pain4: 'Poin dicatat manual',
      opp0: 'Tampilkan okupansi per jam',
      opp1: 'Cek ketersediaan otomatis',
      opp2: 'Booking online + bayar QRIS',
      opp3: 'Tagihan terpadu di POS',
      opp4: 'Membership digital',
    },
  },
  persona: {
    'Raka, pekerja kantoran': {
      name: 'Raka Pratama',
      role: 'Analis keuangan · 27 tahun · Bandung',
      bio: '"Saya mau main biliar sepulang kerja tanpa harus menunggu meja kosong."',
      goals: 'Main 2–3 kali seminggu bersama rekan kerja\nTahu meja tersedia sebelum berangkat',
      pains: 'Sering datang saat meja penuh\nAdmin lambat membalas WhatsApp',
      motiv: 'Melepas penat setelah kerja\nNaik level skill biliar',
      tech: 'Instagram, WhatsApp, QRIS\nGoogle Maps untuk cari tempat',
      habits: 'Pulang kerja jam 18.00\nAkhir pekan ikut turnamen komunitas',
    },
  },
  empathy: {
    'Pelanggan biliar': {
      judul: 'Empathy Map: Pelanggan Biliar',
      user: 'Raka',
      says: '"Mejanya masih ada nggak?"\n"Bisa bayar pakai QRIS?"',
      thinks: 'Takut sudah jauh-jauh datang tapi penuh\nApakah membership sepadan',
      does: 'Tanya admin lewat WhatsApp\nDatang bersama 2–3 teman',
      feels: 'Kesal saat menunggu\nSenang saat dapat promo',
      pain: 'Tidak ada info okupansi\nTagihan terpisah dan lama',
      gain: 'Booking pasti dan cepat\nPoin member dan harga jelas',
    },
  },
};

// ================= trees =================
export function treeType(kind) {
  return kind === 'org' ? 'tr-org' : kind === 'mind' ? 'tr-mind' : 'tr-page';
}
export function treeChildren(n) {
  return S.edges
    .filter(function (e) {
      return e.from === n.id;
    })
    .map(function (e) {
      return byId(e.to);
    })
    .filter(function (c) {
      return c && fam(c) === fam(n) && TREEP[c.id] === n.id;
    });
}
export function treeRoot(n) {
  var r = n,
    g = 0;
  while (TREEP[r.id] && g++ < 200) r = byId(TREEP[r.id]);
  return r;
}
export function subtree(n) {
  var out = [],
    seen = {};
  (function walk(x) {
    if (seen[x.id]) return;
    seen[x.id] = 1;
    out.push(x);
    treeChildren(x).forEach(walk);
  })(n);
  return out;
}
export function layoutTree(root) {
  computeTree();
  var down = fam(root) !== 'mind',
    SG = down ? 24 : 14,
    DG = down ? 56 : 72;
  function sz(n) {
    return down ? n.w : n.h;
  }
  function measure(n, dep) {
    var ks =
      dep < 60
        ? treeChildren(n).sort(function (a, b) {
            return down ? a.x - b.x : a.y - b.y;
          })
        : [];
    ks.forEach(function (k) {
      measure(k, dep + 1);
    });
    n._k = ks;
    var tot =
      ks.reduce(function (a, k) {
        return a + k._s;
      }, 0) +
      SG * Math.max(0, ks.length - 1);
    n._s = Math.max(sz(n), tot);
  }
  function place(n, a, b) {
    if (down) {
      n.x = Math.round(a + n._s / 2 - n.w / 2);
      n.y = Math.round(b);
    } else {
      n.y = Math.round(a + n._s / 2 - n.h / 2);
      n.x = Math.round(b);
    }
    var tot =
        n._k.reduce(function (s2, k) {
          return s2 + k._s;
        }, 0) +
        SG * Math.max(0, n._k.length - 1),
      c = a + (n._s - tot) / 2,
      nb = b + (down ? n.h : n.w) + DG;
    n._k.forEach(function (k) {
      place(k, c, nb);
      c += k._s + SG;
    });
  }
  var ox = root.x,
    oy = root.y;
  measure(root, 0);
  place(root, down ? root.x + root.w / 2 - root._s / 2 : root.y + root.h / 2 - root._s / 2, down ? root.y : root.x);
  var dx = ox - root.x,
    dy = oy - root.y,
    all = subtree(root),
    ids = {};
  all.forEach(function (n) {
    n.x += dx;
    n.y += dy;
    delete n._k;
    delete n._s;
    ids[n.id] = 1;
  });
  S.edges.forEach(function (e) {
    if (ids[e.from] && ids[e.to]) {
      e.mx = null;
      e.my = null;
      delete e.fromAnchor;
      delete e.toAnchor;
    }
  });
}
export function mindSize(n, dep) {
  if (fam(n) !== 'mind') return;
  var w = textW(n.label || '', dep === 0 ? 15 : 13, dep === 0 ? 700 : 600);
  n.w = Math.round(clamp(w + (dep === 0 ? 52 : 36), dep === 0 ? 150 : 90, dep === 0 ? 300 : 260));
  n.h = dep === 0 ? 54 : dep === 1 ? 40 : 30;
}
export function treeAdd(n, mode) {
  computeTree();
  commitEdit();
  var f = fam(n),
    parent = mode === 'sibling' ? byId(TREEP[n.id]) : n;
  if (!parent) {
    parent = n;
    mode = 'child';
  }
  pushUndo();
  var c = addNode(n.t, n.x, n.y);
  c.label = f === 'mind' ? 'Topic' : f === 'page' ? 'Page' : 'Position';
  var down = f !== 'mind';
  if (mode === 'sibling') {
    if (down) c.x = n.x + 1;
    else c.y = n.y + 1;
  } else {
    if (down) {
      c.x = 1e6;
      c.y = n.y + n.h + 60;
    } else {
      c.y = 1e6;
      c.x = n.x + n.w + 60;
    }
  }
  addEdge(parent.id, c.id, 'line');
  computeTree();
  mindSize(c, TREED[c.id] || 1);
  layoutTree(treeRoot(c));
  set_selN([c.id]);
  set_selE(null);
  renderAll();
  startEdit({ k: 'n', id: c.id });
}
export function parseOutline(text) {
  var roots = [],
    stack = [];
  String(text || '')
    .split('\n')
    .forEach(function (raw) {
      if (!raw.trim()) return;
      var m = raw.replace(/\t/g, '  ').match(/^(\s*)([-*•]*)\s*(.*)$/),
        lvl = Math.floor(m[1].length / 2) + m[2].length,
        txt = m[3].trim(),
        hl = false;
      if (/\*$/.test(txt)) {
        hl = true;
        txt = txt.replace(/\s*\*$/, '');
      }
      var p = txt.split('|'),
        n = { t: p[0].trim(), sub: (p[1] || '').trim(), hl: hl, lvl: lvl, ch: [] };
      while (stack.length && stack[stack.length - 1].lvl >= lvl) stack.pop();
      if (stack.length) stack[stack.length - 1].ch.push(n);
      else roots.push(n);
      stack.push(n);
    });
  return roots;
}
export function buildTree(text, kind, ox, oy) {
  var roots = parseOutline(text),
    made = [],
    x = ox,
    type = treeType(kind);
  roots.forEach(function (r) {
    function mk(node, parent, dep) {
      var n: Record<string, any> = addNode(type, 0, 0);
      n.label = node.t;
      if (node.sub) n.sub = node.sub;
      if (node.hl) n.hl = 1;
      mindSize(n, dep);
      n.x = 1e5 + made.length;
      n.y = 1e5 + made.length;
      made.push(n);
      if (parent) addEdge(parent.id, n.id, 'line');
      node.ch.forEach(function (c) {
        mk(c, n, dep + 1);
      });
      return n;
    }
    var rn = mk(r, null, 0);
    rn.x = x;
    rn.y = oy;
    computeTree();
    layoutTree(rn);
    var b = bounds(subtree(rn), []);
    if (b) {
      var sh = x - b.x;
      subtree(rn).forEach(function (n) {
        n.x += sh;
      });
      x += b.w + 90;
    }
  });
  return made;
}
export var TREEX = {
  org: {
    'Biliar & Kafe':
      'Owner | pemilik usaha\n  Manajer Operasional\n    Admin / Kasir | shift siang · middle · malam\n    Waiters\n    Kitchen\n    OB\n    Satpam',
    'Perusahaan fungsional':
      'Direktur Utama | CEO\n  Direktur Keuangan\n    Manajer Akuntansi\n    Manajer TI *\n  Direktur Operasional\n    Manajer Produksi\n    Manajer Gudang\n  Direktur Pemasaran\n    Manajer Penjualan\n    Manajer Promosi',
  },
  mind: {
    'System design interview':
      'System design interview\n  Requirements\n    Functional\n    Non-functional\n    Estimasi skala\n  High-level design\n    API\n    Data model\n    Komponen utama\n  Deep dive\n    Caching\n    Sharding & replikasi\n    Queue & async\n  Trade-off\n    Konsistensi vs ketersediaan\n    Biaya\n  Wrap-up\n    Bottleneck\n    Monitoring',
  },
  sitemap: {
    'Website Biliar & Kafe':
      'Home | /\n  Booking | /booking\n    Pilih meja | /booking/meja\n    Pembayaran | /booking/bayar\n    Konfirmasi | /booking/ok\n  Menu F&B | /menu\n  Membership | /member\n    Daftar | /member/daftar\n    Login | /login\n    Profil & poin | /member/profil\n  Event & nobar | /event\n  Kontak | /kontak',
  },
};

// ================= graph builder (examples + AI) =================
export function buildGraph(spec, ox, oy) {
  var map = {},
    made = [],
    zoneOf = {};
  spec.nodes.forEach(function (d) {
    if (!T[d[1]]) return;
    var ex = d[3] || {},
      n: Record<string, any> = addNode(d[1], 0, 0, ex.look ? { look: ex.look } : null);
    if (d[2] != null) n.label = d[2];
    for (var k in ex) n[k] = ex[k];
    if (n.look === 'tile') {
      n.w = 64;
      n.h = 64;
    }
    map[d[0]] = n.id;
    made.push(n);
  });
  (spec.zones || []).forEach(function (z) {
    (z[3] || []).forEach(function (m) {
      if (map[m]) zoneOf[map[m]] = z[0];
    });
  });
  var es = [];
  (spec.edges || []).forEach(function (d) {
    var a = map[d[0]],
      b = map[d[1]];
    if (!a || !b || a === b) return;
    var e = { id: 'e' + S.seq++, from: a, to: b, type: EDGE[d[2]] ? d[2] : autoType(byId(a), byId(b)), label: '' };
    styleEdge(e, byId(a), byId(b));
    if (d[3]) e.label = d[3];
    if (d[4]) for (var k in d[4]) e[k] = d[4][k];
    S.edges.push(e);
    es.push(e);
  });
  var revs = [],
    lw = 0;
  var lay = es.map(function (e) {
    var back = e.lay === 'rev';
    if (back) revs.push(e);
    delete e.lay;
    if (e.label) lw = Math.max(lw, Math.min(170, textW(e.label, 11)));
    return REV_LAY[e.type] || back ? { from: e.to, to: e.from } : { from: e.from, to: e.to };
  });
  autosizeAll(made);
  var pos = layered(
    made.map(function (n) {
      return n.id;
    }),
    lay,
    zoneOf,
    spec.dir,
    lw,
  );
  made.forEach(function (n) {
    var p = pos[n.id];
    if (p) {
      n.x = snap(ox + p.x);
      n.y = snap(oy + p.y);
    }
  });
  // forward edges in a layered layout leave and enter along the flow axis, so a wide fan-out never runs along a neighbour's side
  es.forEach(function (e) {
    if (e.dir || revs.indexOf(e) >= 0) return;
    var a = byId(e.from),
      b = byId(e.to);
    if (!a || !b) return;
    if (spec.dir === 'TB' && b.y >= a.y + a.h + 20) e.dir = 'v';
    else if (spec.dir !== 'TB' && b.x >= a.x + a.w + 20 && Math.abs(b.y + b.h / 2 - (a.y + a.h / 2)) > a.h) e.dir = 'h';
  });
  loopBackEdges(revs, spec.dir);
  (spec.zones || []).forEach(function (z) {
    var ms = made.filter(function (n) {
      return zoneOf[n.id] === z[0];
    });
    if (!ms.length || !T[z[1]]) return;
    var b = bounds(ms, []),
      zn = addNode(z[1], 0, 0),
      c4 = z[1] === 'b-c4b';
    zn.label = z[2];
    var top = c4 ? 30 : 52,
      bot = c4 ? 70 : 30;
    zn.x = snap(b.x - 30);
    zn.y = snap(b.y - top);
    zn.w = snap(b.w + 60);
    zn.h = snap(b.h + top + bot);
    if (z[4]) for (var k in z[4]) zn[k] = z[4][k];
  });
  return made;
}
export function autosizeAll(list) {
  (list || S.nodes).forEach(autosize);
}
export var REV_LAY = { uext: 1, uinh: 1, ureal: 1 };
// edges that run against the layout direction loop around the side instead of cutting through nodes
export function loopBackEdges(revs, dir) {
  revs.forEach(function (e, k) {
    var a = byId(e.from),
      b = byId(e.to);
    if (!a || !b) return;
    if (dir === 'TB') {
      e.fromAnchor = { x: 0, y: 0.5 };
      e.toAnchor = { x: 0, y: 0.5 };
      e.mx = snap(Math.min(a.x, b.x) - 40 - k * 20);
      delete e.my;
    } else {
      e.fromAnchor = { x: 0.5, y: 1 };
      e.toAnchor = { x: 0.5, y: 1 };
      e.my = snap(Math.max(a.y + a.h, b.y + b.h) + 40 + k * 20);
      delete e.mx;
    }
    delete e.route;
  });
}
export function buildSequence(parts, msgs, ox, oy) {
  var map = {},
    H = 110 + msgs.length * 46 + 40;
  parts.forEach(function (p, i) {
    var t = p.kind === 'actor' ? 'u-seq-actor' : 'u-seq-life',
      nd = addNode(t, 0, 0);
    nd.label = p.label;
    nd.x = ox + i * 200 + (t === 'u-seq-actor' ? 20 : 0);
    nd.y = oy;
    nd.h = H;
    map[p.id] = nd;
  });
  msgs.forEach(function (m, j) {
    var a = map[m.from],
      b = map[m.to];
    if (!a || !b || a === b) return;
    var y0 = oy + (a.t === 'u-seq-actor' ? 110 : 80) + j * 46;
    S.edges.push({
      id: 'e' + S.seq++,
      from: a.id,
      to: b.id,
      type: EDGE[m.type] ? m.type : 'umsg',
      label: m.label || '',
      route: 'straight',
      fromAnchor: { x: 0.5, y: clamp((y0 - a.y) / a.h, 0.1, 0.995) },
      toAnchor: { x: 0.5, y: clamp((y0 - b.y) / b.h, 0.1, 0.995) },
    });
  });
  return map;
}

// ================= examples registry =================
export var EX: Dict<any> = {};
export function exFw(fw, name, dt) {
  return function () {
    insertBlock(FW[fw].build(FWX[fw][name]), 0, 0);
  };
}
export function G(dt, n, spec) {
  EX[dt + ':' + n] = {
    n: DT[dt].n + ' · ' + n,
    dt: dt,
    build: function () {
      buildGraph(spec, 60, 80);
    },
  };
}
export function exampleKeys(ws, dt) {
  return Object.keys(EX).filter(function (k) {
    var x = EX[k];
    return DT[x.dt] && (!ws || DT[x.dt].ws === ws) && (!dt || x.dt === dt);
  });
}

export function install(): void {
  Object.keys(FWX).forEach(function (fw) {
    var dt = Object.keys(DT).filter(function (k) {
      return DT[k].fw === fw;
    })[0];
    Object.keys(FWX[fw]).forEach(function (name) {
      EX[fw + ':' + name] = { n: FW[fw].n + ' · ' + name, dt: dt, build: exFw(fw, name, dt) };
    });
  });
  Object.keys(TREEX).forEach(function (dt) {
    Object.keys(TREEX[dt]).forEach(function (name) {
      EX[dt + ':' + name] = {
        n: DT[dt].n + ' · ' + name,
        dt: dt,
        build: function () {
          buildTree(TREEX[dt][name], DT[dt].tree, 0, 0);
        },
      };
    });
  });
  [
    ['web3', 'arch'],
    ['short', 'arch'],
    ['shop', 'arch'],
    ['prodai', 'arch'],
    ['login', 'userflow'],
    ['o2c', 'bpmn'],
    ['galon', 'bpmn'],
    ['pool2', 'bpmn'],
    ['collab', 'bpmn'],
    ['agents', 'agent'],
    ['rag', 'rag'],
    ['n8n', 'n8n'],
  ].forEach(function (p) {
    EX[p[0]] = {
      n: TPL_NAMES[p[0]],
      dt: p[1],
      build: function () {
        var keep = S.seq;
        TPL[p[0]]();
        S.seq = Math.max(S.seq, keep);
      },
    };
  });
  G('usecase', 'Sistem POS Biliar', {
    dir: 'LR',
    nodes: [
      ['cust', 'u-actor', 'Pelanggan'],
      ['kasir', 'u-actor', 'Admin / Kasir'],
      ['owner', 'u-actor', 'Owner'],
      ['book', 'u-usecase', 'Booking meja'],
      ['fnb', 'u-usecase', 'Pesan F&B'],
      ['pay', 'u-usecase', 'Bayar tagihan'],
      ['print', 'u-usecase', 'Cetak struk'],
      ['in', 'u-usecase', 'Check-in meja'],
      ['mem', 'u-usecase', 'Kelola membership'],
      ['rep', 'u-usecase', 'Lihat laporan'],
      ['login', 'u-usecase', 'Login'],
    ],
    edges: [
      ['cust', 'book', 'uassoc'],
      ['cust', 'fnb', 'uassoc'],
      ['cust', 'pay', 'uassoc'],
      ['kasir', 'in', 'uassoc'],
      ['kasir', 'pay', 'uassoc'],
      ['kasir', 'mem', 'uassoc'],
      ['owner', 'rep', 'uassoc'],
      ['mem', 'login', 'uinc'],
      ['rep', 'login', 'uinc'],
      ['print', 'pay', 'uext'],
    ],
    zones: [
      ['sys', 'b-boundary', 'Sistem POS Biliar & Kafe', ['book', 'fnb', 'pay', 'print', 'in', 'mem', 'rep', 'login']],
    ],
  });
  G('activity', 'Booking meja', {
    dir: 'TB',
    nodes: [
      ['s', 'u-act-initial'],
      ['a1', 'u-act-action', 'Pilih meja dan jam'],
      ['a2', 'u-act-action', 'Cek ketersediaan'],
      ['d1', 'u-act-decision', 'Tersedia?'],
      ['a3', 'u-act-action', 'Tampilkan jam lain'],
      ['a4', 'u-act-action', 'Isi data dan bayar DP'],
      ['a5', 'u-act-action', 'Konfirmasi booking'],
      ['f1', 'u-act-bar'],
      ['a6', 'u-act-action', 'Kirim notifikasi WhatsApp'],
      ['a7', 'u-act-action', 'Update jadwal meja'],
      ['j1', 'u-act-bar'],
      ['e', 'u-act-final'],
    ],
    edges: [
      ['s', 'a1'],
      ['a1', 'a2'],
      ['a2', 'd1'],
      ['d1', 'a4', 'uflow', '[ya]'],
      ['d1', 'a3', 'uflow', '[tidak]'],
      ['a3', 'a1', 'uflow', '', { lay: 'rev' }],
      ['a4', 'a5'],
      ['a5', 'f1'],
      ['f1', 'a6'],
      ['f1', 'a7'],
      ['a6', 'j1'],
      ['a7', 'j1'],
      ['j1', 'e'],
    ],
  });
  EX['sequence:Booking meja'] = {
    n: 'Sequence · Booking meja',
    dt: 'sequence',
    build: function () {
      buildSequence(
        [
          { id: 'u', label: 'Pelanggan', kind: 'actor' },
          { id: 'app', label: 'App' },
          { id: 'api', label: 'Booking API' },
          { id: 'db', label: 'Database' },
          { id: 'wa', label: 'WA Gateway' },
        ],
        [
          { from: 'u', to: 'app', label: 'pilih meja & jam' },
          { from: 'app', to: 'api', label: 'GET /availability' },
          { from: 'api', to: 'db', label: 'SELECT jadwal' },
          { from: 'db', to: 'api', label: 'slot tersedia', type: 'uret' },
          { from: 'api', to: 'app', label: '200 OK', type: 'uret' },
          { from: 'u', to: 'app', label: 'konfirmasi booking' },
          { from: 'app', to: 'api', label: 'POST /bookings' },
          { from: 'api', to: 'db', label: 'INSERT booking' },
          { from: 'api', to: 'wa', label: 'kirim notifikasi', type: 'uasync' },
          { from: 'api', to: 'app', label: 'booking ID', type: 'uret' },
        ],
        60,
        40,
      );
    },
  };
  G('class', 'POS Biliar', {
    dir: 'LR',
    nodes: [
      [
        'mem',
        'u-class',
        'Member',
        { attrs: '- id: int\n- nama: String\n- noHp: String\n- tier: Tier', ops: '+ upgradeTier(): void' },
      ],
      [
        'bk',
        'u-class',
        'Booking',
        {
          attrs: '- id: int\n- mulai: DateTime\n- durasiMenit: int\n- status: Status',
          ops: '+ konfirmasi(): void\n+ batal(): void',
        },
      ],
      [
        'mj',
        'u-class',
        'Meja',
        { attrs: '- nomor: int\n- tipe: String\n- tarifPerJam: int', ops: '+ isAvailable(slot): bool' },
      ],
      [
        'ps',
        'u-class',
        'Pesanan',
        { attrs: '- id: int\n- waktu: DateTime\n- total: int', ops: '+ tambahItem(item): void\n+ hitungTotal(): int' },
      ],
      ['it', 'u-class', 'ItemPesanan', { attrs: '- qty: int\n- subtotal: int', ops: '' }],
      ['mn', 'u-class', 'MenuItem', { attrs: '- nama: String\n- harga: int\n- kategori: String', ops: '' }],
      [
        'pb',
        'u-class',
        'Pembayaran',
        { stereo: 'abstract', attrs: '- jumlah: int\n- waktu: DateTime', ops: '+ proses(): bool' },
      ],
      ['tunai', 'u-class', 'PembayaranTunai', { attrs: '- uangDiterima: int', ops: '+ proses(): bool' }],
      ['qris', 'u-class', 'PembayaranQRIS', { attrs: '- refId: String', ops: '+ proses(): bool' }],
    ],
    edges: [
      ['mem', 'bk', 'uassoc', '1 .. *'],
      ['bk', 'mj', 'uassoc', '* .. 1'],
      ['bk', 'ps', 'uassoc', '1 .. *'],
      ['ps', 'it', 'ucomp', '1 .. *'],
      ['it', 'mn', 'unav'],
      ['ps', 'pb', 'uassoc', '1 .. 1'],
      ['tunai', 'pb', 'uinh'],
      ['qris', 'pb', 'uinh'],
    ],
  });
  G('state', 'Status meja', {
    dir: 'LR',
    nodes: [
      ['s', 'u-act-initial'],
      ['av', 'u-state', 'Tersedia'],
      ['bk', 'u-state', 'Dipesan'],
      ['use', 'u-state', 'Dipakai', { body: 'entry / mulai timer\nexit / hentikan timer' }],
      ['bill', 'u-state', 'Menunggu bayar'],
      ['clean', 'u-state', 'Dibersihkan'],
      ['fix', 'u-state', 'Perbaikan'],
    ],
    edges: [
      ['s', 'av'],
      ['av', 'bk', 'uflow', 'booking'],
      ['bk', 'use', 'uflow', 'check-in'],
      ['bk', 'av', 'uflow', 'no-show 15 mnt', { lay: 'rev' }],
      ['use', 'bill', 'uflow', 'selesai main'],
      ['bill', 'clean', 'uflow', 'lunas'],
      ['clean', 'av', 'uflow', 'selesai', { lay: 'rev' }],
      ['av', 'fix', 'uflow', 'rusak'],
      ['fix', 'av', 'uflow', 'diperbaiki', { lay: 'rev' }],
    ],
  });
  G('dfd', 'Level 0 (konteks)', {
    dir: 'LR',
    nodes: [
      ['cust', 'dfd-ext', 'Pelanggan'],
      ['kasir', 'dfd-ext', 'Admin / Kasir'],
      ['sys', 'dfd-proc', 'Sistem POS Biliar & Kafe', { num: '0', w: 170, h: 170 }],
      ['dapur', 'dfd-ext', 'Dapur'],
      ['owner', 'dfd-ext', 'Owner'],
    ],
    edges: [
      ['cust', 'sys', 'dflow', 'data booking'],
      ['sys', 'cust', 'dflow', 'konfirmasi & tagihan', { lay: 'rev' }],
      ['kasir', 'sys', 'dflow', 'pesanan F&B, pembayaran'],
      ['sys', 'dapur', 'dflow', 'captain order'],
      ['sys', 'owner', 'dflow', 'laporan penjualan'],
    ],
  });
  G('dfd', 'Level 1', {
    dir: 'LR',
    nodes: [
      ['cust', 'dfd-ext', 'Pelanggan'],
      ['kasir', 'dfd-ext', 'Admin / Kasir'],
      ['p1', 'dfd-proc', 'Kelola booking', { num: '1.0' }],
      ['p2', 'dfd-proc', 'Kelola pesanan F&B', { num: '2.0' }],
      ['p3', 'dfd-proc', 'Proses pembayaran', { num: '3.0' }],
      ['p4', 'dfd-proc', 'Buat laporan', { num: '4.0' }],
      ['d1', 'dfd-store', 'Booking', { num: 'D1' }],
      ['d2', 'dfd-store', 'Pesanan', { num: 'D2' }],
      ['d3', 'dfd-store', 'Pembayaran', { num: 'D3' }],
      ['dapur', 'dfd-ext', 'Dapur'],
      ['owner', 'dfd-ext', 'Owner'],
    ],
    edges: [
      ['cust', 'p1', 'dflow', 'data booking'],
      ['p1', 'd1', 'dflow', 'booking baru'],
      ['kasir', 'p2', 'dflow', 'pesanan F&B'],
      ['p2', 'd2', 'dflow', 'pesanan'],
      ['p2', 'dapur', 'dflow', 'captain order'],
      ['d1', 'p3', 'dflow', 'durasi meja'],
      ['d2', 'p3', 'dflow', 'item pesanan'],
      ['kasir', 'p3', 'dflow', 'pembayaran'],
      ['p3', 'd3', 'dflow', 'transaksi'],
      ['d3', 'p4', 'dflow', 'data transaksi'],
      ['p4', 'owner', 'dflow', 'laporan bulanan'],
    ],
  });
  G('erd', 'POS (crow’s foot)', {
    dir: 'LR',
    nodes: [
      [
        'member',
        'er-table',
        'member',
        { body: 'PK id: int\nnama: varchar(80)\nno_hp: varchar(20)\ntier: varchar(10)' },
      ],
      ['meja', 'er-table', 'meja', { body: 'PK id: int\nnomor: int\ntipe: varchar(20)\ntarif_per_jam: int' }],
      [
        'booking',
        'er-table',
        'booking',
        {
          body: 'PK id: int\nFK member_id: int\nFK meja_id: int\nmulai: timestamp\ndurasi_menit: int\nstatus: varchar(12)',
        },
      ],
      ['pesanan', 'er-table', 'pesanan', { body: 'PK id: int\nFK booking_id: int\nwaktu: timestamp\ntotal: int' }],
      [
        'item',
        'er-table',
        'item_pesanan',
        { body: 'PK id: int\nFK pesanan_id: int\nFK menu_id: int\nqty: int\nsubtotal: int' },
      ],
      ['menu', 'er-table', 'menu', { body: 'PK id: int\nnama: varchar(80)\nharga: int\nkategori: varchar(20)' }],
    ],
    edges: [
      ['member', 'booking', 'cf', '', { c1: 'only', c2: 'zmany' }],
      ['meja', 'booking', 'cf', '', { c1: 'only', c2: 'zmany' }],
      ['booking', 'pesanan', 'cf', '', { c1: 'only', c2: 'zmany' }],
      ['pesanan', 'item', 'cf', '', { c1: 'only', c2: 'omany' }],
      ['menu', 'item', 'cf', '', { c1: 'only', c2: 'zmany' }],
    ],
  });
  EX['erd:Mahasiswa (Chen)'] = {
    n: 'ERD · Mahasiswa (Chen)',
    dt: 'erd',
    build: function () {
      var P = [
          ['mhs', 'er-entity', 'Mahasiswa', 80, 220],
          ['mk', 'er-entity', 'Mata Kuliah', 560, 220],
          ['amb', 'er-rel', 'Mengambil', 320, 210],
          ['nim', 'er-key', 'NIM', 0, 90],
          ['nama', 'er-attr', 'Nama', 150, 90],
          ['hp', 'er-multi', 'No HP', 0, 350],
          ['umur', 'er-derived', 'Umur', 150, 350],
          ['kode', 'er-key', 'Kode', 500, 90],
          ['nmk', 'er-attr', 'Nama MK', 650, 90],
          ['sks', 'er-attr', 'SKS', 650, 350],
          ['nilai', 'er-attr', 'Nilai', 325, 350],
        ],
        m: Record<string, any> = {};
      P.forEach(function (p: any) {
        var n = addNode(p[1], 0, 0);
        n.label = p[2];
        n.x = p[3] + 40;
        n.y = p[4] + 40;
        m[p[0]] = n.id;
      });
      [
        ['nim', 'mhs'],
        ['nama', 'mhs'],
        ['hp', 'mhs'],
        ['umur', 'mhs'],
        ['kode', 'mk'],
        ['nmk', 'mk'],
        ['sks', 'mk'],
        ['nilai', 'amb'],
      ].forEach(function (e) {
        S.edges.push({ id: 'e' + S.seq++, from: m[e[0]], to: m[e[1]], type: 'line', label: '', route: 'straight' });
      });
      S.edges.push(
        { id: 'e' + S.seq++, from: m.mhs, to: m.amb, type: 'line', label: 'M', route: 'straight' },
        { id: 'e' + S.seq++, from: m.amb, to: m.mk, type: 'line', label: 'N', route: 'straight' },
      );
    },
  };
  G('c4', 'POS Biliar · container', {
    dir: 'LR',
    nodes: [
      ['cust', 'c4-person', 'Pelanggan', { body: 'Booking meja dan pesan F&B.' }],
      ['kasir', 'c4-person', 'Admin / Kasir', { body: 'Mengelola meja, pesanan, dan pembayaran.' }],
      ['web', 'c4-container', 'Web Booking', { sub: 'Next.js', body: 'Halaman booking dan membership.' }],
      ['pos', 'c4-container', 'Aplikasi POS', { sub: 'Flutter (tablet)', body: 'Billing meja dan captain order.' }],
      ['api', 'c4-container', 'API', { sub: 'FastAPI', body: 'Logika booking, pesanan, pembayaran.' }],
      ['db', 'c4-db', 'Database', { sub: 'PostgreSQL', body: 'Member, booking, pesanan, transaksi.' }],
      ['wa', 'c4-ext', 'WhatsApp Gateway', { body: 'Notifikasi booking.' }],
      ['pg', 'c4-ext', 'Payment Gateway', { body: 'QRIS dan e-wallet.' }],
    ],
    edges: [
      ['cust', 'web', 'c4rel', 'Booking meja [HTTPS]'],
      ['kasir', 'pos', 'c4rel', 'Mengelola transaksi'],
      ['web', 'api', 'c4rel', 'JSON/HTTPS'],
      ['pos', 'api', 'c4rel', 'JSON/HTTPS'],
      ['api', 'db', 'c4rel', 'SQL'],
      ['api', 'wa', 'c4rel', 'Kirim notifikasi'],
      ['api', 'pg', 'c4rel', 'Charge QRIS'],
    ],
    zones: [['sys', 'b-c4b', 'POS Biliar & Kafe', ['web', 'pos', 'api', 'db']]],
  });
  G('k8s', 'Web app on Kubernetes', {
    dir: 'LR',
    nodes: [
      ['users', 'c-users', 'Users'],
      ['ing', 'c-k-ing', 'Ingress', { sub: 'nginx · TLS' }],
      ['svcw', 'c-k-svc', 'web-svc'],
      ['web', 'c-k-deploy', 'web', { sub: '3 replicas' }],
      ['svca', 'c-k-svc', 'api-svc'],
      ['api', 'c-k-deploy', 'api', { sub: '2–10 replicas' }],
      ['hpa', 'c-k-hpa', 'HPA', { sub: 'CPU 70%' }],
      ['cm', 'c-k-cm', 'api-config'],
      ['sec', 'c-k-secret', 'db-credentials'],
      ['pg', 'c-k-sts', 'postgres', { sub: 'StatefulSet' }],
      ['pv', 'c-k-pv', 'pg-data', { sub: '50 Gi' }],
      ['job', 'c-k-job', 'backup', { sub: 'daily 02:00' }],
    ],
    edges: [
      ['users', 'ing', 'sync', 'HTTPS'],
      ['ing', 'svcw'],
      ['ing', 'svca', 'sync', '/api'],
      ['svcw', 'web'],
      ['svca', 'api'],
      ['hpa', 'api', 'line', 'scales'],
      ['cm', 'api', 'line'],
      ['sec', 'api', 'line'],
      ['api', 'pg', 'sync', 'SQL'],
      ['pg', 'pv', 'line'],
      ['job', 'pg', 'sync', 'pg_dump'],
    ],
    zones: [
      [
        'ns',
        'z-namespace',
        'namespace: prod',
        ['ing', 'svcw', 'web', 'svca', 'api', 'hpa', 'cm', 'sec', 'pg', 'pv', 'job'],
      ],
    ],
  });
  G('network', 'Kantor kecil', {
    dir: 'LR',
    nodes: [
      ['isp', 'c-n-isp', 'ISP', { sub: 'Fiber 100 Mbps' }],
      ['rt', 'c-n-router', 'Router'],
      ['fw', 'c-n-fw', 'Firewall'],
      ['sw', 'c-n-switch', 'Switch', { sub: '24 port' }],
      ['ap', 'c-n-ap', 'Access point', { sub: 'Wi-Fi 6' }],
      ['pc1', 'c-n-pc', 'PC kasir'],
      ['pc2', 'c-n-pc', 'PC admin'],
      ['pr', 'c-n-printer', 'Printer dapur'],
      ['nas', 'c-n-nas', 'NAS', { sub: 'backup harian' }],
      ['cctv', 'c-n-cctv', 'CCTV'],
      ['lap', 'c-n-laptop', 'Laptop owner'],
      ['ph', 'c-n-phone', 'Tablet POS'],
    ],
    edges: [
      ['isp', 'rt', 'line'],
      ['rt', 'fw', 'line'],
      ['fw', 'sw', 'line'],
      ['sw', 'ap', 'line'],
      ['sw', 'pc1', 'line'],
      ['sw', 'pc2', 'line'],
      ['sw', 'pr', 'line'],
      ['sw', 'nas', 'line'],
      ['sw', 'cctv', 'line'],
      ['ap', 'lap', 'line', 'Wi-Fi'],
      ['ap', 'ph', 'line', 'Wi-Fi'],
    ],
    zones: [['lan', 'z-lan', 'LAN 192.168.1.0/24', ['sw', 'ap', 'pc1', 'pc2', 'pr', 'nas', 'cctv', 'lap', 'ph']]],
  });
  G('dist', 'Raft cluster + sharding', {
    dir: 'LR',
    nodes: [
      ['cl', 'c-users', 'Clients'],
      ['ld', 'c-d-leader', 'Leader', { sub: 'term 7' }],
      ['f1', 'c-d-follower', 'Follower 1'],
      ['f2', 'c-d-follower', 'Follower 2'],
      ['rt', 'c-d-coord', 'Shard router', { sub: 'hash(user_id)' }],
      ['s1', 'c-shard', 'Shard A', { sub: 'users 0–33%' }],
      ['s2', 'c-shard', 'Shard B', { sub: 'users 34–66%' }],
      ['s3', 'c-shard', 'Shard C', { sub: 'users 67–100%' }],
      ['r1', 'c-replica', 'Replica A2'],
      ['r2', 'c-replica', 'Replica B2'],
      ['r3', 'c-replica', 'Replica C2'],
    ],
    edges: [
      ['cl', 'ld', 'sync', 'write'],
      ['ld', 'f1', 'bi', 'AppendEntries'],
      ['ld', 'f2', 'bi', 'AppendEntries'],
      ['cl', 'rt', 'sync', 'read / write'],
      ['rt', 's1'],
      ['rt', 's2'],
      ['rt', 's3'],
      ['s1', 'r1', 'async', 'replicate'],
      ['s2', 'r2', 'async', 'replicate'],
      ['s3', 'r3', 'async', 'replicate'],
    ],
    zones: [['raft', 'z-cluster', 'Raft consensus (metadata)', ['ld', 'f1', 'f2']]],
  });
  G('multi', 'Tim riset (supervisor)', {
    dir: 'LR',
    nodes: [
      ['user', 'c-t-chat', 'User request'],
      ['sup', 'c-a-super', 'Supervisor', { sub: 'membagi tugas' }],
      ['plan', 'c-a-planner', 'Planner'],
      ['res', 'c-a-research', 'Researcher'],
      ['ana', 'c-a-coder', 'Analyst', { sub: 'Python sandbox' }],
      ['wri', 'c-a-writer', 'Writer'],
      ['cri', 'c-a-critic', 'Critic'],
      ['web', 'c-a-browser', 'Web search'],
      ['sbx', 'c-a-sandbox', 'Code sandbox'],
      ['mem', 'c-ltmem', 'Long-term memory'],
      ['hum', 'c-a-human', 'Human approval'],
      ['out', 'fc-lgend', 'END'],
    ],
    edges: [
      ['user', 'sup'],
      ['sup', 'plan', 'route2', 'plan'],
      ['sup', 'res', 'route2', 'research'],
      ['sup', 'ana', 'route2', 'analyze'],
      ['sup', 'wri', 'route2', 'write'],
      ['wri', 'cri', 'sync', 'draft'],
      ['cri', 'hum', 'route', 'lolos'],
      ['hum', 'out', 'sync', 'approve'],
      ['res', 'web', 'tool', 'search()'],
      ['ana', 'sbx', 'tool', 'run()'],
      ['sup', 'mem', 'line', 'recall'],
    ],
    zones: [['team', 'z-team', 'Agent team', ['plan', 'res', 'ana', 'wri', 'cri']]],
  });
  G('mlpipe', 'Churn prediction', {
    dir: 'LR',
    nodes: [
      ['src', 'c-sql', 'App database'],
      ['ev', 'c-stream', 'Event stream'],
      ['etl', 'c-pipeline', 'ETL', { sub: 'Airflow + dbt' }],
      ['ds', 'c-m-dataset', 'Training set'],
      ['lab', 'c-m-label', 'Labeling'],
      ['fs', 'c-m-feature', 'Feature store', { sub: 'Feast' }],
      ['nb', 'c-m-notebook', 'Notebook', { sub: 'eksperimen' }],
      ['tr', 'c-m-train', 'Training job', { sub: 'XGBoost' }],
      ['reg', 'c-m-registry', 'Model registry', { sub: 'MLflow' }],
      ['srv', 'c-m-serve', 'Model serving', { sub: 'FastAPI' }],
      ['app', 'c-service', 'CRM app'],
      ['drift', 'c-m-drift', 'Drift monitor'],
    ],
    edges: [
      ['src', 'etl'],
      ['ev', 'etl', 'async'],
      ['etl', 'fs'],
      ['etl', 'ds'],
      ['lab', 'ds'],
      ['ds', 'tr'],
      ['fs', 'tr'],
      ['nb', 'tr', 'line'],
      ['tr', 'reg', 'sync', 'v12'],
      ['reg', 'srv', 'sync', 'deploy'],
      ['fs', 'srv', 'sync', 'online features'],
      ['app', 'srv', 'sync', 'predict'],
      ['srv', 'drift', 'async', 'logs'],
    ],
  });
  G('userflow', 'Booking dari HP', {
    dir: 'LR',
    nodes: [
      ['s', 'fc-terminal', 'Buka app'],
      ['home', 'ux-screen', 'Home'],
      ['pick', 'ux-screen', 'Pilih meja'],
      ['d', 'fc-decision', 'Sudah login?'],
      ['login', 'ux-screen', 'Login'],
      ['pay', 'ux-screen', 'Pembayaran'],
      ['ok', 'ux-screen', 'Booking berhasil'],
      ['e', 'fc-terminal', 'Selesai'],
    ],
    edges: [
      ['s', 'home'],
      ['home', 'pick', 'sync', 'Booking'],
      ['pick', 'd'],
      ['d', 'pay', 'sync', 'ya'],
      ['d', 'login', 'sync', 'tidak'],
      ['login', 'pay'],
      ['pay', 'ok', 'sync', 'bayar QRIS'],
      ['ok', 'e'],
    ],
  });
  EX['wire:Booking (mobile)'] = {
    n: 'Wireframe · Booking (mobile)',
    dt: 'wire',
    build: function () {
      var ph = addNode('b-phone', 0, 0);
      ph.x = 40;
      ph.y = 40;
      ph.label = 'Booking · mobile';
      var put = function (t, x, y, w, h, lab, ex?) {
        var n = addNode(t, 0, 0);
        n.x = 40 + x;
        n.y = 40 + y;
        if (w) n.w = w;
        if (h) n.h = h;
        if (lab != null) n.label = lab;
        if (ex) for (var k in ex) n[k] = ex[k];
        return n;
      };
      put('wf-nav', 0, 44, 360, 56, 'Biliar & Kafe');
      put('wf-heading', 20, 116, 320, 34, 'Pilih meja');
      put('wf-chip', 20, 160, 90, 32, 'Hari ini');
      put('wf-chip', 118, 160, 80, 32, 'Besok');
      put('wf-chip', 206, 160, 100, 32, 'Pilih tanggal');
      put('wf-card', 20, 208, 320, 200, 'Meja 3 · VIP');
      put('wf-list', 20, 422, 320, 170, '', { rows: 3 });
      put('wf-button', 20, 604, 320, 48, 'Lanjut booking');
      put('wf-tabbar', 12, 656, 336, 64, '');
    },
  };
  EX['board:Brainstorm fitur'] = {
    n: 'Whiteboard · Brainstorm fitur',
    dt: 'board',
    build: function () {
      buildBoard(
        [
          {
            name: 'Ide fitur',
            color: 'yellow',
            notes: [
              'Booking online + bayar QRIS',
              'Status meja real-time',
              'Poin member digital',
              'Promo otomatis jam sepi',
            ],
          },
          {
            name: 'Masalah pelanggan',
            color: 'pink',
            notes: ['Admin lambat membalas WhatsApp', 'Tagihan meja dan F&B terpisah', 'Tidak tahu jam ramai'],
          },
          {
            name: 'Quick wins minggu ini',
            color: 'green',
            notes: ['Template balasan WhatsApp', 'Papan status meja di Instagram story'],
          },
        ],
        40,
        20,
      );
    },
  };
}
