/* SHARED PIECES for the walks of the small OIL job (`[OIL-UNCANCEL-UNASKED]` D816, `[OIL-LOAD-VERSION-UNASKED]` D818):
   the fixtures made by the app's own controls and the readers of the question, the bar, the list and the passing note.
   Used by ou-walk-2.mjs and by the helper's own scripts; ou-walk.mjs carries its own copy (written first, left as walked).
   env: DL_BASE (the served build), DL_SHOTS (the pictures' folder). */
import { L, inputsCal, openAdd, fillForm, rowOut, part } from './tb/w3/lib.mjs'
export { L, inputsCal, openAdd, fillForm, rowOut, part }
export const SAT = 5, FRI = 4, WED = 2, SAT_ISO = '2026-07-18', FRI_ISO = '2026-07-17', WED_ISO = '2026-07-15'

export const noteNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.5 ? (t.textContent || '') : '' })
export const rec = (p, id) => p.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === id); return r ? { cx: !!r.cx, cxr: r.cxr || '', info: !!r.info, oil: r.oil || null, date: r.date, acc: r.acc || '' } : null }, id)
/** open the Scheduler Board on a day (closing it first if it is open on another) */
export async function board(w, di) {
  const p = w.page
  if (await p.evaluate(() => window.CURPAGE) !== 'editsched') await L.go(w, 'editsched')
  await closeBoard(w)
  await p.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.waitForSelector('#schedBoard .sb-sec', { state: 'attached' }); await L.sleep(600)
}
export async function closeBoard(w) {
  const p = w.page
  const open = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return !!b && !b.hidden && !!b.getClientRects().length })
  if (open) { await p.evaluate(() => { const d = document.querySelector('#sbDone'); if (d) d.click() }); await L.sleep(450) }
}
/** press one of the board row's own buttons for an input: attr = grcx | grinfo | grdel */
export async function rowBtn(w, di, id, attr) {
  const p = w.page
  const sel = await p.evaluate(([di, id, attr]) => { const ri = window.DAYS[di].ground.findIndex(g => String(g.src) === id); return ri < 0 ? null : `#schedBoard [data-${attr}="${di}.${ri}"]` }, [di, id, attr])
  if (!sel) throw new Error(`the input's row is not on day ${di}'s Ground Programme`)
  await p.locator(sel).first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
  await L.sleep(350)
}
/** the OIL question's sheet, as read */
export const sheet = p => p.evaluate(() => {
  const s = document.querySelector('[data-testid="oilconf"]'); if (!s) return null
  const t = sel => (s.querySelector(sel)?.textContent || '').replace(/\s+/g, ' ').trim()
  const save = s.querySelector('[data-testid="oilconf-save"]')
  return { head: t('.airpop-head b'), lead: t('[data-testid="oilconf-lead"]'), no: t('[data-testid="oilconf-cancel"]'), yes: t('[data-testid="oilconf-save"]'), yesDisabled: !!save && save.disabled }
})
/** the "not answered" bar, as read and measured */
export const bar = p => p.evaluate(() => {
  const b = document.querySelector('[data-testid="oilbar"]'); if (!b) return null
  const txt = b.querySelector('[data-testid="oilbar-text"]'), tr = txt.getBoundingClientRect()
  const lh = parseFloat(getComputedStyle(txt).lineHeight) || 16
  const btns = [...b.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(); return { t: x.textContent.trim(), top: Math.round(q.top), right: Math.round(q.right) } })
  return { text: txt.textContent.trim(), lines: Math.round(tr.height / lh), cut: txt.scrollWidth > txt.clientWidth + 1, inside: btns.every(x => x.right <= innerWidth + 0.5), oneRow: btns.every(x => Math.abs(x.top - btns[0].top) < 3) }
})
/** the day's one list of open OIL questions, as read: its heading's small line, its count, the inputs it lists, and
    whether its first Yes can be reached (it is the top thing at its own middle — not behind the board) */
export const list = p => p.evaluate(() => {
  const win = document.querySelector('[data-testid="win-oilday"]'); if (!win) return null
  const ids = [...win.querySelectorAll('[data-testid^="odl-yes-"]')].map(x => x.getAttribute('data-testid').slice(8))
  const y = win.querySelector('[data-testid^="odl-yes-"]'); let reach = null
  if (y) { y.scrollIntoView({ block: 'center' }); const r = y.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); reach = !!top && (top === y || y.contains(top)) }
  const t = document.getElementById('toastEl'); let noteOver = false
  if (t && +getComputedStyle(t).opacity > 0.5) { const a = t.getBoundingClientRect(); noteOver = [...win.querySelectorAll('button')].some(b => { const q = b.getBoundingClientRect(); return q.width && !(q.right <= a.left || q.left >= a.right || q.bottom <= a.top || q.top >= a.bottom) }) }
  return { head: (win.querySelector('.win-bar')?.textContent || '').replace(/\s+/g, ' ').trim(), count: (win.querySelector('[data-testid="odl-count"]')?.textContent || '').replace(/\s+/g, ' ').trim(), ids, reach, noteOver }
})
/** file a one-man Training input on a date through the Inputs calendar; answers the OIL question at the save where it
    is asked (`oil`: 'yes' | 'no'); returns its id */
export async function file(w, iso, who, title, { oil = 'yes', start = '09:00', end = '10:00' } = {}) {
  const p = w.page
  await inputsCal(w, iso.slice(0, 8) + '13')
  await openAdd(w, iso)
  await fillForm(w, { type: 'Training', person: who, start, end, title })
  const before = await p.evaluate(() => window.INPUTS.map(x => String(x.iid)))
  await w.press('#inpEditSave'); await L.sleep(700)
  let asked = false
  if (await p.locator('[data-testid="oilconf"]').count()) { asked = true; await w.press(`[data-testid="oil-${oil}"]`); await L.sleep(150); await w.press('[data-testid="oilconf-save"]'); await L.sleep(700) }
  const id = await p.evaluate(b => { const n = window.INPUTS.find(x => !b.includes(String(x.iid))); return n ? String(n.iid) : null }, before)
  const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click())
  await L.sleep(250)
  return { id, asked }
}
/** put the cancel (with a reason) or the information-only mark on an input's row, on the board of the day it is on */
export async function mark(w, di, id, what, reason = 'WX') {
  const p = w.page
  await board(w, di)
  if (what === 'cx') { await rowBtn(w, di, id, 'grcx'); await p.fill('#cxReason', reason); await p.locator('#cxSave').evaluate(e => e.click()); await L.sleep(500) }
  else { await rowBtn(w, di, id, 'grinfo'); await L.sleep(400) }
  await closeBoard(w)
}
/** change an input's date in its own window (from the day it is on to another day of the same month) */
export async function moveDate(w, fromIso, id, toIso) {
  const p = w.page
  await inputsCal(w, fromIso.slice(0, 8) + '13')
  await p.locator(`[data-icday="${fromIso}"]`).focus(); await p.keyboard.press('Enter')
  await p.waitForSelector(`[data-testid="idy-row-${id}"]`)
  await w.press(`[data-testid="idy-row-${id}"] [data-testid="idy-open"]`)
  await p.waitForSelector('#inpEditPop #inpEdCal')
  await w.press(`#inpEdCal [data-cal="${toIso}"]`); await L.sleep(250)
  await w.press('#inpEditSave'); await L.sleep(900)
  const asked = !!(await p.locator('[data-testid="oilconf"]').count())
  const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click())
  await L.sleep(250)
  return asked
}
/** THE FIXTURE (the designer's S15): filed on Wednesday, marked on the board, moved to Saturday while marked — a marked
    input on a non-working day with no OIL answer */
export async function fixture(w, who, title, what = 'cx') {
  const f = await file(w, WED_ISO, who, title)
  await mark(w, WED, f.id, what)
  const asked = await moveDate(w, WED_ISO, f.id, SAT_ISO)
  return { id: f.id, asked, now: await rec(w.page, f.id) }
}
/** take the cancel off from the board's cancel sheet (the row's CX, then "Un-cancel") */
export async function uncx(w, di, id) {
  const p = w.page
  await rowBtn(w, di, id, 'grcx')
  await p.waitForSelector('#cxPop:not([hidden]) #cxUn')
  await p.locator('#cxUn').evaluate(e => e.click()); await L.sleep(500)
}
/** make a day a public holiday: Inputs ⚙ → Calendar → Holidays → + Add. Returns what the day's one list did. */
export async function makeHoliday(w, iso, name = 'Walk holiday') {
  const p = w.page, tid = t => p.locator(`[data-testid="${t}"]`)
  await L.go(w, 'inputs')
  await w.press('#inGear'); await L.sleep(350)
  await w.press('[data-testid="iset-days"]'); await L.sleep(600)
  if (await tid('days-tab-holidays').count()) { await w.press('[data-testid="days-tab-holidays"]'); await L.sleep(300) }
  await w.press('[data-testid="hol-add"]'); await L.sleep(450)
  await w.press('[data-testid="hol-kind-ph"]')
  await tid('hol-name').fill(name)
  /* the picker opens on today's month, and the walk's week is July 2026: step towards it by the month it shows */
  for (let i = 0; i < 36 && !(await tid(`holcal-day-${iso}`).count()); i++) {
    const [m, y] = (await tid('holcal-month').innerText()).trim().toLowerCase().split(/\s+/)
    const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const at = +y * 12 + MON.findIndex(x => m.startsWith(x)), want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
    await w.press(`[data-testid="holcal-${at < want ? 'next' : 'prev'}-month"]`)
  }
  await w.press(`[data-testid="holcal-day-${iso}"]`); await L.sleep(200)
  await w.press('[data-testid="hol-save"]'); await L.sleep(900)
  return { list: await list(p), note: await noteNow(p) }
}
export async function closeWindows(w) {
  const p = w.page
  for (const t of ['win-oilday-x', 'win-inputsset-x', 'win-days-x', 'win-inputsday-x']) { const x = p.locator(`[data-testid="${t}"]`); if (await x.count()) { await x.first().evaluate(e => e.click()); await L.sleep(200) } }
  await p.evaluate(() => document.querySelectorAll('[data-testid="win-days"] .win-x').forEach(e => e.click())); await L.sleep(200)
}
/** load a published version back onto the working copy: the day's plan selector → the issued version → "Load onto
    working copy" (a second press where it first asks to discard unpublished edits). `where`: 'week' | 'board' */
export async function loadVersion(w, di, where = 'week') {
  const p = w.page, scope = where === 'board' ? '#schedBoard' : '#eWeek'
  await p.locator(`${scope} [data-planmenu="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() }); await L.sleep(400)
  /* the first issued version the menu lists is the Original; its id is the day's date and a number */
  const ver = await p.locator('[data-planpv]').first().getAttribute('data-planpv')
  await p.locator(`[data-planpv="${ver}"]`).first().evaluate(e => e.click()); await L.sleep(600)
  const btn = () => p.locator(`${scope} button[data-restore="${di}"][data-rver="${ver}"]`).first()
  const first = (await btn().textContent() || '').replace(/\s+/g, ' ').trim()
  await btn().evaluate(e => e.click()); await L.sleep(500)
  let second = ''
  if (await p.locator(`${scope} button[data-restore="${di}"][data-rver="${ver}"]`).count()) { second = (await btn().textContent() || '').replace(/\s+/g, ' ').trim(); await btn().evaluate(e => e.click()); await L.sleep(600) }
  return { first, second, note: await noteNow(p), list: await list(p) }
}
