// Interface language: English or Bahasa Indonesia.
// The choice is remembered per browser; without one, the browser's language
// decides (Indonesian browsers get Indonesian, everyone else English).
// Only the interface changes: diagram content stays as the person wrote it.
import { saveNow } from '../core/features';
import { closeMenus } from '../core/ui';
import { NV_ACTS, nvMoreItems, set_nvMoreItems } from '../editor/navigation';

export type Lang = 'en' | 'id';
const LANG_KEY = 'rancang:lang';

export function storedLang(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === 'en' || v === 'id' ? v : null;
  } catch (e) {
    return null;
  }
}

export function detectLang(): Lang {
  return (
    storedLang() ||
    (/^id\b/i.test((navigator.languages && navigator.languages[0]) || navigator.language || '') ? 'id' : 'en')
  );
}

export var LANG: Lang = detectLang();

/** Pick the string for the current language (for text built in code). */
export function L(en: string, id: string): string {
  return LANG === 'id' ? id : en;
}

/** Switch language: save the open project, remember the choice, reload. */
export function setLang(next: Lang): void {
  if (next === LANG) return;
  try {
    saveNow(true);
  } catch (e) {}
  try {
    localStorage.setItem(LANG_KEY, next);
  } catch (e) {}
  location.reload();
}

const LABEL: Record<Lang, string> = { en: 'English', id: 'Bahasa Indonesia' };

export var langMore0: typeof nvMoreItems;

export function install(): void {
  document.documentElement.lang = LANG;
  langMore0 = nvMoreItems;
  set_nvMoreItems(function () {
    const items = langMore0();
    const other: Lang = LANG === 'en' ? 'id' : 'en';
    const i = items.indexOf('-');
    items.splice(i + 1, 0, [
      'lang',
      'languages',
      LANG === 'en' ? 'Language: English' : 'Bahasa: Indonesia',
      LANG === 'en' ? 'Switch to ' + LABEL[other] : 'Ganti ke ' + LABEL[other],
    ]);
    return items;
  });
  NV_ACTS.push(
    ['lang-en', 'Language: English', 'languages', 'language bahasa english inggris', () => setLang('en')],
    ['lang-id', 'Bahasa: Indonesia', 'languages', 'language bahasa indonesia', () => setLang('id')],
  );
  document.addEventListener(
    'click',
    function (ev) {
      const m = (ev.target as Element).closest && (ev.target as Element).closest('[data-nvm=lang]');
      if (!m) return;
      ev.stopPropagation();
      closeMenus();
      setLang(LANG === 'en' ? 'id' : 'en');
    },
    true,
  );
}
