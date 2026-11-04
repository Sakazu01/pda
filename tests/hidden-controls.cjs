// Preloaded by run.mjs. The calmer shell moved the examples select and the theme
// button out of sight (they live in the ⋯ menu and the front door), but they are
// still real elements. Playwright refuses to act on hidden elements, so these two
// are driven through the DOM, which is what the menu does too.
const { chromium } = require('playwright');

let patched = false;
function patch(page) {
  if (patched) return page;
  patched = true;
  // Page is not exported by the package, so patch the class of the first page we see
  const P = Object.getPrototypeOf(page);
  const selectOption = P.selectOption;
  const click = P.click;
  P.selectOption = function (sel, value, opts) {
    if (sel !== '#tplSel' || typeof value !== 'string') return selectOption.call(this, sel, value, opts);
    return this.evaluate(function (v) {
      const s = document.getElementById('tplSel');
      s.value = v;
      s.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  };
  // top-bar buttons and the floating AI button now live in the ⋯ menu or the front door
  const MOVED = ['#btnTheme', '#btnSim', '#btnCheck', '#btnSlides', '#aiFab'];
  P.click = function (sel, opts) {
    // the workspace tabs are one pill now: open the list, then pick the entry
    if (typeof sel === 'string' && sel.indexOf('#wsTabs [data-ws=') === 0)
      return this.evaluate(function (s) {
        const cur = document.querySelector('#wsTabs [aria-selected="true"]');
        if (cur) cur.click();
        const t = document.querySelector(s);
        if (t) t.click();
      }, sel);
    if (MOVED.indexOf(sel) < 0) return click.call(this, sel, opts);
    return this.evaluate(function (id) {
      document.querySelector(id).click();
    }, sel);
  };
  return page;
}

const launch = chromium.launch.bind(chromium);
chromium.launch = async function (o) {
  const b = await launch(o);
  const newPage = b.newPage.bind(b);
  const newContext = b.newContext.bind(b);
  b.newPage = async (...a) => patch(await newPage(...a));
  b.newContext = async (...a) => {
    const c = await newContext(...a);
    const cp = c.newPage.bind(c);
    c.newPage = async (...x) => patch(await cp(...x));
    return c;
  };
  return b;
};
