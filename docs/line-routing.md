# Lines: routing, labels, waypoints

## The router

`src/lines/router.ts` routes every elbow line around shapes, a small cousin of libavoid and draw.io's orthogonal router.

1. **Grid.** Shape borders are inflated by 16 px. Their edges, plus a stub point outside each port, form a sparse grid.
2. **A\***, per line, on states `(grid point, direction)`. Cost = length + 34 per bend + 14 per channel already used by another line (scaled by length). The heuristic is the Manhattan distance to the nearest target stub. Both start and end sides are chosen by the search.
3. **Soft walls.** A line with no free path is searched again with shapes as costly (520) rather than forbidden. It then crosses as few shapes as possible instead of falling back to a straight diagonal.
4. **Nudge.** Overlapping parallel segments are spread 9 px apart. A spread that would push a segment into a shape is undone.
5. **Budget.** The first render routes for at most 90 ms. Lines that are not done yet use simple routes, and a background pass (up to 4 s) finishes them. Results are memoized by geometry, and routing pauses while you drag.

Measured on random graphs (`tests/perf.cjs`):

| Shapes / lines | First render | Lines through a shape |
|---|---|---|
| 60 / 86 | ~130 ms | 0 |
| 120 / 176 | ~150 ms | 0 |
| 200 / 300 | ~150 ms | 0 |

## Labels

Labels sit on the line with a halo, and the line is masked behind them. Drag a label to slide it along its line. Labels avoid shapes, other labels and other lines.

## Shaping a line by hand

| Line type | How |
|---|---|
| Elbow | Drag a segment to slide it. End segments slide their anchor along the shape side |
| Straight / curve | Drag a **+** handle to add a bend. Drag a point to move it. Press twice quickly to remove it |

## Keyboard (line selected)

| Keys | Action |
|---|---|
| `Alt+L` | Focus the line toolbar |
| `Alt+S` / `Alt+K` / `Alt+C` | Straight / elbow / curve |
| `Alt+Shift+←` / `→` | Slide the label |
| `Alt+B` | Tidy: remove manual bends |
