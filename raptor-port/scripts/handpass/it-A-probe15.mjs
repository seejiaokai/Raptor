import { launch, open, shot, sleep, press, people, allRecs, closeAnyWin } from './it-A-lib.mjs'
import { calDoor } from './it-A-doors.mjs'
const browser = await launch()
const { ctx, page } = await open(browser, 'desk')
const P = await people(page)
const d = calDoor()
await d.openNew(page, { iso: '2026-07-22', person: P.Ranger, type: 'Event', st: '14:00', en: '15:00' }); await page.fill('#inpEditTitle', 'Sports day'); await d.submit(page); await closeAnyWin(page)
await d.openNew(page, { iso: '2026-07-22', person: P.Anvil, type: 'Event', st: '16:00', en: '17:00' }); await d.submit(page); await closeAnyWin(page)
await page.evaluate(() => window.go('editsched')); await sleep(page, 700)
for (let i = 0; i < 6; i++) { await press(page, page.locator('#weekNext')); await sleep(page, 300) }
const out = await page.evaluate(() => { const p = document.querySelector('#eWeek .day.peek[data-peek-day="2"]'); const html = p.innerHTML; const i = html.search(/ports day/i); return { len: html.length, i, around: i >= 0 ? html.slice(Math.max(0, i - 400), i + 500) : null, secs: [...p.querySelectorAll('h3,.sub-h,.sec-h,b')].map(x => x.textContent.trim().slice(0, 30)).slice(0, 25) } })
console.log(JSON.stringify(out, null, 1).slice(0, 3000))
await browser.close()
