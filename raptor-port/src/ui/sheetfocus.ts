/* A QUESTION SHEET TAKES THE KEYBOARD WHEN IT OPENS (W12, the Codex stack check, 5 Oct 26).
   The four confirmation sheets — the OIL question, the upchit one, "covers other days", "no medical document" — are
   drawn over whatever surface asked for them, and none took focus: the caret stayed where it was, behind the sheet.
   From the schedule's own text boxes that meant typed characters and Tab went on editing the schedule unseen (a
   weekend duty request's start time changed + Tab → the OIL question, the caret in the end-time box behind it).
   On opening, focus moves to the sheet's box (never a button: nothing is one key-press from being answered by
   accident), without scrolling; on closing it goes back to where it was, if that is still on the page and nothing
   else has taken it. The box carries tabIndex -1 and no outline of its own — it is a place for the keys to land, not
   a control. */
import { useEffect, type RefObject } from 'react'

export function useSheetFocus(box: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = box.current
    const before = document.activeElement as HTMLElement | null
    if (el && !el.contains(before)) el.focus({ preventScroll: true })
    return () => {
      const now = document.activeElement
      if (!before || before === document.body || !before.isConnected) return
      if (now === document.body || now == null || (el && el.contains(now))) before.focus({ preventScroll: true })
    }
  }, [])   // on opening and closing only — a repaint of the sheet never moves the keys
}
