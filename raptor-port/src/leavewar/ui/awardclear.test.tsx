// A CLEAR OR A DELETE THAT TAKES AN OIL AWARD SAYS SO FIRST (owner, D260, 27 Sep 26 — "B").
//
//   "Delete: A — clears bids and leave, keeps awards; B — removes everything in the block, awards included, and the
//    confirm names each award first" → "B".
//
// Both removals were SILENT (the absence-record re-test, AB1 and AB2): the bid sheet's Clear on a day holding an award
// took it, and a dragged block's Delete took every award in it — the confirm "Delete 3 days for 4 people?" never said
// so, and the man's OIL dropped. The ruling keeps the removal and ends the silence: every door that clears a day names
// each award it will take, asks once, and one Undo brings them all back. Move and drag never take an award (it stays
// on the day he earned it). A MEMBER's Clear never takes an award (an award is the admin's), so it asks nothing.

import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { awardsIn, getState, initStore, lwHistInit, lwUndo, rawState, setCell, setManualCredit, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'
import { SelectSheet } from './SelectSheet'
import type { Selection } from './select'

beforeEach(() => {
  initStore(memoryBackend())
  lwHistInit()
  setRole('admin')
})

const awardOn = (person: string, date: string) =>
  ((rawState().wars.find(w => w.period.start <= date && date <= w.period.end)!.recs[person]?.[date] ?? []) as any[])
    .find(r => r.kind === 'credit' && r.oil === 'manual')
const cell = (personId: string, date: string) => ({ personId, date })
const noop = () => {}

describe('awardsIn — the awards a clear of these days would take', () => {
  it('names each hand-given award in the cells, with its worth', () => {
    setManualCredit('ramp', '2026-01-06', 'FO', { note: 'Recall', days: 3 })
    setManualCredit('dusk', '2026-01-07', 'HO', { note: 'SIM' })
    const got = awardsIn([cell('ramp', '2026-01-06'), cell('ramp', '2026-01-07'), cell('dusk', '2026-01-07')])
    expect(got.map(a => [a.personId, a.date, a.days])).toEqual([['ramp', '2026-01-06', 3], ['dusk', '2026-01-07', 0.5]])
  })

  it('is empty for a member — his Clear never takes an award (an award is the admin’s)', () => {
    setManualCredit('ramp', '2026-01-06', 'FO', {})
    setRole('member'); setViewer('ramp')
    expect(awardsIn([cell('ramp', '2026-01-06')])).toEqual([])
  })
})

describe('a dragged block’s Delete names the awards and takes them (D260)', () => {
  const block: Selection = {
    people: ['ramp', 'dusk'], from: '2026-01-06', to: '2026-01-08',
    cells: ['ramp', 'dusk'].flatMap(p => ['2026-01-06', '2026-01-07', '2026-01-08'].map(d => cell(p, d))),
  }
  const mount = (onDone = noop) => render(
    <SelectSheet sel={block} people={id => id.toUpperCase()} role="admin" canDecide onDone={onDone} onMove={noop} onClose={noop} />,
  )

  it('the confirm names each award BEFORE anything goes; the second tap takes them all', () => {
    setCell('ramp', '2026-01-08', 'LL')
    setManualCredit('ramp', '2026-01-06', 'FO', { days: 1 })
    setManualCredit('dusk', '2026-01-07', 'FO', { days: 3 })
    mount()
    fireEvent.click(screen.getByTestId('sel-delete'))
    const note = screen.getByTestId('sel-note').textContent!
    expect(note).toContain('including 2 OIL awards (RAMP 1 day, DUSK 3 days)')
    expect(awardOn('ramp', '2026-01-06')).toBeTruthy()          // nothing gone yet
    fireEvent.click(screen.getByTestId('sel-delete'))
    expect(awardOn('ramp', '2026-01-06')).toBeUndefined()
    expect(awardOn('dusk', '2026-01-07')).toBeUndefined()
    expect(getState().grid.ramp?.['2026-01-08']).toBeFalsy()
  })

  it('one Undo brings every award back', () => {
    setManualCredit('ramp', '2026-01-06', 'FO', { days: 1 })
    setManualCredit('dusk', '2026-01-07', 'HO', {})
    mount()
    fireEvent.click(screen.getByTestId('sel-delete'))
    fireEvent.click(screen.getByTestId('sel-delete'))
    expect(awardOn('ramp', '2026-01-06')).toBeUndefined()
    act(() => lwUndo())
    expect(awardOn('ramp', '2026-01-06')).toBeTruthy()
    expect(awardOn('dusk', '2026-01-07')).toBeTruthy()
  })

  it('a block holding ONLY awards still offers Delete — it removes everything in it', () => {
    /* Today the Delete row showed only when the block held a movable bid, so a block of awards had no Delete at all. */
    setManualCredit('dusk', '2026-01-07', 'FO', {})
    mount()
    expect(screen.getByTestId('sel-delete')).toBeTruthy()
    expect(screen.queryByTestId('sel-move')).toBeNull()        // an award never moves
    fireEvent.click(screen.getByTestId('sel-delete'))
    expect(screen.getByTestId('sel-note').textContent).toContain('including 1 OIL award (DUSK 1 day)')
  })

  it('a block with no award asks as before, with no award clause', () => {
    setCell('ramp', '2026-01-08', 'LL')
    mount()
    fireEvent.click(screen.getByTestId('sel-delete'))
    expect(screen.getByTestId('sel-note').textContent).not.toContain('OIL award')
  })
})

describe('the bid sheet’s Clear names the award and asks once (D260)', () => {
  it('one day: the first Clear names the award and keeps it; the second takes it', () => {
    setManualCredit('ramp', '2026-01-06', 'FO', { note: 'Recall', days: 3 })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-ramp-2026-01-06'))
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(screen.getByTestId('span-note').textContent).toMatch(/OIL award \(3 days\)/)
    expect(awardOn('ramp', '2026-01-06')).toBeTruthy()
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(awardOn('ramp', '2026-01-06')).toBeUndefined()
  })

  it('a range: Clear names every award in the span before it goes', () => {
    setManualCredit('ramp', '2026-01-06', 'FO', {})
    setManualCredit('ramp', '2026-01-08', 'HO', {})
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-ramp-2026-01-06'))
    fireEvent.click(screen.getByTestId('span-range'))
    // the range picker is seeded with the tapped day; a second day completes it
    fireEvent.click(screen.getByTestId('span-day-2026-01-08'))
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(screen.getByTestId('span-note').textContent).toContain('2 OIL awards')
    expect(awardOn('ramp', '2026-01-06')).toBeTruthy()
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(awardOn('ramp', '2026-01-06')).toBeUndefined()
    expect(awardOn('ramp', '2026-01-08')).toBeUndefined()
  })

  it('a day with no award clears at once, as before', () => {
    setCell('ramp', '2026-01-06', 'LL')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-ramp-2026-01-06'))
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(getState().grid.ramp?.['2026-01-06']).toBeFalsy()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })

  it('a MEMBER’s Clear on his own day asks nothing about an award and never takes it', () => {
    setManualCredit('ramp', '2026-01-06', 'FO', {})   // inside the bidding window: his tap opens the bid sheet
    act(() => { setRole('member'); setViewer('ramp') })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-ramp-2026-01-06'))
    fireEvent.click(screen.getByTestId('bid-clear'))
    expect(screen.getByTestId('span-note').textContent).not.toContain('OIL award')
    expect(awardOn('ramp', '2026-01-06')).toBeTruthy()
  })
})
