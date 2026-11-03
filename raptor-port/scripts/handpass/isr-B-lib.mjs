// Shared helpers for the Inputs-seen re-check, part B (3 Nov 26). Reads and presses only through the real controls.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
export const OUT = join(HERE, '../../docs/img/handpass/2026-11-03-inputs-seen-recheck/B')
export const URL = 'http://localhost:4241/'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launch = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
export const SIZES = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true },
  side: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true },
  small: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true },
}
export const results = [], errs = []
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const say = l => { results.push(l); console.log(l) }
export const check = (name, ok, got) => say(`${ok ? 'PASS' : 'FAIL'} ${name} — saw ${JSON.stringify(got)}`)
export const info = (name, got) => say(`INFO ${name} — ${JSON.stringify(got)}`)
export const notWalked = (name, why) => say(`NOT WALKED ${name} — ${why}`)
export function startRun(only) { if (!only) { rmSync(OUT, { recursive: true, force: true }) } mkdirSync(OUT, { recursive: true }) }
export async function session(browser, size) {
  const ctx = await browser.newContext({ ...SIZES[size], deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const touch = !!SIZES[size].hasTouch
  page.on('pageerror', e => errs.push(`${size} page error ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${size} console ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${size} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(URL)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important} *,*::before,*::after{transition:none !important;animation:none !important}' })
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await sleep(400)
  return { ctx, page, touch, size }
}
export const go = async (page, p) => { await page.evaluate(p => window.go(p), p); await page.waitForFunction(p => window.CURPAGE === p, p); await sleep(400) }
export const tid = (page, t) => page.locator(`[data-testid="${t}"]`)
export const press = async (w, loc, opts = {}) => { const l = (typeof loc === 'string' ? w.page.locator(loc) : loc).first(); await (w.touch ? l.tap(opts) : l.click(opts)); await sleep(w.touch ? 650 : 200) }
export const shot = async (page, name) => { await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' }); const f = join(OUT, `${name}.png`); await page.screenshot({ path: f }); return f }
export const mark = (page, sel, opt = {}) => page.evaluate(([sel, opt]) => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); if (e) { if (!opt.noscroll) e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff3b6b'; e.style.outlineOffset = '2px' } return !!e }, [sel, opt])
export const unmark = (page, sel) => page.evaluate(sel => document.querySelectorAll(sel).forEach(e => e.style.removeProperty('outline')), sel)
export const rect = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => { const b = x.getBoundingClientRect(); return b.height > 0 && b.width > 0 }); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width), h: Math.round(b.height) } }, sel)
/* what a finger at the middle of `sel` lands on: is it the control itself, and if not, what is it */
export const hitOf = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); if (!e) return null; const b = e.getBoundingClientRect(); const x = Math.min(innerWidth - 1, Math.max(0, b.left + b.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, b.top + b.height / 2)); const h = document.elementFromPoint(x, y); const w = h && h.closest('[data-testid^="win-"]'); return { own: !!h && (h === e || e.contains(h)), at: [Math.round(x), Math.round(y)], hit: h ? (h.id || h.getAttribute('data-testid') || h.className || h.tagName).toString().slice(0, 40) : null, inWin: w ? w.getAttribute('data-testid') : null } }, sel)
export async function incalMonth(w, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await w.page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.indexOf(name.slice(0, 3)))
    if (!d) return
    await press(w, d > 0 ? '#icNext' : '#icPrev')
  }
  throw new Error('Inputs calendar never reached the month')
}
export async function sansMonth(w, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await tid(w.page, 'sc-month').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.indexOf(name.slice(0, 3)))
    if (!d) return
    await press(w, tid(w.page, d > 0 ? 'sc-next' : 'sc-prev'))
  }
  throw new Error('SANS calendar never reached the month')
}
/* the Inputs page on its calendar, on a month */
export async function toInputsCal(w, y, m) {
  await go(w.page, 'inputs')
  if ((await w.page.locator('#inCalBtn').getAttribute('aria-pressed')) !== 'true') await press(w, '#inCalBtn')
  await incalMonth(w, y, m)
}
export async function toSans(w, y, m) {
  await go(w.page, 'inputs')
  await press(w, '#inSansMode'); await tid(w.page, 'sanscal').waitFor()
  await sansMonth(w, y, m)
}
export async function openIcDay(w, iso) {
  const c = w.page.locator(`#inpCal [data-icday="${iso}"]`).first()
  await c.scrollIntoViewIfNeeded()
  await (w.touch ? c.tap({ position: { x: 8, y: 8 } }) : c.click({ position: { x: 8, y: 8 } }))
  await tid(w.page, 'win-inputsday').waitFor(); await sleep(500)
}
export async function openSansDay(w, iso) {
  const c = tid(w.page, 'sc-day-' + iso)
  await c.scrollIntoViewIfNeeded()
  await (w.touch ? c.tap({ position: { x: 8, y: 8 } }) : c.click({ position: { x: 8, y: 8 } }))
  await tid(w.page, 'win-sansday').waitFor(); await sleep(500)
}
export const openWins = page => page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].filter(e => e.getBoundingClientRect().height > 0 && !/-x$/.test(e.getAttribute('data-testid'))).map(e => e.getAttribute('data-testid')))
export const closeWins = async w => { for (let i = 0; i < 6; i++) { const x = await w.page.evaluate(() => { const b = [...document.querySelectorAll('[data-testid^="win-"][data-testid$="-x"]')].find(e => e.getBoundingClientRect().height > 0); return b ? b.getAttribute('data-testid') : null }); if (!x) break; await tid(w.page, x).first().click({ force: true }).catch(() => {}); await sleep(250) } }
export const active = page => page.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.getAttribute('data-testid') || a.className || a.tagName).toString().slice(0, 40) : null })
export const writeResults = () => writeFileSync(join(OUT, 'results.txt'), [...results, ...errs.map(e => 'ERROR ' + e)].join('\n') + '\n')
