/* Shared driver of the react-doctor clean-up A/B recorder (31 Oct 26, D1534).
   Serves a BUILT dist folder from INSIDE the test browser (no server): every request to
   http://localhost:4391/ is answered from the folder, index.html as the fallback.
   Holds the clock still, seeds Math.random / crypto, no motion, no caret blink, so two
   runs of the SAME build give the same pictures. Writes only under raptor-port/ (paths
   from import.meta.url). Method: docs/walk-scripts.md §8. */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')                 // raptor-port/
export const OUTROOT = resolve(ROOT, 'docs/img/handpass/2026-10-31-react-doctor')
export const ORIGIN = 'http://localhost:4391'
export const SIZES = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } }

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

const TYPES = {
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.map': 'application/json',
}

/** Answer every request to the fake origin from the dist folder. */
async function serve(ctx, dist) {
  await ctx.route('**/*', route => {
    const u = new URL(route.request().url())
    if (u.origin !== ORIGIN) return route.abort()
    let rel = decodeURIComponent(u.pathname).replace(/^\/+/, '')
    let file = join(dist, rel)
    if (!rel || !existsSync(file) || !statSync(file).isFile() || !resolve(file).startsWith(resolve(dist))) file = join(dist, 'index.html')
    const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream'
    return route.fulfill({ status: 200, body: readFileSync(file), headers: { 'content-type': type, 'cache-control': 'no-store' } })
  })
}

/* seeded generators: Math.random, crypto.randomUUID / getRandomValues */
const SEED_JS = `(() => {
  let s = 0x2f6e2b1; const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
  Math.random = rnd;
  try {
    crypto.getRandomValues = function (a) { for (let i = 0; i < a.length; i++) a[i] = Math.floor(rnd() * 256); return a };
    crypto.randomUUID = function () { const h = []; for (let i = 0; i < 16; i++) h.push(Math.floor(rnd() * 256).toString(16).padStart(2, '0')); return h.slice(0, 4).join('') + '-' + h.slice(4, 6).join('') + '-' + h.slice(6, 8).join('') + '-' + h.slice(8, 10).join('') + '-' + h.slice(10).join('') };
  } catch (e) {}
})()`

export const CALM_CSS = '*,*::before,*::after{caret-color:transparent !important;scroll-behavior:auto !important;animation-duration:0s !important;animation-delay:0s !important;transition-duration:0s !important;transition-delay:0s !important}'

export async function launch() {
  return chromium.launch({ headless: true, args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--disable-partial-raster', '--disable-checker-imaging', '--disable-gpu'], ...launchOptions })
}

/** A fresh context (empty storage = the demo world on first boot). Returns { ctx, page, errors, sink }. */
export async function newWorld(browser, dist, size, { touch = false, storageState } = {}) {
  const ctx = await browser.newContext({
    viewport: size, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light',
    locale: 'en-GB', timezoneId: 'Asia/Singapore',
    ...(touch ? { hasTouch: true, isMobile: true } : {}),
    acceptDownloads: true,
    ...(storageState ? { storageState } : {}),
  })
  await serve(ctx, dist)
  await ctx.addInitScript(SEED_JS)
  const page = await ctx.newPage()
  const errors = []
  const where = { step: 'boot' }
  page.on('console', m => { if (m.type() === 'error') errors.push({ step: where.step, e: 'console: ' + m.text().slice(0, 300) }) })
  page.on('pageerror', e => errors.push({ step: where.step, e: 'PAGEERROR ' + String(e.message).slice(0, 300) }))
  page.on('response', r => { if (r.status() >= 400) errors.push({ step: where.step, e: 'HTTP ' + r.status() + ' ' + r.url().replace(ORIGIN, '') }) })
  page.on('dialog', d => { errors.push({ step: where.step, e: 'NATIVE DIALOG ' + d.type() + ': ' + d.message().slice(0, 200) }); d.dismiss().catch(() => {}) })
  await page.clock.setFixedTime(new Date('2026-07-13T09:00:00+08:00'))
  await page.goto(ORIGIN + '/')
  await page.addStyleTag({ content: CALM_CSS })
  return { ctx, page, errors, where }
}

export async function login(page, who = 'a') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await settle(page, 500)
}

/** A short settle: two animation frames + a pause. */
export async function settle(page, ms = 350) {
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
  await page.waitForTimeout(ms)
}

/** Go to a page through its real tab (top nav on a desktop, the burger drawer on a phone). */
export async function toPage(page, id) {
  const tab = page.locator(`#topnav a[data-page="${id}"]:visible`)
  if (await tab.count()) await tab.first().click()
  else {
    await page.click('#burger')
    await settle(page, 300)
    await page.locator(`#drawer a[data-page="${id}"], #drawerNav a[data-page="${id}"]`).first().click()
  }
  await page.waitForFunction(p => window.CURPAGE === p, id)
  await settle(page, 500)
}
