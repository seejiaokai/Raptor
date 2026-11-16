import { launch, go, pic, say, state, press } from './wlib.mjs'
say('explore12 v3')
const { browser, ctx, page } = await launch('chromium', false, true)
await go(page, 'editsched')
const DI = process.env.DI || '0'
const D = `#eWeek .day[data-day="${DI}"]`
for (const [k, v] of [['cur', 'dj'], ['sked', 'shaft'], ['plan', 'slash'], ['appr', 'snap']]) {
  const sel = page.locator(`${D} select[data-sign]`).nth(['cur', 'sked', 'plan', 'appr'].indexOf(k))
  // eslint-disable-next-line react-doctor/async-await-in-loop -- one step after another in one browser: each waits for the page to answer the last
  await sel.scrollIntoViewIfNeeded(); await sel.selectOption({ index: 1 }); await page.waitForTimeout(300)
}
say('signs', await page.evaluate(d => JSON.stringify([...document.querySelectorAll(`#eWeek .day[data-day="${d}"] select[data-sign]`)].map(s => s.dataset.sign + '=' + s.value)), DI))
const pub = page.locator(`${D} .dbeak`).first()
say('publish btn', await pub.evaluate(e => e.className + '|' + e.innerText + '|' + e.disabled))
await pic(page, 'x-explore12-signed')
if (!(await pub.evaluate(e => e.disabled))) { await press(page, pub, false); await page.waitForTimeout(900); await pic(page, 'x-explore12-pub-dialog')
  say('dialogs', await page.evaluate(() => JSON.stringify([...document.querySelectorAll('[role=dialog], [role=alertdialog], .sheet, .airpop, .modal')].filter(e => e.offsetWidth).map(e => e.className + '|' + e.innerText.replace(/\n/g, ' ').slice(0, 300))))) }
await browser.close()
