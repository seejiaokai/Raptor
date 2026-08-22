// @vitest-environment jsdom
/* CONTINUOUS SWIPE ACROSS WEEKS on the view/edit carousel (owner, 22 Aug 26).
   The phone week is a scroll-snap carousel; swiping OFF the last day (pinned at
   the right edge) loads the next week and lands on Monday, and off the first day
   loads the previous week and lands on Sunday. jsdom has no layout, so the
   week's scroll metrics are stubbed to place it at an edge; the real geometry is
   the geometry gate's job. */
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek } from '../state/store'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement

/* place the week element at a known scroll geometry: 7 day-columns of 400px in
   a 400px viewport, so max scroll is 2400 */
const stubWeek = (atRight: boolean) => {
  const w = $('#vWeek')
  Object.defineProperty(w, 'scrollWidth', { value: 2800, configurable: true })
  Object.defineProperty(w, 'clientWidth', { value: 400, configurable: true })
  w.scrollLeft = atRight ? 2400 : 0
  return w
}

const touch = async (el: Element, type: 'touchstart' | 'touchend', x: number) => {
  const ev = new Event(type, { bubbles: true })
  ;(ev as any).touches = type === 'touchstart' ? [{ clientX: x, clientY: 200 }] : []
  ;(ev as any).changedTouches = [{ clientX: x, clientY: 200 }]
  await act(async () => { el.dispatchEvent(ev) })
}

beforeAll(async () => {
  initStore()
  Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true, writable: true })
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await act(async () => { view.setPage('viewsched'); notify() })
})

afterEach(async () => {
  if (CURWEEK !== '13/07/2026') await act(async () => { loadWeek('13/07/2026') })
})

describe('swiping off the last day loads the next week at Monday', () => {
  it('a left swipe pinned at the right edge advances a week and lands on day 0', async () => {
    const w = stubWeek(true)                       // sitting on Sunday
    await touch(w, 'touchstart', 300)
    await touch(w, 'touchend', 200)                // finger moved left 100px > threshold
    expect(CURWEEK, 'the following week loaded').toBe('20/07/2026')
    expect(DAYS[0].dt, 'and it is the authored second week').toBe('Jul 20')
    expect(view.WEEKJUMP, 'the landing flag was consumed by the repaint').toBe(null)
    expect(w.scrollLeft, 'scrolled to Monday, not held on the old Sunday').toBe(0)
  })
})

describe('swiping off the first day loads the previous week at Sunday', () => {
  it('a right swipe pinned at the left edge steps back a week and lands on day 6', async () => {
    const w = stubWeek(false)                      // sitting on Monday
    await touch(w, 'touchstart', 200)
    await touch(w, 'touchend', 300)                // finger moved right 100px > threshold
    expect(CURWEEK, 'the previous week loaded').toBe('06/07/2026')
    expect(view.WEEKJUMP).toBe(null)
    expect(w.scrollLeft, 'scrolled to the last day (max)').toBe(2400)
  })
})

describe('an ordinary within-week swipe does not cross', () => {
  it('a swipe that did not begin pinned at an edge leaves the week alone', async () => {
    const w = $('#vWeek')
    Object.defineProperty(w, 'scrollWidth', { value: 2800, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 400, configurable: true })
    w.scrollLeft = 800                             // mid-week, not at either edge
    await touch(w, 'touchstart', 300)
    await touch(w, 'touchend', 150)                // a big left swipe, but not from an edge
    expect(CURWEEK, 'still the seed week — no crossing').toBe('13/07/2026')
  })

  it('a tiny jiggle at the edge is under the threshold and does not cross', async () => {
    const w = stubWeek(true)
    await touch(w, 'touchstart', 300)
    await touch(w, 'touchend', 280)                // only 20px < 45px threshold
    expect(CURWEEK).toBe('13/07/2026')
  })
})
