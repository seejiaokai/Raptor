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

## 14. The Walk line

`Walk: docs/handpass/2026-11-22-allavail-sans-posted.md · 462 pictures (and 684 phone tap pictures) · 9 surfaces · 15 orders and the plain-user round, each at a desktop's and his iPhone's size · MISSING: 1 filed (q), older`

Carried by a test, not walked: the rows of §7. **What the walk found beside the change (older, filed):** (q) on the board, ALL
AVAIL on an OFT sim's front seat — a press on its count chip arms the empty back seat instead of opening the ALL AVAIL window
(walker w2, both sizes; one separate phone tap did open it; seen by the host in the walker's picture, not driven again).
