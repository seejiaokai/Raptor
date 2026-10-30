// His D1527 (30 Oct 26 — "U didnt show me a mock up of how transparent it is. make it similar to the old one"): the week's
// ‹ arrow, open, drawn three ways at the same spot on the real app, close up as in his own picture: the old arrow at rest
// (before D1526 — its stylesheet put back by hand), the open arrow as first built (lit blue at 0.9), and the open arrow now
// (the built app as it is). The pointer is held just beside the arrow (not on it) for the last two. His PC's size, pictures at
// 2x so they stay sharp on his phone. Usage: node scripts/handpass/week-arrows-look.mjs [port]
import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-30-week-arrows/look')
mkdirSync(OUT, { recursive: true })
const PORT = process.argv[2] || '4173'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: 1536, height: 730 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await page.goto(`http://localhost:${PORT}/?fresh=1`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' })
await page.evaluate(() => window.go('viewsched')); await page.waitForTimeout(800)
await page.evaluate(() => document.getElementById('weekNext').click()); await page.waitForTimeout(900)
await page.evaluate(() => document.getElementById('weekNext').click()); await page.waitForTimeout(1200)
const OLD = '.week-nav{width:38px!important;font-size:26px!important;border-radius:12px!important;border:1px solid var(--edge)!important;opacity:.75!important;color:var(--ink-2)!important;transition:none!important} .week-nav.prev{left:8px!important}'
const LIT = '.week-nav.near{opacity:.9!important;border-color:var(--accent)!important;color:var(--accent)!important}'
const put = css => page.evaluate(c => { let s = document.getElementById('look'); if (!s) { s = document.createElement('style'); s.id = 'look'; document.head.appendChild(s) } s.textContent = c }, css)
const mid = await page.evaluate(() => Math.round(innerHeight * 0.52))
const clip = { x: 0, y: mid - 70, width: 170, height: 140 }
for (const [name, css, near] of [['1-old-at-rest', OLD, false], ['2-built-lit', LIT, true], ['3-now', '', true]]) {
  await put(css)
  await page.mouse.move(near ? 52 : 700, near ? mid : 120); await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(OUT, name + '.png'), clip })
  const o = await page.evaluate(() => { const b = document.getElementById('weekPrev'), cs = getComputedStyle(b); return [Math.round(b.getBoundingClientRect().width), cs.opacity, cs.color] })
  console.log(name, JSON.stringify(o))
}
await browser.close()
