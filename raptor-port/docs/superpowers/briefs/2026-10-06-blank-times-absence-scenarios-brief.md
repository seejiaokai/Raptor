# Scenario-design brief — `[BLANK-TIMES-ABSENCE]` (D605) with `[SC-PICKER-INTIME-REST]` — the FULL check — 6 Oct 26

You are designing TEST SCENARIOS for a walk of the running app, and hunting for what is MISSING. You are not reviewing
code for style and you are not asked whether the code is "clean". Work READ-ONLY: change nothing, build nothing, run no
test and start no server. Report as your final message, in the format at the foot.

**The state of the code you read.** Branch `claude/blank-times-absence-picker-2cebae`, cut from `main` at the merge of
PR #482. THE TWO FIXES ARE IN THE WORKING TREE, NOT YET COMMITTED (`git diff` shows them; Opus 5.5 wrote them). Design
your scenarios from what was PROMISED below and from the rulings — not from what the builder happened to write. Where
the working tree already disagrees with the promise, say so as a finding with its exact fix.

**Read first, from the live files:**
- the two jobs as filed: `OUTSTANDING.md` `[BLANK-TIMES-ABSENCE]` and `[SC-PICKER-INTIME-REST]`; the walk that found
  the first (`raptor-port/docs/handpass/2026-10-06-rest-blank-line.md`, the row "A man on all-day leave or a downchit");
  Sol's finding that is the second (`raptor-port/docs/superpowers/briefs/2026-10-06-rest-blank-line-read-sol.md`, F1);
- the owner's rulings — one line each in `.claude/rules/decisions/scheduler.md`, `oil.md`, `people-accounts.md`,
  `how-we-work.md`; each ruling's full row by `grep -h '^| D605 |' .claude/decisions-full/*.md`. The ones that govern
  this: **D605** (read its full row — his words and the five readings he was told), **D177, D178, D179** (a leave or
  downchit warning on a published day FREEZES and a change reads pending), **D185, D188** (what stays live on a
  published face — these warnings are NOT among them), **D103** (anything pending wipes the sign-offs), **D187** (the
  👁 look at a published version shows its warnings), **D469, D472** (a hidden warning), **D477, D478** (Insights counts
  the page's copy), **D271, D276, D279** (a struck name; one man once per row), **D33, D47** (placeholder pucks),
  **D360, D361** (a row with a start and no end), **D56** (below);
- the settled rules: `.claude/rules/decisions/scheduler.md` §Settled before this list ("A new flying line comes up
  blank"; "On SC, the B box is an IN-TIME"; "Duties are decoupled from waves"); `raptor-port/docs/engine-rules.md`
  §Crew rest (the last two bullets) and its sections on inputs, AVALON / BB and the SC spare;
  `raptor-port/src/engine/inputs.ts` `INPUT_META` (every input type and its flags);
- the method: `raptor-port/docs/bug-check-order.md` §2, §2b, §6, §7; and `raptor-port/CLAUDE.md` "The rules-engine
  robustness doctrine" (full text: `raptor-port/docs/guide-full.md` §The rules-engine robustness doctrine) — the owner's
  FIVE gotcha families must each be walked: people not following the format · missing input · user errors · deletions
  and edits from another page · sync between copies;
- `.claude/rules/raptor-executor.md` (the builder's rules — you never approve, and the reviewer is never bypassed).

## The two promises

**1. `[BLANK-TIMES-ABSENCE]` — D605, his words "4 yes as recommended".** A man who is on leave or grounded for the
WHOLE day is flagged the moment he is seated ANYWHERE that day — on a line or row with no times yet too. A part-day
absence against a seat with no times stays silent (nothing to compare). "Anywhere" is every kind of seat the absence
would already be flagged on if the seat had times: a flying line ("+ Line" and "+ Wave" mint one with no take-off), a
duty desk, a sim seat, a ground or Common Programme row, an SC MAIN and an SC SPARE whose shift times were cleared, an
AVALON / BB seat and its desk (BB is minted with NO shift times) — each kind's existing exemptions unchanged (a local
leave may stand a standby SPARE or an AVALON / BB place; ATT B may work a desk, a sim or a ground row; an info-only ⓘ
row and a cancelled row are never checked; a placeholder puck is nobody). Nothing about a published day changes: these
warnings stay frozen there and a change reads pending.

**The fault it closes:** file an all-day LL / OL / a downchit for a man on Tuesday; "+ Wave" (its line comes up blank);
put him in its seat. The crew list strikes his name and the toast says why — but the day's warning list says nothing
and his puck is plain, until a take-off is typed. Cause: every absence check asks whether the absence OVERLAPS the
seat's hours, and a comparison with a time that is not there is false; a row with no start is never collected at all.

**The builder's readings, to be told to the owner — attack them:** (a) "the whole day" = the All day tick, a record
with neither the tick nor both times (it already fails closed to the whole day), or hours typed 00:00–23:59; never a
neighbouring day's absence. (b) It applies to EVERY input type the timed check flags, not only leave and medical: a
whole-day course, overseas duty, or an all-day Meeting gets on a seat with no times exactly the warning it gets once a
time is typed (the answer never depended on the missing time). (c) An all-day request already put on the Ground
Programme makes a row with NO times by construction and keeps its own voice — its own man must not be flagged against
his own request's row. (d) Where the seat has no name yet either, the sentence says "this line" / "this row" instead of
printing a hole. (e) The crew list is NOT changed: before the drop it still reads a seat with no hours as unknown and
strikes a man for ANY absence that day — so a part-day absence, and a local leave on a standby place with blank shift
times, are struck before and silent after (the second is filed as a low item, not fixed).

**2. `[SC-PICKER-INTIME-REST]`.** Before a man is put on an SC MAIN seat, the crew list (the armed list and the drag
bubble) says "crew rest — not clear until HH:MM" when the shift's typed in-time (its B box) — or, as before, its shift
start — is inside his 12 hours, in agreement with the warning placing him raises; forward too (a shift ending late
against his early report tomorrow). An SC SPARE carries no crew rest and must borrow nothing from the MAIN seated in
the same formation. An empty SC formation still answers nothing before the drop (`[REST-FIRST-CREW-HINT]`, filed).

## What I want from you

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

Specifically:

1. **Every kind of seat a man can be put on with no times, through the app's own controls** — and for each the control
   that mints it blank or lets its times be cleared (a button, a template, a paste, a cleared box, a saved plan, an
   older version loaded, Undo / Redo, a day template, a request accepted onto the programme, a request moved to
   Unavailable). Is any kind missing from the promise's list? Name the rows of `raptor-port/src/engine/events.ts`
   `buildDay` each comes through.
2. **Every reader of an absence warning** (`LEAVE_FLY`, `DNIF_FLY`, `INPUT_FLY`, the amber `SHIFT_SOFT`): each warning
   list (Edit Schedule, the Scheduler Board, View-only Sched, the 👁 look at a version, the day-details window), each
   puck drawer and its ring / C chip (cockpit, SC, the exempt-line and exempt-desk pucks that ring only for their OWN
   rule — `ui/html.ts` `exemptLineOwn` / `exemptDeskOwn` — duty, sim, ground, Common Programme, the SANS card, Personal
   Inputs / Unavailable rows, the crew list's own copy), the drop toast, the ALL AVAIL window, Insights' issue counts,
   the Logic page, a hidden warning, the published face, exports / print. For each: does the new warning reach it, and
   how would a walker SEE it there?
3. **Every input type × every kind of seat**: where must a whole-day input of that type flag, and where must it stay
   silent — and is the answer the same with and without times? Call out any pair where the two SHOULD differ.
4. **The edges of "the whole day"**: an absence spanning several days (first, middle, last day); AM / PM halves; custom
   hours 00:00–23:59, 00:00–24:00, 00:01–23:59; an absence typed across midnight; a record trimmed by an upchit; an
   absence filed, edited, shortened or deleted from the Inputs page, the Leave War (an approved bid) or the Medical view
   while the man already sits on a seat with no times; a removed ("taken off") request; a request accepted onto the
   programme (reading (c)); SANS Availability; an Upchit.
5. **The published day (D177–D179, D103):** every order of {seat the man on a blank seat, file / lift the absence,
   publish, amend}, on what the ISSUED face shows, what the working copy shows, the pending count, the sign-offs, the
   👁 look at each version — with Undo, Redo and a reload after each. A warning that appears on an issued face without
   an amendment, or a published day that reads pending with nothing changed, is a finding.
6. **`[SC-PICKER-INTIME-REST]`:** every door that asks before a drop (the armed crew list, a drag from the crew list, a
   seat-to-seat drag and its bubble, the phone's crew drawer), for an SC MAIN seat with a sibling seated / an empty
   formation / a SPARE seat / the seat he already holds / a move within the same shift; the in-time earlier than,
   equal to and later than his clearance; the in-time typed on the previous evening's side of midnight; AVALON / BB
   (must stay silent). Does anything ELSE now get an answer it must not (the question used to answer nothing for any
   SC seat)?
7. **Orders** — both orders of every pair of this change's own actions, on a day not yet published and on a published
   one, with Undo, Redo and a reload after each.
8. **The five gotcha families**, each with at least two concrete scenarios for THIS change.

One owed read rides with this run (D138): the short line of **D605** in `.claude/rules/decisions/scheduler.md` against
its full row in `.claude/decisions-full/scheduler.md` — does the short line change what the full row means? (The
builder has reworded the short line's tail from "NOT YET BUILT" and added readings (6) and (7) to the full row; say
whether either misstates his ruling.)

## Report format

1. **Roll-call** — two tables: (i) every kind of seat with no times · how it is minted · is it in the promise · what
   the walker should see; (ii) every reader · does the new warning reach it · what the walker should see.
2. **Scenarios, ranked** — each: id · setup through the app's own controls (the demo week is Mon 13 – Sun 19 Jul 26;
   admin sign-in `ad`; the demo week's own whole-day absences are in `raptor-port/src/engine/inputs.ts`, e.g. Cobra's
   OL on Wed 15 Jul) · action · expected · the observation that would disprove it · which gotcha family.
3. **The builder's readings (a)–(e)** — for each: sound / wrong, with the scenario that shows it and, if wrong, the
   exact step-by-step fix.
4. **Findings in the working tree**, if any — each with file, lines, the failing scenario and the exact fix.
5. **The owed read of D605.**
6. **Explicit negatives** — what you checked and found nothing in.
