import { describe, expect, it } from 'vitest'
import { clampWin, fillStep, growAtRest, inWindow, isFullYear, rollingTarget, runway, stepToward, visibleSpan, windowAround, WINDOW_FROM_MONTHS } from './colwindow'

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

describe('fillStep / isFullYear (the desktop background fill)', () => {
  it('grows the right edge first, then the left, one month at a time', () => {
    // open window {0,1}: fill rightward to the end of the year
    expect(fillStep({ lo: 0, hi: 1 }, 12)).toEqual({ lo: 0, hi: 2 })
    expect(fillStep({ lo: 0, hi: 10 }, 12)).toEqual({ lo: 0, hi: 11 })
    // right edge done, left edge still short (after a mid-year jump): grow left
    expect(fillStep({ lo: 5, hi: 11 }, 12)).toEqual({ lo: 4, hi: 11 })
    expect(fillStep({ lo: 1, hi: 11 }, 12)).toEqual({ lo: 0, hi: 11 })
  })
  it('is a no-op once the whole year is drawn', () => {
    expect(fillStep({ lo: 0, hi: 11 }, 12)).toEqual({ lo: 0, hi: 11 })
    expect(isFullYear({ lo: 0, hi: 11 }, 12)).toBe(true)
    expect(isFullYear({ lo: 0, hi: 10 }, 12)).toBe(false)
    expect(isFullYear({ lo: 1, hi: 11 }, 12)).toBe(false)
  })
  it('converges on the full year from any window in monthCount-1 steps at most', () => {
    let w = { lo: 4, hi: 5 }
    for (let i = 0; i < 12; i++) w = fillStep(w, 12)
    expect(w).toEqual({ lo: 0, hi: 11 })
  })
})

describe('stepToward / rollingTarget (the one draw-toward-a-target engine)', () => {
  it('grows the right edge first, then the left, one month per call', () => {
    // toward the whole year (the desktop fill target) — same shape as fillStep
    expect(stepToward({ lo: 0, hi: 1 }, 12, 0, 11)).toEqual({ lo: 0, hi: 2 })
    expect(stepToward({ lo: 5, hi: 11 }, 12, 0, 11)).toEqual({ lo: 4, hi: 11 })
    // toward a rolling window ahead of the view — grows the right edge out
    expect(stepToward({ lo: 3, hi: 5 }, 12, 3, 8)).toEqual({ lo: 3, hi: 6 })
  })
  it('prunes back one month per call once past the target, past the hysteresis slack', () => {
    // window sits well to the LEFT of a target that has moved right (scrolled on):
    // grow the right edge toward it first...
    expect(stepToward({ lo: 0, hi: 6 }, 12, 4, 9)).toEqual({ lo: 0, hi: 7 })
    // ...and once the right edge is there, prune the stale LEFT months (target.lo 4,
    // +1 hysteresis kept, so lo 2 is one past and gets trimmed)
    expect(stepToward({ lo: 2, hi: 9 }, 12, 4, 9)).toEqual({ lo: 3, hi: 9 })
    // trailing RIGHT months beyond the target prune too
    expect(stepToward({ lo: 4, hi: 11 }, 12, 4, 8)).toEqual({ lo: 4, hi: 10 })
  })
  it('is a no-op inside [target ± hysteresis], so the loop terminates', () => {
    expect(stepToward({ lo: 3, hi: 8 }, 12, 3, 8)).toEqual({ lo: 3, hi: 8 })
    expect(stepToward({ lo: 2, hi: 9 }, 12, 3, 8)).toEqual({ lo: 2, hi: 9 }) // one month bigger each side, within slack — hold
    expect(stepToward({ lo: 0, hi: 11 }, 12, 0, 11)).toEqual({ lo: 0, hi: 11 })
  })
  it('converges on any target from any window and then holds', () => {
    let w = { lo: 0, hi: 1 }
    for (let i = 0; i < 24; i++) w = stepToward(w, 12, 5, 9)
    expect(w.lo).toBeGreaterThanOrEqual(4)   // 5 - 1 hysteresis
    expect(w.hi).toBeLessThanOrEqual(10)     // 9 + 1 hysteresis
    expect(w.lo).toBeLessThanOrEqual(5)
    expect(w.hi).toBeGreaterThanOrEqual(9)
  })
  it('rollingTarget puts more runway ahead than behind, clamped to the war', () => {
    expect(rollingTarget(12, 5, 5, 1, 3)).toEqual({ lo: 4, hi: 8 })
    expect(rollingTarget(12, 0, 0, 1, 3)).toEqual({ lo: 0, hi: 3 })   // clamped at the year's start
    expect(rollingTarget(12, 11, 11, 1, 3)).toEqual({ lo: 10, hi: 11 }) // and its end
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
