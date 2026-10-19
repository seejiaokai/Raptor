// what attributes the Logic / Duty / Board boxes carry, and what breaks their replace — VERSION 1
import { launch } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore13 VERSION 1', size)
const A = await launch(size)
const { page } = A
await A.go('logic'); await page.waitForTimeout(500)
await page.click('#lgEdit'); await page.waitForTimeout(500)
const crew = page.locator('input.lgin[aria-label="Crew rest"]')
console.log('crew rest:', await crew.evaluate(e => e.outerHTML))
console.log('parent:', await crew.evaluate(e => e.parentElement.outerHTML.slice(0, 300)))
await A.go('admin'); await page.waitForTimeout(500)
await page.evaluate(() => document.getElementById('admDutyTpl').click()); await page.waitForTimeout(600)
console.log('duty start:', await page.locator('input.tm:visible').first().evaluate(e => e.outerHTML))
await A.go('editsched'); await page.waitForTimeout(500)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
console.log('board to:', await page.locator('[data-bfld="ff:0.0.0.to"]').first().evaluate(e => e.outerHTML))
// try variants of the break on the Logic box
await A.go('logic'); await page.waitForTimeout(500)
const variants = [
  ['remove class lgin', e => { e.classList.remove('lgin') }],
  ['remove aria-label', e => { e.removeAttribute('aria-label') }],
  ['clone-replace with a bare input (no class, no attrs)', e => { const n = document.createElement('input'); n.type = 'text'; n.value = e.value; n.setAttribute('aria-label', 'Crew rest'); e.replaceWith(n) }],
]
for (const [name, fn] of variants) {
  await A.go('editsched'); await page.waitForTimeout(300); await A.go('logic'); await page.waitForTimeout(500)
  if (!(await page.locator('.lgin').first().isVisible().catch(() => false))) { await page.click('#lgEdit'); await page.waitForTimeout(400) }
  const l = page.locator('input[aria-label="Crew rest"]').first()
  await l.fill('12h'); await l.evaluate(e => e.blur()); await page.waitForTimeout(750)
  await l.evaluate(fn)
  const l2 = page.locator('input[aria-label="Crew rest"]').first()
  await A.pressEl(l2); await page.keyboard.type('11h', { delay: 45 })
  console.log(name, '->', await A.val(l2))
}
console.log('errors', A.errors)
await A.close()
