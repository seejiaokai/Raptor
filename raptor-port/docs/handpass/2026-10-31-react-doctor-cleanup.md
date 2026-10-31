# Bug check — the React Doctor clean-up (31 Oct 26, `claude/react-doctor-cleanup`, pull request 603)

His D1534: React Doctor's 60 errors and 42 missed-update warnings across the app, and every Tracker finding, cleaned up as
one batch before new feature work; nothing a person sees is meant to change. Run the kit's way (D1533 —
`npx -y react-doctor@0.9.18 --verbose --no-telemetry`; in 0.9.18 `--no-telemetry` is the same switch as `--no-score`, so
nothing went to the tool's maker; its package check went to Socket, as allowed). **DRAFT** — the host fills the walk's
results, the code read and the closing lines.

## Questions waiting for him

None. No finding needed his choice: the nine Tracker items first set aside as "would change a mouse drag" were made real
buttons that keep the drag (below).

## The eight questions and the tier

1 Money — no (OIL code untouched; the Leave War's OIL tab only had a zoom ref moved). 2 The published record — no. 3 Saved
data — **yes**: the Tracker's store reads saved rows together where it read them one by one, and copies chart data another
way (`src/tracker/app/core.js`, `eventDetails.js`); the Leave War's Manning fold and the Inputs calendar's expand write
their remembered choice from a new place. 4 A shared drawer — **yes**: `src/ui/floatwin.ts`, every floating window's hook;
`src/ui/Shell.tsx`, every page's frame. 5 A new gesture or mode — **yes, small**: 13 boxes in the Tracker became real
buttons (new Tab stops), the ball editor's captions now put the cursor in their box. 6 A new surface — no. 7 Roles — no
(the flex settings' admin gate untouched). 8 The warning list — no. **Tier: FULL.**

## The changes (commits 41b328e0a, d5a8efbcf; the ruling D1538 in fe143f0d5)

Four helpers, one area each, each finding fixed or kept with its reason on the line above it:
- **The Leave War's screens** (13 files): "latest value" refs written after the commit instead of during the draw; the
  Manning fold's remembered choice written outside its state updater; refs that a child reads during the commit kept
  written during the draw (reason beside each).
- **The scheduler's screens** (22 files): `Shell.tsx`'s keep-mounted latches (the Leave War and the Tracker stay mounted
  once visited) become state; `floatwin.ts` reads one live ref; timers and observers get their clean-up; dependency lists
  hoisted; the store's version triggers kept with their reason; two dead refs removed (`InputsCal`, `SansCal`).
- **The Tracker's logic** (9 files): independent reads together (`familyFromStore`, `trkHydrateMem`, `findEnrolment`,
  `leaveRunningCoursesNow`, `renameStudent`, `collectCharts`); Sets for lookups; `structuredClone` for plain copies; every
  ordered save, conversion and import step kept in its order (D464), with its reason.
- **The Tracker's screens** (10 files + `tracker.css`): scrims `role="presentation"`; labels tied or named; 13 boxes made
  `<button>` behind the `.trbtn` reset; the Info panel's chips marked `data-dragscroll`, which `core.js dragScroll` now
  lets start a mouse drag; `DlgModal`, `SidePanel`, `Header`, `Pop`, `LullCalendar` split into parts.
- Also: the Tracker's storage target `setStorageImpl` (was `useStorageImpl`); `doctor.config.json`; `npm run lint` and
  `lint:changed`.

**Every finding, one line each:** `docs/handpass/parts/rdc1031/dispositions.md` (made by `scripts/handpass/rdc-dispositions.mjs`
from the two runs and the branch's own diff): **288 in the batch — 204 FIXED, 84 KEPT with a reason, 0 open.**

**React Doctor, whole app (`src/`, tests left out):** errors 60 → 0 · exhaustive-deps 42 → 0 · Tracker 195 → 0 ·
the app 853 → 562 · the whole project 1,243 → 952 (the 31 errors left are all in old walk scripts). `npm run lint:changed`
on this branch: 70 files read, no new finding.

## The roll-call — what draws or uses each changed thing

| Changed thing | Where it shows or acts | Has it / why not |
|---|---|---|
| `Shell.tsx` keep-mounted latches | every page change; the Leave War and the Tracker hidden, not unmounted, once visited | test `shell-keepalive.test.tsx`; walk S1 |
| `floatwin.ts` live ref | the changes window, ALL AVAIL, every FloatWin; re-place on resize, on the board's preview bar, on a hand resize | recorded at rest (A/B); walk S3 |
| Leave War refs after commit | Approvals (rowsRef), Balances (labelNow, zoom), BidPicker, FlyEdit, FlyRows, gridclick, Matrix (selection, phone move, hover move, jump, zoom, flagged, rowApi, select ctx), OilTracker, OpenDatesSheet, PersonWindow, Sheet | recorded at rest; walk L1–L9 |
| Manning fold / Inputs expand stored choice | the Leave War's Manning fold on a phone; the Inputs calendar's ⤢ | test `counts.test.tsx`; walk L1, S5 |
| Quals pinned row (`stuckRef`) | Quals' heading row pinned under the top bar | walk S2 |
| Tracker reads together, `structuredClone` | boot (hydrate), Export, + Add, rename, post-out leaving, chart switch | the Tracker's unit tests and 345-check suite (GitHub, green); walk T10 (old build's stored world → new build, exports compared) |
| Tracker boxes → buttons | the lull calendar's days; a student's ✕; a lull's ✕; the Next event / Plannable now chips; the failure chips; the rename pencil; the Failures title; a lull chip's dates | recorded at rest where the demo draws them (the Info panel, phone and desktop — byte-identical); lull and failure chips by walk T1, T4, T6 |
| `dragScroll` drag-through | a mouse drag starting on a marked chip | test in `tracker.test.tsx`; walk T1, T2 |
| Date captions label → span | the Info panel's Last Flown ×2, Course start, No. of Down Days; + Add's Course start | recorded at rest; walk T7 |
| Ball editor labels tied | Edit chart layout's ball editor and event details | walk T8 (a caption click now puts the cursor in its box — intended) |

## The five sizing lines (§7.0, `docs/walk-ledger.md`)

1. **Type:** E (markup of many screens, behind "nothing changes") with G (the Tracker's stored charts read and copied a new
   way) and a small C (new Tab stops in the Tracker).
2. **Only a walk could find:** a screen that draws differently (a button's default look leaking through), a behaviour
   moved in time (a ref read before it is written), a stored chart read differently by the new code.
3. **The ledger:** type-E walks have found layout leaks that tests passed; a whole-app "nothing changes" refactor is best
   proved by recording both builds and comparing (`docs/walk-scripts.md` §8).
4. **The walk chosen:** one Sonnet walker for the recording (57 steps a size, desktop and phone, admin and member, every
   touched surface reached through its real control) and one for the behaviours (about 30 scenarios, the same script on
   both builds, results compared; T10 carries a world the OLD build wrote into the new one). Repeated cases carried by tests:
   the Tracker's 345-check browser suite and the unit suites (GitHub's run on 41b328e0a, green).
5. **Its row:** added at the close.

## The walk

**The recording (`scripts/handpass/rdc-ab.mjs`, `rdc-compare.mjs`):** two repeat recordings of main matched the first on
every picture and word (`compare-before-before2.json`, `…-before3.json` — the raster held still with
`--disable-partial-raster --disable-checker-imaging --disable-gpu`, after three Tracker steps first differed by 117–319
pixels of ring edges). **main vs this branch: 113 of 113 steps the same — picture byte for byte, page text and error list**
(`compare-before-after.json`; one step, the phone menu, exists on a phone only). No console, page or network error on
either build. Pictures `docs/img/handpass/2026-10-31-react-doctor/{before,after}/{desktop,phone}/`.

**The behaviours (`scripts/handpass/rdc-behaviour.mjs`, one script on both builds):** 28 rows — **26 judged, all PASS on
both builds and the same**; 2 recorded only, differing as intended (T3: the Tracker's Tab order gains 13 stops — the
student's rename and ✕, the Next event and failure chips, the Failures title, the lull dates and ✕; T8: a click on a ball
editor's caption now puts the cursor in its box). No console, page or network error on either build. Results
`docs/img/handpass/2026-10-31-react-doctor/behaviour/{before,after}/results.json`, `compare.json`; pictures beside them
(phone taps pictured about 80 ms after the lift as well as settled — D1281).
- Leave War: L1 the phone's Manning fold (remembered across a reload) · L2 Approvals (Approve lights, a second tap back,
  Undo, a filter change lets the decided line go) · L3 a bid moved on a desktop (hover preview) and on a phone (the
  two-step Confirm), deleted · L4 a Required cell (outside press saves, Escape restores) · L5 Open for bidding (a drag over
  two months; Escape closes the exact-days calendar only) · L6 My leave (the keyboard back on its button) · L7 a tap behind a
  phone's bid window closes it · L8 a Balances box saved by a tab switch with no blur, a refused value naming its own label ·
  L9 a phone pinch (0.8 → 1.4 → 0.55, the names and corner held at the left edge mid-pinch and after).
- Scheduler: S1 the Tracker's chart the SAME node after a visit to Edit Schedule (210 balls), the Leave War's scroll kept ·
  S2 Quals' pinned row (pins, unpins, holds after a resize) · S3 floating windows inside the screen at three sizes, the
  board's window re-placed · S4 the medical just-added mark · S5 the Inputs calendar's expand remembered · S6 Logic's Reset
  hands the keyboard back · S7 the Scheduler Board's Escape and ✓ Done hand the keyboard back · S8 the phone's drawer,
  templates and drafts windows.
- Tracker: T1 a mouse drag from a Next event chip, a failure chip and a lull chip scrolls the Info panel and opens nothing;
  a plain click opens each · T2 a drag from a student's ✕ does not scroll (as before), a click asks to remove · T4 the lull
  calendar's 42 days (pictures byte-identical) · T5 + Add twice and after a rename, each box opens on its own default · T6
  marking Done and a failure, − takes it back · T7 a click on the Info panel's captions opens nothing · T9 the Legend and
  flex settings close on Escape and on their backdrop.
- **T10, the stored charts:** on main's build, through the controls — a student added, two events marked done, a failure,
  details typed on a ball, a lull — then Export and the browser's storage saved; the branch's build opened on the same
  address with that storage shows the same, and **its export is byte-identical to main's** (same md5), again after a
  reload; the 27 Tracker keys unchanged (the branch rewrote nothing); the same work done afresh on the branch exports
  byte-identical too. Only `savedAt` is a time stamp, held still by the walk's clock.

**Limits, said plainly:** S3's "preview bar" was not found as a separate control (the board's own changes window was driven
instead); S7 opens the board by a scripted click (its opener has no keyboard route — older); T3 starts its Tab walk on the
chart.

## The code reads (D790 — fresh, blind Opus, one per area)

- **The Leave War's and the scheduler's screens** (`parts/rdc1031/read-opus-lw-sched.md`): **no findings.** Every moved ref
  checked against every reader (the draw, children's layout effects, earlier layout effects); the four kept as draw-time
  writes confirmed; Shell's latches never remount; floatwin never staler; no new work per frame on the grid.
- **The Tracker** (`parts/rdc1031/read-opus-tracker.md`): **F1 (medium)** — a "Next event" chip that can be flown lost the
  card's grey (`.kv span:first-child` no longer matched the chip once it was a button); **F2 (low, records)** — the outcome
  table paired kept reasons by order, not by line. The reads together, the `structuredClone` copies and every kept reason
  checked sound. The D1538 short line checked against its full row.

## Fix round 1 — the reads' two findings (31 Oct 26)

- **F1, red first:** `scripts/handpass/rdc-evchip.mjs` reads the colour a ready "Next event" chip gets (the "not yet" mark
  taken off in the page, to read the cascade — the demo student can fly none): main's build PASS 8/8 (grey
  rgb(138,150,163)); the branch FAIL 8/8 (rgb(241,244,247)). Fix `tracker.css`:
  `.kv span:first-child,.kv b>.evchip:first-child{color:var(--muted)}`. After: PASS 8/8, desktop and phone. Re-walk: the
  recording's Tracker group again (`after2/`): 20 of 20 the same as main. The Tracker's and the stylesheet tests: 571/571.
- **F2:** `rdc-dispositions.mjs` pairs each kept reason with the finding whose line on main reads the same as the line under
  it; three comments above lines the clean-up also edited are paired by place and say so. Totals unchanged (204 / 84); the
  rows now right (e.g. core.js 325 and 381 FIXED, Import's ordered writes KEPT).
- One round; the fix is one selector — no narrow read of it is owed (§5: a fix that rewrites logic gets one).

## Findings and dispositions

| # | Found by | What | Disposition |
|---|---|---|---|
| F1 | the Tracker read | a ready "Next event" chip's words bright, not the card's grey | fixed red first, re-walked |
| F2 | the Tracker read | the outcome table's rows paired by order | fixed; table regenerated |
| — | the walk | nothing | — |

**Why the walk missed F1** (D1297's spirit — found by a reader, not by him, but the lesson is the walk's): the recording
proves sameness only for the states the demo world holds. A style keyed to a state the demo never reaches (a chip that can be
flown) is the same in both recordings and still differs. Logged as a row in `docs/walk-ledger.md`; a "nothing changes" job
that turns an element into another tag measures every tag- or position-keyed rule that matched it, in every state.

## Closing

- **Rulings:** D1538 (the Tracker lives in Raptor for good — recorded mid-job, its old text marked, filed
  [TRK-STANDALONE-LEFTOVERS]).
- **Filed:** [TRK-STANDALONE-LEFTOVERS]; the slow set-up of `availwin.test.tsx` under load (in the evidence above — not a
  fault of this change); the half of the move plan's point 4 not built here — the code check as a GitHub check on every
  pull request (`lint:changed` needs `main`'s history in the check machine; built with [REVIEW-LAYERS] or on his word).
- **Walk:** 113/113 screens identical (pictures, words, errors) on main and the branch, desktop and phone · 28 behaviour
  rows on both builds (26 the same and passing, 2 intended differences) · the Tracker's stored world carried old → new,
  exports byte-identical · 1 fault found by the read, fixed red first, re-walked 20/20 · MISSING: none.

## Checks so far

- GitHub's run on 41b328e0a: build, the original's 728, unit (raptor 6 shares, leavewar 4), geometry (7 shares), the
  Tracker's suite (2 parts), secrets scan, docs guard — all green.
- Helpers' own runs: the Tracker's unit tests 571/571; the Leave War screens 1,626 passed / 20 skipped; the scheduler's
  142 files 3,412 passed (one older test, `availwin.test.tsx`, timed out once in its set-up under load and passed alone —
  filed); type check clean.

## Deviations from the order, said plainly

- The fresh code read was started while the behaviour walk was still running, with the recording's result in hand; the
  behaviour results are sent to the reader as they land.
