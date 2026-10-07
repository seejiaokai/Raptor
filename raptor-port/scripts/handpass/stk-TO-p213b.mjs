/* walker TO — P2-13, a second pass on ONE spelling: "08.00" (a dot). In the first pass the VL crew's day followed the
   wave-wide line while "08.00 VL IN TIME" stood, and nothing was printed under the lines. Here: the dotted line alone,
   then beside a wave-wide line — what the screen says each time. Friday, a new wave, VL 12:00–13:00, Vandal / Ryder. */
import * as T from './stk-TO-lib.mjs'
const { W, row, pic } = T
const DI = 4, WHO = ['Vandal', 'Ryder']
await T.run('P2-13b', async p => {
  const h0 = await T.hours(p, WHO); await T.insShut(p)
  await T.boardAt(p, DI)
  const gi = await T.addWave(p, DI)
  await T.newForm(p, DI, gi, { cs: 'VL', to: '1200', ld: '1300' }, WHO)
  const rd = async name => { await W.boardOff(p); const h = await T.hours(p, WHO); await T.insShut(p); const lst = await T.listOf(p, DI); const mine = await T.linesFull(p, DI, /In-time \/ Rally|reporting/i); await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi); const bd = await T.itRead(p, 'board', DI, gi); const shot = await pic(p, name); return { s: `lines "${bd.lines.join(' / ')}" · under them "${bd.fb}" · board header "${bd.hdr}" · Friday's bar "${lst.bar}" · reporting lines in the list: ${T.fullStr(mine)} · Vandal ${T.delta(h0, h, 'Vandal')} · held: ${await T.held(p, DI, 'Vandal')}`, shot } }
  await T.itAdd(p, 'board', DI, gi); await T.itType(p, 'board', DI, gi, 0, '08.00 VL IN TIME')
  const a = await rd('p213b-1-dotted-alone')
  await T.itAdd(p, 'board', DI, gi); await T.itType(p, 'board', DI, gi, 1, '07:00 IN TIME')
  const b = await rd('p213b-2-dotted-beside-wave-wide')
  await T.itType(p, 'board', DI, gi, 0, '25:70 VL IN TIME')
  const c = await rd('p213b-3-2570-beside-wave-wide')
  row('P2-13.5', 'RECORD — a clock written with a dot. (1) the only line "08.00 VL IN TIME"; (2) a wave-wide "07:00 IN TIME" added beside it; (3) for comparison the first line retyped "25:70 VL IN TIME".', `(1) ${a.s} ||| (2) ${b.s} ||| (3) ${c.s}`, 'INFO', [a.shot, b.shot, c.shot])
})
