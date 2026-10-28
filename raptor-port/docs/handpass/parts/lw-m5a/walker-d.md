# M5a walk — walker D: the figures over time, and the orders (29 Oct 26, the night)

Frozen build of commit 92b43acf9 on 4173; Sonnet walker; desktop 1536 × 860 at 1.25 (every money step), phone 402 × 874
(the member's lock steps), Chromium. Scripts `raptor-port/scripts/handpass/lw-m5a-walk-d-*.mjs` (lib `-lib.mjs`; the
table builder `-report.mjs`; `-x*.mjs` are explorations); pictures `raptor-port/docs/img/handpass/2026-10-28-lw-m5a/d/`
(`d*.json` the raw results). Every world was a fresh saved world on real storage, signed in as Saber (ad/a) or Ranger
(us/us); the war's today was pinned with the bridge's `lwSetMemberToday` (20 Dec 2026, 28 Oct 2026, 5 Nov 2026, 25 Jan
2026) except the midnight run, which used a Playwright fake clock and no bridge at all. **Stand-ins named:** the admin's
lock under the member's open box is `lockViaBridge` (the stand-in for the other person; it writes Ranger, not Saber, in the
history and as a step on Ranger's Undo list). Nothing else was injected: every figure was set up by typing in a box, placing
and approving leave on the grid, filing on the Inputs page, adding a holiday on the Event row or creating a period.

Opened and relied on: d1-row2-bal-win, d4-after-midnight, d3-row10-bal-win, d7b-2-ask, d6-phone-05-lock-landed,
d6-phone-06-undo-refused, d7a-9-kind-changed, d8-after-create, x2-2026-02-04-pm, d2-before-delete. The rest of the table was
read off the screen by the script from what is drawn (the boxes' values, the figures' drawn text, the Approvals lines'
text, the window's tiles and lines) and judged against the spec's expected figure printed beside each row.

## The money table of the spec (§1.5) as walked on screen

Person used in brackets; "Surfaces" = Balances row, the person window's tile, the grid's figure beside the name (and
Approvals where a line exists). All surfaces agreed in every row below.

| Row | Set-up through the app | Expected | Seen on screen (all surfaces) | Verdict |
|---|---|---|---|---|
| 1 (Ranger, seed, 25 Jan 26) | seed: typed 17 incl 4 on 5 Jan; LL 26–27 Jan approved after; 2.5 pending | App 15 incl 2, Pending −2.5, War 12.5 | row 15 / 2 / −2.5 / 12.5; tile 15 / −2.5 / 12.5; grid 12.5; Approvals LVE BAL 12.5; My leave (Ranger) "LVE 12.5 · 5 pending" (days) | PASS |
| 2 (Ranger) | both LL pending lines approved | App 12.5, Pending gone, War 12.5 | row 12.5 / incl 0 / – / 12.5; tile Pending "0", War 12.5; grid 12.5; My leave "LVE 12.5 · 2.5 pending" | PASS (see the "0" vs "–" note) |
| 6 (Saint, Junior pilot +33, 20 Dec 26) | typed 23 incl 3; LL Thu 31 Dec – Mon 4 Jan filed on the Inputs page (the grid's range cannot cross the year — see note); 1 Jan made a PH | 20 Dec 21 incl 2 | 21 incl 2 (row, tile, grid) | PASS |
| 6, clock 31 Dec | clock moved | 21 incl 2 | 21 incl 2 | PASS |
| 6, clock 1 Jan 27 | clock moved | 52 incl 19 | 52 incl 19 | PASS |
| 6, clock 4 Jan 27 | clock moved | 52 incl 19 | 52 incl 19 | PASS |
| 8 (Diesel, 20 Dec) | typed 10 incl 4; LL Tue 29 – Wed 30 Dec pending | App 10, Pending −2, War 8 | 10 incl 4 / −2 / 8; Approvals "2 days", LVE BAL 8; grid 8 | PASS |
| 8, clock 31 Dec | clock moved | same | 10 / −2 / 8 | PASS |
| 8, clock 1 Jan and 4 Jan 27 | clock moved | App 39, Pending —, War 39 | 39 incl 6 / – / 39 (both days) | PASS |
| 10 (Nomad, Feb 27) | typed 30; LL 1–12 Feb approved, LL Sat 13 – Sun 21 Feb pending | App 20, Pending −11, War 9; Approvals DAYS 5 | 20 / −11 / 9; window "Sat 13 – Sun 21 Feb 5 Pending"; Approvals "5 days", LVE BAL 9; grid 9 | PASS |
| 10, the bid window's LL "left" on Mon 22 Feb | — | War bal − 1 = 8 (designer's reading) | LL button reads 9 (= War bal) | FAIL (reading) |
| D1473 / 4 (Nomad, 28 Oct 26) | typed 20 incl 3; LL Mon 4 – Tue 5 Jan 27 approved now | 18 incl 3; then 1 Jan 27: 48 incl 15 | 18 incl 3; 48 incl 15 | PASS |
| D1474 row 4 (Outlaw, no grade) | typed 37 incl 4; 1 Jan 27 | 33 incl 33 | 33 incl 33 (1 Jan and 4 Jan) | PASS |
| D1474 row 5 (Vapor, Junior pilot) | typed −2 incl 0; 1 Jan 27 | 31 incl 0 | 31 incl 0 | PASS |
| D1489 (Ranger, midnight run) | CCL 3, FCL 5, PL 2, EL 4, CL 1 before | unchanged after 1 Jan | CCL 3 (pend −1 war 2), FCL 5, PL 2 (pend −0.5), EL 4, CL 1 (pend −1) — all kept | PASS |
| Midnight left open (Ranger, Senior +36) | page and docked window left open, fake clock 23:57 → 00:00:36, no touch | 37 incl 4 → 69 incl 33; "taken" 5 → 0; other kinds kept | page and window 69 incl 33; "5 taken" → "0 taken"; other kinds kept; Days taken heading "JAN - DEC 26" | PASS (but see the window's stale list) |
| 11b (Nomad) | typed 20 (Nov 26); LL 31 Dec 27 – 3 Jan 28 on the Inputs page, no 2028 period; the 2028 period created; 3 Jan 28 a PH | 18; unchanged by the period; then 19 | 18; 18; 19 | PASS |
| ★2 the below-zero ask (Saint) | War bal 10; LL Sat 13 – Sun 21 Feb 27 | ask names −1 | "That takes Saint to -1 LVE. Tap the same leave again to go ahead."; placed on the second press → −1 | PASS |

Then, from Ranger's seed state (each moves App bal or Pending by its days and nothing else): approve 12–13 Feb → App 13 incl 0, Pending −0.5, War 12.5 (PASS); refuse it back → 15 incl 2 / −0.5 / 14.5 (PASS); put back to a bid (second tap on the lit Refuse) → 15 incl 2 / −2.5 / 12.5 (PASS); approve the CCL line → CCL tile 3 → 2, LVE unchanged (PASS); move the approved 12–13 Feb onto Sat–Sun → 14.5 incl 1.5 (PASS); delete 19–21 Jan (in the snapshot) → 17.5 incl 4 (PASS — netted against the leave approved after typing, incl. stays at the typed 4); an AM LL → −0.5 (17 incl 4, "0.5" on the line, Days taken "3.5", My leave "LVE 17") (PASS); re-type 20 → 20 incl 4 (PASS); an Inputs-page leave OL 15–16 Jul → 18 incl 2 (PASS); a PH inside a leave in the snapshot → no move, inside one approved after typing → +1 at once (PASS); AM LL + PM CCL on one Wed → LVE −0.5, CCL −0.5 (PASS); Approve all (11 lines) → App bal down by each man's days, War bal unchanged, one Undo ("Undid: a decision on a bid") puts all back, the page's scroll unmoved (PASS); correcting only "incl." → 15 incl 3, history word "LVE carried fwd 2 → 3" and no "15 → 15" line (PASS).

## The whole table (every check, as the scripts recorded it)

**87 PASS, 7 FAIL, 8 NOT WALKED, 1 NOTE** (counted over the table below; each "errors" line is one check).

| Scenario (designer's number or step) | Size | Verdict | What the screen said | Pictures |
|---|---|---|---|---|
| 1-row1 Ranger, seed (D1479 row 1) | desk | PASS | App bal 15; incl. 2; Pending −2.5; War bal 12.5; window App 15; window pend −2.5; window war 12.5; grid figure 12.5; Approvals LVE BAL on the 29 Jan line 12.5 · Approvals LL lines: Ranger IP LL Thu 29 Jan, AM › 0.5 day 12.5 P 27.5 — Approve Refuse / Ranger IP LL Thu 12 – Fri 13 Feb › 2 days 12.5 P 27 — Approve Refuse | d1-row1-bal-win.png, d1-row1-grid.png |
| 3 leave buttons "left" on a free weekday (designer expects 11.5 = War bal − 1; D1144 reading) | desk | **FAIL** | LL left 12.5, CCL left 2 (War bal is 12.5, CCL War bal 2) | d1-row1-bidwin.png |
| 1-row1 My leave (Ranger signed in) | desk | PASS | "MY LEAVE · next 26 Jan LVE 12.5 · OIL 0 · 5 pending ›" |  |
| 2a approve 12–13 Feb (2 days) | desk | PASS | App bal 13; incl. 0; Pending −0.5; War bal 12.5; window war 12.5; grid figure 12.5 | d1-X-approved-bal-win.png, d1-X-approved-grid.png |
| 2b refuse it back (approved → refused) | desk | PASS | App bal 15; incl. 2; Pending −0.5; War bal 14.5 | d1-X-refused-bal-win.png |
| 2c put back to a bid (second tap on the lit Refuse) | desk | PASS | App bal 15; incl. 2; Pending −2.5; War bal 12.5 | d1-X-pending-bal-win.png |
| 1-row2 both approved (D1479 row 2) | desk | PASS | App bal 12.5; incl. 0; Pending –; War bal 12.5; window war 12.5; window pend 0; grid figure 12.5 · window pend "0", taken "3 taken" | d1-row2-bal-win.png, d1-row2-grid.png |
| 1-row2 My leave (Ranger signed in) | desk | PASS | "MY LEAVE · next 26 Jan LVE 12.5 · OIL 0 · 2.5 pending ›" |  |
| 2d approve the CCL line | desk | PASS | CCL tile before 3 pend −1 war 2; CCL tile after 2; LVE unchanged 12.5 | d1-ccl-bal-win.png |
| errors (console, page, 4xx) | desk | PASS | none |  |
| 2-start both LL approved (fixture) | desk | PASS | App bal 12.5; incl. 0; Pending –; War bal 12.5; window App 12.5; window war 12.5; grid figure 12.5 | d2-start-bal-win.png |
| 2e move approved 12–13 Feb onto Sat 14–Sun 15 (days given back; formula: 14.5 incl 1.5) | desk | PASS | App bal 14.5; incl. 1.5; Pending –; War bal 14.5; window App 14.5; window war 14.5; grid figure 14.5 · lines: LL Mon 19 – Wed 21 Jan 3 Approved / LL Mon 26 – Tue 27 Jan 2 Approved / LL Thu 29 Jan, AM 0.5 Approved / LL Mon 2 Feb 1 Refused / LL Sat 14 – Sun 15 Feb 0 Approved / CCL Mon 2 Mar 1 Pending / PL Mon 16 Mar, AM 0.5 Pending / CL Tue 17 Mar 1 Pending | d2-moved-bal-win.png |
| 2f delete the approved 19–21 Jan leave that stood in the snapshot (+3; netted against 26–27 Jan and 29 Jan AM, typed incl. 4 unchanged: 17.5 incl 4) | desk | PASS | App bal 17.5; incl. 4; Pending –; War bal 17.5; window App 17.5; window war 17.5; grid figure 17.5 · taken 0 taken | d2-deleted-bal-win.png |
| 2g a half day (AM LL Mon 9 Feb placed approved): −0.5, shown .5 | desk | PASS | App bal 17; incl. 4; Pending –; War bal 17; window App 17; window war 17; grid figure 17 · half line LL Mon 9 Feb, AM 0.5 Approved | d2-half-bal-win.png, d2-half-grid.png |
| 2h re-type App bal 20 (incl. as shown 4): the count starts afresh | desk | PASS | App bal 20; incl. 4; Pending –; War bal 20; window App 20; window war 20; grid figure 20 | d2-retyped-bal-win.png |
| 2i an Inputs-page leave filed (OL 15–16 Jul, lands approved): −2, carried fwd first (18 incl 2) | desk | PASS | App bal 18; incl. 2; Pending –; War bal 18; window App 18; window war 18; grid figure 18 · lines 2026-01-26 LL Mon 26 – Tue 27 Jan 2 Approved / 2026-01-29 LL Thu 29 Jan, AM 0.5 Approved / 2026-02-02 LL Mon 2 Feb 1 Refused / 2026-02-09 LL Mon 9 Feb, AM 0.5 Approved / 2026-02-14 LL Sat 14 – Sun 15 Feb 0 Approved / 2026-03-02 CCL Mon 2 Mar 1 Pending / 2026-03-16 PL Mon 16 Mar, AM 0.5 Pending / 2026-03-17 CL Tue 17 Mar 1 Pending / 2026-07-15 OL Wed 15 – Thu 16 Jul 2 Approved | d2-inputs-bal-win.png |
| errors (console, page, 4xx) | desk | PASS | none |  |
| row6 route: Pick a range from Thu 31 Dec 26 to Mon 4 Jan 27 in the bid window (Gambit) | desk | NOTE | The bid window's Pick a range could not carry a leave from Thu 31 Dec 26 over into 2027: after both ends were picked the selection read "31 Dec 26" only, and only Thu 31 Dec 26 was placed (Gambit's list: "LL Thu 31 Dec 1 Approved"). The same leave filed on the Inputs page as one input reaches D1473's example (next row). Not counted as a fault of M5a; the host may want to know the grid route stops at the period's end. | d3-range-bruise-2026-12-31.png |
| row6 20 Dec: 23 incl 3, LL Thu 31 Dec – Mon 4 Jan approved after typing (spec 21 incl 2) | desk | PASS | App bal 21; incl. 2; Pending –; War bal 21; window App 21; window war 21; grid figure 21 · lines 2026-12-31 LL Thu 31 Dec – Mon 4 Jan 2 Approved | d3-row6-20dec-bal-win.png, d3-row6-20dec-grid.png |
| row8 20 Dec: 10 incl 4, LL Tue 29 – Wed 30 Dec pending (spec App 10, Pending −2, War 8) | desk | PASS | App bal 10; incl. 4; Pending −2; War bal 8; window App 10; window war 8; grid figure 8 | d3-row8-28dec-bal-win.png, d3-row8-28dec-grid.png |
| row8 Approvals line for Diesel (DAYS 2, LVE BAL 8) | desk | PASS | Diesel D LL Tue 29 – Wed 30 Dec › 2 days 8 P 27 29 Oct 02:16 · by Saber Approve Refuse |  |
| row10 (Feb 2027): LL 1–12 Feb approved (10 charged), LL 13–21 Feb pending; run of 21 charges every day (spec App 20, Pending −11, War 9) | desk | PASS | App bal 20; incl. 0; Pending −11; War bal 9; window App 20; window war 9; grid figure 9 · Approvals: Nomad C LL Sat 13 – Sun 21 Feb › 5 days 9 P 26 29 Oct 02:16 · by Saber Approve Refuse | d3-row10-bal-win.png, d3-row10-grid.png |
| row10 Approvals DAYS for the bid alone (spec: 5) | desk | PASS | Nomad C LL Sat 13 – Sun 21 Feb › 5 days 9 P 26 29 Oct 02:16 · by Saber Approve Refuse |  |
| row10 bid window "left" for LL on Mon 22 Feb (spec: War bal − 1 = 8) | desk | **FAIL** | LL left 9 (War bal 9) | d3-row10-bidwin-22feb.png |
| row6 2026-12-31 (spec 21 incl 2) | desk | PASS | App bal 21; incl. 2; Pending –; War bal 21; window App 21; window war 21; grid figure 21 · window: 1 taken | d3-row6-d31-bal-win.png, d3-row6-d31-grid.png |
| row8 2026-12-31 (spec App 10, Pending −2, War 8) | desk | PASS | App bal 10; incl. 4; Pending −2; War bal 8; window App 10; window war 8; grid figure 8 | d3-row8-d31-bal-win.png |
| row6 2027-01-01 (spec 52 incl 19) | desk | PASS | App bal 52; incl. 19; Pending –; War bal 52; window App 52; window war 52; grid figure 52 · window: 0 taken | d3-row6-j1-bal-win.png, d3-row6-j1-grid.png |
| row8 2027-01-01 (spec App 39, Pending –, War 39) | desk | PASS | App bal 39; incl. 6; Pending –; War bal 39; window App 39; window war 39; grid figure 39 | d3-row8-j1-bal-win.png |
| row4 (no grade, 37 incl 4) 2027-01-01: spec 33 incl 33 | desk | PASS | App bal 33; incl. 33; Pending –; War bal 33; window App 33; window war 33; grid figure 33 | d3-row4-j1-bal-win.png |
| row5 (−2 left, Junior pilot +33) 2027-01-01: spec 31 incl 0 | desk | PASS | App bal 31; incl. 0; Pending –; War bal 31; window App 31; window war 31; grid figure 31 | d3-row5-j1-bal-win.png |
| row10 on 1 Jan 2027 (informational, no spec figure: leave still in Feb) | desk | PASS | Bal row 53/incl 20/pend −11/war 42 · window tile "App 53 incl 20 pend −11 war 42 · 0 taken" · grid fig "42 21" · Approvals: LL Sat 13 – Sun 21 Feb › 5 days 42 P 26 29 Oct 02:16 · by Saber Approve Refuse | d3-row10-j1-bal-win.png |
| row6 2027-01-04 (spec 52 incl 19) | desk | PASS | App bal 52; incl. 19; Pending –; War bal 52; window App 52; window war 52; grid figure 52 · window: 1 taken | d3-row6-j4-bal-win.png, d3-row6-j4-grid.png |
| row8 2027-01-04 (spec App 39, Pending –, War 39) | desk | PASS | App bal 39; incl. 6; Pending –; War bal 39; window App 39; window war 39; grid figure 39 | d3-row8-j4-bal-win.png |
| row4 (no grade, 37 incl 4) 2027-01-04: spec 33 incl 33 | desk | PASS | App bal 33; incl. 33; Pending –; War bal 33; window App 33; window war 33; grid figure 33 | d3-row4-j4-bal-win.png |
| row5 (−2 left, Junior pilot +33) 2027-01-04: spec 31 incl 0 | desk | PASS | App bal 31; incl. 0; Pending –; War bal 31; window App 31; window war 31; grid figure 31 | d3-row5-j4-bal-win.png |
| errors (console, page, 4xx) | desk | PASS | none |  |
| 52 midnight on 31 Dec, page and window left open, no touch: Ranger 37 incl 4 (Senior +36) → 69 incl 33 | desk | PASS | page App bal before 37; page App bal after 69; page incl after 33; window App after 69; window incl after 33; "taken" before 5 taken; "taken" after 0 taken; CCL tile kept (D1489) 3 pend −1 war 2; FCL kept 5; PL kept 2 pend −0.5 war 1.5; EL kept 4; CL kept 1 pend −1 war 0 · lve tile before "LVE5 takenApp balPendingWar bal−2.534.5incl. carried fwd · till 31 Dec", after "LVE0 takenApp balPendingWar bal069incl. carried fwd · till 31 Dec"; window "till 31 Dec" words in tile | d4-before-midnight.png, d4-after-midnight.png |
| 52 the tile words after midnight ("till 31 Dec" — the new year's) | desk | PASS | LVE tile reads: "LVE0 takenApp balPendingWar bal069incl. carried fwd · till 31 Dec" (before: "LVE5 takenApp balPendingWar bal−2.534.5incl. carried fwd · till 31 Dec"), MED 0 | d4-after-midnight.png |
| 52 the grid's figure beside Ranger after midnight | desk | PASS | grid figure "69 7.5" (War bal; his pending bids still stand), Saber's My leave "MY LEAVE LVE 52.5 · OIL 0 · 0 pending ›" | d4-grid-after.png |
| 52 Days taken after midnight: its heading follows the View period | desk | PASS | heading "DAYS TAKEN IN JAN - DEC 26" | d4-taken-after.png |
| 52 the window reopened after midnight: year picker and lines | desk | **FAIL** | After midnight the window left open reads App bal 69 incl 33 and the year picker "2027 and ahead" (options "2027 and ahead", "2026") but STILL LISTS the eight 2026 leave lines (19–21 Jan … 17 Mar 2026, 8 lines); closed and reopened the same picker lists 0 lines. The figures follow midnight, the list under the picker does not. | d4-after-midnight.png, d4-window-reopened.png |
| errors (console, page, 4xx) | desk | PASS | none |  |
| U1 typed figure: 15 → 16, Undo, Redo | desk | PASS | typed 16; after Undo 15; after Redo 16 · Undo note: Undid: LVE balance 15 → 16 | d5-fig-undo.png, d5-fig-redo.png |
| U1 after a reload | desk | PASS | App bal kept 16; Undo list empty (D148) undo off, redo off | d5-fig-reload.png |
| U2 grade change Senior → Junior, Undo, Redo | desk | PASS | after pick Junior pilot+33; after Undo Senior pilot+36; after Redo Junior pilot+33 | d5-grade-set.png, d5-grade-undo.png, d5-grade-redo.png |
| U2 after a reload | desk | PASS | grade kept Junior pilot+33 |  |
| U3 grades list: + Grade "Walker D grade" +10, Undo, Redo | desk | PASS | before 5; in the window after adding 6; after Undo 5; after Redo 6 · names after Redo: Senior pilot / Junior pilot / Senior WSO / Junior WSO / Ops A / Walker D grade | d5-grades-added.png, d5-grades-open.png |
| U3 after a reload | desk | PASS | the added grade kept 6 |  |
| U4 the lock: on, Undo, Redo (the lock is an Undo step — reading) | desk | PASS | after pressing true; after Undo false; after Redo true · Undo note: Undid: the balance lock | d5-lock-on.png, d5-lock-undo.png, d5-lock-redo.png |
| U4 after a reload | desk | PASS | the lock kept true |  |
| errors (console, page, 4xx) | desk | PASS | none |  |
| 46 member own typing: 15 → 16 → 17, Undo twice, Redo twice (unlocked) | desk | PASS | start 15; typed 16 16; typed 17 17; Undo 1 16; Undo 2 15; Redo twice 17 · his row: boxes 7, War bal at 17: 14.5 | d6-desk-01-typed-17.png, d6-desk-02-undone-both.png, d6-desk-03-redone-both.png |
| 44 the lock lands under his open box (14 typed, no Enter) — the lock flipped by lockViaBridge, the stand-in for the admin | desk | PASS | box typed value before 14; his boxes after 0; App bal shown 17 · bridge {"ok":true,"wrote":true}; "Locked by admin" words: "Locked by admin"; note(s) on screen: Ranger LVE App bal not saved: Locked by admin; read-only figures 17 2 3 5 2 4 1; focus on BODY | d6-desk-04-box-open-14.png, d6-desk-05-lock-landed.png |
| 44b his Enter after the lock landed (no box left) | desk | NOT WALKED | there is no box left to press Enter in (boxes 0); an Enter with nothing focused changed nothing: figures 17 2 3 5 2 4 1; notes Ranger LVE App bal not saved: Locked by admin | d6-desk-05-lock-landed.png |
| 44c his Undo while locked (real press) — refused | desk | PASS | App bal unchanged 17; refused (a note says so) true · Undo button before the press: undo on, redo off; the words: Switch back to the admin view to undo that. | d6-desk-06-undo-refused.png |
| 44d unlocked again by the stand-in: the 7 boxes come back live | desk | PASS | boxes back 7; App bal 17 | d6-desk-07-unlocked.png |
| 46 the same Undo accepted once unlocked | desk | NOT WALKED | the stand-in's lock and unlock are themselves steps on HIS Undo list (the bridge writes them as the person signed in), so his Undo meets the unlock step first and is refused again with "Switch back to the admin view to undo that."; figure after the press 17 — the real order (another person's lock never sits on his list) cannot be reproduced through the bridge | d6-desk-08-undo-accepted.png |
| 45 reload as the member: his figure kept, Undo list empty | desk | PASS | App bal 17; Undo undo off, redo off |  |
| 45 Saber reads Ranger's typed figure | desk | PASS | Ranger's row as the admin sees it: App bal 17, incl. 2, War bal 14.5 |  |
| errors (console, page, 4xx) | desk | PASS | none |  |
| 46 member own typing: 15 → 16 → 17, Undo twice, Redo twice (unlocked) | phone | PASS | start 15; typed 16 16; typed 17 17; Undo 1 16; Undo 2 15; Redo twice 17 · his row: boxes 7, War bal at 17: 14.5 | d6-phone-01-typed-17.png, d6-phone-02-undone-both.png, d6-phone-03-redone-both.png |
| 44 the lock lands under his open box (14 typed, no Enter) — the lock flipped by lockViaBridge, the stand-in for the admin | phone | PASS | box typed value before 14; his boxes after 0; App bal shown 17 · bridge {"ok":true,"wrote":true}; "Locked by admin" words: "Locked by admin"; note(s) on screen: Ranger LVE App bal not saved: Locked by admin; read-only figures 17 2 3 5 2 4 1; focus on BODY | d6-phone-04-box-open-14.png, d6-phone-05-lock-landed.png |
| 44b his Enter after the lock landed (no box left) | phone | NOT WALKED | there is no box left to press Enter in (boxes 0); an Enter with nothing focused changed nothing: figures 17 2 3 5 2 4 1; notes Ranger LVE App bal not saved: Locked by admin | d6-phone-05-lock-landed.png |
| 44c his Undo while locked (real press) — refused | phone | PASS | App bal unchanged 17; refused (a note says so) true · Undo button before the press: undo on, redo off; the words: Switch back to the admin view to undo that. | d6-phone-06-undo-refused.png |
| 44d unlocked again by the stand-in: the 7 boxes come back live | phone | PASS | boxes back 7; App bal 17 | d6-phone-07-unlocked.png |
| 46 the same Undo accepted once unlocked | phone | NOT WALKED | the stand-in's lock and unlock are themselves steps on HIS Undo list (the bridge writes them as the person signed in), so his Undo meets the unlock step first and is refused again with "Switch back to the admin view to undo that."; figure after the press 17 — the real order (another person's lock never sits on his list) cannot be reproduced through the bridge | d6-phone-08-undo-accepted.png |
| 45 reload as the member: his figure kept, Undo list empty | phone | PASS | App bal 17; Undo undo off, redo off |  |
| 45 Saber reads Ranger's typed figure | phone | PASS | Ranger's row as the admin sees it: App bal 17, incl. 2, War bal 14.5 |  |
| errors (console, page, 4xx) | phone | PASS | none |  |
| 7 a half day everywhere: 20 incl 3 typed, an AM LL on Fri 23 Jan approved (19.5 incl 2.5) | desk | PASS | App bal 19.5; incl. 2.5; Pending −2.5; War bal 17; window App 19.5; window war 17; grid figure 17; Days taken LL (3 + 0.5) 3.5 · My leave (Ranger signed in): "MY LEAVE · next 26 Jan LVE 17 · OIL 0 · 5 pending ›"; Approvals lines LL Thu 29 Jan, AM › 0.5 day 17 P 27.5 — Approve Refuse // LL Thu 12 – Fri 13 Feb › 2 days 17 P 27 — Approve Refuse // CCL Mon 2 Mar › 1 day CCL 2 P 26 — Approve Refuse // PL Mon 16 Mar, AM › 0.5 day PL 1.5 P 27.5 — Approve Refuse // CL Tue 17 Mar › 1 day CL 0 P 27 — Approve Refuse | d7a-7-bal-win.png, d7a-7-grid.png, d7a-7-taken.png |
| 8 AM LL and PM CCL approved on one Wed (4 Feb) | desk | PASS | LVE App bal 19.5 − 0.5 19; LVE incl. 2; CCL tile App bal after (3 − 0.5, pending −1 war 1.5) 2.5 · CCL tile "2.5 pend −1 war 1.5" | d7a-8-bal-win.png |
| 12 Approve all, then one Undo (the Undo from the Balances page) | desk | PASS | 11 lines pending; button armed reading "Approve 11 — tap again"; War bal kept for all five: true; App bal fell for each man who had pending: true; one Undo ("Undid: a decision on a bid") put all back: true; scroll before/after Undo {"top":0,"left":0,"win":0} / {"top":0,"left":0,"win":0}; bane: App 19 pend −2.5 war 16.5 → App 16.5 pend – war 16.5 → Undo App 19 pend −2.5 war 16.5 // wolf: App 20 pend −1 war 19 → App 19 pend – war 19 → Undo App 20 pend −1 war 19 // bruise: App 18 pend −0.5 war 17.5 → App 17.5 pend – war 17.5 → Undo App 18 pend −0.5 war 17.5 // slash: App 33 pend −1.5 war 31.5 → App 31.5 pend – war 31.5 → Undo App 33 pend −1.5 war 31.5 // slipway: App 24 pend – war 24 → App 24 pend – war 24 → Undo App 24 pend – war 24 | d7a-12-before.png, d7a-12-after.png, d7a-12-balances.png, d7a-12-undone.png |
| errors (console, page, 4xx) | desk | PASS | none |  |
| 5d carried fwd 25 typed with App bal 20, then App bal 3 with incl. 20 showing | desk | **FAIL** | Designer's reading: carried fwd 25 typed beside App bal 20 is clamped at once to "incl. 20". Seen: it is REFUSED — the box goes back to 0 and the words under it read "Carried forward is from 0 to 20"; App bal 20 kept. (Then App bal 3 → 3 incl 0, because the incl. was still 0.) A host reading — refusal with words is a fair design; second half passes in the next row (a typed incl. 20 then App bal 3 → 3 incl 3). | d7b-5d-cf25.png, d7b-5d-app3.png |
| 4 today 28 Oct 2026: typed 20 incl 3; LL Mon 4 – Tue 5 Jan 2027 approved now → 18 incl 3 (the 2027 days come off the total only) | desk | PASS | App bal 18; incl. 3; Pending –; War bal 18; window App 18; window war 18; grid figure 18 · lines 2026-01-14 OIL Wed 14 Jan 1 Approved / 2027-01-04 LL Mon 4 – Tue 5 Jan 2 Approved | d7b-4-now-bal-win.png |
| 4 clock 1 Jan 2027: 17 → carried forward 15 after the 2 days, +33 → 48 incl 15 | desk | PASS | App bal 48; incl. 15; Pending –; War bal 48; window App 48; window war 48; grid figure 48 | d7b-4-jan1-bal-win.png |
| 2 below-zero ask on a bid made only of weekend days (Saint War bal 10; LL Sat 13 – Sun 21 Feb 2027; the run grows to 21 days) | desk | PASS | Saint War bal 10 (typed 20, LL 1–12 Feb 2027 approved = 10 charged), LL Sat 13 – Sun 21 Feb 2027 picked: the LL button reads 10; after the first press the window stays open and says "That takes Saint to -1 LVE. Tap the same leave again to go ahead." — the ask names −1 (10 − 11), as the designer expected, though the bid's own days count 5. Second press placed it: App bal −1. | d7b-2-ask.png |
| 2b after the second press (the leave placed) | desk | PASS | Bal row −1/incl 0/pend –/war −1 · window tile "App −1 incl 0 pend 0 war −1 · 0 taken" · grid fig "-1 21" · Approvals:  | d7b-2-second-bal-win.png |
| 3 leave button "left" — Wed 4 Nov (War bal 18; designer expects 17) | desk | **FAIL** | LL left 18, OL 18, CCL 0, PL 0; day line "No manning row turns amber or red" | d7b-left-2026-11-04-full.png |
| 3 leave button "left" — Sat 7 Nov (War bal 18; designer expects 18) | desk | PASS | LL left 18, OL 18, CCL 0, PL 0; day line "No manning row turns amber or red" | d7b-left-2026-11-07-full.png |
| 3 leave button "left" — PH Wed 18 Feb (War bal 18; designer expects 18) | desk | PASS | LL left 18, OL 18, CCL 0, PL 0; day line "No manning row turns amber or red" | d7b-left-2026-02-18-full.png |
| 3 leave button "left" — Wed 4 Nov PM (War bal 18; designer expects 17.5) | desk | **FAIL** | LL left 18, OL 18, CCL 0, PL 0; day line "No manning row turns amber or red" | d7b-left-2026-11-04-pm.png |
| errors (console, page, 4xx) | desk | PASS | none |  |
| 5d App bal typed 3 while incl. 20 shows (designer: 3 incl 3) | desk | PASS | before: 20 incl 20 20 incl 20; after: App 3; after: incl. clamped 3 · error words: none | d7c-5d-app3.png |
| 47 locked: Saber types Ranger's App bal 18 (saved); his own row keeps its boxes; his window reads "Locked for members" | desk | PASS | Ranger App bal saved 18; Saber's own row boxes 7; window padlock words Locked for members | d7c-47-own-window.png |
| 49 admin typed Ranger's figure, changed his grade, locked: Ranger's bell and window | desk | PASS | bell lines about balance/grade/lock 0; dots in his window list 0 · bell lines: none; his window lock line "Locked by admin", boxes 0 | d7c-49-bell.png, d7c-49-member-window.png |
| 35 a reload while on the Balances page: where it lands (signed in again by the walk) | desk | PASS | selected tab after the reload and a new sign-in: lw-tab-grid | d7c-35-reload-landing.png |
| 48 the Balances page scrolled to row 41 (Vector): type, Undo — the page does not move | desk | PASS | scroll before typing {"top":1500,"left":0,"win":0}; scroll after Undo {"top":1500,"left":0,"win":0}; figure back 33 · scroll {"top":1500,"left":0,"win":0} → {"top":1500,"left":0,"win":0} → {"top":1500,"left":0,"win":0}; the page's scroll max after: 1629 | d7c-48-undo-scrolled.png |
| 48 the docked window open: type App bal 17 in it, Undo from the top bar — window figure back, window and page where they were | desk | PASS | window App before 18; after typing 17; after Undo 18; window left edge unmoved 968; window top unmoved 121 | d7c-48-window-undo.png |
| errors (console, page, 4xx) | desk | PASS | none |  |
| 11b typed 20 (Nov 2026); LL Fri 31 Dec 2027 – Mon 3 Jan 2028 filed on the Inputs page with no 2028 period: −2 by the plain rule | desk | PASS | App bal 18; window App 18 · lines 2026-01-14 OIL Wed 14 Jan 1 Approved / 2027-12-31 LL Fri 31 Dec – Mon 3 Jan 2 Approved | d8-11b-before-bal-win.png |
| 11b the 2028 period created (1 Jan – 31 Dec 28, no holiday yet): nothing that was counted the same way moves | desk | PASS | App bal 18 | d8-11b-created-bal-win.png |
| 11b 3 Jan 2028 made a public holiday in the new period: the day comes back (+1) | desk | PASS | App bal 19; window App 19 · lines 2026-01-14 OIL Wed 14 Jan 1 Approved / 2027-12-31 LL Fri 31 Dec – Mon 3 Jan 1 Approved | d8-11b-ph-bal-win.png |
| errors (console, page, 4xx) | desk | PASS | none |  |
| 38 the grid's two lines beside Ranger follow the View period (26 → 27 → 26) | desk | PASS | View JAN-DEC 26: "12.5" over "7.5"; View JAN-DEC 27: the first line 12.5 unchanged, no second line (no LL/OL in 2027); back to 26: 12.5 / 7.5. | d7a-38-view27.png |
| 6 correcting only "incl." (row-1 state 15 incl 2): incl. 3 → 15 incl 3 (never 17); then App bal 16 → 16 incl 3; Undo twice | desk | PASS | incl. 3: App bal 15 incl 3; App bal 16: 16 incl 3; Undo once: 15 incl 3 (note "Undid: LVE balance 15 → 16"); Undo twice: 15 incl 2 (note "Undid: LVE carried fwd 2 → 3"). No "15 → 15" line. | d7a-6-incl3.png, d7a-6-app16.png, d7a-6-undone-twice.png |
| 10a a holiday added after typing: PH on Tue 20 Jan (inside 19–21 Jan, in the snapshot) | desk | PASS | App bal 15 incl 2 unchanged (window, row, grid 12.5); the leave line now reads "Mon 19 – Wed 21 Jan 2 Approved". | d7a-10a-bal-win.png |
| 10b PH on Tue 27 Jan (inside 26–27 Jan, approved after typing) | desk | PASS | App bal rose 15 → 16 incl 2 → 3 at once with no reload on the Balances row, the window tile and the grid figure (13.5); line "Mon 26 – Tue 27 Jan 1 Approved". | d7a-10b-bal-win.png, d7a-10b-grid.png |
| 9 kind change LL → CCL on an approved leave (26–27 Jan) from the grid | desk | NOT WALKED | The bid window has no kind change on an existing leave: pressing the CCL button over the approved LL says "2 days not written: already holding leave or a medical." and writes nothing. The Inputs-page route (an input's own Type) was not tried (time). | d7a-9-kind-changed.png |
| glyph: a negative figure on each surface (Saint typed −2) | desk | **FAIL** | Balances box and War bal "−2" and the window's box and War bal "−2" use the true minus (U+2212); the grid's figure beside the name reads "-2" with a hyphen (U+002D); the below-zero ask reads "That takes Saint to -1 LVE" with a hyphen. Scenario 7 asks for one minus glyph on every surface. | d7b-glyph-window.png, d7b-glyph-grid.png, d7b-2-ask.png |
| 3 the leave buttons' "left" (whole-leave window not tried) | desk | NOT WALKED | Only the one-day window walked (rows above). The whole-leave window's "All n days" versus one day, and the drag window, were not walked. |  |
| 43 an approval lands while his box is open (via the bridge) | phone | NOT WALKED | The brief allows the bridge only for the lock; no bridge function approves a bid, so the approval cannot be made while his box is open without injecting it. |  |
| 13 MED / Days taken with an ATT B | desk | NOT WALKED | Marked TEST + one picture; not walked here. |  |

## Findings (each FAIL)

1. **The bid windows' "left" on a leave button does not change with the day or the half** (rows "3 … left" and "row10 … left";
   d1-row1-bidwin, x2-2026-02-04-pm, d7b-left-2026-11-04-full, d7b-left-2026-11-04-pm, d3-row10-bidwin-22feb). Did: opened
   the one-day bid window for Ranger on a free Wed, a Saturday, a PM half and for Nomad on a free Wed, Sat 7 Nov, the
   public holiday Wed 18 Feb and a PM half. Expected (the designer's reading, scenario 3): the figure after placing — Wed
   War bal − 1 (11.5), Sat and PH unchanged, a half −0.5. Seen: every button reads the person's War bal whatever the day or
   portion (12.5 every time for Ranger; 18 every time for Nomad), CCL reads its War bal (2 / 0). The below-zero ask, by
   contrast, does count the chosen days (★2). Whether "left" means "now" or "after this" is the host's reading.
2. **The grid's figure and the below-zero ask draw a negative with a hyphen** (d7b-glyph-grid, d7b-2-ask): every other
   surface uses the true minus. Expected one glyph everywhere (scenario 7).
3. **A person window left open across midnight keeps listing last year's leave** (d4-after-midnight, d4-window-reopened):
   after 1 Jan the window's figures roll over, its year picker reads "2027 and ahead", but the list still shows the eight
   2026 lines; reopened, the same picker lists none.
4. **Carried fwd typed over the figure is refused, not clamped** (d7b-5d-cf25): reading, see its row; second half of 5d
   passes (d7c-5d-app3).

## Notes for the host (not faults)

- **Person window "Pending 0" against the page's "–":** with nothing pending the window's tile draws "0" where the
  Balances row draws "–" (d1-row2-bal-win).
- **The refusal a member's Undo meets under the stand-in lock reads "Switch back to the admin view to undo that."**
  (d6-phone-06-undo-refused, d6-desk-06-undo-refused). The bridge writes the lock and the unlock as steps on Ranger's own
  Undo list (the history would name Ranger, not Saber), so his Undo meets the lock step, not his earlier typing: these
  are the stand-in's. What the member's Undo of his own earlier change says while locked was therefore not read, and
  "the same Undo accepted once unlocked" could not be walked (the unlock step sits on top). A member has no admin view,
  so the words would read oddly to him if a real lock ever put a step there; the host decides.
- **The lock under his open box** (44, desk and phone): typed 14 (no Enter), lock lands: his seven boxes go at once, his figures stay as
  read only (17 2 3 5 2 4 1), "Locked by admin" shows with the padlock, a passing note at the foot reads "Ranger LVE App bal
  not saved: Locked by admin"; the 14 is not saved; keyboard focus falls to the page body; there is no box left to press Enter
  in (NOT WALKED). Unlocked: the seven boxes return live.
- **The grid's range picker cannot carry a leave over 31 Dec into the next period** (row 6's route; Gambit): picked 31 Dec 26 →
  4 Jan 27, the selection read "31 Dec 26" and only Thu 31 Dec was placed. The Inputs page files it as one input.
- **The Balances page lists a man the grid does not draw** (Torch): his row is on the
  page, he has no row on the grid (`row-ignite` absent), so no bid window could be opened for him on the grid (cause not checked; scenario 27 territory).
- **The first press on the Approvals tab after placing a bid with the View picker switched to 2027 did nothing twice**
  (d3 and d7b logs, "Approvals did not open, again"); the second press opened it. Not reproduced elsewhere; may be a
  walk artefact (the picker select kept the focus).
- **My leave counts days, not requests** ("5 pending" with five requests of 0.5, 2, 1, 0.5, 1 days; after approving the
  two LL lines "2.5 pending").
- **After midnight the carried-forward words still read "till 31 Dec"** (no year printed), so a person cannot tell the
  new year's from the old one's on that line.
- Reload: a reload signs the person out; the walk signed in again (landing tab after sign-in: Grid, d7c-35-reload-landing).
  After each reload the figures, grade, added grade and the lock were kept and Undo and Redo were empty (D148).
- Member (desk and phone): his own typing 15 → 16 → 17, Undo twice, Redo twice, each accepted unlocked; after a reload his
  figure is kept and Saber reads it (17, War bal 14.5).
- Admin keeps his boxes while locked and the lock is an Undo step ("Undid: the balance lock"); no bell line and no dot for an admin's
  balance change, grade change or the lock (49).

## Differences from the drawings

Not compared: the Balances page, its member and phone forms, the grades window and the person window beside their
approved drawings belong to walkers A, B and C. Pictures of every state above are at 1536 × 860 and 402 × 874 for them to
use. The one difference I saw while reading pictures: the person window on a desktop (d1-row2-bal-win) stands docked at the
right edge at top 121, on the screen (the probe's off-screen fault is fixed in this build).

## Not walked, and why

- 44b his Enter after the lock landed, and 46's "same Undo accepted once unlocked": no box left / stand-in artefact (above).
- 43 (an approval landing under an open box): the brief allows the bridge for the lock only.
- 9's kind change LL → CCL: the grid refuses ("2 days not written: already holding leave or a medical."); the Inputs-page
  route was not tried. 13 (ATT B in MED), 3's whole-leave and drag windows, 5 (a)(b), 21, 22, 37: TEST-marked or other
  walkers'; row 7 (approved only on 2 Jan) of the spec's table was not walked; the phone's My leave count and the
  member's My leave were read on the desktop only (Ranger signed in on 1536 wide).
- Scenarios 14–36, 39–42, 50–56 name surfaces of walkers A, B and C.

## Errors seen

None: no console error, page error or 4xx in any run (every script's last line).
