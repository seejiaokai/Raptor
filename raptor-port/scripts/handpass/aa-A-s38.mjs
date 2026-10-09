// S38 — nested windows and questions keep the intended draft (phone 390x844, admin). Windows: the day card, the editor, the OIL question.
import { closeWins, world, closeAll, toInputs, openNew, setTimes, pic, T, oilAnswer, sleep, readInputs, observe, issue, lwMap, crowdCount } from './aa-A-lib.mjs'
const draft = page => page.evaluate(() => { const p = document.querySelector('#inpEditPop'); const r = p?.getBoundingClientRect(); if (!p || !r.width) return null; return { person: p.querySelector('#inpEditPerson')?.selectedOptions[0]?.textContent, type: p.querySelector('#inpEditType')?.value, remarks: p.querySelector('#inpEditRmk')?.value, start: p.querySelector('#inpEditStart')?.value, end: p.querySelector('#inpEditEnd')?.value } })
const wins = async page => {
  const out = []
  for (const [k, sel] of [['day card', '[data-testid="win-inputsday"]'], ['editor', '[data-testid="win-inputedit"]'], ['OIL question', '[data-testid="oilconf"]']]) { const l = page.locator(sel); if (await l.count() && await l.first().isVisible()) out.push(k + (await l.first().evaluate(e => e.classList.contains('front')) ? '(front)' : '')) }
  return out.join(', ')
}
for (const ph of ['allavail', 'all']) {
  const rm = 'walkS38 draft ' + ph
  const w = await world({ who: 'ad', size: 'p' })
  const page = w.page
  await toInputs(page)
  await openNew(page, '2026-07-18')
  await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', ph)
  const ad = page.locator('#inpEditAllday'); if (await ad.isChecked()) await ad.uncheck()
  await setTimes(page, '09:00', '12:00'); await page.fill('#inpEditRmk', rm)
  console.log(ph, '1 windows up:', await wins(page), '| draft', JSON.stringify(await draft(page)))
  await page.locator('#inpEditSave').click(); await sleep(600)
  console.log(ph, '2 Save pressed -> windows:', await wins(page))
  await pic(page, `s38-${ph}-2-question`)
  await page.locator(T('oilconf')).getByRole('button', { name: 'Cancel' }).click(); await sleep(500)
  console.log(ph, '3 question cancelled -> windows:', await wins(page), '| draft', JSON.stringify(await draft(page)), '| saved', (await readInputs(page, rm)).length)
  await pic(page, `s38-${ph}-3-after-cancel`)
  // bring the day card (the other window) to the front by a press on its visible edge, then close it with Escape
  const dcBox = await page.locator('[data-testid="win-inputsday"]').boundingBox(); const edBox = await page.locator('[data-testid="win-inputedit"]').boundingBox()
  console.log(ph, 'boxes day', JSON.stringify(dcBox), 'editor', JSON.stringify(edBox))
  await page.locator('[data-testid="win-inputsday"] .win-h, [data-testid="win-inputsday"] header, [data-testid="win-inputsday"]').first().click({ position: { x: 150, y: 40 } }); await sleep(400)
  console.log(ph, '4 day card pressed -> windows:', await wins(page))
  await pic(page, `s38-${ph}-4-daycard-front`)
  await page.keyboard.press('Escape'); await sleep(500)
  console.log(ph, '5 Escape on the front window -> windows:', await wins(page), '| draft', JSON.stringify(await draft(page)), '| saved', (await readInputs(page, rm)).length)
  await pic(page, `s38-${ph}-5-after-escape`)
  // forbidden-kind correction at the editor's own door while it is up
  const n0 = await page.evaluate(() => window.INPUTS.length)
  await page.selectOption('#inpEditType', 'LL'); await sleep(250)
  await page.locator('#inpEditSave').click(); await sleep(600)
  console.log(ph, '6 LL + Save -> saved', (await page.evaluate(() => window.INPUTS.length)) - n0, '| OIL question', await page.locator(T('oilconf')).isVisible().catch(() => false), '| windows', await wins(page), '| messages', JSON.stringify((await observe(page)).msgs.filter(m => /filed only|one day/i.test(m))), '| picker line', await page.locator(T('pp-why')).first().innerText().catch(() => null))
  await pic(page, `s38-${ph}-6-forbidden`)
  await page.selectOption('#inpEditType', 'Duty'); await sleep(250)
  console.log(ph, '7 corrected back -> draft', JSON.stringify(await draft(page)))
  await page.locator('#inpEditSave').click(); await sleep(600)
  await oilAnswer(page, 'yes')
  const recs = await readInputs(page, rm)
  console.log(ph, '8 final: inputs with the draft remark', recs.length, JSON.stringify(recs.map(r => ({ n: r.name, oil: r.oil }))))
  await pic(page, `s38-${ph}-7-saved`)
  console.log(ph, 'ORIG', JSON.stringify(await issue(page, 5)))
  const m = await lwMap(page); console.log(ph, 'credits Sat 18 Jul:', crowdCount(m))
  console.log(ph, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
