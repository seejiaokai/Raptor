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

import { useEffect, type ReactNode } from 'react'
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
  return (
    <>
      {/* Not a button and not focusable: it carries nothing a screen reader
          needs, and every sheet already has a real labelled ✕. This is a
          pointer convenience on top of that, never the only way out. */}
      <div className="sheetscrim" data-testid="sheet-scrim" aria-hidden="true" onClick={onClose} />
      <div className="bidsheet" data-testid={testid} role="dialog" aria-label={label}>
        {children}
      </div>
    </>
  )
}
