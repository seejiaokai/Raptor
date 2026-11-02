/* walker A of the week-swipe bug check (3 Nov 26): shared driver. Chromium by real touch over CDP; WebKit by touch events
   raised inside the page. Written for docs/handpass/parts/ws-walk-a.md. */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
const require = createRequire('C:/Users/User/projects/Raptor/raptor-port/package.json')
export const { chromium, webkit } = require('playwright')

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const BASE = 'http://localhost:4173'
export const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-03-week-swipe/walk/A'
mkdirSync(OUT, { recursive: true })
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const now = () => Number(process.hrtime.bigint() / 1000n) / 1000   // ms, monotonic

export async function openPhone(engine, { width = 402, height = 874 } = {}) {
  const type = engine.startsWith('webkit') ? webkit : chromium
  const browser = await type.launch({ headless: true, ...(engine === 'chromium' ? launchOptions : {}) })
  const context = await browser.newContext({ baseURL: BASE, viewport: { width, height }, deviceScaleFactor: engine === 'webkit1' ? 1 : 3, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  const problems = []
  page.on('console', m => { if (m.type() === 'error') problems.push('console.error ' + m.text().slice(0, 200)) })
  page.on('pageerror', e => problems.push('pageerror ' + String(e.message).slice(0, 200)))
  page.on('requestfailed', r => problems.push('requestfailed ' + r.url().slice(0, 120)))
  page.on('response', r => { if (r.status() >= 400) problems.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 120)) })
  await page.goto('/')
  await page.waitForSelector('#luser')
  await page.evaluate(() => { const w = window; if (typeof w.lwSetMemberToday === 'function') w.lwSetMemberToday('2000-01-01') })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
  const cdp = engine === 'chromium' ? await context.newCDPSession(page) : null
  return { browser, context, page, cdp, problems, engine }
}

export async function goPage(page, p) {
  await page.evaluate(x => window.go(x), p)
  await page.waitForFunction(x => window.CURPAGE === x, p)
  await page.waitForTimeout(400)
  const sel = p === 'editsched' ? '#eWeek' : '#vWeek'
  await page.waitForSelector(sel + ' .day[data-day="6"]', { state: 'attached' })
}

export const weekId = page => page.evaluate(() => window.CURWEEK)
export const slOf = (page, sel) => page.evaluate(s => Math.round(document.querySelector(s).scrollLeft), sel)
/* put the week on a day with no animation, then let it come to rest */
export async function park(page, sel, day) {
  await page.evaluate(([s, d]) => {
    const w = document.querySelector(s)
    const ds = w.querySelectorAll('.day:not(.peek)')
    w.style.scrollBehavior = 'auto'
    w.scrollLeft = d >= ds.length - 1 ? w.scrollWidth : ds[d].offsetLeft - ds[0].offsetLeft
    w.style.scrollBehavior = ''
  }, [sel, day])
  await settle(page, sel)
  await page.waitForTimeout(350)
}
export async function settle(page, sel) {
  return page.evaluate(async s => {
    const el = document.querySelector(s)
    let last = NaN, same = 0
    for (let i = 0; i < 240; i++) {
      await new Promise(r => requestAnimationFrame(() => r(null)))
      const n = Math.round(el.scrollLeft)
      same = n === last ? same + 1 : 0; last = n
      if (same >= 8) return n
    }
    return last
  }, sel)
}
/* wait for a cross to finish: the week changed and the copies are off */
export async function crossed(page, from) {
  await page.waitForFunction(w => window.CURWEEK !== w, from, { timeout: 2500 }).catch(() => {})
  await page.waitForFunction(() => ![...document.body.children].some(c => c.style.position === 'fixed' && c.classList.contains('week')), undefined, { timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(200)
}

/* the frame sampler: every animation frame, from now until stopSampler(). Records the week's scrollLeft, every live day
   card's left edge, and the left edge of every element child of each fixed copy (z-index 41 leaving, 40 arriving), with
   markers for the touch events the page itself sees. */
export async function startSampler(page, sel) {
  await page.evaluate(s => {
    const w = window
    w.__tr = { frames: [], marks: [], on: true, t00: performance.now() }
    const mark = ev => { const c = (ev.touches && ev.touches[0]) || (ev.changedTouches && ev.changedTouches[0]); w.__tr.marks.push({ ev: ev.type, t: Math.round(performance.now() * 10) / 10, x: c ? Math.round(c.clientX) : null, y: c ? Math.round(c.clientY) : null, sl: (document.querySelector(s) || {}).scrollLeft }) }
    w.__tr.mark = mark
    for (const t of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) document.addEventListener(t, mark, { capture: true, passive: true })
    const r1 = v => Math.round(v * 10) / 10
    const tick = () => {
      if (!w.__tr.on) return
      const e = document.querySelector(s)
      const days = e ? [...e.querySelectorAll('.day:not(.peek)')].map(d => r1(d.getBoundingClientRect().left)) : []
      const copies = [...document.body.children].filter(c => c.style.position === 'fixed' && c.classList.contains('week')).map(c => ({
        z: c.style.zIndex, left: r1(c.getBoundingClientRect().left), card: c.firstElementChild ? r1(c.firstElementChild.getBoundingClientRect().left) : null,
        tf: c.firstElementChild ? c.firstElementChild.style.transform || '' : '', top: r1(c.getBoundingClientRect().top), h: r1(c.getBoundingClientRect().height) }))
      w.__tr.frames.push({ t: r1(performance.now()), sl: e ? r1(e.scrollLeft) : null, wk: w.CURWEEK, days, copies })
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, sel)
}
export async function stopSampler(page) {
  return page.evaluate(() => { const o = window.__tr; o.on = false; for (const t of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) document.removeEventListener(t, o.mark, { capture: true }); return { frames: o.frames, marks: o.marks } })
}

/* the screencast: pictures without disturbing the gesture. Frames carry Node's clock at arrival. */
export async function startCast(cdp, { w = 1206, h = 2622 } = {}) {
  const frames = []
  cdp.on('Page.screencastFrame', async f => {
    frames.push({ at: now(), data: f.data })
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {})
  })
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: w, maxHeight: h })
  return frames
}
export const stopCast = cdp => cdp.send('Page.stopScreencast').catch(() => {})
export function saveFrame(frame, name) {
  if (!frame) return null
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(frame.data, 'base64'))
  return name + '.png'
}

/* a finger over CDP (Chromium). pts: [x, y, atMs] relative to the start; the lift comes `rest` ms after the last move.
   Returns Node-clock times of start, each move and lift. */
export async function fingerCdp(cdp, pts, rest = 0, { id = 1 } = {}) {
  const log = { start: 0, moves: [], lift: 0 }
  const [x0, y0] = pts[0]
  log.start = now()
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id }] })
  for (const [x, y, at] of pts.slice(1)) {
    const wait = log.start + at - now()
    if (wait > 0) await sleep(wait)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, id }] })
    log.moves.push(now())
  }
  if (rest) await sleep(rest)
  log.lift = now()
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  return log
}

/* a finger inside the page (WebKit): fake touch events on the element under the finger, bubbling, with touches /
   changedTouches arrays — the page's listeners read touches[0].clientX/Y. No browser scroll follows these. */
export async function fingerPage(page, pts, rest = 0) {
  return page.evaluate(async ([pts, rest]) => {
    const t0 = performance.now()
    const mk = (type, x, y) => {
      const el = document.elementFromPoint(x, y) || document.body
      const ev = new Event(type, { bubbles: true, cancelable: true })
      const touch = { identifier: 1, target: el, clientX: x, clientY: y, pageX: x + scrollX, pageY: y + scrollY, screenX: x, screenY: y, radiusX: 1, radiusY: 1, force: 1 }
      const list = type === 'touchend' || type === 'touchcancel' ? [] : [touch]
      Object.defineProperty(ev, 'touches', { value: list }); Object.defineProperty(ev, 'targetTouches', { value: list })
      Object.defineProperty(ev, 'changedTouches', { value: [touch] })
      el.dispatchEvent(ev)
    }
    const sleepTo = ms => new Promise(r => setTimeout(r, Math.max(0, ms)))
    const log = { start: performance.now(), moves: [], lift: 0 }
    mk('touchstart', pts[0][0], pts[0][1])
    for (const [x, y, at] of pts.slice(1)) { await sleepTo(t0 + at - performance.now()); mk('touchmove', x, y); log.moves.push(performance.now()) }
    if (rest) await sleepTo(rest)
    log.lift = performance.now()
    const last = pts[pts.length - 1]
    mk('touchend', last[0], last[1])
    return log
  }, [pts, rest])
}

/* a straight path: n+1 points from (x0,y0) to (x1,y1) over totalMs */
export function path(x0, y0, x1, y1, n, totalMs) {
  return Array.from({ length: n + 1 }, (_, i) => [Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), Math.round(totalMs * i / n)])
}

/* what a frame trace says about a cross. leavingStood: where the visible day stood in the last frame before the leaving
   copy went up; arriving end vs the real day's resting place; jumps of the card a person sees. */
export function analyse(tr, landingDay) {
  const F = tr.frames
  const upIdx = F.findIndex(f => f.copies.some(c => c.z === '41'))
  const out = { frames: F.length, up: upIdx }
  if (upIdx < 0) return { ...out, note: 'no copies seen (no glide)' }
  const liveVisible = f => {
    let best = null, bo = 0
    f.days.forEach((l, i) => { const o = Math.max(0, Math.min(l + 402, 402) - Math.max(l, 0)); if (o > bo) { bo = o; best = { i, l } } })
    return best
  }
  const before = F[upIdx - 1]
  const lv = before ? liveVisible(before) : null
  const copyUp = F[upIdx].copies.find(c => c.z === '41')
  out.leaving = { stoodCard: lv ? lv.l : null, stoodDayIdx: lv ? lv.i : null, copyFirstCard: copyUp.card, delta: lv ? Math.round((copyUp.card - lv.l) * 10) / 10 : null, tBeforeMs: before ? Math.round(F[upIdx].t - before.t) : null }
  const incFrames = F.filter(f => f.copies.some(c => c.z === '40'))
  const lastInc = incFrames.length ? incFrames[incFrames.length - 1].copies.find(c => c.z === '40').card : null
  const lastCopyIdx = F.map(f => f.copies.length > 0).lastIndexOf(true)
  const after = F.slice(lastCopyIdx + 1).filter(f => f.copies.length === 0)
  const rest = after.length ? after[0] : null
  const restDay = rest ? rest.days[landingDay] : null
  const restSettled = after.length ? after[after.length - 1].days[landingDay] : null
  out.arriving = { lastCopyCard: lastInc, firstLiveAfter: restDay, settledLive: restSettled, delta: lastInc != null && restDay != null ? Math.round((lastInc - restDay) * 10) / 10 : null, deltaSettled: lastInc != null && restSettled != null ? Math.round((lastInc - restSettled) * 10) / 10 : null }
  /* each series on its own: the live card before the copies go up (the finger's drag), the leaving copy, the arriving copy.
     speed over windows of at least 12ms (a frame can arrive 4ms after the last); a hop is a step that is not the glide's own. */
  const series = pick => F.map(f => pick(f)).filter(p => p && p.x != null)
  const trim = ser => { let k = 0; while (k + 1 < ser.length && Math.abs(ser[k + 1].x - ser[k].x) < 0.5) k++; return ser.slice(Math.max(0, k)) }
  const stats = ser0 => {
    const ser = trim(ser0)
    const v = []; let maxStep = 0, maxStepAt = null
    for (let i = 1; i < ser.length; i++) { const d = ser[i].x - ser[i - 1].x; if (Math.abs(d) > Math.abs(maxStep)) { maxStep = d; maxStepAt = { dt: Math.round(ser[i].t - ser[i - 1].t) } } }
    let j = 0
    for (let i = 1; i < ser.length; i++) { while (j < i - 1 && ser[i].t - ser[j + 1].t >= 24) j++; if (ser[i].t - ser[j].t >= 24 && j < i) v.push((ser[i].x - ser[j].x) / (ser[i].t - ser[j].t)) }
    const maxV = v.reduce((m, x) => Math.max(m, Math.abs(x)), 0)
    const accel = []
    for (let i = 1; i < v.length; i++) if (Math.abs(v[i]) > Math.abs(v[i - 1]) * 1.7 + 0.8 && Math.abs(v[i]) > 1.2) accel.push({ at: i, from: Math.round(v[i - 1] * 100) / 100, to: Math.round(v[i] * 100) / 100 })
    const rev = ser.slice(1).filter((p, i) => Math.sign(p.x - ser[i].x) * Math.sign(ser[ser.length - 1].x - ser[0].x) < 0 && Math.abs(p.x - ser[i].x) > 1).length
    return { n: ser.length, maxStep: Math.round(maxStep * 10) / 10, maxStepAt, maxSpeedPxMs: Math.round(maxV * 100) / 100, accelSpikes: accel, reversals: rev, from: ser[0] && ser[0].x, to: ser.length && ser[ser.length - 1].x }
  }
  const idx0 = (liveVisible(F[0]) || { i: 0 }).i
  out.liveBeforeCopies = stats(series(f => (f.t < F[upIdx].t ? (f.days[idx0] != null ? { t: f.t, x: f.days[idx0] } : null) : null)))
  out.leavingSeries = stats(series(f => { const c = f.copies.find(c => c.z === '41'); return c ? { t: f.t, x: c.card } : null }))
  const incAll = series(f => { const c = f.copies.find(c => c.z === '40'); return c ? { t: f.t, x: c.card } : null })
  const jmp = incAll.findIndex((p, i) => i > 0 && Math.abs(p.x - incAll[i - 1].x) > 200)
  out.arrivingParked = jmp > 0 ? { frames: jmp, at: incAll[0].x, ms: Math.round(incAll[jmp].t - incAll[0].t), jumpsTo: incAll[jmp].x } : null
  out.arrivingSeries = stats(jmp > 0 ? incAll.slice(jmp) : incAll)
  out.seenJumps = []
  const firstUp = F[upIdx].t, lastCopyT = F[lastCopyIdx].t
  out.copiesUpMs = Math.round(lastCopyT - firstUp)
  const lifts = tr.marks.filter(m => m.ev === 'touchend' || m.ev === 'touchcancel')
  out.liftToCopiesUpMs = lifts.length ? Math.round(firstUp - lifts[lifts.length - 1].t) : null
  return out
}
