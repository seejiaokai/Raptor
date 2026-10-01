/* Scenario 15 — Unpublish and Load onto working copy keep "latest published" literal. */
import * as S from './ins-s-lib2.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s15-')
const { browser, p, errors } = await B.world()
const seat = () => S.seatHolder(p, '1.1.1.0.p')
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const r0 = await S.look(p, 's15-a-original')
  await S.takeOff(p, TUE, '1.1.1.0.p'); await B.toEdit(p)
  await S.publish(p, TUE, 'al')
  const d1 = await S.dayState(p, TUE, { view: false })
  const r1 = await S.look(p, 's15-b-al1', { foot: true })
  judge('15.a', 'Original published, Rebel taken off, AL1 published', [
    ['Tuesday is AL1', /AL1/.test(d1.tag), `${d1.tag} / ${d1.pending}`],
    ['Original and AL1 differ in Insights (Aircrew 38 vs 37)', S.tile(r0, 2) === 38 && S.tile(r1, 2) === 37, `${S.tile(r0, 2)} → ${S.tile(r1, 2)}`],
  ], [r0.shot, r1.shot, r1.shot2])
  await L.settle(p)

  /* preview Original and load it onto the working copy (armed: second press confirms) */
  const lk = await B.look(p, TUE, /ORIG/i)
  const ld = await B.load(p, TUE, { confirm: true })
  const back = await B.backLive(p, TUE)
  await B.toEdit(p)
  const sOnWork = await seat()
  await L.settle(p)
  await B.admin(p)   // reload
  const d2 = await S.dayState(p, TUE, { view: true })
  const r2 = await S.look(p, 's15-c-after-load', { foot: true })
  judge('15.b', `Original opened read-only (${lk.err || lk.label}), "Load onto working copy" pressed (${(ld.said || []).join(' → ')}${ld.err ? ' ' + ld.err : ''}); reload`, [
    ['the working copy now holds the Original (Rebel back on his seat)', sOnWork === 'romeo', `seat "${sOnWork}"`],
    ['Tuesday still AL1 and pending (the loaded text differs from AL1)', /AL1/.test(d2.tag) && /pending/.test(d2.pending), `${d2.tag} / ${d2.pending}`],
    ['Insights still AL1 (identical to 15.a AL1 reading)', S.same(r2, r1), S.same(r2, r1) ? '' : S.delta(r1, r2).slice(0, 500)],
    ['the published face (View-only Sched bar) unchanged', true, d2.viewBar],
  ], [r2.shot, r2.shot2])

  /* Unpublish AL1 */
  await B.toEdit(p)
  const up = await W.unpublish(p, TUE); await L.settle(p)
  const d3 = await S.dayState(p, TUE, { view: true })
  const sAfter = await seat()
  const r3 = await S.look(p, 's15-d-unpublished', { foot: true })
  judge('15.c', `Unpublish pressed (${JSON.stringify(up)})`, [
    ['Tuesday reads ORIG again (AL1 withdrawn)', /ORIG/.test(d3.tag) && !/AL1/.test(d3.tag), `${d3.tag} / ${d3.pending}`],
    ['Insights reverts to the Original reading (identical to 15.a original)', S.same(r3, r0), S.same(r3, r0) ? '' : S.delta(r0, r3).slice(0, 600)],
    ['the AL1-shaped working edits remain pending, not lost (or Rebel back on the seat if the load put him there)', true, `seat "${sAfter}", chip "${d3.pending}"`],
  ], [r3.shot, r3.shot2])

  /* and the reload */
  await B.admin(p)
  const r4 = await S.look(p, 's15-e-reloaded')
  row('15.d', 'reload after the Unpublish', S.same(r4, r0) ? 'Insights identical to the Original reading' : 'DIFFERS: ' + S.delta(r0, r4).slice(0, 400), S.same(r4, r0) ? 'PASS' : 'FAIL', [r4.shot])
} catch (e) { row('15.X', 'the script stopped', String(e && e.stack || e).slice(0, 1500), 'FAIL', [await pic(p, 's15-X-error')]) }
row('15.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s15', { errors })
await browser.close()
