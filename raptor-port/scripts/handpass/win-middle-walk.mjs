/* THE WALK of D997 (18 Oct 26 — "All in the middle"): on a phone every window that pops up for a task stands in the
   middle of the screen; the calendars' day panels and the ALL AVAIL and changes windows stay at the foot. Phone
   390 × 844 by touch, the built app, as assertions with pictures (the window ringed).
   Run: SPF_URL=http://localhost:4174 node scripts/handpass/win-middle-walk.mjs */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.SPF_URL || 'http://localhost:4174'
const OUT = process.env.SPF_OUT || resolve(here, '../../docs/img/handpass/2026-10-18-win-middle/walk')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
const rows = [], errs = []
let pics = 0
console.log('win-middle-walk v2 →', OUT)
const check = (id, ok, note) => { rows.push({ id, ok: !!ok, note }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${note}`) }
const notWalked = (id, why) => { rows.push({ id, ok: null, note: why }); console.log(`NOT WALKED ${id} — ${why}`) }

async function open() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push('pageerror ' + e)); page.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()) })
  await page.goto(BASE + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.locator('#loginForm button[type=submit]').tap()
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
  return { ctx, page }
}
const go = async (page, p) => { await page.evaluate(x => window.go(x), p); await sleep(600) }
const box = (page, sel) => page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getClientRects().length); if (!e) return null; const r = e.getBoundingClientRect(); return { t: Math.round(r.top), b: Math.round(r.bottom), l: Math.round(r.left), r: Math.round(r.right), h: Math.round(r.height) } }, sel)
async function shot(page, name, sel) {
  await page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getClientRects().length); if (!e) return; const r = e.getBoundingClientRect(); const d = document.createElement('div'); d.id = 'walkRing'; Object.assign(d.style, { position: 'fixed', left: (r.left - 4) + 'px', top: (r.top - 4) + 'px', width: (r.width + 8) + 'px', height: (r.height + 8) + 'px', border: '3px solid #FF3B30', borderRadius: '18px', zIndex: 99999, pointerEvents: 'none' }); document.body.appendChild(d) }, sel)
  await page.screenshot({ path: join(OUT, name + '.png') }); pics++
  await page.evaluate(() => document.getElementById('walkRing')?.remove())
}
function middle(id, w) {
  if (!w) return check(id, false, 'no window')
  const above = w.t, below = 844 - w.b
  /* the sides are each window's own, as before this change (v1 asked for 12/378 — the shell's windows stand 12 and 20 in) */
  check(id, Math.abs(above - below) <= 1 && w.t >= 12 && w.l >= 0 && w.r <= 390, `${above} above, ${below} below, sides ${w.l}/${w.r}, ${w.h} tall`)
}
function foot(id, w) {
  if (!w) return check(id, false, 'no window')
  check(id, w.b >= 832 && w.t > 100, `top ${w.t}, foot ${w.b} of 844 (${w.h} tall)`)
}

{ const { ctx, page } = await open()
  await go(page, 'inputs')
  await page.locator('#inGear').tap(); await sleep(500)
  middle('M1 Inputs calendar settings (short)', await box(page, '.floatwin:not([hidden])')); await shot(page, 'M1-inputs-settings', '.floatwin:not([hidden])')
  await page.locator('[data-testid="iset-days"]').tap(); await sleep(500)
  { const w = await box(page, '.floatwin:not([hidden])'); check('K0 the Calendar window: fills the screen under the top bar, as built (top 54, foot 838)', w && w.t === 54 && w.b === 838, JSON.stringify(w)) }; await shot(page, 'M2-calendar-window', '.floatwin:not([hidden])')
  await ctx.close() }
{ const { ctx, page } = await open()
  await go(page, 'inputs')
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await page.locator('#inListBtn').tap(); await sleep(400) }
  await page.locator('#inNew').tap(); await sleep(500)
  middle('M3 the Inputs page\'s "+ Input" (D996)', await box(page, '[data-testid="win-inputedit"]')); await shot(page, 'M3-plus-input', '[data-testid="win-inputedit"]')
  await ctx.close() }
{ const { ctx, page } = await open()
  await go(page, 'inputs')
  if (await page.locator('#inCalBtn[aria-pressed="false"]').count()) { await page.locator('#inCalBtn').tap(); await sleep(400) }
  await page.locator('[data-icday]:visible').nth(12).tap(); await sleep(700)
  const w = await box(page, '.floatwin.rests:not([hidden])')
  check('K1 a day opened on the Inputs calendar: stays the panel it was (opens tall, its foot on the screen\'s foot)', w && w.t <= 12 && w.b >= 832, JSON.stringify(w)); await shot(page, 'K1-inputs-day', '.floatwin.rests:not([hidden])')
  await ctx.close() }
{ const { ctx, page } = await open()
  await go(page, 'inputs')
  await page.locator('.intab:has-text("SANS"), [data-testid="tab-sans"]').first().tap(); await sleep(600)
  const g = page.locator('[data-testid="sc-gear"]:visible')
  if (await g.count()) { await g.tap(); await sleep(500); middle('M4 SANS calendar settings', await box(page, '.floatwin:not([hidden])')); await shot(page, 'M4-sans-settings', '.floatwin:not([hidden])') }
  else notWalked('M4', 'no SANS gear on screen')
  await ctx.close() }
{ const { ctx, page } = await open()
  await go(page, 'editsched')
  const more = page.locator('.schedule-more:visible').first(); if (await more.count()) { await more.tap(); await sleep(400) }
  const ins = page.locator('.schedule-moreitem:visible').first()
  if (await ins.count()) { await ins.tap(); await sleep(700); middle('M5 Insights (a pop-up window, tall)', await box(page, '.modal .modal-box')); await shot(page, 'M5-insights', '.modal .modal-box') }
  else notWalked('M5', 'no Insights door')
  await ctx.close() }
{ const { ctx, page } = await open()
  await go(page, 'editsched')
  await page.locator('#eWeek [data-sbday="5"]:visible').tap()
  await page.locator('#sbBoard .sb-sec').first().waitFor({ state: 'attached' }); await sleep(500)
  const chip = page.locator('#schedBoard [data-oilsent]:visible').first()
  if (await chip.count()) { await chip.scrollIntoViewIfNeeded(); await chip.tap(); await sleep(600); foot('K2 the ALL AVAIL window: stays at the foot', await box(page, '.availwin:not([hidden])')); await shot(page, 'K2-allavail', '.availwin:not([hidden])') }
  else notWalked('K2', 'no ALL AVAIL count on Saturday\'s board')
  await ctx.close() }
{ const { ctx, page } = await open()
  await go(page, 'editsched')
  const h = page.locator('#histBtn:visible')
  if (await h.count()) { await h.tap(); await sleep(700); foot('K3 the changes window: stays at the foot', await box(page, '.chgwin')); await shot(page, 'K3-changes', '.chgwin') }
  else notWalked('K3', 'no changes button on the phone')
  await ctx.close() }
writeFileSync(join(OUT, 'results.json'), JSON.stringify({ rows, errs, pics }, null, 1))
const fail = rows.filter(r => r.ok === false).length, nw = rows.filter(r => r.ok === null).length
console.log(`\n${rows.length - fail - nw} PASS · ${fail} FAIL · ${nw} NOT WALKED · ${pics} pictures`); console.log('errors', JSON.stringify(errs))
await browser.close()
