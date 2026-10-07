/* walker TO — P2-12: missing and malformed clocks do not invent attendance.
   Friday, a new wave as "+ Wave" makes it: one formation with no callsign, no take-off, no crew. Reporting text
   "RALLY AFTER IN TIME". Then a crew (Vandal / Ryder, nothing else that day), an invalid clock, then a valid take-off and
   in-time, then the formation's line cancelled with its CX. Insights' Work hours read at every stage. */
import * as T from './stk-TO-lib.mjs'
const { W, L, row, judge, pic } = T
const DI = 4, WHO = ['Vandal', 'Ryder']
await T.run('P2-12', async p => {
  const h0 = await T.hours(p, WHO); await T.insShut(p)
  await T.boardAt(p, DI)
  const gi = await T.addWave(p, DI)
  const stage = async (name, show = /In-time \/ Rally|reporting|rally|in-time|check/i) => {
    await T.toEdit(p); await W.showDay(p, DI)
    const wk = await T.itRead(p, 'week', DI, gi); const lst = await T.listOf(p, DI); const mine = await T.linesFull(p, DI, show)
    const h = await T.hours(p, WHO); const pInsights = name ? await T.insPicAt(p, name + '-hours', 'Vandal') : null; await T.insShut(p)
    await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi); const bd = await T.itRead(p, 'board', DI, gi)
    const pBoard = name ? await pic(p, name + '-board') : null
    const editable = await p.evaluate(([d, g]) => { const e = document.querySelector(`#sbBoard [data-itline^="${d}|${g}|"]`); const to = document.querySelector(`#sbBoard [data-bfld="ff:${d}.${g}.0.to"]`); return { line: e ? e.getAttribute('contenteditable') : null, to: to ? !to.disabled && !to.readOnly : null } }, [DI, gi])
    return { wk, bd, bar: lst.bar, mine, h, held: await T.held(p, DI, 'Vandal'), pics: [pBoard, pInsights].filter(Boolean), editable }
  }
  /* A — no take-off, nobody on it, "RALLY AFTER IN TIME" */
  await T.itShow(p, 'board', DI, gi)
  const add = await T.itAdd(p, 'board', DI, gi)
  await T.itType(p, 'board', DI, gi, 0, 'RALLY AFTER IN TIME')
  const A = await stage('p212-A')
  judge('P2-12.A', `Friday board: "+ Wave" → "Flying wave" (one formation, no callsign, no take-off, no crew). "+ In-time / Rally" pressed — with no take-off it filled "${add.added}" — and the line retyped "RALLY AFTER IN TIME" + Tab.`, [
    ['the text is kept as typed and stays editable', /RALLY AFTER IN TIME/.test(A.bd.lines.join(' ')) && A.editable.line === 'true' && A.editable.to === true, `line "${A.bd.lines.join(' / ')}" · line box editable ${A.editable.line} · take-off box editable ${A.editable.to}`],
    ['EXPECTED: the missing data stays explainable — the app says something about the unresolved instruction (under the line or in Friday\'s list)', !!A.bd.fb || A.mine.length > 0, `under the line: board "${A.bd.fb}" week "${A.wk.fb}" · bar "${A.bar}" · list ${T.fullStr(A.mine)}`],
    ['no attendance invented: Vandal and Ryder unchanged, no negative figure', WHO.every(n => T.dmin(h0, A.h, n) === 0) && !A.h.neg.length, WHO.map(n => `${n} ${T.delta(h0, A.h, n)}`).join(' · ')],
  ], A.pics)

  /* B — a crew on the formation (still no take-off), and an invalid clock */
  await T.boardAt(p, DI)
  const s1 = await T.seat(p, `${DI}.${gi}.0.0.p`, 'Vandal'); const s2 = await T.seat(p, `${DI}.${gi}.0.0.w`, 'Ryder')
  await T.itAdd(p, 'board', DI, gi)
  await T.itType(p, 'board', DI, gi, 1, '25:70 IN TIME')
  const B1 = await stage('p212-B')
  judge('P2-12.B', `Vandal and Ryder seated on the formation (${s1.took && s2.took ? 'both took' : 'seat FAILED'}), still no take-off. "+ In-time / Rally" pressed again and the new line retyped "25:70 IN TIME" + Tab (an invalid clock).`, [
    ['both lines are kept and shown', B1.bd.lines.length === 2, B1.bd.lines.join(' / ')],
    ['EXPECTED: no fabricated attendance — neither man gains a report at midnight or a long day: Work hours unchanged, nothing negative', WHO.every(n => T.dmin(h0, B1.h, n) === 0) && !B1.h.neg.length, `${WHO.map(n => `${n} ${T.delta(h0, B1.h, n)}`).join(' · ')} · negatives: ${B1.h.neg.map(r => r.nm + ' ' + r.v).join(', ') || 'none'} · held for Vandal: ${B1.held}`],
    ['the invalid clock is explained', /25:70|unrecogni|check|clock/i.test(B1.bd.fb + ' ' + T.fullStr(B1.mine)), `under the lines: board "${B1.bd.fb}" · week "${B1.wk.fb}" · bar "${B1.bar}" · list ${T.fullStr(B1.mine)}`],
  ], B1.pics)

  /* C — a valid take-off and a valid in-time */
  await T.boardAt(p, DI)
  const f = await T.form(p, DI, gi, 0, { cs: 'VL', to: '1200', ld: '1300' })
  await T.itType(p, 'board', DI, gi, 1, '08:00 IN TIME')
  const C = await stage('p212-C')
  judge('P2-12.C', 'The formation typed VL, take-off 1200, landing 1300; the invalid line retyped "08:00 IN TIME" + Tab. The lines now read "RALLY AFTER IN TIME" and "08:00 IN TIME".', [
    ['EXPECTED: valid data resolves — both men report at 08:00: 08:00 → landing 13:00 + 2h debrief = 7h', WHO.every(n => T.dmin(h0, C.h, n) === 420), `${WHO.map(n => `${n} ${T.delta(h0, C.h, n)}`).join(' · ')} · held for Vandal: ${C.held}`],
    ['nothing is left to explain (no message under the lines, no reporting line in Friday\'s list)', !C.bd.fb && !C.mine.length, `board "${C.bd.fb}" · week "${C.wk.fb}" · bar "${C.bar}" · list ${T.fullStr(C.mine)} · board header "${C.bd.hdr}"`],
  ], C.pics)

  /* D — the formation cancelled */
  await T.boardAt(p, DI)
  const cx = await T.cxLine(p, `${DI}.${gi}.0.0`, 'P2-12')
  const D = await stage('p212-D')
  judge('P2-12.D', `The formation's line cancelled with its CX (${cx}).`, [
    ['EXPECTED: cancellation removes its work contribution — both men back to their figure before the wave', WHO.every(n => T.dmin(h0, D.h, n) === 0), `${WHO.map(n => `${n} ${T.delta(h0, D.h, n)}`).join(' · ')} · held for Vandal: ${D.held}`],
    ['no negative figure anywhere in Work hours', !D.h.neg.length, D.h.neg.map(r => r.nm + ' ' + r.v).join(', ') || 'none'],
  ], D.pics)
  row('P2-12.h', 'for the record: the reporting lines and what is printed under them once the line is cancelled', `lines "${D.bd.lines.join(' / ')}" · board "${D.bd.fb}" · week "${D.wk.fb}" · bar "${D.bar}" · list ${T.fullStr(D.mine)}`, 'INFO')
})
