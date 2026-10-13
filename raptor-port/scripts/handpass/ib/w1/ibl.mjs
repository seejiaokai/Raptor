/* Shared driver of the inputs-batch walk (walker 1, 13 Oct 26). Drives the build already served on :4187. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, appendFileSync, writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const PORT = path.resolve(HERE, '../../../..')                         // raptor-port
export const SHOTS = path.join(PORT, 'docs/img/handpass/2026-10-13-inputs-batch/w1')
export const RESULTS = path.join(HERE, 'results.jsonl')
export const BASE = 'http://localhost:4187'
mkdirSync(SHOTS, { recursive: true })
console.log('ibl version 1 — walker 1, base', BASE)

export const SIZES = {
  desktop: { viewport: { width: 1440, height: 900 }, tap: false },
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, tap: true },
  side: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, tap: true },
}
export const SAT = '2026-07-18', FRI = '2026-07-17', WED = '2026-07-15', FRI_DI = 4, WED_DI = 2
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'

export function record(id, size, status, note, pic = '') {
  console.log(`[${id} ${size}] ${status} — ${note}${pic ? ' — ' + pic : ''}`)
  appendFileSync(RESULTS, JSON.stringify({ id, size, status, note, pic }) + '\n')
}
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export async function launch() { return chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) }) }

/* a fresh context = a clean world; signs in as the scheduler ('a') or the member ('user') */
export async function session(browser, sizeName, who = 'a') {
  const sz = SIZES[sizeName]
  const { tap, ...use } = sz
  const ctx = await browser.newContext(use)
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errs.push('console.error ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + '/')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us')
  await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(500)
  const s = { browser, ctx, page, errs, tap, sizeName, shots: 0 }
  s.press = async sel => { const l = page.locator(sel).first(); if (tap) await l.tap(); else await l.click(); await page.waitForTimeout(150) }
  s.ev = (sel, fn) => page.locator(sel).first().evaluate(fn)
  return s
}
export async function go(page, to) {
  await page.evaluate(p => window.go(p), to)
  await page.waitForFunction(p => window.CURPAGE === p, to)
  await page.waitForTimeout(350)
}
export async function shot(s, name) {
  const f = path.join(SHOTS, `${name}.png`)
  await s.page.screenshot({ path: f })
  return path.relative(PORT, f).replace(/\\/g, '/')
}

/* an input filed through the Inputs calendar's own window (copied from e2e/oilwait.spec.ts fileIt) */
export async function fileIt(s, iso, spec) {
  const { page, press } = s
  await go(page, 'inputs')
  if ((await page.locator('#inCalBtn').getAttribute('aria-pressed')) !== 'true') await press('#inCalBtn')
  await page.locator('#inpCal').waitFor({ state: 'visible' })
  for (let i = 0; i < 36 && !(await page.locator(`[data-icday="${iso}"]`).count()); i++) {
    const [m, y] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
    await press(at < want ? '#icNext' : '#icPrev')
  }
  await page.locator(`[data-icday="${iso}"]`).focus()
  await page.keyboard.press('Enter')
  await page.locator('[data-testid="win-inputsday"]').waitFor({ state: 'visible' })
  await press('#icPopAdd')
  await page.locator('#inpEditPop #inpEditType').waitFor({ state: 'visible' })
  await page.selectOption('#inpEditPop #inpEditType', spec.type)
  if (spec.people.length > 1) {
    await press('#inpEditPop [data-testid="pp-several"]')
    for (const id of spec.people) if ((await page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(`#inpEditPop [data-pp="${id}"]`)
    const lit = await page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    for (const id of lit) if (!spec.people.includes(id)) await press(`#inpEditPop [data-pp="${id}"]`)
  } else await page.selectOption('#inpEditPop #inpEditPerson', spec.people[0])
  const ad = page.locator('#inpEditPop #inpEditAllday')
  if (spec.from) {
    if (await ad.count() && await ad.isChecked()) await ad.click()
    await page.fill('#inpEditPop #inpEditStart', spec.from); await page.fill('#inpEditPop #inpEditEnd', spec.to)
  } else if (await ad.count() && !(await ad.isChecked())) await ad.click()
  await page.fill('#inpEditPop #inpEditOwnTitle', spec.title)
  await press('#inpEditSave')
  if (await page.locator('[data-testid="oilconf"]').count()) { await press('[data-testid="oil-yes"]'); await press('[data-testid="oilconf-save"]') }
  await page.locator('#inpEditPop').waitFor({ state: 'hidden' })
  await page.locator('[data-testid="win-inputsday"]').waitFor({ state: 'visible' }).catch(() => {})
  await page.locator('[data-testid="win-inputsday-x"]').click()
  return page.evaluate(t => String(window.INPUTS.find(r => r.title === t).iid), spec.title)
}

/* Friday becomes a public holiday; the list opens by itself; answer = 'later' | 'yes' */
export async function makeHoliday(s, answer = 'later') {
  const { page, press } = s
  await go(page, 'inputs')
  await press('#inGear')
  await press('[data-testid="iset-days"]')
  if (await page.locator('[data-testid="days-tab-holidays"]').count()) await press('[data-testid="days-tab-holidays"]')
  await press('[data-testid="hol-add"]')
  await press('[data-testid="hol-kind-ph"]')
  await page.fill('[data-testid="hol-name"]', 'National Day')
  for (let i = 0; i < 14 && !(await page.locator(`[data-testid="holcal-day-${FRI}"]`).count()); i++) await press('[data-testid="holcal-prev-month"]')
  for (let i = 0; i < 40 && !(await page.locator(`[data-testid="holcal-day-${FRI}"]`).count()); i++) await press('[data-testid="holcal-next-month"]')
  await press(`[data-testid="holcal-day-${FRI}"]`)
  await press('[data-testid="hol-save"]')
  await page.locator('[data-testid="odl-lead"]').waitFor({ state: 'visible' })
  await page.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {})
  if (answer === 'yes') {
    await page.locator('[data-testid="odl-yesall"]').evaluate(e => e.click())
    await page.locator('[data-testid="odl-save"]').evaluate(e => e.click())
  } else await page.locator('[data-testid="odl-later"]').evaluate(e => e.click())
  await page.locator('[data-testid="win-oilday"]').waitFor({ state: 'detached' }).catch(() => {})
  await page.locator('[data-testid="win-days"] .win-x').evaluate(e => e.click()).catch(() => {})
  await page.waitForTimeout(250)
}

export async function openBoard(s, di) {
  const { page } = s
  await go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await page.locator('#sbBoard .sb-sec').first().waitFor({ state: 'attached' })
  await page.waitForTimeout(300)
}
export const rowsOf = (page, di) => page.evaluate(d => (window.DAYS[d].ground || []).filter(r => r && r.src).map(r => `${String(r.prog).toLowerCase()}:${r.who}${(r.more || []).map(m => '+' + m).join('')}@${r.src}`), di)
export const oilOf = (page, iid) => page.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === String(i)); return r ? (r.oil || {}) : 'GONE' }, iid)

/* open the board's folded Personal Inputs panel (press only when no rows show) */
export async function openPI(s, di) {
  const { page } = s
  const n = () => page.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow, #schedBoard .pinp .sbi-row').length)
  if (await n()) return n()
  const h = page.locator(`#schedBoard [data-pitog="${di}"]:visible`).first()
  if (await h.count()) { await h.evaluate(e => e.scrollIntoView({ block: 'center' })); await h.evaluate(e => e.click()); await page.waitForTimeout(500) }
  return n()
}
export function accBtn(page, iid, kind = 'g') { return page.locator(`#schedBoard [data-acc="${kind}"][data-acck="${iid}"]:visible`).first() }

/* take the input off the programme on the board; returns which control was used */
export async function takeOff(s, di, iid) {
  const { page } = s
  const ri = await page.evaluate(([d, i]) => (window.DAYS[d].ground || []).findIndex(r => r && String(r.src) === String(i)), [di, iid])
  const off = page.locator(`#sbBoard [data-grdel="${di}.${ri}"]`).first()
  const found = { grdel: await off.count(), undoCard: null }
  await openPI(s, di)
  found.undoCard = await page.locator(`#schedBoard [data-acc="x"][data-acck="${iid}"]:visible`).count()
  if (!found.grdel) throw new Error('no row ✕ found: ' + JSON.stringify(found))
  await off.evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (s.tap) await off.tap(); else await off.click()
  for (let i = 0; i < 30 && (await rowsOf(page, di)).length; i++) await page.waitForTimeout(100)
  return found
}
export async function pressAccept(s, di, iid) {
  const { page } = s
  await openPI(s, di)
  const acc = accBtn(page, iid)
  if (!(await acc.count())) throw new Error('no Accept button for ' + iid)
  await acc.evaluate(e => e.scrollIntoView({ block: 'center' }))
  const txt = (await acc.innerText()).trim()
  if (s.tap) await acc.tap(); else await acc.click()
  await page.waitForTimeout(400)
  return txt
}
export const onTopAndInside = (page, sel) => page.evaluate(sel => {
  const b = document.querySelector(sel)
  if (!b) return { there: false }
  const r = b.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { there: true, top: hit === b || b.contains(hit), inside: r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, box: [r.left, r.top, r.right, r.bottom].map(Math.round) }
}, sel)
export const whollyIn = (page, boxSel, sels) => page.evaluate(([boxSel, sels]) => {
  const box = document.querySelector(boxSel).getBoundingClientRect()
  return sels.map(q => { const el = document.querySelector(q); if (!el) return q + ':missing'; const r = el.getBoundingClientRect(); return (r.height > 0 && r.top >= box.top - 0.5 && r.bottom <= box.bottom + 0.5 && r.left >= box.left - 0.5 && r.right <= box.right + 0.5 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5) ? 'in' : q + ':OUT[' + [r.left, r.top, r.right, r.bottom].map(Math.round) + '] box[' + [box.left, box.top, box.right, box.bottom].map(Math.round) + ']' })
}, [boxSel, sels])
export const txt = (page, sel) => page.locator(sel).first().innerText().then(t => t.trim()).catch(() => null)

/* the premise route: file on Friday, make Friday a holiday (later), board on Friday, take the input off */
export async function route(s, { people = ['bane'], title = 'Range brief', holidayAnswer = 'later', takeoff = true } = {}) {
  const iid = await fileIt(s, FRI, { type: 'Training', people, from: '09:00', to: '12:00', title })
  await makeHoliday(s, holidayAnswer)
  await openBoard(s, FRI_DI)
  const pre = await rowsOf(s.page, FRI_DI)
  let found = null
  if (takeoff) found = await takeOff(s, FRI_DI, iid)
  return { iid, pre, found }
}
export const done = async (browser) => { await browser.close() }
export function findUndoBtn(page) {
  return page.evaluate(() => {
    const b = document.querySelector('#undoBtn') || [...document.querySelectorAll('button')].find(x => /^undo/i.test(x.title || x.getAttribute('aria-label') || ''))
    if (!b) return null
    const r = b.getBoundingClientRect()
    return { id: b.id, title: b.title, aria: b.getAttribute('aria-label'), text: b.innerText.trim(), disabled: b.disabled, vis: r.width > 0 && r.height > 0 }
  })
}
