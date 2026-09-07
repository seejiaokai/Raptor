/* ONE LIFT, EVERY DRAG (owner, 6 Sep 26 — "every single drag and drop for
   rearranging things … glows evenly … a cyan box around the perimeter, not
   individual boxes … once I drop the item it should flash to show where the
   new item ended up"; the pick from the mock he dragged on his phone: SOFT,
   INSIDE THE LINE, for all). The recipe itself is CSS (scheduler.css: --lift-box,
   .lift, .lift-frame, .lift-land); this file is the DOM choreography every drag
   machine calls, and nothing else — no store, no engine, no React.

   Two ways to wear the recipe. A thing that IS one element takes `.lift`
   straight on itself (liftOn) and `.lift-land` when it has landed (landOn). A
   COMPOSITE thing — a Leave War table row that spans two sticky cells and a
   year of scrolling ones, a quals column — gets ONE overlay frame (a
   `.lift-frame` the host renders in JSX with a constant className and hands
   here through a ref), placed from boxOf's arithmetic ONCE at arm and ONCE at
   landing. Nothing here runs per pointermove; that is the performance rule
   ("there should not be a perceived drop in speed"), and it holds because the
   drag itself is static until the drop.

   The landing on a DOM that is REBUILT after the drop (the board's innerHTML
   panels, the calendar) is deferred: the mover calls markLand(selector) before
   the rebuild, and the post-render pass calls paintLand(), which paints the
   node the first time it finds it and then FORGETS the mark — one-shot, so an
   unrelated repaint can never restart the flash (the .sb-fresh lesson,
   highlights.ts paintFreshAdds). A mark nobody paints for a second is dropped. */

/** Matches @keyframes liftLand's duration in scheduler.css — named on both
 *  sides of the same beat (the FigureCell.tsx FLASH_MS precedent). */
export const LIFT_LAND_MS = 600
/** How long a deferred landing may wait for its node before it is dropped. */
const LAND_STALE_MS = 1000
/** The animationend fired by the landing veil (.lift-land::after). */
const LAND_ANIM = 'liftLand'

export type LiftBox = { top: number; left: number; width: number; height: number }

/** The frame's box, relative to the positioned `host` it lives in: top/height
 *  from `y` (the row), left/width from `x` (the visible scroller, or the column
 *  heading), plus `scrollLeft` when the host itself scrolls sideways and the
 *  frame must ride its content. Visual pixels straight from the rects — a zoomed
 *  table's rect is already visual, and the host is outside the zoom, so nothing
 *  is ever divided by zoom (the figures-drawer precedent, Matrix.tsx). `null`
 *  when nothing is laid out (jsdom, a hidden host): no frame, never zeroes. */
export function boxOf(host: Element, y: Element, x: Element, scrollLeft = 0): LiftBox | null {
  const h = host.getBoundingClientRect(), r = y.getBoundingClientRect(), s = x.getBoundingClientRect()
  if (!(r.height > 0) || !(h.width > 0)) return null
  const width = (x as HTMLElement).clientWidth || s.width
  return { top: r.top - h.top, height: r.height, left: s.left - h.left + scrollLeft, width }
}

export function liftOn(el: Element | null | undefined): void { el?.classList.add('lift') }
export function liftOff(el: Element | null | undefined): void {
  if (!el) return
  endLanding(el)
  el.classList.remove('lift', 'lift-land')
}

/** The cleanup for a flash IN FLIGHT, per element: cancels its timer, unhooks its
 *  listener and takes `.lift-land` off. Held here rather than as a bare timer id
 *  so that every path which ends a flash early — a re-lift, a liftOff — ends ALL
 *  of it, instead of leaving a timer to fire into a later state. */
const LANDING = new WeakMap<Element, () => void>()
/** End a flash in flight, if there is one. Safe on an element that never had one. */
function endLanding(el: Element): void { LANDING.get(el)?.() }

/** Flash `el` where it stands: `.lift-land` on, then off again when its veil's
 *  animation ends — OR when the timer fires, whichever is first. Under normal
 *  motion animationend comes first; under prefers-reduced-motion the veil's own
 *  `animation:none` rule (scheduler.css, beside the recipe) means animationend
 *  NEVER fires, so the timer is the only way out and the class would otherwise
 *  stay forever (the FigureCell lesson). The blanket `*{animation:none!important}`
 *  does NOT cover this — `*` matches elements, and the veil is a pseudo-element.
 *  A flash restarted on an element already flashing needs one reflow
 *  (`void offsetWidth`) so the veil's animation runs again — once, at a drop, in
 *  a frame already laying out. */
export function landOn(el: HTMLElement | null | undefined): void {
  if (!el) return
  endLanding(el)
  el.classList.remove('lift', 'lift-land')
  void el.offsetWidth
  let timer: ReturnType<typeof setTimeout>
  const clear = () => {
    clearTimeout(timer)
    el.classList.remove('lift-land')
    el.removeEventListener('animationend', onEnd)
    LANDING.delete(el)
  }
  const onEnd = (e: Event) => { if ((e as AnimationEvent).animationName === LAND_ANIM) clear() }
  el.addEventListener('animationend', onEnd)
  el.classList.add('lift-land')
  timer = setTimeout(clear, LIFT_LAND_MS + 40)
  LANDING.set(el, clear)
}

function place(el: HTMLElement, b: LiftBox): void {
  el.style.top = `${b.top}px`
  el.style.left = `${b.left}px`
  el.style.width = `${b.width}px`
  el.style.height = `${b.height}px`
}

/** Show the frame around `box` and lift it; `null` hides it (a cancel, or a
 *  host that could not be measured). A new drag armed inside the previous
 *  landing's 600ms ends that flash outright — one frame serves every row, so a
 *  timer left running from the last drop would fire mid-lift; it only strips
 *  `.lift-land` today, but that is an invariant nobody should have to know. */
export function frameLift(frame: HTMLElement | null, box: LiftBox | null): void {
  if (!frame) return
  endLanding(frame)
  frame.classList.remove('lift-land')
  if (!box) { frame.classList.remove('lift'); return }
  place(frame, box)
  frame.classList.add('lift')
}

/** Move the frame to where the thing landed and flash it there. */
export function frameLand(frame: HTMLElement | null, box: LiftBox | null): void {
  if (!frame) return
  frame.classList.remove('lift')
  if (!box) { frame.classList.remove('lift-land'); return }
  place(frame, box)
  landOn(frame)
}

let PENDING: { sel: string; climb?: string; at: number; lit?: HTMLElement } | null = null

/** Remember what to flash once the DOM has been rebuilt: the first node matching
 *  `sel` (climbed to `climb` when given). Call BEFORE the rebuild. One slot —
 *  the latest drop wins. An empty selector clears the slot. */
export function markLand(sel: string, climb?: string): void {
  PENDING = sel ? { sel, climb, at: Date.now() } : null
}

/** The post-render half of markLand. Safe with no document (a torn-down test
 *  environment, the paintFreshAdds precedent).
 *
 *  ONE FLASH PER NODE, not one flash per mark (corrected 6 Sep 26, measured in
 *  Chromium against the built board). refreshHighlights is called by EVERY
 *  surface that has just re-rendered, and on the scheduler board TWO of them
 *  run in the same commit: EditWeek's pass fires ~20ms BEFORE SchedBoard's,
 *  while `#sbBoard` still holds its pre-drop markup. A mark spent on the first
 *  node found was therefore spent on a doomed node — SchedBoard's innerHTML
 *  swap replaced it a moment later and the drop flashed nothing at all. So the
 *  mark stays live for its short life and paints the node it finds, skipping
 *  the one it has ALREADY lit: an unrelated repaint that leaves that node
 *  standing restarts nothing (the .sb-fresh fault trap 7 names), a rebuild that
 *  replaces it hands the flash to the new node, and either way the mark dies at
 *  LAND_STALE_MS. */
export function paintLand(root: ParentNode | null = typeof document === 'undefined' ? null : document): void {
  if (!root || !PENDING) return
  if (Date.now() - PENDING.at > LAND_STALE_MS) { PENDING = null; return }
  let el = root.querySelector(PENDING.sel) as HTMLElement | null
  if (el && PENDING.climb) el = el.closest(PENDING.climb) as HTMLElement | null
  if (!el || el === PENDING.lit) return
  PENDING.lit = el
  landOn(el)
}

/** For tests: the mark still waiting to be painted. */
export function pendingLand(): { sel: string; climb?: string } | null {
  return PENDING ? { sel: PENDING.sel, climb: PENDING.climb } : null
}
