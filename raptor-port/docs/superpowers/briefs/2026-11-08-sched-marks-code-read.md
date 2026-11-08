# The final code read — the schedule's marks and words (the pictures round's group 3), chat 13, 8 Nov 26

One brief, sent unchanged to three readers, each blind to the others (`raptor-port/docs/bug-check-order.md` §4, rank 2 —
the published record and saved data): **Astra** (the standing reviewer, D1770), **Sol 6.1** (the second seat until Mon
9 Nov 26 19:00, D1743) and **a fresh Opus reader** that did not write this code (D790, D903). Read-only: change, create or
delete no file; do not commit. You may read files and run read-only commands (`git diff`, `git show`, `grep`); a reader
that can run a unit test may run one file (`npx vitest run <file>` from `raptor-port/`), nothing that builds. Where you
would want the app driven, name the exact steps and what you expect; the host drives it.

## What to read

- The change: `git diff f9267b2fe 19551d882 -- raptor-port/src` (the branch `claude/pr-sched-marks-3205d7`; the working
  tree is at `19551d882`). Read every changed file at that commit, and its callers.
- **Do NOT open** (they hold the walk's and other readers' results, and you must stay blind): `HANDOFF.md`, anything named
  `*2026-11-08-sched-marks*` under `raptor-port/docs/handpass/` (the evidence sheet and its `parts/`), the picture folder
  `raptor-port/docs/img/handpass/2026-11-08-sched-marks/`, `raptor-port/docs/superpowers/briefs/2026-11-08-sched-marks-walk.md`,
  `raptor-port/scripts/handpass/sm-*.mjs`, and this branch's commit messages (`git log` of it). The build brief
  `raptor-port/docs/superpowers/briefs/2026-11-08-sched-marks-build.md` and the drawings' notes it names are yours to read.
- The rulings: `.claude/rules/decisions/scheduler.md`, `design.md`, `inputs.md` (one line each) and their full rows in
  `.claude/decisions-full/` (`grep -h '^| D1784 |' .claude/decisions-full/*.md`); `raptor-port/docs/ui-contracts.md`
  §The pictures round's answers, 8 Nov 26; `raptor-port/CLAUDE.md` (the funnels, the slot keys, the HTML builders).

## The promise (each sentence from a ruling's full row, cited; "the host's reading" marks one with no row behind it)

1. **D1784:** "An input filed, changed or moved after its day was published wears the same waiting mark on its Unavailable
   row as on a Ground Programme row — its name underlined dotted in the amendment's colour on the week, its name box
   outlined dotted on the board — until the day's next amendment goes out." "No new words and no new look." It carries
   D45 and D93 (nothing on a published schedule changes without the scheduler acknowledging it; a change waiting to go out
   is marked) to the one list that never got the mark; D177 and D178 already count such an input as pending.
   - The host's reading (the build's design): the mark reads the same one list the day's count reads (`engine/publish.ts`
     `pendingInputIds` over `dayPendingItems`), so a row is marked exactly when the count names its input; it shows
     where the Ground name's mark shows and nowhere else — not on a day never published (a draft day shows no marks,
     the settled "amendment marks are a published-day thing"), not in a look at a version or a plan, not on the issued
     face (View-only Sched), not in OIL Earn (where the Ground name wears none — measured first), not under Personal
     Inputs (Unavailable only), not on an input untouched since publishing.
   - The host's reading (a fault the walk found, older than this job, fixed here in commit `19551d882`): a tap on such an
     input's line in the day's "waiting to go out" list (the changes window's To go out tab, and the day's "N pending"
     list) goes to its row under Unavailable or Personal Inputs — one man's row first, then the input; a man split out of
     a shared input to his own new record first — as the History window's tap does (`ui/changesjump.ts jumpOf`); a
     deleted or moved-off input's line stays still (`ui/pendlist.ts inputWords`, `inputRowKeys`).
2. **D1785:** "A week whose saved copy cannot be read says so on each day, says the saved copy is kept as it was and to
   report it with "Report a problem" on the Help page, and refuses a change in the grey "Blocked:" note in the same
   terms." The words: on each day "This week's saved copy could not be read, so it can't be shown. The saved copy is kept
   as it was." and "Report it with "Report a problem" on the Help page."; the refusal "Blocked: this week's saved copy
   could not be read, so it can't be edited. Nothing was saved." — "both end with that sentence" (the Report-it one). "It
   replaces the words that blame "an older version of the app" and send him to "the device that created it"." The grey
   look carries D1667–D1669 to the one refusal their build left amber.
   - The host's reading: a week protected because an older version published it (not because it cannot be read) keeps
     its own words — notice and refusal — in the grey note, without "Report it" (`engine/quarantine.ts weekLockReason`
     tells the two apart; `engine/publish.ts lockedWeekNote`).
3. **D1667, D1668, D1669:** every "Blocked:" refusal of one change opens with the bold word "Blocked:" and takes the app's
   plain grey note (the "no entry" sign red, "Blocked:" bold white), never a red or amber box; a refusal that carries its
   own reason reads "Blocked: <reason>. Nothing was saved…".
4. **D1792 (a), (d):** "the 👁 on a look at a published version takes the wave templates window's line eye"; "a hidden
   warning's ↺ the Reset arrow; the ✕ stays typed." (D469, D472, D475: a hidden warning stays in its place, struck; a
   member sees no ✕ / ↺.)

## How to read it

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Also not a finding: a scheduler who is not an admin (a scheduler is always an admin, D785); the engine files' compressed
one-line style (verbatim ports — CLAUDE.md); anything only a test-only state reaches. Two behaviours are known and older
than this job — judge only whether this change makes them worse: while a text box on the Scheduler Board has the caret,
the panel holding it is not redrawn until the caret leaves (`ui/SchedBoard.tsx`, "the panel with the caret waits"); the
desktop next-week preview, print and the spreadsheet export draw a damaged week as the demo days.

The builder's readings to rule on — each **supported / contradicted / the owner's to decide**, with the line that settles it:
(a) the mark's one list (`pendingInputIds`) and its per-pass memo (`passMemo('pin', …)`) can never disagree with the day's
count, through Undo, Redo, a reload, a publish of AL1 and a week change; (b) the four "never" places above; (c) the board's
mark is drawn on a read-only board as on an editable one, as a Ground box's is; (d) a damaged week is told apart from an
older-version week on every door that refuses (the input window's new / edit / delete / re-date / person, the store's
backstop — drag, Accept, → Unavail, Goes to — the Leave War's doors, a person's delete, Publish); (e) `inputIdOf`, moved
from `ui/pendlist.ts` to `engine/publish.ts`, is unchanged; (f) the waiting list's new jump keys (item 1's last reading)
land on a row the week and the board draw, and never on a look.

## What to hand back

For each finding: its severity; the failure scenario (setup, action, expected, what is seen instead); its cause, file and
line; whether `main` (`f9267b2fe`) does the same; and **exact, step-by-step fix instructions** — not a direction. A claim
is a finding only with a concrete failure, its cause and its fix (D489). Then **explicit negatives**: each surface or door
you checked and found right ("I checked X and found nothing"). Then the tidiness note (D489): of the changed lines only —
is anything repeated that one place could hold, is a name or a comment wrong, is anything left that nothing uses — filed,
not fixed; never about the engine's style. No size numbers.
