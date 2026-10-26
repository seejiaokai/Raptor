/* [TRK-STRAY-SCROLLBARS] (D1406, 27 Oct 26): the walk of the chart with its bars gone on a touch screen.
   Asserts the RIGHT behaviour, so a re-run is the re-walk. Phone (a finger the only pointer): the chart box draws no
   bars, a real finger drag still scrolls it, a two-finger pinch still zooms it, the Info half keeps its bar. Desktop
   (a mouse, his PC's 125%): both bars drawn and measured (the test browser's hidden bars switched back on), the wheel
   still scrolls the chart. Pictures after each press.
   Usage: HP_URL=http://localhost:4180 node scripts/handpass/trk-sb-walk.mjs <out folder> */
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'
import { login, toTracker, BASE } from './trk-lib.mjs'

const OUT = process.argv[2] || 'sb-walk'
mkdirSync(OUT, { recursive: true })
const rows = []
const check = (name, ok, said) => { rows.push({ name, ok, said }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  — ${said}`) }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const board = page => page.evaluate(() => {
  const b = document.getElementById('board'), cs = getComputedStyle(b)
  return { top: b.scrollTop, left: b.scrollLeft, sbw: cs.scrollbarWidth, barV: b.offsetWidth - b.clientWidth, barH: b.offsetHeight - b.clientHeight }
})
const zoomText = page => page.evaluate(() => {
  const z = [...document.querySelectorAll('#page-tracker *')].find(e => /^\d+%$/.test((e.textContent || '').trim()) && e.children.length === 0)
  return z ? z.textContent.trim() : null
})

async function launch(ctxOpts) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, ignoreDefaultArgs: ['--hide-scrollbars'] })
  const ctx = await browser.newContext(ctxOpts)
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(BASE + '/')
  await login(page, 'a')
  await toTracker(page)
  return { browser, page, errors }
}

/* ---- phone ---- */
{
  const { browser, page, errors } = await launch({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
  const cdp = await page.context().newCDPSession(page)
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: i })) })
  const r = await page.locator('#board').boundingBox()
  const cx = r.x + r.width / 2, cy = r.y + r.height / 2
  let b = await board(page)
  check('phone: the chart box hides its bars', b.sbw === 'none' && b.barV === 0 && b.barH === 0, `scrollbar-width ${b.sbw}, bar widths ${b.barV}/${b.barH}`)
  await page.screenshot({ path: resolve(OUT, 'p1-phone-at-rest.png') })
  // a finger drag up the chart, at a person's speed
  const t0 = b.top
  await touch('touchStart', [[cx, cy + 150]])
  for (let i = 1; i <= 10; i++) { await touch('touchMove', [[cx, cy + 150 - i * 30]]); await sleep(16) }
  await touch('touchEnd', [])
  await sleep(900)
  b = await board(page)
  check('phone: a finger drag still scrolls the chart', b.top > t0, `scrolled ${t0} → ${b.top}`)
  await page.screenshot({ path: resolve(OUT, 'p2-phone-after-drag.png') })
  // a two-finger pinch out; a picture mid-pinch, then after the lift
  const z0 = await zoomText(page)
  await touch('touchStart', [[cx - 40, cy], [cx + 40, cy]])
  for (let i = 1; i <= 8; i++) { await touch('touchMove', [[cx - 40 - i * 12, cy], [cx + 40 + i * 12, cy]]); await sleep(20) }
  await page.screenshot({ path: resolve(OUT, 'p3-phone-mid-pinch.png') })
  b = await board(page)
  check('phone: mid-pinch the chart box still draws no bars', b.sbw === 'none' && b.barV === 0 && b.barH === 0, `scrollbar-width ${b.sbw}`)
  await touch('touchEnd', [])
  await sleep(700)
  const z1 = await zoomText(page)
  check('phone: the pinch still zooms the chart', z0 !== z1, `zoom ${z0} → ${z1}`)
  await page.screenshot({ path: resolve(OUT, 'p4-phone-after-pinch.png') })
  // the Info half keeps its bar
  await page.locator('#viewtabs button[data-view="info"]').click(); await sleep(400)
  const side = await page.evaluate(() => getComputedStyle(document.getElementById('side')).scrollbarWidth)
  check('phone: the Info half keeps its normal bar', side === 'auto', `scrollbar-width ${side}`)
  await page.screenshot({ path: resolve(OUT, 'p5-phone-info.png') })
  check('phone: no page errors', !errors.length, errors.join(' | ') || 'none')
  await browser.close()
}

/* ---- desktop, his PC at 125% ---- */
{
  const { browser, page, errors } = await launch({ viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 })
  let b = await board(page)
  const side = await page.evaluate(() => { const s = document.getElementById('side'); return s.offsetWidth - s.clientWidth })
  check('desktop: the chart keeps its bar', b.sbw === 'auto' && b.barV > 0, `scrollbar-width ${b.sbw}, bar ${b.barV}px`)
  check('desktop: the Info panel keeps its bar', side > 0, `bar ${side}px`)
  const t0 = b.top
  const r = await page.locator('#board').boundingBox()
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2)
  await page.mouse.wheel(0, 400); await sleep(500)
  b = await board(page)
  check('desktop: the wheel still scrolls the chart', b.top > t0, `scrolled ${t0} → ${b.top}`)
  await page.screenshot({ path: resolve(OUT, 'd1-desktop-after-wheel.png') })
  check('desktop: no page errors', !errors.length, errors.join(' | ') || 'none')
  await browser.close()
}
const bad = rows.filter(r => !r.ok).length
console.log(`${rows.length - bad}/${rows.length} pass`)
process.exit(bad ? 1 : 0)
