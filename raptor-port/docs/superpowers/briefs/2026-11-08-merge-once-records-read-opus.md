# [MERGE-ONCE-RECORDS] — the finished code, the fresh Opus read (8 Nov 26, chat 33)

A fresh, blind Opus reader (a helper of chat 33 that did not write the code, blind to Astra's read); brief: `2026-11-08-merge-once-records-read-brief.md`; the read of commit `0e059ce63`. Its report, word for word; its reproduction scripts stayed in the chat's scratchpad.

---

[MERGE-ONCE-RECORDS] — fresh, blind Opus read of the finished code (branch claude/merge-once-records-f59c5d, 0e059ce63)

Every finding below was reproduced in a throwaway repo under the scratchpad (opus-read/s1.mjs, s2.mjs, s3.mjs, s4.mjs, harness h.mjs), with the branch's records-merge.mjs copied in unchanged and a real `git merge --no-commit --no-ff main` that stops on its clashes.

FINDINGS

1. P2 (borders on P1) — the insertion settling makes a merge WORSE than git's own marks when both sides add the same "## Moved <day>" heading at DIFFERENT offsets: the heading ends up twice and an older row lands under the newer day. The step says "settled" and exits 0.
   Failure (s4.mjs): the base DECISIONS-ARCHIVE.md ends "## Moved 7 Nov 26 / table head / | D1 |". This branch adds "## Moved 8 Nov 26" + head + D2. Main adds a later 7 Nov row D3, then "## Moved 8 Nov 26" + head + D4. Git's own output (the default style trims what both sides share) is two small, clear clashes: D3 alone under 7 Nov, and D2 against D4 under one shared 8 Nov heading. The step writes: 7 Nov: D1 · "## Moved 8 Nov 26": D2, D3 (a 7 Nov row) · "## Moved 8 Nov 26" AGAIN: D4. The step exits 0, so with the real checks it would go to commit (docsize does not look for a doubled day heading, and does not check which day a row sits under). This is the ordinary shape of a branch cut part-way through a day whose archiving went on on main.
   Cause: settleInsertions reads the regions with `--diff3`. Under --diff3, xdiff drops to the EAGER level, which never trims shared lines, so the two insertions become ONE region with an empty base. joinInsertions then only removes a shared PREFIX, and here the shared heading is not at the start of main's side.
   Fix: in joinInsertions, if any `## ` line from the region appears on BOTH sides but not in their shared prefix, do not join: leave the region (push to `left`, render it with renderConflict). Better still, settle each part separately by splitting both sides at their first shared `## ` line: (o1 + t1), the heading block once, then (o2 + t2), recursively. Add a test with this exact shape: one day heading, two rows on main, a different offset.

2. P2 — same cause: a row inside the shared heading's section is put under the WRONG day when this branch's text carries a LATER day heading and main's does not.
   Failure (s1.mjs, S1): the base ends under "## Moved 6 Nov 26". This branch adds "## Moved 7 Nov 26" + D2, then "## Moved 8 Nov 26" + D3. Main adds "## Moved 7 Nov 26" + D4. Result: D4 (moved 7 Nov) is under "## Moved 8 Nov 26", after D3. The same shape in OUTSTANDING-ARCHIVE.md also loses the blank line between this branch's last item and main's first heading ("c\n### [D] …"; S1b).
   Cause: joinInsertions puts all of main's remainder (rt) after ALL of this branch's remainder (ro), even when ro opens a new `## ` heading part-way through.
   Fix: let h = the index of the first `## ` line in ro. If there is one, place rt before it: [...prefix, ...ro.slice(0, h) without its trailing blank lines, ...rt, the blank lines, ...ro.slice(h)]. If BOTH ro and rt hold a `## ` line, leave the region. For item-shaped entries (not table rows), keep one blank line between the last line of ro and the first line of rt. Test: the S1 shape, red first.

3. P2 — a line both sides inserted identically at the start of a region is DOUBLED, when it is not a `## ` heading.
   Failure (s1.mjs, S2): in file-map.md both sides append "| shared.ts | same row |", then a different row each. The step writes shared.ts twice. Git's own default output would have shown it once, outside the clash. The same holds for a shared trailing line (a shared suffix is never removed).
   Cause: the same EAGER reading (no trimming), and joinInsertions removes the shared prefix only when it holds a heading.
   Fix: always remove a shared prefix and a shared suffix that hold at least one non-blank line (keep a blank-only prefix as it is, so paragraphs stay apart). Or read the regions with git's default (trimming) level and get each region's base some other way. Rare, since both sides need the same line, but it is a doubled record, so it is ranked here rather than as waste.

4. P3 — a merge started with `git -c merge.conflictStyle=diff3 merge …` (or any style git used that is not in `git config`) has every record file REFUSED as "edited since", though nobody touched it.
   Failure (s2.mjs): with the style given on the command line only, HANDOFF.md comes back "its working copy is not what git wrote … edited since". It is safe (nothing written), but the message is false and the step does nothing. With the style set in config, merge / diff3 / zdiff3 all pass the refuse check (checked in s2.mjs).
   Fix: if the first comparison fails, compare again with the other two styles (markless compare) before refusing. Or say in the message "or the merge was run with a different conflict style".

5. P3 — the renumber is not stable across a `git fetch`, and the false "edited since" refusal comes back. A second run after a fetch that brought a higher note number picks a different number, so its result no longer equals the file on disk, and the file is refused as hand-edited.
   Fix: on a second run, read the number the first run chose back out of the working copy (whatever is under this branch's renumbered title). Or, when disk ≠ the step's result, first check whether it equals the step's result for some other renumber, and say "renumbered by an earlier run".

6. P3 — highestNumber looks at HEAD, MERGE_HEAD and refs/remotes only. The other chats on this PC work in worktrees of the same repository, so their unpushed notes are visible as refs/heads/*, and those are not read. The short form says "every remote branch", so this follows the spec, but adding refs/heads costs nothing and closes the commonest same-PC clash (two parallel chats, neither pushed yet).
   Fix: include refs/heads in the ref list.

7. P3 (the record, not the code) — the general rulings page still says of D1930 "the add-only record files keep both sides". The build dropped git's keep-both-sides setting entirely (the red team's change). The step now keeps both sides for the add-only files itself, so the meaning mostly stands, but the page also still calls the step one that "settles the other record files". It now settles all of them, and part 1 is now the skill-number check. By D201 the stale text is fixed in the change that departs from it, and the owner hears in plain words that part 1 changed shape before his "merge live" (his go was for the plan as first put to him).
   Fix: rewrite that line in how-we-work.md (and its full row's "where it lives now"), and name the change in the closing report to him.

8. P3 — the replay cannot fail. It is a listing, not a check: a wrong result (findings 1–3, a doubled row) shows only as one more "different" file among 61, sorted by hand. It also leaves out the files settled "in part" (1), anything refused, and the cross-branch renumber (its remote branches are removed). The held-out set is 2 merges.
   Fix: make the replay fail on (a) any identity count where the step's file has a number, marker or [ID] MORE times than either parent has it, and (b) a `## ` heading line the step's file holds more often than either parent. Both would have caught findings 1 and 3 mechanically.

CHECKED AND SOUND

- Runs: `node --test raptor-port/scripts/records-merge.test.mjs`: 22 of 22 pass (43 s). `node scripts/docsize-selftest.mjs`: OK, the three new skill-log scenarios included. `npm run docsize`: OK.

- The refuse check with merge, diff3 and zdiff3 set in config; a file with a lone carriage return (the skill log's) round-trips byte for byte; labels compared by mark only.
- The put-back after a NEW check failure: `git checkout -m` restored HANDOFF.md with the same content, only the labels changed to ours/theirs, and a re-run accepts it and settles it again (s3.mjs). The two new blocks that shared git's `<!-- /now -->` came out separate and whole.
- Writing through a temporary copy, the leftover-copy guard, never staging, never aborting; nothing is written before every file has been computed.
- HANDOFF cutting: markers inside fences are text; a doubled marker leaves the whole file; delete-against-edit is left; the gate baseline changed on both sides is always left.
- The skill-log renumber: past the highest on both sides, the archive and the remotes; this branch's own citations rewritten, main's untouched; the other files that cite the number are listed. Every heading in today's log and archive matches the `### Observation N:` shape both scripts use.
- docsize: green on the branch today (no false alarm on the log or the archive); its new self-test scenarios are right (a number used twice in the log, and a log number reused from the archive).
- The interplay with `backlog-archive.mjs --rulings --merge`: that mode refuses only non-rulings unmerged files (the archive counts as a rulings path) and rebuilds DECISIONS-ARCHIVE.md from git's copies, so it overwrites rather than doubles what the step settled there. This is as the step's comments say.
- The only-a-new-failure comparison: both checks print their failure lines on stderr, which is what is compared, and neither needs installed packages, so the throwaway worktree of the merged-in commit runs them.
- The workflows: the notes-only lists in deploy.yml and checks-passed.mjs are equal (the existing test holds them equal); docs-guard.yml only adds the test step; nothing else changed.
- shipping.md step 2 and the merge-once bullet: they keep the merge lock, the level check, D1742's "his word typed in the merging chat", D1746's send-back for app code, D1407/D1737 notes-only and D1795/D1796 out. `--no-commit --no-ff` only adds a commit the chat must make, and the step says so on exit 0. One small loss: the plan's explicit "a word typed for one job in its own chat does not cover the batch" is now only implied.
- An add/add HANDOFF.md (no base, s2.mjs) puts main's block after the gate baseline. That cannot happen in this repo (the file always exists), so it is not ranked.

TIDINESS (filed, not fixed)
1. The script runs at load and exports nothing, so cut / orderKeys / joinInsertions can be tested only through whole throwaway repos (about 45 s). Exporting the pure functions behind a main guard would allow fast tests of exactly the shapes in findings 1–3.
2. `already` mixes up "settled by an earlier run" with "the step settled nothing and git's output equals its result", so the report line can be false on a first run.
3. The conflict style is read once from config. Findings 4 and 5 both end in the same false "edited since" message: one helper that explains WHY the disk differs (style, renumber, a real hand edit) would cover both.
