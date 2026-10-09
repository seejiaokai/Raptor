// S1 extra: does an unchanged pencil save create a change (full record diff, Undo step)? A named control is compared.
import { world, closeAll, toInputs, fileInput, listAll, listSearch, pencil, undoState, pic, T, oilAnswer, PE, PSAVE } from './aa-A-lib.mjs'
for (const who of ['allavail', 'dj']) {
  const rm = 'walkS1b ' + who
  const w = await world({ who: 'ad', size: 'd' })
  const { page } = w
  await toInputs(page)
  await fileInput(page, { iso: '2026-07-18', type: 'Duty', person: who, remarks: rm, start: '09:00', end: '12:00', oil: 'yes' })
  const full = () => page.evaluate(r => JSON.stringify(window.INPUTS.find(x => x.remarks === r)), rm)
  await listAll(page); await listSearch(page, rm)
  const a = await full()
  await pencil(page, rm)
  await page.locator(PSAVE).click(); await page.waitForTimeout(600)
  const asked = await page.locator(T('oilconf')).isVisible().catch(() => false)
  if (asked) await oilAnswer(page, 'yes')
  const b = await full()
  console.log(who, 'asked', asked, 'record identical:', a === b)
  if (a !== b) { const A = JSON.parse(a), B = JSON.parse(b); for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) console.log('  differs', k, JSON.stringify(A[k]), '->', JSON.stringify(B[k])) }
  const rowtext = await page.locator('tr[data-iid]').first().innerText()
  console.log('  row says:', rowtext.replace(/\s+/g, ' '))
  console.log('  undo', JSON.stringify(await undoState(page)))
  await page.locator('#undoBtn').click(); await page.waitForTimeout(600)
  const afterUndo = await page.evaluate(r => !!window.INPUTS.find(x => x.remarks === r), rm)
  console.log('  after ONE undo the input still exists:', afterUndo, '(true = the unchanged save made its own undo step)')
  await pic(page, `s01b-${who}-after-undo`)
  await w.ctx.close()
}
await closeAll()
