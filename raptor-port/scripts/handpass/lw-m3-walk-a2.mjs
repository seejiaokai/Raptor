// Walker A, scenario 2 (a bid that turns Available P red: the day line says so; after placing the bubble under Manning / at the foot).
// usage: node lw-m3-walk-a2.mjs <desktop|phone> <chromium|webkit>
import * as L from './lw-m3-walk-a-lib.mjs'
const size = process.argv[2] || 'desktop', engine = process.argv[3] || 'chromium'
const tag = `s2-${size === 'phone' ? 'ph' : 'dk'}${engine === 'webkit' ? '-wk' : ''}`
console.log('lw-m3-walk-a2 v1', size, engine, tag)
const w = await L.newCtx(size, engine)
const P = w.page, ID = `2 ${size}/${engine}`
await L.signInPlain(w, 'admin')
const req = await L.setRequired(w, 'p', '2026-02-20', 28)
console.log('fixture: Required P on 20 Feb typed through its cell, reads', req)
await L.shot(w, tag + '-00-fixture')
await L.signInPlain(w, 'member', '2026-02-15')
await L.openCellR(w, 'bane', '2026-02-20', w.phone ? tag + '-01-celltap-q' : null)
await L.shot(w, tag + '-01-open')
const dl = await L.dayline(P)
const dlRed = await P.evaluate(() => { const e = document.querySelector('[data-testid="bid-dayline-avail"]'); if (!e) return null; return { t: e.innerText.trim(), color: getComputedStyle(e).color, red: [...e.querySelectorAll('*')].map(x => x.innerText + ':' + getComputedStyle(x).color).join(' ; ') } })
console.log('dayline', dl, JSON.stringify(dlRed))
L.rec(ID + ' a (day line says Available P red)', size, /red/.test(dl) ? 'PASS' : 'FAIL', `day line reads "${dl}"`, [tag + '-01-open'])
await L.step(w, tag + '-02-ll1', L.T('bid-LL'))
if (await L.vis(P, L.T('bid-picker'))) await L.step(w, tag + '-03-ll2', L.T('bid-LL'))
await P.waitForTimeout(500)
const bub = await P.evaluate(() => {
  const b = document.querySelector('[data-testid="manning-bubble"], [data-testid="manning-bubble-foot"]'); if (!b) return null
  const r = b.getBoundingClientRect(); const mb = document.querySelector('[data-testid="counts-toggle"]')
  const mr = mb ? mb.getBoundingClientRect() : null
  return { text: b.innerText.replace(/\s+/g, ' ').trim(), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), vh: innerHeight, manning: mr && { y: Math.round(mr.top), b: Math.round(mr.bottom), inView: mr.bottom > 0 && mr.top < innerHeight } }
})
console.log('bubble', JSON.stringify(bub))
await L.shot(w, tag + '-04-bubble')
const where = bub ? (bub.y > bub.vh / 2 ? 'at the foot' : 'under Manning') : 'none'
L.rec(ID + ' b (bubble after placing)', size, bub && /Available P red/.test(bub.text) ? 'PASS' : 'FAIL', `bubble "${bub?.text}" ${where} (y ${bub?.y} of ${bub?.vh}; Manning button ${JSON.stringify(bub?.manning)})`, [tag + '-04-bubble'])
if (bub && /Show/.test(bub.text)) {
  const showBtn = P.locator('[data-testid="manning-bubble"] button, [data-testid="manning-bubble"] [role=button], [data-testid="manning-bubble-show"]').first()
  console.log('show buttons', await showBtn.count())
  if (await showBtn.count()) { await L.step(w, tag + '-05-show', '[data-testid="manning-bubble"] button, [data-testid="manning-bubble"] [role=button], [data-testid="manning-bubble-show"]'); await P.waitForTimeout(500); await L.shot(w, tag + '-06-after-show') }
}
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
