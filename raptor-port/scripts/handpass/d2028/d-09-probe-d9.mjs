/* d-09-probe-d9 v1 — D9: print and CSV of the published Saturday on View-only Sched, after the Logic change.
   usage (from raptor-port/): node scripts/handpass/d2028/d-09-probe-d9.mjs */
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/d9'
console.log('d-09-probe-d9 v1', process.env.HP_SHOTS)
const F = await import('./d-lib2.mjs')
const { D, X, L, sleep, j, SAT } = F
const w = await D.world('pc')
const { page } = w
console.log('bundle', await D.bundle(page))
await F.buildD1(w, { logic: true })
await L.go(page, 'viewsched'); await sleep(700)
const chip = await D.chips(w, 'view', SAT)
console.log('screen chip', j(chip))
console.log('view buttons', await page.evaluate(() => [...document.querySelectorAll('#page-viewsched button, #page-viewsched [id]')].filter(b => b.offsetWidth && /export|print|csv|pdf/i.test(b.id + b.title + b.getAttribute('aria-label') + b.innerText)).map(b => b.id + '|' + b.title + '|' + b.innerText.trim()).join('\n')))
await D.shot(page, 'd9-1-view-page')
console.log('NOTE: the View-only page carries no print or CSV button; Edit Schedule has them (exports the published version) - using those')
await L.go(page, 'editsched'); await sleep(700)
// capture window.print and any opened popup / blob
await page.addInitScript(() => {})
await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++ }; window.__opened = []; const o = window.open; window.open = (...a) => { window.__opened.push(String(a[0]).slice(0, 80)); return o.apply(window, a) } })
const csvBtn = page.locator('#page-viewsched #exportSched:visible, #exportSched:visible').first()
if (await csvBtn.count()) {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), csvBtn.click()])
  if (dl) {
    const path = await dl.path()
    const fs = await import('node:fs')
    const txt = fs.readFileSync(path, 'utf8')
    fs.writeFileSync(`${D.SHOTS}/d9-view.csv`, txt)
    const lines = txt.split(/\r?\n/)
    console.log('CSV file', dl.suggestedFilename(), 'lines', lines.length)
    console.log('CSV lines with Briefing/ALL AVAIL/assumed/no end:', j(lines.filter(l => /Briefing|ALL AVAIL|assumed|no end/i.test(l))))
    const sat = lines.findIndex(l => /Sat|18/.test(l))
  } else console.log('CSV: no download event')
} else console.log('no CSV button on View-only page')
const pdfBtn = page.locator('#exportPdf:visible').first()
if (await pdfBtn.count()) {
  const popP = Promise.resolve(null)
  // the print goes through a hidden iframe (srcdoc): keep a copy of its text the moment it is added
  await page.evaluate(() => { window.__ifr = ''; const mo = new MutationObserver(() => { document.querySelectorAll('iframe[srcdoc]').forEach(f => { if (f.srcdoc) window.__ifr = f.srcdoc }) }); mo.observe(document.body, { childList: true, subtree: true, attributes: true }) })
  await pdfBtn.click(); await sleep(1500)
  const pop = await popP
  console.log('print: window.print calls', await page.evaluate(() => window.__printed), 'opened', await page.evaluate(() => window.__opened.join(',')), 'popup', !!pop)
  let html = ''
  if (pop) { await pop.waitForLoadState().catch(() => {}); html = await pop.evaluate(() => document.body.innerText).catch(() => '') ; await pop.screenshot({ path: `${D.SHOTS}/d9-2-print-popup.png` }).catch(() => {}) }
  else { const src = await page.evaluate(() => window.__ifr || ''); html = src.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\n\s*\n+/g, '\n'); console.log('print html length', src.length) }
  console.log('PRINT text length', html.length)
  const fs = await import('node:fs'); fs.writeFileSync(`${D.SHOTS}/d9-print.txt`, html)
  console.log('PRINT lines with Briefing/ALL AVAIL/assumed/no end:', j(html.split(/\r?\n/).filter(l => /Briefing|ALL AVAIL|assumed|no end/i.test(l))))
  await D.shot(page, 'd9-3-after-print')
} else console.log('no print button on View-only page')
D.finish(w, 'd9')
await w.browser.close()
