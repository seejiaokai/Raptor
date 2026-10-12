import { open, fileInput, toWeek, shot, saveRes, errs, browser, csId, toast, toMonth, barText, openDay, dayCardText, closeDay, listText, inputsOf, undoRedo, unavailRows } from './or-L-lib.mjs'

async function stagePublished(page) {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500)
  for (let i = 0; i < 2; i++) { await page.locator('[data-testid="stage-advance"]').click(); await page.waitForTimeout(600) }
  return page.locator('[data-testid="stage-now"]').innerText()
}
async function readAll(page, tag) {
  const o = {}
  o.inputs = (await inputsOf(page)).filter(r => r.type === 'LL' && /Jul 1[3-7]/.test(r.date) && (r.people.length || ['slipway', 'rocky', 'prowler'].includes(r.person)) || (r.type === 'LL' && ['Hex', 'Drifter', 'Hunter'].includes(r.person) ))
  await toWeek(page)
  o.unavailWed = await unavailRows(page, '#eWeek', 2)
  await toMonth(page);
  o.bar = { mon13: await barText(page, '2026-07-13'), wed15: await barText(page, '2026-07-15') }
  await openDay(page, '2026-07-15'); o.card = await dayCardText(page); await shot(page, `l1-${tag}-card`); await closeDay(page)
  return o
}
const R = {}
/* ---- part A: Saber ---- */
{
  const { ctx, page } = await open('ad', 'a')
  const filed = await fileInput(page, { type: 'LL', people: ['Drifter', 'Hex', 'Hunter'], from: '2026-07-13', to: '2026-07-17' })
  R.filed = filed
  R.before = await readAll(page, 'A-before')
  R.stage = await stagePublished(page)
  const hex = await csId(page, 'Hex')
  await page.locator('[data-testid="month-JUL"]').click(); await page.waitForTimeout(900)
  const cell = page.locator(`[data-testid="cell-${hex}-2026-07-15"]`).first()
  await cell.scrollIntoViewIfNeeded(); await cell.click(); await page.waitForTimeout(600)
  R.sheetOpen = await page.locator('[data-testid="remarks-field"]').count()
  R.fieldWas = await page.locator('[data-testid="remarks-field"]').inputValue()
  await shot(page, 'l1-A-sheet')
  await page.locator('[data-testid="remarks-field"]').fill('Dental')
  await page.locator('[data-testid="remarks-save"]').click(); await page.waitForTimeout(700)
  R.toast = await toast(page)
  await shot(page, 'l1-A-after-save')
  R.after = await readAll(page, 'A-after')
  /* the week's Unavailable list picture */
  await toWeek(page)
  await page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-unav').scrollIntoViewIfNeeded()
  await page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-unav').screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/L/l1-A-unav-after.png' })
  /* Undo */
  R.undo = await undoRedo(page, 'undo')
  R.afterUndo = await readAll(page, 'A-undo')
  R.redo = await undoRedo(page, 'redo')
  R.afterRedo = await readAll(page, 'A-redo')
  await ctx.close()
}
saveRes('L1A', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
