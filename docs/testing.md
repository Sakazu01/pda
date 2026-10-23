# Testing

```bash
npm test               # everything (~10 min)
npm run test:quick     # smoke set (~1 min)
node tests/run.mjs wp perf   # named suites
```

`tests/run.mjs` builds two pages:

- `tests/page.html`: the app exactly as shipped, CSP included;
- `tests/page-hook.html`: the same app plus `window.__RS`, a handle to internals (`buildGraph`, `route`, `S()`, `compImg`, …) defined in `tests/hook.txt`.

Each suite is a plain Playwright script that prints `PASS …` / `FAIL …` lines and `errors [...]`. The runner counts them, and any page error fails the suite.

| Suite | Covers |
|---|---|
| run2, roles, roles2 | End-to-end flows per persona (PM, BA, architect…) |
| nav, more, kbd | Navigation, command palette, keyboard |
| deck, px, sim | Slides/PPTX, shapes and media, simulation |
| llm, llmstat, aigen | Providers, connection status, AI intent and placement |
| audit, pxxss, csp, folder | Security: XSS, SVG upload, CSP, project folder |
| axe2, axe3 | Accessibility (axe-core, light and dark, narrow and wide) |
| ux2, wp, rtdrag, layout, perf | Labels, waypoints, routing while dragging, re-layout, router invariants |
| theme, tech | Theme switching, tech logos |

## Adding a suite

Copy a short one (`layout.cjs`), print `PASS`/`FAIL` lines, and add its name to `ALL` (and `QUICK` if it is fast) in `tests/run.mjs`.
