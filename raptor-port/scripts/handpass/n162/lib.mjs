// n162 - the walk of 24 Nov 26 (chat 162's night questions): subject A (sw-, the Tracker's move failing) and subject B
// (ph-, an Input window held in the member view, on a phone). Shared helpers. Every step presses the app's own controls;
// the page is READ for facts. A stand-in that makes a failure is named where it is installed.
// Run from anywhere: node raptor-port/scripts/handpass/n162/<script>.mjs <size>
// The build is served by the host on 4700 (never started or stopped here).
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

export const URL_ = 'http://localhost:4700/'
const HERE = dirname(fileURLToPath(import.meta.url))
export const PICS = resolve(HERE, '../../../docs/mock/2026-11-24-msq-night-questions/checked')
mkdirSync(PICS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

export const SIZES = {
  d: { desk: true, w: 1536, h: 864 },
  '402x874': { desk: false, w: 402, h: 874 },
  '874x402': { desk: false, w: 874, h: 402 },
  '768x1024': { desk: false, w: 768, h: 1024 },
  '1024x768': { desk: false, w: 1024, h: 768 },
}
let browser = null
export async function mk(sz) {
  const S = SIZES[sz]; if (!S) throw new Error('unknown size ' + sz)
  if (!browser) browser = await chromium.launch(launchOptions)
  const opts = S.desk ? { viewport: { width: S.w, height: S.h }, deviceScaleFactor: 2 }
    : { viewport: { width: S.w, height: S.h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log(`PAGEERROR ${String(e).slice(0, 200)}`))
  page.on('dialog', d => { console.log(`DIALOG ${d.type()}: ${d.message()}`); (d.type() === 'beforeunload' ? d.accept() : d.dismiss()).catch(() => {}) })
  return { ctx, page, sz, desk: S.desk, W: S.w, H: S.h }
}
export async function closeAll() { if (browser) await browser.close().catch(() => {}) }

export function FACT(k, v) { console.log(`FACT ${k}=${JSON.stringify(v)}`) }
export function note(...a) { console.log('  ' + a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ')) }
export function die(msg) { console.error('FAILED: ' + msg); process.exitCode = 1; throw new Error(msg) }

export async function signIn(s, user, pass) {
  const { page } = s
  await page.goto(URL_); await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  await page.addStyleTag({ content: '*{transition:none !important;animation:none !important}' })
  await page.waitForTimeout(600)
}
/* a press as a person makes it: the mouse on a desktop, a finger at the control's middle elsewhere */
export async function press(s, sel, { must = true } = {}) {
  const l = typeof sel === 'string' ? s.page.locator(sel).filter({ visible: true }).first() : sel
  if (!(await l.count())) { if (must) die(`no control to press: ${sel}`); return false }
  if (s.desk) await l.click()
  else if (true) { await l.evaluate(e => { const r = e.getBoundingClientRect(); if (r.top < 70 || r.bottom > innerHeight) e.scrollIntoView({ block: 'center' }) }); await s.page.waitForTimeout(150); const b = await l.boundingBox(); await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
  else { const b = await l.boundingBox(); await s.page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }
  await s.page.waitForTimeout(350)
  return true
}
/* what is at a control's middle: 'free' or what covers it */
export const covered = (s, sel) => s.page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
  if (!e) return 'not drawn'
  const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2
  if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return `off screen at ${Math.round(x)},${Math.round(y)}`
  const t = document.elementFromPoint(x, y)
  return t && (t === e || e.contains(t)) ? 'free' : `covered by ${t?.tagName.toLowerCase()}${t?.id ? '#' + t.id : ''}${t?.className && typeof t.className === 'string' ? '.' + t.className.trim().split(/\s+/).slice(0, 3).join('.') : ''}`
}, sel)
export const boxOf = (s, sel) => s.page.evaluate(sel => {
  const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
  if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
}, sel)
export async function pic(s, name, clipSels, pad = 12) {
  const { page } = s
  if (s.desk) await page.mouse.move(1, 1).catch(() => {})
  await page.waitForTimeout(150)
  let clip
  if (clipSels) {
    const r = await page.evaluate(sels => {
      let L = 1e9, T = 1e9, R = -1e9, B = -1e9
      for (const sel of sels) for (const e of document.querySelectorAll(sel)) { const b = e.getBoundingClientRect(); if (!(b.width > 0 && b.height > 0)) continue; L = Math.min(L, b.left); T = Math.min(T, b.top); R = Math.max(R, b.right); B = Math.max(B, b.bottom) }
      return L < 1e9 ? { L, T, R, B, W: innerWidth, H: innerHeight } : null
    }, clipSels)
    if (r) { const x = Math.max(0, r.L - pad), y = Math.max(0, r.T - pad); clip = { x, y, width: Math.max(10, Math.min(r.W, r.R + pad) - x), height: Math.max(10, Math.min(r.H, r.B + pad) - y) } }
  }
  await page.screenshot({ path: `${PICS}/${name}.png`, ...(clip ? { clip } : {}) })
  note('picture', `${name}.png`)
}
/* a red outline round a control, drawn only for one picture and removed after */
export async function picMarked(s, name, sel) {
  const ok = await s.page.evaluate(sel => {
    const e = [...document.querySelectorAll(sel)].find(n => { const r = n.getBoundingClientRect(); return r.width > 1 && r.height > 1 })
    if (!e) return false
    const r = e.getBoundingClientRect(), d = document.createElement('div')
    d.id = '__n162mark'
    Object.assign(d.style, { position: 'fixed', left: (r.left - 4) + 'px', top: (r.top - 4) + 'px', width: (r.width + 8) + 'px', height: (r.height + 8) + 'px', outline: '3px solid red', zIndex: 2147483647, pointerEvents: 'none' })
    document.body.appendChild(d); return true
  }, sel)
  await pic(s, name)
  await s.page.evaluate(() => document.getElementById('__n162mark')?.remove())
  return ok
}
/* the top bar's warning bands, as drawn */
export const bands = s => s.page.evaluate(() => {
  const out = []
  for (const e of document.querySelectorAll('body *')) {
    if (e.children.length > 3) continue
    const b = e.getBoundingClientRect(); if (b.width < 2 || b.height < 2) continue
    const c = getComputedStyle(e); if (c.visibility === 'hidden' || c.display === 'none') continue
    const t = (e.textContent || '').replace(/\s+/g, ' ').trim()
    if (/^(Not saved|Not kept)|Not saved —|Not kept —/.test(t) && t.length < 200) out.push(t)
  }
  /* and the app's own save-status places, whatever they say */
  for (const e of document.querySelectorAll('.saveband, .savestat')) { const b = e.getBoundingClientRect(); if (b.width > 1 && b.height > 1) out.push('[' + e.className + '] ' + e.textContent.replace(/\s+/g, ' ').trim()) }
  return [...new Set(out)]
})
/* which squadron the top bar shows */
export const barSq = s => s.page.evaluate(() => {
  const shown = e => { if (!e) return false; const b = e.getBoundingClientRect(); return b.width > 1 && b.height > 1 }
  const m = [...document.querySelectorAll('.topbar .mark, .drawer-sqn .mark')].find(shown)
  return m ? m.textContent.replace(/\s+/g, ' ').trim() : null
})
export const pageOn = s => s.page.evaluate(() => document.querySelector('.page.on')?.id || null)
/* a page by its name: the top bar's tab where drawn, else the ☰ menu's line */
export async function go(s, name) {
  const tab = s.page.locator(`#topnav a[data-page="${name}"]`).filter({ visible: true })
  if (await tab.count()) { await press(s, tab.first()); await s.page.waitForTimeout(400); return }
  await press(s, '#burger'); await s.page.waitForTimeout(300)
  await press(s, `#drawerNav a[data-page="${name}"]`)
  await s.page.waitForTimeout(400)
  await shut(s)
}
export async function shut(s) {
  for (let i = 0; i < 3; i++) {
    const open = await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))
    if (!open) return
    if (s.desk) await s.page.mouse.click(s.W - 8, 500); else await s.page.touchscreen.tap(s.W - 8, Math.min(500, s.H - 20))
    await s.page.waitForTimeout(400)
  }
}
/* the squadron pick by the top bar's list (desktop) or the ☰ menu's (elsewhere) */
export async function pickSq(s, num) {
  const { page } = s
  const re = new RegExp(`^${num}$`)
  if (await page.locator('#sqnMenuBtn').filter({ visible: true }).count()) {
    await press(s, '#sqnMenuBtn')
    await press(s, page.locator('#sqnMenu .sqm-row', { has: page.locator('.sqm-num', { hasText: re }) }).first())
  } else {
    await press(s, '#burger'); await page.waitForTimeout(300)
    if (!(await page.locator('#drawerSqnList').count())) await press(s, '#drawerSqnBtn')
    await press(s, page.locator('#drawerSqnList .sqm-row', { has: page.locator('.sqm-num', { hasText: re }) }).first())
    await shut(s)
  }
  await page.waitForTimeout(700)
}
