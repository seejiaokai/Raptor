// His question of 28 Oct 26 (08:55, a picture from his iPhone): is the blue ring on a day brought into view from Approvals
// enough, or should it be cyan? Drawn on the real app in WebKit at his iPhone's 402 x 874, three times over: the same day
// ringed in the app's one blue as built, in the Leave War's cyan, and in a lighter blue — on two men's rows (his own row is
// in his picture). Nothing in the app changes; the colour is put on by a style laid over the page.
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-ring-colour-mock.mjs
import { webkit, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-28-lw-ring-colour')
mkdirSync(OUT, { recursive: true })
const LOOKS = { now: '#1E86FF', cyan: '#3BC6E8', light: '#5CB0FF' }
const b = await webkit.launch()
let problems = 0
const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 })
const P = await ctx.newPage()
P.on('pageerror', e => { problems++; console.log('page error: ' + String(e).slice(0, 160)) })
await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
await P.waitForSelector('#vWeek .day', { state: 'attached' })
async function approvals() {
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="lw-tab-approvals"]')
  await P.click('[data-testid="lw-tab-approvals"]'); await P.waitForSelector('[data-testid="approvals-page"]:not([hidden])')
  await P.waitForTimeout(500)
}
await P.addStyleTag({ content: '#page-leavewar td.lw-ring{animation:none!important;box-shadow:inset 0 0 0 2px var(--ringc,#1E86FF)!important}' })
async function scene(name, index) {
  await approvals()
  const dates = P.locator('[data-testid="appr-dates"]')
  await dates.nth(index).click()
  await P.waitForSelector('[data-testid="appr-slim"]'); await P.waitForSelector('td.lw-ring'); await P.waitForTimeout(600)
  const id = await P.evaluate(() => document.querySelector('td.lw-ring').dataset.testid)
  console.log(name, 'ringed', id)
  for (const [look, c] of Object.entries(LOOKS)) {
    await P.evaluate(([tid, col]) => {
      document.documentElement.style.setProperty('--ringc', col)
      document.querySelector(`[data-testid="${tid}"]`).classList.add('lw-ring')
    }, [id, c])
    await P.waitForTimeout(150)
    const r = await P.evaluate((tid) => { const q = document.querySelector(`[data-testid="${tid}"]`).getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height } }, id)
    const head = await P.evaluate(() => { const h = document.querySelector('#page-leavewar .mxhead th.day.focus') || document.querySelector('#page-leavewar thead'); const q = h.getBoundingClientRect(); return { y: q.y } })
    const top = Math.max(0, Math.min(head.y - 6, r.y - 150))
    await P.screenshot({ path: path.join(OUT, `${name}-${look}.png`), clip: { x: 0, y: top, width: 402, height: Math.min(874 - top, r.y + r.h + 110 - top) } })
  }
  /* the slim bar's Back returns to Approvals for the next scene */
  await P.click('[data-testid="appr-slim"] .appr-back')
  await P.waitForTimeout(400)
}
/* the demo world's first two requests (his own row is in his picture from the live preview) */
await scene('a', 0)
await scene('b', 1)
await b.close()
console.log(problems ? `${problems} page errors` : 'no page errors')
