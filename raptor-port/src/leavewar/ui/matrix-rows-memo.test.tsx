/* THE ROWS' MEMO BOUNDARY, PINNED (`[LW-ROWS-SPLIT]`, 13 Oct 26 — the Opus read of the move, F4). Astra's tidiness read
   asked that the split's test "assert that opening an unrelated sheet does not repaint PersonRow". Nothing did: no test
   in the repository counted a row's renders, so a `memo` lost from `PersonRow` or `PersonMonth` — in a move, a merge or
   a later edit — would have cost every tap a whole grid of work and failed nothing.

   Counted from OUTSIDE the two components, so the recorded markup of matrix-rows.test.tsx is untouched:
   - a month's day cells: `lastDayIn` (../engine) — since the move, `PersonMonth` is its only caller in the app;
   - a row: the `FigureCell` whose test id begins `bal-` — the row's own balance box, handed a fresh click handler each
     time `PersonRow` runs, so it is rendered again exactly when the row is. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const count = vi.hoisted(() => ({ month: 0, row: 0 }))
vi.mock('../engine', async orig => {
  const real: any = await orig()
  return { ...real, lastDayIn: (...a: any[]) => { count.month++; return real.lastDayIn(...a) } }
})
vi.mock('./FigureCell', async orig => {
  const real: any = await orig()
  const { createElement } = await import('react')
  /* (a plain component around the real one: it runs whenever the row that draws it runs) */
  return { ...real, FigureCell: (p: any) => { if (String(p.testid || '').startsWith('bal-')) count.row++; return createElement(real.FigureCell, p) } }
})

import { initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { Matrix } from './Matrix'

beforeEach(() => { initStore(memoryBackend()); elevenCounters(); act(() => { setRole('admin') }) })

describe('[LW-ROWS-SPLIT] opening an unrelated sheet repaints no row and no month of the grid', () => {
  it('the premise: drawing the grid runs both counters', () => {
    count.month = 0; count.row = 0
    render(<Matrix />)
    expect(count.row, 'a row a person was drawn').toBeGreaterThan(10)
    expect(count.month, 'and its months').toBeGreaterThan(100)
  })

  it('a tap that opens one person’s sheet draws no row again, and no month', () => {
    render(<Matrix />)
    count.month = 0; count.row = 0
    fireEvent.click(screen.getByTestId('person-ramp'))
    expect(count.row, 'PersonRow is memoised: no row ran again').toBe(0)
    expect(count.month, 'PersonMonth is memoised: no month ran again').toBe(0)
  })
})
