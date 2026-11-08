# A fresh Opus reader's blind read — the rules diet's step 5a, the screen-design rulings as a page (8 Nov 26, of `be2cf7171`)

A fresh Opus helper, blind to Astra's read, the brief `2026-11-08-rules-diet-step5a-design-read-brief.md`; its report saved whole below, unchanged.

Blind read of rules diet step 5a: the screen-design page (`.claude/rules/decisions/design.md`, branch `claude/rules-diet-step-5a-design-9bc219`, HEAD be2cf7171), read against every full row. I changed no file and committed nothing.

The short version: no high findings. There are four medium ones. One widens a rule. One drops two places from a rule's scope. Two point to nothing where other areas have ruled on the same subject. The rest are low: wording and citations.

## Findings, most serious first

**1. MEDIUM — the ✕ that "stays typed" is widened to every ✕.**
- **Ruling:** D1792, with D1793, D1703, D1124, D1508. Clashes with the Tracker's D1705 and D1135.
- **Page line:** "Only the typed marks the rulings here name become drawn; the ✕, the ⇄ of Move and a ✎ inside help text stay typed…" (icons section).
- **What the full row requires:**
  - D1792 keeps typed only the ✕ that hides a warning (the pictures round, question 13 (d); the code comment beside it says the same).
  - The Tracker's D1705 makes the lull's × the drawn ✕. D1135 makes the student × a line icon. The page's own Tracker pointer says the same.
  - No row says "only the marks named here become drawn". D1124 and D1508 say only that other icons drawn two ways are put to him with pictures.
- **What the page says:** every ✕ stays typed, and "Only…" is stated as his rule.
- **Fix:** say "the ✕ that hides a warning stays typed", note that the Tracker's ✕ marks are drawn (D1705, D1135), and drop "Only", or mark it as the agent's reading.

**2. MEDIUM — the no-zoom rule leaves out two grids, and its device scope is narrowed.**
- **Ruling:** D1567.
- **Page line:** "On a phone the page itself never zooms: only the grids that zoom by their own pinch — the Leave War grid and its OIL tab, Quals, the Scheduler Board's desktop layout — … a pinch anywhere else does nothing."
- **What the full row requires:** its home (`ui-contracts.md`, the section on a touch screen never zooming the page) also lists the Balances page (the Leave War's D1236 and D1483) and the Tracker's chart (D992, D989, D134). The scope is "a phone or tablet (pointer: coarse)".
- **What the page says:** those two are absent, so an agent would switch off their pinch. "On a phone" also drops tablets.
- **Fix:** add the Balances page and the Tracker's chart, and say "on a touch screen (phone or tablet)".

**3. MEDIUM — the phone rules other areas made for the whole app are pointed to nowhere.**
- **Rulings:** D997 (a task window opens in the middle on a phone; lesson 6), D1081 and D1412 (nothing on the screen jumps when the phone's keys open), and D828 (a passing note is full width on a phone).
- **Where they sit:** all filed in the scheduler's rulings, but each governs every screen.
- **Note:** the account itself flagged D1081 and D1412 as "found and not pointed" and left them for the host. They were not added.
- **What the page says:** its "On a phone" section has only D1567. An agent doing phone work from this page would not know of them.
- **Fix:** add a "From other areas" pointer for each of the four.

**4. MEDIUM/LOW — "One mark, one look" says nothing of People's kept exception, and Inputs words the colour differently.**
- **Rulings:** People & accounts' D1694 ("Q3 keep"), and Inputs' D1300.
- **Page line:** "One mark, one look … on the edge of the thing added … any table row one box…"
- **What the full rows say:**
  - D1694 keeps the Admin → Users ring standing 8px outside the row, not on its edge. With no pointer, the page invites a "fix" he ruled against.
  - D1300 calls the medical card's mark the "plain cyan ring", against the page's (and the guide's §4) blue ring.
- **Fix:** add a pointer to D1694 as a kept exception. Raise D1300's colour word with the Inputs file; that correction belongs there, not on this page.

**5. LOW — D349 is not cited on the top-bar lines that state it.**
- **Page lines:** "Every Undo / Redo pair sits in the app's top bar… the Tracker's own pair sits there too…" and "The group runs in the desktop's order on a phone too…". Both are cited [D347, D348].
- **What the full row requires:** D349's "1 yes 2 yes" is what approved (1) every page where the one Undo applies, the phone in the desktop's order, and (2) the Tracker's own pair moving to the top bar.
- **Fix:** add D349 to both lines.

**6. LOW — the access screen's foot lists two guest-only items without their condition.**
- **Rulings:** D1650, D1656, and People's D221 and D204.
- **Page line:** "Under it look A's foot: the three steps…, the read-only line, View the schedule and Sign out…"
- **What the contract says:** both the read-only line and "View the schedule" show only while the admins' guest switch is on.
- **What the page says:** the People pointer near the end gives the condition for "View the schedule" only. The read-only line is never conditioned.
- **Fix:** add "(both only while the guest switch is on)" to the line.

**7. LOW — a stale line in `ui-contracts.md`, outside the page itself.**
- **Ruling:** D1523.
- **Where:** the failed-save warning section still says a window "a person has moved or resized … keeps its own box".
- **What D1523 and the built code say:** a window resized but never moved is placed by the app, under the bars. D1523 appears nowhere in that file.
- **Fix:** change "moved or resized" to "moved", and cite D1523.

**8. LOW — Codex is never sent to this page.**
- **Where:** `AGENTS.md` item 4, the list of area rulings files to open before working in an area.
- **What it says:** the list omits `design.md`, so Codex is never told to read the screen-design page before screen work.
- **Fix:** add `design.md` to item 4's list, for any screen work.

**9. LOW — the tripwire's stated reason misdescribes the change.**
- **Where:** `docsize.mjs`.
- **What it says:** the reason calls the 17 gaps "rulings the short lines had cut". They were the first draft's bends against the full rows. It also does not mention D1901, which was added at the merge.
- **The figures:** the byte figures are right.
- **Fix:** reword the reason to say that, and name D1901.

**10. LOW — wording and citation items on the page.**
- **D1771's line is garbled:** "…by D1646's own words, the duty role box, a text box, the boxes' cyan edge". It should say the duty role box is a text box and so wears the boxes' cyan edge, as the code comment does.
- **D1700's reset-arrow list leaves one out:** "(Reset order, Reset layout, a hidden warning)" omits the Tracker's Restore.
- **"Blocked: nothing was kept" is not marked:** it was first the agent's wording, approved through D1668's round-2 drawing. Say so.
- **The undo-topbar "design of record" line in Settled is out of date:** it does not cite the later rulings that changed that design, D1126, D1130 and D1641–D1643.
- **The D1529 pointer drops "with the mouse".**
- **D1901's "fits one line" is not stated.**
- **D1038's "the time turns ordinary white" is not stated.** This belongs to the scheduler, so a pointer would do.
- **The scheduler's settled "the phone board's top bar is one row" is not pointed to.**

## What I checked, and what was whole

- **Rulings:** all 74 screen-design rulings, D347 to D1901. Every part of every full row went against the page, all three cells.
  - The account lists 509 parts for 73 rulings. I checked its counts: 397 stated, 22 spent, 15 detail, 54 superseded, 21 gaps. All are right as a description of the first draft.
  - D1901 is in no account, so I read it on its own.
- **The changed chains:** all of them, with their archived and other-area rows (D1612, D1609, D1616, D1133, D1507 among them).
- **Other areas:** about 45 rulings from the scheduler, Inputs, Leave War, Tracker, OIL, People & accounts and How we work, found by searching each subject the brief lists.
- **The page's own claims:** its head, its Settled section, and every "From other areas" pointer.
- **Every small edit:** DECISIONS.md, AGENTS.md item 5, the CLAUDE.md map row, the head of the full-rows file, the People pointer (D887 with D1614), D349's mark by D854, D475's mark by D1792, the tripwire, PRODUCT.md principle 7, and ui-contracts' D1631/D1632 "built" marks.
- **The documents and mock-ups of record**, where a line depends on one: the design guide's §3, §4 and §5a and lessons 70, 72, 77, 82 and 92; the keys-and-windows, undo-topbar, access-wait and pictures-round mock-ups; and the code for D1792, D1771, D1631/D1632, D1038 and D1523, to tell built from to-build.

**Found whole:** every ruling and pointer not named above. That includes:
- the chains D1626/D1627/D1628, D1631/D1633/D1635–D1638, D1591–D1618 (the "Not saved" band and Retry), D1663–D1669 (refusals, apart from the unmarked wording in item 10), D1509/D1707/D1508, D1641–D1643, D1649–D1656 (apart from item 6), D1700–D1704 and D1793 (apart from items 1 and 10), D587 with D841/D1523/D1655/D1657/D1664/D1666, D876/D1449, D887/D1614, D1518/D1522 and D726/D836;
- the two new marks (D349 by D854, D475 by D1792);
- the Settled section's as-built answers, with nothing open shown as settled;
- the D1900 to-build pointer, true against the backlog;
- the head's claims about loading and searching the full rows.

Every direction or future item on the page is marked as such ("to build", "not checked", "an idea filed, not built"), and nothing built is stated as future.
