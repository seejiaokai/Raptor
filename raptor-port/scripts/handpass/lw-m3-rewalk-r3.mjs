// Re-walk item 3: phone, JAN pressed; tap the 2 Jan heading at 2,5,8,12,16 px in and at its centre; 1 Jan and 3 Jan at their centres.
// usage: node lw-m3-rewalk-r3.mjs <chromium|webkit>
import * as L from './lw-m3-rewalk-lib.mjs'
const engine = process.argv[2] || 'chromium'
const tag = `r3-ph-${engine === 'webkit' ? 'wk' : 'cr'}`
console.log('lw-m3-rewalk-r3 v1', engine, tag)
L.clearPrefix(tag)
const w = await L.newCtx('phone', engine)
const P = w.page
await L.signInPlain(w, 'admin')
await L.gotoMonth(w, 'JAN'); await P.waitForTimeout(800)
const headBox = iso => P.evaluate(i => { const e = document.querySelector(`[data-testid="head-${i}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height } }, iso)
const opened = () => P.evaluate(() => { const b = document.querySelector('[data-testid="lwday-body"]'); return b ? (b.dataset.iso || null) : null })
const title = () => P.evaluate(() => (document.querySelector('[data-testid="win-lwday"] .win-bar')?.innerText || '').replace(/\s+/g, ' ').trim())
async function closePanel() {
  if (!(await L.vis(P, L.T('lwday-body')))) return
  const x = P.locator('[data-testid="win-lwday"] .win-x, [data-testid="win-lwday"] [aria-label="Close"], [data-testid="lwday-close"]').first()
  if (await x.count()) { const b = await x.boundingBox(); await L.finger(w, b.x + b.width / 2, b.y + b.height / 2) } else await P.keyboard.press('Escape')
  await P.waitForTimeout(350)
  if (await L.vis(P, L.T('lwday-body'))) await P.keyboard.press('Escape')
  await P.waitForTimeout(300)
}
const cases = [['2026-01-02', 2], ['2026-01-02', 5], ['2026-01-02', 8], ['2026-01-02', 12], ['2026-01-02', 16], ['2026-01-02', 'c'], ['2026-01-01', 'c'], ['2026-01-03', 'c']]
let n = 0
for (const [iso, off] of cases) {
  n++
  await closePanel()
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
  const b = await headBox(iso)
  if (!b) { L.rec(`3 phone/${engine} ${iso} ${off}`, 'phone', 'NOT RUN', 'heading not found', []); continue }
  const x = off === 'c' ? b.x + b.w / 2 : b.x + off, y = b.y + b.h / 2
  const name = `${tag}-${String(n).padStart(2, '0')}-${iso.slice(5)}-${off === 'c' ? 'centre' : off + 'px'}`
  await L.finger(w, x, y, 0, name + '-q')
  await P.waitForTimeout(400)
  await L.shot(w, name + '-settled')
  const got = await opened(), t = await title()
  const ok = got === iso
  console.log(`${ok ? 'PASS' : 'FAIL'} ${iso} at ${off === 'c' ? 'centre' : off + 'px'} (x ${x.toFixed(1)} of heading ${b.x.toFixed(1)}..${(b.x + b.w).toFixed(1)}, y ${y.toFixed(1)}) opened ${got} title "${t}"`)
  L.rec(`3 phone/${engine} ${iso.slice(5)} ${off === 'c' ? 'centre' : off + 'px in'}`, 'phone', ok ? 'PASS' : 'FAIL', `finger at x ${x.toFixed(1)} (heading box ${b.x.toFixed(1)}-${(b.x + b.w).toFixed(1)}, ${b.w.toFixed(1)} wide); panel opened ${got}, title "${t}"`, [name + '-q', name + '-settled'])
}
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
