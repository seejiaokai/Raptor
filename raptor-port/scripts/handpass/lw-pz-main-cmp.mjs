// [LW-PHONE-PINCH-ZOOM] a probe (23 Oct 26): on the LIVE version (main, its − / + still there), does the lit month
// button follow the grid after the zoom is stepped to 1.4 — the same question the pinch raised? Read only.
import { chromium, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, screen: { width: 402, height: 874 }, hasTouch: true, isMobile: true, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage()
const sleep = ms => new Promise(r => setTimeout(r, ms))
await page.goto(process.env.URL || 'http://localhost:4275/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.tap('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]'); await sleep(900)
const where = () => page.evaluate(() => {
  const at220 = [...document.querySelectorAll('#page-leavewar .mx-wrap [data-testid^="head-"]')].find(c => { const q = c.getBoundingClientRect(); return 220 >= q.left && 220 < q.right })?.dataset.testid
  return { at220, on: document.querySelector('#page-leavewar .mjump.on')?.textContent, z: document.querySelector('#page-leavewar .mx-wrap > table.mx').style.zoom, stripH: Math.round(document.querySelector('#page-leavewar td.mstick').getBoundingClientRect().height) }
})
await page.tap('[data-testid="month-OCT"]'); await sleep(900)
console.log('OCT:', JSON.stringify(await where()))
for (let i = 0; i < 3; i++) { await page.tap('[data-testid="lw-zoom-in"]'); await sleep(900); console.log('+:', JSON.stringify(await where())) }
await page.evaluate(() => { document.querySelector('#page-leavewar .mx-wrap').scrollLeft += 2 }); await sleep(600)
console.log('after a 2 px scroll:', JSON.stringify(await where()))
await b.close()
