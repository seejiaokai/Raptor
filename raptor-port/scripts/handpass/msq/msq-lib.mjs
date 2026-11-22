/* msq shared helpers v1 (18 Nov 26) — multi-squadron batch 1, steps 0–4, the full check (job 5); branch
   claude/multi-sqn-b1-107. Evidence: docs/handpass/2026-11-18-multi-sqn-b1.md "## The full check (job 5)".
   Built on www-lib.mjs's proven route (16 Nov 26): each run is its OWN WORLD — a new browser and context, real
   storage (never ?fresh=1), the frozen build served from INSIDE the test browser (every request to
   http://localhost:4293 answered from the frozen folder, index.html the fallback) — no server, no port held.
   What is new here: sign in as ANY seeded account (ad/a, us/us, ad2/a2, ad9/a9, us9/us9) and sign out through the
   app's own Sign out, in the same tab, waiting for the page's reload.
   Settings, read once at the top:
     MSQ_DIST    the frozen folder          MSQ_BUNDLE  its bundle's file name (refused if the page loads another)
     MSQ_WHO     the walker's picture folder (host, w1, w2 …)   MSQ_RUN  the run's own sub-folder */
import { mkdirSync, appendFileSync, readFileSync, existsSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, extname, join } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
export const DIST = process.env.MSQ_DIST ||
  'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/4b825657-ab4e-4e7a-aba0-42051bdae95b/scratchpad/job5/build-a646aa0'
export const BUNDLE = process.env.MSQ_BUNDLE || 'index-CCJh0p8n.js'
export const BASE = 'http://localhost:4293'
export const WHO = process.env.MSQ_WHO || 'host'
export const RUN = process.env.MSQ_RUN || 'run'
// MSQ_IMGDIR (19 Nov 26, job 2 of chat 109): the job's own picture folder under docs/img/handpass, so a later job's
// walk never writes into the 18 Nov folder its pictures are compared with
export const SHOTS = resolve(ROOT, 'docs/img/handpass', process.env.MSQ_IMGDIR || '2026-11-18-multi-sqn-b1', WHO, RUN)
// the shared drivers read these before they load
process.env.HP_URL = BASE
process.env.HP_SHOTS = SHOTS
process.env.WWW_DIST = DIST
process.env.WWW_BUNDLE = BUNDLE
process.env.WWW_WHO = WHO
process.env.WWW_RUN = RUN
export const L = await import('../lib.mjs')
export const W = await import('../www/www-lib.mjs')   // board(), press(), typeIn(), seat() … — take a {page, phone} world
const req = createRequire(resolve(ROOT, 'package.json'))
const { chromium, webkit } = req('@playwright/test')
mkdirSync(SHOTS, { recursive: true })
export const LOG = resolve(SHOTS, 'log.txt')
export function say(...a) { const s = a.join(' '); console.log(s); try { appendFileSync(LOG, s + '\n') } catch {} }
export const nrm = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const ACCOUNTS = { ad: 'a', us: 'us', ad2: 'a2', ad9: 'a9', us9: 'us9' }

export const rows = []   // report rows: [scenario, size, did, expected, saw, verdict, pic]
export function row(sc, size, did, exp, saw, verdict, pic = '') {
  rows.push([sc, size, did, exp, saw, verdict, pic])
  say(`ROW ${verdict} | ${sc} | ${size} | ${did} | saw: ${String(saw).slice(0, 400)}`)
}
export function saveRows() { writeFileSync(SHOTS + '/rows.json', JSON.stringify(rows, null, 1)) }

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }

async function serveFrozen(ctx) {
  if (!existsSync(join(DIST, 'assets', BUNDLE))) throw new Error('frozen folder missing its bundle: ' + DIST)
  await ctx.route(BASE + '/**', async route => {
    const u = new URL(route.request().url())
    const p = decodeURIComponent(u.pathname)
    let f = join(DIST, p)
    if (p === '/' || !existsSync(f) || statSync(f).isDirectory()) f = join(DIST, 'index.html')
    await route.fulfill({ status: 200, body: readFileSync(f), headers: { 'content-type': TYPES[extname(f)] || 'application/octet-stream' } })
  })
}

/** sign in through the sign-in card: user is a seeded name (ad, us, ad2, ad9, us9) */
export async function login(page, user) {
  await page.waitForSelector('#luser', { timeout: 20000 })
  await page.fill('#luser', user)
  await page.fill('#lpass', ACCOUNTS[user] ?? user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(600)
}

/** a fresh world: phone = iPhone 402×874 WebKit by touch; else desktop 1536×864 Chromium. user: the first sign-in */
export async function open({ phone = false, user = 'ad' } = {}) {
  const browser = phone ? await webkit.launch() : await chromium.launch({ headless: true })
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1536, height: 864 } })
  await serveFrozen(ctx)
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
  if (!js.includes(BUNDLE)) throw new Error('not the frozen bundle: ' + js)
  const w = { browser, ctx, page, errors, phone, P: phone ? 'p' : 'd', get loads() { return loads } }
  return w
}

/** who is signed in, which squadron's week is in view, its first day's date — read through the bridge (reading only) */
export async function who(w) {
  // the bridge exposes no session or unit: read what the screen and the week hold
  return w.page.evaluate(() => {
    const ppl = new Set()
    for (const d of (window.DAYS || [])) for (const wv of (d.waves || [])) for (const f of (wv.formations || []))
      for (const a of (f.aircraft || [])) for (const k of ['p', 'w']) if (a[k]) ppl.add(window.PEOPLE?.[a[k]]?.cs || a[k])
    return { week: String(window.CURWEEK ?? ''), page: window.CURPAGE ?? null, flyers: [...ppl].slice(0, 30),
      top: (document.querySelector('header, .topbar, #topbar')?.innerText || '').replace(/\s+/g, ' ').slice(0, 200) }
  })
}

/** Sign out through the app's own control (desktop top bar, or the phone's menu), then wait for the sign-in card.
    Returns whether the page reloaded (the 'load' count rose). */
export async function signOut(w) {
  const page = w.page
  const before = w.loads
  if (w.phone) {
    const menu = page.locator('button[aria-label*="enu" i]:visible, .hamb:visible, [data-drawer]:visible').first()
    if (await menu.count()) { await menu.tap().catch(() => {}); await sleep(500) }
  }
  const b = page.getByRole('button', { name: /sign out|log ?out/i }).first()
  await b.waitFor({ state: 'visible', timeout: 8000 })
  if (w.phone) await b.tap(); else await b.click()
  await page.waitForSelector('#luser', { timeout: 20000 })
  await sleep(800)
  return { reloaded: w.loads > before }
}

export const pic = (w, name, loc) => L.shot(w.page, name, loc)
export async function fin(w) {
  say('errors', JSON.stringify(w.errors.slice(0, 12)))
  saveRows()
  try { await w.browser.close() } catch {}
  const p = rows.filter(r => r[5] === 'PASS').length, f = rows.filter(r => r[5] === 'FAIL').length
  say(`DONE ${p} PASS ${f} FAIL ${rows.length - p - f} OTHER of ${rows.length}`)
}
