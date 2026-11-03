# Design tokens (P3, step B)

Source of truth today: `src/shell/head.html` lines 9-36 (`:root`, dark theme, and the auto-dark copy). This page says what stays, what is added, and the rule for using them. Nothing in `src/` has changed yet; the CSS in §6 is applied in P6.

## 1. Already good, keep as is

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f5f7f7` | `#0f1416` | app background |
| `--panel` / `--panel-2` | `#ffffff` / `#eceff0` | `#192023` / `#283034` | surfaces, wells |
| `--line` / `--line-2` | `#dde2e4` / `#c3cbce` | `#2a3337` / `#3a4448` | hairlines, stronger borders |
| `--ink` / `--muted` / `--faint` | `#192023` / `#4b585d` / `#627075` | `#e8eced` / `#a7b2b6` / `#8a969b` | text levels |
| `--accent` family | `#0e6169` on white | `#6db5bb` on dark | the one brand colour (teal) |
| `--good` `--warn` `--bad` | green / amber / red | lighter versions | state only |
| `--font-ui` / `--font-mono` | Geist | Geist | UI text |
| `--r` `--r-sm` | 10 / 6 px | same | corners |

The palette already follows the rule "one accent, colour means state". Do not add a second accent. Contrast of ink and accent on their surfaces looks adequate by eye; the `axe2`/`axe3` suites verify it in P8.

## 2. Add: type scale

Today font sizes are set per component. One scale, UI only (canvas text stays Excalifont/Geist as the user chose):

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `--fs-xs` | 11 / 14 | 500 | tooltips, kbd, captions |
| `--fs-sm` | 12.5 / 16 | 500 | buttons, palette labels, inspector labels |
| `--fs-md` | 14 / 20 | 400-500 | body, inputs, menus |
| `--fs-lg` | 17 / 24 | 600 | panel titles, modal titles |
| `--fs-xl` | 28 / 34 | 600 | front-door headline only |

## 3. Add: spacing and sizing

4 px base: `--s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px`.
Control height: `--tb` stays 32 px (tool buttons); `--ctl: 36px` for text buttons and inputs; hit area never below 32 px.
Icon size: **one** size, `--ic: 18px` (16 px inside dense lists). Stroke 1.75 (Lucide default is 2; use 1.75 for a calmer look).
Radius scale: `--r-sm 6` (chips, inputs), `--r 10` (cards, panels), `--r-lg 16` (front-door box, modals), `--r-pill 999`.

## 4. Add: canvas surface and elevation

- Canvas: dot grid, not lines or blank. Dot `--grid-dot: color-mix(in srgb, var(--ink) 14%, transparent)` on `--canvas`, 20 px spacing (n8n/tldraw look). Off for export.
- Elevation, three steps only: `--shadow-sm` (inputs), `--shadow` (floating toolbar, menus), `--shadow-lg: 0 12px 32px rgba(15,20,22,.14)` (modals, front door).
- Floating islands (toolbar, zoom, undo): `--panel` at 94% with `backdrop-filter: blur(8px)`; falls back to solid.

## 5. Add: motion

| Token | Value | Use |
|---|---|---|
| `--t-fast` | 120 ms | hover, press |
| `--t-med` | 180 ms | panels, menus, selection chips |
| `--ease` | `cubic-bezier(.2,.7,.2,1)` | all of the above |

Everything animated is wrapped in `@media (prefers-reduced-motion: no-preference)`; with reduced motion, transitions are 0 ms. No animation longer than 250 ms. The flow animation on lines is a simulation feature, not chrome.

## 6. CSS to apply in P6 (additions only, nothing removed)

```css
:root {
  --fs-xs:11px; --fs-sm:12.5px; --fs-md:14px; --fs-lg:17px; --fs-xl:28px;
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:24px; --s-6:32px;
  --ctl:36px; --ic:18px; --r-lg:16px; --r-pill:999px;
  --grid-dot:color-mix(in srgb, var(--ink) 14%, transparent);
  --shadow-lg:0 12px 32px rgba(15,20,22,.14);
  --t-fast:120ms; --t-med:180ms; --ease:cubic-bezier(.2,.7,.2,1);
}
[data-theme="dark"] { --shadow-lg:0 12px 32px rgba(0,0,0,.55); }
@media (prefers-reduced-motion: reduce) { :root { --t-fast:0ms; --t-med:0ms; } }
```

Note: `head.html` repeats the dark block twice (explicit dark and the system-dark media query). Add the dark `--shadow-lg` in both, or fold them into one in P6.

## 7. Usage rules

1. No raw hex, px font sizes or ad-hoc shadows in new CSS; use the tokens.
2. One accent. Selected = `--accent-soft` fill + `--accent-line` border. Never colour decoration.
3. Every interactive control has a visible focus ring (`2px var(--accent)`, offset 2) and a label or `aria-label`.
4. Buttons with text for the five top actions; icon-only is for tools with a tooltip and shortcut.
5. Canvas content colours (calm mode, `uc: 1`) are separate from UI tokens and are not changed here.

## 8. Not decided here

- Whether the accent stays teal or moves toward n8n/Excalidraw-like softness. Default: stay teal (existing brand, already accessible); revisit only if the mock looks heavy.
- Glass surfaces (`ecc:liquid-glass-design`): off by default; only the floating islands may use light blur.
