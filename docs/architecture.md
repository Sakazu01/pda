# Architecture

## Constraints that shape the code

- **Ships as one HTML file** that works from disk with no network: no runtime dependencies, no framework. TypeScript and esbuild are build-time only.
- **Works inside a sandboxed host** (Claude artifacts) as well as standalone.

## Source layout

```
src/
  main.ts       entry: runs every module's install() in order
  shell/        head.html (styles), body.html (markup)
  vendor/       Lucide icons, fonts, tech-stack-icons data
  core/         types, state, geometry, render, UI, storage, boot
  diagrams/     shape catalog, drawing, frameworks, UML extras, tech logos
  editor/       inspector, workspaces, navigation, theme, canvas font, simulation
  lines/        router, labels, toolbar, snapping, waypoints
  ai/           generation, intent detection, providers, connection status, AI button
  projects/     multi-page projects, PRD, project folder
  slides/       pitch deck and PPTX export
  i18n/         Indonesian UI strings
scripts/build.mjs   esbuild bundle → CSP-hashed dist/index.html
tests/              Playwright suites, runner, hook.ts (test-only internals)
```

## Modules: declare at load, start in install()

Every file is an ES module. At load time a module only **declares**: functions, constants and registries. Anything with side effects (registering shapes, adding menu items, binding events, extending another module's behaviour) lives in its `install()` function. `src/main.ts` calls the installs in a fixed order:

```ts
const INSTALL_ORDER: Array<() => void> = [installCoreCore, installDiagramsCatalog, /* … */, installCoreBoot];
export function start(): void {
  for (const install of INSTALL_ORDER) install();
}
```

This keeps start-up deterministic, even though modules import each other in cycles: imports resolve first, then installs run one by one.

## Extending behaviour across modules

Some functions are meant to be extended later, such as `render`, `compImg` and `aiRefresh`. Such a function is exported as a variable together with a setter. ESM imports are read-only, so other modules replace it through the setter:

```ts
// diagrams/draw.ts
export function compImg__base(n: DiagramNode) { /* … */ }
export var compImg: typeof compImg__base = compImg__base;
export function set_compImg(v: typeof compImg__base) { return (compImg = v); }

// diagrams/tech-logos.ts, inside install()
tsiCompImg0 = compImg;                   // keep the previous behaviour
set_compImg(function (n) {               // extend it
  return tsiCompImg0(n) || techLogo(n);
});
```

Rules:

- Save the previous function as `<module><Name>0`, and always call it unless you mean to replace the behaviour.
- Mutable shared state (`S`, `DOC`, `undo`, …) is exported with a `set_<name>` setter. Read it through the import; write it only through the setter.
- A new module adds its `install` to `INSTALL_ORDER`, before `installCoreBoot` unless it must run after boot.

## Types

`src/core/types.ts` defines the model (`DiagramNode`, `DiagramEdge`, `Diagram`, `Project`) and the registries (`ShapeType`, `DiagramType`, `EdgeType`, `LlmProvider`…). `tsc` runs with `noImplicitThis`, `noUnusedLocals`, `noImplicitReturns` and `strictFunctionTypes`, and CI fails on any error.

`strictNullChecks` and `noImplicitAny` are **not on yet**: turning them on today reports about 1,400 and 2,400 errors. The plan is to enable them per folder, starting with `lines/` and `projects/`.

## Build output

`npm run build` bundles `src/main.ts` with esbuild (IIFE, ES2019, strict mode) and writes `dist/index.html` with:

- a Content-Security-Policy whose `script-src` is the SHA-256 hash of the bundled script;
- tag names inside JS strings rewritten to `\x3c…`, so the HTML preload scanner never fetches template strings as URLs.

`node scripts/build.mjs --artifact <file>` writes the body-only variant for hosts that add their own document shell.
