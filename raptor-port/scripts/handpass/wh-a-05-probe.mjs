/* [WARN-HIDE-KEPT] walker A — probe 5 (own worlds, nothing recorded): the board's AVALON seat against the week's.
   (1) baseline, nothing hidden: a man flagged ELSEWHERE, clean on the AVALON seat — what do the board and the week draw?
   (2) Grit with the seat's own three hidden: then the ground one hidden too; then the board closed and opened again. */
import { world, L, W, pic, warnsOf, pk, sum, addWave, boardOpenFold, readBoard, tapBoardLine } from './wh-a-lib.mjs'
import { handPut } from './seat-lib.mjs'
const short = w => w.map(x => `${x.ix} ${x.code}${x.off ? '(hidden)' : ''} ${JSON.stringify(x.who)} @${x.key}`).join(' | ')
{
  const { browser, p } = await world(); p.setDefaultTimeout(6000)
  try {
    console.log('quals', JSON.stringify(await p.evaluate(() => ['salsa', 'casper', 'wolf', 'nact', 'glass'].map(id => id + ':' + JSON.stringify(window.PEOPLE[id]).slice(0, 260)))))
    await L.go(p, 'editsched'); await W.boardOn(p, 1); await addWave(p, 1, 'AVALON')
    for (const [seat, id] of [['1.2.0.0.p', 'casper'], ['1.2.0.1.p', 'salsa'], ['1.2.0.0.w', 'wolf']]) { const r = await handPut(p, seat, id); console.log('put', id, seat, r.took, (r.msg || '').slice(0, 90)) }
    const w = await warnsOf(p, 1); console.log('Tue warnings:', short(w))
    for (const id of ['casper', 'salsa', 'wolf']) console.log('BOARD', id, sum(await pk(p, '#schedBoard', id)))
    await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-slot="1.2.0.0.p"]'); e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
    await pic(p, 'probe5-baseline-board')
    await W.boardOff(p)
    for (const id of ['casper', 'salsa', 'wolf']) console.log('WEEK ', id, sum(await pk(p, '#eWeek .day[data-day="1"]', id)))
    await p.evaluate(() => { const e = document.querySelector('#eWeek [data-slot="1.2.0.0.p"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    await pic(p, 'probe5-baseline-week')
  } catch (e) { console.log('PROBE ERROR', String(e).split('\n')[0]) }
  await browser.close()
}
{
  const { browser, p } = await world(); p.setDefaultTimeout(6000)
  try {
    await L.go(p, 'editsched'); await W.boardOn(p, 1); await addWave(p, 1, 'AVALON')
    await handPut(p, '1.2.0.0.p', 'sufa'); await handPut(p, 'g:1.0.+', 'sufa'); await boardOpenFold(p)
    let b = await readBoard(p)
    for (const l of b.lines.filter(l => /Grit/.test(l.text) && /AVALON/.test(l.text))) { await tapBoardLine(p, 1, l.ix); await boardOpenFold(p) }
    console.log('\nown three hidden — BOARD', sum(await pk(p, '#schedBoard', 'sufa')), '\n   ', short((await warnsOf(p, 1)).filter(w => w.who.includes('sufa'))))
    console.log('   seat html:', await p.evaluate(() => document.querySelector('#schedBoard [data-slot="1.2.0.0.p"]').innerHTML.slice(0, 400)))
    b = await readBoard(p); const g = b.lines.find(l => /Grit/.test(l.text) && !l.struck)
    await tapBoardLine(p, 1, g.ix); await boardOpenFold(p)
    console.log('ground one hidden too — BOARD', sum(await pk(p, '#schedBoard', 'sufa')))
    await pic(p, 'probe5-all-four-hidden-board')
    await tapBoardLine(p, 1, g.ix); await boardOpenFold(p)
    console.log('ground one flagged again — BOARD', sum(await pk(p, '#schedBoard', 'sufa')))
    await W.boardOff(p); console.log('board closed — WEEK', sum(await pk(p, '#eWeek .day[data-day="1"]', 'sufa')))
    await W.boardOn(p, 1); console.log('board opened again — BOARD', sum(await pk(p, '#schedBoard', 'sufa')))
  } catch (e) { console.log('PROBE ERROR', String(e).split('\n')[0]) }
  await browser.close()
}
