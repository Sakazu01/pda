// Connection status for the AI model: shown in the AI dialog and as a dot on
// the AI button. Checking is cheap: it lists models (or reads the key) instead
// of generating text, so it costs no tokens. Results from an older config are
// ignored, so typing fast never shows a stale "Terhubung".
var LLM_STAT={s:'idle',msg:'',seq:0,t:0};
var LLM_STAT_TXT={idle:'Belum dicek',checking:'Mengecek koneksi…',ok:'Terhubung',warn:'Terhubung, ada catatan',fail:'Tidak terhubung',nokey:'Belum ada kunci API'};

function llmPingUrl(p,base,model){
  if(p.kind==='anthropic')return base+'/models';
  if(p.kind==='gemini')return base+'/models/'+encodeURIComponent(model);
  if(/openrouter\.ai/i.test(base))return base+'/key'; // /models there is public, /key needs a valid key
  return base+'/models';
}
// cfg: {prov, base, model, key}. Resolves {s, msg}; never rejects.
function llmPing(cfg){
  var p=LLM_P[cfg.prov];
  if(p.builtin)return Promise.resolve(sampleCap?{s:'ok',msg:'Claude bawaan siap dipakai.'}:{s:'fail',msg:'Claude bawaan hanya tersedia saat PDA dibuka di dalam Claude. Pilih penyedia lain.'});
  var base=(cfg.base||p.base||'').replace(/\/+$/,''),model=cfg.model||p.model,key=cfg.key||'';
  if(!base)return Promise.resolve({s:'fail',msg:'Isi URL endpoint dulu.'});
  if(!/^https:\/\//i.test(base)&&!/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(base))return Promise.resolve({s:'fail',msg:'Endpoint harus HTTPS (atau http://localhost untuk model lokal).'});
  if(p.key&&!key)return Promise.resolve({s:'nokey',msg:'Tempel kunci API untuk '+p.n+'.'});
  var h={};
  if(p.kind==='anthropic'){h['x-api-key']=key;h['anthropic-version']='2023-06-01';h['anthropic-dangerous-direct-browser-access']='true'}
  else if(p.kind==='gemini')h['x-goog-api-key']=key;
  else if(key)h.Authorization='Bearer '+key;
  var ctl=typeof AbortController==='function'?new AbortController():null,tm=setTimeout(function(){if(ctl)ctl.abort()},10000);
  return fetch(llmPingUrl(p,base,model),{headers:h,signal:ctl&&ctl.signal}).then(function(r){
    return r.text().then(function(txt){
      if(r.ok){
        // the key works; also tell whether the model name exists, when the list says so
        var ids=null;try{var j=JSON.parse(txt);if(Array.isArray(j.data))ids=j.data.map(function(m){return m&&m.id})}catch(e){}
        if(ids&&ids.length&&model&&ids.indexOf(model)<0)return{s:'warn',msg:'Kunci diterima, tapi model “'+model+'” tidak ada di daftar penyedia. Periksa nama modelnya.'};
        return{s:'ok',msg:p.n+' terhubung'+(model?' · '+model:'')+'.'};
      }
      if(r.status===404&&p.kind==='gemini')return{s:'warn',msg:'Kunci diterima, tapi model “'+model+'” tidak ditemukan.'};
      return{s:'fail',msg:llmHttpError(r,txt).message};
    });
  },function(e){
    return{s:'fail',msg:e&&e.name==='AbortError'?'Penyedia tidak menjawab dalam 10 detik.':'Tidak bisa menjangkau '+base.replace(/^https?:\/\//,'').split('/')[0]+'. Periksa URL, koneksi, dan izin CORS.'};
  }).then(function(r){clearTimeout(tm);return r});
}

function llmStatSet(s,msg){LLM_STAT.s=s;LLM_STAT.msg=msg||'';LLM_STAT.t=Date.now();llmStatRender()}
function llmStatRender(){
  var s=LLM_STAT.s,box=$('llmStat');
  if(box){box.setAttribute('data-s',s);box.querySelector('b').textContent=LLM_STAT_TXT[s]||'';box.querySelector('span').textContent=LLM_STAT.msg}
  var btn=$('btnLlm');if(btn){
    var dot=btn.querySelector('.llm-dot');if(!dot){dot=document.createElement('i');dot.className='llm-dot';dot.setAttribute('aria-hidden','true');btn.appendChild(dot)}
    dot.setAttribute('data-s',s);btn.setAttribute('aria-label','Model AI: '+(LLM_STAT_TXT[s]||''));
    btn.title='Model AI · '+(LLM_STAT_TXT[s]||'')+(LLM_STAT.msg?' · '+LLM_STAT.msg:'');
  }
}
function llmCheck(cfg){
  var my=++LLM_STAT.seq;llmStatSet('checking','');
  return llmPing(cfg).then(function(r){if(my===LLM_STAT.seq)llmStatSet(r.s,r.msg);return r});
}
function llmFormCfg(){return{prov:$('llmProv').value,base:$('llmBase').value.trim(),model:$('llmModel').value.trim(),key:$('llmKey').value.trim()}}

(function(){
  var foot=document.querySelector('#mLlm .mb');
  if(foot)foot.insertAdjacentHTML('beforeend','<div class="llm-stat" id="llmStat" data-s="idle" role="status" aria-live="polite"><i class="dot" aria-hidden="true"></i><p><b></b><span></span></p><button type="button" class="sbtn" id="llmRecheck">Cek lagi</button></div>');
  var tm=0;function soon(){clearTimeout(tm);LLM_STAT.seq++;llmStatSet('checking','');tm=setTimeout(function(){llmCheck(llmFormCfg())},700)}
  ['llmBase','llmModel','llmKey'].forEach(function(id){$(id).addEventListener('input',soon)});
  $('llmProv').addEventListener('change',function(){setTimeout(function(){llmCheck(llmFormCfg())},0)});
  $('llmRecheck').onclick=function(){llmCheck(llmFormCfg())};
  // opening the dialog shows the status of the saved config, checking it if it was never checked
  $('btnLlm').addEventListener('click',function(){if(LLM_STAT.s==='idle')llmCheck(LLM_CFG);else llmStatRender()});
  // the full "Tes koneksi" (a real generation) also updates the status
  $('llmTest').onclick=function(){
    var my=++LLM_STAT.seq;llmStatSet('checking','Mengirim pesan uji ke model…');Object.assign(LLM_CFG,llmFormCfg(),{keep:$('llmKeep').checked}); // same as before: testing applies the form
    var pr=$('llmProg'),bt=$('llmTest');pr.textContent='Menguji…';bt.disabled=true;
    llmCall('Reply with only this JSON: {"ok":true}',{}).then(function(t){var j=llmJsonFrom(t),good=j&&j.ok;pr.textContent=good?'Terhubung. Model membalas dengan benar.':'Terhubung, tapi balasannya tidak sesuai format.';if(my===LLM_STAT.seq)llmStatSet(good?'ok':'warn',good?'Model membalas dengan benar.':'Balasannya tidak sesuai format.')},function(e){pr.textContent=e.message;if(my===LLM_STAT.seq)llmStatSet('fail',e.message)}).then(function(){bt.disabled=false});
  };
  $('llmClear').addEventListener('click',function(){llmCheck(llmFormCfg())});
})();
// saving calls aiRefresh, so the saved config is re-checked and the dot on the AI button keeps the result
var lsAiRefresh0=aiRefresh;
aiRefresh=function(){lsAiRefresh0();if(LLM_CFG.prov==='claude'||LLM_CFG.key||!LLM_P[LLM_CFG.prov].key)llmCheck(LLM_CFG);else llmStatSet('nokey','Tempel kunci API untuk '+LLM_P[LLM_CFG.prov].n+'.')};
aiRefresh();
