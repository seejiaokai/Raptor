/* THE GUARD RAIL'S SEAM — "is anything open?" asked by the doors, answered by the screens (the guard rail's plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §3.1; his D2403, D2596, D2597).

   The doors that change the squadron in view or the view (state/pick.ts, state/store.ts switchRoleView, state/belltap.ts,
   the page door) live in state/ and may not import ui/, where the windows are drawn. So this file holds only the seam, in
   the repo's own pattern (setWarWindowsProbe, setSessionWorldHook, onBeforeTrackerSwitch): ui/guard.ts installs its
   answer here as it loads, and a door asks through it. No imports — it can never pull a screen into state/.

   With nothing installed nothing is ever open, nothing is refused and closeShown() does nothing: a headless test, or a
   build that never loads the guard, behaves exactly as before. K1a (the first pass of part A) builds the seam only — no
   door calls any of it yet. */

/* where the control pressed stands (so the note can stand by it), the rows a door leaves out (the window it was pressed
   in — §4.1's two uses), and the bell line pressed. One door's opts travel with its press the whole way: to the bell's
   entry, the page door, the landing's second ask and the checker (§4.5, §3.4). */
export type GuardOpts = { from?: 'bar' | 'drawer' | 'board'; skip?: string[]; line?: string }
/* what refuses: the kind of thing open (a window, a row being edited, a change not saved), the row's id and the page the
   thing is drawn on ('any' for one drawn over every page) — the note's words are made from these (K3) */
export type GuardRefusal = { reason: 'window' | 'row' | 'unsaved'; id: string; where: string }
type Ask = (door: string, to: string, opts: GuardOpts) => GuardRefusal | null
type Say = (r: GuardRefusal, door: string, to: string, opts: GuardOpts) => void

let ask: Ask | null = null
let say: Say | null = null
let closer: (() => void) | null = null
/* the entry checker of the test set-ups (§3.4 — step K7): held here, set by its setter only; K1a calls nothing of it.
   An object's field, so a setter with no reader yet is not an unused variable. */
const installed: { checker: ((door: string, opts: GuardOpts) => void) | null } = { checker: null }

export function setGuardAsk(fn: Ask | null): void { ask = fn }
export function setGuardSay(fn: Say | null): void { say = fn }
/** asks, says nothing — what would refuse this press, or null */
export function refusalAt(door: string, to: string, opts: GuardOpts = {}): GuardRefusal | null {
  return ask ? ask(door, to, opts) : null
}
/** asks, and where refused says the note: true when the press is refused */
export function refuse(door: string, to: string, opts: GuardOpts = {}): boolean {
  const r = refusalAt(door, to, opts)
  if (!r) return false
  say?.(r, door, to, opts)
  return true
}
/* THE WINDOWS THAT CLOSE BY THEMSELVES (D2596, D2597): the door's one call once its change is going through (§4.2) —
   never at a refusal, a Stay or a change he did not make */
export function setGuardClose(fn: (() => void) | null): void { closer = fn }
export function closeShown(): void { closer?.() }
/* tests only (§3.4): the checker that runs under every test — installed by the test set-ups at step K7 */
export function setEntryChecker(fn: ((door: string, opts: GuardOpts) => void) | null): void { installed.checker = fn }

/* THE LEAVE WAR'S OPEN SHEETS, EACH WITH ITS SHOW-ONLY MARK AND ITS OWN CLOSER (§3.2 (f); his D2740 — K1b). The war's
   sheets are drawn in leavewar/ui/Sheet.tsx, which keeps the one list of them in the order they opened; it hands that
   list over here, in the pattern of state/typing-hold.ts setWarWindowsProbe (whose count of every sheet, show-only or
   not, still holds the war's swap exactly as before). Two rows of ui/guard.ts read it: `lwsheet` — a sheet open without
   the mark, which refuses — and `lwshow` — the marked ones, each closed by its own closer. Never loaded: none open. */
export type WarSheet = { showOnly: boolean; close: () => void }
let warSheets: () => readonly WarSheet[] = () => []
export function setWarSheetsProbe(fn: (() => readonly WarSheet[]) | null): void { warSheets = fn || (() => []) }
const sheetsNow = (): readonly WarSheet[] => { try { return warSheets() } catch { return [] } }
/** a Leave War sheet is open that is not marked show-only — the `lwsheet` row */
export const warSheetOpen = (): boolean => sheetsNow().some(s => !s.showOnly)
/** a show-only Leave War sheet is open — the `lwshow` row */
export const warShowOpen = (): boolean => sheetsNow().some(s => s.showOnly)
/** closes every show-only Leave War sheet by its own closer, the unmarked ones left as they are */
export function closeWarShown(): void { for (const s of [...sheetsNow()]) if (s.showOnly) s.close() }
