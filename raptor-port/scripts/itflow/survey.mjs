// Survey: sign in and photograph every page, to plan the IT flow guide's journeys.
import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const PORT = process.env.PORT || 4185
const OUT = process.argv[2] || 'survey'
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
page.on('pageerror', e => errs.push(String(e)))
await page.goto(`http://localhost:${PORT}/?fresh=1`)
await page.screenshot({ path: `${OUT}/00-login.png` })
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.waitForTimeout(600)
await page.screenshot({ path: `${OUT}/01-landing.png` })
for (const p of ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help', 'admin']) {
  await page.evaluate(p => window.go(p), p)
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/p-${p}.png` })
}
console.log('errors:', errs.length, errs.slice(0, 3))
await browser.close()
