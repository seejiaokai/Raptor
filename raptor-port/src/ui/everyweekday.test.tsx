// @vitest-environment jsdom
/* "EVERY <WEEKDAY>" — a weekday's heading on Days' month (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4: "A weekday's heading opens 'Every <weekday>':
   the class, the date it starts (the next such day by default), and Until — no end, or a date; with the rules already
   made for that weekday listed beneath, each removable").

   Owner, D631 (7 Oct 26): "no-fly days can repeat — every Thursday from a date onward, with no end." D638: "a weekday's
   heading sets repeating days." It is how "Thursdays are no-fly from 5 Nov" is said once instead of date by date; a
   single Thursday can still be set by itself on the month (it then wears the dot).

   A second window on the windows shell (D641 — it does not block the page, nor Days behind it). Save is ONE command
   (`fly.rule.set`), Remove is one (`fly.rule.remove`); each is one Undo step. The rule itself — which rule is in force
   on a date, a rule for the same weekday and start replacing the first — is state/flyplan.ts and the resolver's, pinned
   by state/flyplan.test.ts and state/flyplan-model.suite.ts; what is pinned HERE is the form. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../engine/hooks'
import { initStore as raptorInitStore, notify } from '../state/store'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo, undoState } from '../undo'
import { commandStream } from '../command'
import { getFlyPlan, setFlyRule } from '../state/flyplan'
import { initStore as lwInitStore, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { flyAnswer } from '../leavewar/sync'
import { setDaysWin } from './pops'
import { _resetFloatWins } from './FloatWindow'
import { DaysWindow } from './DaysWindow'
import { firstWeekdayFrom, sayDateY } from './daysfmt'

const mem = new Map<string, string>()
beforeEach(() => {
  /* today is Thu 8 Oct 2026 — only the clock's date is held still; timers run as they are */
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 8, 12, 0, 0))
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  _resetTimeline(); installGlobalUndo()
  lwInitStore(memoryBackend())
  setRole('admin')
})
afterEach(() => { cleanup(); _resetFloatWins(); setDaysWin(null); setSession(null); storeBackend.impl = null; _resetTimeline(); vi.useRealTimers() })

const t = (id: string) => screen.getByTestId(id)
const q = (id: string) => screen.queryByTestId(id)
const pressed = (id: string) => t(id).getAttribute('aria-pressed')
const rules = () => getFlyPlan().rules
const steps = () => commandStream().length
/** Days on a month, then a weekday's heading (0 = Monday) */
function openEvery(wd: number, month = '2026-11-02') {
  render(<DaysWindow />)
  act(() => { setDaysWin(month); notify() })
  fireEvent.click(t(`days-wd-${wd}`))
}
const setDate = (id: string, iso: string) => fireEvent.change(t(id), { target: { value: iso } })

describe('the pure helpers', () => {
  it('the first such weekday on or after a date', () => {
    expect(firstWeekdayFrom(3, '2026-10-08')).toBe('2026-10-08')      // a Thursday is its own first Thursday
    expect(firstWeekdayFrom(0, '2026-10-08')).toBe('2026-10-12')
    expect(firstWeekdayFrom(2, '2026-10-08')).toBe('2026-10-14')
    expect(firstWeekdayFrom(3, '2026-12-31')).toBe('2026-12-31')
    expect(firstWeekdayFrom(4, '2026-12-31')).toBe('2027-01-01')      // across a year's end
  })
  it('a date said with its year', () => { expect(sayDateY('2026-11-05')).toBe('Thu 5 Nov 2026') })
})

describe('a weekday’s heading', () => {
  it('is a button that says what it opens, on all seven', () => {
    render(<DaysWindow />); act(() => { setDaysWin('2026-11-02'); notify() })
    const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    names.forEach((n, i) => {
      expect(t(`days-wd-${i}`).tagName).toBe('BUTTON')
      expect(t(`days-wd-${i}`).getAttribute('aria-label')).toBe(`Every ${n}…`)
      expect(t(`days-wd-${i}`).textContent).toContain(n.slice(0, 3))
    })
    expect(q('win-every')).toBeNull()
  })
  it('opens "Every Thursday" beside Days — Days stays up — and another heading swaps it', () => {
    openEvery(3)
    expect(t('win-every').getAttribute('aria-label')).toBe('Every Thursday')
    expect(t('win-every').getAttribute('aria-modal')).toBe('false')
    expect(t('win-days')).toBeTruthy()
    expect(t('days-wd-3').getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(t('every-cls-night'))
    fireEvent.click(t('days-wd-0'))
    expect(screen.getAllByTestId('win-every').length).toBe(1)
    expect(t('win-every').getAttribute('aria-label')).toBe('Every Monday')
    /* a fresh form for the new weekday — its own start, nothing carried over from Thursday's */
    expect((t('every-from') as HTMLInputElement).value).toBe('2026-11-02')
    expect(pressed('every-cls-nf')).toBe('true')
    expect(t('days-wd-3').getAttribute('aria-expanded')).toBe('false')
  })
  it('✕ and Cancel close it and leave Days; closing Days takes it too', () => {
    openEvery(3)
    fireEvent.click(t('win-every-x'))
    expect(q('win-every')).toBeNull(); expect(t('win-days')).toBeTruthy()
    fireEvent.click(t('days-wd-3')); fireEvent.click(t('every-cancel'))
    expect(q('win-every')).toBeNull(); expect(t('win-days')).toBeTruthy()
    fireEvent.click(t('days-wd-3')); fireEvent.click(t('win-days-x'))
    expect(q('win-every')).toBeNull(); expect(q('win-days')).toBeNull()
    expect(rules()).toEqual([])
  })
})

describe('what it starts with', () => {
  it('a weekday: no fly lit, from the first such day on screen, no end', () => {
    openEvery(3)                                        // November 2026 is on screen
    expect(pressed('every-cls-nf')).toBe('true'); expect(pressed('every-cls-day')).toBe('false'); expect(pressed('every-cls-night')).toBe('false')
    expect((t('every-from') as HTMLInputElement).value).toBe('2026-11-05')
    expect(pressed('every-until-none')).toBe('true'); expect(pressed('every-until-date')).toBe('false')
    expect(q('every-until')).toBeNull()
    expect(t('every-says').textContent).toBe('Every Thursday from Thu 5 Nov 2026 onward is a no-fly day, until you change it here. A single Thursday can still be set by itself.')
  })
  it('on the month today is in, it starts from the next such day — today counts', () => {
    openEvery(3, '2026-10-08')
    expect((t('every-from') as HTMLInputElement).value).toBe('2026-10-08')
    cleanup(); _resetFloatWins(); setDaysWin(null)
    openEvery(0, '2026-10-08')
    expect((t('every-from') as HTMLInputElement).value).toBe('2026-10-12')
  })
  it('on a month already past, it still starts from the next such day — never in the past', () => {
    openEvery(3, '2026-03-10')
    expect((t('every-from') as HTMLInputElement).value).toBe('2026-10-08')
  })
  it('a Saturday: day flying lit — a Saturday has no flying set until he says so', () => {
    openEvery(5)
    expect(pressed('every-cls-day')).toBe('true')
    expect(t('every-says').textContent).toBe('Every Saturday from Sat 7 Nov 2026 onward is a day-flying day, until you change it here. A single Saturday can still be set by itself.')
  })
})

describe('Save', () => {
  it('writes ONE rule in one Undo step, closes, and the month follows with no dot', () => {
    openEvery(3)
    const before = steps()
    fireEvent.click(t('every-save'))
    expect(steps()).toBe(before + 1)
    expect(rules().map(r => ({ wd: r.wd, cls: r.cls, from: r.from, until: r.until }))).toEqual([{ wd: 3, cls: 'nf', from: '2026-11-05', until: undefined }])
    expect(q('win-every')).toBeNull(); expect(t('win-days')).toBeTruthy()
    expect(pressed('days-nf-2026-11-05')).toBe('true'); expect(pressed('days-nf-2026-11-26')).toBe('true')
    expect(q('days-dot-2026-11-05')).toBeNull()
    expect(undoState().undoLabel).toContain('Thursdays as no-fly days from 5 Nov')
    act(() => { globalUndo() })
    expect(rules()).toEqual([]); expect(pressed('days-d-2026-11-05')).toBe('true')
  })
  it('the class and the start are his to change, and the sentence says what will be saved', () => {
    openEvery(3)
    fireEvent.click(t('every-cls-night'))
    setDate('every-from', '2026-11-19')
    expect(pressed('every-cls-night')).toBe('true'); expect(pressed('every-cls-nf')).toBe('false')
    expect(t('every-says').textContent).toBe('Every Thursday from Thu 19 Nov 2026 onward is a night-flying day, until you change it here. A single Thursday can still be set by itself.')
    fireEvent.click(t('every-save'))
    expect(flyAnswer('2026-11-12').cls).toBe('day'); expect(flyAnswer('2026-11-19').cls).toBe('night'); expect(flyAnswer('2027-02-04').cls).toBe('night')
  })
  it('"A date" asks when it ends, and the rule stops there', () => {
    openEvery(3)
    fireEvent.click(t('every-until-date'))
    expect(pressed('every-until-date')).toBe('true'); expect(pressed('every-until-none')).toBe('false')
    setDate('every-until', '2026-11-19')
    expect(t('every-says').textContent).toBe('Every Thursday from Thu 5 Nov 2026 to Thu 19 Nov 2026 is a no-fly day. A single Thursday can still be set by itself.')
    fireEvent.click(t('every-save'))
    expect(rules()[0].until).toBe('2026-11-19')
    expect(flyAnswer('2026-11-19').cls).toBe('nf'); expect(flyAnswer('2026-11-26').cls).toBe('day')
  })
  it('back to "No end" drops the end date', () => {
    openEvery(3)
    fireEvent.click(t('every-until-date')); setDate('every-until', '2026-11-19')
    fireEvent.click(t('every-until-none'))
    expect(q('every-until')).toBeNull()
    fireEvent.click(t('every-save'))
    expect(rules()[0].until).toBeUndefined()
  })
  it('"A date" with no date chosen is not saved — it says what is missing', () => {
    openEvery(3)
    fireEvent.click(t('every-until-date'))
    const before = steps()
    fireEvent.click(t('every-save'))
    expect(t('every-err').textContent).toBe('Choose the date it ends, or pick No end.')
    expect(steps()).toBe(before); expect(rules()).toEqual([]); expect(t('win-every')).toBeTruthy()
  })
  it('an end before the start, and no start at all, are refused with a sentence', () => {
    openEvery(3)
    fireEvent.click(t('every-until-date')); setDate('every-until', '2026-11-01')
    fireEvent.click(t('every-save'))
    expect(t('every-err').textContent).toBe('It cannot end before it starts.')
    setDate('every-from', '')
    fireEvent.click(t('every-save'))
    expect(t('every-err').textContent).toBe('Choose the date it starts.')
    expect(rules()).toEqual([])
    /* put right, the line goes and it saves */
    setDate('every-from', '2026-10-29')
    expect(q('every-err')).toBeNull()
    fireEvent.click(t('every-save'))
    expect(rules().length).toBe(1)
  })
  it('a save the store refuses says so and keeps the window', () => {
    openEvery(3)
    const real = storeBackend.impl
    storeBackend.impl = { ...(real as any), setItem: () => { throw new Error('full') } } as any
    fireEvent.click(t('every-save'))
    storeBackend.impl = real
    expect(t('every-err').textContent).toMatch(/could not be saved/i)
    expect(t('win-every')).toBeTruthy(); expect(rules()).toEqual([])
  })
})

describe('the rules already made for that weekday', () => {
  it('none: nothing is listed', () => {
    openEvery(3)
    expect(q('every-list')).toBeNull()
  })
  it('are listed beneath in date order, only that weekday’s, each said in full', () => {
    act(() => { setFlyRule({ wd: 3, cls: 'night', from: '2027-01-07', until: '2027-01-28' }) })
    act(() => { setFlyRule({ wd: 3, cls: 'nf', from: '2026-11-05' }) })
    act(() => { setFlyRule({ wd: 0, cls: 'nf', from: '2026-11-02' }) })
    openEvery(3)
    const lines = [...t('every-list').querySelectorAll('.every-rule-txt')].map(n => n.textContent)
    expect(lines).toEqual(['No fly · from Thu 5 Nov 2026 · no end', 'Night flying · from Thu 7 Jan 2027 · until Thu 28 Jan 2027'])
    expect(t('every-list').textContent).toContain('Already set for Thursdays')
  })
  it('Remove takes one away in one Undo step; the window stays and the month follows', () => {
    act(() => { setFlyRule({ wd: 3, cls: 'nf', from: '2026-11-05' }) })
    openEvery(3)
    const id = rules()[0].id
    expect(pressed('days-nf-2026-11-05')).toBe('true')
    const before = steps()
    fireEvent.click(t(`every-remove-${id}`))
    expect(steps()).toBe(before + 1); expect(rules()).toEqual([])
    expect(t('win-every')).toBeTruthy(); expect(q('every-list')).toBeNull()
    expect(pressed('days-d-2026-11-05')).toBe('true')
    act(() => { globalUndo() })
    expect(rules().length).toBe(1); expect(t(`every-remove-${id}`).getAttribute('aria-label')).toBe('Remove: No fly from Thu 5 Nov 2026')
  })
  it('saving again for the same weekday and the same start replaces that rule — never two for one start', () => {
    act(() => { setFlyRule({ wd: 3, cls: 'nf', from: '2026-11-05' }) })
    openEvery(3)
    fireEvent.click(t('every-cls-night')); fireEvent.click(t('every-save'))
    expect(rules().length).toBe(1); expect(rules()[0].cls).toBe('night')
  })
})
