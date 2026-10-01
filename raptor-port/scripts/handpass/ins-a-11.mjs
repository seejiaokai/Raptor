/* Scenario 11 — a leave and an activity request filed on the Inputs page use their issued filing. */
import * as A from './ins-a-lib.mjs'
import * as W2 from './dbrA-W2-lib.mjs'
import { fileTimed } from './p6-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '11', ISO = '2026-07-14', LEAVER = 'romeo', BUSY = 'shaft'   /* Rebel flies Tuesday; Anvil does not fly */
const sumTypes = r => A.sec(r, /Conflicts by type/i).reduce((n, x) => n + +x.replace(/^.*\D(\d+)$/, '$1'), 0)
const figs = r => `${A.hoursOf(r, 'Rebel')}, ${A.hoursOf(r, 'Anvil')} · tile ${A.tile(r, /warning/i)} · On leave + flying ${A.typeN(r, /^On leave \+ flying/)} · "${A.byDay(r, 'Tue')}" · Rebel idle: ${A.idleHas(r, 'Rebel')}`
await A.run(S, async p => {
  await A.toEdit(p)
  const pub = await A.pubOrig(p, TUE)
  const i0 = await A.insPic(p, 's11-a-orig', 'both')
  row(`${S}.a`, `Tuesday signed and ${pub.r.label}; Insights on Edit Schedule`, figs(i0), 'RECORDED', i0.shots)

  /* a leave for a man who flies that day */
  const lv = await W2.fileReq(p, { person: LEAVER, type: 'LL', from: ISO, remarks: 'walk s11 leave' })
  const shotL = await pic(p, 's11-b-inputs-leave-filed')
  const iL = await A.insPic(p, 's11-b-leave-waiting-insights-over-inputs', 'foot')
  const f1 = await A.face(p, TUE)
  const shotD = await A.facePic(p, TUE, 's11-b-leave-waiting-day')
  const v1 = await A.vface(p, TUE)
  judge(`${S}.b`, `Inputs → Add input: LL for Rebel, Tue 14 Jul, all day (${JSON.stringify({ asked: lv.asked, clash: lv.clash, made: lv.iids.length })}); Insights over Inputs`, [
    ['the request was made', lv.iids.length === 1, lv],
    ['Tuesday shows pending and "Not yet signed"', A.isPending(f1) && /Not yet signed/.test(f1.nys), A.faceLine(f1)],
    ['the window is word for word the issued one', A.same(i0, iL), A.diffText(i0, iL)],
    ['the window on top at its centre over Inputs', iL.top === true],
    ['the published Tuesday unchanged', A.num(v1.bar) === A.num(A.byDay(i0, 'Tue')) && /ORIG/.test(v1.tag), v1],
  ], [shotL, ...iL.shots, shotD])

  /* a timed activity for another man */
  const act = await fileTimed(L, p, { person: BUSY, type: 'Duty', iso: ISO, from: '09:00', to: '11:30', remarks: 'walk s11 duty' })
  const shotA = await pic(p, 's11-c-inputs-duty-filed')
  const iA = await A.insNow(p)
  const f2 = await A.face(p, TUE)
  judge(`${S}.c`, `Inputs → Add input: Duty for Anvil, Tue 14 Jul 09:00–11:30 (made: ${!!act}); Insights over Inputs`, [
    ['the request was made', !!act, act],
    ['Tuesday pending', A.isPending(f2), A.faceLine(f2)],
    ['the window is word for word the issued one (Anvil\'s hours unchanged)', A.same(i0, iA), A.diffText(i0, iA)],
  ], [shotA])

  /* an intermediate edit that is then abandoned: the leave is deleted before publication */
  const del = await W2.delReq(p, lv.iid)
  const iD = await A.insNow(p)
  const f3 = await A.face(p, TUE)
  judge(`${S}.d`, `Inputs: ✕ on Rebel's leave row (${del}) — the leave is abandoned before publication; Insights`, [
    ['the leave is gone from the list', del === 'gone', del],
    ['Tuesday still pending (the duty request waits)', A.isPending(f3), A.faceLine(f3)],
    ['the window still the issued one', A.same(i0, iD), A.diffText(i0, iD)],
  ])

  const al = await A.pubAL(p, TUE)
  const f4 = await A.face(p, TUE)
  const i4 = await A.insAt(p, 's11-e-AL1-anvil-bar', 'Anvil')
  const i4b = await A.insPic(p, 's11-e-AL1', 'foot')
  const v4 = await A.vface(p, TUE)
  judge(`${S}.e`, `Tuesday signed and "${al.r.label || al.r.why}"; Insights`, [
    ['Tuesday reads AL1, nothing pending', /AL1/.test(f4.tag) && !A.isPending(f4), A.faceLine(f4)],
    ['the abandoned leave never reaches the window (On leave + flying unchanged, Rebel\'s hours unchanged)', A.typeN(i4, /^On leave \+ flying/) === A.typeN(i0, /^On leave \+ flying/) && A.hoursOf(i4, 'Rebel') === A.hoursOf(i0, 'Rebel'), figs(i4)],
    ['Insights Tuesday issues = the published Tuesday bar', A.num(A.byDay(i4, 'Tue')) === A.num(v4.bar), `${A.byDay(i4, 'Tue')} / ${v4.bar}`],
    ['the issues tile = the sum of the types', +A.tile(i4, /warning/i) === sumTypes(i4), `${A.tile(i4, /warning/i)} / ${sumTypes(i4)}`],
  ], [...i4.shots, ...i4b.shots])
  row(`${S}.e+`, 'what moved in the window at AL1 (the final state: the duty request only)', `${A.diffText(i0, i4)} · Anvil ${A.hoursOf(i0, 'Anvil')} → ${A.hoursOf(i4, 'Anvil')}`, 'RECORDED')

  /* a complete round trip on the now-AL1 day: file a leave, delete it */
  const lv2 = await W2.fileReq(p, { person: LEAVER, type: 'LL', from: ISO, remarks: 'walk s11 round trip' })
  const f5 = await A.face(p, TUE)
  const i5 = await A.insNow(p)
  const del2 = await W2.delReq(p, lv2.iid)
  const f6 = await A.face(p, TUE)
  const shot6 = await A.facePic(p, TUE, 's11-f-round-trip-day')
  const i6 = await A.insNow(p)
  judge(`${S}.f`, `round trip: LL for Rebel filed again (pending: "${f5.pending}"), then ✕ on its row (${del2}); Insights`, [
    ['filing it made Tuesday pending', A.isPending(f5), A.faceLine(f5)],
    ['the window did not move while it waited', A.same(i4, i5), A.diffText(i4, i5)],
    ['after the delete Tuesday reads zero pending, AL1, no "Not yet signed"', !A.isPending(f6) && !f6.nys && !f6.alpub && /AL1/.test(f6.tag), A.faceLine(f6)],
    ['the window is still AL1\'s', A.same(i4, i6), A.diffText(i4, i6)],
  ], [shot6])
  /* and the leave carried all the way out: filed again, left to wait, issued as AL2 */
  const lv3 = await W2.fileReq(p, { person: LEAVER, type: 'LL', from: ISO, remarks: 'walk s11 leave issued' })
  const f7 = await A.face(p, TUE)
  const i7 = await A.insNow(p)
  const al2 = await A.pubAL(p, TUE)
  const f8 = await A.face(p, TUE)
  const i8 = await A.insPic(p, 's11-g-AL2-leave-issued', 'foot')
  const v8 = await A.vface(p, TUE)
  await A.openList(p, '#vWeek', TUE); const vl8 = await A.readList(p, '#vWeek', TUE)
  const shot8 = await pic(p, 's11-g-AL2-viewonly')
  judge(`${S}.g`, `LL for Rebel filed once more (made: ${lv3.iids.length}); it waits ("${f7.pending}"); Tuesday signed and "${al2.r.label || al2.r.why}"; Insights`, [
    ['while it waited the window did not move', A.same(i4, i7), A.diffText(i4, i7)],
    ['Tuesday reads AL2, nothing pending', /AL2/.test(f8.tag) && !A.isPending(f8), A.faceLine(f8)],
    ['On leave + flying one more', A.typeN(i8, /^On leave \+ flying/) === A.typeN(i4, /^On leave \+ flying/) + 1, `${A.typeN(i4, /^On leave \+ flying/)} → ${A.typeN(i8, /^On leave \+ flying/)}`],
    ['Insights Tuesday issues = the published Tuesday bar', A.num(A.byDay(i8, 'Tue')) === A.num(v8.bar), `${A.byDay(i8, 'Tue')} / ${v8.bar}`],
    ['the published list names Rebel\'s leave', (vl8.lines || []).some(l => /Rebel/.test(l.text) && /leave/i.test(l.text)), (vl8.lines || []).map(l => l.text.slice(0, 50)).join(' | ')],
    ['the issues tile = the sum of the types', +A.tile(i8, /warning/i) === sumTypes(i8), `${A.tile(i8, /warning/i)} / ${sumTypes(i8)}`],
  ], [...i8.shots, shot8])
  row(`${S}.g+`, 'what moved in the window at AL2', A.diffText(i4, i8), 'RECORDED')
  row(`${S}.sum`, 'Original · leave waiting · + duty waiting · leave deleted · AL1 · round trip · AL2 (leave issued)', [i0, iL, iA, iD, i4, i6, i8].map(figs).join(' ;; '), 'RECORDED')
})
