// Regenerate the README images: node scripts/screenshots.mjs (after npm run build)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'docs', 'assets');
mkdirSync(out, { recursive: true });
const url = 'file://' + join(root, 'dist', 'index.html');

const SHOTS = [
  { file: 'hero.png', example: 'prodai', theme: 'light' },
  { file: 'architecture-dark.png', example: 'k8s:Web app on Kubernetes', theme: 'dark' },
  { file: 'erd.png', example: 'erd:POS (crow’s foot)', theme: 'light' },
  { file: 'sequence.png', example: 'sequence:Booking meja', theme: 'light' },
  { file: 'usecase.png', example: 'usecase:Sistem POS Biliar', theme: 'light' },
];

const browser = await chromium.launch();
for (const s of SHOTS) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 2, colorScheme: s.theme, locale: 'en-US' });
  const p = await ctx.newPage();
  await p.goto(url);
  await p.evaluate((t) => { localStorage.clear(); localStorage.setItem('rancang:theme', t) }, s.theme);
  await p.reload();
  await p.waitForTimeout(800);
  const has = await p.evaluate((v) => [...document.querySelectorAll('#tplSel option')].some((o) => o.value === v), s.example);
  if (!has) { console.log('skip (no example)', s.example); await ctx.close(); continue; }
  await p.selectOption('#tplSel', s.example);
  await p.waitForTimeout(1200);
  await p.click('#zFit').catch(() => {});
  await p.waitForTimeout(500);
  await p.evaluate(() => { const t = document.getElementById('toast'); if (t) t.hidden = true; t && (t.style.display = 'none') });
  await p.screenshot({ path: join(out, s.file) });
  console.log('docs/assets/' + s.file);
  await ctx.close();
}
await browser.close();
