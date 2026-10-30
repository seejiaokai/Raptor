// The code read's finding 1 (31 Oct 26, D1529): on his Windows browser the page's up-and-down scroll bar takes the last
// ~15px at the window's edge — the walk's headless browser hid it (--hide-scrollbars). With the scroll bars SHOWN, a man
// carried to the very edge (innerWidth − 1, over the scroll bar): either way the week steps a day — with the crew panel
// shown the strip there is the board's own margin past the panel, beside the › arrow, so the window's edge behaves the same. Usage: node scripts/handpass/week-drag-step-scrollbar.mjs [port] [out-folder]
import { chromium } from 'playwright'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const here = path.dirname(fileURLToPath(import.meta.url))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const PORT = process.argv[2] || '4173'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-31-week-drag-edge-pan', process.argv[3] || 'scrollbar')
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}), ignoreDefaultArgs: ['--hide-scrollbars'] })
const page = await (await browser.newContext({ viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 })).newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
await page.goto(`http://localhost:${PORT}/?fresh=1`)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1500)
const sl = () => page.evaluate(() => Math.round(document.getElementById('eWeek').scrollLeft))
const bar = await page.evaluate(() => innerWidth - document.documentElement.clientWidth)
const reset = () => page.evaluate(() => { const w = document.getElementById('eWeek'); w.dispatchEvent(new WheelEvent('wheel', { deltaX: 1, bubbles: true })); w.scrollTo({ left: 0, behavior: 'instant' }) })
const manAt = () => page.evaluate(() => { const b = [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-drag="1"]')].map(p => p.getBoundingClientRect()).find(r => r.width && r.top > 280 && r.bottom < innerHeight - 40 && r.left > 60); return b ? { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } : null })
const results = []
for (const hidden of [true, false]) {
  await reset(); await page.waitForTimeout(300)
  const tab = await page.$('.ros-rail')
  const isHidden = await page.evaluate(() => document.getElementById('eRoster').getBoundingClientRect().left >= innerWidth - 60)
  if (tab && isHidden !== hidden) { await tab.click(); await page.waitForTimeout(700) }
  const m = await manAt()
  await page.mouse.move(m.x, m.y); await page.mouse.down()
  await page.mouse.move(1535, 430, { steps: 14 })
  await page.waitForTimeout(1300)
  const s = await sl()
  await page.screenshot({ path: path.join(OUT, `edge-${hidden ? 'panel-hidden' : 'panel-shown'}.png`), clip: { x: 1100, y: 250, width: 436, height: 400 } })
  await page.mouse.move(m.x, m.y, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(400)
  results.push({ hidden, s })
  console.log(`crew panel ${hidden ? 'hidden' : 'shown'}: held at x 1535 over the page's scroll bar (${bar}px wide) → week moved to ${s}`)
}
const okHidden = results[0].s >= 560, okShown = results[1].s >= 560
console.log(`${okHidden ? 'PASS' : 'FAIL'}  S1 crew panel hidden, mouse on the scroll bar at the window's edge: the week steps a day`)
console.log(`${okShown ? 'PASS' : 'FAIL'}  S2 crew panel shown, mouse pushed past it onto the scroll bar at the window's edge: the week steps a day, as with the panel hidden`)
console.log(`page errors: ${errs.length ? errs.join(' | ') : 'none'}`)
await browser.close()
