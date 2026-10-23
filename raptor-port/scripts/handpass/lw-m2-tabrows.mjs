// His question (23 Oct 26, 12:13): are the Leave War's tab row (Grid · OIL · ⚙) and the Inputs page's (Inputs · SANS ·
// Medical) designed alike in height? Measures both on a phone at 390 (his iPhone's width) and takes a marked picture of each.
// Usage: node scripts/handpass/lw-m2-tabrows.mjs <port>
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-23-lw-m2-looks/tabrows')
mkdirSync(OUT, { recursive: true })
const port = process.argv[2] || '4180'
const browser = await chromium.launch(launchOptions)
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage()
await page.goto(`http://localhost:${port}/?fresh=1`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')
const measure = pageId => page.evaluate(id => {
  const pg = document.querySelector(`#page-${id}`)
  const tabs = pg.querySelector('.inputs-tabs')
  const tab = tabs.querySelector('.intab')
  const row = tabs.parentElement
  const bar = document.querySelector('.topbar:not(#page-leavewar .topbar)') || document.querySelector('header')
  const r = e => { const b = e.getBoundingClientRect(); return { top: +b.top.toFixed(1), h: +b.height.toFixed(1) } }
  const next = row.nextElementSibling
  return { row: r(row), tabs: r(tabs), tab: r(tab), rowPad: getComputedStyle(row).padding, next: next ? { cls: next.className.slice(0, 40), ...r(next) } : null }
}, pageId)
const out = {}
for (const id of ['inputs', 'leavewar']) {
  await page.evaluate(i => window.go(i), id)
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
  out[id] = await measure(id)
  await page.evaluate(i => { const t = document.querySelector(`#page-${i} .inputs-tabs`); t.style.outline = '3px solid #ff3d9a'; t.style.outlineOffset = '2px' }, id)
  await page.screenshot({ path: path.join(OUT, `${id}-tabs.png`), clip: { x: 0, y: 0, width: 390, height: 230 } })
  await page.evaluate(i => { const t = document.querySelector(`#page-${i} .inputs-tabs`); t.style.outline = '' }, id)
}
console.log(JSON.stringify(out, null, 1))
await browser.close()
