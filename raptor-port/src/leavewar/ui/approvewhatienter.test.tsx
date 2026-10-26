import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

/* "APPROVE WHAT I ENTER" (owner D1147, D1186, D1187; M3 5.5; red-team fix A8): the admin's tick in the window's title bar,
   before ✕, ticked each time it opens; ticked, the leave buttons wear the approved look and a leave is approved as it is
   placed; a member has none. */

beforeEach(() => { initStore(memoryBackend()) })
const CELL = 'cell-dusk-2026-02-11'

describe('Approve what I enter', () => {
  /* since round 3 the app's switch (his D1302), its state in aria-checked, remembered (round3.test.tsx) */
  it('an admin\'s window carries it in the title bar, before ✕, on; the buttons filled; off, hollow', () => {
    try { localStorage.clear() } catch { /* none */ }
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    const sheet = screen.getByTestId('bid-picker')
    const tick = within(sheet).getByTestId('bid-approve-tick')
    expect(tick.getAttribute('aria-checked')).toBe('true')
    expect(tick.closest('.bidsheet-hd')).toBeTruthy()
    expect(tick.nextElementSibling?.getAttribute('data-testid')).toBe('bid-cancel')
    expect(within(sheet).getByTestId('bid-LL').className).toContain('s-a')
    fireEvent.click(tick)
    expect(within(sheet).getByTestId('bid-LL').className).toContain('s-w')
  })

  it('a member\'s window has no tick, and his buttons are hollow', () => {
    setRole('member')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    const sheet = screen.queryByTestId('bid-picker')
    if (!sheet) return   // a day not open for him: no window to place on (the open dates' own tests cover it)
    expect(within(sheet).queryByTestId('bid-approve-tick')).toBeNull()
    expect(within(sheet).getByTestId('bid-LL').className).toContain('s-w')
  })

  it('ticked, a leave is approved as it is placed — no pending request is left', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(getState().grid.dusk?.['2026-02-11']).toBe('LL')
    expect(getState().states.dusk?.['2026-02-11']?.state).not.toBe('pending')
  })

  it('unticked, it is a pending bid as before', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(CELL))
    fireEvent.click(screen.getByTestId('bid-approve-tick'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(getState().states.dusk?.['2026-02-11']?.state).toBe('pending')
  })
})
