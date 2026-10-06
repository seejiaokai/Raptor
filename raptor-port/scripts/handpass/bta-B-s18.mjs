/* S18 — a PART-day absence Tue–Thu (LL) of four shapes: AM, PM, Custom 00:01–23:59, Custom 22:00–02:00 (across midnight).
   Blank seats Mon..Fri (a flying line each, X on it) stay silent; then times are typed on lines and only a real overlap flags.
   Usage: node bta-B-s18.mjs [am|pm|near|night|all] */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, P6, ID, CSN, TUE, sleep, R, pic } = T
const t = T.mk('s18')
const P = T.PHONE ? 'ph' : 'dk'
const which = process.argv[2] || 'all'
const leave = r => r.away.some(x => /On leave but planned to fly/.test(x))
const text = r => r.away.length ? JSON.stringify(r.away.map(x => x.replace(/^(hard|adv|note)\//, '').slice(0, 130))) : 'silent'

async function shape(key, label, cfg, timed) {
  const idp = `S18-${P}-${key}`
  const { browser, p, errors } = await K.fresh()
  try {
    const seats = await Q.seatDays(p, [0, 1, 2, 3, 4])
    const f = await T.file(p, { type: 'LL', di: 1, toDi: 3, remarks: 'Part ' + key, ...cfg })
    const rec = await T.rec(p, f.iid)
    const res = {}
    for (const di of [0, 1, 2, 3, 4]) res[di] = await Q.readDay(p, di, `s18-${key}`, { noPics: di !== 2 })
    t.add(`${idp}.1`, `${label}: blank flying lines Mon–Fri with ${CSN} on each (took ${Object.values(seats).map(s => s.took).join('/')}); LL Tue 14 → Thu 16 filed (form read ${JSON.stringify(f.form)}; stored: ${rec})`,
      [0, 1, 2, 3, 4].map(di => Q.shortDay(di, res[di])).join(' || '), [0, 1, 2, 3, 4].every(di => res[di].away.length === 0) ? 'PASS' : 'FAIL', res[2].s.pics)
    /* the crew list for a part-day absence: recorded, not judged */
    await K.boardTo(p, 1)
    const extra = await T.extraBlank(p, 1, seats[1].gi, false)
    const armed = await C.armSeat(p, T.key(1, seats[1].gi, extra.fi, 0))
    const r = await C.rosterX(p); const row = await C.crewListRow(p)
    const cl = await pic(p, `s18-${key}-crewlist`)
    await p.keyboard.press('Escape'); await sleep(200)
    t.add(`${idp}.2`, `${label}: a second blank line on Tuesday, its seat armed (${armed}) — his name in the crew list`, `${C.sayRoster(r)}${row ? ' · row "' + row.slice(0, 140) + '"' : ''}`, 'RECORDED', [cl])
    /* the timed checks */
    for (const [n, di, to, ld, expect, why] of timed) {
      const gi = seats[di].gi
      await K.ff(p, di, gi, 0, 'to', to); await K.ff(p, di, gi, 0, 'ld', ld)
      const r2 = await Q.readDay(p, di, `s18-${key}-t${n}`, { noPics: false })
      const hit = leave(r2)
      t.add(`${idp}.t${n}`, `${label}: ${Q.DOW[di]} line timed ${to}–${ld} (${why})`, Q.shortDay(di, r2), hit === expect ? 'PASS' : 'FAIL', r2.s.pics)
    }
  } catch (e) { R(`${idp}.X`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, `s18-${key}-X`)]) }
  R(`${idp}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
/* [n, day, take-off, landing, flags?, why] */
if (which === 'am' || which === 'all') await shape('am', 'AM', { allday: false, span: 'am' }, [[1, 1, '08:00', '09:30', true, 'inside the morning'], [2, 1, '15:00', '16:30', false, 'afternoon, outside it']])
if (which === 'pm' || which === 'all') await shape('pm', 'PM', { allday: false, span: 'pm' }, [[1, 1, '15:00', '16:30', true, 'inside the afternoon'], [2, 1, '08:00', '09:30', false, 'morning, outside it']])
if (which === 'near' || which === 'all') await shape('near', 'Custom 00:01-23:59', { allday: false, span: 'custom', from: '00:01', to: '23:59' }, [[1, 1, '10:00', '11:30', true, 'inside it'], [2, 1, '00:00', '00:00', false, 'a take-off and landing both at 00:00, before 00:01']])
if (which === 'night' || which === 'all') await shape('night', 'Custom 22:00-02:00', { allday: false, span: 'custom', from: '22:00', to: '02:00' }, [[1, 1, '23:00', '23:30', true, 'inside the evening part'], [2, 1, '03:00', '04:00', false, 'after the tail, outside'], [3, 4, '00:30', '01:30', true, "Friday's early hours — the tail of Thursday's 22:00-02:00"], [4, 0, '22:30', '23:30', false, 'Monday evening — Monday is not covered']])
T.done('bta-B-s18-' + which)
