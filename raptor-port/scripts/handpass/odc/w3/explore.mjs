import { newWorld } from './lib.mjs'
console.log('w3 explore VERSION 1')
const which = process.argv[2] || 'desktop'
const w = await newWorld(which, { tag: 'explore' })
const { page } = w
try {
  await w.login(); await w.toLeaveWar()
  console.log('heading months:', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="month-"]')].map(e => e.getAttribute('data-testid')).join(',')))
  await w.tapCell('slipway', '2026-07-14')
  console.log('SHEET:', await w.text('.bidsheet'))
  console.log('testids in sheet:', await page.evaluate(() => [...document.querySelectorAll('.bidsheet [data-testid]')].map(e => e.getAttribute('data-testid')).join(' | ')))
  await w.shot('explore-sheet-' + which)
  await w.press('[data-testid="bid-postout"]')
  console.log('SHEET after PO:', await w.text('.bidsheet'))
  console.log('po-date value', await w.val('[data-testid="po-date"]'), await w.text('[data-testid="po-date"]'))
  await w.shot('explore-po-' + which)
} catch (e) { console.log('ERR', String(e).slice(0, 400)); await w.shot('explore-err-' + which).catch(() => {}) }
await w.close()
