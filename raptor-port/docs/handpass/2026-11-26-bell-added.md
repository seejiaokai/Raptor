# Evidence sheet — a person added to an input by someone else is told on his bell (chat 190, 26 Nov 26)

**What this is:** his ask of 26 Nov 26 — "check on the running app that a person added to an input by someone else is
told on their bell, every way of adding (schedule drop, Inputs page window, Leave War)" — the baseline before the
combined-row job ([COMBINED-INPUT-ROWS], D2770–D2780) adds new ways of adding. No code change: type R (a re-test).

## The eight answers and the tier
No change is made, so no tier gates a build; the walk is sized as a WALK of the bell across every door that adds a
person. If a fault is found, its fix gets its own tier (it would touch saved data — the bell's lines — so FULL).

## The scenarios — designed blind by Astra and a fresh Fable (D2443)
Brief: `../superpowers/briefs/2026-11-26-bell-added-scenarios-brief.md`. Fable's list (54) and Astra's (45) whole:
`parts/bell-added-1126/scenarios-fable.md`, `parts/bell-added-1126/scenarios-astra.md`. Combined by the host into the
three walkers' lists in `parts/bell-added-1126/walk-brief.md` (each case named by its source numbers, F<n> / A<n>).

## The roll-call — every door that adds a person to an input
| Door | Desktop | Phone | Walker | Result |
|---|---|---|---|---|
| Edit Schedule — drop on an input's Ground Programme row (empty place, a shared puck, the only puck) | | | A | |
| Scheduler Board — the same | | | A | |
| Tap-to-arm then tap the place (phone) | — | | A | |
| A man dragged from a seat onto an input | | | A | |
| A man moved from one input's row to another | | | A | |
| Unavailable row — a drop replacing a man (Other, Inputs-filed leave, Leave-War-approved leave, medical, shared) | | | A | |
| The input's own window opened from the schedule | | | A | |
| The Board's "+ Inputs" | | | A | |
| Inputs page — "+ Input" for one other, for several (list, a calendar day) | | | B | |
| Inputs page — an existing input's window, a person added (list, calendar bar, a day's card) | | | B | |
| A member filing a duty or commitment for others; a member filer adding later | | | B | |
| Personal, ALL AVAIL / ALL, medical, leave filed on the Inputs page, one replacing a pending bid | | | B | |
| SANS calendar — "+ Commitment" for a SANS man | | | B | |
| Leave War — leave entered on a man's row, Auto-approve on / off, a run, a half day | | | C | |
| Leave War — several people at once | | | C | |
| Leave War — OD, course, Other, Attach filed from the war | | | C | |
| Undo of an add, before and after the line is read | | | A, B, C | |
| A published day (the add waiting as an amendment) | | | A | |

## The five sizing lines (§7.0)
1. **Type:** R — a re-test of the bell across every door that adds a person, no change made; the doors are drawn and
   handled by separate code (the schedule's door, the Inputs window, the Leave War's own store), so each needs its own
   proof on screen (type D's question).
2. **What only a walk finds:** a door whose bell line is never written, or written twice, or written for the wrong man;
   the phone's tap route; what the added man actually SEES on his bell and what a tap on it opens. The unit tests
   (`src/ui/bellnotices.test.tsx` 47, `src/ui/bellnotices-scenarios.test.tsx` 45) drive the schedule's door and the
   Inputs window by code, not by a person's press, and none drives the Leave War's lines on screen.
3. **The ledger:** bell walks before — `lw-retype-bell-walk`, `onerule-mock-bell`, `rdl1108-bell-host` — each a single
   door; none covered every door at once.
4. **The walk chosen:** three Opus walkers at once (D787, D2256), each in its own browser world on the one served build,
   desktop 1536×864 and his iPhone's 402×874 (WebKit, touch, 3×): A the schedule (about 18 cases), B the Inputs page
   (about 16), C the Leave War (about 11). The host opens every deciding picture and reproduces every finding. Cases
   carried by a test instead are listed below with their test.
5. **After the walk:** a row in `../walk-ledger.md`.

## The orders walked
Three Opus walkers at once, each in its own browser world on one served build (`index-B9okpSpf.js`), desktop 1536×864
Chromium and his iPhone's 402×874 WebKit (touch, 3×). Their reports whole: `parts/bell-added-1126/report-a.md` (the
schedule, 41 scenarios), `report-b.md` (the Inputs page, 38 + a WebKit re-run of 3), `report-c.md` (the Leave War, 24);
their scripts beside them (`scripts-a/`, `scripts-b/`, `scripts-c/`).

| Walker | PASS | FAIL | RECORD (no ruling) | BLOCKED |
|---|---|---|---|---|
| A — the schedule | 34 (7 with a part recorded) | 0 | 7 | 0 |
| B — the Inputs page | 32 + 3 WebKit | 0 | 6 | 0 |
| C — the Leave War | 15 | 0 | 9 | 0 |

**Every door that adds a person tells him on his bell, once, the actor told nothing**, on the desktop and the phone:
the roll-call above is filled from the three reports (every row: desktop and phone walked, PASS), except the phone's tap
onto a man's puck (no tap route exists — a tap selects him, a held drag is the way; recorded, the survey's finding) and
Undo after the line was read (below).

## Cases carried by a test
None stand in for a walk here. The bell's unit tests (`src/ui/bellnotices.test.tsx`, `src/ui/bellnotices-scenarios.test.tsx`)
cover the repeated wording cases (renames, thirty lines, a reload between change and Undo) the walk did not repeat.

## Pictures
457 in `../img/handpass/2026-11-26-bell-added/` (a 221, b 136, c 94, plus the host's). The host opened the deciding
picture of the riskiest case: a leave the Leave War approved, handed from Hex to Ranger by a drop — Ranger's bell
reads "LL Wed 15 Jul · You were added · Saber" (`a/a-A4-ll-war-week-desk-4-ranger-bell.png`).

## Break tests
None — no code changed (type R).

## Errors seen
None from the app in any run (page errors and console errors watched). Machine: WebKit cannot reach port 4190 here
(it answers on `[::1]` only); the phone runs used the same build on 4173 or a pipe inside the script — the same bundle.

## What was NOT walked, and why
- Each person's own choice of notifications (D2200) — not built; nothing to switch.
- Full editing on the Leave War (D1724) — not built.
- A man of another squadron (F48, A41, A42) — needs a second squadron and a master admin set up; this round keeps to
  one squadron; filed if the walk finds the doors otherwise sound.
## Gate counts
None — no code changed.
- Walker B: A23's half-day repeat, A43's add to an existing note and puck swap, the SANS reminder (B13), A21's schedule
  route. Walker C: A28's approval from the several-days selection. Each the same door as a case walked.

## What the walk found, and each disposition
**No fault against a ruling.** What no ruling settles — put to him in the combined-row page's next round
(https://claude.ai/artifact/2eVK15sBtPsnPYuVwvfMja, "Next round") and filed under [COMBINED-INPUT-ROWS]:
1. Leave an admin enters for a man on the Leave War with Auto-approve OFF (a bid placed for him) tells him nothing;
   the same for a day kept pending by his posting out (C).
2. OL placed with Auto-approve over his own pending LL: "OL added and approved" — nothing says his LL bid went (C).
3. A leave approved on the Leave War handed to another man by a drop: the new man is told with the input's words
   "You were added", not the war's; the old man "You were taken off"; the war shows the leave moved to the new man (A).
   Hex's balance then read −2 (his balance before was not read) — the plan's question 5 (what a swap hands over).
4. Undo after the man read the line: the line simply goes, nothing new is said — his ruling (D1693 as D2437 states it)
   is not built for input lines, already filed ([NOTICE-UNDO-RETRACT]); in one tab it cannot be done at all, the
   reader and the actor being one sign-in at a time (A, C).
5. A man put on a calendar note is told nothing (B) — a note is not an input; no ruling.
6. An Other filed for the morning: its line does not say AM (C).
7. A man dragged from a flying seat onto an input's "+ add" stays in his seat as well, the clash shown by the warnings
   with no note (A) — as his D2774 rules for the combined-row job.
8. Opening a period for bidding tells every man with a sign-in "Bidding open" (C) — as ruled (D1214).
9. On a phone an opened day on the Inputs calendar covers the top bar and the bell (B) — as built (D683, D909).
10. Two one-day bids on following days approved together by one press (C) — as ruled (next-door bids act as one).
    The second press after it (OL on the next day) did nothing and said nothing: not reproduced by the host yet —
    filed as a lead under [COMBINED-INPUT-ROWS] for the build's walk.

`Walk: docs/handpass/2026-11-26-bell-added.md · 457 pictures · 18 surfaces · 103 orders · MISSING: 0 (no fault; 10 records filed or as ruled)`
