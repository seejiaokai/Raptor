# The fresh blind Opus read of the fix rounds — D2381–D2384 (23 Nov 26, fixes 4097cd5ed..a12b083c4)

Brief: `2026-11-23-msq-view-only-fixread-brief.md`. Blind to the handoff, the walk and the other readers. Its two failing
tests ran against the branch's code from the session scratchpad (`rt/f1-war-landing.scratch.test.tsx`,
`rt/f2-input-window.scratch.test.tsx`); both reproduced by the host (chat 151).

**1. A View holder with a Leave War window open picks a squadron he only views: once he closes the window, the landing
never runs.** Hunter (142's admin, View of 149) on his Leave War with a bid window open picks 149; the page stays (fix 3);
he closes the window by its ✕ → he stays on his Leave War with 149 in view, the top bar offering only View-only Sched and
Help, 142's war open and editable under it. Should: land on 149's View-only Sched at the close (fix 3's own comment,
D2381). Cause: `state/store.ts` warHeld / landOnOfferedPage count on the close to notify, but `state/typing-hold.ts`
warWindowGone returns early unless a band is up (`if (!WAR) return`), and for a View holder no band is ever up (his own
pages and the war stay 142). The fix's test used a Plan holder in the member view (a band up) and called notify() itself.
Test: a real BidWindow, pick 149, click "Close Ranger" → `CURPAGE` 'leavewar', expected 'viewsched'.

**2. Fix 6 takes the hold off a View holder's input window at a pick: it now sits live over a squadron he only views.**
Hunter (View of 149) with a saved input's window open on his Inputs picks 149 → the page lands on View-only Sched, the
window comes with it; with fix 6 it keeps its "own page" kind, his own pages never move off 142, so it is not held — no
band, nothing greyed, Save and Delete live, over a squadron labelled "View only". At 4097cd5ed it was held with the
pick's band. Should: D2323's band ("This is 142's. You picked 149 — close this to go on."), controls greyed, Close and ✕
live; D2381. The reader's caveat: a save would still go to 142, where he may save — a live edit surface over a View-only
squadron, not data written to the wrong squadron. Cause: `ui/InputWindow.tsx` InputEditor (ownPage from openedOn.own,
then pageSqn, then held); the fix's test covered only a Plan holder in the member view. Test: View of 149, InputEditor
with INPUTS[0] open, pickSquadron('u149') → `[data-testid="inped-moveband"]` null, expected present.

**Checked and found right:** fix 1 (the two-class rule wins; the other rule's top, left, z-index do nothing on a static
list); fix 2 (the same condition as the question; the top bar has no menu to close); fix 5 (both keys); fix 4 (the
normal case); fix 6's sign-in clearing; the Inputs and SANS settings windows close on a page change (no twin of 2).

**Read:** the brief; the fix diff and its tests; at a12b083c4 `state/store.ts` (notify, landOnOfferedPage, enterSquadron,
entryDue / maybeReenter, the bands, resetSession), `state/typing-hold.ts`, `state/pick.ts`, `tracker/role.js`,
`ui/Drawer.tsx`, `ui/InputWindow.tsx`, `leavewar/ui/Sheet.tsx`, `state/perms.ts`, `02-shell.css`, `18-oil-board.css`,
`state/cutoff.ts`, InputsSettings; the full rows of D2323, D2381, D2385.

**Tidiness (filed, not fixed):** 1. `ui/Drawer.tsx` LIST_CLOSED_AT — a module-level time stamp with a 700 ms window, used
up only by a shade click; a flag set and checked within one press would be exact. 2. `state/store.ts` warHeld's comment
("its close notifies") states what only `typing-hold.ts` decides, and only while a band is up. 3. `ui/InputWindow.tsx`
`open && openedOn && openedOn.r === r` tested twice; one kept value would read clearer.
