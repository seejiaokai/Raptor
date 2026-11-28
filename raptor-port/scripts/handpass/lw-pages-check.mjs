// Chat 208 — a build made for GitHub Pages (Vite base /Raptor/, his D2832, 27 Nov 26) checked served under /Raptor/ before it
// is pushed: the page loads, every file it asks for is found (no 404), he can sign in, the Leave War and its Balances page
// open, and no page or console error. Run: node lw-pages-check.mjs <base url, e.g. http://localhost:4758/Raptor/>
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || ''
const url = process.argv[2]
const b = await chromium.launch(CHROMIUM && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const out = []
for (const size of ['desk', 'phone']) {
  const ctx = await b.newContext(size === 'phone' ? { viewport: { width: 402, height: 874 }, hasTouch: true } : { viewport: { width: 1536, height: 860 } })
  const p = await ctx.newPage()
  const bad = []
  p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
  p.on('pageerror', e => bad.push('pageerror ' + String(e).slice(0, 160)))
  p.on('console', m => { if (m.type() === 'error') bad.push('console ' + m.text().slice(0, 160)) })
  await p.goto(url); await p.waitForSelector('#luser', { timeout: 20000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.evaluate(() => window.go('leavewar'))
  await p.waitForSelector('[data-testid="lw-tab-balances"]', { state: 'visible', timeout: 20000 })
  await p.click('[data-testid="lw-tab-balances"]'); await p.waitForSelector('[data-testid="balances-page"]', { state: 'visible', timeout: 20000 })
  const outlines = await p.locator('.bp-nto').count()
  out.push({ size, outlines, bad })
  await ctx.close()
}
await b.close()
console.log(JSON.stringify(out))
console.log(out.every(o => o.bad.length === 0 && o.outlines > 0) ? 'PAGES CHECK PASS' : 'PAGES CHECK FAIL')
