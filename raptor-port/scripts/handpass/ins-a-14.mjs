/* Scenario 14 — Undo / Redo follows the publication boundary, including Undo of AL1; the board's and the top bar's buttons agree. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '14', SEAT = '1.1.1.0.p'
const seat = p => p.evaluate(() => window.DAYS[1].waves[1].formations[1].aircraft[0].p)
const st = (f, s) => `seat ${s} · ${A.faceLine(f)}`
await A.run(S, async p => {
  await A.toEdit(p)
  const pub = await A.pubOrig(p, TUE)
  const i0 = await A.insPic(p, 's14-a-orig', 'foot')
  await W.boardOn(p, TUE)
  const put = await A.seatPut(p, SEAT, 'shaft')
  await W.boardOff(p)
  const f1 = await A.face(p, TUE), i1 = await A.insNow(p)
  judge(`${S}.a`, `Tuesday signed and ${pub.r.label}; board: Anvil on Rebel's seat (${put.took}); ✓ Done; Insights`, [
    ['Tuesday pending', A.isPending(f1), A.faceLine(f1)],
    ['Insights is the issued one', A.same(i0, i1), A.diffText(i0, i1)],
  ], i0.shots)

  /* the top bar's Undo, then Redo */
  const u1 = await W.door(p, 'top', 'undo')
  const f2 = await A.face(p, TUE), s2 = await seat(p), i2 = await A.insNow(p)
  const shot2 = await A.facePic(p, TUE, 's14-b-top-undo-day')
  const r1 = await W.door(p, 'top', 'redo')
  const f3 = await A.face(p, TUE), s3 = await seat(p), i3 = await A.insNow(p)
  const shot3 = await A.facePic(p, TUE, 's14-b-top-redo-day')
  judge(`${S}.b`, `top bar Undo ("${u1.title}"), Insights; top bar Redo ("${r1.title}"), Insights`, [
    ['Undo put Rebel back and cleared pending (sign-offs stand)', s2 === 'romeo' && !A.isPending(f2) && !f2.nys, st(f2, s2)],
    ['Insights did not move on Undo', A.same(i0, i2), A.diffText(i0, i2)],
    ['Redo put Anvil on again and Tuesday is pending again', s3 === 'shaft' && A.isPending(f3), st(f3, s3)],
    ['Insights did not move on Redo', A.same(i0, i3), A.diffText(i0, i3)],
  ], [shot2, shot3])

  /* the board's own Undo, then Redo — must give the same two states */
  await W.boardOn(p, TUE)
  const u2 = await W.door(p, 'board', 'undo')
  const hb1 = await A.head(p, TUE), sb1 = await seat(p)
  const shot4 = await pic(p, 's14-c-board-undo')
  const r2 = await W.door(p, 'board', 'redo')
  const hb2 = await A.head(p, TUE), sb2 = await seat(p)
  const shot5 = await pic(p, 's14-c-board-redo')
  await W.boardOff(p)
  const f4 = await A.face(p, TUE), i4 = await A.insNow(p)
  judge(`${S}.c`, `the board's Undo ("${u2.title}") then the board's Redo ("${r2.title}"); ✓ Done; Insights`, [
    ['board Undo: Rebel back, not pending — the same as the top bar\'s', sb1 === 'romeo' && !/pending/.test(hb1.pending), `seat ${sb1} · chip "${hb1.pending}" · ${hb1.nys}`],
    ['board Redo: Anvil on, pending — the same as the top bar\'s', sb2 === 'shaft' && /pending/.test(hb2.pending), `seat ${sb2} · chip "${hb2.pending}" · ${hb2.nys}`],
    ['Edit Schedule afterwards reads exactly as after the top bar\'s Redo', f4.pending === f3.pending && f4.tag === f3.tag && f4.nys === f3.nys && f4.alpub === f3.alpub, A.faceLine(f4)],
    ['Insights still the issued one', A.same(i0, i4), A.diffText(i0, i4)],
  ], [shot4, shot5])

  /* AL1, then Undo of the publication */
  const al = await A.pubAL(p, TUE)
  const f5 = await A.face(p, TUE)
  const i5 = await A.insPic(p, 's14-d-AL1', 'foot')
  judge(`${S}.d`, `Tuesday signed and "${al.r.label || al.r.why}"; Insights`, [
    ['Tuesday reads AL1', /AL1/.test(f5.tag) && !A.isPending(f5), A.faceLine(f5)],
    ['the window moved (Anvil off the idle list, Rebel on)', !A.same(i0, i5) && !A.idleHas(i5, 'Anvil') && A.idleHas(i5, 'Rebel'), A.diffText(i0, i5)],
  ], i5.shots)
  const u3 = await W.door(p, 'top', 'undo')
  const f6 = await A.face(p, TUE), s6 = await seat(p)
  const shot6 = await A.facePic(p, TUE, 's14-e-undo-of-AL1-day')
  const i6 = await A.insPic(p, 's14-e-undo-of-AL1-insights', 'foot')
  const v6 = await A.vface(p, TUE)
  judge(`${S}.e`, `top bar Undo ("${u3.title}") — the publication of AL1; Insights`, [
    ['the Undo was of the publication', /publish/i.test(u3.title || ''), u3.title],
    ['Tuesday is back to Original', /ORIG/.test(f6.tag), A.faceLine(f6)],
    ['the change is open again as pending (Anvil still on the seat)', A.isPending(f6) && s6 === 'shaft', st(f6, s6)],
    ['Insights is back to the Original, word for word', A.same(i0, i6), A.diffText(i0, i6)],
    ['View-only Sched reads Original', /ORIG/.test(v6.tag) && /Original/.test(v6.sel), v6],
  ], [shot6, ...i6.shots])
  await A.toEdit(p)
  const r3 = await W.door(p, 'top', 'redo')
  const f7 = await A.face(p, TUE), i7 = await A.insNow(p)
  judge(`${S}.f`, `Edit Schedule again; top bar Redo (${r3.present ? '"' + r3.title + '"' + (r3.pressed ? '' : ' — greyed out') : 'not drawn'}); Insights`, [
    ['Tuesday reads AL1 again', /AL1/.test(f7.tag) && !A.isPending(f7), A.faceLine(f7)],
    ['Insights is AL1\'s again, word for word', A.same(i5, i7), A.diffText(i5, i7)],
  ])
})
