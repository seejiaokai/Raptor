# The read of the second fix round: a squadron he only views (RAPTOR), 23 Nov 26

You are one of two readers, each blind to the other and to the walk. Do NOT open `raptor-port/docs/handpass/`, `HANDOFF.md`
or any report under `raptor-port/docs/superpowers/briefs/` dated 23 Nov other than this brief. Read-only: change no file
in the repo, run nothing that builds, commit nothing.

**The code:** branch `claude/msq-b1-screens-135`. The fix is one commit, `e9791020e` (`git show e9791020e`); the source at
`git show e9791020e:<path>`. It answers three faults an earlier read found in the previous fixes.

**The rulings it serves:** D2381 — with a squadron he only views picked (the Schedules menu's "View only": a View right,
or a Plan or master admin's squadron while he is in the member view), only its View-only Sched and Help are offered and
the app lands him there; an open Leave War window holds that landing until it closes. D2323 — a Leave War or Input window
left open when another squadron is picked reads "This is 142's. You picked 149 — close this to go on.", its controls
greyed, Close and ✕ live. D2384 — inside the phone's ☰ menu the squadron list opens under the mark; the first press
outside closes only the list, a second closes the menu.

**The three faults it claims to fix:**
1. A View holder (142's admin with View of 149) with a Leave War window open picks 149; the page waits (right); he closes
   the window — the landing never ran, he stayed on a page 149 does not offer. Now the close always releases the wait
   (`state/typing-hold.ts` warWindowGone; the release in `state/store.ts`). Also: that window now wears D2323's band while
   the squadron in view does not offer the Leave War (`state/store.ts` publishBands).
2. A View holder picks 149 with a saved input's window open on Inputs: the window came over View-only Sched live, no band.
   Now it is held while the squadron in view does not offer the page it was opened on (`ui/InputWindow.tsx` InputEditor).
3. A press on the shade held about a second closed both the list and the ☰ menu (a 700 ms allowance). Now the press
   itself carries the note (`ui/Drawer.tsx`).

**Look for:** is each fix right and complete, and what did it break beside it:
- the release now runs on every last-window close: does it notify where nothing waited, land him where he is allowed, or
  fight another hold (a typing hold, an unsaved-edits question, the Undo landing)?
- the new band in publishBands: shown where it should not be (his own squadron in view; a Plan holder; a master admin), or
  its Close doing something other than D2323 says; a band left up after the window closes;
- the input window: held where it must be editable (his own squadron back; Plan or master admin with full access; a
  window opened after the pick), or editable where it must be held (the member view; the top bar's pick as well as ☰);
- the ☰ press note: a quick tap, a tap inside the menu, a cancelled touch, the keyboard's Escape — any that now closes too
  much or too little;
- a crash.

**A finding counts only with all of these:** the steps a person takes; what happens, and what should happen; the file and
function; a test that would fail today, written out.

**Not a finding:** harm only in demo data already stored, when the code is right going forward (D56); a scheduler who is
not an admin (D785); style.

**Your reply is your report:** findings, numbered; what you read; up to three tidiness notes (filed, not fixed — D489).
Plain and short.
