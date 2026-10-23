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
   it runs before the schedule's own Tab route and before any page's handler — and is taken off with the last sheet.
   THE ✕ IS THE LAST STOP, NOT THE FIRST (the design look's L2 and K7, owner D830 — 13 Oct 26). The ✕ is written first in
   a sheet's head, so the first Tab landed on "Close" — the one control nobody opened the sheet to press — before any
   answer. It is drawn in the head's corner now (08-windows-tools.css) and the keys agree with the eye: Tab goes through
   the sheet's own controls first and reaches the ✕ last; Shift+Tab from the first control goes to it. Only the two
   steps around the ✕ are taken over — every other Tab is the browser's own, as before.
   ONE SHEET MAY NAME WHERE THE KEYS LAND (`first`): the OIL question puts them on its first answer (K7) — picking an
   answer answers nothing until the sheet's right-hand button is pressed, so nothing is one key-press from being done by
   accident. Every other sheet still lands on its box. */
import { useEffect, type RefObject } from 'react'

const sheets: HTMLElement[] = []
const STOPS = 'button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
function keepKeys(e: KeyboardEvent): void {
  if (e.key !== 'Tab' || e.ctrlKey || e.altKey || e.metaKey) return
  const el = sheets[sheets.length - 1]
  if (!el || !el.isConnected) return
  const stops = [...el.querySelectorAll<HTMLElement>(STOPS)].filter(n => !(n as HTMLButtonElement).disabled && !n.closest('[hidden]'))
  const at = document.activeElement as HTMLElement | null
  /* the order the keys go round in: the sheet's own, with the head's ✕ moved to the end */
  const x = stops.find(n => n.classList.contains('x') && !!n.closest('.airpop-head, .modal-head'))
  const order = x ? [...stops.filter(n => n !== x), x] : stops
  const first = order[0], last = order[order.length - 1]
  if (!first || !last) { e.preventDefault(); el.focus({ preventScroll: true }); return }
  const go = (n: HTMLElement) => { e.preventDefault(); n.focus({ preventScroll: true }) }
  if (!at || at === el || !el.contains(at)) { go(e.shiftKey ? last : first); return }
  if (e.shiftKey && at === first) { go(last); return }
  if (!e.shiftKey && at === last) { go(first); return }
  if (!x) return
  /* the browser's own next stop would be the ✕ where it stands in the page — step over it, or onto it, by `order` */
  const i = order.indexOf(at), j = stops.indexOf(at)
  if (i < 0 || j < 0) return
  const natural = stops[j + (e.shiftKey ? -1 : 1)], wanted = order[i + (e.shiftKey ? -1 : 1)]
  if (wanted && natural !== wanted) go(wanted)
}

/** `open` — for a sheet that stays mounted and is shown and hidden (the board's two dialogs); a sheet that is mounted
    only while it is up leaves it at its default. */
export function useSheetFocus(box: RefObject<HTMLElement | null>, open = true, first?: (box: HTMLElement) => HTMLElement | null): void {
  useEffect(() => {
    const el = box.current
    if (!open || !el) return
    const before = document.activeElement as HTMLElement | null
    const back = opener; opener = null
    if (!el.contains(before)) ((first && first(el)) || el).focus({ preventScroll: true })
    if (!sheets.length) document.addEventListener('keydown', keepKeys, true)
    sheets.push(el)
    return () => {
      const i = sheets.lastIndexOf(el)
      if (i >= 0) sheets.splice(i, 1)
      if (!sheets.length) document.removeEventListener('keydown', keepKeys, true)
      const now = document.activeElement
      /* where it came from — or, when that was a menu item the menu took away with it, the button that opened the menu */
      const to = before && before !== document.body && before.isConnected && !el.contains(before) ? before : back ? back() : null
      if (!to) return
      if (now === document.body || now == null || el.contains(now)) to.focus({ preventScroll: true })
    }
  }, [open])   // on opening and closing only — a repaint of the sheet never moves the keys
}

/* A WINDOW OPENED FROM A MENU GIVES THE KEYBOARD BACK TO THE MENU'S BUTTON ([BOARD-MODALS-ESCAPE], 24 Oct 26). The
   Duty templates, Day templates and Plans windows open from an item of a small menu ("+ Block", Templates, the plans
   selector) that is taken away as the window opens, so the window's "where it came from" is gone by the time it closes.
   The menu notes its own button just before it opens the window; the next sheet to take the keyboard takes the note
   (once), and gives the keyboard back to that button when it closes. The week and the board are redrawn from strings, so
   the button may be a new one by then: it is found again by its id, or else by its first data attribute — the one shown
   on screen where there are two. */
let opener: (() => HTMLElement | null) | null = null
export function noteOpener(el: HTMLElement | null): void {
  if (!el) { opener = null; return }
  const q = (v: string) => v.replace(/["\\]/g, '\\$&')
  const da = [...el.attributes].find(x => x.name.startsWith('data-'))
  const sel = el.id ? `[id="${q(el.id)}"]` : da ? `${el.tagName.toLowerCase()}[${da.name}="${q(da.value)}"]` : ''
  opener = () => {
    if (el.isConnected) return el
    if (!sel) return null
    const all = [...document.querySelectorAll<HTMLElement>(sel)]
    return all.find(n => n.getClientRects().length > 0) || all[0] || null
  }
}

/* ESCAPE CLOSES THE WINDOW (the design guide §2 — Escape closes what opened last; [BOARD-MODALS-ESCAPE]). Heard on the
   document before the page's own keys (the Scheduler Board closes on Escape too, and must not go with it), and only while
   this window is the topmost sheet: a question sheet raised over it answers its own Escape first. */
export function useEscClose(box: RefObject<HTMLElement | null>, open: boolean, close: () => void): void {
  useEffect(() => {
    if (!open) return
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      const el = box.current
      if (!el || sheets[sheets.length - 1] !== el) return
      e.stopPropagation(); e.preventDefault()
      close()
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  })
}
