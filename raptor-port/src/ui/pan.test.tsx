// @vitest-environment jsdom
/* Week panning — the arrows, the proxy scrollbar's hsSet contract (B33) and
   the palette following the visible day. jsdom has no layout, so geometry is
   stubbed onto the live elements; the mapping maths is what's under test. */
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek } from '../state/store'
import { CURWEEK } from '../engine/waves'
import { ROSDAY, setRosDay } from '../state/view'
import * as view from '../state/view'
import { hsSet, panDays, rosDayFollow, weekScrollMax } from './pan'

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

  /* the desktop arrows are continuous across weeks (owner, 23 Aug 26) — the
     same edge-cross the phone swipe does. Stub geometry as above; the restore
     idiom is swipeweeks.test.tsx's. */
  it('the › arrow jammed at the right edge crosses to next week and lands on Monday', async () => {
    const w = $('#vWeek')
    const days = $$('#vWeek .day')
    days.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: days.length * 564, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1128, configurable: true })
    w.scrollLeft = days.length * 564 - 1128        // jammed at max
    await act(async () => { panDays(1) })
    expect(CURWEEK, 'the following week loaded').toBe('20/07/2026')
    expect(view.WEEKJUMP, 'the landing flag was consumed by the repaint').toBe(null)
    expect(w.scrollLeft, 'landed on Monday, not held at the old edge').toBe(0)
    await act(async () => { loadWeek('13/07/2026') })
  })

  it('the ‹ arrow at the left edge crosses to the previous week', async () => {
    const w = $('#vWeek')
    const days = $$('#vWeek .day')
    days.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: days.length * 564, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1128, configurable: true })
    w.scrollLeft = 0
    await act(async () => { panDays(-1) })
    expect(CURWEEK, 'the previous week loaded').toBe('06/07/2026')
    await act(async () => { loadWeek('13/07/2026') })
  })

  /* THE WEEKEND MUST REACH THE FRONT BEFORE THE ARROW CROSSES (owner, 23 Aug
     26 — "Friday not aligned on the far left … Saturday and Sunday out of
     selection of the placeholders"). On a wide screen three day-columns show at
     once; the ceiling used to be "Sunday jammed flush right", which left Friday
     at the front and the weekend unreachable. It is now "the last live day at
     the front" — the peek preview is the runway — so the arrow walks every day
     to the front (Sat, then Sun) and crosses only on the press PAST Sunday. */
  it('weekScrollMax on desktop is the last live day at the FRONT, not jammed right', () => {
    const w = $('#vWeek')
    const live = $$('#vWeek .day:not(.peek)')
    live.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true }) // peek runway well past Sunday
    Object.defineProperty(w, 'clientWidth', { value: 1692, configurable: true }) // three days to a screen
    // (liveDays-1) * step = 6 * 564, NOT last.right - clientWidth (which would be far smaller)
    expect(weekScrollMax(w)).toBe(6 * 564)
  })

  it('the › arrow walks Saturday then Sunday to the front, and crosses only past Sunday', async () => {
    const w = $('#vWeek')
    const live = $$('#vWeek .day:not(.peek)')
    live.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1692, configurable: true })
    let landed = -1
    ;(w as any).scrollTo = (o: any) => { landed = o.left; (w as any).scrollLeft = o.left }
    w.scrollLeft = 0
    const seen: number[] = []
    for (let i = 0; i < 6; i++) { panDays(1); seen.push(landed) }   // Tue,Wed,Thu,Fri,Sat,Sun fronts
    expect(seen, 'each press lands the next day at the front, up to Sunday').toEqual([564, 1128, 1692, 2256, 2820, 3384])
    // now sitting on Sunday-at-front — the NEXT › crosses to next week's Monday
    await act(async () => { panDays(1) })
    expect(CURWEEK, 'only the press past Sunday crosses the week').toBe('20/07/2026')
    expect(w.scrollLeft, 'and lands on Monday').toBe(0)
    await act(async () => { loadWeek('13/07/2026') })
  })

  /* ONE PRESS = ONE DAY EVEN MID-GLIDE (owner, 23 Aug 26 — "twice on Tuesday to
     get to Wednesday"). The arrow scroll is a ~300ms smooth glide; a second
     press that lands before it finishes must count from where the last press
     was HEADING, not the half-finished scrollLeft. */
  it('a second press during the glide still advances a whole day', () => {
    const w = $('#vWeek')
    const live = $$('#vWeek .day:not(.peek)')
    live.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1692, configurable: true })
    let landed = -1
    ;(w as any).scrollTo = (o: any) => { landed = o.left; /* NOTE: do NOT settle scrollLeft — simulate mid-glide */ }
    w.scrollLeft = 0
    panDays(1)                    // commands 564 (Tuesday), glide begins
    expect(landed).toBe(564)
    w.scrollLeft = 300            // still mid-glide, 300 of the way to 564
    panDays(1)                    // second press before it settles
    expect(landed, 'counted from the commanded 564, not the mid-glide 300 → Wednesday').toBe(1128)
    w.scrollLeft = 1128
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
    /* one dot per LIVE day — jsdom's default desktop width also mounts the
       inert next-week peek preview (ui/peek.ts) trailing the live days, and
       the dots track DAYS.length, never the peek nodes. */
    const dots = $$('#vDots button')
    expect(dots.length).toBe($$('#vWeek .day:not(.peek)').length)
    expect(dots[0]!.classList.contains('on')).toBe(true)
  })

  it('clicking a dot scrolls its day into view', async () => {
    const days = $$('#vWeek .day:not(.peek)')
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
