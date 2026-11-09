# [MERGE-ONCE-RECORDS] — the plan's red team, the brief (8 Nov 26, chat 33)

Sent word for word to Astra (`codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`) and to a fresh,
blind Opus reader, each blind to the other (an important plan's red team: D1760, D1770). Their reports:
`2026-11-08-merge-once-records-redteam-astra.md`, `…-redteam-opus.md`.

---

You are a blind red-team reader for the Raptor repo (a squadron scheduling web app run by one non-technical owner and
many parallel AI chats). Read only; change no file in the repo (scratch copies outside it, `git merge-tree`, throwaway
clones or worktrees in a temp folder are fine). Nobody else's report on this plan is given to you — do not look for one.

THE PLAN: `raptor-port/docs/superpowers/plans/2026-11-08-merge-once-records-plan.md` — read it whole. Its backlog item:
`### [MERGE-ONCE-RECORDS]` in `OUTSTANDING.md`. The owner's go for all three parts: D1930
(`grep -h '^| D1930 |' .claude/decisions-full/*.md`), and the older D822 the same way. Nothing is built yet.

THE PROBLEM: on 8 Nov 26, 66 of the day's 113 two-parent merges (`git log --merges --since=2026-11-08 --until=2026-11-09
--all`) stopped on clashes in the record files, each settled by hand — so each code pull request kept falling behind
`main` and re-ran its 6-minute check. The plan: (1) `merge=union` in `.gitattributes` for four add-only files; (2) a
script, `raptor-port/scripts/records-merge.mjs`, run after `git merge origin/main` stops, settling `HANDOFF.md`,
`DECISIONS.md`'s map, the skill log, `file-map.md` and the backlog's priority list by their shape, leaving the rest to
the chat, then running the document and rule checks and undoing itself if either fails; (3) a merge-once rule in
`.claude/rules/shipping.md`.

The files and tools it rests on — read what you need:
- `HANDOFF.md` (its head says how `## Now` blocks are written; markers `<!-- now:<branch> -->` … `<!-- /now -->`;
  `## Gate baseline`); `.claude/rules/doc-structure.md` (where each fact lives, how a block leaves); `.claude/rules/shipping.md`
  (§"Push" and "merge live" — the merge lock's four steps, the level check; §The checks; the "only notes" list).
- `DECISIONS.md` (the map and the three steps at its head); `raptor-port/scripts/backlog-archive.mjs` (its `--rulings`
  mode); `raptor-port/scripts/docsize.mjs` and `docsize-rulings.mjs` (the guarantees: no ruling or backlog item lost or
  doubled, the handoff's shape); `raptor-port/scripts/rulecheck.mjs`.
- `.claude/skill-observations/log.md` (numbered `### Observation N:` entries; the collision rule is in
  `.claude/skills/task-observer/` and the session-start short form quoted in `.claude/skills/TASK-OBSERVER-VENDORED.md`).
- `raptor-port/docs/file-map.md`; `OUTSTANDING.md`'s priority list (near its top); `raptor-port/docs/walk-ledger.md`;
  `OUTSTANDING-ARCHIVE.md`, `DECISIONS-ARCHIVE.md`, `.claude/decisions-full/*.md`; `.gitattributes`;
  `.github/workflows/deploy.yml` and `docs-guard.yml` (what a `.gitattributes` change starts).

ASK — what is MISSING or WRONG in the plan, before anything is built. Not "is it a good idea" — he has said go. A claim
is a finding only with a concrete failure (the exact merge, file, block or sequence of events), its cause, and the exact
change to the plan that fixes it (D489). Where you can, prove it on a real merge of 8 Nov 26 with `git merge-tree`.
Rank by harm: a ruling, backlog item, handoff block or skill note silently lost, doubled or revived first; then a merge
that goes wrong unseen; then wasted effort. Areas to press on (not a limit):
1. `merge=union`: where it applies beyond `git merge` (rebase, cherry-pick, revert, `git merge-tree`, GitHub's own
   mergeability check and its server-side merge of a pull request — would a pull request still show CONFLICTING and run no
   checks?); whether any of the four files is in fact edited in place (not only added to) by a script or a chat; line
   endings with `text eol=lf`; a half-overlapping hunk interleaving two entries.
2. `HANDOFF.md`'s rebuild: "main's version of every block except this branch's own" — a chat that legitimately removes
   or edits ANOTHER chat's block (a merged one at handoff, D78 / doc-structure), a block renamed to a new branch, two
   chats sharing one branch, a block written on a branch whose name differs from the marker, newest-first order, the text
   OUTSIDE `## Now` (`## Next, in order`, `## Gate baseline` "the newer count" — how is newer decided?, the standing
   sections), a hand edit inside the merge (the plan says leave room for it — how, if the script rebuilds the file?).
3. The skill log: renumbering this branch's notes past `main`'s highest — which notes are "this branch's" (the merge-base
   decides?), cross-references to them elsewhere (the handoff, commit messages already pushed, the archive), a third
   branch that already took the new numbers.
4. `file-map.md` and the priority list: how "a row each side added" is told from "a row one side changed", rows moved,
   rows deleted by one side.
5. The rulings map rebuilt by `--rulings`: what else that mode does (moves rows? archives?) that must NOT run inside a
   merge; the rulings files and full rows, which the plan leaves to the chat — is that still most of the 66?
6. "Undo its own work if docsize or rulecheck fails": what state the merge is left in, and whether a run that fails for
   a reason the merge did not cause (a check already red on `main`) blocks every chat.
7. The replay test on the 66 merges: is "hold every line the chat kept and no line it dropped" a sound, checkable pass
   mark, and what should count as passing?
8. Part 3, merge once: its interplay with each job's own "merge live" (typed in its own chat, D1742 — a relayed word is
   refused), the merge lock, D1746's "his word still stands unless settling a clash changed this branch's own app code",
   Vercel previews, closing the other pull requests, D1407's notes-only self-merge.
9. Anything simpler that gets most of the gain with less risk (e.g. fewer clashing places in the files themselves).

Report: numbered findings, each with its severity (P1 loses or doubles a record unseen; P2 a wrong merge seen only
later or a blocked chat; P3 waste), the failure, its cause, its proof if any, and the exact plan change. Then a short
"checked and sound" list. Plain text, no preamble.
