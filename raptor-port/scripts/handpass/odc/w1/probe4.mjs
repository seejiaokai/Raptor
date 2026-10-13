import { start, openCalendarWindow, press } from './lib.mjs'
console.log('probe4 VERSION 1')
const L = await start(390, 844)
const { page } = L
await openCalendarWindow(L)
const s = iso => page.evaluate(i => { const b = document.querySelector(`[data-testid="days-step-${i}"]`); return b.className + ' | ' + b.getAttribute('aria-label') + ' | cell: ' + document.querySelector(`[data-testid="days-cell-${i}"]`).className }, iso)
for (let i = 0; i < 4; i++) { console.log(await s('2026-10-20')); await page.locator('[data-testid="days-step-2026-10-20"]').tap(); await page.waitForTimeout(400) }
console.log('weekend', await s('2026-10-24'))
await L.browser.close()
