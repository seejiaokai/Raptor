# LEAVE WAR — known gaps

> **Vendored into RAPTOR 16 Aug 26** (`src/leavewar/`, the Leave War tab).
> This file came over from the standalone leave-war repo as the record of
> what that app knows about itself and did not fix. Read it with the merge
> in mind:
>
> - **The role switch is GONE.** The "affordance, not a permission" entry
>   below described the standalone app's on-screen member/admin toggle.
>   Since the merge the role is derived from the Raptor login on every
>   session change (`resetSession` → leavewar `setRole`) and is no longer
>   persisted. The affordance-not-security caveat still stands — Raptor's
>   auth is itself a prototype with hard-coded accounts.
> - **Its claims about Raptor are stale.** Entries below saying Raptor
>   holds only LL/OL/OIL, or reads every leave as a whole day, predate
>   Raptor's INPUT_META growing all eight leave types with half-day
>   awareness. The current sync design is
>   `docs/superpowers/specs/leavewar-sync.md` — plan from there, not from
>   here.
> - **"No shared data" is now the SAME missing server as Raptor's own
>   first HANDOFF bullet** — one backend replaces `leavewar/state/
>   storage.ts` and Raptor's `HOOKS.storeBackend` together.

What this branch knows about itself and did not fix. Written because the
subagent progress ledger these were first recorded in is git-ignored scratch,
and a limitation that leaves no trace in the repo was not deferred, it was
dropped.

Each entry says what it is, why it was not fixed, and what would fix it.

## Blocking squadron use

**No shared data.** Every write goes to the browser's own storage, so forty
people bidding is forty private copies and management approving is a
forty-first. This is the single thing between the app and real use, and it is
the next phase of work. Until it lands this is a prototype the owner can judge,
not a tool the squadron can use — the spreadsheet at least sits where everyone
can open it.

**What it has to become (owner, 10 Aug 26): everyone sees the same grid in
real time.** An input appears for everybody as it is made, and so does every
change of state — a cell going green or red as it is decided. That is a
stronger bar than "shared": it rules out a design where each browser reads a
snapshot and only notices someone else's bid on reload, which is the shape a
plain REST store would give. Whatever replaces `storage.ts` has to push, not
just persist.

Everything is built to make that change small: all persistence goes through one
module (`src/state/storage.ts`), and every write goes through one function
(`setCell`). Nothing else in the codebase touches either.

**Since the Raptor merge (17 Aug 26) the app boots on the seam's `memoryBackend`,
not `localBackend`** — so a leave war lasts the session and resets on reload,
deliberately matching Raptor's session-only `INPUTS` (the paragraphs below that
describe data surviving a reload are the standalone app's behaviour, superseded
by this). `localBackend` is still in `storage.ts` for reference and tests; the
future shared backend that "pushes, not just persists" replaces the seam.

Storage now holds five keys, not one: `wars` (each carrying its own period,
grid and states), `current`, `role`, `openings` and `ledger` (plus the admin
config keys since — `oilpolicy` among them, 2 Sep 26). They are written together by a single `persist()` so
no path can save one and forget another, and `initStore` reconciles each
war's grid and states on load — a stored state whose cell no longer holds a
bid is dropped rather than left to colour the wrong cell.

Stored states written before bids carried a source are **bare strings**, and
they are migrated on load rather than rejected: a string could only ever have
meant a bid placed here, so `source: 'bid'` is a fact and not a guess.
Rejecting them would have degraded a squadron's real decisions to the seed to
gain nothing.

## The role is an affordance, not a permission

The war's role now RIDES THE RAPTOR LOGIN (resetSession is its production
writer; the admin's view-toggle is the only other), and since the 27 Aug 26
overnight pass the store enforces it at every write path: a member cannot
decide (`setBidState`/`setBidStates` check `canDecide` — admin, once bidding
is no longer open), cannot advance or reopen the stage, cannot write a
medical marker, cannot touch another person's row (`canEditRow`), and cannot
shift a bid outside what `canEditCell` lets them edit — the single-cell
`shiftBid` now carries the same stage/window/day law as the drag mover.

**It is still not a security model.** The whole app is client-side with no
server: the probe bridge (`src/probe-bridge.ts`, the e2e suite's window
hooks — `lwSetRole`, `lwSetViewer`, `lwLoadWars` and the Raptor writers)
ships in the served bundle, so a browser console can forge any role or
identity. That forgery only ever rewrites the forger's OWN session-local
copy — there is no shared data to corrupt until the server exists — and the
bridge is what the six gates drive the built bundle with, so it stays. The
real check is the future server re-running these same rules where a console
cannot reach; the rule bodies (`canDecide`, `canEditRow`, `canEditCell`) are
the shape it will keep.

A member no longer bids on anyone's row, though (owner, 27 Aug 26 — "if I am
viewing as a member and I view as ranger… I shouldn't be able to input on
other people's row except mine"). The identity the bidding plan reserved for
`ME` now exists as `viewer` — the war mirrors Raptor's "View as" person — and
`canEditRow` (engine/stages.ts) scopes a member to that one row at the write
path (setCell, the range/batch writers, move and shift) as well as in the grid
(a member's tap and drag reach only their own row). An admin is scoped to none.
This is real for the `member` role, but it is still not a security boundary:
the role switch itself is unguarded, so a member can flip to admin and bid
anywhere. The scoping and the identity are the shape the accounts will keep;
the missing check is the login that stops the flip. (`viewer` is only ever
null in the raw store / tests — the "View as" picker has no empty option and
boot mirrors `ME`, always a person — so an un-scoped session imposes no row
rule, which is why the tests still bid on whichever row they name.)

## What balances do not yet do

Balances are computed and on screen. Two parts of §Counters are not built:

- **Earned OIL is BUILT (sync wire 4, 17 Aug 26; REWORKED 28 Aug 26)** —
  and not the way this
  bullet used to describe. The old spec's knock-off-time rule (later than
  14:30 credits 1.0) is superseded, twice over: first by the owner's 17 Aug
  scheduled-hours rule (an SC shift-window split beside a duty-hours sum),
  then by his 28 Aug uniform rule, which DELETED the SC shift-window half
  (`scShiftCredit` is gone — do not resurrect it). What runs now
  (`engine/oil.ts`): a person's worked minutes for the day are the ENVELOPE
  of everything they did — first start to last end, gaps included
  (`envMin`; owner, 29 Aug 26 — between events "they are still in
  squadron"; this replaced the 28 Aug interval-union sum), one threshold —
  under `VCONF.oilFullMin`
  (361) is HO (0.5), at or over it FO (1.0) — across SC MAIN shifts, flying
  seats (report→debrief), sims, duty rows, ground and Common Programme
  rows, on weekends and days this app calls
  a holiday — `DayInfo.ph` or an 'off'-tagged event. Acknowledged
  duty-&-commitments input claims (`row.oil`, the OilConfirm ask-flow)
  stretch the same envelope. The credit lands as a
  raptor-owned FO/HO cell (FS/HS until the 28 Aug 26 rename), and the OIL
  balance is
  `opening + grants + earned − drawn`, `earned` derived straight from the
  FO/HO cells' `earnsOil` (`counters.ts:earnedOil`) — a ledger entry for the
  same fact would be the two-records-of-one-fact this engine refuses. The
  **OIL BAL figure** joined the counter column as its landing strip. The
  wire itself: `src/leavewar/sync.ts` `runOilPass`, tested in
  `src/leavewar/oilsync.test.ts`.
- **RESOLVED 2 Sep 26 — the OIL TRACKER is both the grant sheet and the
  ledger view (owner ask).** `ui/OilTracker.tsx`, opened from the toolbar
  button beside Auto-sort (both roles) or from the Cinch sheet's OIL BAL row.
  Everyone's OIL BAL in the roster's grouped order; one person's ledger
  newest-first — every credit (an earned FO/HO day with its derived reason
  `weekend duty`/`PH duty`, an admin's grant with its reason and approver,
  the opening figure) and every OIL day taken. An ADMIN credits OIL (any
  number — negative is a correction — a date from the calendar, an open-text
  reason) to one person or to a picked/dragged/Select-all batch in one
  write (`store.ts:grantOil`, ids `ol-N`, approver = the viewer's callsign),
  edits or deletes a grant in place (`updateLedgerEntry`/`removeLedgerEntry`),
  and sets the POLICY (`setOilPolicy`, persisted `oilpolicy`): how long a
  credit lasts — N days / N months from its own date, or forever — and the
  default history window (from the first entry — the default since the
  third cut — or N months back). The
  engine half is `engine/oiltracker.ts`, PURE and DERIVED: **a taken day
  draws the OLDEST credit first** (FIFO; a credit already expired on the
  taking day is skipped), whatever is left of a credit past its expiry is
  `expired` and leaves the balance, the opening figure never expires, and
  what no credit covers is overdraw (shown negative, never refused). With
  NO expiry the tracker's balance is byte-identical to `balanceOf(…,'oil')`
  (pinned for every seeded person) — so `OIL BAL` is now the tracker's
  balance everywhere (`counters.ts:oilLedgerOf`), the breakdown grows an
  `expired` row only when something did, and the bid-time "leaves you at −x"
  warning reads OIL the same way (`Matrix.tsx:wouldLeave`). One
  `store.ts:figureCtxOf()` feeds every figure surface so none can drift.
  Earned days are STILL not ledger entries — the FO/HO cell is the record
  and the tracker reads it; the grants the ledger holds are the only rows
  an admin can touch. Members see everything and edit nothing (absent
  controls; the store refuses regardless).
  **REBUILT the same day as ONE FULL-SCREEN GRID (owner, 2 Sep 26 — second
  cut, after the first two-view sheet):** `Sheet full` (`bidpicker.css
  .bidsheet.full`) pinned to the screen; the tracker's own `.oil-wrap` is the
  one 2-D scroller (name + BAL frozen left, header rows sticky top). One row
  per person under the roster's group headings; BAL over a `+in −out` line
  for the window — everything credited (the carried-in opening figure +
  grants + earned) as `+`, everything drawn (taken + corrections + a negative
  opening) as `−`, so `+ − − === BAL` in the default full-window view (owner,
  2 Sep 26 — "shouldn't we count the opening balance? … as added"); a side
  with nothing shows no number (digits aligned, signs hanging); then one LANE per
  calendar year in the window (the year is a header row; every row's boxes
  for a year start at the same x). A BOX is one credit and reads as a small
  ledger — amount + date + **given by** top (`AUTO` for an earned day; the
  admin's optional `givenBy` on a grant, `LedgerEntry.givenBy`), the reason
  under it (the sync wire's `FLT` / `SIM` / `Duty` / an input's type name,
  written to the FO/HO cell as `BidRecord.note` — `ingestDutyCredit(…, why)`;
  an admin's own note on a hand-typed FO/HO via `setCellNote`), the days
  TAKEN from it in red (its FIFO draws), and what is left bottom-right.
  Used up → amount, date and reason struck; expired → the same, on a green
  amount. Both sit on a dark-grey fill (`#21262d`, 2 Sep 26 — see the FIFTH
  CUT note) that reads them apart from the flat live boxes, with the takes and
  `n left` fully legible. A day taken with nothing left to draw from is its own red
  box; an admin's correction (negative grant) is its own editable box. The
  per-person page is GONE: the Cinch's OIL BAL tap scrolls to that row. An
  admin taps a name to pick it, or hold-then-drags (finger) / drags (mouse)
  down the NAMES to pick a run — `select.ts:wireRowSelect`, the grid's own
  gesture core (`wireGesture`) — and the credit bar docks under the grid
  (headed `OIL credits · <names>`; amount, date, reason, given by, Save; a tap
  anywhere outside the bar cancels the pick with no save — there is no Deselect
  button, owner 2 Sep 26); idle it reads the tap-or-hold hint. An admin's manual OIL / FO / HO write on the grid opens the
  tracker on that person with the day's box lit, and any credit, edit or
  delete snaps the counter column to OIL BAL. A `?` chip holds the legend.
  Nothing on the page is under 11px.
  **THIRD CUT the same evening (owner, from the shipped grid):** every take
  is its OWN ROW inside the box and `n left` is pinned bottom-right whatever
  the row's height (the box's last line carries `margin-top:auto`; on a
  narrow box it wraps under the takes rather than colliding); the CAT chip
  sits UNDER the name on every row, 8px, idle rows 36px; the window opens
  "from first entry" (`DEFAULT_OIL_POLICY.historyMonths: null` — "Last 6
  months" stays a chip); and a DEAD credit — used up, or expired — is
  ARCHIVED: it leaves the strip and is counted in the thin frozen ARCHIVE
  column beside BAL (the word standing on end, bottom → top; a muted count
  per row), one tap on which brings every archived box back into the lanes
  in date order — ONE switch for the whole grid, session-only, opens closed.
  A live credit with some draws never archives (it is still money); an
  uncovered take and a correction never archive (they are what makes a
  negative balance visible). "OIL lasts forever" is the shipped default
  (`expiry: null`) and was verified, not changed. The demo carries a boot-only
  OIL story (`state/demoworld.ts DEMO_OIL` through `store.ts installDemoOil`,
  laid in BEFORE the re-key so DEMO_MAP dresses it) so the preview shows every
  shape — an archived opening figure, a part-drawn credit with stacked takes,
  a correction, an untouched grant with a giver, a 2027 lane, a row whose only
  credit is in the archive; its earned days are HAND-TYPED FO/HO with a note,
  because an owned FO/HO the schedule does not back is swept the moment the
  wires run.
  **FOURTH CUT (owner, 2 Sep 26, from the shipped phone toolbar):** the tools
  row is one line now — `From first entry`, a calendar button reading RANGE
  (`.oil-cal`, the old "Pick dates"), then the `?` and an icon-only ⚙ (its
  "Settings" word dropped) pushed right — with the window label (`1 Jan 26 –
  today`) on its own thin line below, so the grid starts higher. The "Last N
  months" chip is GONE from the everyday toolbar; it renders only when an
  admin has made a months window the default in Settings
  (`oilPolicy.historyMonths !== null`), which the settings default and its
  test still exercise. The `?` legend was cut to a few lines.
  Also from the shipped grid: the credit bar is headed `OIL credits · <names>`
  (was `Credit …`) and a tap anywhere outside it cancels the pick with no save
  — the Deselect button is gone. The RANGE date picker folds away the same way
  (a tap outside it closes it, not just its Done button — owner, 2 Sep 26).
  **FIFTH CUT (owner, 2 Sep 26 — "can archive boxes have a dark shade of
  grey"):** the archived boxes (used-up / expired) now carry a dark-grey fill
  (`#21262d`) so they read apart from the flat, unfilled live boxes. The old
  whole-box `opacity` fade (was `.7` used / `.55` expired) is GONE — the fill
  plus the existing strike-through carry "spent", and the fade was quietly
  dragging the red takes (the audit trail) below legible contrast on the
  expired boxes (WCAG 3.8:1). With no fade, every text on the box is lighter
  than the fill, so a darker grey only raises contrast — the shade is safe to
  tune (an `/impeccable` audit vetted it). If the owner ever wants archived
  boxes faded as well as grey, a gentle `opacity: .9` is the dial.
- **An admin can SET the LVE BAL (2 Sep 26, owner ask — "manually input and
  change LVE BAL … every time a LL or OL is taken it deducts from it").** A
  `Set` beside the Cinch sheet's LVE BAL row; `store.ts:setBalance` moves
  the OPENING FIGURE by whatever makes `opening + granted − drawn` read the
  typed number, so leave already on the grid stays counted and every LL/OL
  after it deducts as before — no stored balance, the breakdown explains
  the new opening. Any counter, though only `annual` has a control.

Also note the derivation, because it narrows the spec deliberately: §Counters
says every change to a counter is a ledger entry, and **leave taken is not
posted to the ledger here**. The grid is already that record, and a second
copy of it would be a second version of the truth. The ledger holds only what
the grid cannot know.

## The counter column is figures, not raw counters (Aug 26)

The frozen column no longer cycles the seven entitlement counters. It cycles
THIRTEEN named figures (owner's set; `OIL BAL` joined with wire 4; `OFF USED`
was the twelfth until 2 Sep 26 — owner: "remove the OFF used counter" — and
OFF itself stopped being a leave code later that day; `CL BAL` and `CL USED`
joined 3 Sep 26 with the compassionate-leave code), each labelled `BAL` (a
balance left) or `USED` (days taken):

    LL USED · OL USED · OIL USED · OIL BAL · CCL USED · PL USED ·
    FCL USED · CL BAL · CL USED · MED USED · OML USED · LVE BAL · LVE USED

- **Ten are consumed (`USED`)** — days of that type taken, read per-TYPE by
  `takenOf` (not the per-counter `drawnFrom`, which cannot tell LL from OL —
  both spend the one annual pool). Two are aggregates: `MED USED` = ATT C + HL +
  OML, `LVE USED` = LL+OL+OIL+CCL+PL+FCL+CL (medical deliberately excluded; OFF
  left the sum on 2 Sep 26 when it stopped being a leave code; CL joined it
  3 Sep 26 — leave taken, from its own pool).
- **Three are balances (`LVE BAL`, `CL BAL`, `OIL BAL`)** — the annual pool and
  the compassionate pool, each `opening + grants − drawn` (admin-settable from
  the Cinch sheet — LVE BAL since 2 Sep 26, CL BAL since 3 Sep 26; every
  balance figure names its counter, `Figure.counter`, and that is what the Set
  button keys on), and the OIL tracker's balance; all can go negative and red.
  The other entitlement balances (CCL/FCL/PL/EL) are still computed by
  `balanceOf` and used by the bid-warning path, but are NOT surfaced in the
  column — the owner asked for exactly the figures above. EL is dropped from
  the column yet stays a valid biddable code.
- **A weekend or public-holiday day of leave CHARGES NOTHING (owner, 3 Sep 26
  — "if they fall on a weekend or a PH … it won't deduct from the total
  balance nor used").** `engine/charge.ts:chargedDays` decides which
  counter-bearing cells draw: it walks a person's taken cells across EVERY war
  in date order and excuses any that `isNonWorkingDay` (eventdefs.ts — a
  weekend, the war's `ph` flag, or an event word tagged `off`, the admin's PH)
  calls non-working. `drawnFrom`, `takenOf` (so every USED figure), the OIL
  tracker's debits and `setBalance` all read that ONE map, so the column, the
  breakdown, the bid-time warning and the Set control cannot disagree. The
  cell itself still stands and still removes the man from manning
  (`removesAvailability` is untouched) — he IS away on the Saturday, it just
  costs him nothing. A PH marked AFTER the leave was approved excuses the day
  the moment the tag lands, because nothing about a balance is stored.
  Medical markers spend no counter and are untouched (hospitalisation over a
  weekend is still hospitalisation — MED USED counts every day). **The one
  exception is the pilots' 15-day rule** (owner: "for pilots only, if the
  leave taken is 15 days or more, count every single day"): a RUN is
  consecutive calendar days each holding a taken, FULL-DAY cell that spends the
  SAME counter (LL → OL continues one — both are the annual pool; OIL/FCL/CCL/
  EL/PL/CL, a medical day, a blank, a refused bid — or a HALF DAY — ends it,
  the last because "the run is a continuous run of full days" (owner, 3 Sep 26)
  and a half day means the man was at work for half of it; a half day itself
  charges its own half on a working day but never joins a long run), and a
  pilot's run of
  `LONG_LEAVE_DAYS` (15) or more charges every day in it, weekends and PHs
  included; a shorter run, or anyone whose `seat` is not `pilot`, charges
  working days only. A run may cross a war boundary. The roster and the
  event-type library reach the engine through `CountCtx` (`eventDefs`,
  `people`), carried on `FigureCtx` by the store's `figureCtxOf()`; an engine
  caller with neither still gets the weekend rule but never the pilot rule.
  Pinned in `engine/charge.test.ts` and the Cinch-sheet cases in
  `ui/oiltracker.test.tsx`.
  **Open question, deliberately asked rather than decided:** the bid sheet's
  "would leave you at −N" warning still counts every day of the span
  (`wouldLeave` multiplies by the day count), so a span over a weekend warns
  a little early; it is a warning, never a refusal, so it errs on the safe
  side.
- **The order is persisted (`figorder`) and ADMIN-GATED since 17 Aug 26**
  (owner: "normal user should not have authority to change the leave war
  column arrangement") — the ▲▼ and Reset render for an admin only and
  `moveFigure`/`resetFigureOrder` refuse a member at the write path; the
  figure SELECTION stays ungated view state. `orderedFigures` heals a stale
  saved order — an unknown id is dropped, a newly added figure appended.
- **The picker sheet is also the legend** (owner: "show the legend as a
  bubble"): the USED/BAL key and the two aggregates' compositions render
  inline. **Since 17 Aug 26 its rows answer with the VIEWER's own numbers**
  ("your numbers — <callsign>", each row "N taken/left, yours") — the
  viewer being Raptor's "View as" person, mirrored into `state.viewer` by
  the sync wire (never persisted). **With no viewer on the roster the row
  now reads a DASH, not a squadron-wide sum** (owner, 18 Aug 26: "I don't
  need to see totals when no one is picked… it defaults to the account
  viewer") — the figure answers "how much do I have left", which has no
  meaning without a person.
- **The viewer's row is lit on the matrix** (same ask) — `tr.me`, a solid
  tint on the frozen callsign+counter pair and a faint band across the row.
  The CSS lives INSIDE matrix.css's `#page-leavewar` wrapper — a rule
  appended after the closing brace loses to the wrapper's +1 id specificity,
  which is exactly the trap the file's header warns about.
- **Any callsign tap opens that person's ALL-FIGURES sheet, for every role**
  (owner: "everyone should be able to click on that person's name and see
  these logics") — the eleven figures with that person's numbers, each row
  opening its parts breakdown (the OIL BAL row opens the OIL TRACKER instead,
  2 Sep 26); an admin reaches the person EDITOR through
  the sheet's "Edit person" button (the old direct-to-editor tap), and sets
  the LVE BAL from its row.
- **Medical is FOUR markers now** — `ATTB` (shown as a bare "B" on the grid),
  `ATTC` (shown "C"), `HL`, `OML` — B joined 17 Aug 26 ("u can indicate,
  B (att b), C (att c), OML, HL"), and since the same day they TAKE PORTIONS
  (`*OML` a morning, `HL*` an afternoon; a half counts 0.5 in MED USED). ATT B
  deliberately feeds NO figure (the owner's MED USED sum names the other three)
  and removes nothing from manning — no flying, but at work, matching Raptor's
  own meaning of the code. Still assigned, not bid, but **the cell-entry UI now
  exists**: the cell sheet shows a Medical row of the four chips to an ADMIN
  only (whole day default, AM/PM the halves, range supported); members file on
  Raptor's Inputs page and the record syncs across (the spec's Wire 5 — an
  ATT B / ATT C / HL / OML input lands as a read-only raptor-owned cell, an
  admin-marked cell lands as an lw-tagged input, no approval step either way).
- **Tapping a person's counter CELL opens the breakdown** (owner, 17 Aug 26):
  MED USED as its ATT C / HL / OML rows, LVE USED as its seven codes, a
  balance as opening + granted (+ earned) − taken, any single-code figure as
  its one line — parts signed so they visibly sum to the total
  (`figureParts` in counters.ts, `FigureBreakdownSheet`). The column HEADER
  still opens the figure picker; the two controls answer different questions.

## The owner's review of 10 Aug 26, and what it settled

Twelve pieces of feedback from a phone. What they changed is in the spec; what
they SETTLED is here, so it is not relitigated:

- **The year is the sheet; bidding opens on a range inside it.** A quarter is
  never a war of its own again. Asked and answered when their screenshot
  showed "JUL - SEP 26" being created inside a year-long 2026.
- **A bid nobody has answered carries no colour.** Purple means management has
  acknowledged it. This is why `acknowledged` exists at all.
- **`OFF` is NOT a person's leave — it is a management OFF DAY event
  (2 Sep 26, reversing 10 Aug 26).** The owner: "off is never credited to
  individuals, it is only declared OFF to a period or a day … given by the
  management for free". So the `OFF` leave code is gone from the catalogue,
  the bid chips, the Inputs TYPE list and LVE USED; what replaced it is the
  `free` EVENT KIND (`eventdefs.ts`, seeded as **Off day**): declared by an
  admin on the event rows for a day or a band, it tints the whole column
  light grey (`evfree`), and WORK ON IT EARNS NOTHING — only a weekend or a
  PH (`off`) does (`sync.ts:isNonWorkingISO` is unchanged, `free` is not
  `off`; precedence `off > free > nolv`). Like PH it only tints: a bid on an
  Off day is still allowed, and manning is untouched. A legacy `OFF` cell in
  a stored grid is an unknown code now — it draws from nothing and counts as
  nothing.
- **`OD` counts the manpower as gone**, and always did. Pinned at the count
  level now.
- **There is no PCL.** See the leave-type section below.
- **Events are the scheduler's**, not the bidder's: admin-only to write, and
  everyone reads them.
- **The category is still derived.** The roster sheet edits seat, band and
  SXO — never the category itself — because that derivation is what lets
  Raptor's roster replace this one without a migration.

## Wars, and what is not built about them

An admin can create a leave war over any span and switch between them. Three
things are deliberately absent:

- **No war can be deleted or renamed.** Nothing removes one, which is why
  `wars` is never empty and `withCurrent` can fall back to the first. A war
  created by mistake stays.
- **A war's requirements are shared, not per-war.** `Requirements` still sits
  at the top of the store, so every war is judged against the same manning
  rules. Real squadrons vary them by period; the rules editor is where that
  belongs.
- **Nothing stops a war being created in the past**, or a hundred of them.
  There is no sanity bound on the dates beyond "end not before start" and
  "no overlap".
- **The seeded wars now cover the whole of 2026 and 2027**, one year each,
  because the owner reads the year at once (10 Aug 26). A consequence worth
  knowing before writing a test: **there is no free date nearer than 2028**,
  so anything creating a war has to reach that far out or be refused for
  overlap. Two e2e tests and several store tests moved for exactly this.
- **The bidding window does not bind an admin**, and never overrides the
  stage. It holds the SQUADRON to the part of the year the schedule has
  reached; a closed war is closed to them on every date, window or no window.
- **A window is refused, never clamped.** An admin who typed the wrong year
  has made a mistake worth being told about; sliding their dates to the
  period's edges would leave them believing they opened something else.
- **A month is only navigation, never a filter.** The strip scrolls the year
  to a month; it does not narrow the grid to it. That was the owner's ask —
  see the whole year, jump to a month — and it matters because a filter would
  hide the manning counts either side of a boundary, which is where a leave
  clash actually shows up.

## Removing a leave type is a breaking data change

Twice over, on the same day. `FCL` was removed on the morning of 10 Aug 26,
and that afternoon the owner settled the confusion that caused it: **there is
no PCL.** This author could not tell FCL from PCL, guessed there were two,
and removed the wrong one. The catalogue now carries `FCL` — family care
leave — and no `PCL` at all. `PL` is unrelated and unchanged.

The counter list is derived from the code catalogue, so a counter follows its
leave type in and out with no other file edited — the property both changes
proved. But **stored balances that still name a counter the catalogue no
longer has are rejected on load**, and `openings` or `ledger` falls back to
the seed entire rather than dropping just the stale entries. Anyone whose
browser holds a balance from this morning naming `pcl` gets the seed back.

That is the established rule for every stored shape here (an unknown value
means the blob is not trustworthy), and it is the right default while this is
one browser's own storage. It stops being acceptable when the shared backend
lands and a removed code could discard a squadron's real balances: at that
point a removal needs a migration, not a fallback.

## The RAPTOR clash has nowhere to go

`ingestFromRaptor` returns `clash` when an inbound input lands on a date the
squadron already bid differently, and **nothing displays it**. The value is
returned to the caller and dropped, because until the wire exists the only
caller is a test. The rule is right and tested; the surface it needs does not
exist. Build it with the wire, not before.

## The geometry gate claims less than it appears to

`npm run test:e2e` runs its "phone" project as **Chromium with an iPhone
viewport, not WebKit**, because the container ships no WebKit build. The
viewport, touch, user agent and scale factor are emulated; the rendering engine
is not the one real iPhones use.

This matters more than it usually would. The gate's whole purpose is the frozen
column and sticky header, and `position: sticky` inside a `<table>` is exactly
where Blink and WebKit have historically diverged. So the gate proves the layout
holds in Chromium and infers the rest.

Run the gate against real WebKit before the squadron opens this on iPhones. It
is a one-line config change wherever a WebKit build is available; nothing in the
test code needs to change.

Narrowed on the phone since 20 Aug 26: the roster's two frozen columns are no
longer `position: sticky` there — they are drawn once in a `.mxband` overlay
outside the sideways scroller (HANDOFF's frozen-columns block), which is
ordinary absolute positioning Blink and WebKit agree on. So the sticky-in-table
divergence now only rides the phone's frozen HEADER (the `.mxfixed` mirror, its
own machinery) and the DESKTOP's still-sticky columns. Still worth the WebKit
pass, but the riskiest surface — sticky cells on 80 scrolling rows — is off the
phone now.

## The sideways-flick momentum on `.mx-wrap` — UNSOLVED, and abandoned by owner (30 Aug 26)

The Leave War grid scroller (`.mx-wrap`) has no iOS inertial (flick) momentum —
a sideways scroll stops dead the instant the finger lifts, while the vertical
page scroll AND the Quals grid (`.qwrap`) both glide. On the owner's iPhone
Chrome, Edge and Safari all share WebKit, so this is a WebKit behaviour, not a
Safari-only one. After several rounds on his actual device the cause is still
NOT identified, and the owner has chosen to STOP (30 Aug 26 — "this is the last
try. If not I'll just skip it. Since more ppl may use the view vertically in
portrait"). The last try failed, so the feature is dropped and the code is back
to the glued-bar baseline. **The glue STAYS ON — the sticky date bar is the
thing that matters in portrait, which is the main view.**

**Everything tried on the device, and DISPROVED — do not re-try any of these:**

1. **The row-window re-centre "nudge"** (`wrap.scrollLeft += shift` when a
   posted-out row hides and the columns re-narrow). Skipped on a touch flick
   (`Matrix.tsx`, coarse pointer + the `jumpAtRef` jump exception). Did NOT
   restore the glide — the flick is dead even at the TOP of the list, where no
   row hides and the nudge never runs. So the nudge is not the (only) cause.
   The skip + jump exception are KEPT anyway (a `scrollLeft` write mid-fling
   would stall momentum, so the guard is correct belt-and-braces; the jump
   exception is load-bearing for month navigation — the e2e "a month button
   scrolls the grid to that month" test pins it). Just not the fix.
2. **The scroll-timeline glue** (`sdaActive`/`.lw-sda`, `scroll-timeline: --lwx x`
   on `.mx-wrap`). The plausible WebKit theory was that a scroll-timeline SOURCE
   loses its fling. DISPROVED on device 30 Aug 26: gating `sdaActive` to
   fine-pointer only (glue off on touch) did NOT bring the glide back in
   landscape AND it BROKE the portrait sticky bar ("now the portrait doesn't
   stick and landscape still the same"). This matches the 28 Aug reason the glue
   was built: the JS-mirror fallback bar does not read as "stuck" on the real
   iPhone, it needs the compositor glue. So the glue is exonerated as the killer
   and REQUIRED for the sticky bar. **Do NOT drop the glue on touch again — it
   is a double regression.**
3. **`overflow-y: hidden`.** Removing it changed nothing on device — not the
   cause of the dead fling. (It was left off from 30 Aug to 5 Sep 26 on the
   belief that no height cap meant no vertical overflow to need it. That belief
   was wrong on iOS: with the axis computing to `auto`, WebKit gives the native
   scroll view whatever vertical overflow layout produces, and any stray pixel
   makes the wrapper rubber-band vertically when a finger lands on it mid-fling
   — the owner's 5 Sep recording. It is BACK, momentum-neutral per this very
   A/B; see the `.mx-wrap` comment in matrix.css.)
4. **`-webkit-overflow-scrolling: touch`.** Removed so `.mx-wrap` matches the
   gliding `.qwrap` exactly (`overflow-x: auto`, nothing else). A no-op on modern
   iOS; the flick still died. Not the cause.

**Ruled out by code-tracing, not device (so lower-cost to trust):** the
drag-select machinery (`select.ts`) is fully passive on a quick flick — its
non-passive `touchmove` and `touch-action: none` are attached only inside
`arm()`, which a flick never reaches; the rAF pump (`syncMirror`) reads
`wrap.scrollLeft` and writes the BAR's, never the wrap's; the bottom-scrollbar
sync is desktop-only. During a top-of-list finger coast nothing JS writes
`wrap.scrollLeft`.

**Still unexplained — the open lead for any future attempt.** `.qwrap` (Quals)
is asserted to glide and `.mx-wrap` does not, yet after the above they carry the
same scroll properties. The difference must be structural and NOT yet examined:
the ANCESTOR chain (`.mx-outer` → `.card`/`.stage` → `#page-leavewar` → the app
shell) — an ancestor with `overflow`/`overflow-x: hidden`, a `transform`, or its
own scroll container can disable inertia on a nested iOS scroller. That
comparison (`.mx-wrap`'s ancestors vs `.qwrap`'s, on the real device) was never
done and is where a next attempt should start — but only if the owner re-opens
this. As of 30 Aug 26 he has closed it.

## Deliberately deferred to later plans

- **The grid draws a WINDOW of months, and the scroller spans the window
  (3 Sep 26, Phase 2 of the speed work).** `ui/colwindow.ts` is the
  arithmetic, `Matrix.tsx` the measuring; `HANDOFF.md` §Known issues (the
  Leave War speed entry) carries the measured before/after and what is still
  open. Two things to keep: the ROW memo contract (a `PersonRow` is a pure
  function of its props, every prop a primitive or an object whose identity
  changes only with the store `version`, handlers through the one `rowApi`
  ref — a per-render object or function prop silently brings back the
  whole-grid rebuild on every tap), and the COLUMN rule (anything that reads
  "the columns" reads `drawnDays` / `drawnDates` / `drawnMonths`; anything
  about the WAR — the verdicts, the lock set, a sheet's date span — reads the
  full `dates`; on a coarse pointer the window never grows on the left except
  at the left bound, because a `scrollLeft` write mid-fling kills the fling).
  Known and accepted: the desktop bottom scrollbar walks the drawn months, not
  the year (the month strip crosses the year); a far month jump rebuilds every
  row's cells and is not faster than before.

- **The day's overall verdict is computed and not shown.** `evaluateDay`
  produces a worst-across-all-rules verdict per day, and the interface still
  renders only the per-rule count rows. This was marked "for the bidding
  plan", and the bidding plan did not do it: a bidder can watch the count
  rows move as they bid, but nothing tells them in words what their bid
  would break. Still outstanding, and now more clearly worth doing — the
  bid sheet is the surface that would carry it.
- **`title` tooltips do not exist on touch.** The blocked-day reason and the
  count-row detail are still `title` attributes, which a phone never shows.
  Bidding added a real surface (the bid sheet) but did not move these onto
  it. The spec's promise that a bidder is told *why* a day is blocked is
  therefore still unkept on a phone.
- **A cell is not reachable from the keyboard.** Bidding and deciding hang
  off `onClick` on a `<td>`, which takes no focus and answers no Enter key.
  Making 1,440 cells focusable buttons would cost more DOM than the grid can
  afford, so the fix is a roving-tabindex grid, which is its own piece of
  work. The sheets themselves are ordinary buttons and are fully operable.
- **The sheets are `role="dialog"` without the behaviour that usually
  implies.** No focus trap, no focus restore, no Escape key — a click on the
  ✕, on another cell, or on a choice is what closes them. The role is right
  for what they are; the interaction is not yet complete.

## The date header no longer sticks

Given up on 10 Aug 26 to buy the owner's ask for ONE vertical scroll. The grid
wrapper scrolls horizontally only now and the page carries the vertical
scrolling for everything, so scrolling down takes the date header with it.

It is not a bug and there is no CSS that avoids it: `position: sticky`
resolves against the nearest scrollport, the wrapper is still that scrollport
because it scrolls one axis, and it no longer scrolls vertically. An element
cannot scroll one axis itself and let a descendant stick to the page's other
axis.

Two ways out if it starts to hurt, neither free:

- **Invert the single scroll.** Pin the page (`html, body { overflow: hidden }`),
  let the grid fill the viewport and be the only vertical scroller. That is
  still one scroll, keeps the sticky header, and keeps the chrome permanently
  visible — but it is the scroll the owner asked NOT to have.
- **Lift the header out of the scroller.** A second, non-scrolling copy of the
  date row above the grid, its horizontal offset synced to the wrapper's
  `scrollLeft`. Costs a sync path that can drift, which is the failure this
  codebase keeps choosing to avoid.

The roster is roughly one-and-a-quarter phone screens tall, so the header goes
out of view during ordinary use rather than only in extreme cases. Worth
raising with the owner rather than assuming it is fine.

## The cycle runs backwards for an admin, and forwards for anyone

Overturned on 10 Aug 26 at the owner's word: "as an admin I can open bidding
again after closing it". It had been forward-only since the bidding plan, and
the reason recorded in `stages.ts` was a real one — a bid arriving against a
decision already made is exactly what a cycle with stages is for. What that
missed is the ordinary case: bidding closes while somebody is on detachment,
and a whole new leave war is a heavy answer to one late input.

Two things were kept so the original guarantee mostly survives. **Nothing is
erased** — the stage is one field, so every decision already made outlives a
reopen — and **stepping back is admin only**.

The asymmetry that leaves is deliberate but worth knowing: **advancing the
stage is not gated at all**, so a member can close a war and then not be able
to reopen it (they can flip the role switch and do it, which is the affordance
model working as designed rather than a lock). Gating both directions would
match the spec's own roles table, and it would break the existing strip test
that advances as a member — it was left alone because the owner asked for the
way back, not for the way forward to be taken away. Worth settling when
accounts land and the roles stop being an affordance.

## Rulings made, so they are not relitigated

- **The scrim lives in the `Sheet` wrapper, not beside each sheet.** Seven
  places open a sheet; putting the click-outside in the wrapper means an
  eighth cannot be written without it. A per-sheet scrim would have passed its
  own test while the next sheet shipped without one.
  - **Its sideways-pan handler acts only on a TRACKED PRESS** (2 Sep 26). A
    mouse fires `pointermove` on a bare hover, and the scrim spans the whole
    page behind a sheet, so the first mouse motion after a cell opened its
    sheet was read as a drag from (0,0) and forwarded as `scrollLeft =
    0 − clientX`: the grid snapped back to January the moment the pointer
    moved (owner: "when I click on a date in September the month in the
    background jumps back to JAN"). `useGridPan` now sets a `pressed` flag on
    `pointerdown`, clears it on up/cancel, and a mouse whose `buttons` reads 0
    ends the press on its next move (a release over the panel never reaches
    the scrim). Pinned in `scrim.test.tsx`. Any pointer-drag handler that
    listens to `pointermove` needs the same guard — hover is a move.

- **`focusDate` is view state, and it lives in the domain store on purpose.**
  The stage strip and the matrix render independently of each other — neither
  takes props from the other, so both stay renderable standalone in their own
  tests — and the store is already the channel they share. It is not
  persisted: where someone was last looking is not a fact about the leave war.
  The `focusSeq` counter beside it exists because a date alone cannot say
  "asked again", and with 365 columns the grid is almost never still where it
  was left, so choosing the same day twice must snap back to it. It is cleared
  on `selectWar`: wars do not overlap, so a date from the old one names no
  column in the new grid.
- **The under-manned list is positioned from JS, not CSS.** The stage strip is
  `flex-wrap: wrap`, so the chip it hangs from sits in a different place on a
  phone than on a desktop, and there is no CSS way to say "under the chip, but
  never off the screen" when the anchor itself moves. Anchored naively it ran
  past the right edge of the phone viewport and its rows stopped being
  clickable — a mutation probe reproduces exactly that, failing on phone and
  passing on desktop. `LIST_WIDTH` in `Chrome.tsx` must stay in step with
  `.umlist`'s width in `chrome.css`.
- **The tinted chips do not use Raptor's `.wk.on` ink.** Raptor's value is for
  a chip that is one of several and only has to look *lit*; here the same
  chips have to be *read*. Do not "restore" them to Raptor's palette — see the
  comment on `.wk.on` in `chrome.css` for the measurement and why a contrast
  ratio does not catch it.

- **`DayCounts.duty` counts heads, not availability.** It increments by one for
  a half-day OIL credit (`HO` — 'half day SC duty' under the code's pre-28-Aug-26
  name) exactly as for a full day. This is deliberate — it answers
  "how many people hold a duty-credit cell today" (at work, off the flying
  programme), which is a head count, not a fraction of a
  person. Every *availability* figure in the same module is fractional; this one
  is not, on purpose.
- **A cleared cell deletes its key rather than storing an empty string**, so a
  day someone cleared is indistinguishable from one never set. Intended: there
  is no third state to represent.
- **`initStore()` clears every subscriber.** Call it once before render, never
  after mount, or a live component's subscription is silently dropped. Pinned by
  a test named as a contract. A fresh boot is a clean slate; the trap is real,
  which is why it is written down rather than left implicit.

## Small and safe to carry

- **The swipe on the counter column is gated only on the phone project**,
  because Chromium's touch emulation is what dispatches it. Three tests skip
  elsewhere rather than pretending to have run. The sheet — the guaranteed
  path — is gated on both.
- **`.bidsheet`'s `max-height` is belt and braces, not tested.** The gate
  asserts every sheet sits wholly inside the viewport and deleting it does not
  break that: the tallest sheet is ~500px against a 664px phone, so nothing
  yet overflows. It is there for the sheet that eventually does.
- **A stale `vite preview` server will silently invalidate the browser gate.**
  `playwright.config.ts` sets `reuseExistingServer: !CI`, so a server left
  running from a manual screenshot is reused and `npm run build` never runs —
  the gate then tests the last build, not the working tree. This cost real
  time twice on 10 Aug 26: mutation probes "passed" against code that was
  never compiled. Kill it with `pkill -f "vite prev[i]ew"` — the bracket stops
  the pattern matching the shell running it.
- One test writes a real `leavewar:grid` key into jsdom's storage and does not
  clean it up. Harmless while every other test passes an explicit backend and
  none calls bare `initStore()` — it becomes a cross-test dependency the day one
  does. Now slightly larger a trap than it was, since a bare `initStore()`
  would read `leavewar:states`, `leavewar:stage`, `leavewar:role`,
  `leavewar:openings` and `leavewar:ledger` from the same store.
- The DOM ceiling in the geometry gate is **9600 against a measured 9241**,
  raised from 2500/2357 on 10 Aug 26 when the war became a year rather than a
  quarter. Raising it is meant to be a deliberate edit in whichever change
  adds the nodes, not a reflex when it goes red. Note the selector's blind
  spot: it counts `.mx *`, and the bid sheet renders outside the table, so it
  adds nothing to that figure. The same test therefore also counts the whole
  document with the sheet open (9278, ceiling 9700). It now carries a **lower**
  bound of 8000 as well, so a grid that quietly shrank back to a quarter fails
  instead of passing comfortably.
- `setCell` stores an empty row object for a person whose last state is
  cleared, so `states.ramp` can be `{}` rather than absent. Every reader uses
  `stateOf`, which is indifferent, and `initStore` prunes empty rows on the
  next load. Worth knowing before someone reads a persisted blob and
  concludes a row means something.

## Event model (17 Aug 26; per-event tags 18 Aug 26) — tags, ranges, merged bands, colours only

The two event lines grew a real editor and a classification (owner, Aug 26).
What is a contract, and what is deliberately still open:

- **The tag is invisible; only colour shows.** An event is classified off /
  no-leave / work. Typing `PH` shows `PH`, never `PH (off)` — the kind
  surfaces ONLY as colour: a green column for a PH, a GREY column for a
  management Off day (`free`, 2 Sep 26), an orange column for no-leave, red
  text for a work word (the column left alone). The `off` kind's LABEL in
  the sheet reads **PH** since 1 Sep 26 (owner ask — it was "Off day"); the
  kind value, its colour class and the OIL non-working test are unchanged —
  and since 2 Sep 26 "Off day" is its OWN kind, `free`, which earns no OIL.
  `columnKindFor` lets `off` win over `free` win over `nolv` on one day;
  `work` never colours the column.
- **The tag lives ON the event, not in the library (owner, 18 Aug 26 — "I
  don't want u to save it as a type").** Tapping a tag in the Event sheet
  used to silently mint the typed word into the type library; now it is held
  in the sheet and saved with the event — `DayInfo.eventKinds[line]` for a
  per-day word (written by `writeDayEvent`, read by `dayEventKind`),
  `EventBand.kind` for a merged bar. Precedence everywhere is **instance tag
  first, library word match second** (`columnKindFor`, the red work word in
  `EventRows`, wire 4's holiday answer). The library changes ONLY inside the
  Edit types view. Both new fields read leniently in `readWar` (absent =
  untagged, exactly the old shape); clearing an event clears its tag so a
  stale kind can never colour a later word.
- **Classification is stored but not yet wired to the rules.** This is the
  deliberate gap the owner chose this pass ("colours only for now"): the
  off/no-leave/work kind changes no manning count and raises no warning. It is
  persisted (`state.eventDefs`, key `eventdefs`) so a future rules pass — and
  Wire 4's PH→OIL — can read it. A no-leave day does NOT block or warn a bid;
  urgent leave still goes through. Nothing reads `DayInfo.ph` yet either (it
  stays the inert flag it was); an off-day tag is what colours a holiday, not
  that flag.
- **Two ways to span a range, both kept.** REPEAT writes the word into each
  day's own `events[line]` (`setDayEventRange`); MERGE stores one `EventBand`
  on the period drawn as a colspan cell (`addEventBand`). A band suppresses —
  and, on creation, clears — the per-day text under it on that line, so a
  merged label never hides stray words a later delete would resurrect. Bands on
  one line never overlap (refused, not trimmed). `period.bands` is read
  leniently in `readWar`, so a war stored before the feature loads with none.
  **MERGE is the default a fresh range opens on** (owner, 28 Aug 26 — "can the
  default selection be one merged bar instead of repeat each day"), including a
  drag-swept span; reopening an existing band already opened merged. One
  consequence worth knowing: merge refuses an empty label and refuses a span
  crossing another band on the line, where repeat silently skips banded days —
  so the common mistake now gets a message instead of a partial write. Pinned
  in `eventsheet.test.tsx` ("defaults a fresh range to one merged bar").
- **Editing is a sheet, not inline.** An admin taps an event cell to open the
  Event sheet (`ui/EventSheet.tsx`); the old inline textareas are gone. A
  member still only reads. The sheet also carries the type-library editor
  (add / rename / reclassify / delete / reset), reached from its "Edit types"
  button.
- **The type library is squadron-wide, not per-war** (a holiday is a holiday
  in every war), so it lives on `state.eventDefs`, seeded PH=off / Off day=
  free / No Leave=nolv / SC=work, and persists under its own `eventdefs` key
  (a library stored before 2 Sep 26 keeps its three; the `free` chip is on
  every type and Reset restores the four).
- **The counter-picker header was squared** in the same batch (owner: "make it
  squarish, it's blocking the event box") — a contained bordered chip now, kept
  at a 40px tap target (the earlier "too small to hit" complaint still holds).

## SANS are off the roster by default, with an enable switch (18 Aug 26)

The owner's rule: "we will not show the SANS in the leave war however there is
a function to still enable this." What that means here:

- **The exclusion is at the PROJECTION** (`state/raptorRoster.ts`): a Raptor
  person flagged `san` is simply not projected, so the grid, the manning
  counts, the counters and both sync directions all agree by construction —
  the sync's own skip-unknown-persons rule makes a hidden SANS body's leave
  inputs harmless (they land nowhere and clear nothing).
- **The enable function is `setShowSans`** (`state/store.ts`) — admin-gated
  squadron config, persisted under `showsans`, default off. The UI control is
  the "Show SANS" button in the matrix's Rearrange toolbar (admin, edit mode).
  Flipping it re-projects at once: the sync's Leave War subscription runs
  `reprojectRoster`, which reads the flag.
- **With the switch ON, a SANS body rides the roster exactly as before the
  exclusion existed** — grouped by CAT, counted in manning, syncable. Turning
  it back off drops them again; nothing they carried is deleted, only
  unprojected (their war cells stay in the grid keyed by id, invisible until
  shown again).
- **The demo world never touches a SANS body** (`DEMO_MAP` remapped
  `slammed` off vinci onto pike when this shipped; a test guards it), so the
  demo reads identically with the switch off.

## The manning rows explain themselves, and their lines are the squadron's (19 Aug 26)

Tapping a count row's NAME (the frozen cell — the whole label is the target,
dotted-underlined) opens `ManningSheet`: what the row counts in plain words
(`ManningRule.desc`, seeded in `seed.ts`; `SETS_DESC` for the set rule), the
current colour rule as a sentence, and — admin only — the amber/red numbers as
editable fields with Save and a per-row Reset. The numbers are an OVERLAY on
the seeded defaults (`store.ts` `manningThresh`, persisted `manningthresh`,
admin-gated `setManningThreshold`/`resetManningThreshold`): only thresholds
are stored, never rule definitions, so a later build can reword or re-target a
rule without an old blob freezing it (the stores-list lesson). Amber at or
under red is accepted deliberately — it means "no amber band", the SXO seed's
own idiom — and the sheet says so rather than printing a number that never
fires.

Two rows joined the block the same day: **SC D** and **SC N** (the AVALON
cover). Each counts COMPLETE TEAMS — 2 SC-qualified pilots + 2 SC-qualified
WSOs + 1 SXO + 1 more crew, six different people, ground crew never counted
(`availability.ts:scTeams`; seeded red below one team). Three things worth
restating so they are not read as bugs:

- **The count is a matching, not four separate counts.** The only SXO
  doubling as one of only two SC pilots reads under 1 team — one body cannot
  fill two of the six seats. That is the point, not an error.
- **A duty-stander counts as PRESENT for these two rows** while reading 0 to
  every other figure. SC duty is at work; a fully-manned duty weekend must
  not go red for being manned.
- **The SC quals ride the Raptor projection** (`scd`/`scn` off Raptor's
  `quals.scDay`/`scNight`, in `reprojectRoster`'s signature) — tick or untick
  SC DAY / SC NIGHT on the Quals page and the rows recount on the next
  notify. The raw seed carries a demo set mirroring Raptor's own boot rule.

## The manning counters are the squadron's own rules (19 Aug 26, supersedes the overlay above)

Later the same day the owner asked for the rules themselves ("instead of hard
coding these permutations, make it editable… these counters can also be
deleted"), so the numbers-only overlay above is history: a `ManningRule` is
now DATA, stored whole under `manningdefs`, and the section above's
"only thresholds are stored, never rule definitions" no longer holds — the
deliberate departure and its forward-compat story live on the State comment in
`store.ts` and in HANDOFF's top bullet. What stands from the section above:
the explainer sheet, the amber/red quick-edit, the no-amber-band idiom, and
everything said about the SC teams' matching, duty presence, and projected
quals.

The shape, briefly (detail in HANDOFF's bullet):

- **Two counting kinds cover the old six.** `people` sums availability over
  one `CrewFilter` (seats · effective CAT is/is-not · qualification keys
  held/not held); `team` counts complete teams of DIFFERENT people from 1–6
  slots (`availability.ts:teamsOf`, the full Hall subset walk that `scTeams`
  hand-picked; parity pinned per seeded rule per demo day in
  `engine/counterrules.test.ts`). Crew sets are the two-slot team; a team can
  `show` teams or people-in-teams, and `presence` keeps duty-standers counted.
- **The form** (`ui/CounterForm.tsx`, testids `cform-*`) is guided pickers,
  never free text (owner's pick): name, kind, filters, slots, a live
  first-day sample, amber/red. Delete arms. `+ Counter` and the armed
  "Reset counters" live in the Rearrange tools; `Edit counter…` on the sheet.
  A rule saved from the form carries no hand `desc` — the sheet writes its
  words from the definition (`describeRule`), so words and rule cannot drift.
- **The qual chips are Raptor's live catalogue** (`qualCatalogue()` →
  `setQualCatalog`, refreshed with every reprojection; held keys ride
  `Person.xq`). A qualification added on the Quals page appears in the form
  as soon as anyone holds it; one removed keeps counting whoever still holds
  the flag (removal never touches `p.quals`), and an edited rule keeps its
  orphan key as a chip so Save cannot silently rewrite it.
- **The counters forget with the war**: `manningdefs` / `manningorder` /
  `manninghidden` ride the memory backend like everything else (owner,
  19 Aug 26 — no persistence wanted; counter configuration will live in the
  database when it arrives), so a counter built or deleted resets on reload
  back to the seeded eleven. The boot reader IS the save validator
  (`readManningRules`), so nothing saveable is un-loadable within a session;
  a corrupt blob falls back to the seeded eleven, and the legacy
  `manningthresh` overlay is still read once as a migration.

Two things a counting sweep (19 Aug 26) checked and DELIBERATELY left — do
not "fix" either without reading this first:

- **`matchesFilter` compares CAT case-sensitively** (`availability.ts` —
  `effectiveCat` upper-cases `p.q`, the filter's `cats`/`notCats` are compared
  verbatim). Not reachable from the form: the CAT chips are `CAT_LADDER`, all
  upper-case, so a saved rule can only ever hold upper-case CATs. It is a trap
  only for a hand-written or imported rule storing a lower-case CAT, which
  would silently match nobody. Left as-is (no reachable bug); if a non-form
  import path is ever added, upper-case the CAT there or normalise on read.
- **A half-day OIL credit (`HO` — `HS` before the 28 Aug 26 rename) counts
  as a WHOLE present body** in a
  `presence` team and the duty tally (`availability.ts` — `weightOf` returns a
  flat 1 for any duty code). Deliberate, and load-bearing: the old hard-coded
  `scTeams` did the same, so the migration parity pin in
  `counterrules.test.ts` requires it. A team seat is filled or it is not —
  there is no half a body in a Hall count. Changing it would break parity;
  raise it with the owner as a product question, never as a silent fix.
- **A SANS qualification group is empty until "Show SANS" is on — INTENDED, do
  not "fix" it (owner, 29 Aug 26).** Roster groups (`engine/groups.ts`) offer a
  qualification group per Quals column, SANS included. But SANS is the one qual
  whose held-state also HIDES the person: ticking SANS on the Quals page sets
  `PEOPLE[id].san` (not `p.quals.san` — `ui/QualsPage.tsx`), and
  `state/raptorRoster.ts projectPeople` excludes `p.san` bodies unless
  `includeSans`. So the exact people who hold SANS are the ones off the roster by
  default, and a SANS group shows 0 people — while every OTHER qual group works,
  because no other qual hides its holder. Turning on **"Show SANS"** (the 18 Aug
  enable switch, `store.showSans` → `projectPeople(showSans)`, admin/Rearrange
  mode) puts all SANS crew on the roster and the SANS group fills (verified: 0
  → 11). The owner was shown this and chose to KEEP the two controls separate
  rather than auto-couple them (add-a-SANS-group would NOT auto-enable Show
  SANS): the hide-by-default is deliberate and he wants it under his own switch.
  Do not link the two, do not drop SANS from the offerable groups, and do not
  read this empty group as a bug.

The custom shapes the seed never exercises — a slot count above 1 still
demanding distinct bodies, `quals` + `notQuals` on one filter, `show:'people'`
keeping a fractional team, ATT B counting while ATT C does not, and the
Quals-tick-lifts-the-count integration — are pinned in
`engine/counterrules.test.ts` §custom counter shapes and `roster.test.ts`.

- **Undo / redo scope (owner, 30 Aug 26 — "Add undo and redo on leave war").**
  The buttons live in Leave War's own top row (`ui/Chrome.tsx` Topbar), shown to
  everyone. The stack is a snapshot of the DURABLE state — the same fields
  `persist()` writes (every war's grid / states / period, the counter ledger and
  openings, and all of the admin arrangement/config: figure & roster & manning
  order, hidden rows, group defs & priority, manning rules, event types & rows,
  Show SANS, the OIL policy). The push lives INSIDE `persist()` (a save is the edit), so no
  writer can add an undoable change and forget to record it. Deliberately NOT
  undoable, do not "fix":
  - **Navigation and identity** — which war is on screen, who you are viewing
    as, the role, the focused day. An undo must not move you, and switching wars
    RE-BASELINES the stack (undo is scoped to the war in front of you, the same
    way the schedule re-baselines per week).
  - **Post-out / a person's seat-band-SXO edit** (`setPostOut` / `setPerson`).
    These write `people`, a live PROJECTION of Raptor's roster owned by the
    Quals page; they carry their own explicit undo (clear the PO date, flip the
    field back) and are re-projected on every Raptor notify, so putting them in
    the snapshot would only let an undo fight Raptor.
  - **Raptor-driven grid changes** — a leave/duty cell that arrived by sync
    (`ingestFromRaptor` / `ingestDutyCredit` / `clearRaptorCell` /
    `withdrawLeaveCell`, all held under the history `locked`). Undoing one would
    only be re-applied by the next reconcile pass. The mirror of this is what
    makes undo of a Leave War approval CLEAN: the restore notifies, sync
    re-derives, and the Raptor input the approval had minted is retracted — the
    behaviour `sync.ts`'s wiring note already anticipated. Pinned in
    `state/store.test.ts` §undo / redo and `ui/chrome.test.tsx`.
