/* Scenario 12 — change first, then publish: a draft day's only copy moves at once, and becomes the Original unchanged. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '12', WED = 2
const sumTypes = r => A.sec(r, /Conflicts by type/i).reduce((n, x) => n + +x.replace(/^.*\D(\d+)$/, '$1'), 0)
const figs = r => `Sorties ${A.tile(r, /Sorties/i)} · Formations ${A.tile(r, /Formations/i)} · Aircrew ${A.tile(r, /Aircrew/i)} · issues ${A.tile(r, /warning/i)} · "${A.byDay(r, 'Tue')}" · "${A.byDay(r, 'Wed')}" · Anvil idle ${A.idleHas(r, 'Anvil')}`
await A.run(S, async p => {
  await A.toEdit(p)
  const pub = await A.pubOrig(p, TUE)
  /* Tuesday gets a waiting change of its own, to prove it does not leak into Wednesday's figures */
  await W.boardOn(p, TUE)
  const tcx = await A.cxLine(p, '1.0.0.1')
  await W.boardOff(p)
  const fT = await A.face(p, TUE)
  const i0 = await A.insPic(p, 's12-a-start', 'both')
  judge(`${S}.a`, `Tuesday signed and ${pub.r.label}, then CX on one Tuesday line left waiting (${tcx}); Wednesday left a draft; Insights`, [
    ['Tuesday pending, Wednesday draft', A.isPending(fT) && /DRAFT/.test((await A.face(p, WED)).tag), A.faceLine(fT)],
    ['the window still counts Tuesday as issued (8 sorties)', /^Tuesday 8 sorties · 4 formations/.test(A.byDay(i0, 'Tue')), A.byDay(i0, 'Tue')],
    ['Wednesday reads 8 sorties · 4 formations', /^Wednesday 8 sorties · 4 formations/.test(A.byDay(i0, 'Wed')), A.byDay(i0, 'Wed')],
  ], i0.shots)

  /* 1. a seat */
  await W.boardOn(p, WED)
  const put = await A.seatPut(p, '2.1.1.1.p', 'shaft')      /* Anvil onto Nomad's seat (Wed Go 2, no. 2 of the second formation) */
  await W.boardOff(p)
  const i1 = await A.insPic(p, 's12-b-wed-seat', 'foot')
  judge(`${S}.b`, `Wednesday (draft) board: Anvil dragged onto Nomad's seat (${JSON.stringify(put)}); ✓ Done; Insights`, [
    ['the seat took him', put.took, put],
    ['Anvil leaves the idle list at once', A.idleHas(i0, 'Anvil') && !A.idleHas(i1, 'Anvil')],
    ['the window moved', !A.same(i0, i1), A.diffText(i0, i1)],
    ['Tuesday\'s row did not move', A.byDay(i0, 'Tue') === A.byDay(i1, 'Tue'), A.byDay(i1, 'Tue')],
  ], i1.shots)

  /* 2. a formation cancelled (both of its lines) */
  await W.boardOn(p, WED)
  const c1 = await A.cxLine(p, '2.0.1.0'), c2 = await A.cxLine(p, '2.0.1.1')
  const shot2 = await pic(p, 's12-c-wed-board-cancelled')
  await W.boardOff(p)
  const i2 = await A.insPic(p, 's12-c-wed-formation-cancelled', 'both')
  judge(`${S}.c`, `Wednesday board: CX on both lines of Go 1's RU formation (${c1}; ${c2}); ✓ Done; Insights`, [
    ['Sorties two fewer at once', +A.tile(i2, /Sorties/i) === +A.tile(i1, /Sorties/i) - 2, `${A.tile(i1, /Sorties/i)} → ${A.tile(i2, /Sorties/i)}`],
    ['Formations one fewer at once', +A.tile(i2, /Formations/i) === +A.tile(i1, /Formations/i) - 1, `${A.tile(i1, /Formations/i)} → ${A.tile(i2, /Formations/i)}`],
    ['By day: Wednesday 6 sorties · 3 formations', /^Wednesday 6 sorties · 3 formations/.test(A.byDay(i2, 'Wed')), A.byDay(i2, 'Wed')],
    ['Tuesday\'s row did not move', A.byDay(i0, 'Tue') === A.byDay(i2, 'Tue'), A.byDay(i2, 'Tue')],
  ], [shot2, ...i2.shots])

  /* 3. a time */
  await W.boardOn(p, WED)
  await A.boxText(p, 'ff:2.1.0.to', '15:00'); await A.boxText(p, 'ff:2.1.0.ld', '16:25')
  await W.boardOff(p)
  const i3 = await A.insAt(p, 's12-d-wed-time-moved-trident-bar', 'Trident')
  judge(`${S}.d`, 'Wednesday board: Go 2 VL T/O 13:00→15:00, LD 14:25→16:25; ✓ Done; Insights', [
    ['Work hours moved at once for the men on that formation (Trident)', A.hoursOf(i2, 'Trident') !== A.hoursOf(i3, 'Trident'), `${A.hoursOf(i2, 'Trident')} → ${A.hoursOf(i3, 'Trident')}`],
    ['Tuesday\'s row did not move', A.byDay(i0, 'Tue') === A.byDay(i3, 'Tue'), A.byDay(i3, 'Tue')],
  ], i3.shots)
  row(`${S}.d+`, 'what moved in the window with the time', A.diffText(i2, i3), 'RECORDED')

  /* 4. a Wednesday warning hidden */
  await A.toEdit(p); await A.openList(p, '#eWeek', WED)
  const wl = await A.readList(p, '#eWeek', WED)
  const first = (wl.lines || []).find(l => l.btn === '✕')
  const tap = first ? await A.tapLine(p, '#eWeek', WED, first.ix) : 'no line with ✕'
  const wl2 = await A.readList(p, '#eWeek', WED)
  const shot4 = await pic(p, 's12-e-wed-hide-day')
  const i4 = await A.insPic(p, 's12-e-wed-hidden', 'foot')
  judge(`${S}.e`, `Wednesday's issues list on Edit Schedule: ✕ on "${first ? first.text.slice(0, 60) : ''}" (${tap}); Insights`, [
    ['the line is struck in Wednesday\'s list', (wl2.lines || []).some(l => l.struck), A.short(wl2)],
    ['Wednesday one issue fewer at once', A.num(A.byDay(i4, 'Wed')) === A.num(A.byDay(i3, 'Wed')) - 1, `${A.byDay(i3, 'Wed')} → ${A.byDay(i4, 'Wed')}`],
    ['the week tile one fewer', +A.tile(i4, /warning/i) === +A.tile(i3, /warning/i) - 1, `${A.tile(i3, /warning/i)} → ${A.tile(i4, /warning/i)}`],
    ['Insights Wednesday = Wednesday\'s own bar', A.num(A.byDay(i4, 'Wed')) === A.nIssues(wl2), `${A.byDay(i4, 'Wed')} / ${wl2.bar}`],
    ['the tile = the sum of the types', +A.tile(i4, /warning/i) === sumTypes(i4), `${A.tile(i4, /warning/i)} / ${sumTypes(i4)}`],
    ['Tuesday\'s row did not move', A.byDay(i0, 'Tue') === A.byDay(i4, 'Tue'), A.byDay(i4, 'Tue')],
  ], [shot4, ...i4.shots])

  /* publish Wednesday: the same figures, now backed by Original */
  const pw = await A.pubOrig(p, WED)
  const fW = await A.face(p, WED)
  const i5 = await A.insPic(p, 's12-f-wed-published', 'both')
  const fT2 = await A.face(p, TUE)
  judge(`${S}.f`, `Wednesday signed and "${pw.r.label || pw.r.why}"; Insights`, [
    ['Wednesday reads Original', /ORIG/.test(fW.tag), A.faceLine(fW)],
    ['the window is word for word what it was before publishing Wednesday', A.same(i4, i5), A.diffText(i4, i5)],
    ['Tuesday is still pending and still counted as issued (8 sorties)', A.isPending(fT2) && /^Tuesday 8 sorties/.test(A.byDay(i5, 'Tue')), `${fT2.pending} · ${A.byDay(i5, 'Tue')}`],
  ], i5.shots)
  row(`${S}.sum`, 'start · seat · formation CX · time · hide · Wednesday published', [i0, i1, i2, i3, i4, i5].map(figs).join(' ;; '), 'RECORDED')
})
