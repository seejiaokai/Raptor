import { L, inputsCal, openAdd, fillForm } from './lib.mjs'
const w = await L.world(process.argv[2] || 'desk'); const p = w.page
try {
  await inputsCal(w, '2026-07-18'); await openAdd(w, '2026-07-18'); await fillForm(w, { type: 'Training', person: 'bane', start: '09:00', end: '12:00', title: 'Range brief' })
  await w.press('#inpEditSave'); await p.waitForSelector('[data-testid="oilconf"]'); await w.press('[data-testid="oil-yes"]'); await w.press('[data-testid="oilconf-save"]')
  await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await p.locator('[data-testid="win-inputsday-x"]').click(); await L.sleep(500)
  console.log('titles:', await p.evaluate(() => [...document.querySelectorAll('.ib-bar')].filter(b => /18 Jul/.test(b.title)).map(b => JSON.stringify(b.title) + ' ' + b.textContent)))
  console.log(await p.evaluate(() => [...document.querySelectorAll('.ib-bar')].slice(0, 3).map(b => b.outerHTML.slice(0, 200)).join('\n')))
} finally { await L.close(w) }
