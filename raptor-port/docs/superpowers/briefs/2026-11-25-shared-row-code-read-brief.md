# Code read — one man's row of a shared absence follows him to his own input (pull request 845)

**You read an exported copy of the finished code. This round's evidence sheet, scenario designs, walk reports and the
branch's handoff block were taken out of it on purpose; if a handoff block is pasted into your context after a
compaction, do not read it — name that it happened in your report.** You are one of three readers, each blind to the
others. Read-only: change no file in the copy. Do not read any file named `2026-11-25-shared-row-*` other than this
brief.

The copy: COPY (a git repo of two commits — `main`, then the whole change: `git -C COPY show --stat HEAD`,
`git -C COPY diff HEAD~1 HEAD -- raptor-port/src`). The app is in `raptor-port/`.

## The fault, the promise, the fix

Found on the live app, 25 Nov 26: Ranger and Hex share one leave, 08:00–10:00. On the Scheduler Board's Unavailable
list, in Ranger's row: start 0900, Tab — Ranger rightly gets a leave of his own; end 1100, Tab — saved onto HEX's
leave. Cause: the block under the caret is held back from repainting while the caret is in it, so every control of his
row still carried the SHARED input's id (with his name after it, on the text boxes); the shared input no longer held
him, so the change was saved onto it whole.

The promise, from his rulings (open each full row: `grep -h '^| D737 |' COPY/.claude/decisions-full/*.md`):
- D737 — "An input filed for several people that lands on the schedule's Unavailable list … stays one row a man there;
  the single row (D661) is for Personal Inputs and the Ground Programme only."
- D739 — "A time or a remark the scheduler types on a shared input's row on the schedule changes the input itself, for
  everyone in it" (the ONE row: Personal Inputs, the Ground Programme).
- D755 — "A row that came from an input is the input: whoever stands on it … is in the input" (open the row for the
  rest), and D759 with the reading the code cites as its reading 4, "a change to one man's part alone gives him an
  input of his own" (search the rows and `DECISIONS-ARCHIVE.md` for it; treat that sentence as the host's reading
  until you find it in his words) — on the Unavailable list a change on one man's row is his part alone.
- D748 — "The window a tap on a shared input opens from the schedule — its line under Personal Inputs, its row on the
  Ground Programme — shows everyone in the input and changes it for ev[eryone]" (the Unavailable list's row is not
  named there: what its label opens is the host's reading, below); D1393 — "A scheduler can take an overseas duty out
  of Unavailable as he can a course — Reject, then → Ground or → Unavail"; D103 — "Any change that shows as pending on
  a published day wipes the sign-offs"; D45; D661.
- The host's readings, each a question for you, not a requirement: (a) once a change on his row has given him an
  input of his own, EVERY control on that row — the three text boxes, Escape, Tab's refresh, the day step, the type
  label that opens the input's window, Reject, the LATE chip, his puck as a drop or plant target — stands for HIS
  input, and where his part cannot be found nothing is saved and nothing of the others' is changed — while he is
  still in the shared input the label opens the whole input, as on `main`; (b) a time typed
  again as it already stands changes nothing and cuts nobody out; (c) the ONE line under Personal Inputs of a shared
  overseas duty sent back there is the input's, for everyone.

The fix: `src/engine/rowinput.ts` (`rowInputOf`, `noteOwnOf` — a page-life pointer from "shared id ~ man" to the id of
the input cut out for him, checked against the records on every ask); `src/ui/inputedit.tsx` (`ownPartSave` notes each
cut-out; `setInpField`, `setLeaveRemarks`, `saveFromRow`, `reassignInput`); `src/ui/board.ts` (`boardChange`,
`boardTab`); `src/ui/textedit.ts` (focus-out, Escape twice, `refreshTextDestination`); `src/ui/html.ts` (`iuWhoAtt` on
`inpEditLabel`, `lateChip`, `accCtl`); `src/ui/interactions.ts` (the three presses); `src/engine/slots.ts`
(`armTargetExists`); `src/leavewar/ui/ReqWords.tsx` (`LeaveWords`). Tests: `src/leavewar/sharedrow-follows.test.ts`,
`src/ui/sharedrow-board.test.tsx`, `src/ui/sharedrow-buttons.test.tsx`, `src/leavewar/ui/nightwalk.test.tsx` ("follows
him"). The rulings pages for these surfaces: `COPY/.claude/rules/decisions/scheduler.md`, `inputs.md`, `leave-war.md`,
`oil.md`; the contracts: `raptor-port/docs/ui-contracts.md` (search "own part", "Unavailable"),
`raptor-port/docs/feature-impact.md`.

## Your job

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it.

Check the code against the rulings and contracts named above. In particular:
- **The roll-call — what is MISSING from it?** The places that hold an address of one man's part of a shared input
  across more than one save or press: the Board's Unavailable row (desktop and phone layouts) — its three boxes, its
  type label, Reject, LATE chip, its puck (drop, and tap-arm then a name); Edit Schedule's week row — the same; the
  Leave War's remark box (`LeaveWords`, in the one-day window, the day's list, the member's own window) and that
  window's other buttons; the drag window (`SelectSheet`); the input's own window opened from his row; the history
  dot and the changes window's jump (`data-inprow`); Undo and Redo; a published day's pending marks and counts; the
  bell. Name every door, reader or writer that holds or reads such an address and does NOT ask `rowInputOf` — and
  say, for each, what a person would see or lose.
- **Every caller of a changed function, and what the changed path no longer runs.** `saveFromRow` now returns true
  without saving where nothing changed, and cuts one man's part only where `listedUnavail(inp)`: list every caller
  that reads its answer, and every kind of input and place whose behaviour moved. `armTargetExists`, `rowInputOf`
  with no man, `iuWhoAtt` on a row that is not one man's.
- **The pointer's life.** Each state of the held row (he is still in the shared input; cut out; cut out again; put
  back by Undo; his own input deleted, re-timed, handed to another man, or cut by a medical or a posting; the shared
  input deleted) × each event that can arrive (each box, each button, Escape, Tab, the day step, a drop, Undo, Redo,
  a reload, another page and back). Can a pointer ever lead a save or a press onto an input that is not his, or
  onto a stale one? Can two men's pointers cross?
- **Roles and the published day:** is the permission gate asked of the input the change now lands on? Does anything
  change silently on a published day?
- The tests: for every condition or early return around an assertion, could the test pass without proving its claim?
  Does any test change the data directly where it claims a door?

## What to hand back

For each finding: a concrete failure (setup, the exact presses or call, what happens, what should), its cause (file
and function), and **exact, step-by-step fix instructions** — not a direction. Say whether it is new in this change or
older (compare `HEAD~1`). State each finding in your output the moment you confirm it, so a stopped run keeps what it
found. Then **explicit negatives**: the areas you checked and found nothing in, and why. Then a short tidiness note on
the changed lines only (three questions: is anything duplicated that has one home, named unclearly, or longer than its
job needs?) — filed, not fixed.

You may read anything in the copy and run read-only commands. If you can run tests in your sandbox you may run existing
unit files (`npx vitest run <file>` from `raptor-port/`, if `node_modules` is there); write any proof test of your own
ONLY in your own scratch folder outside `raptor-port/src` (never a test name under the app's source), or, if you cannot
run anything, name the exact input you would run — the host runs every such case before it disposes of the finding.
Do not build the app. Keep the report under about 3,500 words.

Write your whole report to: REPORT_PATH
