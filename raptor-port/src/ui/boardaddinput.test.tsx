// @vitest-environment jsdom
/* "Scheduler board should have the authority to add inputs that are under
   inputs... in scheduler board under unavailable, and personal inputs. They
   can also add or remove them or edit" (owner, Aug 26). Edit and remove from
   the board already shipped (14 Aug 26, unavailedit.test.tsx); this pins the
   ADD half: a + Add button on each board panel (live board only), the dialog
   opening in its new-row shape, and the row landing in INPUTS on the open day
   through the one shared write — so the Inputs page, the week and (for a
   leave/medical type) Leave War all read the same record back. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { INPUTS, DATES, isPersonal, isUnavail, isSansAvail } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { commitNewInput, removeInput, firstPersonalType, firstUnavailType } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { openScheduler } from './board'
import { sbInputsGroupPanel, sbUnavailPanel } from './board-html'
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

/* ---- (a) the button renders on a LIVE board only ------------------------- */
describe('the + Add button', () => {
  const d = () => DAYS[0]
  it('a live Unavailable panel carries + Add addressed to this day', () => {
    const h = sbUnavailPanel(d(), 0)                    // ro falsy → live
    expect(h).toContain('class="sb-addinp"')
    expect(h).toContain('data-inpadd="0.u"')
  })
  it('a live Personal Inputs panel carries + Add addressed to this day', () => {
    const h = sbInputsGroupPanel(d(), 0)
    expect(h).toContain('data-inpadd="0.p"')
  })
  it('a read-only Unavailable panel has no + Add (a preview / view-only board)', () => {
    expect(sbUnavailPanel(d(), 0, undefined, true)).not.toContain('data-inpadd')
  })
  it('a read-only Personal Inputs panel has no + Add', () => {
    // the 5th arg (ro) drives acRo; a view-only/preview board passes it true
    expect(sbInputsGroupPanel(d(), 0, undefined, undefined, true)).not.toContain('data-inpadd')
  })
})

/* ---- (b) commitNewInput — the shared write ------------------------------- */
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
  it('refuses a malformed draft (equal start and end), adds nothing', () => {
    const before = INPUTS.length
    const draft = { person: 'bane', type: 'Meeting', allday: false, half: '', start: '2026-07-13', end: '', sTime: '09:00', eTime: '09:00', remarks: 'bad', sans: null }
    expect(commitNewInput(draft)).toBe(false)
    expect(INPUTS.length).toBe(before)
    expect(TOASTS.some(t => /start and end/i.test(t))).toBe(true)
  })
})

/* ---- (c) the dialog's new-row shape ------------------------------------- */
describe('the dialog opened from + Add', () => {
  it('opens in New-input mode: no Delete, primary reads Add, defaults suit the panel', async () => {
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .unav .sb-addinp'))
    expect($('#inpEditTitle').textContent).toContain('New input')
    expect($('#inpEditDel'), 'nothing to delete on a row that does not exist yet').toBe(null)
    expect($('#inpEditSave').textContent).toBe('Add')
    expect($('#inpEditPerson'), 'the scheduler picks who it is for').toBeTruthy()
    const t = ($('#inpEditType') as HTMLSelectElement).value
    expect(isUnavail(t) && !isSansAvail(t), 'Unavailable seeds a leave/medical type').toBe(true)
    await act(async () => { setInpEdit(null); notify() })
    await click($('#sbClose'))
  })
  it('the Personal Inputs + Add seeds a personal (activity) type', async () => {
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .pinp .sb-addinp'))
    expect(isPersonal(($('#inpEditType') as HTMLSelectElement).value)).toBe(true)
    await act(async () => { setInpEdit(null); notify() })
    await click($('#sbClose'))
  })
})

/* ---- (d) the whole gesture: click + Add, fill, Add, see it on the board -- */
describe('adding through the board', () => {
  it('lands a new Unavailable row on the day and the panel repaints with it', async () => {
    const before = onMon().length
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .unav .sb-addinp'))
    await setSelect($('#inpEditPerson'), 'bane')
    await setSelect($('#inpEditType'), 'OL')
    await click($('#inpEditSave'))
    expect(INPEDIT, 'the dialog closed on a good save').toBe(null)
    const row = onMon().find((i: any) => i.person === 'bane' && i.type === 'OL')
    expect(row, 'the record exists on Monday').toBeTruthy()
    expect(onMon().length).toBe(before + 1)
    /* the board is open on the same day — the Unavailable panel now draws it */
    expect($(`#schedBoard .unav [data-inpseat="${row!.iid}"]`), 'painted under Unavailable').toBeTruthy()
    await click($('#sbClose'))
    await act(async () => { removeInput(row); notify() })
  })
  it('Cancel adds nothing', async () => {
    const before = INPUTS.length
    await act(async () => { openScheduler(0); notify() })
    await click($('#schedBoard .pinp .sb-addinp'))
    await click($('#inpEditCancel'))
    expect(INPEDIT).toBe(null)
    expect(INPUTS.length).toBe(before)
    await click($('#sbClose'))
  })
})

/* ---- (e) a member is refused at the handler, not just hidden ------------- */
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
