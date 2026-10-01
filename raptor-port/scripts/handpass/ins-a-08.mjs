/* Scenario 8 — a cancelled aircraft line and a cancelled formation obey the same boundary. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '8'
const figs = r => `Sorties ${A.tile(r, /Sorties/i)} · Formations ${A.tile(r, /Formations/i)} · Aircrew flying ${A.tile(r, /Aircrew/i)} · ${A.flyLoad(r, 'Hex')} · "${A.byDay(r, 'Tue')}"`
const sumDay = (r, re) => A.sec(r, /By day/i).reduce((n, x) => n + +(re.exec(x) || [0, 0])[1], 0)
await A.run(S, async p => {
  await A.toEdit(p)
  const pub = await A.pubOrig(p, TUE)
  const i0 = await A.insPic(p, 's8-a-orig', 'both')
  row(`${S}.a`, `Tuesday signed and ${pub.r.label}; Insights on Edit Schedule`, figs(i0), 'RECORDED', i0.shots)

  await W.boardOn(p, TUE)
  const c1 = await A.cxLine(p, '1.0.0.1', 'WX')          /* one aircraft line: Go 1 VL no. 2 (Outlaw / Hex) */
  const c2 = await A.cxLine(p, '1.1.1.0')                /* a whole formation: Go 2 RU, both its lines (the board has no formation-level CX — a formation is cancelled when every one of its lines is) */
  const c3 = await A.cxLine(p, '1.1.1.1')
  const cxs = await p.evaluate(() => ({ line: !!window.DAYS[1].waves[0].formations[0].aircraft[1].cx, form: !!window.DAYS[1].waves[1].formations[1].cx }))
  const shot1 = await pic(p, 's8-b-board-cancelled')
  await W.boardOff(p)
  const f1 = await A.face(p, TUE)
  const i1 = await A.insPic(p, 's8-b-waiting-insights', 'both')
  await A.reloadAs(p, 'a')
  const f1r = await A.face(p, TUE)
  const i1r = await A.insNow(p)
  judge(`${S}.b`, `board: CX on Go 1's VL no. 2 line with reason WX (${c1}); CX on both lines of Go 2's RU formation (${c2}; ${c3}); ✓ Done; Insights; reload; Insights`, [
    ['the working copy holds a cancelled line and a cancelled formation', cxs.line && cxs.form, cxs],
    ['Tuesday is pending', A.isPending(f1) && /AL1/.test(f1.alpub), A.faceLine(f1)],
    ['nothing in the window moved', A.same(i0, i1), A.diffText(i0, i1)],
    ['after the reload Tuesday is still pending', A.isPending(f1r), A.faceLine(f1r)],
    ['after the reload the window is still the same', A.same(i0, i1r), A.diffText(i0, i1r)],
  ], [shot1, ...i1.shots])

  const al = await A.pubAL(p, TUE)
  const f2 = await A.face(p, TUE)
  const i2 = await A.insPic(p, 's8-c-AL1', 'both')
  judge(`${S}.c`, `Tuesday signed and "${al.r.label || al.r.why}"; Insights`, [
    ['Tuesday reads AL1, nothing pending', /AL1/.test(f2.tag) && !A.isPending(f2), A.faceLine(f2)],
    ['Sorties 32 → 29 (one line + a two-ship)', A.tile(i0, /Sorties/i) === '32' && A.tile(i2, /Sorties/i) === '29', A.tile(i2, /Sorties/i)],
    ['Formations 16 → 15 (only the whole formation)', A.tile(i0, /Formations/i) === '16' && A.tile(i2, /Formations/i) === '15', A.tile(i2, /Formations/i)],
    ['By day: Tuesday 5 sorties · 3 formations', /^Tuesday 5 sorties · 3 formations/.test(A.byDay(i2, 'Tue')), A.byDay(i2, 'Tue')],
    ['the week tiles equal the sum of the days', +A.tile(i2, /Sorties/i) === sumDay(i2, /(\d+) sorties/) && +A.tile(i2, /Formations/i) === sumDay(i2, /(\d+) formations/), `days: ${sumDay(i2, /(\d+) sorties/)} sorties, ${sumDay(i2, /(\d+) formations/)} formations`],
    ['Hex\'s flying load 3 → 2', /3$/.test(A.flyLoad(i0, 'Hex')) && /2$/.test(A.flyLoad(i2, 'Hex')), `${A.flyLoad(i0, 'Hex')} → ${A.flyLoad(i2, 'Hex')}`],
    ['the four who flew only that formation join the idle list', ['Rebel', 'Cinder', 'Vapor', 'Marlin'].every(c => A.idleHas(i2, c) && !A.idleHas(i0, c))],
    ['Aircrew flying 38 → 34', A.tile(i0, /Aircrew/i) === '38' && A.tile(i2, /Aircrew/i) === '34', A.tile(i2, /Aircrew/i)],
  ], i2.shots)
  row(`${S}.c+`, 'everything that moved in the window at AL1', A.diffText(i0, i2), 'RECORDED')
})
