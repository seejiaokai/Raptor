// S38 follow-up 2: after the OIL question was opened and cancelled, does Escape on another front window still close ONLY that window?
import { closeWins, world, closeAll, toInputs, openNew, setTimes, pic, T, sleep, readInputs } from './aa-A-lib.mjs'
const wins = async page => {
  const out = []
  for (const [k, sel] of [['day card', '[data-testid="win-inputsday"]'], ['editor', '[data-testid="win-inputedit"]'], ['OIL question', '[data-testid="oilconf"]']]) { const l = page.locator(sel); if (await l.count() && await l.first().isVisible()) out.push(k + (await l.first().evaluate(e => e.classList.contains('front')) ? '(front)' : '')) }
  return out.join(', ') || '(none)'
}
const dr = page => page.evaluate(() => document.querySelector('#inpEditRmk')?.value ?? null)
async function setup(page, tag, ph = 'allavail') {
  await closeWins(page)
  await openNew(page, '2026-07-18')
  await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', ph)
  const ad = page.locator('#inpEditAllday'); if (await ad.isChecked()) await ad.uncheck()
  await setTimes(page, '09:00', '12:00')
  await page.fill('#inpEditRmk', 'walkS38c ' + tag)
}
for (const [label, ph, size] of [['phone ALL AVAIL', 'allavail', 'p'], ['phone named Ace', 'dj', 'p'], ['desktop ALL AVAIL', 'allavail', 'd']]) {
  const w = await world({ who: 'ad', size })
  const page = w.page
  await toInputs(page)
  await setup(page, label, ph)
  await page.locator('#inpEditSave').click(); await sleep(500)
  console.log(label, 'A: question up ->', await wins(page))
  await page.locator(T('oilconf')).getByRole('button', { name: 'Cancel' }).click(); await sleep(500)
  console.log(label, 'B: question cancelled ->', await wins(page), '| draft', await dr(page))
  await page.locator('[data-testid="win-inputsday"]').click({ position: { x: size === 'p' ? 150 : 100, y: 60 }, force: true }); await sleep(400)
  console.log(label, 'C: day card pressed ->', await wins(page))
  await page.keyboard.press('Escape'); await sleep(600)
  console.log(label, 'D: Escape ->', await wins(page), '| draft', await dr(page))
  await pic(page, `s38c-${label.replace(/\W+/g, '_')}-after-escape`)
  await w.ctx.close()
}
await closeAll()
