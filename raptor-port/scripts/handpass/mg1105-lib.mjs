// The member / guest check (job 3 of the night of 4–5 Nov 26 — [MEMBER-EDITPAGE-CHECK], [GUEST-SAVE-WARNING]): the shared
// set-up. Every browser storage write the page makes is COUNTED from its first script (an init script, so the boot's own
// writes are seen too), and can be made to FAIL (`__lsRefuse`, what a full disk does — the same wrapper as
// e2e/save-note.spec.ts). The probe bridge (localhost only) is used to READ the model, and — on purpose, it is the route
// under check — to put a member on Edit Schedule (`setPage`), exactly as the 1 Oct 26 walk reached it.
// WALK_DIR names the frozen build folder (isr-serve.mjs); MG_OUT the picture folder.
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serveFrozen } from './isr-serve.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
export const OUT = process.env.MG_OUT || join(HERE, '../../docs/img/handpass/2026-11-05-member-guest')
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })
export const URL = process.env.LOOK_URL || 'http://localhost:4251/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const results = [], errs = []
export const say = (l) => { results.push(l); console.log(l) }
export const note = (id, what) => say(`NOTE ${id} — ${typeof what === 'string' ? what : JSON.stringify(what)}`)
export const check = (id, name, ok, got) => say(`${ok ? 'PASS' : 'FAIL'} ${id} ${name} — saw ${JSON.stringify(got)}`)
export const notWalked = (id, why) => say(`NOT WALKED ${id} — ${why}`)

/* desktop: his PC's 1536 in Chromium; phone: his iPhone's 402 × 874 in WebKit, by touch */
export const SIZES = {
  desktop: { engine: chromium, opts: { viewport: { width: 1536, height: 864 } }, tap: false },
  phone: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }, tap: true },
}
const browsers = {}
async function browserFor(size) {
  const s = SIZES[size]
  if (!browsers[size]) browsers[size] = await s.engine.launch(s.engine === chromium && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  return browsers[size]
}

/* the storage counter — installed before any of the app's own scripts */
const COUNTER = () => {
  const w = window
  if (w.__lsWrap) return
  w.__lsWrap = true; w.__lsLog = []; w.__lsRefuse = false
  const set = Storage.prototype.setItem, rem = Storage.prototype.removeItem
  Storage.prototype.setItem = function (k, v) {
    const ok = !w.__lsRefuse
    w.__lsLog.push({ op: 'set', k: String(k), n: String(v).length, ok, t: Math.round(performance.now()), local: this === window.localStorage })
    if (!ok) throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError')
    return set.call(this, k, v)
  }
  Storage.prototype.removeItem = function (k) {
    const ok = !w.__lsRefuse
    w.__lsLog.push({ op: 'remove', k: String(k), ok, t: Math.round(performance.now()), local: this === window.localStorage })
    if (!ok) throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError')
    return rem.call(this, k)
  }
}

export async function open(size) {
  const s = SIZES[size]
  const b = await browserFor(size)
  const ctx = await b.newContext({ ...s.opts, deviceScaleFactor: 2, acceptDownloads: true })
  await serveFrozen(ctx, URL)
  await ctx.addInitScript(COUNTER)
  /* the print dialog cannot be opened headless; count the calls instead */
  await ctx.addInitScript(() => { window.__prints = 0; window.print = () => { window.__prints++ } })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`[${size}] page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`[${size}] console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`[${size}] HTTP ${r.status()} ${r.url()}`) })
  /* the browser's own "Leave site?" question (a beforeunload) is ANSWERED "leave", as a person closing the tab does — and
     counted, since whether it was asked is itself a reading; any other dialog is dismissed and reported */
  page.on('dialog', d => { if (d.type() === 'beforeunload') { page.__leaveAsked = (page.__leaveAsked || 0) + 1; d.accept().catch(() => {}) } else { errs.push(`[${size}] dialog ${d.type()} "${d.message()}"`); d.dismiss().catch(() => {}) } })
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' }).catch(() => {})
  await page.waitForSelector('#luser')
  await page.evaluate(() => { window.__notes = []; new MutationObserver(() => { const t = document.getElementById('toastEl'); const s = t && (t.textContent || '').replace(/\s+/g, ' ').trim(); if (s && window.__notes[window.__notes.length - 1] !== s) window.__notes.push(s) }).observe(document.body, { subtree: true, childList: true, characterData: true }) })
  return { ctx, page, tap: s.tap, size }
}

export async function signIn(page, user, pass) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForTimeout(900)
}
export async function signOut(page) {
  const vis = async (sel) => page.locator(sel).first().isVisible().catch(() => false)
  for (const sel of ['#logout', '#guestOut', '#accOut']) if (await vis(sel)) { await page.locator(sel).first().click(); await page.waitForTimeout(700); return }
  /* the phone keeps Logout in the side menu */
  const burger = page.locator('#burger')
  if (await burger.isVisible().catch(() => false)) { await burger.click(); await page.waitForTimeout(400) }
  await page.getByRole('button', { name: /Log ?out|Sign out/i }).first().click()
  await page.waitForTimeout(700)
}

/* WHAT IS SAVED AND WHAT IS SHOWN — read before and after every press */
export const state = (page) => page.evaluate(() => {
  const w = window
  const h = typeof w.histSnap === 'function' ? w.histSnap() : ''
  let x = 0; for (let i = 0; i < h.length; i++) x = (x * 31 + h.charCodeAt(i)) | 0
  const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn')
  return {
    writes: w.__lsLog.length,
    model: `${h.length}:${x}`,
    elog: w.ELOG && w.ELOG.rows ? w.ELOG.rows.length : null,
    undo: u ? `${u.disabled ? 'off' : 'on'}|${u.title}` : null,
    redo: r ? `${r.disabled ? 'off' : 'on'}|${r.title}` : null,
    page: w.CURPAGE ?? null,
    failedBand: !!document.querySelector('.savestat.failed, .saveband'),
    notes: (w.__notes || []).length,
  }
})
export const writesSince = (page, n) => page.evaluate(n => window.__lsLog.slice(n).map(e => `${e.op} ${e.k}${e.ok ? '' : ' (REFUSED)'}`), n)
export const notesSince = (page, n) => page.evaluate(n => (window.__notes || []).slice(n), n)
export const refuse = (page, on) => page.evaluate(on => { window.__lsRefuse = on }, on)

export async function shot(page, id, what) { const f = join(OUT, `${id}-${what}.png`); await page.screenshot({ path: f }); return f }
export async function shotEl(page, sel, id, what) {
  const f = join(OUT, `${id}-${what}.png`)
  const l = page.locator(sel).first()
  if (await l.count() && await l.isVisible().catch(() => false)) await l.screenshot({ path: f }); else await page.screenshot({ path: f })
  return f
}
export async function finish(name) {
  for (const b of Object.values(browsers)) await b.close()
  const lines = [...results, ...errs.map(e => 'BROWSER ' + e)]
  writeFileSync(join(OUT, `results-${name}.txt`), lines.join('\n') + '\n')
  console.log(`\n${results.filter(r => r.startsWith('PASS')).length} PASS · ${results.filter(r => r.startsWith('FAIL')).length} FAIL · ${results.filter(r => r.startsWith('NOT WALKED')).length} NOT WALKED · ${errs.length} browser errors`)
}
