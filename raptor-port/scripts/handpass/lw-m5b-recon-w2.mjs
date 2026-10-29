import { chromium, serveDist } from '../drawcheck/lib.mjs'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25, timezoneId: 'Asia/Singapore' })
await serveDist(ctx, 'http://localhost:4197', 'C:/dcm5bdraw/walkdist')
const page = await ctx.newPage()
page.on('pageerror', e => console.log('PAGEERROR', e.message))
await page.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
await page.goto('http://localhost:4197/')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')
// which days of the demo week are published / have flying
console.log('EDIT WEEK day heads:', await page.evaluate(() => [...document.querySelectorAll('#vWeek .day')].map(d => (d.querySelector('.dh, .day-head, header, h3')?.textContent || d.textContent.slice(0, 60)).trim().replace(/\s+/g, ' ').slice(0, 80))))
await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('[data-testid="row-slipway"]')
await page.waitForTimeout(1000)
console.log('LL cells', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"]')].filter(e => /LL/.test(e.textContent)).slice(0, 40).map(e => e.dataset.testid + '|' + e.className.slice(0, 60) + '|' + e.innerHTML.slice(0, 140).replace(/\s+/g, ' '))))
await browser.close()
