// swl-w1B-probe6 — walker B (chat 203): a lead to check — a tight-turn puck's ring on the week against the board, on the demo's
// own Wed 15 (Trident, Relay: "Tight turn", no SANS involved). Read and pictured only. SWLB_RUN=probe6 node scripts/handpass/swl-w1B-probe6.mjs
import './swl-w1B-env.mjs'
const B = await import('./swl-w1B-lib.mjs')
const { T, L, W5, sleep } = B
console.log('VERSION swl-w1B-probe6 1')
await T.run('probe6', 'd', async (p, W) => {
  await L.go(p, 'editsched')
  for (const id of ['harpoon', 'dirty']) {
    await B.showDay(p, 2, '#eWeek')
    const wk = (await B.pk(p, '#eWeek', id)).filter(x => x.day === 2)
    await p.evaluate(i => { const e = [...document.querySelectorAll(`#eWeek .day[data-day="2"] .puck[data-person="${i}"]`)].find(x => x.closest('[data-slot]')); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, id); await sleep(300)
    const wpic = await W5.clip(p, W, p.locator(`#eWeek .day[data-day="2"] [data-slot] .puck[data-person="${id}"]`).first(), 'week-' + id, 12)
    await L.openBoard(p, W, 2)
    const bd = await B.pk(p, '#schedBoard', id)
    await p.evaluate(i => { const e = document.querySelector(`#schedBoard [data-slot] .puck[data-person="${i}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, id); await sleep(300)
    const bpic = await W5.clip(p, W, p.locator(`#schedBoard [data-slot] .puck[data-person="${id}"]`).first(), 'board-' + id, 12)
    W.rec(id, 'a tight-turn man\'s pucks on Wed 15 (demo, no SANS): week against board', 'REC', `week[${B.pkSay(wk)}] paint ${JSON.stringify(wk.map(x => x.paint))} ·· board[${B.pkSay(bd)}] paint ${JSON.stringify(bd.map(x => x.paint))}`, [wpic, bpic].join(', '))
    await L.closeBoard(p, W)
    /* the same with Wed 15's warning list opened by its bar */
    await B.openList(p, W, '#eWeek', 2)
    const wo = (await B.pk(p, '#eWeek', id)).filter(x => x.day === 2)
    const opic = await W5.clip(p, W, p.locator(`#eWeek .day[data-day="2"] [data-slot] .puck[data-person="${id}"]`).first(), 'week-open-' + id, 12)
    W.rec(id + '-open', 'the same, Wed 15\'s list opened', 'REC', `week[${B.pkSay(wo)}] class ${JSON.stringify(await p.evaluate(i => [...document.querySelectorAll(`#eWeek .day[data-day="2"] [data-slot] .puck[data-person="${i}"]`)].map(e => e.className), id))}`, opic)
    await B.closeList(p, W, '#eWeek', 2)
  }
})
