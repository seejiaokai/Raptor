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
     drawn by the Tracker's page seam, tracker/TrackerPage.tsx, which reads the Tracker's own editing state itself.

   No imports: read by the Leave War's window frame and by the Tracker's page seam (a no-import module, as the Tracker's
   people bridge is — tracker/people.js), and written by state/store.ts on every notify. */

/* `ro` — the window under the band is read only, its controls greyed (a window open at a pick — his D2323, below) */
export type MoveBand = { lead: string; rest: string; ro?: boolean } | null

/* ---- THE SCHEDULE SIDE (the walk of 21 Nov 26 — W3-F2, W3-F3; D2243 Q7's rule, the plan's "never saved into the new
   squadron, never dropped without a word") ----
   The schedule side's pages hold nothing to swap late: the schedule in view moves at midnight with him, and Inputs, Quals
   and the rest read his squadron by the day. So a window or a box of theirs left open across the change is held where it
   stands instead — each remembers the squadron its page showed when it opened:
   - THE INPUT'S WINDOW (ui/InputWindow.tsx) stays open, his words in it, its Person list still read from the squadron
     it opened on (never the new squadron's people), with the band across its top and "Close";
     Add, Save, Delete and "Take me out" do nothing under the band — nothing is saved into either squadron.
   - A TEXT BOX OF THE SCHEDULE (ui/textedit.ts), which has no window to carry a band: words typed in it across the change
     are not written anywhere, and leaving the box says so in the app's refusal note.
   - A SIGN-OFF LIST left open across the change (ui/Shell.tsx): the pick is not written, and the same note says so.
   THE WORDS: the approved drawing gives the band's sentence for the Leave War and the Tracker only ("…can't be saved in
   142's Leave War." / "…Tracker."), and neither it nor the plan gives one for the schedule's pages — so these read the
   app's generic "This change could not be saved." (the fix brief's rule; named in the helper's report for his word). */
export const SCHED_MOVE_WORDS = 'This change could not be saved.'
export const schedMoveBand = (): NonNullable<MoveBand> => ({ lead: SCHED_MOVE_WORDS, rest: '' })
export type HoldKind = 'none' | 'war' | 'tracker'

/* ---- A WINDOW OPEN AT A PICK (batch 1's second half §16 D2, §9 F7; his D2323 — the approved drawings
   docs/mock/2026-11-22-msq-b1-screens/img/f7a-*.png, f7b-*.png) ----
   The Schedules menu's pick (state/pick.ts), or a bell tap that enters another squadron (state/belltap.ts), moves the page
   while a Leave War window or an Input window is open on the squadron it left. That window is held as above, but its band
   no longer reads the generic "This change could not be saved." — nothing was tried — it says where the window belongs
   and what to do: "This is 142's. You picked 149 — close this to go on.", and every control under it is greyed (`ro`),
   Close and ✕ still working. Set by state/store.ts enterSquadron each time the schedule in view changes: true for a pick
   or a bell tap (his own move to another squadron, by his own hand), false for a sign-in, his own move at midnight or a
   right that ended (those keep their own words). */
let BY_PICK = false
export function setEnteredByPick(on: boolean): void { BY_PICK = !!on }
/** the squadron now in view was reached by his own pick (or a bell tap) — not a sign-in, a midnight move or a right ended */
export const enteredByPick = (): boolean => BY_PICK
/** the band of a window open at a pick: `from` the number of the squadron the window belongs to, `to` the one picked */
export const pickBand = (from: string, to: string): NonNullable<MoveBand> =>
  ({ lead: `This is ${from}'s.`, rest: `You picked ${to} — close this to go on.`, ro: true })
/* ---- A WINDOW LEFT OPEN AT THE SWITCH TO THE MEMBER VIEW (his D2389, D2400 — the approved drawings
   docs/mock/2026-11-24-msq-new-words/img/w1-*.png, i1-*.png) ----
   An admin on a squadron he works by a Plan or the master mark, a Leave War or Input window open, taps his name badge: in
   the member view his own pages go home, so the window is held (state/perms.ts heldByMemberView). It read the generic
   "This change could not be saved." with its controls live, though nothing was tried. It says what to do, greyed exactly
   as a pick's (`ro`), Close and ✕ still working; the switch back gives the window back as it was. */
export const memberViewBand = (): NonNullable<MoveBand> =>
  ({ lead: 'Member view.', rest: 'Switch back to the admin view to change this, or close it.', ro: true })

/* ---- THE TRACKER AFTER A PICK (§16 D2′; his D2318 — the approved drawings f2a, f2b, f2c) ----
   The Tracker keeps the squadron it first loaded until the next sign-in (tracker/storage.js rebindStorageUnit). When the
   page's own squadron is not that one, the whole Tracker page carries a band of its own, in the same look, with no Close:
   'ro' — he may still change that Tracker (an admin of it by any road): the page shown under a light veil, read only;
   'gone' — he may no longer open it: everything of the Tracker hidden (kept in memory, nothing reset);
   'member' — in the member view, hidden the same way, its own words. state/perms.ts trackerCover decides which. */
export type TrkCover = { kind: 'ro' | 'gone' | 'member'; lead: string; rest: string } | null

/* ---- what holds: the Leave War's open windows (leavewar/ui/Sheet.tsx registers its count) ---- */
let warWindows: () => number = () => 0
export function setWarWindowsProbe(fn: (() => number) | null): void { warWindows = fn || (() => 0) }
export const warWindowOpen = (): boolean => { try { return warWindows() > 0 } catch { return false } }
/** the hold the page reads before it enters a squadron: an open war window holds the war's swap */
export const holdNow = (): HoldKind => (warWindowOpen() ? 'war' : 'none')

/* ---- the bands, written by state/store.ts after every notify; the two surfaces subscribe ---- */
let WAR: MoveBand = null
let TRK: MoveBand = null
let COVER: TrkCover = null
const subs = new Set<() => void>()
const same = (a: MoveBand, b: MoveBand): boolean => a === b || (!!a && !!b && a.lead === b.lead && a.rest === b.rest && !!a.ro === !!b.ro)
const sameCover = (a: TrkCover, b: TrkCover): boolean => a === b || (!!a && !!b && a.kind === b.kind && a.lead === b.lead && a.rest === b.rest)
export function setBands(war: MoveBand, trk: MoveBand, cover: TrkCover = null): void {
  if (same(war, WAR) && same(trk, TRK) && sameCover(cover, COVER)) return
  WAR = war; TRK = trk; COVER = cover
  for (const f of [...subs]) { try { f() } catch { /* a surface's own fault never stops the others */ } }
}
export const warBand = (): MoveBand => WAR
export const trackerBand = (): MoveBand => TRK
/** the Tracker page's own band and cover, or null (above) */
export const trackerCover = (): TrkCover => COVER
export function subscribeBands(fn: () => void): () => void { subs.add(fn); return () => { subs.delete(fn) } }

/* ---- letting the swap run once a held window goes ---- */
let RELEASE: () => void = () => {}
/** state/store.ts hands its notify(), so the swap held by a window runs the moment the window goes */
export function setHoldRelease(fn: (() => void) | null): void { RELEASE = fn || (() => {}) }
/** a war window went (its ✕, Escape, a tap outside, or the band's Close): the page is told once the last window has
 *  gone — after the frame's own unmount, never inside it — so whatever the window held runs then.
 *  NOT ONLY WHILE A BAND IS UP (the fix rounds' read of 23 Nov 26 — Astra 1, the fresh Opus reader's 1): a window holds
 *  two things, the war's swap and the landing off a page the squadron picked does not offer (state/store.ts warHeld,
 *  D2381), and this asked only about the first — so a landing held with no band up never ran. What is waiting is the
 *  page's to say (the release it hands over); an ordinary close, with nothing held, tells nobody. */
export function warWindowGone(): void {
  queueMicrotask(() => { if (!warWindowOpen()) RELEASE() })
}
