// scratch look at the window's markup (read only) — walker A
import * as L from './ivet-A-lib.mjs'
const { page } = await L.open(L.PHONE, 'ad', 'a', true)
await L.toList(page, true)
await L.plus(page, true)
const html = await page.evaluate(() => document.querySelector('[data-testid="win-inputedit"]').outerHTML)
console.log(html.slice(0, 7000))
console.log('---- types')
console.log(await page.evaluate(() => [...document.querySelectorAll('#inpEditType optgroup')].map(g => g.label + ': ' + [...g.querySelectorAll('option')].map(o => o.value).join(','))))
console.log(JSON.stringify(await L.winState(page)))
await L.shot(page, 'probe-phone-new')
await L.browser.close()
