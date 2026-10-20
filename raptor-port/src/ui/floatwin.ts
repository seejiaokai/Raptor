/* THE FLOATING WINDOW'S CHROME — ONE BODY for every movable, resizable window the app has ([DRAFT-PENDING],
   28 Sep 26: moved here whole from the ALL AVAIL window, AvailWindow.tsx, so the one changes window — D167: "the ALL
   AVAIL window's own pattern" — shares it instead of copying it; two copies of a placement rule drift).

   What it owns, each rule with the finding that made it (kept word for word from AvailWindow, where they were found):
   · WHERE THE WINDOW SITS — one body for every render and every browser resize (Fable S8, S11, S15). The box lives
     OUTSIDE React (the caller's module), never in component state: he edits the schedule behind it, so every keystroke
     re-renders, and component state would throw the window back to the corner mid-drag-and-type.
     NO BOX: the STYLESHEET places and sizes it, so every inline position and size is CLEARED (the element is reused
     between windows — S11 — and an inline size beats the phone rule — S8). A BOX: put it back where he left it, then
     CLAMP it into the screen so a browser narrowed never strands the bar and its ✕ (S15) — display only, the box keeps
     where he put it. A box made in the OTHER layout is kept, not applied (Astra 3).
   · A DRAG writes the element's style directly and notifies nobody (re-rendering on every pointer frame would repaint
     the board behind sixty times a second); it is committed on release — and ONLY A REAL MOVE is remembered (Fable,
     final read): a plain tap on the bar puts the stylesheet back in charge.
   · A RESIZE is committed without a re-render, through a ResizeObserver, and ONLY A SIZE HE CHOSE is remembered — never
     one the stylesheet decided (the first frame, the phone panel, a browser resized; the e2e caught that on 23 Sep 26).
   · THE PHONE LAYOUT is the stylesheet's own breakpoint for these windows (≤620px, scheduler.css), asked of the browser,
     so the two can never disagree about which layout a box belongs to (Astra 3). */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { putBack, refit } from './kbscroll'

export type FloatBox = { x: number, y: number, w: number, h: number, phone?: boolean }

/* WHICH FLOATING WINDOW IS IN FRONT (Astra DP-10): two windows may overlap (the ALL AVAIL window and the changes
   window); the one pressed last comes forward. Two bounded layers — 411 in front, 410 behind — so neither ever climbs
   over the bubble (430), a drawer (440), the input calendar (420) or a modal (470). */
let FRONT = ''
export const frontWin = () => FRONT
/* true when this press changed which window is in front (the caller repaints) */
export function raiseWin(id: string): boolean { if (FRONT === id) return false; FRONT = id; return true }

export const phoneLayout = () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(max-width:620px)').matches

/* A FINGER ON A WINDOW NEVER SCROLLS THE PAGE BEHIND IT (owner D686, 9 Oct 26; confirmed on his iPhone, D703). Where what
   is in the window FITS, or has reached its top or its foot, an iPhone hands the swipe on to the page behind; the
   stylesheet's `overscroll-behavior:contain` holds it only where there is something to scroll. So the window decides
   itself: a swipe up or down that began on `n` is left alone while something INSIDE it can still move that way, and is
   otherwise taken by nobody. A native listener, not React's: only a non-passive one may stop a touch move. Sideways
   swipes are not its business. One body for every window that holds a finger (FloatWindow.tsx; the schedule's own input
   window, inputedit.tsx — [SCHED-INPUT-WINDOW-PHONE], 18 Oct 26). Returns the clean-up. */
export function holdPageScroll(n: HTMLElement): () => void {
  let x0 = 0, y0 = 0
  const start = (e: TouchEvent) => { const t = e.touches && e.touches[0]; if (t) { x0 = t.clientX; y0 = t.clientY } }
  const move = (e: TouchEvent) => {
    const t = e.touches && e.touches[0]
    if (!t || e.touches.length !== 1 || !e.cancelable) return
    const dy = t.clientY - y0, dx = t.clientX - x0
    if (Math.abs(dy) <= Math.abs(dx)) return
    for (let a = e.target as HTMLElement | null; a; a = a.parentElement) {
      const oy = getComputedStyle(a).overflowY
      if ((oy === 'auto' || oy === 'scroll') && a.scrollHeight > a.clientHeight + 1) {
        /* finger down: what is above comes into view — it can, unless it is at its top; finger up: unless at its foot */
        if (dy > 0 ? a.scrollTop > 0 : a.scrollTop + a.clientHeight < a.scrollHeight - 1) return
      }
      if (a === n) break
    }
    e.preventDefault()
  }
  n.addEventListener('touchstart', start, { passive: true })
  n.addEventListener('touchmove', move, { passive: false })
  return () => { n.removeEventListener('touchstart', start); n.removeEventListener('touchmove', move) }
}

/* THE BOARD'S PREVIEW BAR — the one thing a floating window must never open over ([AVAILWIN-PREVIEW-BAR], 28 Sep 26;
   the amendment re-test's W2-F7). On a preview the board's side column opens with the bar that is the way home —
   "← Back to live copy", "Load onto working copy" (armed: "Discard N edits & load — confirm", "Keep editing") — and both
   windows' stylesheet corner (right 16, top 96) sat right over it. ONE body for both windows: `clear` is the bar when it
   is shown (null otherwise), `watch` the panel the board rewrites it in (`#sbWarn`, SchedBoard.tsx), so a bar that
   appears, grows when armed, or goes re-places the window at once. The edit week and View-only need none (measured:
   the corner sits over the week's crew palette there, and View-only's bar carries no button); the phone's windows are
   the bottom panel and the bar sits at the top of the board's scroller. */
export const BOARD_BAR = {
  clear: (): Element | null => {
    const b = document.querySelector('#schedBoard:not([hidden]) #sbWarn .dprev-bar') as HTMLElement | null
    return b && (b.offsetWidth || b.offsetHeight) ? b : null
  },
  watch: (): Element | null => document.getElementById('sbWarn'),
}

/* THE TOP BAR A WINDOW OPENS UNDER ([FLOATWIN-TWO-LINE-BAR], 21 Oct 26). The stylesheet's corner (top 96) clears a
   one-line top bar, 57–58 tall; but on the schedule pages and the Inputs page the bar runs to two lines at most desktop
   widths between about 900 and 1366 — 103–104 tall, measured 21 Oct 26 — and every window lay over its last 7px. So a
   window he has not placed opens 8px below the bar's REAL bottom — measured, as the failed-save band follows the bar
   (SaveStatus.tsx) — and the bar re-places it when its height changes (below). Only where the bar is what lies under
   the window's top edge, asked of the browser with the window itself left out: under the open Scheduler Board — a
   full-screen surface laid over the top bar — the bar is covered, and the window keeps its corner. (That corner lies
   over the right end of the board's OWN bar at every desktop width; whether the windows should open under that bar
   too is a look put to him, not built here — OUTSTANDING.md [FLOATWIN-BOARD-BAR].) */
const BARS = (): Element[] => [document.getElementById('burger')?.closest('.topbar')].filter((b): b is Element => !!b)
function barsUnder(n: HTMLElement, r: DOMRect): Element[] {
  if (typeof document.elementsFromPoint !== 'function') return []
  return BARS().filter(bar => {
    const q = bar.getBoundingClientRect()
    if (!(q.height > 0 && q.width > 0) || r.top >= q.bottom || r.bottom <= q.top || q.left >= r.right || q.right <= r.left) return false
    const x = Math.min(Math.max(r.left + r.width / 2, q.left), q.right - 1, window.innerWidth - 1), y = (Math.max(r.top, q.top) + q.bottom) / 2
    const under = document.elementsFromPoint(x, y).find(e => e !== n && !n.contains(e))
    return !!under && bar.contains(under)
  })
}

/* `open` — whether the window is up; `getBox`/`setBox` — the caller's module box; `deps` — what makes a NEW window
   (the observers are re-armed on it); `closeSel` — the bar's close button, which never starts a drag; `clear`/`watch`
   — what a window he has not placed opens clear of, and where that thing is rewritten (BOARD_BAR above) */
export function useFloatWin(opts: {
  open: boolean
  getBox: () => FloatBox | null
  setBox: (b: FloatBox | null) => void
  deps: any[]
  closeSel?: string
  clear?: () => Element | null
  watch?: () => Element | null
}) {
  const { open, getBox, setBox, deps } = opts
  const el = useRef<HTMLDivElement | null>(null)
  const drag = useRef<{ dx: number, dy: number, w: number, h: number, x0: number, y0: number, moved: boolean } | null>(null)

  const place = () => {
    const n = el.current
    if (!n || !open || drag.current) return
    const b = getBox()
    const phone = phoneLayout()
    /* `data-placed` says "he put this window here" — a desktop box of his own. The failed-save rule that lowers and
       shortens a window at its DEFAULT spot (17-save-status.css) must not reach a placed one: a stylesheet cap would
       shrink it, and the ResizeObserver below would then record the shrunken height as the size he chose
       ([SAVE-NOTE-COVERS], Astra's second read R2-2). */
    n.toggleAttribute('data-placed', !!b && !b.phone && !phone)
    if (!b || !!b.phone !== phone) {
      n.style.left = n.style.top = n.style.right = n.style.bottom = n.style.width = n.style.height = n.style.maxHeight = ''
      /* HIS PLACE IS HIS; THE STYLESHEET'S CORNER YIELDS TO THE TOP BAR AND THE PREVIEW BAR. Only a window he has not
         placed, on a desktop: when the top bar lies under the corner (barsUnder, above), or the board's preview bar is
         shown and the corner overlaps it, the window starts just below the lower of the two, and is capped to
         end on the screen. Only `top` and `max-height` are written — never width or height — so the ResizeObserver
         below never mistakes this for a size he chose, and the next place() with no bar clears both again. */
      if (phone) return
      const r = n.getBoundingClientRect()
      let top = 0
      for (const c of [...barsUnder(n, r), opts.clear ? opts.clear() : null]) {
        if (!c) continue
        const q = c.getBoundingClientRect()
        if (q.left < r.right && q.right > r.left && q.top < r.bottom && q.bottom > r.top) top = Math.max(top, Math.round(q.bottom + 8))
      }
      if (top) {
        n.style.top = top + 'px'
        n.style.maxHeight = Math.max(0, window.innerHeight - top - 12) + 'px'
      }
      return
    }
    n.style.maxHeight = ''
    if (phone) {
      /* the phone panel is the stylesheet's — only how far he dragged it up or down is his, so only its top is
         written, clamped so the bar stays on screen */
      n.style.left = n.style.right = n.style.width = n.style.height = ''
      n.style.bottom = 'auto'
      n.style.top = Math.min(Math.max(0, b.y), Math.max(0, window.innerHeight - 42)) + 'px'
      return
    }
    n.style.right = 'auto'; n.style.bottom = 'auto'
    n.style.width = b.w + 'px'; n.style.height = b.h + 'px'
    /* measured AFTER the size is written, so the stylesheet's max-width and max-height have had their say */
    const r = n.getBoundingClientRect()
    const x = Math.min(Math.max(0, b.x), Math.max(0, window.innerWidth - r.width))
    const y = Math.min(Math.max(0, b.y), Math.max(0, window.innerHeight - 42))
    n.style.left = x + 'px'; n.style.top = y + 'px'
  }
  useLayoutEffect(place)
  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, deps)
  /* THE EXACT MOMENT THE BAR CHANGES. The board writes its preview bar in a PASSIVE effect, after this window's layout
     effect has placed it, so a preview started while the window is open would be measured one render late. The board
     REPLACES the panel's markup whenever the bar appears, is armed or goes, so a watch on that panel's children re-places
     the window then — whatever order the two components mount in. The ref keeps the observer calling today's place(). */
  const placeRef = useRef(place)
  placeRef.current = place
  useEffect(() => {
    const w = open && opts.watch ? opts.watch() : null
    if (!w || typeof MutationObserver === 'undefined') return
    const mo = new MutationObserver(() => placeRef.current())
    mo.observe(w, { childList: true })
    return () => mo.disconnect()
  }, deps)
  /* …AND THE TOP BAR'S HEIGHT ([FLOATWIN-TWO-LINE-BAR]): a page change, the failed-save band or the bar that waits on
     an OIL answer takes the bar from one line to two, or back, with no resize of the screen */
  useEffect(() => {
    const bars = open ? BARS() : []
    if (!bars.length || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => placeRef.current())
    bars.forEach(b => ro.observe(b))
    return () => ro.disconnect()
  }, deps)

  useEffect(() => {
    const n = el.current
    if (!n || !open || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      if (drag.current) return
      const b = getBox()
      if (phoneLayout() || (b && b.phone)) return
      if (!b && !n.style.width && !n.style.height) return
      const r = n.getBoundingClientRect()
      if (b && Math.abs(r.width - b.w) < 1 && Math.abs(r.height - b.h) < 1) return
      setBox({ x: r.left, y: r.top, w: r.width, h: r.height, phone: false })
    })
    ro.observe(n)
    return () => ro.disconnect()
  }, deps)

  const onBarDown = (e: React.PointerEvent) => {
    const n = el.current
    if (!n) return
    if ((e.target as HTMLElement).closest(opts.closeSel || '.win-x')) return
    /* raised or held for a phone's keys (kbscroll.ts): put back first, so the drag starts from where it really stands */
    putBack(n)
    const r = n.getBoundingClientRect()
    drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, h: r.height, x0: e.clientX, y0: e.clientY, moved: false }
    n.style.left = r.left + 'px'; n.style.top = r.top + 'px'
    n.style.right = 'auto'; n.style.bottom = 'auto'
    n.style.width = r.width + 'px'; n.style.height = r.height + 'px'
    if (!phoneLayout()) n.setAttribute('data-placed', '')   // from the first moment of a drag it is where he puts it
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* jsdom */ }
    e.preventDefault()
  }
  const onBarMove = (e: React.PointerEvent) => {
    const d = drag.current, n = el.current
    if (!d || !n) return
    if (Math.abs(e.clientX - d.x0) > 3 || Math.abs(e.clientY - d.y0) > 3) d.moved = true
    const x = Math.min(Math.max(0, e.clientX - d.dx), Math.max(0, window.innerWidth - d.w))
    /* never let the bar itself go off the bottom: a window dragged past the edge could not be grabbed again */
    const y = Math.min(Math.max(0, e.clientY - d.dy), Math.max(0, window.innerHeight - 42))
    n.style.left = x + 'px'; n.style.top = y + 'px'
  }
  const onBarUp = () => {
    const d = drag.current, n = el.current
    if (d && d.moved && n) {
      const r = n.getBoundingClientRect()
      setBox({ x: r.left, y: r.top, w: r.width, h: r.height, phone: phoneLayout() })
    }
    drag.current = null
    if (d && !d.moved) { place(); requestAnimationFrame(refit) }   // a tap, not a drag: back above the keys (kbscroll.ts)
  }
  /* true while a drag started on the bar has moved — a tap on the bar is not a drag (the phone bar's own tap reads it) */
  const dragging = () => !!(drag.current && drag.current.moved)
  return { el, place, onBarDown, onBarMove, onBarUp, dragging }
}
