/* Walker W1 — the Inputs CALENDAR (the full-screen month view) and the Inputs doors for leave / course / OD
   ([HUMAN-RETEST] the absence record, 26 Sep 26). Gesture drivers on top of ab-lib.mjs.

   The calendar's two pointer machines (src/ui/caldrag.ts, src/ui/InputsCal.tsx):
     - a CHIP: a mouse arms after 4 px of movement (no hold); a finger arms after a 180 ms still hold, gives up past
       26 px of travel before arming; the drop is the day cell under the pointer at release;
     - EMPTY cell space: a 450 ms still hold opens the add dialog for exactly that date; a release after a >= 50 px
       mostly-sideways travel pages the month (left = next); a still tap opens the day popover.
   Everything here drives those gestures through the browser's own input (page.mouse for a mouse, CDP
   Input.dispatchTouchEvent for a finger — the same pointer events a phone sends). Reads of window.* are for the
   evidence table only; nothing here writes through window. */
process.env.AB_WHO ||= 'w1'
export * from './ab-lib.mjs'
import { inputsView, shot, go, login, lwOpen, rowRun, lwBalCol } from './ab-lib.mjs'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** Open the Inputs calendar (the page's Calendar view) and page it to `ym` ('2026-07') through its own arrows. */
export async function calOpen(page, ym) {
  if (!(await page.locator('#inpCal:visible').count())) await inputsView(page, 'cal')
  await page.waitForSelector('#inpCal', { timeout: 8000 })
  const want = `${MONTHS[+ym.slice(5, 7) - 1]} ${ym.slice(0, 4)}`
  for (let i = 0; i < 30; i++) {
    const cur = (await page.locator('#inpCal .ic-mon').textContent()).trim()
    if (cur === want) break
    const [m, y] = cur.split(' ')
    const at = `${y}-${String(MONTHS.indexOf(m) + 1).padStart(2, '0')}`
    await page.locator(at < ym ? '#icNext' : '#icPrev').click()
    await page.waitForTimeout(320)
  }
  await page.waitForTimeout(300)
  return (await page.locator('#inpCal .ic-mon').textContent()).trim()
}
export const calMonth = page => page.locator('#inpCal .ic-mon').textContent().then(s => s.trim()).catch(() => 'NO CALENDAR')

/** Leave the calendar through its own close (Back to list). */
export async function calClose(page) {
  if (await page.locator('#icClose:visible').count()) { await page.locator('#icClose').click(); await page.waitForTimeout(400) }
}

/** Every chip the calendar draws for input `iid`: which day cell each sits in. */
export const chipDays = (page, iid) => page.evaluate(i => [...document.querySelectorAll(`#inpCal [data-iid="${i}"]`)]
  .map(e => e.closest('[data-icday]')?.getAttribute('data-icday')), iid)

/** A day cell's chips as text, and its "+N more". */
export const cellChips = (page, iso) => page.evaluate(d => {
  const c = document.querySelector(`#inpCal [data-icday="${d}"]`)
  if (!c) return { cell: 'NOT IN THIS MONTH' }
  return { chips: [...c.querySelectorAll('.ic-inrow [data-iid]')].map(e => (e.innerText || '').trim()),
    more: (c.querySelector('.ic-more')?.innerText || '').trim() }
}, iso)

/** The centre of input `iid`'s chip in day `iso` (null if not drawn there). */
export const chipAt = (page, iid, iso) => page.evaluate(([i, d]) => {
  const e = document.querySelector(`#inpCal [data-icday="${d}"] [data-iid="${i}"]`)
  if (!e) return null
  e.scrollIntoView({ block: 'nearest' })
  const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height }
}, [iid, iso])

/** A point on EMPTY space inside day `iso` (no chip, no "+N more", no section under it), and the cell's box. */
export const emptyAt = (page, iso) => page.evaluate(d => {
  const c = document.querySelector(`#inpCal [data-icday="${d}"]`)
  if (!c) return null
  c.scrollIntoView({ block: 'nearest' })
  const b = c.getBoundingClientRect()
  const tries = [[0.85, 0.85], [0.5, 0.85], [0.85, 0.5], [0.15, 0.85], [0.5, 0.6], [0.85, 0.25]]
  for (const [fx, fy] of tries) {
    const x = b.left + b.width * fx, y = b.top + b.height * fy
    const h = document.elementFromPoint(x, y)
    if (h && h.closest('[data-icday]') === c && !h.closest('[data-icdrag]') && !h.closest('.ic-more')) return { x, y, cell: { x: b.left, y: b.top, w: b.width, h: b.height } }
  }
  return null
}, iso)

/** The drop point inside day cell `iso` (its lower middle). */
export const cellAt = (page, iso) => page.evaluate(d => {
  const c = document.querySelector(`#inpCal [data-icday="${d}"]`)
  if (!c) return null
  c.scrollIntoView({ block: 'nearest' })
  const b = c.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height * 0.7 }
}, iso)

/** What a drag leaves behind on screen: a ghost (the lifted copy), a lit day, the page still in drag mode. */
export const dragLeft = page => page.evaluate(() => ({
  ghosts: document.querySelectorAll('.ic-ghost').length,
  lit: [...document.querySelectorAll('[data-icday].ic-over')].map(e => e.getAttribute('data-icday')),
  dragging: document.body.classList.contains('ic-dragging'),
}))

/** MOUSE: pick up input `iid`'s chip in `fromIso` and drop it on day `toIso`. `mid` takes a picture in flight. */
export async function mouseDragChip(page, iid, fromIso, toIso, { mid = null, steps = 12 } = {}) {
  const a = await chipAt(page, iid, fromIso)
  if (!a) return { dragged: false, why: `no chip ${iid} in ${fromIso}` }
  const b = await cellAt(page, toIso)
  if (!b) return { dragged: false, why: `no cell ${toIso}` }
  await page.mouse.move(a.x, a.y)
  await page.mouse.down()
  await page.waitForTimeout(80)
  for (let i = 1; i <= steps; i++) { await page.mouse.move(a.x + (b.x - a.x) * i / steps, a.y + (b.y - a.y) * i / steps); await page.waitForTimeout(16) }
  const inFlight = await dragLeft(page)
  if (mid) await shot(page, mid)
  await page.mouse.up()
  await page.waitForTimeout(700)
  return { dragged: true, inFlight, after: await dragLeft(page) }
}
/** MOUSE: press at a, hold, move to b, release (for hold-to-add and the swipe on empty space). */
export async function mouseGesture(page, a, b, { holdMs = 0, steps = 10 } = {}) {
  await page.mouse.move(a.x, a.y)
  await page.mouse.down()
  if (holdMs) await page.waitForTimeout(holdMs)
  if (b) for (let i = 1; i <= steps; i++) { await page.mouse.move(a.x + (b.x - a.x) * i / steps, a.y + (b.y - a.y) * i / steps); await page.waitForTimeout(16) }
  await page.mouse.up()
  await page.waitForTimeout(600)
}

/* ---- the FINGER (CDP touch) -------------------------------------------------------------------- */
export async function touchOn(page) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
  return cdp
}
const tp = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 7, radiusX: 4, radiusY: 4, force: 1 }]
/** A finger: down at a, hold `holdMs` still, move to b in `steps`, lift. `mid` takes a picture before the lift. */
export async function finger(page, cdp, a, b, { holdMs = 0, steps = 10, stepMs = 16, mid = null } = {}) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(a.x, a.y) })
  if (holdMs) await page.waitForTimeout(holdMs)
  if (b && (b.x !== a.x || b.y !== a.y)) {
    for (let i = 1; i <= steps; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(a.x + (b.x - a.x) * i / steps, a.y + (b.y - a.y) * i / steps) })
      await page.waitForTimeout(stepMs)
    }
  }
  const inFlight = await dragLeft(page)
  if (mid) await shot(page, mid)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.waitForTimeout(700)
  return { inFlight, after: await dragLeft(page) }
}
/** FINGER: hold input `iid`'s chip 260 ms (past the 180 ms pick-up), carry it to `toIso`, lift. */
export async function fingerDragChip(page, cdp, iid, fromIso, toIso, { mid = null, holdMs = 260 } = {}) {
  const a = await chipAt(page, iid, fromIso)
  if (!a) return { dragged: false, why: `no chip ${iid} in ${fromIso}` }
  const b = await cellAt(page, toIso)
  if (!b) return { dragged: false, why: `no cell ${toIso}` }
  return { dragged: true, ...(await finger(page, cdp, a, b, { holdMs, steps: 14, mid })) }
}

/** Is the add/edit dialog open, and what does it say (its title names the date it will file)? */
export const addDialog = page => page.evaluate(() => {
  const p = document.getElementById('inpEditPop')
  if (!p || p.hidden) return { open: false }
  return { open: true, title: (document.getElementById('inpEditTitle')?.innerText || '').trim(),
    person: (document.getElementById('inpEditPerson') || {}).value || '', type: (document.getElementById('inpEditType') || {}).value || '',
    hint: (p.querySelector('.inped-hint')?.innerText || '').trim() }
})
/** Is the day popover open, and for which day? */
export const popover = page => page.evaluate(() => {
  const p = document.querySelector('#inpCal .ic-pop')
  return p ? { open: true, label: p.getAttribute('aria-label'), rows: [...p.querySelectorAll('[data-popiid]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()) } : { open: false }
})

/** The Undo / Redo of the ONE timeline — the Leave War's own pair (shown to everyone), or Edit Schedule's
    top-bar pair (admin). Returns the button's label (what it says it will undo) and whether it was pressed. */
export async function undoRedo(page, which = 'undo', where = 'war') {
  if (where === 'war') {
    if (!(await page.locator('[data-testid="lw-undo"]:visible').count())) { await go(page, 'leavewar'); await page.waitForTimeout(700) }
    const b = page.locator(`[data-testid="lw-${which}"]:visible`).first()
    const label = await b.getAttribute('title'); const off = await b.isDisabled()
    if (!off) { await b.click(); await page.waitForTimeout(700) }
    return { label, pressed: !off }
  }
  await go(page, 'editsched')
  const b = page.locator(`#${which}Btn:visible`).first()
  if (!(await b.count())) return { label: 'NO BUTTON', pressed: false }
  const label = await b.getAttribute('title'); const off = await b.isDisabled()
  if (!off) { await b.click(); await page.waitForTimeout(700) }
  return { label, pressed: !off }
}

/** Reload the SAME page (not a new world) and sign in again if the app asks. */
export async function reloadSame(page, who = 'a') {
  await page.reload()
  await page.waitForTimeout(1500)
  if (await page.locator('#luser:visible').count()) await login(page, who)
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForTimeout(600)
}

/** A compact read of the war for one man over some dates: each box (code, [+n] / [!]), and his balance column. */
export async function warRead(page, id, isos) {
  await lwOpen(page, isos[0])
  return { row: await rowRun(page, id, isos), bal: await lwBalCol(page, id) }
}
