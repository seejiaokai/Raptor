// probe: what sits at the tick's box? usage: node lw-m3-walk-c10c.mjs <desk|phone> <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const size = process.argv[2] || 'desk', engine = process.argv[3] || 'chromium'
console.log('lw-m3-walk-c10c v1', size, engine)
const w = await L.newCtx(size, engine)
await L.signIn(w, 'admin')
const { page } = w
await L.gotoMonth(w, 'OCT')
await L.press(w, L.T(L.cellId('stiff', '2026-10-28'))); await page.waitForTimeout(1200)
console.log(JSON.stringify(await page.evaluate(() => {
  const i = document.querySelector('[data-testid="bid-approve-tick"]'), l = document.querySelector('[data-testid="bid-approve-tick-label"]')
  const desc = e => e ? (e.tagName + '.' + (e.className || '') + '#' + (e.dataset?.testid || '')) : null
  const r = i.getBoundingClientRect(), lr = l.getBoundingClientRect()
  const pts = {}
  for (const [k, x, y] of [['box centre', r.x + r.width / 2, r.y + r.height / 2], ['label left', lr.x + 3, lr.y + lr.height / 2], ['label centre', lr.x + lr.width / 2, lr.y + lr.height / 2], ['label right', lr.x + lr.width - 3, lr.y + lr.height / 2]]) pts[k] = [Math.round(x), Math.round(y), desc(document.elementFromPoint(x, y))]
  const cs = getComputedStyle(i)
  return { pts, inputStyle: { opacity: cs.opacity, pe: cs.pointerEvents, appearance: cs.appearance, pos: cs.position }, parent: desc(i.parentElement), grand: desc(i.parentElement.parentElement) }
})))
await page.evaluate(() => { window.__c = []; for (const t of ['pointerdown', 'mousedown', 'mouseup', 'click']) document.addEventListener(t, e => window.__c.push(t + ' -> ' + e.target.nodeName + '.' + (e.target.className || '') + '#' + (e.target.dataset?.testid || '') + ' at ' + Math.round(e.clientX) + ',' + Math.round(e.clientY)), true) })
const bb = await page.locator('[data-testid="bid-approve-tick"]').boundingBox()
console.log('box now', JSON.stringify(bb), 'checked', await page.evaluate(() => document.querySelector('[data-testid="bid-approve-tick"]').checked))
await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
await page.waitForTimeout(500)
console.log('events', JSON.stringify(await page.evaluate(() => window.__c)))
console.log('checked after', await page.evaluate(() => document.querySelector('[data-testid="bid-approve-tick"]').checked), 'window now', JSON.stringify(await page.evaluate(() => { const r = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round) })))
await L.shot(w, `s26p-${size}-${engine}-07-tick-area`)
await L.closeBrowser()
