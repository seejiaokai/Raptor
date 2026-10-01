# Round 1 dispositions — [DB-READINESS] group A plan (30 Sep 26)

Reports: Astra `2026-09-30-db-readiness-group-a-astra-r1.md` (BLOCK, A-01..A-06); Fable
`2026-09-30-db-readiness-group-a-fable-r1.md` (REVISE, F1..F19). The plan v1 is in git (commit e2368d9f); v2 replaces it.
New fact since round 1 (his words, 30 Sep 26, heard from IT, unconfirmed): "no plugin for now" - recorded in
`OUTSTANDING.md` `[IT-QUESTIONS]`. It settles section 12 q9 (nothing on the server writes a day; worked out on read is the
only route), so phase 6 no longer waits on q9.

| Finding | Disposition | Where in v2 |
|---|---|---|
| A-01 one durable group per command | PARTLY ACCEPTED. Accepted: a batch per group, and the batch exact. Declined: splitting a user action's causal closure into several whiteboard transactions - the closure is atomic by design (commit.ts 88-97, section 20.1: the command's whole causal closure is ONE group); splitting it would let a projection's failure leave the root committed. The unit is ONE whiteboard group = one user action with its causal children = one changeset = one ChangeBatch (Fable F7's definition). | 2.7, phase 4 |
| A-02 records not one-to-one; full matrix | ACCEPTED, with one rule relaxed and said: a stored record maps to one row, OR to one parent row plus its FIXED child rows written in the same changeset by a pure field mapping (Person + QualMark; an issuance + its four IssuedSignoff). Everything else split to one row each. Full matrix added; explicit exclusions with reasons (Attachment until section 12 q2). | 2.5 matrix |
| A-03 known keys still infer deletes | ACCEPTED. Deletes only from a command's own before->after change (never store-vs-memory); unreadable rows kept opaque, never deleted; the fold's blob removals explicit. Tombstones DECLINED for the stand-in: a batch item carries op 'delete' and the adapter writes isDeleted (group B) - keeps every reader unchanged. | 2.2 |
| A-04 GUID row ids | DECLINED in the main, ACCEPTED for Leave War records. Keys are the ids the app already treats as identity - iid, pid (a handle never renamed; the callsign is an attribute), verId~n, ledger id, puck id - or the design's own declared unique alternate keys (week start; week+day; remark date; person+counter). Dataverse upserts by alternate key, so the adapter stays stateless. Accepted part: a Leave War record is keyed by its recId, NOT by its date (a move changes the date, not the row). IT told: these are the alternate keys. | 2.4 |
| A-05 q9 before phase 1 | ACCEPTED in substance, overtaken in part by "no plugin": `un` stored at day grain keyed by input id (design rule 9's "what the scheduler decides ... stored in the day, keyed by the input's id"), not derived; the byte-identical test becomes "retained fields byte-identical, un as a set". 6(a) removed. | phase 1, phase 6 |
| A-06 seed policy | PARTLY ACCEPTED. Accepted: one explicit boot stamp (with Fable F1), the policy chosen by the composition root and passed down (not read off a backend class), every seed path gated including accounts' lock-out repair, the Tracker's default course and demo pair, the Leave War fallbacks; the test matrix. Declined: constructing fresh module state instead of emptying in place - the scheduler's singletons are imported by reference across the app, hydrate already empties them in place today, and vitest isolates modules per test file. The default course: a question to him. | phase 5, 5 questions |
| F1 boot signals | ACCEPTED: `settings/booted` | 2.8, phase 5 |
| F2 undo to pristine lost | ACCEPTED: write the loaded week while any row of it is known | phase 1 |
| F3 queue breaks pagehide | ACCEPTED (a): the postman keeps its merge; the queue moves to group B with the adapter | 2.7 |
| F4 missing week row | ACCEPTED | phase 1 |
| F5 dense ord | ACCEPTED: sparse, stable, never from position | 2.3 |
| F6 edit log | ACCEPTED as a phase | phase 4 |
| F7 batch at the seal | ACCEPTED | phase 4 |
| F8 a orig | ACCEPTED: stored as issuance sequence 0 | 2.5 |
| F8 b sign-offs | ACCEPTED as parent + fixed children (no design change needed; Fable's JSON-column alternative not taken) | 2.5 |
| F8 c retired | ACCEPTED: append-only issuance + retraction records | 2.5 |
| F8 d openings | ACCEPTED: per person and counter | 2.5 |
| F8 e profile | ACCEPTED, with A-02's sxo to the Person writer | 2.5 |
| F8 f placeholders | ACCEPTED: `special` entries are code, never rows | 2.5 |
| F9 tables with no records | ACCEPTED: matrix + reasons | 2.5 |
| F10 one-day-write test; un twice | ACCEPTED: test is "one day row whose string changed" on a week with a published day and a landing; the confinement of the incidental other-day writers moves INTO phase 1 | phase 1 |
| F11 split cost | ACCEPTED: memo on the stash string; reference-equality skip in the Leave War; perf gate | phases 1, 3 |
| F12 per-day read-only | ACCEPTED: stays per week | phase 1 |
| F13 fold atomicity, trigger, reset | ACCEPTED | 2.6 |
| F14 LW adapter has no remove/keys | ACCEPTED (plan v1 was wrong) | phase 3 |
| F15 seedsDemo | ACCEPTED as a boot option (with A-06) | phase 5 |
| F16 poisoned head | MOOT (queue to group B) | - |
| F17 key grammar | ACCEPTED: parse from the right; ids that carry separators listed | 2.4 |
| F18 sharesKeys | ACCEPTED | phase 1 |
| F19 settings null writes | ACCEPTED as one line in the settings adapter (a null set removes the key) | phase 2 |
