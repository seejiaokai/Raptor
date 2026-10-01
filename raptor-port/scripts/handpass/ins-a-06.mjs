/* Scenario 6 — hidden warnings follow the version that carried the hide. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, K, row, judge, pic } = A
const S = '6', LONG = /^Long work day/
const sumTypes = r => A.sec(r, /Conflicts by type/i).reduce((n, x) => n + +x.replace(/^.*\D(\d+)$/, '$1'), 0)
const sumDays = r => A.sec(r, /By day/i).reduce((n, x) => n + (A.num(x) || 0), 0)
const agree = r => [`tile ${A.tile(r, /warning/i)} = types ${sumTypes(r)} = days ${sumDays(r)}`, +A.tile(r, /warning/i) === sumTypes(r) && sumTypes(r) === sumDays(r)]
const figs = r => `tile ${A.tile(r, /warning/i)} ("${(r.tiles[3] || {}).l}") · Long work day ${A.typeN(r, LONG)} · "${A.byDay(r, 'Tue')}"`
async function vlook(p, name) {
  await A.toPage(p, 'viewsched'); await A.openList(p, '#vWeek', TUE)
  const l = await A.readList(p, '#vWeek', TUE)
  return { l, shot: name ? await pic(p, name) : null }
}
await A.run(S, async p => {
  await A.toEdit(p)
  const pub = await A.pubOrig(p, TUE)
  const v0 = await vlook(p, null)
  const i0 = await A.insPic(p, 's6-a-orig', 'both')
  judge(`${S}.a`, `Tuesday signed and ${pub.r.label} with four shown issues; Insights on View-only Sched`, [
    ['the published Tuesday bar reads 4 issues', A.nIssues(v0.l) === 4, v0.l.bar],
    ['Insights: Tuesday 4 issues', A.num(A.byDay(i0, 'Tue')) === 4, A.byDay(i0, 'Tue')],
    ['the tile, the types and the days add up to one number', agree(i0)[1], agree(i0)[0]],
  ], i0.shots)
  row(`${S}.a+`, 'the figures at Original', figs(i0), 'RECORDED')

  /* hide one — it waits */
  const did = await A.hide(p, TUE, K.long.re)
  await A.reloadAs(p, 'a')
  const f1 = await A.face(p, TUE)
  const shotW = await A.facePic(p, TUE, 's6-b-hide-waiting-day')
  const el1 = await A.readList(p, '#eWeek', TUE)
  const v1 = await vlook(p, 's6-b-hide-waiting-viewonly')
  const i1 = await A.insPic(p, 's6-b-hide-waiting-insights', 'foot')
  judge(`${S}.b`, `Edit Schedule: ✕ on "${K.long.name}" (${did}); reload; Insights on View-only Sched`, [
    ['Tuesday is pending (the hide waits)', A.isPending(f1), A.faceLine(f1)],
    ['the working list shows the line struck', !!(A.lineOf(el1, K.long.re) || {}).struck, A.short(el1)],
    ['the published Tuesday still reads 4 issues, the line not struck', A.nIssues(v1.l) === 4 && !(A.lineOf(v1.l, K.long.re) || {}).struck, A.short(v1.l)],
    ['Insights is word for word what it was', A.same(i0, i1), A.diffText(i0, i1)],
  ], [shotW, v1.shot, ...i1.shots])

  /* AL1 carries the hide */
  const al1 = await A.pubAL(p, TUE)
  const v2 = await vlook(p, 's6-c-AL1-viewonly')
  const i2 = await A.insPic(p, 's6-c-AL1-insights', 'both')
  const hl = A.lineOf(v2.l, K.long.re)
  judge(`${S}.c`, `Tuesday signed and "${al1.r.label || al1.r.why}"; Insights on View-only Sched`, [
    ['the published Tuesday bar reads 3 issues', A.nIssues(v2.l) === 3, v2.l.bar],
    ['the hidden line is still reachable in Tuesday\'s list, struck out', !!hl && hl.struck, hl],
    ['Insights: Tuesday 3 issues', A.num(A.byDay(i2, 'Tue')) === 3, A.byDay(i2, 'Tue')],
    ['Insights: the week tile one fewer', +A.tile(i2, /warning/i) === +A.tile(i0, /warning/i) - 1, `${A.tile(i0, /warning/i)} → ${A.tile(i2, /warning/i)}`],
    ['Insights: Long work day one fewer', A.typeN(i2, LONG) === A.typeN(i0, LONG) - 1, `${A.typeN(i0, LONG)} → ${A.typeN(i2, LONG)}`],
    ['the tile, the types and the days add up to one number', agree(i2)[1], agree(i2)[0]],
    ['nothing else in the window moved', A.diffText(i0, i2).split(' ;; ').length === 3, A.diffText(i0, i2)],
  ], [v2.shot, ...i2.shots])

  /* flag it again — it waits */
  const did2 = await A.again(p, TUE, K.long.re)
  await A.reloadAs(p, 'a')
  const f3 = await A.face(p, TUE)
  const v3 = await vlook(p, 's6-d-unhide-waiting-viewonly')
  const i3 = await A.insPic(p, 's6-d-unhide-waiting-insights', 'foot')
  judge(`${S}.d`, `Edit Schedule: ↺ on the same line (${did2}); reload; Insights on View-only Sched`, [
    ['Tuesday is pending again', A.isPending(f3), A.faceLine(f3)],
    ['the published Tuesday still reads 3 issues', A.nIssues(v3.l) === 3, v3.l.bar],
    ['Insights is word for word what it was at AL1', A.same(i2, i3), A.diffText(i2, i3)],
  ], [v3.shot, ...i3.shots])

  const al2 = await A.pubAL(p, TUE)
  const v4 = await vlook(p, 's6-e-AL2-viewonly')
  const i4 = await A.insPic(p, 's6-e-AL2-insights', 'both')
  judge(`${S}.e`, `Tuesday signed and "${al2.r.label || al2.r.why}"; Insights on View-only Sched`, [
    ['the published Tuesday bar reads 4 issues again, nothing struck', A.nIssues(v4.l) === 4 && !v4.l.lines.some(x => x.struck), A.short(v4.l)],
    ['Insights is word for word what it was at Original', A.same(i0, i4), A.diffText(i0, i4)],
    ['the tile, the types and the days add up to one number', agree(i4)[1], agree(i4)[0]],
  ], [v4.shot, ...i4.shots])
  row(`${S}.sum`, 'Original · hide waiting · AL1 · unhide waiting · AL2', [i0, i1, i2, i3, i4].map(figs).join(' ;; '), 'RECORDED')
})
