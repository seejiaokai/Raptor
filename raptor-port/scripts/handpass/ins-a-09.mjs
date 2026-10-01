/* Scenario 9 — moving a take-off time freezes Work hours as well as the day. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '9', WHO = ['Rebel', 'Cinder', 'Vapor', 'Marlin']
const hrs = r => WHO.map(c => A.hoursOf(r, c)).join(', ')
const sumTypes = r => A.sec(r, /Conflicts by type/i).reduce((n, x) => n + +x.replace(/^.*\D(\d+)$/, '$1'), 0)
const figs = r => `${hrs(r)} · issues tile ${A.tile(r, /warning/i)} · Long work day ${A.typeN(r, /^Long work day/)} · "${A.byDay(r, 'Tue')}"`
await A.run(S, async p => {
  await A.toEdit(p)
  const pub = await A.pubOrig(p, TUE)
  const i0 = await A.insPic(p, 's9-a-orig', 'both')
  row(`${S}.a`, `Tuesday signed and ${pub.r.label}; Insights on Edit Schedule (Go 2's RU formation: T/O 14:40, LD 16:05)`, figs(i0), 'RECORDED', i0.shots)

  await W.boardOn(p, TUE)
  await A.boxText(p, 'ff:1.1.1.to', '16:40')
  await A.boxText(p, 'ff:1.1.1.ld', '18:05')
  const shot1 = await pic(p, 's9-b-board-time-moved')
  await W.boardOff(p)
  const f1 = await A.face(p, TUE)
  const shown = await p.evaluate(() => { const f = window.DAYS[1].waves[1].formations[1]; return f.to + '–' + f.ld })
  await A.openList(p, '#eWeek', TUE); const el1 = await A.readList(p, '#eWeek', TUE)
  await A.reloadAs(p, 'a')
  const f1r = await A.face(p, TUE)
  const shot1b = await A.facePic(p, TUE, 's9-b-reloaded-day')
  const i1 = await A.insPic(p, 's9-b-waiting-insights', 'both')
  const v1 = await A.vface(p, TUE)
  judge(`${S}.b`, 'board: Go 2 RU T/O 14:40→16:40 (two hours) and LD 16:05→18:05; ✓ Done; reload; Insights', [
    ['the working day shows the new time', shown === '16:40–18:05', shown],
    ['Tuesday is pending, before and after the reload', A.isPending(f1) && A.isPending(f1r), A.faceLine(f1r)],
    ['Insights keeps the issued Work hours', hrs(i0) === hrs(i1), `${hrs(i0)} → ${hrs(i1)}`],
    ['Insights keeps the issued warning figures', A.tile(i0, /warning/i) === A.tile(i1, /warning/i) && A.byDay(i0, 'Tue') === A.byDay(i1, 'Tue') && A.byType(i0) === A.byType(i1), `${A.tile(i1, /warning/i)} · ${A.byDay(i1, 'Tue')}`],
    ['the whole window is word for word the same', A.same(i0, i1), A.diffText(i0, i1)],
  ], [shot1, shot1b, ...i1.shots])
  row(`${S}.b+`, 'the working copy beside it while the change waits', `Edit Schedule Tuesday bar "${f1r.bar}" (working list: ${A.short(el1)}) · published face on View-only "${v1.bar}"`, 'RECORDED')

  const al = await A.pubAL(p, TUE)
  const f2 = await A.face(p, TUE)
  const i2 = await A.insPic(p, 's9-c-AL1', 'both')
  const v2 = await A.vface(p, TUE)
  judge(`${S}.c`, `Tuesday signed and "${al.r.label || al.r.why}"; Insights`, [
    ['Tuesday reads AL1, nothing pending', /AL1/.test(f2.tag) && !A.isPending(f2), A.faceLine(f2)],
    ['the four men\'s Work hours all moved', WHO.every(c => A.hoursOf(i0, c) !== A.hoursOf(i2, c)), `${hrs(i0)} → ${hrs(i2)}`],
    ['Insights Tuesday issues = the published Tuesday bar', A.num(A.byDay(i2, 'Tue')) === A.num(v2.bar), `${A.byDay(i2, 'Tue')} / ${v2.bar}`],
    ['the issues tile = the sum of the types', +A.tile(i2, /warning/i) === sumTypes(i2), `${A.tile(i2, /warning/i)} / ${sumTypes(i2)}`],
  ], i2.shots)
  row(`${S}.c+`, 'everything that moved in the window at AL1 (hours and warnings together)', A.diffText(i0, i2), 'RECORDED')
  const hb = await A.insAt(p, 's9-c-AL1-rebel-bar', 'Rebel')

  /* a second move, chosen so a warning moves too: Go 2's VL formation two hours EARLIER (Static's long work day shortens) */
  await W.boardOn(p, TUE)
  await A.boxText(p, 'ff:1.1.0.to', '12:40')
  await A.boxText(p, 'ff:1.1.0.ld', '14:05')
  await W.boardOff(p)
  const f3 = await A.face(p, TUE)
  await A.openList(p, '#eWeek', TUE); const el3 = await A.readList(p, '#eWeek', TUE)
  const shot3 = await A.facePic(p, TUE, 's9-d-second-move-day')
  await A.reloadAs(p, 'a')
  const i3 = await A.insAt(p, 's9-d-second-move-waiting-static-bar', 'Static')
  const v3 = await A.vface(p, TUE)
  judge(`${S}.d`, 'board: Go 2 VL T/O 14:40→12:40 and LD 16:05→14:05 (Tuesday now AL1 with a change waiting); ✓ Done; reload; Insights', [
    ['Tuesday is pending, AL2 offered', A.isPending(f3) && /AL2/.test(f3.alpub), A.faceLine(f3)],
    ['the window is word for word what it was at AL1', A.same(i2, i3), A.diffText(i2, i3)],
    ['Static\'s hours unchanged', A.hoursOf(i2, 'Static') === A.hoursOf(i3, 'Static'), A.hoursOf(i3, 'Static')],
    ['the published face still reads the same count', A.num(v3.bar) === A.num(v2.bar), v2.bar + ' / ' + v3.bar],
  ], [shot3, ...i3.shots])
  row(`${S}.d+`, 'the working copy beside it', `Edit Schedule Tuesday bar "${f3.bar}" · working list: ${(el3.lines || []).map(l => l.text.slice(0, 60)).join(' | ')}`, 'RECORDED')
  const al2 = await A.pubAL(p, TUE)
  const f4 = await A.face(p, TUE)
  const i4 = await A.insAt(p, 's9-e-AL2-static-bar', 'Static')
  const i4b = await A.insPic(p, 's9-e-AL2', 'foot')
  const v4 = await A.vface(p, TUE)
  judge(`${S}.e`, `Tuesday signed and "${al2.r.label || al2.r.why}"; Insights`, [
    ['Tuesday reads AL2, nothing pending', /AL2/.test(f4.tag) && !A.isPending(f4), A.faceLine(f4)],
    ['Static\'s Work hours moved', A.hoursOf(i2, 'Static') !== A.hoursOf(i4, 'Static'), `${A.hoursOf(i2, 'Static')} → ${A.hoursOf(i4, 'Static')}`],
    ['the warning figures moved in the same step', A.byType(i2) !== A.byType(i4) || A.byDay(i2, 'Tue') !== A.byDay(i4, 'Tue'), `${A.byDay(i2, 'Tue')} → ${A.byDay(i4, 'Tue')}; Long work day ${A.typeN(i2, /^Long work day/)} → ${A.typeN(i4, /^Long work day/)}`],
    ['Insights Tuesday issues = the published Tuesday bar', A.num(A.byDay(i4, 'Tue')) === A.num(v4.bar), `${A.byDay(i4, 'Tue')} / ${v4.bar}`],
    ['the issues tile = the sum of the types', +A.tile(i4, /warning/i) === sumTypes(i4), `${A.tile(i4, /warning/i)} / ${sumTypes(i4)}`],
  ], [...hb.shots, ...i4.shots, ...i4b.shots])
  row(`${S}.e+`, 'everything that moved in the window at AL2', A.diffText(i2, i4), 'RECORDED')
})
