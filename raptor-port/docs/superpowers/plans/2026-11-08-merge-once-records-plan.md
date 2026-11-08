# [MERGE-ONCE-RECORDS] — the plan (8 Nov 26, chat 27; plan only, nothing built — his D822)

**Status:** put to him 8 Nov 26; **his go for all three parts the same evening ("Go, all three", D1930)** — to be built by
a fresh chat (33). Nothing is built yet: the plan's red team comes first (an
important plan: Astra, then a fresh, blind Opus reader — D1760, D1770), then the build on its own branch, merged on his
"merge live" (it changes `.gitattributes`, a script and `shipping.md` — not notes only).

## What was measured first (8 Nov 26, on a copy — no file of the repo changed)

Every two-parent merge made on 8 Nov 26 on any branch (113) was merged again with `git merge-tree`, once as git does
today and once with git's built-in "keep both sides" setting (`merge=union`) switched on, by a throwaway attributes tree
(`git -c attr.tree=<tree>`; `--attr-source` does not exist in git 2.55). Each automatic result was compared with what
the chat committed by hand. Scripts: kept in the chat's scratchpad, not the repo; the method is the paragraph above.

- **66 of the 113 merges clashed.** Files that clashed, by how many merges: `HANDOFF.md` 41, the skill log 34,
  `file-map.md` 16, `DECISIONS.md` 12, the walk ledger 5, the general rulings page and its full rows 5 each, the backlog
  archive 4, `ui-contracts.md` 3, the backlog 2, the rulings archive 2; app code twice (one merge).
- **"Keep both sides" on the five add-only files** (the skill log, the walk ledger, the two archives, the full rows)
  **would have made 12 of the 66 clean** — the other 54 still clash in `HANDOFF.md`, `file-map.md` or `DECISIONS.md`.
- **On the other files it is wrong.** Compared with the hand result, the automatic one kept lines the chat had rightly
  dropped — up to 29 in one handoff merge: a block one side rewrote and the other removed comes back twice. On the
  rulings page one merge kept 226 stale lines. The document check would catch a doubled ruling or item, but not a
  doubled handoff line.
- **The skill log is add-only but numbered:** in 30 of its 34 clashes the chat also renumbered a note that two branches
  had given the same number — "keep both sides" keeps both numbers, so a renumber step must follow it.
- Most hand merges also changed a line neither side had (a chat updating its own handoff block in the merge) — fine, and
  any tool must leave room for it.

## The plan — three parts, in order

1. **"Keep both sides" for the files only ever added to** (`.gitattributes`): the walk ledger, `OUTSTANDING-ARCHIVE.md`,
   `DECISIONS-ARCHIVE.md`, the skill log. Not the full rows: a row there is edited when its ruling is archived, and a
   kept-twice row is a doubled ruling. A change to `.gitattributes` runs every check once (Fable's CI-PATHS-001) — paid
   once. The skill log's existing collision rule (renumber your own past the other's) becomes a script step, below.
2. **A "settle the records" step** — `node raptor-port/scripts/records-merge.mjs`, run after `git merge origin/main`
   stops on clashes. It touches only record files and settles each by its shape; anything it cannot settle by rule it
   leaves for the chat, as today:
   - `HANDOFF.md`: rebuilt block by block, by the `<!-- now:<branch> -->` markers — `main`'s version of every block,
     except this branch's own block from this branch; a block `main` removed stays removed; the gate baseline: the newer
     count (D1733).
   - `DECISIONS.md`'s map: rebuilt by `backlog-archive.mjs --rulings`, which already does it.
   - The skill log: this branch's new notes renumbered past `main`'s highest, every cross-reference to them corrected.
   - `file-map.md` and the backlog's priority list: rows each side added are both kept; a row both sides changed is
     left for the chat.
   - Then `npm run docsize` and `npm run rulecheck`; if either fails, the step undoes its own work and says which file.
   It is replayed on the 66 merges of 8 Nov 26 before it is trusted: its result must hold every line the chat kept, and
   no line the chat dropped, except where a later look shows the chat erred.
3. **Merge once, when jobs finish together** (D822 point 1, D485): when two or more finished jobs wait on his "merge
   live" at the same time, one chat combines their branches on one new branch from `main` (each job's own checks and
   evidence kept), opens one pull request, closes the others with a pointer to it, and merges once under the merge lock.
   Written into `shipping.md` (a working guide: Astra and a second reader, D1761). It never stacks one pull request on
   another's branch.

## What it would change for him

Today a chat bringing `main` in stops to settle record clashes by hand, often more than once a day per chat (66 of 113
merges on 8 Nov 26). After the plan, most of those settle in one step, and a day of finished jobs can reach the live app
in one merge instead of several. Nothing changes on screen. The rulings, the backlog and the handoff keep every guarantee
the document check gives today.

## Cost

Part 1: small (one file, one full check). Part 2: the most work — a script and its tests, replayed on the 66 real merges;
a WALK is not needed (no screen), the reads are. Part 3: words only, read as a guide change.
