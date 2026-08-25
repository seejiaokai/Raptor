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
import { hsSet, panDays, panHold, rosDayFollow, weekScrollMax } from './pan'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]

/* module pan state (the burst corridor) survives between tests; a plain
   horizontal wheel over the week is the fix's own way of dropping it, so the
   tests use it both as the subject under test and as their reset */
const dropCorridor = (w: HTMLElement) => {
  w.dispatchEvent(new WheelEvent('wheel', { deltaX: 1, bubbles: true }))
}

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
    /* 36px past Tuesday reads as PARKED ON Tuesday (PARK_TOL — the eye sees
       Tuesday at the front), so ‹ steps a real day to Monday, not a 36px
       nudge back to the boundary */
    dropCorridor(w)
    w.scrollLeft = 600
    panDays(-1)
    expect(landed).toBe(0)
    /* a genuine MID-day park still steps from the day you are leaving (ceil):
       halfway between Tuesday and Wednesday, ‹ lands on Tuesday */
    dropCorridor(w)
    w.scrollLeft = 850
    panDays(-1)
    expect(landed).toBe(564)
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

  /* A MID-GLIDE REPAINT LANDS ON THE DESTINATION, NOT HALF-WAY (owner, 23-24 Aug
     26, the "stuck halfway" half of the desktop-arrow report). A within-week
     repaint re-pins the week's scrollLeft to keep the string-diff render from
     losing the scroll — but if one fires while an arrow glide is still easing
     (rosDayFollow debounces a palette-follow notify ~110ms after the scroll
     quiets, which under load lands mid-glide), pinning the captured mid-glide
     position CANCELS the glide and freezes the strip between two days, and the
     next arrow then skips one. panHold makes the repaint hold the glide's TARGET
     instead, so it lands clean. Measured on the built app: this closed the last
     ~1-in-7 day-skip that survived the track-echo fix. */
  it('panHold pins the glide destination through a repaint, else the live position', () => {
    const w = $('#vWeek')
    const live = $$('#vWeek .day:not(.peek)')
    live.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1692, configurable: true })
    ;(w as any).scrollTo = (o: any) => { /* glide: do NOT settle scrollLeft */ }
    dropCorridor(w)                                   // no glide in flight
    expect(panHold(1234), 'outside a glide, the caller keeps its own live value').toBe(1234)
    w.scrollLeft = 0
    panDays(1)                                        // arm a glide to Tuesday (564)
    expect(panHold(300), 'a mid-glide repaint holds the destination, not the half-way point').toBe(564)
    dropCorridor(w)                                   // a manual pan drops the glide's hold
    expect(panHold(300), 'once the arrows are no longer driving, the live value stands').toBe(300)
    w.scrollLeft = 564
  })

  /* A RAPID BURST ADVANCES ONE DAY PER PRESS EVEN WHEN THE GLIDE LAGS FAR
     BEHIND (owner, 23 Aug 26 — "twice back from Thursday … then the next click
     jumps to Tuesday"). Fast taps outrun the ~350ms smooth glide: by the third
     press the live scrollLeft is still most of a day behind the column already
     commanded, sitting BEYOND panPrev on the origin side. The first cut of the
     mid-glide fix gated on scrollLeft lying between panPrev and panTgt, a
     one-day window this backlog overshoots — so it read "settled" mid-flight
     and every other press cancelled the last (Fri→Thu→Fri→Thu, never reaching
     Tuesday). Counting from the commanded target while scrollLeft is still on
     the panPrev side of it fixes both directions. Geometry as above; the glide
     is simulated by NOT settling scrollLeft, exactly like the test just above. */
  it('a rapid same-direction burst still advances one whole day per press', () => {
    const w = $('#vWeek')
    const live = $$('#vWeek .day:not(.peek)')
    live.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1692, configurable: true })
    let landed = -1
    ;(w as any).scrollTo = (o: any) => { landed = o.left; /* the glide lags: do NOT settle scrollLeft */ }
    // sitting on Friday at the front, stepping BACK fast; the glide barely moves
    w.scrollLeft = 2256           // Friday
    panDays(-1); expect(landed, 'Thursday').toBe(1692)
    w.scrollLeft = 2182           // glide still near Friday — beyond panPrev, the old window missed this
    panDays(-1); expect(landed, 'Wednesday, not a re-command of Thursday').toBe(1128)
    w.scrollLeft = 2109
    panDays(-1); expect(landed, 'Tuesday, not back to Thursday').toBe(564)
    w.scrollLeft = 2034
    panDays(-1); expect(landed, 'Monday').toBe(0)
  })

  /* A FREE SCROLL PARKS SHY OF THE BOUNDARY, AND ONE PRESS MUST STILL MOVE A
     WHOLE DAY (owner, 24 Aug 26 — "when the left most day on the screen is
     Saturday, I require 2 right arrow clicks to go to Sunday instead of 1").
     Dragging the proxy scrollbar (or a trackpad) rests the strip wherever the
     pointer stopped — routinely a few dozen px short of the column visibly at
     the front. The old 0.02 tolerance read that park as "still on Friday", so
     the first press nudged the invisible 30px to the true boundary and only
     the second press reached Sunday. Reproduced in a real browser before the
     fix: park 2790 → click → 2820 (Saturday still) → click → 3384 (Sunday). */
  it('parked a hair shy of Saturday, one › press fronts Sunday', () => {
    const w = $('#vWeek')
    const live = $$('#vWeek .day:not(.peek)')
    live.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1692, configurable: true })
    let landed = -1
    ;(w as any).scrollTo = (o: any) => { landed = o.left; (w as any).scrollLeft = o.left }
    dropCorridor(w)
    w.scrollLeft = 5 * 564 - 30      // Saturday at the front to the eye, 30px shy
    panDays(1)
    expect(CURWEEK, 'no week cross — Sunday is still ahead').toBe('13/07/2026')
    expect(landed, 'one press fronts Sunday, not a 30px nudge').toBe(6 * 564)
  })

  it('parked a hair shy of the far end, › crosses the week instead of nudging first', async () => {
    const w = $('#vWeek')
    const live = $$('#vWeek .day:not(.peek)')
    live.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1692, configurable: true })
    ;(w as any).scrollTo = (o: any) => { (w as any).scrollLeft = o.left }
    dropCorridor(w)
    w.scrollLeft = 6 * 564 - 30      // Sunday at the front to the eye
    await act(async () => { panDays(1) })
    expect(CURWEEK, 'the press crosses — no invisible nudge-press first').toBe('20/07/2026')
    await act(async () => { loadWeek('13/07/2026') })
  })

  it('parked a hair inside the left edge, ‹ crosses to the previous week', async () => {
    const w = $('#vWeek')
    const live = $$('#vWeek .day:not(.peek)')
    live.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1692, configurable: true })
    ;(w as any).scrollTo = (o: any) => { (w as any).scrollLeft = o.left }
    dropCorridor(w)
    w.scrollLeft = 30                // Monday at the front to the eye
    await act(async () => { panDays(-1) })
    expect(CURWEEK, 'the press crosses back — no nudge to true zero first').toBe('06/07/2026')
    await act(async () => { loadWeek('13/07/2026') })
  })

  /* THE STALE CORRIDOR AFTER A PLAIN HORIZONTAL PAN (the second half of the
     same report, reproduced 24 Aug 26): arrow-walk to Sunday, trackpad back to
     Saturday — a position INSIDE the burst corridor — and the next › counted
     from the stale Sunday target and jumped a whole week, skipping Sunday. A
     plain (no-shift) horizontal wheel over the week is a manual pan and must
     drop the arrows' in-flight target like shift+wheel and a scrollbar grab. */
  it('a plain horizontal wheel drops the stale corridor, so › from Saturday fronts Sunday', () => {
    const w = $('#vWeek')
    const live = $$('#vWeek .day:not(.peek)')
    live.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true })
    Object.defineProperty(w, 'clientWidth', { value: 1692, configurable: true })
    let landed = -1
    ;(w as any).scrollTo = (o: any) => { landed = o.left; (w as any).scrollLeft = o.left }
    dropCorridor(w)
    w.scrollLeft = 0
    for (let i = 0; i < 6; i++) panDays(1)          // walk to Sunday; corridor target = 3384
    expect(w.scrollLeft).toBe(6 * 564)
    w.scrollLeft = 5 * 564                          // trackpad back to Saturday — inside the corridor
    dropCorridor(w)                                 // the pan's own wheel tick
    panDays(1)
    expect(CURWEEK, 'no week jump off the stale Sunday target').toBe('13/07/2026')
    expect(landed, 'counted from where the user actually is — Sunday fronts').toBe(6 * 564)
  })

  /* THE ARROW GLIDE IS NO LONGER MURDERED BY THE PROXY MIRROR (owner, 24 Aug 26 —
     desktop ‹ › arrows "don't go day by day … stuck halfway then zoom past a few
     days"). panDays fires a scroll-behavior:smooth glide; every frame of it
     mirrors to the proxy track, and the track's echoed scroll used to write the
     week straight back with behavior:'instant', cancelling the smooth scroll and
     freezing the strip mid-day. The mirror now tags the position it wrote
     (trkEcho); a track scroll still sitting there is that echo and must leave the
     week alone. Only a real drag of the scrollbar thumb — the track somewhere
     ELSE — drives the week. Geometry stubbed as elsewhere; onDocScroll/
     onTrackScroll are exercised through their live document/track listeners. */
  const wireProxy = async () => {
    await act(async () => { view.setPage('viewsched'); notify() })
    const w = $('#vWeek'), trk = $('#hsTrack')
    const sb = $('#schedBoard'); if (sb) (sb as any).hidden = true
    Object.defineProperty(w, 'offsetParent', { value: document.body, configurable: true })
    Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true })   // wmax 7308
    Object.defineProperty(w, 'clientWidth', { value: 1692, configurable: true })
    Object.defineProperty(trk, 'scrollWidth', { value: 1000, configurable: true }) // tmax 600
    Object.defineProperty(trk, 'clientWidth', { value: 400, configurable: true })
    ;(w as any).scrollTo = (o: any) => { (w as any).scrollLeft = o.left }
    ;(trk as any).scrollTo = (o: any) => { (trk as any).scrollLeft = o.left }
    return { w, trk }
  }

  it('an echoed track scroll during a glide leaves the week alone; a real thumb-drag drives it', async () => {
    const { w, trk } = await wireProxy()
    dropCorridor(w)   // clear any glide-hold a prior test armed, so the drag below drives the week
    /* a week move mirrors to the track and records trkEcho (=93 for scrollLeft
       1128: (1128/7308)*600) */
    w.scrollLeft = 1128
    await act(async () => { w.dispatchEvent(new Event('scroll')) })
    expect(Math.round(trk.scrollLeft)).toBe(93)
    /* the glide advances a frame — the week is now past where the mirror last
       read it, but the track has NOT moved (still the echo position) */
    w.scrollLeft = 1692
    await act(async () => { trk.dispatchEvent(new Event('scroll')) })
    expect(w.scrollLeft, 'the echo must not write the week back and cancel the glide').toBe(1692)
    /* now the user actually drags the thumb somewhere else — that DOES drive the
       week: track 300 → (300/600)*7308 = 3654 */
    trk.scrollLeft = 300
    await act(async () => { trk.dispatchEvent(new Event('scroll')) })
    expect(Math.round(w.scrollLeft), 'a genuine drag still scrubs the week').toBe(3654)
    dropCorridor(w)
  })

  /* WHILE AN ARROW GLIDE IS IN FLIGHT THE TRACK IS A PURE FOLLOWER (owner, 23-24
     Aug 26). The trkEcho test above breaks the echo/drag loop by POSITION, but a
     real browser coalesces and defers `scroll` events under load: an echo can
     arrive after a newer glide frame has already advanced trkEcho, so the echo
     clears the epsilon and is mistaken for a drag — the week is written back and
     the glide dies. So the glide also arms a short window (see glideEnd) during
     which onTrackScroll never drives the week, whatever the track position looks
     like. Here the glide is armed by a real panDays; the geometry is stubbed as
     in the corridor tests so panDays reaches its scrollTo. */
  it('an arrow glide owns the week: a track scroll that looks like a drag cannot drive it mid-glide', async () => {
    const { w, trk } = await wireProxy()
    const live = $$('#vWeek .day:not(.peek)')
    live.forEach((d, i) => Object.defineProperty(d, 'offsetLeft', { value: i * 564, configurable: true }))
    w.scrollLeft = 0
    panDays(1)                                   // arm the glide (wireProxy settles scrollTo → 564)
    const landed = w.scrollLeft
    expect(landed, 'the arrow commanded Tuesday').toBe(564)
    /* a track scroll far from the echo — normally read as a genuine thumb-drag —
       arrives while the glide window is open; the guard must ignore it */
    trk.scrollLeft = 300
    await act(async () => { trk.dispatchEvent(new Event('scroll')) })
    expect(w.scrollLeft, 'the glide holds the week; the track cannot drive it mid-glide').toBe(564)
    dropCorridor(w)                              // drop the glide hold for the next test
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
