import { describe, expect, it } from 'vitest'
import { clampWin, growAtRest, inWindow, runway, visibleSpan, windowAround, WINDOW_FROM_MONTHS } from './colwindow'

// The column window's arithmetic, proved here because jsdom lays nothing out:
// the browser gate (e2e/leavewar.spec.ts) proves the measuring and the
// scrolling that feed it.

describe('windowAround', () => {
  it('draws a short war whole', () => {
    expect(windowAround(WINDOW_FROM_MONTHS - 1, 0)).toBeNull()
    expect(windowAround(3, 2)).toBeNull()
  })
  it('lands the month and the one after it, clamped to the war', () => {
    expect(windowAround(12, 0)).toEqual({ lo: 0, hi: 1 })
    expect(windowAround(12, 8)).toEqual({ lo: 8, hi: 9 })
    expect(windowAround(12, 11)).toEqual({ lo: 11, hi: 11 })
  })
  it('inWindow reads null as "everything drawn"', () => {
    expect(inWindow(null, 11)).toBe(true)
    expect(inWindow({ lo: 2, hi: 4 }, 1)).toBe(false)
    expect(inWindow({ lo: 2, hi: 4 }, 4)).toBe(true)
  })
  it('clampWin never inverts', () => {
    expect(clampWin({ lo: 9, hi: 3 }, 12)).toEqual({ lo: 9, hi: 9 })
    expect(clampWin({ lo: -3, hi: 40 }, 12)).toEqual({ lo: 0, hi: 11 })
  })
})

describe('growAtRest', () => {
  const fine = { coarse: false, ...runway(false) }   // before 1, after 2
  const coarse = { coarse: true, ...runway(true) }   // before 2, after 2

  it('grows the right side toward the runway on any pointer', () => {
    // window Jan–Feb (0–1), viewing Feb: wants Jan..Apr
    expect(growAtRest({ lo: 0, hi: 1 }, 12, { visLo: 1, visHi: 1, atLeftBound: false }, fine)).toEqual({ lo: 0, hi: 3 })
    expect(growAtRest({ lo: 0, hi: 1 }, 12, { visLo: 1, visHi: 1, atLeftBound: false }, coarse)).toEqual({ lo: 0, hi: 3 })
  })

  it('grows the left side at rest on a fine pointer', () => {
    // window Aug–Oct (7–9), viewing Aug: wants Jul
    expect(growAtRest({ lo: 7, hi: 9 }, 12, { visLo: 7, visHi: 7, atLeftBound: false }, fine)).toEqual({ lo: 6, hi: 9 })
  })

  it('on a coarse pointer the left side grows only at the left bound', () => {
    const w = { lo: 7, hi: 9 }
    expect(growAtRest(w, 12, { visLo: 7, visHi: 7, atLeftBound: false }, coarse)).toEqual({ lo: 7, hi: 9 })
    expect(growAtRest(w, 12, { visLo: 7, visHi: 7, atLeftBound: true }, coarse)).toEqual({ lo: 5, hi: 9 })
  })

  it('prunes past the runway with one month of hysteresis, fine pointer only', () => {
    // window Jan–Dec, viewing Jun (5): runway Apr..Aug; prune both sides
    expect(growAtRest({ lo: 0, hi: 11 }, 12, { visLo: 5, visHi: 5, atLeftBound: false }, fine)).toEqual({ lo: 4, hi: 7 })
    // exactly one month past the runway is kept (hysteresis)
    expect(growAtRest({ lo: 3, hi: 8 }, 12, { visLo: 5, visHi: 5, atLeftBound: false }, fine)).toEqual({ lo: 3, hi: 8 })
    // coarse: prunes the right only, never the left
    expect(growAtRest({ lo: 0, hi: 11 }, 12, { visLo: 5, visHi: 5, atLeftBound: false }, coarse)).toEqual({ lo: 0, hi: 7 })
  })

  it('a viewport straddling two months keeps runway beyond both', () => {
    expect(growAtRest({ lo: 2, hi: 4 }, 12, { visLo: 3, visHi: 4, atLeftBound: false }, fine)).toEqual({ lo: 2, hi: 6 })
  })

  it('never leaves the war', () => {
    expect(growAtRest({ lo: 10, hi: 11 }, 12, { visLo: 11, visHi: 11, atLeftBound: false }, fine)).toEqual({ lo: 10, hi: 11 })
    expect(growAtRest({ lo: 0, hi: 2 }, 12, { visLo: 0, visHi: 0, atLeftBound: true }, coarse)).toEqual({ lo: 0, hi: 2 })
  })
})

describe('visibleSpan', () => {
  const spans = [{ left: 0, right: 800 }, { left: 800, right: 1500 }, { left: 1500, right: 2300 }]
  it('finds the drawn months overlapping the view by more than a hairline', () => {
    expect(visibleSpan(spans, 100, 1000)).toEqual({ visLo: 0, visHi: 1 })
    expect(visibleSpan(spans, 1499, 2000)).toEqual({ visLo: 2, visHi: 2 }) // 1px of Feb is a hairline
    expect(visibleSpan(spans, 0, 2300)).toEqual({ visLo: 0, visHi: 2 })
  })
  it('reads a zero-width layout as nothing visible', () => {
    expect(visibleSpan([{ left: 0, right: 0 }], 0, 0)).toBeNull()
    expect(visibleSpan([], 0, 500)).toBeNull()
  })
})
