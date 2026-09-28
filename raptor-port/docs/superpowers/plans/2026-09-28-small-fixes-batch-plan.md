# Plan — the small-fixes batch, 28 Sep 26

Planned by Opus 5.5 (high thinking) on `claude/small-fixes-batch-d223f6`, cut from `main` at `60a6792c`. To be
red-teamed by Fable 5.1 and Astra, one round each, blind to each other (D67; the ~3-round cap), who ALSO design the walk
scenarios (bug-check order §4 rank 1 and rank 3). Nothing is built before both reports are in.

**His ask (28 Sep 26):** `[AVAILWIN-PREVIEW-BAR]`, `[GHOST-FLAG-SHADOW]`, `[ALLAVAIL-OPEN-ROW]` (investigate first),
`[LW-ISO-DATES]`, `[LW-SPARE-MOVE-DOORS]`, `[REQ-DOOR-WORDS]`, `[REQ-ORPHAN-ROW]`, `[ABSENCE-SMALL-SEEN]`, and
`[AMEND-SMALL-SEEN]` items 1, 3, 4, 5 and 9 only (item 2 and items 6–8 belong to other chats). The items' full text is in
`OUTSTANDING.md`; this plan quotes only what it changes.

**The parallel chat** (`claude/change-recording-retest`, rulings D347–D359, ports 4173 / E2E 4190) owns the undo engine,
`src/state/undo-wire.ts`, `people-settings-commit.ts`, `person-delete.ts`, `accounts.ts`, the Leave War store's `write`
and `reprojectRoster`, and every Undo/Redo pair (`Shell.tsx` top bar, `SchedBoard.tsx`, `leavewar/ui/Chrome.tsx`, the
Tracker's `Header.jsx`). **None of those files is edited here.** Agreed with that chat (D302), 28 Sep 26: retiring
`shiftBid` / `moveAbsenceById` in `leavewar/state/store.ts` is fine (it touches only `write` and `reprojectRoster`); the
Personal Inputs card's accept "Undo" (`html.ts accCtl`) is this batch's, not one of the app's Undo/Redo pairs;
`unacceptInput`'s contract does not change (it tells them first if it must); a `scheduler.css` conflict keeps both sides.
The docs-tidy chat (`claude/docs-tidy-subheads-audit-ec8f87`, D380–D389) adds headings only to the reference docs; a
conflict there keeps both. Ports here: preview 4174, `E2E_PORT=4191`; rulings D360–D369; full checks through the PC lock.

## 0. The rulings this batch must keep (searched 28 Sep 26: every area file, the archive, the backlog)

- **The ALL AVAIL window:** D38–D41 (a movable, resizable, non-blocking window; 212 wide in the top-right corner on a
  desktop, the bottom panel on a phone; the approved mock is the design of record), D65, D66, D77, D27, D37 (the count on
  every seat the puck can land on, worded as what it is), D31 (a seat with nothing to measure offers no OIL switch and SAYS
  WHY — never a silent absence), D36 (availability's narrow window), D44/D45 (the crowd frozen at publication; a change
  reads pending), D52. **The changes window:** D167 (the ALL AVAIL window's own pattern), D168, D170, D171, D339, D345.
- **The dragged puck:** D164 / D270 / D272 / D277 (the flag rings, no glow), the 6 Sep 26 performance rule (the ghost is
  moved by ONE transform on its own layer — `docs/performance.md` §Drag).
- **Requests on the programme:** D174–D176 (a request's filing and the pending count), D175 (one request, one row; a load
  or plan switch leaves a second row out and says so), D98 (back to what was published = nothing pending), D178/D179
  (every input change after publishing is pending; the published face keeps what it was issued with), D114 (taking a
  request off is ONE change), the 26 Aug 26 dormant 'r' rule, the 13 Sep 26 "Load the week of … first" refusal
  (`inputedit.tsx landedOnUnloadedWeek`, finding 1).
- **Publishing:** D103 (any pending change wipes the sign-offs — and so, by the same token, a change that is NOT pending
  must not), AM15b (an action says what it did), AM22 (the tag colours), D92 (a changed puck wears a tag, never a ring).
- **The desktop week's ‹ arrow:** **D275** — no room beside the ‹ arrow; the arrow floats over the front day's first
  pixels, chosen knowing it covers the start of that day's lines. **`[AMEND-SMALL-SEEN]` item 4's arrow half is answered by
  D275: nothing is built for it** (the item is closed on that half as ruled, and the fading arrow stays "not built unless he
  asks").
- **The Leave War:** D262, D264–D266, D330–D335 (the move and the sheets — `moveRecords` is the one move door), D260/D261
  (awards), the day-first date voice (`docs/ui-contracts.md`; owner 25 Aug 26: UI copy reads production), D300 (a date sits
  in its own box and is not repeated on the button).
- **How we work:** D56 (a harm that lives only in stored demo data is not a finding), D90 (the later ruling wins), D201 (an
  overwritten ruling's leftovers are fixed in the same change), D29 (a code change never trims a document), D302.

## 1. The tier — FULL

The eight questions (bug-check order §5), answered against the change:
1. Money — YES: `[ALLAVAIL-OPEN-ROW]` touches the OIL membership walk (who is behind a placeholder, frozen at publication).
2. The published record — YES: `[AMEND-SMALL-SEEN]` 9 changes what a signature binds to; `[REQ-ORPHAN-ROW]` changes a
   request's filing on published days (the pending count); `[AMEND-SMALL-SEEN]` 1 changes what Publish / Unpublish say.
3. Saved data — YES: `[REQ-ORPHAN-ROW]` reads the saved stashed weeks; the signature's binding is stored.
4. A shared drawer — YES: the puck (the ghost clones it), the toast (every message in the app), the floating-window chrome
   (both windows), the day-first date formatter.
5. A new gesture or mode — NO (no new control; the Undo on a request card and the banner's Switch keep their gestures).
6. A new surface — NO.
7. Roles — NO new rule; the read-only input window (`[ABSENCE-SMALL-SEEN]` 4) is a look, and `perms.ts` is not touched.
8. The warning list — NO new warning; the pending count and the sign-offs are question 2.

**YES to 1, 2 and 3 → FULL.** So: this plan red-teamed; the scenarios designed by Fable and Astra; the roll-call and door
check; the walk on the everything-week at 1440×900, 390×844 and a short 1440×700 window (the floating windows); the break
tests; the gates through the PC lock; both models read the finished code with the evidence sheet in hand; the re-walk of
what the fixes touched; the evidence sheet with its pictures; then his look. Rough cost: 5–7 hours of agent time.

## 2. The items — what exists, what changes, how it is proved

### A. `[AVAILWIN-PREVIEW-BAR]` — the floating windows cover the board's preview bar

**Reproduced 28 Sep 26** (`scratchpad` walk on the everything-week, board, Saturday → plans menu → Original, then the ALL
AVAIL count, then the board's History): at 1440×900 and 1440×700 both the ALL AVAIL window AND the changes window open at
`right:16px; top:96px` over the board's side column, whose first thing on a preview is the bar — "← Back to live copy" and
"Load onto working copy" are both covered (elementFromPoint lands on the window). The changes window was built after the
item was filed and shares the placement (`floatwin.ts`), so it is in the roll-call. **The edit week is fine** — measured: the
window's corner sits over the week's crew palette column, never a day, so a day's preview bar is never under it. **The
phone is fine** — the window is the bottom panel and the bar sits at the top of the board's scroller.

**Change:** `useFloatWin` gains one option, `clearOf: () => Element | null` — the element a window that he has NOT placed
must open clear of. `place()`, in the no-box DESKTOP branch only: after the stylesheet has placed the window (inline styles
cleared), if the element is shown and its rect overlaps the window's, write `top = its bottom + 8px` and
`max-height = innerHeight − top − 12px` inline — never `width`/`height`, so the ResizeObserver's "his box" test (inline
width or height) never mistakes the clearance for his choice, and the next render with no bar clears both again
(`maxHeight` joins the list of inline styles the branch resets). A box he made by dragging or resizing is never moved —
he put it there. Both windows pass `() => the board's shown .dprev-bar when the board is open`.
**The timing:** the board writes its bar in a passive effect, AFTER the windows' layout effect has placed them, so a
preview started while a window is already open would be measured one render late. `useFloatWin` therefore also re-places
on the next animation frame after each render while open (one rect read; cancelled on unmount).
**Proof:** a browser test (`e2e/availwin.spec.ts`, and one for the changes window) — a published day 0 (`setDayApproved`),
its issued version previewed on the board (`setDayPreview`), the count tapped: both bar buttons are hit-reachable
(`elementFromPoint`), the window's top is below the bar's bottom and its bottom is on screen at 1500×950 and 1440×700;
back to live → the window returns to `top:96`; a window he dragged is NOT moved when a preview starts; the phone panel is
unchanged. Red first on `main`.

### B. `[GHOST-FLAG-SHADOW]` — the dragged puck loses its "lifted" shadow under a flag ring

**What the mapping found — wider than the item:** the ghost is a clone of `.puck` (`drag.ts setDragImage`, `tdArm`), and
`.dragimg.lift, .tdghost.lift { box-shadow: var(--lift-box), 0 8px 20px rgba(0,0,0,.6) }` carries the depth shadow in the
same property the flag rings use. So the thin red ring (`.boxred`, !important), the dashed ring (`.boxdash`, `box-shadow:
none!important`), the red and grey rings of `.puck.warn.hard` / `.warn.note` (more specific), the "this is you" ring
(`.me…`, !important) and the warning-list focus rings (`.wfoc.advf`, `.wfoc.echo`) all EAT the depth shadow — and a plain
amber advisory ring (`.puck.warn`, same specificity, earlier) is eaten BY it: the ghost of an amber-flagged puck carries no
amber ring. (OIL mode's green ring cannot be dragged — `drag.ts` refuses a drag while OIL Earn is on.)

**Change (lighter than the item's wrapper):** the depth shadow moves to `filter: drop-shadow(0 8px 20px rgba(0,0,0,.6))`
on `.dragimg.lift, .tdghost.lift`, and the lift rule stops setting `box-shadow` at all — the veil (`::before`, already
carrying `var(--lift-box)`) draws the accent ring and glow for every ghost, flagged or not. A filter is not the
`box-shadow` property, so no ring can eat it, and it is drawn outside the element (an element's own `overflow:hidden`
clips its children, not its filter). Result: every ghost keeps the depth shadow AND its own flag ring, the amber one
included. The ghost stays a clone of the puck (no test churn in `drag.test.tsx`'s "the ghost IS the puck"), still moved by
one transform on its own layer. **Performance:** a filter on a `will-change:transform` layer is painted once into the
layer; the transform moves it without a repaint. Measured, not assumed: the drag timing probe (`docs/performance.md`
§Drag) before and after, and the e2e ghost test. (`performance.md` bans a filter on the PALETTE's pucks — many elements,
repainted — not on the one ghost.)
**Proof:** `lift-css.test.ts` — the lift rule sets no `box-shadow`; the depth shadow is on `filter`; for EVERY ring state
(`boxred`, `boxdash`, `boxdot`, `warn`, `warn.hard`, `warn.note`, `me`, `wfoc.advf`, `wfoc.echo`) the ghost's winning
`box-shadow` is the ring's own and the `filter` is the lift's (red first: today the amber ring loses and the depth shadow
loses on six). The e2e ghost test (`geometry.spec.ts` ~4802) reads the depth from `filter` and adds a FLAGGED puck
(computed `filter` carries the shadow; computed `box-shadow` is the ring). Pictures of a red, amber, grey and dashed ghost.

### C. `[ALLAVAIL-OPEN-ROW]` — an ALL AVAIL on a row with a start and no end shows no count chip

**Investigated (the item asked for this before any build):** the chip is drawn only when the day's OIL evidence records a
crowd for that seat (`oilmode.ts oilSentinelSummary`: state `'none'` → no chip). The crowd is recorded ONLY by the money
walk (`oilev.ts` → `oil.ts dayOilWork` `expandAll`), which skips any row without both times BEFORE it expands the
placeholder (`oil.ts w2` → null, lines ~272–290). Money refusing an unmeasured row is right (`engine-rules.md`: "display
may guess; money may not"; D31). But the count is a SCHEDULING fact (D27, D37 — "on every seat the puck can land on"),
and every other scheduling reader gives an open-ended row the Logic tab's one-hour default (`VCONF.openEnd`; `time.ts
win`, the crew picker, the validator). So this is **a gap, not D31 as designed**: the count inherits money's refusal, and
D31's own rule is broken — no chip, no reason, a silent absence. The window's sentence for the case ("This row has no
usable start and end times…") is unreachable, because the chip is its only door.
**Proposed change — PUT TO HIM before it is built (it adds an assumed hour to a count, and it changes what a published
day freezes):** the walk records the crowd for an open-ended row over `start → start + openEnd` (the scheduling window)
while crediting nobody for it (money unchanged — D31's refusal, with its reason on the OIL half); the chip shows; the
window names the assumed hour ("18:30–19:30 · no end time, an hour assumed"); its OIL tab says why nobody earns. A row with
no start at all still gets no count — but its placeholder shows a "?" chip that opens the window on the existing sentence,
so it is never a silent absence. Consequence for him: on a day published before this, the crowd behind such a row was
never frozen, so after it the working copy reads one more pending line (demo data — D56, not built around).
**If he says leave it:** nothing built; the item closes as ruled with his date.

### D. `[AMEND-SMALL-SEEN]` items 1, 3, 4, 5, 9

**1. Publish's toast swallowed; Unpublish says nothing.** The toast is ONE element whose text is replaced (`toast.ts`); on a
weekend publish the OIL gate speaks second in the same command, so "Published AL1 · 14 items on Sat only" is never seen
(`sync.ts` already names this trap for its own two lines). **Change:** the toast never loses a message spoken in the same
breath — a second toast raised before the browser gets back to the page (same task; a zero-delay timer marks the turn)
is JOINED to the first ("Published AL1 · 14 items on Sat only · there is no leave war period…"), identical messages not
repeated, the stronger colour kept, the hold computed on the joined text (its 12 s cap stands). **And Unpublish says what
it did:** "Saturday unpublished — the Original is back on the working copy to correct; publishing again reissues it"
(the button's own title, as a sentence). **Proof:** `toast.test` (two in one breath → one joined line, amber; two turns
apart → the second replaces); the publish test on a weekend asserts both facts on screen; the unpublish test asserts the
sentence. Every test that asserts a toast after two same-breath toasts is found by the suite and read, never relaxed.

**3. Callsigns cut to "…" (desktop week) and wrapped "VIP/R" (phone board)** — with `[ABSENCE-SMALL-SEEN]` 3 (a six-letter
callsign "…" on View-only Sched): one fix for the flying line's callsign cell on every surface. Desktop / view week:
`.form .csmsn b` is `nowrap; overflow:hidden; text-overflow:ellipsis` round an editable inline-BLOCK (`.ntx`,
`min-width:30px`) in a 52px column — an inline-block cannot be partly cut, so one pixel over replaces the whole name with
"…". Phone board: a 36px column of 11px mono with 6px padding each side leaves ~22px, so five letters wrap. **Change:**
measured, never guessed — the cell fits a SIX-letter callsign at 10px without an ellipsis on the desktop and view weeks,
and without wrapping on the phone board, taking the room from the padding and the mission column's slack (the column
contracts are re-measured in the same change and the geometry tests updated with the reason); a longer name still ends in
"…" (never wraps — "pucks never wrap" stays the rule for the line). **Proof:** the geometry gate at 1440 and 390, with
VIPER, COBRA and a six-letter name, both widths; pictures before and after.

**4. The "AL1" tag beside a time clipped to "AL" at 390px** (the phone week and the view page — walker W1's
`s1-phone-5-reissued-line`, `rc-phone-R7-view-sat-duty`). **Change:** on the phone, a time cell's AL tag rides the cell's
top-right corner (absolute, like the time and area cells' own `.timecell[data-alc]::after`), so it is never cut by the
narrow column. The arrow half: **D275, nothing built** (above). **Proof:** at 390 the tag's box sits inside the screen and
is not clipped (its `scrollWidth` ≤ its box), on the week, the board and the view page; the desktop unchanged.

**5. AL7 and AL8 the same orange.** `AL_COLORS` stops at AL7 and AL8 on repeats it. **A question for him** (the item says
"ask him if it matters"): the tag always carries its number, so colour alone never has to tell AL7 from AL8. Recommended:
leave it. Nothing built unless he says otherwise.

**9. "Sort" on a published day's ground programme blanks the four sign-offs though nothing changed.** The ground
programme is SHOWN in time order whatever order the rows are stored in (`order.ts groundOrder`), and the change count is
worked out in that shown order (`canonical.ts`), so Sort reads "no changes to publish". But the signature binds a digest
of the day keyed by the rows' STORED positions (`publish.ts currentBindNow`: `dg` from `dayKeys`, `gord` the shown
order's positions), so re-ordering the array moves every positional key and all four signatures fall (`signBoundOk`).
D103 says a change that shows as pending wipes the sign-offs — so one that does NOT show must not. **Change:** the binding
digests the day with its ground rows in SHOWN order (a copy of the day, `ground` put into `groundOrder`, `gman` honoured)
and `gord` becomes that order's identity — so it binds what is shown, exactly as its own comment says it means to. A day
whose rows were already stored in shown order binds exactly as before. **Proof (red first):** sign a published day whose
ground rows are stored out of time order, press Sort → the four stay signed and the day reads 0 pending; a real reorder
under a hand-set order (`gman`) still clears them; a time change that moves a row still clears them.

### E. `[REQ-ORPHAN-ROW]` — a request's row outliving the request

**What the mapping found:** part (1) as filed (a request deleted on the Inputs page while its row stands on an UNLOADED
week) is already refused with its reason ("Load the week of … to delete this accepted input" — `landedOnUnloadedWeek`,
13 Sep 26); Fable's O2 was a code read that called the inner removal directly. What is really open:
- **(1a) The week boundary (Fable's G3, and D175's "one request, one row" across weeks):** a request spanning Sun wk1 – Mon
  wk2 lands on Sunday; load wk2 and its card offers Accept on Monday (the loaded-week guard sees no row), so a second row
  is made; deleting the request later removes only the loaded one. **Change:** ONE helper — `srcOnStashedWeek(id)`: does
  any stashed week OTHER than the loaded one hold a ground row with this `src` (the loaded week's own stash entry is stale
  and skipped, as `oilev.ts` already does) — read by all four "one request, one row" readers: `acceptInput`'s guard (no
  second row; refused, and the refusal says where the row is), `reconcileLandedAcc` / `reconcileDayFiling` (a request
  whose row stands on another week is FILED 'g', not left to flag as never landed), and `publish.ts rowsLeftOut` (a load or
  a plan switch leaves out a row whose request stands on another week, and says so — D175's sentence). The request's card
  on the other week reads that its row is on the other week (item G), and its accept-Undo is refused there with the reason
  ("Its row is on Sun 19 Jul — load that week to take it off"), BEFORE `unacceptInput` is called (its contract unchanged
  for `person-delete.ts`).
- **(1b) The refusal's stale scan:** `landedOnUnloadedWeek` scans the loaded week's own stash entry, which is stale — a
  request taken off since (its row gone from the live week) is refused a delete with "Load the week of <this week>".
  **Change:** skip the loaded week in that scan (the same helper).
- **(3) A plan switched in carries a request's row back beside a request reading "taken off":** `reconcileDayFiling`
  leaves 'r' alone, so the request reads dormant while its row stands, its Accept does nothing and deleting it leaves the
  row with a dead link. **Change:** after a whole-day replacement, a request whose OWN row stands on a loaded day is
  re-filed 'g' whatever it read before (the day now reads as that version — D98 / D175), so the card, the count and a later
  delete all agree with the row.
- **(2) A published version loaded after one of its requests was deleted brings its row back** — "what load this version
  means, now named truthfully" (the item's reading). **Left, and put to him on the look card** (recommended: leave).
**No write into a stashed week anywhere in this batch** — the helper only reads, so nothing new reaches the undo seam.
**Proof (red first):** the boundary scenario through the app's own controls (file on wk1, load wk2, the card and a second
Accept); the stale-scan scenario (land, leave the week, come back, take off, delete → allowed); the plan scenario (park a
plan with the row, take the request off, switch the plan in → filed 'g'; delete → the row goes with it); D174 / D176 /
D98 pending counts unchanged on a published day; `engine-rules.md`'s "within the loaded week" note rewritten to say what
the stash read now covers.

### F. `[REQ-DOOR-WORDS]` — three door-wording gaps

- **(1) One act, two sentences:** the preview banner's "Switch to this plan" (`interactions.ts data-draftgo`) calls
  `board.ts switchDraft` itself — its gate, its already-live refusal and its sentence with the pending tail ("· N
  differences from ORIG pending" / "· matches ORIG — nothing pending"). The banner keeps only its own "That plan is no
  longer available" for a plan that has gone. `reqonerow-app.test.tsx` updated to the one sentence.
- **(2) The accept-Undo removes ANOTHER day's row:** a request's card is drawn on every day it covers; its "Undo" removes
  the row wherever it stands. **Change:** when the row stands on another day, the card's control reads "Undo · Tue" and
  its title "Undo — takes it off Tuesday's ground programme"; the toast names the day ("Accept undone — its row came off
  Tuesday's programme"); on another WEEK it is refused with the reason (E, 1a).
- **(3) The pending list cannot name a deleted request that had no row** ("A request · under Unavailable → deleted"):
  **Change:** the name comes from the issued version's own record of the request (`snap.inp[id]`, which a published day
  carries) — "Ranger · Meeting · under Unavailable → deleted" — and, when the day's issued record never held it, from the
  change history's own line for the delete (`changelines.ts` writes the person and the type with it). `drafts.ts`'s same
  "A request" fallback reads the same body. **Proof:** the pending line for a deleted 'u' request names the man and the
  type, on the board, the edit week and the changes window's To go out.

### G. `[LW-ISO-DATES]`, `[LW-SPARE-MOVE-DOORS]`, `[ABSENCE-SMALL-SEEN]` — the Leave War and the absence leftovers

**G1. `[LW-ISO-DATES]` — every Leave War place that prints the stored `2026-07-17`** (the mapping found twelve, more than
the item's four): the bid sheet's header (`BidPicker.tsx` ~358) and its Decide row's "moved from …" (~455, the stored
`shiftedFrom`); the "Leave from Raptor" / "OIL the app credited" sheet (~847); the member's "Your OIL award" (~932, D261);
the Posted out / Posted in sheets (~1000, ~1120) and the post-in notes (~1128–1130, "Back from a posting on … — on the
manpower from …"); the selection sheet's ONE-day header (`SelectSheet.tsx` ~86 — a range already reads day-first); the
move banner's refusal (`Matrix.tsx moveReason` ~107); the PO corner tag's hover title (~688); and the absence door's three
refusals shown on the day's list (`sync.ts` ~471, ~482, ~511: "… is on a locked week", "… request on … — decide or clear
it"). Also, month-first rather than ISO but the same voice gap on a Leave War sheet: the remarks editor's header
(`RemarksSheet.tsx` ~36, "Jul 13 → Jul 15"). **Change — two voices, each the one its neighbours already speak:** a sheet
HEADED by one day reads like the day's list beside it, "Fri 17 Jul" (`DayList.tsx dayLabel`, moved to `dates.ts` and
exported — one body); a date inside a sentence or a span reads "17 Jul 26" (`dates.ts shortDate` / `shortSpan`, already
the selection sheet's range voice and the archived line's). The one-day selection header therefore reads "6 Aug 26 · 1
day", matching its own range form. Stored values (`shiftedFrom`, `.to`) are untouched — display only. **D300 is already
built** (the Post in / Post out buttons carry no date), so nothing there. **Tests changed with their reason:**
`onedoor-sheets.test.tsx` (the two post-in notes), `review-fixes.test.ts` ~132 (the absence door's reason),
`e2e/step4-leavewar.spec.ts` ~481 ("moved from 11 Feb 26"). **Roll-call proof:** a unit test renders every sheet above
and asserts no `\d{4}-\d{2}-\d{2}` in its visible text (the structural fix the bug-check order §6 asks for a wording
ruling — one test over every place, so a new sheet printing the raw date goes red). The Raptor-side input window's title
("Tally · Jul 24", `inputedit.tsx` ~1814) is the same gap on the Inputs side, where `fmtDay` already exists — changed with
it ("Tally · 24 Jul").

**G2. `[LW-SPARE-MOVE-DOORS]`** — confirmed: `shiftBid` (with its private `dayDiff`) and `moveAbsenceById` have no
production caller (not the screens, not `sync.ts`, not the probe bridge, not e2e or the walk scripts); every move goes
`Matrix.tsx` → `moveRecordsProblem` → `moveRecords`. **Change:** delete both from `leavewar/state/store.ts` (neither
touches `write` or `reprojectRoster` — agreed with the parallel chat) and their doc mentions (`CLAUDE.md`, `engine-rules.md`,
`feature-impact.md`, `ui-contracts.md`, `leavewar/known-gaps.md`). **Their tests move onto `moveRecords` first, and each
new test must PASS on today's `moveRecords` before the old door is deleted** (a failure there is a real defect in the door
in use, reported, not papered over): a chain of closed-war moves keeps the ORIGINAL origin; a landing on a locked (stashed
protected) week refused, nothing moved (AS4-R2-001); a wrong person / date / id moves nothing (AS4-R2-002); a leave retyped
to a medical since is not moved (AS4-R2-003); approved leave moved into the next war refused; a refused move does not
notify; the trail survives a reload; a bid move writes ONE change line and an absence moved by id writes one line that
points at the new record (the middle day of three). The old tests that pin only what `moveCells` / `moveRecords` already
cover are deleted with the door. **Found, not in the item:** `moveCells` and `moveProblem` have no production caller either
(only `shiftBid` and their own tests) — a third spare door with many tests; **filed** as `[LW-SPARE-MOVECELLS]` (low, with
the next Leave War move change), not retired here.

**G3. `[ABSENCE-SMALL-SEEN]`**
1. **"— resolve on the sheet" where the sheet has no control** (`leavewar/ui/Chrome.tsx` ~530–552, admin only). For a
   bid against leave the bid line on the day's list does carry the controls; for schedule-earned OIL against leave filed on
   the Inputs page nothing on the sheet can resolve it (the leave says "Change it on the Inputs page"). **Change:** each
   strip line names its own way out — the bid clash keeps "resolve on the sheet"; the input-vs-duty clash reads "— change
   the leave on the Inputs page" (the words the day's list already uses). Only the strip's text lines in `Chrome.tsx`
   (its Undo/Redo pair is the parallel chat's; told first).
2. **The "VIEWING AS" chip cut off at 390px** (`chrome.css` `.lw-viewing`: `nowrap`, no `min-width:0`, no ellipsis, no phone
   rule). **Change:** measured at 390 and 360 first; the name part may shrink with an ellipsis (`.vwho` `min-width:0;
   overflow:hidden; text-overflow:ellipsis`, the chip `min-width:0; max-width:100%`), the words "VIEWING AS" never cut.
3. **A six-letter callsign "…" on View-only Sched** — the flying line's callsign cell; one fix with D3 above.
4. **The read-only input window draws its locked fields as live** (`inputedit.tsx` ~1812: `readOnly` makes the body `inert`,
   but nothing styles it). **Change:** the locked body reads as read-only — fields muted, no box highlight, default cursor
   (`.inped.ro .inped-body …`); shown before/after on the look card (a look question for him, as the item says).
5. **A member's leave drawn over the frozen balance column once** — seen once, not reproduced by a dedicated probe (4/4).
   **Nothing changed;** the walk repeats the probe at phone width (the member's two-row case) and records the result.

## 3. What is put to him (none blocks the rest of the build)

1. `[ALLAVAIL-OPEN-ROW]` — build the count for an open-ended row with an assumed hour (and the "?" door), or leave it?
   (Recommended: build.) Asked now, in chat; built only on his yes.
2. `[AMEND-SMALL-SEEN]` 5 — AL8 and later reuse AL7's orange; the tag carries the number. Leave? (Recommended: leave.)
3. `[REQ-ORPHAN-ROW]` (2) — loading an issued version brings back a deleted request's row, named truthfully. Leave?
   (Recommended: leave.)
4. `[ABSENCE-SMALL-SEEN]` 4 — the read-only input window's locked fields: shown before/after on the look card.

## 4. Order of the build

Each item on its own commit, red test first, its own suite run between items (bug-check order §5, "between fix rounds"):
A (floatwin) → B (ghost) → D1 (toast) → D9 (signature) → F1 (banner) → E (requests, the largest) → F2, F3 → D3/D4
(the callsign and tag geometry, with `[ABSENCE-SMALL-SEEN]` 3) → G (the Leave War) → C only on his yes. Then the full gate
set under the PC lock, the walk, the two reads, the fixes, the re-walk, the evidence sheet, the look card.

## 5. The walk

The everything-week fixture (`scripts/handpass/am/am-fixture.mjs`, saved against `localhost:4174`) plus, per item, the
states it needs built through the app's own controls: a request spanning Sun–Mon (wk1/wk2), a plan parked with a
request's row, a 'u' request on a published day then deleted, a published day with ground rows stored out of time order
(hand-order then clear it), flagged pucks of each ring kind to drag, a weekend publish that raises the OIL warning. Widths:
1440×900, 390×844, 1440×700. The roll-call of every surface each change reaches is written into the evidence sheet
(`docs/handpass/2026-09-28-small-fixes.md`) before the walk, from the scenarios Fable and Astra hand back.
