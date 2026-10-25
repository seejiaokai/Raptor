// WALKER 1 of the M3 build's FULL check (25 Oct 26) — shared helpers for lw-m3b-w1-*.mjs.
// Port 4180, pictures under docs/img/handpass/2026-10-25-lw-m3-build/w1/. Built on lw-r3-lib.mjs + lw-night-w1-lib.mjs.
process.env.LW_PORT = '4180'
process.env.LW_OUT = '2026-10-25-lw-m3-build/w1'
const N = await import('./lw-night-w1-lib.mjs')
export const L = N.L
export const T = L.T
export const bubbleNow = N.bubbleNow, bubbleLine = N.bubbleLine, tapPic = N.tapPic, settled = N.settled, cropPic = N.cropPic
export const hideTransient = N.hideTransient, setSwitch = N.setSwitch, kinds = N.kinds, availP = N.availP, availNow = N.availNow
export const availLevel = N.availLevel, setManningView = N.setManningView, dragCells = N.dragCells, bidType = N.bidType
import path from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
import { chromium, webkit, devices } from '@playwright/test'

export const results = []
export const rec = (id, size, verdict, said, pics = []) => { results.push({ id, size, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
export const saveResults = name => writeFileSync(path.join(L.OUT, `w1-${name}.json`), JSON.stringify(results, null, 1))
export const note = (...a) => console.log('   ', ...a)

/* a context at the sizes the brief names: phone 402x874 (Chromium or WebKit), desktop 1536x864 */
export const DESK = { width: 1536, height: 864 }
export async function newCtx(size, engine = 'chromium', storageState = undefined, dsf = 1) {
  const b = await L.getBrowser(engine)
  const phone = size === 'phone'
  const opts = phone
    ? { viewport: L.PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: DESK, deviceScaleFactor: dsf }
  if (storageState) opts.storageState = storageState
  const ctx = await b.newContext(opts)
  const page = await ctx.newPage()
  const errs = []
  const tag = `${size}/${engine}`
  page.on('crash', () => errs.push(`${tag} PAGE CRASHED`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 220)) })
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} http ${r.status()}: ` + r.url().slice(0, 120)) })
  page.on('requestfailed', r => errs.push(`${tag} requestfailed: ` + r.url().slice(0, 100) + ' ' + (r.failure()?.errorText || '')))
  const cdp = phone && engine === 'chromium' ? await ctx.newCDPSession(page) : null
  return { ctx, page, cdp, errs, phone, size, engine }
}
export async function start(size, engine = 'chromium', who = 'admin', today = undefined, storageState = undefined, dsf = 1) {
  const w = await newCtx(size, engine, storageState, dsf)
  await L.signInPlain(w, who, today)
  await hideTransient(w.page)
  return w
}
export const scriptCheck = async w => {
  const src = await w.page.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean))
  return src.map(s => s.split('/').pop()).join(',')
}
export const ids = P => N.peopleIds(P)
export const closeEverything = async w => { await L.closeAny(w); await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(200) }
/* a cell in words */
export const cellWords = async (P, who, iso) => {
  const i = await L.cellInfo(P, who, iso)
  if (!i) return null
  return { text: i.text, boxes: i.boxes.map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|bg ${b.bg}|bd ${b.border}|td:${b.td}|${(b.cls.match(/\b(right-am|right-pm|top|bot|left|right|whole|join\w*)\b/g) || []).join('+')}`) }
}
/* a picture of a clip around a cell (enlarged) */
export const cellPic = (w, who, iso, name) => L.cellShot(w, who, iso, name)
/* the open window's text as it reads */
export const winText = async (P, sel) => (await L.txt(P, sel))
/* what is lit in a set of buttons: background + color + aria-pressed of each, by testid */
export const btnState = (P, ids) => P.evaluate(ids => ids.map(id => {
  const b = document.querySelector(`[data-testid="${id}"]`)
  if (!b || b.getBoundingClientRect().height === 0) return { id, there: false }
  const c = getComputedStyle(b), r = b.getBoundingClientRect()
  return { id, there: true, text: b.innerText.replace(/\s+/g, ' ').trim(), bg: c.backgroundColor, color: c.color, border: c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor, pressed: b.getAttribute('aria-pressed'), cls: b.className.toString().slice(0, 80), w: Math.round(r.width), h: Math.round(r.height), outline: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor, shadow: c.boxShadow.slice(0, 60) }
}), ids)
export const closeBrowser = L.closeBrowser
export const OUT = L.OUT

/* ---- records, reload, pictures of a window and the row above it ---- */
/* the war's own records of a man on a day, as saved (read only) */
export const recsOf = (P, who, iso) => P.evaluate(([who, iso]) => {
  const out = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith('raptor:leavewar/rec:')) continue
    try { const v = JSON.parse(localStorage.getItem(k)); if (v.pid === who && v.date === iso) out.push(v) } catch { }
  }
  return out
}, [who, iso])
export const reqOf = async (P, who, iso) => ((await recsOf(P, who, iso)) || []).filter(r => r.kind === 'request')
export const stateOf = async (P, who, iso) => (await reqOf(P, who, iso)).map(r => `${r.type || r.code || '?'}:${r.state}${r.part ? '/' + r.part : ''}${r.remarks ? '"' + r.remarks + '"' : ''}`).join(' + ') || '(none)'
/* a reload, signing in again only if the app asks (the world is in real storage) */
export async function reloadApp(w, who = 'admin') {
  const P = w.page
  await P.reload(); await P.waitForTimeout(1500)
  if (await P.locator('#luser').count() && await P.locator('#luser').isVisible()) {
    const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
    await P.fill('#luser', u); await P.fill('#lpass', p); await P.click('#loginForm button[type=submit]')
    await P.waitForSelector('#vWeek .day'); await P.evaluate(() => window.go('leavewar'))
    await P.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`); await P.waitForTimeout(800)
    await hideTransient(P)
    return 'signed in again after the reload'
  }
  await P.evaluate(() => window.go('leavewar')).catch(() => {})
  await P.waitForSelector('[data-testid^="row-"]', { timeout: 8000 }).catch(() => {})
  await P.waitForTimeout(800); await hideTransient(P)
  return 'still signed in after the reload'
}
/* a picture clipped to the window (or any box) and the strip of grid just above it */
export async function winPic(w, name, { sel = '[data-testid="bid-picker"]', above = 175, scale = 'css' } = {}) {
  const P = w.page
  const box = await P.evaluate(({ sel, above }) => {
    const e = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().height > 0)
    if (!e) return null
    const r = e.getBoundingClientRect()
    const top = Math.max(0, r.top - above), bottom = Math.min(innerHeight, r.bottom)
    return { x: 0, y: Math.round(top), width: innerWidth, height: Math.round(bottom - top) }
  }, { sel, above })
  if (!box) return null
  await P.screenshot({ path: path.join(L.OUT, name + '.png'), clip: box, scale })
  return name + '.png'
}
/* a tap/click with the picture ~100 ms after the lift (pointer left where it pressed), cut to the window + the row above */
export async function tapWin(w, target, name, opts = {}) {
  const P = w.page
  const c = typeof target === 'string' ? await L.centre(P, target) : target
  if (w.phone) {
    if (w.cdp) {
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] })
      await P.waitForTimeout(40)
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } else await P.touchscreen.tap(c.x, c.y)
  } else await P.mouse.click(c.x, c.y)
  await P.waitForTimeout(100)
  const pic = name ? await winPic(w, name, opts) : null
  await P.waitForTimeout(350)
  return pic
}

/* open whole months for bidding through the real controls (the grid bar's chip → "Open for bidding" → a month button) */
export async function openMonths(w, keys) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  await L.press(w, T('open-chip')); await P.waitForSelector(T('open-dates'), { timeout: 5000 }); await P.waitForTimeout(400)
  for (const k of keys) { await L.press(w, T('od-month-' + k)); await P.waitForTimeout(450) }
  const said = await L.txt(P, T('open-dates'))
  await L.press(w, T('open-dates-close')); await P.waitForTimeout(400)
  return said
}
/* a quick picture of the whole screen (css px) ~100 ms after a tap whose window has gone */
export async function quickScreen(w, name) { await w.page.screenshot({ path: path.join(L.OUT, name + '.png'), scale: 'css' }); return name + '.png' }
/* tap with a picture 100 ms later: the window (+ row above) if it is still there, else the whole screen */
export async function tapQ(w, target, name, opts = {}) {
  const P = w.page
  const c = typeof target === 'string' ? await L.centre(P, target) : target
  if (w.phone) {
    if (w.cdp) {
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] })
      await P.waitForTimeout(40)
      await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } else await P.touchscreen.tap(c.x, c.y)
  } else await P.mouse.click(c.x, c.y)
  await P.waitForTimeout(100)
  let pic = null
  if (name) { pic = await winPic(w, name, opts); if (!pic) pic = await quickScreen(w, name) }
  await P.waitForTimeout(400)
  return pic
}

/* ---- the manning bubble of this build: ONE element, testid manning-bubble, always at the foot (D1358) ---- */
export const bub = P => P.evaluate(() => {
  const e = document.querySelector('[data-testid="manning-bubble"]')
  if (!e || e.getBoundingClientRect().height === 0) return null
  const c = getComputedStyle(e), r = e.getBoundingClientRect()
  const pairs = [...e.querySelectorAll('[data-testid="manning-bubble-pair"]')].map(p => ({ t: p.textContent.trim(), lv: ([...p.classList].find(x => x.startsWith('mnp-')) || '').slice(4), color: getComputedStyle(p).color }))
  const show = e.querySelector('[data-testid="manning-bubble-show"]')
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  const lead = e.querySelector('.mn-lead')?.textContent || ''
  const tt = e.querySelector('[data-testid="manning-bubble-text"]')
  const sr = show ? show.getBoundingClientRect() : null
  return {
    label: e.getAttribute('aria-label'), level: e.dataset.level, lead, text: (tt?.textContent || '').replace(/\s+/g, ' ').trim(),
    border: c.borderTopColor, bg: c.backgroundColor, color: c.color,
    pairs, show: show ? { text: show.textContent.trim(), color: getComputedStyle(show).color, w: Math.round(sr.width), h: Math.round(sr.height), visible: sr.width > 0 && sr.height > 0 } : null,
    rect: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), r: Math.round(r.right), b: Math.round(r.bottom) },
    gapBelow: Math.round(innerHeight - r.bottom), inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, vw: innerWidth, vh: innerHeight,
    pe: c.pointerEvents, hitIsBubble: !!hit && (e === hit || e.contains(hit)), hitTag: hit ? (hit.dataset?.testid || (hit.className || hit.tagName)).toString().slice(0, 40) : null,
    docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, scrollY: Math.round(scrollY),
  }
})
export const bubLine = b => !b ? 'no bubble' : `"${b.label}" level ${b.level} border ${b.border} fill ${b.bg} words ${b.color}; pairs ${b.pairs.map(p => `${p.t} (${p.lv}, ${p.color})`).join(' · ')}; Show ${b.show ? `"${b.show.text}" ${b.show.color}` : 'not there'}; box ${b.rect.x},${b.rect.y} ${b.rect.w}x${b.rect.h}, ${b.gapBelow}px above the screen's foot, ${b.inside ? 'inside' : 'NOT INSIDE'}`
export const isRed = b => !!b && b.level === 'red' && /240, 85, 95/.test(b.border) && /46, 20, 24/.test(b.bg) && /255, 170, 176/.test(b.color)
export const rowsOpen = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-2026"]'); return !!e && e.getBoundingClientRect().height > 0 })
export const rowsInView = P => P.evaluate(() => { const e = document.querySelector('[data-testid^="avail-p-2026"]'); if (!e) return false; const r = e.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < innerHeight })
export async function foldRows(w) {
  const P = w.page
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  if (await rowsOpen(P)) { await L.press(w, T('counts-toggle')); await P.waitForTimeout(600) }
  return !(await rowsOpen(P))
}
export async function f1(w, iso) {   // Required P typed equal to the day's Available P, so one bid turns Available P red
  const P = w.page
  const a0 = await availP(w, iso)
  const H = await import('./lw-night-w1-lib.mjs')
  const req = await H.setReq(w, iso, Number(a0))
  await P.waitForTimeout(300)
  const cell = await H.rowCell(P, `avail-p-${iso}`)
  return { a0, req, cell, level: H.levelOf(cell) }
}
/* a real finger scroll on a phone (Chromium): a touch gesture, at a person's pace */
export async function fingerScroll(w, dy, x = 200, y = 600) {
  await w.cdp.send('Input.synthesizeScrollGesture', { x, y, yDistance: -dy, speed: 700, gestureSourceType: 'touch' })
  await w.page.waitForTimeout(500)
}
export const anyWindowOpen = P => P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"],[data-testid="daylist"],[data-testid="select-sheet"],[data-testid="closed-note"],[data-testid="win-lwday"],[role="dialog"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid || 'dialog'))

/* ---- a fixture the app's own controls build: a whole-day Training on the Inputs page, then Edit Schedule's Reject -> "→ Unavail" ---- */
export async function buildTrgUnavail(w, { person = 'Ranger', iso = '2026-07-15', remarks = 'Sim refresher', type = 'Training', allday = true } = {}) {
  const P = w.page
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
  if (!(await L.vis(P, T('in-new')))) { await L.press(w, '#inListBtn'); await P.waitForTimeout(700) }
  await L.press(w, T('in-new')); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }); await P.waitForTimeout(600)
  await P.locator('#inpEditPerson').selectOption({ label: person })
  await P.locator('#inpEditType').selectOption(type); await P.waitForTimeout(500)
  await P.locator('#inpEditRmk').fill(remarks)
  await L.press(w, `[data-testid="inpEdCal-day-${iso}"]`); await P.waitForTimeout(400)
  if (allday) { await P.locator('[data-testid="win-inputedit"] label:has-text("all day") input').check(); await P.waitForTimeout(300) }
  await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
  const asked = await P.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().height > 0 && /^(docconf|oilconf)/.test(e.dataset.testid)).map(e => e.dataset.testid))
  const rec = await P.evaluate(([type, remarks]) => (window.INPUTS || []).filter(r => r.type === type && r.remarks === remarks).map(r => ({ allday: r.allday, acc: r.acc, date: r.date })), [type, remarks])
  const di = (new Date(iso + 'T00:00:00Z').getUTCDay() + 6) % 7
  await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1500)
  const sec = `#eWeek section.day[data-day="${di}"]`
  if (!(await P.locator(`${sec} .sec-inp .accb`).count())) { await L.press(w, `[data-pitog="${di}"]`); await P.waitForTimeout(600) }
  await P.locator(`${sec} .sec-inp .accb`).first().click(); await P.waitForTimeout(800)      // Reject
  const unavBtn = P.locator(`${sec} .sec-inp .accb`, { hasText: 'Unavail' }).first()
  await unavBtn.click(); await P.waitForTimeout(1000)                                         // → Unavail
  const after = await P.evaluate(([type, remarks]) => (window.INPUTS || []).filter(r => r.type === type && r.remarks === remarks).map(r => ({ allday: r.allday, acc: r.acc })), [type, remarks])
  const unavText = await P.evaluate(s => document.querySelector(s + ' .sec-unav')?.innerText.replace(/\s+/g, ' ') || '', sec)
  return { before: rec, after, asked, di, onUnavailList: unavText.includes(remarks) }
}

/* a close-up of a run of one man's cells (d1..d2), padded; scale 'device' (the context's own DSF) */
export async function rangeShot(w, who, d1, d2, name, pad = 14) {
  const P = w.page
  await L.reachCell(w, who, d1)
  await P.locator(T(L.cellId(who, d1))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {})
  await P.waitForTimeout(250)
  const bb = async d => P.locator(T(L.cellId(who, d))).first().boundingBox({ timeout: 4000 }).catch(() => null)
  const a = await bb(d1), b = await bb(d2)
  if (!a || !b) return null
  const vp = P.viewportSize()
  const x0 = Math.max(0, Math.min(a.x, b.x) - pad), y0 = Math.max(0, Math.min(a.y, b.y) - pad)
  const x1 = Math.min(vp.width, Math.max(a.x + a.width, b.x + b.width) + pad), y1 = Math.min(vp.height, Math.max(a.y + a.height, b.y + b.height) + pad)
  await P.screenshot({ path: path.join(L.OUT, name + '.png'), clip: { x: Math.round(x0), y: Math.round(y0), width: Math.round(x1 - x0), height: Math.round(y1 - y0) }, scale: 'device' })
  return name + '.png'
}
export const boxGeom = (P, who, iso) => P.evaluate(([who, iso]) => {
  const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`); if (!td) return null
  const t = td.getBoundingClientRect()
  return { td: [Math.round(t.left * 10) / 10, Math.round(t.right * 10) / 10], boxes: [...td.querySelectorAll('.c')].map(c => { const r = c.getBoundingClientRect(); const cs = getComputedStyle(c); const bf = getComputedStyle(c, '::before'), af = getComputedStyle(c, '::after'); return { text: c.textContent, cls: c.className.toString().replace(/\s+/g, ' '), left: Math.round(r.left * 10) / 10, right: Math.round(r.right * 10) / 10, top: Math.round(r.top * 10) / 10, bottom: Math.round(r.bottom * 10) / 10, radius: cs.borderRadius, shadow: cs.boxShadow.slice(0, 70), ml: cs.marginLeft, mr: cs.marginRight, fs: cs.fontSize, color: cs.color, beforeW: bf.content === 'none' ? null : bf.width + '/' + bf.backgroundColor, afterW: af.content === 'none' ? null : af.width + '/' + af.backgroundColor } }) }
}, [who, iso])
