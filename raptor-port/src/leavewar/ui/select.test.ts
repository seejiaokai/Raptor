import { describe, expect, it } from 'vitest'
import { parseCellId, rectCells } from './select'

// The gesture controller (wireSelect) needs a real browser (elementFromPoint,
// pointer capture, layout) and is covered by e2e/leavewar.spec.ts. Here we pin
// the DOM-free geometry, which is where an off-by-one would silently select
// the wrong people or days.

describe('parseCellId', () => {
  it('splits a person id from the trailing YYYY-MM-DD date', () => {
    expect(parseCellId('cell-ramp-2026-01-06')).toEqual({ personId: 'ramp', date: '2026-01-06' })
  })
  it('handles a person id that itself contains a dash (date is the last 10 chars)', () => {
    expect(parseCellId('cell-j-lee-2026-12-31')).toEqual({ personId: 'j-lee', date: '2026-12-31' })
  })
  it('rejects anything that is not a cell testid', () => {
    expect(parseCellId('head-2026-01-06')).toBeNull()
    expect(parseCellId('bal-ramp')).toBeNull()
    expect(parseCellId(null)).toBeNull()
    expect(parseCellId('cell-')).toBeNull()
  })
})

describe('rectCells', () => {
  const order = ['ramp', 'dusk', 'asics', 'tata']
  const dates = ['2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09']

  it('a single cell selects just itself', () => {
    const s = rectCells(order, dates, { personId: 'dusk', date: '2026-01-07' }, { personId: 'dusk', date: '2026-01-07' })!
    expect(s.people).toEqual(['dusk'])
    expect(s.from).toBe('2026-01-07')
    expect(s.to).toBe('2026-01-07')
    expect(s.cells).toEqual([{ personId: 'dusk', date: '2026-01-07' }])
  })

  it('a row drag spans days for one person', () => {
    const s = rectCells(order, dates, { personId: 'ramp', date: '2026-01-06' }, { personId: 'ramp', date: '2026-01-08' })!
    expect(s.people).toEqual(['ramp'])
    expect(s.cells.map(c => c.date)).toEqual(['2026-01-06', '2026-01-07', '2026-01-08'])
  })

  it('a block spans people AND days, in the grid order, whichever way you drag', () => {
    const down = rectCells(order, dates, { personId: 'ramp', date: '2026-01-06' }, { personId: 'asics', date: '2026-01-08' })!
    const up = rectCells(order, dates, { personId: 'asics', date: '2026-01-08' }, { personId: 'ramp', date: '2026-01-06' })!
    expect(down).toEqual(up)                       // direction-independent
    expect(down.people).toEqual(['ramp', 'dusk', 'asics'])
    expect(down.from).toBe('2026-01-06')
    expect(down.to).toBe('2026-01-08')
    expect(down.cells).toHaveLength(3 * 3)
  })

  it('returns null on a stale endpoint (a hit-test that missed the grid)', () => {
    expect(rectCells(order, dates, { personId: 'ramp', date: '2026-01-06' }, { personId: 'ghost', date: '2026-01-06' })).toBeNull()
    expect(rectCells(order, dates, { personId: 'ramp', date: '1999-01-01' }, { personId: 'ramp', date: '2026-01-06' })).toBeNull()
  })
})
