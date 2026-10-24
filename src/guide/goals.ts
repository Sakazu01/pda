// what to draw for what: purposes, goals, guide
import { $, esc, ic } from '../core/core';
import { DT, dtOf } from '../diagrams/catalog';
import { closeMenus, toast } from '../core/ui';
import { MODALS, closeModal, openModal, scheduleSave } from '../core/features';
import { DT_ICON, renderChips, renderEmpty, set_renderChips, set_renderEmpty, uiWs } from '../editor/workspaces';
import { PROJ, pjFilled, pjSwitch, pjView } from '../projects/projects';
import {
  NV_ACTS,
  nvMoreItems,
  nvPickClose,
  nvPickRender,
  set_nvMoreItems,
  set_nvPickRender,
} from '../editor/navigation';
import { CANVAS_FONT, toggleCanvasFont } from '../editor/canvas-font';
import { tidyAllEdges } from '../lines/toolbar';
import { THEME_PREF, cycleTheme, themeIcon, themeLabel } from '../editor/theme';

export var DT_USE = {
  usecase: 'Siapa (aktor) bisa melakukan apa di sistem. Dipakai di awal, untuk menyepakati cakupan fitur.',
  activity: 'Langkah-langkah satu proses beserta percabangannya. Untuk logika alur satu fitur.',
  sequence: 'Urutan pesan antar komponen dalam SATU skenario (request → response). Untuk desain interaksi & API.',
  class: 'Struktur objek di kode: atribut, method, relasi, pewarisan. Untuk desain OOP.',
  state: 'Siklus status satu objek (draft → aktif → selesai) dan pemicunya.',
  dfd: 'Aliran data antara entitas luar, proses, dan penyimpanan. Untuk analisis SI.',
  erd: 'Tabel, kolom, kunci, dan relasi database.',
  eventstorm: 'Peristiwa domain dalam urutan waktu. Untuk menemukan batas layanan (DDD).',
  component: 'Modul software dan antarmuka di antaranya. Untuk memecah sistem jadi bagian.',
  deploy: 'Di mesin/container mana tiap artefak berjalan dan bagaimana tersambung.',
  api: 'Daftar endpoint: method, path, hak akses, request, response, error.',
  arch: 'Gambaran besar komponen sistem dan zona jaringannya.',
  c4: 'Arsitektur bertingkat: konteks → container → komponen.',
  sysdesign: 'Desain untuk skala: load balancer, cache, replika, queue, sharding, angka QPS/latensi.',
  k8s: 'Objek Kubernetes: ingress, service, deployment, config, volume.',
  network: 'Topologi jaringan fisik: router, firewall, switch, perangkat.',
  dist: 'Pola sistem terdistribusi: leader/follower, sharding, konsensus.',
  threat: 'Ancaman keamanan per aliran data (STRIDE) dan batas kepercayaan.',
  cicd: 'Jalur kode dari commit sampai produksi beserta gerbang mutunya.',
  bpmn: 'Proses bisnis lintas peran (pool/lane), keputusan, dan event.',
  userflow: 'Jalan pengguna antar layar untuk mencapai satu tujuan.',
  wire: 'Tata letak tiap layar (low-fi).',
  sitemap: 'Struktur halaman dan navigasi.',
  journey: 'Pengalaman pelanggan per tahap: aksi, perasaan, masalah.',
  gds: 'Warna, tipografi, komponen visual.',
  n8n: 'Otomasi: pemicu → langkah → aplikasi.',
  agent: 'Agen AI berbasis graf dengan node dan rute kondisi.',
  rag: 'Pipeline tanya-jawab dokumen: ingest → retrieve → generate.',
  multi: 'Beberapa agen AI bekerja sama.',
  mlpipe: 'Siklus model ML dari data sampai produksi.',
  mind: 'Peta ide bercabang dari satu topik.',
  board: 'Papan bebas untuk brainstorming.',
  deck: 'Slide presentasi / pitch deck.',
};
export var GOALS = [
  {
    id: 'app',
    ic: 'code-xml',
    n: 'Merancang aplikasi (tugas besar / produk)',
    q: 'Mulai dari kebutuhan sampai layar dan database.',
    dts: ['usecase', 'activity', 'erd', 'class', 'sequence', 'api', 'sitemap', 'wire', 'arch'],
    prd: 1,
  },
  {
    id: 'sysd',
    ic: 'network',
    n: 'System design (skala & performa)',
    q: 'Cache, load balancer, replika, queue, angka QPS.',
    dts: ['sysdesign', 'sequence', 'deploy', 'erd', 'threat'],
  },
  {
    id: 'arch',
    ic: 'server',
    n: 'Arsitektur & deployment',
    q: 'Komponen sistem, tempat berjalan, dan jalur rilis.',
    dts: ['arch', 'c4', 'component', 'deploy', 'k8s', 'cicd', 'network'],
  },
  {
    id: 'data',
    ic: 'database',
    n: 'Desain database',
    q: 'Tabel, relasi, dan aliran data.',
    dts: ['erd', 'class', 'dfd'],
  },
  {
    id: 'api',
    ic: 'plug-zap',
    n: 'API & integrasi',
    q: 'Endpoint, urutan panggilan, dan modul yang terlibat.',
    dts: ['api', 'sequence', 'component', 'state'],
  },
  {
    id: 'sec',
    ic: 'shield-alert',
    n: 'Keamanan',
    q: 'Ancaman, alur login, dan siklus session.',
    dts: ['threat', 'sequence', 'state'],
  },
  {
    id: 'biz',
    ic: 'briefcase',
    n: 'Proses bisnis & sistem informasi',
    q: 'Siapa melakukan apa, data mengalir ke mana.',
    dts: ['bpmn', 'dfd', 'vc', 'swot', 'bmc'],
  },
  {
    id: 'ux',
    ic: 'layout-template',
    n: 'Riset UX & antarmuka',
    q: 'Pengguna, perjalanannya, dan layarnya.',
    dts: ['persona', 'empathy', 'journey', 'userflow', 'sitemap', 'wire', 'gds'],
  },
  {
    id: 'ai',
    ic: 'sparkles',
    n: 'Sistem AI & otomasi',
    q: 'Agen, RAG, workflow otomatis, pipeline ML.',
    dts: ['rag', 'agent', 'multi', 'n8n', 'mlpipe'],
  },
  {
    id: 'pm',
    ic: 'flag',
    n: 'Rencana & manajemen proyek',
    q: 'Jadwal, tugas, peran, risiko.',
    dts: ['gantt', 'kanban', 'raci', 'risk', 'okr'],
  },
  {
    id: 'strat',
    ic: 'target',
    n: 'Strategi bisnis',
    q: 'Model bisnis, posisi, dan peluang.',
    dts: ['bmc', 'lean', 'swot', 'pestel', 'ff', 'vpc'],
  },
  { id: 'pitch', ic: 'monitor', n: 'Pitch & presentasi', q: 'Slide untuk lomba atau investor.', dts: ['deck'] },
];
export function dtUse(k) {
  return DT_USE[k] || String((DT[k] && DT[k].hint) || '').split('. ')[0];
}
export function guideOpen() {
  var m = $('mGuide');
  if (!m) {
    $('scrim').insertAdjacentHTML(
      'beforeend',
      '<div class="modal wide" id="mGuide" role="dialog" aria-modal="true" aria-labelledby="mGuideT" hidden><header>' +
        ic('target') +
        '<h2 id="mGuideT">Mau merancang apa?</h2><button class="ibtn" type="button" data-close aria-label="Tutup">' +
        ic('x') +
        '</button></header><div class="mb"><p class="note">Pilih tujuanmu. Urutan diagram di tiap kartu adalah urutan yang disarankan, dari gambaran besar ke detail. Klik satu diagram untuk membukanya, atau <b>Pakai set ini</b> agar semuanya muncul sebagai saran di navigasi.</p><div class="gd-grid" id="gdGrid"></div></div></div>',
    );
    m = $('mGuide');
    if (MODALS.indexOf('mGuide') < 0) MODALS.push('mGuide');
    m.addEventListener('click', function (ev) {
      var d = ev.target.closest('[data-gdt]');
      if (d) {
        closeModal();
        pjSwitch(d.getAttribute('data-gdt'));
        return;
      }
      var u = ev.target.closest('[data-gset]');
      if (u) {
        var g = GOALS.filter(function (x) {
          return x.id === u.getAttribute('data-gset');
        })[0];
        if (!g) return;
        PROJ.plan = g.dts.slice();
        scheduleSave();
        closeModal();
        if (g.prd && !PROJ.prd.trim()) {
          pjView('prd');
        } else pjSwitch(g.dts[0]);
        renderChips();
        toast('Set “' + g.n + '” dipakai: ' + g.dts.length + ' halaman muncul sebagai saran di tiap bagian.');
      }
    });
  }
  $('gdGrid').innerHTML = GOALS.map(function (g) {
    return (
      '<section class="gd-card"><h3>' +
      ic(g.ic) +
      '<span>' +
      esc(g.n) +
      '</span></h3><p>' +
      esc(g.q) +
      '</p><ol>' +
      g.dts
        .map(function (k) {
          var f = pjFilled(k);
          return (
            '<li><button type="button" data-gdt="' +
            k +
            '" title="' +
            esc(dtUse(k)) +
            '">' +
            ic(DT_ICON[k] || 'layout-grid') +
            '<b>' +
            esc(DT[k].n) +
            (f ? '<em>ada isi</em>' : '') +
            '</b><small>' +
            esc(dtUse(k)) +
            '</small></button></li>'
          );
        })
        .join('') +
      '</ol><button type="button" class="btn" data-gset="' +
      g.id +
      '">' +
      ic('list-checks') +
      'Pakai set ini' +
      (g.prd ? ' (mulai dari PRD)' : '') +
      '</button></section>'
    );
  }).join('');
  openModal('mGuide');
}
// planned pages show up as suggestions in their workspace even after other pages are filled
export var ux2RenderChips0: () => void;
// picker: purpose line under every type + a way into the goal guide
export var ux2PickRender0: () => void;
export var ux2Empty0: () => void;
export var ux2MoreItems0: () => (string | string[])[];

export function install(): void {
  GOALS.forEach(function (g) {
    g.dts = g.dts.filter(function (k) {
      return DT[k];
    });
  });
  ux2RenderChips0 = renderChips;
  set_renderChips(function () {
    ux2RenderChips0();
    var plan = (PROJ && PROJ.plan) || [];
    if (!plan.length) return;
    var dt = dtOf(),
      ws = uiWs || DT[dt].ws,
      box = $('dtChips'),
      have = {};
    [].forEach.call(box.querySelectorAll('[data-dt]'), function (b) {
      have[b.getAttribute('data-dt')] = 1;
    });
    var add = plan.filter(function (k) {
      return DT[k] && DT[k].ws === ws && !have[k];
    });
    if (!add.length) return;
    var html = add
      .map(function (k) {
        return (
          '<button type="button" class="dt-chip sug plan" data-dt="' +
          k +
          '" aria-pressed="false" title="Direncanakan: ' +
          esc(dtUse(k)) +
          '">' +
          ic(DT_ICON[k] || 'layout-grid') +
          '<span>' +
          esc(DT[k].n) +
          '</span></button>'
        );
      })
      .join('');
    var more = $('nvMore');
    if (more)
      more.insertAdjacentHTML(
        'beforebegin',
        (box.querySelector('.nv-sep') ? '' : '<span class="nv-sep" aria-hidden="true"></span>') + html,
      );
  });
  ux2PickRender0 = nvPickRender;
  set_nvPickRender(function () {
    ux2PickRender0();
    [].forEach.call($('nvPickBody').querySelectorAll('.nv-card[data-dt]'), function (c) {
      var sm = c.querySelector('small');
      if (sm) sm.textContent = dtUse(c.getAttribute('data-dt'));
    });
    var b = $('nvPickBody');
    if (!$('nvPickQ').value)
      b.insertAdjacentHTML(
        'afterbegin',
        '<button type="button" class="nv-goal" data-nvs="goal">' +
          ic('target') +
          '<span><b>Bingung pilih yang mana?</b><small>Pilih berdasarkan tujuan: aplikasi, system design, database, API, keamanan, UX…</small></span>' +
          ic('chevron-right') +
          '</button>',
      );
  });
  ux2Empty0 = renderEmpty;
  set_renderEmpty(function () {
    ux2Empty0();
    var box = $('nvStart');
    if (box && !box.hidden && !box.querySelector('[data-nvs=goal]'))
      box.insertAdjacentHTML(
        'afterbegin',
        '<button type="button" data-nvs="goal" class="nv-start-goal">' +
          ic('target') +
          '<b>Mau merancang apa?</b><small>Pilih tujuan, PDA menyusun diagram yang tepat dan urutannya</small></button>',
      );
  });
  document.addEventListener(
    'click',
    function (ev) {
      var g = (ev.target as HTMLInputElement).closest && (ev.target as HTMLInputElement).closest('[data-nvs=goal]');
      if (g) {
        ev.stopPropagation();
        ev.preventDefault();
        if (typeof nvPickClose === 'function') nvPickClose();
        guideOpen();
        return;
      }
      var m = (ev.target as HTMLInputElement).closest && (ev.target as HTMLInputElement).closest('[data-nvm]');
      if (!m) return;
      var a = m.getAttribute('data-nvm'),
        fn = {
          theme: function () {
            cycleTheme();
          },
          font: toggleCanvasFont,
          tidy: function () {
            pjView('canvas');
            tidyAllEdges();
          },
          guide: guideOpen,
        }[a];
      if (fn) {
        ev.stopPropagation();
        closeMenus();
        fn();
      }
    },
    true,
  );
  ux2MoreItems0 = nvMoreItems;
  set_nvMoreItems(function () {
    var L = ux2MoreItems0(),
      i = L.indexOf('-');
    var extra = [
      ['guide', 'target', 'Mau merancang apa?', 'Panduan diagram per tujuan'],
      '-',
      [
        'theme',
        themeIcon(),
        'Tema: ' + themeLabel(),
        'Klik: ' + (THEME_PREF === 'auto' ? 'Terang' : THEME_PREF === 'light' ? 'Gelap' : 'Otomatis'),
      ],
      [
        'font',
        'type',
        CANVAS_FONT === 'excali' ? 'Font kanvas: Normal' : 'Font kanvas: Excalifont',
        'Sekarang: ' + (CANVAS_FONT === 'excali' ? 'Excalifont' : 'Normal'),
      ],
      ['tidy', 'wand-sparkles', 'Rapikan semua garis', 'Hapus tekukan & posisi label manual'],
    ];
    return L.slice(0, i + 1).concat(extra, L.slice(i));
  });
  NV_ACTS.push(
    [
      'guide',
      'Mau merancang apa? (panduan diagram per tujuan)',
      'target',
      'tujuan panduan pilih diagram rekomendasi',
      guideOpen,
    ],
    ['font', 'Ganti font kanvas (Excalifont / Normal)', 'type', 'font huruf excalidraw tulisan', toggleCanvasFont],
    [
      'tidy',
      'Rapikan semua garis di halaman ini',
      'wand-sparkles',
      'garis rapikan tekukan label reset',
      function () {
        pjView('canvas');
        tidyAllEdges();
      },
    ],
  );
}
