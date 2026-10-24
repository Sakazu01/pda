// ================= inspector =================
import { ICONS } from '../vendor/lucide-icons';
import {
  $,
  CAT,
  COMPS,
  EDGE,
  FAM_LABEL,
  S,
  T,
  ZONES,
  animate,
  byId,
  catColor,
  center,
  eById,
  esc,
  fam,
  grid,
  ic,
  pushUndo,
  route,
  selE,
  selN,
  setEdgePoint,
  set_animate,
  set_grid,
  set_selE,
  set_selN,
  size,
  snap,
  syncPool,
  validColor,
} from '../core/core';
import { CF_OPTS, DT, TECH, TREEF, dtOf, isLife, resizable, techKey } from '../diagrams/catalog';
import { ICONLIB, cellTone, compImg, iconIdFor } from '../diagrams/draw';
import {
  addNode,
  align,
  applyCam,
  applyStyle,
  bounds,
  delSel,
  distribute,
  dupSel,
  fitView,
  inspBody,
  isCont,
  moveSet,
  render,
  renderAll,
  setSel,
  single,
  startEdit,
  toBack,
  toFront,
  toast,
} from '../core/ui';
import { DOC, autoArrange, newDiagram, openModal, revealTarget } from '../core/features';
import { treeAdd } from '../diagrams/frameworks';
import { dtKind, edgeGroups } from '../ai/generate';
import { DT_ICON, WS_BY, previewSvg } from './workspaces';

let inspWasDoc = false;
export var FILLS = [
  '#ffffff',
  '#ffc9c9',
  '#b2f2bb',
  '#a5d8ff',
  '#ffec99',
  '#d0bfff',
  '#99e9f2',
  '#fcc2d7',
  '#e9ecef',
  '#1e1e1e',
];
export var LINES = ['#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00', '#6741d9', '#0c8599', '#c2255c', '#868e96'];
export var TEXTS = ['#1e1e1e', '#ffffff', '#1971c2', '#e03131', '#2f9e44', '#868e96'];
export var TONES = [
  '#1971c2',
  '#3b5bdb',
  '#099268',
  '#2f9e44',
  '#f08c00',
  '#e8590c',
  '#e03131',
  '#c2255c',
  '#6741d9',
  '#364fc7',
  '#495057',
];
export var COLOR_KEYS = ['fill', 'stroke', 'textColor', 'headerFill', 'laneFill', 'tone', 'accent'];
export var TXTF: Record<string, number> = {
  label: 1,
  sub: 1,
  body: 1,
  attrs: 1,
  ops: 1,
  stereo: 1,
  num: 1,
  badge: 1,
  hlText: 1,
  op: 1,
  label2: 1,
  head: 1,
};
export var NUMK: Record<string, number> = { fs: 1, split: 1, sw: 1, rows: 1 };
export var LEVELS = [
  ['', 'None'],
  ['Tinggi', 'Tinggi'],
  ['Sedang', 'Sedang'],
  ['Rendah', 'Rendah'],
  ['High', 'High'],
  ['Medium', 'Medium'],
  ['Low', 'Low'],
];
export var iconOpen = false;
export function set_iconOpen(v: typeof iconOpen) {
  return (iconOpen = v);
}
export function swRow(key, label, cur, list) {
  var s =
    '<div class="fld"><span>' +
    label +
    '</span><div class="sw" role="group" aria-label="' +
    esc(label) +
    '"><button type="button" class="def' +
    (!validColor(cur) ? ' on' : '') +
    '" data-sw="' +
    key +
    '" data-v="" title="Default" aria-label="Default"></button>';
  list.forEach(function (c) {
    s +=
      '<button type="button" data-sw="' +
      key +
      '" data-v="' +
      c +
      '" style="background:' +
      c +
      '" title="' +
      c +
      '" aria-label="' +
      c +
      '"' +
      (cur && cur.toLowerCase() === c ? ' class="on"' : '') +
      '></button>';
  });
  return (
    s +
    '<label title="Custom color">' +
    ic('plus') +
    '<input type="color" data-f="' +
    key +
    '" value="' +
    (validColor(cur) ? cur : list[0]) +
    '" aria-label="Custom ' +
    esc(label) +
    '"></label></div></div>'
  );
}
export function field(label, html) {
  return '<label class="fld"><span>' + label + '</span>' + html + '</label>';
}
export function numIn(key, val, lbl, step?) {
  return (
    '<label class="fld"><span>' +
    lbl +
    '</span><input class="num" type="number" step="' +
    (step || 10) +
    '" data-f="' +
    key +
    '" value="' +
    Math.round(val) +
    '"></label>'
  );
}
export function txtIn(key, val, ph?) {
  return (
    '<input type="text" data-f="' +
    key +
    '" value="' +
    esc(val == null ? '' : val) +
    '"' +
    (ph ? ' placeholder="' + esc(ph) + '"' : '') +
    '>'
  );
}
export function areaIn(key, val, ph, rows, mono?) {
  return (
    '<textarea data-f="' +
    key +
    '" rows="' +
    (rows || 3) +
    '"' +
    (ph ? ' placeholder="' + esc(ph) + '"' : '') +
    (mono ? ' class="mono"' : '') +
    '>' +
    esc(val == null ? '' : val) +
    '</textarea>'
  );
}
export function selIn(key, cur, opts, attr?) {
  var c = String(cur == null ? '' : cur),
    has = opts.some(function (o) {
      return o[0] === c;
    });
  if (!has && c) opts = opts.concat([[c, c]]);
  return (
    '<select ' +
    (attr || 'data-f="' + key + '"') +
    '>' +
    opts
      .map(function (o) {
        return '<option value="' + esc(o[0]) + '"' + (c === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
      })
      .join('') +
    '</select>'
  );
}
export function segIn(key, cur, opts) {
  var c = String(cur == null ? '' : cur);
  return (
    '<div class="seg">' +
    opts
      .map(function (o) {
        return (
          '<button type="button" data-act="setp" data-k="' +
          key +
          '" data-v="' +
          esc(o[0]) +
          '" class="' +
          (c === o[0] ? 'on' : '') +
          '">' +
          esc(o[1]) +
          '</button>'
        );
      })
      .join('') +
    '</div>'
  );
}
export function togBtn(key, on, label) {
  return (
    '<button type="button" class="sbtn' +
    (on ? ' on' : '') +
    '" data-act="togp" data-k="' +
    key +
    '" aria-pressed="' +
    !!on +
    '">' +
    label +
    '</button>'
  );
}
export var TYPE_SWAP = { ev: 1, task: 1, gw: 1, data: 1, comp: 1, zone: 1, shape: 1, note: 1, dfd: 1, c4: 1 };
export function typeOptions(n) {
  var f = fam(n),
    s = '';
  if (f === 'comp') {
    Object.keys(CAT).forEach(function (c) {
      var ks = COMPS.filter(function (x) {
        return x[3] === c;
      });
      if (!ks.length) return;
      s +=
        '<optgroup label="' +
        esc(CAT[c].n) +
        '">' +
        ks
          .map(function (x) {
            var k = 'c-' + x[0];
            return '<option value="' + k + '"' + (k === n.t ? ' selected' : '') + '>' + esc(x[1]) + '</option>';
          })
          .join('') +
        '</optgroup>';
    });
    s +=
      '<optgroup label="Tech stack">' +
      TECH.map(function (x) {
        var k = 'c-' + techKey(x[1]);
        return '<option value="' + k + '"' + (k === n.t ? ' selected' : '') + '>' + esc(x[1]) + '</option>';
      }).join('') +
      '</optgroup>';
    return s;
  }
  Object.keys(T).forEach(function (k) {
    if (T[k].f === f && (!T[k].logoOnly || k === n.t))
      s += '<option value="' + k + '"' + (k === n.t ? ' selected' : '') + '>' + esc(T[k].n) + '</option>';
  });
  return s;
}
export function badgeFor(n) {
  var f = fam(n),
    d = T[n.t];
  if (f === 'comp' || f === 'zone') {
    var im = f === 'comp' && compImg(n);
    if (im) return '<img src="' + im.data + '" alt="">';
    var c = validColor(n.stroke) ? n.stroke : catColor(d.cat);
    return '<span style="color:' + c + '">' + ic(n.icon || d.icon) + '</span>';
  }
  if (f === 'cell') return '<span style="color:' + cellTone(n) + '">' + ic(n.icon || 'square-stack') + '</span>';
  if (f === 'draw') return ic('pencil');
  return previewSvg(n.t);
}
export var ICON_CHOICES: any[];
export function iconGrid(n) {
  var d = T[n.t];
  return (
    '<div class="icgrid" role="group" aria-label="Icons">' +
    ICON_CHOICES.map(function (k) {
      return (
        '<button type="button" data-icon="' +
        k +
        '" title="' +
        k +
        '" aria-label="' +
        k +
        '" class="' +
        ((n.icon || d.icon) === k ? 'on' : '') +
        '">' +
        ic(k) +
        '</button>'
      );
    }).join('') +
    '</div>'
  );
}
export function imgPicker(n) {
  var ids = Object.keys(ICONLIB).sort(function (a, b) {
      return String(ICONLIB[a].name).localeCompare(String(ICONLIB[b].name));
    }),
    auto = !n.img && iconIdFor(n);
  var s =
    '<div class="fld"><span>Logo image' +
    (auto ? ' · using your “' + esc(ICONLIB[auto].name) + '” icon' : '') +
    '</span><div class="imgs">';
  s +=
    '<button type="button" data-img="" class="' +
    (!n.img ? 'on' : '') +
    '" title="' +
    (auto ? 'Automatic (by name)' : 'No image') +
    '" aria-label="No image">' +
    ic(auto ? 'link-2' : 'x') +
    '</button>';
  ids.forEach(function (id) {
    s +=
      '<button type="button" data-img="' +
      id +
      '" class="' +
      (n.img === id ? 'on' : '') +
      '" title="' +
      esc(ICONLIB[id].name) +
      '" aria-label="' +
      esc(ICONLIB[id].name) +
      '"><img src="' +
      ICONLIB[id].data +
      '" alt=""></button>';
  });
  return (
    s +
    '<button type="button" data-act="icons-open" title="Upload logos" aria-label="Upload logos">' +
    ic('plus') +
    '</button></div></div>'
  );
}

export function contentFields__base(n) {
  var f = fam(n),
    d = T[n.t],
    k = d.k,
    s = '';
  if (f === 'pool') {
    s += field('Pool name (participant)', txtIn('label', n.label));
    s += '<div class="fld"><span>Lanes · name and height</span>';
    (n.lanes || []).forEach(function (l, i) {
      s +=
        '<div class="lanerow"><input type="text" data-lane-name="' +
        i +
        '" value="' +
        esc(l.name) +
        '" aria-label="Lane ' +
        (i + 1) +
        ' name"><input class="num" type="number" min="50" step="10" data-lane-h="' +
        i +
        '" value="' +
        l.h +
        '" aria-label="Lane ' +
        (i + 1) +
        ' height"><button type="button" data-act="lane-del" data-i="' +
        i +
        '" aria-label="Remove lane">' +
        ic('x') +
        '</button></div>';
    });
    if (!(n.lanes || []).length) s += '<p class="note">Black-box pool without lanes. Add lanes if you need them.</p>';
    return (
      s +
      '</div><div class="acts"><button type="button" class="sbtn" data-act="lane-add">' +
      ic('plus') +
      'Add lane</button></div>'
    );
  }
  if (f === 'cell') {
    s += field('Title', areaIn('label', n.label, n.qf || 'Title', 2));
    s += field('Subtitle', txtIn('sub', n.sub, 'optional'));
    if (!n.nobody) s += field('Points · one per line', areaIn('body', n.body, n.ph || 'One line = one point', 6));
    if (n.badge != null || dtOf() === 'ff') s += field('Level badge', selIn('badge', n.badge || '', LEVELS));
    s += '<div class="acts">' + togBtn('hl', n.hl, ic('circle-check-big') + 'Highlight as chosen') + '</div>';
    if (n.hl) s += field('Highlight text', txtIn('hlText', n.hlText, 'Dipilih'));
    return s;
  }
  if (f === 'uml' && (k === 'class' || k === 'interface' || k === 'enum')) {
    s += field('Name', txtIn('label', n.label));
    s += field('Stereotype', txtIn('stereo', n.stereo, 'interface, abstract, entity…'));
    s += field(
      k === 'enum' ? 'Literals · one per line' : 'Attributes · one per line',
      areaIn('attrs', n.attrs, '- id: int', 4, 1),
    );
    if (k !== 'enum') s += field('Operations · one per line', areaIn('ops', n.ops, '+ save(): void', 3, 1));
    return s;
  }
  if (n.t === 'u-state') {
    s += field('State name', txtIn('label', n.label));
    return s + field('Internal activities', areaIn('body', n.body, 'entry / start timer\nexit / stop timer', 3, 1));
  }
  if (n.t === 'b-frag') {
    s += field(
      'Operator',
      selIn(
        'op',
        n.op || 'alt',
        ['alt', 'opt', 'loop', 'par', 'break', 'critical', 'neg', 'ref'].map(function (x) {
          return [x, x];
        }),
      ),
    );
    s += field('Guard', txtIn('label', n.label, '[condition]'));
    s +=
      '<div class="fld"><span>Second operand (else)</span>' +
      segIn('split', n.split ? '0.5' : '', [
        ['', 'None'],
        ['0.5', 'Split in half'],
      ]) +
      '</div>';
    if (n.split) s += field('Else guard', txtIn('label2', n.label2, '[else]'));
    return s;
  }
  if (n.t === 'b-c4b')
    return (
      field('Boundary name', txtIn('label', n.label)) + field('Boundary type', txtIn('sub', n.sub, 'Software System'))
    );
  if (n.t === 'er-table')
    return (
      field('Table name', txtIn('label', n.label)) +
      field('Columns · one per line', areaIn('body', n.body, 'PK id: int\nFK user_id: int\nname: varchar(80)', 7, 1)) +
      '<p class="note">Start a line with <b>PK</b>, <b>FK</b> or <b>UK</b>. Put the type after a colon.</p>'
    );
  if (f === 'dfd') {
    s += field(
      k === 'store' ? 'Store name' : k === 'ext' ? 'Entity name' : 'Process name · verb + object',
      areaIn('label', n.label, '', 2),
    );
    if (k !== 'ext')
      s += field(k === 'store' ? 'Store id' : 'Process number', txtIn('num', n.num, k === 'store' ? 'D1' : '1.0'));
    return s + field('Type', '<select data-f="t">' + typeOptions(n) + '</select>');
  }
  if (f === 'c4') {
    s += field('Name', txtIn('label', n.label));
    if (['container', 'component', 'db'].indexOf(k) >= 0)
      s += field('Technology', txtIn('sub', n.sub, 'e.g. Next.js, PostgreSQL'));
    return (
      s +
      field('Description', areaIn('body', n.body, 'What it does, in one sentence', 3)) +
      field('Type', '<select data-f="t">' + typeOptions(n) + '</select>')
    );
  }
  if (TREEF[f]) {
    s += field(f === 'page' ? 'Page name' : f === 'org' ? 'Position' : 'Topic', areaIn('label', n.label, '', 2));
    if (f !== 'mind')
      s += field(
        f === 'page' ? 'URL or note' : 'Name or note',
        txtIn('sub', n.sub, f === 'page' ? '/about' : 'e.g. the person in this role'),
      );
    if (f !== 'mind') s += '<div class="acts">' + togBtn('hl', n.hl, 'Highlight') + '</div>';
    return s;
  }
  if (n.t === 'wf-list')
    return field(
      'Rows',
      '<input class="num" type="number" min="1" max="12" step="1" data-f="rows" value="' + (n.rows || 4) + '">',
    );
  if (
    f === 'wf' &&
    ['heading', 'text', 'button', 'input', 'search', 'card', 'nav', 'checkbox', 'toggle', 'chip'].indexOf(k) >= 0
  )
    return field('Text', areaIn('label', n.label, '', 2));
  if (f === 'wf') return '<p class="note">Placeholder element. Resize it to fit your layout.</p>';
  if (f === 'draw') return '<p class="note">Freehand drawing. Change its ink and width below, or resize it.</p>';
  if (f === 'text') {
    s += field('Text', areaIn('label', n.label, '', 3));
    s +=
      '<div class="fld"><span>Size</span>' +
      segIn('fs', String(n.fs || 13), [
        ['11', 'S'],
        ['13', 'M'],
        ['16', 'L'],
        ['22', 'XL'],
        ['30', '2XL'],
      ]) +
      '</div>';
    s +=
      '<div class="fld"><span>Align</span>' +
      segIn('align', n.align || '', [
        ['', 'Center'],
        ['left', 'Left'],
      ]) +
      '</div>';
    return s + '<div class="acts">' + togBtn('bold', n.bold, 'Bold') + togBtn('muted', n.muted, 'Muted') + '</div>';
  }
  s += field(
    f === 'zone' ? 'Zone name' : n.t === 'u-act-decision' || n.t === 'u-choice' ? 'Question (optional)' : 'Label',
    '<textarea data-f="label" placeholder="' + esc(d.n) + '" rows="2">' + esc(n.label) + '</textarea>',
  );
  if (f === 'comp')
    s += field('Detail · technology, version or SLA', txtIn('sub', n.sub, 'e.g. PostgreSQL 16 · 3 replicas'));
  if (TYPE_SWAP[f]) s += field('Type', '<select data-f="t">' + typeOptions(n) + '</select>');
  return s;
}
export var contentFields: typeof contentFields__base = contentFields__base;
export function set_contentFields(v: typeof contentFields__base) {
  return (contentFields = v);
}
export function appearance__base(n) {
  var f = fam(n),
    d = T[n.t],
    s = '<div class="sec"><div class="st">Appearance</div>';
  if (f === 'comp') {
    s +=
      '<div class="fld"><span>Look</span><div class="seg"><button type="button" data-act="look" data-v="card" class="' +
      (n.look !== 'tile' ? 'on' : '') +
      '">Card</button><button type="button" data-act="look" data-v="tile" class="' +
      (n.look === 'tile' ? 'on' : '') +
      '">Icon tile</button></div></div>';
    s += imgPicker(n);
  }
  if (f === 'cell') {
    s +=
      '<div class="fld"><span>Style</span>' +
      segIn('mode', n.mode || 'soft', [
        ['soft', 'Soft'],
        ['solid', 'Solid'],
        ['outline', 'Outline'],
        ['bare', 'None'],
      ]) +
      '</div>';
    if (!n.shape || n.shape === 'rect')
      s += field(
        'Title style',
        selIn('head', n.head || 'plain', [
          ['plain', 'Title at top'],
          ['band', 'Colored band'],
          ['ctop', 'Centered title'],
          ['side', 'Side label'],
          ['chev', 'Chevron'],
          ['center', 'Title only, centered'],
          ['none', 'No title'],
        ]),
      );
    s += swRow('tone', 'Tone', n.tone, TONES);
  }
  if (f === 'comp' || f === 'zone' || f === 'cell') {
    s +=
      '<div class="acts"><button type="button" class="sbtn' +
      (iconOpen ? ' on' : '') +
      '" data-act="icons">' +
      ic(n.icon || d.icon || 'plus') +
      (f === 'cell' && !n.icon ? 'Add icon' : 'Change icon') +
      '</button>' +
      (n.icon
        ? '<button type="button" class="sbtn" data-act="icon-reset">' +
          (f === 'cell' ? 'Remove icon' : 'Default icon') +
          '</button>'
        : '') +
      '</div>';
    if (iconOpen) s += iconGrid(n);
  }
  if (f === 'pool') {
    s +=
      swRow('fill', 'Pool fill', n.fill, FILLS) +
      swRow('headerFill', 'Pool header', n.headerFill, FILLS) +
      swRow('laneFill', 'Lane headers', n.laneFill, FILLS) +
      swRow('stroke', 'Lines', n.stroke, LINES) +
      swRow('textColor', 'Text', n.textColor, TEXTS);
    (n.lanes || []).forEach(function (l, i) {
      s += swRow('lane:' + i, 'Lane ' + (i + 1) + ' fill · ' + esc(l.name), l.fill, FILLS);
    });
  } else if (f === 'draw') {
    s +=
      swRow('stroke', 'Ink', n.stroke, LINES) +
      '<div class="fld"><span>Width</span>' +
      segIn('sw', String(n.sw || 2.5), [
        ['1.5', 'Thin'],
        ['2.5', 'Medium'],
        ['4', 'Bold'],
        ['7', 'Marker'],
      ]) +
      '</div>';
  } else {
    var fl = f === 'comp' ? 'Card fill' : 'Fill',
      ll =
        f === 'comp'
          ? 'Accent (icon & border)'
          : f === 'zone'
            ? 'Border & title'
            : f === 'cell'
              ? 'Border'
              : 'Line & symbol';
    if (f !== 'text' && f !== 'ann') s += swRow('fill', fl, n.fill, FILLS);
    if (f !== 'text') s += swRow('stroke', ll, n.stroke, LINES);
    s += swRow('textColor', 'Text', n.textColor, TEXTS);
  }
  return s + '</div>';
}
export var appearance: typeof appearance__base = appearance__base;
export function set_appearance(v: typeof appearance__base) {
  return (appearance = v);
}
export function inspNode__base(n) {
  var f = fam(n),
    d = T[n.t],
    s = '',
    sub = FAM_LABEL[f] || '';
  if (d.cat && CAT[d.cat]) sub += ' · ' + CAT[d.cat].n;
  if (n.grp) sub += ' · framework block';
  s +=
    '<div class="ih"><div class="badge">' +
    badgeFor(n) +
    '</div><div><h3>' +
    esc(f === 'cell' ? String(n.label || n.qf || 'Block').replace(/\s+/g, ' ') : d.n) +
    '</h3><small>' +
    esc(sub) +
    '</small></div></div>';
  s += '<div class="sec"><div class="st">Content</div>' + contentFields(n) + '</div>';
  s += appearance(n);
  s +=
    '<div class="sec"><div class="st">Size & position</div><div class="row4">' +
    numIn('x', n.x, 'X') +
    numIn('y', n.y, 'Y') +
    (resizable(n) ? numIn('w', n.w, 'W') + numIn('h', n.h, 'H') : '') +
    '</div></div>';
  s += '<div class="sec"><div class="st">Actions</div><div class="acts">';
  if (TREEF[f])
    s +=
      '<button type="button" class="sbtn" data-act="tree-child">' +
      ic('plus') +
      'Child <kbd>Tab</kbd></button><button type="button" class="sbtn" data-act="tree-sib">' +
      ic('plus') +
      'Sibling <kbd>Enter</kbd></button><button type="button" class="sbtn" data-act="tree-tidy">' +
      ic('list-tree') +
      'Tidy</button><button type="button" class="sbtn" data-act="outline">' +
      ic('text-quote') +
      'Edit as outline</button>';
  if (n.grp)
    s +=
      '<button type="button" class="sbtn" data-act="selgrp">' + ic('square-dashed') + 'Select whole framework</button>';
  s +=
    '<button type="button" class="sbtn" data-act="dup">' +
    ic('copy') +
    'Duplicate</button><button type="button" class="sbtn" data-act="front">' +
    ic('arrow-up-to-line') +
    'Front</button><button type="button" class="sbtn" data-act="back">' +
    ic('arrow-down-to-line') +
    'Back</button>';
  s +=
    '<button type="button" class="sbtn" data-act="colors-reset">Reset colors</button><button type="button" class="sbtn del" data-act="del">' +
    ic('trash-2') +
    'Delete</button></div></div>';
  var tip = nodeTip(n);
  if (tip) s += '<p class="note">' + tip + '</p>';
  return s;
}
export var inspNode: typeof inspNode__base = inspNode__base;
export function set_inspNode(v: typeof inspNode__base) {
  return (inspNode = v);
}
export function nodeTip(n) {
  var f = fam(n),
    d = T[n.t],
    k = d.k;
  if (n.grp && f === 'cell')
    return 'One line = one point. Dragging moves the whole framework; hold <kbd>Alt</kbd> to move only this block.';
  if (n.grp)
    return 'Part of a framework. Dragging moves the whole framework; hold <kbd>Alt</kbd> to move only this piece.';
  if (f === 'task')
    return 'Name tasks as <b>verb + object</b> (“Verify order”). Avoid vague verbs like “Handle” or “Process”.';
  if (f === 'gw')
    return 'Label every outgoing branch with its condition, and use a matching gateway to merge the branches again.';
  if (f === 'ev' && d.k === 'inter') return 'For a boundary event, place this circle on the edge of a task.';
  if (f === 'zone')
    return 'Moving a zone moves everything inside it. Use zones for real boundaries: networks, clusters, agent teams, environments.';
  if (TREEF[f])
    return '<kbd>Tab</kbd> adds a child, <kbd>Enter</kbd> adds a sibling. Dragging moves the whole branch; hold <kbd>Alt</kbd> to move one box.';
  if (isLife(n))
    return 'Drag from the dashed line to another lifeline to add a message at that height. Messages are read top to bottom.';
  if (k === 'class' || k === 'interface')
    return 'Double-click the attribute or operation compartment to edit it in place. Visibility: <b>+</b> public, <b>-</b> private, <b>#</b> protected.';
  if (k === 'usecase')
    return 'Name use cases <b>verb + object</b> from the actor’s point of view (“Book a table”). Keep them inside the system boundary.';
  if (k === 'actor') return 'Actors are roles outside the system. Connect them to use cases with a plain association.';
  if (k === 'act-decision')
    return 'Label each outgoing flow with a guard in brackets, such as <b>[ya]</b> and <b>[tidak]</b>.';
  if (f === 'dfd' && k === 'proc')
    return 'Every process needs at least one input and one output flow. Number level-1 processes 1.0, 2.0, …';
  if (f === 'dfd')
    return 'Data moves only through processes: never connect two entities, two stores, or an entity straight to a store.';
  if (n.t === 'er-table')
    return 'Drag between two tables to draw a crow’s-foot relationship, then set both ends in the line’s properties.';
  if (f === 'c4')
    return 'Name, [technology] and one sentence of responsibility. Label every relationship with what it does and how.';
  if (f === 'wf') return 'Low-fi: grey boxes and real labels only. Put elements inside a phone or browser frame.';
  if (n.t === 'c-a-super' || n.t === 'c-a-router' || n.t === 'c-l-if' || n.t === 'c-l-switch')
    return 'Routers need a labelled line per branch. Use “Conditional route”, or “Delegate &amp; return” for agents that report back.';
  if (d.cat === 'agent')
    return 'Give agents tools with “Tool call” lines, and add a loop limit, a critic or a human check for anything that acts on the world.';
  if (d.tech && !compImg(n))
    return 'Upload this product’s logo in My icons (left panel) with the same name and it replaces the generic icon everywhere.';
  if (f === 'comp')
    return 'Put the concrete technology in Detail. Use a dashed “Async / event” line for queues and events.';
  if (n.t === 'fc-lgstart' || n.t === 'fc-lgend')
    return 'Graphs start at START and must have a path to END. START takes no incoming lines; END has no outgoing ones.';
  return '';
}
export function edgeGroupOrder() {
  var pri = edgeGroups(dtOf()),
    groups = {},
    order = [];
  Object.keys(EDGE).forEach(function (x) {
    var g = EDGE[x].g;
    if (!groups[g]) {
      groups[g] = [];
      order.push(g);
    }
    groups[g].push(x);
  });
  order.sort(function (a, b) {
    var ia = pri.indexOf(a),
      ib = pri.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return { groups: groups, order: order };
}
export function inspEdge__base(e) {
  var a = byId(e.from),
    b = byId(e.to),
    k = EDGE[e.type] || EDGE.line,
    s = '';
  s +=
    '<div class="ih"><div class="badge">' +
    ic('spline') +
    '</div><div><h3>' +
    esc(k.n) +
    '</h3><small>Connection</small></div></div>';
  s +=
    '<p class="note">' +
    esc(a ? a.label || T[a.t].n : 'Free end') +
    ' → ' +
    esc(b ? b.label || T[b.t].n : 'Free end') +
    '</p>';
  s += '<div class="sec"><div class="st">Content</div>';
  var go = edgeGroupOrder();
  s += field(
    'Line type',
    '<select data-f="et">' +
      go.order
        .map(function (g) {
          return (
            '<optgroup label="' +
            esc(g) +
            '">' +
            go.groups[g]
              .map(function (x) {
                return (
                  '<option value="' + x + '"' + (x === e.type ? ' selected' : '') + '>' + esc(EDGE[x].n) + '</option>'
                );
              })
              .join('') +
            '</optgroup>'
          );
        })
        .join('') +
      '</select>',
  );
  var ph =
    k.g === 'UML'
      ? e.type === 'uflow'
        ? 'event [guard] / action, or [ya]'
        : e.type === 'uassoc'
          ? 'multiplicity, e.g. 1 .. *'
          : 'message(args)'
      : e.type === 'dflow'
        ? 'name of the data, e.g. data pesanan'
        : e.type === 'c4rel'
          ? 'what it does [protocol]'
          : 'e.g. HTTPS, OrderPlaced, yes';
  s += field('Label', txtIn('elabel', e.label, ph));
  if (k.cf)
    s +=
      '<div class="row2">' +
      field(
        'Start end',
        selIn(
          'c1',
          e.c1 || 'only',
          CF_OPTS.map(function (o) {
            return [o[0], o[1]];
          }),
        ),
      ) +
      field(
        'Finish end',
        selIn(
          'c2',
          e.c2 || 'zmany',
          CF_OPTS.map(function (o) {
            return [o[0], o[1]];
          }),
        ),
      ) +
      '</div>';
  s += '</div><div class="sec"><div class="st">Shape</div>';
  s +=
    '<div class="fld"><span>Path</span><div class="seg">' +
    [
      ['', 'Elbow'],
      ['straight', 'Straight'],
      ['curve', 'Curved'],
    ]
      .map(function (r) {
        return (
          '<button type="button" data-act="route" data-v="' +
          r[0] +
          '" class="' +
          ((e.route || '') === r[0] ? 'on' : '') +
          '">' +
          r[1] +
          '</button>'
        );
      })
      .join('') +
    '</div></div>';
  s +=
    '<div class="fld"><span>Weight</span><div class="seg">' +
    [1, 1.5, 2, 3]
      .map(function (w) {
        return (
          '<button type="button" data-act="ew" data-v="' +
          w +
          '" class="' +
          ((e.width || 1.5) === w ? 'on' : '') +
          '">' +
          w +
          '</button>'
        );
      })
      .join('') +
    '</div></div>';
  var ep = route(e);
  if (ep) {
    var p1 = ep[0],
      p2 = ep[ep.length - 1];
    s +=
      '<div class="row4">' +
      [
        ['x1', 'Start X', p1.x],
        ['y1', 'Start Y', p1.y],
        ['x2', 'End X', p2.x],
        ['y2', 'End Y', p2.y],
      ]
        .map(function (c) {
          return (
            '<label class="fld"><span>' +
            c[1] +
            '</span><input class="num" type="number" step="10" data-end-coord="' +
            c[0] +
            '" value="' +
            Math.round(c[2]) +
            '"></label>'
          );
        })
        .join('') +
      '</div>';
  }
  s +=
    '</div><div class="sec"><div class="st">Color</div>' +
    swRow('stroke', 'Line', e.stroke, LINES) +
    swRow('textColor', 'Label text', e.textColor, TEXTS) +
    '</div>';
  s +=
    '<div class="sec"><div class="st">Actions</div><div class="acts"><button type="button" class="sbtn" data-act="rev">' +
    ic('arrow-right-left') +
    'Reverse</button><button type="button" class="sbtn" data-act="resetmid">Reset bend</button><button type="button" class="sbtn" data-act="resetends">Auto ends</button><button type="button" class="sbtn" data-act="dup">' +
    ic('copy') +
    'Duplicate</button><button type="button" class="sbtn del" data-act="del">' +
    ic('trash-2') +
    'Delete</button></div></div>';
  s +=
    '<p class="note">Drag the green and blue dots to re-attach the ends. On an elbow line, drag the white square to move the bend.</p>';
  return s;
}
export var inspEdge: typeof inspEdge__base = inspEdge__base;
export function set_inspEdge(v: typeof inspEdge__base) {
  return (inspEdge = v);
}
export function inspMulti() {
  var ns = selN.map(byId).filter(Boolean),
    s = '';
  s +=
    '<div class="ih"><div class="badge">' +
    ic('square-dashed') +
    '</div><div><h3>' +
    ns.length +
    ' shapes selected</h3><small>Multiple</small></div></div>';
  s += '<div class="sec"><div class="st">Align & distribute</div><div class="algn">';
  [
    ['l', 'align-start-vertical', 'Align left'],
    ['c', 'align-center-vertical', 'Align centers horizontally'],
    ['r', 'align-end-vertical', 'Align right'],
    ['dh', 'align-horizontal-distribute-center', 'Distribute horizontally'],
    ['t', 'align-start-horizontal', 'Align top'],
    ['m', 'align-center-horizontal', 'Align middles'],
    ['b', 'align-end-horizontal', 'Align bottom'],
    ['dv', 'align-vertical-distribute-center', 'Distribute vertically'],
  ].forEach(function (a) {
    var dis = (a[0] === 'dh' || a[0] === 'dv') && ns.length < 3;
    s +=
      '<button type="button" data-align="' +
      a[0] +
      '" title="' +
      a[2] +
      '" aria-label="' +
      a[2] +
      '"' +
      (dis ? ' disabled' : '') +
      '>' +
      ic(a[1]) +
      '</button>';
  });
  s += '</div></div>';
  s +=
    '<div class="sec"><div class="st">Color all</div>' +
    swRow('fill', 'Fill', null, FILLS) +
    swRow('stroke', 'Accent / line', null, LINES) +
    swRow('textColor', 'Text', null, TEXTS) +
    '</div>';
  s +=
    '<div class="sec"><div class="st">Actions</div><div class="acts"><button type="button" class="sbtn" data-act="wrap">' +
    ic('square-dashed') +
    'Wrap in zone</button><button type="button" class="sbtn" data-act="layout">' +
    ic('list-tree') +
    'Auto-arrange</button><button type="button" class="sbtn" data-act="dup">' +
    ic('copy') +
    'Duplicate</button><button type="button" class="sbtn" data-act="front">Front</button><button type="button" class="sbtn" data-act="back">Back</button><button type="button" class="sbtn del" data-act="del">' +
    ic('trash-2') +
    'Delete</button></div></div>';
  return s;
}
export var GEN_Q = ['Cost Leadership', 'Differentiation', 'Cost Focus', 'Differentiation Focus'];
export function fillCells() {
  return S.nodes
    .filter(function (n) {
      return fam(n) === 'cell' && !n.deco && !n.nobody;
    })
    .sort(function (a, b) {
      var ga = a.grp || '',
        gb = b.grp || '';
      if (ga !== gb) return ga < gb ? -1 : 1;
      return Math.abs(a.y - b.y) > 24 ? a.y - b.y : a.x - b.x;
    });
}
export function quickFill(cells) {
  var filled = cells.filter(function (c) {
      return String(c.body || '').trim();
    }).length,
    s = '<div class="sec qf"><div class="st">Fill in · ' + filled + '/' + cells.length + '</div>';
  var quads = S.nodes.filter(function (n) {
    return fam(n) === 'cell' && GEN_Q.indexOf(n.label) >= 0;
  });
  if (quads.length === 4) {
    var cur = quads.filter(function (q) {
      return q.hl;
    })[0];
    s += field(
      'Chosen strategy',
      selIn(
        '',
        cur ? cur.id : '',
        [['', 'Not chosen yet']].concat(
          quads.map(function (q) {
            return [q.id, q.label];
          }),
        ),
        'data-qg="1"',
      ),
    );
  }
  cells.forEach(function (c) {
    var lab = String(c.qf || c.label || 'Block').replace(/\s+/g, ' ');
    s +=
      '<div class="qf-cell"><div class="qf-head"><span class="tone" style="background:' +
      cellTone(c) +
      '"></span><b>' +
      esc(lab) +
      '</b>' +
      (c.badge != null
        ? selIn(
            '',
            c.badge || '',
            [['', 'Level']].concat(LEVELS.slice(1, 4)),
            'data-qb="' + c.id + '" aria-label="Level for ' + esc(lab) + '"',
          )
        : '') +
      '<button type="button" class="qf-go" data-qgo="' +
      c.id +
      '" title="Show on canvas" aria-label="Show ' +
      esc(lab) +
      ' on canvas">' +
      ic('scan-eye') +
      '</button></div><textarea data-qf="' +
      c.id +
      '" rows="3" placeholder="' +
      esc(c.ph || 'One line = one point') +
      '" aria-label="' +
      esc(lab) +
      '">' +
      esc(c.body || '') +
      '</textarea></div>';
  });
  return s + '<p class="note">One line = one point. The canvas updates as you type.</p></div>';
}
export function typeTips(dt) {
  var k = dtKind(dt);
  if (k === 'fw')
    return '<ul class="tips"><li>Fill every block from the list above, or double-click a block on the canvas.</li><li>Insert more frameworks from the left panel. Each one moves as a unit; hold <kbd>Alt</kbd> to move one block.</li><li><b>Generate</b> fills the whole framework from a short description of the case.</li></ul>';
  if (k === 'tree')
    return '<ul class="tips"><li>Select a box: <kbd>Tab</kbd> adds a child, <kbd>Enter</kbd> adds a sibling, then just type.</li><li><b>Edit as outline</b> lets you restructure the whole tree as indented text.</li></ul>';
  if (dt === 'sequence')
    return '<ul class="tips"><li>Add lifelines from the left panel; they line up automatically.</li><li>Drag from one dashed line to another to add a message at that height.</li></ul>';
  if (dt === 'board')
    return '<ul class="tips"><li>Press <kbd>P</kbd> for the pen, <kbd>V</kbd> to select again.</li><li>Drop sticky notes into a frame to group them.</li></ul>';
  return '<ul class="tips"><li><b>Add</b>: click or drag from the left panel, or double-click the canvas. With a shape selected, a click adds the next one beside it, already connected.</li><li><b>Connect</b>: hover a shape and drag one of its blue ports onto another shape.</li><li>Run <b>Check</b> before you export to catch common modelling mistakes.</li></ul>';
}
export function inspDoc__base() {
  var dt = dtOf(),
    D = DT[dt],
    nz = S.nodes.filter(isCont).length,
    s = '';
  s +=
    '<div class="ih"><div class="badge">' +
    ic(DT_ICON[dt] || 'layout-grid') +
    '</div><div><h3>' +
    esc(DOC.title || 'Untitled diagram') +
    '</h3><small>' +
    esc(D.n + ' · ' + WS_BY[D.ws].n) +
    '</small></div></div>';
  s +=
    '<div class="stats"><div class="stat"><b>' +
    (S.nodes.length - nz) +
    '</b><span>' +
    (S.nodes.length - nz === 1 ? 'shape' : 'shapes') +
    '</span></div><div class="stat"><b>' +
    S.edges.length +
    '</b><span>' +
    (S.edges.length === 1 ? 'line' : 'lines') +
    '</span></div><div class="stat"><b>' +
    nz +
    '</b><span>' +
    (nz === 1 ? 'container' : 'containers') +
    '</span></div></div>';
  var cells = fillCells();
  if (cells.length) s += quickFill(cells);
  if (
    D.tree ||
    S.nodes.some(function (n) {
      return TREEF[fam(n)];
    })
  )
    s +=
      '<div class="sec"><div class="st">Tree</div><div class="acts"><button type="button" class="sbtn" data-act="outline">' +
      ic('text-quote') +
      'Edit as outline</button><button type="button" class="sbtn" data-act="tree-tidy">' +
      ic('list-tree') +
      'Tidy</button></div></div>';
  s += '<div class="sec"><div class="st">Canvas</div><div class="acts">';
  s +=
    '<button type="button" class="sbtn' +
    (grid ? ' on' : '') +
    '" data-act="grid">' +
    ic('magnet') +
    'Snap & guides</button>';
  s +=
    '<button type="button" class="sbtn' +
    (animate ? ' on' : '') +
    '" data-act="anim">' +
    ic('play') +
    'Animate flow</button>';
  s +=
    '<button type="button" class="sbtn' +
    (S.style === 'sketch' ? ' on' : '') +
    '" data-act="sketch">' +
    ic('brush') +
    'Sketch style</button>';
  s += '<button type="button" class="sbtn" data-act="fit">' + ic('maximize') + 'Fit</button>';
  s += '</div></div>';
  s +=
    '<div class="sec"><div class="st">' +
    esc(D.n) +
    '</div><p class="note">' +
    esc(D.hint) +
    '</p>' +
    typeTips(dt) +
    '</div>';
  s +=
    '<div class="sec"><div class="st">Diagram</div><div class="acts"><button type="button" class="sbtn" data-act="newdoc">' +
    ic('file-plus-2') +
    'New ' +
    esc(D.n) +
    '</button><button type="button" class="sbtn del" data-act="clear">' +
    ic('trash-2') +
    'Clear canvas</button></div></div>';
  return s;
}
export var inspDoc: typeof inspDoc__base = inspDoc__base;
export function set_inspDoc(v: typeof inspDoc__base) {
  return (inspDoc = v);
}
export function renderInsp__base() {
  var one = single(),
    s,
    keep = inspBody.scrollTop,
    docView = !one && !(selE && !selN.length && eById(selE)) && selN.length < 2;
  if (one) s = inspNode(one);
  else if (selE && !selN.length && eById(selE)) s = inspEdge(eById(selE));
  else if (selN.length > 1) s = inspMulti();
  else s = inspDoc();
  inspBody.innerHTML = s;
  if (docView && inspWasDoc) inspBody.scrollTop = keep;
  inspWasDoc = docView;
}
export var renderInsp: typeof renderInsp__base = renderInsp__base;
export function set_renderInsp(v: typeof renderInsp__base) {
  return (renderInsp = v);
}
export function inspTargets() {
  if (selN.length) return selN.map(byId).filter(Boolean);
  if (selE) {
    var e = eById(selE);
    return e ? [e] : [];
  }
  return [];
}
export function moveNodeTo(n, x, y) {
  var dx = x == null ? 0 : x - n.x,
    dy = y == null ? 0 : y - n.y;
  moveSet([n.id]).list.forEach(function (o) {
    o.x += dx;
    o.y += dy;
  });
}
export function pickGen(id) {
  var quads = S.nodes.filter(function (n) {
    return fam(n) === 'cell' && GEN_Q.indexOf(n.label) >= 0;
  });
  quads.forEach(function (q) {
    if (q.id === id) {
      q.hl = 1;
      if (!q.hlText) {
        var org = S.nodes.filter(function (o) {
          return o.grp && o.grp === q.grp && o.hlText;
        })[0];
        q.hlText = org ? org.hlText : 'Pilihan';
      }
    } else delete q.hl;
  });
}
export function applyField(el) {
  var v = el.value;
  var q = el.getAttribute('data-qf');
  if (q) {
    var c = byId(q);
    if (c) c.body = v;
    return;
  }
  var qb = el.getAttribute('data-qb');
  if (qb) {
    var c2 = byId(qb);
    if (c2) c2.badge = v;
    return;
  }
  if (el.hasAttribute('data-qg')) {
    pickGen(v);
    return;
  }
  var n = single(),
    e = !n && selE && !selN.length ? eById(selE) : null,
    f = el.getAttribute('data-f');
  if (el.hasAttribute('data-lane-name') && n) {
    n.lanes[+el.getAttribute('data-lane-name')].name = v;
    return;
  }
  if (el.hasAttribute('data-lane-h') && n) {
    var h = +v;
    if (h >= 40) {
      n.lanes[+el.getAttribute('data-lane-h')].h = h;
      syncPool(n);
    }
    return;
  }
  if (f && f.indexOf('lane:') === 0 && n && validColor(v)) {
    var li = +f.slice(5);
    if (n.lanes && n.lanes[li]) n.lanes[li].fill = v;
    return;
  }
  if (COLOR_KEYS.indexOf(f) >= 0) {
    if (validColor(v))
      inspTargets().forEach(function (o) {
        o[f] = v;
        o.uc = 1;
      });
    return;
  }
  if (n) {
    if (TXTF[f]) n[f] = v;
    else if (f === 'rows') {
      var r = Math.round(+v);
      if (r >= 1 && r <= 12) n.rows = r;
    } else if (f === 'x' && v !== '' && isFinite(+v)) moveNodeTo(n, +v, null);
    else if (f === 'y' && v !== '' && isFinite(+v)) moveNodeTo(n, null, +v);
    else if (f === 'w' && +v >= 20) n.w = +v;
    else if (f === 'h' && +v >= 20) {
      if (fam(n) === 'pool' && n.lanes && n.lanes.length) {
        var sc = +v / n.h;
        n.lanes.forEach(function (l) {
          l.h = Math.max(50, Math.round(l.h * sc));
        });
        syncPool(n);
      } else n.h = +v;
    } else if (f === 't' && T[v]) {
      var cc = center(n),
        old = n.t,
        oldName = T[old].n;
      n.t = v;
      var nf = fam(n);
      if (n.label === oldName || (!n.label && (nf === 'comp' || nf === 'zone'))) n.label = T[v].n;
      var fixed = { ev: 1, gw: 1, data: 1 };
      if (
        fixed[nf] ||
        nf === 'dfd' ||
        nf === 'c4' ||
        (nf === 'shape' &&
          (['connector', 'lgstart', 'lgend', 'decision'].indexOf(T[v].k) >= 0 ||
            ['connector', 'lgstart', 'lgend', 'decision'].indexOf(T[old].k) >= 0))
      ) {
        var sz = size(v);
        n.w = sz[0];
        n.h = sz[1];
      }
      n.x = snap(cc.x - n.w / 2);
      n.y = snap(cc.y - n.h / 2);
    }
  } else if (e) {
    var ec = el.getAttribute('data-end-coord');
    if (ec && v !== '' && isFinite(+v)) {
      var pts = route(e),
        start = ec.slice(-1) === '1',
        p = { x: (start ? pts[0] : pts[pts.length - 1]).x, y: (start ? pts[0] : pts[pts.length - 1]).y };
      p[ec[0]] = +v;
      setEdgePoint(e, start, p, null);
    }
    if (f === 'et' && EDGE[v]) {
      e.type = v;
      if (EDGE[v].cf) {
        e.c1 = e.c1 || 'only';
        e.c2 = e.c2 || 'zmany';
      }
      if (EDGE[v].lab && !e.label) e.label = EDGE[v].lab;
    } else if (f === 'elabel') e.label = v;
    else if (f === 'c1' || f === 'c2') e[f] = v;
  }
}
export var inspUndoArmed = false;
export function wrapInZone() {
  var ns = selN.map(byId).filter(Boolean);
  if (!ns.length) return;
  var b = bounds(ns, []),
    z = addNode('z-zgroup', 0, 0);
  z.label = 'Group';
  z.x = snap(b.x - 30);
  z.y = snap(b.y - 50);
  z.w = snap(b.w + 60);
  z.h = snap(b.h + 80);
  set_selN([z.id]);
  set_selE(null);
  setTimeout(function () {
    startEdit({ k: 'n', id: z.id });
  }, 0);
}
export function toggleGrid() {
  set_grid(!grid);
  $('tGrid').classList.toggle('on', grid);
  applyCam();
  renderInsp();
  toast(grid ? 'Snap to grid and alignment guides on' : 'Free placement');
}
export function toggleAnim() {
  set_animate(!animate);
  $('tFlow').classList.toggle('on', animate);
  render();
  renderInsp();
}
export function toggleSketch() {
  pushUndo();
  if (S.style === 'sketch') delete S.style;
  else S.style = 'sketch';
  applyStyle();
  renderAll();
  toast(S.style === 'sketch' ? 'Sketch style on (saved with this diagram)' : 'Clean style');
}

export function install(): void {
  ICON_CHOICES = (function () {
    var seen = {},
      out = [];
    COMPS.concat(ZONES).forEach(function (c) {
      if (!seen[c[2]]) {
        seen[c[2]] = 1;
        out.push(c[2]);
      }
    });
    [
      'target',
      'lightbulb',
      'heart',
      'smile',
      'flag',
      'users',
      'user',
      'chart-line',
      'credit-card',
      'package',
      'message-circle',
      'send',
      'list-todo',
      'calendar',
      'smartphone',
      'earth',
      'scale',
      'landmark',
      'triangle-alert',
      'circle-check-big',
      'square-user',
      'briefcase',
    ].forEach(function (k) {
      if (!seen[k] && ICONS[k]) {
        seen[k] = 1;
        out.push(k);
      }
    });
    return out;
  })();
  inspBody.addEventListener('focusin', function (ev) {
    if ((ev.target as HTMLInputElement).matches('input,textarea,select') && !inspUndoArmed) {
      pushUndo();
      inspUndoArmed = true;
    }
  });
  inspBody.addEventListener('focusout', function () {
    inspUndoArmed = false;
  });
  inspBody.addEventListener('input', function (ev) {
    if ((ev.target as HTMLInputElement).matches('select')) return;
    applyField(ev.target);
    render();
    if ((ev.target as HTMLInputElement).hasAttribute('data-qf')) {
      var st = inspBody.querySelector('.qf .st');
      if (st) {
        var cs = fillCells();
        st.textContent =
          'Fill in · ' +
          cs.filter(function (c) {
            return String(c.body || '').trim();
          }).length +
          '/' +
          cs.length;
      }
    }
  });
  inspBody.addEventListener('change', function (ev) {
    if ((ev.target as HTMLInputElement).matches('select')) {
      applyField(ev.target);
      renderAll();
    } else if ((ev.target as HTMLInputElement).type === 'number') {
      renderAll();
    }
  });
  inspBody.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && (ev.target as HTMLInputElement).matches('input,textarea')) {
      (ev.target as HTMLInputElement).blur();
    }
  });
  inspBody.addEventListener('click', function (ev) {
    var sw = (ev.target as HTMLInputElement).closest('[data-sw]');
    if (sw) {
      var key = sw.getAttribute('data-sw'),
        v = sw.getAttribute('data-v');
      pushUndo();
      if (key.indexOf('lane:') === 0) {
        var n0 = single(),
          li = +key.slice(5);
        if (n0 && n0.lanes && n0.lanes[li]) {
          if (v) n0.lanes[li].fill = v;
          else delete n0.lanes[li].fill;
        }
      } else
        inspTargets().forEach(function (o) {
          if (v) o[key] = v;
          else delete o[key];
        });
      renderAll();
      return;
    }
    var icb = (ev.target as HTMLInputElement).closest('[data-icon]');
    if (icb) {
      var ni = single();
      if (ni) {
        pushUndo();
        var d = T[ni.t];
        if (icb.getAttribute('data-icon') === d.icon) delete ni.icon;
        else ni.icon = icb.getAttribute('data-icon');
        renderAll();
      }
      return;
    }
    var imb = (ev.target as HTMLInputElement).closest('[data-img]');
    if (imb) {
      var nm = single();
      if (nm) {
        pushUndo();
        var iv = imb.getAttribute('data-img');
        if (iv) nm.img = iv;
        else delete nm.img;
        renderAll();
      }
      return;
    }
    var go = (ev.target as HTMLInputElement).closest('[data-qgo]');
    if (go) {
      var gid = go.getAttribute('data-qgo');
      revealTarget({ n: [gid] });
      return;
    }
    var al = (ev.target as HTMLInputElement).closest('[data-align]');
    if (al) {
      var a = al.getAttribute('data-align');
      if (a === 'dh') distribute('h');
      else if (a === 'dv') distribute('v');
      else align(a);
      return;
    }
    var b = (ev.target as HTMLInputElement).closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act'),
      n = single(),
      e = !n && selE ? eById(selE) : null;
    if (act === 'icons') {
      iconOpen = !iconOpen;
      renderInsp();
      return;
    }
    if (act === 'icons-open') {
      openModal('mIcons');
      return;
    }
    if (act === 'grid') {
      toggleGrid();
      return;
    }
    if (act === 'anim') {
      toggleAnim();
      return;
    }
    if (act === 'sketch') {
      toggleSketch();
      return;
    }
    if (act === 'fit') {
      fitView();
      return;
    }
    if (act === 'newdoc') {
      newDiagram();
      return;
    }
    if (act === 'layout' || act === 'tree-tidy') {
      autoArrange();
      return;
    }
    if (act === 'outline') {
      openModal('mOutline');
      return;
    }
    if (act === 'tree-child' && n) {
      treeAdd(n, 'child');
      return;
    }
    if (act === 'tree-sib' && n) {
      treeAdd(n, 'sibling');
      return;
    }
    if (act === 'selgrp' && n && n.grp) {
      var g = n.grp;
      setSel(
        S.nodes
          .filter(function (o) {
            return o.grp === g;
          })
          .map(function (o) {
            return o.id;
          }),
      );
      return;
    }
    if (act === 'front') {
      toFront();
      return;
    }
    if (act === 'back') {
      toBack();
      return;
    }
    if (act === 'dup') {
      dupSel();
      return;
    }
    if (act === 'clear') {
      if (!S.nodes.length && !S.edges.length) return;
      pushUndo();
      S.nodes = [];
      S.edges = [];
      set_selN([]);
      set_selE(null);
      renderAll();
      toast('Canvas cleared. Press Ctrl+Z to bring it back.');
      return;
    }
    pushUndo();
    if (act === 'del') delSel();
    else if (act === 'wrap') wrapInZone();
    else if (act === 'colors-reset')
      inspTargets().forEach(function (o) {
        COLOR_KEYS.forEach(function (k) {
          delete o[k];
        });
        delete o.uc;
        if (o.lanes)
          o.lanes.forEach(function (l) {
            delete l.fill;
          });
      });
    else if (act === 'look' && n) {
      var c = center(n),
        lv = b.getAttribute('data-v');
      if (lv === 'tile') {
        n.look = 'tile';
        n.w = 64;
        n.h = 64;
      } else {
        delete n.look;
        var sz = size(n.t);
        n.w = sz[0];
        n.h = sz[1];
      }
      n.x = snap(c.x - n.w / 2);
      n.y = snap(c.y - n.h / 2);
    } else if (act === 'icon-reset' && n) delete n.icon;
    else if (act === 'setp' && n) {
      var pk = b.getAttribute('data-k'),
        pv = b.getAttribute('data-v');
      if (pv === '') delete n[pk];
      else n[pk] = NUMK[pk] ? +pv : pv;
    } else if (act === 'togp' && n) {
      var tk = b.getAttribute('data-k');
      if (n[tk]) delete n[tk];
      else n[tk] = 1;
      if (tk === 'hl' && n.hl && fam(n) === 'cell' && GEN_Q.indexOf(n.label) >= 0) pickGen(n.id);
    } else if (act === 'lane-add' && n) {
      n.lanes = n.lanes || [];
      if (!n.lanes.length) n.lanes.push({ name: 'Lane 1', h: Math.max(60, n.h) });
      n.lanes.push({ name: 'Lane ' + (n.lanes.length + 1), h: 120 });
      syncPool(n);
    } else if (act === 'lane-del' && n) {
      n.lanes.splice(+b.getAttribute('data-i'), 1);
      if (!n.lanes.length) n.h = Math.max(80, n.h);
      syncPool(n);
    } else if (act === 'rev' && e) {
      [
        ['from', 'to'],
        ['start', 'end'],
        ['fromAnchor', 'toAnchor'],
        ['c1', 'c2'],
      ].forEach(function (k) {
        var t = e[k[0]];
        e[k[0]] = e[k[1]];
        e[k[1]] = t;
        if (e[k[0]] === undefined) delete e[k[0]];
        if (e[k[1]] === undefined) delete e[k[1]];
      });
      e.mx = e.my = null;
    } else if (act === 'resetends' && e) {
      if (e.from) delete e.fromAnchor;
      if (e.to) delete e.toAnchor;
    } else if (act === 'resetmid' && e) {
      e.mx = e.my = null;
    } else if (act === 'route' && e) {
      var rv = b.getAttribute('data-v');
      if (rv) e.route = rv;
      else delete e.route;
      e.mx = e.my = null;
    } else if (act === 'ew' && e) {
      e.width = +b.getAttribute('data-v');
      if (e.width === 1.5) delete e.width;
    }
    renderAll();
  });
}
