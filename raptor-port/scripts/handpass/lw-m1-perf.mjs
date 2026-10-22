// MEASURES the Leave War grid before and after M1 (open dates replace the stages) — docs/performance.md §E asks for
// the change measured on the built bundle, before and after. Not a gate: it prints numbers.
//
// What it times, CPU slowed 4x (CDP), each run in a fresh browser context:
//   open  — from asking the app for the Leave War tab to the first person row being drawn;
//   nodes — every node inside the grid (`.mx *`) once the idle pre-growth has run;
//   tap   — from a press on an empty cell of the viewer's own row to the bid window being on screen
//           (an admin on Saber's row — id stiff, a member on Ranger's row — id bane), on a day the build lets that person bid.
//
//   (serve the build) then:  LOOK_URL=http://localhost:4251/ RUNS=5 TAPDATE=2026-01-06 node scripts/handpass/lw-m1-perf.mjs
import { chromium, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL = (process.env.LOOK_URL || 'http://localhost:4251/') + '?fresh=1'
const RUNS = Number(process.env.RUNS || 5)
const TAPDATE = process.env.TAPDATE || '2026-01-06'
const SIZES = { desk: { viewport: { width: 1440, height: 900 } }, phone: { ...devices['iPhone 13'] } }
const WHO = [['ad', 'a', 'admin', 'stiff'], ['us', 'us', 'member', 'bane']]

const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] }
const browser = await chromium.launch(launchOptions)
for (const [size, opts] of Object.entries(SIZES)) {
  for (const [u, p, role, me] of WHO) {
    const open = [], nodes = [], tap = []
    for (let r = 0; r < RUNS; r++) {
      const ctx = await browser.newContext(opts); const page = await ctx.newPage()
      await page.goto(URL)
      await page.fill('#luser', u); await page.fill('#lpass', p)
      await page.click('#loginForm button[type=submit]')
      await page.waitForSelector('#vWeek .day')
      const cdp = await ctx.newCDPSession(page)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
      const t0 = Date.now()
      await page.evaluate(() => window.go('leavewar'))
      await page.waitForSelector(`[data-testid="row-${me}"]`)
      open.push(Date.now() - t0)
      await page.waitForTimeout(3000)
      nodes.push(await page.evaluate(() => document.querySelectorAll('.mx *').length))
      const cell = page.locator(`[data-testid="cell-${me}-${TAPDATE}"]`)
      if (await cell.count()) {
        await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(400)
        const t1 = Date.now()
        await cell.click()
        const ok = await page.waitForSelector('[data-testid="bid-picker"]', { timeout: 8000 }).then(() => true, () => false)
        if (ok) tap.push(Date.now() - t1)
      }
      await ctx.close()
    }
    console.log(`${size} ${role}: open median ${med(open)} ms [${open.join(', ')}] · nodes median ${med(nodes)} [${nodes.join(', ')}] · tap median ${tap.length ? med(tap) + ' ms' : 'n/a'} [${tap.join(', ')}]`)
  }
}
await browser.close()
