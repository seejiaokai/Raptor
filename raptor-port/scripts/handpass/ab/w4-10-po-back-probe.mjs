/* W4 probe (26 Sep 26): a posted-out man's row, after the view has been in a month past his last day — does it come
   back when the month strip jumps back to his LAST month (July), and after a wait / a small scroll? READ ONLY after
   the Post out. Usage: node scripts/handpass/ab/w4-10-po-back-probe.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w4'
const L = await import('./w4-lib.mjs')
const PHONE = W === 'phone'
const { browser, page } = await L.openW4({ phone: PHONE, who: 'a' })
const id = 'harpoon'
const row = async (tag) => { const r = await page.evaluate(p => !!document.querySelector(`[data-testid="row-${p}"]`), id); console.log(tag.padEnd(34), r); return r }
await L.lwOpen(page, '2026-08-03')
await L.tapDay(page, PHONE, id, '2026-08-03')
await L.sheetPress(page, 'bid-postout')
await page.locator('[data-testid="po-date"]').fill('2026-08-01'); await page.waitForTimeout(200)
if ((await page.locator('[data-testid="po-archive"]').getAttribute('aria-pressed')) === 'true') await L.sheetPress(page, 'po-archive')
await L.sheetPress(page, 'po-confirm'); await L.closeSheets(page)
await row('after PO, still at 3 Aug')
await L.lwOpen(page, '2026-08-03'); await row('strip AUG')
await L.lwOpen(page, '2026-07-31'); await row('strip JUL (his last month)')
await L.shot(page, `w4-poback-${W}-jul-after-aug`)
await page.waitForTimeout(1500); await row('   +1.5 s')
await page.evaluate(() => { const w = document.querySelector('.mx-wrap'); if (w) w.scrollLeft += 30 }); await page.waitForTimeout(800); await row('   after a 30 px sideways scroll')
await L.lwOpen(page, '2026-06-15'); await row('strip JUN')
await L.lwOpen(page, '2026-07-31'); await row('strip JUL again')
await L.shot(page, `w4-poback-${W}-jul-after-jun`)
await browser.close()
