// @vitest-environment jsdom
/* THE REQUIRED PANEL — one number for several picked cells (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3 "Picking several"; owner D636, D637, D622, D641).

   A drag over the Required rows opens it: the number box, "These days | From <date> on", Apply, Clear. It is NOT a
   blocking window (D641): no veil over the page, a press outside does not close it, the grid behind still works; its
   ✕, Escape and Apply close it. WHICH picked cells take the number is worked out at Apply, and differs by choice:
     · "These days" writes the picked dates themselves — a no-fly day is ALWAYS left out; weekend, holiday and Off-day
       cells CAN take a typed figure (D637): where the pick is only such days they are filled, and where it mixes them
       with ordinary days they are left out and the panel says so, with one press to take them in;
     · "From <date> on" is a RUNNING figure — it skips weekends, public holidays, Off days and no-fly days, always.
   Apply is ONE command — one Undo step. The drag's own geometry is selectreq.test.ts. */
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
import { planPick } from './reqpick'
import { Matrix } from './Matrix'

const mem = new Map<string, string>()
const origEFP = document.elementFromPoint
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
afterEach(() => { cleanup(); setSession(null); storeBackend.impl = null; _resetTimeline(); document.elementFromPoint = origEFP })

/* the demo year: Thu 1 Jan is a public holiday; Sat 3 / Sun 4 and Sat 10 / Sun 11 weekends; the rest plain weekdays */
const PH = '2026-01-01', FRI2 = '2026-01-02', SAT3 = '2026-01-03', SUN4 = '2026-01-04'
const MON = '2026-01-05', TUE = '2026-01-06', WED = '2026-01-07', THU = '2026-01-08', FRI = '2026-01-09', SAT = '2026-01-10', SUN = '2026-01-11', MON12 = '2026-01-12'
type Row = 'req-p' | 'req-w'
const cell = (row: string, iso: string) => screen.getByTestId(`${row}-${iso}`)
/* a mouse drag from one cell to another: press, move past the 4px slop with the pointer over the far cell, release —
   then let the drag's own click-swallow retire (it waits one tick for the click a drag leaves behind) */
async function drag(from: Element, to: Element) {
  document.elementFromPoint = () => to
  from.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: 5, clientY: 5, button: 0 }))
  act(() => { window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 40, clientY: 5 })) })
  act(() => { window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', button: 0 })) })
  await act(async () => { await new Promise(r => setTimeout(r, 2)) })
}
const pick = (r0: Row, d0: string, r1: Row, d1: string) => drag(cell(r0, d0), cell(r1, d1))
const panel = () => screen.queryByTestId('req-panel')
const num = () => screen.getByTestId('req-panel-num') as HTMLInputElement
const type = (v: string) => fireEvent.change(num(), { target: { value: v } })
const txt = (id: string) => screen.getByTestId(id).textContent ?? ''
const req = (iso: string) => flyAnswer(iso).req
const days = () => getFlyPlan().days

describe('which picked days take the number (pure)', () => {
  const ans = (iso: string) => flyAnswer(iso)
  it('ordinary days only: all of them', () => {
    expect(planPick([MON, TUE, WED], ans, false)).toMatchObject({ take: [MON, TUE, WED], nf: [], out: [] })
  })
  it('a no-fly day is always left out — included or not', () => {
    setFlyDays([{ iso: WED, cls: 'nf' }])
    expect(planPick([TUE, WED, THU], ans, false)).toMatchObject({ take: [TUE, THU], nf: [WED], out: [] })
    expect(planPick([TUE, WED, THU], ans, true)).toMatchObject({ take: [TUE, THU], nf: [WED] })
  })
  it('mixed with ordinary days, weekend and holiday days are left out — until he presses Include', () => {
    expect(planPick([FRI, SAT, SUN, MON12], ans, false)).toMatchObject({ take: [FRI, MON12], out: [SAT, SUN] })
    expect(planPick([FRI, SAT, SUN, MON12], ans, true)).toMatchObject({ take: [FRI, SAT, SUN, MON12], out: [] })
    expect(planPick([PH, FRI2], ans, false)).toMatchObject({ take: [FRI2], out: [PH] })
  })
  it('a pick of ONLY weekend or holiday days fills them (D637: such a day can take a typed figure)', () => {
    expect(planPick([SAT3, SUN4], ans, false)).toMatchObject({ take: [SAT3, SUN4], out: [] })
    expect(planPick([PH], ans, false)).toMatchObject({ take: [PH], out: [] })
  })
  it('a Saturday he has set to fly is an ordinary day here', () => {
    setFlyDays([{ iso: SAT, cls: 'day' }])
    expect(planPick([FRI, SAT, SUN], ans, false)).toMatchObject({ take: [FRI, SAT], out: [SUN] })
  })
  it('a running figure starts on the first FLYING weekday picked, and clears only the picked flying weekdays', () => {
    setFlyDays([{ iso: WED, cls: 'nf' }, { iso: SAT, cls: 'day' }])
    expect(planPick([SUN4, MON, TUE, WED, THU, FRI, SAT], ans, false)).toMatchObject({ runStart: MON, runClear: [MON, TUE, THU, FRI] })
    expect(planPick([SAT3, SUN4], ans, false).runStart).toBe(SAT3)       // nothing flying picked: the first picked day
  })
})

describe('a drag over the Required rows opens the panel', () => {
  it('titled for the rows picked, with the span and the count — and the picked cells stay lit while it is up', async () => {
    render(<Matrix />)
    await pick('req-p', MON12, 'req-w', '2026-01-16')
    expect(panel()).toBeTruthy()
    expect(txt('req-panel-title')).toBe('Required P and W')
    expect(txt('req-panel-span')).toContain('5 days')
    expect(txt('req-panel-count')).toBe('one number for the 10 picked cells')
    expect(txt('req-panel-days')).toBe('These days'); expect(txt('req-panel-run')).toBe('From 12 Jan on')
    for (const r of ['req-p', 'req-w']) for (const d of [MON12, '2026-01-14', '2026-01-16']) expect(cell(r, d).className).toContain('pick')
    expect(cell('req-p', FRI).className).not.toContain('pick')
    expect(cell('avail-p', MON12).className).not.toContain('pick')
  })
  it('one row alone: its own name, and half the cells', async () => {
    render(<Matrix />)
    await pick('req-w', MON, 'req-w', TUE)
    expect(txt('req-panel-title')).toBe('Required W')
    expect(txt('req-panel-count')).toBe('one number for the 2 picked cells')
  })
  it('on a phone the head and the hint say it shorter — as drawn — so nothing wraps', async () => {
    const orig = window.matchMedia
    ;(window as any).matchMedia = (q: string) => ({ matches: q.includes('max-width: 430px'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
    try {
      render(<Matrix />)
      await pick('req-p', MON, 'req-w', FRI)
      expect(txt('req-panel-title')).toBe('Req P and W')
      expect(txt('req-panel-span')).toBe('5 – 9 Jan · 5 days')
      expect(txt('req-panel-count')).toBe('one number for all 10')
      fireEvent.click(screen.getByTestId('req-panel-x'))
      await pick('req-w', '2026-01-30', 'req-w', '2026-02-02')
      expect(txt('req-panel-title')).toBe('Req W')
      expect(txt('req-panel-span')).toBe('30 Jan – 2 Feb · 2 days')
    } finally { (window as any).matchMedia = orig }
  })
  it('is not a blocking window (D641): no veil, a press on the page behind leaves it up, the grid behind still works', async () => {
    render(<Matrix />)
    await pick('req-p', MON, 'req-p', TUE)
    expect(screen.queryByTestId('sheet-scrim')).toBeNull()
    fireEvent.pointerDown(document.body); fireEvent.click(document.body)
    fireEvent.click(screen.getByTestId('counts-toggle')); fireEvent.click(screen.getByTestId('counts-toggle'))   // the Manning button behind it answers
    expect(screen.getByTestId('fly-row-req-p')).toBeTruthy()
  })
  it('✕ and Escape close it, and the cells go dark', async () => {
    render(<Matrix />)
    await pick('req-p', MON, 'req-p', TUE)
    fireEvent.click(screen.getByTestId('req-panel-x'))
    expect(panel()).toBeNull(); expect(cell('req-p', MON).className).not.toContain('pick')
    await pick('req-p', MON, 'req-p', TUE)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(panel()).toBeNull()
  })
  it('a member picks nothing', async () => {
    setRole('member')
    render(<Matrix />)
    await pick('req-p', MON, 'req-w', TUE)
    expect(panel()).toBeNull()
  })
  it('a new drag while it is up: the SAME panel follows the new pick, keeping the number typed', async () => {
    render(<Matrix />)
    await pick('req-p', MON, 'req-p', TUE); type('18')
    await pick('req-w', THU, 'req-w', FRI)
    expect(screen.getAllByTestId('req-panel')).toHaveLength(1)
    expect(txt('req-panel-title')).toBe('Required W')
    expect(num().value).toBe('18')
    expect(cell('req-p', MON).className).not.toContain('pick'); expect(cell('req-w', THU).className).toContain('pick')
  })
  it('a plain click on a cell of the grid opens that cell’s own thing and closes the panel', async () => {
    render(<Matrix />)
    await pick('req-p', MON, 'req-p', TUE)
    fireEvent.click(cell('req-w', THU))
    expect(panel()).toBeNull()
    expect(screen.getByTestId('fly-edit-input')).toBeTruthy()          // the typing box for the cell he clicked
  })
})

describe('"These days"', () => {
  it('Apply writes the number to every picked cell in ONE command, and closes — one Undo step', async () => {
    render(<Matrix />)
    await pick('req-p', MON, 'req-w', THU)
    const n = commandStream().length
    type('18'); fireEvent.click(screen.getByTestId('req-panel-apply'))
    expect(commandStream().length).toBe(n + 1)
    expect(commandStream().at(-1)!.type).toBe('fly.day.set')
    for (const d of [MON, TUE, WED, THU]) expect(req(d)).toEqual({ p: 18, w: 18 })
    expect(panel()).toBeNull()
    expect(cell('req-w', WED).textContent).toBe('18')
    expect(undoState().undoLabel).toContain('the required pilots and WSOs for 5–8 Jan')
    act(() => { expect(globalUndo().ok).toBe(true) })
    for (const d of [MON, TUE, WED, THU]) expect(req(d)).toEqual({ p: null, w: null })
  })
  it('one row picked: only that seat is written', async () => {
    setFlyDays([{ iso: MON, p: 9 }])
    render(<Matrix />)
    await pick('req-w', MON, 'req-w', TUE)
    type('14'); fireEvent.keyDown(num(), { key: 'Enter' })              // Enter is Apply
    expect(req(MON)).toEqual({ p: 9, w: 14 }); expect(req(TUE)).toEqual({ p: null, w: 14 })
    expect(panel()).toBeNull()
  })
  it('Apply waits for a number; digits only, three at most', async () => {
    render(<Matrix />)
    await pick('req-p', MON, 'req-p', TUE)
    expect((screen.getByTestId('req-panel-apply') as HTMLButtonElement).disabled).toBe(true)
    type('1x8.99'); expect(num().value).toBe('189')
    expect((screen.getByTestId('req-panel-apply') as HTMLButtonElement).disabled).toBe(false)
  })
  it('a no-fly day in the pick is left alone, said so, and not lit', async () => {
    setFlyDays([{ iso: WED, cls: 'nf' }])
    render(<Matrix />)
    await pick('req-p', MON, 'req-w', FRI)
    expect(txt('req-panel-nf')).toBe('Wed 7 Jan is a no-fly day — it is left alone.')
    expect(txt('req-panel-span')).toContain('4 days')
    expect(txt('req-panel-count')).toBe('one number for the 8 picked cells')
    expect(cell('req-p', WED).className).not.toContain('pick')
    type('18'); fireEvent.click(screen.getByTestId('req-panel-apply'))
    expect(days()[WED]).toEqual({ cls: 'nf' })
    expect(req(TUE)).toEqual({ p: 18, w: 18 }); expect(req(THU)).toEqual({ p: 18, w: 18 })
  })
  it('weekend days mixed with ordinary ones are left out and said so; one press takes them in', async () => {
    render(<Matrix />)
    await pick('req-p', FRI, 'req-p', MON12)
    expect(txt('req-panel-out')).toContain('2 weekend or holiday days left out')
    expect(cell('req-p', SAT).className).not.toContain('pick')
    expect(txt('req-panel-count')).toBe('one number for the 2 picked cells')
    fireEvent.click(screen.getByTestId('req-panel-include'))
    expect(cell('req-p', SAT).className).toContain('pick')
    expect(txt('req-panel-count')).toBe('one number for the 4 picked cells')
    expect(txt('req-panel-out')).toContain('2 weekend or holiday days included')
    type('6'); fireEvent.click(screen.getByTestId('req-panel-apply'))
    for (const d of [FRI, SAT, SUN, MON12]) expect(req(d).p, d).toBe(6)
  })
  it('left out means left out: Apply without Include writes nothing on them', async () => {
    render(<Matrix />)
    await pick('req-p', FRI, 'req-p', MON12)
    type('6'); fireEvent.click(screen.getByTestId('req-panel-apply'))
    expect(req(FRI).p).toBe(6); expect(req(MON12).p).toBe(6)
    expect(days()[SAT]).toBeUndefined(); expect(days()[SUN]).toBeUndefined()
  })
  it('a pick of only weekend or holiday days fills them, with nothing to include', async () => {
    render(<Matrix />)
    await pick('req-p', SAT3, 'req-w', SUN4)
    expect(screen.queryByTestId('req-panel-out')).toBeNull()
    type('4'); fireEvent.click(screen.getByTestId('req-panel-apply'))
    expect(req(SAT3)).toEqual({ p: 4, w: 4 }); expect(req(SUN4)).toEqual({ p: 4, w: 4 })
  })
  it('Clear takes the typed figures off the days it is acting on, in one command — a running figure under them shows again', async () => {
    setFlyRun(FRI2, { p: 12, w: 12 })
    setFlyDays([{ iso: MON, p: 18, w: 18 }, { iso: TUE, p: 18 }])
    render(<Matrix />)
    await pick('req-p', MON, 'req-w', TUE)
    const n = commandStream().length
    fireEvent.click(screen.getByTestId('req-panel-clear'))
    expect(commandStream().length).toBe(n + 1)
    expect(days()).toEqual({})
    expect(req(MON)).toEqual({ p: 12, w: 12 })
    expect(panel()).toBeNull()
  })
  it('a save the app refuses says so and keeps the panel with the number', async () => {
    render(<Matrix />)
    await pick('req-p', MON, 'req-p', TUE); type('18')
    setSession({ user: 'member-test', role: 'member' })
    fireEvent.click(screen.getByTestId('req-panel-apply'))
    expect(panel()).toBeTruthy(); expect(num().value).toBe('18')
    expect(txt('req-panel-err')).not.toBe('')
    expect(req(MON).p).toBeNull()
  })
})

describe('"From <date> on"', () => {
  it('Apply starts ONE running figure for the picked seats, and the picked days show it at once — typed figures on them go in the same command', async () => {
    setFlyDays([{ iso: WED, p: 9, w: 9 }, { iso: SAT, p: 3 }])
    render(<Matrix />)
    await pick('req-p', MON, 'req-w', MON12)
    fireEvent.click(screen.getByTestId('req-panel-run'))
    expect(screen.getByTestId('req-panel-run').getAttribute('aria-pressed')).toBe('true')
    type('18')
    expect(txt('req-panel-runnote')).toBe('18 and 18 on every flying day from Mon 5 Jan, until a different figure is typed on a later day. No-fly days, weekends, public holidays and Off days are left alone.')
    const n = commandStream().length
    fireEvent.click(screen.getByTestId('req-panel-apply'))
    expect(commandStream().length).toBe(n + 1)
    expect(commandStream().at(-1)!.type).toBe('fly.run.set')
    expect(getFlyPlan().runs[MON]).toEqual({ p: 18, w: 18 })
    expect(days()[WED]).toBeUndefined()                               // the figure typed inside the block went with it
    expect(days()[SAT]).toEqual({ p: 3 })                             // a weekend is left alone, always
    for (const d of [MON, WED, FRI, MON12, '2026-01-20']) expect(req(d)).toEqual({ p: 18, w: 18 })
    expect(cell('req-p', MON).className).toContain('runstart')
    expect(panel()).toBeNull()
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(getFlyPlan().runs[MON]).toBeUndefined(); expect(req(WED)).toEqual({ p: 9, w: 9 })
  })
  it('starts on the first FLYING weekday of the pick, and its button says that date', async () => {
    render(<Matrix />)
    await pick('req-p', SAT3, 'req-p', TUE)
    expect(txt('req-panel-run')).toBe('From 5 Jan on')
    fireEvent.click(screen.getByTestId('req-panel-run')); type('16'); fireEvent.click(screen.getByTestId('req-panel-apply'))
    expect(getFlyPlan().runs[MON]).toEqual({ p: 16 })
    expect(getFlyPlan().runs[SAT3]).toBeUndefined()
  })
  it('one seat picked: the other seat’s run is not touched, and the sentence names one figure', async () => {
    setFlyRun(MON, { w: 10 })
    render(<Matrix />)
    await pick('req-p', MON, 'req-p', TUE)
    fireEvent.click(screen.getByTestId('req-panel-run')); type('18')
    expect(txt('req-panel-runnote')).toMatch(/^18 on every flying day from Mon 5 Jan/)
    fireEvent.click(screen.getByTestId('req-panel-apply'))
    expect(getFlyPlan().runs[MON]).toEqual({ p: 18, w: 10 })
  })
  it('Clear with it picked takes away the run that starts there for the picked seats — and is offered only where one does', async () => {
    setFlyRun(FRI2, { p: 12 }); setFlyRun(MON, { p: 18, w: 14 })
    render(<Matrix />)
    await pick('req-p', MON, 'req-p', TUE)
    fireEvent.click(screen.getByTestId('req-panel-run'))
    fireEvent.click(screen.getByTestId('req-panel-clear'))
    expect(getFlyPlan().runs[MON]).toEqual({ w: 14 })
    expect(req(TUE).p).toBe(12)
    await pick('req-p', WED, 'req-p', THU)
    fireEvent.click(screen.getByTestId('req-panel-run'))
    expect((screen.getByTestId('req-panel-clear') as HTMLButtonElement).disabled).toBe(true)
  })
})
