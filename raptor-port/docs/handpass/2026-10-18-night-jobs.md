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
**All five fixed** (commit 4415f9548), each with a test that failed on the code before the fix (four run red, the fifth by
construction — an input's own box was passed by before).

### The fresh read OF THE FIXES (round 1, §5 "a fix is new code") — report, as returned
Fixes 1, 2, 3 and 5 right and complete. **One finding, on fix 4:** with the month list open, a click on a blank part of the
OIL question's card puts the keyboard on the card (`OilConfirm.tsx` `tabIndex={-1}`; a floating window the same), which
holds the calendar but is neither inside it nor the page body — so the fix let the Escape through and the question
cancelled with the list open (on Mac Safari a click on the title does not move the keyboard, so even the first Escape).
Fix: also keep the key when the focused element contains the calendar. Not findings: fix 3's stamp survives a whole
rebuild (the next paint draws again; after a resize the hidden page shows the other's copy only until its next paint —
seen only by a scheduler, who can see the working copy anyway); fix 5 cannot reach the OIL Earn mode's shut boxes, reads a
several-people tail as the board's save does, leaves the remarks box's Enter alone, and closes an older leak (Escape in an
input's remarks box on the board used to save the typed words). Checked: the whole commit, six test files run.
**Fixed** the same way, with its test (`datecal.test.tsx`, "the keyboard on the form around the calendar"). Round 1 was the
last fix round: the change is one more condition on the same line, held by its test.

### Job 5's walk — Sonnet walker, `scripts/handpass/night1018-job5-walk.mjs`, the built app; report as returned
All 23 steps PASS; no console error, page error or 4xx. Pictures `img/handpass/2026-10-18-night-job5/` (about 44).
| Step | Result | Seen |
|---|---|---|
| S1 admin, D1010 | PASS | next week's Monday published with its four sign-offs, its first programme start then changed 07:45 → 07:46 ("1 pending"); back on this week Edit Schedule's preview shows 07:46, View-only Sched's 07:45, as issued (S1-1, S1-2) |
| S2 member | PASS | View-only Sched's preview Monday 07:45 |
| S3 resize | PASS | at 800 wide no preview; back at 1440 Edit Schedule 07:46, View-only 07:45 |
| S4 a day not published | PASS | Tuesday a draft, 05:45 → 05:46: both previews 05:46 |
| S5 take-off box | PASS | 2359 typed, Escape: 12:40 back, nothing stored, Undo still off; the same after a click elsewhere and a reload |
| S6 duty start | PASS | the same (07:00) |
| S7 a Personal input's start box | PASS | the same (09:00) |
| S8 Enter | PASS | 12:41 typed, Enter: kept after a reload; put back |
| S9 an input's window | PASS | Escape shuts only the month/year list; a second Escape closes the window |
| S10 the OIL question's "Only some days…" | PASS | reached by filing Training on Sat 18 – Sun 19 Jul; the same |
| S11 a note and a delete | PASS | "WALK NOTE" with Widget and Ratchet on Mon 19 Oct; after Widget's delete the changes window shows `Note "WALK NOTE" · Widget taken off` |
| S12 words and Undo | PASS | `Note "WALK NOTE" · words WALK NOTE → WALK NOTE 2`; after Undo "Undo — a note on the calendar" on that Monday |
Walker's notes (no failure): a delete takes a man off notes from the delete's date on (the real date), so a note dated in the
past keeps him, as built; Undo of a note change goes to the Inputs page where it was made; "1241" typed and committed with
Enter shows "1241" until a reload shows "12:41" (not checked against the build before — filed with the next look at the
board's time boxes); the served build predates the last calendar fix (the keyboard on its form), S9 and S10 passed on the
earlier rule, which the fix only widens — the full gates run on the final code.

Walk: docs/handpass/2026-10-18-night-jobs.md (job 5) · 44 pictures · 6 surfaces (View-only and Edit Schedule's preview, the board's time boxes, an input's window, the OIL question, the changes window) · 3 orders (admin, member, resize) · MISSING: none

## Job 6 — D999: an upchit moved later gives the downchit its days back

**The eight questions:** saved data — YES (a new kept field, `firstEnd`; a downchit's end rewritten); the published record
— yes in passing (a day given back reads pending, D178); medical status read by the warnings — YES (who reads fit). **Tier:
FULL.** The code survey before the build: `docs/superpowers/briefs/2026-10-18-d999-survey.md`. **Red first:** four tests in
`ui/medwrite.test.ts` "D999" failed on the old code; the older plan-shape tests now expect the upchit's `up` mark.

### The fresh, blind Opus read — report, as returned
1. **A hand-changed end is ignored by a later give-back** — `commitInputEdit` rewrites `date`/`endDate` but leaves
   `firstEnd`, which `applyMedPlan` sets only when null; a downchit corrected by hand then regrows past what was typed, or
   stops short of a hand extension. Fix: drop `firstEnd` when the downchit's start or end is changed by hand, and at a cut
   by another medical (`!p.up`); a tail or piece copied through `pieceOf` must not inherit it.
2. **The give-back runs through another upchit** — the in-the-gap scan reads downchits only (`medRows`); an upchit of his
   in the gap is grown through. And an upchit handed to another man and moved later could grow that man's downchit. Fix:
   scan his upchits too (not the one moved); grow only where the upchit is his.
3. **Growth can be written into a locked week** — `medPlanProtected` checks the row's present span, not the days a grow
   adds. Fix: check the grown span as well.
4. **The kept end can change its year** — kept as a bare "Dec 30", read against `r.yr`, which an edit sets to the loaded
   year. Fix: keep it with its year.
Checked and sound: one body for the sheet and the save (window, drag, table); Cancel writes nothing; one Undo restores both
rows with `firstEnd`; grow and trim never on one row; a one-day and a deleted row handled; a retype gives nothing back; the
Leave War sync, the history line and the pending mark as the trim's.
**All four fixed** (the fix commit after 835152673): the kept end written with its year (ISO) and read by `firstEndOrd`;
kept only by an upchit's cut — dropped by another medical's cut, by a hand change of the downchit's dates, never copied
into a piece; the give-back stops before any medical of his in the gap, upchits included, and only his own upchit grows
his downchit; `medPlanProtected` checks the days a grow adds. Tests: `medwrite.test.ts` "the kept first end, after its
code read" (3); the locked-week case is held by the code read and the existing protected-week tests (a quarantined week
cannot be staged in this unit file) — the full gates run next. Every medical test file 293 / 293.

## The full gate set for jobs 2–6 (the night of 18 Oct 26, `139005eb1`, under the PC lock, one run)
build clean · unit 11686 / 11686 · tfin 728 / 0 · e2e 853 passed, 1 failed, 59 skipped — the failure the Leave War
desktop's "window of months" test on a five-second wait (D84: one re-run of the failed test, not an investigation) —
re-run: 1 / 1 passed · smoke 453 / 0 · rulecheck OK · docsize OK. Before it, GitHub's run of `0e18304` had caught one
browser test (`geometry.spec.ts` "the cross-day row pans to the late line"): job 4's option A rule covered the older dashed
"same man, other day" echo; narrowed to leave the echo as built (`139005eb1`), and this run is green on it.

### Job 6 — the fresh read OF THE FIXES (round 2), report as returned
1. **The hand-change test compared date labels, not dates** — the form writes a label with its year whenever the loaded
   week is in another year, so a remarks-only edit of a downchit opened from another year's week forgot the kept first end
   (and a real one-year move with the same label kept it). Fix: compare as dates (`dateOrd` with each side's year).
2. **The test "a give-back stops the day before another upchit of his" proved nothing** — the door refuses that move today
   (the later upchit has already closed the episode), so it always took its `else`. Fix: test the stop on the plan itself
   and assert the door's refusal.
Right: fix 2 checks the upchit as it stood, against the new person; fix 3's shape; fix 4's ISO date (31 Dec → 1 Jan).
Checked: both commits, the medical engine and every writer of a downchit's dates (the Leave War writes only leave rows).
**Both fixed** (dates compared with each side's year; the test now pins the plan's stop and the refusal); 106 / 106. Round 2
was the last fix round (§5): the change is one comparison, its two sides named in its comment.

### Job 6's walk — Sonnet walker, `scripts/handpass/night1018-job6-walk.mjs`, the built app; report as returned
All 34 checks PASS (the final of three runs); no console error, page error or 4xx/5xx; nothing set directly. Warden
(S1–S7), Piston (B1), Cinch (B2), Mon 19 – Fri 23 Oct 2026. Pictures `img/handpass/2026-10-18-night-job6/` (21).
| Step | Result | Seen |
|---|---|---|
| S1 | PASS | the sheet "ATT C Oct 19 – Oct 23 → now ends Oct 20"; nothing changed before Save; then ATT C Mon–Tue, the upchit Wed (01, 02) |
| S2 | PASS | the upchit moved to Thu: "ATT C Oct 19 – Oct 20 → now ends Oct 21, its days given back" (03 — opened by the host); Cancel left both as they were; saved: ATT C Mon–Wed (05) |
| S3 | PASS | moved to Mon 26: "now ends Oct 23", ATT C Mon–Fri and no further (06, 07) |
| S4 | PASS | Undo once: the upchit Thu, ATT C Mon–Wed; Redo: Mon 26, Mon–Fri (08, 09) |
| S5 | PASS | a mouse drag of the upchit's bar Thu → Fri: the same sheet, "now ends Oct 22, its days given back"; nothing before Save; then ATT C Mon–Thu (11) |
| S6 | PASS | the phone: the sheet at x 22–368, y 304–540, no clipped words, the given-back line wrapped whole (14) |
| S7 | PASS | the Medical tab's card "ATT C 19–23 Oct" (its "as of" moved to 21 Oct by its own control) (15) |
| B1 | PASS | the ATT C shortened by hand to Mon only, then the upchit moved to Fri: no given-back line ("no current entry needs shortening"); ATT C stayed Mon (17) |
| B2 | PASS | an OML on Thu, the upchit moved to Fri: "now ends Oct 21" — the day before the OML (20) |
Walker's notes: on the phone the upchit's bar shows only the man's name, no "Upchit" (as built); the Medical tab opens
"as of 13 Jul", the demo's today.

Walk: docs/handpass/2026-10-18-night-jobs.md (job 6) · 21 pictures · 4 surfaces (the input window and its save sheet, the calendar drag, the phone, the Medical tab) · 3 orders (forward, Undo/Redo, by hand first) · MISSING: none

## Job 7 — the Tracker: D1004 (no down days in the currency bar), D1007 (the legend), D1006/D1014 (the flex settings), D1002/D1003/D1005 (the down days from the Inputs), all with D1018

**The eight questions:** saved data — YES (a flex setting row; a course start in `pace`; the export/import file); roles —
YES (the Tracker's one admin gate, D1014); a new surface — yes (the legend, the flex window, the down-days window).
**Tier: FULL.** Built in four commits (32ad203b8, 2d70cba46, bac862795, 77c1aee9e, with a type fix 0f1224a8b); steps (b),
(c), (d) by Opus helpers to a written spec, each diff read, tested and committed by the host as its own. Red first: D1004's
test and the down days' 20 tests failed first; the legend's and the flex settings' tests were written after the code (the
walk and the read carry them). Tracker unit tests 535 / 535; typecheck and build clean.

### The fresh, blind Opus read — report, as returned (condensed only where it repeated)
No serious findings. 1. A course start picked in "+ Add" was silently dropped when the man already had a stored pace
without one (another chart of the course, an older backup) — `addStudent` wrote it only when no pace was read. Fix: take
the picked day where the kept pace has no course start. 2. Flex off still left a flex word on screen: the Legend button's
tooltip "What the balls, bars and flex mean". Fix: without "flex" when flex is off. 3. Note: an admin's import whose flex
settings fail to save said nothing. Checked and sound: the flex setting's save, read-back, boot, remote change and rolled-back
write; a member refused at all three doors (the window and setter by the sign-in role — the admin's member view counts as a
member; the command gate; the ownership check); a member's import refuses only the flex part; the standalone Tracker as
D121; the bands at their edges; every flex surface behind `flexOn`; the backup file (written only with every chart; an older
file unchanged; a damaged block refuses the file before anything is written); the down days clipped to the course start
and today, halves as ½, the cut line only with a kept first end, an unlinked student "—"; the bridge channel's change
guard; nothing reads the removed boxes; the chart's ball drawing byte-for-byte as before; no test re-pointing lost an
assertion. Not findings: cancelled medical inputs counted (a cancel mark is set only on ground-programme rows, never a
medical one); overlapping medical inputs counted twice only in stored demo data (filing trims or refuses an overlap, D56).
**All three fixed** (the picked day kept; the tooltip without "flex" when off; "Flex settings not brought in: they could not
be saved. Set them again in ⚙."). Tracker 535 / 535. Owed: a unit test pinning fix 1 (the walk carries it tonight). New
words, for his look: "What the balls and bars mean", the failed-flex line, "No medical inputs since the course start.", the
number's spoken "none counted yet".
