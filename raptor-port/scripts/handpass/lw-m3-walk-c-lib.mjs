// M3 walk, walker C - shared helpers (a model: lw-m2-walk-1-lib.mjs). Built bundle at port 4303.
import { chromium, webkit, devices } from '@playwright/test'
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
export const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-24-lw-m3/C')
mkdirSync(OUT, { recursive: true })
export const clearPrefix = prefix => { for (const f of readdirSync(OUT)) if (f.startsWith(prefix)) unlinkSync(path.join(OUT, f)) }
export const URL0 = 'http://localhost:4303/'
export const URL = URL0 + '?fresh=1'
export const PHONE = { width: 402, height: 874 }
export const DESK = { width: 1440, height: 900 }
const browsers = {}
export async function getBrowser(engine = 'chromium') {
  if (!browsers[engine]) browsers[engine] = engine === 'webkit' ? await webkit.launch() : await chromium.launch(launchOptions)
  return browsers[engine]
}
export async function closeBrowser() { for (const k of Object.keys(browsers)) { await browsers[k].close(); delete browsers[k] } }
export async function newCtx(size, engine = 'chromium') {
  const b = await getBrowser(engine)
  const phone = size === 'phone'
  const ctx = await b.newContext(phone
    ? (engine === 'webkit' ? { ...devices['iPhone 13'], viewport: PHONE, screen: PHONE } : { viewport: PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent })
    : { viewport: DESK, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errs = []
  const tag = `${size}/${engine}`
  page.on('crash', () => console.log('   !! PAGE CRASHED (' + tag + ')'))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 220)) })
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} http ${r.status()}: ` + r.url().slice(0, 120)) })
  const cdp = phone && engine === 'chromium' ? await ctx.newCDPSession(page) : null
  return { ctx, page, cdp, errs, phone, size, engine }
}
export async function signIn(w, who, today = undefined, url = URL) {
  const { page } = w
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(url)
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`)
  await page.waitForTimeout(800)
}
export const shot = (w, name, opts = {}) => w.page.screenshot({ path: path.join(OUT, name + '.png'), ...opts })
export const T = id => `[data-testid="${id}"]`
export const cellId = (who, iso) => `cell-${who}-${iso}`
export const vis = async (page, sel) => { const l = page.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
export const txt = async (page, sel) => (await page.locator(sel).count()) ? (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim() : null
/* a finger. Chromium: CDP touch; WebKit: page.touchscreen.tap. quick = a picture ~100 ms after lift, pointer left where it pressed */
export async function finger(w, x, y, { quick } = {}) {
  const { cdp, page } = w
  if (cdp) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
    await page.waitForTimeout(60)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await page.touchscreen.tap(x, y)
  }
  if (quick) { await page.waitForTimeout(90); await shot(w, quick) }
  await page.waitForTimeout(280)
}
export async function centre(page, sel) {
  const loc = page.locator(sel).first()
  await loc.evaluate(e => { if (e.closest('td') || e.tagName === 'TD') e.scrollIntoView({ block: 'nearest', inline: 'center' }) }).catch(() => {})
  await loc.scrollIntoViewIfNeeded().catch(() => {}); await page.waitForTimeout(80)
  const b = await loc.boundingBox()
  if (!b) throw new Error('no box for ' + sel)
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, b }
}
export async function press(w, sel, opts = {}) {
  if (w.phone) { const c = await centre(w.page, sel); await finger(w, c.x, c.y, opts); return c }
  const loc = w.page.locator(sel).first()
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  try { await loc.click({ timeout: 5000 }) } catch { const b = await loc.boundingBox({ timeout: 5000 }); await w.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await w.page.waitForTimeout(250)
}
export const results = []
export function rec(id, size, engine, verdict, said, pics = []) { results.push({ id, size, engine, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}/${engine}]  ${said}  [${pics.join(', ')}]`) }
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export async function closeAny(w) {
  for (const t of ['bid-cancel', 'daylist-close', 'sel-cancel', 'closed-note-close', 'remarks-cancel', 'award-close', 'move-cancel', 'open-dates-close']) {
    if (await vis(w.page, T(t))) { await press(w, T(t)); await w.page.waitForTimeout(300) }
  }
}
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
export const nodes = page => page.evaluate(() => document.querySelector('#page-leavewar') ? document.querySelectorAll('#page-leavewar *').length : -1)
export const median = a => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
export const cellInfo = (page, who, iso) => page.evaluate(([who, iso]) => {
  const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`)
  if (!td) return null
  return { tdcls: td.className, text: td.innerText.replace(/\s+/g, ' ').trim() }
}, [who, iso])
export const undo = async w => { await press(w, '#undoBtn'); await w.page.waitForTimeout(500) }
export const redo = async w => { await press(w, '#redoBtn'); await w.page.waitForTimeout(500) }
