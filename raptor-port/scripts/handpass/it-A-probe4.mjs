import { launch, open, shot, sleep, press, openNew, saveWin, csId, win, rec, gotoInputs } from './it-A-lib.mjs'
const browser = await launch()
const { ctx, page } = await open(browser, 'desk')
const ranger = await csId(page, 'Ranger')
for (const [t, ti, st, en] of [['Event', 'Sports day', '14:00', '15:00'], ['Event', '', '16:00', '17:00'], ['OD', 'Overseas visit', '', ''], ['OD', '', '', '']]) {
  await openNew(page, '2026-07-15')
  await page.selectOption('#inpEditPerson', ranger)
  await page.selectOption('#inpEditType', t)
  if (st) { await page.fill('#inpEditStart', st); await page.fill('#inpEditEnd', en) }
  if (ti) await page.fill('#inpEditTitle', ti)
  await saveWin(page)
  await page.keyboard.press('Escape')
}
await page.evaluate(() => window.go('editsched')); await sleep(page, 500)
console.log('WEEK sections', await page.evaluate(() => [...document.querySelectorAll('#eWeek .day')][2].innerText.slice(0, 100)))
console.log('week pi', await page.evaluate(() => [...document.querySelectorAll('#eWeek [data-pitog], #eWeek .sb-ph, #eWeek .inpcard, #eWeek [class*=inpcard], #eWeek [class*=pinput]')].slice(0, 12).map(e => e.className + '|' + e.textContent.slice(0, 60))))
await page.locator(`#eWeek [data-sbday="2"]:visible`).first().click(); await page.waitForSelector('#schedBoard'); await sleep(page, 500)
await page.locator('#schedBoard [data-pitog]').first().click(); await sleep(page, 400)
console.log('PI', await page.evaluate(() => [...document.querySelectorAll('#schedBoard .inprow, #schedBoard .sbi-row')].map(r => r.className + ' :: ' + r.outerHTML.slice(0, 900))))
await shot(page, 'probe-board-pi2')
await browser.close()
