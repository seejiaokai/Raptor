# The M3 build's FULL check — the fresh, blind code read (D790, D903)

You did not write this code and have not seen the chat that did. Read the finished change and find what is WRONG or
MISSING. Work read-only: change no file, run no build and no browser; you may run single unit test files
(`cd raptor-port && npx vitest run <file>`) to check a claim.

## What changed
`git diff 08cc09eac HEAD -- raptor-port/src` on branch `claude/lw-m3-placing-leave` (about 80 files). In plain words:
1. **UNA went; "Other" took its place** (rulings D1356, D1357, D1365, D1367–D1371): any commitment the schedule draws under
   its Unavailable list (`acc:'u'` on the input) counts the man out on the Leave War (1, or 0.5 for a half) — `warCounts`
   in `src/leavewar/absences.ts` — drawn outlined, by its kind's letters (OTH ATCH TRG MTG PERS APPT DTY EVT). An Other's
   window asks "Goes to" (Ground Programme / Unavailable). An admin files an Other from the war's bid window ⋯, straight
   under Unavailable, on the window's Duration. The war's stored UNA record is dropped on read.
2. **"Fly with" renamed "Attach"** with a "To" box (D1373); a course (CSE) and an Attach land under Unavailable by
   themselves (D1372, D1374, D1377); the war files an Attach from the ⋯ too — admin and member, on the Duration (D1378–
   D1380), from the bid window, the drag window and a member's closed-day note.
3. **The decided Approve / Refuse** lit and named in the bid windows and the day's list (D1361, D1355).
4. **The manning bubble** always at the foot, its words "This bid: Available P 27 → 26", each row's pair in its colour
   (D1358, D1360, D1364); just above a resting day panel on a phone.
5. **The joined bar** — a leave over several days drawn as one bar (D1359, `MatrixRows.tsx joinClasses`).
6. **The drag window's remarks** over separate entries (D1362), and a held bid's words on its own half only.
7. **The schedule** offers "→ Ground · → Unavail" for every commitment (`src/ui/html.ts accCtl`).
The full rulings: `grep -h '^| D13[5-8][0-9] |' .claude/decisions-full/*.md`. What the screens do as built:
`raptor-port/docs/ui-contracts.md`, its last section ("The Leave War after the M3 build of 25 Oct 26").

## In your hands
- The evidence sheet: `raptor-port/docs/handpass/2026-10-25-lw-m3-build.md` — the roll-call (every surface that draws the
  thing), the designer's gaps and what was done about each, the walk's results (`parts/lw-m3-build/w1.md`, `w2.md`).
- The designer's part: `parts/lw-m3-build/designer.md`.

## What to look for — absences first
- A surface, door or reader of the count that still asks the OLD question (`warVisible`, `'Fly with'`, `UNA`, an Other's
  acc read as 'g' / 'u' only) where it should ask the new one. Search the whole of `src`, not only the changed files.
- An order of actions that leaves the input and the war disagreeing: file, flip Goes to, Reject, → Ground, → Unavail,
  retype, Undo, Redo, reload, a published day (an `acc` change on a published day must read as a pending amendment and
  leave the issued face alone).
- A role that can do what it should not (a member filing an Other from the war, moving a rejected Other, filing for
  another man) or cannot do what it should (a member filing an Attach on his own row).
- Each state of a control × each reading it shows (the decided buttons, Goes to on new / filed / rejected, the bubble).

## The rules for a finding
- **A finding is a concrete failure, its cause, and its exact fix** (D489): the steps a person takes, what the screen does,
  the file and line that cause it, and the change that fixes it. A worry with no failure is not a finding — list it apart
  as a question.
- **Not a finding (D56):** a problem that lives ONLY in data already stored (a "Fly with" or UNA record in the demo store)
  when the code is right going forward.
- Rank by harm: who counts as away and what is published first; then roles; then the screens.

Write your report to `raptor-port/docs/handpass/parts/lw-m3-build/read-opus.md`, then reply with a short list (one line a
finding).
