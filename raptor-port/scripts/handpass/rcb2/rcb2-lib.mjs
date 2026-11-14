/* rcb2 shared helpers v1 (15 Nov 26) — the rules check's small batch ([RULES-CHECK-FIXES], branch
   claude/rules-check-batch2), its FULL check's walk. Evidence: docs/handpass/2026-11-14-rules-check-batch2.md.
   Each run is its OWN WORLD: a new browser and context, real storage (never ?fresh=1), the frozen build of app commit
   cc2eefa50 served from INSIDE the test browser (every request to http://localhost:4291 answered from the frozen folder,
   index.html the fallback) — no server, no port held, several walkers on one build (docs/walk-scripts.md §1, §8).
   Settings, read once at the top, before the shared driver loads:
     RCB2_DIST   the frozen folder (default: chat 81's scratchpad copy)
     RCB2_WHO    the walker's own picture folder name (host, w1, w2 …)
     RCB2_RUN    the run's own sub-folder (default 'run') — one run, one folder (walk-scripts §5) */
import { mkdirSync, appendFileSync, readFileSync, existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, extname, join } from 'node:path'
import { createRequire } from 'node:module'
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '../../..')
export const DIST = process.env.RCB2_DIST ||
  'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/frozen-cc2eefa50'
export const BUNDLE = 'index-XazXTgw6.js'
process.env.HP_URL ||= 'http://localhost:4291'
export const WHO = process.env.RCB2_WHO || 'host'
export const RUN = process.env.RCB2_RUN || 'run'
process.env.HP_SHOTS ||= resolve(ROOT, 'docs/img/handpass/2026-11-14-rules-check-batch2', WHO, RUN)
export const L = await import('../lib.mjs')
export const SHOTS = L.SHOTS
const req = createRequire(resolve(ROOT, 'package.json'))
const { chromium, webkit } = req('@playwright/test')
mkdirSync(SHOTS, { recursive: true })
export const LOG = resolve(SHOTS, 'log.txt')
export function say(...a) { const s = a.join(' '); console.log(s); try { appendFileSync(LOG, s + '\n') } catch {} }
export const results = []
export function check(id, ok, d = '') {
  results.push([id, ok === true ? 'PASS' : ok === false ? 'FAIL' : ok])
  say(`${ok === true ? 'PASS' : ok === false ? 'FAIL' : ok}  ${id}  ${d}`)
}
export const nrm = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' }

/** answer every request to the walk's address from the frozen folder */
async function serveFrozen(ctx) {
  if (!existsSync(join(DIST, 'assets', BUNDLE))) throw new Error('frozen folder missing its bundle: ' + DIST)
  await ctx.route(L.BASE + '/**', async route => {
    const u = new URL(route.request().url())
    let p = decodeURIComponent(u.pathname)
    let f = join(DIST, p)
    if (p === '/' || !existsSync(f) || statSync(f).isDirectory()) f = join(DIST, 'index.html')
    await route.fulfill({ status: 200, body: readFileSync(f), headers: { 'content-type': TYPES[extname(f)] || 'application/octet-stream' } })
  })
}

/** a fresh world: phone = iPhone 402×874 WebKit by touch; else desktop 1536×864 Chromium */
export async function openWorld({ phone = false, who = 'a' } = {}) {
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
  await page.goto(L.BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await L.login(page, who)
  const js = await page.evaluate(() => [...document.scripts].map(s => s.src).find(s => /index-/.test(s)) || '')
  if (!js.includes(BUNDLE)) throw new Error('not the frozen bundle: ' + js)
  return { browser, ctx, page, errors }
}

export const pic = (page, name, loc) => L.shot(page, name, loc)

/** the board's visible warning list as lines */
export async function warnLines(page) {
  return page.evaluate(() => {
    const side = document.querySelector('#sbSide')
    if (!side) return []
    return (side.innerText || '').split(/\r?\n/).map(s => s.replace(/\u00a0/g, ' ').trim()).filter(Boolean)
  })
}

export async function setF(page, key, value) { return L.type(page, `[data-bfld="${key}"]`, value) }
export async function readF(page, key) {
  return page.evaluate(k => { const e = document.querySelector(`#schedBoard [data-bfld="${k}"]`); return e ? (e.value !== undefined ? e.value : e.textContent) : null }, key)
}

export async function closeAll(browser) { try { await browser.close() } catch {} }
export function summary() {
  const p = results.filter(r => r[1] === 'PASS').length, f = results.filter(r => r[1] === 'FAIL').length
  say(`DONE ${p} PASS ${f} FAIL ${results.length - p - f} OTHER of ${results.length}`)
}
