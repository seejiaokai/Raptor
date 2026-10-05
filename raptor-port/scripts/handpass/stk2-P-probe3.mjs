/* probe: the week's Personal Inputs section on Saturday — how to open it and which boxes it holds */
import * as R from './stk2-P-run.mjs'
const { newWorld, closeWorld, nav, boxList, sleep, pic, scopeSel } = R
const page = await newWorld({ state: process.env.STK_STATE })
await nav(page, 'editsched')
const wk = scopeSel('week', 5)
const before = (await boxList(page, wk)).filter(b => /^im/.test(b.key) || b.kind === 'inp')
console.log('before', JSON.stringify(before))
const tog = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="5"] [data-pitog]')].map(e => e.outerHTML.slice(0, 160)))
console.log('toggles', JSON.stringify(tog))
const t = page.locator('#eWeek .day[data-day="5"] [data-pitog="5"]').first()
await t.evaluate(e => e.scrollIntoView({ block: 'center' })); await t.click(); await sleep(600)
await pic(page, 'probe3-week-inputs-open')
const after = (await boxList(page, wk)).filter(b => /^im/.test(b.key) || b.kind === 'inp' || b.kind === 'ifld')
console.log('after', JSON.stringify(after))
await closeWorld()
