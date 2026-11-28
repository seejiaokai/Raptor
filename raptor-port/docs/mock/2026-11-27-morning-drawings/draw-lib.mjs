/* The morning drawings (27 Nov 26) — the real app, served from the end-time-guard build, with one line drawn in by
   editing the page in the browser. Nothing in the app's code changes. Shared helpers for legend.mjs and oil.mjs. */
import { chromium, webkit, devices } from 'file:///C:/Users/User/projects/Raptor-endtime/raptor-port/node_modules/playwright/index.mjs'

export const BASE = process.env.DRAW_URL || 'http://127.0.0.1:4257'
export const OUT = 'C:/Users/User/projects/Raptor-readings/raptor-port/docs/mock/2026-11-27-morning-drawings'
export const sleep = (ms) => new Promise(r => setTimeout(r, ms))
export const L = (...a) => console.log(a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '))

/** dev: 'D' desktop 1536 Chromium; 'P' iPhone 402 WebKit touch */
export async function open(dev = 'D', who = 'a') {
  let browser, ctx
  if (dev === 'P') {
    browser = await webkit.launch()
    ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
  } else {
    browser = await chromium.launch()
    ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
  }
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  await page.goto(BASE + '/?fresh=1')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  return { browser, ctx, page, errors, dev }
}
export async function login(page, who = 'a') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
}
export async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await page.waitForTimeout(500)
}
export async function press(page, loc, { force = false } = {}) {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(150)
  const isTouch = await page.evaluate(() => matchMedia('(pointer: coarse)').matches)
  if (isTouch) await loc.tap({ force })
  else await loc.click({ force })
}
export async function setTxt(page, key, val, scope = '#eWeek') {
  const el = page.locator(`${scope} [data-txt="${key}"]`).first()
  await press(page, el)
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
  if (val) await page.keyboard.type(val, { delay: 10 })
  await page.keyboard.press('Tab')
  await sleep(400)
}
export function signPill(page, di, role, scope = '#eWeek') {
  return page.locator(`${scope} select[data-signday="${di}"][data-sign="${role}"]:not(:disabled), ${scope} .sgn select[data-signday="${di}"][data-sign="${role}"]`).first().locator('xpath=..')
}
/** a sign-off pick as a person makes it: the select's own option chosen */
export async function sign(page, di, role, val, scope = '#eWeek') {
  const s = page.locator(`${scope} select[data-signday="${di}"][data-sign="${role}"]:visible`).first()
  await s.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await s.selectOption(val)
  await sleep(500)
}
export async function signVals(page, di, scope = '#eWeek') {
  return page.evaluate(({ di, scope }) => [...document.querySelectorAll(`${scope} select[data-signday="${di}"]`)].filter(e => e.offsetParent !== null).map(s => s.dataset.sign + '=' + (s.value || '-') + (s.disabled ? '(dis)' : '')), { di, scope })
}
export async function shot(page, name, clip = null) {
  const path = `${OUT}/${name}.png`
  await page.screenshot({ path, ...(clip ? { clip } : {}) })
  return path
}
/** the thin dashed highlight round an element — for the picture only (a fixed overlay, not part of the element) */
export async function mark(page, sel, pad = 3, textOnly = false) {
  await page.evaluate(({ sel, pad, textOnly }) => {
    document.querySelectorAll('.draw-mark').forEach(e => e.remove())
    const el = document.querySelector(sel); if (!el) return
    let r = el.getBoundingClientRect()
    if (textOnly) { const g = document.createRange(); g.selectNodeContents(el); r = g.getBoundingClientRect() }
    const m = document.createElement('div'); m.className = 'draw-mark'
    Object.assign(m.style, { position: 'fixed', left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + 2 * pad) + 'px', height: (r.height + 2 * pad) + 'px',
      border: '1.5px dashed #1E86FF', borderRadius: '5px', pointerEvents: 'none', zIndex: 2147483647, boxSizing: 'border-box' })
    document.body.appendChild(m)
  }, { sel, pad, textOnly })
}
export async function unmark(page) { await page.evaluate(() => document.querySelectorAll('.draw-mark').forEach(e => e.remove())) }
/** a rectangle round an element, padded, clamped to the viewport */
export async function rectOf(page, sel, pad = 12) {
  return page.evaluate(({ sel, pad }) => {
    const r = document.querySelector(sel).getBoundingClientRect()
    const x = Math.max(0, r.left - pad), y = Math.max(0, r.top - pad)
    return { x, y, width: Math.min(innerWidth, r.right + pad) - x, height: Math.min(innerHeight, r.bottom + pad) - y }
  }, { sel, pad })
}
