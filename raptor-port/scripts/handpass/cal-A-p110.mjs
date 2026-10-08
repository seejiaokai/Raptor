import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const o = {}
const D = '2026-07-14'
const sansRead = async tag => {
  await H.openSans(w); await H.sansGoto(w, D)
  const cell = await H.sansCell(w, D)
  await H.sansOpen(w, D)
  const day = await H.sansDayRead(w)
  const pic = await H.pic(w, 'p110-sans-' + tag)
  await H.sansClose(w)
  return { cell, day, pic }
}
await H.warOpen(w)
await H.typeReq(w, 'p', D, 40); await H.typeReq(w, 'w', D, 30)       // positive requirements, this day only
await H.openSans(w)
o.filed = await H.sansFile(w, D, 'Zenith', { f: true, o: true, a: true })   // a pilot F + O + A (the demo already holds Zulu F+O+A and Rebel F on this day)
await H.sansClose(w)
o.before = await sansRead('before-nf')
o.beforeWar = await H.warText(w, D)
await H.warOpen(w); o.beforeWork = await H.warWork(w, 'p', D); await H.warWorkClose(w)
// the day to no-fly through the Calendar month
await H.calOpenFromWar(w)
await H.calSet(w, D, 'nf')
o.calNF = await H.calRead(w, D)
await H.calClose(w)
o.nfWar = await H.warText(w, D)
o.nfWork = await H.warWork(w, 'p', D)
const p0 = await H.pic(w, 'p110-war-nf')
await H.warWorkClose(w)
o.nfWorkW = await H.warWork(w, 'w', D); await H.warWorkClose(w)
o.nf = await sansRead('nf')
// Undo in the top bar
await H.undo(w)
o.afterFirstUndoCls = (await H.bridge(w, D)).a.cls
if (w.touch) await H.undo(w)   // a phone's one button steps day to night to no-fly: two presses, two Undo steps
o.afterUndoFacts = (await H.bridge(w, D)).a
await H.warOpen(w); await H.warJump(w, D)
o.afterUndoWar = await H.warText(w, D)
o.afterUndoWork = await H.warWork(w, 'p', D)
const p1 = await H.pic(w, 'p110-war-undo')
await H.warWorkClose(w)
o.afterUndo = await sansRead('undo')
await H.calOpenFromSans(w, D)
o.calUndo = await H.calRead(w, D)
await H.calClose(w)
const b = o.before, n = o.nf, u = o.afterUndo
H.judge('P1-10', `${SIZE}: Tue 14 Jul 26: Required P 40 / W 30 typed; Zenith filed F+O+A (the demo already holds Zulu F+O+A, Rebel F); the day set to no-fly in Calendar; read on the Leave War row and working box, SANS month and opened day; then Undo in the top bar and read again`, [
  ['the filing went through', !o.filed.stillOpen, o.filed],
  [`before: positive need on both (cell "${b.cell.need}"), O and A offers drawn (${b.cell.o} | ${b.cell.a})`, /^[1-9]\d* [1-9]\d*$/.test(b.cell.need) && /^O [1-9]/.test(b.cell.o) && /^A [1-9]/.test(b.cell.a), [b.cell.need, b.cell.f, b.cell.o, b.cell.a]],
  ['Calendar shows NF lit; the Leave War row reads NF on both seats', o.calNF.lit === 'NF' && o.nfWar.reqP === 'NF' && o.nfWar.reqW === 'NF', [o.calNF.lit, o.nfWar.reqP, o.nfWar.reqW]],
  ['NF on the SANS month: NF tag, still needed 0 and 0 (no flying shortage)', n.cell.tag === 'NF' && n.cell.need === '0 0' && /Still needed: 0 pilots, 0 WSOs/.test(n.cell.label), [n.cell.tag, n.cell.need, n.cell.label]],
  ['NF: the O and A offers remain visible and unchanged', n.cell.o === b.cell.o && n.cell.a === b.cell.a, [b.cell.o, n.cell.o, b.cell.a, n.cell.a]],
  ['NF opened day: Required NF on both seats, Still needed zero; the offers are still listed', /^NF/.test(n.day.req[0]) && /^NF/.test(n.day.req[1]) && eq(n.day.need, ['0', '0']) && n.day.list === b.day.list, [n.day.req, n.day.need]],
  ['NF working box on the Leave War says NF and Still needed 0', /Required NF/.test(o.nfWork) && /Still needed 0$/.test(o.nfWork), o.nfWork],
  ['one Undo takes back exactly the last step (desk: no-fly back to day; phone: no-fly back to night, since its button took two presses)', o.afterFirstUndoCls === (w.touch ? 'night' : 'day'), o.afterFirstUndoCls],
  ['Undo restores the day class (day) and the typed figures 40 / 30', o.afterUndoFacts.cls === 'day' && o.afterUndoWar.reqP === '40' && o.afterUndoWar.reqW === '30' && o.calUndo.lit === 'D', [o.afterUndoFacts.cls, o.afterUndoWar.reqP, o.afterUndoWar.reqW, o.calUndo.lit]],
  ['Undo restores the need: SANS cell, opened day and working box equal the before readings', u.cell.need === b.cell.need && eq(u.day.need, b.day.need) && o.afterUndoWork === o.beforeWork, [b.cell.need, u.cell.need, o.beforeWork, o.afterUndoWork]],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [b.pic, p0, n.pic, p1, u.pic])
H.savePart('P1-10-' + SIZE, { out: o })
await H.closeAll(w)
