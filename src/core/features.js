// ================= templates =================
function tplBuild(nodes,edges,defType){
  var map={};S={nodes:[],edges:[],seq:1};
  nodes.forEach(function(d){
    var o=d[7]||{},tile=o.look==='tile',sz=size(d[1]);
    var n={id:nid(),t:d[1],x:d[2],y:d[3],w:d[4]||(tile?64:sz[0]),h:d[5]||(tile?64:sz[1]),label:d[6]!=null?d[6]:''};
    for(var k in o)n[k]=o[k];if(n.t==='pool')syncPool(n);S.nodes.push(n);map[d[0]]=n.id;
  });
  edges.forEach(function(d){
    var e={id:'e'+(S.seq++),from:map[d[0]],to:map[d[1]],type:d[2]||defType||'sync',label:d[3]||''};
    if(d[4])for(var k in d[4])e[k]=d[4][k];S.edges.push(e);
  });
}
var TPL_NAMES={web3:'Three-tier web app',short:'URL shortener',shop:'Event-driven commerce',login:'Login flow',pool2:'Pool with two lanes',collab:'Two-pool collaboration',o2c:'Order-to-cash',galon:'Water gallon order',agents:'Multi-agent supervisor',rag:'RAG chatbot',n8n:'Lead enrichment workflow',prodai:'AI product: MVP to production'};
var TPL={
  web3:function(){tplBuild([
    ['user','c-user',40,340,0,0,'Customer',{sub:'Web browser'}],['cdn','c-cdn',280,60,0,0,'CDN',{sub:'CloudFront'}],['s3','c-storage',530,60,0,0,'Object storage',{sub:'S3 · static assets'}],
    ['vpc','z-vpc',250,170,1000,420,'VPC · ap-southeast-3'],['lb','c-lb',280,340,0,0,'Load balancer',{sub:'HTTPS :443'}],['sub','z-subnet',500,200,730,370,'Private subnet'],
    ['web','c-service',530,340,0,0,'Web API',{sub:'Node.js · 3 replicas'}],['cache','c-cache',770,230,0,0,'Cache',{sub:'Redis'}],['db','c-sql',770,340,0,0,'Primary DB',{sub:'PostgreSQL'}],
    ['rep','c-replica',1010,340,0,0,'Read replica',{sub:'PostgreSQL'}],['q','c-queue',530,460,0,0,'Job queue',{sub:'SQS'}],['wk','c-worker',770,460,0,0,'Worker',{sub:'Emails + reports'}]
  ],[['user','cdn','sync','static files'],['cdn','s3','sync','origin'],['user','lb','sync','HTTPS'],['lb','web'],['web','cache','sync','get / set'],['web','db','sync','SQL'],['db','rep','async','replication'],['web','q','async','enqueue'],['q','wk','async','consume'],['wk','db']])},
  short:function(){tplBuild([
    ['client','c-users',40,200,0,0,'Clients',{sub:'Web + mobile'}],['gw','c-apigw',280,200,0,0,'API gateway',{sub:'Rate limit 100 rps'}],
    ['svc','c-service',520,120,0,0,'Write API',{sub:'POST /shorten'}],['rd','c-service',520,280,0,0,'Redirect API',{sub:'GET /:code'}],
    ['idg','c-function',760,40,0,0,'ID generator',{sub:'Base62 · Snowflake'}],['cache','c-cache',520,420,0,0,'Cache',{sub:'Redis · hot codes'}],
    ['kv','c-nosql',1000,200,0,0,'URL store',{sub:'DynamoDB'}],['st','c-stream',760,420,0,0,'Click stream',{sub:'Kafka'}],
    ['wk','c-worker',1000,420,0,0,'Analytics worker'],['wh','c-warehouse',1240,420,0,0,'Warehouse',{sub:'BigQuery'}]
  ],[['client','gw','sync','HTTPS'],['gw','svc'],['gw','rd'],['svc','idg','sync','next id'],['svc','kv','sync','put'],['rd','cache','sync','get'],['rd','kv','sync','on miss'],['rd','st','async','click event'],['st','wk','async'],['wk','wh','sync','batch load']])},
  shop:function(){tplBuild([
    ['web','c-web',40,240,0,0,'Storefront',{sub:'Next.js'}],['mob','c-mobile',40,360,0,0,'Mobile app',{sub:'Flutter'}],
    ['gw','c-apigw',280,300,0,0,'API gateway'],['auth','c-auth',280,140,0,0,'Auth',{sub:'OAuth 2.0 · JWT'}],
    ['k8s','z-cluster',500,100,760,500,'Kubernetes cluster'],
    ['order','c-service',540,300,0,0,'Order service'],['odb','c-sql',540,440,0,0,'Orders DB',{sub:'PostgreSQL'}],['bus','c-stream',780,300,0,0,'Event bus',{sub:'Kafka'}],
    ['pay','c-service',1060,160,0,0,'Payment service'],['inv','c-service',1060,300,0,0,'Inventory service'],['notif','c-service',1060,440,0,0,'Notification service'],
    ['pg','c-payment',1320,160,0,0,'Payment gateway',{sub:'Midtrans'}],['mail','c-email',1320,440,0,0,'Email',{sub:'SendGrid'}]
  ],[['web','gw','sync','HTTPS'],['mob','gw','sync','HTTPS'],['gw','auth','sync','verify token'],['gw','order','sync','POST /orders'],['order','odb','sync','SQL'],['order','bus','async','OrderPlaced'],['bus','pay','async'],['bus','inv','async'],['bus','notif','async'],['pay','pg','sync','charge'],['notif','mail','sync','send']])},
  login:function(){tplBuild([
    ['s','fc-terminal',300,20,140,52,'Start'],['in','fc-io',290,110,160,64,'Enter email + password'],['d','fc-decision',310,220,120,80,'Valid?'],
    ['ok','fc-process',300,350,140,64,'Create session'],['end','fc-terminal',300,460,140,52,'Open dashboard'],
    ['err','fc-process',520,230,150,60,'Show error'],['d2','fc-decision',535,340,120,80,'5 failed attempts?'],['lock','fc-process',525,480,140,60,'Lock account 15 min']
  ],[['s','in'],['in','d'],['d','ok','sync','yes'],['ok','end'],['d','err','sync','no'],['err','d2'],['d2','lock','sync','yes'],['d2','in','sync','no',{fromAnchor:{x:1,y:0.5},toAnchor:{x:1,y:0.5},mx:720}]])},
  pool2:function(){tplBuild([['p','pool',40,40,900,240,'Company name',{lanes:[{name:'Lane 1',h:120},{name:'Lane 2',h:120}]}]],[],'seq')},
  collab:function(){tplBuild([['c','pool',40,40,900,110,'Customer',{lanes:[]}],['p','pool',40,190,900,240,'Company name',{lanes:[{name:'Lane 1',h:120},{name:'Lane 2',h:120}]}]],[],'seq')},
  o2c:function(){tplBuild([
    ['s','start-msg',30,202,36,36,'Purchase order received'],['t1','task',100,190,120,60,'Check stock availability'],['g1','gw-xor',260,197,46,46,''],
    ['t2','task',340,100,120,60,'Confirm order'],['g2','gw-and',500,107,46,46,''],['t3','task',580,40,120,60,'Emit invoice'],['t4','task',580,160,120,60,'Ship goods'],
    ['g3','gw-and',740,107,46,46,''],['t5','task',820,100,120,60,'Archive order'],['e1','end',980,112,36,36,'Order fulfilled'],
    ['t6','task',340,300,120,60,'Reject order'],['e2','end',500,312,36,36,'Order rejected']
  ],[['s','t1'],['t1','g1'],['g1','t2','seq','in stock'],['g1','t6','seq','not in stock'],['t2','g2'],['g2','t3'],['g2','t4'],['t3','g3'],['t4','g3'],['g3','t5'],['t5','e1'],['t6','e2']],'seq')},
  galon:function(){tplBuild([
    ['pc','pool',20,20,1100,110,'Customer',{lanes:[]}],
    ['pp','pool',20,160,1100,410,'The True Aqua Distilled Water Company',{lanes:[{name:'Customer Service Assistant',h:170},{name:'Logistic Dept. Manager',h:120},{name:'Logistic Dept. Worker',h:120}]}],
    ['c1','start',90,57,36,36,'Need water'],['c2','task',160,45,120,60,'Place order'],['c3','end',330,57,36,36,'Order placed'],
    ['s2','start-msg',104,262,36,36,'Order received'],['t1','task',172,250,120,60,'Verify customer identity'],['g1','gw-xor',320,257,46,46,'Customer exists?'],
    ['t2','task',400,175,120,50,'Create customer account'],['g2','gw-xor',570,257,46,46,''],['ti','inter-timer',650,262,36,36,'Wednesday morning'],
    ['t3','task',730,250,120,60,'Forward order'],['t4','subprocess',730,360,120,60,'Arrange delivery'],['t5','task',900,480,120,60,'Deliver water'],['e1','end',1060,492,36,36,'Water delivered']
  ],[['c1','c2'],['c2','c3'],['c2','s2','msg'],['s2','t1'],['t1','g1'],['g1','t2','seq','No'],['g1','g2','seq','Yes'],['t2','g2'],['g2','ti'],['ti','t3'],['t3','t4'],['t4','t5'],['t5','e1']],'seq')},
  agents:function(){tplBuild([
    ['app','c-web',40,190,0,0,'Chat UI',{sub:'Next.js · streaming'}],['api','c-service',250,190,0,0,'Agent API',{sub:'LangGraph Server'}],
    ['trace','c-trace',40,550,0,0,'Tracing',{sub:'LangSmith'}],
    ['g','z-subgraph',440,40,980,640,'Supervisor graph · StateGraph'],
    ['start','fc-lgstart',708,90,104,40,'START'],['sup','c-a-super',676,190,0,0,'Supervisor',{sub:'LLM picks the next worker'}],
    ['hum','c-a-human',920,190,0,0,'Human review',{sub:'interrupt() to approve'}],['end','fc-lgend',1150,202,104,40,'END'],
    ['res','c-a-research',476,400,0,0,'Research agent',{sub:'ReAct · web search'}],['cod','c-a-coder',676,400,0,0,'Coding agent',{sub:'ReAct · sandbox'}],['wri','c-a-writer',876,400,0,0,'Writer agent',{sub:'Drafts the answer'}],
    ['web','c-a-browser',476,550,0,0,'Web search',{sub:'Tavily API'}],['sbx','c-a-sandbox',676,550,0,0,'Code sandbox',{sub:'E2B'}],['ret','c-retriever',876,550,0,0,'Docs retriever',{sub:'pgvector'}],
    ['state','c-state',1150,400,0,0,'Graph state',{sub:'messages · next · draft'}],['ck','c-checkpoint',1150,550,0,0,'Checkpointer',{sub:'PostgresSaver'}],
    ['pg','c-sql',1480,550,0,0,'Postgres',{sub:'threads & checkpoints'}]
  ],[['app','api','stream','SSE'],['api','start','sync','invoke(thread_id)'],['api','trace','async','spans'],['start','sup'],
    ['sup','res','route2','research'],['sup','cod','route2','code'],['sup','wri','route2','write'],['sup','hum','route','FINISH'],['hum','end','sync','approved'],
    ['hum','sup','route','revise',{fromAnchor:{x:0.5,y:0},toAnchor:{x:0.75,y:0},my:160}],
    ['res','web','tool','search()'],['cod','sbx','tool','run_code()'],['wri','ret','tool','retrieve()'],['state','ck','sync','every step'],['ck','pg','sync','SQL']])},
  rag:function(){tplBuild([
    ['ing','z-workflow',20,30,1130,140,'Ingestion · nightly'],
    ['sch','c-t-schedule',50,70,0,0,'Nightly sync',{sub:'cron 02:00'}],['docs','c-docs',270,70,0,0,'Source docs',{sub:'Drive · Notion · PDF'}],['load','c-loader',490,70,0,0,'Document loader',{sub:'Unstructured'}],
    ['split','c-splitter',710,70,0,0,'Text splitter',{sub:'800 tokens · 120 overlap'}],['emb','c-embed',930,70,0,0,'Embedding model',{sub:'text-embedding-3-small'}],
    ['vs','c-vector',1220,70,0,0,'Vector store',{sub:'pgvector · HNSW'}],
    ['qz','z-zgroup',20,250,1330,290,'Query path · per message'],
    ['user','c-t-chat',50,300,0,0,'User question',{sub:'Chat trigger'}],['guard','c-guard',270,300,0,0,'Input guardrails',{sub:'PII + jailbreak check'}],
    ['ret','c-retriever',490,300,0,0,'Retriever',{sub:'top-k = 20'}],['rr','c-rerank',710,300,0,0,'Reranker',{sub:'top 5'}],
    ['pr','c-prompt',930,300,0,0,'Prompt template',{sub:'system + context + question'}],['llm','c-chat',1150,300,0,0,'Chat model',{sub:'Claude Sonnet'}],
    ['tr','c-trace',270,440,0,0,'Tracing & evals',{sub:'LangSmith'}],['mem','c-stmem',710,440,0,0,'Chat history',{sub:'last 10 turns'}],
    ['resp','c-l-respond',930,440,0,0,'Stream answer',{sub:'SSE to client'}],['par','c-parser',1150,440,0,0,'Output parser',{sub:'answer + citations'}]
  ],[['sch','docs'],['docs','load'],['load','split'],['split','emb'],['emb','vs','sync','upsert'],
    ['user','guard'],['guard','ret'],['ret','vs','sync','similarity search',{fromAnchor:{x:0.5,y:0},toAnchor:{x:0.5,y:1},my:200}],['ret','rr'],['rr','pr','sync','top 5'],['pr','llm'],
    ['mem','pr','sync','history',{fromAnchor:{x:0.5,y:0},toAnchor:{x:0.25,y:1},my:402}],['llm','par'],['par','resp','stream','tokens'],['guard','tr','async','spans']])},
  n8n:function(){var T1={look:'tile'};tplBuild([
    ['wf','z-workflow',20,20,1260,460,'Lead enrichment · n8n workflow'],
    ['hook','c-t-webhook',60,150,0,0,'New lead',{look:'tile',sub:'POST /lead'}],['set','c-l-set',240,150,0,0,'Normalize fields',T1],['http','c-l-http',420,150,0,0,'Enrich company',{look:'tile',sub:'Clearbit API'}],
    ['agent','c-a-agent',560,150,168,64,'Score lead',{sub:'AI agent · tools'}],
    ['model','c-chat',568,300,0,0,'Chat model',{look:'tile',sub:'GPT-4o mini'}],['parser','c-parser',668,300,0,0,'Structured output',{look:'tile',sub:'{score, reason}'}],
    ['if','c-l-if',800,150,0,0,'Score ≥ 70?',T1],['slack','c-sms',980,60,0,0,'Notify sales',{look:'tile',sub:'Slack #sales'}],['crm','c-saas',1160,60,0,0,'Create deal',{look:'tile',sub:'HubSpot'}],
    ['sheet','c-table',980,260,0,0,'Nurture list',{look:'tile',sub:'Google Sheets'}],
    ['err','c-t-error',60,330,0,0,'On error',T1],['alert','c-email',240,330,0,0,'Alert ops',{look:'tile',sub:'Email'}]
  ],[['hook','set','sync','',{route:'curve'}],['set','http','sync','',{route:'curve'}],['http','agent','sync','',{route:'curve'}],['agent','if','sync','',{route:'curve'}],
    ['model','agent','assoc','',{toAnchor:{x:0.238,y:1}}],['parser','agent','assoc','',{toAnchor:{x:0.833,y:1}}],
    ['if','slack','route','true',{route:'curve'}],['if','sheet','route','false',{route:'curve'}],['slack','crm','sync','',{route:'curve'}],['err','alert','sync','',{route:'curve'}]])},
  prodai:function(){var C=[540,770,1000,1230,1460,1690];tplBuild([
    ['mvp','z-env',20,20,420,520,'MVP · ship in a week'],
    ['mweb','c-web',60,80,0,0,'Web app',{sub:'Next.js on Vercel'}],['mlog','c-logs',250,80,0,0,'Logs',{sub:'stdout · Sentry'}],
    ['mapi','c-service',60,200,0,0,'API',{sub:'FastAPI · 1 instance'}],['mllm','c-llm',60,320,0,0,'LLM API',{sub:'Claude / GPT'}],['mdb','c-sql',250,320,0,0,'Postgres',{sub:'+ pgvector'}],
    ['mnote','fc-note',60,420,358,90,'Validate first: one service, direct LLM calls, no queue. Move right when traffic, cost or risk grows.'],
    ['prod','z-env',500,20,1430,700,'Production · scale & safety'],
    ['users','c-users',C[0],80,0,0,'Users',{sub:'Web + mobile'}],['cdn','c-cdn',C[1],80,0,0,'CDN + WAF',{sub:'Cloudflare'}],['gw','c-apigw',C[2],80,0,0,'API gateway',{sub:'auth · rate limit · quotas'}],['idp','c-idp',C[3],80,0,0,'Identity',{sub:'OIDC · SSO'}],
    ['cache','c-pcache',C[1],220,0,0,'Semantic cache',{sub:'Redis'}],['api','c-service',C[2],220,0,0,'Chat API',{sub:'stateless · autoscaled'}],['q','c-queue',C[3],220,0,0,'Job queue',{sub:'long-running tasks'}],['wk','c-worker',C[4],220,0,0,'Workers',{sub:'retries with backoff'}],['dlq','c-dlq',C[5],220,0,0,'Dead-letter queue',{sub:'after 5 attempts'}],
    ['guard','c-guard',C[1],360,0,0,'Guardrails',{sub:'PII · jailbreak · policy'}],['orch','c-a-agent',C[2],360,0,0,'Agent orchestrator',{sub:'LangGraph'}],['llmgw','c-llmgw',C[3],360,0,0,'LLM gateway',{sub:'LiteLLM · fallbacks'}],
    ['p1','c-llm',C[4],300,0,0,'Claude',{sub:'primary'}],['p2','c-llm',C[4],420,0,0,'GPT-4o',{sub:'fallback'}],
    ['vdb','c-vector',C[1],500,0,0,'Vector DB',{sub:'Qdrant · replicated'}],['ret','c-retriever',C[2],500,0,0,'Retriever',{sub:'hybrid + rerank'}],
    ['tr','c-trace',C[0],620,0,0,'Tracing',{sub:'LangSmith · OTel'}],['ev','c-eval',C[1],620,0,0,'Eval suite',{sub:'golden set in CI'}],['mon','c-monitor',C[2],620,0,0,'Monitoring',{sub:'latency · cost · errors'}],['ff','c-flags',C[3],620,0,0,'Feature flags',{sub:'model & prompt rollout'}],['as','c-autoscale',C[4],620,0,0,'Autoscaler',{sub:'HPA on queue depth'}],
    ['pnote','fc-note',C[5],360,200,170,'Production adds: gateway + auth, caching, async workers with a DLQ, model fallback, guardrails, evals in CI, tracing and flags.']
  ],[['mweb','mapi','sync','HTTPS'],['mapi','mllm','sync','prompt'],['mapi','mdb','sync','SQL'],['mapi','mlog','async','logs'],
    ['users','cdn','sync','HTTPS'],['cdn','gw'],['gw','idp','sync','verify JWT'],['gw','api'],['api','cache','sync','lookup'],['api','q','async','enqueue'],['q','wk','async'],['wk','dlq','async','give up'],
    ['api','orch'],['orch','guard','sync','check'],['orch','llmgw','sync','complete'],['llmgw','p1'],['llmgw','p2','sync','on error'],['orch','ret','tool','search'],['ret','vdb','sync','kNN']])}
};
function openTemplate(key,silent){openExample(key,silent)}

// ================= auto layout =================
function layered(ids,edges,groupOf,dir,labelW){
  var N=ids.length,idx={};ids.forEach(function(id,i){idx[id]=i});
  var out=ids.map(function(){return[]}),indeg=new Array(N).fill(0);
  edges.forEach(function(e){var a=idx[e.from],b=idx[e.to];if(a==null||b==null||a===b)return;out[a].push(b);indeg[b]++});
  var order=[],i;for(i=0;i<N;i++)if(!indeg[i])order.push(i);for(i=0;i<N;i++)if(order.indexOf(i)<0)order.push(i);
  var state=new Array(N).fill(0),dag=[];
  function dfs(u){state[u]=1;out[u].forEach(function(v){if(state[v]===1)dag.push([v,u]);else{dag.push([u,v]);if(state[v]===0)dfs(v)}});state[u]=2}
  order.forEach(function(u){if(!state[u])dfs(u)});
  var succ=ids.map(function(){return[]}),pred=ids.map(function(){return[]});
  dag.forEach(function(p){if(succ[p[0]].indexOf(p[1])<0){succ[p[0]].push(p[1]);pred[p[1]].push(p[0])}});
  var ind=pred.map(function(p){return p.length}),q=[],layer=new Array(N).fill(0),topo=[];
  for(i=0;i<N;i++)if(!ind[i])q.push(i);
  while(q.length){var u=q.shift();topo.push(u);succ[u].forEach(function(v){layer[v]=Math.max(layer[v],layer[u]+1);if(--ind[v]===0)q.push(v)})}
  for(i=topo.length-1;i>=0;i--){var w=topo[i];if(!pred[w].length&&succ[w].length){layer[w]=Math.max(0,Math.min.apply(null,succ[w].map(function(v){return layer[v]}))-1)}}
  var used=[];layer.forEach(function(l){if(used.indexOf(l)<0)used.push(l)});used.sort(function(a,b){return a-b});
  var L=used.map(function(){return[]});layer.forEach(function(l,v){L[used.indexOf(l)].push(v)});
  var pos=new Array(N).fill(0);function gk(v){return groupOf&&groupOf[ids[v]]||''}
  L.forEach(function(l){l.sort(function(a,b){return gk(a)<gk(b)?-1:gk(a)>gk(b)?1:a-b});l.forEach(function(v,j){pos[v]=j})});
  function avg(a){var s=0;a.forEach(function(x){s+=x});return s/a.length}
  for(var it=0;it<8;it++){
    var down=it%2===0,seqL=down?L.slice(1):L.slice(0,-1).reverse();
    seqL.forEach(function(l){
      var bary={};l.forEach(function(v){var nb=down?pred[v]:succ[v];bary[v]=nb.length?avg(nb.map(function(x){return pos[x]})):pos[v]});
      var gb={};l.forEach(function(v){var g=gk(v);(gb[g]=gb[g]||[]).push(bary[v])});var gavg={};Object.keys(gb).forEach(function(g){gavg[g]=g?avg(gb[g]):null});
      l.sort(function(a,b){var ga=gk(a),gb2=gk(b),ka=ga?gavg[ga]:bary[a],kb=gb2?gavg[gb2]:bary[b];if(ka!==kb)return ka-kb;return bary[a]-bary[b]});
      l.forEach(function(v,j){pos[v]=j});
    });
  }
  /* transpose pass: swap neighbours (same group only) whenever that removes edge crossings the barycenter sweep left behind */
  var lid=new Array(N).fill(0);L.forEach(function(l,li){l.forEach(function(v){lid[v]=li})});
  function pairs(a){var o=[];if(a<0||a+1>=L.length)return o;L[a].forEach(function(u){succ[u].forEach(function(v){if(lid[v]===a+1)o.push([u,v])});pred[u].forEach(function(v){if(lid[v]===a+1)o.push([u,v])})});return o}
  function cross(a){var e=pairs(a),c=0;for(var x=0;x<e.length;x++)for(var y=x+1;y<e.length;y++)if((pos[e[x][0]]-pos[e[y][0]])*(pos[e[x][1]]-pos[e[y][1]])<0)c++;return c}
  for(var tp=0;tp<6;tp++){var better=false;
    L.forEach(function(l,li){for(var j=0;j+1<l.length;j++){var a=l[j],b=l[j+1];if(gk(a)!==gk(b))continue;
      var c0=cross(li-1)+cross(li);l[j]=b;l[j+1]=a;pos[a]=j+1;pos[b]=j;var c1=cross(li-1)+cross(li);
      if(c1<c0)better=true;else{l[j]=a;l[j+1]=b;pos[a]=j;pos[b]=j+1}}});
    if(!better)break}
  var TB=dir==='TB',nodes=ids.map(byId);
  var Wd=nodes.map(function(n){return TB?nodeBounds(n).h:n.w}),Hb=nodes.map(function(n){var b=nodeBounds(n);return TB?Math.max(n.w,b.w):b.h}),GX=TB?Math.max(72,Math.min(110,(labelW||0)*0.4+50)):Math.max(110,Math.min(230,(labelW||0)+60)),GY=TB?56:52,yc=new Array(N).fill(0);
  L.forEach(function(l){var tot=0;l.forEach(function(v){tot+=Hb[v]});tot+=GY*(l.length-1);var y=-tot/2;l.forEach(function(v){yc[v]=y+Hb[v]/2;y+=Hb[v]+GY})});
  for(var pass=0;pass<3;pass++)L.forEach(function(l,li){
    if(!li&&pass===0)return;
    var des=l.map(function(v){var nb=pred[v].concat(pass?succ[v]:[]);return nb.length?avg(nb.map(function(x){return yc[x]})):yc[v]});
    var ys=des.slice();for(var j=1;j<l.length;j++){var mn=ys[j-1]+Hb[l[j-1]]/2+GY+Hb[l[j]]/2;if(ys[j]<mn)ys[j]=mn}
    var dev=0;for(j=0;j<l.length;j++)dev+=ys[j]-des[j];dev/=l.length;
    l.forEach(function(v,j){yc[v]=ys[j]-dev});
  });
  var res={},x=0,minY=Infinity;
  L.forEach(function(l){var mw=0;l.forEach(function(v){mw=Math.max(mw,Wd[v])});l.forEach(function(v){
    if(TB){var left=yc[v]-nodes[v].w/2;res[ids[v]]={x:left,y:x+(mw-Wd[v])/2};minY=Math.min(minY,yc[v]-Hb[v]/2)}
    else{var top=yc[v]-Hb[v]/2;res[ids[v]]={x:x+(mw-Wd[v])/2,y:top};minY=Math.min(minY,top)}
  });x+=mw+GX});
  Object.keys(res).forEach(function(k){if(TB)res[k].x-=minY;else res[k].y-=minY});
  return res;
}
function zoneTree(){
  var zones=S.nodes.filter(function(n){return fam(n)==='zone'||fam(n)==='box'}),area=function(z){return z.w*z.h},member={},parent={};
  S.nodes.forEach(function(o){
    var best=null;zones.forEach(function(z){if(z!==o&&inside(o,z)&&o.w*o.h<area(z)&&(!best||area(z)<area(best)))best=z});
    if(best){if(fam(o)==='zone')parent[o.id]=best.id;else member[o.id]=best.id}
  });
  return{zones:zones,member:member,parent:parent};
}
function refitZones(zt,moved){
  zt.zones.slice().sort(function(a,b){return a.w*a.h-b.w*b.h}).forEach(function(z){
    var ms=S.nodes.filter(function(n){return zt.member[n.id]===z.id||zt.parent[n.id]===z.id});
    if(!ms.length||!ms.some(function(n){return moved[n.id]}))return;
    var b=bounds(ms,[]);z.x=snap(b.x-30);z.y=snap(b.y-52);z.w=snap(b.w+60);z.h=snap(b.h+82);moved[z.id]=1;
  });
}
function autoArrange(){
  if(S.nodes.some(function(n){return fam(n)==='pool'})){toast('Auto-arrange skips BPMN pools. Arrange lanes by hand.');return}
  if(S.nodes.some(function(n){return TREEF[fam(n)]})){
    pushUndo();computeTree();
    var roots=S.nodes.filter(function(n){return TREEF[fam(n)]&&!TREEP[n.id]});
    roots.forEach(function(r){subtree(r).forEach(function(n){mindSize(n,TREED[n.id]||0)});layoutTree(r)});
    renderAll();fitView();toast('Tree tidied. Ctrl+Z undoes it.');return;
  }
  if(S.nodes.some(isLife)){toast('Sequence diagrams keep their time order. Move lifelines by hand.');return}
  var target=selN.length>1?selN.map(byId).filter(Boolean):S.nodes;
  var flow=target.filter(function(n){var f=fam(n);return !isCont(n)&&f!=='group'&&f!=='note'&&f!=='text'&&f!=='ann'&&f!=='cell'&&f!=='draw'&&f!=='wf'});
  if(flow.length<2){toast('Select two or more shapes, or select nothing to arrange the whole diagram');return}
  pushUndo();
  var zt=zoneTree(),b0=bounds(flow,[]),ids=flow.map(function(n){return n.id}),inSet={};ids.forEach(function(id){inSet[id]=1});
  var es=S.edges.filter(function(e){return inSet[e.from]&&inSet[e.to]});
  var dir=DT[dtOf()].dir,lw=0;es.forEach(function(e){if(e.label)lw=Math.max(lw,Math.min(170,textW(e.label,11)))});
  var pos=layered(ids,es.map(function(e){return REV_LAY[e.type]?{from:e.to,to:e.from}:e}),zt.member,dir,lw),moved={};
  flow.forEach(function(n){var p=pos[n.id];n.x=snap(b0.x+p.x);n.y=snap(b0.y+p.y);moved[n.id]=1});
  es.forEach(function(e){e.mx=null;e.my=null;delete e.fromAnchor;delete e.toAnchor});
  refitZones(zt,moved);
  renderAll();fitView();toast('Arranged '+(dir==='TB'?'top to bottom':'left to right')+'. Ctrl+Z undoes it.');
}

// ================= checks =================
function showFindings(title,icon,html){
  var f=$('findings');f.hidden=false;$('findTitle').textContent=title;
  var old=$('findIc');var tmp=document.createElement('span');tmp.innerHTML=ic(icon);var nn=tmp.firstChild;nn.id='findIc';old.replaceWith(nn);
  $('findBody').innerHTML=html;
}
var findTargets=[];
function findItem(sev,label,text,detail,target){
  findTargets.push(target||null);
  var i=findTargets.length-1,tag=target?'button type="button" data-fi="'+i+'"':'div';
  return '<'+tag+' class="find"><span class="sev '+sev+'">'+label+'</span><b>'+esc(text)+'</b>'+(detail?'<p>'+esc(detail)+'</p>':'')+'</'+(target?'button':'div')+'>';
}
function runCheck(){
  commitEdit();
  var out=[],N=S.nodes,E=S.edges;
  function isSeq(e){return e.type==='seq'||e.type==='def'||e.type==='cond'}
  function nm(n){return '“'+String(n.label||T[n.t].n).replace(/\s+/g,' ')+'”'}
  var flowB=N.filter(function(n){return ['ev','task','gw'].indexOf(fam(n))>=0});
  if(flowB.length){
    var hasStart=N.some(function(n){return fam(n)==='ev'&&T[n.t].k==='start'}),hasEnd=N.some(function(n){return fam(n)==='ev'&&T[n.t].k==='end'});
    if(!hasStart)out.push(['err','The BPMN process has no start event.',null]);
    if(!hasEnd)out.push(['err','The BPMN process has no end event.',null]);
    E.forEach(function(e){
      var a=byId(e.from),b=byId(e.to);if(!a||!b||!BPMN_FAM[fam(a)]||!BPMN_FAM[fam(b)])return;var pa=poolOf(a),pb=poolOf(b);
      if(isSeq(e)&&pa!==pb)out.push(['err','Sequence flow '+nm(a)+' → '+nm(b)+' crosses a pool boundary. Use a message flow between pools.',{e:e.id}]);
      if(e.type==='msg'&&pa&&pa===pb&&fam(a)!=='pool'&&fam(b)!=='pool')out.push(['err','Message flow '+nm(a)+' → '+nm(b)+' stays inside one pool. Use a sequence flow there.',{e:e.id}]);
      if(isSeq(e)&&fam(a)==='ev'&&T[a.t].k==='end')out.push(['err','End event '+nm(a)+' cannot have an outgoing sequence flow.',{e:e.id}]);
      if(isSeq(e)&&fam(b)==='ev'&&T[b.t].k==='start')out.push(['err','Start event '+nm(b)+' cannot have an incoming sequence flow.',{e:e.id}]);
      if(isSeq(e)&&(fam(a)==='data'||fam(b)==='data'||fam(a)==='ann'||fam(b)==='ann'))out.push(['warn','Connect data and annotations with an association (dotted line), not a sequence flow.',{e:e.id}]);
    });
    N.forEach(function(n){
      var f=fam(n);if(['task','gw','ev'].indexOf(f)<0)return;
      var ins=E.filter(function(e){return e.to===n.id&&isSeq(e)}),outs=E.filter(function(e){return e.from===n.id&&isSeq(e)});
      if(f==='task'&&!String(n.label||'').trim())out.push(['warn','A task has no name. Use verb + object.',{n:[n.id]}]);
      if(f==='task'&&/^(handle|record|proses|process|kelola|manage)\b/i.test(String(n.label||'').trim()))out.push(['warn','Task '+nm(n)+' uses a vague verb. Pick a specific one.',{n:[n.id]}]);
      if(f==='task'&&(!ins.length||!outs.length)){var msgs=E.some(function(e){return(e.to===n.id||e.from===n.id)&&e.type==='msg'});if(!(msgs&&(ins.length||outs.length)))out.push(['warn','Task '+nm(n)+' has no '+(!ins.length?'incoming':'outgoing')+' sequence flow.',{n:[n.id]}])}
      if(f==='gw'&&(T[n.t].g==='xor'||T[n.t].g==='or')&&outs.length>=2&&outs.some(function(e){return !String(e.label||'').trim()}))out.push(['warn','Not every branch out of gateway '+nm(n)+' has a condition label.',{n:[n.id]}]);
      if(f==='gw'&&ins.length<=1&&outs.length<=1)out.push(['warn','Gateway '+nm(n)+' neither splits nor merges (one flow in, one out).',{n:[n.id]}]);
      if(f==='ev'&&T[n.t].k==='start'&&!outs.length)out.push(['warn','Start event '+nm(n)+' is not connected.',{n:[n.id]}]);
      if(f==='ev'&&T[n.t].k==='end'&&!ins.length)out.push(['warn','End event '+nm(n)+' is never reached.',{n:[n.id]}]);
    });
  }
  var comps=N.filter(function(n){return fam(n)==='comp'});
  function deg(n){return E.filter(function(e){return e.from===n.id||e.to===n.id}).length}
  function has(t){return comps.some(function(n){return n.t===t})}
  function hasCat(c){return comps.some(function(n){return T[n.t].cat===c})}
  comps.forEach(function(n){if(!deg(n)&&['ops','safe','prod','mem'].indexOf(T[n.t].cat)<0)out.push(['warn',nm(n)+' is not connected to anything.',{n:[n.id]}])});
  E.forEach(function(e){
    var a=byId(e.from),b=byId(e.to);if(!a||!b||fam(a)!=='comp'||fam(b)!=='comp')return;
    if(T[a.t].cat==='client'&&T[b.t].cat==='data')out.push(['warn','Client '+nm(a)+' talks straight to '+nm(b)+'. Put a service in between so you control auth, validation and caching.',{e:e.id}]);
  });
  comps.filter(function(n){return n.t==='c-sql'||n.t==='c-nosql'}).forEach(function(db){
    var users=E.filter(function(e){var a=byId(e.from);return e.to===db.id&&a&&fam(a)==='comp'&&['compute','agent'].indexOf(T[a.t].cat)>=0});
    if(users.length>=3)out.push(['info',nm(db)+' is shared by '+users.length+' services. Give it one owner, or document the coupling.',{n:[db.id]}]);
  });
  E.forEach(function(e){if(e.type!=='sync')return;var back=E.filter(function(f){return f!==e&&f.type==='sync'&&f.from===e.to&&f.to===e.from})[0];if(back&&e.id<back.id)out.push(['warn','Synchronous loop between '+nm(byId(e.from))+' and '+nm(byId(e.to))+'. Make one direction async to avoid cascading timeouts.',{e:e.id}])});
  var starts=N.filter(function(n){return n.t==='fc-lgstart'}),ends=N.filter(function(n){return n.t==='fc-lgend'});
  var agents=comps.filter(function(n){return T[n.t].cat==='agent'&&!TOOLS[n.t]&&n.t!=='c-a-human'});
  if(starts.length>1)out.push(['warn','The graph has '+starts.length+' START nodes. A graph has one entry point.',{n:starts.map(function(n){return n.id})}]);
  starts.forEach(function(s){
    if(E.some(function(e){return e.to===s.id}))out.push(['err','START cannot have incoming lines.',{n:[s.id]}]);
    if(!E.some(function(e){return e.from===s.id}))out.push(['warn','START is not connected to a node.',{n:[s.id]}]);
  });
  ends.forEach(function(x){
    if(E.some(function(e){return e.from===x.id&&e.type!=='assoc'}))out.push(['err','END cannot have outgoing lines.',{n:[x.id]}]);
    if(!E.some(function(e){return e.to===x.id}))out.push(['warn','END is never reached.',{n:[x.id]}]);
  });
  if(starts.length&&!ends.length)out.push(['warn','The graph has START but no END. Every run needs a path to END.',{n:starts.map(function(n){return n.id})}]);
  N.filter(function(n){return ROUTERS[n.t]}).forEach(function(n){var o=E.filter(function(e){return e.from===n.id&&e.type!=='tool'});if(o.length>=2&&o.some(function(e){return !String(e.label||'').trim()}))out.push(['warn','Label every branch out of '+nm(n)+' with its condition or route name.',{n:[n.id]}])});
  if(has('c-a-super')&&!has('c-a-human')&&!has('c-a-critic')&&!has('c-eval'))out.push(['info','Supervisor loops can run forever. Set a recursion limit and add a critic or a human check.',{n:comps.filter(function(n){return n.t==='c-a-super'}).map(function(n){return n.id})}]);
  var llms=comps.filter(function(n){return ['c-llm','c-chat','c-a-agent','c-a-super','c-a-chatbot'].indexOf(n.t)>=0});
  if(llms.length&&(hasCat('client')||hasCat('trigger'))&&!has('c-guard')&&!has('c-moderation'))out.push(['info','User input reaches a model with no guardrails or moderation step.',{n:llms.map(function(n){return n.id})}]);
  if((agents.length||llms.length)&&!has('c-trace'))out.push(['info','No tracing for the AI steps. Add tracing (LangSmith, Langfuse or OpenTelemetry) to debug runs and costs.',null]);
  if(comps.length>=6&&!hasCat('ops')&&!has('c-trace'))out.push(['info','No monitoring or logging component. Production systems need both.',null]);
  var unl=E.filter(function(e){var a=byId(e.from),b=byId(e.to);return a&&b&&fam(a)==='comp'&&fam(b)==='comp'&&!String(e.label||'').trim()&&e.type!=='assoc'});
  if(unl.length>=3)out.push(['info',unl.length+' connections between components have no label. Name the protocol or event (HTTPS, gRPC, OrderPlaced).',{e:unl[0].id}]);
  N.filter(function(n){return fam(n)==='zone'}).forEach(function(z){if(!contents(z).length)out.push(['info','Zone '+nm(z)+' is empty.',{n:[z.id]}])});
  typeChecks(out,nm);
  findTargets=[];
  var html;
  if(!N.length)html='<p class="fsum">The canvas is empty.</p>';
  else if(!out.length)html='<p class="fok">No common mistakes found.</p><p class="fsum">Still read it once yourself: labels, branch conditions and naming.</p>';
  else{
    var cnt={err:0,warn:0,info:0};out.forEach(function(o){cnt[o[0]]++});
    html='<p class="fsum">'+[cnt.err?cnt.err+' error'+(cnt.err>1?'s':''):'',cnt.warn?cnt.warn+' warning'+(cnt.warn>1?'s':''):'',cnt.info?cnt.info+' suggestion'+(cnt.info>1?'s':''):''].filter(Boolean).join(' · ')+'. Click one to select it.</p>';
    var order={err:0,warn:1,info:2};out.sort(function(a,b){return order[a[0]]-order[b[0]]});
    html+=out.map(function(o){return findItem(o[0],o[0]==='err'?'Error':o[0]==='warn'?'Check':'Tip',o[1],'',o[2])}).join('');
  }
  showFindings('Check · '+DT[dtOf()].n,'circle-check-big',html);
}
function revealTarget(t){
  if(!t)return;
  if(t.e){var e=eById(t.e);if(!e)return;setSel([],e.id);var pts=route(e);if(pts)revealBox(bounds([],[e]))}
  else if(t.n){var ids=t.n.filter(function(id){return byId(id)});if(!ids.length)return;setSel(ids);revealBox(bounds(ids.map(byId),[]))}
}
function revealBox(b){
  if(!b)return;var r=vr(),v={x:cam.x,y:cam.y,w:r.width/cam.z,h:r.height/cam.z};
  if(b.x>=v.x&&b.y>=v.y+40/cam.z&&b.x+b.w<=v.x+v.w&&b.y+b.h<=v.y+v.h)return;
  if(b.w>v.w*0.9||b.h>v.h*0.8){fitTo(b,cam.z);return}
  cam.x=b.x+b.w/2-v.w/2;cam.y=b.y+b.h/2-v.h/2;applyCam();renderOver();
}
$('findBody').addEventListener('click',function(ev){var b=ev.target.closest('[data-fi]');if(b)revealTarget(findTargets[+b.getAttribute('data-fi')])});
$('findClose').addEventListener('click',function(){$('findings').hidden=true;if(reviewCtl)reviewCtl.abort()});

// ================= storage =================
var DOC={id:null,title:'Untitled diagram',updatedAt:0,example:false};
var lastKey=null,saveT=null,changedSinceBoot=false;
var localStore={
  kind:'local',
  idx:function(){try{var o=JSON.parse(lsGet('rancang:lib')||'{}');return o&&typeof o==='object'?o:{}}catch(e){return{}}},
  list:function(){var idx=this.idx();return Promise.resolve(Object.keys(idx).map(function(id){return{id:id,title:idx[id].title,updatedAt:idx[id].updatedAt||0}}).sort(function(a,b){return b.updatedAt-a.updatedAt}))},
  load:function(id){var s=lsGet('rancang:doc:'+id);try{return Promise.resolve(s?JSON.parse(s):null)}catch(e){return Promise.resolve(null)}},
  save:function(id,doc){if(!lsSet('rancang:doc:'+id,JSON.stringify(doc)))return Promise.reject({code:'storage_full'});var idx=this.idx();idx[id]={title:doc.title,updatedAt:doc.updatedAt};lsSet('rancang:lib',JSON.stringify(idx));return Promise.resolve()},
  remove:function(id){lsDel('rancang:doc:'+id);var idx=this.idx();delete idx[id];lsSet('rancang:lib',JSON.stringify(idx));return Promise.resolve()}
};
var store=localStore;
function cloudStore(db,uid){
  var col=db.doc('data/users/'+uid+'/lib').collection('diagrams');
  return{
    kind:'cloud',
    list:function(){return col.orderBy('updatedAt','desc').limit(200).get().then(function(snap){return snap.docs.map(function(d){var x=d.data()||{};return{id:d.id,title:x.title||'Untitled diagram',updatedAt:x.updatedAt||0,count:Array.isArray(x.nodes)?x.nodes.length:0}})})},
    load:function(id){return col.doc(id).get().then(function(d){return d.exists?d.data():null})},
    save:function(id,doc){return col.doc(id).set(doc)},
    remove:function(id){return col.doc(id).delete()}
  };
}
function setSave(state,text){var el=$('saveState');el.setAttribute('data-s',state);el.textContent=text}
function contentKey(){return JSON.stringify(S)+'|'+DOC.title}
function payload(){return JSON.parse(JSON.stringify({title:DOC.title||'Untitled diagram',updatedAt:DOC.updatedAt,v:3,dt:dtOf(),style:S.style||'clean',nodes:S.nodes,edges:S.edges,seq:S.seq}))}
function writeWorking(){lsSet('rancang:current',JSON.stringify({id:DOC.id,title:DOC.title,updatedAt:DOC.updatedAt,example:DOC.example,S:S}))}
function scheduleSave(){clearTimeout(saveT);saveT=setTimeout(function(){saveNow(false)},800)}
function saveNow(force){
  clearTimeout(saveT);
  var key=contentKey();
  if(key===lastKey&&!(force&&DOC.id))return;
  if(DOC.example&&key===lastKey)return;
  if(!DOC.id&&!S.nodes.length&&!S.edges.length){lastKey=key;writeWorking();return}
  changedSinceBoot=true;
  if(!DOC.id)DOC.id=newId();
  DOC.example=false;DOC.updatedAt=Date.now();lastKey=key;writeWorking();
  var p=payload(),size=JSON.stringify(p).length,st=store;
  if(st.kind==='cloud'&&size>250000){setSave('error','Too big for account storage. Export a .json file.');return}
  setSave('saving','Saving…');
  st.save(DOC.id,p).then(function(){if(contentKey()===key)setSave('ok',st.kind==='cloud'?'Saved to your account':'Saved in this browser')},function(err){
    lastKey=null;
    setSave('error',st.kind==='cloud'?'Not saved to your account ('+(err&&err.code||'error')+'). Kept in this browser.':'This browser blocked saving. Export a .json file.');
  });
}
var SAFE_ID=/^[A-Za-z0-9_.:-]{1,64}$/,SC_KEYS=['fill','stroke','textColor','headerFill','laneFill','tone','accent'];
function scrubColors(o){SC_KEYS.forEach(function(k){if(o[k]!=null&&!validColor(o[k]))delete o[k]});if(Array.isArray(o.lanes))o.lanes.forEach(function(l){if(l&&l.fill!=null&&!validColor(l.fill))delete l.fill})}
// strips anything executable from rendered markup: event handlers, script-like elements, non-local links
function scrubDom(root){
  var BAD={SCRIPT:1,FOREIGNOBJECT:1,IFRAME:1,OBJECT:1,EMBED:1},list=root.querySelectorAll('*'),kill=[];
  for(var i=0;i<list.length;i++){var el=list[i];
    if(BAD[el.tagName.toUpperCase()]){kill.push(el);continue}
    var at=el.attributes;for(var j=at.length-1;j>=0;j--){var nm=at[j].name,v=at[j].value;
      if(/^on/i.test(nm))el.removeAttribute(nm);
      else if(/^(xlink:)?href$/i.test(nm)&&!/^(#|data:image\/)/i.test(v.trim()))el.removeAttribute(nm)}}
  kill.forEach(function(e){if(e.parentNode)e.parentNode.removeChild(e)});
}
function sanitize(d){
  var nodes=(Array.isArray(d.nodes)?d.nodes:[]).filter(function(n){return n&&typeof n==='object'}).map(function(n){
    n=clone(n);if(!T[n.t])n.t=n.t&&String(n.t).indexOf('c-')===0?'c-service':'fc-process';
    ['x','y','w','h'].forEach(function(k){n[k]=+n[k];if(!isFinite(n[k]))n[k]=k==='w'||k==='h'?60:0});
    if(n.w<10)n.w=10;if(n.h<10)n.h=10;if(n.label==null)n.label='';n.label=String(n.label);n.id=String(n.id);
    if(n.lanes&&!Array.isArray(n.lanes))delete n.lanes;return n;
  });
  var ids={},remap={},uid=0;
  nodes.forEach(function(n){var o=n.id;if(!SAFE_ID.test(o)||ids[o]){var f;do{f='n_'+Date.now().toString(36)+(uid++)}while(ids[f]);remap[o]=remap[o]||f;n.id=f}ids[n.id]=1;scrubColors(n);
    ['grp','parent','host'].forEach(function(k){if(n[k]!=null)n[k]=String(n[k])})});
  nodes.forEach(function(n){['grp','parent','host'].forEach(function(k){if(n[k]!=null&&remap[n[k]])n[k]=remap[n[k]]})});
  var edges=(Array.isArray(d.edges)?d.edges:[]).filter(function(e){return e&&typeof e==='object'}).map(function(e){
    e=clone(e);if(!EDGE[e.type])e.type='line';if(e.route==='ortho')delete e.route;e.id=String(e.id);if(!SAFE_ID.test(e.id))e.id='e_'+Date.now().toString(36)+(uid++);scrubColors(e);if(e.from!=null)e.from=String(remap[e.from]||e.from);if(e.to!=null)e.to=String(remap[e.to]||e.to);if(e.from&&!ids[e.from])e.from=null;if(e.to&&!ids[e.to])e.to=null;if(e.label==null)e.label='';return e;
  }).filter(function(e){return(e.from||e.start)&&(e.to||e.end)});
  var mx=0;nodes.concat(edges).forEach(function(o){var m=/^[ne](\d+)$/.exec(o.id);if(m)mx=Math.max(mx,+m[1])});
  return{nodes:nodes,edges:edges,seq:Math.max(+d.seq||1,mx+1),style:d.style==='sketch'?'sketch':undefined,dt:DT[d.dt]?d.dt:inferDt(nodes)};
}
function loadDoc(d,id,opts){
  commitEdit();
  if(d&&d.icons)registerIcons(d.icons,false);
  var s=sanitize(d);S={nodes:s.nodes,edges:s.edges,seq:s.seq,dt:s.dt};if(s.style)S.style=s.style;
  DOC={id:id||null,title:String(d.title||'Untitled diagram').slice(0,120),updatedAt:+d.updatedAt||0,example:!!(opts&&opts.example)};
  undo=[];redo=[];selN=[];selE=null;iconOpen=false;
  $('docTitle').value=DOC.title;applyStyle();
  lastKey=contentKey();
  uiWs=DT[S.dt].ws;closeDtPop();syncDomain();
  renderAll();scrubDom(content);syncUndoBtns();fitView();writeWorking();
  if(DOC.example)setSave('idle','Example · your edits save automatically');
  else if(DOC.id)setSave('ok',store.kind==='cloud'?'Saved to your account':'Saved in this browser');
  else setSave('idle','Not saved yet');
}
function newDiagram(){startNew(dtOf());closeModal();toast('New '+DT[dtOf()].n+' diagram. Your previous one is in Diagrams.')}
function openDiagram(id){
  saveNow();
  return store.load(id).then(function(d){if(!d){toast('That diagram could not be opened');return}loadDoc(d,id);closeModal();toast('Opened “'+DOC.title+'”')},function(){toast('Could not open that diagram. Try again.')});
}
function relTime(t){
  if(!t)return '';var s=Math.round((Date.now()-t)/1000);
  if(s<60)return 'just now';if(s<3600)return Math.round(s/60)+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';
  var d=new Date(t);return d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:d.getFullYear()!==new Date().getFullYear()?'numeric':undefined});
}
var libConfirm=null;
function renderLib(){
  saveNow();
  $('libWhere').textContent=store.kind==='cloud'?'Saved privately to your Claude account. Only you can see this list, on any device.':'Saved in this browser only. Export a .json file to move a diagram to another device.';
  var ul=$('libList');ul.innerHTML='<li class="where">Loading…</li>';
  store.list().then(function(list){
    if(!list.length){ul.innerHTML='<li class="where">No saved diagrams yet. Anything you draw is saved here automatically.</li>';return}
    ul.innerHTML=list.map(function(x){
      var cur=x.id===DOC.id;
      return '<li class="lib-item'+(cur?' cur':'')+'"><button type="button" class="open" data-open="'+esc(x.id)+'"><span class="t">'+esc(x.title||'Untitled diagram')+'</span><span class="d">'+(cur?'Open now · ':'')+esc(relTime(x.updatedAt))+(x.count?' · '+x.count+' shapes':'')+'</span></button>'+
        (libConfirm===x.id?'<span class="confirm">Delete for good? <button type="button" class="sbtn del" data-delok="'+esc(x.id)+'">Delete</button><button type="button" class="sbtn" data-delno="1">Keep</button></span>':'<button type="button" class="ibtn" data-del="'+esc(x.id)+'" aria-label="Delete '+esc(x.title)+'">'+ic('trash-2')+'</button>')+'</li>';
    }).join('');
  },function(){ul.innerHTML='<li class="where">Could not load your diagrams. Check your connection and try again.</li>'});
}
$('libList').addEventListener('click',function(ev){
  var o=ev.target.closest('[data-open]');if(o){openDiagram(o.getAttribute('data-open'));return}
  var d=ev.target.closest('[data-del]');if(d){libConfirm=d.getAttribute('data-del');renderLib();return}
  if(ev.target.closest('[data-delno]')){libConfirm=null;renderLib();return}
  var ok=ev.target.closest('[data-delok]');
  if(ok){var id=ok.getAttribute('data-delok');libConfirm=null;store.remove(id).then(function(){if(id===DOC.id){DOC.id=null;DOC.example=false;lastKey=contentKey();setSave('idle','Deleted · not saved');writeWorking()}toast('Diagram deleted');renderLib()},function(){toast('Could not delete it. Try again.')})}
});

// ================= export & files =================
var downloadsCap=null,expBg='light',expScale=2;
function slug(s){return String(s||'diagram').toLowerCase().replace(/\(example\)/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'diagram'}
function exportSvgString(){
  var nodes=S.nodes,edges=S.edges;
  if($('expSel').checked&&selN.length){var ms=moveSet(selN).set;nodes=S.nodes.filter(function(n){return ms[n.id]});edges=S.edges.filter(function(e){return e.from&&e.to&&ms[e.from]&&ms[e.to]})}
  if(!nodes.length&&!edges.length)return null;
  var prev=TH;TH=expBg==='dark'?THEMES.dark:THEMES.light;exporting=true;mUsed={};
  var body=drawAll(nodes,edges),defs=markerDefs(),paper=TH.paper,bb=null;
  measureG.innerHTML=body;try{bb=measureG.getBBox()}catch(e){}measureG.innerHTML='';
  TH=prev;exporting=false;mUsed={};render();
  if(!bb||!bb.width){var b=bounds(nodes,edges);bb={x:b.x,y:b.y,width:b.w,height:b.h}}
  var pad=28,x=Math.floor(bb.x-pad),y=Math.floor(bb.y-pad),w=Math.ceil(bb.width+pad*2),h=Math.ceil(bb.height+pad*2),sk=S.style==='sketch';
  body=body.replace(/ data-(id|eid|lane|halo)="[^"]*"/g,'');
  var str='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="'+x+' '+y+' '+w+' '+h+'" font-family="'+esc(FONT)+'">'+
    (sk?'<style>@font-face{font-family:Virgil;src:url('+SKETCH_FONT_URI+') format("woff2")}</style>':'')+(usesExcali()?'<style>'+EXCALI_FONT_CSS+'</style>':'')+
    '<defs>'+defs+(sk?'<filter id="sketchF" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="nz"/><feDisplacementMap in="SourceGraphic" in2="nz" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>':'')+'</defs>'+
    (expBg==='none'?'':'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+paper+'"/>')+
    '<g'+(sk?' filter="url(#sketchF)"':'')+'>'+body+'</g></svg>';
  return{str:str,w:w,h:h,paper:paper};
}
function toPngBlob(cb){
  var o=exportSvgString();if(!o){toast('Nothing to export yet');cb(null);return}
  var sc=Math.max(0.5,Math.min(expScale,16000/o.w,16000/o.h)),img=new Image();
  img.onload=function(){
    var c=document.createElement('canvas');c.width=Math.max(1,Math.round(o.w*sc));c.height=Math.max(1,Math.round(o.h*sc));
    var g=c.getContext('2d');if(expBg!=='none'){g.fillStyle=o.paper;g.fillRect(0,0,c.width,c.height)}
    g.scale(sc,sc);g.drawImage(img,0,0);c.toBlob(function(b){cb(b)},'image/png');
  };
  img.onerror=function(){toast('Could not render the PNG');cb(null)};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(o.str);
}
function offerFile(name,data){
  if(downloadsCap){
    return downloadsCap.save({filename:name,data:data}).then(function(r){if(r&&r.status==='saved')toast('Saved '+name)},function(e){
      var c=e&&e.code;if(c==='declined')return;if(c==='rate_limited'){toast('A save prompt is already open');return}
      toast('Could not save the file ('+(c||'error')+')');
    });
  }
  if(window.claude&&typeof window.claude.use==='function'){toast('File downloads are not available in this view. Try Copy as image.');return}
  var blob=data instanceof Blob?data:new Blob([data]),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1500);
}
function doExport(kind){
  commitEdit();var base=slug(DOC.title);
  if(kind==='png')toPngBlob(function(b){if(b)offerFile(base+'.png',b)});
  else if(kind==='svg'){var o=exportSvgString();if(!o){toast('Nothing to export yet');return}offerFile(base+'.svg',new Blob([o.str],{type:'image/svg+xml'}))}
  else if(kind==='json'){var pj=Object.assign({app:'pda'},payload()),ui=usedIcons();if(Object.keys(ui).length)pj.icons=ui;offerFile(base+'.json',new Blob([JSON.stringify(pj,null,1)],{type:'application/json'}))}
  else if(kind==='copy'){
    if(!(navigator.clipboard&&window.ClipboardItem)){toast('This browser blocks copying images here. Use PNG export.');return}
    try{navigator.clipboard.write([new ClipboardItem({'image/png':new Promise(function(res,rej){toPngBlob(function(b){b?res(b):rej(new Error('empty'))})})})]).then(function(){toast('Image copied. Paste it into your doc.')},function(){toast('This browser blocks copying images here. Use PNG export.')})}
    catch(e){toast('This browser blocks copying images here. Use PNG export.')}
  }
  else if(kind==='open')$('fileOpen').click();
}
var IMPORT_MAX=25*1024*1024; // a real project is far smaller; this stops a huge file from freezing the tab
function importFile(file){
  if(!file)return;if(file.size>IMPORT_MAX){toast('File terlalu besar (maks 25 MB).');return}var rd=new FileReader();
  rd.onload=function(){
    try{
      var d=JSON.parse(rd.result);if(!d||(!(d.pages&&typeof d.pages==="object")&&(!Array.isArray(d.nodes)||!Array.isArray(d.edges))))throw 0;
      saveNow();
      d.title=d.title||String(file.name||'Imported diagram').replace(/\.json$/i,'');
      if(d.icons)registerIcons(d.icons,true);
      loadDoc(d,null);lastKey=null;saveNow(true);closeModal();toast('Opened '+file.name);
    }catch(e){toast('That file is not a diagram this app can read')}
  };
  rd.readAsText(file);
}
$('fileOpen').addEventListener('change',function(){importFile(this.files[0]);this.value=''});
stage.addEventListener('dragover',function(ev){var ty=[].slice.call(ev.dataTransfer.types||[]);if(ty.indexOf('text/rancang')>=0||ty.indexOf('Files')>=0){ev.preventDefault();ev.dataTransfer.dropEffect='copy'}});
stage.addEventListener('drop',function(ev){
  var t=ev.dataTransfer.getData('text/rancang');
  if(t){ev.preventDefault();var p=pt(ev);addFromPalette(t,p.x,p.y,false);return}
  var fl=ev.dataTransfer.files,f=fl&&fl[0];if(!f)return;
  if(/json/i.test(f.type+f.name)){ev.preventDefault();importFile(f);return}
  if(isImageFile(f)){ev.preventDefault();uploadIcons(fl,pt(ev))}
});

// ================= modals =================
var MODALS=['mLib','mGen','mKeys','mOutline','mIcons','mLlm'],lastFocus=null;
function openModal(id){
  closeMenus();lastFocus=document.activeElement;$('scrim').hidden=false;
  MODALS.forEach(function(m){$(m).hidden=m!==id});
  if(id==='mLib'){libConfirm=null;renderLib()}
  if(id==='mKeys')renderKeys();
  if(id==='mGen')prepGen();
  if(id==='mIcons')renderIcons();
  if(id==='mOutline')prepOutline();
  setTimeout(function(){var el=$(id).querySelector(id==='mGen'||id==='mOutline'?'textarea':'button[data-close]');if(el)el.focus()},0);
}
function closeModal(){
  if($('scrim').hidden)return;
  $('scrim').hidden=true;MODALS.forEach(function(m){$(m).hidden=true});
  if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}
}
$('scrim').addEventListener('click',function(ev){if(ev.target===$('scrim')||ev.target.closest('[data-close]'))closeModal()});
function renderKeys(){
  var K=[['Ctrl+K','Cari & lompat ke halaman, aksi, elemen'],['Alt+1…7','Pindah bagian (Bisnis, Manajemen, Software, …)'],['Alt+← / →','Halaman sebelumnya / berikutnya di proyek'],['Alt+L','Garis terpilih: fokus ke toolbar garis'],['Alt+Shift+← / →','Garis terpilih: geser label sepanjang garis'],['Alt+S · Alt+K · Alt+C','Garis terpilih: lurus · siku · lengkung'],['Alt+B','Garis terpilih: hapus tekukan manual'],['V','Select'],['H · Space+drag','Pan'],['C','Connect mode'],['P','Pen (draw freehand)'],['Tab','Tree: add a child'],['Enter','Tree: add a sibling · other shapes: edit text'],['Ctrl+Enter','Save a multi-line field (points, attributes)'],['Alt+drag','Move one block of a framework or one tree node'],['Double-click','Add a shape · edit text'],['Enter · F2','Edit selected text'],['Del','Delete'],['Ctrl+Z · Ctrl+Y','Undo · redo'],['Ctrl+C · Ctrl+V · Ctrl+X','Copy · paste · cut'],['Ctrl+D','Duplicate'],['Ctrl+A','Select all'],['Shift+drag','Add to selection'],['Arrows · Shift+arrows','Nudge 10px · 1px'],['Ctrl+] · Ctrl+[','Bring to front · send to back'],['Ctrl+scroll · + · −','Zoom'],['Ctrl+0','Zoom to 100%'],['Shift+1 · Shift+2','Fit all · fit selection'],['/','Search shapes'],['Esc','Cancel and clear selection']];
  $('keysList').innerHTML=K.map(function(k){return '<span>'+k[0].split(' · ').map(function(x){return '<kbd>'+esc(x)+'</kbd>'}).join(' ')+'</span><span>'+esc(k[1])+'</span>'}).join('');
}

// ================= theme =================
function resolvedTheme(){var a=document.documentElement.getAttribute('data-theme');if(a==='dark'||a==='light')return a;return window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
function applyTheme(force){
  var t=resolvedTheme();if(!force&&TH.name===t)return;TH=THEMES[t];
  $('dotSm').setAttribute('fill',TH.dot);$('dotLg').setAttribute('fill',TH.dotLg);
  buildPalette();render();renderInsp();applyCam();
}
if(window.matchMedia){var mq=matchMedia('(prefers-color-scheme: dark)');if(mq.addEventListener)mq.addEventListener('change',function(){applyTheme()});else if(mq.addListener)mq.addListener(function(){applyTheme()})}
new MutationObserver(function(){applyTheme()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

// ================= wiring =================
function bindUI(){
  document.querySelectorAll('[data-tool]').forEach(function(b){b.addEventListener('click',function(){setTool(b.getAttribute('data-tool'))})});
  $('tLine').onclick=function(){addFreeLine(false)};$('tArrow').onclick=function(){addFreeLine(true)};
  $('tAuto').onclick=function(){autoConn=!autoConn;this.classList.toggle('on',autoConn);toast(autoConn?'Auto-connect on':'Auto-connect off')};
  $('tGrid').onclick=toggleGrid;$('tFlow').onclick=toggleAnim;$('tSketch').onclick=toggleSketch;
  $('tUndo').onclick=doUndo;$('tRedo').onclick=doRedo;$('tLayout').onclick=autoArrange;
  $('tKeys').onclick=function(){openModal('mKeys')};
  $('tplSel').onchange=function(){var v=this.value;this.value='';if(v)openExample(v)};
  $('zIn').onclick=function(){zoomBy(1.2)};$('zOut').onclick=function(){zoomBy(1/1.2)};
  $('zReset').onclick=function(){var r=vr();zoomAt(r.left+r.width/2,r.top+r.height/2,1)};$('zFit').onclick=fitView;
  $('zMini').onclick=function(){showMini=!showMini;$('mini').hidden=!showMini;this.classList.toggle('on',showMini);renderMini()};
  $('palQ').addEventListener('input',buildPalette);
  $('palQ').addEventListener('keydown',function(ev){if(ev.key==='Escape'){this.value='';buildPalette();this.blur()}else if(ev.key==='Enter'){var f=palBody.querySelector('[data-add]');if(f)f.click()}});
  palBody.addEventListener('click',function(ev){if(ev.target.closest('[data-pal=icons]')){openModal('mIcons');return}var x=ev.target.closest('[data-ex]');if(x){openExample(x.getAttribute('data-ex'));return}var b=ev.target.closest('[data-add]');if(!b)return;var c=viewCenter();addFromPalette(b.getAttribute('data-add'),c.x,c.y,true)});
  palBody.addEventListener('dragstart',function(ev){var b=ev.target.closest('[data-add]');if(b){ev.dataTransfer.setData('text/rancang',b.getAttribute('data-add'));ev.dataTransfer.effectAllowed='copy'}});
  $('docTitle').addEventListener('input',function(){DOC.title=this.value;scheduleSave();if(!single()&&!selE&&selN.length<2){var h=inspBody.querySelector('.ih h3');if(h)h.textContent=DOC.title||'Untitled diagram'}});
  $('docTitle').addEventListener('blur',function(){if(!this.value.trim()){this.value='Untitled diagram';DOC.title=this.value;scheduleSave()}});
  $('docTitle').addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key==='Escape')this.blur()});
  $('btnLib').onclick=function(){openModal('mLib')};
  $('libNew').onclick=newDiagram;$('libImport').onclick=function(){$('fileOpen').click()};
  (function(){var b=$('btnCalm');function sync(){b.setAttribute('aria-pressed',CALM?'true':'false');b.querySelector('.lbl').textContent=CALM?'Warna: tenang':'Warna: penuh';b.classList.toggle('on',CALM);document.documentElement.classList.toggle('calm',CALM)}
    sync();b.onclick=function(){CALM=!CALM;lsSet('rancang:calm',CALM?'1':'0');sync();render();renderInsp();if(typeof buildPalette==='function')buildPalette()}})();
  $('btnCheck').onclick=runCheck;
  $('btnGen').onclick=function(){openModal('mGen');$('genProg').textContent=''};$('emptyGen').onclick=$('btnGen').onclick;
  $('btnReview').onclick=runReview;
  $('genGo').onclick=runGenerate;$('genStop').onclick=function(){if(genCtl)genCtl.abort();$('genProg').textContent='Stopped'};
  $('genChips').addEventListener('click',function(ev){var b=ev.target.closest('button');if(b){$('genText').value=b.textContent;$('genText').focus()}});
  $('genMode').addEventListener('click',function(ev){var b=ev.target.closest('[data-v]');if(!b)return;genMode=b.getAttribute('data-v');this.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b)})});
  $('genText').addEventListener('keydown',function(ev){if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();runGenerate()}});
  $('emptyEx').onclick=function(){var k=exampleKeys(null,dtOf())[0];if(k)openExample(k)};
  $('btnExport').onclick=function(ev){ev.stopPropagation();var m=$('exportMenu'),open=m.hidden;closeMenus();m.hidden=!open;this.setAttribute('aria-expanded',String(open));$('expSel').disabled=!selN.length;if(!selN.length)$('expSel').checked=false};
  $('exportMenu').addEventListener('click',function(ev){
    var seg=ev.target.closest('.seg button');
    if(seg){var p=seg.parentNode;p.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===seg)});if(p.id==='expBg')expBg=seg.getAttribute('data-v');else expScale=+seg.getAttribute('data-v');return}
    var b=ev.target.closest('[data-exp]');if(!b)return;$('exportMenu').hidden=true;$('btnExport').setAttribute('aria-expanded','false');doExport(b.getAttribute('data-exp'));
  });
  $('btnPal').onclick=function(){$('insp').classList.remove('open');$('pal').classList.toggle('open')};
  $('btnInsp').onclick=function(){$('pal').classList.remove('open');$('insp').classList.toggle('open')};
  stage.addEventListener('pointerdown',function(){if(isDrawer($('pal')))$('pal').classList.remove('open')});
  bindDomain();
}
function addFreeLine(arrow){
  commitEdit();var c=viewCenter();pushUndo();var off=(S.seq%5)*20;
  var e={id:'e'+(S.seq++),from:null,to:null,start:{x:snap(c.x-90),y:snap(c.y+off)},end:{x:snap(c.x+90),y:snap(c.y+off)},type:arrow?'sync':'line',route:'straight',label:''};
  S.edges.push(e);setSel([],e.id);render();toast('Drag the green and blue ends. Drop an end on a shape to attach it.');
}

// ================= capabilities & boot =================
function initCaps(){
  var cl=window.claude;
  if(!(cl&&typeof cl.use==='function')){if(!DOC.example&&!DOC.id)setSave('idle','Saved in this browser');return}
  cl.use('downloads').then(function(d){downloadsCap=d||null},function(){});
  cl.use('sample').then(function(s){if(s){sampleCap=s;aiRefresh()}},function(){});
  Promise.all([cl.use('db'),cl.use('user')]).then(function(r){
    var db=r[0],user=r[1];if(!db||!user)return null;
    return user.id().then(function(uid){if(!uid)return null;store=cloudStore(db,uid);initIconCloud(db,uid);return syncOnStart()});
  }).catch(function(){store=localStore});
}
function syncOnStart(){
  return store.list().then(function(list){
    if(DOC.id){
      var remote=list.filter(function(x){return x.id===DOC.id})[0];
      if(!remote||(remote.updatedAt||0)<(DOC.updatedAt||0)){lastKey=null;saveNow(true)}
      else if(remote.updatedAt>DOC.updatedAt&&!changedSinceBoot){return store.load(DOC.id).then(function(d){if(d&&!changedSinceBoot)loadDoc(d,DOC.id)})}
      else setSave('ok','Saved to your account');
    }else if(DOC.example&&!changedSinceBoot&&list.length){
      var first=list[0];return store.load(first.id).then(function(d){if(d&&!changedSinceBoot){loadDoc(d,first.id);toast('Opened your latest diagram, “'+DOC.title+'”')}});
    }
  }).catch(function(){store=localStore;setSave('error','Account storage unavailable. Saving in this browser.')});
}
function boot(hot){
  hydrateIcons();
  var st=document.createElement('style');st.textContent='@font-face{font-family:Virgil;src:url('+SKETCH_FONT_URI+') format("woff2");font-display:swap}';document.head.appendChild(st);
  loadLocalIcons();
  bindUI();
  applyTheme(true);
  var w=null;
  if(hot&&hot.S&&Array.isArray(hot.S.nodes))w=hot;
  else{try{var x=JSON.parse(lsGet('rancang:current')||'null');if(x&&x.S&&Array.isArray(x.S.nodes))w=x}catch(e){}}
  if(w){
    loadDoc({title:w.title,updatedAt:w.updatedAt,nodes:w.S.nodes,edges:w.S.edges,seq:w.S.seq,style:w.S.style,dt:w.S.dt},w.id,{example:w.example});
    if(hot&&hot.cam&&isFinite(hot.cam.z)){cam={x:+hot.cam.x||0,y:+hot.cam.y||0,z:clamp(+hot.cam.z,0.1,4)};applyCam();renderOver()}
  }else openExample('agents',true);
  syncUndoBtns();
  initCaps();
  if(document.fonts&&document.fonts.load)document.fonts.load('16px Virgil').then(function(){if(S.style==='sketch')render()},function(){});
}
