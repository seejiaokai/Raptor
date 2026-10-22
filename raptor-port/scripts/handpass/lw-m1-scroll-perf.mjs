// Phone Leave War: fast horizontal scroll / month taps, time until no placeholder stripe is in view.
// usage: node scroll.mjs <runs> <scenarioList> <who> <port1,port2,...>   (ports alternate per run)
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
const require = createRequire('C:/Users/User/projects/Raptor/.claude/worktrees/leave-war-events-design-28fa1a/raptor-port/package.json')
const { chromium } = require('@playwright/test')

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const RUNS = Number(process.argv[2] || 5)
const SCEN = (process.argv[3] || 'LF,LB,JF,JB,TAPS').split(',')
const WHO = (process.argv[4] || 'admin')
const PORTS = (process.argv[5] || '4256,4257').split(',')
const NAME = { 4256: 'main', 4257: 'm1' }
const CRED = WHO === 'admin' ? ['ad', 'a'] : ['us', 'us']
const PHONE = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }

const INIT = () => {
  window.__lt = []
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]) }).observe({ type: 'longtask', buffered: true }) } catch {}
  // a sampler: every frame, is a placeholder stripe within the visible (non-frozen) part of the grid?
  window.__sample = (ms) => new Promise(res => {
    const wrap = document.querySelector('.mx-wrap')
    const head = wrap.querySelector('tbody.mxhead tr:last-child')
    // frozen columns: the sticky header cells before the first day / placeholder cell
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
const res = {} // build -> scen -> metric -> []
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
  await page.waitForTimeout(3500) // the rolling window settles at rest
  return { ctx, page, cdp }
}

async function gesture(page, cdp, months) {
  const g = await page.evaluate(() => {
    const w = document.querySelector('.mx-wrap'); const r = w.getBoundingClientRect()
    return { x: Math.round(r.left + r.width * 0.6), y: Math.round(Math.min(r.top + r.height / 2, innerHeight - 120, r.top + 260)), mw: w.scrollWidth / 12 }
  })
  return cdp.send('Input.synthesizeScrollGesture', { x: g.x, y: g.y, xDistance: -Math.round(months * g.mw), yDistance: 0, speed: 4000, gestureSourceType: 'mouse' })
}

async function measure(page, fn, ms = 7000) {
  const t0 = await page.evaluate(() => performance.now())
  const days0 = await page.evaluate(() => window.__drawnDays())
  const samp = page.evaluate(m => window.__sample(m), ms)
  await fn()
  const s = await samp
  const lt = await page.evaluate(t => window.__lt.filter(e => e[0] >= t), t0)
  const days1 = await page.evaluate(() => window.__drawnDays())
  // stripe time: sum of intervals where the sample saw a stripe; clear: time from t0 to the last stripe-visible sample's next frame
  let striped = 0, lastVis = null, maxGap = 0
  for (let i = 0; i < s.length - 1; i++) {
    const dt = s[i + 1][0] - s[i][0]; maxGap = Math.max(maxGap, dt)
    if (s[i][1] > 0) { striped += dt; lastVis = s[i + 1][0] }
  }
  return {
    clear: lastVis == null ? 0 : Math.round(lastVis - t0), striped: Math.round(striped),
    ltSum: Math.round(lt.reduce((a, e) => a + e[1], 0)), ltMax: Math.round(Math.max(0, ...lt.map(e => e[1]))), ltN: lt.length,
    maxFrame: Math.round(maxGap), days0, days1, moved: Math.round(s[s.length - 1][2] - s[0][2]),
  }
}

const tapMonth = async (page, i) => { await page.locator('[data-testid="month-strip"] button').nth(i).click() }

for (let r = 0; r < RUNS; r++) {
  for (let pi = 0; pi < PORTS.length; pi++) {
    const port = PORTS[(pi + r) % PORTS.length]; const b = NAME[port] || port
    for (const sc of SCEN) {
      const { ctx, page, cdp } = await freshPage(port)
      const land = await page.evaluate(() => window.__onMonth())
      push(b, sc, 'land', land)
      let m
      if (sc === 'LF') m = await measure(page, () => gesture(page, cdp, 2.5))
      else if (sc === 'LB') m = await measure(page, () => gesture(page, cdp, -2.5))
      else if (sc === 'JF') { await tapMonth(page, 0); await page.waitForTimeout(3500); m = await measure(page, () => gesture(page, cdp, 2.5)) }
      else if (sc === 'JB') { await tapMonth(page, 11); await page.waitForTimeout(3500); m = await measure(page, () => gesture(page, cdp, -2.5)) }
      else if (sc === 'TAPS') {
        await tapMonth(page, 0); await page.waitForTimeout(3500)
        m = await measure(page, async () => { for (const i of [2, 5, 8, 11, 6]) { await tapMonth(page, i); await page.waitForTimeout(350) } }, 8000)
      }
      for (const [k, v] of Object.entries(m)) push(b, sc, k, v)
      console.log(`${b} ${WHO} ${sc} run${r}: land ${land} ${JSON.stringify(m)}`)
      await ctx.close()
    }
  }
}
console.log('\nSUMMARY (median [min–max])')
for (const [b, sc] of Object.entries(res)) for (const [s, ms] of Object.entries(sc)) {
  const line = Object.entries(ms).filter(([k]) => k !== 'land').map(([k, v]) => `${k} ${med(v)} [${Math.min(...v)}–${Math.max(...v)}]`).join(' · ')
  console.log(`${b} ${WHO} ${s} (land ${[...new Set(ms.land)].join('/')}): ${line}`)
}
await browser.close()
