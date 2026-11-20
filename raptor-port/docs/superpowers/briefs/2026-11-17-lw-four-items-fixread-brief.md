# The four Leave War items — the fix round's narrow read (chat 103, 17 Nov 26)

The bug-check order §5 "A fix is new code": a fresh Opus reader that did not write the fixes, handed only the fix
commits and the findings they answer (D790). One round. The fixes answer finds 8–10 (the two blind reads of chat 101)
and 13–15 (the walk, the drawing check and GitHub's run, chat 102) of the evidence sheet
`raptor-port/docs/handpass/2026-11-17-lw-four-items.md` — the reader is not given the sheet.

## The brief, as sent

You are reading FIXES, not the whole feature. Repo: `C:\Users\User\projects\Raptor-lw4`, branch
`claude/lw-four-items`. Read-only: change no file, run no build, no browser test, no commit, no branch switch.

The features: the Leave War's Balances page on a phone — a grid of people's leave figures that slides sideways under a
column of names held at the left; each kind's figure is a box, and a pending figure is a small dashed tag standing on the
box's top-right corner, partly outside the box (`BalancesPage.tsx`, `balances.css`). And the OIL tracker's award editor
(`OilTracker.tsx`, `oiltracker.css`): tapping an award in a person's row opens an editing box in place — amount, half,
reason, given-by, and a row of Save, Cancel, Delete — whose layout must never move as its state changes (Delete is
always as wide as its armed words "Really delete?"). The OIL list also slides sideways under name columns held at the
left.

The faults, in short, and the fixes to read:
- `git show 4f939dea4 -- raptor-port/src raptor-port/e2e/leavewar.spec.ts`
  8. On a phone the held name cells shrank to their words' width, so slid boxes showed beside each name, ragged row by row.
  9. On a phone CCL's box ran 2px into FCL's: its cell carries a 7px divider rule in a 54px column.
  10. A box tapped (focused) near the right edge slid into sight measuring only its cell, so its corner tag stayed cut.
- `git show 356e2fc6a -- raptor-port/src raptor-port/e2e/leavewar.spec.ts`
  13. On a 402px phone an award near the list's right edge opened its editor with Cancel cut and Delete wholly past the
      screen. Fix: once the editor draws, the list slides just enough, never putting the editor under the held names.
  14. "Delete"'s words sat 1.8px above "Cancel"'s, stacked in a grid with its hidden twin.
- `git show 19f0bf843 -- raptor-port/src raptor-port/e2e/leavewar.spec.ts`
  15. With wider letters (GitHub's fonts) the button row, held on one line, forced the editing box wider and Delete still
      opened 8.8px past the edge. Fix: the row may wrap.

Answer, for each fix: is it right and complete for its finding; what could it break beside it — the desktop as well as
the phone; the read-only Balances (a member, a locked war) beside the admin's; the "Taken" view of Balances beside the
balance view; an editor opened on an award at the list's LEFT edge, on one already in sight, on a person whose row is
the last or the only one; the list scrolled by a finger while or just after the editor opens; the editor closed before
the slide's frame runs; the editor's armed state ("Really delete?") and a half-day award (AM / PM showing); the wrapped
button row's effect on the box's height and on what stands below it; any other button that uses the same classes. For
each test change: does each check still fail on the fault it names and pass on correct code, and can it pass or fail
by timing or by the machine's fonts alone.

What is NOT a finding: a problem that lives only in data already stored (all of it is demo data, cleared before the
database step); style or naming; anything outside these diffs unless a fix breaks it; anything for a scheduler who is
not an admin (a scheduler is always an admin).

Each finding: the concrete failure (the steps a person takes and what they see), its cause in the code, and the exact
fix. Rank by severity. If you find nothing, say so plainly. Under 600 words.

## The reader's report, in short

Round 1 (its full text stayed in the chat). Each of the six fixes right for its own fault. Findings, each reproduced by the
host before it counted (the evidence sheet's finds 16–19):
1. MEDIUM — pinched in past about 0.95, the editor is wider than the room beside the held names; the slide keeps its left
   clear of the names, so Delete stays cut (host: 1.04 → Delete to 414 of 402; 1.36 → wholly off). A product choice, put to him.
2. LOW — the slide was sideways only; an award at the list's foot opened with its buttons below the list (host: red on phone and
   desktop). Fixed in `843247955`.
3. LOW — the editor drawn cut for a frame before the slide. Fixed with 2 (before the first paint).
4. LOW — three test weaknesses; two taken, one declined (GitHub's wider letters wrap the plain case by design).
5. Note — CCL 7px wider moves FCL and after 7px right of the drawing: already a named departure.

Round 2: the fix of 2 and 3 alone (`843247955`), the same rules — the result in the evidence sheet's "The reads".
