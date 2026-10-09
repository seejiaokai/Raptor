import { launch, open, shot, sleep, press, people, allRecs, closeAnyWin } from './it-A-lib.mjs'
import { calDoor } from './it-A-doors.mjs'
const browser = await launch()
const { ctx, page } = await open(browser, process.argv[2] || 'desk')
const P = await people(page)
const c = calDoor()
for (const [who, t, ti, st, en] of [['Ranger', 'Event', 'Sports day', '14:00', '15:00'], ['Anvil', 'Event', '', '16:00', '17:00'], ['Ranger', 'OD', 'Overseas visit', '', ''], ['Anvil', 'OD', '', '', '']]) {
  await c.openNew(page, { iso: '2026-07-15', person: P[who], type: t, st, en }); if (ti) await page.fill('#inpEditTitle', ti); await c.submit(page); await closeAnyWin(page)
}
await page.evaluate(() => window.go('editsched')); await sleep(page, 600)
const d = await page.evaluate(() => {
  const day = document.querySelector('#eWeek .day[data-day="2"]')
  const folds = [...day.querySelectorAll('.pl-fold')].map(f => f.className + '|' + f.textContent.replace(/\s+/g, ' ').trim().slice(0, 60))
  return { folds, secs: [...day.querySelectorAll('.sub-h, .sec-h, h3, h4')].map(x => x.textContent.replace(/\s+/g, ' ').trim().slice(0, 50)).slice(0, 30) }
})
console.log(JSON.stringify(d, null, 1))
for (const f of await page.locator('#eWeek .day[data-day="2"] .pl-fold').all()) { await f.scrollIntoViewIfNeeded(); await f.click(); await sleep(page, 300) }
console.log(await page.evaluate(() => { const day = document.querySelector('#eWeek .day[data-day="2"]'); const rows = [...day.querySelectorAll('[data-inprow]')]; return rows.slice(0, 3).map(r => r.className + ' :: ' + r.outerHTML.slice(0, 700)) }))
console.log('unavail', await page.evaluate(() => { const day = document.querySelector('#eWeek .day[data-day="2"]'); return [...day.querySelectorAll('[data-inprow]')].map(r => r.getAttribute('data-inprow') + ' ' + (r.querySelector('.sbi-ty')||{}).textContent + ' ' + r.closest('.sub-b, .sec, section, div[class*=sec]') ?.className) }))
await browser.close()
