// W1 walker library — copied in spirit from scripts/handpass/odc-look.mjs; drives http://localhost:4187/ (already served).
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..', '..', '..')
export const OUT = join(ROOT, 'docs/img/handpass/2026-10-13-one-date-calendar/w1')
mkdirSync(OUT, { recursive: true })
export const URL0 = 'http://localhost:4187/'
export const results = []   // {id, size, verdict, note, pic}
export const errors = []
export const seen = []

export async function start(W, H) {
  const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()} ${r.url().slice(0, 120)}`) })
  const cdp = await ctx.newCDPSession(page)
  const L = { browser, ctx, page, cdp, W, H }
  await page.goto(URL0)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  return L
}
export async function signInAgain(L) {
  const { page } = L
  await page.waitForTimeout(800)
  if (await page.locator('#luser').isVisible().catch(() => false)) {
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  }
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
}
export const rec = (id, size, verdict, note, pic = '') => { results.push({ id, size, verdict, note, pic }); console.log(`[${id}] ${size} ${verdict} — ${note}${pic ? '  (' + pic + ')' : ''}`) }
export const pass = (id, size, ok, note, pic) => rec(id, size, ok ? 'PASS' : 'FAIL', note, pic)

export async function shot(L, name) { const f = `${name}.png`; await L.page.screenshot({ path: join(OUT, f) }); return f }
export const press = async (L, sel, ms = 260) => { await L.page.locator(sel).first().tap(); await L.page.waitForTimeout(ms) }
export const vis = (L, sel) => L.page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }, sel)
export const rect = (L, sel) => L.page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } }, sel)
export const text = async (L, sel) => (await L.page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim()

/* a real finger. Starts at an absolute point (x0,y0), or at a selector's reachable part. Rests ~90ms before it lifts. */
export async function swipeFrom(L, x0, y0, dx, dy = 0) {
  const { cdp, page } = L
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] })
  for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * i / 6, y: y0 + dy * i / 6 }] })
  await page.waitForTimeout(90)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(380)
}
/* swipe starting at the centre of a selector's box (or at a fraction of it) */
export async function swipeOn(L, sel, dx, dy = 0, fx = 0.5, fy = 0.5, nth = 0) {
  const b = await L.page.evaluate(([s, n]) => {
    const e = document.querySelectorAll(s)[n]; if (!e) return null
    e.scrollIntoView({ block: 'nearest' })
    const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }
  }, [sel, nth])
  if (!b) throw new Error('no element ' + sel)
  await L.page.waitForTimeout(150)
  const b2 = await L.page.evaluate(([s, n]) => { const r = document.querySelectorAll(s)[n].getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height } }, [sel, nth])
  const x0 = b2.l + b2.w * fx - dx / 2, y0 = b2.t + b2.h * fy
  await swipeFrom(L, x0, y0, dx, dy)
  return { x0: Math.round(x0), y0: Math.round(y0) }
}

export async function openCalendarWindow(L) {
  const { page } = L
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(300)
  await press(L, '#inGear'); await press(L, '[data-testid="iset-days"]')
  if (await vis(L, '[data-testid="win-inputsset-x"]')) await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click())
  await page.waitForSelector('[data-testid="win-days"]')
  await page.waitForTimeout(300)
}
export async function cardOnTop(L, name) {
  const { page, W, H } = L
  await page.waitForSelector('[data-testid="dcal-card"]', { timeout: 3000 })
  await page.waitForTimeout(250)
  const r = await page.evaluate(() => {
    const c = document.querySelector('[data-testid="dcal-card"]'); const b = c.getBoundingClientRect()
    const at = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && (h === c || c.contains(h)) }
    return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height),
      centre: at(b.left + b.width / 2, b.top + b.height / 2), corners: [at(b.left + 6, b.top + 6), at(b.right - 6, b.top + 6), at(b.left + 6, b.bottom - 6), at(b.right - 6, b.bottom - 6)],
      month: document.querySelector('[data-testid="dcal"]').getAttribute('data-month') }
  })
  r.onScreen = r.l >= 0 && r.t >= 0 && r.r <= W && r.b <= H
  r.onTop = r.centre && r.corners.every(Boolean)
  r.name = name
  return r
}
export function summary(file, extra) {
  console.log(`\nSUMMARY ${file}: ` + ['PASS', 'FAIL', 'RECORD', 'NOT WALKED'].map(v => `${v} ${results.filter(r => r.verdict === v).length}`).join(' · '))
  console.log('ERRORS: ' + (errors.length ? errors.join(' | ') : 'none'))
}
