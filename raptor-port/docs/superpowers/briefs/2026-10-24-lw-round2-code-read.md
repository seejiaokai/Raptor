# Round 2 — a course, an overseas duty and the unforeseen absence filed on the Leave War: the fresh, blind code read (24 Oct 26)

For ONE fresh Opus reader that did not write this code and has seen no other reader's report (D790; no ChatGPT reader —
out; no Fable — D903). Read only: change no file, commit nothing.

## What to read — at the commit named in your instruction, never the working tree

Another chat keeps building in this checkout while you read, so read every file AT THE COMMIT: `git show <commit>:<path>`,
`git diff <base>..<commit> -- <path>` (the base is named in your instruction: the commit before round 2's build).

- The kind: `raptor-port/src/engine/inputs.ts` (INPUT_META 'UNA', `isLateInput`, and every predicate that reads `grp`),
  `src/engine/schema.ts`, the reference's mirror `src/testing/refwin.ts` (reinput's `un`, reirest's two sets).
- The war: `src/leavewar/absences.ts warVisible`, `engine/dayview.ts` (AWAY_DUTY, OFF_WAR, the manning's `removing`),
  `engine/codes.ts` (labels, `Kind`, `kindOf`), `ui/matrix.css`, `ui/Chrome.tsx` (the Legend).
- The filing: `src/leavewar/state/store.ts fileStraight` (and the gesture, `lwRegisterCommands`, the AbsenceDoor interface),
  `src/leavewar/sync.ts doorFile` (beside `doorApprove`, which it is modelled on), `src/state/perms.ts` ('lw.file' and the
  member's ownership rules it runs under), `src/undo/describe.ts`.
- The buttons: `src/leavewar/ui/LeaveButtons.tsx DutyButtons`, `BidPicker.tsx` (`fileDuty`, the row under the leaves),
  `SelectSheet.tsx` (`fileDuty`, its row), `ClosedNoteSheet.tsx` (its row), `Matrix.tsx` (which window a tap opens, for which
  role and day — the conditions around RaptorSheet / ClosedNoteSheet / BidPicker).
- The Inputs calendar: `src/ui/inputscal-model.ts`, `src/ui/scheduler/25-inputs-calendar.css`.
- The tests: `src/leavewar/ui/round2.test.tsx`, `src/engine/unakind.test.ts`, `e2e/round2-leavewar.spec.ts`.
- The design note with the builder's readings (each the owner's to strike — do not report a reading as a defect unless it
  breaks one of his rulings): `raptor-port/docs/superpowers/specs/2026-10-24-lw-file-od-cse-una.md`.
- The evidence sheet: `raptor-port/docs/handpass/2026-10-24-lw-round2.md` — the roll-call, the walk's findings.
- The owner's rulings: D1338 (UNA — it replaced D1335, D1336, D1337 and narrows D1324, D1326, D998), D1299, D1303, D1318,
  D1325, D1326, D998, D1166, D1211, D1225, D804, D660, D782, D952 — one line each in
  `.claude/rules/decisions/leave-war.md`; open a ruling's full row with the shell before relying on its detail:
  `grep -h '^| D1318 |' .claude/decisions-full/*.md`.

## Widened for round 2b and the check's fixes (24 Oct 26) — READ THIS FIRST

UNA is NO LONGER an input kind. His D1338 (24 Oct 26 — open its full row with the shell): UNA stays, on the Leave War only;
an admin alone places it (whole day, AM or PM — 1 or 0.5 off the manning); everyone sees its deep teal box and reads its
remarks; it is nowhere else in the app — not an input kind, not on the Inputs page, the schedule, the bell or the OIL work.
Everything above that treats UNA as an input (`inputs.ts` INPUT_META 'UNA', reinput, the LATE mark's exception, the Inputs
calendar's teal) is GONE — `src/engine/unagone.test.ts` pins it gone. Read UNA as the war's own record:

- The record: `src/leavewar/engine/warrecs.ts` (`UnaRec`, `readRecBody`'s UNA branch — an unreadable record throws the
  WHOLE war away at load, `listProblem`'s one-a-half rule, `recContribs`), `engine/codes.ts` (`HALVED_MARKS`, `parseCell`,
  `formatCell`, `dayCodeFor`, `CODE_GLOSSARY`), `engine/dayview.ts` (`levelOf`, `notation`, the manning's `removing`),
  `engine/charge.ts legacyViews`, `state/merge.ts projRecord`, `state/daypanel.ts`.
- Who may change it — held in TWO layers: the store (`state/store.ts placeUna`, `setUnaRemarks`, `removeUna` — admin
  only; the one-day Clear in `setCell`, the block Delete in `clearRequestsAt`, `deletableIn`, `clearRecordById`, `stayingIn`
  for the Move) and the commit (`src/state/perms.ts` — `'lw.una'` in COMMAND_OPS, `unasOf` and `ownershipViolation`'s
  `lw.cell` check, which refuses ANY member command that changes a UNA at an address, his own row included, whatever the
  command is called — his Undo and Redo too).
- The screens: `ui/LeaveButtons.tsx UnaButton`, `BidPicker.tsx fileUna`, `SelectSheet.tsx fileUna`, `DayList.tsx`
  (`UnaWords`, the UNA entry — read only for a member), `Matrix.tsx` (`listOpen` — a UNA day opens the day's list for
  everyone; `stayWords`), `ui/Chrome.tsx` (the Legend), `ui/matrix.css`, `ui/LeaveLine.tsx`; `src/undo/describe.ts`.
- The tests: `src/leavewar/una.test.ts` (with a reload), `ui/round2.test.tsx`, `e2e/round2-leavewar.spec.ts`.

The check's own fixes, each red first — read them as new code: `61a4ffa6f` (`sync.ts doorFile` leaves a day already holding
the same kind for him as it is and says so — the designer's G2; `askFiledOil` raises a weekend's OIL question at once after
filing from the war — one input its own window, several the one list (D782) — owner D804, D660, the designer's G3) and
`d144d61f7` (`ui/bidpicker.css .bp-more` — the row under the leaves stands as tall as the leave buttons in Safari).

**Look hardest at, for UNA:** every place that branches on a record's `kind` (`'request'`, `'credit'`, `'notice'`) — a
`switch`, an `if … else` that falls through, a filter — and what a UNA does there: counted as a bid? charged? approved?
listed in Approvals, My leave, the person window, Balances, the OIL tracker, the clash note, the bell? moved by a Move,
taken by a member's Delete, copied by a posting out, read back by a reload, written as a row by the command stream
(`state/rows.ts`)? A member's every route to an address holding an admin's UNA: a bid on the free half, a drag's Delete,
his Undo of his own bid beside it. An admin's: a second UNA on the same half (replaced), a UNA over leave or a medical.

**What the walk already saw** (the sheet, §The walk — round 2b): 85 / 85 in Chromium at both sizes after the script's own
mistakes, 35 + 1 in WebKit (the fix above). Its RECORD lines are readings, not faults.

## The brief (the checking order's §4, verbatim)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going forward**
> — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to NEW data,
> report it: that is a real finding and this exclusion does not touch it.

Look hardest at: every hand-kept list of input kinds anywhere in the app (search for `'OD'`, `'CSE'`, OD in regexes and in
CSS) that UNA should have joined and did not — the schedule, the clash rules (`leavewar/inputgate.ts`), the OIL passes
(`leavewar/sync.ts`, `engine/oil.ts`), availability (ALL AVAIL), the SANS calendar, the Logic page, the late mark, the type
legend; `doorFile` beside `doorApprove` (what does approval do that filing skips — the locked week, a run's join with a
neighbouring input of the same kind, the war's own records on the day, the repaint, the change history, the "placed by"
stamp — and should filing do it too?); a member's filing through the command gate (`perms.ts` — his own row only; a range
or drag reaching another man's row; a day before today; a posted-out day); the drag window's cells for several men; the
words of a held bid versus the words of something new; Undo and Redo of a filing through the top bar; what a tap on a filed
day opens for each role; whether a filed OD or UNA can then be removed by anyone from the war at all.

## What to hand back

A finding only with a concrete failure, its cause and its exact fix, step by step (D489) — written so a failing test can be
made from it; ranked by what a person meets. Explicit negatives: what you checked and found nothing in. Say for each
whether it is new in round 2, or older code it made reachable. Under about 2,000 words, plain text.
