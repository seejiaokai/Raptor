# [RALLY-BOX-CHANGES] — the FULL bug check (19 Oct 26)

Branch `claude/rally-box-changes`, cut from `main` at the merge of pull request 540. His three changes to the live rally
box, asked and answered the same day: D1035–D1037 (his asks), D1038–D1041 (his answers) — the design note
`docs/superpowers/specs/2026-10-02-rally-time-design.md` §His three changes; the register
`docs/superpowers/specs/2026-10-02-rally-behaviour-register.md` RB8–RB10. Question pictures:
`docs/img/handpass/2026-10-19-rally-changes/`; walk pictures: `…/walk/{A,B,C}/`.

## Questions waiting for him
None yet.

## 1. The eight questions and the tier
1. Money (OIL) — YES: an SC MAIN line's rally starts its OIL day (D1041, D606).
2. The published record — YES: a standby line's R is a new printed value on a published day (pending, amendment); the
   export and PDF print it.
3. Saved data — YES, small: `f.rl` is now written on standby formations (the field exists since D1026; no new field).
4. A shared drawer — YES: the time cells drawn by the week builder, the peek, the board; the placement routine shared by
   every suggesting box.
5. A new gesture or mode — YES: the taken suggestion's flash and its first-key replace (no highlight).
6. A new surface — NO: new boxes in existing rows.
7. Roles — NO with a reason: who may edit is unchanged — the standby R box obeys the same `canEditSched` / `editMode` /
   read-only gates as its B.
8. The warning list — YES: crew rest (its sentence says "rally"), the long day, work hours and the SC in-time advisory
   read the SC MAIN rally.
**Tier: FULL.**

## 2. Rulings swept (every one that applies)
D1035–D1041 (his asks and answers); D1026, D1028–D1030 (the box, the suggestion inside it, one tap places it — D1030's
"highlighted" narrowed by D1038, the replace kept); D1032, D1034 (what a flying R counts for — unchanged); D606, D592,
D591 (OIL from the entered report — SC's in-time box, now its rally box too); D516 (standby lines are not flying load;
SC main counts towards work hours); D24, D15 (SC SPARE, AVALON, BB OIL off by default); the scheduler's settled note
"On SC, the B box is an IN-TIME" (24 Aug 26 — its known seam, B on the board only, stands); D45, D103 (a published day's
change is pending and wipes the sign-offs); D509 (an empty flying B's suggestion still printed on View-only Sched);
D876 (one mark, one look — narrowed by D1038 for a taken suggestion); D850 (feedback designed into the screen); D554
(Tab route); D1011 (Escape on a board time box); D932 (every Logic line correct for the settings); D787, D790, D903
(Sonnet walkers; one fresh, blind Opus read; no Fable). No clash found beyond the narrowings recorded in the full rows
(D1026 by D1036; D1030 by D1037/D1038; D876 by D1038).

## 3. The roll-call — every place that draws or reads a standby line's times, or places a suggestion
| # | Place | SHOWS | USABLE | Painted on the same pixels |
|---|---|---|---|---|
| R1 | Scheduler Board — standby line, desktop (one line) | R box before B, empty, no placeholder; B no placeholder (code; `scboard.test.tsx`, `board-stores.test.tsx`; e2e) | type / Tab / Enter / Escape — walk A 11 | nothing new |
| R2 | Scheduler Board — standby line, phone (stacked) | R above B (e2e) | finger — walk B 12 | the old empty-R placeholder style removed |
| R3 | Edit Schedule week — standby line | R above START, heading "R / START" (`brieftime-ui` RB10) | walk B 12, A 13 | nothing new |
| R4 | View-only Sched — standby line | typed R above START, empty R keeps its line (RB10) | must not: read-only | — |
| R5 | The next-week peek | R above START, "R / START" (RB10) | must not: inert | — |
| R6 | A published version's look | the issued R — walk C | must not | — |
| R7 | Board read-only / member | R disabled, no suggestion (code `dis`, `stoRO`) — walk B 19, C | must not | — |
| R8 | Excel export / PDF | Rally = typed R; standby Brief typed only (RB10) — walk A 14 | n/a | — |
| R9 | Changes window, pending list, change mark, Undo | generic `ff:…rl` key (restore.ts dayKeys covers every formation) — walk A 15, C | n/a | — |
| R10 | Crew rest (warning, palette, arming) | SC MAIN rally; sentence "rally is" (`scrally.test.ts`) — walk B 3 | n/a | — |
| R11 | Long day / work hours / Insights | from the SC MAIN rally (`scrally.test.ts`) — walk C 18 | n/a | — |
| R12 | SC in-time advisory (`SC_INTIME`) | reads the report → the rally (code) — walk A 17 | n/a | — |
| R13 | OIL — OIL Earn, the Leave War tracker | SC MAIN from the earlier of R and B; SPARE/AVALON/BB written window (`scrally.test.ts`) — walk A 1, 2 | n/a | — |
| R14 | Crew picker / SANS window ("is he busy") | `seatIntime` → `scReport` (code) — NOT walked separately | n/a | — |
| R15 | The Logic page's SC in-time line | names R and B (changed this job) — walk C | n/a | — |
| R16 | Day templates, plans, wave templates | carried with the formation (generic copy); wave templates carry no rally, as for flying (code) — walk C 20 | — | — |
| R17 | The history jump (`histbubble.ts onlyOn`) | R is drawn on both week and board — no "board only" entry needed (`histjump.test.tsx` green) | — | — |
| R18 | A placed suggestion — board input (flying R, B) | caret after it, no highlight, `.sugtook` ring ~1s (RB9; e2e) — walk A 5, B 6–7 | first key replaces; Escape; Enter; leave saves | the focus ring of the input beside the flash |
| R19 | A placed suggestion — week box (flying R, B) | the same (RB9; e2e week) — walk A 9, B 9 | the same | the B box's gold text |

## 4. The door check
Every way into a standby R box: a press (places nothing — no suggestion), typing, Tab in and out, Enter (board), Escape,
leaving; a member's press (nothing). Every way into a taken suggestion: a press on a faint flying R or B (mouse and
finger), the first key, Backspace, Escape before and after the ring has gone, Enter, leaving by a press on the next box,
✓ Done, a day arrow. Walked by A (desktop) and B (phone); the results are in §6.

## 5. Sizing the walk (D607)
1. **Type of change:** A (a rule inside a shared calculation — SC's report now the earlier of two boxes), C (a gesture
   changed — the placement's look and its first-key replace), D (the standby time cells drawn by three builders, plus the
   export and print).
2. **What only a walk could find here:** the standby R on each surface drawn separately (board at two layouts, week edit
   and view, peek, version look, read-only); the flash and the replace by mouse AND finger (the phone's own selection and
   caret are the known risk); the published-day orders around OIL; the warning sentence on screen.
3. **What the ledger says:** D — every walk found a real fault; C — about half; A — about half, few in the change itself.
   So the drawn surfaces and the gesture orders carry the walk's value; the arithmetic is left to `engine/scrally.test.ts`.
4. **The walk chosen:** three Sonnet 5.5 walkers (D787) in parallel on one served build (port 4312, bundle
   `index-D602A6a_.js`), each its own browser world: **A — desktop 1440 by mouse** (scenarios 1, 2, 5, 8, 9, 11, 13, 14,
   15, 17, 21 desktop, 22; breaks 1, 2, 3, 7); **B — phone 402 by finger** (3, 6, 7, 9, 10, 12, 19 member, 21 sideways;
   break 5); **C — the rules and the copies** (4, 16, 18, 20; breaks 4, 6; the designer's "most likely missing" list).
   The designer's list: `docs/handpass/parts/rally-changes/scenarios.md` (22 scenarios, 7 breaks); none set aside. The
   common brief: `docs/superpowers/briefs/2026-10-19-rally-changes-walk.md`.
5. **After the walk:** the ledger row is written (`docs/walk-ledger.md`, 19 Oct 26, [RALLY-BOX-CHANGES]).

## 6. The orders walked (reports: `parts/rally-changes/walker-A.md`, `walker-B.md`, `walker-C.md`)
| Order | Unpublished | Published day | Result |
|---|---|---|---|
| SC MAIN R typed → publish; publish → R typed → amend; → Undo; R and B both (the earlier) | A 1a, 1d | A 1b (pending, sign-offs fall, the tracker held until AL1, the Original's look keeps R empty), A 1c | PASS |
| SC SPARE / AVALON / BB R typed; SPARE switched on in OIL Earn; the MAIN/SPARE badge flipped | A 2 | A 2, C (the flip raises pending) | PASS — written window only; the flip starts and stops R counting |
| crew rest from an SC MAIN R — "rally is" / "in-time is" / cleared → "starts" | B 3 (phone) | — | PASS |
| tap a faint flying R / B → the time in ordinary ink + ~1s ring → type replaces; Escape; Backspace; Enter; leave | A 5, 9; B 6, 7, 9 | — | PASS, after the fix below (Escape / a change inside the second now ends the ring) |
| tap R then B at once; tap then ✓ Done / a day arrow; a redraw mid-ring | B 7; A 8 (forced redraws — two tabs did not sync live) | — | PASS / RECORD |
| standby R by Tab / Shift+Tab / Enter / Escape (board, week) | A 11 | — | PASS — as a flying R |
| one value on board, week, View-only Sched, peek, Excel, print | A 13, 14 | A 14 (a pending R is not exported until amended) | PASS |
| two SC shifts, one man on both; long day and Insights from R; an empty R | C 4, 16, 18, break 6 | — | PASS |
| copies: a day template carries the standby R; a saved plan brought out → AL1; "+ Wave" standby waves empty with no faint time | C 20 | C 20 (plan → AL1, R marked) | PASS / RECORD (the template carries R, as it carries B) |
| a member's view (us / us) | B 19 | — | PASS — typed R shown, no faint times, a tap places nothing |
| reload; the error list | A 22, B, C | — | PASS — no browser errors in any run |

## 7. Cases carried by a test
The arithmetic of `scReport` (both boxes, the earlier, the evening-before roll), crew rest's "rally is" words, the long day,
OIL for MAIN / SPARE / AVALON / BB — `engine/scrally.test.ts` (RB8); the placement's no-highlight, caret, ring, first-change
rule — `ui/brieftime-ui.test.tsx` RB9 and `e2e/rallybox.spec.ts`; the standby R on the week, peek and export —
`ui/brieftime-ui.test.tsx` RB10, `ui/scboard.test.tsx`, `ui/board-stores.test.tsx`, `e2e/rallybox.spec.ts`.

## 8. Break tests
Junk text, 25:90, a rally later than START, R typed then START cleared (A breaks 1, 2, 3, 7 — PASS; `24:00` accepted as on a
flying R — RECORD); clearing a box (B break 5 — PASS); overnight AVALON R 17:00 / 01:00 (C — shown only, nothing counts, PASS);
one man on two SC shifts (C break 6 — PASS); **overnight SC MAIN 19:00–07:00 with R 01:00 (C break 4 — see §13 C-1).**

## 9. Errors seen
None — the browser's error list was empty in every run of every walker.

## 10. What was NOT walked, and why
WebKit / his iPhone itself (Chromium touch emulation only — his look card asks him); a live two-tab sync replacing a box mid-ring
(the two tabs did not update each other in 12 s — forced redraws walked instead); the real print dialog (the print document was
read); the light theme (none found); scenario 3's desktop part and arming a seat (carried by `engine/scrally.test.ts`); a
member's read-only board (a member has no route to the board); break 6's SPARE variant (time).

## 11. Gates
The full set under the lock (`gatelock.mjs run`, E2E_PORT 4311) on commit 0c83b57f2 (the build, the walk's fix): unit 11,900 / 671 files, build, tfin 728/0, e2e 875 passed (61 skipped), the Tracker smoke 453/0, rulecheck, docsize — all PASS. After the read's fixes and the flash change (D902 — a follow-up runs what it touches): `e2e/rallybox.spec.ts` 8/8 on its own port; 7 unit files, 141 tests. The pull request's run is the full check of the final commit. Final pictures for his look: `docs/img/handpass/2026-10-19-rally-changes/final/` (`scripts/handpass/look-rally-flash.mjs`).

## 12. The model reads
- **The scenario designer** — a fresh Opus, blind to the build (`parts/rally-changes/scenarios.md`): 22 scenarios, 7 breaks.
- **The fresh, blind Opus read** of the finished code, with this sheet and the three walkers' reports in hand
  (`parts/rally-changes/read.md`, brief `docs/superpowers/briefs/2026-10-19-rally-changes-read.md`): F1 medium, F2 low, F3
  low — all fixed (§13).
- **The narrow read of the fixes** — a second fresh Opus, given only the fix commit and the findings
  (`parts/rally-changes/read-narrow.md`): round 1, no findings. The last round.
- No Astra or Sol 6.1 read: ChatGPT is out (D761) — on `[NO-ASTRA-LIST]`. No Fable (D903).

## 13. Findings and dispositions
| # | Found by | What | Disposition |
|---|---|---|---|
| W-1 | walkers B (7b) and A (5) | after a tap, Escape or a Backspace inside the second left the blue ring fading on the emptied box | FIXED — the ring ends at once on Escape or any change (`interactions.ts flashTaken`; RB9 test) |
| W-2 | the host, on walker B's picture | the 2px blue ring sat inside the browser's white focus ring — a thin line, not an obvious mark (D1035's point) | FIXED — for its second the box's focus ring itself is blue (`12-schedule-editing.css .sugtook`) |
| F1 | the fresh read | a select-all of the placed time, typed over with the same first digit ("1100" over 10:40), kept "100" → saved 01:00 | FIXED — `firstChange` reads the browser's kind of change (`inputType`); RB9 tests; the narrow read: right and complete |
| F2 | the fresh read | a second take inside the second had its ring cut short by the first's timer | FIXED — the running flash is ended first; RB9 test |
| F3 | the fresh read | six comments / test names described the build before this change | FIXED |
| C-1 | walker C (break 4) | an overnight SC MAIN 19:00–07:00 with R 01:00 reads the rally as 01:00 that morning — a false 30 h day and crew-rest breach | RECORD, not this change's: the SC B box has read a clock earlier than START as the same day since 24 Aug 26, as a flying rally does (D503); a rally 18 h before its shift is not a case a scheduler types. Not filed. |
| O-1 | the read | the crew picker judges an SC MAIN seat from START, never from B (so not from R) | older, not this change — noted |
| O-2 | walker A, the read | `24:00` is accepted in every time box | older, not this change — as a flying R |
| O-3 | walkers A, B | a time typed on the board shows as typed ("0700") until the next redraw | older — the TO box does it too |
| O-4 | walker A (21) | the 821-wide board squeezes the remarks on every line | older — `[BOARD-NARROW-DESKTOP-REMARKS]` |

## 14. His look — the card
On his iPhone, at the preview: (1) the Scheduler Board — tap a faint R on a flying line: the time shows in white at once and
the box's border flashes blue for about a second; type a new time — it replaces it. (2) Add an SC, AVALON and BB wave: each
line has an R box above B (board) and above START (Edit Schedule, View-only Sched) — empty, no faint times. (3) Type an R on
an SC MAIN line earlier than its START: the crew-rest and long-day warnings, OIL Earn and Insights count from it; on a SPARE
row nothing moves. Not walked anywhere but here: Safari on his iPhone itself (the walk used Chrome's phone mode).

## Walk line
`Walk: docs/handpass/2026-10-19-rally-changes.md · 223 pictures · 3 walkers (A desktop, B phone 402 by finger, C rules and copies) · 22 scenarios, 7 breaks · 1 fault in the change fixed (the ring after Escape), 1 look fixed (the flash too thin), 3 read findings fixed, 1 overnight case recorded · gates green`
