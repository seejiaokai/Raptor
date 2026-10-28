// @vitest-environment jsdom
/* A LEAVE OF SEVERAL DAYS OPENS WHOLE IN ITS WINDOW (his D1448, D1461 — 28 Oct 26, version 2 on his M4 page; the build
   spec docs/superpowers/plans/2026-10-28-lw-whole-leave-build-spec.md). A tap on any day of a leave of several days opens
   the bid window on the whole leave: the title its dates, the grid marking its days in the selection's cyan (D1289), and at
   the right end of the Duration row, in place of "Pick a range", "All <n> days" (picked to start with) or the day tapped
   chooses what Approve, Refuse, Move and Delete act on. "The leave" is the entry the grid's joined bar draws and the
   Approvals list shows as one line (the store's run key, or one Input), within the period holding the day. Red first. */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, holds } from '../../engine/inputs'
import {
  getState, initStore, leaveRunAt, openDates, recordsAt, setBidStates, setCell, setCellRange, setDayAward, setPeople,
  setPostOut, setRole, setViewer, lwHistInit,
} from '../state/store'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { projectPeople } from '../state/raptorRoster'
import { wireLeaveWarSync } from '../sync'
import { _resetTimeline } from '../../undo/timeline'
import { installGlobalUndo } from '../../state/undo-wire'
import { globalUndo } from '../../undo'
import { setMemberTodayForTests, stateOf, type RequestRec } from '../engine'
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
const reqs = (d: string, p = P) => recordsAt(p, d).filter((r): r is RequestRec => r.kind === 'request')
const st = (d: string, p = P) => stateOf(getState().states, p, d)
const lwLeave = (p = P) => INPUTS.filter((r: any) => holds(r, p) && r.lw)
const fourBid = (code = 'LL') => expect(setCellRange(P, DAYS[0]!, DAYS[3]!, code).written).toBe(4)
const tap = (d = DAYS[1]!, p = P) => { render(<Matrix />); fireEvent.click(screen.getByTestId(cellId(d, p))) }
const allChip = () => within(sheet()).getByTestId('scope-all')
const dayChip = () => within(sheet()).getByTestId('scope-day')

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

describe('the leave a day belongs to — the joined bar\'s entry (leaveRunAt)', () => {
  it('finds a four-day pending bid from each of its days', () => {
    fourBid()
    for (const d of DAYS) {
      const run = leaveRunAt(P, d)
      expect(run, d).not.toBeNull()
      expect(run!.from).toBe(DAYS[0]); expect(run!.to).toBe(DAYS[3])
      expect(run!.dates).toEqual(DAYS)
      expect(run!.kind).toBe('request')
      expect(run!.recs).toHaveLength(4)
    }
  })
  it('a single day is no run', () => {
    setCell(P, DAYS[0]!, 'LL')
    expect(leaveRunAt(P, DAYS[0]!)).toBeNull()
    expect(leaveRunAt(P, DAYS[1]!)).toBeNull()
  })
  it('words that differ part-way make two leaves, as the bar and Approvals draw them', () => {
    expect(setCellRange(P, DAYS[0]!, DAYS[1]!, 'LL', { remarks: 'Wedding' }).written).toBe(2)
    expect(setCellRange(P, DAYS[2]!, DAYS[3]!, 'LL').written).toBe(2)
    expect(leaveRunAt(P, DAYS[0]!)!.dates).toEqual(DAYS.slice(0, 2))
    expect(leaveRunAt(P, DAYS[3]!)!.dates).toEqual(DAYS.slice(2))
  })
  it('a refused bid of several days is one leave too', () => {
    fourBid()
    setBidStates(DAYS.map(date => ({ personId: P, date })), 'refused')
    const run = leaveRunAt(P, DAYS[2]!)!
    expect(run.dates).toEqual(DAYS)
    expect(run.state).toBe('refused')
  })
  it('a morning run is its own leave beside an afternoon bid on one of its days', () => {
    expect(setCellRange(P, DAYS[0]!, DAYS[2]!, '*LL').written).toBe(3)
    expect(setCell(P, DAYS[1]!, 'OL*')).toBe(true)
    const run = leaveRunAt(P, DAYS[0]!)!
    expect(run.dates).toEqual(DAYS.slice(0, 3))
    expect(run.recs.every(r => reqs(r.date).find(q => q.id === r.id)?.code === '*LL')).toBe(true)
  })
  it('a leave the war approved over four days is one leave — one Input', () => {
    INPUTS.length = 0
    fileAbsence(P, 'LL', DAYS[0]!, DAYS[3]!, { lw: true })
    const run = leaveRunAt(P, DAYS[2]!)!
    expect(run.kind).toBe('absence')
    expect(run.dates).toEqual(DAYS)
    expect(run.state).toBe('approved')
  })
  it('leave filed on the Inputs page is not opened whole here (its own read-only window)', () => {
    INPUTS.length = 0
    fileAbsence(P, 'LL', DAYS[0]!, DAYS[3]!)
    expect(leaveRunAt(P, DAYS[1]!)).toBeNull()
  })
})

describe('the window opened on a leave of several days (D1461)', () => {
  it('opens on the whole leave: its dates in the title, "All 4 days" picked, the day tapped beside it, no "Pick a range"', () => {
    fourBid()
    tap(DAYS[1]!)
    expect(title()).toBe('9–12 Feb')
    expect(allChip().textContent).toBe('All 4 days')
    expect(allChip().getAttribute('aria-pressed')).toBe('true')
    expect(dayChip().textContent).toBe('Tue 10')
    expect(dayChip().getAttribute('aria-pressed')).toBe('false')
    expect(within(sheet()).queryByTestId('span-range')).toBeNull()
    /* on the Duration row, at its right end */
    expect(allChip().closest('.bidsheet-row')!.getAttribute('aria-label')).toBe('Duration')
  })
  it('picking the day names the day in the title; picking All again names the leave', () => {
    fourBid()
    tap(DAYS[1]!)
    fireEvent.click(dayChip())
    expect(title()).toBe('Tue 10 Feb')
    expect(dayChip().getAttribute('aria-pressed')).toBe('true')
    expect(allChip().getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(allChip())
    expect(title()).toBe('9–12 Feb')
  })
  it('a single-day leave\'s window is as built: "Pick a range", no choice of All', () => {
    setCell(P, DAYS[0]!, 'LL')
    tap(DAYS[0]!)
    expect(within(sheet()).getByTestId('span-range').textContent).toBe('Pick a range')
    expect(within(sheet()).queryByTestId('scope-all')).toBeNull()
    expect(title()).toBe('Mon 9 Feb')
  })
})

describe('what Approve, Refuse, Move and Delete act on', () => {
  it('Approve on All approves every day as one leave; ONE Undo puts all four back to pending', () => {
    fourBid()
    tap(DAYS[1]!)
    fireEvent.click(within(sheet()).getByTestId('decide-approve'))
    for (const d of DAYS) { expect(st(d), d).toBe('approved'); expect(reqs(d), d).toHaveLength(0) }
    expect(lwLeave()).toHaveLength(1)
    expect(screen.queryByTestId('bid-picker'), 'the window closes on it').toBeNull()
    act(() => { globalUndo() })
    for (const d of DAYS) { expect(reqs(d)[0]?.state, d).toBe('pending') }
  })
  it('Approve on the day approves that day alone', () => {
    fourBid()
    tap(DAYS[1]!)
    fireEvent.click(dayChip())
    fireEvent.click(within(sheet()).getByTestId('decide-approve'))
    expect(st(DAYS[1]!)).toBe('approved')
    for (const d of [DAYS[0]!, DAYS[2]!, DAYS[3]!]) expect(reqs(d)[0]?.state, d).toBe('pending')
  })
  it('Refuse on All refuses every day; the lit Refuse tapped again sends all four back to pending', () => {
    fourBid()
    tap(DAYS[2]!)
    fireEvent.click(within(sheet()).getByTestId('decide-refuse'))
    for (const d of DAYS) expect(reqs(d)[0]?.state, d).toBe('refused')
    fireEvent.click(screen.getByTestId(cellId(DAYS[0]!)))
    const rf = within(sheet()).getByTestId('decide-refuse')
    expect(rf.textContent).toBe('Refused')
    fireEvent.click(rf)
    for (const d of DAYS) expect(reqs(d)[0]?.state, d).toBe('pending')
  })
  it('a leave the war approved: "Approved" lit; tapped again on All, the whole leave goes back to pending', () => {
    INPUTS.length = 0
    fileAbsence(P, 'LL', DAYS[0]!, DAYS[3]!, { lw: true })
    tap(DAYS[2]!)
    expect(title()).toBe('9–12 Feb')
    const ap = within(sheet()).getByTestId('decide-approve')
    expect(ap.textContent).toBe('Approved')
    fireEvent.click(ap)
    for (const d of DAYS) expect(reqs(d)[0]?.state, d).toBe('pending')
    expect(lwLeave()).toHaveLength(0)
  })
  it('Delete on All takes a war-approved leave of four days', () => {
    INPUTS.length = 0
    fileAbsence(P, 'LL', DAYS[0]!, DAYS[3]!, { lw: true })
    tap(DAYS[0]!)
    fireEvent.click(within(sheet()).getByTestId('bid-clear'))
    expect(lwLeave()).toHaveLength(0)
    for (const d of DAYS) expect(getState().grid[P]?.[d] ?? '', d).toBe('')
  })
  it('Delete on All takes the leave\'s own days and leaves an OIL award and the other half\'s bid; one Undo brings them back', () => {
    expect(setCellRange(P, DAYS[0]!, DAYS[2]!, '*LL').written).toBe(3)
    expect(setCell(P, DAYS[1]!, 'OL*')).toBe(true)
    expect(setDayAward(P, DAYS[2]!, 0.5, { note: 'Exercise' })).toBeNull()
    tap(DAYS[0]!)
    expect(allChip().textContent).toBe('All 3 days')
    fireEvent.click(within(sheet()).getByTestId('bid-clear'))
    expect(screen.queryByTestId('bid-picker'), 'no award to name: the window closes on it').toBeNull()
    for (const d of DAYS.slice(0, 3)) expect(reqs(d).some(r => r.code === '*LL'), d).toBe(false)
    expect(reqs(DAYS[1]!).map(r => r.code)).toEqual(['OL*'])
    expect(getState().grid[P]?.[DAYS[2]!] ?? '', 'the award stays').toMatch(/HO/)
    act(() => { globalUndo() })
    for (const d of DAYS.slice(0, 3)) expect(reqs(d).some(r => r.code === '*LL'), d).toBe(true)
  })
  it('Move on All carries only the leave\'s own records', () => {
    expect(setCellRange(P, DAYS[0]!, DAYS[2]!, '*LL').written).toBe(3)
    expect(setCell(P, DAYS[1]!, 'OL*')).toBe(true)
    tap(DAYS[0]!)
    fireEvent.click(within(sheet()).getByTestId('decide-shift'))
    expect(screen.getByTestId('move-banner').textContent).toMatch(/move 3 entries/)
  })
  it('a leave button on All re-types every day of the leave (Auto-approve on: approved as it is placed)', () => {
    fourBid()
    tap(DAYS[3]!)
    fireEvent.click(within(sheet()).getByTestId('bid-OL'))
    for (const d of DAYS) { expect(getState().grid[P]?.[d], d).toBe('OL'); expect(st(d), d).toBe('approved') }
  })
  it('Auto-approve off: a leave button on All re-types every day, still pending', () => {
    fourBid()
    tap(DAYS[3]!)
    fireEvent.click(within(sheet()).getByTestId('bid-approve-tick'))
    fireEvent.click(within(sheet()).getByTestId('bid-OL'))
    for (const d of DAYS) expect(reqs(d)[0], d).toMatchObject({ code: 'OL', state: 'pending' })
  })
  it('Auto-approve off: the lit leave tapped again on All closes, nothing written, no "could not be written" (G6)', () => {
    fourBid()
    tap(DAYS[1]!)
    fireEvent.click(within(sheet()).getByTestId('bid-approve-tick'))
    const before = DAYS.map(d => reqs(d)[0]!.id)
    fireEvent.click(within(sheet()).getByTestId('bid-LL'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(DAYS.map(d => reqs(d)[0]!.id)).toEqual(before)
  })
  it('an Approve the rules refuse (a posting-out date inside the leave) writes nothing and says nothing was decided, and why', () => {
    fourBid()
    expect(setPostOut(P, DAYS[2]!, 'none')).toBe(true)
    tap(DAYS[0]!)
    fireEvent.click(within(sheet()).getByTestId('decide-approve'))
    for (const d of DAYS) expect(st(d), d).not.toBe('approved')
    const said = within(sheet()).getByTestId('shift-problem').textContent!
    expect(said).toMatch(/^Nothing was decided\. /)
    expect(said).toMatch(/posts? out/i)
  })
  it('words typed and not yet left that join the leave to a next-door bid: Approve on All approves the five days (G4)', () => {
    fourBid()
    expect(setCell(P, '2026-02-13', 'LL', { remarks: 'Wedding' })).toBe(true)
    tap(DAYS[1]!)
    expect(allChip().textContent).toBe('All 4 days')
    fireEvent.change(within(sheet()).getByTestId('bid-remarks'), { target: { value: 'Wedding' } })
    fireEvent.click(within(sheet()).getByTestId('decide-approve'))
    for (const d of [...DAYS, '2026-02-13']) expect(st(d), d).toBe('approved')
  })
  it('the two choices are named in full for a screen reader (G11)', () => {
    fourBid()
    tap(DAYS[1]!)
    expect(allChip().getAttribute('aria-label')).toBe('All 4 days, 9 to 12 Feb')
    expect(dayChip().getAttribute('aria-label')).toBe('Only Tue 10 Feb')
  })
  it('the words typed on All are the leave\'s own, saved across its days', () => {
    fourBid()
    tap(DAYS[1]!)
    const box = within(sheet()).getByTestId('bid-remarks')
    fireEvent.change(box, { target: { value: 'Family trip' } })
    fireEvent.blur(box)
    for (const d of DAYS) expect(reqs(d)[0]?.remarks, d).toBe('Family trip')
  })
})

describe('a member on his own bid of several days', () => {
  it('sees the choice and his Delete on All takes his four days', () => {
    setMemberTodayForTests('2026-01-02')
    openDates('2026-01-01', '2026-03-31')
    setRole('member'); setViewer('bane')
    expect(setCellRange('bane', DAYS[0]!, DAYS[3]!, 'LL').written).toBe(4)
    tap(DAYS[2]!, 'bane')
    expect(allChip().textContent).toBe('All 4 days')
    expect(within(sheet()).queryByTestId('decide-approve')).toBeNull()
    fireEvent.click(within(sheet()).getByTestId('bid-clear'))
    for (const d of DAYS) expect(reqs(d, 'bane'), d).toHaveLength(0)
  })
})

describe('the grid marks what the window acts on (D1289, D1461)', () => {
  const marked = () => DAYS.filter(d => screen.getByTestId(cellId(d)).classList.contains('selcell'))
  it('every day of the leave on All; the day tapped on the day; none once the window closes', () => {
    fourBid()
    tap(DAYS[1]!)
    expect(marked()).toEqual(DAYS)
    fireEvent.click(dayChip())
    expect(marked()).toEqual([DAYS[1]])
    fireEvent.click(within(sheet()).getByTestId('bid-cancel'))
    expect(marked()).toEqual([])
  })
  it('a single-day window marks its day', () => {
    tap(DAYS[0]!)
    expect(marked()).toEqual([DAYS[0]])
  })
  it('the mark stays while the rows re-render under the window — a remark saved, a class rebuilt (G2)', async () => {
    fourBid()
    tap(DAYS[1]!)
    const box = within(sheet()).getByTestId('bid-remarks')
    fireEvent.change(box, { target: { value: 'Trip' } })
    fireEvent.blur(box)
    expect(reqs(DAYS[0]!)[0]?.remarks).toBe('Trip')
    /* a row's class rebuilt by hand, as React rebuilds it */
    screen.getByTestId(cellId(DAYS[3]!)).className = ''
    await act(async () => { await Promise.resolve() })
    expect(marked()).toEqual(DAYS)
  })
})
