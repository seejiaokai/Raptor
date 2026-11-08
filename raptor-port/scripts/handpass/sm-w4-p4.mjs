// W4 probe for scenario 4: how a SANS availability is filed (SANS tab -> day -> + Commitment)
import * as L from './sm-lib.mjs'
console.log('sm-w4-p4 v2', L.DIST)
const OUT = L.outDir('w4')
const W = await L.launch(process.env.SIZE || 'pc', { origin: 'http://localhost:4398' })
const { page } = W
try {
  await L.signIn(W)
  await L.openInputsList(W)
  await page.locator('#inSansMode').click(); await L.sleep(800)
  await page.locator('[data-icday="2026-07-15"]').first().scrollIntoViewIfNeeded()
  await page.locator('[data-icday="2026-07-15"]').first().click({ position: { x: 8, y: 8 } }); await L.sleep(800)
  await L.pic(W, OUT, 'p4-day', {})
  const add = page.getByRole('button', { name: /\+ Commitment/ }).first()
  console.log('add count', await add.count())
  await add.click(); await L.sleep(800)
  await L.pic(W, OUT, 'p4-window', {})
  console.log('controls', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('select, input, textarea, button')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.tagName + '#' + e.id + '|' + (e.dataset.testid || '') + '|' + (e.textContent || e.value || '').trim().slice(0, 20)).slice(0, 80))))
} catch (e) { console.log('ERR', String(e).slice(0, 300)) }
await L.closeAll(W)
