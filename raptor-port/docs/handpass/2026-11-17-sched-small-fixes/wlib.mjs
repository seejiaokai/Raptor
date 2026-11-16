// walker lib, sched-small-fixes, 17 Nov 26. v2
import { createRequire } from 'node:module'
import { mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const require = createRequire(process.cwd() + '/package.json')
const pw = require('playwright')
export const BASE = 'http://localhost:4183'
const here = path.dirname(fileURLToPath(import.meta.url))
export const IMG = path.join(here, 'img')
export const STATE = path.join(here, process.env.STATE_FILE || 'state.json')
mkdirSync(IMG, { recursive: true })
export const results = []
export const errors = []
export function say(...a) { console.log(...a) }
export function rec(id, ok, note) { results.push({ id, ok, note }); console.log(ok ? 'PASS' : 'FAIL', id, '-', note) }

export async function launch(kind, phone, useState = false) {
  const type = kind === 'webkit' ? pw.webkit : pw.chromium
  const browser = await type.launch({ headless: true })
  const opts = phone
    ? { viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }
    : { viewport: { width: 1536, height: 864 } }
  if (useState && existsSync(STATE)) opts.storageState = STATE
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  const tag = `[${kind}${phone ? '-ph' : ''}]`
  page.on('console', m => { if (m.type() === 'error') errors.push(tag + ' console: ' + m.text()) })
  page.on('pageerror', e => errors.push(tag + ' PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push(tag + ' HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForTimeout(500)
  if (await page.locator('#luser').count()) {
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
    await page.click('#loginForm button[type=submit]')
  }
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
  return { browser, ctx, page }
}
export async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await page.waitForTimeout(500)
}
export async function pic(page, name, clip) {
  const f = path.join(IMG, name + '.png')
  await page.screenshot({ path: f, ...(clip ? { clip } : {}) })
  return f
}
/** a picture cropped to a locator's box plus padding, inside the viewport */
export async function cropPic(page, name, loc, pad = 80) {
  const b = await loc.boundingBox()
  const vp = page.viewportSize()
  const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
  const w = Math.min(vp.width - x, b.width + 2 * pad), h = Math.min(vp.height - y, b.height + 2 * pad)
  return pic(page, name, { x, y, width: w, height: h })
}
/** the placeholder chip that is really in the viewport (a hidden copy sits far off to the right) */
export async function panelChip(page, text = 'ALL AVAIL') {
  const all = page.locator('.puck.allavail', { hasText: text })
  const n = await all.count()
  const vp = page.viewportSize()
  for (let i = 0; i < n; i++) {
    const t = (await all.nth(i).innerText()).trim()
    if (t !== text) continue
    const b = await all.nth(i).boundingBox()
    if (b && b.width > 0 && b.x >= 0 && b.x + b.width <= vp.width && b.y >= 0 && b.y < vp.height) return all.nth(i)
  }
  return null
}
/** drag the panel's ALL AVAIL puck onto a seat of day di (real mouse) */
export async function dragAA(page, di, key) {
  const seat = page.locator(`#eWeek .day[data-day="${di}"] [data-fill="${key}"]`).first()
  await seat.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' }))
  await page.waitForTimeout(500)
  const chip = await panelChip(page)
  const cb = await chip.boundingBox(), b = await seat.boundingBox()
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2)
  await page.mouse.down()
  for (let i = 1; i <= 12; i++) { await page.mouse.move(cb.x + (b.x + 40 - cb.x) * i / 12, cb.y + (b.y + b.height / 2 - cb.y) * i / 12); await page.waitForTimeout(30) }
  await page.mouse.up()
  await page.waitForTimeout(700)
}
export async function bringIn(loc) {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await loc.page().waitForTimeout(350)
}
/** click (desktop) or tap (phone) the middle of a locator's box */
export async function press(page, loc, phone) {
  await bringIn(loc)
  const b = await loc.boundingBox()
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  if (phone) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y)
  return { x, y }
}
export const state = page => page.evaluate(() => {
  const a = document.activeElement
  return {
    ava: !!document.querySelector('.availwin:not([hidden])'),
    chg: !!document.querySelector('.chgwin:not([hidden])'),
    board: window.SBDAY != null && !!document.querySelector('#schedBoard:not([hidden])'),
    arm: window.ARM ? window.ARM.key : null,
    active: a ? (a.tagName + '.' + String(a.className).slice(0, 40) + (a.dataset && a.dataset.oilsent ? '[' + a.dataset.oilsent + ']' : '')) : null,
    page: window.CURPAGE,
  }
})
