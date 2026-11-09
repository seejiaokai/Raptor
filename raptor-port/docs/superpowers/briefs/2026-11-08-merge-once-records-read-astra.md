# [MERGE-ONCE-RECORDS] — the finished code, Astra's read (8 Nov 26, chat 33)

Model gpt-6-astra, reasoning high, read-only; brief: `2026-11-08-merge-once-records-read-brief.md`; the read of commit `0e059ce63`. Its final answer, word for word.

---

1. P1 — A missing final newline makes one skill note disappear into another.

Failure: in .claude/skill-observations/log.md, use base "# log\n\n"; ours adds "### Observation 11: ours\n\nours"; theirs adds "### Observation 12: theirs\n\ntheirs". Neither addition ends with a newline.

Proof: executing the actual cut and mergeRecords functions in memory produces "theirs### Observation 11: ours". It reports both notes settled, with nothing left. The new skillLogNumbers check returns no failures, although Observation 11 no longer heads a record.

Cause: the separator repair only handles records that already end with "\n".

Exact fix: ensure every non-final record ends with a complete line separator before joining records. Preserve the final record’s original ending. Add a real-merge regression covering zero, one and two trailing newlines, asserting that both headings and complete bodies survive.

2. P1 — Entries can move under the wrong date heading.

Failure and proof: executing the actual helpers in memory reproduces both cases:
- Archive additions: ours adds an 8 November section containing D2, followed by a 9 November section containing D4; theirs adds the same 8 November heading containing D3. joinInsertions places D3 beneath the 9 November heading.
- Skill log: both sides add an 8 November section; theirs also adds a 9 November section. mergeRecords places ours’ 8 November note after theirs’ 9 November note, beneath the 9 November heading.

Cause: joinInsertions removes a shared heading prefix and concatenates everything remaining. orderKeys anchors new records only to records present at the base, losing their relationship to newly added section headings.

Exact fix: preserve each entry’s containing section. Merge additions within matching sections; leave the region unresolved when section membership cannot be preserved. Test multiple new dates on either side and assert each entry’s enclosing heading, not merely its presence.

3. P1 — Renumbering can redirect a citation to the wrong note.

Failure: base contains Observation 10. Ours adds “See Observation 11 on main, titled Main finding.” to that note and adds its own Observation 11, titled “Branch finding”. Theirs adds Observation 11, titled “Main finding”.

Proof: executing renumber changes ours’ heading to Observation 12 and also changes the citation to “See Observation 12 on main, titled Main finding.” Observation 12 is actually Branch finding.

Cause: a line being new on this branch establishes who wrote the citation, not which branch’s note it references. The replacement assumes every matching citation in a new line targets this branch’s entry.

Exact fix: leave ambiguous citations unchanged and list them for resolution. Automatically rewrite only references whose target is established. Add this case beside the existing self-reference test, verifying that references to main’s note remain attached to main’s note.

4. P2 — Newly duplicated archived note numbers pass the document check.

Failure: the live log contains Observation 10; a newly added archive contains two different entries headed Observation 11. The same problem occurs across two archive files.

Proof: executing the actual skillLogNumbers function against those contents returns an empty failure list.

Cause: archived numbers are checked only against numbers currently present in the live log. Archive-to-archive collisions are never counted. This exempts future damage as well as the older history excluded by D56.

Exact fix: count identities across the live log and every archive. Compare archive-only duplicate counts with the base, allowing unchanged historical duplicates while rejecting newly introduced ones. Test duplicates within one new archive, across archives, and after both colliding entries leave the live log.

5. P2 — A valid fenced example is treated as a second skill note.

Failure: a note headed “### Observation 11: explaining a heading” contains a fenced Markdown example headed “### Observation 11: example”.

Proof: the actual number checker reports “Observation 11 heads 2 entries”; the merger’s cut function refuses it as holding Observation 11 twice. There is only one actual note.

Cause: the skill-log parser deliberately disables fence handling, and the number checker scans fenced text too. The handoff parser already handles fences.

Exact fix: use one fence-aware definition of a skill-note heading for cutting, counting, highest-number allocation and replay identity checks. Test backtick and tilde fences, including examples whose numbers collide with actual notes. Do not renumber example text.

6. P2 — The replay omits evidence needed to verify records it changes.

Failure: replay returns immediately for a partially settled file, before reading its resulting contents or comparing identities. The recorded partial HANDOFF.md result for 8ed7e85a8 therefore receives no preservation comparison for the blocks the step did settle.

For wholly settled files, differences are shortened to 160 characters per line and 80 lines per file. A concrete example is 7009fe1f2’s file-map paragraph: its full difference includes placeholderWhy and additional affected files beyond the displayed prefix. The sheet therefore does not show every difference in full.

Cause: partial resolution skips comparison entirely, and presentation limits discard the underlying comparison detail.

Exact fix: compare settled records inside partially unresolved files, separately accounting for unresolved regions. Retain complete differences in an accompanying artifact; the sheet may summarise and link to it. Add a regression that corrupts a settled block while another block remains conflicted and requires the replay to expose that corruption.

Checked and sound:

- npm.cmd run docsize passed on this checkout. All nine checks-passed tests passed, including equality of the workflow’s two notes-only lists.
- A read-only replay using existing Git blobs exercised all 34 insertion-file cases in the committed corpus: 30 settled wholly, 17 matched the historical file exactly and 13 differed. Their differences were ordering, blank lines, historical editorial additions or archive-heading additions; no newly misplaced ruling heading appeared in those sampled results.
- The changed shipping instructions retain batch-specific approval, frozen job revisions, combined checks, renewed approval after app-code conflict resolution, and the merge lock.
- The 22 merge tests and document self-test could not run: this session forbids creating their temporary repositories. The synthetic failures above were reproduced with the actual functions in memory. Full merge recovery and the complete 61-file comparison remain unverified.
- No repository files changed. Rulings: none this session.

Tidiness note — recommendations for filing, not fixed:

- Share record parsing between the merger, document check and replay.
- Separate proposed renumbers from applied renumbers; refused files currently still contribute “renumbered” messages.
- Remove unused state and imports, including unreadable and refused.