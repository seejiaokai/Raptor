// Phone Leave War, his video of 23 Oct 26 (05:36): a long finger FLING across the year — December back to January and
// January on to December — and how long months stay striped (a placeholder in view) during and after it.
// M1's lw-m1-scroll-perf.mjs, with the long flings added and a real touch fling (momentum on).
// usage: node lw-m2-scroll.mjs <runs> <scenarioList> <who> <port1,port2,...>   (ports alternate per run)
//   scenarios: FLB (fling back Dec → Jan), FLF (fling on Jan → Dec), LB / LF (M1's 2.5-month swipes)
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const here = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(here, '..', '..', 'package.json'))
const { chromium } = require('@playwright/test')

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const RUNS = Number(process.argv[2] || 3)
const SCEN = (process.argv[3] || 'FLB,FLF').split(',')
const WHO = (process.argv[4] || 'admin')
const PORTS = (process.argv[5] || '4264').split(',')
const NAME = { 4264: 'before', 4265: 'after' }
const CRED = WHO === 'admin' ? ['ad', 'a'] : ['us', 'us']
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }

const INIT = () => {
  window.__lt = []
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]) }).observe({ type: 'longtask', buffered: true }) } catch {}
  // every frame: how many px of placeholder stripe are in the visible (non-frozen) part of the grid, and the scroll
  window.__sample = (ms) => new Promise(res => {
    const wrap = document.querySelector('.mx-wrap')
    const head = wrap.querySelector('tbody.mxhead tr:last-child')
    let frozen = 0
    for (const th of head.children) {
      if (th.classList.contains('lwph') || th.classList.contains('day')) break
      frozen = Math.max(frozen, th.getBoundingClientRect().right - wrap.getBoundingClientRect().left)
    }
    const out = []; const t0 = performance.now()
    const f = () => {
      const t = performance.now(); const wr = wrap.getBoundingClientRect()
      const L = wr.left + frozen, R = wr.right
      let vis = 0
      for (const ph of head.querySelectorAll('.lwph')) {
        const r = ph.getBoundingClientRect(); const ov = Math.min(r.right, R) - Math.max(r.left, L)
        if (ov > 2) vis += ov
      }
      out.push([t, vis, wrap.scrollLeft])
      if (t - t0 < ms) requestAnimationFrame(f); else res(out)
    }
    requestAnimationFrame(f)
  })
  window.__drawnDays = () => document.querySelectorAll('.mx-wrap tbody.mxhead tr:last-child th.day').length
  window.__onMonth = () => document.querySelector('[data-testid="month-strip"] .mjump.on')?.textContent
}

const med = a => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2 }
const browser = await chromium.launch(launchOptions)
const res = {}
const push = (b, s, k, v) => { ((res[b] ??= {})[s] ??= {}); (res[b][s][k] ??= []).push(v) }

async function freshPage(port) {
  const ctx = await browser.newContext(PHONE); const page = await ctx.newPage()
  await page.addInitScript(INIT)
  await page.goto(`http://localhost:${port}/?fresh=1`)
  await page.fill('#luser', CRED[0]); await page.fill('#lpass', CRED[1])
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('.mx-wrap tbody.mxhead th.day', { timeout: 60000 })
  await page.waitForTimeout(3500)
  return { ctx, page, cdp }
}

// A fling, frame by frame: the scroll position moves every frame at a speed that decays (as a phone's momentum does
// after the finger lifts), from where it is to the target, over about `ms` — then stops dead (a fling into the war's
// edge ends there). The grid only ever hears scroll events and reads scrollLeft, so this is what it meets on a phone.
// (Chromium's touch gesture here did not move the grid at all — its touch-action — so the momentum is played by hand.)
async function fling(page, cdp, months, ms) {
  return page.evaluate(([months, ms]) => new Promise(res => {
    const w = document.querySelector('.mx-wrap')
    const from = w.scrollLeft
    const to = Math.max(0, Math.min(w.scrollWidth - w.clientWidth, from + months * w.scrollWidth / 12))
    const t0 = performance.now(); const k = 4 // decay: most of the way early, slowing at the end
    const ease = x => (1 - Math.exp(-k * x)) / (1 - Math.exp(-k))
    const step = () => {
      const x = Math.min(1, (performance.now() - t0) / ms)
      w.scrollLeft = from + (to - from) * ease(x)
      if (x < 1) requestAnimationFrame(step); else res(null)
    }
    requestAnimationFrame(step)
  }), [months, ms])
}

async function measure(page, fn, ms = 9000) {
  const t0 = await page.evaluate(() => performance.now())
  const days0 = await page.evaluate(() => window.__drawnDays())
  const samp = page.evaluate(m => window.__sample(m), ms)
  await fn()
  const s = await samp
  const lt = await page.evaluate(t => window.__lt.filter(e => e[0] >= t), t0)
  const days1 = await page.evaluate(() => window.__drawnDays())
  let striped = 0, lastVis = null, maxGap = 0, lastMove = null
  for (let i = 0; i < s.length - 1; i++) {
    const dt = s[i + 1][0] - s[i][0]; maxGap = Math.max(maxGap, dt)
    if (s[i][1] > 0) { striped += dt; lastVis = s[i + 1][0] }
    if (s[i + 1][2] !== s[i][2]) lastMove = s[i + 1][0]
  }
  return {
    clear: lastVis == null ? 0 : Math.round(lastVis - t0),
    stopped: lastMove == null ? 0 : Math.round(lastMove - t0),
    afterStop: lastVis == null || lastMove == null ? 0 : Math.max(0, Math.round(lastVis - lastMove)),
    striped: Math.round(striped),
    ltSum: Math.round(lt.reduce((a, e) => a + e[1], 0)), ltMax: Math.round(Math.max(0, ...lt.map(e => e[1]))),
    maxFrame: Math.round(maxGap), days0, days1, from: Math.round(s[0][2]), to: Math.round(s[s.length - 1][2]),
  }
}

const tapMonth = async (page, i) => { await page.locator('[data-testid="month-strip"] button').nth(i).click() }

for (let r = 0; r < RUNS; r++) {
  for (let pi = 0; pi < PORTS.length; pi++) {
    const port = PORTS[(pi + r) % PORTS.length]; const b = NAME[port] || port
    for (const sc of SCEN) {
      const { ctx, page, cdp } = await freshPage(port)
      let m
      if (sc === 'FLB') { await tapMonth(page, 11); await page.waitForTimeout(3500); m = await measure(page, () => fling(page, cdp, -11, 1300)) }
      else if (sc === 'FLF') { await tapMonth(page, 0); await page.waitForTimeout(3500); m = await measure(page, () => fling(page, cdp, 11, 1300)) }
      else if (sc === 'LB') { await tapMonth(page, 11); await page.waitForTimeout(3500); m = await measure(page, () => fling(page, cdp, -2.5, 700)) }
      else if (sc === 'LF') { await tapMonth(page, 0); await page.waitForTimeout(3500); m = await measure(page, () => fling(page, cdp, 2.5, 700)) }
      const end = await page.evaluate(() => window.__onMonth())
      for (const [k, v] of Object.entries(m)) push(b, sc, k, v)
      console.log(`${b} ${WHO} ${sc} run${r}: ended on ${end} ${JSON.stringify(m)}`)
      await ctx.close()
    }
  }
}
console.log('\nSUMMARY (median [min–max])')
for (const [b, sc] of Object.entries(res)) for (const [s, ms] of Object.entries(sc)) {
  const line = Object.entries(ms).map(([k, v]) => `${k} ${med(v)} [${Math.min(...v)}–${Math.max(...v)}]`).join(' · ')
  console.log(`${b} ${WHO} ${s}: ${line}`)
}
await browser.close()
