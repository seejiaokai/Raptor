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

/* ONE scroll while a sheet is up (owner, 17 Aug 26 — "I think it's cause by
   having 2 scrolls... on the phone"): the page behind a sheet must not move.
   A swipe that landed beside the sheet, or on a sheet with nothing left to
   scroll, used to fall through and scroll the year grid under the reader.
   The lock is a body class (the page scrolls on the window, so only the
   body can refuse it), counted rather than toggled so a sheet closing while
   another opens cannot unlock the page under the survivor. Scroll position
   survives: overflow:hidden freezes the offset, it does not reset it —
   same technique as Raptor's own board lock (`body.sb-lock`), same known
   iOS caveat recorded there. */
let LOCKS = 0
function useSheetLock() {
  useEffect(() => {
    LOCKS += 1
    document.body.classList.add('lw-sheet-lock')
    return () => {
      LOCKS -= 1
      if (LOCKS <= 0) document.body.classList.remove('lw-sheet-lock')
    }
  }, [])
}

/* The grid keeps scrolling SIDEWAYS while a sheet is up (owner, 28 Aug 26 —
   "I want to be able to still scroll left and right … on the grids … while
   the page is still up"). The tension: the scrim must go on SWALLOWING taps
   on the grid — a tap dismisses, and a bare grid tap behind an open sheet
   would otherwise open a second cell sheet or start a drag-select — so the
   grid's own pointer listeners must never see these gestures. So the scrim
   keeps capturing every gesture and FORWARDS the sideways ones onto the grid's
   one horizontal scroller (`.mx-wrap`) by hand: a horizontal drag moves it
   1:1, and on desktop a horizontal (or shift-) wheel does the same. Everything
   the frozen date bar tracks (the mirror, the h-bar) is driven off
   `.mx-wrap.scrollLeft`, so it follows for free.

   UP-DOWN stays locked — that is the one-scroll rule (17 Aug 26): the page
   behind a sheet must not jump under the reader, and the owner asked only for
   left-right. A vertical drag therefore moves nothing; it is also not a tap,
   so it does not dismiss. A gesture that never moved IS a tap — that dismisses
   (via the scrim's click, guarded below so a drag's trailing click can't).

   Works for touch and mouse alike; jsdom fires neither, so the scrim tests
   (a plain click) are untouched. */
const PAN_THRESH = 6 // px before a gesture commits to an axis
function useGridPan(movedRef: { current: boolean }) {
  const scrimRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const scrim = scrimRef.current
    if (!scrim) return
    // `.mx-wrap` is Leave War's own (and only) sideways scroller — the class
    // appears nowhere in Raptor's scheduler, so no page scope is needed.
    const grid = () => document.querySelector<HTMLElement>('.mx-wrap')

    let x0 = 0, y0 = 0, sl0 = 0, axis: '' | 'x' | 'y' = ''
    const down = (e: PointerEvent) => {
      const g = grid()
      x0 = e.clientX; y0 = e.clientY; sl0 = g ? g.scrollLeft : 0
      axis = ''; movedRef.current = false
      try { scrim.setPointerCapture(e.pointerId) } catch { /* jsdom / unsupported */ }
    }
    const move = (e: PointerEvent) => {
      const dx = e.clientX - x0, dy = e.clientY - y0
      if (!axis) {
        if (Math.abs(dx) < PAN_THRESH && Math.abs(dy) < PAN_THRESH) return
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        movedRef.current = true // a committed drag, either axis, is no longer a tap
      }
      if (axis === 'x') {
        const g = grid()
        if (g) g.scrollLeft = sl0 - dx
        e.preventDefault()
      }
    }
    const upOrCancel = (e: PointerEvent) => {
      try { scrim.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    }
    const wheel = (e: WheelEvent) => {
      const g = grid()
      if (!g) return
      const d = Math.abs(e.deltaX) > 0 ? e.deltaX : (e.shiftKey ? e.deltaY : 0)
      if (!d) return // a plain vertical wheel: the page stays locked, as before
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

export function Sheet({
  testid,
  label,
  onClose,
  children,
}: {
  testid: string
  label: string
  onClose: () => void
  children: ReactNode
}) {
  useSheetLock()
  // A drag that scrolled the grid ends in a trailing click on the scrim
  // (mouse) — swallow that one so a sideways scroll never dismisses the sheet.
  // A real tap sets this false at pointerdown, so it still closes.
  const movedRef = useRef(false)
  const scrimRef = useGridPan(movedRef)
  const onScrimClick = () => {
    if (movedRef.current) { movedRef.current = false; return }
    onClose()
  }
  return (
    <>
      {/* Not a button and not focusable: it carries nothing a screen reader
          needs, and every sheet already has a real labelled ✕. This is a
          pointer convenience on top of that, never the only way out. */}
      <div ref={scrimRef} className="sheetscrim" data-testid="sheet-scrim" aria-hidden="true" onClick={onScrimClick} />
      <div className="bidsheet" data-testid={testid} role="dialog" aria-label={label}>
        {children}
      </div>
    </>
  )
}
