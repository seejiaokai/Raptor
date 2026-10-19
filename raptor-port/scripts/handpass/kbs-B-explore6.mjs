// exploration — VERSION 2
import { launch, dumpInputs, dumpBtns } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore6 VERSION 2', size)
const A = await launch(size)
const { page } = A
await A.go('leavewar'); await page.waitForTimeout(800)
await page.locator('[data-testid="settings-open"]').click(); await page.waitForTimeout(400)
await page.locator('[data-testid="counter-add"]').click(); await page.waitForTimeout(400)
await page.locator('[data-testid="cform-name"]').fill('TESTC')
await page.getByRole('button', { name: 'Add counter' }).click(); await page.waitForTimeout(600)
await page.locator('[data-testid="settings-close"]').click().catch(() => {}); await page.waitForTimeout(300)
await page.locator('.mwho').first().click(); await page.waitForTimeout(500)
await A.shot('x-lw-mancounter')
console.log((await dumpInputs(page)).join('\n'))
console.log((await dumpBtns(page)).filter(x => /cform|sheet|counter|slot|s0/i.test(x)).join('\n'))
console.log('errors', A.errors)
await A.close()
