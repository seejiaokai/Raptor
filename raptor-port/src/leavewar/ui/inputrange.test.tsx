// @vitest-environment jsdom
/* AN ENTRY OF SEVERAL DAYS FILED ON THE INPUTS PAGE OPENS WHOLE (his D1563, D1565 — design A of 2 Nov 26, drawn on the real app
   in docs/img/mock/2026-11-02-input-range/; [LW-INPUT-RANGE-WHOLE]). His picture: Quill's OML of 6–9 Jul, filed on the Inputs
   page, opened on the one day tapped ("Quill Mon 6 Jul", "Pick a range"), while Rune's LL placed on the war opened whole. A tap
   on any day of such an entry now opens it whole: its dates in the title, its days marked, and "All n days" (picked) or the day
   tapped in place of "Pick a range", choosing what Grant OIL, CSE, OD and the ⋯ act on; the date after Remarks follows. The
   entry itself stays the Inputs page's (D1548): no Approve, Move or Delete. A day that also holds a second entry opens the
   day's list (D1466's reading carried over). Written red first. */
import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { getState, heldRunAt, initStore, lwHistInit, setDayAward, setPeople, setRole, setViewer } from '../state/store'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { projectPeople } from '../state/raptorRoster'
import { wireLeaveWarSync } from '../sync'
import { _resetTimeline } from '../../undo/timeline'
import { installGlobalUndo } from '../../state/undo-wire'
import { setMemberTodayForTests } from '../engine'
import { memoryBackend } from '../state/storage'
import { fileAbsence } from '../testkit'
import { Matrix } from './Matrix'

const ISNAP = JSON.stringify(INPUTS)
const P = 'slipway'
/* Mon 9 – Thu 12 Feb 26, inside the seed's war (Jan – Mar 26) */
const DAYS = ['2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12']
const cellId = (d: string, p = P) => `cell-${p}-${d}`
const sheet = () => screen.getByTestId('bid-picker')
const title = () => sheet().querySelector('.bidsheet-hd .when')!.textContent
const tap = (d = DAYS[1]!) => { render(<Matrix />); fireEvent.click(screen.getByTestId(cellId(d))) }
const allChip = () => within(sheet()).getByTestId('scope-all')
const dayChip = () => within(sheet()).getByTestId('scope-day')
const awardsOn = (d: string) => (getState().views[P]?.[d]?.all ?? []).filter(c => c.kind === 'credit' && !c.auto)
const oml = (from = DAYS[0]!, to = DAYS[3]!) => fileAbsence(P, 'OML', from, to, { remarks: 'Medically down' })

beforeEach(() => {
  try { localStorage.clear() } catch { /* none */ }
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  initStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  setRole('admin')
})
afterEach(() => { _resetTimeline(); setSession(null); setMemberTodayForTests(null); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

describe('the days of one entry filed on the Inputs page (heldRunAt)', () => {
  it('finds a four-day medical from each of its days', () => {
    const row = oml()
    for (const d of DAYS) {
      const run = heldRunAt(P, d, String(row.iid))
      expect(run, d).not.toBeNull()
      expect(run!.dates).toEqual(DAYS)
      expect(run!.kind).toBe('held')
      expect(run!.recs, 'no records of the war’s own').toHaveLength(0)
    }
  })
  it('one day is no run, and a day the entry does not hold is none', () => {
    const row = oml(DAYS[0], DAYS[0])
    expect(heldRunAt(P, DAYS[0]!, String(row.iid))).toBeNull()
    expect(heldRunAt(P, DAYS[1]!, String(row.iid))).toBeNull()
  })
})

describe('a tap on any day of his OML of four days opens it whole (design A — D1565)', () => {
  it('the title names its dates, "All 4 days" picked and the day tapped beside it, in place of "Pick a range"', () => {
    oml()
    tap(DAYS[1])
    expect(title()).toBe('9–12 Feb')
    expect(allChip().textContent).toBe('All 4 days')
    expect(allChip().getAttribute('aria-pressed')).toBe('true')
    expect(dayChip().textContent).toBe('Tue 10')
    expect(within(sheet()).queryByTestId('span-range'), 'Pick a range gives way to the choice').toBeNull()
  })
  it('every day of the entry wears the selection’s mark; the day tapped alone once "Tue 10" is picked', () => {
    oml()
    tap(DAYS[1])
    for (const d of DAYS) expect(screen.getByTestId(cellId(d)).classList.contains('selcell'), d).toBe(true)
    fireEvent.click(dayChip())
    expect(title()).toBe('Tue 10 Feb')
    for (const d of DAYS) expect(screen.getByTestId(cellId(d)).classList.contains('selcell'), d).toBe(d === DAYS[1])
  })
  it('the date after Remarks follows the choice: till 12 Feb, then till 10 Feb', () => {
    oml()
    tap(DAYS[1])
    expect(within(sheet()).getByTestId('bid-tilldate').textContent).toContain('12 Feb')
    fireEvent.click(dayChip())
    expect(within(sheet()).getByTestId('bid-tilldate').textContent).toContain('10 Feb')
  })
  it('the medical stays the Inputs page’s: its line on top, and no Approve, Refuse, Move or Delete on either choice', () => {
    oml()
    tap(DAYS[2])
    expect(within(sheet()).getAllByTestId('bid-heldday')[0]!.textContent).toContain('OML')
    for (const pick of [allChip, dayChip]) {
      fireEvent.click(pick())
      for (const t of ['decide-approve', 'decide-refuse', 'bid-clear', 'decide-shift']) expect(within(sheet()).queryByTestId(t), t).toBeNull()
    }
  })
  it('the same from the first and the last day', () => {
    oml()
    tap(DAYS[3])
    expect(title()).toBe('9–12 Feb')
    expect(dayChip().textContent).toBe('Thu 12')
  })
})

describe('what "All 4 days" acts on', () => {
  it('Grant OIL gives one award on each of its four days, one reason for all; the medical stays', () => {
    oml()
    tap(DAYS[1])
    fireEvent.click(within(sheet()).getByTestId('bid-oil'))
    fireEvent.change(screen.getByTestId('oil-why'), { target: { value: 'Recalled' } })
    fireEvent.click(screen.getByTestId('oil-give'))
    for (const d of DAYS) {
      expect(awardsOn(d), d).toHaveLength(1)
      expect((getState().views[P]?.[d]?.all ?? []).some(c => c.kind === 'absence' && c.code === 'OML'), `${d} keeps the medical`).toBe(true)
    }
    expect(screen.queryByTestId('bid-picker'), 'the window closes on it').toBeNull()
  })
  it('on the day tapped Grant OIL gives one award on that day alone', () => {
    oml()
    tap(DAYS[1])
    fireEvent.click(dayChip())
    fireEvent.click(within(sheet()).getByTestId('bid-oil'))
    fireEvent.click(screen.getByTestId('oil-give'))
    for (const d of DAYS) expect(awardsOn(d), d).toHaveLength(d === DAYS[1] ? 1 : 0)
  })
  it('over an overseas duty of four days a leave pressed on "All" goes on every day; on the day tapped on that day', () => {
    fileAbsence(P, 'OD', DAYS[0]!, DAYS[3]!)
    tap(DAYS[1])
    expect(title()).toBe('9–12 Feb')
    /* he has no LVE left: the first press asks before going below zero, the same leave again goes ahead (the window's own ask) */
    fireEvent.click(within(sheet()).getByTestId('bid-LL'))
    expect(within(sheet()).getByTestId('span-note').textContent, 'the ask counts all four days').toContain('Tap the same leave again')
    fireEvent.click(within(sheet()).getByTestId('bid-LL'))
    const ll = (d: string) => (getState().views[P]?.[d]?.all ?? []).some(c => c.code === 'LL')
    for (const d of DAYS) expect(ll(d), d).toBe(true)
  })
  it('…and on the day tapped, only that day', () => {
    fileAbsence(P, 'OD', DAYS[0]!, DAYS[3]!)
    tap(DAYS[1])
    fireEvent.click(dayChip())
    fireEvent.click(within(sheet()).getByTestId('bid-LL'))
    fireEvent.click(within(sheet()).getByTestId('bid-LL'))
    const ll = (d: string) => (getState().views[P]?.[d]?.all ?? []).some(c => c.code === 'LL')
    for (const d of DAYS) expect(ll(d), d).toBe(d === DAYS[1])
  })
})

describe('where it does not open whole', () => {
  it('a one-day entry keeps the one-day window and Pick a range', () => {
    oml(DAYS[1], DAYS[1])
    tap(DAYS[1])
    expect(title()).toBe('Tue 10 Feb')
    expect(within(sheet()).getByTestId('span-range')).toBeTruthy()
    expect(within(sheet()).queryByTestId('scope-all')).toBeNull()
  })
  it('a day of it that also holds an OIL award opens the day’s list; its other days still open whole (D1466)', () => {
    oml()
    expect(setDayAward(P, DAYS[2]!, 1, { note: 'Recall' })).toBeNull()
    tap(DAYS[2])
    expect(screen.queryByTestId('bid-picker'), 'the day’s list, each entry with its own line').toBeNull()
    expect(screen.getByTestId('daylist-sheet')).toBeTruthy()
  })
  it('…and another day of it opens the whole entry, the award’s day among its days', () => {
    oml()
    expect(setDayAward(P, DAYS[2]!, 1, { note: 'Recall' })).toBeNull()
    tap(DAYS[0])
    expect(title()).toBe('9–12 Feb')
  })
})

describe('a member on his own row', () => {
  it('opens his own OML of four days whole too', () => {
    oml()
    setRole('member')
    setViewer(P)
    setMemberTodayForTests('2026-01-05')
    tap(DAYS[1])
    expect(title()).toBe('9–12 Feb')
    expect(allChip().textContent).toBe('All 4 days')
    expect(within(sheet()).queryByTestId('bid-oil'), 'Grant OIL is an admin’s').toBeNull()
  })
})
