// [LW-PHONE-PINCH-ZOOM] a probe (23 Oct 26): what the zoom-out floor is worked out from, read on the grid as drawn. Read only.
import { chromium, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, screen: { width: 402, height: 874 }, hasTouch: true, isMobile: true, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage()
await page.goto(process.env.URL || 'http://localhost:4271/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.tap('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]'); await page.waitForTimeout(900)
console.log(await page.evaluate(() => {
  const wrap = document.querySelector('#page-leavewar .mx-wrap'), head = wrap.querySelector('.mxhead'), row = head.querySelector('tr:last-child')
  const z = parseFloat(wrap.querySelector('table.mx').style.zoom || '1')
  const ws = [...row.querySelectorAll('th[data-testid^="head-"], th.day')].map(d => +d.getBoundingClientRect().width.toFixed(1))
  const hist = {}; ws.forEach(w => { hist[w] = (hist[w] || 0) + 1 })
  return JSON.stringify({ z, n: ws.length, hist, who: row.querySelector('th.who').getBoundingClientRect().width, bal: row.querySelector('th.bal').getBoundingClientRect().width, inner: innerWidth, client: wrap.clientWidth, screen: [screen.width, screen.height], coarse: matchMedia('(pointer: coarse)').matches })
}))
await b.close()
