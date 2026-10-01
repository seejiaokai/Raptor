/* W3 probe 7 — probe 6 again, but the way part I reaches it: the correction saved, the page RELOADED, the tracker
   opened fresh, the correction's box tapped, then its date chip — with what the chip says after every press. */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-p7-corrdate2.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, pic } = W
const errors = []
const browser = await L.launch(); const ctx = await L.context(browser)
const page = await W.newPage(ctx, errors, 'A')
await L.signIn(page, 'a'); await L.settle(page); await lwOpen(page, '2026-09-30')
const openT = async () => { await page.locator('[data-testid="oil-tracker"]:visible').first().click(); await L.sleep(1300) }
await openT()
const nm = page.locator('[data-testid="oil-name-nact"]').first(); await nm.evaluate(e => e.scrollIntoView({ block: 'center' })); await nm.click(); await L.sleep(400)
await page.locator('[data-testid="oil-sign"]').click(); await page.fill('[data-testid="oil-amt"]', '1'); await page.fill('[data-testid="oil-reason"]', 'P7 correction')
await page.locator('[data-testid="oil-credit-save"]').click(); await L.sleep(700)
await page.locator('[data-testid="oil-close"]:visible').first().click(); await L.sleep(500)
await page.reload(); await L.signIn(page, 'a', { goto: false }); await lwOpen(page, '2026-09-30')
await openT()
const box = page.locator('[data-testid="oil-row-nact"] [data-testid^="oil-entry-"]').filter({ hasText: 'P7 correction' }).first()
console.log('box count', await box.count())
await box.click(); await L.sleep(400)
const chips = await page.evaluate(() => [...document.querySelectorAll('[data-testid="oil-edit-date"]')].map(e => ({ tag: e.tagName, text: e.innerText, exp: e.getAttribute('aria-expanded'), vis: !!(e.offsetWidth || e.offsetHeight) })))
console.log('chips', chips)
for (let i = 0; i < 3; i++) {
  await page.locator('[data-testid="oil-edit-date"]:visible').first().click(); await L.sleep(600)
  const st = await page.evaluate(() => ({ exp: [...document.querySelectorAll('[data-testid="oil-edit-date"]')].map(e => e.getAttribute('aria-expanded')), days: document.querySelectorAll('[data-testid^="oileditdate-day-"]').length, first: (document.querySelector('[data-testid^="oileditdate-day-"]') || {}).getAttribute?.('data-testid') }))
  console.log('press', i, st)
  if (st.days) {
    const d = page.locator('[data-testid="oileditdate-day-2026-09-29"]').first()
    console.log('29 Sep visible?', await d.isVisible(), 'box', await d.boundingBox(), 'under the point:', await d.evaluate(e => { const b = e.getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return h ? (h.getAttribute('data-testid') || h.tagName + '.' + h.className) : 'nothing' }), 'viewport', page.viewportSize())
    await pic(page, 'P7-chip-open')
    break
  }
}
await pic(page, 'P7-after-presses')
L.check('probe errors', !errors.length, errors)
L.save({})
await browser.close()
