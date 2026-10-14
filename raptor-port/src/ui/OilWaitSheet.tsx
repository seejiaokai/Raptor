/* THE OIL QUESTION PUT BEFORE A CHANGE, AND THE BAR THAT SAYS IT WAS NOT MADE ([OIL-ASK-NOTIFY] — owner D783, 12 Oct 26,
   "Yes to all"; the pictures of record docs/mock/2026-10-12-oil-notify/, *-swap-3-question-waits.png and
   *-swap-5-after-stays.png; the plan docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md §3.1).

   A swap, an add or a move that raises the OIL question is NOT MADE until the question is answered. The door wrote
   nothing and left the change waiting (state/view.ts OILWAIT); this draws the question for it — the OIL question's
   own sheet (ui/OilConfirm.tsx), with a line saying what is waiting and two buttons saying what each does. No window
   of the input stands behind it: nothing has changed, so there is nothing of the input to show.
     · the right-hand button, live once an answer is picked → the change and the answer, one command (ui/oilwait.ts);
     · the left-hand button, ✕, Escape, a press outside → nothing is made; both pucks flash and THE BAR stays:
       "Not swapped — OIL not answered" · Answer OIL (the question comes back) · OK (it only closes).
   The question is mounted at App level, like the medical move's (ui/MedMoveConfirm.tsx), so it opens over whatever
   surface the gesture was on — the week, the Scheduler Board, the Inputs calendar. Only a scheduler's gesture reaches the
   row's door; the calendar's drag is whoever may move the input; nothing here is shown to anyone a door did not ask.

   THE BAR IS A BAND UNDER THE TOP BAR, ONE LINE ALWAYS ([LOOK-13OCT-SMALL-FIXES] — owner D831, 13 Oct 26, and D840,
   14 Oct 26: "I prefer the one line"; the drawing of record docs/mock/oil-band-14oct.html, scripts/handpass/dl-band.mjs).
   It floated at the foot of the screen in the "Set as default" offer's look: on a phone half the screen wide, its
   sentence broken in two, over the names in Available crew that he might tap next (the design look's L6). It is the
   same kind of thing as the failed-save warning — news that stays until he acts — so it lives where that lives (D587;
   ui/SaveStatus.tsx, 17-save-status.css): a line along the bottom of the top bar, the page moved down by it and nothing
   covered; and under the bar of a full-screen surface that lies over the top bar (the Scheduler Board, the Medical
   view opened full) — `OilBand`, in that surface's own flow, exactly as `SaveBand` is. Its words, its two buttons and
   its staying until tapped are as ruled (D783); where a save has also failed, "Not saved" is the line above it. */
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { OILWAIT, OILBAR } from '../state/view'
import { OilConfirm } from './OilConfirm'
import { WAIT_WORDS, answerOilWait, leaveOilWait, oilBarAgain, oilBarOk } from './oilwait'
import { useVersion } from './useStore'

export function OilWait() {
  useVersion()
  const w = OILWAIT
  if (!w) return null
  const words = WAIT_WORDS[w.kind]
  return <OilConfirm who={w.gate.who} typeLabel={w.gate.typeLabel} plan={w.gate.plan} prev={w.gate.prev}
    lead={w.lead} noLabel={words.no} yesLabel={words.yes}
    onCancel={leaveOilWait} onSave={dec => { answerOilWait(dec) }} />
}

/* ONE BAR ON SCREEN, ONE FOR THE KEYBOARD AND A SCREEN READER — the failed-save warning's own rule (ui/SaveStatus.tsx,
   Astra's read F5). While a full-screen surface shows the bar under its own bar, the top bar's copy would be painted
   over but still a second "Answer OIL" to tab to. So each showing `OilBand` counts itself in, and while any is counted
   the top bar's copy is not drawn at all. */
let covering = 0
const coverSubs = new Set<() => void>()
const subscribeCover = (fn: () => void) => { coverSubs.add(fn); return () => { coverSubs.delete(fn) } }
const readCover = (): boolean => covering > 0
const cover = (d: 1 | -1) => { covering += d; for (const f of [...coverSubs]) f() }

/** Is the bar up in the TOP BAR's own line? Shell asks, to make room for it there (the bar is one line taller). */
export function useOilBarTop(): boolean {
  useVersion()
  const covered = useSyncExternalStore(subscribeCover, readCover, readCover)
  return !!OILBAR && !OILWAIT && !covered
}

/* ALWAYS ONE LINE (owner D840 — "I prefer the one line", of the drawing whose wider-letters case put the two buttons
   under the words). The app loads no font of its own, so his iPhone draws these words in Apple's letters, wider than
   the ones the line was measured in. Where the words and both buttons do not fit the line, the bar's letters and the
   room round them go a step smaller (`--oil-fit`, read by 17-save-status.css) until they do — never below about four
   fifths — and then the buttons' own side room closes up (`is-tight`). No word is cut and nothing drops to a second
   line. Measured on the page (a browser's job: there is no layout to measure in the unit tests), and again whenever
   the line's width changes — a phone turned, a window narrowed. */
const FIT_FLOOR = 0.78, FIT_STEP = 0.03, TIGHT_FLOOR = 0.6
function fitOneLine(el: HTMLElement): void {
  el.style.removeProperty('--oil-fit')
  el.classList.remove('is-tight')
  const over = () => el.scrollWidth > el.clientWidth + 0.5
  for (let f = 1 - FIT_STEP; over() && f >= FIT_FLOOR - 1e-9; f -= FIT_STEP) el.style.setProperty('--oil-fit', f.toFixed(2))
  if (over()) el.classList.add('is-tight')
  /* …AND ON THE NARROWEST PHONES WITH WIDER LETTERS, A LITTLE FURTHER (GitHub's machines, 15 Oct 26: at 320 wide the words
     stayed on one line but "OK" went past the screen's edge — the floor above was reached with letters wider than the
     test browser's, as his iPhone's are). Tight, the bar's own side room closes up too (17-save-status.css) and the
     letters may go on down to about three fifths — still one line, still both buttons, still on the screen (D840). */
  for (let f = FIT_FLOOR - FIT_STEP; over() && f >= TIGHT_FLOOR - 1e-9; f -= FIT_STEP) el.style.setProperty('--oil-fit', f.toFixed(2))
}

/* the bar itself — the same words and the same two buttons wherever it is drawn */
function Bar({ top }: { top?: boolean }) {
  const b = OILBAR
  const el = useRef<HTMLDivElement>(null)
  const answer = useRef<HTMLButtonElement>(null)
  /* A KEYBOARD CAN REACH IT AND CLOSE IT (the design look's L7, K8, K9 — owner D830, 13 Oct 26). The bar came up with
     the keyboard back on the puck, "Answer OIL" over a hundred Tab presses away, and Escape did nothing to it. When it
     appears the keyboard goes to "Answer OIL" — after the question's own sheet has handed the keys back
     (ui/sheetfocus.ts; an unmounting sheet's hand-back runs before this) — and Escape, pressed while the keyboard is on
     the bar, closes it as OK does. Heard on the bar itself, never on the page: with the keyboard anywhere else Escape
     belongs to whatever it is on — a window, a text box, the schedule's own Escape — and is not taken from it.
     A REPEAT of the Escape that closed the question is not a press on the bar (the fresh read of 14 Oct 26, R2): the
     keyboard is put here in the same turn the question closes, so a key held a moment too long sent its repeats to
     the bar and took the question and the bar away together — nothing left saying the change was not made. */
  useEffect(() => { answer.current?.focus({ preventScroll: true }) }, [])
  const text = b ? b.text : ''
  useLayoutEffect(() => {
    const n = el.current
    if (!n) return
    /* WHERE THE TOP BAR'S COPY SITS IS MEASURED, as the failed-save warning's is (ui/SaveStatus.tsx useFollowTheBar):
       the bar is one line or two by page and width, and on a phone it is a sideways scroll box — so the band is
       `position:fixed`, its top the bar's bottom less its own height, inside the room `.topbar.oil-waiting` makes. */
    const bar = top ? n.closest('.topbar') as HTMLElement | null : null
    const place = () => {
      fitOneLine(n)
      if (bar) n.style.top = `${Math.max(0, Math.round(bar.getBoundingClientRect().bottom) - n.offsetHeight - (parseFloat(getComputedStyle(bar).borderBottomWidth) || 0))}px`
    }
    place()
    window.addEventListener('resize', place)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(place)
    if (bar) ro?.observe(bar)
    ro?.observe(n)
    return () => { window.removeEventListener('resize', place); ro?.disconnect() }
  }, [top, text])
  if (!b) return null
  return (
    <div className={'oilband' + (top ? ' is-top' : '')} role="status" data-testid="oilbar" ref={el}
      onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); if (!e.repeat) oilBarOk() } }}>
      <span className="oil-msg" data-testid="oilbar-text">{b.text}</span>
      <button type="button" ref={answer} className="yes" data-testid="oilbar-answer" onClick={oilBarAgain}>Answer OIL</button>
      <button type="button" data-testid="oilbar-ok" onClick={oilBarOk}>OK</button>
    </div>
  )
}

/* It stays until it is tapped (D783 (2)) — no timer: a swap that was not made is news the scheduler must not miss by
   looking away for seven seconds. A week, a page or a sign-in that changes under it takes it away (state/view.ts).
   THE TOP BAR'S OWN COPY — drawn by Shell inside the top bar, beside the failed-save warning. */
export function OilBar() {
  const up = useOilBarTop()
  return up ? <Bar top /> : null
}

/** The same bar, IN THE FLOW of a full-screen surface, under that surface's own bar (D831, as D587 for the save warning).
    `active` is false while its surface is closed but still drawn (the board stays in the page, hidden). */
export function OilBand({ active = true }: { active?: boolean }) {
  useVersion()
  const up = !!OILBAR && !OILWAIT && active
  useEffect(() => {
    if (!up) return
    cover(1)
    return () => cover(-1)
  }, [up])
  return up ? <Bar /> : null
}
