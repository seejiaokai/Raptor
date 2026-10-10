import { launch, open, shot, sleep, press } from './it-A-lib.mjs'
const browser = await launch()
const { ctx, page } = await open(browser, 'desk')
await page.evaluate(() => window.go('editsched')); await sleep(page, 500)
await page.locator(`#eWeek [data-sbday="2"]:visible`).first().click()
await page.waitForSelector('#schedBoard'); await sleep(page, 500)
console.log('addinp', await page.locator('.sb-addinp').count())
await page.locator('.sb-addinp').first().click(); await sleep(page, 600)
const d = await page.evaluate(() => {
  const out = {}
  out.ids = [...document.querySelectorAll('[id^="inpEdit"]')].map(e => e.tagName + '#' + e.id + ':' + (e.textContent || '').slice(0, 20))
  const pop = document.querySelector('#inpEditPop')
  out.pop = pop && { cls: pop.className, hidden: pop.hidden, rect: JSON.stringify(pop.getBoundingClientRect()), z: getComputedStyle(pop).zIndex }
  out.types = [...document.querySelectorAll('#inpEditType option')].map(o => o.textContent)
  out.persons = [...document.querySelectorAll('#inpEditPerson option')].slice(0, 6).map(o => o.textContent)
  return out
})
console.log(JSON.stringify(d, null, 1))
await shot(page, 'probe-board-add')
await browser.close()
