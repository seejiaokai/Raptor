# Evidence sheet — the small-fixes batch (28 Sep 26)

Branch `claude/small-fixes-batch-d223f6`. The items: `[AVAILWIN-PREVIEW-BAR]` (A), `[GHOST-FLAG-SHADOW]` (B),
`[ALLAVAIL-OPEN-ROW]` (C, D360), `[AMEND-SMALL-SEEN]` 1, 3, 4, 5, 9 (D1, D3, D4, D5, D9), `[REQ-ORPHAN-ROW]` +
`[REQ-DOOR-WORDS]` (E, F), `[LW-ISO-DATES]`, `[LW-SPARE-MOVE-DOORS]`, `[ABSENCE-SMALL-SEEN]` (G). The plan and its red-team
dispositions (§9): `docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md`; the red team's reports, kept whole:
`docs/superpowers/specs/2026-09-28-small-fixes-plan-review-{astra,fable}.md` (both also designed the walk's scenarios).
Pictures: `docs/img/handpass/2026-09-28-small-fixes/<walk>-<run>/` — `-main` the defect on `main`, `-fixed` / `-final`
the fixed build.

## 1. The eight questions and the tier — FULL

Answered in the plan §1: money YES (C touches the OIL membership walk), the published record YES (D9 what a signature
binds; E a request's filing on published days; D1 what Publish/Unpublish say), saved data YES (E reads the stored weeks;
the signature's binding is stored), a shared drawer YES (the puck, the toast, the floating-window chrome, the date
formatter); a new gesture, a new surface, roles, the warning list — NO. **FULL.**

## 2. The rulings kept (listed before the walk — the plan §0)

D38–D41, D65, D66, D77, D27, D37, D31, D36, D44/D45, D52 (the ALL AVAIL window and its count); D167–D171, D339, D345 (the
changes window); D164, D270, D272, D277 and the 6 Sep 26 drag rule (the ghost); D98, D114, D174–D176, D178/D179 and the
13 Sep 26 "Load the week of … first" refusal (requests); D103, AM15b, AM22, D92 (publishing); D275 (no room beside the ‹
arrow — `[AMEND-SMALL-SEEN]` 4's arrow half answered, nothing built); D262–D266, D330–D335, D260/D261, D300 (the Leave
War); D56, D90, D201, D29, D302. **New: D360** (his answer on `[ALLAVAIL-OPEN-ROW]`), recorded in `scheduler.md` before
the build.

## 3. The roll-call — every place the batch draws the thing it touched

| Item | Surface | Has it / must not / MISSING | Walked by |
|---|---|---|---|
| A windows | ALL AVAIL window over the board's preview bar, 1440×900 and 1440×700 | has it — opens below the bar, buttons reachable | `sf-a-windows` A1–A4 |
| A | the changes window, same | has it | `sf-a-windows` |
| A | a window he dragged | must not move — stays where he put it | `sf-a-windows`; `e2e/availwin.spec.ts` |
| A | the phone | must not — keeps its bottom panel | `sf-a-windows` phone |
| A | the edit week (no preview bar) | must not — unchanged | `sf-a-windows` |
| B ghost | a dragged puck wearing red / amber / grey / dashed / "this is you" rings, board and week | has it — its own ring AND the lifted shadow | `sf-b-ghost` (19 checks) |
| C ALL AVAIL, no end | the count chip — edit week, board | has it | `sf-c-openrow` C1a, C1b |
| C | the window "who's available" — title with the assumed hour, list = chip | has it (title wraps — found by the walk) | C1c–C1e |
| C | the window "Who earns OIL" half — "No OIL worked out — this row has no end time." | has it | C2b, C2c |
| C | the row's switch in OIL Earn mode | has it | C2a |
| C | the phone board and panel | has it | C3a–C3c |
| C | a row with NO start — its own "?" and the window's reason | has it | C4a, C4b |
| C | the money — nobody credited from the guessed hour | must not credit | `engine/oilopenrow.test.ts` (per row kind); not a screen |
| C | View-only Sched's issued face; the print | — | **not walked** (§7) |
| D1 toast | a weekend publish (the OIL line in the same breath) | has it — both said, joined | `sf-d1-toast` D1a, D1b |
| D1 | Unpublish | has it — says what it did | D1c |
| D3 callsigns | edit week, View-only (working draft), board — 1440, 390, 360; five letters, six, a wide six, a long name | has it | `sf-d3-callsigns` (46 checks) |
| D4 AL tag | a changed take-off, landing and duty start, issued as AL1 — edit week and View-only at 1440, 390, 360 | has it — under the time, whole | `sf-d4-altag` (25) |
| D4 | the board | must not — its times are inputs, outlined | noted by `sf-d4-altag` |
| D9 Sort | never-published Friday | has it — the four hold | `sf-d9-sort` |
| D9 | published Tuesday with rows waiting | has it — **found broken by the walk, fixed** (§5 W-1) | `sf-d9-sort` |
| E requests | the next week's card — "On Sun 19 Jul", no Accept, no second row | has it | `sf-e-requests` E1 |
| E | a delete from the next week | must not delete — refused, names the week | E2 |
| E | the delete on its own week | has it — the row goes with it | E3 |
| E | a load / plan switch leaving a row out | — | unit tests (`state/reqorphan.test.ts`); **not walked** (§7) |
| F1 banner | "Switch to this plan" | **MISSING a route** — no screen reaches it (§5 W-4) → filed `[PLAN-BANNER-DOOR]` | `sf-f-banner` F1, F2 |
| F3 pending list | a deleted request that had no row on the published day | has it — "Ranger · Meeting … on the programme → deleted" | `sf-f-pendname` F3 |
| G clash strip | Leave War, a leave filed on the Inputs page over a worked Saturday | has it — "… — change the leave on the Inputs page" | `sf-g-leavewar` G1 |
| G | the other holders (a bid, war leave, war leave once published) | has it | `leavewar/clashwayout.test.tsx`; **not walked** (§7) |
| G dates | the day's sheet on a Leave War cell | has it — "Sat 18 Jul", no stored date | `sf-g-leavewar` G2; every sheet: `isodates.test.tsx` |
| G VIEWING AS | admin and member, 390 and 360; tablet and desktop | has it — own line on a phone, one line wider | `sf-g2-viewing` (30) |
| G read-only window | another man's input, desktop and phone; his own (control) | has it | `sf-g4-readonly` (10) |
| G watch | a member at 390, three sideways positions — the frozen name column | must not be under a leave chip — nothing found | `sf-g-leavewar` G3 |
| Move doors | the Leave War's moves (no screen changed) | must not change | the ported unit tests; the e2e move tests in the gates |
| D5 AL8 colour | — | a question for him (look card) | — |

## 4. The walks — each written as an assertion of the right behaviour, so a re-run is the re-walk

| Walk (`scripts/handpass/sf/`) | Checks on the final build | Before (`-main`) |
|---|---|---|
| `sf-a-windows` all | 19 pass | the defect: windows over the bar |
| `sf-b-ghost` | 19 pass | rings or shadow lost |
| `sf-c-openrow` | 15 pass | — (red-first unit tests) |
| `sf-d1-toast` | 4 pass | the publish line swallowed; Unpublish silent |
| `sf-d3-callsigns` | 46 pass | "…" and "VIP/R" |
| `sf-d4-altag` | 25 pass | "AL" cut, over the people column |
| `sf-d9-sort` | 8 pass | the four fell |
| `sf-e-requests` | 8 pass | — (red-first unit tests) |
| `sf-f-banner` | 4 pass (the finding asserted) | — |
| `sf-f-pendname` | 5 pass | — (red-first unit test) |
| `sf-g-leavewar` | 10 pass | — (red-first unit tests) |
| `sf-g2-viewing` | 30 pass | the chip past the edge |
| `sf-g4-readonly` | 10 pass | live-looking boxes |

Every walk ran against the built bundle on port 4174 with the everything-week saved world (`sf-lib.mjs SF_STATE`).

## 5. What the walk found — and each disposition

- **W-1 (D9) — Sort still took the four down on a PUBLISHED day with rows waiting.** The first fix bound the rows as
  shown, but on a published day the signature also binds the pending comparison, which names an added row by its stored
  position. **Fixed** (`65e49012`): the signature's copy names a current ground row by its id; an issued-day address (a
  delete, a hole — now marked `was`) keeps its position. Red-first: two new unit tests red without it, one red without the
  marker. Re-walked: 8 / 8.
- **W-2 (C) — the window's title cut "no end time, an hour assumed" to "no end tim" at its 212px default.** **Fixed**
  (`47984994`): the when-line wraps. The walk's new check goes red without it.
- **W-3 (E) — the reference docs said a delete "sweeps its row from every stored week"; the app refuses a delete from
  another week and names the week to load** (the 13 Sep 26 rule, kept). **Docs corrected** (`ad057482`); the walk now
  asserts the refusal and the delete on its own week.
- **W-4 (F1) — "Switch to this plan" has no screen route.** View-only Sched's plan preview is read-only, and Edit Schedule
  never shows a plan preview. The wording fix stands (unit-tested); **filed `[PLAN-BANNER-DOOR]`** (retire the door or
  give it a route), low.

## 6. Red-first and break tests (each item's proof that its test can fail)

A: the placement tests red on `main`'s `floatwin.ts`. B: `lift-css.test.ts` red on `main`'s lift rule. C: 12 of the new
tests red with the evidence pass and the window's words set aside; the title check red without the wrap. D1:
`toastbatch.test.ts` red without the batch. D3: the geometry test red on the old stylesheet. D4: the tag test red without
its rule. D9: as W-1. E: `reqorphan.test.ts` red on the old guards (each commit). F3: `amendbatch.test.tsx` red on the old
naming. G clash strip: the bid and Inputs tests red on the old words. G VIEWING AS: the e2e red on the phone without the
fix. G read-only window: the e2e red without its rule. G dates: `isodates.test.tsx` red on a sheet printing an ISO date.

## 7. Not walked — said plainly

- **C on View-only Sched's issued face and in the print.** The issued face shows what the record says (a day published
  before this change has no crowd for such a row — demo data, D56); the print draws no count chip. Unit-tested only.
- **E: a load or plan switch leaving a row out and naming the day** — unit-tested (`reqorphan.test.ts`).
- **G clash strip for a bid, war-approved leave and war leave once published** — unit-tested per holder.
- **A real phone** — every phone check ran in a headless browser at 390 / 360 (see `ui-contracts.md` §Device caveats).

## 8. The two final code reads

*(to be filled when Fable's and Astra's reads are in)*

## 9. The gates

*(to be filled from the run under the PC lock)*

## 10. His look card

*(to be written with the reads' dispositions)*
