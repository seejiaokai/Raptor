/* GLIDE ACROSS WEEKS (owner, 23 Aug 26). The phone view/edit week is a
   scroll-snap carousel, one day per screen. Crossing a week boundary swaps all
   seven day cards AND teleports the scroll to the near edge in the same instant
   — which read as a jarring reload-flash rather than a continuous swipe. This
   slides the crossing instead: TWO frozen one-day snapshots — the week being
   LEFT (on the day the finger was on) and the week ARRIVING (on its landing
   day) — tile the viewport and slide across it, the old one out in the swipe
   direction, the new one in from the other side. The real week is hidden behind
   them for the length of the slide and revealed, re-landed, once they come off.
   The eye tracks one continuous horizontal motion; the heavy week swap has
   already happened underneath.

   WHY CLONES FOR BOTH SIDES, not just the outgoing one (owner, 24 Aug 26 — "I
   can see it scrolling through the week in a fast motion … don't even show me
   that"): the earlier cut slid the LIVE incoming week, which still carried the
   flick's leftover fling, so the browser scrolled it through Tue/Wed… behind the
   panel. A frozen clone cannot scroll or fling; hiding the live week means there
   is no scrollable element on screen at all during the slide, so nothing can
   scrub. See the body for the layout-force and direction-derived landing that
   keep the incoming clone on the right day.

   PHONE ONLY, and only on a real week CROSS. Desktop lands instant — its arrows
   step weeks and the wide free-scroll week (multiple days visible) never showed
   the single-screen flash (CLAUDE.md §Week navigation). Within-week day-to-day
   swipes are untouched: this fires only on a Monday/Sunday landing, never on an
   ordinary scroll-hold repaint.

   The clones are pure DOM — no engine recompute, no second week held live — and
   both are removed the instant the slide ends. It does NOT lock the swipe to one
   day: a firmer flick still crosses several days within a week exactly as before. */
import { WEEKJUMP } from '../state/view'
import { weekScrollMax } from './pan'

const DUR = 280

/* OVERLAPPING GLIDES share ONE baseline (owner-scale robustness, 24 Aug 26).
   A glide hides the real week (visibility:hidden) and clips the page
   (body.overflowX:hidden), and restores both when it ends. If a SECOND cross
   fires while the first is still sliding, the naive "capture root.style on the
   way in, put it back on the way out" corrupts itself: the second glide reads
   the ALREADY-hidden values as its baseline and restores to hidden, leaving the
   week blank and the page clipped until a reload. So the baseline is captured
   ONCE, when the first glide of a burst starts (inFlight 0→1), and restored ONCE,
   when the last finishes (→0) — to the MOST RECENT cross's landing, tracked here
   so out-of-order finishes still land the right week. This module is the only
   writer of these two styles, so the captured baseline is always their real
   pre-glide value. */
let inFlight = 0
let savedVis: string | null = null
let savedOverflowX: string | null = null
let lastRoot: HTMLElement | null = null
let lastLanded = 0

function reducedMotion() {
  /* jsdom has no matchMedia; treat its absence as "motion allowed" */
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

/* Call at the TOP of the week's repaint effect, BEFORE the new markup is
   written, so it can clone the week being left. Returns a run() to fire AFTER
   the landing scroll has been set, or null when no glide applies — not a week
   cross, desktop, no layout (jsdom / not painted), or reduced-motion. A null
   return is the common case and costs only a couple of property reads. */
export function beginGlide(root: HTMLElement): (() => void) | null {
  const dir = WEEKJUMP                       // read before the effect consumes it
  if (dir !== 'mon' && dir !== 'sun') return null
  if (window.innerWidth > 820) return null
  if (reducedMotion()) return null
  const rect = root.getBoundingClientRect()
  if (!rect.width) return null               // headless / not laid out — no-op
  const html = root.innerHTML                // the outgoing week, frozen
  const sl = root.scrollLeft
  const w = rect.width
  const fwd = dir === 'mon'                   // forward: new IN from the right, old OUT to the left

  return () => {
    /* Build a FROZEN one-day snapshot of a week: a fixed-position clone parked
       on a whole day, that cannot itself scroll.
       - overflow:hidden + scroll-behavior:auto → the parked scrollLeft is an
         instant clip, never an animated scroll, and the clone can never fling.
       - z-index 40 sits BELOW the sticky top bar (.topbar z-index:60): the clone
         is anchored at the week's rect.top, which is above the bar once the page
         is scrolled, so at 60 it tied the bar and, appended last, painted OVER
         it (owner, 23 Aug 26 — "bleeding at the top bar"). The slide is page
         content; keep it under the chrome.
       - parkSl is snapped to the nearest whole day so a finger that let go
         mid-scroll freezes on ONE clean day, not a two-day sliver. */
    const mkClone = (innerHTML: string, parkSl: number) => {
      const c = document.createElement('div')
      c.className = root.className
      c.style.cssText =
        `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;` +
        `height:${rect.height}px;margin:0;overflow:hidden;pointer-events:none;z-index:40;` +
        `scroll-behavior:auto`
      c.innerHTML = innerHTML
      document.body.appendChild(c)
      void c.offsetWidth                          // force layout so the day cards have width before we scroll
      c.scrollLeft = parkSl                       // instant clip (overflow:hidden → cannot animate or fling)
      return c
    }
    /* snap a scroll offset to the nearest whole day using root's live day pitch */
    const rd = root.querySelectorAll('.day:not(.peek)')
    const step = rd.length > 1 ? (rd[1] as HTMLElement).offsetLeft - (rd[0] as HTMLElement).offsetLeft : 0
    const snap = (x: number) => (step > 0 ? Math.round(x / step) * step : x)

    /* TWO frozen clones tile the viewport for the whole slide, and the REAL week
       stays put behind them — never transformed, never shown until the end. This
       is the fix for the owner's 24 Aug 26 report ("I can see it scrolling
       through the week in a fast motion … don't even show me that"): the week
       the swipe LANDS on inherits the flick's leftover fling, and earlier
       versions slid that live element, so the fling scrolled it through Tue/Wed…
       behind the panel. Sliding a STILL clone of the incoming week instead means
       there is no live element on screen to fling — nothing to fight, nothing to
       scrub. The real week is simply re-landed and revealed once the clones come
       off (its fling has died by then).
         out  — the week being LEFT, frozen on the day the finger was on (sl,
                snapped to a whole day so a mid-scroll release shows one clean day).
         inc  — the freshly-loaded week, frozen on its LANDING day. Derived from
                the cross DIRECTION, not the live scrollLeft: a forward cross
                lands Monday (0), a `sun` cross back lands the last day
                (weekScrollMax). The live scrollLeft is unreliable here — the
                phone snap does not always hold the far edge the instant the
                landing is written — so reading it risked freezing the clone on
                the wrong day and jumping when the clones came off. The finish
                re-lands the real week to this SAME target, so clone and week
                always agree. */
    void root.offsetWidth                          // force root's new-week layout before measuring its scroll ceiling
    const landed = fwd ? 0 : weekScrollMax(root)
    const out = mkClone(html, snap(sl))
    const inc = mkClone(root.innerHTML, landed)
    /* HIDE the real week for the length of the slide. The two clones are the
       only thing on screen, so the live week — which the browser's fling can
       still drag, and whose `sun` landing the phone snap does not always hold —
       is never seen at a half-scrolled or wrong-day position. It keeps its box
       (visibility, not display) so nothing reflows, and is revealed, re-landed,
       when the clones come off. The pre-glide styles are captured ONCE per burst
       (see the module baseline above) so an overlapping second cross can't read
       the already-hidden values as its baseline and restore to hidden. */
    if (inFlight === 0) {
      savedVis = root.style.visibility
      savedOverflowX = document.body.style.overflowX
    }
    inFlight++
    lastRoot = root; lastLanded = landed        // the most recent cross owns the final landing
    root.style.visibility = 'hidden'
    document.body.style.overflowX = 'hidden'

    /* start: outgoing clone covering the viewport, incoming clone one screen off
       in the swipe direction. Transitions off so the browser paints this start
       frame before the slide begins. At every point in the slide the two clones
       meet edge-to-edge (out's trailing edge == inc's leading edge), so they
       cover the whole viewport — the real week behind them is never revealed. */
    out.style.transition = 'none'; out.style.transform = 'translateX(0)'
    inc.style.transition = 'none'; inc.style.transform = `translateX(${fwd ? w : -w}px)`

    requestAnimationFrame(() => {
      const ease = `transform ${DUR}ms cubic-bezier(.22,.61,.36,1)`
      out.style.transition = ease; out.style.transform = `translateX(${fwd ? -w : w}px)`
      inc.style.transition = ease; inc.style.transform = 'translateX(0)'
    })

    let done = false
    const finish = () => {
      if (done) return
      done = true
      out.remove(); inc.remove()
      /* only the LAST glide of a burst re-lands the real week and reveals it —
         a still-sliding earlier/later glide keeps root hidden behind its own
         clones. It re-lands the MOST RECENT cross's target (lastLanded), so an
         out-of-order finish can't leave the week on a stale day. */
      if (--inFlight > 0) return
      const r = lastRoot || root
      const wasSB = r.style.scrollBehavior
      r.style.scrollBehavior = 'auto'
      r.scrollLeft = lastLanded
      r.style.scrollBehavior = wasSB
      r.style.visibility = savedVis ?? ''            // reveal the settled week
      document.body.style.overflowX = savedOverflowX ?? ''
      savedVis = savedOverflowX = null; lastRoot = null
    }
    inc.addEventListener('transitionend', finish, { once: true })
    setTimeout(finish, DUR + 120)             // fallback if transitionend never fires
  }
}
