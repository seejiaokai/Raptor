import * as H from './stk-D-lib.mjs'
const { open, nav, openBoard, sleep, pic } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false, state: process.env.STK_STATE })
await openBoard(page, 5)
await page.locator('#sbBoard [data-gline="5.0"]:visible').first().click(); await sleep(600)
const cx = await page.evaluate(() => { const c = document.querySelector('#sbBoard [data-bfld="ff:5.0.1.cs"]'); let e = c; for (let i = 0; i < 6 && e; i++) { const b = e.querySelector && e.querySelector('[data-lcx]'); if (b) return b.getAttribute('data-lcx'); e = e.parentElement } return null })
console.log('cx key', cx)
const b = page.locator(`#sbBoard [data-lcx="${cx}"]`).first()
await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
console.log(await page.evaluate(() => { const p = document.getElementById('cxPop'); return p ? p.outerHTML.slice(0, 900) : 'none' }))
await pic(page, 'explore4-cxpop')
console.log('errors', errors)
await browser.close()
