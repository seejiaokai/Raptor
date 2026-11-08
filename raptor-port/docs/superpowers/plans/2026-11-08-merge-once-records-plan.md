# [MERGE-ONCE-RECORDS] — the plan (8 Nov 26, chat 27; plan only, nothing built — his D822)

**Status:** put to him 8 Nov 26; **his go for all three parts the same evening ("Go, all three", D1930)** — to be built by
a fresh chat (33). **Red-teamed 8 Nov 26 by chat 33 — the plan as built is §After the red team, at the end, which replaces the three parts where they differ.** Before that: the plan's red team comes first (an
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

## After the red team — the plan as it will be built (8 Nov 26, chat 33)

Read by Astra and a fresh, blind Opus reader, blind to each other (`raptor-port/docs/superpowers/briefs/2026-11-08-merge-once-records-redteam-{brief,astra,opus}.md`):
Astra 10 findings, the Opus reader 14, every one held. **This section replaces the three parts above where they differ**; the measurements
above stand (re-counted with full times the day now has 143 merges, 74 clashing — the same shares).

**What changed, and why.**
- **No `merge=union` at all** (Astra 2, 3; Opus 4, 5, 12, 13). The walk ledger and the skill log are edited in place (rows rewritten, a
  note's status changed, notes archived), so "keep both sides" would double or revive a record unseen; a merge that clashes only in
  such a file would also finish cleanly and skip every check — three of 8 Nov's would have committed a skill-note number twice; on the
  two archives it doubles a day's "## Moved" heading; and GitHub ignores the setting anyway. The add-only files still keep both
  sides — done by the settle step below, which knows where an entry starts and ends. `.gitattributes` gains only `eol=lf` pins for
  the walk ledger and the file map (already LF); the skill log is left unpinned (one line holds a carriage return — its bytes kept).
- **Every block and section is merged three ways against the merge base, never by "which branch is mine"** (Astra 1; Opus 1, 2): a
  branch name does not say whose block is whose — a chat removes merged blocks, edits another chat's block for a records follow-up,
  takes over a block, or sits on a detached HEAD.
- **The step settles what it can and leaves the rest marked for the chat; it never undoes good work because something is left**
  (Astra 6; Opus 3, 7).
- **The rulings go to the merge mode that already exists**, `backlog-archive.mjs --rulings --merge`, never plain `--rulings` (Astra 5;
  Opus 6).
- **Skill-note numbers are checked in every run of the document check** (Astra 2; Opus 4), and renumbering touches only the numbers
  that clash (Astra 4; Opus 9).

### Part 1 (now) — the document check knows the skill log
`docsize.mjs` gains one check: every `### Observation N:` number in `.claude/skill-observations/log.md` appears once (and once across the
log and its archive). Red first on a copy with a doubled number. It runs in the Docs guard on every pull request, so a doubled number
can no longer reach `main` from a merge that finished cleanly.

### Part 2 — the settle step, `node raptor-port/scripts/records-merge.mjs`
**Round 3 (8 Nov 26, after the narrow re-read of the fixes — `…-reread-{astra,opus}.md`):** the fixes' joining logic caused a
cascade (two versions of one archived item fused, a shared last line moved between items, a table head doubled), so the host chose
guardrails that settle less but are never silently wrong, and two statements below no longer hold. (1) A citation of a renumbered
note is **never rewritten** — only the heading's number changes, and every line this branch added that cites it is listed "look by
hand: <file>:<line> cites Observation N (renumbered here to M)". A day heading (`## `) added on either side leaves the whole skill
log. (2) In the insertion-only files, a heading both inserted is **not** kept once: a region is settled only when both sides only
inserted, the two share no non-blank line, neither holds a `#` line or a table head, each is whole rows or whole paragraphs and ends
at a line end — this branch's text, one blank line only for paragraph-shaped text, then `main`'s; anything else, an archive's
"## Moved <day>" both opened among it, is left in git's marks. Also: a code block still open at the end of a text is read as text
(the document check names a new one); in `HANDOFF.md` two different new `## ` sections at one place are both kept, this branch's
first; the replay also fails on a step that crashed, on a doubled ledger row and on any non-blank line doubled — above the chat's
count and above the most of each parent's and the two parents' less the base's (the host's option 2: a line both sides added stands
that often in a correct merge).
Run after `git merge origin/main` stops on clashes (the chat's own hand edits AFTER it, never before).
- **Inputs:** only paths git still lists as unmerged, read from git's three staged copies (base, ours, theirs) — never the files on disk.
  A file whose working copy is no longer git's own conflicted output is refused by name (the chat has edited it — leave it to the chat).
  It never stages anything (`git add` stays the chat's) and never runs `git merge --abort`.
- **The rule for every record, in every file:** cut the file into its records (below); for each record, compared with the base — the same
  on both sides, or changed on one side only: that side; added on one side: kept; deleted on one side and untouched on the other:
  deleted; added on both sides as different text, changed on both, or deleted against changed: **left for the chat**, written in git's
  own conflict marks for that record alone. Records keep the order of the side that changed the order; new ones go where their side put
  them.
- **The records, by file:**
  - `HANDOFF.md` — the head, each `<!-- now:… -->` block by its marker, `## Next, in order`, `## Gate baseline` (changed on both
    sides → left for the chat: which count is newer and where the other goes is a judgement — D1733), and every later section by its
    heading. A block renamed to a new marker counts as one removed and one added.
  - The skill log — each `### Observation N:` entry. Two different entries with one number: the ones this branch added (not in the
    base, not in `main`) are renumbered past the highest number on `main`, this branch, the log's archive and every remote branch
    (`git grep` over `refs/remotes`, as the short form says); in the lines this branch added, a citation of a renumbered note is
    rewritten only where it reads `Observation N` and N is this branch's; each rewrite printed, old → new, with the note's title.
    A second run on the same input changes nothing.
  - `raptor-port/docs/walk-ledger.md`, `raptor-port/docs/file-map.md`, `OUTSTANDING-ARCHIVE.md`, `DECISIONS-ARCHIVE.md` — only a clash
    where BOTH sides inserted text at the same place and neither changed a line of the base is settled: this branch's text, then
    `main`'s; a heading both inserted the same (an archive's "## Moved <day>") is kept once, each side's entries under it. Anything
    else is left.
  - `OUTSTANDING.md` — the same insertion-only rule (its priority list and the reads-owed list keyed by `[ID]` in a later version if
    the replay shows it is worth it); anything else left.
  - The rulings files and `DECISIONS.md` — not touched by this script: once the files above are settled it prints the one command to run
    next, `node raptor-port/scripts/backlog-archive.mjs --rulings --merge`, which already merges each ruling three ways and refuses to
    start while another file is unmerged.
  - Any other unmerged file (app code among them) — not touched, listed.
- **Then:** if nothing is left unmerged, `npm run docsize` and `npm run rulecheck`; a failure is compared with the same check on
  `origin/main` — only a NEW failure counts, and then every file the step wrote is put back to git's conflicted state
  (`git checkout -m -- <file>`) and the failure is named. With something left, the checks are not run; the step prints exactly what
  is left, by file and record.
- `--dry-run` prints what it would do and writes nothing.

**Before it is trusted — the replay.** The exact list of 8 Nov 26's clashing merges (each merge and its two parents) is committed beside
the test. For each, the step runs on git's real staged copies; each file it settles is compared with what the chat committed: the same
bytes, or every difference explained (the chat's own new lines, a renumber), and the same count of each record's identity — block
markers, note numbers, ledger rows, `[ID]`s, D-numbers. A file it leaves counts as safe but unsaved. Plus made-up cases 8 Nov never hit:
a merge that ends clean, a second run, a hand-edited file refused, a revert, the gate baseline changed on both sides, an archive day
heading inserted on both sides, a doubled skill-note number with a citation. The day's later merges (after the list was cut) are the
held-out check. Its tests in `raptor-port/scripts/records-merge.test.mjs`, red first.

### Part 3 — merge once, when jobs finish together (`shipping.md`, a working guide: Astra and a second reader — D1761)
When two or more finished jobs wait on his "merge live" at once, one chat may offer to merge them as one: (1) each job's chat agrees and
stops pushing — its branch frozen at a named commit; (2) one new branch from `main` takes each job's branch by its own merge commit (so a
job can be dropped by building the branch again without it — never a revert), its pull request opened, the full check green, the preview
link and the list of jobs it holds sent to him; jobs that share a screen or a file are checked together, sized by the riskiest (D485);
(3) **his "merge live" for that named batch, typed in the chat that merges it** — a word typed for one job in its own chat does not
cover the batch (D1742); a clash settled in a job's own app code sends that job back for his look (D1746); (4) the job pull requests stay
open until the combined one is green, then are closed with a pointer to it; (5) the merge lock's four steps, then the live check. A
notes-only pull request stays out of a batch (D1407); the D1795/D1796 auto-merge chats keep their own rule. Never stack one pull request
on another's branch.

**Left as an option, not built:** one file per handoff block (`HANDOFF.md` caused 48 of the 74 clashes — Opus 14) — a larger change to how
every chat writes its handoff; weighed again if the replay shows the handoff still clashing after part 2.
