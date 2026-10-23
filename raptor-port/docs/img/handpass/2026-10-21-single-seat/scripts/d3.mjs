import { L, snap } from './h.mjs'
console.log('d3 v2')
const { browser, ctx, page, errors } = await L.open({ width: 1400, height: 900 })
await L.go(page, 'inputs'); await page.waitForTimeout(800)
await page.locator('#inSansMode').click(); await page.waitForTimeout(1000)
await page.screenshot({ path: process.env.HP_SHOTS + '/d3b.png' })
console.log(await page.evaluate(() => (document.querySelector('#page-inputs')?.innerText||'').slice(0,800)))
console.log(errors)
await browser.close()
