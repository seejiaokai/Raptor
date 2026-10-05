// @vitest-environment jsdom
/* [PUCK-DOT-ZOOM] (owner, 6 Oct 26 — "i cant see the red crew rest warning, over the amber line … its when im at
   default zoom"; his screen runs at 125%). On a screen whose scaling is not a whole number the dotted red ring is one
   screen pixel thick and hard against an advisory's amber ring, where it reads as that ring's edge.
   What this pins: on such a screen the app hands the stylesheet a width of two whole screen pixels (or the wider
   one the stylesheet's 1.5px already gave); on a whole-number scaling — an unscaled desktop, a phone — it hands over
   NOTHING, so the ring is exactly what it was. The look itself is pinned in a real browser:
   e2e/puck-dot.spec.ts. */
import { afterEach, describe, expect, it } from 'vitest'
import { dotRingWidth, installDotRing } from './dotring'

const dev = (d: number) => parseFloat(dotRingWidth(d) as string) * d

describe('the dotted ring\'s thickness on a scaled screen', () => {
  it('a whole-number scaling — unscaled, 2x, 3x — is left to the stylesheet', () => {
    for (const d of [1, 2, 3, 1.004, 2.996]) expect(dotRingWidth(d), `scaling ${d}`).toBeNull()
  })

  it('a scaling that is not a whole number gets two whole screen pixels — never one', () => {
    for (const d of [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1.1, 1.25, 1.33]) {
      expect(Math.floor(dev(d)), `scaling ${d}`).toBe(2)
      expect(dev(d) - 2, `scaling ${d}`).toBeLessThan(0.05)       // two, not two and a bit
    }
    expect(parseFloat(dotRingWidth(1.25) as string)).toBeCloseTo(1.616, 3)   // his screen: 2 screen pixels
  })

  it('from 150% up it is what the stylesheet\'s 1.5px already drew, so nothing gets heavier there', () => {
    for (const d of [1.375, 1.5, 1.65, 1.75, 1.875]) expect(Math.floor(dev(d)), `scaling ${d}`).toBe(Math.max(2, Math.floor(1.5 * d)))
    for (const d of [2.2, 2.5, 2.75]) expect(Math.floor(dev(d)), `scaling ${d}`).toBe(Math.floor(1.5 * d))
  })

  it('a scaling it cannot read hands over nothing', () => {
    for (const d of [0, -1, NaN, Infinity, undefined as any, null as any, 'x' as any]) expect(dotRingWidth(d)).toBeNull()
  })
})

describe('the app hands it to the stylesheet', () => {
  afterEach(() => { document.documentElement.style.removeProperty('--dot-w') })

  it('sets the width at start, follows a change of scaling, clears it on a whole-number one, and can be stopped', () => {
    const w: any = window; const was = Object.getOwnPropertyDescriptor(w, 'devicePixelRatio')
    const at = (v: number) => Object.defineProperty(w, 'devicePixelRatio', { value: v, configurable: true })
    const got = () => document.documentElement.style.getPropertyValue('--dot-w')
    at(1.25)
    const stop = installDotRing()
    expect(got()).toBe(dotRingWidth(1.25))
    at(0.8); window.dispatchEvent(new Event('resize'))      // a browser zoom arrives as a resize
    expect(got()).toBe(dotRingWidth(0.8))
    at(1); window.dispatchEvent(new Event('resize'))
    expect(got()).toBe('')                                   // unscaled: the stylesheet's own width stands
    stop()
    at(0.75); window.dispatchEvent(new Event('resize'))
    expect(got()).toBe('')                                   // stopped: no longer following
    if (was) Object.defineProperty(w, 'devicePixelRatio', was); else delete w.devicePixelRatio
  })
})
