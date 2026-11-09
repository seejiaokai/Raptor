# [MERGE-ONCE-RECORDS] — the plan's red team, the fresh Opus read (8 Nov 26, chat 33)

A fresh, blind Opus reader (a helper of chat 33, blind to Astra's read); brief: `2026-11-08-merge-once-records-redteam-brief.md`. Its report, word for word; its replay scripts stayed in the chat's scratchpad.

---

[MERGE-ONCE-RECORDS] plan — red team, fresh blind Opus reader (8 Nov 26)

Method: the 8 Nov 26 merges replayed in a throwaway clone (scratchpad\opus-redteam\, scripts replay.mjs, handoff.mjs, union.mjs, hunks.mjs, cover.mjs). Counted with `--since="2026-11-08 00:00" --until="2026-11-09 00:00"` there are now 143 two-parent merges and 74 clashing ones. The plan's 113/66 used a date-only `--until`. The proportions match the plan's. Union is tested with the plan's four files through `-c attr.tree=<tree>`.

FINDINGS

1. P1 — The HANDOFF.md rule ("main's version of every block except this branch's own") brings back blocks the branch had rightly removed. A chat removes another chat's merged block at handoff (HANDOFF head, doc-structure "removed at the next handoff", D78). Main still has that block, so the rule restores it. Proof: of the 47 HANDOFF clashes on 8 Nov, 6 committed results do not have a block that the plan's rule would restore. In each case the branch had deleted it and main had not:
   - f54a6a272: the -5a-people block, on the 5a-design branch.
   - 883efe49c: the -5a-it-guide block.
   - b1edcf82b and bd56fcb71: the -5a-oil block.
   - 7c00f7b1c and ab43e7413: the m365-package block.
   The document check would not stop this. A revived merged block is only a warning (docsize.mjs "still has a block for … which is merged"), not a failure, and it is not a doubled marker. Separately, in 2 merges (8b54a2cd5, 0db7d583b) the chat dropped a merged block during the merge itself, and the rule would keep it.
   Fix: replace the rule with a three-way merge per block, keyed by marker against the merge base, taken from the index stages (:1 :2 :3), with no use of branch identity:
   - only one side changed a block: take that side;
   - one side deleted it and the other left it alone: it stays deleted;
   - one side deleted it and the other changed it, or both changed it: leave it to the chat, with both versions printed;
   - a block added on either side: keep it, newest first, this side's new blocks above main's;
   - the head, `## Next, in order`, `## Gate baseline` and each standing section: the same three-way merge, per section.

2. P1 — The same rule drops edits a branch made to a block whose marker is not the branch's name. This is routine: a records follow-up branch or a take-over chat writes into the original job's block.
   - Live example now: branch claude/chat27-merge-once-go (commit 4af9ee15b) recorded D1930 itself (his go for this plan) inside the block `<!-- now:claude/chat19-checks -->`. That branch has no block of its own.
   - claude/chat24-design-records likewise writes into the rules-diet-step-5a-design block.
   - Replay proof: e0b0b0d36 (branch claude/pr-board-layout-62eb71). The branch edited the "Chats (D1744)" line of the claude/morning-records block, the chat kept that edit, and the plan's rule would take main's version and lose it unseen.
   - A detached HEAD (D975: the outgoing chat releases its branch) has no branch name, so it has no "own" block at all.
   Fix: the same as finding 1. A per-block three-way merge does not need to know which block is "ours".

3. P1 — The script can overwrite the chat's own edits. The plan says to leave room for hand edits (25 of the 47 HANDOFF merges also hand-edited the chat's own block), but a script that rebuilds the file from git will overwrite any edit the chat made in the working copy before running it.
   Fix: the script only touches paths that are still unmerged (`git diff --name-only --diff-filter=U`). It builds from the stages, never stages anything itself, and refuses to run on a file whose working copy has no conflict markers. Write it into the plan as the order: run the script first, then hand edits.

4. P1 — With merge=union on, a merge that clashes only in union files never stops. The script is "run after git merge origin/main stops", so on those merges it never runs, and the skill log keeps two notes with the same number.
   - Proof: 12 of the 74 clashing merges become clean under union. In 3 of those 12 the union result holds two `### Observation N:` headings for one number: 52de38189 (881), 1b3661f7e (880), 377330417 (863). In each, the chat had renumbered.
   - No check catches it: docsize, docsize-rulings and rulecheck have no test for the log's numbers.
   Fix, both parts:
   (a) Add a document check that each `### Observation N:` number appears once in the log.
   (b) The procedure becomes: always run `git merge --no-commit --no-ff origin/main`, then always run the script, whether or not git stopped.

5. P1 — The walk ledger and the skill log are not add-only, so merge=union doubles records in them unseen.
   - Walk ledger: rows go in just above `<!-- /ledger:rows -->`, and a chat edits its own last row in place. Real commits that did this on 8 Nov: 12167eb77, 473b69a6a, eba7eceb4.
   - Proof: base = 473b69a6a^, ours = 473b69a6a (the row edited), theirs = base plus a new row before the marker. `git merge-file --union` exits 0 with the old row, the edited row and the new row all present: the 8 Nov Tracker row appears twice. A plain merge stops (exit 1).
   - Skill log: entries are edited in place:
     - status edits, e.g. 4d13c06d8, and the 150 status changes in 38e509fd6;
     - renumbers: 27448bf67, efb161ac5;
     - archival deletions of 257 and 4,123 lines (38e509fd6, 75d5564d2).
   - Under union, an archived entry that the other side edited comes back, so it sits both in the log and in its archive. Two status edits to one entry leave two Status lines.
   Fix: put union only on OUTSTANDING-ARCHIVE.md and DECISIONS-ARCHIVE.md. Since 1 Nov, 43 and 17 commits respectively have touched them, and none deleted a line. For the ledger and the log, the script settles a clash hunk only when its base is empty (pure two-sided insertion), keeping both. Every other hunk goes to the chat.

6. P2 — Settling the map with plain `--rulings` inside a merge is the wrong tool and the wrong order.
   - Plain `--rulings` converts rows, retires REPLACED/SPENT rows to the archive, and reads the files on disk, which during a merge still hold conflict markers.
   - The script already has `--rulings --merge` (backlog-archive.mjs, around line 116). It works from git's stages, compares each ruling number three ways, and stops when both sides changed a row. It refuses to start while any non-rulings file is still conflicted ("resolve the other conflicted files first").
   Fix: the plan names `--rulings --merge` (from `git merge --no-commit`) and runs it last, only after the HANDOFF, file map, priority list and skill log are settled, including any part handed to the chat. It also drops the claim that the rulings files are "left to the chat": `--merge` already settles them. On 8 Nov only 5 of 74 merges were left with nothing but rulings files.

7. P2 — The "check, then undo itself" step undoes all its work whenever any part was left to the chat. Whenever anything is left to the chat (a block both sides changed, a rulings row, ui-contracts.md, app code), the files still hold conflict markers, so the document check fails and the script undoes everything. That is most of the mixed merges.
   - "Undo" is also undefined. `git merge --abort` would throw away the chat's other work. The right command, `git checkout -m -- <file>`, rebuilds the conflict only for the named file.
   - If main is already red on one of the checks, every chat is blocked.
   Fix:
   - Run the checks only when the script leaves no conflicted path. Otherwise write the settled files, list what is left, and the chat runs the checks after its part.
   - Undo means `git checkout -m -- <the files the script wrote>`, never an abort.
   - Count a failure only if it is new compared with origin/main's own result (run the check on origin/main's tree first, as docsize already does for the handoff's shape).

8. P2 — The file map and the priority list are described wrongly.
   - File map: all 17 clashes were both-sides additions (base empty) in the top changelog, where each branch adds one paragraph ("8 Nov 26 on `<branch>` (…)"). None was in a table row.
   - Priority list: all 3 clashes were cases where one side removed or rewrote an item line and the other added or rewrote next to it.
   - A two-way "rows each side added are both kept" would bring back an item line one side removed when it archived the item.
   Fix:
   - File map: settle a hunk only if its base is empty; keep both paragraphs with the blank line between them.
   - Priority list: a three-way merge per `[ID]` against the base. One side removed and the other unchanged: it stays removed. One side changed it: take that side. Both changed, or removed versus changed: the chat.
   - Do the same for the reads-owed list `[NO-ASTRA-LIST]` in OUTSTANDING.md, which has the same shape.

9. P2 — The skill-log renumber rule is underspecified.
   - "This branch's new notes renumbered past main's highest" renumbers again at every merge: the branch's notes are still "new against the base" after each merge, so they keep moving, and citations to them go stale each time.
   - Main's highest is not enough: another open branch may already hold the next numbers. SHORT-FORM.md step 1 already greps every remote branch.
   - "Every cross-reference corrected" can rewrite a reference to main's note with the same number, and commit messages already pushed cannot be changed.
   Fix:
   - Renumber only this side's notes whose number also appears on main's side. "This side's" means headings added since the base, taken from the stage :2 diff.
   - New numbers go past the highest on any remote branch (the SHORT-FORM grep).
   - Rewrite citations only in lines this branch added since the base, and print every rewrite. Add a line in the note: "renumbered from N at the merge".
   - Union ordering: the branch's notes land before main's newer ones. Either accept that and say so, or move them to the end.

10. P2 — The replay's pass mark cannot see a doubling. "Holds every line the chat kept and no line it dropped" compares sets of lines, and a doubled line or block passes it. It also counts every legitimate own-block hand edit (25 of 47) as a failure.
    Fix — the pass mark per merge and per file:
    - byte-equal to the chat's result, with the order kept, outside the chat's own hand-edited lines (lines neither parent has, excluded explicitly);
    - every marker, observation number, ledger row and [ID] appears exactly as often as in the chat's result;
    - any departure listed with its reason and judged by the code readers, not by "a later look".
    The replay also has to:
    - run the whole pipeline (union on, a `--no-commit` merge, then the script), including merges that union made clean;
    - add made-up cases for things 8 Nov never hit: a revert, a both-sides edit of the gate baseline, an archive-day heading made on both sides;
    - be checked on a held-out set (the 9 Nov merges) after tuning on 8 Nov.

11. P2 — Part 3, merge once, leaves gaps:
    (a) Whose word counts? Each job's "merge live" is typed in its own chat, and his look is judged on that job's own preview link (D1742, D1746, D1640). The plan must say:
       - the combining chat merges only once he has typed "merge live" in that chat for every job by name, or each job's chat confirms its word was typed there;
       - the combined preview link goes to him before that word is asked for;
       - D1746 applies: if settling a clash between two jobs changed either job's app code, his look is asked again.
    (b) Combining merges job branches into each other, not main into a branch. The script's model of "main's side" does not fit; the per-block three-way merge of finding 1 does.
    (c) Two jobs that touch the same screen or file were never walked together. Give the combined branch a look or walk sized by D485 (the riskiest job sets the size) whenever two jobs share a changed file or a screen.
    (d) Leave notes-only pull requests out: they merge by themselves (D1407), and folding them in makes them wait for his word.
    (e) The D1795/D1796 auto-merge chats: say which rule wins.
    (f) Build the combined branch as one merge commit per job, so one job he rejects can be dropped by rebuilding the branch without it, not by a revert. A revert would also be settled by union and leave lines in.
    (g) Hold the merge lock from the level check to the merge, as today. Do not hold it during the combining.

12. P3 — GitHub very likely ignores merge=union. A 2015 GitHub support answer, a 2021 test and community discussion 9288 all say its pull-request merge and mergeability check do not honour it. So a pull request still shows CONFLICTING, and runs no checks, whenever main moves in a union file. Correctness is unaffected, because the level check merges main in on the PC, but the plan must not count any GitHub-side gain. Test it once on a throwaway pull request.
    Also, git reads .gitattributes from the working tree. So the first merge that brings the new .gitattributes into an older branch merges without union, and that merge can still clash.

13. P3 — Housekeeping:
    - Add records-merge.mjs and its test to deploy.yml's docs-only list and the matching list in checks-passed.mjs (a test keeps the two equal), or every change to the script runs the full set of checks.
    - Add a row to the file map.
    - If the walk ledger and the skill log keep any line-level handling, pin them `text eol=lf`.
    - DECISIONS-ARCHIVE under union: two sides archiving on the same day each create "## Moved <day>" and a table header, giving a doubled heading. In c233ee7da, union put D1748 under the previous day's section. The script should de-duplicate the day heading.

14. P3, simpler and lower-risk (item 9 of the brief): most clashes come from one file every chat edits at one spot (HANDOFF.md: 48 of 74 merges; file-map's changelog: 17; the skill log's sequential numbers: 37).
    - A file per `## Now` block (e.g. `handoff/now/<branch>.md`, with HANDOFF.md listing them) removes the biggest source with no merge logic at all. The cost: the session-handoff skill, the start hook and docsize change, which is a working-guide read.
    - Skill notes numbered by chat and date, or appended under per-chat headings, end the renumbering.
    - If the file per block is not taken, the per-block three-way merge in finding 1 is still needed.

CHECKED AND SOUND
- The measured scale: 74 of 143 clash, HANDOFF.md the largest, then the skill log and the file map. Union alone clears 12. Matches the plan's proportions.
- The full rows were rightly left out of union.
- OUTSTANDING-ARCHIVE.md and DECISIONS-ARCHIVE.md are truly add-only since 1 Nov (no line deleted), so union is safe there apart from the day-heading cosmetics.
- `text eol=lf` plus a separate `merge=union` line combine correctly in .gitattributes. The two archives already carry the pin.
- A .gitattributes change runs every check once, and needs his "merge live" (it is not on the notes-only list). The plan says so.
- docsize already fails on two blocks for one branch and on a broken handoff shape, which catches the shared-closing-line trap of Observation 895 if naive keep-both is used on the handoff.
- Part 3's "never stack one pull request on another" is right (a stacked pull request runs no checks).
- 63 of the 74 clashing merges touch only files the plan covers, so the gain is real once findings 1–8 are fixed.
