# [MERGE-ONCE-RECORDS] — the last narrow read (round 3), Astra (9 Nov 26, chat 33)

Model gpt-6-astra, reasoning high, read-only; brief: `2026-11-08-merge-once-records-round3-brief.md`. Its final answer, word for word.

---

1. P1 — Two versions of an existing backlog item can still be fused silently.

Failure: the base already contains “### [X] the item” and “First line.” This branch appends “Built and live 8 Nov 26 (PR 700).”; main appends “Dropped on his word, 8 Nov 26.”

Cause: the insertion guard examines only the conflicting lines. The existing item heading sits outside them, so both additions pass: no shared line, heading or table separator.

Proof: in-memory execution of settleInsertions, supplied with the empty-base conflict region, returned one [X] containing both contradictory endings, separated by a blank line. Nothing was left unresolved. This used a supplied conflict region, not a real Git merge.

Exact fix: refuse competing insertions within an existing [ID] item’s body. Determine the containing item before accepting the region; distinct lines do not establish distinct records. Add this case for both the live backlog and its archive.

2. P1 — Moving an existing day heading can still put another branch’s note under the wrong day.

Failure:
Base: 7 Nov → Observation 10; 8 Nov → Observation 20.
Ours: 7 Nov; 8 Nov → Observations 10, 11, 20.
Main: 7 Nov → Observations 10, 12; 8 Nov → Observation 20.

Cause: the new refusal counts added day headings. Moving an existing heading leaves its count unchanged. Record ordering then follows the moved heading and carries main’s new note across it.

Proof: executing settle in memory returned 7 Nov empty, then 8 Nov containing Observations 10, 12, 11 and 20. It reported both additions settled and nothing unresolved. Main’s Observation 12 moved from 7 November to 8 November.

Exact fix: before accepting the result, verify that each newly added note remains under its originating day heading. Leave the whole log when this fails. Add the reproduction and its reversed-branch counterpart.

3. P1 — Two unfinished code blocks can join into one apparently valid block and hide real notes.

Failure: both branches add different Observations 11 and 12. Each Observation 11 contains one unclosed three-backtick line.

Cause: each input’s unfinished block is treated as text. After the records are joined, the two stray lines close each other across intervening notes. The final checks now treat those real notes as code examples.

Proof: in-memory settlement retained five raw note headings: 10, 11, 12 and the two renumbered notes, 21 and 22. The shared heading reader recognised only 10, 11 and 22; it found no unclosed block. Executing the skill-log check against the equivalent result returned no failure. Observations 12 and 21 had disappeared from the recognised records without an unresolved warning.

Exact fix: leave the whole skill log whenever either input contains an unclosed fence, before joining records. Keep the document check that reports it. Add a two-sided stray-fence regression asserting that settlement cannot turn real note headings into fenced examples.

4. P2 — The replay still passes some crashes and can count them as fully settled.

Failure: the settle process ends with a nonstandard failure status, or is terminated without an exit status.

Cause: replay marks a crash only when status equals 1. It also uses the diagnostic text itself as the failure flag, so an empty diagnostic is false.

Proof: executing replay and its report function in memory with mocked process results gave:
- Status 1 with “failed”: correctly failed.
- Status 7 with no output: no failure; counted as everything settled.
- No status, with a termination signal: no failure; counted as everything settled.

Exact fix: use a separate failure flag for a launch error, termination signal, missing status, or any status other than the documented 0 and 2. Always supply a nonempty diagnostic. Require a valid successful outcome before counting a merge as fully settled. Test abnormal termination and silent failure as well as status 1.

Disposition of the second round’s ten findings, within the execution limits below:

- Astra 1: original citation examples now remain unchanged and are listed for manual checking.
- Astra 2: original new-day example and its mirror are refused. Existing-heading movement remains unsafe — finding 2.
- Astra 3: the doubled ledger-row reproduction is detected again.
- Opus 1: the two newly added versions are refused. Competing additions inside an existing item remain unsafe — finding 1.
- Opus 2: the shared-last-line example is refused.
- Opus 3: the original single-stray-fence example exposes both numbers, and the document check reports the stray fence and duplicate. The two-sided case remains unsafe — finding 3.
- Opus 4: the citation inside the renumbered note remains unchanged and is listed.
- Opus 5: both new handoff sections are retained, this branch’s first.
- Opus 6: ledger and file-map duplication checks work; status 1 with a diagnostic fails. Crash handling remains incomplete — finding 4. Fused or moved records are not independently rejected by the replay.
- Opus 7: the differently spaced day-heading/table example is refused.

Checked and sound:

- In-memory checks exercised the current settlement, citation, heading, duplicate-count and replay-report functions. Original insertion reproductions were checked against the refusal guard.
- The recorded replay still shows useful savings: 48 of 76 merges settled wholly, 22 partly and six not at all; previously 52, 19 and five. The seven held-out merges show two wholly settled, three partly and two untouched. These are recorded figures, not a replay rerun here. None of the listed skill-log clashes added a day heading, so that refusal’s ordinary cross-day cost remains unmeasured.
- npm run docsize passed.
- Both requested test commands were attempted. Temporary-folder creation was denied with EPERM, preventing the real-merge tests and document self-tests from running. Full integration reproduction remains unverified here.
- No repository files changed.

Rulings: none this session.