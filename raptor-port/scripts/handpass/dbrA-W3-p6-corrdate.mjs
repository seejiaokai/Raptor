/* W3 probe 6 — part I's I8b: why the correction's date chip did not offer 29 Sep. Opens the tracker, makes a −1
   correction for Warden, opens it, presses its date chip, and lists what the chip opened. */
import { fileURLToPath } from 'node:url'
const ROOT0 = fileURLToPath(new URL('../../', import.meta.url)).split('\\').join('/').replace(/\/$/, '')
process.env.HP_OUT ||= `${ROOT0}/docs/handpass/parts/dbrA-W3-p6-corrdate.json`
const W = await import('./dbrA-W3-lib.mjs')
const { L, lwOpen, pic } = W
const errors = []
const browser = await L.launch(); const ctx = await L.context(browser)
const page = await W.newPage(ctx, errors, 'A')
await L.signIn(page, 'a'); await L.settle(page); await lwOpen(page, '2026-09-30')
await page.locator('[data-testid="oil-tracker"]:visible').first().click(); await L.sleep(1300)
const nm = page.locator('[data-testid="oil-name-nact"]').first(); await nm.evaluate(e => e.scrollIntoView({ block: 'center' })); await nm.click(); await L.sleep(400)
await page.locator('[data-testid="oil-sign"]').click(); await page.fill('[data-testid="oil-amt"]', '1'); await page.fill('[data-testid="oil-reason"]', 'P6 correction')
await page.locator('[data-testid="oil-credit-save"]').click(); await L.sleep(700)
const box = page.locator('[data-testid="oil-row-nact"] [data-testid^="oil-entry-"]').filter({ hasText: 'P6 correction' }).first()
await box.click(); await L.sleep(400)
const chip = page.locator('[data-testid="oil-edit-date"]').first()
console.log('chip', await chip.evaluate(e => ({ tag: e.tagName, text: e.innerText, exp: e.getAttribute('aria-expanded') })))
await chip.click(); await L.sleep(500)
console.log('after click', await chip.evaluate(e => ({ exp: e.getAttribute('aria-expanded') })).catch(e => String(e)))
const ids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="oileditdate"]')].map(e => e.getAttribute('data-testid')).slice(0, 12))
console.log('picker testids', ids)
await pic(page, 'P6-correction-date-chip')
L.check('probe errors', !errors.length, errors)
L.save({ ids })
await browser.close()
