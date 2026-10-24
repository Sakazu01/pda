// AI on every canvas: always-visible button, repeatable, results placed beside
import { $, ic } from '../core/core';
import { commitEdit, stage } from '../core/ui';
import { openModal } from '../core/features';
import {
  graphPrompt,
  prepGen,
  runGenerate,
  set_genMode,
  set_graphPrompt,
  set_prepGen,
  set_runGenerate,
} from './generate';
import { aiReady } from './providers';
import { nvAiSettings } from '../editor/navigation';
import { genTitle } from './intent';

export var ux2PrepGen1: () => void;
// results land beside what is already there and the view follows them
export var ux2RunGen2: () => void;
// design quality: the same layout rules a good diagrammer follows
export var ux2GraphPrompt0: (text: any, dt: any) => string;

export function install(): void {
  // AI on every canvas: always-visible button, repeatable, results placed beside
  (function () {
    if ($('aiFab')) return;
    stage.insertAdjacentHTML(
      'beforeend',
      '<button type="button" class="ai-fab" id="aiFab" title="Buat diagram dengan AI di kanvas ini (bisa berkali-kali; hasil baru diletakkan di sebelah yang lama)">' +
        ic('sparkles') +
        '<span>Buat dengan AI</span></button>',
    );
    $('aiFab').addEventListener('click', function (ev) {
      ev.stopPropagation();
      commitEdit();
      if (typeof aiReady === 'function' && !aiReady()) {
        if (typeof nvAiSettings === 'function') nvAiSettings();
        else openModal('mLlm');
        return;
      }
      openModal('mGen');
      $('genProg').textContent = '';
    });
    $('aiFab').addEventListener('pointerdown', function (ev) {
      ev.stopPropagation();
    });
  })();
  ux2PrepGen1 = prepGen;
  set_prepGen(function () {
    ux2PrepGen1();
    set_genMode('add');
    [].forEach.call($('genMode').querySelectorAll('button'), function (b) {
      b.classList.toggle('on', b.getAttribute('data-v') === 'add');
    });
    genTitle();
  });
  ux2RunGen2 = runGenerate;
  set_runGenerate(function (this: any) {
    var r = ux2RunGen2.apply(this, arguments);
    return r;
  });
  ux2GraphPrompt0 = graphPrompt;
  set_graphPrompt(function (text, dt) {
    return (
      ux2GraphPrompt0(text, dt) +
      '\n\nDesign quality (very important, the result is shown as a finished diagram):\n- Prefer 7 to 14 nodes; merge trivial steps, never pad.\n- Main flow reads left to right; put the actor or client first and data stores last.\n- Group related nodes in 2 to 4 zones with meaningful names (for example "Edge", "Services", "Data").\n- Every node gets a "sub" of at most 5 words: the technology or its one responsibility.\n- Edge labels only where they add meaning: protocol, event name, or condition; at most 3 words.\n- Use consistent naming (same language as the request, Title Case for nodes, no trailing punctuation).\n- No orphan nodes: every node has at least one edge.'
    );
  });
}
