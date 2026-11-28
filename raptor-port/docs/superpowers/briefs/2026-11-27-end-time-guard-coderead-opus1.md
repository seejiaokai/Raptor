# Code read — END-TIME-GUARD (branch claude/end-time-guard-202), fresh blind Opus reader

Scope read: the whole diff against origin/main (rule `engine/timegaps.ts`, refusal `state/timeguard.ts`, the two publish
guards in `state/sched-commit.ts`, the sign guards in `ui/oilsign.ts`, `ui/Shell.tsx`, `ui/interactions.ts`, the screens
in `ui/html.ts`, `ui/timegap-paint.ts`, `ui/highlights.ts`, `ui/pops.ts`, the CSS, the demo remake in `engine/data.ts`,
`engine/week2.ts`, `testing/refwin.ts`, and the rewritten tests), checked against D2852, D2612, D2613, D2734, D2853,
D2854, D2855, D2790, D2611 and the plan's §R1–§R6. Ran `npx vitest run src/engine/timegaps.test.ts`: 45 passed, 5 todo.

## Routes checked and found sound (no finding)

- **Publish day / Publish AL:** the only callers of the two publish commands are the day head's buttons
  (`interactions.ts` `data-beak` / `data-alpub`, week and board share `dayStatHTML`) and the Amendments panel
  (`ALPanel.tsx`); both go through `commitSetDayApproved` / `commitPublishALDay`, which refuse before the command is built.
  The guard conditions mirror the engine exactly (`setDayApproved`: protected week first, no-op on a published day;
  `publishALDay`: protected, "still a draft", `dayHasChanges || correcting`), so the quarantine and the engine's own
  words still come first, and the time note comes before the signature check (D2855 E1). No other writer of `dayOK` /
  `alIssue` exists outside `engine/publish.ts`.
- **Sign-off:** the only writer is `writeSign`; `signPick` refuses before the OIL ask (D2855 E2), `writeSign` is the
  backstop for the OIL list's Save and Later, and `writeHeld` reads the record afterwards so a refused name does not
  mark the day asked. The select is disabled and out of the tab order while a time is missing; click (`routeClick`) and
  Enter/Space (`routeOpenKey`, which already filters to those two keys, so Tab is not trapped) on the label refuse.
- **A signed day that later gains a gap:** every way a gap can arise changes the day's content, and the signature
  binding (`currentBind`: the day's digest, filing key, pending comparison) blanks the shown names, so the day reads
  unsigned again; Redo of an old sign replays a binding that no longer matches, so it does not count. The command-level
  refusal holds anyway.
- **Rule vs rulings:** "someone" reads trimmed non-empty entries; role-only desks are nobody; ALL / ALL AVAIL / an
  off-roster callsign count; cancelled and information-only items, All-day-input rows and the AMT block's BRIEF /
  DEBRIEF with nobody on them are left out; TBD (any case) is empty; a start with no end counts with nobody on it. R1,
  R2, R7, R8 and Q16 keep today's behaviour (never refused), each pinned by a todo.
- **View-only Sched:** the week there is drawn with `ed` false, so no box carries `data-txt`; the paint only looks in
  `#eWeek` and `#schedBoard`, skips disabled / read-only inputs and anything inside `.preview` / `.pv-frozen`.
- **Layers:** `state/timeguard.ts` and `state/sched-commit.ts` import only `engine/`; the screens hear of a refusal
  through a hook set by `ui/timegap-paint.ts`. The engine bodies are untouched.
- **Demo data:** only `end` fields changed (seven rows in week 1, one in week 2), each to the start plus the one hour
  the engine already assumed (`openEnd` 60), so warnings, conflicts and Insights hours read the same windows as before
  (the warning-words test that names 17:55–18:55 is unchanged and green); all are weekdays, so no OIL moves.
  `refwin.ts` copies the same ends to the original app's copy. Nothing else in the seed moved.

## Findings

### F1 — A "kept" row from an All-day input is refused: a builder's reading, against the ruling's own words (medium)

- **Failure.** A member files an All day Training for Tuesday; it lands on Tuesday's Ground Programme with his puck and
  empty times. Tuesday is published. He then moves the Training to Thursday (or it is now filed under Unavailable). The
  scheduler uses "Load this version onto the working copy" on Tuesday (or switches to a saved plan that holds the row):
  the incoming row's input no longer stands on that day, so `markKept` (`engine/drafts.ts` 156–162) keeps the row and
  marks it `kept`. Under this build that row now counts as two missing times: both boxes outlined, "1 item missing a
  time · 4 to sign", every sign-off box and Publish refused, until he types made-up hours onto a row that stands for an
  All-day input. Before the build nothing stopped this day.
- **Cause.** `engine/timegaps.ts` line 46: `fromAllDayInput` returns false for any `r.kept` row before it reads the
  input, so a kept row is treated as the scheduler's own typed row even while its input record still has All day
  ticked. D2852 leaves out "a row from an input with All day ticked"; D2790 keeps all day for "an input a member files
  with All day ticked". Treating a kept row as a typed row is not in either ruling, nor in §R5, so by D2611 it should keep
  today's behaviour (never refused) and go to him as a question. The test at `timegaps.test.ts` 138–141 pins the reading
  (input `allday: true`, row `kept: true`, expects 1).
- **Fix.** Read the input first and fall back on the row only when the input is gone:
  `const fromAllDayInput = (r) => { if (!r || !r.src) return false; const inp = inputOnAny(r.src); return inp ? !!inp.allday : !!r.kept }`
  (a kept row whose input is gone keeps today's "never refused"), and add a §R5 question: "a row an input left behind
  after a version load or plan switch — counted or left out?"
- **Failing test.** In `timegaps.test.ts`, replace the kept case with: `INPUTS.push({ iid: 'tg-3', person: 'dj', date:
  'Jul 13', allday: true, type: 'Training' })`; `expect(G(ground({ who: 'dj', str: '', end: '', src: 'tg-3', kept: true
  })).items).toBe(0)` — fails today (1). Add `it.todo('a kept row — waits on his answer')`.

### F2 — The red outline is remembered by row POSITION, so deleting a row above moves or drops it (low)

- **Failure.** Tuesday's Ground Programme: row 0 complete, rows 1, 2 and 3 each with a man and no end. He presses CUR CK:
  refused, the three END boxes turn red (stored as `gr:1.1.end`, `gr:1.2.end`, `gr:1.3.end`). He deletes row 0, which
  he did not need. The three gapped rows are now rows 0, 1 and 2: `gr:1.3.end` is no longer missing, so it is pruned as
  if typed, and `gr:1.0.end` was never stored — the first gapped row turns grey although its time was never typed. The
  reverse also happens: a row added or restored by Undo
  of a delete (`slots.ts` 592 splices a row back in) shifts the rows below, and a box that was never refused can show
  red. The same holds for flying lines (`formations.splice`) and duty desks. D2853 says red stays "until the time is
  typed".
- **Cause.** `ui/timegap-paint.ts` `markRefused` stores the box keys from `timeGapsOf().boxes` (`gr:<di>.<ri>.end`), and
  `paintTimeGaps` prunes any stored key no longer missing. The app's other positional maps are shifted on a delete
  (`board.ts` 1258 `shiftKeys(...)`); `TIME_RED` is not.
- **Fix.** Store each red box by its row's id plus the field (`rid` exists on every row after `ensureRowIds`; e.g.
  `${row.rid}:end`), and have `dayTimeGaps` return the id-based name beside the positional key the screens look up; or
  shift `TIME_RED` with the existing `shiftKeys` calls. The id route needs no new call sites.
- **Failing test.** In `timeguard-screens.test.tsx`: empty END on ground rows 1, 2 and 3 of Thursday, press a sign-off
  box (all three red), delete ground row 0 through the board's delete control, then expect all three remaining END
  boxes (`gr:3.0.end`, `gr:3.1.end`, `gr:3.2.end`) to carry `tg-red`. Fails today (one turns grey).

No other real defect found. Undo/Redo of a publish (Q15), the Amendments panel's Publish AL (R6), and the red/grey
choices of R3/R4/R5 are built as the plan says and are his questions, not findings.

## Notes (not findings)

- **Cost on the repaint path, small but avoidable.** `timeGapsOf` walks the day up to four times per paint per day:
  `dayStatHTML` (computed even on published days and the view page, where `lockAt` is unused — move it inside the
  `!sgOK` branch), `signoffHTML`, and `paintTimeGaps` once for the week's pass and once again for the board's. Each
  ground row with an input calls `inputOnAny` → `INPUTS.find` (linear). `paintTimeGaps` also runs on View-only's
  refresh, where `#eWeek` has nothing to mark. A `passMemo`-style memo per day per pass, as `currentBind` uses, would
  make it one walk.
- `#sbSignBar .so-state.tg-has{white-space:normal}` lets the board's line wrap; D2734's point is that it stays one line
  on a phone — the walk's 402-wide measurement (S63) should confirm "12 items missing a time · 4 to sign" stays on one.
- The demo's start-and-no-end rows are gone, so nothing in the demo now shows the drafting-only assumed-hour paths
  (the ALL AVAIL window's "an hour assumed", the Logic page lines) — the walk will need to make one by hand.

## Tidiness note (filed, not fixed)

- The sign-box refusal block is written twice, almost word for word, in `routeClick` and `routeOpenKey`; one helper.
- `resetTimeRed` in `timegap-paint.ts` duplicates the `TIME_RED` entry of `POPS_RESET`; and `TIME_RED` lives in
  `pops.ts` while only `timegap-paint.ts` reads or writes it.
- `TIME_REFUSED.message` ('a time is missing') is read by no caller.
- `has` / `anyIn` in `timegaps.ts` treat an array as a string (`String(['',''])` is ","): harmless for today's
  string fields, but a trap if a ground `who` ever becomes a list, as the Common Programme's already can.

## Verdict

Sound build: every publish and sign-off route is guarded at the command; two fixes before merge — F1 (a kept All-day row
refused on a reading, to be put to him) and F2 (red remembered by row position).
