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
