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
   (`dbd8e9a4e`), walked in the same build with its drawing check — the next chat writes the build and its main script
   here.
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

## 7. Cases carried by a test

## 8. The pictures

## 9. The break tests

## 10. Errors seen

## 11. Not walked, and why

## 12. The code reads

## 13. Gates

## 14. What the walk found, and each disposition

## 15. The Walk line
