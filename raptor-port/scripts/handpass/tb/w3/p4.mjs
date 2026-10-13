import { L, inputsCal, openAdd, fillForm } from './lib.mjs'
const w = await L.world(process.argv[2] || 'desk'); const p = w.page
try {
  await inputsCal(w, '2026-07-13'); await openAdd(w, '2026-07-13')
  await fillForm(w, { type: 'ATT C', person: 'bane', allday: true })
  await p.locator('#inpEdCal [data-cal="2026-07-15"]').click()
  await w.press('#inpEditSave'); await p.waitForSelector('[data-testid="docconf"]'); await w.press('[data-testid="docconf-nodoc"]')
  await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300)
  await p.locator('[data-testid="win-inputsday-x"]').click(); await L.sleep(300)
  await openAdd(w, '2026-07-14')
  await p.selectOption('#inpEditPop #inpEditType', 'Upchit'); await p.selectOption('#inpEditPop #inpEditPerson', 'bane')
  await L.sleep(300)
  console.log('form text:', await p.evaluate(() => document.querySelector('#inpEditPop').innerText.replace(/\s+/g, ' ').slice(-300)))
  await w.press('#inpEditSave'); await L.sleep(600)
  console.log('toast:', await p.evaluate(() => document.querySelector('#toastEl')?.textContent + ' op ' + getComputedStyle(document.querySelector('#toastEl')).opacity))
  console.log('sheets', await p.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"],[data-testid="upconf"],[data-testid="medclash"],[data-testid="docconf"]')].map(e => e.getAttribute('data-testid')).join(',')))
  await L.pic(w, 'p4-up')
} finally { await L.close(w) }
