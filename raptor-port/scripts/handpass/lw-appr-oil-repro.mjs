// His video of 28 Oct 26 (09:03): from Approvals, the OIL tab flashes the grid for a frame before the OIL tracker opens, and
// he saw the rows drawn as the faint "not drawn yet" stripes until he touched the screen. Pictured in WebKit at his iPhone's
// 402 x 874: each switch away from Approvals, a picture on the very next frame and later ones, with how many of the grid's
// months stand drawn and how many as stripes. Run from raptor-port/ against the build served on PORT (default 4173):
// node scripts/handpass/lw-appr-oil-repro.mjs [out folder]
import { webkit, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve(process.argv[2] || 'docs/img/handpass/2026-10-28-lw-appr-oil/before')
mkdirSync(OUT, { recursive: true })
const b = await webkit.launch()
let problems = 0
const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 })
const P = await ctx.newPage()
P.on('pageerror', e => { problems++; console.log('page error: ' + String(e).slice(0, 160)) })
await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
await P.waitForSelector('#vWeek .day', { state: 'attached' })
await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="lw-tab-approvals"]')
await P.waitForTimeout(1500)
/* what stands on screen: is the grid visible, is the OIL tracker up, and how many stripe cells vs drawn day cells are in view */
const look = () => P.evaluate(() => {
  const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight }
  const host = document.querySelector('#page-leavewar .lw-gridhost')
  const inView = (sel) => [...document.querySelectorAll(sel)].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth }).length
  return { grid: !!host && !host.hidden && vis(host), oil: vis(document.querySelector('[data-testid="oil-sheet"], .oilsheet, [data-testid="oil-window"]')),
    stripes: inView('#page-leavewar .mx td.lwph'), days: inView('#page-leavewar .mx td[data-testid^="cell-"]') }
})
async function frames(tag, act) {
  /* a picture each animation frame for the first few, then later */
  await P.evaluate(() => { window.__f = []; })
  await act()
  const out = []
  for (const [i, wait] of [[0, 0], [1, 16], [2, 16], [3, 60], [4, 300], [5, 1200]]) {
    if (wait) await P.waitForTimeout(wait)
    out.push({ i, ...(await look()) })
    await P.screenshot({ path: path.join(OUT, `${tag}-${i}.png`) })
  }
  console.log(tag, JSON.stringify(out))
}
async function toApprovals() { await P.click('[data-testid="lw-tab-approvals"]'); await P.waitForSelector('[data-testid="approvals-page"]:not([hidden])'); await P.waitForTimeout(800) }
await toApprovals()
await frames('appr-to-oil', () => P.click('[data-testid="oil-tracker"]'))
/* the tracker covers the tab row on a phone: its ✕ takes him back to the grid */
await frames('oil-close', () => P.click('[data-testid="oil-close"]'))
/* his path: Approvals, then OIL, then ⚙ Settings, then back to the grid */
await toApprovals()
await P.click('[data-testid="oil-tracker"]'); await P.waitForTimeout(600)
await P.click('[data-testid="oil-close"]'); await P.waitForTimeout(300)
await P.click('[data-testid="settings-open"]'); await P.waitForTimeout(600)
await frames('settings-close', () => P.keyboard.press('Escape'))
await toApprovals()
await frames('appr-to-grid', () => P.click('[data-testid="lw-tab-grid"]'))
/* his picture's case: the period changed from Approvals ("+2 in JAN – DEC 27 ›") while the grid stood hidden */
await toApprovals()
await P.click('[data-testid="appr-elsewhere"]'); await P.waitForTimeout(800)
await frames('other-period-to-oil', () => P.click('[data-testid="oil-tracker"]'))
await frames('other-period-oil-close', () => P.click('[data-testid="oil-close"]'))
await toApprovals()
await P.click('[data-testid="appr-elsewhere"]').catch(() => {}); await P.waitForTimeout(800)
await frames('other-period-to-grid', () => P.click('[data-testid="lw-tab-grid"]'))
await b.close()
console.log(problems ? `${problems} page errors` : 'no page errors')
