/* walker C — scenario 29: hides are kept apart by week and come back on navigation. Week of 13 Jul: Tuesday's "Long
   work day" (Static). Week of 20 Jul: Monday's last line (the CO-approval pairing, Diesel + Hex). Then back and forth,
   a reload in each week, and a member. Every day of both weeks is opened and read each time: a hide must not leak by
   day number (13 Jul's Monday / 20 Jul's Tuesday) nor by kind (20 Jul's Wednesday also has a "Long work day"). */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const { browser, p, errors } = await H.world({ who: 'a' })
/* every day of the loaded week: its count and which lines are painted struck (and whether any button is drawn) */
async function weekMap(surf) {
  const out = {}
  for (let di = 0; di < 7; di++) {
    const had = await H.openList(p, surf, di)
    const l = had ? await H.readList(p, surf, di) : { lines: [], bar: '(no bar)' }
    out[di] = { bar: l.bar, struck: (l.lines || []).filter(x => x.struck).map(x => x.ix), btns: (l.lines || []).filter(x => x.btn).length, n: (l.lines || []).length }
  }
  return out
}
const struckOnly = m => Object.fromEntries(Object.entries(m).filter(([, v]) => v.struck.length).map(([k, v]) => [H.DAY[k], v.struck]))
const eq = (m, want) => JSON.stringify(struckOnly(m)) === JSON.stringify(want)
const WANT1 = { Tue: [3] }, WANT2 = { Mon: [9] }
try {
  await L.go(p, 'editsched')
  await C.toWeek(p, C.WK1)
  const s0 = await C.see(p, '#eWeek', 1, /Long work day/i, 'wolf')
  await H.tapLine(p, '#eWeek', 1, s0.line.ix); await L.settle(p)
  const m1 = await weekMap('#eWeek')
  const pic1 = await C.picLine(p, '#eWeek', 1, 3, '29-1-wk13-tue-hidden')
  H.judge('29.1', 'week of 13 Jul: ✕ on Tuesday\'s "Long work day"; every day\'s list opened', [['only Tuesday\'s 4th line is struck in this week', eq(m1, WANT1), JSON.stringify(struckOnly(m1))], ['Tuesday reads 3 issues', /\b3 issues/.test(m1[1].bar), m1[1].bar]], [pic1])

  const wk = await C.toWeek(p, C.WK2)
  const m2a = await weekMap('#eWeek')
  const mon = await C.see(p, '#eWeek', 0, /CO approval required/i, 'fantom')
  const pic2a = await C.picLine(p, '#eWeek', 0, mon.line.ix, '29-2-wk20-mon-before')
  H.judge('29.2', 'pressed the "Jul 20" week chip; every day\'s list opened', [['the week of 20 Jul is up', wk === C.WK2, wk], ['nothing is struck in this week (no leak from 13 Jul — not Tuesday, not Wednesday\'s own "Long work day")', eq(m2a, {}), JSON.stringify(struckOnly(m2a))], ['Monday reads 10 issues', /\b10 issues/.test(m2a[0].bar), m2a[0].bar]], [pic2a])
  await H.tapLine(p, '#eWeek', 0, mon.line.ix); await L.settle(p)
  const m2 = await weekMap('#eWeek')
  const mon2 = await C.see(p, '#eWeek', 0, /CO approval required/i, 'fantom')
  const pic2 = await C.picLine(p, '#eWeek', 0, mon.line.ix, '29-3-wk20-mon-hidden')
  H.judge('29.3', 'week of 20 Jul: ✕ on Monday\'s "CO approval required" line (Diesel + Hex)', [['only Monday\'s 10th line is struck in this week', eq(m2, WANT2), JSON.stringify(struckOnly(m2))], ...C.hiddenChecks(mon2, 9)], [pic2])
  const stored = await p.evaluate(() => { const g = k => { try { return (JSON.parse(localStorage.getItem('raptor:' + k)) || {}).wo || null } catch (e) { return 'unreadable' } }; return { 'weeks/13-07-2026#1': g('weeks/13-07-2026#1'), 'weeks/20-07-2026#0': g('weeks/20-07-2026#0'), others: Object.keys(localStorage).filter(k => /^raptor:weeks\/.*#\d$/.test(k) && /"wo":\[/.test(localStorage.getItem(k))).map(k => k.slice(7)) } })
  H.judge('29.rows', 'the saved rows (read only)', [['exactly two day rows carry a hide: 13 Jul\'s Tuesday and 20 Jul\'s Monday', JSON.stringify(stored.others.sort()) === JSON.stringify(['weeks/13-07-2026#1', 'weeks/20-07-2026#0']), JSON.stringify(stored.others)], ['Tuesday 14 Jul holds the long-day hide only', (stored['weeks/13-07-2026#1'] || []).length === 1 && /LONGDAY/.test(stored['weeks/13-07-2026#1'][0]), JSON.stringify(stored['weeks/13-07-2026#1']).slice(0, 80)], ['Monday 20 Jul holds the CO-approval hide only', (stored['weeks/20-07-2026#0'] || []).length === 1 && /CO_APPROVAL/.test(stored['weeks/20-07-2026#0'][0]), JSON.stringify(stored['weeks/20-07-2026#0']).slice(0, 80)]])

  /* back and forth */
  await C.toWeek(p, C.WK1); const m3 = await weekMap('#eWeek')
  const pic3 = await C.picLine(p, '#eWeek', 1, 3, '29-4-back-on-wk13')
  await C.toWeek(p, C.WK2); const m4 = await weekMap('#eWeek')
  await C.toWeek(p, C.WK1); const m5 = await weekMap('#eWeek')
  H.judge('29.4', 'week chips: back to 13 Jul, forward to 20 Jul, back to 13 Jul — every day read each time', [['13 Jul: only Tuesday\'s line', eq(m3, WANT1), JSON.stringify(struckOnly(m3))], ['13 Jul\'s Monday has no struck line and the same lines as before — 20 Jul\'s Monday hide did not leak', m3[0].struck.length === 0 && m3[0].n === m1[0].n && m3[0].bar === m1[0].bar, m3[0].bar + ' · ' + m3[0].n + ' lines'], ['20 Jul: only Monday\'s line', eq(m4, WANT2), JSON.stringify(struckOnly(m4))], ['13 Jul again: only Tuesday\'s line', eq(m5, WANT1), JSON.stringify(struckOnly(m5))]], [pic3])

  /* a reload in each week */
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
  const wkA = await p.evaluate(() => window.CURWEEK)
  await C.toWeek(p, C.WK1); const m6 = await weekMap('#eWeek')
  await C.toWeek(p, C.WK2); const m7 = await weekMap('#eWeek')
  const pic7 = await C.picLine(p, '#eWeek', 0, 9, '29-5-wk20-after-reload')
  H.judge('29.5', 'reloaded while on the week of 13 Jul (the app opened on ' + wkA + '); both weeks read', [['13 Jul: only Tuesday\'s line', eq(m6, WANT1), JSON.stringify(struckOnly(m6))], ['20 Jul: only Monday\'s line', eq(m7, WANT2), JSON.stringify(struckOnly(m7))]], [pic7])
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
  const wkB = await p.evaluate(() => window.CURWEEK)
  await C.toWeek(p, C.WK2); const m8 = await weekMap('#eWeek')
  await C.toWeek(p, C.WK1); const m9 = await weekMap('#eWeek')
  const pic9 = await C.picLine(p, '#eWeek', 1, 3, '29-6-wk13-after-reload-from-wk20')
  H.judge('29.6', 'reloaded while on the week of 20 Jul (the app opened on ' + wkB + '); both weeks read', [['20 Jul: only Monday\'s line', eq(m8, WANT2), JSON.stringify(struckOnly(m8))], ['13 Jul: only Tuesday\'s line', eq(m9, WANT1), JSON.stringify(struckOnly(m9))]], [pic9])

  /* a second user: the member, View-only Sched */
  await C.reSign(p, 'm'); await L.go(p, 'viewsched')
  await C.toWeek(p, C.WK1); const v1 = await weekMap('#vWeek')
  const picV1 = await C.picLine(p, '#vWeek', 1, 3, '29-7-member-wk13')
  await C.toWeek(p, C.WK2); const v2 = await weekMap('#vWeek')
  const picV2 = await C.picLine(p, '#vWeek', 0, 9, '29-8-member-wk20')
  H.judge('29.7', 'Logout; the member (Ranger): View-only Sched, the week chips, both weeks read', [['13 Jul: only Tuesday\'s line struck', eq(v1, WANT1), JSON.stringify(struckOnly(v1))], ['20 Jul: only Monday\'s line struck', eq(v2, WANT2), JSON.stringify(struckOnly(v2))], ['no ✕ / ↺ on any line of either week', Object.values(v1).every(d => d.btns === 0) && Object.values(v2).every(d => d.btns === 0)], ['20 Jul\'s Monday reads 9 issues for him too', /\b9 issues/.test(v2[0].bar), v2[0].bar]], [picV1, picV2])
} catch (e) { H.row('29.X', 'the script', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, '29-X-error')]) }
C.done('29', errors)
await browser.close()
