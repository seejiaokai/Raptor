// Walker 3's driver for the Leave War overhaul M2 walk (23 Oct 26): sections D (top row), E (grid order), F (bubble), I (undo/reload).
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
export const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-23-lw-m2-looks/w3-r')
mkdirSync(OUT, { recursive: true })
export const PORT = process.env.WALK_PORT || '4265'
export const URL = `http://localhost:${PORT}/?fresh=1`
console.log('lw-m2-walk-3 lib v1', URL)
let browser
export async function getBrowser() { return browser ||= await chromium.launch(launchOptions) }
export async function closeBrowser() { if (browser) await browser.close() }
export function clearPics(prefix) { for (const f of readdirSync(OUT)) if (f.startsWith(prefix)) unlinkSync(path.join(OUT, f)) }

export const SIZES = {
  phone: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent },
  side: { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent },
  desk: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 },
  desk125: { viewport: { width: 1229, height: 691 }, deviceScaleFactor: 1.25 },
  mid: { viewport: { width: 600, height: 900 }, deviceScaleFactor: 1 },
  m500: { viewport: { width: 500, height: 900 }, deviceScaleFactor: 1 },
  m431: { viewport: { width: 431, height: 900 }, deviceScaleFactor: 1 },
}
export const T = id => `[data-testid="${id}"]`
export const cellId = (who, iso) => `cell-${who}-${iso}`

export async function newWorld(size) {
  const b = await getBrowser()
  const ctx = await b.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push(`console: ${m.text().slice(0, 220)}`) })
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`http ${r.status()} ${r.url().slice(0, 120)}`) })
  const touch = !!SIZES[size].hasTouch
  const cdp = touch ? await ctx.newCDPSession(page) : null
  return { ctx, page, cdp, errs, size, touch }
}
export async function signIn(w, who, today) {
  const { page } = w
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(URL)
  await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]')
  await page.waitForTimeout(900)
}
export async function signOutIn(w, who, today) {
  // sign out through the app's own menu is device-specific; use a reload to the login on the same origin storage is unavailable under ?fresh=1.
  // So: use the app's logout hook if present
  const { page } = w
  await page.evaluate(() => { if (typeof window.doLogout === 'function') window.doLogout(); else if (typeof window.logout === 'function') window.logout() })
}
export const shot = (w, name, opts = {}) => w.page.screenshot({ path: path.join(OUT, name + '.png'), ...opts })
export async function finger(w, x, y, hold = 0) {
  const { cdp, page } = w
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
export async function centre(w, sel) {
  const loc = w.page.locator(sel).first()
  await loc.evaluate(e => { const c = e.closest('td') || (e.tagName === 'TD' ? e : null); if (c) c.scrollIntoView({ block: 'nearest', inline: 'center' }) }).catch(() => {})
  await loc.scrollIntoViewIfNeeded().catch(() => {}); await w.page.waitForTimeout(80)
  const b = await loc.boundingBox()
  if (!b) throw new Error('no box for ' + sel)
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, b }
}
export async function tap(w, sel) {
  const c = await centre(w, sel)
  if (w.touch) await finger(w, c.x, c.y); else { await w.page.mouse.click(c.x, c.y); await w.page.waitForTimeout(250) }
  return c
}
export const has = async (page, sel) => (await page.locator(sel).count()) > 0
export const vis = async (page, sel) => { const l = page.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
export const txt = async (page, sel) => (await page.locator(sel).count()) ? (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim() : null
export const boxOf = async (page, sel) => { const l = page.locator(sel).first(); return (await l.count()) ? await l.boundingBox() : null }
export const docWidth = page => page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, bw: document.body.scrollWidth }))
export const results = []
export function rec(id, size, verdict, said, pics = []) { results.push({ id, size, verdict, said, pics }); console.log(`${verdict}  #${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
export const undo = async w => { await tap(w, '#undoBtn'); await w.page.waitForTimeout(500) }
export const redo = async w => { await tap(w, '#redoBtn'); await w.page.waitForTimeout(500) }
export async function bid(w, who, iso, type, { portion = 'full' } = {}) {
  await tap(w, T(cellId(who, iso)))
  await w.page.waitForSelector(T('bid-picker'), { timeout: 4000 })
  if (portion !== 'full') await tap(w, T(`portion-${portion}`))
  await tap(w, T(`bid-${type}`))
  await w.page.waitForTimeout(500)
  if (await vis(w.page, T('bid-picker'))) { await tap(w, T(`bid-${type}`)); await w.page.waitForTimeout(500) }
  return !(await vis(w.page, T('bid-picker')))
}
