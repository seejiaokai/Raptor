// [LW-PHONE-PINCH-ZOOM] a probe (23 Oct 26): a finger's tap on a month button, before and after a pinch — does the grid
// jump to the month? Read only.
import { chromium, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, screen: { width: 402, height: 874 }, hasTouch: true, isMobile: true, userAgent: devices['iPhone 13'].userAgent })
const page = await ctx.newPage()
const sleep = ms => new Promise(r => setTimeout(r, ms))
await page.goto(process.env.URL || 'http://localhost:4273/?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.tap('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day'); await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('#page-leavewar .mx-wrap [data-testid^="head-"]'); await sleep(900)
const cdp = await ctx.newCDPSession(page)
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
await page.evaluate(() => { window.__clicks = []; document.addEventListener('click', e => window.__clicks.push((e.target.closest('[data-testid]')?.dataset.testid) || e.target.tagName), true) })
const where = () => page.evaluate(() => {
  const on = document.querySelector('#page-leavewar .mjump.on')?.textContent
  const first = document.querySelector('#page-leavewar .mx-wrap [data-testid^="head-"]')?.dataset.testid
  const m = document.querySelector('#page-leavewar [data-testid="head-2026-03-01"]'), bal = document.querySelector('#page-leavewar .mx-wrap .mxhead th.bal')
  const at220 = [...document.querySelectorAll('#page-leavewar .mx-wrap [data-testid^="head-"]')].find(c => { const q = c.getBoundingClientRect(); return 220 >= q.left && 220 < q.right })?.dataset.testid
  return { at220, on, first, gap: m && bal ? Math.round(m.getBoundingClientRect().left - bal.getBoundingClientRect().right) : null, clicks: window.__clicks.slice(-3), sl: Math.round(document.querySelector('#page-leavewar .mx-wrap').scrollLeft) }
})
const tapMonth = async label => {
  const bb = await page.locator(`#page-leavewar [data-testid="month-${label}"]`).boundingBox()
  await touch('touchStart', [[bb.x + bb.width / 2, bb.y + bb.height / 2]]); await sleep(40)
  await touch('touchEnd', []); await sleep(900)
}
await tapMonth('MAR'); console.log('no pinch, tap MAR:', JSON.stringify(await where()))
await tapMonth('OCT'); console.log('tap OCT:', JSON.stringify(await where()))
const at = (cx, cy, d) => [[cx - d / 2, cy], [cx + d / 2, cy]]
await touch('touchStart', [at(220, 600, 100)[0]]); await sleep(30)
await touch('touchStart', at(220, 600, 100)); await sleep(30)
for (let i = 1; i <= 10; i++) { await touch('touchMove', at(220, 600, 100 + 8 * i)); await sleep(16) }
await touch('touchEnd', []); await sleep(800)
console.log('after a pinch in:', JSON.stringify(await where()))
console.log('geo:', JSON.stringify(await page.evaluate(() => { const g = window.__lwGeo?.(); if (!g) return null; const wrap = document.querySelector('#page-leavewar .mx-wrap'); return { sl: wrap.scrollLeft, frozen: g.geo?.frozen, client: g.geo?.client, win: g.win, z: g.zoom, spans: g.geo?.spans.map(s => s.label + ':' + Math.round(s.left) + '-' + Math.round(s.right)), oct1: (() => { const c = document.querySelector('[data-testid="head-2026-10-01"]'); return c ? Math.round(c.getBoundingClientRect().left - wrap.getBoundingClientRect().left + wrap.scrollLeft) : null })() } })))
await sleep(1500); console.log('1.5 s later:', JSON.stringify(await where()))
await page.evaluate(() => { document.querySelector('#page-leavewar .mx-wrap').scrollLeft += 2 }); await sleep(600); console.log('after a 2 px scroll:', JSON.stringify(await where()))
await page.evaluate(() => window.scrollTo(0, 0)); await sleep(400)
await tapMonth('MAR'); console.log('tap MAR:', JSON.stringify(await where()))
await b.close()
