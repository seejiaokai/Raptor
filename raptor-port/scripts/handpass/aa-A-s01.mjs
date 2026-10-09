// S1 — the List's pencil preserves and changes the actual person (admin, desktop). Inputs-page half.
import { world, closeAll, toInputs, fileInput, listAll, listSearch, pencil, undoState, pic, T, readInputs, oilAnswer, PE, PSAVE } from './aa-A-lib.mjs'
const out = []
for (const ph of ['allavail', 'all']) {
  const tag = 'S1-' + ph
  const rm = 'walkS1 ' + ph
  const w = await world({ who: 'ad', size: 'd' })
  const { page } = w
  await toInputs(page)
  await fileInput(page, { iso: '2026-07-18', type: 'Duty', person: ph, remarks: rm, start: '09:00', end: '12:00', oil: 'yes' })
  let rec = (await readInputs(page, rm))[0]
  console.log(tag, 'filed', JSON.stringify(rec))
  await listAll(page); await listSearch(page, rm)
  const u0 = await undoState(page)
  const sel = () => page.evaluate(q => { const s = document.querySelector(q); return s ? { value: s.value, text: s.selectedOptions[0]?.textContent } : null }, PE)
  // 1) open: what does the Person box show
  await pencil(page, rm)
  const shown1 = await sel()
  await pic(page, `s01-${ph}-1-open`)
  const before = JSON.stringify(await readInputs(page, rm))
  await page.locator(PSAVE).click(); await page.waitForTimeout(500)
  const asked1 = await page.locator(T('oilconf')).isVisible().catch(() => false)
  await pic(page, `s01-${ph}-2-saved-unchanged`)
  if (asked1) { await oilAnswer(page, 'cancel') }
  const after = JSON.stringify(await readInputs(page, rm))
  const u1 = await undoState(page)
  console.log(tag, 'open shows', JSON.stringify(shown1), '| asked OIL on unchanged save:', asked1, '| record same:', before === after, '| undo', JSON.stringify(u0), JSON.stringify(u1))
  // 2) reopen: change person to P=Ace(dj), save, answer No
  await listSearch(page, rm)
  await pencil(page, rm)
  const shown2 = await sel()
  await page.selectOption(PE, 'dj')
  await page.locator(PSAVE).click(); await page.waitForTimeout(500)
  const asked2 = await page.locator(T('oilconf')).isVisible().catch(() => false)
  await pic(page, `s01-${ph}-3-change-to-P-asks`)
  if (asked2) await oilAnswer(page, 'no')
  rec = (await readInputs(page, rm))[0]
  console.log(tag, 'reopen shows', JSON.stringify(shown2), '| changed to P asked OIL:', asked2, '| now', JSON.stringify(rec))
  await listSearch(page, rm)
  await pic(page, `s01-${ph}-4-list-named-P`)
  // 3) reopen: shows P; change back to placeholder, Yes
  await pencil(page, rm)
  const shown3 = await sel()
  await page.selectOption(PE, ph)
  await page.locator(PSAVE).click(); await page.waitForTimeout(500)
  const asked3 = await page.locator(T('oilconf')).isVisible().catch(() => false)
  await pic(page, `s01-${ph}-5-back-to-placeholder-asks`)
  if (asked3) await oilAnswer(page, 'yes')
  rec = (await readInputs(page, rm))[0]
  console.log(tag, 'reopen shows', JSON.stringify(shown3), '| back to placeholder asked OIL:', asked3, '| now', JSON.stringify(rec))
  await listSearch(page, rm)
  await pencil(page, rm)
  const shown4 = await sel()
  await pic(page, `s01-${ph}-6-reopen-final`)
  console.log(tag, 'final reopen shows', JSON.stringify(shown4), 'errs', JSON.stringify(w.errs))
  out.push({ tag, shown1, asked1, unchangedSame: before === after, shown2, asked2, shown3, asked3, shown4, errs: w.errs })
  await w.ctx.close()
}
console.log(JSON.stringify(out))
await closeAll()
