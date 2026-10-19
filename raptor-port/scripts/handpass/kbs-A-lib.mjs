/* Walker A's shared helpers for [KEYBOARD-SCROLL] (19 Oct 26). Phone with a stand-in visualViewport. */
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { chromium } from '@playwright/test'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
export const SHOTS = path.join(ROOT, 'docs/img/handpass/2026-10-19-keyboard-scroll/walk/A')
export const RESULTS = path.join(ROOT, 'scripts/handpass/kbs-A-results.jsonl')
mkdirSync(SHOTS, { recursive: true })
const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CH) ? { executablePath: CH } : {}
export const BASE = 'http://localhost:4333/'
export const KB = 336, GAP = 8

export const stubInit = () => {
  class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
  const f = new FakeVV()
  Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f })
  window.__vv = f
}

export async function open({ width = 402, height = 874, mobile = true, stub = true, who = 'a', login = true } = {}) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({
    viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 3 : 1, colorScheme: 'dark',
  })
  if (stub) await ctx.addInitScript(stubInit)
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  if (login) await signIn(page, who)
  return { browser, ctx, page, errors }
}

export async function signIn(page, who = 'a') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
}
export async function go(page, p) {
  await page.evaluate(x => window.go(x), p)
  await page.waitForFunction(x => window.CURPAGE === x, p)
  await page.waitForTimeout(500)
}
export const version = (n) => console.log(`kbs-A ${n} v1 ${new Date().toISOString()}`)

export const keysUp = async (page, kb = KB) => {
  await page.evaluate(k => { const v = window.__vv; v.height = innerHeight - k; v.dispatchEvent(new Event('resize')) }, kb)
  await page.waitForTimeout(300)
}
export const keysDown = async (page) => {
  await page.evaluate(() => { const v = window.__vv; v.height = innerHeight; v.dispatchEvent(new Event('resize')) })
  await page.waitForTimeout(400)
}

/** state of the page: scroll, vv, window translates up the ancestors of `el` (a handle) */
export async function state(page, handle) {
  return page.evaluate((e) => {
    const r = e ? e.getBoundingClientRect() : null
    const tr = []
    for (let n = e; n; n = n.parentElement) { if (n.style && n.style.translate) tr.push((n.id || n.className || n.tagName) + ':' + n.style.translate) }
    // any element in the doc with a translate style
    const anyT = [...document.querySelectorAll('[style*="translate"]')].filter(x => x.style.translate).map(x => (x.id || String(x.className).slice(0, 30) || x.tagName) + ':' + x.style.translate)
    const cx = r ? r.x + r.width / 2 : 0, cy = r ? r.y + r.height / 2 : 0
    const top = r ? document.elementFromPoint(cx, cy) : null
    const covered = r ? !(top && (top === e || e.contains(top))) : null
    return {
      rect: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), bottom: Math.round(r.bottom) } : null,
      ih: innerHeight, vvh: window.__vv ? window.__vv.height : null, vvScale: window.__vv ? window.__vv.scale : null,
      pageScroll: document.scrollingElement.scrollTop,
      translatesUp: tr, translatesAny: anyT,
      focused: r ? (document.activeElement === e) : null,
      active: document.activeElement ? (document.activeElement.tagName + '#' + document.activeElement.id + '.' + String(document.activeElement.className).slice(0, 30)) : null,
      covered, coverBy: top ? (top.tagName + '#' + top.id + '.' + String(top.className).slice(0, 30)) : null,
    }
  }, handle ? await handle.elementHandle() : null)
}

/** find the scrolling ancestor of a box and scroll so its centre sits at y (default innerHeight-60) */
export async function bringLow(handle, y = 800) {
  return handle.evaluate((e, yy) => {
    let sc = e.parentElement
    while (sc && !(/(auto|scroll)/.test(getComputedStyle(sc).overflowY) && sc.scrollHeight > sc.clientHeight + 1)) sc = sc.parentElement
    const s = sc || document.scrollingElement
    const r = e.getBoundingClientRect()
    s.scrollTop += (r.top + r.height / 2) - yy
    const r2 = e.getBoundingClientRect()
    return { scroller: sc ? (sc.id || String(sc.className).slice(0, 40) || sc.tagName) : 'page', centre: Math.round(r2.top + r2.height / 2), bottom: Math.round(r2.bottom) }
  }, y)
}

export async function tapBox(page, handle) {
  const b = await handle.boundingBox()
  await page.touchscreen.tap(b.x + b.width / 2, b.y + Math.min(b.height / 2, 10))
}
export const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png') })

/** the standard check once keys are up */
export function judge(st, { ih = 874, kb = KB, tall = false, pageBefore = null, inWindow = false } = {}) {
  const room = ih - kb
  const notes = []
  let ok = true
  if (!st.focused) { ok = false; notes.push('NOT focused (active=' + st.active + ')') }
  const r = st.rect
  if (!r) { ok = false; notes.push('no rect'); return { ok, notes } }
  if (r.bottom > room - GAP + 1) { if (!tall) { ok = false; notes.push(`bottom ${r.bottom} > ${room - GAP}`) } }
  if (r.top < 0 + GAP - 1) { if (!tall) { ok = false; notes.push(`top ${r.top} < visible top+8`) } }
  if (tall && !(r.top >= 0 && r.top < room)) { ok = false; notes.push('tall box top not in sight ' + r.top) }
  if (st.covered) { ok = false; notes.push('covered by ' + st.coverBy) }
  if (inWindow && pageBefore !== null && st.pageScroll !== pageBefore) { ok = false; notes.push(`page scrolled ${pageBefore}->${st.pageScroll}`) }
  return { ok, notes }
}

export function record(obj) {
  appendFileSync(RESULTS, JSON.stringify(obj) + '\n')
  console.log('RESULT', JSON.stringify(obj))
}
