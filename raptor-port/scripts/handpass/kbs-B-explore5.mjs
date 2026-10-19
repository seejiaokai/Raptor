// exploration — VERSION 1
import { launch, dumpInputs, dumpBtns } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore5 VERSION 1', size)
const A = await launch(size)
const { page } = A
await A.go('leavewar'); await page.waitForTimeout(800)
// make a counter
await page.locator('[data-testid="settings-open"]').click(); await page.waitForTimeout(400)
await page.locator('[data-testid="counter-add"]').click(); await page.waitForTimeout(400)
await page.locator('[data-testid="cform-name"]').fill('TESTC')
console.log('counter form inputs'); console.log((await dumpInputs(page)).join('\n'))
console.log((await dumpBtns(page)).filter(x=>/cform|s0|counter|slot/i.test(x)).join('\n'))
await page.getByRole('button', { name: 'Add counter' }).click(); await page.waitForTimeout(600)
await A.shot('x-lw-after-add')
console.log((await dumpBtns(page)).filter(x=>/settings|counter|sheet/i.test(x)).join('\n'))
await page.locator('[data-testid="settings-close"]').click().catch(()=>{}); await page.waitForTimeout(300)
await page.locator('[data-testid="counts-toggle"]').click(); await page.waitForTimeout(500)
await A.shot('x-lw-manning2')
console.log('--- manning rows'); console.log((await dumpBtns(page)).filter(x=>/count|manning|thr|TESTC/i.test(x)).join('\n'))
// OIL tracker: tap a name
await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForTimeout(600)
await page.locator('[data-testid="oil-list"] >> text=Reaper').first().click(); await page.waitForTimeout(500)
await A.shot('x-lw-oil-credit')
console.log('--- oil credit'); console.log((await dumpInputs(page)).join('\n'))
console.log('errors', A.errors)
await A.close()
