// His picture of 28 Oct 26 (09:14): after Approvals, OIL and Settings the grid came back with every day still striped
// ("not drawn yet") until he scrolled. The case: the grid moved to another month while the Approvals page hid it — a
// change of period from Approvals lands the grid on the new period's first open day — and on a phone nothing woke the
// month-drawing when the grid showed again. WebKit at 402 x 874: scroll the grid to October, open Approvals, change the
// period there, come back to the grid, and count the striped cells in view against the drawn ones, without touching it.
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-appr-stripes.mjs [out]
import { webkit, chromium, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve(process.argv[2] || 'docs/img/handpass/2026-10-28-lw-appr-oil/before')
mkdirSync(OUT, { recursive: true })
const b = await (process.env.ENGINE === 'chromium' ? chromium : webkit).launch()
let problems = 0
const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 })
const P = await ctx.newPage()
P.on('pageerror', e => { problems++; console.log('page error: ' + String(e).slice(0, 160)) })
await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
await P.waitForSelector('#vWeek .day', { state: 'attached' })
await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="lw-tab-approvals"]')
await P.waitForTimeout(1500)
const look = () => P.evaluate(() => {
  const inView = (sel) => [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 140 && r.left < innerWidth }).length
  const w = document.querySelector('#page-leavewar .mx-wrap')
  const ds = [...document.querySelectorAll('#page-leavewar .mx td[data-testid^="cell-"]')].map(e => e.dataset.testid.slice(-10)).sort()
  const vis = [...document.querySelectorAll('#page-leavewar .mx td[data-testid^="cell-"]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > 140 && r.left < innerWidth }).map(e => e.dataset.testid.slice(-10)).sort()
  return { stripes: inView('#page-leavewar .mx tbody td.lwph'), days: inView('#page-leavewar .mx td[data-testid^="cell-"]'), scrollLeft: Math.round(w?.scrollLeft ?? -1), drawn: ds[0] + '..' + ds[ds.length - 1], seen: vis[0] + '..' + vis[vis.length - 1] }
})
/* his path (the morning's video and picture): Approvals in the next period, a request's dates to the grid (it lands on
   13 Apr 27 and rings it), Back to Approvals, the View picker to JAN – DEC 26 and back to JAN – DEC 27, then OIL and
   Settings, and the Grid tab */
await P.click('[data-testid="lw-tab-approvals"]'); await P.waitForSelector('[data-testid="approvals-page"]:not([hidden])'); await P.waitForTimeout(600)
await P.click('[data-testid="appr-elsewhere"]'); await P.waitForTimeout(800)
await P.locator('[data-testid="appr-dates"]').first().click(); await P.waitForSelector('[data-testid="appr-slim"]'); await P.waitForTimeout(1500)
console.log('on the ringed day', JSON.stringify(await look()))
/* …and on to October by its month button, so the month on screen is far from where a new period lands */
await P.locator('#page-leavewar button', { hasText: /^OCT$/ }).first().click(); await P.waitForTimeout(1500)
console.log('on Oct', JSON.stringify(await look()))
await P.click('[data-testid="appr-slim"] .appr-back'); await P.waitForSelector('[data-testid="approvals-page"]:not([hidden])'); await P.waitForTimeout(600)
const ids = await P.$$eval('[data-testid="war-picker"] option', os => os.map(o => o.value))
await P.selectOption('[data-testid="war-picker"]', ids[0]); await P.waitForTimeout(800)
console.log('after 26 (hidden)', JSON.stringify(await look()))
await P.selectOption('[data-testid="war-picker"]', ids[1]); await P.waitForTimeout(800)
await P.click('[data-testid="oil-tracker"]'); await P.waitForTimeout(800)
await P.click('[data-testid="oil-close"]'); await P.waitForTimeout(300)
await P.click('[data-testid="lw-tab-grid"]')
const out = []
for (const wait of [100, 600, 1500, 3000]) { await P.waitForTimeout(wait); out.push({ wait, ...(await look()) }) }
await P.screenshot({ path: path.join(OUT, 'stripes-back-on-grid.png') })
console.log('back on the grid', JSON.stringify(out))
await b.close()
console.log(problems ? `${problems} page errors` : 'no page errors')
