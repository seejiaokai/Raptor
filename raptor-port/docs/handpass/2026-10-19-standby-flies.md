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

## 6. The orders walked (reports: `parts/standby-flies/walker-A.md`, `walker-B.md`, `walker-C.md`; the re-walk `scripts/handpass/sf-rewalk.mjs`)
Walked on bundle `index-BTbomYbk.js` (port 4322); the re-walk on `index-D76eH1xy.js` (the fixes and D1066).
| Order | Unpublished | Published day | Result |
|---|---|---|---|
| hand tick → Undo → Redo → amend; untick after publishing → amend | A 3 | A 1 (pending, sign-offs fall, the tracker waits for the amendment, the earlier version's look without the chip) | PASS; the changes window's words FIXED (A F1, C F1) |
| tick then type R / R then tick / clear R (the tick kept, a button again) | A 3 | A 3d | PASS |
| CX a row of a typed shift; tick then CX; CX the shift | A 4 | A 4 | PASS — no chip on a cancelled row, the badge drops it |
| AVALON overnight with R: four rows on by default, Sunday crew rest from 07:00, long day; cleared | C 2 | C 2 | PASS |
| a flying SPARE on a sim / ground row in the same hours; MAIN on AM + SPARE on PM | C 6, 17 | — | PASS — hard clashes once it flies, none at 13:00 |
| local leave / overseas / medical vs flying and standing-by rows; the member files leave | C 7 | — | PASS — local leave warns only once the row flies; one warning, not two |
| OIL Earn's switch: off then R cleared then retyped (off kept); on while standing by then R | C 12 | C 12 | PASS / RECORD (the scheduler's own off is kept) |
| Insights sorties / formations / the spares' own counts and hours | C 13 | — | PASS |
| the empty-row rule (2 jets, not 4) on the badge and Insights | B 5, C | — | PASS |
| BB with no times: the amber line, then START / END typed | B 8, C | — | PASS — its tap rings the line (as the nought-minute warning's does) |
| every surface: board desktop / phone, the week edit / view, the peek, a version's look, the member | A 9, B 9, B 21 | A 9 | PASS after the phone week's squeeze was FIXED (B F1, D1066) |
| the faint dash on every standby box, never on a flying line | A 16, B 16 | — | PASS |
| the chip by keyboard; two tabs; copies (template, plan, a dragged row); reload | A 14, 15, 20, 22 | A 14 | PASS / RECORD; Enter twice FIXED (A F2) |

## 7. Cases carried by a test
What flies, the count, Insights, the checks, OIL, the no-times advisory — `engine/standbyflies.test.ts` (SF1–SF6, SF9); the
chip on three screens and the peek, the hand tick, the changes window's words, the wave head — `ui/standbyflies.test.tsx`
(SF2, SF7, SF10); the dash — `ui/scboard.test.tsx` (SF8); the old-rule tests rewritten to D1044–D1046 —
`engine/oilscintime.test.ts`, `scintime.test.ts`, `scpickerrest.test.ts`, `scrally.test.ts`, `scrole-rules.test.ts`.

## 8. Break tests
Junk, a typed dash, "7", "25:90" in a standby R / B (B — 8/8 PASS: the box refuses them; the chip, the badge and OIL agree);
hammering the chip, a press mid-edit, a ticked wave deleted then Undo, every row ticked then R typed and cleared (A — PASS);
R later than END, a ticked row dragged across shifts (C — PASS / RECORD).

## 9. Errors seen
None — the browser's error list was empty in every run of every walker and the re-walk.

## 10. What was NOT walked, and why
WebKit / his iPhone itself (Chromium emulation only — on his look card); the Excel export and the PDF (downloads; MAIN / SPARE
are not exported today, so no Flies either); a public-holiday weekday (12d — the same OIL path as a weekend, carried by
`engine/oil*.test.ts`); two tabs live (the app does not sync open tabs; last save wins — older behaviour).

## 11. Gates
(filled when the run ends)

## 12. The model reads
- **The scenario designer** — a fresh Opus, blind to the build (`parts/standby-flies/scenarios.md`): 22 scenarios, 8 breaks.
- **The fresh, blind Opus read** — (filled when it reports).
- No Astra or Sol 6.1 read: ChatGPT is out (D761) — on `[NO-ASTRA-LIST]`. No Fable (D903).

## 13. Findings and dispositions
| # | Found by | What | Disposition |
|---|---|---|---|
| W-B1 | walker B | on the phone week the chip and the MAIN / SPARE badge squeezed each other into "M/AI/N", "✓/FLI/ES" | FIXED — no word breaks inside a chip; his D1066: the chip smaller and under the badge (re-walk PASS) |
| W-B3, A F3, C F2 | walkers | the + Wave note, the AVALON / BB wave head and the SC / AVALON / BB notes still said "outside the count", "checks only … nothing else" | FIXED — "until they fly", "standalone · flies", "unless its shift flies"; test |
| W-A1, C F1 | walkers A, C | the changes window read a tick as "SPARE · SPARE → SPARE · SPARE", headed "stores" | FIXED — "· ticked to fly", headed "standby role"; test; re-walk PASS |
| W-A2 | walker A | after Enter on the chip the keyboard left it | FIXED — focus kept after the redraw; re-walk PASS (the older MAIN / SPARE badge does the same — not changed) |
| W-A4, C F2 | walkers A, C | the Logic line "a standby shift earns none" read as if no standby shift earns | FIXED — "a standby shift with no length earns none, flying or not" |
| W-B2, C F3 | walkers B, C | a tap on the amber no-times line rings its line and does not focus START | RECORD — every line-anchored warning jumps this way (the nought-minute line's too); the design note says so |
| R-1 | walker B | a lit chip shows on a row with nobody seated (it counts nothing — D1062) | RECORD — the shift flies; the row would fly once seated |
| R-2 | walker A | OIL Earn shows a pending tick at once; the tracker waits for the amendment | RECORD — as every pending change shows in OIL Earn today (D592 (4)) |
| R-3 | walkers A, C | a tick does not travel with a day template; it does with a saved plan and a dragged row | RECORD — as designed (the tick is the row's, a template is a clean plan) |
| R-4 | walker C | the member is told nothing when his leave lands on a flying AVALON SPARE | RECORD — the same for any seat; not this change's |
| R-5 | walker B | the board's chips are 13 px tall to a finger | RECORD — the badge's own size; sizes stay without his word (D487) |

## 14. His look — the card
On his iPhone, at the preview: (1) Add an SC wave on a Saturday and seat its AM shift; type its R — every row shows "✓ FLIES"
(Scheduler Board, Edit Schedule, View-only Sched), the day's count gains the jets, OIL Earn has the spares on. (2) On the PM
shift, with nothing typed, tap a spare's dashed FLIES on the Scheduler Board — only that row lights; tap again — it goes. (3)
The empty R and B boxes of a standby line show a faint dash. Not walked anywhere but here: Safari on his iPhone itself.

## Walk line
