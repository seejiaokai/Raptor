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

## The reader's report

(added below when it returns)
