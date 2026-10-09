// Walker A's helpers for the walk of "an input's own title" — the app is only ever driven through its controls;
// window.INPUTS / DAYS / PEOPLE / validate are READ, never written.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const BASE = 'http://localhost:4231/'
export const PIC = 'docs/img/handpass/2026-10-09-input-title-check/A'
export const ROWS_DIR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/5be0e123-6cd9-4081-8796-605c27ebd4b5/scratchpad'
mkdirSync(PIC, { recursive: true }); mkdirSync(ROWS_DIR, { recursive: true })
export const errs = []
export const launch = () => chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
export const SIZES = {
  desk: { name: 'desktop 1440x900', viewport: { width: 1440, height: 900 }, touch: false },
  short: { name: 'desktop 1440x700', viewport: { width: 1440, height: 700 }, touch: false },
  phone: { name: 'phone 390x844', viewport: { width: 390, height: 844 }, touch: true },
}
export const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export async function open(browser, size, who = 'ad', pass = 'a', { fresh = true } = {}) {
  const s = typeof size === 'string' ? SIZES[size] : size
  const ctx = await browser.newContext({ viewport: s.viewport, deviceScaleFactor: s.touch ? 2 : 1, ...(s.touch ? { isMobile: true, hasTouch: true } : {}), acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errs.push('http ' + r.status() + ' ' + r.url().slice(0, 100)) })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  page.touch = s.touch
  page.sizeName = s.name
  return { ctx, page }
}
export const press = (p, loc) => p.touch ? loc.tap() : loc.click()
export const tapAt = (p, loc, pos) => p.touch ? loc.tap({ position: pos }) : loc.click({ position: pos })
export const shot = async (p, name) => { await p.screenshot({ path: join(PIC, name + '.png') }); return name + '.png' }
export const elShot = async (p, sel, name) => { await p.locator(sel).first().screenshot({ path: join(PIC, name + '.png') }); return name + '.png' }
export const win = p => p.locator('[data-testid="win-inputedit"]')
export const DAYWIN = '[data-testid="win-inputsday"]'
export const sleep = (p, ms = 300) => p.waitForTimeout(ms)

export async function month(p, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(p, p.locator(d > 0 ? '#icNext' : '#icPrev'))
    await p.waitForTimeout(80)
  }
  throw new Error('month never reached')
}
export async function closeDayWin(p) {
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
}
export async function gotoInputs(p) { await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(250) }
/** the month's "+ Input" on a day, up to the open (new) window */
export async function openNew(p, iso) {
  await gotoInputs(p)
  const [y, m] = iso.split('-').map(Number)
  await closeAnyWin(p)
  await month(p, y, m)
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200) }
  await tapAt(p, p.locator(`#inpCal [data-icday="${iso}"]`), { x: 8, y: 8 })
  await press(p, p.locator('#icPopAdd'))
  await win(p).waitFor()
  await p.waitForTimeout(150)
}
export async function closeAnyWin(p) {
  for (let i = 0; i < 3; i++) {
    if (await win(p).count()) {
      const c = p.locator('#inpEditCancel')
      if (await c.count()) await press(p, c); else await p.keyboard.press('Escape')
      await p.waitForTimeout(200)
      const q = p.locator('[data-testid="inped-swap-go"]')
      if (await q.count()) await press(p, q)
    }
  }
  await closeDayWin(p)
}
/** open a saved input from the month: its date's cell, the card's open control */
export async function openSaved(p, iid, iso) {
  await gotoInputs(p)
  await closeAnyWin(p)
  const [y, m] = iso.split('-').map(Number)
  await month(p, y, m)
  await tapAt(p, p.locator(`#inpCal [data-icday="${iso}"]`), { x: 8, y: 8 })
  const c = p.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`)
  await c.waitFor()
  await press(p, c)
  await win(p).waitFor()
  await p.waitForTimeout(150)
}
/** Save/Add the window; answers the OIL question if one appears (answer yes|no), returns {head, refusal} */
export async function saveWin(p, oil = 'no') {
  await press(p, p.locator('#inpEditSave'))
  const sheet = p.locator('[data-testid="oilconf"]')
  let head = ''
  if (await sheet.waitFor({ timeout: 1100 }).then(() => true, () => false)) {
    head = (await sheet.locator('.airpop-head').innerText()).replace(/\s+/g, ' ').trim()
    await press(p, sheet.locator(`[data-testid="oil-${oil}"]`)); await press(p, sheet.locator('[data-testid="oilconf-save"]'))
  }
  await p.waitForTimeout(350)
  return head
}
export const people = p => p.evaluate(() => Object.fromEntries(Object.keys(window.PEOPLE).map(id => [window.PEOPLE[id].cs, id])))
export const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
/** read-only: the stored inputs matching a filter */
export const recs = (p, f = {}) => p.evaluate(f => window.INPUTS.filter(x => Object.keys(f).every(k => x[k] === f[k])).map(r => ({ iid: r.iid, person: r.person, type: r.type, title: r.title, hasTitle: 'title' in r && r.title != null, remarks: r.remarks, date: r.date, end: r.end, st: r.sTime, en: r.eTime, acc: r.acc, grp: r.grp, by: r.by })), f)
export const rec = async (p, f) => (await recs(p, f))[0] || null
export const allRecs = p => p.evaluate(() => window.INPUTS.map(r => ({ iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, end: r.end, grp: r.grp })))

/* the table */
export function table(name) {
  const rows = []
  return {
    rows,
    add(r) { rows.push(r); console.log(`${r.verdict}  #${r.n} ${r.size} ${r.role} — ${r.say.slice(0, 260)}`) },
    save() { writeFileSync(join(ROWS_DIR, `rows-${name}.json`), JSON.stringify(rows, null, 1)) },
  }
}
export function readRows() {
  const out = []
  for (const f of ['s5', 's6', 's7', 's9', 's10', 's11', 's12', 's13', 's14', 's15', 's16', 's17', 's22', 's23', 's24', 's26', 's27', 's36', 's49']) {
    try { out.push(...JSON.parse(readFileSync(join(ROWS_DIR, `rows-${f}.json`), 'utf8'))) } catch {}
  }
  return out
}
export const norm = s => (s || '').replace(/\s+/g, ' ').trim()
