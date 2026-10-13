/* p2 — probe: open an input's own window; find how it is cancelled */
import { L, inputsCal, openAdd, fillForm, headOf } from './lib.mjs'
const size = process.argv[2] || 'desk'
console.log('p2.mjs — W3 probe · ' + size)
const w = await L.world(size)
const p = w.page
try {
  await inputsCal(w, '2026-07-18')
  await openAdd(w, '2026-07-18')
  await fillForm(w, { type: 'Training', person: 'bane', start: '09:00', end: '12:00', title: 'Range brief' })
  await w.press('#inpEditSave')
  await p.waitForSelector('[data-testid="oilconf"]'); await L.sleep(350)
  await w.press('[data-testid="oil-yes"]'); await w.press('[data-testid="oilconf-save"]')
  await p.waitForSelector('#inpEditPop', { state: 'hidden' })
  await L.sleep(300)
  await w.press('[data-testid^="idy-open"]')
  await L.sleep(500)
  console.log('wins:', await p.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].map(e => e.getAttribute('data-testid') + ' ' + e.className).join(' || ')))
  console.log('buttons in window:', await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] button, [data-testid="win-inputedit"] [data-testid]')].map(e => (e.getAttribute('data-testid') || e.id || '') + ':' + (e.textContent || '').trim().slice(0, 24)).join(' | ')))
  console.log('X2 head', JSON.stringify(await headOf(w, '[data-testid="win-inputedit"]')))
  await L.pic(w, 'p2-inputwin')
  /* how does an input get cancelled? look at the editing form for 'Cancel' words */
  console.log('html:', await p.evaluate(() => document.querySelector('[data-testid="win-inputedit"]').outerHTML.slice(0, 900)))
} finally { await L.close(w) }
