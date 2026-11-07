// @vitest-environment jsdom
/* The cross-week glide is a phone-only visual slide fired on a Monday/Sunday
   landing. jsdom has no layout, so the real motion is the browser gate's job;
   these pin the GATING (when it must NOT fire), what each clone HOLDS (one day
   card, the right one, opaque), the PRE-PAINT order (on-screen under the leaving
   day for two frames, then the slide in one style update) and that a fired
   glide cleans up after itself — no leftover transform, no orphan clone, no
   page-overflow lock. */
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { beginGlide } from './weekglide'
import * as view from '../state/view'

const setW = (px: number) =>
  Object.defineProperty(window, 'innerWidth', { value: px, configurable: true, writable: true })

const mkRoot = (width: number) => {
  const el = document.createElement('div')
  el.className = 'week'
  el.innerHTML = '<section class="day">Sun</section>'
  document.body.appendChild(el)
  el.getBoundingClientRect = () =>
    ({ width, height: 800, left: 0, top: 0, right: width, bottom: 800, x: 0, y: 0, toJSON() {} }) as DOMRect
  return el
}
/* seven day cards at a 390px pitch — jsdom lays nothing out, so the pitch the
   glide reads off `offsetLeft` is stubbed onto each card */
const fillWeek = (root: HTMLElement, prefix: string) => {
  root.innerHTML = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<section class="day">${prefix}${d}</section>`).join('')
  ;[...root.children].forEach((c, i) => Object.defineProperty(c, 'offsetLeft', { value: 12 + i * 390, configurable: true }))
}
const clones = () => [...document.querySelectorAll('body > .week')].filter(el => (el as HTMLElement).style.position === 'fixed') as HTMLElement[]
const byZ = (z: number) => clones().find(c => c.style.zIndex === String(z))!

/* jsdom has no requestAnimationFrame under vitest's fake timers; a 16ms timer
   stands in so the clone's two-frame pre-paint and handover (weekglide.ts
   afterTwoFrames) run under vi.advanceTimersByTime / runAllTimers like
   everything else */
beforeEach(() => { (window as any).requestAnimationFrame = (cb: FrameRequestCallback) => window.setTimeout(() => cb(performance.now()), 16) })
afterEach(() => {
  view.setWeekJump(null)
  document.body.innerHTML = ''
  document.body.style.overflowX = ''
  vi.useRealTimers()
})

describe('the glide only arms on a real phone week cross', () => {
  it('does not arm on an ordinary within-week repaint (no week jump)', () => {
    setW(400); view.setWeekJump(null)
    expect(beginGlide(mkRoot(390))).toBeNull()
  })

  it('does not arm on desktop — the arrows land instant there', () => {
    setW(1200); view.setWeekJump('mon')
    expect(beginGlide(mkRoot(1100))).toBeNull()
  })

  it('does not arm without layout (jsdom / not painted), so the gates are untouched', () => {
    setW(400); view.setWeekJump('mon')
    expect(beginGlide(mkRoot(0))).toBeNull()
  })

  it('arms on a phone Monday landing and on a phone Sunday landing', () => {
    setW(400)
    view.setWeekJump('mon'); expect(beginGlide(mkRoot(390))).toBeTypeOf('function')
    view.setWeekJump('sun'); expect(beginGlide(mkRoot(390))).toBeTypeOf('function')
  })
})

describe('a fired glide leaves nothing behind', () => {
  it('spawns TWO clones, pre-paints them on-screen for two frames, slides, and keeps the real week painted but untouchable until the end', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    const root = mkRoot(390)
    const run = beginGlide(root)!
    run()
    // inserted: BOTH weeks are cloned (outgoing + incoming), the real week stays
    // PAINTED under them (never hidden — a hidden element is never painted, and
    // the reveal then drew in from black on the phone, 5 Sep 26) but takes no
    // touches, and the page is clipped so it can't scroll sideways. Three
    // `.week` in the DOM = root + the two clones.
    expect(document.querySelectorAll('body > .week').length).toBe(3)
    expect(clones().length).toBe(2)
    expect(root.style.visibility, 'the real week is never hidden — it paints under the clones').toBe('')
    expect(root.style.pointerEvents, 'but it takes no touches while the clones slide').toBe('none')
    expect(root.style.transform, 'the real week never itself transforms now — the clones do').toBe('')
    expect(document.body.style.overflowX).toBe('hidden')
    expect(root.style.overflowX, 'and it cannot scroll: Safari\'s leftover spring stops under the slide').toBe('hidden')
    // PRE-PAINT (the 16:46 split, 5 Sep 26): for two frames both clones sit
    // on-screen where the week is, the ARRIVING one (z 40) under the LEAVING one
    // (z 41), so the browser paints them where they stand before anything moves
    const inc = byZ(40), out = byZ(41)
    expect(inc && out, 'the leaving clone sits above the arriving one').toBeTruthy()
    expect(inc.style.transform, 'the arriving clone is inserted ON-SCREEN, not a screen away').toBe('translateX(0)')
    expect(out.style.transform).toBe('translateX(0)')
    expect(inc.style.transition, 'nothing moves yet').toBe('')
    vi.advanceTimersByTime(32)
    // the slide, in one style update: the arriving clone is sent to its landing
    // (translateX 0) with a transition, the leaving one a screen off in the
    // swipe direction — a forward (Monday) cross sends it LEFT
    expect(inc.style.transition).toContain('transform')
    expect(inc.style.transform).toBe('translateX(0)')
    expect(out.style.transform).toBe('translateX(-390px)')
    // the slide ends (no transitionend in jsdom → the fallback timer at DUR+120
    // finishes it): the outgoing clone goes, the week is uncovered for touches
    // and the page clip lifts — but the INCOMING clone, the landed week's own
    // picture, stays two frames more while the real week's paint commits
    vi.advanceTimersByTime(470)
    expect(root.style.pointerEvents, 'the settled week takes touches again').toBe('')
    expect(root.style.overflowX, 'and scrolls again').toBe('')
    expect(root.scrollLeft, 'standing on its landing').toBe(0)
    expect(document.body.style.overflowX).toBe('')
    expect(document.querySelectorAll('body > .week').length, 'root + the incoming clone still covering').toBe(2)
    vi.advanceTimersByTime(40)
    expect(document.querySelectorAll('body > .week').length, 'two frames later the last clone comes off').toBe(1)
  })

  /* Each clone is ONE day card, not the whole week clipped to one (5 Sep 26,
     16:46 — the whole-week clone was seven days of markup for the phone to
     paint, with six of them off to the sides for it to paint ahead into; the
     arriving one entered before its lower tiles existed and the real week
     showed through the hole). The leaving clone holds the day the finger was
     on; the arriving clone holds the landing day of the NEW week. */
  it('each clone holds ONE day card — the finger day out, the landing day in', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    const root = mkRoot(390)
    fillWeek(root, '')
    Object.defineProperty(root, 'scrollLeft', { value: 780, configurable: true, writable: true })   // parked on Wed
    const run = beginGlide(root)!
    fillWeek(root, 'n')                          // the repaint swaps in the new week …
    root.scrollLeft = 0                          // … and lands Monday (a forward cross)
    run()
    const out = byZ(41), inc = byZ(40)
    expect(out.querySelectorAll('.day').length, 'the leaving clone is one card').toBe(1)
    expect(out.textContent, 'the day the finger was on, from the week being left').toBe('Wed')
    expect(inc.querySelectorAll('.day').length, 'the arriving clone is one card').toBe(1)
    expect(inc.textContent, 'the landing day of the new week').toBe('nMon')
    vi.runAllTimers()
  })

  it('a Sunday (back) cross arrives on the new week\'s LAST day', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('sun')
    const root = mkRoot(390)
    fillWeek(root, '')
    Object.defineProperty(root, 'scrollLeft', { value: 0, configurable: true, writable: true })     // parked on Mon
    // the phone's weekScrollMax is scrollWidth − clientWidth: seven cards at a 390px pitch
    Object.defineProperty(root, 'scrollWidth', { value: 390 * 7, configurable: true })
    Object.defineProperty(root, 'clientWidth', { value: 390, configurable: true })
    const run = beginGlide(root)!
    fillWeek(root, 'n')
    run()
    expect(byZ(41).textContent).toBe('Mon')
    expect(byZ(40).textContent).toBe('nSun')
    vi.runAllTimers()
  })

  /* THE SPLIT (owner, 5 Sep 26 — 16:46 and 17:23 recordings; the 16:02 "lower
     half black" was the same fault). The clone box was sized from the week
     being LEFT, measured before the swap: crossing from a week of short ground
     days into one whose Monday runs off the screen, the arriving clone was
     clipped at the short week's height — its top slid in, and below a hard
     seam whatever lay underneath showed instead. The box must be as tall as
     the TALLER of the two weeks, whichever side of the swap that is. */
  it('the clones are as tall as the taller of the two weeks — the arriving one is never clipped at the leaving week\'s height', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    const root = mkRoot(390)                     // the week being left: 800px tall
    const run = beginGlide(root)!
    // the swap lands a week whose Monday is far taller
    root.getBoundingClientRect = () =>
      ({ width: 390, height: 2600, left: 0, top: 0, right: 390, bottom: 2600, x: 0, y: 0, toJSON() {} }) as DOMRect
    run()
    for (const c of clones()) expect(c.style.height, 'sized to the arriving week, the taller').toBe('2600px')
    vi.runAllTimers()
    // and the other way round: leaving a tall week for a short one keeps the tall box
    view.setWeekJump('sun')
    const root2 = mkRoot(390)
    root2.getBoundingClientRect = () =>
      ({ width: 390, height: 2600, left: 0, top: 0, right: 390, bottom: 2600, x: 0, y: 0, toJSON() {} }) as DOMRect
    const run2 = beginGlide(root2)!
    root2.getBoundingClientRect = () =>
      ({ width: 390, height: 300, left: 0, top: 0, right: 390, bottom: 300, x: 0, y: 0, toJSON() {} }) as DOMRect
    run2()
    for (const c of clones()) expect(c.style.height, 'sized to the leaving week, the taller').toBe('2600px')
    vi.runAllTimers()
  })

  it('the clones are opaque — the page ground under a short day, so the taller real day never shows below it', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    beginGlide(mkRoot(390))!()
    for (const c of clones()) expect(c.style.background, 'the page background, not transparent').toBe('var(--bg)')
    vi.runAllTimers()
  })

  /* OVERLAPPING GLIDES must not strand the week untouchable (24 Aug 26). A
     second cross firing before the first's slide ends used to capture the
     already-set styles as ITS baseline and restore to them, so the whole week
     stayed covered and the page clipped until a reload. The burst now shares
     one baseline, captured on the first glide and restored on the last. */
  /* the fourth read's finding 1 (3 Nov 26): a narrow desktop window with classic scrollbars draws the week's own scrollbar
     (it is hidden only above 820), so hiding sideways scrolling there shortened the week by that bar for the slide — and
     there is no leftover spring to stop. Only a week whose scrollbar takes no room is stilled. */
  it('a week whose own scrollbar takes room is not stilled — its height never jolts', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    const root = mkRoot(390)
    Object.defineProperty(root, 'offsetHeight', { value: 815, configurable: true })
    Object.defineProperty(root, 'clientHeight', { value: 800, configurable: true })
    beginGlide(root)!()
    expect(root.style.pointerEvents, 'still covered').toBe('none')
    expect(root.style.overflowX, 'but its scrolling is left alone').toBe('')
    vi.runAllTimers()
    expect(root.style.overflowX).toBe('')
  })

  it('two overlapping glides uncover the real week once, never restore it to covered', () => {
    vi.useFakeTimers()
    setW(400)
    const root = mkRoot(390)
    view.setWeekJump('mon'); beginGlide(root)!()
    expect(root.style.pointerEvents).toBe('none')
    // a SECOND cross fires while the first is still sliding
    view.setWeekJump('sun'); beginGlide(root)!()
    expect(root.style.pointerEvents, 'still covered mid-burst').toBe('none')
    // both clones' fallback timers fire, then the last clone's two-frame handover
    vi.runAllTimers()
    expect(root.style.pointerEvents, 'the week takes touches again, not stranded covered').toBe('')
    expect(root.style.overflowX, 'and scrolls again, not stranded unscrollable').toBe('')
    expect(document.body.style.overflowX, 'the page clip is lifted').toBe('')
    expect(document.querySelectorAll('body > .week').length, 'all four clones cleaned up').toBe(1)
  })

  /* [WEEK-GLIDE-TWO-PAGES] (the fourth read of 3 Nov 26, finding 2): Edit Schedule and View-only Sched each keep their own
     week, both mounted, one shown. A cross on Edit Schedule, a switch to View-only Sched and a cross there before the first
     slide ended put back only View-only Sched's week — the burst kept one baseline and restored it on the LAST week alone —
     so Edit Schedule's week stayed untouchable and unscrollable until a reload. Every week a burst touched is put back. */
  it('a burst over two pages puts back BOTH weeks — the first page\'s week is never left untouchable or unscrollable', () => {
    vi.useFakeTimers()
    setW(400)
    const edit = mkRoot(390), viewWk = mkRoot(390)
    fillWeek(edit, 'e'); fillWeek(viewWk, 'v')
    edit.style.pointerEvents = 'auto'          // a baseline of its own, to prove each week gets its OWN back
    view.setWeekJump('mon'); beginGlide(edit)!()
    expect(edit.style.pointerEvents).toBe('none')
    expect(edit.style.overflowX).toBe('hidden')
    // the page switch, then a cross on View-only Sched while Edit Schedule's slide is still running
    vi.advanceTimersByTime(100)
    view.setWeekJump('sun'); beginGlide(viewWk)!()
    expect(viewWk.style.pointerEvents).toBe('none')
    vi.runAllTimers()
    expect(viewWk.style.pointerEvents, 'View-only Sched\'s week takes touches again').toBe('')
    expect(viewWk.style.overflowX, 'and scrolls again').toBe('')
    expect(edit.style.pointerEvents, 'Edit Schedule\'s week is given ITS OWN touches back, not left off').toBe('auto')
    expect(edit.style.overflowX, 'and scrolls again, not stranded').toBe('')
    expect(document.body.style.overflowX, 'the page clip is lifted').toBe('')
    expect(clones().length, 'every copy cleaned up').toBe(0)
    // and the next burst starts clean: a cross on Edit Schedule alone covers and uncovers only it
    view.setWeekJump('mon'); beginGlide(edit)!()
    expect(viewWk.style.pointerEvents, 'the other page\'s week is not touched by a later cross').toBe('')
    vi.runAllTimers()
    expect(edit.style.pointerEvents).toBe('auto')
  })

  /* THE TWO READS OF 8 NOV 26 (Opus finding 1, Astra's question — docs/superpowers/briefs/2026-11-08-board-keys-read-*.md).
     Each week's own landing, and only the week crossed LAST is landed at the burst's end: a week crossed earlier was landed
     by its own repaint as it swapped, and if the person has switched back to its page inside the burst, the switch has
     since put it on the day it carried — a cross on Edit Schedule (Monday), a cross back on View-only Sched (Sunday), back
     to Edit Schedule (on Sunday, carried): the burst's end used to drag Edit Schedule's week back to Monday. */
  const sized = (r: HTMLElement) => {
    Object.defineProperty(r, 'scrollWidth', { value: 12 + 390 * 7, configurable: true })
    Object.defineProperty(r, 'clientWidth', { value: 390, configurable: true })
    Object.defineProperty(r, 'scrollLeft', { value: 0, configurable: true, writable: true })
  }
  it('a burst over two pages lands only the week crossed last — a week switched back to keeps the day it was given', () => {
    vi.useFakeTimers()
    setW(400)
    const edit = mkRoot(390), viewWk = mkRoot(390)
    fillWeek(edit, 'e'); fillWeek(viewWk, 'v'); sized(edit); sized(viewWk)
    view.setWeekJump('mon'); beginGlide(edit)!()          // Edit Schedule crosses forward, onto Monday
    vi.advanceTimersByTime(100)
    view.setWeekJump('sun'); beginGlide(viewWk)!()        // View-only Sched crosses back, onto Sunday (2352, its end)
    vi.advanceTimersByTime(100)
    edit.scrollLeft = 2352                                 // back on Edit Schedule: the switch carried Sunday onto its week
    vi.runAllTimers()
    expect(viewWk.scrollLeft, 'the week crossed last stands on ITS landing, Sunday').toBe(2352)
    expect(edit.scrollLeft, 'the week switched back to keeps the day it was given, not dragged back to Monday').toBe(2352)
    expect([edit.style.pointerEvents, edit.style.overflowX, viewWk.style.pointerEvents, viewWk.style.overflowX], 'both take touches and scroll').toEqual(['', '', '', ''])
  })
  it('a burst over two pages whose later slide ends first: nothing is put back until the last one ends', () => {
    vi.useFakeTimers()
    setW(400)
    const edit = mkRoot(390), viewWk = mkRoot(390)
    fillWeek(edit, 'e'); fillWeek(viewWk, 'v'); sized(edit); sized(viewWk)
    view.setWeekJump('mon'); beginGlide(edit)!()
    vi.advanceTimersByTime(100)
    view.setWeekJump('sun'); beginGlide(viewWk)!()
    vi.advanceTimersByTime(40)                             // both slides under way
    const incs = clones().filter(c => c.style.zIndex === '40')
    expect(incs.length, 'two arriving copies').toBe(2)
    incs[1]!.dispatchEvent(new Event('transitionend'))    // View-only Sched's ends first
    expect([edit.style.pointerEvents, viewWk.style.pointerEvents], 'both weeks still covered while one slide runs').toEqual(['none', 'none'])
    expect(document.body.style.overflowX).toBe('hidden')
    vi.runAllTimers()
    expect([edit.style.pointerEvents, edit.style.overflowX, viewWk.style.pointerEvents, viewWk.style.overflowX, document.body.style.overflowX]).toEqual(['', '', '', '', ''])
    expect(clones().length).toBe(0)
  })

  /* owner, 23 Aug 26 — "bleeding at the top bar when swiping". The clone is
     position:fixed from the week's rect.top, which is above the sticky top bar
     once the page is scrolled; at z-index 60 (the bar's own) it tied and, being
     appended last, painted the sliding week over the bar. It must lose to the
     bar — any value under 60. */
  it('parks the sliding clones under the sticky top bar (z-index below .topbar 60)', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    const root = mkRoot(390)
    beginGlide(root)!()
    expect(clones().length, 'the fired glide spawned its fixed-position clones').toBe(2)
    for (const c of clones()) expect(Number(c.style.zIndex), 'a clone must sit below the top bar, not tie it').toBeLessThan(60)
    vi.runAllTimers()
  })

  /* owner, 23 Aug 26 — "artifacts bleeding between weeks". The clone carries the
     week's class, and `.week` sets scroll-behavior:smooth, so parking it with
     `scrollLeft = sl` was ANIMATED: the outgoing week rolled through its middle
     days while it slid off. The clone must opt OUT of smooth so its park is an
     instant freeze on the day the finger left. */
  it('freezes the sliding clone on the finger day (scroll-behavior:auto, not the week\'s smooth)', () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('sun')
    const root = mkRoot(390)
    beginGlide(root)!()
    for (const c of clones()) expect(c.style.scrollBehavior, 'the clone must not inherit .week smooth-scroll, or its park animates').toBe('auto')
    vi.runAllTimers()
  })

  /* [WEEK-SWIPE-CROSS] — his iPhone recording, 3 Nov 26: "it triggers but it's very abrupt, not smooth". Two things in
     the glide itself made the cross read as a jump (the real browser's proof: e2e/weekswipe.spec.ts). */
  it('the leaving copy starts where the day stands on screen — the pull past the end included — never put back first', () => {
    vi.useFakeTimers()
    setW(400)
    const at = (sl: number, jump: 'mon' | 'sun') => {
      view.setWeekJump(jump)
      const root = mkRoot(390)
      fillWeek(root, '')
      Object.defineProperty(root, 'scrollWidth', { value: 12 + 390 * 7, configurable: true })
      Object.defineProperty(root, 'clientWidth', { value: 390, configurable: true })
      Object.defineProperty(root, 'scrollLeft', { value: sl, configurable: true, writable: true })
      const run = beginGlide(root)!
      fillWeek(root, 'n'); run()
      const card = byZ(41).firstElementChild as HTMLElement
      const shift = parseFloat(card.style.marginLeft || '0')
      vi.runAllTimers(); document.body.innerHTML = ''
      return shift
    }
    /* Monday pulled 60px past its end (Safari reports the pull as a scroll below 0): the copy keeps the 60px */
    expect(at(-60, 'sun'), 'Monday held where the pull left it').toBe(60)
    /* Sunday at rest sits 12px further in than Monday (the week's padding): the copy keeps that too */
    expect(at(2328, 'mon'), 'Sunday at its own resting place (measured: the strip rests at 2328, Sunday 12px in)').toBe(12)
    /* a day caught far from any resting place is still drawn as one clean day, not slid half off: at most a quarter day */
    expect(Math.abs(at(160, 'sun')), 'never more than a quarter of a day off its place').toBeLessThanOrEqual(390 / 4)
  })

  it("the slide starts no faster than a finger's own swipe of a day, and is still quick", () => {
    vi.useFakeTimers()
    setW(400); view.setWeekJump('mon')
    beginGlide(mkRoot(390))!()
    vi.advanceTimersByTime(32)
    const t = byZ(40).style.transition
    const ms = Number(/(\d+)ms/.exec(t)![1])
    const [x1, y1] = /cubic-bezier\(([^,]+),([^,]+),/.exec(t)!.slice(1).map(Number) as [number, number]
    /* the start speed of an eased slide is (y1 / x1) × distance / duration. A day swiped inside the week (the browser's own
       snap, measured on this build at his iPhone's size): about 2.3px a millisecond at its fastest. The old slide began at
       about 3.9 — a whole screen in its first tenth of a second, which reads as a jump. */
    const start = (y1 / x1) * 390 / ms
    expect(start, `starts at ${start.toFixed(2)}px/ms`).toBeLessThanOrEqual(2.5)
    expect(ms, 'and is over within the time of a day swiped by hand').toBeLessThanOrEqual(400)
    vi.runAllTimers()
  })
})
