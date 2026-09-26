// ONE CHIP, ONE MOVE (owner, D262, 27 Sep 26).
//
//   "i want to be able to click on a single chip on the leave war and the move button should be enabled for me to
//    click to move the chip. The calendar can be removed. Take note with the move enabled when i drag to the edges of
//    the leave war it should auto scroll, or i still have the option to click on other months and the move function
//    will still be enabled. unless i click on an empty area outside the leave war grids to cancel that function."
//
// The one-day sheet's Move was greyed until a date was typed into a date box beside it, then moved there. Now Move is
// always pressable and PICKS THE CHIP UP: the sheet closes and the grid's own move mode (the drag-selection's "Move…")
// carries it — the chip lands on the day clicked (a phone stages it for Confirm), by the landing rules as they were.
// While moving, the month buttons keep the move on, and a click on an empty spot outside the grid ends it. The edge
// scroll lives in the move machine itself (select.ts wireMove) and is pinned in movewire.test.ts.

import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { advanceStage, getState, initStore, lwHistInit, lwUndo, setCell, setRole } from '../state/store'
import { setLwOnScreen } from '../state/screen'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

// Seed: ASICS has a pending half day of LL on 23 Jan, and LL on 8 Jan.
const PENDING = 'cell-asics-2026-01-23'

beforeEach(() => {
  initStore(memoryBackend())
  lwHistInit()
  setRole('admin')
  setLwOnScreen(true)
})

/** Tap the chip, press its sheet's Move — the chip is now picked up. */
const pickUp = () => {
  fireEvent.click(screen.getByTestId(PENDING))
  fireEvent.click(screen.getByTestId('decide-shift'))
  // the precondition every "it ends" test needs — without it, "the banner is gone" passes before Move exists
  expect(screen.getByTestId('move-banner')).toBeTruthy()
}
/** A deliberate click on a day, past the double-click guard that opens every move. */
const land = async (testid: string) => {
  await act(async () => { await new Promise(r => setTimeout(r, 420)) })
  fireEvent.click(screen.getByTestId(testid))
}

describe('the one-day sheet’s Move (D262)', () => {
  it('has no date box, and Move is never greyed out', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.queryByTestId('shift-date')).toBeNull()
    expect(screen.getByTestId('decide-shift').hasAttribute('disabled')).toBe(false)
  })

  it('picks the chip up: the sheet closes and the move banner says one entry', () => {
    render(<Matrix />)
    pickUp()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(screen.getByTestId('move-banner').textContent).toContain('1 entry')
  })

  it('a click on another day lands it there, undecided — the old date empty', async () => {
    render(<Matrix />)
    pickUp()
    await land('cell-asics-2026-01-30')
    expect(getState().grid.asics['2026-01-23']).toBeFalsy()
    expect(getState().grid.asics['2026-01-30']).toBe('*LL')
    expect(getState().states.asics['2026-01-30']?.state ?? 'pending').toBe('pending')
    expect(screen.queryByTestId('move-banner')).toBeNull()
  })

  it('once bidding has closed it lands with the dotted "moved" trail', async () => {
    advanceStage()
    render(<Matrix />)
    pickUp()
    await land('cell-asics-2026-01-30')
    expect(getState().states.asics['2026-01-30']).toEqual({ state: 'pending', source: 'bid', shiftedFrom: '2026-01-23' })
    expect(screen.getByTestId('cell-asics-2026-01-30').querySelector('.c')!.className).toContain('moved')
  })

  it('a day that cannot take it is refused with its reason, and the move stays on', async () => {
    render(<Matrix />)
    pickUp()
    await land('cell-asics-2026-01-08')          // ASICS already has LL there
    expect(screen.getByTestId('move-banner').textContent).toContain('already booked')
    expect(getState().grid.asics['2026-01-23']).toBe('*LL')
    await land('cell-asics-2026-01-30')          // …and the next day lands
    expect(getState().grid.asics['2026-01-30']).toBe('*LL')
  })

  it('its own day says so and keeps the move on — never "Nothing to move"', async () => {
    render(<Matrix />)
    pickUp()
    await land(PENDING)
    const said = screen.getByTestId('move-banner').textContent!
    expect(said).toContain('already on that day')
    expect(said).not.toContain('Nothing to move')
  })

  it('a quick second click on the same spot (a double-click on Move) lands nothing', () => {
    /* Fable's scenario S1: the sheet closes on the first click, and a double-click's second click then fell on
       whatever day sat under the Move button — landing the chip where nobody chose. */
    render(<Matrix />)
    pickUp()
    fireEvent.click(screen.getByTestId('cell-asics-2026-01-30'))
    expect(getState().grid.asics['2026-01-23']).toBe('*LL')
    expect(screen.getByTestId('move-banner')).toBeTruthy()
  })
})

describe('while the chip is picked up (D262)', () => {
  it('the month buttons work and the move stays on', async () => {
    render(<Matrix />)
    pickUp()
    fireEvent.click(screen.getByTestId('month-MAR'))
    expect(screen.getByTestId('move-banner')).toBeTruthy()
    await land('cell-asics-2026-03-12')
    expect(getState().grid.asics['2026-03-12']).toBe('*LL')
  })

  it('a click on an empty area OUTSIDE the grid cancels it', async () => {
    const { container } = render(<Matrix />)
    pickUp()
    await act(async () => { await new Promise(r => setTimeout(r, 420)) })
    const stage = container.querySelector('.stage') as HTMLElement   // the page around the grid's card
    fireEvent.click(stage)
    expect(screen.queryByTestId('move-banner')).toBeNull()
    expect(getState().grid.asics['2026-01-23']).toBe('*LL')
  })

  it('a click on a control outside the grid does NOT cancel it, and neither does one on the grid’s own frame', async () => {
    const { container } = render(<><button data-testid="elsewhere">x</button><Matrix /></>)
    pickUp()
    await act(async () => { await new Promise(r => setTimeout(r, 420)) })
    fireEvent.click(screen.getByTestId('elsewhere'))
    expect(screen.getByTestId('move-banner')).toBeTruthy()
    fireEvent.click(container.querySelector('.card') as HTMLElement)
    expect(screen.getByTestId('move-banner')).toBeTruthy()
  })

  it('Undo ends it (the existing guard)', () => {
    setCell('ramp', '2026-01-20', 'LL')
    render(<Matrix />)
    pickUp()
    act(() => lwUndo())
    expect(screen.queryByTestId('move-banner')).toBeNull()
  })

  it('a stage change ends it (the existing guard)', () => {
    render(<Matrix />)
    pickUp()
    act(() => advanceStage())
    expect(screen.queryByTestId('move-banner')).toBeNull()
  })

  it('leaving the Leave War ends it — the chip is not carried onto another page', () => {
    render(<Matrix />)
    pickUp()
    act(() => setLwOnScreen(false))
    expect(screen.queryByTestId('move-banner')).toBeNull()
  })
})
