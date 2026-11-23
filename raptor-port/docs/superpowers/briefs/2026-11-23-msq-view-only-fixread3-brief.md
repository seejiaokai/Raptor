# The read of the third fix round: a held input window after an Undo (RAPTOR), 23 Nov 26

You are one of two readers, each blind to the other and to the walk. Do NOT open `raptor-port/docs/handpass/`, `HANDOFF.md`
or any report under `raptor-port/docs/superpowers/briefs/` dated 23 Nov other than this brief. Read-only: change no file
in the repo, run nothing that builds, commit nothing.

**The code:** branch `claude/msq-b1-screens-135`. The fix is one commit, `27db0c659` (`git show 27db0c659`); the source at
`git show 27db0c659:<path>`.

**The ruling it serves:** D2323 — an Input window left open when another squadron is picked reads "This is 142's. You
picked 149 — close this to go on.", its controls greyed, Close and ✕ live, until it is closed or 142 is picked again.
D2381 — with a squadron he only views picked, only its View-only Sched and Help are offered; a window of his own pages
left open then is held the same way.

**The fault it claims to fix:** `ui/InputWindow.tsx` InputEditor kept its "opened on" note against the record object; an
Undo, a Redo or a refused command puts the record back as a new object, the note was taken afresh and the hold forgotten —
the window came back live over 149. Now the note is kept while the window shows the same input (by its id); a fresh note
only when a different input is opened or the window closes. Also: when another input is asked for over unsaved words, the
first input's note is kept aside and comes back with it.

**Look for:** is the fix right and complete, and what did it break beside it:
- a hold kept where it must go (142 picked again; the window closed and the same input opened afresh; a different input);
- a hold lost on another path (a save refused; a delete undone; the input moved or its dates changed by another person; the
  member view switched on and off);
- a new input (no id yet) behaving differently from before;
- the kept-aside note leaking onto another window or surviving a close;
- a crash.

**A finding counts only with all of these:** the steps a person takes; what happens, and what should happen; the file and
function; a test that would fail today, written out.

**Not a finding:** harm only in demo data already stored, when the code is right going forward (D56); a scheduler who is
not an admin (D785); style.

**Your reply is your report:** findings, numbered; what you read; up to three tidiness notes (filed, not fixed — D489).
Plain and short.
