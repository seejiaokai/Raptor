// S2 — the List pencil refuses medical changes before any medical question (admin, desktop).
import { world, closeAll, toInputs, fileInput, listAll, listSearch, pencil, undoState, pic, T, readInputs, PE, PSAVE, observe, closeRowEdit } from './aa-A-lib.mjs'
const rows = []
for (const ph of ['allavail', 'all']) {
  const rm = 'walkS2 ' + ph
  const w = await world({ who: 'ad', size: 'd' })
  const { page } = w
  await toInputs(page)
  await fileInput(page, { iso: '2026-07-15', type: 'Meeting', person: ph, remarks: rm, start: '09:00', end: '10:00' })
  const rec0 = JSON.stringify(await page.evaluate(r => window.INPUTS.find(x => x.remarks === r), rm))
  const histN = () => page.evaluate(() => (window.UNDO_COUNT ?? null))
  await listAll(page); await listSearch(page, rm)
  const u0 = JSON.stringify(await undoState(page))
  for (const kind of ['HL', 'OML', 'ATT C', 'ATT B', 'Upchit']) {
    await listSearch(page, rm)
    await pencil(page, rm)
    await page.selectOption('tr.ined [data-ed="type"]', kind)
    await page.waitForTimeout(250)
    const mid = await observe(page)
    await page.locator(PSAVE).click(); await page.waitForTimeout(600)
    const ob = await observe(page)
    const stillEditing = await page.locator(PE).isVisible().catch(() => false)
    const person = stillEditing ? await page.evaluate(q => document.querySelector(q).selectedOptions[0].textContent, PE) : null
    await pic(page, `s02-${ph}-${kind.replace(' ', '')}`)
    const rec1 = JSON.stringify(await page.evaluate(r => window.INPUTS.find(x => x.remarks === r), rm))
    const u1 = JSON.stringify(await undoState(page))
    const row = { ph, kind, stillEditing, personShown: person, windows: ob.wins, messages: ob.msgs, recordUnchanged: rec0 === rec1, undoUnchanged: u0 === u1 }
    console.log(JSON.stringify(row))
    rows.push(row)
    // leave the editor: Escape; if a window is up close it first
    await closeRowEdit(page)
  }
  console.log('errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
