# AGENTS.md

Rules for anyone (human or coding agent) changing PDA.

## Ground rules

- The product is **one HTML file that works offline**. Do not add runtime dependencies or frameworks. TypeScript, esbuild and Prettier are build-time only.
- Edit `src/`, never `dist/`. Run `npm run build` to regenerate `dist/index.html`, and commit both.
- Run `npm run check` (type check + quick tests) before every commit, and `npm test` before a release.
- UI copy is Indonesian first. English strings get a translation in `src/i18n/id.ts`.

## Write the least code that solves it (Ponytail)

Before writing code, stop at the first rung that works:

1. **YAGNI.** Is it actually needed now? If not, don't build it.
2. **Reuse.** Is there already a function for it in `src/`? (`esc`, `slug`, `layered`, `route`, `toast`, `openModal`, `pushUndo`…)
3. **Language / stdlib.** Can plain TypeScript do it (`Array`, `Map`, `Intl`, `structuredClone`)?
4. **Browser platform.** Can the browser do it (`<dialog>`-like modals, CSS, File System Access, `IndexedDB`)?
5. **Existing dev dependency** (tests only): Playwright, axe-core, pptxgenjs.
6. **Only then**, new code, as small and plain as possible.

Never trade away validation, error handling, security or accessibility to make code shorter.

## Code conventions

- TypeScript ES modules, formatted by Prettier (`npx prettier --write "src/**/*.ts"`). `npm run typecheck` must pass with zero errors.
- Model and registry types live in `src/core/types.ts`. Use them instead of `any` when you touch a function.
- At load time a module only declares. Side effects go in its `install()`, which `src/main.ts` runs in order (see [docs/architecture.md](docs/architecture.md)).
- Extend another module's function through its setter, not by editing it: `xyz0 = fn; set_fn(function (n) { …; return xyz0(n); })`.
- Write shared state only through its `set_<name>` setter. ESM imports are read-only.
- New module: add the file under the right folder in `src/`, and its `install` to `INSTALL_ORDER` in `src/main.ts`.
- Anything shown in HTML goes through `esc()`. Imported data goes through `sanitize()`. Rendered SVG goes through `scrubDom()`.
- No inline event handlers (`onclick="…"`): CSP blocks them. Use `addEventListener`.
- No `eval`, `new Function`, or remote scripts without SRI.
- Comments say *why*, not *what*.

## Storage keys

`localStorage` keys keep the historical `rancang:` prefix (`rancang:theme`, `rancang:font`, `rancang:llm`…). Do not rename them, because existing users would lose settings.

## Commits and branches

- `main` is always releasable. `dev` collects finished work.
- Branch from `dev`: `feat/…`, `fix/…`, `docs/…`, `test/…`, `chore/…`, `ci/…`. Merge back with `--no-ff`.
- Commit messages follow Conventional Commits: `feat(router): soft-wall second pass`.
