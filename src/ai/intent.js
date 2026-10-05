// AI generate: detect what the person wants, never silently use the wrong page
var INTENT_KW={
  sysdesign:['system design','desain sistem','skalabilitas','scalab','load balanc','cache','caching','redis','sharding','replika','replica','cdn','rate limit','high availability','throughput','qps','latency','latensi','jutaan pengguna','million users','horizontal scal'],
  arch:['arsitektur','architecture','infrastruktur','infrastructure','vpc','aws','gcp','azure','cloud'],
  c4:['c4 ','c4 model','context diagram','container diagram'],
  deploy:['deployment diagram','diagram deployment','deploy ke','server fisik','docker compose','vm '],
  component:['component diagram','diagram komponen','modul','module','komponen software'],
  k8s:['kubernetes','k8s','pod','helm','ingress'],
  network:['jaringan','network topology','topologi','router','switch','lan ','firewall'],
  dist:['raft','paxos','consensus','konsensus','leader election'],
  threat:['threat','ancaman','stride','keamanan','security','serangan','attack'],
  cicd:['ci/cd','cicd','pipeline deploy','github actions','gitlab ci','continuous'],
  usecase:['use case','usecase','aktor','actor','kebutuhan fungsional','functional requirement','siapa bisa'],
  activity:['activity diagram','diagram aktivitas','langkah-langkah','alur kerja'],
  sequence:['sequence','urutan pesan','interaksi antar','request response','memanggil api','login flow','handshake'],
  class:['class diagram','diagram kelas','oop','kelas ','inheritance','pewarisan','method'],
  state:['state machine','status','transisi','siklus hidup','lifecycle'],
  erd:['erd','database','basis data','tabel','table','relasi','schema','skema','primary key','foreign key'],
  dfd:['dfd','data flow','aliran data'],
  api:['api','endpoint','rest','graphql','kontrak api'],
  bpmn:['proses bisnis','business process','bpmn','swimlane','approval','persetujuan','pengajuan'],
  userflow:['user flow','alur pengguna','onboarding','checkout'],
  wire:['wireframe','mockup','tampilan layar','ui layar'],
  sitemap:['sitemap','struktur halaman','peta situs'],
  journey:['customer journey','perjalanan pelanggan'],
  n8n:['n8n','otomasi','automation','zapier','make.com','workflow otomatis'],
  agent:['langgraph','agent','agen ai'],
  rag:['rag','retrieval','vector','embedding','chatbot dokumen','tanya dokumen'],
  multi:['multi-agent','multi agent','tim agen'],
  mlpipe:['machine learning','ml pipeline','training model','mlops'],
  mind:['mind map','mindmap','peta pikiran'],
  bmc:['business model canvas','model bisnis','bmc'],swot:['swot'],pestel:['pestel'],
  gantt:['gantt','jadwal proyek','timeline proyek'],kanban:['kanban','task board'],eventstorm:['event storming','domain event','ddd']
};
function detectIntent(text){
  var t=' '+String(text||'').toLowerCase()+' ',best=null,bs=0,sc={};
  Object.keys(INTENT_KW).forEach(function(k){if(!DT[k])return;var s=0;INTENT_KW[k].forEach(function(w){if(t.indexOf(w)>=0)s+=w.length>=8?3:w.indexOf(' ')>0?2:1});sc[k]=s;if(s>bs){bs=s;best=k}});
  if(!best||bs<2)return null;
  // explicit naming wins: "use case" written out beats incidental words
  return{dt:best,score:bs};
}
function genTypeOptions(sel){
  return '<option value="auto"'+(sel==='auto'?' selected':'')+'>✨ Otomatis: AI yang pilih jenisnya</option>'+WS.map(function(w){var ks=Object.keys(DT).filter(function(k){return DT[k].ws===w.id&&k!=='deck'});return '<optgroup label="'+esc(w.n)+'">'+ks.map(function(k){return '<option value="'+k+'"'+(k===sel?' selected':'')+'>'+esc(DT[k].n)+'</option>'}).join('')+'</optgroup>'}).join('');
}
var ux2PrepGen0=prepGen;
prepGen=function(){
  ux2PrepGen0();
  if(!$('genDtRow')){$('genText').closest('.fld').insertAdjacentHTML('afterend','<div class="fld" id="genDtRow"><span>Jenis diagram yang dibuat</span><div class="gen-dt"><select id="genDt" aria-label="Jenis diagram yang dibuat"></select><span class="gen-hint" id="genHint" aria-live="polite"></span></div></div>');
    $('genText').addEventListener('input',function(){clearTimeout(this._it);var ta=this;this._it=setTimeout(function(){genDetect(ta.value,false)},250)});
    $('genDt').addEventListener('change',function(){genTitle()});
    $('genChips').addEventListener('click',function(){setTimeout(function(){genDetect($('genText').value,false)},0)});
  }
  var sel=$('genDt');sel.innerHTML=genTypeOptions('auto');sel._manual=0;$('genHint').textContent='';genDetect($('genText').value,true);genTitle();
};
var GEN_AUTO_CHIPS=['System design aplikasi chat jutaan pengguna','ERD sistem peminjaman ruang kampus','Proses pengajuan cuti karyawan','Use case aplikasi kasir kafe','Kontrak API toko online'];
function genCopySet(k){var c=k==='auto'?{lab:'Ceritakan apa yang mau dirancang (sistemnya, penggunanya, alurnya)',ph:'Contoh: sistem peminjaman ruang kampus; mahasiswa mengajukan, admin menyetujui, ada notifikasi email.',chips:GEN_AUTO_CHIPS}:genCopy(k);
  $('genLab').textContent=c.lab;$('genText').placeholder=c.ph;$('genChips').innerHTML=c.chips.map(function(x){return '<button type="button">'+esc(x)+'</button>'}).join('')}
function genTitle(){var k=$('genDt').value,auto=k==='auto';genCopySet(k);$('mGenT').textContent='Buat dengan AI · '+(auto?'Otomatis':DT[k].n);var lab=$('genAddLbl');if(lab)lab.textContent=auto?'Di sebelah hasil sebelumnya (halaman yang sesuai)':k===dtOf()?'Di sebelah hasil sebelumnya':'Di halaman '+DT[k].n+', di sebelah isinya';genDetect($('genText').value,true)}
function genDetect(text,quiet){
  var sel=$('genDt'),h=$('genHint');if(!sel||!h)return;
  if(sel.value!=='auto'){h.innerHTML=ic('circle-check-big')+'Dipilih manual: <b>'+esc(DT[sel.value].n)+'</b>. Pilih “Otomatis” kalau mau AI yang menentukan.';return}
  var t=String(text||'').trim(),r=t?detectIntent(t):null;
  h.innerHTML=ic('sparkles')+(r?'AI akan membuat <b>'+esc(DT[r.dt].n)+'</b> (terbaca dari deskripsimu). Ganti di atas kalau salah.':t?'AI akan menentukan jenis diagram yang paling cocok saat kamu klik Buat.':'Tulis deskripsinya; jenis diagram ditentukan otomatis dari isinya.');
}
function classifyPrompt(text){
  var list=Object.keys(DT).filter(function(k){return k!=='deck'}).map(function(k){return k+' = '+DT[k].n+': '+dtUse(k)}).join('\n');
  return 'Pick the ONE diagram type that best fits the request.\n\nRequest:\n"""\n'+String(text).slice(0,3000)+'\n"""\n\nTypes (key = name: use):\n'+list+'\n\nReply with only one JSON object: {"dt":"<key>","why":"<max 12 words, in the language of the request>"}';
}
var ux2RunGen0=runGenerate,GEN_PICKING=false;
runGenerate=function(){
  var sel=$('genDt'),k=sel&&sel.value,text=$('genText').value.trim(),self=this,args=arguments;
  if(k&&k!=='auto'){if(DT[k]&&k!==dtOf())pjSwitch(k,{noSeed:1,keepView:1});return ux2RunGen0.apply(self,args)}
  if(!text){$('genText').focus();toast('Tulis deskripsinya dulu');return}
  var go=function(dt,why){if(DT[dt]&&dt!==dtOf())pjSwitch(dt,{noSeed:1,keepView:1});$('mGenT').textContent='Buat dengan AI · '+DT[dtOf()].n;$('genHint').innerHTML=ic('sparkles')+'Dibuat sebagai <b>'+esc(DT[dtOf()].n)+'</b>'+(why?' · '+esc(why):'');return ux2RunGen0.apply(self,args)};
  var r=detectIntent(text);if(r)return go(r.dt,'terbaca dari deskripsi');
  var cap=aiCap();if(!cap){openModal('mLlm');return}
  if(GEN_PICKING)return;GEN_PICKING=true;$('genGo').disabled=true;$('genProg').textContent='Memilih jenis diagram…';
  cap.json(classifyPrompt(text),{cache:false}).then(function(d){
    var dt=d&&typeof d.dt==='string'?d.dt.trim():'';if(!DT[dt]||dt==='deck')dt=dtOf();GEN_PICKING=false;$('genGo').disabled=false;go(dt,d&&d.why?String(d.why).slice(0,80):'');
  }).catch(function(){GEN_PICKING=false;$('genGo').disabled=false;go(dtOf(),'AI tidak bisa memilih, pakai halaman ini')});
};


// decks keep a presentation typeface: Excalifont is for diagrams, not pitch slides
var ux2ApplyStyle0=applyStyle;
applyStyle=function(){ux2ApplyStyle0();if(dtOf()==='deck'&&S.style!=='sketch'&&FONT.indexOf('Excalifont')>=0){FONT=FONT.replace(FONT_EXCALI,FONT_NORMAL0);if(FONT.indexOf('Excalifont')>=0)FONT=FONT_NORMAL0;svg.setAttribute('font-family',FONT)}};
