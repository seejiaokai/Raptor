/* p3 — probe: the board's CX on a row that came from an input */
import { L, inputsCal, openAdd, fillForm, headOf } from './lib.mjs'
const size = process.argv[2] || 'desk'
console.log('p3.mjs — W3 probe · ' + size)
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
  await p.locator('[data-testid="win-inputsday-x"]').click()
  await L.go(w, 'editsched')
  await p.locator(`#eWeek [data-sbday="5"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.waitForSelector('#sbBoard .sb-sec', { state: 'attached' })
  await L.sleep(500)
  console.log('cx buttons:', await p.evaluate(() => [...document.querySelectorAll('#sbBoard [data-grcx], #sbBoard [data-cx], #sbBoard button')].filter(b => /cx/i.test(b.outerHTML.slice(0, 160))).slice(0, 10).map(b => b.outerHTML.slice(0, 160)).join('\n')))
  console.log('ground rows:', await p.evaluate(() => [...document.querySelectorAll('#sbBoard [data-slot^="g:5."]')].map(e => e.getAttribute('data-slot')).join(',')))
} finally { await L.close(w) }
