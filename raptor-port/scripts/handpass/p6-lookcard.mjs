/* phase 6 check — his look card's step 1, walked at the REAL date (30 Sep 26) before it goes to him: on the week of 5 Oct,
   Wednesday's board, "+ Item" on the Ground Programme, a man put on it; Admin → Users → him → Delete (asked twice); back on
   that week he is gone from Wednesday, and after a reload; his July days keep him. */
import { launch, context, page, signIn, go, sleep, rows } from './dbrA-lib.mjs'
import { put } from './lib.mjs'
import * as W from './dbrA-W1-lib.mjs'
const browser = await launch()
const ctx = await context(browser)
const errors = []
const p = await page(ctx, errors)
await signIn(p, 'a')
const HIM = 'yeti'
const on = (wk) => p.evaluate(([w, i]) => window.CURWEEK === w ? window.DAYS.map(d => JSON.stringify(d).split(`"${i}"`).length - 1) : null, [wk, HIM])
await p.evaluate(() => window.loadWeek('05/10/2026')); await sleep(800)
await W.boardOn(p, 2)
await p.locator('#schedBoard [data-gradd="2"]:visible').first().click(); await sleep(500)
const placed = await put(p, '[data-fill="g:2.0.+"]', [HIM])
console.log('placed', placed, 'week of 5 Oct', JSON.stringify(await on('05/10/2026')))
await W.boardOff(p)
await go(p, 'admin')
await p.waitForSelector('#accList')
await p.locator(`#accList [data-person="${HIM}"] .acc-tap`).click(); await sleep(300)
await p.locator('#accEdDel').click(); await sleep(200); await p.locator('#accEdDel').click(); await sleep(900)
console.log('deleted', await p.evaluate(i => !!window.PEOPLE[i].deleted, HIM))
await p.evaluate(() => window.loadWeek('05/10/2026')); await sleep(800)
console.log('week of 5 Oct after the delete', JSON.stringify(await on('05/10/2026')))
await p.reload(); await signIn(p, 'a', { goto: false })
await p.evaluate(() => window.loadWeek('05/10/2026')); await sleep(800)
console.log('after a reload', JSON.stringify(await on('05/10/2026')))
await p.evaluate(() => window.loadWeek('13/07/2026')); await sleep(800)
console.log('July week (days he flew)', JSON.stringify(await on('13/07/2026')))
await W.toEdit({ go }, p); await W.showDay(p, 2)
await p.screenshot({ path: process.env.HP_SHOTS + '/lookcard-july-kept.png' })
console.log('errors', JSON.stringify(errors))
await browser.close()
