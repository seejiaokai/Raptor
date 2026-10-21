/* PINCH TO ZOOM — ONE body for the Scheduler Board's desktop layout on a phone and for Quals' table on a phone (owner
   D1107, D1108, and his answers D1109, D1110, 21 Oct 26 — `[BOARD-PHONE-PINCH-ZOOM]`).

   What a pinch does, as he ruled it: only the thing that is zoomed (the board's day, Quals' table) changes size; the
   bars and buttons around it stay as they are. It goes out until that thing's whole width fits the screen, and in to
   twice normal.

   How, and why this way (the Tracker's lesson, D992: a pinch that lays the page out again at every step ran at about 12
   frames on his iPhone):
   · WHILE THE FINGERS MOVE the zoomed thing is stretched as a picture (`transform`), the spot first under the fingers
     kept under them and carried as they slide — nothing is laid out again;
   · AT THE LIFT the zoom is written once (the caller's `apply`, CSS `zoom`, so taps, drops and pinned rows all meet
     what is drawn), the picture's stretch taken off, and the scrollers moved so the same spot of the page stands under
     where the fingers lifted.
   The browser's own pinch is held off on the surface (`touch-action: pan-x pan-y` in the stylesheet, and the touch
   moves of two fingers cancelled here; on an iPhone also its `gesture*` events), so the page around never zooms.
   One finger is left to the browser: it scrolls as it always has, the finger left down after a pinch included. A pinch never starts over a puck already picked up: the
   drag owns that finger (`canStart`).

   Units, measured 21 Oct 26 (scripts/handpass/pz-probe.mjs): inside a zoomed box a list's `scrollTop` and size are in
   the box's OWN units (at zoom 0.5, 200 of scrollTop moves the content 100 screen pixels), while every
   `getBoundingClientRect` is in screen pixels — so a move worked out on the screen is divided by the list's scale
   (`scaleOf`) before it is written. */

export const PINCH_MAX = 2

/** How many screen pixels one of `el`'s own pixels is drawn as (1 outside any zoom). */
export function scaleOf(el: Element): number {
  const h = el as HTMLElement
  const w = h.offsetWidth
  if (!w) return 1
  const r = h.getBoundingClientRect().width
  return r > 0 ? r / w : 1
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** Move whatever scrolls `from` on one axis by `delta` SCREEN pixels: the nearest scroller first, what it cannot take
 *  handed on to the next one out, the page last (up and down). Returns what could not be moved. */
export function scrollChain(from: Element, axis: 'x' | 'y', delta: number): number {
  let left = delta
  for (let n: Element | null = from; n && left !== 0; n = n.parentElement) {
    if (n === document.body || n === document.documentElement) break
    const cs = getComputedStyle(n)
    const o = axis === 'x' ? cs.overflowX : cs.overflowY
    if (o !== 'auto' && o !== 'scroll') continue
    const h = n as HTMLElement
    const range = axis === 'x' ? h.scrollWidth - h.clientWidth : h.scrollHeight - h.clientHeight
    if (range <= 0) continue
    const s = scaleOf(h)
    const was = axis === 'x' ? h.scrollLeft : h.scrollTop
    const want = clamp(was + left / s, 0, range)
    if (axis === 'x') h.scrollLeft = want; else h.scrollTop = want
    const now = axis === 'x' ? h.scrollLeft : h.scrollTop
    left -= (now - was) * s
    if (Math.abs(left) < 0.5) left = 0
  }
  if (left !== 0 && axis === 'y') {
    const before = window.scrollY
    window.scrollBy(0, left)
    left -= window.scrollY - before
  }
  return left
}

export type PinchOpts = {
  /** where two fingers are listened for */
  surface: HTMLElement
  /** the box that zooms */
  target: () => HTMLElement | null
  /** its zoom now */
  get: () => number
  /** the smallest zoom: its whole width fits */
  min: () => number
  max?: number
  /** write the new zoom (CSS zoom on the target, and the caller's own record of it); laid out on return */
  apply: (z: number) => void
  /** false while something else owns the fingers (a picked-up puck) */
  canStart?: () => boolean
  /** called the moment two fingers make a pinch, before anything is stretched (a pending puck hold is let go) */
  onStart?: () => void
}

type Live = { z0: number; d0: number; sx: number; sy: number; cx: number; cy: number; k: number; anchor: Element | null; fx: number; fy: number; ox: number; oy: number }

/** Wire a pinch on `opts.surface`. Returns the clean-up. */
export function wirePinch(opts: PinchOpts): () => void {
  const max = opts.max ?? PINCH_MAX
  let live: Live | null = null

  const two = (e: TouchEvent) => {
    const a = e.touches[0], b = e.touches[1]
    return { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }
  }
  const stretch = () => {
    const t = opts.target(); if (!t || !live) return
    const s = live.z0   // the transform's lengths are the box's own pixels, drawn at its zoom
    /* the spot first under the fingers, scaled about itself and carried to where the fingers are now */
    t.style.transformOrigin = `${live.ox}px ${live.oy}px`
    t.style.transform = `translate(${(live.cx - live.sx) / s}px, ${(live.cy - live.sy) / s}px) scale(${live.k})`
  }
  const start = (e: TouchEvent) => {
    if (e.touches.length !== 2 || live) return
    if (opts.canStart && !opts.canStart()) return
    const t = opts.target(); if (!t) return
    opts.onStart?.()
    const p = two(e)
    const z0 = opts.get()
    const r = t.getBoundingClientRect()
    /* the spot under the fingers, remembered as a place inside the element drawn there — the element survives the
       relayout at the lift and still says where that spot went, whatever scrolled in between */
    let anchor: Element | null = null, fx = 0.5, fy = 0.5
    const hit = typeof document.elementFromPoint === 'function' ? document.elementFromPoint(p.x, p.y) : null
    if (hit && t.contains(hit)) {
      anchor = hit
      const q = hit.getBoundingClientRect()
      fx = q.width ? (p.x - q.left) / q.width : 0.5
      fy = q.height ? (p.y - q.top) / q.height : 0.5
    }
    live = { z0, d0: Math.max(1, p.d), sx: p.x, sy: p.y, cx: p.x, cy: p.y, k: 1, anchor, fx, fy, ox: (p.x - r.left) / z0, oy: (p.y - r.top) / z0 }
    t.style.willChange = 'transform'
    if (e.cancelable) e.preventDefault()
  }
  const move = (e: TouchEvent) => {
    /* the second finger landed off the surface (the page's margin beside Quals' table, say): its touchstart went there, so
       the pinch starts on the first move of the two instead */
    if (!live && e.touches.length === 2) start(e)
    if (live && e.touches.length >= 2) {
      if (e.cancelable) e.preventDefault()
      const p = two(e)
      const z = clamp(live.z0 * (p.d / live.d0), opts.min(), max)
      live.k = z / live.z0
      live.cx = p.x; live.cy = p.y
      stretch()
      return
    }
    /* two fingers that did not make a pinch here (one landed on a picked-up puck) — never let the page zoom */
    if (e.touches.length >= 2 && e.cancelable) e.preventDefault()
  }
  const finish = () => {
    const l = live; live = null
    const t = opts.target()
    if (!l || !t) return
    t.style.transform = ''; t.style.transformOrigin = ''; t.style.willChange = ''
    const z1 = clamp(l.z0 * l.k, opts.min(), max)
    if (Math.abs(z1 - l.z0) < 0.001) return
    opts.apply(z1)
    /* bring the remembered spot back under where the fingers lifted */
    if (l.anchor && l.anchor.isConnected) {
      const q = l.anchor.getBoundingClientRect()
      scrollChain(l.anchor, 'x', q.left + l.fx * q.width - l.cx)
      const q2 = l.anchor.getBoundingClientRect()
      scrollChain(l.anchor, 'y', q2.top + l.fy * q2.height - l.cy)
    }
  }
  const end = (e: TouchEvent) => {
    if (live && e.touches.length < 2) finish()
  }
  const cancel = () => { if (live) finish() }
  /* iPhone: Safari's own pinch rides gesture events as well as touches */
  const gesture = (e: Event) => e.preventDefault()

  const s = opts.surface
  s.addEventListener('touchstart', start, { passive: false })
  s.addEventListener('touchmove', move, { passive: false })
  s.addEventListener('touchend', end)
  s.addEventListener('touchcancel', cancel)
  s.addEventListener('gesturestart', gesture as any)
  s.addEventListener('gesturechange', gesture as any)
  return () => {
    if (live) { const t = opts.target(); if (t) { t.style.transform = ''; t.style.transformOrigin = ''; t.style.willChange = '' } live = null }
    s.removeEventListener('touchstart', start)
    s.removeEventListener('touchmove', move)
    s.removeEventListener('touchend', end)
    s.removeEventListener('touchcancel', cancel)
    s.removeEventListener('gesturestart', gesture as any)
    s.removeEventListener('gesturechange', gesture as any)
  }
}

