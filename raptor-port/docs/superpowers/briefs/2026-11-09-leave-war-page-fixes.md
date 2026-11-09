# The Leave War's page — what was done with each reader's finding (9 Nov 26, chat 46, D1947)

The page read: `.claude/rules/decisions/leave-war.md` at `694602fac` (checked out at `a48db1f74`). The reports:
`2026-11-09-leave-war-page-read-astra.md` and `…-read-opus.md`; the brief `2026-11-09-leave-war-page-fix-brief.md`. Each
finding was checked against the ruling's full row (`.claude/decisions-full/`), the old list (`0ce71adab`) and, for a test
claim, the test's own assertions (read myself for D1270, D1331, D1469, D1476, D1375, D1360, D1351), by a fresh Opus
helper that wrote neither the page nor either report. No test, app code or script was changed; no other area's page was
changed. The sorting tables' rows for every ruling touched (and Sorter D's three head and settled rows touched) carry a
"read 9 Nov 26" note. `npm run docsize` and `npm run rulecheck` pass.

Result: 30 findings (Astra 11, Opus 19) — 26 distinct, 4 of Opus's counted once with Astra's (Opus 3 = Astra 4; Opus 4
and 5 = Astra 2; Opus 16 = Astra 6's D1476; Opus 18b = Astra 11). Held 25, not held 1 (Opus 17). The host's own points
(the D1177 sweep, the UNA and bid-row citations, the five marks) are rows at the foot. Numbers on the "Built, held by
tests" line: 64 → 57 (off: D1270, D1331, D1351, D1360, D1375, D1469, D1476). The page: 78,707 → 81,434 bytes (limit
121,825). Five full rows marked (D1212, D331, D335, D1175, D1019); two left for the host.

| Reader | # | Ruling(s) | Held? | What was done | Why |
|---|---|---|---|---|---|
| Astra | 1 | D665, D674 | held | "From other areas", the scheduler's line: "the four Required / Available rows in the Manning block, a counter row droppable above, between or below them (with the war's own D674)". | D674's bold: "above them, between any two of them, or below all four"; D665's mark: no longer always last. |
| Astra | 2 | D1177 (D418) | held | Line of no stages: "the admin decides bids at any time (the agent's reading of D1177; his D418 had 'in every stage but Draft')", D418 cited. Settled landing line: see Opus 5. | Both clauses are in D1177's "The agent's readings, drawn for him and his to strike"; D418's mark calls it "the agent's reading of question 5's table". |
| Astra | 3 | D1466, D1563, D1565 | held | The whole-entry line split: the second-entry exception stated for a leave placed on the war [D1466, D1563, D1565], "the same for an entry filed on the Inputs page, the agent's reading of D1563 and D1565". D1448 not cited on the new line (its mark would owe D1461; D1466 holds the rule). | D1466's bold is about "a leave of several days"; D1563 reading (1) and D1565's readings carry it to Inputs entries. |
| Astra | 4 | D335 | held | "(the agent's reading of D335, uncorrected)" after the range widening Decide, Move and Delete. | D335's row: "(the agent's reading on the mock-up, uncorrected)"; D1330, D1332, D1334 do not restate it. |
| Astra | 5 | D1331 | held | Off the built line; stated under "Built, stated here" (bid windows): the half lit in Duration beside the lit leave, "the title carries no code ('NOW' gone)", a whole day keeps "Whole day". | `round3.test.tsx` asserts no `.cur`, no "now", and the title's children; a code written into the date element passes. |
| Astra | 6 | D1476, D1469 | held | Both off the built line. D1476's colours were already written out (the name-puck line, the settled pilots-above-WSOs line); the name-puck line now adds "an OCU man's reading 'O' in the colour of his puck's OCU chip on the schedule, not 'OCU'" and cites D1469. | `namepuck.test.tsx` checks class names (`puck`, `.r`, `.pers`, `q-ocu`) only; a Leave War style could change the colours with every assertion green. |
| Astra | 7 | D1375 | held | Off the built line; "an Attach reads ATCH, since ATT is the medical codes" added to the outlined-look line, which already cites D1375 with the look's colours. | `otherunavail.test.tsx` holds the code and `kindOf === 'unav'`; no assertion measures ATCH's own fill, edge and letters. |
| Astra | 8 | D1360 | held | Off the built line; "each pair in its colour" stays stated on the bubble-words line, which cites it. | `bidbubble.test.tsx` checks the helper's `['amber','red']`; the rendered tests are single-colour bubbles. |
| Astra | 9 | D1351 | held | Off the built line; stays stated on the bubble-words line (with Opus 7's mark). | Only the OD filing path is pressed; "This course" and "This Other" are checked through the words helper only. |
| Astra | 10 | D1326, D1349, D1356, D1378, D1379 | held | The bid-row line split in two: the row under the leaves [D1320, D1349, D1370, D1379, D1356 and the rulings that change it], and the ⋯ button [D1326, D1319, D1378, D1379, D1356 and the rulings that change it]. D1370 and D1356's chain (D1388, D1357, D1365, D1390, D1381, D1372, D1374, D1389, D1393, D1398) are owed by the gate (D1349's and D1356's marks). | D1349/D1356: Grant OIL third, the Other button into ⋯; D1378: Attach first in ⋯; D1379: a member's ⋯ holding Attach only. |
| Astra | 11 | D1947 | held | The head: the OIL page loads with it "save with the `*arch-stack-4*` documents, where it is opened by hand". `oil.md`'s paths not changed (outside the finding's scope). | `oil.md`'s `paths:` have no `*arch-stack-4*` pattern; every other Leave War pattern is covered. |
| Opus | 1 | D1390 (D998, D1381) | held | Manning line: "a course or an overseas duty a scheduler has not rejected". | D1390's bold: a rejected overseas duty counts him back in, as a rejected course does. |
| Opus | 2 | D1270 | held | Off the built line; stated under "Built, stated here" (Settings and speed): everything in the window fits its width, the words wrapping and a row's parts shortening; only up and down scrolls. | `leavewar.spec.ts` measures the spill with every fold closed and with "Who wins" open only. |
| Opus | 3 | D335 | held | = Astra 4, counted once. | — |
| Opus | 4 | D1177, D418 | held | = Astra 2 (the no-stages line), counted once. | — |
| Opus | 5 | D1177 | held | Settled landing line: "a picked period holds for the rest of that session but is never reopened at the next start (his, 7 and 17 Sep 26)" first; the landing order, "else its first day" included, then "(the agent's reading of D1177, as built)". = Astra 2's second half, counted once. | D1177's readings list "the page opens on the first open date from today, else on today"; `ui-contracts.md` calls it "D1177's reading"; no row of his says "else its first day". |
| Opus | 6 | D333, D266, D1177 | held | Move line: "a member moves his own bid while bidding is open (D333) — since the stages went, while it waits and its days are open (the agent's reading of D1177) — and the admin any bid (the agent's reading of D333, uncorrected)". | D333's row marks the admin half "the agent's reading on the mock-up, uncorrected"; D1177 lists the member's half among its readings. |
| Opus | 7 | D1351 | held | "'This Other …' — the agent's wording, his to change" on the bubble-words line. | D1351's mark from D1356. |
| Opus | 8 | D1328, D1327 | held | Split: the coloured-box rule app-wide [D1327, D1328]; the words rule for the Leave War's day list [D1328], the other places D1327 names marked the agent's reading. | D1328's bold covers "the Leave War's day list"; its row marks the other places as readings. |
| Opus | 9 | D1503, D1506 | held | OIL tracker line keeps his cases — Balances by a person's OIL figure; Approvals by a person window's OIL line or his own opened by My leave — and marks the OIL tab, a person window's OIL line on Balances, and another tab (going to that tab, on Approvals ending its visit) as the agent's readings. | The two rows list the OIL tab and the other cases under "The agent's readings"; "my leave" is in his next message (D1506). |
| Opus | 10 | D883, D892 | held | Split: the edge scroll for a man's row, a heading or a counter, phone and desktop [D892]; the unbroken landing line for a man's row (D883), a heading's and the phone the agent's reading. D892 dropped from the gap line, which no longer states it. | D892's bold names all three and both sizes; D883's row gives the heading and the phone as "the agent's reading … (not yet checked on either)". |
| Opus | 11 | D460 | held | "(his setting there, not a claim about the official qualification)" put back. | His wording correction in D460's row. |
| Opus | 12 | D1730 | held | Cell line: "a stack of cards, its back card grey (his 'The grey2 is ok')", D1730 cited; the line split (600-character limit). | His words in D1730's row confirm the reading. |
| Opus | 13 | D1467 | held | Its settled line adds: narrower than 360 the two chips go to the next line together, never cut; Approvals' line after a decision in the window greyed, "Already approved by Saber". | His "Yes as recommended" to the readings page ("the rest stand"); the row's "Also standing". |
| Opus | 14 | settled: the tab opens on the war being bid on | held | A settled line of its own: "the grid's column window builds around the month the war lands on, never reset to month 0 on a war change, or the desktop's whole-year fill drifts the landing back to January". | Not in `ui-contracts.md` §The Leave War opens on the war being bid on, (read myself) nor, by Opus's report, `performance.md` §C/§E; only a code comment held it. |
| Opus | 15 | D1243 | held | "the Manning button's count takes every red day of a Manning, Available P or Available W row, never amber". | D1243's bold. |
| Opus | 16 | D1476 | held | = Astra 6, counted once. | — |
| Opus | 17 | D1782, D1221 (scheduler.md); D1697, D1698 (people-accounts.md) | not held | Nothing changed. | D882's full row carries "NARROWED BY D1782" and "BY D1221"; D1692's carries "NARROWED BY D1697", "WIDENED BY D1698": the gate requires each line that states D882 or D1692 to cite them. |
| Opus | 18 | (a) D674; (b) the head | held | (a) D674 out of the scheduler's number list, stated "with the war's own D674" (with Astra 1); (b) = Astra 11, counted once. | D674's full row is the Leave War's; it stays on the built line. |
| Opus | 19 | D1423 (D1444) | held | "(a picked month staying)" on the Approvals chips line. | D1423's mark from D1444: "a picked month or one with a line still on the page staying"; the second half was stated (D1464). |
| Host | 5a | D1177's readings | held | Swept: the three lines stating a reading of D1177 as his are marked (no stages; the landing; the member's move); line 265's was already marked; the closed days' dim and lock are his D1267; the open-days outline his D881, D887, D1269; the "Bidding closed" tap, Undo of dates and the dotted "moved" mark are not stated on the page. | D1177's readings list. |
| Host | 5b | the UNA line; the bid-row line | held in part | Bid-row line: D1349, D1356, D1378, D1379 added (Astra 10). UNA line: unchanged — it states D1356 and D1365, and every other number on it (D1388, D1357, D1398, D1390, D1381, D1372, D1374, D1393, D1389) is owed by the gate through D1356's, D1357's, D1381's, D1388's and D1390's marks; none can come off. "An admin's from its ⋯" (D1349 through D1356) not given D1349, which would also owe D1370. | `backlog-archive.mjs` / `docsize-rulings.mjs` pageDebts: a line stating a marked ruling cites every ruling its marks name. |
| Host | 4 | D1330/D1332 over D1212, D331, D335; D1316 over D1175; D1019 | held | Marked (below). "His colours" Done-once line cites D1316, D1322, D1323, as D1175's new mark requires. | Each later ruling's own words state the change. |

## Questions for him
- None new from a difference between the app and his rulings: every held finding was a statement on the page, not the
  app. The three readings of D1177 now marked (the admin decides bids at any time; the landing on the first open date,
  else today, else the period's first day; a member moves his own bid only while it waits and its days are open) and
  D333's "the admin may move any bid" are built and were drawn for him "his to strike"; recommended: put them to him in
  one later small round as "keep as built", so they can be stated as his.
- The open question already listed stays (D1318 against D1211, a member's overseas duty or course on a past day); the
  page does not decide it.

## Marks written (`.claude/decisions-full/leave-war.md`, column 4, newest first)
- D1212: "— NARROWED 24 Oct 26 BY D1332: in the bid windows the row labels go (round 3); the two words stand wherever the
  app still labels those rows."
- D331: "— NARROWED 24 Oct 26 BY D1330, D1332: in the bid windows Approve · Refuse · Move · Delete stand in one row, Note
  gone, and the row labels go (round 3)."
- D335: "— NARROWED 24 Oct 26 BY D1332: 'Pick a range' ends the Duration row (round 3), no longer a row of its own at the
  window's top."
- D1175: "— NARROWED 24 Oct 26 BY D1316: a course purple, an overseas duty a solid slate and a medical red (set C)."
- D1019: "— NARROWED 22 Oct 26 BY D1254: Rearrange moves into ⚙ and OIL becomes a tab, so '⇅' and 'OIL' leave the grid's
  bar." D1019 is largely overtaken: its "⇅" and "OIL" by D1254 (marked), its "−" and "+" by D1228 once D1276's condition
  (the pinch working with the frozen bar) was met at the build — not marked, D1276's words being conditional. What is left
  of it — the phone's short words on the grid's bar from 431 to 700 — is the page's "Up to about 700 wide" line.

## Unsure, for the host
- **D1254 over D1227 (My leave's place).** D1254's bold puts My leave on the View line under the tab row, which plainly
  ends D1227's "in the empty right half of the Leave War's first line"; D1254 does not name D1227. Not marked: the mark
  would make the gate owe D1254 (and through it D1483) on the four bubble and Manning-rows lines that state D1227's
  bubble half and nothing of My leave. Recommended: mark it, and accept the two numbers on those lines — or leave it, the
  page's top-row lines already citing both.
- **D1326 by D1356.** D1326's row carries D1338's narrowing (third place UNA), and D1338 is archived as replaced by
  D1356, which puts Grant OIL third and the Other button in the ⋯ (via D1349). Not marked: the chain already runs through
  D1338's REPLACED mark, and a mark would add D1356's eleven-number chain to the "Done once" line that names D1326.
  Recommended: leave it.
- **Tests that would put numbers back on the built line** (none written — no test changed): D1270 (the colour strip
  opened, the armed Reset order, each `spill() <= 0`); D1331 (the whole title's text for a half and a whole day); D1476,
  D1469 (a browser check that the name puck's and OCU chip's colours equal the schedule's); D1375 (ATCH's own fill, edge
  and letters measured); D1360 (a rendered bubble of two levels, each pair's colour); D1351 (a course and an Other filed
  from the window, "This course", "This Other").
