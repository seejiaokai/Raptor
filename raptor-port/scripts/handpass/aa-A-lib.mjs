// Walker A's shared helpers (all-avail / event check, 9 Oct 26). Drives the BUILT app at HP_URL (default :4231).
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const URL_ = process.env.HP_URL || 'http://localhost:4231/'
export const PIC = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-09-all-avail-event-check/A'
export const PARTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts'
mkdirSync(PIC, { recursive: true }); mkdirSync(PARTS, { recursive: true })
export const sleep = ms => new Promise(r => setTimeout(r, ms))

let _browser
export async function browser() {
  if (!_browser) _browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  return _browser
}
export async function closeAll() { if (_browser) await _browser.close(); _browser = null }

/** A fresh world, signed in. who: 'ad' | 'us'. size: 'd' desktop 1440x900 | 'p' phone 390x844 | 's' 390x568 */
export async function world({ who = 'ad', size = 'd', errs = [] } = {}) {
  const b = await browser()
  const opts = size === 'd' ? { viewport: { width: 1440, height: 900 } }
    : size === 'p' ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
    : { viewport: { width: 390, height: 568 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  const ctx = await b.newContext(opts)
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e)))
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(URL_)
  await signIn(page, who)
  return { ctx, page, errs, who, size }
}
export async function signIn(page, who) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', who); await page.fill('#lpass', who === 'ad' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
}
/** Sign out through the Logout button and sign in as another user, in the same world. */
export async function switchUser(page, who) {
  if (!(await page.locator('#logout').isVisible().catch(() => false))) { await page.locator('#burger').click(); await page.waitForTimeout(500); await page.locator('#drawerLogout').click() }
  else await page.locator('#logout').click()
  await page.waitForTimeout(500)
  const conf = page.getByRole('button', { name: /^(Logout|Sign out|Yes|Confirm|OK)/ })
  if (!(await page.locator('#luser').isVisible().catch(() => false)) && await conf.count()) { await conf.first().click(); await page.waitForTimeout(500) }
  await signIn(page, who)
}
export async function signOutIn(page, who) {
  // a reload keeps the saved world; the session may need a fresh sign-in
  await page.reload(); await page.waitForTimeout(800)
  if (await page.locator('#luser').count()) await signIn(page, who)
}
export async function pic(page, name, opts = {}) {
  const f = `${PIC}/${name}.png`
  await page.screenshot({ path: f, ...opts })
  return f
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function toInputs(page) {
  await page.evaluate(() => window.go('inputs'))
  await page.waitForSelector('#inpCal, #inListBtn', { timeout: 8000 })
  await page.waitForTimeout(400)
}
export async function calView(page) {
  // ensure the calendar view shows
  if (!(await page.locator('#inpCal').count())) {
    const b = page.locator('#inCalBtn, button[aria-label="Calendar"]').first()
    if (await b.count()) { await b.click(); await page.waitForTimeout(400) }
  }
}
export async function toMonth(page, year, mon0) {
  for (let i = 0; i < 60; i++) {
    const [name, y] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = year * 12 + mon0 - (+y * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
    await page.waitForTimeout(120)
  }
}
export async function closeWins(page) {
  for (let i = 0; i < 8; i++) {
    const xs = page.locator('[data-testid="win-inputedit-x"], [data-testid="win-inputsday-x"]')
    let clicked = false
    for (const x of await xs.all()) { if (await x.isVisible().catch(() => false)) { await x.click({ force: true }).catch(() => {}); await page.waitForTimeout(350); clicked = true; break } }
    if (!clicked) break
  }
}
export async function openDay(page, iso) {
  await closeWins(page)
  const [y, m] = iso.split('-').map(Number)
  await toMonth(page, y, m - 1)
  await page.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } })
  await page.waitForTimeout(350)
}
/** Open the editor window on a day via + Input. */
export async function openNew(page, iso) {
  await openDay(page, iso)
  await page.locator('#icPopAdd').click()
  await page.waitForSelector('[data-testid="win-inputedit"], #inpEditPop', { timeout: 5000 })
  await page.waitForTimeout(250)
}
export const T = s => `[data-testid="${s}"]`
export async function setTimes(page, start, end) {
  if (start != null) await page.fill('#inpEditStart', start)
  if (end != null) await page.fill('#inpEditEnd', end)
}
/** Answer an OIL question if it appears. ans 'yes' | 'no' | 'cancel' */
export async function oilAnswer(page, ans) {
  const q = page.locator(T('oilconf'))
  try { await q.waitFor({ state: 'visible', timeout: 1800 }) } catch { return false }
  if (ans === 'cancel') {
    const c = page.locator(T('oilconf-cancel')); if (await c.count()) await c.click(); else await page.keyboard.press('Escape')
  } else {
    await page.locator(T('oil-' + ans)).click()
    await page.locator(T('oilconf-save')).click()
  }
  await page.waitForTimeout(400)
  return true
}
/** File one input through the editor window on a day. Returns what the screen said right after Save. */
export async function fileInput(page, { iso, type = 'Duty', person, remarks = '', start = '09:00', end = '12:00', oil = null, keepOpen = false }) {
  await openNew(page, iso)
  await page.selectOption('#inpEditType', type)
  if (person) await page.selectOption('#inpEditPerson', person)
  const ad = page.locator('#inpEditAllday')
  if (await ad.count() && await ad.isChecked() && start) await ad.uncheck()
  if (start != null && await page.locator('#inpEditStart').count()) await setTimes(page, start, end)
  if (remarks) await page.fill('#inpEditRmk', remarks)
  await page.locator('#inpEditSave').click()
  await page.waitForTimeout(350)
  let asked = false
  if (oil) asked = await oilAnswer(page, oil)
  await page.waitForTimeout(250)
  return { asked }
}
export async function listAll(page) {
  await page.locator('#inListBtn').click(); await page.waitForTimeout(400)
  if (!(await page.locator('#inRangeAll').isVisible().catch(() => false))) {
    await page.locator('#inRangeBtn').click(); await page.waitForTimeout(250)
  }
  await page.locator('#inRangeAll').click(); await page.waitForTimeout(400)
  // the popup closes on an outside press
  await page.mouse.click(700, 880); await page.waitForTimeout(250)
}
export async function ensureFilters(page) {
  if (!(await page.locator('#inFPerson').isVisible().catch(() => false))) { await page.locator('#inFiltersBtn').click(); await page.waitForTimeout(350) }
}
export async function setPerson(page, value) { await ensureFilters(page); await page.selectOption('#inFPerson', value); await page.waitForTimeout(350) }
export async function listSearch(page, text) {
  await ensureFilters(page)
  const s = page.locator('input[placeholder="Search inputs"]:visible').first()
  await s.fill(text); await page.waitForTimeout(350)
}
export function listRow(page, text) { return page.locator('tr[data-iid]').filter({ hasText: text }).first() }
export async function pencil(page, text) {
  await listRow(page, text).locator('[data-edit]').click()
  await page.waitForSelector('tr.ined [data-ed="person"]', { state: 'visible', timeout: 5000 }); await page.waitForTimeout(300)
}
/** Admin: flip the members' filing switch behind the Inputs gear. Returns the checkbox state after saving (reopened). */
export async function membersSwitch(page, on) {
  const gear = page.locator('#inGear')
  await gear.click(); await page.waitForTimeout(500)
  const cb = page.locator(T('iset-memberfile'))
  if ((await cb.isChecked()) !== on) await cb.click()
  await page.locator(T('iset-save')).click(); await page.waitForTimeout(700)
  await gear.click(); await page.waitForTimeout(500)
  const state = await page.locator(T('iset-memberfile')).isChecked()
  await page.locator(T('iset-cancel')).click(); await page.waitForTimeout(300)
  return state
}
/** Admin, on the Inputs page: declare a date a public holiday (or Off day) through Calendar... > Holidays > + Add. */
export async function declareHoliday(page, iso, kind = 'ph', name = 'Walk holiday') {
  const [y, m] = iso.split('-').map(Number)
  await page.locator('#inGear').click(); await page.waitForTimeout(400)
  await page.locator(T('iset-days')).click(); await page.waitForTimeout(600)
  await page.locator(T('days-tab-holidays')).click(); await page.waitForTimeout(400)
  await page.locator(T('hol-add')).click(); await page.waitForTimeout(500)
  await page.locator(T('hol-kind-' + kind)).click()
  await page.locator(T('hol-name')).fill(name)
  for (let i = 0; i < 24; i++) {
    const lab = (await page.locator(T('holcal-month')).innerText()).trim().toLowerCase()
    const [mn, yy] = lab.split(/\s+/)
    const d = y * 12 + (m - 1) - (+yy * 12 + MONTHS.findIndex(x => x.startsWith(mn)))
    if (!d) break
    await page.locator(T(d > 0 ? 'holcal-next-month' : 'holcal-prev-month')).click(); await page.waitForTimeout(120)
  }
  const day = page.locator(T('holcal-day-' + iso))
  await day.click(); await page.waitForTimeout(150); await day.click(); await page.waitForTimeout(250)
  const sel = await page.locator(T('holcal-selection')).innerText().catch(() => '')
  await page.locator(T('hol-save')).click(); await page.waitForTimeout(800)
  // close the Calendar window and the settings window
  for (const x of await page.locator('[data-testid="win-days"] .win-x, [data-testid="win-days"] button[aria-label="Close"]').all()) await x.click().catch(() => {})
  await page.waitForTimeout(300)
  const cancel = page.locator(T('iset-cancel')); if (await cancel.count()) await cancel.click().catch(() => {})
  await page.waitForTimeout(300)
  return sel
}
/** Leave the in-row pencil editor without saving: go to the Calendar and back to the List. */
export async function closeRowEdit(page) {
  const c = page.locator('tr.ined [data-cancel]')
  if (await c.count()) { await c.first().click(); await page.waitForTimeout(350) }
}
export const PE ='tr.ined [data-ed="person"]'
export const PSAVE = 'tr.ined [data-save]'
export async function undoState(page) {
  return page.evaluate(() => ({ undoDisabled: document.querySelector('#undoBtn')?.disabled, undoTitle: document.querySelector('#undoBtn')?.title, redoDisabled: document.querySelector('#redoBtn')?.disabled, redoTitle: document.querySelector('#redoBtn')?.title }))
}
export async function toast(page) {
  return page.evaluate(() => [...document.querySelectorAll('.toast, [role=status], #toast, .snack')].map(e => e.innerText.trim()).filter(Boolean).join(' | '))
}
import * as L from './lib.mjs'
/** Issue a day (four sign-offs + Publish day / Publish AL) through the board's own controls. */
export async function issue(page, di) {
  await L.closeBoard(page)
  await L.go(page, 'inputs')
  await L.board(page, di)
  const r = await L.publish(page, di)
  await page.waitForTimeout(300)
  const pic_ = r
  await L.closeBoard(page)
  return pic_
}
/** The Leave War cells with a credit on a date: { callsign: text } and a count of HO/FO. */
export async function lwMap(page, iso = '2026-07-18') {
  await L.go(page, 'leavewar'); await page.waitForTimeout(1000)
  const mon = page.locator('[data-testid="month-JUL"]')
  if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1200) }
  const m = await page.evaluate(d => {
    const P = window.PEOPLE; const out = {}
    for (const c of document.querySelectorAll('[data-testid^="cell-"]')) {
      if (!c.dataset.testid.endsWith(d)) continue
      const t = (c.innerText || '').trim(); if (!t) continue
      const id = c.dataset.testid.slice(5, -(d.length + 1)); out[(P[id] && P[id].cs) || id] = t
    }
    return out
  }, iso)
  return m
}
export function crowdCount(m) { return Object.values(m).filter(t => /^(HO|FO)/.test(t)).length }
/** What is on the screen that a person would read as a window or a message right now. */
export async function observe(page) {
  return page.evaluate(() => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight) && getComputedStyle(e).visibility !== 'hidden'
    const wins = [...document.querySelectorAll('[data-testid^="win-"], [role=dialog], .modal, .airpop, [data-testid="oilconf"], [data-testid^="doc"], .sheet')].filter(vis).map(e => (e.dataset.testid || e.id || e.className.toString().slice(0, 30)) + ' :: ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 160))
    const fixed = [...document.querySelectorAll('body *')].filter(e => e.children.length < 3 && vis(e) && getComputedStyle(e).position === 'fixed' && (e.innerText || '').trim().length > 3 && (e.innerText || '').length < 300)
    const msgs = [...new Set([...document.querySelectorAll('.toast, [role=status], [role=alert], .snack, [data-testid="pp-why"], .inped-err, .err, .msg'), ...fixed].filter(vis).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean))]
    return { wins, msgs }
  })
}
export async function calBtn(page) { await page.locator('#inCalBtn').click(); await page.waitForTimeout(400) }
export async function readInputs(page, filter) {
  return page.evaluate(f => {
    const P = window.PEOPLE
    return window.INPUTS.filter(r => !f || (r.remarks || '').includes(f)).map(r => ({ iid: r.iid, person: r.person, name: (P[r.person] && P[r.person].cs) || r.person, type: r.type, s: r.s, e: r.e, oil: r.oil, acc: r.acc, remarks: r.remarks, grp: r.grp || r.group || null, by: r.by }))
  }, filter || '')
}
export async function bodyText(page, sel) {
  return (await page.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim()
}
export function saveRows(rows, errs, extra = {}) {
  writeFileSync(`${PARTS}/aa-A.json`, JSON.stringify({ rows, errs, ...extra }, null, 1))
}
export function loadRows() {
  try { return JSON.parse(readFileSync(`${PARTS}/aa-A.json`, 'utf8')) } catch { return { rows: [], errs: [] } }
}
