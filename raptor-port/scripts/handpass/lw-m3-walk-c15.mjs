// probe: the panel's ‹ › buttons' computed look in each engine (desktop and phone)
import * as L from './lw-m3-walk-c-lib.mjs'
console.log('lw-m3-walk-c15 v1')
for (const [size, engine] of [['desk', 'chromium'], ['desk', 'webkit'], ['phone', 'chromium'], ['phone', 'webkit']]) {
  const w = await L.newCtx(size, engine)
  await L.signIn(w, 'admin')
  await L.gotoMonth(w, 'JUL')
  await L.press(w, L.T('head-2026-07-15')); await w.page.waitForTimeout(600)
  const r = await w.page.evaluate(() => { const g = s => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); const b = e.getBoundingClientRect(); return { bg: c.backgroundColor, color: c.color, border: c.borderTopWidth + ' ' + c.borderTopColor, w: Math.round(b.width), h: Math.round(b.height) } }; return { prev: g('[data-testid="lwday-prev"]'), next: g('[data-testid="lwday-next"]'), x: g('[data-testid="win-lwday-x"]') } })
  console.log(size, engine, JSON.stringify(r))
  await w.ctx.close()
}
await L.closeBrowser()
