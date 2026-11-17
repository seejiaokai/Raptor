// walk library for the cal-wheel-drag walk (17 Nov 26). Version 1.
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const require = createRequire(process.cwd() + '/package.json')
const { chromium } = require('@playwright/test')
export const HERE = path.dirname(fileURLToPath(import.meta.url))
export const BASE = 'http://localhost:4192/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launch = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export async function world(browser, kind, outDir) {
  const opts = kind === 'desk'
    ? { baseURL: BASE, viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 }
    : { baseURL: BASE, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
  const context = await browser.newContext(opts)
  const page = await context.newPage()
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + String(e)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`http ${r.status()} ${r.url()}`) })
  await login(page)
  return { context, page, errs, kind, touch: kind !== 'desk' }
}

export async function login(page) {
  await page.goto('/')
  await page.waitForSelector('#luser')
  await page.evaluate(d => { if (typeof window.lwSetMemberToday === 'function') window.lwSetMemberToday(d) }, '2000-01-01')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
}
export async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await page.waitForTimeout(350)
}
export const press = async (w, sel) => { const l = w.page.locator(sel).first(); if (w.touch) await l.tap(); else await l.click() }
export const rect = (page, sel) => page.locator(sel).first().evaluate(el => { const b = el.getBoundingClientRect(); return { l: +b.left.toFixed(1), t: +b.top.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) } })
export const listTop = (page, sel) => page.locator(sel).first().evaluate(el => el.scrollTop)

export async function mouseDrag(page, sel, dy, steps, hold = 0, upX) {
  const r = await rect(page, sel)
  const x = r.l + r.w / 2, y = r.t + r.h / 2
  await page.mouse.move(x, y); await page.mouse.down()
  await page.mouse.move(x, y + dy, { steps })
  if (hold) await page.waitForTimeout(hold)
  if (upX != null) await page.mouse.move(upX, y + dy, { steps: 2 })
  await page.mouse.up()
}
/** returns {top, whole, settled} */
export async function atRest(page, sel) {
  let last = -1, still = 0
  for (let i = 0; i < 40; i++) {
    const t = await listTop(page, sel)
    if (t === last) { if (++still >= 2) break } else still = 0
    last = t
    await page.waitForTimeout(150)
  }
  const t = await listTop(page, sel)
  return { top: t, whole: Math.abs(t / 44 - Math.round(t / 44)) < 0.05, settled: still >= 2 }
}
export async function fingerSwipe(cdp, x, y, dyTotal, moves = 8, wait = 150) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  for (let i = 1; i <= moves; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + dyTotal * i / moves }] })
  await sleep(wait)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}
export function ensure(dir) { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }) }
