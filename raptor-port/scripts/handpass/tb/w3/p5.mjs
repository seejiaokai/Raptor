import { L, inputsCal, openAdd, fillForm } from './lib.mjs'
const w = await L.world(process.argv[2] || 'desk'); const p = w.page
try {
  await inputsCal(w, '2026-07-18')
  /* one-day weekend Duty 09-12 first */
  await openAdd(w, '2026-07-18'); await fillForm(w, { type: 'Duty', person: 'bane', start: '09:00', end: '12:00' })
  await w.press('#inpEditSave'); await p.waitForSelector('[data-testid="oilconf"]'); console.log('Q1:', (await p.locator('[data-testid="oilconf"]').innerText()).replace(/\s+/g, ' ').slice(0, 200))
  await w.press('[data-testid="oil-yes"]'); await w.press('[data-testid="oilconf-save"]'); await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300)
  await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300)
  for (const end of ['18:00', '23:00', '09:30']) {
    await p.locator('[data-icday="2026-07-18"]').focus(); await p.keyboard.press('Enter'); await p.waitForSelector('[data-testid="win-inputsday"]')
    await w.press('[data-testid^="idy-open"]'); await p.waitForSelector('[data-testid="win-inputedit"]'); await L.sleep(400)
    await p.fill('#inpEditPop #inpEditEnd', end); await w.press('#inpEditSave'); await L.sleep(900)
    console.log('end', end, '-> sheets', await p.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"]')].length), 'toast', await p.evaluate(() => document.querySelector('#toastEl')?.textContent))
    if (await p.locator('[data-testid="oilconf"]').count()) { console.log('Q:', (await p.locator('[data-testid="oilconf"]').innerText()).replace(/\s+/g, ' ').slice(0, 300)); break }
    await p.evaluate(() => { document.querySelectorAll('[data-testid="win-inputedit-x"]').forEach(b => b.click()) }); await L.sleep(300)
    await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300)
  }
} finally { await L.close(w) }
