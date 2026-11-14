/* THE ONE DOOR TO THE GRID'S DOUBLE-TAP GUARD ([LW-DOUBLETAP-MORE-WINDOWS] — the two reads of the night of 11 Nov 26: the
   Opus read's F1, Astra's §1). A finger's second tap, a moment after a window over the grid closed by a press inside it,
   fell through to the day where the button had stood. The guard itself — what it swallows and what it lets through — is
   `guardGrid` in `Matrix.tsx`, and it is the ONLY guard: `Matrix` hands it to this door while it is drawn, and every
   window, wherever its open state lives (`Matrix` itself, `FlyRows`, the day panel's host, `StageBar`, `Topbar`), tells
   it when one of its windows goes, through `useGuardOnClose`. Kept in a file of its own so those files reach it without
   importing `Matrix` (which draws them). */
import { useEffect, useRef } from 'react'

/* WHERE A PRESS COUNTS AS INSIDE A WINDOW — read by `Matrix`'s press listener. The guard arms only for a window closed
   by a press inside it (a tap beside it, on the grid, is the grid's own — the built guard's N1): every Leave War window
   is a `.bidsheet` (Sheet.tsx — the Required panel and rename form, New period and Open for bidding among them); the
   event box is its own small box (`.evpeek`); the day panel the app's movable window (`.lwday`); the Required number pad
   (`.flypad`); the under-manned days list (`.umlist`); the move banners (`.mv-banner`); the slim "Back to Approvals" bar
   (`.appr-slim`) and the scheduler's Calendar window, opened from ⚙ (`.dayswin`) — the two blind reads of 15 Nov 26. */
export const WINDOW_PRESS = '.bidsheet, .evpeek, .lwday, .flypad, .umlist, .mv-banner, .appr-slim, .dayswin'

/* THE LAST KEY PRESSED, heard on the WINDOW's capture from the moment this file loads (Astra's F1, 15 Nov 26). A window
   closed by a key leaves no press to guard (the built guard's N2), and `Matrix` forgot the press on a key — but its
   listener was on the document, and the number pad's Escape (FlyEdit.tsx, the window's capture) stops the key before the
   document hears it: the pad's going then armed the guard at the digit a finger had pressed, and a deliberate tap there
   was eaten. Every Leave War window's own key listener is added later than this one (when it opens), so none can stop it
   first. */
let keyAt = -Infinity
if (typeof window !== 'undefined') window.addEventListener('keydown', () => { keyAt = performance.now() }, true)
/** a key went down at or after `t` (the `performance.now()` of a press's release): that press closed nothing since */
export function keySince(t: number): boolean { return keyAt >= t }

let arm: (() => void) | null = null
/** `Matrix` only: the guard to arm, or null once the grid is gone (nothing then to guard) */
export function setGridGuard(f: (() => void) | null): void { arm = f }

/** One bit a window, up while it is open: a bit that was up and is now down arms the grid's guard — so a window closing
 *  while another stays up is guarded too. One window handing over to the next (a bit down as another goes up) arms it as
 *  well, which costs nothing: the guard eats only a click on the grid, never one on the new window. Whether a press
 *  inside the window closed it, and how fresh that press is, the guard checks for itself. */
export function useGuardOnClose(up: number): void {
  const was = useRef(0)
  useEffect(() => {
    if (was.current & ~up) arm?.()
    was.current = up
  }, [up])
}
