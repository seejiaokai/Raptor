# The fresh blind Opus read of the second fix round — Fable's `e9791020e` (23 Nov 26)

Brief: `2026-11-23-msq-view-only-fixread2-brief.md`. Blind to the handoff, the walk and the other readers. Probes in the
session scratchpad (`rt2/probe.test.tsx`, `rt2/probe2.test.tsx`); both reproduced by the host (chat 151).

**1. An Input window held at a pick comes back live once an Undo takes back a change to that same input.** Hunter (142's
admin, Plan of 149) changes an input's remarks on his Inputs, saves, opens it again; picks 149 (Full access) → held
("This is 142's. You picked 149 — close this to go on.", greyed; the page stays Inputs, the Undo shows); presses Undo →
the band goes, Save and the rest live over 149's Inputs. Should: held until Close, ✕ or 142 again (D2323). Cause:
`ui/InputWindow.tsx` InputEditor takes its "opened on" note afresh whenever the record becomes a new object
(`openedOn.r !== r`); an Undo or a refused command puts it back as a new object, and the fresh note reads the squadron in
view and the page now — both holds forgotten. The View holder's form (held over View-only Sched, the record put back as a
new object) loses the hold too; no button reaches it there. Older than `e9791020e`, but it leaves its fix 2 incomplete.
Fix: keep the note while the window shows the same input (by `iid`). Test: probe2 — fails at "Save dead and greyed"
([false, false]) and "still held after the Undo".

**Checked and found right:** the release (notifies only where something waited; lands on View-only Sched; waits for the
last of two windows; a Plan holder's war swap as before; not during a sign-out or a Tracker question); the new war band
(only while the squadron in view does not offer the Leave War; gone when 142 is picked again; its Close closes and lands);
fix 2 (given back at 142; a window opened after the pick not caught; the member view held; top bar and ☰ alike); fix 3 (the
capture listener runs first; quick tap, held press, cancelled touch, a tap inside the menu, Escape each close the right
amount). No crash. Five existing test files run singly: 46 pass.

**Tidiness (filed, not fixed):** 1. The war band now stays up the whole time a View-only squadron is picked, window or
not; BidPicker, Matrix and BalancesPage read it as "the midnight band" — harmless while the Leave War cannot be reached,
but its meaning widened without a word at those readers. 2. Whether something waits on a window's close is worked out
twice (`warHeld` and the release's `warBand() || !pageOffered(CURPAGE)`). 3. A Plan holder's or master admin's Input or
Leave War window held by the member-view switch (not a pick) reads the generic "This change could not be saved.",
ungreyed — older, outside D2323 (a pick only); may be worth putting to him.
