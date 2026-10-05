/* walker TO — H-05: the "+ In-time / Rally" button on a wave that flies just after midnight.
   Tuesday, a new wave: one formation (NX), take-off 01:30, landing 02:30, Vandal / Ryder (nothing else on Monday or
   Tuesday); Logic's nominal report read first. The WEEK's button is pressed; the line, the wave's header on the board,
   Tuesday's warning list and the crew's Work-hours figure are read. A second new wave (no crew) takes the BOARD's button. */
import * as T from './stk-TO-lib.mjs'
const { W, row, judge, pic } = T
const DI = 1, WHO = ['Vandal', 'Ryder']
await T.run('H-05', async p => {
  const lead = await T.logicRead(p, 'reportLead')
  const h0 = await T.hours(p, WHO); await T.insShut(p)
  await T.boardAt(p, DI)
  const gi = await T.addWave(p, DI)
  const a = await T.newForm(p, DI, gi, { cs: 'NX', to: '0130', ld: '0230' }, WHO)
  const g2 = await T.addWave(p, DI); await T.form(p, DI, g2, 0, { cs: 'NY', to: '0130', ld: '0230' })
  await W.boardOff(p)
  const hNo = await T.hours(p, WHO); await T.insShut(p)
  await T.toEdit(p); await W.showDay(p, DI); await T.itShow(p, 'week', DI, gi)
  const add = await T.itAdd(p, 'week', DI, gi)
  await p.keyboard.press('Tab'); await T.sleep(400)
  await T.itShow(p, 'week', DI, gi); const wk = await T.itRead(p, 'week', DI, gi); const s1 = await pic(p, 'h05-1-week-after-button')
  await T.boardAt(p, DI); await T.itShow(p, 'board', DI, gi); const bd = await T.itRead(p, 'board', DI, gi)
  const add2 = await T.itAdd(p, 'board', DI, g2); await p.keyboard.press('Tab'); await T.sleep(400)
  await T.itShow(p, 'board', DI, gi); const bd2 = await T.itRead(p, 'board', DI, g2); const s2 = await pic(p, 'h05-2-board-header-and-second-wave')
  await W.boardOff(p)
  const h1 = await T.hours(p, WHO); const s3 = await T.insPicAt(p, 'h05-3-hours', 'Vandal'); await T.insShut(p)
  const lst = await T.listOf(p, DI); const mine = await T.linesFull(p, DI, /NX|NY|Vandal|Ryder/)
  await T.listShow(p, DI, /NX/); const s4 = await pic(p, 'h05-4-tuesday-list')
  const held = await T.held(p, DI, 'Vandal')
  const d = T.dmin(h0, h1, 'Vandal')
  const places = `the line on the week "${wk.lines.join(' / ')}" · the line on the board "${bd.lines.join(' / ')}" · the board's wave header "${bd.hdr}" · under the line "${wk.fb}" · Tuesday's list: ${T.fullStr(mine)}`
  judge('H-05', `Tuesday board: a new wave (wave ${gi + 1}) — NX typed take-off 0130, landing 0230, Vandal / Ryder seated (${a.ok ? 'both took' : 'SEAT FAILED'}); Logic's "Nominal report before T/O" reads ${lead}. Week: "+ In-time / Rally" pressed once on that wave, then Tab. Read: the line, the board's wave header, Tuesday's warning list, Insights (${h1.how}).`, [
    ['EXPECTED: the line reads 22:30 (01:30 less the 3h nominal report)', /^22:30/.test(wk.lines[0] || ''), `the button filled "${add.added}"`],
    ['EXPECTED: every place that prints it says it is the previous day', /^22:30/.test(wk.lines[0] || '') && /previous day|prev/i.test(wk.lines[0] + ' ' + bd.hdr), places],
    ['EXPECTED: the work figure is about 4 hours plus the debrief (22:30 → 02:30 + 2h = 6h), never negative, never about 28 hours', d === 360 && !h1.neg.length, `${WHO.map(n => `${n} ${T.delta(h0, h1, n)}`).join(' · ')} (with no reporting line they read ${WHO.map(n => hNo.fig[n]).join(' / ')}) · negatives: ${h1.neg.map(r => r.nm + ' ' + r.v).join(', ') || 'none'}`],
  ], [s1, s2, s3, s4])
  row('H-05.h', 'every figure, for the record', `${places} · Tuesday's bar "${lst.bar}" · the BOARD's button on a second new wave (NY 01:30–02:30, no crew) filled "${add2.added}"; its header "${bd2.hdr}"; under it "${bd2.fb}" · held for Vandal: ${held}`, 'INFO')
})
