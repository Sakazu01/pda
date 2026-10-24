// ================= AI (sample) =================
import {
  $,
  EDGE,
  S,
  T,
  byId,
  clamp,
  contents,
  esc,
  fam,
  pushUndo,
  set_S,
  size,
  snap,
  snapshot,
  undo,
} from '../core/core';
import { DT, SEC, dtOf } from '../diagrams/catalog';
import { TREEP, computeTree, normName } from '../diagrams/draw';
import { addNode, bounds, commitEdit, fitView, isCont, renderAll, syncUndoBtns, toast } from '../core/ui';
import {
  DOC,
  closeModal,
  findItem,
  loadDoc,
  openModal,
  saveNow,
  set_findTargets,
  set_lastKey,
  showFindings,
} from '../core/features';
import { FW, FWX, TREEX, buildGraph, buildSequence, buildTree, insertBlock } from '../diagrams/frameworks';
import { WS_BY, primarySecs, specBounds } from '../editor/workspaces';
import { aiCap } from './providers';

export var sampleCap = null;
export function set_sampleCap(v: typeof sampleCap) {
  return (sampleCap = v);
}
export var genCtl = null;
export var reviewCtl = null;
export var genMode = 'add';
export function set_genMode(v: typeof genMode) {
  return (genMode = v);
}
export function dtKind(dt) {
  var D = DT[dt] || DT.arch;
  return D.fw
    ? 'fw'
    : D.tree
      ? 'tree'
      : dt === 'sequence'
        ? 'seq'
        : dt === 'wire'
          ? 'wire'
          : dt === 'board'
            ? 'board'
            : 'graph';
}
export function isContT(k) {
  var f = (T[k] || {}).f;
  return f === 'zone' || f === 'box';
}
export function edgeGroups(dt) {
  var ws = DT[dt].ws;
  if (dt === 'bpmn') return ['BPMN'];
  if (dt === 'dfd' || dt === 'erd') return ['DFD & ERD', 'System'];
  if (ws === 'se') return ['UML'];
  if (ws === 'ai') return ['AI & workflow', 'System'];
  return ['System'];
}
export var EDGE_FOR = {
  usecase: ['uassoc', 'uinc', 'uext', 'uinh'],
  activity: ['uflow'],
  state: ['uflow'],
  class: ['uassoc', 'unav', 'uinh', 'ureal', 'udep', 'uagg', 'ucomp'],
  dfd: ['dflow'],
  erd: ['cf', 'line'],
  c4: ['c4rel'],
  bpmn: ['seq', 'msg', 'def', 'cond', 'data', 'assoc'],
  network: ['line', 'sync', 'bi'],
  userflow: ['sync', 'line'],
};
export function edgeKeys(dt) {
  if (EDGE_FOR[dt]) return EDGE_FOR[dt].slice();
  var g = edgeGroups(dt);
  return Object.keys(EDGE).filter(function (k) {
    return g.indexOf(EDGE[k].g) >= 0;
  });
}
export function palKeys(dt) {
  var secs = primarySecs(dt);
  if (DT[dt].ws === 'sys' || DT[dt].ws === 'ai') secs = secs.concat(['tech-ai', 'tech-data', 'tech-app', 'tech-cloud']);
  var out = [];
  secs.forEach(function (id) {
    (SEC[id] ? SEC[id].keys : []).forEach(function (k) {
      if (T[k] && out.indexOf(k) < 0 && T[k].f !== 'note' && T[k].f !== 'text' && k !== 'pool') out.push(k);
    });
  });
  return out;
}
export var GRAPH_RULES = {
  bpmn: 'BPMN process: one start event and at least one end event; tasks named verb + object; exclusive gateways (gw-xor) whose outgoing seq edges are each labelled with the condition; merge branches with a matching gateway. Every edge is seq.',
  usecase:
    'Use case diagram: u-actor nodes for every actor; u-usecase nodes named verb + object, all inside ONE zone of type b-boundary named after the system (actors stay outside the zone). Edges: uassoc between an actor and a use case; uinc from the base use case to the included one; uext from the extending use case to the base one.',
  activity:
    'Activity diagram: exactly one u-act-initial, at least one u-act-final, u-act-action steps named verb + object, u-act-decision nodes whose outgoing edges are labelled with guards such as [ya] and [tidak], and u-act-bar for fork and join of parallel work. Every edge is uflow.',
  class:
    'Class diagram: u-class nodes with "attrs" (one per line, "- name: Type") and "ops" (one per line, "+ method(arg): Type"), plus u-interface or u-enum where they fit. Edges: uassoc with multiplicity labels such as "1 .. *", uinh from child to parent, ureal from class to interface, ucomp and uagg from the whole to the part, udep for usage.',
  state:
    'State machine: one u-act-initial, u-state nodes (optional "body" with entry / do / exit lines), u-choice for branching, u-act-final if the object ends. Every edge is uflow labelled "event [guard] / action".',
  dfd: 'Data flow diagram: dfd-ext external entities, dfd-proc processes named verb + object with "num" (0 for a context diagram, 1.0, 2.0 … for level 1), dfd-store data stores with "num" D1, D2 …. Every edge is dflow and is labelled with the data it carries. Never connect two externals, two stores, or an external directly to a store; every process has at least one input and one output.',
  erd: 'ERD in crow’s-foot notation: er-table nodes whose "body" lists the columns one per line ("PK id: int", "FK customer_id: int", "name: varchar(80)"). Edges: cf from the parent table to the child table, with "c1" (parent end) and "c2" (child end) each one of only, one, zone, omany, zmany, many.',
  c4: 'C4 container diagram: c4-person for users, c4-container / c4-db / c4-component for the parts of the system ("sub" = technology, "body" = one-sentence responsibility), c4-ext for external systems, and one zone of type b-c4b around the system’s own containers. Every edge is c4rel labelled "what it does [protocol]".',
  arch: 'System architecture: users and clients first, then the edge (DNS, CDN, load balancer, gateway), services, data stores and messaging. Use zones (z-vpc, z-subnet, z-cluster, z-region) only for real network boundaries.',
  k8s: 'Kubernetes: c-k-ing ingress → c-k-svc services → c-k-deploy or c-k-sts workloads, with c-k-cm, c-k-secret, c-k-pv, c-k-hpa and c-k-job where they fit; put the namespaced objects inside one z-namespace zone.',
  network:
    'Network topology: c-n-isp → c-n-router → c-n-fw → c-n-switch → end devices (c-n-pc, c-n-laptop, c-n-printer, c-n-ap, c-n-server, c-n-nas, c-n-cctv, c-n-phone). Use z-lan and z-dmz zones for segments. Edges are line, labelled with the medium or subnet when useful.',
  dist: 'Distributed system: leaders and followers (c-d-leader, c-d-follower), coordinators (c-d-coord), shards (c-shard), replicas (c-replica), streams and queues. Label replication and consensus edges.',
  n8n: 'n8n workflow: start with one c-t-* trigger, then c-l-* logic nodes (if, switch, merge, loop, code, set, http) and app or tech items; AI steps use c-a-agent with c-chat and c-parser. Edges are sync between steps and route for if/switch branches labelled true / false or the case name.',
  agent:
    'LangGraph agent: fc-lgstart → nodes → fc-lgend; a router or supervisor (c-a-router or c-a-super) with route edges labelled by condition; tools (c-a-tool, c-a-browser, c-a-sandbox, c-a-mcp) linked with tool edges; c-state and c-checkpoint for state; a c-a-human or c-a-critic step when it fits.',
  rag: 'RAG pipeline: an ingestion path (c-t-schedule or c-loader → c-splitter → c-embed → c-vector) and a query path (c-t-chat → c-guard → c-retriever → c-rerank → c-prompt → c-chat → c-parser); add c-trace and c-eval.',
  multi:
    'Multi-agent system: a supervisor (c-a-super) delegating with route2 edges to specialist agents (c-a-research, c-a-coder, c-a-writer, c-a-critic, c-a-planner), tools via tool edges, shared memory (c-ltmem or c-state), a human approval step (c-a-human), and fc-lgstart / fc-lgend.',
  mlpipe:
    'ML pipeline: data sources → c-pipeline → c-m-dataset and c-m-feature → c-m-train → c-m-registry → c-m-serve → the consuming app, with c-m-drift monitoring and c-m-label where labels are needed.',
  userflow:
    'User flow: fc-terminal for the start and the goal, ux-screen for each screen, fc-decision for user or system decisions. Edges are sync, labelled with the user action or the condition.',
};
export var FW_RULES = {
  ff: 'Keys ending in _k describe the current conditions; _l is the level of that force and must be exactly Tinggi, Sedang or Rendah; _s lines are information-system proposals that answer that force.',
  gen: '"pilih" is the chosen strategy and must be one of cl (cost leadership), df (differentiation), cf (cost focus) or dff (differentiation focus); "org" is the organization name; "alasan" lists the reasons.',
  vmodel:
    '"pairs" has one line per level, "left stage | link label | right stage", from the top level down; the last line is the single bottom stage.',
  journey:
    '"stages" lists 4 to 6 stage names separated by |. For each stage index i (starting at 0) fill act{i}, tp{i}, feel{i}, pain{i} and opp{i}.',
  dikw: 'wis, kno, inf and dat are questions or statements for Wisdom, Knowledge, Information and Data about the same case.',
  wp: 'b, si and ti describe the business, IS and IT strategy; b_si, si_b, si_ti and ti_si are short arrow labels; "catatan" is one closing sentence.',
  persona: 'name, role (job · age · city) and bio (a short quote) describe one representative user.',
  empathy: '"user" is the person’s first name.',
};
export function graphPrompt__base(text, dt) {
  var keys = palKeys(dt),
    nodesT = keys.filter(function (k) {
      return !isContT(k);
    }),
    zonesT = keys.filter(isContT),
    eks = edgeKeys(dt),
    D = DT[dt];
  return (
    'You draft ' +
    D.n +
    ' diagrams for PDA (Plan & Design Anything), a diagram studio. Turn the request into one clear, correct diagram.\n\nRequest:\n"""\n' +
    text.slice(0, 4000) +
    '\n"""\n\n' +
    'Node types: ' +
    nodesT
      .map(function (k) {
        return k + ' = ' + T[k].n;
      })
      .join('; ') +
    (zonesT.length
      ? '\nContainer (zone) types: ' +
        zonesT
          .map(function (k) {
            return k + ' = ' + T[k].n;
          })
          .join('; ')
      : '') +
    '\nEdge types: ' +
    eks
      .map(function (k) {
        return k + ' = ' + EDGE[k].n;
      })
      .join('; ') +
    '\n\nReply with only one JSON object of this shape:\n{"title":"short diagram name","zones":[{"id":"z1","type":"' +
    (zonesT[0] || 'z-zgroup') +
    '","label":"…"}],"nodes":[{"id":"n1","type":"' +
    nodesT[0] +
    '","label":"…","sub":"optional detail","zone":"z1"}],"edges":[{"from":"n1","to":"n2","type":"' +
    eks[0] +
    '","label":"…"}]}\n\nRules:\n- ' +
    (GRAPH_RULES[dt] || GRAPH_RULES.arch) +
    '\n- 5 to 24 nodes. Use the most specific type from the lists, spelled exactly.\n- label: 1 to 4 words (class and table names in code style). Optional node fields: "sub" (technology or short detail), "body", "attrs", "ops", "num", "stereo". Optional edge fields for cf edges: "c1", "c2".\n- Edges point in the direction of the call, flow or data.\n- Each node is in at most one zone and a zone needs at least 2 nodes. Leave "zones" empty when no boundary fits.\n- Write labels in the language of the request.'
  );
}
export var graphPrompt: typeof graphPrompt__base = graphPrompt__base;
export function set_graphPrompt(v: typeof graphPrompt__base) {
  return (graphPrompt = v);
}
export function fwPrompt(text, dt) {
  var fw = DT[dt].fw,
    exs = FWX[fw] || {},
    names = Object.keys(exs),
    ex = names.length ? exs[names[0]] : {},
    keys = {};
  names.forEach(function (n) {
    Object.keys(exs[n]).forEach(function (k) {
      keys[k] = 1;
    });
  });
  return (
    'You fill in a ' +
    DT[dt].n +
    ' for PDA, a business and information-systems diagram studio.\n\nCase:\n"""\n' +
    text.slice(0, 4000) +
    '\n"""\n\n' +
    'Reply with only one JSON object with these keys: ' +
    Object.keys(keys).join(', ') +
    '.\nEvery value is a string. Separate the points inside a value with \\n. Write 2 to 5 short, concrete points per block that are specific to this case, never generic textbook filler. "judul" is the diagram title.\n' +
    (FW_RULES[fw] ? FW_RULES[fw] + '\n' : '') +
    '\nExample answer for a different case (same keys; do not copy its content):\n' +
    JSON.stringify(ex).slice(0, 3500) +
    '\n\nWrite in the language of the case.'
  );
}
export function treePrompt(text, dt) {
  var kind = DT[dt].tree,
    xs = TREEX[dt] || {},
    ex = xs[Object.keys(xs)[0]] || '';
  var R = {
    org: 'An organization chart of positions (not people) from the top leader down. After a position you may add " | detail" for the person or unit. End a line with * to highlight it (for example the unit that owns IT).',
    page: 'A website sitemap: page names, each followed by " | /url".',
    mind: 'A mind map: one short central topic, 4 to 7 main branches and 2 to 5 short sub-topics each (at most 4 words per line).',
  }[kind];
  return (
    'You draft a ' +
    DT[dt].n +
    ' for PDA.\n\nRequest:\n"""\n' +
    text.slice(0, 4000) +
    '\n"""\n\nReply with only one JSON object: {"title":"short name","outline":"…"}\n"outline" is an indented outline: one item per line, two spaces of indentation per level, a single root on the first line. ' +
    R +
    ' At most 45 lines.\n\nExample outline:\n' +
    ex +
    '\n\nWrite in the language of the request.'
  );
}
export function seqPrompt(text) {
  return (
    'You draft a UML sequence diagram for PDA.\n\nRequest:\n"""\n' +
    text.slice(0, 4000) +
    '\n"""\n\nReply with only one JSON object:\n{"title":"short name","participants":[{"id":"u","label":"Customer","kind":"actor"},{"id":"api","label":"Order API","kind":"object"}],"messages":[{"from":"u","to":"api","label":"POST /orders","type":"umsg"}]}\n\nRules:\n- 3 to 7 participants, left to right in the order they first take part; the human user is kind "actor", everything else "object".\n- 6 to 18 messages in time order. type: umsg for a synchronous call, uasync for an asynchronous message or event, uret for a reply (dashed). Labels are short calls such as "login(email, otp)" or "200 OK".\n- Write labels in the language of the request.'
  );
}
export function wirePrompt(text) {
  var wf = SEC.wire.keys
    .filter(function (k) {
      return T[k];
    })
    .map(function (k) {
      return k + ' = ' + T[k].n;
    })
    .join('; ');
  return (
    'You draft low-fidelity mobile wireframes for PDA.\n\nRequest:\n"""\n' +
    text.slice(0, 4000) +
    '\n"""\n\nElement types: ' +
    wf +
    '\n\nReply with only one JSON object:\n{"title":"short name","screens":[{"name":"Login","elements":[{"type":"wf-nav","label":"App name"},{"type":"wf-heading","label":"Masuk"},{"type":"wf-input","label":"Email"},{"type":"wf-button","label":"Masuk"}]}],"flows":[{"from":"Login","to":"Home","label":"tap Masuk"}]}\n\nRules:\n- 2 to 5 screens. Each screen lists 4 to 10 elements from top to bottom; use wf-nav first and wf-tabbar last when the app has them. Use wf-list with "rows" (2 to 5) for lists.\n- Labels are the real UI text, short. flows connect screens by name with the user action.\n- Write labels in the language of the request.'
  );
}
export function boardPrompt(text) {
  return (
    'You run a whiteboard session for PDA.\n\nRequest:\n"""\n' +
    text.slice(0, 4000) +
    '\n"""\n\nReply with only one JSON object:\n{"title":"short name","groups":[{"name":"What went well","color":"green","notes":["…","…"]}]}\n\nRules:\n- 2 to 5 groups; color is one of yellow, pink, blue, green, orange, purple.\n- 3 to 8 sticky notes per group, each at most 12 words, specific to the request.\n- Write in the language of the request.'
  );
}
export function genPrompt__base(text, dt) {
  var k = dtKind(dt);
  return k === 'fw'
    ? fwPrompt(text, dt)
    : k === 'tree'
      ? treePrompt(text, dt)
      : k === 'seq'
        ? seqPrompt(text)
        : k === 'wire'
          ? wirePrompt(text)
          : k === 'board'
            ? boardPrompt(text)
            : graphPrompt(text, dt);
}
export var genPrompt: typeof genPrompt__base = genPrompt__base;
export function set_genPrompt(v: typeof genPrompt__base) {
  return (genPrompt = v);
}
export var GEN_FALLBACK = {
  bpmn: 'task',
  usecase: 'u-usecase',
  activity: 'u-act-action',
  class: 'u-class',
  state: 'u-state',
  dfd: 'dfd-proc',
  erd: 'er-table',
  c4: 'c4-container',
  userflow: 'ux-screen',
};
export var CF_OK = { only: 1, one: 1, zone: 1, omany: 1, zmany: 1, many: 1 };
export function genType(t, dt) {
  t = String(t || '');
  if (T[t] && !isContT(t) && T[t].f !== 'pool' && T[t].f !== 'cell' && T[t].f !== 'draw') return t;
  if (t.indexOf('fc-') === 0) return 'fc-process';
  return GEN_FALLBACK[dt] || 'c-service';
}
export function defZone(dt) {
  return dt === 'usecase'
    ? 'b-boundary'
    : dt === 'c4'
      ? 'b-c4b'
      : dt === 'k8s'
        ? 'z-namespace'
        : dt === 'network'
          ? 'z-lan'
          : dt === 'multi' || dt === 'agent'
            ? 'z-team'
            : 'z-zgroup';
}
export function strs(v) {
  return Array.isArray(v)
    ? v
        .map(function (x) {
          return x == null ? '' : String(x);
        })
        .join('\n')
    : v == null
      ? ''
      : String(v);
}
export function genOrigin(mode) {
  if (mode !== 'add') return { x: 0, y: 0 };
  var b = bounds(S.nodes, []);
  return b ? { x: snap(b.x + b.w + 160), y: snap(b.y) } : { x: 0, y: 0 };
}
export function buildWire(screens, flows, ox, oy) {
  var count = 0,
    frames = {},
    list = Array.isArray(screens) ? screens.slice(0, 6) : [];
  list.forEach(function (sc, i) {
    if (!sc) return;
    var fx = ox + i * 440,
      fy = oy + 30,
      ph = addNode('b-phone', 0, 0);
    ph.x = fx;
    ph.y = fy;
    ph.label = String(sc.name || 'Screen ' + (i + 1)).slice(0, 40);
    count++;
    frames[normName(ph.label)] = ph;
    frames[String(i)] = ph;
    var els = (Array.isArray(sc.elements) ? sc.elements : [])
        .filter(function (el) {
          return el && T[el.type] && T[el.type].f === 'wf';
        })
        .slice(0, 14),
      tab = els.filter(function (el) {
        return el.type === 'wf-tabbar';
      })[0];
    var y = fy + 44,
      bottom = fy + (tab ? 640 : 716);
    els.forEach(function (el) {
      if (el.type === 'wf-tabbar') return;
      var t = el.type,
        sz = size(t),
        full = t === 'wf-nav',
        narrow = ['wf-chip', 'wf-avatar', 'wf-checkbox', 'wf-toggle'].indexOf(t) >= 0,
        w = full ? 360 : narrow ? sz[0] : 320,
        h = sz[1];
      if (t === 'wf-list') {
        var rr = clamp(Math.round(+el.rows || 3), 1, 6);
        h = rr * 56;
      }
      if (y + h > bottom) return;
      var n: Record<string, any> = addNode(t, 0, 0);
      n.x = full ? fx : fx + 20;
      n.y = y;
      n.w = w;
      n.h = h;
      if (el.label != null) n.label = String(el.label).slice(0, 80);
      if (t === 'wf-list') n.rows = Math.round(h / 56);
      y += h + (full ? 16 : 14);
      count++;
    });
    if (tab) {
      var tb = addNode('wf-tabbar', 0, 0);
      tb.x = fx + 12;
      tb.y = fy + 656;
      tb.w = 336;
      tb.h = 64;
      count++;
    }
  });
  (Array.isArray(flows) ? flows : []).slice(0, 12).forEach(function (f) {
    if (!f) return;
    var a = frames[normName(f.from)] || frames[String(f.from)],
      b = frames[normName(f.to)] || frames[String(f.to)];
    if (a && b && a !== b)
      S.edges.push({
        id: 'e' + S.seq++,
        from: a.id,
        to: b.id,
        type: 'sync',
        label: String(f.label || '').slice(0, 50),
      });
  });
  return count;
}
export var NOTE_C = ['yellow', 'blue', 'green', 'pink', 'orange', 'purple'];
export function buildBoard(groups, ox, oy) {
  var x = ox,
    count = 0;
  (Array.isArray(groups) ? groups : []).slice(0, 6).forEach(function (g, i) {
    if (!g) return;
    var notes = (Array.isArray(g.notes) ? g.notes : [])
      .slice(0, 12)
      .map(function (t) {
        return String(t).slice(0, 160);
      })
      .filter(Boolean);
    if (!notes.length) return;
    var cols = Math.min(3, notes.length),
      rows = Math.ceil(notes.length / cols),
      fw = cols * 170 + (cols - 1) * 16 + 48,
      fh = rows * 120 + (rows - 1) * 16 + 48;
    var fr = addNode('b-frame', 0, 0);
    fr.x = x;
    fr.y = oy + 30;
    fr.w = fw;
    fr.h = fh;
    fr.label = String(g.name || 'Group ' + (i + 1)).slice(0, 60);
    var col = NOTE_C.indexOf(g.color) >= 0 ? g.color : NOTE_C[i % NOTE_C.length];
    notes.forEach(function (t, j) {
      var n = addNode('nt-' + col, 0, 0);
      n.label = t;
      n.x = x + 24 + (j % cols) * 186;
      n.y = oy + 54 + Math.floor(j / cols) * 136;
      n.w = 170;
      n.h = 120;
      count++;
    });
    x += fw + 60;
  });
  return count;
}
export function buildGen__base(d, dt, mode) {
  if (!d || typeof d !== 'object') throw { code: 'invalid_json' };
  var kind = dtKind(dt),
    o = genOrigin(mode),
    title = String(d.title || d.judul || DT[dt].n).slice(0, 80),
    count = 0;
  if (kind === 'fw') {
    var data = {};
    Object.keys(d).forEach(function (k) {
      data[k] = strs(d[k]).slice(0, 2000);
    });
    var spec = FW[DT[dt].fw].build(data),
      sb = specBounds(spec.nodes);
    count = insertBlock(spec, o.x - sb.x, o.y - sb.y).length;
  } else if (kind === 'tree') {
    var ol = strs(d.outline);
    if (!ol.trim()) throw { code: 'invalid_json' };
    count = buildTree(ol.split('\n').slice(0, 60).join('\n'), DT[dt].tree, o.x, o.y).length;
  } else if (kind === 'seq') {
    var ps = (Array.isArray(d.participants) ? d.participants : [])
      .filter(Boolean)
      .slice(0, 9)
      .map(function (p, i) {
        return {
          id: String(p.id != null ? p.id : i),
          label: String(p.label || p.name || 'Object ' + (i + 1)).slice(0, 40),
          kind: p.kind === 'actor' ? 'actor' : 'object',
        };
      });
    var ms = (Array.isArray(d.messages) ? d.messages : [])
      .filter(Boolean)
      .slice(0, 30)
      .map(function (m) {
        return {
          from: String(m.from),
          to: String(m.to),
          label: String(m.label || '').slice(0, 60),
          type: ['umsg', 'uasync', 'uret'].indexOf(m.type) >= 0 ? m.type : 'umsg',
        };
      });
    if (ps.length < 2 || !ms.length) throw { code: 'invalid_json' };
    var e0 = S.edges.length;
    buildSequence(ps, ms, o.x + 40, o.y + 40);
    count = ps.length + (S.edges.length - e0);
  } else if (kind === 'wire') {
    count = buildWire(d.screens, d.flows, o.x, o.y);
    if (!count) throw { code: 'invalid_json' };
  } else if (kind === 'board') {
    count = buildBoard(d.groups, o.x, o.y);
    if (!count) throw { code: 'invalid_json' };
  } else {
    if (!Array.isArray(d.nodes) || !d.nodes.length) throw { code: 'invalid_json' };
    var spec2 = { dir: DT[dt].dir, nodes: [], edges: [], zones: [] },
      ok = {},
      zm = {};
    d.nodes.slice(0, 40).forEach(function (n, i) {
      if (!n) return;
      var t = genType(n.type, dt),
        ex = {},
        id = String(n.id != null ? n.id : 'n' + i);
      ['sub', 'body', 'attrs', 'ops', 'num', 'stereo'].forEach(function (k) {
        if (n[k] != null && strs(n[k]).trim()) ex[k] = strs(n[k]).slice(0, 600);
      });
      if (t === 'fc-lgstart' && !n.label) n.label = 'START';
      if (t === 'fc-lgend' && !n.label) n.label = 'END';
      ok[id] = 1;
      spec2.nodes.push([id, t, n.label != null ? String(n.label).slice(0, 80) : null, ex]);
    });
    (Array.isArray(d.zones) ? d.zones : []).slice(0, 12).forEach(function (z) {
      if (!z) return;
      zm[String(z.id)] = {
        t: T[z.type] && isContT(z.type) ? z.type : defZone(dt),
        label: String(z.label || '').slice(0, 60),
        m: [],
      };
    });
    d.nodes.forEach(function (n) {
      if (n && n.zone != null && zm[String(n.zone)] && ok[String(n.id)]) zm[String(n.zone)].m.push(String(n.id));
    });
    Object.keys(zm).forEach(function (k) {
      var z = zm[k];
      if (z.m.length) spec2.zones.push([k, z.t, z.label || T[z.t].n, z.m]);
    });
    (Array.isArray(d.edges) ? d.edges : []).slice(0, 90).forEach(function (e) {
      if (!e) return;
      var a = String(e.from),
        b = String(e.to);
      if (!ok[a] || !ok[b] || a === b) return;
      var ex: Record<string, any> = {};
      if (CF_OK[e.c1]) ex.c1 = e.c1;
      if (CF_OK[e.c2]) ex.c2 = e.c2;
      spec2.edges.push([a, b, EDGE[e.type] ? e.type : null, String(e.label || '').slice(0, 60), ex]);
    });
    count = buildGraph(spec2, o.x + 60, o.y + 80).length;
    if (!count) throw { code: 'invalid_json' };
  }
  return { title: title, count: count };
}
export var buildGen: typeof buildGen__base = buildGen__base;
export function set_buildGen(v: typeof buildGen__base) {
  return (buildGen = v);
}
export function sampleError(e, what) {
  if (e && e.name === 'AbortError') return '';
  if (e && !e.code && e.message) return e.message;
  var c = e && e.code;
  if (c === 'cancelled') return '';
  if (
    ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].indexOf(c) >= 0
  ) {
    $('btnGen').hidden = true;
    $('btnReview').hidden = true;
    $('emptyGen').hidden = true;
    return 'Claude is not available for this page on your account.';
  }
  if (c === 'rate_limited') return 'Too many requests right now. Try again in a minute.';
  if (c === 'session_expired') return 'Your session expired. Sign in to Claude again.';
  if (c === 'invalid_json')
    return 'Claude’s answer could not be read as a ' + what + '. Try again, or make the request shorter.';
  if (c === 'refused') return 'Claude declined this request. Rephrase it and try again.';
  if (c === 'prompt_too_large') return 'The diagram is too large to send. Select fewer shapes or split it.';
  return 'Something went wrong (' + (c || 'error') + '). Try again.';
}
export var GEN_COPY = {
  fw: {
    lab: 'Describe the business or case',
    ph: 'Kedai kopi kecil dekat kampus: ramai saat jam kuliah, pesanan lewat WhatsApp, bersaing dengan lima kedai lain, ingin menambah layanan pesan-antar.',
    chips: [
      'Kedai kopi dekat kampus',
      'Toko bangunan keluarga',
      'Klinik gigi dengan tiga dokter',
      'Startup les privat online',
      'Laundry kiloan dengan dua cabang',
    ],
  },
  org: {
    lab: 'Describe the organization',
    ph: 'Rumah sakit swasta tipe C dengan direktur, tiga wakil direktur, dan instalasi rawat jalan, rawat inap, farmasi, serta unit TI.',
    chips: ['Rumah sakit tipe C', 'Startup teknologi 40 orang', 'Himpunan mahasiswa', 'Pabrik garmen'],
  },
  page: {
    lab: 'Describe the website',
    ph: 'Website toko roti: katalog, pemesanan kue ulang tahun, lokasi cabang, blog resep, akun pelanggan.',
    chips: ['Toko online fashion', 'Portal akademik kampus', 'Website klinik', 'Company profile konsultan'],
  },
  mind: {
    lab: 'Describe the topic',
    ph: 'Persiapan wawancara system design: requirement, estimasi, desain tingkat tinggi, deep dive, trade-off.',
    chips: [
      'Belajar system design',
      'Rencana skripsi',
      'Strategi konten bulan depan',
      'Persiapan UTS Sistem Informasi',
    ],
  },
  seq: {
    lab: 'Describe the interaction',
    ph: 'Login dengan email dan OTP: aplikasi memanggil API, API memeriksa database lalu mengirim OTP lewat layanan SMS.',
    chips: [
      'Login dengan OTP',
      'Checkout dengan payment gateway',
      'Upload file dengan presigned URL',
      'Refresh token yang kedaluwarsa',
    ],
  },
  wire: {
    lab: 'Describe the app and its screens',
    ph: 'Aplikasi booking lapangan futsal: daftar lapangan, detail dan jadwal, pembayaran, tiket booking.',
    chips: ['Booking lapangan futsal', 'Onboarding bank digital', 'Checkout toko online', 'Absensi karyawan'],
  },
  board: {
    lab: 'Describe the session',
    ph: 'Retro sprint tim: apa yang berjalan baik, apa yang perlu diperbaiki, dan aksi untuk sprint berikutnya.',
    chips: [
      'Retro sprint',
      'Brainstorm fitur aplikasi kampus',
      'Ide konten media sosial',
      'Risiko proyek dan mitigasinya',
    ],
  },
  se: {
    lab: 'Describe the system',
    ph: 'Sistem perpustakaan kampus: anggota mencari dan meminjam buku, petugas mengelola peminjaman dan denda.',
    chips: ['Sistem perpustakaan kampus', 'POS kafe dengan member', 'Reservasi hotel', 'Pengajuan cuti karyawan'],
  },
  sys: {
    lab: 'Describe the system, its users and the main flows',
    ph: 'A food-delivery backend: customers order from a mobile app, restaurants get orders in real time, couriers share live location, payments go through Midtrans.',
    chips: [
      'Ride-hailing backend with live driver tracking',
      'Video streaming platform with transcoding',
      'Payment flow with fraud checks and webhooks',
      'Campus course-registration system',
    ],
  },
  ai: {
    lab: 'Describe the AI workflow',
    ph: 'Customer-support assistant: answers from our help-center docs, escalates billing questions to a human, logs every conversation.',
    chips: [
      'RAG chatbot over company documents',
      'Support multi-agent with human handoff',
      'n8n: invoice email → extract → Google Sheets',
      'Research agent with web search and citations',
    ],
  },
  ux: {
    lab: 'Describe the product and the user goal',
    ph: 'Pengguna baru mendaftar, memverifikasi email, lalu membuat pesanan pertama.',
    chips: ['Daftar dan pesanan pertama', 'Reset password', 'Checkout tamu', 'Booking jadwal dokter'],
  },
  biz: {
    lab: 'Describe the process',
    ph: 'Proses pengajuan cuti: karyawan mengajukan, atasan menyetujui atau menolak, HR mencatat dan memberi tahu.',
    chips: ['Pengajuan cuti karyawan', 'Order-to-cash toko online', 'Peminjaman ruang kampus', 'Klaim garansi produk'],
  },
};
export function genCopy(dt) {
  var k = dtKind(dt);
  if (k === 'fw') return GEN_COPY.fw;
  if (k === 'tree') return GEN_COPY[DT[dt].tree];
  if (k === 'seq' || k === 'wire' || k === 'board') return GEN_COPY[k];
  return GEN_COPY[DT[dt].ws] || GEN_COPY.sys;
}
export function prepGen__base() {
  var dt = dtOf(),
    c = genCopy(dt);
  $('mGenT').textContent = 'Generate · ' + DT[dt].n;
  $('genLab').textContent = c.lab;
  $('genText').placeholder = c.ph;
  $('genChips').innerHTML = c.chips
    .map(function (x) {
      return '<button type="button">' + esc(x) + '</button>';
    })
    .join('');
  $('genAddLbl').textContent = dtKind(dt) === 'fw' ? 'Add beside this canvas' : 'Add to this canvas';
  $('genProg').textContent = '';
}
export var prepGen: typeof prepGen__base = prepGen__base;
export function set_prepGen(v: typeof prepGen__base) {
  return (prepGen = v);
}
export function runGenerate__base() {
  var text = $('genText').value.trim();
  if (!text) {
    $('genText').focus();
    toast('Describe it first');
    return;
  }
  var cap = aiCap();
  if (!cap) {
    openModal('mLlm');
    return;
  }
  var dt = dtOf(),
    mode = genMode;
  genCtl = new AbortController();
  var ctl = genCtl;
  $('genGo').disabled = true;
  $('genStop').hidden = false;
  $('genProg').textContent = 'Thinking…';
  cap
    .json(genPrompt(text, dt), {
      signal: ctl.signal,
      cache: false,
      onText: function (u) {
        var t = (u && u.text) || '';
        $('genProg').textContent =
          'Drafting… ' + (t.length > 999 ? Math.round(t.length / 100) / 10 + 'k' : t.length) + ' characters';
      },
    })
    .then(function (d) {
      if (ctl.signal.aborted) return;
      if (mode === 'new') {
        saveNow();
        var keep = S;
        set_S({ nodes: [], edges: [], seq: 1, dt: dt });
        var r;
        try {
          r = buildGen(d, dt, 'new');
        } catch (err) {
          set_S(keep);
          throw err;
        }
        var built = { title: r.title, nodes: S.nodes, edges: S.edges, seq: S.seq, dt: dt };
        loadDoc(built, null);
        set_lastKey(null);
        saveNow(true);
        toast('Generated ' + r.count + ' items. Everything is editable.');
      } else {
        var before = snapshot();
        pushUndo();
        var r2;
        try {
          r2 = buildGen(d, dt, 'add');
        } catch (err) {
          set_S(JSON.parse(before));
          undo.pop();
          syncUndoBtns();
          throw err;
        }
        renderAll();
        fitView();
        toast('Added ' + r2.count + ' items. Ctrl+Z undoes it.');
      }
      closeModal();
    })
    .catch(function (e) {
      $('genProg').textContent = sampleError(e, DT[dt].n);
    })
    .then(function () {
      if (genCtl === ctl) genCtl = null;
      $('genGo').disabled = false;
      $('genStop').hidden = true;
    });
}
export var runGenerate: typeof runGenerate__base = runGenerate__base;
export function set_runGenerate(v: typeof runGenerate__base) {
  return (runGenerate = v);
}
export function diagramText() {
  var lines = ['Nodes:'],
    cut = function (t, n) {
      t = String(t || '').replace(/\s*\n\s*/g, ' / ');
      return t.length > n ? t.slice(0, n) + '…' : t;
    };
  computeTree();
  S.nodes.forEach(function (n) {
    if (fam(n) === 'draw') return;
    var extra = [];
    if (n.sub) extra.push(cut(n.sub, 80));
    if (n.body) extra.push('content: ' + cut(n.body, 360));
    if (n.attrs) extra.push('attrs: ' + cut(n.attrs, 200));
    if (n.ops) extra.push('ops: ' + cut(n.ops, 200));
    if (n.num) extra.push('no. ' + n.num);
    if (n.badge) extra.push('level: ' + n.badge);
    if (n.hl) extra.push('highlighted');
    if (TREEP[n.id]) extra.push('child of ' + TREEP[n.id]);
    lines.push(
      '- ' +
        n.id +
        ' [' +
        n.t +
        ' / ' +
        T[n.t].n +
        '] ' +
        cut(n.label, 80) +
        (extra.length ? ' — ' + extra.join('; ') : ''),
    );
  });
  S.nodes.filter(isCont).forEach(function (c) {
    var inner = contents(c).map(function (o) {
      return o.id;
    });
    if (inner.length) lines.push('  ' + c.id + ' contains: ' + inner.join(', '));
  });
  lines.push('Edges:');
  S.edges.forEach(function (e) {
    lines.push(
      '- ' +
        (e.from || 'free end') +
        ' -> ' +
        (e.to || 'free end') +
        ' [' +
        e.type +
        (e.c1 ? ' ' + e.c1 + '/' + e.c2 : '') +
        ']' +
        (e.label ? ' "' + cut(e.label, 80) + '"' : ''),
    );
  });
  return lines.join('\n').slice(0, 40000);
}
export function reviewFocus(dt) {
  var k = dtKind(dt),
    ws = DT[dt].ws;
  if (k === 'fw')
    return (
      'This is a ' +
      DT[dt].n +
      ' framework. Check that every block is filled with specific, evidence-based points about this case (not generic filler), that each point sits in the right block by the framework’s definition (for example: SWOT strengths and weaknesses are internal, opportunities and threats are external; Five Forces levels match the evidence), that the blocks are consistent with each other, and that information-system proposals follow from the analysis.'
    );
  if (k === 'tree')
    return (
      'This is a ' +
      DT[dt].n +
      '. Check structure and naming: consistent levels, clear spans of control or grouping, no duplicate or ambiguous items, and anything important that is missing.'
    );
  if (ws === 'se')
    return (
      'This is a ' +
      DT[dt].n +
      ' diagram. Check notation and semantics strictly against UML / DFD / ERD rules (direction of relationships, include vs extend, guards on decisions, multiplicities, keys, balanced data flows, naming as verb + object) and flag missing elements.'
    );
  if (dt === 'bpmn')
    return 'This is a BPMN process. Flag modelling mistakes: sequence flows crossing pools, unlabelled gateway branches, missing start or end events, vague task names, and missing exception paths.';
  if (ws === 'ux')
    return (
      'This is a ' +
      DT[dt].n +
      '. Check that the user can reach the goal, that error and empty states exist, that decisions are explicit, and that labels are clear to a real user.'
    );
  return 'Review it for single points of failure, scaling bottlenecks, data consistency and ownership, security and auth gaps, and missing production pieces (caching, queues with retries and dead-letter queues, backups, observability, rate limits). For AI workflows also check guardrails, evals, tracing, loop limits, human approval, cost control and model fallback.';
}
export function runReview() {
  commitEdit();
  var cap = aiCap();
  if (!cap) {
    openModal('mLlm');
    return;
  }
  if (!S.nodes.length) {
    toast('Draw something first, then ask for a review');
    return;
  }
  if (reviewCtl) reviewCtl.abort();
  reviewCtl = new AbortController();
  var ctl = reviewCtl,
    dt = dtOf();
  set_findTargets([]);
  showFindings(
    'AI review',
    'brain',
    '<p class="fsum">AI is reviewing “' +
      esc(DOC.title) +
      '”… this takes up to a minute.</p><div class="acts"><button type="button" class="sbtn" id="revStop">Stop</button></div>',
  );
  var stop = $('revStop');
  if (stop)
    stop.onclick = function () {
      ctl.abort();
    };
  var prompt =
    'You are a demanding expert reviewer (principal engineer, systems analyst and business-IS lecturer). Diagram type: ' +
    DT[dt].n +
    ' (' +
    WS_BY[DT[dt].ws].n +
    '). Title: "' +
    DOC.title +
    '".\n\n' +
    diagramText() +
    '\n\n' +
    reviewFocus(dt) +
    ' Praise nothing; only list problems worth fixing.' +
    '\nReply with only JSON: {"summary":"one or two sentences","findings":[{"severity":"high|medium|low","title":"at most 8 words","detail":"1-2 sentences with the concrete fix","nodes":["node ids"]}]}\nAt most 8 findings, most important first. Use node ids exactly as listed. Write in English unless most labels use another language; then use that language.';
  cap
    .json(prompt, { signal: ctl.signal, cache: false })
    .then(function (d) {
      if (ctl.signal.aborted) return;
      var f = d && Array.isArray(d.findings) ? d.findings : [];
      set_findTargets([]);
      var html = d && d.summary ? '<p class="fsum">' + esc(String(d.summary)) + '</p>' : '';
      html += f
        .slice(0, 10)
        .map(function (x) {
          var sev = ['high', 'medium', 'low'].indexOf(x && x.severity) >= 0 ? x.severity : 'medium',
            ids = (Array.isArray(x.nodes) ? x.nodes : []).map(String).filter(function (id) {
              return byId(id);
            });
          return findItem(
            sev,
            sev,
            String(x.title || 'Finding'),
            String(x.detail || ''),
            ids.length ? { n: ids } : null,
          );
        })
        .join('');
      if (!f.length) html += '<p class="fok">No significant problems found.</p>';
      showFindings('AI review', 'brain', html);
    })
    .catch(function (e) {
      var m = sampleError(e, 'review');
      if (m) showFindings('AI review', 'brain', '<p class="fsum">' + esc(m) + '</p>');
      else $('findings').hidden = true;
    })
    .then(function () {
      if (reviewCtl === ctl) reviewCtl = null;
    });
}
