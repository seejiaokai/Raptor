// @vitest-environment jsdom
/* Week panning — the arrows, the proxy scrollbar's hsSet contract (B33) and
   the palette following the visible day. jsdom has no layout, so geometry is
   stubbed onto the live elements; the mapping maths is what's under test. */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { ROSDAY, setRosDay } from '../state/view'
import * as view from '../state/view'
import { hsSet, panDays, rosDayFollow } from './pan'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]

/* a stand-in scrollable: hsSet only touches scrollLeft/scrollWidth/clientWidth
   and scrollTo, so a plain object is enough */
const stub = (scrollLeft: number, scrollWidth: number, clientWidth: number, refuseInstant = false) => {
  const el: any = {
    scrollLeft, scrollWidth, clientWidth,
    scrollTo(o: any) {
      if (refuseInstant) throw new Error('no scrollTo')
      el.scrollLeft = o.left
    },
  }
  return el
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

afterEach(() => { vi.useRealTimers() })

describe('week panning (tfin)', () => {
  it('week nav arrows present, and both arrow pairs share panDays', () => {
    expect($('#weekPrev')).toBeTruthy()
    expect($('#weekNext')).toBeTruthy()
    expect($('#hsL')).toBeTruthy()
    expect($('#hsR')).toBeTruthy()
  })

  it('the scroll bar strip carries its controls and is not hidden from assistive tech', () => {
    const bar = $('#hscroll')
    expect(bar).toBeTruthy()
    expect(bar.getAttribute('aria-hidden')).toBe(null)
    expect(bar.getAttribute('role')).toBe('group')
    expect($('#hsTrack')).toBeTruthy()
    expect($('#hsIn')).toBeTruthy()
    expect($('#hsLbl')).toBeTruthy()
  })

  it('hsSet clamps to the real overflow', () => {
    const el = stub(0, 1000, 400)
    hsSet(el, 5000)
    expect(el.scrollLeft).toBe(600)   // scrollWidth - clientWidth
    hsSet(el, -50)
    expect(el.scrollLeft).toBe(0)
  })

  it('a mirror write is suppressed only when already in sync (HS_EPS)', () => {
    const el = stub(100, 1000, 400)
    expect(hsSet(el, 101)).toBe(false)   // within 1.5px — no echo
    expect(el.scrollLeft).toBe(100)
    expect(hsSet(el, 103)).toBe(true)    // a real move passes through 1:1
    expect(el.scrollLeft).toBe(103)
  })

  it('hsSet falls back to a bare write if instant is refused', () => {
    const el = stub(0, 1000, 400, true)
    expect(hsSet(el, 200)).toBe(true)
    expect(el.scrollLeft).toBe(200)
  })

  it('one arrow click = exactly one day box, landing on the boundary', () => {
    const w = $('#vWeek')
    const days = $$('#vWeek .day')
    expect(days.length).toBeGreaterThan(1)
    /* stub the live layout: day pitch 564, five days stubbed, two visible */
    days.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: days.length * 564, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1128, configurable: true })
    let landed = -1
    ;(w as any).scrollTo = (o: any) => { landed = o.left; (w as any).scrollLeft = o.left }
    w.scrollLeft = 0
    panDays(1)
    expect(landed).toBe(564)
    /* from mid-day going LEFT: step from the day you are leaving (ceil) */
    w.scrollLeft = 600
    panDays(-1)
    expect(landed).toBe(564)
    w.scrollLeft = 564
    panDays(-1)
    expect(landed).toBe(0)
  })

  it('panning the week walks the palette along, debounced', async () => {
    vi.useFakeTimers()
    const w = $('#vWeek')
    const days = $$('#vWeek .day')
    /* the view sits past day 0: its right edge is left of the week's left edge */
    ;(w as any).getBoundingClientRect = () => ({ left: 0, right: 1128, top: 0, bottom: 0, width: 1128, height: 0 })
    days.forEach((d, i) => {
      ;(d as any).getBoundingClientRect = () => ({ left: (i - 1) * 564, right: i * 564, top: 0, bottom: 0, width: 564, height: 0 })
    })
    setRosDay(0)
    rosDayFollow()
    expect(ROSDAY).toBe(0)                 // debounced — nothing yet
    await act(async () => { vi.advanceTimersByTime(120) })
    expect(view.ROSDAY).toBe(1)
    setRosDay(0)
  })

  it('an armed slot stops the palette wandering off its day', async () => {
    vi.useFakeTimers()
    const seat = document.createElement('div')
    seat.dataset.slot = 'd:0.0.0'
    view.armSlot('d:0.0.0', seat)
    rosDayFollow()
    await act(async () => { vi.advanceTimersByTime(120) })
    expect(view.ROSDAY).toBe(0)            // pinned — the follow bailed out
    view.disarmSlot()
  })

  it('the day dots exist, one per day, and light the first by default', () => {
    const dots = $$('#vDots button')
    expect(dots.length).toBe($$('#vWeek .day').length)
    expect(dots[0]!.classList.contains('on')).toBe(true)
  })

  it('clicking a dot scrolls its day into view', async () => {
    const days = $$('#vWeek .day')
    let called: any = null
    days.forEach((d, i) => { (d as any).scrollIntoView = () => { called = i } })
    await act(async () => { $$('#vDots button')[2]!.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(called).toBe(2)
  })

  it('desktop inner-panel scrolling skips the hidden phone dots without walking the DOM', () => {
    const oldWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
    const target = document.createElement('div')
    document.body.appendChild(target)
    const closest = vi.spyOn(Element.prototype, 'closest')
    target.dispatchEvent(new Event('scroll'))
    expect(closest, 'a desktop scroll exits before searching for the phone week').not.toHaveBeenCalled()
    closest.mockRestore()
    target.remove()
    Object.defineProperty(window, 'innerWidth', { value: oldWidth, configurable: true })
  })
})
