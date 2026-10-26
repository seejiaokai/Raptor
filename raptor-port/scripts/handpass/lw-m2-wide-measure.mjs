// M2's three Linux letter-width faults (23 Oct 26): measures the Leave War's top row at 701 wide and the grid's bar at a
// phone's 390, with Verdana forced (as wide as Linux's DejaVu Sans — GitHub's machines and his iPhone draw wider letters
// than his PC). Prints each control's box; takes a picture of each.
// Usage: node scripts/handpass/lw-m2-wide-measure.mjs <port> [tag]   (a built bundle served by `vite preview` on <port>)
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
const port = process.argv[2] || '4180'
const tag = process.argv[3] || 'wide'
const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-23-lw-m2-looks', tag)
mkdirSync(OUT, { recursive: true })
const WIDE = '*, *::before, *::after { font-family: Verdana, "DejaVu Sans", sans-serif !important }'
const browser = await chromium.launch(launchOptions)
async function open(phone, width, who = 'admin') {
  const ctx = await browser.newContext(phone
    ? { viewport: { width, height: 664 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: { width, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  // forced from the first paint, as the browser tests' LW_WIDE_LETTERS does: the grid measures some words as it loads
  if (process.env.NARROW !== '1') await page.addInitScript(css => {
    const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s) }
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add)
  }, WIDE)
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(`http://localhost:${port}/?fresh=1`)
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]')
  // the browser test views the war as Slipway (lwView): his My leave carries a "next" line, the row's widest case
  if (process.env.VIEWER) await page.evaluate(i => { window.raptorMe(i); window.lwSetViewer(i) }, process.env.VIEWER)
  await page.waitForTimeout(500)
  return { ctx, page }
}
const boxes = (page, ids) => page.evaluate((ids) => Object.fromEntries(ids.map(id => {
  const el = document.querySelector(`#page-leavewar [data-testid="${id}"]`)
  if (!el) return [id, null]
  const r = el.getBoundingClientRect()
  return [id, `l ${r.left.toFixed(1)} r ${r.right.toFixed(1)} w ${r.width.toFixed(1)} top ${r.top.toFixed(1)} h ${r.height.toFixed(1)}`]
})), ids)
{
  // as the browser test does: open wide, then narrow the window to 768 and to 701 (RESIZE=1)
  const { ctx, page } = await open(false, process.env.RESIZE ? 1440 : 701)
  if (process.env.RESIZE) for (const w of [768, 701]) { await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(300) }
  console.log('701 desktop top row', await boxes(page, ['lw-tab-grid', 'oil-tracker', 'war-picker', 'my-leave', 'settings-open']))
  console.log('701 grid bar', await boxes(page, ['counts-toggle', 'open-chip', 'lw-zoom-out', 'lw-zoom-in', 'legend-open']))
  await page.screenshot({ path: path.join(OUT, 'top-701.png'), clip: { x: 0, y: 0, width: 701, height: 220 } })
  await ctx.close()
}
for (const w of [390, 360]) {
  const { ctx, page } = await open(true, w)
  console.log(`${w} phone grid bar`, await boxes(page, ['counts-toggle', 'open-chip', 'lw-zoom-out', 'lw-zoom-in', 'legend-open']))
  await page.screenshot({ path: path.join(OUT, `bar-${w}.png`), clip: { x: 0, y: 0, width: w, height: 260 } })
  await ctx.close()
}
await browser.close()
console.log('pictures in', OUT)
