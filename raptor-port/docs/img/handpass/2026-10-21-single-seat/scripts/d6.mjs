import { L, snap } from './h.mjs'
console.log('d6 v2')
const { browser, ctx, page, errors } = await L.open({ width: 1400, height: 900 })
await L.go(page, 'admin'); await page.waitForTimeout(800)
await page.locator('#page-admin button:has-text("WSO")').first().click(); await page.waitForTimeout(700)
await page.screenshot({ path: process.env.HP_SHOTS + '/d6b.png' })
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-admin button, [role=dialog] button')].filter(b => b.offsetParent).map(b => (b.innerText||'').trim().slice(0,30)).filter(t=>t && !/no sign-in/.test(t)).join(' | ')))
await browser.close()
