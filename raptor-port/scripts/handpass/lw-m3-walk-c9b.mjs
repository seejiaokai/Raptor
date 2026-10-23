// probe: the Inputs page as the member
import * as L from './lw-m3-walk-c-lib.mjs'
console.log('lw-m3-walk-c9b v1')
const w = await L.newCtx('desk')
await L.signIn(w, 'member', '2026-03-15')
const { page } = w
await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(1500)
await L.shot(w, 'x-inputs-member')
console.log(JSON.stringify(await page.evaluate(() => ({ cur: document.querySelector('.page.on, [id^="page-"]:not([hidden])')?.id, ids: [...document.querySelectorAll('[id^="in"], [data-testid^="in-"]')].map(e => (e.id || '') + '|' + (e.dataset.testid || '')).slice(0, 40) }))))
await L.closeBrowser()
