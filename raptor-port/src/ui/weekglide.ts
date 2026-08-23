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
       when the clones come off. */
    const prevVis = root.style.visibility
    root.style.visibility = 'hidden'

    /* the one-screen offset would otherwise widen the page — clip it for the
       length of the slide, then restore whatever was there */
    const prevOverflowX = document.body.style.overflowX
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
      /* re-land the real week (any leftover fling has died by now) and reveal it
         by taking the clones off. smooth briefly off so the re-land is instant. */
      const wasSB = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      root.scrollLeft = landed
      root.style.scrollBehavior = wasSB
      root.style.visibility = prevVis            // reveal the settled week
      document.body.style.overflowX = prevOverflowX
      out.remove(); inc.remove()
    }
    inc.addEventListener('transitionend', finish, { once: true })
    setTimeout(finish, DUR + 120)             // fallback if transitionend never fires
  }
}
