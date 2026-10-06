# Scenario-design brief — `[OIL-WORK-START]` (D591, D592) — the FULL check — 6 Oct 26

You are designing TEST SCENARIOS for a walk of the running app, and hunting for what is MISSING. You are not reviewing
code for style and you are not asked whether the code is "clean". Work READ-ONLY: change nothing, build nothing, run no
test and start no server. Report as your final message, in the format at the foot.

**The state of the code you read.** Branch `claude/oil-work-start-build-35a0e3`, cut from `main` at the merge of PR
#483; the build is committed (`git diff origin/main...HEAD -- raptor-port/src`), written by Opus 5.5. Design your
scenarios from what was PROMISED below and from the rulings — not from what the builder happened to write. Where the
code already disagrees with the promise, say so as a finding with its exact fix.

**Read first, from the live files:**
- the job as filed: `OUTSTANDING.md` `[OIL-WORK-START]`; the finding that raised it:
  `raptor-port/docs/handpass/2026-10-05-codex-stack-check.md` §5.2 (W1);
- the register of what was built, one line per behaviour: `raptor-port/docs/superpowers/specs/2026-10-06-oil-work-start-register.md`
  (OWS1–OWS11); the plan and what its two challenges changed: `raptor-port/docs/superpowers/plans/2026-10-06-oil-work-start-plan.md`
  (§7 is what was built where it differs from §3);
- the owner's rulings — one line each in `.claude/rules/decisions/oil.md`, `scheduler.md`, `how-we-work.md`,
  `leave-war.md`; each ruling's FULL row by `grep -h '^| D591 |' .claude/decisions-full/*.md` (the shell): **D591, D592**
  (this job — read both full rows); **D497–D507, D509, D510, D600** (In-time / Rally: the box, what a line means, a
  formation's own line, the earliest stage, the evening before, the button); **D42, D48, D49, D142, D2** (which day
  earns; an issued day keeps what it went out with; the latest published version pays); **D44, D45, D98, D99, D103**
  (nothing on a published day changes unacknowledged; the pending list; back to as-published shows nothing pending; any
  pending change takes the sign-offs down); **D186, D482** (the one printed rule value a published day keeps; Insights'
  hours move at once — the contrast); **D24, D28, D31, D43** (which seats earn, the switch); **D19, D21** (a weekend no
  Leave War period covers; an Off day); **D178** (a member's input change after publishing); **D56** (below);
- the rules as written: `raptor-port/docs/engine-rules.md` §Weekend/PH work earns OIL (to its end);
  `raptor-port/docs/ui-contracts.md` §OIL on the schedule;
- the method: `raptor-port/docs/bug-check-order.md` §2, §2b, §6, §7; `raptor-port/CLAUDE.md` "The rules-engine
  robustness doctrine" (full text: `raptor-port/docs/guide-full.md` §The rules-engine robustness doctrine) — the owner's
  FIVE gotcha families must each be walked: people not following the format · missing input · user errors · deletions
  and edits from another page · sync between copies;
- `.claude/rules/raptor-executor.md` (you never approve, and the reviewer is never bypassed).

## The promises

**1. Where a flying line's OIL day starts (D591, D592 (1)–(3), (5)).** On a weekend or public holiday a man on an
ordinary flying line earns OIL for a day that runs from the line's ENTERED In-time / Rally — the earliest that applies
to his formation (a line naming the formation before a wave-wide one, each activity apart; D505, D506) — to landing
plus the debrief. Where no line gives a clock, from the nominal report (take-off less the Logic page's "Nominal report
before T/O"). A clock later than the take-off is the evening before and lengthens that line's own day; the day before
earns nothing from it. His day still runs from his first event's start to his last event's end, gaps included. Under
six hours and one minute is a half day (HO), at or over it a full day (FO). SC, AVALON and BB lines, sims, duty desks,
ground and Common Programme rows are unchanged: their written times.

**2. A published day keeps the OIL it went out with (D592 (4), D48, D142).** Each published version keeps the three
Logic values its OIL was worked out from — "Nominal report before T/O", "Flight debrief after land", "Full-day OIL
threshold". Changing one afterwards does NOT move that day's OIL: not the Leave War's FO / HO cell, not its "worked
HH:MM–HH:MM", not the OIL tracker, not the published face's green edge or OIL Earn figures. Where the change WOULD
write some man's OIL record for that day differently — his amount or his worked times — the day reads ONE pending
change ("OIL on this day · Logic values changed since it was published", naming the value, old → new, and each man,
old → new), the four sign-offs fall, and the next amendment applies today's values and keeps them. Putting the value
back clears it and the sign-offs stand again. A change that would write every record on that day exactly as it stands
raises nothing. An in-time or Rally changed after publishing is day content: pending as ever, and the OIL moves only
when the day goes out again.

**3. Sign-offs and the day they signed.** On a day not yet published, or with an amendment waiting, the four sign-offs
fall when a Logic change made after they signed would alter that day's OIL as it now stands; they stand again when the
value is put back.

**The fault it closes (W1):** fresh demo; a man on a flying line on a Saturday the Leave War covers, take-off 10:00,
landing 11:15; sign and publish; Leave War → he has a FULL day (07:00–13:15). Logic → Edit rules → "Nominal report
before T/O" 3h → 2h30: his day became a HALF at once — "No pending changes", ORIG, the four standing.

**The builder's readings — attack them:** (a) a time entered LATER than the nominal one shortens the day (take-off
12:00, in-time 10:00 → the day starts 10:00); (b) a line the reader cannot read as a clock, or "rally after in-time"
with no in-time, falls back to the nominal time; (c) the pending comparison is each man's whole record — amount and
worked times — and a Logic change that touches no record on that day raises nothing (not "any of the three values
differs"); (d) an SC shift's typed B (its in-time) does not move its OIL — D591 is about a flying line; (e) a
nought-minute sortie whose entered in-time is its take-off, under a debrief setting of zero, earns nothing (the same
boundary both Logic leads at zero already had); filed, not fixed.

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

1. **Every place the app SHOWS a man's OIL for a day or the times behind it** — the Leave War grid's FO / HO cell, its
   day sheet and day list ("worked …"), the OIL tracker and balance, the board's and the week's green edge, the OIL
   Earn mode's figures and switches, the ALL AVAIL window's "Who earns OIL" half, the day's OIL advisories, the
   publish-time toast, the Unpublish warning, the pending count on every surface, the To go out list, the Amendments
   panel, the change history, the Logic page's own text, exports / print. For each: under promise 1 and promise 2,
   what should a walker SEE there, on the working copy, on the published face (View-only Sched), on the 👁 look at an
   older version, and for a member and a guest?
2. **Every way an In-time / Rally line comes to exist or change** through the app's own controls — the "+ In-time /
   Rally" button (week and board), typing, ✕, Escape, a wave template, a day template, copy day, a saved plan, an older
   version loaded, Undo / Redo — and for each the OIL the day then earns. Every spelling the reader takes and does not
   (0830, 08:30, 0830H, 8h30, 25:90, FL240, words only), a formation's own line, two lines, the evening before, a
   Monday reading the previous week.
3. **Every door a Logic value changes through** (Edit rules → the box, Reset to standard, Undo / Redo, a reload, a
   second tab) × every state of a weekend day (not published; published with nothing waiting; published with an
   amendment waiting; signed and not published; an older version looked at; a week that is off screen; a day in the
   SECOND demo week; a weekday; a public holiday declared before / after publishing; an Off day; a weekend no Leave War
   period covers).
4. **Both orders of every pair** of this change's own actions — {type / change / remove an in-time or Rally; change
   each of the three Logic values; sign; publish; amend; Unpublish; load an older version; switch a man or a row off in
   OIL Earn; a member edits a request that earns on that day} — on a day not yet published and on a published one,
   with Undo, Redo and a reload after each. Where must the OIL move, where must it hold, where must the day read
   pending, where must the sign-offs fall or stand?
5. **The real downstream number**, not just the screen: for each scenario that moves or holds OIL, the Leave War cell,
   the "worked" times, and the OIL tracker's balance for the man.
6. **The five gotcha families**, each with at least two concrete scenarios for THIS change.
7. **What is MISSING**: any reader of an issued day's OIL that still uses today's Logic values; any publication path
   that does not keep the values; any surface where the pending change cannot be seen, understood or cleared; any state
   where a day reads pending with nothing a scheduler could see behind it.

One owed read rides with this run (D138): the short lines of **D591** and **D592** in `.claude/rules/decisions/oil.md`
against their full rows in `.claude/decisions-full/oil.md` — does either short line change what its full row means?

## Report format

1. **Roll-call** — two tables: (i) every place a man's OIL or its times is shown · what feeds it · what the walker
   should see under each promise; (ii) every door (an in-time line; a Logic value; publish / amend / unpublish) · the
   states it exists in · what the walker should see.
2. **Scenarios, ranked** — each: id (`S01`…) · setup through the app's own controls (the demo week is Mon 13 – Sun 19
   Jul 26, its Saturday 18 Jul and Sunday 19 Jul inside a Leave War period; admin sign-in `ad` / `a`, member `us` / `us`;
   the second demo week starts Mon 20 Jul) · action · expected, WITH THE NUMBERS (the start, the end, the minutes, HO or
   FO, the "worked" times) · the observation that would disprove it · which gotcha family. Keep each scenario small
   enough for one walker to drive in a few minutes; about forty is the right size.
3. **An oracle table**: take-off / landing / lines / Logic values → start, end, minutes, HO or FO — at least twenty rows
   covering the edges (exactly 6h00, 6h01, the evening before, overnight landing, a formation's own line, two men on
   one line with other events).
4. **The builder's readings (a)–(e)** — for each: sound / wrong, with the scenario that shows it and, if wrong, the
   exact step-by-step fix.
5. **Findings in the code**, if any — each with file, lines, the failing scenario and the exact fix.
6. **The owed read of D591 and D592.**
7. **Explicit negatives** — what you checked and found nothing in.
