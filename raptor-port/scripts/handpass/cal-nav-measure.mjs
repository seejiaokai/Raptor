/* A LOOK, not a gate (D705, 9 Oct 26 — "the month and arrows and today are on the left. Can u make inputs calander
   the same position?"): the month's arrows, its name and Today on the Inputs calendar and on the SANS calendar, through
   twelve months — each one's left edge and width, the widest name on each, and a picture of each tab's top rows.
   Run against a served build:  node scripts/handpass/cal-nav-measure.mjs [outDir] [width] */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const out = process.argv[2] || 'docs/img/handpass/2026-10-09-cal-nav', W = +(process.argv[3] || 390)
mkdirSync(out, { recursive: true })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: W, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
await page.goto('http://localhost:4180/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('inputs')); await page.waitForSelector('#inpCal')
const box = sel => page.evaluate(s => { const n = document.querySelector(s); if (!n) return null; const r = n.getBoundingClientRect(); return [+r.left.toFixed(1), +r.width.toFixed(1)] }, sel)
async function year(name, prev, mon, next, today, extra) {
  let widest = 0, text = 0, moved = new Set()
  for (let i = 0; i < 12; i++) {
    const m = await box(mon), n = await box(next), t = await box(today)
    const tw = await page.evaluate(s => { const e = document.querySelector(s); const r = document.createRange(); r.selectNodeContents(e); return +r.getBoundingClientRect().width.toFixed(1) }, mon)
    widest = Math.max(widest, m[1]); text = Math.max(text, tw); moved.add(n[0] + '/' + t[0])
    if (i === 0) console.log(name, 'prev', await box(prev), 'name', m, 'next', n, 'today', t, ...(await Promise.all(extra.map(async e => e + ' ' + JSON.stringify(await box(e))))))
    await page.locator(next).click()
  }
  console.log(name, '— widest name box', widest, '· widest name text', text, '· the next arrow / Today stood at', moved.size, 'different place(s) through the year')
}
await year('INPUTS', '#icPrev', '#inpCal .ic-mon', '#icNext', '#icToday', ['.inputs-views', '#inFiltersBtn', '#inGear'])
await page.screenshot({ path: `${out}/inputs-${W}.png`, clip: { x: 0, y: 0, width: W, height: 260 } })
await page.click('#inListBtn'); await page.waitForTimeout(250)
console.log('LIST  ', 'switch', await box('.inputs-views'), 'filter', await box('#inFiltersBtn'), 'gear', await box('#inGear'))
await page.screenshot({ path: `${out}/list-${W}.png`, clip: { x: 0, y: 0, width: W, height: 260 } })
await page.click('#inSansMode'); await page.waitForSelector('[data-testid="sanscal"]')
await year('SANS  ', '[data-testid="sc-prev"]', '[data-testid="sc-month"]', '[data-testid="sc-next"]', '[data-testid="sc-today"]', ['[data-testid="sc-hl"]', '[data-testid="sc-gear"]'])
await page.screenshot({ path: `${out}/sans-${W}.png`, clip: { x: 0, y: 0, width: W, height: 260 } })
console.log('page width', await page.evaluate(() => document.documentElement.scrollWidth))
await browser.close()
