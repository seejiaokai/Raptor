/* Scenario 10 — a duty row and a ground row added after publication stay out of Insights until issued. */
import * as A from './ins-a-lib.mjs'
const { L, W, TUE, row, judge, pic } = A
const S = '10', DUTY = 'split', GND = 'bullet'   /* Vandal and Zulu: on nothing all week — no Work-hours bar at all */
const sumTypes = r => A.sec(r, /Conflicts by type/i).reduce((n, x) => n + +x.replace(/^.*\D(\d+)$/, '$1'), 0)
async function rowFill(p, fillKey, pid) {
  const dst = p.locator(`#schedBoard [data-fill="${fillKey}"]:visible`).first()
  const src = p.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  await dst.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150)
  await src.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(200)
  try { await W.drag(p, src, dst) } catch (e) { return String(e).slice(0, 160) }
  return 'dropped'
}
await A.run(S, async p => {
  await A.toEdit(p)
  const pub = await A.pubOrig(p, TUE)
  const i0 = await A.insPic(p, 's10-a-orig', 'top')
  judge(`${S}.a`, `Tuesday signed and ${pub.r.label}; Insights on Edit Schedule`, [
    ['Vandal has no Work-hours bar', A.hoursOf(i0, 'Vandal') === '(none)', A.hoursOf(i0, 'Vandal')],
    ['Zulu has no Work-hours bar', A.hoursOf(i0, 'Zulu') === '(none)', A.hoursOf(i0, 'Zulu')],
  ], i0.shots)

  await W.boardOn(p, TUE)
  /* a duty row: "+ Row" on the 1st-wave duty block, its role and times typed, Vandal dragged onto it */
  const nd0 = await p.evaluate(() => window.DAYS[1].dutywaves[0].rows.length)
  const dr = p.locator('#schedBoard [data-dradd="1.0"]:visible').first()
  await dr.evaluate(e => e.scrollIntoView({ block: 'center' })); await dr.click(); await L.sleep(500)
  await A.boxText(p, `dr:1.0.${nd0}.role`, 'RSO')
  await A.boxText(p, `dr:1.0.${nd0}.str`, '08:00')
  await A.boxText(p, `dr:1.0.${nd0}.end`, '11:00')
  const d1 = await rowFill(p, `d:1.0.${nd0}.+`, DUTY)
  const shot1 = await pic(p, 's10-b-board-duty-row')
  /* a ground row: "+ Item" on Ground, its name and times typed, Zulu dragged onto it */
  const ng0 = await p.evaluate(() => window.DAYS[1].ground.length)
  const gr = p.locator('#schedBoard [data-gradd="1"]:visible').first()
  await gr.evaluate(e => e.scrollIntoView({ block: 'center' })); await gr.click(); await L.sleep(500)
  await A.boxText(p, `gr:1.${ng0}.prog`, 'RANGE BRIEF')
  await A.boxText(p, `gr:1.${ng0}.str`, '13:00')
  await A.boxText(p, `gr:1.${ng0}.end`, '15:30')
  const g1 = await rowFill(p, `g:1.${ng0}.+`, GND)
  const shot2 = await pic(p, 's10-b-board-ground-row')
  const held = await p.evaluate(([a, b]) => ({ duty: window.DAYS[1].dutywaves[0].rows[a], ground: window.DAYS[1].ground[b] }), [nd0, ng0])
  await W.boardOff(p)
  const f1 = await A.face(p, TUE)
  const i1 = await A.insAt(p, 's10-b-waiting-insights-foot-of-hours', 'Reaper')
  const v1 = await A.vface(p, TUE)
  judge(`${S}.b`, `board: "+ Row" on the 1st-wave duties → RSO 08:00–11:00, Vandal dragged on (${d1}); "+ Item" on Ground → RANGE BRIEF 13:00–15:30, Zulu dragged on (${g1}); ✓ Done; Insights`, [
    ['the board holds both rows with their people', held.duty && held.duty.id === DUTY && held.ground && held.ground.who === GND, held],
    ['Tuesday is pending', A.isPending(f1) && /AL1/.test(f1.alpub), A.faceLine(f1)],
    ['the window is word for word the issued one', A.same(i0, i1), A.diffText(i0, i1)],
    ['still no Work-hours bar for Vandal or Zulu', A.hoursOf(i1, 'Vandal') === '(none)' && A.hoursOf(i1, 'Zulu') === '(none)'],
    ['the published face still reads Original', /ORIG/.test(v1.tag), v1],
  ], [shot1, shot2, ...i1.shots])

  const al = await A.pubAL(p, TUE)
  const f2 = await A.face(p, TUE)
  const i2 = await A.insAt(p, 's10-c-AL1-vandal-zulu-bars', 'Zulu')
  const i2b = await A.insPic(p, 's10-c-AL1', 'foot')
  const v2 = await A.vface(p, TUE)
  judge(`${S}.c`, `Tuesday signed and "${al.r.label || al.r.why}"; Insights`, [
    ['Tuesday reads AL1, nothing pending', /AL1/.test(f2.tag) && !A.isPending(f2), A.faceLine(f2)],
    ['Vandal appears with 3h (08:00–11:00)', A.hoursOf(i2, 'Vandal') === 'Vandal 3h', A.hoursOf(i2, 'Vandal')],
    ['Zulu appears with 2h30 (13:00–15:30)', A.hoursOf(i2, 'Zulu') === 'Zulu 2h30', A.hoursOf(i2, 'Zulu')],
    ['Insights Tuesday issues = the published Tuesday bar', A.num(A.byDay(i2, 'Tue')) === A.num(v2.bar), `${A.byDay(i2, 'Tue')} / ${v2.bar}`],
    ['the issues tile = the sum of the types', +A.tile(i2, /warning/i) === sumTypes(i2), `${A.tile(i2, /warning/i)} / ${sumTypes(i2)}`],
    ['both men still listed as not flying (a duty is not a sortie)', A.idleHas(i2, 'Vandal') && A.idleHas(i2, 'Zulu')],
  ], [...i2.shots, ...i2b.shots])
  row(`${S}.c+`, 'everything that moved in the window at AL1', A.diffText(i0, i2), 'RECORDED')
})
