/* A QUESTION SHEET TAKES THE KEYBOARD WHEN IT OPENS — AND KEEPS IT (W12, the Codex stack check, 5–6 Oct 26).
   The confirmation sheets — the OIL question, the upchit one, "covers other days", "no medical document", and on the
   Scheduler Board the cancel-reason and Sort all dialogs — are drawn over whatever surface asked for them, and none
   took focus: the caret stayed where it was, behind the sheet. From the schedule's own text boxes that meant typed
   characters and Tab went on editing the schedule unseen (a weekend duty request's start time changed + Tab → the OIL
   question, the caret in the end-time box behind it).
   On opening, focus moves to the sheet's box (never a button: nothing is one key-press from being answered by
   accident), without scrolling; on closing it goes back to where it was, if that is still on the page and nothing
   else has taken it. The box carries tabIndex -1 and no outline of its own — it is a place for the keys to land, not
   a control.
   AND IT KEEPS THEM (RF2, 6 Oct 26 — Astra's and Sol's reads of the first fix): taking focus once was not enough —
   Shift+Tab from the sheet's first button walked back into the editor underneath, where typing changed the request
   behind an unanswered question. While a sheet is up, Tab and Shift+Tab go round inside it: past its last control
   to its first, before its first to its last, and a Tab pressed anywhere else on the page comes back into it. Only
   the topmost sheet answers (they open one over another); the listener is on the document, in the capture phase, so
   it runs before the schedule's own Tab route and before any page's handler — and is taken off with the last sheet. */
import { useEffect, type RefObject } from 'react'

const sheets: HTMLElement[] = []
const STOPS = 'button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
function keepKeys(e: KeyboardEvent): void {
  if (e.key !== 'Tab' || e.ctrlKey || e.altKey || e.metaKey) return
  const el = sheets[sheets.length - 1]
  if (!el || !el.isConnected) return
  const stops = [...el.querySelectorAll<HTMLElement>(STOPS)].filter(n => !(n as HTMLButtonElement).disabled && !n.closest('[hidden]'))
  const at = document.activeElement as HTMLElement | null
  const first = stops[0], last = stops[stops.length - 1]
  if (!first || !last) { e.preventDefault(); el.focus({ preventScroll: true }); return }
  if (!at || at === el || !el.contains(at)) { e.preventDefault(); (e.shiftKey ? last : first).focus({ preventScroll: true }); return }
  if (e.shiftKey && at === first) { e.preventDefault(); last.focus({ preventScroll: true }) }
  else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus({ preventScroll: true }) }
}

/** `open` — for a sheet that stays mounted and is shown and hidden (the board's two dialogs); a sheet that is mounted
    only while it is up leaves it at its default. */
export function useSheetFocus(box: RefObject<HTMLElement | null>, open = true): void {
  useEffect(() => {
    const el = box.current
    if (!open || !el) return
    const before = document.activeElement as HTMLElement | null
    if (!el.contains(before)) el.focus({ preventScroll: true })
    if (!sheets.length) document.addEventListener('keydown', keepKeys, true)
    sheets.push(el)
    return () => {
      const i = sheets.lastIndexOf(el)
      if (i >= 0) sheets.splice(i, 1)
      if (!sheets.length) document.removeEventListener('keydown', keepKeys, true)
      const now = document.activeElement
      if (!before || before === document.body || !before.isConnected || el.contains(before)) return
      if (now === document.body || now == null || el.contains(now)) before.focus({ preventScroll: true })
    }
  }, [open])   // on opening and closing only — a repaint of the sheet never moves the keys
}
