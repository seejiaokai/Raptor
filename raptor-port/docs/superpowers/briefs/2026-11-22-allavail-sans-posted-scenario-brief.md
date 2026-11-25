# Scenario-design brief — ALL AVAIL counts a man posted out as SANS who is planned with us, whatever "+ SANS" says ([FABLE-READ-FAULTS] (i))

**For:** Astra (the standing reviewer; a fresh Opus reader if Astra cannot run). **Job:** design the test scenarios for a
walk of the running app — hunt for what is MISSING. You did not build this; do not review the diff line by line.
Read only; change no file. State each scenario in your output the moment it is settled, so a stopped run keeps it.
You cannot run anything in this sandbox: where you would run a case, name the exact input and the host will run it.
**Written:** 22 Nov 26, chat 141. **Branch:** `claude/allavail-sans-postout-141`, the app under `raptor-port/`. You are
reading an exported copy of its commit; the branch's handoff block is taken out of the copy on purpose.

## The promise — copied from the owner's rulings (full rows in `.claude/decisions-full/`)

- **[ALL-AVAIL-REDEF], carried by D27** (`.claude/decisions-full/scheduler.md`): the 21 Sep ruling "settled WHO counts
  as available (no ground crew, a SANS man only when planned with us, ATT B in, a time clash out)"; D27: ALL AVAIL / ALL
  "are a SCHEDULING feature, not an OIL feature… Same membership rule, one body."
- **D283** (`people-accounts.md`): "A man posted out as SANS: on the posting-out date he becomes SANS. With "Show SANS"
  off, the Leave War still shows him, marked posted out, and does not track his leave; with "Show SANS" on, he moves
  into the SANS group that day and his leave is tracked there." ("Show SANS" is today's "+ SANS" group in the Leave
  War's Settings — D1215.)
- **D2313** (`people-accounts.md`): "A man counts as SANS only from the date his SANS starts, on every screen, and days
  before it are untouched".
- **D2327** (`people-accounts.md`): "A SANS tick an admin takes off on Quals and later puts back counts from the day it
  is put back: the days in between stay an ordinary man's".
- **D142** (`oil.md`): "A day's OIL comes from its latest published version". **D25:** OIL is earned leave, owed all the
  same. **D44, D45, D103** (scheduler): nothing on a published day changes without the scheduler acknowledging it; a
  change that shows as pending takes the four sign-offs.
- **D303** (`people-accounts.md`): a posting with no chip chosen is "off the manpower, nothing else" — the Leave War
  shows him posted out from the date. **D327:** an archived man stays in the ALL AVAIL crowd on every day before his
  archive, out from it on.
- **The host's readings (questions, not requirements — rule each supported / contradicted / the owner's to decide):**
  (1) the Leave War's "+ SANS" switch is a display choice and must never change who ALL AVAIL counts, a published day's
  state or anyone's OIL; (2) a man posted out as SANS whose SANS tick an admin then takes off by hand on Quals is an
  ordinary man of ours again on those days and counts in ALL AVAIL, named or not, though the Leave War with "+ SANS"
  off still draws him posted out; (3) a SANS posting dated ahead, not yet run, is still a departure for days past its
  date until its date arrives — as it was before this fix, with "+ SANS" on or off.

## The fault, and what was changed (so you know where to aim, not what to trust)

With "+ SANS" off the Leave War, a man posted out as SANS and named on a day's programme was passed by the crowd's SANS
check and then dropped as "posted out": the crowd (`raptor-port/src/leavewar/sync.ts` `availableFor`) asked the war's
display row, whose posting window the switch shapes (`raptor-port/src/leavewar/state/store.ts` `windowFor`: off — the
window stands; on — a SANS posting that has run lays none). The crowd a published day froze, and its OIL, lacked him;
turning the switch on afterwards made the published day read pending. The change: `availableFor` now lays his SAVED
posting (`getState().postOuts`) on the row the one way, `windowFor(posting, true)`, before asking `inSquadron` — nothing
else. Tests: `raptor-port/src/leavewar/allavail-sans-posted.test.ts`. The crowd's callers: `HOOKS.oilSentinel`
(`src/engine/oilev.ts`, `src/ui/oilmode.ts`), the ALL AVAIL window, the count chip, the published day's kept crowd
(`src/engine/publish.ts`), the OIL pass (`sync.ts runOilPass`). The area rules: `.claude/rules/decisions/oil.md`,
`leave-war.md`, `people-accounts.md`, `scheduler.md`; the seam: `.claude/rules/seams/leave-war.md`.

## The finder wording — do this

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.

Above all: **who else asks the war's display row, or anything else the "+ SANS" switch shapes, a question whose answer
reaches the schedule, a published day, a warning, a count or OIL?** Name each such reader with its file and function,
and the scenario that would show the switch changing its answer.

Include a plain-user round: the area's everyday tasks done start to finish — post a man out as SANS on the Leave War's
sheet (today, a past date, a date ahead), turn "+ SANS" on and off in the Leave War's Settings, name him on a day on
Edit Schedule and on the Scheduler Board, drop an ALL AVAIL puck on an event, open the ALL AVAIL window, publish, amend,
"Undo post out" — pressing every control that opens or closes something, then every other place that should show the
result (the board's crew list, the count chip, OIL Earn, the OIL tracker, the Leave War grid cell, Balances, the bell,
the change history). And one scenario per thing that can make the saved posting or the switch appear, change or vanish
besides the control itself: a reload, a sign-out and in, a week change, Undo and Redo, the posting's date moved, the
posting undone, an archive, a restore, a delete, a member signed in.

For every scenario give its EXPECTED line a source — a ruling, a contract line, "as on `main` today", or two surfaces of
the app that must agree; where you cannot, write "RECORD exactly what it says".

## What is NOT a finding

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. A scheduler is always an admin (D785):
nothing for a scheduler who is not one.

Already filed, not to be raised again (`OUTSTANDING.md` `[FABLE-READ-FAULTS]` (g), (h), (j), (k), (l)): the readers still
on today's SANS tick for past dates (the Inputs calendar's opened day, the SANS day's pucks and Highlight, the Leave
War's Available rows, the "Several people" picker); the pending list crediting a SANS change to a later untick's author;
a posting's take-back after a hand untick; "no longer SANS" said of a man not SANS yet; a member's own-row command
writing SANS dates.

## What to hand back

A ranked list of scenarios (setup · action · expected, with its source · the observation that would disprove it), each
marked WALK (needs the running app) or TEST (a calculation a unit test can carry); for each defect you believe exists,
exact step-by-step fix instructions, not a direction; and explicit negatives — "I checked X and found nothing".
