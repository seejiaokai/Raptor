// @vitest-environment jsdom
/* DAYS — THE MONTH (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4; owner D631,
   D633, D638, D642: "the month carries a select button on every day — day, night or no fly, chosen right on the date";
   a desktop date carries three buttons and a phone date ONE that steps; Saturday and Sunday start with no flying set).

   One window on the windows shell (ui/FloatWindow.tsx — it does not block the page, D641), admins only. A date shows
   its number and EITHER the tag the Leave War gives it (PH, OFF — never a class control under a holiday) OR its class
   control. Every press is ONE command and ONE Undo step; a press that would change nothing writes nothing. A date set
   apart from what its weekday would give wears a small dot.

   What a day IS comes from the one join (leavewar/sync.ts flyMonth → state/flyplan-model.ts planFor) — this window
   never works a class out for itself; the resolver's rules are pinned by state/flyplan-model.suite.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../engine/hooks'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo, undoState } from '../undo'
import { commandStream } from '../command'
import { getFlyPlan, setFlyRule } from '../state/flyplan'
import { getState, initStore as lwInitStore, setDayEvent, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { flyAnswer } from '../leavewar/sync'
import { DAYSWIN, POPS_RESET, setDaysWin } from './pops'
import { notify } from '../state/store'
import { _resetFloatWins } from './FloatWindow'
import { DaysWindow } from './DaysWindow'

const mem = new Map<string, string>()
const realMM = window.matchMedia
/* the phone form is asked of the browser, as the windows' own phone layout is */
const asPhone = (on: boolean) => { (window as any).matchMedia = (q: string) => ({ matches: on && /max-width:\s*820px/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) }

beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  _resetTimeline(); installGlobalUndo()
  lwInitStore(memoryBackend())
  setRole('admin')
  asPhone(false)
})
afterEach(() => { cleanup(); _resetFloatWins(); setDaysWin(null); setSession(null); storeBackend.impl = null; _resetTimeline(); (window as any).matchMedia = realMM })

/* November 2026: Mon 2 … Sun 1 is the month's first date; Thu 5; Sat 7; Sun 8 */
const MON = '2026-11-02', TUE = '2026-11-03', THU = '2026-11-05', SAT = '2026-11-07', SUN = '2026-11-08'
function open(iso = MON) { act(() => { setDaysWin(iso); notify() }) }
const t = (id: string) => screen.getByTestId(id)
const q = (id: string) => screen.queryByTestId(id)
const pressed = (id: string) => t(id).getAttribute('aria-pressed')
const cls = (iso: string) => flyAnswer(iso).cls
/* one press = one command = one Undo step */
const steps = () => commandStream().length

describe('the window', () => {
  it('is closed until asked for, opens on the month of the date it is given, and ✕ closes it', () => {
    render(<DaysWindow />)
    expect(q('win-days')).toBeNull()
    open(THU)
    expect(t('win-days').getAttribute('aria-modal')).toBe('false')
    /* on screen it is called "Calendar" (D675) — "Days" is its name in the code only */
    expect(t('win-days').getAttribute('aria-label')).toBe('Calendar')
    expect(t('win-days').querySelector('.win-ttl')!.textContent).toBe('Calendaradmins only')
    expect(t('days-month').textContent).toBe('November 2026')
    fireEvent.click(t('win-days-x'))
    expect(q('win-days')).toBeNull(); expect(DAYSWIN).toBeNull()
  })
  it('is an admin’s: a member who somehow has it asked for sees nothing', () => {
    render(<DaysWindow />)
    setSession({ user: 'us', role: 'member' })
    open()
    expect(q('win-days')).toBeNull()
    /* and it is not left asked for: back as an admin, it is still closed */
    expect(DAYSWIN).toBeNull()
    setSession({ user: 'admin-test', role: 'admin' })
    act(() => { notify() })
    expect(q('win-days')).toBeNull()
  })
  it('asked for again on another month while it is up, it goes to that month', () => {
    render(<DaysWindow />); open(MON)
    expect(t('days-month').textContent).toBe('November 2026')
    open('2027-03-10')
    expect(t('days-month').textContent).toBe('March 2027')
  })
  it('closes with the session, as every window does', () => {
    setDaysWin(MON)
    for (const p of POPS_RESET) p.reset()
    expect(DAYSWIN).toBeNull()
  })
  it('draws the month Monday first: seven headings, every date of the month once, blanks before the 1st', () => {
    render(<DaysWindow />); open()
    expect([...t('days-grid').querySelectorAll('.days-wd')].map(n => n.childNodes[0].textContent)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    const cells = [...t('days-grid').querySelectorAll('[data-iso]')].map(n => n.getAttribute('data-iso'))
    expect(cells.length).toBe(30); expect(cells[0]).toBe('2026-11-01'); expect(cells[29]).toBe('2026-11-30')
    /* 1 Nov 2026 is a Sunday: six blanks lead the first week */
    expect(t('days-grid').querySelectorAll('.days-blank').length).toBe(6)
    expect(t('days-cell-2026-11-01').querySelector('.days-num')!.textContent).toBe('1')
  })
  it('‹ and › step a month, across a year’s end; Today comes back to today’s month', () => {
    render(<DaysWindow />); open('2026-12-15')
    fireEvent.click(t('days-next'))
    expect(t('days-month').textContent).toBe('January 2027')
    expect(q('days-cell-2027-01-31')).toBeTruthy()
    fireEvent.click(t('days-prev')); fireEvent.click(t('days-prev'))
    expect(t('days-month').textContent).toBe('November 2026')
    fireEvent.click(t('days-today'))
    const now = new Date()
    expect(t('days-month').textContent).toBe(now.toLocaleString('en-GB', { month: 'long' }) + ' ' + now.getFullYear())
  })
})

describe('a desktop date: three buttons, the chosen one lit', () => {
  it('a weekday starts as day flying (D lit); a Saturday and a Sunday start with none lit', () => {
    render(<DaysWindow />); open()
    expect(pressed(`days-d-${MON}`)).toBe('true'); expect(pressed(`days-n-${MON}`)).toBe('false'); expect(pressed(`days-nf-${MON}`)).toBe('false')
    for (const iso of [SAT, SUN]) for (const k of ['d', 'n', 'nf']) expect(pressed(`days-${k}-${iso}`), iso + k).toBe('false')
    expect(q(`days-step-${MON}`)).toBeNull()
  })
  it('a press sets the class for that date alone — one Undo step, and Undo puts it back', () => {
    render(<DaysWindow />); open()
    const before = steps()
    fireEvent.click(t(`days-n-${MON}`))
    expect(cls(MON)).toBe('night'); expect(cls(TUE)).toBe('day')
    expect(pressed(`days-n-${MON}`)).toBe('true'); expect(pressed(`days-d-${MON}`)).toBe('false')
    expect(steps()).toBe(before + 1)
    fireEvent.click(t(`days-nf-${MON}`))
    expect(cls(MON)).toBe('nf'); expect(steps()).toBe(before + 2)
    expect(undoState().undoLabel).toContain('day or night flying on Mon 2 Nov')
    act(() => { globalUndo() })
    expect(cls(MON)).toBe('night'); expect(pressed(`days-n-${MON}`)).toBe('true')
    act(() => { globalUndo() })
    expect(cls(MON)).toBe('day'); expect(getFlyPlan().days[MON]).toBeUndefined()
  })
  it('pressing the lit one on a weekday changes nothing and writes nothing', () => {
    render(<DaysWindow />); open()
    const before = steps()
    fireEvent.click(t(`days-d-${MON}`))
    expect(cls(MON)).toBe('day'); expect(steps()).toBe(before); expect(getFlyPlan().days).toEqual({})
  })
  it('pressing the lit one on a Saturday or Sunday unsets it — back to no flying set', () => {
    render(<DaysWindow />); open()
    fireEvent.click(t(`days-d-${SAT}`))
    expect(cls(SAT)).toBe('day'); expect(pressed(`days-d-${SAT}`)).toBe('true')
    fireEvent.click(t(`days-d-${SAT}`))
    expect(cls(SAT)).toBe('none'); expect(pressed(`days-d-${SAT}`)).toBe('false')
    expect(getFlyPlan().days[SAT]).toBeUndefined()
  })
  it('a date set apart from what its weekday gives wears the dot; one that follows it does not', () => {
    render(<DaysWindow />); open()
    expect(q(`days-dot-${MON}`)).toBeNull()
    fireEvent.click(t(`days-n-${MON}`))
    expect(t(`days-dot-${MON}`).getAttribute('title')).toBe('Set for this date')
    fireEvent.click(t(`days-d-${MON}`))
    expect(q(`days-dot-${MON}`)).toBeNull()
  })
  it('a weekday’s rule lights its dates with no dot, and a date set against the rule wears one', () => {
    render(<DaysWindow />); open()
    act(() => { setFlyRule({ wd: 3, cls: 'nf', from: THU }) })
    expect(pressed(`days-nf-${THU}`)).toBe('true'); expect(pressed('days-nf-2026-11-12')).toBe('true')
    expect(q(`days-dot-${THU}`)).toBeNull()
    fireEvent.click(t('days-d-2026-11-12'))
    expect(cls('2026-11-12')).toBe('day'); expect(t('days-dot-2026-11-12')).toBeTruthy()
    /* and stepped back to its rule, nothing is left stored for the date */
    fireEvent.click(t('days-nf-2026-11-12'))
    expect(getFlyPlan().days['2026-11-12']).toBeUndefined(); expect(q('days-dot-2026-11-12')).toBeNull()
  })
  it('each button says what it is to a screen reader', () => {
    render(<DaysWindow />); open()
    expect(t(`days-d-${MON}`).getAttribute('aria-label')).toBe('Mon 2 Nov: day flying')
    expect(t(`days-n-${MON}`).getAttribute('aria-label')).toBe('Mon 2 Nov: night flying')
    expect(t(`days-nf-${MON}`).getAttribute('aria-label')).toBe('Mon 2 Nov: no fly')
    expect(t(`days-d-${MON}`).textContent).toBe('D'); expect(t(`days-n-${MON}`).textContent).toBe('N'); expect(t(`days-nf-${MON}`).textContent).toBe('NF')
  })
})

describe('a phone date: ONE button that steps', () => {
  it('steps day → night → no fly → day on a weekday, each tap one Undo step', () => {
    asPhone(true)
    render(<DaysWindow />); open()
    expect(q(`days-d-${MON}`)).toBeNull()
    const b = () => t(`days-step-${MON}`)
    expect(b().getAttribute('data-cls')).toBe('day')
    expect(b().getAttribute('aria-label')).toBe('Mon 2 Nov: day flying. Tap for night flying')
    const before = steps()
    fireEvent.click(b()); expect(cls(MON)).toBe('night'); expect(b().getAttribute('data-cls')).toBe('night')
    fireEvent.click(b()); expect(cls(MON)).toBe('nf'); expect(b().textContent).toBe('NF')
    fireEvent.click(b()); expect(cls(MON)).toBe('day')
    expect(steps()).toBe(before + 3)
  })
  it('on a Saturday it starts not set, and steps on from no fly to not set again', () => {
    asPhone(true)
    render(<DaysWindow />); open()
    const b = () => t(`days-step-${SAT}`)
    expect(b().getAttribute('data-cls')).toBe('none')
    expect(b().getAttribute('aria-label')).toBe('Sat 7 Nov: no flying set. Tap for day flying')
    fireEvent.click(b()); expect(cls(SAT)).toBe('day')
    fireEvent.click(b()); expect(cls(SAT)).toBe('night')
    fireEvent.click(b()); expect(cls(SAT)).toBe('nf')
    expect(b().getAttribute('aria-label')).toBe('Sat 7 Nov: no fly. Tap for no flying set')
    fireEvent.click(b()); expect(cls(SAT)).toBe('none'); expect(getFlyPlan().days[SAT]).toBeUndefined()
  })
})

describe('a public holiday and an Off day show their tag, never a class control', () => {
  it('the Leave War’s PH and Off day reach the month as tags, at both sizes', () => {
    const war = getState().period
    const inWar = (iso: string) => war.days.some(d => d.date === iso)
    /* two weekdays of the period on screen, whatever year the seed war is */
    const days = war.days.map(d => d.date).filter(iso => { const wd = new Date(iso + 'T00:00:00Z').getUTCDay(); return wd >= 1 && wd <= 5 })
    const PH = days[10], OFF = days[11]
    expect(inWar(PH) && inWar(OFF)).toBe(true)
    setDayEvent(PH, 0, 'PH'); setDayEvent(OFF, 0, 'Off day')
    render(<DaysWindow />); open(PH)
    expect(t(`days-tag-${PH}`).textContent).toBe('PH'); expect(t(`days-tag-${PH}`).className).toContain('ph')
    expect(t(`days-cell-${PH}`).className).toContain('ph')
    for (const k of ['d', 'n', 'nf', 'step']) expect(q(`days-${k}-${PH}`), k).toBeNull()
    if (OFF.slice(0, 7) === PH.slice(0, 7)) {
      expect(t(`days-tag-${OFF}`).textContent).toBe('OFF'); expect(t(`days-tag-${OFF}`).className).toContain('off')
      expect(q(`days-d-${OFF}`)).toBeNull()
    }
    cleanup(); asPhone(true)
    render(<DaysWindow />); open(PH)
    expect(t(`days-tag-${PH}`).textContent).toBe('PH'); expect(q(`days-step-${PH}`)).toBeNull()
  })
  it('a holiday declared while the window is up replaces the date’s buttons at once', () => {
    const war = getState().period
    const PH = war.days.map(d => d.date).filter(iso => { const wd = new Date(iso + 'T00:00:00Z').getUTCDay(); return wd >= 1 && wd <= 5 })[10]
    render(<DaysWindow />); open(PH)
    expect(q(`days-d-${PH}`)).toBeTruthy()
    act(() => { setDayEvent(PH, 0, 'PH') })
    expect(q(`days-d-${PH}`)).toBeNull(); expect(t(`days-tag-${PH}`).textContent).toBe('PH')
  })
})

describe('a save that is refused says so in the window', () => {
  it('shows the sentence, and the date keeps what it had', () => {
    render(<DaysWindow />); open()
    /* the store cannot take the write: the command reads its row back, finds it missing and rolls back */
    const real = storeBackend.impl
    storeBackend.impl = { ...(real as any), setItem: () => { throw new Error('full') } } as any
    fireEvent.click(t(`days-n-${MON}`))
    storeBackend.impl = real
    expect(t('days-err').textContent).toMatch(/could not be saved/i)
    expect(cls(MON)).toBe('day'); expect(pressed(`days-d-${MON}`)).toBe('true')
    /* the next good press clears it */
    fireEvent.click(t(`days-n-${MON}`))
    expect(q('days-err')).toBeNull(); expect(cls(MON)).toBe('night')
  })
})
