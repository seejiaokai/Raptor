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

## 8. The pictures

## 9. The break tests

## 10. Errors seen

## 11. What was NOT walked, and why

## 12. The gate counts

## 13. What the walk and the reads found, and each disposition

## 14. The Walk line
