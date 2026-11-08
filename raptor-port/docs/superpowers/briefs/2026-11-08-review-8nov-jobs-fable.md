# Fable's read of 8 Nov 26's merged work — chat 37 (D1933, narrowed to a handful by D1934)

**Status: IN PROGRESS — written 8 Nov 26 about 23:15; the state is saved here as the chat fills.** The brief both
readers got: `2026-11-08-review-8nov-jobs-brief.md`. Astra's report, when it lands: `…-astra.md`. The host (chat 37,
Fable 5.1) reproduces every finding before it counts (D790); nothing is changed on a reader's word — each finding goes
to him with its consequence and its fix, and he decides.

**What was read, and what was stopped.** Seven rules-page readers ran to the end (the OIL, IT flow guide, People &
accounts, Screen design, Tracker and How we work pages — 684, 690, 700, 708, 714, 663 — and the five always-loaded
rule files rewritten as checklists, 665, with the bug-check checklist of 658). Seven app-code readers were started;
on his correction of about 23:00 (D1934: a small handful first, Fable reads nothing wider until it shows a fault and
he says to go on) five were stopped at once and their partial reads lost — the board (664, 689), the Leave War and
Inputs (680, 676, 707), the Tracker and the save band (687, 696, 706), the React Doctor clean-ups (667, 702), the
checks and the IT answers (670, 698, 662). Two were kept, on the riskiest code: the schedule's marks with the publish
path (691) and the rules engine with OIL (678, 669, 679). Astra's blind read of the whole list runs on (Codex, not
Fable spend). Fable spend to this point: about 1.5 million tokens on the seven rules readers, about 285,000 in the
host; the account's Fable weekly figure 20 %, all models 87 %.

## 1. The app's own checks on live `main` (9e493393b)

| Check | Result |
|---|---|
| Document check (`npm run docsize`) | OK — 164 backlog items, D1–D1931, every home found |
| Rule check (`npm run rulecheck`) | OK — 278 rulings, 247 named by a test, the same 31 unnamed as before |
| Whole unit suite (`npx vitest run`, under the checks lock) | **814 files, 14,064 tests passed, 20 skipped, 0 failed** |

The unit suite is the one test of the code itself that has finished. Nothing in it points at a fault from 8 Nov.

## 2. The rules pages — was a rule's meaning changed, dropped or bent?

Seven readers, each given one page, the old one-line list at the pull request's base, the new page at its merge, and
the full rows as ground truth. Size was out of scope (chat 36). **Headline: no ruling was dropped on any page.** Every
D-number that left a page is either stated in another loaded file or archived as replaced, restated or spent, each
checked against its row. Where the page's words differ from the old one-liner, the page usually matches his full
ruling better than the old line did (the one-liners had gone stale in places).

What the readers found, by page — each marked **host-reproduced** (the host opened the row and both texts) or
**reader's comparison** (not yet reproduced by the host; counts only once it is):

### OIL (684) — 42 rulings compared; nothing dropped
- **F-OIL-1 · D606 · MEDIUM · host-reproduced.** The page states the 7 Oct reading "a SPARE that only stands by reports
  nowhere, so his B does nothing, and switched on in OIL Earn he earns the shift's written hours [D606]" (page line
  114) three lines above the later rule it cites from D1044/D1045 (a standby line with its B or R typed flies whole,
  SPARE rows included, each earning OIL by default — line 117), with no word on which wins. The rows: D606's reading
  (3) is the older; D1044 and D1045 (19 Oct) are the later and narrower. **Consequence:** a chat reading only the page
  could build or test "a spare on a line with B typed earns nothing unless switched on" — the opposite of the ruling
  and of the app's planned behaviour ([STANDBY-FLIES]). **Fix:** one clause on line 114 — "until the line flies: with
  its B or R typed it is a flight for every row (D1044, D1045)" — or move the D606 reading under the standby lines'
  statement. Not a code fault.
- D32, D400, D34, D783 · LOW · reader's comparison — wording or traceability only; meaning intact (D400's "an accepted
  duty input" → "an input's yes to the OIL question" follows D804 and is right, but the account never recorded the
  change of words).

### IT flow guide (690) — all 15 rulings compared; nothing dropped
- D413 · LOW · reader's comparison — the Leave War flow's order (bid and decide → close) became "close the dates and
  then decide the bids", borrowed from D1208's "best is to close then approve"; openly labelled his preferred order, but
  D413's row carries no mark, so page and row disagree on the order a redrawn slide should show.
- D410, D1724 pointer · LOW · reader's comparison — "several slides where a journey needs them" widened from two named
  journeys to any; the D1724 pointer could be read as retiring D1166's Inputs-page path, which still stands.

### People & accounts (700) — about 70 of 102 rulings compared statement by statement; nothing dropped
- No high, no medium. The permissions table (§11) Person and QualMark rows agree with the page. Where the page differs
  from the old line (D285 "Delete account" → "Delete"; D211 "a guest sees documents too" → type and remarks only) the
  page is the one that matches his rulings. LOW: D285's row was marked NARROWED by D322 on 8 Nov during the rewrite,
  not on the day; the data model's §11 head paragraph still says a guest reads "the published week and nothing else"
  (stale against D215, one sentence).

### Screen design (708) — all 74 rulings compared; nothing dropped
- No high, no medium. LOW: D1567 "on a phone" became "on a touch screen, a phone or a tablet" and two grids were added
  to the pinch list — true of the built app, but reads as his words; four small ambiguities (D876's bracket, D1646's
  Escape, D1645's examples, D841's "36, the buttons too") each one phrase to tidy. The D349→D854 and D475→D1792 marks
  are correct against the rows.

### Tracker (714) — all 72 rulings compared; nothing dropped
- **F-TRK-1 · D1790 · MEDIUM · reader's comparison.** The fallback for an event too near the chart's end: the page says
  the window stands ABOVE the event (between the tabs and the event, scrolling inside); the row says option B is "the
  window opening BELOW the event, part of it out of sight". The builder's account says "found, not changed". Page and
  row describe opposite screens; the page follows the pictures he approved. **Fix:** settle the row against his
  approved pictures (a NARROWED mark, or his word), so one record stands.
- **F-TRK-2 · D1791 · MEDIUM · reader's comparison.** The row says "on a desktop nothing changes" for Find's ✕; the page
  adds that the phone's way holds on any window up to 1050 wide, "a narrow desktop window too" — as built and as the
  question page told him, but the row carries no mark or reading. **Fix:** mark the row, or the page says "as built".
- D462, D374, D1931 · LOW · reader's comparison — a timing clause gone (nothing lost today); Upchit dropped from a list
  because its box is gone (D1002) without saying so; D1931's bold meaning is inference from his four words, unmarked.

### How we work (663) — all 240 old lines compared; 58 rows opened; nothing dropped
- **F-HWW-1 · D70 · MEDIUM at the merge, superseded on main · reader's comparison.** The guide-change read was widened:
  two one-off fresh-Opus reads (D810, D1414, "for this review only") became the general fallback "a change read without
  them — by a fresh, blind Opus reader", with no "he is told first". A guide change could have reached his approval
  with no Codex read and him untold. **Already corrected on live main** by his later rulings D1761 and D1770 (Astra
  reads every guide change; if Astra cannot run he is told and it waits). Nothing to fix now; a lesson for the diet.
- D353/D590 · LOW · reader's comparison — the plan red team was left undefined when he has not called Astra or Sol
  (fixed on main by D1760). D1743, D1535, D1539, D1682, D1749 · LOW — agent readings stated as his rules without the
  "agent's reading" mark the page uses elsewhere; meaning matches the rows. Six of eleven archived rulings are spent
  one-off decisions rather than "spent permissions" — nothing lost.

### The five rule files as checklists (665) and the bug-check checklist (658)
- Inventory: shipping 55 of 55 rules present, doc-structure 41 of 41, record-decisions 24 of 24, plain-language 19 of
  19, bug-check 29 of 30 present and 1 changed (the readers paragraph said "a fresh Opus reader unless he calls
  Astra" — right under D1734/D1743 at the merge, reversed the same morning by D1770, which the live file carries).
  Nothing weakened, nothing dropped; the old text is in the archive byte for byte.
- **F-CHK-1 · MEDIUM · reader's comparison.** The checklist's steps 6, 8 and 10 route to §2a's table only; §2a's prose
  (what "the day that has everything on it" means for the Tracker and the Leave War; "a new area writes its own
  everything-case once") is reached only when a change adds a new gesture; §7.1 describes the scheduler's day alone.
  **Consequence:** a Leave War or Tracker walk can build the convenient fixture §7.1 forbids. **Fix:** route "§2a
  whole" at step 10, or move the two area sentences into §7.1.
- LOW: §3 (what each check is blind to) now read only for a new gesture; the order's "With the Claudex loop" section is
  routed by no step and still names "Astra and Sol 6.1"; §4a's "hand the inspector the evidence sheet" was never
  corrected after D790 (D201); ui-design.md routes points rather than sections for a new action.

## 3. His question of 8 Nov 26, "List to me 30 rules that was changed today" — the readers' before / after

Thirty rules whose stated words changed in the rewrites, meaning changes and record mismatches first (1–15), then
rules whose words changed with the meaning intact (16–30). "Changed" here means the page's words and his ruling's
record now differ, or a reading was stated as his word — not that the app or his decision changed, except where said.

1. D606 (OIL, a spare on a standby line) — changed in effect: the old reading sits beside the newer rule with no word on which wins (host-reproduced).
2. D1790 (Tracker, the marking window at the chart's end) — page: window above the event; record: below it. One must be settled.
3. D1791 (Tracker, Find's ✕) — page adds "any window up to 1050 wide, a narrow desktop too"; record says "on a desktop nothing changes".
4. D70 (a working-guide change's readers) — widened at the merge to a fresh Opus fallback with no "he is told first"; corrected on live main by D1761/D1770.
5. D353 (a plan's red team) — left undefined when Astra and Sol are not called; fixed on main by D1760.
6. D413 (IT guide, the Leave War flow's order) — "bid and decide, then close" became "close, then decide"; record unmarked.
7. D410 (IT guide, slides per journey) — "several slides" widened from two named journeys to any.
8. D1724 pointer (IT guide) — could be read as retiring the Inputs-page path (D1166), which still stands.
9. D191 → D1931 (Tracker, a typed student) — changed by his own answer "Typed student can't be added", recorded; the detail "with nobody on the roster it adds nobody" is the agent's inference, unmarked.
10. D1567 (Screen design, pinch zoom) — "on a phone" became "a touch screen, a phone or a tablet", two grids added; true of the app, reads as his words.
11. D1743 (Sol 6.1 until Monday) — the agent's reading "Sol is called too where a second reader fits" stated as his words.
12. D285 (People, the account button) — "Delete account" → "Delete"; the page is right, but the record's NARROWED mark was added during the rewrite.
13. D211/D213 (People, what a guest sees of a medical input) — the old line said documents too; the page says type and remarks only, which is his ruling.
14. The bug-check method's reading — "open the whole method" became "open its checklist and each part a step names"; approved by him on 7 Nov; one gap: the everything-day for the Leave War and the Tracker is reached only for a new control.
15. Who reads finished code (bug-check file at the 665 merge) — "a fresh Opus reader unless he calls Astra"; reversed the same morning by his "Yes Astra is the standing reviewer" (D1770), which the live file carries.
16. D400 (OIL, earned vs awarded) — "an accepted duty input" → "an input's yes to the OIL question"; same under D804.
17. D48 (OIL on an issued day when a rule changes) — "money" → "OIL" (D25); the rest from the full ruling; same.
18. D470 (a man put in another man's request row) — now the one-OIL-answer rule of 11 Oct; the old line was the stale one; same.
19. D142 (which published version pays OIL) — adds the consequence confirmed 20 Sep (an amendment taking a man off a past day takes that day's OIL); same.
20. D403 (the IT guide is re-shot only on his word) — adds "a pictured screen's change re-shoots nothing by itself"; from the ruling; same.
21. D149 with D218, D1510, D1651 (Quals, a member edits his own row) — the three admin-only cells named; same.
22. D287 with D290, D297, D299 (a man who leaves for good is deleted) — the approved list of what stays and what goes spelled out; same.
23. D306 (a posting that would leave no admin) — "archive, suspend or delete the last admin who can sign in waits, whole"; same.
24. D876 (the "just added" ring) — adds "(a taken suggestion and the Leave War's day aside)"; same, one bracket could mislead on the six seconds.
25. D587 (the "Not saved" band) — names the Scheduler Board and the OIL tracker as carrying it, the Inputs calendar and Medical view using the top bar's; same.
26. D1518 (nothing pinned leaks) — adds why and how it is checked, both marked as the agent's reading; same.
27. D625 (the design tool's version) — the "after the SANS calendar job" condition dropped because that job went live 9 Oct; same.
28. D1671 (compaction at about 400,000) — adds the guard's ceilings (about 408,000, 900,000); same, as he was told.
29. D1745 (February 2027 is not a deadline) — word for word; same.
30. The notes-only merge rule (D1407, D1737) — adds "never a working guide" from his 27 Oct ruling; same.

## 4. The app code — the handful (in progress)

- Unit suite on live main: green (§1).
- **691 (the schedule's marks and words, D1784/D1785/D1792 a, d) — DELIVERED, no high or medium finding** (Fable
  reader; the 10 changed unit files run one at a time, green). The three rulings are built to the rows' words; the
  waiting mark reads the day's own pending list and is suppressed on a draft day, a version look, View-only Sched,
  Personal Inputs rows and OIL Earn; the engine changes are additions in the amendment files only (the original under
  `reference/` has none of them — D1537 holds); no document trimmed (D29); no test weakened (each changed expectation
  follows a ruling's new words or the drawn mark). LOW F-691-1 (D56 — stored data only): the two publish doors on a
  book an older app version stored still refuse with the old amber wording, not the grey "Blocked:" note the pull
  request claimed. LOW F-691-2 (a wording question for him): the unreadable-week refusal always says "this week's saved
  copy could not be read", even at the two cross-week doors where the damaged week is the next one.
- **678 (where a day with nothing entered starts, D1786), 669 (Insights' edges), 679 (OIL Earn on the board) —
  DELIVERED** (Fable reader; the engine change compared with the original's lines, tests 17/17 and 62/62 on main). 679:
  no OIL amount, award or pending state is computed on screen; the switch changes its own day once per press; the
  reasons read the existing one set of words. 669: an extraction with byte-identical words. **LOW F-678-1 · a visible
  change not told to him · reader's comparison, verified by test and reference compare:** a sortie with its take-off
  typed and its landing blank or "TBD" now counts zero hours in Insights and raises no long-day note (before: it
  counted from the step to take-off plus debrief). Coherent with OIL and pinned by a test the readers asked for, but
  the pull request's "What changes" list did not say so. **Fix:** his word — keep it (one line to him), or rule the old
  count back. Not a finding (D56): already-published days with such a sortie across the long-day line read "1
  pending" and lose their sign-offs until the next amendment.
- **Astra's blind read (`…-astra.md`, Codex `gpt-6-astra`, read-only) of all sixteen app pull requests and the seven
  rules pages: every pull request DELIVERED, no defect found; 680 PARTLY against its original "never blink" aim but
  delivered against the scope he accepted (D1850, [LW-PIN-LAST-FRAME]). Its D-number audit matched the Fable
  readers': no operative rule disappeared; every number absent from a page is archived or stated in another loaded
  file. Its one verification note, host-reproduced: the board-layout browser test added by 689 skips itself when its
  chosen box already sits above the simulated keyboard (`raptor-port/e2e/board-layout.spec.ts` line 136), so that test
  does not prove the keyboard-clearance case on every run — LOW, F-689-1; neither reader found it hiding a failure.
  Fix: a fixture that puts the box under the keys first, or drop the skip.
- Not read by Fable (stopped under D1934): 664, 689, 680, 676, 707, 687, 696, 706, 667, 702, 670, 698, 662.

## 5. His yes-or-no: did Opus 5.5's work on 8 Nov 26 damage the project? — **NO, on the evidence gathered**

- The whole unit suite is green on live `main`; the document and rule checks pass.
- Both readers, blind to each other, found no fault a user would meet in any app pull request: Astra read all sixteen;
  Fable read the two riskiest (691; 678/669/679) and both verdicts agree with Astra's. Nothing trimmed from a document
  by a code change, no test weakened, the rules engine changed only where a ruling asked.
- The rules pages carry no dropped rule (both readers' audits agree). What the rewrite left: three places where the
  page and his ruling's record now disagree (D606 host-reproduced; D1790, D1791 reader's comparison), one checklist gap
  (F-CHK-1), one visible Insights change he was not told of (F-678-1), one conditional test skip (F-689-1), and a
  handful of low wording points — each his word or a one-line fix, none a fault in the app.
- **Limits:** Fable did not read thirteen of the sixteen app pull requests (stopped under D1934; asked whether Fable
  should read them, he answered "No, enough" on 8 Nov 26 about 23:50 — they stay unread by Fable); Astra's read of them
  is a source read, not a walk; no walk of the running app was made by this chat; the readers' comparisons marked
  "reader's comparison" are not yet host-reproduced. Widening Fable's read is his call (D1934).

Which reader found what: F-OIL-1 (D606), F-TRK-1, F-TRK-2, F-HWW-1, F-CHK-1, F-678-1 — Fable's readers; F-689-1 — Astra
(host-reproduced). Did not reproduce: none — nothing a reader raised was contradicted by the files; the "reader's
comparison" marks are reads the host has not repeated, not failures to reproduce.

Rulings: 1 recorded this chat → `.claude/rules/decisions/how-we-work.md` (D1934). Walk: none — a read and the app's
own checks, no walk of the running app (none was asked for; nothing here is ready for "merge live").

**His answers to the six points (8 Nov 26):** 1 fix it — chat 36's trimmed OIL page drops the sentence; 2 and 3 keep as built, the rows marked (D1935); 5 keep (D1936); 6 fix the test, filed as [E2E-BOARD-KEYS-SKIP] (D1936); 4 fix the checklist, filed as [CHK-ROUTE-2A] (D1937).
