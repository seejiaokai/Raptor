import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
export const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-23-lw-m2-looks/w2')
mkdirSync(OUT, { recursive: true })
export const BASE = 'http://localhost:4173/'
export const URL = BASE + '?fresh=1'
export const PHONE = { width: 390, height: 844 }
export const DESK = { width: 1536, height: 864 }
let browser
export async function getBrowser() { return browser ||= await chromium.launch(launchOptions) }
export async function closeBrowser() { if (browser) await browser.close() }
export const errs = []
function hook(page, tag) {
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ${m.text().slice(0, 240)}`) })
  page.on('pageerror', e => errs.push(`${tag} pageerror: ${String(e).slice(0, 240)}`))
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} http ${r.status()} ${r.url().slice(0, 140)}`) })
}
export async function newCtx(size, tag) {
  const b = await getBrowser()
  if (size === 'phone') {
    const ctx = await b.newContext({ viewport: PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent })
    const page = await ctx.newPage(); hook(page, tag)
    return { ctx, page, size, phone: true }
  }
  const ctx = await b.newContext({ viewport: DESK, deviceScaleFactor: 2 })
  const page = await ctx.newPage(); hook(page, tag)
  return { ctx, page, size, phone: false }
}
export async function signIn(page, who, today) {
  await page.goto(URL)
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector('[data-testid^="row-"]')
  await page.waitForTimeout(700)
}
export const T = id => `[data-testid="${id}"]`
export const cellId = (who, iso) => `cell-${who}-${iso}`
export const vis = async (page, sel) => { const l = page.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
export const has = async (page, sel) => (await page.locator(sel).count()) > 0
export const txt = async (page, sel) => (await page.locator(sel).count()) ? (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim() : null
export const shot = (page, name, opts = {}) => page.screenshot({ path: path.join(OUT, name + '.png'), ...opts })
export const results = []
export function rec(id, size, role, verdict, did, saw, pics = []) {
  results.push({ id, size, role, verdict, did, saw, pics })
  console.log(`${verdict}  S${id} ${size} ${role}  ${did}  =>  ${saw}  [${pics.join(', ')}]`)
}
/* tap or click one element at its centre (scrolled to the centre of its cell first) */
export async function press(c, sel) {
  const page = c.page
  const loc = page.locator(sel).first()
  if (/oil-tracker|lw-tab|settings-open|war-picker|my-leave|counts-toggle|undermanned/.test(sel)) await page.evaluate(() => window.scrollTo(0, 0))
  if (!/fly-name|counts-toggle|undermanned|settings|period|oil-tracker|lw-tab/.test(sel)) await loc.evaluate(e => { if (e.closest('td') || e.tagName === 'TD') e.scrollIntoView({ block: 'nearest', inline: 'center' }) }).catch(() => {})
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(80)
  const b = await loc.boundingBox()
  if (!b) throw new Error('no box for ' + sel)
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  if (c.phone) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y)
  await page.waitForTimeout(280)
}
export const undo = async c => { await press(c, '#undoBtn'); await c.page.waitForTimeout(400) }
export const redo = async c => { await press(c, '#redoBtn'); await c.page.waitForTimeout(400) }
export async function closeAny(c) {
  for (const t of ['bid-cancel', 'daylist-close', 'sel-cancel', 'closed-note-close', 'remarks-cancel', 'award-close', 'move-cancel', 'open-dates-close', 'cform-close', 'reqname-close']) {
    if (await vis(c.page, T(t))) { await press(c, T(t)); await c.page.waitForTimeout(250) }
  }
}
export const cellText = (page, who, iso) => txt(page, T(cellId(who, iso)))
export const cellHtml = (page, who, iso) => page.locator(T(cellId(who, iso))).first().evaluate(e => e.innerHTML).catch(() => null)

export const PLAIN = BASE
/* the boxes drawn in one cell, each with its kind/state classes, text and its place inside the cell (fractions) */
export const boxes = (page, who, iso) => page.locator(T(cellId(who, iso))).first().evaluate(td => {
  const r = td.getBoundingClientRect()
  return [...td.querySelectorAll('.c, .mk')].map(e => {
    const b = e.getBoundingClientRect()
    return { cls: e.className, text: e.textContent.trim(), x: +((b.left - r.left) / r.width).toFixed(2), y: +((b.top - r.top) / r.height).toFixed(2), w: +(b.width / r.width).toFixed(2), h: +(b.height / r.height).toFixed(2) }
  })
}).catch(() => null)
/* a picture of one cell and its surroundings, enlarged */
export async function cellShot(page, who, iso, name, pad = { x: 70, y: 34 }) {
  const loc = page.locator(T(cellId(who, iso))).first()
  await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {})
  await page.waitForTimeout(150)
  const b = await loc.boundingBox()
  if (!b) return false
  const vp = page.viewportSize()
  const x = Math.max(0, b.x - pad.x), y = Math.max(0, b.y - pad.y)
  const clip = { x, y, width: Math.min(vp.width - x, b.width + pad.x * 2), height: Math.min(vp.height - y, b.height + pad.y * 2) }
  await page.screenshot({ path: path.join(OUT, name + '.png'), clip })
  return true
}
export async function clipShot(page, sel, name, pad = 10) {
  const loc = page.locator(sel).first()
  const b = await loc.boundingBox()
  if (!b) return false
  const vp = page.viewportSize()
  const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
  await page.screenshot({ path: path.join(OUT, name + '.png'), clip: { x, y, width: Math.min(vp.width - x, b.width + pad * 2), height: Math.min(vp.height - y, b.height + pad * 2) } })
  return true
}
/* a leave placed through the bid window; answers the below-zero confirmation by pressing the same leave again */
export async function bid(c, who, iso, type, portion) {
  const page = c.page
  await press(c, T(cellId(who, iso)))
  await page.waitForSelector(T('bid-picker'), { timeout: 4000 })
  if (portion) await press(c, T(`portion-${portion}`))
  await press(c, T(`bid-${type}`))
  await page.waitForTimeout(350)
  if (await vis(page, T('bid-picker'))) { await press(c, T(`bid-${type}`)); await page.waitForTimeout(350) }
  return !(await vis(page, T('bid-picker')))
}
import { writeFileSync, readFileSync } from 'node:fs'
export const SCRATCH = process.env.W2_SCRATCH || path.resolve(here, '../../../../../../scratch-w2')
export function saveResults(name) { mkdirSync(SCRATCH, { recursive: true }); writeFileSync(path.join(SCRATCH, name + '.json'), JSON.stringify({ results, errs }, null, 1)) }
