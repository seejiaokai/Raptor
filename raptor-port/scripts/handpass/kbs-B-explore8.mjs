// exploration — VERSION 11
import { launch, dumpInputs, dumpBtns } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore8 VERSION 11', size)
const A = await launch(size)
const { page } = A
await A.go('leavewar'); await page.waitForTimeout(800)
await page.locator('[data-testid="month-FEB"]').click(); await page.waitForTimeout(800); await page.locator('[data-testid="cell-stiff-2026-02-07"]').click(); await page.waitForTimeout(600)
await page.locator('[data-testid="bid-oil"]').click(); await page.waitForTimeout(500)
await A.shot('x-lw-cell-oil')
console.log(await page.evaluate(() => [...document.querySelectorAll('.bidsheet')].map(e => (e.getAttribute('data-testid') || '') + ' :: ' + e.innerText.replace(/\n/g, ' | ')).join('\n')))
console.log((await dumpInputs(page)).join('\n'))
console.log('active', await A.active())
console.log('errors', A.errors)
await A.close()
