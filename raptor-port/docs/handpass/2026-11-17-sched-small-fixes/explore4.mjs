import { launch, go, pic, say } from './wlib.mjs'
say('explore4 v1')
const { browser, page } = await launch('chromium', false)
await go(page, 'editsched')
say(await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#eWeek .day[data-day="0"] [data-fill]')].map(e => e.dataset.fill + (e.offsetWidth ? '' : '(hidden)')))))
say('headings', await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#eWeek .day[data-day="0"] *')].filter(e => e.children.length === 0 && /^(DUT|SIM|GROUND|FLYING|EXTRA|COMMON)/i.test(e.textContent.trim())).map(e => e.className + '|' + e.textContent.trim().slice(0, 30)))))
say('today', await page.evaluate(() => new Date().toString() + ' ' + (window.TODAY || '')))
say('add buttons', await page.evaluate(() => JSON.stringify([...document.querySelectorAll('#eWeek .day[data-day="0"] button, #eWeek .day[data-day="0"] .addrow, #eWeek .day[data-day="0"] [class*="add"]')].filter(e => e.offsetWidth).map(e => e.className + '|' + e.textContent.trim().slice(0, 25)).slice(0, 40))))
await browser.close()
