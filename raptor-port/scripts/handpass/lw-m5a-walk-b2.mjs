// Walker B, script 2: where do the tab icons drop (sweep), and 390 with a fresh page (reload at that width).
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/b'
const B = await import('./lw-m5a-walk-b-lib.mjs')
const { L, T, rec, shot, openBalances, tabRow } = B
console.log('[lw-m5a-walk-b2 v1]')
const w = await L.newCtx('phone')
const P = w.page
await L.signIn(w, 'admin')
await openBalances(w)
const out = []
for (const vw of [402, 400, 396, 394, 392, 391, 390, 389, 385, 380, 376, 375, 374, 360]) {
  await P.setViewportSize({ width: vw, height: 874 }); await P.waitForTimeout(300)
  const tr = await tabRow(P)
  out.push(`${vw}: icons ${tr.tabs.map(t => t.icon ? 'Y' : 'n').join('')} gear ${tr.gear?.left}-${tr.gear?.right} sw ${tr.sw}`)
}
console.log(out.join('\n'))
/* 390 after a reload at that width: Balances selected */
await P.setViewportSize({ width: 390, height: 874 })
await P.reload(); await P.waitForSelector('#luser, #vWeek .day', { state: 'attached' })
await P.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), process.env.LW_TODAY)
if (await P.locator('#luser').isVisible().catch(() => false)) await L.signIn(w, 'admin')
await openBalances(w)
const tr = await tabRow(P)
console.log('after reload at 390:', JSON.stringify(tr.tabs.map(t => [t.id, t.icon, t.left, t.right])))
await shot(w, 't1-390-balances-reload')
await P.screenshot({ path: `${L.OUT}/t1-tabs-390-balances.png`, clip: { x: 0, y: 0, width: 390, height: 110 }, scale: 'css' })
/* 375 with Balances selected, and a member's three tabs at 375 */
await P.setViewportSize({ width: 375, height: 874 }); await P.waitForTimeout(500)
await P.screenshot({ path: `${L.OUT}/t1-tabs-375-balances.png`, clip: { x: 0, y: 0, width: 375, height: 110 }, scale: 'css' })
await shot(w, 't1-375-balances')
const tr375 = await tabRow(P)
console.log('375 admin:', JSON.stringify(tr375.tabs.map(t => [t.id, t.icon, t.label, t.left, t.right])), JSON.stringify(tr375.gear))
await L.switchTo(w, 'member')
await openBalances(w)
const trm = await tabRow(P)
console.log('375 member:', JSON.stringify(trm.tabs.map(t => [t.id, t.icon, t.label, t.left, t.right])), JSON.stringify(trm.gear), 'sw', trm.sw)
await P.screenshot({ path: `${L.OUT}/t1-tabs-375-member.png`, clip: { x: 0, y: 0, width: 375, height: 110 }, scale: 'css' })
await shot(w, 't1-375-member-balances')
console.log('errors:', B.errsOf(w))
await w.ctx.close(); await L.closeBrowser()
