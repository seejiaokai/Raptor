/* walker TO — P2-11: equal Rally and Brief remain legal.
   Friday, a new wave: VL take-off 12:00, landing 13:00, the B (brief) box TYPED 09:40, Vandal / Ryder; lines
   "08:00 IN TIME" and "09:40 RALLY". Rally is then moved one minute later and back — once on the week, once on the board. */
import * as T from './stk-TO-lib.mjs'
const { W, row, judge, pic } = T
const DI = 4, WHO = ['Vandal', 'Ryder']
await T.run('P2-11', async p => {
  await T.boardAt(p, DI)
  const gi = await T.addWave(p, DI)
  const a = await T.newForm(p, DI, gi, { cs: 'VL', br: '0940', to: '1200', ld: '1300' }, WHO)
  await W.boardOff(p); await W.showDay(p, DI); await T.itShow(p, 'week', DI, gi)
  await T.itAdd(p, 'week', DI, gi); await T.itType(p, 'week', DI, gi, 0, '08:00 IN TIME')
  await T.itAdd(p, 'week', DI, gi); await T.itType(p, 'week', DI, gi, 1, '09:40 RALLY')
  const read = async () => { await T.toEdit(p); await W.showDay(p, DI); const wk = await T.itRead(p, 'week', DI, gi); const lst = await T.listOf(p, DI); const mine = await T.linesFull(p, DI, /In-time \/ Rally|rally|brief/); await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi); const bd = await T.itRead(p, 'board', DI, gi); const bw = await T.readBoard(p); return { wk, bd, bar: lst.bar, mine, boardList: (bw.lines || []).map(l => l.text) } }
  const r0 = await read(); const s0 = await pic(p, 'p211-0-board-equal'); await W.boardOff(p); await W.showDay(p, DI); await T.itShow(p, 'week', DI, gi); const s0w = await pic(p, 'p211-0-week-equal')
  judge('P2-11.0', `Friday, a new wave: VL typed B 0940 (the box shows "${a.typed.br}"), T/O 1200, landing 1300, Vandal / Ryder. Week: two lines typed — "08:00 IN TIME", "09:40 RALLY". Read: under the lines (week, board), Friday's warning list (week, board).`, [
    ['the lines read In-time 08:00 and Rally 09:40', /08:00 IN TIME/.test(r0.wk.lines[0] || '') && /09:40 RALLY/.test(r0.wk.lines[1] || ''), r0.wk.lines.join(' / ')],
    ['EXPECTED: equality produces no Rally-after-Brief warning — nothing under the lines, no timing line in Friday\'s list', !r0.wk.fb && !r0.bd.fb && !r0.mine.length, `week "${r0.wk.fb}" · board "${r0.bd.fb}" · bar "${r0.bar}" · list ${T.fullStr(r0.mine)}`],
  ], [s0, s0w])

  /* one minute later, on the week */
  await T.toEdit(p); await W.showDay(p, DI); await T.itType(p, 'week', DI, gi, 1, '09:41 RALLY')
  const r1 = await read(); const s1 = await pic(p, 'p211-1-board-0941'); await W.boardOff(p); await W.showDay(p, DI); await T.listShow(p, DI, /rally 09:41/); const s1w = await pic(p, 'p211-1-week-0941-list')
  judge('P2-11.1', 'Week: the Rally line retyped "09:41 RALLY" + Tab.', [
    ['EXPECTED: one minute later does warn — a message under the lines on both editors naming Rally 09:41 and brief 09:40', /rally 09:41 is later than brief 09:40/i.test(r1.wk.fb) && r1.wk.fb === r1.bd.fb, `week "${r1.wk.fb}" · board "${r1.bd.fb}"`],
    ['and a RED line in Friday\'s list (week and board)', r1.mine.some(m => m.sev === 'hard' && /rally 09:41/.test(m.text)) && r1.boardList.some(t => /rally 09:41/.test(t)), `week list ${T.fullStr(r1.mine)} · bar "${r1.bar}" · board list ${r1.boardList.join(' | ')}`],
    ['the message names a typed brief, not a suggested one (the B box was typed)', !/suggested/i.test(r1.wk.fb), r1.wk.fb],
  ], [s1, s1w])

  /* back to 09:40, on the week */
  await T.toEdit(p); await W.showDay(p, DI); await T.itType(p, 'week', DI, gi, 1, '09:40 RALLY')
  const r2 = await read(); const s2 = await pic(p, 'p211-2-board-back-0940'); await W.boardOff(p); await W.showDay(p, DI); await T.itShow(p, 'week', DI, gi); const s2w = await pic(p, 'p211-2-week-back-0940')
  judge('P2-11.2', 'Week: the Rally line retyped "09:40 RALLY" + Tab.', [
    ['EXPECTED: correcting it removes the warning — nothing under the lines, no timing line left in either list', !r2.wk.fb && !r2.bd.fb && !r2.mine.length && !r2.boardList.some(t => /rally/i.test(t)), `week "${r2.wk.fb}" · board "${r2.bd.fb}" · bar "${r2.bar}" · list ${T.fullStr(r2.mine)} · board list ${r2.boardList.join(' | ') || '(none)'}`],
  ], [s2, s2w])

  /* the same pair of edits made on the BOARD */
  await T.boardAt(p, DI); await T.itType(p, 'board', DI, gi, 1, '09:41 RALLY')
  const r3 = await read(); const s3 = await pic(p, 'p211-3-board-typed-0941')
  await T.itType(p, 'board', DI, gi, 1, '09:40 RALLY')
  const r4 = await read(); const s4 = await pic(p, 'p211-4-board-typed-back'); await W.boardOff(p)
  judge('P2-11.3', 'Board: the Rally line retyped "09:41 RALLY" + Tab, read; then "09:40 RALLY" + Tab, read.', [
    ['09:41 warns on both editors', /rally 09:41 is later than brief 09:40/i.test(r3.bd.fb) && r3.bd.fb === r3.wk.fb && r3.mine.some(m => /rally 09:41/.test(m.text)), `board "${r3.bd.fb}" · week "${r3.wk.fb}" · list ${T.fullStr(r3.mine)}`],
    ['back at 09:40 nothing is left', !r4.bd.fb && !r4.wk.fb && !r4.mine.length, `board "${r4.bd.fb}" · week "${r4.wk.fb}" · bar "${r4.bar}" · list ${T.fullStr(r4.mine)}`],
  ], [s3, s4])
})
