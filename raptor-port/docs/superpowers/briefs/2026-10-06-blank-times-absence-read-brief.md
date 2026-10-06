# The final code read — a whole-day absence on a seat with no times (`[BLANK-TIMES-ABSENCE]`, D605) and the crew list's crew-rest question for an SC seat (`[SC-PICKER-INTIME-REST]`) — 6 Oct 26

You are one of TWO independent readers of a finished change (bug-check order §4 rank 2, §4a; D590, D601 — Astra reviews
what Opus wrote and Sol 6.1 reads second, each blind to the other). You did not write it. Work READ-ONLY: change
nothing, build nothing, start no server; you may run a single test file to settle a doubt
(`cd raptor-port && npx vitest run src/engine/blankabsence.test.ts`) and nothing heavier — the gates are the host's,
under the PC's one lock. Never read the other reader's report (`…-read-astra.md` / `…-read-sol.md`); never approve —
your report is evidence, the owner approves.

**The change:** branch `claude/blank-times-absence-picker-2cebae` against `main` —
`git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e raptor-port/playwright.config.ts raptor-port/docs/engine-rules.md`
(plus anything uncommitted: `git status`). App code in three files: `raptor-port/src/engine/events.ts` (`inpShow` — the
Upchit turned away, the `undeferred` ask; `wholeDay`; `buildDay`'s `blank` and `whole` lists and the four places a seat
with no hours is collected), `raptor-port/src/engine/validate.ts` (the three absence loops and the new look for
`day.blank`; `named`; `restIfPlaced`'s shift sibling and its exempt-seat guard) and `raptor-port/src/ui/logic-html.ts`
(one new row). Tests: `raptor-port/src/engine/blankabsence.test.ts`, `scpickerrest.test.ts`, the two new cases at the
foot of `raptor-port/src/ui/latepub.test.tsx`, `raptor-port/e2e/blankabsence.spec.ts`, and the three older tests whose
pins changed (`audit-c-times.test.ts`, `avalon-rules.test.ts`, `overnight.test.ts`) — judge whether each changed pin
traces to D605 and keeps its other half.

**Read first, from the live files:**
- the evidence sheet, WITH ITS TWO ROLL-CALLS — you are asked for absences against them:
  `raptor-port/docs/handpass/2026-10-06-blank-times-absence.md` (the fault on screen before and after, the walkers'
  table, the break tests, the scenario designer's four finds and what was done with each, what was NOT walked, what was
  filed and why);
- the scenario designer's report: `raptor-port/docs/superpowers/briefs/2026-10-06-blank-times-absence-scenarios-astra.md`
  (its oracle table is the answer sheet the tests encode);
- the two jobs as filed: `OUTSTANDING.md` `[BLANK-TIMES-ABSENCE]`, `[SC-PICKER-INTIME-REST]`;
- the owner's rulings — one line each in `.claude/rules/decisions/scheduler.md`, `oil.md`, `how-we-work.md`, each
  ruling's full row by `grep -h '^| D605 |' .claude/decisions-full/*.md`: **D605** (his words and the seven readings —
  (6) and (7) are the builder's, made in the build); **D177, D178, D179, D103** (a leave or downchit warning FREEZES on
  a published day; a change reads pending and takes the sign-offs down); **D185, D188** (what stays live on a published
  face — not these); **D469, D472**; **D477, D478**; **D271, D276**; **D33, D47**; **D360, D361**; **D56**; and
  `.claude/rules/decisions/scheduler.md` §Settled before this list ("A new flying line comes up blank"; "On SC, the B
  box is an IN-TIME"; "Duties are decoupled from waves");
- `raptor-port/docs/engine-rules.md` §Crew rest (the two new bullets state both rules as built), `raptor-port/CLAUDE.md`
  §Architecture rules and §Coding conventions (`src/engine/` bodies are verbatim ports: a diff there is the behaviour
  change and nothing else), "The rules-engine robustness doctrine" (full text: `raptor-port/docs/guide-full.md`);
- `.claude/rules/raptor-executor.md`.

## What the build claims — attack each

1. **With every seat timed, nothing moved.** For a seat with a usable window every absence check reads `day.input` and
   overlaps exactly as on `main` (the reference parity — `node reference/tfin.js` 728/0 and `engine/parity.test.ts` —
   holds). ONE deliberate exception: an Upchit no longer reaches `day.input` at all (it used to raise "Upchit clashes
   with …" / "Upchit but tasked — …" on a timed seat). Is there any OTHER input, seat or state where a timed seat's
   warnings, their words, their keys or their order now differ from `main`? Think of: the `named` fallback on a timed
   line or row with no name; `inpShow`'s new early return against the official (published) run, the cross-week seed
   read (`xweek`) and the midnight tails; anything else that read an Upchit through `day.input` (the brief / debrief
   windows' `timedInput`, the SC in-time cut, crew rest's `fi`, the long day, the picker's `cand`).
2. **A seat with no usable window is judged against `day.whole` and nothing else** — a flying line (`e.step` /
   `e.dekit` not finite: no take-off, a landing alone, garbage in the box), an SC MAIN and an SC SPARE with cleared
   shift times, and every member of `day.blank`. Is any kind of seat that can hold a person missing from `buildDay`'s
   four collection sites? Is any collected twice, or collected when it should not be (cancelled, info-only, a
   placeholder, a free-text sim "who")? Can a seat be BOTH an event and in `blank`?
3. **`day.whole` is right**: this day's inputs only; whole-day = the All day tick, a record with no usable hours
   (`inpWin`'s fail-closed `[0,1439]`), 00:00–23:59 or to 24:00; the same dormancy and frozen-filing gate as
   `day.input`; asked UNDEFERRED so a whole-day request already on the programme still counts — and never against its
   OWN row (`src` against the input's id). Attack the undeferred ask: can it double-speak (the row AND the input) on any
   seat with hours? On the published (official) run? For a multi-day request whose row lands on one day? For a request
   whose row was deleted, re-landed, moved to another day (D468), taken off, or filed to Unavailable?
4. **Each kind keeps its exemptions and words** — the oracle table. The `av` branch of the new look must be the
   `day.sacrew` look minus the overlap; the other branch the duty / sim / ground loop minus the overlap. Is any gate
   present in a timed loop and missing from its time-less twin (or the reverse)? Any sentence that can print "NaN",
   "undefined", a hole, or a clock that is not there?
5. **Nothing else reads a seat with no hours as occupying time.** `blank` never enters `day.events` / `EVD` /
   `day.sacrew`: the clash loop, the crew list's busy scan, crew rest, the long day, Insights' hours, OIL and the
   7-day run are as on `main`. Check it.
6. **A published day**: these warnings freeze (an issued version keeps `snap.w`); seating a man or filing an absence
   afterwards is a pending change that takes the sign-offs down; nothing appears on an issued face without an amendment
   and no published day reads pending with nothing changed GOING FORWARD (stored demo data is out of scope — D56).
7. **`restIfPlaced`**: a `shift` sibling counts exactly as a `fly` one; the exempt-seat guard returns null for an SC
   SPARE and anything on AVALON / BB; an empty formation still answers null. Does anything else now get an answer it
   must not — a seat-to-seat drag within one shift, the seat he holds, a SPARE asked through a door that does not check
   `saExempt` first (`drag.ts`, `dropflag.ts`)? Is the forward answer for a shift (no debrief pad) the one the placed
   warning gives?
8. **The tests prove what they say.** Is any assertion satisfied for the wrong reason? Does the oracle test's table
   match `INPUT_META` and the timed loops for EVERY cell? Is there a scenario in the designer's list that no test and
   no walk row covers?

Then, as the method requires:

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

**Already found and FILED, not fixed here — do not report them again unless the build made one worse** (each is in
`OUTSTANDING.md`): `[BLANK-STANDBY-STRIKE]` (the crew list strikes a man on LOCAL leave for a standby seat whose shift
times are blank — the crew list is deliberately unchanged), `[SC-SPARE-RING-BORROWS]` (one man in a MAIN and a SPARE
seat of one SC formation: the spare puck wears the MAIN's leave ring), `[REQ-ROW-SELF-CLASH]` (times typed on an
all-day request's own row flag its own man — the TIMED loop, old), `[SC-INTIME-REST-WORDS]` (the crew-rest sentence
calls an SC line's in-time its "start"), `[SC-BLANK-SHIFT-QUAL]` (an SC line with cleared shift times prints
"(NaN:NaN–NaN:NaN)" in its CURRENCY warning), `[BLANK-LINE-SANS-WORDS]` (the SANS offer on a line with no times; a blank
name in the OTHER sentences), `[REST-FIRST-CREW-HINT]` (an empty formation gives no crew-rest hint before the drop),
`[CREW-REST-MARK-COPIES]`.

**A claim is a finding only with a concrete failure, its cause and its fix (D489).** For each finding give: the exact
steps or inputs, what happens, what should, the lines, whether it is the same on `main` (compare before calling
anything new), and **exact, step-by-step fix instructions** — not a direction. Give **explicit negatives** ("I checked X
and found nothing"). Say what you did not read and how sure you are.

## Two small meaning reads (D138)

1. `.claude/rules/decisions/scheduler.md`, the short line of **D605** (its "NOT YET BUILT" tail removed), against its
   full row (`grep -h '^| D605 |' .claude/decisions-full/*.md`) — does the short line state the rule its full row
   states? And do the full row's readings (6) and (7), added in this build, misstate his ruling or claim anything not
   true of the code?
2. `raptor-port/docs/gates-and-deploy.md`, the new bullet "VERCEL CAN MISS A MERGE" (documents only): is anything in it
   unsafe to follow, or in conflict with `.claude/rules/shipping.md`?

## Report format

1. Verdict in one line: PASS / CHANGES REQUIRED. 2. Findings, most serious first, each in the form above. 3. Absences
against the two roll-calls. 4. The eight claims, each: holds / does not, with the line. 5. The two meaning reads.
6. Explicit negatives; what you did not read.
