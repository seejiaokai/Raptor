/* walker TO — P2-06: specific overrides apply separately to each activity (in-time and Rally resolved apart).
   Monday, a NEW wave (the demo's own Monday crews carry other work): VL = Comet/Cinder, RU = Havoc/Dash, both T/O 12:00,
   landing 13:00. None of the four holds anything else on Monday, so each one's weekly Work-hours figure moves by exactly
   Monday's span: report → landing 13:00 + the 2h debrief (15:00). */
import * as T from './stk-TO-lib.mjs'
const { W, row, judge, pic, PHONE } = T
const DI = 0, WHO = ['Comet', 'Cinder', 'Havoc', 'Dash']
await T.run('P2-06', async p => {
  const h0 = await T.hours(p, WHO); const s0 = await T.insPicAt(p, 'p206-0-hours-before', 'Comet'); await T.insShut(p)
  /* build the wave on the board */
  const lay = await T.boardAt(p, DI)
  const gi = await T.addWave(p, DI)
  const a = await T.newForm(p, DI, gi, { cs: 'VL', to: '1200', ld: '1300' }, ['Comet', 'Cinder'])
  const li = await T.addLine(p, DI, gi)
  const b = await T.newForm(p, DI, { gi, li }, { cs: 'RU', to: '1200', ld: '1300' }, ['Havoc', 'Dash'])
  await T.itShow(p, 'board', DI, gi); const s1 = await pic(p, 'p206-1-wave-built-board')
  const built = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations.map(f => `${f.cs} ${f.to}-${f.ld} ${f.aircraft.map(x => (window.PEOPLE[x.p] || {}).cs + '/' + (window.PEOPLE[x.w] || {}).cs).join(',')}`).join(' | '), [DI, gi])
  await W.boardOff(p)
  const h1 = await T.hours(p, WHO); await T.insShut(p)
  judge('P2-06.0', `SETUP — board (${PHONE ? (lay.wide ? 'phone, Desktop layout' : 'phone layout') : 'desktop'}) Monday: "+ Wave" → "Flying wave" (wave ${gi + 1}); VL typed 1200/1300, Comet and Cinder seated from the crew list; "+ Line"; RU typed 1200/1300, Havoc and Dash seated. No reporting line yet.`, [
    ['the wave holds VL and RU, both 12:00–13:00, with the four people', /VL 12:00-13:00 Comet\/Cinder \| RU 12:00-13:00 Havoc\/Dash/.test(built), built],
    ['all four seats took', a.ok && b.ok, [...a.seats, ...b.seats].map(s => `${s.cs}:${s.took ? 'on' : 'NOT ON ' + (s.err || '')}`).join(' ')],
  ], [s0, s1])
  const held1 = {}; for (const n of WHO) held1[n] = await T.held(p, DI, n)
  row('P2-06.0h', 'for the record: Insights Work hours BEFORE any reporting line is typed (take-off 12:00, landing 13:00, debrief 2h; Logic says the nominal report is 3h before take-off)', WHO.map(n => `${n} ${T.delta(h0, h1, n)}`).join(' · ') + ' — held: ' + WHO.map(n => `${n}: ${held1[n]}`).join(' || '), 'INFO')

  /* general In-time 08:00 and VL Rally 08:30 — typed on the WEEK */
  await T.toEdit(p); await W.showDay(p, DI); await T.itShow(p, 'week', DI, gi)
  const add1 = await T.itAdd(p, 'week', DI, gi)
  const t1 = await T.itType(p, 'week', DI, gi, 0, '08:00 IN TIME')
  const add2 = await T.itAdd(p, 'week', DI, gi)
  const t2 = await T.itType(p, 'week', DI, gi, 1, '08:30 VL RALLY')
  await T.itShow(p, 'week', DI, gi); const s2 = await pic(p, 'p206-2-week-two-lines')
  const wk = await T.itRead(p, 'week', DI, gi)
  await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi); const bd = await T.itRead(p, 'board', DI, gi); const s3 = await pic(p, 'p206-3-board-two-lines')
  await W.boardOff(p)
  const h2 = await T.hours(p, WHO); const s4 = await T.insPicAt(p, 'p206-4-hours-both-0800', 'Comet'); const s4b = await T.insPicAt(p, 'p206-4b-hours-both-0800-havoc', 'Havoc'); await T.insShut(p)
  const held2 = {}; for (const n of WHO) held2[n] = await T.held(p, DI, n)
  judge('P2-06.1', `Edit Schedule's week, the new wave: "+ In-time / Rally" pressed (it filled "${add1.added}"), the line retyped "08:00 IN TIME" + Tab; pressed again (it filled "${add2.added}"), retyped "08:30 VL RALLY" + Tab. Then both crews inspected in Insights' Work hours.`, [
    ['the week shows the two lines as typed', wk.lines.length === 2 && /08:00.*IN TIME/.test(wk.lines[0]) && /08:30.*VL RALLY/.test(wk.lines[1]), wk.lines.join(' / ')],
    ['the board shows the same two lines', JSON.stringify(bd.lines) === JSON.stringify(wk.lines), bd.lines.join(' / ') + (bd.hdr ? ' · header "' + bd.hdr + '"' : '')],
    ['EXPECTED: initially BOTH crews report at 08:00 — VL (Comet, Cinder) 08:00 → 15:00 = 7h', ['Comet', 'Cinder'].every(n => T.dmin(h0, h2, n) === 420), ['Comet', 'Cinder'].map(n => `${n} ${T.delta(h0, h2, n)}`).join(' · ')],
    ['EXPECTED: RU (Havoc, Dash) 08:00 → 15:00 = 7h', ['Havoc', 'Dash'].every(n => T.dmin(h0, h2, n) === 420), ['Havoc', 'Dash'].map(n => `${n} ${T.delta(h0, h2, n)}`).join(' · ')],
    ['no timing message under the lines (08:00 in-time, 08:30 Rally, suggested brief 09:40, T/O 12:00 are in order)', !wk.fb && !bd.fb, `week "${wk.fb}" board "${bd.fb}"`],
  ], [s2, s3, s4, s4b])
  row('P2-06.1h', 'what the app holds for Monday after those two lines (read only, for the record)', WHO.map(n => `${n}: ${held2[n]}`).join(' || '), 'INFO')

  /* add VL In-time 09:00 — typed on the BOARD */
  await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi)
  const add3 = await T.itAdd(p, 'board', DI, gi)
  const t3 = await T.itType(p, 'board', DI, gi, 2, '09:00 VL IN TIME')
  await T.itShow(p, 'board', DI, gi); const s5 = await pic(p, 'p206-5-board-three-lines')
  const bd3 = await T.itRead(p, 'board', DI, gi)
  await W.boardOff(p); await W.showDay(p, DI); await T.itShow(p, 'week', DI, gi); const wk3 = await T.itRead(p, 'week', DI, gi); const s6 = await pic(p, 'p206-6-week-three-lines')
  const h3 = await T.hours(p, WHO); const s7 = await T.insPicAt(p, 'p206-7-hours-vl-0830', 'Comet'); const s7b = await T.insPicAt(p, 'p206-7b-hours-ru-0800', 'Havoc'); await T.insShut(p)
  const held3 = {}; for (const n of WHO) held3[n] = await T.held(p, DI, n)
  const lst = await T.listOf(p, DI); const mine = await T.linesFull(p, DI, /in-time 09:00|rally 08:30|08:30/)
  await T.listShow(p, DI, /in-time 09:00|rally 08:30/); const s8 = await pic(p, 'p206-8-monday-list')
  judge('P2-06.2', `The board, the same wave: "+ In-time / Rally" pressed (it filled "${add3.added}"), the line retyped "09:00 VL IN TIME" + Tab. Both crews inspected again.`, [
    ['the board and the week show the three lines', bd3.lines.length === 3 && JSON.stringify(bd3.lines) === JSON.stringify(wk3.lines), bd3.lines.join(' / ')],
    ['EXPECTED: VL now starts at 08:30 (its own in-time 09:00 replaces the wave\'s 08:00; its Rally 08:30 is the earliest) — 08:30 → 15:00 = 6h30', ['Comet', 'Cinder'].every(n => T.dmin(h0, h3, n) === 390), ['Comet', 'Cinder'].map(n => `${n} ${T.delta(h0, h3, n)}`).join(' · ')],
    ['EXPECTED: RU still starts at 08:00 — 7h', ['Havoc', 'Dash'].every(n => T.dmin(h0, h3, n) === 420), ['Havoc', 'Dash'].map(n => `${n} ${T.delta(h0, h3, n)}`).join(' · ')],
  ], [s5, s6, s7, s7b, s8])
  row('P2-06.2h', 'for the record: what the board prints under the lines, Monday\'s list for this wave, and what the app holds', `under the lines — board "${bd3.fb}" · week "${wk3.fb}" · board header "${bd3.hdr}" · Monday's bar "${lst.bar}" · list lines naming these clocks: ${mine.map(m => (m.sev === 'hard' ? 'RED ' : m.sev + ' ') + m.text).join(' | ') || '(none)'} · held: ${WHO.map(n => `${n}: ${held3[n]}`).join(' || ')}`, 'INFO')
})
