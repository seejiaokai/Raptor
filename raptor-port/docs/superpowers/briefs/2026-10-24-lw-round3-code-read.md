# Round 3 of the bid windows — the fresh, blind code read (24 Oct 26)

For ONE fresh Opus reader that did not write this code and has seen no other reader's report (D790; no ChatGPT reader —
out; no Fable — D903). Read only: change no file, commit nothing.

## What to read — at the commit named in your instruction, never the working tree

Another chat keeps building in this checkout while you read, so read every file AT THE COMMIT: `git show <commit>:<path>`,
`git diff <base>..<commit> -- <path>` (base: `979925336~1`, the build's parent). The change is round 3 (979925336) and the
check's fixes after it (9ab4c65fd, 0cca37160, aec4a1aef and the commit you are given).

- The code: `raptor-port/src/leavewar/ui/BidPicker.tsx`, `BidBits.tsx`, `SelectSheet.tsx`, `DayList.tsx`, `ReqWords.tsx`,
  `DayLine.tsx`, `LeaveButtons.tsx`, `Matrix.tsx` (which window a tap opens; `adminNoteRow`, `remarkRow`), `bidpicker.css`
  (round 3's block at its end, inside `#page-leavewar`); the store's writers they call (`raptor-port/src/leavewar/state/store.ts`
  `setBidStates`, `setRequestWords`, `placeApproved`, `setCellRange`; `raptor-port/src/leavewar/sync.ts` `leaveInputAt`,
  the absence door; `raptor-port/src/ui/inputedit.tsx` `setLeaveRemarks`).
- The tests: `raptor-port/src/leavewar/ui/round3.test.tsx`, `bidwords.test.tsx`, `raptor-port/e2e/round3-leavewar.spec.ts`.
- The evidence sheet: `raptor-port/docs/handpass/2026-10-24-lw-round3.md` — the roll-call, the door check, the walk's
  findings F1–F11 and the questions for the owner (Q1–Q3; do not report those again).
- The promise: `raptor-port/docs/ui-contracts.md` lines 11448–11545; the owner's rulings, one line each, in
  `.claude/rules/decisions/leave-war.md` (D1144–D1334). Before relying on a ruling's detail open its full row with the
  shell: `grep -h '^| D1330 |' .claude/decisions-full/*.md`.

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

Look hardest at what the check's fixes added: the words saved before an action (`flushWords`, `FlushRef`, `useFlush`, the
day's list's `flushers` — any action that still skips it? any double save? a save landing on the wrong record after the list
re-renders?); the list's new order (anything that read the old order — a test, the clash sentence, the "N more" cue?); the
⋯ menu's caught click (could it swallow a click it should not — the ⋯ itself, a press that never became a click, a second
window, the keyboard?); "Pick a range" now closing the calendar (a range half picked, then closed?); `runEnd` (a run that
crosses a day of two entries, a refused run, a run moved); the `has-docs` row on a phone; the state table of the one-day
window (empty / pending / approved / refused / half / free half / award / range / member) and each order of the lit
Approve, Refuse, Undo and Redo.

## What to hand back

A finding only with a concrete failure, its cause and its exact fix, step by step (D489) — written so a failing test can be
made from it; ranked by what a person meets. Explicit negatives: what you checked and found nothing in. Say for each
whether it is new in round 3 / the check's fixes, or older code they made reachable. Under about 2,000 words, plain text.
