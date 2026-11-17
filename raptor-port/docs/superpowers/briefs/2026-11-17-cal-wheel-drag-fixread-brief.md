# The calendar wheels' mouse drag (D2170) — the fix round's narrow read (chat 99, 17 Nov 26)

The bug-check order §5 "A fix is new code": a fresh Opus reader that did not write the fixes, handed only the fix
commits and the findings they answer. One round.

## The brief, as sent

You are reading FIXES, not the whole feature. Repo: `C:\Users\User\projects\Raptor`, branch
`claude/cal-wheel-drag-e4107b`. Read-only: change no file, run no build, no browser test, no commit.

The feature: in `raptor-port/src/ui/DateCal.tsx`, the shared month-and-year wheel (`Wheel`) now moves with a mouse
press and drag on a desktop, as a finger moves it on a phone, gliding on after a quick flick and landing on a whole
row. A finger and a pen keep the browser's own scrolling. A drag picks nothing and closes nothing; a plain click on a
row still picks it.

Two code reads found these faults (the findings, in short):
1. A mouse press let go off the list before it had moved 4px left the list following a mouse with no button held.
2. A key (arrows, Enter) pressed during a glide acted on the row chosen before the flick, not the row in the band.
3. A mouse press during a glide re-snapped at once — a jump of up to 22px.
4. A finger or pen laid on a gliding list did not stop the glide.
Then the walk found a hard mouse flick could carry the years on by 13–39; the glide's speed was capped.

The fixes to read:
- `git show 37664082e -- raptor-port/src/ui/DateCal.tsx raptor-port/e2e/datecal.spec.ts` (the four faults, with tests)
- `git show 492ce1d91 -- raptor-port/src/ui/DateCal.tsx` (the glide cap)
- `git diff 492ce1d91 -- raptor-port/e2e/datecal.spec.ts` (uncommitted: two checks of one test made to measure
  inside the page, after they failed on GitHub's slower machine)

Answer, for each fix: is it right and complete for its finding; what could it break beside it (the twin paths — a
pointerup and a pointercancel, a lost pointer capture, a mouse and a finger and a pen, reduced motion, a key during a
drag, the window re-centring while the list moves, the settle timer); and for the test change: does each check still
fail on the fault it names and pass on correct code, and can it now fail or pass by timing alone.

What is NOT a finding: a problem that lives only in data already stored (all of it is demo data, cleared before the
database step); style or naming; anything outside these diffs unless a fix breaks it.

Each finding: the concrete failure (the steps a person takes and what they see), its cause in the code, and the exact
fix. Rank by severity. If you find nothing, say so plainly. Under 600 words.

## The reader's report, in short (round 1; its full text stayed in the chat)

Each fix right for its finding; the glide cap, a cancel, a lost capture, a finger, a pen and less motion sound. Four
findings, each reproduced red-first by the host before it counted (commit "the fix round's read — three faults fixed"):
1. MEDIUM — a glide caught by a press and held still let the glide's last settle wait choose the row under the press; a
   choice past half the window re-centred it, and the drag that followed jumped about 30 rows (the host's test: 34–36).
   Fixed: nothing is chosen while a mouse is held; the press's end settles.
2. LOW — Enter during a moved mouse drag closed the lists on the row before the drag. Fixed: Enter and the arrows wait.
3. LOW — a press let go on another list was never ended; a later press carried back over it moved it. Fixed: the
   window's release ends a press that never took hold.
4. LOW — the test change: read the press's place one drawn frame after it; clear the flick's own reading first; compare
   the year in the band, not the raw place, under the finger. All three taken.

## Round 2 — the brief, as sent

Same rules as round 1 (read-only; not a finding: stored data only, style, anything outside the diff unless a fix
breaks it). Read only `git show d8ca73710 -- raptor-port/src/ui/DateCal.tsx raptor-port/e2e/datecal.spec.ts`. It answers
three faults: (1) a glide caught by a mouse press and held still chose the row under the press after the list's settle
wait, and if that re-centred the list's window the next drag jumped about 30 rows; (2) Enter or an arrow during a moved
mouse drag acted on the row chosen before the drag; (3) a mouse press let go on another list (before it had moved 4px)
was never ended, so a later press carried back over that list moved it. Is each fix right and complete, and what does
it break beside it — a plain click on a row, a click after a wheel scroll, a right click, a finger, a pen, a pointer
cancel, a lost capture, two lists open at once, the calendar closing while a press is held, a press held on a row while
the wheel was still settling. And do the three new tests fail on the faults and pass on correct code without timing
luck. Each finding: steps, what is seen, cause, exact fix; under 500 words; none found, say so.

## Round 2 — the reader's report, in short (its full text stayed in the chat)

Fixes (1) and (3) right and complete (a plain click, a click after a wheel scroll, a right click, a finger, a pen, a
cancel, a lost capture, two lists, the calendar closing mid-press all checked). Two findings, both reproduced red first
by the host:
1. Fix (2) incomplete, widened by fix (1): with a glide caught and held still, Enter closed the lists on the year before
   the flick and ArrowDown scrolled back towards it under the held mouse. Fixed: the keys wait during any held mouse
   press (a one-line guard, so no round 3 read — bug-check order §5). Tests for Enter and ArrowDown.
2. The held-catch test could pass on the fault when a late release glided nothing. Fixed: it asserts the glide carried
   past the drag alone, and the catch tests now flick again until the page shows the list gliding (a late release made
   the "catch" a plain click on a row, which rightly chose that row — seen once on his PC).
