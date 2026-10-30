/* ESCAPE CLOSES THE SCHEDULER BOARD, AS ✓ DONE DOES ([BOARD-ESCAPE-CLOSE], found by the walk of 24 Oct 26; built 30 Oct 26).
   The design guide §2 (D812): Escape closes what opened last — and with nothing open over it, the board is what opened
   last. D349's reading (a), told to him with "✓ Done only", was that Escape still closes the board; it never did.
   ONLY WITH THE KEYBOARD NOWHERE, OR ON A BUTTON. In one of the board's own boxes Escape is that box's: it puts the old
   time or words back and leaves the box (D1011, ui/textedit.ts routeKeyDown) and the board stays — the next Escape
   closes it. The board's search box has nothing to put back, so Escape there only leaves it (its words, and the
   highlight they make, stay).
   AND ONLY WITH NOTHING OVER THE BOARD. Every window, sheet and menu that can lie over it answers its own Escape, or
   ignores it, first: a window that closes on Escape (useEscClose, ui/FloatWindow.tsx), a question sheet, the ⋯ menu, a
   date box's calendar — and the ones that do not close on it (the changes and ALL AVAIL windows, the Traffic and
   day-details windows, the small menus of + Block, Templates and the plans selector, the bell's list) leave the board
   open too. A seat picked (ARM) is put down first, as the reference's Escape always did; a drag under way is left alone.
   WHY TWO LISTENERS. What stands over the board is read as the key goes DOWN, at the window's capture — the first thing
   to hear it, before any window has closed itself (the bell's list closes on this very press, and a reading taken after
   it would find nothing over the board and close that too). The board closes as the key comes back UP the tree, at the
   window — the last to hear it — and only if no window, sheet, menu or box took the press on the way (a listener that
   stops it never lets it arrive; one that answers it marks it done). A held key's repeats are not a second press: a
   window closed by the first must not take the board with it on the second.
   THE KEYBOARD COMES BACK (the design guide §2): when the board closes, by Escape or ✓ Done, the keyboard goes back to
   where it was when the board opened, if that is still on the page (SchedBoard.tsx). */
import { SBDAY, CURPAGE, ARM, AVAILWIN, CHGWIN } from '../state/view'
import { windowOverSchedule, BELLLIST, OILLIST } from './pops'
import { topSheet } from './sheetfocus'
import { closeScheduler } from './board'

const TYPING = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
/* what can lie over the board that its own flags do not say: the small menus (+ Block, Templates, the plans selector, a
   jet's stores — `.wavemenu`), the ⋯ menu, the bell's list, a date box's calendar, a movable window, any veiled window */
const OVER = '.wavemenu, #sbMoreMenu, .bell-list, .dcal-layer:not(.dcal-patch), .floatwin:not([hidden]), .airpop:not([hidden])'

/* something stands over the board, and Escape is its to answer */
export function overBoard(): boolean {
  if (windowOverSchedule() || topSheet() || AVAILWIN || CHGWIN || BELLLIST || OILLIST) return true
  if (typeof document === 'undefined') return false
  if (document.querySelector(OVER)) return true
  /* a puck or a row being dragged */
  return document.body.classList.contains('tdrag') || document.body.classList.contains('dnd') || !!document.querySelector('.rowdrag, .secdrag')
}

type Want = '' | 'close' | 'leave'
/* what this Escape is for, read where the keyboard is and what stands over the board as the key goes down */
export function boardEscapeWants(target: EventTarget | null): Want {
  if (SBDAY == null || CURPAGE !== 'editsched' || ARM || overBoard()) return ''
  const t = target as HTMLElement | null
  if (t && t.nodeType === 1 && typeof t.closest === 'function') {
    if (t.id === 'searchB' && t.closest('#schedBoard')) return 'leave'
    if (t.closest(TYPING) || t.isContentEditable) return ''
  }
  return 'close'
}

export function wireBoardEscape(): () => void {
  let want: Want = ''
  const down = (e: KeyboardEvent) => { want = e.key === 'Escape' && !e.repeat && !e.isComposing ? boardEscapeWants(e.target) : '' }
  const up = (e: KeyboardEvent) => {
    const w = want; want = ''
    if (e.key !== 'Escape' || !w || e.defaultPrevented) return
    e.preventDefault()
    if (w === 'leave') { (e.target as HTMLElement).blur(); return }
    closeScheduler()
  }
  window.addEventListener('keydown', down, true)
  window.addEventListener('keydown', up)
  return () => { window.removeEventListener('keydown', down, true); window.removeEventListener('keydown', up) }
}
