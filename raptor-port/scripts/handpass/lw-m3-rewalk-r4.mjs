// Re-walk item 4: phone; the heading's panel opens low (grid above), its steps are the app's finger-sized buttons, 31 Dec 26 -> 1 Jan 27 shows the year.
// usage: node lw-m3-rewalk-r4.mjs <chromium|webkit>
import * as L from './lw-m3-rewalk-lib.mjs'
const engine = process.argv[2] || 'chromium'
const tag = `r4-ph-${engine === 'webkit' ? 'wk' : 'cr'}`
console.log('lw-m3-rewalk-r4 v1', engine, tag)
L.clearPrefix(tag)
const w = await L.newCtx('phone', engine)
const P = w.page
await L.signInPlain(w, 'admin')
await L.gotoMonth(w, 'JUL'); await P.waitForTimeout(700)
const geom = () => P.evaluate(() => {
  const box = e => { if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, bg: cs.backgroundColor, bd: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor, cls: e.className } }
  const q = s => document.querySelector(s)
  const dr = q('[data-testid="head-2026-07-10"]')?.getBoundingClientRect()
  const hdr = q('#page-leavewar thead')?.getBoundingClientRect()
  return { vp: [innerWidth, innerHeight], panel: box(q('[data-testid="win-lwday"]')), prev: box(q('[data-testid="lwday-prev"]')), next: box(q('[data-testid="lwday-next"]')), x: box(q('[data-testid="win-lwday-x"]')), title: (q('[data-testid="win-lwday"] .win-ttl')?.innerText || ''), headRow: dr && { y: Math.round(dr.y), b: Math.round(dr.bottom) }, thead: hdr && { y: Math.round(hdr.y), b: Math.round(hdr.bottom) } }
})
// a. open from a heading
await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
const hb = await P.evaluate(() => { const r = document.querySelector('[data-testid="head-2026-07-10"]').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })
await L.finger(w, hb.x, hb.y, 0, tag + '-01-heading-tap-q'); await P.waitForTimeout(500)
await L.shot(w, tag + '-02-panel-open')
const g = await geom(); console.log(JSON.stringify(g, null, 1))
const belowPanel = g.vp[1] - g.panel.y - g.panel.h
L.rec(`4 phone/${engine} panel opens low, grid above`, 'phone', g.panel.y > 150 && g.panel.y < g.vp[1] * 0.5 ? 'PASS' : 'FAIL', `panel top ${g.panel.y} of ${g.vp[1]} tall, height ${g.panel.h}, ${belowPanel.toFixed(0)} px below it; heading row (the date numbers) at y ${g.headRow?.y}-${g.headRow?.b} is ${g.headRow?.b < g.panel.y ? 'above' : 'under'} the panel's top`, [tag + '-01-heading-tap-q', tag + '-02-panel-open'])
const stepOk = [g.prev, g.next].every(b => b && b.w >= 32 && b.h >= 32)
L.rec(`4 phone/${engine} ‹ › finger-sized, the app's buttons`, 'phone', stepOk && /abtn/.test(g.prev.cls) ? 'PASS' : 'FAIL', `‹ ${g.prev.w}x${g.prev.h} bg ${g.prev.bg} border ${g.prev.bd}; › ${g.next.w}x${g.next.h}; ✕ ${g.x.w}x${g.x.h} bg ${g.x.bg} border ${g.x.bd}; class "${g.prev.cls}"`, [tag + '-02-panel-open'])
// b. press next, check the title moves; press prev back
await L.finger(w, g.next.x + g.next.w / 2, g.next.y + g.next.h / 2, 0, tag + '-03-next-q'); await P.waitForTimeout(400)
await L.shot(w, tag + '-04-next'); const t1 = (await geom()).title
// c. 31 Dec 26 -> 1 Jan 27 : close, go to DEC, tap 31 Dec heading, then ›
await L.finger(w, g.x.x + g.x.w / 2, g.x.y + g.x.h / 2); await P.waitForTimeout(400)
await L.gotoMonth(w, 'DEC'); await P.waitForTimeout(800)
await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(300)
const found = await P.locator('[data-testid="head-2026-12-31"]').count()
console.log('31 Dec heading present', found)
if (!found) { L.rec(`4 phone/${engine} 31 Dec -> 1 Jan 27 year`, 'phone', 'NOT RUN', 'no 31 Dec heading in view after DEC', []) } else {
  await L.press(w, L.T('head-2026-12-31'), tag + '-05-dec31-q'); await P.waitForTimeout(500)
  await L.shot(w, tag + '-06-dec31'); const g2 = await geom(); const tA = g2.title
  await L.finger(w, g2.next.x + g2.next.w / 2, g2.next.y + g2.next.h / 2, 0, tag + '-07-step-q'); await P.waitForTimeout(500)
  await L.shot(w, tag + '-08-jan1-27'); const g3 = await geom(); const tB = g3.title
  const body = await P.evaluate(() => document.querySelector('[data-testid="lwday-body"]')?.dataset.iso)
  console.log('title before', JSON.stringify(tA), 'after step', JSON.stringify(tB), 'iso', body)
  L.rec(`4 phone/${engine} 31 Dec 26 -> 1 Jan 27 shows the year`, 'phone', /Fri 1 Jan 27/.test(tB) ? 'PASS' : 'FAIL', `title on 31 Dec: "${tA}"; after › : "${tB}" (panel day ${body})`, [tag + '-05-dec31-q', tag + '-06-dec31', tag + '-07-step-q', tag + '-08-jan1-27'])
}
console.log('title after one step from 15 Jul:', t1)
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
