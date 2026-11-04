// THE LEAVE WAR SMALL FIXES — the RE-WALK of D1633 (4 Nov 26): Retry on a failed page download fetches its files afresh, then
// reloads the app (the card back if they do not come). Run 1 (pictures ...-rewalk-1/, parts/lwsf-rewalk-1.txt) walked the
// plain reload and found WebKit never fetched the file again (R5c; scripts lwsf-webkit-reload-probe.mjs, lwsf-socket-probe.mjs).
// Built from the first walk (lwsf-walk.mjs): its setup, and its unchanged steps re-run as they were (F8 the slowed load, U1 / U2 the
// plain-user round); every Retry step re-expressed for the reload; the pad's box at 375 with three digits (D1634).
// Drives the real built app (served on :4173) through its own controls: taps on cells and keys, the top bar's Undo, the
// menu on a phone, the tabs on a desktop. window.go() is never used. Every check prints PASS / FAIL / NOT WALKED with the
// values it measured; every picture is named in the result. Self-contained (no shared kit).
// Run from raptor-port/: node scripts/handpass/lwsf-rewalk.mjs
import { chromium, webkit, devices } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '../../docs/img/handpass/2026-11-04-lw-small-fixes-rewalk-4')
const RES = join(HERE, '../../docs/handpass/parts/lwsf-rewalk-4.txt')
const URL = 'http://localhost:4173/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true }); mkdirSync(dirname(RES), { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const lines = []
const flush = () => writeFileSync(RES, lines.join('\n') + '\n')
const L = s => { lines.push(s); console.log(s); flush() }
L('lwsf-walk v1 — ' + new Date().toISOString() + ' — build served at ' + URL)
const check = (id, ok, note) => L(`${ok ? 'PASS' : 'FAIL'} ${id}: ${note}`)
const notWalked = (id, note) => L(`NOT WALKED ${id}: ${note}`)
const info = (id, note) => L(`INFO ${id}: ${note}`)
const J = v => JSON.stringify(v)

const PH_UP = { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
const PH_SIDE = { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
const DESK = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

const allT = []
function watch(page, tag, refusal) {
  const T = { tag, refusal: !!refusal, pe: [], ce: [], http: [], failed: [], lw: 0, tr: 0, fetchRoot: [] }
  page.on('pageerror', e => T.pe.push(String(e.message).slice(0, 220)))
  page.on('console', m => { if (m.type() === 'error') T.ce.push(m.text().slice(0, 220)) })
  page.on('response', r => { if (r.status() >= 400) T.http.push(r.status() + ' ' + r.url()) })
  page.on('requestfailed', r => T.failed.push(r.url() + ' ' + (r.failure()?.errorText || '')))
  page.on('request', r => {
    const u = r.url()
    if (/assets\/LeaveWarPage-.*\.js/.test(u)) T.lw++
    if (/assets\/TrackerPage-.*\.js/.test(u)) T.tr++
    if (u === URL && r.resourceType() === 'fetch') T.fetchRoot.push(u)
  })
  allT.push(T)
  return T
}

/* a context whose Leave War and Tracker files can be refused or slowed at will (the flags are read at each request) */
async function mk(type, opts, tag, refusal) {
  const ctx = await type.newContext(opts)
  const G = { lw: false, tr: false, slowLw: 0 }
  const handler = key => async r => {
    try {
      if (G[key === 'lw' ? 'lw' : 'tr']) return await r.abort('internetdisconnected')
      if (key === 'lw' && G.slowLw) await sleep(G.slowLw)
      await r.continue()
    } catch { /* the page went first */ }
  }
  await ctx.route('**/assets/LeaveWarPage-*.js', handler('lw'))
  await ctx.route('**/assets/TrackerPage-*.js', handler('tr'))
  await ctx.addInitScript(() => {
    try {
      new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.classList && n.classList.contains('pgclaw')) (window.__claws ||= []).push(Math.round(performance.now())) }).observe(document, { childList: true, subtree: true })
    } catch { /* no document yet */ }
  })
  const page = await ctx.newPage()
  const touch = !!opts.hasTouch
  const T = watch(page, tag, refusal)
  return { ctx, page, G, T, touch }
}
const login = async (p, u = 'ad', pw = 'a') => {
  await p.goto(URL)
  await p.fill('#luser', u); await p.fill('#lpass', pw)
  await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(400)
}
const press = async (w, sel) => { const l = w.page.locator(sel).first(); await (w.touch ? l.tap() : l.click()) }
const tapS = async (w, sel, ms = 650) => { await press(w, sel); await sleep(ms) }
/* the app's own routes: ☰ then the menu's line on a phone, the top bar's tab on a desktop */
async function nav(w, p) {
  if (await w.page.locator('#burger').isVisible()) {
    await w.page.locator('#burger').tap(); await w.page.waitForSelector('#drawer.open', { timeout: 5000 }); await sleep(250)
    await w.page.locator(`#drawerNav a[data-page="${p}"]`).tap()
  } else {
    await press(w, `a[data-page="${p}"]:visible`)
  }
  await sleep(300)
}
const shot = async (page, name, clip) => { await page.screenshot({ path: join(OUT, name + '.png'), ...(clip ? { clip } : {}) }); L('  picture ' + name + '.png') }
async function scenario(id, fn) {
  try { await fn() } catch (e) { L(`FAIL ${id}: the script stopped — ${String(e.message).split('\n')[0].slice(0, 240)}`) }
}

/* ============================ THE PAD ============================ */
const P25 = 'req-p-2026-02-25', W25 = 'req-w-2026-02-25', P26 = 'req-p-2026-02-26'
const bring = async (p, tid) => { await p.evaluate(t => document.querySelector(`[data-testid="${t}"]`).scrollIntoView({ block: 'center', inline: 'center' }), tid); await sleep(350) }
const cellText = (p, tid) => p.evaluate(t => { const e = document.querySelector(`[data-testid="${t}"]`); return e ? e.textContent.trim() : null }, tid)
async function toGrid(w) {
  const p = w.page
  await nav(w, 'leavewar')
  await p.locator('[data-testid="row-slipway"]').waitFor({ timeout: 15000 }); await sleep(500)
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
  if (await p.locator('[data-testid="month-FEB"]').count()) await tapS(w, '[data-testid="month-FEB"]')
  if (!(await p.locator('[data-testid^="req-p-"]').count()) && await p.locator('[data-testid="counts-toggle"]').count()) await tapS(w, '[data-testid="counts-toggle"]')
}
async function openOn(w, tid) {
  await bring(w.page, tid)
  await press(w, `[data-testid="${tid}"]`)
  await w.page.locator('[data-testid="fly-pad"]').waitFor({ timeout: 5000 }); await sleep(450)
}
const key = (w, k, ms = 650) => tapS(w, `[data-testid="fly-pad-${k}"]`, ms)
const closePad = async w => { await key(w, 'done', 500); await w.page.locator('[data-testid="fly-pad"]').waitFor({ state: 'detached', timeout: 4000 }).catch(() => {}) }
const MEASURE = () => {
  const q = s => document.querySelector(s)
  const R = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: +b.left.toFixed(2), t: +b.top.toFixed(2), r: +b.right.toFixed(2), b: +b.bottom.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) } }
  const fig = q('[data-testid="fly-pad-fig"]'), cell = q('[data-testid="fly-edit-touch"]'), day = q('.flypad-day')
  const sel = fig && fig.querySelector('.flysel'), car = fig && fig.querySelector('.flycaret')
  const cs = cell ? getComputedStyle(cell, '::after') : null
  return {
    figText: fig ? fig.textContent : null, figSel: !!sel, figSelText: sel ? sel.textContent : null, caret: !!car,
    caretW: car ? +car.getBoundingClientRect().width.toFixed(2) : null, caretAnim: car ? getComputedStyle(car).animationName : null,
    cellText: cell ? cell.textContent : null, cellSelected: cell ? cell.classList.contains('selected') : null, cellHasSel: !!(cell && cell.querySelector('.flysel')),
    cellAfter: cs ? { content: cs.content, display: cs.display, opacity: cs.opacity, visibility: cs.visibility } : null,
    strip: q('.flypad-hd b') ? q('.flypad-hd b').textContent : null, day: day ? day.textContent : null,
    rects: { fig: R(fig), day: R(day), prev: R(q('[data-testid="fly-pad-prev"]')), next: R(q('[data-testid="fly-pad-next"]')), done: R(q('[data-testid="fly-pad-done"]')), pad: R(q('[data-testid="fly-pad"]')), cell: R(cell) },
    vw: window.innerWidth, vh: window.innerHeight, padUp: !!q('[data-testid="fly-pad"]'),
  }
}
const M = p => p.evaluate(MEASURE)
const hidden = a => !a || a.content === 'none' || a.display === 'none' || a.opacity === '0' || a.visibility === 'hidden'
const ov = (a, b) => a && b && a.l < b.r - 0.5 && a.r > b.l + 0.5 && a.t < b.b - 0.5 && a.b > b.t + 0.5

/* ============================ FAILED DOWNLOAD ============================ */
const cardInfo = p => p.evaluate(() => {
  const c = document.querySelector('[data-testid="page-load-fail"]')
  if (!c) return null
  const b = c.getBoundingClientRect(), r = document.querySelector('[data-testid="page-load-retry"]')
  const tb = document.querySelector('.topbar')
  const tbr = tb ? tb.getBoundingClientRect() : null
  return { role: c.getAttribute('role'), parts: c.innerText.split('\n').map(s => s.trim()).filter(Boolean), retry: r ? r.textContent.trim() : null, retryBox: r ? (() => { const x = r.getBoundingClientRect(); return [Math.round(x.width), Math.round(x.height)] })() : null, card: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)], topbar: tbr ? { vis: tbr.width > 0 && tbr.height > 0 && getComputedStyle(tb).visibility !== 'hidden', top: Math.round(tbr.top), bottom: Math.round(tbr.bottom) } : null, count: document.querySelectorAll('[data-testid="page-load-fail"]').length }
})
const WORDS = what => [`Couldn't open ${what}`, "It didn't download. Check your signal, then retry.", 'Retry']
const gridUp = async (p, ms = 15000) => { try { await p.locator('[data-testid="row-slipway"]').waitFor({ timeout: ms }); return true } catch { return false } }
const cardUp = async (p, ms = 8000) => { try { await p.locator('[data-testid="page-load-fail"]').waitFor({ timeout: ms }); return true } catch { return false } }
const same = (a, b) => a.length === b.length && a.every((x, i) => x.replace(/[‘’]/g, "'") === b[i])

/* ============================ THE RE-WALK OF D1633: Retry reloads the app ============================ */
/* What a reload must keep: every saved key. Read just before Retry and right after the reload, before signing in again. */
const storeSnap = p => p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k) } return o })
function keptAll(id, a, b) {
  const lost = Object.keys(a).filter(k => !(k in b))
  const changed = Object.keys(a).filter(k => k in b && a[k] !== b[k])
  check(id, lost.length === 0, `saved keys before ${Object.keys(a).length}, after the reload ${Object.keys(b).length}; lost ${J(lost.slice(0, 6))}; changed by the fresh start ${changed.length}${changed.length ? ' e.g. ' + J(changed.slice(0, 4)) : ''}`)
}
/* press Retry and wait for the page's own reload; true when a fresh page loaded and the sign-in form shows */
async function retryReloads(w, via) {
  const p = w.page
  await p.evaluate(() => { window.__mk = 'before-reload' })
  const loaded = p.waitForEvent('load', { timeout: 15000 }).then(() => true).catch(() => false)
  if (via === 'enter') await p.keyboard.press('Enter'); else await tapS(w, '[data-testid="page-load-retry"]', 100)
  const reloaded = await loaded
  await p.waitForSelector('#loginForm', { timeout: 15000 }).catch(() => {})
  await sleep(600)
  const mk0 = await p.evaluate(() => window.__mk || null).catch(() => 'navigating')
  const form = await p.evaluate(() => { const f = document.getElementById('loginForm'); return !!f && f.getBoundingClientRect().height > 0 })
  return { reloaded, fresh: mk0 === null, form }
}
/* press Retry while the file is still refused: the claw stands where the card was, then the card comes back — no reload,
   still signed in (the page's own marker survives) */
async function retryStillRefused(w, tag) {
  const p = w.page
  await p.evaluate(() => { window.__mk = 'kept'; window.__claws = [] })
  let reloaded = false
  const onLoad = () => { reloaded = true }
  p.on('load', onLoad)
  const t0 = Date.now()
  await tapS(w, '[data-testid="page-load-retry"]', 60)
  const during = await p.evaluate(() => ({ claw: !!document.querySelector('.pgclaw'), card: document.querySelectorAll('[data-testid="page-load-fail"]').length }))
  await shot(p, `${tag}-retry-claw`)
  const back = await cardUp(p, 25000); const clawMs = Date.now() - t0; await sleep(1200)
  p.off('load', onLoad)
  const after = await p.evaluate(() => ({ focus: document.activeElement ? (document.activeElement.getAttribute('data-testid') || document.activeElement.tagName) : null, mk: window.__mk || null, claws: (window.__claws || []).length, clawLeft: document.querySelectorAll('.pgclaw:not(.gone)').length, topbar: !!document.querySelector('.topbar'), signedIn: !!document.querySelector('#vWeek .day') || !!document.querySelector('.topbar') }))
  await shot(p, `${tag}-card-back`)
  return { during, back, clawMs, reloaded, ...after }
}
/* D1635: after Retry's reload and the sign-in, the page that failed is open by itself — no menu pressed */
const opensItself = async (w, page, id) => {
  const on = await w.page.evaluate(pg => { const s = document.getElementById('page-' + pg); return !!s && s.getBoundingClientRect().height > 0 && getComputedStyle(s).display !== 'none' }, page)
  await shot(w.page, id + '-opened-itself')
  check(id + ' D1635 signed in again: the ' + page + ' page open by itself, no menu pressed', on, 'page-' + page + ' on screen: ' + on)
}
const signInHere = async (p, u = 'ad', pw = 'a') => {
  await p.fill('#luser', u); await p.fill('#lpass', pw)
  await p.click('#loginForm button[type=submit]')
  /* since D1635 the page that failed opens by itself after the sign-in, not the week: wait for the app's top bar */
  await p.waitForSelector('.topbar', { state: 'visible', timeout: 20000 })
  await sleep(1500)
  await sleep(400)
}

await scenario('R0', async () => {
  L('--- R0 the served build carries its list of files, naming both pages ---')
  const res = await fetch(URL + 'page-files.json', { cache: 'no-store' })
  const list = res.ok ? await res.json() : {}
  const has = k => !!list[k] && typeof list[k].file === 'string'
  check('R0 page-files.json names the Leave War and the Tracker, and the app\'s start', res.ok && has('src/leavewar/LeaveWarPage.tsx') && has('src/tracker/TrackerPage.tsx') && has('index.html'), `status ${res.status}; Leave War ${list['src/leavewar/LeaveWarPage.tsx']?.file}, Tracker ${list['src/tracker/TrackerPage.tsx']?.file}, start ${list['index.html']?.file}`)
})

await scenario('R1', async () => {
  L('--- R1 phone 402x874, the Leave War refused: Retry while refused, then Retry once allowed ---')
  const w = await mk(browser, PH_UP, 'R1', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await nav(w, 'leavewar')
  const up = await cardUp(p); await sleep(400)
  const ci = await cardInfo(p)
  await shot(p, 'R1-card')
  check('R1a the card, the top bar kept', up && ci && same(ci.parts, WORDS('the Leave War')) && ci.role === 'alert' && !!ci.topbar?.vis, `parts ${J(ci?.parts)}, top bar ${J(ci?.topbar)}`)
  const sr = await retryStillRefused(w, 'R1')
  check('R1b Retry while still refused: the claw, then the card back — no reload, still signed in', sr.during.claw && sr.during.card === 0 && sr.back && sr.clawMs >= 1250 && !sr.reloaded && sr.mk === 'kept' && sr.clawLeft === 0 && sr.focus === 'page-load-retry', J(sr))
  w.G.lw = false
  const s0 = await storeSnap(p)
  const r2 = await retryReloads(w)
  const s1 = await storeSnap(p)
  await shot(p, 'R1-allowed-signin')
  check('R1e Retry once allowed: the files fetched afresh, then the app reloads (the sign-in form)', r2.reloaded && r2.fresh && r2.form, J(r2))
  keptAll('R1c everything saved kept across the reload', s0, s1)
  await signInHere(p)
  const lw0 = w.T.lw
  await opensItself(w, 'leavewar', 'R1g')
  const ok = await gridUp(p)
  await sleep(1000)
  const left = await cardInfo(p)
  await shot(p, 'R1-grid')
  check('R1f signed in again, ☰ → Leave War: the grid, no card', ok && !left, `grid ${ok}, card ${left ? 'shown' : 'none'}; Leave War file requests ${lw0} -> ${w.T.lw}`)
  await w.ctx.close()
})

await scenario('R2', async () => {
  L('--- R2 desktop, the pre-warm refused; opened later shows the card; Retry reloads ---')
  const w = await mk(browser, DESK, 'R2', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await sleep(6000)
  const st = await p.evaluate(() => ({ topbar: !!document.querySelector('.topbar'), week: !!document.querySelector('#vWeek .day'), card: document.querySelectorAll('[data-testid="page-load-fail"]').length, claw: document.querySelectorAll('.pgclaw').length }))
  await shot(p, 'R2-after-6s')
  const refused = w.T.failed.filter(f => /LeaveWarPage/.test(f)).length
  check('R2a the pre-warm fails silent', st.topbar && st.week && st.card === 0 && st.claw === 0, `${J(st)}; the hidden download refused ${refused} time(s)`)
  w.G.lw = false
  const r0 = w.T.lw
  await nav(w, 'leavewar')
  const up = await cardUp(p); await sleep(500)
  const ci = await cardInfo(p)
  await shot(p, 'R2-card-on-open')
  check('R2b the tab opened later shows the card, no second try in place (D1633)', up && ci && same(ci.parts, WORDS('the Leave War')) && !!ci.topbar?.vis && w.T.lw === r0, `parts ${J(ci?.parts)}; file requests ${r0} -> ${w.T.lw}`)
  const r = await retryReloads(w)
  check('R2c Retry reloads the app', r.reloaded && r.fresh && r.form, J(r))
  await signInHere(p)
  await sleep(3000)
  await opensItself(w, 'leavewar', 'R2e')
  const ok = await gridUp(p)
  await sleep(800)
  const left = await cardInfo(p)
  await shot(p, 'R2-grid')
  check('R2d signed in again, the Leave War tab: the grid, no card', ok && !left, `grid ${ok}, card ${left ? 'shown' : 'none'}`)
  await w.ctx.close()
})

await scenario('R3', async () => {
  L('--- R3 phone, the Tracker refused, Retry reloads ---')
  const w = await mk(browser, PH_UP, 'R3', true)
  w.G.tr = true
  const p = w.page
  await login(p)
  await nav(w, 'tracker')
  const up = await cardUp(p); await sleep(500)
  const ci = await cardInfo(p)
  await shot(p, 'R3-tracker-card')
  const look = await p.evaluate(() => { const b = document.querySelector('[data-testid="page-load-retry"]'); if (!b) return null; const s = getComputedStyle(b); return { bg: s.backgroundColor, color: s.color, border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor, radius: s.borderTopLeftRadius, font: s.fontSize + ' ' + s.fontWeight, h: Math.round(b.getBoundingClientRect().height) } })
  check('R3a the Tracker card, the top bar kept', up && ci && same(ci.parts, WORDS('the Tracker')) && ci.role === 'alert' && !!ci.topbar?.vis, `parts ${J(ci?.parts)}; Retry's look ${J(look)}`)
  w.G.tr = false
  const r = await retryReloads(w)
  check('R3b Retry reloads the app', r.reloaded && r.fresh && r.form, J(r))
  await signInHere(p)
  await opensItself(w, 'tracker', 'R3d')
  let chart = null
  for (let i = 0; i < 40; i++) { chart = await p.evaluate(() => ({ board: document.querySelectorAll('#page-tracker #board > *').length, nocourse: document.querySelectorAll('#page-tracker #trk-nocourse').length })); if (chart.board || chart.nocourse) break; await sleep(500) }
  await sleep(1500)
  const left = await cardInfo(p)
  await shot(p, 'R3-tracker-chart')
  check('R3c signed in again, ☰ → Tracker: its chart, no card', !!(chart && (chart.board || chart.nocourse)) && !left, `chart ${J(chart)}, card ${left ? 'shown' : 'none'}`)
  await w.ctx.close()
})

await scenario('R4', async () => {
  L('--- R4 desktop keyboard: Tab to Retry, Enter reloads ---')
  const w = await mk(browser, DESK, 'R4', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await sleep(2500)
  await nav(w, 'leavewar')
  await cardUp(p); await sleep(400)
  w.G.lw = false
  let n = 0, at = null
  for (; n < 70; n++) {
    at = await p.evaluate(() => { const a = document.activeElement; return a ? a.getAttribute('data-testid') || a.tagName : null })
    if (at === 'page-load-retry') break
    await p.keyboard.press('Tab'); await sleep(60)
  }
  const ring = await p.evaluate(() => { const a = document.activeElement; if (!a) return null; const s = getComputedStyle(a); const b = a.getBoundingClientRect(); return { fv: a.matches(':focus-visible'), outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, shadow: s.boxShadow, box: { x: b.left, y: b.top, w: b.width, h: b.height } } })
  if (ring && ring.box) await shot(p, 'R4-focus-crop', { x: Math.max(0, ring.box.x - 60), y: Math.max(0, ring.box.y - 40), width: ring.box.w + 120, height: ring.box.h + 80 })
  const hasRing = !!ring && ring.fv && (!/^none/.test(ring.outline) && !/ 0px /.test(ring.outline) || (ring.shadow && ring.shadow !== 'none'))
  check('R4a Tab reaches Retry, with a visible focus ring', at === 'page-load-retry' && hasRing, `after ${n} Tab presses on '${at}'; ${J(ring)}`)
  const r = await retryReloads(w, 'enter')
  await shot(p, 'R4-after-enter')
  check('R4b Enter on Retry reloads the app', r.reloaded && r.fresh && r.form, J(r))
  await signInHere(p)
  await opensItself(w, 'leavewar', 'R4d')
  const ok = await gridUp(p)
  await sleep(600)
  check('R4c signed in again: the Leave War grid', ok && !(await cardInfo(p)), `grid ${ok}`)
  await w.ctx.close()
})

await scenario('R5', async () => {
  L('--- R5 WebKit iPhone 13, the Leave War refused, then allowed, Retry reloads ---')
  let wk
  try { wk = await webkit.launch() } catch (e) { notWalked('R5', 'WebKit would not start: ' + String(e.message).split('\n')[0]); return }
  const w = await mk(wk, { ...devices['iPhone 13'], deviceScaleFactor: 2 }, 'R5-webkit', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await nav(w, 'leavewar')
  const up = await cardUp(p); await sleep(500)
  await shot(p, 'R5-card')
  check('R5a the card (WebKit)', up && same((await cardInfo(p))?.parts || [], WORDS('the Leave War')), `card ${up}`)
  const sr = await retryStillRefused(w, 'R5')
  check('R5x Retry while still refused (WebKit): the claw, then the card back — no reload, still signed in', sr.during.claw && sr.back && sr.clawMs >= 1250 && !sr.reloaded && sr.mk === 'kept', J(sr))
  w.G.lw = false
  const r = await retryReloads(w)
  await shot(p, 'R5-after-retry')
  check('R5b Retry reloads the app (WebKit)', r.reloaded && r.fresh && r.form, J(r))
  await signInHere(p)
  await opensItself(w, 'leavewar', 'R5d')
  const ok = await gridUp(p, 15000)
  await sleep(1000)
  const left = await cardInfo(p)
  await shot(p, 'R5-grid')
  check('R5c signed in again (WebKit): the grid, no card', ok && !left, `grid ${ok}, card ${left ? 'shown' : 'none'}`)
  await w.ctx.close(); await wk.close()
})

await scenario('R6', async () => {
  L('--- R6 member us/us on a phone, refused, Retry reloads ---')
  const w = await mk(browser, PH_UP, 'R6', true)
  w.G.lw = true
  const p = w.page
  await login(p, 'us', 'us')
  await nav(w, 'leavewar')
  const up = await cardUp(p); await sleep(400)
  await shot(p, 'R6-card-member')
  w.G.lw = false
  const r = await retryReloads(w)
  await signInHere(p, 'us', 'us')
  await opensItself(w, 'leavewar', 'R6b')
  const ok = await gridUp(p)
  await sleep(600)
  await shot(p, 'R6-member-grid')
  check('R6 member: the card, Retry reloads, signed in again the grid', up && r.reloaded && r.fresh && ok && !(await cardInfo(p)), `card ${up}; ${J(r)}; grid ${ok}`)
  await w.ctx.close()
})

/* S7 at 375 with three digits: the box under the date on a phone under about 400 wide (D1634), the keys never moving */
async function s7under(width) {
  const tag = `w${width}`
  const w = await mk(browser, { viewport: { width, height: 800 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, `pad-${tag}`)
  const p = w.page
  await login(p)
  await toGrid(w)
  await openOn(w, P25)
  const states = [['open', await M(p)]]
  await shot(p, `S7-${tag}-open`)
  for (const k of [1, 2, 3]) await key(w, k, 350)
  states.push(['typed123', await M(p)])
  await shot(p, `S7-${tag}-typed123`)
  const m3 = states[1][1]
  if (m3.rects.pad) await shot(p, `S7-${tag}-typed123-crop`, { x: 0, y: Math.max(0, m3.rects.pad.t - 4), width, height: Math.min(140, m3.vh - m3.rects.pad.t + 4) })
  const dl = states.map(([, m]) => m.rects.done.l), spread = Math.max(...dl) - Math.min(...dl)
  const under = states.every(([, m]) => m.rects.fig.t >= m.rects.day.b - 1)
  const noOv = states.every(([, m]) => !ov(m.rects.fig, m.rects.prev) && !ov(m.rects.fig, m.rects.next) && !ov(m.rects.fig, m.rects.done) && !ov(m.rects.fig, m.rects.day))
  check(`S7-D1634[${tag}] three digits: the box under the date, whole, ‹ › Done unmoved`, m3.figText && m3.figText.replace(/\s/g, '').startsWith('123') && under && noOv && spread <= 0.5, `figure '${m3.figText}'; box ${J(m3.rects.fig)} day ${J(m3.rects.day)}; under the date ${under}; overlaps none ${noOv}; Done's left edge spread ${spread.toFixed(2)} px`)
  await closePad(w)
  await w.ctx.close()
}
await scenario('S7 375', async () => { L('--- S7 at 375 wide, three digits (D1634) ---'); await s7under(375) })

await scenario('R7', async () => {
  L('--- R7 phone: Retry on a slow signal, then Inputs before the files come — no reload under him ---')
  const w = await mk(browser, PH_UP, 'R7', true)
  w.G.lw = true
  const p = w.page
  await login(p)
  await nav(w, 'leavewar')
  await cardUp(p); await sleep(400)
  w.G.lw = false; w.G.slowLw = 6000
  await p.evaluate(() => { window.__mk = 'kept' })
  let reloaded = false
  p.on('load', () => { reloaded = true })
  await tapS(w, '[data-testid="page-load-retry"]', 300)
  await nav(w, 'inputs')
  await sleep(9000)
  const st = await p.evaluate(() => { const e = document.getElementById('page-inputs'); return { mk: window.__mk || null, inputs: !!e && e.getBoundingClientRect().height > 0 } })
  await shot(p, 'R7-inputs-after-files')
  check('R7 Retry, then Inputs before the files came: no reload, still on Inputs, still signed in', !reloaded && st.mk === 'kept' && st.inputs, JSON.stringify({ reloaded, ...st }))
  await w.ctx.close()
})

/* ---- the first walk's F8, unchanged ---- */
await scenario('F8', async () => {
  L('--- F8 phone, the Leave War slowed 10 s ---')
  const w = await mk(browser, PH_UP, 'F8')
  const p = w.page
  await login(p)
  w.G.slowLw = 10000
  await nav(w, 'leavewar')
  const t0 = Date.now()
  const read = () => p.evaluate(() => { const c = document.querySelector('.pgclaw'); const s = document.getElementById('page-leavewar'); return { claw: !!c, role: c ? c.getAttribute('role') : null, say: c && c.querySelector('.pgclaw-say') ? c.querySelector('.pgclaw-say').textContent : null, still: document.querySelectorAll('.pgclaw-still').length, stillText: document.querySelector('.pgclaw-still') ? document.querySelector('.pgclaw-still').textContent : null, busy: s ? s.getAttribute('aria-busy') : null, card: document.querySelectorAll('[data-testid="page-load-fail"]').length } })
  await sleep(Math.max(0, 4000 - (Date.now() - t0)))
  const a4 = await read(); const e4 = Date.now() - t0
  await shot(p, 'F8-at-4s')
  check('F8a at ~4 s: claw, no "Still loading…"', a4.claw && a4.still === 0, `${e4} ms after the tap: ${J(a4)}`)
  await sleep(Math.max(0, 9000 - (Date.now() - t0)))
  const a9 = await read(); const e9 = Date.now() - t0
  await shot(p, 'F8-at-9s')
  check('F8b at ~9 s: "Still loading…" under the claw, role status, spoken words, aria-busy', a9.still === 1 && a9.stillText === 'Still loading…' && a9.role === 'status' && a9.say === 'Loading Leave War' && a9.busy === 'true', `${e9} ms after the tap: ${J(a9)}`)
  const ok = await gridUp(p, 20000)
  const tArr = Date.now() - t0
  let aft = null
  for (let i = 0; i < 20; i++) { aft = await read(); if (!aft.claw) break; await sleep(500) }
  await sleep(500); aft = await read()
  await shot(p, 'F8-arrived')
  check('F8c after the page arrives: no claw, no line, no aria-busy', ok && !aft.claw && aft.still === 0 && aft.busy === null && aft.card === 0, `grid up ${ok} (${tArr} ms after the tap): ${J(aft)}`)
  await w.ctx.close()
})

/* ============================ PLAIN-USER ROUND ============================ */
await scenario('U1', async () => {
  L('--- U1 phone, nothing refused ---')
  const w = await mk(browser, PH_UP, 'U1')
  const p = w.page
  await login(p)
  await p.evaluate(() => { window.__claws = [] })
  await nav(w, 'leavewar')
  const ok = await gridUp(p)
  const claws = await p.evaluate(() => (window.__claws || []).length)
  await sleep(1500)
  const done = await p.evaluate(() => ({ claw: document.querySelectorAll('.pgclaw').length, card: document.querySelectorAll('[data-testid="page-load-fail"]').length, busy: document.getElementById('page-leavewar')?.getAttribute('aria-busy') ?? null }))
  await shot(p, 'U1-grid')
  check('U1a ☰ → Leave War: claw then grid', ok && done.claw === 0 && done.card === 0 && done.busy === null, `grid ${ok}; claw raised ${claws} time(s) (a fast local load may raise none); after: ${J(done)}`)
  const cell = p.locator('#page-leavewar td[data-testid^="cell-dice-"]').first()
  const winOpen = async () => (await p.locator('[data-testid="bid-picker"]').count()) > 0
  const openCell = async () => { await cell.scrollIntoViewIfNeeded(); await cell.tap(); await sleep(900) }
  await openCell()
  const o1 = await winOpen()
  await shot(p, 'U1-window-open')
  await p.locator('[data-testid="bid-cancel"]').tap(); await sleep(700)
  const c1 = !(await winOpen())
  check('U1b day window opens and ✕ closes it', o1 && c1, `opened ${o1}, closed by ✕ ${c1}`)
  await openCell()
  const o2 = await winOpen()
  await p.keyboard.press('Escape'); await sleep(700)
  const c2 = !(await winOpen())
  check('U1c window closes by Escape', o2 && c2, `opened ${o2}, closed by Escape ${c2}`)
  await openCell()
  const o3 = await winOpen()
  const bx = await p.evaluate(() => { const b = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect(); return { top: b.top, bottom: b.bottom } })
  const y = bx.top > 120 ? bx.top / 2 : (bx.bottom + innerHeight) / 2
  await p.touchscreen.tap(201, y); await sleep(800)
  const c3 = !(await winOpen())
  await shot(p, 'U1-after-outside-tap')
  check('U1d window closes by a tap outside', o3 && c3, `opened ${o3}; tapped (201,${y.toFixed(0)}) with the window at ${J(bx)}; closed ${c3}`)
  await nav(w, 'tracker')
  let chart = null
  for (let i = 0; i < 30; i++) { chart = await p.evaluate(() => ({ board: document.querySelectorAll('#page-tracker #board > *').length, nocourse: document.querySelectorAll('#page-tracker #trk-nocourse').length })); if (chart.board || chart.nocourse) break; await sleep(500) }
  await sleep(1500)
  await shot(p, 'U1-tracker')
  const tcard = await cardInfo(p)
  check('U1e ☰ → Tracker: its chart', !!(chart.board || chart.nocourse) && !tcard, `${J(chart)}, card ${tcard ? 'shown' : 'none'}`)
  await p.evaluate(() => { window.__claws = [] })
  await nav(w, 'leavewar')
  await sleep(250)
  const back = await p.evaluate(() => ({ grid: !!document.querySelector('[data-testid="row-slipway"]') && document.getElementById('page-leavewar').getBoundingClientRect().height > 0, claw: document.querySelectorAll('.pgclaw').length, claws: (window.__claws || []).length }))
  await shot(p, 'U1-leavewar-again')
  check('U1f ☰ → Leave War again: at once, no claw', back.grid && back.claw === 0 && back.claws === 0, `250 ms after the tap: ${J(back)}`)
  await w.ctx.close()
})

await scenario('U2', async () => {
  L('--- U2 desktop, 3 s then the Leave War tab ---')
  const w = await mk(browser, DESK, 'U2')
  const p = w.page
  await login(p)
  await sleep(3000)
  await p.evaluate(() => { window.__claws = [] })
  await nav(w, 'leavewar')
  await sleep(300)
  const early = await p.evaluate(() => ({ grid: !!document.querySelector('[data-testid="row-slipway"]'), claw: document.querySelectorAll('.pgclaw').length, claws: (window.__claws || []).length, card: document.querySelectorAll('[data-testid="page-load-fail"]').length }))
  const ok = await gridUp(p, 5000)
  await sleep(500)
  await shot(p, 'U2-grid')
  const card = await cardInfo(p)
  check('U2 desktop: the grid at once, no card, no claw', early.grid && early.claw === 0 && early.claws === 0 && !card, `300 ms after the click: ${J(early)}; grid up ${ok}`)
  await w.ctx.close()
})

/* ============================ ERRORS ============================ */
L('--- page errors, console errors, 4xx/5xx per scenario (the refused files listed apart) ---')
const expectedRx = /LeaveWarPage|TrackerPage|ERR_INTERNET_DISCONNECTED|dynamically imported|Failed to fetch|Importing a module script failed/i
for (const T of allT) {
  const split = arr => T.refusal ? [arr.filter(x => !expectedRx.test(x)), arr.filter(x => expectedRx.test(x))] : [arr, []]
  const [pe, pe2] = split(T.pe), [ce, ce2] = split(T.ce), [ht, ht2] = split(T.http), [fl, fl2] = split(T.failed)
  const unexpected = pe.length + ce.length + ht.length + fl.length
  L(`${unexpected ? 'ERRORS' : 'clean '} ${T.tag}: page errors ${J(pe)}; console errors ${J(ce)}; 4xx/5xx ${J(ht)}; failed requests ${J(fl)}${T.refusal ? `; EXPECTED (the refused file) page errors ${pe2.length}, console ${ce2.length}, http ${ht2.length}, failed ${fl2.length}${ce2.length ? ' e.g. ' + J(ce2[0]) : ''}` : ''}`)
}
L('DONE')
await browser.close()
