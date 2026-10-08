/* D697 — the strip under the tools ("How this works" and its key) measured on the two calendars, on a phone.
   Prints each box's top and height on the Inputs tab and on the SANS tab, and saves a picture of each.
   Run against a served build:  node scripts/handpass/cal-strip-measure.mjs [baseURL] [outDir] [width] */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const base = process.argv[2] || 'http://localhost:4180', out = process.argv[3] || 'docs/img/handpass/2026-10-09-cal-strip', W = +(process.argv[4] || 390)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: W, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
await page.goto(base + '/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('inputs'))
await page.waitForSelector('#inpCal')
const box = sel => page.evaluate(s => { const n = document.querySelector(s); if (!n) return null; const r = n.getBoundingClientRect(); return { top: +r.top.toFixed(1), h: +r.height.toFixed(1), left: +r.left.toFixed(1), right: +r.right.toFixed(1) } }, sel)
const say = async (name, sels) => { const o = {}; for (const [k, s] of Object.entries(sels)) o[k] = await box(s); console.log(name, JSON.stringify(o)); return o }
await say('INPUTS', { strip: '.ib-sub', how: '[data-testid="ib-how"]', key: '[data-testid="ib-legend"]', dow: '.ib-dow, [data-testid="ib-dow"]', grid: '[data-testid="ib-grid"]', head: '.ic-head' })
await page.screenshot({ path: `${out}/inputs-${W}.png`, clip: { x: 0, y: 0, width: W, height: 330 } })
await page.click('#inSansMode'); await page.waitForSelector('[data-testid="sanscal"]')
await say('SANS  ', { strip: '.sc-sub', how: '[data-testid="sc-how"]', key: '[data-testid="sc-legend"]', dow: '[data-testid="sc-dow"]', grid: '[data-testid="sc-grid"]', head: '.sc-head' })
console.log('SANS key words:', JSON.stringify(await page.locator('[data-testid="sc-legend"]').innerText()), '· page width', await page.evaluate(() => document.documentElement.scrollWidth))
await page.screenshot({ path: `${out}/sans-${W}.png`, clip: { x: 0, y: 0, width: W, height: 330 } })
await browser.close()
