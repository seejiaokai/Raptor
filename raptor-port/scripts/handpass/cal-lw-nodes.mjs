// MEASURES what the Leave War's four rows (Required P / W, Available P / W) cost the grid in DOM nodes — the figure
// docs/performance.md §E records for them (the Inputs / SANS calendar job, step 6). Not a gate: it prints numbers.
//
//   npm run build && npx vite preview --port 4180 --strictPort
//   node scripts/handpass/cal-lw-nodes.mjs
import { chromium, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const SIZES = { desk: { viewport: { width: 1440, height: 900 } }, phone: { ...devices['iPhone 13'] } }

const browser = await chromium.launch(launchOptions)
for (const [size, opts] of Object.entries(SIZES)) {
  for (const who of [['ad', 'a', 'admin'], ['us', 'us', 'member']]) {
    const ctx = await browser.newContext(opts); const page = await ctx.newPage()
    await page.goto(URL)
    await page.fill('#luser', who[0]); await page.fill('#lpass', who[1])
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day')
    await page.evaluate(() => window.go('leavewar'))
    await page.waitForSelector('[data-testid="row-slipway"]')
    await page.waitForTimeout(2500) // the runway of months pre-grows while the user is idle
    const m = await page.evaluate(() => {
      const all = document.querySelectorAll('.mx *').length
      const rows = new Set()
      for (const p of ['req-p-', 'req-w-', 'avail-p-', 'avail-w-']) {
        const c = document.querySelector(`[data-testid^="${p}"]`); if (c) rows.add(c.closest('tr'))
      }
      let four = 0, cells = 0
      for (const r of rows) { four += r.querySelectorAll('*').length + 1; cells += r.querySelectorAll('[data-testid]').length }
      const months = new Set([...document.querySelectorAll('[data-testid^="req-p-"]')].map(c => c.getAttribute('data-testid').slice(6, 13)))
      return { all, rows: rows.size, four, cells, months: months.size }
    })
    console.log(`${size} ${who[2]}: .mx * = ${m.all}; the four rows = ${m.four} nodes in ${m.rows} rows (${m.cells} day cells over ${m.months} drawn months) = ${(m.four / m.all * 100).toFixed(1)}%`)
    await ctx.close()
  }
}
await browser.close()
