// Build PDA, then run the browser suites. Usage: node tests/run.mjs [--quick] [suite ...]
import { writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '../scripts/build.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ALL = ['run2', 'roles', 'roles2', 'nav', 'more', 'deck', 'px', 'llm', 'llmstat', 'sim', 'audit', 'axe2', 'axe3',
  'pxxss', 'csp', 'folder', 'ux2', 'wp', 'kbd', 'theme', 'aigen', 'tech', 'rtdrag', 'layout', 'perf'];
const QUICK = ['roles', 'csp', 'folder', 'llmstat', 'nav', 'ux2', 'wp', 'kbd', 'theme', 'rtdrag', 'layout'];

const args = process.argv.slice(2);
const named = args.filter((a) => !a.startsWith('--'));
const suites = named.length ? named : args.includes('--quick') ? QUICK : ALL;

// page.html is the app as shipped; page-hook.html also exposes internals as window.__RS
writeFileSync(join(here, 'page.html'), bundle());
writeFileSync(join(here, 'page-hook.html'), bundle({ inject: readFileSync(join(here, 'hook.txt'), 'utf8') }));

let pass = 0, fail = 0;
const failed = [];
for (const s of suites) {
  const r = spawnSync(process.execPath, [join(here, s + '.cjs')], { cwd: here, encoding: 'utf8', timeout: 600000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const lines = out.split('\n');
  const p = lines.filter((l) => /^PASS|^ {2}ok|: no violations/.test(l)).length;
  let f = lines.filter((l) => /^FAIL|violations: [1-9]|^Error|pageerror/.test(l)).length;
  if (lines.some((l) => /^errors \[/.test(l) && !/^errors \[\]/.test(l))) f++;
  if (r.status !== 0 && !f) f++;
  pass += p; fail += f;
  if (f) {
    failed.push(s);
    console.log(`✗ ${s.padEnd(8)} ${String(p).padStart(3)} pass ${String(f).padStart(3)} fail`);
    lines.filter((l) => /^FAIL/.test(l)).slice(0, 5).forEach((l) => console.log('    ' + l));
    if (r.status !== 0) console.log('    ' + lines.filter(Boolean).slice(-3).join('\n    '));
  } else console.log(`✓ ${s.padEnd(8)} ${String(p).padStart(3)} pass`);
}
console.log(`----\nTOTAL ${pass} pass, ${fail} fail` + (failed.length ? `\nFAILED: ${failed.join(' ')}` : ''));
process.exit(failed.length ? 1 : 0);
