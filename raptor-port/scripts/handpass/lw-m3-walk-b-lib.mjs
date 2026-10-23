// M3 walk, walker B — shared helpers (a model: lw-m1-walk-h-lib.mjs). Served build at port 4173, ?fresh=1.
import { chromium, webkit, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
export const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-24-lw-m3/B')
mkdirSync(OUT, { recursive: true })
export const URL = 'http://localhost:4302/?fresh=1'
export const PHONE = { width: 402, height: 874 }
export const DESK = { width: 1440, height: 900 }
let browser, wbrowser
export async function getBrowser(engine = 'chromium') { if (engine === 'webkit') return wbrowser ||= await webkit.launch(); return browser ||= await chromium.launch(launchOptions) }
export async function closeBrowser() { if (browser) await browser.close(); browser = null; if (wbrowser) await wbrowser.close(); wbrowser = null }
export async function newCtx(size, engine = 'chromium') {
  const b = await getBrowser(engine)
  const phone = size === 'phone'
  const ctx = await b.newContext(phone
    ? { viewport: PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent }
    : { viewport: DESK, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.on('crash', () => console.log('   !! PAGE CRASHED (' + size + ')'))
  const errs = []
  const tag = () => `${size}`
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag()} console: ` + m.text().slice(0, 220)) })
  page.on('pageerror', e => errs.push(`${tag()} pageerror: ` + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag()} http ${r.status()}: ` + r.url().slice(0, 120)) })
  const cdp = phone && engine === 'chromium' ? await ctx.newCDPSession(page) : null
  return { ctx, page, cdp, errs, phone, size, engine }
}
export async function signIn(w, who, today = undefined) {
  const { page } = w
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(URL)
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`)
  await page.waitForTimeout(800)
}
export const shot = (w, name, opts = {}) => w.page.screenshot({ path: path.join(OUT, name + '.png'), scale: 'css', ...opts })
export const T = id => `[data-testid="${id}"]`
export const cellId = (who, iso) => `cell-${who}-${iso}`
export const vis = async (page, sel) => { const l = page.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
export const txt = async (page, sel) => (await page.locator(sel).count()) ? (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim() : null
export async function finger(w, x, y, hold = 0) {
  const { cdp, page } = w
  if (!cdp) { await page.touchscreen.tap(x, y); await page.waitForTimeout(250); return }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
  if (hold) await page.waitForTimeout(hold)
  await page.waitForTimeout(40)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(250)
}
export async function holdDrag(w, pts, hold = 320) {
  const { cdp, page } = w
  const [a, ...rest] = pts
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y, id: 1 }] })
  await page.waitForTimeout(hold)
  for (const p of rest) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p.x, y: p.y, id: 1 }] })
    await page.waitForTimeout(40)
  }
  await page.waitForTimeout(90)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(300)
}
export async function centre(page, sel) {
  const loc = page.locator(sel).first()
  await loc.evaluate(e => { if (e.closest('td') || e.tagName === 'TD') e.scrollIntoView({ block: 'nearest', inline: 'center' }) }).catch(() => {})
  await loc.scrollIntoViewIfNeeded().catch(() => {}); await page.waitForTimeout(80)
  const b = await loc.boundingBox()
  if (!b) throw new Error('no box for ' + sel)
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, b }
}
/* press a control: a finger on a phone, a mouse click on a desktop */
export async function press(w, sel) {
  if (w.phone) { const c = await centre(w.page, sel); await finger(w, c.x, c.y); return c }
  const loc = w.page.locator(sel).first()
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  try { await loc.click({ timeout: 5000 }) } catch { const b = await loc.boundingBox({ timeout: 5000 }); await w.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await w.page.waitForTimeout(250)
}
export const results = []
export function rec(id, size, verdict, said, pics = []) { results.push({ id, size, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
/* the grid month buttons */
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export async function gotoMonth(w, mon) {
  const mm = String(MON.indexOf(mon) + 1).padStart(2, '0')
  for (let i = 0; i < 4; i++) {
    await w.page.evaluate(() => window.scrollTo(0, 0)); await w.page.waitForTimeout(200)
    await press(w, T('month-' + mon)); await w.page.waitForTimeout(1200)
    const there = await w.page.evaluate(m => !!document.querySelector('td[data-testid$="-2026-' + m + '-15"]'), mm)
    if (there) return
    await closeAny(w)
  }
}
/* go to the person's row in view and read the cell */
export const cellInfo = async (page, who, iso) => { for (let i = 0; i < 12 && !(await page.locator(`[data-testid="cell-${who}-${iso}"]`).count()); i++) await page.waitForTimeout(250); return cellInfo0(page, who, iso) }
const cellInfo0 = (page, who, iso) => page.evaluate(([who, iso]) => {
  const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`)
  if (!td) return null
  const boxes = [...td.querySelectorAll('.c')].map(c => {
    const cs = getComputedStyle(c); const r = c.getBoundingClientRect()
    return { cls: c.className, text: c.textContent, bg: cs.backgroundColor, color: cs.color, border: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor, fs: cs.fontSize, w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left - td.getBoundingClientRect().left), y: Math.round(r.top - td.getBoundingClientRect().top), ov: c.scrollWidth - c.clientWidth, tw: (() => { const r = document.createRange(); r.selectNodeContents(c); return Math.round(r.getBoundingClientRect().width * 10) / 10 })(), lh: Math.round(parseFloat(cs.lineHeight) || 0), td: cs.textDecorationLine, ol: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, bs: cs.boxShadow, bgi: cs.backgroundImage.slice(0, 80), brs: [cs.borderTopStyle, cs.borderRightStyle, cs.borderBottomStyle, cs.borderLeftStyle].join('/'), bw: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].join('/'), bc: [cs.borderTopColor, cs.borderLeftColor].join('/'), bf: (() => { const b = getComputedStyle(c, '::before'); return b.content === 'none' ? null : { w: b.width, h: b.height, bg: b.backgroundColor, bd: b.borderLeftWidth + ' ' + b.borderLeftStyle + ' ' + b.borderLeftColor, bs: b.boxShadow, bgi: b.backgroundImage.slice(0, 80) } })() }
  })
  const tr = td.getBoundingClientRect()
  return { tdcls: td.className, tdw: Math.round(tr.width), tdh: Math.round(tr.height), boxes, marks: [...td.querySelectorAll('.mk,.potag,.polast')].map(m => m.className + ':' + m.textContent), text: td.innerText.replace(/\s+/g, ' ').trim() }
}, [who, iso])
export const undo = async w => { await press(w, '#undoBtn'); await w.page.waitForTimeout(500) }
export const redo = async w => { await press(w, '#redoBtn'); await w.page.waitForTimeout(500) }
/* picture of just a cell neighbourhood, enlarged */
export async function cellShot(w, who, iso, name) {
  const td = w.page.locator(T(cellId(who, iso))).first()
  await td.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {})
  await w.page.waitForTimeout(250)
  await td.waitFor({ state: 'attached', timeout: 6000 }).catch(() => {})
  const b = await td.boundingBox({ timeout: 6000 }).catch(() => null)
  if (!b) return false
  const vp = w.page.viewportSize()
  const x0 = Math.max(0, Math.min(b.x - 80, vp.width - 10)), y0 = Math.max(0, b.y - 30)
  const x1 = Math.min(vp.width, b.x + b.width + 80), y1 = Math.min(vp.height, b.y + b.height + 30)
  try { await w.page.screenshot({ path: path.join(OUT, name + '.png'), clip: { x: x0, y: y0, width: Math.max(20, x1 - x0), height: Math.max(20, y1 - y0) } }) } catch { await w.page.screenshot({ path: path.join(OUT, name + '.png'), scale: 'css' }) }
  return true
}
/* open a cell's window (the bid window, or the day's list when it holds records) */
export async function openCell(w, who, iso) { await press(w, T(cellId(who, iso))); await w.page.waitForTimeout(450) }
export async function bid(w, who, iso, type, { portion = 'full' } = {}) {
  await openCell(w, who, iso)
  await w.page.waitForSelector(T('bid-picker'), { timeout: 4000 })
  if (portion !== 'full') await press(w, T(`portion-${portion}`))
  await press(w, T(`bid-${type}`)); await w.page.waitForTimeout(500)
  if (await vis(w.page, T('bid-picker'))) { await press(w, T(`bid-${type}`)); await w.page.waitForTimeout(500) }
  return !(await vis(w.page, T('bid-picker')))
}
export const sheetDump = page => page.evaluate(() => {
  const sheets = [...document.querySelectorAll('.sheet, .bidsheet, [data-testid="bid-picker"], [data-testid="daylist"], [role="dialog"]')].filter(e => e.getBoundingClientRect().height > 0)
  const s = sheets[sheets.length - 1]
  return s ? { id: s.dataset.testid || s.className, text: s.innerText.replace(/\n+/g, ' | '), tids: [...s.querySelectorAll('[data-testid]')].map(e => e.dataset.testid) } : null
})
export async function closeAny(w) {
  for (const t of ['bid-cancel', 'daylist-close', 'sel-cancel', 'closed-note-close', 'remarks-cancel', 'award-close', 'move-cancel', 'open-dates-close']) {
    if (await vis(w.page, T(t))) { await press(w, T(t)); await w.page.waitForTimeout(300) }
  }
}
/* a tap with a picture within ~100 ms of the lift, the pointer left where it pressed (owner D1281) */
export async function tapQuick(w, sel, name) {
  const c = await centre(w.page, sel)
  if (w.cdp) {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] })
    await w.page.waitForTimeout(40)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else { await w.page.touchscreen.tap(c.x, c.y) }
  if (name) await shot(w, name + '-pressed')
  await w.page.waitForTimeout(350)
  if (name) await shot(w, name + '-settled')
  return c
}
