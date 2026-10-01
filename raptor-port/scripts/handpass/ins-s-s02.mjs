/* Scenario 2 — a Logic rule change (RECORDED, with the numbers). */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { row, pic, savePart, TUE } = B
B.prefix('s2-')
const { browser, p, errors } = await B.world()
const WHO = ['Dash', 'Rune', 'Rebel', 'Cinder', 'Vapor', 'Marlin', 'Warden', 'Basher', 'Outlaw', 'Hex', 'Static', 'Saint']   /* the first six fly on Tuesday only (week-wide) */
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const d0 = await S.dayState(p, TUE)
  const r0 = await S.look(p, 's2-a-issued', { foot: true })
  row('2.a', 'Tuesday signed and published (Original); Insights opened', `${S.dayLine(d0)} · hours ${JSON.stringify(S.hoursOf(r0, WHO))} · issues tile ${r0.tiles[3].n} (${r0.tiles[3].l}) · By day Tuesday "${S.byDay(r0, 'Tuesday')}" · Long work day ${S.typeCount(r0, /^Long work/)}`, 'RECORDED', [r0.shot, r0.shot2])

  /* the rule change: the nominal report 3h → 2h */
  const c1 = await S.logicSet(p, 'reportLead', '2h')
  const d1 = await S.dayState(p, TUE)
  const r1 = await S.look(p, 's2-b-after-reportLead', { foot: true })
  row('2.b', `Logic → ✎ Edit rules → "Nominal report before T/O" ${c1.before} → ${c1.after} → Done; Edit Schedule; Insights`, `${S.dayLine(d1)} · hours ${JSON.stringify(S.hoursOf(r1, WHO))} · issues tile ${r1.tiles[3].n} (${r1.tiles[3].l}) · By day Tuesday "${S.byDay(r1, 'Tuesday')}" · Long work day ${S.typeCount(r1, /^Long work/)} · DIFFERENCE vs 2.a: ${S.delta(r0, r1)}`, 'RECORDED', [r1.shot, r1.shot2])

  /* the second rule: the flight debrief 2h → 1h */
  const c2 = await S.logicSet(p, 'debrief', '1h')
  const d2 = await S.dayState(p, TUE)
  const r2 = await S.look(p, 's2-c-after-debrief', { foot: true })
  row('2.c', `Logic → "Flight debrief after land" ${c2.before} → ${c2.after} → Done; Insights`, `${S.dayLine(d2)} · hours ${JSON.stringify(S.hoursOf(r2, WHO))} · issues tile ${r2.tiles[3].n} · DIFFERENCE vs 2.b: ${S.delta(r1, r2)}`, 'RECORDED', [r2.shot, r2.shot2])

  /* a bigger turn of the same rule, enough to cross the long-work-day line for more men */
  const c3 = await S.logicSet(p, 'debrief', '4h')
  const d2b = await S.dayState(p, TUE)
  const r2b = await S.look(p, 's2-c2-after-debrief4h', { foot: true })
  row('2.c2', `Logic → "Flight debrief after land" ${c3.before} → ${c3.after}; Insights`, `${S.dayLine(d2b)} · hours ${JSON.stringify(S.hoursOf(r2b, WHO))} · issues tile ${r2b.tiles[3].n} (${r2b.tiles[3].l}) · By day Tuesday "${S.byDay(r2b, 'Tuesday')}" · By day all: ${S.sec(r2b, 'By day').join(' ; ')} · Long work day ${S.typeCount(r2b, /^Long work/)} · DIFFERENCE vs 2.c: ${S.delta(r2, r2b).slice(0, 700)}`, 'RECORDED', [r2b.shot, r2b.shot2])

  /* now the amendment goes out (if the day asks for one) */
  const al = await S.publish(p, TUE, 'al')
  const d3 = await S.dayState(p, TUE)
  const r3 = await S.look(p, 's2-d-after-AL1', { foot: true })
  row('2.d', `sign the four and Publish AL1 (publish buttons: ${JSON.stringify(al.r)})`, `${S.dayLine(d3)} · hours ${JSON.stringify(S.hoursOf(r3, WHO))} · issues tile ${r3.tiles[3].n} · By day Tuesday "${S.byDay(r3, 'Tuesday')}" · By day all: ${S.sec(r3, 'By day').join(' ; ')} · Long work day ${S.typeCount(r3, /^Long work/)} · DIFFERENCE vs 2.c2: ${S.delta(r2b, r3)}`, 'RECORDED', [r3.shot, r3.shot2])
} catch (e) { row('2.X', 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's2-X-error')]) }
row('2.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s2', { errors })
await browser.close()
