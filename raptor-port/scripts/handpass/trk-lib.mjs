/* The Tracker walk's driver — [HUMAN-RETEST], 23 Sep 26.

   Drives the REAL production bundle in a real Chromium (bug-check order §7.2,
   D17), the way a person does: sign in, reach the Tracker through the nav tab
   (the burger drawer on a phone), and use its own controls. Nothing here
   injects state through the probe bridge — a state that cannot be reached
   through the app's own controls is itself a finding (§7.7). The one
   exception is READING the store to check what a screen claims (`core()`),
   which changes nothing.

   Standalone from lib.mjs on purpose: that file's default paths point into
   the MAIN checkout, and parallel chats (D86) each work in their own
   worktree. Everything here resolves from this file's own location.

     HP_URL   the preview to drive (default http://localhost:4180 — this
              chat's port under D86; the amendment chat owns 4173)
*/
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')                     // raptor-port/
export const SHOTS = process.env.HP_SHOTS || resolve(ROOT, 'docs/img/handpass/2026-09-23-tracker')
export const OUT = process.env.HP_OUT || resolve(ROOT, 'docs/handpass/parts/tracker')   // per-script JSON results (HP_OUT: a re-walk keeps the first walk's)
export const BASE = process.env.HP_URL || 'http://localhost:4180'
/* this PC only — see lib.mjs ([ACCOUNTS], 26 Sep 26) */
{ const h = new URL(BASE).hostname
  if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(h)) throw new Error(`HP_URL must be a local build (localhost): the probe bridge the drivers read is not installed on ${h}`) }
/* big, regenerable artefacts (exported files, whole-chart snapshots) stay OUT of
   the repo (D69 — no bloat); a re-run rebuilds them */
export const TMP = process.env.HP_TMP || resolve(tmpdir(), 'trk-handpass')

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}

export const PHONE = { width: 390, height: 844 }
export const DESK = { width: 1440, height: 900 }

/** A saved world is keyed to the ORIGIN it was captured on (browser storage is
    per-origin), so loading it against another port restores NOTHING and the
    Tracker draws a valid, empty-looking course — a false pass. Refused here. */
function assertStateOrigin(state) {
  let j
  try { j = JSON.parse(readFileSync(state, 'utf8')) } catch { return }
  const origins = (j.origins || []).map(o => String(o.origin || ''))
  if (!origins.length || origins.includes(BASE)) return
  throw new Error(`saved world captured on ${origins.join(', ')}, driver pointed at ${BASE} — it would restore an EMPTY world`)
}

/** Open a browser at a width, sign in, land on the Tracker through its tab.
    who: 'a' admin (ad/a) or 'u' squadron member (us/us). */
export async function open({ size = DESK, who = 'a', state = null, tracker = true, touch = false } = {}) {
  if (state) assertStateOrigin(state)
  mkdirSync(SHOTS, { recursive: true }); mkdirSync(OUT, { recursive: true }); mkdirSync(TMP, { recursive: true })
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({
    viewport: size, ...(state ? { storageState: state } : {}),
    ...(touch ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}),
    acceptDownloads: true,
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  page.on('dialog', d => { errors.push('NATIVE DIALOG ' + d.type() + ': ' + d.message()); d.dismiss().catch(() => {}) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await login(page, who)
  if (tracker) await toTracker(page)
  return { browser, ctx, page, errors }
}

export async function login(page, who = 'a') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(400)
}

/** Log out through the app's own control (desktop top bar or the phone drawer). */
export async function logout(page) {
  const desk = page.locator('#logoutBtn:visible, .topbar button:has-text("Log out"):visible, .topbar button:has-text("Logout"):visible')
  if (await desk.count()) { await desk.first().click() }
  else {
    await page.click('#burger')
    await page.waitForTimeout(250)
    await page.locator('#drawer').getByText(/Log ?out/i).first().click()
  }
  await page.waitForSelector('#luser')
}

/** Reach the Tracker the way a person does: the top-nav tab, or on a phone the
    burger drawer's entry. */
export async function toTracker(page) {
  const tab = page.locator('#topnav a[data-page="tracker"]:visible')
  if (await tab.count()) await tab.click()
  else {
    await page.click('#burger')
    await page.waitForTimeout(250)
    await page.locator('#drawer a[data-page="tracker"]').first().click()
  }
  await page.waitForFunction(() => window.CURPAGE === 'tracker')
  await page.waitForSelector('#flowSvg .ball', { timeout: 20000 })
  await page.waitForTimeout(350)
}

/** Any other page, by its tab (used to leave the Tracker and come back). */
export async function toPage(page, id) {
  const tab = page.locator(`#topnav a[data-page="${id}"]:visible`)
  if (await tab.count()) await tab.click()
  else {
    await page.click('#burger')
    await page.waitForTimeout(250)
    await page.locator(`#drawer a[data-page="${id}"]`).first().click()
  }
  await page.waitForFunction(p => window.CURPAGE === p, id)
  await page.waitForTimeout(350)
}

let shotN = 0
/** A picture for the evidence sheet. `el` narrows it to one element. */
export async function shot(page, name, { el = null, full = false } = {}) {
  const file = resolve(SHOTS, `${name}.png`)
  if (el) await page.locator(el).first().screenshot({ path: file })
  else await page.screenshot({ path: file, fullPage: full })
  shotN++
  return file
}

/** Read-only look into the Tracker's store (the smoke suite's own hook) — to
    CHECK what a screen claims, never to set anything up. */
export async function core(page, fn, arg) {
  return page.evaluate(({ src, arg }) => {
    const c = window.__coreForTests
    if (!c) return { __err: 'no __coreForTests on window' }
    // eslint-disable-next-line no-new-func
    return new Function('c', 'arg', 'return (' + src + ')(c, arg)')(c, arg)
  }, { src: fn.toString(), arg })
}

/** The whole Tracker slice of browser storage, for before/after comparisons. */
export async function storageDump(page) {
  return page.evaluate(() => {
    const out = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (/tracker|ocu/i.test(k)) out[k] = localStorage.getItem(k)
    }
    return out
  })
}

/** The app's own confirm/prompt (#dlgModal): answer it. `value` fills the input
    first when there is one; ok=false presses the cancel button. */
export async function dlg(page, { value = null, ok = true, timeout = 5000 } = {}) {
  await page.waitForSelector('#dlgModal', { state: 'visible', timeout })
  const text = (await page.locator('#dlgModal').innerText()).trim()
  if (value != null) {
    /* the + Add picker carries a search box (#dlgFilter) ABOVE the type-a-name box
       (#dlgInput): a typed value belongs in #dlgInput when there is one */
    const own = page.locator('#dlgInput:visible')
    const inp = (await own.count()) ? own.first() : page.locator('#dlgModal input:visible, #dlgModal textarea:visible').first()
    if (await inp.count()) await inp.fill(String(value))
  }
  const btns = page.locator('#dlgModal button:visible')
  const labels = await btns.allInnerTexts()
  let target = null
  if (ok) target = btns.filter({ hasText: /^(OK|Yes|Save|Delete|Add|Rename|Remove|Continue|Import|Replace|Done)/i }).first()
  else target = btns.filter({ hasText: /^(Cancel|No|Keep)/i }).first()
  if (!(await target.count())) target = ok ? btns.last() : btns.first()
  await target.click()
  await page.waitForTimeout(250)
  return { text, labels }
}

export function save(name, data) {
  mkdirSync(OUT, { recursive: true })
  writeFileSync(resolve(OUT, `${name}.json`), JSON.stringify(data, null, 2))
}

/** Bring a ball into the middle of the chart the way a person does — by
    scrolling the chart with the wheel — so a click or drag lands on the ball
    and not on the bar above it. (Playwright's own scroll-into-view left balls
    above the chart's box, under the bar; that was the driver, not the app.) */
export async function reveal(page, id) {
  for (let i = 0; i < 12; i++) {
    const d = await page.evaluate(id => {
      const bd = document.getElementById('board')
      const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === id)
      if (!bd || !g) return null
      const r = g.getBoundingClientRect(), b = bd.getBoundingClientRect()
      /* an EMPTY point on the chart to grab, for arrange mode's pan: not a ball,
         not a line or its hit area — the svg (or its backdrop) itself */
      let grab = null
      for (let fy = 0.1; fy < 0.95 && !grab; fy += 0.08) for (let fx = 0.04; fx < 0.96 && !grab; fx += 0.06) {
        const x = b.left + b.width * fx, y = b.top + b.height * fy
        const el = document.elementFromPoint(x, y)
        if (el && (el.id === 'flowSvg' || (el.closest && el.closest('#flowSvg') && !el.closest('.ball') && !/hit|handle|port|lend|lvert|wedge/.test(el.getAttribute('class') || '') && el.tagName.toLowerCase() === 'rect'))) grab = { x, y }
      }
      return {
        arrange: !!document.querySelector('#arrTools.on'),
        dy: (r.top + r.height / 2) - (b.top + b.height / 2), dx: (r.left + r.width / 2) - (b.left + b.width / 2),
        bx: b.left + b.width / 2, by: b.top + b.height / 2, h: b.height, w: b.width, grab,
        inside: r.top >= b.top + 4 && r.bottom <= b.bottom - 4 && r.left >= b.left + 4 && r.right <= b.right - 4,
      }
    }, id)
    if (!d) return false
    if (d.inside && Math.abs(d.dy) < d.h / 3 && Math.abs(d.dx) < d.w / 3) return true
    if (d.arrange) {
      /* arrange mode pans by dragging empty space (the wheel ZOOMS there, by design) */
      if (!d.grab) return false
      const tx = d.grab.x - d.dx, ty = d.grab.y - d.dy
      await page.mouse.move(d.grab.x, d.grab.y); await page.mouse.down()
      for (let k = 1; k <= 6; k++) await page.mouse.move(d.grab.x + (tx - d.grab.x) * k / 6, d.grab.y + (ty - d.grab.y) * k / 6)
      await page.mouse.up()
    } else {
      await page.mouse.move(d.bx, d.by)
      await page.mouse.wheel(Math.round(d.dx), Math.round(d.dy))
    }
    await page.waitForTimeout(180)
  }
  return false
}

/** A tiny step logger: every check is recorded with what the screen said. */
export function log() {
  const rows = []
  return {
    rows,
    ok(step, cond, said = '') { rows.push({ step, pass: !!cond, said: String(said).slice(0, 400) }); console.log(`${cond ? ' PASS' : ' FAIL'}  ${step}${said ? ' — ' + String(said).slice(0, 200) : ''}`) },
    note(step, said = '') { rows.push({ step, note: String(said).slice(0, 600) }); console.log(`  ..   ${step}${said ? ' — ' + String(said).slice(0, 300) : ''}`) },
  }
}
