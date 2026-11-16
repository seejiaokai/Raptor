import { launch, go, pic, say, state, press } from './wlib.mjs'
say('explore8 v1')
const { browser, page } = await launch('chromium', false, true)
await go(page, 'editsched')
await press(page, page.locator('#eWeek .day[data-day="0"] [data-fill="a:0.0.+"] .oilcount').first(), false); await page.waitForTimeout(400)
await press(page, page.locator('#histBtn'), false); await page.waitForTimeout(500)
say(await page.evaluate(() => JSON.stringify([...document.querySelectorAll('.availwin:not([hidden]), .chgwin:not([hidden])')].map(w => ({ c: w.className, z: getComputedStyle(w).zIndex, r: JSON.stringify(w.getBoundingClientRect()), kids: [...w.children].slice(0, 4).map(k => k.className + '|' + k.tagName) })))))
await pic(page, 'x-explore8')
await browser.close()
