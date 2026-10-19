// the board's boxes after a Tab — VERSION 2
import { launch } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore12 VERSION 2', size)
const A = await launch(size)
const { page } = A
await A.go('editsched'); await page.waitForTimeout(500)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
for (const f of ['ff:0.0.0.to', 'ff:0.0.0.ld', 'ff:0.0.0.rl']) {
  const L = page.locator(`[data-bfld="${f}"]`).first()
  await L.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const before = await A.val(L)
  await A.pressEl(L); await page.keyboard.type('1015', { delay: 45 })
  const typed = await A.val(L)
  await page.keyboard.press('Tab'); await page.waitForTimeout(600)
  const a1 = await A.val(L); const act1 = await page.evaluate(() => document.activeElement.dataset.bfld)
  await page.keyboard.press('Tab'); await page.waitForTimeout(600)
  const a2 = await A.val(L); const act2 = await page.evaluate(() => document.activeElement.dataset.bfld)
  console.log(f, 'before', before, 'typed', typed, 'after Tab', a1, '(focus', act1, ') after 2nd Tab', a2, '(focus', act2, ')')
}
console.log('errors', A.errors)
await A.close()
