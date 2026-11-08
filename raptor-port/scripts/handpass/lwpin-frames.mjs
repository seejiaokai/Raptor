/* [LW-PIN-LAST-FRAME] (chat 14, 8 Nov 26 — his D1850): the painted frames of a quick scroll, before and after.
   Every frame Chromium's screencast hands over carries the page's scroll at the moment it was painted. Each frame's band
   under the top bar (the pinned row's box) is compared with the same band at rest at that scroll: below the meeting
   point the page as it lies, from the meeting point on the pinned row. A frame that differs is a blink — the real row
   cut under the bar, or the pinned row shown early or late. Counted, not judged by eye; the sheets are for the eye.
   Then the frame times at 4x CPU (rAF intervals and the main thread's work), to see that scrolling is not slower.
   Run from raptor-port/ against a preview of the bundle to measure:
     HP_URL=http://localhost:4381 LABEL=before node scripts/handpass/lwpin-frames.mjs
     ONLY=lw-pc,qu-ph RUNS=3 ...      (some cases; default all four, 5 runs each way)
   Results: docs/img/handpass/2026-11-08-lw-pin-last-frame/<LABEL>-results.json, sheets <LABEL>-<case>-<dir>.png. */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'
process.env.HP_URL ||= 'http://localhost:4381'
const { BASE, login, go } = await import('./lib.mjs')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../docs/img/handpass/2026-11-08-lw-pin-last-frame'); mkdirSync(OUT, { recursive: true })
const LABEL = process.env.LABEL || 'run', RUNS = +(process.env.RUNS || 5)
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), want = k => !ONLY.length || ONLY.includes(k)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const ERRORS = [], RESULTS = { label: LABEL, base: BASE, at: new Date().toISOString(), cases: {} }
const PIN = { lw: '[data-testid="sticky-head"]', qu: '[data-testid="qsticky-head"]' }

/* the comparing page: crops a band out of two frames and counts the pixels that differ */
const cmp = await (await browser.newContext()).newPage()
await cmp.evaluate(() => {
  const load = d => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/png;base64,' + d })
  const pix = (img, r, s, W, H) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, r.x * s, r.y * s, r.w * s, r.h * s, 0, 0, W, H); return g.getImageData(0, 0, W, H).data }
  window.__refs = {}
  window.__setRef = async (k, d, dw) => { const i = await load(d); window.__refs[k] = { i, s: i.naturalWidth / dw } }
  window.__cmp = async (d, dw, k, r) => {
    const i = await load(d), s = i.naturalWidth / dw, ref = window.__refs[k], W = Math.round(r.w * s), H = Math.round(r.h * s)
    const a = pix(i, r, s, W, H), b = pix(ref.i, r, ref.s, W, H)
    let n = 0, sum = 0
    for (let p = 0; p < a.length; p += 4) { const m = Math.max(Math.abs(a[p] - b[p]), Math.abs(a[p + 1] - b[p + 1]), Math.abs(a[p + 2] - b[p + 2])); sum += m; if (m > 40) n++ }
    return { frac: +(n / (W * H)).toFixed(4), mean: +(sum / (W * H)).toFixed(2) }
  }
})
const BAD = c => c.frac > 0.02

async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => ERRORS.push('PAGEERROR ' + e.message))
  page.on('console', m => { if (m.type() === 'error') ERRORS.push('console ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) ERRORS.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/'); await login(page, 'a')
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important} .toast,.snack{display:none!important}' })
  return { ctx, page, vp, touch, cdp: await ctx.newCDPSession(page) }
}
async function openPage(w, which) {
  const P = w.page
  if (which === 'lw') {
    await go(P, 'leavewar'); await P.waitForSelector('[data-testid^="month-"]'); await sleep(900)
    if (await P.locator('[data-testid="lw-tab-grid"]').count()) { await P.locator('[data-testid="lw-tab-grid"]').click(); await sleep(300) }
  } else { await go(P, 'quals'); await sleep(1200) }
  await P.evaluate(() => scrollTo(0, 0)); await sleep(700)
}
/* where the real row meets the top bar (the same measure the page's own code takes), and the pinned box once up */
const GEO = ([which, pinSel]) => {
  const tb = document.querySelector('.topbar').getBoundingClientRect().bottom
  const head = which === 'lw' ? [...document.querySelectorAll('#page-leavewar tbody.mxhead')].find(h => !h.closest('.mxfixed')) : document.querySelector('#qtbl thead')
  const hr = head.getBoundingClientRect(), pin = document.querySelector(pinSel), pr = pin ? pin.getBoundingClientRect() : null
  return { y: scrollY, tb, S: +(scrollY + hr.top - tb).toFixed(1), headH: hr.height, pin: pr && { x: pr.left, y: pr.top, w: pr.width, h: pr.height }, maxY: document.documentElement.scrollHeight - innerHeight }
}
const castOpts = w => ({ format: 'png', everyNthFrame: 1, maxWidth: w.vp.width * (w.touch ? 2 : 1), maxHeight: w.vp.height * (w.touch ? 2 : 1) })
async function cast(w, fn) {
  const frames = []
  w.cdp.on('Page.screencastFrame', async f => { frames.push({ data: f.data, y: f.metadata.scrollOffsetY, dw: f.metadata.deviceWidth, t: f.metadata.timestamp }); try { await w.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
  await w.cdp.send('Page.startScreencast', castOpts(w)); await sleep(400)
  await fn(); await sleep(900)
  await w.cdp.send('Page.stopScreencast'); w.cdp.removeAllListeners('Page.screencastFrame')
  return frames
}
/* one frame of the page at rest at a scroll — the screencast's own path, so the two are encoded alike */
async function restFrame(w, y) {
  await w.page.evaluate(y => scrollTo(0, y), y); await sleep(350)
  await w.page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
  let got = null
  w.cdp.on('Page.screencastFrame', async f => { if (!got) got = { data: f.data, y: f.metadata.scrollOffsetY, dw: f.metadata.deviceWidth }; try { await w.cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
  await w.cdp.send('Page.startScreencast', castOpts(w))
  for (let i = 0; i < 20 && !got; i++) await sleep(100)
  await w.cdp.send('Page.stopScreencast'); w.cdp.removeAllListeners('Page.screencastFrame')
  if (!got) { const s = await w.cdp.send('Page.captureScreenshot', { format: 'png' }); got = { data: s.data, y: await w.page.evaluate(() => scrollY), dw: w.vp.width, shot: true } }
  return got
}
async function finger(w, y0, y1, px, x = 60, rest = 5) {
  let y = y0
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  while (y1 < y0 ? y > y1 : y < y1) { y += y1 < y0 ? -px : px; await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }); await sleep(16) }
  await sleep(rest)
  await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
async function sheet(name, frames, band, z) {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 400 } }), p = await ctx.newPage()
  await p.setContent(`<html><body style="margin:0;background:#0b0f14;color:#e8edf2;font:600 12px system-ui;display:flex;flex-wrap:wrap;gap:6px;padding:6px">${frames.map(f => `
    <div><div style="color:${f.bad ? '#ffb020' : '#9aa7b4'}">${f.label}</div><div style="border:${f.bad ? '3px solid #ffb020' : '1px solid #2a323b'};width:${band.w * z}px;height:${band.h * z}px;overflow:hidden;position:relative">
    <img src="data:image/png;base64,${f.data}" style="position:absolute;left:0;top:0;transform-origin:0 0;transform:translate(${-band.x * z}px,${-band.y * z}px) scale(${z / f.s})"></div></div>`).join('')}</body></html>`)
  await sleep(300)
  await p.setViewportSize({ width: 1100, height: await p.evaluate(() => document.body.scrollHeight) })
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); await ctx.close()
}

async function measureCase(key, which, vp, touch) {
  const w = await world(vp, touch), P = w.page, res = { S: null, runs: [], timing: null }
  await openPage(w, which)
  const g0 = await P.evaluate(GEO, [which, PIN[which]]); res.S = g0.S; res.tb = g0.tb
  // the pinned row at rest, well past the meeting point: its box is the band, and its picture the reference from there on
  const yUp = Math.min(g0.maxY, g0.S + 220)
  const up = await restFrame(w, yUp), gUp = await P.evaluate(GEO, [which, PIN[which]])
  const band = { x: Math.max(0, gUp.pin.x), y: gUp.tb, w: Math.min(vp.width, gUp.pin.x + gUp.pin.w) - Math.max(0, gUp.pin.x) - (touch ? 0 : 2), h: gUp.pin.h }
  res.band = band
  await cmp.evaluate(([d, dw]) => window.__setRef('pinned', d, dw), [up.data, up.dw])
  const refAt = {}
  const refKey = async y => {
    const k = (Math.round(y * 2) / 2).toFixed(1)
    if (!refAt[k]) { const f = await restFrame(w, +k); refAt[k] = Math.abs(f.y - +k) <= 0.6 ? 'y' + k : null; if (refAt[k]) await cmp.evaluate(([kk, d, dw]) => window.__setRef(kk, d, dw), [refAt[k], f.data, f.dw]) }
    return refAt[k]
  }
  for (const dir of ['down', 'up']) {
    for (let run = 0; run < RUNS; run++) {
      const start = dir === 'down' ? 0 : Math.min(g0.maxY, g0.S + (touch ? 420 : 260))
      await P.evaluate(y => scrollTo(0, y), start); await sleep(700); await P.mouse.move(Math.min(700, vp.width / 2), Math.min(600, vp.height - 100))
      const frames = await cast(w, async () => {
        if (touch) await (dir === 'down' ? finger(w, 760, 260, 45) : finger(w, 260, 760, 45))
        else for (let i = 0; i < 4; i++) { await P.mouse.wheel(0, dir === 'down' ? 100 : -100); await sleep(80) }
      })
      const out = []
      for (const f of frames) {
        const pinned = f.y >= g0.S + 0.5
        const k = pinned ? 'pinned' : await refKey(f.y)
        const c = k ? await cmp.evaluate(([d, dw, kk, r]) => window.__cmp(d, dw, kk, r), [f.data, f.dw, k, band]) : null
        out.push({ y: +f.y.toFixed(1), t: f.t, ref: k, ...(c || { frac: null }), bad: c ? BAD(c) : null, data: f.data, s: 1 })
      }
      const bad = out.filter(o => o.bad), cross = out.filter(o => Math.abs(o.y - g0.S) <= 160)
      res.runs.push({ dir, run, frames: out.length, framesNearMeeting: cross.length, blinkFrames: bad.length, blinkAt: bad.map(o => `y=${o.y} (${o.frac})`), unchecked: out.filter(o => o.bad === null).length })
      if (run === 0) {
        const pick = out.filter(o => o.y >= g0.S - band.h - 40 && o.y <= g0.S + 240).slice(0, 24)
        await P.evaluate(() => 0)
        const s = w.touch ? 2 : 1
        await sheet(`${LABEL}-${key}-${dir}`, (pick.length ? pick : out.slice(0, 24)).map(o => ({ label: `y=${o.y}${o.y >= g0.S + 0.5 ? ' past' : ''}${o.bad ? ' BLINK' : ''}`, data: o.data, bad: o.bad, s })), { x: 0, y: Math.max(0, band.y - 30), w: Math.min(vp.width, touch ? 402 : 760), h: band.h + 60 }, touch ? 0.8 : 0.9)
      }
    }
  }
  // frame times at 4x CPU: rAF intervals and the main thread's work over a long scroll down
  await w.cdp.send('Performance.enable'); await w.cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  const tRuns = []
  for (let run = 0; run < RUNS; run++) {
    await P.evaluate(() => scrollTo(0, 0)); await sleep(900)
    const m0 = Object.fromEntries((await w.cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]))
    await P.evaluate(() => { window.__iv = []; window.__on = true; let last = 0; const tick = t => { if (last) window.__iv.push(t - last); last = t; if (window.__on) requestAnimationFrame(tick) }; requestAnimationFrame(tick) })
    if (touch) { await finger(w, 780, 180, 20, 60, 60); await sleep(200); await finger(w, 780, 180, 45, 60, 5) }
    else for (let i = 0; i < 14; i++) { await P.mouse.wheel(0, 100); await sleep(50) }
    await sleep(1000)
    const iv = await P.evaluate(() => { window.__on = false; return window.__iv })
    const m1 = Object.fromEntries((await w.cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]))
    const sv = [...iv].sort((a, b) => a - b), q = p => +(sv[Math.min(sv.length - 1, Math.floor(p * sv.length))] || 0).toFixed(1)
    const d = n => +((m1[n] - m0[n]) * 1000).toFixed(0)
    tRuns.push({ frames: iv.length, medianMs: q(0.5), p95Ms: q(0.95), over33: iv.filter(v => v > 33.4).length, taskMs: d('TaskDuration'), styleMs: d('RecalcStyleDuration'), layoutMs: d('LayoutDuration'), scriptMs: d('ScriptDuration'), endY: await P.evaluate(() => Math.round(scrollY)) })
  }
  await w.cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
  const med = k => { const v = tRuns.map(r => r[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)] }
  res.timing = { runs: tRuns, median: { medianMs: med('medianMs'), p95Ms: med('p95Ms'), over33: med('over33'), taskMs: med('taskMs'), styleMs: med('styleMs'), layoutMs: med('layoutMs'), scriptMs: med('scriptMs') } }
  // the row's state at rest, both sides of the meeting point: is the pinned copy shown, and is it where the real row is
  const restState = async y => { await P.evaluate(y => scrollTo(0, y), y); await sleep(500); return P.evaluate(([sel]) => { const e = document.querySelector(sel); if (!e) return { mounted: false }; const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return { mounted: true, opacity: +cs.opacity, pointer: cs.pointerEvents, top: Math.round(r.top), up: e.classList.contains('up') } }, [PIN[which]]) }
  res.atRest = { top: await restState(0), justBefore: await restState(Math.max(0, g0.S - 2)), justPast: await restState(g0.S + 2), wellPast: await restState(yUp) }
  RESULTS.cases[key] = res
  console.log(key, JSON.stringify({ S: res.S, band, blink: res.runs.map(r => `${r.dir}${r.run}:${r.blinkFrames}/${r.framesNearMeeting}`).join(' '), timing: res.timing.median, atRest: res.atRest }))
  await w.ctx.close()
}

const CASES = [['lw-pc', 'lw', PC, false], ['lw-ph', 'lw', PHONE, true], ['qu-pc', 'qu', PC, false], ['qu-ph', 'qu', PHONE, true]]
for (const [k, which, vp, touch] of CASES) if (want(k)) await measureCase(k, which, vp, touch).catch(e => { RESULTS.cases[k] = { error: e.stack.split('\n').slice(0, 4).join(' | ') }; console.log(k, 'ERROR', e.message) })
RESULTS.errors = ERRORS
writeFileSync(`${OUT}/${LABEL}-results.json`, JSON.stringify(RESULTS, null, 1))
console.log('errors', ERRORS.length, ERRORS.slice(0, 5))
await browser.close()
