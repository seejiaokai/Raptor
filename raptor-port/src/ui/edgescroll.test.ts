// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EDGE, EDGE_STEP, TOUCH_EDGE, TOUCH_STEP_MAX, edgeAutoScroll, edgeStep, findScroller } from './edgescroll'

/* CARRIED TO THE EDGE, THE VIEW FOLLOWS (owner D892, D893): the one edge scroll every drag that lacked one now rides —
   the Leave War's Rearrange and ⚙ lists, an Inputs calendar day's notes and pucks, Quals' headings — at the feel the
   Leave War's drag selection already had (select.ts reads these numbers too). jsdom lays nothing out, so the scroller
   is a box whose rect and sizes are lent to it, and the frames are run by hand. */

describe('the step for a pointer near an edge', () => {
  it('a mouse: a constant step inside the band, nothing outside it', () => {
    expect(edgeStep(500 - EDGE + 1, 0, 500, false)).toBe(EDGE_STEP)
    expect(edgeStep(EDGE - 1, 0, 500, false)).toBe(-EDGE_STEP)
    expect(edgeStep(250, 0, 500, false)).toBe(0)
  })
  it('a finger: a wider band, ramped — zero at its inner lip, the most at the very edge', () => {
    expect(edgeStep(500 - TOUCH_EDGE, 0, 500, true)).toBe(0)
    expect(edgeStep(500, 0, 500, true)).toBeCloseTo(TOUCH_STEP_MAX)
    expect(edgeStep(0, 0, 500, true)).toBeCloseTo(-TOUCH_STEP_MAX)
    const half = edgeStep(500 - TOUCH_EDGE / 2, 0, 500, true)
    expect(half).toBeGreaterThan(0); expect(half).toBeLessThan(TOUCH_STEP_MAX)
  })
})

describe('the loop', () => {
  let frames: Array<() => void> = []
  const realRAF = globalThis.requestAnimationFrame, realCAF = globalThis.cancelAnimationFrame
  const run = (n: number) => { for (let i = 0; i < n; i++) { const f = frames; frames = []; f.forEach(cb => cb()) } }
  const lend = () => {
    frames = []
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => { frames.push(() => cb(0)); return frames.length }) as typeof requestAnimationFrame
    globalThis.cancelAnimationFrame = (() => { frames = [] }) as typeof cancelAnimationFrame
  }
  afterEach(() => { globalThis.requestAnimationFrame = realRAF; globalThis.cancelAnimationFrame = realCAF; document.body.innerHTML = '' })

  /** a list 200 px tall at the screen's top, holding 1000 px — the thing dragged inside it */
  const list = () => {
    const box = document.createElement('div'); box.style.overflowY = 'auto'
    const item = document.createElement('div'); box.appendChild(item); document.body.appendChild(box)
    Object.defineProperty(box, 'clientHeight', { value: 200, configurable: true })
    Object.defineProperty(box, 'scrollHeight', { value: 1000, configurable: true })
    box.getBoundingClientRect = () => ({ top: 0, bottom: 200, left: 0, right: 300, width: 300, height: 200, x: 0, y: 0, toJSON() {} }) as DOMRect
    return { box, item }
  }

  it('finds the list that scrolls, not the page', () => {
    const { box, item } = list()
    expect(findScroller(item, 'y')).toEqual({ el: box, isDoc: false })
  })

  it('held near the foot, the list runs down, frame by frame, and the caller reads under the pointer again', () => {
    lend()
    const { box, item } = list()
    const seen = vi.fn()
    const a = edgeAutoScroll({ from: item, axis: 'y', touch: false, x: 50, y: 100, onScroll: seen })
    a.point(50, 195)
    run(3)
    expect(box.scrollTop).toBe(3 * EDGE_STEP)
    expect(seen).toHaveBeenCalledTimes(3)
    a.stop()
    run(3)
    expect(box.scrollTop).toBe(3 * EDGE_STEP)            // stopped with the release: nothing after it
  })

  it('a press that STARTS in the band does not run until the pointer has left the band', () => {
    lend()
    const { box, item } = list()
    const a = edgeAutoScroll({ from: item, axis: 'y', touch: false, x: 50, y: 195, onScroll: () => {} })
    run(3)
    expect(box.scrollTop).toBe(0)                       // the row picked up at the foot does not set the list running
    a.point(50, 100); run(1)                            // out of the band…
    a.point(50, 195); run(2)                            // …and back into it: now it runs
    expect(box.scrollTop).toBe(2 * EDGE_STEP)
    a.stop()
  })
})
