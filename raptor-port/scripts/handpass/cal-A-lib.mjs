/* Walker A's shared helpers for the calendar job's check (8 Oct 26). Drives the FROZEN build at LOOK_URL. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const BASE = process.env.LOOK_URL || 'http://localhost:4211/'
export const PICS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-08-inputs-sans-calendar-check/A'
export const OUTJSON = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/cal-A.json'
mkdirSync(PICS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const tid = (page, id) => page.locator(`[data-testid="${id}"]`)

export const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  wide: { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  short: { viewport: { width: 390, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  side: { viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}

export async function world(size = 'desk', who = 'ad') {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`) })
  page.on('dialog', d => { errors.push(`NATIVE DIALOG ${d.message()}`); d.dismiss().catch(() => {}) })
  await page.goto(BASE + '?fresh=1')
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(400)
  const touch = size !== 'desk' && size !== 'wide'
  const press = loc => (touch ? loc.tap() : loc.click())
  return { browser, ctx, page, errors, size, touch, press }
}
export async function toWar(w) {
  await w.page.evaluate(() => window.go('leavewar'))
  await w.page.waitForSelector('[data-testid="row-slipway"]')
  await sleep(500)
}

/* ---- the table ---- */
export const TABLE = []
let SHOTN = 0
export function row(id, did, saw, verdict, pics = [], extra = {}) {
  TABLE.push({ id, did, saw, verdict, pics, ...extra })
  console.log(`== ${verdict}  ${id} — ${did}\n     saw: ${String(saw).slice(0, 900)}`)
}
export async function pic(w, name, full = false) {
  const f = `${w.size}-${String(++SHOTN).padStart(2, '0')}-${name}.png`
  await w.page.mouse.move(0, 0).catch(() => {})
  await w.page.screenshot({ path: join(PICS, f), fullPage: full }).catch(() => {})
  return f
}
export function savePart(name, extra = {}) {
  let all = { parts: {} }
  if (existsSync(OUTJSON)) { try { all = JSON.parse(readFileSync(OUTJSON, 'utf8')) } catch {} }
  if (!all.parts) all.parts = {}
  all.parts[name] = { at: new Date().toISOString(), base: BASE, table: TABLE, ...extra }
  mkdirSync(join(OUTJSON, '..'), { recursive: true })
  writeFileSync(OUTJSON, JSON.stringify(all, null, 1))
  console.log('saved', name)
}
