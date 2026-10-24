// Extra Lucide icons used by the line toolbar and the goal guide.
import { ICONS } from '../vendor/lucide-icons';
import { EXCALI_FONT_CSS } from '../vendor/excalifont';
import { FONT, FONT_CLEAN, S, lsGet0, lsSet, set_FONT, set_FONT_CLEAN } from '../core/core';
import { applyStyle, renderAll, toast } from '../core/ui';

// canvas font: Excalifont by default, "Normal" on request
export var FONT_EXCALI = 'Excalifont, "Segoe UI Symbol", "Apple Symbols", system-ui, sans-serif';
export var FONT_NORMAL0: string;
export var CANVAS_FONT: string;
export function canvasFontStack() {
  return CANVAS_FONT === 'excali' ? FONT_EXCALI : FONT_NORMAL0;
}
export function usesExcali() {
  return FONT.indexOf('Excalifont') >= 0;
}
export function setCanvasFont(v) {
  CANVAS_FONT = v === 'normal' ? 'normal' : 'excali';
  lsSet('rancang:font', CANVAS_FONT);
  set_FONT_CLEAN(canvasFontStack());
  applyStyle();
  renderAll();
  toast(CANVAS_FONT === 'excali' ? 'Font kanvas: Excalifont (seperti Excalidraw)' : 'Font kanvas: Normal (sans-serif)');
}
export function toggleCanvasFont() {
  setCanvasFont(CANVAS_FONT === 'excali' ? 'normal' : 'excali');
}

export function install(): void {
  // Extra Lucide icons used by the line toolbar and the goal guide.

  Object.assign(ICONS, {
    slash: '<path d="M22 2 2 22"/>',
    crosshair:
      '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
    'list-checks':
      '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  });
  FONT_NORMAL0 = FONT_CLEAN;
  CANVAS_FONT = lsGet0('rancang:font') === 'normal' ? 'normal' : 'excali';
  set_FONT_CLEAN(canvasFontStack());
  set_FONT(FONT_CLEAN);
  (function () {
    try {
      var st = document.createElement('style');
      st.id = 'excaliFont';
      st.textContent = EXCALI_FONT_CSS;
      document.head.appendChild(st);
    } catch (e) {}
    // widths are measured on a canvas: re-measure once the font is really there
    if (document.fonts && document.fonts.load)
      document.fonts.load('16px Excalifont').then(
        function () {
          if (CANVAS_FONT === 'excali' && typeof renderAll === 'function' && S && S.nodes)
            try {
              renderAll();
            } catch (e) {}
        },
        function () {},
      );
  })();
}
