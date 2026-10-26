// Scenario 23: the panel's place and whether the grid still works behind it.
// usage: node lw-m3-walk-c3.mjs <desk|phone> <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const size = process.argv[2] || 'desk', engine = process.argv[3] || 'chromium'
const P = `s23-${size}-${engine}-`
console.log('lw-m3-walk-c3 v1', size, engine)
L.clearPrefix(P)
const w = await L.newCtx(size, engine)
await L.signIn(w, 'admin')
const { page } = w
const scrolls = () => page.evaluate(() => {
  const out = { win: [Math.round(scrollX), Math.round(scrollY)], els: [] }
  for (const e of document.querySelectorAll('#page-leavewar *')) {
    if ((e.scrollLeft > 0 || e.scrollTop > 0) && out.els.length < 6) out.els.push((e.className || e.tagName).toString().slice(0, 30) + ':' + Math.round(e.scrollLeft) + ',' + Math.round(e.scrollTop))
  }
  return out
})
const rect = sel => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } }, sel)
async function swipe(x0, y0, x1, y1, steps = 8) {
  if (!w.cdp) return false
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] })
  for (let i = 1; i <= steps; i++) {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / steps, y: y0 + (y1 - y0) * i / steps, id: 1 }] })
    await page.waitForTimeout(25)
  }
  await page.waitForTimeout(120)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(500)
  return true
}
await L.gotoMonth(w, 'JUL')
await page.waitForTimeout(500)
const before = await scrolls(); console.log('scroll before panel', JSON.stringify(before))
await L.press(w, L.T('head-2026-07-15'), w.phone ? { quick: P + '01-open-tap' } : {})
await page.waitForTimeout(500)
await L.shot(w, P + '02-open')
const vp = page.viewportSize()
const win = await rect(L.T('win-lwday')); console.log('viewport', JSON.stringify(vp), 'panel box', JSON.stringify(win))
const body = await rect(L.T('lwday-body')); console.log('panel body box', JSON.stringify(body))
const rows = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => { const r = e.getBoundingClientRect(); return e.dataset.testid + '@' + Math.round(r.y) }).slice(0, 8))
console.log('first rows', rows.join(' '))
const after0 = await scrolls(); console.log('scroll after open', JSON.stringify(after0))
if (w.phone && engine === 'chromium') {
  // a swipe on the strip of grid left visible below the panel (if any), then one on the panel's empty area
  const gridStrip = win ? vp.height - (win.y + win.h) : null
  console.log('strip of screen below the panel (css px)', gridStrip)
  // swipe the grid sideways at the foot strip
  const yStrip = win ? Math.min(vp.height - 4, win.y + win.h + Math.max(2, gridStrip / 2)) : vp.height - 5
  await swipe(300, yStrip, 100, yStrip)
  console.log('after horizontal swipe on strip y=' + Math.round(yStrip), JSON.stringify(await scrolls()))
  await L.shot(w, P + '03-after-strip-swipe')
  // swipe on the panel's empty lower area, upward and sideways
  await swipe(200, 600, 200, 300)
  console.log('after vertical swipe on panel empty area', JSON.stringify(await scrolls()))
  await swipe(300, 600, 100, 600)
  console.log('after horizontal swipe on panel empty area', JSON.stringify(await scrolls()))
  await L.shot(w, P + '04-after-panel-swipes')
}
if (!w.phone) {
  // desktop: the grid works with the panel open - wheel it, tap a cell, drag the panel
  const s0 = await scrolls()
  await page.mouse.move(500, 600); await page.mouse.wheel(0, 300); await page.waitForTimeout(400)
  console.log('wheel down on grid', JSON.stringify(s0), '->', JSON.stringify(await scrolls()))
  await page.mouse.wheel(300, 0); await page.waitForTimeout(400)
  console.log('wheel sideways on grid', JSON.stringify(await scrolls()))
  await L.shot(w, P + '03-after-wheel')
  // drag the panel by its bar
  const bar = await rect(L.T('win-lwday') + ' .win-bar')
  console.log('bar', JSON.stringify(bar))
  await page.mouse.move(bar.x + 100, bar.y + bar.h / 2); await page.mouse.down(); await page.mouse.move(bar.x - 300, bar.y + 200, { steps: 8 }); await page.mouse.up()
  await page.waitForTimeout(300)
  console.log('panel after drag', JSON.stringify(await rect(L.T('win-lwday'))))
  await L.shot(w, P + '04-dragged')
  // tap a grid cell with the panel open
  await page.evaluate(() => window.scrollTo(0, 0))
  const cell = L.T('cell-stiff-2026-07-20')
  await L.press(w, cell); await page.waitForTimeout(600)
  console.log('bid window up with panel open:', await L.vis(page, L.T('bid-picker')), '| panel still open:', await L.vis(page, L.T('lwday-body')))
  await L.shot(w, P + '05-cell-tap-with-panel')
}
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
