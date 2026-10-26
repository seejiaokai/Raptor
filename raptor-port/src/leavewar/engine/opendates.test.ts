// THE OPEN DATES (D1177, D1168, D1169, D1211; the red team's B2, A7b) — the pure rules every screen and write reads.
import { describe, expect, it } from 'vitest'
import {
  canDecide, canEditCell, canEditRow, firstOpenFrom, focusDateOf, isOpenOn, landingOf, monthSpan, monthState,
  normaliseOpen, openPartOf, periodMonths, stretchDays, stretchLabel, withClosed, withOpened, type OpenStretch,
} from '.'

const P = (open: OpenStretch[] = [], start = '2026-01-01', end = '2026-12-31', id = 'y') => ({ id, start, end, open })

describe('normaliseOpen — the one normal form', () => {
  it('sorts, joins overlapping and touching stretches, clips to the period, drops the backwards', () => {
    expect(normaliseOpen(P(), [
      { from: '2026-05-01', to: '2026-05-31' },
      { from: '2026-04-01', to: '2026-04-30' },   // touches May: one stretch (D1168's reading)
      { from: '2026-04-15', to: '2026-04-20' },   // inside
      { from: '2025-12-20', to: '2026-01-05' },   // clipped to the period's start
      { from: '2026-09-10', to: '2026-09-01' },   // backwards: dropped
      { from: 'nonsense', to: '2026-02-02' } as OpenStretch,
    ])).toEqual([{ from: '2026-01-01', to: '2026-01-05' }, { from: '2026-04-01', to: '2026-05-31' }])
  })
  it('keeps a one-day gap as two stretches', () => {
    expect(normaliseOpen(P(), [{ from: '2026-03-01', to: '2026-03-10' }, { from: '2026-03-12', to: '2026-03-20' }])).toHaveLength(2)
  })
})

describe('isOpenOn — EMPTY MEANS CLOSED (B2)', () => {
  it('a period with no open stretch is closed on every day', () => {
    expect(isOpenOn(P(), '2026-06-01')).toBe(false)
    expect(isOpenOn(null, '2026-06-01')).toBe(false)
  })
  it('both ends of a stretch are open, the day after is not', () => {
    const p = P([{ from: '2026-04-01', to: '2026-04-30' }])
    expect(isOpenOn(p, '2026-04-01')).toBe(true)
    expect(isOpenOn(p, '2026-04-30')).toBe(true)
    expect(isOpenOn(p, '2026-05-01')).toBe(false)
  })
})

describe('opening and closing', () => {
  it('opening joins, closing splits', () => {
    const p = P([{ from: '2026-03-01', to: '2026-03-31' }, { from: '2026-05-01', to: '2026-05-31' }])
    expect(withOpened(p, '2026-04-01', '2026-04-30')).toEqual([{ from: '2026-03-01', to: '2026-05-31' }])
    const one = P([{ from: '2026-03-01', to: '2026-05-31' }])
    expect(withClosed(one, '2026-04-01', '2026-04-30')).toEqual([{ from: '2026-03-01', to: '2026-03-31' }, { from: '2026-05-01', to: '2026-05-31' }])
    expect(withClosed(one, '2026-01-01', '2026-12-31')).toEqual([])
  })
  it('openPartOf names what a closing takes away', () => {
    const p = P([{ from: '2026-03-01', to: '2026-03-31' }])
    expect(openPartOf(p, '2026-02-01', '2026-04-30')).toEqual({ from: '2026-03-01', to: '2026-03-31' })
    expect(openPartOf(p, '2026-06-01', '2026-06-30')).toBeNull()
  })
  it('counts and labels a stretch', () => {
    expect(stretchDays({ from: '2026-01-01', to: '2026-03-31' })).toBe(90)
    expect(stretchLabel({ from: '2026-01-01', to: '2026-03-31' })).toBe('1 Jan – 31 Mar')
    expect(stretchLabel({ from: '2026-07-04', to: '2026-07-04' })).toBe('4 Jul')
  })
})

describe('the month buttons (D1168, D1169)', () => {
  it('lists the period’s months in calendar order, clipped, across a year end', () => {
    const ms = periodMonths(P([], '2026-04-15', '2027-03-31'))
    expect(ms.map(m => m.key)).toEqual(['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02', '2027-03'])
    expect(ms[0]).toEqual({ key: '2026-04', from: '2026-04-15', to: '2026-04-30' })
    expect(ms[10]!.to).toBe('2027-02-28')
  })
  it('a month is open, part open (lit with a dotted edge) or closed', () => {
    const ms = periodMonths(P())
    const p = P([{ from: '2026-03-10', to: '2026-04-30' }])
    expect(monthState(p, ms[2]!)).toBe('part')
    expect(monthState(p, ms[3]!)).toBe('open')
    expect(monthState(p, ms[4]!)).toBe('closed')
  })
  it('A7b: a drag takes every month from the first to the one under the finger, in calendar order', () => {
    const ms = periodMonths(P())
    // MAY (4) on a phone's first row to SEP (8) on the second — JUL and AUG are taken though the finger never crossed them
    expect(monthSpan(ms, 4, 8)).toEqual({ from: '2026-05-01', to: '2026-09-30' })
    // backwards: SEP back to MAR is MAR–SEP
    expect(monthSpan(ms, 8, 2)).toEqual({ from: '2026-03-01', to: '2026-09-30' })
  })
})

describe('who may write which day (B2, B3, D1211)', () => {
  const open = P([{ from: '2026-04-01', to: '2026-04-30' }])
  it('a member bids only on an open day, from today; an admin on any day', () => {
    expect(canEditCell(open, 'member', '2026-04-10', '2026-04-05')).toBe(true)
    expect(canEditCell(open, 'member', '2026-04-04', '2026-04-05')).toBe(false)   // before today (D1211)
    expect(canEditCell(open, 'member', '2026-05-10', '2026-04-05')).toBe(false)   // closed
    expect(canEditCell(open, 'admin', '2026-05-10', '2026-04-05')).toBe(true)
    expect(canEditCell(open, 'admin', '2026-04-01', '2026-04-05')).toBe(true)
  })
  it('a new period takes no member bid (B2)', () => {
    expect(canEditCell(P(), 'member', '2026-06-01', '2026-01-01')).toBe(false)
  })
  it('a day no period holds is never writable, not even by the admin (B3: the holding period is asked)', () => {
    expect(canEditCell(null, 'admin', '2030-01-01', '2026-01-01')).toBe(false)
  })
  it('the row rule and the decision rule', () => {
    expect(canEditRow('member', 'bane', 'bane')).toBe(true)
    expect(canEditRow('member', 'bane', 'stiff')).toBe(false)
    expect(canDecide('admin')).toBe(true)
    expect(canDecide('member')).toBe(false)
  })
})

describe('where the page opens (D1177: the first open date from today, else today)', () => {
  const y26 = P([{ from: '2026-01-01', to: '2026-03-31' }], '2026-01-01', '2026-12-31', 'y26')
  const y27 = P([{ from: '2027-02-01', to: '2027-02-28' }], '2027-01-01', '2027-12-31', 'y27')
  it('the first open date from today, in whichever period holds it', () => {
    expect(landingOf([y26, y27], '2026-02-15')).toEqual({ periodId: 'y26', date: '2026-02-15' })
    expect(landingOf([y26, y27], '2026-10-22')).toEqual({ periodId: 'y27', date: '2027-02-01' })
  })
  it('else today, in the period holding it', () => {
    expect(landingOf([y26, P([], '2027-01-01', '2027-12-31', 'y27')], '2026-10-22')).toEqual({ periodId: 'y26', date: '2026-10-22' })
  })
  it('a period switch lands on its own first open day from today, else today, else its first day', () => {
    expect(focusDateOf(y27, '2026-10-22')).toBe('2027-02-01')
    expect(focusDateOf(P([], '2026-01-01', '2026-12-31'), '2026-10-22')).toBe('2026-10-22')
    expect(focusDateOf(P([], '2027-01-01', '2027-12-31'), '2026-10-22')).toBe('2027-01-01')
    expect(firstOpenFrom(y26, '2026-04-01')).toBeNull()
  })
})
