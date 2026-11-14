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
   (`.flypad`); the under-manned days list (`.umlist`); the move banners (`.mv-banner`). */
export const WINDOW_PRESS = '.bidsheet, .evpeek, .lwday, .flypad, .umlist, .mv-banner'

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
