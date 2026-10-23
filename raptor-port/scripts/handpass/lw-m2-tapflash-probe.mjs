// Follow-up to lw-m2-tapflash.mjs: after a finger tap on FEB, samples every 30 ms what element is drawn at a point left
// of JAN on the strip row (and at the strip's middle), with its background, to find what paints the teal block.
import { chromium, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page)
await page.goto(`http://localhost:${process.argv[2] || '4180'}/?fresh=1`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('[data-testid^="row-"]'); await page.waitForTimeout(900)
const b = await page.locator('[data-testid="month-FEB"]').boundingBox()
const x = b.x + b.width / 2, y = b.y + b.height / 2
const probe = () => page.evaluate(([px, py]) => [[14, py], [px + 40, py]].map(([qx, qy]) => {
  const e = document.elementFromPoint(qx, qy); if (!e) return 'none'
  const chain = []; for (let n = e; n && chain.length < 4; n = n.parentElement) { const c = getComputedStyle(n); chain.push(`${n.tagName.toLowerCase()}.${String(n.className).split(' ').slice(0, 2).join('.')}[${n.getAttribute('data-testid') || ''}] bg=${c.backgroundColor} op=${c.opacity}`) }
  return chain.join(' < ')
}), [x, y])
console.log('before', JSON.stringify(await probe()))
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
await page.waitForTimeout(80)
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
for (let i = 0; i < 8; i++) { console.log(`+${i * 60}ms`, JSON.stringify(await probe())); await page.waitForTimeout(60) }
await browser.close()
