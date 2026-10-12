// RX2-2 (shortened) — a new world
import { launch, world, bye, FRI, THU } from './on-RX2-lib.mjs'
const browser = await launch()
const w = await world(browser, { tag: 'R2' }); const { page, tid } = w
w.say('Warden admin', await w.giveWarden())
const ids = await w.fileFriday()
w.say('filed', ids)
const d0 = await w.makeHoliday('National Day', THU, FRI)
w.say('form dates', d0)
w.say('list after add', await w.listInfo())
await w.hush(); await w.shot('R2-1-list-thu-fri')
await w.press(tid('odl-later')); await page.waitForTimeout(400)
w.say('bells before shortening', await w.bothBells('R2-2-bells-before'))
// change to Fri 17 only
await w.openHolidays()
w.say('hol lines', await page.locator('.hol-line').evaluateAll(es => es.map(e => e.dataset.from + '|' + e.innerText.replace(/\s+/g, ' '))))
await w.press(page.locator(`.hol-line[data-from="${THU}"]`)); await page.waitForTimeout(500)
w.say('form dates at open', await page.evaluate(() => { const e = document.querySelector('[data-testid="hol-dates"]'); return e ? [e.dataset.from, e.dataset.to] : null }))
const d = await w.pickDates(FRI, FRI)
w.say('form dates after picking Fri only', d)
await w.shot('R2-3-form')
await w.press(tid('hol-save')); await page.waitForTimeout(900)
w.say('hol err', await tid('hol-err').innerText().catch(() => '(none)'))
await w.closeSettings()
w.say('list after shortening', await w.listInfo())
await w.hush(); await w.shot('R2-4-after-shorten')
if (await tid('win-oilday').count()) { await w.press(tid('odl-later')); await page.waitForTimeout(400) }
await w.closeCal()
const b = await w.bothBells('R2-5-bells-after')
w.say('bells after shortening', b)
// tap the line (Saber) -> list
await w.me('stiff'); await w.openBell()
const ln = page.locator('[data-testid="bell-list"] .bl-line')
w.say('lines in Saber bell', await ln.count())
if (await ln.count()) { await w.press(ln.first()); await page.waitForTimeout(500); w.say('list from Saber bell', await w.listInfo()); await w.hush(); await w.shot('R2-6-list-from-bell'); await w.press(tid('odl-later')); await page.waitForTimeout(300) }
await w.me('nact'); await w.openBell()
w.say('lines in Warden bell', await ln.count())
if (await ln.count()) { await w.press(ln.first()); await page.waitForTimeout(500); w.say('list from Warden bell', await w.listInfo()); await w.hush(); await w.shot('R2-7-list-from-warden') ; await w.press(tid('odl-later')); await page.waitForTimeout(300) }
w.say('inputs state', await w.state(ids))
w.say('errors', await bye(w))
await browser.close()
