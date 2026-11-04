# PDA design system

One page that says how PDA looks and why. If the code, the Figma file and this page disagree, fix all three in one change. Figma: **PDA UI v2** (pages *Screens*, *Agent icons*, *Design system*). Token values live in [tokens.md](tokens.md); this page adds the rules for using them.

Status: v2 draft. Contrast ratios have not been measured yet (the `axe2` and `axe3` suites check them).

## 1. Principles

1. **Quiet, guided, hand-made.** The work (canvas, PRD, slide) is the hero; chrome steps back.
2. **One front door.** An empty project asks one question. Everything else is search (`Ctrl K`) or a menu.
3. **Show controls when they matter.** Inspector on selection, style chips on selection, Library on demand.
4. **One accent, colour means state.** Teal is the only brand colour. Green, amber, red are status only.
5. **Same shell everywhere.** Header, colours, type and shapes never change between diagram, slides and PRD; only the side panels do.
6. **Consistent before clever.** Use a token, a size from the scale, an existing component. A new value needs a reason written here.

## 2. Colour

Two modes, same names. Always use the variable, never a raw hex.

| Token | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#f5f7f7` | `#0f1416` | app background, wells |
| `panel` | `#ffffff` | `#192023` | headers, side panels, cards, inputs |
| `panel-2` | `#eceff0` | `#283034` | hover fill |
| `canvas` | `#ffffff` | `#0f1416` | the drawing surface |
| `line` | `#dde2e4` | `#2a3337` | 1 px borders and dividers |
| `line-2` | `#c3cbce` | `#3a4448` | stronger border, skeleton bars |
| `ink` | `#192023` | `#e8eced` | primary text |
| `muted` | `#4b585d` | `#a7b2b6` | secondary text, inactive icons |
| `faint` | `#627075` | `#8a969b` | captions, placeholders |
| `accent` | `#0e6169` | `#6db5bb` | primary action, selection, links |
| `accent-ink` | `#ffffff` | `#06191b` | text on `accent` |
| `accent-soft` | `#e8f4f5` | `#12292c` | selected pill, icon tile, soft highlight |
| `accent-line` | `#a0d2d6` | `#1f7b84` | border of selected or soft elements |
| `accent-tint` | `#c4dee0` | `#2a5155` | duotone fill inside custom icons |
| `good` | `#1b6e46` | `#6fcb9a` | saved, success |
| `grid-dot` | `#d6dbdd` | `#2a3337` | dot grid on the canvas |

Rules:
- Text on `panel` or `bg` uses `ink`, `muted` or `faint`, in that order of importance. Never `faint` for anything a user must read to act.
- Selected = `accent-soft` fill + `accent-line` border + `accent` text. No other selected style.
- Warning and error colours exist in the app today (`warn`, `bad`); they stay for status messages only.
- Colours inside a diagram (node fills, calm mode, `uc: 1`) belong to the user's content and are not UI tokens.

## 3. Typography

| Role | Family | Size / line | Weight | Letter spacing |
|---|---|---|---|---|
| Display (Home headline) | Geist | 40 / 48 (mobile 30 / 36) | 600 | −3% |
| Title XL | Geist | 28 / 34 | 600 | −1% |
| Title (panel, modal) | Geist | 17 / 24 | 600 | 0 |
| Body | Geist | 14 / 20 | 400, 500 for emphasis | 0 |
| Control / label | Geist | 12.5–13 / 16 | 500 | 0 |
| Caption | Geist | 11–12 / 14–16 | 400–500 | 0 |
| Overline (field labels) | Geist | 11 / 14 | 400, UPPERCASE | +4% |
| Code, PRD, kbd | Geist Mono | 14 / 24 (kbd 11) | 400 | 0 |
| Diagram text | Excalifont (sketch) or Geist (normal) | per node | 500–600 | 0 |

Rules: weights are 400, 500, 600 only. Sentence case everywhere, never Title Case in buttons. Maximum two weights per component. Line length for prose ≤ 70 characters.

## 4. Spacing and sizing

Base unit **4 px**. Allowed spacing values: **4, 8, 12, 16, 24, 32, 48** (`space/1…8`). No 5, 10, 14, 18 in new work (the existing 20 px panel padding is the one inherited exception).

| Thing | Value |
|---|---|
| Control height: tool button | 32 |
| Control height: text button, input | 36 |
| Control height: mobile touch target | 40 (minimum hit area 32 desktop, 40 touch) |
| Header tier 1 | 56 (mobile 52) |
| Header tier 2 (pages) | 44 (mobile 44) |
| Icon size | 18 default, 16 in dense rows, 20 in tiles, 24 for large targets |
| Icon tile | 40 (cards), 44 (Library items), 56–96 (showcase) |
| Horizontal padding: buttons | 12 (icon + label), 14 (primary) |
| Panel padding | 16 (Library), 20 (Inspector, Properties) |
| Gap between related controls | 8; between groups 16; between sections 24–40 |
| Stroke | 1 px borders, 1.75 px icons, 1.5 px node outlines, 2 px selection and focus |

## 5. Shape and depth

| Token | Value | Use |
|---|---|---|
| `radius/sm` | 6 | buttons, inputs, tool buttons, list rows |
| `radius/md` | 10 | cards, nodes, floating islands, icon tiles |
| `radius/lg` | 16 | prompt box, Home cards, modals, bottom sheet top corners |
| `radius/pill` | 999 | chips, tabs, workspace pill, circular actions |

Shadows (three only): **sm** `0 2 8 / 8%` for inputs; **md** `0 4 14 / 12%` for floating islands and menus; **lg** `0 12 32 / 16%` for the prompt box, modals and open menus. Panels use a 1 px `line` border, not a shadow. Floating islands may use 94% `panel` with an 8 px blur; fall back to solid.

## 6. Layout

**Editor shell** (desktop ≥ 1024):

```
┌──────────────────────────────────────────────────────────────┐ 56  Header 1: back · project · [Workspace ▾] · Search · AI · (Present) · Export · ⋯
├──────────────────────────────────────────────────────────────┤ 44  Header 2: pages (only when the project has more than one)
│ Library 264 │            Canvas (fills)            │ Inspector 300 │
└──────────────────────────────────────────────────────────────┘
```

| Region | Rule |
|---|---|
| Library | 264 px, collapses to a 48 px rail; accordion with one section open; Favorites on top |
| Inspector / Properties | 300 px (Build panel 320); appears only on selection; never shows empty advice |
| Slides navigator | 232 px replaces Library; thumbnails 168 × 94 |
| PRD | Outline 240, editor column 680, Build panel 320; no Library |
| Canvas floating items | toolbar top-centre (16 px from top), style chips 12 px below it, undo bottom-left, zoom bottom-right, 16 px from edges |
| Home | no side panels; content column 920, prompt box 720, section gap 40 |

**Responsive:**
- **768–1023:** Inspector becomes an overlay that slides in; Library defaults to the rail.
- **< 768 (mobile):** header 52 px with back, name, AI, Export, ⋯; pages row scrolls horizontally; canvas fills; bottom dock with 4 tools and a *Library* button; Library and Inspector open as bottom sheets (top radius 16, drag handle, max height 60%). Gutter 20 (Home) or 12 (editor).
- Nothing may need horizontal scrolling except the pages row and the canvas itself.

## 7. Icons

- **UI icons:** Lucide, 24 px grid, 1.75 stroke, round caps and joins, colour `muted` (inactive), `accent` (active or selected), `accent-ink` on primary buttons.
- **Components without an official logo:** custom **duotone line** icons, same grid and stroke, one `accent-tint` fill and one `accent` stroke, optional solid dots for eyes or nodes. The agent family (15 icons) is in the *Agent icons* page; the other families follow the same recipe.
- **Tech logos:** the real logo, from the pack, in its own colours (light and dark variants); monogram badge when no logo exists. Logos are never recoloured.
- Sizes: 16 (dense), 18 (default), 20 (tiles), 24 (large). At 16 px an icon must stay legible; remove inner detail rather than shrink it.
- Never rotate line primitives to build an icon; import SVG.

## 8. Components

| Component | Spec |
|---|---|
| **Primary button** | 36 h, radius `sm`, fill `accent`, text `accent-ink` 13/600, icon 16, padding 12/14. One per view region. |
| **Secondary button** | 36 h, `panel` fill, 1 px `line`, text `ink` 13/500; hover `panel-2`. |
| **Ghost / icon button** | 32 or 36 square, no fill, icon `muted`; hover `panel-2`; active `accent-soft` + icon `accent`. |
| **Pill / tab** | radius pill, padding 5/12, text 13/500 `muted`; selected = soft style (section 2). |
| **Chip (goal, option)** | radius pill, `panel` fill, 1 px `line`, text 14/500, padding 8/16. |
| **Input / field** | 36 h, radius `sm`, `panel` fill, 1 px `line`, text 14; label above in overline style; focus = 2 px `accent` ring, offset 2. |
| **Prompt box** | radius `lg`, `panel`, 1 px `line`, shadow lg, padding 20/16/16/20; placeholder 16 `faint`; action = 40 px circular primary. |
| **Card** | radius `lg`, `panel`, 1 px `line`, padding 18 (desktop) / 14 (mobile), icon tile on top, title 15/600, caption 12.5 `muted`. |
| **Floating island** | radius `md`, `panel` 94%, 1 px `line`, shadow md, padding 4, 2 px gap between 32 px tools. |
| **Menu** | 288 w, radius `md`, shadow lg, padding 8, rows 34 h, radius `sm`, icon 16 + label 13.5/500 + hint 11.5 `faint`; submenu marked with a chevron; dividers 1 px `line`; max 12 rows, group with dividers. |
| **Modal** | radius `lg`, shadow lg, scrim 40%; title 17/600; primary button bottom-right. |
| **Bottom sheet** | top radius 16, shadow upward, handle 36 × 4, title 16/600. |
| **Toast** | radius `md`, `ink` fill with `bg` text (inverse), 13/500, bottom-centre, 3 s. |
| **Node (diagram)** | radius `md`, `panel` fill, 1.5 px `accent` border, label 14/600 + sub 11 `muted`; selected adds a 2 px `accent` outline 6 px outside and four 8 px handles. |
| **Library item** | 44 px tile (logo or duotone icon) + 11 px label below, 3 per row. |

States for every interactive element: default, hover (`panel-2` or one step darker), active/pressed, focus-visible (2 px ring), disabled (50% opacity, no pointer), selected (soft style).

## 9. Motion

120 ms for hover and press, 180 ms for panels, menus and the front door; easing `cubic-bezier(.2,.7,.2,1)`; nothing over 250 ms. Under `prefers-reduced-motion` all transitions are 0 ms. Flow animation on lines belongs to the simulation feature, not to chrome.

## 10. Accessibility

Text contrast ≥ 4.5:1, UI components and icons ≥ 3:1, in both modes (verified by `axe2` and `axe3`). Every control has a visible label or `aria-label`; icon-only tools also have a tooltip with the shortcut. Focus is always visible. Touch targets ≥ 40 px on mobile. Colour never carries meaning alone (selected also changes weight and border).

## 11. Voice and copy

Sentence case. Buttons are a verb or a verb + noun, ≤ 3 words (*Export*, *Build canvases*, *Open an example*). Empty states ask or invite, never explain features. New text in code goes through `L('English', 'Indonesia')`; fixed English text gets an entry in `src/i18n/id.ts`.

## 12. Do and don't

| Do | Don't |
|---|---|
| Use `accent` for one primary action per region | Add a second brand colour |
| Pick spacing from 4 / 8 / 12 / 16 / 24 / 32 / 48 | Use 5, 10, 14, 18 px |
| Reuse a component from section 8 | Restyle a button locally |
| Hide tools in the ⋯ menu or `Ctrl K` | Add a permanent toolbar button for a rare action |
| Draw custom icons on the 24 px grid with the duotone recipe | Mix filled glyphs and line glyphs in one family |
| Keep canvas colours separate from UI tokens | Bind diagram content to UI tokens |

## 13. Where each thing lives

| Thing | Source of truth |
|---|---|
| Colour and size tokens | Figma variables *Color* (Light, Dark) and *Size*; CSS `:root` in `src/shell/head.html` |
| Screens | Figma page *Screens* |
| Custom icons | Figma page *Agent icons*; code: a custom icon file under `src/vendor` (planned) |
| Rules | this page |

Changing a token means changing Figma, `head.html`, `tokens.md` and this page together.
