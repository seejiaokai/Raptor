/* Chat 29 walk helpers (8 Nov 26): the browser (the repo's fallback), the sign-in, the pictures, the steps. */
import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
export const OUT = join(HERE, '..', '..', 'docs', 'img', 'handpass', '2026-11-08-chat29-inputs-medical')
export const BASE = process.env.HP_URL || 'http://localhost:4233'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const errors = []
export const results = []
let shotN = Number(process.env.SHOT_START || 0)

export function freshFolder() {
  mkdirSync(OUT, { recursive: true })
  if (!process.env.KEEP) for (const f of readdirSync(OUT)) if (f.endsWith('.png')) unlinkSync(join(OUT, f))
}

export async function open({ width = 1536, height = 864, phone = false, scale = 1 } = {}) {
  const browser = await chromium.launch({ headless: true, ...launchOptions, args: scale !== 1 ? [`--force-device-scale-factor=${scale}`] : [] })
  const ctx = await browser.newContext({ viewport: { width, height }, ...(phone ? { isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : {}) })
  const page = await ctx.newPage()
  const tag = `${width}x${height}${phone ? 'p' : ''}`
  page.on('console', m => { if (m.type() === 'error') errors.push(`[${tag}] console: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`[${tag}] PAGEERROR ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`[${tag}] HTTP ${r.status()} ${r.url()}`) })
  await page.goto(BASE + '/')
  await login(page)
  return { browser, ctx, page, phone }
}
export async function login(page, who = 'ad') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who)
  await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(500)
}
export async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await sleep(400)
}
export async function press(h, sel, opts = {}) {
  const l = h.page.locator(sel).first()
  if (h.phone) await l.tap(opts); else await l.click(opts)
}
export async function shot(page, name, clip) {
  shotN++
  const file = `${String(shotN).padStart(2, '0')}-${name}.png`
  await page.screenshot({ path: join(OUT, file), ...(clip ? { clip } : {}) })
  return file
}
export async function shotOf(page, name, sel, pad = 40) {
  const b = await page.locator(sel).first().boundingBox()
  const vp = page.viewportSize()
  if (!b) return shot(page, name)
  const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
  const clip = { x, y, width: Math.min(vp.width - x, b.width + 2 * pad), height: Math.min(vp.height - y, b.height + 2 * pad) }
  return shot(page, name, clip)
}
/* a step: fn returns { ok, note, pics }, or throws (a FAIL with the message) */
export async function step(id, text, fn) {
  if (process.env.ONLY && !process.env.ONLY.split(',').some(p => id.startsWith(p))) return
  let r
  try { r = await fn() } catch (e) { r = { ok: false, note: 'THREW ' + String(e.message).split('\n')[0] } }
  const row = { id, text, ok: r.ok === 'na' ? 'NOT WALKED' : r.ok ? 'PASS' : 'FAIL', note: r.note || '', pics: r.pics || [] }
  results.push(row)
  console.log(`${row.ok} ${id} ${text} | ${row.note} | ${row.pics.join(', ')}`)
  return r
}
export const rect = (page, sel) => page.locator(sel).first().evaluate(el => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height } })
