// Walker C helpers for the "input's own title" walk (9 Oct 26). Everything is done through the app's own controls;
// the probe bridge (window.INPUTS, window.DAYS, window.validate) is only used to READ.
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const BASE = 'http://localhost:4233/'
export const ROOT = 'C:/Users/User/projects/Raptor/raptor-port'
export const PICS = ROOT + '/docs/img/handpass/2026-10-09-input-title-check/C'
export const ROWSDIR = ROOT + '/scripts/handpass/it-C-rows'
mkdirSync(PICS, { recursive: true }); mkdirSync(ROWSDIR, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export const SIZES = {
  desk: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
export const DAYWIN = '[data-testid="win-inputsday"]'
export const win = p => p.locator('[data-testid="win-inputedit"]')

export async function launch() { return chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) }

/** a fresh clean world, signed in. who: 'ad' (Saber, admin) or 'us' (Ranger, member). fresh=false keeps storage across a reload. */
export async function world(size = 'desk', who = 'ad', { fresh = true, browser = null } = {}) {
  const b = browser || await launch()
  const ctx = await b.newContext(SIZES[size])
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 220)) })
  page.on('pageerror', e => errors.push('pageerror: ' + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  page.on('dialog', d => { errors.push('NATIVE DIALOG ' + d.message()); d.dismiss().catch(() => {}) })
  await page.goto(BASE + (fresh ? '?fresh=1' : ''))
  await signIn(page, who)
  return { browser: b, ctx, page, errors, size, touch: size === 'phone', who }
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
export const press = (w, loc) => w.touch ? loc.tap() : loc.click()
export async function reload(w) {
  await w.page.reload(); await sleep(700)
  if (await w.page.locator('#luser').count()) await signIn(w.page, w.who)
  await w.page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
}

/* ---- rows of the table ---- */
export const ROWS = []
export function row(n, size, role, verdict, said, pics = []) { ROWS.push({ n, size, role, verdict, said, pics }); console.log(`[${n} ${size}/${role}] ${verdict} :: ${String(said).slice(0, 900)}`) }
export function saveRows(name) { writeFileSync(join(ROWSDIR, name + '.json'), JSON.stringify(ROWS, null, 1)); console.log('saved rows', name, ROWS.length) }
let N = 0
export async function pic(w, name) {
  const f = `${w.size}-${name}.png`
  await w.page.mouse.move(0, 0).catch(() => {})
  await w.page.screenshot({ path: join(PICS, f) }).catch(() => {})
  N++
  return f
}
export async function elPic(w, sel, name) {
  const f = `${w.size}-${name}.png`
  await w.page.locator(sel).first().screenshot({ path: join(PICS, f) }).catch(async () => { await w.page.screenshot({ path: join(PICS, f) }) })
  return f
}

/* ---- Inputs calendar ---- */
export async function month(p, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  throw new Error('calendar never reached month')
}
export async function closeWins(p) {
  for (let i = 0; i < 4; i++) {
    const x = p.locator('.floatwin .win-x:visible').first()
    if (await x.count()) { await x.click().catch(() => {}); await sleep(250) } else break
  }
  if (await p.locator(DAYWIN).count()) { await p.keyboard.press('Escape'); await sleep(250) }
}
/** the month's "+ Input" on a day, up to the open window */
export async function openNew(w, iso) {
  const p = w.page
  await go(p, 'inputs')
  const calBtn = p.locator('#inCalBtn'); if (await calBtn.count() && await calBtn.isVisible().catch(() => false)) { await calBtn.click().catch(() => {}); await sleep(200) }
  await closeWins(p)
  const [y, m] = iso.split('-').map(Number)
  await month(p, y, m)
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (w.touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await sleep(250)
  await press(w, p.locator('#icPopAdd'))
  await win(p).waitFor()
  await sleep(200)
}
/** open the day card (calendar) then a saved input's window by iid */
export async function openSaved(w, iso, iid) {
  const p = w.page
  await go(p, 'inputs')
  const calBtn = p.locator('#inCalBtn'); if (await calBtn.count() && await calBtn.isVisible().catch(() => false)) { await calBtn.click().catch(() => {}); await sleep(200) }
  await closeWins(p)
  const [y, m] = iso.split('-').map(Number)
  await month(p, y, m)
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (w.touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await sleep(300)
  await press(w, p.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`))
  await win(p).waitFor(); await sleep(200)
}
export async function setTimes(p, s, e) {
  const ad = p.locator('#inpEditAllday')
  if (await ad.count() && await ad.isChecked().catch(() => false)) await ad.uncheck()
  const set = async (sel, v) => { const l = p.locator(sel).first(); if (await l.count()) { await l.fill(v); await l.blur() } }
  if (s != null) await set('#inpEditStart', s)
  if (e != null) await set('#inpEditEnd', e)
}
/** press Save in the window; if the OIL question appears, read its heading and answer (oil: 'yes'|'no'|'cancel'|undefined=leave open).
    Returns { head, asked }. */
export async function saveWin(w, oil) {
  const p = w.page
  await press(w, p.locator('#inpEditSave'))
  const sheet = p.locator('[data-testid="oilconf"]')
  let head = '', asked = false
  if (await sheet.waitFor({ timeout: 1200 }).then(() => true, () => false)) {
    asked = true
    head = (await sheet.locator('.airpop-head').innerText()).replace(/\s+/g, ' ').trim()
    if (oil === 'yes' || oil === 'no') { await press(w, sheet.locator(`[data-testid="oil-${oil}"]`)); await press(w, sheet.locator('[data-testid="oilconf-save"]')) }
    else if (oil === 'cancel') await press(w, sheet.locator('.abtn.ghost').first())
  }
  await sleep(450)
  return { head, asked }
}
/** the OIL question's whole text (when open) */
export async function oilText(p) {
  const s = p.locator('[data-testid="oilconf"]')
  return (await s.count()) ? (await s.first().innerText()).replace(/\s+/g, ' ').trim() : null
}
/** file a new input via the window. o: iso, type, person, title, s, e, rmk, oil */
export async function fileNew(w, o) {
  const p = w.page
  await openNew(w, o.iso)
  if (o.type) await p.selectOption('#inpEditType', o.type)
  if (o.person) await p.selectOption('#inpEditPerson', o.person)
  if (o.s != null || o.e != null) await setTimes(p, o.s, o.e)
  if (o.title != null) await p.fill('#inpEditTitle', o.title)
  if (o.rmk != null) await p.fill('#inpEditRmk', o.rmk)
  const r = await saveWin(w, o.oil)
  await closeWins(p)
  return r
}
export const recBy = (p, f) => p.evaluate(f => { const r = window.INPUTS.find(x => Object.keys(f).every(k => x[k] === f[k])); return r ? { iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, s: r.s, e: r.e, acc: r.acc, oil: r.oil, hasTitle: 'title' in r } : null }, f)
export const recAll = (p, f) => p.evaluate(f => window.INPUTS.filter(x => Object.keys(f).every(k => x[k] === f[k])).map(r => ({ iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, s: r.s, e: r.e, acc: r.acc, oil: r.oil })), f)
export const pid = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)

/* ---- schedule ---- */
export async function closeBoard(p) {
  if (!(await p.locator('#schedBoard').count())) return
  const x = p.locator('#schedBoard').getByRole('button', { name: /Close|Done/ }).first()
  if (await x.count()) { await x.click(); await sleep(500) } else { await p.keyboard.press('Escape'); await sleep(400) }
}
export async function openBoard(w, di) {
  const p = w.page
  await closeBoard(p)
  await go(p, 'editsched')
  const d = p.locator(`#eWeek [data-sbday="${di}"]:visible`).first()
  if (w.touch) await d.tap(); else await d.click()
  await p.waitForSelector('#schedBoard'); await sleep(600)
}
export async function oilMode(p, on = true) {
  const pressed = async () => (await p.locator('#sbOil').getAttribute('aria-pressed')) === 'true'
  if ((await pressed()) !== on) { await p.locator('#sbOil').click(); await sleep(700) }
}
/** the warning list on the open board ('#sbSide' text lines) */
export const warnLines = p => p.evaluate(() => { const s = document.querySelector('#sbSide'); return s ? s.innerText.split(/\n/).map(x => x.trim()).filter(Boolean) : null })
/** read-only: validate().all as plain lines for a day */
export const warnAll = (p, di) => p.evaluate(di => window.validate().all.filter(x => di == null || x.di === di).map(x => ({ di: x.di, sev: x.sev, code: x.code, msg: x.msg, who: x.who })), di)

export async function finish(w, name) {
  saveRows(name)
  console.log('ERRORS:', JSON.stringify([...new Set(w.errors)].slice(0, 12)))
  writeFileSync(join(ROWSDIR, name + '.errors.json'), JSON.stringify([...new Set(w.errors)], null, 1))
  await w.browser.close()
}

/* ---- board: arm a seat and drop a person from the crew palette (real clicks) ---- */
export async function tapBoard(p, sel, n = 0) {
  const el = p.locator(`#schedBoard ${sel}:visible`).nth(n)
  await el.waitFor({ state: 'visible', timeout: 8000 })
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sleep(120)
  try { await el.click({ timeout: 2500 }) } catch {
    await el.evaluate(e => { const r = e.getBoundingClientRect(); window.scrollBy(0, r.top - window.innerHeight * 0.68) })
    await sleep(150)
    const b = await el.boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  }
  await sleep(260)
}
export async function put(p, armSel, pids) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await tapBoard(p, armSel); await sleep(220)
    const armed = await p.evaluate(() => window.ARM && window.ARM.key)
    if (!armed) continue
    let picked = null
    for (const id of pids) {
      const r = p.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
      if (!(await r.count())) continue
      await r.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(100)
      try { await r.click({ timeout: 2500 }) } catch { const b = await r.boundingBox(); if (b) await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
      await sleep(350); picked = id; break
    }
    if (!picked) { await p.keyboard.press('Escape'); return 'FAILED nobody offered for ' + armSel }
    const filled = await p.evaluate(([sel, id]) => [...document.querySelectorAll('#schedBoard ' + sel)].some(s => !!s.querySelector(`[data-person="${id}"]`) || s.dataset.person === id), [armSel, picked])
    if (filled) return picked
  }
  return 'FAILED ' + armSel
}
/** put person on an SC MAIN shift on the day di (a new wave from "+ Wave" then "SC"); returns the shift's text */
export async function scShift(w, di, person) {
  const p = w.page
  await openBoard(w, di)
  await tapBoard(p, `[data-wvadd="${di}"]`); await sleep(500)
  await p.getByRole('button', { name: 'SC', exact: true }).first().click(); await sleep(900)
  const r = await put(p, `[data-slot="${di}.0.0.0.p"]`, [person])
  const shift = await p.evaluate(di => { const wv = window.DAYS[di].waves[0]; return JSON.stringify({ label: wv.label, to: wv.to, ld: wv.ld, kind: wv.kind, type: wv.type, str: wv.str, end: wv.end }) }, di)
  return { r, shift }
}
