/* Week panning — the reference's horizontal-scroll block, bodies verbatim:
   the ‹ › arrows (one click = exactly one day box), shift+wheel, the pinned
   proxy scrollbar at the foot of the window (two-way sync with no ownership
   lock — see the B33 note), the palette following the visible day, the day
   dots on a phone, and the wave blocks in a day mirroring each other's
   sideways swipe. */
import * as view from '../state/view'
import { notify, loadWeek } from '../state/store'
import { CURWEEK } from '../engine/waves'
import { shiftWeek } from './weeknav'
import { mountPeek } from './peek'

const $ = (id: string) => document.getElementById(id) as HTMLElement | null

/* ---- week horizontal-scroll arrows ---- */
function activeWeekEl() { return view.CURPAGE === 'editsched' ? $('eWeek') : $('vWeek') }
export function updateWeekNav() {
  const on = (view.CURPAGE === 'viewsched' || view.CURPAGE === 'editsched') && window.innerWidth > 820
  const p = $('weekPrev'), n = $('weekNext')
  if (p) (p as any).hidden = !on
  if (n) (n as any).hidden = !on
  hsSync()
}
/* one click = exactly one day box. Measured from the live layout (box + gap) so
   it stays right whatever the day width is, and it lands ON a day boundary
   rather than drifting by a fraction of a box each time. `:not(.peek)` — the
   desktop next-week preview (ui/peek.ts) appends inert trailing day sections
   after the real seven; every count/step here means the LIVE week only, the
   same way `.day[data-day]` selectors already exclude peek by construction
   (peek nodes carry `data-peek-day`, never `data-day`). */
function dayStep(w: any) {
  const ds = w.querySelectorAll('.day:not(.peek)')
  if (ds.length > 1) return Math.round(ds[1].offsetLeft - ds[0].offsetLeft)
  if (ds.length === 1) return Math.round(ds[0].getBoundingClientRect().width + 14)
  return Math.round(w.clientWidth * 0.9)
}
/* THE LIVE WEEK'S OWN SCROLL CEILING — the scroll position that brings the LAST
   live day (Sunday) to the FRONT (left) of the strip. On a phone that is just
   `scrollWidth - clientWidth` (one day fills the screen, so front == the far
   end) and this function must never change what a phone measures — the exact
   byte-for-byte expression it always has.

   On desktop it USED to mean "Sunday jammed flush against the RIGHT edge"
   (last.offsetLeft + width + padding − clientWidth). That is why the weekend
   was unreachable (owner, 23 Aug 26 — "Friday not aligned on the far left …
   Saturday and Sunday out of selection"): with three day-columns to a screen,
   Sunday-flush-right left FRIDAY at the front, so the arrow that stepped up to
   this ceiling could never walk Saturday or Sunday to the front to crew them,
   and the final press only nudged before crossing (the "2 arrows to next
   week"). The next-week preview's real columns (ui/peek.ts) are the runway
   that makes Sunday-at-the-front a whole-screen view rather than a void, so the
   ceiling is now Sunday's own front position: `(liveDays − 1) × dayStep`,
   clamped to the actual scroll range. The arrows below walk every live day to
   the front and cross only past this; the `sun` landing (crossing BACK a week)
   lands Sunday at the front too, symmetric with `mon` landing Monday there. */
export function weekScrollMax(w: any): number {
  if (window.innerWidth <= 820) return Math.max(0, w.scrollWidth - w.clientWidth)
  const ds = w.querySelectorAll('.day:not(.peek)')
  const cap = Math.max(0, w.scrollWidth - w.clientWidth)
  if (ds.length < 2) return cap
  const step = Math.round((ds[1] as HTMLElement).offsetLeft - (ds[0] as HTMLElement).offsetLeft)
  if (step <= 0) return cap
  return Math.min(cap, (ds.length - 1) * step)
}
/* COUNT FROM WHERE THE LAST PRESS WAS HEADING, NOT THE LIVE SCROLL (owner, 23
   Aug 26 — "twice on Tuesday to get to Wednesday"). An arrow scroll is a ~300ms
   smooth glide, so a second press that lands before it finishes read a
   half-finished scrollLeft and stepped less than a whole day — so it took two
   presses to advance one. We remember the position the last press COMMANDED,
   and while the glide is still in flight toward it (scrollLeft strictly between
   where that press started and where it is going) the next press counts from
   the destination — one press, one day, however fast the taps come. The moment
   the glide arrives, or the strip is repositioned any other way (a manual
   scroll lands outside that in-flight span, a new week zeroes panWk), the live
   scrollLeft takes over again. */
let panWk: string | null = null
let panPrev = -1, panTgt = -1
function panBase(w: any): number {
  const sl = w.scrollLeft
  if (panWk !== CURWEEK || panTgt < 0) return sl
  const lo = Math.min(panPrev, panTgt), hi = Math.max(panPrev, panTgt)
  return (sl > lo && sl < hi) ? panTgt : sl     // mid-glide → count from the destination
}
/* One click = one WHOLE day box, landing on the boundary. Rounding to the
   nearest day would stall on a click when the view sits mid-day, so step from
   the day you are leaving: floor going right, ceil going left. */
export function panDays(dir: number) {
  const w = activeWeekEl(); if (!w) return
  /* the st guard stays FIRST: an un-stubbed jsdom week measures no step, and
     without it every test's arrow click would read as "at the edge" below and
     week-jump */
  const st = dayStep(w); if (!st) return
  /* CONTINUOUS ACROSS WEEKS (owner, 23 Aug 26): an arrow pressed while the last
     live day already sits at the front crosses into the neighbouring week — the
     same edge-cross the phone swipe does, landing via WEEKJUMP in the load's
     own repaint. */
  /* the LIVE week's own end — weekScrollMax is now "Sunday at the FRONT" on
     desktop (see there), so the arrow WALKS every live day — Monday through
     Sunday — to the front across the next-week preview's runway, and crosses
     only once you press past Sunday. Before this it stopped with Sunday jammed
     right and the weekend never reached the front (owner: "Saturday and Sunday
     out of selection"). Identical to the old flush-end on a phone, where
     `.peek` never renders and one day fills the screen. */
  const max = weekScrollMax(w)
  const base = panBase(w)
  if (dir > 0 && base >= max - 1) { view.setWeekJump('mon'); panWk = null; loadWeek(shiftWeek(CURWEEK, 1)); return }
  if (dir < 0 && base <= 1) { view.setWeekJump('sun'); panWk = null; loadWeek(shiftWeek(CURWEEK, -1)); return }
  const n = w.querySelectorAll('.day:not(.peek)').length || 1
  const at = base / st
  const cur = dir > 0 ? Math.floor(at + 0.02) : Math.ceil(at - 0.02)
  const tgt = Math.max(0, Math.min(n - 1, cur + dir)) * st
  const dest = Math.min(tgt, max)
  panWk = CURWEEK; panPrev = base; panTgt = dest
  w.scrollTo({ left: dest, behavior: 'smooth' })
}

/* ---- sticky bottom horizontal scroll bar (desktop) ----
   A proxy track pinned to the bottom of the viewport that scrolls the active
   week. Kept in two-way sync with the week's own scrollLeft. */
/* B33 · the two-way sync no longer needs an ownership lock at all.
   The loop is self-terminating if the two mappings are exact inverses, which
   they are: track→week is trk/tmax*wmax and week→track is week/wmax*tmax. So a
   write only has to be suppressed when the element is ALREADY where it belongs.
   Round-trip rounding error is bounded by 0.5 + 0.5*(tmax/wmax) and tmax/wmax =
   trackWidth/weekWidth < 1, so it never exceeds 1px — HS_EPS=1.5 stops the
   bounce after one hop while still passing every real move through 1:1. */
const HS_EPS = 1.5
/* behavior must be 'instant', NOT 'auto'. 'auto' means "obey the element's CSS"
   and .week carries scroll-behavior:smooth — so every mirror write was being
   ANIMATED. 'instant' applies the position in the same tick, which is what a
   scrollbar is. Returns true when it actually moved anything. */
export function hsSet(el: any, px: number) {
  if (!el) return false
  const max = Math.max(0, el.scrollWidth - el.clientWidth)
  px = Math.max(0, Math.min(max, Math.round(px)))
  if (Math.abs(el.scrollLeft - px) <= HS_EPS) return false   // already in sync — do not echo
  try { el.scrollTo({ left: px, behavior: 'instant' }) } catch (e) { el.scrollLeft = px }
  if (Math.abs(el.scrollLeft - px) > HS_EPS) el.scrollLeft = px // browser ignored 'instant'
  return true
}
function hsWeek() {
  const sb = $('schedBoard')
  if (sb && !(sb as any).hidden) return null
  if (view.CURPAGE !== 'viewsched' && view.CURPAGE !== 'editsched') return null
  const w = activeWeekEl()
  return (w && w.offsetParent !== null) ? w : null
}
/* SIZE THE WEEK'S TRAILING SPACER (scheduler.css `.week::after`). On a wide
   desktop the week's own width stops with a middle day pinned left, so the last
   days can't reach the front and the arrow crosses weeks off a broken sliver.
   The right amount of trailing scroll room is "round the natural end UP to one
   whole day": then the final stop is a clean Fri | Sat | Sun with no sliver and
   no empty void. That depends on the live day width and the viewport, so it is
   measured here and handed to CSS as a pixel var, rather than guessed as a
   fixed calc(). Desktop only, and only when real day columns are laid out to
   measure — otherwise the spacer is cleared. */
function setWeekTail(w: any) {
  /* THE PEEK PREVIEW JOINS THE MEASUREMENT (ui/peek.ts). The preview's real
     day columns carry the week past Sunday, but the whole-day-end guarantee
     this spacer exists for still applies at the strip's NEW far end: with no
     tail, jamming the free scroll fully right would land on a fractional
     preview column — the exact sliver the owner had removed. `.day` below
     already includes the peek columns (same 552px flex-basis), so the same
     round-the-end-up-to-one-whole-day arithmetic covers 7 live or 7+7
     live-plus-preview columns without a special case. */
  const ds = w.querySelectorAll('.day')
  if (window.innerWidth <= 820 || ds.length < 2) { w.style.removeProperty('--week-tail'); return }
  const cs = getComputedStyle(w)
  const step = Math.round(ds[1].offsetLeft - ds[0].offsetLeft)
  if (step <= 0) { w.style.removeProperty('--week-tail'); return }
  const gap = parseFloat(cs.columnGap || cs.gap) || 0
  const padR = parseFloat(cs.paddingRight) || 0
  const last = ds[ds.length - 1] as HTMLElement
  /* where the week would clamp with no spacer: the last day's right edge (plus
     the container's own trailing padding), less one screen. Round that UP to a
     whole day so the day at the front is never a fraction; the spacer makes up
     the difference, less the flex gap the ::after itself sits behind. */
  const naturalMax = Math.max(0, (last.offsetLeft + last.offsetWidth + padR) - w.clientWidth)
  const targetMax = Math.ceil(naturalMax / step) * step
  const tail = Math.max(0, targetMax - naturalMax - gap)
  if (tail > 0.5) w.style.setProperty('--week-tail', Math.round(tail) + 'px')
  else w.style.removeProperty('--week-tail')
}
export function hsSync() {
  const bar = $('hscroll'), trk = $('hsTrack'), inn = $('hsIn'), lbl = $('hsLbl')
  if (!bar || !trk) return
  const w = hsWeek()
  if (w) setWeekTail(w)
  const over = w ? (w.scrollWidth - w.clientWidth) : 0
  const on = !!w && window.innerWidth > 820 && over > 12
  bar.classList.toggle('on', on)
  if (!on) return
  const r = w!.getBoundingClientRect()
  bar.style.left = Math.max(0, Math.round(r.left)) + 'px'
  bar.style.width = Math.round(r.width) + 'px'
  // proportional thumb: make the proxy's scrollable width mirror the week's,
  // scaled to the track width, so 1px of thumb travel maps linearly
  const tw = trk.clientWidth || 1
  /* thumb size stays proportional; the ENDS are what must line up, so travel is
     mapped overflow-to-overflow rather than by a width ratio */
  inn!.style.width = Math.round(w!.scrollWidth * (tw / w!.clientWidth)) + 'px'
  const tmax = trk.scrollWidth - trk.clientWidth
  hsSet(trk, over > 0 ? (w!.scrollLeft / over) * tmax : 0)
  lbl!.textContent = dayRangeText(w!)
}
function hsLabel() {
  const w = hsWeek(), lbl = $('hsLbl'); if (!w || !lbl) return
  lbl.textContent = dayRangeText(w)
}

/* THE "day a–b of n" READ-OUT. Measured from the real day step, NOT
   scrollWidth ÷ n: the desktop week carries a trailing spacer (scheduler.css
   `.week::after`) so the last day can reach the left edge, and that spacer is
   part of scrollWidth — dividing it by the day count would misplace every
   number. `left` is the day sitting at the front; `fit` is how many whole
   columns a screen holds; both clamp to the real day count so the spacer at
   the end reads "day 7 of 7", never "day 8". */
function dayRangeText(w: any) {
  /* the live week only — the desktop peek preview's real trailing columns
     must never inflate "day N of 7" into "day N of 14" */
  const days = w.querySelectorAll('.day:not(.peek)').length
  if (!days) return ''
  const step = dayStep(w) || 1
  const left = Math.max(0, Math.min(days - 1, Math.round(w.scrollLeft / step)))
  const fit = Math.max(1, Math.round(w.clientWidth / step))
  const a = left + 1, b = Math.min(days, left + fit)
  return a >= b ? `day ${a} of ${days}` : `day ${a}–${b} of ${days}`
}

/* THE CREW-PANEL EDGE HINT IS RETIRED (23 Aug 26). It existed because the
   very last day could never sit at the FRONT on a wide screen — the week
   clamped at Fri | Sat | Sun, so crewing Sunday needed the day-name picker or
   the panel arrows, and a one-time hint taught that. The next-week preview
   (ui/peek.ts) removed the limitation itself: real columns now continue past
   Sunday, so the arrows and the free scroll walk until Sunday IS the front
   day. The hint's own firing condition (jammed at the end with a later day
   still off the front) is unreachable now — the day name and the panel
   arrows both still work, they just no longer need teaching. */
/* the palette shows one day's availability. Panning the week changes which day
   you are looking at, so the palette walks along with it — debounced, because a
   scroll fires on every frame and rebuilding 60 pucks per frame is wasteful. */
/* the reading itself is state/view.ts's weekLeftDay — the same one setPage
   takes when it carries the day across a page switch, shared rather than
   copied so the palette and the carry can never disagree about which day is
   "the one you are looking at". ROSDAY stands in when there is nothing to
   read (no week built yet), which is what this always did. */
function weekDay() {
  const d = view.weekLeftDay(activeWeekEl())
  return d == null ? view.ROSDAY : d
}
let ROSDAY_T: any = 0
/* AN EXPLICIT DAY PICK WINS OVER THE SCROLL-FOLLOW (owner, 15 Aug 26). Clicking
   a day name or a panel arrow points the palette at a day the wide-screen week
   may not be able to scroll to the left edge — so the scroll-follow must not
   then drag it back to whatever sits at the edge. Two ways it could: a follow
   already queued from the scroll just before the pick, and one that fires from
   the scroll the pick itself settles into. So the pick CANCELS the pending
   follow and suppresses any new one for a short window; after it lapses, an
   ordinary scroll takes the palette over again, exactly as before. */
let ROSPIN_T: any = 0
export function pickRosDay(di: number) {
  clearTimeout(ROSDAY_T)
  clearTimeout(ROSPIN_T); ROSPIN_T = setTimeout(() => { ROSPIN_T = 0 }, 500)
  if (view.ROSDAY !== di) { view.setRosDay(di); notify() }
}
export function rosDayFollow() {
  if (view.ARM || ROSPIN_T) return           // an armed slot, or a just-made pick, pins the palette
  clearTimeout(ROSDAY_T)
  ROSDAY_T = setTimeout(() => { const d = weekDay(); if (d !== view.ROSDAY) { view.setRosDay(d); notify() } }, 110)
}

/* ---- the document-level listeners, verbatim wiring ---- */
/* shift+wheel pans the week. Routed through hsSet for the same reason the proxy
   is: a bare `scrollLeft +=` obeys .week{scroll-behavior:smooth}, so each notch
   started a fresh animation and the pan stuttered instead of following the wheel. */
/* This listener is registered NON-PASSIVE (it must preventDefault when it pans),
   which means the browser waits for it before every scroll step, everywhere on
   the page. So the common case — no shift held — has to cost a boolean test and
   nothing more. It used to walk the DOM (closest) on every wheel tick first,
   which a fast JIT hides completely; Edge's "enhanced security" mode runs
   unfamiliar sites without the JIT, and there that walk was a visible per-tick
   tax the scroll had to wait for (owner, 11 Aug 26 — Edge scroll stutter). */
function onWheel(e: WheelEvent) {
  if (!e.shiftKey || !e.deltaY) return
  const w = (e.target as HTMLElement).closest('.week')
  if (w) { panWk = null; hsSet(w, (w as HTMLElement).scrollLeft + e.deltaY); e.preventDefault() }  // a manual wheel-pan drops the arrow's in-flight target
}
function onTrackScroll() {
  const w = hsWeek(); if (!w) return
  const trk = $('hsTrack')!
  const tmax = trk.scrollWidth - trk.clientWidth
  const wmax = w.scrollWidth - w.clientWidth
  hsSet(w, tmax > 0 ? (trk.scrollLeft / tmax) * wmax : 0)
  hsLabel()
}
function onDocScroll(e: Event) {
  const w = e.target as HTMLElement
  if (!w || !w.classList) return
  /* a week panned → mirror to the proxy, follow with the palette */
  if (w.classList.contains('week')) {
    hsLabel(); rosDayFollow()
    const trk = $('hsTrack'); if (!trk) return
    const tmax = trk.scrollWidth - trk.clientWidth, wmax = w.scrollWidth - w.clientWidth
    hsSet(trk, wmax > 0 ? (w.scrollLeft / wmax) * tmax : 0)
    return
  }
  /* Swiping one wave block sideways drags every other wave in the same day with
     it, so RMKS / AREA / TIME stay lined up down the column instead of each wave
     needing its own swipe. The >1px guard stops the mirrored writes from
     ping-ponging. */
  if (window.innerWidth <= 820 && w.classList.contains('go')) {
    const day = w.closest('.day'); if (!day) return
    const x = w.scrollLeft
    day.querySelectorAll('.go').forEach((o: any) => { if (o !== w && Math.abs(o.scrollLeft - x) > 1) o.scrollLeft = x })
    return
  }
  /* the view week under the day dots (phone) — light the nearest day's dot */
  if (w.id === 'vWeek') { /* handled by the week branch above */ }
}
/* the day dots (phone): light the dot nearest the middle of the view */
function onDotsScroll(e: Event) {
  /* The dots are phone-only. Bail before touching the event target so every
     scroll from a desktop inner panel does not pay for a DOM walk toward a
     hidden control. This listener is document-wide and runs once per tick. */
  if (window.innerWidth > 820) return
  const wk = (e.target as HTMLElement).closest && (e.target as HTMLElement).closest('#vWeek') as HTMLElement | null
  if (!wk) return
  const dots = $('vDots'); if (!dots) return
  const mid = wk.scrollLeft + wk.clientWidth / 2; let best = 0, bd = 1e9
  wk.querySelectorAll('.day').forEach((el: any, i: number) => { const c = el.offsetLeft + el.offsetWidth / 2; const dd = Math.abs(c - mid); if (dd < bd) { bd = dd; best = i } })
  dots.querySelectorAll('button').forEach((b: any, i: number) => b.classList.toggle('on', i === best))
}
function onDotsClick(e: MouseEvent) {
  const b = (e.target as HTMLElement).closest('#vDots [data-day]') as HTMLElement | null; if (!b) return
  const el = $('vWeek')!.querySelectorAll('.day')[+b.dataset.day!]
  el && el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
}
/* ---- CONTINUOUS SWIPE ACROSS WEEKS (owner, 22 Aug 26) ----
   The view/edit week is a scroll-snap carousel, one day per snap on a phone.
   Swiping OFF the last day (already pinned at the right edge) loads the next
   week and lands on Monday; off the first day loads the previous week and lands
   on Sunday. The edge is read at touch-START — "you are on Sunday, swipe again"
   — so an ordinary within-week swipe (which does not begin pinned at an end)
   never crosses. A swipe that begins on an inner horizontal scroller (a wave
   `.go` block scrolls its own RMKS/AREA/TIME) is left to that scroller.
   Phone only; desktop steps weeks with the seg buttons and never snaps. */
const SWIPE_TH = 45
/* EDGE_SLOP — how far in from a true 0 / max still counts as "sitting on the
   end day" (owner-reported, 23 Aug 26 — the swipe between weeks was unreliable:
   19→20 Jul needed a second, harder swipe and 13→12 Jul never worked at all).
   The phone week does not rest at 0/max on its end days. `.week` carries 12px
   side padding and a 12px gap and sets NO `scroll-padding`, so scroll-snap
   parks Monday one padding-width IN (~12px, not 0) and clamps Sunday a hair
   short of max on a fractional-width viewport. A 1px edge test therefore read
   "not at the edge" while the scheduler was plainly on Monday/Sunday, so the
   back-swipe guard was never true and the forward one only caught when the
   snap happened to land exactly. EDGE_SLOP covers that resting inset — one
   padding + one gap — and stays an order of magnitude below a day column
   (~350px+ at any phone width), so a genuine mid-week swipe still cannot be
   mistaken for an edge one. */
const EDGE_SLOP = 24
let swEl: HTMLElement | null = null
let swStartX = 0, swStartY = 0, swLastX = 0, swLastY = 0, swAtLeft = false, swAtRight = false
/* THE WAVE BLOCK A GESTURE BEGINS ON, and its scroll position at that instant.
   A day's flying waves each scroll sideways in their own `.go` block. We used to
   cede the WHOLE gesture to that block the moment a touch began inside one — but
   a flying day is almost all wave blocks, so on such a day the week-cross swipe
   had nowhere to begin and simply stuck (owner, 23 Aug 26 — "stuck to swipe back
   from Jul 20": Monday is wave-dense, so back never crossed, while Sunday, a bare
   ground day with no waves, crossed forward fine). A wave block also carries
   overscroll-behavior-x:contain, so when it is at its own edge it neither scrolls
   nor chains to the week — a true dead end. So instead of bailing, we REMEMBER the
   block and its scrollLeft, and decide at touch-END: if the block actually moved,
   it owned the swipe; if it did not (it was at its edge), the gesture falls
   through to the week-cross like a touch on any bare part of the day. */
let swGo: HTMLElement | null = null, swGoSL = -1
function onWeekTouchStart(e: TouchEvent) {
  swEl = null; swGo = null
  if (window.innerWidth > 820) return
  if (view.CURPAGE !== 'viewsched' && view.CURPAGE !== 'editsched') return
  if (view.SBDAY != null) return                 // the board is open — its arrows own week-stepping
  if (!e.touches || e.touches.length !== 1) return
  const t = e.target as HTMLElement
  if (!t.closest) return
  const go = t.closest('.go') as HTMLElement | null   // an inner wave scroller MAY own this gesture — decided at end
  const w = t.closest('.week') as HTMLElement | null
  if (!w) return
  const max = w.scrollWidth - w.clientWidth
  if (max <= 1) return                           // nothing to be at the edge OF (headless / not laid out)
  swEl = w
  swGo = go; swGoSL = go ? go.scrollLeft : -1
  swStartX = swLastX = e.touches[0].clientX
  swStartY = swLastY = e.touches[0].clientY
  swAtLeft = w.scrollLeft <= EDGE_SLOP
  swAtRight = w.scrollLeft >= max - EDGE_SLOP
}
/* Track the finger so a gesture the browser CANCELS mid-way (see below) still
   has a real end position to measure — a passive move listener can't steer the
   scroll, it only remembers where the finger went. */
function onWeekTouchMove(e: TouchEvent) {
  if (!swEl || !e.touches || !e.touches.length) return
  swLastX = e.touches[0].clientX
  swLastY = e.touches[0].clientY
}
/* Wired to BOTH touchend and touchcancel. When an overswipe off an end day has
   any sub-pixel scroll room left, the browser claims the touch as a scroll and
   dispatches `touchcancel`, NOT `touchend` — so a touchend-only wiring silently
   dropped exactly the edge swipes that were meant to cross, which is the other
   half of "I had to swipe twice". A sequence ends with one or the other, never
   both, and swEl is nulled on the first, so this can't cross twice. */
function onWeekTouchEnd(e: TouchEvent) {
  const w = swEl; swEl = null
  if (!w || window.innerWidth > 820) return
  const ct = (e.changedTouches && e.changedTouches.length) ? e.changedTouches[0] : null
  const endX = ct ? ct.clientX : swLastX
  const endY = ct ? ct.clientY : swLastY
  const dx = endX - swStartX, dy = endY - swStartY
  /* horizontal intent only: a mostly-vertical drag (paging the day down) that
     drifts sideways past the threshold must not be read as a week cross */
  if (Math.abs(dx) <= Math.abs(dy)) return
  /* the gesture began inside a wave block that actually scrolled → it owned the
     swipe, so this is not a week cross. A block that never moved (it was at its
     own edge) falls through, which is what unsticks a wave-dense day's swipe. */
  if (swGo && Math.abs(swGo.scrollLeft - swGoSL) > 2) return
  /* right edge + swipe left (content advancing) → next week, land on Monday;
     left edge + swipe right (retreating) → previous week, land on Sunday */
  if (swAtRight && dx <= -SWIPE_TH) { view.setWeekJump('mon'); loadWeek(shiftWeek(CURWEEK, 1)) }
  else if (swAtLeft && dx >= SWIPE_TH) { view.setWeekJump('sun'); loadWeek(shiftWeek(CURWEEK, -1)) }
}

/* THE PEEK PREVIEW ACROSS A RESIZE CROSSING (ui/peek.ts). ViewWeek/EditWeek's
   own effect only reruns on a STORE version bump, so a window resize that
   crosses the 820px breakpoint would otherwise leave the preview mounted (or
   missing) until the next unrelated edit — the app already treats a resize as
   imperative DOM/CSS-var work rather than a React re-render (setWeekTail just
   above is the standing example), so this follows the same pattern instead of
   forcing a repaint. Gated on an ACTUAL crossing, not every resize tick — a
   drag-resize fires this continuously, and a full day-column rebuild is not
   the couple of style writes setWeekTail costs. `'\0'` as the "previous key"
   forces mountPeek to reconcile regardless of what a component's own ref
   remembers (it cannot see this call); the ref resyncs to reality the next
   time that component's own effect runs, which is a no-op once it does since
   the DOM already matches. Skipped while a week has not painted its seven
   live days yet (early boot) — nothing to anchor the peek nodes after. */
let lastDesktop = typeof window !== 'undefined' && window.innerWidth > 820
function syncPeekOnResize() {
  const desktop = window.innerWidth > 820
  if (desktop === lastDesktop) return
  lastDesktop = desktop
  ;['vWeek', 'eWeek'].forEach(id => {
    const el = $(id)
    if (el && el.children.length >= 7) mountPeek(el, 7, '\0')
  })
}
function onResize() { updateWeekNav(); syncPeekOnResize() }

export function initPan() {
  const trk = $('hsTrack')
  document.addEventListener('wheel', onWheel, { passive: false })
  document.addEventListener('scroll', onDocScroll, true)
  document.addEventListener('scroll', onDotsScroll, true)
  document.addEventListener('click', onDotsClick)
  document.addEventListener('touchstart', onWeekTouchStart, { passive: true })
  document.addEventListener('touchmove', onWeekTouchMove, { passive: true })
  document.addEventListener('touchend', onWeekTouchEnd, { passive: true })
  document.addEventListener('touchcancel', onWeekTouchEnd, { passive: true })
  if (trk) trk.addEventListener('scroll', onTrackScroll)
  window.addEventListener('resize', onResize)
  updateWeekNav()
  /* on a phone, jump to today's column, as bootApp does */
  if (window.innerWidth <= 820) setTimeout(() => { const t = document.querySelector('#vWeek .day.today'); if (t) t.scrollIntoView({ inline: 'start', block: 'nearest' }) }, 120)
  return () => {
    clearTimeout(ROSDAY_T)
    document.removeEventListener('wheel', onWheel)
    document.removeEventListener('scroll', onDocScroll, true)
    document.removeEventListener('scroll', onDotsScroll, true)
    document.removeEventListener('click', onDotsClick)
    document.removeEventListener('touchstart', onWeekTouchStart)
    document.removeEventListener('touchmove', onWeekTouchMove)
    document.removeEventListener('touchend', onWeekTouchEnd)
    document.removeEventListener('touchcancel', onWeekTouchEnd)
    if (trk) trk.removeEventListener('scroll', onTrackScroll)
    window.removeEventListener('resize', onResize)
  }
}
