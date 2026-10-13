import { newWorld, idOf } from './lib.mjs'
console.log('w3 explore5 VERSION 1')
const w = await newWorld('desktop', { tag: 'x5' }); const { page } = w
try {
  await w.login(); await w.toLeaveWar(); const ANV = await idOf(page, 'Anvil')
  await w.press('[data-testid="month-FEB"]'); await page.waitForTimeout(800)
  await w.tapCell(ANV, '2026-02-10')
  console.log('sheet:', await page.evaluate(() => document.querySelector('.bidsheet').innerText.replace(/\s+/g, ' ')))
  await w.press('[data-testid="bid-LL"]'); await page.waitForTimeout(700)
  console.log('after LL sheet:', await page.evaluate(() => document.querySelector('.bidsheet')?.innerText.replace(/\s+/g, ' ') || '(none)'))
  console.log('cell:', await page.locator(`[data-testid="cell-${ANV}-2026-02-10"]`).getAttribute('class'), 'undo disabled', await page.evaluate(() => document.querySelector('#undoBtn').disabled))
  await w.shot('explore5')
} catch (e) { console.log('ERR', String(e).slice(0, 300)) }
await w.close()
