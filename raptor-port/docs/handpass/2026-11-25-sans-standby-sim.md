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
| 1. Edit Schedule crew panel, seat picked — desktop | | | |
| 2. Edit Schedule crew panel, seat picked — phone | | | |
| 3. Scheduler Board crew list, seat picked — desktop | | | |
| 4. Scheduler Board crew list, seat picked — phone | | | |
| 5. Crew list, no seat picked (D2420) | | | |
| 6. The "N free" count | | | |
| 7. The drag hover over a seat | | | |
| 8. The note after a drop or a tap-to-plan | | | |
| 9. The green "where can he go" rings | | | |
| 10. The warning list and his puck's amber "A" | | | |
| 11. His bell's SANS reminder (as him) | | | |
| 12. A published day, and its next amendment | | | |
| 13. A standby seat's other reasons (currency, busy, leave) — unchanged | | | |
| 14. The wording row (lesson 33): every line of words above read as its reader | | | |

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

## 7. Cases carried by a test

## 8. The pictures

## 9. The break tests

## 10. Errors seen

## 11. Not walked, and why

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

## 13. Gates

## 14. What the walk found, and each disposition

## 15. The Walk line
