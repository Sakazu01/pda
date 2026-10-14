// Project folder: keep every project as a .pda.json file in a folder the
// person picks, so work lives on their disk, not only in browser storage.
// Uses the File System Access API (Chrome, Edge, Opera, opened directly,
// not inside an iframe). Elsewhere the library keeps browser storage plus
// Export/Open .json, and says so.
var FOLDER={
  ok:typeof window.showDirectoryPicker==='function'&&window.self===window.top,
  dir:null,perm:'none',files:null,names:{},t:0,busy:false
};
var FD_MAX_FILES=500;

// one tiny IndexedDB store, only to remember the folder handle between visits
function fdIdb(mode,fn){
  return new Promise(function(res,rej){
    var rq=indexedDB.open('pda',1);
    rq.onupgradeneeded=function(){rq.result.createObjectStore('kv')};
    rq.onerror=function(){rej(rq.error)};
    rq.onsuccess=function(){var db=rq.result,tx=db.transaction('kv',mode),r=fn(tx.objectStore('kv'));
      tx.oncomplete=function(){db.close();res(r&&r.result)};tx.onerror=function(){db.close();rej(tx.error)}};
  });
}
function fdTail(id){return String(id||'').replace(/[^A-Za-z0-9]/g,'').slice(-8)||'x'}
// file names are always built here, never taken from file content
function fdFileName(){return slug(DOC.title)+'--'+fdTail(DOC.id)+'.pda.json'}
function fdTitleOf(name){return name.replace(/--[A-Za-z0-9]{1,8}\.pda\.json$/i,'').replace(/\.(pda\.)?json$/i,'').replace(/-/g,' ')}

function fdRestore(){
  if(!FOLDER.ok)return Promise.resolve();
  return fdIdb('readonly',function(s){return s.get('folder')}).then(function(h){
    if(!h)return;FOLDER.dir=h;return h.queryPermission({mode:'readwrite'}).then(function(p){FOLDER.perm=p});
  }).catch(function(){});
}
function fdPick(){
  window.showDirectoryPicker({id:'pda-projects',mode:'readwrite'}).then(function(h){
    FOLDER.dir=h;FOLDER.perm='granted';FOLDER.files=null;
    return fdIdb('readwrite',function(s){return s.put(h,'folder')}).catch(function(){});
  }).then(function(){if(FOLDER.dir){fdWrite().then(fdRefresh);toast('Proyek akan tersimpan di folder “'+FOLDER.dir.name+'”.')}},function(err){
    if(err&&err.name!=='AbortError')toast('Folder itu tidak bisa dipakai. Pilih folder lain.');
  });
}
function fdGrant(){
  if(!FOLDER.dir)return;
  FOLDER.dir.requestPermission({mode:'readwrite'}).then(function(p){FOLDER.perm=p;if(p==='granted')fdWrite().then(fdRefresh);else fdRender()},function(){fdRender()});
}
function fdForget(){
  FOLDER.dir=null;FOLDER.perm='none';FOLDER.files=null;FOLDER.names={};
  fdIdb('readwrite',function(s){return s.delete('folder')}).catch(function(){});fdRender();
}
function fdReady(){return !!(FOLDER.dir&&FOLDER.perm==='granted')}

// list *.json files, newest first; capped so a huge folder cannot stall the tab
function fdList(){
  var it=FOLDER.dir.values(),out=[];
  return (function step(){return it.next().then(function(r){
    if(r.done||out.length>=FD_MAX_FILES)return out;
    var h=r.value;if(h.kind!=='file'||!/\.json$/i.test(h.name))return step();
    return h.getFile().then(function(f){out.push({name:h.name,h:h,size:f.size,t:f.lastModified});return step()},step);
  })})().then(function(L){return L.sort(function(a,b){return b.t-a.t})});
}
function fdRefresh(){
  if(!fdReady()){fdRender();return Promise.resolve()}
  return fdList().then(function(L){
    FOLDER.files=L;FOLDER.names={};L.forEach(function(f){var m=/--([A-Za-z0-9]{1,8})\.pda\.json$/i.exec(f.name);if(m)FOLDER.names[m[1]]=f.name});fdRender();
  },function(){FOLDER.perm='prompt';fdRender()});
}

// write the open project; a renamed project replaces its old file
function fdWrite(){
  if(!fdReady()||!DOC.id||FOLDER.busy)return Promise.resolve();
  var name=fdFileName(),old=FOLDER.names[fdTail(DOC.id)],pj=Object.assign({app:'pda',id:DOC.id},payload()),ui=usedIcons();
  if(Object.keys(ui).length)pj.icons=ui;
  FOLDER.busy=true;
  return FOLDER.dir.getFileHandle(name,{create:true}).then(function(h){return h.createWritable()}).then(function(w){
    return w.write(JSON.stringify(pj,null,1)).then(function(){return w.close()});
  }).then(function(){
    FOLDER.names[fdTail(DOC.id)]=name;
    if(old&&old!==name)return FOLDER.dir.removeEntry(old).catch(function(){});
  }).then(function(){FOLDER.busy=false},function(){FOLDER.busy=false;FOLDER.perm='prompt';setSave('error','Folder proyek tidak bisa ditulis. Buka Proyek untuk mengizinkan lagi.')});
}
function fdSchedule(){if(!fdReady())return;clearTimeout(FOLDER.t);FOLDER.t=setTimeout(fdWrite,1200)}

function fdOpen(i){
  var f=FOLDER.files&&FOLDER.files[i];if(!f)return;
  if(f.size>IMPORT_MAX){toast('File terlalu besar (maks 25 MB).');return}
  f.h.getFile().then(function(file){return file.text()}).then(function(txt){
    var d=JSON.parse(txt);
    if(!d||(!(d.pages&&typeof d.pages==='object')&&(!Array.isArray(d.nodes)||!Array.isArray(d.edges))))throw 0;
    saveNow();
    d.title=d.title||fdTitleOf(f.name);
    if(d.icons)registerIcons(d.icons,true);
    loadDoc(d,typeof d.id==='string'&&SAFE_ID.test(d.id)?d.id:null);lastKey=null;saveNow(true);closeModal();toast('Dibuka dari folder: '+DOC.title);
  }).catch(function(){toast('File itu bukan proyek PDA yang bisa dibaca.')});
}

function fdKb(n){return n<1024?n+' B':n<1048576?Math.round(n/1024)+' KB':(n/1048576).toFixed(1)+' MB'}
function fdRender(){
  var box=$('fdBox');if(!box)return;
  if(!FOLDER.ok){box.innerHTML='<p class="where">'+ic('folder')+' Simpan ke folder perlu Chrome atau Edge, dengan PDA dibuka langsung (bukan di dalam halaman lain). Di sini, pakai <b>Buka file .json</b> dan ekspor JSON.</p>';return}
  if(!FOLDER.dir){box.innerHTML='<div class="fd-empty"><p>'+ic('folder')+'<span><b>Folder proyek</b>Simpan setiap proyek sebagai file <code>.pda.json</code> di folder pilihanmu. Aman di disk-mu dan bisa dibackup.</span></p><button type="button" class="btn pri" data-fd="pick">'+ic('folder-open')+'Pilih folder</button></div>';return}
  if(FOLDER.perm!=='granted'){box.innerHTML='<div class="fd-empty"><p>'+ic('folder')+'<span><b>'+esc(FOLDER.dir.name)+'</b>Browser perlu izinmu lagi untuk membaca dan menyimpan di folder ini.</span></p><button type="button" class="btn pri" data-fd="grant">Izinkan</button><button type="button" class="btn" data-fd="forget">Lepas</button></div>';return}
  var L=FOLDER.files,list=L==null?'<li class="where">Membaca folder…</li>':!L.length?'<li class="where">Belum ada file proyek di folder ini. Proyek yang terbuka tersimpan otomatis.</li>':
    L.map(function(f,i){var cur=DOC.id&&f.name===FOLDER.names[fdTail(DOC.id)];
      return '<li class="lib-item'+(cur?' cur':'')+'"><button type="button" class="open" data-fdopen="'+i+'"><span class="t">'+esc(fdTitleOf(f.name))+'</span><span class="d">'+(cur?'Terbuka · ':'')+esc(relTime(f.t))+' · '+fdKb(f.size)+'</span></button></li>'}).join('');
  box.innerHTML='<div class="fd-head">'+ic('folder-open')+'<b title="'+esc(FOLDER.dir.name)+'">'+esc(FOLDER.dir.name)+'</b><span class="fd-n">'+(L?L.length+(L.length>=FD_MAX_FILES?'+':'')+' file':'')+'</span>'+
    '<button type="button" class="sbtn" data-fd="save">'+ic('save')+'Simpan sekarang</button><button type="button" class="sbtn" data-fd="pick">Ganti</button><button type="button" class="sbtn" data-fd="forget">Lepas</button></div>'+
    '<ul class="lib-list fd-list" aria-label="File di folder proyek">'+list+'</ul>';
}
document.addEventListener('click',function(ev){
  var b=ev.target.closest&&ev.target.closest('#fdBox [data-fd],#fdBox [data-fdopen]');if(!b)return;
  var a=b.getAttribute('data-fd');
  if(b.hasAttribute('data-fdopen'))fdOpen(+b.getAttribute('data-fdopen'));
  else if(a==='pick')fdPick();else if(a==='grant')fdGrant();else if(a==='forget')fdForget();
  else if(a==='save'){saveNow(true);fdWrite().then(function(){toast('Tersimpan di folder.');fdRefresh()})}
});

(function(){var w=$('libWhere');if(w)w.insertAdjacentHTML('beforebegin','<section class="fd" id="fdBox" aria-label="Folder proyek"></section>')})();
var fdRenderLib0=renderLib;
renderLib=function(){fdRenderLib0();if(FOLDER.dir&&FOLDER.perm==='granted')fdRefresh();else fdRender()};
var fdSave0=saveNow;
saveNow=function(force){fdSave0(force);fdSchedule()};
fdRestore();
