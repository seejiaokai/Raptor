// Re-walk item 3 extra: sweep a finger across the 1 Jan / 2 Jan / 3 Jan headings 1 px at a time; what opens, and what is under the finger.
import * as L from './lw-m3-rewalk-lib.mjs'
const engine = process.argv[2] || 'chromium'
const tag = `r3b-ph-${engine === 'webkit' ? 'wk' : 'cr'}`
console.log('lw-m3-rewalk-r3b v1', engine, tag)
const w = await L.newCtx('phone', engine)
const P = w.page
await L.signInPlain(w, 'admin')
await L.gotoMonth(w, 'JAN'); await P.waitForTimeout(800)
const boxes = await P.evaluate(() => ['01', '02', '03', '04'].map(d => { const r = document.querySelector(`[data-testid="head-2026-01-${d}"]`).getBoundingClientRect(); return d + ':' + r.x.toFixed(1) + '-' + (r.x + r.width).toFixed(1) }))
console.log('heading boxes', boxes.join(' '))
const y = await P.evaluate(() => { const r = document.querySelector('[data-testid="head-2026-01-02"]').getBoundingClientRect(); return r.y + r.height / 2 })
const opened = () => P.evaluate(() => document.querySelector('[data-testid="lwday-body"]')?.dataset.iso || null)
const under = x => P.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('[data-testid]')?.dataset.testid || e.tagName) : null }, [x, y])
const rows = []
for (let x = 104; x <= 172; x += 2) {
  if (await L.vis(P, L.T('lwday-body'))) { await P.keyboard.press('Escape'); await P.waitForTimeout(300) }
  if (await L.vis(P, L.T('lwday-body'))) { const b = await P.locator('[data-testid="win-lwday"] .win-x').first().boundingBox(); await L.finger(w, b.x + b.width / 2, b.y + b.height / 2); await P.waitForTimeout(300) }
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(150)
  const u = await under(x)
  await L.finger(w, x, y)
  await P.waitForTimeout(300)
  const got = await opened()
  rows.push(`x=${x} under=${u} opened=${got}`)
}
console.log(rows.join('\n'))
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
