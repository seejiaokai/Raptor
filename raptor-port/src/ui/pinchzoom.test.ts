// @vitest-environment jsdom
/* ui/pinchzoom.ts — the pinch's own rules, without a layout engine (owner D1109, D1110, 21 Oct 26): how far it goes,
   that the stretch is only a picture until the lift, that it never starts over a puck already picked up, that a second
   finger landing off the surface still pinches, and that two fingers never let the page zoom. Where the zoomed thing
   lands and what lines up with what is the browser test's (e2e/pinchzoom.spec.ts). */
import { describe, expect, it, vi } from 'vitest'
import { wirePinch, scaleOf, PINCH_MAX } from './pinchzoom'

type P = [number, number]
function fire(el: Element, type: string, pts: P[]) {
  const touches = pts.map(([x, y], i) => ({ identifier: i, clientX: x, clientY: y, target: el }))
  const e = new Event(type, { bubbles: true, cancelable: true }) as any
  e.touches = touches
  el.dispatchEvent(e)
  return e as Event
}
function setup(over: Partial<Parameters<typeof wirePinch>[0]> = {}) {
  const surface = document.createElement('div'), target = document.createElement('div')
  surface.appendChild(target); document.body.appendChild(surface)
  let z = 1
  const apply = vi.fn((v: number) => { z = v })
  const off = wirePinch({ surface, target: () => target, get: () => z, min: () => 0.34, apply, ...over })
  return { surface, target, apply, off, z: () => z }
}
const pinch = (el: Element, d0: number, d1: number, steps = 4) => {
  fire(el, 'touchstart', [[100, 100]])
  fire(el, 'touchstart', [[100 - d0 / 2, 100], [100 + d0 / 2, 100]])
  let last: Event | null = null
  for (let i = 1; i <= steps; i++) { const d = d0 + (d1 - d0) * i / steps; last = fire(el, 'touchmove', [[100 - d / 2, 100], [100 + d / 2, 100]]) }
  fire(el, 'touchend', [])
  return last!
}

describe('pinch to zoom', () => {
  it('a pinch out stops at the smallest zoom the caller allows (the whole width)', () => {
    const t = setup()
    pinch(t.surface, 300, 20)
    expect(t.apply).toHaveBeenCalledTimes(1)
    expect(t.z()).toBeCloseTo(0.34, 5)
    t.off()
  })
  it('a pinch in stops at twice', () => {
    const t = setup()
    pinch(t.surface, 50, 400)
    expect(PINCH_MAX).toBe(2)
    expect(t.z()).toBe(2)
    t.off()
  })
  it('while the fingers move the zoomed thing is only stretched (a transform), and the stretch is gone at the lift', () => {
    const t = setup()
    fire(t.surface, 'touchstart', [[100, 100]])
    fire(t.surface, 'touchstart', [[50, 100], [150, 100]])
    fire(t.surface, 'touchmove', [[25, 100], [175, 100]])
    expect(t.target.style.transform).toMatch(/scale\(1\.5\)/)
    expect(t.apply).not.toHaveBeenCalled()
    fire(t.surface, 'touchend', [[25, 100]])
    expect(t.target.style.transform).toBe('')
    expect(t.z()).toBeCloseTo(1.5, 5)
    t.off()
  })
  it('two fingers never let the browser zoom the page: their moves are cancelled', () => {
    const t = setup()
    expect(pinch(t.surface, 100, 150).defaultPrevented).toBe(true)
    t.off()
  })
  it('no pinch over a puck already picked up, but its two-finger moves are still kept from the page', () => {
    const t = setup({ canStart: () => false })
    const last = pinch(t.surface, 100, 300)
    expect(t.apply).not.toHaveBeenCalled()
    expect(t.target.style.transform).toBe('')
    expect(last.defaultPrevented).toBe(true)
    t.off()
  })
  it('the second finger landing off the surface still makes a pinch, on the first move of the two', () => {
    const t = setup()
    fire(t.surface, 'touchstart', [[100, 100]])        // the other finger's touchstart went elsewhere
    fire(t.surface, 'touchmove', [[50, 100], [150, 100]])
    fire(t.surface, 'touchmove', [[0, 100], [200, 100]])
    fire(t.surface, 'touchend', [])
    expect(t.z()).toBeCloseTo(2, 5)
    t.off()
  })
  it('a pending puck hold is let go the moment two fingers make a pinch', () => {
    const onStart = vi.fn()
    const t = setup({ onStart })
    pinch(t.surface, 100, 120)
    expect(onStart).toHaveBeenCalledTimes(1)
    t.off()
  })
  it('one finger is left alone (it scrolls)', () => {
    const t = setup()
    fire(t.surface, 'touchstart', [[100, 100]])
    const e = fire(t.surface, 'touchmove', [[60, 100]])
    expect(e.defaultPrevented).toBe(false)
    t.off()
  })
  it('scaleOf is 1 where nothing is laid out (jsdom)', () => {
    expect(scaleOf(document.createElement('div'))).toBe(1)
  })
})
