/* phase 6 check — the day head's plans / versions menu: what it draws once opened on a published day */
import { boot, world } from './p6-lib.mjs'
const { L, W } = await boot()
const { browser, p } = await world(L)
await W.toEdit(L, p); await W.showDay(p, 3)
await W.signDay(p, 3); await W.publishDay(p, 3)
await W.showDay(p, 3)
await p.locator('#eWeek [data-planmenu="3"]:visible').first().click(); await L.sleep(600)
console.log(await p.evaluate(() => { const m = [...document.querySelectorAll('[role=menu], .planmenu, .pmenu, .plan-menu, [data-planmenuopen], .pmpop')].filter(e => e.offsetParent); return m.map(e => e.outerHTML.slice(0, 2500)).join('\n----\n') || [...document.querySelectorAll('button')].filter(b => b.offsetParent && /ORIG|Original|Saved|plan/i.test(b.innerText)).map(b => b.outerHTML.slice(0, 300)).join('\n') }))
await browser.close()
