# [STANDBY-FLIES] — the FULL bug check (19 Oct 26)

Branch `claude/sad-herschel-5682e3`, cut from `claude/rally-box-changes` (pull request 541, not yet live). A standby line
that flies counts as a real flight: his rulings D1042–D1046 and his answers to the drawing D1060–D1065; the design note
`docs/superpowers/specs/2026-10-19-standby-flies-design.md`; the register
`docs/superpowers/specs/2026-10-19-standby-flies-behaviour-register.md` SF1–SF10. Pictures he answered:
`docs/img/handpass/2026-10-19-standby-flies/mock/`, `…/ghost-dash/`; walk pictures: `…/walk/{A,B,C}/`.

## Questions waiting for him
None yet.

## 1. The eight questions and the tier
1. Money (OIL) — YES: a flying SC SPARE, AVALON or BB row earns OIL by default, from the earliest of R, B and START.
2. The published record — YES: a hand tick is a new pending change on a published day; a typed B / R now changes what
   a published day counts.
3. Saved data — YES: a new optional field `fly` on a standby aircraft row; it rides the amendment key.
4. A shared drawer — YES: the MAIN / SPARE badge's row, drawn by the week builder, the board and the peek.
5. A new gesture or mode — YES: the Flies chip (a button on the board).
6. A new surface — NO: a chip and a placeholder in existing rows.
7. Roles — NO with a reason: the chip is a button only where `editMode()` and `canEditSched()` already allow an edit (the
   same gates as the MAIN / SPARE flip); a member and View-only Sched get a read-only span.
8. The warning list — YES: a flying standby row gets every flying check; a new advisory `SA_FLY_NO_TIME`.
**Tier: FULL.**

## 2. Rulings swept (every one that applies)
D1042–D1046, D1060–D1065 (this job); D1041 (narrowed by D1044, D1045 — its homes rewritten); D1039 (narrowed by D1065);
D1043 (answered by D1060, D1061); D24, D15 (standby OIL off by default — still so for a row that only stands by); D516
(standby is not flying load — narrowed by D1042 for a row that flies); D1009 (an ordinary flying line with nobody on it
still counts — unchanged; D1062 is for standby rows only); D606, D592, D591 (OIL from the entered report); D45, D103 (a
published day's change is pending and wipes the sign-offs); D850 (feedback in the screen, no passing note for the tick);
D852, D941 (his design correction D1064 → design lesson 10); D853, D921 (pictures before the build — done); D787, D790,
D903 (Sonnet walkers; one fresh, blind Opus read; no Fable). No clash beyond those narrowings.

## 3. The roll-call — every place that draws or reads a standby row's flying
| # | Place | SHOWS | USABLE | Painted on the same pixels |
|---|---|---|---|---|
| R1 | Scheduler Board, desktop — standby row | dashed chip (nothing typed) / lit chip; faint dash in empty R, B | press ticks / unticks; not on a typed shift | the badge beside it (`.sabadges`) |
| R2 | Scheduler Board, phone 402 | the same, stacked | finger | the badge; the remarks box below |
| R3 | Edit Schedule week | lit chip only | must not: read-only chip (D1064) | the badge |
| R4 | View-only Sched | lit chip only | must not | the badge |
| R5 | The next-week peek | "✓ FLIES ·" before the row's words | must not: inert | the row's remarks text |
| R6 | A published version's look (👁) | the issued state's chip | must not | — |
| R7 | Board read-only / member | lit chip only, no button | must not | — |
| R8 | Excel export / PDF print | MAIN / SPARE not exported today; print = the week's markup | n/a | — |
| R9 | Changes window, pending count, sign-offs, Undo / Redo | `st:` key marked; `fr:` composite carries `fly` | n/a | — |
| R10 | The day's count badge (week head, board head, the peek, the day picker) | flying rows an "X n" term; empty rows not (D1062) | n/a | — |
| R11 | Insights — sorties, formations, flying load, work hours, blue / red | flying seated rows; no blue / red for standby | n/a | — |
| R12 | Crew rest, long day, clashes, `SC_INTIME` | flying row as an SC MAIN | n/a | — |
| R13 | Availability — leave, overseas, medical; local leave | no standby allowance on a flying row; one warning, not two | n/a | — |
| R14 | SC currency, seat rules on a flying AVALON / BB row | asked once | n/a | — |
| R15 | Crew picker — arming, barred reasons; the palette's "free" | a flying row judged as checked; a flying spare tasked | arm / drop | — |
| R16 | OIL Earn mode; the Leave War OIL tracker | on by default from R/B/START to END | the switch | — |
| R17 | `SA_FLY_NO_TIME` advisory | a flying shift with no START / END | tap lands on START | — |
| R18 | Puck rings on a flying row | the whole day's decoration (not the exempt subset) | — | — |
| R19 | The Logic page; the + Wave picker's kind notes | the flying rule, "unless it flies" | — | — |
| R20 | Copies — day template, saved plan, wave template, a week left and reloaded | template drops the hand tick; plan keeps; reload keeps | — | — |
| R21 | The MAIN / SPARE badge and its flip note | a flying SPARE not faded; "fully cross-checked" | flip | — |

## 4. The door check
Every way into the chip: a mouse press, a finger tap, Tab then Enter / Space (a button), a member's press (nothing), the
week's lit chip (no press), a typed shift's lit chip (no press). Every way a row starts or stops flying: B or R typed,
cleared, junk typed; the hand tick on / off; CX on / off (row and shift); the MAIN / SPARE flip; seating / clearing the
crew; Undo / Redo; reload; a plan brought out; a template applied.

## 5. Sizing the walk (D607)
1. **Type of change:** A (one rule — "does this row fly" — read by many: the checks, OIL, the count, Insights), C (a new
   control: the Flies chip), D (the chip drawn by three builders — board, week, peek — and the badge's row shared), G (a new
   saved field riding the amendment path).
2. **What only a walk could find here:** the chip on each surface (board at two layouts, the week edit and view, the peek,
   a version's look, read-only / member); the tap by mouse and finger, keyboard reach; the published-day orders (tick,
   Undo, amend, untick after publishing) with OIL and the sign-offs watched; the warning words and rings on a flying
   spare / AVALON row; the faint dash on every standby box.
3. **What the ledger says:** D — every walk found a real fault; C — about half; G — about half; A — few faults in the
   change itself. So the surfaces, the gesture's orders and the published path carry the walk; the arithmetic of what
   counts is carried by `engine/standbyflies.test.ts` and the rewritten old-rule tests, driven on screen once per reader.
4. **The walk chosen:** three Sonnet 5.5 walkers (D787) in parallel on one served build (port 4322), each its own browser
   world: **A — desktop 1440 by mouse** (scenarios 1, 3, 4, 9 desktop, 10, 11, 14, 15, 16 desktop, 20, 22; breaks 3, 4,
   5, 6); **B — phone 402 by finger** (2 phone, 5, 8, 9 phone, 16 phone, 21 member; breaks 1, 2); **C — the rules and the
   chain** (2, 6, 7, 12, 13, 17, 18, 19; breaks 7, 8; the designer's "most likely missing" list). The designer's list:
   `docs/handpass/parts/standby-flies/scenarios.md` (22 scenarios, 8 breaks); none set aside. The common brief:
   `docs/superpowers/briefs/2026-10-19-standby-flies-walk.md`.
5. **After the walk:** the ledger row is written (`docs/walk-ledger.md`).

## 6. The orders walked

## 7. Cases carried by a test

## 8. Break tests

## 9. Errors seen

## 10. What was NOT walked, and why

## 11. Gates

## 12. The model reads

## 13. Findings and dispositions

## 14. His look — the card

## Walk line
