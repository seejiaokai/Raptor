// M4 walk (the Leave War overhaul's deciding — Approvals and the bell's war lines) — shared helpers.
// Built from lw-declutter-lib.mjs (M3's). Serves nothing: points at the frozen build already served on PORT (4173).
// Every walker sets LW_OUT to its own folder BEFORE importing this (process.env.LW_OUT ||= ...; then await import()).
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
export const OUT = path.resolve(here, process.env.LW_OUT || '../../docs/img/handpass/2026-10-27-lw-m4/host')
mkdirSync(OUT, { recursive: true })
console.log(`[lw-m4-lib v1] pictures -> ${OUT}`)
export const PORT = process.env.PORT || 4173
export const PLAIN = `http://localhost:${PORT}/`
/* his iPhone's width; his PC at 125% (1536 x 860 CSS px at device scale 1.25) */
export const PHONE = { width: 402, height: 874 }
export const DESK = { width: 1536, height: 860 }
/* the Leave War's today for the walk: inside the seed's open stretch (Jan – Mar 26), so a member may bid (D1211) */
export const LW_TODAY = process.env.LW_TODAY || '2026-01-05'
let browser = null
export async function getBrowser() { return browser ||= await chromium.launch(launchOptions) }
export async function closeBrowser() { if (browser) { await browser.close(); browser = null } }
export async function newCtx(size) {
  const b = await getBrowser()
  const phone = size === 'phone'
  const ctx = await b.newContext(phone
    ? { viewport: PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: DESK, deviceScaleFactor: 1.25 })
  const page = await ctx.newPage()
  const errs = []
  const tag = () => size
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag()} console: ` + m.text().slice(0, 220)) })
  page.on('pageerror', e => errs.push(`${tag()} pageerror: ` + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag()} http ${r.status()}: ` + r.url().slice(0, 120)) })
  const cdp = phone ? await ctx.newCDPSession(page) : null
  return { ctx, page, cdp, errs, phone, size }
}
export const T = id => `[data-testid="${id}"]`
export const cellId = (who, iso) => `cell-${who}-${iso}`
export const vis = async (page, sel) => { const l = page.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
export const txt = async (page, sel) => (await page.locator(sel).count()) ? (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim() : null
export const shot = (w, name, opts = {}) => w.page.screenshot({ path: path.join(OUT, name + '.png'), scale: 'css', ...opts })
export const clearOut = () => { for (const f of readdirSync(OUT)) if (f.endsWith('.png')) unlinkSync(path.join(OUT, f)) }

/* sign in on REAL storage (never ?fresh=1 — a reload must keep the world); the war's today pinned first */
export async function signIn(w, who) {
  const { page } = w
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(PLAIN)
  await page.waitForSelector('#luser')
  await page.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), LW_TODAY)
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), LW_TODAY)
  await openWar(w, who)
}
export async function openWar(w, who) {
  await w.page.evaluate(() => window.go('leavewar'))
  await w.page.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`, { state: 'attached', timeout: 15000 })
  await w.page.waitForTimeout(700)
}
/* sign out and in as the other role, in the SAME saved world (make a write first on a fresh world — the order's §7.7) */
export async function switchTo(w, who) {
  await w.page.evaluate(() => { const b = document.querySelector('#logout'); if (b) b.click() })
  await w.page.waitForSelector('#luser', { timeout: 15000 })
  await signIn(w, who)
}
/* a press with its two pictures on a phone (one ~100 ms after the lift, the pointer left there — D1281; one settled) */
export let lastTapShot = null
export async function finger(w, x, y, quickName = null) {
  if (w.cdp) {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    await w.page.waitForTimeout(60)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    if (quickName) { await w.page.waitForTimeout(90); await shot(w, quickName); lastTapShot = quickName }
  } else {
    await w.page.mouse.click(x, y)
  }
}
export async function centre(page, sel) {
  const l = page.locator(sel).first()
  await l.scrollIntoViewIfNeeded()
  const b = await l.boundingBox()
  if (!b) throw new Error('no box for ' + sel)
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}
export async function press(w, sel, quickName = null) {
  const c = await centre(w.page, sel)
  /* the element at that point must be the control or inside it (a press that lands on something over it is a finding) */
  const ok = await w.page.evaluate(({ sel, x, y }) => { const e = document.querySelector(sel); const h = document.elementFromPoint(x, y); return !!e && !!h && (e === h || e.contains(h)) }, { sel, x: c.x, y: c.y })
  if (!ok) console.log(`   !! the point of ${sel} is covered by something else`)
  await finger(w, c.x, c.y, quickName)
  return c
}
export async function step(w, label, sel) {
  const c = await press(w, sel, w.phone ? label + '-q' : null)
  await w.page.waitForTimeout(400)
  await shot(w, label)
  return c
}
export const results = []
export function rec(id, size, verdict, said, pics = []) { results.push({ id, size, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
export function writeResults(name) { writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(results, null, 1)) }

/* the grid */
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export async function gotoMonth(w, mon) {
  const btn = w.page.locator(`button:has-text("${mon}")`).first()
  if (await btn.count()) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await w.page.waitForTimeout(700) }
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
/* place a leave from the open bid window; a second tap answers "below zero — tap again" */
export async function placeLeave(w, type) {
  await press(w, T(`bid-${type}`)); await w.page.waitForTimeout(500)
  if (await vis(w.page, T('bid-picker'))) { await press(w, T(`bid-${type}`)); await w.page.waitForTimeout(600) }
  return !(await vis(w.page, T('bid-picker')))
}
export async function closeWin(w) { if (await vis(w.page, T('bid-picker'))) { await press(w, T('bid-cancel')); await w.page.waitForTimeout(300) } }
/* the admin's "Approve what I enter" (D1302 — remembered): set it on or off */
export async function approveWhatIEnter(w, on) {
  const s = w.page.locator(T('bid-approve-tick')).first()
  if (!(await s.count())) return null
  const now = (await s.getAttribute('aria-checked')) === 'true' || (await s.getAttribute('aria-pressed')) === 'true'
  if (now !== on) { await s.click(); await w.page.waitForTimeout(300) }
  return on
}
/* a file for a Document button */
export const pdfPath = (name = 'm4-form.pdf') => { const p = path.join(OUT, name); writeFileSync(p, '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'); return p }

/* Approvals */
export async function openApprovals(w) { await press(w, T('lw-tab-approvals')); await w.page.waitForSelector(T('approvals-page'), { state: 'visible' }); await w.page.waitForTimeout(500) }
export async function openGrid(w) { await press(w, T('lw-tab-grid')); await w.page.waitForTimeout(500) }
export const tabCount = page => txt(page, T('lw-approvals-count'))
/* every line on the Approvals page, read from what is drawn */
export const apprLines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid^="appr-line-"]')]
  .filter(e => e.getBoundingClientRect().height > 0)
  .map(e => ({ who: e.dataset.testid.slice('appr-line-'.length), text: e.innerText.replace(/\s+/g, ' ').trim(), lit: e.className.match(/lit-(\w+)/)?.[1] || '', stale: e.classList.contains('stale') })))
/* the bell */
export async function openBell(w) { await press(w, '#notifyBell'); await w.page.waitForTimeout(500) }
export const bellLines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] [data-testid^="bell-line-"]')].map(e => ({ id: e.dataset.testid.slice(10), unread: e.classList.contains('unread'), text: e.innerText.replace(/\s+/g, ' ').trim() })))
export async function closeBell(w) { await w.page.keyboard.press('Escape'); await w.page.waitForTimeout(300) }
/* undo / redo in the top bar */
export const undo = async w => { await press(w, '#undoBtn'); await w.page.waitForTimeout(600) }
export const redo = async w => { await press(w, '#redoBtn'); await w.page.waitForTimeout(600) }
