# Changelog

All notable changes are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [SemVer](https://semver.org/).

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

[1.0.0]: https://github.com/Sakazu01/pda/releases/tag/v1.0.0
