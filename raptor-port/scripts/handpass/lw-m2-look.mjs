// M2 (the Leave War overhaul's "how it looks") — the host's quick look while building: signs in as an admin and as a
// member, opens the Leave War and takes pictures of the top of the page at a desktop's and a phone's size.
// Usage: node scripts/handpass/lw-m2-look.mjs <port> <tag>   (a built bundle served by `vite preview` on <port>)
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
const port = process.argv[2] || '4173'
const tag = process.argv[3] || 'look'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-23-lw-m2-looks', tag)
mkdirSync(OUT, { recursive: true })
const URL = `http://localhost:${port}/?fresh=1`
const browser = await chromium.launch(launchOptions)
const errs = []
async function run(who, phone) {
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  page.on('console', m => { if (m.type() === 'error') errs.push(`${who}/${phone ? 'phone' : 'desk'} console: ${m.text().slice(0, 200)}`) })
  page.on('pageerror', e => errs.push(`${who}/${phone ? 'phone' : 'desk'} pageerror: ${String(e).slice(0, 200)}`))
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(URL)
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]')
  await page.waitForTimeout(900)
  const name = `${who}-${phone ? 'phone' : 'desk'}`
  await page.screenshot({ path: path.join(OUT, `${name}-top.png`) })
  await page.click('[data-testid="month-JAN"]').catch(e => errs.push(`${name}: JAN ${e.message.slice(0, 80)}`))
  await page.waitForTimeout(700)
  await page.screenshot({ path: path.join(OUT, `${name}-jan.png`) })
  await page.click('[data-testid="legend-open"]').catch(e => errs.push(`${name}: legend ${e.message.slice(0, 80)}`))
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(OUT, `${name}-legend.png`) })
  await ctx.close()
}
for (const who of ['admin', 'member']) for (const phone of [false, true]) await run(who, phone)
await browser.close()
console.log(errs.length ? errs.join('\n') : 'no console or page errors')
console.log('pictures in', OUT)
