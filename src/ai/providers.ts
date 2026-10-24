// ================= LLM providers: bring your own API =================
// Built-in Claude (artifact runtime) stays available. Any other provider is called straight from the browser with the user's own key.
import type { Dict, LlmConfig, LlmProvider } from '../core/types';
import { $, esc, lsDel, lsGet, lsSet } from '../core/core';
import { toast } from '../core/ui';
import { closeModal, openModal } from '../core/features';
import { sampleCap } from './generate';

export var LLM_P: Dict<LlmProvider> = {
  claude: { n: 'Claude (bawaan)', builtin: 1 },
  openai: { n: 'OpenAI', base: 'https://api.openai.com/v1', model: 'gpt-4o-mini', kind: 'oai', key: 1 },
  openrouter: {
    n: 'OpenRouter',
    base: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-sonnet-4.5',
    kind: 'oai',
    key: 1,
  },
  groq: { n: 'Groq', base: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile', kind: 'oai', key: 1 },
  deepseek: { n: 'DeepSeek', base: 'https://api.deepseek.com/v1', model: 'deepseek-chat', kind: 'oai', key: 1 },
  anthropic: {
    n: 'Anthropic',
    base: 'https://api.anthropic.com/v1',
    model: 'claude-sonnet-4-5',
    kind: 'anthropic',
    key: 1,
  },
  gemini: {
    n: 'Google Gemini',
    base: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash',
    kind: 'gemini',
    key: 1,
  },
  ollama: { n: 'Ollama (lokal)', base: 'http://localhost:11434/v1', model: 'llama3.1', kind: 'oai', key: 0 },
  lmstudio: { n: 'LM Studio (lokal)', base: 'http://localhost:1234/v1', model: 'local-model', kind: 'oai', key: 0 },
  custom: { n: 'OpenAI-compatible lainnya', base: '', model: '', kind: 'oai', key: 1 },
};
export var LLM_CFG: LlmConfig;
export function llmSave() {
  var c = Object.assign({}, LLM_CFG);
  delete c.key;
  lsSet('rancang:llm', JSON.stringify(c));
  try {
    sessionStorage.removeItem('rancang:llmkey');
  } catch (e) {}
  lsDel('rancang:llmkey');
  if (LLM_CFG.key) {
    if (LLM_CFG.keep) lsSet('rancang:llmkey', LLM_CFG.key);
    else {
      try {
        sessionStorage.setItem('rancang:llmkey', LLM_CFG.key);
      } catch (e) {}
    }
  }
}
export function llmJsonFrom(text) {
  var t = String(text || '')
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
  try {
    return JSON.parse(t);
  } catch (e) {}
  var a = t.indexOf('{'),
    b = t.lastIndexOf('}');
  if (a >= 0 && b > a) {
    try {
      return JSON.parse(t.slice(a, b + 1));
    } catch (e) {}
  }
  throw new Error('Model tidak mengembalikan JSON yang valid. Coba lagi atau pilih model yang lebih besar.');
}
export function llmHttpError(r, body) {
  var m = '';
  try {
    var j = JSON.parse(body);
    m = (j.error && (j.error.message || j.error)) || j.message || '';
  } catch (e) {
    m = String(body || '').slice(0, 160);
  }
  if (r.status === 401 || r.status === 403)
    return new Error('Kunci API ditolak (' + r.status + '). Periksa kunci dan izin modelnya.');
  if (r.status === 404) return new Error('Endpoint atau nama model tidak ditemukan (404). Periksa URL dan model.');
  if (r.status === 429) return new Error('Batas pemakaian tercapai (429). Tunggu sebentar atau ganti model.');
  return new Error('Penyedia membalas ' + r.status + (m ? ': ' + String(m).slice(0, 160) : ''));
}
export function llmCall(prompt, opt) {
  var p = LLM_P[LLM_CFG.prov],
    base = (LLM_CFG.base || p.base || '').replace(/\/+$/, ''),
    model = LLM_CFG.model || p.model,
    key = LLM_CFG.key || '';
  if (!base) return Promise.reject(new Error('Isi URL endpoint dulu.'));
  // a key must never travel in clear text: HTTPS only, plain HTTP just for a model on this machine
  if (!/^https:\/\//i.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(base))
    return Promise.reject(new Error('Endpoint harus HTTPS (atau http://localhost untuk model lokal).'));
  if (!model) return Promise.reject(new Error('Isi nama model dulu.'));
  if (p.key && !key) return Promise.reject(new Error('Isi kunci API dulu.'));
  var url,
    headers: Record<string, any> = { 'Content-Type': 'application/json' },
    body;
  if (p.kind === 'anthropic') {
    url = base + '/messages';
    headers['x-api-key'] = key;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
    body = { model: model, max_tokens: 8000, messages: [{ role: 'user', content: prompt }] };
  } else if (p.kind === 'gemini') {
    url = base + '/models/' + encodeURIComponent(model) + ':generateContent';
    headers['x-goog-api-key'] = key;
    body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    };
  } else {
    url = base + '/chat/completions';
    if (key) headers.Authorization = 'Bearer ' + key;
    body = { model: model, messages: [{ role: 'user', content: prompt }], temperature: 0.2 };
  }
  return fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body), signal: opt && opt.signal }).then(
    function (r) {
      return r.text().then(function (txt) {
        if (!r.ok) throw llmHttpError(r, txt);
        var j;
        try {
          j = JSON.parse(txt);
        } catch (e) {
          throw new Error('Balasan penyedia bukan JSON.');
        }
        var out =
          p.kind === 'anthropic'
            ? (j.content || [])
                .map(function (c) {
                  return c.text || '';
                })
                .join('')
            : p.kind === 'gemini'
              ? ((((j.candidates || [])[0] || {}).content || {}).parts || [])
                  .map(function (c) {
                    return c.text || '';
                  })
                  .join('')
              : (((j.choices || [])[0] || {}).message || {}).content || '';
        if (!out) throw new Error('Model tidak mengembalikan teks.');
        return out;
      });
    },
    function (e) {
      if (e && e.name === 'AbortError') throw e;
      throw new Error(
        'Tidak bisa terhubung ke ' +
          base.replace(/^https?:\/\//, '').split('/')[0] +
          '. Periksa URL, koneksi, dan izin CORS penyedia. Di tampilan artifact koneksi keluar diblokir; buka file HTML ini secara lokal atau di hosting sendiri.',
      );
    },
  );
}
export function llmAdapter() {
  return {
    json: function (prompt, opt) {
      return llmCall(prompt, opt).then(function (t) {
        if (opt && opt.onText)
          try {
            opt.onText({ text: t });
          } catch (e) {}
        return llmJsonFrom(t);
      });
    },
  };
}
export function aiCap() {
  return LLM_CFG.prov === 'claude' ? sampleCap : llmAdapter();
}
export function aiReady() {
  return LLM_CFG.prov === 'claude' ? !!sampleCap : true;
}
export function aiRefresh__base() {
  var on = aiReady();
  $('btnGen').hidden = !on;
  $('btnReview').hidden = !on;
  $('emptyGen').hidden = !on;
  var lab = LLM_CFG.prov === 'claude' ? 'AI' : LLM_P[LLM_CFG.prov].n.split(' ')[0];
  $('btnLlm').querySelector('.lbl').textContent = lab;
}
export var aiRefresh: typeof aiRefresh__base = aiRefresh__base;
export function set_aiRefresh(v: typeof aiRefresh__base) {
  return (aiRefresh = v);
}
export function llmForm() {
  var p = LLM_P[$('llmProv').value];
  $('llmBase').value = LLM_CFG.prov === $('llmProv').value && LLM_CFG.base ? LLM_CFG.base : p.base || '';
  $('llmModel').value = LLM_CFG.prov === $('llmProv').value && LLM_CFG.model ? LLM_CFG.model : p.model || '';
  $('llmBase').disabled = !!p.builtin;
  $('llmModel').disabled = !!p.builtin;
  $('llmKey').disabled = !p.key;
  $('llmTest').disabled = !!p.builtin;
  $('llmKeyWrap').hidden = !p.key;
  $('llmKeep').closest('label').hidden = !p.key;
  $('llmNote').textContent = p.builtin
    ? 'Memakai akun Claude kamu lewat tampilan ini. Tidak perlu kunci.'
    : p.base && p.base.indexOf('localhost') >= 0
      ? 'Model lokal: jalankan servernya dan izinkan CORS untuk halaman ini (Ollama: OLLAMA_ORIGINS=*).'
      : 'Kunci hanya dikirim ke endpoint di atas dan disimpan di browser ini. Jangan pakai kunci dengan kuota besar di komputer bersama.';
}

export function install(): void {
  LLM_CFG = (function () {
    var d: LlmConfig = { prov: 'claude', base: '', model: '', keep: false };
    try {
      var v = JSON.parse(lsGet('rancang:llm') || 'null');
      if (v && LLM_P[v.prov]) d = Object.assign(d, v);
    } catch (e) {}
    var sk = null;
    try {
      sk = sessionStorage.getItem('rancang:llmkey');
    } catch (e) {}
    d.key = d.keep ? lsGet('rancang:llmkey') || '' : sk || '';
    return d;
  })();
  (function llmInit() {
    $('llmProv').innerHTML = Object.keys(LLM_P)
      .map(function (k) {
        return '<option value="' + k + '">' + esc(LLM_P[k].n) + '</option>';
      })
      .join('');
    $('btnLlm').onclick = function () {
      $('llmProv').value = LLM_CFG.prov;
      llmForm();
      $('llmKey').value = LLM_CFG.key || '';
      $('llmKeep').checked = !!LLM_CFG.keep;
      $('llmProg').textContent = '';
      openModal('mLlm');
    };
    $('llmProv').onchange = function () {
      LLM_CFG.base = '';
      LLM_CFG.model = '';
      llmForm();
      $('llmKey').value = '';
    };
    function read() {
      LLM_CFG.prov = $('llmProv').value;
      LLM_CFG.base = $('llmBase').value.trim();
      LLM_CFG.model = $('llmModel').value.trim();
      LLM_CFG.key = $('llmKey').value.trim();
      LLM_CFG.keep = $('llmKeep').checked;
    }
    $('llmSave').onclick = function () {
      read();
      llmSave();
      aiRefresh();
      closeModal();
      toast(LLM_CFG.prov === 'claude' ? 'Memakai Claude bawaan' : 'Model AI: ' + LLM_P[LLM_CFG.prov].n);
    };
    $('llmTest').onclick = function () {
      read();
      var pr = $('llmProg');
      pr.textContent = 'Menguji…';
      $('llmTest').disabled = true;
      llmCall('Reply with only this JSON: {"ok":true}', {})
        .then(
          function (t) {
            var j = llmJsonFrom(t);
            pr.textContent =
              j && j.ok ? 'Terhubung. Model membalas dengan benar.' : 'Terhubung, tapi balasannya tidak sesuai format.';
          },
          function (e) {
            pr.textContent = e.message;
          },
        )
        .then(function () {
          $('llmTest').disabled = false;
        });
    };
    $('llmClear').onclick = function () {
      LLM_CFG.key = '';
      $('llmKey').value = '';
      llmSave();
      $('llmProg').textContent = 'Kunci dihapus dari browser ini.';
    };
    aiRefresh();
  })();
}
