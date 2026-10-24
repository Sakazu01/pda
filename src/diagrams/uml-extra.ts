// new UML kinds: component, provided interface, artifact, deployment node
import type { DiagramNode } from '../core/types';
import { S, T, TH, r1, tblock, validColor, wrapText } from '../core/core';
import { DT, SEC, dtOf, reg } from './catalog';
import { drawBox, drawUml, set_drawBox, set_drawUml } from './draw';
import { addNode, fitView, renderAll } from '../core/ui';
import { EX } from './frameworks';
import {
  EDGE_FOR,
  GEN_FALLBACK,
  GRAPH_RULES,
  buildGen,
  genOrigin,
  genPrompt,
  set_buildGen,
  set_genPrompt,
} from '../ai/generate';
import { DT_ICON, PREV, seedType, set_chooseType, set_seedType } from '../editor/workspaces';
import { gx } from './business';
import { pjFilled, pjSwitch, set_pjSwitch } from '../projects/projects';

export var ux2DrawUml0: (n: any, noLabel: any) => string;
export var ux2DrawBox0: (n: any, noLabel: any) => string;
export function apiSeed() {
  var t: Record<string, any> = addNode('table', 0, 0);
  t.x = 0;
  t.y = 60;
  t.w = 980;
  t.h = 230;
  t.data =
    'Method,Endpoint,Akses,Request,Response,Error\nPOST,/login,Publik,"username, password",303 → /dashboard,401 kredensial salah\nGET,/db/{id}/tables,View Only,—,daftar tabel,403 tanpa grant\nPOST,/db/{id}/migrations,View Edit,"name, sql",201 draft,422 SQL kosong';
  var h: Record<string, any> = addNode('text-h', 0, 0);
  h.label = 'Kontrak API';
  h.x = 0;
  h.y = 0;
  h.w = 600;
  h.h = 40;
  h.fs = 22;
  h.bold = 1;
  h.align = 'left';
}
export var ux2SeedType0: (dt: any, fresh: any) => boolean;
export var ux2PjSwitch0: (dt: any, opt: any) => void;
// AI for the API page: rows of a contract table, not boxes and arrows
export var ux2GenPrompt0: (text: any, dt: any) => string;
export var ux2BuildGen0: (d: any, dt: any, mode: any) => { title: string; count: number };

export function install(): void {
  // new UML kinds: component, provided interface, artifact, deployment node
  reg('u-', 'uml', [
    ['comp', 'Component', [200, 92], { lab: 'OrderService', init: { stereo: 'component' } }],
    ['provided', 'Provided interface', [26, 26], { lab: 'IOrder', fixed: 1 }],
    ['artifact', 'Artifact', [180, 70], { lab: 'app.jar', init: { stereo: 'artifact' } }],
  ]);
  reg('b-', 'box', [['node', 'Node (deployment)', [360, 240], { lab: 'Server', init: { stereo: 'device' } }]]);
  Object.assign(PREV, { 'u-comp': [84, 40], 'u-provided': [22, 22], 'u-artifact': [80, 34], 'b-node': [84, 52] });
  ux2DrawUml0 = drawUml;
  set_drawUml(function (n, noLabel) {
    var k = T[n.t].k;
    if (k !== 'comp' && k !== 'provided' && k !== 'artifact') return ux2DrawUml0(n, noLabel);
    var x = n.x,
      y = n.y,
      w = n.w,
      h = n.h,
      st = validColor(n.stroke) ? n.stroke : TH.ink,
      fl = validColor(n.fill) ? n.fill : TH.shape,
      tc = validColor(n.textColor) ? n.textColor : TH.text,
      a = ' stroke="' + st + '" stroke-width="1.6"',
      cx = x + w / 2,
      s = '';
    if (k === 'provided') {
      var R = Math.min(w, h) / 2;
      s = '<circle cx="' + r1(cx) + '" cy="' + r1(y + h / 2) + '" r="' + r1(R - 1) + '" fill="' + fl + '"' + a + '/>';
      if (!noLabel && n.label) s += tblock(cx, y + h + 4, wrapText(n.label, 120, 11), { fs: 11, fill: tc });
      return s;
    }
    s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="' + fl + '"' + a + '/>';
    if (k === 'comp') {
      var ix = x + w - 30,
        iy = y + 9;
      s +=
        '<rect x="' +
        ix +
        '" y="' +
        iy +
        '" width="18" height="22" rx="1.5" fill="' +
        fl +
        '" stroke="' +
        st +
        '" stroke-width="1.3"/><rect x="' +
        (ix - 5) +
        '" y="' +
        (iy + 4) +
        '" width="10" height="5" fill="' +
        fl +
        '" stroke="' +
        st +
        '" stroke-width="1.2"/><rect x="' +
        (ix - 5) +
        '" y="' +
        (iy + 13) +
        '" width="10" height="5" fill="' +
        fl +
        '" stroke="' +
        st +
        '" stroke-width="1.2"/>';
    } else {
      var fx = x + w - 26,
        fy = y + 8;
      s +=
        '<path d="M' +
        fx +
        ' ' +
        fy +
        ' H' +
        (fx + 12) +
        ' L' +
        (fx + 17) +
        ' ' +
        (fy + 5) +
        ' V' +
        (fy + 20) +
        ' H' +
        fx +
        ' Z M' +
        (fx + 12) +
        ' ' +
        fy +
        ' V' +
        (fy + 5) +
        ' H' +
        (fx + 17) +
        '" fill="' +
        fl +
        '" stroke="' +
        st +
        '" stroke-width="1.2" stroke-linejoin="round"/>';
    }
    if (!noLabel) {
      var stl = n.stereo ? ['«' + n.stereo + '»'] : [],
        L = wrapText(n.label || '', w - 44, 13, 700).slice(0, 2),
        sub = n.sub ? wrapText(n.sub, w - 24, 11).slice(0, 2) : [],
        tot = (stl.length ? 14 : 0) + L.length * 16 + (sub.length ? sub.length * 14 + 2 : 0),
        y0 = y + h / 2 - tot / 2;
      if (stl.length) {
        s += tblock(cx, y0, stl, { fs: 11, fill: TH.muted });
        y0 += 14;
      }
      s += tblock(cx, y0, L, { fs: 13, lh: 16, w: 700, fill: tc });
      y0 += L.length * 16 + 2;
      if (sub.length) s += tblock(cx, y0, sub, { fs: 11, lh: 14, fill: TH.muted });
    }
    return s;
  });
  ux2DrawBox0 = drawBox;
  set_drawBox(function (n, noLabel) {
    if (T[n.t].k !== 'node') return ux2DrawBox0(n, noLabel);
    var x = n.x,
      y = n.y,
      w = n.w,
      h = n.h,
      d = 14,
      st = validColor(n.stroke) ? n.stroke : TH.ink,
      tc = validColor(n.textColor) ? n.textColor : TH.text,
      fl = validColor(n.fill) ? n.fill : TH.paper,
      side = TH.name === 'dark' ? '#232a35' : '#eef1f5';
    var s =
      '<path d="M' +
      x +
      ' ' +
      (y + d) +
      ' L' +
      (x + d) +
      ' ' +
      y +
      ' H' +
      (x + w) +
      ' V' +
      (y + h - d) +
      ' L' +
      (x + w - d) +
      ' ' +
      (y + h) +
      ' H' +
      x +
      ' Z" fill="' +
      fl +
      '" fill-opacity="' +
      (validColor(n.fill) ? 1 : 0.001) +
      '"/>';
    s +=
      '<path d="M' +
      x +
      ' ' +
      (y + d) +
      ' L' +
      (x + d) +
      ' ' +
      y +
      ' H' +
      (x + w) +
      ' L' +
      (x + w - d) +
      ' ' +
      (y + d) +
      ' Z" fill="' +
      side +
      '" stroke="' +
      st +
      '" stroke-width="1.5" stroke-linejoin="round"/>';
    s +=
      '<path d="M' +
      (x + w - d) +
      ' ' +
      (y + d) +
      ' L' +
      (x + w) +
      ' ' +
      y +
      ' V' +
      (y + h - d) +
      ' L' +
      (x + w - d) +
      ' ' +
      (y + h) +
      ' Z" fill="' +
      side +
      '" stroke="' +
      st +
      '" stroke-width="1.5" stroke-linejoin="round"/>';
    s +=
      '<rect x="' +
      x +
      '" y="' +
      (y + d) +
      '" width="' +
      (w - d) +
      '" height="' +
      (h - d) +
      '" fill="none" stroke="' +
      st +
      '" stroke-width="1.5"/>';
    if (!noLabel) {
      var t0 = y + d + 10;
      if (n.stereo) {
        s += tblock(x + 12, t0, ['«' + n.stereo + '»'], { fs: 11, fill: TH.muted, anchor: 'start' });
        t0 += 15;
      }
      s += tblock(x + 12, t0, wrapText(n.label || '', w - d - 24, 13, 700).slice(0, 2), {
        fs: 13,
        lh: 16,
        w: 700,
        anchor: 'start',
        fill: tc,
      });
    }
    return s;
  });
  SEC['uml-comp'] = { n: 'Component', keys: ['u-comp', 'u-provided', 'u-interface', 'b-package'] };
  SEC['uml-deploy'] = {
    n: 'Deployment',
    keys: ['b-node', 'u-artifact', 'u-comp', 'c-server', 'c-container', 'c-sql', 'c-users'],
  };
  SEC['api-blocks'] = { n: 'Kontrak API', keys: ['table', 'text-h', 'text'] };
  DT.component = {
    ws: 'se',
    n: 'Component',
    pal: ['uml-comp', 'notes'],
    hint: 'Modul/komponen software dan antarmuka yang disediakan (lingkaran) atau dipakai (garis putus «use»).',
  };
  DT.deploy = {
    ws: 'se',
    n: 'Deployment',
    pal: ['uml-deploy', 'notes'],
    hint: 'Node fisik/virtual (kubus 3D), artefak yang dipasang di dalamnya, dan jalur komunikasinya.',
  };
  DT.api = {
    ws: 'se',
    n: 'Kontrak API',
    pal: ['api-blocks', 'notes'],
    hint: 'Satu baris = satu endpoint: method, path, siapa boleh, request, response, status error.',
  };
  Object.assign(DT_ICON, { component: 'component', deploy: 'boxes', api: 'plug-zap' });
  // page seeds and examples
  gx('component', 'Toko online', {
    dir: 'LR',
    nodes: [
      ['web', 'u-comp', 'WebApp', { sub: 'React' }],
      ['ord', 'u-comp', 'OrderService', { sub: 'Go' }],
      ['pay', 'u-comp', 'PaymentService', { sub: 'Go' }],
      ['inv', 'u-comp', 'InventoryService', { sub: 'Go' }],
      ['io', 'u-provided', 'IOrder'],
      ['ip', 'u-provided', 'IPayment'],
      ['ii', 'u-provided', 'IStock'],
      ['db', 'c-sql', 'OrderDB'],
    ],
    edges: [
      ['ord', 'io', 'uassoc'],
      ['web', 'io', 'udep', '«use»'],
      ['pay', 'ip', 'uassoc'],
      ['ord', 'ip', 'udep', '«use»'],
      ['inv', 'ii', 'uassoc'],
      ['ord', 'ii', 'udep', '«use»'],
      ['ord', 'db', 'udep', 'JDBC'],
    ],
  });
  EX['deploy:Web app 3 lapis'] = {
    n: 'Deployment · Web app 3 lapis',
    dt: 'deploy',
    build: function () {
      var mk = function (t, lab, x, y, w, h, ex) {
        var n = addNode(t, 0, 0);
        n.label = lab;
        n.x = x;
        n.y = y;
        if (w) n.w = w;
        if (h) n.h = h;
        if (ex) for (var k in ex) n[k] = ex[k];
        return n;
      };
      mk('b-node', 'Laptop pengguna', 40, 120, 260, 180, { stereo: 'device' });
      var b = mk('u-artifact', 'Browser', 70, 190, 200, 64, { stereo: 'executionEnvironment' });
      mk('b-node', 'VM aplikasi', 380, 60, 340, 300, { stereo: 'device' });
      mk('b-node', 'Docker', 405, 130, 290, 200, { stereo: 'executionEnvironment' });
      var a = mk('u-artifact', 'server (binary Go)', 430, 200, 240, 70, { stereo: 'artifact' });
      mk('b-node', 'VM database', 800, 120, 300, 180, { stereo: 'device' });
      var p = mk('u-artifact', 'PostgreSQL 16', 830, 190, 240, 64, { stereo: 'executionEnvironment' });
      (
        [
          [b, a, 'HTTPS'],
          [a, p, 'TCP 5432'],
        ] as [DiagramNode, DiagramNode, string][]
      ).forEach(function (q) {
        var e = { id: 'e' + S.seq++, from: q[0].id, to: q[1].id, type: 'uassoc', label: q[2] };
        S.edges.push(e);
      });
    },
  };
  EX['api:Platform DB'] = { n: 'Kontrak API · Platform DB', dt: 'api', build: apiSeed };
  ux2SeedType0 = seedType;
  set_seedType(function (this: any, dt, quiet) {
    if (dt === 'api') {
      apiSeed();
      renderAll();
      return;
    }
    return ux2SeedType0.apply(this, arguments);
  });
  ux2PjSwitch0 = pjSwitch;
  set_pjSwitch(function (this: any, dt, opt) {
    var fresh = DT[dt] && !pjFilled(dt) && dt !== dtOf();
    var r = ux2PjSwitch0.apply(this, arguments);
    if (dt === 'api' && fresh && !(opt && opt.noSeed) && !S.nodes.length) {
      apiSeed();
      renderAll();
      fitView();
    }
    return r;
  });
  set_chooseType(function (dt) {
    pjSwitch(dt);
  });
  ux2GenPrompt0 = genPrompt;
  set_genPrompt(function (text, dt) {
    if (dt !== 'api') return ux2GenPrompt0(text, dt);
    return (
      'You write an HTTP API contract for PDA.\n\nRequest:\n"""\n' +
      text.slice(0, 4000) +
      '\n"""\n\nReply with only one JSON object:\n{"title":"short name","rows":[["POST","/login","Publik","username, password","303 ke /dashboard","401 kredensial salah"]]}\n\nRules:\n- Columns: method, path, who may call it, request body or params, success response, main error.\n- 5 to 16 rows, grouped by resource, REST-style paths with {id} params.\n- Write in the language of the request.'
    );
  });
  ux2BuildGen0 = buildGen;
  set_buildGen(function (d, dt, mode) {
    if (dt !== 'api') return ux2BuildGen0(d, dt, mode);
    if (!d || !Array.isArray(d.rows)) throw { code: 'invalid_json' };
    var q = function (v) {
      v = String(v == null ? '' : v)
        .replace(/"/g, "'")
        .slice(0, 120);
      return /[,\n]/.test(v) ? '"' + v + '"' : v;
    };
    var rows = d.rows
      .slice(0, 24)
      .filter(Array.isArray)
      .map(function (r) {
        return r.slice(0, 6).map(q).join(',');
      });
    var o = genOrigin(mode),
      h: Record<string, any> = addNode('text-h', 0, 0);
    h.label = String(d.title || 'Kontrak API').slice(0, 80);
    h.x = o.x;
    h.y = o.y;
    h.w = 600;
    h.h = 40;
    h.fs = 22;
    h.bold = 1;
    h.align = 'left';
    var t: Record<string, any> = addNode('table', 0, 0);
    t.x = o.x;
    t.y = o.y + 60;
    t.w = 1040;
    t.h = Math.max(140, 40 + rows.length * 34);
    t.data = 'Method,Endpoint,Akses,Request,Response,Error\n' + rows.join('\n');
    return { title: h.label, count: rows.length };
  });
  if (typeof EDGE_FOR !== 'undefined')
    Object.assign(EDGE_FOR, {
      component: ['uassoc', 'udep', 'ureal'],
      deploy: ['uassoc', 'udep'],
      sysdesign: ['sync', 'async', 'stream', 'bi'],
      threat: ['dflow'],
      cicd: ['sync', 'async'],
      eventstorm: ['sync', 'async'],
    });
  if (typeof GRAPH_RULES !== 'undefined')
    Object.assign(GRAPH_RULES, {
      sysdesign:
        'System design for scale: clients → DNS/CDN → load balancer → API gateway → stateless services; caches (c-dcache) beside services, primary DB plus read replicas, queues/streams (c-queue, c-stream) for async work, workers, object storage, search. Label edges with protocol and numbers (QPS, latency, TTL, partition key). Put a short "sub" with the key decision on each node (for example "Redis · TTL 60s", "sharded by user_id").',
      threat:
        'Threat model (STRIDE) as a DFD: dfd-ext external entities (users, attacker), dfd-proc processes with "num", dfd-store data stores, edges dflow labelled with the data and the STRIDE letters at risk (S,T,R,I,D,E). Wrap groups in z-boundary trust boundaries (internet, app, data).',
      cicd: 'CI/CD pipeline: developer → repository (PR + review) → CI (lint, unit test, build) → security scan → artifact/container registry → staging (e2e) → canary → production → monitoring with rollback. Edges sync, labelled with the trigger or gate.',
      eventstorm:
        'Event storming: domain events (past tense, orange), commands (blue), actors, policies, aggregates and external systems in time order left to right.',
      component:
        'UML component diagram: u-comp components ("sub" = technology), u-provided interfaces attached to their provider with uassoc, consumers point at the interface with udep labelled «use»; databases and external systems as c-sql / c-ext.',
      deploy:
        'UML deployment diagram: b-node nodes ("stereo" device or executionEnvironment) that contain u-artifact items placed inside them; communication paths uassoc labelled with protocol and port.',
    });
  if (typeof GEN_FALLBACK !== 'undefined')
    Object.assign(GEN_FALLBACK, {
      component: 'u-comp',
      deploy: 'u-artifact',
      sysdesign: 'c-service',
      threat: 'dfd-proc',
    });
}
