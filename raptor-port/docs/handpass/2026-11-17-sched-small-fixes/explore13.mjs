import { launch, go, pic, say, state, press } from './wlib.mjs'
say('explore13 v2')
const { browser, ctx, page } = await launch('chromium', false, true)
await go(page, 'editsched')
const D = '#eWeek .day[data-day="0"]'
// eslint-disable-next-line react-doctor/async-await-in-loop -- one step after another in one browser: each waits for the page to answer the last
for (let i = 0; i < 4; i++) { const sel = page.locator(`${D} select[data-sign]`).nth(i); await sel.scrollIntoViewIfNeeded(); await sel.selectOption({ index: 1 }); await page.waitForTimeout(250) }
await press(page, page.locator(`${D} .dbeak`).first(), false); await page.waitForTimeout(900)
await press(page, page.locator(`${D} .planselbtn`).first(), false); await page.waitForTimeout(600)
await pic(page, 'x-explore13-planmenu')
say('menu', await page.evaluate(() => JSON.stringify([...document.querySelectorAll('body *')].filter(e => e.offsetWidth && /as issued|Original|Published|Live working/i.test(e.innerText || '') && e.children.length < 3).map(e => e.tagName + '.' + String(e.className).slice(0, 25) + '|' + e.innerText.replace(/\n/g, ' ').slice(0, 40)).slice(0, 14))))
await browser.close()
