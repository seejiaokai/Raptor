import { describe, it, expect } from 'vitest'
import {
  mondayOf, shiftWeek, weekLabel, weekWindow, dayIndexInWeek,
  isoToKey, keyToIso, TODAY_WEEK,
} from './weeknav'

describe('mondayOf', () => {
  it('a Monday maps to itself', () => {
    expect(mondayOf('13/07/2026')).toBe('13/07/2026')
  })
  it('the Sunday of that week maps back to its Monday', () => {
    expect(mondayOf('19/07/2026')).toBe('13/07/2026')
  })
  it('accepts an iso calendar date and finds its Monday', () => {
    expect(mondayOf('2026-07-15')).toBe('13/07/2026')  // a Wednesday
    expect(mondayOf('2026-07-13')).toBe('13/07/2026')
  })
})

describe('shiftWeek (continuous, unbounded)', () => {
  it('steps a whole week forward and back', () => {
    expect(shiftWeek('13/07/2026', 1)).toBe('20/07/2026')
    expect(shiftWeek('13/07/2026', -1)).toBe('06/07/2026')
  })
  it('crosses a month boundary', () => {
    expect(shiftWeek('29/06/2026', -1)).toBe('22/06/2026')
    expect(shiftWeek('27/07/2026', 1)).toBe('03/08/2026')
  })
  it('crosses a year boundary', () => {
    expect(shiftWeek('28/12/2026', 1)).toBe('04/01/2027')
    expect(shiftWeek('04/01/2027', -1)).toBe('28/12/2026')
  })
})

describe('weekLabel', () => {
  it('renders Mon DD with a zero-padded day', () => {
    expect(weekLabel('06/07/2026')).toBe('Jul 06')
    expect(weekLabel('29/06/2026')).toBe('Jun 29')
    expect(weekLabel('13/07/2026')).toBe('Jul 13')
  })
})

describe('weekWindow', () => {
  it('is prev, current, +1, +2 with the current week selected', () => {
    const w = weekWindow('13/07/2026')
    expect(w.map(b => b.v)).toEqual(['06/07/2026', '13/07/2026', '20/07/2026', '27/07/2026'])
    expect(w.map(b => b.sel)).toEqual([false, true, false, false])
  })
  it('marks the week the notional today falls in', () => {
    // From the seed week, the current button IS the today week.
    const w = weekWindow('13/07/2026')
    expect(w.find(b => b.today)!.v).toBe(TODAY_WEEK)
    // Navigated two weeks ahead, the today week is behind the window — none marked.
    const ahead = weekWindow('27/07/2026')
    expect(ahead.some(b => b.today)).toBe(false)
  })
  it('re-centres on whatever week is loaded', () => {
    expect(weekWindow('20/07/2026').map(b => b.v))
      .toEqual(['13/07/2026', '20/07/2026', '27/07/2026', '03/08/2026'])
  })
})

describe('dayIndexInWeek', () => {
  it('is 0 for Monday and 6 for Sunday of the given week', () => {
    expect(dayIndexInWeek('13/07/2026', '2026-07-13')).toBe(0)
    expect(dayIndexInWeek('13/07/2026', '2026-07-19')).toBe(6)
    expect(dayIndexInWeek('13/07/2026', '2026-07-16')).toBe(3)
  })
})

describe('format converters', () => {
  it('round-trip iso <-> key', () => {
    expect(isoToKey('2026-07-13')).toBe('13/07/2026')
    expect(keyToIso('13/07/2026')).toBe('2026-07-13')
  })
})
