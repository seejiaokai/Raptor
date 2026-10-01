/* Scenario 15 — Unpublish and "Load onto working copy" keep "latest published" literal. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '15'
const seat = p => p.evaluate(() => window.DAYS[1].waves[1].formations[1].aircraft[0].p)
const cxd = p => p.evaluate(() => !!window.DAYS[1].waves[0].formations[0].aircraft[1].cx)
async function fixture(p) {
  await A.toEdit(p)
  await A.pubOrig(p, TUE)
  const i0 = await A.insNow(p)
  await W.boardOn(p, TUE)
  await A.seatPut(p, '1.1.1.0.p', 'shaft')
  await A.cxLine(p, '1.0.0.1')
  await W.boardOff(p)
  const al = await A.pubAL(p, TUE)
  return { i0, al }
}
/* A — as she wrote it: look at Original, Load onto working copy, reload, then Unpublish AL1 */
await A.run(S + 'A', async p => {
  const { i0, al } = await fixture(p)
  const f1 = await A.face(p, TUE)
  const i1 = await A.insPic(p, 's15-a-AL1', 'both')
  judge(`${S}.a`, `Tuesday published; board: Anvil on Rebel's seat + CX on Go 1's VL no. 2; signed and "${al.r.label}"; Insights`, [
    ['Tuesday reads AL1', /AL1/.test(f1.tag) && !A.isPending(f1), A.faceLine(f1)],
    ['Original and AL1 differ in the window (32 → 31 sorties; Anvil / Rebel swap on the idle list)', A.tile(i0, /Sorties/i) === '32' && A.tile(i1, /Sorties/i) === '31' && A.idleHas(i0, 'Anvil') && !A.idleHas(i1, 'Anvil'), A.diffText(i0, i1).slice(0, 300)],
  ], i1.shots)

  const lk = await A.look(p, TUE, /^Original/)
  const ld = await A.load(p, TUE, { confirm: true })
  await L.sleep(400)
  const shotL = await A.facePic(p, TUE, 's15-b-loaded-day')
  await A.reloadAs(p, 'a')
  const f2 = await A.face(p, TUE), s2 = await seat(p), c2 = await cxd(p)
  const i2 = await A.insPic(p, 's15-b-loaded-insights', 'both')
  const v2 = await A.vface(p, TUE)
  judge(`${S}.b`, `plans picker → "${lk.label || lk.err}" (read-only look) → "${ld.said.join('" → "')}"; reload; Insights`, [
    ['the working copy now holds Original\'s content (Rebel on the seat, the line not cancelled)', s2 === 'romeo' && !c2, { seat: s2, cancelled: c2 }],
    ['Tuesday is still AL1 and is pending', /AL1/.test(f2.tag) && A.isPending(f2), A.faceLine(f2)],
    ['Insights is still AL1, word for word', A.same(i1, i2), A.diffText(i1, i2)],
    ['View-only Sched still reads AL1', /AL1/.test(v2.tag), v2],
  ], [shotL, ...i2.shots])

  await A.toEdit(p); await W.showDay(p, TUE)
  const un = await W.unpublish(p, TUE)
  const shotU = await A.facePic(p, TUE, 's15-c-unpublished-day')
  const f3 = await A.face(p, TUE)
  const i3 = await A.insPic(p, 's15-c-unpublished-insights', 'both')
  const v3 = await A.vface(p, TUE)
  judge(`${S}.c`, `Tuesday's "Unpublish" (${JSON.stringify(un)}); Insights`, [
    ['Tuesday reads Original — AL1 is no longer the latest', /ORIG/.test(f3.tag), A.faceLine(f3)],
    ['Insights is back to the Original, word for word', A.same(i0, i3), A.diffText(i0, i3)],
    ['View-only Sched reads Original', /ORIG/.test(v3.tag), v3],
  ], [shotU, ...i3.shots])
  row(`${S}.c+`, 'the day after the Unpublish (the working copy was loaded with Original\'s content before it)', A.faceLine(f3), 'RECORDED')
})
/* B — the plain Unpublish: AL1 current, the working copy = AL1; Unpublish makes Original the latest while AL1's edits wait */
await A.run(S + 'B', async p => {
  const { i0 } = await fixture(p)
  const i1 = await A.insNow(p)
  await A.toEdit(p); await W.showDay(p, TUE)
  const un = await W.unpublish(p, TUE)
  const f = await A.face(p, TUE), s = await seat(p), c = await cxd(p)
  const shot = await A.facePic(p, TUE, 's15-d-plain-unpublish-day')
  const i2 = await A.insPic(p, 's15-d-plain-unpublish-insights', 'both')
  judge(`${S}.d`, `same fixture, no load: Tuesday's "Unpublish" (${JSON.stringify(un)}) while AL1 is current; Insights`, [
    ['Tuesday reads Original', /ORIG/.test(f.tag), A.faceLine(f)],
    ['the AL1-shaped edits remain on the working copy, pending (Anvil on the seat, the line cancelled)', s === 'shaft' && c && A.isPending(f), { seat: s, cancelled: c, chip: f.pending }],
    ['Insights reverts to the Original, word for word — not the editable content', A.same(i0, i2), A.diffText(i0, i2)],
    ['…and is no longer AL1\'s', !A.same(i1, i2)],
  ], [shot, ...i2.shots])
  /* and unpublishing the Original itself: the day is a draft, the working copy is its only copy */
  await A.toEdit(p); await W.showDay(p, TUE)
  const un2 = await W.unpublish(p, TUE)
  const f2 = await A.face(p, TUE)
  const i3 = await A.insPic(p, 's15-e-unpublished-to-draft-insights', 'both')
  judge(`${S}.e`, `"Unpublish" once more (${JSON.stringify(un2)}) — Tuesday is a draft again; Insights`, [
    ['Tuesday reads Draft', /DRAFT/.test(f2.tag), A.faceLine(f2)],
    ['the window now counts the working copy at once (31 sorties, Anvil off the idle list)', A.tile(i3, /Sorties/i) === '31' && !A.idleHas(i3, 'Anvil') && A.idleHas(i3, 'Rebel'), `${A.tilesLine(i3)} · ${A.byDay(i3, 'Tue')}`],
  ], i3.shots)
})
