/* W4 probe (26 Sep 26): after a Post out, where is the man's row drawn? Trident (harpoon) posted out from Sat 1 Aug
   (archive switch OFF) — then the war at mid-July, 31 Jul, 3 Aug; is his row there, and what does the month window say.
   Usage: node scripts/handpass/ab/w4-05-po-row-probe.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w4'
const L = await import('./w4-lib.mjs')
const PHONE = W === 'phone'
const { browser, page, errors } = await L.openW4({ phone: PHONE, who: 'a' })
const id = 'harpoon'
const rowThere = async (tag) => {
  const r = await page.evaluate(p => ({ row: !!document.querySelector(`[data-testid="row-${p}"]`), person: !!document.querySelector(`[data-testid="person-${p}"]`),
    months: [...new Set([...document.querySelectorAll('[data-testid^="head-"]')].map(e => e.getAttribute('data-testid').slice(5, 12)))].join(','),
    cells: [...document.querySelectorAll(`[data-testid^="cell-${p}-"]`)].length }), id)
  console.log(tag, JSON.stringify(r))
  return r
}
await L.lwOpen(page, '2026-07-15'); await rowThere('before-PO jul15')
const t = await L.tapDay(page, PHONE, id, '2026-08-03')
await L.sheetPress(page, 'bid-postout')
await page.locator('[data-testid="po-date"]').fill('2026-08-01'); await page.waitForTimeout(200)
console.log('archive pressed?', await page.locator('[data-testid="po-archive"]').getAttribute('aria-pressed'))
if ((await page.locator('[data-testid="po-archive"]').getAttribute('aria-pressed')) === 'true') await L.sheetPress(page, 'po-archive')
console.log('archive pressed after?', await page.locator('[data-testid="po-archive"]').getAttribute('aria-pressed'))
await L.sheetPress(page, 'po-confirm'); await L.closeSheets(page)
await rowThere('right after PO (grid where it was)')
await L.shot(page, `w4-po-${W}-1-after-po`)
for (const d of ['2026-07-15', '2026-07-31', '2026-08-03', '2026-06-15']) { await L.lwOpen(page, d); const r = await rowThere('after PO at ' + d); if (d === '2026-07-15') await L.shot(page, `w4-po-${W}-2-jul15`) }
console.log('PEOPLE archived?', await page.evaluate(p => ({ archived: !!window.PEOPLE[p].archived }), id))
console.log('errors', JSON.stringify(errors.slice(0, 5)))
await browser.close()
