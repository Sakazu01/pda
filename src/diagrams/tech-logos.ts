// ---------- built-in tech logos (tech-stack-icons, MIT) ----------
import { T, TH, catColor, esc, ic } from '../core/core';
import { SEC, TECH, set_wsSections, techKey, wsSections } from './catalog';
import { compImg, normName, onColor, set_compImg } from './draw';
import { TECH_EXTRA, TSI } from '../vendor/tech-stack-icons';
import { palItem, secHtml, set_secHtml } from '../editor/workspaces';

// Every other logo in the pack becomes a component too: found by search and in
// the "Semua logo tech" palette section, which only renders when opened.
// catalog names that share a logo with another entry in the pack
export var TSI_ALIAS = { 'GitHub Actions': 'GitHub' };
export var TSI_ALL = [];
export var tsiWsSections0: (ws: any) => any[];
export var tsiSecHtml0: (id: any, open: any, title: any) => string;
export var TSI_URI = {};
export var TSI_BYNORM = {};
export function tsiUri(name, dark) {
  var e = TSI[name];
  if (!e) return null;
  var dk = !!(dark && e.k),
    key = name + (dk ? '|d' : '');
  if (!TSI_URI[key]) {
    try {
      TSI_URI[key] = {
        name: name,
        data: 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(dk ? e.k : e.s))),
        builtin: 1,
      };
    } catch (err) {
      return null;
    }
  }
  return TSI_URI[key];
}
export var tsiCompImg0: (n: any) => any;

// Tech without an MIT logo in the pack still gets a clear badge: a monogram on
// the product's accent color (no brand artwork), cached like the logos.
export var TECH_MONO = {
  OpenRouter: ['OR', '#6467f2'],
  Pinecone: ['Pc', '#1c1c1c'],
  Qdrant: ['Qd', '#dc244c'],
  Weaviate: ['Wv', '#2e7d5b'],
  Chroma: ['Ch', '#e8543c'],
  Kafka: ['Kf', '#231f20'],
  BigQuery: ['BQ', '#4386fa'],
  MinIO: ['Mi', '#c72e49'],
  FastAPI: ['FA', '#009688'],
  Midtrans: ['Mt', '#0a2e5c'],
  Xendit: ['Xd', '#0063ff'],
  SendGrid: ['SG', '#1a82e2'],
  'WhatsApp API': ['WA', '#1fa855'],
  'Google Sheets': ['GS', '#0f9d58'],
  YOLO: ['YO', '#042aff'],
  C: ['C', '#3949ab'],
  Zod: ['Z', '#3068b7'],
  Linux: ['Lx', '#f4c20d'],
  Telegram: ['Tg', '#229ed9'],
  Discord: ['Dc', '#5865f2'],
  Gmail: ['Gm', '#d93025'],
};
export function techMono(name) {
  var key = 'mono|' + name;
  if (TSI_URI[key]) return TSI_URI[key];
  var m = TECH_MONO[name] || [
      String(name)
        .replace(/[^A-Za-z0-9]/g, '')
        .slice(0, 2) || '?',
      '#55606f',
    ],
    fg = onColor(m[1]),
    fs = m[0].length > 1 ? 44 : 56;
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="22" fill="' +
    m[1] +
    '"/><text x="50" y="52" dominant-baseline="central" text-anchor="middle" font-family="system-ui,Segoe UI,Roboto,Arial,sans-serif" font-weight="700" font-size="' +
    fs +
    '" fill="' +
    fg +
    '">' +
    esc(m[0]) +
    '</text></svg>';
  return (TSI_URI[key] = { name: name, data: 'data:image/svg+xml;base64,' + btoa(svg), builtin: 1 });
}

export function install(): void {
  // ---------- built-in tech logos (tech-stack-icons, MIT) ----------
  TECH_EXTRA.forEach(function (x) {
    var k = 'c-' + techKey(x[1]);
    if (T[k]) return;
    TECH.push(x);
    T[k] = { f: 'comp', n: x[1], icon: x[2], cat: x[0], tech: 1, kw: 'tech stack ' + x[1].toLowerCase() };
    var sec =
      ['ai', 'agent', 'rag', 'safe', 'trigger'].indexOf(x[0]) >= 0
        ? 'tech-ai'
        : x[0] === 'data' || x[0] === 'msg'
          ? 'tech-data'
          : x[0] === 'compute' || x[0] === 'client'
            ? 'tech-app'
            : 'tech-cloud';
    if (SEC[sec] && SEC[sec].keys.indexOf(k) < 0) SEC[sec].keys.push(k);
  });
  Object.keys(TSI_ALIAS).forEach(function (a) {
    if (!TSI[a] && TSI[TSI_ALIAS[a]]) TSI[a] = TSI[TSI_ALIAS[a]];
  });
  Object.keys(TSI).forEach(function (name) {
    var k = 'c-' + techKey(name);
    if (T[k]) return;
    T[k] = {
      f: 'comp',
      n: name,
      icon: 'box',
      cat: 'ext',
      tech: 1,
      logoOnly: 1,
      kw: 'tech stack logo ' + String(TSI[name].id || ''),
    };
    TSI_ALL.push(k);
  });
  SEC['tech-all'] = { n: 'Semua logo tech (' + Object.keys(TSI).length + ')', keys: TSI_ALL, cat: 'ext', lazy: 1 };
  tsiWsSections0 = wsSections;
  set_wsSections(function (ws) {
    var o = tsiWsSections0(ws);
    if ((ws === 'sys' || ws === 'ai') && o.indexOf('tech-all') < 0) o.push('tech-all');
    return o;
  });
  tsiSecHtml0 = secHtml;
  set_secHtml(function (id, open, title) {
    if (!SEC[id] || !SEC[id].lazy) return tsiSecHtml0(id, open, title);
    if (open) return tsiSecHtml0(id, open, title);
    // closed: no items yet, so 500+ logos cost nothing until someone opens the section
    return (
      '<details class="pal-sec" data-sec="' +
      id +
      '" data-lazy="1"><summary>' +
      ic('chevron-right') +
      esc(title || SEC[id].n) +
      '<span class="dot" style="background:' +
      catColor(SEC[id].cat) +
      '"></span></summary><div class="pal-grid"></div></details>'
    );
  });
  document.addEventListener(
    'toggle',
    function (ev) {
      var d = ev.target;
      if (
        !d ||
        !(d as HTMLInputElement).matches ||
        !(d as HTMLInputElement).matches('details[data-lazy]') ||
        !(d as HTMLDetailsElement).open
      )
        return;
      (d as HTMLInputElement).removeAttribute('data-lazy');
      var g = (d as HTMLInputElement).querySelector('.pal-grid');
      if (g && !g.children.length)
        g.innerHTML = SEC[(d as HTMLInputElement).getAttribute('data-sec')].keys.map(palItem).join('');
    },
    true,
  );
  Object.keys(TSI).forEach(function (n) {
    TSI_BYNORM[normName(n)] = n;
  });
  tsiCompImg0 = compImg;
  set_compImg(function (n) {
    var r = tsiCompImg0(n);
    if (r) return r;
    var d = T[n.t],
      dark = TH && TH.name === 'dark';
    if (d && d.tech && !n.icon) return tsiUri(d.n, dark) || techMono(d.n);
    if (n.t === 'c-logo' && n.label) {
      var nm = TSI_BYNORM[normName(n.label)];
      if (nm) return tsiUri(nm, dark);
    }
    return null;
  });
}
