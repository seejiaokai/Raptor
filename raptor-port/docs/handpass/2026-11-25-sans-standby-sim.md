# Bug check — standby lines never ask a SANS man; an untimed sim strikes him; struck at once where his filing misses; the crew list never tells the scheduler to file (his D2584 Q4, Q5, D2586, D2585, D2587)

Branch `claude/sans-leftovers-179`, pull request 848. One check for the batch (his D485): D2584 Q4 and Q5 with D2586
(chat 181, `ee6c9b0a7`, `6acc639d9`), D2585 (chat 182, `c02d68793`) and D2587 (chat 182, `cdb605dff`) — each built red
first with its own tests, walked and read together because all four change one calculation (the crew list's per-seat
SANS reason) and its readers. Walked on the frozen build `D:/raptor-work/c182-build` (`index-CRvIUIHo.js`, commit
`cdb605dff`). Pictures: `docs/img/handpass/2026-11-25-sans-standby-sim/`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL, who counts as present) | NO — the SANS reason, warning and reminder only; nothing earns, and the counts of who is present read other questions (`dayTasked`, `dayAway`). |
| 2 | The published record | NO — nothing published or signed changes; a published day's warning list re-reads the rule (row 12 of §3 walks it). |
| 3 | Saved data | NO — nothing is written. |
| 4 | A shared drawer | YES — the per-seat reason feeds the crew list on Edit Schedule and the Board, its count, the drag hover, the drop's note and the green rings. |
| 5 | A new gesture or mode | NO. |
| 6 | A new surface | NO. |
| 7 | Roles | NO — the crew list is a scheduler's (an admin's); his bell is his own, unchanged in who sees it. |
| 8 | The warning list / how a rule is read | YES — the warning list and his reminder stop reading standby lines; the untimed-seat rule reads sims and mismatched filings. |

**Tier: FULL** (questions 8 and 4).

## 2. The rulings that apply

| Ruling | In the app's words | Checked by |
|---|---|---|
| D2584 Q4, D2576, D2578 | SC MAIN, SC SPARE, BB and AVALON never strike, warn or remind a SANS man — flying or not, timed or not | the tests; the walk (B) |
| D2584 Q5, D2586 | An OFT or AMT seat with no times strikes a man with nothing filed, its extra places too | the tests; the walk (A, B) |
| D2585 | Before the times are typed, a man whose filing does not offer the event is struck at once, "SANS — not offering …"; one who offered it with hours stays plain until times are typed | the tests; the walk (A) |
| D2587 | A man SANS from a date ahead reads "SANS from Fri 17 Jul: no availability filed" — never told to file; his own bell keeps "Tap to file for availability." | the tests; the walk (A) |
| D2573 | Nothing filed, a flight with no times: struck in the timed words | the tests; the walk |
| D2568, D2564 | His reminder counts flying seats and sims with nothing filed, a seat with no times too; never a ground row, a desk, all hands, a cancelled line | the walk (B) |
| D2420 | With no seat picked, no reason line under a man struck for nothing filed | the walk (A) |
| D2338, D2340 | Before his SANS date he is an ordinary man | the walk (A) |
| D2579, D2584 Q2/Q3 | The amber nothing-filed warning line and the "offered Fly only" words — NOT built here; the warning list's silence on nothing filed and today's "not offering" words stand | the walk (RECORD) |

No clash between them found. D2585 narrows D2573 ("a man who has filed something is unchanged") and D2587 narrows
D2340's words; both recorded by him, the older tests changed to follow.

## 3. The roll-call

| Place the answer shows | SHOW | USABLE | PAINTED beside it |
|---|---|---|---|
| 1. Edit Schedule crew panel, seat picked — desktop | YES — the same words as the board for every kind of seat (A W1wk-d, F17, F22; B F6, F9) | YES — the week's "+" and seats arm it | the panel's other reasons (front-seat rule, crew rest) first where they apply |
| 2. Edit Schedule crew panel, seat picked — phone | YES (A W1wk-p, F17-p; B F6, F9 phone) | YES — but one phone run of four did not arm the week's OFT "+" (A lead 4, filed `[SANS-STANDBY-WALK-LEADS]`) | every reason line inside the panel at 402 (B fit) |
| 3. Scheduler Board crew list, seat picked — desktop | YES — standby plain; untimed OFT / AMT and extras struck; "not offering …" before times; D2587's words (A W1r, F1, F4, F17; B F5–F9) | YES | absences, the front-seat rule, crew rest and "already on" come first, unchanged (A F20) |
| 4. Scheduler Board crew list, seat picked — phone | YES (the same runs at 402 WebKit) | YES — tap-to-plan; a tap in the middle of an empty extra place under a seated man picks the man (older, filed `[SANS-STANDBY-WALK-LEADS]` (1)) | every line inside the panel at 402 |
| 5. Crew list, no seat picked (D2420) | YES — struck, no reason line, the reason in the hover title (A F13/F14) | YES | O2 / Fable Q4: struck all day on a standby-only day (older, his question) |
| 6. The "N free" count | YES — equals the names drawn free at every step (6 / 0 / 0 / 0 / 6, A F13) | n/a | — |
| 7. The drag hover over a seat | YES — standby no SANS words; the OFT the exact words (A F11, F17, W1d) | YES — desktop mouse, a finger in Chromium at phone size (WebKit drags cannot be scripted) | a carried name from the crew list scrolls the crew list, not the board, at the edge (older, filed (3)) |
| 8. The note after a drop or a tap-to-plan | YES — standby "planned" or its own reason; the sims the SANS words; after R1's fix a "not offering" drop on an untimed sim carries the warning line, as an untimed flight's does (R1 re-walk) | YES | on a weekend an untimed sim's first drop shows the OIL note first (as on `main`, D2573's sheet §14) |
| 9. The green "where can he go" rings | YES — every standby seat rings for Ranger with nothing filed; flights and untimed sims do not; filed, they do (A F12; B F6) | n/a | occupied seats not ringed, unchanged |
| 10. The warning list and his puck's amber "A" | YES — never a standby line (B F10/A6, N9; A F21); after R1's fix an untimed OFT / AMT "not offering" warns, with the amber "A" on the board and the week (R1 re-walk, both sizes) | n/a | the amber "A" is per man per day, so it stands on his standby puck too (B lead 1, A F21) — a question for him |
| 11. His bell's SANS reminder (as him) | YES — counts flights and untimed sims with nothing filed, never standby, ground, desks, all hands, a cancelled line (B F10, F15, F18, F19, A20; A F4, F17) | YES — tapped, opens the SANS calendar on the day (B F15; A plain-user round) | ends "Tap to file for availability." (D2587 keeps it) |
| 12. A published day, and its next amendment | YES — the warning list before publishing, after, and with an amendment open names only the flight (A F21) | YES | publishing says only "Friday published and approved" — nothing for nothing filed (Fable Q5, recorded) |
| 13. A standby seat's other reasons (currency, busy, leave) — unchanged | YES — leave, ATT C, the front-seat rule, SDO duty, crew rest, "already on" all shown as before (A F20) | n/a | no SC-currency line seen for a SANS man (recorded) |
| 14. The wording row (lesson 33): every line of words above read as its reader | YES — every crew-list, hover and note line states a fact to the scheduler; none tells him to file; Ranger's own bell asks him to file (A §Lesson 33; B fit at 402) | n/a | — |

## 4. The five sizing lines

1. **Type:** A (a rule inside one shared calculation — the per-seat SANS reason, the warning list's SANS check and the
   reminder's reading of "planned") with D (its answer drawn in several places, each by its own code) and a wording
   change (D2587) whose line is drawn in four places.
2. **What only a walk could find:** whether each place that reads the answer shows it for each kind of seat (every
   standby row MAIN / SPARE, flying by B, R or the tick; a sim's seats and extra places; a half-typed sim) at both sizes on
   both pages; that the crew list, the warning list and his bell agree for one man on one day (lesson 32); that the new
   words read right to the person who sees them (lesson 33); that publishing, Undo, a filing changed and a week changed
   follow. The tests hold the calculation; none proves a screen reads it.
3. **The ledger:** the type-A walks of the SANS gate (w11–w14 of 24–25 Nov, D2573's of 25 Nov) found their faults in the
   places that READ the answer and in words (lesson 32; D2587 found by him after D2573's walk passed its words).
4. **The walk chosen:** two Opus walkers (D2256) on the frozen build `D:/raptor-work/c182-build` (`index-CRvIUIHo.js`,
   `cdb605dff`), A on port 4891 (crew lists, words, drags, rings, notes, phone, publish), B on 4892 (standby, the bell,
   filings, cancels, weeks); every scenario of both designers, combined by the host (§5), at 1536 desktop and 402 phone
   WebKit; the plain-user round (§7.0a) by each. Carried by the tests: the repeated standby rows beyond one of each kind
   walked (`sans-standby-sim.test.ts`), each D2585 filing pair beyond one per event walked (`sans-notimes-offer.test.ts`).
   Lessons 32 and 33 are in each walker's brief; 3, 9, 22, 23b, 25, 28, 30 apply as in D2573's sheet; the others do not
   (no window, gesture, layout, keyboard, print or new motion in this change).
5. **After the walk:** its row in `docs/walk-ledger.md`.

## 5. The scenarios (Astra and a fresh Fable, blind to each other, combined by the host)

Fable: 23 scenarios, 12 negatives, 5 questions (`docs/superpowers/briefs/2026-11-25-sans-standby-sim-scenarios-fable.md`);
Astra: 20 scenarios, 12 negatives, 2 questions (`…-scenarios-astra.md` — Astra's head says it opened the handoff before
applying the brief's exclusion: not blind, so its list is weighed as a designer that saw the builder's notes). Their
questions since answered by him: Fable Q1 and Astra Q1 → D2585; Fable Q2 and Astra Q2 → D2586. Still open, RECORDED by
the walk: Fable Q3 (a sim with one time typed), Q4 (the no-seat-picked look on a standby-only day), Q5 (publishing says
nothing for nothing filed on an untimed sim). D2585 and D2587 are walked through the designers' own scenarios that hold
them (F1, F2, A12; F17, A17), their EXPECTED lines rewritten by the host from his rulings. The combined map and the
EXPECTED lines that replace theirs: `docs/superpowers/briefs/2026-11-25-sans-standby-sim-walk-brief.md`.

## 6. The orders walked

Walker A (`docs/handpass/parts/sss-w1A-report.md`, copied whole from `D:/raptor-work/c182-walk/A-report.md`): F1/A12, F2, F3/A11, F4/A13,
F11/A15, F12/A16, F13+F14/A14, F16, F17/A17, F20/A19, F21/A9, F22, N1–N4, N12, the week view (W1wk) and the plain-user round,
desktop and phone. Walker B (`docs/handpass/parts/sss-w1B-report.md`): F5/A10, F6/A1, F7/A2, F8/A3, F9/A4, F10/A5–A6, N9,
F15/A18, F18/A8, F19/A7, A20, N1, N2, N6, N10–N12, the fit at 402 and the plain-user round, desktop and phone. Orders among
them: filed then planned and planned then filed (F15), placed then timed then cleared (F16), standing by → flying by B → by R →
B cleared (F6), ticked → unticked → ticked (F7), cancelled → un-cancelled, removed → Undo (F19, plain-user round), weeks
changed (F18). The host's re-walk of R1's fix (chat 185, `scripts/handpass/sss-r1.mjs` on the frozen build
`D:/raptor-work/c185-build`, `index-SXKkjfaJ.js`, commit `d95a37cae`): Ranger "Fly only" tapped into an untimed OFT on the
board and an untimed AMT from Edit Schedule's week, Jester "OFT only" on an untimed flight beside them, his bell — desktop 13
PASS, phone 13 PASS, 0 FAIL, 1 RECORDED each (a first desktop run's 2 FAILs were the script's own expectation of the note's
words, corrected and re-run).

## 7. Cases carried by a test

The repeated standby rows beyond one of each kind walked (`sans-standby-sim.test.ts`); each D2585 filing pair beyond one per
event walked, and R1's warning on an untimed OFT / AMT (`sans-notimes-offer.test.ts`); the surfaces' agreement on one man
(`sans-notimes-surfaces.test.tsx`); D2587's words (`leavewar/sans-ahead.test.ts`); the reminder's standby skip
(`leavewar/sans-planned-r5.test.ts`, `sans-unfiled.test.ts`).

## 8. The pictures

3,439 in `docs/img/handpass/2026-11-25-sans-standby-sim/`: walker A 1,077 (`A/`), walker B 2,298 (`B/`), the R1 re-walk 64
(`R1/R1-d`, `R1/R1-p`). Deciding pictures opened by the host: A's three script FAILs (`A/W1r-d/W1r-w1-fl-win-FCP-desktop.png`
— the flight's B is 06:10, so Rebel's Fly 08:00–10:00 does not cover it, the existing sortie window; `A/F4-d/F4-f4-oft-slots4oft2p-clip-desktop.png`
— Otter, a WSO, "WSO — cannot fly front seat" before any SANS reason); the R1 re-walk's warning lists
(`R1/R1-d/R1-r1-all-warn-clip-desktop.png`, `R1/R1-p/R1-r1-all-warn-clip-phone.png`: three amber lines, Jester's flight and
Ranger's AMT and OFT), the board puck (`R1-r1-oft-puck-clip-desktop.png`) and the week's pucks with the note
(`R1/R1-p/R1-r1-week-pucks-phone.png`: the amber "A" on both sims, the note "Ranger — SANS: not offering AMT today. Planned
on Sim SS AMT U").

## 9. The break tests

`scripts/handpass/breaks/sss-batch.json`, run under the checks lock (chat 185): **7 of 7 caught** — the standby skip in the
crew list (6 tests red), in the warning list (1), in his reminder (6); D2585's "not offering" before times (7); D2584 Q5 /
D2586's untimed sims (7); R1's read of the untimed sims (4); D2587's words (1). Every source file back as it was.

## 10. Errors seen

None — no console errors, page errors or failed requests in any cited run of either walker or the R1 re-walk.

## 11. Not walked, and why

- Phone drags in WebKit: cannot be scripted (`docs/walk-scripts.md` §4); F11 walked by a finger in Chromium at the phone's
  size, every WebKit placement by tap-to-plan.
- F22.4 on the phone (Edit Schedule tap-to-plan into the week's OFT "+"): two presses did not arm (lead 4, filed); the same
  press is walked on the phone in W1wk-p, F17-p and F13-p and the R1 re-walk (the AMT "+").
- The desktop's Edit Schedule crew panel has no open / close (always shown).

## 12. The code reads

Both blind, each on an exported copy of `cdb605dff` at `D:/raptor-work/c182-r1` (no handoff block, walk report or sheet of
this round), the same brief (`READ-BRIEF.md` there, D56's exclusion in it, D2579 and Q2's words named not built), chat
182, 25 Nov 26, run beside the walk (the order's §4 table: a reader on a commit and a walker on a frozen folder together).

- **Astra** (`gpt-6-astra`, high, read-only; report `docs/handpass/parts/sss-read-astra.md`): **one finding, confirmed by
  reading** — R1 below; explicit negatives on every standby kind (built-in and from a saved template, MAIN, SPARE, B, R,
  the Flies tick), standby desks, sim extras and passengers, one-time-typed sims, cancellation, the order of the earlier
  and later checks, roles, read-only views; eight "needs a run" checks, each walked (§14) or carried by a test (§7).
- **A fresh Opus reader** (report `docs/handpass/parts/sss-read-opus.md`; its proof test lived in the chat's scratch and is
  carried into `sans-notimes-offer.test.ts`): **the same finding (its O1)** and one observation (O2); explicit negatives on the same areas plus the
  bell, the warning list and the crew list picking out exactly the same standby rows, D2587's words from one source.
- **R1 (both readers) — fixed red-first, `7b203d113`.** A SANS man whose filing does not offer the sim ("Fly only"),
  planned on an OFT or AMT with no start time: the crew list struck him "SANS — not offering OFT" (D2585) but the warning
  list said nothing, because a sim with no start puts its people in `day.blank`, which the SANS check never read; an
  untimed flight already warns. Reproduced by the host with the reader's proof test (warnings 0, expected 1). Fixed:
  the check now reads `day.blank`'s OFT / AMT entries with an unknown window, so only "not offering" raises, in the
  existing words ("SANS: not offering OFT today. Planned on Sim EP-9"); nothing filed stays silent (D2579 not built).
  Tests: `sans-notimes-offer.test.ts`, red 4 of 19 first. The fix is new code: one fresh Opus narrow read of
  `7b203d113` (§12a). Re-walk of what it touches: §14.
- **O2 (the Opus reader's observation) — a question for him, not a finding:** with no seat picked, a SANS man with
  nothing filed is struck for the whole day and left out of "N free" even on a day whose only places need no filing
  (standby, ground, desks) — the 14 Aug 26 "struck by default" rule, older than this change; the same as Fable's Q4.
  On his look card.

### 12a. The narrow read of R1's fix

A fresh Opus reader on `7b203d113` alone (chat 182): clean. Two minor notes, no action: two untimed rows with the same label
fold into one warning line (the list's existing fold of identical lines); a row with no label reads "Sim undefined" (older,
the same on a timed sim).

## 13. Gates

GitHub's run on `cdb605dff` failed only the phone-fit browser test's two-line check (the shorter D2587 words fit one line at
402) — fixed in `266b5e9f0`. The run on the branch head `d95a37cae` was in progress at chat 185's start; the result on the
last pushed commit is read before his look is asked for (the handoff's line). The break tests' seven test files ran green
before and after every break.

## 14. What the walk found, and each disposition

- **R1 (the two reads; also walker A's lesson-32 disagreement):** fixed red-first (`7b203d113`), re-walked at both sizes on
  both pages (§6) — PASS.
- **Walker A's three FAIL rows, walker B's two:** the scripts' own expectations (§8; B's report §The table) — no app fault.
- **The amber "A" stands on his standby puck too** (B lead 1, A F21): the chip is per man per day, as built; whether "standby
  never warns" (D2584 Q4) should reach the chip is his question — on his look card.
- **O2 / Fable Q4** (struck all day with no seat picked on a standby-only day) — his question, on the look card. **Fable Q3**
  (start-only sim timed, end-only untimed) and **Q5** (publishing says nothing for nothing filed on an untimed sim) —
  recorded as built (A F3, F21).
- **Older leads, filed** `[SANS-STANDBY-WALK-LEADS]`: a phone tap on a sim's empty extra place under a seated man; an empty
  first extra place; a crew-list name not scrolling the board at its edge; one phone run's week "+" not arming.
- **Known, recorded before:** an untimed sim's first weekend drop shows the OIL note first (D2573's sheet §14, as on `main`).

## 15. The Walk line

`Walk: docs/handpass/2026-11-25-sans-standby-sim.md · 3,439 pictures · 14 surfaces · 36 orders (A 19, B 16, R1 1) · MISSING: 0 — R1 fixed and re-walked; 4 older leads filed [SANS-STANDBY-WALK-LEADS]; 2 questions to him (the amber "A" on a standby puck; struck all day with no seat picked)`
