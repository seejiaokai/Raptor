# The final code read — OIL Earn on the Scheduler Board (D1782, D1783, D1793)

Chat 5, 8 Nov 26. Tier FULL: it touches OIL (earned leave, time off banked, never pay) and adds two gestures. This
brief goes, unchanged, to three readers, each blind to the others: Astra, Sol 6.1 (D1743, until Mon 9 Nov 26 19:00),
and a fresh Opus reader who did not write the code and has seen neither the walk's report nor another reader's
(`raptor-port/docs/bug-check-order.md` §4, "Who reads the finished code now"). Do not read the walk's report or
pictures (`raptor-port/docs/handpass/2026-11-08-oil-earn-board.md`, `raptor-port/docs/handpass/parts/2026-11-08-oil-earn-*`,
`raptor-port/docs/img/handpass/2026-11-08-oil-earn-board/`) or any other reader's report.

Your sandbox may be read-only and unable to run the app. Where you cannot run a case, name the exact input — the day,
the row, the control, the order of presses, phone 402 × 874 touch or desktop 1536 × 864 mouse or keyboard — and the
host will run it before your finding is judged.

## What to read

- The change: branch `claude/pr-oil-earn-ffbf07` at commit `e4677d032` against `main` at `549482bd5`
  (`git diff 549482bd5 e4677d032 -- raptor-port/src`): `raptor-port/src/ui/oilmode.ts`, `raptor-port/src/ui/board.ts`,
  `raptor-port/src/ui/board-html.ts`, `raptor-port/src/ui/scheduler/18-oil-board.css`, and their tests
  (`raptor-port/src/ui/oilmode.test.tsx`, the last describe blocks; `raptor-port/src/ui/noteswords.test.ts`;
  `raptor-port/src/ui/oilclaimcrowd.test.tsx`).
- The plan, group 2: `raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md`.
- The scenario designer's report, already acted on: `raptor-port/docs/superpowers/briefs/2026-11-08-oil-earn-board-scenarios-astra.md`
  — its findings 1 and 2 were fixed in commit `a827307a5`.
- The rulings: `.claude/rules/decisions/oil.md`, `.claude/rules/decisions/scheduler.md`, `.claude/rules/decisions/design.md`
  (one line each), and their full rows in `.claude/decisions-full/` — search them (`grep -h '^| D65 |'
  .claude/decisions-full/*.md`), never read them whole.
- How the board is drawn and pressed: `raptor-port/src/ui/SchedBoard.tsx` (the panels written whole when their markup
  changes), `raptor-port/src/ui/interactions.ts` (`routeClick`: a tap on a puck selects the man; a tap on an Unavailable
  seat arms it), `raptor-port/src/ui/highlights.ts` (a picked man's pucks wear `sel`), the ALL AVAIL window
  (`grep -rln "availwin" raptor-port/src/ui`), and how OIL is worked out and saved (`raptor-port/src/engine/oilev.ts`,
  `raptor-port/src/ui/oilmode.ts`'s writers).

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
- **D804 (13 Oct 26):** "Leave and medical inputs never earn OIL and are never asked"; D778: a personal input "is still
  not work: no OIL question, nothing earned".

## The host's readings — no ruling says these; treat each as a question, not a requirement

1. A placeholder puck (ALL / ALL AVAIL) on a row in OIL Earn — whether or not its row can earn: a tap on its body picks
   nothing and says "Nothing changed for ALL AVAIL. The people behind it are switched in the window its count opens."
   (under the day's switch, D845's refusal instead). Its count still opens the window.
2. A man's puck that could earn but is held off by the day's switch, or by its event's own OIL switched off: a tap says
   the ruled refusal (D845's words; "This event earns nobody any OIL. Turn the event back on first.") rather than
   "Nothing changed for …".
3. A man under Personal Inputs or Unavailable whose request never asks the OIL question (leave, medical, Personal,
   SANS Availability): in OIL Earn a tap picks nothing and says "Nothing changed for <callsign>." then "Leave earns no
   OIL." / "A medical request earns no OIL." / "A personal request earns no OIL." (the kind's own name for the others).
   Outside the mode the same tap arms the seat, as before.
4. The passing note after the switch is pressed (not ruled): "Nothing on this day earns OIL, including anything added
   later" on; "This day can earn OIL again, and the marks underneath are back" off.
5. Pressed from the keyboard, the keys stay on the switch after the bar is redrawn; one press changes the day once.

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
- A finding is a concrete failure, its cause and its fix — with **exact, step-by-step fix instructions**, not a
  direction. Say whether it is new in this branch or already on `main` at `549482bd5`.
- Look hardest at: a tap that still picks a man, or still changes what anyone earns, where the promise says it picks
  nothing; a tap that now says nothing where it said something before; any OIL figure, saved answer or published day that
  this change could move (it should move none); the switch pressed once changing the day twice, or not at all; Undo and
  Redo after the switch; the keys after a redraw; the phone bar on one row at 402 wide with the buttons 23px tall.
- **Explicit negatives:** "I checked X and found nothing", for each area you looked at.
- **A tidiness note** (D489), filed, not fixed: three questions of the changed lines only — is anything said twice that
  one place could say; is any new name or branch harder to follow than it needs to be; is anything left that nothing
  uses. No size figure, and never the rules engine.

Write your report as Markdown, ranked, most consequential first.
