/* www host — the "Conflict:" lines' fit at a phone's width with wider letters v1 (16 Nov 26).
   GitHub's run of pull request 783 failed e2e/warnhide.spec.ts's fit test on Linux's wider letters: one demo line ran to
   three rows at 390. This measures every "Conflict:" line of the demo week on Edit Schedule at 390 (Chromium, the test's
   size) and 402 (WebKit, his iPhone's) with the page's own letters, then Verdana (as wide as Linux's DejaVu Sans, the
   Leave War tests' LW_WIDE_LETTERS stand-in) and Helvetica Neue / Arial (Apple's narrower family), the font set by an
   init script from the first paint (docs/walk-scripts.md, the order §7.2).
   usage (from raptor-port/): node scripts/handpass/www/www-host-fit.mjs */
process.env.WWW_WHO = 'host'
process.env.WWW_RUN ||= 'fit'
const X = await import('./www-lib.mjs')
const { say, sleep } = X
import { createRequire } from 'node:module'
const req = createRequire(process.cwd() + '/package.json')
const { chromium, webkit } = req('@playwright/test')
say('www-host-fit v2 (the font set on DOMContentLoaded, as the Leave War tests do)')
const FONTS = { page: null, verdana: 'Verdana, "DejaVu Sans", sans-serif', arial: 'Arial, "Helvetica Neue", Helvetica, sans-serif' }
async function measure(engine, width, fontKey) {
  const browser = engine === 'webkit' ? await webkit.launch() : await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 3, isMobile: engine === 'webkit', hasTouch: engine === 'webkit' })
  if (FONTS[fontKey]) await ctx.addInitScript(f => {
    const add = () => { const s = document.createElement('style'); s.textContent = `*, *::before, *::after { font-family: ${f} !important }`; document.head.appendChild(s) }
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add)
  }, FONTS[fontKey])
  // serve the frozen build the way www-lib does
  const { readFileSync, existsSync, statSync } = await import('node:fs')
  const { join, extname } = await import('node:path')
  const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json' }
  await ctx.route(X.L.BASE + '/**', async route => {
    const p = decodeURIComponent(new URL(route.request().url()).pathname); let f = join(X.DIST, p)
    if (p === '/' || !existsSync(f) || statSync(f).isDirectory()) f = join(X.DIST, 'index.html')
    await route.fulfill({ status: 200, body: readFileSync(f), headers: { 'content-type': T[extname(f)] || 'application/octet-stream' } })
  })
  const page = await ctx.newPage()
  await page.goto(X.L.BASE + '/'); await X.L.login(page, 'a'); await X.L.go(page, 'editsched'); await sleep(600)
  const font = await page.evaluate(() => { const e = document.querySelector('#eWeek .day'); return e ? getComputedStyle(e).fontFamily : '' })
  const days = [...new Set(await page.locator('#eWeek .day[data-day]').evaluateAll(es => es.map(e => Number(e.dataset.day))))]
  const out = []
  for (const di of days) {
    const box = page.locator(`#eWeek .day[data-day="${di}"] [data-dwbox="${di}"]`).first()
    if (!(await box.count())) continue
    if (!(await box.evaluate(e => e.classList.contains('open')))) {
      const bar = page.locator(`#eWeek .day[data-day="${di}"] [data-daywarn="${di}"]`).first()
      if (!(await bar.count())) continue
      await bar.evaluate(e => e.scrollIntoView({ block: 'center' })); await bar.click(); await sleep(300)
    }
    const ls = await page.locator(`#eWeek .day[data-day="${di}"] [data-dwbox="${di}"] .witem[data-wix]`).evaluateAll(es => es.map(e => {
      const tx = e.querySelector('.wtx') || e.querySelector('.wbar + span'); const code = tx.querySelector('.wcode')
      const r = document.createRange(); r.setStartAfter(code); r.setEndAfter(tx.lastChild)
      const tops = new Set([...r.getClientRects()].filter(c => c.width > 0.5).map(c => Math.round(c.top)))
      return { text: (r.toString() || '').replace(/\s+/g, ' ').trim(), rows: tops.size, w: Math.round(tx.getBoundingClientRect().width) }
    }))
    for (const l of ls) if (/(^|— )Conflict: /.test(l.text)) out.push({ di, ...l })
  }
  await page.screenshot({ path: `${X.SHOTS}/fit-${engine}-${width}-${fontKey}.png` })
  await browser.close()
  return { font, out }
}
for (const [eng, wd] of [['chromium', 390], ['webkit', 402]]) for (const fk of Object.keys(FONTS)) {
  const { font, out } = await measure(eng, wd, fk)
  const over = out.filter(l => l.rows > 2)
  say(`${eng} ${wd} ${fk} (${font.slice(0, 50)}): ${out.length} conflict lines, ${over.length} over two rows, the text box ${out[0]?.w}px`)
  for (const l of over) say('   OVER', l.rows, 'rows, day', l.di, JSON.stringify(l.text))
  const top = [...out].sort((a, b) => b.text.length - a.text.length).slice(0, 3)
  for (const l of top) say('   longest', l.rows, 'rows,', l.text.length, 'chars', JSON.stringify(l.text))
}
