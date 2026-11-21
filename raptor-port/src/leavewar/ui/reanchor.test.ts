/* Fix read 3, O3 (both readers): the grid's re-anchor put ANY day resting within a pixel of the frozen edge back on it,
   not only one a jump landed — a person's own scroll left there was moved too, and on a phone a sub-pixel write in a
   coast's lull stops the fling. The edge rule is for a jump's landing only (reanchor.ts). */
import { describe, expect, it } from 'vitest'
import { landingScroll, leftTheLanding, reanchorMode, reanchorPlan } from './reanchor'

/* Astra's read of chat 112's fix (19 Nov 26): a scroll between the note and the redraw that applies it is the person's,
   and is kept — the landed 1 Sep noted at scroll 6380, 0.53px clear; ArrowRight moves the grid 1px; the redraw commits
   before the scroll event. */
describe('a scroll between the note and its redraw is kept', () => {
  const desk = { coarse: false, fromJump: false, colShift: true, edge: true, landed: true }
  it('a 1px key scroll: not put back on the edge, the landing ended, nothing written', () => {
    const p = reanchorPlan({ ...desk, cellLeft: 210.53, anchorLeft: 211.53, anchorSl: 6380, nowSl: 6381 })
    expect(p.mode).toBe('shift')
    expect(p.landed).toBe(false)
    expect(Math.abs(p.shift)).toBeLessThanOrEqual(1)   // no write: the redraw itself moved nothing
  })
  it('an 18.4px scroll at 125% and a redraw that moved the day 25px: only the 25px is corrected', () => {
    const p = reanchorPlan({ ...desk, landed: false, edge: false, cellLeft: 211.53 - 18.4 + 25, anchorLeft: 211.53, anchorSl: 6380, nowSl: 6398.4 })
    expect(p.mode).toBe('shift')
    expect(p.shift).toBeCloseTo(25, 6)
  })
  it('no scroll since the note: the plan is the rule as it was', () => {
    const p = reanchorPlan({ ...desk, cellLeft: 211.9, anchorLeft: 211.53, anchorSl: 6380, nowSl: 6380 })
    expect(p).toEqual({ mode: 'edge', shift: 211.9 - 211.53, landed: true })
  })
})

const base = { coarse: false, fromJump: false, colShift: false, edge: true, landed: false }

describe('the re-anchor puts a day back on the frozen edge only where a jump landed it', () => {
  it('desktop: a day the person scrolled to within a pixel of the edge keeps the old rule (no sub-pixel write)', () => {
    expect(reanchorMode({ ...base })).toBe('shift')
  })
  it('desktop: a jumped day stays exact through the whole-year fill, long after the jump’s window', () => {
    expect(reanchorMode({ ...base, landed: true })).toBe('edge')
    expect(reanchorMode({ ...base, landed: true, fromJump: true })).toBe('edge')
  })
  it('phone: a column shift during the person’s own coast, day near the edge, never takes the edge rule', () => {
    expect(reanchorMode({ ...base, coarse: true, colShift: true })).toBe('shift')
    /* …nor a day a jump landed once the jump's window is over (a later fling's redraw) */
    expect(reanchorMode({ ...base, coarse: true, colShift: true, landed: true })).toBe('shift')
  })
  it('phone: inside the jump’s window the landed day goes back on the edge', () => {
    expect(reanchorMode({ ...base, coarse: true, fromJump: true, landed: true })).toBe('edge')
  })
  it('phone: a flick’s redraw with no jump and no column shift writes nothing', () => {
    expect(reanchorMode({ ...base, coarse: true, landed: true })).toBe('skip')
    expect(reanchorMode({ ...base, coarse: true, edge: false })).toBe('skip')
  })
  it('a day off the edge is held by the old rule everywhere', () => {
    expect(reanchorMode({ ...base, edge: false, landed: true })).toBe('shift')
    expect(reanchorMode({ ...base, edge: false, coarse: true, fromJump: true, landed: true })).toBe('shift')
  })
})

/* Fix read 4's claim 5 (19 Nov 26): the landing rounds down on the screen's own dot grid, and only a scroll that leaves the
   landing clears the "landed" mark — a click on a day cell during the fill no longer does. */
describe('the landing on the screen’s own dots, and what clears it', () => {
  it('at 100% it is the whole-pixel floor it always was', () => {
    expect(landingScroll(6380.53, 1)).toBe(6380)
    expect(landingScroll(6380, 1)).toBe(6380)
    expect(landingScroll(6379.995, 1)).toBe(6380)   // float noise in the sum, not a pixel short
  })
  it('at 125% it floors in 0.8px dots, so the browser’s round-to-nearest never puts the day under the edge', () => {
    /* measured: the day 6062.135px along; the whole-pixel floor 6062 came back as 6062.4, 0.275px under */
    const s = landingScroll(6062.135, 1.25)
    expect(s * 1.25).toBeCloseTo(7577, 6)
    expect(6062.135 - s).toBeGreaterThanOrEqual(0)
    expect(6062.135 - s).toBeLessThan(0.8)
  })
  it('a scroll back where the grid’s own last write left it keeps the mark; any other position clears it', () => {
    expect(leftTheLanding(6061.60009765625, 6061.60009765625)).toBe(false)
    expect(leftTheLanding(6061.6, 6061.60009765625)).toBe(false)
    expect(leftTheLanding(6062.4, 6061.6)).toBe(true)
    expect(leftTheLanding(0, null)).toBe(true)
  })
})
