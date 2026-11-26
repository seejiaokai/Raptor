# Bug check — the warning list's SANS lines: an amber line for nothing filed, the mismatch line naming what he offered, the check's name, the Logic line and the Legend (his D2579, D2584 Q3 / 2a / 3b, D2583)

Branch `claude/sans-warnlines-185`, pull request 850 (it holds pull request 848's commits too, until 848 merges). The
piece was built red-first in chat 185 (`src/engine/sans-warn-lines.test.ts`, 14 tests, red 12 of 14 before), its 36
older tests decided one by one in chat 186 (`33c916756`, `1d50184c9`; `docs/superpowers/briefs/2026-11-25-sans-warnlines-wip.md`),
`main` brought in at `59207b6c1` (chat 203 — notes only, no app code on either side clashed). Walked on the frozen build
`D:/raptor-work/c203-build` (§4). Pictures: `docs/img/handpass/2026-11-26-sans-warnlines/`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL, who counts as present) | NO — a warning line and its puck mark only; nothing earns, and the counts of who is present read other questions. |
| 2 | The published record | NO in what is written — publishing, signing and the issued copy are not changed; YES in what a published day's face shows (a new line can stand on a day published after this change) — walked (B: F27, F28, A1–A3). |
| 3 | Saved data | NO — nothing new is stored; a hide is kept with its day as before. |
| 4 | A shared drawer | YES — the line is drawn on Edit Schedule's list, View-only Sched, the Board's panel and the ⓘ popup, and its ring and "A" on every copy of his puck. |
| 5 | A new gesture or mode | NO. |
| 6 | A new surface | NO. |
| 7 | Roles | NO — who sees the warning list is unchanged. |
| 8 | The warning list / how a rule is read | YES — a new line, new words for the mismatch line, the check's name and the Logic line. |

**Tier: FULL** (question 8, with 4).

## 2. The rulings that apply

| Ruling | In the app's words | Checked by |
|---|---|---|
| D2579, D2584 Q3, D2583 | One amber line for a SANS man in a flying seat or a sim with nothing filed — "SANS: no availability filed for today. Planned on VL BFM (T/O 13:00)" — the amber ring and "A", telling nobody to file | `sans-warn-lines.test.ts`; the walk (A, B, C) |
| D2584 2a, D2570 | The mismatch line names what he offered — "SANS: offered Fly only today. Planned on …"; OFT against AMT a miss too | `sans-warn-lines.test.ts`, `sansavail.test.ts`; the walk (A) |
| D2584 3b | The check's name "SANS availability — not filed, or planned outside it"; the Logic line "A SANS man planned outside the event or the hours he filed, or with nothing filed." | `sans-warn-lines.test.ts`; the walk (A, C) |
| D2583 | The Legend's amber "A": "advisory — shift, ground or SANS availability" | `html.test.ts`; the walk (A) |
| D2573, D2584 Q5, D2585, D2586 | A seat with no times raises it too, a sim's extra places as its seats; an hours line waits for times | `sans-notimes-offer.test.ts`, `sans-notimes-strike.test.ts`; the walk (A) |
| D2584 Q4, D2576, D2578, D2564 | Never a standby row, a ground row, a desk, all hands | `sans-standby-sim.test.ts`; the walk (A, C) |
| D2338, D2340, D2313, D2341, D2329 | Before his SANS date an ordinary man; only a day he is SANS | `leavewar/sans-ahead.test.ts`; the walk (C) |
| D2420, D2587 | No reason line with no seat picked; the crew list never tells the scheduler to file | the walk (C) |
| D469, D471, D472, D475 | A hidden line struck in place for everyone, no flag on the pucks, the count drops it, back by itself when the situation changes | `warnmute-week.test.ts`; the walk (B) |
| D179, D183–D185, D2005 | A published face frozen; a later change pending; qualification and crew-rest warnings alone live | the walk (B) |

(clashes: to be filled after the walk)

## 3. The roll-call

| Place the answer shows | SHOW | USABLE | PAINTED beside it |
|---|---|---|---|
| 1. Edit Schedule's warning list — desktop 1536 | | | |
| 2. Edit Schedule's warning list — phone 402 | | | |
| 3. View-only Sched's warning list (a member, Ranger) | | | |
| 4. The Scheduler Board's issues panel — desktop and phone | | | |
| 5. The day-info popup (ⓘ) | | | |
| 6. The day's "N issues" count and bar colour; the week's day bars | | | |
| 7. His puck in the seat — ring and "A" | | | |
| 8. His puck on the crew list | | | |
| 9. His puck on the SANS availability card, a ground / Personal Inputs row, the Unavailable row | | | |
| 10. Hiding the line (✕), the Reset arrow, flagging again | | | |
| 11. Pressing the line (what lights) | | | |
| 12. The note after a drop or tap-to-plan | | | |
| 13. Edit Schedule's Legend | | | |
| 14. The Logic page's check list | | | |
| 15. Publishing; the published face; the amendment | | | |
| 16. The printed day | | | |
| 17. The demo week as it boots | | | |
| 18. The readers of the same answer (lesson 32): the crew list's reason and "N free", the warning list, the chip, his bell's reminder | | | |
| 19. The wording row (lesson 33): every line above read as its reader | | | |
| 20. The squadron guide's copy of the Logic page (`docs/squadron-guide/logic.json`, `talon-guide.html`, the published guide page) | NO, because the guide is a snapshot sent to other squadrons, rebuilt by hand when the rules change (its README) — it still reads "Filing nothing raises nothing." | n/a | filed: rebuild the guide once this is live ([USER-GUIDE]) |

## 4. The five sizing lines

1. **Type:** A (a rule inside one shared calculation — the warning list's SANS check) with D (its line and its mark
   drawn in several places, each by its own code) and wording (the mismatch line, the check's name, the Logic line,
   the Legend).
2. **What only a walk could find:** whether every place that draws the day's warnings shows the new line with the same
   words and counts at both sizes; whether every copy of his puck wears the ring and "A"; that hiding, publishing, Undo,
   a filing changed, his SANS date moved and a seat moved each follow; that the crew list, the warning list, the chip
   and his bell agree for one man on one day (lesson 32); that each new line reads right to the person who sees it
   (lesson 33); the demo week as it boots. The tests hold the calculation and the words; none proves a screen reads them.
3. **The ledger:** the type-A walks of the SANS gate (24–25 Nov 26: w11–w14, D2573's, the standby / untimed-sim batch's)
   found their faults where the answer is READ and in the words — lesson 32's disagreement (the warning list silent while
   the crew list struck him) was the last one, found by both blind reads and seen by walker A.
4. **The walk chosen:** three Opus walkers (A, B, C — the walk brief) on one build of the branch head, desktop 1536 and
   phone 402 WebKit, every scenario of both designers combined, the plain-user round by each. NOT STARTED in chat 203:
   the checks lock was held all day by chats 190 and 201; the head now also carries the crew list's words and column
   (`dbd8e9a4e`), walked in the same build with its drawing check. **Chat 207:** `main` brought in (`ab72316f4`, pull
   request 855's code-check fix with it); the checks lock taken; built once into `D:/raptor-work/c203-build` (main script
   `assets/index-ZgGJLqIy.js`); walkers A, B and C started on it. The crew list's words and column get their own scenario
   designs (Astra and a fresh Fable, blind — `docs/superpowers/briefs/2026-11-26-sans-crewcol-scenarios-brief.md`) and
   their walk with the drawing check on the same build.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## 5. The scenarios (Astra and a fresh Fable, blind to each other, combined by the host)

Fable: 40 scenarios, 15 negatives, 8 questions (`docs/superpowers/briefs/2026-11-25-sans-warnlines-scenarios-fable.md`);
Astra (gpt-6-astra): 32 scenarios, 15 negatives, 3 questions (`…-scenarios-astra.md`); both read an exported copy of
`33c916756`. The combined map, who walks what, and the EXPECTED lines that replace theirs:
`docs/superpowers/briefs/2026-11-26-sans-warnlines-walk-brief.md`.

**Their questions, checked against the rulings before any goes to him:**
- Settled by a ruling, so walked to its EXPECTED line: Fable Q3 and Astra Q2 (a hidden line after the situation changes —
  D469, D475); Fable Q5 (a published day's line after he files — D179, D2005: frozen until republished); Fable Q1 (the
  line's words for a man whose posting has not run — D2584 Q3 rules the words for every SANS man; D2587 narrowed only the
  crew list's); Astra Q3 (wrong event and wrong hours at once — the event is judged first, as the line's words in D2584 2a
  speak only of the event; RECORDED).
- Not settled, RECORDED by the walk and put to him with its pictures: Fable Q2 / Astra Q1 (one line per seat, as built,
  or one per man a day); Fable Q6 / Q7 (the words for a sim with no name, and whether an untimed sim says "(no times
  yet)"); Fable Q8 (a man on leave as well: one line or both); Fable Q4 (a cancelled line) — only if the line stands there.

## 6. The orders walked

Chat 207, on the frozen build `D:/raptor-work/c203-build` (`ab72316f4`, `index-ZgGJLqIy.js`), desktop 1536 and phone 402
WebKit, every scenario of both designers combined (the walk brief), the plain-user round by each: walker A (the line on
every kind of seat, its words everywhere — 14 cited runs), B (hiding, publishing, Undo, marks, the note, print), C (his
SANS date, filings, moves, the demo week, the Logic page). The crew list's words and column: a second scenario round
(Astra and a fresh Fable, blind — `D:/raptor-work/c207-design/`, combined in
`docs/superpowers/briefs/2026-11-27-sans-crewcol-walk-brief.md`), walked by B on the same build with the drawing check.
Reports: `D:/raptor-work/c203-walk/{A,B,C}-report.md`, `D:/raptor-work/c207-walk/B-report.md`.

## 7. Cases carried by a test

A hidden OFT line never hides an AMT line worded the same (`src/engine/sans-hide-event.test.ts`); each SANS man's puck as
wide as what he is drawn as, the column after the drawn reason, no reason wrapped on a desktop beside a man's hours
(`e2e/sans-unfiled-wrap.spec.ts`); the rest as §2 names.

## 8. The pictures

`docs/img/handpass/2026-11-26-sans-warnlines/{A,B,C}/` (about 4,100, each walker's cited runs); the crew list's
`docs/img/handpass/2026-11-27-sans-crewcol/B/` (90 deciding); the drawing check `docs/img/handpass/2026-11-27-drawcheck-sans-col/`
(the walked build) and `…-sans-col-fixed/` (after the fixes). The host opened every deciding picture named in §14.

## 9. The break tests

The three red-first tests of §7, each red before its fix (2 of 2; 2 of 2 sizes; 1 desktop), green after.

## 10. Errors seen

None — every walker's console / page / request check passed on every run, both sizes.

## 11. Not walked, and why

The Logic page's switch-off (the check has no switch there); F9 / F13 (the app refuses a filing with nothing ticked and a
second filing a day — recorded); N2's brief / debrief rows (no seat to plant on; Astra's static case — question for him);
phone drags (WebKit drives none — every phone placing was tap-to-plan); the crew list at 375 / 320 and a true 125% start
(the flag did not take — his look on his PC, owed); A-09, C-05b/c, C-08, D-02 of the crew-list round.

## 12. The code reads

Three blind readers on an exported copy of `ab72316f4` (this round's papers taken out): Astra (gpt-6-astra) 3 findings,
a fresh Opus 3 + 3 notes, a fresh Fable 2 + 3 notes (`D:/raptor-work/c207-reads/`). Dispositions in §14. Not a security
change (no sign-in, roles or what one person sees of another).

## 13. Gates

GitHub's run on `ab72316f4` (`main` brought in, pull request 855 with it): every job green, the code check included.
The pushes of the fixes (`fd26cb170`, `a0cd010e8`) ran NO checks — `main` had moved 30 commits and the pull request
clashed (first read as green by the host, wrongly: an empty check list). `main` brought in again at `0787b0143` (the
clashes record files only — both handoff blocks and file-map entries kept, main's Leave War map line and this branch's
Scheduler line, the backlog tripwire 3350 with both reasons); the SANS and hiding tests 710 of 710 and the type check
after it. Its run is the one to read before his look.

## 14. What the walk found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | Walker C (Finding 1), host reproduced | Phone: a tap on Marlin's row planted Kraken — the new grid stretched each puck to the widest reason; the commit before the column planted Marlin | NEW, fixed `fd26cb170` (red-first); re-walked: Marlin planted 3 of 3 |
| 2 | Astra F1 | A hidden OFT line hid an AMT line worded the same; the two folded into one | NEW, fixed `fd26cb170` (red-first); re-walked by A on `c207-build2`, both sizes — PASS |
| 3 | Walker B (crew F1) | Desktop Board: one man's hours widened the letters' column; the widest reason wrapped | NEW, fixed `a0cd010e8` (red-first); the drawing check after: approved states match, the list 7px higher (its scroll) |
| 4 | Walker B (F21 / F25e), Fable F1, Astra F3, Opus F2, B crew F2 | The note after a plant: the warning line's words, but the crew list's when his line was hidden; Ranger's start date lost | A builder's reading against D2587's — his question 1 (the page) |
| 5 | Walker A (A6), Opus F1 | A sim's line says "Sim EP-9", not OFT / AMT, and prints an assumed end as if typed | Words — his question 2 (Fable adjusted) |
| 6 | Fable F2 | The amber "A" hover words miss "nothing filed" | Words — his question 6 (Fable adjusted) |
| 7 | Walkers A, C | The SANS tab ticks Fly · AMT · OFT; the card and lines F, O, A | Two surfaces (lesson 32) — his question 3 |
| 8 | Astra F2, Opus O2 | An AMT row renamed BRIEF / DEBRIEF keeps its men's line though its seats hide | His question, still to come (not walked) |
| 9 | Opus F3, Fable's note | Stale words in the scheduler page, engine-rules, the demo seed's comment; no contract for the column | Fixed `6b9c0aa3a`, `fd26cb170` |
| 10 | Host | Phone: a tap on the blank beside a short SANS name plants the man above — on the build before the column too | Older — filed `[SANS-STANDBY-WALK-LEADS]` (5) |
| 11 | Walker A | Sim "+" fills an empty seat first; a second extra place can leave the first empty (now on desktop too) | Older — `[SANS-STANDBY-WALK-LEADS]` (1)/(2), met again |
| 12 | Walker B (crew) | AM / PM under the letter; a free man's badge splits; AM / PM reasons in clock times | Builder's readings — his questions 7–9 |
| 13 | Walkers | One line a seat; on leave as well, two lines; a cancelled line goes | Recorded — questions 4 and 5; the cancelled line needs none |
| 14 | Walker B (crew) | Escape left Edit Schedule's panel on Saturday instead of Sunday (desktop) | A lead, not reproduced — to check with the next Edit Schedule job |

Clashes: none found between his rulings. His questions: https://claude.ai/artifact/Bu4f35Pm1R8X8sMsA3W4VC (rounds 1–2).

## 15. The Walk line

Walk: FULL — three Opus walkers on one build (A, B, C), both designers' scenarios, plain-user rounds, both sizes; the crew
list's own round and drawing check; 3 faults found and fixed red-first, each re-walked; reads: Astra, a fresh Opus, a fresh
Fable — 2026-11-26-sans-warnlines/{A,B,C}, 2026-11-27-sans-crewcol/B, 2026-11-27-drawcheck-sans-col{,-fixed}.
