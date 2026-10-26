// probe: a heading tap that opened the neighbouring day on WebKit (phone). usage: node lw-m3-walk-c5.mjs <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const engine = process.argv[2] || 'webkit'
const P = `s20x-phone-${engine}-`
console.log('lw-m3-walk-c5 v1', engine)
L.clearPrefix(P)
const w = await L.newCtx('phone', engine)
await L.signIn(w, 'admin')
const { page } = w
await L.gotoMonth(w, 'JAN')
for (const iso of ['2026-01-02', '2026-01-03', '2026-01-04', '2026-01-02', '2026-01-02', '2026-01-06', '2026-01-07']) {
  if (await L.vis(page, L.T('win-lwday-x'))) { await L.press(w, L.T('win-lwday-x')); await page.waitForTimeout(400) }
  const geo = await page.evaluate(i => {
    const e = document.querySelector(`[data-testid="head-${i}"]`); const r = e.getBoundingClientRect()
    const cx = r.x + r.width / 2, cy = r.y + r.height / 2
    const hit = document.elementFromPoint(cx, cy)
    return { box: [r.x, r.y, r.width, r.height].map(Math.round), cx: Math.round(cx), cy: Math.round(cy), hit: hit ? (hit.dataset.testid || hit.tagName + '.' + hit.className) : null, vw: innerWidth }
  }, iso)
  console.log(iso, JSON.stringify(geo))
  await L.press(w, L.T('head-' + iso), { quick: P + iso + '-tap' }); await page.waitForTimeout(500)
  console.log('  opened', await page.locator(L.T('lwday-body')).first().getAttribute('data-iso'))
}
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
