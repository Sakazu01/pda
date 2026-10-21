# Architecture

## Constraints that shape the code

- **Runs as one HTML file**, from disk, with no network. So there is no framework, no bundler and no runtime dependencies.
- **Works inside a sandboxed host** (Claude artifacts) as well as standalone.

## Source layout

```
src/
  shell/        head.html (styles), body.html (markup)
  vendor/       Lucide icons, fonts, tech-stack-icons data
  core/         state, geometry, render, UI, storage, boot
  diagrams/     shape catalog, drawing, frameworks, UML extras, tech logos
  editor/       inspector, workspaces, navigation, theme, canvas font, simulation
  lines/        router, labels, toolbar, snapping, waypoints
  ai/           prompts and generation, intent detection, providers, AI button
  projects/     multi-page projects, PRD, project folder
  slides/       pitch deck and PPTX export
  i18n/         Indonesian UI strings
scripts/build.mjs   concatenates modules in order → dist/index.html
tests/              Playwright suites + runner
```

## One scope, ordered modules

`scripts/build.mjs` lists the modules in order and wraps them in one `(function(){"use strict"; … })()`. They share that scope, so a later module can extend an earlier one:

```js
var tsiCompImg0 = compImg;          // keep the previous behaviour
compImg = function (n) {            // extend it
  return tsiCompImg0(n) || techLogo(n);
};
```

Rules for this pattern:

- Name the saved function `<module><Name>0`, and always call it unless you mean to replace the behaviour.
- New modules go at the end of `MODULES`, before `core/boot.js`, unless they must run earlier.
- Keep a module about one thing. If it needs a section header, it probably wants its own file.

## Build output

`dist/index.html` gets:

- a Content-Security-Policy whose `script-src` is the SHA-256 hash of the bundled script;
- tag names inside JS strings rewritten to `\x3c…`, so the HTML preload scanner never fetches template strings as URLs;
- a syntax check through `node:vm`.

`node scripts/build.mjs --artifact <file>` writes the body-only variant for hosts that add their own document shell.
