import { L, snap } from './h.mjs'
console.log('d1 v1')
const { browser, ctx, page, errors } = await L.open({ width: 1400, height: 900 })
await L.go(page, 'leavewar'); await page.waitForTimeout(1500)
await page.screenshot({ path: process.env.HP_SHOTS + '/d1a.png' })
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-leavewar [data-testid]')].slice(0,60).map(e => e.dataset.testid).join(' | ')))
console.log(await page.evaluate(() => (document.querySelector('#page-leavewar')?.innerText || '').slice(0, 1500)))
console.log(errors)
await browser.close()
