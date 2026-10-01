/* Scenario 4 — looking at Original while AL1 is current must not redirect Insights to the look. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '4'
await A.run(S, async p => {
  await A.toEdit(p)
  await A.pubOrig(p, TUE)
  const i0 = await A.insNow(p)
  await W.boardOn(p, TUE)
  const put = await A.seatPut(p, '1.1.1.0.p', 'shaft')
  const cx = await A.cxLine(p, '1.0.0.1')
  await W.boardOff(p)
  const al = await A.pubAL(p, TUE)
  const f1 = await A.face(p, TUE)
  const i1 = await A.insPic(p, 's4-a-AL1-live', 'both')
  judge(`${S}.a`, `Tuesday published; on the board Anvil put on Rebel's seat (${put.took}) and CX on Go 1's VL no. 2 line (${cx}); signed and "${al.r.label}"; Insights on Edit Schedule`, [
    ['Tuesday reads AL1, nothing pending', /AL1/.test(f1.tag) && !A.isPending(f1), A.faceLine(f1)],
    ['AL1 differs from Original in the window (Sorties 32 → 31, Tuesday 8 → 7)', A.tile(i0, /Sorties/i) === '32' && A.tile(i1, /Sorties/i) === '31' && /7 sorties/.test(A.byDay(i1, 'Tue')), `${A.tilesLine(i1)} · ${A.byDay(i1, 'Tue')}`],
    ['Anvil is off the idle list, Rebel on it', !A.idleHas(i1, 'Anvil') && A.idleHas(i1, 'Rebel')],
  ], i1.shots)

  /* the look at Original, from the day's own plans picker on Edit Schedule */
  const lk = await A.look(p, TUE, /^Original/)
  const lf = await A.lookFace(p, TUE)
  const shotL = await pic(p, 's4-b-look-original-day')
  const seatShown = await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="1"]'); const has = id => [...d.querySelectorAll(`.puck[data-person="${id}"]`)].some(e => e.offsetParent !== null); return has('romeo') && !has('shaft') ? 'romeo' : 'not Original: Rebel ' + has('romeo') + ', Anvil ' + has('shaft') })
  const i2 = await A.insPic(p, 's4-b-look-original-insights', 'both')
  judge(`${S}.b`, `Tuesday's plans picker → "${lk.label || lk.err}" (read-only look); Insights opened beside it`, [
    ['the day says it is showing Original', /Original/i.test(lf ? lf.bar + ' ' + lf.sel : ''), lf],
    ['the day is drawing Original (Rebel back on the seat)', seatShown === 'romeo', seatShown],
    ['the window is on top at its centre', i2.top === true],
    ['the window still counts AL1 — word for word what it said before the look', A.same(i1, i2), A.diffText(i1, i2)],
    ['Sorties still 31', A.tile(i2, /Sorties/i) === '31', A.tilesLine(i2)],
  ], [shotL, ...i2.shots])

  const back = await A.backLive(p, TUE)
  const f3 = await A.face(p, TUE)
  const i3 = await A.insPic(p, 's4-c-back-live', 'top')
  judge(`${S}.c`, `"Back to live copy" (${back}); Insights again`, [
    ['the window is identical to before and during the look', A.same(i1, i3), A.diffText(i1, i3)],
    ['the day is AL1, nothing pending — the look changed nothing', /AL1/.test(f3.tag) && !A.isPending(f3), A.faceLine(f3)],
  ], i3.shots)

  /* the same look taken from the board's picker; the board has no Insights door (scenario 1), so the window is read on Edit Schedule after ✓ Done */
  await W.boardOn(p, TUE)
  const lb = await A.look(p, TUE, /^Original/, '#schedBoard')
  const shotB = await pic(p, 's4-d-board-look-original')
  const boardBar = await p.evaluate(() => { const b = document.querySelector('#schedBoard .dprev-bar, #schedBoard [data-golive]'); return b ? (b.closest('.dprev-bar') || b).innerText.replace(/\s+/g, ' ').trim().slice(0, 140) : '(no look bar on the board)' })
  await W.boardOff(p)
  const stillLook = await p.locator('#eWeek [data-golive="1"]:visible').count()
  const i4 = await A.insPic(p, 's4-d-after-board-look', 'top')
  judge(`${S}.d`, `the board's plans picker → "${lb.label || lb.err}" (board says: ${boardBar}); ✓ Done; Insights on Edit Schedule (the look ${stillLook ? 'is still showing' : 'has closed'})`, [
    ['the window is identical to AL1', A.same(i1, i4), A.diffText(i1, i4)],
  ], [shotB, ...i4.shots])
  if (stillLook) await A.backLive(p, TUE)
})
