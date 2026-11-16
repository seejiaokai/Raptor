import { launch, go, pic, say } from './wlib.mjs'
say('explore15 v1')
const { browser, page } = await launch('chromium', false, true)
await go(page, 'logic')
await page.locator('button:visible', { hasText: /^\s*\S?\s*Edit\s*$/ }).first().click(); await page.waitForTimeout(500)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
await pic(page, 'x-explore15-top')
say(await page.evaluate(() => JSON.stringify([...document.querySelectorAll('button, [role=button], input')].filter(e => e.offsetWidth && /12h/.test(e.innerText + e.value)).map(e => e.tagName + '.' + e.className + '|' + e.innerText + '|' + Math.round(e.getBoundingClientRect().y)))))
await browser.close()
