// @vitest-environment jsdom
/* THE KEYBOARD ON THE INPUTS MONTH (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.6;
   owner D621, 7 Oct 26: "think how can the user use their keyboard to navigate around the interface. Like escape,
   delete, arrow keys" — the set stands as drawn, D626):

     arrows          move the focused date, and turn the month at its ends;
     Shift + arrows  stretch a run of days;
     Enter           opens the day — or, with a run, files "+ Input" for it;
     Delete          on an input in an opened day, removes it — asking first;
     Escape          closes the front window, then lets a run go.

   The month is ONE tab stop (as the SANS month is): Tab reaches it and leaves it; the arrows move inside it. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { CALMONTH, setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { me } from '../state/perms'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { INPEDIT, setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const said: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => Array.from(host.querySelectorAll(sel)) as HTMLElement[]
const tid = (id: string) => $(`[data-testid="${id}"]`)
const day = (iso: string) => $(`[data-icday="${iso}"]`)!
const key = async (el: Element, k: string, init: KeyboardEventInit = {}) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init })) })
const focused = () => (document.activeElement as HTMLElement | null)?.dataset.icday || null
const picked = () => $$('.ib-day.is-picked').map(d => d.dataset.icday)
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
let n = 0
const file = async (over: any) => {
  const row = { iid: 'key' + (++n), person: crew()[0], type: 'LL', date: 'Oct 7', yr: 2026, allday: true, s: 360, e: 1080, mod: '2026-09-01', ...over }
  /* filed through the app's own door, so it is a step the Undo list knows (a record pushed in by hand is in no step) */
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return INPUTS.find((r: any) => r.iid === row.iid) as any
}
const line = (r: any) => tid('idy-row-' + r.iid)!.querySelector('[data-testid="idy-open"]') as HTMLElement

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: 'a', role: 'admin' }); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins(); setSession(null); storeBackend.impl = null
})

describe('the month is one tab stop, and the arrows move inside it', () => {
  it('exactly one date can be tabbed to', () => {
    expect($$('#inpCal [data-icday]').filter(d => d.tabIndex === 0)).toHaveLength(1)
    expect($$('#inpCal [data-icday]').filter(d => d.tabIndex === -1).length).toBeGreaterThan(27)
  })
  it('Right and Left move a day, Down and Up a week — the keyboard goes with the date', async () => {
    await key(day('2026-10-14'), 'ArrowRight'); expect(focused()).toBe('2026-10-15')
    await key(day('2026-10-15'), 'ArrowDown'); expect(focused()).toBe('2026-10-22')
    await key(day('2026-10-22'), 'ArrowLeft'); expect(focused()).toBe('2026-10-21')
    await key(day('2026-10-21'), 'ArrowUp'); expect(focused()).toBe('2026-10-14')
    expect($$('#inpCal [data-icday]').filter(d => d.tabIndex === 0).map(d => d.dataset.icday), 'the tab stop follows it').toEqual(['2026-10-14'])
  })
  it('past the month’s end the month turns, and the date is there to stand on', async () => {
    await key(day('2026-10-31'), 'ArrowRight')
    expect(CALMONTH).toEqual({ y: 2026, m: 11 }); expect(focused()).toBe('2026-11-01')
    await key(day('2026-11-01'), 'ArrowUp')
    expect(CALMONTH).toEqual({ y: 2026, m: 10 }); expect(focused()).toBe('2026-10-25')
  })
  it('a key pressed in a box inside the page is that box’s own', async () => {
    const search = $('#inFSearch')!
    await key(search, 'ArrowRight')
    expect(focused()).toBeNull()
  })
})

describe('Shift and the arrows pick a run; Enter files for it', () => {
  it('the run lights as it grows, and Enter opens "+ Input" for it — nothing written yet', async () => {
    const before = INPUTS.length
    await key(day('2026-10-13'), 'ArrowRight', { shiftKey: true })
    await key(day('2026-10-14'), 'ArrowRight', { shiftKey: true })
    expect(picked()).toEqual(['2026-10-13', '2026-10-14', '2026-10-15'])
    await key(day('2026-10-15'), 'Enter')
    expect(INPEDIT).toMatchObject({ _new: true, date: 'Oct 13', endDate: 'Oct 15' })
    expect(INPUTS.length).toBe(before)
    expect(picked(), 'the run is spent').toEqual([])
  })
  it('a run stretched backwards is filed first day first', async () => {
    await key(day('2026-10-15'), 'ArrowLeft', { shiftKey: true })
    await key(day('2026-10-14'), 'ArrowUp', { shiftKey: true })
    await key(day('2026-10-07'), 'Enter')
    expect(INPEDIT).toMatchObject({ _new: true, date: 'Oct 7', endDate: 'Oct 15' })
  })
  it('a plain arrow lets the run go', async () => {
    await key(day('2026-10-13'), 'ArrowRight', { shiftKey: true })
    expect(picked()).toHaveLength(2)
    await key(day('2026-10-14'), 'ArrowRight')
    expect(picked()).toEqual([])
  })
  it('Enter with no run opens the day; Space does too', async () => {
    await key(day('2026-10-13'), 'Enter')
    expect(tid('win-inputsday')!.querySelector('.win-ttl')!.textContent).toContain('Tue 13 Oct')
    expect(INPEDIT).toBeNull()
    await key(day('2026-10-14'), ' ')
    expect(tid('win-inputsday')!.querySelector('.win-ttl')!.textContent).toContain('Wed 14 Oct')
  })
})

describe('Escape closes the front window, then lets a run go', () => {
  it('with a day open and a run picked: the first Escape closes the day, the second lets the run go', async () => {
    await key(day('2026-10-13'), 'Enter')
    await key(day('2026-10-13'), 'ArrowRight', { shiftKey: true })
    expect(tid('win-inputsday')).toBeTruthy(); expect(picked()).toHaveLength(2)
    await key(day('2026-10-14'), 'Escape')
    expect(tid('win-inputsday'), 'the window goes first').toBeNull(); expect(picked()).toHaveLength(2)
    await key(day('2026-10-14'), 'Escape')
    expect(picked()).toEqual([])
    expect($('#inpCal'), 'and the calendar stays').toBeTruthy()
  })
})

describe('Delete on an input in an opened day removes it — asking first', () => {
  it('Delete asks; "Delete" removes it as one Undo step and says so', async () => {
    const r = await file({})
    await key(day('2026-10-07'), 'Enter')
    await key(line(r), 'Delete')
    expect(tid('idy-ask')!.textContent).toContain('Delete this input?')
    expect(INPUTS.some((x: any) => x.iid === r.iid), 'nothing is removed until he says').toBe(true)
    await act(async () => { tid('idy-del-yes')!.click() })
    expect(INPUTS.some((x: any) => x.iid === r.iid)).toBe(false)
    expect(said).toContain('Input deleted')
    expect(tid('win-inputsday'), 'the day stays open').toBeTruthy()
    await act(async () => { undo() })
    expect(INPUTS.some((x: any) => x.iid === r.iid), 'Undo brings it back').toBe(true)
  })
  it('"Keep" and Escape both put the question away and remove nothing — and Escape leaves the day open', async () => {
    const r = await file({})
    await key(day('2026-10-07'), 'Enter')
    await key(line(r), 'Delete')
    await act(async () => { tid('idy-del-no')!.click() })
    expect(tid('idy-ask')).toBeNull(); expect(INPUTS.some((x: any) => x.iid === r.iid)).toBe(true)
    await key(line(r), 'Backspace')
    expect(tid('idy-ask'), 'Backspace asks too').toBeTruthy()
    await key(tid('idy-del-yes')!, 'Escape')
    expect(tid('idy-ask')).toBeNull()
    expect(tid('win-inputsday'), 'the question went; the window did not').toBeTruthy()
    expect(INPUTS.some((x: any) => x.iid === r.iid)).toBe(true)
  })
  it('an input its reader may not delete is not asked about: it says who can', async () => {
    /* filed by an admin, for another man; then read by a member */
    await act(async () => { setSession({ user: 'a', role: 'admin' } as any); notify() })
    const r = await file({ person: crew().find(id => id !== 'bane')! })
    await act(async () => { setSession({ user: 'user', role: 'main' } as any); notify() })
    expect(String(r.person)).not.toBe(String(me()))
    await key(day('2026-10-07'), 'Enter')
    await key(line(r), 'Delete')
    expect(tid('idy-ask')).toBeNull()
    expect(INPUTS.some((x: any) => x.iid === r.iid)).toBe(true)
    expect(said.join(' | ')).toMatch(/can delete/i)
  })
  it('Delete on a date deletes nothing and asks nothing', async () => {
    await file({})
    const before = INPUTS.length
    await key(day('2026-10-07'), 'Delete')
    expect(INPUTS.length).toBe(before); expect(tid('idy-ask')).toBeNull()
  })
})

/* THE 3 NOV 26 RE-CHECK'S ESCAPE FINDS (the Inputs batch [INPUTS-FIXES-1103]; docs/handpass/2026-11-03-inputs-seen-recheck.md) */
describe('Escape: one window at a time, wherever the keys are (F2, F6, F7)', () => {
  it('F6: with the keys on the page behind, Escape on "Delete this input?" is Keep — the day stays, nothing deleted', async () => {
    const r = await file({})
    await key(day('2026-10-07'), 'Enter')
    await key(line(r), 'Delete')
    expect(tid('idy-ask')).toBeTruthy()
    /* a press behind: the keyboard goes back to the month */
    day('2026-10-07').focus()
    await key(day('2026-10-07'), 'Escape')
    expect(tid('idy-ask'), 'the question went').toBeNull()
    expect(tid('win-inputsday'), 'the day did not').toBeTruthy()
    expect(INPUTS.some((x: any) => x.iid === r.iid), 'nothing deleted').toBe(true)
    await key(day('2026-10-07'), 'Escape')
    expect(tid('win-inputsday'), 'the next Escape is the day’s').toBeNull()
  })
  it('F7: with a button behind holding the keys, Escape still closes the window in front', async () => {
    await key(day('2026-10-13'), 'Enter')
    expect(tid('win-inputsday')).toBeTruthy()
    const next = $('#icNext')!
    next.focus()
    expect(document.activeElement).toBe(next)
    await key(next, 'Escape')
    expect(tid('win-inputsday'), 'the window closes').toBeNull()
  })
  it('F7: a box he types in on the page behind keeps its own Escape', async () => {
    await key(day('2026-10-13'), 'Enter')
    const search = $('#inFSearch')!
    search.focus()
    await key(search, 'Escape')
    expect(tid('win-inputsday'), 'the window stays: Escape was the box’s').toBeTruthy()
  })
  it('F2: the day in front of an input’s window with typed words: one Escape closes the day only, and the typing stays', async () => {
    const r = await file({ type: 'Meeting', allday: false, s: 540, e: 600 })
    await key(day('2026-10-07'), 'Enter')
    await act(async () => { line(r).click() })
    expect(tid('win-inputedit'), 'the input’s window is up').toBeTruthy()
    const rmk = document.querySelector('#inpEditRmk') as HTMLInputElement
    await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!.call(rmk, 'typed'); rmk.dispatchEvent(new Event('input', { bubbles: true })) })
    /* the day's window pressed: it comes in front, the keys stay in Remarks */
    await act(async () => { tid('win-inputsday')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) })
    rmk.focus()
    await key(rmk, 'Escape')
    expect(tid('win-inputsday'), 'the window in front closed').toBeNull()
    expect(tid('win-inputedit'), 'the one behind did not').toBeTruthy()
    expect((document.querySelector('#inpEditRmk') as HTMLInputElement).value, 'with what was typed').toBe('typed')
    /* the next Escape is the input's window — with typed words, it asks */
    await key(document.querySelector('#inpEditRmk')!, 'Escape')
    expect(tid('inped-escask'), 'it asks before losing them').toBeTruthy()
    expect(tid('win-inputedit')).toBeTruthy()
    await act(async () => { tid('inped-escask-go')!.click() })
    expect(tid('win-inputedit'), 'Discard and close').toBeNull()
  })
  it('F2: an input’s window with nothing typed closes on Escape without asking', async () => {
    const r = await file({ type: 'Meeting', allday: false, s: 540, e: 600 })
    await key(day('2026-10-07'), 'Enter')
    await act(async () => { line(r).click() })
    await act(async () => { tid('win-inputedit')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) })
    await key(document.querySelector('#inpEditRmk')!, 'Escape')
    expect(tid('inped-escask')).toBeNull()
    expect(tid('win-inputedit')).toBeNull()
  })
})
