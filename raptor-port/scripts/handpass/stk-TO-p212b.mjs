/* walker TO — P2-12, second pass: WHICH step makes Insights print "NaN min", and when the app explains an unresolved
   line. Friday, one new wave, Vandal / Ryder; one change at a time, Insights read after each. */
import * as T from './stk-TO-lib.mjs'
const { W, L, row, judge, pic } = T
const DI = 4, WHO = ['Vandal', 'Ryder']
await T.run('P2-12b', async p => {
  const h0 = await T.hours(p, WHO); await T.insShut(p)
  await T.boardAt(p, DI)
  const gi = await T.addWave(p, DI)
  const steps = []
  const read = async (label, shot = null) => {
    await T.toEdit(p); await W.showDay(p, DI)
    const wk = await T.itRead(p, 'week', DI, gi); const lst = await T.listOf(p, DI); const mine = await T.linesFull(p, DI, /In-time \/ Rally|reporting|rally|in-time|check|NaN|Vandal|Ryder/i)
    const h = await T.hours(p, WHO)
    const bad = h.rows.filter(r => /NaN|undefined|-|Infinity/.test(r.v)).map(r => `${r.nm} "${r.v}" (bar ${r.pct}% of the track)`)
    const tiles = await p.evaluate(() => [...document.querySelectorAll('#insightBody .itile')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' | '))
    const pics = []
    if (shot) pics.push(await T.insPicAt(p, shot + '-hours', bad.length ? h.rows.find(r => /NaN/.test(r.v)).nm : 'Vandal'))
    await T.insShut(p)
    await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi); const bd = await T.itRead(p, 'board', DI, gi)
    if (shot) pics.push(await pic(p, shot + '-board'))
    const s = { label, fig: WHO.map(n => `${n} ${h.fig[n]}`).join(' · '), bad, top: h.rows.slice(0, 3).map(r => `${r.nm} ${r.v} ${r.pct}%`).join(', '), lines: bd.lines.join(' / ') || '(no line)', fb: bd.fb, bar: lst.bar, mine: T.fullStr(mine), held: await T.held(p, DI, 'Vandal'), tiles, pics, n: h.n }
    steps.push(s); return s
  }
  const st = s => `${s.label}: Work hours ${s.fig}${s.bad.length ? ' — INVALID: ' + s.bad.join(', ') : ''}; top of the list: ${s.top}; lines "${s.lines}"; under them "${s.fb}"; Friday's bar "${s.bar}"; list ${s.mine}; held for Vandal: ${s.held}`
  /* 1 — crew on a formation with no take-off, no reporting line */
  await T.seat(p, `${DI}.${gi}.0.0.p`, 'Vandal'); await T.seat(p, `${DI}.${gi}.0.0.w`, 'Ryder')
  const a = await read('1 · Vandal / Ryder seated on a new formation with NO take-off and NO reporting line', 'p212b-1-crew-no-takeoff')
  /* 2 — "RALLY AFTER IN TIME" */
  await T.boardAt(p, DI); await T.itAdd(p, 'board', DI, gi); await T.itType(p, 'board', DI, gi, 0, 'RALLY AFTER IN TIME')
  const b = await read('2 · the line "RALLY AFTER IN TIME" added (still no take-off)')
  /* 3 — the line removed, an invalid clock instead */
  await T.boardAt(p, DI); await T.itType(p, 'board', DI, gi, 0, '25:70 IN TIME')
  const c = await read('3 · the line retyped "25:70 IN TIME" (still no take-off)')
  /* 4 — a landing but no take-off */
  await T.boardAt(p, DI); await T.itDel(p, 'board', DI, gi, 0); await T.form(p, DI, gi, 0, { ld: '1300' })
  const d = await read('4 · no reporting line; landing typed 1300, take-off still blank')
  /* 5 — take-off typed: the formation is whole */
  await T.boardAt(p, DI); await T.form(p, DI, gi, 0, { cs: 'VL', to: '1200' })
  const e = await read('5 · VL, take-off 1200, landing 1300, no reporting line')
  /* 6 — an invalid clock with a valid take-off */
  await T.boardAt(p, DI); await T.itAdd(p, 'board', DI, gi); await T.itType(p, 'board', DI, gi, 0, '25:70 IN TIME')
  const f = await read('6 · with the take-off in place, the line "25:70 IN TIME"', 'p212b-6-invalid-clock-with-takeoff')
  /* 7 — RALLY AFTER IN TIME with no in-time, valid take-off */
  await T.boardAt(p, DI); await T.itType(p, 'board', DI, gi, 0, 'RALLY AFTER IN TIME')
  const g = await read('7 · with the take-off in place, the only line "RALLY AFTER IN TIME" (no in-time anywhere)', 'p212b-7-rally-after-with-takeoff')
  /* 8 — the take-off cleared again: does NaN come back */
  await T.boardAt(p, DI); await T.itDel(p, 'board', DI, gi, 0); await T.form(p, DI, gi, 0, { to: '' })
  const h = await read('8 · the take-off box cleared again (landing 13:00 left), no reporting line', 'p212b-8-takeoff-cleared')
  judge('P2-12.N', 'Second pass, one change at a time on a new Friday wave with Vandal / Ryder; Insights\' Work hours read after each (eight reads).', [
    ['a crew on a formation with no take-off never shows an invalid Work-hours figure', !a.bad.length && !b.bad.length && !c.bad.length && !d.bad.length && !h.bad.length, [a, b, c, d, h].map(s => `${s.label.slice(0, 1)}: ${s.bad.length ? s.bad.join(', ') : s.fig}`).join(' || ')],
    ['with a take-off, an invalid clock or an unresolved "RALLY AFTER IN TIME" never shows an invalid figure', !e.bad.length && !f.bad.length && !g.bad.length, [e, f, g].map(s => `${s.label.slice(0, 1)}: ${s.bad.length ? s.bad.join(', ') : s.fig}`).join(' || ')],
    ['with a take-off, the invalid clock and the unresolved Rally are each explained on screen', (!!f.fb || /25:70|unrecogni|check/i.test(f.mine)) && (!!g.fb || /RALLY AFTER|check|in-time/i.test(g.mine)), `6: under the line "${f.fb}", list ${f.mine} || 7: under the line "${g.fb}", list ${g.mine}`],
  ], steps.flatMap(s => s.pics))
  steps.forEach((s, i) => row(`P2-12.N${i + 1}`, s.label, st(s), 'INFO', s.pics))
})
