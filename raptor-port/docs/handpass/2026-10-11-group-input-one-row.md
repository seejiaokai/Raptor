# `[GROUP-INPUT-ONE-ROW]` — the job's bug check (11 Oct 26)

**What is checked:** the whole job on `claude/group-input-one-row` — the six steps of the plan
(`docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md`, version 3) and D747 (the board row's coloured line).
One check for the lot (D485). Builder and host: Opus 5.5. The register: `docs/superpowers/specs/2026-10-11-group-input-one-row-behaviour-register.md`
(GI1–GI21). Pictures: `docs/img/handpass/2026-10-11-group-input-one-row/` (the walkers' in `w1/`, `w2/`, `w3/`); the
built screens beside the approved pictures (D743, D624) were pictured at step 4: `docs/handpass/img/2026-10-11-group-input-one-row/`.

**STATUS — read this first:** §§1–7 (the tier, the rulings, the roll-call, the door check, the sizing, the scenarios)
were written by the host before any walker started. **§8 onward says how far the check has got.** Two parts are OWED
and NOT substituted: Astra's scenario design and the two independent code reads (Astra, Sol 6.1) wait for his ChatGPT
allowance (D746 — asked of it on 11 Oct 26: "usage limit … try again at Oct 14th, 2026 3:59 PM"). Nothing merges
before them. **CHANGED THE SAME DAY BY HIS WORD (D749 — "Fable now and u can try sol 6.1 right now see if it works"):
Fable reads the code as an independent reader, once the walk's fixes are in; Sol 6.1 was tried at once and did not
answer (the same limit, until 14 Oct). So the job has ONE independent reader for now — whether it merges on Fable
alone or waits for a ChatGPT reader is his to say, with Fable's report in front of him.**

## 1. The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | OIL, pay, how many count as present | **YES** — a man added from the schedule is given (or asked for) an OIL answer (D738, D744); hours typed on a row re-price a Yes (D739 (4)); a placeholder's crowd leaves with its man (D745). |
| 2 | The published record | **YES** — what a published day counts as waiting, the amendment's own item count, "Discard N edits", the added man's mark (D736, D93). What goes out is meant to be untouched: to prove. |
| 3 | Saved data | **YES** — a row carries a new saved mark (`srcg`); a typed box now saves the request, not the row. |
| 4 | A shared drawer | **YES** — the ground row is drawn by the week, the board, the peek and an issued face; Personal Inputs by two. |
| 5 | A new gesture or mode | **YES** — a puck dropped on the row adds a man to the input; taken off, takes him out; no new button. |
| 6 | A new surface | NO — no new screen or window; the dialog opened from the schedule shows the people picker it already had elsewhere. |
| 7 | Roles | NO new rule (`state/perms.ts` untouched — `perms.test.ts`, `perms-scan.test.ts` ran green in the unit suite); a member's face is walked because the drawing changed (W3). No §11 row touched. |
| 8 | The warning list | NO — warnings still read one man's row; a flagged man on the one row is walked (D605). |

**Tier: FULL.**

## 2. The rulings that apply (the rules sweep), and clashes

D661, D662, D734–D748 (their full rows in `.claude/decisions-full/scheduler.md`); bounded by D109, D113, D114, D98,
D103, D45, D174, D176, D178 (the count), D663 (the changes window's one item), D660, D682, D711, D731 (4) (a shared
input's OIL), D18, D46, D470, D468, D271, D278 (a request's row), D605, D715–D717, D450, D56, D200, D473, D29, D487,
D93, D726. **Clashes found while building, each settled by the later ruling and said in the record:** the 28 Aug 26
"a changed OIL amount is asked again" and the 22 Sep 26 "the question follows an in-place edit" are narrowed to the
input's own window by D739 (4) (`engine-rules.md`; `oilconfirm.test.tsx` rewritten at step 1); `[CAL-TOGO-ONE-ITEM]`'s
"the count stays per man by his ruling (D663 reading 3)" is replaced by D736. **A reading that changed:** R8 (the
register's foot).

## 3. The roll-call — every place the app draws, writes or counts the one row

Columns: **draws ONE row** · **a hand works there** (the door) · **what else is painted on it**. A cell names the
scenario that marks it (`W1-3` = walker 1, scenario 3); "MUST NOT, because…" is a mark too. Marks are filled in §8.

| # | Place | Draws one row | A hand works there | What else is painted |
|---|---|---|---|---|
| 1 | Edit Schedule week — Ground Programme row | W1-1 | drop W1-2, drag off W1-4, right-click W1-5, typed boxes W1-9, tap-arm W2-3 | LATE tag, kind under a title, a flagged man's ring (W1-13), the hollow ALn tag (W3-5) |
| 2 | Scheduler Board — Ground Programme row | W1-1 | drop W1-3, buttons W1-10, grip W1-11, typed boxes W1-9 | the coloured line (D747 — W2-9), the amber late edge, OIL bars |
| 3 | Scheduler Board in OIL Earn | W3-11 | MUST NOT take a drop (the mode is read-only — `drag.ts` refuses) — W3-11 tries one | each puck's own switch; the row's name is no switch |
| 4 | View-only Sched (an issued face, ORIG and AL) | W3-8 | MUST NOT — read only | LATE tag from the frozen copy |
| 5 | The 👁 look at an older version | W3-9 | MUST NOT — read only | — |
| 6 | The next-week peek | W1-14 | MUST NOT — a peek has no controls | — |
| 7 | Personal Inputs line — week | W1-1 | typed boxes W1-9b; Undo / Accept W2-6; the type opens the window W2-5 | LATE tag; folded count "1 input" |
| 8 | Personal Inputs line — board | W1-1 | Undo / Accept W2-6; LATE chip W2-7; typed boxes W2-8 | LATE chip |
| 9 | The Unavailable list (week and board) | MUST NOT — a row a man (D737): W1-12 | a typed box changes one man (R7) W1-12; a puck dropped on a seat reassigns as before | — |
| 10 | The window opened from the row / the line | W2-5 (everyone lit — D748) | Save for everyone, Delete for all W2-5 | the OIL lines; no date calendar |
| 11 | The OIL question for one man (D744) | W2-10 | answered → him alone; closed → unanswered | headed with his callsign alone |
| 12 | The Inputs calendar bar, the opened day's card, the List | W1-2 (agrees after every hand) | (their own doors, unchanged) | — |
| 13 | The day head's "N pending" (week) and the board's head | W3-1…7 | — | the "Not yet signed" marker |
| 14 | The Amendments box | W3-1, W3-4 | — | the kinds split |
| 15 | The changes window — title, "To go out" (the one line, the names), "All changes", "New to you", the week view | W3-2, W3-3 | a tap goes to the one row W3-2 | `.pl-names`; "N people" titles |
| 16 | The sign-off line and "Publish ALn" | W3-4 | publish W3-4 | — |
| 17 | "Discard N edits & load" | W3-6 | load W3-6 | — |
| 18 | The published amendment's line (the Amendments box's issued list) | W3-4 | — | — |
| 19 | History's gold dots, a warning's click, a tap on a change → the lead | W3-2 (tap), W1-13 (warning click) | — | the landing flash |
| 20 | A saved plan switched in; a day template saved and applied | NOT WALKED — carried by `state/grouprow-entry.test.ts` (a template takes one row) and the unchanged plan-switch path; see §9 | — | — |
| 21 | The CSV export, the print | MUST NOT change — they list no ground rows (both plan readers); not walked | — | — |
| 22 | The warnings list | MUST NOT change — it reads one man's row; W1-13 sees a flagged man on the one row | — | — |
| 23 | The Leave War, each man's OIL credit after a publish | the credit: W3-12 reads the OIL tracker for one added man (Yes copied) | — | — |

## 4. The door check — for every act the data allows, the control that does it

| Act | Its door on screen | Marked by |
|---|---|---|
| Add a man to a shared input from the schedule | drag a name (crew list) or a seated puck onto any puck of the row, its "+ add", or the row; or arm a place on the row and tap a name | W1-2, W1-3, W2-3 |
| Take a man out | drag his puck off to nowhere; right-click his puck (desktop) | W1-4, W1-5; **phone: is there a door? — W2-4 must find one or report MISSING** |
| Move a man out of the input onto another place | drag his puck onto a seat / another row | W1-6, W1-7 |
| Take the LAST man off | none by a puck (refused, saying how); ✕ on the row or Delete in its window | W1-8 |
| Put ALL AVAIL on the row / take it off | drag it on (lands on "+ add"); drag it off | W1-15 |
| Change the time, the remark, the name for everyone | type in the row's boxes (week, board), the line's boxes | W1-9 |
| Take the whole input off the programme / put it back | ✕ on the board row; Undo / Accept on the Personal Inputs line | W1-10, W2-6 |
| CX, red box, information-only for the row | the board row's buttons | W1-10 |
| Move the row | its grip (board) | W1-11 |
| Hide / show the LATE mark | the chip on the board's Personal Inputs line | W2-7 |
| Open the input for everyone | tap the type on the Personal Inputs line / the row's name on the board | W2-5 |
| Answer the OIL question for the man added | the sheet that opens by itself | W2-10 |
| Undo / Redo each of the above | the top bar's pair | every scenario's last step |

## 5. The sizing step (D607, D608) — written before any walker started

1. **Type of change:** C (a new gesture on an existing row — the drop, the drag-off, the right-click), D (the one row
   drawn by four builders and counted by one list read on seven surfaces), G (the published day's count, undo, a
   reload, a new saved mark), A (the fold is one calculation), E (D747).
2. **What only a walk could find here:** a real drag, a real right-click and a tap-arm on the built bundle (the unit
   tests call the door with a stand-in element); the phone, where a drag is a held finger and a right-click does not
   exist; the drop landing flash on a row that re-draws; the count as each of the seven surfaces prints it; the one
   line's names in the real window; the OIL sheet opening over the schedule; the line's place (D747) on a real phone
   layout. What tests already carry: the fold's arithmetic (23 cases), the door's rules (37), the dialog (GI14).
3. **What the ledger says:** walks of types C and D have found the most (the OIL build: four unwired surfaces; the
   amendment batch: 358 checks, faults in the count's readers); type A walks the least (`[OIL-WORK-START]`: five
   walkers, none). The D114 walk (one host script, 10 steps, 13 surfaces) is the nearest in shape to §W3.
4. **The walk chosen:** THREE Sonnet 5.5 walkers in parallel (D588), each its own browser world on the one served
   build (`?fresh=1`), 15 + 10 + 12 scenarios: **W1** the hands, desktop 1440×900 (week and board); **W2** the phone
   390×844 by touch, plus the window, the OIL question, the LATE chip and D747; **W3** the published day at both
   sizes. Each in its own browser context (its own stored world), so a reload is part of every scenario. No size beyond the two (no viewport-tall column was added). **Carried by a test, not walked:** the
   fold's repeated counts on a Saturday beside a one-man row (`state/grouprow-count.test.ts` — through the app's own
   doors, the OIL side switched on by hooks: proves the NUMBER; W3 proves each surface prints it, on a weekday and
   once on the Saturday); a template taking one row (`state/grouprow-entry.test.ts` — calls the template maker
   directly: proves the data, NOT a button; the template's own doors are unchanged and were walked at their own
   job); the belt (GI15 — calls the engine directly; it has no door by design).
5. **Its row** is added to `docs/walk-ledger.md` when the walk closes.

## 6. The fixture — built through the app's own controls

`scripts/handpass/gi-lib.mjs` (`fileInput`, `press`, `csId`) drives the real "+ Input" window. Each walker opens
`http://localhost:4180/` in its OWN browser context — NOT `?fresh=1`: a context's own storage is its own world, and it
must survive the reload every scenario ends with — signs in as `ad` / `a` (Saber, an admin), and files (a filing is
the write the order's §7.7 asks for before any reload or second sign-in):
- **G4** — a Meeting titled "Range safety brief" for Drifter, Hunter, Ranger, Tally on Wed 15 Jul 2026, 14:00–15:00;
- **S1** — a one-man Training for Anvil the same day 10:00–11:00 (the control beside it);
- **SAT** (W2-10, W3-11, W3-12) — a Duty titled "Range duty" for Drifter and Ranger on Sat 18 Jul, 09:00–12:00, the
  OIL question answered Yes at the save. (Ranger is the member account `us` / `us`: his own answer is the one door
  that makes a shared input's answers differ.)
The seed Monday (13 Jul) already carries rows from inputs, one of them late (D747's picture). A page's clock: the
PC's own for LATE checks unless a scenario says a date (`open(…, { clock })`).

## 7. The scenarios — each with what MUST be seen (PASS / FAIL, never "recorded")

Every scenario ends: press Undo once and say what came back; press Redo; reload the page and say whether it is still
so. A picture for every numbered step that says "picture". Any browser error is a finding.

**W1 — the hands, desktop 1440×900**
1. After filing G4: the week's Ground Programme (Wed) draws ONE row "RANGE SAFETY BRIEF" 14:00 / 15:00 with four pucks A to Z (Drifter, Hunter, Ranger, Tally); the board the same; Personal Inputs (opened) one line with four pucks, folded "1 input · 1 on programme". Picture each. EXPECT: one row, one line, never four.
2. Week: drag "Anvil" from the crew list onto Hunter's puck. EXPECT: five pucks on the row, Anvil among them A to Z; Hunter still there; a note "Anvil added to Range safety brief"; the Inputs calendar's bar for 15 Jul says 5 people; ONE Undo takes Anvil out everywhere. Picture.
3. Board: drag "Blade" from the crew list onto the row's "+ add". EXPECT: as 2. Then drag Blade again onto the row: refused, "Blade is already on this input", nothing changes.
4. Week: drag Tally's puck off the row and let go on empty page. EXPECT: Tally gone from the row, the line, and the Inputs calendar; note "Tally taken out of Range safety brief"; one Undo brings him back.
5. Week: right-click Ranger's puck. EXPECT: as 4, for Ranger.
6. Week: drag Hunter's puck from the row onto a flying seat of Wednesday's first wave that holds another man. EXPECT: Hunter in that seat, OUT of the input; the man who sat there is NOT on the row and not in the input; the landing flash is on the seat; ONE Undo puts Hunter back in the input and the seat's own man back.
7. Board: drag Drifter's puck from the row onto S1's row ("+ add" of Anvil's Training, which stands ABOVE it at 10:00) and, separately, onto a ground row BELOW it. EXPECT: Drifter under that row as an extra, out of the input; the flash on the row he landed on, not the one beside it; one Undo.
8. Take men off until one is left, then try the last by drag and by right-click. EXPECT: refused each time — "<name> is the last person on this input — use ✕ to take it off the programme, or delete it in its own window"; his puck stays.
9. Week, then board: on the one row type 14:30 over the start, then a remark "Bring ID", then the name "Range brief". EXPECT after each: the row shows it; every record of the input shows it (open the Inputs calendar's day card: one card, the new time / remark / title, all people); still ONE row; one Undo each. (9b) the same three in the boxes of the Personal Inputs line.
10. Board row buttons, each then Undo: ✕ (EXPECT: the row gone; the Personal Inputs line reads taken off with "Accept"; note names "4 people"); CX with a reason (EXPECT: one question; the row cancelled as ONE row, all pucks dimmed); red box; ⓘ. EXPECT each: still ONE row.
11. Board: drag the row by its grip above S1's row, then below a later row. EXPECT: all its pucks travel as one row; nothing left behind; Auto sort puts it back by time as one row.
12. File an overseas duty (OD) for Drifter and Hunter on Thu 16 Jul. EXPECT: the Unavailable list shows TWO rows, one a man (not one row); type a remark on Drifter's row: only Drifter's changes.
13. Give Tally a leave (LL) on 15 Jul while he is in G4. EXPECT: Tally's puck on the one row wears the flag ring; the warning list names him; clicking the warning lights the one row. Picture.
14. Load the week before (6 Jul) so 13–19 Jul shows as next week's peek. EXPECT: the peek draws ONE row for G4.
15. Drag "ALL AVAIL" onto Hunter's puck. EXPECT: it lands at the row's end (an extra), Hunter untouched, nobody added to the input. Then take Hunter off: EXPECT a note "ALL AVAIL came off Range safety brief with Hunter — drop it on the row again if it still applies"; the puck gone; Undo brings both back.

**W2 — the phone, 390×844, touch**
1. After filing G4: week and board, the one row with four pucks stacked; the two times together at the row's top. Picture both.
2. Board: hold-drag "Anvil" from the crew drawer onto the row. EXPECT: added (as W1-2). Picture.
3. Week: tap the row's "+ add" (it arms), then tap "Blade" in the crew drawer. EXPECT: Blade added to the INPUT; the armed ring gone; one Undo.
4. **The door for taking a man out on a phone:** find how a finger takes Tally out (drag his puck off the row to empty space). EXPECT: he leaves the input. If no gesture does it, say MISSING and what you tried.
5. Board → Personal Inputs: tap the line's type ("Range safety brief"). EXPECT: the window is headed "<first> +3", shows the people picker with all four lit (NOT a one-name list), a line "The dates are changed on the Inputs page"; change the remark, Save → all four records changed, still one row. Open again, Delete → asks "Delete this input for all 4 people?" → Keep. Picture the window.
6. Personal Inputs line (board): press Undo. EXPECT: the Ground row gone, the line says taken off, note "4 people's Range safety brief taken off the programme". Press Accept: the one row is back with four pucks.
7. Set the page's clock to 14 Jul 2026 before filing a second group (late): its line shows ONE LATE chip; tap it → hidden on the line AND the Ground row's amber edge gone; tap again → back.
8. Type 15:30 in the line's END box on the board. EXPECT: every record ends 15:30; one row.
9. D747 — board, Mon 13 Jul, Ground Programme: picture it. EXPECT: the blue and amber lines stand LEFT of the pucks and the CX buttons, touching none. Also the Wednesday's one row.
10. SAT, answers all Yes (as filed): on the board for Sat 18 Jul drag "Hunter" onto the SAT row. EXPECT: NO question opens; Hunter is in the input and his record carries the Yes (the Inputs page's window on the input says "credited", nobody unanswered). Then make the answers DIFFER through the app's own door: sign out, sign in as `us` / `us` (Ranger), open the input on the Inputs page, press "Change…" beside "Your OIL", answer No; sign out, sign in as `ad` / `a`. Drag "Tally" onto the SAT row. EXPECT: the OIL question opens AT ONCE over the schedule, headed "Tally" alone (never "Drifter +3"); answer Yes → only Tally gains an answer (Ranger still No, Drifter and Hunter still Yes); the window behind closes with it. Drag "Anvil" on and CLOSE the question without answering: Anvil is in the input, unanswered. Picture the question.

**W3 — the published day, desktop 1440×900 then the phone for steps 1–3**
Fixture: file G4 and S1, sign and publish Wed 15 Jul through the app's own sign-off line (`scripts/handpass/lib.mjs publish` shows how). After each act read ALL of: the day head's count, the board head's count, the Amendments box, the changes window's title and its "To go out" tab's head.
1. Clean: 0 everywhere. Type 14:30 on the one row. EXPECT: 1 everywhere; View-only Sched still shows 14:00.
2. Open the changes window → To go out. EXPECT: ONE line "Range safety brief · 4 people", the four names under it A to Z, "14:00–15:00 → 14:30–15:00"; tap it → the schedule goes to the one row. "All changes" shows one item for the input. Picture.
3. Undo the re-time (0). Take Tally off (EXPECT 1; the line "Tally · Range safety brief … taken out"), then Hunter too (EXPECT 2). Undo both.
4. Add Anvil (EXPECT 1; Anvil's puck wears a hollow AL1 tag, nobody else's). Sign and publish AL1. EXPECT: the Amendments box's AL1 line reads 1 change; the count is 0; View-only Sched shows five pucks.
5. Re-time then add Blade, and in a fresh world add then re-time. EXPECT: 2 both times; Blade's tag stays.
6. ✕ the whole row on the board (EXPECT 1 everywhere). Open the version's 👁 look and read "Discard N edits & load": EXPECT "1". After a re-time only: EXPECT waiting 1, discard 0 (the button says the day is already at its version, or offers no discard).
7. CX the row (EXPECT 1). Delete the whole input in its window (EXPECT 1). Publish a fresh day FIRST and then file G4 (EXPECT 1; the row wears one "added" mark on its name, no tag per puck).
8. View-only Sched, as the member `us` / `us`: the issued face draws ONE row; no controls. Picture.
9. The 👁 look at ORIG after AL1 went out: ONE row as it went out.
10. ALL AVAIL: put ALL AVAIL on the row (drop on Hunter's puck), publish, then take Hunter off. EXPECT: 1 everywhere; the To go out line names Hunter and "ALL AVAIL came off with him".
11. SAT in OIL Earn (board, Sat 18 Jul → OIL Earn): the SAT row is ONE row; each puck has its own switch; switch Drifter off → only Drifter's bar goes; try to drag a name onto the row inside the mode → refused. Picture. Switch him back on.
12. SAT, out of the mode: add Hunter by a drop (no question; everyone Yes), sign and publish Saturday; open the Leave War's OIL tracker. EXPECT: Hunter has an HO on 18 Jul as Drifter and Ranger have.

## 8. Results — filled by the walk

*(not started when this was written — see §12)*

## 9. Carried by a test, not walked — the test and exactly what it proves

| Case | Test | Proves | Through real controls? |
|---|---|---|---|
| The count for each act on a day that EARNS, four people beside one | `state/grouprow-count.test.ts` ("on a day that EARNS…") | the number is the same for one man and four | the app's own save / board button handlers on a real store; the OIL side switched on by three hooks, not by the Leave War |
| A day template saved from a one row has one row | `state/grouprow-entry.test.ts` | the template's data | calls the template maker directly — NOT a button |
| The belt | `ui/grouprow-hands.test.tsx` ("THE BELT…") | a raw write is refused | calls the engine directly; no door exists by design |
| A member cannot change a shared input through a typed cell | `leavewar/groupwrite.test.ts` | the save is refused whole | calls the cell's own writer; a member's screen draws no such box (W3-8 sees none) |
| The dialog's Save / Delete / OIL lines for the entry | `ui/groupeditor.test.tsx`, `ui/batch2.test.tsx` | the rendered window's own buttons, pressed | yes (rendered component, real clicks) — W2-5 repeats it on the built bundle |

## 10. Not walked, and why

- A saved plan switched in, a day template applied (row 20) — unchanged doors; §9.
- The CSV export and the print — they list no ground rows.
- His PC's 125% display and his iPhone (WebKit): a held-finger drag on iOS Safari can deliver the lift to the element
  it started on even after a redraw (order §7.9) — the row re-draws when a man is added. **On his look card.**
- The Tracker, the Leave War grid — not touched.

## 11. The gates

**One run of the whole set, watched, under the PC lock with nothing else running — 11 Oct 26, on `f07ce883`'s code
(`e24ac6a1` plus documents): unit 10082 / 10082 (589 files) · build clean · tfin 728 / 0 · e2e 766 passed, 1 failed,
57 skipped · smoke 445 / 0 · rulecheck OK · docsize OK.** The one browser failure is the Leave War phone test "Undo
and Redo leave the grid where it is when the changed day is on screen" — the known unsteady one (the gate baseline of
10 Oct 26 met it the same way; this job touches nothing of the Leave War): run again by itself, three times over,
3 of 3 passed. A test to make wait on what it needs (D87) — filed long since; not this job's.
`perms.test.ts` and `perms-scan.test.ts` are in the unit count (no permission rule moved). NOT run: `npm run
probes:adapted`, `npm run perf` — owed before the pull request (the row drawing and a stylesheet changed).

## 12. Where the check stands

**AN UNATTENDED RUN FROM HERE (his word, 11 Oct 26, late: "I actually want to sleep now … So that u can work overnight" —
D596, D667):** no question stops it; a choice that is his is parked under "Questions waiting for him" in §13; the chat
compacts by itself if it fills; nothing merges, nothing touches `main`; one notification at the end.
**W2 (the phone) reported: 9 PASS, 1 FAIL, no browser errors** (`docs/handpass/parts/gi-w2.md`). Its two finds, as the
host has them so far: (a) the schedule's window on a shared input, on a phone — "Delete this input for all 4 people?"
opened with only Delete in sight and Keep below the edge (picture `w2/s5-delete-confirm.png`, opened by the host): THIS
job's (the window carries the people picker since D748) — a fix and a phone browser test are written
(`ui/inputedit.tsx` `delAsk`; `e2e/grouprow.spec.ts`), NOT yet built or seen red-then-green: no rebuild while W1 and W3
walk; (b) on the WEEK on a phone a tap on a row's "+ add" arms nothing when the row's first place is filled — the same
on a one-man row, the board's tap works: older than this job by the walker's control; to file, not reproduced on
`main` by the host. W1 and W3 were still walking.

**11 Oct 26, when the walkers were started:** §§1–7 written; the gates run (§11); the PC lock taken for the walk; the
build served on 4180 is `f07ce883`'s (nobody rebuilds it while they walk); three Sonnet 5.5 walkers started, each
writing `docs/handpass/parts/gi-w1.md` / `gi-w2.md` / `gi-w3.md` and its pictures. **Next:** the host opens the
pictures behind every FAIL and every high-consequence PASS (OIL, the published day, the member's face), reproduces
each finding, fixes with a failing test first, re-walks what the fixes touch, fills §3's marks and §8, adds the
ledger's row, writes §13. **Owed after that:** Astra's scenario design and the two code reads (D746).

## 13. His look card

*(written when the walk closes)*
