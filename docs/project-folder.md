# Project folder

PDA can keep every project as a file in a folder you choose.

1. Open **Proyek**.
2. Click **Pilih folder** and choose a folder (for example `Documents/PDA`).
3. The open project is written right away. After that, every save writes it again, 1.2 s after your last edit.

The panel lists every `.json` file in the folder, newest first. The list scrolls, so hundreds of projects stay manageable. Click one to open it.

| Button | Does |
|---|---|
| Simpan sekarang | Write the open project immediately |
| Ganti | Pick another folder |
| Lepas | Forget the folder (files stay on disk) |
| Izinkan | Shown after a browser restart. The browser asks for permission again |

## File names and format

`<title-slug>--<id>.pda.json`, for example `kasir-kafe--5jdo36yz.pda.json`. Renaming a project replaces its old file. PDA never takes a file name from file content.

```json
{ "app": "pda", "id": "…", "title": "Kasir Kafe", "v": 3, "pages": { … }, "prd": "…" }
```

It is the same format as **Ekspor → JSON**. A file is validated and sanitized before it is opened, exactly like an import.

## Browser support

The folder needs the File System Access API: Chrome, Edge or Opera, with PDA opened directly (not inside another page). In other browsers, use **Buka file .json** and JSON export.
