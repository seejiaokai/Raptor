import { launch, go, pic, say, state, bringIn } from './wlib.mjs'
const ENGINE = process.env.ENGINE || 'chromium'
say('explore11 v1', ENGINE)
const { browser, page } = await launch(ENGINE, true, true)
await go(page, 'editsched')
await page.evaluate(() => window.scrollTo(0, 0))
const b = await page.locator('#histBtn').boundingBox()
await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(700)
say('state', JSON.stringify(await state(page)))
await pic(page, 'x-explore11-chg')
say(await page.evaluate(() => JSON.stringify([...document.querySelectorAll('.chgwin:not([hidden]) button, .chgbar button, [class*="chgslim"] *, .chgslim')].filter(e => e.offsetWidth).slice(0, 30).map(e => e.className + '|' + e.innerText.trim().slice(0, 14)))))
await browser.close()
