# Leave War M1 "open dates" — independent scenario design (bug-check order, rank 1)

22 Oct 26. Scenario designer: a fresh Opus reader who did not write M1 and has not seen the builder's design. Code read
ONLY at `c413f2541` (main before the change); documents as they stand in the working tree. Method, verbatim from the
brief: start from the user promise and the rulings (D1177, D1225, D1176, D1166, D1168, D1169, D1172, D1211, narrowed
D418, D333, D352, D827; the plan's batch 1 fixes B2, B3, B8, A7b, B12), enumerate every surface, door, reader and order
of actions, **assume every existing line may be correct and the defect is a missing call site**, then rank scenarios.

**Not a finding (D56):** harm that lives only in data already stored while the code is right going forward. The one
exception the plan keeps: an old saved war must still LOAD (S12).

**Clock note for every walker (walk-scripts §1):** the demo's only open window is 1 Jan – 31 Mar 26 (an old open war →
one stretch). With the clock at today (22 Oct 26) that whole stretch is IN THE PAST, so under D1211 a member can bid
nowhere and the page lands on today. Run the member scenarios twice: once with the clock running from **15 Feb 26**
(the stretch straddles today), and once at the real date after the admin has opened a future month. Say which clock in
every picture's caption.

Words used: **the window** = the "Open for bidding" window; **the chip** = the top-row chip ("Open 1 Jan – 31 Mar",
desktop "Open for bidding 1 Jan – 31 Mar +1", or "Bidding closed"); **the closed note** = D1176's words; **the pending
note** = D1225's "Your bid waits for a decision. Delete it if you no longer want it." (r7-09).

---

## 1. The roll-call — every place that read the stage or the bidding window at c413f2541

Each row: where the sign and the working gesture must be after M1. "Code" is the c413 reader the builder must have
replaced (a missing replacement is the likely defect). "RECORD" = no ruling decides it; the walk writes down what it does.

| # | Surface / reader | Visible sign after M1 | Working gesture after M1 | Code at c413 (where in the code) |
|---|---|---|---|---|
| R1 | **The chip** (desktop second row; phone second line, one line, never wraps — D678) | "Open <first stretch>" (+N on desktop when more — r7-18), green; "Bidding closed" when nothing is open; the old stage chip, its ‹/› moves and the phone's stage menu gone | Admin tap → the window. Tap on "Bidding closed" → last open stretch and who closed it. Member tap: RECORD (today the dates chip is disabled for him) | `Chrome.tsx StageBar` 282–500 (`stage-now`, `stage-advance`, `stage-back`, `stage-menu`, `bid-window`, "THE WHOLE YEAR"), `STAGE_MENU_WIDTH`, the Escape handler's third branch |
| R2 | **The window** | Period name; 12 month buttons (2 rows of 6 on a phone); lit = open, dotted edge = part-open; one line per stretch with day count and a line-drawn calendar icon; "+ Open more dates"; with none open "Nothing is open, so bidding is closed." (r7-17b) | Tap month = open whole month / second tap closes; hold-drag opens every month passed in calendar order (A7b); drag starting on an open month closes; calendar icon or tap on the line → exact days; one command per gesture (B12) | `Chrome.tsx WindowSheet` 173–225, `RangePicker`, store `setBidWindow`/`clearBidWindow` 3304–3318 (today NOT inside a named gesture — runs as a bare `updateCurrent`) |
| R3 | **The green outline** on the grid | One outline per open stretch; for a member it starts at today (D1211 reading; r7-01); none when nothing is open | — | `Matrix.tsx measureBidBox` 2654 (one box, `period.stage !== 'open'` → none, `inBidWindow` with null = whole war), its deps 2713 |
| R4 | **Closed-day dim + lock** on the date heading | Closed days dim with a small lock **only while something is open**; nothing open → grid as normal. Admin sees it? RECORD (c413 deliberately drew no lock for an admin) | — | `Matrix.tsx lockedCols` 3135 (memo deps `[version]` only), the `locked` class in `MatrixRows` |
| R5 | **A member's tap on his own row** | Open day from today → bid window. Closed day (or before today) → the closed note + "Open the Inputs page" (r7-08). Closed day holding his own pending bid → the pending note + Delete (r7-09, D1225). His own approved leave → its remarks, any day (D418 narrowed) | as left | `MatrixRows.tsx cellOpenable` 135–160 (`period.stage==='published'` remarks branch), `actionable` 455–462; `Matrix.tsx` router 3069 (`remarkRow` published-only), 3111 (`openFreeHalf`), 3880–3890 (`AwardSheet`), 4183 (`BidPicker` gated by `canEditCell`) |
| R6 | **An admin's tap** | Any day, any period → bid window with Decide (D1177: decides any time — including a period nobody ever opened) | Approved leave → Back to bid / Refuse / Move / Delete **at any time** (no "published" freeze — host's reading) | `canDecide` (draft refusal), `warEditable` 3112 (`stage==='published'`), `absenceMovable` 4615, `changeAbsenceById` 3224, `decidableIn`/`deletableIn` |
| R7 | **"Pick a range"** in the bid window | Days of the range that are closed are skipped and counted, never silently written | Range across 31 Dec into the next period (B3) | `BidPicker dates={dates}` (the period's own days only), `setCellRange` → `writeMany` → `setCell` (`canEditCell(state.period,…)` = **the period on screen**, not the one holding the date) |
| R8 | **Drag-select** (the people's-days panel) | Member: drag allowed when? c413: only while `stage==='open'`. RECORD; the fill skips closed days and says "N skipped" | Delete over his own pending bids on closed days (D1225) | `Matrix.tsx selCtxRef.enabled` 3159, `SelectSheet canFill` 194, `canDecide` prop 3908 |
| R9 | **The day's list** (a day with 2+ records) | Decide any time; member's Delete on his own pending bid on a closed day; "Note" on approved leave any time | per line | `DayList.tsx` 79 (`deciding`), 80 (`editable`), 128 (`finished = published`), 139 (Note at published), 155 (`movedFrom` by `biddingClosed`), 175 (Delete by `editable`) |
| R10 | **Move** (one-day Move chip, day's-list Move, drag Move) | Member: his own pending bid, source days open AND landing days open and from today; admin: anything, any time | Landing outside the period on screen (B3) | `requestMovable` 4601, `absenceMovable` 4615, `moveRecordsProblem` 4666 (`dayset = state.period.days`; `canEditCell(state.period,…, to)`), `moveRecords` 4716 (`tracked = biddingClosed`) |
| R11 | **The dotted "moved" mark** | On ANY move of a leave already approved (D1177). A pending bid moved by an admin: RECORD (c413 stored `shiftedFrom` on a request moved while closed) | — | grid `movedShown` 3059 + `MatrixRows` marks; `BidPicker` decide.movedFrom 4231; `DayList` 155; door `doorMoveApproved(tracked)` sync.ts 593/629 |
| R12 | **Legend** | "Moved here from another day" line shown whenever a cell can wear it; no stage words | — | `Chrome.tsx` 594 (`biddingClosed(period.stage) &&`) |
| R13 | **The clash note** (phone line, desktop strip) | No "Step the war back to Bidding Closed"; approved leave reads "Change the approved leave", sentence "…but the bid is approved OL" (r7-19) | A tap opens a sheet that HAS the control the words promise | `Chrome.tsx WAY_OUT` 46, `clashWhat` ("published "), `sync.ts clashWayOut(holders, war.period?.stage==='published')` 688/708, type `ClashWayOut` |
| R14 | **Where the page opens** | First open date from today in whichever period holds it, else today | Boot, first show of the tab, a period switch in View, a clash tap | `stages.ts pickDefaultPeriodId` (stage rank), `store.ts` 408 and 1045 (boot), `selectWar` 4872, `period.ts defaultFocusDate`, `LeaveWarPage.tsx` 126, `Matrix.tsx defaultMonth` 911 (the column window is BUILT around it) |
| R15 | **Undo / Redo** | Bubble says what opened/closed (D352 narrowed): c413 words "Undid: closing bidding — bidding is open again for everyone"; grid stays where it is when on screen (D672) | One step per tap / per drag / per calendar save | `undo/describe.ts` `stageOf`/`stageMove`/`STAGE_TO`/`STAGE_NOW`/`bubbleText` 160–227, 413–420; `state/changelines.ts` 521 (a stage move writes no line); `undo-wire.ts snapView` (focus only from `lw.cell` dates); `Matrix.tsx` 627, 695 (selection cleared on `period.stage` change) |
| R16 | **Store doors** (every write) | — | Each asks "is this day open" of **the period holding the date** and today (member), and refuses with the right words | `setCell` 2850, `cellProblem` 2760 ("check the war and the bidding window"), `writeMany`, `clearCells` 2975, `clearRequestsAt` 3001, `awardsIn` 3044, `clearRecordById` 3214, `setBidStates` 3126, `decideRequestById` 3186, `changeAbsenceById` 3224, `decidableIn` 4797, `deletableIn` 4815/4818 |
| R17 | **Command gate / permissions** | — | Member write on a closed day refused at the command layer too (B8); the open-dates writer admin-only with its own type | `state/perms.ts` 432–434 (`'lw.stage'`), `lwRegisterCommands` 1463, `permsparity.test.ts`; `docs/data-model.md` §11 LeaveWar / LeaveBid rows |
| R18 | **Saved shape** | Open dates and the last-closed note survive a reload; a new period survives a reload | Old saved war loads | `store.ts readWar` 703–803 (**rejects a war whose `stage` is not one of the four, and rebuilds the period from NAMED fields — an unnamed new field vanishes**), `readWorldRows` 862 (a skipped war row drops its records too), `applyLwRecord` 1337, `NO_PERIOD` 394, `engine/wars.ts makeWar` (`stage:'draft'`), `seed.ts seedPeriod` 110, `period.ts` type 75–91 |
| R19 | **Creating a period** | New period: nothing open, chip "Bidding closed", **no member bid** (B2) | "+ New" (WarSheet), the Holidays list's "create the period" ask, the schedule's "create it" link (D19) | `createWar` 4948, `sync.ts createOilPeriodFor` 283–296 (comment says "left in DRAFT"), `ui/interactions.ts` 1728 toast "Set its bidding window here." |
| R20 | **"No leave period yet"** empty state | No "starts in draft" (B12) | — | `LeaveWarPage.tsx NoWar` |
| R21 | **Must NOT change** | Inputs page leave on a closed day lands approved and shows on the war (D1166); OIL pass credits (`clearRaptorCell`, `ingestDutyCredit` — no stage read); OIL awards (`setDayAward`, `grantTo` — no stage read); OIL tracker; SANS calendar / Calendar window (`dayFacts`, `flyMonth` — no stage read, but `useWarFacts` moves on any period change); the bell (no line from opening/closing in M1 — D1214 is M4); Holidays list writers; Required rows | — | `leavewar/inputgate.ts` (no stage check — must not gain `canEditCell`), `sync.ts` 2377 `dayFacts`, `state/notices.ts` |
| R22 | **Roles** | Admin (Saber), member (Ranger), admin's member view (`switchRoleView`), someone signed in without access (`viewer ''`), guest | — | `canEditRow`, `lockedCols` memo ignores role changes unless `version` bumps |
| R23 | **Test/probe bridge** | — | e2e injects wars with `stage` | `probe-bridge.ts lwLoadWars`/`lwCreateWar`; `e2e/leavewar.spec.ts` (97 stage refs), `e2e/app.ts` (8), `step4-leavewar.spec.ts` (3) |

---

## 2. Scenarios, ranked by likely value

Format: **Setup** (through the app's own controls) · **Action** · **EXPECTED** (only where a ruling says) · **Disproved
by** · walk / test. Ranked: the least-shared, most specialised surfaces and the persistence traps first.

### Tier A — most likely to be missing

**S1. Open dates survive a reload; a new period survives a reload.** *walk + test*
Setup: admin, desktop. Open the window, tap APR, then MAY. Close it. Separately "+ New" a period 2028.
Action: reload the page (F5), sign in again.
EXPECTED: the chip still reads Open with April–May (one stretch, D1168 "adjacent months join"); the 2028 period is still
in View. (D1177 — the open dates are the admin's record; the war persists, `leave-war.md` §Architecture.)
Disproved by: chip back to "Bidding closed"/the old window, or the 2028 period gone, or its records gone. Why likely:
`readWar` rebuilds the period from named fields and **refuses a period whose `stage` is missing** — a writer that drops
`stage` with a reader that still demands it loses every war on reload; a new field the reader does not name vanishes
(the eventShorts trap, store.ts 754). Test: round-trip a period with two stretches and the last-closed note through
`readWorldRows`.

**S2. A member's tap on a closed day on his own row gives the closed note.** *walk*
Setup: member Ranger, phone 390, clock 15 Feb 26; demo open 1 Jan–31 Mar. Scroll to April.
Action: tap Ranger's 1 Apr cell. Then tap a closed day in the same month as an open one (admin first opens only
10–20 Mar by the calendar; member taps 25 Mar).
EXPECTED: the closed note, word for word "Bidding is closed. To change your leave, seek management's approval, then
file it on the Inputs page. Your approved leave updates here by itself." — on any day not open, whether or not another
stretch is open (D1176). "Open the Inputs page" button (drawn r7-08 — RECORD where it goes).
Disproved by: nothing opens (c413: a closed cell is not `actionable` for a member), the old toast "That day is not open
for bidding — check the war and the bidding window.", or a bid window that then refuses.

**S3. A member's own pending bid on a day that has since closed: note + Delete (D1225).** *walk*
Setup: admin opens MAY. Member Ranger bids LL on 5 May (open). Admin taps MAY again (closes it).
Action: member taps 5 May.
EXPECTED: the pending note ("his bid is pending a decision and he may delete it", D1225; r7-09) with Delete; Delete
removes the bid; the balance gives the day back; Undo puts it back.
Disproved by: the closed note with no Delete; Delete drawn but refused (c413 `clearRecordById`, `setCell('')`,
`clearRequestsAt`, `deletableIn` all ask `canEditCell`); the bid placed instead of deleted.
Repeat via: (a) the day's list (a day with his bid AND an OIL award — DayList's Delete is gated by `editable`);
(b) a drag-select over 4–6 May (SelectSheet's Delete reads `deletableIn`); (c) a half-day bid (*LL).

**S4. A member cannot ADD on a closed day by any door (B2, B8).** *walk + test*
Setup: member, nothing open in May.
Action: on 5 May with his pending bid there (S3), try to change LL → OL in the sheet; try "Pick a range" 28 Apr–10 May
with April open; drag-select 28 Apr–10 May and fill LL; Move his April bid +7 into May.
EXPECTED: no new or changed bid lands on a closed day (D1177); the range writes April only and says how many were
skipped. Disproved by: any May cell holding a new bid. Test: a member `lw.edit` envelope on a closed day is refused by
the command layer, not only by the store (B8 "joins the war's permission check").

**S5. "No open dates means closed" — a new period takes no member bid (B2).** *walk + test*
Setup: admin "+ New" 2028 (or select the demo's 2027 period, which was a draft).
Action: member taps any 2027 day.
EXPECTED: chip "Bidding closed"; grid shows as normal (no dim, no lock); the tap gives the closed note; no bid lands
(D1177). Disproved by: a bid window opening (c413 `inBidWindow` reads null bounds as "the whole period is open"; an
old-shape null window or an empty stretch list read the same way would open the whole year — the inversion is the bug
to look for in `inBidWindow`'s replacement, `measureBidBox` "null bounds = the whole war", `clearBidWindow` "Open the
whole year").

**S6. An admin's tap on an approved leave still gets Back to bid / Refuse / Move / Delete — not only the remarks.** *walk*
Setup: admin; a war-approved leave of Ranger's on 20 Jan 26 (approve one first if none).
Action: tap it (one-record day). Then a day where the same leave sits beside an award (day's list).
EXPECTED: the admin can send it back, refuse, move or delete it at any time (D1177 "the admin decides bids at any
time"; host's reading: nothing is frozen now); and its remarks are reachable (D418 narrowed).
Disproved by: the remarks editor alone. Why likely: c413's remarks editor "wins FIRST" over every other sheet
(Matrix 3069/3810) and was safe only because it existed at Published; flipping its gate to "any time" hands the admin a
remarks-only sheet everywhere.

**S7. A member's own approved leave: remarks at any time, and no other change.** *walk*
Setup: member; his approved leave on an open day, and one on a closed day.
Action: tap each; also a day with his approved leave + an award (day's list "Note").
EXPECTED: its remarks editor, both days (D418 narrowed); he cannot move, refuse or delete it (he changes it on the
Inputs page, D1166). Disproved by: the bid window on the open day letting him replace it; the closed note hiding the
remarks on the closed day; the day's list showing no Note (c413 DayList 139 = Published only).

**S8. The admin decides at any time — on a period nobody opened.** *walk*
Setup: admin; View → JAN–DEC 27 (demo: Reset's LL 13–16 Apr 27, Dusk's *LL 5 May 27, pending; nothing open).
Action: tap Reset 13 Apr → Approve; drag-select 13–16 Apr → Approve; Dusk's day's list → Refuse.
EXPECTED: each lands (D1177, D418 narrowed); the approved leave appears on the Inputs page for Reset (an approved leave
reaches Inputs at Approve, D418). Disproved by: no Decide row (c413 `canDecide` refused draft; `decidableIn` returns 0).

**S9. Year-end: ask the period HOLDING each date (B3).** *walk + test*
Setup: admin opens DEC in 2026 and JAN in 2027. Member, clock 15 Dec 26.
Action: (a) in the 2026 grid, "Pick a range" 28 Dec 26 – 3 Jan 27 LL; (b) Move his 30 Dec bid +5 to 4 Jan; (c) close
JAN in 2027 only, then retry (a); (d) open nothing in 2027, open all of 2026, and retry (a).
EXPECTED: dates in 2027 are judged by 2027's open dates, dates in 2026 by 2026's (B3). (d) writes none of the 2027 days.
RECORD whether (a)/(b) are offered at all (c413: the range picker stops at the period's end; `moveRecordsProblem`
refuses any landing outside `state.period.days` as "window").
Disproved by: a 2027 day written because the **2026** period's open dates (or its old whole-year null) answered for
it — every c413 door asks `canEditCell(state.period, …)`, the period on screen. Test: `setCell` for a 2027 date while
2026 is on screen, with 2026 all open and 2027 none → refused.

**S10. The page opens on the first open date from today (D1177 reading).** *walk + test*
Setup: (a) clock 22 Oct 26, only 1 Jan–31 Mar 26 open → expect today 22 Oct; (b) admin opens JAN 27 only → reload →
expect JAN–DEC 27 on screen at 1 Jan 27; (c) open 1–31 Mar 26 and 1–30 Nov 26, clock 15 Feb 26 → expect 1 Mar 26
… RECORD for (c): is "first open date from today" 1 Mar (next start) or 15 Feb? (only Mar open, so 1 Mar); (d) today in
no period at all (only 2027 exists, nothing open) → RECORD.
Also the View switch (`selectWar`) and the column window's first-drawn month (`Matrix defaultMonth` — built around the
landing, or the desktop drifts back to January). Disproved by: landing on 1 Jan / bidFrom / the 2026 period when 2027
holds the first open date; or landing right then sliding to January as the months fill.

**S11. The clash note's approved-leave way out (D827 reworded).** *walk + test*
Setup: admin approves Reaper's OL on 19 Jan; on the Inputs page file HL for Reaper on 19 Jan.
Action: read the clash line (phone and desktop); tap it.
EXPECTED: no "Step the war back to Bidding Closed" anywhere (D1177/D827); drawn words "Change the approved leave" and
"…but the bid is approved OL" (r7-19 — RECORD the exact words built); the tap opens Reaper's 19 Jan with Back to bid /
Delete on it. Disproved by: old words; a "published" word left in the sentence; a tap opening a sheet with no control
(c413 `clashWayOut` still branches on `stage==='published'` → a `'war-published'` value with no words in `WAY_OUT`
prints "undefined").

**S12. An old saved war loads (the plan's one back-compat case).** *test (+ one walk on a browser holding the old row)*
Fixtures: a stored period `{stage:'open', bidFrom:'2026-01-01', bidTo:'2026-03-31'}`; `{stage:'open', bidFrom:null,
bidTo:null}`; `{stage:'closed', bidFrom…}`; `{stage:'published'}`; `{stage:'draft'}`.
EXPECTED (plan batch 1): open + window → one stretch; every other stage → none; nothing crashes, nothing else lost.
RECORD for `open` with null window (whole year → one stretch of the whole period, presumably).
Disproved by: the war (and so all its records) skipped on load; the page blank.

**S13. Opening/closing writes one command, one Undo, named words, grid stays (B12, D352 narrowed, D672).** *walk*
Setup: admin, grid scrolled to June.
Action: open APR in the window; Undo; Redo; drag JUL→SEP; Undo once; open an exact range by the calendar; Undo.
EXPECTED: each gesture is ONE Undo step (B12); the bubble says it took back opening/closing (D352 narrowed — RECORD the
words); the grid does not jump while June is on screen (D672). Disproved by: three Undos for a three-month drag; the
bubble "a change to the leave board" (c413 `setBidWindow` ran outside any named gesture); the grid jumping to 1 Jan.

### Tier B — the window itself (state table in §2a)

**S14. Month drag runs in calendar order (A7b).** *walk*
Phone (two rows of six): hold MAY on row 1, drag diagonally down to SEP on row 2 — the finger crosses JUN and then
lands on row 2 without touching JUL or AUG. Desktop: drag from SEP leftward to MAR.
EXPECTED: every month from the first to the one under the finger, in calendar order, opens as one stretch (D1169, A7b):
MAY–SEP, and a backward drag SEP→MAR opens MAR–SEP. Disproved by: only the months the finger touched (MAY, JUN, SEP —
two stretches with a JUL–AUG gap), or a gap on the backward drag.

**S15. A drag that starts on an open month closes (D1169).** *walk*
JAN–MAR open. Drag from FEB to APR.
EXPECTED: closes the open months passed (FEB, MAR); RECORD what happens to APR (closed already) and to JAN (not passed —
stays open, so JAN and the rest split into two stretches correctly). Disproved by: APR opened.

**S16. Part-open month (D1168).** *walk*
Calendar: open 10–20 Mar. EXPECTED: MAR lit with a dotted edge; one tap opens MAR whole (D1168); a second tap closes it.
Also: a drag that STARTS on the part-open MAR — RECORD (open or close?). A stretch 25 Feb–5 Mar: both FEB and MAR dotted.

**S17. Join and split.** *walk + test*
Open MAR, then MAY (two stretches), then APR → one line "1 Mar – 31 May" (D1168 reading). Close APR → two lines again.
Calendar 15 Feb – 15 Apr over an open MAR → one stretch. Disproved by: overlapping or duplicate lines; day counts wrong.

**S18. Period not January–December.** *walk*
"+ New" 1 Apr 27 – 31 Mar 28 (12 months crossing a year end) and 15 Jan 29 – 14 Jan 30 (13 calendar months).
EXPECTED: the months of the period as buttons (D1168). RECORD: order (APR…MAR), two-digit years, 13 buttons on a
phone's "two rows of six", a partial first/last month (tap opens only the period's part — lit solid or dotted?).

**S19. The window and the record changed behind it.** *walk*
Window open; Undo from the top bar; Redo. Then: second tab? (skip). EXPECTED: the buttons and lines follow at once.
Disproved by: the window showing the old months; a following tap acting on the stale picture.

**S20. Keyboard and Escape (design guide §3).** *walk (desktop)*
Tab to the chip, Enter; Tab through the month buttons; Space opens; Enter on a stretch line; the calendar's month list
open → Escape closes only it (D1012/D1020), Escape again closes the calendar, again the window; focus returns to the
chip. RECORD whether any month can be range-opened without a mouse.

**S21. A phone: hold vs scroll vs tap.** *walk (390, touch)*
A finger that starts on a month button and moves vertically to scroll the window must not open months; a quick tap is
a tap (D1169 reading); a tap with a few pixels of jitter toggles exactly one month.

**S22. The chip on a phone with two stretches.** *walk (390 and his iPhone width)*
Open JAN–MAR and MAY–AUG. EXPECTED: the second line stays one line (D678 — the chip, Under, Legend). Disproved by: the
line wrapping or Legend pushed off. Desktop shows "+1" (r7-18).

**S23. "Bidding closed" tap — last stretch and who closed it (D1177 reading).** *walk*
(a) admin closes the only open month → tap → RECORD words (expected: that stretch and "Saber"); (b) the stretch was
removed by an **Undo** of its opening — who "closed" it? RECORD; (c) a period never opened → RECORD; (d) member taps it.
(e) reload after (a) — still there (S1).

### Tier C — the moved mark, the remarks, the gates around them

**S24. The moved mark on any move of approved leave (D1177).** *walk*
Admin approves Ranger's LL 20 Jan (on an OPEN day), drags it to 22 Jan. EXPECTED: the dotted moved mark on 22 Jan, the
Legend shows the moved line, the bid window / day's list say "moved from 20 Jan" (D1177 "any move of a leave already
approved"). Disproved by: no mark because the day is open (c413: `tracked = biddingClosed(stage)`, door `lwMoved` only
when tracked). Then: admin moves a PENDING bid → RECORD whether it gets the mark (c413 marked it once closed); a member
moves his own pending bid → RECORD (expected none: nothing approved was moved).

**S25. A member moves his own pending bid only while its days are open (D333 narrowed).** *walk*
(a) open→open: Move chip on the one-day window, on the day's list, by drag — all work, land undecided. (b) open→closed
landing: refused with its reason. (c) source day since closed: Move not offered (only Delete, S3). (d) landing before
today. EXPECTED (a) works (D333); RECORD the words for (b)–(d). Disproved by: Move offered then refused silently.

**S26. D1211 today edges.** *walk + test*
Clock 15 Feb 26, all of Feb open. Member: tap 14 Feb (yesterday), 15 Feb (today), 16 Feb. Admin: same three.
EXPECTED: member can bid 15 and 16, not 14 (D1211); admin all three. Outline for the member starts at 15 Feb (reading);
the admin's covers the whole stretch. RECORD the tap on 14 Feb (closed note?). Also: drag-select 12–18 Feb as member →
the fill skips 12–14 and says so. Test: `localToday` is local time (period.ts 195) — fix TZ in the unit test.

**S27. Member's own OIL award on a closed day.** *walk*
A member's own award (demo: find one, or admin awards Ranger 1 OIL on a closed day). Member taps it.
EXPECTED: his award, read only, at every stage (D261 — now any day). Disproved by: the closed note covering it (both now
want the same tap; c413 shows `AwardSheet` exactly where the bid window would not open).

**S28. Inputs-page leave on a closed day (D1166).** *walk*
Member on the Inputs page files LL 5–7 May (May closed); edits it to 6–8 May; deletes it. Admin does the same for
Ranger. EXPECTED: lands approved, shows on the war with the "filed on the Inputs page" edge, never refused or held by the
closed dates (D1166). Then on the war the member taps it → the read-only "change it on the Inputs page" sheet (RECORD if
the closed note shows instead). Test: `inputgate` has no open-dates read (pin it).

**S29. Selection and sheets when dates open/close under them.** *walk*
Admin drag-selects Ranger 4–6 May (panel up, D642), opens the window, closes May, returns. Member side: member has the
bid window open on 5 May while… (one browser: switch to the admin's member view? `switchRoleView`).
RECORD: does the open panel still act on the old picture? c413 cleared selections on `period.stage` change (Matrix
627, 695) — a missing replacement key leaves a live panel acting on days now closed.

**S30. B8: a decision taken from a state since changed is refused.** *walk + test*
Admin drag-selects a block with Ranger's pending LL on 5 May (the panel stays up — D642). With the panel still up, tap
Ranger's 5 May behind it and Refuse. Back in the panel press Approve.
EXPECTED (B8 — host's reading of the mechanism, a question): the stale Approve is refused rather than approving the
refused bid. Disproved by: the refused bid becomes approved leave (c413 `setBidStates` reads the day fresh and approves
whatever request is on top). Test: decide with a stale "expected state".

### Tier D — must not change, roles, empty state

**S31. The bell stays silent for opening/closing in M1.** *walk*
Admin opens APR, closes it, Undo, Redo. Member signs in. EXPECTED: no new bell line (D1214's line is M4, plan §2 Q8).
Also the changes window (Edit Schedule's clock): no line from opening/closing (c413 changelines 521: a stage move writes
none). Disproved by: a line in either.

**S32. SANS calendar, Calendar window, Inputs month unchanged.** *walk ("when nothing should change", walk-scripts §8)*
Record the SANS month and the Calendar window as text before and after opening/closing APR — identical. `dayFacts`
reads no stage; `useWarFacts` will move (a period changed) — harmless, but confirm no flicker/close of an open day panel.

**S33. OIL credits and awards on closed days.** *walk*
Publish a weekend on the schedule where Ranger works (closed day on the war) → the OIL credit lands; admin awards OIL on
a closed day from the day's +OIL and from the OIL tracker → lands; Clear by the admin on a closed day takes the award and
names it (D260). EXPECTED unchanged (D79, D402). Disproved by: refusal "not open for bidding".

**S34. The read-only viewer and the admin's member view.** *walk*
(a) someone signed in without Leave War access (`viewer ''`): chip visible? taps open nothing, no closed note on rows
not his; (b) admin's member view (`switchRoleView`): the outline starts at today, locks/dims as a member's, closed note
on Saber's own row; switch back — the admin's picture returns without a reload (c413 `lockedCols` memo keyed on
`version` only). RECORD (a).

**S35. A member taps a closed day on SOMEONE ELSE's row.** *walk* — RECORD (closed note, or nothing, as c413).

**S36. "No leave period yet."** *walk* — clear to no war (test world); EXPECTED: no "starts in draft" (B12).

**S37. Creating the period from the schedule (D19).** *walk*
On a weekend with no period, "create it" → toast and Leave War. EXPECTED: the new period is closed, the toast still makes
sense ("Set its bidding window here." — RECORD; there is no "window" any more, it is the "Open for bidding" window).

**S38. The grid's speed (plan §E).** *measure* — on the built bundle, before and after: N outlines, the dim, the member's
row with every closed cell now tappable. Open/close a month: one repaint (B12). No per-cell child added.

### 2a. State table for the "Open for bidding" window (walk; RECORD each cell not fixed by D1168/D1169/D1172)

| State \ event | tap closed month | tap open month | tap part-open month | drag start closed → over closed | drag start closed → over open | drag start open → over closed | drag across the phone's row break | calendar icon | Undo behind it | close + reopen | Escape | keyboard |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| nothing open | opens whole (D1168) | — | — | opens all passed as one (D1169) | — | — | calendar order (A7b) | (no line) "+ Open more dates" | shows previous | same state | closes window | Tab/Space |
| one stretch | opens; joins if adjacent | closes | opens whole | opens | RECORD (union?) | closes those passed (D1169) | A7b | exact days of that stretch (D1172) | follows | same | closes calendar first | RECORD |
| several | as above | splits a stretch if inner | as above | as above | RECORD | as above | A7b | that line's own | follows | same | — | — |
| part-open only | opens whole | — | opens whole | — | RECORD | RECORD (starts on dotted) | — | — | — | — | — | — |

---

## 3. Break tests (cut a wire; this test must go red)

| Cut | Test that must fail |
|---|---|
| Make the open-dates check return true for an empty stretch list | "a new period takes no member bid" (B2) |
| In `setCell`'s replacement, ask the period on screen instead of the one holding the date | S9's unit test: 2027 date while 2026 on screen |
| Drop the new field from the period reader (or keep demanding `stage`) | S1 round trip through `readWorldRows` |
| Remove the today check for a member | S26 unit: member refused on yesterday, admin allowed |
| Gate `clearRecordById` / `deletableIn` on "day open" again | S3: member deletes his pending bid on a closed day |
| Make the remarks editor win over the admin's decide sheet | S6 render test: admin's approved-leave tap shows Back to bid |
| Write a drag as one command per month | S13: one Undo takes back a three-month drag |
| Walk a drag along the finger's path | S14: JUN→SEP via row change opens JUN–SEP |
| Leave `clashWayOut`'s published branch | S11: no `'war-published'`; words present for every way out |
| Remove the open-dates writer's `perms.ts` row | `permsparity.test.ts` |
| Add `canEditCell`/open-dates to `inputgate` | S28: Inputs-page leave on a closed day lands approved |
| Keep `tracked` = "closed" | S24: approved leave moved on an open day carries `lwMoved` |
| Map an old `closed` war to its old window | S12: only `open` becomes a stretch |

---

## 4. Negatives — checked and nothing to add

- **OIL awards and the OIL pass** read no stage at c413 (`setDayAward`, `grantTo`, `ingestDutyCredit`, `clearRaptorCell`
  "ignores stage, role and window") — only S33's regression check.
- **`dayFacts` / `flyMonth` / the SANS and Calendar screens** read no stage or window — only S32's sameness check.
- **The bell (`state/notices.ts`)** reads no Leave War stage; only holidays write notices — S31 confirms nothing new.
- **The Under-manned list** is computed from the period's days and verdicts, never the stage — no scenario.
- **`ackReplacement` ("OK, seen")** has no stage gate — none needed.
- **Event rows, holidays, Required rows** are admin writers with no stage gate — none.
- **My leave, Approvals, Balances** are M2–M5 (plan §1); the drawings show them but M1 must not be judged on them.
- **`Document`** on the pending-note sheet (r7-09) is D1159, M3 — RECORD whether it appears; not a finding either way.
