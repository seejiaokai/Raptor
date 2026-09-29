import { browser, fresh, go, box, snap } from './lib.mjs'
const page = await fresh('ad')
await go(page, 'leavewar')
await page.waitForSelector('[data-testid="row-bane"]')
await snap(page, 'p6-admin-default')
console.log('lw-viewing', await page.locator('[data-testid="lw-viewing"]').innerText().catch(()=>null))
for (const s of ['.nav a[data-page="leavewar"]','[data-testid="stage-now"]','[data-testid="stage-advance"]','[data-testid="stage-back"]','[data-testid="bid-window"]','[data-testid="war-new"]','[data-testid="war-picker"]']) console.log(s, await box(page,s), await page.locator(s).first().innerText().catch(()=>null))
await page.locator('[data-testid="counts-toggle"]').click(); await page.waitForTimeout(300)
await page.locator('[data-testid="figures-toggle"]').click(); await page.waitForTimeout(500)
// find visible bids in Jan/Feb
const bids = await page.$$eval('[data-testid^="cell-"] .c', els => els.map(e => { const c = e.closest('[data-testid^="cell-"]'); const r = c.getBoundingClientRect(); return [c.getAttribute('data-testid'), e.textContent, e.className, Math.round(r.x), Math.round(r.y)] }).filter(x => x[3] > 200 && x[3] < 1440 && x[4] < 900))
console.log(JSON.stringify(bids))
await snap(page, 'p6-admin-folded')
await browser.close()
