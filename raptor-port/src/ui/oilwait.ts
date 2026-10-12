/* THE CHANGE THAT WAITS ON ITS OIL ANSWER ([OIL-ASK-NOTIFY] — the plan
   docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md §3.1, §5a).

   Owner, D780: "When a swap is made, maybe u shouldn't allow the person to cancel the oil question until answered?"
   D781: a swap's or an add's OIL question cannot be left open. D783 ("Yes to all" — the pictures of record
   docs/mock/2026-10-12-oil-notify/): the swap or the add "is NOT MADE until the question is answered — nothing moves;
   not answered, both pucks flash and a bar stays until tapped ('Not swapped — OIL not answered', Answer OIL, OK)"; a
   person ADDED with no answer yet is treated the same; nobody else is told; a MOVE waits the same way.

   So the question comes FIRST and the write only on an answer. A door that would have to ask (the row of an input,
   ui/reqdoor.ts; the Unavailable row's person, ui/inputedit.tsx reassignInput; the Inputs calendar's date drag,
   ui/caldrag.ts) has already tried its own save and thrown it away (inputedit.tsx dryRun — so the question is never
   put for a change that would be refused), writes nothing, and hands the change here. ui/OilWaitSheet.tsx draws the
   question; this file is what its buttons do:
     · answered      → the door's own call again, with the answer: the change and the answer in ONE command, one Undo;
     · not answered  → nothing is written; the places flash (ui/lift.ts — the app's own landing flash) and the bar
                       stays (ui/OilWaitSheet.tsx OilBar) until "Answer OIL" (the door asked afresh) or "OK" (it only closes).
   The waiting change and the bar live in state/view.ts, with the resets that take them away. */
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { posKey, ridWriteKey } from '../engine/rowids'
import { notify } from '../state/store'
import { OILWAIT, OILBAR, setOilWait, setOilBar, type OilWait, type OilWaitKind } from '../state/view'
import { landOn } from './lift'

/** the three kinds' words: the sheet's two buttons, and the bar */
export const WAIT_WORDS: Record<OilWaitKind, { no: string; yes: string; not: string }> = {
  swap: { no: 'Don’t swap', yes: 'Swap', not: 'Not swapped — OIL not answered' },
  add: { no: 'Don’t add', yes: 'Add', not: 'Not added — OIL not answered' },
  move: { no: 'Don’t move', yes: 'Move', not: 'Not moved — OIL not answered' },
}
/* the row, the seat or the men on them are no longer what the question was asked about */
const CHANGED: Record<OilWaitKind, string> = {
  swap: 'That row has changed — not swapped',
  add: 'That row has changed — not added',
  move: 'That has changed — not moved',
}

/** A door holds its change: nothing is written, the question is put. */
export function holdForOil(w: OilWait): void { setOilBar(null); setOilWait(w); notify() }
/** The gesture's own ending for the change now waiting (the landing flash, the "already busy" note, the arm put
 *  down) — set by the caller that was answered 'asked'; `pre` is read just before the write, `post` runs after it. */
export function oilWaitThen(pre: () => any, post: (pre: any, landed: string | null) => void): void {
  if (OILWAIT) { OILWAIT.pre = pre; OILWAIT.post = post }
}

/** ONE MORE PLACE TO FLASH IF IT IS LEFT UNANSWERED — the seat a caller's gesture started from, where the door that
 *  holds the change does not know it (the Unavailable row's door is handed a person, never the seat he was dragged
 *  from: ui/drag.ts). `key` is the seat as it stands now; it is kept by its row's id, like every other place. "Both
 *  pucks flash" (D783 (2)) at every door — the walk's C2, 13 Oct 26. */
export function oilWaitAlso(key: string): void {
  if (!OILWAIT || !key) return
  const pl = ridWriteKey(String(key), DAYS)
  if (pl && !OILWAIT.places.includes(pl)) OILWAIT.places.push(pl)
}

/* the places flash where they stand — the same veil a landed drop wears; nothing was rebuilt, so the live nodes are lit
   directly (drag.ts's "dropped back where he started" precedent) */
function flash(places: readonly string[]): void {
  if (typeof document === 'undefined') return
  for (const pl of places) {
    const sel = pl.startsWith('sel:') ? pl.slice(4) : (() => { const k = posKey(pl, DAYS); return k ? `[data-slot="${k}"]` : '' })()
    if (!sel) continue
    document.querySelectorAll<HTMLElement>(sel).forEach(el => landOn((el.closest('.seat') as HTMLElement | null) || el))
  }
}

/** ANSWERED — the change and the answer, in one command. True when it was made. */
export function answerOilWait(oil: Record<string, number>): boolean {
  const w = OILWAIT
  if (!w) return false
  setOilWait(null)
  const pre = w.pre ? w.pre() : undefined
  const a = w.redo(oil)
  if (a === 'done') { if (w.post) w.post(pre, w.landed ?? null) }
  else if (a !== 'refused') HOOKS.toast(CHANGED[w.kind], 'warn')
  notify()
  return a === 'done'
}
/** NOT ANSWERED — "Don’t swap", ✕, Escape, a press outside: nothing is written; the places flash and the bar stays. */
export function leaveOilWait(): void {
  const w = OILWAIT
  if (!w) return
  setOilWait(null)
  setOilBar({ text: WAIT_WORDS[w.kind].not, wait: w })
  flash(w.places)
  notify()
}
/** the bar's OK — it only closes */
export function oilBarOk(): void { if (OILBAR) { setOilBar(null); notify() } }
/** the bar's "Answer OIL" — the door is asked AFRESH: the question comes back; a row that has since changed says so;
 *  and where someone has answered the input meanwhile there is nothing left to ask, so the change is simply made. */
export function oilBarAgain(): void {
  const b = OILBAR
  if (!b) return
  setOilBar(null)
  const w = b.wait
  const pre = w.pre ? w.pre() : undefined
  const a = w.ask()
  if (a === 'asked') { if (OILWAIT && w.pre && w.post) { OILWAIT.pre = w.pre; OILWAIT.post = w.post } }
  else if (a === 'done') { if (w.post) w.post(pre, w.landed ?? null) }
  else if (a !== 'refused') HOOKS.toast(CHANGED[w.kind], 'warn')
  notify()
}
