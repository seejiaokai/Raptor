// exploration — VERSION 1
import { launch, dumpInputs, dumpBtns } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore10 VERSION 1', size)
const A = await launch(size)
const { page } = A
await A.go('leavewar'); await page.waitForTimeout(1000)
await A.shot('x-lw')
await A.tap('[data-testid="settings-open"]'); await page.waitForTimeout(500)
await A.tap('[data-testid="counter-add"]'); await page.waitForTimeout(500)
await A.shot('x-counter')
await A.tap('[data-testid="cform-mode-team"]'); await page.waitForTimeout(500)
await A.shot('x-counter-team')
console.log((await dumpInputs(page)).join('\n'))
console.log(await page.evaluate(() => document.querySelector('[data-testid="counter-form"]').innerText.replace(/\n/g, ' | ')))
console.log('errors', A.errors)
await A.close()
