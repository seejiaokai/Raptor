// The night of 27–28 Oct 26: his answers 17–19 built (D1440 the phone's slim bar, D1441 the phone buttons in the drawing's
// letters, D1442 the changes window's phone bar) and the headings kept apart at 360 — pictured in WebKit (an iPhone's engine)
// at his iPhone's 402 x 874, three times over, as his drawings r22-5-phone and r22-6-phone are (1206 x 2622), so each pairs
// with its drawing at the same scale (scripts/handpass/lw-m4-night-pairs.py). And 360 wide for the headings.
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-m4-night-after.mjs
import { webkit, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-27-lw-m4/night-after')
mkdirSync(OUT, { recursive: true })
const b = await webkit.launch()
let problems = 0
async function open(width, height) {
  const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width, height }, deviceScaleFactor: 3 })
  const P = await ctx.newPage()
  P.on('pageerror', e => { problems++; console.log('page error: ' + String(e).slice(0, 160)) })
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  return { ctx, P }
}
async function approvals(P) {
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="lw-tab-approvals"]')
  await P.click('[data-testid="lw-tab-approvals"]'); await P.waitForSelector('[data-testid="approvals-page"]:not([hidden])')
  await P.waitForTimeout(500)
}
/* (1) the list at 402: the buttons in the drawing's letters (D1441) */
{
  const { ctx, P } = await open(402, 874)
  await approvals(P)
  await P.screenshot({ path: path.join(OUT, 'n18-list-402.png') })
  /* (2) a request's dates → the grid with the slim bar (D1440) */
  await P.locator('[data-testid="appr-dates"]').first().click()
  await P.waitForSelector('[data-testid="appr-slim"]'); await P.waitForTimeout(700)
  const bar = await P.evaluate(() => { const s = getComputedStyle(document.querySelector('[data-testid="appr-slim"]')); return { edge: s.borderTopColor, text: document.querySelector('[data-testid="appr-slim"]').innerText.replace(/\s+/g, ' ') } })
  console.log('slim bar:', JSON.stringify(bar))
  await P.screenshot({ path: path.join(OUT, 'n17-slim-402.png') })
  await ctx.close()
}
/* (3) the headings at 360 (LOWEST AVAIL on two lines, clear of PLACED) and at 390 */
for (const [w, h] of [[360, 780], [390, 844]]) {
  const { ctx, P } = await open(w, h)
  await approvals(P)
  await P.screenshot({ path: path.join(OUT, `n-heads-${w}.png`) })
  await ctx.close()
}
/* (4) the changes window hidden to its bar, on Edit Schedule (D1442) */
{
  const { ctx, P } = await open(402, 874)
  await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(800)
  await P.click('#histBtn'); await P.waitForSelector('.chgwin:not([hidden])')
  await P.click('.chgwin .win-hide'); await P.waitForSelector('.chgwin.bar'); await P.waitForTimeout(300)
  await P.screenshot({ path: path.join(OUT, 'n19-chgbar-402.png') })
  await ctx.close()
}
await b.close()
console.log(problems ? `PROBLEMS: ${problems}` : 'pictured, no page errors')
process.exit(problems ? 1 : 0)
