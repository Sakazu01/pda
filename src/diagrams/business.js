// ================= more: business, management, product and system-design catalogue =================
var MB='#2459d6',MG='#137a3a',MR='#b42318',MA='#b7791f',MP='#7a3fe0',MT='#0b8174',MS='#55606f',MO='#c2410c',MK='#b5175a',MN='#3d63b8';
function mY(d){return d.judul?40:0}
function mCell(d,c,x,y,w,h,o){return C(c[0],x,y,w,h,c[1],Object.assign({tone:c[2],head:'band',icon:c[3]||undefined,body:d[c[0]],ph:c[4]||''},o||{}))}
function mGrid(d,items,cols,CW,CH,o){var G=8,Y=mY(d),s=titleNode(d,cols*CW+(cols-1)*G);items.forEach(function(c,i){s.push(mCell(d,c,(i%cols)*(CW+G),Y+Math.floor(i/cols)*(CH+G),CW,CH,o))});return{nodes:s,edges:[]}}
function mQuad(d,xl,yl,items){
  var CW=400,CH=230,G=8,LX=40,Y=mY(d),s=titleNode(d,LX+2*CW+G);
  items.forEach(function(c,i){s.push(mCell(d,c,LX+(i%2)*(CW+G),Y+Math.floor(i/2)*(CH+G),CW,CH))});
  s.push(TX('ya',0,Y,32,2*CH+G,yl,{rot:-90,bold:1,muted:1}),TX('xa',LX,Y+2*CH+G+6,2*CW+G,24,xl,{bold:1,muted:1}));
  return{nodes:s,edges:[]};
}
function mFunnel(d,items,side){
  var W=620,H=96,G=6,Y=mY(d),n=items.length,k=0.62/n,s=titleNode(d,W+(side?320:0));
  items.forEach(function(c,i){
    s.push(C(c[0],0,Y+i*(H+G),W,H,c[1],{tone:c[2],mode:'solid',shape:'trap',tw0:1-i*k,tw1:1-(i+1)*k,head:'center',sub:c[3],nobody:1}));
    if(side)s.push(C(c[0]+'_m',W+16,Y+i*(H+G),300,H,side,{tone:c[2],head:'plain',body:d[c[0]+'_m'],ph:c[4]||'Metrik dan target'}));
  });
  return{nodes:s,edges:[]};
}
function mTable(d,rows,cols,RW,CW,RH,cell){
  var Y=mY(d),s=titleNode(d,RW+cols.length*(CW+4));
  cols.forEach(function(c,j){s.push(C('h'+j,RW+4+j*(CW+4),Y,CW,44,c,{tone:MN,mode:'solid',head:'center',nobody:1}))});
  rows.forEach(function(r,i){var y=Y+48+i*(RH+4);s.push(C('r'+i,0,y,RW,RH,r,{tone:MS,head:'plain',nobody:1}));
    cols.forEach(function(c,j){var o=cell(i,j);s.push(C('c'+i+'_'+j,RW+4+j*(CW+4),y,CW,RH,o.label||'',Object.assign({head:'center',nobody:1,tone:MS},o)))})});
  return{nodes:s,edges:[]};
}
var MF={
  // ---------- business & strategy ----------
  lean:{n:'Lean Canvas',icon:'layout-dashboard',hint:'Ash Maurya: masalah → solusi → UVP. Isi dari Problem dan Customer Segments dulu.',build:function(d){
    var G=6,CW=236,H=340,HB=130,Y=mY(d),x=function(i){return i*(CW+G)},half=(H-G)/2,W=5*CW+4*G,s=titleNode(d,W);
    s.push(mCell(d,['prob','Problem',MR,'triangle-alert','3 masalah teratas + alternatif yang dipakai sekarang'],x(0),Y,CW,H));
    s.push(mCell(d,['sol','Solution',MG,'lightbulb','3 fitur utama yang menjawab masalah'],x(1),Y,CW,half));
    s.push(mCell(d,['km','Key Metrics',MN,'chart-line','Angka kunci yang menunjukkan bisnis berjalan'],x(1),Y+half+G,CW,half));
    s.push(mCell(d,['uvp','Unique Value Proposition',MA,'heart','Satu kalimat jelas mengapa kamu berbeda + high-level concept'],x(2),Y,CW,H));
    s.push(mCell(d,['ua','Unfair Advantage',MP,'crown','Sesuatu yang tidak mudah ditiru atau dibeli'],x(3),Y,CW,half));
    s.push(mCell(d,['ch','Channels',MT,'send','Jalur menjangkau pelanggan'],x(3),Y+half+G,CW,half));
    s.push(mCell(d,['cs','Customer Segments',MB,'users','Target pelanggan + early adopters'],x(4),Y,CW,H));
    var hw=(W-G)/2;s.push(mCell(d,['cost','Cost Structure',MS,'credit-card','Biaya akuisisi, distribusi, hosting, SDM'],0,Y+H+G,hw,HB),mCell(d,['rev','Revenue Streams',MG,'chart-line','Model pendapatan, harga, lifetime value'],hw+G,Y+H+G,hw,HB));
    return{nodes:s,edges:[]};
  }},
  bcg:{n:'Matriks BCG',icon:'grid-2x2',hint:'Portofolio produk: pertumbuhan pasar × pangsa pasar relatif.',build:function(d){return mQuad(d,'← Pangsa pasar relatif: tinggi · rendah →','Pertumbuhan pasar: rendah · tinggi →',[
    ['star','Stars',MA,'sparkles','Tumbuh cepat, pangsa tinggi → investasi untuk mempertahankan'],['qm','Question Marks',MB,'circle-help','Tumbuh cepat, pangsa rendah → investasi selektif atau lepas'],
    ['cow','Cash Cows',MG,'landmark','Pasar matang, pangsa tinggi → panen kas'],['dog','Dogs',MR,'archive-x','Pasar matang, pangsa rendah → divestasi atau reposisi']])}},
  ansoff:{n:'Matriks Ansoff',icon:'grid-2x2',hint:'Strategi pertumbuhan: produk lama/baru × pasar lama/baru.',build:function(d){return mQuad(d,'Produk: lama · baru →','Pasar: baru · lama →',[
    ['pen','Market Penetration',MG,'target','Produk lama, pasar lama: promo, loyalitas, rebut pangsa'],['pd','Product Development',MB,'package','Produk baru untuk pasar lama'],
    ['md','Market Development',MA,'globe','Produk lama ke pasar/segmen/wilayah baru'],['div','Diversification',MR,'git-fork','Produk baru di pasar baru · risiko tertinggi']])}},
  tows:{n:'Matriks TOWS',icon:'layout-grid',hint:'Turunan SWOT: pasangkan faktor internal dan eksternal jadi strategi SO, WO, ST, WT.',build:function(d){
    var W=300,H=170,G=6,Y=mY(d),s=titleNode(d,3*W+2*G);
    s.push(C('tl',0,Y,W,64,'TOWS',{tone:MS,mode:'solid',head:'center',nobody:1}));
    s.push(mCell(d,['s','Strengths (S)',MG,'',''],W+G,Y,W,64,{nobody:1}),mCell(d,['w','Weaknesses (W)',MR,'',''],2*(W+G),Y,W,64,{nobody:1}));
    s.push(mCell(d,['o','Opportunities (O)',MB,'',''],0,Y+64+G,W,H,{head:'center',nobody:1,mode:'solid'}),mCell(d,['t','Threats (T)',MA,'',''],0,Y+64+H+2*G,W,H,{head:'center',nobody:1,mode:'solid'}));
    [['so','Strategi SO',MG,'','Pakai kekuatan untuk meraih peluang'],['wo','Strategi WO',MB,'','Atasi kelemahan dengan memanfaatkan peluang'],['st','Strategi ST',MA,'','Pakai kekuatan untuk menangkal ancaman'],['wt','Strategi WT',MR,'','Kurangi kelemahan dan hindari ancaman']].forEach(function(c,i){s.push(mCell(d,c,W+G+(i%2)*(W+G),Y+64+G+Math.floor(i/2)*(H+G),W,H,{head:'plain'}))});
    return{nodes:s,edges:[]};
  }},
  prism:{n:'Brand Identity Prism',icon:'component',hint:'Kapferer: enam faset identitas merek. Kiri = eksternal, kanan = internal; atas = pengirim, bawah = penerima.',build:function(d){
    var CW=330,CH=170,G=8,Y=mY(d)+28,X=40,MW=220,s=titleNode(d,X+2*CW+MW+2*G);
    var F=[['phy','Physique',MB,'box','Ciri fisik: logo, warna, produk andalan, kemasan'],['per','Personality',MP,'smile','Karakter merek bila ia seorang manusia'],
      ['rel','Relationship',MT,'users','Hubungan yang ditawarkan merek ke pelanggan'],['cul','Culture',MA,'landmark','Nilai dan asal-usul yang mendasari merek'],
      ['ref','Reflection',MK,'user','Gambaran stereotip pelanggan merek'],['self','Self-image',MG,'heart','Cara pelanggan melihat dirinya saat memakai merek']];
    F.forEach(function(c,i){var col=i%2,row=Math.floor(i/2);s.push(mCell(d,c,col?X+CW+MW+2*G:X,Y+row*(CH+G),CW,CH))});
    s.push(C('brand',X+CW+G,Y+CH-20,MW,CH+40,d.brand||'Merek',{shape:'circle',tone:MN,mode:'solid',head:'center',nobody:1,big:1}));
    s.push(TX('top',X,Y-28,2*CW+MW+2*G,22,'Gambaran pengirim (sender)',{bold:1,muted:1}),TX('bot',X,Y+3*(CH+G),2*CW+MW+2*G,22,'Gambaran penerima (recipient)',{bold:1,muted:1}));
    s.push(TX('lft',0,Y,32,3*CH+2*G,'Eksternalisasi',{rot:-90,bold:1,muted:1}),TX('rgt',X+2*CW+MW+2*G+6,Y,32,3*CH+2*G,'Internalisasi',{rot:-90,bold:1,muted:1}));
    return{nodes:s,edges:[]};
  }},
  mix7p:{n:'Marketing Mix 7P',icon:'layout-grid',hint:'Product, Price, Place, Promotion (4P) + People, Process, Physical evidence untuk jasa.',build:function(d){return mGrid(d,[
    ['prod','Product',MB,'package','Fitur, kualitas, varian, kemasan'],['price','Price',MG,'credit-card','Harga, diskon, model langganan'],['place','Place',MT,'map-pin','Kanal distribusi, lokasi, jangkauan'],['promo','Promotion',MK,'send','Iklan, konten, promo, PR'],
    ['people','People',MA,'users','Staf yang melayani pelanggan'],['process','Process',MP,'workflow','Alur layanan dari order sampai selesai'],['pe','Physical Evidence',MS,'image','Bukti fisik: tempat, seragam, struk, website']],4,290,190)}},
  stp:{n:'STP (Segmentasi)',icon:'target',hint:'Segmentation → Targeting → Positioning.',build:function(d){var r=mGrid(d,[['seg','Segmentation',MB,'users','Bagi pasar: demografi, geografi, perilaku, psikografi'],['tgt','Targeting',MA,'target','Segmen yang dipilih dan alasannya'],['pos','Positioning',MG,'flag','Posisi di benak pelanggan + kalimat positioning']],3,330,300);
    r.edges=[E('seg','tgt','sync'),E('tgt','pos','sync')];return r}},
  errc:{n:'Blue Ocean ERRC',icon:'grid-2x2',hint:'Eliminate, Reduce, Raise, Create untuk membuat kurva nilai baru.',build:function(d){return mGrid(d,[
    ['el','Eliminate',MR,'x','Faktor industri yang dihapus'],['ra','Raise',MG,'trending-up','Faktor yang dinaikkan di atas standar industri'],['re','Reduce',MA,'minus','Faktor yang dikurangi di bawah standar industri'],['cr','Create',MB,'sparkles','Faktor baru yang belum ditawarkan industri']],2,420,220)}},
  aarrr:{n:'AARRR (Pirate Metrics)',icon:'filter',hint:'Funnel pertumbuhan startup. Tulis metrik dan target tiap tahap.',build:function(d){return mFunnel(d,[
    ['acq','Acquisition',MB,'Dari mana pengguna datang','Contoh: visitor/bulan, CAC'],['act','Activation',MT,'Pengalaman pertama yang berhasil','Contoh: % daftar → aksi inti'],['ret','Retention',MG,'Pengguna kembali lagi','Contoh: D7/D30 retention'],['ref','Referral',MA,'Pengguna mengajak orang lain','Contoh: K-factor, NPS'],['rev','Revenue',MR,'Pengguna membayar','Contoh: konversi berbayar, ARPU, LTV']],'Metrik & target')}},
  aida:{n:'Funnel AIDA',icon:'filter',hint:'Awareness → Interest → Desire → Action, plus kanal/konten tiap tahap.',build:function(d){return mFunnel(d,[
    ['a','Awareness',MB,'Tahu merek ada','Kanal: iklan, konten, SEO'],['i','Interest',MT,'Tertarik mencari tahu','Konten edukasi, demo'],['de','Desire',MA,'Ingin memiliki','Testimoni, promo, perbandingan'],['ac','Action',MG,'Membeli / mendaftar','CTA, checkout mulus']],'Kanal & konten')}},
  sipoc:{n:'SIPOC',icon:'columns-3',hint:'Suppliers → Inputs → Process → Outputs → Customers. Process cukup 4–7 langkah besar.',build:function(d){var r=mGrid(d,[
    ['sup','Suppliers',MS,'truck','Pihak yang memasok input'],['inp','Inputs',MB,'inbox','Bahan, data, dokumen'],['pro','Process',MT,'workflow','4–7 langkah tingkat tinggi'],['out','Outputs',MA,'package','Hasil proses'],['cus','Customers',MG,'users','Penerima output']],5,220,380);
    r.edges=[E('sup','inp','sync'),E('inp','pro','sync'),E('pro','out','sync'),E('out','cus','sync')];return r}},
  m7s:{n:'McKinsey 7S',icon:'share-2',hint:'Tujuh elemen organisasi yang harus selaras. Shared values di pusat.',build:function(d){
    var R=270,cx=360,Y=mY(d),cy=Y+300,s=titleNode(d,760),sz=170,ed=[];
    var F=[['strat','Strategy',MB],['struct','Structure',MN],['sys','Systems',MT],['style','Style',MK],['staff','Staff',MA],['skills','Skills',MP]];
    s.push(C('sv',cx-sz/2,cy-sz/2,sz,sz,'Shared Values',{shape:'circle',tone:MG,mode:'solid',head:'center',nobody:1}));
    F.forEach(function(c,i){var a=-Math.PI/2+i*Math.PI/3;s.push(C(c[0],cx+R*Math.cos(a)-sz/2,cy+R*Math.sin(a)*0.92-sz/2,sz,sz,c[1],{shape:'circle',tone:c[2],head:'ctop',body:d[c[0]],ph:'',mode:'soft'}));ed.push(E('sv',c[0],'line','',{route:'straight'}));ed.push(E(c[0],F[(i+1)%6][0],'line','',{route:'straight'}))});
    return{nodes:s,edges:ed};
  }},
  golden:{n:'Golden Circle',icon:'target',hint:'Simon Sinek: mulai dari Why (keyakinan), lalu How (cara), baru What (produk).',build:function(d){
    var Y=mY(d),s=titleNode(d,960);
    s.push(C('what',0,Y,420,420,'',{shape:'circle',tone:MB,head:'none',nobody:1}),C('how',60,Y+60,300,300,'',{shape:'circle',tone:MT,head:'none',nobody:1}),TX('whatT',110,Y+16,200,26,'WHAT',{bold:1,fs:16}),TX('howT',110,Y+76,200,26,'HOW',{bold:1,fs:16}),C('why',120,Y+120,180,180,'WHY',{shape:'circle',tone:MA,mode:'solid',head:'center',nobody:1,big:1}));
    [['why_b','Why · mengapa kami ada',MA,'heart','Keyakinan, tujuan, alasan di balik bisnis'],['how_b','How · cara kami berbeda',MT,'cog','Proses, nilai, keunggulan unik'],['what_b','What · apa yang kami tawarkan',MB,'package','Produk dan layanan']].forEach(function(c,i){s.push(mCell(d,c,460,Y+i*142,480,134))});
    return{nodes:s,edges:[]};
  }},
  bsc:{n:'Balanced Scorecard',icon:'target',hint:'Empat perspektif: tujuan, ukuran, target, inisiatif. Semua mengarah ke visi di tengah.',build:function(d){
    var W=380,H=210,G=20,Y=mY(d),s=titleNode(d,2*W+260),ph='Tujuan · ukuran (KPI) · target · inisiatif',cxw=220;
    s.push(mCell(d,['fin','Keuangan',MG,'chart-line',ph],(2*W+cxw+2*G-W)/2,Y,W,H));
    s.push(mCell(d,['cus','Pelanggan',MB,'users',ph],0,Y+H+G,W,H),C('vis',W+G,Y+H+G+20,cxw,H-40,d.vis||'Visi & strategi',{tone:MN,mode:'solid',head:'center',nobody:1,big:1}),mCell(d,['int','Proses bisnis internal',MT,'workflow',ph],W+cxw+2*G,Y+H+G,W,H));
    s.push(mCell(d,['lg','Pembelajaran & pertumbuhan',MA,'lightbulb',ph],(2*W+cxw+2*G-W)/2,Y+2*(H+G),W,H));
    return{nodes:s,edges:[E('vis','fin','line'),E('vis','cus','line'),E('vis','int','line'),E('vis','lg','line')]};
  }},
  // ---------- management, quality & research ----------
  smart:{n:'SMART Goals',icon:'target',hint:'Tulis satu tujuan, lalu uji: Specific, Measurable, Achievable, Relevant, Time-bound.',build:function(d){
    var W=232,G=8,Y=mY(d),s=titleNode(d,5*W+4*G);
    s.push(C('goal',0,Y,5*W+4*G,92,'Tujuan',{tone:MN,head:'side',sideW:150,body:d.goal,ph:'Contoh: Menaikkan pelanggan aktif bulanan dari 1.200 menjadi 2.000 sebelum 31 Desember lewat program referral.'}));
    [['s','S · Specific',MB,'target','Apa persisnya yang ingin dicapai? Siapa, di mana?'],['m','M · Measurable',MG,'chart-column','Angka apa yang membuktikan berhasil?'],['a','A · Achievable',MA,'gauge','Realistis dengan sumber daya yang ada?'],['r','R · Relevant',MP,'link-2','Kenapa penting bagi tujuan yang lebih besar?'],['t','T · Time-bound',MR,'calendar','Kapan tenggatnya? Ada milestone?']].forEach(function(c,i){s.push(mCell(d,c,i*(W+G),Y+100,W,260))});
    return{nodes:s,edges:[]};
  }},
  okr:{n:'OKR',icon:'flag',hint:'Satu Objective kualitatif, 3–5 Key Results terukur, dan inisiatif pendukung.',build:function(d){
    var W=300,G=10,Y=mY(d),s=titleNode(d,3*W+2*G);
    s.push(C('obj',0,Y,3*W+2*G,90,'Objective',{tone:MN,head:'side',sideW:150,body:d.obj,ph:'Tujuan kualitatif yang menginspirasi · periode (mis. Q1 2027)'}));
    [['kr1','Key Result 1',MG],['kr2','Key Result 2',MG],['kr3','Key Result 3',MG]].forEach(function(c,i){s.push(mCell(d,c.concat(['trending-up','Dari X ke Y · pemilik · progres %']),i*(W+G),Y+100,W,190))});
    s.push(mCell(d,['ini','Inisiatif',MA,'rocket','Proyek/aksi yang mendorong key result'],0,Y+300,3*W+2*G,150));
    return{nodes:s,edges:[E('obj','kr1','line'),E('obj','kr2','line'),E('obj','kr3','line')]};
  }},
  eisen:{n:'Matriks Eisenhower',icon:'grid-2x2',hint:'Prioritas tugas: penting × mendesak.',build:function(d){return mQuad(d,'Mendesak · tidak mendesak →','Tidak penting · penting →',[
    ['do','Kerjakan sekarang',MR,'zap','Penting & mendesak'],['plan','Jadwalkan',MB,'calendar','Penting, tidak mendesak'],['dele','Delegasikan',MA,'users','Mendesak, tidak penting'],['elim','Hapus',MS,'trash-2','Tidak penting & tidak mendesak']])}},
  impact:{n:'Matriks Impact–Effort',icon:'grid-2x2',hint:'Prioritas ide/fitur: dampak × usaha.',build:function(d){return mQuad(d,'Usaha: rendah · tinggi →','Dampak: rendah · tinggi →',[
    ['qw','Quick wins',MG,'zap','Dampak tinggi, usaha rendah → kerjakan dulu'],['mp','Major projects',MB,'rocket','Dampak tinggi, usaha tinggi → rencanakan'],['fi','Fill-ins',MA,'list','Dampak rendah, usaha rendah → saat senggang'],['tt','Thankless tasks',MR,'x','Dampak rendah, usaha tinggi → hindari']])}},
  stake:{n:'Stakeholder Map',icon:'users',hint:'Power/interest grid (Mendelow): tentukan cara mengelola tiap pemangku kepentingan.',build:function(d){return mQuad(d,'Kepentingan: rendah · tinggi →','Pengaruh: rendah · tinggi →',[
    ['ks','Keep satisfied',MA,'crown','Pengaruh tinggi, kepentingan rendah'],['mc','Manage closely',MR,'target','Pengaruh tinggi, kepentingan tinggi · pemain kunci'],['mo','Monitor',MS,'eye','Pengaruh rendah, kepentingan rendah'],['ki','Keep informed',MB,'mail','Pengaruh rendah, kepentingan tinggi']])}},
  raci:{n:'Matriks RACI',icon:'table',hint:'R = mengerjakan, A = bertanggung jawab akhir (satu orang), C = dimintai masukan, I = diberi tahu.',build:function(d){
    var roles=(d.roles||'PM|Tech lead|Developer|QA|Bisnis').split('|'),tasks=(d.tasks||'Tulis PRD|Desain arsitektur|Implementasi|Pengujian|Rilis').split('|');
    var M=[['A','C','I','I','R'],['C','A','R','I','I'],['I','A','R','C','I'],['I','C','C','A','I'],['A','R','I','C','I']],tone={R:MB,A:MR,C:MA,I:MS};
    return mTable(d,tasks,roles,200,130,52,function(i,j){var v=(M[i]||[])[j]||'';return{label:v,tone:tone[v]||MS,mode:v==='A'||v==='R'?'solid':'soft',big:1,uc:1}});
  }},
  risk:{n:'Matriks Risiko 5×5',icon:'triangle-alert',hint:'Skor = kemungkinan × dampak. Hijau terima, kuning pantau, oranye mitigasi, merah tindak segera.',build:function(d){
    var S=94,G=4,LX=60,Y=mY(d)+10,s=titleNode(d,LX+5*(S+G)+380),imp=['Sangat kecil','Kecil','Sedang','Besar','Sangat besar'],lik=['Hampir pasti','Mungkin sekali','Mungkin','Jarang','Sangat jarang'];
    for(var r=0;r<5;r++)for(var c=0;c<5;c++){var L=5-r,I=c+1,sc=L*I,t=sc>=15?MR:sc>=10?MO:sc>=5?MA:MG;s.push(C('k'+r+c,LX+c*(S+G),Y+r*(S+G),S,S,String(sc),{tone:t,mode:'solid',head:'center',nobody:1,big:1,uc:1}))}
    lik.forEach(function(l,r){s.push(TX('l'+r,0,Y+r*(S+G)+S/2-14,LX-6,28,l,{fs:11,muted:1}))});
    imp.forEach(function(l,c){s.push(TX('i'+c,LX+c*(S+G),Y+5*(S+G)+2,S,28,l,{fs:11,muted:1}))});
    s.push(TX('ax',LX,Y+5*(S+G)+30,5*(S+G),24,'Dampak →',{bold:1,muted:1}),TX('ay',LX-60,Y-24,200,20,'Kemungkinan ↓',{bold:1,muted:1,align:'left'}));
    s.push(mCell(d,['reg','Daftar risiko',MS,'list','R1 · deskripsi · K×D · pemilik · mitigasi'],LX+5*(S+G)+20,Y,360,5*(S+G)-G));
    return{nodes:s,edges:[]};
  }},
  gantt:{n:'Gantt / Timeline',icon:'calendar',hint:'Rencana proyek per minggu. Geser dan ubah lebar bar untuk menyesuaikan jadwal.',build:function(d){
    var tasks=[['Riset & PRD',0,2,MB],['Desain UI/UX',1,3,MP],['Backend & API',2,6,MT],['Frontend',3,7,MT],['Pengujian',6,8,MA],['Rilis',8,9,MG]],weeks=9,RW=200,CW=96,RH=46,Y=mY(d),s=titleNode(d,RW+weeks*CW);
    for(var w=0;w<weeks;w++)s.push(C('w'+w,RW+w*CW,Y,CW-2,40,'M'+(w+1),{tone:MN,mode:w%2?'soft':'solid',head:'center',nobody:1}));
    tasks.forEach(function(t,i){var y=Y+46+i*(RH+6);s.push(C('t'+i,0,y,RW-8,RH,t[0],{tone:MS,head:'plain',nobody:1}));s.push(C('b'+i,RW+t[1]*CW+4,y+6,(t[2]-t[1])*CW-8,RH-12,'',{tone:t[3],mode:'solid',head:'none',nobody:1}))});
    s.push(C('ms',RW+8*CW+CW/2-12,Y+46+5*(RH+6)+11,24,24,'',{tone:MR,mode:'solid',shape:'circle',head:'none',nobody:1}));
    return{nodes:s,edges:[]};
  }},
  kanban:{n:'Kanban Board',icon:'columns-3',hint:'Batasi pekerjaan berjalan (WIP). Satu baris = satu kartu tugas.',build:function(d){return mGrid(d,[['bl','Backlog',MS,'inbox','Ide dan tugas yang belum dijadwalkan'],['todo','To do',MB,'list-todo','Siap dikerjakan sprint ini'],['doing','In progress · WIP 3',MA,'hourglass','Sedang dikerjakan'],['rev','Review',MP,'eye','Menunggu review / QA'],['done','Done',MG,'circle-check-big','Selesai dan terverifikasi']],5,250,460)}},
  retro:{n:'Retrospektif',icon:'rotate-ccw',hint:'Start · Stop · Continue · Kudos. Akhiri dengan 1–3 aksi beserta pemiliknya.',build:function(d){var r=mGrid(d,[['start','Start',MG,'play','Apa yang mulai kita lakukan?'],['stop','Stop',MR,'circle-stop','Apa yang harus dihentikan?'],['cont','Continue',MB,'repeat','Apa yang sudah baik dan dilanjutkan?'],['kudos','Kudos',MA,'heart','Apresiasi untuk anggota tim']],4,280,300);
    r.nodes.push(mCell(d,['act','Aksi berikutnya',MN,'list-todo','Aksi · pemilik · tenggat'],0,mY(d)+308,4*280+3*8,130));return r}},
  pdca:{n:'Siklus PDCA',icon:'repeat',hint:'Plan → Do → Check → Act, lalu ulangi untuk perbaikan berkelanjutan.',build:function(d){
    var W=380,H=210,G=60,Y=mY(d),s=titleNode(d,2*W+G);
    s.push(mCell(d,['p','Plan',MB,'list-todo','Tujuan, akar masalah, rencana perbaikan'],0,Y,W,H),mCell(d,['d','Do',MT,'play','Uji coba skala kecil'],W+G,Y,W,H),mCell(d,['c','Check',MA,'search-check','Bandingkan hasil dengan target'],W+G,Y+H+G,W,H),mCell(d,['a','Act',MG,'rotate-cw','Standarkan bila berhasil, ulangi bila belum'],0,Y+H+G,W,H));
    return{nodes:s,edges:[E('p','d','sync','',{route:'curve'}),E('d','c','sync','',{route:'curve'}),E('c','a','sync','',{route:'curve'}),E('a','p','sync','',{route:'curve'})]};
  }},
  dmaic:{n:'DMAIC (Six Sigma)',icon:'git-merge',hint:'Define → Measure → Analyze → Improve → Control.',build:function(d){
    var W=230,Y=mY(d),s=titleNode(d,5*(W+6));
    [['def','Define',MB,'Masalah, tujuan, CTQ, scope, SIPOC'],['mea','Measure',MT,'Data baseline, kapabilitas proses'],['ana','Analyze',MA,'Akar masalah: fishbone, 5 whys, Pareto'],['imp','Improve',MG,'Solusi, uji coba, rencana implementasi'],['con','Control',MP,'SOP, control chart, monitoring']].forEach(function(c,i){
      s.push(C(c[0],i*(W+6),Y,W,330,c[1],{tone:c[2],head:'chev',first:i===0,body:d[c[0]],ph:c[3]}))});
    return{nodes:s,edges:[]};
  }},
  fishbone:{n:'Fishbone (Ishikawa)',icon:'git-fork',hint:'Sebab-akibat: 6M (Man, Machine, Method, Material, Measurement, Mother nature) menuju masalah di kepala ikan.',build:function(d){
    var CW=250,CH=140,Y=mY(d),SY=Y+CH+70,SW=880,s=titleNode(d,SW+240),ed=[];
    s.push(C('spine',0,SY,SW,8,'',{tone:MS,mode:'solid',head:'none',nobody:1}),C('head',SW+10,SY-60,220,128,d.masalah||'Masalah utama',{tone:MR,mode:'solid',head:'center',nobody:1,big:1}));
    var cats=[['man','Manusia',MB],['method','Metode',MT],['machine','Mesin / sistem',MP],['material','Material',MA],['meas','Pengukuran',MN],['env','Lingkungan',MG]];
    cats.forEach(function(c,i){var top=i<3,col=i%3,x=col*(CW+40);s.push(C(c[0],x,top?Y:SY+70,CW,CH,c[1],{tone:c[2],head:'band',body:d[c[0]],ph:'Penyebab · sub-penyebab'}));
      ed.push(E(c[0],'spine','line','',{route:'straight',fromAnchor:{x:0.5,y:top?1:0},toAnchor:{x:Math.min(0.98,(x+CW/2+110)/SW),y:0.5}}))});
    ed.push(E('spine','head','sync','',{route:'straight',fromAnchor:{x:1,y:0.5},toAnchor:{x:0,y:0.5}}));
    return{nodes:s,edges:ed};
  }},
  whys:{n:'5 Whys',icon:'circle-help',hint:'Tanya "mengapa" berulang sampai ketemu akar masalah yang bisa ditindaklanjuti.',build:function(d){
    var W=560,H=74,G=24,Y=mY(d),s=titleNode(d,W),ed=[];
    s.push(C('prob',0,Y,W,H,'Masalah',{tone:MR,head:'side',sideW:130,body:d.prob,ph:'Contoh: Pesanan sering terlambat dikirim'}));
    for(var i=1;i<=5;i++){s.push(C('w'+i,0,Y+i*(H+G),W,H,'Mengapa '+i+'?',{tone:i<5?MA:MO,head:'side',sideW:130,body:d['w'+i],ph:'Karena…'}));ed.push(E(i===1?'prob':'w'+(i-1),'w'+i,'sync'))}
    s.push(C('root',0,Y+6*(H+G),W,H+10,'Akar masalah & aksi',{tone:MG,head:'side',sideW:130,mode:'soft',body:d.root,ph:'Akar masalah · tindakan pencegahan · pemilik'}));ed.push(E('w5','root','sync'));
    return{nodes:s,edges:ed};
  }},
  gap:{n:'Gap Analysis',icon:'arrow-right-left',hint:'Kondisi sekarang → kesenjangan → kondisi yang diinginkan, lalu rencana aksi.',build:function(d){
    var W=320,G=10,Y=mY(d),s=titleNode(d,3*W+2*G);
    s.push(mCell(d,['now','Kondisi saat ini',MS,'map-pin','Fakta dan angka sekarang'],0,Y,W,260,{shape:'arrowR'}),mCell(d,['gap','Kesenjangan',MR,'triangle-alert','Apa yang kurang dan kenapa'],W+G,Y,W,260,{shape:'arrowR'}),mCell(d,['fut','Kondisi yang diinginkan',MG,'flag','Target terukur dan tenggat'],2*(W+G),Y,W,260));
    s.push(mCell(d,['plan','Rencana aksi',MB,'list-todo','Aksi · pemilik · tenggat · biaya'],0,Y+270,3*W+2*G,150));
    return{nodes:s,edges:[]};
  }},
  decision:{n:'Decision Matrix',icon:'scale',hint:'Bandingkan opsi dengan kriteria berbobot. Skor 1–5 × bobot, jumlahkan.',build:function(d){
    var crit=['Biaya (30%)','Waktu (20%)','Skalabilitas (25%)','Risiko (25%)','Total'],opts=['Opsi A','Opsi B','Opsi C'],sc=[[4,3,5,3],[3,5,3,4],[5,4,2,2]],w=[.3,.2,.25,.25];
    return mTable(d,opts,crit,180,150,56,function(i,j){if(j<4)return{label:String(sc[i][j]),tone:MS,big:1};var t=sc[i].reduce(function(a,v,k){return a+v*w[k]},0);return{label:t.toFixed(2),tone:MG,mode:'solid',big:1}});
  }},
  prisma:{n:'PRISMA 2020 Flow',icon:'filter',hint:'Alur seleksi studi untuk systematic review: identifikasi → skrining → inklusi. Isi angka n di tiap kotak.',build:function(d){
    var X=140,W=380,H=96,G=40,RX=X+W+60,RW=360,Y=mY(d)+10,s=titleNode(d,RX+RW),ed=[],y=function(i){return Y+i*(H+G)};
    var main=[['id','Records identified from:','Databases (n = )\nRegisters (n = )'],['sc','Records screened','(n = )'],['rs','Reports sought for retrieval','(n = )'],['el','Reports assessed for eligibility','(n = )'],['inc','Studies included in review','Studies (n = )\nReports of included studies (n = )']];
    var side=[['rm','Records removed before screening:','Duplicates (n = )\nMarked ineligible by automation (n = )\nOther reasons (n = )'],['ex1','Records excluded','(n = )'],['nr','Reports not retrieved','(n = )'],['ex2','Reports excluded:','Reason 1 (n = )\nReason 2 (n = )\nReason 3 (n = )']];
    main.forEach(function(m,i){s.push(C(m[0],X,y(i),W,i===4?H+10:H,m[1],{tone:i===4?MG:MB,head:'plain',body:d[m[0]]||m[2]}));if(i)ed.push(E(main[i-1][0],m[0],'sync'))});
    side.forEach(function(m,i){s.push(C(m[0],RX,y(i)+(i===0||i===3?-8:0),RW,i===0||i===3?H+16:H,m[1],{tone:MS,head:'plain',body:d[m[0]]||m[2]}));ed.push(E(main[i][0],m[0],'sync'))});
    [['Identification',0,1],['Screening',1,4],['Included',4,5]].forEach(function(p,i){s.push(C('ph'+i,0,y(p[1]),124,y(p[2])-y(p[1])-G+(i===2?10:0),p[0],{tone:MN,mode:'solid',head:'center',nobody:1}))});
    return{nodes:s,edges:ed};
  }},
  // ---------- product ----------
  kano:{n:'Model Kano',icon:'smile',hint:'Klasifikasi fitur menurut kepuasan pelanggan.',build:function(d){return mGrid(d,[['must','Must-be',MR,'shield-check','Wajib ada; tanpa ini pelanggan kecewa'],['perf','Performance',MB,'trending-up','Makin baik, makin puas (linear)'],['attr','Attractive / delighter',MG,'sparkles','Tak diharapkan, bikin senang'],['ind','Indifferent',MS,'minus','Tidak memengaruhi kepuasan'],['rev','Reverse',MA,'rotate-ccw','Malah tidak disukai sebagian pelanggan']],5,240,380)}},
  moscow:{n:'MoSCoW',icon:'list-todo',hint:'Prioritas scope rilis: Must, Should, Could, Won’t (kali ini).',build:function(d){return mGrid(d,[['must','Must have',MR,'zap','Tanpa ini rilis gagal'],['should','Should have',MA,'flag','Penting, tapi bisa ditunda sebentar'],['could','Could have',MB,'lightbulb','Bagus bila sempat'],['wont','Won’t have (now)',MS,'x','Sengaja di luar scope rilis ini']],4,290,420)}},
  rice:{n:'RICE Scoring',icon:'table',hint:'Skor = Reach × Impact × Confidence ÷ Effort. Urutkan dari skor tertinggi.',build:function(d){
    var F=[['Onboarding baru',2000,2,0.8,3],['Bayar QRIS',1500,3,0.9,2],['Mode gelap',800,0.5,1,1],['Rekomendasi AI',1200,2,0.5,6]],cols=['Reach / kuartal','Impact (0.25–3)','Confidence','Effort (bulan-orang)','Skor RICE'];
    return mTable(d,F.map(function(f){return f[0]}),cols,200,140,54,function(i,j){var f=F[i];if(j<4)return{label:String(j===2?Math.round(f[3]*100)+'%':f[j+1]),tone:MS};return{label:String(Math.round(f[1]*f[2]*f[3]/f[4])),tone:MG,mode:'solid',big:1}});
  }},
  roadmap:{n:'Roadmap Now–Next–Later',icon:'milestone',hint:'Roadmap berbasis outcome tanpa tanggal palsu: sekarang, berikutnya, nanti.',build:function(d){return mGrid(d,[['now','Now',MG,'zap','Sedang dikerjakan · outcome yang dikejar'],['next','Next',MB,'arrow-right-left','Berikutnya setelah Now selesai'],['later','Later',MS,'telescope','Ide yang masih perlu validasi']],3,360,440)}},
  blueprint:{n:'Service Blueprint',icon:'layers',hint:'Langkah layanan × lapisan: bukti fisik, aksi pelanggan, frontstage, backstage, proses pendukung.',build:function(d){
    var st=(d.stages||'Cari info|Pesan|Datang|Dilayani|Bayar').split('|'),rows=[['ev','Bukti fisik',MS],['cust','Aksi pelanggan',MB],['front','Frontstage',MT],['back','Backstage',MA],['sup','Proses pendukung',MP]];
    var LW=160,CW=210,HH=44,RH=104,G=6,Y=mY(d),s=titleNode(d,LW+G+st.length*(CW+G)),lines={1:'Garis interaksi',2:'Garis visibilitas',3:'Garis interaksi internal'};
    st.forEach(function(n,j){s.push(C('s'+j,LW+G+j*(CW+G),Y,CW,HH,n,{head:'chev',mode:'bare',tone:j%2?'#3d73a8':'#2f5d8a',first:j===0,nobody:1}))});
    var y=Y+HH+G;rows.forEach(function(r,i){if(lines[i]){s.push(TX('ln'+i,LW+G,y,st.length*(CW+G),18,'— '+lines[i]+' —',{fs:10.5,muted:1}));y+=20}
      s.push(C('r'+i,0,y,LW,RH,r[1],{mode:'solid',tone:r[2],head:'center',nobody:1}));st.forEach(function(n,j){s.push(C(r[0]+j,LW+G+j*(CW+G),y,CW,RH,'',{head:'none',tone:r[2],qf:n+' · '+r[1],body:d[r[0]+j]}))});y+=RH+G});
    return{nodes:s,edges:[]};
  }},
  storymap:{n:'User Story Map',icon:'map',hint:'Aktivitas besar di atas, langkah di bawahnya, lalu story per rilis (MVP dulu).',build:function(d){
    var acts=(d.acts||'Menemukan|Memesan|Membayar|Memakai').split('|'),CW=250,G=8,Y=mY(d),s=titleNode(d,acts.length*(CW+G)+120);
    acts.forEach(function(a,j){var x=120+j*(CW+G);s.push(C('a'+j,x,Y,CW,54,a,{tone:MN,mode:'solid',head:'center',nobody:1}),C('st'+j,x,Y+62,CW,90,'Langkah',{tone:MB,head:'plain',body:d['st'+j],ph:'Langkah pengguna dalam aktivitas ini'}))});
    [['MVP',MG],['Rilis 2',MA],['Nanti',MS]].forEach(function(r,i){var y=Y+170+i*168;s.push(C('rl'+i,0,y,110,160,r[0],{tone:r[1],mode:'solid',head:'center',nobody:1}));acts.forEach(function(a,j){s.push(C('u'+i+'_'+j,120+j*(CW+G),y,CW,160,'',{tone:r[1],head:'none',qf:a+' · '+r[0],ph:'Sebagai …, saya ingin …, agar …',body:d['u'+i+'_'+j]}))})});
    return{nodes:s,edges:[]};
  }},
  ost:{n:'Opportunity Solution Tree',icon:'network',hint:'Teresa Torres: outcome → peluang (masalah pengguna) → solusi → eksperimen.',build:function(d){
    var Y=mY(d),W=230,G=24,s=titleNode(d,6*(W+G)),ed=[];
    s.push(C('out',(6*(W+G)-G)/2-170,Y,340,80,'Outcome',{tone:MN,mode:'solid',head:'center',sub:d.out||'Contoh: retensi 30 hari naik dari 25% ke 35%',nobody:1}));
    for(var i=0;i<3;i++){var ox=i*2*(W+G)+(W+G)/2;s.push(C('o'+i,ox,Y+140,W,90,'Peluang '+(i+1),{tone:MB,head:'plain',body:d['o'+i],ph:'Kebutuhan / masalah pengguna'}));ed.push(E('out','o'+i,'line'));
      for(var j=0;j<2;j++){var k=i*2+j,sx=k*(W+G);s.push(C('s'+k,sx,Y+290,W,80,'Solusi',{tone:MT,head:'plain',body:d['s'+k],ph:'Ide solusi'}),C('x'+k,sx,Y+410,W,80,'Eksperimen',{tone:MA,head:'plain',body:d['x'+k],ph:'Uji asumsi tercepat'}));ed.push(E('o'+i,'s'+k,'line'),E('s'+k,'x'+k,'line'))}}
    return{nodes:s,edges:ed};
  }}
};
// register frameworks as diagram types (and inside “Insert framework” sections)
WS.splice(1,0,{id:'plan',n:'Manajemen & Riset',icon:'flag'});WS_BY.plan=WS[1];
var MF_WS={biz:['lean','bcg','ansoff','tows','prism','mix7p','stp','errc','aarrr','aida','sipoc','m7s','golden','bsc'],plan:['smart','okr','eisen','impact','stake','raci','risk','gantt','kanban','retro','pdca','dmaic','fishbone','whys','gap','decision','prisma'],ux:['kano','moscow','rice','roadmap','blueprint','storymap','ost']};
SEC['fw-plan']={n:'Insert framework',keys:[]};
Object.keys(MF_WS).forEach(function(ws){MF_WS[ws].forEach(function(k){var m=MF[k];
  if(!ICONS[m.icon])m.icon='layout-grid';
  FW[k]={n:m.n,icon:m.icon,build:m.build};DT[k]={ws:ws,n:m.n,fw:k,hint:m.hint,pal:['fw-blocks','notes']};DT_ICON[k]=m.icon;
  SEC[ws==='plan'?'fw-plan':ws==='ux'?'fw-ux':'fw-biz'].keys.push('fw:'+k)})});
var mfPrim0=primarySecs;primarySecs=function(dt){var p=mfPrim0(dt);if(DT[dt]&&DT[dt].ws==='plan')p=p.map(function(s){return s==='fw-biz'?'fw-plan':s});return p};
var mfWsSec0=wsSections;wsSections=function(ws){var o=mfWsSec0(ws);if(ws==='plan'&&o.indexOf('fw-plan')<0)o.push('fw-plan');if(ws==='sys'&&o.indexOf('sd-patterns')<0)o.splice(1,0,'sd-patterns');return o};

// ---------- system-design components & patterns ----------
CAT.pattern={n:'System design patterns',light:'#0e6169',dark:'#6db5bb'};
var MORE_COMPS=[
  ['rproxy','Reverse proxy','arrow-left-right','edge','nginx envoy traefik reverse proxy'],['gslb','Global LB / GeoDNS','globe','edge','geo dns anycast global load balancer multi region'],['edgefn','Edge function','zap','edge','cloudflare workers lambda edge'],['ingress','Ingress controller','log-in','edge','nginx ingress kubernetes'],['lb4','L4 load balancer','split','edge','tcp nlb layer 4'],['lb7','L7 load balancer','split','edge','http alb layer 7 path routing'],
  ['appsrv','App server','server','compute','tomcat node express django rails'],['bff','BFF','layout-template','compute','backend for frontend'],['batch','Batch job','list-todo','compute','spark batch etl nightly'],['streamproc','Stream processor','activity','compute','flink kafka streams spark streaming'],['rtsrv','Realtime server','radio','compute','socket.io websocket presence chat'],['transcode','Transcoder','repeat','compute','ffmpeg video encoding'],
  ['kv','Key-value store','key-round','data','redis dynamodb etcd key value'],['graphdb','Graph DB','share-2','data','neo4j graph'],['lake','Data lake','waves','data','s3 lake parquet delta iceberg'],['cdc','CDC','repeat','data','debezium change data capture'],['olap','OLAP / analytics DB','chart-column','data','clickhouse druid bigquery'],['dcache','Distributed cache','layers','data','redis cluster memcached'],['ledger','Ledger','scroll-text','data','double entry accounting'],['idgen','ID generator','binary','data','snowflake uuid ticket server'],['geoidx','Geo index','map-pin','data','geohash quadtree s2 h3'],['blob','Media store','image','data','images videos blob'],
  ['eventbus','Event bus','share-2','msg','eventbridge kafka bus'],['notif','Notification service','bell-ring','msg','fan out push email sms'],['fanout','Fan-out service','share-2','msg','fanout timeline feed'],
  ['sso','SSO','log-in','sec','saml oidc single sign on'],['mfa','MFA','fingerprint','sec','2fa otp'],['ddos','DDoS protection','shield','sec','shield cloudflare scrubbing'],['iam','IAM / RBAC','users-round','sec','roles permissions policy'],['siem','SIEM','radar','sec','security monitoring splunk'],['cert','TLS certificate','badge-check','sec','ssl https cert manager'],
  ['tracing','Distributed tracing','waypoints','ops','jaeger tempo opentelemetry'],['apm','APM','gauge','ops','datadog new relic'],['oncall','On-call','phone','ops','pagerduty opsgenie'],['registry','Container registry','package','ops','ecr gcr docker hub'],['iac','IaC','code-xml','ops','terraform pulumi'],['statuspage','Status page','signpost','ops','incident status'],['loadtest','Load test','flame','ops','k6 jmeter locust'],
  ['crm','CRM','users','ext','salesforce hubspot'],['erp','ERP','factory','ext','sap odoo'],['cms','CMS','file-text','ext','wordpress strapi contentful'],['helpdesk','Helpdesk','message-circle','ext','zendesk freshdesk ticket'],['market','Marketplace','shopping-cart','ext','tokopedia shopee marketplace'],['social','Social media','share-2','ext','instagram tiktok'],['ads','Ads platform','target','ext','google ads meta ads'],['acct','Accounting','scale','ext','jurnal xero accounting'],['hris','HRIS','id-card','ext','payroll hr'],['pos','POS','credit-card','ext','point of sale kasir'],
  ['cacheaside','Cache-aside','memory-stick','pattern','lazy loading cache read through miss'],['wthrough','Write-through cache','memory-stick','pattern','write through'],['wback','Write-back cache','memory-stick','pattern','write behind'],['hashring','Consistent hashing','circle-dot','pattern','hash ring virtual nodes'],['cqrs','CQRS','git-fork','pattern','command query segregation'],['evsrc','Event sourcing','history','pattern','event store append only'],['bulkhead','Bulkhead','square-stack','pattern','isolation pool'],['throttle','Backpressure','hourglass','pattern','throttling load shedding'],['quorum','Quorum','users','pattern','consensus raft paxos majority'],['canary','Canary release','flag','pattern','progressive rollout'],['bluegreen','Blue/green deploy','toggle-left','pattern','zero downtime'],['georep','Geo replication','earth','pattern','multi region active active'],['leader','Leader election','crown','pattern','zookeeper raft'],['strangler','Strangler fig','git-merge','pattern','migration monolith'],['tokenbucket','Token bucket','gauge','pattern','rate limiting leaky bucket'],['bloom','Bloom filter','filter','pattern','probabilistic membership'],['pagination','Cursor pagination','list','pattern','keyset cursor'],['presign','Pre-signed URL','link-2','pattern','direct upload s3']
];
MORE_COMPS.forEach(function(c){if(T['c-'+c[0]])return;var icon=ICONS[c[2]]?c[2]:'box';COMPS.push([c[0],c[1],icon,c[3]]);KW[c[0]]=c[4];T['c-'+c[0]]={f:'comp',n:c[1],icon:icon,cat:c[3],kw:c[4]};
  if(c[3]==='pattern')return;if(SEC[c[3]]&&SEC[c[3]].keys.indexOf('c-'+c[0])<0)SEC[c[3]].keys.push('c-'+c[0])});
SEC['sd-patterns']={n:'System design patterns',keys:MORE_COMPS.filter(function(c){return c[3]==='pattern'}).map(function(c){return 'c-'+c[0]}),cat:'pattern'};
// event storming stickies
[['es-event','Domain event','#ffb347'],['es-command','Command','#8ec5ff'],['es-actor','Actor','#fff3a3'],['es-agg','Aggregate','#ffe066'],['es-policy','Policy','#d7b8ff'],['es-read','Read model','#a8e6a1'],['es-ext','External system','#ffb3d1'],['es-hot','Hotspot','#ff8080']].forEach(function(c){T[c[0]]={f:'note',k:'note',n:c[1],fill:c[2],sz:c[0]==='es-actor'?[110,80]:[160,110],lab:c[1],kw:'event storming ddd sticky '+c[1].toLowerCase()}});
SEC['es']={n:'Event storming',keys:['es-event','es-command','es-actor','es-agg','es-policy','es-read','es-ext','es-hot']};
// new technical diagram types
DT.sysdesign={ws:'sys',n:'System Design',pal:['client','edge','compute','data','msg','sd-patterns','prod','sec','ops','zones'],hint:'Klien → DNS/CDN → load balancer → service → cache/DB/queue. Beri label QPS, latensi, dan pola skala di garisnya.'};
DT.threat={ws:'sys',n:'Threat Model (STRIDE)',pal:['dfd','zones','sec','notes'],hint:'DFD + trust boundary. Tiap aliran yang melewati boundary diperiksa: Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation.'};
DT.cicd={ws:'sys',n:'CI/CD Pipeline',pal:['ops','compute','sec','prod','notes'],hint:'Commit → build → test → scan → artifact → staging → produksi, plus rollback dan monitoring.'};
DT.eventstorm={ws:'se',n:'Event Storming',pal:['es','notes'],hint:'Oranye = domain event (bentuk lampau), biru = command, kuning = aggregate, ungu = policy, hijau = read model, pink = sistem eksternal.'};
Object.assign(DT_ICON,{sysdesign:'network',threat:'shield-alert',cicd:'rocket',eventstorm:'sticky-note'});
Object.assign(EDGE_FOR,{eventstorm:['sync','line'],threat:['dflow'],cicd:['sync','async']});
function gx(dt,n,spec){EX[dt+':'+n]={n:DT[dt].n+' · '+n,dt:dt,build:function(){buildGraph(spec,60,80)}}}
gx('sysdesign','Rate limiter',{dir:'LR',nodes:[['u','c-users','Klien',{sub:'10k rps'}],['lb','c-lb7','L7 load balancer'],['rl','c-ratelimit','Rate limiter',{sub:'token bucket · 100 req/menit/user'}],['rc','c-dcache','Counter store',{sub:'Redis cluster · INCR + TTL'}],['api','c-service','API service'],['rules','c-config','Rules',{sub:'limit per endpoint'}],['m','c-metrics','Metrics']],
  edges:[['u','lb','sync','HTTPS'],['lb','rl'],['rl','rc','sync','cek & kurangi token'],['rl','api','sync','lolos'],['rules','rl','async','reload'],['rl','m','async','429 count']]});
gx('sysdesign','Chat realtime',{dir:'LR',nodes:[['m','c-mobile','Aplikasi chat'],['lb','c-lb4','L4 load balancer',{sub:'sticky by user'}],['ws','c-rtsrv','Chat server',{sub:'WebSocket · presence'}],['pres','c-dcache','Presence',{sub:'Redis · heartbeat 30s'}],['bus','c-stream','Message stream',{sub:'Kafka · partisi per chat'}],['store','c-nosql','Message store',{sub:'Cassandra · (chat_id, ts)'}],['id','c-idgen','ID generator',{sub:'Snowflake'}],['push','c-notif','Push',{sub:'APNs/FCM bila offline'}],['media','c-blob','Media store',{sub:'S3 + CDN'}]],
  edges:[['m','lb','sync','WSS'],['lb','ws'],['ws','pres','sync'],['ws','id','sync','id pesan'],['ws','bus','async','kirim'],['bus','store','async','persist'],['bus','ws','async','fan-out ke penerima'],['bus','push','async','offline'],['m','media','sync','upload (pre-signed)']]});
gx('sysdesign','News feed',{dir:'LR',nodes:[['u','c-mobile','Aplikasi'],['gw','c-apigw','API gateway'],['post','c-service','Post service'],['db','c-sql','Post DB',{sub:'sharded by user_id'}],['fan','c-fanout','Fan-out worker',{sub:'push untuk user biasa, pull untuk selebriti'}],['q','c-queue','Queue'],['feed','c-dcache','Feed cache',{sub:'Redis sorted set · 800 item'}],['fs','c-service','Feed service'],['graph','c-graphdb','Social graph'],['media','c-cdn','CDN']],
  edges:[['u','gw','sync','HTTPS'],['gw','post','sync','POST /posts'],['post','db','sync'],['post','q','async','PostCreated'],['q','fan','async'],['fan','graph','sync','followers'],['fan','feed','async','tulis ke feed'],['gw','fs','sync','GET /feed'],['fs','feed','sync','cache-aside'],['u','media','sync','gambar']]});
gx('sysdesign','Video streaming',{dir:'LR',nodes:[['cr','c-user','Kreator'],['up','c-service','Upload service',{sub:'resumable · pre-signed URL'}],['raw','c-storage','Raw storage'],['q','c-queue','Job queue'],['tc','c-transcode','Transcoder',{sub:'HLS 240p–1080p'}],['out','c-storage','Segment store'],['cdn','c-cdn','CDN',{sub:'edge cache · 95% hit'}],['v','c-users','Penonton'],['meta','c-sql','Metadata DB'],['an','c-olap','View analytics']],
  edges:[['cr','up','sync','upload'],['up','raw','sync'],['up','q','async','VideoUploaded'],['q','tc','async'],['tc','raw','sync','baca'],['tc','out','sync','segmen'],['tc','meta','sync','status siap'],['out','cdn','sync','origin'],['v','cdn','sync','adaptive bitrate'],['v','an','async','event tonton']]});
gx('sysdesign','Ride hailing',{dir:'LR',nodes:[['rider','c-mobile','Aplikasi penumpang'],['driver','c-mobile','Aplikasi pengemudi'],['gw','c-apigw','API gateway'],['loc','c-service','Location service',{sub:'update tiap 4 detik'}],['geo','c-geoidx','Geo index',{sub:'Redis GEO / H3'}],['match','c-service','Matching service'],['trip','c-service','Trip service'],['tdb','c-sql','Trip DB'],['price','c-service','Pricing',{sub:'surge'}],['pay','c-payment','Payment gateway'],['notif','c-notif','Notification']],
  edges:[['driver','gw','sync','lokasi'],['rider','gw','sync','pesan'],['gw','loc','sync'],['loc','geo','sync','GEOADD'],['gw','match','sync','cari driver'],['match','geo','sync','radius 3 km'],['match','price','sync'],['match','trip','sync','buat trip'],['trip','tdb','sync'],['trip','pay','sync','charge'],['trip','notif','async']]});
gx('sysdesign','Payment system',{dir:'LR',nodes:[['c','c-web','Checkout'],['api','c-service','Payment API',{sub:'idempotency key'}],['idem','c-idem','Idempotency store'],['led','c-ledger','Ledger',{sub:'double-entry · append-only'}],['psp','c-payment','PSP',{sub:'kartu, QRIS, VA'}],['wh','c-webhook','Webhook handler'],['out','c-outbox','Outbox'],['bus','c-eventbus','Event bus'],['rec','c-batch','Reconciliation',{sub:'harian vs laporan PSP'}],['fraud','c-model','Fraud check']],
  edges:[['c','api','sync','POST /payments'],['api','idem','sync'],['api','fraud','sync','skor'],['api','psp','sync','charge'],['psp','wh','async','callback'],['wh','led','sync','posting'],['led','out','sync','dalam satu transaksi'],['out','bus','async','PaymentSucceeded'],['rec','led','sync'],['rec','psp','sync','settlement report']]});
gx('sysdesign','URL shortener (skala)',{dir:'LR',nodes:[['u','c-users','Klien',{sub:'100:1 baca:tulis'}],['dns','c-dns','DNS'],['cdn','c-cdn','CDN',{sub:'cache redirect 301'}],['lb','c-lb7','Load balancer'],['w','c-service','Write API'],['r','c-service','Redirect API'],['id','c-idgen','ID generator',{sub:'base62 · 7 karakter'}],['c','c-dcache','Cache',{sub:'LRU hot links'}],['kv','c-kv','URL store',{sub:'DynamoDB · partisi by code'}],['an','c-stream','Click stream'],['bf','c-bloom','Bloom filter',{sub:'cek alias dipakai'}]],
  edges:[['u','dns'],['u','cdn','sync','GET /abc123'],['cdn','lb','sync','miss'],['lb','w','sync','POST'],['lb','r','sync','GET'],['w','id','sync'],['w','bf','sync'],['w','kv','sync'],['r','c','sync','cache-aside'],['r','kv','sync','miss'],['r','an','async']]});
gx('sysdesign','Web crawler',{dir:'LR',nodes:[['seed','c-files','Seed URLs'],['fr','c-queue','URL frontier',{sub:'prioritas + politeness per host'}],['f','c-worker','Fetcher',{sub:'robots.txt · rate per domain'}],['dns','c-dns','DNS cache'],['p','c-worker','Parser'],['dup','c-bloom','URL seen?',{sub:'Bloom filter'}],['cs','c-kv','Content hash',{sub:'dedup konten'}],['st','c-storage','Page store'],['idx','c-search','Indexer']],
  edges:[['seed','fr'],['fr','f','async'],['f','dns','sync'],['f','p','async','HTML'],['p','cs','sync'],['p','st','sync'],['p','dup','sync','link baru'],['dup','fr','async','belum pernah'],['st','idx','async']]});
gx('sysdesign','Search autocomplete',{dir:'LR',nodes:[['u','c-web','Search box',{sub:'debounce 150 ms'}],['cdn','c-cdn','CDN',{sub:'cache prefix populer'}],['api','c-service','Suggest API',{sub:'p99 < 50 ms'}],['trie','c-dcache','Top-k trie',{sub:'in-memory per shard'}],['logs','c-stream','Query log'],['agg','c-batch','Aggregator',{sub:'hitung frekuensi per jam'}],['build','c-worker','Trie builder'],['st','c-storage','Snapshot']],
  edges:[['u','cdn','sync','GET /suggest?q=ba'],['cdn','api','sync','miss'],['api','trie','sync','prefix'],['u','logs','async','query final'],['logs','agg','async'],['agg','build','async'],['build','st','sync'],['st','trie','async','muat ulang']]});
gx('sysdesign','Notification service',{dir:'LR',nodes:[['svc','c-micro','Layanan lain'],['api','c-service','Notification API',{sub:'template + preferensi user'}],['pref','c-sql','Preferensi & opt-out'],['q','c-queue','Queue per kanal',{sub:'prioritas tinggi/rendah'}],['wp','c-worker','Push worker'],['we','c-worker','Email worker'],['ws','c-worker','SMS worker'],['dlq','c-dlq','Dead-letter queue'],['push','c-push','APNs / FCM'],['mail','c-email','Email provider'],['sms','c-sms','SMS gateway'],['trk','c-olap','Delivery tracking']],
  edges:[['svc','api','async','event'],['api','pref','sync'],['api','q','async'],['q','wp','async'],['q','we','async'],['q','ws','async'],['wp','push','sync'],['we','mail','sync'],['ws','sms','sync'],['wp','dlq','async','gagal 5×'],['wp','trk','async']]});
gx('threat','Login & pembayaran',{dir:'LR',nodes:[['u','dfd-ext','Pengguna'],['web','dfd-proc','Web app',{num:'1'}],['api','dfd-proc','API',{num:'2'}],['auth','dfd-proc','Auth',{num:'3'}],['db','dfd-store','Database'],['psp','dfd-ext','Payment provider']],
  edges:[['u','web','dflow','kredensial (S, I)'],['web','api','dflow','token JWT (T, E)'],['api','auth','dflow','verifikasi'],['api','db','dflow','query (T, I)'],['api','psp','dflow','charge (R, D)']],
  zones:[['dmz','z-boundary','Trust boundary · internet',['web']],['core','z-boundary','Trust boundary · jaringan internal',['api','auth','db']]]});
gx('cicd','Pipeline web app',{dir:'LR',nodes:[['dev','c-user','Developer'],['repo','c-repo','Repository',{sub:'PR + review'}],['ci','c-cicd','CI',{sub:'lint · unit test · build'}],['sast','c-shield','Security scan',{sub:'SAST + dependency'}],['reg','c-registry','Container registry'],['stg','c-k8s','Staging',{sub:'e2e + load test'}],['can','c-canary','Canary 5%'],['prod','c-k8s','Produksi'],['mon','c-monitor','Monitoring',{sub:'SLO · error budget'}],['rb','c-retry','Rollback otomatis']],
  edges:[['dev','repo','sync','push'],['repo','ci','async','trigger'],['ci','sast'],['sast','reg','sync','image'],['reg','stg','sync','deploy'],['stg','can','sync','approve'],['can','prod','sync','promote'],['can','mon','async'],['mon','rb','async','SLO turun'],['rb','prod','sync']]});
EX['eventstorm:Booking studio']={n:'Event Storming · Booking studio',dt:'eventstorm',build:function(){
  var row=[['es-actor','Pelanggan'],['es-command','Pesan studio'],['es-agg','Booking'],['es-event','Studio dipesan'],['es-policy','Bila dipesan → minta bayar'],['es-command','Bayar'],['es-ext','Payment gateway'],['es-event','Pembayaran diterima'],['es-read','Jadwal studio']];
  var prev=null;row.forEach(function(r,i){var n=addNode(r[0],0,0);n.label=r[1];n.x=40+i*190;n.y=r[0]==='es-actor'?200:180;if(prev&&r[0]!=='es-read')addEdge(prev.id,n.id,'sync');prev=n});
  var h=addNode('es-hot',0,0);h.label='Bagaimana jika slot diambil orang lain saat membayar?';h.x=1180;h.y=20;
}};
