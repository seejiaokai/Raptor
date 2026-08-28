// The sheet every decision in this app is made in, and the backdrop that
// dismisses it.
//
// Closing a sheet used to be its own ✕ or nothing, so a tap on the grid
// behind it — which is what most people try first — did nothing at all. The
// owner hit that on the counter sheet (10 Aug 26).
//
// The scrim lives HERE, in the wrapper, rather than in each of the seven
// places a sheet is opened: a sheet cannot be written without one, which is a
// stronger guarantee than a component everybody has to remember to add beside
// their own. It is transparent rather than dimmed — these sheets never dimmed
// the grid, and the manning counts behind an open sheet are exactly what
// somebody is reading while they decide.

import { useEffect, useRef, type ReactNode } from 'react'
import './bidpicker.css'

/* THE PAGE STAYS FULLY SCROLLABLE UNDER A SHEET (owner, 28 Aug 26 — "enable
   me to still scroll up and down when this window is opened … on the desktop
   if i decide to use the horizontal bar or vertical bar to scroll, this is
   allowed as well"). This REVERSES the 17 Aug "one-scroll" body lock: the page
   used to be frozen (`body.lw-sheet-lock { overflow:hidden }`) so a swipe could
   never jump the grid under a reader. The owner now wants exactly that jump —
   to read the grid behind the panel — so the lock is GONE. The panel itself is
   `position: fixed`, so it does not move with the page; only the grid behind it
   scrolls. The sheet's OWN inner list still keeps `overscroll-behavior: contain`
   (bidpicker.css) so scrolling to the end of the list does not also drag the
   page — that was never the complaint. */

const PAN_THRESH = 6 // px before a gesture commits to an axis

/* The scrim forwards a SIDEWAYS drag / wheel onto the grid's one horizontal
   scroller by hand (owner, 28 Aug 26), and lets the browser handle UP-DOWN
   natively (`touch-action: pan-y` in bidpicker.css + the wheel no-op below).
   The scrim must keep SWALLOWING taps — a tap dismisses, and a bare grid tap
   behind an open sheet would otherwise open a second cell sheet or start a
   drag-select — so it goes on capturing gestures; it just no longer refuses
   the vertical ones. Everything the frozen date bar tracks is driven off
   `.mx-wrap.scrollLeft`, so it follows the sideways forward for free.

   Pointer capture is taken LAZILY, only once a drag commits to the horizontal
   axis: capturing at pointerdown would stop the browser from panning the page
   vertically from a touch that began on the scrim, which is the up-down scroll
   the owner asked for. A gesture that never moved IS a tap — it dismisses (via
   the scrim's onClick, guarded so a drag's trailing click can't). */
function useGridPan(movedRef: { current: boolean }) {
  const scrimRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const scrim = scrimRef.current
    if (!scrim) return
    // `.mx-wrap` is Leave War's own (and only) sideways scroller — the class
    // appears nowhere in Raptor's scheduler, so no page scope is needed.
    const grid = () => document.querySelector<HTMLElement>('.mx-wrap')

    let x0 = 0, y0 = 0, sl0 = 0, axis: '' | 'x' | 'y' = '', captured = false
    const down = (e: PointerEvent) => {
      const g = grid()
      x0 = e.clientX; y0 = e.clientY; sl0 = g ? g.scrollLeft : 0
      axis = ''; movedRef.current = false; captured = false
    }
    const move = (e: PointerEvent) => {
      const dx = e.clientX - x0, dy = e.clientY - y0
      if (!axis) {
        if (Math.abs(dx) < PAN_THRESH && Math.abs(dy) < PAN_THRESH) return
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        movedRef.current = true // a committed drag, either axis, is no longer a tap
      }
      if (axis === 'x') {
        // Capture only now, so a vertical drag is left to the browser's own
        // page pan (touch-action: pan-y) rather than swallowed here.
        if (!captured) { try { scrim.setPointerCapture(e.pointerId); captured = true } catch { /* jsdom / unsupported */ } }
        const g = grid()
        if (g) g.scrollLeft = sl0 - dx
        e.preventDefault()
      }
      // axis === 'y': do nothing — the browser pans the page up-down natively.
    }
    const upOrCancel = (e: PointerEvent) => {
      if (captured) { try { scrim.releasePointerCapture(e.pointerId) } catch { /* ignore */ } }
      captured = false
    }
    const wheel = (e: WheelEvent) => {
      const g = grid()
      if (!g) return
      const d = Math.abs(e.deltaX) > 0 ? e.deltaX : (e.shiftKey ? e.deltaY : 0)
      if (!d) return // a plain vertical wheel: let the page scroll up-down, as asked
      g.scrollLeft += d
      e.preventDefault()
    }

    scrim.addEventListener('pointerdown', down)
    scrim.addEventListener('pointermove', move)
    scrim.addEventListener('pointerup', upOrCancel)
    scrim.addEventListener('pointercancel', upOrCancel)
    scrim.addEventListener('wheel', wheel, { passive: false })
    return () => {
      scrim.removeEventListener('pointerdown', down)
      scrim.removeEventListener('pointermove', move)
      scrim.removeEventListener('pointerup', upOrCancel)
      scrim.removeEventListener('pointercancel', upOrCancel)
      scrim.removeEventListener('wheel', wheel)
    }
  }, [movedRef])
  return scrimRef
}

/* THE PANEL IS MOVABLE (owner, 28 Aug 26 — "make this window movable, so that
   it doesnt block my view"). Its title strip (`.bidsheet-hd`, present on every
   sheet) is the drag handle: pressing anywhere on it but a button and dragging
   slides the whole panel via a translate offset, clamped so the handle can
   never be lost off-screen. The offset lives in CSS custom properties on the
   panel so it composes with the panel's own `translateX(-50%)` centering
   without React re-rendering the sheet on every pointer frame. It resets to
   zero whenever the sheet remounts (a fresh open), which is the behaviour the
   owner expects — a panel opens where it always did, then he moves it. */
function useSheetDrag() {
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const handle = panel.querySelector<HTMLElement>('.bidsheet-hd')
    if (!handle) return

    let dx = 0, dy = 0            // committed offset
    let px = 0, py = 0           // pointer at drag start
    let dx0 = 0, dy0 = 0         // offset at drag start
    let rect0: DOMRect | null = null
    let dragging = false

    const setVars = () => {
      panel.style.setProperty('--lw-dx', `${dx}px`)
      panel.style.setProperty('--lw-dy', `${dy}px`)
    }
    const down = (e: PointerEvent) => {
      // The ✕ and any control on the header keep doing their own job.
      if ((e.target as HTMLElement).closest('button')) return
      dragging = true
      px = e.clientX; py = e.clientY; dx0 = dx; dy0 = dy
      rect0 = panel.getBoundingClientRect()
      try { handle.setPointerCapture(e.pointerId) } catch { /* jsdom / unsupported */ }
      e.preventDefault()
    }
    const move = (e: PointerEvent) => {
      if (!dragging || !rect0) return
      const rawDx = dx0 + (e.clientX - px)
      const rawDy = dy0 + (e.clientY - py)
      // Clamp against the viewport so at least a strip of the handle always
      // stays reachable — never lose the panel behind the top bar or an edge.
      const KEEP = 48
      const topbar = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
      const vw = window.innerWidth, vh = window.innerHeight
      const left0 = rect0.left, top0 = rect0.top
      const minLeft = KEEP - rect0.width, maxLeft = vw - KEEP
      const minTop = topbar, maxTop = vh - KEEP
      const clampedLeft = Math.min(Math.max(left0 + (rawDx - dx0), minLeft), maxLeft)
      const clampedTop = Math.min(Math.max(top0 + (rawDy - dy0), minTop), maxTop)
      dx = dx0 + (clampedLeft - left0)
      dy = dy0 + (clampedTop - top0)
      setVars()
      e.preventDefault()
    }
    const up = (e: PointerEvent) => {
      dragging = false
      try { handle.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    }
    handle.addEventListener('pointerdown', down)
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
    handle.addEventListener('pointercancel', up)
    return () => {
      handle.removeEventListener('pointerdown', down)
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
      handle.removeEventListener('pointercancel', up)
    }
  }, [])
  return panelRef
}

export function Sheet({
  testid,
  label,
  onClose,
  narrow,
  children,
}: {
  testid: string
  label: string
  onClose: () => void
  /** A read-only info sheet (a figure breakdown, a person's figures) — drawn
   *  narrower and tighter, since its rows are read, not tapped (owner,
   *  28 Aug 26: "make all the window smaller … theres alot of empty space"). */
  narrow?: boolean
  children: ReactNode
}) {
  // A drag that scrolled the grid ends in a trailing click on the scrim
  // (mouse) — swallow that one so a sideways scroll never dismisses the sheet.
  // A real tap sets this false at pointerdown, so it still closes.
  const movedRef = useRef(false)
  const scrimRef = useGridPan(movedRef)
  const panelRef = useSheetDrag()
  const onScrimClick = () => {
    if (movedRef.current) { movedRef.current = false; return }
    onClose()
  }
  /* ESCAPE CLOSES IT (bug sweep, 28 Aug 26). Every other dismissible surface in
     the app already answers Escape — the input editor peels one layer at a
     time, the Medical as-of picker closes — but no Leave War sheet did: its ✕
     and a scrim tap were the only ways out. That leaves anyone on a keyboard
     stuck inside a `role="dialog"`, and it reads as broken next to the sibling
     surfaces. Fixed HERE, in the one wrapper every sheet is built from, for the
     same reason the scrim lives here: a sheet cannot then be written without it.
     Only the TOPMOST sheet acts. Today that guard never fires — Leave War
     sheets REPLACE one another (the person editor takes the figures sheet's
     place, a decision sheet yields to the remarks editor), so there is only
     ever one — but the day two are mounted at once, one press must peel one
     layer rather than clearing the pile. The listener captures so a field's own
     Escape handler cannot swallow it first. */
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const all = document.querySelectorAll('.bidsheet')
      if (all.length && all[all.length - 1] !== panelRef.current) return
      e.stopPropagation()
      closeRef.current()
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [panelRef])
  return (
    <>
      {/* Not a button and not focusable: it carries nothing a screen reader
          needs, and every sheet already has a real labelled ✕. This is a
          pointer convenience on top of that, never the only way out. */}
      <div ref={scrimRef} className="sheetscrim" data-testid="sheet-scrim" aria-hidden="true" onClick={onScrimClick} />
      <div ref={panelRef} className={`bidsheet${narrow ? ' narrow' : ''}`} data-testid={testid} role="dialog" aria-label={label}>
        {children}
      </div>
    </>
  )
}
