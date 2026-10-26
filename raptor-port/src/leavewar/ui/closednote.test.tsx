// A MEMBER'S TAP ON HIS OWN ROW, ON A DAY NOT OPEN FOR HIM (owner, D1176, D1225 — 21–22 Oct 26; the stages went, D1177).
//
// He bids only on an open day from his today (D1211). Anywhere else on his own row a tap says why and what to do
// instead — the closed note, word for word (D1176) — or, where his own pending bid stands, that he may delete it
// (D1225). Never a dead tap, never a bid window that then refuses. Every cell of his own row is drawn tappable; another
// man's row stays shut to him (owner, 27 Aug 26).
//
// Elsewhere: a member's own approved leave opens its remarks at any time — remarks.test.tsx; an admin's tap on approved
// leave opens the decide window, never a remarks-only sheet — deciding.test.tsx ("the one input window"); the clash
// note's approved-leave line on screen — clashwayout.test.tsx.

import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CURPAGE, setPage } from '../../state/view'
import { closeDates, getState, initStore, setBidState, setRole, setViewer } from '../state/store'
import { setMemberTodayForTests } from '../engine'
import { memoryBackend } from '../state/storage'
import type { SyncClash } from '../sync'
import { clashWhat } from './Chrome'
import { CLOSED_NOTE, PENDING_NOTE } from './ClosedNoteSheet'
import { Matrix } from './Matrix'
import { cellOpenable } from './MatrixRows'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})
afterEach(() => { setPage('editsched'); setMemberTodayForTests('2000-01-01') })

/** Every date of the seeded war closed, by the admin; then the member signed in as `who`. */
function closedFor(who: string) {
  act(() => { closeDates('2026-01-01', '2026-12-31') })
  act(() => { setRole('member'); setViewer(who) })
}

describe('the closed note (D1176)', () => {
  it('reads his words exactly, and offers the Inputs page', () => {
    closedFor('dusk')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.getByTestId('closed-note')).toBeTruthy()
    expect(screen.getByTestId('closed-note-text').textContent).toBe(
      'Bidding is closed. To change your leave, seek management’s approval, then file it on the Inputs page. Your approved leave updates here by itself.',
    )
    expect(CLOSED_NOTE).toBe(screen.getByTestId('closed-note-text').textContent)
    expect(screen.queryByTestId('pending-note')).toBeNull()
    expect(screen.queryByTestId('closed-delete')).toBeNull()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    const go = screen.getByTestId('closed-inputs')
    expect(go.textContent).toBe('Open the Inputs page')
    fireEvent.click(go)
    expect(CURPAGE).toBe('inputs')
    expect(screen.queryByTestId('closed-note')).toBeNull()
  })

  it('opens on a day closed while others are open, and on an open day before his today (D1211)', () => {
    act(() => { closeDates('2026-03-01', '2026-03-31') })
    act(() => { setRole('member'); setViewer('dusk') })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-03-11'))
    expect(screen.getByTestId('closed-note-text').textContent).toBe(CLOSED_NOTE)
    fireEvent.click(screen.getByTestId('closed-note-close'))
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))      // February still open: the bid window
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })

  /* the break tests' note A: the test above never moved his today (the suite pins it to 2000-01-01) */
  it('opens on an open day before his today, and the bid window from his today on (D1211)', () => {
    act(() => { setMemberTodayForTests('2026-02-15'); setRole('member'); setViewer('dusk') })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))      // open, but before his today
    expect(screen.getByTestId('closed-note-text').textContent).toBe(CLOSED_NOTE)
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    fireEvent.click(screen.getByTestId('closed-note-close'))
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-16'))      // open, from his today on
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })

  it('opens nothing on ANOTHER man’s row', () => {
    closedFor('dusk')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-ramp-2026-08-11'))
    expect(screen.queryByTestId('closed-note')).toBeNull()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })
})

/* HIS OWN PENDING BID ON A DAY SINCE CLOSED (D1225): "a member may delete his own pending bid on a Leave War day that
   has since closed for bidding; the day's note then reads that his bid is pending a decision and he may delete it". */
describe('his own pending bid on a closed day (D1225)', () => {
  // Seed: ASICS has a pending half day of LL on 23 Jan.
  const D = '2026-01-23'

  it('says it is pending, and Delete takes it away', () => {
    closedFor('asics')
    const bid = getState().states.asics[D]
    expect(bid?.state).toBe('pending')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-asics-${D}`))
    expect(screen.getByTestId('closed-note')).toBeTruthy()
    expect(screen.getByTestId('pending-note').textContent).toBe('Your bid is pending a decision. Delete it if you no longer want it.')
    expect(PENDING_NOTE).toBe(screen.getByTestId('pending-note').textContent)
    expect(screen.queryByTestId('closed-note-text')).toBeNull()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    fireEvent.click(screen.getByTestId('closed-delete'))
    expect(getState().grid.asics?.[D]).toBeUndefined()
    expect(getState().states.asics?.[D]).toBeUndefined()
    expect(screen.queryByTestId('closed-note')).toBeNull()
  })

  it('a refused bid is not his to delete there — the plain closed note', () => {
    act(() => { setBidState('asics', D, 'refused') })
    closedFor('asics')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-asics-${D}`))
    expect(screen.queryByTestId('pending-note')).toBeNull()
    expect(screen.queryByTestId('closed-delete')).toBeNull()
  })
})

/* EVERY CELL OF A PERSON'S OWN ROW IS TAPPABLE (D1177, D1176, D1225 — `cellOpenable`, the `period` argument gone):
   an open day his bid window, any other day the closed note. Another man's row stays shut to a member. */
describe('a member’s own row is tappable on every day; another man’s is not', () => {
  it('draws every cell of his own row tappable, open or closed, and none of an empty day on another’s', () => {
    act(() => { closeDates('2026-03-01', '2026-12-31') })     // January and February open, the rest closed
    act(() => { setRole('member'); setViewer('dusk') })
    render(<Matrix />)
    const own = [...document.querySelectorAll<HTMLElement>('td[data-testid^="cell-dusk-"]')]
    expect(own.length).toBeGreaterThan(300)
    expect(own.filter(td => !td.className.split(' ').includes('act')).map(td => td.dataset.testid)).toEqual([])
    for (const d of ['2026-02-11', '2026-08-11', '2026-11-03']) {
      expect(screen.getByTestId(`cell-ramp-${d}`).className.split(' ')).not.toContain('act')
    }
  })

  it('cellOpenable says the same, with no date in the question', () => {
    const { states, grid } = getState()
    expect(cellOpenable(states, 'member', 'dusk', false, grid, 'dusk', '2026-08-11')).toBe(true)
    expect(cellOpenable(states, 'member', 'dusk', false, grid, 'dusk', '2026-02-11')).toBe(true)
    expect(cellOpenable(states, 'member', 'dusk', false, grid, 'ramp', '2026-08-11')).toBe(false)
    expect(cellOpenable(states, 'admin', 'dusk', true, grid, 'ramp', '2026-08-11')).toBe(true)
  })
})

/* THE CLASH NOTE'S APPROVED-LEAVE LINE (D1177 narrowing D827; drawn r7-19): leave the war approved reads "…but the bid
   is approved OL", its way out "Change the approved leave" (on screen: clashwayout.test.tsx); "war-published" and "Step
   the war back to Bidding Closed" went with the stages. */
describe('the clash note’s sentence', () => {
  const clash = (wayOut: SyncClash['wayOut'], kind?: 'duty'): SyncClash => ({
    person: 'dusk', date: '2026-02-11', inputCode: 'SICK', bidCode: 'OL', wayOut, war: getState().period.id, ...(kind ? { kind } : {}),
  })
  it('names the leave as approved where the war approved it', () => {
    expect(clashWhat(clash('war'))).toBe('The input is SICK, but the bid is approved OL')
    expect(clashWhat(clash('war', 'duty'))).toBe('Weekend/PH work earns SICK, but the day holds approved OL')
  })
  it('a bid still waiting is just the bid', () => {
    expect(clashWhat(clash('bid'))).toBe('The input is SICK, but the bid is OL')
  })
})
