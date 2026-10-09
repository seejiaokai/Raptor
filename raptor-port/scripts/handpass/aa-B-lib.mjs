/* Walker B's shared helpers for the ALL AVAIL / Event check (9 Oct 26). Drives the FROZEN build at LOOK_URL (4232). */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { publish as libPublish, lwCell } from './lib.mjs'

export const BASE = process.env.LOOK_URL || 'http://localhost:4232/'
export const PICS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-09-all-avail-event-check/B'
export const OUTJSON = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/aa-B.json'
mkdirSync(PICS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const tid = (page, id) => page.locator(`[data-testid="${id}"]`)

export const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  short: { viewport: { width: 390, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}

export async function world(size = 'desk', who = 'ad', fresh = true) {
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
  page.on('response', r => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`) })
  page.on('dialog', d => { errors.push(`NATIVE DIALOG ${d.message()}`); d.dismiss().catch(() => {}) })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await signIn(page, who)
  const touch = size !== 'desk'
  return { browser, ctx, page, errors, size, touch }
}
export async function signIn(page, who = 'ad') {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await sleep(500)
}
export async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await sleep(450)
}

/* ---- the table ---- */
export const TABLE = []
let SHOTN = 0
export function row(id, size, role, verdict, saw, pics = [], extra = {}) {
  TABLE.push({ id, size, role, verdict, saw, pics, ...extra })
  console.log(`== ${verdict}  ${id} [${size}/${role}]\n     saw: ${String(saw).slice(0, 1200)}`)
}
export async function pic(w, name) {
  const f = `${w.size}-${w.tag || 'x'}-${String(++SHOTN).padStart(2, '0')}-${name}.png`
  await w.page.mouse.move(0, 0).catch(() => {})
  await w.page.screenshot({ path: join(PICS, f) }).catch(() => {})
  return f
}
export function savePart(name, extra = {}) {
  let all = { parts: {} }
  if (existsSync(OUTJSON)) { try { all = JSON.parse(readFileSync(OUTJSON, 'utf8')) } catch {} }
  if (!all.parts) all.parts = {}
  all.parts[name] = { at: new Date().toISOString(), base: BASE, table: TABLE, ...extra }
  mkdirSync(join(OUTJSON, '..'), { recursive: true })
  writeFileSync(OUTJSON, JSON.stringify(all, null, 1))
  console.log('saved', name)
}

/* ---- the Inputs calendar to a month, a day, + Input ---- */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function inputsMonth(page, y = 2026, m = 6) {
  await go(page, 'inputs')
  if (await page.locator('#inCalBtn').count()) { await page.locator('#inCalBtn').click(); await sleep(300) }
  for (let i = 0; i < 60; i++) {
    const t = (await page.locator('#inpCal .ic-mon').first().innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + m - (+t[1] * 12 + MONTHS.findIndex(x => x.startsWith(t[0])))
    if (!d) break
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
}
/** Open the editor window for a date through the calendar (date corner → + Input). */
export async function openNew(page, iso) {
  const [y, m] = iso.split('-').map(Number)
  await inputsMonth(page, y, m - 1)
  for (let i = 0; i < 4; i++) { const x = page.locator('.floatwin .win-x:visible').first(); if (await x.count()) { await x.click(); await sleep(300) } else break }
  await page.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } })
  await page.locator('#icPopAdd').click()
  await page.waitForSelector('[data-testid="win-inputedit"]')
  await sleep(200)
}
export async function setTimes(page, s, e) {
  const ad = page.locator('#inpEditAllday')
  if (await ad.count() && await ad.isChecked()) await ad.uncheck()
  const set = async (sel, v) => { const l = page.locator(sel).first(); if (await l.count()) { await l.fill(v); await l.blur() } }
  if (s != null) await set('#inpEditStart', s)
  if (e != null) await set('#inpEditEnd', e)
}
/** File an input through the editor window. opts: iso, kind, person ('allavail' | 'all' | person id), rmk, s, e, oil: 'yes'|'no'|'cancel'|null
    Returns {oilShown, why, rec, winOpen}. */
export async function fileInput(page, o) {
  await openNew(page, o.iso || '2026-07-18')
  const win = page.locator('[data-testid="win-inputedit"]')
  await page.selectOption('#inpEditType', o.kind || 'Duty')
  if (o.person) await page.selectOption('#inpEditPerson', o.person)
  if (o.rmk != null) await page.fill('#inpEditRmk', o.rmk)
  if (o.s != null || o.e != null) await setTimes(page, o.s, o.e)
  await page.locator('#inpEditSave').click()
  await sleep(350)
  let oilShown = false
  if (await tid(page, 'oilconf').count()) {
    oilShown = true
    if (o.oil === 'yes') { await tid(page, 'oil-yes').click(); await tid(page, 'oilconf-save').click() }
    else if (o.oil === 'no') { await tid(page, 'oil-no').click(); await tid(page, 'oilconf-save').click() }
    else if (o.oil === 'cancel') { await page.locator('[data-testid="oilconf"] .abtn.ghost').click() }
    await sleep(350)
  }
  const why = (await tid(page, 'pp-why').count()) ? (await tid(page, 'pp-why').first().innerText()).trim() : null
  const rec = await page.evaluate(r => { const x = window.INPUTS.find(i => i.remarks === r); return x ? { iid: x.iid, person: x.person, type: x.type || x.kind, s: x.s, e: x.e, oil: x.oil, acc: x.acc } : null }, o.rmk)
  return { oilShown, why, rec, winOpen: await win.count() }
}
export async function timeFields(page) {
  return page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] input, [data-testid="win-inputedit"] select')].map(e => ({ id: e.id, type: e.type, v: e.value })))
}

/* ---- the schedule ---- */
export async function openBoard(page, di) {
  if (await page.locator('#schedBoard').count()) { const x = page.locator('#schedBoard').getByRole('button', { name: /Close|Done/ }).first(); if (await x.count()) { await x.click(); await sleep(500) } }
  await go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await page.waitForSelector('#schedBoard')
  await sleep(600)
}
export async function oilOn(page, on = true) {
  const pressed = async () => (await page.locator('#sbOil').getAttribute('aria-pressed')) === 'true'
  if ((await pressed()) !== on) { await page.locator('#sbOil').click(); await sleep(700) }
}
export async function openCount(page, iid, nth = 0) {
  const c = page.locator(`#schedBoard .oilcount[data-oilsent="i:${iid}"]:visible`).nth(nth)
  await c.click(); await sleep(500)
}
export async function tabTo(page, which) {
  const t = page.locator('.availwin .win-tab').nth(which === 'avail' ? 0 : 1)
  if (await t.count()) { await t.click(); await sleep(300) }
}
/** the open window: who is on / off / inert, the tab counts, the hint */
export async function winState(page) {
  return page.evaluate(() => {
    const w = document.querySelector('.availwin')
    if (!w) return null
    const seats = {}
    for (const s of w.querySelectorAll('.seat.oilpk')) seats[s.dataset.oilp] = ['on', 'off', 'inert'].find(k => s.classList.contains(k)) || '?'
    const tabs = [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim())
    const on = Object.values(seats).filter(v => v === 'on').length
    return { tabs, seats, on, total: Object.keys(seats).length, one: (w.querySelector('.win-one') || {}).innerText || '', text: w.innerText.replace(/\s+/g, ' ').slice(-400) }
  })
}
export async function seatTap(page, pid) {
  const s = page.locator(`.availwin .seat.oilpk[data-oilp="${pid}"]`).first()
  await s.scrollIntoViewIfNeeded(); await s.click(); await sleep(400)
}
export async function seatTitle(page, pid) {
  return page.locator(`.availwin .seat.oilpk[data-oilp="${pid}"]`).first().getAttribute('title')
}
export async function closeWin(page) { const x = page.locator('.availwin .win-x'); if (await x.count()) { await x.first().click(); await sleep(300) } }
/** sign the four and publish the day open on the board */
export async function pubDay(page, di) { return libPublish(page, di) }
/** a figure per person off the Leave War grid */
export async function credits(page, ids, iso = '2026-07-18') {
  const out = await lwCell(page, ids, iso)
  const o = {}
  for (const [k, v] of Object.entries(out)) o[k] = typeof v === 'string' ? v : v.text
  return o
}
/** a real reload WITHOUT ?fresh=1 (a fresh world keeps nothing); signs in again if the page asks */
export async function reload(page, who = 'ad') {
  await page.goto(BASE)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await sleep(600)
  if (await page.locator('#luser').count()) await signIn(page, who)
  await sleep(500)
}
export async function undoRedo(page, which) {
  // a first press of Undo in OIL Earn only leaves the mode (seen 9 Oct 26) — leave it by its own button first
  if ((await page.locator('#sbOil').getAttribute('aria-pressed')) === 'true') { await page.locator('#sbOil').click(); await sleep(600) }
  const b = page.locator('#schedBoard').getByRole('button', { name: which === 'undo' ? /Undo/ : /Redo/ }).first()
  await b.click(); await sleep(700)
}
/** open the Inputs List with every date shown */
export async function listAll(page) {
  await go(page, 'inputs')
  await page.locator('#inListBtn').click(); await sleep(500)
  if (!(await page.locator('#inRangeAll').count())) { const b = page.getByRole('button', { name: /→/ }).first(); if (await b.count()) { await b.click(); await sleep(300) } }
  const all = page.locator('#inRangeAll'); if (await all.count()) { await all.first().click(); await sleep(400) }
}
/** press the OIL chip of a List row for an input and answer */
export async function reanswer(page, iid, ans) {
  await listAll(page)
  const tr = page.locator(`tr[data-iid="${iid}"]`).first()
  await tr.locator('.roil').first().click(); await sleep(400)
  await tid(page, ans === 'yes' ? 'oil-yes' : 'oil-no').click()
  await tid(page, 'oilconf-save').click(); await sleep(500)
}

/** the "Who's available" tab of the open window: the set of men listed (data-awp) and the count chip */
export async function availSet(page) {
  return page.evaluate(() => {
    const w = document.querySelector('.availwin')
    if (!w) return null
    return { ids: [...w.querySelectorAll('[data-awp]')].map(e => e.dataset.awp), tabs: [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim()), one: (w.querySelector('.win-one') || {}).innerText || '', text: w.innerText.replace(/\s+/g, ' ').slice(0, 300) }
  })
}
/** warnings as listed in the day's warning list (its text lines) */
export async function warnLines(page) {
  return page.evaluate(() => { const s = document.querySelector('#sbSide'); return s ? s.innerText.split(/\n/).map(x => x.trim()).filter(Boolean).slice(0, 14) : null })
}
/** type into one of the board's Personal Inputs fields (data-ifld="<iid>.str|end|rmks") */
export async function typeIfld(page, iid, fld, v) {
  const l = page.locator(`#schedBoard [data-ifld="${iid}.${fld}"]`).first()
  await l.scrollIntoViewIfNeeded(); await l.click(); await l.fill(v); await l.blur(); await sleep(500)
}

/** a real finger over CDP: touchStart, touchMove (in steps), touchEnd */
export async function touchDrag(page, x1, y1, x2, y2, steps = 14, holdMs = 0) {
  const c = await page.context().newCDPSession(page)
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }]
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x1, y1) })
  if (holdMs) await sleep(holdMs)
  for (let i = 1; i <= steps; i++) { await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps) }); await sleep(18) }
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await c.detach().catch(() => {})
  await sleep(300)
}
