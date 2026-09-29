/* [TRK-LEFTOVERS] baseline — G: which month does "+ Set lull period" open on
   after the lull calendar has been looking at another month? (w2 N6).
   Desktop 1440x900, admin, a fresh browser. Adapted from trk-w2-03-lulls.mjs:
   every press is on the calendar's own buttons. */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, lullChips } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const cal = () => page.evaluate(() => { const c = document.getElementById('lullCal'); if (!c) return null; return { head: c.querySelector('.lullhd b').textContent, month: c.querySelector('.cal .hd b').textContent, step: document.getElementById('lullStep').textContent } })
const today = await page.evaluate(() => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Singapore', month: 'long', year: 'numeric' }).format(new Date()))
L.note('G.0 this month (Singapore)', today)

/* 1. open, look, set a period in THIS month */
await page.locator('#setLullBtn').scrollIntoViewIfNeeded(); await page.click('#setLullBtn'); await sleep(300)
const c0 = await cal()
L.note('G.1 first "+ Set lull period" opens on', JSON.stringify(c0))
await shot(page, 'lo-G-1-first-open')
const days = await page.evaluate(() => [...document.querySelectorAll('#lullCal .day:not(.out)')].slice(20, 22).map(d => d.dataset.iso))
for (const d of days) { await page.locator(`#lullCal .day[data-iso="${d}"]`).click(); await sleep(300) }
L.note('G.2 a period set', days.join(' → ') + ' · chips ' + JSON.stringify(await lullChips(page)))

/* 2. tap the chip to change it, arrow on to November, close with ✕ */
await page.locator('#lullChips .lullchip').first().click(); await sleep(350)
const c1 = await cal()
L.note('G.3 the chip tapped: the calendar reads', JSON.stringify(c1))
for (let i = 0; i < 6 && !/November/.test((await cal()).month); i++) { await page.click('#lullNext'); await sleep(200) }
const c2 = await cal()
L.note('G.4 arrowed on with ›', JSON.stringify(c2))
await shot(page, 'lo-G-2-change-arrowed-to-november')
await page.click('#lullClose'); await sleep(300)
L.note('G.5 closed with ✕; chips', JSON.stringify(await lullChips(page)))

/* 3. + Set lull period again */
await page.click('#setLullBtn'); await sleep(300)
const c3 = await cal()
L.note('G.6 "+ Set lull period" pressed again: opens on', JSON.stringify(c3))
L.ok('G.7 a NEW period opens on this month (' + today + '), not the last month looked at', c3.month === today, `opens on "${c3.month}" (this month "${today}", last looked at "${c2.month}")`)
await shot(page, 'lo-G-3-new-period-opens-on')
await page.keyboard.press('Escape'); await sleep(250)

/* 4. and after arrowing inside a NEW period's calendar (no chip involved) */
await page.click('#setLullBtn'); await sleep(300)
await page.click('#lullPrev'); await sleep(200); await page.click('#lullPrev'); await sleep(200)
const c4 = await cal()
await page.keyboard.press('Escape'); await sleep(250)
await page.click('#setLullBtn'); await sleep(300)
const c5 = await cal()
L.note('G.8 new period, ‹ twice (to ' + c4.month + '), Escape, "+ Set lull period" again: opens on', c5.month)
await shot(page, 'lo-G-4-after-prev-escape-reopen')
await page.keyboard.press('Escape'); await sleep(250)

save('lo-D-lull-month', { rows: L.rows, errors })
console.log('errors', JSON.stringify(errors))
await browser.close()
