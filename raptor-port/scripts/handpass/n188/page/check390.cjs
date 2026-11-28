// Renders page-r6.html from the repo at an iPhone's width and checks it: no sideways scroll, no broken picture,
// no script error, the reply bar answers a press. Saves pictures of named sections for the host to open.
const path = require('path');
const { webkit, chromium } = require(path.join(process.argv[2], 'node_modules', 'playwright'));
const page = process.argv[3], out = process.argv[4], ids = (process.argv[5] || '').split(',').filter(Boolean);
(async () => {
  let b; try { b = await webkit.launch(); } catch (e) { b = await chromium.launch(); }
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark', isMobile: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file:///' + page.replace(/\\/g, '/'));
  await p.waitForLoadState('load'); await p.waitForTimeout(1500);
  const f = await p.evaluate(() => ({
    sw: document.documentElement.scrollWidth, w: innerWidth, h: document.documentElement.scrollHeight,
    broken: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.getAttribute('src')),
  }));
  console.log(JSON.stringify(f));
  await p.locator('#d5 button.diff').last().click();
  await p.locator('#e8 button.diff').first().click();
  await p.locator('#n7 button.diff').first().click();
  console.log('reply:', await p.locator('#replytext').textContent());
  for (const id of ids) { const el = p.locator('#' + id); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await el.screenshot({ path: path.join(out, 'chk-' + id + '.png') }); }
  console.log('errors:', JSON.stringify(errs));
  await b.close();
})();
