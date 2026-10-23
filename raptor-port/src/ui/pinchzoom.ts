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

/** How much one pixel of Ctrl+scroll (or a trackpad pinch, which a desktop browser sends as a Ctrl+scroll) zooms: a
 *  mouse wheel's notch of 100 is about a fifth, as a browser's own page zoom steps. */
export const WHEEL_RATE = 0.002
/** A Ctrl+scroll burst ends, and its zoom is laid out, once no notch has come for this long. */
export const WHEEL_IDLE_MS = 180

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
 *  handed on to the next one out, the page last (up and down) — never the page with `notPage` (a window fixed over it).
 *  Returns what could not be moved. */
export function scrollChain(from: Element, axis: 'x' | 'y', delta: number, notPage = false): number {
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
  if (left !== 0 && axis === 'y' && !notPage) {
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
  /** write the new zoom (the target's zoom, and the caller's own record of it); laid out on return */
  apply: (z: number) => void
  /** false where there is no pinch here (wider than a phone) or something else owns the fingers (a picked-up puck) */
  canStart?: () => boolean
  /** true while two fingers must still be kept from the browser although no pinch starts (a picked-up puck) */
  blockTwo?: () => boolean
  /** called the moment two fingers make a pinch, before anything is stretched (a pending puck hold, a heading or row
   *  drag pressed by the first finger — each let go, so the pinch moves nothing at its lift) */
  onStart?: () => void
  /** called once the pinch has ended, on every path (the lift, a cancel, the clean-up) — before the zoom is written */
  onEnd?: () => void
  /** other boxes drawn over the zoomed thing that must stretch with it while the fingers move — Quals' pinned heading
   *  row (unzoomed boxes, stretched about the same screen point, from their own top) */
  also?: () => (HTMLElement | null)[]
  /** other boxes drawn over the zoomed thing that stretch with it about the fingers on BOTH axes — the Leave War's frozen
   *  names copy, its open-dates outline and its figures drawer (unzoomed boxes; each follows the grid as one picture) */
  alsoXY?: () => (HTMLElement | null)[]
  /** boxes INSIDE the zoomed thing, in its own units, held at their size and place while the fingers move — the Leave
   *  War's month buttons, which the grid's zoom never changes (D1282) */
  keep?: () => (HTMLElement | null)[]
  /** cells INSIDE the zoomed thing that are pinned in place — on one axis or both — and stay pinned while the fingers
   *  move: they still grow and shrink with the picture, but where it would carry them off their place on a pinned axis
   *  they are held there (owner D1287, 23 Oct 26 — "Some untidiness … This is a mid pinch zoom picture": the Leave War's
   *  names column had stood in from the grid's left edge, its date row had grown up over the month buttons). The Leave
   *  War's names, counters and corner (left), its date row (top); the OIL tab's headings and names. `y: 'up'` holds it
   *  only from rising — it follows the picture down — for a row that is not pinned at rest but must never be carried up
   *  over what stands above it (the Leave War's date row, under the month buttons). Read once, as the pinch begins. */
  pin?: () => { el: HTMLElement; x: boolean; y: boolean | 'up' }[]
  /** the screen point the pinned cells grow and shrink about — the pinned block's own corner (the Leave War: the grid's
   *  left edge and its date row's top), so two pinned columns side by side shrink together and never part to let a day
   *  show between them. Without it each pinned cell keeps its own place. Read once. */
  pinAt?: () => { x: number; y: number }
  /** boxes drawn over the zoomed thing that stretch with it about the fingers DOWN only, their left edge held — the
   *  Leave War's frozen names copy and figures drawer, pinned to the grid's left edge (D1287); unzoomed boxes */
  alsoY?: () => (HTMLElement | null)[]
  /** boxes drawn over the zoomed thing stretched from their own top-left corner, held in place — the frozen date row's
   *  copy of the pinned corner (D1287); unzoomed boxes */
  alsoTL?: () => (HTMLElement | null)[]
  /** drawings INSIDE a box that stays, stretched sideways about the fingers from their own top — the frozen date row's
   *  days, so the row still reaches both edges of the screen while the fingers move (stretching the row's box instead
   *  left its far end empty on a pinch out — D1287). Any transform of their own (the row's follow of the grid's scroll,
   *  paused while pinching) is kept: the stretch rides the individual `scale` and `translate`. */
  alsoIn?: () => (HTMLElement | null)[]
  /** boxes in the page that stand on the date row's top — stretched sideways about the fingers from their own top, and
   *  carried down with the picture but never up, as the date row is (`y: 'up'`) — the Leave War's open-dates outline,
   *  which runs from the date row's top to the grid's foot (the fix read's finding 1); unzoomed boxes */
  alsoTop?: () => (HTMLElement | null)[]
  /** with `edges`: the page itself scrolls with the pinch as far as the lift's scroll would take it, so what stands above
   *  the zoomed thing moves with it while the fingers move — no band opens between the month buttons and the date row
   *  part-way down the page (owner D1288, 23 Oct 26). Never where the zoomed thing sits in a window fixed over the page. */
  scrollPage?: boolean
  /** a screen line nothing of `alsoY` is drawn above while the fingers move — the Leave War's date row's foot, so its
   *  names copy, growing up on a pinch in, never covers the pinned date row or the month buttons (D1287). Read once. */
  floor?: () => number
  /** where Ctrl+scroll (a desktop's trackpad pinch included) zooms the same way, the stretch laid out once the burst
   *  ends (D1228) — none where it is not given */
  wheel?: HTMLElement
  /** the picture never goes where the lift's scroll cannot follow: zoomed out with the page at its top (or the scroller at
   *  its start), the zoomed thing's top and left edges stay where they are, rather than floating down and right under
   *  the fingers and jumping back at the lift — the Leave War's grid, which sits near the top of a phone's page */
  edges?: boolean
  /** which drawn things carry the spot under the fingers through the relayout at the lift — one across, one down —
   *  where the element under the fingers would not (the Leave War: a group's heading pins itself to the left, so the
   *  day column and the row under the fingers are used instead). Without it, the element under the fingers does both. */
  anchor?: (x: number, y: number) => { x: Element | null; y: Element | null } | null
}

type Live = {
  z0: number; d0: number; sx: number; sy: number; cx: number; cy: number; k: number
  anchor: Element | null; anchorY: Element | null; fx: number; fy: number; ox: number; oy: number
  spacer: HTMLElement | null; also: { el: HTMLElement; ox: number }[]
  xy: { el: HTMLElement; ox: number; oy: number; s: number }[]
  keep: { el: HTMLElement; cx: number; cy: number }[]
  /** pinned cells (`pin`): where each stood on screen as the pinch began */
  pin: { el: HTMLElement; x: boolean; y: boolean | 'up'; l0: number; t0: number; px: number; py: number }[]
  ys: { el: HTMLElement; oy: number; s: number; top: number }[]
  tl: HTMLElement[]
  ins: { el: HTMLElement; o: number; z: number }[]
  tops: { el: HTMLElement; ox: number; top: number }[]
  floor: number
  /** the zoomed thing sits in a window fixed over the page (the OIL tab): the page behind it never scrolls for it */
  fixed: boolean
  /** a Ctrl+scroll burst, not two fingers */
  wheel: boolean
  /** with `edges`: the target's top-left on screen at the start, and how far the scrollers around it can still carry the
   *  content down and right at the lift (screen pixels) */
  edge: { top: number; left: number; roomX: number; roomY: number; keepH: number; bottom: number; minBottom: number; right: number; minRight: number; winRoom: number; y0: number } | null
  /** the smallest zoom, read ONCE as the pinch begins: read again while the picture is stretched, a floor measured off the
   *  drawn grid would measure the stretch (every box is drawn scaled), and creep as the fingers move */
  lo: number
}

/** Wire a pinch on `opts.surface`. Returns the clean-up. */
export function wirePinch(opts: PinchOpts): () => void {
  const max = opts.max ?? PINCH_MAX
  let live: Live | null = null
  const may = () => !opts.canStart || opts.canStart()

  const two = (e: TouchEvent) => {
    const a = e.touches[0], b = e.touches[1]
    return { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 }
  }
  const stretch = () => {
    const t = opts.target(); if (!t || !live) return
    const s = live.z0   // the transform's lengths are the box's own pixels, drawn at its zoom
    /* the spot first under the fingers, scaled about itself and carried to where the fingers are now (screen pixels) */
    let dx = live.cx - live.sx, dy = live.cy - live.sy
    /* …but no further down or right than the lift's scroll can bring it back (`edges`): the picture's top-left is
       S + k(R − S) + d for the start point S, its old corner R and the carry d */
    const e = live.edge
    if (e) {
      /* zoomed out near the page's foot (or the year's end), the lift's scroll cannot go past the end: the picture's bottom
         and right edges stay no higher and no further left than the page and the scroller will let them settle — then
         the top and left, which win where the two meet (a grid smaller than the screen sits at its top) */
      const under = e.minBottom - (live.sy + live.k * (e.bottom - live.sy) + dy)
      if (under > 0) dy += under
      const underX = e.minRight - (live.sx + live.k * (e.right - live.sx) + dx)
      if (underX > 0) dx += underX
      const over = live.sy + live.k * (e.top - live.sy) + dy - (e.top + e.roomY)
      /* held at its top, what lies below a held box (the month buttons, which keep their size) settles that box's lost
         height lower than a pure stretch would put it: drawn there now, so it does not drop at the lift */
      if (over > 0) dy -= over - e.keepH * (1 - live.k)
      const overX = live.sx + live.k * (e.left - live.sx) + dx - (e.left + e.roomX)
      if (overX > 0) dx -= overX
    }
    /* THE PAGE SCROLLS WITH THE PINCH (D1288): the picture's top comes down by what the lift's scroll will bring back; as
       much of that as the page's own scroll can take is scrolled now, so the month buttons and all above move with the
       grid. Everything in the page is then drawn by what is left (`dyp`); boxes fixed over the page keep the whole carry. */
    let S = 0
    if (e && opts.scrollPage && e.winRoom > 0) {
      /* less the height a held box above the fingers keeps (the month buttons): the real layout puts what is under it
         that much higher than a pure stretch, so the page is scrolled that much less — or the rows slide under the date row */
      const want = clamp(live.sy + live.k * (e.top - live.sy) + dy - e.top - e.keepH * (1 - live.k), 0, e.winRoom)
      if (Math.abs(window.scrollY - (e.y0 - want)) >= 0.5) window.scrollTo(window.scrollX, e.y0 - want)
      S = e.y0 - window.scrollY
    }
    const dyp = dy - S
    t.style.transformOrigin = `${live.ox}px ${live.oy}px`
    t.style.transform = `translate(${dx / s}px, ${dyp / s}px) scale(${live.k})`
    for (const a of live.also) {
      a.el.style.transformOrigin = `${a.ox}px 0px`
      a.el.style.transform = `translateX(${dx}px) scale(${live.k})`
    }
    /* a box beside the zoomed thing that moves as part of the same picture: scaled about the same screen point and
       carried the same way (in its own units: a box inside a zoom divides by its scale, as the target does) */
    for (const a of live.xy) {
      a.el.style.transformOrigin = `${a.ox}px ${a.oy}px`
      a.el.style.transform = `translate(${dx / a.s}px, ${dyp / a.s}px) scale(${live.k})`
    }
    /* a box on the date row's top: its top goes where the date row goes — down with the picture, never up */
    for (const a of live.tops) {
      const ty = Math.max(0, live.sy + live.k * (a.top - live.sy) + dy - a.top - S)
      a.el.style.transformOrigin = `${a.ox}px 0px`
      a.el.style.transform = `translate(${dx}px, ${ty}px) scale(${live.k})`
    }
    /* a box inside the zoomed thing held as it is: the exact inverse of the target's stretch, about the same point given
       in the box's own place — the target's translate d and scale k undone by translate(-d/k) scale(1/k) */
    for (const c of live.keep) {
      c.el.style.transformOrigin = `${live.ox - c.cx}px ${live.oy - c.cy}px`
      c.el.style.transform = `translate(${-dx / s / live.k}px, ${-dyp / s / live.k}px) scale(${1 / live.k})`
    }
    /* A PINNED CELL STAYS PINNED (D1287): the picture would carry its edge from where it stood, P, to S + k(P − S) + d;
       pinned, it belongs at A + k(P − A), grown about the pinned block's corner A — so it is moved by the difference, in
       its own units, which the target's zoom and the stretch both scale (an individual `translate`, so a transform of its
       own is left alone) */
    const ks = live.k * s
    for (const c of live.pin) {
      const tx = c.x ? (c.px + live.k * (c.l0 - c.px) - (live.sx + live.k * (c.l0 - live.sx) + dx)) / ks : 0
      /* (a pinned place moves down with the page's own scroll, S) */
      const wantY = c.y ? (c.py + live.k * (c.t0 - c.py) + S - (live.sy + live.k * (c.t0 - live.sy) + dy)) / ks : 0
      const ty = c.y === 'up' ? Math.max(0, wantY) : wantY
      c.el.style.translate = `${tx}px ${ty}px`
    }
    /* a box pinned to the left edge: stretched about the fingers' height only, from its own left — and, with a floor,
       never drawn above it (a clip in its own units, worked back through its stretch) */
    for (const a of live.ys) {
      a.el.style.transformOrigin = `0px ${a.oy}px`
      a.el.style.transform = `translate(0px, ${dyp / a.s}px) scale(${live.k})`
      if (live.floor > -Infinity) {
        const cut = a.oy + ((live.floor - dyp - a.top) / a.s - a.oy) / live.k
        a.el.style.clipPath = cut > 0 ? `inset(${cut}px 0px 0px 0px)` : ''
      }
    }
    for (const el of live.tl) {
      el.style.transformOrigin = '0px 0px'
      el.style.transform = `scale(${live.k})`
    }
    for (const a of live.ins) {
      a.el.style.transformOrigin = `${a.o}px 0px`
      a.el.style.scale = `${live.k}`
      a.el.style.translate = `${dx / a.z}px 0px`
    }
  }
  /* THE SIDEWAYS SCROLL HELD STILL WHILE THE PICTURE SHRINKS (the code read's finding 4, 21 Oct 26): a transform counts in
     the scroll box's width, so a pinch out near the right end shrank the box under the fingers and the browser pulled the
     scroll back mid-gesture — the picture jumped sideways until the lift put it right. A one-pixel spacer at the box's
     old far edge keeps its width until the lift. */
  const holdWidth = (t: HTMLElement): HTMLElement | null => {
    for (let n = t.parentElement; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n)
      if (cs.overflowX !== 'auto' && cs.overflowX !== 'scroll') continue
      if (cs.position === 'static' || n.scrollWidth <= n.clientWidth) return null
      const sp = document.createElement('div')
      sp.setAttribute('aria-hidden', 'true')
      sp.style.cssText = `position:absolute;left:${n.scrollWidth - 1}px;top:0;width:1px;min-width:0;height:1px;pointer-events:none;visibility:hidden`
      n.appendChild(sp)
      return sp
    }
    return null
  }
  const unstretch = (l: Live) => {
    const t = opts.target()
    if (t) { t.style.transform = ''; t.style.transformOrigin = ''; t.style.willChange = '' }
    for (const a of l.also) { a.el.style.transform = ''; a.el.style.transformOrigin = '' }
    for (const a of l.xy) { a.el.style.transform = ''; a.el.style.transformOrigin = '' }
    for (const c of l.keep) { c.el.style.transform = ''; c.el.style.transformOrigin = '' }
    for (const c of l.pin) c.el.style.translate = ''
    for (const a of l.ys) { a.el.style.transform = ''; a.el.style.transformOrigin = ''; a.el.style.clipPath = '' }
    for (const el of l.tl) { el.style.transform = ''; el.style.transformOrigin = '' }
    for (const a of l.ins) { a.el.style.scale = ''; a.el.style.translate = ''; a.el.style.transformOrigin = '' }
    for (const a of l.tops) { a.el.style.transform = ''; a.el.style.transformOrigin = '' }
    l.spacer?.remove()
    if (wheelTimer) { clearTimeout(wheelTimer); wheelTimer = null }
    document.removeEventListener('touchend', end, true)
    document.removeEventListener('touchcancel', cancel, true)
    opts.onEnd?.()
  }
  /* the pinch begins about the screen point (x, y), two fingers d apart (a Ctrl+scroll: 1, its zoom read from the notches) */
  const begin = (p: { x: number; y: number; d: number }, wheel: boolean): boolean => {
    const t = opts.target(); if (!t) return false
    const lo = opts.min()   // before anything is stretched (Live.lo)
    opts.onStart?.()
    const z0 = opts.get()
    const r = t.getBoundingClientRect()
    /* the spot under the fingers, remembered as a place inside the element drawn there — the element survives the
       relayout at the lift and still says where that spot went, whatever scrolled in between */
    let fx = 0.5, fy = 0.5
    const hit = typeof document.elementFromPoint === 'function' ? document.elementFromPoint(p.x, p.y) : null
    const picked = opts.anchor ? opts.anchor(p.x, p.y) : null
    const anchor: Element | null = picked ? picked.x : hit && t.contains(hit) ? hit : null
    const anchorY: Element | null = picked ? picked.y : anchor
    if (anchor) { const q = anchor.getBoundingClientRect(); fx = q.width ? (p.x - q.left) / q.width : 0.5 }
    if (anchorY) { const q = anchorY.getBoundingClientRect(); fy = q.height ? (p.y - q.top) / q.height : 0.5 }
    const also = (opts.also ? opts.also() : []).filter((x): x is HTMLElement => !!x).map(el => ({ el, ox: p.x - el.getBoundingClientRect().left }))
    const xy = (opts.alsoXY ? opts.alsoXY() : []).filter((x): x is HTMLElement => !!x).map(el => {
      const q = el.getBoundingClientRect(), s = scaleOf(el)
      return { el, ox: (p.x - q.left) / s, oy: (p.y - q.top) / s, s }
    })
    /* where each held box sits inside the target, in the target's own units */
    const keep = (opts.keep ? opts.keep() : []).filter((x): x is HTMLElement => !!x && t.contains(x)).map(el => {
      const q = el.getBoundingClientRect()
      return { el, cx: (q.left - r.left) / z0, cy: (q.top - r.top) / z0 }
    })
    const at = opts.pinAt ? opts.pinAt() : null
    const pin = (opts.pin ? opts.pin() : []).filter(c => t.contains(c.el)).map(c => {
      const q = c.el.getBoundingClientRect()
      return { ...c, l0: q.left, t0: q.top, px: at ? at.x : q.left, py: at ? at.y : q.top }
    })
    const ys = (opts.alsoY ? opts.alsoY() : []).filter((x): x is HTMLElement => !!x).map(el => {
      const q = el.getBoundingClientRect(), s = scaleOf(el)
      return { el, oy: (p.y - q.top) / s, s, top: q.top }
    })
    const tl = (opts.alsoTL ? opts.alsoTL() : []).filter((x): x is HTMLElement => !!x)
    /* the fingers' point in each drawing's own box, before its own transform: its box stands where it is drawn less
       that transform's shift (the frozen row's follow, a sideways translate), and the origin of a stretch is read in
       the box's own units */
    const ins = (opts.alsoIn ? opts.alsoIn() : []).filter((x): x is HTMLElement => !!x).map(el => {
      const z = scaleOf(el), q = el.getBoundingClientRect()
      let shift = 0
      try { const tf = getComputedStyle(el).transform; if (tf && tf !== 'none' && typeof DOMMatrixReadOnly === 'function') shift = new DOMMatrixReadOnly(tf).m41 } catch { shift = 0 }
      return { el, z, o: (p.x - (q.left - shift * z)) / z }
    })
    const tops = (opts.alsoTop ? opts.alsoTop() : []).filter((x): x is HTMLElement => !!x).map(el => {
      const q = el.getBoundingClientRect()
      return { el, ox: p.x - q.left, top: q.top }
    })
    /* a window fixed over the page (the OIL tab): the page's scroll can neither carry it nor bring it back (the fix read's
       finding 5) */
    let fixed = false
    for (let n: HTMLElement | null = t; n && n !== document.body; n = n.parentElement) {
      if (getComputedStyle(n).position === 'fixed') { fixed = true; break }
    }
    const floor = opts.floor ? opts.floor() : -Infinity
    let edge: Live['edge'] = null
    if (opts.edges) {
      const winRoom = fixed ? 0 : window.scrollY || 0
      let roomX = 0, roomY = winRoom, minRight = -Infinity
      for (let n = t.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
        const cs = getComputedStyle(n)
        if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') {
          roomX += n.scrollLeft * scaleOf(n)
          /* the nearest sideways scroller: a target wider than it settles with its right edge no left of the scroller's */
          if (minRight === -Infinity && n.scrollWidth > n.clientWidth) minRight = n.getBoundingClientRect().left + n.clientLeft + n.clientWidth * scaleOf(n)
        }
        if (cs.overflowY === 'auto' || cs.overflowY === 'scroll') roomY += n.scrollTop * scaleOf(n)
      }
      /* the page: whatever lies below the target keeps its height, so the target's bottom settles no higher than the
         screen's foot less that — when the page is taller than the screen at all */
      const se = document.scrollingElement || document.documentElement
      const below = se.scrollHeight - (window.scrollY || 0) - r.bottom
      const minBottom = se.scrollHeight > window.innerHeight ? window.innerHeight - below : -Infinity
      const keepH = keep.reduce((a, c) => { const q = c.el.getBoundingClientRect(); return q.bottom <= p.y ? a + q.height : a }, 0)
      edge = { top: r.top, left: r.left, roomX, roomY, keepH, bottom: r.bottom, minBottom, right: r.right, minRight, winRoom, y0: window.scrollY || 0 }
    }
    live = { z0, d0: Math.max(1, p.d), sx: p.x, sy: p.y, cx: p.x, cy: p.y, k: 1, anchor, anchorY, fx, fy, ox: (p.x - r.left) / z0, oy: (p.y - r.top) / z0, spacer: holdWidth(t), also, xy, keep, pin, ys, tl, ins, tops, floor, fixed, wheel, edge, lo }
    t.style.willChange = 'transform'
    /* a finger that landed off the surface lifts off it too: its touchend goes there, so the pinch listens on the page
       until it ends (the code read's finding 6) */
    document.addEventListener('touchend', end, true)
    document.addEventListener('touchcancel', cancel, true)
    return true
  }
  const start = (e: TouchEvent) => {
    if (e.touches.length !== 2 || live) return
    if (!may()) return
    if (!begin(two(e), false)) return
    if (e.cancelable) e.preventDefault()
  }
  const move = (e: TouchEvent) => {
    /* the second finger landed off the surface (the page's margin beside Quals' table, say): its touchstart went there, so
       the pinch starts on the first move of the two instead */
    if (!live && e.touches.length === 2) start(e)
    if (live && !live.wheel && e.touches.length >= 2) {
      if (e.cancelable) e.preventDefault()
      const p = two(e)
      const z = clamp(live.z0 * (p.d / live.d0), live.lo, max)
      live.k = z / live.z0
      live.cx = p.x; live.cy = p.y
      stretch()
      return
    }
    /* two fingers that did not make a pinch here: kept from the browser only where the pinch is this page's (a phone) or
       a picked-up puck holds them — wider than a phone the browser's own two-finger zoom is left alone (the code read's
       finding 2) */
    if (e.touches.length >= 2 && e.cancelable && (may() || (opts.blockTwo && opts.blockTwo()))) e.preventDefault()
  }
  const finish = () => {
    const l = live; live = null
    if (!l) return
    unstretch(l)
    if (!opts.target()) return
    const z1 = clamp(l.z0 * l.k, l.lo, max)
    if (Math.abs(z1 - l.z0) >= 0.001) opts.apply(z1)
    /* bring the remembered spot back under where the fingers lifted — at a limit too, where the zoom did not change but
       the fingers carried the picture (the code read's finding 5) */
    if (l.anchor && l.anchor.isConnected) {
      const q = l.anchor.getBoundingClientRect()
      scrollChain(l.anchor, 'x', q.left + l.fx * q.width - l.cx)
    }
    if (l.anchorY && l.anchorY.isConnected) {
      const q2 = l.anchorY.getBoundingClientRect()
      scrollChain(l.anchorY, 'y', q2.top + l.fy * q2.height - l.cy, l.fixed)
    }
  }
  function end(e: TouchEvent) {
    if (live && !live.wheel && e.touches.length < 2) finish()
  }
  function cancel() { if (live && !live.wheel) finish() }
  /* CTRL+SCROLL, a desktop's zoom over the zoomed thing (D1228): the same stretch about the pointer, each notch
     multiplying it, laid out once the notches stop. Without Ctrl it is an ordinary scroll, left alone. */
  let wheelTimer: ReturnType<typeof setTimeout> | null = null
  const onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey) return
    if (live && !live.wheel) { e.preventDefault(); return }   // two fingers already own it
    if (!live) {
      if (!may()) return
      if (!begin({ x: e.clientX, y: e.clientY, d: 1 }, true)) return
    }
    e.preventDefault()
    const l = live!
    const px = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1
    const z = clamp(l.z0 * l.k * Math.exp(-e.deltaY * px * WHEEL_RATE), l.lo, max)
    l.k = z / l.z0
    stretch()
    if (wheelTimer) clearTimeout(wheelTimer)
    wheelTimer = setTimeout(() => { wheelTimer = null; if (live && live.wheel) finish() }, WHEEL_IDLE_MS)
  }
  /* iPhone: Safari's own pinch rides gesture events as well as touches — held off where the pinch is this page's */
  const gesture = (e: Event) => { if (may() || (opts.blockTwo && opts.blockTwo())) e.preventDefault() }

  const s = opts.surface
  s.addEventListener('touchstart', start, { passive: false })
  s.addEventListener('touchmove', move, { passive: false })
  s.addEventListener('touchend', end)
  s.addEventListener('touchcancel', cancel)
  s.addEventListener('gesturestart', gesture as any)
  s.addEventListener('gesturechange', gesture as any)
  opts.wheel?.addEventListener('wheel', onWheel, { passive: false })
  return () => {
    opts.wheel?.removeEventListener('wheel', onWheel)
    if (live) { unstretch(live); live = null }
    s.removeEventListener('touchstart', start)
    s.removeEventListener('touchmove', move)
    s.removeEventListener('touchend', end)
    s.removeEventListener('touchcancel', cancel)
    s.removeEventListener('gesturestart', gesture as any)
    s.removeEventListener('gesturechange', gesture as any)
  }
}
