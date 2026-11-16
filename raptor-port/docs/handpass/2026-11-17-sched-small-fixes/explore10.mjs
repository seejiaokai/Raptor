import { launch, go, pic, say, state } from './wlib.mjs'
say('explore10 v2')
const { browser, page } = await launch(process.env.ENGINE || 'chromium', true, true)
await go(page, 'editsched')
await page.evaluate(() => window.scrollTo(0, 0))
await page.touchscreen.tap(29, 67); await page.waitForTimeout(700)
await pic(page, 'x-explore10-jump')
say(await page.evaluate(() => JSON.stringify([...document.querySelectorAll('[role=dialog] *, .jump *, [class*="jump"] *')].filter(e => e.children.length === 0 && e.offsetWidth).slice(0, 40).map(e => e.tagName + '.' + e.className + '|' + e.textContent.trim().slice(0, 10)))))
await browser.close()
