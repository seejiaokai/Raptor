/* The finger glide's motion (glide.js — owner D985, D987, 17 Oct 26). The screen side — a touch that stops it opens
   nothing (D986), a mouse never glides (D988), the app's own move wins (D989) — is driven in a real browser by
   scripts/tracker/smoke.mjs; these pin the numbers behind the feel. */
import { describe, it, expect } from 'vitest'
import { DECEL, MIN_V, MAX_V, rubber, unrubber, liftVelocity, stepAxis } from './glide.js'

/* run an axis to rest at 60 frames a second; returns the frames taken, the furthest it went and where it settled */
type Axis = { p: number; v: number; max: number }
function run(a: Axis, frame = 1000 / 60, limit = 2000) {
  let n = 0, far = a.p, near = a.p
  while (stepAxis(a, frame) && n < limit) { n++; far = Math.max(far, a.p); near = Math.min(near, a.p) }
  return { frames: n, far, near, p: a.p, v: a.v }
}

describe('the glide after the lift (D985)', () => {
  it('a brisk flick carries on about as far as the iPhone throws it, then stops', () => {
    const a = { p: 1000, v: 2, max: 10000 }
    const r = run(a)
    /* the whole throw of a decay at DECEL is v / -ln(DECEL) ≈ 999px, less what is under MIN_V at the end */
    expect(r.p - 1000).toBeGreaterThan(950)
    expect(r.p - 1000).toBeLessThan(1000)
    expect(r.v).toBe(0)
    expect(r.frames).toBeGreaterThan(60)          // it slows over more than a second, not in a blink
  })
  it('a faster flick goes further, a slower one less far', () => {
    const slow = run({ p: 1000, v: 0.5, max: 10000 }).p, fast = run({ p: 1000, v: 4, max: 10000 }).p
    expect(fast - 1000).toBeGreaterThan(4 * (slow - 1000) * 0.9)
  })
  it('the distance does not depend on the frame rate', () => {
    const at60 = run({ p: 0, v: 3, max: 10000 }, 1000 / 60).p, at120 = run({ p: 0, v: 3, max: 10000 }, 1000 / 120).p
    expect(Math.abs(at60 - at120)).toBeLessThan(2)
  })
  it('a speed under MIN_V is no glide at all', () => {
    const a = { p: 500, v: MIN_V / 2, max: 10000 }
    expect(stepAxis(a, 16)).toBe(false)
    expect(a.v).toBe(0)
    expect(Math.abs(a.p - 500)).toBeLessThan(1)
  })
  it('DECEL is the iPhone\'s normal rate', () => { expect(DECEL).toBe(0.998) })
})

describe('at an end it bounces and springs back (D987)', () => {
  it('a glide reaching the bottom runs a little past it, then settles exactly on it', () => {
    const a = { p: 9800, v: 3, max: 10000 }
    const r = run(a)
    expect(r.far).toBeGreaterThan(10000)          // it went past the end
    expect(r.far - 10000).toBeLessThan(200)       // a little, not a box-height
    expect(r.p).toBe(10000)                       // and came to rest on the end
    expect(r.v).toBe(0)
  })
  it('the same at the top', () => {
    const r = run({ p: 100, v: -3, max: 10000 })
    expect(r.near).toBeLessThan(0)
    expect(r.p).toBe(0)
  })
  it('it never swings back through the end into the chart', () => {
    const r = run({ p: 9990, v: 6, max: 10000 })
    /* after the peak it only comes back toward the end: never below it */
    const a = { p: 9990, v: 6, max: 10000 }
    let peaked = false, under = false
    for (let i = 0; i < 400 && stepAxis(a, 1000 / 60); i++) { if (a.v < 0) peaked = true; if (peaked && a.p < 10000 - 0.01) under = true }
    expect(peaked).toBe(true); expect(under).toBe(false); expect(r.p).toBe(10000)
  })
  it('a stretch the finger lets go of, with no speed, springs back to the end within half a second', () => {
    const a = { p: -120, v: 0, max: 10000 }
    const r = run(a)
    expect(r.p).toBe(0)
    expect(r.frames * 1000 / 60).toBeLessThan(800)
  })
  it('a stretch flicked back inward glides on into the chart', () => {
    const r = run({ p: 10040, v: -2, max: 10000 })
    expect(r.p).toBeLessThan(10000 - 500)
  })
  it('a box with no range in that direction (max 0) settles at 0', () => {
    const r = run({ p: 0, v: 0, max: 0 })
    expect(r.p).toBe(0)
  })
})

describe('the stretch drawn past an end', () => {
  it('gives less and less, and never as far as the box', () => {
    const dim = 650
    expect(rubber(0, dim)).toBe(0)
    expect(rubber(100, dim)).toBeLessThan(100)
    expect(rubber(100, dim)).toBeGreaterThan(50)
    expect(rubber(10000, dim)).toBeLessThan(dim)
    expect(rubber(-100, dim)).toBe(-rubber(100, dim))
  })
  it('unrubber undoes rubber', () => {
    for (const x of [-300, -40, 5, 77, 400]) expect(unrubber(rubber(x, 600), 600)).toBeCloseTo(x, 6)
  })
})

describe('the speed at the lift', () => {
  const s = (pts: number[][]) => pts.map(([t, y]) => ({ t, x: 0, y }))
  it('is read over the last moments of the drag', () => {
    const v = liftVelocity(s([[0, 0], [100, 10], [150, 60], [200, 160]]), 205)
    expect(v.vy).toBeCloseTo(100 / 50, 5)         // only the last 80ms count: 60 → 160 between t 150 and 200
    expect(v.vx).toBe(0)
  })
  it('is none when the finger rested before lifting (it meant to stop there)', () => {
    expect(liftVelocity(s([[0, 0], [50, 100]]), 50 + 61).vy).toBe(0)
  })
  it('is none for a tap (one sample)', () => {
    expect(liftVelocity(s([[0, 0]]), 5)).toEqual({ vx: 0, vy: 0 })
  })
  it('is capped, so one stray sample cannot fling the chart to its end', () => {
    expect(liftVelocity(s([[0, 0], [1, 500]]), 2).vy).toBe(MAX_V)
  })
})
