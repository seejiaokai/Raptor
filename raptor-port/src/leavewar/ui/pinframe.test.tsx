/* THE PINNED DATES ROW IN THE SAME FRAME (his D1789, 8 Nov 26 — [LW-FROZEN-BAR-GAP]) — and never from an effect.
   The fix commits the row's flip at once (`flushSync`) from the window's scroll listener. Astra's code read of the
   build (8 Nov 26) found the effect's own first call took the same instant route: React refuses a flush inside an
   effect and says so ("flushSync was called from inside a lifecycle method"). These pin both halves: the setup with
   the row already under the top bar pins it without that refusal, and a real scroll still flips it in the same
   commit as the scroll — checked inside the scroll's own act, before act lets queued work run.
   jsdom has no layout, so the row's box, the grid's box and the heading cells' widths are given here; the grid only
   pins when `matchMedia` exists, so a desktop one is given too.
   TWO WAYS (his D1870, 8 Nov 26 — [LW-PIN-LAST-FRAME]): where the browser runs the scroll timeline (jsdom says it
   does) the copy is always in the page and the browser shows it; what the scroll listener flips in the scroll's own
   commit is the copy's `up` class (its taps and shadow), so "pinned" there means `up`. Where it cannot (CSS.supports
   says no), the old way runs unchanged: the copy is mounted and taken out. Each case runs both ways. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initStore } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

const LIFECYCLE = /flushSync was called from inside a lifecycle method/
let headTop = -100   // the dates row's top: under the top bar (its bottom, 0 here — no top bar is drawn) when below 0
const box = (top: number, height: number, left: number, width: number) =>
  ({ top, bottom: top + height, left, right: left + width, width, height, x: left, y: top, toJSON() { return {} } }) as DOMRect

let undo: (() => void)[] = []
let errors: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  initStore(memoryBackend())
  headTop = -100
  const realRect = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function (this: Element) {
    if (this.matches('tbody.mxhead')) return box(headTop, 30, 0, 500)
    if (this.closest('tbody.mxhead') && this.tagName === 'TH') return box(headTop, 30, 0, 40)
    if (this.matches('.mx-wrap')) return box(50, 400, 0, 500)
    return realRect.call(this)
  }
  const realMM = window.matchMedia
  window.matchMedia = ((q: string) => ({ matches: false, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as any
  errors = vi.spyOn(console, 'error')
  undo = [() => { Element.prototype.getBoundingClientRect = realRect }, () => { window.matchMedia = realMM }, () => errors.mockRestore()]
})
afterEach(() => { for (const f of undo) f(); undo = [] })

const refusals = () => errors.mock.calls.filter((c: unknown[]) => c.some((a: unknown) => LIFECYCLE.test(String(a))))

/* the old way: the browser says it cannot run the scroll timeline, so the copy is mounted and taken out as before */
const noTimeline = () => {
  const real = CSS.supports.bind(CSS) as (q: string, v?: string) => boolean
  const spy = vi.spyOn(CSS, 'supports').mockImplementation(((q: string, v?: string) =>
    /animation-(timeline|range)/.test(q) ? false : v === undefined ? real(q) : real(q, v)) as typeof CSS.supports)
  undo.push(() => spy.mockRestore())
}
const WAYS = [
  { way: 'the browser shows it (D1870)', setup: () => {}, mounted: true,
    pinned: () => !!screen.queryByTestId('sticky-head')?.classList.contains('up') },
  { way: 'the old way, where the browser cannot', setup: noTimeline, mounted: false,
    pinned: () => !!screen.queryByTestId('sticky-head') },
]

describe.each(WAYS)('the pinned dates row (D1789) is never flushed from an effect — $way', ({ setup, pinned, mounted }) => {
  beforeEach(() => setup())

  it('a grid set up with its dates row already under the top bar pins it, with no refusal from React', () => {
    render(<Matrix />)
    expect(pinned(), 'the pinned copy is up once the setup has settled').toBe(true)
    expect(refusals(), 'no "flushSync inside a lifecycle method"').toEqual([])
  })

  it('a real scroll lets the row go and pins it again in the same commit as the scroll', () => {
    render(<Matrix />)
    expect(pinned()).toBe(true)
    act(() => {
      headTop = 120   // the row back below the top bar
      window.dispatchEvent(new Event('scroll'))
      expect(pinned(), 'let go in the scroll\'s own commit').toBe(false)
      // the browser's way keeps the copy in the page, hidden by the browser; the old way takes it out
      expect(!!screen.queryByTestId('sticky-head'), mounted ? 'still in the page, only let go' : 'gone').toBe(mounted)
    })
    act(() => {
      headTop = -100  // under the bar again
      window.dispatchEvent(new Event('scroll'))
      expect(pinned(), 'pinned in the scroll\'s own commit').toBe(true)
    })
    expect(refusals()).toEqual([])
  })

  it('the effect set up again while the row is pinned (a group folded) keeps it pinned, with no refusal', () => {
    render(<Matrix />)
    expect(pinned()).toBe(true)
    fireEvent.click(screen.getByTestId('groupfold-SXO'))
    expect(pinned(), 'still pinned after the effect ran again').toBe(true)
    expect(refusals()).toEqual([])
  })
})
