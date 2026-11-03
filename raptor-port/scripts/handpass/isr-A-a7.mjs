// A7 — the ALL AVAIL window's corner on a phone (and the desktop beside it).
import * as L from './isr-A-lib.mjs'
import * as P from './isr-A-pub.mjs'
const { say, check, note, notWalked, tid, press, shot } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
export default async function a7() {
  for (const size of ['phone', 'desktop']) {
    const { ctx, page, tap } = await L.session(size, 'ad', 4)
    try {
      const iid = await L.fileOn(page, tap, '2026-07-18', { type: 'Duty', people: ['allavail'], from: '09:00', to: '12:00', remarks: 'isr A7' })
      if (!iid) { notWalked(`A7 ${size}`, 'the ALL AVAIL duty was not filed'); await ctx.close(); continue }
      await P.editWeek(page)
      await page.locator('#eWeek [data-sbday="5"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
      await page.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await sleep(600)
      const chip = page.locator('#schedBoard .oilcount:visible').first()
      if (!(await chip.count())) { notWalked(`A7 ${size}`, 'no ALL AVAIL count chip drawn on the board'); await shot(page, 'A7', size, 'no-chip'); await ctx.close(); continue }
      await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await press(page, tap, chip); await sleep(900)
      const w = page.locator('.availwin:not([hidden])').first()
      if (!(await w.count())) { notWalked(`A7 ${size}`, 'the window did not open'); await shot(page, 'A7', size, 'no-window'); await ctx.close(); continue }
      const info = await w.evaluate(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { x: r.x, y: r.y, w: r.width, h: r.height, resize: cs.resize, overflow: cs.overflow, vw: innerWidth, vh: innerHeight } })
      say(`A7 ${size} window box ${JSON.stringify(info)}`)
      const clip = { x: Math.max(0, info.x + info.w - 40), y: Math.max(0, info.y + info.h - 40), width: Math.min(40, info.vw - (info.x + info.w - 40)), height: Math.min(40, info.vh - (info.y + info.h - 40)) }
      await w.evaluate(e => { e.style.outline = '3px solid #ff3b6b'; e.style.outlineOffset = '2px' })
      await shot(page, 'A7', size, 'window-whole-marked')
      await w.evaluate(e => { e.style.removeProperty('outline') })
      const f = (await import('node:path')).join(L.OUT, `A7-${size}-corner-zoom.png`)
      await page.evaluate(([x, y]) => { const d = document.createElement('div'); d.id = 'isrMark'; d.style.cssText = `position:fixed;left:${x - 16}px;top:${y - 16}px;width:14px;height:14px;border:1px solid #ff3b6b;pointer-events:none;z-index:99999`; document.body.appendChild(d) }, [info.x + info.w, info.y + info.h])
      await page.screenshot({ path: f, clip })
      await page.evaluate(() => document.getElementById('isrMark')?.remove())
      // is anything drawn in the corner? count non-background pixels is not possible here: the picture says; also record the pointer-hit element at the corner
      const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.className || e.tagName).toString().slice(0, 60) : null }, [info.x + info.w - 4, info.y + info.h - 4])
      say(`A7 ${size} corner clip ${JSON.stringify(clip)} (page scale 5); element at the corner: ${hit}`)
    } catch (e) { say(`ERROR A7 ${size}: ${e.message.split('\n')[0]}`); await shot(page, 'A7', size, 'error').catch(() => {}) }
    await ctx.close()
  }
}
if (process.argv[1].endsWith('isr-A-a7.mjs')) { await a7(); await L.finish('a7') }
