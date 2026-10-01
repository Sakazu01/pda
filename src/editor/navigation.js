// ================= navigation: page chips, type picker, command palette, grouped top bar, project start =================
// 1 · chips show only the pages this project uses (plus the current one). Every other type lives in the picker.
renderChips=function(){
  var dt=dtOf(),ws=uiWs||DT[dt].ws,all=Object.keys(DT).filter(function(k){return DT[k].ws===ws}),filled=all.filter(pjFilled),show=all.filter(function(k){return filled.indexOf(k)>=0||k===dt}),s='';
  var sug=filled.length?[]:all.filter(function(k){return show.indexOf(k)<0}).slice(0,Math.max(0,5-show.length));
  show.forEach(function(k){s+='<button type="button" class="dt-chip" data-dt="'+k+'" aria-pressed="'+(k===dt)+'">'+ic(DT_ICON[k]||'layout-grid')+'<span>'+esc(DT[k].n)+'</span></button>'});
  if(sug.length)s+='<span class="nv-sep" aria-hidden="true"></span>'+sug.map(function(k){return '<button type="button" class="dt-chip sug" data-dt="'+k+'" aria-pressed="false" title="Mulai '+esc(DT[k].n)+'">'+ic(DT_ICON[k]||'layout-grid')+'<span>'+esc(DT[k].n)+'</span></button>'}).join('');
  s+='<button type="button" class="nv-more" id="nvMore" aria-haspopup="dialog" aria-expanded="false" title="Semua jenis diagram dan framework">'+ic('plus')+'<span>Jenis lain</span><b>'+all.length+'</b></button>';
  var box=$('dtChips');box.innerHTML=s;pjMarks();
};
// 2 · type picker: every diagram type, grouped by workspace, searchable
function nvPickOpen(){
  var p=$('nvPick');p.hidden=false;$('nvMore')&&$('nvMore').setAttribute('aria-expanded','true');
  var q=$('nvPickQ');q.value='';nvPickRender();setTimeout(function(){q.focus()},0);
}
function nvPickClose(){var p=$('nvPick');if(p.hidden)return;p.hidden=true;var m=$('nvMore');if(m)m.setAttribute('aria-expanded','false')}
function nvPickRender(){
  var q=pjNorm($('nvPickQ').value),cur=uiWs,order=[cur].concat(WS.map(function(w){return w.id}).filter(function(id){return id!==cur})),s='',n=0;
  order.forEach(function(ws){
    var ks=Object.keys(DT).filter(function(k){return DT[k].ws===ws&&(!q||pjNorm(DT[k].n+' '+(DT[k].hint||'')+' '+k+' '+WS_BY[ws].n).indexOf(q)>=0)});
    if(!ks.length||(!q&&ws!==cur&&0))return;
    s+='<section class="nv-grp"><h3>'+ic(WS_BY[ws].icon)+esc(WS_BY[ws].n)+'<small>'+ks.length+'</small></h3><div class="nv-grid">';
    ks.forEach(function(k){n++;var f=pjFilled(k),on=k===dtOf();s+='<button type="button" class="nv-card'+(on?' on':'')+'" data-dt="'+k+'" role="option" aria-selected="'+on+'"><i>'+ic(DT_ICON[k]||'layout-grid')+'</i><span><b>'+esc(DT[k].n)+(f?'<em class="nv-has">ada isi</em>':'')+'</b><small>'+esc(String(DT[k].hint||'').split('. ')[0])+'</small></span></button>'});
    s+='</div></section>';
  });
  $('nvPickBody').innerHTML=s||'<p class="nv-none">Tidak ada jenis yang cocok dengan “'+esc($('nvPickQ').value)+'”.</p>';
  $('nvPickCount').textContent=n+' jenis';
}
// 3 · command palette (Ctrl+K): pages, actions, elements on this page, examples
var NV_ACTS=[
  ['prd','Buka PRD','file-text','dokumen markdown requirement',function(){pjView('prd')}],
  ['integ','Cek integrasi antar-bagian','git-merge','kamus konsistensi mismatch',function(){pjView('integ')}],
  ['canvas','Kembali ke kanvas','layout-grid','',function(){pjView('canvas')}],
  ['new','Proyek baru','file-plus-2','buat baru',function(){newDiagram()}],
  ['lib','Buka proyek tersimpan','folder-open','pustaka diagram',function(){openModal('mLib')}],
  ['tpl','Mulai dari templat PRD','file-plus-2','prd contoh',function(){pjView('prd');$('prdTpl').click()}],
  ['build','Bangun kanvas dari PRD','workflow','generate halaman',function(){pjView('prd');$('prdBuild').click()}],
  ['png','Ekspor PNG','image-down','gambar download',function(){doExport('png')}],
  ['svg','Ekspor SVG','spline','vektor',function(){doExport('svg')}],
  ['json','Simpan file proyek (.json)','file-json','ekspor backup',function(){doExport('json')}],
  ['md','Ekspor PRD (.md)','download','markdown',function(){$('prdExp').click()}],
  ['open','Buka file .json','folder-open','impor',function(){$('fileOpen').click()}],
  ['slide','Slide baru','monitor','presentasi frame',function(){pjView('canvas');pxNewSlide(null)}],
  ['show','Presentasikan slide','circle-play','present fullscreen',function(){pjView('canvas');pxShowStart(0)}],
  ['sim','Jalankan simulasi alur','play','token step',function(){pjView('canvas');if(!SIM.on)simOpen()}],
  ['check','Cek kesalahan pemodelan','circle-check-big','validasi',function(){pjView('canvas');runCheck()}],
  ['legend','Sisipkan legenda (arti garis)','info','tanda notasi',function(){pjView('canvas');pxAddLegend(null)}],
  ['img','Sisipkan gambar','image-plus','foto upload',function(){pjView('canvas');pxPickImage(null)}],
  ['fit','Pas ke layar','maximize','zoom fit',function(){pjView('canvas');fitView()}],
  ['calm','Ganti mode warna (tenang/penuh)','brush','calm color',function(){$('btnCalm').click()}],
  ['sketch','Gaya sketsa','pen-line','hand drawn',function(){toggleSketch()}],
  ['grid','Snap & guides','magnet','grid',function(){toggleGrid()}],
  ['gen','Buat diagram dengan AI','sparkles','generate ai',function(){if(aiReady())$('btnGen').click();else nvAiSettings()}],
  ['review','AI review halaman ini','brain','ulasan ai',function(){if(aiReady())runReview();else nvAiSettings()}],
  ['ai','Pengaturan model AI / API key','plug','llm openai gemini anthropic key',function(){nvAiSettings()}],
  ['keys','Pintasan keyboard','keyboard','shortcut',function(){openModal('mKeys')}]
];
var NV_ITEMS=[],NV_SEL=0;
function nvCmdOpen(){commitEdit();closeMenus();nvPickClose();var c=$('nvCmd');c.hidden=false;$('nvCmdQ').value='';nvCmdRender();setTimeout(function(){$('nvCmdQ').focus()},0)}
function nvCmdClose(){var c=$('nvCmd');if(c.hidden)return;c.hidden=true}
function nvScore(hay,q){if(!q)return 1;var h=pjNorm(hay);if(h.indexOf(q)===0)return 3;if(h.indexOf(' '+q)>=0)return 2.5;if(h.indexOf(q)>=0)return 2;var t=q.split(' ');return t.every(function(w){return h.indexOf(w)>=0})?1.5:0}
function nvCmdRender(){
  var raw=$('nvCmdQ').value.trim(),q=pjNorm(raw),G=[];
  var pages=Object.keys(DT).map(function(k){var f=pjFilled(k);return{g:f?'Halaman di proyek ini':'Jenis diagram',icon:DT_ICON[k]||'layout-grid',t:DT[k].n,sub:WS_BY[DT[k].ws].n+(f?' · ada isi':''),hay:DT[k].n+' '+k+' '+WS_BY[DT[k].ws].n+' '+(DT[k].hint||''),run:function(){pjSwitch(k)},boost:f?0.5:0}});
  var acts=NV_ACTS.map(function(a){return{g:'Aksi',icon:a[2],t:a[1],sub:'',hay:a[1]+' '+a[3],run:a[4],boost:0.2}});
  var els=q?S.nodes.filter(function(n){return String(n.label||'').trim()}).map(function(n){return{g:'Elemen di halaman ini',icon:'mouse-pointer-2',t:pjLabel(n.label),sub:T[n.t]?T[n.t].n:'',hay:n.label+' '+(T[n.t]?T[n.t].n:''),run:function(){pjView('canvas');setTimeout(function(){revealTarget({n:[n.id]})},30)},boost:0.3}}):[];
  var other=[];if(q){pjMentions().forEach(function(m){if(m.dt===pjCur())return;other.push({g:'Elemen di halaman lain',icon:DT_ICON[m.dt]||'layout-grid',t:m.name,sub:DT[m.dt].n,hay:m.name+' '+DT[m.dt].n,run:function(){pjGo(m.dt,m.id)},boost:0})})}
  var exs=q?Object.keys(EX).map(function(k){return{g:'Contoh',icon:DT_ICON[EX[k].dt]||'layout-grid',t:EX[k].n,sub:'buka sebagai proyek baru',hay:EX[k].n+' contoh example',run:function(){openExample(k)},boost:-0.3}}):[];
  var all=(q?pages.concat(acts,els,other,exs):pages.filter(function(p){return p.boost>0}).concat(acts.slice(0,8)));
  all.forEach(function(it){it.s=nvScore(it.hay,q)+(it.s?0:it.boost)});
  all=all.filter(function(it){return it.s>(q?it.boost:0)||!q}).sort(function(a,b){return q?b.s-a.s:0}).slice(0,q?40:30);
  if(q)all.sort(function(a,b){return b.s-a.s});
  NV_ITEMS=all;NV_SEL=0;
  var by={},order=[];all.forEach(function(it,i){it.i=i;if(!by[it.g]){by[it.g]=[];order.push(it.g)}by[it.g].push(it)});
  var s='';order.forEach(function(g){s+='<div class="nv-cg" role="presentation">'+esc(g)+'</div>';by[g].forEach(function(it){s+='<button type="button" class="nv-ci" role="option" id="nvci'+it.i+'" data-i="'+it.i+'" aria-selected="'+(it.i===0)+'">'+ic(it.icon)+'<span>'+esc(it.t)+'</span><small>'+esc(it.sub)+'</small></button>'})});
  $('nvCmdList').innerHTML=s||'<p class="nv-none">Tidak ada hasil untuk “'+esc(raw)+'”.</p>';
  if(!q)$('nvCmdList').insertAdjacentHTML('afterbegin','<p class="nv-tip">Ketik nama diagram, framework, aksi, atau elemen. Contoh: <kbd>swot</kbd> <kbd>ekspor</kbd> <kbd>booking</kbd></p>');
  nvCmdMark();
}
function nvCmdMark(){[].forEach.call(document.querySelectorAll('#nvCmdList .nv-ci'),function(b){var on=+b.getAttribute('data-i')===NV_SEL;b.setAttribute('aria-selected',on);if(on){b.scrollIntoView({block:'nearest'});$('nvCmdQ').setAttribute('aria-activedescendant',b.id)}})}
function nvCmdRun(i){var it=NV_ITEMS[i];if(!it)return;nvCmdClose();try{it.run()}catch(e){if(window.console)console.error(e)}}
// 4 · grouped top bar: AI menu and “more” menu
function nvAiSettings(){$('llmProv').value=LLM_CFG.prov;llmForm();$('llmKey').value=LLM_CFG.key||'';$('llmKeep').checked=!!LLM_CFG.keep;$('llmProg').textContent='';openModal('mLlm')}
function nvMenu(id,btn,items){
  var m=$(id),open=m.hidden;closeMenus();if(!open)return;
  m.innerHTML=items.map(function(it){if(it==='-')return '<hr>';return '<button class="mi" type="button" data-nvm="'+it[0]+'"'+(it[4]?' disabled':'')+'>'+ic(it[1])+'<span><b>'+esc(it[2])+'</b>'+(it[3]?'<small>'+esc(it[3])+'</small>':'')+'</span></button>'}).join('');
  m.hidden=false;btn.setAttribute('aria-expanded','true');nvMenu.cur={m:m,btn:btn,items:items};
  var f=m.querySelector('.mi:not([disabled])');if(f)f.focus();
}
var nvClose0=closeMenus;
closeMenus=function(){nvClose0();['nvAiMenu','nvMoreMenu'].forEach(function(id){var m=$(id);if(m&&!m.hidden){m.hidden=true}});['btnLlm','btnMore'].forEach(function(id){var b=$(id);if(b)b.setAttribute('aria-expanded','false')})};
function nvAiItems(){var r=aiReady(),prov=LLM_CFG.prov==='claude'?'Claude bawaan':(LLM_P[LLM_CFG.prov]||{}).n||'Model kustom';return[
  ['gen','sparkles','Buat diagram dengan AI',r?'Jelaskan sistemnya, AI menggambar di halaman ini':'Atur model dulu',!r],
  ['review','brain','AI review halaman ini',r?'Kritik desain dan kesalahan':'Atur model dulu',!r],
  ['prdai','file-text','Susun PRD pakai AI',r?'Rapikan PRD bebas ke format templat':'Atur model dulu',!r],
  ['integai','git-merge','Cek integrasi pakai AI',r?'Cari ketidaksesuaian makna antar-bagian':'Atur model dulu',!r],'-',
  ['set','plug','Pengaturan model & API key','Sekarang: '+prov]]}
function nvMoreItems(){return[
  ['cmd','search','Cari & lompat…','Ctrl + K'],['new','file-plus-2','Proyek baru',''],['lib','folder-open','Proyek tersimpan',''],['open','file-json','Buka file .json',''],'-',['sim','play','Simulasi alur','Langkah demi langkah'],['check','circle-check-big','Cek kesalahan pemodelan',''],'-',
  ['calm','brush',CALM?'Warna penuh per kategori':'Warna tenang','Mode warna diagram'],['sketch','pen-line',S.style==='sketch'?'Gaya bersih':'Gaya sketsa','Disimpan bersama proyek'],['legend','info','Sisipkan legenda','Arti garis dan simbol'],'-',
  ['keys','keyboard','Pintasan keyboard','']]}
// 5 · project start: an empty project explains the three ways to begin
newDiagram=function(){startNew(dtOf());closeModal();renderInsp();toast('Proyek baru dibuat. Proyek sebelumnya tersimpan di menu Proyek.')};
var nvEmpty0=renderEmpty;
renderEmpty=function(){
  nvEmpty0();var start=!pjAny(),card=$('empty').querySelector('.empty-card'),box=$('nvStart');
  if(start){if(!box){box=document.createElement('div');box.id='nvStart';box.className='nv-start';card.appendChild(box)}
    $('emptyT').textContent='Mulai proyek';$('emptyP').textContent='Satu proyek menyatukan PRD, diagram bisnis, software, sistem, AI, dan UX. Pilih cara mulai:';
    box.innerHTML='<button type="button" data-nvs="prd">'+ic('file-text')+'<b>Dari PRD</b><small>Tulis atau impor .md, lalu bangun semua kanvas sekaligus</small></button><button type="button" data-nvs="pick">'+ic('layout-grid')+'<b>Pilih jenis diagram</b><small>'+Object.keys(DT).length+' jenis: BPMN, ERD, SWOT, System Design…</small></button><button type="button" data-nvs="ex">'+ic('sparkles')+'<b>Lihat contoh</b><small>Buka contoh lengkap untuk dipelajari</small></button>';
    box.hidden=false;card.classList.add('wide');
  }else if(box){box.hidden=true;card.classList.remove('wide')}
};
(function nvInit(){
  // markup
  var dom=$('domain');
  dom.insertAdjacentHTML('beforeend','<div class="pop nv-pick" id="nvPick" hidden role="dialog" aria-label="Pilih jenis diagram"><div class="nv-pick-h"><label class="search">'+ic('search')+'<input id="nvPickQ" type="search" placeholder="Cari jenis: swot, erd, okr, system design…" aria-label="Cari jenis diagram" autocomplete="off"></label><span id="nvPickCount" class="nv-count"></span><button type="button" class="ibtn" id="nvPickX" aria-label="Tutup">'+ic('x')+'</button></div><div class="nv-pick-b" id="nvPickBody" role="listbox" aria-label="Jenis diagram"></div></div>');
  document.body.insertAdjacentHTML('beforeend','<div class="nv-cmd" id="nvCmd" hidden><div class="nv-cmd-box" role="dialog" aria-modal="true" aria-label="Cari dan lompat"><label class="nv-cmd-q">'+ic('search')+'<input id="nvCmdQ" type="text" placeholder="Cari halaman, aksi, atau elemen…" aria-label="Cari halaman, aksi, atau elemen" role="combobox" aria-expanded="true" aria-controls="nvCmdList" aria-autocomplete="list" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></label><div class="nv-cmd-list" id="nvCmdList" role="listbox" aria-label="Hasil"></div><div class="nv-cmd-f"><span><kbd>↑</kbd><kbd>↓</kbd> pilih</span><span><kbd>Enter</kbd> buka</span><span><kbd>Ctrl</kbd><kbd>K</kbd> kapan saja</span></div></div></div>');
  var doc=document.querySelector('.top .doc');
  doc.insertAdjacentHTML('afterend','<button type="button" class="nv-search" id="nvSearch" title="Cari halaman, aksi, atau elemen (Ctrl+K)" aria-label="Cari dan lompat (Ctrl+K)">'+ic('search')+'<span class="lbl">Cari atau lompat…</span><kbd>Ctrl K</kbd></button>');
  var exp=$('btnExport').parentNode;
  exp.insertAdjacentHTML('beforebegin','<div class="menu-wrap"><button class="btn" id="btnMore" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Menu lainnya" title="Lainnya">'+ic('ellipsis')+'</button><div class="pop menu" id="nvMoreMenu" hidden role="menu"></div></div>');
  var llm=$('btnLlm');var w=document.createElement('div');w.className='menu-wrap';llm.parentNode.insertBefore(w,llm);w.appendChild(llm);w.insertAdjacentHTML('beforeend','<div class="pop menu nv-ai" id="nvAiMenu" hidden role="menu"></div>');
  llm.setAttribute('aria-haspopup','true');llm.setAttribute('aria-expanded','false');
  llm.insertAdjacentHTML('beforeend','<i data-ic="chevron-down" class="chev"></i>');var ch=llm.querySelector('.chev');if(ch&&ICONS['chevron-down'])ch.outerHTML=ic('chevron-down').replace('class="','class="chev ');
  var lib=$('btnLib');var ll=lib.querySelector('.lbl');if(ll)ll.textContent='Proyek';lib.title='Proyek tersimpan';
  $('btnCalm').hidden=true;$('btnCalm').classList.add('nv-gone');
  // behaviour
  $('nvSearch').onclick=nvCmdOpen;
  llm.onclick=function(ev){ev.stopPropagation();nvMenu('nvAiMenu',llm,nvAiItems())};
  $('btnMore').onclick=function(ev){ev.stopPropagation();nvMenu('nvMoreMenu',this,nvMoreItems())};
  document.addEventListener('click',function(ev){
    var b=ev.target.closest('[data-nvm]');if(b){var a=b.getAttribute('data-nvm');closeMenus();
      ({gen:function(){$('btnGen').click()},review:runReview,prdai:function(){pjView('prd');prdAi()},integai:function(){pjView('integ');integAi()},set:nvAiSettings,
        cmd:nvCmdOpen,'new':newDiagram,lib:function(){openModal('mLib')},sim:function(){pjView('canvas');if(!SIM.on)simOpen()},check:function(){pjView('canvas');runCheck()},open:function(){$('fileOpen').click()},calm:function(){$('btnCalm').click()},sketch:toggleSketch,legend:function(){pjView('canvas');pxAddLegend(null)},keys:function(){openModal('mKeys')}})[a]();return}
    if(!ev.target.closest('.menu-wrap')){['nvAiMenu','nvMoreMenu'].forEach(function(id){if(!$(id).hidden){$(id).hidden=true}})}
    var mo=ev.target.closest('#nvMore');if(mo){ev.stopPropagation();$('nvPick').hidden?nvPickOpen():nvPickClose();return}
    var pk=ev.target.closest('#nvPick [data-dt]');if(pk){nvPickClose();pjSwitch(pk.getAttribute('data-dt'));return}
    if(!$('nvPick').hidden&&!ev.target.closest('#nvPick'))nvPickClose();
    var st=ev.target.closest('[data-nvs]');if(st){var v=st.getAttribute('data-nvs');if(v==='prd'){pjView('prd');if(!PROJ.prd.trim())$('prdText').focus()}else if(v==='pick')nvPickOpen();else nvCmdOpen(),$('nvCmdQ').value='contoh',nvCmdRender();return}
  });
  $('nvPickX').onclick=nvPickClose;
  $('nvPickQ').addEventListener('input',nvPickRender);
  $('nvPickQ').addEventListener('keydown',function(ev){if(ev.key==='Escape'){ev.stopPropagation();nvPickClose();$('nvMore')&&$('nvMore').focus()}else if(ev.key==='Enter'){var f=$('nvPickBody').querySelector('[data-dt]');if(f)f.click()}else if(ev.key==='ArrowDown'){ev.preventDefault();var g=$('nvPickBody').querySelector('[data-dt]');if(g)g.focus()}});
  $('nvPickBody').addEventListener('keydown',function(ev){var L=[].slice.call($('nvPickBody').querySelectorAll('[data-dt]')),i=L.indexOf(document.activeElement);if(i<0)return;
    var cols=Math.max(1,Math.round($('nvPickBody').querySelector('.nv-grid').clientWidth/L[0].offsetWidth));
    var to={ArrowRight:1,ArrowLeft:-1,ArrowDown:cols,ArrowUp:-cols}[ev.key];if(to){ev.preventDefault();var j=Math.max(0,Math.min(L.length-1,i+to));if(i+to<0)$('nvPickQ').focus();else L[j].focus()}else if(ev.key==='Escape'){nvPickClose();$('nvMore')&&$('nvMore').focus()}});
  var q=$('nvCmdQ');
  q.addEventListener('input',nvCmdRender);
  q.addEventListener('keydown',function(ev){
    if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();NV_SEL=Math.max(0,Math.min(NV_ITEMS.length-1,NV_SEL+(ev.key==='ArrowDown'?1:-1)));nvCmdMark()}
    else if(ev.key==='Enter'){ev.preventDefault();nvCmdRun(NV_SEL)}
    else if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();nvCmdClose()}
    else if(ev.key==='Tab')ev.preventDefault();
  });
  $('nvCmdList').addEventListener('click',function(ev){var b=ev.target.closest('[data-i]');if(b)nvCmdRun(+b.getAttribute('data-i'))});
  $('nvCmdList').addEventListener('mousemove',function(ev){var b=ev.target.closest('[data-i]');if(b&&+b.getAttribute('data-i')!==NV_SEL){NV_SEL=+b.getAttribute('data-i');nvCmdMark()}});
  $('nvCmd').addEventListener('mousedown',function(ev){if(ev.target===this)nvCmdClose()});
  // keyboard: Ctrl+K anywhere, Alt+1…7 workspaces, Alt+←/→ previous/next page in this project
  document.addEventListener('keydown',function(ev){
    var mod=ev.ctrlKey||ev.metaKey;
    if(mod&&(ev.key==='k'||ev.key==='K')){ev.preventDefault();ev.stopImmediatePropagation();$('nvCmd').hidden?nvCmdOpen():nvCmdClose();return}
    if(!$('nvCmd').hidden||PX_SHOW.on)return;
    if(ev.altKey&&!mod&&/^[1-9]$/.test(ev.key)){var w2=WS[+ev.key-1];if(w2){ev.preventDefault();pjSwitch(pjWsDefault(w2.id))}return}
    if(ev.altKey&&!mod&&(ev.key==='ArrowRight'||ev.key==='ArrowLeft')&&!isTyping()){var f=pjFilledList(),i=f.indexOf(pjCur());if(f.length){ev.preventDefault();var j=i<0?0:(i+(ev.key==='ArrowRight'?1:-1)+f.length)%f.length;pjSwitch(f[j])}return}
    if(ev.key==='Escape'&&!$('nvPick').hidden){nvPickClose()}
  },true);
  // AI buttons now live inside the AI menu; keep their behaviour, hide them from the bar
  var aiR0=aiRefresh;aiRefresh=function(){aiR0();$('btnGen').hidden=true;$('btnReview').hidden=true;$('btnGen').classList.add('nv-gone');$('btnReview').classList.add('nv-gone');var lb=$('btnLlm').querySelector('.lbl');if(lb)lb.textContent='AI'};
  aiRefresh();renderChips();
})();
