// exploration — VERSION 3
import { launch, dumpInputs, dumpBtns } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore7 VERSION 3', size)
const A = await launch(size)
const { page } = A
await A.go('inputs'); await page.waitForTimeout(600)
await page.click('#inSansMode'); await page.waitForTimeout(600)
await page.click('.sc-gear'); await page.waitForTimeout(500)
await A.shot('x-sans-gear')
console.log('--- sans gear'); console.log((await dumpInputs(page)).join('\n'))
await page.keyboard.press('Escape'); await page.waitForTimeout(400)
await A.go('logic'); await page.waitForTimeout(400)
await page.click('#lgEdit'); await page.waitForTimeout(500)
await A.shot('x-logic-edit')
console.log('--- logic edit'); console.log((await dumpInputs(page)).join('\n'))
console.log('errors', A.errors)
await A.close()
