# RAPTOR — project state

Companion to `raptor-port/CLAUDE.md` (the index and working rules) and
`raptor-port/docs/` (engine rules, UI contracts). This file holds what
those two don't: **what is still open**, and **where each file lives**.

The port from the original single-file app is complete; that history is in
`git log`. This is the live application now, under active development.

**Closed work does not live here.** A bug that is fixed, a feature that has
shipped and a decision that is settled leave behind at most a contract —
which belongs in `docs/engine-rules.md` or `docs/ui-contracts.md`, next to
the rule it constrains — or a stable decision, which belongs in
`CLAUDE.md` §Stable decisions. The story of how it was found and fixed
belongs in `git log`. Keeping post-mortems here buries the open list.


## The gates, and how they lie

Six gates guard every change. **How to run them is in `CLAUDE.md` §Build &
verify** — this section holds only the current baseline and the ways the
gates mislead. The per-batch story of every green run has been removed on
purpose: it is exactly the closed-work narrative the charter above bans, and
it lives in `git log` where it belongs. Restate a count only from a run you
watched — this file's history twice recorded a count that was wrong.

**Last recorded green baseline** (Leave War manning explainer + SC D/SC N,
19 Aug 26 — all six gates watched this session):

| gate | reading |
|---|---|
| `npm test` | 2598 across 141 files — two vitest projects: raptor + leavewar (leavewar alone 870) |
| `node reference/tfin.js` | 728/0 (the reference is read-only) |
| `npm run build` | clean |
| `npm run test:e2e` | 293 passed / 9 touch-only skips — three playwright projects: raptor geometry, lw-phone, lw-desktop |
| `probes:adapted` | 6/6 |
| `perf` | 4/4 |

DOM measures at that baseline: week **3743** under a 4000 ceiling, board
**844** under 960. The Leave War year matrix (~28k nodes) is outside the
perf gate — it has its own e2e DOM band (29000), measured-first.

**How the gates lie — the durable traps, worth more than any count:**

- **`npm run perf` asserts FOUR things, not seven, since 10 Aug 26** — two
  DOM ceilings and two behavioural checks. The three per-node TIMING budgets
  were removed as assertions on the owner's decision, after he asked what
  they had ever caught: nothing, in the life of this repo, while the ceilings
  were right all four times they fired. The timings are still measured and
  printed, so a real slowdown is still visible; a wandering number just isn't
  a failure any more. **Do not re-add them, and do not "fix" one by widening
  it** — a bar loose enough to cover a 3×-swinging estimator would pass a
  genuine doubling too. Reasoning and the counted record:
  `docs/probe-sweep.md` §The three timing budgets stopped being assertions.
  If a printed timing ever looks wrong, the PAIRED recipe in the same file is
  still how to settle it: one reading proves nothing on this container (nine
  readings of one unchanged commit spread 1.08×–1.23×).
- **`probes:adapted` and `perf` do NOT serve themselves** — start
  `npx vite preview --port 4173` first or both fail with
  `ERR_CONNECTION_REFUSED`, which reads like a code fault and is not.
- **And that cuts the other way: if a preview is ALREADY running on 4173,
  `npm run test:e2e` reuses it and never rebuilds** (`reuseExistingServer` in
  `playwright.config.ts`, off in CI only) — so e2e silently measures whatever
  was built last, not your working tree. A CSS change was proven "still
  passing" against a stale bundle that way, and a deliberately-broken control
  case passed too, which is how it was caught. **Kill the preview before
  trusting an e2e run after editing CSS or markup**, or run the two in the
  other order: e2e first, then start the preview for the probes.
- **jsdom cannot measure layout** — every rect Vitest reports is 0×0, so it
  can prove which class was emitted and nothing about what was painted.
  Geometry contracts are gated by `e2e/geometry.spec.ts` (the fourth CI
  gate, 86 checks); wider visual work still wants the probe path
  (`npx vite preview --port 4173` + `probes/`).
- **jsdom cannot HIT-TEST either, and that is a separate trap** (12 Aug 26). A
  pointer bug on the board hid there for a day: dispatching a synthetic
  pointerdown straight at the element you mean is not what a finger does, and a
  gesture wired to the wrong element passes every such test. The board swipe's
  real fault was that mid-settle a finger landed on `.schedboard` (the live board
  was a screen away and the preview was `pointer-events:none`), so the press went
  to an element with no listener on it. **In a browser test, dispatch to
  `document.elementFromPoint(x, y)`, not to the element you have in hand.** The
  swipe itself was removed hours later, so the worked example is gone with it —
  the lesson is not, and it applies to the row-drag and puck-drag machines that
  are still there.

## Known issues / open work

- **LEAVE WAR MANNING EXPLAINER + EDITABLE AMBER/RED LINES + SC D / SC N TEAM
  ROWS (19 Aug 26, owner's ask).** Tap any manning count row's NAME → a sheet
  (`ui/ManningSheet.tsx`) saying in plain words what the row counts
  (`ManningRule.desc` in `engine/seed.ts`, `SETS_DESC` for Crew sets), where
  its colours turn on, and — admin only — the amber/red numbers editable
  (store overlay `manningThresh`, persisted `manningthresh`, admin-gated
  `setManningThreshold`/`resetManningThreshold`; only NUMBERS are stored,
  never rule definitions — the stores-list freeze lesson). Amber ≤ red is a
  legal decision meaning "no amber band" (the SXO idiom); the sheet says so.
  **SC D / SC N** (SC N = AVALON) count COMPLETE TEAMS — 2 SC-qualified
  pilots + 2 SC-qualified WSOs + 1 SXO + 1 more crew, six DIFFERENT people,
  no ground crew (`availability.ts:scTeams`, a Hall-condition min over
  presence buckets — the overlap case "the only SXO is one of the two SC
  pilots" correctly reads under one team); seeded red below 1, amber 1 (no
  amber band), both editable. TWO deliberate readings: a duty-stander counts
  as PRESENT for these two rows only (SC duty IS the manning; every other
  figure still reads them 0), and the SC quals ride the Raptor projection
  (`scd`/`scn` off `quals.scDay/scNight`, added to `reprojectRoster`'s
  signature) so a Quals-page tick/untick recounts the rows live — the
  owner's "when I add or remove quals in the quals page, it will update the
  leave war". Detail: `docs/leavewar/known-gaps.md` §The manning rows
  explain themselves. Tests: `availability.test.ts` (team math + overlap +
  duty presence), `evaluate.test.ts`, `store.test.ts` (gate/persist/corrupt
  blob), `raptorRoster.test.ts`, `roster.test.ts` (live tick propagation),
  `manningsheet.test.tsx`, `counts.test.tsx`.
- **LEAVE WAR HEADER POLISH (19 Aug 26, owner's two phone screenshots).** Two
  fixes in `src/leavewar/ui/Matrix.tsx` + `matrix.css`. (1) **The manning
  counts block collapses on a header toggle, for EITHER role** (owner: "allow
  both admin and norm user to hide it when viewing, click to open or close").
  A "▾/▸ Manning" button in the card header (`counts-toggle`, both roles —
  NOT admin-gated like Rearrange) gates whether `<CountRows>` renders;
  `countsOpen` is a session-only view state like `zoom`. It is FORCED open
  while an admin is Rearranging, because the per-row reorder/hide controls live
  in the counts block and hiding it would hide them. Pinned in `counts.test.tsx`
  + a member e2e. (2) **The month strip's sticky cell now MEASURES its own
  height instead of a hardcoded 72px** (owner: "the Nov and Dec is ugly that
  it's cutting the bar"). The month buttons are absolutely positioned (they
  must not widen the frozen columns), so their cell has to reserve their height
  by hand; a phone wraps them to three rows and a high zoom to more, so NOV/DEC
  spilled onto the bracket bar below. A `useLayoutEffect` reads the strip's real
  height off `mstrowRef`/`mstickRef` and sets the cell's `height` (floored at
  44, the table `zoom` divided back out since the cell sits inside it), re-run
  on zoom/war-change/resize; jsdom (0×0 rects) leaves the CSS floor. Pinned by
  a geometry e2e (DEC's bottom clears the bracket). The old CSS `height:72px`
  phone rule is now just the pre-measure floor.
- **LEAVE WAR — THE 18 AUG EVENING BATCH (owner's screenshot arrows + five
  asks).** Six changes, all in `src/leavewar/`:
  (1) **Row order is counts → month buttons → callsign/dates header → event
  rows → roster.** The header row is a `tbody.mxhead`, NOT a thead — CSS
  paints a thead at the top of the table wherever it sits in the DOM, so a
  mid-table header can never be one (every `.mx thead th` selector in
  matrix.css became `.mx .mxhead th`, same relative cascade, +1 class each).
  The month strip is a grid row (`tbody.mstripe`): its buttons live in an
  ABSOLUTELY-positioned block inside the sticky two-column cell (`.mstrow` —
  in-flow width would become the frozen columns' minimum and was measured
  inflating the callsign column to 245px), with the row's height fixed on the
  cell (44px desktop / 72px phone).
  (2) **The phone freezes the header on scroll (≤700px)** — NOT by re-adding
  an inner vertical scroller (the 10 Aug "ONE vertical scroll" ruling stands,
  see the `.mx-wrap` comment): Matrix renders a fixed MIRROR of the bracket +
  header rows (`.mxfixed`, z 55, testid `sticky-head`) once the real rows
  pass under the sticky `.topbar` (the SHELL's — Leave War's chrome has a
  second `.topbar`; querySelector's first is the right one), and unmounts it
  on the way back. The mirror is its own hidden-scrollbar horizontal
  scroller kept in lockstep with `.mx-wrap` (two handlers, converges because
  an unchanged scrollLeft fires no event), which is what lets the same
  `.who`/`.bal` sticky-left CSS freeze its lead columns; its column widths
  are MEASURED off the live header at activation and pinned via a
  fixed-layout colgroup (the events row is what widens a column). Never in
  jsdom (no matchMedia, no layout — guarded); e2e-pinned in leavewar.spec.ts
  (freeze/thaw, topbar anchor, horizontal lockstep, column alignment).
  (3) **A month BRACKET row** (`tr.mbrak` in the same `.mxhead` tbody): one
  open-topped accent box per month spanning exactly its days, label sticky
  just clear of the frozen columns. Derived from the loaded days, so a
  partial month brackets what is on screen.
  (4) **Phone zoom** (`lw-zoom-in`/`-out`, in the month-strip cell, hidden
  >700px): steps `zoom` on the grid table through 0.6–1.4. CSS `zoom`, not
  transform, so layout/scroll/sticky offsets scale together; the mirror
  wears the same zoom and divides its measured widths back out (they are
  visual px). Zoom is a dep of the mirror effect — it changes every width.
  (5) **A blocked run prints its reason on event line 0** (owner: "it should
  show exercise on the event") — consecutive blocked days with nothing real
  on line 0 merge into one amber `.ev.band.blk` cell reading
  `d.blockedReason` ("Exercise week"), the hover-only title made visible for
  phones. A typed word or band breaks the run around itself; admin tap opens
  the sheet on the run's first day.
  (6) **Per-event tags** — see the events bullet below.
  Plus a latent-bug fix riding along: `readWar`'s band reader dropped any
  band on a line other than 0/1 — stale since variable event rows; it now
  accepts any integer line under `MAX_EVENT_ROWS`.
- **LEAVE WAR EVENTS grew into a tagged, ranged surface (17 Aug 26; tags
  moved ONTO the event 18 Aug 26).** The two
  event lines are now editable through the **Event sheet** (tap an event as
  admin — inline textareas are gone), which carries: open text; a **range**
  (the same RangePicker the bid window uses); **merge vs repeat** for a range
  (one spanning bar, stored as an `EventBand` on the period, or the word in
  each day); a **tag** (off day / no-leave / work); and, behind an "Edit types"
  button, the **event-type library**. **The tag rides the EVENT since 18 Aug
  26 (owner: "I don't want u to save it as a type"):** tapping a tag no longer
  mints the typed word into the library — it is sheet state saved with the
  event (`DayInfo.eventKinds[line]` / `EventBand.kind`, both read leniently by
  `readWar`; instance tag wins over the library word match everywhere —
  `columnKindFor`, the red work word, wire 4's holiday answer), and the
  library changes only inside Edit types. Tags surface ONLY as colour — the word
  is never annotated on screen — painted by `Matrix`: an off day (PH) tints its
  whole column light green, a no-leave day orange, a work word reads red (the
  column left alone). **Colours only for now (owner's call this pass):** the
  off/no-leave/work classification is stored (squadron-wide, persisted under
  the `eventdefs` key, `state.eventDefs`) but does NOT yet change the manning
  counts or raise a warning — that wiring, and PH→OIL, stay for the future
  rules pass (Wire 4). The counter-picker header ("ANNUAL") was squared off in
  the same batch — it read as a floating pill crowding the events; it is a
  contained square control now, still a full 40px tap target. Documented (Leave
  War is self-documented in code + `docs/leavewar/`, not in engine-rules /
  ui-contracts): the module comments in `engine/eventdefs.ts`,
  `ui/EventRows.tsx`, `ui/EventSheet.tsx`, and the "Event model" section of
  `docs/leavewar/known-gaps.md`.
- **LEAVE WAR COUNTER COLUMN reworked to named figures (Aug 26).** The frozen
  column no longer cycles the six entitlement counters; it cycles TWELVE named
  figures (eleven at the rework; `OIL BAL` joined with wire 4 the same day),
  each labelled `BAL` (balance left) or `USED` (days taken): LL USED, OL
  USED, OIL USED, OIL BAL, OFF USED, CCL USED, PL USED, FCL USED, MED USED, OML USED, LVE BAL, LVE
  USED. Ten are per-type consumed (`takenOf`, which splits LL from OL where the
  per-counter `drawnFrom` cannot); `MED USED` = ATT C + HL + OML, `LVE USED` =
  LL+OL+OIL+OFF+CCL+PL+FCL (medical excluded). `LVE BAL` is the annual-pool balance; `OIL BAL`
  (wire 4) is `earned by duty + granted − taken` — a negative value goes red
  on either, the paint being generic to `bal` figures. The picker sheet doubles as the
  **legend** (USED/BAL key + the two aggregates' make-up inline) and as the
  **reorder** surface (▲▼ per row + Reset; order persisted under `figorder`, a
  display preference, ungated). Medical is FOUR markers now — `ATTB` (printed
  as a bare B on the grid) / `ATTC` (printed C) / `HL` / `OML` — B joined
  17 Aug 26 and all four take AM/PM portions since the same day (a half
  counts 0.5 in MED USED; ATT B feeds no figure and removes nothing from
  manning — at work, no flying). Still assigned, not bid, but the **grid
  affordance EXISTS now**: the cell sheet's Medical row, ADMIN-only, whole
  day default with AM/PM halves; members file on the Inputs page and it
  syncs across (the medical sync bullet below). **A tap on a person's
  counter CELL opens that figure's breakdown** (17 Aug 26 — MED USED as its
  ATT C/HL/OML rows, LVE USED as its seven codes, a balance as opening +
  granted (+ earned) − taken, parts signed so they sum; `figureParts`,
  `FigureBreakdownSheet`; the column header still opens the picker).
  **Second pass the same day (owner's four follow-ups):** the figure ORDER
  is admin-gated at the write path (`moveFigure`/`resetFigureOrder` refuse a
  member; the ▲▼/Reset render for admin only — "normal user should not have
  authority to change the leave war column arrangement"); the VIEWER —
  Raptor's "View as" person, mirrored into `state.viewer` by the sync wire,
  never persisted — has their row lit (`tr.me`; the CSS must sit INSIDE
  matrix.css's `#page-leavewar` wrapper or the +1 id specificity beats it);
  the picker's rows answer with the viewer's OWN numbers ("N taken/left,
  yours"; a DASH where nobody is being viewed — owner, 18 Aug 26: "I don't
  need to see totals when no one is picked… it defaults to the account
  viewer", so the old squadron-wide fallback is gone); and ANY
  callsign tap opens `PersonFiguresSheet` — all twelve figures for that
  person, for every role, each row opening its parts breakdown, the admin's
  person EDITOR now behind that sheet's "Edit person" button. **Third pass,
  from the owner's deployed-page screenshot the same evening:** every
  sheet's header (and its ✕) is STUCK to the top of the sheet's own
  scroller now — the twelve-figure list scrolls inside the sheet on a phone
  and used to carry the close button away with it (`.bidsheet-hd`
  position:sticky, e2e-pinned). The same fix pass found BOTH LW stylesheet
  appends of this session had landed OUTSIDE their files' `#page-leavewar`
  nesting wrapper (matrix.css AND bidpicker.css are wholly scope-wrapped;
  an append after the closing brace silently loses to the wrapper's +1 id
  specificity) — all moved inside; when editing either file, insert INSIDE
  the wrapper. **Fourth pass (owner: "I think it's cause by having 2
  scrolls… on the phone"): ONE scroll while a sheet is up.** The page
  behind an open Leave War sheet is LOCKED (`body.lw-sheet-lock`,
  overflow:hidden, added/removed by Sheet.tsx with a lock counter — the
  offset survives, same technique and same iOS caveat as Raptor's
  `body.sb-lock`), the scrim refuses touch (`touch-action:none`), and the
  sheet's own scroller carries `overscroll-behavior:contain`. The lock is
  what covers a sheet that FITS the screen — containment alone does
  nothing on a scroller with no overflow, which is how the desktop wheel
  fell straight through to the page during the build. The body rule sits
  DELIBERATELY OUTSIDE bidpicker.css's `#page-leavewar` wrapper (no scoped
  selector can reach `body`; the class is `lw-`-namespaced instead).
  E2e-pinned: wheel over a bottomed-out sheet moves the page zero pixels,
  the body locks while open and unlocks with position intact on close.
  Also fixed in the same pass: the date-header cells were rounded by a leak of
  Raptor's global `.day{border-radius}` onto Leave War's `className="day"` header
  cells — overridden square in the scoped `matrix.css`. Full detail in
  `docs/leavewar/known-gaps.md` §The counter column is figures.
  **COUNTER-SHEET DISMISS + TAP HINT (18 Aug 26).** The counter sheet used
  `max-height: calc(100vh - 28px)`; on iOS Safari `100vh` counts the space
  behind the URL bar, so a tall sheet grew off the top of the screen and took
  its sticky ✕ with it (owner: "I always can't scroll past the top to the cross
  button"). Now `100dvh` (the VISIBLE viewport, plain-`vh` fallback) with a
  wider top margin so there is scrim to tap OUTSIDE too — `bidpicker.css`
  `.bidsheet`. The headless e2e can't reproduce it (no URL bar, `100vh===100dvh`)
  but the existing "scrolled sheet keeps its ✕" test still pins the ✕ in-viewport.
  Plus a small tap-hint finger under the counter-column dots (`.ctap` in
  `Matrix.tsx`/`matrix.css`) — the whole header has been the control since the
  arrows were pulled, but a phone had nothing saying so.
- **LEAVE WAR MANNING ROWS — FL P / WM P + admin arrange/hide (18 Aug 26).**
  Two new count rows split the pilots by CAT: **FL P** (flight-lead pilot — CAT
  B and above, instructor pilots included, owner's call) and **WM P** (wingman —
  CAT C and below), together every pilot. `engine/people.ts:pilotLead` is the
  classifier and the ONE manning path that reads the CAT (`q`) — the owner's
  rule is CAT-defined, so it cannot come from band like `categoryOf`; an ops
  pilot with no CAT falls back to wingman so the split stays total, and on the
  live re-keyed roster every pilot carries a real CAT. Wired through
  `availability.ts` (`flp`/`wmp` in `DayCounts`), a new `flp`/`wmp` `RuleTarget`
  kind, `evaluate.ts:haveFor`, and two `seed.ts` rules at **amber 0 / red 0 —
  DISPLAY-ONLY** (a count is never below zero, so they never paint a day amber
  or red; give them real thresholds the day the squadron wants a floor). The
  manning count rows are now **admin-arrangeable and hideable** (owner: "allow
  me to rearrange or hide some rows… admin only"): `store.ts` `manningOrder`/
  `manningHidden` (persisted `manningorder`/`manninghidden`, admin-gated
  `moveManningRow`/`toggleManningRow`/`resetManning`, the `figureOrder`
  precedent), the controls drawn in the row's blank balance cell by
  `ui/CountRows.tsx` under the SAME Rearrange toggle as the roster. Display-only
  — `manning`/`categoryOf`/thresholds untouched, so reference parity and the
  counts are unmoved. Deliberately scoped to the COUNT rows: the EVENT rows are
  functional inputs and stay. Tests: `availability.test.ts` (FL/WM split),
  `roster.test.ts` (manning writers, admin gate), `counts.test.tsx` (hide/arrange
  rendering).
- **LEAVE WAR — POST OUT (PO) + VARIABLE EVENT ROWS (18 Aug 26; PO REWORKED
  19 Aug 26 — any date, the archive switch, the month-window roster).** **PO**:
  an admin taps a person's day → the bid sheet folds the PO controls behind ONE
  "Post out (PO)…" button (owner: "show this toggle when the admin clicks PO");
  expanded, it offers a date (seeded with the tapped day, but ANY real date is
  legal — past, future, outside the war: `setPostOut` refuses only a malformed
  string, per the guard-rails line), the **"Archive on PO date" switch (ON by
  default; off = the owner's "custom" case)**, and a confirm. The store writes
  `to = fromDate−1` plus an EXPLICIT `poArchive` true/false (`Person.poArchive`);
  everything from the PO date greys with the `.gone` hatch and leaves every
  manning count exactly as before (the hatch/exclusion still key off `to`).
  Tapping a struck day (admin) opens `PostOutSheet`, which now MANAGES the
  posting — move the date, flip the archive switch, or Undo (`setPostOut(id,
  null)` clears the flag too). **The person's LAST day in wears a small amber
  `PO` corner tag** (`.polast`, `matrix.css`) — chosen by the owner after the
  edge case was put to him: a PO on the 1st of a month otherwise shows NOTHING
  (the final month looks normal, the next month the row is gone). **The roster
  is month-windowed now (owner: "once I hit the next month… the row
  disappears")**: `Matrix` measures the visible month window off the existing
  month-strip spans and hides a row whose `[from,to]` misses every month on
  screen — month granularity so scrolling inside a month never reshuffles rows;
  jsdom (no layout) shows everyone, the e2e pins the hiding. THE TRAP THIS DUG
  UP: removing a row lets the table's auto layout re-narrow every column that
  row's chips widened, yanking the grid sideways and landing month jumps ~165px
  short — so a row-set change captures the first VISIBLE day column and a
  layout effect puts it back after the repaint (`anchorRef` in Matrix.tsx; the
  phone mirror re-measures on the same signal). Re-renders fire only when the
  visible ROW SET changes (a signature compare), which is what keeps the
  scroll-responsiveness e2e honest. **THE ROW-WINDOW CHANGE IS DEFERRED TO
  SCROLL REST (19 Aug 26, owner: the scroll "stops" at the month a row leaves).**
  That `anchorRef` correction WRITES `scrollLeft`, and writing scrollLeft
  mid-fling kills a touch scroll's native momentum dead — so the month-strip
  readout (`inView`, `measureStrip`) still runs LIVE on every scroll event, but
  the roster reflow (`visWindow`, `measureWindow` — the only thing that repaints
  the grid and moves scrollLeft) is debounced ~120ms and fires only once the
  scroll comes to rest, where the grid is still and moving scrollLeft is
  invisible. A fling keeps its native deceleration; the row updates the instant
  you stop. Pinned by "the roster does not reflow mid-scroll" in
  leavewar.spec.ts. Not verifiable here for the momentum itself (headless
  Chromium has no kinetic scroll) — the e2e proves the deferral, a real phone
  proves the smoothness. **AUTO-ARCHIVE (`sync.ts:runPoArchive`)**:
  when the PO date arrives (real clock, local — "on that live date itself"), a
  `poArchive === true` person's Raptor body gets `archived = true` — nothing
  else: pucks on past/published schedules render from slot values and stay
  untouched. The demo's seeded window (IGNITE) carries NO flag, so the pass
  never reads an un-asked `to` as consent. `reprojectRoster` now KEEPS an
  archived body that has a posting-out window (identity frozen) so past months
  still show their history — a body archived WITHOUT a window still leaves at
  once, the old behaviour. **QUALS grew an Archived drawer** (`QualsPage.tsx`
  `#qArchive`, below the table, folded to a count): every archived non-sentinel
  body, with an admin-only **Restore** that goes through
  `sync.ts:restoreArchivedPerson` — clears the Leave War PO FIRST (or the next
  pass would re-archive) then un-archives; quals/CAT/initials were never
  touched, so they come back as they left ("they can be re-added easily").
  Tests: `po.test.tsx` (8), `poarchive.test.ts` (6), `roster.test.ts` (keep
  rule + flag preserve), `quals.test.tsx` (drawer + restore), e2e ×2 (the PO
  flow + the seeded IGNITE row-hide). **Variable event rows**: `DayInfo.events` is a
  `string[]` now (was a 2-tuple) and `EventBand.line` a plain index; a squadron
  can have 2–`MAX_EVENT_ROWS` (6) rows via `store.ts` `eventRows` (persisted
  `eventrows`; admin `addEventRow`/`removeEventRow`, the add/remove buttons in
  the Rearrange toolbar, remove refused while the last row carries anything).
  `EventRows.tsx` draws `eventRows` lines; `dayEvent(day, line)` is the one
  bounds-checked reader; `columnKindFor` scans EVERY line now. Old wars (length-2
  arrays) load unchanged; the store reads `events.length >= 2`. Tests:
  `po.test.tsx`, `events.test.tsx` (+3), `store.test.ts` (+2 event-row writers).
- **LEAVE WAR is merged as the sixth tab (16 Aug 26) and ALL FIVE SYNC WIRES
  are BUILT (wires 0–3 on 17 Aug 26; WIRE 4 later the same day; WIRE 5 —
  MEDICAL — the same day again: the four markers ATT B/ATT C/HL/OML cross
  both ways on wires 1+2's own machinery, an input landing as a read-only
  raptor-owned cell with the owner's ≤6h-custom-window-is-a-half rule
  (`medRowPortion` — AM/PM exact, midpoint decides a straddler; leave keeps
  round-OUT), an admin-marked grid cell landing as an lw-tagged input with
  no approval step, spec §Wire 5)** — one
  roster (boot projection of `PEOPLE`), approved-leave ⇄ schedule-input both
  ways, counters drawing down (derived, so the wire IS the decrement), the
  clash strip, and now **weekend/public-holiday duty auto-crediting OIL**:
  publishing a non-working day (weekend by date; holiday = Leave War's
  `DayInfo.ph` OR an event word tagged 'off day' — the owner's own PH input
  path) lands each duty-stander a raptor-owned FS/HS cell and moves the new
  OIL BAL figure. SC AM/PM shift = half, more = full; other duty rows by
  summed written hours vs `VCONF.oilFullMin` (361, Logic-page editable, the
  owner's "6 hours 1 min or more" — exactly 6h is a half); SC spares and time-less rows earn nothing; leave
  wins a contested cell and the duty credit reads as a `kind:'duty'` clash
  on the strip. Rules in `docs/engine-rules.md` §Weekend/PH duty earns OIL;
  the five build-time divergences from the design sketch (derived credit
  not cell+ledger, reconciler pass not publish hook, the event-'off' half,
  the SC/duty split, the vocabulary partition) are argued at the top of
  `raptor-port/docs/superpowers/specs/leavewar-sync.md`. **What wire 4
  deliberately leaves open**: it reads duties for the LOADED WEEK only (the
  one-dataset bullet below — more weeks fix it for free); the demo seed
  publishes nothing at boot, so on the demo data a credit appears only
  after a scheduler actually signs and publishes a weekend day (by design —
  publishing is the squadron's word); and on reload the earned credit resets
  with the rest of the session — see the resolved asymmetry bullet next.
  **RESOLVED — the session asymmetry is gone; Leave War is session-only now,
  matching Raptor (17 Aug 26, owner: "I'm ok that it resets every session… I
  will make it eventually work with database").** Leave War's store boots on a
  memory backend (`main.tsx` passes `memoryBackend()` to `lwInitStore`), so a
  reload forgets the whole war and returns to the seed exactly as Raptor's own
  `INPUTS` do. Before this the two halves disagreed across a reload — Raptor
  reset while Leave War persisted — so a synced leave cell would reverse-clear
  or reappear at the next boot; now both forget in lockstep and nothing
  lingers on one side. The storage seam (`leavewar/state/storage.ts`,
  `localBackend` still present) is where the shared database backend plugs in
  when real multi-device data arrives; until then, memory, and reset-per-
  session is the deliberate behaviour, not a bug. Every boot is now a fresh
  one, so `installDemoWorld` always takes the re-key path (`main.tsx` passes
  `false`). Pinned by an e2e test (`leavewar.spec.ts` — a placed bid does not
  survive a reload). **RESOLVED — editing/deleting an lw-tagged input on the
  Inputs page carries back into the war now (17 Aug 26, owner: "make sure both
  leave war and input, edits or deletes are sync"; FULL two-way chosen over
  blocking, members included for their own rows).** The snap-back is gone:
  `commitInputEdit`/`removeInput` (the two write paths every Inputs editor
  funnels through) call `retractLwRow` (`leavewar/sync.ts` — a Raptor-side
  caller of the EXISTING seam, not a fifth one), which withdraws the war
  cells the row derived from via the new `withdrawLeaveCell` (the mirror of
  `clearRaptorCell` for the other ownership: exact-notation match, never a
  Raptor-owned cell, gates bypassed because Raptor's word arrives decided).
  A DELETE leaves nothing on either side; an EDIT THAT CHANGES THE LEAVE
  ITSELF (person, type, dates or which half) also drops the row's `lw`
  tag, so inbound lands the edited shape as Raptor-owned cells — the same
  path a leave filed on the Inputs page has always taken ("Raptor owns what
  Raptor last wrote"). A cell the squadron has since REBID differently is
  deliberately left alone (notation mismatch — the reconcile judges it).
  **REFINED 18 Aug 26 — a REMARKS-ONLY edit no longer seizes the leave**
  (owner: a member adds where they are going for an OL; "remarks don't change
  leave war because leave war don't show remarks"): `commitInputEdit` keeps
  the `lw` tag when the row's sync signature (`sync.ts:rowSig` — person, type,
  portion, start, end, exported for exactly this) is unchanged, so Leave War
  keeps the leave (as an approved BID, not converted to Raptor-owned) and the
  next reconcile MATCHES the row rather than re-minting it, preserving the
  refined remark (remarks are not in the signature). And when the leave's
  DATES change (an admin extends it in Leave War), outbound carries the
  member's detail across the remove-and-mint keyed on person|type|portion, so
  "till 13 Jul Bangkok" becomes "till 18 Jul Bangkok" — only the date token
  moves (`withRemarksTail`, `engine/inputs.ts`, matched anywhere in the remark,
  not anchored to the end; the same helper the Inputs calendar's tail uses).
  Ten tests in
  `sync.test.ts` §two-way. KNOWN CAVEAT, by construction: an
  UNDO after such an edit/delete does not resurrect the leave — the restored
  lw row no longer matches any approved cells, so the next reconcile splices
  it as stale; re-file the leave instead. The **year matrix (~50 rows by
  default since SANS left the roster on 18 Aug 26 — 61 with the Show-SANS
  switch on; ~28k nodes with the categorised roster's ground crew and group
  headings)** is outside the perf gate (its own e2e DOM
  band, raised to 29000 measured-first, is its guard); phone
  scroll measured ~100ms, fine today. The vendored app's own limitations
  travel in `raptor-port/docs/leavewar/known-gaps.md` (read its merge
  preamble — stale-about-Raptor claims, superseded role toggle).**
- **LEAVE WAR — QUALS IDENTITY PROPAGATES LIVE + SANS HIDDEN WITH AN ENABLE
  SWITCH (18 Aug 26, owner: an IR marked SXO "doesn't appear in the leave war
  as SXO", and "we will not show the SANS in the leave war however there is a
  function to still enable this").** Three fixes of one shape plus the switch:
  the Quals SXO tick now writes the RAW `p.sxo` the projection reads (the same
  one-way-copy trap the SANS tick had — `QualsPage.tsx`, beside the `san`
  wire-through); `reprojectRoster` (`sync.ts`) refreshes every kept person's
  IDENTITY from Raptor's projection on each notify — SXO, CAT, seat, callsign
  all propagate now — preserving only what Leave War owns locally: posting-out
  (`from`/`to`) and a deliberate in-app `setPerson` edit, recorded in the
  session-only `personEdits` registry; and ARCHIVED bodies are excluded from
  the projection (a body archived on Quals leaves Leave War on the next
  notify). **SANS aircrew are OFF the roster by default** — they offer
  availability rather than being planned as manning, so they neither ride the
  grid nor count in its manning rows — and **the enable function is
  `setShowSans`** (`state/store.ts`, admin-gated, persisted `showsans`,
  surfaced as the "Show SANS" button in the matrix's Rearrange toolbar; the
  flip re-projects at once via the sync's own Leave War subscription). The
  demo re-key moved `slammed` off vinci (SANS) onto pike so no demo cell keys
  onto a hidden body, and a test guards `DEMO_MAP` against SANS targets.
  Tests: `roster.test.ts` (propagation, PO-survives-rewrite, archive, the
  switch both ways + its member refusal), `raptorRoster.test.ts` (default
  exclusion / includeSans / demo-map guard), `quals.test.tsx` (the raw-flag
  tick), `events.test.tsx` (the toolbar control's gate).
- **LEAVE WAR — CATEGORISED ROSTER + HEADER TRIM (18 Aug 26, owner: "fix how
  the top of the leave war looks… 142 is repeated… categorise the personnel
  into SXO, IP, OPS P, IWSO, OPS W, OCU, Personnel").** The page's own
  "142 SQN / LEAVE WAR" mark and "Leave war" nav pill are DELETED (Raptor's
  shell already carries the identity and the active tab) — the header is one
  slim control strip now. The roster draws in seven colour-coded groups
  (`engine/people.ts:groupOf`/`GROUP_ORDER`), ops crew split by CAT A→D on
  desktop (sub-headings fold away under 700px — the owner's "just colour code
  it on mobile"), OCU and ground crew their own groups. Colours reuse Raptor's
  `--q-*` CAT palette (A red, B amber, C cyan, D blue, OCU purple, IP/IWSO
  violet), SXO gold, Personnel white — so a callsign's colour means the same
  here and on Quals. **Ground crew now ride the roster** (`projectPeople`
  includes `pers`, seat `gnd`, a free-text `label` seeded from Raptor's
  `flight`), EXCLUDED from every aircrew manning count (`countsFor` skips
  `pers` first — the one line that keeps SXO/IP/set thresholds reading the
  same squadron). An admin **Auto-sort** re-groups (`autoSortRoster` →
  `autoOrder`); a **Rearrange** toggle turns on pointer-drag handles
  (`moveRosterRow`, works touch + mouse — HTML5 DnD does nothing on a phone);
  personnel labels are editable there (`setPersLabel`). Order and labels are
  admin-gated and keyed by id (`rosterOrder`/`persLabels`, the figureOrder
  precedent), so they survive a roster that gains or loses a body. **The
  roster stays LIVE**: `sync.ts:reprojectRoster` re-projects on every Raptor
  notify (change-guarded), so a personnel body added on the Quals page appears
  in Leave War without a reload (owner's explicit ask). `manning`/`categoryOf`
  are UNTOUCHED — the grouping is a display layer; an OCU still counts as ops
  for a threshold, it is merely shown apart. Tests: `roster.test.ts` (15),
  extended `raptorRoster`/`matrix`/`person` suites, e2e roster block. KNOWN:
  pointer-drag is desktop-verified live; on a phone the primary path is
  Auto-sort (drag works but is fiddly on a 76px frozen column). The
  standalone-app critique is in `raptor-port/.impeccable/critique/`.
  **DESKTOP IS "AN EXTENDED MOBILE" (owner, 18 Aug 26 — "make it similar to the
  mobile… I don't like the days to be so wide… the counter is extended"):** the
  desktop uses the phone's compact columns, not its own wide ones — day cells
  ~33px (`--who-w:92`, `--bal-w:72` on desktop; the phone stays 76/44), so far
  more of the year is on screen and the COUNTER column is the one thing widened.
  Set in `matrix.css`'s base `&` block + the ≤430px override; day cells narrowed
  by trimming `.mx td` padding and the `.c` min-width.
  **ROSTER-AUDIT + BUG-SWEEP FIXES folded in (18 Aug 26 — the owner's "full bug
  sweep of the most recent 20 features"):** (1) `reprojectRoster` is now
  additions/removals-only so it no longer reverts an in-session `setPerson`
  edit; (2) pointer-drag has a `pointercancel` + unmount teardown (no stuck
  highlight / leaked window listeners); (3) `displayRoster` is always grouped so
  a cross-group drag reorders within a group instead of duplicating a heading;
  (4) rearrange mode resets when the role drops from admin; (5) the event-type
  editor keys rows by name (`EventSheet.tsx`) so a mid-list delete cannot
  silently rename the wrong type; (6) `runInbound` merges two same-type half
  inputs on one day into a full day and clashes an un-representable pair instead
  of silently dropping the second (was under-drawing / losing half a day —
  `sync.test.ts`); (7) `dutyTplLoad` pre-scans `SEQ` so an id-less entry can't
  mint a `uN` a later entry claims; (8) the DEBRIEF advisory prints the
  configured `VCONF.debrief` pad, not a hard-coded "2h"; (9) the counter-picker
  no longer shows a squadron-wide total at all — where nobody is being viewed a
  row reads a DASH, not a sum (owner, 18 Aug 26: "I don't need to see totals
  when no one is picked… it defaults to the account viewer"), which also
  retired the same-day ground-crew-exclusion tweak a squadron sum had needed
  (`CounterSheet.tsx`, `counters.test.tsx`; per-person figures still show for
  everyone, ground crew included).** The owner actioned the two
  mobile items (frozen Quals callsign, collapsible legend) and the "click any
  blank area to deselect" bug. **The P0 keyboard bug is now CLOSED (15 Aug 26):**
  the five top-nav items and the phone drawer's nav were hrefless `<a>`s a
  keyboard user could not Tab to; they carry `role="button"`, `tabIndex=0` and
  an Enter/Space `onKeyDown` now (`Shell.tsx` `navKey`, `Drawer.tsx`). The tag
  stays `<a>` on purpose — ~15 tests, `probe-bridge.ts` and the `.nav a`
  stylesheet all key off it — so the fix is behaviour, not markup; pinned in
  `app.test.tsx`. **The P1 is now HALF actioned (owner, 16 Aug 26,
  after seeing before/after comps):** the **CAT badge contrast** is FIXED — the
  four white-text ladder fills were deepened one shade to clear 4.5:1 (A
  `#F0555F`→`#CA4750`, D `#3B7DF0`→`#3673DD`, OCU `#8A6ED0`→`#7F65BF`, instr
  `#A64DE8`→`#9F4ADF`; C and B keep pale fills, they carry dark text and already
  pass). The value lives in THREE places kept in lockstep — `engine/people.ts`
  `QCOLOR` (the Quals `qmini`), `scheduler.css` `--q-*` (the puck `.role` chips
  and legend swatches), and `refwin.ts`'s remap (so the reference renders the
  same colours and parity holds); a contrast test in `quals.test.tsx` pins the
  4.5:1 floor. **The CP-flag half was DECLINED (owner, 16 Aug 26 — "do not fix
  the CP"):** the amber-vs-red "CP"/"CPH" safety distinction stays colour-only;
  the shape/glyph idea (CP? / CP✕) was comped and rejected — do not re-propose
  it. SANS (`--san`) was out of scope (not a CAT, and not a white-text badge in
  the app). **A frozen-column bleed was also fixed (owner, 16 Aug 26):** on the
  Quals table, scrolling sideways showed a wide CAT badge (OCU/instructor)
  emerging right against the frozen callsign column, reading as a bleed — a
  cell's own `box-shadow` does NOT paint over sibling cells under
  `border-collapse:collapse`, so the fix is a `::after` seal (a child of the
  z-index:1 sticky cell, which DOES paint above the z-0 scrolling cells),
  gated on a `.xscroll` class QualsPage toggles only while scrolled (unscrolled
  it would dim the next column's leading edge). Pinned in `quals.test.tsx`; the
  paint itself is eye-verified (jsdom cannot). Also open: the owner's own
  **"make the Insights panel consistent"** question (see
  `docs/session-state.md`). His **Quals add-person layout** question is now
  CLOSED (owner, 15 Aug 26): the Pilots/WSOs/Personnel/All filter left the top
  toolbar for a segmented control (`.segview`) in a new `.qtablehead` strip
  directly above the table, and the Add-person form folds behind a "+ Add
  person" toggle (`showAdd` in `QualsPage.tsx`); Enable editing and Export
  stayed in the toolbar at the owner's word. The four seat buttons keep their
  `#qViewP/W/G/A` ids, so every caller and test is unchanged; pinned in
  `quals.test.tsx`. The "Throw pucks (auto)" dead
  button is a known deliberate stub (one dataset bullet below), flagged by the
  review but not new.
- **The week-chrome blank-click deselect was widened again (15 Aug 26).** PR
  #220 took the blank-click "clear the selection" scope to the whole `#shell`;
  the owner then reported (phone) that tapping the blank right-hand side of the
  DRAFT banner, the day header or the sign-off strip on the Edit Schedule week
  still didn't clear. Those three layout containers (`.schedbanner`,
  `.day-head`, `.signoff`) were excluded as whole blocks, so their empty width
  was dead zone; they left the exclusion list and their real controls are
  protected on their own (`interactions.ts`, pinned in `interact.test.tsx`).
  The board is untouched — its sign-off sits inside `.sb-sign` and its bar
  inside `.sb-top`, both still excluded.
- **THE PUBLISH/DRAFTS CLARITY REWORK shipped (15 Aug 26, second batch of
  the day)** — the view page's issued default (`dayIssuedHTML` + `VWORK` +
  `viewVerSelHTML`, contracts in `docs/ui-contracts.md` §the view-only
  week's picker), the published-day draft switch with the pending rebase
  (`engine/drafts.ts:rebaseDayPending`, rules in `docs/engine-rules.md`
  §Drafts), and the draft-preview/working stamps. Deliberately open, so
  none of it is read back as a bug:
  - **The issued face shows NO warnings list** — warnings are live-model
    state and a snapshot is never validated (the standing preview rule);
    the ⓘ panel stays the viewer's live route. A viewer comparing Monday
    (published, quiet) with Tuesday (live, warning box) is seeing design,
    not a fault.
  - **The week banner's "N unpublished edits" counts a divergent draft's
    rebased diff**, on the viewer-facing banner too — honest, but a big
    alternative can read alarming. Noted in ui-contracts; no damping built.
  - **Export-to-Excel exports the live model** — the working copy, not the
    issued document. Pre-existing semantics, newly reachable now a
    divergent draft can be live on a published day.
  - **`VWORK` is session view state** — a viewer's issued/working choice
    resets on login/logout like every other view choice; the issued
    default is the zero-state, which is the point.
  - **RESOLVED — the version cluster was redesigned (owner, 16 Aug 26, "I
    feel confused").** The single mixed dropdown split into two labelled
    groups — **Your plans** (drafts; the live one publishes) and **Issued ·
    read-only** (Original/ALn, frozen) — so a plan can never read as a document
    already sent out. A persistent **Live-copy** button sits in the cluster: a
    green "you are here" on the working copy, an active **← Back to live copy**
    while previewing (data-golive). **"Restore this version" → "Load onto
    working copy"**, and its meaning changed with it (owner, 16 Aug 26 — "the
    view only schedule should still see AL1, it shouldn't go to Original without
    me publishing"): it is **no longer the instant rollback**. `data-restore` now
    calls `loadVersionToWorkingCopy` (`engine/drafts.ts`), which installs the
    version's content on the working copy and rebases the pending set as the diff
    vs the STILL-ISSUED document — deliberately NOT touching `SCHED.cur`, so
    viewers keep seeing the issued AL until a new AL is published. A **draft**
    preview offers **"Switch to this plan"** (data-draftgo → `draftSelect`), now
    the same shape. Loading replaces the working-copy edits, so with any pending
    it takes a confirming second tap (`RESTARM`, "Discard N edits — confirm" /
    "Keep editing"). `restoreDayVersion` stays in `engine/restore.ts` for
    probe-bridge only; nothing in the app calls it now.
    **The published stamp names the issued version** — "✓ Published · ORIG /
    · AL1", the version as its coloured `.dal` tag INSIDE the beak, always
    (replaces the old standalone chip that hid ORIG when un-amended; `dayStatHTML`).
    **An undone edit clears its own mark** — `reconcileIssuedMarks` runs from
    `afterSchedMutate` after the write and drops any pending FIELD key whose live
    value again matches the issued snapshot (restoring its AL tint); a pending
    mark now means "differs from what's issued", not "was touched". It only ever
    REMOVES a stale mark. **Hardened 16 Aug 26** (owner: "swap the pucks and
    swap it back… it shouldn't register"): a pending key in NEITHER document is
    dropped too (a drop onto an occupied row transits an overflow address the
    issued day never had), and `dayKeys` folds person (id vs callsign) and time
    (`0700` vs `07:00`) spellings to one canonical form before comparing —
    contract in `docs/ui-contracts.md`, seam in `docs/feature-impact.md`. A **"Publishes: <plan>"** chip names the live plan.
    Both surfaces in lockstep: `html.ts` `verSelHTML`/`pvBar`/`dayStatHTML`, board
    mirror in `SchedBoard.tsx`. Pinned in `drafts.test.tsx` (load + reconcile) /
    `draftsui.test.tsx` / `editweek.test.tsx` / `editlog-writers.test.tsx`;
    `docs/ui-contracts.md` §The version cluster.
- **WHOLE-DAY TEMPLATES AND PER-DAY DRAFTS shipped (15 Aug 26)** —
  `engine/daytpl.ts` / `engine/drafts.ts`, `DayTplModal.tsx` /
  `DraftsModal.tsx`, one Templates/Drafts button pair reached from both the
  board's own content and the week's sign-off strip (`docs/engine-rules.md`
  §Day templates, §Drafts; `docs/ui-contracts.md` §Day templates and
  Drafts). What is deliberately left open:
  - **A template captures STRUCTURE, never crew** — `tplFromDay` blanks
    every person reference, the same precedent `blockFromTpl` (duty
    templates, 13 Aug 26) already set; a scheduler still crews the day by
    hand after applying one. A sim row's `pax` list blanks to EMPTY, not to
    a placeholder — there is no "still needs someone" marker on a sim seat
    the way a flying seat's placeholder gives one.
  - **Applying a template still refuses a published day, by design** —
    "Reopen the day first": a template apply has no rebase, so a whole-day
    swap under an issued document would diverge silently with no AL trail.
    **Drafts no longer share that refusal (15 Aug 26)** — switching a draft
    on a published day rebases the day's pending set as the diff against
    the issued snapshot (`rebaseDayPending`, `docs/engine-rules.md`
    §Drafts), which closes the very hole the refusal existed for. If the
    template flow is ever wanted on published days too, the rebase is the
    piece to reuse — do not just drop the guard.
  - **Applying a template on a REOPENED (previously-published) day no longer
    leaves stale AL tints (fixed, bug-test sweep 15 Aug 26).** `applyDayTpl`
    now clears the day's `SCHED.changes` slice alongside pending/added, the
    same three-slice wipe `restoreDayVersion` does — before this, a template
    swap (which marks nothing pending) left every AL colour the day wore
    before it was reopened stuck onto the template's brand-new rows. Rules:
    `docs/engine-rules.md` §Day templates; pinned in `daytpl.test.ts`.
  - **Re-publishing a REOPENED day now refreshes what viewers see (fixed,
    owner 15 Aug 26).** Before: reopen a published day, change it by ANY
    means (a hand edit or a template), sign, Publish day — `setDayApproved`
    re-approved but never refreshed the version's frozen snapshot, so the
    view page's issued default (`dayIssuedHTML` → `daySnapOf(dayCurVer)`)
    kept showing the pre-reopen document while the scheduler's live view had
    moved on, with no pending marker to flag the split (a plain note edit did
    it as much as a template swap). Now `setDayApproved`'s re-publish branch
    calls `reissueReopened`, which re-issues the CURRENT version in place —
    refreshing the snapshot `dayCurVer` resolves to, so the issued view
    catches up. The version LABEL is unchanged (no surprise AL number). This
    revises the old "first-publish-wins, never restamp the Original" rule for
    the reopen case only: a never-amended day re-issues its Original, an
    amended day re-issues its current AL; the ORDINARY amendment flow (edit a
    published day, Publish AL — no reopen) still freezes the Original the
    moment it is first issued. Rules: `docs/engine-rules.md` §Version
    snapshots / restore; pinned in `publish.test.ts`.
  - **Templates, drafts, and the SANS demo seed below are session /
    localStorage-only, like everything else this app persists that way** —
    see the "No shared data" bullet further down.
- **FEEDBACK: press states, snap-to-new-input, the steady flash shipped
  (15 Aug 26)** — one grouped `:active` rule covers every button class in
  `scheduler.css` (`docs/ui-contracts.md` §Feedback: every tap answers).
  **The press-state CSS itself is UNTESTABLE in jsdom** (no layout engine,
  no `:active` simulation worth trusting) and is gated only by eye on the
  live bundle plus `e2e/geometry.spec.ts`'s existing checks — there is no
  vitest assertion that a button actually darkens or settles on tap, and
  none is planned; do not read the green unit-test gate as proof of this
  feature. The Export-to-Excel button on the Shell topbar now toasts
  "CSV downloaded" on every export, matching the Inputs/Quals pages' own
  exports from the same batch.
- **SANS AVAILABILITY shipped (14 Aug 26) and was REWORKED the same day on
  the owner's phone feedback** — ONE window on the standard All day / AM /
  PM / Custom template (the per-event Fly/AMT/OFT time pairs are deleted;
  they could not be cleared on a phone), `sans` is flags-only, record-less
  SANS are struck on the palette by default, the week/board draw one shared
  card grid (click a card to edit in the dialog), and the Available-crew
  panel's SANS tail is gone — its folded count reads "N SANS offering"
  (`docs/engine-rules.md` §SANS availability, `docs/ui-contracts.md` §SANS
  Availability, on screen). Things worth restating so they are not read as
  bugs: the `SANS_AVAIL` advisory is DELIBERATELY silent when nothing is
  filed at all — the palette strike + toast still say so, but nothing
  persists in the day's warning list (the seed-parity reasoning is in
  `engine-rules.md`); a filed record is session-only, like every input in
  this app; filing one late earns the LATE badge like any leave input
  (downchits stay the only exemption); the restriction to SANS aircrew
  STAYS (owner reconfirmed at the rework: "only SANS can input the
  availability") and is enforced at every editor's commit (`sansRefusal`),
  not in the type dropdown; and the week card grid deliberately dropped the
  in-place time/remarks cells — they were DEAD for SANS under the old
  force-allday override anyway, and the dialog a card opens carries every
  field. The activity type `Fly` is `Fly with` now (owner, same batch) —
  `isFly`'s regex moved with it, and the reference needed no patch because
  its `^Fly$` regexes not matching IS the shared commitment semantics.
- **The CREW-FINDING build (13 Aug 26) shipped four pieces and left two
  REPORTED-NOT-BUILT options beside one deliberately dropped shape.** Shipped
  (contracts in `docs/ui-contracts.md` §Drag / arm-and-plant, §Selection
  highlight, §The Available-crew panel folds): a palette tap always plants
  with the reason toasted after (drag and tap agree now — the owner's
  "everything plants, warning after"); a placeholder-filled slot arms like an
  empty one; a selected person's takeable slots ring green (empty bright,
  filled dimmed — `slotBar` itself is the judge, see
  `docs/feature-impact.md`); and the Available-crew panel boots folded with
  honest wave counts. What was NOT built:
  - **The second-tap replace flow** (tap a selected person again on his seat
    to arm it) was designed, comped, and then DROPPED at the owner's own
    question ("is the 2nd tap excessive?") before build. The fallout flow is:
    delete the person and click the emptied seat, click a placeholder, or
    drag the replacement straight onto the seat. **Do not rebuild it
    unasked.**
  - **A "find replacement" button on a warning row** (e.g. LEAVE_FLY on a
    planned man, jumping straight to the armed picker) — reported as the
    future option if the owner ever wants a more visible entry point; it
    only covers seats that currently warn, which is why it was not the
    primary shape.
- **GUARD RAILS ON MALFORMED INPUT (owner, 12 Aug 26) — the line, and what is
  deliberately still open.** Four surveys swept every typed field. The rule
  applied: refuse MALFORMED data (not the kind of value the field holds, or
  outside the range that kind can take), warn about DECISIONS (a clash, an
  overnight absence, a late input). Refusals live at the WRITE path, where
  every caller already reverts its own cell on a false return; `parseHM` stays
  the loose shared reader and `hmOK` (`time.ts`) asks the range question
  beside it. Rules: `docs/engine-rules.md`, the brief and availability
  sections. **The DUTY-TEMPLATE editor was a surface this 12 Aug sweep
  predated** (templates shipped 13 Aug) and it went unguarded until the owner
  found it 16 Aug 26 — its start/end cells took `2500`. Now closed to the same
  line: the editor refuses a malformed time on commit (toast + revert,
  `ui/DutyTplModal.tsx`), and `tplTime` (`engine/dutytpl.ts`) is the silent net
  at `blockFromTpl` and `dutyTplLoad` so a stale value never mints into a day.
  Rules: `docs/engine-rules.md` §duty block; pinned in `dutytpl.test.ts` and
  `DutyTplModal.test.tsx`. **A NEW typed field on a surface added after 12 Aug
  wants this same check — the sweep cannot cover what did not exist yet.** What
  the original sweep left ALONE, on purpose:
  - **Long free text on the WEEK's prose cells** (flight remarks, day notes,
    area) can still run a row to ~2000px. They are `contenteditable`, which
    ignores `maxlength`, so the only guards available are truncating a paste
    or refusing one — both worse than the disease. The board draws the same
    fields as `<input>`s and stays 50px, so a value can look fine there and
    tall on the week. Layout only; no gate is tripped.
  - **A wave label typed long on the week** becomes an `<option>` in the
    board's title `<select>` and can run past the panel (measured 2638px in a
    930px box). Recovery is picking any real title. Same class as above.
  - **Deleting the last in-time** removes the whole in-times block from the
    DOM with no control to add one back — undo restores it, which is the
    mitigation. The render is gated on `intimes.length`; ungating it is a
    render change with geometry consequences, so it was not done blind.
  - **`ruleParse` stays loose** — `6 monkeys` reads as 6, `0770` as 08:10 —
    because every accepted value is echoed back FORMATTED in the field and the
    toast, so the user sees exactly what was taken.

- **The phone week's programme NAME column is sized against its own longest
  word, and that is a measured number, not a preference** (12 Aug 26). NAME
  and PEOPLE were both `1fr` and split the row evenly at 97px, while the
  widest people cell in the whole week uses 76px of its 97 — so 21px sat idle
  beside a name column too narrow for its text, and `STANDARDISATION` (104px)
  broke as `STANDARDISATIO / N MEETING`, which reads as a typo. PEOPLE is
  pinned to one puck + 8px now and NAME takes the rest (111px measured).
  **A longer word than 104px would break mid-word again** — the guard is
  `hyphens:auto` (added the same day on the prose cells), which makes such a
  break carry a visible hyphen instead. **That guard is UNVERIFIED here and
  deliberately so**: this container's Chromium ships no hyphenation
  dictionaries — measured, `hyphens:auto` and `hyphens:none` give byte-identical
  heights — so it is a no-op in every local run and in CI, while iOS Safari and
  desktop Chrome do honour it. Do not "fix" it by widening the column further
  on the strength of a local screenshot; the local browser cannot show you the
  hyphen either way.
- **No shared data.** localStorage only — two devices never see each
  other's edits. The obvious next enhancement (needs a server or a sync
  backend; touches `engine/hooks.ts:storeBackend` and the mutation funnel).
  Everything else on this list that says "not persisted" or "per-browser" is
  the same missing piece wearing a different hat.
- **Prototype auth.** Hard-coded accounts; the deployed site is public.
  Manage-users edits the in-memory list only. Real accounts = server work.
  A member is not view-only: they add, edit and delete their own Inputs and
  tick the qualifications they hold. Roles table: `docs/engine-rules.md`
  §Auth / roles; the enforcement (page and write path, never the nav) is
  pinned by `src/state/session.test.ts`.
- **One dataset.** The schedule is the demo week (Mon 13 – Sun 19 Jul 26, a
  full Monday-to-Sunday week; the weekend is non-flying, duty crew only).
  Week chips re-label but every week shows the same data (the original
  behaved the same way). "Throw pucks (auto)" is a stub, as in the original.
- **Only `rules` and `stores` survive a reload.** Everything else a
  scheduler types is session-only: the whole schedule, the Quals page's
  ticks, initials and FLIGHT, **a personnel body added on the Quals page and
  its Remarks note** (the seeded three are in source and always there), and
  the EDIT QUALS column set (add a column back and its ticks return — removal
  never touches `p.quals`). If the squadron wants their LoX to survive a
  reload, that is the same server/sync work as the first bullet. `sbWide` is
  module-local and resets on reload too, matching the original's
  session-scoped behaviour.
- **Personnel (ground crew) shipped as a new category (owner, Aug 26).**
  Rules in `docs/engine-rules.md` §Personnel, screen contracts in
  `docs/ui-contracts.md` §The Quals page… What is deliberately left open:
  their inputs, remarks and any added body are session-only (the server/sync
  bullet above), and they are seeded but **kept out of the seed schedule** so
  reference parity stays byte-exact — the day the app carries a second week of
  real data, a squadron would plan its own ground crew and none of that
  applies. A `pers` body reads the same at every joint (`p.pers`): if a later
  change iterates aircrew, check whether ground crew belong in it
  (`docs/feature-impact.md` §drift-seams).
- **AL versioning is ROLLBACK semantics.** Known limitation: previews freeze
  schedule content but personal-INPUTS and day-info read live data, and
  snapshots are session-only. Rules: `docs/engine-rules.md` §Version
  snapshots / restore.
- **Ground rows accepted before the Aug-26 callsign fix** keep the person-ID
  form in `who` and stay unresolved where id ≠ lowercased callsign (Hao Wen,
  X-Ray) — same visible behaviour as before, no migration.
- **The AVALON rule and the general midnight tail are BUILT** (11 Aug 26 —
  the owner's 11 Aug spec, both halves in one change; rules in
  `docs/engine-rules.md` §Validation, "AVALON's one check" and "The midnight
  tail"). What remains open around them:
  - **BB is unspecified, and deliberately outside the AVALON check.** The
    owner named AVALON jet seats and duty roles; BB stays wholly `noconf`
    with no fixed hours and nothing on it is checked at all. Ask him before
    extending the bar to BB.
  - **The loaded week's LAST day has no next day**, so its overnight tail is
    unchecked (nothing to shift in). Fixes itself the day the app carries
    more than one week of data — same missing piece as the first bullet in
    this list. **The FIRST day is now the mirror of it**: the tail runs both
    ways since 11 Aug 26 (see below), so day 0 has no yesterday to shift in
    either, and a small-hours take-off on the Monday is unchecked against the
    Sunday before. Same fix, same day.
  - **Exempt-line pucks ring from their OWN red rules only** (owner, 11 Aug
    26 — asked and answered twice, settled the same day): an SC spare or an
    AVALON seat rings for the availability check, a spare also for SC
    currency, and a warning the man earned elsewhere never bleeds onto the
    exempt copy. Rules: `docs/engine-rules.md` §Validation, "AVALON's one
    check". Do not "simplify" this back to all-or-nothing in either
    direction — both ends were tried and rejected within one day.
- **The leave-types build left two things open** (shipped 10 Aug 26; rules in
  `docs/engine-rules.md` §INPUT_META and §Availability is time-aware).
  - **A half-day absentee is no longer counted in the day-info "off" tally.**
    Deliberate — `dayOff` means off for the WHOLE day, and it also drives the
    palette's struck-through rank, where a man available all afternoon must
    not read as gone. But it is a number on screen that moved, so it is
    written down rather than left to be rediscovered.
  - **A morning absence still bars a sortie that STEPS before noon.** The
    flying window is padded to the step time because that is what the
    validator judges against — Monday's first VL takes off 12:40 and steps at
    11:40. Correct, and the owner was told; expect it to be reported as a bug
    at least once. The levers are the AM boundary or the step padding, never a
    picker rule that disagrees with the warning list.
- **The picker's busy-at-this-hour bar is ADVISORY, and that is the whole
  design** (owner, 11 Aug 26). `slotBar` now names an overlapping commitment
  for every slot, not only a standalone SC shift, excluding the seat being
  planned into so a swap stays silent. Like every other bar here it does not
  refuse anything: the name still shows, `barDrop` toasts the reason and the
  drop goes through. Do not harden it into a refusal — the app's whole
  vocabulary is soft bars, and a scheduler double-books deliberately more often
  than by accident. Two existing tests were re-pointed at the reason they are
  actually about (ATT B, actioned-Fly) rather than at "no reason at all",
  because seeded men genuinely are busy at those hours; that is the confound to
  expect when adding a slot-hours test, not a sign the bar is wrong.
- **`Sort all` reorders the waves and duty blocks themselves now (11 Aug 26),
  and it does NOT renumber their labels.** A day built out of order and then
  sorted can read `WAVE 2` above `WAVE 1`, because the label is free text the
  scheduler may have replaced entirely and rewriting it would clobber every
  hand-chosen name to fix a cosmetic mismatch. The owner was told at the time.
  If it ever bites, the honest fix is renumbering ONLY labels still matching
  the `WAVE <n>` default `+ Wave` mints — not a blanket rewrite. Rules:
  `docs/engine-rules.md` §Sorting a board section.
- **A SECOND document-level scroll listener went on on 11 Aug 26**, and it is
  deliberately not the same shape as the one below. `histbubble.ts`'s
  re-anchor is registered on the document in capture — scroll events do not
  bubble but they do run capture listeners from the window down, which is the
  only way to see every scroller — and its first line is a boolean on a
  variable that is null unless a bubble is actually up. It moved there from
  the board wrap, which could only ever see the board PANELS' scrolls:
  `.sb-main` is the wrap's parent, so the phone's single scroller never
  reached it and a bubble would have been left behind by the very scroll that
  brought its cell into view. If a third consumer ever wants this event, share
  one listener rather than adding another.
- **The input↔schedule sweep of 11 Aug 26 found seven test gaps it did not
  close.** Ranked as it left them: no test drives `commitInputEdit`'s
  `keep`/"moved outside the programmed week" branch (grep finds that toast
  string only at its own definition); none constructs an input whose `endDate`
  runs past the last loaded `DATES` entry; none asserts, either way, that two
  overlapping inputs for one person raise nothing; none plants a genuine
  `half:'am'`/`'pm'` record against a sortie's brief window through
  `validate()`; none puts a TIMED tomorrow input inside a night sortie's
  debrief window (the tail is pinned for `LEAVE_FLY`/`DNIF_FLY` only); none
  reaches `halfOf`'s PM boundary through the in-place cells; and nothing guards
  an accepted input being reassigned to a different person. All are
  MISSING-TEST, not known-wrong-behaviour.
- **`DT_SUM` still counts a man double-BOOKED among those "double turning".**
  The summary lists everyone with 2+ sorties, which is true of a man planned
  into two seats at once as much as of a genuine double-turn. Harmless beside
  the hard conflict that now fires, and left alone rather than special-cased.
- **The activity types warn but do not bar.** Training, CSE, Meeting, Fly,
  Personal, Appointment and Other now reach the validator the moment they are
  typed, so planting a man through one raises a warning — but they are not in
  `isAway`, so the palette still offers him and no slot is struck through.
  That matches how an actioned personal input has always behaved and nobody
  asked to change it; the inconsistency is noted here rather than fixed.
- **Stores configuration — the residuals.** The feature shipped (owner,
  7–8 Aug 26; contracts in `docs/ui-contracts.md` §Stores configuration and
  `docs/engine-rules.md` §Stores configuration). What is still open:
  - **A customised list freezes against the standard set.** The whole list
    is stored the moment it deviates (no per-entry diff makes sense for an
    ordered, renameable sequence), so a squadron that has customised its
    list will not pick up a store later added to `STORE_STD`. Telling
    "never seen this new default" apart from "deliberately deleted it"
    needs a tombstone list — machinery for a problem that does not exist
    yet, and deliberately not built.
  - **A frozen day preview renders with the CURRENT stores list**, not the
    list as it stood when that version was published. `rules` already
    behaves exactly this way, so this is consistent, not new.
  - **Deleting every store silently reverts on reload.** An empty saved
    list is indistinguishable from "load found nothing", so the standard
    six quietly return. No last-store guard exists; a squadron that wants a
    genuinely empty list to stick needs one.
  - **No migration for a list damaged by the pre-fix key mismatch.** Until
    the 8 Aug wave, deleting `2 TKS` and retyping it minted a second entry
    keyed `2tks` while every jet kept `opts.tk2`; `storesLoad` still accepts
    such an entry, so an affected squadron sees two identically-labelled
    chips and keeps a stranded `tk2` until the stray is deleted by hand.
    Nothing makes it worse, and the feature has not shipped to anyone yet.
  - **A misleading refusal.** Rename `2 TKS` to something else, then type
    `2 TKS` as a new store, and it is refused with "2 TKS is already on the
    list" while the list shows the new label — the refusal is correct (the
    key is taken), only the wording is confusing.
  - **The label match that restores a standard key** trims and upper-cases
    but does not normalise inner spacing or punctuation, so `2  TKS` or
    `2-TKS` still derive `2tks` rather than recovering `tk2`. Retyping the
    name as printed works, which is the path the toast promises.
  - **A near-cap stores list will trip the board's DOM ceiling
    legitimately.** The margin was sized against six stores and the feature
    supports `MAX_STORES` (24) — roughly one `.stchip` per store per
    aircraft line. Not raised pre-emptively, because a margin sized against
    a number nobody has hit is a guess; the fix when it bites is the
    ordinary one (check the time, raise the ceiling in the PR that needs
    it). Reasoning: `docs/probe-sweep.md` §The performance gate.
- **Editing an input from the schedule shipped with three things left open**
  (build two of the leave-types work, 10 Aug 26; contract in
  `docs/ui-contracts.md` §Editing an input from the schedule). The times and
  the remarks are cells you type in on both surfaces; the type and delete sit
  behind the type label.
  - **The TYPE is still a dialog, not a cell.** It is the one field that is a
    choice from a list, and a `<select>` in the week's 96px name column was
    not attempted — the three measured attempts to fit a separate control into
    these rows are recorded in the contract, and all three cost row height. If
    it is ever wanted inline, the BOARD has the width for it before the week
    does.
  - **Person and dates are not in the dialog** — deliberate, and the footer
    says so: all four fields it does carry keep the row on the day it was
    opened from, while moving it to another man or another date makes it
    vanish from the surface being looked at. If the owner asks for them, they
    need the Inputs page's calendar, not another two fields.
  - **A member still cannot edit his own leave from the week**, only from the
    Inputs page. The control is gated on `HOOKS.editMode()`, which is
    admin-and-Edit-Schedule, so the schedule surfaces stay a scheduler's.
    Opening it wider means an OWNERSHIP check (his own inputs only), which
    nothing in the app has yet.
- **History on the board shipped with four things open** (11 Aug 26; contracts
  in `docs/ui-contracts.md` §History on the board and `docs/engine-rules.md`
  §The edit log). The owner was told the first one before it was built.
  - **It can only ever say "Admin" or "Squadron member".** `HOOKS.whoami()`
    reads the hard-coded prototype login, so the log names an ACCOUNT, not a
    person, and it never shows what another scheduler did on another device.
    That hook is the one seam a server has to fill — same missing piece as the
    first bullet in this list. Do not dress it up as an audit trail.
  - **It clears on reload and on logout**, because the schedule does. A log
    that outlived the schedule it describes would point at nothing, and one
    that survived a logout would show the incoming user someone else's work
    under their own board.
  - **A row moved by drag or by Auto sort logs nothing by value** — the
    reorder paths mark keys whose values never change, which is why Sort all
    manages one line instead of six. `applyMove` has no `logAction` of its
    own, so a hand-dragged row is currently invisible to the list. Cheap to
    add if it is ever missed; not added blind. It is now the LAST schedule
    write with no line in the list: accepting an input, cancelling with a
    reason and rolling a day back were the other three, and all three were
    closed on 11 Aug 26 (`docs/engine-rules.md` §The edit log). The narrow
    exception left beside them is an accepted input edited onto another person
    or date through the Inputs dialog, which unaccepts and re-accepts
    internally — deliberately silent rather than two contradictory lines.
  - **The bubble covers the cells that carry an address, not quite all of
    them.** Anything with `data-bfld`/`data-slot`/`data-txt` works, plus the
    five older attributes (`store`, `bombs`, `area`, `atime`, `intimes`) whose
    prefixes `histbubble.ts` puts back by hand, and the traffic field (`tr:`),
    which is written from a modal and has no cell to hang a bubble on, so it
    appears in the LIST only. A new text trigger wants a line in `keyOf` as
    well — **and a value passed to `markEdit`**: this bullet claimed all six
    worked from the day History shipped and none of them did, because every
    one of those write paths passed a key with no values and `logEdit` returns
    on that (fixed 11 Aug 26, rules in `docs/engine-rules.md` §The edit log).
    Only `data-area`/`data-atime`/`data-intimes` are still bubble-less, and
    for a different reason: those three cells render on the WEEK only, and the
    bubble is wired to the board wrap. They are in the LIST.
    **And they cannot be JUMPED to either, which is the residual worth
    knowing** (11 Aug 26). Those three plus `tr:` — and, since the 12 Aug 26
    audit, `wl:` (the board draws the wave title as a `<select>`, which the
    cell lookup cannot answer for) — are the five families the
    board never draws as a cell, so `histJumpable` (`histbubble.ts`) keeps their rows
    out of the clickable set — they list, they just do not offer a jump. That
    guard exists because the two halves of this feature shipped separately and
    combined into a wrong answer: one made the four log a value at all, the
    next made every keyed row a button, and clicking one then said "That
    detail is no longer on this day" about a detail sitting safely on the
    week. **A new key family that the board does not render wants a line in
    `NO_BOARD_CELL` as well as in `keyOf`.** The honest fix, if it is ever
    wanted, is for the jump to leave the board for the week — nothing today
    does that, and it was not built blind.
- **The iOS focus-zoom fix is unverified on a real iPhone, like the page lock
  below.** `index.html` appends `maximum-scale=1` to the viewport meta at
  runtime on Apple touch devices only — iOS honours it for the auto-zoom on a
  focused sub-16px input (the thing the owner asked to stop, 12 Aug 26) while
  ignoring it for pinch zoom, and Android is deliberately left alone because
  Chrome there WOULD lose pinch zoom. No iOS device is reachable from this
  container; the half that is gateable — Chromium's meta stays bare — is in
  `e2e/geometry.spec.ts` ("the viewport meta"). If the owner still sees the
  zoom, the fallback is `font-size:16px` on the focused cell via a
  transform-scale trick, which nobody has built. The `place()` half of the
  same complaint (the bubble placed in layout coordinates while the keyboard
  pans the visual viewport) is belt-and-braces fixed either way —
  `histbubble.ts` reads `window.visualViewport` now.
- **The board's page lock is unverified on a real iPhone.** `body.sb-lock` is
  `overflow:hidden`, which locks the viewport by propagation from `body` (the
  root sets no overflow of its own) and was measured holding at both widths in
  the container's Chromium — that is what `e2e/geometry.spec.ts` gates. iOS
  Safari is the known exception to that technique for TOUCH scrolling; the
  usual remedy is `position:fixed` on the body, which is why the scroll
  position is already captured and put back by hand. No iPhone is reachable
  from here, so this is a caveat, not a finding. If it does bite, the hole is
  narrow: `overscroll-behavior:contain` on `.sb-main` is the other half of the
  fix and does work there, so only a drag on the top bar would still reach the
  week. Contract: `docs/ui-contracts.md` §The page behind the board does not
  scroll.
- **A USER GUIDE is wanted, for users and admins** (owner, 10 Aug 26 — "I
  eventually want u to create a user guide for this app"). Not started, and
  not urgent. The half that cannot be worked out by looking at the screen is
  already collected in `docs/remarks-vocabulary.md` — every piece of text a
  scheduler can type that turns a rule on, written in the guide's voice so it
  can be lifted straight in. **Keep that file true as rules are added**; a
  trigger that is not in it is one nobody outside the code will ever find.
  Still to gather when the guide is written: the day/AL publishing flow, the
  roles split, what each warning means in practice, and the phone gestures.
- **The AAR instructor mark leaves two known gaps** (shipped 10 Aug 26;
  rules in `docs/engine-rules.md` §AAR, and who may teach it).
  - **The crew palette does not know about it.** `slotBar` folds a pilot away
    from a front seat when he is not AAR current, and it still does that even
    where an instructor in the back would legitimise him — so the palette is
    now slightly over-strict against a legal training crew. Deliberately not
    fixed: `slotBar` is per-person-per-slot, and a pair rule there would make
    the list depend on WHICH SEAT YOU FILLED FIRST, and would refuse drops
    through `drag.ts`. The combination matrix — the closest analogue, also a
    pair rule — is warning-only for the same reason. The bar is soft (the name
    still shows, with the reason against it), so nothing is unplannable.
  - **`CHIP_LABEL.Q` still reads "Qualification — illegal seat"** while four
    codes now wear that chip (`QUAL`, `SC_QUAL`, `AAR_QUAL`, `AAR_INSTR`).
    Mildly untrue for three of them. Not fixed here because `CHIP_LABEL` is in
    `refwin.ts`'s swap list: rewording it breaks the `html.test.ts` byte
    compare and needs a matching reference patch, which is a bigger change
    than the wording is worth today.
- **Nobody is on ATT B in the demo data**, so the one type that separates
  "cannot fly" from "cannot come to work" is never exercised on screen.
  Deliberate: seeding it would put a divergence in front of the reference
  parity gate, which has no such axis. Set it by hand on the Inputs page to
  see it. Same shape as the AAR-instructor gap below.
- **Nobody holds the AAR instructor mark in the demo data.** Deliberate — the
  seed's only AAR remark is `1A: NO AAR`, so no line asks for refuelling and
  neither AAR rule fires anywhere in the week regardless. The mark is set by
  hand on the Quals page in two clicks. If the demo week ever gains a real
  AAR line, seed a few `'I'`s with it or every such line will read as a fault.
- **The late-input mark has no off switch.** `VCONF.inputLead` is a day count;
  0 ("due by the Monday itself") is the most permissive setting there is, so a
  squadron that does not run an input deadline cannot silence the mark short
  of a rule change. Deliberate, and a small change if it ever bites.
  (Downchits ARE exempt — owner, 9 Aug 26 — so the commonest genuinely
  unavoidable late input is already covered. Leave and detachments are not.)
  Rules: `docs/engine-rules.md` §The late-input mark.
- **The Inputs page opens on TODAY → TWO WEEKS, and its empty table on the
  demo data is the owner's own choice** (owner, 12 Aug 26 — "it is ok to show
  any inputs from the today's date to 2 weeks down the road by default").
  **Do not re-fix this.** It opened on today → +2 months until that morning;
  because the one dataset is the week of 13 Jul 26, a clock past that week
  opened the table EMPTY and read as "my inputs have vanished". It was changed
  to anchor to the loaded week when today fell outside it, the owner saw that
  and asked for it reverted in favour of the simpler rule: the window is
  always relative to today. So with the container clock in Aug 26 the page
  opens empty again, ON PURPOSE — a squadron running this for real has inputs
  around today, and the empty state already names the way out ("Change the
  dates, or pick 'All dates'"). Pinned both ways in `inputs.test.tsx`,
  including a test asserting the window does NOT jump to the demo week.
- **`export.ts` CLOSED the formula-injection hole on 12 Aug 26.** A cell whose
  text begins `=` `+` `-` `@` (or a tab/CR) is written with a leading
  apostrophe, which spreadsheets read as "the rest is text" and do not print —
  so a store renamed to `=1+1` still READS as the squadron typed it and no
  longer evaluates when the CSV is opened in Excel or Sheets. Quoting never
  protected against this; both engines evaluate a quoted leading `=`. The
  guard is at the DESTINATION rather than the entry field on purpose: there is
  nothing malformed about naming something `-30`, and the same escape covers
  remarks, callsigns and every other free-text column at once. `export.ts:30` also still writes stores for a
  standalone line if legacy `opts` survive there from before the
  SC/AVALON/BB gate went on both surfaces; the entry paths are closed, the
  CSV read path is not.
- **`PENDING_HOLD` in `highlights.ts` is a single overwrite slot**, now
  shared by two unrelated features — `holdPuckStill`'s scroll correction and
  the stores popup's `place()` re-anchor. No reachable path today calls
  `queueHold` twice in the same task, so nothing is lost yet, but a third
  consumer would make that true silently; the module comment flags it as a
  review question for whoever adds one.
- **Crew rest can be defeated by a typo, and this was deliberately not
  built out.** Because rest anchors on the brief, typing a B LATER than the
  real one makes a genuine breach disappear. With a `late show` remark that
  is deliberate and visible; a plain typo does it silently, and the bounded
  parse rejects nonsense values, not wrong ones. The cheap guards if it ever
  bites: show the rest margin beside the B box, or flag a B sitting more
  than some margin later than the suggestion. Neither is built. Rules:
  `docs/engine-rules.md` §validation.
- **One cross-day coupling exists, and only one.** An edit on day N that
  changes its crew rest rewrites day N−1 too. `probes/perf-port.cjs`'s
  day-isolation assertion names that exemption by hand and still fails on
  any other day.
- **Escaping the puck title is asymmetric on purpose.** Only the callsign is
  escaped inside it — `CHIP_LABEL` legitimately holds `<`/`>`, and escaping
  those breaks the byte-exact reference parity. Two unescaped sinks were
  found on 6 Aug 26; assume more is possible.
- **The 12 Aug 26 audit raised five SUSPECTS beside its twelve bugs, and the
  owner closed ALL FIVE the same day** ("fix all"). None is open; each is
  listed here with what it now does, because the reasoning is what stops a
  later session undoing one as an over-guard. Every one is pinned by tests.
  - **CLOSED — the brief-time guard rails** (owner: "u can put guard rails to
    deny such inputs"). A brief typed after its own take-off inverted the
    brief window and silently disabled that line's `NO_BRIEF` check. `txtSet`
    now refuses that value, and clears a brief the take-off is moved past;
    the engine's own "a bad time stays visible" semantics are unchanged, so
    no UI path can produce the pair any more. Rules: `docs/engine-rules.md`
    §the brief, third bullet. Tests: `audit-c-briefguard.test.ts`.
  - **CLOSED — the empty-remarks reveal and `RMKOPEN` were removed (16 Aug 26).**
    The reveal, its `data-rmkadd` "+" and the `RMKOPEN` view state are gone: every
    remarks box now draws at all times beside the pucks (owner). `RMKOPEN` was
    `remapViewKeys`'s only client, so that hook is now a wired no-op — kept as the
    place a future key-addressed VIEW value plugs into, not deleted. Contract:
    `docs/ui-contracts.md` §every remarks box rides the pucks' row.
  - **CLOSED — `inpWin` fails closed like `awayAllDay`.** A record with
    neither `allday` nor `s`/`e` used to read as away to the picker and as
    nothing at all to the validator, so the palette struck a man out while
    planting him raised no warning. `inpWin` returns `[0,1439]` for such a
    record now — 1439 wide, so `timedInput` reads it as all-day, which is
    what the picker had already decided. Still unreachable from both UI entry
    paths: this is the guard for a restore, an import or a probe. Tests:
    `audit-thinwin.test.ts`.
  - **CLOSED — the bubble is re-checked on every repaint.** `histBubRecheck()`
    (`histbubble.ts`) re-anchors a live bubble or takes it down, and
    `SchedBoard.tsx` calls it after the panel diff as well as on scroll and
    resize — a repaint is the other way an anchor vanishes, and a pinned
    bubble used to go on describing a deleted row until some later scroll
    noticed.
  - **CLOSED — the dot strip declines a scrub while a puck is held.**
    `drag.ts` exports `touchDragBusy()` and `wireDayDots` asks it: a day
    change repaints the panels, detaching the node the touch-drag machine
    carries, and the drop would then resolve against the new day's markup.
    True from the moment a finger lands on a draggable, not only once the
    hold has armed, because the repaint hazard covers both windows. The
    reverse direction needs no guard — a finger landing on a puck mid-scrub
    is non-primary, which `onPointerDown` already refuses. Tests:
    `audit-gesture-bubble.test.tsx`.
- **Two reference probes fail on the port by design.** `audit2 #8` and
  `audit` item 3 pin the OLD `Fly`/OFFER rules, which the owner changed in
  Aug 26. The probes still describe the reference correctly; they no longer
  describe the port, and their replacement assertions live in
  `src/engine/validate.test.ts`. One more (`zdup`) fails identically on both
  builds — environment-bound, not a port defect. All three:
  `docs/probe-sweep.md`.

## Deploy — the traps, all still live

**Two channels since 15 Aug 26 — Vercel for speed, Pages for the official
site.** The owner's dev loop felt like ~20 min per change; the fix was to stop
routing every look through the gated Pages deploy.
- **Vercel** builds `raptor-port` from the root `vercel.json` and gives every
  branch/PR its own live URL in ~1 min, ungated — the fast per-branch preview
  the owner taps himself and the one to drive while iterating. Not a gate: a
  red preview is still just a preview. The owner connects it once in the Vercel
  dashboard (Import the repo; `vercel.json` carries the build settings so no
  dashboard config is needed). Contract: `CLAUDE.md` §Build & verify.
- **GitHub Pages** stays the OFFICIAL, gated site, published on merge to main
  only — the "done means live" endpoint. Paid once per session, not per change.
- **CI was sped up the same day**: the Playwright browser download is cached
  (`actions/cache` keyed on the lockfile) and the geometry suite runs 3
  workers with one CI retry (`playwright.config.ts`). NOT all cores — the
  first `workers:'100%'` run on main starved the shared vite preview and
  flaked the desktop carry-day test, failing the publish; 3 keeps most of the
  ~30% win (~1.7min → ~1.2min at 4 cores) with headroom, and the retry
  absorbs a residual flake visibly (the reporter logs retried passes). So the
  build job's checking wait is ~2–3 min, not ~5.
- **Docs-only PRs and pushes skip the workflow entirely** (`paths-ignore`:
  `**.md` + `.claude/**`, added the same day — nothing under those patterns
  is imported into the bundle, verified by grep). A session-handoff commit
  therefore has NO checks and merges immediately; do not sit waiting for a
  "build" check that will never appear on such a PR. A mixed code+docs PR
  still runs the full gates.
- **Known cosmetic warning, deliberately deferred (15 Aug 26):** the runner
  logs "actions/checkout@v4, setup-node@v4, cache@v4 target Node 20, forced
  onto Node 24". A warning, not a failure — every run passes with it. Bump
  the action majors on a quiet day, NOT bundled into another workflow change:
  the one workflow edit this repo shipped broke main's deploy on its first
  run (the workers flake), so workflow changes go one at a time.

GitHub Pages must stay enabled (Settings → Pages → Source: GitHub Actions).
The workflow refuses to publish on any red test. The four gates also run on
every **pull request** into main, so a red PR is caught before merge; a PR
run gates only — it uploads no artifact and never deploys. Publishing stays
push-to-main.

**Checking a shipped change against the deployed page is a standing
instruction** (owner opened the network policy, 7 Aug 26) — a green workflow
is not evidence the page serves. Recipe and the three Chromium launch
settings it needs (without them every host fails as `ERR_CONNECTION_RESET`,
which looks like an outage and is not): `CLAUDE.md` §Build & verify.

- **The publish step has a ten-minute ceiling you cannot raise.**
  `actions/deploy-pages` polls until Pages serves the artifact and aborts at
  600000 ms, CANCELLING a deployment that is still reporting progress — so a
  green build publishes nothing. Passing a bigger `timeout:` does not work;
  the action clamps it and says so in the log. Pages normally takes about 8
  minutes for this repo, which leaves roughly two minutes of margin against a
  queue nobody here controls. Ruled out as causes before blaming the queue:
  the artifact is 0.15 MB over 5 files, the environment goes
  waiting→queued→in_progress in 1–3 s, and the repo sits at 2 deployments/hour
  against a soft limit of 10. If the wait becomes permanently over ten
  minutes the fix is a different publish path — a `gh-pages` branch, which
  never waits on the rollout, or another host — not a re-run and not another
  timeout value. Reasoning is in the deploy step's own comment in
  `.github/workflows/deploy.yml`.
- **Three GitHub-side faults, separate from that ceiling and from each
  other**, and one of them makes retrying pointless:
  - `Failed to resolve action download info` · `Service Unavailable` /
    `Bad Gateway` — the runner could not fetch the action definitions. It
    never reached the repo. Re-run.
  - **`Invalid actions OIDC token ... No keys from key endpoint match` — the
    trap.** It appears when you RE-RUN an old failed job: that run's identity
    token has since rotated, so re-running a stale run can NEVER succeed
    however many times it is tried. Trigger a FRESH run instead
    (`workflow_dispatch` on `deploy.yml`, ref `main`), which mints a new one.
  - **No runner assigned at all** — job cancelled after ~15 min with an empty
    `runner_name` and zero steps recorded. Pure capacity. Re-run later.
- **The Actions status API reads 10–20 minutes STALE, and that is the single
  biggest time-waster in this pipeline.** Repeatedly it reported a step "in
  progress" that had finished half an hour earlier — a gate that took 2m17s
  looked hung for 35 minutes, and the natural conclusion (something is wrong
  with my change) was wrong every time.
  **`list_workflow_jobs` is NOT a reliable way round it** — that was the
  advice here until 10 Aug 26, when a PR gate that finished at 10:36:13 was
  still being reported step-by-step as "Geometry in progress" by that very
  endpoint more than thirty minutes later. It is sometimes fresher; it is not
  dependably fresher, so do not plan around it. On that run the PR
  **check-runs** endpoint was the one that eventually told the truth.
  What DOES work, both measured: for a PUBLISH, the deployed page itself is
  the only trustworthy signal — poll `curl -sS https://seejiaokai.github.io/Raptor/`
  for the new bundle hash out of `dist/index.html` (Pages rolled over in
  90 s–3.5 min all day, nowhere near the ten-minute ceiling). For a PR GATE
  there is no page, so there is no fast signal at all: budget for the answer
  arriving up to half an hour after the job really finished, poll on a long
  interval rather than a short one, and spend the wait on something else.
  Never conclude a run is hung from that API alone, and never re-run or
  dispatch on it.
- **Two token traps.** A merge made with the **raw session token** (curl
  `PUT /pulls/{n}/merge`) produces NO push-deploy at all, while a merge
  through the **GitHub tooling** triggers one normally — so do not reflexively
  dispatch after merging; check for a push run first, or the dispatch
  supersedes a healthy run and cancels it (the concurrency group is
  `cancel-in-progress`). That mistake was made here twice, once in each
  direction. And the raw session token gets `403 Resource not accessible by
  integration` on `POST /actions/workflows/{id}/dispatches`, which returns an
  EMPTY body on success too — so a script cannot tell refusal from success and
  will cheerfully report runs it never started. Dispatch through the GitHub
  tooling, not curl.

## File map

### `raptor-port/src/engine/` — the rules engine (DOM-free)
| file | what it does |
|---|---|
| `data.ts` | The demo week: DAYS with waves/formations/aircraft, duties, sims, ground, programme rows. |
| `people.ts` | PEOPLE roster (quals, seat, categories), qual ladder (`OCU→D→C→B→A→IW→IP→IR→FI` — instructor-ness lives in CAT, no `ip` flag), `isScheduler`/`isLead`/`isInstr`/`isInstrPilot`/`isOcu`, **`isPersonnel` + the `pers:true`/`seat:'GND'` ground-crew category** (Aug 26 — seeded `torque`/`spanner`/`gizmo`, no CAT; `deriveQuals` short-circuits them), `scShiftKind`, `sanStatus`, `aarNeed`. |
| `inputs.ts` | INPUTS list + **`INPUT_META`, the one table every input type is decided by** (10 Aug 26) — `INPUT_TYPES` is derived from its keys and every predicate is a lookup: `isLeave`, `isLocalLeave`, `isDownchit` (= the medical group), **`isPersonal`/`isUnavail`** (the two day blocks, presentational only), plus `canSpare`, `canWork`, `awayAllDay`, `TYPE_GROUPS`/`typeGroup`. `isDetach` is gone with the `Detachment` type. Also DATES and the late-input block. |
| `time.ts` | `parseHM`/`hhmm`/`minus`/`overlap` (half-open — abutting windows do not clash). |
| `events.ts` | `collectEvents()` — the per-day event build the validator consumes; appends tomorrow's inputs shifted +1440 (the midnight tail, marked `nx`) and collects AVALON crew (`day.sacrew`) for the one check the wave's `noconf` does not cover. |
| `validate.ts` | `validate()`, WARN/REST/EVD, WCODE/CHIP_LABEL/RANK, `wlbl`, `chipOf`, `dashOf`, the crew-rest trace (`traceOf`/`traceLeads`/`traceIx`/`tracesOn`). **The conflict engine.** |
| `avail.ts` | `slotRules`/`slotBar` eligibility, `dayOff`/`dayEngaged`, free-count ranking. |
| `slots.ts` | The mutation funnel: `slotVal`/`setSlotVal`/`fillSlot`/`txtGet`/`txtSet`, `whoArr`/`rowCrew`/`acRef`, `rollCx`, **`acceptInput`/`unacceptInput`/`inpKey`** (Ground removal and Unavailable filing use inert amendment keys, including every loaded day of a span). |
| `keys.ts` | `keyDay`, `shiftKeys` + `shiftAircraft`/`shiftFormation`/`shiftWave` renumbering (delete-time), and its bijective sibling `permuteKeys`/`moveKeys` for a reorder. |
| `order.ts` | `groundOrder(rows, man)` — Ground Programme's render-time start-time sort, pulled out of `ui/html.ts` so `reorder.ts` can freeze a rendered order into the model without the engine importing from `ui/`. `man` (a day's `d.gman`) returns model order untouched. Also holds `DUTY_ORDER`. |
| `reorder.ts` | The board's row movers: one function per list (`moveFormation`/`moveAircraft`/`moveDutyRow`/`moveSimRow`/`moveGroundRow`/`moveProgRow`/`moveNote`) plus `applyMove`, the one entry point the UI calls — parses `mv:` addresses and resolves a flying row's two meanings (resequence vs. carry the formation) by what it was dropped on. Also every AUTO SORT: `sortWave`/`sortDutyBlock`/`sortSims`/`sortGround`/`sortProg` (rows inside one block), **`sortWaves`/`sortDutyBlocks` (the blocks themselves, by the earliest time in each — 11 Aug 26, Sort all only)**, and `sortDay`, which composes the lot inside-out. Exports `REORDERED_DI`, the stale-arm signal `state/view.ts` pops. |
| `waves.ts` | WEEKS/CURWEEK, standalone waves (SC/AVALON/BB): `isStandalone`, `makeStandalone`, `saExempt`, plus the duty desk a wave brings — `waveDutyBlock` (the block `+ Block` fills in, one shape per wave kind), `DUTY_STD`/`DUTY_PICK` (the role vocabulary) and `saDutyIx` (every block a standalone wave owns, highest index first, for the delete path). |
| `publish.ts` | SCHED, sign-offs (SIGN_ROLES), `setDayApproved`, `publishALDay`/`alIssue`/`unpublishAL`, `markEdit`, inert structural-removal/input-action amendment keys, AL colours, per-day version snapshots (`daySnap`/`daySnapOf`/`dayVersions`), `dayCurVer` (the day-head chip). |
| `restore.ts` | `dayKeys` walker + `restoreDayVersion` — ROLL a day back to a published version (it becomes live at once). |
| `rules.ts` | VCONF/SHIFT_HARD editing, `ruleParse`/`ruleFmt`, `rulesSave`/`rulesLoad`/`rulesReset`. |
| `oil.ts` | **Wire 4's engine half** (17 Aug 26) — `dayOilCredits(day)` → per-person 0.5/1: SC MAIN shifts by shape (`scShiftCredit` — wholly inside one half of the SC day window = 0.5, more = 1), duty rows by summed written hours vs `VCONF.oilFullMin`, capped at one day; spares, time-less rows and unknown names earn nothing. Pure and Leave-War-blind — the non-working-day question and the credit posting live in `src/leavewar/sync.ts`. Rules: `docs/engine-rules.md` §Weekend/PH duty earns OIL. |
| `insights.ts` | `computeInsights()` for the Insights modal. |
| `stores.ts` | The squadron's stores list — mutable `STORE_CFG`, frozen `STORE_STD`, `storeKey`, `addStore`/`delStore`/`renameStore`/`moveStore`, and `storesSave`/`storesLoad`/`storesReset` against its own `stores` key. Persisted state, so it lives here. Nothing in `validate.ts` reads a store. |
| `dutytpl.ts` | The squadron's **duty-block templates** (13 Aug 26) — mutable `DUTYTPL_CFG`, frozen `DUTYTPL_STD` (Standard / SC Shift / AVALON), `addTpl`/`delTpl`/`renameTpl`/`moveTpl` and the per-row `addTplRow`/`delTplRow`/`setTplRow`/`moveTplRow`, `blockFromTpl` (mints a PLAIN `{label,rows}` duty block — no `sa`/`noconf`), and `dutyTplSave`/`dutyTplLoad`/`dutyTplReset` against its own `dutytpl` key. Persisted state, exactly like stores; nothing in `validate.ts` reads a template. Loaded at boot in `initStore`. This is what `+ Block` offers now — waves no longer create desks (§Stable decisions). |
| `daytpl.ts` | **Whole-day master templates** (15 Aug 26) — one level up from `dutytpl.ts`: mutable `DAYTPL_CFG`, frozen EMPTY `DAYTPL_STD` (unlike `dutytpl`'s three seeded desks — a whole day is too squadron-specific to guess at), `tplFromDay`/`addDayTpl`/`delDayTpl`/`renameDayTpl`/`moveDayTpl`, `applyDayTpl` (refuses a published day; direct-write shape mirroring `restoreDayVersion`, retiring the day's pending/added marks), `dayTplSave`/`dayTplLoad`/`dayTplReset` against its own `daytpl` key. A template's `d` blob (`DayTplBlob`) allowlists the day's STRUCTURE only — `notes`/`allhands`/`waves`/`sims`/`dutywaves`/`ground` + section notes, never `dow`/`dt`/`today`/`wc` — with every person reference blanked and every `cx`/`cxr`/`flag` mark stripped. Loaded at boot in `initStore`. Rules: `docs/engine-rules.md` §Day templates. |
| `drafts.ts` | **Per-day alternate drafts** (15 Aug 26) — state rides `SCHED.drafts`/`SCHED.curDraft` (`publish.ts`) rather than a module of its own, so it serialises with undo like the AL records. `dayDrafts`/`curDraftId`, `draftDup`/`draftSelect` (the live `DAYS[di]` IS the selected draft's working copy, and switching stows the outgoing entry first), `draftRename`/`draftDelete` (refuses the selected entry), `isDraftVer`/`draftVerLabel` — the `'d:<id>'` version-string shape `publish.ts`'s `daySnapOf` resolves for a draft preview, and **`rebaseDayPending`** (15 Aug 26 — both dup and switch WORK on a published day now; a switch there re-marks the day's whole pending set as the `dayKeys` diff against the issued snapshot, which is what retired the old "Reopen the day first" refusal — `applyDayTpl` keeps its own). Publishing needed no change: `setDayApproved` publishes whatever is live. Session-only, like the AL list. Rules: `docs/engine-rules.md` §Drafts. |
| `hooks.ts` | HOOKS — injectable callbacks (toast, repaints, histPush, storage, `closeBoardDialogs`, **`remapViewKeys`** — key-addressed VIEW state riding `keys.ts`'s renumbering; a wired no-op since `RMKOPEN` was retired 16 Aug 26, kept for the next such value) so verbatim bodies stay DOM-free headless; `storeBackend` is the injected localStorage (`main.tsx` plugs the real one in, null headless). |
| `editlog.ts` | The EDIT LOG (11 Aug 26) — `ELOG` (a 400-row ring buffer of `{t,who,di,key,lbl,from,to}`), `logEdit`/`logAction`, `elogRows`/`elogFor`/`elogWhen`/`elogClear`, and `keyLabel`, which turns a slot key into plain words. Written from `noteChange`/`markEdit` and only when both values are handed over. Session-only, and deliberately NOT in `histSnap()`. Rules: `docs/engine-rules.md` §The edit log. |
| `index.ts` | The barrel — re-exports every module above. UI and probes import from `../engine`, so a new engine file wants a line here. |

### `raptor-port/src/state/` — the store
| file | what it does |
|---|---|
| `store.ts` | `notify()`/subscribe/version plus the narrow `notifyBoard()`/`subscribeBoard()` lane used by day-only board navigation, so a swipe does not wake the seven-day edit week; `wireStore()` maps HOOKS→global notify (including the role-aware `editMode()`); **`resetSession()` — the ONE session-change path, used by every login and logout**; write helpers; `initStore()` boot (wires, **rulesLoad**, validate, history baseline). |
| `demoseed.ts` | **Demo-only SANS Availability seed** (14 Aug 26) — `seedDemoSans()` pushes six records straight into `INPUTS`, called from `initStore()` at BOOT, deliberately NOT part of `engine/inputs.ts`'s seed array: every parity gate and the ~40 snapshot-reset tests read `INPUTS` pristine (none call `initStore()`), so they stay blind to these rows by construction while a real built app still sees them. Idempotent (guarded per person+date, `stores-boot.test.ts` boots twice). Rules: `docs/engine-rules.md` §SANS Availability. |
| `view.ts` | UI state the engine reads: CURPAGE, SBDAY, ROSDAY, ARM, selection (SELID/WFOCUS/PFOCUS/DWOPEN/HLSET/SEARCH — clicking a puck lights every copy of that person), `afterSchedMutate()`, `focusWarn`, `setPage` (which sweeps body-level popups, closes the board, and captures the day being left), setters. Also `DPREV`/`prunePreviews` (the edit surfaces' version previews) and **`VWORK`/`toggleViewWork`** (15 Aug 26 — which PUBLISHED days the VIEW page is showing the live working copy for instead of its frozen issued default; deliberately NOT DPREV, so the two pages' choices can never cross — `docs/ui-contracts.md`). Also `CARRYDAY`/`weekLeftDay`/`scrollWeekToDay` — the day carried between View-only and Edit Schedule; the two geometry helpers live here, not in `ui/pan.ts`, because `pan.ts` already imports this module and `setPage` is the one moment the outgoing week still has layout. Contract: `docs/ui-contracts.md` §The day carries across a page switch. |
| `history.ts` | HIST snapshots, `histPush`/`histApply`, undo/redo bodies. |
| `auth.ts` | SESSION, `setSession` (resets LGEDIT, the Logic tab's own edit mode), `canEditSched`, ME/`setMe`. |
| `users.ts` | The Manage-users prototype list. |

### `raptor-port/src/ui/` — components and builders
| file | what it does |
|---|---|
| `App.tsx` | Login vs Shell + board overlay (the board is a SIBLING of the shell so logout unmounts it). |
| `Shell.tsx` | Topbar, nav, both schedule pages' chrome, global listeners (click/change/contextmenu/focusout/keydown, drag, pan), banner, memoized sections. |
| `ViewWeek.tsx` / `EditWeek.tsx` | The week surfaces: build `dayHTML` per day, diff strings, swap only changed days, hold scroll; `EditRoster` palette. CURPAGE-gated. |
| `SchedBoard.tsx` | The full-screen day board: panels with per-panel string diff; subscribes to both the global store and the board-only view lane; CxDialog (cancel-with-reason) and the Sort-all confirm, both wired to `HOOKS.closeBoardDialogs`. |
| `board.ts` | Board HTML assembly + delegated handlers: line/wave and duty/sim/ground row add/delete (with key renumbering), the ▲/▼ nudge handler, per-section and whole-day sorts, CX flow, red-box flag, `waveMenu`, `openScheduler`/`closeScheduler`. `boardHTML` now renders the in-time block, per-formation area strip and Traffic button (14 Aug 26 — week-only before); `boardSignHTML` is the sign-off as its own `#sbSign` element (so the checks bar can sit below it); `boardWarnHTML` reads the "N issues · N warning" severity-coloured bar. Also `boardDayStep`, the day arrows' one call (12 Aug 26 — the swipe and its whole carousel are deleted; do not rebuild them, the tombstone comment in this file says why). |
| `rowdrag.ts` | The board row-reorder pointer machine — its own small machine, deliberately not `drag.ts` (which stays scoped to pucks): pointer events so a finger works, releases implicit pointer capture on the way down, writes the lifted row and the drop bar straight onto the DOM, delegated on the board wrap so it survives every panel repaint. |
| `html.ts` | THE builder library: `dayHTML`, `puck`, `slotCell`, `signoffHTML`, day warnings, day-info panel, legend, cx/flag tags, and the derived `areaText`/`atimeText`. |
| `board-html.ts` / `palette-html.ts` / `logic-html.ts` | Board panels (inputs bands, notes, programme, duties, sim rows, ground, personal-inputs group, sim notes), the aircrew palette, the Logic tab's rule text. |
| `interactions.ts` | `routeClick` — the delegated click router: select/arm/plant (a puck's flag chip falls through to selection — the chip is the puck), publish/AL/sign-clear, day-info, warning boxes, the board's issue list (via `jumpToWarn`), week chips, stores remove + the config picker (`openStoresMenu`). |
| `drag.ts` | Mouse HTML5 DnD + the touch pointer machine; `applyDrop()` is the single drop path (role AND mode checked); `barDrop` qualification warning. |
| `pan.ts` | Week arrows (`panDays`), proxy scrollbar (`hsSet`/`hsSync`, echo-guarded), shift+wheel, palette day-follow, phone day dots. **`pickRosDay`** (an explicit crew-day pick that beats the scroll-follow) and **`maybeCrewHint`/`hideCrewHint`** (the once-a-session edge hint) back the crew-day picker (15 Aug 26 — `docs/ui-contracts.md` §The aircrew panel's day is pickable). |
| `textedit.ts` | Inline text editing: Enter commits / Escape restores, heal-in-place, deferred commit, `editingText()`, plus the four fields outside the `data-txt` grammar. |
| `highlights.ts` | Post-render decoration: selection/search/warning-focus classes on every puck (the week AND the board's `.sb-boardwrap`, never the palettes or a `.pv-frozen` preview), `paintArm`, and `scrollToWarnFocus` — surface-aware, snap-safe, lateral-holding (it pans sideways only when the target is off screen), picking the puck whose row holds the most of the warning's crew, and honouring `WFOCUS.panDi`/`panKey` where the focus and the destination are different days (the cross-day crew-rest row, and only it). |
| `histbubble.ts` | The History bubble — one body-level element, delegated on the board wrap in the CAPTURE phase (the board's arm handler stops propagation, and a phone tap must still arm). `pointer-events:none` is load-bearing, not styling. Re-anchors on scroll rather than hiding; parks the cell's own `title` while it is up. |
| `HistoryModal.tsx` | The changes list — every edit newest first, whole week with a filter for the open day, opened from the checks panel's `[data-histopen]` line. String-built body in the ordinary `.modal` idiom. |
| `Modals.tsx` | DayPop (read-only day details), Insights, Manage-users, Airspace/traffic popup. |
| `DutyTplModal.tsx` | The **duty-template editor** (13 Aug 26) — opened from the `+ Block` picker's pencil (`TPLEDIT` in `pops.ts`). Tabs per template + New, an editable title, rows with role (a `DUTY_PICK` datalist) / start / end / ▲▼ reorder / delete, + Add role, and Reset / Delete / Done. Mirrors `UserModal`; drives `engine/dutytpl.ts` and persists on every edit. |
| `DayTplModal.tsx` | The **day-template library editor** (15 Aug 26) — opened from the Templates picker's pencil, on either surface (`DAYTPLEDIT` in `pops.ts`, a `false\|true\|string` open-pre-selected flag). Tabs per template, an editable title, a read-only structure summary; deliberately no row editor (a day template's content is edited on the board/week themselves, which already own that surface) and no "+ New" (a template is always recaptured off a real day, never started blank). Reset / Delete / Done, all toasting. |
| `DraftsModal.tsx` | The **drafts manager** (15 Aug 26) — opened from the Drafts picker's pencils (`DRAFTSEDIT` in `pops.ts`, carrying the day since drafts are per-day), scoped to the one day whose menu opened it. Tabs per draft (selected one marked ●), a name field that commits on blur/Enter (`draftRename` refuses empty/duplicate names, and refusing mid-keystroke would fight the typist), Select (make it live) / Delete (disabled on the selected entry, with a title saying why) / Done. |
| `InputsPage.tsx` / `QualsPage.tsx` / `LogicPage.tsx` | The three secondary pages (inputs CRUD + CSV, quals grid, rules doc + admin editing). The Inputs table carries a date window and heading sort, so **its DOM row order is not `INPUTS` order** — address a row by the model index its buttons carry (`data-edit`/`data-inx`/`data-save`), never by position. Contract: `docs/ui-contracts.md` §The Inputs table's view state. |
| `inputedit.tsx` | Editing ONE personal input, shared by the Inputs page, the week and the board: the AM/PM halves (`HALF_AM`/`HALF_PM`), the span picker, the draft shape, `commitInputEdit` (including the accepted-row relink), `removeInput`, `setInpField` (one cell typed in place, and the clear-a-time-means-all-day rule) and `InputEditor` itself. Three editors over one list is how they drift apart. |
| `RangeCal.tsx` | The Inputs date picker: ONE calendar taking a range in two clicks, Monday-first grid, `yyyy-mm-dd` strings so the add/edit paths are unchanged. Used by the add form and by the table's `#inRangeBtn` window. |
| `ALPanel.tsx` / `Drawer.tsx` / `Login.tsx` | Amendment panel, phone drawer, login. |
| `pops.ts` / `toast.ts` / `useStore.ts` / `export.ts` | Popup flags, the toast, the store hook, CSV export — `csvText` (UTF-8 BOM, so Excel stops mojibaking the en dash), `exportCSV` and `schedRows`. The ONE exporter: schedule, inputs and LoX all call it. |
| `scheduler.css` | The ported stylesheet — it carries MEASURED contracts, not preferences. |
| `../probe-bridge.ts` | Window bridge for the browser probes. It deliberately mirrors the WHOLE engine API, not just what a probe uses today — keep it in sync when adding engine API. Since the merge it also carries `w.lwSetRole`, the Leave War e2e suite's mid-test role switch (same precedent as `w.setPage`). |

### `raptor-port/src/leavewar/` — the Leave War tab (a second app, vendored 16 Aug 26)
| file | what it does |
|---|---|
| `LeaveWarPage.tsx` | The ONE seam: renders the standalone app's Topbar/StageBar/Matrix inside `#page-leavewar`, scrolls the window to top on mount (Raptor keeps scroll across tab switches). Boot is NOT here — `main.tsx` calls its `initStore` once. |
| `engine/` | The vendored DOM-free rules engine: `codes.ts` (day codes — 8 leave types + the FOUR medical markers `ATTB`/`ATTC`/`HL`/`OML` (replaced `M`, Aug 26; `ATTB` joined 17 Aug 26) + `CSE`/`OD` + FS/HS SC-duty, portions `*X`/`X*` — **carried by leave AND medical since 17 Aug 26**, courses/OD/SC-duty still refusing one; plus `isMedical`, `MEDICAL_TYPES` (the admin picker's list) and `displayCell`, which prints ATTB/ATTC as the owner's bare `B`/`C` while `parseCell` accepts either spelling), `counters.ts` (derived balances + ledger, **plus the counter-column figures: `takenOf` per-type consumed, `medConOf`/`lveConOf` aggregates, the 12-figure `FIGURES` catalogue — `OIL BAL` joined with wire 4, fed by `earnedOil` summing FS/HS cells straight into the OIL balance — `orderedFigures`, and `figureParts`, the signed per-person breakdown rows the tap-a-counter sheet shows (they always sum to the figure, pinned by test); see the open-work counter-column bullet**), `stages.ts` (draft→open→closed→published, `canEdit`/`canDecide`), `wars.ts`/`period.ts` (year-long wars, UTC date maths, `DayInfo.ph`, **`EventBand` merged-event spans on the period + `bandAt`/`bandOverlaps`**), **`eventdefs.ts` (the EVENT-TYPE library — `EventKind` off/nolv/work, `EVENTDEF_STD`, `classifyEvent`, `columnKindFor`, the untrusted `readEventDefs`, and the add/update/remove helpers; squadron-wide config, persisted under `eventdefs`)**, `availability.ts`/`requirements.ts`/`evaluate.ts` (fractional manning vs thresholds), `raptor.ts` (`outboundToRaptor` — the sync stub), `bids.ts` (`BidState`/`source:'raptor'` ownership), `seed.ts`. |
| `state/store.ts` | Its own single store (React `useSyncExternalStore` shape), `setCell` the one grid writer, `ingestFromRaptor`, **the event writers `setDayEvent`/`setDayEventRange` (repeat) + `addEventBand`/`removeEventBand` (merge) + the `addEventType`/`updateEventType`/`removeEventType`/`resetEventTypes` library writers, all admin-gated; `state.eventDefs` persisted under `eventdefs`, `period.bands` read leniently in `readWar`**. Role: NOT persisted since the merge — `setRole` is called by Raptor's `resetSession` only. **`viewer` rides the same rule** (17 Aug 26 — WHICH PERSON is looking, mirrored from Raptor's `ME` by `sync.ts`, never persisted; lights that row and personalises the counter picker). `moveFigure`/`resetFigureOrder` are ADMIN-GATED at the write path (owner: the column arrangement is management's); `reconcile()` on load keeps a MEDICAL cell's `source:'raptor'` record — dropping it would strip a synced cell's ownership at every reload and let outbound re-mint Raptor's own row. `withdrawLeaveCell` (17 Aug 26) is `clearRaptorCell`'s mirror for the OTHER ownership — the two-way edit/delete retraction's one grid writer. |
| `state/storage.ts` | The storage seam — `memoryBackend` (the one the browser boots now, so Leave War is session-only and resets on reload like Raptor's `INPUTS`; `main.tsx` passes it to `lwInitStore`) and `localBackend` (the `leavewar:`-prefixed localStorage backend, still here but no longer wired in — kept for reference and tests). Deliberately NOT `HOOKS.storeBackend`; the future shared database backend replaces this seam. |
| `state/raptorRoster.ts` | Wire 0 — `projectPeople()`: the LW roster as a projection of Raptor's `PEOPLE` (skips ground crew + sentinels; band from `isInstr`; sxo carried). Installed at boot, never persisted. |
| `state/demoworld.ts` | The fresh-browser demo re-key — DEMO_MAP (16 seed people → Raptor aircrew, seat+band-equal by construction), the seed overlay, and the two idempotent backing inputs for the seed's Raptor-owned cells. Boot-time only; the 632 vendored tests stay blind by construction. |
| `sync.ts` | Wires 1+2+4 — three DERIVED reconcilers (outbound: approved cells → span-collapsed lw-tagged `INPUTS` rows, one `writeInputsBatch`, only on a non-empty diff; inbound: leave inputs → Raptor-owned cells per day, portions both ways, custom rounds OUT, reverse-clear, the clash list + its own subscription; **`runOilPass`**: published weekend/PH duty → raptor-owned FS/HS cells off the issued snapshot, `isNonWorkingISO` reading `DayInfo.ph` + 'off'-tagged events, reverse sweeps partitioned by cell vocabulary, leave wins a contested cell with a `kind:'duty'` clash), the SYNCING flag, `wireLeaveWarSync()`. **Wire 5 (17 Aug 26) rides wires 1+2 rather than adding a pass**: the four MEDICAL markers cross both ways — `medRowPortion` (AM/PM exact, a custom window ≤6h a half sided by its midpoint, >6h full; NOT leave's round-OUT), `lwTypeOf`/`INPUT_FOR_LW` bridging Raptor's `ATT B`/`ATT C` to the spaceless store form, and no approval gate outbound because medical is assigned, not bid. `wireLeaveWarSync` also mirrors Raptor's `ME` into `viewer` on every notify. The loop-breaker pair is documented at the top of the file. **`retractLwRow` (17 Aug 26, full two-way)**: called by `ui/inputedit.tsx`'s `commitInputEdit`/`removeInput` on an lw-tagged row — withdraws the row's war cells (`withdrawLeaveCell`, exact-notation, never Raptor-owned) under the SYNCING flag; an edit that CHANGES THE LEAVE also drops the `lw` tag so inbound re-lands the new shape Raptor-owned, but a REMARKS-ONLY edit keeps the tag (18 Aug 26 — `commitInputEdit` compares the exported `rowSig` before and after; an unchanged signature means the leave is the same, so Leave War keeps it). **Minted remarks are the date tail now, not "Leave War" (18 Aug 26)**: `withRemarksTail(prior, start, end, 'on')` → "till 17 Jul" for a span, "on 15 Jul" for a single day — the same helper (`engine/inputs.ts`) the Inputs-page calendar's `withTill` uses; `prior` carries a member's own detail across a DATE change (person\|type\|portion keyed), moving only the date token. A synced leave says how long it runs and the type column carries the code. **`runPoArchive` + `restoreArchivedPerson` (19 Aug 26)**: the post-out auto-archive pass (PO date arrived + `poArchive === true` → Raptor `archived = true`; real local clock; runs at boot and on both lanes) and the Quals drawer's restore (clears the LW posting FIRST, then un-archives) — plus `reprojectRoster`'s keep rule (an archived body WITH a posting window stays, identity frozen). Tested in `sync.test.ts` + `oilsync.test.ts` + `viewer.test.ts` + `poarchive.test.ts` (the last two are their own files because wiring the sync leaves a live Raptor subscription behind). |
| `ui/` | Matrix (the 365-column grid; now paints the event column colours + mounts the Event sheet), Chrome (its topbar + stage strip; the role toggle is deleted — see the comment there), the sheets (incl. `ManningSheet.tsx`, 19 Aug 26 — tap a count row's name: what it counts + the admin-editable amber/red lines), RangePicker, **`EventRows.tsx` (the two event lines — merged bands as colspan, red work text, tap-to-edit), `EventSheet.tsx` (the admin event editor + type library, on `Sheet`+`RangePicker`; `eventsheet.css`)**. `Sheet.tsx` is the shared shell every sheet is built on — scrim + the PAGE LOCK (17 Aug 26: `body.lw-sheet-lock`, counted so one sheet closing as another opens cannot unlock the page under the survivor), and `CounterSheet.tsx` now holds three: the figure picker (viewer's own numbers; admin-only ▲▼/Reset), `FigureBreakdownSheet` and `PersonFiguresSheet`. All stylesheets scoped under `#page-leavewar` (theme.css deleted as pure duplication) **with ONE deliberate exception: `body.lw-sheet-lock` at the foot of `bidpicker.css`, which is outside the wrapper because no page-scoped selector can reach `body` — do not "fix" it inwards, that silently kills the scroll lock; the class is `lw-`-namespaced instead.** Both `matrix.css` and `bidpicker.css` are WHOLLY wrapped, so an append after the closing brace lands outside the scope and loses to its +1 id specificity — insert inside (this bit twice in one session). Cascade note at the top of each file — the event column colours in `matrix.css` are ordered after weekend/blocked deliberately. |

### Tooling
| file | what it does |
|---|---|
| `probes/run.cjs` | Runs any reference probe against the reference build or the port. |
| `probes/perf-port.cjs` | The perf gate (`npm run perf`) — measures BOTH builds at once, round for round. Asserts a DOM ceiling per surface plus two behavioural checks; PRINTS the per-node timings without asserting them (10 Aug 26 — see §The gates, and how they lie). |
| `probes/adapted/` | Six probes re-expressed for this build (`wrap` `drop` `aar` `audit` `sa` `sc2`); `run-all.cjs` runs the set as `npm run probes:adapted`. |
| `src/testing/refwin.ts` | Boots the reference in jsdom for the parity tests; pushes the port's seed INPUTS into it and patches the in-memory reference for every deliberate divergence (`retier`, `remap`, `resim`, `rematrix`, `reinput`, `redn`, `relead`, `rebrief`, `rering`, `reduty`) so both engines compute from identical data. Each patch is explained beside the rule it serves in `docs/engine-rules.md`. NOT a test file. |
| `docs/probe-sweep.md` | The full probe → reference → port results table, and the performance gate's reasoning. |
| `docs/feature-impact.md` | The surfaces any change can touch (warnings, layout, history, board, edit/view-only, desktop/mobile, quals, availability, publishing, export, roles), the generic FLOWS one edit travels, and the drift-seams where two copies of a rule fall out of step (owner, 12 Aug 26). Walk every non-trivial change against it, and keep it true in the same PR. |
| `docs/remarks-vocabulary.md` | Every piece of text a scheduler can TYPE that turns a rule on — the seat tags, AAR, late show, IRT, the sim brief lead — plus the things that look like text triggers and are not. Written in a user guide's voice, for the guide the owner wants (10 Aug 26). A new text trigger belongs here as well as in `engine-rules.md`. |
| `docs/superpowers/specs/leavewar-sync.md` | The Leave War ⇄ Raptor sync DESIGN (16 Aug 26, spec only): wire 0 roster unification, wires 1–2 approved-leave⇄input both ways on the existing `ingestFromRaptor`/`outboundToRaptor` primitives, wire 3 counters (derived — the wire IS the decrement), wire 4 the owner's OIL rule (SC lines + duty rows from written timings, VCONF-editable thresholds, FS/HS credits). Build sync work FROM this file. |
| `docs/leavewar/known-gaps.md` | The vendored app's own limitations, carried over WITH a merge preamble that names what is superseded (the role toggle) and what is stale (its claims about Raptor). |
| `e2e/leavewar.spec.ts` | The vendored 69-test Leave War geometry/behaviour suite, run at two viewports (`lw-phone`/`lw-desktop` playwright projects). Boundary adaptations only (openLeaveWar login, `w.lwSetRole`, scoped selectors, the `#page-leavewar` DOM band) — its assertions are the standalone app's own, and its DOM band is the Leave War page's only size gate. |
| `docs/session-state.md` | The last session's leftovers — **often absent, and absent is meaningful**: it exists only while something is genuinely pending, and the session that clears the last item deletes it. This file holds the durable state; that one holds what a session could not finish. Written by `.claude/skills/session-handoff`. |
| `docs/superpowers/specs/` + `plans/` | Design specs and task-by-task plans from brainstormed features (the vendored superpowers flow). Historical records of WHY a shipped shape was chosen — the living contracts stay in `engine-rules.md` / `ui-contracts.md`. |
| `PORTING.md` | **Historical** — the phase plan the port was built from. Nothing left to run; kept only because `probe-sweep.md` and `perf-port.cjs` cite its decisions (dropped probes, original timing budgets). |
| `reference/` | The original single-file app + its 728-assertion suite. **Read-only** — the spec for existing behaviour, and one of the four gates. |
| `index.html` + `public/favicon.svg` | The Vite entry page and the **only** thing in `public/`. The favicon is the talon from `Login.tsx`/`Shell.tsx`, copied because a browser fetches it standalone before any bundle runs — edit the claw path in all three or the tab and the page disagree. It differs from the components on purpose: a tile and a same-colour stroke, because a tab paints it at 16px where bare thin claws vanish. `href="/favicon.svg"` in the page is rewritten to `./favicon.svg` by `base:'./'`, which is what makes it resolve under the Pages sub-path. |
| `e2e/` | The geometry gate (`npm run test:e2e`): `geometry.spec.ts` measures the layout contracts in a real browser — including where a warning click leaves the week and the board, and where it deliberately does NOT — and `app.ts` holds login/nav/scroll-settle helpers (`settle` takes an axis, `settleBoth` waits for both) plus `clickHere`, a click that does not scroll the target into view first (`page.click` does, which would defeat any test that parks the week on purpose). `playwright.config.ts` builds and serves the port itself. |
| `.github/workflows/deploy.yml` | Test-gated GitHub Pages deploy on push to main; four gates, geometry included. The same gates run on PRs into main, in a per-PR concurrency group so a PR run cannot cancel a live deploy. Browser download cached, geometry suite 3 workers + one CI retry (15 Aug 26). |
| `vercel.json` (repo root) | The ungated fast-preview channel (15 Aug 26): builds `raptor-port` and serves every branch/PR its own Vercel URL in ~1 min, for the owner to tap mid-session and for iterating drives. Pages stays the official gated site. See §Deploy and `CLAUDE.md` §Build & verify. |
| `src/ui/histlist.test.tsx` | The changes list's second pass (11 Aug 26) — the two entry points, a row jumping to its detail with the bubble pinned open, the grouped-by-detail view, and the phone's tap-to-expand control. The media-query split is in `e2e/geometry.spec.ts`, which is the only place it resolves (the day-carousel motion tests that used to sit beside it went with the swipe, 12 Aug 26). |
| `src/ui/boardrmk.test.tsx` | The empty remarks box and the `+` that reveals it (12 Aug 26) — which input carries `.empty`, that the reveal clears it for its OWN row only and focuses it, that typing one drops it unaided, and that asking for the box back writes NOTHING to the edit log or the pending set. jsdom cannot measure the 109px→79px row it buys; `e2e/geometry.spec.ts` does that. |
| `src/**/audit-*.test.ts(x)` | Three sweeps of 12 Aug 26, all keepers — they are the regression armour for corners nothing else tests. **The adversarial audit** over PRs 148–174, six agents (a=History/edit log, b=board nav, c=validation, d=sort/reorder, e=inputs): closed every gap this file listed and pinned twelve fixes (log keys remapped with the key space, day-aware accept deferral, `deletionWasIssued` under reorder, the relink's preserved extras and covered-day re-file, the scrub/handle button guards, the day-step commit, the carry-day fix, the numeric time sort). **The five suspects** it raised and the owner then closed: `audit-c-briefguard` (brief vs take-off, both directions), `audit-thinwin` (`inpWin` failing closed), `audit-gesture-bubble` (repaint re-check, drag-vs-scrub). **The guard-rail sweep**: `audit-guards` (`hmOK`, `minus`, the time cells, store renames, the rules load path) and `audit-guards-inputs` (input times, spans, the derived AM/PM label, and what stays allowed because it is a decision). |
| `src/ui/selrings.test.tsx` | The green eligibility rings (13 Aug 26) — the DOM agrees with `slotBar` on EVERY edit-week slot (the mirror test that keeps the rings from ever becoming a second copy of the rule), a mutation re-rings on the next paint (WARN-identity invalidation), rings clear with the selection, view-only and a selected placeholder never ring. The paints themselves (bright/dim/armed distinct, zero layout shift) are in `e2e/geometry.spec.ts`, because jsdom measures every rect 0×0. |
| `src/engine/personnel.test.ts` | The ground-crew category (Aug 26) — that a personnel derives empty quals and the boot grants nothing, `slotBar` bars a front seat and allows rear/duty/ground, and validate raises `QUAL` in a front seat, the `PAX_CREW`/`CP` advisory in a rear seat, and `DOUBLE_BOOK`/`LONGDAY`/`DAYS_RUN` while crew rest, turns, the matrix, AAR and the brief/debrief windows stay OFF. Plus the parity guards (`PAX_CREW` has a WCODE, and fires nowhere on the seed). |
| `src/engine/longday-msg.test.ts` | The long-work-day note's assumption wording (15 Aug 26) — a flying end prints the real landing + the `debrief assumed` pad, a non-flying end stays a bare clock time. The crew-rest tail's twin assertions live in `crewrest-ui.test.ts`. |
| `src/engine/sansavail.test.ts` | SANS Availability (14 Aug 26; rewritten for the one-window rework the same day) — `sansGate`'s five statuses against the flags + standard-window shape, one window serving every ticked event, the AM/PM presets; `sansWindow`/`sansLetters`/`sansBadge`; `slotBar`'s grey-out on a flying/OFT/AMT seat and the duty/ground carve-out; the `SANS_AVAIL` advisory (fires on not-offered/window, silent on no-record); the LEAK GUARD (a timed offer never reads as a timed absence — `isAway`, `day.input`, no hard clash); the parity-guard pair. |
| `src/ui/sanscards.test.tsx` | The SANS card grid (14 Aug 26) — the shared builder renders the same cards on the week group and the board panel, the order (bounded windows by start, then the fixed F/O/A→…→A combo order), a card's `data-inpedit` address matching `inpKey`, read-only cards carrying none, the board's empty state, the view-only week rendering nothing. |
| `src/ui/editlog-writers.test.tsx` | The write paths the edit log used to miss (11 Aug 26) — the six fields that assign to the model themselves and call `markEdit` by hand, and the three whole actions that reach it with no key. Drives the real gestures on purpose: the bug was in what the callers passed, so a test calling `markEdit` with two values by hand would have passed throughout. Also pins that deletions carry what they held (12 Aug 26) — a note's words with the 60-char clip, a duty row's role and man, a line's callsign and crew — through the real delete buttons. |
| `src/ui/boardnav.test.tsx` | The phone board's one-row top bar and how a day is reached (renamed from `boardswipe.test.tsx`, 12 Aug 26, when the swipe was replaced by two arrows) — the arrows step and stop disabled at both ends, the marked dot follows, the dots still scrub, the parked aircrew handle still forwards its vertical drag without opening the drawer, and a sideways drag across the board does NOTHING, which is the removal itself. It also pins the SPLIT day name (12 Aug 26 — `Wed` + a hidden `nesday`, so the phone stops ellipsing the date off the bar); jsdom can only see that shape, so the two halves that MEASURE it are in `e2e/geometry.spec.ts`. `boardbackground.test.tsx` proves `boardTab` fires the board lane once and the global lane zero times. Geometry and the production-browser stress live in `e2e/geometry.spec.ts`, because jsdom measures every rect as 0. |
| `src/state/demosans.test.ts` | The demo SANS seed (14 Aug 26) — shape, idempotency (`initStore()` boots twice against the same `INPUTS` array), the zero-`SANS_AVAIL`-warning proof against every seed record's own padded commitment, and the rendered card grid. |
| `src/ui/pubsweep.test.tsx` | The comprehensive publishing sweep (16 Aug 26, 28 tests) — scenario by scenario, asserting what the edit week, the board's publish strip and the view page each show: lifecycle, edit-after-publish, edit-and-revert across key families, structural round trips netting out, drafts-on-published-day rebase (including rebase-against-current-AL), load-onto-working-copy leaving `SCHED.cur` alone, reopen → re-publish, unpublish, and week-vs-board deep-equal agreement. Finding a live bug (the time-respelling pending mark) is what this file is FOR — keep extending it when publishing behaviour changes. |
| `src/ui/unavailedit.test.tsx` | Unavailable rows fully editable from the schedule (14 Aug 26, 16 tests) — the shared dialog's Person select (`canEditSched` only), the `iu:<iid>` arm-then-tap and drag-to-reassign paths on the week and the board, `reassignInput`'s relink on `commitInputEdit`, `rosterOptions` shared by all three editors, plus the Inputs-page sort-tie regression guards the same audit found (the stable-sort no-op on a second heading click, the `s`/`e` minute-0 `??` fix). |
| `src/engine/daytpl.test.ts` | Whole-day master templates' engine half (15 Aug 26, 20 tests) — the allowlist blob, crew-blanking and cx/flag/src stripping, `applyDayTpl`'s refuse-on-published and its direct-write/pending-added-retirement shape, persistence and untrusted-load field-by-field sanitising. |
| `src/ui/daytplui.test.tsx` | Day templates' UI half (15 Aug 26, 15 tests) — the `dayTplMenu` picker reached from both the board's button and the week's sign-off strip, `DayTplModal.tsx`'s tabs/rename/delete/reset, and the published-day "Reopen the day first" refusal toast. |
| `src/engine/drafts.test.ts` | Per-day drafts' engine half (15 Aug 26, 16 tests) — the stow model (`draftDup`/`draftSelect`, the live day IS the selected draft), the refusal rules (published day, already-selected id, the selected entry on delete, empty/duplicate names on rename), and the `'d:<id>'` shape `daySnapOf` resolves. |
| `src/ui/draftsui.test.tsx` | Drafts' UI half (15 Aug 26, 18 tests) — the `draftsMenu` picker on both surfaces, `DraftsModal.tsx`'s blur/Enter-commit rename and delete/select gating, and the view-only week's drafts-only picker (rendered only when a day has drafts; AL/ORIG previews never reach it). |
| `.claude/skills/session-handoff/SKILL.md` | The `/session-handoff` skill — decides whether `docs/session-state.md` is warranted, writes or deletes it, and checks this file was kept true against the session's own diff. Repo-level, so it ships with the clone the next session gets. |
| `.claude/skills/` (14 more) | `obra/superpowers` v6.2.0, MIT, vendored 7 Aug 26 — a plugin install lives in `~/.claude/plugins` on a local machine and never reaches a web session's fresh container, while repo-level skills ship with the clone. Cross-references de-namespaced; the upstream SessionStart hook is vendored at `.claude/hooks/` but **not** wired in. Provenance and the update recipe: `.claude/skills/SUPERPOWERS-VENDORED.md`. |
| `.claude/skills/impeccable/` + `.claude/agents/impeccable-*.md` + `.claude/settings.json` | `pbakaus/impeccable` v4.1.1, Apache 2.0, vendored 15 Aug 26 (owner wanted a design skill usable on THIS project from anywhere, phone included — so vendored, not globally installed). The skill (23 `/impeccable` commands + a design-detector), four subagents, and — unlike superpowers — a **WIRED** hook: `.claude/settings.json` runs the detector on PostToolUse (`Edit\|Write\|MultiEdit`) and Stop, both self-guarding on Node ≥22 (container has v22). This is the repo's ONLY `settings.json` — a later session adding project settings must MERGE, not overwrite, or the hook goes dark. Offline detector degrades to a regex undercount (missing `htmlparser2` et al.); the full path is `npx impeccable …`. Provenance, caveats and update recipe: `.claude/skills/IMPECCABLE-VENDORED.md`. |
| `.claude/skills/find-skills/` | `vercel-labs/skills` (the `find-skills` skill), MIT, vendored 15 Aug 26 — a single `SKILL.md`, guidance only (no scripts/hooks/agents, nothing in `settings.json`). Helps discover public skills via the `skills.sh` leaderboard + `npx skills find` (needs npm network). Complements the harness's own `SuggestSkills`/`SearchSkills` (org/Anthropic catalog) by covering the public ecosystem. Provenance and update recipe: `.claude/skills/FIND-SKILLS-VENDORED.md`. |
| `.claude/skills/task-observer/` + `.claude/hooks/task-observer-session-start.sh` + `settings.json` + `raptor-port/CLAUDE.md` | `rebelytics/one-skill-to-rule-them-all` (skill `name:` **task-observer**, "One Skill to Rule Them All"), CC BY 4.0 © Eoghan Henn, vendored 15 Aug 26. A meta-observer that watches a session for reusable-skill opportunities. **Full activation WIRED** (owner chose it): a `SessionStart` hook (matcher `startup\|clear\|compact`) MERGED into `settings.json` alongside impeccable's `PostToolUse`/`Stop` — that file now holds all three events, preserve them all — plus a "Task-observer activation" paragraph in `raptor-port/CLAUDE.md` §How to work here. Bundle only (SKILL.md + 3 refs + LICENSE; the marketing PNGs/README/USER-GUIDE were left upstream). Caveat: its observation log needs a STABLE path and does NOT persist on this repo's ephemeral web/phone containers — handoff-doc mode or commit the log. Provenance, opt-out and update recipe: `.claude/skills/TASK-OBSERVER-VENDORED.md`. |
