// S38 follow-up: which window does Escape / the cross close when the day card and the editor are both up? (phone, admin)
import { closeWins, world, closeAll, toInputs, openNew, setTimes, pic, T, sleep, readInputs } from './aa-A-lib.mjs'
const wins = async page => {
  const out = []
  for (const [k, sel] of [['day card', '[data-testid="win-inputsday"]'], ['editor', '[data-testid="win-inputedit"]'], ['OIL question', '[data-testid="oilconf"]']]) { const l = page.locator(sel); if (await l.count() && await l.first().isVisible()) out.push(k + (await l.first().evaluate(e => e.classList.contains('front')) ? '(front)' : '')) }
  return out.join(', ') || '(none)'
}
const dr = page => page.evaluate(() => document.querySelector('#inpEditRmk')?.value ?? null)
async function setup(page, tag) {
  await closeWins(page)
  await openNew(page, '2026-07-18')
  await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', 'allavail')
  await page.fill('#inpEditRmk', 'walkS38b ' + tag)
}
const w = await world({ who: 'ad', size: 'p' })
const page = w.page
await toInputs(page)
// V1: the editor is front; Escape
await setup(page, 'V1')
console.log('V1 start:', await wins(page))
await page.keyboard.press('Escape'); await sleep(500)
console.log('V1 Escape with the EDITOR in front ->', await wins(page), '| draft', await dr(page))
await pic(page, 's38b-1-escape-editor-front')
// V2: day card pressed to the front (on its header strip), then Escape
await setup(page, 'V2')
await page.locator('[data-testid="win-inputsday"]').click({ position: { x: 150, y: 60 }, force: true }); await sleep(400)
console.log('V2 start (day card pressed):', await wins(page))
await page.keyboard.press('Escape'); await sleep(500)
console.log('V2 Escape with the DAY CARD in front ->', await wins(page), '| draft', await dr(page))
await pic(page, 's38b-2-escape-daycard-front')
// V3: day card front, press its cross
await setup(page, 'V3')
await page.locator('[data-testid="win-inputsday"]').click({ position: { x: 150, y: 60 }, force: true }); await sleep(400)
console.log('V3 start (day card pressed):', await wins(page))
await page.locator('[data-testid="win-inputsday-x"]').click({ force: true }); await sleep(500)
console.log('V3 day card cross ->', await wins(page), '| draft', await dr(page))
await pic(page, 's38b-3-cross-daycard')
// V4: editor front: its cross
await setup(page, 'V4')
await page.locator('[data-testid="win-inputedit-x"]').click(); await sleep(500)
console.log('V4 editor cross ->', await wins(page))
// V5: OIL question front: Escape
await closeWins(page)
await setup(page, 'V5')
await page.locator('#inpEditSave').click(); await sleep(500)
console.log('V5 question up:', await wins(page))
await page.keyboard.press('Escape'); await sleep(500)
console.log('V5 Escape on the question ->', await wins(page), '| draft', await dr(page))
console.log('errs', JSON.stringify(w.errs))
await closeAll()
