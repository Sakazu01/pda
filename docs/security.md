# Security model

## What we protect

| Asset | Threat | Defence |
|---|---|---|
| Your browser session | A malicious `.json`, `.svg` or pasted text runs script | Strict CSP (hash-pinned script), sanitization of every import, `scrubDom` after render |
| Your API keys | Leak to storage or a non-TLS endpoint | `sessionStorage` by default; HTTPS-only endpoints (except localhost) |
| Your files | Writes outside the chosen folder, or overwriting files you didn't make | File System Access handle scoped to one folder; names built by PDA only |
| Supply chain | A CDN serves altered code | Only one external script (pptxgenjs), loaded with SRI `sha384` |

## Content-Security-Policy

```
default-src 'none';
script-src 'sha256-<bundle>' https://cdn.jsdelivr.net https://unpkg.com;
style-src 'unsafe-inline' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com data:;
img-src 'self' data: blob: https:;
connect-src https: data: blob: http://localhost:* http://127.0.0.1:*;
worker-src blob:; base-uri 'none'; form-action 'none'; object-src 'none'
```

`style-src 'unsafe-inline'` is needed for computed shape styles. It cannot execute code. `connect-src https:` is needed because you choose the AI endpoint.

## Import sanitization

- IDs must match `^[A-Za-z0-9_.:-]{1,64}$`.
- Colors must be valid hex/rgb.
- Unknown shape types fall back to safe defaults.
- SVG icons have `script`, `foreignObject`, `iframe`, `on*` handlers and non-local `href` removed.
- Files over 25 MB are refused.

Tests: `tests/audit.cjs`, `tests/pxxss.cjs`, `tests/csp.cjs`, `tests/folder.cjs`.
