# The read of the three builds of 14 Oct 26 — the reader's brief (`[LW-CLASH-NOTE-PHONE]`, `[NOTES-SHORTER]`, `[LOOK-13OCT-SMALL-FIXES]`)

**For ONE fresh Opus reader (D790), who did not write any of this code and is told nothing of what its writers think of
it.** You READ; you change no file, run no build and no browser test (single unit-test files are yours to run if a
claim needs one: `cd raptor-port && npx vitest run <file>`). Your report is the whole of your work.

## What was built (the facts, not a verdict)

One branch, `claude/approved-jobs-batch-build-cc42ef`, three approved jobs as one batch. The code to read is the whole
difference from the commit the branch was cut at:

`git diff bfaa68489..HEAD -- raptor-port/src raptor-port/e2e` (and `git diff bfaa68489..HEAD --stat` for its shape).

1. **The Leave War's clash note** — on a phone a line of its own under the two lines of buttons that opens its list in
   place; on wider screens the old strip in new words; a tap opens that day FOR that person, or the leave's own window
   on the Inputs page. Files: `src/leavewar/ui/Chrome.tsx`, `chrome.css`, `src/leavewar/state/store.ts` (`focusDay`,
   `takeFocusOpen`), `src/leavewar/ui/Matrix.tsx` (the effect that takes the ask up), `src/leavewar/sync.ts`
   (`SyncClash.war` / `.iid`, `openInputWindow`).
2. **The passing notes** — about forty sentences reworded to the owner's approved wordings, two notes of one publish
   that name the same day said as one, one sentence given a single source for its seven places, and the note's width on
   a phone. Files: `src/ui/toast.ts`, `src/engine/publish.ts`, `src/leavewar/sync.ts` (`oilBlindLine`,
   `publishFlagsBids`), `src/ui/interactions.ts`, `src/ui/board.ts`, `src/ui/inputedit.tsx`, `src/ui/QualsPage.tsx` and
   the other files the diff shows.
3. **The design look's small fixes** — the OIL question's words, flat answers, outline look, Back / Add; the ✕ of every
   small window in its corner and last by keyboard in a question sheet; the bar that waits on an OIL answer moved from
   the foot of the screen to a band under the top bar (one line always, "Not saved" above it, the line under it amber);
   the date calendar's four keys, its last pickable date, its phone card's name and five look fixes; the Tracker's date
   boxes. Files: `src/ui/OilConfirm.tsx`, `sheetfocus.ts`, `OilWaitSheet.tsx`, `OilDayList.tsx`, `Shell.tsx`,
   `SchedBoard.tsx`, `MedicalView.tsx`, `SaveStatus.tsx`, `App.tsx`, `DateCal.tsx`, `DateBox.tsx`, `EveryWeekday.tsx`,
   the stylesheets `src/ui/scheduler/08-, 14-, 17-, 25-, 26-*.css`, `src/tracker/components/DateBox.jsx`, `Pop.jsx`,
   `SidePanel.jsx`, `src/tracker/tracker.css`.

## What it must do — the rule, not the builders' account of it

- The owner's rulings, each ONE line in its area file and whole in `.claude/decisions-full/` — open the full row before
  judging against one (`grep -h '^| D827 |' .claude/decisions-full/*.md`, with the shell's grep): **D805, D823, D827**
  (the clash note), **D828, D837, D838, D839** (the notes and their width), **D830** (the small fixes), **D831, D840,
  D841** (the bar), **D842** (a picked answer with the keyboard on it shows one ring), **D783, D587** (the bar's words; the failed-save band it now shares), **D796, D797, D800, D824**
  (the calendar), **D374, D801** (the Tracker's boxes), **D679** (a desktop's Leave War top stays as it is).
- The words to the letter: `raptor-port/docs/superpowers/briefs/2026-10-13-wording-recheck.md` — List 3 where it has a
  row, else Lists 1 and 2, and its two tables; its last section says what was NOT to be touched.
- What each finding's change was to be: `raptor-port/docs/handpass/2026-10-13-design-look.md` §3 and §6, and the page
  the owner approved, `raptor-port/docs/mock/design-look-13oct.html` (lines 119–155, 229–397).
- The house rules that apply to any change here: `raptor-port/CLAUDE.md` (the mutation and persistence funnels, "React
  owns chrome, strings own density", the conventions), `.claude/rules/decisions/leave-war.md` §Architecture (the Leave
  War's four seams — is `openInputWindow` inside one?), `.claude/rules/ui-design.md`.
- The check so far: `raptor-port/docs/handpass/2026-10-14-three-builds.md` — its roll-call (§2), door check (§3), what
  the host's scripts asserted on the running app (§5), what a test carries (§8), and what the walk found with each disposition (§9; the three walkers' own shares are
  `raptor-port/docs/handpass/parts/2026-10-14-three-builds-w1.md`, `-w2.md`, `-w3.md`).

## What to look for

**Errors, and ABSENCES.** A reader finds a wrong line easily; what the roll-call exists for is the line that is not
there. For every row of §2 and §3 of the sheet, find the code that makes it true — and say where a row's claim has no
code behind it, or where a place the app draws the thing is missing from the table.

Ask in particular, of the code as written (these are questions, not suspicions with an answer attached):

1. **Things that hold state between presses** — give each its state table (each state × each event that can arrive in
   it) and say which cell is wrong or untested: the clash list's open / closed choice (`clashPick`) as the count of
   clashes changes, the page is left and returned to, the role changes; the store's one-shot `focusOpenAsk` against
   every other caller of `focusDay`, `selectWar`, undo's soft ask, a grid not mounted, a period with no such date; the
   bar's `covering` counter across the board opening and closing while the bar is up, the Medical view, two surfaces at
   once, an unmount during a render; `sheetfocus`'s order when a sheet has no ✕, a disabled ✕, one control, or another
   sheet opens over it; the calendar's keys with the lists open, at `min` / `max`, at a month's and a year's edge.
2. **A listener or an effect that outlives what it was for** — `OilWaitSheet`'s resize listener and observers, the
   fit-to-one-line loop (can it loop, or leave a size behind when the text changes?), `Shell`'s resize event when a band
   comes and goes, `DateCal`'s `wantIn`.
3. **Who else reads what changed** — every caller of `toast` now that it has a third argument and of `toastBatch` now
   that it may join two notes: can two unrelated notes about one day be joined wrongly, or a warning's colour be lost?
   every reader of `SyncClash` now that it has two more fields (equality checks, tests that compare whole objects);
   every user of `.airpop-head .x`, `.upconf-seg`, `.secdef-btn`, `.seg`, `.saveband` in the stylesheets and the
   components — does a rule changed for one reach another it should not, or miss one it should reach?
4. **The words** — any built sentence that differs by a character from the wording of record; any place that still
   says an old sentence that was to change; any sentence the code can produce that is untrue or ungrammatical for some
   value (a plural, a day with no date, a version label, an empty name).
5. **Rules the change must not break** — the Leave War's seams; "a desktop's Leave War top stays as it is" (D679);
   date maths that must not depend on the time zone (the Leave War's tests run in a hostile one); nothing saved in a new
   shape; who may see the clash note; the dense week and board untouched.
6. **The tests** — a test re-expressed for new words that now asserts less than it did; a new test that would pass
   with the feature removed; a behaviour in §2 or §3 with no test and no line in §5; the one test file whose date is now
   held (`src/ui/placeholderlist.test.tsx`) — is holding it right, and does anything else in the suite share its fault?

## What is NOT a finding

- **A problem that lives only in data already stored** (D56): the whole store is demo data and is cleared before the
  database. Both must be true: the harm is only in stored data AND the code is right going forward.
- The two keyboard jobs filed and not in this batch (a puck by keys; the Tracker's chart and marking pop-up by keys),
  calendar step two's keys (Escape closing only the lists; a faint date reachable by the arrows), and the notes the
  owner did not see on his page (the wording record's last section).
- A preference. **A claim is a finding only with a concrete failure, its cause and its exact fix (D489).**

## Your report

Write it to `raptor-port/docs/superpowers/briefs/2026-10-14-three-builds-read.md` — the one file you may create. For
each finding: an id (R1, R2 …); how grave (wrong result / misleading / untidy); the file and line; **the concrete
failure** — the inputs or the presses, what the screen or the data then does, what it should do, and which ruling or
rule says so; the cause; and **the exact fix, step by step, with the code where it is short** — the builder will apply
it from your words alone. Then: every row of the sheet's §2 and §3 you could NOT find code for; what you read whole
and what you only searched; anything you ran. If you find nothing in an area, say what you checked there.
Your final message: the count by gravity, each finding in one line, and the report's path.
