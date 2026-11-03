# Control inventory (P2)

Source: `src/shell/body.html` at v1.4.0 (lines 14-146), plus the live app. Decision per control: **Keep** (stays visible), **Move** (to ⋯ menu / Ctrl+K / selection-only), **Merge** (into another control), **Remove**. Front door and defaults follow `docs/product-purpose.md`.

Today the first screen has **about 40 visible controls**. Target: **at most 5 visible actions + the front-door box** on an empty project, and a calm editing screen once a diagram exists.

## 1. Top bar (header)

| # | Control | Now | Decision | Where it goes |
|---|---|---|---|---|
| 1 | Logo + "PDA plan & design anything" | always | Keep | smaller tagline, hidden on narrow |
| 2 | Diagram name + save state | always | Keep | one line, save state as a small dot + text |
| 3 | Diagrams (library) | button | **Keep** | renamed "Open", the only left action |
| 4 | AI (provider + status) | button | **Merge** | into the AI entry below; provider setup lives in Settings |
| 5 | Generate | button, hidden | **Merge** | becomes the front-door box and the single "AI" button |
| 6 | Review | button, hidden | Move | ⋯ → "Review with AI" |
| 7 | Slide | toggle | Move | page type "Pitch deck" in the diagram picker; Present button only when a deck exists |
| 8 | Simulasi | toggle | Move | ⋯ and Ctrl+K; shown as a Play button only on flow diagrams (BPMN, activity, userflow) |
| 9 | Warna: tenang | toggle | Move | ⋯ → View → Colour (default stays calm) |
| 10 | Check | button | Move | ⋯ → "Check for mistakes"; also shown as a badge when issues exist |
| 11 | Export | primary + menu | **Keep** | stays primary, the second of the five |
| 12 | Panel toggles (narrow) | icon | Keep | only on narrow screens |
| 13 | **New ⋯ menu** | not a button in this bar | **Add** | holds Review, Simulation, Colour, Font, Language, Theme, Folder, Library (My icons), Shortcuts |

Visible after change: **Open · AI · Present (when relevant) · Export · ⋯** = 5.

## 2. Second row (workspace and pages)

| Control | Decision | Notes |
|---|---|---|
| PRD, Integrasi (project views) | **Keep, relabel** | Rename "Integrasi" to "Consistency"; both are the product's differentiator but should read as project tabs, not toolbar buttons |
| Workspace tabs (7) | **Merge** | Collapse into one "What are you designing?" picker that shows the goal guide; the 7 workspaces stay as filters inside it |
| Diagram chips + "More types N" | **Keep, shorten** | Show only pages already in the project plus "+ Add page"; the 86 types live in the picker and search |

## 3. Floating canvas toolbar (17 buttons + 2 selects)

| Control | Decision | Where it goes |
|---|---|---|
| Select, Pan, Connect, Pen | **Keep** | the one floating toolbar (Excalidraw-style), shortcuts V H C P |
| Line type select | **Move** | appears when a line is selected or Connect is active |
| Free line, Free arrow | **Merge** | one "Line" tool with an arrow option in the style panel |
| Insert image | **Move** | ⋯ and drag-and-drop (already supported) |
| Auto-connect, Snap to grid | **Move** | ⋯ → Canvas; both stay on by default |
| Animate flows | **Move** | with Simulation (top bar #8) |
| Sketch style | **Move** | ⋯ → Canvas font and style |
| Undo, Redo | **Keep** | bottom-left corner (tldraw), not in the toolbar |
| Auto-arrange | **Move** | ⋯ and Ctrl+K; also offered after AI generation |
| Examples select | **Move** | front-door link "Open an example" and ⋯ |
| Keyboard shortcuts | **Move** | `?` key and ⋯ |

Result: toolbar of **4 tools + optional context chips**, down from 19 controls.

## 4. Zoom bar, minimap, hint bar, FAB

| Control | Decision |
|---|---|
| Zoom out / % / in / fit | **Keep**, bottom-right, 4 controls |
| Minimap toggle + minimap | **Move**, off by default, toggle in ⋯ → View (auto-on when the diagram exceeds the screen) |
| Hint bar ("Double-click empty canvas…") | **Remove** as permanent text; show once as a first-time tip, then dismiss; full list in Shortcuts |
| "Create with AI" floating button | **Merge** with the top-bar AI button and the front-door box; no second AI entry on the canvas |
| Empty-state card (Blank canvas / Example / Generate) | **Replace** with the front door from the purpose doc |

## 5. Left panel (palette) and right panel (inspector)

| Control | Decision |
|---|---|
| Palette header, examples line, search | **Keep** search always visible; examples move to the front door |
| Palette sections | **Keep**, but show only sections for the current diagram type, collapsed by default except the first; logo sections per `plan-simplify.md` §3 |
| Inspector icon picker ("Add/Change icon" + grid) | **Move**: shown only for nodes without a logo (§3 of the plan) |
| Inspector, general | **Keep**, selection-only; no advice text when empty |

## 6. Dialogs and project views

| Item | Decision |
|---|---|
| PRD pane buttons (Templat, Impor .md, Ekspor .md, Perbarui dari kanvas, Susun pakai AI, Bangun kanvas) | **Merge**: primary "Build canvases", the rest in a ⋯ inside the pane |
| Integration pane (Cek pakai AI, Cek ulang) | Keep; "Cek ulang" primary |
| My icons modal | **Move** to ⋯ → Library |

## 7. Copy and language problems found while inventorying

- Mixed English and Indonesian **in the source HTML itself** (e.g. "Slide", "Simulasi", "Warna: tenang", "Sisipkan gambar", "Templat", "Integrasi"). `AGENTS.md` says fixed English text should be English with an Indonesian entry in `src/i18n/id.ts`. These should be English in `body.html` and translated by the dictionary. Fix in P6/P7.
- Several buttons are icon-only with the meaning only in `title`. Visible labels are needed for the five top actions.

## 8. Summary

| Area | Visible now | Visible after |
|---|---|---|
| Top bar actions | ~9 + export | 5 |
| Second row | PRD, Integrasi, 7 tabs, chips, More types | project tabs + page chips + goal picker |
| Canvas toolbar | 19 | 4 (+ context chips) |
| Zoom group | 5 + minimap + hint | 4 |
| Floating AI | 1 extra | 0 (merged) |
| First screen total | ~40 | ≤ 5 + the box |

Next: P3 (moodboard and design tokens) uses this as the list of things the new layout must place.
