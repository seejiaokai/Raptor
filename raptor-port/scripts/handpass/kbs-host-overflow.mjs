/* host probe — [KEYBOARD-SCROLL] his seventh report (19 Oct 26 16:49, "sometimes bottom black screen" with the keys up):
   with the board open and the document held to one screen, can the document still be scrolled when the layout is short
   (an iPhone browser can shorten it for the keys)? Prints, at each height, how far the document can scroll and the
   things that stick out below the screen past the body's clip. */
import { open, version } from './kbs-A-lib.mjs'
version('host-overflow-1')
const { browser, page } = await open({ width: 402, height: 874 })
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
for (const h of [874, 600, 450, 380]) {
  await page.setViewportSize({ width: 402, height: h }); await page.waitForTimeout(400)
  console.log(h, await page.evaluate(() => {
    const se = document.scrollingElement; se.scrollTop = 9999; const y = se.scrollTop; se.scrollTop = 0
    const out = []
    for (const e of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(e); if (cs.position !== 'absolute') continue
      const r = e.getBoundingClientRect(); if (r.bottom > innerHeight + 1 && r.height) out.push((e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ')[0] + '@' + Math.round(r.bottom))
    }
    return JSON.stringify({ canScroll: y, sh: se.scrollHeight, ih: innerHeight, poking: out.slice(0, 8), n: out.length })
  }))
}
await browser.close()
