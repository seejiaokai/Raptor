import { applyMove } from '../engine/reorder'
import { canEditSched } from '../state/auth'
import * as view from '../state/view'
import { notify } from '../state/store'
import { moveSectionTo } from '../state/store'
import { setSecDefOffer } from './pops'

/* ---- dragging to reorder, in place (owner, 8 Aug 26; sections + wave blocks
   added 29 Aug 26 pt.3, replacing the Arrange sheet) ------------------------
   Its own little machine, deliberately: `drag.ts` stays scoped to pucks (owner,
   Aug 26) and none of these are pucks. Same shape as the qual-heading drag in
   QualsPage.tsx, for the same three reasons:

   - Pointer events rather than HTML5 drag-and-drop, so a finger works.
   - The implicit pointer capture a touch gets is RELEASED on the way down,
     because without it every pointermove keeps reporting the row the drag began
     on and the row can never find a new home.
   - The carried element and the drop bar are written STRAIGHT ONTO THE DOM
     instead of through state: every board panel / week day is an innerHTML
     string that a re-render rebuilds, and rebuilding it under a moving pointer
     would drop the drag. Only the drop itself changes state.

   THREE kinds of draggable, told apart by the grip the press lands on:
   - a board ROW grip (`.sb-grip`) carries the `[data-move]` row and reorders it
     within its block via applyMove — the original 8 Aug machine.
   - a WAVE grip (`.wvgrip`) carries the whole wave BLOCK (`.sb-go` / `.go`,
     which now also carries `data-move="mv:w.di.gi"`); its target search walks UP
     past the rows inside a wave to the enclosing block, so a wave drops onto
     another wave, not onto a line inside it. Still applyMove — a wave move is a
     real amendment (engine/reorder.ts moveWave).
   - a SECTION grip (`.secgrip`) carries a section wrapper (`[data-secmove]`) and
     reorders the day's big panels — DISPLAY only (store.moveSectionTo), so it
     offers the "Set default order?" snackbar on a real move.

   Delegated on the surface wrap and attached once, so it survives every panel
   repaint underneath it. Wired on BOTH the board wrap and the edit-week
   container: on the week only wave/section grips exist (rows are board-only),
   so the row branch simply never fires there. */
export function wireRowDrag(el: HTMLElement) {
  let from = ''          // an mv: address (row or wave), '' when not an mv drag
  let fromSec = ''       // a data-secmove value ("di.key"), '' when not a section drag
  let kind = ''          // the mv kind (ac/d/s/g/p/n/w), for the target search
  let carry: HTMLElement | null = null
  let over: HTMLElement | null = null

  /* edge auto-scroll (owner, 31 Aug 26): a day is far taller than the phone, and
     the grips carry `touch-action:none` so the finger holding a drag can't scroll
     the page itself — leaving no way to reach a section far above or below. So
     while a drag is live and the finger sits in the top/bottom margin, we scroll
     the surface under it. The surface differs per page: the board scrolls its own
     `.sb-board` (or `.sb-main` on phone), the edit week scrolls the window — so we
     walk up from the carried element to the nearest thing that actually overflows
     and fall back to the document. lastX/lastY are the last pointer position, kept
     so the loop can re-read what's now under the still finger after each scroll
     step (no pointermove fires while the finger holds still). */
  let lastX = 0, lastY = 0
  let vel = 0                                   // px/frame, sign = direction, 0 = idle
  let raf = 0
  let scroller: HTMLElement | null = null
  const EDGE = 72, MAXV = 22                    // margin that triggers, top speed

  const isWin = (s: HTMLElement) =>
    s === document.scrollingElement || s === document.documentElement
  const findScroller = (node: HTMLElement | null): HTMLElement => {
    let n: HTMLElement | null = node
    while (n && n !== document.body) {
      const oy = getComputedStyle(n).overflowY
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 1) return n
      n = n.parentElement
    }
    return (document.scrollingElement as HTMLElement) || document.documentElement
  }
  const edgeVel = (y: number): number => {
    if (!scroller) return 0
    const win = isWin(scroller)
    const r = win ? null : scroller.getBoundingClientRect()
    const top = win ? 0 : r!.top
    const bot = win ? window.innerHeight : r!.bottom
    if (y < top + EDGE) return -Math.ceil(((top + EDGE - y) / EDGE) * MAXV)
    if (y > bot - EDGE) return Math.ceil(((y - (bot - EDGE)) / EDGE) * MAXV)
    return 0
  }
  const tick = () => {
    raf = 0
    if (!from && !fromSec) return               // drag ended between frames
    if (vel && scroller) {
      const before = scroller.scrollTop
      scroller.scrollTop = before + vel
      /* only if the content actually moved does what's under the finger change */
      if (scroller.scrollTop !== before)
        hoverAt(document.elementFromPoint(lastX, lastY) as HTMLElement | null)
    }
    raf = requestAnimationFrame(tick)
  }
  const stopScroll = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = 0; vel = 0; scroller = null
  }

  const clear = () => {
    if (carry) carry.classList.remove('rowdrag', 'secdrag')
    if (over) over.classList.remove('rowdrop', 'secdrop')
    carry = null; over = null; from = ''; fromSec = ''; kind = ''
    stopScroll()
  }
  /* the acceptance rule, identical to engine/reorder.ts applyMove: same kind,
     same length, and the same container (everything but the last index) — so
     every target we HIGHLIGHT is a target the drop will actually take, and a
     cross-day / cross-block hover shows nothing. `ac` is the one address with
     two readings (a jet inside a formation, or a whole formation), so it only
     needs the day + Go to match — applyMove's own sameBut(3). */
  const sameContainer = (a: string, b: string) => {
    const pa = a.slice(3).split('.'), pb = b.slice(3).split('.')
    if (pa[0] !== pb[0] || pa.length !== pb.length || pa.length < 3) return false
    if (pa[0] === 'ac') return pa[1] === pb[1] && pa[2] === pb[2]
    for (let i = 1; i < pa.length - 1; i++) if (pa[i] !== pb[i]) return false
    return true
  }

  const onDown = (e: any) => {
    if (from || fromSec) return          // a drag is already live — a second finger on another grip must not orphan the first's highlight
    if (!canEditSched()) return
    if (view.DPREV.has(view.SBDAY as any)) return
    /* the GRIP only — a press on the element itself is a click on a field, and a
       row full of inputs has almost no blank space to spare */
    const grip = (e.target as HTMLElement).closest?.('.sb-grip, .wvgrip, .secgrip') as HTMLElement | null
    if (!grip) return
    if (grip.classList.contains('secgrip')) {
      const sec = grip.closest('[data-secmove]') as HTMLElement | null; if (!sec) return
      fromSec = sec.dataset.secmove!
      carry = sec; sec.classList.add('secdrag')
    } else {
      const row = grip.closest('[data-move]') as HTMLElement | null; if (!row) return
      from = row.dataset.move!
      kind = from.slice(3).split('.')[0]
      carry = row; row.classList.add('rowdrag')
    }
    try { grip.releasePointerCapture?.(e.pointerId) } catch { /* mouse: nothing to release */ }
    /* the surface this drag can reach off-screen ends of, and the loop that
       scrolls it while the finger holds an edge */
    scroller = findScroller(carry)
    lastX = e.clientX; lastY = e.clientY; vel = 0
    if (!raf && typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(tick)
    e.preventDefault()
  }
  /* resolve and highlight the drop target under a given element — shared by a
     real pointermove (e.target) and the auto-scroll loop (elementFromPoint under
     the held-still finger). */
  const hoverAt = (t0: HTMLElement | null) => {
    if (!from && !fromSec) return
    let tgt: HTMLElement | null = null
    if (fromSec) {
      /* a section drops onto another section OF THE SAME DAY (the edit week shows
         seven days at once, so the day prefix must match) */
      const sec = t0?.closest?.('[data-secmove]') as HTMLElement | null
      const v = sec?.dataset.secmove
      if (sec && sec !== carry && v && v !== fromSec && v.split('.')[0] === fromSec.split('.')[0]) tgt = sec
    } else {
      /* find the nearest ancestor of the SAME kind — for a wave carry this walks
         up past the lines inside a wave to the `.sb-go`/`.go` block itself */
      const row = t0?.closest?.(`[data-move^="mv:${kind}."]`) as HTMLElement | null
      const v = row?.dataset.move
      if (row && row !== carry && v && v !== from && sameContainer(from, v)) tgt = row
    }
    if (tgt === over) return
    if (over) over.classList.remove('rowdrop', 'secdrop')
    over = tgt
    if (over) over.classList.add(fromSec ? 'secdrop' : 'rowdrop')
  }
  const onMove = (e: any) => {
    if (!from && !fromSec) return
    lastX = e.clientX; lastY = e.clientY
    vel = edgeVel(lastY)                         // arm/disarm the edge scroll
    hoverAt(e.target as HTMLElement)
  }
  const onUp = () => {
    const sec = fromSec, src = from, dst = over?.dataset
    /* mv:/secmove addresses are index-based and captured at pointerdown/-move; a
       panel repaint mid-drag (innerHTML swap — e.g. a sort confirmed by keyboard
       while a touch holds an element) detaches both elements but their dataset
       survives, so the drop would fire STALE indices at a re-built model and move
       something nobody was holding (audit, 12 Aug 26). A detached carry or target
       means the surface changed under the drag: refuse. */
    const stale = (carry && !carry.isConnected) || (over && !over.isConnected)
    clear()
    if (stale) return
    if (sec) {
      const to = dst?.secmove
      if (!to) return
      const di = +sec.split('.')[0], fromKey = sec.split('.')[1], toKey = to.split('.')[1]
      /* a real move offers the "make this the house default?" snackbar */
      if (moveSectionTo(di, fromKey, toKey)) { setSecDefOffer(di); notify() }
    } else {
      const to = dst?.move
      if (src && to && applyMove(src, to)) { view.afterSchedMutate(); notify() }
    }
  }

  el.addEventListener('pointerdown', onDown)
  /* pointermove/up on the document, not the container: the drag deliberately
     releases pointer capture (see the header) so the target tracks the finger,
     which means once the finger leaves the surface — off the bottom, or up over
     the app header while the edge auto-scroll runs — events land elsewhere. On
     the container onMove would stop firing there and the scroll velocity would
     freeze at its last value; on the document it keeps tracking to the very edge,
     and a lift outside the surface still ends the drag. Both handlers early-return
     until this instance owns a live drag, so the board's and the week's wirings
     don't collide. */
  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
  document.addEventListener('pointercancel', onUp)
  return () => {
    el.removeEventListener('pointerdown', onDown)
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
    stopScroll()
  }
}
