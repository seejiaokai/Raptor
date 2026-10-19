import { open, go, version, shot, tapBox } from './kbs-A-lib.mjs'
version('explore16b')
const { browser, page } = await open()
await page.touchscreen.tap(30, 30); await page.waitForTimeout(800)
await tapBox(page, page.locator('a:visible', { hasText: /^Help$/ }).first()); await page.waitForTimeout(1200)
await shot(page, 'explore16-help')
console.log(await page.evaluate(() => [location.hash, document.title, window.CURPAGE]))
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-help input,#page-help textarea,#page-help button')].filter(b => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().top > 60).slice(0, 25).map(b => `${b.tagName}#${b.id}.${String(b.className).slice(0, 20)} "${(b.textContent || b.placeholder || '').trim().slice(0, 25)}" ${Math.round(b.getBoundingClientRect().top)}-${Math.round(b.getBoundingClientRect().bottom)}`)))
await browser.close()
