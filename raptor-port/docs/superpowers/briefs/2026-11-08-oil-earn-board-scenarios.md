# Scenario design — OIL Earn on the Scheduler Board (D1782, D1783, D1793), for ONE reader: Astra

Chat 5, 8 Nov 26. Tier FULL (it touches OIL — earned leave, time off banked, never pay — and adds two gestures). You
design the test scenarios (`raptor-port/docs/bug-check-order.md` §4, rank 1): hunt for what is MISSING, not whether the
code you see is tidy. Your sandbox is read-only and cannot run the app: for every scenario name the exact input (the
day, the row, the control, the order of presses, phone 402 × 874 touch or desktop 1536 × 864 mouse or keyboard) and the
host will run it.

## What to read

- The change: branch `claude/pr-oil-earn-ffbf07` at commit `edace6853` against `main` (`git diff 549482bd5 edace6853 --
  raptor-port/src`): `raptor-port/src/ui/oilmode.ts`, `raptor-port/src/ui/board.ts`,
  `raptor-port/src/ui/scheduler/18-oil-board.css`, and their tests `raptor-port/src/ui/oilmode.test.tsx` (the last
  describe block), `raptor-port/src/ui/noteswords.test.ts`.
- The plan, group 2: `raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md`.
- The rulings: `.claude/rules/decisions/oil.md`, `.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/design.md`
  (one line each), and their full rows in `.claude/decisions-full/oil.md`, `scheduler.md`, `design.md` — search them
  (`grep -h '^| D65 |' .claude/decisions-full/*.md`), never read them whole.
- The approved drawings: `raptor-port/docs/img/handpass/2026-11-07-pictures-round/` — `q-oilswitch-a-*`, `q-inert-a-*`,
  `q-r5e-ph-drawn*`, and `notes-board.md` (questions 3 and 4), `notes-marks.md` (round 5 (e)).
- How the board is drawn and pressed: `raptor-port/src/ui/SchedBoard.tsx` (the panels written whole when their markup
  changes), `raptor-port/src/ui/interactions.ts` (`routeClick`: a tap on a puck selects the man), the ALL AVAIL window
  (`grep -rln "availwin" raptor-port/src/ui`).

## The promise — each sentence copied from its ruling's full row

- **D1782 (8 Nov 26):** "OIL Earn's day button becomes the app's own switch, as on the Logic page: a small slider with
  the words "No OIL earned", grey when off and lit in the switch's cyan when on; the refusal under it keeps his words,
  "Nothing on this day earns. Turn off the switch first."" Its hover: "Anything added to this day later earns no OIL
  either."; the note under the bar when on: "Nothing on this day earns OIL. Turn off the switch and each man earns as he
  did before."
- **D1783 (8 Nov 26):** "In OIL Earn a tap on a man's puck that cannot earn on its row picks nothing and says why in the
  app's plain passing note — "Nothing changed for <callsign>." and then the reason, such as "No OIL worked out — this row
  has no end time." — not in the grey "Blocked:" note." Every reason takes that shape; "nothing measurable to earn from
  here" becomes "This row gives him no working hours to count OIL from." The tap targets stay (D26). It carries D31 (a
  seat with nothing to measure says why) and D65 (a tap in OIL Earn selects nothing) to the board.
- **D1793 (8 Nov 26):** "On a phone the Scheduler Board's day bar shows the desktop's marks before Templates and OIL Earn
  — the page of blocks and the ticket — on one row, the buttons keeping their height."
- **D845 (14 Oct 26), narrowed by D1782:** the refusal reads "Nothing on this day earns. Turn off the switch first." —
  "in every place it is said: a man's puck, an event's own OIL mark, a man in the ALL AVAIL window."
- **D65 (23 Sep 26):** a tap on a man in the ALL AVAIL window with OIL Earn on "only switches his earning and selects
  nothing".

## The host's readings — no ruling says these; treat each as a question to test, not a requirement

1. A placeholder puck (ALL / ALL AVAIL) that cannot earn on its row: a tap picks nothing and says "Nothing changed for
   ALL AVAIL. The people behind it are switched in the window its count opens." Its count still opens the window.
2. A man's puck that could earn but is held off by the day's switch, or by its event's own OIL switched off: a tap says
   the ruled refusal (D845's words; "This event earns nobody any OIL. Turn the event back on first.") rather than
   "Nothing changed for …" — he can earn once the switch is off, so D1783's "cannot earn on its row" is read as not
   covering him.
3. The passing note after the switch is pressed (not ruled): "Nothing on this day earns OIL, including anything added
   later" on; "This day can earn OIL again, and the marks underneath are back" off.
4. Pressed from the keyboard, the keys stay on the switch after the bar is redrawn; one press changes the day once.

## Your brief — verbatim from the bug-check order

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

Also:
- Every place the app draws OIL Earn's day control, a puck in OIL Earn, the ALL AVAIL window's men, or the phone day bar
  — name it, with where the sign and the gesture must be (a phone and a desktop; Edit Schedule's board and any read-only
  view; a day not yet published and a published one with an amendment pending; a weekend and a working day).
- Every order of actions that matters: the switch then a puck, a puck then the switch, the switch twice quickly, a label
  tap vs a slider tap vs a keyboard press, Undo and Redo after each, the day changed with the switch on, the mode left and
  entered again.
- For each scenario: SETUP, ACTION, EXPECTED (cite the ruling, or say "host's reading N"), and the OBSERVATION that would
  disprove it. Where you cannot say what the right answer is, write "RECORD exactly what it says".
- Any finding about the code itself: a concrete failure, its cause and exact step-by-step fix instructions.
- Explicit negatives: "I checked X and found nothing", for each area you looked at.

Write your report as Markdown, ranked, most consequential first, at most about 30 scenarios.
