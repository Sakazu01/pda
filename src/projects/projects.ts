// ================= project: one canvas per diagram type, shared PRD + glossary, cross-page integration =================
// A project holds every page (one per diagram type, grouped by workspace), a PRD in Markdown and a shared glossary.
// S is always the active page; the others wait in PROJ.pages.
import { L, LANG } from '../i18n/lang';
import type { Project } from '../core/types';
import { SKETCH_FONT_URI } from '../vendor/virgil-font';
import {
  $,
  S,
  T,
  byId,
  cam,
  clamp,
  esc,
  fam,
  ic,
  lsGet,
  lsSet,
  newId,
  pushUndo,
  redo,
  set_S,
  set_cam,
  set_redo,
  set_selE,
  set_selN,
  set_undo,
  snap,
  syncPool,
  undo,
  validColor,
} from '../core/core';
import { DT, dtOf } from '../diagrams/catalog';
import { autosize, onColor, parseCols } from '../diagrams/draw';
import {
  addEdge,
  addNode,
  applyCam,
  applyStyle,
  bounds,
  commitEdit,
  fitView,
  hydrateIcons,
  render,
  renderAll,
  renderOver,
  searchTypes,
  set_render,
  set_renderAll,
  single,
  syncUndoBtns,
  toast,
} from '../core/ui';
import {
  DOC,
  SAFE_ID,
  applyTheme,
  bindUI,
  contentKey,
  initCaps,
  lastKey,
  loadDoc,
  offerFile,
  payload,
  revealTarget,
  runCheck,
  sanitize,
  saveNow,
  saveT,
  scheduleSave,
  setSave,
  set_boot,
  set_changedSinceBoot,
  set_contentKey,
  set_lastKey,
  set_loadDoc,
  set_payload,
  set_saveNow,
  set_writeWorking,
  slug,
  store,
  writeWorking,
} from '../core/features';
import { buildGraph, buildTree } from '../diagrams/frameworks';
import { inspDoc, inspNode, renderInsp, set_inspDoc, set_inspNode } from '../editor/inspector';
import { dtKind, isContT, runReview } from '../ai/generate';
import {
  DT_ICON,
  WS_BY,
  closeDtPop,
  loadLocalIcons,
  openExample,
  renderChips,
  renderEmpty,
  renderWsTabs,
  seedType,
  set_chooseType,
  set_renderChips,
  set_renderEmpty,
  set_renderWsTabs,
  set_startNew,
  set_uiWs,
  set_usedIcons,
  startNew,
  syncDomain,
  uiWs,
  usedIcons,
} from '../editor/workspaces';
import { aiCap, aiReady } from '../ai/providers';
import { SIM, simClose } from '../editor/simulate';
import { PX_SHOW, pxShowStop } from '../diagrams/shapes-plus';
import { pjSanDeck } from '../slides/deck';

let pjMarksLast: boolean | undefined;
let dictRenderTimer = 0;
export var PROJ: Project = { pages: {}, prd: '', dict: [] };
export var PAGE_UNDO = {};
export var PAGE_CAM = {};
export var PJ_LAST = {};
export var PJ_VIEW = 'canvas';
export var PJ_NEEDFIT = false;
export function pjCur() {
  return dtOf();
}
export function pjPages() {
  var o = {};
  Object.keys(PROJ.pages).forEach(function (k) {
    if (DT[k]) o[k] = PROJ.pages[k];
  });
  o[pjCur()] = S;
  return o;
}
export function pjHas(p) {
  return !!(p && ((p.nodes && p.nodes.length) || (p.edges && p.edges.length)));
}
export function pjFilled(k) {
  return pjHas(k === pjCur() ? S : PROJ.pages[k]);
}
export function pjFilledList() {
  var P = pjPages();
  return Object.keys(DT).filter(function (k) {
    return pjHas(P[k]);
  });
}
export function pjAny() {
  return pjFilledList().length > 0 || !!PROJ.prd.trim() || PROJ.dict.length > 0;
}
export function pjSanDict(d) {
  return (Array.isArray(d) ? d : [])
    .filter(function (x) {
      return x && typeof x === 'object' && String(x.name || '').trim();
    })
    .slice(0, 600)
    .map(function (x) {
      return {
        id: SAFE_ID.test(String(x.id || '')) ? String(x.id) : 'd' + Math.random().toString(36).slice(2, 9),
        name: String(x.name).slice(0, 120),
        kind: PJ_KINDS[x.kind] ? x.kind : 'term',
        alias: (Array.isArray(x.alias) ? x.alias : String(x.alias || '').split(','))
          .map(function (a) {
            return String(a).trim().slice(0, 80);
          })
          .filter(Boolean)
          .slice(0, 12),
        desc: String(x.desc || '').slice(0, 400),
        src: x.src === 'prd' || x.src === 'canvas' ? x.src : 'user',
      };
    });
}
export var PJ_KINDS = {
  actor: 'Aktor',
  entity: 'Entitas data',
  feature: 'Fitur',
  screen: 'Layar',
  step: 'Langkah',
  term: 'Istilah',
};

// ---------- persistence (whole project) ----------
export function pjCore() {
  var P = pjPages(),
    pages = {};
  Object.keys(P).forEach(function (k) {
    var p = P[k];
    if (pjHas(p) || k === pjCur()) pages[k] = { nodes: p.nodes, edges: p.edges, seq: p.seq, style: p.style };
  });
  return {
    cur: pjCur(),
    pages: pages,
    prd: PROJ.prd,
    dict: PROJ.dict,
    deck: PROJ.deck,
    plan: (PROJ.plan || []).slice(0, 30),
  };
}
export var pjLoad0: (d: any, id: any, opts: any) => void;
export var pjUsedIcons0: () => {};

// ---------- switching pages ----------
export function pjSwitch__base(dt, opt?) {
  if (!DT[dt]) return;
  opt = opt || {};
  commitEdit();
  if (SIM.on) simClose();
  if (PX_SHOW.on) pxShowStop();
  var cur = pjCur();
  if (dt !== cur) {
    PROJ.pages[cur] = S;
    PAGE_UNDO[cur] = { u: undo, r: redo };
    PAGE_CAM[cur] = { x: cam.x, y: cam.y, z: cam.z };
    var p = PROJ.pages[dt];
    delete PROJ.pages[dt];
    set_S(p || { nodes: [], edges: [], seq: 1, dt: dt });
    S.dt = dt;
    var uu = PAGE_UNDO[dt] || { u: [], r: [] };
    set_undo(uu.u);
    set_redo(uu.r);
    set_selN([]);
    set_selE(null);
    applyStyle();
    var fresh = !p && !opt.noSeed;
    var kd = dtKind(dt);
    if (fresh && (kd === 'fw' || kd === 'tree')) {
      seedType(dt, true);
      undo.length = 0;
      redo.length = 0;
    }
  }
  PJ_LAST[DT[dt].ws] = dt;
  set_uiWs(DT[dt].ws);
  closeDtPop();
  syncDomain();
  renderAll();
  syncUndoBtns();
  if (PJ_VIEW !== 'canvas' && !opt.keepView) pjView('canvas');
  var c = PAGE_CAM[dt];
  if (dt !== cur) {
    if (c && pjHas(S)) {
      set_cam({ x: c.x, y: c.y, z: c.z });
      applyCam();
      renderOver();
    } else fitView();
  }
  saveNow(false);
  pjMarks();
}
export var pjSwitch: typeof pjSwitch__base = pjSwitch__base;
export function set_pjSwitch(v: typeof pjSwitch__base) {
  return (pjSwitch = v);
}
export function pjWsDefault(ws) {
  if (PJ_LAST[ws] && DT[PJ_LAST[ws]] && DT[PJ_LAST[ws]].ws === ws) return PJ_LAST[ws];
  var ks = Object.keys(DT).filter(function (k) {
      return DT[k].ws === ws;
    }),
    f = ks.filter(pjFilled);
  return f[0] || ks[0];
}
// examples keep opening as their own project, so a demo never lands inside someone's real project

// ---------- chips & tabs show which pages have content ----------
export function pjMarks() {
  document.querySelectorAll('#dtChips [data-dt]').forEach(function (b) {
    var k = b.getAttribute('data-dt'),
      on = pjFilled(k);
    b.classList.toggle('pj-has', on);
    if (on && !b.querySelector('.pj-dot')) {
      var d = document.createElement('span');
      d.className = 'pj-dot';
      d.setAttribute('aria-hidden', 'true');
      b.appendChild(d);
    } else if (!on) {
      var x = b.querySelector('.pj-dot');
      if (x) x.remove();
    }
    (b as HTMLInputElement).title = (DT[k].hint || '') + (on ? ' · halaman ini sudah berisi' : '');
  });
  document.querySelectorAll('#wsTabs [data-ws]').forEach(function (b) {
    var ws = b.getAttribute('data-ws'),
      n = Object.keys(DT).filter(function (k) {
        return DT[k].ws === ws && pjFilled(k);
      }).length,
      c = b.querySelector('.pj-cnt');
    if (n) {
      if (!c) {
        c = document.createElement('span');
        c.className = 'pj-cnt';
        b.appendChild(c);
      }
      c.textContent = String(n);
    } else if (c) c.remove();
    b.setAttribute('aria-selected', String(PJ_VIEW === 'canvas' && ws === uiWs));
  });
  var vp = $('vPrd'),
    vi = $('vInteg');
  if (vp) {
    vp.setAttribute('aria-pressed', String(PJ_VIEW === 'prd'));
    vi.setAttribute('aria-pressed', String(PJ_VIEW === 'integ'));
  }
}
export var pjChips0: () => void;
export var pjTabs0: () => void;
export var pjRenderP: () => void;

// ---------- views: canvas · PRD · integration ----------
export function pjView(v) {
  PJ_VIEW = v;
  var app = document.querySelector('.app');
  app.setAttribute('data-view', v);
  $('prdView').hidden = v !== 'prd';
  $('integView').hidden = v !== 'integ';
  if (v === 'prd') prdOpen();
  if (v === 'integ') integRender();
  if (v === 'canvas') {
    setTimeout(function () {
      if (PJ_NEEDFIT) {
        PJ_NEEDFIT = false;
        fitView();
      } else {
        applyCam();
        renderOver();
      }
    }, 0);
  }
  pjMarks();
}

// ---------- text utilities ----------
export function pjNorm(s) {
  return String(s || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-./]+/g, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
export function pjLabel(s) {
  return String(s || '')
    .split('\n')[0]
    .split(' · ')[0]
    .replace(/\s+/g, ' ')
    .trim();
}
export function pjLev(a, b) {
  if (a === b) return 0;
  var m = a.length,
    n = b.length;
  if (!m || !n) return Math.max(m, n);
  var p = [],
    i,
    j;
  for (j = 0; j <= n; j++) p[j] = j;
  for (i = 1; i <= m; i++) {
    var prev = p[0];
    p[0] = i;
    for (j = 1; j <= n; j++) {
      var t = p[j];
      p[j] = Math.min(p[j] + 1, p[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = t;
    }
  }
  return p[n];
}
export function pjSim(a, b) {
  if (!a || !b) return 0;
  var ta = a.split(' '),
    tb = b.split(' '),
    inter = ta.filter(function (t) {
      return tb.indexOf(t) >= 0;
    }).length,
    jac = inter / (ta.length + tb.length - inter);
  return Math.max(jac, 1 - pjLev(a, b) / Math.max(a.length, b.length));
}
export var PJ_SYSTEM = {
  sistem: 1,
  system: 1,
  aplikasi: 1,
  app: 1,
  server: 1,
  backend: 1,
  platform: 1,
  database: 1,
  api: 1,
  frontend: 1,
};
// a lane named after a glossary term ("Target DB", "Payment gateway") is a system participant, not a person
export function pjIsSys(ix, norm) {
  if (PJ_SYSTEM[norm]) return true;
  var L = ix[norm] || [];
  return (
    L.length > 0 &&
    L.every(function (t) {
      return t.kind === 'term';
    })
  );
}

// ---------- what each node means for integration ----------
export var PJ_KIND_T = {
  'u-actor': 'actor',
  'u-seq-actor': 'actor',
  'c4-person': 'actor',
  'c4-extperson': 'actor',
  'dfd-ext': 'actor',
  'c-user': 'actor',
  'c-users': 'actor',
  'er-table': 'entity',
  'er-entity': 'entity',
  'er-weak': 'entity',
  'u-class': 'entity',
  'dfd-store': 'entity',
  'data-store': 'entity',
  'data-obj': 'entity',
  'u-usecase': 'feature',
  'ux-screen': 'screen',
  'b-phone': 'screen',
  'b-browser': 'screen',
  'tr-page': 'screen',
  'u-act-action': 'step',
  'dfd-proc': 'step',
  'dfd-procgs': 'step',
};
export function pjKindOf(n, dt) {
  var k = PJ_KIND_T[n.t];
  if (k) return k;
  var f = fam(n);
  if (f === 'task') return 'step';
  if (f === 'comp' && DT[dt] && DT[dt].ws === 'ai') return 'step';
  return null;
}
export function pjMentions() {
  var out = [],
    P = pjPages();
  Object.keys(P).forEach(function (dt) {
    var p = P[dt];
    if (!pjHas(p)) return;
    p.nodes.forEach(function (n) {
      if (n.t === 'pool') {
        if (n.lanes && n.lanes.length)
          n.lanes.forEach(function (l, i) {
            var nm = pjLabel(l.name);
            if (nm && !/^lane \d+$/i.test(nm))
              out.push({ dt: dt, id: n.id, lane: i, kind: 'actor', name: nm, norm: pjNorm(nm) });
          });
        else {
          var pn = pjLabel(n.label);
          if (pn && pn !== 'Participant name')
            out.push({ dt: dt, id: n.id, kind: 'actor', name: pn, norm: pjNorm(pn) });
        }
        return;
      }
      var k = pjKindOf(n, dt);
      if (!k) return;
      var nm2 = pjLabel(n.label);
      if (!nm2) return;
      out.push({ dt: dt, id: n.id, kind: k, name: nm2, norm: pjNorm(nm2) });
    });
  });
  return out;
}
export function pjDictIndex() {
  var ix = {};
  PROJ.dict.forEach(function (t) {
    [t.name].concat(t.alias || []).forEach(function (a) {
      var k = pjNorm(a);
      if (!k) return;
      (ix[k] = ix[k] || []).push(t);
    });
  });
  return ix;
}
// same name can mean different things (screen “Pembayaran” ≠ table “Pembayaran”): prefer a term of the same kind, then a generic glossary term
export function pjFind(ix, norm, kind) {
  var L = ix[norm];
  if (!L) return null;
  for (var i = 0; i < L.length; i++) if (L[i].kind === kind) return L[i];
  for (i = 0; i < L.length; i++) if (L[i].kind === 'term') return L[i];
  return kind ? null : L[0];
}
export function pjConcepts() {
  var ix = pjDictIndex(),
    M = pjMentions(),
    C = {},
    order = [];
  function get(key, name, kind, term) {
    if (!C[key]) {
      C[key] = { key: key, name: name, kind: kind, term: term || null, at: [] };
      order.push(key);
    }
    return C[key];
  }
  PROJ.dict.forEach(function (t) {
    get('d:' + t.id, t.name, t.kind, t);
  });
  M.forEach(function (m) {
    var t = pjFind(ix, m.norm, m.kind),
      c = t ? get('d:' + t.id, t.name, t.kind, t) : get(m.kind + ':' + m.norm, m.name, m.kind, null);
    c.at.push(m);
  });
  return order.map(function (k) {
    return C[k];
  });
}

// ---------- integration checks ----------
export var PJ_SUGGEST = {
  actor: ['usecase', 'bpmn'],
  entity: ['erd', 'class'],
  feature: ['usecase', 'bpmn'],
  screen: ['wire', 'userflow'],
  term: [],
  step: [],
};
export function pjAttrNames(n) {
  if (n.t === 'er-table')
    return parseCols(n.body)
      .map(function (c) {
        return pjNorm(c.name);
      })
      .filter(Boolean);
  if (n.t === 'u-class')
    return String(n.attrs || '')
      .split('\n')
      .map(function (l) {
        var m = /^\s*[+\-#~]?\s*([^:(]+)/.exec(l);
        return m ? pjNorm(m[1]) : '';
      })
      .filter(Boolean);
  return [];
}
export function pjCheck() {
  var out = [],
    P: Record<string, any> = pjPages(),
    M = pjMentions(),
    ix = pjDictIndex(),
    filled = pjFilledList(),
    has = function (dt) {
      return filled.indexOf(dt) >= 0;
    };
  function nm(s) {
    return '“' + s + '”';
  }
  function pg(dt) {
    return DT[dt] ? DT[dt].n : dt;
  }
  function keyOf(m) {
    var t = pjFind(ix, m.norm, m.kind);
    return t ? 'd:' + t.id : m.norm;
  }
  // 1 · terms in the PRD/glossary that no canvas shows yet
  PROJ.dict.forEach(function (t) {
    if (t.kind === 'term' || t.kind === 'step') return;
    var hit = M.some(function (m) {
      return pjFind(ix, m.norm, m.kind) === t;
    });
    if (!hit) {
      var sug = (PJ_SUGGEST[t.kind] || []).map(pg).join(' / ');
      out.push({
        sev: 'warn',
        cat: 'Cakupan',
        msg:
          PJ_KINDS[t.kind] +
          ' ' +
          nm(t.name) +
          ' ada di ' +
          (t.src === 'prd' ? 'PRD' : 'kamus') +
          ' tapi belum digambar di kanvas mana pun' +
          (sug ? ' (biasanya di ' + sug + ')' : '') +
          '.',
        refs: [],
        term: t.id,
      });
    }
  });
  // 2 · near-identical names for what is probably the same thing
  var seen = {},
    groups = {};
  M.forEach(function (m) {
    if (m.kind === 'step') return;
    var k = m.kind + '|' + keyOf(m);
    if (!groups[k]) groups[k] = { kind: m.kind, key: keyOf(m), name: m.name, norm: m.norm, at: [] };
    groups[k].at.push(m);
  });
  var G = Object.keys(groups).map(function (k) {
    return groups[k];
  });
  PROJ.dict.forEach(function (t) {
    if (
      !G.some(function (g) {
        return g.key === 'd:' + t.id;
      })
    )
      G.push({ kind: t.kind, key: 'd:' + t.id, name: t.name, norm: pjNorm(t.name), at: [], dict: true });
  });
  for (var i = 0; i < G.length; i++)
    for (var j = i + 1; j < G.length; j++) {
      var a = G[i],
        b = G[j];
      if (a.kind !== b.kind || a.key === b.key || a.kind === 'term') continue;
      if (a.kind === 'actor' && pjIsSys(ix, a.norm) && pjIsSys(ix, b.norm)) continue;
      var s = pjSim(a.norm, b.norm);
      if (s < 0.72 || s >= 1) continue;
      var pa = a.at.map(function (m) {
          return m.dt;
        }),
        pb = b.at.map(function (m) {
          return m.dt;
        });
      var where = function (g, p) {
        return g.dict && !p.length
          ? 'kamus'
          : p
              .filter(function (x, i) {
                return p.indexOf(x) === i;
              })
              .map(pg)
              .join(', ');
      };
      var pk = [a.key, b.key].sort().join('~');
      if (seen[pk]) continue;
      seen[pk] = 1;
      out.push({
        sev: 'warn',
        cat: 'Nama tidak konsisten',
        kind: a.kind,
        msg:
          nm(a.name) +
          ' (' +
          where(a, pa) +
          ') dan ' +
          nm(b.name) +
          ' (' +
          where(b, pb) +
          ') mirip. Kalau maksudnya sama, samakan namanya atau jadikan alias di kamus.',
        refs: a.at.concat(b.at).slice(0, 6),
        pair: [a.name, b.name],
      });
    }
  // 3 · Class ↔ ERD must describe the same data
  if (has('class') && has('erd')) {
    var cls = P['class'].nodes.filter(function (n) {
        return n.t === 'u-class';
      }),
      tbl = P.erd.nodes.filter(function (n) {
        return n.t === 'er-table' || n.t === 'er-entity';
      });
    var key = function (n) {
      var k = pjNorm(pjLabel(n.label)),
        t = pjFind(ix, k, 'entity');
      return t ? 'd:' + t.id : k;
    };
    cls.forEach(function (c) {
      var m = tbl.filter(function (t) {
        return key(t) === key(c);
      })[0];
      if (!m) {
        out.push({
          sev: 'warn',
          cat: 'Class ↔ ERD',
          msg: 'Class ' + nm(pjLabel(c.label)) + ' tidak punya tabel padanan di ERD.',
          refs: [{ dt: 'class', id: c.id }],
        });
        return;
      }
      if (m.t !== 'er-table') return;
      var fkc = {};
      parseCols(m.body).forEach(function (cc) {
        if (/FK/.test(cc.key)) fkc[pjNorm(cc.name)] = 1;
      });
      var ca = pjAttrNames(c),
        ta = pjAttrNames(m).filter(function (x) {
          return !/ id$/.test(x) && !fkc[x];
        });
      var miss1 = ta.filter(function (x) {
          return ca.indexOf(x) < 0;
        }),
        miss2 = ca.filter(function (x) {
          return ta.indexOf(x) < 0 && !/ id$/.test(x);
        });
      if (miss1.length || miss2.length)
        out.push({
          sev: 'info',
          cat: 'Class ↔ ERD',
          msg:
            nm(pjLabel(c.label)) +
            ': ' +
            (miss1.length ? 'ERD punya ' + miss1.join(', ') + ' yang tidak ada di class' : '') +
            (miss1.length && miss2.length ? '; ' : '') +
            (miss2.length ? 'class punya ' + miss2.join(', ') + ' yang tidak ada di ERD' : '') +
            '.',
          refs: [
            { dt: 'class', id: c.id },
            { dt: 'erd', id: m.id },
          ],
        });
    });
    tbl.forEach(function (t) {
      if (
        !cls.some(function (c) {
          return key(c) === key(t);
        })
      )
        out.push({
          sev: 'info',
          cat: 'Class ↔ ERD',
          msg: 'Tabel ' + nm(pjLabel(t.label)) + ' belum punya class di Class diagram.',
          refs: [{ dt: 'erd', id: t.id }],
        });
    });
  }
  // 4 · the same people should act in Use Case, BPMN and DFD
  var act = function (dt) {
    return M.filter(function (m) {
      return m.dt === dt && m.kind === 'actor' && !pjIsSys(ix, m.norm);
    });
  };
  [
    ['usecase', 'bpmn'],
    ['usecase', 'dfd'],
  ].forEach(function (pr) {
    if (!has(pr[0]) || !has(pr[1])) return;
    var A = act(pr[0]),
      B = act(pr[1]),
      kb = B.map(keyOf),
      ka = A.map(keyOf);
    A.forEach(function (m) {
      if (kb.indexOf(keyOf(m)) < 0)
        out.push({
          sev: 'info',
          cat: 'Aktor',
          msg: 'Aktor ' + nm(m.name) + ' ada di ' + pg(pr[0]) + ' tapi tidak muncul di ' + pg(pr[1]) + '.',
          refs: [m],
        });
    });
    B.forEach(function (m) {
      if (ka.indexOf(keyOf(m)) < 0)
        out.push({
          sev: 'info',
          cat: 'Aktor',
          msg: 'Aktor ' + nm(m.name) + ' ada di ' + pg(pr[1]) + ' tapi tidak ada di ' + pg(pr[0]) + '.',
          refs: [m],
        });
    });
  });
  // 5 · canvas items the PRD never mentions (only once the PRD lists that kind of thing)
  var prdKinds = {};
  PROJ.dict.forEach(function (t) {
    if (t.src === 'prd') prdKinds[t.kind] = 1;
  });
  M.forEach(function (m) {
    if (!prdKinds[m.kind] || pjFind(ix, m.norm, m.kind) || pjIsSys(ix, m.norm)) return;
    if (m.kind === 'feature' && m.dt !== 'usecase') return;
    if (m.kind === 'screen' && ['wire', 'userflow', 'sitemap'].indexOf(m.dt) < 0) return;
    out.push({
      sev: 'info',
      cat: 'Belum di PRD',
      msg: PJ_KINDS[m.kind] + ' ' + nm(m.name) + ' (' + pg(m.dt) + ') belum disebut di PRD.',
      refs: [m],
      add: { name: m.name, kind: m.kind },
    });
  });
  if (filled.length && !PROJ.prd.trim())
    out.push({
      sev: 'info',
      cat: 'PRD',
      msg: 'PRD masih kosong. Buka PRD lalu “Perbarui dari kanvas” supaya dokumen dan diagram tetap sejalan.',
      refs: [],
      go: 'prd',
    });
  return out;
}

// ---------- integration view ----------
export var PJ_ISSUES = [];
export var PJ_AI = [];
export function integRender() {
  var iss = (PJ_ISSUES = pjCheck().concat(PJ_AI)),
    C = pjConcepts().filter(function (c) {
      return c.kind !== 'step' && (c.at.length || c.term);
    }),
    filled = pjFilledList();
  var w = iss.filter(function (x) {
    return x.sev === 'warn' || x.sev === 'err';
  }).length;
  $('integStat').textContent =
    filled.length +
    ' halaman terisi · ' +
    PROJ.dict.length +
    ' istilah di kamus · ' +
    (iss.length ? iss.length + ' temuan (' + w + ' penting)' : 'tidak ada temuan');
  var s = '';
  if (!iss.length)
    s =
      '<p class="iv-ok">' + ic('circle-check-big') + 'Semua halaman dan PRD sejalan. Tidak ada nama yang bentrok.</p>';
  iss.forEach(function (x, i) {
    s +=
      '<div class="iv-issue" data-sev="' +
      x.sev +
      '"><span class="iv-cat">' +
      esc(x.cat) +
      '</span><p>' +
      esc(x.msg) +
      '</p><div class="iv-acts">';
    var dts = {};
    (x.refs || []).forEach(function (r) {
      if (r && r.dt && !dts[r.dt]) {
        dts[r.dt] = 1;
        s +=
          '<button type="button" class="sbtn" data-pjgo="' +
          r.dt +
          '|' +
          (r.id || '') +
          '">' +
          ic(DT_ICON[r.dt] || 'layout-grid') +
          esc(DT[r.dt] ? DT[r.dt].n : r.dt) +
          '</button>';
      }
    });
    if (x.pair)
      s += '<button type="button" class="sbtn" data-pjalias="' + i + '">' + ic('link-2') + 'Jadikan alias</button>';
    if (x.add)
      s += '<button type="button" class="sbtn" data-pjadd="' + i + '">' + ic('plus') + 'Tambah ke kamus</button>';
    if (x.go === 'prd')
      s += '<button type="button" class="sbtn" data-pjv="prd">' + ic('file-text') + 'Buka PRD</button>';
    s += '</div></div>';
  });
  $('integIssues').innerHTML = s;
  // traceability matrix: concept × page
  var cols = filled.slice();
  var m = '';
  if (!C.length) m = '<p class="note">Belum ada aktor, entitas, fitur, atau layar yang bisa dipetakan.</p>';
  else {
    m =
      '<div class="iv-mx" role="region" aria-label="Peta keterkaitan" tabindex="0"><table><thead><tr><th scope="col">Konsep</th><th scope="col" title="PRD / kamus">PRD</th>' +
      cols
        .map(function (d) {
          return '<th scope="col" title="' + esc(DT[d].n) + '"><span>' + esc(DT[d].n) + '</span></th>';
        })
        .join('') +
      '</tr></thead><tbody>';
    ['actor', 'entity', 'feature', 'screen', 'term'].forEach(function (kd) {
      var rows = C.filter(function (c) {
        return c.kind === kd;
      });
      if (!rows.length) return;
      m += '<tr class="iv-grp"><th colspan="' + (cols.length + 2) + '">' + esc(PJ_KINDS[kd]) + '</th></tr>';
      rows.slice(0, 80).forEach(function (c) {
        m +=
          '<tr><th scope="row">' +
          esc(c.name) +
          '</th><td>' +
          (c.term && c.term.src === 'prd'
            ? '<i class="iv-dot on" title="Disebut di PRD"></i>'
            : c.term
              ? '<i class="iv-dot alt" title="Ada di kamus"></i>'
              : '<i class="iv-dot off" title="Tidak ada di PRD"></i>') +
          '</td>';
        cols.forEach(function (d) {
          var at = c.at.filter(function (x) {
            return x.dt === d;
          });
          m +=
            '<td>' +
            (at.length
              ? '<button type="button" class="iv-dot on" data-pjgo="' +
                d +
                '|' +
                at[0].id +
                '" title="' +
                esc(c.name) +
                ' di ' +
                esc(DT[d].n) +
                '" aria-label="' +
                esc(c.name) +
                ' di ' +
                esc(DT[d].n) +
                '">' +
                (at.length > 1 ? at.length : '') +
                '</button>'
              : '') +
            '</td>';
        });
        m += '</tr>';
      });
    });
    m += '</tbody></table></div>';
  }
  $('integMatrix').innerHTML = m;
  dictRender();
}
export function dictRender() {
  var s = '<div class="iv-dict">';
  PROJ.dict.forEach(function (t, i) {
    s +=
      '<div class="iv-term" data-i="' +
      i +
      '"><input type="text" data-dk="name" value="' +
      esc(t.name) +
      '" aria-label="Nama istilah"><select data-dk="kind" aria-label="Jenis">' +
      Object.keys(PJ_KINDS)
        .map(function (k) {
          return '<option value="' + k + '"' + (t.kind === k ? ' selected' : '') + '>' + PJ_KINDS[k] + '</option>';
        })
        .join('') +
      '</select>' +
      '<input type="text" data-dk="alias" value="' +
      esc((t.alias || []).join(', ')) +
      '" placeholder="alias, pisahkan koma" aria-label="Alias"><input type="text" data-dk="desc" value="' +
      esc(t.desc || '') +
      '" placeholder="arti singkat" aria-label="Arti"><button type="button" class="ibtn" data-dkdel="' +
      i +
      '" aria-label="Hapus ' +
      esc(t.name) +
      '">' +
      ic('x') +
      '</button></div>';
  });
  if (!PROJ.dict.length)
    s +=
      '<p class="note">Kamus menyamakan nama di semua bagian: misalnya “Pembayaran” di Bisnis = “Payment” di Automation. Isi dari PRD, dari kanvas, atau tambah manual.</p>';
  s +=
    '</div><div class="acts"><button type="button" class="sbtn" data-pj="dict-new">' +
    ic('plus') +
    'Istilah baru</button><button type="button" class="sbtn" data-pj="dict-canvas">' +
    ic('download') +
    'Ambil dari kanvas</button></div>';
  $('integDict').innerHTML = s;
}
export function pjDictMerge(items, src) {
  var ix = pjDictIndex(),
    n = 0;
  items.forEach(function (it) {
    if (!it || !String(it.name || '').trim()) return;
    var k = pjNorm(it.name),
      t = pjFind(ix, k, it.kind || 'term') || (it.kind === 'term' || !it.kind ? (ix[k] || [])[0] : null);
    if (t) {
      if (it.desc && !t.desc) t.desc = it.desc;
      if (t.kind === 'term' && it.kind) t.kind = it.kind;
      (it.alias || []).forEach(function (a) {
        if (t.alias.indexOf(a) < 0 && pjNorm(a) !== pjNorm(t.name)) t.alias.push(a);
      });
      if (src === 'prd') t.src = 'prd';
      return;
    }
    t = {
      id: 'd' + Math.random().toString(36).slice(2, 9),
      name: String(it.name).trim(),
      kind: PJ_KINDS[it.kind] ? it.kind : 'term',
      alias: (it.alias || []).slice(0, 12),
      desc: it.desc || '',
      src: src || 'user',
    };
    PROJ.dict.push(t);
    n++;
    [t.name].concat(t.alias).forEach(function (a) {
      var q = pjNorm(a);
      (ix[q] = ix[q] || []).push(t);
    });
  });
  return n;
}
export function pjGo(dt, id) {
  if (!DT[dt]) return;
  pjSwitch(dt);
  if (id && byId(id)) {
    setTimeout(function () {
      revealTarget({ n: [id] });
    }, 40);
  }
}

// ---------- node inspector: where else does this thing appear? ----------
export var pjInspNode0: (n: any) => string;
export var pjInspDoc0: () => string;

// ---------- AI cross-check (optional) ----------
export function integAi() {
  if (!aiReady()) {
    toast('Hubungkan model AI dulu lewat tombol AI di atas');
    return;
  }
  var P = pjPages(),
    parts = [];
  pjFilledList().forEach(function (dt) {
    var p = P[dt];
    parts.push(
      '### ' +
        DT[dt].n +
        '\n' +
        p.nodes
          .slice(0, 120)
          .map(function (n) {
            var b = pjLabel(n.label);
            var x = n.attrs || n.body || '';
            return (
              '- ' +
              (T[n.t] ? T[n.t].n : n.t) +
              ': ' +
              b +
              (x ? ' [' + String(x).replace(/\n/g, '; ').slice(0, 160) + ']' : '')
            );
          })
          .filter(function (l) {
            return !/: $/.test(l);
          })
          .join('\n'),
    );
  });
  var prompt =
    'Kamu memeriksa konsistensi antar-diagram dalam satu proyek perangkat lunak. Cari ketidaksesuaian nyata: hal yang disebut di PRD tetapi dibangun berbeda di diagram lain, aktor/entitas/fitur yang namanya beda untuk hal yang sama, alur bisnis yang tidak didukung otomasi atau data, layar yang tidak punya fitur, dsb. Jangan mengulang hal sepele.\n\nPRD:\n' +
    PROJ.prd.slice(0, 12000) +
    '\n\nKamus: ' +
    PROJ.dict
      .map(function (t) {
        return t.name + (t.alias.length ? ' (' + t.alias.join(', ') + ')' : '');
      })
      .join('; ') +
    '\n\nDiagram:\n' +
    parts.join('\n\n').slice(0, 24000) +
    '\n\nBalas HANYA JSON: {"issues":[{"severity":"warn"|"info","category":"teks pendek","message":"kalimat ' +
    L('dalam bahasa Inggris', 'bahasa Indonesia') +
    ' yang menyebut nama elemen dan halaman","pages":["nama halaman persis seperti di atas"]}]} maksimal 12 butir.';
  var b = $('integAi');
  b.disabled = true;
  var lab = b.innerHTML;
  b.innerHTML = ic('sparkles') + 'Memeriksa…';
  aiCap()
    .json(prompt, { cache: false })
    .then(
      function (d) {
        var names = {};
        Object.keys(DT).forEach(function (k) {
          names[DT[k].n.toLowerCase()] = k;
        });
        PJ_AI = ((d && d.issues) || [])
          .slice(0, 12)
          .map(function (x) {
            return {
              sev: x.severity === 'warn' ? 'warn' : 'info',
              cat: 'AI · ' + String(x.category || 'Temuan').slice(0, 40),
              msg: String(x.message || '').slice(0, 400),
              refs: (x.pages || [])
                .map(function (p) {
                  var k = names[String(p).toLowerCase()];
                  return k ? { dt: k } : null;
                })
                .filter(Boolean),
            };
          })
          .filter(function (x) {
            return x.msg;
          });
        integRender();
        toast(PJ_AI.length ? PJ_AI.length + ' temuan dari AI ditambahkan' : 'AI tidak menemukan ketidaksesuaian');
      },
      function (e) {
        toast(String((e && e.message) || 'AI gagal memeriksa'));
      },
    )
    .then(function () {
      b.disabled = false;
      b.innerHTML = lab;
    });
}

// ================= PRD (Markdown) =================
export var PRD_SEC = {
  actors: ['aktor', 'actor', 'actors', 'pengguna', 'user', 'users', 'peran', 'roles', 'user roles', 'stakeholder'],
  features: [
    'fitur',
    'features',
    'feature',
    'kebutuhan fungsional',
    'functional requirements',
    'fungsionalitas',
    'use case',
    'use cases',
  ],
  entities: [
    'entitas',
    'entitas data',
    'data',
    'model data',
    'data model',
    'entities',
    'entity',
    'basis data',
    'database',
  ],
  flows: [
    'alur',
    'alur bisnis',
    'flow',
    'flows',
    'proses',
    'proses bisnis',
    'process',
    'business process',
    'user flow',
  ],
  screens: ['layar', 'halaman', 'screens', 'screen', 'pages', 'ui', 'tampilan', 'wireframe'],
  auto: ['otomasi', 'automation', 'automasi', 'integrasi', 'integrations', 'workflow otomasi'],
  arch: [
    'arsitektur',
    'architecture',
    'arsitektur sistem',
    'system design',
    'desain sistem',
    'infrastruktur',
    'infrastructure',
    'komponen sistem',
  ],
  design: ['desain', 'design', 'grand design', 'design system', 'gaya visual', 'visual'],
  dict: ['kamus', 'glosarium', 'glossary', 'istilah', 'definisi'],
};
export var PRD_HEAD = {
  actors: 'Aktor',
  features: 'Fitur',
  entities: 'Entitas Data',
  flows: 'Alur',
  screens: 'Layar',
  auto: 'Otomasi',
  arch: 'Arsitektur',
  design: 'Desain',
  dict: 'Kamus',
};
export var PRD_PAGES = {
  actors: ['usecase', 'bpmn'],
  features: ['usecase'],
  entities: ['erd', 'class'],
  flows: ['bpmn', 'activity'],
  screens: ['wire', 'userflow', 'sitemap'],
  auto: ['n8n'],
  arch: ['sysdesign'],
  design: ['gds'],
  dict: [],
};
export var PRD_ORDER = ['actors', 'features', 'entities', 'flows', 'screens', 'arch', 'auto', 'design', 'dict'];
export function prdSecKey(h) {
  var n = pjNorm(h).replace(/^\d+\s*/, '');
  for (var k in PRD_SEC) if (PRD_SEC[k].indexOf(n) >= 0) return k;
  for (var k2 in PRD_SEC)
    if (
      PRD_SEC[k2].some(function (w) {
        return n.indexOf(w) === 0 && w.length > 3;
      })
    )
      return k2;
  return null;
}
export function prdSplit(md) {
  var lines = String(md || '')
      .replace(/\r/g, '')
      .split('\n'),
    title = '',
    secs = [],
    cur = { head: null, key: null, lines: [] };
  lines.forEach(function (l) {
    var m = /^(#{1,2})\s+(.*)$/.exec(l);
    if (m && m[1] === '#' && !title) {
      title = m[2].trim();
      cur.lines.push(l);
      return;
    }
    if (m && m[1] === '##') {
      secs.push(cur);
      cur = { head: m[2].trim(), key: prdSecKey(m[2]), lines: [l] };
      return;
    }
    cur.lines.push(l);
  });
  secs.push(cur);
  return { title: title, secs: secs };
}
export function prdItem(l) {
  var m = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/.exec(l);
  if (!m) return null;
  var t = m[1].trim();
  var tags: Record<string, string[]> = {};
  t = t
    .replace(/\[(include|extend|pk|fk|uk)\s*(?::|→|->)?\s*([^\]]*)\]/gi, function (x, k, v) {
      k = k.toLowerCase();
      (tags[k] = tags[k] || []).push(v.trim());
      return '';
    })
    .trim();
  var name,
    rest = '',
    m2 = /^\*\*(.+?)\*\*\s*(.*)$/.exec(t);
  if (m2) {
    name = m2[1].trim();
    rest = m2[2];
  } else {
    var cut = t.search(/\s[—–-]\s|:\s|:$/);
    if (cut > 0) {
      name = t.slice(0, cut).trim();
      rest = t.slice(cut);
    } else {
      name = t;
      rest = '';
    }
  }
  var paren = '';
  var m3 = /^\(([^)]*)\)\s*(.*)$/.exec(rest.trim());
  if (m3) {
    paren = m3[1];
    rest = m3[2];
  }
  rest = rest.replace(/^\s*(?:[—–-]|:)\s*/, '').trim();
  return {
    name: name
      .replace(/\*\*|`/g, '')
      .replace(/^_(.+)_$/, '$1')
      .trim(),
    paren: paren,
    desc: rest,
    tags: tags,
  };
}
export function prdParse(md) {
  var sp = prdSplit(md),
    R = {
      title: sp.title,
      actors: [],
      features: [],
      entities: [],
      flows: [],
      screens: [],
      auto: [],
      arch: [],
      design: { colors: [], font: '', notes: [], platform: '' },
      dict: [],
    };
  sp.secs.forEach(function (sec) {
    if (!sec.key) return;
    var L = sec.lines.slice(1),
      k = sec.key;
    if (k === 'actors')
      L.forEach(function (l) {
        var it = prdItem(l);
        if (it && it.name) R.actors.push({ name: it.name, desc: it.desc });
      });
    if (k === 'features')
      L.forEach(function (l) {
        var it = prdItem(l);
        if (!it || !it.name) return;
        var acts = it.paren
          ? it.paren
              .split(/[,;/]|\bdan\b/)
              .map(function (a) {
                return a.trim();
              })
              .filter(Boolean)
          : [];
        R.features.push({
          name: it.name,
          actors: acts,
          desc: it.desc,
          inc: it.tags.include || [],
          ext: it.tags.extend || [],
        });
      });
    if (k === 'entities') {
      var cur = null;
      L.forEach(function (l) {
        var h = /^###\s+(.*)$/.exec(l);
        if (h) {
          cur = { name: h[1].replace(/\*\*|`/g, '').trim(), cols: [] };
          R.entities.push(cur);
          return;
        }
        var it = prdItem(l);
        if (!it) return;
        if (!cur || (/^\*\*/.test(l.replace(/^\s*[-*+]\s+/, '')) && /,/.test(it.desc))) {
          cur = { name: it.name, cols: [] };
          R.entities.push(cur);
          it.desc.split(',').forEach(function (c) {
            c = c.trim();
            if (!c) return;
            var mm = /^([^(:]+)(?:[:(]\s*([^)]*)\)?)?/.exec(c);
            cur.cols.push({
              name: mm[1].trim(),
              type: (mm[2] || '').replace(/\b(PK|FK)\b.*$/i, '').trim(),
              pk: /\bPK\b/i.test(c),
              fk: (/FK\s*(?:→|->)\s*([^),]+)/i.exec(c) || [])[1],
            });
          });
          cur = null;
          return;
        }
        var nm = it.name,
          ty = it.desc || it.paren || '';
        if (!it.desc && /:/.test(nm)) {
          var q = nm.split(':');
          nm = q[0].trim();
          ty = q.slice(1).join(':').trim();
        }
        cur.cols.push({
          name: nm,
          type: ty.replace(/\*\*|`/g, '').trim(),
          pk: !!it.tags.pk,
          fk: it.tags.fk ? it.tags.fk[0].replace(/^(→|->)\s*/, '').trim() : null,
        });
      });
    }
    if (k === 'flows') {
      var f = null;
      L.forEach(function (l) {
        var h = /^###\s+(.*)$/.exec(l);
        if (h) {
          f = { name: h[1].replace(/\*\*|`/g, '').trim(), steps: [] };
          R.flows.push(f);
          return;
        }
        var m = /^\s*(?:\d+[.)]|[-*+])\s+(.*)$/.exec(l);
        if (!m) return;
        if (!f) {
          f = { name: 'Alur utama', steps: [] };
          R.flows.push(f);
        }
        var t = m[1].replace(/\*\*|`/g, '').trim(),
          a = /^([^:]{1,40}):\s*(.+)$/.exec(t);
        f.steps.push(a ? { actor: a[1].trim(), text: a[2].trim() } : { actor: '', text: t });
      });
    }
    if (k === 'screens')
      L.forEach(function (l) {
        var it = prdItem(l);
        if (it && it.name)
          R.screens.push({
            name: it.name,
            els: it.desc
              ? it.desc
                  .split(/,|;/)
                  .map(function (e) {
                    return e.trim();
                  })
                  .filter(Boolean)
              : [],
          });
      });
    if (k === 'auto')
      L.forEach(function (l) {
        var m = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/.exec(l);
        if (!m) return;
        var st = m[1]
          .replace(/\*\*|`/g, '')
          .split(/\s*(?:→|->|=>|›)\s*/)
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean);
        if (st.length) R.auto.push(st);
      });
    if (k === 'arch')
      L.forEach(function (l) {
        var m = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/.exec(l);
        if (!m) return;
        var t = m[1].replace(/\*\*|`/g, '').trim(),
          lab = '',
          cm = /^(.*?(?:→|->|=>).*?):\s*(.+)$/.exec(t);
        if (cm) {
          t = cm[1];
          lab = cm[2].trim();
        }
        var st = t
          .split(/\s*(?:→|->|=>|›)\s*/)
          .map(function (x) {
            return x.trim();
          })
          .filter(Boolean);
        if (st.length) R.arch.push({ chain: st, label: lab });
      });
    if (k === 'design')
      L.forEach(function (l) {
        var it = prdItem(l);
        if (!it) return;
        var v = (it.desc || '').trim(),
          hex = /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/i.exec(v + ' ' + it.name);
        if (hex)
          R.design.colors.push({
            name: it.name.replace(/#[0-9a-f]{3,6}/i, '').trim() || 'Warna',
            hex:
              hex[0].length === 4
                ? '#' +
                  hex[0]
                    .slice(1)
                    .split('')
                    .map(function (c) {
                      return c + c;
                    })
                    .join('')
                : hex[0].toLowerCase(),
          });
        else if (/^(font|huruf|tipografi|typeface)/i.test(it.name)) R.design.font = v;
        else if (/^platform/i.test(it.name)) R.design.platform = v;
        else R.design.notes.push((it.name ? it.name + ': ' : '') + v);
      });
    if (k === 'dict')
      L.forEach(function (l) {
        var it = prdItem(l);
        if (!it || !it.name) return;
        var al = /alias\s*:\s*(.*)/i.exec(it.paren || '');
        R.dict.push({
          name: it.name,
          alias: al
            ? al[1]
                .split(',')
                .map(function (a) {
                  return a.trim();
                })
                .filter(Boolean)
            : [],
          desc: it.desc,
        });
      });
  });
  return R;
}
export var PRD_TPL0 =
  '# Aplikasi Booking Studio Musik\n\n## Ringkasan\nPelanggan memesan studio dan membayar online, admin mengelola jadwal, owner memantau pendapatan.\n\n## Tujuan\n- Tidak ada lagi double booking\n- Semua pembayaran tercatat otomatis\n\n' +
  '## Aktor\n- **Pelanggan**: memesan studio dan membayar.\n- **Admin**: mengelola jadwal dan konfirmasi.\n- **Owner**: memantau laporan pendapatan.\n\n' +
  '## Fitur\n- **Booking studio** (Pelanggan): pilih studio, tanggal, dan jam. [include: Login]\n- **Bayar booking** (Pelanggan): bayar lewat QRIS. [include: Login]\n- **Kirim bukti transfer** (Pelanggan): unggah bukti bila transfer manual. [extend: Bayar booking]\n- **Kelola jadwal** (Admin): buka dan tutup slot. [include: Login]\n- **Lihat laporan** (Owner): pendapatan harian dan bulanan. [include: Login]\n- **Login**: masuk dengan nomor HP.\n\n' +
  '## Entitas Data\n### Pelanggan\n- id: int [PK]\n- nama: varchar(80)\n- no_hp: varchar(20)\n### Studio\n- id: int [PK]\n- nama: varchar(40)\n- tarif_per_jam: int\n### Booking\n- id: int [PK]\n- pelanggan_id: int [FK → Pelanggan]\n- studio_id: int [FK → Studio]\n- mulai: timestamp\n- durasi_jam: int\n- status: varchar(20)\n### Pembayaran\n- id: int [PK]\n- booking_id: int [FK → Booking]\n- metode: varchar(20)\n- jumlah: int\n\n' +
  '## Alur\n### Booking studio\n1. Pelanggan: Pilih studio dan jam\n2. Sistem: Cek ketersediaan slot\n3. Pelanggan: Bayar lewat QRIS\n4. Sistem: Kirim konfirmasi WhatsApp\n5. Admin: Siapkan studio\n\n' +
  '## Layar\n- **Beranda**: daftar studio, tombol Booking, menu bawah\n- **Pilih jadwal**: kalender, daftar jam, tombol Lanjut\n- **Pembayaran**: ringkasan booking, gambar QRIS, tombol Saya sudah bayar\n- **Booking berhasil**: teks konfirmasi, tombol Kembali ke beranda\n\n' +
  '## Otomasi\n- Booking dibuat → Kirim WhatsApp konfirmasi → Simpan ke Google Sheets\n- Setiap hari jam 22:00 → Rekap pendapatan → Kirim email ke Owner\n\n' +
  '## Desain\n- Primer: #0e6169\n- Aksen: #f5c26b\n- Teks: #1b2230\n- Latar: #f5f7f7\n- Font: Geist\n- Gaya: minimal, sudut membulat 10px, banyak ruang kosong\n\n' +
  '## Kamus\n- **Booking** (alias: pemesanan, reservasi): satu pesanan studio untuk rentang jam tertentu.\n- **Slot**: satu jam yang bisa dipesan.\n';
export var PRD_TPL0_EN =
  '# Music Studio Booking App\n\n## Summary\nCustomers book a studio and pay online, admins manage the schedule, the owner tracks revenue.\n\n## Goals\n- No more double bookings\n- Every payment recorded automatically\n\n' +
  '## Actors\n- **Customer**: books a studio and pays.\n- **Admin**: manages the schedule and confirmations.\n- **Owner**: tracks revenue reports.\n\n' +
  '## Features\n- **Book studio** (Customer): choose a studio, date and time. [include: Login]\n- **Pay booking** (Customer): pay with QRIS. [include: Login]\n- **Upload transfer proof** (Customer): upload proof for a manual transfer. [extend: Pay booking]\n- **Manage schedule** (Admin): open and close slots. [include: Login]\n- **View reports** (Owner): daily and monthly revenue. [include: Login]\n- **Login**: sign in with a phone number.\n\n' +
  '## Data Entities\n### Customer\n- id: int [PK]\n- name: varchar(80)\n- phone: varchar(20)\n### Studio\n- id: int [PK]\n- name: varchar(40)\n- hourly_rate: int\n### Booking\n- id: int [PK]\n- customer_id: int [FK → Customer]\n- studio_id: int [FK → Studio]\n- starts_at: timestamp\n- hours: int\n- status: varchar(20)\n### Payment\n- id: int [PK]\n- booking_id: int [FK → Booking]\n- method: varchar(20)\n- amount: int\n\n' +
  '## Flows\n### Book studio\n1. Customer: Choose studio and time\n2. System: Check slot availability\n3. Customer: Pay with QRIS\n4. System: Send WhatsApp confirmation\n5. Admin: Prepare the studio\n\n' +
  '## Screens\n- **Home**: studio list, Book button, bottom menu\n- **Choose time**: calendar, time list, Next button\n- **Payment**: booking summary, QRIS image, I have paid button\n- **Booking confirmed**: confirmation text, Back to home button\n\n' +
  '## Automation\n- Booking created → Send WhatsApp confirmation → Save to Google Sheets\n- Every day at 22:00 → Revenue summary → Email the Owner\n\n' +
  '## Design\n- Primary: #0e6169\n- Accent: #f5c26b\n- Text: #1b2230\n- Background: #f5f7f7\n- Font: Geist\n- Style: minimal, 10px rounded corners, plenty of white space\n\n' +
  '## Glossary\n- **Booking** (alias: reservation): one studio order for a time range.\n- **Slot**: one bookable hour.\n';
export var PRD_HEAD_EN = {
  actors: 'Actors',
  features: 'Features',
  entities: 'Data Entities',
  flows: 'Flows',
  screens: 'Screens',
  auto: 'Automation',
  arch: 'Architecture',
  design: 'Design',
  dict: 'Glossary',
};
export var PRD_TPL: string;

export function pjAdoptTitle(t) {
  if (t && /^(untitled|tanpa judul|proyek baru)/i.test(DOC.title || 'Untitled')) {
    DOC.title = String(t).slice(0, 120);
    $('docTitle').value = DOC.title;
  }
}
export var pjStartNew0: (dt: any) => void;
// ---------- PRD → canvases ----------
export function pjInto(dt, fn) {
  var keep = S;
  set_S({ nodes: [], edges: [], seq: 1, dt: dt });
  try {
    fn();
  } catch (e) {
    if (window.console) console.error(e);
  }
  S.dt = dt;
  S.nodes.forEach(autosize);
  var out = S;
  set_S(keep);
  return out;
}
export function pjOopType(t) {
  var x = String(t || '')
    .toLowerCase()
    .replace(/\(.*\)/, '')
    .trim();
  if (/^(var)?char|text|string|uuid|enum/.test(x)) return 'String';
  if (/^(big|small|tiny)?int|integer|serial/.test(x)) return 'int';
  if (/decimal|numeric|float|double|real|money/.test(x)) return 'double';
  if (/bool/.test(x)) return 'boolean';
  if (/timestamp|datetime/.test(x)) return 'DateTime';
  if (/^date$/.test(x)) return 'Date';
  if (/^time$/.test(x)) return 'Time';
  if (/json/.test(x)) return 'Map';
  return String(t)
    .replace(/\(.*\)/, '')
    .trim();
}
// long chains (45 linked tables, 25 screens) would become one endless row: wrap layout columns into rows
export function pjReflow(made, K) {
  if (!made || made.length < 8) return;
  var xs = [];
  made.forEach(function (n) {
    if (
      !xs.some(function (x) {
        return Math.abs(x - n.x) < 24;
      })
    )
      xs.push(n.x);
  });
  xs.sort(function (a, b) {
    return a - b;
  });
  if (xs.length <= K) return;
  var b = bounds(made, []),
    rowH = b.h + 110,
    ci = function (n) {
      var best = 0;
      xs.forEach(function (x, i) {
        if (Math.abs(x - n.x) < Math.abs(xs[best] - n.x)) best = i;
      });
      return best;
    };
  made.forEach(function (n) {
    var c = ci(n),
      r = Math.floor(c / K);
    n.x = snap(n.x - xs[r * K] + xs[0]);
    n.y = snap(n.y + r * rowH);
  });
}
export function pjSlug(s) {
  return '/' + pjNorm(s).replace(/ /g, '-');
}
export var PRD_BUILD = {
  usecase: function (R) {
    if (!R.features.length && !R.actors.length) return null;
    return function () {
      // up to 18 use cases: one boundary. Bigger systems: one boundary per primary actor, side by side, so nothing becomes a 5000px column
      var groups = [],
        gi = {};
      if (R.features.length <= 18) groups.push({ name: R.title || 'Sistem', fs: R.features.slice() });
      else
        R.features.forEach(function (f) {
          var a = f.actors[0] || 'Umum';
          if (gi[a] == null) {
            gi[a] = groups.length;
            groups.push({ name: (R.title || 'Sistem') + ' · ' + a, fs: [] });
          }
          groups[gi[a]].fs.push(f);
        });
      var ox = 60,
        oy = 80,
        rowB = 0,
        before = 0;
      groups.forEach(function (G, gx) {
        before = S.nodes.length;
        var key = {},
          nodes = [],
          edges = [],
          acts = gx === 0 && groups.length === 1 ? R.actors.slice() : [],
          fs = G.fs.slice(),
          fk = function (n) {
            return pjNorm(n);
          };
        fs.forEach(function (f) {
          f.inc.concat(f.ext).forEach(function (x) {
            if (
              !fs.some(function (o) {
                return fk(o.name) === fk(x);
              })
            ) {
              var t = R.features.filter(function (o) {
                return fk(o.name) === fk(x);
              })[0];
              if (t) fs.push({ name: t.name, actors: [], inc: [], ext: [] });
            }
          });
        });
        fs.forEach(function (f) {
          f.actors.forEach(function (a) {
            if (
              !acts.some(function (x) {
                return pjNorm(x.name) === pjNorm(a);
              })
            )
              acts.push({ name: a });
          });
        });
        acts.forEach(function (a, i) {
          key['a' + pjNorm(a.name)] = 'a' + i;
          nodes.push(['a' + i, 'u-actor', a.name]);
        });
        fs.forEach(function (f, i) {
          key['f' + fk(f.name)] = 'f' + i;
          nodes.push(['f' + i, 'u-usecase', f.name]);
        });
        fs.forEach(function (f, i) {
          f.actors.forEach(function (a) {
            var k = key['a' + pjNorm(a)];
            if (k) edges.push([k, 'f' + i, 'uassoc']);
          });
          f.inc.forEach(function (x) {
            var k = key['f' + fk(x)];
            if (k) edges.push(['f' + i, k, 'uinc']);
          });
          f.ext.forEach(function (x) {
            var k = key['f' + fk(x)];
            if (k) edges.push(['f' + i, k, 'uext']);
          });
        });
        buildGraph(
          {
            dir: 'LR',
            nodes: nodes,
            edges: edges,
            zones: [
              [
                'sys',
                'b-boundary',
                G.name,
                fs.map(function (f, i) {
                  return 'f' + i;
                }),
              ],
            ],
          },
          ox,
          oy,
        );
        var b = bounds(S.nodes.slice(before), []);
        rowB = Math.max(rowB, b.y + b.h);
        ox = b.x + b.w + 160;
        if (gx % 4 === 3) {
          ox = 60;
          oy = snap(rowB + 140);
          rowB = 0;
        }
      });
    };
  },
  erd: function (R) {
    if (!R.entities.length) return null;
    return function () {
      var nodes = [],
        edges = [],
        key = {};
      R.entities.forEach(function (e, i) {
        key[pjNorm(e.name)] = 't' + i;
      });
      R.entities.forEach(function (e, i) {
        nodes.push([
          't' + i,
          'er-table',
          e.name,
          {
            body: e.cols
              .map(function (c) {
                return (c.pk ? 'PK ' : c.fk ? 'FK ' : '') + c.name + (c.type ? ': ' + c.type : '');
              })
              .join('\n'),
          },
        ]);
        e.cols.forEach(function (c) {
          if (c.fk) {
            var k = key[pjNorm(c.fk)];
            if (k) edges.push([k, 't' + i, 'cf', '', { c1: 'only', c2: 'zmany' }]);
          }
        });
      });
      pjReflow(buildGraph({ dir: 'LR', nodes: nodes, edges: edges }, 60, 80), 6);
    };
  },
  class: function (R) {
    if (!R.entities.length) return null;
    return function () {
      var nodes = [],
        edges = [],
        key = {};
      R.entities.forEach(function (e, i) {
        key[pjNorm(e.name)] = 'c' + i;
      });
      R.entities.forEach(function (e, i) {
        nodes.push([
          'c' + i,
          'u-class',
          e.name,
          {
            attrs: e.cols
              .filter(function (c) {
                return !c.fk;
              })
              .map(function (c) {
                return '- ' + c.name + (c.type ? ': ' + pjOopType(c.type) : '');
              })
              .join('\n'),
            ops: '',
          },
        ]);
        e.cols.forEach(function (c) {
          if (c.fk) {
            var k = key[pjNorm(c.fk)];
            if (k) edges.push([k, 'c' + i, 'uassoc', '1 .. *']);
          }
        });
      });
      pjReflow(buildGraph({ dir: 'LR', nodes: nodes, edges: edges }, 60, 80), 6);
    };
  },
  bpmn: function (R) {
    if (!R.flows.length) return null;
    return function () {
      var y = 40;
      R.flows.forEach(function (f) {
        if (!f.steps.length) return;
        var actors = [];
        f.steps.forEach(function (s) {
          var a = s.actor || 'Sistem';
          if (actors.indexOf(a) < 0) actors.push(a);
        });
        var LHh = 130,
          W = Math.max(720, 54 + 90 + f.steps.length * 170 + 90),
          pool: Record<string, any> = addNode('pool', 0, 0);
        pool.label = f.name;
        pool.x = 40;
        pool.y = y;
        pool.w = W;
        pool.lanes = actors.map(function (a) {
          return { name: a, h: LHh };
        });
        syncPool(pool);
        var ly = function (a) {
            return y + actors.indexOf(a || 'Sistem') * LHh + LHh / 2;
          },
          x = 40 + 54 + 30;
        var st = addNode('start', 0, 0);
        st.x = x;
        st.y = snap(ly(f.steps[0].actor) - 18);
        st.label = '';
        var prev = st;
        x += 80;
        f.steps.forEach(function (s) {
          var t = addNode('task', 0, 0);
          t.label = s.text;
          t.w = 130;
          t.h = 64;
          t.x = x;
          t.y = snap(ly(s.actor) - 32);
          addEdge(prev.id, t.id, 'seq');
          prev = t;
          x += 170;
        });
        var en = addNode('end', 0, 0);
        en.x = x;
        en.y = snap(ly(f.steps[f.steps.length - 1].actor) - 18);
        en.label = '';
        addEdge(prev.id, en.id, 'seq');
        y += pool.h + 60;
      });
    };
  },
  activity: function (R) {
    if (!R.flows.length) return null;
    return function () {
      var ox = 60;
      R.flows.forEach(function (f) {
        if (!f.steps.length) return;
        var nodes = [['s', 'u-act-initial']],
          edges = [];
        f.steps.forEach(function (s, i) {
          nodes.push(['a' + i, 'u-act-action', s.text]);
          edges.push([i ? 'a' + (i - 1) : 's', 'a' + i, 'uflow']);
        });
        nodes.push(['e', 'u-act-final']);
        edges.push(['a' + (f.steps.length - 1), 'e', 'uflow']);
        var made = buildGraph({ dir: 'TB', nodes: nodes, edges: edges }, ox, 110),
          b = bounds(made, []);
        var t: Record<string, any> = addNode('text-h', 0, 0);
        t.label = f.name;
        t.fs = 18;
        t.bold = 1;
        t.w = Math.max(200, b.w + 40);
        t.h = 34;
        t.x = snap(b.x + b.w / 2 - t.w / 2);
        t.y = 40;
        ox = b.x + b.w + 140;
      });
    };
  },
  userflow: function (R) {
    if (!R.screens.length) return null;
    return function () {
      var nodes = [['s', 'fc-terminal', 'Mulai']],
        edges = [];
      R.screens.forEach(function (s, i) {
        nodes.push(['p' + i, 'ux-screen', s.name]);
        edges.push([i ? 'p' + (i - 1) : 's', 'p' + i, 'sync']);
      });
      nodes.push(['e', 'fc-terminal', 'Selesai']);
      edges.push(['p' + (R.screens.length - 1), 'e', 'sync']);
      pjReflow(buildGraph({ dir: 'LR', nodes: nodes, edges: edges }, 60, 80), 7);
    };
  },
  sitemap: function (R) {
    if (!R.screens.length) return null;
    return function () {
      var root = R.screens[0],
        txt =
          root.name +
          ' | ' +
          (pjSlug(root.name) === '/beranda' || pjSlug(root.name) === '/home' ? '/' : pjSlug(root.name));
      R.screens.slice(1).forEach(function (s) {
        txt += '\n  ' + s.name + ' | ' + pjSlug(s.name);
      });
      buildTree(txt, 'page', 60, 60);
    };
  },
  wire: function (R) {
    if (!R.screens.length) return null;
    return function () {
      var web = /\b(web|desktop|browser|dashboard)\b/i.test(R.design.notes.join(' ') + ' ' + (R.design.platform || '')),
        FW = web ? 1000 : 360,
        FH = web ? 680 : 740,
        GX = web ? 1080 : 440,
        GY = web ? 760 : 860,
        PER = web ? 3 : 6,
        CW = web ? 600 : 320;
      R.screens.forEach(function (sc, i) {
        var X = 40 + (i % PER) * GX,
          Y = 60 + Math.floor(i / PER) * GY,
          ph = addNode(web ? 'b-browser' : 'b-phone', 0, 0);
        ph.x = X;
        ph.y = Y;
        ph.w = FW;
        ph.h = FH;
        ph.label = web ? pjSlug(sc.name).replace(/\/(beranda|home)$/, '/') : sc.name;
        var put = function (t, x, y, w, h, lab, ex?) {
          var n = addNode(t, 0, 0);
          n.x = X + x;
          n.y = Y + y;
          n.w = Math.min(w, CW + (web && t === 'wf-nav' ? FW : 0));
          n.h = h;
          if (lab != null) n.label = lab;
          if (ex) for (var k in ex) n[k] = ex[k];
          return n;
        };
        put('wf-nav', 0, web ? 40 : 44, FW, 56, R.title || 'App');
        put('wf-heading', 20, web ? 112 : 116, web ? 600 : 320, 34, sc.name);
        var y = web ? 160 : 164,
          bottom = null,
          MAXY = web ? FH - 60 : 600;
        sc.els.forEach(function (el) {
          var e = el.toLowerCase(),
            lab = el.replace(/^(tombol|button|teks|text|input|kolom|daftar|list|kartu|card|gambar|foto|image)\s+/i, '');
          if (/menu bawah|tab ?bar|navigasi bawah|bottom nav/.test(e)) {
            bottom = 1;
            return;
          }
          if (y > MAXY) return;
          if (/tombol|button|cta/.test(e)) {
            put('wf-button', 20, y, web ? 220 : 320, 48, lab);
            y += 60;
          } else if (/cari|search/.test(e)) {
            put('wf-search', 20, y, CW, 40, 'Cari');
            y += 52;
          } else if (/input|kolom|isian|form|email|password|nomor|nama/.test(e)) {
            put('wf-input', 20, y, CW, 44, lab);
            y += 56;
          } else if (/gambar|foto|image|banner|qris|qr/.test(e)) {
            put('wf-image', 20, y, CW, 140, '');
            y += 152;
          } else if (/daftar|list|riwayat|tabel/.test(e)) {
            put('wf-list', 20, y, CW, 150, '', { rows: 3 });
            y += 162;
          } else if (/kalender|kartu|card|ringkasan|detail|editor/.test(e)) {
            put('wf-card', 20, y, CW, 130, lab);
            y += 142;
          } else if (/filter|kategori|chip|tag/.test(e)) {
            put('wf-chip', 20, y, 100, 32, lab);
            y += 44;
          } else if (/setuju|centang|checkbox/.test(e)) {
            put('wf-checkbox', 20, y, CW, 24, lab);
            y += 36;
          } else if (/toggle|switch|aktifkan/.test(e)) {
            put('wf-toggle', 20, y, CW, 28, lab);
            y += 40;
          } else if (/avatar|profil|foto profil/.test(e)) {
            put('wf-avatar', 20, y, 56, 56, '');
            y += 68;
          } else {
            put('wf-text', 20, y, CW, 48, el);
            y += 58;
          }
        });
        if (bottom && !web) put('wf-tabbar', 12, 656, 336, 64, '');
      });
    };
  },
  sysdesign: function (R) {
    if (!R.arch.length) return null;
    return function () {
      var ids = {},
        nodes = [],
        edges = [],
        key = function (nm) {
          var b = nm.replace(/\s*\(([^)]*)\)\s*$/, '').trim(),
            k = pjNorm(b);
          if (!ids[k]) {
            var sub = (/\(([^)]*)\)\s*$/.exec(nm) || [])[1];
            ids[k] = 'a' + nodes.length;
            nodes.push([ids[k], pjArchType(nm), b, sub ? { sub: sub } : undefined]);
          }
          return ids[k];
        };
      R.arch.forEach(function (r) {
        for (var i = 1; i < r.chain.length; i++) {
          var a = key(r.chain[i - 1]),
            b = key(r.chain[i]),
            lab = i === r.chain.length - 1 ? r.label : '';
          edges.push([a, b, /queue|antrian|kafka|event|async|worker|notif/i.test(r.chain[i]) ? 'async' : 'sync', lab]);
        }
        if (r.chain.length === 1) key(r.chain[0]);
      });
      buildGraph(
        {
          dir: 'LR',
          nodes: nodes.map(function (x) {
            return x[3] ? x : x.slice(0, 3);
          }),
          edges: edges,
        },
        60,
        80,
      );
    };
  },
  n8n: function (R) {
    if (!R.auto.length) return null;
    return function () {
      var oy = 80;
      R.auto.forEach(function (ch) {
        var nodes = [],
          edges = [];
        ch.forEach(function (st, i) {
          nodes.push(['n' + i, pjAutoType(st, i), st]);
          if (i) edges.push(['n' + (i - 1), 'n' + i, 'sync']);
        });
        var made = buildGraph({ dir: 'LR', nodes: nodes, edges: edges }, 60, oy),
          b = bounds(made, []);
        oy = b.y + b.h + 120;
      });
    };
  },
  gds: function (R) {
    if (!R.design.colors.length && !R.design.font && !R.design.notes.length) return null;
    return function () {
      var D = R.design,
        cols = D.colors.length
          ? D.colors
          : [
              { name: 'Primer', hex: '#0e6169' },
              { name: 'Teks', hex: '#1b2230' },
              { name: 'Latar', hex: '#f5f7f7' },
            ],
        pri = cols[0].hex,
        font = D.font || 'Geist';
      var T0: Record<string, any> = addNode('text-h', 0, 0);
      T0.label = (R.title || 'Produk') + ' · Grand Design';
      T0.fs = 30;
      T0.bold = 1;
      T0.align = 'left';
      T0.x = 40;
      T0.y = 30;
      T0.w = 720;
      T0.h = 48;
      var h = function (t, y) {
        var n: Record<string, any> = addNode('text-h', 0, 0);
        n.label = t;
        n.fs = 16;
        n.bold = 1;
        n.align = 'left';
        n.x = 40;
        n.y = y;
        n.w = 400;
        n.h = 30;
        return n;
      };
      h('Warna', 110);
      cols.forEach(function (c, i) {
        var s: Record<string, any> = addNode('sh-rrect', 0, 0);
        s.x = 40 + i * 170;
        s.y = 150;
        s.w = 150;
        s.h = 96;
        s.fill = c.hex;
        s.uc = 1;
        s.bw = 0;
        s.label = c.name + '\n' + c.hex;
        s.textColor = onColor(c.hex);
        s.role = 'swatch';
        if (onColor(c.hex) !== '#ffffff') {
          s.bw = 1;
          s.stroke = '#c3cbce';
        }
      });
      h('Tipografi · ' + font, 290);
      [
        [34, 'Judul halaman'],
        [22, 'Subjudul bagian'],
        [16, 'Teks isi untuk paragraf dan deskripsi.'],
        [13, 'Keterangan kecil · label · metadata'],
      ].forEach(function (t: any, i) {
        var n: Record<string, any> = addNode('text', 0, 0);
        n.label = t[1];
        n.fs = t[0];
        n.align = 'left';
        n.bold = i < 2 ? 1 : 0;
        n.x = 40;
        n.y = 330 + [0, 56, 100, 136][i];
        n.w = 640;
        n.h = t[0] + 16;
      });
      h('Komponen', 510);
      var b: Record<string, any> = addNode('sh-rrect', 0, 0);
      b.x = 40;
      b.y = 550;
      b.w = 180;
      b.h = 48;
      b.fill = pri;
      b.uc = 1;
      b.bw = 0;
      b.label = 'Tombol utama';
      b.textColor = onColor(pri);
      b.bold = 1;
      var b2: Record<string, any> = addNode('sh-rrect', 0, 0);
      b2.x = 240;
      b2.y = 550;
      b2.w = 180;
      b2.h = 48;
      b2.stroke = pri;
      b2.uc = 1;
      b2.label = 'Tombol kedua';
      b2.textColor = pri;
      b2.bold = 1;
      var inp = addNode('wf-input', 0, 0);
      inp.x = 440;
      inp.y = 552;
      inp.w = 260;
      inp.h = 44;
      inp.label = 'Kolom isian';
      var cd = addNode('wf-card', 0, 0);
      cd.x = 40;
      cd.y = 620;
      cd.w = 320;
      cd.h = 150;
      cd.label = 'Kartu konten';
      var ch = addNode('wf-chip', 0, 0);
      ch.x = 380;
      ch.y = 620;
      ch.w = 110;
      ch.h = 32;
      ch.label = 'Filter';
      if (D.notes.length) {
        var nt = addNode('nt-yellow', 0, 0);
        nt.x = 760;
        nt.y = 330;
        nt.w = 300;
        nt.h = Math.max(120, 40 + D.notes.length * 36);
        nt.label = D.notes.join('\n');
      }
    };
  },
};
export function pjArchType(nm) {
  var s = nm.toLowerCase(),
    M: [RegExp, string][] = [
      [/load balanc|\blb\b|nginx|haproxy/, 'c-lb7'],
      [/\bcdn\b|cloudfront|cloudflare/, 'c-cdn'],
      [/\bdns\b/, 'c-dns'],
      [/gateway/, 'c-apigw'],
      [/rate limit/, 'c-ratelimit'],
      [/cache|redis|memcache/, 'c-dcache'],
      [/kafka|stream|kinesis/, 'c-stream'],
      [/queue|antrian|rabbit|sqs|pub\/?sub/, 'c-queue'],
      [/mongo|dynamo|nosql|cassandra/, 'c-nosql'],
      [/search|elastic|opensearch/, 'c-search'],
      [/s3|storage|bucket|blob|penyimpanan file/, 'c-storage'],
      [/database|\bdb\b|postgres|mysql|sql|replica/, 'c-sql'],
      [/worker|consumer|job/, 'c-worker'],
      [/cron|scheduler|batch|terjadwal/, 'c-batch'],
      [/auth|login|identity|keycloak|sso/, 'c-auth'],
      [/notif|whatsapp|email|sms|push/, 'c-notif'],
      [/payment|pembayaran|midtrans|stripe|xendit/, 'c-payment'],
      [/monitor|grafana|prometheus|observab/, 'c-monitor'],
      [/log/, 'c-logs'],
      [/mobile|android|ios|aplikasi hp/, 'c-mobile'],
      [/browser|web app|frontend|website/, 'c-web'],
      [/pengguna|pelanggan|user|klien|client|admin|pembeli/, 'c-users'],
    ];
  for (var i = 0; i < M.length; i++) if (M[i][0].test(s) && T[M[i][1]]) return M[i][1];
  return 'c-service';
}
export function pjAutoType(st, i) {
  var s = st.toLowerCase();
  if (i === 0) {
    if (/setiap|tiap|harian|jadwal|jam \d|cron|mingguan|bulanan/.test(s)) return 'c-t-schedule';
    if (/form/.test(s)) return 'c-t-form';
    if (/email masuk|email diterima/.test(s)) return 'c-t-email';
    if (/chat|pesan masuk/.test(s)) return 'c-t-chat';
    if (/webhook|api/.test(s)) return 'c-t-webhook';
    return 'c-t-app';
  }
  var map: [RegExp, string][] = [
    [/whatsapp|\bwa\b/, 'whatsapp'],
    [/telegram/, 'telegram'],
    [/slack/, 'slack'],
    [/gmail|email|surel/, 'email'],
    [/google sheets|spreadsheet|sheets/, 'sheets'],
    [/notion/, 'notion'],
    [/airtable/, 'airtable'],
    [/postgres|database|simpan ke db|\bdb\b/, 'postgres'],
    [/openai|gpt|llm|\bai\b|ringkas|klasifikasi|rangkum/, 'agent'],
  ];
  for (var j = 0; j < map.length; j++)
    if (map[j][0].test(s)) {
      var r = searchTypes(map[j][1]).filter(function (k) {
        return k.indexOf('c-') === 0;
      });
      if (r.length) return r[0];
    }
  if (/^(jika|kalau|if|cek apakah)/.test(s)) return 'c-l-if';
  if (/tunggu|delay|wait/.test(s)) return 'c-l-wait';
  if (/filter/.test(s)) return 'c-l-filter';
  if (/rekap|gabung|jumlahkan|total/.test(s)) return 'c-l-agg';
  if (/http|panggil api|request/.test(s)) return 'c-l-http';
  return 'c-l-set';
}
export var PRD_BACKUP = null;
export function prdBuild(mode) {
  commitEdit();
  var R = prdParse(PROJ.prd),
    plan = [];
  Object.keys(PRD_BUILD).forEach(function (dt) {
    var fn = PRD_BUILD[dt](R);
    if (fn) plan.push({ dt: dt, fn: fn });
  });
  var foot = $('prdMsg');
  if (!plan.length) {
    foot.innerHTML =
      '<div class="pv-note warn">' +
      ic('triangle-alert') +
      '<span>Belum ada bagian yang bisa dijadikan kanvas. Pakai judul bagian seperti <b>## Aktor</b>, <b>## Fitur</b>, <b>## Entitas Data</b>, <b>## Alur</b>, <b>## Layar</b>, <b>## Otomasi</b>, <b>## Desain</b>. Klik <b>Templat</b> untuk contoh, atau <b>Susun pakai AI</b> untuk merapikan PRD bebas.</span></div>';
    return;
  }
  var busy = plan.filter(function (p) {
    return pjFilled(p.dt);
  });
  if (busy.length && !mode) {
    foot.innerHTML =
      '<div class="pv-note">' +
      ic('info') +
      '<span>' +
      plan.length +
      ' halaman akan dibangun. Yang sudah berisi: <b>' +
      busy
        .map(function (p) {
          return esc(DT[p.dt].n);
        })
        .join(', ') +
      '</b>.</span><span class="grow"></span><button type="button" class="btn" data-prdgo="empty">Isi yang kosong saja</button><button type="button" class="btn pri" data-prdgo="all">Ganti semua</button></div>';
    return;
  }
  var cur = pjCur();
  PROJ.pages[cur] = S;
  PRD_BACKUP = { pages: JSON.stringify(PROJ.pages), dict: JSON.stringify(PROJ.dict), cur: cur };
  var built = [];
  plan.forEach(function (p) {
    if (mode === 'empty' && pjHas(PROJ.pages[p.dt])) return;
    var old = PROJ.pages[p.dt];
    var pg = pjInto(p.dt, p.fn);
    if (!pjHas(pg)) return;
    if (pjHas(old)) {
      var uu = PAGE_UNDO[p.dt] || (PAGE_UNDO[p.dt] = { u: [], r: [] });
      if (p.dt === cur) uu = { u: undo, r: redo };
      uu.u.push(JSON.stringify(old));
      uu.r.length = 0;
      if (p.dt !== cur) PAGE_UNDO[p.dt] = uu;
    }
    pg.style = old && old.style;
    PROJ.pages[p.dt] = pg;
    delete PAGE_CAM[p.dt];
    if (p.dt === cur) PJ_NEEDFIT = true;
    built.push(p.dt);
  });
  set_S(PROJ.pages[cur]);
  delete PROJ.pages[cur];
  S.dt = cur;
  set_selN([]);
  set_selE(null);
  var add = [];
  R.actors.forEach(function (a) {
    add.push({ name: a.name, kind: 'actor', desc: a.desc });
  });
  R.features.forEach(function (f) {
    add.push({ name: f.name, kind: 'feature', desc: f.desc });
  });
  R.entities.forEach(function (e) {
    add.push({ name: e.name, kind: 'entity' });
  });
  R.screens.forEach(function (s) {
    add.push({ name: s.name, kind: 'screen' });
  });
  R.dict.forEach(function (t) {
    add.push({ name: t.name, kind: 'term', alias: t.alias, desc: t.desc });
  });
  pjDictMerge(add, 'prd');
  pjAdoptTitle(R.title);
  renderAll();
  syncUndoBtns();
  pjMarks();
  scheduleSave();
  foot.innerHTML =
    '<div class="pv-note ok">' +
    ic('circle-check-big') +
    '<span>' +
    built.length +
    ' halaman dibangun dari PRD:</span>' +
    built
      .map(function (d) {
        return (
          '<button type="button" class="sbtn" data-pjgo="' +
          d +
          '|">' +
          ic(DT_ICON[d] || 'layout-grid') +
          esc(DT[d].n) +
          '</button>'
        );
      })
      .join('') +
    '<span class="grow"></span><button type="button" class="btn" data-prdgo="undo">' +
    ic('undo-2') +
    'Urungkan</button></div>';
  prdPreview();
  prdRenderMap();
  toast(built.length + ' halaman dibangun dari PRD. Kamus proyek ikut diperbarui.');
}
export function prdUndoBuild() {
  if (!PRD_BACKUP) return;
  var cur = pjCur();
  PROJ.pages = JSON.parse(PRD_BACKUP.pages);
  PROJ.dict = JSON.parse(PRD_BACKUP.dict);
  PJ_NEEDFIT = true;
  var c = PRD_BACKUP.cur;
  set_S(PROJ.pages[c] || { nodes: [], edges: [], seq: 1, dt: c });
  delete PROJ.pages[c];
  S.dt = c;
  if (c !== cur) {
    set_uiWs(DT[c].ws);
    syncDomain();
  }
  PRD_BACKUP = null;
  set_selN([]);
  set_selE(null);
  renderAll();
  pjMarks();
  scheduleSave();
  $('prdMsg').innerHTML =
    '<div class="pv-note">' +
    ic('undo-2') +
    '<span>Pembangunan dibatalkan. Halaman kembali seperti sebelumnya.</span></div>';
  prdRenderMap();
}

// ---------- canvases → PRD ----------
export function pjOrderChain(p, startIds) {
  var out = [],
    seen = {},
    next = function (id) {
      var e = p.edges.filter(function (e) {
        return e.from === id;
      })[0];
      return e ? e.to : null;
    };
  startIds.forEach(function (id) {
    var cur = id,
      guard = 0;
    while (cur && !seen[cur] && guard++ < 200) {
      seen[cur] = 1;
      out.push(cur);
      cur = next(cur);
    }
  });
  return out;
}
export function prdFromCanvas() {
  var P: Record<string, any> = pjPages(),
    R = {
      actors: [],
      features: [],
      entities: [],
      flows: [],
      screens: [],
      auto: [],
      arch: [],
      design: { colors: [], font: '', notes: [] },
      dict: [],
    },
    byIdIn = function (p, id) {
      for (var i = 0; i < p.nodes.length; i++) if (p.nodes[i].id === id) return p.nodes[i];
      return null;
    };
  var ix = pjDictIndex(),
    desc = function (n, k) {
      var t = pjFind(ix, pjNorm(n), k);
      return t ? t.desc : '';
    };
  var uc = P.usecase;
  if (pjHas(uc)) {
    uc.nodes
      .filter(function (n) {
        return n.t === 'u-actor';
      })
      .forEach(function (n) {
        R.actors.push({ name: pjLabel(n.label), desc: desc(n.label, 'actor') });
      });
    uc.nodes
      .filter(function (n) {
        return n.t === 'u-usecase';
      })
      .forEach(function (n) {
        var acts = uc.edges
          .filter(function (e) {
            return e.type === 'uassoc' && (e.to === n.id || e.from === n.id);
          })
          .map(function (e) {
            var o = byIdIn(uc, e.to === n.id ? e.from : e.to);
            return o && o.t === 'u-actor' ? pjLabel(o.label) : null;
          })
          .filter(Boolean);
        var inc = uc.edges
          .filter(function (e) {
            return e.type === 'uinc' && e.from === n.id;
          })
          .map(function (e) {
            var o = byIdIn(uc, e.to);
            return o ? pjLabel(o.label) : null;
          })
          .filter(Boolean);
        var ext = uc.edges
          .filter(function (e) {
            return e.type === 'uext' && e.from === n.id;
          })
          .map(function (e) {
            var o = byIdIn(uc, e.to);
            return o ? pjLabel(o.label) : null;
          })
          .filter(Boolean);
        R.features.push({ name: pjLabel(n.label), actors: acts, desc: desc(n.label, 'feature'), inc: inc, ext: ext });
      });
  }
  if (!R.actors.length && pjHas(P.bpmn))
    P.bpmn.nodes.forEach(function (n) {
      if (n.t === 'pool')
        (n.lanes && n.lanes.length
          ? n.lanes.map(function (l) {
              return l.name;
            })
          : [n.label]
        ).forEach(function (a) {
          a = pjLabel(a);
          if (
            a &&
            !PJ_SYSTEM[pjNorm(a)] &&
            !R.actors.some(function (x) {
              return x.name === a;
            })
          )
            R.actors.push({ name: a, desc: desc(a, 'actor') });
        });
    });
  PROJ.dict.forEach(function (t) {
    if (
      t.kind === 'actor' &&
      !R.actors.some(function (a) {
        return pjNorm(a.name) === pjNorm(t.name);
      })
    )
      R.actors.push({ name: t.name, desc: t.desc });
  });
  var erd = P.erd,
    cl = P['class'];
  if (pjHas(erd))
    erd.nodes
      .filter(function (n) {
        return n.t === 'er-table';
      })
      .forEach(function (n) {
        var fks = {};
        erd.edges.forEach(function (e) {
          if (e.type === 'cf' && e.to === n.id) {
            var o = byIdIn(erd, e.from);
            if (o) fks[pjNorm(pjLabel(o.label))] = pjLabel(o.label);
          }
        });
        R.entities.push({
          name: pjLabel(n.label),
          cols: parseCols(n.body).map(function (c) {
            var fk = null;
            if (/FK/.test(c.key)) {
              var base = pjNorm(c.name).replace(/ id$/, '');
              Object.keys(fks).forEach(function (k) {
                if (k === base || k.replace(/ /g, '') === base.replace(/ /g, '')) fk = fks[k];
              });
            }
            return { name: c.name, type: c.type, pk: /PK/.test(c.key), fk: fk || (/FK/.test(c.key) ? '?' : null) };
          }),
        });
      });
  else if (pjHas(cl))
    cl.nodes
      .filter(function (n) {
        return n.t === 'u-class';
      })
      .forEach(function (n) {
        R.entities.push({
          name: pjLabel(n.label),
          cols: String(n.attrs || '')
            .split('\n')
            .map(function (l) {
              var m = /^\s*[+\-#~]?\s*([^:]+?)\s*(?::\s*(.*))?$/.exec(l);
              return m && m[1].trim() ? { name: m[1].trim(), type: (m[2] || '').trim() } : null;
            })
            .filter(Boolean),
        });
      });
  var bp = P.bpmn,
    ac = P.activity;
  if (pjHas(bp))
    bp.nodes
      .filter(function (n) {
        return n.t === 'pool';
      })
      .forEach(function (pool) {
        var inP = function (n) {
          return (
            n.x + n.w / 2 >= pool.x &&
            n.x + n.w / 2 <= pool.x + pool.w &&
            n.y + n.h / 2 >= pool.y &&
            n.y + n.h / 2 <= pool.y + pool.h
          );
        };
        var laneOf = function (n) {
          var y = pool.y,
            cy = n.y + n.h / 2,
            L = pool.lanes || [];
          for (var i = 0; i < L.length; i++) {
            if (cy >= y && cy < y + L[i].h) return L[i].name;
            y += L[i].h;
          }
          return '';
        };
        var starts = bp.nodes
          .filter(function (n) {
            return inP(n) && fam(n) === 'ev' && T[n.t].k === 'start';
          })
          .map(function (n) {
            return n.id;
          });
        var chain = pjOrderChain(bp, starts)
          .map(function (id) {
            return byIdIn(bp, id);
          })
          .filter(function (n) {
            return n && fam(n) === 'task';
          });
        if (!chain.length)
          chain = bp.nodes
            .filter(function (n) {
              return inP(n) && fam(n) === 'task';
            })
            .sort(function (a, b) {
              return a.x - b.x;
            });
        if (chain.length)
          R.flows.push({
            name: pjLabel(pool.label) || 'Alur',
            steps: chain.map(function (n) {
              return { actor: pjLabel(laneOf(n)), text: pjLabel(n.label) };
            }),
          });
      });
  else if (pjHas(ac)) {
    var st = ac.nodes.filter(function (n) {
      return n.t === 'u-act-initial';
    });
    st.forEach(function (s, i) {
      var ch = pjOrderChain(ac, [s.id])
        .map(function (id) {
          return byIdIn(ac, id);
        })
        .filter(function (n) {
          return n && n.t === 'u-act-action';
        });
      if (ch.length)
        R.flows.push({
          name: 'Alur ' + (i + 1),
          steps: ch.map(function (n) {
            return { actor: '', text: pjLabel(n.label) };
          }),
        });
    });
  }
  var wf = P.wire,
    uf = P.userflow,
    sm = P.sitemap;
  var WFN = {
    'wf-button': 'tombol',
    'wf-input': 'kolom',
    'wf-search': 'pencarian',
    'wf-image': 'gambar',
    'wf-list': 'daftar',
    'wf-card': 'kartu',
    'wf-chip': 'filter',
    'wf-checkbox': 'centang',
    'wf-toggle': 'toggle',
    'wf-avatar': 'avatar',
    'wf-tabbar': 'menu bawah',
    'wf-text': 'teks',
  };
  if (pjHas(wf))
    wf.nodes
      .filter(function (n) {
        return n.t === 'b-phone' || n.t === 'b-browser';
      })
      .sort(function (a, b) {
        return a.x - b.x || a.y - b.y;
      })
      .forEach(function (fr) {
        var els = wf.nodes
          .filter(function (n) {
            var cx = n.x + n.w / 2,
              cy = n.y + n.h / 2;
            return WFN[n.t] && cx > fr.x && cx < fr.x + fr.w && cy > fr.y && cy < fr.y + fr.h;
          })
          .sort(function (a, b) {
            return a.y - b.y;
          })
          .map(function (n) {
            var l = pjLabel(n.label);
            return n.t === 'wf-text' && l ? l : WFN[n.t] + (l && n.t !== 'wf-tabbar' ? ' ' + l : '');
          });
        var nm = pjLabel(fr.label) || 'Layar';
        R.screens.push({ name: nm, els: els });
      });
  else if (pjHas(uf))
    uf.nodes
      .filter(function (n) {
        return n.t === 'ux-screen';
      })
      .forEach(function (n) {
        R.screens.push({ name: pjLabel(n.label), els: [] });
      });
  else if (pjHas(sm))
    sm.nodes
      .filter(function (n) {
        return n.t === 'tr-page';
      })
      .forEach(function (n) {
        R.screens.push({ name: pjLabel(n.label), els: [] });
      });
  var n8 = P.n8n;
  if (pjHas(n8)) {
    var comps = n8.nodes.filter(function (n) {
        return fam(n) === 'comp';
      }),
      starts = comps
        .filter(function (n) {
          return !n8.edges.some(function (e) {
            return e.to === n.id;
          });
        })
        .sort(function (a, b) {
          return a.y - b.y;
        });
    starts.forEach(function (s) {
      var ch = pjOrderChain(n8, [s.id])
        .map(function (id) {
          var n = byIdIn(n8, id);
          return n ? pjLabel(n.label) : '';
        })
        .filter(Boolean);
      if (ch.length) R.auto.push(ch);
    });
  }
  var gd = P.gds;
  if (pjHas(gd)) {
    gd.nodes.forEach(function (n) {
      if (n.role === 'swatch' && validColor(n.fill))
        R.design.colors.push({
          name:
            pjLabel(n.label)
              .replace(/#[0-9a-f]{3,6}/i, '')
              .trim() || 'Warna',
          hex: n.fill,
        });
    });
    var tt = gd.nodes.filter(function (n) {
      return /^Tipografi · /.test(n.label || '');
    })[0];
    if (tt) R.design.font = tt.label.replace(/^Tipografi · /, '');
  }
  PROJ.dict.forEach(function (t) {
    if (t.kind === 'term') R.dict.push({ name: t.name, alias: t.alias, desc: t.desc });
  });
  var sd = P.sysdesign;
  if (pjHas(sd)) {
    var nm = function (id) {
      var n = byIdIn(sd, id);
      return n && !isContT(n.t) ? pjLabel(n.label) : '';
    };
    sd.edges.forEach(function (e) {
      var a = nm(e.from),
        b = nm(e.to);
      if (a && b)
        R.arch.push({
          chain: [a, b],
          label: String(e.label || '')
            .replace(/\s+/g, ' ')
            .trim(),
        });
    });
  }
  return R;
}
export function prdSecBody(k, R) {
  var L = [];
  if (k === 'actors')
    R.actors.forEach(function (a) {
      L.push('- **' + a.name + '**' + (a.desc ? ': ' + a.desc : ''));
    });
  if (k === 'features')
    R.features.forEach(function (f) {
      L.push(
        '- **' +
          f.name +
          '**' +
          (f.actors.length ? ' (' + f.actors.join(', ') + ')' : '') +
          (f.desc ? ': ' + f.desc : '') +
          f.inc
            .map(function (x) {
              return ' [include: ' + x + ']';
            })
            .join('') +
          f.ext
            .map(function (x) {
              return ' [extend: ' + x + ']';
            })
            .join(''),
      );
    });
  if (k === 'entities')
    R.entities.forEach(function (e) {
      L.push('### ' + e.name);
      e.cols.forEach(function (c) {
        L.push(
          '- ' +
            c.name +
            (c.type ? ': ' + c.type : '') +
            (c.pk ? ' [PK]' : '') +
            (c.fk && c.fk !== '?' ? ' [FK → ' + c.fk + ']' : c.fk ? ' [FK]' : ''),
        );
      });
    });
  if (k === 'flows')
    R.flows.forEach(function (f) {
      L.push('### ' + f.name);
      f.steps.forEach(function (s, i) {
        L.push(i + 1 + '. ' + (s.actor ? s.actor + ': ' : '') + s.text);
      });
    });
  if (k === 'screens')
    R.screens.forEach(function (s) {
      L.push('- **' + s.name + '**' + (s.els.length ? ': ' + s.els.join(', ') : ''));
    });
  if (k === 'auto')
    R.auto.forEach(function (c) {
      L.push('- ' + c.join(' → '));
    });
  if (k === 'arch')
    (R.arch || []).forEach(function (c) {
      L.push('- ' + c.chain.join(' → ') + (c.label ? ': ' + c.label : ''));
    });
  if (k === 'design') {
    R.design.colors.forEach(function (c) {
      L.push('- ' + c.name + ': ' + c.hex);
    });
    if (R.design.font) L.push('- Font: ' + R.design.font);
    R.design.notes.forEach(function (n) {
      L.push('- ' + n);
    });
  }
  if (k === 'dict')
    R.dict.forEach(function (t) {
      L.push(
        '- **' +
          t.name +
          '**' +
          (t.alias && t.alias.length ? ' (alias: ' + t.alias.join(', ') + ')' : '') +
          (t.desc ? ': ' + t.desc : ''),
      );
    });
  return L;
}
export function prdMerge(md, R) {
  var sp = prdSplit(md),
    have = {},
    out = [];
  if (!String(md || '').trim()) {
    out.push(
      '# ' + (DOC.title || L('Product', 'Produk')),
      '',
      '## ' + L('Summary', 'Ringkasan'),
      L('_Write the product summary here._', '_Tulis ringkasan produk di sini._'),
      '',
    );
  }
  sp.secs.forEach(function (sec, i) {
    if (sec.key && !have[sec.key]) {
      var body = prdSecBody(sec.key, R);
      have[sec.key] = 1;
      if (body.length) {
        out.push(sec.lines[0]);
        out = out.concat(body);
        out.push('');
        return;
      }
    }
    out = out.concat(sec.lines);
  });
  PRD_ORDER.forEach(function (k) {
    if (have[k]) return;
    var body = prdSecBody(k, R);
    if (body.length) {
      if (out.length && out[out.length - 1] !== '') out.push('');
      out.push('## ' + PRD_HEAD[k]);
      out = out.concat(body);
      out.push('');
    }
  });
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '');
}

// ---------- tiny, safe Markdown preview ----------
export function mdInline(s) {
  s = esc(s);
  s = s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/(^|[\s(])_([^_\s][^_]*)_/g, '$1<em>$2</em>');
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  s = s.replace(/\[(include|extend|PK|FK|UK)(?::|\s)?\s*([^\]]*)\]/gi, function (m, k, v) {
    return '<span class="md-tag">' + k.toUpperCase() + (v ? ' ' + v : '') + '</span>';
  });
  return s;
}
export function mdRender(md) {
  var L = String(md || '')
      .replace(/\r/g, '')
      .split('\n'),
    h = '',
    i = 0,
    list = null;
  function close() {
    if (list) {
      h += '</' + list + '>';
      list = null;
    }
  }
  while (i < L.length) {
    var l = L[i];
    if (/^```/.test(l)) {
      close();
      var code = [];
      i++;
      while (i < L.length && !/^```/.test(L[i])) code.push(L[i++]);
      i++;
      h += '<pre><code>' + esc(code.join('\n')) + '</code></pre>';
      continue;
    }
    var hm = /^(#{1,4})\s+(.*)$/.exec(l);
    if (hm) {
      close();
      var lv = hm[1].length,
        key = lv === 2 ? prdSecKey(hm[2]) : null,
        chips =
          key && PRD_PAGES[key].length
            ? '<span class="md-map">' +
              PRD_PAGES[key]
                .map(function (d) {
                  var f = pjFilled(d);
                  return (
                    '<button type="button" class="' +
                    (f ? 'on' : '') +
                    '" data-pjgo="' +
                    d +
                    '|" title="' +
                    (f ? 'Buka ' : 'Belum dibangun · buka ') +
                    esc(DT[d].n) +
                    '">' +
                    ic(DT_ICON[d] || 'layout-grid') +
                    esc(DT[d].n) +
                    '</button>'
                  );
                })
                .join('') +
              '</span>'
            : '';
      h += '<h' + lv + (key ? ' class="md-sec"' : '') + '>' + mdInline(hm[2]) + chips + '</h' + lv + '>';
      i++;
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < L.length && /^\s*\|?\s*:?-{2,}/.test(L[i + 1])) {
      close();
      var cells = function (r) {
        return r
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map(function (c) {
            return c.trim();
          });
      };
      h +=
        '<table><thead><tr>' +
        cells(l)
          .map(function (c) {
            return '<th>' + mdInline(c) + '</th>';
          })
          .join('') +
        '</tr></thead><tbody>';
      i += 2;
      while (i < L.length && /^\s*\|/.test(L[i])) {
        h +=
          '<tr>' +
          cells(L[i])
            .map(function (c) {
              return '<td>' + mdInline(c) + '</td>';
            })
            .join('') +
          '</tr>';
        i++;
      }
      h += '</tbody></table>';
      continue;
    }
    var ul = /^\s*[-*+]\s+(.*)$/.exec(l),
      ol = /^\s*\d+[.)]\s+(.*)$/.exec(l);
    if (ul || ol) {
      var t = ul ? 'ul' : 'ol';
      if (list !== t) {
        close();
        h += '<' + t + '>';
        list = t;
      }
      var tx = (ul || ol)[1],
        hx = /#[0-9a-f]{6}\b/i.exec(tx);
      h += '<li>' + (hx ? '<i class="md-sw" style="background:' + hx[0] + '"></i>' : '') + mdInline(tx) + '</li>';
      i++;
      continue;
    }
    if (/^\s*>\s?/.test(l)) {
      close();
      h += '<blockquote>' + mdInline(l.replace(/^\s*>\s?/, '')) + '</blockquote>';
      i++;
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) {
      close();
      h += '<hr>';
      i++;
      continue;
    }
    if (!l.trim()) {
      close();
      i++;
      continue;
    }
    close();
    var para = [l];
    i++;
    while (i < L.length && L[i].trim() && !/^(#{1,4}\s|\s*[-*+]\s|\s*\d+[.)]\s|```|\s*>|\s*\|)/.test(L[i]))
      para.push(L[i++]);
    h += '<p>' + mdInline(para.join(' ')) + '</p>';
  }
  close();
  return (
    h ||
    '<p class="note">PRD masih kosong. Tulis di kiri, klik <b>Templat</b> untuk contoh lengkap, atau <b>Impor .md</b>.</p>'
  );
}

// ---------- PRD view wiring ----------
export var PRD_PREV = null;
export function prdOpen() {
  var ta = $('prdText');
  if (ta.value !== PROJ.prd) ta.value = PROJ.prd;
  prdPreview();
  prdRenderMap();
}
export function prdPreview() {
  $('prdPrev').innerHTML = mdRender(PROJ.prd);
}
export function prdRenderMap() {
  var R = prdParse(PROJ.prd),
    n = {
      actors: R.actors.length,
      features: R.features.length,
      entities: R.entities.length,
      flows: R.flows.length,
      screens: R.screens.length,
      auto: R.auto.length,
      design: R.design.colors.length + (R.design.font ? 1 : 0) + R.design.notes.length,
      dict: R.dict.length,
    };
  var words = PROJ.prd.trim() ? PROJ.prd.trim().split(/\s+/).length : 0;
  $('prdStat').textContent =
    words +
    ' kata · ' +
    PRD_ORDER.filter(function (k) {
      return n[k];
    }).length +
    '/8 bagian terstruktur';
  $('prdMap').innerHTML = PRD_ORDER.map(function (k) {
    return (
      '<span class="pv-chip' +
      (n[k] ? ' on' : '') +
      '" title="' +
      esc(PRD_HEAD[k]) +
      ' → ' +
      esc(
        PRD_PAGES[k]
          .map(function (d) {
            return DT[d].n;
          })
          .join(', ') || L('glossary', 'kamus'),
      ) +
      '"><b>' +
      n[k] +
      '</b>' +
      esc(PRD_HEAD[k]) +
      '</span>'
    );
  }).join('');
}
export function prdSet(v, keepPrev?) {
  if (!keepPrev) PRD_PREV = PROJ.prd;
  PROJ.prd = String(v).slice(0, 400000);
  var mt = /^#\s+(.+)$/m.exec(PROJ.prd);
  if (mt) pjAdoptTitle(mt[1].trim());
  $('prdText').value = PROJ.prd;
  prdPreview();
  prdRenderMap();
  scheduleSave();
}
export function prdAi() {
  if (!aiReady()) {
    toast('Hubungkan model AI dulu lewat tombol AI di atas');
    return;
  }
  var src = PROJ.prd.trim();
  if (!src) {
    toast('Tulis atau impor PRD dulu');
    return;
  }
  var prompt =
    'Susun ulang dokumen PRD berikut ke format templat PDA agar bisa diubah otomatis menjadi diagram. Aturan format:\n' +
    '- "# Nama produk" lalu bagian "## Ringkasan", "## Tujuan" (pertahankan teks bebas apa adanya), dan bila informasinya ada: "## Aktor", "## Fitur", "## Entitas Data", "## Alur", "## Layar", "## Arsitektur", "## Otomasi", "## Desain", "## Kamus". Bagian lain di dokumen asli tetap dipertahankan sebagai teks.\n' +
    '- Aktor: "- **Nama**: deskripsi". Fitur: "- **Nama fitur** (Aktor1, Aktor2): deskripsi [include: Fitur lain] [extend: Fitur dasar]".\n- Entitas Data: "### NamaEntitas" lalu "- kolom: tipe [PK]" atau "- kolom: tipe [FK → Entitas]".\n' +
    '- Alur: "### Nama alur" lalu "1. Aktor: langkah". Layar: "- **Nama layar**: elemen, elemen, tombol X". Arsitektur: "- Komponen → Komponen → Komponen: label protokol/angka" (satu baris satu jalur, nama komponen seperti Load balancer, Cache (Redis), Database (PostgreSQL), Queue). Otomasi: "- Pemicu → Aksi → Aksi". Desain: "- Nama warna: #hex", "- Font: nama", "- Gaya: ...". Kamus: "- **Istilah** (alias: a, b): arti".\n' +
    '- Gunakan nama yang KONSISTEN untuk hal yang sama di semua bagian. Jangan mengarang fitur, entitas, atau layar yang tidak tersirat di dokumen. Pertahankan bahasa asli dokumen.\n\nDokumen:\n' +
    src.slice(0, 30000) +
    '\n\nBalas HANYA JSON: {"markdown":"..."}';
  var b = $('prdAi');
  b.disabled = true;
  var lab = b.innerHTML;
  b.innerHTML = ic('sparkles') + 'Menyusun…';
  aiCap()
    .json(prompt, { cache: false })
    .then(
      function (d) {
        var md = d && typeof d.markdown === 'string' ? d.markdown : '';
        if (!md.trim()) throw new Error('AI tidak mengembalikan dokumen');
        prdSet(md);
        $('prdMsg').innerHTML =
          '<div class="pv-note ok">' +
          ic('circle-check-big') +
          '<span>PRD sudah dirapikan ke format templat. Periksa dulu, lalu klik <b>Bangun kanvas</b>.</span><span class="grow"></span><button type="button" class="btn" data-prdgo="revert">' +
          ic('undo-2') +
          'Kembalikan teks lama</button></div>';
      },
      function (e) {
        toast(String((e && e.message) || 'AI gagal menyusun PRD'));
      },
    )
    .then(function () {
      b.disabled = false;
      b.innerHTML = lab;
    });
}
export var pjEmpty0: () => void;
export var pjRenderAll0: () => void;

export function install(): void {
  // ================= project: one canvas per diagram type, shared PRD + glossary, cross-page integration =================
  // A project holds every page (one per diagram type, grouped by workspace), a PRD in Markdown and a shared glossary.
  // S is always the active page; the others wait in PROJ.pages.
  DT.gds = {
    ws: 'ux',
    n: 'Grand Design',
    pal: ['px-shapes', 'wire', 'notes', 'px-media'],
    hint: 'Papan gaya: warna, tipografi, komponen, dan prinsip visual. Bisa dibangun dari bagian “Desain” di PRD.',
  };
  DT_ICON.gds = 'brush';
  set_contentKey(function () {
    return JSON.stringify(pjCore()) + '|' + DOC.title;
  });
  set_payload(function () {
    var c = pjCore();
    return JSON.parse(
      JSON.stringify({
        title: DOC.title || 'Untitled diagram',
        updatedAt: DOC.updatedAt,
        v: 4,
        dt: c.cur,
        style: S.style || 'clean',
        nodes: [],
        edges: [],
        seq: 1,
        cur: c.cur,
        pages: c.pages,
        prd: c.prd,
        dict: c.dict,
        deck: c.deck,
        plan: c.plan,
      }),
    );
  });
  set_writeWorking(function () {
    lsSet(
      'rancang:current',
      JSON.stringify({
        id: DOC.id,
        title: DOC.title,
        updatedAt: DOC.updatedAt,
        example: DOC.example,
        P: pjCore(),
        S: { nodes: [], edges: [], seq: 1, dt: pjCur() },
      }),
    );
  });
  set_saveNow(function (force) {
    clearTimeout(saveT);
    var key = contentKey();
    if (key === lastKey && !(force && DOC.id)) return;
    if (DOC.example && key === lastKey) return;
    if (!DOC.id && !pjAny()) {
      set_lastKey(key);
      writeWorking();
      return;
    }
    set_changedSinceBoot(true);
    if (!DOC.id) DOC.id = newId();
    DOC.example = false;
    DOC.updatedAt = Date.now();
    set_lastKey(key);
    writeWorking();
    var p = payload(),
      size = JSON.stringify(p).length,
      st = store;
    if (st.kind === 'cloud' && size > 250000) {
      setSave('error', 'Terlalu besar untuk penyimpanan akun. Ekspor file .json.');
      return;
    }
    setSave('saving', 'Saving…');
    st.save(DOC.id, p).then(
      function () {
        if (contentKey() === key)
          setSave('ok', st.kind === 'cloud' ? 'Saved to your account' : 'Saved in this browser');
      },
      function (err) {
        set_lastKey(null);
        setSave(
          'error',
          st.kind === 'cloud'
            ? 'Not saved to your account (' + ((err && err.code) || 'error') + '). Kept in this browser.'
            : 'This browser blocked saving. Export a .json file.',
        );
      },
    );
  });
  pjLoad0 = loadDoc;
  set_loadDoc(function (d, id, opts) {
    d = d || {};
    var pages = {},
      cur;
    if (d.pages && typeof d.pages === 'object') {
      Object.keys(d.pages).forEach(function (k) {
        if (!DT[k]) return;
        var p = d.pages[k] || {},
          s = sanitize({ nodes: p.nodes, edges: p.edges, seq: p.seq, style: p.style, dt: k });
        pages[k] = { nodes: s.nodes, edges: s.edges, seq: s.seq, dt: k, style: s.style };
      });
      cur = DT[d.cur] && pages[d.cur] ? d.cur : Object.keys(pages)[0] || 'arch';
    }
    PROJ = {
      pages: {},
      prd: String(d.prd || '').slice(0, 400000),
      dict: pjSanDict(d.dict),
      deck: pjSanDeck(d.deck),
      plan: (Array.isArray(d.plan) ? d.plan : [])
        .filter(function (k) {
          return typeof k === 'string' && DT[k];
        })
        .slice(0, 30),
    };
    PAGE_UNDO = {};
    PAGE_CAM = {};
    PJ_LAST = {};
    if (cur) {
      var cp = pages[cur] || { nodes: [], edges: [], seq: 1 };
      delete pages[cur];
      PROJ.pages = pages;
      pjLoad0(
        {
          title: d.title,
          updatedAt: d.updatedAt,
          icons: d.icons,
          nodes: cp.nodes,
          edges: cp.edges,
          seq: cp.seq,
          style: cp.style,
          dt: cur,
        },
        id,
        opts,
      );
    } else pjLoad0(d, id, opts);
    S.dt = dtOf();
    PJ_LAST[DT[S.dt].ws] = S.dt;
    set_lastKey(contentKey());
    pjMarks();
    if (PJ_VIEW !== 'canvas') pjView(PJ_VIEW);
  });
  set_boot(function (hot) {
    hydrateIcons();
    var st = document.createElement('style');
    st.textContent =
      '@font-face{font-family:Virgil;src:url(' + SKETCH_FONT_URI + ') format("woff2");font-display:swap}';
    document.head.appendChild(st);
    loadLocalIcons();
    bindUI();
    applyTheme(true);
    var w = null;
    if (hot && hot.S && Array.isArray(hot.S.nodes)) w = hot;
    else {
      try {
        var x = JSON.parse(lsGet('rancang:current') || 'null');
        if (x && (x.P || (x.S && Array.isArray(x.S.nodes)))) w = x;
      } catch (e) {}
    }
    if (w && w.P)
      loadDoc(
        {
          title: w.title,
          updatedAt: w.updatedAt,
          cur: w.P.cur,
          pages: w.P.pages,
          prd: w.P.prd,
          dict: w.P.dict,
          deck: w.P.deck,
        },
        w.id,
        { example: w.example },
      );
    else if (w)
      loadDoc(
        {
          title: w.title,
          updatedAt: w.updatedAt,
          nodes: w.S.nodes,
          edges: w.S.edges,
          seq: w.S.seq,
          style: w.S.style,
          dt: w.S.dt,
        },
        w.id,
        { example: w.example },
      );
    else openExample('agents', true);
    if (hot && hot.cam && isFinite(hot.cam.z)) {
      set_cam({ x: +hot.cam.x || 0, y: +hot.cam.y || 0, z: clamp(+hot.cam.z, 0.1, 4) });
      applyCam();
      renderOver();
    }
    syncUndoBtns();
    initCaps();
    if (document.fonts && document.fonts.load)
      document.fonts.load('16px Virgil').then(
        function () {
          if (S.style === 'sketch') render();
        },
        function () {},
      );
  });
  pjUsedIcons0 = usedIcons;
  set_usedIcons(function () {
    var keep = S,
      out = {};
    var P = pjPages();
    Object.keys(P).forEach(function (k) {
      set_S(P[k]);
      var u = pjUsedIcons0();
      for (var i in u) out[i] = u[i];
    });
    set_S(keep);
    return out;
  });
  set_chooseType(function (dt) {
    pjSwitch(dt);
  });
  pjChips0 = renderChips;
  set_renderChips(function () {
    pjChips0();
    pjMarks();
  });
  pjTabs0 = renderWsTabs;
  set_renderWsTabs(function () {
    pjTabs0();
    pjMarks();
  });
  pjRenderP = render;
  set_render(function () {
    var had = pjMarksLast,
      now = pjFilled(pjCur());
    pjRenderP();
    if (had !== now) {
      pjMarksLast = now;
      pjMarks();
    }
  });
  pjInspNode0 = inspNode;
  set_inspNode(function (n) {
    var s = pjInspNode0(n),
      dt = pjCur(),
      k = n.t === 'pool' ? 'actor' : pjKindOf(n, dt);
    if (!k) return s;
    var name = pjLabel(n.label);
    if (!name) return s;
    var norm = pjNorm(name),
      ix = pjDictIndex(),
      t = pjFind(ix, norm, k);
    var key = t ? 'd:' + t.id : norm,
      M = pjMentions().filter(function (m) {
        var mt = pjFind(ix, m.norm, m.kind);
        return (mt ? 'd:' + mt.id : m.norm) === key && !(m.dt === dt && m.id === n.id);
      });
    var h = '<div class="sec"><div class="st">Terhubung di proyek</div>';
    if (t)
      h +=
        '<p class="note"><b>' +
        esc(PJ_KINDS[t.kind]) +
        ' di kamus</b>' +
        (t.desc ? ' · ' + esc(t.desc) : '') +
        (t.alias && t.alias.length ? ' · alias: ' + esc(t.alias.join(', ')) : '') +
        '</p>';
    var by = {};
    M.forEach(function (m) {
      (by[m.dt] = by[m.dt] || []).push(m);
    });
    var ks = Object.keys(by);
    if (ks.length)
      h +=
        '<div class="acts">' +
        ks
          .map(function (d) {
            return (
              '<button type="button" class="sbtn" data-pjgo="' +
              d +
              '|' +
              by[d][0].id +
              '">' +
              ic(DT_ICON[d] || 'layout-grid') +
              esc(DT[d].n) +
              (by[d].length > 1 ? ' ×' + by[d].length : '') +
              '</button>'
            );
          })
          .join('') +
        '</div>';
    else
      h +=
        '<p class="note">Belum muncul di halaman lain' +
        (PJ_SUGGEST[k] && PJ_SUGGEST[k].length
          ? '. Biasanya juga ada di ' +
            PJ_SUGGEST[k]
              .filter(function (d) {
                return d !== dt;
              })
              .map(function (d) {
                return DT[d].n;
              })
              .join(' / ')
          : '') +
        '.</p>';
    if (!t && k !== 'step')
      h +=
        '<div class="acts"><button type="button" class="sbtn" data-pj="dict-node">' +
        ic('plus') +
        'Tambah ke kamus</button></div>';
    h += '</div>';
    var at = s.indexOf('<div class="sec"><div class="st">Appearance');
    return at > 0 ? s.slice(0, at) + h + s.slice(at) : s + h;
  });
  pjInspDoc0 = inspDoc;
  set_inspDoc(function () {
    var s = pjInspDoc0(),
      f = pjFilledList(),
      cur = pjCur();
    var h = '<div class="sec"><div class="st">Halaman di proyek ini</div>';
    if (f.length)
      h +=
        '<div class="pj-pages">' +
        f
          .map(function (d) {
            return (
              '<button type="button" class="pj-page' +
              (d === cur ? ' on' : '') +
              '" data-pjgo="' +
              d +
              '|"><i>' +
              ic(DT_ICON[d] || 'layout-grid') +
              '</i><span><b>' +
              esc(DT[d].n) +
              '</b><small>' +
              esc(WS_BY[DT[d].ws].n) +
              '</small></span></button>'
            );
          })
          .join('') +
        '</div>';
    h +=
      '<div class="acts"><button type="button" class="sbtn" data-pjv="prd">' +
      ic('file-text') +
      'PRD</button><button type="button" class="sbtn" data-pjv="integ">' +
      ic('git-merge') +
      'Cek integrasi</button><button type="button" class="sbtn" data-pjrun="check">' +
      ic('circle-check-big') +
      'Cek halaman ini</button>' +
      (aiReady()
        ? '<button type="button" class="sbtn" data-pjrun="review">' + ic('brain') + 'AI review</button>'
        : '') +
      '</div></div>';
    return s.replace('<div class="stats">', h + '<div class="stats">');
  });
  document.addEventListener('click', function (ev) {
    var g = (ev.target as HTMLInputElement).closest('[data-pjgo]');
    if (g) {
      var p = g.getAttribute('data-pjgo').split('|');
      pjGo(p[0], p[1]);
      return;
    }
    var rn = (ev.target as HTMLInputElement).closest('[data-pjrun]');
    if (rn) {
      if (rn.getAttribute('data-pjrun') === 'check') runCheck();
      else runReview();
      return;
    }
    var v = (ev.target as HTMLInputElement).closest('[data-pjv]');
    if (v) {
      pjView(v.getAttribute('data-pjv'));
      return;
    }
    var a = (ev.target as HTMLInputElement).closest('[data-pj]');
    if (a) {
      var act = a.getAttribute('data-pj');
      if (act === 'dict-node') {
        var n = single();
        if (n) {
          var k = n.t === 'pool' ? 'actor' : pjKindOf(n, pjCur());
          pjDictMerge([{ name: pjLabel(n.label), kind: k }], 'user');
          scheduleSave();
          renderInsp();
          toast('“' + pjLabel(n.label) + '” masuk kamus proyek');
        }
      }
      if (act === 'dict-new') {
        PROJ.dict.push({
          id: 'd' + Math.random().toString(36).slice(2, 9),
          name: 'Istilah baru',
          kind: 'term',
          alias: [],
          desc: '',
          src: 'user',
        });
        scheduleSave();
        dictRender();
        var ins = $('integDict').querySelectorAll('input[data-dk="name"]');
        if (ins.length) {
          ins[ins.length - 1].focus();
          ins[ins.length - 1].select();
        }
      }
      if (act === 'dict-canvas') {
        var add = [];
        pjMentions().forEach(function (m) {
          if (m.kind !== 'step' && !PJ_SYSTEM[m.norm]) add.push({ name: m.name, kind: m.kind });
        });
        var c = pjDictMerge(add, 'canvas');
        scheduleSave();
        integRender();
        toast(c ? c + ' istilah dari kanvas masuk kamus' : 'Semua nama di kanvas sudah ada di kamus');
      }
      return;
    }
    var al = (ev.target as HTMLInputElement).closest('[data-pjalias]');
    if (al) {
      var x = PJ_ISSUES[+al.getAttribute('data-pjalias')];
      if (x && x.pair) {
        var ix = pjDictIndex(),
          kk = (x.refs[0] || {}).kind || x.kind,
          t = pjFind(ix, pjNorm(x.pair[0]), kk) || pjFind(ix, pjNorm(x.pair[1]), kk);
        if (!t) {
          pjDictMerge([{ name: x.pair[0], kind: kk || 'term', alias: [x.pair[1]] }], 'user');
        } else {
          var other = pjNorm(t.name) === pjNorm(x.pair[0]) ? x.pair[1] : x.pair[0];
          if (t.alias.indexOf(other) < 0) t.alias.push(other);
        }
        scheduleSave();
        integRender();
        toast('Disimpan sebagai alias. Keduanya dianggap hal yang sama.');
      }
      return;
    }
    var ad = (ev.target as HTMLInputElement).closest('[data-pjadd]');
    if (ad) {
      var y = PJ_ISSUES[+ad.getAttribute('data-pjadd')];
      if (y && y.add) {
        pjDictMerge([y.add], 'user');
        scheduleSave();
        integRender();
      }
      return;
    }
    var dd = (ev.target as HTMLInputElement).closest('[data-dkdel]');
    if (dd) {
      PROJ.dict.splice(+dd.getAttribute('data-dkdel'), 1);
      scheduleSave();
      integRender();
      return;
    }
  });
  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (!(el as HTMLInputElement).getAttribute || !(el as HTMLInputElement).getAttribute('data-dk')) return;
    var row = (el as HTMLInputElement).closest('[data-i]'),
      t = PROJ.dict[+row.getAttribute('data-i')];
    if (!t) return;
    var k = (el as HTMLInputElement).getAttribute('data-dk'),
      v = (el as HTMLInputElement).value;
    if (k === 'alias')
      t.alias = v
        .split(',')
        .map(function (a) {
          return a.trim();
        })
        .filter(Boolean)
        .slice(0, 12);
    else if (k === 'name') {
      if (v.trim()) t.name = v.trim().slice(0, 120);
    } else t[k] = k === 'kind' && !PJ_KINDS[v] ? 'term' : v.slice(0, 400);
    scheduleSave();
    clearTimeout(dictRenderTimer);
    dictRenderTimer = setTimeout(function () {
      if (PJ_VIEW === 'integ') integRender();
    }, 400);
  });
  if (LANG === 'en') {
    PRD_HEAD = PRD_HEAD_EN;
    PRD_TPL = PRD_TPL0_EN.replace(
      '## Automation',
      '## Architecture\n- Customer → CDN → Load balancer → Booking API: HTTPS\n- Booking API → Schedule cache (Redis): check slots, 60 s TTL\n- Booking API → Database (PostgreSQL): store bookings\n- Booking API → Notification queue → WhatsApp worker\n\n## Automation',
    );
  } else
    PRD_TPL = PRD_TPL0.replace(
      '## Otomasi',
      '## Arsitektur\n- Pelanggan → CDN → Load balancer → API booking: HTTPS\n- API booking → Cache jadwal (Redis): cek slot, TTL 60 detik\n- API booking → Database (PostgreSQL): simpan booking\n- API booking → Queue notifikasi → Worker WhatsApp\n\n## Otomasi',
    );
  pjStartNew0 = startNew;
  set_startNew(function (dt) {
    pjStartNew0(dt);
    DOC.title = 'Proyek baru';
    $('docTitle').value = DOC.title;
    set_lastKey(contentKey());
  });
  (function pjInit() {
    $('vPrd').onclick = function () {
      pjView(PJ_VIEW === 'prd' ? 'canvas' : 'prd');
    };
    $('vInteg').onclick = function () {
      pjView(PJ_VIEW === 'integ' ? 'canvas' : 'integ');
    };
    $('wsTabs').addEventListener(
      'click',
      function (ev) {
        var b = ev.target.closest('[data-ws]');
        if (!b) return;
        ev.stopImmediatePropagation();
        pjSwitch(pjWsDefault(b.getAttribute('data-ws')));
      },
      true,
    );
    var ta = $('prdText');
    ta.addEventListener('input', function () {
      PROJ.prd = ta.value.slice(0, 400000);
      clearTimeout(ta._t);
      ta._t = setTimeout(function () {
        prdPreview();
        prdRenderMap();
        var m = /^#\s+(.+)$/m.exec(PROJ.prd);
        if (m) pjAdoptTitle(m[1].trim());
      }, 180);
      scheduleSave();
    });
    ta.addEventListener('keydown', function (ev) {
      if (ev.key === 'Tab' && !ev.shiftKey && !ev.ctrlKey) {
        ev.preventDefault();
        var a = ta.selectionStart,
          b = ta.selectionEnd;
        ta.setRangeText('  ', a, b, 'end');
        ta.dispatchEvent(new Event('input'));
      }
    });
    $('prdMode').addEventListener('click', function (this: HTMLInputElement, ev) {
      var b = ev.target.closest('[data-v]');
      if (!b) return;
      [].forEach.call(this.children, function (x) {
        x.classList.toggle('on', x === b);
      });
      $('prdView').setAttribute('data-mode', b.getAttribute('data-v'));
    });
    $('prdTpl').onclick = function () {
      if (PROJ.prd.trim()) {
        prdSet(PROJ.prd.replace(/\s+$/, '') + '\n\n' + PRD_TPL.replace(/^# .*\n\n/, ''));
        toast('Bagian templat ditambahkan di bawah. Hapus yang tidak perlu.');
      } else prdSet(PRD_TPL);
    };
    $('prdImp').onclick = function () {
      $('prdFile').value = '';
      $('prdFile').click();
    };
    $('prdFile').addEventListener('change', function (this: HTMLInputElement) {
      var f = this.files && this.files[0];
      if (!f) return;
      if (f.size > 2e6) {
        toast('File terlalu besar (maks 2 MB)');
        return;
      }
      var rd = new FileReader();
      rd.onload = function () {
        prdSet(String(rd.result || ''));
        var R = prdParse(PROJ.prd),
          k = PRD_ORDER.filter(function (x) {
            return R[x] && (R[x].length || (x === 'design' && (R.design.colors.length || R.design.font)));
          }).length;
        $('prdMsg').innerHTML =
          '<div class="pv-note' +
          (k ? ' ok' : '') +
          '">' +
          ic(k ? 'circle-check-big' : 'info') +
          '<span>' +
          esc(f.name) +
          ' dimuat. ' +
          (k
            ? k + ' bagian terstruktur terbaca. Klik <b>Bangun kanvas</b>.'
            : 'Formatnya bebas: klik <b>Susun pakai AI</b> untuk merapikannya ke templat, atau pakai <b>Templat</b> sebagai panduan.') +
          '</span></div>';
      };
      rd.readAsText(f);
    });
    $('prdExp').onclick = function () {
      if (!PROJ.prd.trim()) {
        toast('PRD masih kosong');
        return;
      }
      offerFile(slug(DOC.title || 'prd') + '-prd.md', new Blob([PROJ.prd], { type: 'text/markdown' }));
    };
    $('prdFromCanvas').onclick = function () {
      var R = prdFromCanvas(),
        k = PRD_ORDER.filter(function (x) {
          return prdSecBody(x, R).length;
        }).length;
      if (!k) {
        toast('Belum ada diagram yang bisa dibaca ke PRD');
        return;
      }
      prdSet(prdMerge(PROJ.prd, R));
      $('prdMsg').innerHTML =
        '<div class="pv-note ok">' +
        ic('circle-check-big') +
        '<span>' +
        k +
        ' bagian PRD diperbarui dari kanvas. Teks bebas seperti Ringkasan dan Tujuan tidak disentuh.</span><span class="grow"></span><button type="button" class="btn" data-prdgo="revert">' +
        ic('undo-2') +
        'Kembalikan teks lama</button></div>';
    };
    $('prdAi').onclick = prdAi;
    $('prdBuild').onclick = function () {
      prdBuild(null);
    };
    $('prdMsg').addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-prdgo]');
      if (!b) return;
      var g = b.getAttribute('data-prdgo');
      if (g === 'all') prdBuild('all');
      else if (g === 'empty') prdBuild('empty');
      else if (g === 'undo') prdUndoBuild();
      else if (g === 'revert' && PRD_PREV != null) {
        var p = PRD_PREV;
        prdSet(p, true);
        PRD_PREV = null;
        $('prdMsg').innerHTML = '';
      }
    });
    $('integRun').onclick = function () {
      PJ_AI = [];
      integRender();
    };
    $('integAi').onclick = integAi;
    document.addEventListener('keydown', function (ev) {
      if (
        ev.key === 'Escape' &&
        PJ_VIEW !== 'canvas' &&
        !document.querySelector('.modal:not([hidden])') &&
        ev.target !== ta
      ) {
        pjView('canvas');
      }
    });
    var emp = $('emptyEx').parentNode,
      bp = document.createElement('button');
    bp.type = 'button';
    bp.className = 'btn';
    bp.id = 'emptyPrd';
    bp.hidden = true;
    bp.innerHTML = ic('file-text') + '<span>Bangun dari PRD</span>';
    emp.appendChild(bp);
    bp.onclick = function () {
      var dt = pjCur(),
        R = prdParse(PROJ.prd),
        fn = PRD_BUILD[dt] && PRD_BUILD[dt](R);
      if (!fn) return;
      pushUndo();
      var pg = pjInto(dt, fn);
      S.nodes = pg.nodes;
      S.edges = pg.edges;
      S.seq = pg.seq;
      renderAll();
      fitView();
      pjMarks();
      scheduleSave();
      toast('Halaman ' + DT[dt].n + ' dibangun dari PRD');
    };
    var fwBtn = document.createElement('button');
    fwBtn.type = 'button';
    fwBtn.className = 'btn';
    fwBtn.id = 'emptyFw';
    fwBtn.hidden = true;
    fwBtn.innerHTML = ic('layout-grid') + '<span>Mulai kerangka</span>';
    emp.appendChild(fwBtn);
    fwBtn.onclick = function () {
      pushUndo();
      if (seedType(pjCur(), true)) {
        renderAll();
        fitView();
        pjMarks();
        scheduleSave();
      }
    };
  })();
  pjEmpty0 = renderEmpty;
  set_renderEmpty(function () {
    pjEmpty0();
    var dt = pjCur(),
      R = PROJ.prd.trim() ? prdParse(PROJ.prd) : null,
      can = !!(R && PRD_BUILD[dt] && PRD_BUILD[dt](R));
    $('emptyPrd').hidden = !can;
    var k = dtKind(dt);
    $('emptyFw').hidden = !(k === 'fw' || k === 'tree');
    if (can)
      $('emptyP').textContent = DT[dt].hint + ' PRD proyek ini punya data untuk halaman ini: klik “Bangun dari PRD”.';
  });
  pjRenderAll0 = renderAll;
  set_renderAll(function () {
    pjRenderAll0();
    if (!$('empty').hidden) renderEmpty();
  });
}
