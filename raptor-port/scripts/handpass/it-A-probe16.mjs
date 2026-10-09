import { launch, open, shot, sleep, press, people, allRecs, closeAnyWin } from './it-A-lib.mjs'
import { calDoor } from './it-A-doors.mjs'
const browser = await launch()
const { ctx, page } = await open(browser, 'desk')
const P = await people(page); const c = calDoor()
await c.openNew(page, { iso: '2026-07-15', person: P.Basher, type: 'Event', st: '09:00', en: '10:00' }); await c.submit(page); await closeAnyWin(page)
await page.evaluate(() => window.go('editsched')); await sleep(page, 600)
const f = page.locator('#eWeek .day[data-day="2"] .pl-fold').first()
console.log('before', await f.evaluate(e => e.textContent.replace(/\s+/g, ' ')), await page.locator('#eWeek .day[data-day="2"] [data-inprow]').count())
await f.scrollIntoViewIfNeeded(); await f.click(); await sleep(page, 500)
console.log('after click', await f.evaluate(e => e.textContent.replace(/\s+/g, ' ')), await page.locator('#eWeek .day[data-day="2"] [data-inprow]').count())
await f.click(); await sleep(page, 500)
console.log('after click 2', await f.evaluate(e => e.textContent.replace(/\s+/g, ' ')), await page.locator('#eWeek .day[data-day="2"] [data-inprow]').count())
await browser.close()
