import * as G from './cal-G-lib.mjs'
const { L, W, sleep } = G
G.setTag('probe4')
const { browser, p, errors } = await G.world({ who: 'a' })
const tid = id => p.locator(`[data-testid="${id}"]`)
const z = () => p.evaluate(() => ['win-inputsset', 'win-days', 'win-holiday', 'win-every'].map(t => { const w = document.querySelector(`[data-testid="${t}"]`); if (!w) return t + ': none'; const r = w.getBoundingClientRect(); return `${t}: z=${getComputedStyle(w).zIndex} cls="${w.className}" rect=${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)}` }))
await L.go(p, 'inputs'); await sleep(500)
for (let round = 1; round <= 3; round++) {
  if (await p.locator('#inMemberMode').count()) { await p.locator('#inMemberMode').click(); await sleep(300) }
  await tid('in-gear').click(); await tid('win-inputsset').waitFor(); await sleep(300)
  await tid('iset-days').click(); await tid('win-days').waitFor(); await sleep(500)
  console.log('ROUND', round, JSON.stringify(await z()))
  await G.shot(p, `round${round}-calendar-open`)
  const tabBox = await tid('days-tab-holidays').boundingBox().catch(() => null)
  if (tabBox) {
    const hit = await p.evaluate(b => { const e = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return e ? ((e.closest('[data-testid]') || {}).dataset || {}).testid + ' / ' + (e.closest('[role=dialog]') || {}).ariaLabel : null }, tabBox)
    console.log('  at the Holidays tab centre the topmost is', hit)
  }
  for (let i = 0; i < 3; i++) { await p.keyboard.press('Escape'); await sleep(200) }
  console.log('  after 3 Escapes', JSON.stringify(await z()))
}
console.log('errors', JSON.stringify(errors))
await browser.close()
