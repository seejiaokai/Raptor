// [LW-PHONE-PINCH-ZOOM] a probe (23 Oct 26): which pointer events reach the page when a held finger is joined by a second
// (real touches over CDP), on the Leave War grid. Read only.
import { chromium, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, screen: { width: 402, height: 874 }, hasTouch: true, isMobile: true, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage()
const sleep = ms => new Promise(r => setTimeout(r, ms))
await page.goto(process.env.URL || 'http://localhost:4274/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.tap('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]'); await sleep(900)
const cdp = await ctx.newCDPSession(page)
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
await page.evaluate(() => {
  window.__ev = []
  const t0 = performance.now()
  for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'lostpointercapture', 'click'])
    window.addEventListener(t, e => window.__ev.push(`${Math.round(performance.now() - t0)} ${t} ${e.pointerId ?? ''} ${e.pointerType ?? ''} ${e.isPrimary ?? ''} ${e.touches ? e.touches.length : ''}`), true)
})
await touch('touchStart', [[190, 700]]); await sleep(420)
await touch('touchStart', [[190, 700], [310, 700]]); await sleep(30)
for (let i = 1; i <= 6; i++) { await touch('touchMove', [[190 - 5 * i, 700], [310 + 5 * i, 700]]); await sleep(16) }
await touch('touchEnd', []); await sleep(500)
console.log((await page.evaluate(() => window.__ev)).join('\n'))
console.log('sheet:', await page.evaluate(() => !!document.querySelector('#page-leavewar .bidsheet')))
await b.close()
