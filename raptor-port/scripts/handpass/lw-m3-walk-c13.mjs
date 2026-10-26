// probe: what is the teal edge on Cobra's OL on 15 Jul after the panel is closed (phone)?
import * as L from './lw-m3-walk-c-lib.mjs'
console.log('lw-m3-walk-c13 v1')
const w = await L.newCtx('phone', 'chromium')
await L.signIn(w, 'admin')
const { page } = w
await L.gotoMonth(w, 'JUL'); await page.waitForTimeout(800)
const probe = () => page.evaluate(() => { const td = document.querySelector('[data-testid="cell-taipan-2026-07-15"]'); if (!td) return null; const c = td.querySelector('.c'); const cs = getComputedStyle(c); return { tdcls: td.className, cls: c.className, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, shadow: cs.boxShadow.slice(0, 120), border: cs.borderTopColor } })
await page.evaluate(() => { const td = document.querySelector('[data-testid="cell-taipan-2026-07-15"]'); td && td.scrollIntoView({ block: 'center', inline: 'center' }) }); await page.waitForTimeout(500)
console.log('before any panel', JSON.stringify(await probe()))
await L.press(w, L.T('head-2026-07-15')); await page.waitForTimeout(500)
console.log('panel open', JSON.stringify(await probe()))
await L.press(w, L.T('win-lwday-x')); await page.waitForTimeout(800)
console.log('panel closed', JSON.stringify(await probe()))
await page.evaluate(() => { const td = document.querySelector('[data-testid="cell-taipan-2026-07-15"]'); td && td.scrollIntoView({ block: 'center', inline: 'center' }) }); await page.waitForTimeout(500)
await L.shot(w, 'x-cobra-cell-after-close')
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
