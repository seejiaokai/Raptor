// bell190-c shared helpers — the Leave War walk of the bell190 job. Points at the build served on :4190 (real storage, a
// fresh browser context per scenario group; never ?fresh=1). Pictures to docs/img/handpass/2026-11-26-bell-added/c/.
import { createRequire } from 'module'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
const require = createRequire(process.cwd() + '/package.json')
const { chromium, webkit } = require('playwright')
console.log('[bell190-c-lib v1]')
export const URL = 'http://localhost:4190/'
export const OUT = path.resolve(process.cwd(), 'docs/img/handpass/2026-11-26-bell-added/c')
mkdirSync(OUT, { recursive: true })
export const T = id => `[data-testid="${id}"]`
let browsers = {}
let pipe = null
export async function phoneURL() {
  if (!pipe) {
    const net = await import('node:net')
    pipe = net.createServer(c => { const s = net.connect(4190, '::1'); c.pipe(s); s.pipe(c); c.on('error', () => s.destroy()); s.on('error', () => c.destroy()) }).listen(0, '127.0.0.1')
    await new Promise(r => pipe.on('listening', r))
  }
  return `http://127.0.0.1:${pipe.address().port}/`
}
export async function newWorld(kind = 'desk') {
  const phone = kind === 'phone'
  const b = browsers[kind] ||= await (phone ? webkit.launch() : chromium.launch())
  const ctx = await b.newContext(phone ? { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { viewport: { width: 1536, height: 864 } })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url().slice(0, 100)) })
  return { ctx, page, errs, phone }
}
export async function closeAll() { for (const k of Object.keys(browsers)) { await browsers[k].close(); delete browsers[k] } if (pipe) { pipe.close(); pipe = null } }
export const shot = (w, name, opts = {}) => w.page.screenshot({ path: path.join(OUT, name + '.png'), ...opts })
export const vis = async (page, s) => { const l = page.locator(s).first(); return (await l.count()) > 0 && await l.isVisible() }
export async function tap(w, sel, quick = null) {
  const l = w.page.locator(sel).first()
  await l.scrollIntoViewIfNeeded().catch(() => {})
  await w.page.waitForTimeout(80)
  const bx = await l.boundingBox()
  if (!bx) throw new Error('no box for ' + sel)
  const x = bx.x + bx.width / 2, y = bx.y + bx.height / 2
  if (w.phone) { await w.page.touchscreen.tap(x, y); if (quick) await shot(w, quick) }
  else await w.page.mouse.click(x, y)
  await w.page.waitForTimeout(300)
}
export async function signIn(w, u, p) {
  const { page } = w
  /* WebKit on this PC cannot reach the server, which answers only on ::1 — the phone goes through this script's own pipe
     on 127.0.0.1 to [::1]:4190 (the same served bundle; the pipe dies with the script) */
  /* after a sign-out the app is already on its sign-in card (and may still be reloading itself): no second navigation */
  const onCard = page.url().startsWith('http') && await vis(page, '#luser')
  if (!onCard) {
    for (let i = 0; i < 3; i++) {
      try { await page.goto(w.phone ? await phoneURL() : URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); break }
      catch (e) { if (!/interrupted/.test(String(e)) || i === 2) throw e; await page.waitForTimeout(800) }
    }
  }
  await page.waitForSelector('#luser', { timeout: 60000 }); await page.waitForTimeout(400)
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#notifyBell')
  await page.waitForTimeout(600)
}
export async function signOut(w) {
  const { page } = w
  /* on a phone Logout sits folded in the side menu: its own button is pressed by its click (sign-out is set-up, not a step judged) */
  if (await vis(page, '#logout')) await page.locator('#logout').first().click()
  else await page.evaluate(() => document.querySelector('#logout').click())
  await page.waitForSelector('#luser')
}
export async function toWar(w) {
  await w.page.evaluate(() => window.go('leavewar'))
  await w.page.waitForSelector(T('row-bane'), { state: 'attached', timeout: 15000 })
  await w.page.waitForTimeout(800)
}
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export async function reach(w, who, iso) {
  const sel = T(`cell-${who}-${iso}`)
  for (let i = 0; i < 4 && !(await w.page.locator(sel).count()); i++) {
    await w.page.evaluate(() => window.scrollTo(0, 0)); await w.page.waitForTimeout(150)
    await tap(w, T('month-' + MON[+iso.slice(5, 7) - 1])); await w.page.waitForTimeout(900)
  }
  await w.page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await w.page.waitForTimeout(250)
}
export async function openCell(w, who, iso, quick = null) {
  await reach(w, who, iso)
  await tap(w, T(`cell-${who}-${iso}`), quick)
  await w.page.waitForTimeout(400)
  return vis(w.page, T('bid-picker'))
}
export const cellText = (w, who, iso) => w.page.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }, T(`cell-${who}-${iso}`))
export async function setAuto(w, on, pfx = 'bid') {
  const s = w.page.locator(T(`${pfx}-approve-tick`)).first()
  if (!(await s.count())) return 'no switch'
  if (((await s.getAttribute('aria-checked')) === 'true') !== on) await tap(w, T(`${pfx}-approve-tick`))
  return (await s.getAttribute('aria-checked')) === 'true'
}
/* press a leave in the open bid/select window; a second press answers "tap the same leave again" */
export async function place(w, btn, pfx = 'bid', quick = null) {
  const win = pfx === 'bid' ? 'bid-picker' : 'select-sheet'
  await tap(w, T(`${pfx}-${btn}`), quick); await w.page.waitForTimeout(600)
  let note = null
  if (await vis(w.page, T(win))) {
    note = await w.page.evaluate(win => { const n = document.querySelector('[data-testid="sel-note"], [data-testid="bid-note"]'); if (n) return n.innerText.trim(); const p = document.querySelector(`[data-testid="${win}"]`); const m = p && p.innerText.match(/[^\n]*again[^\n]*/i); return m ? m[0].trim() : null }, win)
    if (note && /again/i.test(note)) { await tap(w, T(`${pfx}-${btn}`)); await w.page.waitForTimeout(700) }
  }
  return { closed: !(await vis(w.page, T(win))), note }
}
export async function closeWin(w) {
  for (const id of ['bid-cancel', 'sel-cancel']) if (await vis(w.page, T(id))) { await tap(w, T(id)); await w.page.waitForTimeout(250) }
}
/* a mouse drag from one cell to another (desktop) */
export async function drag(w, [p1, a], [p2, z]) {
  const P = w.page
  await reach(w, p1, a)
  for (let i = 0; i < 4; i++) {
    const bA = await P.locator(T(`cell-${p1}-${a}`)).boundingBox(), bZ = await P.locator(T(`cell-${p2}-${z}`)).boundingBox()
    await P.mouse.move(bA.x + bA.width / 2, bA.y + bA.height / 2); await P.mouse.down()
    await P.mouse.move(bZ.x + bZ.width / 2, bZ.y + bZ.height / 2, { steps: 12 }); await P.mouse.up()
    await P.waitForTimeout(600)
    if (await vis(P, T('select-sheet'))) return true
    await P.waitForTimeout(600)
  }
  return false
}
export const notices = w => w.page.evaluate(() => JSON.parse(JSON.stringify(window.NOTICES || [])))
export const newSince = (before, after) => after.filter(n => !before.some(b => b.id === n.id))
export const fmt = n => `to=${n.to} by=${n.by} name="${n.name}" day=${n.day} iid=${n.iid || '-'} what=${JSON.stringify(n.what)}`
/* the bell: lit?, open it, read its lines (the words drawn), picture */
export async function bell(w, pic) {
  const P = w.page
  const lit = await P.evaluate(() => { const b = document.querySelector('#notifyBell'); if (!b) return null; const badge = b.querySelector('.badge, .dot, .count, .bell-badge'); return { cls: b.className, aria: b.getAttribute('aria-label'), badge: badge ? badge.innerText || 'dot' : null } })
  await tap(w, '#notifyBell', w.phone ? pic + '-tap' : null)
  await P.waitForTimeout(500)
  const lines = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="bell-line-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ id: e.dataset.testid.slice(10), unread: e.classList.contains('unread'), text: e.innerText.replace(/\s+/g, ' ').trim() })))
  const empty = await P.evaluate(() => { const l = document.querySelector('.bell-list'); return l ? l.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) : 'NO LIST' })
  if (pic) {
    const l = P.locator('.bell-list').first()
    if (await l.count() && !w.phone) { const bx = await l.boundingBox(); if (bx) await shot(w, pic, { clip: { x: Math.max(0, bx.x - 20), y: 0, width: Math.min(1536 - Math.max(0, bx.x - 20), bx.width + 40), height: Math.min(864, bx.y + bx.height + 20) } }); else await shot(w, pic) }
    else await shot(w, pic)
  }
  return { lit, lines, list: empty }
}
/* tap a line by its notice id; report where the app went */
export async function tapLine(w, nid, pic) {
  const P = w.page
  await tap(w, T('bell-line-' + nid), w.phone ? pic + '-tap' : null)
  await P.waitForTimeout(1200)
  const where = await P.evaluate(() => {
    const page = window.CURPAGE
    const win = document.querySelector('#inpEditSave') && document.querySelector('#inpEditSave').getBoundingClientRect().height > 0
    const title = [...document.querySelectorAll('.floatwin:not([hidden]) h2, .floatwin:not([hidden]) .fw-title, .modal h2, [data-testid="inp-title"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.trim()).join(' / ')
    const lit = [...document.querySelectorAll('td[data-testid^="cell-"].flash, td[data-testid^="cell-"].lit, td[data-testid^="cell-"].focus, td[data-testid^="cell-"].hl, .lw-flash')].map(e => e.dataset.testid).slice(0, 5)
    /* the first day drawn right of the names column: a day head whose left edge is at or past the "+LVE" column's right */
    const lve = [...document.querySelectorAll('th, td, div')].find(e => e.innerText && e.innerText.trim() === '+LVE' && e.getBoundingClientRect().width > 0)
    const edge = lve ? lve.getBoundingClientRect().right - 2 : 200
    const head = [...document.querySelectorAll('[data-testid^="head-"]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.left >= edge && r.left < window.innerWidth }).sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left).slice(0, 1).map(e => e.dataset.testid)
    return { page, inputWindow: win, title, lit, firstDayInView: head[0] || null }
  })
  if (pic) await shot(w, pic)
  return where
}
/* close an input's window opened by a line: its own Cancel */
export async function closeInput(w) {
  const c = w.page.locator('button:visible', { hasText: /^Cancel$/ }).first()
  if (await c.count()) { await c.click(); await w.page.waitForTimeout(500); return true }
  return false
}
export const undo = async w => { await tap(w, '#undoBtn'); await w.page.waitForTimeout(700) }
export const results = []
export function rec(r) { results.push(r); console.log(`${r.verdict}  ${r.id} [${r.size}] ${r.said}  pics: ${(r.pics || []).join(', ')}`) }
export function save(name) { writeFileSync(path.join(process.env.SCR || '.', name + '.json'), JSON.stringify(results, null, 1)) }
