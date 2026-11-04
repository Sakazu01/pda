// Which palette section each tech-stack-icons logo belongs to. The pack has no
// categories of its own, so this is the one place that says so. A name that is
// not listed lands in 'tech-more' (tests/tech.cjs prints how many).
const L = (s: string): string[] => s.split('|');

export var TECH_SECTION_NAMES: Record<string, string> = {
  'tech-ai': 'Tech stack · AI & automation',
  'tech-data': 'Tech stack · data',
  'tech-app': 'Tech stack · backend',
  'tech-web': 'Tech stack · frontend & UI',
  'tech-lang': 'Tech stack · languages',
  'tech-cloud': 'Tech stack · cloud & ops',
  'tech-tools': 'Tech stack · dev tools & OS',
  'tech-design': 'Tech stack · design & game',
  'tech-saas': 'Tech stack · apps & services',
  'tech-more': 'Tech stack · more',
};

export var TECH_SECTION_ORDER = Object.keys(TECH_SECTION_NAMES);

var LISTS: Record<string, string[]> = {
  'tech-ai': L(
    '360 AI|Adobe Firefly|AI Mass|Ai2|AI21 Labs|AiHubMix|Aion Labs|Amazon Nova|Anthropic|Antigravity|Anyscale|Arcee AI|AssemblyAI|Augment Code|Aya|Azure AI|BAAI|Baichuan|Bedrock|Bilibili AI|Bolt|CentML|Cerebras|ChatGLM|Civitai|Claude|Cline|CodeGeeX|CodeRabbit|CogVideo|CogView|Cohere Command|ComfyUI|Command A|Coqui|CrewAI|Crusoe|Cursor|DALL·E|DBRX|Deep Cogito|DeepInfra|DeepMind|DeepSeek|Doc2X|Dolphin AI|Doubao|ElevenLabs|Essential AI|Exa|FastGPT|Featherless|Firefly|Fireworks AI|Fish Audio|FLUX|Gemini|Gemma|GitHub Copilot|GLM-V|Google AI Studio|GPT|Gradio|Greptile|Grok|Groq|Hailuo AI|Higress|Hugging Face|Hunyuan|Hyperbolic|iFlytek|Inception|Infermatic|Infinigence|Inflection AI|InternLM|Jimeng|Jina AI|Kimi|Kling|Kluster.ai|Kolors|KwaiKAT|Kwaipilot|LangChain|Langfuse|LangGraph|LangSmith|Lepton AI|Liquid AI|Llama|LlamaIndex|LLaVA|LongCat|Lovable|Luma AI|Make|Meta AI|Microsoft Copilot|MiniMax|Mistral|ModelScope|Monica|Morph|MyShell|n8n|Node-RED|Novita AI|NumPy|NVIDIA|Ollama|OpenAL|OpenChat|opencode|OpenCV|PaLM|Pandas|Perplexity|Phidata|Phind|PixVerse|Plotly|Poe|Pydantic AI|PyTorch|PyTorch3D|Qwen|Relace|Roo Code|RWKV|SambaNova|scikit-learn|seaborn|Sema|SenseNova|SiliconCloud|Skywork|Sora|Stability AI|StepFun|Streamlit|Targon|TensorFlow|Tiangong|Together AI|Tripo|Udio|Unstructured|Upstage|v0|Vertex AI|Vidu|vLLM|Voyage AI|Wenxin|Windsurf|Workers AI|Xinference|XuanYuan|Yi|Yuanbao|Zapier|Zhipu AI|Zhipu Qingyan|Google Colab|RStudio|SPSS|Wolfram|Replit|Magic|PPIO|Search1API|NPL Cloud|TII',
  ),
  'tech-data': L(
    'Airtable|Algolia|Amplitude|Apache Spark|Axiom|ClickHouse|Elasticsearch|Google Analytics|Grafana|Graphite|Kibana|MongoDB|MySQL|NetworkX|Neon|PostgreSQL|PostHog|Presto|RabbitMQ|RavenDB|Redis|RocksDB|Segment|Snowflake|SQLite|Stream|SurrealDB|Tenzir|TigerBeetle|Vitess|YugabyteDB|Fauna|Realm',
  ),
  'tech-app': L(
    'Appwrite|Auth0|CakePHP|Clerk|CodeIgniter|Convex|Django|Drizzle ORM|Express|Firebase|Flask|Grafbase|Hono|Laravel|Moleculer|Mongock|Mongoose|Moodle|NestJS|NHibernate|OAuth|OpenAPI|Ory|Passport.js|Payload CMS|Phalcon|Phoenix|Prisma|Quarkus|Rails|Reflex|Sanity|Sequelize|SpiceDB|Spring Boot|SQLAlchemy|Sulu|Supabase|Symfony|Thymeleaf|tinyhttp|tRPC|TYPO3|TypeORM|uWSGI|Vapor|VeeValidate|Vert.x|WooCommerce|WordPress|Yii|Zend|Zod|MODX|PrestaShop|ProcessWire|Shopware',
  ),
  'tech-web': L(
    'Alpine.js|AMP|Angular|Angular 17|Ant Design|Astro|Backbone.js|Base UI|Blitz.js|Blueprint|Bootstrap 4|Bootstrap 5|Bulma|Chakra UI|Dojo|Docusaurus|Element UI|Eleventy|Ember.js|Expo|Fabric.js|Flutter|FlutterFlow|Framer Motion|Gatsby|Gridsome|GSAP|GSAP (alt)|Headless UI|Hexo|Hugo|Ionic|Jamstack|jQuery|Lit|Marionette.js|Material UI|MobX|Motion|Next.js|Next.js (alt)|NgRx|Nuxt|NW.js|p5.js|Panda CSS|Pinia|PixiJS|Preact|PrimeNG|PWA|Quasar|Qwik|Radix UI|React|React Bootstrap|React Native|React Navigation|React Router|Reach UI|Redux|Redux-Saga|RedwoodJS|Remix|RxJS|Semantic UI|shadcn/ui|SolidJS|Stencil|Stimulus|styled-components|Svelte|Swiper|Tailwind CSS|TanStack|TanStack (alt)|TanStack Query|Three.js|Titanium SDK|Vaadin|Vue|Vue Storefront|Vuetify|Waku|Xamarin|Zola|Zustand|Qt',
  ),
  'tech-lang': L(
    '.NET|.NET Framework|Bash|Bun|C#|C# (alt)|C++|Clojure|Crystal|CSS3|D|Dart|Deno|Elixir|Erlang|Go|Haskell|HTML5|Java|JavaScript|JSON|Kotlin|Less|Lua|Markdown|NASM|Nim|Node.js|Node.js (alt)|OCaml|Perl|PHP|PowerShell|Prolog|Pug|PureScript|Python|R|Racket|Rexx|Ruby|Rust|Sass|Scala|Solidity|Stylus|Swift|TeX|TypeScript|Ur|V8|Vala|Visual Basic|Vyper|WebAssembly|XML|YAML|Zig|Zsh',
  ),
  'tech-cloud': L(
    'Alibaba Cloud|Amazon EC2|Amazon Web Services|Apache|Apache Tomcat|AWS|Azure|Baidu Cloud|Bitbucket|Bitnami|CircleCI|Cloudflare|Cloudinary|Codefresh|Datadog|DigitalOcean|Docker|Fly.io|Git|GitHub|GitLab|Google Cloud|Heroku|Kubernetes|LogRocket|Netlify|Netlify (alt)|New Relic|ngrok|Nginx|Nomad|OPNsense|OpenStack|OpenTelemetry|Packer|pfSense|PM2|Podman|Portainer|Prometheus|Proxmox|Pulumi|Qiniu|Qodana|Railway|Rancher|Red Hat|Render|Scaleway|Scalingo|Sentry|Serverless|Snyk|SonarQube|StateCloud|Talos Linux|TeamCity|Tencent Cloud|Teleport|Terraform|Terramate|Traefik Mesh|Travis CI|Vagrant|Vercel|Volcengine|vSphere|WireGuard|Zeabur|NetBox',
  ),
  'tech-tools': L(
    'Alacritty|Android|Arc|Atom|Babel|Biome|Bing|Brave|Brunch|Chrome|Chromium|DocSearch|ESLint|esbuild|Firefox|GNU nano|Grunt|gulp|Homebrew|Hyper|Hyper (alt)|i18next|Insomnia|Internet Explorer|JSLint|Linux|Lokalise|Microsoft Edge|Mocha|Mozilla|MS-DOS|Neovim|NetBeans|NixOS|Nodemon|npm|npm (alt)|NuGet|Oh My Zsh|Opera|openSUSE|Photon Engine|pnpm|Poetry|PostCSS|Postman|PhpStorm|Prettier|Protractor|Puppeteer|PuTTY|PyCharm|PyPI|pytest|qTest|RAD Studio|Read the Docs|Rider|Rocky Linux|Rollup|RSpec|RubyMine|Safari|Selenium|Sourcetree|Spack|Spyder|SQL Developer|SSH|Stack Overflow|StackBlitz|Starship|Stylelint|Sublime Text|Subversion|SVGO|TestRail|The Algorithms|Tech Stack Icons|tmux|TortoiseGit|Tower|Turbo|Turborepo|Ubuntu|UML|Unix|UnJS|uv|Vim|Visual Studio|Vite|Vite (alt)|Vitest|VS Code|VSCodium|Weblate|webpack|WebStorm|Windows 11|Windows 8|Xcode|Yarn|Zed|Nitro',
  ),
  'tech-design': L(
    "3ds Max|Adobe|Adobe (icon)|Adobe Illustrator|Adobe XD|Affinity|Affinity Designer|Affinity Photo|Affinity Publisher|After Effects|Anima|Axure|Builder.io|Canva|Figma|InDesign|Inkscape|InVision|Lightroom|Lunacy|MonoGame|OpenGL|OpenCL|Photoshop|Photoshop (alt)|Premiere Pro|Processing|Ren'Py|SDL|SFML|ShotGrid|Sketch|Sketch (alt)|Source Engine|Storyblok|Unreal Engine|Unsplash|Vulkan|Webflow|WebGPU|Yoga",
  ),
  'tech-saas': L(
    'Asana|Atlassian|Automattic|Ant Group|Baidu|ByteDance|ClickUp|Dovetail|Google|Hotjar|Jira|Linear|Liveblocks|LiveKit|Meta|Microsoft|Miro|Notion|OneDrive|Resend|Rovo|RSSHub|Salesforce|Slack|Stripe|Tencent|Trello|Twilio|Twitter|YouTrack|YunoHost',
  ),
};

export var TECH_SECTION_OF: Record<string, string> = {};
Object.keys(LISTS).forEach(function (sec) {
  LISTS[sec].forEach(function (name) {
    // first list wins, so a name that appears twice by mistake stays put
    if (!TECH_SECTION_OF[name]) TECH_SECTION_OF[name] = sec;
  });
});
