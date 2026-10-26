// lw-q6-half-am — Q6 redrawn (24 Oct 26). Q6 (b) had the lit leave button read "<LL" for a morning, captioned as "the
// grid box's own code" — checked this day, the grid draws a lone morning as "LL" in the TOP HALF of the cell, no arrow
// (`<span class="c k-ll s-a top">LL</span>`), so (b) is withdrawn. (c): the window opens with the day's own half lit in
// the Duration row (AM for a morning, PM for an afternoon) beside the ringed LL — the half said by the row that sets it,
// no new code, nothing added to the title. Drifter, Fri 6 Nov, a morning LL; the AM pick made with the app's own button.
// Usage: PORT=4320 node scripts/handpass/lw-q6-half-am.mjs
import * as L from './lw-declutter-lib.mjs'
import { transform, reorder } from './lw-declutter-mock.mjs'
import path from 'node:path'
console.log('lw-q6-half-am v1')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-declutter')
const w = await L.newCtx('phone'); const P = w.page
await L.signInPlain(w, 'admin')
const who = await P.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Drifter')?.[0])
const HALF = '2026-11-06'
await L.openCellR(w, who, HALF); await L.press(w, L.T('portion-am')); await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500); await L.closeAny(w)
await L.cellShot(w, who, HALF, 'q6c-cell')
await L.openCellR(w, who, HALF)
await transform(P, { p: 'bid', admin: true, lit: 'LL' }); await reorder(P, 'bid')
await L.press(w, L.T('portion-am')); await P.waitForTimeout(300)
/* re-apply the fragile part after the press re-rendered the window (the mock-ups guide's first trap) */
await transform(P, { p: 'bid', admin: true, lit: 'LL' }); await reorder(P, 'bid')
const am = await P.evaluate(() => { const b = document.querySelector('[data-testid="portion-am"]'); return b ? b.className + ' ' + (b.getAttribute('aria-pressed') || '') : null })
console.log('AM button now', am)
const clip = await P.evaluate(() => {
  const s = document.querySelector('.bidsheet').getBoundingClientRect(), g = document.querySelector('.bidsheet [data-testid="bid-leave-grid"]').getBoundingClientRect()
  return { x: s.left - 4, y: Math.max(0, s.top - 4), width: s.width + 8, height: g.bottom - s.top + 14 }
})
await P.mouse.move(1, 1)
await P.screenshot({ path: path.join(OUT, 'q6-half-am.png'), clip, scale: 'device' })
await L.closeAny(w)
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
