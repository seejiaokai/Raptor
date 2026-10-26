// lw-q6-now — his question (24 Oct 26, "Q6 is the word NOW needed?"): the title's "NOW LL" beside round 3's lit leave
// button (change 7), on a WHOLE day and on a HALF day — the case the ring cannot tell (a morning LL lights the same LL
// button as a whole day). Three pictures each, cut to the title and the leave buttons: today; change 7 as drawn (the code
// gone); the word gone, the box's own code kept ("<LL"). Usage: PORT=4174 node scripts/handpass/lw-q6-now.mjs
import * as L from './lw-declutter-lib.mjs'
import { transform, reorder } from './lw-declutter-mock.mjs'
import path from 'node:path'
console.log('lw-q6-now v2')
const OUT = path.resolve('docs/img/handpass/2026-10-24-lw-declutter')
const w = await L.newCtx('phone')
const P = w.page
await L.signInPlain(w, 'admin')
const who = await P.evaluate(() => Object.entries(window.PEOPLE || {}).find(([, v]) => v.cs === 'Drifter')?.[0])
const WHOLE = '2026-11-05', HALF = '2026-11-06'
/* the two days, placed through the window: a whole-day LL, and a morning LL (AM, then LL) */
await L.openCellR(w, who, WHOLE); await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500); await L.closeAny(w)
await L.openCellR(w, who, HALF); await L.press(w, L.T('portion-am')); await L.press(w, L.T('bid-LL')); await P.waitForTimeout(500); await L.closeAny(w)
const clip = () => P.evaluate(() => {
  const s = document.querySelector('.bidsheet').getBoundingClientRect(), g = document.querySelector('.bidsheet [data-testid="bid-leave-grid"]').getBoundingClientRect()
  return { x: s.left - 4, y: Math.max(0, s.top - 4), width: s.width + 8, height: g.bottom - s.top + 14 }
})
for (const [day, tag] of [[WHOLE, 'whole'], [HALF, 'half']]) {
  await L.openCellR(w, who, day)
  const cur = await L.txt(P, '.bidsheet-hd .cur')
  console.log(tag, 'title now reads', JSON.stringify(cur))
  await P.screenshot({ path: path.join(OUT, `q6-${tag}-today.png`), clip: await clip(), scale: 'device' })
  const code = (cur || '').replace(/^now\s*/i, '')
  await transform(P, { p: 'bid', admin: true, lit: 'LL' }); await reorder(P, 'bid')
  await P.screenshot({ path: path.join(OUT, `q6-${tag}-ring.png`), clip: await clip(), scale: 'device' })
  /* the word gone, the box's own code kept after the date, in the title's quiet grey */
  await P.evaluate(code => { const dt = document.querySelector('.bidsheet-hd .dt'); const c = document.createElement('span'); c.className = 'cur mock-new'; c.textContent = code; c.style.textTransform = 'none'; c.style.fontSize = '12px'; dt.after(c) }, code)
  await P.screenshot({ path: path.join(OUT, `q6-${tag}-code.png`), clip: await clip(), scale: 'device' })
  /* (b) the code out of the title again; the lit button reads the box's own code while lit ("<LL" on a morning) */
  await P.evaluate(code => { document.querySelector('.bidsheet-hd .cur.mock-new')?.remove(); const b = document.querySelector('.bidsheet .mock-lit .lv-code'); if (b) b.textContent = code }, code)
  await P.screenshot({ path: path.join(OUT, `q6-${tag}-button.png`), clip: await clip(), scale: 'device' })
  await L.closeAny(w)
}
/* a day holding TWO entries (the demo's Casper, Thu 5 Feb: a morning LL and an afternoon HO award) opens the day's list */
await L.openCellR(w, 'casper', '2026-02-05')
{ const b = await P.evaluate(() => { const e = [...document.querySelectorAll('[data-testid="daylist"], .bidsheet')].pop(); const r = e.getBoundingClientRect(); return { x: r.left - 4, y: Math.max(0, r.top - 4), width: r.width + 8, height: r.height + 8 } })
  await P.screenshot({ path: path.join(OUT, 'q6-two-today.png'), clip: b, scale: 'device' }) }
await L.closeAny(w)
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
