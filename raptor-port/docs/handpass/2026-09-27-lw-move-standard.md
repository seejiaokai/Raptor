# [LW-MOVE-STANDARD] — one look for the Leave War's sheets, and a Move on every record that can move (27 Sep 26)

Branch `claude/rulings-d264-d266-leave-war-f0f4ab` (worktree `five-flags-batch-continue-2cfa70`), cut from `main`
`818dbb04`. The order this follows: `raptor-port/docs/bug-check-order.md`. The rulings: `.claude/rules/decisions/leave-war.md`
D264, D265, D266 and his answers to the mock-up D330–D335. The approved design: `docs/mock/lw-move-standard.html` (and
its Artifact). The backlog: `OUTSTANDING-ARCHIVE.md` `[LW-MOVE-STANDARD]` (folds in `[LW-MOVE-BENEATH]`; both archived 27 Sep 26 once PR #447 merged). Fable's scenario design
(rank 1, before the build): `docs/superpowers/specs/2026-09-27-lw-move-standard-scenarios-fable.md`. Walk script
`scripts/handpass/ms/ms-10-walk.mjs`; results `docs/handpass/parts/2026-09-27-lw-move-standard-ms10-{desktop,phone}.txt`;
pictures `docs/img/handpass/2026-09-27-lw-move-standard/{desktop,phone}/`; break tests `scripts/handpass/ms/ms-breaks.py`.

## 0. Where this stands (kept current)

- **Built**, red first: `fcba6bc7` (the store's record-level move, both sheets, the day's list, the one Move / Delete).
- **Walked** at desktop 1440 and a 390 touch phone (real touch over CDP): **40 / 40 each width**, no console errors.
- **Break tests:** 19 wires, **each turns a named test red** (§6) — B18 needed a new test (added, `6de7d0b1`).
- **The two code reads** (Fable, Astra, blind): six findings (three found by both), all FIXED red first; one note filed (§8).
- **Break tests of the fixes:** B20–B26, each red (§6). **Re-walk** on the fixed build: the fixes 4 / 4 and the whole
  first walk 40 / 40, at both widths, no console errors (§5a).
- **Gates:** run 1 and the final run all green (§9). **His look:** §10.

## 1. The eight questions → FULL

| # | question | answer | why |
|---|---|---|---|
| 1 | Money (earned leave, D25) | **YES** | a Delete still takes OIL awards (D260 — its doors and words changed); a move of approved leave moves the day it is charged on |
| 2 | The published record | **YES** | moving a war-approved leave re-dates an Input, which a published schedule day may show (its pending mark — unchanged path) |
| 3 | Saved data | **YES** | every move and delete writes the war's records or the Inputs |
| 4 | A shared drawer | **YES** | one Move and one Delete (`SheetActions.tsx`) drawn by three sheets; `moveSel` shared by every door |
| 5 | A new gesture or mode | **YES** | the day's list's Move enters the move mode; a picked range carries Move / Decide / Delete |
| 6 | A new surface | NO | no new sheet — three sheets re-laid |
| 7 | Roles | **YES** | a member's Move on his own bid (D333); who may move is now one rule at every door |
| 8 | The warning list | NO | no warning or rule text is touched |

**Tier: FULL.** Told to him with the plan before the build.

## 2. The rulings, and the readings he can correct

- **D264** one format and look for the one-day and drag-selection sheets. **D331 ("1 A"):** both in order A — Decide ·
  Selected (Move · Delete) · How much · Which leave · then +OIL / PO / PI (one-day) or PO (block). **D335 ("5 keep"):**
  the one-day sheet keeps How many at its top; a picked range widens Decide, Move and Delete (the mock-up's reading).
- **D265** a record that can move always offers Move and travels alone. **D266** the day's list moves a record by the move
  mode, no date box. **D333 ("3 yes"):** a member's Move on his own bid while bidding is open, every door.
- **D330 / D334 ("4 B"):** the one Move — the grey chip with a teal arrow. **D332 ("2 yes"):** "Delete" the one word,
  dashed grey.
- **The mock-up's readings (uncorrected — "What I read into your words"):** Move's landing rules do not change; the
  block's "Post out (PO)…" reads "PO"; one rule for who may move on every sheet (so the one-day sheet's Move at DRAFT
  follows the store, as the block's always did); a refused bid moves too, landing undecided; in a block what can move
  goes and what cannot stays, and the banner says what stays.
- **The agent's readings in the build, stated here so he can correct them:** (a) a refused bid beside a LIVE bid on its
  half is history and stays (moving both would land two live bids on one half — Fable's S32); (b) a picked-from-the-list
  move's banner also names what stays on that day; (c) a moved bid's list line says "moved from …" once bidding is
  closed (Fable's S4 — a day whose top is an award shows no dotted mark for it); (d) approved leave beside leave filed on
  the Inputs page now moves from a block too (by id — Fable's S10), while a block's Delete still cannot take it there
  (so the block offers Move, not Delete — the list's own Delete does).

## 3. What changed (the build, `fcba6bc7`)

| Where | What |
|---|---|
| `state/store.ts` | `movableRecords` (every record on these days this role may move, or the list's pick), `moveRecords` / `moveRecordsProblem` (one gesture, atomic, by record), `stayingIn` (what stays), `deletableIn` (days a Delete would change); `moveCells` / `moveProblem` / `movableCells` read the same records (a day with nothing movable still refused with its reason) |
| `ui/SheetActions.tsx` (new) | `MoveChip` ("⇄ Move") and `DeleteChip` ("Delete", dashed) — the one pair, three sheets |
| `ui/BidPicker.tsx` | order A; the Selected row (Move · Delete) drawn only where they would do something; Clear → Delete ("Delete also takes … — tap Delete again"); a range carried to Decide, Move, Delete; the note beside the button that raised it |
| `ui/SelectSheet.tsx` | order A; the shared Move / Delete; Delete only where `deletableIn`; "PO" |
| `ui/DayList.tsx` | each record that can move has the one Move → `onMove` (the date box gone); Ack · Approve · Refuse · Move · Delete; "moved from …" |
| `ui/Matrix.tsx` | `moveSel.only` (the list's pick); `movers` are records; the banner "· N … stay(s)"; the one-day `onMove(cells)` |
| `ui/select.ts` | `Selection.only` |
| `ui/bidpicker.css` | `.dchip.move .mvarr` (teal), `.dchip.del` (dashed) |

## 4. The roll-call — every place a Move or a Delete of a Leave War record is drawn or started

| Surface | Move | Delete | Must not / because |
|---|---|---|---|
| One-day sheet (`BidPicker`), admin, open / closed / published | YES — the Selected row, when a record can move (walk B1, H1) | YES — when a Delete would change something (B1, C1) | — |
| One-day sheet, admin, DRAFT | YES — the store's one rule (L1) | YES | Decide absent at draft (canDecide) — L1 |
| One-day sheet, member own bid, open | YES (D333 — H1) | YES (H1) | Decide absent (H1) |
| One-day sheet, member, closed | — the sheet does not open for him | — | unchanged gate (`movestandard.test.tsx`) |
| One-day sheet, an empty day | NO — nothing to move | NO — nothing to delete | the house rule (`movestandard.test.tsx`) |
| One-day sheet, an award-only day | NO — an award never moves (D260) | YES, names it first (C1) | a member: no Delete (awardclear.test) |
| One-day sheet, with a range | YES — every day of it (F1) | YES — every day (range tests) | — |
| Drag-selection sheet (`SelectSheet`) | YES — when the box holds a movable record (B2, D2, E1, E2, K1) | YES — `deletableIn` | none where neither would do anything (movestandard tests) |
| Drag-selection, approved leave beside Inputs-filed leave | YES (by id — S10) | NO — a block's Delete cannot take it there | `movestandard-synced.test.tsx` |
| Day's list (`DayList`) — a bid line | YES (D1, E1) | YES (Delete) | — |
| Day's list — approved leave, open / closed | YES (J1) | YES | published: Note only (K1) |
| Day's list — an award | NO | YES (admin) | — |
| Day's list — leave filed on the Inputs page, a medical, a course, the schedule's OIL, a notice | NO | NO | changed on the Inputs page / the schedule's own / "OK, seen" (E2) |
| The move banner | the count of RECORDS and what stays (D1, D2, E1, E2, J1, K1) | — | — |
| `RaptorSheet`, `AwardSheet`, `PostOutSheet`, `PostInSheet`, `RemarksSheet` | NO | NO | read-only / posting management — untouched |

## 5. The door check

| Action the data allows | Its door, every state |
|---|---|
| Move a bid alone on its day | one-day sheet Move; block Move; (list not shown for one record) |
| Move a bid beside an award / filed leave / a medical | day's list Move on its line; block Move (D1, D2, E2) |
| Move one of two halves | day's list Move on that line (E1) |
| Move both halves / a bid + approved leave together | block Move (E1, J1) |
| Move approved leave (open / closed) | one-day sheet (alone), list line Move, block Move (J1) |
| Move a picked range of one man's days | one-day sheet → Pick a range → Move (F1) |
| Move a refused bid | one-day sheet (alone) (G1); list; block — landing undecided |
| Member moves his own bid | one-day sheet, list, block while open (H1) |
| Delete (a bid, an award, approved leave, a range) | Selected row's Delete (one-day, block); the list line's Delete (C1, walk) |

## 5a. The walk (`ms-10-walk.mjs`, the production build on 4177, a fresh demo world)

**40 / 40 PASS at desktop 1440; 40 / 40 PASS on a 390 touch phone** (tap then Confirm), no console errors, no 4xx. Steps:
A1 fixture (Vector's award + LL on 3 Jan, through the day's own sheet) · B1 one-day order and look (measured: the arrow
`rgb(59,198,232)`, Delete `dashed`, same height) · B2 block order, look, "PO" · C1 an award-only day: no Move; Delete
names the award, the second tap takes it · D1 Vector's list: the bid Ack · Approve · Refuse · ⇄Move · Delete, the award
Edit… · Delete, no date box; Move → "Tap a day to move 1 entry · 1 OIL award stays" → lands undecided on 5 Jan, the award
stays; one Undo · D2 a block over Ryder–Wisp 3 Jan offers Move (was Delete only) → the bid alone · E1 morning + afternoon:
two Moves on the list; the morning alone ("· 1 bid stays"); a block moves both ("2 entries"); ONE Undo · E2 a morning filed
on the Inputs page + an afternoon bid: the filed line has no buttons; the block moves the bid ("· 1 leave filed on the
Inputs page stays") · F1 Pick a range → Move ("3 entries") and → Ack (all three) · G1 a refused bid alone moves, lands
undecided · H1 Ranger (member): no Decide, Move + Delete, his move lands; another man's day opens nothing · J1 CLOSED:
approved morning + afternoon bid — the leave's line Back to bid · Refuse · ⇄Move · Delete, no date box; the leave alone,
then a block both ("2 entries") · K1 PUBLISHED: the approved leave's line has Note only; a block moves the bid ("· 1
approved leave stays") · L1 DRAFT: no Decide, Move present.
**The re-walk on the fixed build** (`MS_RUN=rewalk`): the whole walk again **40 / 40 at each width**, and the fixes
(`ms-20-fixes.mjs`) **4 / 4 at each width** — FR1 a block over a bid and the first day of a two-day approved leave (one
Input, Feb 10→Feb 11), landed two days on: refused "already booked", nothing moved · FR2 approved morning + a morning bid
moved one day: the leave onto the day the bid left · FR3 approved morning beside a refused morning: the refused line has no
Move, a block moves the leave alone ("· 1 refused bid stays") · FR4 a range picked from an empty day draws Decide and Ack
answers both bids. Pictures in `rewalk/`. No console errors.
**Script faults, not defects:** the first run's F1 (and the fixes' first FR3) set leave that took Wisp below zero;
the sheet asked "Tap the same leave again" (as designed) and the script did not answer — fixed in the scripts (picture
`desktop/ms10-desktop-THREW-F1-range.png` kept as the record).

## 6. The break tests (`ms-breaks.py`, a scratch worktree, each wire broken once)

| Wire | Red |
|---|---|
| B1 a move reads the day's top record again | 11 tests (store + sheets) |
| B2 approved leave never moves | S8 (both travel) |
| B3 a refused bid beside a live one moves too | S32 |
| B4 what stays is never named | 3 (store + banners) |
| B5 Delete never offered | 20 (store, sheets, awardclear, …) |
| B6 the list's pick ignored | 3 |
| B7 the Selected row loses its name | the one-day order test |
| B8 Move carries the tapped day, not the range | 2 (range Move; S14) |
| B9 Decide answers the tapped day, not the range | range Decide |
| B10 Move loses its teal arrow | 5 look tests |
| B11 Delete drawn red | 4 look tests |
| B12 the list's bid line has no Move | 3 |
| B13 the list's Move carries the whole day | the "picks ONE" test |
| B14 the block's "PO" reads "Post out (PO)…" | the block order test |
| B15 the block's Move is its old button | 2 |
| B16 a moved bid's line forgets "moved from" | S4 |
| B17 the banner never says what stays | 3 |
| B18 the block offers Delete where it would do nothing | **none at first** → `movestandard-synced.test.tsx` added → red |
| B19 the one-day Delete ignores the range (naming) | 2 (awardclear range) |
| B20 FR1 the preview drops every day of a moving leave | FR1 |
| B21 FR2 the door counts the moving bids at the preview | FR2 |
| B22 FR3 a refused bid beneath leave on its half moves again | FR3 (2 tests) |
| B23 FR3b the door's answer at the commit is thrown away | FR3b |
| B24 FR4 Decide over a range drawn from the tapped day only | FR4 |
| B25 FR5 a refused bid staying is not named | 3 (store + banner) |
| B26 FR6 a record gone under a move goes unsaid | FR6 |

## 7. What was NOT walked, and why

- **Safari / a real iPhone:** the phone walk is Chromium with real touch events; the move mode's touch path is unchanged
  from D262 (walked then). On his look card.
- **A war switch / leaving the tab mid-move from the list:** the list's Move sets the same `moveSel` every other door
  sets, so every ending guard (D262's C-walk) applies unchanged — not re-walked.
- **A locked (published-schedule) week under approved leave:** the door's refusal path is unchanged (`moveApproved`).

## 8. The two code reads (Fable 5.1 and Astra, blind to each other, with this sheet in hand)

Brief `docs/superpowers/briefs/2026-09-27-lw-move-standard-final-read-brief.md`; the reports kept whole:
`…-final-fable.md`, `…-final-astra.md` (Astra on `gpt-5.6-sol` — the Codex config's default model is refused on this
account; its first run failed in seconds, see observation 312). Every finding answered in `580034d0`: the seven store tests
red before their fixes; the four sheet tests proven by the break tests B24–B26 (they were written with the fix).

| # | Finding | Who | On `818dbb04`? | Disposition |
|---|---|---|---|---|
| FR1 | A block cutting a multi-day approved leave let a bid land on the leave's untouched day (the preview dropped EVERY day of a moving leave) | Fable 1, Astra 1 (both, blind) | yes (made more reachable) | **FIXED** — only the moving DAY is dropped (id AND date, as the door's own `leaving` set); walked (FR1) |
| FR2 | Approved leave could not land on the day a moving bid was leaving ("already booked") | Fable 3, Astra 1 (both, blind) | yes | **FIXED** — the door leaves the moving requests out at the preview (`sync.ts doorMoveApproved`, `skip`; agreed with the `[ONE-DOOR]` chat); walked (FR2) |
| FR3 | A refused bid beneath approved leave on its half travelled with it and landed alive, while the door refused the leave at the commit — and its answer was thrown away: half a move, "moved" | Fable 2 | new | **FIXED** — a refused bid beneath an absence on its half is history (not movable); the door's answer at the commit is honoured — the move rolls back whole and says why (`MoveRefusedAtCommit`); walked (FR3) |
| FR4 | With a range picked from a day holding no bid, no Decide was drawn (D335 widens Decide) | Fable 4, Astra 2 (both, blind) | new | **FIXED** — `decidableIn`, `setBidStates`'s own eligibility; walked (FR4) |
| FR5 | The banner did not name a refused bid staying behind | Astra 3 | new | **FIXED** — "· 1 refused bid stays" |
| FR6 | The move machine kept the records of the moment the move began; a record gone under a move left "0 entries" and a silent end | Astra 4, Fable's note | yes | **FIXED** — the callbacks read the live records (a ref); a record gone says "That record changed or is no longer there — nothing to move." |
| N1 | `shiftBid` and `moveAbsenceById` have no production caller now — two spare doors that read differently | Fable's note | — | **FILED** `[LW-SPARE-MOVE-DOORS]` (low: retire them and their tests, or align) |

**Explicit negatives both gave, in short:** one gesture per move at every door; no route for a member to another man's row
or to a move once bidding is closed; no award ever moves; the list's pick is never swapped for the top record; the
refused-bid rule is one body at every door; `deletableIn` agrees with `clearCells` on every kind of day; the mock-up's
promises (order A, How many, the one Move / Delete, "PO", no date box) are all in the code.

## 9. The gates

**Run 1** (the build before the reads, `26466fc8`, one run under the PC lock): unit **6580 / 6580** (406 files) · build clean ·
tfin **728 / 0** · e2e **478 passed**, 48 skipped · smoke **443 / 0** · rulecheck OK · docsize OK (`OUTSTANDING.md` over its
tripwire — deferred on a code change, D29). The Leave War tests after the fixes: **1996 / 1996**.

**Run 2** (the final code, `86d7fea1`, one run under the PC lock): unit **6591 / 6591** (406 files) · build clean · tfin
**728 / 0** · e2e **478 passed**, 48 skipped · smoke **443 / 0** · rulecheck OK · docsize OK (the tripwire deferred, D29).

## 10. His look (the card)

Five minutes on the Vercel link, on your phone — in the Leave War, January or February:
1. **Tap one of your chips, then drag across a few days:** both sheets now read the same way — Decide, then Selected
   (**⇄ Move** · **Delete**), then How much, Which leave. The Move button is grey with a teal arrow; Delete has a dashed edge.
2. **A day with an OIL award and a bid (like Vector's 3 Jan):** the day's list shows ⇄ Move on the bid. Press it, tap
   another day — the bid moves, the award stays, and the bar at the bottom said "1 OIL award stays" before you tapped.
3. **On the one-day sheet, Pick a range:** Move, Approve and Delete now act on every day in it.
4. **Sign in as a member (us) while bidding is open:** your own bid's sheet has ⇄ Move.

No questions for you from the check — every finding was fixed. The readings it rests on are §2 (the three from the
mock-up's "What I read" list, and four more of the build's, (a)–(d)); tell me if any is wrong.
