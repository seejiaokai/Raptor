/* walker TO — H-01: the fault this piece was built to fix — no negative work hours.
   A fresh world, nothing published. Monday's later wave (wave 2, night) carries evening reporting clocks. One of its
   formations — RU (Piston / Relay, Outlaw / Wisp), reporting line "19:20H: NIGHT WAVE RU IN TIME + WX/NOTAMS" — has its
   take-off and landing retyped 10:00 and 11:25; the reporting lines are left alone. Then Insights. */
import * as T from './stk-TO-lib.mjs'
const { W, row, judge, pic } = T
const DI = 0, GI = 1, LI = 1, WHO = ['Piston', 'Relay', 'Outlaw', 'Wisp']
await T.run('H-01', async p => {
  const h0 = await T.hours(p, WHO); const s0 = await T.insPicAt(p, 'h01-0-hours-before', 'Outlaw'); await T.insShut(p)
  await T.boardAt(p, DI); await T.itShow(p, 'board', DI, GI)
  const before = await T.itRead(p, 'board', DI, GI)
  const crew0 = await p.evaluate(([d, g, l]) => { const f = window.DAYS[d].waves[g].formations[l]; return `${f.cs} ${f.to}-${f.ld}: ` + f.aircraft.map(x => (window.PEOPLE[x.p] || {}).cs + '/' + (window.PEOPLE[x.w] || {}).cs).join(', ') }, [DI, GI, LI])
  const held0 = await T.held(p, DI, 'Outlaw')
  const s1 = await pic(p, 'h01-1-board-before')
  /* the action: take-off 10:00, landing 11:25 (the boxes repeat on each aircraft row; the first is typed) */
  const typed = await T.form(p, DI, GI, LI, { to: '1000', ld: '1125' })
  await T.itShow(p, 'board', DI, GI)
  const after = await T.itRead(p, 'board', DI, GI)
  const crew1 = await p.evaluate(([d, g, l]) => { const f = window.DAYS[d].waves[g].formations[l]; return `${f.cs} ${f.to}-${f.ld}` }, [DI, GI, LI])
  const s2 = await pic(p, 'h01-2-board-after')
  const bw = await T.readBoard(p)
  await W.boardOff(p)
  const h1 = await T.hours(p, WHO)
  const s3 = await T.insPicAt(p, 'h01-3-hours-after-outlaw', 'Outlaw')
  const max = Math.max(...h1.rows.map(r => T.mins(r.v) || 0))
  /* every bar against its figure: a bar far wider than its share of the longest figure is a bar "running full width" */
  const odd = h1.rows.filter(r => { const m = T.mins(r.v); if (m == null) return true; const want = Math.round(100 * m / max); return Math.abs((r.pct || 0) - want) > 6 }).map(r => `${r.nm} ${r.v} bar ${r.pct}%`)
  const top = h1.rows.slice(0, 4).map(r => `${r.nm} ${r.v} (${r.pct}%)`).join(', ')
  await p.evaluate(() => { const hs = [...document.querySelectorAll('#insightBody .isec-h')]; const h = hs.find(e => /Work hours/i.test(e.innerText)); if (h) h.scrollIntoView({ block: 'start' }) }); await T.sleep(250)
  const s4 = await pic(p, 'h01-4-hours-after-top')
  await T.insShut(p)
  const held1 = await T.held(p, DI, 'Outlaw')
  const lst = await T.listOf(p, DI); const mine = await T.linesFull(p, DI, /RU: |Outlaw|Wisp/)
  await W.showDay(p, DI); await T.itShow(p, 'week', DI, GI); const wk = await T.itRead(p, 'week', DI, GI)
  const s5w = await pic(p, 'h01-5-week-wave2-after')
  await T.listShow(p, DI, /Outlaw has a long work day/); const s5 = await pic(p, 'h01-6-monday-list-long-day-lines')
  const ruMsg = [after.fb, ...mine.map(m => m.text)].join(' ')
  judge('H-01', `Fresh world, nothing published. Monday on the Scheduler Board; wave 2 (night) reads "${before.lines.join(' / ')}". Its RU formation (${crew0}) retyped take-off 1000, landing 1125 (now ${crew1}); the reporting lines left as they are. Insights opened (${h1.how}).`, [
    ['EXPECTED: no person\'s Work-hours figure is negative', !h1.neg.length && h1.rows.every(r => T.mins(r.v) != null && T.mins(r.v) >= 0), `${h1.n} people listed; negatives: ${h1.neg.map(r => r.nm + ' ' + r.v).join(', ') || 'none'}; unreadable: ${h1.rows.filter(r => T.mins(r.v) == null).map(r => r.nm + ' ' + r.v).join(', ') || 'none'}`],
    ['EXPECTED: no bar runs full width for a short day — every bar is as long as its figure\'s share of the longest', !odd.length, `longest: ${top}; bars out of step: ${odd.join(', ') || 'none'}`],
    ['EXPECTED: Monday\'s warning list says something about that formation\'s reporting time (a red line), or the reporting line now reads as the previous day', mine.some(m => m.sev === 'hard' && /RU: in-time 19:20/.test(m.text)) || /previous day/i.test(after.lines.join(' ') + after.fb), `under the wave's lines "${after.fb}" · Monday list lines for RU: ${T.fullStr(mine.filter(m => /RU: /.test(m.text)))}`],
  ], [s0, s1, s2, s3, s4, s5w, s5])
  row('H-01.h', 'every figure, for the record', `Work hours before → after: ${WHO.map(n => `${n} ${T.delta(h0, h1, n)}`).join(' · ')} · the reporting lines after the edit: "${after.lines.join(' / ')}" (week: "${wk.lines.join(' / ')}") · board header before "${before.hdr}" → after "${after.hdr}" · under the lines before "${before.fb}" → after "${after.fb}" · Monday's bar "${lst.bar}" · lines naming Outlaw / Wisp: ${T.fullStr(mine.filter(m => /Outlaw|Wisp/.test(m.text)))} · held for Outlaw before "${held0}" → after "${held1}"`, 'INFO')
})
