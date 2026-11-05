// The night of 5–6 Nov 26, job 1 — [LW-NIGHT1025-OLDER] (d): the host's short walk on the shared helpers before the walker
// starts (walk-scripts §1). A leave placed by a tap in the one-day window, then a second tap ~170 ms later at the place the
// LL button stood: on the fixed build nothing opens behind the closed window. Records the second tap's target, what opened,
// and whether the bid landed. Run from raptor-port:  SIZE=desk|phone  [ENGINE=webkit|chromium]  node scripts/handpass/lw-f1106-host.mjs
process.env.LW_OUT ||= '2026-11-06-lw-faults/host'
import { mkdirSync } from 'node:fs'
const L = await import('./lw-fx1031-lib.mjs')
mkdirSync(L.OUT, { recursive: true })
const SIZE = L.SIZE
console.log('[lw-f1106-host v2]', SIZE, 'build', L.DIST, 'today', L.TODAY)
const w = await L.newWorld(SIZE === 'phone' ? 'phone' : 'desk')
if (process.env.ENGINE === 'chromium' && SIZE === 'phone') console.log('  (ENGINE ignored: newWorld picks the engine by size)')
await L.signInSaved(w, 'admin'); await L.toWar(w); await L.openGrid(w)
const P = w.page
const id = await L.pidOf(P, 'Drifter')
const D = L.day(9)
await L.openCell(w, id, D)
await L.autoApprove(w, false)
const ll = await L.centre(P, L.T('bid-LL'))
const before = await L.cellWords(w, id, D)
/* the double tap: the first tap places LL and closes the window; the second, ~170 ms later, lands where LL stood */
/* on a desktop a person's double click: the browser counts the second click as a double (detail 2) */
let under = null
if (!w.phone) await P.mouse.dblclick(ll.x, ll.y, { delay: 40 })
else {
  await L.finger(w, ll.x, ll.y)
  await P.waitForTimeout(110)
  under = await P.evaluate(({ x, y }) => { const h = document.elementFromPoint(x, y); return h ? (h.closest('[data-testid]')?.getAttribute('data-testid') || h.className || h.tagName) : null }, ll)
  await L.finger(w, ll.x, ll.y, `dt-${SIZE}-quick`)
}
await P.waitForTimeout(700)
const opened = await P.evaluate(() => ['bid-picker', 'person-window', 'sel-sheet', 'win-lwday'].filter(t => { const e = document.querySelector(`[data-testid="${t}"]`); return !!e && e.getBoundingClientRect().height > 0 })
  .concat(document.querySelector('.qualpop') ? ['qualpop'] : []))
await L.shot(w, `dt-${SIZE}-settled`)
const after = await L.cellWords(w, id, D)
console.log(JSON.stringify({ D, before, after, secondTapLandedOn: under, openedAfter: opened, errs: w.errs }, null, 1))
await L.closeBrowser()
