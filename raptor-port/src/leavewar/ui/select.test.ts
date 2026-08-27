import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { parseCellId, rectCells, wireSelect } from './select'

// The gesture controller (wireSelect) needs a real browser (elementFromPoint,
// pointer capture, layout) and is covered by e2e/leavewar.spec.ts. Here we pin
// the DOM-free geometry, which is where an off-by-one would silently select
// the wrong people or days — and the touch scroll-lock below, which jsdom can
// drive without layout because it turns only on the `armed` flag.

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

// The phone regression (owner, 27 Aug 26 — "when I hold then drag … I can't
// select a date range, I'm stuck with just adding 1 input"). On touch the
// browser latches scroll-intent at touchstart, so once the drag moves it
// scrolls the grid and fires pointercancel, killing the armed selection. The
// only cure is a NON-PASSIVE touchmove that preventDefaults — but ONLY once
// the long-press has armed, so a quick drag still scrolls (that scroll is
// sacred). This has no e2e coverage (Playwright cannot drive a touch drag —
// see the desktopOnly guard in leavewar.spec.ts), which is how it broke
// silently; this pins the exact on/off condition.
describe('wireSelect touch scroll-lock', () => {
  let wrap: HTMLElement, cell: HTMLElement, teardown: () => void
  const origEFP = document.elementFromPoint
  beforeEach(() => {
    vi.useFakeTimers()
    // jsdom has no layout, so the gesture's hit-test finds nothing; a null
    // focus just paints no rectangle, which is all this test needs.
    document.elementFromPoint = () => null
    wrap = document.createElement('div')
    cell = document.createElement('div')
    cell.setAttribute('data-testid', 'cell-ramp-2026-01-06')
    wrap.appendChild(cell)
    document.body.appendChild(wrap)
    teardown = wireSelect(wrap, {
      order: () => ['ramp'], dates: () => ['2026-01-06'],
      enabled: () => true, onSelect: () => {},
    })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })

  const press = () => cell.dispatchEvent(new PointerEvent('pointerdown',
    { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 5, clientY: 5, button: 0 }))
  // Was the grid's scroll left alone? A touchmove whose default is NOT
  // prevented lets the browser scroll; one that IS prevented locks it.
  const touchmovePrevented = () => {
    const ev = new TouchEvent('touchmove', { bubbles: true, cancelable: true })
    wrap.dispatchEvent(ev)
    return ev.defaultPrevented
  }

  it('leaves a touchmove alone before the hold arms — the sideways scroll survives', () => {
    press()
    expect(touchmovePrevented()).toBe(false)
  })

  it('locks the scroll once the 180ms hold has armed — the drag can select a range', () => {
    press()
    vi.advanceTimersByTime(200)   // past HOLD → arm() fires with no movement
    expect(touchmovePrevented()).toBe(true)
  })
})
