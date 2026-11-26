// bell190-b probe 6: can Ranger place a pending LL bid on the Leave War, and on which dates?
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-probe6 v1')
const S = process.argv[2]
const { b, page } = await L.launch('desk')
console.log(await L.as.ranger(page))
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(2500)
await page.waitForSelector('[data-testid="row-bane"]', { timeout: 20000 }).catch(() => console.log('no row-bane'))
const info = await page.evaluate(() => {
  const t = s => [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.getAttribute('data-testid') || '') + ':' + e.innerText.replace(/\s+/g, ' ').slice(0, 60))
  const cells = [...document.querySelectorAll('[data-testid^="cell-bane-"]')].map(e => e.getAttribute('data-testid').slice(10))
  return { chips: t('[data-testid*="open"], [data-testid*="bidding"], [data-testid*="period"], [data-testid^="month-"]').slice(0, 30), first: cells[0], last: cells[cells.length - 1], n: cells.length }
})
console.log(JSON.stringify(info, null, 1))
await page.screenshot({ path: S + '/probe6-war.png' })
await b.close()
