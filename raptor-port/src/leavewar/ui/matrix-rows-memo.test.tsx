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

import { initStore, lwUndo, recordsAt, setBidStates, setCell, setRequestWords, setRole } from '../state/store'
/* a pending bid's own id on a day (ramp's) */
const recId = (d: string) => recordsAt('ramp', d).find(r => r.kind === 'request')!.id
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { Matrix } from './Matrix'
import { closeDayPanel } from './DayPanel'

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
    /* (no month ran either — but that is the ROW's memo at work: a month is reached only through its row. The month's
       own memo is not pinned by any test — `OUTSTANDING.md` `[LW-MONTH-MEMO-UNPINNED]`) */
    expect(count.month, 'no month ran again').toBe(0)
  })

  /* THE DAY PANEL (M3 batch 6 — performance.md §E): its open day is its own, never a field the rows read */
  it('opening the day panel from a date heading, and stepping it, draws no row again and no month', () => {
    render(<Matrix />)
    count.month = 0; count.row = 0
    fireEvent.click(screen.getByTestId('head-2026-02-11'))
    expect(screen.getByTestId('win-lwday')).toBeTruthy()
    fireEvent.click(screen.getByTestId('lwday-next'))
    expect(count.row, 'no row ran again').toBe(0)
    expect(count.month, 'no month ran again').toBe(0)
    act(() => { closeDayPanel() })
  })
})

/* [LW-MONTH-MEMO-UNPINNED] (M3 §4): one cell written redraws only the month that holds it — not every month of every
   drawn row (5,840 month-draws for 16 rows when this was filed). A month's memo lost fails this. */
describe('[LW-MONTH-MEMO-UNPINNED] one bid redraws only its own month', () => {
  it('a bid written on one day draws again no month but its own row’s', () => {
    render(<Matrix />)
    count.month = 0; count.row = 0
    act(() => { setCell('ramp', '2026-02-11', 'LL') })
    /* the counter counts DAY cells drawn (lastDayIn runs once a cell): February's 28 alone — it was 5,840, every day of
       every drawn row */
    expect(count.month, 'only the month holding the bid drew again').toBe(28)
  })
})

/* [LW-MONTH-MEMO-UNPINNED], 30 Oct 26 — THE GUARD'S SECOND HALF: every month whose cells READ what changed draws again. The
   guard above (M3 §4) compared a man's code, state and view on the month's OWN days; his D1359's joined bar (25 Oct 26) made
   a cell read its neighbours' views two days either side — across a month's edge — and each bid's run key (remarks, till
   tick, documents) from the store, none of which it compared. Found in the running app (the scenario list's S4-1, S4-2): a
   leave on 1–3 Feb, then 31 Jan approved beside it, left 1 Feb drawn as the bar's start (its code, its rounded edge) until
   something else redrew February; one remark typed over two bids left them two boxes while Approvals read one leave. */
describe('[LW-MONTH-MEMO-UNPINNED] a month whose cells read the change draws again', () => {
  const joins = (iso: string) => {
    const c = screen.getByTestId(`cell-ramp-${iso}`).querySelector('.c')
    return c ? `${/\bjl\b/.test(c.className) ? 'jl' : ''}${/\bjr\b/.test(c.className) ? 'jr' : ''}` || '-' : 'empty'
  }
  const approve = (dates: string[]) => { expect(setBidStates(dates.map(date => ({ personId: 'ramp', date })), 'approved').decided).toBeGreaterThan(0) }

  it('the premise: January and February are both drawn', () => {
    render(<Matrix />)
    expect(screen.getByTestId('cell-ramp-2026-01-31')).toBeTruthy()
    expect(screen.getByTestId('cell-ramp-2026-02-01')).toBeTruthy()
  })

  it('S4-1: a leave of 1–3 Feb, then 31 Jan approved beside it — 1 Feb joins to its left (February drawn again)', () => {
    render(<Matrix />)
    act(() => { for (const d of ['2026-02-01', '2026-02-02', '2026-02-03']) setCell('ramp', d, 'LL'); approve(['2026-02-01', '2026-02-02', '2026-02-03']) })
    expect([joins('2026-02-01'), joins('2026-02-02'), joins('2026-02-03')], 'the premise: one bar').toEqual(['jr', 'jljr', 'jl'])
    act(() => { setCell('ramp', '2026-01-31', 'LL'); approve(['2026-01-31']) })
    expect(joins('2026-01-31'), '31 Jan joins to its right').toBe('jr')
    expect(joins('2026-02-01'), '1 Feb is no longer the bar’s start').toBe('jljr')
  })

  it('S4-1, Undo: 31 Jan taken back — 1 Feb is the bar’s start again', () => {
    render(<Matrix />)
    act(() => { for (const d of ['2026-02-01', '2026-02-02']) setCell('ramp', d, 'LL') })
    expect(joins('2026-02-01')).toBe('jr')
    act(() => { setCell('ramp', '2026-01-31', 'LL') })
    expect(joins('2026-02-01'), 'three pending bids of one key: one bar').toBe('jljr')
    act(() => { lwUndo() })
    expect(joins('2026-01-31')).toBe('empty')
    expect(joins('2026-02-01'), 'back to the start').toBe('jr')
  })

  it('S4-2: one remark typed over two bids with different words — they join (nothing the grid, state or view holds changed)', () => {
    render(<Matrix />)
    act(() => {
      /* placed one by one, each given its own words (a remark changes the whole run it joins — setRequestWords) */
      for (const [d, w] of [['2026-02-10', 'first'], ['2026-02-11', 'second']] as const) { setCell('ramp', d, 'LL'); setRequestWords('ramp', d, recId(d), { remarks: w }) }
    })
    expect([joins('2026-02-10'), joins('2026-02-11')], 'two words: two boxes').toEqual(['-', '-'])
    act(() => { for (const d of ['2026-02-10', '2026-02-11']) setRequestWords('ramp', d, recId(d), { remarks: 'one leave' }) })
    expect([joins('2026-02-10'), joins('2026-02-11')], 'one word: one bar').toEqual(['jr', 'jl'])
  })

  it('…and still skips: a bid mid-month draws only its own month; one on the 1st draws the month before too (its edge days)', () => {
    render(<Matrix />)
    count.month = 0
    act(() => { setCell('ramp', '2026-02-11', 'LL') })
    expect(count.month, 'February alone').toBe(28)
    count.month = 0
    act(() => { setCell('ramp', '2026-02-01', 'LL') })
    expect(count.month, 'February, and January, whose last days read 1 Feb').toBe(28 + 31)
  })
})
