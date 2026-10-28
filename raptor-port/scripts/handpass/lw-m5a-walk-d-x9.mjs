// exploration 9: file an Inputs-page leave for Ranger and read the Balances row
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-x9 v1]')
const w = await L.newCtx('desk')
const P = w.page
await L.signIn(w, 'admin')
console.log(JSON.stringify(await D.fileInput(w, 'Ranger', 'OL', '2026-07-15', '2026-07-16')))
await L.openWar(w, 'admin'); await D.openBalances(w)
console.log(JSON.stringify(await D.balRow(P, 'bane')))
console.log(w.errs)
await w.ctx.close(); await L.closeBrowser()
