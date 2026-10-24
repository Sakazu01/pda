import { S, cam } from './core';
import { toast } from './ui';
import { DOC, boot } from './features';

export function install(): void {
  (function start() {
    var H = window.claude && window.claude.hot;
    try {
      if (H && H.snapshot)
        H.snapshot(function () {
          return { S: S, id: DOC.id, title: DOC.title, updatedAt: DOC.updatedAt, example: DOC.example, cam: cam };
        });
    } catch (e) {}
    if (H && H.ready) H.ready(boot);
    else boot((H && H.data) || null);
  })();

  window.addEventListener('error', function (ev) {
    try {
      toast('Terjadi kesalahan tak terduga. Pekerjaanmu tersimpan otomatis; muat ulang jika tampilan aneh.', 4000);
    } catch (e) {}
  });
  window.addEventListener('unhandledrejection', function (ev) {
    var r = ev && ev.reason;
    if (r && r.name === 'AbortError') return;
    try {
      toast('Ada proses yang gagal. Coba lagi.', 3000);
    } catch (e) {}
  });
}
