// exploration 7: Move of an approved leave; the Inputs page's way to file a leave
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-x7 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
await D.apprPress(w, 'bane', '12 – Fri 13 Feb', 'approve')
await L.openGrid(w)
await L.openCell(w, 'bane', '2026-02-12')
await press(w, T('decide-shift')); await P.waitForTimeout(700)
await shot(w, 'x7-move-armed')
console.log('window still', await vis(P, T('bid-picker')), 'toast', await D.notes(P))
await L.reachCell(w, 'bane', '2026-02-14')
await press(w, T('cell-bane-2026-02-14')); await P.waitForTimeout(900)
await shot(w, 'x7-moved')
console.log('after', await vis(P, T('bid-picker')), await D.notes(P))
await D.openBalances(w)
console.log(JSON.stringify(await D.balRow(P, 'bane')))
await press(w, T('bal-name-bane')); await P.waitForTimeout(500)
console.log(JSON.stringify((await D.pwRead(P)).lines))
await D.closePw(w)
// Inputs page
await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1200)
await shot(w, 'x7-inputs')
console.log(await P.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid))].filter(t => /inp|input|new|add/i.test(t)).slice(0, 40).join(',')))
await w.ctx.close(); await L.closeBrowser()
