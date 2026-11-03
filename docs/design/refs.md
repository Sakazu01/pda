# Moodboard and references (P3, step A)

What to borrow, from tools people actually use. "Seen" = looked at on screen during this project; "Read" = taken from 2026 roundups only. Screenshots are not stored here (third-party UI); add your own captures under `docs/design/refs/` if you want them in the repo.

## What we are going for

**Calm, quiet, one idea per screen.** A canvas tool that feels like Excalidraw/tldraw in its chrome and like n8n in its first screen, with PDA's own touch: hand-drawn canvas text and a teal accent.

Three words for the design: **quiet · guided · hand-made**.

## Reference table

| Source | Seen? | Layout lesson | Visual lesson | Do not copy |
|---|---|---|---|---|
| **Excalidraw** | Seen | One centered floating toolbar; hamburger holds the rest; empty canvas shows 4 actions | Hand-drawn font as brand; pale lavender accent on white; almost no borders | Too few diagram tools for PDA's needs |
| **n8n** | Seen | Big prompt box as the front door under one headline; two buttons only | Dot-grid background, soft pink accent, mono button labels, generous whitespace | Marketing-page scale inside the editor |
| **tldraw** | Seen | Bottom toolbar; style panel only on selection; undo/redo and zoom in corners | Neutral UI, one blue, tiny tooltips | Bottom toolbar may collide with PDA's zoom and palette, test in the mock |
| **draw.io** | Opened, not captured | Start dialog: blank / template / open | Dense by design, the thing PDA should not become | Density |
| **Whimsical** | Opened, not captured | Few tools, keyboard-first | Soft colours, rounded shapes | n/a |
| **Miro** | Read | Left rail of grouped tools; template picker first | Colour-coded stickies | Marketing upsells in the canvas |
| **Lucidchart** | Read | Shape-library search; split between templates and blank | Familiar business look | Heavy panels |
| **Visual Paradigm** | Read | One model shared across diagram types | Formal, dated look | Look |
| **Eraser** | Read | Prompt/code beside the diagram; AI as first-class | Dark, developer feel | Look |
| **FigJam** | Read | Whiteboard inside a design tool; playful stamps | Friendly, rounded | n/a |

## Patterns that repeat (the rules the design follows)

1. First screen is a template picker or a prompt, never a canvas full of controls.
2. Tools sit in **one** place (a floating bar or a rail). Everything else is search or a menu.
3. Controls for a thing appear when that thing is selected.
4. One accent colour. Colour is for meaning (selected, success, error), not decoration.
5. Corners are soft and consistent; borders are rare, shadows are small.

## Mock checklist for step C (what each frame must show)

- Empty project with the front door (prompt box + 4 chips + 3 quiet links).
- Canvas with a generated diagram, nothing selected (toolbar, zoom, undo/redo only).
- Canvas with one node selected (inspector and style chips appear).
- Palette open on a diagram type with logos by category.
- Narrow phone layout (375 px) and dark theme for each of the above.
