// @vitest-environment jsdom
/* "Scheduler board should have the authority to add inputs that are under
   inputs... in scheduler board under unavailable, and personal inputs. They
   can also add or remove them or edit" (owner, Aug 26) — REWORKED 19 Aug 26:
   the Personal Inputs + Add moved to the Ground Programme header as
   "+ Inputs" (activity types only, the new row accepted straight onto the
   programme), the Unavailable + Add offers leave/medical/OD only and takes a
   DATE RANGE whose till date lands in remarks the way the Inputs page's
   calendar writes it, and the SANS Availability panel gained its own + Add
   (SANS type fixed, SANS aircrew only) — SANS left the other two type lists.
   Edit and remove from the board shipped 14 Aug 26 (unavailedit.test.tsx). */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { INPUTS, DATES, isPersonal, isUnavail, isSansAvail } from '../engine/inputs'
import { inpKey } from '../engine/slots'
import { HOOKS } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import * as view from '../state/view'
import { commitNewInput, removeInput } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { openScheduler } from './board'
import { sbInputsGroupPanel, sbUnavailPanel, sbGroundPanel, sbSansPanel } from './board-html'
import { DAYS } from '../engine/data'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const setSelect = async (el: HTMLElement, v: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
    setter.call(el, v); el.dispatchEvent(new Event('change', { bubbles: true }))
  })
}
const MON = 'Jul 13'
const onMon = () => INPUTS.filter((i: any) => i.date === MON)
/* every <option> value a select offers, optgroups flattened */
const optionsOf = (sel: HTMLElement) => [...sel.querySelectorAll('option')].map(o => (o as HTMLOptionElement).value)

let TOASTS: string[] = []

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
beforeEach(async () => {
  TOASTS = []
  if (INPEDIT) await act(async () => { setInpEdit(null); notify() })
  if (view.ARM) await act(async () => { view.disarmSlot(); notify() })
})

/* ---- (a) which panel carries which button, live board only ---------------- */
describe('the add buttons', () => {
  const d = () => DAYS[0]
  it('a live Unavailable panel keeps + Add addressed to this day', () => {
    const h = sbUnavailPanel(d(), 0)                    // ro falsy → live
    expect(h).toContain('class="sb-addinp"')
    expect(h).toContain('data-inpadd="0.u"')
  })
  it('the Personal Inputs panel no longer carries an add — it moved to Ground Programme', () => {
    expect(sbInputsGroupPanel(d(), 0)).not.toContain('data-inpadd')
  })
  it('a live Ground Programme panel carries + Inputs addressed to this day', () => {
    const h = sbGroundPanel(d(), 0)
    expect(h).toContain('data-inpadd="0.g"')
    expect(h).toContain('+ Inputs')
    expect(h, 'the bare-row add stays beside it').toContain('data-gradd="0"')
  })
  it('a live SANS Availability panel carries its own + Add', () => {
    expect(sbSansPanel(d(), 0)).toContain('data-inpadd="0.s"')
  })
  it('read-only panels carry no add (a preview / view-only board)', () => {
    expect(sbUnavailPanel(d(), 0, undefined, true)).not.toContain('data-inpadd')
    expect(sbGroundPanel(d(), 0, undefined, true)).not.toContain('data-inpadd')
    expect(sbSansPanel(d(), 0, undefined, true)).not.toContain('data-inpadd')
  })
})

/* ---- (b) commitNewInput — the shared write -------------------------------- */
describe('commitNewInput', () => {
  it('adds a row on the given day and returns true', () => {
    const before = INPUTS.length
    const draft = { person: 'bane', type: 'LL', allday: true, half: '', start: '2026-07-13', end: '', sTime: '06:00', eTime: '18:00', remarks: 'board add', sans: null }
    expect(commitNewInput(draft)).toBe(true)
    expect(INPUTS.length).toBe(before + 1)
    const row = INPUTS.find((i: any) => i.remarks === 'board add')!
    expect(row).toBeTruthy()
    expect(row.date).toBe(MON)
    expect(row.person).toBe('bane')
    expect(row.type).toBe('LL')
    expect(row.acc, 'a fresh add is unaccepted — the scheduler accepts it after').toBeFalsy()
    expect(row.iid, 'minted an id like every other input').toBeTruthy()
    removeInput(row)
  })
  it('a draft carrying an end date lands a span (the Unavailable range add)', () => {
    const draft = { person: 'bane', type: 'OL', allday: true, half: '', start: '2026-07-15', end: '2026-07-17', sTime: '06:00', eTime: '18:00', remarks: 'span add till 17 Jul', sans: null }
    expect(commitNewInput(draft)).toBe(true)
    const row = INPUTS.find((i: any) => i.remarks === 'span add till 17 Jul')!
    expect(row.date).toBe('Jul 15')
    expect(row.endDate).toBe('Jul 17')
    removeInput(row)
  })
  it('toGround accepts the new row straight onto the open day\'s ground programme, one undo step', () => {
    const gBefore = (DAYS[0].ground || []).length
    const draft = { person: 'bane', type: 'Meeting', allday: false, half: '', start: '2026-07-13', end: '', sTime: '09:00', eTime: '10:00', remarks: 'ground add', sans: null }
    expect(commitNewInput(draft, true)).toBe(true)
    const row = INPUTS.find((i: any) => i.remarks === 'ground add')!
    expect(row.acc, 'accepted, not waiting').toBe('g')
    const g = DAYS[0].ground || []
    expect(g.length).toBe(gBefore + 1)
    const gr = g.find((x: any) => x.src === inpKey(row))!
    expect(gr, 'the ground row links back to its input').toBeTruthy()
    expect(gr.prog).toBe('MEETING')
    removeInput(row)                                     // unaccepts + splices
    expect((DAYS[0].ground || []).length).toBe(gBefore)
  })
  it('toGround on a leave type adds the input but never a ground row (acceptInput\'s own rule)', () => {
    const gBefore = (DAYS[0].ground || []).length
    const draft = { person: 'bane', type: 'LL', allday: true, half: '', start: '2026-07-13', end: '', sTime: '06:00', eTime: '18:00', remarks: 'misrouted', sans: null }
    expect(commitNewInput(draft, true)).toBe(true)
    const row = INPUTS.find((i: any) => i.remarks === 'misrouted')!
    expect(row.acc).toBeFalsy()
    expect((DAYS[0].ground || []).length).toBe(gBefore)
    removeInput(row)
  })
  it('refuses a malformed draft (equal start and end), adds nothing', () => {
    const before = INPUTS.length
    const draft = { person: 'bane', type: 'Meeting', allday: false, half: '', start: '2026-07-13', end: '', sTime: '09:00', eTime: '09:00', remarks: 'bad', sans: null }
    expect(commitNewInput(draft)).toBe(false)
    expect(INPUTS.length).toBe(before)
    expect(TOASTS.some(t => /start and end/i.test(t))).toBe(true)
  })
})

/* ---- (c) the dialog's context-bound shapes -------------------------------- */
describe('the dialog opened from each add', () => {
  it('Unavailable: leave/medical/OD types only, a range calendar, remarks pre-carry the till date', async () => {
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .unav .sb-addinp'))
    expect($('#inpEditTitle').textContent).toContain('New input')
    expect($('#inpEditDel'), 'nothing to delete on a row that does not exist yet').toBe(null)
    expect($('#inpEditSave').textContent).toBe('Add')
    const opts = optionsOf($('#inpEditType'))
    expect(opts.length).toBeGreaterThan(0)
    expect(opts.every(t => isUnavail(t) && !isSansAvail(t)), 'no activity types and no SANS here').toBe(true)
    expect($('#inpEdCal'), 'the two-click range calendar is in the dialog').toBeTruthy()
    expect(($('#inpEditRmk') as HTMLInputElement).value, 'a one-day pick reads till <that day>, like the Inputs page').toBe('till 13 Jul')
    await act(async () => { setInpEdit(null); notify() })
    await click($('#sbClose'))
  })
  it('Ground Programme + Inputs: activity types only, no calendar', async () => {
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .grnd .sb-addinp'))
    const opts = optionsOf($('#inpEditType'))
    expect(opts.length).toBeGreaterThan(0)
    expect(opts.every(t => isPersonal(t)), 'meetings, courses… — nothing that means absent').toBe(true)
    expect($('#inpEdCal'), 'single day — the open day').toBe(null)
    await act(async () => { setInpEdit(null); notify() })
    await click($('#sbClose'))
  })
  it('SANS panel: the type reads fixed, the person list offers SANS aircrew only', async () => {
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .sansav .sb-addinp'))
    expect($('#inpEditType'), 'no type dropdown — it is not a choice here').toBe(null)
    expect($('#inpEditTypeFixed').textContent).toBe('SANS Availability')
    const people = optionsOf($('#inpEditPerson'))
    expect(people.length).toBeGreaterThan(0)
    expect(people.every(id => PEOPLE[id].san), 'only SANS aircrew are offered').toBe(true)
    expect($('#inpEditSans'), 'the Fly/AMT/OFT ticks are up').toBeTruthy()
    await act(async () => { setInpEdit(null); notify() })
    await click($('#sbClose'))
  })
})

/* ---- (d) the whole gestures ----------------------------------------------- */
describe('adding through the board', () => {
  it('Unavailable: pick a range on the calendar, Add — a span lands with its till tail, the panel repaints', async () => {
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .unav .sb-addinp'))
    await setSelect($('#inpEditPerson'), 'bane')
    await setSelect($('#inpEditType'), 'OL')
    /* two clicks on the calendar: Jul 15 then Jul 17 (the view opens on the
       seeded start's month, Jul 2026) */
    await click($('#inpEdCal [data-cal="2026-07-15"]'))
    await click($('#inpEdCal [data-cal="2026-07-17"]'))
    expect(($('#inpEditRmk') as HTMLInputElement).value, 'the pick rewrote the tail').toBe('till 17 Jul')
    await click($('#inpEditSave'))
    expect(INPEDIT, 'the dialog closed on a good save').toBe(null)
    const row = INPUTS.find((i: any) => i.person === 'bane' && i.type === 'OL' && i.date === 'Jul 15')!
    expect(row, 'the record exists').toBeTruthy()
    expect(row.endDate).toBe('Jul 17')
    expect(row.remarks).toBe('till 17 Jul')
    /* the board is open on Monday; the span does not cover it, so assert on
       the model + the Inputs-page-visible record rather than the panel */
    await click($('#sbClose'))
    await act(async () => { removeInput(row); notify() })
  })
  it('Ground Programme: + Inputs lands the item ON the programme and the panel repaints with it', async () => {
    const gBefore = (DAYS[0].ground || []).length
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .grnd .sb-addinp'))
    await setSelect($('#inpEditPerson'), 'bane')
    await setSelect($('#inpEditType'), 'Meeting')
    await click($('#inpEditSave'))
    expect(INPEDIT).toBe(null)
    const row = onMon().find((i: any) => i.person === 'bane' && i.type === 'Meeting')!
    expect(row, 'the input exists on Monday').toBeTruthy()
    expect(row.acc, 'and it is already accepted onto the programme').toBe('g')
    expect((DAYS[0].ground || []).length).toBe(gBefore + 1)
    /* the ground programme panel now draws the row — the programme name is an
       <input value>, so it lives in the markup, not textContent */
    const grnd = $('#schedBoard .sb-panel.grnd')
    expect(grnd.innerHTML).toContain('MEETING')
    await click($('#sbClose'))
    await act(async () => { removeInput(row); notify() })
    expect((DAYS[0].ground || []).length).toBe(gBefore)
  })
  it('SANS: tick an event, Add — the offer lands and the card grid repaints with it', async () => {
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .sansav .sb-addinp'))
    const person = ($('#inpEditPerson') as HTMLSelectElement).value
    expect(PEOPLE[person].san).toBe(true)
    /* tick Fly */
    const fly = $('#inpEditSans input[type=checkbox]') as HTMLInputElement
    await act(async () => { fly.click() })
    await click($('#inpEditSave'))
    expect(INPEDIT).toBe(null)
    const row = onMon().find((i: any) => isSansAvail(i.type) && i.person === person)!
    expect(row, 'the offer exists on Monday').toBeTruthy()
    expect(row.sans && row.sans.f, 'Fly is offered').toBe(true)
    expect($(`#schedBoard .sansav [data-inpedit="${row.iid}"]`) || $('#schedBoard .sansav .sanscard'), 'a card is up').toBeTruthy()
    await click($('#sbClose'))
    await act(async () => { removeInput(row); notify() })
  })
  it('SANS: Add with nothing ticked is refused and the dialog stays', async () => {
    const before = INPUTS.length
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .sansav .sb-addinp'))
    await click($('#inpEditSave'))
    expect(INPEDIT, 'refusal keeps the dialog open').toBeTruthy()
    expect(INPUTS.length).toBe(before)
    expect(TOASTS.some(t => /tick at least one/i.test(t))).toBe(true)
    await act(async () => { setInpEdit(null); notify() })
    await click($('#sbClose'))
  })
  it('Cancel adds nothing', async () => {
    const before = INPUTS.length
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .grnd .sb-addinp'))
    await click($('#inpEditCancel'))
    expect(INPEDIT).toBe(null)
    expect(INPUTS.length).toBe(before)
    await click($('#sbClose'))
  })
})

/* ---- (e) a member is refused at the handler, not just hidden -------------- */
describe('a member cannot add from here', () => {
  it('the click handler refuses even a hand-made button (defence in depth)', async () => {
    await act(async () => { setSession({ user: 'user', role: 'member' }); notify() })
    const before = INPUTS.length
    const btn = document.createElement('button')
    btn.setAttribute('data-inpadd', '0.u')
    document.body.appendChild(btn)
    await click(btn)
    btn.remove()
    expect(INPEDIT, 'no dialog opened').toBeFalsy()
    expect(INPUTS.length, 'no row added').toBe(before)
    expect(TOASTS.some(t => /only a scheduler/i.test(t))).toBe(true)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})
