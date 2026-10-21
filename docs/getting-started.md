# Getting started

## Open PDA

Open `dist/index.html` in a browser, or use https://sakazu01.github.io/pda/. The first screen offers three ways in:

| Start from | Use it when |
|---|---|
| **Mau merancang apa?** (goal guide) | You know the goal ("a web app", "a business process", "cloud infra") but not which diagrams to make |
| **PRD** | You already have requirements in writing |
| **Buat dengan AI** | You want a first draft from one paragraph |

## The goal guide

Pick a goal. PDA lists the diagrams that goal needs, in order, with one line on what each one answers. For example, *app* gives use case → activity → ERD → class → sequence → API → sitemap → wireframe. Click **Pakai set ini** and those pages become the project plan. Plan chips in the top bar show which ones are still empty.

## PRD → canvases

Open **PRD**, insert the template, and fill in the sections:

```markdown
## Aktor
- Pelanggan: memesan meja
- Kasir: mengelola transaksi

## Alur
1. Pelanggan memilih meja
2. Sistem mengecek ketersediaan

## Entitas Data
- Booking: id, meja_id, mulai, durasi

## Arsitektur
- Web → API: HTTPS
- API → PostgreSQL: SQL
```

Click **Bangun kanvas** (the build button). PDA creates or updates one page per section: use case, activity, ERD, architecture and so on. **Cek integrasi** then reports names that one page uses but another misses.

## Drawing

- Click a shape in the left palette, or double-click the canvas.
- Drag from a blue port to another shape to connect. With a shape selected, clicking another palette item adds it *already connected*.
- `Ctrl+K` opens the command palette: search shapes, pages and actions.
- `…` → **Rapikan tata letak** re-lays out a crowded page. **Rapikan semua garis** removes manual bends.

## Saving and exporting

- Work saves automatically in the browser.
- **Proyek → Pilih folder** (Chrome/Edge) also writes each project to disk. See [project-folder.md](project-folder.md).
- **Ekspor** gives PNG, SVG, JSON. **Slide** gives a pitch deck and PowerPoint.
