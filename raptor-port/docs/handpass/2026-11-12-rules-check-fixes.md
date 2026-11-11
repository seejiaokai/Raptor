# The rules check's fixes — the bug check (12 Nov 26, jobs 2 and 3)

The nine fixes and the words of `[RULES-CHECK-FIXES]` (D1990, D1991, D1993, D1994, D1995, D1996, D1997, D1999, D2000,
D2001, D2003, D2004, F3, F5–F11), branch `claude/rules-check-fixes`, pull request 762. Walked on the frozen build of
`52163215d` (three Sonnet walkers), then the reads' fixes re-walked three times on frozen builds of `2543c77c4`,
`a557e8d02` and `af7e7528c`; the last commit, `fbddc708b`, changed only the next-week preview's drawing key and was
carried by a test. Walker reports, whole: `docs/handpass/parts/2026-11-12-rcf-w1.md`, `-w2.md`, `-w3.md`,
`-rewalk.md`, `-rewalk2.md`, `-rewalk3.md`. Pictures: `docs/img/handpass/2026-11-12-rules-check-fixes/`.

## 1. The eight answers and the tier

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money | YES — OIL (earned leave, time off banked, never pay — D25): D1997 and D1999 change who earns by default and from when; D2003, D2004 the amber lines that say OIL waits for a republish |
| 2 | The published record | YES — D1991: a published day is checked by the Logic settings it went out under; D2001 hides kept on the published face |
| 3 | Saved data | YES — a hidden warning is saved by its key (D2001 keys a clash by its two items); a published copy keeps its rules |
| 4 | A shared drawer | YES — the one warning bundle feeds every ring, count, list, ⓘ and Insights; the same-time box (F3) is one function for the week, board and preview |
| 5 | A new gesture or mode | NO — no control added; the drop's existing red message is reused |
| 6 | A new surface | NO — no screen, panel, sheet or kind of row added |
| 7 | Roles | NO — who may do or see anything is unchanged |
| 8 | The warning list | YES — what five warnings say, and how a typed line, a flying standby row and a template desk are read |

**Tier: FULL.** Rulings swept: D1988–D2005 (his answers to the rules check), with D592, D606, D1041, D1042–D1046, D179,
D186, D469–D479, D1792 they touch.

## 2. The roll-call

| Change | Surface | Mark | Seen in |
|---|---|---|---|
| Crew rest: blank landing ends at take-off + debrief (D1990) | the warning list's crew-rest line | has it | W3 S23 (09:29 breach, 09:30 clear) |
| | the "breaks tomorrow's crew rest" dotted mark | has it | carried by test (rulesfirst crew-rest tests); same sentence |
| | Insights hours | must not, because D1936 keeps a blank landing at no hours | W3 S24 |
| | the next-week preview | must not, because it draws no warnings but the same-time box | — |
| A published day keeps its rules (D1991) | View-only Sched's published face (B printed, crew rest) | has it | W1 S09; re-walk 2 Q3; re-walk 3 T2 |
| | next week's published Monday, read across the week's edge | has it | re-walk R5; `kept-rules-neighbour.test.ts` |
| | Edit Schedule's next-week preview | has it — the working copy, so the new value (D1010) | re-walk 3 T2 |
| | View-only Sched's next-week preview | has it — the published value | re-walk 2 Q3, re-walk 3 T2 |
| Days in a row, an untimed row counts (D1993) | the RUN warning | has it | W3 S25 (ground, duty, sim), S26 (removal) |
| Typed line is an in-time (D1995) | crew rest, OIL, the warning's words, the Logic lines | has it | W3 S31, S32a, S32b, S38 |
| | the board's wave header clock | must not, because D947 took it away | — |
| | SANS availability | must not, because its window is step to dekit (D36) | — |
| A flying standby row is a sortie (D1996) | the issues list (red clash, turns) | has it | W2 S28, S29; re-walk R2, Q2 |
| | the crew list on Edit Schedule | has it | W2 S05 |
| | ALL AVAIL flags | has it | carried by test (one warning bundle) |
| A template desk once its wave flies (D1997) | the warnings | has it | W1 S03 |
| | the desk man's own puck ring | has it — MISSING at the walk, fixed | re-walk R3 (board, week, phone), Q4 |
| | OIL Earn's default, the Leave War credit | has it | W1 S03, S13 |
| | the template sheet's note (D1994 words) | has it | W3 S37 |
| | the Logic page's OIL fold | has it | W3 S38 |
| Same-time shift earns (D1999) | OIL Earn, the board's figures, the Leave War credit | has it | W1 S14, S15 (desktop, phone) |
| | the same-time note's words | has it | W1 S14 |
| | Insights hours | must not, because D1999 is about earning only | — |
| The amber same-time box (F3) | the week, the board | has it | W2 S17 (desktop, phone) |
| | the next-week preview | has it | carried by test (one shared function); S02 not walked |
| The hide key (D2001) | rings, counts, list, the hidden line | has it | W2 S20, S21, S22, I9; re-walk R1, Q1, T1 |
| | two clashes worded the same | has it — MISSING at the walk, fixed | re-walk 2 Q1, re-walk 3 T1 |
| | the drop's red message | has it — MISSING by the second narrow read, fixed | re-walk 3 T1 |
| | the D479 amber note at a drop | has it | W2 S22.2 |
| | ⓘ, the published face's kept hides | has it | carried by test; not walked (below) |
| Amber OIL lines (D2003, D2004) | the day's warning list on Edit Schedule, the board, View-only Sched | has it | W1 S18, S19, S08 |
| The words (D2000, F5–F11) | the Logic page (settings, checks, folds) | has it | W3 S38 (desktop, phone, 70 checks); re-walk R4 |
| | the duty-template sheet's notes (Admin and + Block) | has it | W3 S37 |

## 3. The five sizing lines

- **Type of change:** A (the rules engine), D (warnings and marks), G (published record), F (OIL).
- **Size:** FULL — three Sonnet 5.5 walkers side by side on one frozen build, then three Sonnet re-walks of the fixes.
- **Widths:** his PC's 1536 × 864 and his iPhone's 402 × 874 by touch (phone where a change draws on a phone: S14,
  S17, S18, S19, the plain-user round, S38, R3, R4).
- **Scenarios:** Astra's 44 (`docs/superpowers/briefs/2026-11-12-rules-check-fixes-scenarios.md`), ranked; 31
  walked, 13 set aside below.
- **Plain-user round:** W1 (OIL Earn open/close, Undo/Redo, ✓ Done, View-only, the Leave War's OIL figure), W2 I9
  (hide, Undo, Redo, Reset), W3 S44 (build a day, publish, amend, Undo, Redo, reload, a member's view).

**Set aside, with why:** S04 (SANS availability reads step to dekit, D36, never the report); S06 (placeholders are
untouched, and refused on flying lines, D33); S10 and S11 (the missed-brief message and the day before read the one kept
value — `kept-rules-neighbour.test.ts`, `peek.test.tsx`); S16 (an overnight line's OIL day, D42, untouched; D1999's
boundary in `rulesfirst-2-standby.test.ts`); S27 (D1998 settled as built, nothing changed); S30 (clearing R walked in
S03 and S29.2; a CX'd standby row's tests unchanged); S34 and S36 (words only, the rules beneath unchanged); S39 (no
box's refusal changed); S40 (no flip changed; S44 walked a reload); S42 (no date arithmetic changed); S43 (a saved plan
or version runs the same one check pass as every load).

**Deviation from the order, named:** the two blind code reads ran beside the walk, not after it, for time; both readers
saw neither the walk nor each other. Every fix was then read again by a fresh narrow Opus read (three rounds) and
re-walked.

## 4. The orders walked

| # | Order | Result | What the screen said / what OIL said |
|---|---|---|---|
| 1 | Publish Friday, then make it a PH on the Leave War (S18), desktop and phone | PASS | amber "Publish this day again so OIL is earned. The PH was set after the day was published."; no OIL until republished |
| 2 | Publish a PH day, then remove the PH (S19) | PASS | amber "Publish this day again to withdraw the OIL. The PH was removed after the day was published." |
| 3 | The same through the Calendar window's holidays list (S08) | PASS | the same amber words |
| 4 | Saturday PH removed after publishing (S19 record) | RECORD | still a weekend — no line, as ruled |
| 5 | SC shift START = END, nothing / R / B typed (S14, S15), desktop and phone | PASS | earns from R or B; same-time note "…the shift still earns from its R or B" |
| 6 | AVALON desk, wave stands by, then flies by R, then R cleared (S03) | PASS after fix | clash red, desk earns by default; desk puck ring MISSING at the walk |
| 7 | The same, flown by a row's Flies tick (S03) | PASS after fix | as 6 |
| 8 | Switched off in OIL Earn, then flown; flown, then switched off (S13) | RECORD | his hand switch holds; the Leave War credit follows (Comet FO, Ranger none) |
| 9 | Publish, raise the brief lead, read the published face (S09) | PASS | View-only keeps B 09:40 |
| 10 | Hide a clash, retime both items keeping the overlap (S20) | PASS | still hidden |
| 11 | Hide, rename the ground row (S20) | PASS | still hidden (same items) |
| 12 | Delete and re-make the row with the same words (S21) | PASS | a new red line (a new item) |
| 13 | Replace the man on both items (S21) | PASS | a new red line for Saber |
| 14 | Take him off the seat, put him back (S22) | PASS | the hide stays; the amber "already on BRIEFING 12:00–12:30" note at the drop |
| 15 | A second clash worded the same beside a hidden one (S3.x) | PASS after fix | at the walk: nothing; now two lines, the hidden one struck, the new one red |
| 16 | A Meeting over his sortie, hidden (S01) | RECORD | struck, pucks plain |
| 17 | Two same-time lines, hide one, Reset (S17), desktop and phone | PASS | the hidden line's box goes, the other keeps its amber box |
| 18 | A lecture and a Meeting inside a flying SC shift, crew list then seat (S05) | PASS | "already on LECTURE 09:00–10:00" struck; the clash red |
| 19 | AM flies, PM stands by, "another shift" at Advisory (S29) | PASS after fix | at the walk amber; now red |
| 20 | AM's R cleared, both stand by (S29.2) | PASS | amber, as the setting says |
| 21 | Flying SC then a sortie; a sortie then a flying SC (S28) | PASS | "Tight turn SC AM→VL BFM…" and "VL BFM→SC PM…" |
| 22 | Hide ✕ → Undo → Redo → Reset (I9) | PASS | each step as expected |
| 23 | Tap a warning line (I9.1) | RECORD | the line outlined and its note shown, as built — the walker's probe looked for a class the board does not use (host opened `w2/e1/i9-1-jump.png`) |
| 24 | Logic's 17 line groups, old fragments gone, desktop and phone (S38) | PASS | every new line word for word |
| 25 | Debrief 2h → 1h30 → 2h on Logic (S38) | RECORD | the fold's numbers follow |
| 26 | The duty-template sheet, AVALON and BB, from Admin and from + Block, four ways to close (S37) | PASS | "The AVALON desk — until the AVALON flies, checked only for…" |
| 27 | A blank landing Friday, Saturday B 09:29 then 09:30 (S23) | PASS | breach, then clear |
| 28 | Insights with a blank landing then a typed one (S24) | PASS | 14h, 14h, 20h30 |
| 29 | An untimed seventh day: ground, duty, sim; then a weekday removed (S25, S26) | PASS | the RUN line, then gone |
| 30 | "09:00 RALLY", "RALLY AFTER IN TIME", "RALLY 9h15" (S31, S32) | PASS | in-time at 09:00; no clock sets nothing; "VL: reporting line 1 has no recognised clock. Check the time." |
| 31 | Nothing typed, then the faint R taken, then a clearing B (S33) | PASS | amber, red, amber stays (D1989) |
| 32 | Take-off 11:49 / 11:50 / 12:29 / 12:30, nothing typed (S33) | RECORD | matches D1988 |
| 33 | Ratchet on leave seated on BRIEFING (S35) | PASS | "Ratchet — On leave but tasked — BRIEFING — reason: rcfw3" |
| 34 | Build Friday, publish, amend, AL1, Undo, Redo, reload, member (S44) | PASS | DRAFT → ORIG → AL1; kept after reload; member sees it |
| 35 | Re-walk: two clashes worded the same, one hidden, both variants (R1) | PASS | (before the per-pair change: one merged line) |
| 36 | Re-walk: a flying shift under Advisory, both overlaps (R2) | PASS | red |
| 37 | Re-walk: the AVALON desk puck, desktop board and week, phone board (R3) | PASS | red ring |
| 38 | Re-walk: the Logic page's two lines, desktop and phone (R4) | PASS | |
| 39 | Re-walk: next week's published Monday and this Sunday after a raise (R5) | RECORD | Monday's amber "Tight turning" from the default rally was there before the raise and is unchanged by it (D1988, D1989) — not a finding |
| 40 | Re-walk 2: second clash worded the same, 9 steps (Q1) | PASS | two lines; red drop message |
| 41 | Re-walk 2: a flying standby row red at every setting (Q2) | PASS | |
| 42 | Re-walk 2: next-week preview of a published day after a raise (Q3) | PASS | View-only 09:40; Edit Schedule's preview the working copy (as designed, D1010) |
| 43 | Re-walk 2: the AVALON desk ring (Q4) | PASS | |
| 44 | Re-walk 3: a second clash worded the same, first one showing, then hidden (T1) | PASS | the drop's red message names it |
| 45 | Re-walk 3: Edit Schedule's preview after a Logic change, View-only's of a published day (T2) | PASS | 09:40 → 08:40 → 09:40; View-only 09:40 throughout |

## 5. Cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| Two clashes worded the same are two warnings, each hidden by its own pair | `src/engine/rulesfirst-6-hidden-warnings.test.ts` (D2001 block) | lines [hidden, live], red, the drop counts 1 new; removing the row leaves the hidden one; hide both, move away and back, delete |
| The desk puck's ring once its wave flies | `src/engine/rulesfirst-2-standby.test.ts` (D1997) | the desk seat is no longer exempt from its own ring |
| A flying standby row is red under Advisory, both orders | `rulesfirst-2-standby.test.ts` (D1996) | two standing shifts amber, a flight red, at both settings |
| Next week's Monday read with the kept rules | `src/state/kept-rules-neighbour.test.ts` | the published copy's rules travel with it across the week's edge |
| The preview prints the brief the day went out with | `src/ui/peek.test.tsx` | 09:40 kept after a raise; the cache redraws |
| The preview redraws after a debrief change | `src/ui/peek-logic-key.test.tsx` | the same-time line's words follow the debrief at once |
| The two Logic lines | `src/ui/logic.test.tsx` | the words as built |
| The original's 728 | `reference/tfin.js` | 728 / 0 |

## 6. Break tests

Each fix was written red first: the failing run saved before the change (`2543c77c4`, `a557e8d02`, `af7e7528c`,
`fbddc708b` — each commit's test fails on its parent).

## 7. Errors seen

No console errors, page errors or 4xx responses in any final run of the walk or the three re-walks.

## 8. What was not walked, and why

- S02 (the next-week preview of the same-time set-up): out of the walker's time; the box is one shared function with
  the week's (walked, S17), and T2 walked the preview's redraw.
- S01's retime and re-file of the Meeting; S05 at 402; ⓘ of a warning; publishing an amendment with a hide pending; a
  member's view of a hidden line: out of W2's time — the hide's reading is one decision, walked on the week and board
  (S20–S22, I9, Q1, T1) and carried by tests for the published face.
- S12 (BB): the "+ Block" menu has no BB block built in; the BB template's note was walked (S37) and the desk's rule is
  the same function as AVALON's (walked).
- S23's "TBD" landing: the landing box refuses it ("TBD is not a time. Try 0900 or 09:00."), so a blank landing was
  walked instead.
- Re-walks on a phone beyond R3 and R4: the fixes drew nothing new on a phone (Q3: the preview does not show at 402).

## 9. Gate counts

On `fbddc708b`, on his PC, 12 Nov 26 (the repo is public, so GitHub's run is the job's full check — D1086):

| Check | Result |
|---|---|
| Whole unit suite (through the checks lock) | 826 files, 14,235 passed, 20 skipped, 0 failed |
| The original's assertions (`reference/tfin.js`) | 728 passed, 0 failed |
| The build (through the lock) | passes |
| `npm run rulecheck` | OK (874 test files, 278 rulings; 31 named by nothing, all in the baseline) |
| `npm run lint:changed` | no new finding |
| `npm run docsize` | below |

## 10. What the walk and the reads found, and each disposition

**The walk (three Sonnet walkers):**
- W1 S03 — the desk man's own puck kept no red ring once the AVALON wave flew → fixed (`2543c77c4`), re-walked R3, Q4.
- W2 S3.x — a second clash worded the same was swallowed by the first one's hide → fixed (per pair, `a557e8d02`),
  re-walked Q1, T1.
- W2 S29.1 — a flying shift against a standing one read amber at Advisory → fixed (`2543c77c4`), re-walked R2, Q2.
- W3 lead 1 — the Logic tight-turn line said "so it clears" while the amber reminder stays (D1989) → reworded "so his
  rest clears".
- W3 lead 2 — "On leave + flying" is drawn only on the Logic page → the words file corrected; still his to word.
- W3 lead 3 — "+ Block" calls the built-in Standard block "BB desk" → older, parked for him.
- W3 lead 4 — "TBD" refused by the landing box → the words file corrected.
- W1 S13 — the order of a hand switch and the wave flying → RECORD, parked for him.

**Astra's code read (codex, on `52163215d`):**
1. Two clashes worded the same collapsed into one → fixed (per pair).
2. A typed overnight B on a published day is read with today's settings → parked for job 4 (D2005).
3. Next week's Monday read without the kept rules → fixed (`2543c77c4`).
4. The template desk's own ring → fixed (`2543c77c4`).
5. A flying shift under Advisory → fixed (`2543c77c4`).

**The fresh blind Opus read (on `52163215d`):**
1. – 3. the same three faults as Astra's 1, 3 and 4, found apart → fixed.
- (a) the Logic line "checked as a sortie is" left out the turns → fixed.
- (f) an input's clash carries no items, so it is keyed by its words → parked (filed as a tidiness note).
- Both reads answered the parity question the same way: leaving the items off the stored record is right.

**Narrow re-reads (fresh Opus, each fix round):**
- Round 1: four faults in the first fix (merging two clashes into one line hid the second's man) → the per-pair design,
  `a557e8d02`.
- Round 2: the drop's new-warning check did not key by items; Edit Schedule's preview kept an old drawing after a
  Logic change → fixed, `af7e7528c`.
- Round 3: the preview's key left out the debrief → fixed, `fbddc708b`. No other finding.

**Tidiness notes (filed, not fixed — D489):** the clash item's placement; the mute key minting ids in a read path; the
`flies` flag threaded by hand; two functions for "does this desk's wave fly"; two dead word helpers in reporting; two
doors for the kept rules; the shift's special case inline; the desk check reading the day twice; the preview's day
never cleared.

## Pictures for him

| Picture | Caption |
|---|---|
| `w1/s18-desktop-r1/s18-3-week-amber-d.png` | D2003 — a day made a PH after publishing: "Publish this day again so OIL is earned. The PH was set after the day was published." |
| `w1/s19-desktop-r1/s19-4-week-amber-d.png` | D2004 — the PH removed after publishing: "Publish this day again to withdraw the OIL. The PH was removed after the day was published." |
| `rewalk/r3-desktop-b/r3-2-R-desk-d.png` | D1997 — once the AVALON flies, Ranger's puck on the AVALON SXO desk wears the red clash ring |
| `rewalk/r3-phone-a/r3-2-R-desk-p.png` | D1997 — the same on a phone |
| `rewalk2/q1a/q1-3-two-lines.png` | D2001 — two clashes worded the same: the hidden one stays struck, the new one is red |
| `rewalk3/t1-showing/t1-3-right-after-press.png` | D2001 — the drop says so in red the moment the second clash is made |
| `w2/a3/s20-3-renamed.png` | D2001 — a hidden clash stays hidden when the ground row is renamed (same man, same two items) |
| `rewalk2/q2a/q2-2-flying-red.png` | D1996 — a shift that flies: "Ranger — SC PM & SC AM clash" in red |
| `w2/b2/s05-1-crew-list-flying.png` | D1996 — the crew list crosses him out: "already on LECTURE 09:00–10:00" |
| `w3/s31-r2/3-unreadable-warn.png` | D1995 — a typed line with no readable clock: "VL: reporting line 1 has no recognised clock. Check the time." |
| `w3/s23-r4/sat-0929-warning-crop.png` | D1990 — Friday's landing left blank: his day ends at the 19:30 take-off plus the 2h debrief, so Saturday's B 09:29 breaks his crew rest |
| `w3/s25-r2/sun-duty-untimed-warn.png` | D1993 — a duty row with no times is a seventh day in a row |
| `w1/s14-desktop-r1/s14-a-warn-d.png` | D1999 — "SC takes off and lands at the same time (08:00) … the shift still earns from its R or B" |
| `w2/c3/s17-D-1-list.png` | F3 — one same-time line hidden; the other keeps its amber box |
| `w1/s09-desktop-r1/s09-2-viewonly-after-d.png` | D1991 — after the brief lead is raised, the published day still reads B 09:40 |
| `rewalk2/q3c/q3-4-viewonly-preview-after.png` | D1991 — View-only's next-week preview of a published day keeps 09:40 too |
| `w3/s37-r1/a-avalon-note-crop.png` | D1994, D1997 — "The AVALON desk — until the AVALON flies, checked only for…" |
| `rewalk/r4a/r4-0-logic-d.png` | The Logic page's two reworded lines (desktop) |
| `rewalk/r4a/r4-0-logic-p.png` | The same on a phone |
| `w3/s35-r4/2-seated-warn.png` | NOT BUILT, his words wanted — Ratchet on leave on a BRIEFING row: the list reads "On leave but tasked — BRIEFING"; "On leave + flying" is the Logic page's name for it |
| `w3/s23-r4/sat-0929-warning-crop.png` | NOT BUILT, his words wanted — the same line says "Friday landed 19:30" though no landing was typed (19:30 is the take-off) |

All under `docs/img/handpass/2026-11-12-rules-check-fixes/`.

## The closing lines

`Walk: docs/handpass/2026-11-12-rules-check-fixes.md · 654 pictures · 17 surfaces · 45 orders · MISSING: 3 fixed (the template desk's own puck ring, a second clash worded the same, the drop's red message for it), 0 ruled, 0 filed`

`Docs: OUTSTANDING 170 items (+2 −1, −1 all in ARCHIVE) · DECISIONS D1–D2005 (new: D1983, D2002, D2003, D2004, D2005) · homes OK`
`docsize: OK`

The 17 surfaces walked: Edit Schedule's week, the Scheduler Board, View-only Sched, the day's warning list, the crew
list, OIL Earn, the Leave War's OIL credit and figure, the Leave War's Event sheet, the Calendar window's holidays list,
the Logic page, the duty-template sheet (from Admin and from + Block), the Inputs page, Insights, Edit Schedule's
next-week preview, View-only Sched's next-week preview, the drop's passing message, the published face.
