/* msq-s4w shared helpers v1 (26 Nov 26) — multi-squadron section 4, the Leave War's posting sheet in way C: the walk
   (chat 201; branch claude/msq-s4-posting-3ba6fa, pull request 852). Evidence: docs/handpass/2026-11-26-msq-s4-posting.md.
   Built on msq-lib.mjs's proven route (18 Nov 26): each run is its OWN WORLD — a new browser and context, real storage
   (never ?fresh=1), the frozen build served from INSIDE the test browser (every request to http://localhost:<port>
   answered from the frozen folder, index.html the fallback) — no server, no port held, several walkers on one build.
   What is new here: any size (width, height, touch, scale, engine), the Leave War opened the way e2e/app.ts opens it,
   and a "before" build (main) served the same way for the "as on main today" comparisons.
   Settings, read once at the top (every walker sets its own):
     S4W_DIST     the frozen folder of this branch's build     S4W_BUNDLE  its bundle's file name (refused otherwise)
     S4W_MAIN     the frozen folder of origin/main's build      S4W_MAIN_BUNDLE  its bundle's file name
     S4W_PORT     the walker's own localhost port number (4753–4756; nothing listens there — the browser answers)
     S4W_WHO      the walker's picture sub-folder (host, wa, wb, wc, wd)     S4W_RUN  the run's own sub-folder */
import { mkdirSync, appendFileSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, extname, join } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
export const DIST = process.env.S4W_DIST || ''
export const BUNDLE = process.env.S4W_BUNDLE || ''
export const MAIN_DIST = process.env.S4W_MAIN || ''
export const MAIN_BUNDLE = process.env.S4W_MAIN_BUNDLE || ''
export const PORT = process.env.S4W_PORT || '4753'
export const BASE = 'http://localhost:' + PORT
export const WHO = process.env.S4W_WHO || 'host'
export const RUN = process.env.S4W_RUN || 'run'
export const SHOTS = resolve(ROOT, 'docs/img/handpass', '2026-11-26-msq-s4-walk', WHO, RUN)
const req = createRequire(resolve(ROOT, 'package.json'))
const { chromium, webkit } = req('@playwright/test')
mkdirSync(SHOTS, { recursive: true })
export const LOG = resolve(SHOTS, 'log.txt')
export function say(...a) { const s = a.join(' '); console.log(s); try { appendFileSync(LOG, s + '\n') } catch {} }
say('msq-s4w-lib v1', 'who=' + WHO, 'run=' + RUN, 'port=' + PORT)
export const nrm = s => String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const ACCOUNTS = { ad: 'a', us: 'us', ad2: 'a2', ad9: 'a9', us9: 'us9' }

export const rows = []   // report rows: [scenario, size, did, expected, saw, verdict, pic]
export function row(sc, size, did, exp, saw, verdict, pic = '') {
  rows.push([sc, size, did, exp, saw, verdict, pic])
  say(`ROW ${verdict} | ${sc} | ${size} | ${did} | saw: ${String(saw).slice(0, 400)}`)
  try { writeFileSync(SHOTS + '/rows.json', JSON.stringify(rows, null, 1)) } catch {}
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }

async function serveFrozen(ctx, dist, bundle) {
  if (!dist || !existsSync(join(dist, 'assets', bundle))) throw new Error('frozen folder missing its bundle: ' + dist + ' ' + bundle)
  await ctx.route(BASE + '/**', async route => {
    const u = new URL(route.request().url())
    const p = decodeURIComponent(u.pathname)
    let f = join(dist, p)
    if (p === '/' || !existsSync(f) || statSync(f).isDirectory()) f = join(dist, 'index.html')
    await route.fulfill({ status: 200, body: readFileSync(f), headers: { 'content-type': TYPES[extname(f)] || 'application/octet-stream' } })
  })
}

/** sign in through the sign-in card: user is a seeded name (ad = Saber admin, us = Ranger member) */
export async function login(page, user) {
  await page.waitForSelector('#luser', { timeout: 20000 })
  await page.fill('#luser', user)
  await page.fill('#lpass', ACCOUNTS[user] ?? user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(600)
}

/** The sizes the walk uses. PHONE is his iPhone: 402×874, scale 3, touch. */
export const SIZES = {
  phone: { width: 402, height: 874, scale: 3, touch: true },
  side: { width: 874, height: 402, scale: 3, touch: true },
  desk: { width: 1440, height: 900, scale: 1, touch: false },
  narrow: { width: 720, height: 900, scale: 1, touch: false },
  mid: { width: 1024, height: 768, scale: 1, touch: false },
}

/** A fresh world. size: a SIZES key or {width,height,scale,touch}; engine: 'chromium' | 'webkit';
    build: 'branch' (default) or 'main' (the "as on main today" build); user: the first sign-in (null: none);
    clock: an ISO time to start the browser clock at, left RUNNING (walk-scripts §1) — omitted: the real time;
    noCounters: true (default) lays no demo manning counters, as e2e/app.ts openLeaveWar does. */
export async function open({ size = 'desk', engine = 'chromium', build = 'branch', user = 'ad', clock = null, noCounters = true } = {}) {
  const s = typeof size === 'string' ? SIZES[size] : size
  const browser = engine === 'webkit' ? await webkit.launch() : await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: s.scale || 1,
    isMobile: !!s.touch && engine !== 'firefox', hasTouch: !!s.touch })
  if (clock) await ctx.clock.install({ time: new Date(clock) })
  const dist = build === 'main' ? MAIN_DIST : DIST, bundle = build === 'main' ? MAIN_BUNDLE : BUNDLE
  await serveFrozen(ctx, dist, bundle)
  if (noCounters) await ctx.addInitScript(() => { window.__lwNoDemoCounters = true })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  let loads = 0
  page.on('load', () => { loads++ })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  if (user) await login(page, user)
  const js = await page.evaluate(() => [...document.scripts].map(s => s.src).find(s => /index-/.test(s)) || '')
  if (!js.includes(bundle)) throw new Error('not the frozen bundle: ' + js + ' wanted ' + bundle)
  const tag = (typeof size === 'string' ? size : `${s.width}x${s.height}`) + '-' + engine + (build === 'main' ? '-main' : '')
  return { browser, ctx, page, errors, touch: !!s.touch, size: s, tag, build, get loads() { return loads } }
}

/** The Leave War as e2e/app.ts opens it (window.go — a route, not the thing under test; the plain-user round
    reaches it by the top bar / side menu instead). */
export async function lw(w) {
  await w.page.evaluate(() => window.go('leavewar'))
  await w.page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await w.page.waitForSelector('[data-testid="row-slipway"]', { timeout: 20000 })
  await sleep(400)
}

/** a month in the month strip (e.g. 'DEC'), as a person presses it */
export async function month(w, m) { await press(w, `[data-testid="month-${m}"]`); await sleep(400) }

/** A press at a POINT, as a finger or a mouse makes it — never a script scroll first (lesson 28). Refuses a target
    whose centre is off screen or covered by something else, and says what covers it. Returns the point. */
export async function press(w, sel, { dx = 0.5, dy = 0.5, allowCovered = false } = {}) {
  const loc = w.page.locator(sel).first()
  const b = await loc.boundingBox()
  if (!b) throw new Error('press: not on screen: ' + sel)
  const x = b.x + b.width * dx, y = b.y + b.height * dy
  const vw = w.size.width, vh = w.size.height
  if (x < 0 || y < 0 || x > vw || y > vh) throw new Error(`press: ${sel} centre off screen (${Math.round(x)},${Math.round(y)})`)
  const hit = await w.page.evaluate(([x, y, sel]) => {
    const t = document.elementFromPoint(x, y), want = document.querySelector(sel)
    return { ok: !!(t && want && (want === t || want.contains(t))), at: t ? (t.getAttribute('data-testid') || t.className || t.tagName) : null }
  }, [x, y, sel])
  if (!hit.ok && !allowCovered) throw new Error(`press: ${sel} is covered at its centre by ${hit.at}`)
  if (w.touch) await w.page.touchscreen.tap(x, y); else await w.page.mouse.click(x, y)
  return { x, y, covered: !hit.ok, at: hit.at }
}

/** ⋯ then an item of its menu (bid-postout, bid-postin; prefix 'sel' for the drag window), by presses */
export async function more(w, item, prefix = 'bid') {
  await press(w, `[data-testid="${prefix}-more"]`); await sleep(250)
  await press(w, `[data-testid="${item}"]`); await sleep(350)
}

/** A picture of the whole screen (or a locator), saved under the walker's folder; returns its path relative to docs/ */
let n = 0
export async function shot(w, name, sel = null) {
  const file = `${String(++n).padStart(3, '0')}-${w.tag}-${name}.png`.replace(/[^\w.\-]+/g, '_')
  const path = resolve(SHOTS, file)
  if (sel) await w.page.locator(sel).first().screenshot({ path }); else await w.page.screenshot({ path })
  return 'img/handpass/2026-11-26-msq-s4-walk/' + WHO + '/' + RUN + '/' + file
}
/** a picture within ~100 ms of a tap's lift (lesson 30): call straight after press() */
export const quick = (w, name) => shot(w, name + '-at-lift')

/** a box's place on screen, rounded */
export async function box(w, sel) {
  const b = await w.page.locator(sel).first().boundingBox()
  return b && { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }
}

export async function fin(w) {
  say('errors', JSON.stringify(w.errors.slice(0, 12)))
  try { await w.browser.close() } catch {}
  const p = rows.filter(r => r[5] === 'PASS').length, f = rows.filter(r => r[5] === 'FAIL').length
  say(`DONE ${p} PASS ${f} FAIL ${rows.length - p - f} OTHER of ${rows.length}`)
}
