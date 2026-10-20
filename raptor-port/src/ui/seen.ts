/* A SAVE THE SCREEN SHOWS SAYS NOTHING (owner D851, 14 Oct 26 — "Why 1 needs an input added note? Isint it obvious when the
   input appears after it’s been added?"; D854 — "Yes to all": "Input updated" the same; the design guide's §1, D850 —
   "When there is a feedback, design it and also don’t need to have a note for very single thing").

   An input just saved is shown where it stands — the Inputs List's row or card, the month's bar, the opened day's card
   — wearing the app's one just-added mark (the blue box of about six seconds; `.innew`, hung by ui/InputsPage.tsx).
   Whatever wears the mark carries `data-fresh="<the input's id>"`. The window that saved it (ui/inputedit.tsx) asks
   HERE whether its "Input added" / "Input updated" is still needed:

     · the marked thing is IN VIEW                     → no note. A screen reader is told the same words (the mark is
                                                         for the eye only).
     · it is marked and laid out, but not in view yet  → the page is on its way to it (the List scrolls to a new row):
                                                         looked at once more when that has had time to end.
     · nothing wears the mark; or what wears it is not
       laid out (the List stays mounted, hidden, under
       the Medical tab); or it is still covered         → the note, in the words it always had.
     · nothing is laid out at all                      → the note, at once: a hidden page shows nothing (and a unit
                                                         test's page is never laid out, so there every save still
                                                         says its words in the same breath as before).
     · ANOTHER NOTE WAS RAISED WHILE THIS ONE WAITED   → that note keeps the screen; these words go to a screen
                                                         reader only. A save's own after-pass raises its warning a
                                                         beat after the save returns, precisely so that it stands
                                                         over the window's plain line (state/holderbase.ts: "LL does
                                                         not go on the Ground Programme — its row has been removed");
                                                         an Undo or a delete pressed inside the wait says its own.
                                                         The plain line, come late, would have replaced each (the
                                                         fresh read of this batch, 14 Oct 26 — F3).

   "IN VIEW" IS D672's — wholly on screen, clear of the top bar and of any window or sheet over it. Asked the way a
   finger would ask it: at the box's head, middle and foot, is the thing standing there the box itself? That one
   question answers all of it — off the screen (nothing stands there), under the top bar or a window (they do), cut by
   the scroller it sits in (its neighbour does).

   Never decided by which page is open: the page can be open and the thing still unseen (a window over it), and that is
   exactly where the note is still owed. */
import { HOOKS } from '../engine/hooks'
import { VIEW_RESET } from '../state/view'
import { readerRegion, sayToReader, toastCount } from './toast'

/** the first look: after the page has drawn the save (its reveal is two commits and an effect) */
export const SEEN_FIRST_MS = 80
/** the second: after a smooth scroll that brings a row on screen has come to rest (ui/onscreen.ts bringRowOnScreen) */
export const SEEN_SETTLE_MS = 600

/** IS IT IN VIEW — its head, its middle and its foot each its own on screen */
export function inView(el: Element | null): boolean {
  if (!el || typeof document === 'undefined' || typeof document.elementFromPoint !== 'function') return false
  const b = el.getBoundingClientRect()
  if (!(b.width > 0 && b.height > 0)) return false
  const x = b.left + b.width / 2, in1 = Math.min(3, b.height / 4)
  for (const y of [b.top + in1, b.top + b.height / 2, b.bottom - in1]) {
    const hit = document.elementFromPoint(x, y)
    if (!hit || !(hit === el || el.contains(hit))) return false
  }
  return true
}

/* is the page laid out at all — never in jsdom, not on a page that is not shown */
const laidOut = () => typeof document !== 'undefined' && typeof document.elementFromPoint === 'function'
  && document.documentElement.getBoundingClientRect().width > 0
/* everything wearing the mark for this input — compared in script, so an id never has to be written into a selector */
const marked = (iid: string) => Array.from(document.querySelectorAll('[data-fresh]')).filter(el => el.getAttribute('data-fresh') === iid)

/* WHAT THE MARK SAYS, IN WORDS, FOR A SCREEN READER — one polite region, made once, the same one every passing note is
   told to (ui/toast.ts sayToReader — [BATCH-14OCT-LEFTOVERS] (f), 21 Oct 26). It is emptied first and filled a beat
   later, so the same words said twice running ("Input updated", "Input updated") are read twice. It is made the moment
   a save asks — a beat before anything is put in it: one made and filled in the same breath is often not read the
   first time. */
const region = readerRegion
const tell = sayToReader

const waits = new Set<ReturnType<typeof setTimeout>>()
const later = (ms: number, fn: () => void) => { const t = setTimeout(() => { waits.delete(t); fn() }, ms); waits.add(t) }

/** THE NOTE AFTER A SAVE, unless the saved input can be seen wearing its mark (the head of this file). */
export function noteUnlessSeen(iid: string, words: string, kind?: any): void {
  if (!iid || !laidOut()) { HOOKS.toast(words, kind); return }
  region()
  /* the note, come late — unless another has been raised since the save asked (the head of this file) */
  const at = toastCount()
  const say = () => { if (toastCount() !== at) tell(words); else HOOKS.toast(words, kind) }
  later(SEEN_FIRST_MS, () => {
    const first = marked(iid)
    if (first.some(inView)) { tell(words); return }
    /* nothing wears it, or nothing that wears it has a box: no scroll can bring it — said now, not after a wait */
    if (!first.some(el => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 })) { say(); return }
    later(SEEN_SETTLE_MS, () => { if (marked(iid).some(inView)) tell(words); else say() })
  })
}

/* a sign-in or sign-out ends what was waiting to be said, as it takes the note itself down (ui/toast.ts clearToast) */
VIEW_RESET.push({
  name: 'SEEN', scopes: ['session'],
  reset: () => { waits.forEach(t => clearTimeout(t)); waits.clear() },   // the words waiting to be told end with the note (ui/toast.ts clearToast)
})
