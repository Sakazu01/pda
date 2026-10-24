// Interface text in English: applies the Indonesian → English dictionary
// (en-dict.ts) to text nodes and attributes outside the canvas.
import { EN, EN_RE } from './en-dict';
export { EN, EN_RE };

/** Never translate the canvas, user input, example names or the project name. */
export var EN_SKIP = '#svg,#content,#miniSvg,script,style,textarea,input,#tplSel,.docname,#docTitle,kbd,.lib-item .t';

let parts: [string, string][] | null = null;
// Translations are pure, so remember them: the observer re-runs on every render.
const memo = new Map<string, string>();

export function trEn(s: string): string {
  if (typeof s !== 'string' || s.length < 2) return s;
  const hit = memo.get(s);
  if (hit != null) return hit;
  const out = trEnRaw(s);
  if (memo.size > 5000) memo.clear();
  memo.set(s, out);
  return out;
}

function trEnRaw(s: string): string {
  const k = s.replace(/\s+/g, ' ').trim();
  if (!k) return s;
  const v = EN[k];
  if (v != null) return s.indexOf(k) >= 0 ? s.replace(k, v) : v;
  for (const [re, to] of EN_RE) {
    const m = re.exec(k);
    if (m) return to.replace(/\$(\d)/g, (_, i) => trEn(m[+i]));
  }
  // "Bisnis & SI · ada isi": translate each part of a dotted label
  if (k.indexOf(' · ') > 0) {
    const segs = k.split(' · ');
    const tr = segs.map((x) => EN[x] || x);
    if (tr.some((x, i) => x !== segs[i])) return tr.join(' · ');
  }
  // phrases inside composed text: longest first so a sentence wins over its fragments
  parts =
    parts ||
    Object.keys(EN)
      .filter((p) => p.length >= 10)
      .sort((a, b) => b.length - a.length)
      .map((p): [string, string] => [p, EN[p]]);
  let res = s;
  for (const [id, en] of parts) if (res.indexOf(id) >= 0) res = res.split(id).join(en);
  return res;
}
