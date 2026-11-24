// asp-w2 probe 3: the OFT session's ALL AVAIL count chip — what stands over it, and what a real press at it opens.
// Reads only (the fixture is made through the board's own controls). SZ=d|p
import path from 'node:path'
import * as L from './asp-w2-lib.mjs'
const { sleep, J } = L
console.log('asp-w2-probe3 v2')
const sz = L.SIZES[process.env.SZ || 'd']
const W = L.mk('s23probe', sz)
const { b, p } = await L.world(sz, W)
await L.signIn(p, 'ad', 'a')
await L.openBoard(p, W, 5)
await W.press(p, L.B('[data-sradd="5.oft"]'), 'sim-add')
await L.typeBox(p, W, '[data-bfld="sr:5.oft.0.str"]', '10:00')
await L.typeBox(p, W, '[data-bfld="sr:5.oft.0.end"]', '17:00')
await L.armAndPick(p, W, '[data-slot="s:5.oft.0.p"]', 'allavail', 'sim')
const rid = await p.evaluate(() => window.DAYS[5].sims.oft[0].rid)
console.log('sim', J(await p.evaluate(() => window.DAYS[5].sims.oft[0])))
const c = p.locator(`#schedBoard [data-oilsent="r:${rid}"]:visible`).first()
await c.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
const hit = await c.evaluate(e => {
  const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2
  const top = document.elementFromPoint(x, y)
  const cs = getComputedStyle(e)
  return { box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, pe: cs.pointerEvents, top: top ? (top.tagName + '.' + top.className + ' ' + (top.dataset ? J2(top.dataset) : '')) : null, same: top === e, inside: !!(top && e.contains(top)), parent: e.parentElement.outerHTML.slice(0, 400) }
  function J2(d) { return JSON.stringify(Object.assign({}, d)) }
})
console.log('hit', J(hit))
const pic0 = await W.pic(p, 'chip')
await p.screenshot({ path: path.join(L.OUT, `s23probe-chip-crop-${sz.name}.png`), clip: { x: Math.max(0, hit.box.x - 260), y: Math.max(0, hit.box.y - 40), width: 420, height: 90 } })
/* a real press at the chip's middle */
const x = hit.box.x + hit.box.w / 2, y = hit.box.y + hit.box.h / 2
if (W.isPhone) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y)
await sleep(700)
const win = await L.readWin(p)
console.log('after a press at the chip:', J(win), 'ARM', await p.evaluate(() => window.ARM && window.ARM.key), 'toast', await L.toastSaid(p))
await W.pic(p, 'after-press')
/* the same press on the SDO desk's chip for comparison: put ALL AVAIL there too */
console.log('errors', J(W.errs))
await b.close()
