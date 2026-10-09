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
  page.setDefaultTimeout(10000)
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
export async function showEveryone(w) {
  const p = w.page
  if (!(await p.locator('#inFPerson').isVisible().catch(() => false))) { await p.locator('#inFiltersBtn').click().catch(() => {}); await sleep(250) }
  await p.selectOption('#inFPerson', 'all'); await sleep(250)
}
export async function openSaved(w, iso, iid) {
  const p = w.page
  await go(p, 'inputs')
  const calBtn = p.locator('#inCalBtn'); if (await calBtn.count() && await calBtn.isVisible().catch(() => false)) { await calBtn.click().catch(() => {}); await sleep(200) }
  await closeWins(p)
  if (w.who === 'us') await showEveryone(w)
  const [y, m] = iso.split('-').map(Number)
  await month(p, y, m)
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (w.touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await sleep(300)
  // a shared group's card carries ONE member's iid: try the ids given, then any row that carries a titled/remark tag
  const cand = (Array.isArray(iid) ? iid : [iid])
  let target = null
  for (const c of cand) { if (await p.locator(`[data-testid="idy-row-${c}"]`).count()) { target = c; break } }
  if (!target && typeof iid === 'string') {
    const rows = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="idy-row-"]')].map(e => e.dataset.testid.replace('idy-row-', '')))
    const grp = await p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? window.INPUTS.filter(x => x.date === r.date && x.by === r.by && x.type === r.type && x.remarks === r.remarks && x.s === r.s).map(x => x.iid) : [] }, iid)
    target = grp.find(g => rows.includes(g)) || iid
  }
  await press(w, p.locator(`[data-testid="idy-row-${target || cand[0]}"] [data-testid="idy-open"]`))
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
  if (o.allday) { const ad = p.locator('#inpEditAllday'); if (await ad.count() && !(await ad.isChecked())) await ad.check() }
  if (o.s != null || o.e != null) await setTimes(p, o.s, o.e)
  if (o.title != null) await p.fill('input#inpEditTitle', o.title)
  if (o.rmk != null) await p.fill('#inpEditRmk', o.rmk)
  const r = await saveWin(w, o.oil)
  await closeWins(p)
  return r
}
export const recBy = (p, f) => p.evaluate(f => { const r = window.INPUTS.find(x => Object.keys(f).every(k => x[k] === f[k])); return r ? { iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, endDate: r.endDate, s: r.s, e: r.e, acc: r.acc, oil: r.oil, by: r.by, hasTitle: 'title' in r } : null }, f)
export const recAll = (p, f) => p.evaluate(f => window.INPUTS.filter(x => Object.keys(f).every(k => x[k] === f[k])).map(r => ({ iid: r.iid, person: r.person, type: r.type, title: r.title, remarks: r.remarks, date: r.date, s: r.s, e: r.e, acc: r.acc, oil: r.oil, by: r.by })), f)
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
  try {
    await d.scrollIntoViewIfNeeded({ timeout: 4000 })
    if (w.touch) await d.tap({ timeout: 4000 }); else await d.click({ timeout: 4000 })
    await p.waitForSelector('#schedBoard', { timeout: 4000 })
  } catch (e) {
    // a phone's week shows a couple of days at a time: open the first day the week shows, then walk the board's own day arrows
    const first = p.locator('#eWeek [data-sbday]:visible').first()
    await first.scrollIntoViewIfNeeded().catch(() => {})
    if (w.touch) await first.tap(); else await first.click()
    await p.waitForSelector('#schedBoard'); await sleep(500)
    for (let i = 0; i < 8; i++) {
      const cur = await p.evaluate(() => window.SBDAY)
      if (cur === di) break
      const arrow = p.locator(cur < di ? '#sbNextDay:visible, button[title="Next day"]:visible' : '#sbPrevDay:visible, button[title="Previous day"]:visible').first()
      if (w.touch) await arrow.tap(); else await arrow.click()
      await sleep(500)
    }
  }
  await p.waitForSelector('#schedBoard'); await sleep(600)
}
export async function oilMode(p, on = true) {
  const coarse = await p.evaluate(() => matchMedia('(pointer: coarse)').matches)
  const hit = l => coarse ? l.tap() : l.click()
  const done = p.locator('#schedBoard button', { hasText: /OIL done/ }).first()
  const isOn = async () => (await done.count()) && await done.isVisible().catch(() => false)
  if (on && !(await isOn())) {
    const b = p.locator('#sbOil:visible').first()
    if (await b.count()) await hit(b)
    else { await hit(p.locator('#sbMore').first()); await sleep(450); await hit(p.locator('button:visible', { hasText: /^OIL Earn$/ }).first()) }
    await sleep(800)
  } else if (!on && (await isOn())) { await hit(done); await sleep(600) }
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

/** sign out through the app's own Logout and sign in as someone else (same page, same stored world) */
export async function switchUser(w, who) {
  const p = w.page
  let out = p.locator('button:visible', { hasText: /^Logout$/ }).first()
  if (!(await out.count())) { await p.locator('#burger').click().catch(() => {}); await sleep(500); out = p.locator('button:visible', { hasText: /^Logout$/ }).first() }
  await out.click(); await sleep(900)
  await signIn(p, who); w.who = who
}
/** the gear on the Inputs calendar: set "members may file for other people". Admin only. */
export async function setMemberFiling(w, on) {
  const p = w.page
  await go(p, 'inputs')
  const calBtn = p.locator('#inCalBtn'); if (await calBtn.count() && await calBtn.isVisible().catch(() => false)) { await calBtn.click().catch(() => {}); await sleep(200) }
  await closeWins(p)
  await press(w, p.locator('[data-testid="in-gear"]')); await sleep(500)
  const cb = p.locator('[data-testid="iset-memberfile"]')
  const was = await cb.isChecked()
  if (was !== on) await cb.setChecked(on)
  await press(w, p.locator('[data-testid="iset-save"]')); await sleep(700)
  const err = (await p.locator('[data-testid="iset-err"]').count()) ? await p.locator('[data-testid="iset-err"]').innerText() : ''
  await closeWins(p)
  return { was, now: on, err }
}
/** state of the open input window: fields, buttons, read-only marks */
export const winInfo = p => p.evaluate(() => {
  const g = id => document.querySelector(id)
  const t = g('#inpEditTitle'), ty = g('#inpEditType')
  const body = g('.inped-body')
  return {
    title: t ? t.value : null, titleInert: !!(t && t.closest('[inert]')), titleDisabled: !!(t && (t.disabled || t.readOnly)),
    type: ty ? ty.value : (g('#inpEditTypeFixed') ? g('#inpEditTypeFixed').textContent : null), typeInert: !!(ty && ty.closest('[inert]')),
    save: !!g('#inpEditSave'), del: !!g('#inpEditDel'), takeout: !!g('[data-testid="inped-takeout"]'), oilOwn: !!g('[data-testid="oil-revise-own"]'), oilRevise: !!g('[data-testid="oil-revise"]'),
    ro: g('[data-testid="inped-ro"]') ? g('[data-testid="inped-ro"]').innerText : null, placed: g('[data-testid="inped-placed"]') ? g('[data-testid="inped-placed"]').innerText : null,
    winTitle: g('[data-testid="win-inputedit"] .win-title, [data-testid="win-inputedit"] .floatwin-title') ? (g('[data-testid="win-inputedit"] .win-title, [data-testid="win-inputedit"] .floatwin-title').innerText) : null,
    bodyInert: !!(body && body.hasAttribute('inert')), cancel: g('#inpEditCancel') ? g('#inpEditCancel').innerText : null,
  }
})

/* ---- the List ---- */
export async function openList(w) {
  const p = w.page
  await go(p, 'inputs')
  await p.locator('#inListBtn').click(); await sleep(400)
  if (!(await p.locator('#inRangeAll').count())) { await p.locator('#inRangeBtn').click().catch(() => {}); await sleep(250) }
  const all = p.locator('#inRangeAll'); if (await all.count()) { await all.first().click().catch(() => {}); await sleep(400) }
  if (w.who === 'us') await showEveryone(w)
}
export const listRow = (p, iid) => p.locator(`#inBody tr[data-iid="${iid}"]`).first()
/** List pencil: open the row's editor. returns whether a pencil existed */
export async function pencil(w, iid) {
  const p = w.page
  await openList(w)
  const r = listRow(p, iid)
  await r.scrollIntoViewIfNeeded().catch(() => {})
  const pen = r.locator('[data-edit]').first()
  if (!(await pen.count())) return false
  await press(w, pen); await sleep(350)
  await p.locator('#inBody tr.ined').waitFor()
  return true
}
/** List pencil edit: set title (and optionally other fields), save, answer an OIL question if asked. Returns {head,asked}. */
export async function pencilSave(w, iid, { title, oil } = {}) {
  const p = w.page
  const ok = await pencil(w, iid)
  if (!ok) return { nopencil: true }
  const ed = p.locator('#inBody tr.ined')
  if (title != null) await ed.locator('input[data-ed="title"]').fill(title)
  await press(w, ed.locator('[data-save]'))
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
/** window edit of a saved input: open from the day card, set title (and type), save */
export async function winRetitle(w, iso, iid, { title, type, oil } = {}) {
  const p = w.page
  await openSaved(w, iso, iid)
  if (type) await p.selectOption('#inpEditType', type)
  if (title != null) await p.fill('input#inpEditTitle', title)
  const r = await saveWin(w, oil)
  await closeWins(p)
  return r
}

/** in the OPEN new-input window: choose several people. First = the base person from the select, rest toggled as pucks. */
export async function severalPick(w, ids) {
  const p = w.page
  await p.selectOption('#inpEditPerson', ids[0])
  const sw = C_win(p).locator('[data-testid="pp-several"]')
  if ((await sw.getAttribute('aria-checked')) !== 'true') { await press(w, sw); await sleep(300) }
  for (const id of ids) {
    const b = C_win(p).locator(`.pp-puck[data-pp="${id}"]`).first()
    await b.scrollIntoViewIfNeeded().catch(() => {})
    if ((await b.getAttribute('aria-pressed')) !== 'true') { await press(w, b); await sleep(200) }
  }
  return (await C_win(p).locator('[data-testid="pp-count"]').innerText().catch(() => ''))
}
/** file a shared input through the window. o: iso, type, ids[], title, s, e, rmk, oil */
export async function fileShared(w, o) {
  const p = w.page
  await openNew(w, o.iso)
  if (o.type) await p.selectOption('#inpEditType', o.type)
  const cnt = await severalPick(w, o.ids)
  if (o.s != null || o.e != null) await setTimes(p, o.s, o.e)
  if (o.title != null) await p.fill('input#inpEditTitle', o.title)
  if (o.rmk != null) await p.fill('#inpEditRmk', o.rmk)
  const r = await saveWin(w, o.oil)
  await closeWins(p)
  return { ...r, cnt }
}
const C_win = p => p.locator('[data-testid="win-inputedit"]')

/** go to a week on Edit Schedule by its Monday button label (e.g. 'Jul 27') */
export async function weekTo(w, label) {
  const p = w.page
  await go(p, 'editsched')
  const b = p.getByRole('button', { name: label, exact: true }).first()
  if (await b.count() && await b.isVisible().catch(() => false)) { await b.click(); await sleep(800); return }
  // a phone has no row of week buttons: the "Jump to a date" calendar
  const M3 = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const [mon, dd] = label.split(' '); const m = M3.indexOf(mon.toUpperCase()), d = +dd, y = 2026
  await press(w, p.locator('button[title="Jump to a date"]:visible').first()); await sleep(500)
  const head = async () => p.evaluate(() => { const e = [...document.querySelectorAll('div,span,b')].find(x => x.offsetParent && x.children.length === 0 && /^[A-Za-z]{3} d{4}$/.test((x.textContent || '').trim())); return e ? e.textContent.trim().toUpperCase() : '' })
  for (let i = 0; i < 24; i++) {
    const [mm, yy] = (await head()).split(' ')
    const diff = y * 12 + m - (+yy * 12 + M3.indexOf(mm))
    if (!diff) break
    await p.locator('#weekCal ' + (diff > 0 ? 'button:has-text("›")' : 'button:has-text("‹")')).first().click(); await sleep(250)
  }
  await press(w, p.locator('#weekCal button', { hasText: new RegExp('^' + d + '$') }).first()); await sleep(900)
}
/** the changes window's "All changes" tab text for the week now shown */
export async function changesText(w, { pic: picName } = {}) {
  const p = w.page
  await p.locator('#histBtn').click(); await sleep(600)
  const fw = p.locator('.chgwin').first()
  const tab = fw.getByText(/^All changes/).first()
  if (await tab.count()) { await tab.click(); await sleep(500) }
  const t = (await fw.innerText()).replace(/\s+/g, ' ').trim()
  let f = null
  if (picName) f = await pic(w, picName)
  const x = fw.locator('.win-x').first(); if (await x.count()) await x.click().catch(() => {}); await sleep(300)
  return { text: t, pic: f }
}

/** Insights: a man's work-hours figure of the week now shown (reading only). Needs the Edit Schedule page; closes it again. */
export async function workHours(w, name = 'Ranger') {
  const p = w.page
  await closeBoard(p); await go(p, 'editsched')
  await p.locator('#insightBtn').click(); await p.locator('#insightBody').waitFor(); await sleep(700)
  const t = await p.evaluate(nm => {
    const el = document.querySelector('#insightBody'); if (!el) return null
    const txt = el.innerText, rest = txt.slice(txt.search(/WORK HOURS/i))
    const lines = rest.split(/[\r\n]+/).map(x => x.trim()); const k = lines.indexOf(nm)
    return k >= 0 ? lines[k + 1] : '(no row for ' + nm + ')'
  }, name)
  await p.locator('#insightClose').click(); await sleep(300)
  return t
}

/* ---- hand-written Ground Programme rows on the open board ---- */
export async function addGroundRow(p, di, name, s, e, rmk) {
  const sel = d => [...document.querySelectorAll(`#schedBoard [data-bfld^="gr:${d}."][data-bfld$=".prog"]`)].map(x => x.dataset.bfld)
  const before = await p.evaluate(sel, di)
  await p.locator(`#schedBoard [data-gradd="${di}"]`).first().click(); await sleep(600)
  const after = await p.evaluate(sel, di)
  const mine = after.find(x => !before.includes(x))
  if (!mine) throw new Error('no new row appeared')
  const base = mine.replace(/\.prog$/, '')
  const typeIn = async (suffix, v) => { const l = p.locator(`#schedBoard [data-bfld="${base}.${suffix}"]`).first(); await l.click(); await l.fill(v); await l.blur(); await sleep(350) }
  if (rmk != null) await typeIn('rmks', rmk)
  if (s != null) await typeIn('str', s)
  if (e != null) await typeIn('end', e)
  if (name != null) await typeIn('prog', name)
  return base.replace(/^gr:/, 'g:')
}
export async function slotByRmk(p, rmk) {
  return p.evaluate(r => { const t = [...document.querySelectorAll('#schedBoard textarea[data-bfld^="gr:"][data-bfld$=".rmks"]')].find(x => x.value === r); return t ? t.dataset.bfld.replace(/^gr:/, 'g:').replace(/.rmks$/, '') : null }, rmk)
}
async function nPucks(p, slot, id) { return p.evaluate(([sl, x]) => { const z = document.querySelector('#schedBoard [data-fill="' + sl + '.+"]'); return z ? z.querySelectorAll('.puck[data-person="' + x + '"]').length : -1 }, [slot, id]) }
export async function putExtra(p, slot, id) {
  const before = await nPucks(p, slot, id)
  const z = p.locator(`#schedBoard [data-fill="${slot}.+"] .addz`).first()
  await z.scrollIntoViewIfNeeded(); const zb = await z.boundingBox(); await p.mouse.click(zb.x + zb.width / 2, zb.y + zb.height / 2); await sleep(250)
  const armed = await p.evaluate(() => window.ARM && window.ARM.key)
  if (!armed) return 'FAILED not armed'
  const r = p.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
  if (!(await r.count())) { await p.keyboard.press('Escape'); return 'FAILED not offered in the palette' }
  await r.scrollIntoViewIfNeeded(); await r.click(); await sleep(450)
  const after = await nPucks(p, slot, id)
  return after > before ? id : 'FAILED not seated (before ' + before + ', after ' + after + ')'
}
export async function putMain(p, slot, id) {
  const has = await p.locator(`#schedBoard [data-slot="${slot}"]:visible`).count()
  if (has) return put(p, `[data-slot="${slot}"]`, [id])
  return putExtra(p, slot, id)
}
export async function delGroundRow(p, slot) {
  const n = slot.replace('g:', '')
  await p.locator(`#schedBoard [data-grdel="${n}"]`).first().click(); await sleep(500)
}

/* ---- the OIL question (read and answer) ---- */
export async function qRead(p) {
  const s = p.locator('[data-testid="oilconf"]')
  if (!(await s.count())) return null
  const head = (await s.locator('.airpop-head').innerText()).replace(/\s*✕\s*$/, '').replace(/\s+/g, ' ').trim()
  const text = (await s.innerText()).replace(/\s+/g, ' ').trim()
  const btns = (await s.locator('button').allInnerTexts()).map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean)
  return { head, text, btns, ho: /HO — half a day/.test(text), fo: /FO — a full day/.test(text) }
}
export async function qWait(p, ms = 1500) { return p.locator('[data-testid="oilconf"]').waitFor({ timeout: ms }).then(() => true, () => false) }
export async function qCancel(w) { await press(w, w.page.locator('[data-testid="oilconf"] .abtn.ghost').first()); await sleep(400) }
export async function qAnswer(w, ans) {
  const s = w.page.locator('[data-testid="oilconf"]')
  await press(w, s.locator(`[data-testid="oil-${ans}"]`)); await press(w, s.locator('[data-testid="oilconf-save"]')); await sleep(600)
}

/* ---- the List's Add form ---- */
export async function listForm(w, o) {
  const p = w.page
  await go(p, 'inputs')
  await p.locator('#inListBtn').click(); await sleep(400)
  if (o.type) { await p.selectOption('#inType', o.type); await sleep(250) }   // the kind first: a leave (the default) fixes the person to the filer
  if (o.ids && o.ids.length > 1) {
    await p.selectOption('#inPerson', o.ids[0])
    const sw = p.locator('#page-inputs [data-testid="pp-several"]').first()
    if ((await sw.getAttribute('aria-checked')) !== 'true') { await press(w, sw); await sleep(300) }
    for (const id of o.ids) {
      const b = p.locator(`#page-inputs .pp-puck[data-pp="${id}"]`).first()
      await b.scrollIntoViewIfNeeded().catch(() => {})
      if ((await b.getAttribute('aria-pressed')) !== 'true') { await press(w, b); await sleep(200) }
    }
  } else if (o.person) await p.selectOption('#inPerson', o.person)
  if (o.title != null) await p.fill('#inTitle', o.title)
  if (o.rmk != null) await p.fill('#inRemarks', o.rmk)
  const d = p.locator(`#inCal [data-cal="${o.iso}"]`)
  await d.scrollIntoViewIfNeeded().catch(() => {})
  await press(w, d); await sleep(150); await press(w, d); await sleep(200)
  if (o.s != null) { await p.fill('#inStartT', o.s); await p.locator('#inStartT').blur() }
  if (o.e != null) { await p.fill('#inEndT', o.e); await p.locator('#inEndT').blur() }
}
export async function listAddPress(w) { const b = w.page.locator('#inAdd'); await b.scrollIntoViewIfNeeded().catch(() => {}); await press(w, b); await sleep(500) }

/* ---- the Scheduler Board's + INPUTS (Ground Programme) ---- */
export async function boardAddOpen(w, di) {
  const p = w.page
  await openBoard(w, di)
  const b = p.locator('#schedBoard button:visible', { hasText: /INPUTS/i }).first()
  await b.scrollIntoViewIfNeeded(); await press(w, b); await sleep(700)
  await p.locator('#inpEditPop').waitFor()
}

/* ---- the Leave War's cell for people on dates (reading only) ---- */
export async function lwCells(w, ids, isos) {
  const p = w.page
  await go(p, 'leavewar'); await sleep(1200)
  const out = {}
  for (const iso of isos) {
    const mon = p.locator(`[data-testid="month-${new Date(iso + 'T12:00:00Z').toLocaleString('en', { month: 'short', timeZone: 'UTC' }).toUpperCase()}"]`)
    if (await mon.count()) { await mon.first().click(); await sleep(900) }
    const r = await p.evaluate(([ids, d]) => { const o = {}; for (const id of ids) { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); o[window.PEOPLE[id] ? window.PEOPLE[id].cs : id] = c ? (c.innerText || '').trim() : 'NO CELL' } return o }, [ids, iso])
    out[iso] = r
  }
  return out
}
export async function undoBtn(w, which = 'undo') {
  const p = w.page
  const sel = which === 'undo' ? '#undoBtn:visible, #sbUndo:visible' : '#redoBtn:visible, #sbRedo:visible'
  const b = p.locator(sel).first()
  if (!(await b.count())) return { pressed: false, why: 'no button' }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled' }
  await press(w, b); await sleep(800)
  return { pressed: true }
}

/* ---- publishing through the board's own controls: the four sign-offs, then Publish day (first time) or Publish AL (amendment) ---- */
export async function signAll(w, di) {
  const p = w.page
  const sels = p.locator('#schedBoard .sb-sign select:visible, #schedBoard [data-sign] select:visible')
  const n = await sels.count()
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) { await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)]); await sleep(150) }
  }
  await sleep(400)
  return n
}
export async function publishOpenDay(w, di) {
  const p = w.page
  const n = await signAll(w, di)
  let btn = p.locator(`#schedBoard [data-beak="${di}"]:visible`).first()
  let kind = 'day'
  if (!(await btn.count())) { btn = p.locator(`#schedBoard [data-alpub="${di}"]:visible`).first(); kind = 'AL' }
  if (!(await btn.count())) return { published: false, why: 'no publish button', signs: n }
  const label = (await btn.innerText()).trim()
  if (await btn.isDisabled()) return { published: false, why: label, signs: n }
  await btn.scrollIntoViewIfNeeded().catch(() => {}); await press(w, btn); await sleep(900)
  const ok = p.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await press(w, ok); await sleep(900) }
  const ver = await p.evaluate(() => (document.querySelector('#schedBoard .verchip') || {}).innerText || '')
  return { published: true, kind, label, version: ver, signs: n }
}
export const dayFace = (p, di) => p.evaluate(di => { const d = window.DAYS[di]; return { tag: (document.querySelector('#schedBoard .verchip') || {}).innerText || '' } }, di)

/* ---- the ALL / ALL AVAIL count window on the Board ---- */
export async function openCount(w, iid, nth = 0) {
  const c = w.page.locator(`#schedBoard .oilcount[data-oilsent="i:${iid}"]:visible`).nth(nth)
  await c.scrollIntoViewIfNeeded().catch(() => {}); await press(w, c); await sleep(600)
}
export const winState = p => p.evaluate(() => {
  const w = document.querySelector('.availwin'); if (!w) return null
  const seats = {}
  for (const s of w.querySelectorAll('.seat.oilpk')) seats[s.dataset.oilp] = ['on', 'off', 'inert'].find(k => s.classList.contains(k)) || '?'
  const tabs = [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim())
  const head = (w.querySelector('.win-bar, .win-head, .floatwin-head') || w).innerText.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 3).join(' | ')
  return { head, tabs, seats, on: Object.values(seats).filter(v => v === 'on').length, off: Object.values(seats).filter(v => v === 'off').length, total: Object.keys(seats).length, text: w.innerText.replace(/\s+/g, ' ').slice(0, 260) }
})
export async function closeCountWin(w) { const x = w.page.locator('.availwin .win-x'); if (await x.count()) { await x.first().click(); await sleep(300) } }

/* names (and kind tags) of the request rows a week draws for a day; root '#eWeek' (edit) or '#vWeek' (view-only) */
export const weekNames = (p, root, di) => p.evaluate(([root, di]) => [...document.querySelectorAll(`${root} .day[data-day="${di}"] .pl-row.gr-frominput`)].map(r => ((r.querySelector(':scope > .nm .ntx') || {}).textContent || '').trim() + ((r.querySelector(':scope > .nm .nm-kind') || {}).textContent ? ' [' + r.querySelector(':scope > .nm .nm-kind').textContent + ']' : '')), [root, di])
export const pendChip = (p, di) => p.evaluate(di => { const b = document.querySelector(`#eWeek [data-pendlist="${di}"]`); return b ? b.innerText.replace(/\s+/g, ' ').trim() : '(none)' }, di)
export async function pendListText(w, di) {
  const p = w.page
  await go(p, 'editsched')
  const b = p.locator(`#eWeek [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return '(no pending button)'
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await press(w, b); await sleep(500)
  const t = await p.evaluate(() => { const e = document.querySelector('.chgwin'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(closed)' })
  const f = await pic(w, 'pendlist-' + Date.now() % 100000)
  await p.keyboard.press('Escape'); await sleep(250)
  return { text: t, pic: f }
}

/** the Inputs gear: set the late cut-off to "N days before the week starts"; returns {was, example} */
export async function setCutoffDays(w, n) {
  const p = w.page
  await go(p, 'inputs')
  const calBtn = p.locator('#inCalBtn'); if (await calBtn.count() && await calBtn.isVisible().catch(() => false)) { await calBtn.click().catch(() => {}); await sleep(200) }
  await closeWins(p)
  await press(w, p.locator('[data-testid="in-gear"]')); await sleep(500)
  const was = { mode: (await p.locator('[data-testid="iset-mode-days"]').getAttribute('aria-pressed')), lead: await p.locator('[data-testid="iset-lead"]').inputValue().catch(() => null) }
  await press(w, p.locator('[data-testid="iset-mode-days"]'))
  await p.locator('[data-testid="iset-lead"]').fill(String(n))
  const example = await p.locator('[data-testid="iset-example"]').innerText().catch(() => '')
  await press(w, p.locator('[data-testid="iset-save"]')); await sleep(700)
  const err = (await p.locator('[data-testid="iset-err"]').count()) ? await p.locator('[data-testid="iset-err"]').innerText() : ''
  await closeWins(p)
  return { was, example, err }
}
