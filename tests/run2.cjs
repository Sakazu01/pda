const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const url = 'file://' + path.join(__dirname, 'page.html');
const shots = path.join(require('os').tmpdir(), 'pda-shots');
fs.mkdirSync(shots, { recursive: true });
const log = [];
const ok = (m) => log.push('PASS ' + m);
const bad = (m) => log.push('FAIL ' + m);
const only = process.argv[2] || '';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message + ' @ ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL_CONNECTION_FAILED|fonts\.g(oogleapis|static)/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.goto(url);
  await page.waitForTimeout(700);
  const count = () => page.evaluate(() => ({ n: document.querySelectorAll('#content > g[data-id]').length, e: document.querySelectorAll('#content > g[data-eid]:not([data-lab])').length }));
  const cur = () => page.evaluate(() => { try { const x=JSON.parse(localStorage.getItem('rancang:current'));return x.P?Object.assign({dt:x.P.cur},x.P.pages[x.P.cur]||{nodes:[],edges:[]}):x.S } catch (e) { return null } });
  const pressedDt = () => page.evaluate(() => { const b = document.querySelector('#dtChips [aria-pressed="true"]'); return b ? b.dataset.dt : null });
  const shot = (n, clip) => page.screenshot({ path: path.join(shots, n + '.png'), clip });
  const errAt = (tag) => { if (errors.length) { bad('errors after ' + tag + ': ' + errors.join(' || ')); errors.length = 0 } };

  let c = await count();
  c.n > 10 ? ok('boot example renders ' + JSON.stringify(c)) : bad('boot ' + JSON.stringify(c));
  const ws = await page.$$eval('#wsTabs [data-ws]', (l) => l.map((b) => b.dataset.ws));
  ws.length === 7 ? ok('7 workspaces: ' + ws.join(',')) : bad('workspaces ' + ws);
  ok('boot dt chip: ' + (await pressedDt()));
  await shot('01-boot');
  errAt('boot');

  async function newType(wsId, dt) {
    await page.click('#wsTabs [data-ws="' + wsId + '"]');
    await page.click('#nvMore');await page.waitForTimeout(60);
    await page.click('#nvPick [data-dt="' + dt + '"]');
    await page.waitForTimeout(80);
    if (await page.isVisible('#dtPop')) { await page.click('#dtPop [data-dtgo="new"]'); }
    await page.waitForTimeout(150);
  }
  // 1. every diagram type: new doc
  const types = await page.evaluate(() => [...document.querySelectorAll('#wsTabs [data-ws]')].map((b) => b.dataset.ws));
  const allTypes = [];
  for (const w of types) {
    await page.click('#wsTabs [data-ws="' + w + '"]');
    const dts = await page.evaluate((w) => { document.getElementById('nvMore').click(); const l = [...document.querySelectorAll('#nvPick .nv-grp')][0].querySelectorAll('[data-dt]'); const r = [...l].map((b) => b.dataset.dt); document.getElementById('nvPickX').click(); return r }, w);
    dts.forEach((d) => allTypes.push([w, d]));
  }
  ok('diagram types: ' + allTypes.length);
  if (!only || only === 'types') {
    for (const [w, dt] of allTypes) {
      await newType(w, dt);
      const p = await pressedDt(), s = await cur(), cc = await count();
      const pal = await page.$$eval('#palBody [data-add]', (l) => l.length);
      const head = await page.textContent('#palType b');
      if (p === dt && s && s.dt === dt && pal > 3) ok('new ' + dt + ' · nodes ' + cc.n + ' · palette ' + pal + ' · head ' + head);
      else bad('new ' + dt + ' pressed=' + p + ' saved=' + (s && s.dt) + ' palette=' + pal);
      if (['swot', 'bmc', 'vc', 'ff', 'wsf', 'dikw', 'wp', 'vmodel', 'gen', 'pestel', 'vpc', 'mcf', 'journey', 'persona', 'empathy', 'org', 'mind', 'sitemap'].includes(dt) && cc.n < 2) bad('seed missing for ' + dt);
      if (['swot', 'vc', 'dikw', 'org', 'mind', 'journey', 'usecase'].includes(dt)) await shot('10-new-' + dt);
      errAt('new ' + dt);
    }
  }
  // 2. every example
  const exKeys = await page.$$eval('#tplSel option', (l) => l.map((o) => o.value).filter(Boolean));
  ok('examples: ' + exKeys.length);
  if (!only || only === 'examples') {
    for (const k of exKeys) {
      await page.selectOption('#tplSel', k);
      await page.waitForTimeout(160);
      c = await count();
      const s = await cur();
      c.n > 0 ? ok('example ' + k + ' ' + JSON.stringify(c) + ' dt=' + (s && s.dt)) : bad('example ' + k);
      await shot('20-ex-' + k.replace(/[^a-z0-9]+/gi, '_'));
      // click a handful of nodes to exercise inspectors
      const centers = await page.evaluate(() => [...document.querySelectorAll('#content > g[data-id]')].slice(0, 60).filter((_, i) => i % 5 === 0).map((g) => { const r = g.getBoundingClientRect(); return { x: r.x + Math.min(r.width / 2, 20), y: r.y + Math.min(r.height / 2, 14) } }).filter((p) => p.x > 260 && p.x < 1130 && p.y > 120 && p.y < 860));
      for (const p of centers.slice(0, 8)) { await page.mouse.click(p.x, p.y); await page.waitForTimeout(30); }
      await page.keyboard.press('Escape');
      errAt('example ' + k);
    }
  }
  // 3. framework quick-fill + group drag + check
  if (!only || only === 'fw') {
    await newType('biz', 'swot');
    const ta = await page.$$('#inspBody textarea[data-qf]');
    ta.length === 4 ? ok('swot quick-fill fields: 4') : bad('swot quick-fill ' + ta.length);
    await ta[0].click();
    await page.keyboard.type('Lokasi dekat kampus\nHarga terjangkau');
    await page.waitForTimeout(150);
    const shown = await page.evaluate(() => [...document.querySelectorAll('#content text')].some((t) => t.textContent.includes('Lokasi dekat kampus')));
    shown ? ok('quick-fill text drawn on canvas') : bad('quick-fill not on canvas');
    const st = await page.textContent('#inspBody .qf .st');
    st.includes('1/4') ? ok('fill counter ' + st) : bad('fill counter ' + st);
    await page.click('#btnCheck');
    await page.waitForTimeout(100);
    const fb = await page.textContent('#findBody');
    fb.includes('3 of 4') ? ok('check: empty framework blocks reported') : bad('check fw: ' + fb.slice(0, 200));
    await page.click('#findClose');
    // drag a cell -> whole framework moves
    const before = await page.evaluate(() => [...document.querySelectorAll('#content > g[data-id]')].map((g) => g.getBoundingClientRect().x));
    const g0 = await page.evaluate(() => { const g = [...document.querySelectorAll('#content > g[data-id]')].find((x) => x.textContent.includes('Weaknesses')); const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } });
    await page.mouse.move(g0.x, g0.y); await page.mouse.down(); await page.mouse.move(g0.x + 120, g0.y + 40, { steps: 6 }); await page.mouse.up();
    await page.waitForTimeout(100);
    const after = await page.evaluate(() => [...document.querySelectorAll('#content > g[data-id]')].map((g) => g.getBoundingClientRect().x));
    const moved = after.filter((x, i) => Math.abs(x - before[i]) > 30).length;
    moved >= before.length - 1 ? ok('drag moves whole framework (' + moved + '/' + before.length + ')') : bad('group drag moved ' + moved + '/' + before.length);
    await page.keyboard.press('Control+z');
    // insert another framework from palette
    await page.click('#palBody [data-add="fw:bmc"]');
    await page.waitForTimeout(200);
    c = await count();
    c.n > 15 ? ok('insert BMC from palette ' + JSON.stringify(c)) : bad('insert bmc ' + JSON.stringify(c));
    await page.keyboard.press('Escape');
    await page.mouse.click(700, 500);
    await page.waitForTimeout(100);
    await shot('30-swot-bmc');
    // Five Forces level badge via quick-fill
    await newType('biz', 'ff');
    const qb = await page.$$('#inspBody select[data-qb]');
    qb.length === 5 ? ok('ff level selects: 5') : bad('ff level selects ' + qb.length);
    await qb[0].selectOption('Tinggi');
    await page.waitForTimeout(120);
    const badge = await page.evaluate(() => [...document.querySelectorAll('#content text')].some((t) => t.textContent === 'Tinggi'));
    badge ? ok('ff badge drawn') : bad('ff badge missing');
    // gen: choose strategy
    await newType('biz', 'gen');
    const qg = await page.$('#inspBody select[data-qg]');
    if (qg) { const opts = await qg.$$eval('option', (l) => l.map((o) => o.value)); await qg.selectOption(opts[2]); await page.waitForTimeout(120); const hl = await page.evaluate(() => [...document.querySelectorAll('#content text')].some((t) => t.textContent.startsWith('✓'))); hl ? ok('gen highlight drawn') : bad('gen highlight'); } else bad('gen select missing');
    await shot('31-gen');
    errAt('frameworks');
  }
  // 4. trees: tab/enter + outline
  if (!only || only === 'tree') {
    await newType('biz', 'org');
    c = await count();
    const n0 = c.n;
    const root = await page.evaluate(() => { const g = [...document.querySelectorAll('#content > g[data-id]')].find((x) => x.textContent.includes('Pimpinan')); const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } });
    await page.mouse.click(root.x, root.y);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(120);
    await page.keyboard.type('Bagian D');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(80);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(120);
    await page.keyboard.type('Bagian E');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(120);
    c = await count();
    c.n === n0 + 2 ? ok('org Tab + Enter add child and sibling (' + n0 + ' -> ' + c.n + ')') : bad('org tab/enter ' + n0 + ' -> ' + c.n);
    await shot('40-org-tab');
    await page.keyboard.press('Escape');
    await page.click('#inspBody [data-act="outline"]');
    await page.waitForTimeout(120);
    const ol = await page.inputValue('#olText');
    ol.includes('Bagian E') ? ok('outline serializes tree') : bad('outline: ' + ol);
    await page.fill('#olText', 'Rektor\n  Wakil Rektor I | Akademik\n    Fakultas Teknik\n    Fakultas Ekonomi *\n  Wakil Rektor II | Keuangan\n    Biro Keuangan\n    Biro SDM\n  Direktorat TI');
    await page.click('#olReplace');
    await page.waitForTimeout(200);
    c = await count();
    c.n === 8 ? ok('outline rebuild -> 8 boxes') : bad('outline rebuild ' + JSON.stringify(c));
    await shot('41-org-outline');
    await newType('wb', 'mind');
    const mr = await page.evaluate(() => { const g = [...document.querySelectorAll('#content > g[data-id]')].find((x) => x.textContent.includes('Ide utama')); const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } });
    await page.mouse.click(mr.x, mr.y);
    await page.keyboard.press('Tab'); await page.waitForTimeout(100); await page.keyboard.type('Cabang baru'); await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    await shot('42-mind');
    errAt('trees');
  }
  // 5. sequence: lifelines + message drag
  if (!only || only === 'seq') {
    await newType('se', 'sequence');
    await page.click('#palBody [data-add="u-seq-actor"]'); await page.waitForTimeout(100); await page.keyboard.type('User'); await page.keyboard.press('Enter');
    await page.click('#palBody [data-add="u-seq-life"]'); await page.waitForTimeout(100); await page.keyboard.type('API'); await page.keyboard.press('Enter');
    await page.click('#palBody [data-add="u-seq-life"]'); await page.waitForTimeout(100); await page.keyboard.type('DB'); await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await page.keyboard.press('Escape');
    await page.click('#zFit');
    await page.waitForTimeout(150);
    const ls = await page.evaluate(() => [...document.querySelectorAll('#content > g[data-id]')].map((g) => { const r = g.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y, h: r.height } }));
    ls.length === 3 ? ok('3 lifelines placed') : bad('lifelines ' + ls.length);
    const y = ls[1].y + ls[1].h * 0.4;
    await page.mouse.move(ls[0].x, y); await page.mouse.down(); await page.mouse.move(ls[1].x, y, { steps: 8 }); await page.mouse.up();
    await page.waitForTimeout(120); await page.keyboard.type('login()'); await page.keyboard.press('Enter');
    await page.mouse.move(ls[1].x, y + 50); await page.mouse.down(); await page.mouse.move(ls[2].x, y + 50, { steps: 8 }); await page.mouse.up();
    await page.waitForTimeout(120); await page.keyboard.type('SELECT user'); await page.keyboard.press('Enter');
    c = await count();
    c.e === 2 ? ok('sequence messages by dragging lifelines: ' + c.e) : bad('sequence messages ' + JSON.stringify(c)+' '+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('#content [data-eid]')].map(g=>g.getAttribute('data-eid')+(g.hasAttribute('data-lab')?'L':'')))));
    await shot('50-sequence');
    errAt('sequence');
  }
  // 6. pen
  if (!only || only === 'pen') {
    await newType('wb', 'board');
    await page.keyboard.press('p');
    await page.mouse.move(600, 400); await page.mouse.down();
    for (let i = 0; i < 20; i++) await page.mouse.move(600 + i * 10, 400 + Math.sin(i / 3) * 40);
    await page.mouse.up();
    await page.keyboard.press('v');
    await page.waitForTimeout(120);
    c = await count();
    c.n === 1 ? ok('pen stroke creates a drawing') : bad('pen ' + JSON.stringify(c));
    errAt('pen');
  }
  // 7. My icons: raster bg removal + tech binding + export/import
  if (!only || only === 'icons') {
    const b64 = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 300; c.height = 200; const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 300, 200); const gr = g.createLinearGradient(100, 40, 200, 160); gr.addColorStop(0, '#4285f4'); gr.addColorStop(1, '#9b72cb'); g.fillStyle = gr; g.beginPath(); g.moveTo(150, 30); g.quadraticCurveTo(160, 90, 220, 100); g.quadraticCurveTo(160, 110, 150, 170); g.quadraticCurveTo(140, 110, 80, 100); g.quadraticCurveTo(140, 90, 150, 30); g.fill(); return c.toDataURL('image/png').split(',')[1] });
    const f = path.join(shots, 'gemini-logo.png'); fs.writeFileSync(f, Buffer.from(b64, 'base64'));
    const svgF = path.join(shots, 'qwen.svg'); fs.writeFileSync(svgF, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><script>alert(1)</script><circle cx="32" cy="32" r="28" fill="#615ced" onclick="x()"/><path d="M20 32h24" stroke="#fff" stroke-width="6"/></svg>');
    await newType('ai', 'n8n');
    await page.click('#palBody [data-pal="icons"]');
    await page.waitForTimeout(150);
    await page.setInputFiles('#iconFile', [f, svgF]);
    await page.waitForTimeout(900);
    const cards = await page.$$eval('#iconList .icon-card', (l) => l.map((x) => x.querySelector('input').value + ' :: ' + x.querySelector('.bind').textContent));
    cards.length === 2 ? ok('icons uploaded: ' + cards.join(' | ')) : bad('icons ' + cards);
    const dims = await page.evaluate(() => [...document.querySelectorAll('#iconList img')].map((i) => i.naturalWidth + 'x' + i.naturalHeight));
    ok('icon sizes after trim: ' + dims.join(', '));
    const alpha = await page.evaluate(() => new Promise((res) => { const im = [...document.querySelectorAll('#iconList img')].find((i) => i.src.indexOf('image/png') > 0); const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext('2d'); g.drawImage(im, 0, 0); res(g.getImageData(0, 0, 1, 1).data[3]) }));
    alpha === 0 ? ok('background removed (corner alpha 0)') : bad('corner alpha ' + alpha);
    await shot('60-icons-modal');
    await page.click('#mIcons [data-close]');
    await page.fill('#palQ', 'gemini');
    await page.waitForTimeout(100);
    const imgs = await page.$$eval('#palBody [data-add]', (l) => l.map((b) => b.dataset.add + (b.querySelector('image,img') ? ':img' : '')));
    imgs.some((x) => x.startsWith('c-x-gemini') && x.endsWith(':img')) ? ok('tech item Gemini uses uploaded logo: ' + imgs.join(',')) : bad('tech binding ' + imgs.join(','));
    await page.click('#palBody [data-add^="c-x-gemini"]');
    await page.waitForTimeout(100); await page.keyboard.press('Enter');
    await page.fill('#palQ', '');
    const hasImage = await page.evaluate(() => !!document.querySelector('#content image'));
    hasImage ? ok('canvas node renders logo image') : bad('no image on canvas');
    const scriptLeak = await page.evaluate(() => [...document.querySelectorAll('#iconList img, #palBody img')].some((i) => atob((i.src.split('base64,')[1] || '')).includes('<script')));
    !scriptLeak ? ok('svg sanitized') : bad('svg script kept');
    await page.click('#btnExport');
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.click('#exportMenu [data-exp="json"]')]);
    if (dl) { const p = path.join(shots, 'icons.json'); await dl.saveAs(p); const j = JSON.parse(fs.readFileSync(p, 'utf8')); j.icons && Object.keys(j.icons).length ? ok('json export embeds ' + Object.keys(j.icons).length + ' icon(s), dt=' + j.dt) : bad('json icons missing'); } else bad('json export');
    await page.click('#btnExport');
    const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.click('#exportMenu [data-exp="png"]')]);
    dl2 ? ok('png export with logo') : bad('png export with logo');
    if (dl2) await dl2.saveAs(path.join(shots, 'logo-export.png'));
    errAt('icons');
  }
  // 8. dark mode + phone
  if (!only || only === 'look') {
    await page.selectOption('#tplSel', 'bmc:Biliar & Kafe');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(250);
    await shot('70-dark-bmc');
    await page.selectOption('#tplSel', 'erd:POS (crow’s foot)');
    await page.waitForTimeout(200);
    await shot('71-dark-erd');
    await page.emulateMedia({ colorScheme: 'light' });
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.waitForTimeout(200);
    await shot('72-1100');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    await shot('73-phone');
    const hs = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    !hs ? ok('no horizontal scroll on phone') : bad('horizontal scroll on phone');
    await page.click('#btnPal'); await page.waitForTimeout(300); await shot('74-phone-pal');
    errAt('look');
  }
  console.log(log.join('\n'));
  console.log('ERRORS:', errors.length ? '\n' + errors.join('\n') : 'none');
  await browser.close();
})().catch((e) => { console.log(log.join('\n')); console.error('SCRIPT ERROR', e); process.exit(1); });
