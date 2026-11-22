# Bug check — ALL AVAIL counts a man posted out as SANS who is planned with us, whatever "+ SANS" says ([FABLE-READ-FAULTS] (i))

**22 Nov 26, chat 141, branch `claude/allavail-sans-postout-141`.** Built by Fable (the job touches OIL — D2255, D2268);
the scenarios Astra's; the walk the host's; the code reads Astra's and a fresh, blind Opus reader's. Pictures:
`docs/img/handpass/2026-11-22-allavail-sans-posted/`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money — what a man is owed, OIL included, or how many count as present | **YES** — who stands behind ALL AVAIL decides who earns the event's OIL (D25), and its count is "how many are available" |
| 2 | The published record | **YES** — the crowd is frozen at publication; the fault made a published day read pending when "+ SANS" was switched |
| 3 | Saved data | NO — nothing new is stored and nothing stored is read differently: the saved posting (`postOuts`) is read as it always was, only by one more reader |
| 4 | A shared drawer | NO — no drawing routine changes; the crowd is one calculation every surface already asks |
| 5 | A new gesture or mode | NO — no control, tap target or mode is added |
| 6 | A new surface | NO |
| 7 | Roles | NO — who may do or see what is untouched (`state/perms.ts` not changed) |
| 8 | The warning list | NO — no warning's words or rule changes; the crowd is not read by the validator |

**Tier: FULL** (questions 1 and 2).

## 2. The rulings that apply — each checked against the running build

| Ruling | What it says, in the app's words | Checked |
|---|---|---|
| [ALL-AVAIL-REDEF], D27 | ALL AVAIL counts a SANS man only when he is planned with us that day; a time clash keeps him out | |
| D283 | Posted out as SANS, he becomes SANS on the date; "+ SANS" off, the Leave War still shows him in his old place, posted out | |
| D2313, D2327 | He is SANS only from his SANS date; a tick taken off by hand makes him an ordinary man again from that day | |
| D25, D142 | OIL is owed; a day's OIL comes from its latest published version | |
| D44, D45, D103 | Nothing on a published day changes without the scheduler acknowledging it; pending takes the four sign-offs | |
| D303 | A posting with no chip chosen: off the manpower from the date | |
| D327, D320 | An archived man is out from his archive on, in before; every stint is kept | |
| D1215, D1221 | SANS men are off the Leave War unless "+ SANS" puts them on | |

**Clashes:** none found. The fix follows D283 ("still flying with us") over the war's display window; no ruling says the
"+ SANS" switch may change the crowd.

## 3. The roll-call — every place that reads who stands behind ALL AVAIL / ALL

The thing: **the crowd** (`leavewar/sync.ts availableFor`, reached only through `HOOKS.oilSentinel`). Columns: does the
place SHOW the right crowd for a posted SANS man planned with us, "+ SANS" off; is it the SAME with "+ SANS" on; what
else is drawn there.

| # | Place | Reads the crowd by | Shows him, "+ SANS" off | Same with it on | Else there | Proved by |
|---|---|---|---|---|---|---|
| 1 | Edit Schedule's week — the ALL AVAIL count chip on its row | `ui/html.ts` → `oilmode.ts oilSentinelSummary` | | | | |
| 2 | The Scheduler Board — the count chip | the same | | | | |
| 3 | The ALL AVAIL window — its pucks, who is available | `oilmode.ts oilSentinelPeople` | | | | |
| 4 | OIL Earn — the window's earning half, the green OIL bar on his puck | `oilmode.ts` → `dayOilWork` | | | | |
| 5 | A published day — the crowd it keeps, and "N pending" | `engine/oilev.ts` (lines 574–638) | | | | |
| 6 | View-only Sched — the published face | the kept crowd | | | | |
| 7 | An input filed for ALL AVAIL — its row's crowd | `oilev.ts` (609, 638) | | | | |
| 8 | The Leave War grid — his OIL cell (FO / HO) | `sync.ts runOilPass` from the kept crowd | | | | |
| 9 | The OIL tracker and Balances — his OIL figure | the war's ledger | | | | |
| 10 | The Leave War's own row, manning, Available rows, day panel | the war's display row (`inSquadron`) | NO-because: the war's display follows the switch by his D283 — not changed | — | | |
| 11 | The validator, the crew list, the SANS calendar | do not read the crowd | NO-because: none calls `availableFor` or `inSquadron` (searched) | — | | |

## 4. The door check

Passed — no new gesture or mode (question 5).

## 5. The five sizing lines (the order's §7.0)

1. **The type of change:** A — a rule inside ONE shared calculation (who is still ours on a day, inside the crowd), with
   G's edge: the crowd is frozen at publication, so the orders round a publish count.
2. **What only a walk could find here:** that each place a person reads the crowd is wired to it through the real
   controls — the posting made on the Leave War's own sheet, "+ SANS" pressed in the war's Settings, the man named on a
   day by a drag, the ALL AVAIL count chip on the week and on the board, the ALL AVAIL window's pucks, OIL Earn's green
   bar, the published day's "N pending", his FO on the Leave War grid — and that pressing "+ SANS" repaints nothing on
   the schedule; at a phone's size and a desktop's. The tests carry the calculation itself and the OIL credited, by
   calling the writers directly; the two code reads carry the search for another reader of the war's display row.
3. **What the ledger says:** nine walks of leading type A found 14 faults, only 2 of them in the change itself (12 older,
   met in passing); a measured Opus walker cost 350 to 630 thousand tokens.
4. **The walk chosen:** ONE Opus walker (his D2256) in one world on the build of `55c87b1dc`, the host opening every
   deciding picture and reproducing any finding. Astra's scenarios marked WALK, with the plain-user round, at a
   desktop's 1536 and his iPhone's 402 by touch; no size beyond those — no layout changes. The repeated cases of the
   calculation (each state a SANS posting can be in, each other kind of posting) are carried by
   `src/leavewar/allavail-sans-posted.test.ts`, whose route on screen is the one the walk drives once.
5. **After the walk:** its row is added to `docs/walk-ledger.md`.

## 6. The orders walked — what the screen said and what the OIL said

## 7. The cases carried by a test

All in `src/leavewar/allavail-sans-posted.test.ts`; each calls the app's writers directly (the posting, the Quals tick,
the archive, the day's sign-off and approval, the OIL pass) and asks the crowd — none presses a control, so none stands
in for a walked route; the route itself (the war's sheet, "+ SANS" in Settings, the count door, Publish) is walked once
in S1 and S13.

| Case | The test | What it proves |
|---|---|---|
| The fault: named, posted out as SANS, "+ SANS" off | "he is in the crowd of a day after his posting that names him" | he is in the crowd |
| What it cost | "a published Saturday credits him the event's hours…" | FO, not HO, on the war's grid for a nine-hour Saturday |
| The switch and a published day | "turning "+ SANS" on after the day is published…" | nothing pending, the same OIL, both ways |
| Each state of a SANS posting | "the "+ SANS" switch never changes who ALL AVAIL counts" (7 tests) | planned / not planned / busy / a day before / hand untick / to come / undone: the same people both ways, and who |
| Every other posting | "left as it was…" (3 tests) | no chip, Overseas Sqn, a SANS posting moved later: still departures |
| An archive after a SANS posting (R1) | "F1: …" (2 tests) | in on the days before his archive, out from it; the published day's crowd unchanged |
| A post-in date ahead (R2) | "F2: …", "left as it was: a man who is NOT SANS, not yet posted in…" | the same both ways; an ordinary man still waits for his post-in date |
| A hand-ticked SANS man, archived (R6) | "a hand-ticked SANS man, archived…" | in before his archive, out from it |
| Astra's S9–S11 (today's and backdated postings, untick and retick, the date moved) | the rows above, and `src/leavewar/sans-from-date.test.ts` (chat 140, walked there by w1, w2 and r1) | the dates' edges and the gap |
| Astra's S21–S22 (what counts as named; exclusions and time edges) beyond the one clash walked in S22 | `src/leavewar/sync.wire.test.ts`, `src/engine/rulesfirst-4-availability.test.ts`, `src/leavewar/oilsync.test.ts` | the membership rules this fix leaves as they were — the changed lines sit after the SANS check and before the clash checks, and touch neither |
| Astra's S4 (a Personal input's crowd, a row with no end) | `src/engine/oilpersonalcrowd.test.ts`, `src/engine/oilclaimcrowd.test.ts` | those crowds come through the same one door (`HOOKS.oilSentinel`) |

## 8. The pictures

## 9. The break tests

The fix was built red-first, so each wired answer has a test that fails without it: commit `2785b1463` holds the first
five failing on `main`'s code (the crowd, the FO, the published day's pending count, the switch, the hand untick), and
three more failed on the first fix before the second (`F1` twice, `F2`) — run and seen by the host each time. The
filed fault (m) stands in the suite as `it.fails`.

## 10. Errors seen

## 11. What was NOT walked, and why

Astra designed 28 scenarios; 15 were walked (S1, S2, S3, S5, S6, S7, S8, S12, S13, S16, S17, S20, S22, S23, S28) with the
plain-user round (S24). Set aside, each with its reason (§7.0):

- **S9, S10, S11** (today's and backdated postings; untick and retick; the posting's date moved): carried by the tests of
  §7, and their routes on screen were walked on the SANS-from-its-date job this morning
  (`docs/handpass/2026-11-22-sans-from-date.md`, walkers w1, w2, r1) on code these lines leave as it was.
- **S4, S21** (a Personal input's crowd and rows with no end; each kind of named item): the tests of §7 — one door, and
  the changed lines do not read what kind of item names him (`dayEngaged` is asked as before).
- **S14, S15** (a restore with a gap; a delete and a reused callsign): the stints and the delete are read as before
  (`inSquadron` on the saved posting; the delete by its date above the changed lines) — `src/leavewar/stints.test.ts`,
  `deletednorow.test.ts`, `deleteposting-restore.test.ts`, `onedoor.test.ts`, all green; the narrow read of the second
  fix was asked about a restored SANS man by name.
- **S18, S19** (week and period changes; Undo and Redo): the week change is walked inside S1. Undo and Redo were not
  walked: the fix stores nothing — the crowd is worked out afresh each time it is drawn, from the saved posting, the
  person's own dates and the day — so there is no state of this change for an Undo to restore wrongly; "Undo post out"
  is walked (S12). Said plainly: no step pressed the top bar's Undo.
- **S25, S26** (the Leave War's own counts, warnings and links; withdrawing a credit already used): the war's display
  and tracking follow "+ SANS" by his D283 and are not changed (roll-call row 10); the withdrawal warning reads the
  ledger, which the fix reaches only through a published day's crowd — walked in S1 and S6.
- **S27** (another squadron's schedule in view): filed as (n) — a fault of its own in the two-squadron work, found by
  both readers, not this fix's to walk.

## 12. The gate counts

## 13. What the walk and the reads found, and each disposition

**The readers** (each blind to the other and to the walk, on an exported copy of `9326121d3` — the app code of
`55c87b1dc`, the first fix): Astra, read only, ran nothing (`docs/superpowers/briefs/2026-11-22-allavail-sans-posted-read-astra.md`);
the fresh Opus reader, who ran its proofs (`…-read-opus.md`). Astra's scenario design: `…-scenarios-astra.md`.

| # | Who | The claim | Reproduced by the host | Disposition |
|---|---|---|---|---|
| R1 | Opus F1 | Archived after a SANS posting, he leaves the crowd of the days between the posting and the archive; a published one reads pending and its amendment takes his OIL (D327) | YES — 2 tests failed | **Confirmed; older cause (the archive rewrites the saved posting), newly reachable with "+ SANS" off by the first fix. FIXED** — `sync.ts availableFor`: a man SANS and named that day is read by his squadron stints and his archive's DATE, not the posting window. Tests "F1: …" (2) |
| R2 | Opus F2 · Astra read #2 · Astra scenarios S3 | A SANS man with a post-in date ahead, named before it: counted with "+ SANS" off, not with it on | YES — 1 test failed | **Confirmed, older. The switch no longer changes it: FIXED** by the same lines — he counts both ways, as he did on `main` with "+ SANS" off (the squadron's way, D1215). **Which answer is right is put to him:** the Opus reader reads [ALL-AVAIL-REDEF] as "in"; Astra reads D308 as "out until his post-in date". Filed `[FABLE-READ-FAULTS]` (o) |
| R3 | Astra read #1 | SANS posting, then a hand untick, then an archive days later: the ordinary days between lose him (unnamed, behind the crowd) | YES — the proof is in the suite as `it.fails` | **Confirmed, older; the first fix makes it reachable with "+ SANS" off. NOT FIXED — filed (m):** the fix that is right at the root (the archive closing his stint the day before the archive) changes what the Leave War draws for those days — his word first |
| R4 | Astra read #3 · Opus U1 | With one squadron's Leave War held loaded and another squadron's schedule in view, the crowd reads the wrong war's postings | NO — not run by the host (the two-squadron fixture) | **Unresolved, older, in the two-squadron build's area — filed (n)** with Astra's exact input, for that build's chats |
| R5 | Astra read #4 · Opus point 5 | Two tests assert only that both switch positions agree, not the answer; a title says "named or not" and tests unnamed only | read | **Confirmed; fixed** — `not.toContain` added to both, the title narrowed |
| R6 | Opus U2 | A hand-ticked SANS man, archived | YES — passes | **No fault** — test "a hand-ticked SANS man, archived" pins it |
| R7 | Both | The three host's readings | — | (1) supported for the crowd, the published day and OIL (the war's own tracking follows the switch by D283); (2) supported (D2327 with D27); (3) the owner's to decide — kept as on `main`, pinned, filed (p) as a question |
| R8 | Both, tidiness | The bare `true` in `windowFor(posting, true)`; the story told twice in comments | — | Filed, not fixed (D489) |

The second fix is new logic, so it got its own narrow read by a fresh Opus reader handed only the fix and R1–R2 (§5):
`docs/superpowers/briefs/2026-11-22-allavail-sans-posted-read-fix2-opus.md`, its proofs run.

| # | Who | The claim | Reproduced by the host | Disposition |
|---|---|---|---|---|
| R9 | The narrow read, finding 1 and its "change to put to him" | The second fix set aside the WHOLE posting window for a SANS man named that day — so a real departure (an Overseas Sqn or Delete posting still to come, a posting with no chip) stopped counting for him: he stayed in the crowd past its date, and a day published meanwhile would read pending when the posting ran | YES — 2 tests, seen failing with the repair taken out and passing with it | **Confirmed, new with the second fix. FIXED** (round 2, the last): only a post-in date still to come and the end an archive wrote are not asked; any other posting's date ends it. Tests "left as it was: a SANS man with an Overseas Sqn posting still to come…", "…posted out with no chip chosen…". A one-line guard on the reader's own exact repair, proved by its six proofs and the host's two — no further read (§5: more than a one-line guard gets one) |
| R10 | The narrow read's negatives | F1 and F2 right and complete; a restored man, an archive on the day he is named, a posting archive once run, a delete once run, both switch positions: no fault. Two cases read in the code, not run: a move between squadrons, a man with no war row | — | Recorded |

**The walk ran on the build of `100fa3bb7` (the second fix); the third fix changes one state no scenario walks** — a
SANS man who also holds a posting that is not a SANS one — and leaves every walked scenario's answer as it was (the
same tests pass before and after). No re-walk; said in §11.

## 14. The Walk line
