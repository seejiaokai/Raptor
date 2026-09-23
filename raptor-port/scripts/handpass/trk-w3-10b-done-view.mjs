/* w3 item 10, follow-up: "Done editing → the view comes back", walked
   cleanly on a phone — (A) enter, touch-drag a ball, Done: is the view where it
   was? (B) enter, pinch in, Done: what zoom is the chart left at, and does
   "reset" bring back the fit? */
import { open, shot, save, log, PHONE } from './trk-lib.mjs'
import { sleep, box, touchDrag } from './trk-w3-lib.mjs'

const L = log()
const tapSel = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await sleep(450) }
const view = page => page.evaluate(() => { const b = document.getElementById('board'); return { top: b.scrollTop, left: b.scrollLeft, zoom: (document.getElementById('fzPct') || {}).textContent, sw: b.scrollWidth, cw: b.clientWidth } })
const arrange = async page => { await tapSel(page, '#sylMenuBtn'); await tapSel(page, '#arrangeBtn'); await sleep(400) }

const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
/* scroll the chart down a little first, the way a person would have */
const bd = await box(page, '#board')
await touchDrag(page, 200, bd.y + bd.h - 60, 200, bd.y + 80, 10); await sleep(500)
const v0 = await view(page)
/* A */
await arrange(page)
const t = await page.evaluate(() => { const bd = document.getElementById('board').getBoundingClientRect(); const g = [...document.querySelectorAll('#flowSvg .ball')].map(x => ({ id: x.dataset.id, r: x.getBoundingClientRect() })).find(o => o.r.top > bd.top + 20 && o.r.bottom < bd.bottom - 80 && o.r.right < bd.right - 90 && o.r.left > bd.left + 10); return g ? { id: g.id, x: g.r.left + g.r.width / 2, y: g.r.top + g.r.height / 2 } : null })
if (t) await touchDrag(page, t.x, t.y, t.x + 50, t.y + 30, 10)
await arrange(page)
const v1 = await view(page)
L.ok('A. enter, drag a ball, Done editing: the view is back where it was (scroll and zoom)', v1.zoom === v0.zoom && Math.abs(v1.top - v0.top) < 30 && Math.abs(v1.left - v0.left) < 30, `before ${JSON.stringify(v0)} → after ${JSON.stringify(v1)} (dragged ${t && t.id})`)
await shot(page, 'w3-10b-A-after-done')
/* B */
await arrange(page)
const cdp = await page.context().newCDPSession(page)
const cy = 600
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 165, y: cy, id: 1 }, { x: 225, y: cy, id: 2 }] })
for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 165 - i * 10, y: cy, id: 1 }, { x: 225 + i * 10, y: cy, id: 2 }] }); await sleep(30) }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach(); await sleep(300)
await arrange(page)
const v2 = await view(page)
L.note('B. pinched in while arranging, then Done editing: the chart is left at', JSON.stringify(v2))
await shot(page, 'w3-10b-B-after-pinch-done')
await tapSel(page, '#fzReset')
const v3 = await view(page)
L.ok('B. "reset" brings back the fit to the width', v3.zoom === v0.zoom && v3.sw <= v3.cw + 1, JSON.stringify(v3))
L.note('errors', errors.join(' | ') || 'none')
save('w3-10b-done-view', { rows: L.rows })
await browser.close()
