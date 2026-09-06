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
export function liftOff(el: Element | null | undefined): void { el?.classList.remove('lift', 'lift-land') }

const TIMERS = new WeakMap<Element, ReturnType<typeof setTimeout>>()

/** Flash `el` where it stands: `.lift-land` on, then off again when its veil's
 *  animation ends — OR when the timer fires, whichever is first. The timer is
 *  not a belt-and-braces: under prefers-reduced-motion the app's blanket
 *  `*{animation:none!important}` means animationend NEVER fires, and the class
 *  would stay forever (the FigureCell lesson). A flash restarted on an element
 *  already flashing needs one reflow (`void offsetWidth`) so the veil's
 *  animation runs again — once, at a drop, in a frame already laying out. */
export function landOn(el: HTMLElement | null | undefined): void {
  if (!el) return
  const old = TIMERS.get(el)
  if (old) clearTimeout(old)
  el.classList.remove('lift', 'lift-land')
  void el.offsetWidth
  const clear = () => {
    el.classList.remove('lift-land')
    el.removeEventListener('animationend', onEnd)
    TIMERS.delete(el)
  }
  const onEnd = (e: Event) => { if ((e as AnimationEvent).animationName === LAND_ANIM) clear() }
  el.addEventListener('animationend', onEnd)
  el.classList.add('lift-land')
  TIMERS.set(el, setTimeout(clear, LIFT_LAND_MS + 40))
}

function place(el: HTMLElement, b: LiftBox): void {
  el.style.top = `${b.top}px`
  el.style.left = `${b.left}px`
  el.style.width = `${b.width}px`
  el.style.height = `${b.height}px`
}

/** Show the frame around `box` and lift it; `null` hides it (a cancel, or a
 *  host that could not be measured). */
export function frameLift(frame: HTMLElement | null, box: LiftBox | null): void {
  if (!frame) return
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

let PENDING: { sel: string; climb?: string; at: number } | null = null

/** Remember what to flash once the DOM has been rebuilt: the first node matching
 *  `sel` (climbed to `climb` when given). Call BEFORE the rebuild. One slot —
 *  the latest drop wins. An empty selector clears the slot. */
export function markLand(sel: string, climb?: string): void {
  PENDING = sel ? { sel, climb, at: Date.now() } : null
}

/** The post-render half of markLand. Safe with no document (a torn-down test
 *  environment, the paintFreshAdds precedent). */
export function paintLand(root: ParentNode | null = typeof document === 'undefined' ? null : document): void {
  if (!root || !PENDING) return
  if (Date.now() - PENDING.at > LAND_STALE_MS) { PENDING = null; return }
  let el = root.querySelector(PENDING.sel) as HTMLElement | null
  if (el && PENDING.climb) el = el.closest(PENDING.climb) as HTMLElement | null
  if (!el) return
  PENDING = null
  landOn(el)
}

/** For tests: the mark still waiting to be painted. */
export function pendingLand(): { sel: string; climb?: string } | null {
  return PENDING ? { sel: PENDING.sel, climb: PENDING.climb } : null
}
