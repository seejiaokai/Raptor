// His report (23 Oct 26, 12:16): "When I select the months why I see unclean blue background" — a tinted block over the
// month strip and the header's corner after a tap on a month button. Touches FEB with a real finger on a phone at 390 and
// takes a picture WHILE the finger is down and just after it lifts (the phone's tap highlight shows in that moment), then
// says which elements carry a visible tap-highlight colour.
// Usage: node scripts/handpass/lw-m2-tapflash.mjs <port> <tag>
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
const port = process.argv[2] || '4180', tag = process.argv[3] || 'before'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-23-lw-m2-looks/tapflash')
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch(launchOptions)
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await page.goto(`http://localhost:${port}/?fresh=1`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('[data-testid^="row-"]'); await page.waitForTimeout(900)
const b = await page.locator('[data-testid="month-FEB"]').boundingBox()
const x = b.x + b.width / 2, y = b.y + b.height / 2
const clip = { x: 0, y: Math.max(0, b.y - 120), width: 390, height: 300 }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
await page.waitForTimeout(120)
await page.screenshot({ path: path.join(OUT, `${tag}-finger-down.png`), clip })
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.waitForTimeout(60)
await page.screenshot({ path: path.join(OUT, `${tag}-just-lifted.png`), clip })
await page.waitForTimeout(900)
await page.screenshot({ path: path.join(OUT, `${tag}-settled.png`), clip })
// every element from FEB up to the page: its tap-highlight colour, and whether React made it "clickable" for Safari
const chain = await page.evaluate(([x, y]) => {
  const out = []
  for (let e = document.elementFromPoint(x, y); e && e !== document.documentElement; e = e.parentElement) {
    const c = getComputedStyle(e).webkitTapHighlightColor
    out.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} tap=${c}${e.onclick ? ' onclick' : ''}`)
  }
  return out
}, [x, y])
console.log(chain.join('\n'))
await browser.close()
