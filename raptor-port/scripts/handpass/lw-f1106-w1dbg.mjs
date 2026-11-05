process.env.LW_OUT ||= '2026-11-06-lw-faults/walk-dbg'
process.env.WNAME = 'dbg'
const { L, T, elAt, fresh } = await import('./lw-f1106-w0.mjs')
console.log('[lw-f1106-w1dbg v1]')
const w = await fresh(process.env.SIZE || 'desk'); const P = w.page
const id = await L.pidOf(P, 'Drifter'); const D = L.day(16)
await L.openCell(w, id, D); await L.autoApprove(w, false)
await L.press(w, T('portion-am')); await L.placeLeave(w, 'LL'); await L.settle(w)
console.log(JSON.stringify(await L.cellInfo(P, id, D)))
await L.reachCell(w, id, D)
const l = P.locator(T(L.cellId(id, D))).first(); await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
const b = await l.boundingBox(); console.log(JSON.stringify(b))
for (const fy of [0.2, 0.5, 0.85]) console.log(fy, await elAt(P, b.x + b.width / 2, b.y + b.height * fy))
await L.finger(w, b.x + b.width / 2, b.y + b.height * 0.85); await P.waitForTimeout(500)
console.log(await P.evaluate(() => ['portion-full', 'portion-am', 'portion-pm'].map(t => t + ':' + document.querySelector(`[data-testid="${t}"]`)?.getAttribute('aria-pressed') + ':' + document.querySelector(`[data-testid="${t}"]`)?.className)))
await L.shot(w, 'dbg-low')
await L.closeBrowser()
