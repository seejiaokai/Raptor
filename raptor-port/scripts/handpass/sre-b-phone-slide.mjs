// Read-only probe: on a phone, does the arriving schedule page slide from Monday to the front day, or open on it?
import { chromium } from '@playwright/test'
import fs from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:4391/'
const OUT = 'docs/img/handpass/2026-11-22-sched-right-edge/b'
fs.mkdirSync(OUT, { recursive: true })
const errors = []

async function finger(page, cdp, pts, stepMs = 16, rest = 60) {
  const [x0, y0] = pts[0]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] })
  for (const [x, y] of pts.slice(1)) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id: 1 }] }); await page.waitForTimeout(stepMs) }
  if (rest) await page.waitForTimeout(rest)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
const line = (x0, dx, n = 10, y = 430) => Array.from({ length: n + 1 }, (_, i) => [x0 + dx * i / n, y])

async function still(page, sel) {
  await page.evaluate(async s => {
    const el = document.querySelector(s); if (!el) return
    let last = el.scrollLeft, since = performance.now(); const t0 = performance.now()
    while (performance.now() - t0 < 5000) {
      await new Promise(r => requestAnimationFrame(r))
      if (el.scrollLeft !== last) { last = el.scrollLeft; since = performance.now() }
      else if (performance.now() - since >= 300) return
    }
  }, sel)
}
const front = (page, sel) => page.evaluate(s => {
  const w = document.querySelector(s); if (!w) return null
  const L = w.getBoundingClientRect().left
  for (const d of w.querySelectorAll('.day[data-day]')) { if (Math.abs(d.getBoundingClientRect().left - L) <= 2) return +d.dataset.day }
  return null
}, sel)

async function sampleSwitch(page, sel, target, shot) {
  await page.evaluate(s => {
    const out = []; window.__samp = out; let n = 0
    const tick = () => {
      const el = document.querySelector(s)
      if (el && el.getBoundingClientRect().width > 0) out.push(Math.round(el.scrollLeft))
      if (++n < 90) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, sel)
  await page.evaluate(t => window.go(t), target)
  await page.waitForTimeout(60)
  await page.screenshot({ path: shot })
  await page.waitForFunction(t => window.CURPAGE === t, target)
  await page.waitForTimeout(1600) // sampler finishes (90 frames)
  await still(page, sel)
  const s = await page.evaluate(() => window.__samp)
  const rest = await page.evaluate(q => Math.round(document.querySelector(q).scrollLeft), sel)
  return { rest, first: s[0] ?? null, min: s.length ? Math.min(...s) : null, n: s.length, front: await front(page, sel), head: s.slice(0, 8).join(',') }
}

const browser = await chromium.launch()
try {
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true })
    const page = await context.newPage()
    page.on('pageerror', e => errors.push(`run${run} pageerror: ${e.message}`))
    page.on('console', m => { if (m.type() === 'error') errors.push(`run${run} console: ${m.text()}`) })
    await page.goto(BASE + '?fresh=1')
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day')
    await page.evaluate(() => window.go('editsched'))
    await page.waitForFunction(() => window.CURPAGE === 'editsched')
    await page.waitForSelector('#eWeek .day[data-day="6"]', { state: 'attached' })
    await still(page, '#eWeek')
    const cdp = await context.newCDPSession(page)
    let f = await front(page, '#eWeek'), tries = 0
    while (f !== 2 && tries < 3) {
      const need = f == null ? 2 : 2 - f
      for (let i = 0; i < Math.abs(need); i++) {
        await finger(page, cdp, line(need > 0 ? 320 : 80, need > 0 ? -220 : 220))
        await page.waitForTimeout(200)
        await still(page, '#eWeek')
      }
      f = await front(page, '#eWeek'); tries++
      console.log(`run${run} try${tries} front=${f} sl=${await page.evaluate(() => Math.round(document.getElementById('eWeek').scrollLeft))} days=${await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day]')].map(d => d.dataset.day + '@' + Math.round(d.getBoundingClientRect().left)).join(' '))}`)
    }
    if (f !== 2) { console.log(`run${run}: could not reach Wednesday, front=${f}`); await context.close(); continue }
    const es = await page.evaluate(() => Math.round(document.getElementById('eWeek').scrollLeft))
    const toView = await sampleSwitch(page, '#vWeek', 'viewsched', `${OUT}/run${run}-to-view.png`)
    const toEdit = await sampleSwitch(page, '#eWeek', 'editsched', `${OUT}/run${run}-to-edit.png`)
    console.log(`run${run} edit-before sl=${es} swipeTries=${tries}`)
    console.log(`run${run} ->view`, JSON.stringify(toView))
    console.log(`run${run} ->edit`, JSON.stringify(toEdit))
    await context.close()
  }
} finally {
  await browser.close()
}
console.log('errors:', errors.length ? errors.join(' | ') : 'none')
