/* Scenario 11 — Inputs-page leave and activity request use their issued filing/details. */
import * as S from './ins-s-lib2.mjs'
import * as W2 from './dbrA-W2-lib.mjs'
import { fileTimed } from './p6-lib.mjs'
const { B, L, W } = S
const { judge, row, pic, savePart, TUE } = B
B.prefix('s11-')
const { browser, p, errors } = await B.world()
const TUE_ISO = '2026-07-14'
const hrs = (r, n) => S.hoursOf(r, [n])[n] || '(none)'
const idle = r => (S.sec(r, 'Not on').find(x => x.startsWith('chips:')) || '').replace('chips:', '').split(',')
try {
  await B.toEdit(p)
  await S.publish(p, TUE, 'orig')
  const r0 = await S.look(p, 's11-a-original', { foot: true })
  row('11.a', 'Tuesday published (Original); Insights', `Marlin (flies 2nd wave) hours ${hrs(r0, 'Marlin')}, Rebel ${hrs(r0, 'Rebel')}, Vandal ${hrs(r0, 'Vandal')} · tile ${r0.tiles[3].n} ${r0.tiles[3].l} · types: on-leave+flying ${S.typeCount(r0, /^On leave/)} · Tuesday "${S.byDay(r0, 'Tuesday')}" · idle count ${idle(r0).length}`, 'RECORDED', [r0.shot, r0.shot2])

  /* the round trip first: a leave filed for a man NOT flying that day, then deleted — zero pending afterwards */
  const t1 = await W2.fileReq(p, { person: 'nact', type: 'LL', from: TUE_ISO, remarks: 'walk round trip' })
  await B.toEdit(p)
  const d1 = await S.dayState(p, TUE, { view: false })
  const rA = await S.look(p, 's11-b-leave-filed', {})
  const del = await W2.delReq(p, t1.iid)
  await B.toEdit(p)
  const d1b = await S.dayState(p, TUE, { view: false })
  const rB = await S.look(p, 's11-c-leave-deleted', {})
  judge('11.b', `Inputs → Add input: a leave (LL) for Warden (nact), Tuesday (asked: ${t1.asked.join(',') || 'nothing'}); Insights; then the row's ✕ (${del}); Insights again`, [
    ['after filing: Tuesday pending with sign-offs cleared', /pending/.test(d1.pending), `${d1.pending} / ${d1.signs}`],
    ['after filing: Insights identical to 11.a', S.same(rA, r0), S.same(rA, r0) ? '' : S.delta(r0, rA).slice(0, 400)],
    ['after deleting: a complete round trip reads zero pending', !/pending/.test(d1b.pending), `chip "${d1b.pending}" marker "${d1b.nys}"`],
    ['after deleting: Insights identical to 11.a', S.same(rB, r0), S.same(rB, r0) ? '' : S.delta(r0, rB).slice(0, 400)],
  ], [rA.shot, rB.shot])

  /* the real ones: a leave for Marlin (flies), a timed duty request for Vandal, a third filed then deleted */
  const lv = await W2.fileReq(p, { person: 'cards', type: 'LL', from: TUE_ISO, remarks: 'walk leave' })
  const du = await fileTimed(L, p, { person: 'split', type: 'Duty', iso: TUE_ISO, from: '18:00', to: '23:00', remarks: 'walk duty' })
  const ab = await fileTimed(L, p, { person: 'psy', type: 'Appointment', iso: TUE_ISO, from: '15:00', to: '16:00', remarks: 'walk abandoned' })
  const abDel = await W2.delReq(p, ab)
  await B.toEdit(p)
  const d2 = await S.dayState(p, TUE, { view: true })
  const r2 = await S.look(p, 's11-d-pending', { foot: true })
  judge('11.c', `filed: leave for Marlin (${lv.iid ? 'ok' : 'NOT FILED'}), a timed Duty request 18:00–23:00 for Vandal (${du ? 'ok' : 'NOT FILED'}), an Appointment for Cutter (${ab ? 'ok' : 'NOT FILED'}) deleted again (${abDel}); Insights`, [
    ['Tuesday pending with sign-offs cleared', /pending/.test(d2.pending) && /·\|·\|·\|·/.test(d2.signs), `${d2.pending} / ${d2.signs}`],
    ['the published face is unchanged (View-only Sched bar still the issued four)', /4 issues/.test(d2.viewBar), d2.viewBar],
    ['Insights identical to 11.a (hours, idle names, conflicts)', S.same(r2, r0), S.same(r2, r0) ? '' : S.delta(r0, r2).slice(0, 600)],
  ], [r2.shot, r2.shot2])

  await S.publish(p, TUE, 'al')
  const d3 = await S.dayState(p, TUE)
  const r3 = await S.look(p, 's11-e-al1', { foot: true })
  judge('11.d', 'sign the four and Publish AL1; Insights', [
    ['Tuesday is AL1, nothing pending', /AL1/.test(d3.tag) && !/pending/.test(d3.pending), `${d3.tag} / ${d3.pending}`],
    ['the final state appears: Vandal now has the duty hours (5h)', hrs(r3, 'Vandal') !== '(none)', `Vandal ${hrs(r0, 'Vandal')} → ${hrs(r3, 'Vandal')}`],
    ['the abandoned Appointment never appears (Cutter not changed)', hrs(r3, 'Cutter') === hrs(r0, 'Cutter'), `Cutter ${hrs(r0, 'Cutter')} → ${hrs(r3, 'Cutter')}`],
    ['the leave shows in Insights (On leave + flying up, or a change to Marlin)', S.typeCount(r3, /^On leave/) !== S.typeCount(r0, /^On leave/) || hrs(r3, 'Marlin') !== hrs(r0, 'Marlin') || r3.tiles[3].n !== r0.tiles[3].n, `on-leave ${S.typeCount(r0, /^On leave/)}→${S.typeCount(r3, /^On leave/)}; Marlin ${hrs(r0, 'Marlin')}→${hrs(r3, 'Marlin')}; tile ${r0.tiles[3].n}→${r3.tiles[3].n}`],
    ["Insights and the day's bar agree on Tuesday's issue count", new RegExp(`${/(\d+) issue/.exec(S.byDay(r3, 'Tuesday'))?.[1]} issue`).test(d3.editBar), `By day "${S.byDay(r3, 'Tuesday')}" vs "${d3.editBar}"`],
  ], [r3.shot, r3.shot2])
  row('11.e', 'everything that moved at AL1', S.delta(r2, r3).slice(0, 1100), 'RECORDED', [])
} catch (e) { row('11.X', 'the script stopped', String(e && e.stack || e).slice(0, 1500), 'FAIL', [await pic(p, 's11-X-error')]) }
row('11.err', "the browser's error list", errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart('s11', { errors })
await browser.close()
