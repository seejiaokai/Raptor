import { open, fileInput, shot, errs, browser, lwOpen, toWeekDay, unavRows } from './or-J-lib.mjs'
const { ctx, page } = await open({ fresh: true })
for (const type of ['Fly with', 'CSE', 'OD']) {
  const f = await fileInput(page, { type, people: ['Hex', 'Hunter'], from: '2026-07-13', to: '2026-07-17' })
  console.log(type, JSON.stringify(f).slice(0, 200))
  await toWeekDay(page, 0)
  const days = []
  for (let di = 0; di < 5; di++) days.push(di + ':' + (await unavRows(page, di)).filter(r => r.people.some(n => ['Hex', 'Hunter'].includes(n))).map(r => r.text.slice(0, 18)).join(','))
  console.log(days.join(' | '))
  await lwOpen(page, 'jul')
  console.log(await page.evaluate(() => ['2026-07-14', '2026-07-15'].map(d => d + '=' + (document.querySelector(`[data-testid="cell-rocky-${d}"]`)?.innerText || '').trim() + '/' + document.querySelector(`[data-testid="cell-rocky-${d}"]`)?.className.slice(0, 30)).join(' ')))
  await page.evaluate(() => window.go('inputs'))
  // delete via undo to clean
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(300)
  await page.locator('#undoBtn').click().catch(() => {}); await page.waitForTimeout(500)
}
await ctx.close(); await browser.close()
