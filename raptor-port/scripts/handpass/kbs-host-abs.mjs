/* host probe — [KEYBOARD-SCROLL] D1081: the board as page content (position:absolute). At a phone's width, after opening
   the board: the board's box, the document's sideways overflow, and the widest thing poking out of the board. */
import { open, version } from './kbs-A-lib.mjs'
version('host-abs-1')
const { browser, page } = await open({ width: 390, height: 844 })
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
console.log(await page.evaluate(() => {
  const b = document.querySelector('#schedBoard'), r = b.getBoundingClientRect(), de = document.documentElement
  let worst = null, w = 0
  for (const e of b.querySelectorAll('*')) { const q = e.getBoundingClientRect(); if (q.right > w && q.width) { w = q.right; worst = e.className || e.tagName } }
  return JSON.stringify({ board: [r.left, r.top, r.width, r.height].map(Math.round), sw: de.scrollWidth, cw: de.clientWidth, bodySW: document.body.scrollWidth, boardSW: b.scrollWidth, worst, w: Math.round(w), style: b.getAttribute('style') })
}))
await browser.close()
