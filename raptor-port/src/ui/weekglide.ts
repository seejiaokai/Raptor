/* GLIDE ACROSS WEEKS (owner, 23 Aug 26). The phone view/edit week is a
   scroll-snap carousel, one day per screen. Crossing a week boundary swaps all
   seven day cards AND teleports the scroll to the near edge in the same instant
   — which read as a jarring reload-flash rather than a continuous swipe. This
   slides the crossing instead: the week the scheduler is LEAVING is cloned into
   a throwaway overlay frozen where the finger left it, and as the freshly-loaded
   week glides in from the direction of the swipe, the clone glides out the other
   side. The eye tracks one continuous horizontal motion; the heavy week swap has
   already happened underneath.

   PHONE ONLY, and only on a real week CROSS. Desktop lands instant — its arrows
   step weeks and the wide free-scroll week (multiple days visible) never showed
   the single-screen flash (CLAUDE.md §Week navigation). Within-week day-to-day
   swipes are untouched: this fires only on a Monday/Sunday landing, never on an
   ordinary scroll-hold repaint.

   The clone is pure DOM — no engine recompute, no second week held live — and it
   is removed the instant the slide ends. It does NOT lock the swipe to one day:
   a firmer flick still crosses several days within a week exactly as before. */
import { WEEKJUMP } from '../state/view'

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
    const ghost = document.createElement('div')
    ghost.className = root.className
    /* z-index 40, BELOW the sticky top bar (scheduler.css .topbar z-index:60).
       The clone is fixed-positioned from the week's rect.top, which sits ABOVE
       the bar once the page is scrolled down — so at z-index:60 it tied the bar
       and, being appended to <body> last, painted the sliding week OVER the bar
       for the length of the slide (owner, 23 Aug 26 — "bleeding at the top bar
       when swiping"). The slide is page content and belongs under the chrome:
       any value under 60 lets the bar cover it while still floating the clone
       above the ordinary day cards it slides across. */
    /* scroll-behavior:auto is LOAD-BEARING, not tidiness. The clone carries the
       week's own class, and `.week` sets scroll-behavior:smooth — so the
       `ghost.scrollLeft = sl` below was being ANIMATED, not applied: the clone
       started at 0 (Monday) and smooth-scrolled toward Sunday over a few hundred
       ms, so the outgoing week visibly rolled through Tuesday, Wednesday,
       Thursday… WHILE it slid off screen (owner, 23 Aug 26 — "artifacts bleeding
       between weeks"). The clone must be FROZEN on the day the finger left, so
       its park is an instant jump, exactly as the incoming week's landing forces
       scroll-behavior:auto for the same reason (ViewWeek/EditWeek). Same root
       cause the pan.ts hsSet note calls out: a direct scrollLeft on a .week is
       animated unless the element opts out. */
    ghost.style.cssText =
      `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;` +
      `height:${rect.height}px;margin:0;overflow:hidden;pointer-events:none;z-index:40;` +
      `scroll-behavior:auto`
    ghost.innerHTML = html
    document.body.appendChild(ghost)
    ghost.scrollLeft = sl                     // park the clone where the finger left it (instant, per above)

    /* start: new week parked one screen off in the swipe direction, clone in
       place. Both set with transitions off so the browser paints the start
       frame (clone covering the viewport) before the slide begins. */
    root.style.transition = 'none'
    root.style.transform = `translateX(${fwd ? w : -w}px)`
    ghost.style.transition = 'none'
    ghost.style.transform = 'translateX(0)'
    /* the one-screen offset would otherwise widen the page — clip it for the
       length of the slide, then restore whatever was there */
    const prevOverflowX = document.body.style.overflowX
    document.body.style.overflowX = 'hidden'

    requestAnimationFrame(() => {
      const ease = `transform ${DUR}ms cubic-bezier(.22,.61,.36,1)`
      root.style.transition = ease
      root.style.transform = 'translateX(0)'
      ghost.style.transition = ease
      ghost.style.transform = `translateX(${fwd ? -w : w}px)`
    })

    let done = false
    const finish = () => {
      if (done) return
      done = true
      root.style.transition = ''
      root.style.transform = ''
      document.body.style.overflowX = prevOverflowX
      ghost.remove()
    }
    ghost.addEventListener('transitionend', finish, { once: true })
    setTimeout(finish, DUR + 120)             // fallback if transitionend never fires
  }
}
