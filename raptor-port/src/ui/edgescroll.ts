/* CARRIED TO THE EDGE, THE VIEW FOLLOWS (owner D892, D893, 15 Oct 26 — "when I drag the row of the puck down outside
   the screen, the screen doesn't pan"; the design guide's drag rule, D894). One edge scroll for the drags that had
   none — the Leave War's Rearrange (rows, headings, counters) and its ⚙ lists, a day's notes and pucks on the Inputs
   calendar, Quals' column headings — at the feel the Leave War's drag selection already has (`leavewar/ui/select.ts`
   reads its numbers from here, so the two cannot drift):

   - a MOUSE inside EDGE of the scroller's edge runs at a constant EDGE_STEP a frame;
   - a FINGER has a wider band (TOUCH_EDGE) and RAMPS: zero at the band's inner lip, TOUCH_STEP_MAX at the very edge,
     so a light push creeps and a firm one runs (the 27 Aug 26 "columns slid away" fix, select.ts);
   - a band the PRESS started inside is dead until the pointer has left it — a row picked up at the foot of the
     screen must not set the page running under a finger that has not moved (select.ts `held`, 2 Sep 26).

   The scroller is found from the dragged thing: the nearest ancestor that scrolls on that axis, else (up and down)
   the page itself. Nothing runs at rest — the loop lives from the press to the release and stops itself there. */

export const EDGE = 36           // px from an edge that auto-scrolls during a MOUSE drag
export const EDGE_STEP = 18      // px per frame of a mouse edge auto-scroll (constant)
export const TOUCH_EDGE = 48     // wider edge band for a finger, which is a fatter target
export const TOUCH_STEP_MAX = 15 // px per frame at the very edge; RAMPED down to 0 across the band

export type Scroller = { el: Element; isDoc: boolean }

/** The box that scrolls `from` on `axis`: the nearest ancestor that scrolls that way and has more to show, else —
 *  up and down — the page; sideways there is no page fallback (null). */
export function findScroller(from: Element, axis: 'x' | 'y'): Scroller | null {
  for (let n = from.parentElement; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n)
    const o = axis === 'y' ? cs.overflowY : cs.overflowX
    const more = axis === 'y' ? n.scrollHeight > n.clientHeight + 1 : n.scrollWidth > n.clientWidth + 1
    if ((o === 'auto' || o === 'scroll') && more) return { el: n, isDoc: false }
  }
  return axis === 'y' ? { el: document.scrollingElement || document.documentElement, isDoc: true } : null
}

/** The scroller's visible span on `axis`, in screen pixels. */
function span(s: Scroller, axis: 'x' | 'y'): [number, number] {
  if (s.isDoc) return [0, axis === 'y' ? (window.innerHeight || s.el.clientHeight) : (window.innerWidth || s.el.clientWidth)]
  const r = s.el.getBoundingClientRect()
  return axis === 'y' ? [r.top, r.bottom] : [r.left, r.right]
}

/** How far to scroll this frame for a pointer at `p` inside the span [lo, hi]: negative toward lo, positive toward hi. */
export function edgeStep(p: number, lo: number, hi: number, touch: boolean): number {
  if (touch) {
    const ramp = (into: number) => TOUCH_STEP_MAX * Math.min(1, into / TOUCH_EDGE)
    const intoHi = p - (hi - TOUCH_EDGE), intoLo = (lo + TOUCH_EDGE) - p
    return intoHi > 0 ? ramp(intoHi) : intoLo > 0 ? -ramp(intoLo) : 0
  }
  return p > hi - EDGE ? EDGE_STEP : p < lo + EDGE ? -EDGE_STEP : 0
}

/** Start the edge scroll for one drag. `point` is fed every move; `onScroll` runs after a frame that moved anything (the
 *  caller re-reads what is under the pointer — the rows have slid under it); `stop` ends it (release or cancel). */
export function edgeAutoScroll(opts: {
  from: Element
  axis: 'x' | 'y'
  touch: boolean
  x: number
  y: number
  onScroll: () => void
}): { point: (x: number, y: number) => void; stop: () => void } {
  const s = findScroller(opts.from, opts.axis)
  let x = opts.x, y = opts.y, raf = 0, live = true
  const at = () => (opts.axis === 'y' ? y : x)
  const band = (p: number): -1 | 0 | 1 => {
    if (!s) return 0
    const [lo, hi] = span(s, opts.axis)
    const w = opts.touch ? TOUCH_EDGE : EDGE
    return p < lo + w ? -1 : p > hi - w ? 1 : 0
  }
  // The band the press sat in stays dead until the pointer is seen outside it.
  let held = band(at())
  const tick = () => {
    raf = 0
    if (!live || !s) return
    const p = at()
    if (held && band(p) !== held) held = 0
    const [lo, hi] = span(s, opts.axis)
    let d = edgeStep(p, lo, hi, opts.touch)
    if (held && Math.sign(d) === held) d = 0
    if (d) {
      const before = opts.axis === 'y' ? s.el.scrollTop : s.el.scrollLeft
      if (opts.axis === 'y') s.el.scrollTop += d; else s.el.scrollLeft += d
      const after = opts.axis === 'y' ? s.el.scrollTop : s.el.scrollLeft
      if (after !== before) opts.onScroll()
    }
    if (live && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(tick)
  }
  if (s && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(tick)
  return {
    point: (nx, ny) => { x = nx; y = ny },
    stop: () => { live = false; if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf); raf = 0 },
  }
}
