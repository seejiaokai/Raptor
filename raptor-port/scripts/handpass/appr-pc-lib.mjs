// The Approvals page on a PC — the walk's shared helpers (13 Nov 26, [APPROVALS-SCROLL-INSIDE], his D2006, D2008).
// Every setting comes from the environment from the first line (walk-scripts.md §1), so a script re-runs unchanged into
// a new folder and on another build:
//   APPR_DIST    the built folder to serve (required) — served from inside the test browser, no server, no port held
//   APPR_ORIGIN  the address it is served at (default http://localhost:4291 — the app's test hooks answer only on localhost)
//   APPR_OUT     the picture folder (required by the scripts that take pictures)
// Run from raptor-port/.
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { serveDist } from '../drawcheck/lib.mjs'

const require = createRequire(new URL('../../package.json', import.meta.url))
export const { chromium, webkit, devices } = require('@playwright/test')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const DIST = process.env.APPR_DIST
export const ORIGIN = process.env.APPR_ORIGIN || 'http://localhost:4291'
export const OUT = process.env.APPR_OUT ? path.resolve(process.env.APPR_OUT) : null
if (!DIST || !existsSync(path.join(DIST, 'index.html'))) throw new Error('APPR_DIST must name a built folder (index.html in it): ' + DIST)
if (OUT) mkdirSync(OUT, { recursive: true })
/* the war's today inside the demo's open dates (Jan – Mar 26) — the drawing script's own day (appr-scroll-draw.mjs) */
export const LW_TODAY = '2026-01-05'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const T = id => `[data-testid="${id}"]`
export const PAGE = T('approvals-page')

/* A REAL browser window STARTED at his PC's 125% (lesson 31): no screen size emulated, so the page's own height can be a
   fraction, as on his screen. `w`, `h` are the window's size as the browser is told it. Headed by default (a real window);
   APPR_HEADLESS=1 runs it headless, which the sheet must then say. */
export async function launchReal125({ w = 1920, h = 917, scale = 1.25 } = {}) {
  const headless = process.env.APPR_HEADLESS === '1'
  const browser = await chromium.launch({ ...LAUNCH, headless, args: [`--force-device-scale-factor=${scale}`, `--window-size=${w},${h}`, '--window-position=0,0'] })
  const ctx = await browser.newContext({ viewport: null })
  await serveDist(ctx, ORIGIN, DIST)
  const page = await ctx.newPage()
  return { browser, ctx, page, headless }
}
/* his iPhone's size in WebKit (the iPhone's engine) or Chromium: 402 × 874, touch, at 3x */
export async function launchPhone(engine = 'webkit') {
  const eng = engine === 'webkit' ? webkit : chromium
  const browser = await eng.launch(engine === 'webkit' ? {} : LAUNCH)
  const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: engine === 'chromium' ? true : true })
  await serveDist(ctx, ORIGIN, DIST)
  const page = await ctx.newPage()
  return { browser, ctx, page }
}
/* an emulated desktop (only where a real window adds nothing — say so) */
export async function launchDesk({ width = 1536, height = 733, dpr = 1.25 } = {}) {
  const browser = await chromium.launch(LAUNCH)
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr })
  await serveDist(ctx, ORIGIN, DIST)
  const page = await ctx.newPage()
  return { browser, ctx, page }
}
export function watchErrors(page, list) {
  page.on('pageerror', e => list.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') list.push('console: ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) list.push(`http ${r.status()}: ${r.url().slice(0, 120)}`) })
}

export async function signIn(page, who = 'admin') {
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(ORIGIN + '/')
  await page.waitForSelector('#luser')
  await page.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), LW_TODAY)
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(t => window.lwSetMemberToday && window.lwSetMemberToday(t), LW_TODAY)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]', { state: 'attached', timeout: 20000 })
  await sleep(800)
}
export async function logout(page) { await page.evaluate(() => document.querySelector('#logout')?.click()); await page.waitForSelector('#luser', { timeout: 15000 }) }
export async function openApprovals(page) {
  await page.locator(T('lw-tab-approvals')).first().click()
  await page.waitForSelector(PAGE, { state: 'visible' }); await sleep(600)
}
/* THE DRAWING'S WORLD (appr-scroll-draw.mjs stageWorld, the same doors): an admin's visit first, then the member files three
   bids of his own (they come back as new), then the admin places six more — 19 lines on Approvals. Returns the line count. */
export async function stageWorld(page) {
  await signIn(page, 'admin')
  await openApprovals(page)
  await page.locator(T('lw-tab-grid')).first().click(); await sleep(400)
  await logout(page)
  await signIn(page, 'member')
  const mine = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4))
    const dates = ['2026-01-07', '2026-02-11', '2026-03-04']
    for (const id of ids) if (window.lwSetCell(id, dates[0], 'LL')) { dates.slice(1).forEach(d => window.lwSetCell(id, d, 'LL')); return id }
    return null
  })
  if (!mine) throw new Error('staging: the member could place no bid')
  await sleep(500)
  await logout(page)
  await signIn(page, 'admin')
  const placed = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4))
    const pick = ['dice', 'shaft', 'snap', 'pump', 'mamba', 'nact']
    return pick.filter(id => ids.includes(id)).map((id, i) => window.lwSetCell(id, `2026-02-${String(16 + i).padStart(2, '0')}`, i % 2 ? 'CCL' : 'LL'))
  })
  if (placed.filter(Boolean).length !== 6) throw new Error('staging: the admin placed ' + placed.filter(Boolean).length + ' of 6 bids')
  await sleep(500)
  await openApprovals(page)
  return page.evaluate(sel => document.querySelectorAll(`${sel} [data-testid^="appr-line-"]`).length, PAGE)
}

/* What the page is, measured: the screen's true height, the window's room to scroll, the page, card, scroller and pinned
   headings' boxes, the scroller's place. Nothing in it assumes the build: on main there is no scroller (scroller null). */
export const geo = page => page.evaluate(sel => {
  const q = s => document.querySelector(`${sel} ${s}`)
  const box = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { top: +r.top.toFixed(2), bottom: +r.bottom.toFixed(2), h: +r.height.toFixed(2), left: +r.left.toFixed(2), w: +r.width.toFixed(2) } }
  const vv = window.visualViewport
  const se = document.scrollingElement
  const sc = q('.appr-scroll')
  return {
    inner: innerHeight, innerW: innerWidth, trueH: vv ? +(vv.height * vv.scale).toFixed(3) : null, dpr: devicePixelRatio,
    winY: scrollY, winRoom: +(se.scrollHeight - se.clientHeight).toFixed(2), docH: se.scrollHeight,
    bodyClass: document.body.className, pageStyleH: document.querySelector(sel)?.style.height || '',
    page: box(document.querySelector(sel)), card: box(q('.appr-card')), head: box(q('.appr-head')), filters: box(q('.appr-filters')),
    cols: box(q('.appr-cols')), scroller: box(sc), list: box(q('.appr-list')),
    sc: sc ? { top: sc.scrollTop, room: sc.scrollHeight - sc.clientHeight, ch: sc.clientHeight } : null,
    lines: document.querySelectorAll(`${sel} [data-testid^="appr-line-"]`).length,
  }
}, PAGE)

/* a picture, and its file name returned; only when APPR_OUT is set */
export async function pic(page, name) {
  if (!OUT) return null
  const f = path.join(OUT, name + '.png')
  await page.screenshot({ path: f })
  return f
}
export function writeLog(name, lines) { if (OUT) writeFileSync(path.join(OUT, name), lines.join('\n') + '\n') }
