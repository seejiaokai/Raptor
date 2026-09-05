import { describe, expect, it } from 'vitest'
import { clampWin, inWindow, isFullYear, rollingTarget, stepAllowedInMotion, stepToward, visibleSpan, windowAround, WINDOW_FROM_MONTHS } from './colwindow'

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
  it('isFullYear', () => {
    expect(isFullYear({ lo: 0, hi: 11 }, 12)).toBe(true)
    expect(isFullYear({ lo: 0, hi: 10 }, 12)).toBe(false)
    expect(isFullYear({ lo: 1, hi: 11 }, 12)).toBe(false)
  })
})

describe('stepToward / rollingTarget (the one draw-toward-a-target engine)', () => {
  it('grows the right edge first, then the left, one month per call', () => {
    // toward the whole year (the desktop fill target)
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
  it('converges on the full year from any window in monthCount-1 steps at most', () => {
    let w = { lo: 4, hi: 5 }
    for (let i = 0; i < 12; i++) w = stepToward(w, 12, 0, 11)
    expect(w).toEqual({ lo: 0, hi: 11 })
  })
  it('rollingTarget puts more runway ahead than behind, clamped to the war', () => {
    expect(rollingTarget(12, 5, 5, 1, 3)).toEqual({ lo: 4, hi: 8 })
    expect(rollingTarget(12, 0, 0, 1, 3)).toEqual({ lo: 0, hi: 3 })   // clamped at the year's start
    expect(rollingTarget(12, 11, 11, 1, 3)).toEqual({ lo: 10, hi: 11 }) // and its end
  })
})

// Drawing WHILE the scroll is still moving (owner, 5 Sep 26 — "do the
// placeholders + moving"): growth only, and left growth only over a month whose
// width is already known, so nothing on screen ever hops under the finger.
describe('stepAllowedInMotion', () => {
  const known = (m: number) => m >= 3           // months 3.. were drawn before
  it('allows growth to the right always — nothing on screen moves', () => {
    expect(stepAllowedInMotion({ lo: 4, hi: 6 }, { lo: 4, hi: 7 }, known)).toBe(true)
    expect(stepAllowedInMotion({ lo: 0, hi: 1 }, { lo: 0, hi: 2 }, () => false)).toBe(true)
  })
  it('allows growth to the left only over a month whose width is known', () => {
    expect(stepAllowedInMotion({ lo: 4, hi: 6 }, { lo: 3, hi: 6 }, known)).toBe(true)   // 3 was drawn before
    expect(stepAllowedInMotion({ lo: 3, hi: 6 }, { lo: 2, hi: 6 }, known)).toBe(false)  // 2 is an estimate — wait for rest
  })
  it('never prunes mid-scroll — a prune waits for rest', () => {
    expect(stepAllowedInMotion({ lo: 2, hi: 9 }, { lo: 3, hi: 9 }, known)).toBe(false)
    expect(stepAllowedInMotion({ lo: 4, hi: 11 }, { lo: 4, hi: 10 }, known)).toBe(false)
    expect(stepAllowedInMotion({ lo: 4, hi: 6 }, { lo: 4, hi: 6 }, known)).toBe(false)  // no step at all
  })
})

describe('visibleSpan', () => {
  const spans = [{ left: 0, right: 800 }, { left: 800, right: 1500 }, { left: 1500, right: 2300 }]
  it('finds the months overlapping the view by more than a hairline', () => {
    expect(visibleSpan(spans, 100, 1000)).toEqual({ visLo: 0, visHi: 1 })
    expect(visibleSpan(spans, 1499, 2000)).toEqual({ visLo: 2, visHi: 2 }) // 1px of Feb is a hairline
    expect(visibleSpan(spans, 0, 2300)).toEqual({ visLo: 0, visHi: 2 })
  })
  it('reads a zero-width layout as nothing visible', () => {
    expect(visibleSpan([{ left: 0, right: 0 }], 0, 0)).toBeNull()
    expect(visibleSpan([], 0, 500)).toBeNull()
  })
})
