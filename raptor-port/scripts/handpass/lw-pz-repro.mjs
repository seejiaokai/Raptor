// [LW-PHONE-PINCH-ZOOM] his iPhone report, 23 Oct 26 ("Some untidiness"): after a pinch out, scrolled back to September with
// Manning open, the frozen names and the corner stood right of the grid's left edge, the corner covered JAN–MAR, and with
// the page scrolled down a box the names' width sat behind JAN–MAR while the names and dates were gone. This drives his
// steps with real two-finger touches and measures the frozen copies' LEFT edges and the corner against the month buttons.
//   URL=http://localhost:4274/?fresh=1 OUT=… node scripts/handpass/lw-pz-repro.mjs
import { chromium, webkit, devices } from '@playwright/test'
const ENGINE = process.env.ENGINE || 'chromium'
import { existsSync, mkdirSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launch = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const URL = process.env.URL || 'http://localhost:4274/?fresh=1'
const OUT = (process.env.OUT || 'docs/img/handpass/2026-10-23-lw-pinch/repro') + '-' + (process.env.ENGINE || 'chromium')
mkdirSync(OUT, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = ENGINE === 'webkit' ? await webkit.launch() : await chromium.launch(launch)
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, screen: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push(String(e).slice(0, 200)))
await page.goto(URL)
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.tap('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]'); await sleep(900)
await page.addStyleTag({ content: '#toastEl{visibility:hidden!important}' })
/* Chromium: real touches over CDP. WebKit has no CDP, so the same touches are made inside the page — TouchEvents on the
   element under each finger, as Safari targets them (a touch's later events go to the element it first landed on). */
const cdp = ENGINE === 'webkit' ? null : await ctx.newCDPSession(page)
const touch = (type, pts) => cdp
  ? cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
  : page.evaluate(([type, pts]) => {
      /* WebKit's test build makes no Touch objects; the app's touch listeners read only touches[i].clientX / clientY,
         identifier, length, cancelable and preventDefault — a plain Event carrying those is the same to them */
      const w = window
      w.__tt = w.__tt || {}
      const ev = { touchStart: 'touchstart', touchMove: 'touchmove', touchEnd: 'touchend' }[type]
      if (type === 'touchStart') pts.forEach(([x, y], i) => { if (!w.__tt[i + 1]) w.__tt[i + 1] = document.elementFromPoint(x, y) || document.body })
      const mk = (id, x, y) => ({ identifier: id, target: w.__tt[id], clientX: x, clientY: y, pageX: x + scrollX, pageY: y + scrollY, screenX: x, screenY: y })
      const fire = (tgt, touches, changed) => {
        const e = new Event(ev, { bubbles: true, cancelable: true })
        const list = a => Object.assign([...a], { item: i => a[i] })
        Object.defineProperty(e, 'touches', { value: list(touches) })
        Object.defineProperty(e, 'targetTouches', { value: list(touches) })
        Object.defineProperty(e, 'changedTouches', { value: list(changed) })
        tgt.dispatchEvent(e)
      }
      if (type === 'touchEnd') { fire(w.__tt[1], [], Object.keys(w.__tt).map(Number).map(id => mk(id, 0, 0))); w.__tt = {}; return }
      const now = pts.map(([x, y], i) => mk(i + 1, x, y))
      fire(w.__tt[now.length] || w.__tt[1], now, type === 'touchStart' ? [now[now.length - 1]] : now)
    }, [type, pts])
async function pinch(cx, cy, d0, d1, mid = null, steps = 10) {
  const at = i => { const d = d0 + (d1 - d0) * i / steps; return [[cx - d / 2, cy], [cx + d / 2, cy]] }
  await touch('touchStart', [at(0)[0]]); await sleep(30); await touch('touchStart', at(0)); await sleep(30)
  for (let i = 1; i <= steps; i++) { await touch('touchMove', at(i)); await sleep(16) }
  if (mid) { await sleep(120); await shot(mid) }
  await touch('touchEnd', []); await sleep(800)
}
async function swipe(x0, y0, x1, y1, steps = 8) {
  await touch('touchStart', [[x0, y0]]); await sleep(20)
  for (let i = 1; i <= steps; i++) { await touch('touchMove', [[x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps]]); await sleep(16) }
  await touch('touchEnd', []); await sleep(900)
}
const read = () => page.evaluate(() => {
  const q = s => document.querySelector(s), R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }
  const wrap = q('#page-leavewar .mx-wrap'), tbl = wrap.querySelector(':scope > table.mx')
  const band = q('#page-leavewar [data-testid="frozen-cols"]')
  const mirror = q('#page-leavewar [data-testid="sticky-head"]')
  return {
    z: tbl.style.zoom, sl: Math.round(wrap.scrollLeft), sy: Math.round(scrollY),
    wrap: R(wrap), strip: R(q('#page-leavewar [data-testid="month-strip"]')),
    corner: R(q('#page-leavewar .mx-wrap .mxhead th.who')),
    bandBox: R(band), bandVis: band ? getComputedStyle(band).visibility : null, bandTf: band?.style.transform || '',
    bandWho: R(band?.querySelector('td.who')),
    realWho: R([...wrap.querySelectorAll('.mxbody td.who')].find(td => { const r = td.getBoundingClientRect(); return r.top > 300 && r.top < 800 })),
    mirror: mirror ? { box: R(mirror), frozen: R(mirror.querySelector('.mxfixed-frozen')), frozenTf: mirror.querySelector('.mxfixed-frozen')?.style.transform || '', scrollTf: mirror.querySelector('.mxfixed-scroll')?.style.transform || '', cls: mirror.className } : null,
    banded: q('#page-leavewar .mx-outer').className,
  }
})
const shot = async n => { await page.screenshot({ path: `${OUT}/${n}.png` }); console.log(n, JSON.stringify(await read())) }
await shot('r0-open')
await page.tap('[data-testid="counts-toggle"]'); await sleep(600)
await shot('r1-manning-open')
const sep = page.locator('#page-leavewar [data-testid="month-strip"] .mjump', { hasText: 'SEP' })
await sep.tap(); await sleep(1200)
await shot('r2-sep')
await pinch(230, 620, 220, 120, 'r3m-mid-pinch-out')
await shot('r3-pinched-out')
await pinch(230, 620, 220, 130)
await pinch(230, 420, 130, 220, 'r4m-mid-pinch-in')
await pinch(230, 420, 130, 220, 'r4m-mid-pinch-in')
await shot('r4-pinched-out-more')
await swipe(250, 700, 250, 300)
await shot('r5-scrolled-down')
await pinch(230, 500, 220, 120, 'r5m-mid-pinch-out-scrolled')
await shot('r6-after-scrolled')
/* part-way down the page and with the dates frozen (D1288): a pinch out opens no band */
await page.evaluate(() => window.scrollTo(0, 110)); await sleep(400)
await pinch(230, 520, 220, 120, 'r10m-partway-mid-pinch-out')
await page.evaluate(() => window.scrollTo(0, 260)); await sleep(400)
await pinch(230, 620, 220, 120, 'r11m-frozen-mid-pinch-out')
/* the OIL tab, the same rule (D1287): mid-pinch in, then out */
await page.evaluate(() => window.scrollTo(0, 0)); await sleep(300)
await page.locator('[data-testid="oil-tracker"]').tap(); await sleep(900)
await pinch(240, 560, 100, 180, 'r7m-oil-mid-pinch-in')
await pinch(240, 560, 200, 120, 'r8m-oil-mid-pinch-out')
await shot('r9-oil-after')
console.log('errors', JSON.stringify(errs))
await b.close()
