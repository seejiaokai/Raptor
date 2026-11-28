// sw-probe - which stand-in makes the Tracker's move to 149 fail. node sw-probe.mjs <stand> (ls | mapget | mapset)
import { mk, signIn, go, pickSq, closeAll, note, FACT, bands, barSq, pic } from './lib.mjs'
const STAND = process.argv[2] || 'ls'
const s = await mk('d'); const { page } = s
try {
  await signIn(s, 'ad', 'a')
  await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 })
  if (STAND !== 'mapsetfirst') { await pickSq(s, '149'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await pickSq(s, '142'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }) }
  note('on', await barSq(s))
  await page.evaluate(st => {
    window.__n162 = { hits: 0 }
    if (st === 'ls') {
      Storage.prototype.setItem = function () { window.__n162.hits++; throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') }
      const o = indexedDB.open.bind(indexedDB); indexedDB.open = function () { window.__n162.hits++; throw new DOMException('refused', 'UnknownError') }
    }
    if (st === 'mapget') { const g = Map.prototype.get; Map.prototype.get = function (k) { if (typeof k === 'string' && k.startsWith('tracker/u149@')) { window.__n162.hits++; throw new Error('store refused a read') } return g.call(this, k) } }
    if (st === 'mapset' || st === 'mapsetfirst') { const g = Map.prototype.set; Map.prototype.set = function (k, v) { if (typeof k === 'string' && k.startsWith('tracker/u149@')) { window.__n162.hits++; return this } return g.call(this, k, v) } }
  }, STAND)
  await pickSq(s, '149')
  await page.waitForTimeout(2500)
  const t = await page.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').replace(/\s+/g, ' ').slice(0, 300))
  FACT('probe.' + STAND + '.tracker', t)
  FACT('probe.' + STAND + '.bar', await barSq(s))
  FACT('probe.' + STAND + '.bands', await bands(s))
  FACT('probe.' + STAND + '.hits', await page.evaluate(() => window.__n162.hits))
  await pic(s, 'sw-probe-' + STAND)
} finally { await closeAll() }
