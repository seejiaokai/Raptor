import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { focusDay, getState, initStore } from './state/store'
import { memoryBackend } from './state/storage'
import { defaultFocusDate } from './engine'
import { LeaveWarPage } from './LeaveWarPage'

// jsdom computes no layout, so the actual scroll is a no-op here — what this
// pins is the SEAM: the page asks the grid to land on the current war's
// bidding start the first time it comes on screen, and only the first time.
// The scroll itself is proved in the browser gate (e2e/leavewar.spec.ts).
beforeEach(() => { initStore(memoryBackend()) })

describe('the Leave War tab lands on its default view (7 Sep 26)', () => {
  it('snaps to the start of the current war\'s bidding window on first open', () => {
    const want = defaultFocusDate(getState().period) // seed: 2026-01-01
    render(<LeaveWarPage active={true} />)
    expect(getState().focusDate).toBe(want)
  })

  it('does not re-land on a later return — the reader keeps where they were', () => {
    const { rerender } = render(<LeaveWarPage active={true} />)
    // The reader scrolls elsewhere (a focus a jump would leave behind).
    act(() => focusDay('2026-06-15'))
    // Leave the tab and come back.
    act(() => rerender(<LeaveWarPage active={false} />))
    act(() => rerender(<LeaveWarPage active={true} />))
    // Still where the reader left it — not snapped back to the bidding start.
    expect(getState().focusDate).toBe('2026-06-15')
  })
})
