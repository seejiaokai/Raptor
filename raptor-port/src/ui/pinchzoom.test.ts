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
    const t = setup({ canStart: () => false, blockTwo: () => true })
    const last = pinch(t.surface, 100, 300)
    expect(t.apply).not.toHaveBeenCalled()
    expect(t.target.style.transform).toBe('')
    expect(last.defaultPrevented).toBe(true)
    t.off()
  })
  it('wider than a phone (no pinch here) two fingers are left to the browser — never swallowed (the code read, finding 2)', () => {
    const t = setup({ canStart: () => false })
    expect(pinch(t.surface, 100, 300).defaultPrevented).toBe(false)
    expect(t.apply).not.toHaveBeenCalled()
    t.off()
  })
  it('a finger lifting off the surface still ends the pinch: the stretch does not hang (the code read, finding 6)', () => {
    const t = setup()
    fire(t.surface, 'touchstart', [[100, 100]])
    fire(t.surface, 'touchstart', [[50, 100], [150, 100]])
    fire(t.surface, 'touchmove', [[25, 100], [175, 100]])
    fire(document.body, 'touchend', [[25, 100]])       // the other finger lifted somewhere else
    expect(t.target.style.transform).toBe('')
    expect(t.z()).toBeCloseTo(1.5, 5)
    t.off()
  })
  it('boxes drawn over the zoomed thing stretch with it while the fingers move, and are put back at the lift (the code read, finding 7)', () => {
    const over = document.createElement('div'); document.body.appendChild(over)
    const t = setup({ also: () => [over] })
    fire(t.surface, 'touchstart', [[100, 100]])
    fire(t.surface, 'touchstart', [[50, 100], [150, 100]])
    fire(t.surface, 'touchmove', [[25, 100], [175, 100]])
    expect(over.style.transform).toContain("scale(1.5)")
    fire(t.surface, 'touchend', [])
    expect(over.style.transform).toBe('')
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

  /* The Leave War's pinch (owner D1282, 23 Oct 26 — [LW-PHONE-PINCH-ZOOM]) adds three things to the one body; the board and
     Quals pass none of them, so they are unchanged. */
  const pinchSliding = (el: Element) => {
    fire(el, 'touchstart', [[100, 100]])
    fire(el, 'touchstart', [[50, 100], [150, 100]])
    fire(el, 'touchmove', [[25, 120], [175, 120]])   // 1.5 apart as much, and slid 20 down
  }
  it('a box stretched about the fingers on both axes moves as part of the one picture (the frozen names, the outline)', () => {
    const over = document.createElement('div'); document.body.appendChild(over)
    const t = setup({ alsoXY: () => [over, null] })
    pinchSliding(t.surface)
    expect(t.target.style.transform).toBe('translate(0px, 20px) scale(1.5)')
    expect(over.style.transform).toBe('translate(0px, 20px) scale(1.5)')
    fire(t.surface, 'touchend', [])
    expect(over.style.transform).toBe('')
    expect(over.style.transformOrigin).toBe('')
    t.off(); over.remove()
  })
  it('a box held inside the zoomed thing is given the exact inverse of its stretch (the month buttons keep their size)', () => {
    const t = setup()
    t.off()
    const held = document.createElement('div'); t.target.appendChild(held)
    const outside = document.createElement('div'); document.body.appendChild(outside)
    const off = wirePinch({ surface: t.surface, target: () => t.target, get: () => 1, min: () => 0.34, apply: () => {}, keep: () => [held, outside] })
    pinchSliding(t.surface)
    // the target: translate(0, 20) scale(1.5); the held box: translate(0, −20 / 1.5) scale(1 / 1.5) — together nothing
    expect(held.style.transform).toBe(`translate(0px, ${-20 / 1.5}px) scale(${1 / 1.5})`)
    expect(outside.style.transform).toBe('')   // a box not inside the target is never held
    fire(t.surface, 'touchend', [])
    expect(held.style.transform).toBe('')
    off(); outside.remove()
  })
  it('the floor is read once, as the pinch begins — read again from a stretched grid it would creep (the walk, 23 Oct 26)', () => {
    let calls = 0
    const t = setup({ min: () => (++calls === 1 ? 0.5 : 0.1) })   // what a floor measured off the stretched picture did
    pinch(t.surface, 300, 20)
    expect(t.z()).toBeCloseTo(0.5, 5)
    t.off()
  })
  describe('Ctrl+scroll (a desktop, D1228)', () => {
    const wheel = (el: Element, deltaY: number, ctrlKey = true) => {
      const e = new WheelEvent('wheel', { deltaY, ctrlKey, bubbles: true, cancelable: true, clientX: 100, clientY: 100 })
      el.dispatchEvent(e)
      return e
    }
    it('stretches the zoomed thing as the notches come, and lays the zoom out once they stop', () => {
      vi.useFakeTimers()
      const t = setup({ wheel: undefined })
      t.off()
      const apply = vi.fn()
      const off = wirePinch({ surface: t.surface, wheel: t.surface, target: () => t.target, get: () => 1, min: () => 0.34, apply })
      expect(wheel(t.surface, -100).defaultPrevented).toBe(true)   // the page's own zoom never runs
      wheel(t.surface, -100)
      expect(t.target.style.transform).toMatch(/scale\(1\.49/)       // two notches in: e^0.4
      expect(apply).not.toHaveBeenCalled()
      vi.advanceTimersByTime(250)
      expect(apply).toHaveBeenCalledTimes(1)
      expect(apply.mock.calls[0]![0]).toBeCloseTo(Math.exp(0.4), 5)
      expect(t.target.style.transform).toBe('')
      off(); vi.useRealTimers()
    })
    it('keeps to the same limits as a pinch', () => {
      vi.useFakeTimers()
      const t = setup(); t.off()
      const apply = vi.fn()
      const off = wirePinch({ surface: t.surface, wheel: t.surface, target: () => t.target, get: () => 1, min: () => 0.4, max: 1.4, apply })
      wheel(t.surface, -5000); vi.advanceTimersByTime(250)
      expect(apply.mock.calls[0]![0]).toBe(1.4)
      wheel(t.surface, 5000); vi.advanceTimersByTime(250)
      expect(apply.mock.calls[1]![0]).toBe(0.4)
      off(); vi.useRealTimers()
    })
    it('a plain scroll, without Ctrl, is the page\'s own and is left alone; and nothing where no wheel surface is given', () => {
      const t = setup(); t.off()
      const apply = vi.fn()
      const off = wirePinch({ surface: t.surface, wheel: t.surface, target: () => t.target, get: () => 1, min: () => 0.34, apply })
      expect(wheel(t.surface, -100, false).defaultPrevented).toBe(false)
      expect(t.target.style.transform).toBe('')
      off()
      const off2 = wirePinch({ surface: t.surface, target: () => t.target, get: () => 1, min: () => 0.34, apply })
      expect(wheel(t.surface, -100).defaultPrevented).toBe(false)   // the board and Quals: no Ctrl+scroll of theirs
      off2()
    })
    it('not where the caller says no pinch may start', () => {
      const t = setup(); t.off()
      const off = wirePinch({ surface: t.surface, wheel: t.surface, target: () => t.target, get: () => 1, min: () => 0.34, apply: () => {}, canStart: () => false })
      expect(wheel(t.surface, -100).defaultPrevented).toBe(false)
      off()
    })
  })
})
