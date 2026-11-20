# Backlog additions from group A-handoff (the skill-notes review of 20 Nov 26)

No new item: both additions extend an existing item. `OUTSTANDING.md` is rewritten by a script, so only the additions
are staged here, to be applied at install (weekly-review "Delivering": a file a script keeps rewriting).

## 1. Add to `[CHECK-TOOLS-HARDEN]` — a new paragraph after its last one ("**Added 10 Nov 26 (the skill-notes review, group A-walks):** … (g) …")

The letters (h) to (k) assume no other group of this review adds to the item; renumber at install if one does.

```
**Added 20 Nov 26 (the skill-notes review, group A-handoff):** (h) **A commit guard beside the push guard**
(`.claude/hooks/`): it records, per session, the branch this session last created or switched to, and refuses
`git commit` when the checkout's current branch differs, naming both — two chats in one folder put one chat's commit on
the other's branch on 3 and 10 Nov 26 (skill notes 787, 916, 917), and the check by hand, `git branch --show-current`
before each commit, was known and not run. (i) **No time from memory in a handoff block** (skill notes 853, 873, 892,
932, 935 — met five times; the guides' "read the clock" lines did not stop it): the document check, at its Stop-hook
run on his PC, fails a dated clock time in a `## Now` block that is later than the PC's own clock — every wrong time
met so far was later (00:40 written "01:00" and "00:55"; 19:10 written "19:45"; 19:05 written "about 20:00"); CI's run
skips it, its clock being UTC. Or a placeholder in the block that the commit fills from the clock. (j) **A merged
block's removal checked** (skill note 947): run on his PC, the document check fails a change that removes another
chat's `## Now` block whose branch is not merged into `origin/main` — on 14 Nov 26 later handoffs removed two overnight
runs' blocks while seven of their pull requests sat open. (k) **The push guard refuses a push whose new commits add one
file over about 5 MB outside the picture folders** (skill note 944: two 13.5 MB raw dumps pushed on 14 Nov 26; the force
push to take them out was refused and the job was made again on a second branch).
```

Its priority-list line (`- [CHECK-TOOLS-HARDEN] — small hardening of the checking tools — his word.`) needs no change.

## 2. Add to `[START-CONTEXT-AUDIT]` — a new paragraph at the end of the item (after "…that merged with PR #481 (`[STACK-MERGED-TIDY]`).")

```
**Added 20 Nov 26 (skill note 942):** measure what a scheduler-engine job loads on its first source file, as
`[LW-START-LOAD]` (archived) did for the Leave War (D1960, D1973): chat 68's small engine fix at the FULL tier read 76%
full after its reading alone and 90% once the fix and its tests were committed (13 Nov 26) — opening the engine and
screen files loaded the project guide, the scheduler's, the screen-design and OIL pages, the builder's rules and the
design short form, each whole. Then options for which of them stop loading there, as for the Leave War.
```

Its priority-list line becomes:
`- [START-CONTEXT-AUDIT] — the guard that stops a new chat's load growing back is not built; a scheduler-engine job's load to measure (skill note 942); two of his own settings.`
