# The read of the Inputs pages' rulings file — a fresh Opus reader's report (13 Oct 26, D802)

Brief: `raptor-port/docs/superpowers/briefs/2026-10-13-inputs-rulings-file-read.md`. Branch `claude/inputs-rulings-file`,
read at commit `dda4a1f54` against the base `claude/one-date-calendar-step-one-55ba13` (`343939089`, which is also the
merge base). Read-only: this report is the only file I wrote. I did not open anything else under `docs/handpass/`.

**While I read, the tree moved under me, not by my hand:** the host committed `7644c80da` (the handoff and the skill
log only — no rulings file) and left an uncommitted line in `OUTSTANDING.md` (`[TRK-FILE-TRANSFER-SPLIT]`). I ran
check 1 again at the end, on the tree as it then stood: the same result.

**In one line:** the move itself is clean — nothing lost, changed or doubled, in either tier. What needs attention is
round it: one pointer in the OIL file is now untrue, four moved rulings govern the schedule or OIL as well, the new
file's `paths:` miss eight source files of these pages, and the document check is red as the branch stands.

---

## 1. Nothing lost, nothing changed, nothing doubled — PASS

**What I ran:** my own script (in my temp folder), reading the base with `git show <base>:<path>` as raw bytes and the
branch from disk, splitting on line feeds, keying each row on `^| D<n> |`, comparing each row's bytes with
`Buffer.equals`. Both tiers.

| | short lines (`.claude/rules/decisions/`) | full rows (`.claude/decisions-full/`) |
|---|---|---|
| rows in `scheduler.md` on the base | 319 (no number twice) | 319 (no number twice) |
| now in `scheduler.md` | 215 | 215 |
| now in `inputs.md` | 104 | 104 |
| lost (in neither) | 0 | 0 |
| doubled (in both) | 0 | 0 |
| rows whose bytes differ from the base | 0 | 0 |
| rows in either file that were not on the base | 0 | 0 |
| total bytes of the rows, base → now | 72,620 → 72,620 | 473,732 → 473,732 |
| newest-first order kept in each file | yes | yes |
| carriage returns | none, before or after | none, before or after |

Also checked: the same 104 numbers in both tiers of `inputs.md`, the same 215 in both tiers of `scheduler.md`;
`inputs.md` did not exist on the base in either tier; the scheduler's short file lost no non-row line and gained seven
(the new pointer paragraph, lines 33–39); the scheduler's full-text file changed in no non-row line; every other area
file is byte-identical to the base in both tiers, but for the one row of D802 in the How we work full text, where only
the home cell changed.

## 2. Does each of the 104 belong? — 100 clearly; four govern the schedule or OIL too (judgement)

**What I read:** all 104 short lines; a keyword pass over all 104 full rows for the schedule, the board, publishing,
the changes window, the Leave War, OIL, clashes, the bell, the Logic page; then the full row, whole, of every one the
pass or the short line left in doubt (D778, D731, D728, D716, D712, D763, D767, D718, D771, D655, D681, D777, D792,
D629, D627, D638, D633, D622, D617, D639, D628).

**Four I would send back to the scheduler's file** — each says, in its rule or in a reading recorded as his, what the
schedule or the OIL credit does, which is the builder's own test:

- **D778** — "…and it is still not work: no OIL question, nothing earned." Its row goes on: the men behind ALL AVAIL on
  a Personal input's row earn nothing; "a drop joins or swaps"; its home is `engine-rules.md` (§An input filed for
  ALL AVAIL / ALL; the row's door) and two OIL tests. It is the other half of D776, which stayed.
- **D731** — the twelve small answers. Three are not about an Inputs page: (4) a shared input's OIL line, (7) an OIL
  answer for a day the input no longer covers, (5) the words shown when a request is taken off the programme; (1) is
  where the passing note sits on a phone whenever a window is open. And `oil.md` points at it — see finding 1.
- **D716** — "(2) the title shows wherever the kind's name stands as a name": its row gives "on the schedule's row"
  first among the places, and "the kind keeps deciding every rule (OIL, clashes, crew rest)". D717, the next step of
  the same thing, stayed.
- **D767** — the bold rule is the card, the List and the month's bar, but reading (3), recorded as answered "as
  recommended", is "the schedule's own line of a cancelled input under Personal Inputs wears the same red CX tag and
  struck-through name". D760, which it finishes, stayed.

**Named because they touch another area, but I would leave them moved:**

- **D712** (ALL / ALL AVAIL not offered for "Fly with" or "Personal") — it rules only what the people picker offers.
  Its family (D700, D702, D711, D713) stayed; the scheduler's paragraph names it. Leave — or send it with D778, which
  narrows it. Either is defensible.
- **D728** — as built it is the card only; its second half ("every screen prints it from the input's own dates") is a
  filed job that will change what a published day prints (D189). Leave; worth naming by itself in the scheduler's
  paragraph rather than inside the range "D718–D729".
- **D627, D631, D633, D638, D622, D617, D569** — a day's class, the holidays and the SANS day's needs all rest on the
  Leave War's record and its Required / Available rows ("two doors onto one record — the Leave War's Event row, the
  Holidays list"; "set on the Leave War's own columns"; "still needed = the Leave War's … required, less … available").
  D802's own words put the Calendar window and the SANS calendar in the new file, and no ruling about a holiday can
  avoid the war's record, so: leave. But the Leave War's file points at none of them — finding 8.
- **D628, D639** — the late cut-off; "the Logic page lists both". The brief counts the cut-off as the Inputs pages'.
  Leave; the scheduler's paragraph names both.
- **D655, D658, D763, D770** — who may file or change an input; the rule lives in the one permissions module. Leave.
- **D771, D792, D681, D364** — an input's own window, which also opens from the schedule (D748). Leave.
- **D620** — its reading notes the schedule still reads SANS availability records as before. Leave.

The rest (the cards, the calendars' layout, the notes with pucks, the people picker, the SANS day, the Calendar window,
"How this works", the export, and the 5 Oct design-job rulings D569–D585) govern only these pages.

## 3. Was anything of the Inputs pages left behind? — one weak candidate (judgement)

**What I read:** all 215 short lines still in `scheduler.md`; the full rows of D547, D700, D641, D642, D468, D189, D537.

- **D547** ("the New input pop-up is reachable by scrolling on his iPhone and needs no fix") governs only an input's
  own window. I would move it, for the same reason D364 moved. Low consequence either way — it is a "leave it".
- **D700** (his direction that an input can be filed for ALL / ALL AVAIL) rules only what is offered where the
  input's people are picked. I would leave it: it is the head of the family that D702 answers, and D702 governs the
  schedule.
- Everything else that names an input also rules the schedule's row, the changes window, a published day, OIL, the
  bell or every window in the app (D776, D769, D762, D760, D755–D759, D753, D734–D748, D717, D713, D714, D711, D710,
  D702, D682, D660–D663, D641, D642, D686, D703, D706, D468, D363, D346, D189, D174–D178, D114), or is the Leave War's
  own (D634, D636, D637, D640, D643–D645, D665, D668). Rightly kept.

Not rows, so not moved, and rightly pointed at: the scheduler file's §Settled before this list → Inputs & Admin. Its
neighbour §The late-input mark is not pointed at — finding 8.

## 4. D611's risk — a ruling in a part that was not loaded — eight source files match no pattern

**What I ran:** `ls` of `src/ui`, `src/engine`, `src/state`, `e2e`, `src/ui/scheduler`; my own script turning each of
the 28 patterns into a matcher and running it over every file under `raptor-port/`; the imports of the Inputs pages'
components, to find the files they are made of; `docs/file-map.md` for what each unmatched file is. I took the patterns
as case-sensitive, as `oil.md`'s paired `*oil*` / `*Oil*` patterns assume.

- **No pattern is wrong:** each of the 28 matches at least one file. Two are covered by a neighbour and do no harm
  (`Inputs*.tsx` inside `Input*.tsx`; `e2e/inputs*.spec.ts` inside `e2e/input*.spec.ts`).
- **Source files of these pages that match no pattern** (so opening one alone loads the scheduler's file and its
  pointer, but not the rulings themselves):
  `src/state/cutoff.ts` (the late cut-off's one door — D628, D639), `src/ui/CutFields.tsx` (its fields),
  `src/state/memberfile.ts` (the members' switch — D654, D655), `src/ui/placedline.ts` (who placed it — D629, D701,
  D720, D724), `src/ui/daysfmt.ts` (the Calendar window's words), `src/ui/sideswipe.ts` (the swipe — D786, D795),
  `src/ui/TypeLegend.tsx` (the "?" beside an input's type — D729), and `src/leavewar/engine/holidays.ts` (the Holidays
  list's writers — D638, D652; for this one NEITHER the scheduler's file nor the new one loads).
- **Their tests, missed by a letter:** `sans*.ts` does not reach `sanscal.test.tsx`, `sanscards.test.tsx`,
  `sansday.test.tsx`, `sansform.test.tsx`, `sanssettings.test.tsx`; `cal*.ts` does not reach `caldrag.test.tsx`,
  `caltouch.test.tsx`; the capitalised single names do not reach `dayswindow.test.tsx`, `holidayspanel.test.tsx`,
  `everyweekday.test.tsx`, `peoplepick.test.tsx`; the exact names in `engine/` and `state/` do not reach
  `engine/inputground|inputlines|inputtitle|inputs-readers|inputs.wire|inputown.wire|inputs-frozenmatch.wire.test.ts`,
  `engine/latecut|lateinput|latestamp.test.ts`, `engine/sans|sansavail.test.ts`, `state/plan.test.ts`,
  `state/inputcount|inputgroup|memberfile|sansfly|demosans.test.ts`, `ui/placedline.test.ts`, `ui/placedshown.test.tsx`,
  `ui/whoplaced.test.tsx`, `ui/memberinput.test.tsx`.
- **Documents:** `docs/**/*inputs*` is plural, so the plans, briefs and mock-up pages of the input card and the
  input's own title — the designs of record for D715–D729 — match nothing: `plans/2026-10-10-input-card-plan.md`,
  `plans/2026-10-09-input-own-title-plan.md`, `plans/2026-10-09-input-all-avail-plan.md`, `mock/input-card-a.html`,
  `mock/input-card-ideas.html`, `mock/input-list-as-day-card.html`, `mock/input-own-title.html`; also
  `mock/note-with-pucks.html`, `mock/card-questions.html`, `mock/cal-swipe-fit.html`.
- **Generous enough?** For the main components, yes. For the eight files and the tests above, no — the cost of adding
  them is nothing (the file is 28 KB), and D68 is the rule. The exact lines are in finding 3.
- **Judgement, not a finding:** `src/ui/MedicalView.tsx` (the third of D620's three tabs) matches nothing; the walk
  scripts of these pages (`scripts/handpass/inputs-*.mjs`, `sans-look.mjs`, `days-look.mjs`) load no rulings file at
  all, as before the move.

## 5. The pointers — every number is where it is said to be; one description is wrong, one sentence too narrow

**What I ran and read:** every D-number in the new file's "Also read", ranges expanded, against the row sets of
`scheduler.md` and `oil.md`; every D-number in the scheduler's new paragraph against `inputs.md`; each description
against the short line.

- **New file → scheduler's (and OIL's):** all 63 numbers named are where it says (by script) — 56 in `scheduler.md`:
  D755–D757, D759, D734–D745, D748, D776, D760, D661–D663, D700, D702, D711, D713, D714, D717, D660, D682, D753, D762,
  D174–D178, D796, D797, D800, D641, D686, D703, D706, D769, D710, D634, D636, D637, D640, D642–D645, D665, D668; 5 in
  `oil.md`: D780–D783, D793; 2 in the file itself: D786, D795. The descriptions fit, but for one: **D641 is filed under "every window
  on a phone"** and is not a phone rule — finding 6. The heading "§Settled before this list → Inputs & Admin" exists
  and holds what the pointer says.
- **Scheduler's paragraph → new file:** 35 of the numbers it names are in `inputs.md` (by script) and described
  rightly — D655, D658, D763, D770, D712, D778, D715, D716, D718–D725, D727–D729, D767, D768, D771, D777, D628, D639,
  D627, D631, D633, D638, D617–D622. The range "D718–D729" also takes in D726, which is in How we work (always
  loaded) — harmless. Its
  instruction "open it yourself before planning or changing anything **of an input**" is narrower than the file —
  finding 7.
- **Crossing rulings named by neither pointer and worth naming** — finding 8.

## 6. The three lists, the map, the size markers

**What I read:** the three changed sentences in place; the map row, by script, against the file; the comment and the
two rows in `docsize.mjs`; one run of `npm run docsize`.

- `doc-structure.md`, `record-decisions.md`, `AGENTS.md`: each names the file in a sentence that still reads true. I
  looked for a fourth list of area files (the hooks, the skills, `doc-budget.md`, the project guide and its full text,
  the handoff skill): there is none that names the areas one by one.
- The map row "The Inputs pages" holds exactly the 104 — none missing, none extra, none twice; the scheduler's row
  holds exactly its 215.
- The markers: 90,000 against 83,233 bytes (8% above) and 32,000 against 28,334 (13% above) — "about a tenth" is fair,
  and the reasons given are true. One figure in the comment is off — finding 9.
- **The document check itself fails as the branch stands** — finding 4.

## 7. Other files that name a moved ruling's home

**What I ran:** the brief's search, widened to every tracked text file outside `docs/handpass/`, `docs/archive/` and
the archives, for a line naming the scheduler's rulings file (either tier, or "`scheduler.md`", or "the scheduler's
rulings") within reach of a moved number; then every moved full row for "this file", "this row", "above", "below",
"scheduler.md" and the like.

- **No moved row's home cell is made untrue.** None says "this file" or "this row" in its home cell; the two hits in
  row bodies (D727 "this row is the later word", D722 "the row below") mean the ruling itself and the card's row.
- **`oil.md`'s "Also read" names D731 as in `scheduler.md`** — now untrue. Finding 1.
- **`OUTSTANDING.md` `[RULINGS-SPENT-PASS]`** still sends the spent-rulings pass to the scheduler's file for the
  calendar job's rulings, and still says D611's question is to be put back to him. Finding 5.
- **A finished job's plan** — `plans/2026-10-07-inputs-sans-redesign-plan.md` lines 8 and 866 give two shell searches
  tied to `.claude/decisions-full/scheduler.md`; they now return only the rows that stayed. Finding 10.
- **Twenty reviewer briefs of 7–10 Oct** name `.claude/rules/decisions/scheduler.md` beside moved numbers. They are
  records of runs that are over and are not to be edited; no action.
- The live reference documents (`ui-contracts.md`, `engine-rules.md`, `performance.md`, the guide and its full text)
  name the scheduler's file only for its §Settled sections, which stayed. True as they stand.

---

## Findings

1. **A pointer made untrue.** `.claude/rules/decisions/oil.md` line 36: "**Also read** — in `scheduler.md`: … **D731**
   (a shared input's OIL line counts its people where their answers differ — "credited for 2 of 3 — Ranger: no"; an
   OIL answer for a day the input no longer covers stays on the record, credited for nothing), …". D731 is now in
   `inputs.md`, which does not load with the OIL file's paths; a chat on OIL is sent to a file that no longer holds
   the line. **Correction, one of two:** send D731 back (finding 2), and this line is true again; or leave it moved,
   take "**D731** (…)" out of the `scheduler.md` list on that line and add, after that list, "In `inputs.md` (the
   Inputs pages — open it yourself): **D731** (a shared input's OIL line counts its people where their answers
   differ — "credited for 2 of 3 — Ranger: no"; an OIL answer for a day the input no longer covers stays on the
   record, credited for nothing)."

2. **Judgement — four of the 104 govern the schedule or OIL as well, and by the reading told to him they stay in the
   scheduler's file: D778, D731, D716, D767** (the grounds are under item 2). **I would rule:** send the four back by
   the same script, so the counts read 100 and 219; then put the four numbers in the new file's "Also read", take
   D716, D767 and D778 out of the scheduler's paragraph (lines 36–37), and correct "104" where it is written: that
   paragraph (line 34), the `docsize.mjs` comment, D802's home cell, the `[SCHEDULER-RULINGS-SIZE]` item, the handoff.
   **If they are left where they are instead:** the two sentences that say otherwise must stop saying it —
   `scheduler.md` line 39 ("A ruling that governs BOTH an Inputs page and the schedule stayed HERE.") and
   `inputs.md` lines 44–45 ("…stayed in `scheduler.md` — this file points at it, never the other way round") each
   gain "— but for D716, D731, D767 and D778, whose main subject is an Inputs page".

3. **The `paths:` of `.claude/rules/decisions/inputs.md` miss eight source files of these pages and most of their
   tests** (the list is under item 4). A chat that opens only `src/state/cutoff.ts` and `src/ui/CutFields.tsx` to
   change the late cut-off does not get D628, D639, D646, D691 or D704; one that opens only
   `src/leavewar/engine/holidays.ts` gets neither rulings file. **Correction — in the `paths:` block:**
   - change `raptor-port/src/ui/sans*.ts` to `raptor-port/src/ui/sans*.ts*`
   - change `raptor-port/src/ui/cal*.ts` to `raptor-port/src/ui/cal*.ts*`
   - change `raptor-port/src/engine/inputs.ts` and `raptor-port/src/engine/inputown.ts` to the one line
     `raptor-port/src/engine/input*.ts`
   - change `raptor-port/src/state/plan.ts` to `raptor-port/src/state/plan*.ts`
   - change `raptor-port/src/state/inputstamp.ts` and `raptor-port/src/state/inputgate-hook.ts` to the one line
     `raptor-port/src/state/input*.ts`
   - change `raptor-port/docs/**/*inputs*` to `raptor-port/docs/**/*input*`
   - add `raptor-port/src/state/cutoff.ts`, `raptor-port/src/state/memberfile*.ts`,
     `raptor-port/src/state/sansfly.test.ts`, `raptor-port/src/state/demosans.test.ts`
   - add `raptor-port/src/ui/CutFields.tsx`, `raptor-port/src/ui/placed*.ts*`, `raptor-port/src/ui/whoplaced.test.tsx`,
     `raptor-port/src/ui/daysfmt.ts`, `raptor-port/src/ui/dayswindow.test.tsx`, `raptor-port/src/ui/sideswipe.ts`,
     `raptor-port/src/ui/TypeLegend.tsx`, `raptor-port/src/ui/holidayspanel.test.tsx`,
     `raptor-port/src/ui/everyweekday.test.tsx`, `raptor-port/src/ui/peoplepick.test.tsx`,
     `raptor-port/src/ui/memberinput.test.tsx`
   - add `raptor-port/src/engine/late*.test.ts`, `raptor-port/src/engine/sans*.test.ts`
   - add `raptor-port/src/leavewar/engine/holidays.ts`, `raptor-port/src/leavewar/holidays.test.ts`
   - add `raptor-port/docs/mock/note-with-pucks.html`, `raptor-port/docs/mock/card-questions.html`,
     `raptor-port/docs/mock/cal-swipe-fit.html`
   I ran each widened pattern over the folders: every exact name exists, and no widened pattern takes in a source
   file of another area. `docs/**/*input*` also reaches the shared-row job's documents (`group-input-one-row`), which
   are the scheduler's — the generous side, and harmless.

4. **The document check is red as the branch stands, and a second failure is waiting behind it.**
   (a) `npm run docsize`, run once: "FAIL — 1 problem: homes: D802 is new and names `OUTSTANDING-ARCHIVE.md` as a
   home, but this change does not touch that file". Cause: D802's home cell was written ahead of the archive step.
   **Correction:** archive `[SCHEDULER-RULINGS-SIZE]` by the script, as the handoff already plans, so the archive
   names D802 — and take its line out of the priority list with it (`OUTSTANDING.md` line 79 still reads "A question
   for him, due by his own ruling (D611)").
   (b) `DECISIONS.md` is now 91 lines against its marker of 90 (it stood at exactly 90 on the base; the new map row is
   the 91st). The run printed it as "OVER by 1 — code change … deferred" only because the branch still carries step
   one's code against `main`. The first time this change is judged as documents only — its pull request against
   `main` once step one has merged — the check fails on it. **Correction:** in `raptor-port/scripts/docsize.mjs`, the
   row `['DECISIONS.md', 1, 90]` becomes `['DECISIONS.md', 1, 92]` with its reason beside it (a new area's map row,
   D802 — a line that belongs there, D141). Not this change's doing but it will fail in the same run: the general
   rulings file stands 480 bytes over its marker, carried in from step one's branch (`[HWW-RULINGS-SIZE]`).

5. **A backlog item left behind by the ruling (D201).** `OUTSTANDING.md` line 1713, `[RULINGS-SPENT-PASS]`: part (a)
   tells the pass to read "those files' rows" — the scheduler's, How we work's and the Leave War's — for the calendar
   job's spent rulings (D617–D733); most of those rows, and most of the spent ones among them (D575, D578–D580,
   D583–D585, D657, D690, D730), are now in the Inputs pages' file, which the item does not name. Part (b) still says
   D611's trigger is reached, the question is to be put back to him, "never split it without his word".
   **Correction:** in (a), after "read those files' rows", add "— and the Inputs pages' file, `.claude/rules/decisions/inputs.md`,
   which took 104 of the scheduler's on 13 Oct 26 (D802)"; replace (b) with "(b) ANSWERED 13 Oct 26 by D802: the
   Inputs pages' rulings have a file of their own; nothing further to put to him."

6. **A description in the new file's "Also read" is wrong.** `.claude/rules/decisions/inputs.md` line 55: "every
   window on a phone — **D641, D686, D703, D706**". D641 says every pop-up window drawn for these calendars can be
   dragged and the page behind it still works — on any screen; it is the exception to "a pop-up closes on a click
   outside". **Correction:** "the windows of these pages can be dragged and leave the page behind them working —
   **D641**; every window on a phone — **D686, D703, D706**".

7. **The scheduler's pointer is narrower than the file it points at.** `.claude/rules/decisions/scheduler.md` line 35:
   "**open it yourself before planning or changing anything of an input**". The file also holds the SANS calendar, the
   Calendar window and the late cut-off, none of which is "an input". **Correction:** "…before planning or changing
   anything of an input, the Inputs or the SANS calendar, the Calendar window or the late cut-off". And on line 37,
   "**D718–D729**" becomes "**D718–D725, D727–D729**" (D726 is a general ruling, in How we work).

8. **Judgement — crossing rulings no pointer names, worth a clause each.**
   - In the new file's "Also read", for `scheduler.md`: §Settled before this list → The late-input mark (the mark is
     not a warning, measures the input's last change, downchits are exempt, the Inputs page keeps printing it — the new
     file holds the cut-off's rulings, the mark's own rules stayed); **D468** (a request moved to another day);
     **D189** (a leave stretched or trimmed, on a published day it still covers).
   - In the new file's "Also read", for `oil.md`: **D18, D46, D470** (who earns from a request's row).
   - In `.claude/rules/decisions/leave-war.md`'s "Also read" (line 48), which names nothing in the new file: "In
     `inputs.md`: **D627, D631, D638** (a day's class; a public holiday and an Off day have two doors onto one record —
     the war's Event row and the Holidays list; No Leave is set on the war only), **D617, D622** (the SANS calendar
     reads the war's Required and Available rows, a figure for each seat)."

9. **A figure in the size marker's comment.** `raptor-port/scripts/docsize.mjs`, the comment above
   `['.claude/rules/decisions/scheduler.md', 2, 90000]`: "The scheduler's file holds 82,7xx bytes after it". It holds
   83,233 with its pointer paragraph. **Correction:** "83,2xx". (The new file's "28,3xx" is right: 28,334.)

10. **Low — two documents that name the old place, neither a rule a chat follows today.**
    `raptor-port/docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` lines 8 and 866: the two searches
    `grep -h '^| D6[1-4][0-9] |' .claude/decisions-full/scheduler.md` and `grep -h '^| D65[4-7] |'
    .claude/decisions-full/scheduler.md` now miss the moved rows; **correction**, if the plan is touched at all: the
    file name becomes `.claude/decisions-full/*.md`. `raptor-port/docs/file-map.md` line 586: "`people-accounts.md` is
    the newest area" — already out of date since the IT flow guide's file; **correction:** "`inputs.md` is the newest
    area (the Inputs pages — D802, 13 Oct 26)".

**Judgement calls on single rulings, for the record:** D547 — I would move it to the new file (item 3). D712 and D700
— I would leave each where it is (items 2 and 3).

**Not checked:** how Claude Code itself matches a `paths:` pattern (case, and `**`) — I read the patterns as the other
area files' authors plainly do; whether any chat has yet loaded the new file by itself in practice.
