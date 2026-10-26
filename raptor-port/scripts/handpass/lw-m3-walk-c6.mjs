// probe: tap one place on the Jan 2 heading, each in a fresh page (nothing opened before). usage: node lw-m3-walk-c6.mjs <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const engine = process.argv[2] || 'webkit'
console.log('lw-m3-walk-c6 v2', engine)
const out = []
const ISO = process.argv[3] || '2026-01-02'; for (const dx of [2, 6, 10, 14, 18]) {
  const w = await L.newCtx('phone', engine)
  await L.signIn(w, 'admin')
  const { page } = w
  await L.gotoMonth(w, ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][+ISO.slice(5, 7) - 1]); await page.waitForTimeout(600)
  const b = await page.evaluate(I => { const r = document.querySelector('[data-testid="head-' + I + '"]').getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(v => +v.toFixed(1)) }, ISO)
  const x = Math.round(b[0] + dx); if (w.cdp) await L.finger(w, x, 252); else await page.touchscreen.tap(x, 252)
  await page.waitForTimeout(500)
  const iso = await page.locator(L.T('lwday-body')).first().getAttribute('data-iso').catch(() => null)
  out.push(`tap x=${x} dx=${dx} (heading ${ISO} box ${b.join(',')}) opened=${iso}  errs=${w.errs.length}`)
  await w.ctx.close()
}
console.log(out.join('\n'))
await L.closeBrowser()
