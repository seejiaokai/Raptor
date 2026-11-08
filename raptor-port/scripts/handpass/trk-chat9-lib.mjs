/* CHAT 9 — THE TRACKER'S WALK (8 Nov 26): the walk's own helpers. The scenarios are in trk-chat9-walk.mjs.
   Reads the app only to CHECK a screen. Version line: c9lib v1. */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const BASE = process.env.HP_URL || 'http://localhost:4297'
export const SHOTS = resolve(ROOT, 'docs/img/handpass/2026-11-08-chat9-tracker'); mkdirSync(SHOTS, { recursive: true })
export const RES = process.env.C9_RESULTS || resolve(ROOT, 'docs/handpass/parts/chat9/results.json'); mkdirSync(dirname(RES), { recursive: true })
export const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export const PHONE = { width: 402, height: 874 }, SIDE = { width: 874, height: 402 }, PC = { width: 1536, height: 864 }
export const PCREAL = { width: 1536, height: 730 }, NARROW = { width: 1000, height: 800 }, SHORTPC = { width: 768, height: 432 }, BIG = { width: 2560, height: 1440 }, SHORT500 = { width: 1000, height: 500 }

/* ---------- results ---------- */
let ALL = {}; try { ALL = JSON.parse(readFileSync(RES, 'utf8')) } catch { ALL = {} }
export let cur = null
export function begin(id, title) { cur = { id, title, rows: [] }; console.log('\n=== ' + id + ' ' + title) }
export function row(step, status, said, pics = '') {
  cur.rows.push({ step, status, said: String(said).slice(0, 1200), pics }); console.log(` ${status.padEnd(7)} ${cur.id} ${step} — ${String(said).slice(0, 360)}`)
}
export const ok = (step, cond, said, pics = '') => row(step, cond === null ? 'NOTRUN' : cond ? 'PASS' : 'FAIL', said, pics)
export const note = (step, said, pics = '') => row(step, 'RECORD', said, pics)
export function end() { ALL[cur.id] = cur; writeFileSync(RES, JSON.stringify(ALL, null, 1)); cur = null }
export const want = id => !ONLY.length || ONLY.includes(id)
export async function scn(id, title, fn) {
  if (!want(id)) return
  begin(id, title)
  try { await fn() } catch (e) { row('script', 'NOTRUN', 'script stopped: ' + String(e.message).split('\n')[0]); console.log(e.stack.split('\n').slice(0, 5).join('\n')) }
  end()
}

/* ---------- worlds ---------- */
const browsers = {}
export async function browserFor(engine, headless = true, bars = false) {
  const k = engine + headless + bars
  if (!browsers[k]) browsers[k] = await (engine === 'webkit' ? webkit : chromium).launch({
    headless, ...(engine === 'chromium' && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}),
    ...(bars ? { ignoreDefaultArgs: ['--hide-scrollbars'] } : {}),
    /* the test browser draws every programmatic smooth scroll as one jump unless this is on (probed 8 Nov 26) */
    ...(engine === 'chromium' ? { args: ['--enable-smooth-scrolling'] } : {}),
  })
  return browsers[k]
}
export async function closeAll() { for (const b of Object.values(browsers)) { try { await b.close() } catch {} } }
const FAIL_INIT = `(() => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (window.__failSaves === true && String(k).startsWith('raptor:')) throw new DOMException('walk: forced', 'QuotaExceededError'); return o.call(this, k, v) } })()`
export async function login(page, who) {
  await page.waitForSelector('#luser', { timeout: 20000 })
  await page.fill('#luser', who === 'us' ? 'us' : 'ad'); await page.fill('#lpass', who === 'us' ? 'us' : 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await sleep(500)
}
export async function navTracker(page) {
  const tab = page.locator('#topnav a[data-page="tracker"]:visible')
  if (await tab.count()) await tab.click(); else { await page.click('#burger'); await sleep(300); await page.locator('#drawer a[data-page="tracker"]').first().click() }
  await page.waitForFunction(() => window.CURPAGE === 'tracker', null, { timeout: 20000 })
  await page.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await sleep(900)
}
/* opts: engine, size, touch, dpr, who, clock (ISO string), reduced, fail, headless, bars, url, noTracker */
export async function mkWorld(o = {}) {
  const { engine = 'chromium', size = PHONE, touch = false, dpr, who = 'a', clock = null, reduced = false, fail = false, headless = true, bars = false, url = '/', noTracker = false, wide = false } = o
  const browser = await browserFor(engine, headless, bars)
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: dpr || (touch ? 2 : 1), ...(touch ? { hasTouch: true, isMobile: true } : {}), ...(reduced ? { reducedMotion: 'reduce' } : {}) })
  await ctx.addInitScript('try { delete window.showSaveFilePicker; delete window.showOpenFilePicker } catch (e) {}')
  if (fail) await ctx.addInitScript(FAIL_INIT)
  if (wide) await ctx.addInitScript("(() => { const add = () => { const s = document.createElement('style'); s.textContent = '*, *::before, *::after { font-family: Verdana, \"DejaVu Sans\", sans-serif !important }'; document.head.appendChild(s) }; if (document.head) add(); else document.addEventListener('DOMContentLoaded', add) })()")
  if (clock) await ctx.clock.install({ time: new Date(clock) })
  const page = await ctx.newPage(); page.setDefaultTimeout(12000)
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + url); await login(page, who)
  if (!noTracker) await navTracker(page)
  return { browser, ctx, page, errors, touch, size, engine, who }
}
export const closeW = async w => { try { await w.ctx.close() } catch {} }

/* ---------- reading the screen ---------- */
export const rect = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } }, sel)
const GEO_FN = `(id) => {
  const R = s => { const e = [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom } }
  const pe = document.getElementById('pop'); let pop = null
  if (pe) { const cs = getComputedStyle(pe); const r = pe.getBoundingClientRect(); pop = { l: r.left, t: r.top, r: r.right, b: r.bottom, disp: cs.display, vis: cs.visibility, op: +cs.opacity, pe: cs.pointerEvents, scrolls: pe.scrollHeight > pe.clientHeight + 1, sh: pe.scrollHeight, ch: pe.clientHeight, st: pe.scrollTop, shown: cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && r.width > 0 && r.height > 0 } }
  let ball = null, ring = null
  if (id) { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); if (g) { const r = g.getBoundingClientRect(); ball = { l: r.left, t: r.top, r: r.right, b: r.bottom, x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2, found: !!g.querySelector('.found'), cls: g.getAttribute('class') }
      let u = { l: r.left, t: r.top, r: r.right, b: r.bottom }; for (const c of g.querySelectorAll('*')) { const cr = c.getBoundingClientRect(); const cs2 = getComputedStyle(c); const sw = cs2.stroke && cs2.stroke !== 'none' ? (parseFloat(cs2.strokeWidth) || 0) / 2 : 0; if (cr.width > 0 && cr.height > 0) u = { l: Math.min(u.l, cr.left - sw), t: Math.min(u.t, cr.top - sw), r: Math.max(u.r, cr.right + sw), b: Math.max(u.b, cr.bottom + sw) } } ring = u } }
  const bd = document.getElementById('board')
  return { vw: innerWidth, vh: innerHeight, topbar: R('.topbar'), hdr: R('#page-tracker header'), tabs: R('#viewtabs'), band: R('.topbar .savestat:not(#saveStat)'), board: R('#board'), st: bd ? bd.scrollTop : null, sh: bd ? bd.scrollHeight : null, ch: bd ? bd.clientHeight : null, pop, ball, ring, ae: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : '' }
}`
export const geo = (page, id = 'ACG-09') => page.evaluate(`(${GEO_FN})(${JSON.stringify(id)})`)
export const limitOf = g => Math.max(...[g.topbar, g.hdr, g.tabs, g.band].filter(Boolean).map(r => r.b))
export const r1 = x => x == null ? x : Math.round(x * 10) / 10
export const inter = (a, b) => !!(a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b)
export const undoState = page => page.evaluate(() => { const u = document.getElementById('trUndoBtn'); return u ? { off: u.disabled, title: u.title || '' } : null })

/* the in-page recorder: one line per animation frame */
export async function traceStart(page, id = 'ACG-09') {
  await page.evaluate(id => {
    const T = window.__T = { rows: [], on: true, t0: performance.now() }; const bd = document.getElementById('board')
    const loop = () => { if (!T.on) return
      const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id); const p = document.getElementById('pop'); const cs = p && getComputedStyle(p); const r = p && p.getBoundingClientRect(); const b = g && g.getBoundingClientRect(); const ae = document.activeElement
      T.rows.push({ t: Math.round(performance.now() - T.t0), st: bd.scrollTop, bt: b ? Math.round(b.top * 10) / 10 : null, bb: b ? Math.round(b.bottom * 10) / 10 : null,
        disp: cs ? cs.display : '-', vis: cs ? cs.visibility : '-', op: cs ? +cs.opacity : 0, pe: cs ? cs.pointerEvents : '-', pr: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)] : null,
        ae: ae ? (ae.id || ae.tagName) + (ae.closest && ae.closest('#pop') ? '@pop' : '') : '' })
      requestAnimationFrame(loop) }
    requestAnimationFrame(loop)
  }, id)
}
export const traceStop = page => page.evaluate(() => { window.__T.on = false; return window.__T.rows })
export const shownRow = r => r.disp !== 'none' && r.vis !== 'hidden' && r.op > 0.05 && r.pr && r.pr[2] - r.pr[0] > 0
export function analyse(rows) {
  const st0 = rows[0].st; let first = -1, last = -1, steps = 0, back = 0
  for (let i = 1; i < rows.length; i++) if (rows[i].st !== rows[i - 1].st) { if (first < 0) first = i; last = i; steps++; if (rows[i].st < rows[i - 1].st) back++ }
  const shownIdx = rows.findIndex(shownRow)
  let shownDuring = 0, moved = 0, unseenPressable = 0
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    if (shownRow(r) && last > i) shownDuring++
    if (shownIdx >= 0 && i > shownIdx && r.pr && rows[shownIdx].pr && r.pr.join() !== rows[shownIdx].pr.join()) moved++
    if (!shownRow(r) && r.disp !== '-' && r.disp !== 'none' && r.vis !== 'hidden' && r.pe !== 'none') unseenPressable++
  }
  const aeIn = rows.findIndex(r => r.ae.endsWith('@pop')); const aeEarly = rows.some(r => r.ae.endsWith('@pop') && !shownRow(r))
  return { slid: steps > 0, steps, back, slideLen: rows[rows.length - 1].st - st0, slideMs: first >= 0 ? rows[last].t - rows[first - 1].t : 0, firstT: first >= 0 ? rows[first].t : null,
    shownT: shownIdx >= 0 ? rows[shownIdx].t : null, delay: shownIdx >= 0 && last >= 0 ? rows[shownIdx].t - rows[last].t : null, shownDuring, moved, unseenPressable, aeInT: aeIn >= 0 ? rows[aeIn].t : null, aeEarly, ballTop0: rows[0].bt, ballTop1: rows[rows.length - 1].bt, nframes: rows.length, rest: last >= 0 ? rows[last].t : null }
}

/* W1–W8 for an opened window (after it rests). before: { undo, errN, slid } */
export async function checkW(w, id, before = {}) {
  const page = w.page; const g = await geo(page, id); const L = limitOf(g); const p = g.pop; const out = { fails: [], facts: [] }
  if (!p || !p.shown) { out.fails.push('no window shown'); return { ...out, g, L } }
  const f = (c, m) => { if (!c) out.fails.push(m) }
  f(p.t >= L - 0.5, `W1 window top ${r1(p.t)} < limit ${r1(L)}`)
  if (g.ball) {
    f(!inter(p, g.ball), 'W2 window meets the ball'); f(!inter(p, g.ring), 'W2 window meets the ring')
    const gapBall = p.t >= g.ball.b ? r1(p.t - g.ball.b) : (p.b <= g.ball.t ? '-' + r1(g.ball.t - p.b) : 'overlap'); const gapRing = p.t >= g.ring.b ? r1(p.t - g.ring.b) : (p.b <= g.ring.t ? '-' + r1(g.ring.t - p.b) : 'overlap')
    if (p.t >= g.ball.b && p.t - g.ring.b > 12) out.fails.push(`W2b window ${r1(p.t - g.ball.b)}px below the event's foot (4 expected): detached from it`)
    out.facts.push(`window ${r1(p.t)}–${r1(p.b)}${p.scrolls ? ' (scrolls inside: ' + p.sh + ' in ' + p.ch + ')' : ''}; gap ball foot→top ${gapBall}, ring foot→top ${gapRing}`)
  }
  const fitsScreen = p.t >= L - 0.5 && p.b <= g.vh + 0.5
  if (fitsScreen) out.facts.push(`foot margin ${r1(g.vh - p.b)}`)
  else if (!p.scrolls) out.fails.push(`W3 window foot ${r1(p.b)} past the screen ${g.vh} and it does not scroll`)
  const use = await page.evaluate(() => {
    const pe = document.getElementById('pop'); const res = {}
    const btns = { close: [...pe.querySelectorAll('button')].find(b => b.textContent.trim() === 'Close'), edit: [...pe.querySelectorAll('button')].find(b => /Edit details/.test(b.textContent)) }
    const st0 = pe.scrollTop
    for (const [k, b] of Object.entries(btns)) {
      if (!b) { res[k] = 'none'; continue }
      const want = pe.getBoundingClientRect(); const br = b.getBoundingClientRect()
      if (br.bottom > want.bottom || br.top < want.top) pe.scrollTop += (br.top - want.top) - 20
      const r2 = b.getBoundingClientRect(); const x = (r2.left + r2.right) / 2, y = (r2.top + r2.bottom) / 2
      const hit = document.elementFromPoint(x, y); res[k] = hit && (hit === b || b.contains(hit)) ? 'ok' : 'COVERED by ' + (hit ? (hit.id || hit.tagName) : 'nothing') + ' at ' + Math.round(x) + ',' + Math.round(y)
    }
    pe.scrollTop = st0; return res
  })
  f(use.close === 'ok', 'W3 Close ' + use.close); if (use.edit !== 'none') f(use.edit === 'ok', 'W3 Edit details ' + use.edit)
  if (g.ball && before.slid) { f(g.ball.t >= L - 0.5, `W6 event top ${r1(g.ball.t)} < limit ${r1(L)}`); out.facts.push(`event top ${r1(g.ball.t)} (${r1(g.ball.t - L)} below the limit ${r1(L)})`) }
  if (before.undo) { const u = await undoState(page); f(JSON.stringify(u) === JSON.stringify(before.undo), 'W8 undo changed ' + JSON.stringify(u)) }
  if (before.errN != null) f(w.errors.length === before.errN, 'W8 errors: ' + w.errors.slice(before.errN).join(' / ').slice(0, 200))
  return { ...out, g, L }
}
export const wsay = c => (c.fails.length ? 'FAILS: ' + c.fails.join('; ') + ' | ' : '') + c.facts.join('; ')

/* ---------- gestures ---------- */
export async function tapXY(w, x, y) { if (w.touch) await w.page.touchscreen.tap(x, y); else await w.page.mouse.click(x, y) }
export async function pic(w, name, opts = {}) { try { await w.page.screenshot({ path: resolve(SHOTS, name + '.png'), ...opts }) } catch (e) { return 'ERR ' + name } return name + '.png' }
export const typeFind = async (page, q) => { await page.evaluate(q => { const i = document.getElementById('hSearch'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, q); i.dispatchEvent(new Event('input', { bubbles: true })) }, q); await sleep(700) }
/* Find the way a person does: the strip (≤1050) → 🔍, type, pick the row; a desktop → the bar's box, Enter */
export async function land(w, code = 'ACG-09', how = 'pick') {
  const page = w.page
  if (w.size.width <= 1050) {
    if (w.touch) await page.locator('#hSearchBtn').tap(); else await page.locator('#hSearchBtn').click()
    await sleep(400); await typeFind(page, code)
    if (how === 'enter') await page.keyboard.press('Enter')
    else { const r = page.locator('#hSearchList .findrow').first(); if (w.touch) await r.tap(); else await r.click() }
  } else {
    await page.locator('#hSearch').click(); await typeFind(page, code); await page.keyboard.press('Enter')
  }
  await sleep(1700)
  return geo(page, code)
}
export async function closePop(w) {
  const b = w.page.locator('#pop button', { hasText: /^Close$/ }).first()
  if (await b.count()) { if (w.touch) await b.tap(); else await b.click() }
  await sleep(500)
}
export async function setScroll(w, st) { await w.page.evaluate(st => { document.getElementById('board').scrollTop = st }, st); await sleep(350) }
export async function placeAt(w, id, y) { const g0 = await geo(w.page, id); await setScroll(w, g0.st + (g0.ball.y - y)); return geo(w.page, id) }
export async function pressTraced(w, id, { wait = 1500 } = {}) {
  const g0 = await geo(w.page, id)
  await traceStart(w.page, id)
  await tapXY(w, g0.ball.x, g0.ball.y)
  await sleep(wait)
  const rows = await traceStop(w.page); const an = analyse(rows); const g = await geo(w.page, id)
  return { rows, an, g, g0 }
}
export const fmtAn = a => `slide ${a.slideLen}px in ${a.slideMs}ms over ${a.steps} frames${a.back ? ' (' + a.back + ' back-steps)' : ''}; window first shown at ${a.shownT}ms, ${a.delay == null ? '-' : a.delay}ms after the chart rested; frames showing it during the slide ${a.shownDuring}; moved after shown ${a.moved}; unseen-yet-pressable frames ${a.unseenPressable}`
export async function finger(w, x, y, dx, dy, steps = 12) {
  const cdp = await w.ctx.newCDPSession(w.page)
  const pt = (xx, yy) => [{ x: xx, y: yy, id: 1 }]
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x, y) })
  for (let i = 1; i <= steps; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x + dx * i / steps, y + dy * i / steps) }); await sleep(16) }
  await sleep(90)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach(); await sleep(700)
}

/* the keyboard's ring walked to an event: from wherever it is, by the four arrows in turn (the chart must hold the keys) */
export async function keysTo(w, id) {
  const page = w.page; await page.locator('#board').focus()
  const ring = () => page.evaluate(() => { const k = document.querySelector('#flowSvg .kbdring'); return k && k.dataset.id })
  let at = await ring(); if (!at) { await page.keyboard.press('ArrowDown'); await sleep(100); at = await ring() }
  for (const key of ['ArrowDown', 'ArrowRight', 'ArrowLeft', 'ArrowUp']) {
    for (let n = 0; n < 30 && at !== id; n++) { await page.keyboard.press(key); await sleep(100); const nx = await ring(); if (nx === at) break; at = nx }
    if (at === id) break
  }
  return at
}
