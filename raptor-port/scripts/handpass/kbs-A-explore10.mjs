import { open, go, version, shot, tapBox, bringLow } from './kbs-A-lib.mjs'
version('explore10')
const { browser, page } = await open()
await go(page, 'admin')
await page.evaluate(() => document.getElementById('admWaveTpl').click()); await page.waitForTimeout(900)
await shot(page, 'explore10-wave-open')
console.log(await page.evaluate(() => [...document.querySelectorAll('#waveTplModal button, [id*=waveTpl] button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.id + ' "' + b.textContent.trim().slice(0, 25) + '" top=' + Math.round(b.getBoundingClientRect().top))))
await browser.close()
