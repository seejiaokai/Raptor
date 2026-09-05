/* GLIDE ACROSS WEEKS (owner, 23 Aug 26). The phone view/edit week is a
   scroll-snap carousel, one day per screen. Crossing a week boundary swaps all
   seven day cards AND teleports the scroll to the near edge in the same instant
   — which read as a jarring reload-flash rather than a continuous swipe. This
   slides the crossing instead: TWO frozen one-day snapshots — the week being
   LEFT (on the day the finger was on) and the week ARRIVING (on its landing
   day) — tile the viewport and slide across it, the old one out in the swipe
   direction, the new one in from the other side. The real week stays painted
   but COVERED behind them for the length of the slide and is uncovered,
   re-landed, once they come off. The eye tracks one continuous horizontal
   motion; the heavy week swap has already happened underneath.

   WHY CLONES FOR BOTH SIDES, not just the outgoing one (owner, 24 Aug 26 — "I
   can see it scrolling through the week in a fast motion … don't even show me
   that"): the earlier cut slid the LIVE incoming week, which still carried the
   flick's leftover fling, so the browser scrolled it through Tue/Wed… behind the
   panel. A frozen clone cannot scroll or fling; covering the live week (and
   taking its touches away) means there is no scrollable element on screen
   during the slide, so nothing can scrub. See the body for the layout-force and
   direction-derived landing that keep the incoming clone on the right day.

   WHY EACH CLONE IS ONE DAY CARD, PAINTED BEFORE IT MOVES (owner, 5 Sep 26,
   16:46 recording — "the top part swipe is like split animation"): the clones
   used to be the WHOLE week's markup clipped to one day, and the arriving one
   started a full screen off-screen and slid in from there. The phone paints a
   composited layer's tiles on its main thread, and paints nothing for a layer
   that is off-screen — so the arriving clone entered with its tiles still being
   painted, top first, and for the length of the slide its lower part was a
   hole: the real week (painted underneath since the 16:02 fix the same day; the
   page background before it) showed through, sitting still while the top slid
   — a card split in two. Two changes close it: each clone carries ONLY the day
   card it shows (a seventh of the markup, and nothing off to the sides for the
   browser to paint ahead into), and BOTH clones are inserted on-screen over the
   week — the arriving one underneath the leaving one — and left there for two
   frames so the browser paints them while they are covered; only then does the
   arriving clone jump to its start and slide in, in ONE style update, so at no
   point is it committed as a still, off-screen, unpainted layer. The clones
   also carry the page background, so a short day (a ground Sunday) never lets
   the taller real day underneath show below its card.

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
   A glide takes the real week's touches (pointer-events:none) and clips the page
   (body.overflowX:hidden), and restores both when it ends. If a SECOND cross
   fires while the first is still sliding, the naive "capture root.style on the
   way in, put it back on the way out" corrupts itself: the second glide reads
   the ALREADY-set values as its baseline and restores to them, leaving the
   week untouchable and the page clipped until a reload. So the baseline is
   captured ONCE, when the first glide of a burst starts (inFlight 0→1), and
   restored ONCE, when the last finishes (→0) — to the MOST RECENT cross's
   landing, tracked here so out-of-order finishes still land the right week.
   This module is the only writer of these two styles, so the captured baseline
   is always their real pre-glide value. */
let inFlight = 0
let savedPE: string | null = null
let savedOverflowX: string | null = null
let lastRoot: HTMLElement | null = null
let lastLanded = 0

/* two animation frames from now — one for the browser to paint, one to commit it;
   a setTimeout stand-in where rAF is missing (jsdom) so the clone never leaks */
function afterTwoFrames(fn: () => void) {
  const raf = typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame.bind(window) : null
  if (!raf) { setTimeout(fn, 32); return }
  raf(() => raf(fn))
}
function reducedMotion() {
  /* jsdom has no matchMedia; treat its absence as "motion allowed" */
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

/* What a clone shows: ONE day card's markup, and how far (px) to nudge it so it
   sits at exactly the pixel the full week shows it at when scrolled to `x`. A
   week with no day cards falls back to its whole markup parked by scroll. */
type Snapshot = { html: string; shift: number; park: number }

/* The day card a scroll offset `x` parks on, by the week's live day pitch.
   `wholeDay` snaps to the nearest whole card (the LEAVING clone: a finger that
   let go mid-scroll freezes on one clean day, not a two-day sliver); otherwise
   the residual between the card's own offset and `x` is kept as `shift`, so the
   ARRIVING clone sits pixel-for-pixel where the real week will land it. In a
   one-card clone the card sits at the week's own padding (where card 0 sits in
   the real week), so the nudge is `card.k − x` relative to card 0. */
function snapshot(week: HTMLElement, x: number, wholeDay: boolean): Snapshot {
  const ds = week.querySelectorAll<HTMLElement>('.day:not(.peek)')
  if (!ds.length) return { html: week.innerHTML, shift: 0, park: x }
  const step = ds.length > 1 ? ds[1]!.offsetLeft - ds[0]!.offsetLeft : 0
  const k = step > 0 ? Math.max(0, Math.min(ds.length - 1, Math.round(x / step))) : 0
  const at = ds[k]!.offsetLeft - ds[0]!.offsetLeft          // card k's offset in the week's content
  return { html: ds[k]!.outerHTML, shift: wholeDay ? 0 : at - x, park: 0 }
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
  const outSnap = snapshot(root, root.scrollLeft, true)   // the day the finger was on, frozen
  const w = rect.width
  const fwd = dir === 'mon'                   // forward: new IN from the right, old OUT to the left

  return () => {
    /* Build a FROZEN one-day snapshot of a week: a fixed-position clone holding
       the one day card it shows, that cannot itself scroll.
       - overflow:hidden + scroll-behavior:auto → a parked scrollLeft (the
         no-day-cards fallback) is an instant clip, never an animated scroll,
         and the clone can never fling.
       - z-index 40/41 sits BELOW the sticky top bar (.topbar z-index:60): the
         clone is anchored at the week's rect.top, which is above the bar once
         the page is scrolled, so at 60 it tied the bar and, appended last,
         painted OVER it (owner, 23 Aug 26 — "bleeding at the top bar"). The
         slide is page content; keep it under the chrome. The LEAVING clone is
         the higher of the two so the arriving one can pre-paint underneath it.
       - background:var(--bg) — the page ground behind the week — so the clone
         is opaque edge to edge: below a short day card the real week's taller
         day would otherwise show through. (The body's faint top gradients reach
         at most the week's first rows, which the card itself covers.)
       - will-change + a resting transform give the clone its own compositor
         layer from the first frame, so it is painted where it is inserted. */
    const mkClone = (s: Snapshot, z: number) => {
      const c = document.createElement('div')
      c.className = root.className
      c.style.cssText =
        `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;` +
        `height:${rect.height}px;margin:0;overflow:hidden;pointer-events:none;z-index:${z};` +
        `scroll-behavior:auto;background:var(--bg);will-change:transform;transform:translateX(0)`
      c.innerHTML = s.html
      const card = c.firstElementChild as HTMLElement | null
      if (card && s.shift) card.style.marginLeft = `${s.shift}px`
      document.body.appendChild(c)
      if (s.park) {
        void c.offsetWidth                        // force layout so the day cards have width before we scroll
        c.scrollLeft = s.park                     // instant clip (overflow:hidden → cannot animate or fling)
      }
      return c
    }

    /* TWO frozen clones tile the viewport for the whole slide, and the REAL week
       stays put behind them — never transformed, never uncovered until the end.
       This is the fix for the owner's 24 Aug 26 report ("I can see it scrolling
       through the week in a fast motion … don't even show me that"): the week
       the swipe LANDS on inherits the flick's leftover fling, and earlier
       versions slid that live element, so the fling scrolled it through Tue/Wed…
       behind the panel. Sliding a STILL clone of the incoming week instead means
       there is no live element on screen to fling — nothing to fight, nothing to
       scrub. The real week is simply re-landed and uncovered once the clones come
       off (its fling has died by then).
         out  — the week being LEFT, frozen on the day the finger was on (its
                scroll snapped to a whole day so a mid-scroll release shows one
                clean day).
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
    const inc = mkClone(snapshot(root, landed, false), 40)   // underneath …
    const out = mkClone(outSnap, 41)                          // … the leaving day, on top
    /* COVER the real week for the length of the slide — never hide it. The two
       clones tile the viewport edge to edge, so the live week — which the
       browser's fling can still drag, and whose `sun` landing the phone snap
       does not always hold — is never SEEN at a half-scrolled or wrong-day
       position; pointer-events:none keeps a second finger off it while the
       clones are up (the clones themselves take no touches), so there is still
       nothing on screen to scrub. It used to be visibility:hidden (5 Sep 26,
       the owner's 16:02 recording): a hidden element is never painted, so the
       week came back from the reveal with no tiles at all and the phone drew it
       in from the top over ~0.4 s — the lower half black. Painted under the
       clones, it is ready when they come off. The pre-glide styles are captured
       ONCE per burst (see the module baseline above) so an overlapping second
       cross can't read the already-set values as its baseline. */
    if (inFlight === 0) {
      savedPE = root.style.pointerEvents
      savedOverflowX = document.body.style.overflowX
    }
    inFlight++
    lastRoot = root; lastLanded = landed        // the most recent cross owns the final landing
    root.style.pointerEvents = 'none'
    document.body.style.overflowX = 'hidden'

    let done = false
    const finish = () => {
      if (done) return
      done = true
      out.remove()
      /* only the LAST glide of a burst re-lands the real week and uncovers it —
         a still-sliding earlier/later glide keeps root covered by its own
         clones. It re-lands the MOST RECENT cross's target (lastLanded), so an
         out-of-order finish can't leave the week on a stale day. */
      if (--inFlight > 0) { inc.remove(); return }
      const r = lastRoot || root
      const wasSB = r.style.scrollBehavior
      r.style.scrollBehavior = 'auto'
      r.scrollLeft = lastLanded
      r.style.scrollBehavior = wasSB
      r.style.pointerEvents = savedPE ?? ''          // the settled week takes touches again
      document.body.style.overflowX = savedOverflowX ?? ''
      savedPE = savedOverflowX = null; lastRoot = null
      /* the incoming clone is the landed week's own picture, so it stays on top
         for two more frames while the browser commits the real week's paint
         underneath — then comes off over identical pixels, never over black */
      afterTwoFrames(() => inc.remove())
    }

    /* PRE-PAINT, THEN SLIDE. Both clones were inserted on-screen, over the week,
       the arriving one under the leaving one — for two frames the screen shows
       only the leaving day, exactly as before the swap, while the browser paints
       both layers where they stand. Then, in ONE style update: the arriving clone
       jumps to its start one screen off in the swipe direction (transition off,
       the jump committed as the transition's "from" by the forced style read),
       and both are sent on their way. The browser never sees the arriving clone
       as a still, off-screen layer — it is either on-screen or animating, so its
       tiles are painted before a single pixel of it moves (the 16:46 split). At
       every point in the slide the two clones meet edge-to-edge (out's trailing
       edge == inc's leading edge), so they cover the whole viewport — the real
       week behind them is never revealed. */
    afterTwoFrames(() => {
      if (done) return
      inc.style.transition = 'none'; inc.style.transform = `translateX(${fwd ? w : -w}px)`
      void getComputedStyle(inc).transform
      const ease = `transform ${DUR}ms cubic-bezier(.22,.61,.36,1)`
      out.style.transition = ease; out.style.transform = `translateX(${fwd ? -w : w}px)`
      inc.style.transition = ease; inc.style.transform = 'translateX(0)'
      inc.addEventListener('transitionend', finish, { once: true })
      setTimeout(finish, DUR + 120)             // fallback if transitionend never fires
    })
  }
}
