import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const { ctx, page: p } = await L.open(browser, { width: 1440, height: 900 })
await p.evaluate(() => window.go('leavewar')); await p.waitForTimeout(1500)
await L.shot(p, 'x5-lw')
const t = await p.evaluate(() => document.body.innerText)
console.log(t.slice(0, 1800))
console.log(await p.evaluate(() => [...document.querySelectorAll('#page-leavewar [data-testid]')].map(e => e.getAttribute('data-testid')).filter(t => !/^(req-|fly-row|cell)/.test(t)).slice(0, 80).join(',')))
await browser.close()
