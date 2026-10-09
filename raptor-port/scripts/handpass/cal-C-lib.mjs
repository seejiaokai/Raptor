// Walker C's shared helpers: a world (fresh context, signed in), pictures, the results table, real touch + mouse.
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const BASE = 'http://localhost:4213/'
export const ROOT = 'C:/Users/User/projects/Raptor/raptor-port'
export const PICS = join(ROOT, 'docs/img/handpass/2026-10-08-inputs-sans-calendar-check/C')
export const OUT = join(ROOT, 'docs/handpass/parts/cal-C.json')
mkdirSync(PICS, { recursive: true }); mkdirSync(join(ROOT, 'docs/handpass/parts'), { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

export const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  wide: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 },
  w1280: { viewport: { width: 1280, height: 700 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, userAgent: devices['iPhone 13'].userAgent },
  short: { viewport: { width: 390, height: 568 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, userAgent: devices['iPhone 13'].userAgent },
  land: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, userAgent: devices['iPhone 13'].userAgent },
}
export const big = s => s === 'desk' || s === 'wide' || s === 'w1280'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const tid = (page, id) => page.locator(`[data-testid="${id}"]`)

let browser
export async function getBrowser() { if (!browser) browser = await chromium.launch({ headless: true, ...launchOptions }); return browser }
export async function closeAll() { if (browser) await browser.close(); browser = null }

export async function world(size = 'desk', who = 'ad', { goto = true } = {}) {
  const b = await getBrowser()
  const ctx = await b.newContext(SIZES[size])
  const page = await ctx.newPage()
  page.setDefaultTimeout(8000)
  const errors = []
  page.on('pageerror', e => errors.push('PAGEERROR ' + String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`) })
  page.on('dialog', d => { errors.push('NATIVE DIALOG ' + d.message()); d.dismiss().catch(() => {}) })
  if (goto) {
    await page.goto(BASE + '?fresh=1')
    await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
    await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
    await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
    await sleep(400)
  }
  return { ctx, page, errors, size }
}
export async function toLeaveWar(page) {
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid="row-slipway"]', { timeout: 15000 })
  await sleep(500)
}
export async function toInputs(page) {
  await page.evaluate(() => window.go('inputs'))
  await page.locator('#inpCal').waitFor({ timeout: 15000 })
  await sleep(300)
}
export const press = (size, loc, opts) => (big(size) ? loc.click(opts) : loc.tap(opts))

/* ---------- pictures ---------- */
let NPIC = 0
const opened = new Set()
export async function pic(page, name, opts = {}) {
  const f = join(PICS, name + '.png')
  await page.mouse.move(0, 0).catch(() => {})
  await page.screenshot({ path: f, ...opts }).catch(e => console.log('pic failed', name, String(e).slice(0, 100)))
  NPIC++
  return name + '.png'
}

/* ---------- the table ---------- */
export function load() { try { return JSON.parse(readFileSync(OUT, 'utf8')) } catch { return { rows: {}, errors: [], notes: [] } } }
export function rec(id, did, saw, verdict, pics = []) {
  const all = load()
  all.rows[id] = { id, did, saw, verdict, pics, at: new Date().toISOString() }
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`== ${verdict}  ${id} — ${did}\n     saw: ${String(saw).slice(0, 900)}`)
}
export function recErrors(tag, errors) {
  const all = load(); all.errors.push(...errors.map(e => `${tag}: ${e}`)); writeFileSync(OUT, JSON.stringify(all, null, 1))
}
export function judge(id, did, checks, pics = [], partial = false) {
  const bad = checks.filter(c => !c[1])
  const saw = checks.map(c => `${c[1] ? 'OK' : 'NO'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 220) + ']' : ''}`).join(' | ')
  rec(id, did, saw, bad.length ? 'FAIL' : partial ? 'PARTIAL' : 'PASS', pics)
  return !bad.length
}

/* ---------- gestures ---------- */
export async function drag(page, from, to, steps = 10) {
  await page.mouse.move(from.x, from.y); await page.mouse.down()
  await page.mouse.move(to.x, to.y, { steps }); await page.mouse.up()
}
/* a real finger, over CDP */
export async function cdp(page) { return page.context().newCDPSession(page) }
export async function touchDrag(page, from, to, steps = 10) {
  const c = await cdp(page)
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] })
  for (let i = 1; i <= steps; i++) {
    await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * i / steps, y: from.y + (to.y - from.y) * i / steps }] })
    await sleep(16)
  }
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await c.detach().catch(() => {})
}
/* what is at the centre of a locator */
export async function hitAt(page, loc) {
  const b = await loc.boundingBox()
  if (!b) return { none: true }
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  return page.evaluate(([x, y, sel]) => {
    const h = document.elementFromPoint(x, y)
    if (!h) return { x, y, hit: null }
    const w = h.closest('.floatwin')
    return { x: Math.round(x), y: Math.round(y), hit: (h.tagName + (h.className && typeof h.className === 'string' ? '.' + h.className.split(' ')[0] : '')), inWin: w ? (w.getAttribute('data-testid') || w.className) : null, inTarget: !!(h.closest(sel)) }
  }, [x, y, '[data-hit]'])
}
export async function active(page) {
  return page.evaluate(() => { const a = document.activeElement; if (!a) return 'none'; return a.tagName + (a.id ? '#' + a.id : '') + (a.getAttribute('data-testid') ? '[' + a.getAttribute('data-testid') + ']' : '') + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : '') })
}
export async function openWins(page) {
  return page.evaluate(() => [...document.querySelectorAll('.floatwin')].map(w => w.getAttribute('data-testid') || w.className))
}
export function picCount() { return NPIC }
