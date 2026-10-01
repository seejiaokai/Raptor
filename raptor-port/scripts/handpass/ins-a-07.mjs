/* Scenario 7 — a man taken off, put back, and replaced: every crew figure moves together, and only at the amendment. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '7', SEAT = '1.1.1.0.p', OLD = 'romeo', NEW = 'shaft'   /* Rebel flies on Tuesday only; Anvil does not fly this week */
const more = r => (A.sec(r, /Flying load/i).find(x => /more flying/.test(x)) || '')
const crew = r => `Aircrew flying ${A.tile(r, /Aircrew/i)} · Sorties ${A.tile(r, /Sorties/i)} · Formations ${A.tile(r, /Formations/i)} · flying-load list "${more(r)}" · idle: Rebel ${A.idleHas(r, 'Rebel') ? 'listed' : 'not listed'}, Anvil ${A.idleHas(r, 'Anvil') ? 'listed' : 'not listed'} · hours ${A.hoursOf(r, 'Rebel')}, ${A.hoursOf(r, 'Anvil')}`
await A.run(S, async p => {
  await A.toEdit(p)
  const pub = await A.pubOrig(p, TUE)
  const i0 = await A.insPic(p, 's7-a-orig', 'both')
  row(`${S}.a`, `Tuesday signed and ${pub.r.label}; Insights on Edit Schedule. (The flying-load list names the twelve busiest only, so a one-sortie man's own bar is never drawn — his flying is read off "Aircrew flying", the "+ N more flying" line, the idle chips and his Work hours.)`, crew(i0), 'RECORDED', i0.shots)

  /* taken off */
  await W.boardOn(p, TUE)
  const off = await A.seatOff(p, SEAT)
  const shot1 = await pic(p, 's7-b-board-seat-empty')
  await W.boardOff(p)
  const f1 = await A.face(p, TUE)
  const i1 = await A.insPic(p, 's7-b-removed-insights', 'foot')
  judge(`${S}.b`, `board: Rebel's puck dragged off his seat onto the crew list (${JSON.stringify(off)}); ✓ Done; Insights`, [
    ['the seat is empty', off.after === '', off],
    ['Tuesday is pending', A.isPending(f1) && /AL1/.test(f1.alpub), A.faceLine(f1)],
    ['Insights is word for word the issued assignment', A.same(i0, i1), A.diffText(i0, i1)],
  ], [shot1, ...i1.shots])

  /* put back: the no-op round trip */
  await W.boardOn(p, TUE)
  const back = await A.seatPut(p, SEAT, OLD)
  await W.boardOff(p)
  const f2 = await A.face(p, TUE)
  const shot2 = await A.facePic(p, TUE, 's7-c-put-back-day')
  const i2 = await A.insNow(p)
  judge(`${S}.c`, `board: Rebel dragged from the crew list back onto the same seat (${JSON.stringify(back)}); ✓ Done; Insights`, [
    ['Rebel is back on the seat', back.took, back],
    ['the exact put-back clears pending (no pending chip, no Publish AL button)', !A.isPending(f2) && !f2.alpub, A.faceLine(f2)],
    ['the sign-offs stand again (no "Not yet signed", the signed line reads Original)', !f2.nys && /SIGNED ORIG/.test(f2.signed), A.faceLine(f2)],
    ['Insights unchanged', A.same(i0, i2), A.diffText(i0, i2)],
  ], [shot2])

  /* replaced */
  await W.boardOn(p, TUE)
  const put = await A.seatPut(p, SEAT, NEW)
  const shot3 = await pic(p, 's7-d-board-replaced')
  await W.boardOff(p)
  const f3 = await A.face(p, TUE)
  const i3 = await A.insPic(p, 's7-d-replaced-waiting-insights', 'foot')
  judge(`${S}.d`, `board: Anvil dragged from the crew list onto Rebel's seat (${JSON.stringify(put)}); ✓ Done; Insights`, [
    ['Anvil is on the seat', put.took, put],
    ['Tuesday is pending', A.isPending(f3), A.faceLine(f3)],
    ['Insights still shows the issued assignment (Anvil idle, Rebel not)', A.same(i0, i3) && A.idleHas(i3, 'Anvil') && !A.idleHas(i3, 'Rebel'), A.diffText(i0, i3)],
  ], [shot3, ...i3.shots])

  const al = await A.pubAL(p, TUE)
  const f4 = await A.face(p, TUE)
  const i4 = await A.insPic(p, 's7-e-AL1', 'both')
  judge(`${S}.e`, `Tuesday signed and "${al.r.label || al.r.why}"; Insights`, [
    ['Tuesday reads AL1, nothing pending', /AL1/.test(f4.tag) && !A.isPending(f4), A.faceLine(f4)],
    ['the two men swap on the idle list', A.idleHas(i4, 'Rebel') && !A.idleHas(i4, 'Anvil')],
    ['their Work hours swap direction (Rebel down, Anvil up)', A.hoursOf(i0, 'Rebel') !== A.hoursOf(i4, 'Rebel') && A.hoursOf(i0, 'Anvil') !== A.hoursOf(i4, 'Anvil'), `${A.hoursOf(i0, 'Rebel')} → ${A.hoursOf(i4, 'Rebel')} ; ${A.hoursOf(i0, 'Anvil')} → ${A.hoursOf(i4, 'Anvil')}`],
    ['Aircrew flying stays (one in, one out)', A.tile(i4, /Aircrew/i) === A.tile(i0, /Aircrew/i), `${A.tile(i0, /Aircrew/i)} → ${A.tile(i4, /Aircrew/i)}`],
    ['Sorties and Formations stay fixed', A.tile(i4, /Sorties/i) === A.tile(i0, /Sorties/i) && A.tile(i4, /Formations/i) === A.tile(i0, /Formations/i), A.tilesLine(i4)],
    ['nothing else moved', A.diffText(i0, i4).split(' ;; ').length === 2, A.diffText(i0, i4)],
  ], i4.shots)
  row(`${S}.sum`, 'Original · removed (waiting) · put back · replaced (waiting) · AL1', [i0, i1, i2, i3, i4].map(crew).join(' ;; '), 'RECORDED')
})
