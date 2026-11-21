/* THE HOLD AT THE SWAP, AND ITS BAND (the reshape plan docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-iv
   "Typed work at the swap" — Astra 7, Fable F9; his D2243 Q7, "as drawn": docs/mock/2026-11-20-multi-sqn-reshape/page.html
   §7, pictures q7b (the Leave War) and q7c (the Tracker), -d desktop, -p iPhone).

   When the page has to enter another squadron — his own move taking effect at midnight (A2), or a right of his ending
   mid-day (the blind read's R6) — work typed in an open window must never be saved into the new squadron, nor dropped
   without a word. So:
   - AN OPEN LEAVE WAR WINDOW HOLDS THE WAR'S SWAP (state/store.ts enterSquadron's second step), whatever is typed in it, so
     no form has to report its typing: the Leave War's one window frame (leavewar/ui/Sheet.tsx, which keeps its open
     windows) answers how many are open. The schedule in view is not held — it has no window of typed work — so a war
     window left open behind another tab never leaves him on the old squadron's schedule.
   - WHILE THE WAR LOADED IS NOT THE PAGE'S OWN SQUADRON, every open war window carries one band across its top, under its
     title, in the look the app already uses for a save that failed: "You are 149's from today. This can't be saved in
     142's Leave War." and one button, "Close", which closes the window and lets the swap run — 149's Leave War opens. His
     typed words stay visible under it, so he can copy them. A save the old squadron refuses after midnight is the one
     this band already names.
   - THE TRACKER CANNOT BE RE-READ IN PLACE once it has loaded (the plan §14 item 3; tracker/storage.js rebindStorageUnit,
     phase 2's read of its load path): it keeps the squadron it loaded until he signs in again, and the gate's 7f refuses
     his changes to a squadron's Tracker he is no longer one of. So nothing the Tracker holds can be saved into the new
     squadron, and it holds no swap. Its chart editor ("Edit chart layout", the one Tracker editing state the drawing
     drew) carries the same band — "…in 142's Tracker." — while the Tracker loaded is not the page's own squadron; Close
     leaves the editor (its edits stay unsaved, as "Done editing chart" leaves them, never saved by the band) —
     tracker/components/MoveBand.jsx, which reads the Tracker's own editing state itself.

   No imports: read by the Leave War's window frame and by the Tracker (a no-import module, as the Tracker's people bridge
   is — tracker/people.js), and written by state/store.ts on every notify. */

export type MoveBand = { lead: string; rest: string } | null
export type HoldKind = 'none' | 'war' | 'tracker'

/* ---- what holds: the Leave War's open windows (leavewar/ui/Sheet.tsx registers its count) ---- */
let warWindows: () => number = () => 0
export function setWarWindowsProbe(fn: (() => number) | null): void { warWindows = fn || (() => 0) }
export const warWindowOpen = (): boolean => { try { return warWindows() > 0 } catch { return false } }
/** the hold the page reads before it enters a squadron: an open war window holds the war's swap */
export const holdNow = (): HoldKind => (warWindowOpen() ? 'war' : 'none')

/* ---- the bands, written by state/store.ts after every notify; the two surfaces subscribe ---- */
let WAR: MoveBand = null
let TRK: MoveBand = null
const subs = new Set<() => void>()
const same = (a: MoveBand, b: MoveBand): boolean => a === b || (!!a && !!b && a.lead === b.lead && a.rest === b.rest)
export function setBands(war: MoveBand, trk: MoveBand): void {
  if (same(war, WAR) && same(trk, TRK)) return
  WAR = war; TRK = trk
  for (const f of [...subs]) { try { f() } catch { /* a surface's own fault never stops the others */ } }
}
export const warBand = (): MoveBand => WAR
export const trackerBand = (): MoveBand => TRK
export function subscribeBands(fn: () => void): () => void { subs.add(fn); return () => { subs.delete(fn) } }

/* ---- letting the swap run once a held window goes ---- */
let RELEASE: () => void = () => {}
/** state/store.ts hands its notify(), so the swap held by a window runs the moment the window goes */
export function setHoldRelease(fn: (() => void) | null): void { RELEASE = fn || (() => {}) }
/** a war window went (its ✕, Escape, a tap outside, or the band's Close): while a band is up, the page is told once the
 *  window has gone — after the frame's own unmount, never inside it — so the war's swap runs then */
export function warWindowGone(): void {
  if (!WAR) return
  queueMicrotask(() => { if (!warWindowOpen()) RELEASE() })
}
