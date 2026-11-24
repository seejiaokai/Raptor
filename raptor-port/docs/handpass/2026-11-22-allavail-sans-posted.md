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
| [ALL-AVAIL-REDEF], D27 | ALL AVAIL counts a SANS man only when he is planned with us that day; a time clash keeps him out | PASS — S1 (in when named, 45), S5 (out when not named, 44), S22 (out on a time clash, 44) |
| D283 | Posted out as SANS, he becomes SANS on the date; "+ SANS" off, the Leave War still shows him in his old place, posted out | PASS — S1: SANS from 15 Jul, purple line on his puck; the war still draws him posted out with "+ SANS" off |
| D2313, D2327 | He is SANS only from his SANS date; a tick taken off by hand makes him an ordinary man again from that day | PASS — S8 (not SANS before the date: out; in after midnight), S12 (Undo post out: an ordinary WSO, in); the hand untick by a test (§7) |
| D25, D142 | OIL is owed; a day's OIL comes from its latest published version | PASS — S1: FO* on Sat 18 Jul after Publish; S6: FO* → HO* (AL1) → FO* (AL2); S5: the cell stays FO* until an amendment |
| D44, D45, D103 | Nothing on a published day changes without the scheduler acknowledging it; pending takes the four sign-offs | PASS — S1, S16, S17: each "+ SANS" switch, a week change, two reloads and a new sign-in leave 0 pending and the four names; S5: a real change reads pending and drops them |
| D303 | A posting with no chip chosen: off the manpower from the date | PASS — S28: "On 15 Jul: off the manpower, nothing else."; Hex out of the crowd, both ways |
| D327, D320 | An archived man is out from his archive on, in before; every stint is kept | PASS — S13: archived, Hex still in Tue 14 Jul's crowd (35) both ways, out of Thu 16 Jul's (33 → 32); Tue's one pending line is the briefing that names him |
| D1215, D1221 | SANS men are off the Leave War unless "+ SANS" puts them on | PASS — S1, S2: "+ SANS" pressed on and off in the war's Settings; nothing on the schedule moved |

**Clashes:** none found. The fix follows D283 ("still flying with us") over the war's display window; no ruling says the
"+ SANS" switch may change the crowd.

## 3. The roll-call — every place that reads who stands behind ALL AVAIL / ALL

The thing: **the crowd** (`leavewar/sync.ts availableFor`, reached only through `HOOKS.oilSentinel`). Columns: does the
place SHOW the right crowd for a posted SANS man planned with us, "+ SANS" off; is it the SAME with "+ SANS" on; what
else is drawn there.

| # | Place | Reads the crowd by | Shows him, "+ SANS" off | Same with it on | Else there | Proved by |
|---|---|---|---|---|---|---|
| 1 | Edit Schedule's week — the ALL AVAIL count chip on its row | `ui/html.ts` → `oilmode.ts oilSentinelSummary` | YES — "45", Hex counted (S2, S5 on Edit Schedule) | YES | the row's CX and remarks; nothing over the chip | w1 S2, S5; w2 S8 |
| 2 | The Scheduler Board — the count chip | the same | YES — "45" (S1) | YES | on an OFT sim's FRONT seat the back seat's empty "+" box may take the press — older, filed (q) | w1 S1; w2 S23 |
| 3 | The ALL AVAIL window — its pucks, who is available | `oilmode.ts oilSentinelPeople` | YES — Hex among the WSOs with his purple SANS line (S1; the host saw both sizes) | YES | a flagged man's reason under his puck (S13) | w1 S1, S7; w2 S13, S8 |
| 4 | OIL Earn — the window's earning half, the green OIL bar on his puck | `oilmode.ts` → `dayOilWork` | YES — "Who earns OIL 45 of 45", Hex included (S1); switched off for him alone (S6) | YES | the green OIL bar | w1 S1, S6 |
| 5 | A published day — the crowd it keeps, and "N pending" | `engine/oilev.ts` (lines 574–638) | YES — 0 pending after Publish and after every switch (S1); a real change reads pending (S5: 2 lines) | YES | the four sign-off boxes | w1 S1, S5, S16, S17; tests |
| 6 | View-only Sched — the published face | the kept crowd | YES — the member sees the same 45 with Hex (S20); the 👁 look at the Original the same (S7) | YES | no control offered to the member | w1 S7, S20 |
| 7 | An input filed for ALL AVAIL — its row's crowd | `oilev.ts` (609, 638) | YES — an Event filed for ALL AVAIL lists Hex before and after Publish (S2) | YES | the input's row on the Common Programme | w1 S2 |
| 8 | The Leave War grid — his OIL cell (FO / HO) | `sync.ts runOilPass` from the kept crowd | YES — FO* on Sat 18 Jul (S1; the host saw the grid) | YES — in his old row, or the SANS group | the posting hatch and "PO" on his other days (D283) | w1 S1, S2, S6; tests |
| 9 | The OIL tracker and Balances — his OIL figure | the war's ledger | YES — the member opened the OIL tracker for Hex (S20); the figure by a test (`sans-postout-oil.test.ts`) | YES | — | w1 S20; tests |
| 10 | The Leave War's own row, manning, Available rows, day panel | the war's display row (`inSquadron`) | NO-because: the war's display follows the switch by his D283 — not changed | — | his row hatched "PO" with "+ SANS" off, in the SANS group with it on | w1 S1 (the host saw the grid) |
| 11 | The validator, the crew list, the SANS calendar | do not read the crowd | NO-because: none calls `availableFor` or `inSquadron` (searched) | — | — | the search; both readers' point 2 |

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

Two Opus walkers side by side, each in its own world, on the build of `100fa3bb7`; a desktop (Chromium 1536×864) and his
iPhone's size (WebKit 402×874, real taps), the browser's clock on Wed 15 Jul 26. Reports: `docs/handpass/parts/asp/w1-report.md`
(162 steps: 136 PASS, 0 FAIL, 10 RECORDED) and `w2-report.md` (200 steps: 139 PASS, 6 FAIL — one fault, S23 — 36 RECORDED, 1 NOT
WALKED). The host opened the deciding pictures (§8). Every answer was the same at both sizes.

| # | The order | What the screen said | What the OIL said |
|---|---|---|---|
| S1 | Post Hex out as SANS (15 Jul) → name him on Sat 18 Jul's briefing → ALL AVAIL event → sign → Publish → another week and back → "+ SANS" on, off, on, off | Count 45, Hex in the window with his purple line, "+ SANS" off. After every switch: 0 pending, "SIGNED ORIG Ace Anvil Basher Bolt", 45, Hex in | FO* on Sat 18 Jul, unchanged throughout |
| S5 | From S1: the briefing taken off; switched both ways; put back by Undo | 2 pending, "Not yet signed"; 44, Hex out, both ways. Put back: 0 pending, the signed line back, 45 | FO* stays until an amendment |
| S6 | From S1: OIL Earn, Hex's earning on the event off → AL1 → on → AL2 | Hex stays in "Who's available" at 45 throughout | FO* → HO* (AL1) → FO* (AL2), the same both ways |
| S7 | A change waiting: the count from the board, the 👁 look, View-only Sched | The board: the working copy (44, no Hex); the Original and View-only: the published 45 with Hex | — |
| S2 | An Event input filed for ALL AVAIL, its OIL answered Yes; publish; both ways | Hex in the input's window before and after Publish; nothing pending either way | FO* |
| S16, S17, S20 | Two reloads; sign out and in; the member | The same 45 with Hex, 0 pending; the member has no ⚙, no posting control, no credit control | FO* |
| S8 | A posting dated tomorrow; before midnight; past midnight with the app open; reopened | Before: 44, Hex out, 0 pending, the same both ways (RECORDED — question (p)). After: 45, Hex in with his purple line, left open and reopened alike | — |
| S12 | S1 published, then "Undo post out" | "1 pending", "Not yet signed", four boxes empty, "Publish AL1"; the one line "Hex · SANS — yes → no"; the working crowd has Hex, no purple line, 45 (RECORDED — right: his puck on a published day changed, D186) | FO* still |
| S13 | SANS from Mon 13 Jul; Tue 14 Jul published with him named and behind ALL AVAIL; archive him | Tue: Hex still in the crowd (35), both ways; "1 pending", its one line "Hex · posted out — no → yes" (the briefing that names him — D327); no line about the crowd or OIL. Thu 16 Jul: 33 → 32, Hex out | not reopened |
| S3 | A new man, post-in Fri 17 Jul, SANS ticked, named on Thu 16 Jul | In the crowd, the same both ways (RECORDED — question (o)); also seen: the crew list offers him before his post-in date | — |
| S22 | Hex's briefing inside the event's hours | Out of the crowd, 44, both ways | — |
| S23 | ALL AVAIL on a duty desk, and on OFT sim seats | The desk's and a back seat's count doors open and list Hex, both ways. **FAIL, older:** on a sim's FRONT seat a press on the count chip arms the empty back seat instead — filed (q) | — |
| S28 | A posting with no chip chosen | "On 15 Jul: off the manpower, nothing else."; Hex out, 44, both ways | — |
| The plain-user round | The posting sheet, the war's Settings, the ALL AVAIL window, OIL Earn — each opened and closed by ✕, Escape and a tap outside | Each opened and closed as it should; nothing left behind | — |

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

462 settled pictures and 684 taken within about 100 ms of a phone tap, under `docs/img/handpass/2026-11-22-allavail-sans-posted/`
(`w1/<run>/`, `w2/`, `w2/taps/`). Opened by the host:

- `w1/s1-desktop/05-s1-05-board-availwin-desktop.png` — the board on Sat 18 Jul, "+ SANS" off: "Who's available 45", Hex among the 17 WSOs.
- `w1/s1-desktop/10-s1-09-lw-fo-desktop.png` — the Leave War: Hex's row hatched "PO" from 15 Jul, FO* standing on Sat 18 Jul.
- `w1/s2-phone/11-s2-07-on-availwin-phone.png` — his iPhone's size, "+ SANS" on: the Saturday still ORIG, "SIGNED ORIG Ace Anvil Basher Bolt", Hex in the window with his purple line.
- `w2/s13-s13-06-tue-on-win-desktop.png` — Tue 14 Jul after his archive: ORIG, "1 pending" (the briefing naming him), "Who's available 35" with Hex.
- `w2/s23probe-chip-crop-desktop.png` — the sim seat's count chip beside the empty "+" box (the filed (q)).

## 9. The break tests

The fix was built red-first, so each wired answer has a test that fails without it: commit `2785b1463` holds the first
five failing on `main`'s code (the crowd, the FO, the published day's pending count, the switch, the hand untick), and
three more failed on the first fix before the second (`F1` twice, `F2`) — run and seen by the host each time. The
filed fault (m) stands in the suite as `it.fails`.

## 10. Errors seen

None in any final run of either walker: no console error, page error, failed request, 4xx or native dialog. Each walker's
own script mistakes (nine in all) are listed in its report, each fixed and its scenario walked again from the start.

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
- **Within S23:** the passenger and extra-person lines, and ALL in place of ALL AVAIL — one calculation behind every landing
  (`HOOKS.oilSentinel`); a desk, a sim back seat and the Common Programme were walked. **Within the plain-user round:** dragging
  the ALL AVAIL window on a phone — the test browser makes no touch drag; the desktop drag passed.
- **The third fix** (R9) was not walked: it changes only a SANS man who also holds a posting that is not a SANS one — no
  scenario's state — and is carried by its two tests.
- **S27** (another squadron's schedule in view): filed as (n) — a fault of its own in the two-squadron work, found by
  both readers, not this fix's to walk.

## 12. The gate counts

On his PC (the repo is public — D1086): `src/leavewar/allavail-sans-posted.test.ts` 20 passed, 1 expected fail; the 76 test files
that touch the crowd or postings 1,695 passed; `npx tsc -b` clean; the code check "no new finding". GitHub's run of pull
request 825: green on `2a69462f9` and on `100fa3bb7`; the run on the last pushed commit is named in the closing report.

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

## 15. Round 4 — his D2328 (the post-in date) and D2329 (a SANS posting set ahead), chats 141 and 146

**Tier: FULL** — the same eight answers as §1: OIL (who the crowd counts decides it), the published record (a crowd frozen
at publication), saved data (the delete now keeps a man's post-in date; a SANS stretch carries a posting's mark), the
warning list (the day's SANS reader every check asks now sees a posting set ahead). **What changed:** (1) D2328, chat 141
(`1f3e52eb4`): before his post-in date a man is not ours, a SANS man named on our programme included; (2) the fresh Opus
reader's R1, chat 141 (`34767a739`): a man posted out as SANS, archived and restored with a later post-in date keeps
the days he flew with us; (3) Astra's read of (1), chat 146 (`36e2e4728`): findings 2 and 3 fixed red-first (below);
(4) D2329, chat 146 (`ecdac3ebc`): a SANS posting set ahead is read by the day — the day's SANS reader asks the Leave
War for a SANS posting not yet run, so every screen reads such a day alike and a day published before the posting runs
keeps its face when it does.

**Sizing (§7.0):** the walk is the crowd on a day before and after a post-in date (w3, done on (1)); his own D2329
example, both sizes, with a published Saturday carried across the clock moving to Friday; the restore of (2) on a
published day; a delete before arrival; the plain-user round on the posting sheet and the window (w4). Repeated cases of
these routes — each posting outcome, each switch position, Undo / moved / another outcome — are carried by tests
(`allavail-sans-posted.test.ts` §D2329, `d2328-read.test.ts`, `d2328-astra.test.ts`). Lessons of §7.11 checked in
w4's brief: a press asserted by what the screen shows (the window's own pucks, not a count alone); a set-up step read
back; the published face compared before and after a clock change, not inferred.

**Walker w3 (Opus), on the build of `1f3e52eb4`** — `docs/handpass/parts/asp/w3-report.md`, pictures `…/w3/`: six
scenarios, all PASS (Quokka out on Thu 16 Jul: 21; in on Sat 18 Jul: 46; S1 and S13 as first walked). **The host opened
its four deciding pictures** (`r41-r41-05-off-win-desktop`, `r41-r41-05-on-win-phone`, `r41-r42-03-off-win-desktop`,
`r41-r42-03-on-win-phone`): Thu 16 Jul's window, 21, no Quokka, desktop and phone; Sat 18 Jul's, 46, Quokka with his
purple SANS line, desktop and phone — as w3 reported.

**Astra's read of (1)** (`D:\raptor-work\c141-astra-d2328-read.md`, read only, blind; brief `…-read-d2328-brief.md`):

| # | The claim | Reproduced by the host | Disposition |
|---|---|---|---|
| A1 | Restored after a SANS posting and an archive, he leaves the days he flew with us | already the fresh reader's R1, repaired in (2) (`d2328-read.test.ts` R1a, R1b) | **Fixed in (2)**; the repair since narrowed by A3's fix |
| A2 | A man deleted before he ever arrived counts on the days before his post-in date — his saved post-in date went with the delete; for a SANS man only with "+ SANS" on at the delete | YES — 3 tests failed (`d2328-astra.test.ts` "ASTRA 2") | **Fixed red-first**: the delete keeps his post-in date alone (`store.ts arrivalKept`, both delete paths); two older tests that pinned "no record kept" changed with the reason beside them |
| A3 | A returning man (Overseas, restored to return later, ticked SANS) archived again before his return counts on the days he was away — the archive's end replaced by the archive's date filled a real gap | YES — failed with "+ SANS" on at the archive; and the host found the same shape in (2)'s repair: a hand tick begun the day his Overseas posting ran, later taken off, filled the gap too (1 more test failed) | **Fixed red-first**: the blanket replacement removed; a SANS stretch a posting made is marked when an archive ends it, and only such a stretch, begun the day after a stint's written end, counts as days he flew with us |
| A4 | Tests missing: the exact post-in date; a delete before arrival each way | — | Added (`d2328-astra.test.ts`) |

**Round 4b's reads** of `1f3e52eb4..6d135301a` (brief `…-read-r4b-brief.md`; Astra `D:\raptor-work\c146-astra-r4b-read.md`; the
fresh Opus reader's report in chat 146, its proofs copied into `d2328-r4b.test.ts`), each blind to the other and the walk:

| # | Who | The claim | Reproduced | Disposition |
|---|---|---|---|---|
| B1 | both | A man SANS by hand when his SANS posting runs (or unticked and re-ticked after it) gets no posting mark; an archive drops him from the days he flew with us | YES — 3 failed | **Fixed red-first** (`8c16a3c47`): the archive writes the posting's days from his saved posting (`sanPo`); the `'po'` mark gone. The reader's "nothing pending" narrowed to D327 (a named man's archive reads 1 pending; crowd and OIL unchanged) |
| B2 | Astra | A hand tick the day of a restore folds the posting's stretch away — the same loss | YES — 1 failed | **Fixed** by B1's change |
| B3 | both | The next-week preview's key misses a SANS posting set ahead | YES — 2 failed | **Fixed**: `sansSig` includes it |
| B4 | Opus | On a day SANS only by a posting not yet run, the crew list strikes him "no availability filed", which nobody can file before it runs (D2327) | seen in w4's `run2/w1-w1b-03-board-desktop.png` (Hex greyed under "SANS AVAIL · 0 FREE") | **Put to him** with the preview link — recommended: no strike on such a day |
| B5 | both | Checked right: the post-in date kept at a delete; the look-ahead's crowd; each outcome; the switch both ways; the kept record's other readers | — | Recorded |

**Walker w4 (Opus), on the build of `ecdac3ebc`** — `docs/handpass/parts/asp/w4-report.md`, pictures `…/w4/run2/`, `…/w4/run3-w3x/`:
W1 (his example) desktop and phone — Sat not named out (44), named in (45, his puck already wearing the purple line on Wed);
W1b — published Sat: 0 pending, "SIGNED ORIG", 45, "FO*"; the clock moved to Fri 17 Jul and reloaded: the same, both switch
positions; W2 (a clash) out; W4 (Kiwi deleted before arriving) out before and after, 23 unchanged; the plain-user round
passes. **17 FAIL lines were the brief's, not the app's:** the event's hours clashed with Hex's own demo flights (Thu RU BFM
16:45; Tue VL BFM 08:40) — the host opened `run2/w1-w1-03x-thu-crew-desktop.png` (Hex greyed, tasked); at clear hours he is
in (Thu 08:00–10:00: 40; Tue, `run3-w3x`: in before, after the archive and after the restore, 35 each way). **The host
opened** `run2/w1-w1b-03-board-desktop.png`: Saturday after Friday came — signed ORIG, no conflicts, 45. **B1's fix came
after this walk:** the archive and restore of `run3-w3x` are to be walked again on the new build.

## 16. Round 5 — the Fable read's F1, and his D2338 (the look-ahead SANS note and the man's bell line), chat 147, the night of 22–23 Nov 26

**Tier: FULL**, the branch's riskiest (F1 changes who ALL AVAIL counts on a published day — money and the published record,
questions 1 and 2; D2338 adds a bell line, new words, a tap that opens a page and a new saved line kind the permissions
check lets through — questions 5, 6 and 7). **Rulings checked:** D2338, D2339, D2327, D2313, D2329, D27, D327, D25, D44,
D45, D1151, D1693, D1699, D1710, D1696, D2194, D200, D1411.

**Roll-call (the builder's, checked by the walk):** the look-ahead words print in two places only — the crew list's reason
(`ui/palette-html.ts whyOf`: Edit Schedule's crew panel and drawer, the Scheduler Board's crew list; unarmed a hover title,
armed printed under the struck name) and an armed seat's bar (`engine/avail.ts slotBar`) — HAS IT, one function
(`sansNoneWhy`). The Available panel (`ui/html.ts`) prints a count only — MUST NOT, by D2338's "crew list". The board's
"No SANS availability filed for this day." is the whole day's message — MUST NOT. The warning list raises nothing for
nothing filed — MUST NOT (by design). The bell: his own bell HAS IT; an admin's, another squadron's — MUST NOT (D2194).
The tap: the Inputs page's SANS tab — HAS IT.

**The five sizing lines.** (1) Types A (a new surface — the bell line), G (a rule's reading — who counts, F1), C (words).
(2) Only a walk finds: the words' fit at his iPhone's width, the bell line drawn and tapped at both sizes, the take-back
seen struck, midnight with the page open, the crowd unchanged on screen. (3) The ledger: walks of this branch found 0 in
the change in rounds 1–4 (two and three walkers). (4) Three Opus walkers side by side on `a203fc98c` under one hold of
the checks lock — w5 the note, the seat, the crowd, the published day (A1–A4, A10, A13, A16–A18, A20, A24); w6 the bell
line's life and its tap (A5–A9, A11, A12, A14, A15, A19, A21–A23); w7 the re-walk of B1 and the Fable fix (R1–R4) and the
plain-user round — Astra's 24 scenarios (`docs/superpowers/briefs/2026-11-22-d2338-scenarios-astra.md`), 1536 desktop and
402 iPhone (WebKit, by touch), the browser's clock on the demo week. (5) The ledger's row: added.

**The walks** (reports `docs/handpass/parts/sud/w5-report.md`, `w6-report.md`, `w7-report.md`; pictures: 3,934 taken, all
kept whole on his PC at `D:\raptor-work\c147-walk\pictures-all\`, 46 deciding ones here under
`docs/img/handpass/2026-11-23-sans-unfiled/`): w5 276 steps, 246 PASS, **2 FAIL**, 28 RECORDED; w6 464 rows, 364 PASS, 0
FAIL, 44 RECORDED, 2 NOT WALKED; w7 373 lines, 323 PASS, 0 FAIL, 34 RECORDED, 2 NOT WALKED. No console or page error, no
failed request, in any cited run.

**What it found, and each disposition:**
- **W5-F1 (fit-02, fit-03): on his iPhone, with a seat armed, the look-ahead note is one line running past the screen** —
  "…It can be filed from that day on th", the rest cut off (the host opened `w5/final/fit/fit-fit-02-clip-phone.png`).
  Cause (older, unseen until a long note): a SANS Avail row lays its entry out side by side with `flex:0 0 auto`, so the
  entry took its one-line width and could not shrink; the desktop board alone had the shrink rule (D1118). **Fixed
  red-first** (`17ab956fe`): the shrink rule at every width on both lists, the puck's width its floor; test
  `e2e/sans-unfiled-wrap.spec.ts` (phone at 402, 375, 320 on the board and Edit Schedule's drawer — red before; the desktop
  measured unchanged). **Re-walked by the host** on a fresh build of `664dddb39` (w5's own `sud-w5-fit.mjs`, WebKit 402 by touch
and desktop 1536): fit-02 and fit-03 PASS at both sizes, no errors; the host opened
`w5/refit-17ab/fit-fit-03-clip-phone.png` — the note on two lines inside the drawer, the notes above and below unmoved.
- **RECORDED, each against the rulings:** the working copy drives the line (a draft-only addition or removal on a
  published day moves it) — the agent's reading, like the crew list; a read line stays read when it shrinks (filed, taken
  off a day, a cancelled or ⓘ item) — as built, the builder's question to him; the line's days follow CX and ⓘ (out, and
  back on Un-cancel); after an archive or a Delete no struck line is kept (the line's maker, the posting, was not undone —
  the archive ends his filing; D1699 is about undo — the agent's reading); "SANS" tapped again on the sheet after it ran is a
  take-back (struck if read); the year's end reads "Thu 31 Dec, Fri 1 Jan", the tap opening December 26; the phone line is
  one entry, never more than three days named.
- **NOT WALKED:** the page hidden across midnight (the test browsers keep a background tab "visible") — on his iPhone look
  card; a press outside the tall phone day window (it fills the screen).
- **Phone, nothing armed (the builder's reading, confirmed by w5):** the crew list's note — the old one and the new one alike
  — is a hover title only, so a phone shows the struck name with no words until a seat is armed. Older, unchanged by this
  job — for the morning report.
- **Lead, not a finding (w6):** View-only Sched's week heading "Monday Jul 13 · Today" with the app's day at Fri 17 — not
  reproduced or judged; for a later look.
- **w7, RECORDED:** R2 (hand tick + SANS posting) cannot be posted from his cell with "+ SANS" off — he has no war row (D1215,
  D1221), walked through the SANS group; after R2's restore his row leaves the war ("+ SANS" off), the hand tick keeping
  him SANS (D2327) — as ruled; R4 (archived Mon 13): the published Tue keeps 35 with Vandal in and reads pending "SQN EVENT
  · who it stands for · Vandal → no longer free" — D327, D44.

**Reads (blind, three readers on `9ff8a917c`, then narrow re-reads of each fix round; every report saved under
`docs/superpowers/briefs/2026-11-23-d2338-read*`):** Astra, a fresh Opus reader and a security reader (D1411) each found
the same two holes — a forged "taken back" line (any days, any number, could break his bell) and a stored worked-out line
reading as the app's own — FIXED red-first (`53ffa626e`, the readers' own tests); his D2218 (the struck line follows him on a
move) FIXED there too; Astra #3 — a no-row man archived then RESTORED lost his earlier days in the crowd (D327) — FIXED
(`7611d8647`). The re-reads (Astra, security): made-up struck days on a real take-back, the read check trusting the
in-memory record, and a no-row man archived then DELETED taking back the gap — FIXED red-first (`f292ab846`; then the whole
unit suite PASS under the lock, 16,053). The last security read: all shut but one low opening across two commands that
rests on the older door filed as (u)(3). FILED: Astra #2 and the read-record doors (u)(1), (3), (4); Astra #5 (u)(2). FOR HIM:
(v) — a newly planned day after he read the line; a hand-ticked SANS man; the crew list's note with no seat armed (Astra #6).
Not walked again: the bell line's take-back gate and the crowd fixes after the walk — no screen changed (the struck line's
words are as walked); held by their tests.

## 17. Round 6 — the FULL check of the whole branch: his D2340 (filing ahead), D2341 (hidden on a day not SANS), D2342 (the bell's words), D2346 (the fade), chat 152, 23 Nov 26

### 17.1 The eight answers and the tier
**FULL.** (1) Money — YES: SANS availability hidden on a day decides who the SANS calendar counts as committed and who
the crew list lets fly (who counts as present). (2) The published record — NO change to the published face: a published
day's inputs are its frozen copy (`engine/inputs.ts inputsOn`'s FZ), which never asks the new check; a walk step confirms
it. (3) Saved data — YES: a new kind of saved bell line part (`sansback`'s hidden days), and records kept but hidden by
the day. (4) A shared drawer — YES: one reading asked by every day reader of the inputs. (5) A new gesture or mode — YES:
"+ Commitment" opens for a man before his SANS date. (6) A new surface — NO: the fade is a look on an existing cell, the
bell line an existing kind. (7) Roles — YES: who may be filed for (himself, an admin) goes by the day filed. (8) The warning
list — YES: who a seat's SANS gate passes. Security read owed (D1411): who may file for whom.

### 17.2 The rulings that apply — each checked against the running build
D2340, D2341, D2342, D2343, D2346, D2338 (narrowed), D2327 (narrowed), D2313, D2329, D2328, D1693, D1699, D1710, D2194,
D350, D655, D576, D1151, D25, D27, D327, D785, D56, D1411. Results:
- **D2340** (filed ahead, by the day filed) — PASS after the fixes: w8 S1-03, S1-05, S2-01, S2-02, S2-03 (refused), S3-01–S3-04,
  S4-01, S4-06, S23-01–06; the six run-across-the-date routes FAILed in w8 (s4-02–s4-05 both sizes) and PASS in r1 w81-01–w81-05.
- **D2341** (hidden on a day not SANS) — PASS after the fixes: w9 S6–S10 every reader, both sizes; w10 S12 (s12-05…s12-14), S13,
  S14, S18, S22; the shared line's "for 2 people" FAILed (w10 s12x-05) and PASSes in r1 w101-06; the schedule's SANS panels for a
  shared offer — tests (§17.3 R12, R13).
- **D2342** (the bell's words) — PASS: w8 S15-02, S15-05, S17-01, S17-03, S17m-01, S17m-02; w10 s161u-05 … s164r-05.
- **D2343, D2346** (the fade beside the guardrail) — PASS: w8 S1-01, S1-02, S2-00, S19-01–S19-07, S20-01–S20-06, S21-00–S21-03.
- **D2338** (narrowed) — PASS: the look-ahead words on Edit Schedule's and the board's crew lists (w8 PU-16, PU-17); the bell
  line from the save (w8 S15-02).
- **D2327** (narrowed) — PASS after the fix: the Highlight list now offers a man posted out as SANS ahead (r1 w82-01, w82-05);
  w8 S19-02, S19-07 had no such man to pick.
- **D2313** (SANS from its date, every screen) — PASS: w9 the crew lists and seats day by day (s6-B-week-17 … s9-E-board-23);
  w8 S21-00–S21-03.
- **D2329** (a posting ahead read by the day; ALL AVAIL) — RECORDED as expected: ALL AVAIL follows his dated status, never the
  hidden offer (w9 *-aa-* rows, its R5; w10 s11-06c … s11-24c).
- **D2328** (the post-in date) — PASS: w9 s10-10 (restored with post-in Wed 22).
- **D1693, D1699, D1710** (a bell line taken back) — PASS on the built rule: an unread line simply goes (w10 s161u-08, s161r-08);
  a read one struck, "taken back · Saber" (w8 S17-07–S17-09; w10 s162u-08, s164u-08). Two readings for him: questions (6), (7).
- **D2194** (no bell line to the wrong people) — PASS for an admin's bell (w8 S15-01, S15-09); another squadron's people not walked.
- **D350** (what Undo does not take back) — PASS: the posting comes back by its sheet's "Undo post out" (w9 s7-05, w8 PU-11); the
  Quals tick by the top bar's Undo / Redo (w9 s9-09, s9-10).
- **D655** (who files for whom) — PASS: w8 S23-01–S23-06 (a member files his own only; the shared offer read only for him).
- **D576** (SANS filed on the SANS calendar only) — PASS: w8 S5 (no SANS Availability in "+ Input"'s Type list, four doors);
  w9 *-inputs (no Inputs list row).
- **D1151** (the notifications register) — not walked: a document.
- **D25, D27** (OIL; ALL AVAIL a scheduling count) — RECORDED: the crowd that earns OIL follows his dated status (w9 R5;
  w10 s11-*c); no OIL figure was read in this round.
- **D327** (an archived man) — PASS / RECORDED: w9 s10-08–s10-10b; w10 s11-23, s11-24 (out of the crowd, 39); w9 R3, R4 older.
- **D785** (a scheduler is an admin) — PASS: every walker's scheduler was Saber, an admin.
- **D56** (stored demo data) — applied to w9 R1, the reminder line's lead: question (9).
- **D1411** (a security read) — done: `docs/superpowers/briefs/2026-11-23-sans-ahead-full-read-security.md` (S1–S4, §17.14).

### 17.3 The roll-call — every place that reads SANS availability, or who may file it
| # | Surface | SHOWS the new rule | The gesture USABLE | What else is PAINTED there | Proved by |
|---|---|---|---|---|---|
| R1 | SANS calendar — the month's committed counts, colours, still-needed pair (`state/flyplan.ts sansCommittedOn`, per man per day) | YES — a hidden man's letters leave the count (F/O/A 1 0 → 0 0) and come back | YES — filings by "+ Commitment" and a drag add to it | YES — the other men's figures and the still-needed pair as before | w8 S1-04, PU-14; w9 s6-A/B/C-month-*, s9-*-month-*; w10 s12-05b … s12-13b; r1 w101-06, w101-09 |
| R2 | SANS calendar — the Highlight ring and underlined letters for one man (`sansMine`) | YES — rings exactly his filed days (18, 20), Hex's (21) | YES — picked from the list, cleared by No highlight | YES — Zulu (SANS today) still picks | r1 w82-03, w82-04, w82-05, w82-06; w8 S19-07 |
| R3 | SANS calendar — the Highlight list of men (`sanscal-model.ts sansRoster`: today's tick only) | YES after the fix — Ranger and Hex offered before their dates (w8 had no such man: W8-2) | YES | YES — every man SANS today still listed, nobody twice (14 entries) | r1 w82-01, w82-05; `sans-ahead-walk152.test.tsx` |
| R4 | SANS calendar — the fade on his own days before his date (D2346) | YES — his own 1–16 faded (no wash, figures .38, no stripes, "Before your SANS date."); Saber's unfaded | YES — the faded day still opens; "+ Commitment" greyed there | YES — the figures read the same for him as for Saber | w8 S1-01, S2-00, S19-01–S19-07, S20-01–S20-06, S21-00–S21-03; `sans-before.test.tsx` |
| R5 | SANS calendar — the opened day's list of who committed (`sansDayGroups`) | YES — a hidden offer absent from every group; a shared offer shows the other man only, his line "Saber for Hex" after the fix | YES — a line opens its window (w10 s12x-06, r1 w101-07) | YES — "SANS committed to fly" agrees with the month | w8 S1-04; w9 s6-B-day-17 … s9-E-day-23; w10 s12-07a, s13-04-*, s14-08a, s18a-05; r1 w101-06 |
| R6 | SANS calendar — "+ Commitment" for himself, on a day before / from his date (`sansadd.ts maySansAdd`) | YES — greyed before his date, offered from it | YES — saved as his, no Person box | NO — because the greyed button's reason reads "SANS aircrew add their availability here.", not his date: question (4) | w8 S1-02, S1-03, S19-06-16/17/20, S20-03, S20-04, S23-02 |
| R7 | SANS calendar — an admin's "+ Commitment" for him, for several SANS men (the people picker's SANS group, `peoplepick-model.ts`) | YES — Ranger offered from 17, Hex from 20, never before | YES — saved for one man and for two | YES — the picker's groups (Ranger under Pilots, Hex under WSOs) | w8 S2-01, S2-02, S3-02–S3-04, S5-saber-17, S5-saber-20; r1 w82-02-* |
| R8 | SANS calendar — a drag across days, part before and part after his date | YES after the fix — refused whole with "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" (w8: silent, W8-1) | YES — a drag 17→20 saves | NO — because Saber's drag over 16–18 offers no Ranger and says nothing (w8 s4s, RECORDED) | w8 s4-01–s4-08 (FAIL s4-02–s4-05); r1 w81-01–w81-05; `sans-ahead-walk152.test.tsx` |
| R9 | The input window's save — accepted with at least one SANS day, refused with none (`inputedit.tsx`) | YES — as built, refused if ANY day is before his date (question (1)); the final save now refuses for every role (Astra #3) | YES — a refusal keeps the window and what was typed | YES — an overlapping second offer refused, the first unchanged | w8 S2-03, S3-01, S3-01b, S4-06; w10 s13-06, s13-09, s13-10; `sans-review-regressions.test.ts` |
| R10 | The Inputs calendar's month and day (`InputsCal.tsx`) — MUST NOT show SANS availability at all (SANS is filed on the SANS calendar only, D576) | YES — must not, because D576: the day draws his Appointment only ("1 drawn") | YES — "+ Input" offers no SANS Availability | YES — his ordinary input shown once, hidden or not | w10 s14-06b, s14-08b, s14-10b; w8 S5-ranger-cal, S5-saber-cal |
| R11 | The Inputs list (`InputsPage.tsx`) — MUST NOT list SANS availability (D576) | YES — must not: no row for a SANS filing at any stage | YES — "+ Input" offers no SANS Availability | YES — his ordinary inputs listed | w9 s6-A/B/C-inputs … s10-C-inputs; w8 S5-ranger-list, S5-saber-list |
| R12 | Edit Schedule — the SANS Avail crew panel (`ui/html.ts`, `inputsOn`) | YES — one man's hidden offer: not under SANS Avail; a shared offer with one man hidden: FIXED (Opus F1, Astra #1) | NO — because no gesture: a panel | YES — the other man stays under SANS Avail | w9 s6-B-week-17 … s9-E-week-23; w10 s12-07c, s14-08d; `sans-ahead-opusread.test.ts`, `sans-ahead-security152.test.ts`; host re-look, chat 154: PASS at both sizes on the live day (`scripts/handpass/sah-h154.mjs`, D:/raptor-work/c154-look/run2, h-04/h-06/h-08 weekpanel); the published face NOT yet — re-read R1 = Astra's re-read #2, open |
| R13 | The Scheduler Board — the SANS availability panel (`ui/board-html.ts`, `inputsOn`) | YES — as R12 (Opus F1, Security S2) | NO — because no gesture: a panel | YES — the other man stays | w9 s6-B-board-17 … s9-E-board-23; w10 s12-07d; `sans-ahead-opusread.test.ts`, `sans-ahead-security152.test.ts`; host re-look, chat 154: PASS at both sizes on the live day (h-04/h-06/h-08 boardpanel); the published face NOT yet — as R12 |
| R14 | The crew list's struck SANS man and his note (`palette-html.ts whyOf`, `avail.ts sansNoneWhy`) — the words of D2340 | YES — "SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab."; gone once filed; hidden, an ordinary pilot | YES — he can be picked as any man | YES — the badge "F/O/A" while shown | w8 PU-15, PU-16, PU-17; w9 *-week-*, *-board-* |
| R15 | An armed seat's bar and the SANS gate (`avail.ts slotBar`, `sansGate`) — passes him only on a shown day | YES — "SANS — not offering Fly", "SANS — available 09:00–10:00 only" while shown; nothing while hidden; back after | YES — out of his hours he still lands, with a warning (as built before) | YES — the seat's other men unchanged | w9 s6-A/B/C-seat*, s7-*-seat*, s8-*-seat*, s9-*-seatAB1, s10-*-seatAB1; w10 s12-05e … s12-13e, s22-04-* … s22-12 |
| R16 | ALL AVAIL's count and window — unchanged by filing or hiding (D2329) | YES — membership follows his dated status, never the hidden offer (44 / 45 / 44) | YES — the window opens from its count | YES — the count changes only with the posting itself (40 → 39 off the manpower or archived) | w9 *-aa-* (RECORDED, its R5); w10 s11-06c … s11-24c (RECORDED) |
| R17 | The warning list (`validate.ts`) — a SANS man seated on a day his filing is hidden | YES — no warning rests on a hidden offer; the same warnings before and after | YES — a warning opens as before | YES — his demo flights' own warnings unchanged | w9 *-warn (RECORDED, its R6); w10 s22-05, s22-08, s22-11 |
| R18 | His bell — the SANS-days line (D2340, D2342: from the posting's save, shrinking, gone, its tap) | YES — "You're SANS from Fri 17 Jul. You're planned on Sat 18, Mon 20, Thu 23 Jul with nothing filed. Tap to file.", shrinking, gone, "and 2 more" | YES — its tap opens the SANS calendar on the first day | NO — because the line comes only once the week of his planned days has been saved (w9 R1, r1's lead): question (9) | w8 S15-01–S15-09, S17-01–S17-05, S17m-01–03, S20-05; w10 s162u-05/06; `sans-ahead.test.ts`, `sans-unfiled.test.ts` |
| R19 | His bell — the hidden-days line written by the posting's take-back (D2341), read and unread | YES — "Your SANS availability for Fri 17, Sat 18, Sun 19 Jul is hidden while you're not SANS those days." | YES — its tap opens the SANS calendar (Mon 20 not Sat 18 in w10 v4 — a lead) | NO — because it strikes a line he never read, today's days not the ones he read (question (7)), and stays once the day is SANS again (question (6)) | w8 S17-07–S17-09; w9 s6-B-bell, s8-B-bell, s8b-B-bell; w10 s161u-08 … s164r-10, s18a-07, s18a-12; `sans-review-regressions.test.ts`, `sans-ahead-opusread.test.ts` |
| R20 | An admin's bell, another squadron's people — MUST NOT (D2194) | YES — must not: Saber's bell holds no line of Ranger's | NO — because nothing to press | YES — Saber's own lines as before | w8 S15-01, S15-09; `sans-unfiled.test.ts`; another squadron's people NOT WALKED — one squadron in play, no test named |
| R21 | The published day's face — MUST NOT change (its frozen copy) | YES — must not: View-only Sched unchanged by all five causes; a NEW copy published while hidden now drops the hidden man (Astra #1) | YES — "Publish AL1" works while hidden | NO — because the working copy reads "2 pending", "Not yet signed" (correct by D178: question (8)) | w10 s11-06b … s11-24b, s11-06d … s11-25; `sans-ahead-security152.test.ts` |
| R22 | The changes window — a hidden record's history lines stay (history, not a reader of the day) | YES — the filings listed as inputs, "added" and "deleted" | YES — it opens as before | YES | w8 PU-19 (RECORDED); a hidden record's lines NOT WALKED on a hidden day — not recorded |
| R23 | The Leave War — his row, the Post out sheet (the cause: move later, Undo post out, another outcome) | YES — each cause hides and its reverse brings back the one record | YES — the PO-from date box, "Undo post out (PO)", the "✓ SANS" chip tapped off and on | YES — the sheet's line "On 20 Jul: becomes SANS." / "off the manpower, nothing else"; no PO on his row after the undo | w9 s6-04, s6-05, s7-05, s7-05b, s8-05, s8-06, s8b-06, s8b-07; w8 PU-10-*, PU-11, PU-12, S21-01–S21-03; w10 s12-06, s11-05, s11-09, s11-13 |
| R24 | Quals — the SANS untick (a cause that hides, no bell line — the question for him) | YES — 20, 21, 23 hidden, 18 kept; Undo / Redo; a re-tick from 23 brings back 23 only | YES — ✎ Edit, the cell, Done | NO — because no bell line tells him (as built): question (3) | w9 s9-08–s9-12, s9-D-bell; w10 s11-19–s11-22 |
| R25 | Admin → Users — archive and restore (a cause that hides and returns) | YES — absent while archived | YES — Archive; Post in → Restore | NO — because after the restore he is not SANS, so the days stay hidden, and the archive reaches back to Sat 18 (w9 R3, R4 — older, outside this change) | w9 s10-08–s10-10b, s10-C-*; w10 s11-23, s11-24 |

### 17.4 The door check
Every action the data allows, and its control:
- He files his own from his date: the SANS day's "+ Commitment" (w8 S1-03), a drag across days (S4-01), the keys from a day,
  Shift + arrows, Enter (desktop; r1 w81-03, w81-04), the bell's tap then "+ Commitment" (S15-04).
- An admin files for him, or for several: "+ Commitment"'s Person box (S2-01), Several people (S3-02), a drag (s4s-01).
- A day before his date: refused at every door — "+ Commitment" greyed on the faded day (S1-02, S19-06-16); a drag or keys
  over it, refused with words after the W8-1 fix (r1 w81-01–w81-04; silent in w8); the window's start moved back (S2-03,
  S4-06); Saber's drag over 16–18 offers no Ranger, no words (s4s, RECORDED).
- Edit or delete a filing: opened from a day it shows (w10 s13-06; w8 PU-09); a member opens another man's, read only (S23-05,
  S23-06).
- No door by design: the Inputs page's "+ Input" (D576 — w8 S5, four doors); a member for another man (S23-02).

### 17.5 The five sizing lines (the order's §7.0)
1. **The type of change:** A (the hiding — one shared reading of the day), C (filing ahead — "+ Commitment" opens before his
   date), G (saved data — the take-back's hidden days, the publish path), H (who may file for whom), with E (the fade) and F
   (the bell's words).
2. **What only a walk could find here:** that every reader of SANS availability (§17.3) is wired to the one reading through
   the real controls — the posting's own sheet, Quals, Admin → Users, a drag, the keys, the bell's tap — at both sizes; that
   a refused gesture says why; the fade at midnight with the page open.
3. **What the ledger says:** this branch's rounds found 0 (chat 141) and 1 (chat 147) faults in the change; round 5's three
   Opus walkers cost about 1.5M.
4. **The walk chosen:** three walkers side by side on `ddd8c4a44` (code `d24e2406f`), under the host's hold of the checks lock
   — w8 filing ahead, the fade, the reminder line (S1–S5, S15, S17, S19–S21, S23 and the plain-user round); w9 the hiding
   cause by cause with Astra's reader sweep (S6–S10); w10 hiding across publication, shared filings, edits, the take-back
   line (S11–S14, S16, S18, S22); desktop Chromium 1536×864 and his iPhone's WebKit 402×874 by touch, the clock Wed 15 Jul 26
   09:00; S24 (timing) a helper of its own; then r1, the re-walk of the three walk fixes on `bde8ef0a0`.
5. **After the walk:** its row in `docs/walk-ledger.md` — to add.

### 17.6 The orders walked — what the screen said and what the counts said
Reports: `docs/handpass/parts/sud/w8-report.md`, `w9-report.md`, `w10-report.md`, `r1-report.md`. Every answer the same at both
sizes unless said.
- **S1** Ranger files 17 and 20 for himself — saved as his; 16 faded, "+ Commitment" greyed; the month's F 0 0 → 1 0. PASS.
- **S2** Saber files him on 17 and 20 — saved; a draft moved to 16 refused "Ranger is SANS from Fri 17 Jul: file SANS
  availability for days from then", nothing saved. PASS.
- **S3** Several people, different dates — moved to 17 refused naming Hex's 20; Hex taken out, saved for Ranger alone; the
  picker offers Hex from 20 only. PASS.
- **S4** a run across his date — the window's changed start refused with words (PASS); drag and keys, both ways: no window,
  nothing saved, no words — **6 FAIL** (W8-1); after the fix the amber note, nothing saved (r1, 6 routes PASS).
- **S5** the Inputs doors — no SANS Availability in "+ Input" (four doors); a man with no SANS status: "+ Commitment" greyed.
  PASS.
- **S6** posting moved 17 → 20 — 17, 18, 19 hidden on every reader, 20 and 21 kept; moved back, all five back, one record.
  PASS.
- **S7** "Undo post out" — 17 and 20 hidden, the seats' SANS reasons gone; posted again, all back. PASS.
- **S8, S8b** the "✓ SANS" chip tapped off (before and after the posting ran) — hidden; tapped on, back. PASS (the control
  RECORDED).
- **S9** Quals untick on Mon 20 — 20, 21, 23 hidden, 18 kept; Undo, Redo; a re-tick from 23 brings 23 only; no bell line. PASS.
- **S10** archive on Mon 20, restore Wed 22 — hidden while archived; after the restore not SANS, so still hidden (R3); Sat 18
  reached back (R4). PASS / RECORDED.
- **S11** every cause after Fri 17 published — the published face unchanged (PASS); the working copy "2 pending", "Not yet
  signed", "1 input change" (RECORDED: question (8)); AL1 published while hidden drops his SANS mark, ALL AVAIL 39.
- **S12** a shared offer, one man hidden — five stages × six readers PASS; the line's "Saber for 2 people" and its window
  naming Ranger — **4 FAIL** (W10-1); after the fix "Saber for Hex" (r1 PASS); the window still names both (the agent's
  reading, told to him).
- **S13** an offer partly hidden, edited from Mon 20 — saved, its dates kept; back, each day shows it once with the edit; a
  second offer on 20 refused. PASS.
- **S14** others' ordinary inputs — Ranger's Appointment and Hex's offer untouched by the hiding. PASS.
- **S15** the early bell — the line from the save, its tap on Sat 18, shrinking as he files, gone; Saber's bell none. PASS.
- **S16** read and unread take-backs, before and after the posting ran — unread goes; read struck "taken back · Saber"; the
  hidden sentence names 18, never 20. PASS; the struck heading of a line never had and the tap to Mon 20 RECORDED.
- **S17** longer lists — "and 2 more"; a newly planned day keeps the read line read (RECORDED); the take-back strikes today's
  words (RECORDED: question (5)); across months each month once. PASS.
- **S18** hide and return, reloads and sign-out — hidden, back with its first details, one record; the "hidden" line stays
  after the return (RECORDED: question (6)). PASS.
- **S19** the fade is his own — his 1–16 faded, Saber's none, the figures the same. PASS.
- **S20** midnight with the page open — the fade gone at 00:00 with no reload; "+ Commitment" opens on 17. PASS.
- **S21** the date moved earlier, later, undone — the fade follows each. PASS (the other-tab case not walked).
- **S22** a restored offer's hours and activities — the seats' reasons as before; hidden, none; back, the same warnings.
  PASS.
- **S23** permissions — a member files his own only; the shared offer read only for him. PASS.
- **The plain-user round** (w8; r1 for each fix) — the bell, the SANS day, the commitment window, the posting sheet, each
  opened and closed every way; the SANS month, both crew lists, View-only Sched and the changes window show the result. PASS
  (the tap outside the SANS day and the sheet RECORDED).
- **Counts:** w8 249 rows — 208 PASS, 6 FAIL, 20 RECORDED, 10 NOTE, 5 NOT WALKED; w9 876 — 702 PASS, 0 FAIL, 118 RECORDED, 50
  NOTE, 6 NOT WALKED; w10 615 judged — 555 PASS, 4 FAIL, 56 RECORDED (37 notes besides); r1 105 — 89 PASS, 0 FAIL, 4
  RECORDED, 10 NOTE, 2 NOT WALKED. In all: 1,554 PASS, 10 FAIL (two faults, both fixed and re-walked), 198 RECORDED, 13 NOT
  WALKED.

### 17.7 The cases carried by a test
Each calls the app's writers and readers directly; none stands in for a walked route.
- `src/leavewar/sans-ahead.test.ts` (19) — D2340: filed ahead by him and by an admin, a day or run before his date refused,
  the people lists, the bell line from the save, its words, shrinking; D2341: hidden not deleted and back, the take-back, its gate.
- `src/leavewar/sans-before.test.tsx` (6) — D2346: the fade, his own only, gone from the date and with the posting.
- `src/leavewar/sans-unfiled.test.ts` (30), `sans-unfiled-reload.test.ts` (1) — D2338: the look-ahead words, the bell line,
  nothing on an admin's bell, the take-back read and unread, the permissions gate, the struck line after a reload.
- `src/leavewar/sans-ahead-walk152.test.tsx` — W8-1 (a run before his date says why), W8-2 (the Highlight list), a past SANS
  stretch accepted, W10-1 (the shared line names only the shown man).
- `src/leavewar/sans-ahead-opusread.test.ts` — Opus F1 (no card for the hidden man), F2a–F2c (another man's entry excuses
  nothing; the window; the swap), his own entry kept; F4 kept failing on purpose (`it.fails`, question (6)).
- `src/leavewar/sans-ahead-security152.test.ts` — S1 (another man's offer, a record of another kind), S2 (the board's and the
  week's SANS panels, one man's lookup), S3 (his own-row back-dating refused; his own Quals tick and its Undo / Redo pass), a
  new frozen copy holds only the shown man.
- `src/leavewar/sans-review-regressions.test.ts` — Astra #1 (a shared Saturday), #3 (the final save), #4 (a newly added man),
  #5 (a past SANS day), #2 (a take-back not erasable by an input command); #6 kept failing on purpose (two `it.fails`,
  question (7)).
- Earlier rounds, unchanged: `allavail-sans-posted.test.ts`, `sans-from-date.test.ts`.

### 17.8 The pictures
146 deciding pictures in the repo under `docs/img/handpass/2026-11-23-sans-ahead/` — `w8/` 40, `w9/` 44, `w10/` 39, `r1/` 23;
the bulk on his PC under `D:\raptor-work\c152-walk\` — 5,448 pictures (w8 988, w9 2,372, w10 1,850, r1 238), every phone tap
pictured within about 100 ms in each run's `taps/`. Named in the reports' tables: w8 304, w9 2,196 (its cited folders), w10
778, r1 125.

### 17.9 The break tests
- w8 — runs across his date both ways, by mouse, keys and a held finger, as him and as Saber; a draft's date moved before it;
  a two-man draft moved before one man's date; the date moved earlier, later, undone; midnight with the page open.
- w9 — every hiding cause and its reverse, each read on ten readers; Undo and Redo of the untick; a re-tick leaving a gap;
  archive then restore.
- w10 — a shared offer through five stages; an edit while partly hidden, then a second overlapping offer; reloads and a
  sign-out while hidden; every cause after publication; seats inside and outside his hours.
- r1 — the six W8-1 routes; Highlight before and after filings; the shared line in three states.
- The fixes: each built red-first, its test failing before the fix (§17.7, §17.14).

### 17.10 Errors seen
None: no console error, page error, failed request or 4xx in any cited run of w8, w9, w10 or r1. The walkers' own script
mistakes are named in each report and re-run (w10's S12x clean-up pressed under an open window after its last step — the
script's, not the app's).

### 17.11 What was NOT walked, and why
- The page backgrounded across midnight (S20) — a test browser keeps a background tab "visible"; the page open across
  midnight was walked.
- The posting changed while Ranger's calendar stays open in another tab (S21) — two tabs do not share live changes; walked
  signing in as each in turn.
- The SANS day's pull-up bar on the phone (PU-06), and every finger drag in WebKit — WebKit gives no finger drag; the drags ran
  in Chromium at the phone's size; his iPhone's own hold and drag is a look for his card.
- The keys on the phone — no Shift + arrows there.
- His bell while archived (S10) — an archived man cannot sign in.
- His bell between the Quals untick and Undo (S9) — reading it signs out, which clears the Undo list (D148); read after Redo.
- S11's amendment published while hidden — after the last cause (archive) only; S11's restore after the archive — w9's S10.
- Another squadron's people (R20); a hidden record's history lines on a hidden day (R22).
- Nothing in Edge or on a real iPhone.

### 17.12 The timing promised in D2341
No difference a person would notice (`docs/handpass/parts/sud/timing-d2341.md`): desktop Chromium at 4× CPU slow-down, the
build before the hiding against the branch head, interleaved fresh runs, in the demo world (6 SANS records) and a stress world
(34 records, every SANS man every day of July and August). No measure slower beyond its spread; the board's day step leans
about 11 ms (paired), about 1 ms of script time at full speed, and did not grow with 5½ times the records. Not timed: the
phone, a posting set ahead, the Inputs calendar tab and the Leave War.

### 17.13 The gate counts
- **His PC, chat 155, on `a2a814564`:** the whole unit suite, under the checks lock — 1063 files, 16119 pass, 9 expected
  fail (the known failures kept on purpose for his questions), 21 skipped; the code check: no new finding.
- **GitHub's run on `a2a814564`:** green — "every gate passed": the build, the original's 728 passed and 0 failed, the unit
  shards, the browser shards (117, 138, 200, 204, 204, 204 and 300 passed), the Tracker's suite, the rule and document checks;
  the secrets scan and the Docs guard green.
- **His PC, chat 155, on `90d9a6f60` (re-read 2's fixes):** the touched suites — 105 files, 1465 pass, 4 expected fail;
  GitHub's run on it FAILED at the build (two lines of a reader's test file) — fixed in `c61ba8e60`, with re-read 3's
  fixes: the SANS suites 32 files, 383 pass; the build and the code check pass on his PC; GitHub's run on `c61ba8e60`: see
  the closing report.

### 17.14 What the walk and the reads found, and each disposition
Reads: Astra `docs/superpowers/briefs/2026-11-23-sans-ahead-full-read-astra.md`, the fresh Opus reader `…-full-read-opus.md`,
the security reader `…-full-read-security.md`.
- **w8 F1 (W8-1)** — a run of days starting before his SANS date did nothing and said nothing (6 routes) — FIXED red-first
  (`sans-ahead-walk152.test.tsx`); re-walked by r1 at both sizes, PASS.
- **w8's second (W8-2)** — the SANS Highlight list left out a man posted out as SANS ahead — FIXED red-first (the same file);
  re-walked by r1, PASS.
- **w10 W10-1** — a shared offer's "for 2 people" counted the hidden man — FIXED red-first (`bde8ef0a0`); re-walked by r1, PASS.
  The window it opens still names both men — the agent's reading, told to him.
- **Opus F1 = Astra #1, the panels part** — a shared offer's hidden man still drawn on Edit Schedule's and the board's SANS
  Avail panels — FIXED red-first (`sans-ahead-opusread.test.ts`). **Astra #1, the rest** — one man's lookup (`sansAvailOn`), a
  NEW published copy of the day and the "changed since issue" comparison held the hidden man — FIXED red-first
  (`sans-ahead-security152.test.ts`, `sans-review-regressions.test.ts`). **Security S2** — the same as Astra #1, fixed.
- **Opus F2 = Astra #4** — the save excused a day for ANY man in the record being edited — FIXED red-first. **Security S1** —
  the same, and a record of another kind excused it — FIXED red-first.
- **Astra #5** — a past day a man was SANS, his tick since taken off, could not be filed — FIXED red-first.
- **Astra #3 = Opus F8** — the SANS-date rule checked only in the windows, not at the final save — FIXED red-first: the final
  save now refuses a new day that is not one of his SANS days, for every role.
- **Astra #2** — an ordinary input command could delete his "SANS availability hidden" bell line — FIXED red-first.
- **Security S3** — a member's own-row command could back-date his SANS days — FIXED red-first; his own Quals tick and its
  Undo / Redo still work (test).
- **Security S4, Opus F6** — the permissions table in `docs/data-model.md` §11 out of date — FIXED (the document).
- **Opus F4** — after the posting is put back, the "hidden" bell line stays, untrue then (also w10 S18) — kept as a
  known-failing test; QUESTION for him (6).
- **Astra #6 = Opus F5 = w9 R2** (and w10 S16, S18) — the take-back line strikes "You're SANS from…" he never read, and
  today's days, not the ones he read — QUESTION for him (7); two known-failing tests.
- **Opus F7** — speed: the start-of-command note scans inputs per SANS-posted man — FILED (`OUTSTANDING.md`
  [FABLE-READ-FAULTS] (w)(1)); the timing found no difference a person would notice (§17.12).
- **w10 S11** — on a published day every hiding cause makes the working copy read "2 pending" and drops the sign-offs; the
  face unchanged — correct by D178; to tell him (question 8).
- **w9 R1, r1's lead** — the reminder line appears only once the week of his planned days has been edited or opened —
  QUESTION (9): check whether D56 (demo weeks never stored) covers it.
- **w9 R3, R4** — an archive drops his SANS status for good, and reaches back to Sat 18 — older, outside this change.
- **w10's lead** — the "hidden" line's tap opens Mon 20, not Sat 18 — a lead, not fixed.
- **Opus F3** — a run of days part before his date is refused whole, though he was told "accepted, the early days hidden" —
  question (1).
- **Re-read 1 of the fixes (chat 154; Astra `…-fix-reread-astra.md`, fresh Opus `…-fix-reread-opus.md`) — all FIXED
  red-first in chat 155 (`a2a814564`; `sans-c154-reread.test.ts`, `sans-reread154-opus.test.ts`):** an issued face dropped
  a SANS card once the man's posting moved (Astra #2 = Opus R1); a member's Undo / Redo of yesterday's own SANS tick refused
  (Astra #1; a forged restore still refused, R1c); a filing checked only for its first 400 days, the rest read as approved
  (Astra #3); deleting a man whose part of a shared offer was hidden refused (Astra #4); one posting move read 2 pending on
  the published day (the Opus open check, D109, D113). The host's re-look of the issued board at both sizes: 22 PASS, no
  errors (`scripts/handpass/sah-h155.mjs`; pictures `docs/img/handpass/2026-11-23-sans-ahead/h155/`).
- **Re-read 2 (chat 155; `D:/raptor-work/c155-reread/`) — all FIXED red-first (`90d9a6f60`; 9 tests,
  `sans-c155-astra.test.ts`, `sans-reread155-opus.test.ts`):** the delete's allowance judged a man in TWO shared offers
  against the wrong one (both readers); one take-out excused two fresh hidden filings of a member's (Astra #2); the walk ran
  past 9999 and an open-ended filing was walked ~2.9 million days (both); a long record shown only after its 400th day was
  hidden on the lists (Astra #3, the Opus note). **Left as is:** the per-man list of hidden days in his bell line stops at
  400 days ahead — words only, its writer and the gate's check share the one list.
- **Re-read 3 (chat 155; `D:/raptor-work/c155-reread3/`) — both readers found the same two, FIXED red-first (`c61ba8e60`;
  10 tests, `sans-reread3-opus.test.ts`, `sans-reread3-astra.test.ts`):** the day after 31 Dec 9999 slipped the walk's
  guard, so a record running to 9999 could not be edited, nor its man deleted, once his tick came off (a from-always man's
  save looped); a door that re-states a split copy's first day under the year on screen missed its own source. No fourth
  read: these fixes touch only where a walk over days ends and how one first day is compared, each pinned by both readers'
  own tests (the host's call). GitHub's run on `90d9a6f60` had failed at the build — two lines of a reader's test file,
  fixed.
- **To tell him (not a fault, D2340):** extending a shared offer by a day one of its men is hidden on is refused, so a
  hidden man blocks extending the other man's offer until he is taken out (question (f)).
- **Recorded, no disposition given here:** Saber's drag over 16–18 offers no Ranger and says nothing why (w8 s4s); the
  security reader's question — his own Quals tick (D149) makes him SANS from today, so he can file before his posting date.
- **Leads left as recorded:** the input window's calendar marks 13 Jul as today (D1383, the demo week); LATE on every filing
  made on 15 Jul (the cut-off as set); a SANS man still placed outside his offered hours with a warning (as built before this
  branch, w10 S22).
- **The questions for him:** (1) the run part before his date refused whole — D2340's reading; (2) [FABLE-READ-FAULTS] (v)
  1–3; (3) the Quals untick hides his filings with no bell line — keep?; (4) the greyed "+ Commitment" on a faded day says
  "SANS aircrew add their availability here." — could name his date; (5) w8 S17-07: the struck read line shows today's days —
  goes with (7); (6) Opus F4; (7) Astra #6; (8) w10 S11; (9) w9 R1.

## 14. The Walk line

**Round 6 (chats 152–155):** `Walk: docs/handpass/2026-11-22-allavail-sans-posted.md §17 · 5,448 pictures (146 kept here plus the host's 5 re-look pictures, all on his PC's D: drive) · 25 places in the roll-call (§17.3) · Astra's 24 scenarios and the plain-user round, each at a desktop's and his iPhone's size — 1,624 steps PASS (w8, w9, w10, r1, the host's two re-looks), 10 FAIL = 2 faults, both fixed red-first and re-walked · MISSING: 0 · read by Astra, a fresh Opus reader and a security reader, then three narrow re-reads of the fixes by Astra and a fresh Opus reader, every finding fixed red-first; NOT WALKED: the page hidden across midnight (his iPhone)`

**Round 5 (chat 147):** `Walk: docs/handpass/2026-11-22-allavail-sans-posted.md §16 · 3,934 pictures (46 kept here, all on his PC's D: drive) · 6 surfaces (Edit Schedule's crew list, the Scheduler Board's crew list, an armed seat, the bell, the Inputs page's SANS tab, ALL AVAIL's window) · 37 orders (Astra's 24 and R1–R4) and the plain-user round, each at a desktop's and his iPhone's size · MISSING: 0 (1 found, fixed red-first and re-walked); NOT WALKED: the page hidden across midnight (his iPhone)`

`Walk: docs/handpass/2026-11-22-allavail-sans-posted.md · 462 pictures (and 684 phone tap pictures) · 9 surfaces · 15 orders and the plain-user round, each at a desktop's and his iPhone's size · MISSING: 1 filed (q), older`

Carried by a test, not walked: the rows of §7. **What the walk found beside the change (older, filed):** (q) on the board, ALL
AVAIL on an OFT sim's front seat — a press on its count chip arms the empty back seat instead of opening the ALL AVAIL window
(walker w2, both sizes; one separate phone tap did open it; seen by the host in the walker's picture, not driven again).

## 18. Round 7 — the new SANS words and rules: his D2388, D2390, D2391, D2394, D2420, D2421, chat 156, the night of 24 Nov 26

### 18.1 The eight answers and the tier
**FULL.** (1) Money — YES: a run cut at his SANS date decides which days he counts as committed. (2) The published record — NO: a published day's inputs stay its frozen copy, and no line here writes to a day; a walk step confirms the face. (3) Saved data — YES: a run saved in part, a new stored setting per man and day (`sansplan`), a changed shape of the stored change line. (4) A shared drawer — YES: the bell's row and the passing note. (5) A new gesture or mode — NO: no new control, though an existing drag's result changes, and it is walked door by door. (6) A new surface — NO: new lines in the existing bell. (7) Roles — YES: a Quals command now carries a bell line through the permission gate's SANS check, which is tighter. (8) The warning list — NO: the crew and warning readers are untouched (D2420). Security read owed (D1411).

### 18.2 The rulings that apply
D2388, D2390, D2391, D2394, D2420, D2421, D2340, D2341, D2342, D2338, D1693, D1699, D1710, D2194, D350, D655, D576, D56, D785, D90, D2440, D2441, D1411. **A clash named (D90):** D2394's "no SANS date ahead" title over D2340's "the line's words stay the same after the date", the later followed, put to him as a question. **D2391 over D2390's "struck form keeps the same words" and over D1699 for this one line.** Results: to fill from the walk.

### 18.3 The roll-call — every place these words and rules are drawn or read
| # | Surface | SHOWS the new rule | The gesture USABLE | What else is PAINTED there | Proved by |
|---|---|---|---|---|---|
| R1 | His bell — the reminder, dated title and "Your SANS availability is needed." | to walk | to walk | to walk | |
| R2 | His bell — the change lines A to E | to walk | to walk | to walk | |
| R3 | His bell — an Undo of a change line he read (struck, "taken back · Saber") | to walk | to walk | to walk | |
| R4 | The bell's unread mark, top bar and the Scheduler Board's own bar | to walk | to walk | to walk | |
| R5 | A tap on the reminder — the SANS calendar on the first day still owed | to walk | to walk | to walk | |
| R6 | SANS calendar — a drag across his date, both directions, mouse | to walk | to walk | to walk | |
| R7 | SANS calendar — the keys (Shift + arrows, Enter or Space) | to walk | to walk | to walk | |
| R8 | SANS calendar — a held finger drag | to walk | to walk | to walk | |
| R9 | The commitment window — its Dates calendar moved earlier | to walk | to walk | to walk | |
| R10 | A shared offer — new, for two men with different dates | to walk | to walk | to walk | |
| R11 | A shared offer — extended earlier (Q10), and a one-man filing's unchanged words | to walk | to walk | to walk | |
| R12 | The opened day's greyed "+ Commitment" and its words, his, a non-SANS member's, an admin's | to walk | to walk | to walk | |
| R13 | The passing note after a cut run, at both sizes, its whole text readable | to walk | to walk | to walk | |
| R14 | The Leave War's Post out sheet — each cause (later, earlier, undone, another outcome) | to walk | to walk | to walk | |
| R15 | Quals — the SANS tick off and on, Undo, Redo | to walk | to walk | to walk | |
| R16 | The crew list, armed seat and hover — MUST NOT gain a line (D2420) | to walk | to walk | to walk | |
| R17 | A reload, a sign-out and a week change — the lines, read marks and the new setting | to walk | to walk | to walk | |
| R18 | Another person's bell and an admin's — MUST NOT carry his line | to walk | to walk | to walk | |
| R19 | The SANS month's counts after a cut run, and Undo of it | to walk | to walk | to walk | |
| R20 | The changes window — a cut run's history line | to walk | to walk | to walk | |
| R21 | The published face — MUST NOT change | to walk | to walk | to walk | |

### 18.4 The door check
To fill from the walk: every way to file a run (R6–R9), to change a posting (R14), to change a tick (R15), to read a line (tap, Mark all read), each with its control.

### 18.5 The five sizing lines (the order's §7.0)
1. **The type of change:** F (the bell's words) with G (saved data: a part-saved run, the `sansplan` setting, the change line's shape), H (the SANS check of the permission gate) and C (a drag's result changes).
2. **What only a walk could find here:** that each door really reaches the cut and says it; that the right line reaches the right person after each real sequence of postings, ticks, reads and reloads; that a long line and note read whole on his iPhone.
3. **What the ledger says:** this branch's rounds 4 to 6 found 0, 1 and 3 faults in the change; round 6's three Opus walkers cost about 1.5M.
4. **The walk chosen:** Astra's 24 scenarios (`docs/superpowers/briefs/2026-11-24-sans-words-scenarios-astra.md`), none set aside, at desktop Chromium 1536×864 and his iPhone's WebKit 402×874 by touch, the clock Wed 15 Jul 26 09:00, by three Opus walkers one after another (Low): w11 the change lines (S1, S3, S4, S5, S9–S13), w12 the reminder (S2, S7, S14–S17, S22, S23), w13 the calendar's doors, the crew list and the plain-user round (S6, S8, S18–S21, S24). No approved part list exists for these drawings: the words are checked against the drawing page by eye and by exact text.
5. **After the walk:** its row in `docs/walk-ledger.md` — to add.

### 18.6 The orders walked
To fill.

### 18.7 The cases carried by a test
To fill.

### 18.8 The pictures
To fill.

### 18.9 The break tests
To fill.

### 18.10 Errors seen
To fill.

### 18.11 What was NOT walked, and why
To fill.

### 18.12 The gate counts
To fill.

### 18.13 What the walk and the reads found, and each disposition
To fill.
