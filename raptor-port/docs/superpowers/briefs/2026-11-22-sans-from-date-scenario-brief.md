# Scenario-design brief — SANS from its date on every screen (D2313), the publish note's names (D2314)

**For:** Astra (the standing reviewer; a fresh Opus reader if Astra cannot run). **Job:** design the test scenarios for a
walk of the running app — hunt for what is MISSING. You did not build this; do not review the diff line by line.
Read only; change no file. State each scenario in your output the moment it is settled, so a stopped run keeps it.
**Written:** 22 Nov 26, chat 140. **Branch:** `claude/sans-from-date-139` (pull request 824), the app under `raptor-port/`.

## The promise — copied from the owner's rulings (full rows in `.claude/decisions-full/`)

- **D2313** (`.claude/decisions-full/people-accounts.md`): "A man counts as SANS only from the date his SANS starts, on
  every screen, and days before it are untouched: the board's crew list follows the posting's date as the ALL AVAIL
  window does; a SANS tick made by hand counts from the day it is made, so earlier published days keep their crowd; a
  hand re-tick after a SANS posting keeps the posting's date; a man named on a published day before his posting does
  not make it pending." Its example: "Hex posted out as SANS from Mon 20 Jul shows as an ordinary WSO on Sat 18 Jul in
  the crew list too". The question he answered asked of a tick put ON or taken OFF by hand ("An admin ticks or unticks
  SANS for a man by hand… Should published days before that keep their ALL AVAIL count as it was?" — "yes").
- **D2314** (`.claude/decisions-full/oil.md`): "The publish note names an unanswered input by who it is for: one person
  "Ranger's Training", two people "Ranger and Hex's Training", three or more "Training for 3 people", and an input for
  ALL AVAIL "Training for ALL AVAIL", each followed by "has no OIL answer, so nobody on it earns OIL.""
- **D283** (people-accounts): posted out as SANS "he becomes SANS on the date".
- **D44, D45, D103** (scheduler): nothing on a published day changes without the scheduler acknowledging it; a change
  that shows as pending takes the four sign-offs. **D142** (OIL): a day's OIL comes from its latest published version.
- **D321, D1692, D1697** (people-accounts, Leave War): the Leave War's ROW of a man posted out as SANS moves whole and
  wears the purple line from when the posting is set — NOT by date; D2313's row says "It narrows nothing".
- **The host's readings (questions, not requirements):** who may FILE SANS availability, the Quals tick itself and the
  SANS highlight chip still read today's tick; an input holding ALL AVAIL beside named people reads "Training for ALL
  AVAIL"; a posting's "Undo post out" erases its SANS days, while an archive or a hand untick ends them and keeps the
  days he was SANS.

## What was built (so you know where to aim, not what to trust)

SANS is a dated status on the person: `sanFrom` (first day of the SANS he holds; absent = from always) and `sanWas`
(earlier stretches that ended). One read, `raptor-port/src/engine/people.ts` `sansOn(id, iso)`; writers `sansStart`,
`sansStop`, `sansErase` — called by the Quals hand tick (`src/state/quals-write.ts`) and the posting
(`src/leavewar/sync.ts` `runPoOutcomes`, its take-backs). Readers changed to ask by the day: the ALL AVAIL crowd
(`sync.ts availableFor`), what a published day keeps and compares (`src/engine/publish.ts` `attrsOf`, `dayPeopleAttrs`,
`peopleAttrsNow`), the SANS availability checks (`src/engine/avail.ts sansGate`, `src/engine/validate.ts`), the SANS
committed (`src/state/flyplan.ts`), the crew list (`src/ui/palette-html.ts`), the Available crew panel and every puck
drawn on a day (`src/ui/html.ts`, `src/ui/board.ts`, `src/engine/faceattrs.ts withDrawDay`), the ALL AVAIL window
(`ui/html.ts withChipWorld`), the next-week preview (`src/ui/peek.ts`), the SANS day (`src/ui/sanscal-model.ts`). The
publish note: `sync.ts oilUnansweredLine`. The roll-call so far, with what is filed: the evidence sheet
`raptor-port/docs/handpass/2026-11-22-sans-from-date.md` §3. The area rules: `.claude/rules/decisions/people-accounts.md`,
`oil.md`, `leave-war.md`, `scheduler.md`, `inputs.md`.

## The finder wording — do this

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.

Include a plain-user round: the area's everyday tasks done start to finish — tick and untick SANS on Quals, set and
undo a posting on the Leave War's sheet, drag a man from the crew list onto a seat on a day before and after his date,
publish, amend — pressing every control that opens or closes something, then every other place that should show the
result (the board, Edit Schedule, View-only Sched as a member, the ALL AVAIL window, the Inputs and SANS calendars, the
Leave War, the bell, the change history). And one scenario per thing that can make the saved dates appear, change or
vanish besides the tick itself: a reload, a sign-out and in, a week change, Undo and Redo, a posting's date moved, a
posting undone, an archive, a restore, a delete.

## What is NOT a finding

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. A scheduler is always an admin
(D785): no scenario sets up a scheduler who is not one.

## What to hand back

A ranked list of scenarios (setup · action · expected, with the ruling it comes from · what would disprove it), a
roll-call of surfaces you believe draw or count a SANS man that the sheet's §3 does not list, explicit negatives ("I
checked X and found nothing"), and for any claim that the code is wrong: the exact input and the exact, step-by-step
fix — each claim will be written as a failing test before it is believed. You cannot run the app; name the exact case
you would run and the host runs it.
