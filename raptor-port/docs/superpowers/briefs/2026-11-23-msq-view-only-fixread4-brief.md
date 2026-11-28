# The read of the walk's fixes: the ☰ menu's tap under the open list, and the Tracker's words after Discard (RAPTOR), 23 Nov 26

You are one of two readers, each blind to the other and to the walk. Do NOT open `raptor-port/docs/handpass/`, `HANDOFF.md`
or any report under `raptor-port/docs/superpowers/briefs/` dated 23 Nov other than this brief. Read-only: change no file
in the repo, run nothing that builds, commit nothing.

**The code:** branch `claude/msq-b1-screens-135`, one commit, `c2bcdb990` (`git show c2bcdb990`).

**The rulings:** D2384 — inside the phone's ☰ menu the squadron list opens under the TALON mark; a press elsewhere
closes the list first, the menu still open; a second press outside closes the menu. D2318 — a pick that would take the
Tracker away with unsaved chart edits asks "Save them before switching to 149?": Save them / Discard them / Stay.

**What it claims to fix:**
1. With the list open, a finger on a page line below it (Inputs, Help, Logout…) closed the list at the touch; every line
   moved up about 98 points and the click landed on the line that slid under the finger — a tap on Inputs opened the Leave
   War, Logout seemed dead. Now the click of the press that closed the list is spared wherever it lands in the menu
   (`ui/Drawer.tsx`, the menu's click capture).
2. After "Discard them" the Tracker's bar still said "● unsaved flow edits — hit “Save changes”". Now both Discard answers
   (the pick's and the sign-out's) share one step that also puts the bar's words back to its resting "● saved"
   (`tracker/app/core.js` discardChartEdits).

**Look for:** is each right and complete, and what did it break beside it: a press that should act and now does nothing
(a row of the list itself; the mark; the switch to the member view; a keyboard Enter or Space on a menu line; a press after
the list was closed by Escape or the keys); a click spared twice or never cleared; "● saved" shown where it is untrue (a
refused or failed save, a browser that keeps nothing, an error showing); any other caller of the old Discard lines; a
crash.

**A finding counts only with all of these:** the steps a person takes; what happens, and what should happen; the file and
function; a test that would fail today, written out.

**Not a finding:** harm only in demo data already stored, when the code is right going forward (D56); style.

**Your reply is your report:** findings, numbered; what you read; up to three tidiness notes (filed, not fixed — D489).
Plain and short.
