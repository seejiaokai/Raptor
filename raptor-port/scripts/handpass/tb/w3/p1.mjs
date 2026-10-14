/* p1 — probe: file a Training on Sat 18 Jul, see the day window, an input's own window, and what cancels an input */
import { L, inputsCal, openAdd, fillForm, headOf, judgeHead } from './lib.mjs'
const size = process.argv[2] || 'desk'
console.log('p1.mjs — W3 probe · ' + size)
const w = await L.world(size)
const p = w.page
try {
  await inputsCal(w, '2026-07-18')
  await openAdd(w, '2026-07-18')
  await fillForm(w, { type: 'Training', person: 'bane', start: '09:00', end: '12:00', title: 'Range brief' })
  await w.press('#inpEditSave')
  await p.waitForSelector('[data-testid="oilconf"]'); await L.sleep(350)
  console.log('X1 head', JSON.stringify(await headOf(w, '[data-testid="oilconf"]')))
  await L.pic(w, 'p1-oilq')
  await w.press('[data-testid="oil-yes"]'); await w.press('[data-testid="oilconf-save"]')
  await p.waitForSelector('#inpEditPop', { state: 'hidden' })
  await L.sleep(300)
  console.log('day window html chips:', await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-testid], [data-testid="win-inputsday"] button')].slice(0, 40).map(e => (e.getAttribute('data-testid') || e.id || e.className) + ':' + (e.textContent || '').trim().slice(0, 20)).join(' | ')))
  await L.pic(w, 'p1-dayw')
} finally { await L.close(w) }
