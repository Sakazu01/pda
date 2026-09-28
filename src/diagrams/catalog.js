// ================= extra catalog: new families =================
CAT.k8s={n:'Kubernetes',light:'#2563a8',dark:'#7fb2ef'};
CAT.net={n:'Network devices',light:'#52606f',dark:'#b6c0cd'};
var MORE_COMPS=[
  ['k-pod','Pod','box','k8s'],['k-deploy','Deployment','layers','k8s'],['k-sts','StatefulSet','database','k8s'],['k-svc','Service (k8s)','share-2','k8s'],['k-ing','Ingress','log-in','k8s'],['k-cm','ConfigMap','settings-2','k8s'],['k-secret','Secret','lock','k8s'],['k-pv','Persistent volume','hard-drive','k8s'],['k-hpa','HPA','trending-up','k8s'],['k-job','CronJob','calendar-clock','k8s'],['k-node','Node','server','k8s'],
  ['n-isp','ISP / Internet','cloud','net'],['n-router','Router','router','net'],['n-fw','Firewall','brick-wall','net'],['n-switch','Switch','ethernet-port','net'],['n-ap','Access point','wifi','net'],['n-server','Server','server','net'],['n-nas','NAS','hard-drive','net'],['n-pc','PC','monitor','net'],['n-laptop','Laptop','laptop','net'],['n-printer','Printer','printer','net'],['n-phone','IP phone','phone','net'],['n-cctv','CCTV','cctv','net'],
  ['d-leader','Leader node','crown','compute'],['d-follower','Follower node','server','compute'],['d-coord','Coordinator','network','compute'],
  ['m-dataset','Dataset','database','ai'],['m-label','Labeling','pencil','ai'],['m-notebook','Notebook','file-code-2','ai'],['m-feature','Feature store','table','ai'],['m-train','Training job','cpu','ai'],['m-registry','Model registry','package','ai'],['m-serve','Model serving','rocket','ai'],['m-drift','Drift monitor','activity','ai'],
  ['logo','Logo','image','ext']
];
var TECH=[
  ['ai','Claude','sparkles'],['ai','GPT','sparkles'],['ai','Gemini','sparkles'],['ai','Llama','sparkles'],['ai','Qwen','sparkles'],['ai','Mistral','sparkles'],['ai','DeepSeek','sparkles'],['ai','Ollama','cpu'],['ai','vLLM','cpu'],['ai','Hugging Face','brain-circuit'],
  ['agent','LangChain','link-2'],['agent','LangGraph','share-2'],['agent','LlamaIndex','library'],['agent','CrewAI','users-round'],['trigger','n8n','workflow'],['ai','OpenRouter','network'],['safe','LangSmith','radar'],['safe','Langfuse','radar'],
  ['rag','Pinecone','chart-scatter'],['rag','Qdrant','chart-scatter'],['rag','Weaviate','chart-scatter'],['rag','Chroma','chart-scatter'],
  ['data','PostgreSQL','database'],['data','MySQL','database'],['data','MongoDB','database-zap'],['data','Redis','memory-stick'],['data','Supabase','database'],['data','Firebase','flame'],['data','Elasticsearch','search'],['msg','Kafka','waves'],['msg','RabbitMQ','inbox'],['data','BigQuery','warehouse'],['data','Snowflake','warehouse'],['data','ClickHouse','warehouse'],['data','MinIO','archive'],
  ['compute','Node.js','server'],['compute','Express','server'],['compute','NestJS','server'],['compute','FastAPI','zap'],['compute','Django','server'],['compute','Flask','server'],['compute','Laravel','server'],['compute','Spring Boot','server'],['compute','Go','server'],['compute','.NET','server'],
  ['client','React','app-window'],['client','Next.js','app-window'],['client','Vue','app-window'],['client','Svelte','app-window'],['client','Angular','app-window'],['client','Flutter','smartphone'],['client','React Native','smartphone'],['client','Tailwind CSS','brush'],
  ['edge','AWS','cloud'],['edge','Google Cloud','cloud'],['edge','Azure','cloud'],['edge','Vercel','cloud'],['edge','Cloudflare','cloud'],['compute','Docker','container'],['compute','Kubernetes','ship-wheel'],['edge','Nginx','split'],['ops','Terraform','layers'],['ops','GitHub Actions','rocket'],['ops','GitHub','git-branch'],['ops','GitLab','git-branch'],
  ['ops','Grafana','chart-line'],['ops','Prometheus','activity'],['ops','Sentry','bug'],['ops','Datadog','activity'],['ops','OpenTelemetry','radar'],
  ['ext','Midtrans','credit-card'],['ext','Xendit','credit-card'],['ext','Stripe','credit-card'],['msg','Twilio','message-square'],['msg','SendGrid','mail'],['msg','Slack','message-circle'],['msg','WhatsApp API','message-circle'],['ext','Google Sheets','table-2'],['ext','Notion','book-open'],
  ['ai','PyTorch','brain-circuit'],['ai','TensorFlow','brain-circuit'],['ai','scikit-learn','brain-circuit'],['ai','OpenCV','eye'],['ai','YOLO','scan-eye'],['data','Pandas','table'],['data','NumPy','binary'],
  ['compute','Python','code-xml'],['compute','TypeScript','code-xml'],['compute','JavaScript','code-xml'],['compute','C','code-xml'],['compute','C++','code-xml'],['compute','Haskell','code-xml'],['compute','Java','code-xml'],['compute','Rust','code-xml'],['compute','Hono','zap'],['compute','Bun','zap'],
  ['client','TanStack Query','app-window'],['client','Framer Motion','app-window'],['client','Vite','app-window'],['data','Drizzle ORM','database'],['data','Prisma','database'],['data','SQLite','database'],
  ['ai','Cursor','square-terminal'],['ai','Groq','cpu'],['ai','Grok','sparkles'],['ai','Perplexity','search'],['ai','Gemma','sparkles'],['ai','Kimi','sparkles'],['ai','Vertex AI','sparkles'],['ai','Bedrock','sparkles'],['ai','Streamlit','app-window'],['ai','Gradio','app-window'],['trigger','Zapier','workflow'],['trigger','Make','workflow'],['ext','Airtable','table-2'],
  ['client','Astro','app-window'],['client','Remix','app-window'],['client','Expo','smartphone'],['compute','Kotlin','code-xml'],['compute','Swift','code-xml'],['compute','Dart','code-xml'],['compute','PHP','code-xml'],['compute','Ruby','code-xml'],['compute','Rails','server'],['compute','tRPC','share-2'],['compute','Zod','braces'],
  ['edge','Netlify','cloud'],['edge','Railway','cloud'],['edge','Render','cloud'],['edge','DigitalOcean','cloud'],['edge','Heroku','cloud'],['edge','Fly.io','cloud'],['data','Neon','database'],['data','Convex','database'],['sec','Clerk','key-round'],['sec','Auth0','key-round'],['msg','Resend','mail'],
  ['ops','Jira','list-todo'],['ops','Trello','layout-grid'],['ops','Linear','list-todo'],['ops','Ubuntu','terminal'],['ops','Bash','terminal'],['ops','VS Code','code-xml'],
  ['ops','Git','git-branch'],['ops','Linux','terminal'],['ops','Figma','pen-tool'],['ops','Postman','send'],['msg','Telegram','send'],['msg','Discord','message-circle'],['ext','Gmail','mail']
];
var TECH_ALIAS={'GPT':['openai','chatgpt'],'Claude':['anthropic'],'Next.js':['nextjs2'],'JavaScript':['js'],'Node.js':['nodejs2'],'Google Cloud':['gcloud'],'AWS':['amznwebserv'],'TanStack Query':['reactquery','tanstack','tanstack2'],'Drizzle ORM':['drizzle'],'Framer Motion':['motion'],'Vite':['vitejs','vite2'],'Vue':['vuejs'],'Svelte':['sveltejs'],'Bun':['bunjs'],'Express':['expressjs'],'.NET':['netcore'],'Elasticsearch':['elastic'],'Gemini':['aistudio'],'Kubernetes':['k8s'],'GitHub Actions':['githubactions'],'Fly.io':['flyio'],'Hugging Face':['hf'],'Tailwind CSS':['tailwind']};
function techKey(name){return 'x-'+String(name).toLowerCase().replace(/\+/g,'plus').replace(/#/g,'sharp').replace(/[^a-z0-9]+/g,'')}
MORE_COMPS.forEach(function(c){COMPS.push(c);T['c-'+c[0]]={f:'comp',n:c[1],icon:c[2],cat:c[3],kw:KW[c[0]]||''}});
TECH.forEach(function(x){var k=techKey(x[1]);T['c-'+k]={f:'comp',n:x[1],icon:x[2],cat:x[0],tech:1,kw:'tech stack '+x[1].toLowerCase()}});
[['namespace','Namespace','square-dashed','k8s',1],['k8snode','Node pool','server','k8s',0],['lan','LAN','ethernet-port','net',1],['dmz','DMZ','shield','sec',1]].forEach(function(z){ZONES.push(z);T['z-'+z[0]]={f:'zone',n:z[1],icon:z[2],cat:z[3],dash:z[4]}});

function reg(prefix,fam,list){list.forEach(function(k){var d={f:fam,k:k[0],n:k[1],sz:k[2]};if(k[3])for(var x in k[3])d[x]=k[3][x];T[prefix+k[0]]=d})}
reg('u-','uml',[
  ['actor','Actor',[44,74],{lab:'User'}],['usecase','Use case',[160,64],{lab:'Use case'}],
  ['act-initial','Initial node',[28,28],{fixed:1}],['act-final','Activity final',[30,30],{fixed:1}],['act-flowfinal','Flow final',[28,28],{fixed:1}],
  ['act-action','Action',[160,56],{lab:'Action'}],['act-decision','Decision / merge',[46,46]],['act-bar','Fork / join',[150,8]],
  ['act-send','Send signal',[150,52],{lab:'Send signal'}],['act-recv','Accept event',[150,52],{lab:'Event'}],
  ['seq-life','Lifeline',[140,440],{lab:'Object'}],['seq-actor','Actor lifeline',[100,440],{lab:'User'}],['seq-act','Activation bar',[14,90]],
  ['class','Class',[230,120],{lab:'ClassName',init:{attrs:'- id: int\n- name: String',ops:'+ save(): void'}}],
  ['interface','Interface',[230,96],{lab:'Repository',init:{stereo:'interface',attrs:'',ops:'+ findById(id): T'}}],
  ['enum','Enumeration',[190,110],{lab:'Status',init:{stereo:'enumeration',attrs:'ACTIVE\nINACTIVE',ops:''}}],
  ['state','State',[160,60],{lab:'State'}],['choice','Choice',[42,42]]
]);
reg('b-','box',[
  ['boundary','System boundary',[480,380],{lab:'System'}],['package','Package',[340,230],{lab:'package'}],
  ['frag','Fragment (alt / loop)',[420,170],{lab:'[condition]',init:{op:'alt'}}],['c4b','C4 boundary',[560,380],{lab:'Software system'}],
  ['frame','Frame',[520,340],{lab:'Frame'}],['phone','Phone frame',[360,740],{lab:''}],['browser','Browser frame',[1000,640],{lab:'example.com'}]
]);
reg('er-','er',[
  ['table','Table',[240,120],{lab:'table_name',init:{body:'PK id: int\nname: varchar(100)\ncreated_at: timestamp'}}],
  ['entity','Entity',[140,56],{lab:'Entity'}],['weak','Weak entity',[150,56],{lab:'WeakEntity'}],
  ['attr','Attribute',[120,48],{lab:'attribute'}],['key','Key attribute',[120,48],{lab:'id'}],['multi','Multivalued attr.',[130,52],{lab:'phone'}],['derived','Derived attr.',[120,48],{lab:'age'}],
  ['rel','Relationship',[136,76],{lab:'has'}],['idrel','Identifying rel.',[146,82],{lab:'contains'}]
]);
reg('dfd-','dfd',[
  ['ext','External entity',[150,64],{lab:'Customer'}],['proc','Process',[124,124],{lab:'Process order',init:{num:'1.0'}}],
  ['procgs','Process (Gane-Sarson)',[160,104],{lab:'Process order',init:{num:'1.0'}}],['store','Data store',[200,48],{lab:'Orders',init:{num:'D1'}}]
]);
reg('c4-','c4',[
  ['person','Person',[200,176],{lab:'Customer',init:{body:'A customer of the business.'}}],
  ['system','Software system',[250,150],{lab:'Software System',init:{body:'Main system the team builds.'}}],
  ['container','Container',[250,150],{lab:'Web App',init:{sub:'Next.js',body:'Delivers the UI to users.'}}],
  ['component','Component',[230,140],{lab:'Auth Controller',init:{sub:'FastAPI router',body:'Signs users in.'}}],
  ['db','Container: database',[230,160],{lab:'Database',init:{sub:'PostgreSQL',body:'Stores accounts and orders.'}}],
  ['ext','External system',[250,150],{lab:'Email System',init:{body:'Sends transactional email.'}}],
  ['extperson','External person',[200,176],{lab:'Partner',init:{body:'An external partner.'}}]
]);
reg('tr-','org',[['org','Position',[180,58],{lab:'Position'}]]);
reg('tr-','mind',[['mind','Topic',[150,40],{lab:'Topic'}]]);
reg('tr-','page',[['page','Page',[170,66],{lab:'Page'}]]);
reg('ux-','ux',[['screen','Screen',[190,132],{lab:'Screen'}]]);
reg('wf-','wf',[
  ['heading','Heading',[260,34],{lab:'Heading'}],['text','Paragraph',[260,64],{lab:''}],['button','Button',[150,44],{lab:'Button'}],
  ['input','Text field',[260,48],{lab:'Email'}],['search','Search bar',[260,44],{lab:'Search'}],['image','Image',[260,160],{lab:''}],
  ['card','Card',[260,210],{lab:'Card title'}],['list','List',[280,200],{lab:''}],['nav','Top bar',[360,56],{lab:'App name'}],
  ['tabbar','Tab bar',[360,64],{lab:''}],['checkbox','Checkbox',[190,26],{lab:'Remember me'}],['toggle','Toggle',[200,30],{lab:'Notifications'}],
  ['avatar','Avatar',[56,56],{lab:''}],['chip','Chip',[96,32],{lab:'Tag'}],['divider','Divider',[260,8],{lab:''}]
]);
T['k-cell']={f:'cell',n:'Block',sz:[260,170],lab:'Block'};
T['draw']={f:'draw',n:'Drawing',sz:[100,100]};
[['yellow','#fff1a8'],['pink','#ffd5e5'],['blue','#d8e9ff'],['green','#d8f5de'],['orange','#ffe1c4'],['purple','#e8deff']].forEach(function(c){T['nt-'+c[0]]={f:'note',k:'note',n:'Sticky '+c[0],fill:c[1],sz:[170,120],lab:'Note'}});
T['text-h']={f:'text',n:'Heading text',sz:[260,40],lab:'Heading',init:{fs:22,bold:1}};
RESIZABLE.uml=1;RESIZABLE.box=1;RESIZABLE.er=1;RESIZABLE.dfd=1;RESIZABLE.c4=1;RESIZABLE.org=1;RESIZABLE.mind=1;RESIZABLE.page=1;RESIZABLE.ux=1;RESIZABLE.wf=1;RESIZABLE.cell=1;RESIZABLE.draw=1;
CONTAINER.box=1;
FAM_LABEL.uml='UML';FAM_LABEL.box='Container';FAM_LABEL.er='ERD';FAM_LABEL.dfd='DFD';FAM_LABEL.c4='C4';FAM_LABEL.org='Org chart';FAM_LABEL.mind='Mind map';FAM_LABEL.page='Sitemap';FAM_LABEL.ux='User flow';FAM_LABEL.wf='Wireframe';FAM_LABEL.cell='Framework block';FAM_LABEL.draw='Drawing';
var TREEF={org:1,mind:1,page:1};
function resizable(n){var d=T[n.t];return !!(d&&RESIZABLE[d.f]&&!d.fixed)}
function isLife(n){return !!n&&(n.t==='u-seq-life'||n.t==='u-seq-actor')}

// edges
EDGE.c4rel={n:'Relationship (C4)',end:'arr',dash:'6 4',g:'System'};
EDGE.uassoc={n:'Association',g:'UML'};
EDGE.unav={n:'Directed association',end:'open',g:'UML'};
EDGE.uinh={n:'Generalization',end:'tri',g:'UML'};
EDGE.ureal={n:'Realization',end:'tri',dash:'6 4',g:'UML'};
EDGE.udep={n:'Dependency',end:'open',dash:'6 4',g:'UML'};
EDGE.uagg={n:'Aggregation',start:'diaO',g:'UML'};
EDGE.ucomp={n:'Composition',start:'diaF',g:'UML'};
EDGE.uinc={n:'Include',end:'open',dash:'6 4',lab:'«include»',g:'UML'};
EDGE.uext={n:'Extend',end:'open',dash:'6 4',lab:'«extend»',g:'UML'};
EDGE.uflow={n:'Control flow / transition',end:'open',g:'UML'};
EDGE.umsg={n:'Message (sync)',end:'arr',above:1,g:'UML'};
EDGE.uasync={n:'Message (async)',end:'open',above:1,g:'UML'};
EDGE.uret={n:'Return message',end:'open',dash:'6 4',above:1,g:'UML'};
EDGE.dflow={n:'Data flow',end:'arr',g:'DFD & ERD'};
EDGE.cf={n:'Relationship (crow’s foot)',cf:1,g:'DFD & ERD'};
['c4rel','unav','uflow','umsg','uasync','uret','dflow','udep','uinc','uext'].forEach(function(k){FLOWING[k]=1});
var CF_OPTS=[['only','Exactly one ( || )'],['one','One ( | )'],['zone','Zero or one ( o| )'],['omany','One or many ( |< )'],['zmany','Zero or many ( o< )'],['many','Many ( < )']];

// ================= workspaces & diagram types =================
var WS=[
  {id:'biz',n:'Bisnis & SI',icon:'briefcase'},
  {id:'se',n:'Software Eng.',icon:'code-xml'},
  {id:'sys',n:'System & Cloud',icon:'server'},
  {id:'ai',n:'AI & Automation',icon:'sparkles'},
  {id:'ux',n:'Produk & UX',icon:'layout-template'},
  {id:'wb',n:'Whiteboard',icon:'pen-line'}
];
var DT={
  bpmn:{ws:'biz',n:'BPMN',pal:['bpmn-ev','bpmn-act','bpmn-gw','bpmn-data','bpmn-cont','notes'],hint:'Proses bisnis dengan pool, lane, event, task dan gateway.'},
  vc:{ws:'biz',n:'Value Chain',fw:'vc',hint:'Porter: aktivitas pendukung di atas, aktivitas primer di bawah, margin di kanan.'},
  ff:{ws:'biz',n:'Five Forces',fw:'ff',hint:'Lima kekuatan Porter, tingkatnya, dan usulan SI untuk menghadapinya.'},
  wsf:{ws:'biz',n:'Work System (Alter)',fw:'wsf',hint:'Enam elemen di dalam segitiga, plus Context dan Infrastructure di dasarnya.'},
  org:{ws:'biz',n:'Struktur Organisasi',tree:'org',pal:['org','notes'],hint:'Tab = bawahan baru, Enter = rekan sejajar. Atau bangun dari outline berindentasi.'},
  dikw:{ws:'biz',n:'Piramida DIKW',fw:'dikw',hint:'Data = berapa; Informasi = apa yang paling; Pengetahuan = mengapa; Wisdom = bagaimana memperbaiki.'},
  wp:{ws:'biz',n:'Bisnis–SI–TI',fw:'wp',hint:'Ward & Peppard: Bisnis = ke mana & mengapa, SI = apa, TI = bagaimana.'},
  vmodel:{ws:'biz',n:'V-model / Level Req.',fw:'vmodel',hint:'Tiap level spesifikasi di kiri berpasangan dengan pengujian di kanan.'},
  gen:{ws:'biz',n:'Strategi Generik',fw:'gen',hint:'Porter: pilih satu kuadran (sorot) dan tulis alasannya.'},
  swot:{ws:'biz',n:'SWOT',fw:'swot',hint:'S & W dari dalam (bisa dikendalikan), O & T dari luar.'},
  bmc:{ws:'biz',n:'Business Model Canvas',fw:'bmc',hint:'Isi sisi pelanggan dulu (CS → VP → CH → CR → RS), lalu sisi internal.'},
  pestel:{ws:'biz',n:'PESTEL',fw:'pestel',hint:'Faktor makro eksternal: politik, ekonomi, sosial, teknologi, lingkungan, hukum.'},
  vpc:{ws:'biz',n:'Value Proposition Canvas',fw:'vpc',hint:'Cocokkan value map (kiri) dengan customer profile (kanan).'},
  mcf:{ws:'biz',n:'Matriks McFarlan',fw:'mcf',hint:'Portofolio aplikasi: Strategic, High potential, Key operational, Support.'},
  usecase:{ws:'se',n:'Use Case',pal:['uml-uc','notes'],hint:'Aktor di luar boundary, use case di dalam. Include dan extend antar use case.'},
  activity:{ws:'se',n:'Activity',pal:['uml-act','notes'],dir:'TB',hint:'Initial → action → decision → final. Fork/join untuk paralel.'},
  sequence:{ws:'se',n:'Sequence',pal:['uml-seq','notes'],hint:'Tarik dari garis putus-putus satu lifeline ke lifeline lain untuk membuat pesan.'},
  class:{ws:'se',n:'Class',pal:['uml-class','notes'],hint:'Klik dua kali bagian atribut atau method untuk mengeditnya langsung.'},
  state:{ws:'se',n:'State Machine',pal:['uml-state','notes'],hint:'State, transisi berlabel event [guard] / action.'},
  dfd:{ws:'se',n:'DFD',pal:['dfd','notes'],hint:'Level 0 (konteks) dan level 1. Setiap aliran data diberi nama.'},
  erd:{ws:'se',n:'ERD',pal:['erd-cf','erd-chen','notes'],hint:'Crow’s foot: tabel + kardinalitas. Chen: entitas, atribut, relasi.'},
  arch:{ws:'sys',n:'Architecture',pal:['client','edge','compute','data','msg','sec','ops','prod','ext','zones'],hint:'Komponen sistem, zona jaringan, dan aliran request/event.'},
  c4:{ws:'sys',n:'C4 Model',pal:['c4','c4-box'],hint:'Context → Container → Component. Setiap relasi diberi label dan teknologi.'},
  k8s:{ws:'sys',n:'Kubernetes',pal:['k8s','k8s-zones','data'],hint:'Ingress → Service → Deployment, plus ConfigMap, Secret, volume, HPA.'},
  network:{ws:'sys',n:'Network Topology',pal:['net','net-zones'],hint:'Perangkat jaringan, segmen LAN/DMZ, dan koneksi.'},
  dist:{ws:'sys',n:'Distributed Patterns',pal:['dist','data','msg','prod'],hint:'Replikasi, sharding, consensus (leader/follower), CQRS.'},
  n8n:{ws:'ai',n:'n8n Workflow',pal:['trigger','logic','agent','ai','tech-ai'],look:'tile',hint:'Trigger → node logika → aksi. Komponen jadi tile ala n8n dengan garis melengkung.'},
  agent:{ws:'ai',n:'LangGraph Agent',pal:['graph','agent','ai','mem','safe'],hint:'START → node → conditional route → END. Tambahkan state dan checkpointer.'},
  rag:{ws:'ai',n:'RAG Pipeline',pal:['rag','ai','mem','safe','trigger'],hint:'Ingestion (load → split → embed → store) dan query (retrieve → rerank → generate).'},
  multi:{ws:'ai',n:'Multi-agent',pal:['agent','graph','ai','mem','safe'],hint:'Supervisor atau tim agen, tools, memori, dan titik persetujuan manusia.'},
  mlpipe:{ws:'ai',n:'ML Pipeline',pal:['mlops','data','compute','ops'],hint:'Data → fitur → training → registry → serving → monitoring.'},
  userflow:{ws:'ux',n:'User Flow',pal:['ux-flow','notes'],hint:'Layar, aksi, dan keputusan pengguna dari awal sampai tujuan.'},
  wire:{ws:'ux',n:'Wireframe',pal:['wire','wire-frames','notes'],hint:'Wireframe low-fi: taruh elemen di dalam frame ponsel atau browser.'},
  journey:{ws:'ux',n:'Customer Journey',fw:'journey',hint:'Tahap perjalanan pelanggan × aksi, touchpoint, perasaan, masalah, peluang.'},
  sitemap:{ws:'ux',n:'Sitemap',tree:'page',pal:['sitemap','notes'],hint:'Tab = halaman anak, Enter = halaman sejajar. Atau bangun dari outline.'},
  persona:{ws:'ux',n:'Persona',fw:'persona',hint:'Satu pengguna representatif: profil, tujuan, masalah, motivasi.'},
  empathy:{ws:'ux',n:'Empathy Map',fw:'empathy',hint:'Says, thinks, does, feels, plus pains dan gains.'},
  board:{ws:'wb',n:'Whiteboard',pal:['wb-notes','wb-shapes','wb-misc'],hint:'Bebas: sticky note, shape, teks, pen (P), dan frame.'},
  mind:{ws:'wb',n:'Mind Map',tree:'mind',pal:['mind','wb-notes'],hint:'Tab = cabang baru, Enter = topik sejajar. Atau bangun dari outline.'}
};
Object.keys(DT).forEach(function(k){var d=DT[k];if(d.fw&&!d.pal)d.pal=['fw-blocks','notes'];if(d.fw)d.pal=d.pal||[]})
function dtOf(){return DT[S.dt]?S.dt:'arch'}
var FW_SIG={swot:'Strengths (S)',bmc:'Key Partners',vc:'Procurement',ff:'Threat of new entrants',wsf:'Business Process',dikw:'Wisdom',wp:'Strategi SI',gen:'Cost Leadership',pestel:'Political',vpc:'Pain relievers',mcf:'Key operational',journey:'Touchpoints',persona:'Goals',empathy:'Thinks'};
function inferDt(nodes){
  var has=function(f){return nodes.some(function(n){return (T[n.t]||{}).f===f})},cats=function(c){return nodes.some(function(n){var d=T[n.t];return d&&d.f==='comp'&&c.indexOf(d.cat)>=0})};
  var kind=function(k){return nodes.some(function(n){return n.t===k})};
  if(has('cell')){var labs={};nodes.forEach(function(n){if((T[n.t]||{}).f==='cell')labs[n.label]=1});for(var fk in FW_SIG)if(labs[FW_SIG[fk]])return fk;return 'board'}
  if(has('org'))return 'org';if(has('mind'))return 'mind';if(has('page'))return 'sitemap';
  if(kind('u-seq-life')||kind('u-seq-actor'))return 'sequence';
  if(kind('u-class')||kind('u-interface')||kind('u-enum'))return 'class';
  if(kind('u-usecase'))return 'usecase';
  if(kind('u-state'))return 'state';
  if(has('uml'))return 'activity';
  if(has('dfd'))return 'dfd';if(has('er'))return 'erd';if(has('c4'))return 'c4';
  if(has('wf')||kind('b-phone')||kind('b-browser'))return 'wire';
  if(has('ux'))return 'userflow';
  if(cats(['k8s']))return 'k8s';if(cats(['net']))return 'network';
  if(has('note')&&!has('comp')&&!has('shape'))return 'board';
  if(has('ev')||has('task')||has('pool'))return 'bpmn';
  if(has('shape')&&!has('comp'))return 'userflow';
  if(cats(['trigger','logic'])&&nodes.some(function(n){return n.look==='tile'}))return 'n8n';
  if(cats(['agent']))return 'agent';
  if(cats(['rag']))return 'rag';
  return 'arch';
}
var SEC={
  'bpmn-ev':{n:'Events',keys:['start','start-msg','start-timer','start-signal','inter','inter-msg','inter-msg-throw','inter-timer','inter-signal','inter-signal-throw','inter-error','end','end-msg','end-signal','end-error','end-term']},
  'bpmn-act':{n:'Activities',keys:['task','task-user','task-manual','task-service','task-send','task-receive','task-rule','task-script','subprocess','transaction','evsub','call']},
  'bpmn-gw':{n:'Gateways',keys:['gw-xor','gw-and','gw-or','gw-event','gw-complex']},
  'bpmn-data':{n:'Data',keys:['data-obj','data-in','data-out','data-store']},
  'bpmn-cont':{n:'Containers & artifacts',keys:['pool','pool-bb','group','annotation','text']},
  'notes':{n:'Notes & text',keys:['nt-yellow','nt-blue','nt-green','nt-pink','text','text-h','b-frame']},
  'fw-blocks':{n:'Blocks',keys:['k-cell','nt-yellow','nt-blue','nt-green','nt-pink','text','text-h']},
  'fw-biz':{n:'Insert framework',keys:['fw:swot','fw:bmc','fw:vc','fw:ff','fw:wsf','fw:dikw','fw:wp','fw:vmodel','fw:gen','fw:pestel','fw:vpc','fw:mcf']},
  'fw-ux':{n:'Insert framework',keys:['fw:journey','fw:persona','fw:empathy']},
  'org':{n:'Org chart',keys:['tr-org','text','text-h']},
  'uml-uc':{n:'Use case',keys:['u-actor','u-usecase','b-boundary','b-package']},
  'uml-act':{n:'Activity',keys:['u-act-initial','u-act-action','u-act-decision','u-act-bar','u-act-send','u-act-recv','u-act-final','u-act-flowfinal']},
  'uml-seq':{n:'Sequence',keys:['u-seq-actor','u-seq-life','u-seq-act','b-frag']},
  'uml-class':{n:'Class',keys:['u-class','u-interface','u-enum','b-package']},
  'uml-state':{n:'State machine',keys:['u-act-initial','u-state','u-choice','u-act-final']},
  'dfd':{n:'DFD',keys:['dfd-ext','dfd-proc','dfd-procgs','dfd-store']},
  'erd-cf':{n:'ERD · crow’s foot',keys:['er-table']},
  'erd-chen':{n:'ERD · Chen',keys:['er-entity','er-weak','er-attr','er-key','er-multi','er-derived','er-rel','er-idrel']},
  'zones':{n:'Zones & boundaries',keys:['z-region','z-vpc','z-az','z-subnet','z-cluster','z-boundary','z-onprem','z-env','z-tenant','z-zgroup'],cat:'edge'},
  'c4':{n:'C4 elements',keys:['c4-person','c4-system','c4-container','c4-component','c4-db','c4-ext','c4-extperson']},
  'c4-box':{n:'Boundaries',keys:['b-c4b','z-zgroup']},
  'k8s-zones':{n:'Cluster & namespaces',keys:['z-cluster','z-namespace','z-k8snode'],cat:'k8s'},
  'net-zones':{n:'Segments',keys:['z-lan','z-dmz','z-vpc','z-onprem'],cat:'net'},
  'dist':{n:'Cluster roles',keys:['c-d-leader','c-d-follower','c-d-coord','c-replica','c-shard','c-lb','c-stream'],cat:'compute'},
  'mlops':{n:'ML pipeline',keys:['c-m-dataset','c-m-label','c-m-notebook','c-m-feature','c-m-train','c-m-registry','c-m-serve','c-m-drift','c-pipeline','c-model'],cat:'ai'},
  'graph':{n:'Graph & containers',keys:['fc-lgstart','fc-lgend','z-team','z-subgraph','z-toolset','z-workflow','z-sandbox','z-env'],cat:'agent'},
  'ux-flow':{n:'User flow',keys:['ux-screen','fc-terminal','fc-decision','fc-process','fc-io']},
  'wire':{n:'Wireframe elements',keys:['wf-nav','wf-heading','wf-text','wf-button','wf-input','wf-search','wf-image','wf-card','wf-list','wf-chip','wf-checkbox','wf-toggle','wf-avatar','wf-divider','wf-tabbar']},
  'wire-frames':{n:'Frames',keys:['b-phone','b-browser','b-frame']},
  'sitemap':{n:'Sitemap',keys:['tr-page','text','text-h']},
  'wb-notes':{n:'Sticky notes & text',keys:['nt-yellow','nt-pink','nt-blue','nt-green','nt-orange','nt-purple','text','text-h']},
  'wb-shapes':{n:'Shapes',keys:['fc-process','fc-terminal','fc-decision','fc-ellipse','fc-io','fc-db','fc-doc','fc-prep','fc-connector']},
  'wb-misc':{n:'Frames',keys:['b-frame','z-zgroup']},
  'mind':{n:'Mind map',keys:['tr-mind','text','text-h']},
  'tech-ai':{n:'Tech stack · AI',keys:TECH.filter(function(x){return ['ai','agent','rag','safe','trigger'].indexOf(x[0])>=0}).map(function(x){return 'c-'+techKey(x[1])}),cat:'ai'},
  'tech-data':{n:'Tech stack · data',keys:TECH.filter(function(x){return x[0]==='data'||x[0]==='msg'}).map(function(x){return 'c-'+techKey(x[1])}),cat:'data'},
  'tech-app':{n:'Tech stack · backend & frontend',keys:TECH.filter(function(x){return x[0]==='compute'||x[0]==='client'}).map(function(x){return 'c-'+techKey(x[1])}),cat:'compute'},
  'tech-cloud':{n:'Tech stack · cloud & ops',keys:TECH.filter(function(x){return x[0]==='edge'||x[0]==='ops'||x[0]==='ext'}).map(function(x){return 'c-'+techKey(x[1])}),cat:'edge'}
};
['client','edge','compute','data','msg','sec','ops','prod','ext','trigger','logic','agent','ai','rag','mem','safe','k8s','net'].forEach(function(c){
  SEC[c]={n:CAT[c].n,keys:COMPS.filter(function(x){return x[3]===c&&!/^(k|n|d|m)-|^logo$/.test(x[0])||(x[3]===c&&(c==='k8s'||c==='net'))}).map(function(x){return 'c-'+x[0]}),cat:c};
});
SEC.ai.keys=SEC.ai.keys.filter(function(k){return k.indexOf('c-m-')!==0});
function wsSections(ws){
  var out=[];Object.keys(DT).forEach(function(k){if(DT[k].ws===ws)(DT[k].pal||[]).forEach(function(s){if(out.indexOf(s)<0)out.push(s)})});
  if(ws==='biz')out.push('fw-biz');if(ws==='ux')out.push('fw-ux');
  if(ws==='sys'||ws==='ai')['tech-ai','tech-data','tech-app','tech-cloud'].forEach(function(s){if(out.indexOf(s)<0)out.push(s)});
  return out;
}
