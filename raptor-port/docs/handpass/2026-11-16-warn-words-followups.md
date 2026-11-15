# Evidence sheet — `[WARN-WORDS-STANDALONE]`'s follow-ups, chat 86 (16 Nov 26)

One check for four changes on `claude/warn-words-followups` (pull request 784): D2073 (an SC-template duty desk with no
END left out of crew rest), D2074 ("Illegal seat"), D2077 (the Logic page says "conflict") and D2075/D2078 (the Legend's
new names, built from the approved picture). Laid down before the walk (the checklist's step 4).
Pictures: `docs/img/handpass/2026-11-16-warn-words-followups/`.

## The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money — OIL, who counts as present | NO — a desk's worked time and OIL read its assumed hour as before (D2073 changes crew rest only); "who counts as present" is not read from crew rest — to be confirmed in the walk (ALL AVAIL, the crew list) |
| 2 | The published record | NO new mechanism — a day published after the change carries the new words and the new crew-rest reading; a day published before keeps its frozen lines (D56) |
| 3 | Saved data | NO — nothing new is stored; D2073 reads the duty block's existing template mark |
| 4 | A shared drawer | YES — the warning lines are drawn by the issues list, the Board, the day-details window, the peek, the foot note; the Legend is drawn on two pages |
| 5 | A new gesture or mode | NO |
| 6 | A new surface | NO |
| 7 | Roles | NO |
| 8 | The warning list | YES — what the seat warning says, and how crew rest reads an SC desk |

**Tier: FULL** (YES to 8).

## The rulings that apply

| Ruling | What it says, in short | Pinned by | Walk |
|---|---|---|---|
| D2073 | An SC-template desk, START typed, END blank: left out of crew rest until END is typed; a plain desk keeps START + 1h (the builder's reading) | `engine/assumedlanding.test.ts` "D2073" (red seen; two controls) | |
| D2055 | An SC wave line with no END left out of crew rest — unchanged | `engine/assumedlanding.test.ts` "D2055" | |
| D2074 | "Illegal seat" everywhere: the lines, the check's short name; the Legend keeps "qual / illegal seat" | `engine/warnwords.test.ts`, `engine/validate.test.ts`, `engine/scspare-rules.test.ts`, `engine/sansavail.test.ts`, `ui/drag.test.tsx` (changed, red seen) | |
| D2071 | The rest of the approved words stand (narrowed by D2074 on the one label) | `engine/warnwords.test.ts` | |
| D2077, D2070 | The Logic page says "conflict", never "clash"; "SC MAIN conflicts" | `ui/logic.test.tsx` "D2077" (red seen) | |
| D2075, D2078 | The Legend: days in a row, qual / illegal seat, misses flight/sim brief, misses flight/sim debrief, long day; only the words change, both sizes keep their height | `ui/html.test.ts` "D2078" (red seen) and the four Legend tests changed with it | |
| D56 | Demo data is not a finding | — | |

## The roll-call — every place the four changes show

Columns: does it SHOW the change · is the gesture USABLE there · what else is PAINTED there. YES / NO-because / MISSING,
filled in the walk.

| Surface | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| Edit Schedule's issues list — the seat line (desktop, phone) | | | | |
| Scheduler Board's issues list — the seat line | | | | |
| The puck's Q chip — its hover / tap words | | | | |
| The foot-of-screen note after tapping the seat line | | | | |
| The day-details window's warning rows | | | | |
| A day published after the change — 👁 its version, the seat line | | | | |
| A member's view (View-only Sched) — the seat line | | | | |
| Edit Schedule's issues list — the crew-rest line for an SC desk with no END (absent), then END typed (present) | | | | |
| The next day's crew-rest mark ("Breaks …" row) after an SC desk | | | | |
| The crew list / ALL AVAIL on the next morning after an SC desk | | | | |
| Sunday's SC desk → Monday (the week's edge, the peek) | | | | |
| The Logic page — Settings part ("SC MAIN conflicts") and Checks part ("Illegal seat", every "conflict") | | | | |
| Edit Schedule's Legend fold (desktop, phone; folded and open) | | | | |
| View-only Sched's Legend fold (the same builder, its second home) | | | | |

## The five sizing lines (§7.0)

1. **Type:** A (one rule inside the crew-rest calculation — which desks bear rest, D2073) + F (words: D2074, D2077,
   D2078) + D in part (the one seat sentence drawn by the issues list, the Board, the chip, the day-details window, the
   foot note, the history; the Legend drawn on two pages).
2. **What only a walk could find:** the SC template's mark reaching a desk through each real writer (+ Block → SC
   Shift, a template with "For wave", a day template, + Alt Plan, a published day loaded back, Undo / Redo, a reload)
   and NOT through a name typed on a plain block; the crew-rest readers agreeing after each END change (the list, the
   forward trace, the picker); the seat words on every drawer after a real placement; the Legend's two homes at both
   sizes; the Logic page as drawn. The unit tests cover the calculation and the strings; the drawing check covered
   Edit Schedule's Legend (0 pixels different at both sizes — host, `docs/mock/2026-11-16-legend-words/drawcheck.mjs`).
3. **The ledger:** the last walk of this family ([WARN-WORDS-STANDALONE], 16 Nov 26) — FULL, two Sonnet walkers then a
   re-walk, 753 pictures; the walk found 3 faults, the blind reads 6 more; W3 cost about 289k and 22 min.
4. **The walk chosen:** ONE Sonnet walker, Astra's ten scenarios in her order (`docs/superpowers/briefs/
   2026-11-16-warn-words-followups-scenarios-astra.md`), about 75 minutes, on the frozen build of `7eade5b52`. Desktop
   1536 Chromium for all ten; the phone (402 × 874 WebKit, touch) for 1, 8, 9 and 10 and one row of 7. Carried by
   tests, not walked: the seat warning for a pilot record carrying CAT IW, which no control can make
   (`engine/validate.test.ts`, `engine/avalon-rules.test.ts` — the new words, calling the check directly); the
   Legend's drawing (the drawing check above). The host proved the opening route first:
   `scripts/handpass/wwf/wwf-host-probe.mjs` (desktop) — SC desk END blank: no crew-rest line; END 23:00: "Ranger —
   Crew rest: Saturday duty ended 23:00 → clear 11:00. Report 06:40: 7h40 rest, needs 12h."; END cleared: none.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## The lessons of §7.11, each against a scenario or a test

| Lesson | Here |
|---|---|
| 1 state × reading | The SC desk's crew rest: no END / END typed / END cleared × working copy / published / amended — the walk's D2073 scenarios; the seat line: working copy / published 👁 / member's view |
| 3 after every press | each typed START / END and each tap on a seat line pictured with what tells the person it happened (the list's count, the ring) |
| 9 every list measured | the Legend's rows and the Logic page's lines measured at phone and desktop; the issues list's longest seat line |
| 22 what is drawn | the Legend and the lines judged on the pictures, not on the text in the page |
| 23 (first) the ruled window | a tap on a seat line opens what it opens on `main` today — recorded, not changed here |
| 23 (second) side-by-side boxes | the Legend's rows at an iPhone's width with an iPhone's letters (WebKit) as well as a desktop's |
| 25 every place the thing can be put | the seat line on a flight, a sim, a spare and an AVALON line; the SC desk on Monday-to-Saturday and on Sunday into the next week |
| 28 on a phone, what a press opens | the Legend fold opened on the phone and pictured before anything in it is read |
| 30 a picture after each tap on a phone | the Legend fold's tap and a seat line's tap, on the phone |
| 2, 7, 13, 20, 21, 26 (gestures, pinch, drags) | do not apply — no gesture changes |
| 4, 5, 12, 19 (windows) | do not apply — no window changes; the day-details window is only read |
| 6, 15, 24, 31 (scrolling, pinned bars, page fit) | do not apply — no layout or scroll changes; the Legend keeps its height (D2078), measured |
| 8 approved drawing | the Legend's approved picture: the build pictured beside it at both sizes (no part list exists for it; the words are the whole change) |
| 10 hidden page / 11 zoom-dependent / 17 show-hide | 17: the Legend fold opened and closed and the page measured after each; 10 and 11 do not apply |
| 14 keyboard, 16 refusal at a box, 18 print, 27 neighbours, 29 midnight | do not apply — no keyboard, refusal, print, neighbour or date change |

## Astra's scenarios

(to fill)

## Orders walked — what the screen said

(to fill)

## Cases carried by a test

(to fill)

## Break tests

(to fill)

## Errors seen

(to fill)

## What was NOT walked, and why

(to fill)

## The reads

(to fill)

## Gate counts

(to fill)

## What the check found, and each disposition

(to fill)
