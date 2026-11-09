# [MERGE-ONCE-RECORDS] — the last narrow read (round 3), the fresh Opus read (9 Nov 26, chat 33)

A fresh, blind Opus reader; brief: `2026-11-08-merge-once-records-round3-brief.md`. Its report, word for word.

---

[MERGE-ONCE-RECORDS] round 3 — the fresh, blind Opus read (9 Nov 26)

Each reproduction was a real `git merge --no-commit --no-ff main` that stopped, followed by the current step run with --no-checks. They ran in throwaway repos under scratchpad\opus-r3\repos (harness h.mjs, scenarios s1–s3.mjs). No repo file was changed.

FINDINGS

1. P1 (narrow trigger) — a skill note moves silently under another day when one side REMOVES a day heading.
   Failure (s1.mjs dayrm, dayrm2): the base is "## D1 / Obs 9 / ## D2 / Obs 10 [/ ## D3 / Obs 12]". This branch archives day D2 whole, heading and Obs 10 together. Main adds Obs 11 under D2, after Obs 10. The step exits 0 and reports "settled", but Obs 11 now sits under "## D1", after Obs 9. Nothing is listed for the chat.
   Cause: the round-3 day guard in settle() (the `days` count) refuses only a `## ` line that a side holds MORE often than the base does. A removed heading passes. orderKeys then places main's new note after its deleted predecessor, which now falls under the previous day.
   Plausible: the 13 Oct skill review moved whole days (2026-09-24, 2026-10-08) from the log into the archive. A review branch merged while main gained a note under the day being archived has exactly this shape.
   Fix: leave the whole log when any `## ` line's count on either side DIFFERS from the base. That means `n !== (db.get(l) || 0)`, plus a loop over db's keys to catch a side that dropped one. Test: dayrm and dayrm2, red first, asserting "left whole".

2. P2 — in the insertion-only files, a line main inserted that belongs to the entry above moves under this branch's new entry.
   Failure (s3.mjs subbullet): in the priority list of OUTSTANDING.md, this branch adds "- **Night 3:** [C] ours" after "- **Night 2:** [B] second". Main adds an indented sub-bullet "  - (b) of night 2: [D] …" after the same line. The step settles it as Night 2, Night 3, a blank line, then main's sub-bullet, which now nests under Night 3. Exit 0. The file map shows the same with an indented continuation line (s2.mjs fmpara).
   Cause: whyNotJoin treats any paragraph-shaped text as safe to place this branch's first. An indented line continues the entry BEFORE the region, so putting the other side's text in between moves it to a different entry.
   Fix: whyNotJoin refuses when either side's first non-blank line starts with whitespace. Test: the subbullet shape, red first, asserting the region is left.

3. P3 — joinInsertions puts a blank line between two sides' list items.
   Failure (s2.mjs list): each side adds one "- [X] …" line to the priority list. The result is "- [C] ours", a blank line, "- [D] theirs", which splits one list. The three file-map differences in the replay are this same blank line, between paragraph notes.
   Fix: treat list-item lines ("- ", "* ", "1. ") like table rows, so no blank line goes between two sides of whole list items. Refuse a side that mixes list items with other text.

THE SECOND ROUND'S TEN FINDINGS — all closed (reproductions rerun)

- Astra 1 and Opus 4 (citations): never rewritten, listed "look by hand" (tests pass).
- Astra 2 and mirror (a day heading added): left whole (s1 a2, a2m). Finding 1 is the same fault through a removed heading.
- Astra 3 (doubled ledger row): the identity is back; its replay test exits 1.
- Opus 1 (fused item), Opus 2 (shared last line), Opus 7 (doubled table head): each left (s2 o1, o2, o7).
- Opus 3 (unclosed fence): read as text; both numbers renumbered; docsize names a new one.
- Opus 5 (HANDOFF): both new sections kept, this branch's first; a new block beside a new section stays under "## Now" (traced).
- Opus 6 (replay): exits 1 on a crash, a doubled identity, or a line above the chat's count and max(ours, theirs, ours + theirs − base); its tests pass.

CHECKED AND SOUND

- Two versions of one rulings-archive row (s2 row2) are joined as two rows. Docsize fails a newly doubled D-number, so the step's own checks catch it.
- The replay's admitted gap (a line both sides added the same, written twice) cannot happen. Identical records are kept once, and a region whose sides share a line is never joined.
- Renumbering: the new number is past every number in use on both sides and on every branch, and only the heading changes.
- Question 3: the new refusals do not make the step pointless. The replay settled everything in 48 of 76 merges, part in 22 and nothing in 6, against 52/19/5 before; the cost was five archive files. The log's last added day heading dates from 13 Oct, so the day-heading refusal is rare. Finding 1's fix adds a refusal only where a side removed a day, which means a skill review.
- Two stray fences can still pair up and hide a heading, but only one the branch had already hidden on its own side. The step does not create this.
- Runs: `node --test raptor-port/scripts/records-merge.test.mjs`: 57 of 57 pass. `node raptor-port/scripts/docsize-selftest.mjs`: OK, every scenario as designed (exit 0). Both ran; the sandbox allowed temporary folders.
