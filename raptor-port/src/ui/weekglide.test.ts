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
    vi.advanceTimersByTime(400)
    expect(root.style.pointerEvents, 'the settled week takes touches again').toBe('')
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
    expect(document.body.style.overflowX, 'the page clip is lifted').toBe('')
    expect(document.querySelectorAll('body > .week').length, 'all four clones cleaned up').toBe(1)
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
})
