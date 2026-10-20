// @vitest-environment jsdom
/* ADMIN → DATA: THE DATES OF THE TWO CLEARING FORMS (ui/AdminPage.tsx `ClearControl`) — [ONE-DATE-CALENDAR] step one.

   Owner, 25 Aug 26: "There should be an option for data range selected, specific date and option for anything older than
   this date." D796, D797 (13 Oct 26): "Older than" and "A specific date" are ONE box among others, so each is the app's
   own date box opening the calendar over the form; "A date range" was two of the phone's date boxes and is ONE calendar
   drawn in the form itself — "two taps make the run; it is said in words beneath" — "shown only in that mode".

   The form never touches data: it asks its `run` (dry) for a count, arms the button with it, and asks again for real on
   the second tap. Pinned here: which dates reach `run` in each mode, and that every change of a date DISARMS — an
   armed count must always be the count the second tap clears. (What a sweep clears is ui/wipe.test.tsx.) */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { setSession } from '../state/auth'
import { ClearControl } from './AdminPage'
import { boxValue, pickDate, tapDay } from './datecal-testkit'

const run = vi.fn<(mode: string, a: string, b: string, dry?: boolean) => number>()
beforeEach(() => {
  /* today is Tue 3 Nov 2026 */
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 3, 12, 0, 0))
  setSession({ user: 'admin-test', role: 'admin' })
  run.mockReset(); run.mockReturnValue(3)
  render(<ClearControl idp="x" act="Clear…" note="A note." zero="Nothing in that period" unit={['item', 'items']} run={run as any} />)
})
afterEach(() => { cleanup(); setSession(null); vi.useRealTimers() })

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const go = () => $('#x') as HTMLButtonElement
const mode = (m: 'before' | 'on' | 'range') => fireEvent.change($('#xMode'), { target: { value: m } })

describe('"Anything older than a date" and "A specific date" — one box', () => {
  it('the date is the app’s own box: empty until picked, and nothing can be cleared until it is', () => {
    expect($('#xDate').tagName).toBe('BUTTON')
    expect($('#xDate').textContent).toContain('Pick a date')
    expect($('#xDate').getAttribute('aria-label')).toBe('Older than: no date picked')
    expect(document.querySelector('input[type="date"]')).toBeNull()
    expect(go().disabled).toBe(true)
    fireEvent.click(go())
    expect(run).not.toHaveBeenCalled()
  })
  it('a date picked on the calendar is the date the sweep is asked about, then run on', () => {
    pickDate($('#xDate'), '2026-10-01')
    expect(boxValue($('#xDate'))).toBe('2026-10-01')
    expect(go().disabled).toBe(false)
    fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('before', '2026-10-01', '', true)
    expect(go().textContent).toBe('Tap again to clear 3 items')
    fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('before', '2026-10-01', '')
    expect(go().textContent).toBe('Clear…')
  })
  it('picking another date DISARMS: the count shown is never for a date no longer chosen', () => {
    pickDate($('#xDate'), '2026-10-01'); fireEvent.click(go())
    expect(go().textContent).toBe('Tap again to clear 3 items')
    pickDate($('#xDate'), '2026-10-08')
    expect(go().textContent).toBe('Clear…')
    fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('before', '2026-10-08', '', true)
  })
  it('"A specific date" is the same box under its own name', () => {
    mode('on')
    expect($('#xDate').getAttribute('aria-label')).toBe('Date: no date picked')
    pickDate($('#xDate'), '2026-10-05'); fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('on', '2026-10-05', '', true)
  })
})

describe('"A date range" — one calendar in the form, not two boxes', () => {
  it('is drawn only in that mode, and says what to do before anything is tapped', () => {
    expect($('#xRun')).toBeNull()
    mode('range')
    expect($('#xRun')).toBeTruthy()
    expect($('#xDate')).toBeNull(); expect($('#xDate2')).toBeNull()
    expect(document.querySelector('.dcal-layer'), 'in the form itself — nothing floats').toBeNull()
    expect(screen.getByTestId('xRun-foot').textContent).toBe('Tap the first day, then the last.')
    expect(go().disabled).toBe(true)
    mode('before')
    expect($('#xRun')).toBeNull(); expect($('#xDate')).toBeTruthy()
  })
  it('two taps make the run, it is said in words beneath, and those two dates reach the sweep', () => {
    mode('range')
    tapDay('2026-11-09', 'xRun')
    expect(screen.getByTestId('xRun-foot').textContent).toBe('Mon 9 Nov 26')
    expect(go().disabled, 'one tap is a run of one day').toBe(false)
    tapDay('2026-11-12', 'xRun')
    expect(screen.getByTestId('xRun-foot').textContent).toBe('Mon 9 Nov 26 to Thu 12 Nov 26')
    fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('range', '2026-11-09', '2026-11-12', true)
    fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('range', '2026-11-09', '2026-11-12')
  })
  it('a tap on a new day starts the run over and DISARMS — there is no Clear', () => {
    mode('range')
    tapDay('2026-11-09', 'xRun'); tapDay('2026-11-12', 'xRun'); fireEvent.click(go())
    expect(go().textContent).toBe('Tap again to clear 3 items')
    tapDay('2026-11-20', 'xRun')
    expect(go().textContent).toBe('Clear…')
    expect(screen.getByTestId('xRun-foot').textContent).toBe('Fri 20 Nov 26')
    fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('range', '2026-11-20', '2026-11-20', true)
  })
  it('a run across a month’s end is one run', () => {
    mode('range')
    tapDay('2026-10-28', 'xRun'); tapDay('2026-11-02', 'xRun'); fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('range', '2026-10-28', '2026-11-02', true)
  })
  it('a date already picked in one of the other modes arrives as a run of that one day — and is one', () => {
    pickDate($('#xDate'), '2026-10-01')
    mode('range')
    expect(screen.getByTestId('xRun-day-2026-10-01').classList.contains('is-sel')).toBe(true)
    expect(screen.getByTestId('xRun-foot').textContent).toBe('Thu 1 Oct 26')
    fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('range', '2026-10-01', '2026-10-01', true)
  })
  it('back in a one-date mode, the box holds the run’s first day', () => {
    mode('range')
    tapDay('2026-11-09', 'xRun'); tapDay('2026-11-12', 'xRun')
    mode('on')
    expect(boxValue($('#xDate'))).toBe('2026-11-09')
    fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('on', '2026-11-09', '2026-11-12', true)
  })
  /* THE READ'S F6 (13 Oct 26): a range made, then ONE date picked in another mode, came back as a run from that date to
     the OLD end — fourteen days where he last chose one, its end in another month, on a form that clears for good */
  it('a date picked in a one-date mode after a range was made is a run of THAT day, not a run to the old end', () => {
    mode('range')
    tapDay('2026-10-28', 'xRun'); tapDay('2026-11-02', 'xRun')
    mode('on')
    pickDate($('#xDate'), '2026-10-20')
    mode('range')
    expect(screen.getByTestId('xRun-foot').textContent).toBe('Tue 20 Oct 26')
    fireEvent.click(go())
    expect(run).toHaveBeenLastCalledWith('range', '2026-10-20', '2026-10-20', true)
  })
  it('changing the period DISARMS', () => {
    pickDate($('#xDate'), '2026-10-01'); fireEvent.click(go())
    expect(go().textContent).toBe('Tap again to clear 3 items')
    mode('on')
    expect(go().textContent).toBe('Clear…')
  })
})

describe('a sweep that finds nothing', () => {
  it('never arms — the button stays as it was', () => {
    run.mockReturnValue(0)
    pickDate($('#xDate'), '2026-10-01'); fireEvent.click(go())
    expect(go().textContent).toBe('Clear…')
    expect(run).toHaveBeenCalledTimes(1)
  })
})
