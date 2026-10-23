// [LW-PHONE-PINCH-ZOOM] a probe (23 Oct 26): after a pinch on the Leave War grid, where does the day that was under the
// fingers go, frame by frame — and is it still the same element? Read only.
import { chromium, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL = process.env.URL || 'http://localhost:4271/?fresh=1'
const X = Number(process.env.X || 260), Y = Number(process.env.Y || 640), D0 = Number(process.env.D0 || 220), D1 = Number(process.env.D1 || 130)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await chromium.launch(launch)
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, screen: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage()
await page.goto(URL)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.tap('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]'); await sleep(900)
if (process.env.SCROLLY) { await page.evaluate(y => window.scrollTo(0, y), Number(process.env.SCROLLY)); await sleep(500) }
const cdp = await ctx.newCDPSession(page)
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
await page.evaluate(([x, y]) => {
  const el = document.elementFromPoint(x, y).closest('td,th'); el.setAttribute('data-probe', '1')
  window.__probe = { id: el.dataset.testid, el }
  const r = el.getBoundingClientRect(); window.__f = [(x - r.left) / r.width, (y - r.top) / r.height]
  window.__log = []
  const tick = () => {
    const w = document.querySelector('#page-leavewar .mx-wrap'), now = document.querySelector(`[data-testid="${window.__probe.id}"]`)
    if (now) { const q = now.getBoundingClientRect(); window.__log.push([Math.round(performance.now()), Math.round(q.left + window.__f[0] * q.width), Math.round(q.top + window.__f[1] * q.height), Math.round(w.scrollLeft), Math.round(scrollY), now === window.__probe.el ? "same" : "NEW", document.querySelector("#page-leavewar .mx-wrap > table.mx").style.zoom, Math.round(document.querySelector("#page-leavewar .mx-wrap .mxhead th.lwph-l")?.getBoundingClientRect().width ?? -1), document.querySelector("#page-leavewar .mx-wrap [data-testid^=head-]")?.dataset.testid, document.querySelectorAll("#page-leavewar .mx-wrap .mxhead [data-testid^=head-]").length, "tt", Math.round(document.querySelector("#page-leavewar .mx-wrap > table.mx").getBoundingClientRect().top), "st", Math.round(document.querySelector("#page-leavewar .mx-wrap td.mstick").getBoundingClientRect().height), "hd", Math.round(document.querySelector("#page-leavewar .mx-wrap .mxhead").getBoundingClientRect().top)]) }
    if (window.__log.length < 400) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}, [X, Y])
const at = i => { const d = D0 + (D1 - D0) * i / 10; return [[X - d / 2, Y], [X + d / 2, Y]] }
await touch('touchStart', [at(0)[0]]); await sleep(30)
await touch('touchStart', at(0)); await sleep(30)
for (let i = 1; i <= 10; i++) { await touch('touchMove', at(i)); await sleep(16) }
const tEnd = await page.evaluate(() => performance.now())
await touch('touchEnd', []); await sleep(1500)
const log = await page.evaluate(() => window.__log)
let last = ''
for (const r of log) { const k = r.slice(1).join(' '); if (k !== last) { console.log((r[0] - tEnd).toFixed(0).padStart(6), k); last = k } }
await b.close()
