// exploration — VERSION 1
import { launch, dumpInputs, dumpBtns } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
console.log('kbs-B-explore3 VERSION 1', size)
const A = await launch(size)
const { page } = A
const vis = (arr) => arr.join('\n')
await A.go('admin')
await page.evaluate(() => document.getElementById('admWaveTpl').click()); await page.waitForTimeout(500)
await page.locator('button:has-text("+ New wave template")').first().click(); await page.waitForTimeout(400)
console.log('--- wave tpl new'); console.log(vis((await dumpInputs(page)).filter(x=>!/acc|admGuest|SELECT.*aria=(CUR|SKED|PLAN|APPR)/.test(x))))
await A.shot('x-wavetpl-new')
await page.evaluate(() => document.getElementById('waveTplClose').click()); await page.waitForTimeout(300)
await A.go('leavewar'); await page.waitForTimeout(800)
await page.locator('[data-testid="settings-open"]').click(); await page.waitForTimeout(500)
await A.shot('x-lw-settings')
console.log('--- lw settings'); console.log(vis(await dumpBtns(page)).split('\n').filter(x=>/settings|cform|sheet|Counter/i.test(x)).join('\n'))
await page.locator('[data-testid="settings-sheet"] button:has-text("Counter")').first().click(); await page.waitForTimeout(500)
await A.shot('x-lw-counter')
console.log('--- counter inputs'); console.log(vis(await dumpInputs(page)))
console.log('errors', A.errors)
await A.close()
