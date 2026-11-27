/* THE GUARD'S NOTE — WHAT A REFUSAL SAYS, AND WHERE IT STANDS (the guard rail's plan §4.6; step K3, chat 204).

   A door that refuses (state/guard.ts refuse — a pick, the view switch, a bell line, a tap on the lit bell) hands its
   refusal to the seam's one way to say it, which is this file's `guardSay`: the words joined from ui/guard.ts's two
   tables ("Blocked: " + a lead + ", then " + an ending — his words only), raised as the app's grey "Blocked:" note
   through ui/toast.ts toastAt, which stands it by the control pressed. This file holds the one table of door → control:
   - a pick → under the squadron picker (`#sqnMenuBtn`), its left edge, 8px under the top bar (the drawing p1b);
   - the switch to the member view and back → under the role badge (`#roleBadge`), its right edge (p2b);
   - a bell line → under the pressed line inside the bell's list where it fits, else under the list (p4b);
   - a tap on the lit bell → under the bell on screen (the one the list opens under, else the bell drawn — the board's
     `#sbBell` on the board), its right edge;
   - an Undo (step K8 — §4.1 rows 13 and 21) → under the Undo button on screen (the top bar's `#undoBtn`; the board's
     `#sbUndo` while the board, drawn over the top bar, is up), its left edge; at the foot on a phone, as every note is;
   - a card, the page door, a Redo (no ending of his yet) → the foot.
   A press made inside the ☰ menu goes to the foot (`from: 'drawer'` — ui/toast.ts noteAtFoot).
   With no page — a headless test — the words go to HOOKS.toast as a 'blocked' note. The note is told to a screen reader by
   toast() as every note is.

   Loaded by one side-effect import each in ui/Shell.tsx (the app) and test-support/msq-world.ts (the test world); never by
   ui/guard.ts, which this file reads, so there is no cycle. No door calls the seam yet (K4–K6): installed, never asked. */
import { setGuardSay, noteSaid, type GuardOpts, type GuardRefusal } from '../state/guard'
import { HOOKS } from '../engine/hooks'
import { toastAt, type NoteAt } from './toast'
import { guardLead, guardRow, guardWords } from './guard'
import { BELLAT } from './pops'

const byId = (id: string) => (): HTMLElement | null => document.getElementById(id)
/* the bell on screen: the one its list was opened under, else the first drawn (the top bar's, or the board's) */
const bellOnScreen = (): HTMLElement | null =>
  (BELLAT ? document.getElementById(BELLAT) : null)
  || [...document.querySelectorAll<HTMLElement>('.bellbtn')].find(b => b.getClientRects().length > 0) || null
const lineEl = (id: string | undefined) => (): HTMLElement | null =>
  id ? document.querySelector<HTMLElement>(`[data-testid="bell-line-${id.replace(/["\\]/g, '\\$&')}"]`) : null
const footOnly = (): HTMLElement | null => null
/* the Undo pressed: the board's own while the board is up (it covers the top bar and carries its own pair), else the top
   bar's (the board is always in the page, hidden while shut — ui/SchedBoard.tsx `hidden={!open}`) */
const undoOnScreen = (): HTMLElement | null => {
  const sb = document.getElementById('sbUndo')
  return sb && !sb.closest('[hidden]') ? sb : document.getElementById('undoBtn')
}

/** THE TABLE, door → where the note stands (§4.6's last bullets) */
export function noteAtFor(door: string, opts: GuardOpts = {}): NoteAt {
  const from = opts.from
  switch (door) {
    case 'pick': return { under: byId('sqnMenuBtn'), edge: 'left', below: 'bar', from }
    case 'toMember': case 'toAdmin': return { under: byId('roleBadge'), edge: 'right', below: 'bar', from }
    case 'line': return { under: lineEl(opts.line), edge: 'left', below: 'self', inside: () => document.querySelector<HTMLElement>('.bell-list'), from }
    case 'bell': return { under: bellOnScreen, edge: 'right', below: 'bar', from }
    case 'undo': return { under: undoOnScreen, edge: 'left', below: 'bar', from }
    /* a card of the OIL list, the page door, a Redo, anything else: the foot */
    default: return { under: footOnly, edge: 'left', below: 'bar', from }
  }
}

/** THE SEAM'S ONE WAY TO SAY A REFUSAL — the words, raised by the control pressed */
export function guardSay(r: GuardRefusal, door: string, to: string, opts: GuardOpts = {}): void {
  const row = guardRow(r.id)
  if (!row) return
  const words = guardWords(r.reason, row, door, to)
  /* a door with no ending of his yet (a card, the page door, a Redo — the K8 report lists them) says nothing here */
  if (!words) return
  /* (the words reported to the seam, so a caller that shows its own refusal — Undo's engine — does not say them twice) */
  noteSaid(words)
  if (typeof document === 'undefined') { HOOKS.toast(words, 'blocked'); return }
  toastAt(words, { ...noteAtFor(door, opts), names: guardLead(row).names })
}
setGuardSay(guardSay)
