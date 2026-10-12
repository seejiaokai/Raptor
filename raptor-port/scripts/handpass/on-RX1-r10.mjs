import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'R10' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const iid = await L.usualSat(W)
await L.frameBoard(page)
const sat0 = { ground: await L.groundNow(page, L.SAT_DI), oil: await L.oilOf(page, iid) }
const fri0 = await L.groundNow(page, L.FRI_DI)
await L.drag(page, page.locator(L.puckSel(1)), page.locator(L.puckSel(0)))
await press(tid('oilconf-cancel')); await page.waitForTimeout(700)
console.log('bar up on Saturday', await tid('oilbar-text').innerText().catch(() => 'NO'))
// step to Friday with the board's day button
const fri = page.locator('#schedBoard').getByText('Fri 17', { exact: true }).locator('visible=true').first()
console.log('Fri button', await fri.count(), await fri.innerText().catch(() => ''))
await fri.click(); await page.waitForTimeout(900)
console.log('SBDAY now', await page.evaluate(() => window.SBDAY), 'title', await page.locator('#schedBoard').innerText().then(t => t.slice(0, 40).replace(/\s+/g, ' ')))
console.log('bar still up on Friday', await tid('oilbar').count(), await tid('oilbar-text').innerText().catch(() => 'NO'))
await W.hush(); await shot('RX1-10-1-friday-bar'); await W.unhush()
const undo0 = await L.undoState(page)
await press(tid('oilbar-answer')); await page.waitForTimeout(700)
console.log('Answer OIL pressed: question', await tid('oilconf').count(), 'lead', await tid('oilconf-lead').innerText().catch(() => 'NO'), 'head', await page.locator('[data-testid="oilconf"] .airpop-head b').innerText().catch(() => ''), 'bar', await tid('oilbar').count(), 'toast', await L.toast(page), 'SBDAY', await page.evaluate(() => window.SBDAY), 'board shown', await page.evaluate(() => (document.querySelector('#schedBoard .sb-ttl, #schedBoard h1, #schedBoard [class*=title]') || {}).textContent))
await W.hush(); await shot('RX1-10-2-answer-oil-on-friday'); await W.unhush()
if (await tid('oilconf').count()) {
  await press(tid('oil-yes')); await press(tid('oilconf-save')); await page.waitForTimeout(900)
  console.log('after Yes -> Swap: toast', await L.toast(page), 'SBDAY', await page.evaluate(() => window.SBDAY))
  console.log('Saturday ground', J(await L.groundNow(page, L.SAT_DI)), 'was', J(sat0.ground), 'oil', await L.oilOf(page, iid), 'was', sat0.oil)
  console.log('Friday ground', J(await L.groundNow(page, L.FRI_DI)), 'was', J(fri0))
  console.log('bar', await tid('oilbar').count(), 'undo changed', (await L.undoState(page)) !== undo0)
  await shot('RX1-10-3-after-swap')
}
console.log('errors', J(W.errors))
await W.ctx.close(); process.exit(0)
