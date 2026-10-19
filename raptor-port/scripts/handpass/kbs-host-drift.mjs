/* host probe — [KEYBOARD-SCROLL] his picture 19 Oct 26 16:13 (the board risen, the page's empty foot below): with the
   board open, the document scrolled by 400 as an iPhone does to show a box; prints the document's scroll and the board's
   top and bottom. Run against the build being judged (the preview on 4333). */
import { open, version } from './kbs-A-lib.mjs'
version('host-drift-1')
const { browser, page } = await open({ width: 402, height: 874 })
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(600)
await page.evaluate(() => window.openScheduler(0)); await page.waitForTimeout(900)
await page.evaluate(() => { document.scrollingElement.scrollTop = 400 }); await page.waitForTimeout(200)
console.log(await page.evaluate(() => { const r = document.getElementById('schedBoard').getBoundingClientRect(); return JSON.stringify({ docY: document.scrollingElement.scrollTop, top: Math.round(r.top), bottom: Math.round(r.bottom), H: innerHeight }) }))
await page.screenshot({ path: `docs/img/handpass/2026-10-19-keyboard-scroll/walk/host-drift-${process.env.TAG || 'x'}.png` })
await browser.close()
