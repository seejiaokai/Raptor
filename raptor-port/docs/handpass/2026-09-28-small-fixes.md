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
| `sf-c-openrow` | 16 pass | — (red-first unit tests) |
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

## 8. The two final code reads — blind, after the walk, with this sheet in hand

Brief: `docs/superpowers/briefs/2026-09-28-small-fixes-final-read.md`. Reports kept whole:
`docs/superpowers/specs/2026-09-28-small-fixes-final-read-{astra,fable}.md`. Neither found anything touching money, the
published record or saved data beyond Astra #1 below.

| Finding | Disposition |
|---|---|
| **Astra #1** — a saved week that cannot be read "fails open" at the load's leave-out, the edit, the delete and the week switch's re-filing (the plan promised fail-closed) | **Fixed** (`e0593211`). Measured first: every unreadable saved week is also LOCKED (`quarantine.ts`), so the edit, the delete and the re-filing were already refused or skipped for a request covering it — only the load / plan switch was open (its test red on the old code). All four doors now fail closed on their own too. |
| **Astra #2** — a WIDE six-letter callsign (MAGNUM, HAMMER) still ends in "…" on a phone | **Put to him** — look card question 6 (fitting it costs another 7px of the phone's remarks column). |
| **Fable F1** — in the window's OIL half a man on the no-end-time row said "nothing measurable to earn", and a tap replaced D360's sentence with it | **Fixed** (`6b619eea`), red-first; re-walked (`sf-c-openrow` C2d). |
| **Fable F2** — the window might stay pushed down after the board closes | **Measured: does not happen** — the window re-places on every redraw and goes straight back to its corner (top 96, no height cap). Pinned by `e2e/availwin.spec.ts`. |
| **Fable F3** — "moved from" read two ways one tap apart (the day's list "Wed 11 Feb", the bid sheet "11 Feb 26") | **Fixed** (`6b619eea`); the list's test, which pinned the old words, red on the old line. |
| Fable's observation — `signbind.test.ts` compared against the stored-order digest | **Confirmed red, the test corrected** (the code is D9's intended change): its expectation now reads the shown order. |
| Fable's observation — `[PLAN-BANNER-DOOR]` confirmed unreachable from the code | As filed. |

Re-walked after the fixes: `sf-c-openrow` 16/16, `sf-e-requests` 8/8, `sf-g-leavewar` 10/10, `sf-d9-sort` 8/8.

## 9. The gates — on the final code (`05bdf6a6`), one run under the PC lock

| Gate | Result |
|---|---|
| unit | **6848 / 6850** (424 files). The 2: `leavewar/ui/counters.test.tsx` "switches to LVE…" and `ui/histlist.test.tsx` "offers a control…" — both **20-second timeouts under the full run's load**, not wrong answers. Each passes alone; timed back to back on `main` and this branch (a temporary copy of `main`, twice): histlist 7.8 / 7.8 s on `main` against 8.3 / 8.0 s here, counters 2.1 / 2.2 s against 2.1 / 2.1 s — the same, so the batch did not slow them. Neither file is changed by the batch. |
| build | clean |
| tfin (the reference app) | **728 / 0** |
| e2e | **508 passed**, 48 skipped |
| Tracker smoke | **443 / 0** |
| rulecheck | OK |
| docsize | OK |

The e2e run carries the batch's new browser tests (the preview bar, the geometry of callsigns and tags, the read-only
window, the VIEWING AS chip, the board closing under a window).

## 10. His look card

**What to look at (the branch's Vercel preview, signed in as admin):**
1. The scheduler board on a published day → the plans menu → an issued version, then tap an ALL AVAIL count: the window
   opens BELOW the preview bar, its "Back to live copy" still pressable. The same with History open.
2. Drag a puck wearing a red or amber ring: the lifted copy keeps its ring and its shadow.
3. Saturday's Common Programme, FAMILY DAY (ALL AVAIL): clear its END time. The count stays; tap it — the window reads
   "10:00–11:00 · no end time, an hour assumed". Turn OIL Earn on: "No OIL worked out — this row has no end time." Clear
   its START too: the count becomes a "?".
4. Publish a change on the Saturday: the message says what was published AND the OIL line. Unpublish: it says what it did.
5. A flying line called W6LINE or RANGER: whole on the week, View-only Sched and the board (desktop and phone).
6. A changed take-off issued as AL1 on a phone: "AL1" sits under the time, whole.
7. "Sort" on a published day's ground programme with rows added in the wrong order: the four sign-offs stay.
8. The Leave War on a phone: "VIEWING AS" on its own line, whole. A member opening another man's input: its boxes now
   read as a record (pictures `g4-readonly-main` → `g4-readonly-final`).

**Questions that are his (each with a recommendation):**
1. **AL8 and later reuse AL7's orange** (`[AMEND-SMALL-SEEN]` 5); the tag always carries its number. Leave it?
   *Recommended: leave.*
2. **Loading an older issued version after one of its requests was deleted puts that request's row back** (the version
   had it); the pending list says so ("… on the programme → deleted"). That is what "load this version" means — leave it?
   *Recommended: leave.* (`[REQ-ORPHAN-ROW]` (2))
3. **The read-only input window's new look** — the pictures above. Keep it? *Recommended: keep.*
4. **The Logic tab's "Assumed length, no end time"** now also sets the hour an open-ended row's ALL AVAIL is counted over;
   changing it on a published day reads as a pending change (the crowd is frozen at publication, D44/D45). Keep?
   *Recommended: keep.*
5. **On a phone the Leave War's "VIEWING AS" chip takes a line of its own** (it cannot fit beside the picker at 390px).
   Keep it, or drop the words on a phone and show just the eye and the name? *Recommended: keep — "make it obvious"
   (28 Aug 26).*
6. **The callsign column is wider** so six letters fit — the remarks column gives the room: 24px on a desktop, 12px on a
   phone (pictures `d3-callsigns-main` → `-final`). On a desktop every six-letter callsign fits, MAGNUM included. **On a
   phone a common six (W6LINE, RANGER) fits, but a WIDE six — two M's or W's, like MAGNUM or HAMMER — still ends in "…"**
   (Astra's final read #2). Fitting those too would take another 7px from the phone's remarks column (73 → 54px in all,
   about a quarter of it). Keep the phone as built, or give the wide six the room? *Recommended: keep — flying-line
   callsigns are mostly short, and the phone's remarks are read on every line.*

**His answers (29 Sep 26):** 4 → D361 (kept as built after a mock-up of a "~" mark on the count; a "?" for a row with no
timing or no end time filed, `[ROW-NO-TIME-MARK]`); "the rest as recommended" → 1 D362 (leave), 2 D363 (leave), 3 D364
(keep), 5 D365 (keep), 6 D366 (keep).

**Filed, not asked:** `[PLAN-BANNER-DOOR]` — the plan banner's "Switch to this plan" has no screen route; recommended to
retire it with the next plans-menu change.
