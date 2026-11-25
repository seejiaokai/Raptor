# Bug check — a SANS man struck on a flying seat with no times yet (his D2573)

Branch `claude/sans-leftovers-179` (chat 179), pull request 848. Built from commit `3eb45f0cc`. Pictures:
`docs/img/handpass/2026-11-25-sans-notimes-strike/`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL, who counts as present) | NO — the crew list's per-seat reason only; nothing earns, nothing counts him present or away (the counts read a different question, `dayTasked`/`dayAway`). |
| 2 | The published record | NO — nothing published or signed changes; the reason is never stored. |
| 3 | Saved data | NO — nothing is written. |
| 4 | A shared drawer | YES — the per-seat reason (`slotBar`) feeds the crew list on Edit Schedule and the Board, the drag hover, the drop's note and the green rings. |
| 5 | A new gesture or mode | NO. |
| 6 | A new surface | NO. |
| 7 | Roles | NO — the crew list is a scheduler's (an admin's) only. |
| 8 | The warning list / how a rule is read | YES — it changes how the SANS availability rule is read for a seat with no times (the warning list itself is unchanged). |

**Tier: FULL** (question 8).

## 2. The rulings that apply

| Ruling | In the app's words | Checked by |
|---|---|---|
| D2573 | With nothing filed, a SANS man is struck on the crew list for a flying seat with no times yet, the same reason as a timed seat; a man who filed something is unchanged | the test file; the walk |
| D2568 | His reminder counts a seat with no times yet; a cancelled line never | the walk (the bell agrees) |
| D2564 | Only flying seats and sims count — never a ground row, a duty desk, all hands | the walk (a desk, a ground row unchanged) |
| D2576, D2578 | SC MAIN, SC SPARE, BB, AVALON need no SANS availability (not built) — so the new strike never reaches them | the test file; the walk |
| D2420 | With no seat picked, the crew list draws no reason line for a man struck for nothing filed | the walk |
| D2338, D2340 | Posted out as SANS from a date ahead: the strike's words name that date; before it he is an ordinary man | the walk |
| D2579 | The amber warning line for nothing filed — drawn first, NOT built here; the warning list must stay as it is | the test file; the walk |
| D2611 | A case his ruling does not name (a sim with no times) is put to him first, not built on a guess | the questions page |

No clash between them found.

## 3. The roll-call

| Place the answer shows | SHOW | USABLE | PAINTED beside it |
|---|---|---|---|
| Edit Schedule crew panel, a flying seat with no times picked — desktop | | | |
| Edit Schedule crew panel, the same — phone | | | |
| Scheduler Board crew list, the same — desktop | | | |
| Scheduler Board crew list, the same — phone | | | |
| Crew list, no seat picked (unchanged, D2420) | | | |
| The drag hover over the seat | | | |
| The note after a drop or a tap-to-plan | | | |
| The green "where can he go" rings | | | |
| His bell's SANS reminder (must agree) | | | |
| The warning list and his puck's marks (unchanged) | | | |
| Standby seats with no times (unchanged) | | | |
| A sim row with no times (unchanged, a question for him) | | | |

## 4. The five sizing lines

1. **Type:** A (a rule inside one shared calculation, the per-seat reason) with D (its answer drawn in several places,
   each by its own code: the crew list's strike and count, the drag hover, the drop's note, the green rings).
2. **What only a walk could find:** whether each place that reads the answer actually shows it on a seat with no times,
   at both sizes, on Edit Schedule and the Scheduler Board; that the words fit at 402 wide; that the strike follows the
   times typed, cleared and half-typed; that the bell and the crew list agree; that standby lines, a man who filed and the
   warning list stay as they are. The test file carries the calculation; it does not prove any screen reads it.
3. **The ledger:** type-A walks of the SANS gate (w11–w14 of 24–25 Nov) found their faults in the places that READ the
   answer (the reminder's own reading of "planned", lesson 32), not in the calculation.
4. **The walk chosen:** one Opus walker (D2256), the frozen build `D:/raptor-work/c179-build` (`index-DmZtA8E3.js`,
   commit `3eb45f0cc`), port 4881; every scenario of both designers that the test file does not carry, combined by the
   host (§5), phone 402×874 WebKit and desktop 1536; the plain-user round (§7.0a): Saber adds a line, plans Ranger,
   types the times, Undo, and looks at the bell as Ranger. Carried by the test: the repeated standby seats (every MAIN and
   SPARE of SC, AVALON, BB) beyond one of each walked.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## 5. The scenarios (Astra and a fresh Fable, blind to each other, combined by the host)

Fable: 17 scenarios, 10 negatives, 2 questions (`D:/raptor-work/c179-sc-fable/scenarios.md`, to be saved under
`docs/superpowers/briefs/2026-11-25-sans-notimes-scenarios-fable.md`); Astra: 22 (`D:/raptor-work/c179-sc-astra/scenarios.md`,
→ `…-scenarios-astra.md`). Combined, every one walked: overlaps F1=A-S02 · F2=A-S05+A-S04 · F3=A-S11 · F4=A-S07 ·
F5=A-S01 · F6=A-S08 · F7=A-S13 · F8=A-S10 · F9=A-S03 · F10=A-S04 · F11=A-S15 · F12=A-S12 · F13=A-S22 · F16+F17=A-S18;
Astra's alone A-S06, A-S09, A-S14, A-S16, A-S17, A-S19, A-S20, A-S21; Fable's alone F14, F15. Two Opus walkers (A: crew
lists, drags, rings, the board, publish, view-only — port 4881; B: the bell, filings, standby, dates, cancel, undo, reload,
sims — port 4882), brief `D:/raptor-work/c179-walk/BRIEF.md`.

**The §7.11 lessons:** apply — 2 (a drag at ordinary speed: F5/A-S01), 3 and 30 (a picture after every press, the phone
within 100ms), 9 and 23b (the reason line measured inside its panel at 402 wide), 22 (read from the screen), 25 (every
kind of flying seat: A-S06), 28 (proved on screen before a press), 29 (the clock past his SANS date: F8/A-S10).
Do not apply, no part of the change: 1 (no new state surface beyond the table above), 4, 5, 10, 12, 19 (no window), 6,
7, 13, 20, 21, 26 (no new gesture or motion), 8 (no drawing for this build), 11, 15, 17, 24, 27, 31 (no layout, bar or
fit change), 14 (no keyboard route), 16 (no refusal at a box), 18 (no print), 23 (no tap that opens anything new).

## 6. The orders walked

## 7. Cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| No times, nothing filed → struck in the timed seat's words | `src/engine/sans-notimes-strike.test.ts` | the two cases that failed before the fix |
| A man who filed anything, a non-SANS man, every SC / AVALON / BB seat, the warning list — unchanged | the same file | five cases; removing the fix's standby guard fails one |

## 8. The pictures

## 9. The break tests

## 10. Errors seen

## 11. Not walked, and why

## 12. The code reads

## 13. Gates

## 14. What the walk found, and each disposition

**Walker A** (report `docs/handpass/parts/sns-w1A-report.md`, pictures `docs/img/handpass/2026-11-25-sans-notimes-strike/A/`,
652 pictures, no console or page errors): every promise of D2573 PASSED at both sizes — the strike, the reason under the
name, the "N free" count, the drag hover, the green rings, the bell agreeing. Three FAIL rows, one cause, **not a fault of
this change (host reproduced from `A/F1-d/F1-f1-tap-note-desktop.png`, opened):** the note after a drop or tap shows the
NEWEST warning that drop raised — on a weekend blank line the first man placed raises "the … line has no usable times, so
nobody on it earns OIL for this day", which takes the note (F1.2, A-S16 S16.1); on a weekday a newer double-turn warning
does the same (F5.9). With no newer warning the note gives his SANS reason (F1.6, F5.6, and a timed Sat 18 control). The
same order on `main` (chat 174's recipe P7 records the OIL note). Fable's EXPECTED line assumed the SANS note; Astra's
A-S02 ("existing new warnings take priority") matches the app. Disposition: as built — named on his look card.

**Walker B:** (pending)

## 15. The Walk line
