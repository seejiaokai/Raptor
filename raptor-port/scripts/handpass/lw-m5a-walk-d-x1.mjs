// exploration 1: admin desktop, what the pages show; the bid window for Ranger on a day
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-x1 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await D.openBalances(w)
for (const pid of ['bane', 'stiff']) console.log(pid, JSON.stringify(await D.balRow(P, pid)))
// all row ids
console.log(await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bal-row-"]')].map(e => e.dataset.testid.slice(8)).join(',')))
await L.openGrid(w)
console.log('grid fig bane:', await D.gridFig(P, 'bane'), '| stiff', await D.gridFig(P, 'stiff'))
console.log('my-leave', await D.myLeave(P))
await L.openCell(w, 'bane', '2026-02-03')
console.log('bid picker', await vis(P, T('bid-picker')))
console.log(await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid]')].map(e => e.dataset.testid + '=' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)).join(' | ')))
await shot(w, 'x1-bid')
await L.closeWin(w)
console.log(w.errs)
await w.ctx.close(); await L.closeBrowser()
