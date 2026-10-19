// Walker B — B11 (the Scheduler Board's take-off box, D1047 regression). VERSION 1
import { launch, runBox, runControl } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-board VERSION 1', size)
const A = await launch(size)
const { page } = A
const SEL = '[data-bfld="ff:0.0.0.to"]'
const openBoard = async () => {
  if (await page.locator(SEL).first().isVisible().catch(() => false)) return
  await A.go('editsched'); await page.waitForTimeout(500)
  await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
}
await openBoard()
const startVal = await A.val(page.locator(SEL).first())
console.log('take-off box starts as', startVal)
await runBox(A, {
  id: 'B11', slug: 'board-takeoff', name: 'Scheduler Board → first flying line → take-off (T/O) box holding a time',
  ensure: openBoard,
  loc: A => A.page.locator(SEL).first(),
  prior: '0900', typed: '1000',
  expectText1: 'box holds only "1000"',
  expectLeave: '10:00', expectText2: 'shows 10:00 after leaving',
  elsewhere: async A => { await A.pressEl(A.page.locator('.nin').first()) },
  persist: async A => { await A.go('inputs'); await page.waitForTimeout(400); await A.go('editsched'); await page.waitForTimeout(500); await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900); return await A.val(page.locator(SEL).first()) },
  persistDid: 'left to the Inputs page, came back to Edit Schedule and opened the Scheduler Board again',
  expectTextPersist: 'take-off still 10:00',
})
console.log('errors', A.errors)
await A.close()
