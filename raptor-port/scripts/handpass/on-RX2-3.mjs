// RX2-3 (taken away and made again over other dates) — a new world
import { launch, world, bye, FRI, THU } from './on-RX2-lib.mjs'
const browser = await launch()
const w = await world(browser, { tag: 'R3' }); const { page, tid } = w
w.say('Warden admin', await w.giveWarden())
const ids = await w.fileFriday()
w.say('filed', ids)
const d0 = await w.makeHoliday('National Day', THU, FRI)
w.say('form dates', d0)
w.say('list after add', await w.listInfo())
await w.hush(); await w.shot('R3-1-list')
await w.press(tid('odl-later')); await page.waitForTimeout(400)
w.say('bells after first add + Later', await w.bothBells('R3-2-bells-first'))
// remove it
await w.me('stiff')
await w.openHolidays()
await w.press(page.locator(`.hol-line[data-from="${THU}"]`)); await page.waitForTimeout(500)
await w.shot('R3-3-form-before-delete')
await w.press(tid('hol-delete')); await page.waitForTimeout(600)
w.say('after pressing delete: buttons', await page.locator('button:visible').evaluateAll(es => es.map(e => (e.getAttribute('data-testid') || e.id || '') + ':' + e.innerText.trim()).filter(s => /elete|emove|ancel|ure|yes|confirm/i.test(s))))
await w.shot('R3-4-after-delete-press')
// a confirm step?
for (const t of ['hol-delete-confirm', 'hol-delete-yes', 'confirm-yes', 'hol-confirm']) { if (await tid(t).count()) { w.say('confirm button', t); await w.press(tid(t)); await page.waitForTimeout(600); break } }
w.say('hol lines after delete', await page.locator('.hol-line').evaluateAll(es => es.map(e => e.dataset.from + '|' + e.innerText.replace(/\s+/g, ' '))))
w.say('list after removal', await w.listInfo())
await w.closeCal()
w.say('bells after removal', await w.bothBells('R3-5-bells-removed'))
// add again Fri only
const d1 = await w.makeHoliday('National Day', FRI)
w.say('form dates 2nd', d1)
w.say('list after 2nd add', await w.listInfo())
await w.hush(); await w.shot('R3-6-list-second')
if (await tid('win-oilday').count()) { await w.press(tid('odl-later')); await page.waitForTimeout(400) }
const b = await w.bothBells('R3-7-bells-second')
w.say('bells after second add', b)
w.say('inputs state', await w.state(ids))
w.say('errors', await bye(w))
await browser.close()
