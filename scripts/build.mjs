// Build PDA into one self-contained HTML file: dist/index.html.
// The app is TypeScript (src/**/*.ts, ES modules). esbuild bundles it into
// one script; src/main.ts runs every module's install() in a fixed order.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildSync } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (p) => readFileSync(join(root, 'src', p), 'utf8');

// opts.hook: also install tests/hook.ts (exposes internals as window.__RS for tests)
function script(opts) {
  const entry = "import { start } from './src/main';\n" + (opts.hook ? "import { install as hook } from './tests/hook';\n" : '')
    + 'start();\n' + (opts.hook ? 'hook();\n' : '');
  const r = buildSync({
    stdin: { contents: entry, resolveDir: root, sourcefile: 'entry.ts', loader: 'ts' },
    bundle: true, format: 'iife', target: 'es2019', banner: { js: '"use strict";' }, write: false, charset: 'utf8', legalComments: 'inline', logLevel: 'error',
  });
  return r.outputFiles[0].text.trim();
}

// Content-Security-Policy for the shipped page. The one inline script is
// allowed by its hash, so injected markup can never run script. Network
// access is limited to what the app needs: Google Fonts, the pinned
// PowerPoint library (with SRI), and the AI endpoint the person configures.
function csp(js) {
  const hash = createHash('sha256').update(js).digest('base64');
  return [
    "default-src 'none'",
    `script-src 'sha256-${hash}' https://cdn.jsdelivr.net https://unpkg.com`,
    "style-src 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src https: data: blob: http://localhost:* http://127.0.0.1:*",
    "worker-src blob:",
    "base-uri 'none'",
    "form-action 'none'",
    "object-src 'none'",
  ].join('; ');
}

const ICON = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="9" fill="#0f6b73"/><path d="M10.5 24.5V8.5h6.2a4.6 4.6 0 0 1 0 9.2h-6.2M16.7 17.7h3.3a2 2 0 0 1 2 2v1.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="22" cy="24.4" r="2.7" fill="#ffb84d"/></svg>');

// opts.hook: test build with window.__RS
// opts.artifact: page body only, for hosts that add their own document shell and CSP
export function bundle(opts = {}) {
  // Tags written inside JS strings ('<img src=...') are spelled '\x3cimg' so the
  // browser's HTML preload scanner never mistakes them for real elements.
  const js = script(opts)
    .replace(/<(?=\/?(img|image|script|style|link|iframe|video|audio|source|object|embed)\b)/gi, '\\x3c');
  const app = src('shell/head.html') + '\n' + src('shell/body.html') + '\n<script>' + js + '</script>\n';
  if (opts.artifact) return app;
  return '<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    + `<meta http-equiv="Content-Security-Policy" content="${csp(js)}">\n`
    + '<meta name="referrer" content="no-referrer">\n'
    + '<meta name="description" content="PDA: Plan &amp; Design Anything. Diagram studio for business strategy, process modeling, software architecture, AI and automation.">\n'
    + `<link rel="icon" href="${ICON}">\n`
    + src('shell/head.html') + '\n</head>\n<body>\n' + src('shell/body.html')
    + '\n<script>' + js + '</script>\n</body>\n</html>\n';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--artifact');
  const out = i > 0 ? process.argv[i + 1] : join(root, 'dist', 'index.html');
  const html = bundle({ artifact: i > 0 });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log(`${out}  ${(html.length / 1024).toFixed(0)} KB`);
}
