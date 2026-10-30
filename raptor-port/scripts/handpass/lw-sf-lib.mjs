// The Leave War small fixes of 30 Oct 26 ([LW-DELETED-NO-ROW-APPROVE], [LW-HALF-DAY-WORDS-LEFT], [LW-M1-READ-LEFTOVERS] (2),
// [LW-MONTH-MEMO-UNPINNED]) — the walk's shared helpers, from lw-m4-lib.mjs and lw-r3-lib.mjs. Serves nothing: points at the
// frozen build already served on LW_PORT. Every script sets LW_OUT to its own folder BEFORE importing this
// (process.env.LW_OUT ||= ...; then await import('./lw-sf-lib.mjs')).
import { chromium, webkit, devices } from '@playwright/test'
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
export const OUT = path.resolve(here, '../../docs/img/handpass', process.env.LW_OUT || '2026-10-30-lw-small-fixes/host')
mkdirSync(OUT, { recursive: true })
export const PORT = process.env.LW_PORT || '4391'
/* a fresh world in memory (the demo); nothing here reloads the page, so nothing is lost */
export const URL = `http://localhost:${PORT}/?fresh=1`
console.log(`[lw-sf-lib v1] pictures -> ${OUT}  build -> ${URL}`)
/* his iPhone (WebKit, 402 x 874) and his PC (1536 x 730 CSS px at 125%) */
export const PHONE = { width: 402, height: 874 }
export const DESK = { width: 1536, height: 730 }
let browsers = {}
export async function getBrowser(engine = 'chromium') { return browsers[engine] ||= await (engine === 'webkit' ? webkit.launch() : chromium.launch(launchOptions)) }
export async function closeBrowser() { for (const k of Object.keys(browsers)) { await browsers[k].close(); delete browsers[k] } }
export async function newCtx(size, engine = size === 'phone' ? 'webkit' : 'chromium') {
  const b = await getBrowser(engine)
  const phone = size === 'phone'
  const ctx = await b.newContext(phone
    ? { viewport: PHONE, hasTouch: true, isMobile: engine !== 'webkit' ? true : undefined, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: DESK, deviceScaleFactor: 1.25 })
  const page = await ctx.newPage()
  const errs = []
  const tag = () => `${size}/${engine}`
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag()} console: ` + m.text().slice(0, 220)) })
  page.on('pageerror', e => errs.push(`${tag()} pageerror: ` + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag()} http ${r.status()}: ` + r.url().slice(0, 120)) })
  const cdp = phone && engine === 'chromium' ? await ctx.newCDPSession(page) : null
  return { ctx, page, cdp, errs, phone, size, engine }
}
export const T = id => `[data-testid="${id}"]`
export const cellId = (who, iso) => `cell-${who}-${iso}`
export const vis = async (page, sel) => { const l = page.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
export const txt = async (page, sel) => (await page.locator(sel).count()) ? (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim() : null
export const shot = (w, name, opts = {}) => w.page.screenshot({ path: path.join(OUT, name + '.png'), scale: 'css', ...opts })
export const clearOut = () => { for (const f of readdirSync(OUT)) if (f.endsWith('.png')) unlinkSync(path.join(OUT, f)) }

export async function signIn(w, who) {
  const { page } = w
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(URL)
  await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  /* passing notes hidden so they cover nothing a picture judges — except where the walk reads them (LW_TOASTS=1) */
  if (!process.env.LW_TOASTS) await page.addStyleTag({ content: '#toastEl, .toast { visibility: hidden !important; }' }).catch(() => {})
  /* every passing note the page says, in order, for a walk to read (a note lasts seconds; a reading after it can miss it) */
  await page.evaluate(() => {
    window.__said = []
    new MutationObserver(() => { for (const e of document.querySelectorAll('#toastEl, .toast')) { const t = (e.textContent || '').trim(); if (t && window.__said[window.__said.length - 1] !== t) window.__said.push(t) } })
      .observe(document.body, { subtree: true, childList: true, characterData: true })
  })
  await openWar(w, who)
}
export async function openWar(w, who = 'admin') {
  await w.page.evaluate(() => window.go('leavewar'))
  await w.page.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`, { state: 'attached', timeout: 15000 })
  await w.page.waitForTimeout(700)
}
/* a press: a finger on a phone (a picture ~100 ms after the lift, D1281), a mouse click on a desktop */
export async function finger(w, x, y, quickName = null) {
  if (w.cdp) {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await w.page.waitForTimeout(60)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    if (quickName) { await w.page.waitForTimeout(80); await shot(w, quickName) }
  } else if (w.phone) {
    await w.page.touchscreen.tap(x, y)
    if (quickName) await shot(w, quickName)
  } else await w.page.mouse.click(x, y)
}
export async function centre(page, sel) {
  const l = page.locator(sel).first()
  await l.evaluate(e => { if (e.closest('td') || e.tagName === 'TD') e.scrollIntoView({ block: 'center', inline: 'center' }) }).catch(() => {})
  await l.scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(80)
  const b = await l.boundingBox()
  if (!b) throw new Error('no box for ' + sel)
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, b }
}
export async function press(w, sel, quickName = null) {
  const c = await centre(w.page, sel)
  const ok = await w.page.evaluate(({ sel, x, y }) => { const e = document.querySelector(sel); const h = document.elementFromPoint(x, y); return !!e && !!h && (e === h || e.contains(h)) }, { sel, x: c.x, y: c.y })
  if (!ok) console.log(`   !! the point of ${sel} is covered by something else`)
  await finger(w, c.x, c.y, quickName)
  await w.page.waitForTimeout(250)
  return c
}
export const results = []
export function rec(id, size, verdict, said, pics = []) { results.push({ id, size, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
export function writeResults(name) { writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(results, null, 1)) }

/* the grid */
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export async function gotoMonth(w, mon) {
  const mm = String(MON.indexOf(mon) + 1).padStart(2, '0')
  for (let i = 0; i < 4; i++) {
    await w.page.evaluate(() => window.scrollTo(0, 0)); await w.page.waitForTimeout(200)
    await press(w, T('month-' + mon)); await w.page.waitForTimeout(1000)
    const there = await w.page.evaluate(m => !!document.querySelector('td[data-testid$="-2026-' + m + '-15"]'), mm)
    if (there) return
    await w.page.keyboard.press('Escape').catch(() => {})
  }
}
export async function reachCell(w, who, iso) {
  if (!(await w.page.locator(T(cellId(who, iso))).count())) await gotoMonth(w, MON[Number(iso.slice(5, 7)) - 1])
  for (let i = 0; i < 16 && !(await w.page.locator(T(cellId(who, iso))).count()); i++) await w.page.waitForTimeout(250)
}
export async function openCell(w, who, iso, quickName = null) {
  await reachCell(w, who, iso)
  await press(w, T(cellId(who, iso)), quickName)
  await w.page.waitForTimeout(450)
}
/* the boxes of one cell, as drawn: their words, kind, fill, place and join marks */
export const cellInfo = (page, who, iso) => page.evaluate(([who, iso]) => {
  const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`)
  if (!td) return null
  const boxes = [...td.querySelectorAll('.c')].map(c => {
    const cs = getComputedStyle(c), r = c.getBoundingClientRect(), tr = td.getBoundingClientRect()
    return { cls: c.className, text: c.textContent, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left - tr.left), y: Math.round(r.top - tr.top),
      jl: /\bjl\b/.test(c.className), jr: /\bjr\b/.test(c.className), radius: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join('/'), color: cs.color }
  })
  return { boxes, text: td.innerText.replace(/\s+/g, ' ').trim() }
}, [who, iso])
/* a close picture of a stretch of one row: from one cell to another */
export async function rowShot(w, who, a, z, name) {
  const A = w.page.locator(T(cellId(who, a))).first(), Z = w.page.locator(T(cellId(who, z))).first()
  await A.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {})
  await w.page.waitForTimeout(300)
  const ba = await A.boundingBox(), bz = await Z.boundingBox()
  if (!ba || !bz) { await shot(w, name); return }
  const vp = w.page.viewportSize()
  const x0 = Math.max(0, Math.min(ba.x, bz.x) - 60), x1 = Math.min(vp.width, Math.max(ba.x + ba.width, bz.x + bz.width) + 60)
  const y0 = Math.max(0, ba.y - 60), y1 = Math.min(vp.height, ba.y + ba.height + 60)
  await w.page.screenshot({ path: path.join(OUT, name + '.png'), clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } })
}
/* the admin's "Auto-approve" in the bid window (D1302 — remembered) */
export async function autoApprove(w, on, pfx = 'bid') {
  const s = w.page.locator(T(`${pfx}-approve-tick`)).first()
  if (!(await s.count())) return null
  const now = (await s.getAttribute('aria-checked')) === 'true' || (await s.getAttribute('aria-pressed')) === 'true'
  if (now !== on) { await press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(300) }
  return ((await s.getAttribute('aria-checked')) === 'true') === on
}
/* place a leave from the open bid window; a second tap answers "below zero — tap again" */
export async function placeLeave(w, type, quickName = null) {
  await press(w, T(`bid-${type}`), quickName); await w.page.waitForTimeout(500)
  if (await vis(w.page, T('bid-picker'))) {
    const note = (await txt(w.page, T('bid-picker'))) || ''
    if (/again/i.test(note)) { await press(w, T(`bid-${type}`)); await w.page.waitForTimeout(600) }
  }
  return !(await vis(w.page, T('bid-picker')))
}
export async function closeWin(w) {
  for (const id of ['bid-cancel', 'sel-cancel', 'dl-close', 'postout-cancel']) if (await vis(w.page, T(id))) { await press(w, T(id)); await w.page.waitForTimeout(300) }
  await w.page.keyboard.press('Escape').catch(() => {}); await w.page.waitForTimeout(200)
}
/* drag from one cell to another (a mouse on a desktop; on a WebKit phone a long press and move) */
export async function dragCells(w, [p1, a], [p2, z]) {
  const P = w.page
  await reachCell(w, p1, a)
  await P.locator(T(cellId(p1, a))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  const bA = await P.locator(T(cellId(p1, a))).first().boundingBox(), bZ = await P.locator(T(cellId(p2, z))).first().boundingBox()
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Z = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  await P.mouse.move(A.x, A.y); await P.mouse.down(); if (w.phone) await P.waitForTimeout(340)
  await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up()
  await P.waitForTimeout(500)
  return vis(P, T('select-sheet'))
}

/* Approvals */
export async function openApprovals(w) { await press(w, T('lw-tab-approvals')); await w.page.waitForSelector(T('approvals-page'), { state: 'visible' }); await w.page.waitForTimeout(500) }
export async function openGrid(w) { await press(w, T('lw-tab-grid')); await w.page.waitForTimeout(500) }
export const tabCount = page => txt(page, T('lw-approvals-count'))
export const apprLines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]
  .filter(e => e.getBoundingClientRect().height > 0)
  .map((e, i) => ({ i, who: e.dataset.testid.slice('appr-line-'.length), text: e.innerText.replace(/\s+/g, ' ').trim(), lit: e.className.match(/lit-(\w+)/)?.[1] || '' })))
/* press a button on the n-th drawn line of a person */
export async function apprPress(w, who, btn, n = 0, quickName = null) {
  const sel = await w.page.evaluate(([who, btn, n]) => {
    const ls = [...document.querySelectorAll(`[data-testid="approvals-page"] [data-testid="appr-line-${who}"]`)].filter(e => e.getBoundingClientRect().height > 0)
    const l = ls[n]; if (!l) return null
    const b = l.querySelector(`[data-testid="${btn}"]`); if (!b) return null
    b.setAttribute('data-sfpress', '1'); return '[data-sfpress="1"]'
  }, [who, btn, n])
  if (!sel) return false
  await press(w, sel, quickName)
  await w.page.evaluate(() => document.querySelectorAll('[data-sfpress]').forEach(e => e.removeAttribute('data-sfpress')))
  await w.page.waitForTimeout(400)
  return true
}
export const undo = async w => { await press(w, '#undoBtn'); await w.page.waitForTimeout(600) }
export const redo = async w => { await press(w, '#redoBtn'); await w.page.waitForTimeout(600) }
/* the Inputs (the app's one record of an absence): what each holds for a person — read through the localhost bridge */
/* (an input names its people in `people`, each `{ p }` — engine/inputs.ts peopleOf; one stored before the one-rule build, `person`) */
export const inputsOf = (page, pid) => page.evaluate(pid => (window.INPUTS || []).filter(r => r && (Array.isArray(r.people) ? r.people.some(e => e && String(e.p) === pid) : String(r.person) === pid)).map(r => ({ iid: r.iid, type: r.type, date: r.date, lw: r.lw || null })), pid)
export const pidOf = (page, cs) => page.evaluate(cs => Object.keys(window.PEOPLE || {}).find(k => window.PEOPLE[k] && window.PEOPLE[k].cs === cs && !window.PEOPLE[k].deleted) || null, cs)
