// S50 follow-up: the "Change…" button a crowd member sees on a placeholder Event he did not file. What does it do?
import { closeWins, world, closeAll, toInputs, openNew, openDay, setTimes, pic, T, oilAnswer, sleep, readInputs, observe, switchUser, setPerson, undoState } from './aa-A-lib.mjs'
for (const ph of ['allavail']) {
  const w = await world({ who: 'ad', size: 'd' })
  const page = w.page
  await toInputs(page)
  await openNew(page, '2026-07-18')
  await page.selectOption('#inpEditType', 'Event'); await page.selectOption('#inpEditPerson', ph)
  { const a = page.locator('#inpEditAllday'); if (await a.isChecked()) await a.uncheck() }
  await setTimes(page, '09:00', '12:00'); await page.fill('#inpEditRmk', 'walkS50b placeholder')
  await page.locator('#inpEditSave').click(); await sleep(700)
  await oilAnswer(page, 'yes')
  await closeWins(page)
  const before = (await readInputs(page, 'walkS50b'))[0]
  console.log('filed by admin, answer:', JSON.stringify(before.oil), 'by', before.by)
  await switchUser(page, 'us'); await toInputs(page); await setPerson(page, 'all')
  await openDay(page, '2026-07-18')
  await page.locator('[data-testid="win-inputsday"] .sd-row').filter({ hasText: 'walkS50b' }).locator('.sd-open').first().click(); await sleep(700)
  await pic(page, 's50b-1-member-opens-placeholder')
  const ch = page.locator('#inpEditPop').getByRole('button', { name: /Change/ })
  console.log('Change… buttons on the placeholder card:', await ch.count())
  const u0 = JSON.stringify(await undoState(page))
  await ch.first().click(); await sleep(700)
  console.log('after pressing Change…: OIL question up =', await page.locator(T('oilconf')).isVisible().catch(() => false))
  await pic(page, 's50b-2-after-change-press')
  if (await page.locator(T('oilconf')).isVisible().catch(() => false)) {
    console.log('question text:', (await page.locator(T('oilconf')).innerText()).replace(/\s+/g, ' ').slice(0, 200))
    await page.locator(T('oil-no')).click(); await page.locator(T('oilconf-save')).click(); await sleep(700)
    const after = (await readInputs(page, 'walkS50b'))[0]
    console.log('after the MEMBER answered No: record oil =', JSON.stringify(after.oil), '| undo changed:', u0 !== JSON.stringify(await undoState(page)), '| messages', JSON.stringify((await observe(page)).msgs.slice(0, 3)))
    await pic(page, 's50b-3-after-member-answer')
  }
  console.log('errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
