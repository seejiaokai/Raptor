import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const here = path.dirname(fileURLToPath(import.meta.url))
export const OUT = path.resolve(here, '../../docs/img/handpass/2026-10-22-lw-m1-open-dates/rb')
mkdirSync(OUT, { recursive: true })
export const URL = 'http://localhost:4253/?fresh=1'
export const VIEW = { width: 390, height: 844 }
let browser
export async function getBrowser() { return browser ||= await chromium.launch(launchOptions) }
export async function newPhone() {
  const b = await getBrowser()
  const ctx = await b.newContext({ viewport: VIEW, hasTouch: true, isMobile: true, deviceScaleFactor: 2, userAgent: devices['iPhone 13'].userAgent })
  const page = await ctx.newPage()
  const errs = []
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  const cdp = await ctx.newCDPSession(page)
  return { ctx, page, cdp, errs }
}
export async function signIn(page, who, today = undefined) {
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.goto(URL)
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.tap('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`)
  await page.waitForTimeout(600)
}
export const shot = (page, name, opts = {}) => page.screenshot({ path: path.join(OUT, name + '.png'), ...opts })
/* a real finger: tap by CDP touch events */
export async function finger(cdp, page, x, y, hold = 0) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
  if (hold) await page.waitForTimeout(hold)
  await page.waitForTimeout(40)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(250)
}
/* a held drag along points: touchStart, pause > 180ms, moves, rest ~90ms, touchEnd */
export async function holdDrag(cdp, page, pts, hold = 320) {
  const [a, ...rest] = pts
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y, id: 1 }] })
  await page.waitForTimeout(hold)
  for (const p of rest) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p.x, y: p.y, id: 1 }] })
    await page.waitForTimeout(40)
  }
  await page.waitForTimeout(90)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(300)
}
export async function centre(page, sel) {
  const loc = page.locator(sel).first()
  await loc.evaluate(e => { if (e.closest('td') || e.tagName === 'TD') e.scrollIntoView({ block: 'nearest', inline: 'center' }) }).catch(() => {}); await loc.scrollIntoViewIfNeeded().catch(() => {}); await page.waitForTimeout(80)
  const b = await loc.boundingBox()
  if (!b) throw new Error('no box for ' + sel)
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, b }
}
export async function tapSel(cdp, page, sel) { const c = await centre(page, sel); await finger(cdp, page, c.x, c.y); return c }
export const results = []
export function rec(id, verdict, said, pics = []) { results.push({ id, verdict, said, pics }); console.log(`${verdict}  ${id}  ${said}  [${pics.join(', ')}]`) }

export const PLAIN = 'http://localhost:4253/'
export const T = id => `[data-testid="${id}"]`
export const cellId = (who, iso) => `cell-${who}-${iso}`
export const has = async (page, sel) => (await page.locator(sel).count()) > 0
export const vis = async (page, sel) => { const l = page.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
export const txt = async (page, sel) => (await page.locator(sel).count()) ? (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim() : null
/* sign in on the PLAIN address (real storage) in the context's page, optionally as another role after a first one */
export async function signInPlain(page, who, today = undefined) {
  await page.goto(PLAIN)
  await page.waitForSelector('#luser')
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.tap('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (today !== undefined) await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(T(`row-${who === 'admin' ? 'stiff' : 'bane'}`))
  await page.waitForTimeout(600)
}
export async function gotoMonth(cdp, page, mon) { await tapSel(cdp, page, T(`month-${mon}`)); await page.waitForTimeout(900) }
export async function openWindow(cdp, page) { await tapSel(cdp, page, T('open-chip')); await page.waitForSelector(T('open-dates')); await page.waitForTimeout(300) }
export async function closeWindow(cdp, page) { if (await vis(page, T('open-dates-close'))) { await tapSel(cdp, page, T('open-dates-close')); await page.waitForTimeout(350) } }
export async function toggleMonths(cdp, page, keys) {
  await openWindow(cdp, page)
  for (const k of keys) { await tapSel(cdp, page, T(`od-month-${k}`)); await page.waitForTimeout(350) }
  const st = {}
  for (const k of keys) st[k] = await page.locator(T(`od-month-${k}`)).getAttribute('data-state')
  await closeWindow(cdp, page)
  await page.waitForTimeout(300)
  return st
}
/* a member/admin bid through the bid window; answers the below-zero confirmation by tapping the same leave again */
export async function bid(cdp, page, who, iso, type, { portion = 'full' } = {}) {
  await tapSel(cdp, page, T(cellId(who, iso)))
  await page.waitForSelector(T('bid-picker'), { timeout: 4000 })
  if (portion !== 'full') await tapSel(cdp, page, T(`portion-${portion}`))
  await tapSel(cdp, page, T(`bid-${type}`))
  await page.waitForTimeout(500)
  if (await vis(page, T('bid-picker'))) { await tapSel(cdp, page, T(`bid-${type}`)); await page.waitForTimeout(500) }
  return !(await vis(page, T('bid-picker')))
}
export const lve = async (page, who) => txt(page, T(`bal-${who}`))
export const cellText = async (page, who, iso) => txt(page, T(cellId(who, iso)))
export const sheetText = async page => page.evaluate(() => { const s = [...document.querySelectorAll('.bidsheet, [data-testid$="-sheet"], [data-testid="bid-picker"], [data-testid="daylist"], [data-testid="closed-note-text"]')]; return s.map(e => e.innerText.replace(/\s+/g, ' ')).join(' || ') })
export const bigText = async page => page.evaluate(() => { const el = document.querySelector('.sheet, .bidsheet'); return el ? el.innerText.replace(/\s+/g, ' ').trim() : null })
export const undo = async (cdp, page) => { await tapSel(cdp, page, '#undoBtn'); await page.waitForTimeout(500) }
export const redo = async (cdp, page) => { await tapSel(cdp, page, '#redoBtn'); await page.waitForTimeout(500) }
export async function done(errs) { console.log('ERRORS', JSON.stringify(errs)) }

/* set one stretch to exact days through its calendar icon (the window must be open); returns the lines read after */
export async function exactDays(cdp, page, oldFrom, from, to) {
  await tapSel(cdp, page, T(`od-cal-${oldFrom}`))
  await page.waitForSelector(T('od-range-picker'))
  await page.waitForTimeout(300)
  const ym = iso => iso.slice(0, 7)
  for (const iso of [from, to]) {
    for (let i = 0; i < 14 && !(await vis(page, T(`od-range-day-${iso}`))); i++) {
      const cur = await txt(page, T('od-range-title'))
      const target = new Date(iso + 'T00:00:00')
      const want = target.toLocaleString('en-GB', { month: 'long', year: 'numeric' })
      const dir = new Date(cur.replace(/[^A-Za-z0-9 ]/g, '').trim() + ' 1') < new Date(target.getFullYear(), target.getMonth(), 1) ? 'next' : 'prev'
      await tapSel(cdp, page, T(`od-range-${dir}`)); await page.waitForTimeout(250)
    }
    await tapSel(cdp, page, T(`od-range-day-${iso}`)); await page.waitForTimeout(250)
  }
  const sel = await txt(page, T('od-range-selection'))
  await tapSel(cdp, page, T('od-apply')); await page.waitForTimeout(500)
  return { sel, lines: await page.evaluate(() => [...document.querySelectorAll('[data-testid^="od-line-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim())) }
}
export const lines = page => page.evaluate(() => [...document.querySelectorAll('[data-testid^="od-line-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()))
export const states = (page, keys) => page.evaluate(ks => Object.fromEntries(ks.map(k => [k, document.querySelector(`[data-testid="od-month-${k}"]`)?.dataset.state])), keys)
/* leave the admin's session and come back in as the member on the plain address (real storage): same context */
export async function asMember(page, today = '2026-02-15') {
  await page.waitForTimeout(1500)
  await signInPlain(page, 'member', today)
}
export async function asAdmin(page) { await page.waitForTimeout(1500); await signInPlain(page, 'admin') }

export async function dragCells(cdp, page, who, from, to, hold = 320) {
  const a0 = await centre(page, T(cellId(who, from))); const r = id => page.locator(T(cellId(who, id))).first().boundingBox(); const ba = await r(from), bb = await r(to); const a = { x: ba.x + ba.width / 2, y: ba.y + ba.height / 2 }, b = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }
  const pts = [{ x: a.x, y: a.y }]
  const n = 6
  for (let i = 1; i <= n; i++) pts.push({ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n })
  await holdDrag(cdp, page, pts, hold)
  await page.waitForTimeout(400)
}
export const dumpBtns = (page, rootSel) => page.evaluate(r => { const p = document.querySelector(r); return p ? p.innerText.replace(/\n+/g, ' | ') + '\n' + [...p.querySelectorAll('[data-testid]')].map(e => e.dataset.testid).join(' ') : 'NO ' + r }, rootSel)
export const topSheet = page => page.evaluate(() => {
  const sheets = [...document.querySelectorAll('.sheet, .bidsheet, [role="dialog"]')].filter(e => e.getBoundingClientRect().height > 0)
  const s = sheets[sheets.length - 1]
  return s ? { id: s.dataset.testid || s.className, text: s.innerText.replace(/\n+/g, ' | '), tids: [...s.querySelectorAll('[data-testid]')].map(e => e.dataset.testid) } : null
})
export const banner = page => page.evaluate(() => { const e = document.querySelector('[data-testid="move-banner"]'); return e ? e.innerText.replace(/\n+/g, ' | ') : null })

export async function closeAny(cdp, page) {
  for (const t of ['bid-cancel', 'daylist-close', 'sel-cancel', 'closed-note-close', 'remarks-cancel', 'award-close', 'move-cancel', 'open-dates-close']) {
    if (await vis(page, T(t))) { await tapSel(cdp, page, T(t)); await page.waitForTimeout(300) }
  }
}
export const classOf = (page, who, iso) => page.locator(T(cellId(who, iso)) + ' .c').first().evaluate(e => e.className).catch(() => null)
export async function toggleMonthsKeep(cdp, page, keys) { for (const k of keys) { await tapSel(cdp, page, T(`od-month-${k}`)); await page.waitForTimeout(350) } }
