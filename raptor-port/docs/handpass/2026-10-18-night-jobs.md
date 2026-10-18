# The night of 18 Oct 26 — the bug checks of jobs 2 to 5 (branch `claude/window-middle-d996`, pull request 534)

Job 1 (D996, D997) has its own sheet: `docs/handpass/2026-10-18-sched-phone.md` (its D997 section and the night's gates).
Every helper's report is saved here the moment it arrives, before anything is done about it.

## Job 2 — D1008 (every member reads every man's OIL ledger) and D1015 (the Tracker import's words)

**The eight questions (§5):** roles — YES (D1008 widens who may read the ledger: the access table and the app's one rule
list); the published record, money, saved data, the warning list — NO (nothing written changes; OIL figures untouched); a
new surface or gesture — NO; a shared drawer — NO. **Tier: FULL** (roles). Sized small (§7.0): the app's screens do not
change for D1008 (it widens the rule to what the OIL tracker and the figure breakdown already show), so the walk is a
member's and an admin's look at another man's entries and the absence of any control to change them; D1015 is the one
refusal path walked with real files. Scenario design by the host (the change is one rule row and one message); one fresh,
blind Opus reader of the finished code (D790, D903).

### The fresh, blind Opus read — report, as returned
1. **The message the owner actually sees is not pinned by any test.** File → Import of a current file whose student marks
   point at a chart it does not carry goes through `normalizeImport` (sets `studentsRefused`) and then the alert in
   `core.js`; no test reaches that alert — changing it back to the older-version words leaves every test green. The
   tracker test's second half only checks `studentsRefused`, which the old code already returned; the "deleted here"
   branch (a tombstoned chart) and the two-onto-one checks are not pinned either. Fix: in
   `file-transfer-boundary.test.ts`, the existing `importBack(file)` helper with a v3 file whose students name an `sc…` id
   in neither catalogue — one seen message equals `STUDENT_CHART_MSG`, none matches /older version/; an `applyStudents`
   case for a tombstoned chart expecting /doesn.t carry/.
2. **`data-model.md` still treats the ledger tables as own-row tables** — the "Who owns each table's rows" paragraph lists
   `LeaveOpening`, `LeaveLedger`, `LeaveCounter` among the user-owned tables ("every table with an own-row rule"); after
   D1008 they have no own-row rule, the IT side would build them user-owned, and ownership cannot change once a table is
   created. Fix: move the three to the organisation-owned list, beside `LeaveWar` and `LeavePersonProfile`, citing D1008.
- Clean: (a) every refusal classified right — a real older file never gets the new words; one edge (a file marked
  version 3 carrying a name-keyed block gets the new words at the import step, the old ones if `applyStudents` is called
  directly) no real export produces; (b) nothing else in the app decides who may read the ledger; (c) no other live
  document says own only; (d) the permissions test fails against the old code. Checked: the whole diff, every place either
  message is raised or shown, all ledger permission uses, the documents, the tests (97/97; tracker 2/2).
- **Both findings fixed** (tests and a document, no logic changed — no further read owed, §5 "a fix is new code"):
  `file-transfer-boundary.test.ts` now presses File → Import with a current file whose marks belong to a chart it does
  not carry and checks the words shown (his D1015 words, never "older version", nothing written), and a chart deleted
  here refused in the same words; `data-model.md`'s ownership paragraph moves `LeaveOpening`, `LeaveLedger`,
  `LeaveCounter` to the organisation-owned tables, citing D1008. 99 / 99.

### The walk — Sonnet walker, `scripts/handpass/night1018-job2-walk.mjs` v1, the built app; report as returned
All 14 steps PASS; no console error, page error, 4xx or native dialog on any run. Pictures `img/handpass/2026-10-18-night-job2/`.
| Step | Result | What was seen | Picture |
|---|---|---|---|
| S1 desktop, member | PASS | the OIL tracker lists 50 men, 49 other than Ranger, 30 entries; others' balances and reasons shown | `s1-desktop-member-oil` |
| S1 phone, member | PASS | the same list | `s1-phone-member-oil` |
| S2 desktop, member | PASS | another man's breakdown (his LVE row): "+14 · 1 Jan 26 · by SQNCDR · Annual leave top-up" | `s2-desktop-member-breakdown`, `…-person-figures`, `s2b-…` |
| S2 phone, member | PASS | the same grant and reason | `s2-phone-member-breakdown` |
| S3 admin | PASS | the same views | `s3-desktop-admin-oil`, `s3b-desktop-admin-breakdown` |
| B1 member, no edit | PASS | no entry editable (an admin has 17, a member 0); no settings gear or credit panel; a tap on a grant opens no edit or delete; stored Leave War data unchanged | `b1-desktop-member-no-edit` |
| S4 export | PASS | a version 3 backup, 4 charts, the students | `s4-export-window` |
| S5 desktop / phone | PASS | the refusal reads exactly D1015's words; no "older version" | `s5-refusal-desktop`, `s5-refusal-phone` (opened by the host) |
| S6 | PASS | a version 2 file with name-keyed marks keeps the older-version words | `s6-older-version-refusal` |
| S7, S6b | PASS | after S5 the charts came in, the students stayed at 2, the refused one nowhere in stored data; after S6 none added | `s7-after-s5` |
Walker's notes (no defect): the person-figures sheet's OIL row opens the tracker, the grants' breakdown is the LVE row;
in S5 the file's other charts already existed and "Replace it" was chosen.

**Gates:** the touched files' own tests (perms, permsparity, perms-scan, file-transfer-boundary, tracker) green; the
whole set runs once the night's next job is built (D902 does not apply — the pull request's set has not passed yet).

Walk: docs/handpass/2026-10-18-night-jobs.md (job 2) · 14 pictures · 2 surfaces (the OIL tracker and breakdown, Tracker File → Import) · 2 orders (member, admin) · MISSING: none

## Job 3 — D1000, D1016: the Leave War's top takes the phone's two lines up to 700 wide

**The eight questions:** none of 1, 2, 3, 7, 8; a new gesture or surface — no (the phone's own top, already built and
checked, reaching wider screens); a shared drawer — no (one page's top). Layout of one surface at many widths — the walk
ledger's type E. **Tier: WALK** (the bug-check order's "a wide visual change"), sized to the widths the change moves:
390, 430, 440, 600, 700, 701, a resize across, an admin and a member; the stage menu both ways; the grid card proven
unchanged. **Roll-call** — every place the top's phone switch draws: the Period line (Chrome.tsx `Topbar`), the Stage
line and its menu (`Filters`), chrome.css's top block — has it; the grid card (its short words, its padding) and the
Required panel (ReqPanel.tsx's own 430) — must not, because D1000 says "the grid unchanged" (proved by S6 and the
browser test). **Red first:** the browser test at 440 failed on the old layout ("no label word is left on a phone"),
passes on the new; the Leave War browser file 333 / 333 and the top's tests 15 / 15; unit 55 / 55.

### The walk — Sonnet walker, `scripts/handpass/night1018-job3-walk.mjs`, the built app; report as returned
All 28 assertions PASS; no console error, page error or 4xx. Pictures `img/handpass/2026-10-18-night-job3/` (27).
| Step | Result | What was seen (picture) |
|---|---|---|
| S1 admin 440 | PASS | two lines, nothing overlapping or past the edge, no sideways scroll; first roster row at 469 (was 564); the top's edge 20px, the card's too; matches the approved picture (01) |
| S2 admin 600 | PASS | the same; first row at 434; matches the picture but for the 20px edge D1016 asked for (02 — opened by the host) |
| S3 | PASS | 700 two lines (03); 701 the desktop strip, every label, "+ New", both moves (04) |
| S4 440 and 600 | PASS (8) | the stage menu holds both moves; "→ BIDDING CLOSED" moves the stage and closes the menu; back again; a tap outside closes it and changes nothing (05–14) |
| S5 member 600 | PASS | two lines, no "+", the stage a plain label that opens nothing (15) |
| S6 440 and 600 | PASS | the grid card still reads "⇅ Rearrange" and "◷ OIL tracker"; its padding 14px 20px 28px at 440, 600 and 701 (8px 10px 20px at 430); at 440 its − / + wrap inside the card, as before (16, 17) |
| S7 390 | PASS | two lines, the 10px edge (18) |
| S8 resize | PASS | 600 → 960 the desktop strip, nothing half-drawn; back at 600 the first row at 434 again (19–21) |
| B1 | PASS | the menu open at 600, resized to 900: no menu, no scrim, the desktop strip (22, 23) |
| B2 | PASS (4) | the longest real callsign fits whole at 440 and 390; a 30-letter callsign put into the page text (a simulation) ends "…", "Viewing as" whole, nothing past the edge (24–27) |

Walk: docs/handpass/2026-10-18-night-jobs.md (job 3) · 27 pictures · 1 surface (the Leave War's top) at 9 widths · 2 orders (admin, member) · MISSING: none

## Job 4 — D1013, D1017: the crew-rest ring and chip on every copy of a man's puck

**The eight questions:** a shared drawer — YES (a mark that must appear wherever a man is drawn); none of 1, 2, 3, 7; the
warning list — no (what a warning says and how a rule is read are unchanged; only the copies' rings). **Tier: WALK.**
**Roll-call** (the survey of the drawers, saved below): the seat (week `slotCell`/`lSeat`, board `sbSeat`/`sbSlot`, the
Common Programme) — has it, as before; the Ground Programme row (through `lSeat` / `sbSeat`) — has it; the Personal
Inputs and Unavailable rows (week `inGrp`, board `sbInpRow`) — MISSING before, now has it; the SANS card
(`sansCardsHTML`, week and board) — MISSING before, now has it; the crew list (`rosterPuck`, board and week) — MISSING
before, now has it; the Available crew panel and the ALL AVAIL window — had it already; OIL Earn's copies — must not
(the mode shows OIL, not warnings, as before). The open list's light (`.puck.wfoc`) — option A's two rules.
**Red first:** `src/ui/restring-copies.test.tsx` 5 of 6 failed on the old code, 6/6 after; the ring and CSS tests 115/115.

### The walk — Sonnet walker, `scripts/handpass/night1018-job4-walk.mjs`, the built app; report as returned
16 of 18 PASS, 2 FAIL (both B3 on Monday); no console error, page error or 4xx. Every copy read from the DOM.
| Step | Result | Seen |
|---|---|---|
| S1 board Mon, Scribe | PASS | seat, Ground Programme, Personal Inputs, Unavailable, SANS card, crew list — all dotted, chip R, none solid (dk-01, dk2x-01) |
| S2 week Mon | PASS | the same five and the week's crew list (dk-02) |
| S3 board and week Tue, Otter | PASS | all dashed, chip R (dk-03, dk-04) |
| S4 Mon, the list open and the "Breaks Tuesday" line | PASS | 5 lit pucks, all still dotted; 145 of 150 dimmed; the crew list's copy keeps its ring, not lit (dk-05, dk2x-03) |
| S4 Tue, Otter | PASS | 5 lit, all still dashed (dk-06, dk2x-06) |
| S5 phone | PASS | the same rings (ph-01 to ph-04) |
| S6 against the approved option A | no difference | ph-01 / approved ph-02; dk2x-03 / approved dk2x-02 row A; dk2x-06 / approved dk2x-04 row A |
| B1 the breach taken away, then Undo | PASS | every copy loses the ring and chip; one Undo brings all six back (dk-08, dk-09) |
| B2 his own solid breach (Scribe, Tuesday) | PASS | the seat and every copy solid, none dotted (dk-07) |
| B3 Tue, close the list | PASS | rings as at rest, nothing lit |
| B3 Mon, close the list after tapping the "Breaks Tuesday" line | **FAIL** | the rings unchanged, but the light stays on: Scribe's five Monday pucks lit, the page dimmed (dk-10) |
Walker's notes: opening a day's list already lights its crew and dims the rest, before any tap (opening then closing with no
tap restores the rest exactly); after the Monday line was tapped and the list closed, the light stayed — Otter's Tuesday
pucks read dimmed under it; the week's crew-list copies are never lit or dimmed by the list.
**The host's reading of B3 Monday:** OLDER than this job, not caused by it — the job's commit touches the four copy
builders, two style rules and a test, and nothing that decides what is lit or when a light goes (`ui/highlights.ts`,
the focus in `state/view.ts`); the class `wfoc` it leaves on is set by the unchanged highlights code. Filed as
[TRACE-FOCUS-STAYS], found not fixed.

## Job 5 — D1011, D1012, D1010, D710: the scheduler's small batch

**The eight questions:** the published record — YES (D1010: what members see of a published day); roles — no; saved data
— no (D710 adds history lines only); a new gesture — no (Escape's meaning made the same as elsewhere). **Tier: FULL.**
**Red first:** D1011 (`boardwrap.test.tsx`), D1012 (`datecal.test.tsx`), D1010 (`peek.test.tsx`), D710
(`changelines.test.ts`) each failed on the old code. The floating calendar over a date box keeps closing whole on Escape
— `datebox.test.tsx` pins it, and D1012 names only a calendar inside a form: a question for him.

### The fresh, blind Opus read — report, as returned
1. D710: the changes window files every note line under "Leave War · pp:…" — `noteLines` writes `sub: 'pp:<id>'` with
   `sect: 'day'` and no key, and `changesmodel.ts itemOf` reads a keyless line with a `sub` (not quals) as a man's Leave
   War item. Fix: drop `sub` and `fld`, so the line lands under "The day" with its own words.
2. D710: Undo or Redo of a note change writes no line — `logReversed` collects no day for `plan`. Fix: collect the note's
   date(s) there.
3. D1010: a resize across 820px can put the wrong copy in the other page's preview — `pan.ts syncPeekOnResize` remounts
   both weeks' previews under the page on screen, and the other page's remembered key then says nothing changed. Fix:
   stamp the mounted key on the root and compare it in `mountPeek`.
4. D1012: the calendar's Escape fires even when the keyboard is elsewhere (a cell on the page behind, its typed text then
   saved by its blur). Fix: leave the key alone when the focus is outside the calendar.
5. D1011 gap: the board's Personal-input time boxes (`data-ifld`) keep a typed time on Escape, and the input's remarks box
   blurs without restoring. Fix: the week's `[data-inp]` restore for `data-ifld`.
Minor: DateCal's comment says the floating calendar defers to the lists; it does not (as built) — correct the wording.
