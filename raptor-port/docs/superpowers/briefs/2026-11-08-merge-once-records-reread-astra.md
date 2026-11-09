# [MERGE-ONCE-RECORDS] — the narrow re-read of the fixes, Astra (8 Nov 26, chat 33)

Model gpt-6-astra, reasoning high, read-only; brief: `2026-11-08-merge-once-records-reread-brief.md`. Its final answer, word for word.

---

1. P1 — Renumbering still redirects an explicit reference to main’s note.

Failure: base contains Observation 10. Both branches add Observation 11 with different titles: “Branch finding” and “Main finding”. Inside “Branch finding”, put “See Observation 11 on main.”

Proof: executing the current renumber function in memory changes the branch’s heading to Observation 12 and the sentence to “See Observation 12 on main.” It reports no ambiguous citation. Main’s note remains Observation 11.

Cause: records-merge.mjs:288 treats being inside the renumbered note as sufficient evidence of the citation’s target. It recognises main’s title, but not the explicit “on main” qualification. Mentioning the branch title elsewhere on the same line causes the same problem.

Exact fix: determine the target of each citation separately. Explicit references to main must remain unchanged; location inside a note or a title appearing elsewhere on the line must not establish the target. Leave uncertain citations unchanged and list them. Add both reproductions beside the existing citation test.

2. P1 — A new note can still move under the wrong day heading.

Failure: use this skill-log shape, with each note having an unchanged body:
Base: “## 7 Nov”, Observation 10.
Ours: “## 7 Nov”, then “## 8 Nov”, Observation 10, Observation 11.
Main: “## 7 Nov”, Observation 10, Observation 12.

Proof: executing the current cut and mergeRecords functions produces “## 7 Nov”, then “## 8 Nov”, Observations 10, 12 and 11. It reports all additions settled and no unresolved record. Main’s new Observation 12 has silently moved from 7 November to 8 November. Both branches’ additions after Observation 10 provide the competing insertion.

Cause: records-merge.mjs:175–186 preserves predecessor order without preserving the predecessor’s containing section. The new heading changes the section of an existing anchor, taking the other branch’s addition with it.

Exact fix: retain each new record’s originating section alongside its predecessor. Validate section membership after ordering; when another branch’s heading changes that membership, leave the file unresolved rather than silently assigning a different day. Add this case and its reversed-branch counterpart.

3. P2 — The replay’s new identity check dropped ledger rows.

Failure: give both parents and the historical merge one ledger row, “| 8 Nov | a walk | 1 |”, between the ledger markers. Give the step’s result that row twice.

Proof: executing the current identities function returns differ: [] and doubled: []. The replay therefore reports equal identity counts and does not fail for the doubled record, although its text comparison can list the difference.

Cause: records-merge-replay.mjs:106 removed the previous “ledger rows” extractor. The new failure rule checks only the identities remaining in that table. Ledger rows are explicitly part of the plan’s preservation check.

Exact fix: restore ledger-row identity counting and apply the same parent-count limit. Add a replay regression that doubles a settled ledger row while both parents and the historical merge contain it once; require exit 1.

Disposition of the 13 earlier code findings:

- Astra 1: the zero-, one- and two-newline examples passed in-memory execution.
- Astra 2: the original shared-day example passed; finding 2 above remains.
- Astra 3: the fix remains incomplete; finding 1 above.
- Astra 4: in-memory checks rejected new duplicates within one archive, across archives and after archiving both notes; unchanged historical duplicates passed.
- Astra 5: backtick and tilde examples were excluded from note cutting and counting.
- Astra 6: settled records are now retained for comparison beside an unresolved record; difference truncation is removed. The complete replay command remains unverified here.
- Opus 1: the different-offset shared heading is refused.
- Opus 2: the original two-day insertion keeps main’s row under its original day.
- Opus 3: shared leading and trailing rows are retained once.
- Opus 4: all three conflict styles are tried in the code; the real-merge regression could not run.
- Opus 5: in-memory execution retained the chosen number after the highest available number increased.
- Opus 6: the allocator successfully read local and remote refs, including 499 local branches.
- Opus 8: doubled handoff markers and doubled renumbered notes are detected; a single renumbered note is exempted correctly. Ledger coverage regressed as finding 3 describes.

Checked and sound:

- Read-only execution against existing Git blobs covered all 34 insertion-file cases in the committed corpus: 29 resolved fully, five retained unresolved regions, and 17 matched the historical file exactly. This exercised the current insertion helpers without creating repositories.
- npm run docsize passed.
- Both requested test commands failed because the sandbox denied temporary-directory creation with EPERM: records-merge.test.mjs could not create its repositories, and docsize-selftest.mjs stopped at its first fixture. These are environment failures, not passing tests. Complete merge, retry and recovery verification remains outstanding.
- No repository files changed by this review.

Rulings: none this session.