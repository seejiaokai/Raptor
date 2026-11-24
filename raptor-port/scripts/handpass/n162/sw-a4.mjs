// sw-a4 - subject A, item 4: the same failing pick (Saber, 142 -> 149) made while he is on another page (the schedule),
// the Tracker tab not on screen. Two worlds: "visited" (the Tracker opened once this session, then left) and "never"
// (the Tracker not opened this session).
//   node raptor-port/scripts/handpass/n162/sw-a4.mjs <d|402x874> [mapget|ls]
// The stand-ins are sw-a.mjs's. Pictures: sw-a4-<size>-<stand>-<world>-*.png
import { mk, signIn, go, pickSq, closeAll, note, FACT, die, bands, barSq, pic, pageOn } from './lib.mjs'
const SZ = process.argv[2] || 'd', STAND = process.argv[3] || 'mapget'
const trkText = p => p.evaluate(() => (document.querySelector('#page-tracker')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 240))
/* anything drawn that reads as a message: the question box, a toast, a status line */
const messages = p => p.evaluate(() => {
  const out = []
  for (const e of document.querySelectorAll('#dlgModal, [role=alert], [role=status], .toast, .snack')) {
    const b = e.getBoundingClientRect(); if (b.width < 2 || b.height < 2) continue
    const t = e.textContent.replace(/\s+/g, ' ').trim(); if (t) out.push(t.slice(0, 200))
  }
  return out
})
try {
  console.log('sw-a4 v1', SZ, STAND)
  for (const world of ['visited', 'never']) {
    const s = await mk(SZ); const { page } = s
    const P = `sw-a4-${SZ}-${STAND}-${world}`, F = k => `A4.${SZ}.${STAND}.${world}.${k}`
    await signIn(s, 'ad', 'a')
    if (world === 'visited') {
      await go(s, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }).catch(() => die('the chart did not draw'))
      await pickSq(s, '149'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }).catch(() => die('149 chart did not draw'))
      await pickSq(s, '142'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }).catch(() => die('142 chart did not draw'))
    }
    await go(s, 'viewsched'); FACT(F('before.page'), await pageOn(s)); FACT(F('before.squadron'), await barSq(s))
    FACT(F('before.messages'), await messages(page))
    await page.evaluate(st => {
      window.__n162 = { hits: 0 }
      if (st === 'ls') {
        Storage.prototype.setItem = function () { window.__n162.hits++; throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') }
        indexedDB.open = function () { window.__n162.hits++; throw new DOMException('refused', 'UnknownError') }
      }
      if (st === 'mapget') { const g = Map.prototype.get; Map.prototype.get = function (k) { if (typeof k === 'string' && k.startsWith('tracker/u149@')) { window.__n162.hits++; throw new Error('store refused a read') } return g.call(this, k) } }
    }, STAND)
    await pickSq(s, '149'); await page.waitForTimeout(3500)
    FACT(F('after.page'), await pageOn(s)); FACT(F('after.squadron'), await barSq(s))
    FACT(F('after.messages'), await messages(page)); FACT(F('after.bands'), await bands(s))
    FACT(F('after.standinHits'), await page.evaluate(() => window.__n162.hits))
    await pic(s, `${P}-01-after-pick`)
    await go(s, 'tracker'); await page.waitForTimeout(2500)
    const n = await page.locator('#flowSvg .ball').count()
    FACT(F('trackerOpened'), n ? `chart drawn, ${n} events, bar ${await barSq(s)}` : await trkText(page))
    FACT(F('trackerOpened.standinHits'), await page.evaluate(() => window.__n162.hits))
    await pic(s, `${P}-02-tracker-opened`)
    await s.ctx.close()
  }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
void note
