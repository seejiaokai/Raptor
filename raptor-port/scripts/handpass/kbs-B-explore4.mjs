// exploration — VERSION 1
import { launch, dumpInputs, dumpBtns } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore4 VERSION 1', size)
const A = await launch(size)
const { page } = A
await A.go('leavewar'); await page.waitForTimeout(800)
await page.locator('[data-testid="counts-toggle"]').click(); await page.waitForTimeout(500)
await A.shot('x-lw-manning')
console.log('--- manning'); console.log((await dumpInputs(page)).join('\n'))
console.log((await dumpBtns(page)).filter(x=>/testid=[a-z]/.test(x) && !/req-|avail|fly-row/.test(x)).slice(0,40).join('\n'))
await page.keyboard.press('Escape'); await page.waitForTimeout(300)
await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForTimeout(600)
await A.shot('x-lw-oil')
console.log('--- oil'); console.log((await dumpInputs(page)).join('\n'))
console.log((await dumpBtns(page)).filter(x=>/oil|credit/i.test(x)).slice(0,30).join('\n'))
console.log('errors', A.errors)
await A.close()
