/* D1266 (owner, 23 Oct 26 — "today moves at midnight with the page left open"): the day clock tells the store when the day
   turns, at the timer just past midnight and whenever the page is shown again; the landing mark moves to today's landing
   only while it still stands where the page landed for the old day, softly; a mark he moved stays; and everything that
   reads today draws again. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getState, initStore, openDates, focusDay, setRole, setViewer, subscribe } from '../state/store'
import { memoryBackend } from '../state/storage'
import { focusDateOf, setMemberTodayForTests } from '../engine'
import { installDayClock, msToMidnight } from './dayclock'

describe('the Leave War day clock (D1266)', () => {
  let stop: (() => void) | null = null
  beforeEach(() => {
    initStore(memoryBackend())
    setRole('admin'); setViewer(null)
    expect(['set', 'unchanged']).toContain(openDates('2026-02-01', '2026-03-31'))   // the demo year may hold them already
    setRole('member'); setViewer('ramp')
  })
  afterEach(() => { if (stop) stop(); stop = null; vi.useRealTimers(); setMemberTodayForTests('2000-01-01') })

  it('the timer is set for just after the next local midnight', () => {
    expect(msToMidnight(new Date(2026, 9, 22, 23, 56, 0))).toBe(4 * 60 * 1000 + 1000)
    expect(msToMidnight(new Date(2026, 9, 23, 0, 0, 0))).toBe(24 * 3600 * 1000 + 1000)
  })

  it('the page shown again on a new day: the landing mark moves to today softly, and the grid draws again', () => {
    setMemberTodayForTests('2026-02-14')
    focusDay(focusDateOf(getState().period, '2026-02-14'))
    expect(getState().focusDate).toBe('2026-02-14')
    stop = installDayClock()
    let draws = 0
    const un = subscribe(() => { draws++ })
    setMemberTodayForTests('2026-02-15')
    document.dispatchEvent(new Event('visibilitychange'))
    un()
    expect(getState().focusDate).toBe('2026-02-15')
    expect(getState().focusSoft).toBe(true)
    expect(draws).toBeGreaterThan(0)
  })

  it('a mark he moved himself stays where he put it; the grid still draws again', () => {
    setMemberTodayForTests('2026-02-14')
    focusDay('2026-03-10')
    stop = installDayClock()
    let draws = 0
    const un = subscribe(() => { draws++ })
    setMemberTodayForTests('2026-02-15')
    window.dispatchEvent(new Event('focus'))
    un()
    expect(getState().focusDate).toBe('2026-03-10')
    expect(draws).toBe(1)
  })

  it('the same day: nothing happens', () => {
    setMemberTodayForTests('2026-02-14')
    focusDay('2026-02-14')
    stop = installDayClock()
    let draws = 0
    const un = subscribe(() => { draws++ })
    window.dispatchEvent(new Event('pageshow'))
    un()
    expect(draws).toBe(0)
  })

  it('the timer at midnight turns the day with no press at all', () => {
    setMemberTodayForTests(null)
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 1, 14, 23, 59, 0))
    focusDay(focusDateOf(getState().period, '2026-02-14'))
    stop = installDayClock()
    vi.advanceTimersByTime(2 * 60 * 1000)
    expect(getState().focusDate).toBe('2026-02-15')
  })
})
