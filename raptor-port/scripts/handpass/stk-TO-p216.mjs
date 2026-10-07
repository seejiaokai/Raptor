/* walker TO — P2-16: long-day, rest and seven-day warnings remain distinguishable.
   One person — Vandal, who holds nothing all week — flies one new line on each of the seven days Mon 13 – Sun 19 Jul:
   Mon, Tue, Fri, Sat, Sun 12:00–13:00; Wed 12:00–17:30 with "06:00 IN TIME" (06:00 → 17:30 + 2h debrief = 13h30, a long
   day); Thu 08:00–09:00 with "05:00 IN TIME" (Wed ends 19:30, Thu reports 05:00: 9h30 rest). Each warning is read and
   tapped; then Wednesday's in-time is retyped 08:00 (11h30 — no longer a long day; no worked date removed). */
import * as T from './stk-TO-lib.mjs'
const { W, L, row, judge, pic } = T
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PLAN = [['1200', '1300'], ['1200', '1300'], ['1200', '1730', '06:00 IN TIME'], ['0800', '0900', '05:00 IN TIME'], ['1200', '1300'], ['1200', '1300'], ['1200', '1300']]
await T.run('P2-16', async p => {
  const h0 = await T.hours(p, ['Vandal']); await T.insShut(p)
  const gis = [], built = []
  for (let di = 0; di < 7; di++) {
    await T.boardAt(p, di)
    const gi = await T.addWave(p, di); gis.push(gi)
    await T.form(p, di, gi, 0, { cs: 'VX', to: PLAN[di][0], ld: PLAN[di][1] })
    const s = await T.seat(p, `${di}.${gi}.0.0.p`, 'Vandal')
    if (PLAN[di][2]) { await T.itAdd(p, 'board', di, gi); await T.itType(p, 'board', di, gi, 0, PLAN[di][2]) }
    built.push(`${DAYS[di]} ${await p.evaluate(([d, g]) => { const f = window.DAYS[d].waves[g].formations[0]; return f.to + '-' + f.ld + ' ' + ((window.PEOPLE[f.aircraft[0].p] || {}).cs || 'EMPTY') + (window.DAYS[d].waves[g].intimes.length ? ' "' + window.DAYS[d].waves[g].intimes.join('/') + '"' : '') }, [di, gi])}${s.took ? '' : ' (SEAT FAILED: ' + (s.err || '') + ')'}`)
    await W.boardOff(p)
  }
  /* every line of every day's list that names Vandal */
  const sweep = async () => { const out = []; for (let di = 0; di < 7; di++) { await T.listOf(p, di); const ls = await T.linesFull(p, di, /Vandal/); for (const l of ls) out.push({ di, sev: l.sev, text: l.text }) } return out }
  const show = ls => ls.map(l => `${DAYS[l.di]}: ${l.sev === 'hard' ? 'RED' : l.sev === 'adv' ? 'amber' : 'note'} ${l.text.replace(/ ✕$/, '')}`).join(' || ') || '(none)'
  const kind = { long: /long work day/i, rest: /crew rest/i, run: /in a row/i }
  const vt = h => (h.rows.find(r => r.nm === 'Vandal') || {}).vt || ''
  const w1 = await sweep()
  const h1 = await T.hours(p, ['Vandal']); const s1 = await T.insPicAt(p, 'p216-1-hours-before', 'Vandal'); await T.insShut(p)
  const has1 = Object.fromEntries(Object.entries(kind).map(([k, re]) => [k, w1.filter(l => re.test(l.text))]))
  judge('P2-16.1', `SETUP through the board on each day (a new wave, VX, Vandal in the front seat): ${built.join(' · ')}. Then every day's warning list read for lines naming Vandal, and Insights.`, [
    ['Vandal is on the programme on seven consecutive days, 39h30 in all (4h ×5, Wed 13h30, Thu 6h)', T.dmin(h0, h1, 'Vandal') === 2370 && /7 days/.test(vt(h1)), `Work hours ${T.delta(h0, h1, 'Vandal')} · the figure's hover text "${vt(h1)}"`],
    ['a long-work-day line for Wednesday', has1.long.some(l => l.di === 2), show(has1.long)],
    ['a crew-rest line for the Wed → Thu gap', has1.rest.length > 0, show(has1.rest)],
    ['a days-in-a-row line', has1.run.length > 0, show(has1.run)],
  ], [s1])
  row('P2-16.1h', 'every line naming Vandal, all seven days, before the change', show(w1), 'INFO')

  /* tap each warning and read what lights */
  const taps = []
  const tap = async (label, re, pref) => {
    const hit = (pref != null ? w1.filter(l => l.di === pref) : w1).find(l => re.test(l.text)) || w1.find(l => re.test(l.text)); if (!hit) { taps.push({ label, none: true }); return null }
    await T.toEdit(p); await T.openList(p, '#eWeek', hit.di); await T.listShow(p, hit.di, new RegExp(hit.text.slice(-60).replace(/ ✕$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    const ix = await p.evaluate(([d, t]) => [...document.querySelectorAll(`#eWeek .day[data-day="${d}"] [data-dwbox="${d}"] .witem`)].findIndex(e => e.innerText.replace(/\s+/g, ' ').trim() === t), [hit.di, hit.text])
    const ln = p.locator(`#eWeek .day[data-day="${hit.di}"] [data-dwbox="${hit.di}"] .witem`).nth(ix)
    await ln.click({ position: { x: 70, y: 14 } }); await L.sleep(600)
    const lit = await p.evaluate(() => { const f = [...document.querySelectorAll('#eWeek .puck.wfoc')].filter(e => e.offsetParent !== null); const names = f.map(e => { const d = e.closest('.day[data-day]'); return ((window.PEOPLE[e.dataset.person] || {}).cs || e.dataset.person) + '@' + ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d ? +d.dataset.day : 0] }); const on = [...document.querySelectorAll('#eWeek .witem.on')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90)); const boxes = [...document.querySelectorAll('#eWeek .intimes.wfoc')].map(e => e.dataset.intimes); return { names: [...new Set(names)], on, boxes, dim: document.querySelectorAll('#eWeek .puck.dim').length } })
    const shot = await pic(p, 'p216-tap-' + label)
    /* clear the focus the way a person does: tap the same line again */
    await ln.click({ position: { x: 70, y: 14 } }).catch(() => {}); await L.sleep(300)
    taps.push({ label, day: DAYS[hit.di], text: hit.text.slice(0, 120), lit, shot }); return lit
  }
  await tap('long', kind.long, 2)
  await tap('rest', /Crew rest \(<12h\)/, 3)
  await tap('run', /No break day/, 6)
  const tapOk = taps.filter(t => !t.none).every(t => t.lit.names.length > 0 && t.lit.names.every(n => /^Vandal@/.test(n)))
  judge('P2-16.2', 'Each of the three warnings tapped in its day\'s list on Edit Schedule (a tap on the line\'s words), and what the week lights read after each.', [
    ['EXPECTED: trace clicks identify the proper cause — each tap marks its own line and lights Vandal\'s pucks (and nobody else\'s)', taps.length === 3 && taps.every(t => !t.none) && tapOk, taps.map(t => t.none ? `${t.label}: no such line to tap` : `${t.label} (${t.day} "${t.text.slice(0, 70)}…") → line marked: ${t.lit.on.length ? 'yes' : 'NO'}; lit pucks: ${t.lit.names.join(', ') || 'none'}; reporting boxes lit: ${t.lit.boxes.join(', ') || 'none'}; dimmed pucks: ${t.lit.dim}`).join(' || ')],
  ], taps.filter(t => t.shot).map(t => t.shot))

  /* shorten the long day: Wednesday's in-time 06:00 → 08:00 */
  await T.boardAt(p, 2); await T.itType(p, 'board', 2, gis[2], 0, '08:00 IN TIME'); await T.itShow(p, 'board', 2, gis[2]); const s3 = await pic(p, 'p216-3-wed-board-0800'); await W.boardOff(p)
  const w2 = await sweep()
  const h2 = await T.hours(p, ['Vandal']); const s4 = await T.insPicAt(p, 'p216-4-hours-after', 'Vandal'); await T.insShut(p)
  const has2 = Object.fromEntries(Object.entries(kind).map(([k, re]) => [k, w2.filter(l => re.test(l.text))]))
  if (has2.run.length) { await T.toEdit(p); await T.openList(p, '#eWeek', has2.run[0].di); await T.listShow(p, has2.run[0].di, kind.run) }
  const s5 = await pic(p, 'p216-5-run-line-after')
  judge('P2-16.3', 'Wednesday\'s board: the reporting line retyped "08:00 IN TIME" + Tab (08:00 → 19:30 = 11h30; Wednesday is still worked). Every day\'s list and Insights read again.', [
    ['EXPECTED: hours and the long-day warning update together — Vandal 2h less (37h30) and the long-work-day line gone', T.dmin(h0, h2, 'Vandal') === 2250 && !has2.long.length, `Work hours ${h1.fig.Vandal} → ${h2.fig.Vandal} · long-day lines now: ${show(has2.long)}`],
    ['EXPECTED: the seven-day warning remains', has2.run.length > 0 && has1.run.length > 0, `before: ${show(has1.run)} · after: ${show(has2.run)}`],
    ['fixing the long day does not hide the rest warning (Wednesday still ends 19:30, Thursday still reports 05:00)', has2.rest.length === has1.rest.length && has1.rest.length > 0, `before: ${show(has1.rest)} · after: ${show(has2.rest)}`],
    ['still seven days on the programme', /7 days/.test(vt(h2)), `hover text "${vt(h2)}"`],
  ], [s3, s4, s5])
  row('P2-16.3h', 'every line naming Vandal, all seven days, after the change', show(w2), 'INFO')
})
