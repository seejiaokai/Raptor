/* S17 — an all-day absence Tue–Thu (local leave); blank seats Mon..Fri (a flying line AND a duty row each day).
   First / middle / last covered days flag; Monday and Friday (the neighbours) do not. */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, P6, ID, CSN, TUE, sleep, R, pic } = T
const t = T.mk('s17')
const { browser, p, errors } = await K.fresh()
try {
  const seats = await Q.seatDays(p, [0, 1, 2, 3, 4], { duty: true })
  const f = await T.file(p, { type: 'LL', di: 1, toDi: 3, allday: true, remarks: 'Leave Tue-Thu' })
  const rec = await T.rec(p, f.iid)
  const res = {}
  for (const di of [0, 1, 2, 3, 4]) res[di] = await Q.readDay(p, di, 's17', { noPics: false })
  const line = di => res[di].away.some(x => /On leave but planned to fly this line/.test(x))
  const row = di => res[di].away.some(x => /On leave but tasked — this row/.test(x))
  t.add('S17.1', `five days of blank seats first (Mon–Fri: a new flying line and a new duty row each, ${CSN} on both; took ${JSON.stringify(Object.fromEntries(Object.entries(seats).map(([k, v]) => [k, [v.took, v.duty]])))}); then LL, All day, Tue 14 → Thu 16 July filed on the Inputs page (stored: ${rec})`,
    [0, 1, 2, 3, 4].map(di => Q.shortDay(di, res[di])).join(' || '),
    [1, 2, 3].every(di => line(di) && row(di) && res[di].s.ring) && [0, 4].every(di => res[di].away.length === 0 && !res[di].s.ring) ? 'PASS' : 'FAIL', [0, 1, 4].flatMap(di => res[di].s.pics))
  const edge = {}
  for (const di of [0, 1, 2, 3, 4]) edge[di] = `${Q.DOW[di]} line ${line(di) ? 'flagged' : 'silent'}, row ${row(di) ? 'flagged' : 'silent'}`
  t.add('S17.2', 'first (Tue), middle (Wed), last (Thu) covered day and the two neighbours (Mon, Fri), flying line and duty row separately', Object.values(edge).join(' | '), [1, 2, 3].every(di => line(di) && row(di)) && [0, 4].every(di => !line(di) && !row(di)) ? 'PASS' : 'FAIL')
  await B.reloadAs(p, 'a'); await B.toEdit(p)
  const r2 = {}
  for (const di of [0, 1, 2, 3, 4]) r2[di] = await Q.readDay(p, di, 's17r', { noPics: true })
  t.add('S17.3', 'reload and sign in again', [0, 1, 2, 3, 4].map(di => Q.shortDay(di, r2[di])).join(' || '), [1, 2, 3].every(di => r2[di].away.length === 2) && [0, 4].every(di => r2[di].away.length === 0) ? 'PASS' : 'FAIL')
} catch (e) { R('S17.X', 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 's17-X')]) }
R('S17.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
T.done('bta-B-s17')
