/* walker TO — P2-13: formation names are bounded; personal names are not targets.
   Friday, a new wave with two formations: VL (Vandal / Ryder) and VL2 (Nomad / Fable), both take-off 12:00, landing 13:00
   (the day ends 15:00 with the 2h debrief). None of the four holds anything else on Friday. */
import * as T from './stk-TO-lib.mjs'
const { W, row, judge, pic } = T
const DI = 4, VL = ['Vandal', 'Ryder'], VL2 = ['Nomad', 'Fable'], WHO = [...VL, ...VL2]
await T.run('P2-13', async p => {
  const h0 = await T.hours(p, WHO); await T.insShut(p)
  await T.boardAt(p, DI)
  const gi = await T.addWave(p, DI)
  const a = await T.newForm(p, DI, gi, { cs: 'VL', to: '1200', ld: '1300' }, VL)
  const li = await T.addLine(p, DI, gi)
  const b = await T.newForm(p, DI, { gi, li }, { cs: 'VL2', to: '1200', ld: '1300' }, VL2)
  const built = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations.map(f => `${f.cs} ${f.to}-${f.ld} ${f.aircraft.map(x => (window.PEOPLE[x.p] || {}).cs + '/' + (window.PEOPLE[x.w] || {}).cs).join(',')}`).join(' | '), [DI, gi])
  const rd = async () => { await W.boardOff(p); const h = await T.hours(p, WHO); await T.insShut(p); await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi); const bd = await T.itRead(p, 'board', DI, gi); return { h, bd, d: Object.fromEntries(WHO.map(n => [n, T.dmin(h0, h, n)])), s: WHO.map(n => `${n} ${T.delta(h0, h, n)}`).join(' · ') } }
  const r0 = await rd()
  /* 1 — "08:00 VL IN TIME" */
  await T.itAdd(p, 'board', DI, gi); await T.itType(p, 'board', DI, gi, 0, '08:00 VL IN TIME')
  const r1 = await rd(); const s1 = await pic(p, 'p213-1-board-vl-0800')
  judge('P2-13.1', `Friday board, a new wave: ${built}. With no reporting line the four read ${r0.s}. Then "+ In-time / Rally", the line retyped "08:00 VL IN TIME" + Tab.`, [
    ['all four seats took', a.ok && b.ok, built],
    ['VL\'s crew (Vandal, Ryder) report at 08:00: 08:00 → 15:00 = 7h', VL.every(n => r1.d[n] === 420), VL.map(n => `${n} ${T.delta(h0, r1.h, n)}`).join(' · ')],
    ['EXPECTED: VL\'s line does not target VL2 — Nomad and Fable are where they were with no line at all', VL2.every(n => r1.d[n] === r0.d[n]), VL2.map(n => `${n} ${T.delta(h0, r1.h, n)} (no line: ${T.hm(r0.d[n])})`).join(' · ') + ` · under the lines "${r1.bd.fb}" · header "${r1.bd.hdr}"`],
  ], [s1])
  /* 2 — an unnamed line holding only a crew member's name */
  await T.itAdd(p, 'board', DI, gi); await T.itType(p, 'board', DI, gi, 1, '07:00 NOMAD')
  const r2 = await rd(); const s2 = await pic(p, 'p213-2-board-0700-nomad')
  await T.itType(p, 'board', DI, gi, 1, '07:00 RYDER')
  const r2b = await rd(); const s2b = await pic(p, 'p213-3-board-0700-ryder')
  judge('P2-13.2', 'A second line holding a clock and only a crew member\'s name: "07:00 NOMAD" (Nomad flies in VL2) + Tab, read; then retyped "07:00 RYDER" (Ryder flies in VL) + Tab, read.', [
    ['EXPECTED: a personal name makes no rule for that one person — with "07:00 NOMAD", Nomad and his cockpit partner Fable read the same', r2.d.Nomad === r2.d.Fable, `${r2.s} · lines "${r2.bd.lines.join(' / ')}" · under them "${r2.bd.fb}"`],
    ['with "07:00 RYDER", Ryder and Vandal read the same, and Nomad and Fable read the same', r2b.d.Ryder === r2b.d.Vandal && r2b.d.Nomad === r2b.d.Fable, `${r2b.s} · lines "${r2b.bd.lines.join(' / ')}" · under them "${r2b.bd.fb}"`],
    ['the two wordings give the same four figures (the name changes nothing)', WHO.every(n => r2.d[n] === r2b.d[n]), `NOMAD: ${r2.s} || RYDER: ${r2b.s}`],
  ], [s2, s2b])
  /* 3 — clock spellings on the VL line */
  const sp = []
  for (const t of ['0800 VL IN TIME', '08:00H VL IN TIME', '0800H: VL IN TIME', '8:00 VL IN TIME', '08.00 VL IN TIME', '800 VL IN TIME']) {
    await T.itType(p, 'board', DI, gi, 0, t); const r = await rd(); sp.push({ t, shown: r.bd.lines[0], fb: r.bd.fb, vl: VL.map(n => T.hm(r.d[n])).join('/'), ok: VL.every(n => r.d[n] === 420) })
  }
  const s3 = await pic(p, 'p213-4-board-last-spelling')
  await T.itType(p, 'board', DI, gi, 0, '08:00 VL IN TIME')
  const colon = sp.filter(x => /^(0800|08:00H|0800H:|8:00) /.test(x.t))
  judge('P2-13.3', 'The VL line retyped with different clock spellings, one at a time, each left with Tab and Insights read: 0800 · 08:00H · 0800H: · 8:00 · 08.00 · 800.', [
    ['EXPECTED: accepted times normalise consistently — 0800, 08:00H, 0800H: and 8:00 each show as 08:00 and each give VL\'s crew the same 7h', colon.every(x => x.ok && /^08:00/.test(x.shown || '')), sp.map(x => `"${x.t}" → shows "${x.shown}", VL crew ${x.vl}${x.fb ? ', under it "' + x.fb + '"' : ''}`).join(' || ')],
  ], [s3])
  row('P2-13.3h', 'every spelling tried, as the screen showed it', sp.map(x => `"${x.t}" → shows "${x.shown}" · VL crew +${x.vl} · under the lines "${x.fb}"`).join(' || '), 'INFO')
  /* 4 — the longer name the other way round */
  await T.itType(p, 'board', DI, gi, 1, '06:00 VL2 IN TIME')
  const r4 = await rd(); const s4 = await pic(p, 'p213-5-board-vl2-0600')
  await W.boardOff(p); const hx = await T.hours(p, WHO); const s5 = await T.insPicAt(p, 'p213-6-hours-end', 'Vandal'); await T.insShut(p)
  judge('P2-13.4', 'The second line retyped "06:00 VL2 IN TIME" + Tab (lines now: "08:00 VL IN TIME", "06:00 VL2 IN TIME").', [
    ['VL2\'s crew report at 06:00: 06:00 → 15:00 = 9h', VL2.every(n => r4.d[n] === 540), VL2.map(n => `${n} ${T.delta(h0, r4.h, n)}`).join(' · ')],
    ['EXPECTED: no partial callsign matching — VL\'s crew stay at 08:00 (7h)', VL.every(n => r4.d[n] === 420), VL.map(n => `${n} ${T.delta(h0, r4.h, n)}`).join(' · ') + ` · under the lines "${r4.bd.fb}"`],
  ], [s4, s5])
})
