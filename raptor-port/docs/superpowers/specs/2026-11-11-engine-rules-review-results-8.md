# Family 8 — OIL hours: how a day is measured and which version pays (W79–W87) — results

Reviewer: fresh Opus helper, 11 Nov 26. Test file: `raptor-port/src/engine/rulesfirst-8-oil-hours.test.ts` — **10 passed, 1 `it.fails`** (finding 8.1, its red line seen as a plain `it`). `npx tsc -b` clean.
The tests run against the app's real OIL wiring: both stores, `wireLeaveWarSync`, the publish door, `runOilPass`, `validate`/`officialWarn`, the board's `oilDayFigures`, and Insights' `workSpan`.

| W-id | D-numbers | verdict | where implemented | the test | one line |
|---|---|---|---|---|---|
| W79 | D592 (beside it D591) | MATCHES | `engine/oil.ts` `fltOilWin`, `dayOilWork`, `envMin`, `uniformOil`; `engine/reporting.ts` `resolveReporting`; `leavewar/sync.ts` `creditFrom`/`desiredOilCells`; `ui/oilmode.ts` `oilDayFigures`; `validate.ts` `workSpan` | NEW: "one made-up Saturday, every reader agrees…" and "a report on the evening before lengthens the line's own day…"; existing `engine/oilworkstart.test.ts` OWS1–OWS4 | All four readers of OIL hours agree on one made-up day: the engine walk, the board's OIL Earn, the Insights / long-day span, and the Leave War credit with its stored times. The edges hold: exactly 6h is HO, and an evening-before report credits Sunday only. |
| W80 | D606, D1041 (beside them D1044, D1045) | MATCHES in the engine; **DRIFT on the Logic page (8.1)** | `engine/oil.ts` SC branch (`scWin`, `scReport`); `reporting.ts` `scReport`; `waves.ts` `saFlies`/`saAnyFlies`; `ui/logic-html.ts` OIL `how()` | NEW: "his case and its edges…" (passes); NEW `it.fails` "8.1 — the Logic line read as written…"; existing `engine/oilscintime.test.ts` | Blank B: 07:00–13:00, HO. B 06:00: from 06:00, FO, and the SPARE flies too. R 05:30 is earlier, so it wins. A B typed later than START counts from START. Work hours agree throughout. The Logic text says otherwise for a late B. |
| W81 | D49, D42 | MATCHES | `oil.ts` `fltOilWin` / `fltMeasuresNothing`; `validate.ts` FLT_NO_LEN, `dayOilBlind`; `oilev.ts` `oilWorkSpans` (clips to 1439) | NEW: "VL 10:00–10:00 on Saturday…"; existing `engine/oilflighttimes.test.ts` | A line with the same take-off and landing gives 07:00–12:00 HO, a grey advisory, and is never named "no usable times". A Saturday-night AVALON that flies earns Saturday FO (stored to 23:59); Sunday gets nothing. |
| W82 | D2, D142 | MATCHES | `leavewar/sync.ts` `desiredOilCells` (reads `daySnapOf(di, dayCurVer(di))` only); `oilev.ts` frozen `earns`; `state/sched-commit.ts` undo = unpublish; `validate.ts` OIL_STALE_DAY, LIVE_ON_FACE | NEW: "D142: a working-copy change pays nothing…"; "an Undo of the publish is an unpublish…"; "D2 with the real wiring (7.U2)…"; existing `leavewar/oilsync.test.ts` OIL24/OIL29, "a draft edit AFTER publish moves nothing", "a new AL with shorter hours replaces FO with HO" | Only the latest published version pays. An amendment that takes Stiff off a past day takes his OIL away. An Undo of the publish takes the day's OIL away. A holiday declared after publication waits for republication, and the day says so. No separate "EOD" version exists in code: the latest amendment is the EOD. |
| W83 | D48, D592 | MATCHES | `oilev.ts` `oilKeptVals`, `oilRuleShift` (`oilrv:<di>` pending) | existing `leavewar/oilworkstart-published.test.ts` OWS6, OWS7, OWS8, OWS9, OWS12 | A published day keeps its OIL when a Logic value changes. The change reads pending, takes the four sign-offs down, and clears when the value is put back. Publishing again applies the new values. No new test. |
| W84 | D82, D79 | MATCHES | `leavewar/state/store.ts` `setDayAward`, `awardsOnDay`; `sync.ts` `runOilPass` (non-working days only) | NEW: "Bane: an award typed on a working Monday stands…"; existing `leavewar/oil-award-add.test.ts` "the owner's own example: a 3-day award…is worth 4"; `leavewar/ui/creditdoor.test.tsx` | A hand award on a working Monday is accepted, and the automatic pass gives that Monday nothing. A 3-day award plus a worked Saturday is worth 4. |
| W85 | D21 | MATCHES | `leavewar/engine/eventdefs.ts` `isNonWorkingDay`; `sync.ts` `isNonWorkingISO`, `HOOKS.oilEarningDay`; `ui/oilmode.ts` `oilShown` | NEW: "Monday tagged Off day with Stiff on a desk…"; existing `leavewar/oilsync.test.ts` "a day tagged Off day … earns nothing" | An Off day gives no OIL Earn, no OIL words and no credit, and leave still charges. The same Monday made a PH earns FO once it is amended. |
| W86 | D81, D360 | MATCHES | `validate.ts` OIL_NO_TIMES via `oil.ts` `dayOilBlind`; `sync.ts` `publishFlagsBids`/`oilBlindLine`; `oil.ts` `openEndRows`; `oilev.ts` `sent` | NEW: "his own case — Stiff on Sunday's SDO desk with no times…"; existing `engine/oilopenrow.test.ts`, `ui/oilmode.test.tsx` (D360 words), `ui/availopenrow.test.tsx` | The day names the desk and the reason: "SDO and RUNNER have no usable times — nobody on them earns OIL". At publish: "…earned nobody any OIL — the SDO and RUNNER desks have no usable times". An ALL AVAIL row with a start and no end credits nobody, but its crowd is counted. |
| W87 | D19, D1578 | MATCHES | `validate.ts` OIL_NO_PERIOD; `sync.ts` period checks; the Inputs OIL question | existing `engine/oilperiod.test.ts`; `leavewar/oilsync.test.ts` D19 tests and "D1578 — a weekend answered before its year had a period earns once the period is made" | A weekend with no period names the reason and offers to create the period. An input for such a weekend saves its answer and earns once the period is made. No new test. |

Counts: **MATCHES 9** (W80's engine included), **DRIFT 1** (8.1, on W80's Logic text), **UNCLEAR 0**. The one question answered for family 7 (7.U2) is set out below.

## Finding 8.1 — DRIFT (D932 against D606 / D1044)

- **The clause:**
  - D1044: a standby line with B or R typed flies for every row, "using the line's planned START and END".
  - D606 reading (1): the earlier of B and START is used.
  - D932: "every line is correct for whatever the settings are".
- **Kind:** DRIFT. A Logic page line states a rule that is untrue of a real case.
- **Where:** `src/ui/logic-html.ts`, in the OIL check's "How it works" list (read via `lgChecks()…find(c=>c.id==='oil').how()`). The line says a standby row that flies earns "from its B or R (the earlier) to its END".
- **The case:**
  - Saturday, an SC AM shift, 07:00–13:00. Bane is the MAIN and Stiff the SPARE.
  - The scheduler types B 08:00.
  - The app counts both men from 07:00 to 13:00. That is right by D1044 and D606 reading (1).
  - The Logic page tells a reader they earn from 08:00.
- **Consequence:** no OIL is lost; the amount is right. A member or admin reading the Logic page would expect 5h (a half day) where the app credits 6h. With other times the full-or-half answer could differ from what the page leads them to expect, and the app would look wrong when it is right.
- **Confidence:** high. The words and the code were both read, and the case was run.
- **The red line:** `the line and the app agree: expected { says: true, start: 420 } to deeply equal { says: true, start: 480 }` (420 = 07:00, 480 = 08:00).
- **Suggested fix (not built):** reword it as "from its B or R if earlier than its START, otherwise from its START, to its END".

## The published-day family's question (7.U2), answered with the real OIL hooks

- **The case:**
  - Wednesday 15 Jul: Bane on a flying line VL with no take-off or landing; Stiff on the SDO desk 08:00–15:00.
  - The day is published as a working day. No OIL words show, and nothing is pending.
  - The admin then makes the day "PH" on the Leave War's Event row.
- **What happens:**
  - The published face shows OIL_STALE_DAY, an advisory: "the day saying so".
  - It also shows the red OIL_NO_TIMES, naming the timeless VL.
  - With the real wiring the day DOES read pending: `dayDelta` holds one `oil` entry, because the evidence's `earns` changes, so the four sign-offs fall. Family 7's engine-only fixture saw nothing pending; that was the fixture, not the app.
  - Nobody is credited until the day is published again.
  - After the amendment, Stiff gets FO. The stale line goes, and the red line stays because it is still true.
- **What he ruled:**
  - D2: "a holiday declared after publication waits for republication, the day saying so".
  - D81: a weekend or holiday that earns nobody says so on the day and at publish.
  - D44/D45: anything that shows as pending wipes the sign-offs.
  - The behaviour is consistent with all three.
- **What stays open (family 7's question i):**
  - Whether that red line, and the six OIL codes generally, belong among the warnings live on a published face. D179's list does not name them.
  - Whether the red is right on a day that will pay until it is republished anyway.
- **Recommendation:** keep it as built. D2 and D81 ask the day to say so, and the red line names the one thing the admin must fix before republishing. Put it to him only as part of 7's question i.

## Outside this family — noticed, not reviewed

- D606's full row still states reading (3) (the MAIN only, the SPARE earning its written hours) without a mark that D1044 and D1045 overtook it. The code follows D1044.
- The Logic page's flight line ("A flight runs from its in-time (or Default rally before take-off…)") never says that a typed rally alone starts the line. The code does count it (D1032).
- A BB standby shift seeded with blank times, with crew on a weekend, raises the red OIL_NO_TIMES. This is consistent with D31, but noisy on any weekend BB left blank. A wording or severity question at most.
- `dayOilSpans` returns a man's spans in event order, not time order. Every reader takes first start to last end, so no amount is affected. Only a test or display that lists them raw would see the order.
- Briefs and tests that say "EOD version" (D142's words): no such version exists in code. The latest ALn is the day's final word. Worth one line in `engine-rules.md` so a later reader does not hunt for it.
