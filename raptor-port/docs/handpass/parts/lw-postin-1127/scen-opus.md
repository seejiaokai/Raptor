# [LW-POSTIN-BALANCE] — walk scenarios, fresh blind Opus designer (in Fable's seat)

Read-only. Branch `claude/lw-postin-build-5d49de`, diff `origin/main...HEAD`. No handoff block was pasted into me and I
read none; no compaction happened. I did not look for the other designer's report.

What I read: the full rows D2745–D2747, D2749, D2810, D2812, D1479, D1492, D1541; the plan; the whole non-test diff;
`engine/people.ts` (stints), `engine/leaveyear.ts` (personFigures, typedOrStart, runYears, daysTaken, annualUsedIn),
`engine/charge.ts` (the pilot's 15-day run), `state/store.ts` (leaveWorld, peopleCountedFor, HIDDEN_IDENTITY,
setPostIn/openStint/windowFor/withStored/dated, balanceAfterFill, setTypedBalance, balanceProblem), `sync.ts
hiddenIdentity`, `state/raptorRoster.ts projectPeople`, `approvals.ts`, `ui/myleave.ts`, `ui/matrixrowparts.ts`,
`ui/BidPicker.tsx` / `SelectSheet.tsx` below-zero callers, `balancefigs.ts`, `FigBox`, both CSS diffs, `changelines.ts
balanceLines`, the demo balances, the drawings q11-*.png and q16-final-*.png, the ui-contracts and engine-rules entries
the build wrote.

## Roll-call — every place the promise must show (has it / must not, because… / MISSING)

| Surface / door | What D2746/D2747/D2749/D2810 need there | Build |
|---|---|---|
| Engine `personFigures` (one answer for every reader) | drop dates before post-in from approved, pending, what-if and snapshot | has it — via `w.ctx.people` |
| `w.ctx.people` for a man with NO row on the war (SANS man while SANS is off; archived man) | his stored post-in date must still be read | **MISSING** — hidden identity is the raw projection, `from: null` (Suspected fault S1) |
| Person window LVE tile: label, Not typed, line, boxes | "Official bal"; "Not typed" amber; line under LVE box where a box is drawn | has it |
| Person window small tiles (CCL…CL) | Not typed: empty dashed box / amber "–"; War bal line "–" when pending | has it (words "Not typed" only on LVE — RECORD) |
| Person window "N taken" | (no ruling) — but it now leaves out pre-post-in leave | changed silently; disagrees with Days taken (S2) |
| Balances page, Balances view | heading "OFFICIAL BAL", Not typed, the one line above rows | has it |
| Balances page, Days taken view | no ruling; plan said "leaves it out too (to confirm)" | still counts pre-post-in leave (S2) |
| Grid figure beside the name | D2746 names it explicitly ("beside his name on the grid") | must not yet, because D1625 (not drawn) — host's reading; still shows 0 / −1 |
| Grid second line "LL OL" used | none | still counts pre-post-in leave — RECORD |
| My leave "LVE n" | host's reading: same as grid | unchanged (0 / −1 for never typed) |
| Approvals LVE BAL | host's reading | unchanged; reads leaveFiguresOf → post-in drop applies, Not typed does not |
| Bid windows' "left" on the eight leave buttons | D2746 "never 0 or a figure below it" vs D1625 | unchanged: shows −1 etc. |
| Below-zero question: one-day window (BidPicker), drag window (SelectSheet, one or many people) | waits for a figure (D2746) | has it via `goesBelow` (both callers) |
| History line of the first figure | no "from" when never typed | has it ("LVE balance → 24") |
| Carried-forward box typed before any figure | (not ruled) | refuses "Type the Official bal first" — NEW WORDS on screen (S4) |
| Screen-reader names | "Official bal" | has it (aria-labels changed); help texts not checked |

## 1. Scenarios, ranked by how likely each is to find a real fault

### SC1 — A SANS man's balance changes when the admin turns "+ SANS" on or off (suspected fault S1) — desktop, then phone
SETUP: admin (`ad`), app today set to Thu 26 Nov 26 (as the q12 script does). Admin → Users: add "Lynx", FCP, OCU, post-in
Mon 7 Dec 26. On the Leave War with "+ SANS" ON in ⚙ Settings (so he has a row): place LL on Wed 2 Dec (the Post in
sheet's "place leave" door, Auto-approve on), then Balances → type 24 in his Official bal. Place a bid (pending) LL on
Tue 15 Dec. Then tick SANS for Lynx on Quals (or post him out as SANS with a date that has run — whichever makes him a
SANS man whose row hides when "+ SANS" is off). Turn "+ SANS" OFF (the group's ✕).
ACTION: open Approvals; read his line's LVE BAL. Turn "+ SANS" back on; read it again. Sign in as Lynx if he has an
account and read My leave's LVE in both states.
EXPECTED (two surfaces that must agree; D2747): 23 both times (24 typed, 2 Dec never deducted, 15 Dec pending 1).
DISPROOF: with SANS off it reads 22 — the 2 Dec leave comes off because the war counts him through the Raptor projection
(`from: null`) instead of his stored posting. Also record the bid windows' "left" for him if any door reaches him.

### SC2 — The LVE tile's "taken" and the Days taken view disagree for the same man (S2) — desktop and phone
SETUP: as SC1's Lynx but no SANS: post-in Mon 7 Dec 26, LL approved Thu 3 – Wed 9 Dec 26 (across the date), 24 typed
first. Today set to Thu 10 Dec 26 (or any date after 9 Dec).
ACTION: open his person window (tap his name): read "N taken". Balances → Days taken (View = JAN – DEC 26): read his LL.
EXPECTED: RECORD exactly what each says. The engine gives the tile 3 (Mon 7–Wed 9) and Official bal 21; Days taken LL 5.
DISPROOF of a consistent design: the two numbers differ (3 vs 5) with nothing on screen saying why. Put to him: should
"taken" on the tile count leave taken at his old squadron? (the plan's "to confirm at the build" was never put to him; the
build filed it, but the tile was changed and Days taken was not, so they now disagree).

### SC3 — "Not typed" fits on his iPhone's person window and on the phone's Balances page — phone 402 and 375
SETUP: a man never typed (a new person added on Admin → Users, or a demo man i%7===6). Admin.
ACTION: open his person window at 402×874 and at 375 wide; then a member view (us/us) of his own window, unlocked and
locked; then the Balances page at 402, scroll to his row, and pinch out and in.
EXPECTED (D2746, q11 drawings; the tile rules D1241, D1520): "Not typed" whole, amber, inside the LVE tile, never
running into the OIL tile, never cut; on Balances "Not typed" inside the WAR BAL column, not over OIL's figure.
DISPROOF: the words overflow the tile (the fit loop stops at 12px; the War bal column on a phone tile is ~55px wide in
q16-final-phone — "Not typed" at 16px bold is wider), overlap the OIL tile or the OIL column, or wrap. Crop and measure.

### SC4 — Post-in date moved after the figure was typed — both directions, both orders — desktop
SETUP: Pelican, post-in Mon 7 Dec 26, 24 typed on Tue 8 Dec (today 8 Dec). Leaves: LL Wed 2 Dec placed BEFORE typing;
LL Wed 9 Dec placed AFTER typing.
ACTION A: grid → his Post in sheet → move post-in to Mon 30 Nov. Read Official bal / War bal (person window and Balances).
ACTION B: move post-in to Thu 10 Dec. Read again. ACTION C: Undo each move (top bar), read again; Redo.
EXPECTED (D2747; the snapshot rule D1479): start 23 (9 Dec off). A: 23 (2 Dec now after post-in but in the snapshot,
nets 0). B: 24 (9 Dec now before post-in). C: back to 23 each Undo; Redo matches. Person window, Balances, grid figure,
My leave and Approvals all the same number (two surfaces that must agree).
DISPROOF: any surface showing a stale figure after the date moves or after Undo (the figures are cached by state —
this proves the cache key moves with the post-in date), or A reading 22.

### SC5 — Man back from overseas: Restore with a post-in, leave in the gap, figure typed before he left — desktop
SETUP: Ranger-like man with stint 1 (from 1 Jan 26), 20 typed 5 Jan, LL 10–11 Feb approved (→18). Post him out as
Overseas Sqn from 1 Apr. While away, admin approves LL Mon 13 Apr (allowed, D1541 — comes off: 17). Restore on Admin →
Users with post-in Mon 1 Jun.
ACTION: read Official bal after the restore; then retype 17 (as the official app shows) and read again.
EXPECTED (D2747 "days away do not come off"): after restore 18 (13 Apr dropped; 10–11 Feb, an earlier stint, still off).
After retyping 17: RECORD — the snapshot drops 13 Apr too, so 17 stands.
DISPROOF: 17 before retyping (gap not dropped), or 20 (earlier stint dropped).
NOTE for the host — the recorded reading in D2747's row says "a man posted in again after an earlier stint counts only
from the latest post-in", i.e. the earlier stint's 10–11 Feb would NOT come off (20). The build keeps the earlier stint
(18). The two differ; the build's choice was never put to him (S3).

### SC6 — Two earlier stints: leave in the gap BETWEEN them (S3) — desktop
SETUP: stints 1 Jan–31 Mar, 1 May–31 Jul, current from 1 Sep. 20 typed 5 Jan. LL Mon 13 Apr (overseas, first gap).
ACTION: read Official bal.
EXPECTED: by D2747's "a man back from overseas, whose days away do not come off" — 20.
DISPROOF: 19 — the build drops only the gap right before the CURRENT stint (`gapBeforeCurrent`), so an older trip's days
away still come off. RECORD and put it with S3.

### SC7 — Never typed: the below-zero question in every door that places leave — desktop and phone
SETUP: a never-typed man (Not typed on every kind). Admin, Auto-approve on and off.
ACTION: (a) one-day window: LL on a working day; (b) drag window over 3 days of his row; (c) drag over his row AND a typed
man at 0 (two people, one block); (d) CCL on him (never typed); (e) as a member signed in as a never-typed man (if a
demo member has none typed: else add one with an account), bid LL.
EXPECTED (D2746): no "takes him below zero" question for the never-typed man in (a)(b)(d)(e); in (c) the question names
ONLY the typed man. The leave buttons' "left": RECORD exactly (−1 etc. — deliberately unchanged, D1625).
DISPROOF: a question naming the never-typed man; or (c) asking nothing about the typed man.

### SC8 — Never typed: the first figure, the carried box, Undo/Redo and the history line — desktop and phone
SETUP: never-typed man, admin, Balances page.
ACTION: (a) tap the empty carried box, type 3, Enter → read the words under it. (b) tap the empty Official bal, type 0,
Enter (a 0 must save). (c) Undo → back to "Not typed"? Redo. (d) type 24 then Tab to carried, type 2, Enter. (e) open
History (changes list) and read the lines. (f) tap the empty box, press Enter with nothing typed; tap, Escape. (g) the
same in his person window, and on his iPhone at 402.
EXPECTED: (b) 0 saves, "Not typed" goes, War bal 0 (D2746 "until a figure has been typed"); (c) Undo restores the empty
dashed boxes and "Not typed", Redo the 0; (e) "LVE balance → 24", "LVE carried fwd → 2" — no "0 → 24" (store comment);
(f) nothing saved, no words. (a) RECORD exactly — see S4.
DISPROOF: a 0 typed not saving; "0 → 24" or "−1 → 24" in History; Undo leaving "0" in the box; a red "Type a figure"
for (f).

### SC9 — The pilot's 15-day run across the post-in date — desktop
SETUP: a PILOT (FCP) posted in Mon 7 Dec 26, 30 typed BEFORE the leave is placed (typed 25 Nov). LL Wed 25 Nov – Sun 13
Dec (19 calendar days, one unbroken run).
ACTION: read Official bal; then the same with the post-in moved to Mon 14 Dec (none after) and with a WSO.
EXPECTED: RECORD exactly. The engine charges the run whole (≥15 → every day charged) then drops days before 7 Dec, so the
pilot loses 7 (7–13 Dec incl. Sat 12, Sun 13); the 7 days alone are not a 15-day run (5 working days). Put to him which is
right: the official app charged the whole run, which argues for 7; but his figure was typed from the official app.
DISPROOF of the build's reading: none by ruling — this is a question; the walk records it.

### SC10 — Half days and a leave across the date — desktop
SETUP: post-in Mon 7 Dec, 24 typed first. (a) LL AM Fri 4 Dec; (b) LL PM Mon 7 Dec; (c) LL Thu 3 – Wed 9 Dec.
EXPECTED (D2747): (a) 24; (b) 23.5; (c) 21 — and on the grid every one of these days still drawn (D2747 "still shows").
DISPROOF: any figure otherwise; a pre-post-in day missing from the grid.

### SC11 — Pending bids before the post-in date: Pending, War bal, Approvals, approve them — desktop
SETUP: post-in 7 Dec, 24 typed. Bids (pending) LL 2 Dec and LL 8 Dec.
ACTION: read person window Pending/War bal, Balances PENDING APPROVAL, Approvals LVE BAL; then Approve all; read again.
EXPECTED: Pending 1 (only 8 Dec), War bal 23; Approvals LVE BAL 23 on both lines; after approval Official bal 23, War 23.
DISPROOF: Pending 2 or War 22 anywhere.

### SC12 — 1 Jan roll-over and next year — desktop
SETUP: Junior pilot (+33), post-in Mon 7 Dec 26, 24 typed incl. 4 carried on 8 Dec; LL 2 Dec (before), LL 15 Dec (after).
Set today to Mon 4 Jan 27. Also a bid LL 2–3 Feb 27.
EXPECTED (D1235, D2747): 31 Dec 26: 23 (cf 3); 1 Jan 27: 20 carried + 33 = 53 (the 2 Dec leave never touched it);
Pending 2, War 51. RECORD the tile's "taken" (0 in 2027).
DISPROOF: 52 (2 Dec leaking into the roll-over) or carried 3.

### SC13 — Posting OUT after typing: days after the post-out still come off (D1541) — desktop
SETUP: post-in 7 Dec, 24 typed; post out as Overseas Sqn from 1 Feb 27; LL approved 2–3 Feb 27.
EXPECTED: 22 (D1541; the build leaves post-out days alone). With the Delete outcome: Approve refused from the date
(D1545) — RECORD the figure for leave already approved.
DISPROOF: 24 while he is still posted out (not yet back).

### SC14 — Where the one line shows, and where it must not — desktop 1536 at 125% and phone 402
ACTION/EXPECTED (D2749/D2812; host's reading on "where a box is"):
- admin, Balances view: line once, above the column headings (q16-final-bal-desk: under the Balances/Days taken row);
  Days taken view: no line; search with no match ("No one by that name…"): RECORD; search that hides every row but one.
- member (us/us) unlocked: line above rows (his row has boxes) and under the LVE box in HIS window, not in another man's;
  locked: no line on the page, none in his window.
- admin opening any man's window from the grid, Balances, Approvals: line under the LVE box; never a "from official
  leave app on…" line (D2812).
- phone Balances: line between the bar and the column headings; scroll and pinch — the headings still sit as D1504/D1519
  require (nothing showing through between the line and the headings), the line never scaled by the pinch (D2007).
DISPROOF: line twice, missing where a box is drawn, present where none is, or rows showing through around it.

### SC15 — The drawing check against q16-final-* and q11-* — desktop and phone
ACTION: run the drawing check (D1494) on the person window (desktop, phone) and the Balances page (desktop, phone),
using a man with EVERY kind typed for q16 (the q16 drawings show "0" in CCL…CL boxes, drawn before "Not typed"), and a
never-typed man for q11.
EXPECTED: line position, size (13px page / 11px window), grey, margins as drawn; label "Official bal".
NOTE: on the demo page almost every row now shows FIVE empty amber dashed boxes in CCL/FCL/PL/EL/CL (the demo types those
only for Ranger) — a large change of the page's look the q16 desk drawing does not show. Picture it for him (it is his
ruling, but he has not seen the page that way).

### SC16 — "Official bal" everywhere — desktop and phone
ACTION: read the Balances heading (desktop "OFFICIAL BAL", phone "OFFICIAL / BAL" two lines), the window's tile label,
every box's screen-reader name, the grey "Blocked:" toast when a box leaves the screen with a locked save ("Blocked:
<cs> LVE Official bal. Locked by admin."), Help pages, the Legend.
EXPECTED (D2810): no "App bal" anywhere on screen. DISPROOF: any.

### SC17 — The deliberately unchanged readers, pictured for him — desktop and phone
For a never-typed man with one leave: grid figure beside the name, My leave (sign in as him), Approvals LVE BAL, leave
buttons' "left". RECORD exactly (expect 0 / −1). D2746's own words name the grid ("and beside his name on the grid"), so
this is the one part of a ruling left unbuilt — say so to him with the picture, as filed.

### SC18 — A man moved between squadrons inside the app keeps every leave counted — desktop
SETUP (multi-squadron): a man moved 142 → 149 with no post-in date in 149's war (from null) and leave in 142 earlier.
EXPECTED: nothing dropped by this build (no post-in date) — RECORD his figure in 149 before and after the build's
change (should be identical). DISPROOF: a figure change.

### SC19 — A SANS posting and back (low) — desktop
SETUP: post out as SANS from 1 Feb 27 (still flies with us, D283), leave 10 Feb approved, then posted in again 1 Apr.
EXPECTED: RECORD. The build drops 10 Feb once he is posted back in (gap before current). Was that his leave here (still
flying with us), not an outside squadron's? Question for the host.

## 2. Places I believe the build is already wrong

### S1 — A man with no row on the war is counted without his post-in date (real; new data hits it)
File: `raptor-port/src/leavewar/state/store.ts:5532–5535` (`peopleCountedFor`), read by
`raptor-port/src/leavewar/engine/leaveyear.ts:316` (`beforePostIn`).
`peopleCountedFor` appends `HIDDEN_IDENTITY(pid)` raw. That is `sync.ts hiddenIdentity` → `projectPeople(true)`, whose
people all carry `from: null, to: null` (`state/raptorRoster.ts`) — the stored posting (`state.postOuts`) is never laid
on. `beforePostIn` returns "nothing before post-in" for `from === null`. So for a SANS man while "+ SANS" is off (no row),
every leave before his post-in date comes off again. Approvals lists such a man's bids (approvals.ts comment: "not on the
war at all while SANS is off it") and reads `leaveFiguresOf`, so LVE BAL differs with the switch; My leave the same.
Failure: SC1 — 23 with SANS on, 22 with SANS off.
Fix: (1) red first in a store test: a SANS-ticked man with a stored post-in 7 Dec, SANS off, LL 2 Dec, 24 typed → War
bal 24. (2) In `peopleCountedFor`: `return hidden ? [...state.people, withStored(hidden)] : state.people` (`withStored`,
store.ts:2172, lays `state.postOuts[id]` through `windowFor(w, false)` — the same picture Archive/Restore already use).
A foreign squadron's man has no record in this war's `postOuts`, so `withStored` leaves him as he is. (3) The cache:
`figKey` holds `state.people` but not `state.postOuts`; add `state.postOuts` to `figKey` so a posting record that changes
without a people change still re-counts. (4) Re-walk SC1 both ways.

### S2 — "taken" on the LVE tile and the Days taken view now count different things (likely; his call which is right)
File: `leaveyear.ts:368` (tile uses the dropped `nowCh`) vs `leaveyear.ts:398–402` (`daysTaken` uses undropped charges).
Failure: SC2 — tile "3 taken", Days taken LL 5, for the same leave. The plan said Days taken "leaves it out too (to
confirm at the build)"; the build left Days taken as it was (filed in engine-rules.md) but changed the tile without a
ruling. Fix: put the one question to him with both pictures; then make both read the same set (either drop
`beforePostIn` dates in `daysTaken` and `annualUsedIn` too, or compute the tile's `lveTaken` from the undropped approved
charges). Do not leave them disagreeing.

### S3 — Stints: the build's reading differs from the reading recorded in D2747's row, and an older trip is not covered
File: `leaveyear.ts:316–319`. The row's reading: "before the start of his current stint … counts only from the latest
post-in". The build: drops only days before his FIRST stint and the gap right before the CURRENT one; an earlier stint's
days and a gap between two earlier stints still come off. Failures: SC5 (18, the reading gives 20) and SC6 (19, "days
away do not come off" gives 20). The build's choice is arguably better for a figure typed during an earlier stint, but it
is an agent's reading that contradicts the recorded one and was not put to him. Fix: put it to him (one question, a
worked example); if he keeps "days away never come off", change the test to `!inSquadron(p, d) && d < p.from` style
(every day outside every stint before the current stint's start), red first with SC6.

### S4 — New words on screen, not drawn or word-checked: "Type the Official bal first"
File: `raptor-port/src/leavewar/ui/balancefigs.ts:12,27`. A refusal shown under the carried box of a never-typed man.
D1625 (anything new a person sees is drawn first) and D2441 (app words: Opus drafts, a fresh Fable reviews) — neither
happened (the phrase is in no drawing or spec, only in ui-contracts.md written with the build). Failure: SC8(a).
Fix: draw it (or choose a design with no refusal — e.g. the carried box not editable until Official bal is typed), Fable
reviews the words, put to him; until then record it in the evidence sheet as a departure named to him.

## 3. Explicit negatives — checked, found nothing
- The engine's drop applies to approved, pending, the bid windows' what-if and the snapshot alike — I checked
  `personFigures`; the "no pending" shortcut reuses the dropped set. Nothing found.
- Both below-zero doors (BidPicker one-day, SelectSheet drag, several people) go through `goesBelow`; `notTyped` reaches
  both through `balanceAfterFill`. Nothing found; walk SC7 to prove it.
- History line of a first figure: `changelines.ts balanceLines` writes "→ n" with no "from" when the note has none.
  Nothing found.
- "App bal" left on screen: grep of `src` finds it only in comments. Nothing found (Help pages and the Legend not read —
  SC16 checks them).
- FigBox empty box: `held0` NaN makes any typed figure (0 included) save; an empty Enter and Escape save nothing. Nothing
  found in reading.
- The figures cache: moving a post-in date writes `state.people`, which is in the cache key, so figures re-count;
  except the hidden-man path (S1).
- Posting out: days after `p.to` are untouched (D1541) — `beforePostIn` never looks past the current stint's start.
  Nothing found.
- A man "here always" (`from: null`) and a multi-squadron move: nothing dropped. Nothing found.
- The Balances page line hides in Days taken and when no row has a box; the window's line only where `boxes`. Nothing
  found in reading.

Totals: 19 scenarios; 4 suspected faults (S1 a code fault, S2 and S3 inconsistencies/readings to put to him, S4 a
process fault — new undrawn words).
