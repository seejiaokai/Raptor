/* The pictures for his look (20 Oct 26): the walk's own pictures with the place each card line is about marked — a ring
   drawn over the picture in a page, the page photographed at 2x (D853, D921: never words alone, the place marked). */
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const DIR = new URL('../../../docs/img/handpass/2026-10-20-oil-batch/', import.meta.url)
const out = new URL('look/', DIR); mkdirSync(out, { recursive: true })
const PICS = [
  ['rewalk/U-desk-al-lower-tap1.png', 1440, 900, 'look-1-unpublish-al1-first-tap.png', [[124, 252, 266, 284], [356, 816, 1084, 878]]],
  ['rewalk/U-desk-al-lower-tap2.png', 1440, 900, 'look-2-unpublish-al1-second-tap.png', [[356, 816, 1084, 878]]],
  ['walk/Z-desk-board.png', 1440, 900, 'look-3-same-time-line-words.png', [[1130, 146, 1430, 312], [204, 488, 444, 520]]],
  ['walk/Z-phone-issues-open.png', 390, 844, 'look-4-same-time-line-phone.png', [[22, 286, 362, 488]]],
]
const browser = await chromium.launch({ headless: true, ...launchOptions })
for (const [src, w, h, name, rects] of PICS) {
  const b64 = readFileSync(new URL(src, DIR)).toString('base64')
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  await page.setContent(`<body style="margin:0"><img src="data:image/png;base64,${b64}" style="display:block;width:${w}px;height:${h}px">${rects.map(([l, t, r, bt]) =>
    `<div style="position:absolute;left:${l - 4}px;top:${t - 4}px;width:${r - l + 8}px;height:${bt - t + 8}px;border:3px solid #ff3b6b;border-radius:10px;box-shadow:0 0 0 2px #000"></div>`).join('')}</body>`)
  await page.screenshot({ path: new URL(name, out).pathname.replace(/^\/([A-Za-z]:)/, '$1') })
  await page.close()
}
await browser.close()
console.log('ok')
