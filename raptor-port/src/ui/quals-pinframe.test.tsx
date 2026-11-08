// @vitest-environment jsdom
/* QUALS' PINNED HEADING IN THE SAME FRAME (his D1789, 8 Nov 26 — [LW-FROZEN-BAR-GAP]) — and never from an effect.
   The fix commits the heading's flip at once (`flushSync`) from the window's scroll listener. Astra's code read of the
   build (8 Nov 26) found the effect's own call took the same instant route: React refuses a flush inside an effect and
   says so ("flushSync was called from inside a lifecycle method") — on the page's first draw with the heading already
   under the top bar, and again each time the effect is set up afresh while it is pinned (Quals forgets the pinned row
   first). These pin both halves: no refusal, and a real scroll still flips it in the scroll's own commit — checked
   inside the scroll's act, before act lets queued work run. jsdom has no layout, so the heading's box, the table's
   box, the heading cells' widths and the top bar's foot are given here, with a desktop `matchMedia`.
   TWO WAYS (his D1870, 8 Nov 26 — [LW-PIN-LAST-FRAME]): where the browser runs the scroll timeline (jsdom says it
   does) the copy is always in the page and the browser shows it; what the scroll listener flips in the scroll's own
   commit is the copy's `up` class (its taps and shadow), so "pinned" there means `up`. Where it cannot (CSS.supports
   says no), the old way runs unchanged: the copy is mounted and taken out. Each case runs both ways. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const LIFECYCLE = /flushSync was called from inside a lifecycle method/
let headTop = -100   // the heading's top: under the top bar (its foot at 40) while above 40
const box = (top: number, height: number, left: number, width: number) =>
  ({ top, bottom: top + height, left, right: left + width, width, height, x: left, y: top, toJSON() { return {} } }) as DOMRect

let host: HTMLDivElement
let root: Root
let errors: ReturnType<typeof vi.spyOn>
let supports: { mockRestore(): void } | null = null
const realRect = Element.prototype.getBoundingClientRect
const realMM = window.matchMedia
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const refusals = () => errors.mock.calls.filter((c: unknown[]) => c.some((a: unknown) => LIFECYCLE.test(String(a))))
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

/* the old way: the browser says it cannot run the scroll timeline, so the copy is mounted and taken out as before */
const noTimeline = () => {
  const real = CSS.supports.bind(CSS) as (q: string, v?: string) => boolean
  supports = vi.spyOn(CSS, 'supports').mockImplementation(((q: string, v?: string) =>
    /animation-(timeline|range)/.test(q) ? false : v === undefined ? real(q) : real(q, v)) as typeof CSS.supports)
}
const WAYS = [
  { way: 'the browser shows it (D1870)', setup: () => {}, mounted: true,
    pinned: () => !!$('[data-testid="qsticky-head"]')?.classList.contains('up') },
  { way: 'the old way, where the browser cannot', setup: noTimeline, mounted: false,
    pinned: () => !!$('[data-testid="qsticky-head"]') },
]

describe.each(WAYS)('Quals\' pinned heading (D1789) is never flushed from an effect — $way', ({ setup, pinned, mounted }) => {
  beforeAll(async () => {
    setup()
    Element.prototype.getBoundingClientRect = function (this: Element) {
      if (this.matches('.topbar')) return box(0, 40, 0, 1000)
      if (this.matches('#qtbl > thead')) return box(headTop, 30, 0, 500)
      if (this.matches('#qtbl > thead th')) return box(headTop, 30, 0, 40)
      if (this.matches('.qwrap')) return box(50, 400, 0, 500)
      return realRect.call(this)
    }
    window.matchMedia = ((q: string) => ({ matches: false, media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })) as any
    errors = vi.spyOn(console, 'error')
    headTop = -100
    initStore()
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    await act(async () => { root.render(<App />) })
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    // the page is opened with its heading already under the top bar: the effect's first call pins it
    await click([...host.querySelectorAll<HTMLElement>('.nav a[data-page]')].find(a => a.dataset.page === 'quals')!)
  })
  beforeEach(() => { headTop = -100 })

  afterAll(async () => {
    await act(async () => { root.unmount() })
    host.remove()
    Element.prototype.getBoundingClientRect = realRect
    window.matchMedia = realMM
    errors.mockRestore()
    supports?.mockRestore()
    supports = null
  })

  it('a page opened with its heading already under the top bar pins it, with no refusal from React', () => {
    expect(pinned(), 'the pinned copy is up once the setup has settled').toBe(true)
    expect(refusals(), 'no "flushSync inside a lifecycle method"').toEqual([])
  })

  it('a real scroll lets the heading go and pins it again in the same commit as the scroll', () => {
    act(() => {
      headTop = 120   // back below the top bar
      window.dispatchEvent(new Event('scroll'))
      expect(pinned(), 'let go in the scroll\'s own commit').toBe(false)
      // the browser's way keeps the copy in the page, hidden by the browser; the old way takes it out
      expect(!!$('[data-testid="qsticky-head"]'), mounted ? 'still in the page, only let go' : 'gone').toBe(mounted)
    })
    act(() => {
      headTop = -100  // under the bar again
      window.dispatchEvent(new Event('scroll'))
      expect(pinned(), 'pinned in the scroll\'s own commit').toBe(true)
    })
    expect(refusals()).toEqual([])
  })

  it('the effect set up again while the heading is pinned (Pilots → WSOs) keeps it pinned, with no refusal', async () => {
    expect(pinned()).toBe(true)
    const before = refusals().length
    await click($('#qViewW'))
    expect(pinned(), 'still pinned after the effect ran again').toBe(true)
    expect(refusals().length, 'no refusal from the second setup').toBe(before)
    expect(refusals()).toEqual([])
  })
})
