/* THE BAR STAYS PRESSABLE OVER A WINDOW — one body for every veiled window that takes the Traffic window's way (owner
   D1645, 5 Nov 26 — "Go" on the mock-up page's question 1, docs/mock/2026-11-05-keys-windows/; [VEILED-WINDOWS-BAR]).
   The Traffic window was the first ([TRAFFIC-WIN-COVERS-UNDO], 30 Oct 26 — its reasons stand in ui/Modals.tsx AirPop);
   "Jump to a date" (ui/WeekCal.tsx), the day-details window (Modals.tsx DayPop) and the document viewer (ui/DocViewer.tsx)
   follow it, so the machinery lives here, once, rather than copied four times:
     · THE VEIL STARTS AT THE BAR'S FOOT — the top bar, or the Scheduler Board's own bar while the board is open (it lies
       over the top bar) — measured as the window opens, on a resize and whenever the bar's height changes (a failed
       save's band, the highlight strip); the box is held inside what is left (`.airpop.air-below`, 08-windows-tools.css).
     · UNDO AND REDO WORK WITH THE WINDOW OPEN (`BAR_KEEPS`); any OTHER control of the bar — a page name, the bell, the
       changes clock, ✓ Done, a day chip — first closes the window, as a press on the veil does, and then does its own job.
     · AFTER UNDO OR REDO, ESCAPE STILL CLOSES THE WINDOW (each window's own Escape, heard on the document — the D1645 row's
       "Escape still closes the window after Undo is pressed"), and when it closes with the keys still on Undo or Redo they
       go back to the control that opened it (the design guide §2: the keyboard returns to the button that opened a thing).
       A close by another bar control leaves them where that press put them.
   NOT OVER ANOTHER VEIL. The document viewer can open over a window that keeps the bar covered — an input's own window
   (the paperclip of its foot, a Document chip's name) — and so can any of these over a question sheet. The input window
   and the question sheets keep the bar covered on purpose (D1645: the one holds typing not yet saved, the others exist
   to stop a change until they are answered), so a window opened over one of them keeps its whole veil too: once placed
   below the bar, what the browser finds at the bar's Undo (or the bar's middle) must be the bar itself; where another
   veil is found there, the window goes back to covering the whole screen, as before. A browser test proves the press
   lands (e2e/keys-windows.spec.ts); jsdom has no layout, and there every window is taken as free, as the Traffic window
   always was. */
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { locate } from './sheetfocus'

/* the bar over a window: the Scheduler Board's own while it is open (it lies over the top bar), else the top bar */
export const BAR_OVER = (): Element | null =>
  document.querySelector('#schedBoard:not([hidden]) .sb-top') || document.getElementById('burger')?.closest('.topbar') || null
/* the buttons of the bar a press on which leaves the window open — the top bar's Undo and Redo, and the board's */
export const BAR_KEEPS = '#undoBtn, #redoBtn, #sbUndo, #sbRedo'
const BARS = '.topbar, #schedBoard .sb-top'

/* is the bar, once this window's veil is moved below it, still covered by something else — another window's veil? */
function barCovered(bar: Element): boolean {
  if (typeof document.elementFromPoint !== 'function') return false
  const keep = [...bar.querySelectorAll<HTMLElement>(BAR_KEEPS)].find(n => n.getClientRects().length > 0)
  const r = (keep || bar).getBoundingClientRect()
  if (!r.width || !r.height) return false
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return !!hit && !bar.contains(hit)
}

/** The window `pop` (its veil, `.airpop`) leaves the bar over it pressable while `open`; `close` closes it — called when
    another control of the bar is pressed. */
export function useBarFree(pop: RefObject<HTMLElement | null>, open: boolean, close: () => void): void {
  /* the control that opened the window, read as it opens (before any window has moved the keys into itself) */
  const opener = useRef<(() => HTMLElement | null) | null>(null)
  const closeRef = useRef(close)
  closeRef.current = close
  /* a passive effect, never a layout one: React puts the focus back where it was before a commit once the commit's DOM
     work is done, so keys moved by a layout effect's cleanup are moved straight back onto Undo */
  useEffect(() => {
    if (!open) return
    const n = pop.current
    const was = document.activeElement as HTMLElement | null
    opener.current = was && was !== document.body && was.isConnected && !(n && n.contains(was)) ? locate(was) : null
    return () => {
      /* closed with the keys on Undo or Redo (pressed while it was up): they go back to its opener */
      const a = document.activeElement as HTMLElement | null
      const to = opener.current ? opener.current() : null
      opener.current = null
      if (a && typeof a.closest === 'function' && a.closest(BAR_KEEPS) && to && to.isConnected) to.focus({ preventScroll: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- on opening and closing only: `pop` is the window's own ref, fixed for its life
  }, [open])
  /* placed on every paint (no dependency list): what the window shows can change its height, and the bar's own height can
     change under it — the ResizeObserver hears the bar, the resize listener the screen */
  useLayoutEffect(() => {
    const n = pop.current
    if (!n || !open) return
    const place = () => {
      const bar = BAR_OVER()
      const b = bar ? Math.round(bar.getBoundingClientRect().bottom) : 0
      n.style.top = b > 0 ? b + 'px' : ''
      n.classList.add('air-below')
      if (bar && b > 0 && barCovered(bar)) { n.style.top = ''; n.classList.remove('air-below') }
    }
    place()
    window.addEventListener('resize', place)
    const bar = BAR_OVER()
    const ro = bar && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null
    if (ro && bar) ro.observe(bar)
    return () => { window.removeEventListener('resize', place); ro?.disconnect() }
  })
  useEffect(() => {
    if (!open) return
    const press = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t || typeof t.closest !== 'function' || !t.closest(BARS)) return
      if (t.closest(BAR_KEEPS)) return
      closeRef.current()
    }
    document.addEventListener('click', press, true)
    return () => document.removeEventListener('click', press, true)
  }, [open])
}
