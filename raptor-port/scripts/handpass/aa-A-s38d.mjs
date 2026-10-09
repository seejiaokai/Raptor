// S38 follow-up 3: the exact press the main S38 script used on the day card, then Escape.
import { closeWins, world, closeAll, toInputs, openNew, setTimes, pic, T, sleep } from './aa-A-lib.mjs'
const wins = async page => { const out = []; for (const [k, sel] of [['day card', '[data-testid="win-inputsday"]'], ['editor', '[data-testid="win-inputedit"]'], ['OIL question', '[data-testid="oilconf"]']]) { const l = page.locator(sel); if (await l.count() && await l.first().isVisible()) out.push(k + (await l.first().evaluate(e => e.classList.contains('front')) ? '(front)' : '')) } return out.join(', ') || '(none)' }
const dr = page => page.evaluate(() => document.querySelector('#inpEditRmk')?.value ?? null)
for (const [who, pos] of [['dj', { x: 150, y: 40 }], ['allavail', { x: 150, y: 40 }], ['all', { x: 150, y: 40 }]]) {
  const w = await world({ who: 'ad', size: 'p' })
  const page = w.page
  await toInputs(page)
  await openNew(page, '2026-07-18')
  await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', who)
  await page.fill('#inpEditRmk', 'walkS38d')
  const el = await page.locator('[data-testid="win-inputsday"] .win-h, [data-testid="win-inputsday"] header, [data-testid="win-inputsday"]').first()
  console.log('target element of the press:', await el.evaluate(e => e.tagName + '.' + e.className + ' @' + JSON.stringify(e.getBoundingClientRect())))
  await el.click({ position: pos }); await sleep(400)
  console.log(who, JSON.stringify(pos), 'pressed ->', await wins(page), '| active element:', await page.evaluate(() => document.activeElement?.tagName + '#' + document.activeElement?.id))
  await page.keyboard.press('Escape'); await sleep(600)
  console.log(who, JSON.stringify(pos), 'Escape ->', await wins(page), '| draft', await dr(page))
  await w.ctx.close()
}
await closeAll()
