# Plan: simplify PDA

Status: draft, nothing executed. Each phase names the skills to run, in order. Run one phase at a time; each ends with `npm run check` green and a build.

## 0. Why (the problem)

Observed on the live app (first screen, example project open):

- Top bar: about 14 icon-only buttons (folder, AI, present, play, check, theme, more, export, panel) with no labels.
- Under it: a second row (two view buttons, workspace switcher, page tab, "More types 5").
- Over the canvas: a floating toolbar (select, hand, link, pen, line type, 9 more icons) **and** a floating "Create with AI" button **and** a minimap **and** a hint bar.
- Left panel: header, examples, search, then long palette sections. Right panel: inspector.
- A new visitor sees a finished example, not a question. Nothing says what to do first.

Root cause: the product has no single stated first action. Features were added (48+ diagram types, 38 frameworks, 694 logos, PRD, slides, simulation, AI) and each got a control on screen.

## 0.5 Grand design (the target look and feel)

### References (looked at live)

| Source | What to take | What not to take |
|---|---|---|
| **Excalidraw** (excalidraw.com) | One centered floating toolbar with single-letter shortcuts (V, R, D, O, A, L, P, T). Hamburger menu holds everything else. Empty canvas shows 4 actions only (Open, Help, Live collaboration, Sign up). Hand-drawn font as the product's personality. | Too few diagram-specific tools; PDA needs palettes. |
| **n8n** (n8n.io) | A large prompt box as the front door ("Build the agent. Understand its workflow."). Dot-grid background, one soft accent color, one headline, two buttons. Text-first, calm. | Marketing-page layout inside the app. |
| **tldraw** (tldraw.com) | Toolbar at the **bottom**; style panel appears only while something is selected; undo/redo and zoom tucked in the corners; almost no chrome. | Bottom toolbar may clash with PDA's minimap and hint bar; decide in the mock. |
| **Pinterest** | Dropped: nothing specific there, and it loaded blank without a login. | n/a |

#### Popular tools for business and tech planning (from 2026 roundups, not all seen on screen)

Sources: [guideflow](https://www.guideflow.com/blog/diagramming-software), [toolradar](https://toolradar.com/blog/best-diagramming-tools), [itechguides](https://www.itechguides.com/best/diagramming-software/), [fitgap, process diagramming](https://us.fitgap.com/search/diagramming-software/process). These are partly affiliate lists, so treat rankings loosely; what matters is that the same names repeat.

| Tool | Why people use it | Seen on screen? | What PDA should learn |
|---|---|---|---|
| **Miro** | Whiteboard and team collaboration; named top pick in several roundups | No (blocked in this browser) | Left rail of grouped tools; templates picker as the start screen |
| **Lucidchart** | Widest range: process maps, architecture, UML, ERD, C4; enterprise standard | No | Shape-library search and a clear split between "templates" and "blank" |
| **draw.io (diagrams.net)** | Free, open source, imports Visio; most used free tool | Opened, not captured | Start dialog: blank / template / open; PDA already beats it on being one file |
| **Visual Paradigm** | BPMN, UML and ArchiMate with a shared model repository | No | A shared model across pages: PDA's PRD + glossary + integration check is the same idea; make it visible |
| **Eraser** | Diagram-as-code plus AI for architecture teams | No (blocked) | Prompt/code on one side, diagram on the other; AI as a first-class entry |
| **Whimsical** | Flowcharts, wireframes, keyboard-first, calm UI | Opened, not captured | Few tools, big targets, fast keyboard flow |
| **FigJam** | Whiteboard inside the design tool | No | Sticky notes, stamps, light and playful chrome |
| **Camunda / Signavio / Bizagi** | Formal BPMN for enterprises | No | Not the target; only borrow BPMN notation correctness |

Pattern across all of them: **start screen = templates or a prompt, not a canvas full of controls.** Tools sit in one rail or one floating bar; the rest is search.

### Design principles for PDA (draft, from the above)

1. **One front door.** Empty project = one prompt box + 3 goal chips ("An app", "A business process", "Cloud infra"). Nothing else competes (n8n).
2. **One floating toolbar.** Tools only. Everything else in the ⋯ menu and the command palette Ctrl+K (Excalidraw).
3. **Show controls when relevant.** Style/inspector appears on selection; palette shows the current diagram type's sections only (tldraw).
4. **Quiet surface.** Dot-grid canvas, one accent color (keep the teal `#0f6b73`), neutral grays, labels on buttons, one icon size, one corner radius.
5. **A personality.** Keep Excalifont ("sketch") for canvas text as the signature; UI chrome stays plain (Geist).
6. **Progressive disclosure.** 86 diagram types stay, but are found by search and goal, not listed on the first screen.

### Design deliverables, each with its skills

| Step | Output | Skills |
|---|---|---|
| A. Moodboard | 6-10 reference screenshots with notes in `docs/design/refs.md` (owner adds Pinterest pins) | `ecc:taste`, `design:design-critique`, `ecc:frontend-design-direction` |
| B. Design tokens | Colors (light and dark), type scale, spacing, radius, shadow, icon size, motion; written as CSS variables in `src/shell/head.html` | `design:design-system`, `ecc:design-system`, `ecc:liquid-glass-design` (only if glass surfaces are chosen) |
| C. Layout mocks | Empty state, canvas with selection, narrow (375 px) layout, dark theme, as Figma frames | `figma:figma-generate-design`, `figma:figma-use`, `figma:figma-create-new-file`; or `ecc:plan-canvas` if no Figma access |
| D. Component set | Top bar, toolbar, palette item, inspector field, modal, toast, empty state | `figma:figma-generate-library`, `design:design-handoff` |
| E. Motion | 150-200 ms ease for panels and selection; respects `prefers-reduced-motion` | `ecc:motion-ui`, `ecc:motion-foundations`, `ecc:make-interfaces-feel-better` |
| F. Copy | Short labels, same in English and Indonesian | `design:ux-copy` |
| G. Build | HTML/CSS in `src/shell/`, TypeScript in `core/ui.ts` and `editor/navigation.ts` | `frontend-design:frontend-design`, `ecc:frontend-patterns`, `ponytail:ponytail` |
| H. Verify | Screenshots at 1440 / 1024 / 375, light and dark, before/after | `ecc:browser-qa`, `ecc:ui-demo`, `design:accessibility-review` |

Rule: no step G before the owner approves the mocks from step C.

## 1. Purpose and first-run flow (decide before drawing anything)

Write down, in one page, answered by the owner:

1. Who is it for (student doing coursework? PM? architect?) and the one job it does.
2. The first action: pick a goal, paste a PRD, or describe it to AI. Pick **one** as the front door.
3. What the default screen shows: front door + canvas only; everything else behind progressive disclosure.

Skills: `superpowers:brainstorming` → `product-management:product-brainstorming` → `product-management:write-spec` → `design:user-research` (short, 3-5 users or the owner's classmates) → `design:research-synthesis`.
Output: `docs/product-purpose.md` with the job-to-be-done, the front door, and a "not now" list of features to hide.

## 2. Information architecture and density

- Inventory every control on screen (top bar, toolbars, panels, menus, command palette) with: used how often, for which job, keep / move into ⋯ / merge / remove.
- Target: top bar max 5 visible actions with text labels (Open, AI, Present, Export, ⋯). Second row only shows the workspace and current page. One floating toolbar, not two. Minimap and hint bar off by default, toggle from View.
- Palette: show only the sections for the current diagram type; collapse the rest; search always visible.
- Inspector: show properties only for the selection; no empty states with advice.
- Empty project: show the front door (§1), not an example. Examples stay one click away.

Skills: `design:design-critique` → `ecc:frontend-design-direction` → `frontend-design:frontend-design` → `design:design-system` (spacing, type scale, one icon size, one button style) → `ecc:make-interfaces-feel-better`.
Output: control inventory table, a before/after mock, then the changes in `src/shell/*.html`, `core/ui.ts`, `editor/navigation.ts`.

## 3. Icons and the logo palette (the owner's request)

- Remove the "Semua logo tech" section (`SEC['tech-all']` in `diagrams/tech-logos.ts`, its entry in `i18n/en-dict.ts`).
- Give every `logoOnly` logo a category via a name → category map; split the four tech sections into finer ones (AI, Database, Messaging, Backend, Frontend, Cloud, DevOps, Auth & payments, Other). Sections stay lazy.
- Items that are logos show their logo as the icon automatically. The Add/Change icon grid in the inspector appears only for nodes without a logo. Decide with the owner whether "My icons" upload stays.
- Search must still find every logo. Update `tests/tech.cjs` and docs.

Skills: `ecc:search-first` (reuse existing helpers) → `ponytail:ponytail` → `superpowers:test-driven-development` → `ecc:frontend-patterns`.

## 4. Quality gates for each phase

- `superpowers:verification-before-completion`, `ecc:verification-loop`, `ecc:quality-gate`.
- Accessibility: `design:accessibility-review`, `ecc:frontend-a11y`, suites `axe2`, `axe3`.
- i18n: `design:ux-copy`; suite `lang` must pass (no Indonesian in the English UI).
- Browser check at 1440, 1024 and 375 px: `ecc:browser-qa`, `ecc:e2e-testing`.
- Review: `ecc:typescript-reviewer`, `code-review`, `ponytail:ponytail-review`; dead code after removals: `ecc:refactor-clean`, `ponytail:ponytail-audit`.
- Security unchanged: `ecc:security-review` once, since only UI and palette data change.

## 5. Git and release

Branch from `dev`: `feat/simplify-ui`, then `feat/logo-categories`. Conventional Commits, no AI trailers (owner's CLAUDE.md), commit only when asked. Rebuild `dist/index.html`. Update `README.md`, `README.id.md`, `CLAUDE.md`, `CHANGELOG.md`. Tag a minor release.

Skills: `superpowers:using-git-worktrees`, `superpowers:finishing-a-development-branch`, `ecc:update-docs`.

## Order of work

1. §1 purpose (needs the owner, nothing is built before this)
2. §2 inventory and mock (owner approves)
3. §3 logos (independent, can go in parallel with §2 on its own branch)
4. §2 implementation
5. §4 gates, then §5

## Decisions (defaults chosen so work can start; owner can overturn any)

1. **Front door:** one prompt box ("What do you want to design?") with the goal guide as three chips under it. PRD import and examples sit one click away. Reason: it matches n8n/Eraser and reuses `guide/goals.ts` and `ai/intent.ts`.
2. **"My icons" upload:** kept, but moved out of the main panel into the ⋯ menu under Library. Built-in logos need no upload.
3. **Audience:** coursework and small teams first. The default view shows the 12-15 most common diagram types; the rest are found by search and by goal.

## Execution checklist (run in this order)

- [x] P1 Purpose page `docs/product-purpose.md` (§1), draft written, owner to confirm its 3 open points
- [x] P2 Control inventory and keep/move/remove table (§2): `docs/design/control-inventory.md`
- [x] P3 Moodboard + design tokens (§0.5 A, B): `docs/design/refs.md`, `docs/design/tokens.md`
- [ ] P4 Figma mocks: empty state, canvas, 375 px, dark (§0.5 C, D); **owner approves**
- [ ] P5 Logo categories, remove "Semua logo tech" (§3), on `feat/logo-categories`
- [ ] P6 Build the new shell and front door (§0.5 G), on `feat/simplify-ui`
- [ ] P7 Motion and copy pass (§0.5 E, F)
- [ ] P8 Quality gates and screenshots (§4, §0.5 H)
- [ ] P9 Docs, changelog, release (§5)
