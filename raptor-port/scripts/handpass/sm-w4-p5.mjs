// W4 probe for scenario 5: how to open the filed meeting's window from the Inputs page
import * as L from './sm-lib.mjs'
console.log('sm-w4-p5 v1', L.DIST)
const OUT = L.outDir('w4')
const W = await L.launch('pc', { origin: 'http://localhost:4398' })
const { page } = W
try {
  await L.signIn(W)
  const m = await L.fileInput(W, { who: 'Saint', type: 'Meeting', iso: '2026-07-13', iso2: '2026-07-14', remarks: 'Safety brief' })
  console.log('filed', JSON.stringify(m && { iid: m.iid, type: m.type, acc: m.acc, d: m.dates || m.from || m.d }))
  console.log(Object.keys(m || {}).join(','))
  await L.publishDay(W, 1); await L.closeBoard(W)
  await L.openInputsList(W)
  const rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="in-"], .in-row, .inrow')].filter(e => e.getBoundingClientRect().height > 0).slice(0, 25).map(e => (e.dataset.testid || '') + '|' + e.className.slice(0, 30) + '|' + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)))
  console.log(JSON.stringify(rows, null, 1))
  await L.pic(W, OUT, 'p5-inputs', {})
} catch (e) { console.log('ERR', String(e).slice(0, 300)) }
console.log('errs', JSON.stringify(W.errs))
await L.closeAll(W)
