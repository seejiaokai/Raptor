/* Walker W5 — the ORDERS and the LIFECYCLE of the absence record (26 Sep 26). Small helpers on top of ab-lib.mjs:
   the ONE timeline's Undo / Redo through whichever pair the page shows (the war's own, or the top bar's on Edit
   Schedule), a reload the way a person reloads (sign in again if the app asks), the war's manning cells for a date,
   and one "read everything about this man on this day" snapshot (his box and mark, his figures, the balance column).
   Everything drives the app's OWN controls; reads of window.* are for the evidence table only. Import AFTER setting
   process.env.AB_WHO. */
import { writeFileSync } from 'node:fs'
const L = await import('./ab-lib.mjs')
const { go, login, lwOpen, lwCell, rowRun, figures, lwBalCol, shot, closeSheets, toastSpy, toasts, sheetNow } = L

export const isPhone = (page) => page.evaluate(() => window.innerWidth < 768)

/** Undo / Redo on the ONE timeline, through the pair on screen: the war's (lw-undo / lw-redo) while on the Leave War,
    else the top bar's on Edit Schedule (#undoBtn / #redoBtn). Returns the button's label before the press (the title
    names the step), whether it was enabled, and the toasts it raised. */
export async function timeline(page, which = 'undo') {
  const onWar = await page.evaluate(() => window.CURPAGE === 'leavewar')
  const sel = onWar ? `[data-testid="lw-${which}"]:visible` : `#${which}Btn:visible`
  if (!onWar) { if (await page.locator('#schedBoard:visible').count()) await L.closeBoard(page); await go(page, 'editsched') }
  const b = page.locator(sel).first()
  if (!(await b.count())) return { pressed: false, why: 'no ' + which + ' button on ' + (onWar ? 'the war' : 'Edit Schedule') }
  const title = await b.getAttribute('title')
  if (await b.isDisabled()) return { pressed: false, why: 'disabled', title }
  await toasts(page)
  await b.click()
  await page.waitForTimeout(700)
  return { pressed: true, title, where: onWar ? 'war' : 'editsched', toasts: await toasts(page) }
}
export const undo = (page) => timeline(page, 'undo')
export const redo = (page) => timeline(page, 'redo')

/** Reload the page the way a person does (F5). The app keeps the session or asks to sign in again: answer as `who`. */
export async function reload(page, who = 'a') {
  await page.reload()
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForTimeout(800)
  let signedIn = true
  if (await page.locator('#luser:visible').count()) { signedIn = false; await login(page, who) }
  else await page.waitForSelector('#vWeek .day, #eWeek .day, [data-testid^="row-"]', { state: 'attached', timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(500)
  await toastSpy(page)
  return { askedToSignIn: !signedIn }
}

/** Every manning count cell on the war for one date (the rows' labels and the day's figure). */
export async function manning(page, iso) {
  return page.evaluate(d => Object.fromEntries([...document.querySelectorAll(`[data-testid^="count-"][data-testid$="-${d}"]`)]
    .map(e => [e.getAttribute('data-testid').replace(`-${d}`, '').replace('count-', ''), (e.innerText || '').replace(/\s+/g, ' ').trim()])), iso)
}

/** Everything a person can read about one man on the war for some dates: each box + mark, the balance column, every
    figure on his sheet, and the manning cells of the first date. The war must be open on the month. */
export async function snap(page, id, isos, { figs = true } = {}) {
  if (!(await page.locator(`[data-testid="cell-${id}-${isos[0]}"]`).count())) await lwOpen(page, isos[0])
  const run = await rowRun(page, id, isos)
  const bal = await lwBalCol(page, id)
  const man = await manning(page, isos[0])
  const f = figs ? await figures(page, id) : null
  return { run, bal: bal.bal, counter: bal.counter, man, figs: f }
}

/** The day list (tap list) or bid sheet on a man's day, read and closed again. */
export async function peek(page, id, iso) {
  const t = await L.tapCell(page, id, iso)
  await closeSheets(page)
  return t
}

/** Change the schedule's week the way a person does: the week chips on a desktop, the calendar on a phone. */
export async function changeWeek(page, iso) {
  const [y, m, d] = iso.split('-')
  if (!(await isPhone(page))) {
    const b = page.locator(`.page.on .wk[data-wk="${d}/${m}/${y}"]:visible`).first()
    if (await b.count()) { await b.click(); await page.waitForTimeout(1200); return 'week chip' }
  }
  const c = page.locator('.page.on .wk-cal:visible, .page.on .filt-cal:visible').first()
  if (!(await c.count())) return 'NO CALENDAR BUTTON'
  await c.click(); await page.waitForTimeout(500)
  const cell = page.locator(`#weekCal [data-wcal="${iso}"]`)
  if (!(await cell.count())) return 'NO DAY IN THE CALENDAR'
  await cell.click(); await page.waitForTimeout(1200)
  return 'calendar'
}
export const weekNow = (page) => page.evaluate(() => (window.DATES || [])[0])

/** Save a small JSON of what a step read, for the sheet. */
export function dump(file, obj) { writeFileSync(file, JSON.stringify(obj, null, 1)) }

export { L }
