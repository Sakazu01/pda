# Changelog

All notable changes are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [SemVer](https://semver.org/).

## [1.4.0] - 2026-10-24

### Added
- **English interface**, with Indonesian still available. The language follows the browser, switches from the ⋯ menu or `Ctrl+K`, and is remembered. The PRD template and the PRD headings PDA writes follow the language too.
- `tests/lang.cjs`: fails if any Indonesian text is left in the English interface.

### Changed
- README: explains when AI connects by itself (inside Claude) and when it needs a key (standalone).

## [1.3.0] - 2026-10-24

### Changed
- The codebase is now **TypeScript with ES modules**, bundled by esbuild into the same single HTML file. Load-time code moved into ordered `install()` functions, cross-module overrides go through typed setters, and the model and registries are typed in `src/core/types.ts`.
- `tsc` passes with zero errors (`noImplicitThis`, `noUnusedLocals`, `noImplicitReturns`, `strictFunctionTypes`). CI runs the type check and Prettier.

### Fixed
- Dead code that the type check found: unused variables in the ERD/deployment examples, the box renderer and the waypoint handles. Duplicate entries removed from the Indonesian dictionary.

## [1.2.0] - 2026-10-24

### Added
- All 694 logos from tech-stack-icons (was 150). Every logo is searchable in the palette, and a new *Semua logo tech* section renders only when opened, so startup stays fast.

### Changed
- Linux and Zod now show their real logos instead of monograms.

## [1.1.0] - 2026-10-23

### Added
- AI connection status: "Terhubung / Tidak terhubung" in the AI dialog and a status dot on the AI button. It is checked through the free list-models endpoint, as you type.

## [1.0.0] - 2026-10-21

First public release as **PDA: Plan & Design Anything** (previously developed as *Rancang Studio*).

### Added
- 48 diagram types and 38 frameworks in 7 workspaces: business & IS, management & research, software engineering, system & cloud, AI & automation, product & UX, whiteboard.
- Goal guide "Mau merancang apa?" with recommended diagrams per goal and a project plan.
- Multi-page projects with a Markdown PRD. PRD sections (`## Aktor`, `## Alur`, `## Entitas Data`, `## Arsitektur`…) build every canvas, with a cross-page integration check.
- AI generate on every canvas: automatic diagram-type detection, results placed beside earlier ones, built-in Claude or bring-your-own model (OpenAI, Anthropic, Gemini, Groq, OpenRouter, DeepSeek, Ollama, LM Studio).
- UML component, deployment and API-contract pages.
- Orthogonal A* line router with soft-wall second pass and safe nudging: zero line-through-shape crossings on 200-shape / 300-line graphs.
- Excalidraw-style labels on lines, draggable along the line. Hand-shaped lines (segment drag, waypoints, curves) with keyboard support.
- "Rapikan tata letak": one-click layered re-layout, undoable.
- 150 tech logos from tech-stack-icons (MIT), with monogram badges for the rest.
- Project folder: save projects as `.pda.json` files in a folder you pick, with a scrollable list.
- Pitch-deck slides with PowerPoint export, flow simulation, PNG/SVG/JSON export.
- Light/dark/auto theme, Excalifont or normal canvas font, Indonesian UI.

### Security
- Strict Content-Security-Policy with a hash-pinned script.
- SRI on the only external script (pptxgenjs).
- HTTPS-only AI endpoints (localhost excepted). Session-only API keys by default.
- 25 MB import cap. Sanitization of every import and of rendered SVG.

[1.4.0]: https://github.com/Sakazu01/pda/releases/tag/v1.4.0
[1.3.0]: https://github.com/Sakazu01/pda/releases/tag/v1.3.0
[1.2.0]: https://github.com/Sakazu01/pda/releases/tag/v1.2.0
[1.1.0]: https://github.com/Sakazu01/pda/releases/tag/v1.1.0
[1.0.0]: https://github.com/Sakazu01/pda/releases/tag/v1.0.0
