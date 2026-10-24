// ================= utilities =================
import type { Category, Diagram, Dict, EdgeType, ShapeType } from './types';
import { ICONS } from '../vendor/lucide-icons';
import { TREEF, isLife } from '../diagrams/catalog';
import {
  TREED,
  autosize,
  branchColor,
  compImg,
  computeTree,
  drawBox,
  drawC4,
  drawCell,
  drawDfd,
  drawDraw,
  drawEr,
  drawTree,
  drawUml,
  drawUx,
  drawWf,
  extraMarker,
  fitList,
  imgTag,
  onColor,
  tlist,
} from '../diagrams/draw';
import { syncUndoBtns } from './ui';

/** Element by id. Typed loosely: callers use input, select and SVG elements alike. */
export var $ = function (id: string): any {
  return document.getElementById(id);
};
export var NS = 'http://www.w3.org/2000/svg';
export function set_NS(v: typeof NS) {
  return (NS = v);
}
export var FONT_CLEAN = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
export function set_FONT_CLEAN(v: typeof FONT_CLEAN) {
  return (FONT_CLEAN = v);
}
export var FONT_SKETCH = 'Virgil, "Segoe Print", "Comic Sans MS", cursive';
export var FONT = FONT_CLEAN;
export function set_FONT(v: typeof FONT) {
  return (FONT = v);
}
export var mctx: CanvasRenderingContext2D;
export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
export function r1(v) {
  return Math.round(v * 10) / 10;
}
export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
export function setFont(fs, w) {
  mctx.font = (w || 400) + ' ' + fs + 'px ' + FONT;
}
export function textW(t, fs, w?) {
  setFont(fs || 12, w);
  return mctx.measureText(t).width;
}
export function wrapText(t, maxW, fs, w?) {
  setFont(fs || 12, w);
  var out = [];
  maxW = Math.max(20, maxW);
  String(t == null ? '' : t)
    .split('\n')
    .forEach(function (par) {
      var ws = par.split(/\s+/).filter(Boolean);
      if (!ws.length) {
        out.push('');
        return;
      }
      var line = '';
      ws.forEach(function (word) {
        if (mctx.measureText(word).width > maxW) {
          if (line) {
            out.push(line);
            line = '';
          }
          var chunk = '';
          for (var i = 0; i < word.length; i++) {
            var c = chunk + word[i];
            if (chunk && mctx.measureText(c).width > maxW) {
              out.push(chunk);
              chunk = word[i];
            } else chunk = c;
          }
          line = chunk;
          return;
        }
        var test = line ? line + ' ' + word : word;
        if (!line || mctx.measureText(test).width <= maxW) line = test;
        else {
          out.push(line);
          line = word;
        }
      });
      out.push(line);
    });
  while (out.length && out[out.length - 1] === '') out.pop();
  return out;
}
export function tblock(x, y, lines, o) {
  o = o || {};
  var fs = o.fs || 12,
    lh = o.lh || Math.round(fs * 1.28),
    anchor = o.anchor || 'middle';
  if (!lines.length) return '';
  var y0 = o.vcenter ? y - ((lines.length - 1) * lh) / 2 + fs * 0.35 : y + fs * 0.85;
  var s =
    '<text x="' +
    r1(x) +
    '" y="' +
    r1(y0) +
    '" font-size="' +
    fs +
    '" text-anchor="' +
    anchor +
    '" fill="' +
    (o.fill || TH.text) +
    '"' +
    (o.w ? ' font-weight="' + o.w + '"' : '') +
    (o.op ? ' fill-opacity="' + o.op + '"' : '') +
    (o.deco ? ' text-decoration="' + o.deco + '"' : '') +
    (o.ff ? ' font-family="' + esc(o.ff) + '"' : '') +
    (o.tr ? ' transform="' + o.tr + '"' : '') +
    (o.pe ? ' pointer-events="none"' : '') +
    '>';
  lines.forEach(function (l, i) {
    s += '<tspan x="' + r1(x) + '" dy="' + (i ? lh : 0) + '">' + esc(l) + '</tspan>';
  });
  return s + '</text>';
}
export function ic(name, cls?) {
  return (
    '<svg class="i' +
    (cls ? ' ' + cls : '') +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (ICONS[name] || '') +
    '</svg>'
  );
}
export function validColor(v) {
  return /^#[0-9a-f]{6}$/i.test(v || '');
}
// calm mode: hues are muted to neutrals so shape, stroke and label carry meaning; one accent stays
// full category colour by default; calm (muted) mode only when the person turned it on
export var CALM: boolean;
export function set_CALM(v: typeof CALM) {
  return (CALM = v);
}
export function lsGet0(k) {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
}
export function calmHex(h) {
  if (!CALM || !validColor(h)) return h;
  var r = parseInt(h.substr(1, 2), 16) / 255,
    g = parseInt(h.substr(3, 2), 16) / 255,
    b = parseInt(h.substr(5, 2), 16) / 255;
  var mx = Math.max(r, g, b),
    mn = Math.min(r, g, b),
    l = (mx + mn) / 2,
    d = mx - mn,
    hh = 0,
    ss = 0;
  if (d) {
    ss = d / (1 - Math.abs(2 * l - 1));
    if (mx === r) hh = ((g - b) / d) % 6;
    else if (mx === g) hh = (b - r) / d + 2;
    else hh = (r - g) / d + 4;
    hh *= 60;
    if (hh < 0) hh += 360;
  }
  ss = Math.min(ss, 1) * 0.1;
  hh = 190;
  var c = (1 - Math.abs(2 * l - 1)) * ss,
    x = c * (1 - Math.abs(((hh / 60) % 2) - 1)),
    m = l - c / 2,
    rgb = hh < 120 ? [0, x, c] : [0, x, c];
  function hx(v) {
    var t = Math.round((v + m) * 255);
    return (t < 16 ? '0' : '') + Math.max(0, Math.min(255, t)).toString(16);
  }
  return '#' + hx(rgb[0]) + hx(rgb[1]) + hx(rgb[2]);
}
export function lsGet(k) {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
}
export function lsSet(k, v) {
  try {
    localStorage.setItem(k, v);
    return true;
  } catch (e) {
    return false;
  }
}
export function lsDel(k) {
  try {
    localStorage.removeItem(k);
  } catch (e) {}
}
export function newId() {
  return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ================= canvas themes =================
export var THEMES = {
  light: {
    name: 'light',
    paper: '#ffffff',
    dot: '#cfd6e1',
    dotLg: '#bcc5d3',
    ink: '#1e1e1e',
    text: '#1e1e1e',
    muted: '#5a6474',
    sym: '#ffffff',
    card: '#ffffff',
    cardLine: '#d2d9e4',
    shape: '#ffffff',
    labelBg: '#ffffff',
    task: '#fff9db',
    gw: '#fff3bf',
    evStart: '#ebfbee',
    evInter: '#fff4e6',
    evEnd: '#fff5f5',
    poolHead: '#e7f5ff',
    lane: '#f8fbff',
    note: '#ffec99',
    noteFold: '#e8cf6a',
    noteText: '#3a3205',
    sel: '#0e6169',
    guide: '#3e959d',
    tileA: 0.12,
    zoneA: 0.05,
    shadow: '#0f172a',
    tileLine: '#d0d5dd',
    badge: '#f1f3f5',
    flow: '#8b929c',
  },
  dark: {
    name: 'dark',
    paper: '#0f1416',
    dot: '#262e3b',
    dotLg: '#323c4c',
    ink: '#c2cad7',
    text: '#e5eaf2',
    muted: '#9ba6b8',
    sym: '#141a22',
    card: '#192023',
    cardLine: '#2d3644',
    shape: '#141a22',
    labelBg: '#0d1117',
    task: '#2a2615',
    gw: '#2b2914',
    evStart: '#13301f',
    evInter: '#33290f',
    evEnd: '#3a1c1c',
    poolHead: '#1a2336',
    lane: '#141b28',
    note: '#4b4314',
    noteFold: '#665b1c',
    noteText: '#fff3c4',
    sel: '#6db5bb',
    guide: '#3e959d',
    tileA: 0.2,
    zoneA: 0.07,
    shadow: '#000000',
    tileLine: '#3a4448',
    badge: '#222a2e',
    flow: '#7d8794',
  },
};
export var TH = THEMES.light;
export function set_TH(v: typeof TH) {
  return (TH = v);
}

// ================= catalog =================
export var CAT: Dict<Category> = {
  client: { n: 'Clients', light: '#1971c2', dark: '#4dabf7' },
  edge: { n: 'Network & edge', light: '#3b5bdb', dark: '#748ffc' },
  compute: { n: 'Compute', light: '#099268', dark: '#38d9a9' },
  data: { n: 'Data & storage', light: '#e8590c', dark: '#ff922b' },
  msg: { n: 'Messaging & events', light: '#c2255c', dark: '#f783ac' },
  sec: { n: 'Security & identity', light: '#e03131', dark: '#ff8787' },
  ops: { n: 'Observability & ops', light: '#f08c00', dark: '#ffc078' },
  prod: { n: 'Reliability & scale', light: '#2f9e44', dark: '#69db7c' },
  ext: { n: 'External & business', light: '#495057', dark: '#adb5bd' },
  trigger: { n: 'Triggers', light: '#1098ad', dark: '#3bc9db' },
  logic: { n: 'Flow logic', light: '#5c636a', dark: '#ced4da' },
  agent: { n: 'Agents & orchestration', light: '#6741d9', dark: '#9775fa' },
  ai: { n: 'Models & prompts', light: '#5c940d', dark: '#a9e34b' },
  rag: { n: 'Knowledge & RAG', light: '#9c36b5', dark: '#da77f2' },
  mem: { n: 'Memory & state', light: '#364fc7', dark: '#91a7ff' },
  safe: { n: 'Safety & evaluation', light: '#d6336c', dark: '#faa2c1' },
};
export function catColor(c) {
  return calmHex((CAT[c] || CAT.ext)[TH.name]);
}
export var COMPS = [
  ['user', 'User', 'user', 'client'],
  ['users', 'User group', 'users', 'client'],
  ['web', 'Web app', 'app-window', 'client'],
  ['mobile', 'Mobile app', 'smartphone', 'client'],
  ['desktop', 'Desktop app', 'monitor', 'client'],
  ['iot', 'IoT device', 'radio', 'client'],
  ['tablet', 'Tablet / kiosk', 'tablet', 'client'],
  ['dns', 'DNS', 'globe', 'edge'],
  ['cdn', 'CDN', 'earth', 'edge'],
  ['lb', 'Load balancer', 'split', 'edge'],
  ['apigw', 'API gateway', 'waypoints', 'edge'],
  ['waf', 'Firewall / WAF', 'brick-wall', 'edge'],
  ['internet', 'Internet', 'cloud', 'edge'],
  ['vpn', 'VPN', 'lock-keyhole', 'edge'],
  ['net', 'Network', 'wifi', 'edge'],
  ['sat', 'Satellite link', 'satellite-dish', 'edge'],
  ['service', 'Service', 'box', 'compute'],
  ['server', 'Server', 'server', 'compute'],
  ['micro', 'Microservices', 'boxes', 'compute'],
  ['container', 'Container', 'container', 'compute'],
  ['k8s', 'Kubernetes', 'ship-wheel', 'compute'],
  ['function', 'Function', 'square-function', 'compute'],
  ['worker', 'Worker', 'cog', 'compute'],
  ['cron', 'Scheduler', 'calendar-clock', 'compute'],
  ['vm', 'Virtual machine', 'server-cog', 'compute'],
  ['cpu', 'Compute / GPU', 'cpu', 'compute'],
  ['sql', 'SQL database', 'database', 'data'],
  ['nosql', 'NoSQL store', 'database-zap', 'data'],
  ['cache', 'Cache', 'memory-stick', 'data'],
  ['storage', 'Object storage', 'archive', 'data'],
  ['search', 'Search index', 'search', 'data'],
  ['warehouse', 'Data warehouse', 'warehouse', 'data'],
  ['replica', 'Read replica', 'copy', 'data'],
  ['files', 'File store', 'folder', 'data'],
  ['backup', 'Backup', 'database-backup', 'data'],
  ['vector', 'Vector DB', 'chart-scatter', 'data'],
  ['tsdb', 'Time-series DB', 'chart-line', 'data'],
  ['table', 'Spreadsheet', 'table-2', 'data'],
  ['pipeline', 'Data pipeline', 'workflow', 'data'],
  ['queue', 'Message queue', 'inbox', 'msg'],
  ['topic', 'Pub/Sub topic', 'radio-tower', 'msg'],
  ['stream', 'Event stream', 'waves', 'msg'],
  ['event', 'Domain event', 'zap', 'msg'],
  ['webhook', 'Webhook', 'webhook', 'msg'],
  ['email', 'Email', 'mail', 'msg'],
  ['push', 'Push notification', 'bell', 'msg'],
  ['sms', 'SMS / chat', 'message-square', 'msg'],
  ['socket', 'WebSocket', 'plug-zap', 'msg'],
  ['auth', 'Auth service', 'key-round', 'sec'],
  ['idp', 'Identity provider', 'fingerprint', 'sec'],
  ['secrets', 'Secrets vault', 'lock', 'sec'],
  ['kms', 'Key management', 'key', 'sec'],
  ['ratelimit', 'Rate limiter', 'gauge', 'sec'],
  ['token', 'Token / JWT', 'badge-check', 'sec'],
  ['shield', 'Security scanner', 'shield-check', 'sec'],
  ['bastion', 'Bastion host', 'castle', 'sec'],
  ['monitor', 'Monitoring', 'activity', 'ops'],
  ['logs', 'Logging', 'scroll-text', 'ops'],
  ['metrics', 'Metrics', 'chart-column', 'ops'],
  ['alert', 'Alerting', 'bell-ring', 'ops'],
  ['audit', 'Audit log', 'file-clock', 'ops'],
  ['cicd', 'CI/CD', 'rocket', 'ops'],
  ['repo', 'Repository', 'git-branch', 'ops'],
  ['config', 'Config service', 'settings-2', 'ops'],
  ['autoscale', 'Autoscaler', 'trending-up', 'prod'],
  ['breaker', 'Circuit breaker', 'zap-off', 'prod'],
  ['retry', 'Retry policy', 'rotate-cw', 'prod'],
  ['flags', 'Feature flags', 'toggle-right', 'prod'],
  ['health', 'Health check', 'heart-pulse', 'prod'],
  ['mesh', 'Service mesh', 'share-2', 'prod'],
  ['dlq', 'Dead-letter queue', 'archive-x', 'prod'],
  ['outbox', 'Outbox', 'package-open', 'prod'],
  ['saga', 'Saga orchestrator', 'milestone', 'prod'],
  ['idem', 'Idempotency keys', 'hash', 'prod'],
  ['shard', 'Shard', 'grid-2x2', 'prod'],
  ['nat', 'NAT gateway', 'cloud-upload', 'prod'],
  ['dr', 'Disaster recovery', 'server-crash', 'prod'],
  ['extapi', 'External API', 'plug', 'ext'],
  ['payment', 'Payment gateway', 'credit-card', 'ext'],
  ['maps', 'Maps / geo', 'map-pin', 'ext'],
  ['bank', 'Bank', 'landmark', 'ext'],
  ['saas', 'SaaS', 'cloud-cog', 'ext'],
  ['analytics', 'Analytics', 'chart-pie', 'ext'],
  ['shop', 'Storefront', 'shopping-cart', 'ext'],
  ['logistics', 'Logistics', 'truck', 'ext'],
  ['org', 'Organization', 'building-2', 'ext'],
  ['t-manual', 'Manual trigger', 'mouse-pointer-click', 'trigger'],
  ['t-webhook', 'Webhook trigger', 'webhook', 'trigger'],
  ['t-schedule', 'Schedule trigger', 'alarm-clock', 'trigger'],
  ['t-chat', 'Chat trigger', 'message-circle', 'trigger'],
  ['t-form', 'Form trigger', 'clipboard-list', 'trigger'],
  ['t-email', 'Email trigger', 'mail-open', 'trigger'],
  ['t-app', 'App event trigger', 'bell-dot', 'trigger'],
  ['t-event', 'Queue / event trigger', 'zap', 'trigger'],
  ['t-error', 'Error trigger', 'circle-alert', 'trigger'],
  ['l-if', 'If', 'git-fork', 'logic'],
  ['l-switch', 'Switch', 'signpost', 'logic'],
  ['l-merge', 'Merge', 'merge', 'logic'],
  ['l-loop', 'Loop over items', 'repeat', 'logic'],
  ['l-wait', 'Wait', 'hourglass', 'logic'],
  ['l-code', 'Code', 'code-xml', 'logic'],
  ['l-set', 'Edit fields', 'sliders-horizontal', 'logic'],
  ['l-http', 'HTTP request', 'send', 'logic'],
  ['l-filter', 'Filter', 'filter', 'logic'],
  ['l-split', 'Split out', 'ungroup', 'logic'],
  ['l-agg', 'Aggregate', 'group', 'logic'],
  ['l-sub', 'Sub-workflow', 'workflow', 'logic'],
  ['l-retry', 'Retry / backoff', 'rotate-ccw', 'logic'],
  ['l-respond', 'Respond to webhook', 'arrow-left-right', 'logic'],
  ['a-agent', 'AI agent', 'bot', 'agent'],
  ['a-super', 'Supervisor', 'crown', 'agent'],
  ['a-planner', 'Planner', 'list-todo', 'agent'],
  ['a-research', 'Research agent', 'telescope', 'agent'],
  ['a-coder', 'Coding agent', 'square-terminal', 'agent'],
  ['a-writer', 'Writer agent', 'pen-line', 'agent'],
  ['a-critic', 'Critic / reviewer', 'scale', 'agent'],
  ['a-router', 'LLM router', 'route', 'agent'],
  ['a-handoff', 'Handoff', 'arrow-right-left', 'agent'],
  ['a-human', 'Human in the loop', 'user-check', 'agent'],
  ['a-tool', 'Tool', 'wrench', 'agent'],
  ['a-mcp', 'MCP server', 'plug-2', 'agent'],
  ['a-sandbox', 'Code sandbox', 'terminal', 'agent'],
  ['a-browser', 'Browser tool', 'globe', 'agent'],
  ['a-chatbot', 'Chat assistant', 'bot-message-square', 'agent'],
  ['llm', 'LLM', 'sparkles', 'ai'],
  ['chat', 'Chat model', 'message-square-text', 'ai'],
  ['embed', 'Embedding model', 'binary', 'ai'],
  ['prompt', 'Prompt template', 'text-quote', 'ai'],
  ['parser', 'Output parser', 'braces', 'ai'],
  ['model', 'ML model', 'brain-circuit', 'ai'],
  ['llmgw', 'LLM gateway', 'network', 'ai'],
  ['vision', 'Vision model', 'eye', 'ai'],
  ['speech', 'Speech / audio', 'audio-lines', 'ai'],
  ['translate', 'Translation', 'languages', 'ai'],
  ['loader', 'Document loader', 'file-down', 'rag'],
  ['splitter', 'Text splitter', 'scissors', 'rag'],
  ['retriever', 'Retriever', 'file-search', 'rag'],
  ['rerank', 'Reranker', 'arrow-down-wide-narrow', 'rag'],
  ['kb', 'Knowledge base', 'library', 'rag'],
  ['docs', 'Documents', 'book-open', 'rag'],
  ['hybrid', 'Hybrid search', 'search-check', 'rag'],
  ['state', 'Graph state', 'square-stack', 'mem'],
  ['checkpoint', 'Checkpointer', 'bookmark', 'mem'],
  ['stmem', 'Short-term memory', 'history', 'mem'],
  ['ltmem', 'Long-term memory', 'brain', 'mem'],
  ['pcache', 'Prompt / semantic cache', 'layers-3', 'mem'],
  ['guard', 'Guardrails', 'shield-half', 'safe'],
  ['pii', 'PII redaction', 'scan-eye', 'safe'],
  ['moderation', 'Moderation', 'shield-alert', 'safe'],
  ['eval', 'Evaluator', 'flask-conical', 'safe'],
  ['trace', 'Tracing', 'radar', 'safe'],
];
export var KW = {
  user: 'person actor customer',
  users: 'people actors team',
  web: 'browser frontend spa react next',
  mobile: 'android ios flutter app',
  desktop: 'electron pc',
  iot: 'sensor device embedded',
  dns: 'route53 domain',
  cdn: 'cloudflare cloudfront akamai edge',
  lb: 'nginx haproxy elb alb load balancer',
  apigw: 'kong api gateway apigee',
  waf: 'firewall waf',
  internet: 'web public',
  vpn: 'tunnel wireguard',
  net: 'lan network wifi',
  service: 'api backend app microservice',
  server: 'host ec2 machine',
  micro: 'services',
  container: 'docker',
  k8s: 'kubernetes pod cluster',
  function: 'lambda serverless cloud function faas',
  worker: 'job consumer background',
  cron: 'cron job scheduler timer',
  vm: 'virtual machine compute engine',
  cpu: 'gpu compute',
  sql: 'postgres postgresql mysql mariadb rdbms relational',
  nosql: 'mongodb dynamodb cassandra firestore document key value',
  cache: 'redis memcached',
  storage: 's3 blob gcs bucket minio',
  search: 'elasticsearch opensearch solr meilisearch',
  warehouse: 'bigquery snowflake redshift olap',
  replica: 'read replica follower',
  files: 'nfs file share',
  backup: 'snapshot backup restore',
  vector: 'pinecone pgvector qdrant embeddings',
  tsdb: 'influxdb timescale prometheus',
  table: 'excel sheets csv',
  queue: 'sqs rabbitmq bullmq celery',
  topic: 'sns pubsub fanout',
  stream: 'kafka kinesis pulsar redpanda events',
  webhook: 'callback http hook',
  email: 'sendgrid ses smtp mail',
  push: 'fcm apns notification',
  sms: 'twilio whatsapp chat',
  socket: 'websocket realtime ws socket.io',
  auth: 'oauth login jwt session',
  idp: 'okta auth0 keycloak sso cognito',
  secrets: 'vault kms secrets',
  ratelimit: 'throttle rate limit',
  token: 'jwt token',
  shield: 'security scan',
  monitor: 'prometheus grafana datadog apm',
  logs: 'elk loki logging',
  metrics: 'statsd metrics dashboard',
  alert: 'pagerduty alertmanager oncall',
  cicd: 'github actions jenkins deploy pipeline',
  repo: 'git github gitlab',
  llm: 'gpt claude gemini ai',
  model: 'ml inference training',
  agent: 'bot ai agent',
  pipeline: 'etl airflow dbt spark',
  extapi: 'third party api',
  payment: 'stripe midtrans xendit paypal',
  maps: 'google maps location gps',
  bank: 'bank finance',
  saas: 'saas cloud',
  analytics: 'mixpanel ga analytics',
  shop: 'ecommerce store cart',
  logistics: 'shipping courier delivery',
  org: 'company business',
};
export var ZONES: any[][] = [
  ['region', 'Region', 'globe', 'edge', 0],
  ['vpc', 'VPC / network', 'network', 'edge', 0],
  ['az', 'Availability zone', 'layers', 'compute', 1],
  ['subnet', 'Subnet', 'lock-keyhole', 'compute', 1],
  ['cluster', 'Cluster', 'ship-wheel', 'compute', 0],
  ['boundary', 'Trust boundary', 'shield', 'sec', 1],
  ['onprem', 'On-premises', 'factory', 'ext', 0],
  ['env', 'Environment', 'flag', 'prod', 0],
  ['tenant', 'Tenant', 'building', 'ext', 1],
  ['team', 'Agent team', 'users-round', 'agent', 1],
  ['subgraph', 'Subgraph', 'blocks', 'agent', 0],
  ['toolset', 'Toolset', 'wrench', 'agent', 1],
  ['workflow', 'Workflow', 'workflow', 'trigger', 0],
  ['sandbox', 'Sandbox', 'square-dashed', 'sec', 1],
  ['zgroup', 'Group', 'layout-grid', 'client', 1],
];
export var SHAPES = [
  ['process', 'Process'],
  ['terminal', 'Start / end'],
  ['decision', 'Decision'],
  ['io', 'Input / output'],
  ['db', 'Database'],
  ['doc', 'Document'],
  ['predef', 'Predefined process'],
  ['prep', 'Preparation'],
  ['manual', 'Manual operation'],
  ['ellipse', 'Ellipse'],
  ['connector', 'Connector'],
  ['lgstart', 'START (graph)'],
  ['lgend', 'END (graph)'],
  ['note', 'Sticky note'],
];

export var T: Dict<ShapeType> = {
  start: { f: 'ev', k: 'start', sym: '', n: 'Start' },
  'start-msg': { f: 'ev', k: 'start', sym: 'msg', n: 'Start message' },
  'start-timer': { f: 'ev', k: 'start', sym: 'timer', n: 'Start timer' },
  'start-signal': { f: 'ev', k: 'start', sym: 'signal', n: 'Start signal' },
  inter: { f: 'ev', k: 'inter', sym: '', n: 'Intermediate' },
  'inter-msg': { f: 'ev', k: 'inter', sym: 'msg', n: 'Message catch' },
  'inter-msg-throw': { f: 'ev', k: 'inter', sym: 'msg', thr: 1, n: 'Message throw' },
  'inter-timer': { f: 'ev', k: 'inter', sym: 'timer', n: 'Timer' },
  'inter-signal': { f: 'ev', k: 'inter', sym: 'signal', n: 'Signal catch' },
  'inter-signal-throw': { f: 'ev', k: 'inter', sym: 'signal', thr: 1, n: 'Signal throw' },
  'inter-error': { f: 'ev', k: 'inter', sym: 'error', n: 'Error (boundary)' },
  end: { f: 'ev', k: 'end', sym: '', n: 'End' },
  'end-msg': { f: 'ev', k: 'end', sym: 'msg', thr: 1, n: 'End message' },
  'end-signal': { f: 'ev', k: 'end', sym: 'signal', thr: 1, n: 'End signal' },
  'end-error': { f: 'ev', k: 'end', sym: 'error', thr: 1, n: 'End error' },
  'end-term': { f: 'ev', k: 'end', sym: 'term', thr: 1, n: 'Terminate' },
  task: { f: 'task', n: 'Task' },
  'task-user': { f: 'task', mk: 'user', n: 'User task' },
  'task-manual': { f: 'task', mk: 'manual', n: 'Manual task' },
  'task-service': { f: 'task', mk: 'service', n: 'Service task' },
  'task-send': { f: 'task', mk: 'send', n: 'Send task' },
  'task-receive': { f: 'task', mk: 'receive', n: 'Receive task' },
  'task-rule': { f: 'task', mk: 'rule', n: 'Business rule' },
  'task-script': { f: 'task', mk: 'script', n: 'Script task' },
  subprocess: { f: 'task', sub: 1, n: 'Sub-process' },
  transaction: { f: 'task', sub: 1, dbl: 1, n: 'Transaction' },
  evsub: { f: 'task', dash: 1, n: 'Event sub-process' },
  call: { f: 'task', thick: 1, n: 'Call activity' },
  'gw-xor': { f: 'gw', g: 'xor', n: 'XOR (exclusive)' },
  'gw-and': { f: 'gw', g: 'and', n: 'AND (parallel)' },
  'gw-or': { f: 'gw', g: 'or', n: 'OR (inclusive)' },
  'gw-event': { f: 'gw', g: 'event', n: 'Event-based' },
  'gw-complex': { f: 'gw', g: 'complex', n: 'Complex' },
  'data-obj': { f: 'data', n: 'Data object' },
  'data-in': { f: 'data', io: 'in', n: 'Data input' },
  'data-out': { f: 'data', io: 'out', n: 'Data output' },
  'data-store': { f: 'data', store: 1, n: 'Data store' },
  pool: { f: 'pool', n: 'Pool' },
  group: { f: 'group', n: 'Group' },
  annotation: { f: 'ann', n: 'Text annotation' },
  text: { f: 'text', n: 'Free text' },
};
export var FAM_LABEL: Record<string, string> = {
  ev: 'Event',
  task: 'Activity',
  gw: 'Gateway',
  data: 'Data',
  pool: 'Pool',
  group: 'Group',
  ann: 'Annotation',
  text: 'Text',
  comp: 'Component',
  zone: 'Zone',
  shape: 'Shape',
  note: 'Sticky note',
};
export var BPMN_FAM = { ev: 1, task: 1, gw: 1, data: 1, pool: 1, group: 1, ann: 1 };
export function fam(n) {
  return (T[n.t] || ({} as ShapeType)).f;
}
export function size(t) {
  var d = T[t],
    f = d.f;
  if (d.sz) return d.sz.slice();
  if (f === 'ev') return [36, 36];
  if (f === 'task') return [120, 60];
  if (f === 'gw') return [46, 46];
  if (t === 'data-store') return [52, 46];
  if (f === 'data') return [36, 48];
  if (f === 'group') return [260, 160];
  if (f === 'ann') return [150, 50];
  if (f === 'text') return [140, 30];
  if (f === 'comp') return [168, 64];
  if (f === 'zone') return [420, 260];
  if (f === 'note') return [170, 120];
  if (f === 'shape') {
    var k = d.k;
    return k === 'decision'
      ? [130, 84]
      : k === 'terminal'
        ? [140, 52]
        : k === 'ellipse'
          ? [120, 72]
          : k === 'connector'
            ? [40, 40]
            : k === 'lgstart' || k === 'lgend'
              ? [104, 40]
              : k === 'io' || k === 'prep'
                ? [150, 64]
                : [140, 64];
  }
  return [800, 240];
}
export var RESIZABLE: Record<string, number> = {
  task: 1,
  pool: 1,
  group: 1,
  ann: 1,
  text: 1,
  comp: 1,
  zone: 1,
  shape: 1,
  note: 1,
};
export var CONTAINER: Record<string, number> = { pool: 1, zone: 1 };
export var EDGE: Dict<EdgeType> = {
  sync: { n: 'Request (sync)', end: 'arr', g: 'System' },
  async: { n: 'Async / event', end: 'arr', dash: '6 4', g: 'System' },
  bi: { n: 'Two-way', end: 'arr', start: 'arr', g: 'System' },
  line: { n: 'Plain line', g: 'System' },
  route: { n: 'Conditional route', end: 'arr', dash: '5 4', g: 'AI & workflow' },
  route2: { n: 'Delegate & return', end: 'arr', start: 'arr', dash: '5 4', g: 'AI & workflow' },
  tool: { n: 'Tool call', end: 'arr', start: 'arr', dash: '1.5 4', g: 'AI & workflow' },
  stream: { n: 'Stream', end: 'arr', dash: '12 3 2 3', g: 'AI & workflow' },
  seq: { n: 'Sequence flow', end: 'arr', g: 'BPMN' },
  msg: { n: 'Message flow', dash: '7 4', start: 'circ', end: 'arro', g: 'BPMN' },
  def: { n: 'Default flow', end: 'arr', start: 'slash', g: 'BPMN' },
  cond: { n: 'Conditional flow', end: 'arr', start: 'dia', g: 'BPMN' },
  data: { n: 'Data association', dash: '2 4', end: 'open', g: 'BPMN' },
  assoc: { n: 'Association', dash: '2 4', g: 'BPMN' },
};
export var FLOWING = {
  sync: 1,
  async: 1,
  bi: 1,
  route: 1,
  route2: 1,
  tool: 1,
  stream: 1,
  seq: 1,
  msg: 1,
  data: 1,
  def: 1,
  cond: 1,
};

// ================= state =================
export var S: Diagram = { nodes: [], edges: [], seq: 1 };
export function set_S(v: typeof S) {
  return (S = v);
}
export var selN: string[] = [];
export function set_selN(v: typeof selN) {
  return (selN = v);
}
export var selE = null;
export function set_selE(v: typeof selE) {
  return (selE = v);
}
export var undo: string[] = [];
export function set_undo(v: typeof undo) {
  return (undo = v);
}
export var redo: string[] = [];
export function set_redo(v: typeof redo) {
  return (redo = v);
}
export var cam = { x: -40, y: -40, z: 1 };
export function set_cam(v: typeof cam) {
  return (cam = v);
}
export var grid = true;
export function set_grid(v: typeof grid) {
  return (grid = v);
}
export var autoConn = true;
export function set_autoConn(v: typeof autoConn) {
  return (autoConn = v);
}
export var animate = false;
export function set_animate(v: typeof animate) {
  return (animate = v);
}
export var showMini = true;
export function set_showMini(v: typeof showMini) {
  return (showMini = v);
}
export var tool = 'select';
export function set_tool(v: typeof tool) {
  return (tool = v);
}
export var connSrc = null;
export function set_connSrc(v: typeof connSrc) {
  return (connSrc = v);
}
export var hoverId = null;
export function set_hoverId(v: typeof hoverId) {
  return (hoverId = v);
}
export var exporting = false;
export function set_exporting(v: typeof exporting) {
  return (exporting = v);
}
export function nid() {
  return 'n' + S.seq++;
}
export function byId(id) {
  for (var i = 0; i < S.nodes.length; i++) if (S.nodes[i].id === id) return S.nodes[i];
  return null;
}
export function eById(id) {
  for (var i = 0; i < S.edges.length; i++) if (S.edges[i].id === id) return S.edges[i];
  return null;
}
export function snap(v) {
  return grid ? Math.round(v / 10) * 10 : Math.round(v);
}
export function snapshot() {
  return JSON.stringify(S);
}
export function pushUndo() {
  undo.push(snapshot());
  if (undo.length > 150) undo.shift();
  redo = [];
  syncUndoBtns();
}

// ================= geometry =================
export function poolH(p) {
  if (p.lanes && p.lanes.length) {
    var s = 0;
    p.lanes.forEach(function (l) {
      s += l.h;
    });
    return s;
  }
  return p.h;
}
export function syncPool(p) {
  if (p.lanes && p.lanes.length) p.h = poolH(p);
}
export function center(n) {
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}
export function inside(n, p) {
  var c = center(n);
  return c.x > p.x && c.x < p.x + p.w && c.y > p.y && c.y < p.y + p.h;
}
export function poolOf(n) {
  if (fam(n) === 'pool') return n;
  for (var i = S.nodes.length - 1; i >= 0; i--) {
    var p = S.nodes[i];
    if (p.t === 'pool' && inside(n, p)) return p;
  }
  return null;
}
export function contents(c) {
  var f = fam(c),
    area = c.w * c.h;
  return S.nodes.filter(function (o) {
    if (o === c) return false;
    if (f === 'pool') return fam(o) !== 'pool' && inside(o, c);
    return inside(o, c) && o.w * o.h < area;
  });
}
export function sides(n) {
  var c = center(n);
  return {
    R: { x: n.x + n.w, y: c.y },
    L: { x: n.x, y: c.y },
    T: { x: c.x, y: n.y },
    B: { x: c.x, y: n.y + n.h },
    c: c,
  };
}
export function shapeKind(n) {
  var f = fam(n),
    k = (T[n.t] || ({} as ShapeType)).k;
  if (
    f === 'ev' ||
    k === 'ellipse' ||
    k === 'connector' ||
    k === 'usecase' ||
    k === 'act-initial' ||
    k === 'act-final' ||
    k === 'act-flowfinal' ||
    k === 'attr' ||
    k === 'key' ||
    k === 'multi' ||
    k === 'derived' ||
    k === 'proc' ||
    (f === 'cell' && n.shape === 'circle') ||
    (f === 'wf' && k === 'avatar')
  )
    return 'ellipse';
  if (f === 'gw' || k === 'decision' || k === 'act-decision' || k === 'choice' || k === 'rel' || k === 'idrel')
    return 'diamond';
  return 'rect';
}
export function borderPoint(n, p) {
  var c = center(n),
    dx = p.x - c.x,
    dy = p.y - c.y,
    rx = Math.max(1, n.w / 2),
    ry = Math.max(1, n.h / 2),
    k = shapeKind(n),
    scale;
  if (!dx && !dy) dx = 1;
  if (k === 'ellipse') scale = 1 / Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
  else if (k === 'diamond') scale = 1 / (Math.abs(dx) / rx + Math.abs(dy) / ry);
  else scale = 1 / Math.max(Math.abs(dx) / rx, Math.abs(dy) / ry);
  return { x: c.x + dx * scale, y: c.y + dy * scale };
}
export function edgePoint(e, start) {
  var n = byId(start ? e.from : e.to),
    a = start ? e.fromAnchor : e.toAnchor,
    free = start ? e.start : e.end;
  if (n) {
    if (a) return { x: n.x + n.w * a.x, y: n.y + n.h * a.y };
    var other = byId(start ? e.to : e.from),
      target = other ? center(other) : start ? e.end : e.start;
    return borderPoint(n, target || { x: n.x + n.w + 100, y: n.y + n.h / 2 });
  }
  return free && isFinite(free.x) && isFinite(free.y) ? { x: free.x, y: free.y } : null;
}
export function setEdgePoint__base(e, start, p, node) {
  var key = start ? 'from' : 'to',
    free = start ? 'start' : 'end',
    anchor = start ? 'fromAnchor' : 'toAnchor';
  if (node && isLife(node)) {
    e[key] = node.id;
    e[anchor] = { x: 0.5, y: clamp((p.y - node.y) / node.h, 0.1, 0.995) };
    delete e[free];
    return;
  }
  if (node) {
    var b = borderPoint(node, p);
    e[key] = node.id;
    e[anchor] = { x: (b.x - node.x) / node.w, y: (b.y - node.y) / node.h };
    delete e[free];
  } else {
    e[key] = null;
    e[free] = { x: snap(p.x), y: snap(p.y) };
    delete e[anchor];
  }
}
export var setEdgePoint: typeof setEdgePoint__base = setEdgePoint__base;
export function set_setEdgePoint(v: typeof setEdgePoint__base) {
  return (setEdgePoint = v);
}
export function route__base(e) {
  var a = byId(e.from),
    b = byId(e.to);
  if (e.start || e.end || e.fromAnchor || e.toAnchor || !a || !b) {
    var p1 = edgePoint(e, true),
      p2 = edgePoint(e, false);
    if (!p1 || !p2) return null;
    if (e.route === 'straight' || e.route === 'curve') return [p1, p2];
    var horizontal = e.my == null && (e.mx != null || Math.abs(p2.x - p1.x) >= Math.abs(p2.y - p1.y));
    if (horizontal) {
      var mx = e.mx != null ? e.mx : (p1.x + p2.x) / 2;
      return [p1, { x: mx, y: p1.y }, { x: mx, y: p2.y }, p2];
    }
    var my = e.my != null ? e.my : (p1.y + p2.y) / 2;
    return [p1, { x: p1.x, y: my }, { x: p2.x, y: my }, p2];
  }
  var A = sides(a),
    B = sides(b),
    dx = B.c.x - A.c.x,
    dy = B.c.y - A.c.y,
    q1,
    q2;
  var horiz = e.dir === 'h' || (e.dir !== 'v' && Math.abs(dx) >= Math.abs(dy));
  if (e.route === 'straight' || e.route === 'curve') {
    if (horiz) {
      q1 = dx >= 0 ? A.R : A.L;
      q2 = dx >= 0 ? B.L : B.R;
    } else {
      q1 = dy >= 0 ? A.B : A.T;
      q2 = dy >= 0 ? B.T : B.B;
    }
    return [q1, q2];
  }
  if (!e.dir && fam(a) === 'gw' && b.x > A.c.x + 10 && Math.abs(dy) > 15 && e.mx == null && e.my == null) {
    q1 = dy < 0 ? A.T : A.B;
    q2 = B.L;
    return [q1, { x: q1.x, y: q2.y }, q2];
  }
  if (!e.dir && fam(b) === 'gw' && B.c.x > a.x + a.w && Math.abs(dy) > 15 && e.mx == null && e.my == null) {
    q1 = A.R;
    q2 = dy > 0 ? B.T : B.B;
    return [q1, { x: q2.x, y: q1.y }, q2];
  }
  if (horiz) {
    q1 = dx >= 0 ? A.R : A.L;
    q2 = dx >= 0 ? B.L : B.R;
    if (Math.abs(q1.y - q2.y) < 7 && e.mx == null) return [q1, { x: q2.x, y: q1.y }];
    var mx2 = e.mx != null ? e.mx : (q1.x + q2.x) / 2;
    return [q1, { x: mx2, y: q1.y }, { x: mx2, y: q2.y }, q2];
  } else {
    q1 = dy >= 0 ? A.B : A.T;
    q2 = dy >= 0 ? B.T : B.B;
    if (Math.abs(q1.x - q2.x) < 7 && e.my == null) return [q1, { x: q1.x, y: q2.y }];
    var my2 = e.my != null ? e.my : (q1.y + q2.y) / 2;
    return [q1, { x: q1.x, y: my2 }, { x: q2.x, y: my2 }, q2];
  }
}
export var route: typeof route__base = route__base;
export function set_route(v: typeof route__base) {
  return (route = v);
}
export function pathD(pts, rad) {
  var d = 'M' + r1(pts[0].x) + ' ' + r1(pts[0].y);
  if (!rad || pts.length < 3) {
    for (var i = 1; i < pts.length; i++) d += ' L' + r1(pts[i].x) + ' ' + r1(pts[i].y);
    return d;
  }
  for (var j = 1; j < pts.length - 1; j++) {
    var p = pts[j - 1],
      c = pts[j],
      n = pts[j + 1],
      l1 = Math.hypot(c.x - p.x, c.y - p.y),
      l2 = Math.hypot(n.x - c.x, n.y - c.y),
      rr = Math.min(rad, l1 / 2, l2 / 2);
    if (rr < 0.5 || !l1 || !l2) {
      d += ' L' + r1(c.x) + ' ' + r1(c.y);
      continue;
    }
    var ax = c.x + ((p.x - c.x) * rr) / l1,
      ay = c.y + ((p.y - c.y) * rr) / l1,
      bx = c.x + ((n.x - c.x) * rr) / l2,
      by = c.y + ((n.y - c.y) * rr) / l2;
    d += ' L' + r1(ax) + ' ' + r1(ay) + ' Q' + r1(c.x) + ' ' + r1(c.y) + ' ' + r1(bx) + ' ' + r1(by);
  }
  var last = pts[pts.length - 1];
  return d + ' L' + r1(last.x) + ' ' + r1(last.y);
}
export function endNormal(e, start, p, q) {
  var n = byId(start ? e.from : e.to);
  var v = n
    ? { x: (p.x - (n.x + n.w / 2)) / Math.max(1, n.w), y: (p.y - (n.y + n.h / 2)) / Math.max(1, n.h) }
    : { x: q.x - p.x, y: q.y - p.y };
  if (Math.abs(v.x) >= Math.abs(v.y)) return { x: v.x >= 0 ? 1 : -1, y: 0 };
  return { x: 0, y: v.y >= 0 ? 1 : -1 };
}
export function curveCtrl(e, pts) {
  var p1 = pts[0],
    p2 = pts[pts.length - 1],
    n1 = endNormal(e, true, p1, p2),
    n2 = endNormal(e, false, p2, p1),
    d = Math.max(40, Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.4);
  return [p1, { x: p1.x + n1.x * d, y: p1.y + n1.y * d }, { x: p2.x + n2.x * d, y: p2.y + n2.y * d }, p2];
}
export function edgeD__base(e, pts) {
  if (e.route === 'curve') {
    var c = curveCtrl(e, pts);
    return (
      'M' +
      r1(c[0].x) +
      ' ' +
      r1(c[0].y) +
      ' C' +
      r1(c[1].x) +
      ' ' +
      r1(c[1].y) +
      ' ' +
      r1(c[2].x) +
      ' ' +
      r1(c[2].y) +
      ' ' +
      r1(c[3].x) +
      ' ' +
      r1(c[3].y)
    );
  }
  return pathD(pts, e.route === 'straight' ? 0 : 9);
}
export var edgeD: typeof edgeD__base = edgeD__base;
export function set_edgeD(v: typeof edgeD__base) {
  return (edgeD = v);
}
export function along(pts, f) {
  var L = 0,
    seg = [];
  for (var i = 1; i < pts.length; i++) {
    var d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    seg.push(d);
    L += d;
  }
  var t = L * f;
  for (i = 1; i < pts.length; i++) {
    if (t <= seg[i - 1] || i === pts.length - 1) {
      var r = seg[i - 1] ? Math.min(1, t / seg[i - 1]) : 0;
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * r, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * r };
    }
    t -= seg[i - 1];
  }
  return pts[0];
}
export function labelPoint__base(e, pts) {
  if (e.route === 'curve') {
    var c = curveCtrl(e, pts);
    return { x: (c[0].x + 3 * c[1].x + 3 * c[2].x + c[3].x) / 8, y: (c[0].y + 3 * c[1].y + 3 * c[2].y + c[3].y) / 8 };
  }
  var a = byId(e.from);
  return along(pts, a && fam(a) === 'gw' ? 0.35 : 0.5);
}
export var labelPoint: typeof labelPoint__base = labelPoint__base;
export function set_labelPoint(v: typeof labelPoint__base) {
  return (labelPoint = v);
}

// ================= markers =================
export var mUsed = {};
export function set_mUsed(v: typeof mUsed) {
  return (mUsed = v);
}
export function mref(kind, col, w) {
  var key = kind + '-' + col.slice(1).toLowerCase() + '-' + Math.round(w * 10);
  mUsed[key] = [kind, col, w];
  return 'url(#m-' + key + ')';
}
export function markerDefs() {
  var s = '';
  Object.keys(mUsed).forEach(function (k) {
    var m = mUsed[k],
      kind = m[0],
      c = m[1],
      sc = 1 + (m[2] - 1.5) * 0.3,
      id = ' id="m-' + k + '" markerUnits="userSpaceOnUse"';
    if (kind === 'arr')
      s +=
        '<marker' +
        id +
        ' viewBox="0 0 10 10" refX="9" refY="5" markerWidth="' +
        r1(11 * sc) +
        '" markerHeight="' +
        r1(11 * sc) +
        '" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' +
        c +
        '"/></marker>';
    else if (kind === 'arro')
      s +=
        '<marker' +
        id +
        ' viewBox="0 0 10 10" refX="9" refY="5" markerWidth="' +
        r1(12 * sc) +
        '" markerHeight="' +
        r1(12 * sc) +
        '" orient="auto"><path d="M1,1 L9,5 L1,9 z" fill="' +
        TH.paper +
        '" stroke="' +
        c +
        '" stroke-width="1"/></marker>';
    else if (kind === 'open')
      s +=
        '<marker' +
        id +
        ' viewBox="0 0 10 10" refX="9" refY="5" markerWidth="' +
        r1(11 * sc) +
        '" markerHeight="' +
        r1(11 * sc) +
        '" orient="auto"><path d="M1,1 L9,5 L1,9" fill="none" stroke="' +
        c +
        '" stroke-width="1.3"/></marker>';
    else if (kind === 'circ')
      s +=
        '<marker' +
        id +
        ' viewBox="0 0 10 10" refX="5" refY="5" markerWidth="' +
        r1(9 * sc) +
        '" markerHeight="' +
        r1(9 * sc) +
        '" orient="auto"><circle cx="5" cy="5" r="3.6" fill="' +
        TH.paper +
        '" stroke="' +
        c +
        '" stroke-width="1.1"/></marker>';
    else if (kind === 'dia')
      s +=
        '<marker' +
        id +
        ' viewBox="0 0 16 10" refX="1" refY="5" markerWidth="' +
        r1(16 * sc) +
        '" markerHeight="' +
        r1(10 * sc) +
        '" orient="auto"><path d="M1,5 L8,1 L15,5 L8,9 z" fill="' +
        TH.paper +
        '" stroke="' +
        c +
        '" stroke-width="1"/></marker>';
    else if (
      kind !== 'arr' &&
      kind !== 'arro' &&
      kind !== 'open' &&
      kind !== 'circ' &&
      kind !== 'dia' &&
      kind !== 'slash'
    )
      s += extraMarker(kind, c, sc, id);
    else if (kind === 'slash')
      s +=
        '<marker' +
        id +
        ' viewBox="0 0 20 12" refX="0" refY="6" markerWidth="' +
        r1(17 * sc) +
        '" markerHeight="' +
        r1(10 * sc) +
        '" orient="auto"><path d="M8,11 L13,1" fill="none" stroke="' +
        c +
        '" stroke-width="1.4"/></marker>';
  });
  return s;
}

// ================= drawing: BPMN (ported) =================
export function envelope(cx, cy, s, filled) {
  var w = s * 2,
    h = s * 1.4,
    x = cx - s,
    y = cy - s * 0.7;
  return (
    '<rect x="' +
    r1(x) +
    '" y="' +
    r1(y) +
    '" width="' +
    r1(w) +
    '" height="' +
    r1(h) +
    '" fill="' +
    (filled ? TH.ink : TH.sym) +
    '" stroke="' +
    TH.ink +
    '" stroke-width="1.1"/><path d="M' +
    r1(x) +
    ' ' +
    r1(y) +
    ' L' +
    r1(cx) +
    ' ' +
    r1(y + h * 0.55) +
    ' L' +
    r1(x + w) +
    ' ' +
    r1(y) +
    '" fill="none" stroke="' +
    (filled ? TH.sym : TH.ink) +
    '" stroke-width="1.1"/>'
  );
}
export function drawEvent(n) {
  var d = T[n.t],
    cx = n.x + n.w / 2,
    cy = n.y + n.h / 2,
    r = Math.min(n.w, n.h) / 2,
    s = '',
    I = TH.ink;
  var fill = d.k === 'start' ? TH.evStart : d.k === 'inter' ? TH.evInter : TH.evEnd;
  s +=
    '<circle cx="' +
    cx +
    '" cy="' +
    cy +
    '" r="' +
    r +
    '" fill="' +
    fill +
    '" stroke="' +
    I +
    '" stroke-width="' +
    (d.k === 'end' ? 3.5 : 1.6) +
    '"/>';
  if (d.k === 'inter')
    s +=
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 4) + '" fill="none" stroke="' + I + '" stroke-width="1.2"/>';
  var q = r * 0.5,
    thr = !!d.thr,
    sf = thr ? I : TH.sym;
  if (d.sym === 'msg') s += envelope(cx, cy, q, thr);
  else if (d.sym === 'timer') {
    var tr = r * 0.58;
    s +=
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r1(tr) +
      '" fill="' +
      TH.sym +
      '" stroke="' +
      I +
      '" stroke-width="1.1"/><path d="M' +
      cx +
      ' ' +
      r1(cy - tr * 0.75) +
      ' L' +
      cx +
      ' ' +
      cy +
      ' L' +
      r1(cx + tr * 0.55) +
      ' ' +
      r1(cy + tr * 0.2) +
      '" fill="none" stroke="' +
      I +
      '" stroke-width="1.2"/>';
  } else if (d.sym === 'signal')
    s +=
      '<path d="M' +
      cx +
      ' ' +
      r1(cy - q * 1.05) +
      ' L' +
      r1(cx + q * 0.95) +
      ' ' +
      r1(cy + q * 0.65) +
      ' L' +
      r1(cx - q * 0.95) +
      ' ' +
      r1(cy + q * 0.65) +
      ' Z" fill="' +
      sf +
      '" stroke="' +
      I +
      '" stroke-width="1.1"/>';
  else if (d.sym === 'error')
    s +=
      '<path d="M' +
      r1(cx - q * 0.8) +
      ' ' +
      r1(cy + q * 0.8) +
      ' L' +
      r1(cx - q * 0.35) +
      ' ' +
      r1(cy - q * 0.7) +
      ' L' +
      r1(cx + q * 0.1) +
      ' ' +
      r1(cy + q * 0.15) +
      ' L' +
      r1(cx + q * 0.8) +
      ' ' +
      r1(cy - q * 0.8) +
      ' L' +
      r1(cx + q * 0.35) +
      ' ' +
      r1(cy + q * 0.7) +
      ' L' +
      r1(cx - q * 0.1) +
      ' ' +
      r1(cy - q * 0.15) +
      ' Z" fill="' +
      sf +
      '" stroke="' +
      I +
      '" stroke-width="1.1" stroke-linejoin="round"/>';
  else if (d.sym === 'term') s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r1(r * 0.55) + '" fill="' + I + '"/>';
  return s;
}
export function drawGw(n) {
  var d = T[n.t],
    cx = n.x + n.w / 2,
    cy = n.y + n.h / 2,
    r = Math.min(n.w, n.h) / 2,
    s = '',
    I = TH.ink;
  s +=
    '<path d="M' +
    cx +
    ' ' +
    n.y +
    ' L' +
    (n.x + n.w) +
    ' ' +
    cy +
    ' L' +
    cx +
    ' ' +
    (n.y + n.h) +
    ' L' +
    n.x +
    ' ' +
    cy +
    ' Z" fill="' +
    TH.gw +
    '" stroke="' +
    I +
    '" stroke-width="1.6" stroke-linejoin="round"/>';
  var k = r * 0.36,
    st = ' stroke="' + I + '" stroke-linecap="round" fill="none"';
  if (d.g === 'xor')
    s +=
      '<path d="M' +
      r1(cx - k) +
      ' ' +
      r1(cy - k) +
      ' L' +
      r1(cx + k) +
      ' ' +
      r1(cy + k) +
      ' M' +
      r1(cx + k) +
      ' ' +
      r1(cy - k) +
      ' L' +
      r1(cx - k) +
      ' ' +
      r1(cy + k) +
      '"' +
      st +
      ' stroke-width="3.2"/>';
  else if (d.g === 'and')
    s +=
      '<path d="M' +
      cx +
      ' ' +
      r1(cy - k * 1.3) +
      ' V' +
      r1(cy + k * 1.3) +
      ' M' +
      r1(cx - k * 1.3) +
      ' ' +
      cy +
      ' H' +
      r1(cx + k * 1.3) +
      '"' +
      st +
      ' stroke-width="3.4"/>';
  else if (d.g === 'or')
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r1(r * 0.42) + '"' + st + ' stroke-width="2.8"/>';
  else if (d.g === 'event') {
    s +=
      '<circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r1(r * 0.5) +
      '"' +
      st +
      ' stroke-width="1"/><circle cx="' +
      cx +
      '" cy="' +
      cy +
      '" r="' +
      r1(r * 0.42) +
      '"' +
      st +
      ' stroke-width="1"/>';
    var pr = r * 0.24,
      pp = [];
    for (var i = 0; i < 5; i++) {
      var a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      pp.push(r1(cx + pr * Math.cos(a)) + ' ' + r1(cy + pr * Math.sin(a)));
    }
    s += '<path d="M' + pp.join(' L') + ' Z"' + st + ' stroke-width="1.1"/>';
  } else if (d.g === 'complex')
    s +=
      '<path d="M' +
      cx +
      ' ' +
      r1(cy - k * 1.3) +
      ' V' +
      r1(cy + k * 1.3) +
      ' M' +
      r1(cx - k * 1.3) +
      ' ' +
      cy +
      ' H' +
      r1(cx + k * 1.3) +
      ' M' +
      r1(cx - k) +
      ' ' +
      r1(cy - k) +
      ' L' +
      r1(cx + k) +
      ' ' +
      r1(cy + k) +
      ' M' +
      r1(cx + k) +
      ' ' +
      r1(cy - k) +
      ' L' +
      r1(cx - k) +
      ' ' +
      r1(cy + k) +
      '"' +
      st +
      ' stroke-width="2.6"/>';
  return s;
}
export function taskMarker(mk, x, y) {
  var I = TH.ink,
    W = TH.sym,
    st = ' stroke="' + I + '" stroke-width="1.1"';
  if (mk === 'user')
    return (
      '<circle cx="' +
      (x + 9) +
      '" cy="' +
      (y + 6) +
      '" r="3.6" fill="' +
      W +
      '"' +
      st +
      '/><path d="M' +
      (x + 2) +
      ' ' +
      (y + 18) +
      ' Q' +
      (x + 2) +
      ' ' +
      (y + 10) +
      ' ' +
      (x + 9) +
      ' ' +
      (y + 10) +
      ' Q' +
      (x + 16) +
      ' ' +
      (y + 10) +
      ' ' +
      (x + 16) +
      ' ' +
      (y + 18) +
      ' Z" fill="' +
      W +
      '"' +
      st +
      '/>'
    );
  if (mk === 'manual')
    return (
      '<path d="M' +
      (x + 2) +
      ' ' +
      (y + 6) +
      ' h9 M' +
      (x + 2) +
      ' ' +
      (y + 9) +
      ' h14 M' +
      (x + 2) +
      ' ' +
      (y + 12) +
      ' h13 M' +
      (x + 2) +
      ' ' +
      (y + 15) +
      ' h10 M' +
      (x + 1) +
      ' ' +
      (y + 4) +
      ' v13" fill="none"' +
      st +
      '/>'
    );
  if (mk === 'service')
    return (
      '<circle cx="' +
      (x + 9) +
      '" cy="' +
      (y + 9) +
      '" r="6" fill="none" stroke="' +
      I +
      '" stroke-width="3.2" stroke-dasharray="2.4 1.8"/><circle cx="' +
      (x + 9) +
      '" cy="' +
      (y + 9) +
      '" r="2.2" fill="' +
      W +
      '"' +
      st +
      '/>'
    );
  if (mk === 'send') return envelope(x + 9, y + 9, 7, true);
  if (mk === 'receive') return envelope(x + 9, y + 9, 7, false);
  if (mk === 'rule')
    return (
      '<rect x="' +
      (x + 1) +
      '" y="' +
      (y + 3) +
      '" width="17" height="13" fill="' +
      W +
      '"' +
      st +
      '/><path d="M' +
      (x + 1) +
      ' ' +
      (y + 7) +
      ' h17 M' +
      (x + 6) +
      ' ' +
      (y + 7) +
      ' v9 M' +
      (x + 1) +
      ' ' +
      (y + 11.5) +
      ' h17" fill="none"' +
      st +
      '/>'
    );
  if (mk === 'script')
    return (
      '<path d="M' +
      (x + 4) +
      ' ' +
      (y + 2) +
      ' h12 q-4 7 0 15 h-12 q4 -7 0 -15 z" fill="' +
      W +
      '"' +
      st +
      '/><path d="M' +
      (x + 6) +
      ' ' +
      (y + 6) +
      ' h6 M' +
      (x + 6) +
      ' ' +
      (y + 9.5) +
      ' h6 M' +
      (x + 6) +
      ' ' +
      (y + 13) +
      ' h6" fill="none"' +
      st +
      '/>'
    );
  return '';
}
export function drawTask(n, noLabel) {
  var d = T[n.t],
    s = '',
    I = TH.ink;
  s +=
    '<rect x="' +
    n.x +
    '" y="' +
    n.y +
    '" width="' +
    n.w +
    '" height="' +
    n.h +
    '" rx="10" fill="' +
    TH.task +
    '" stroke="' +
    I +
    '" stroke-width="' +
    (d.thick ? 3.5 : 1.5) +
    '"' +
    (d.dash ? ' stroke-dasharray="5 3"' : '') +
    '/>';
  if (d.dbl)
    s +=
      '<rect x="' +
      (n.x + 4) +
      '" y="' +
      (n.y + 4) +
      '" width="' +
      (n.w - 8) +
      '" height="' +
      (n.h - 8) +
      '" rx="7" fill="none" stroke="' +
      I +
      '" stroke-width="1.2"/>';
  if (d.mk) s += taskMarker(d.mk, n.x + 6, n.y + 5);
  if (d.sub) {
    var bx = n.x + n.w / 2 - 7,
      by = n.y + n.h - 17;
    s +=
      '<rect x="' +
      bx +
      '" y="' +
      by +
      '" width="14" height="14" fill="' +
      TH.sym +
      '" stroke="' +
      I +
      '" stroke-width="1.1"/><path d="M' +
      (bx + 7) +
      ' ' +
      (by + 3) +
      ' v8 M' +
      (bx + 3) +
      ' ' +
      (by + 7) +
      ' h8" stroke="' +
      I +
      '" stroke-width="1.3"/>';
  }
  if (!noLabel) {
    var lines = wrapText(n.label, n.w - 14, 12),
      cy = n.y + n.h / 2 - (d.sub ? 6 : 0);
    s += tblock(n.x + n.w / 2, cy, lines, { vcenter: 1 });
  }
  return s;
}
export function drawData(n) {
  var d = T[n.t],
    s = '',
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    st = ' stroke="' + TH.ink + '" stroke-width="1.3"',
    W = TH.sym;
  if (d.store) {
    var ry = 7;
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
      W +
      '"' +
      st +
      '/>';
    s +=
      '<ellipse cx="' +
      (x + w / 2) +
      '" cy="' +
      (y + ry) +
      '" rx="' +
      w / 2 +
      '" ry="' +
      ry +
      '" fill="' +
      W +
      '"' +
      st +
      '/>';
    s +=
      '<path d="M' +
      x +
      ' ' +
      (y + ry + 6) +
      ' A' +
      w / 2 +
      ' ' +
      ry +
      ' 0 0 0 ' +
      (x + w) +
      ' ' +
      (y + ry + 6) +
      '" fill="none"' +
      st +
      '/>';
    return s;
  }
  var f = 10;
  s +=
    '<path d="M' +
    x +
    ' ' +
    y +
    ' H' +
    (x + w - f) +
    ' L' +
    (x + w) +
    ' ' +
    (y + f) +
    ' V' +
    (y + h) +
    ' H' +
    x +
    ' Z" fill="' +
    W +
    '"' +
    st +
    '/><path d="M' +
    (x + w - f) +
    ' ' +
    y +
    ' V' +
    (y + f) +
    ' H' +
    (x + w) +
    '" fill="none"' +
    st +
    '/>';
  if (d.io) {
    var ax = x + 4,
      ay = y + 6;
    s +=
      '<path d="M' +
      ax +
      ' ' +
      (ay + 3) +
      ' h6 v-3 l6 5 l-6 5 v-3 h-6 z" fill="' +
      (d.io === 'out' ? TH.ink : W) +
      '" stroke="' +
      TH.ink +
      '" stroke-width="1"/>';
  }
  return s;
}
export function drawPool(n, noLabel) {
  var s = '',
    st = ' stroke="' + TH.ink + '" stroke-width="1.5"',
    HD = 30,
    LH = 24;
  syncPool(n);
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
    (validColor(n.fill) ? n.fill : TH.shape) +
    '"' +
    st +
    '/>';
  s +=
    '<rect x="' +
    n.x +
    '" y="' +
    n.y +
    '" width="' +
    HD +
    '" height="' +
    n.h +
    '" fill="' +
    (validColor(n.headerFill) ? n.headerFill : TH.poolHead) +
    '"' +
    st +
    '/>';
  if (!noLabel)
    s += tblock(0, 0, [n.label || ''], {
      w: 700,
      vcenter: 1,
      fs: 12,
      tr: 'translate(' + (n.x + HD / 2) + ' ' + (n.y + n.h / 2) + ') rotate(-90)',
    });
  var y = n.y;
  (n.lanes || []).forEach(function (l, i) {
    if (validColor(l.fill))
      s +=
        '<rect x="' +
        (n.x + HD) +
        '" y="' +
        y +
        '" width="' +
        (n.w - HD) +
        '" height="' +
        l.h +
        '" fill="' +
        l.fill +
        '"/>';
    s +=
      '<rect data-lane="' +
      i +
      '" x="' +
      (n.x + HD) +
      '" y="' +
      y +
      '" width="' +
      LH +
      '" height="' +
      l.h +
      '" fill="' +
      (validColor(l.fill) ? l.fill : validColor(n.laneFill) ? n.laneFill : TH.lane) +
      '"' +
      st +
      '/>';
    if (i) s += '<line x1="' + (n.x + HD) + '" y1="' + y + '" x2="' + (n.x + n.w) + '" y2="' + y + '"' + st + '/>';
    if (!noLabel)
      s += tblock(0, 0, [l.name || ''], {
        vcenter: 1,
        fs: 11,
        pe: 1,
        tr: 'translate(' + (n.x + HD + LH / 2) + ' ' + (y + l.h / 2) + ') rotate(-90)',
      });
    y += l.h;
  });
  return s;
}
export function paintMarkup(s, o) {
  if (!o.fill && !o.stroke && !o.textColor) return s;
  var g = document.createElementNS(NS, 'g');
  g.innerHTML = s;
  var f = fam(o);
  g.querySelectorAll('rect,path,circle,ellipse,line,polygon,polyline').forEach(function (el, i) {
    var fill = el.getAttribute('fill'),
      stroke = el.getAttribute('stroke');
    if (validColor(o.stroke)) {
      if (stroke === TH.ink) el.setAttribute('stroke', o.stroke);
      if (fill === TH.ink) el.setAttribute('fill', o.stroke);
    }
    if (f !== 'pool' && validColor(o.fill)) {
      if (i === 0 || (['ev', 'task', 'gw', 'data'].indexOf(f) >= 0 && fill === TH.sym)) el.setAttribute('fill', o.fill);
    }
  });
  if (validColor(o.textColor))
    g.querySelectorAll('text').forEach(function (el) {
      el.setAttribute('fill', o.textColor);
    });
  return g.innerHTML;
}

// ================= drawing: system components, zones, shapes =================
export function iconG(name, x, y, sc, color, sw) {
  return (
    '<g transform="translate(' +
    r1(x) +
    ' ' +
    r1(y) +
    ') scale(' +
    r1(sc * 100) / 100 +
    ')" fill="none" stroke="' +
    color +
    '" stroke-width="' +
    (sw || 2) +
    '" stroke-linecap="round" stroke-linejoin="round">' +
    (ICONS[name] || ICONS.box) +
    '</g>'
  );
}
export function dPath(x, y, w, h, rl, rr) {
  rl = Math.min(rl, h / 2, w / 2);
  rr = Math.min(rr, h / 2, w / 2);
  return (
    'M' +
    r1(x + rl) +
    ' ' +
    y +
    ' H' +
    r1(x + w - rr) +
    ' Q' +
    (x + w) +
    ' ' +
    y +
    ' ' +
    (x + w) +
    ' ' +
    r1(y + rr) +
    ' V' +
    r1(y + h - rr) +
    ' Q' +
    (x + w) +
    ' ' +
    (y + h) +
    ' ' +
    r1(x + w - rr) +
    ' ' +
    (y + h) +
    ' H' +
    r1(x + rl) +
    ' A' +
    r1(rl) +
    ' ' +
    r1(rl) +
    ' 0 0 1 ' +
    x +
    ' ' +
    r1(y + h - rl) +
    ' V' +
    r1(y + rl) +
    ' A' +
    r1(rl) +
    ' ' +
    r1(rl) +
    ' 0 0 1 ' +
    r1(x + rl) +
    ' ' +
    y +
    ' Z'
  );
}
export function drawComp(n, noLabel) {
  var d = T[n.t],
    acc = validColor(n.stroke) ? n.stroke : catColor(d.cat),
    icon = n.icon || d.icon,
    tc = validColor(n.textColor) ? n.textColor : TH.text,
    bg = validColor(n.fill) ? n.fill : TH.card,
    s = '';
  if (n.look === 'tile') {
    var r = Math.min(n.w, n.h),
      rad = Math.round(r * 0.26),
      cx = n.x + n.w / 2,
      cy = n.y + n.h / 2,
      sc = r / 40;
    var shp =
      d.cat === 'trigger'
        ? '<path d="' + dPath(n.x, n.y, n.w, n.h, n.h / 2, rad) + '"'
        : '<rect x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" rx="' + rad + '"';
    s += shp + ' fill="' + bg + '"/>';
    s +=
      shp +
      ' fill="' +
      acc +
      '" fill-opacity="' +
      (compImg(n) ? 0.03 : TH.tileA) +
      '" stroke="' +
      acc +
      '" stroke-opacity=".55" stroke-width="1.4"/>';
    var im = compImg(n);
    if (im) s += imgTag(im, n.x + r * 0.2, n.y + r * 0.2, n.w - r * 0.4, n.h - r * 0.4);
    else s += iconG(icon, cx - 12 * sc, cy - 12 * sc, sc, acc, 1.7);
    if (!noLabel) {
      var ll = wrapText(n.label, Math.max(120, n.w + 50), 12, 600),
        yy = n.y + n.h + 5;
      s += tblock(cx, yy, ll, { fs: 12, w: 600, fill: tc });
      if (n.sub) {
        var sl = wrapText(n.sub, Math.max(120, n.w + 50), 11);
        s += tblock(cx, yy + ll.length * 15 + 1, sl, {
          fs: 11,
          fill: validColor(n.textColor) ? n.textColor : TH.muted,
        });
      }
    }
    return s;
  }
  var ts = Math.max(20, Math.min(40, n.h - 20)),
    tx = n.x + 12,
    ty = n.y + (n.h - ts) / 2;
  s +=
    '<rect x="' +
    n.x +
    '" y="' +
    n.y +
    '" width="' +
    n.w +
    '" height="' +
    n.h +
    '" rx="12" fill="' +
    bg +
    '" stroke="' +
    (validColor(n.stroke) ? acc : TH.cardLine) +
    '" stroke-width="1.2"/>';
  s +=
    '<rect x="' +
    tx +
    '" y="' +
    r1(ty) +
    '" width="' +
    ts +
    '" height="' +
    ts +
    '" rx="' +
    Math.round(ts * 0.25) +
    '" fill="' +
    acc +
    '" fill-opacity="' +
    (compImg(n) ? 0.04 : TH.tileA) +
    '"/>';
  var isc = ts / 40,
    im2 = compImg(n);
  if (im2) s += imgTag(im2, tx + 3, ty + 3, ts - 6, ts - 6);
  else s += iconG(icon, tx + ts / 2 - 12 * isc, ty + ts / 2 - 12 * isc, isc, acc, 2);
  if (!noLabel) {
    var x0 = tx + ts + 11,
      maxW = n.x + n.w - 10 - x0,
      L = wrapText(n.label, maxW, 13, 600),
      Sb = n.sub ? wrapText(n.sub, maxW, 11) : [];
    if (L.length > 3) L = L.slice(0, 3);
    if (Sb.length > 2) Sb = Sb.slice(0, 2);
    var hL = L.length * 16,
      hS = Sb.length ? Sb.length * 14 + 2 : 0,
      top = n.y + n.h / 2 - (hL + hS) / 2;
    s += tblock(x0, top, L, { fs: 13, lh: 16, w: 600, anchor: 'start', fill: tc });
    if (Sb.length)
      s += tblock(x0, top + hL + 2, Sb, {
        fs: 11,
        lh: 14,
        anchor: 'start',
        fill: validColor(n.textColor) ? n.textColor : TH.muted,
      });
  }
  return s;
}
export function drawZone(n, noLabel) {
  var d = T[n.t],
    c = validColor(n.stroke) ? n.stroke : catColor(d.cat),
    hasFill = validColor(n.fill),
    s = '';
  s +=
    '<rect x="' +
    n.x +
    '" y="' +
    n.y +
    '" width="' +
    n.w +
    '" height="' +
    n.h +
    '" rx="16" fill="' +
    (hasFill ? n.fill : c) +
    '" fill-opacity="' +
    (hasFill ? 1 : TH.zoneA) +
    '" stroke="' +
    c +
    '" stroke-opacity=".75" stroke-width="1.4"' +
    (d.dash ? ' stroke-dasharray="7 5"' : '') +
    '/>';
  s += iconG(n.icon || d.icon, n.x + 14, n.y + 11, 0.667, c, 2.2);
  if (!noLabel) {
    var ln = wrapText(n.label || d.n, Math.max(60, n.w - 50), 12, 600).slice(0, 1);
    s += tblock(n.x + 36, n.y + 11, ln, {
      fs: 12,
      w: 600,
      anchor: 'start',
      fill: validColor(n.textColor) ? n.textColor : c,
    });
  }
  return s;
}
export function drawShape__base(n, noLabel) {
  var k = T[n.t].k,
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    f = validColor(n.fill) ? n.fill : TH.shape,
    st = validColor(n.stroke) ? n.stroke : TH.ink,
    s = '';
  var a = ' fill="' + f + '" stroke="' + st + '" stroke-width="1.6" stroke-linejoin="round"',
    sk = Math.min(20, w * 0.15),
    tw = w - 20;
  if (k === 'process') s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4"' + a + '/>';
  else if (k === 'terminal')
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + h / 2 + '"' + a + '/>';
  else if (k === 'decision') {
    s +=
      '<path d="M' +
      (x + w / 2) +
      ' ' +
      y +
      ' L' +
      (x + w) +
      ' ' +
      (y + h / 2) +
      ' L' +
      (x + w / 2) +
      ' ' +
      (y + h) +
      ' L' +
      x +
      ' ' +
      (y + h / 2) +
      ' Z"' +
      a +
      '/>';
    tw = w * 0.58;
  } else if (k === 'io') {
    s +=
      '<path d="M' +
      (x + sk) +
      ' ' +
      y +
      ' H' +
      (x + w) +
      ' L' +
      (x + w - sk) +
      ' ' +
      (y + h) +
      ' H' +
      x +
      ' Z"' +
      a +
      '/>';
    tw = w - 2 * sk - 10;
  } else if (k === 'db') {
    var ry = Math.min(10, h * 0.16);
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
      '"' +
      a +
      '/><ellipse cx="' +
      (x + w / 2) +
      '" cy="' +
      (y + ry) +
      '" rx="' +
      w / 2 +
      '" ry="' +
      ry +
      '"' +
      a +
      '/>';
  } else if (k === 'doc')
    s +=
      '<path d="M' +
      x +
      ' ' +
      y +
      ' H' +
      (x + w) +
      ' V' +
      (y + h - 8) +
      ' Q' +
      (x + w * 0.75) +
      ' ' +
      (y + h - 18) +
      ' ' +
      (x + w / 2) +
      ' ' +
      (y + h - 8) +
      ' T' +
      x +
      ' ' +
      (y + h - 8) +
      ' Z"' +
      a +
      '/>';
  else if (k === 'predef') {
    s +=
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '"' +
      a +
      '/><path d="M' +
      (x + 10) +
      ' ' +
      y +
      ' V' +
      (y + h) +
      ' M' +
      (x + w - 10) +
      ' ' +
      y +
      ' V' +
      (y + h) +
      '" fill="none" stroke="' +
      st +
      '" stroke-width="1.4"/>';
    tw = w - 30;
  } else if (k === 'prep') {
    s +=
      '<path d="M' +
      (x + sk) +
      ' ' +
      y +
      ' H' +
      (x + w - sk) +
      ' L' +
      (x + w) +
      ' ' +
      (y + h / 2) +
      ' L' +
      (x + w - sk) +
      ' ' +
      (y + h) +
      ' H' +
      (x + sk) +
      ' L' +
      x +
      ' ' +
      (y + h / 2) +
      ' Z"' +
      a +
      '/>';
    tw = w - 2 * sk - 8;
  } else if (k === 'manual') {
    s +=
      '<path d="M' +
      x +
      ' ' +
      y +
      ' H' +
      (x + w) +
      ' L' +
      (x + w - sk) +
      ' ' +
      (y + h) +
      ' H' +
      (x + sk) +
      ' Z"' +
      a +
      '/>';
    tw = w - 2 * sk - 8;
  } else if (k === 'ellipse') {
    s += '<ellipse cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" rx="' + w / 2 + '" ry="' + h / 2 + '"' + a + '/>';
    tw = w * 0.72;
  } else if (k === 'connector') {
    s += '<ellipse cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" rx="' + w / 2 + '" ry="' + h / 2 + '"' + a + '/>';
    tw = w - 6;
  } else if (k === 'lgstart' || k === 'lgend') {
    var pf = validColor(n.fill) ? n.fill : TH.ink;
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
      h / 2 +
      '" fill="' +
      pf +
      '" stroke="' +
      (validColor(n.stroke) ? n.stroke : pf) +
      '" stroke-width="1.6"/>';
    if (k === 'lgstart')
      s +=
        '<path d="M' +
        (x + 16) +
        ' ' +
        (y + h / 2 - 5) +
        ' L' +
        (x + 24) +
        ' ' +
        (y + h / 2) +
        ' L' +
        (x + 16) +
        ' ' +
        (y + h / 2 + 5) +
        ' Z" fill="' +
        TH.paper +
        '"/>';
    else
      s +=
        '<rect x="' +
        (x + 15) +
        '" y="' +
        (y + h / 2 - 4.5) +
        '" width="9" height="9" rx="1.5" fill="' +
        TH.paper +
        '"/>';
    if (!noLabel)
      s += tblock(x + w / 2 + 8, y + h / 2, [n.label || (k === 'lgstart' ? 'START' : 'END')], {
        fs: 12,
        w: 700,
        vcenter: 1,
        fill: validColor(n.textColor) ? n.textColor : TH.paper,
      });
    return s;
  }
  if (!noLabel && n.label) {
    var ty = k === 'db' ? y + h / 2 + 4 : k === 'doc' ? y + h / 2 - 4 : y + h / 2;
    s += tblock(x + w / 2, ty, wrapText(n.label, tw, 13), {
      fs: 13,
      vcenter: 1,
      fill: validColor(n.textColor) ? n.textColor : TH.text,
    });
  }
  return s;
}
export var drawShape: typeof drawShape__base = drawShape__base;
export function set_drawShape(v: typeof drawShape__base) {
  return (drawShape = v);
}
export function drawNote(n, noLabel) {
  var pre = (T[n.t] || ({} as ShapeType)).fill,
    f = validColor(n.fill) ? n.fill : pre || TH.note,
    x = n.x,
    y = n.y,
    w = n.w,
    h = n.h,
    fo = 16,
    s = '',
    fold = pre || validColor(n.fill) ? '#000000' : TH.noteFold;
  s +=
    '<path d="M' +
    x +
    ' ' +
    y +
    ' H' +
    (x + w) +
    ' V' +
    (y + h - fo) +
    ' L' +
    (x + w - fo) +
    ' ' +
    (y + h) +
    ' H' +
    x +
    ' Z" fill="' +
    f +
    '" stroke="' +
    (validColor(n.stroke) ? n.stroke : fold) +
    '" stroke-opacity="' +
    (fold === '#000000' ? 0.14 : 1) +
    '" stroke-width="1"/>';
  s +=
    '<path d="M' +
    (x + w) +
    ' ' +
    (y + h - fo) +
    ' H' +
    (x + w - fo) +
    ' V' +
    (y + h) +
    ' Z" fill="' +
    fold +
    '" fill-opacity="' +
    (fold === '#000000' ? 0.12 : 1) +
    '"/>';
  if (!noLabel && n.label) {
    var fl = fitList(n.label, w - 24, h - 24, true);
    s += tlist(x + 12, y + 12, fl.L, {
      fs: fl.fs + 1,
      lh: fl.lh + 1,
      fill: validColor(n.textColor) ? n.textColor : pre || validColor(n.fill) ? onColor(f) : TH.noteText,
    });
  }
  return s;
}
export function drawNode__base(n, noLabel?) {
  var f = fam(n),
    s = '',
    below = false;
  if (f === 'comp') return drawComp(n, noLabel);
  if (f === 'zone') return drawZone(n, noLabel);
  if (f === 'shape') return drawShape(n, noLabel);
  if (f === 'note') return drawNote(n, noLabel);
  if (f === 'cell') return drawCell(n, noLabel);
  if (TREEF[f]) return drawTree(n, noLabel);
  if (f === 'uml') return drawUml(n, noLabel);
  if (f === 'box') return drawBox(n, noLabel);
  if (f === 'er') return drawEr(n, noLabel);
  if (f === 'dfd') return drawDfd(n, noLabel);
  if (f === 'c4') return drawC4(n, noLabel);
  if (f === 'ux') return drawUx(n, noLabel);
  if (f === 'wf') return drawWf(n, noLabel);
  if (f === 'draw') return drawDraw(n);
  if (f === 'ev') {
    s = drawEvent(n);
    below = true;
  } else if (f === 'gw') {
    s = drawGw(n);
    below = true;
  } else if (f === 'task') s = drawTask(n, noLabel);
  else if (f === 'data') {
    s = drawData(n);
    below = true;
  } else if (f === 'pool') s = drawPool(n, noLabel);
  else if (f === 'group') {
    s =
      '<rect x="' +
      n.x +
      '" y="' +
      n.y +
      '" width="' +
      n.w +
      '" height="' +
      n.h +
      '" rx="10" fill="none" stroke="' +
      TH.ink +
      '" stroke-width="1.5" stroke-dasharray="8 4 2 4"/><rect x="' +
      n.x +
      '" y="' +
      n.y +
      '" width="' +
      n.w +
      '" height="14" fill="transparent"/>';
    if (!noLabel) s += tblock(n.x + 10, n.y + 6, wrapText(n.label, n.w - 20, 12), { anchor: 'start' });
  } else if (f === 'ann') {
    s =
      '<rect x="' +
      n.x +
      '" y="' +
      n.y +
      '" width="' +
      n.w +
      '" height="' +
      n.h +
      '" fill="transparent"/><path d="M' +
      (n.x + 14) +
      ' ' +
      n.y +
      ' H' +
      n.x +
      ' V' +
      (n.y + n.h) +
      ' H' +
      (n.x + 14) +
      '" fill="none" stroke="' +
      TH.ink +
      '" stroke-width="1.4"/>';
    if (!noLabel) s += tblock(n.x + 8, n.y + n.h / 2, wrapText(n.label, n.w - 12, 12), { anchor: 'start', vcenter: 1 });
  } else if (f === 'text') {
    var tfs = n.fs || 13,
      tcx = n.x + n.w / 2,
      tcy = n.y + n.h / 2,
      left = n.align === 'left';
    s = '<rect x="' + n.x + '" y="' + n.y + '" width="' + n.w + '" height="' + n.h + '" fill="transparent"/>';
    if (!noLabel)
      s += tblock(left ? n.x + 3 : tcx, tcy, wrapText(n.label, (n.rot ? n.h : n.w) - 6, tfs, n.bold ? 700 : 400), {
        vcenter: 1,
        fs: tfs,
        lh: Math.round(tfs * 1.28),
        w: n.bold ? 700 : 0,
        anchor: left ? 'start' : 'middle',
        fill: n.muted ? TH.muted : undefined,
        tr: n.rot ? 'rotate(' + n.rot + ' ' + r1(tcx) + ' ' + r1(tcy) + ')' : '',
      });
  }
  if (below && !noLabel && n.label)
    s += tblock(n.x + n.w / 2, n.y + n.h + 3, wrapText(n.label, Math.max(110, n.w + 40), 11), { fs: 11 });
  return paintMarkup(s, n);
}
export var drawNode: typeof drawNode__base = drawNode__base;
export function set_drawNode(v: typeof drawNode__base) {
  return (drawNode = v);
}
export function drawEdge__base(e) {
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
  var s =
    '<g data-eid="' +
    e.id +
    '"><path d="' +
    d +
    '" fill="none" stroke="transparent" stroke-width="16"/><path d="' +
    d +
    '"' +
    at +
    '/>';
  if (animate && !exporting && FLOWING[e.type])
    s +=
      '<path class="flowdot" d="' +
      d +
      '" fill="none" stroke="' +
      (validColor(e.stroke) ? e.stroke : TH.sel) +
      '" stroke-width="' +
      (w + 2.2) +
      '" stroke-linecap="round"/>';
  if (e.label) {
    var p = labelPoint(e, pts),
      lines = wrapText(e.label, 170, 11),
      lw = 0;
    lines.forEach(function (l) {
      lw = Math.max(lw, textW(l, 11));
    });
    var h = lines.length * 14 + 4;
    if (k.above) {
      var vert = Math.abs(pts[pts.length - 1].x - pts[0].x) < Math.abs(pts[pts.length - 1].y - pts[0].y);
      if (!vert) p = { x: p.x, y: p.y - h / 2 - 4 };
    }
    s +=
      '<rect x="' +
      r1(p.x - lw / 2 - 6) +
      '" y="' +
      r1(p.y - h / 2) +
      '" width="' +
      r1(lw + 12) +
      '" height="' +
      h +
      '" rx="' +
      Math.min(9, h / 2) +
      '" fill="' +
      TH.labelBg +
      '" fill-opacity=".94"/>' +
      tblock(p.x, p.y, lines, { fs: 11, lh: 14, vcenter: 1, fill: validColor(e.textColor) ? e.textColor : TH.text });
  }
  return s + '</g>';
}
export var drawEdge: typeof drawEdge__base = drawEdge__base;
export function set_drawEdge(v: typeof drawEdge__base) {
  return (drawEdge = v);
}
export function drawAll__base(nodes, edges) {
  computeTree();
  nodes.forEach(autosize);
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
  edges.forEach(function (e) {
    s += drawEdge(e);
  });
  others.forEach(function (n) {
    s += '<g data-id="' + n.id + '">' + drawNode(n) + '</g>';
  });
  return s;
}
export var drawAll: typeof drawAll__base = drawAll__base;
export function set_drawAll(v: typeof drawAll__base) {
  return (drawAll = v);
}
export function defaultFill(n) {
  var f = fam(n);
  return f === 'task'
    ? TH.task
    : f === 'gw'
      ? TH.gw
      : f === 'ev'
        ? T[n.t].k === 'start'
          ? TH.evStart
          : T[n.t].k === 'end'
            ? TH.evEnd
            : TH.evInter
        : f === 'note'
          ? (T[n.t] || ({} as ShapeType)).fill || TH.note
          : f === 'comp' || f === 'cell' || f === 'org' || f === 'page'
            ? TH.card
            : TH.shape;
}

export function install(): void {
  mctx = document.createElement('canvas').getContext('2d');
  CALM = lsGet0('rancang:calm') === '1';
  (function () {
    var k = {
      't-manual': 'n8n click run test',
      't-webhook': 'n8n http endpoint inbound',
      't-schedule': 'n8n cron interval',
      't-chat': 'n8n chat message langchain',
      't-form': 'n8n form submission',
      't-email': 'imap inbox gmail',
      't-app': 'slack github notion app',
      't-event': 'kafka sqs rabbitmq consumer',
      't-error': 'n8n failure',
      'l-if': 'n8n condition branch true false',
      'l-switch': 'n8n route branch case',
      'l-merge': 'n8n join combine',
      'l-loop': 'n8n split in batches iterate',
      'l-wait': 'n8n delay pause sleep',
      'l-code': 'n8n javascript python function',
      'l-set': 'n8n set transform map',
      'l-http': 'n8n rest api call fetch',
      'l-filter': 'n8n',
      'l-split': 'n8n items array',
      'l-agg': 'n8n combine reduce',
      'l-sub': 'n8n execute workflow',
      'l-retry': 'backoff',
      'l-respond': 'n8n reply response',
      'a-agent': 'langchain langgraph react agent tools',
      'a-super': 'langgraph supervisor orchestrator manager multi-agent crew',
      'a-planner': 'plan and execute',
      'a-research': 'search web researcher',
      'a-coder': 'code developer',
      'a-writer': 'content writer',
      'a-critic': 'reflection judge evaluator reviewer',
      'a-router': 'langgraph conditional classifier intent',
      'a-handoff': 'swarm transfer',
      'a-human': 'hitl approval interrupt review',
      'a-tool': 'function calling tool use langchain',
      'a-mcp': 'model context protocol',
      'a-sandbox': 'e2b code interpreter',
      'a-browser': 'playwright web browsing',
      'a-chatbot': 'assistant copilot',
      llm: 'gpt claude gemini openai anthropic',
      chat: 'chatopenai chatanthropic langchain',
      embed: 'embeddings openai text-embedding',
      prompt: 'langchain prompttemplate system prompt',
      parser: 'json structured output pydantic',
      model: 'ml inference',
      llmgw: 'litellm openrouter portkey proxy',
      vision: 'image multimodal ocr',
      speech: 'whisper tts stt voice',
      translate: 'i18n',
      loader: 'langchain pdf ingest',
      splitter: 'chunking recursive character',
      retriever: 'langchain rag similarity',
      rerank: 'cohere cross-encoder',
      kb: 'knowledge rag corpus',
      docs: 'pdf files corpus',
      hybrid: 'bm25 keyword semantic',
      state: 'langgraph typeddict messages',
      checkpoint: 'langgraph memorysaver persistence thread',
      stmem: 'conversation buffer chat history',
      ltmem: 'langgraph store mem0',
      pcache: 'semantic cache gptcache',
      guard: 'nemo guardrails llama guard policy',
      pii: 'presidio redact',
      moderation: 'content filter safety',
      eval: 'langsmith ragas evals dataset',
      trace: 'langsmith langfuse opentelemetry observability',
      event: 'domain event ordercreated',
      dlq: 'dead letter',
      outbox: 'transactional outbox cdc',
      saga: 'distributed transaction compensation',
      idem: 'idempotency dedupe',
      autoscale: 'hpa scaling',
      breaker: 'resilience4j hystrix',
      flags: 'launchdarkly unleash toggle',
      health: 'liveness readiness probe',
      mesh: 'istio linkerd envoy',
      shard: 'partition',
      nat: 'egress',
      dr: 'failover backup region',
      kms: 'encryption keys',
      audit: 'compliance trail',
      config: 'consul settings',
      bastion: 'jump host ssh',
    };
    for (var x in k) KW[x] = (KW[x] ? KW[x] + ' ' : '') + k[x];
  })();
  COMPS.forEach(function (c) {
    T['c-' + c[0]] = { f: 'comp', n: c[1], icon: c[2], cat: c[3], kw: KW[c[0]] || '' };
  });
  ZONES.forEach(function (z) {
    T['z-' + z[0]] = { f: 'zone', n: z[1], icon: z[2], cat: z[3], dash: z[4] };
  });
  SHAPES.forEach(function (s) {
    T['fc-' + s[0]] = { f: s[0] === 'note' ? 'note' : 'shape', k: s[0], n: s[1] };
  });
}
