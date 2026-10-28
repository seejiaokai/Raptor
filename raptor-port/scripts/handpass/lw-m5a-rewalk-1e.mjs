// M5a re-walk 1e — a close look at the pinned headings, scrolled (device scale, small clip) — and the pixel rows between the two heading rows
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/rewalk/r1e'
process.env.LW_TODAY ||= '2026-01-25'
const R = await import('./lw-m5a-rewalk-lib.mjs')
const { L } = R
console.log('[lw-m5a-rewalk-1e v1]')
L.clearOut()
const w = await L.newCtx('desk'); const P = w.page
await L.signIn(w, 'admin'); await R.openBalances(w)
await P.evaluate(() => { document.querySelector('[data-testid="bal-scroll"]').scrollTop = 1150 }); await P.waitForTimeout(500)
await P.screenshot({ path: `${L.OUT}/01-heading-close.png`, clip: { x: 20, y: 190, width: 640, height: 90 } })
await P.screenshot({ path: `${L.OUT}/02-heading-close-right.png`, clip: { x: 640, y: 190, width: 640, height: 90 } })
await w.ctx.close(); await L.closeBrowser()
