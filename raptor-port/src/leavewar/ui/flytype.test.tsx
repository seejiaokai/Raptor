// @vitest-environment jsdom
/* TYPING ONE REQUIRED FIGURE — straight into its cell on the Leave War (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3 "Typing one cell"; owner D636, D637).

   On a desktop a click puts ONE floating box over the cell — never a box per cell: Enter saves and goes to the next
   flying day, Tab to the other seat, Shift with either goes back, Esc leaves the cell as it was, an empty box and Enter
   clears the date's typed figure. A slim strip names the row and the day and carries "This day | From <date> on".
   On a touch screen the app shows its OWN number pad with that strip above it (‹ › Done) — never the phone's keyboard:
   an input that small makes iOS zoom the page. A no-fly cell cannot be typed. A member types nothing.

   What the cells SHOW is flyrows.test.tsx; picking several is its own file. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../../engine/hooks'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { installGlobalUndo } from '../../state/undo-wire'
import { _resetTimeline } from '../../undo/timeline'
import { globalUndo, undoState } from '../../undo'
import { commandStream } from '../../command'
import { getFlyPlan, setFlyDays, setFlyRun } from '../../state/flyplan'
import { initStore as lwInitStore, setPeople, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { projectPeople } from '../state/raptorRoster'
import { flyAnswer } from '../sync'
import { Matrix } from './Matrix'

const mem = new Map<string, string>()
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  _resetTimeline(); installGlobalUndo()
  lwInitStore(memoryBackend())
  setRole('admin')
  setPeople(projectPeople())
})
afterEach(() => { cleanup(); setSession(null); storeBackend.impl = null; _resetTimeline() })

/* the demo year: Thu 1 Jan is a public holiday; Fri 2 a plain weekday; Sat 3 / Sun 4 a weekend; Mon 5 – Fri 9 weekdays */
const PH = '2026-01-01', SAT3 = '2026-01-03', MON = '2026-01-05', TUE = '2026-01-06', WED = '2026-01-07', THU = '2026-01-08', FRI = '2026-01-09', MON12 = '2026-01-12'
type Row = 'req-p' | 'req-w'
const cell = (row: Row, iso: string) => screen.getByTestId(`${row}-${iso}`)
const box = () => screen.getByTestId('fly-edit-input') as HTMLInputElement
const noBox = () => screen.queryByTestId('fly-edit-input') === null && screen.queryByTestId('fly-edit-touch') === null
const strip = () => screen.getByTestId('fly-edit-strip').textContent ?? ''
const open = (row: Row, iso: string) => { fireEvent.click(cell(row, iso)); return box() }
const type = (v: string) => fireEvent.change(box(), { target: { value: v } })
const key = (k: string, shift = false) => fireEvent.keyDown(box(), { key: k, shiftKey: shift })
const req = (iso: string) => flyAnswer(iso).req
const days = () => getFlyPlan().days
/* a finger's tap: the press says what kind of pointer it was, the click opens */
const tap = (el: Element) => {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 7, pointerType: 'touch', button: 0 }))
  fireEvent.click(el)
}
const pad = (k: string) => fireEvent.click(screen.getByTestId(`fly-pad-${k}`))

describe('on a desktop, a click on a Required cell', () => {
  it('puts ONE floating box over the cell, focused, holding the figure the cell shows — and a strip that names the row and the day', () => {
    setFlyDays([{ iso: TUE, p: 16 }])
    render(<Matrix />)
    expect(document.querySelector('.mx input')).toBeNull()            // never an input per cell
    const b = open('req-p', TUE)
    expect(b.value).toBe('16')
    expect(document.activeElement).toBe(b)
    expect(strip()).toContain('Required P')
    expect(strip()).toContain('Tue 6 Jan')
    expect(screen.getByTestId('fly-edit-day').textContent).toBe('This day')
    expect(screen.getByTestId('fly-edit-run').textContent).toBe('From 6 Jan on')
    expect(screen.queryByTestId('fly-pad')).toBeNull()
    /* a second cell: the ONE box moves there */
    fireEvent.pointerDown(cell('req-w', WED)); fireEvent.click(cell('req-w', WED))
    expect(screen.getAllByTestId('fly-edit-input')).toHaveLength(1)
    expect(strip()).toContain('Required W'); expect(strip()).toContain('Wed 7 Jan')
    expect(document.querySelector('.mx input')).toBeNull()
  })
  it('an empty cell opens an empty box', () => {
    render(<Matrix />)
    expect(open('req-w', TUE).value).toBe('')
  })
  it('Enter saves the figure for the date and goes to the NEXT FLYING DAY — over a weekend and over a no-fly day', () => {
    setFlyDays([{ iso: WED, cls: 'nf' }])
    render(<Matrix />)
    open('req-p', TUE); type('18'); key('Enter')
    expect(req(TUE).p).toBe(18); expect(flyAnswer(TUE).reqFrom.p).toBe('date')
    expect(cell('req-p', TUE).textContent).toBe('18')
    expect(strip()).toContain('Thu 8 Jan')                            // Wed is a no-fly day
    type('17'); key('Enter')
    expect(req(THU).p).toBe(17); expect(strip()).toContain('Fri 9 Jan')
    type('15'); key('Enter')
    expect(req(FRI).p).toBe(15); expect(strip()).toContain('Mon 12 Jan')   // Sat and Sun passed over
    expect(req(MON12).p).toBeNull()
  })
  it('Shift+Enter saves and goes BACK a flying day; from a Monday that is the Friday before', () => {
    render(<Matrix />)
    open('req-w', MON); type('9'); key('Enter', true)
    expect(req(MON).w).toBe(9)
    expect(strip()).toContain('Required W'); expect(strip()).toContain('Fri 2 Jan')
  })
  it('Tab saves and goes to the other seat on the same day; Shift+Tab comes back', () => {
    render(<Matrix />)
    open('req-p', TUE); type('18'); key('Tab')
    expect(req(TUE)).toEqual({ p: 18, w: null })
    expect(strip()).toContain('Required W'); expect(strip()).toContain('Tue 6 Jan')
    type('16'); key('Tab', true)
    expect(req(TUE)).toEqual({ p: 18, w: 16 })
    expect(strip()).toContain('Required P')
    expect(box().value).toBe('18')
  })
  it('Esc leaves the cell as it was: nothing saved, the box gone', () => {
    setFlyDays([{ iso: TUE, p: 16 }])
    render(<Matrix />)
    const n = commandStream().length
    open('req-p', TUE); type('99'); fireEvent.keyDown(window, { key: 'Escape' })
    expect(noBox()).toBe(true)
    expect(req(TUE).p).toBe(16)
    expect(commandStream().length).toBe(n)
  })
  it('an empty box and Enter clears the date’s typed figure — a running figure under it shows again', () => {
    setFlyRun(MON, { p: 12 })
    setFlyDays([{ iso: TUE, p: 16 }])
    render(<Matrix />)
    open('req-p', TUE); type(''); key('Enter')
    expect(days()[TUE]).toBeUndefined()
    expect(cell('req-p', TUE).textContent).toBe('12')
  })
  it('Enter with nothing changed writes NOTHING — a running figure is never turned into a typed one by passing over it', () => {
    setFlyRun(MON, { p: 12 })
    render(<Matrix />)
    const n = commandStream().length
    const b = open('req-p', TUE)
    expect(b.value).toBe('12')
    key('Enter'); key('Enter'); key('Tab')
    expect(commandStream().length).toBe(n)
    expect(days()).toEqual({})
    expect(strip()).toContain('Required W'); expect(strip()).toContain('Thu 8 Jan')
  })
  it('takes digits only, three at most', () => {
    render(<Matrix />)
    open('req-p', TUE); type('1a8.5-')
    expect(box().value).toBe('185')
    type('12345'); expect(box().value).toBe('123')
  })
  it('a press anywhere else saves what was typed and closes the box', () => {
    render(<Matrix />)
    open('req-p', TUE); type('18')
    fireEvent.pointerDown(screen.getByTestId('event-0-2026-01-08'))
    expect(noBox()).toBe(true)
    expect(req(TUE).p).toBe(18)
  })
  it('a press on the strip is not "anywhere else": the box stays, with what was typed', () => {
    render(<Matrix />)
    open('req-p', TUE); type('18')
    fireEvent.pointerDown(screen.getByTestId('fly-edit-strip'))
    expect(box().value).toBe('18'); expect(req(TUE).p).toBeNull()
  })
  it('each save is one Undo step, in the app’s own words', () => {
    render(<Matrix />)
    open('req-p', TUE); type('18'); key('Enter')
    expect(undoState().undoLabel).toContain('the required pilots and WSOs for 6 Jan')
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(cell('req-p', TUE).textContent).toBe('–')
  })
  it('a figure changed under the open box (an Undo) shows in the box while nothing has been typed in it', () => {
    setFlyDays([{ iso: TUE, p: 16 }])
    render(<Matrix />)
    open('req-p', TUE)
    act(() => { setFlyDays([{ iso: TUE, p: 20 }]) })
    expect(box().value).toBe('20')
    type('7'); act(() => { setFlyDays([{ iso: TUE, p: 21 }]) })
    expect(box().value).toBe('7')                                     // what he typed is his
  })
  it('a save the app refuses says so in the strip and keeps the box with what was typed', () => {
    render(<Matrix />)
    open('req-p', TUE); type('18')
    setSession({ user: 'member-test', role: 'member' })               // the war still shows the admin's view; the command gate does not
    key('Enter')
    expect(req(TUE).p).toBeNull()
    expect(box().value).toBe('18')
    expect(strip()).toContain('Tue 6 Jan')
    expect(screen.getByTestId('fly-edit-err').textContent).not.toBe('')
  })
})

describe('"From <date> on" — a figure that runs', () => {
  it('typed with it picked: a run starts on that date, the date’s own figure goes, the cell wears the corner mark — ONE Undo step', () => {
    setFlyDays([{ iso: TUE, p: 16 }])
    render(<Matrix />)
    const n = commandStream().length
    open('req-p', TUE)
    fireEvent.click(screen.getByTestId('fly-edit-run'))
    expect(screen.getByTestId('fly-edit-run').getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(box())                        // the choice never takes the typing away
    type('18'); key('Enter')
    expect(commandStream().length).toBe(n + 1)
    expect(getFlyPlan().runs[TUE]).toEqual({ p: 18 })
    expect(days()[TUE]).toBeUndefined()
    expect(cell('req-p', TUE).className).toContain('runstart')
    expect(cell('req-p', FRI).textContent).toBe('18')
    expect(cell('req-p', '2026-01-10').textContent).toBe('–')
    /* the next cell starts on "This day" again — a run is chosen each time, never carried */
    expect(screen.getByTestId('fly-edit-day').getAttribute('aria-pressed')).toBe('true')
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(getFlyPlan().runs[TUE]).toBeUndefined(); expect(req(TUE).p).toBe(16)
  })
  it('the same figure a run already starts there with: nothing is written', () => {
    setFlyRun(TUE, { p: 18 })
    render(<Matrix />)
    const n = commandStream().length
    open('req-p', TUE); fireEvent.click(screen.getByTestId('fly-edit-run')); key('Enter')
    expect(commandStream().length).toBe(n)
  })
  it('an empty box with it picked, on the day a run starts: that run is taken away for the seat, the earlier one carries on', () => {
    setFlyRun(MON, { p: 12, w: 10 }); setFlyRun(WED, { p: 18, w: 14 })
    render(<Matrix />)
    open('req-p', WED); fireEvent.click(screen.getByTestId('fly-edit-run')); type(''); key('Enter')
    expect(getFlyPlan().runs[WED]).toEqual({ w: 14 })
    expect(cell('req-p', WED).textContent).toBe('12'); expect(cell('req-w', WED).textContent).toBe('14')
  })
  it('is not offered on a weekend or a holiday — a running figure skips those days, so it could never show there', () => {
    render(<Matrix />)
    for (const iso of [SAT3, PH]) {
      open('req-p', iso)
      expect((screen.getByTestId('fly-edit-run') as HTMLButtonElement).disabled).toBe(true)
      fireEvent.keyDown(window, { key: 'Escape' })
    }
    open('req-p', TUE)
    expect((screen.getByTestId('fly-edit-run') as HTMLButtonElement).disabled).toBe(false)
  })
})

describe('where a figure cannot be typed', () => {
  it('a weekend and a holiday CAN take one (D637)', () => {
    render(<Matrix />)
    open('req-p', SAT3); type('4'); key('Tab'); type('2'); fireEvent.pointerDown(document.body)
    expect(req(SAT3)).toEqual({ p: 4, w: 2 })
    open('req-w', PH); type('3'); fireEvent.pointerDown(document.body)
    expect(req(PH).w).toBe(3)
  })
  it('a no-fly cell opens nothing, and its title says where to change it', () => {
    setFlyDays([{ iso: WED, cls: 'nf' }])
    render(<Matrix />)
    fireEvent.click(cell('req-p', WED))
    expect(noBox()).toBe(true)
    expect(cell('req-p', WED).getAttribute('title')).toMatch(/change the day in Days/)
  })
  it('a member: a click opens nothing', () => {
    setFlyDays([{ iso: TUE, p: 16 }])
    setRole('member')
    render(<Matrix />)
    fireEvent.click(cell('req-p', TUE))
    expect(noBox()).toBe(true)
  })
  it('an Available cell still opens its working, never the box', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`avail-p-${TUE}`))
    expect(screen.getByTestId('fly-working')).toBeTruthy()
    expect(noBox()).toBe(true)
  })
})

describe('on a touch screen, the app’s own number pad', () => {
  it('a tap opens the pad and NO input anywhere — the phone’s keyboard is never called up', () => {
    setFlyDays([{ iso: THU, p: 16 }])
    render(<Matrix />)
    tap(cell('req-p', THU))
    expect(screen.getByTestId('fly-pad')).toBeTruthy()
    expect(document.querySelector('input:not([type=hidden])')).toBeNull()
    expect(screen.getByTestId('fly-edit-touch').textContent).toBe('16')
    const s = strip()
    expect(s).toContain('Req P'); expect(s).toContain('Thu 8 Jan')
    for (const k of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', 'prev', 'next', 'done']) expect(screen.getByTestId(`fly-pad-${k}`)).toBeTruthy()
    expect(screen.getByTestId('fly-edit-day').textContent).toBe('This day')
    expect(screen.getByTestId('fly-edit-run').textContent).toBe('From 8 Jan on')
  })
  it('the first key replaces the figure that was there; ⌫ takes one away; three digits at most', () => {
    setFlyDays([{ iso: THU, p: 16 }])
    render(<Matrix />)
    tap(cell('req-p', THU))
    pad('1'); expect(screen.getByTestId('fly-edit-touch').textContent).toBe('1')
    pad('8'); pad('0'); pad('5'); expect(screen.getByTestId('fly-edit-touch').textContent).toBe('180')
    pad('back'); expect(screen.getByTestId('fly-edit-touch').textContent).toBe('18')
  })
  it('⌫ first, on a figure that was there, empties the box — and Done then clears the date’s figure', () => {
    setFlyDays([{ iso: THU, p: 16 }])
    render(<Matrix />)
    tap(cell('req-p', THU))
    pad('back'); expect(screen.getByTestId('fly-edit-touch').textContent).toBe('')
    pad('done')
    expect(days()[THU]).toBeUndefined(); expect(noBox()).toBe(true); expect(screen.queryByTestId('fly-pad')).toBeNull()
  })
  it('Done saves and puts the pad away', () => {
    render(<Matrix />)
    tap(cell('req-w', THU)); pad('1'); pad('8'); pad('done')
    expect(req(THU).w).toBe(18)
    expect(screen.queryByTestId('fly-pad')).toBeNull()
    expect(cell('req-w', THU).textContent).toBe('18')
  })
  it('› saves and goes to the next flying day, ‹ back — the pad stays', () => {
    render(<Matrix />)
    tap(cell('req-p', FRI)); pad('1'); pad('8'); pad('next')
    expect(req(FRI).p).toBe(18)
    expect(strip()).toContain('Mon 12 Jan')
    pad('prev')
    expect(strip()).toContain('Fri 9 Jan')
    expect(screen.getByTestId('fly-edit-touch').textContent).toBe('18')
    expect(screen.getByTestId('fly-pad')).toBeTruthy()
  })
  it('a tap on another Required cell saves and moves the pad there', () => {
    render(<Matrix />)
    tap(cell('req-p', THU)); pad('9')
    tap(cell('req-w', THU))
    expect(req(THU).p).toBe(9)
    expect(strip()).toContain('Req W')
    expect(screen.getAllByTestId('fly-pad')).toHaveLength(1)
  })
  it('"From <date> on" from the pad', () => {
    render(<Matrix />)
    tap(cell('req-p', TUE)); fireEvent.click(screen.getByTestId('fly-edit-run')); pad('1'); pad('6'); pad('done')
    expect(getFlyPlan().runs[TUE]).toEqual({ p: 16 })
    expect(cell('req-p', FRI).textContent).toBe('16')
  })
  it('a mouse click after a tap is a desktop click again: the box, no pad', () => {
    render(<Matrix />)
    tap(cell('req-p', THU)); pad('done')
    cell('req-p', TUE).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', button: 0 }))
    fireEvent.click(cell('req-p', TUE))
    expect(box()).toBeTruthy(); expect(screen.queryByTestId('fly-pad')).toBeNull()
  })
})
