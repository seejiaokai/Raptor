/* walker TO — P2-07: duplicate lines compare dates before clocks.
   Tuesday, a NEW wave: one formation NX, take-off 01:00, landing 02:00, Vandal / Ryder (neither holds anything on Monday
   or Tuesday, so each one's weekly Work-hours figure is exactly this line's span). Its in-time is entered twice — 23:00 and
   00:15 — then the two lines are swapped by retyping them. 23:00 is later than the 01:00 take-off, so it is the evening
   before: 23:00 → landing 02:00 + 2h debrief (04:00) = 5h. If 00:15 won: 00:15 → 04:00 = 3h45. */
import * as T from './stk-TO-lib.mjs'
const { W, row, judge, pic, PHONE } = T
const DI = 1, WHO = ['Vandal', 'Ryder']
await T.run('P2-07', async p => {
  const h0 = await T.hours(p, WHO); await T.insShut(p)
  const lay = await T.boardAt(p, DI)
  const gi = await T.addWave(p, DI)
  const a = await T.newForm(p, DI, gi, { cs: 'NX', to: '0100', ld: '0200' }, WHO)
  const built = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations.map(f => `${f.cs} ${f.to}-${f.ld} ${f.aircraft.map(x => (window.PEOPLE[x.p] || {}).cs + '/' + (window.PEOPLE[x.w] || {}).cs).join(',')}`).join(' | '), [DI, gi])
  await T.itShow(p, 'board', DI, gi); const s0 = await pic(p, 'p207-0-wave-built-board')
  await W.boardOff(p)
  judge('P2-07.0', `SETUP — board (${PHONE ? 'phone layout' : 'desktop'}) Tuesday: "+ Wave" → "Flying wave" (wave ${gi + 1}); NX typed 0100 / 0200; Vandal and Ryder seated from the crew list.`, [
    ['the wave holds NX 01:00–02:00 with Vandal / Ryder', /NX 01:00-02:00 Vandal\/Ryder/.test(built), built],
    ['both seats took', a.ok, a.seats.map(s => `${s.cs}:${s.took ? 'on' : 'NOT ON ' + (s.err || '')}`).join(' ')],
  ], [s0])

  /* the two in-time lines, typed on the week: 23:00 first, 00:15 second */
  await T.toEdit(p); await W.showDay(p, DI); await T.itShow(p, 'week', DI, gi)
  const add1 = await T.itAdd(p, 'week', DI, gi)
  await T.itType(p, 'week', DI, gi, 0, '23:00 NX IN TIME')
  const add2 = await T.itAdd(p, 'week', DI, gi)
  await T.itType(p, 'week', DI, gi, 1, '00:15 NX IN TIME')
  await T.itShow(p, 'week', DI, gi); const wk1 = await T.itRead(p, 'week', DI, gi); const s1 = await pic(p, 'p207-1-week-2300-then-0015')
  await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi); const bd1 = await T.itRead(p, 'board', DI, gi); const s2 = await pic(p, 'p207-2-board-2300-then-0015')
  await W.boardOff(p)
  const h1 = await T.hours(p, WHO); const s3 = await T.insPicAt(p, 'p207-3-hours-2300-first', 'Vandal'); await T.insShut(p)
  const held1 = await T.held(p, DI, 'Vandal')
  const tue1 = await T.listOf(p, DI); const tueMine1 = await T.linesFull(p, DI, /NX|Vandal|Ryder/)
  judge('P2-07.1', `Edit Schedule's week, the new wave: "+ In-time / Rally" (it filled "${add1.added}"), retyped "23:00 NX IN TIME" + Tab; "+ In-time / Rally" again (it filled "${add2.added}"), retyped "00:15 NX IN TIME" + Tab. Insights opened (${h1.how}).`, [
    ['the two lines show on the week in the order typed', wk1.lines.length === 2 && /23:00/.test(wk1.lines[0]) && /00:15/.test(wk1.lines[1]), wk1.lines.join(' / ')],
    ['the board shows the same', JSON.stringify(bd1.lines) === JSON.stringify(wk1.lines), bd1.lines.join(' / ') + ' · header "' + bd1.hdr + '"'],
    ['EXPECTED: the previous-day 23:00 is the earliest — Vandal and Ryder each 23:00 → 04:00 = 5h', WHO.every(n => T.dmin(h0, h1, n) === 300), WHO.map(n => `${n} ${T.delta(h0, h1, n)}`).join(' · ')],
    ['no negative figure anywhere in Work hours', !h1.neg.length, h1.neg.map(r => r.nm + ' ' + r.v).join(', ') || 'none'],
  ], [s1, s2, s3])

  /* reverse their order by editing the two lines (on the board): 00:15 first, 23:00 second */
  await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi)
  await T.itType(p, 'board', DI, gi, 0, '00:15 NX IN TIME')
  const mid = await T.itRead(p, 'board', DI, gi)
  await W.boardOff(p); const hMid = await T.hours(p, WHO); await T.insShut(p)
  await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi)
  await T.itType(p, 'board', DI, gi, 1, '23:00 NX IN TIME')
  await T.itShow(p, 'board', DI, gi); const bd2 = await T.itRead(p, 'board', DI, gi); const s4 = await pic(p, 'p207-4-board-0015-then-2300')
  await W.boardOff(p); await W.showDay(p, DI); await T.itShow(p, 'week', DI, gi); const wk2 = await T.itRead(p, 'week', DI, gi); const s5 = await pic(p, 'p207-5-week-0015-then-2300')
  const h2 = await T.hours(p, WHO); const s6 = await T.insPicAt(p, 'p207-6-hours-0015-first', 'Vandal'); await T.insShut(p)
  const held2 = await T.held(p, DI, 'Vandal')
  const tue2 = await T.listOf(p, DI); const tueMine2 = await T.linesFull(p, DI, /NX|Vandal|Ryder/)
  await T.listShow(p, DI, /NX|Vandal|Ryder/); const s7 = await pic(p, 'p207-7-tuesday-list')
  judge('P2-07.2', 'The board: line 1 retyped "00:15 NX IN TIME" + Tab, then line 2 retyped "23:00 NX IN TIME" + Tab — the same two instructions, their order reversed. Insights opened again.', [
    ['the lines now read 00:15 first, 23:00 second, on the board and the week', bd2.lines.length === 2 && /00:15/.test(bd2.lines[0]) && /23:00/.test(bd2.lines[1]) && JSON.stringify(bd2.lines) === JSON.stringify(wk2.lines), bd2.lines.join(' / ')],
    ['EXPECTED: previous-day 23:00 remains the earliest; work hours do not change — still 5h each', WHO.every(n => T.dmin(h0, h2, n) === 300), WHO.map(n => `${n} ${T.delta(h0, h2, n)} (was ${h1.fig[n]})`).join(' · ')],
    ['no negative figure anywhere in Work hours', !h2.neg.length, h2.neg.map(r => r.nm + ' ' + r.v).join(', ') || 'none'],
  ], [s4, s5, s6, s7])
  row('P2-07.h', 'for the record: the half-way state (both lines reading 00:15), what is printed beside the lines, Tuesday\'s list, and what the app holds', `half-way (lines "${mid.lines.join(' / ')}"): ${WHO.map(n => `${n} ${hMid.fig[n]}`).join(' · ')} · under the lines after step 1: week "${wk1.fb}" board "${bd1.fb}"; after the swap: week "${wk2.fb}" board "${bd2.fb}" · board header after the swap "${bd2.hdr}" · does any line or the header carry words for "previous day"? ${/prev|day before|-1|D-1|yesterday|Mon/i.test(bd2.lines.join(' ') + bd2.hdr + bd2.boxText) ? 'yes: ' + bd2.boxText.slice(0, 120) : 'NO — the 23:00 line and the header show the bare clock'} · Tuesday's bar "${tue2.bar}" · Tuesday lines naming NX / Vandal / Ryder: before the swap ${T.fullStr(tueMine1)}; after ${T.fullStr(tueMine2)} · held for Vandal: step 1 "${held1}"; after the swap "${held2}"`, 'INFO')
})
