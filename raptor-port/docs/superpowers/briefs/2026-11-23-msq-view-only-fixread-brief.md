# The read of the fix rounds: a squadron he only views, and the ☰ menu's squadron drop-down (RAPTOR), 23 Nov 26

You are one of two readers, each blind to the other and to the walk. Do NOT open `raptor-port/docs/handpass/`, `HANDOFF.md`
or any report under `raptor-port/docs/superpowers/briefs/` dated 23 Nov other than this brief. Read-only: change no file
in the repo, run nothing that builds, commit nothing.

**The code:** branch `claude/msq-b1-screens-135`. The fixes are `git diff 4097cd5ed..a12b083c4 -- raptor-port/src` (three
commits: `cd94a4e8e`, `d3bbc5e65`, `a12b083c4`); the source at `git show a12b083c4:<path>`. The feature they fix is
`4097cd5ed` (read it for context, not as the thing under review).

**The feature, in short (his rulings D2381–D2384):** when the squadron in view is one he only views (the Schedules menu
labels it "View only" — a View right, or a Plan or master admin's squadron while he is in the member view), only its
View-only Sched and Help are offered; the app lands him on View-only Sched if he is on another page; opening one of his
own pages from elsewhere (a bell line, a link) brings his own squadron back. On a phone the ☰ menu's TALON mark is the
squadron drop-down: the list opens under the mark inside the menu, the menu stays open after a pick.

**What the fixes claim to fix:**
1. The ☰ menu's squadron list opened out of sight, at the foot of the menu (another stylesheet's rule won) — now drawn
   under the mark (`ui/scheduler/02-shell.css`).
2. A pick inside ☰ with unsaved Tracker chart edits drew the Tracker's question under the menu — the menu now closes
   first when the pick will ask, as Logout does (`state/pick.ts`, `tracker/role.js`).
3. An open Leave War window was hidden by the landing — the landing now waits while the Leave War page has a window up,
   and runs when it closes (`state/store.ts` warHeld, landOnOfferedPage).
4. One tap outside the menu closed both the list and the menu — now the first closes only the list (`ui/Drawer.tsx`).
5. In the ☰ list, Tab out left it open and Arrow Down on the mark did not open it — both now as in the top bar's list
   (`ui/Drawer.tsx`).
6. An input window left open through the landing judged its squadron by the page now in view and came back editable —
   it now keeps the kind of page it was opened on (`ui/InputWindow.tsx`); the landing's memory is cleared at sign-in
   (`state/store.ts`).

**Look for:** is each fix right and complete, and what did it break beside it:
- a twin path the fix missed (the top bar's list as well as ☰; a pick as well as the member-view switch; Undo and Redo
  landings; a window of another kind left open — the OIL window, the Quals or SANS windows);
- a landing that now never runs, or runs twice, or lands him somewhere the rulings above do not allow;
- a menu or list that cannot be closed, or closes on the wrong press;
- an edit window that is editable where the squadron in view is View only, or held where it should be editable;
- a crash.

**A finding counts only with all of these:**
- the steps a person takes;
- what happens, and what should happen;
- the file and function;
- a test that would fail today, written out.

**Not a finding:**
- harm only in demo data already stored, when the code is right going forward (D56);
- a scheduler who is not an admin (D785);
- style.

**Your reply is your report:**
- findings, numbered;
- what you read;
- up to three tidiness notes (filed, not fixed — D489).

Plain and short.
