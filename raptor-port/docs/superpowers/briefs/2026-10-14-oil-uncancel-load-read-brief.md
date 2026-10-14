# The brief for the fresh read of the small OIL job (14 Oct 26)

`[OIL-UNCANCEL-UNASKED]` (owner D816) and `[OIL-LOAD-VERSION-UNASKED]` (owner D818). One fresh Opus reader, who did not
write the code and has seen neither the walk's report nor another reader's (D790). No Fable read, on his word for this
job (D858 — "opus is good enough for the oil work and solely opus to review is good enough"). The job is on
`[NO-ASTRA-LIST]`'s standing footing (no ChatGPT reader until his subscription is back, D761).

**Read-only: change no file.** Read the code AT THE COMMIT, never the working files (break tests may change them while
you read): `git show 15a72901d:<path>`, and the change itself with
`git diff 1d29b83c8 15a72901d -- raptor-port/src`. You may run ONE unit test file at a time from `raptor-port/`
(`npx vitest run src/ui/<file>`); do not build, do not run browser tests (the PC's lock is held), do not start a server.
Where you would need the browser, name the exact steps and what you expect, and the host runs them. Do NOT open
`raptor-port/docs/superpowers/plans/2026-10-14-oil-uncancel-load-plan.md`, the scenario list beside this brief, or
`raptor-port/docs/handpass/2026-10-14-*` — they hold the host's conclusions.

## What was promised (each ruling's full row: `grep -h '^| D816 |' .claude/decisions-full/*.md` — the shell, not the Grep tool)

- **D816:** "taking the cancel off an input that has no OIL answer for a non-working day puts the OIL question first,
  as 'Accept' does — nothing is un-cancelled until it is answered; where it is already answered, or nothing is to be
  asked, it is un-cancelled at once and the answer counts again." Its readings, told to him: (1) taking the
  information-only mark off is treated the same; (2) not answered, it stays cancelled and the bar that stays says so,
  with "Answer OIL" and "OK" — "Don’t un-cancel" / "Un-cancel" / "Not un-cancelled — OIL not answered" (for the ⓘ
  mark: "Don’t change" / "Change" / "Not changed — OIL not answered"); (3) the answer and the un-cancel are one step
  and one Undo; (4) an Undo of a cancel still asks nothing.
- **D818:** "after a published version is loaded back onto the working copy, the app says how many of the inputs it
  put back still need an OIL answer and opens that day's one list of them — the load itself is not held."
- **The rulings they stand on — read their full rows too:** D814 (a cancelled or information-only input is never asked
  and wears no "OIL?" sign), D804 (which kinds are asked; under Unavailable included), D793 and D783 (a change that
  raises the OIL question is not made until it is answered; the bar), D782 and D781 (the day's one list; what is
  answered there notifies nobody), D762 / D660 / D682 (one answer for everyone in a shared input), D142 and D2 (only
  the published schedule earns), D148 (Undo), D44 / D45 (nothing on a published day changes unacknowledged). The area
  files: `.claude/rules/decisions/oil.md`, `scheduler.md`, `inputs.md`; the contracts
  `raptor-port/docs/ui-contracts.md` §The OIL question comes before the change, and `raptor-port/docs/engine-rules.md`
  §Weekend/PH work earns OIL.
- **The host's readings (questions for you, not requirements):** an input wearing BOTH marks is asked only when the
  last one comes off (while one stands it still can earn nothing); "put back" by a load means "standing on the day
  after the load, needing an answer, and not already standing there needing one before it" — so an input a load would
  bring back from cancelled is counted too; on a plain weekend the list opened by a load does not call the day a public
  holiday; "Switch to this plan" (a saved plan, not a published version) says nothing — D818 names a published version.

## The doors and the readers the host worked from — say what is MISSING

| The thing | Every place the host found | The host's answer |
|---|---|---|
| A cancel taken off an input | the Scheduler Board's cancel sheet ("Un-cancel", `ui/board.ts cxCommit` → `ui/reqdoor.ts rowMark`) · the same sheet's "Save reason" on a cancelled line · Undo of a cancel · Redo of an un-cancel · a published version loaded back · a saved plan switched to · the input's own window (it offers no un-cancel: D771) · the week (it has no CX button outside the board) | asks first (new) · no un-cancel there · asks nothing (D816 reading 4) · asks nothing (it carries its answer) · counted by D818 · says nothing · — · — |
| The ⓘ mark taken off an input | the board row's ⓘ button (`rowMark`, `what:'info'`) · the same four history doors | asks first (new) · as above |
| A scheduler's own row (no input behind it) | the same two buttons, by `ui/board.ts`'s own path | untouched: a scheduler's row earns by the OIL Earn mode, never by this question |
| The question, not answered | `ui/oilwait.ts` — `WAIT_WORDS`, `CHANGED`, `answerOilWait`, `leaveOilWait`, `oilBarAgain`, `oilBarOk`; the sheet `ui/OilWaitSheet.tsx`; the bar | two new kinds, `uncx` and `uninfo` (`state/view.ts OilWaitKind`) |
| The load of a published version | `ui/interactions.ts` (the `data-restore` door — the week's preview bar and the board's own copy of it both route there) | the tail and the list (new) |
| The day's one list | `ui/OilDayList.tsx`, opened by `ui/pops.ts setOilList` — from a holiday's save, the bell's line, and now the load | a `plain` flag: no "Public holiday" line where the day is a weekend |

## How to read it — use this wording as your method

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
> of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database
> step. **Do not report a problem whose harm exists only in data already stored when the code is already correct
> going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it
> again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**And the state table.** One thing here holds state between presses: the waiting change (`state/view.ts OILWAIT`, with
its bar). For each of its states (the question open; left, the bar up) take every event that can arrive: the same
button again; the other mark's button; another input's button; a puck dropped; a swap; Undo and Redo; the input deleted,
moved to a working day, handed to another man, answered in its own window, or un-cancelled by another door; the board's
day stepped, the board closed, the page or the week changed; OIL Earn switched on; a sign-out, a member's view; a
published version loaded on that day; the day published. And for the load: Undo straight after it with the list open;
two loads running; a load on a day whose list is already open; a load whose version holds an input since deleted, moved
to another day, cancelled, or covering more days than the one loaded.

**This is OIL — earned leave, banked time off (never pay). Rank highest** anything that writes an OIL answer nobody
gave, loses one that was given, credits a cancelled or information-only input, un-cancels with no answer where one was
owed, or lets a published day's credit change with no pending mark.

**What a finding is:** a concrete failure — the setup, the press, what the screen then shows or says, what it should —
its cause (file and line at the commit) and its exact fix, step by step. Not a direction. And give your explicit
negatives: "I checked X and found nothing". Say separately anything you could not check without a browser.

## Files at `15a72901d`

`raptor-port/src/ui/reqdoor.ts` (`rowMark`, `unmark`, `UNMARKED`, and what they call: `holdForOil`, `quietGate`,
`draftOf`, `dryRun`, `saveBatchX`) · `ui/oilwait.ts` (whole) · `ui/OilWaitSheet.tsx` · `state/view.ts` (`OILWAIT`,
`OilWaitKind`, its setters) · `ui/board.ts` (`askCx`, `cxCommit`, the ⓘ button's path, every caller of `rowMark`) ·
`ui/interactions.ts` (the `data-restore` door, about forty lines) · `ui/pops.ts` (`OILLIST`, `setOilList`) ·
`ui/OilDayList.tsx` · `raptor-port/src/leavewar/sync.ts` (`oilOpenOn`, `dayFacts`) · the engine's `oilGate` and
`oilNeverEarns` · the tests `ui/oilwait.test.tsx` (its blocks "(ON10)" and "(ON11)"), `state/p6c-requestonread.test.ts`,
`ui/inputmarks-scenarios.test.tsx`, `ui/noteswords.test.ts`.

Return the whole report as your final message, and save the same text to the file the host names when it starts you.
