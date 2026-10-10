// Walker C helpers (9 Oct 26) - everything goes through the app's own controls; reads use the probe bridge only to READ.
process.env.HP_URL = process.env.HP_URL || 'http://localhost:4233'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-10-09-all-avail-event-check/C'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { chromium } from '@playwright/test'
const A = await import('./am/w2-lib.mjs')
export const L = A
export const { go, board, closeBoard, editWeek, signDay, publishDay, publishAL, unpublish, head, planMenuItems, planMenuLook, planMenuPick, lookAt, switchTo, altPlan, pvBar, pvTap, menuLive, viewDay } = A
export const SHOTS = process.env.HP_SHOTS
export const BASE = process.env.HP_URL
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const ROWS = []
export function row(n, size, role, verdict, said, pics = []) { ROWS.push({ n, size, role, verdict, said, pics }); console.log(`[${n}] ${verdict} :: ${said}`) }
export function saveRows(letter = 'C') {
  writeFileSync(`C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/aa-${letter}-${process.argv[2] || 'part'}.json`, JSON.stringify(ROWS, null, 1))
}

export async function world({ width = 1440, height = 900, who = 'a', mobile = false, fresh = false } = {}) {
  const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
  const ctx = await browser.newContext({ viewport: { width, height }, ...(mobile ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(BASE + (fresh ? '/?fresh=1' : '/'))
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await A.login(page, who)
  return { browser, ctx, page, errors }
}
export async function shot(page, name) { const f = `${SHOTS}/${name}.png`; await page.screenshot({ path: f }); return f }

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export async function inputsPage(page) { await go(page, 'inputs'); await sleep(300) }
export async function calTo(page, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + m - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) break
    await page.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
}
export async function openDay(page, iso) {
  { const x = page.locator('#icPopClose:visible, button.win-x[aria-label^="Close"]:visible').first(); if (await x.count()) { await x.click(); await sleep(400) } }
  const [y, m] = iso.split('-').map(Number)
  await calTo(page, y, m - 1)
  await page.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } })
  await sleep(300)
}
/** File an input through the editor window. oil: 'yes' | 'no' | null (cancel nothing - leaves question if any appears).
    Returns what appeared. */
export async function fileInput(page, f) {
  // f: {iso, kind, person ('allavail'|'all'|pid), s, e, rmk, oil}
  await inputsPage(page)
  await openDay(page, f.iso)
  await page.locator('#icPopAdd').click()
  await page.waitForSelector('[data-testid="win-inputedit"], #inpEditPop', { state: 'visible' })
  if (f.kind) await page.selectOption('#inpEditType', f.kind)
  if (f.person) await page.selectOption('#inpEditPerson', f.person)
  if (f.s) await page.fill('#inpEditStart', f.s)
  if (f.e) await page.fill('#inpEditEnd', f.e)
  if (f.rmk != null) await page.fill('#inpEditRmk', f.rmk)
  await page.locator('#inpEditSave').click()
  await sleep(400)
  return await answerOil(page, f.oil)
}
export async function answerOil(page, oil) {
  const q = page.locator('[data-testid="oilconf"]')
  const asked = (await q.count()) && await q.first().isVisible().catch(() => false)
  if (asked && oil) {
    await page.locator(`[data-testid="oil-${oil}"]`).click()
    await page.locator('[data-testid="oilconf-save"]').click()
    await sleep(500)
  }
  return { asked }
}
export const rec = (page, rmk) => page.evaluate(r => { const x = window.INPUTS.find(i => i.remarks === r); return x && { iid: x.iid, person: x.person, type: x.type, date: x.date, endDate: x.endDate, acc: x.acc, s: x.s, e: x.e, oil: x.oil } }, rmk)
export const closeWins = async page => { for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape'); await sleep(150) } }

/** Saturday 18 Jul = day index 5. Publish the day through the board: four sign-offs then Publish day / Publish AL. */
export async function pubSat(page, di = 5) {
  await board(page, di)
  await signDay(page, di, 0)
  let p = await publishDay(page, di)
  if (!p.pressed) p = await publishAL(page, di)
  await sleep(500)
  // a confirm may follow
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await sleep(700) }
  return p
}
export const headOf = async (page, di = 5) => head(page, di)

/** Leave War cell text for a person on an iso date. */
export async function lw(page, pid, iso = '2026-07-18') {
  return await L.lwCell(page, [pid], iso)
}
export const pidOf = (page, cs) => page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c) || null, cs)
export async function eligible(page, di = 5) {
  // read the ALL AVAIL crowd the schedule shows - reading only
  return page.evaluate(() => [...document.querySelectorAll('.oilcount')].map(e => ({ t: e.innerText, oilsent: e.dataset.oilsent })))
}

/** The pending count the day's own button says (edit week) - '0' when there is no button. Must be on the edit week. */
export async function pend(page, di = 5) {
  await editWeek(page)
  const b = page.locator(`#eWeek [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return { n: 0, text: '(none)' }
  const t = (await b.innerText()).replace(/\s+/g, ' ').trim()
  return { n: +(/(\d+)/.exec(t) || [0, 0])[1], text: t }
}
export async function pendListText(page, di = 5) {
  await editWeek(page)
  const b = page.locator(`#eWeek [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return '(no pending button)'
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(450)
  const t = await page.evaluate(() => { const p = document.querySelector('#pendList'); return p ? p.innerText.replace(/\s+/g, ' ').trim() : '(closed)' })
  await shot(page, 'pendlist-' + Date.now() % 100000)
  await page.keyboard.press('Escape'); await sleep(200)
  return t
}
const CTRL = ['Ranger', 'Saber', 'Basher', 'Ace']
/** What the Leave War's day cell says for four control men on a date (empty string = nothing credited). */
export async function cr(page, iso = '2026-07-18', names = CTRL) {
  const ids = []
  for (const n of names) ids.push(await pidOf(page, n))
  const o = await L.lwCell(page, ids.filter(Boolean), iso)
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? v : (v.text || '')]))
}
export const crS = o => Object.entries(o).map(([k, v]) => `${k}:${v || '0'}`).join(' ')
/** The day's face on the edit week: version tag, who has signed (the four selects), pending, the count chip text. */
export async function face(page, di = 5) {
  await editWeek(page)
  const h = await head(page, di)
  const p = await pend(page, di)
  const cnt = await page.evaluate(i => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] .oilcount`)].map(e => e.innerText.trim()), di)
  return { tag: h.tag.replace(/\s+/g, ' '), signs: h.signs.map(s => s.replace('— name —', '·')).join('|'), signState: h.signState, pend: p.text, count: cnt.join(',') }
}
export const fs = f => `${f.tag} | signs ${f.signs} | ${f.signState} | pending ${f.pend} | count ${f.count}`
/** the one Undo / Redo - wherever it is visible (top bar or the board's). */
export async function undoRedo(page, dir) {
  const sels = dir === 'undo' ? ['#undoBtn', '#sbUndo'] : ['#redoBtn', '#sbRedo']
  for (const s of sels) {
    const b = page.locator(`${s}:visible`).first()
    if (await b.count()) {
      if (await b.isDisabled()) return { pressed: false, why: 'disabled', title: await b.getAttribute('title') }
      const title = await b.getAttribute('title'); await b.click(); await sleep(800); return { pressed: true, title }
    }
  }
  return { pressed: false, why: 'no button' }
}
export async function reload(page) {
  await page.reload(); await sleep(600)
  if (await page.locator('#luser').count()) await A.login(page, 'a')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(400)
}
/** Drag the ALL AVAIL puck off its ground row on the open board (drop it on empty space). */
export async function dragPuckOff(page, sel = '#schedBoard .sb-arow .puck.allavail:visible') {
  const el = page.locator(sel).first()
  await el.scrollIntoViewIfNeeded()
  const b = await el.boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + 40, b.y + 40, { steps: 5 })
  await page.mouse.move(700, 400, { steps: 10 })
  await page.mouse.move(1000, 400, { steps: 10 })
  await page.mouse.up(); await sleep(700)
}

/** Open the board for Saturday, turn OIL Earn on, open the first count's window and read who earns. Leaves the window OPEN
    unless keep=false. pids: ids to report on. Returns {head, on:{pid:true/false}, title}. */
export async function earnRead(page, pids = [], { keep = false, tap = null, di = 5 } = {}) {
  await board(page, di)
  await L.oilMode(page, true)
  const cnt = page.locator('#schedBoard .oilcount:visible').first()
  if (!(await cnt.count())) return { head: '(no count on the board)', on: {} }
  await cnt.scrollIntoViewIfNeeded(); await cnt.click(); await sleep(600)
  if (tap) { const t = page.locator(`.availwin .seat.oilpk[data-oilp="${tap}"]`).first(); await t.scrollIntoViewIfNeeded(); await t.click(); await sleep(700) }
  const r = await page.evaluate(ps => {
    const w = document.querySelector('.availwin'); if (!w) return { head: '(no window)', on: {} }
    const on = {}; for (const p of ps) { const e = w.querySelector(`.seat.oilpk[data-oilp="${p}"]`); on[p] = e ? (e.classList.contains('on') ? 'on' : 'OFF') : 'absent' }
    const m = /Who earns OIL[^]*?(\d+ of \d+)/.exec(w.innerText.replace(/\s+/g, ' '))
    return { head: m ? m[1] : w.innerText.replace(/\s+/g, ' ').slice(0, 120), on, title: (w.innerText.split('\n')[0] || '') }
  }, pids)
  await shot(page, 'earn-' + (Date.now() % 100000))
  if (!keep) { const x = page.locator('.availwin button', { hasText: '✕' }).first(); if (await x.count()) await x.click(); await sleep(300); await L.oilMode(page, false) }
  return r
}

/** Open a saved input's editor window from its day card (Inputs page). */
export async function openSaved(page, iso, rmk) {
  await inputsPage(page)
  await openDay(page, iso)
  await page.locator('[data-testid^="idy-row-"]', { hasText: rmk }).first().click(); await sleep(500)
}
/** Re-answer the OIL question of a saved input through its own "Change..." in the editor. */
export async function reanswer(page, iso, rmk, ans) {
  await openSaved(page, iso, rmk)
  await page.locator('[data-testid="oil-revise"]').click(); await sleep(400)
  await page.locator(`[data-testid="oil-${ans}"]`).click()
  await page.locator('[data-testid="oilconf-save"]').click(); await sleep(500)
  const open = await page.locator('#inpEditPop:visible').count()
  if (open) { const sv = page.locator('#inpEditSave:visible'); if (await sv.count()) { await sv.click(); await sleep(500) } }
  await closeWins(page)
}
export const oilOf = (page, rmk) => page.evaluate(r => { const x = window.INPUTS.find(i => i.remarks === r); return x && x.oil }, rmk)

/** Delete a saved input from its editor (Inputs page); answers a confirm if one is asked. */
export async function deleteSaved(page, iso, rmk) {
  await openSaved(page, iso, rmk)
  await page.locator('#inpEditDel').click(); await sleep(500)
  for (const sel of ['[data-testid="inped-delall"]', '[data-testid="inped-delconfirm"]', '[data-testid="inped-del-yes"]']) {
    const b = page.locator(`${sel}:visible`).first(); if (await b.count()) { await b.click(); await sleep(500) }
  }
  const dlg = page.getByRole('button', { name: /^(Delete|Yes|Confirm|Remove)/ }).first()
  if (await page.locator('#inpEditPop:visible').count() && await dlg.count() && await dlg.isVisible().catch(() => false) && (await dlg.getAttribute('id')) !== 'inpEditDel') { await dlg.click(); await sleep(500) }
  await closeWins(page)
}

/** The figure columns of a man's Leave War row (the OIL columns) - must be on the Leave War page already (cr() leaves it there). */
export async function figs(page, name) {
  const id = await pidOf(page, name)
  return page.evaluate(i => {
    const c = document.querySelector(`[data-testid^="cell-${i}-"]`)
    const tr = c && c.closest('tr'); if (!tr) return 'no row'
    return [...tr.querySelectorAll('td')].slice(0, 10).map(t => (t.innerText || '').replace(/\s+/g, ' ').trim()).join(' | ')
  }, id)
}

/** Change a saved input's Person in its editor and save; answers the OIL question if it comes back. Returns {asked}. */
export async function changePerson(page, iso, rmk, person, oil) {
  await openSaved(page, iso, rmk)
  await page.selectOption('#inpEditPerson', person)
  await page.locator('#inpEditSave').click(); await sleep(500)
  const r = await answerOil(page, oil)
  await closeWins(page)
  return r
}

/** Drag an input's bar on the Inputs month onto another date (real mouse). */
export async function moveBar(page, iid, toIso) {
  await inputsPage(page)
  const [y, m] = toIso.split('-').map(Number); await calTo(page, y, m - 1)
  const bar = page.locator(`[data-testid="ib-bar-${iid}"]`).first()
  await bar.scrollIntoViewIfNeeded()
  const b = await bar.boundingBox()
  const cell = page.locator(`#inpCal [data-icday="${toIso}"]`).first()
  const c = await cell.boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2 + 6, b.y + b.height / 2 + 6, { steps: 4 })
  await page.mouse.move(c.x + c.width / 2, c.y + c.height / 2 + 10, { steps: 14 })
  await sleep(150)
  await page.mouse.up(); await sleep(600)
  return await page.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x && { date: x.date, endDate: x.endDate, oil: x.oil } }, iid)
}

/** Press an accepted request's "Take off" (data-acc="x") in the board's Personal Inputs panel. */
export async function takeOff(page, di, iid) {
  await board(page, di)
  await L.openInputs(page, di)
  const b = page.locator(`#schedBoard [data-acc="x"][data-acck="${iid}"]:visible`).first()
  if (!(await b.count())) return { pressed: false, why: 'no Take off button for ' + iid }
  const label = ((await b.innerText()) + ' / ' + (await b.getAttribute('title'))).trim()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(700)
  await closeBoard(page)
  return { pressed: true, label }
}
export const lastIid = (page, rmk) => page.evaluate(r => { const a = window.INPUTS.filter(i => i.remarks === r); return a.length ? a[a.length - 1].iid : null }, rmk)

const HM = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
async function openHolidays(page) {
  await go(page, 'leavewar'); await sleep(1000)
  await page.locator('[data-testid="settings-open"]').click(); await sleep(400)
  await page.locator('[data-testid="settings-days"]').click(); await sleep(700)
  await page.locator('[data-testid="days-tab-holidays"]').click(); await sleep(400)
}
/** Declare a date a public holiday through Leave War gear -> Calendar... -> Holidays -> + Add. */
export async function declarePH(page, iso) {
  await openHolidays(page)
  await page.locator('[data-testid="hol-add"]').click(); await sleep(400)
  await page.locator('[data-testid="hol-kind-ph"]').click()
  const at = async () => { const [m, y] = (await page.locator('[data-testid="holcal-month"]').textContent()).trim().toLowerCase().split(/\s+/); return +y * 12 + HM.indexOf(m) }
  let d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
  for (; d > 0; d--) await page.locator('[data-testid="holcal-next-month"]').click()
  for (; d < 0; d++) await page.locator('[data-testid="holcal-prev-month"]').click()
  await page.locator(`[data-testid="holcal-day-${iso}"]`).click(); await sleep(200)
  await page.locator('[data-testid="hol-save"]').click(); await sleep(700)
  const said = await page.evaluate(() => (document.querySelector('[data-testid="hol-saved"], [data-testid="hol-err"]') || {}).innerText || '')
  await page.keyboard.press('Escape'); await sleep(300)
  return said
}
/** Delete the holiday line that mentions `words` (e.g. '15 Jul'). */
export async function removePH(page, words) {
  await openHolidays(page)
  const line = page.locator('[data-testid="hol-list"] > *', { hasText: words }).first()
  if (!(await line.count())) return 'no such line'
  await line.click(); await sleep(500)
  await page.locator('[data-testid="hol-delete"]').click(); await sleep(700)
  return 'deleted'
}
/** Open the bell and return what it lists. */
export async function bellText(page) {
  await page.locator('button.bellbtn:visible').first().click(); await sleep(600)
  const t = await page.evaluate(() => { const e = document.querySelector('.bellpanel, .notifs, [data-testid*="bell"], .bellpop'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 500) : null })
  return t
}

/** Change a saved input's end time (and re-answer if the question comes back). */
export async function changeEnd(page, iso, rmk, end, oil) {
  await openSaved(page, iso, rmk)
  await page.fill('#inpEditEnd', end)
  await page.locator('#inpEditSave').click(); await sleep(500)
  const r = await answerOil(page, oil)
  await closeWins(page)
  return r
}

const MON3 = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
/** Jump the edit week to the week holding an ISO date through the week calendar button ("Jump to a date"). */
export async function jumpWeek(page, iso) {
  await go(page, 'editsched'); await sleep(300)
  await page.locator('.wk-cal:visible').first().click(); await sleep(500)
  const [y, m, d] = iso.split('-').map(Number)
  const head = async () => await page.evaluate(() => { const e = [...document.querySelectorAll('div,span,b')].find(x => x.offsetParent && x.children.length === 0 && /^[A-Za-z]{3} \d{4}$/.test((x.textContent || '').trim())); return e ? e.textContent.trim().toUpperCase() : '' })
  for (let i = 0; i < 24; i++) {
    const [mm, yy] = (await head()).split(' ')
    const diff = y * 12 + (m - 1) - (+yy * 12 + MON3.indexOf(mm))
    if (!diff) break
    await page.locator('#weekCal ' + (diff > 0 ? 'button:has-text("›")' : 'button:has-text("‹")')).first().click(); await sleep(250)
  }
  await page.locator('#weekCal button', { hasText: new RegExp('^' + d + '$') }).first().click(); await sleep(900)
}
/** Archive a man through Admin -> Users -> his row -> Archive (from today). */
export async function archivePerson(page, pid) {
  await go(page, 'admin'); await sleep(500)
  if (!(await page.locator('#accList:visible').count())) { await page.getByText('Sign-in and roster').first().click(); await sleep(600) }
  await page.locator(`#accList [data-person="${pid}"]`).first().click(); await sleep(400)
  await page.getByRole('button', { name: 'Archive', exact: true }).first().click(); await sleep(700)
}
