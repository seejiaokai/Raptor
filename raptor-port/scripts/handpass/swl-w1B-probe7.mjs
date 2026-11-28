// swl-w1B-probe7 — walker B (chat 203): reproducing a lead from s23 — after Jester's SANS lines are hidden (or covered by a
// filing), his tight-turn puck reads amber on Edit Schedule's week but plain on the board. Pictured on both, then after a reload.
//   SWLB_RUN=probe7 SZ=d|p node scripts/handpass/swl-w1B-probe7.mjs
import './swl-w1B-env.mjs'
const B = await import('./swl-w1B-lib.mjs')
const { T, L, W5, J, sleep } = B
const SZ = process.env.SZ || 'd'
console.log('VERSION swl-w1B-probe7 1 · size', SZ)
const DI = 4, ID = 'ipman'
async function both(p, W, tag) {
  await L.closeBoard(p, W); await L.go(p, 'editsched'); await B.showDay(p, DI, '#eWeek')
  const wk = (await B.pk(p, '#eWeek', ID)).filter(x => x.day === DI)
  await p.evaluate(i => { const e = document.querySelector(`#eWeek .day[data-day="4"] [data-slot] .puck[data-person="${i}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, ID); await sleep(400)
  const wpic = await W5.clip(p, W, p.locator(`#eWeek .day[data-day="4"] [data-slot] .puck[data-person="${ID}"]`).first(), tag + '-week', 14)
  const wcls = await p.evaluate(i => [...document.querySelectorAll(`#eWeek .day[data-day="4"] [data-slot] .puck[data-person="${i}"]`)].map(e => e.className), ID)
  await L.openBoard(p, W, DI)
  const bd = await B.pk(p, '#schedBoard', ID)
  await p.evaluate(i => { const e = document.querySelector(`#schedBoard [data-slot] .puck[data-person="${i}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, ID); await sleep(400)
  const bpic = await W5.clip(p, W, p.locator(`#schedBoard [data-slot] .puck[data-person="${ID}"]`).first(), tag + '-board', 14)
  const bcls = await p.evaluate(i => [...document.querySelectorAll(`#schedBoard [data-slot] .puck[data-person="${i}"]`)].map(e => e.className), ID)
  await L.closeBoard(p, W)
  W.rec(tag, 'Jester\'s seat pucks, week against board', 'REC', `week[${B.pkSay(wk)}] ${J(wk.map(x => x.paint))} class ${J(wcls)} ·· board[${B.pkSay(bd)}] ${J(bd.map(x => x.paint))} class ${J(bcls)}`, [wpic, bpic].join(', '))
}
await T.run('probe7', SZ, async (p, W) => {
  const a = await B.mkLine(p, W, DI, { cs: 'VL', msn: 'BFM', to: '09:00', ld: '10:00' })
  const b = await B.mkLine(p, W, DI, { cs: 'VL', msn: 'ACM', to: '11:00', ld: '12:00' })
  await B.plan(p, W, DI, a.fcp, ID, 'pa'); await B.plan(p, W, DI, b.fcp, ID, 'pb')
  await both(p, W, '1-sans')
  const f = await B.fileFor(p, W, '2026-07-17', ID, ['fly'], 'all', 'file')
  await both(p, W, '2-filed')
  await T.reload(p, 'ad', 'a')
  await both(p, W, '3-filed-reloaded')
  W.rec('held', 'held (read only)', 'REC', (await B.held(p, DI)).join(' || ') + ' · filing ' + !!f.iid)
})
