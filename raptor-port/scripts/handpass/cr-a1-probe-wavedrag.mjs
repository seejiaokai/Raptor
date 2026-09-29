/* Walker A1 — probe: why does a wave's ⠿ drag on the PHONE BOARD not move the wave (struct B4), when the same drag
   works on the phone's edit week and on the desktop board? Measures the grip, the target and the scroll box, then
   drags by hand in small steps, photographing the middle of the drag. HP_W=390. */
import { openA1, book, boardOn, PHONE } from './cr-a1-lib.mjs'
const { browser, page, errors } = await openA1('a')
const bk = book('wdrag')
await boardOn(page, 0)
/* add a short third wave through + Wave, as the walk did */
await page.locator('#schedBoard [data-wvadd="0"]:visible').first().click(); await page.waitForTimeout(500)
await page.locator('[data-wmkind=""]:visible').first().click(); await page.waitForTimeout(700)
const info = async () => page.evaluate(() => {
  const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] }
  const B = document.querySelector('#schedBoard')
  const blocks = [...B.querySelectorAll('[data-move^="mv:w.0."]')].filter(e => e.offsetParent).map(e => ({ mv: e.dataset.move, cls: String(e.className).slice(0, 30), box: r(e), grip: r(e.querySelector('.wvgrip')) }))
  let n = B.querySelector('.wvgrip'), box = null
  while (n && n !== document.body) { const oy = getComputedStyle(n).overflowY; if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) { box = n; break } n = n.parentElement }
  return { blocks, scrollBox: box ? { cls: String(box.className).slice(0, 30), top: box.scrollTop, h: box.clientHeight } : 'window', vh: innerHeight }
})
bk.note('layout', await info())
/* bring the last wave's grip to the middle of the screen and drag it up onto the wave before it, in small steps */
const g = page.locator('#schedBoard [data-move="mv:w.0.2"] .wvgrip:visible').first()
await g.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(400)
const gb = await g.boundingBox()
const t = page.locator('#schedBoard [data-move="mv:w.0.1"]:visible').first()
const tb = await t.boundingBox()
bk.note('before-drag', { grip: gb, target: tb, hit: await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.className || e.tagName).toString().slice(0, 40) : null }, [gb.x + gb.width / 2, gb.y + gb.height / 2]) })
await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2)
await page.mouse.down()
for (let i = 1; i <= 12; i++) { await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2 - i * 25); await page.waitForTimeout(60) }
const mid = await page.evaluate(() => ({ lifted: !!document.querySelector('.rowlift, .lifted, [class*=lift]'), lit: [...document.querySelectorAll('.rowdrop')].map(e => e.dataset.move), body: document.body.className.slice(0, 80) }))
bk.note('mid-drag', mid, await bk.shot(page, 'mid-drag'))
/* release where the drop bar is lit, as a thumb would (the target wave's own top is above the window) */
await page.waitForTimeout(200)
const lit2 = await page.evaluate(() => [...document.querySelectorAll('.rowdrop')].map(e => e.dataset.move))
await page.mouse.up(); await page.waitForTimeout(700)
const w = await page.evaluate(() => window.DAYS[0].waves.map(x => x.label))
bk.note('after', { litAtRelease: lit2, waves: w }, await bk.shot(page, 'after-drag'))
bk.save(errors)
await browser.close()
