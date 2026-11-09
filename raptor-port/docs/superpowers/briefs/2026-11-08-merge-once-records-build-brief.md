# [MERGE-ONCE-RECORDS] — the build brief (8 Nov 26, chat 33)

Given to an Opus builder helper of chat 33; chat 33 (the host) reviews its diff, then the finished code goes to Astra and a fresh,
blind Opus reader (D790, D1770).

---

You build the plan's §"After the red team" in `raptor-port/docs/superpowers/plans/2026-11-08-merge-once-records-plan.md` — read
that section whole, and the two red-team reports beside it (`raptor-port/docs/superpowers/briefs/2026-11-08-merge-once-records-redteam-{astra,opus}.md`):
every case they name is a test case. Work in the git worktree `C:\Users\User\projects\Raptor\.claude\worktrees\pr-inputs-add-right-5b2653`,
branch `claude/merge-once-records-f59c5d` — never cd to a parent folder; commit on this branch as you go (end each message with
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`); **do not push**. Before a build read `.claude/rules/raptor-executor.md`.
House style for scripts: read `raptor-port/scripts/backlog-archive.mjs` and `raptor-port/scripts/docsize.mjs` first and match them
(plain Node ESM, no new dependency, comments say why).

## Shell traps on this PC (each has cost a chat)
- Git Bash: `MSYS_NO_PATHCONV=1` before `git show ref:path`; no `jq`; a here-document body containing an apostrophe fails —
  write multi-line text or scripts with the Write tool and run the file; `node -e` mangles backslashes — use a file.
- Edit scripts: `s.replace(a, () => b)` (a `$'` in text is expanded otherwise); keep LF endings (`newline=''` in Python if used).
- A pipe hides a failed exit (`check | tail && …`): write output to a file and test the command's own exit.
- `.claude/skill-observations/log.md` holds one line with a carriage return — the script must keep every file's bytes it does not
  settle exactly as git gave them.

## What to build, in this order, each red first (write the failing test, see it fail, then the code)
1. **`raptor-port/scripts/docsize.mjs` — one new check, added as its own function plus one call** (chat 34 is changing one tripwire
   number in this file on another branch; do not touch the tripwire list or its numbers): every `### Observation N:` number appears
   once in `.claude/skill-observations/log.md`, and no number in the log also heads an entry in its archive folder
   (`.claude/skill-observations/archive/` — read how it is laid out first). Confirm the live files pass today; if they do not, STOP and
   report what is doubled (do not renumber anything). Prove red on a copy. If docsize has a self-test (`docsize-selftest.mjs`), add a
   case there the way its others are written.
2. **`raptor-port/scripts/records-merge.mjs` and `raptor-port/scripts/records-merge.test.mjs`** — exactly the plan's Part 2. Notes:
   - The three staged copies: `git show :1:<path>` (base; may be absent — an add/add clash), `:2:` (ours), `:3:` (theirs). "Git's own
     conflicted output" for the refuse check: `git merge-file -p` of the three (with the same labels and conflict style git used —
     check `merge.conflictStyle`; compare tolerantly only on the marker labels if you must, and say how in a comment), or another way
     you show is exact.
   - Tests build throwaway repos in a temp folder (`fs.mkdtempSync(os.tmpdir())`), make real merges that clash, run the script as a
     child process, and assert the files and its printed report. Cover: every rule of Part 2; Astra's 1, 2, 4, 6, 7, 8 and Opus's 1, 2,
     3, 4, 5, 7, 8, 9, 13 as cases (a removed merged block not revived; another chat's block edited by this branch kept; a hand-edited
     file refused; a doubled note number renumbered past every remote branch's highest, a citation rewritten only in this branch's
     lines; a second run changes nothing; the gate baseline changed on both sides left; an archive "## Moved <day>" heading inserted on
     both sides kept once; a ledger row edited on one side and a row added on the other; leftover records leave the checks unrun; a
     check already red on `origin/main` not counted). Run the test file alone with `node --test raptor-port/scripts/records-merge.test.mjs`.
   - `--dry-run` writes nothing.
   - It prints, at the end, the next command for the rulings (`node raptor-port/scripts/backlog-archive.mjs --rulings --merge`) when a
     rulings file or `DECISIONS.md` is still unmerged — read that mode's head first and say in the script's header how the two fit.
3. **The replay** — `raptor-port/scripts/records-merge-replay.mjs` (or a mode of the script): the list of 8 Nov 26's clashing two-parent
   merges committed as data beside it (merge id, both parents), built from `git log --merges --all` over 8 Nov 26 (Singapore time,
   +08:00 — say which window you used). For each, in a throwaway worktree or clone in the temp folder (never this worktree's index):
   check out the first parent, `git merge --no-commit --no-ff <second parent>`, run the step, and compare each file it settled with the
   committed merge's file — bytes equal, else list the differences, and compare the count of each identity (`<!-- now:` markers,
   `### Observation N` numbers, ledger rows, `[ID]` headings, D-numbers). Report: merges where the step settled everything, merges
   partly settled, and EVERY file whose settled result differs from the chat's, each difference shown. Do not count a difference as fine
   by yourself — list it for the host. Then the held-out run: merges made after the list was cut (later on 8 Nov or on 9 Nov), the
   same report. Write the replay's report to `raptor-port/docs/handpass/2026-11-08-merge-once-records.md` (the evidence sheet: a short
   head, the counts, the differences).
4. **`.gitattributes`** — `eol=lf` pins for `raptor-port/docs/walk-ledger.md` and `raptor-port/docs/file-map.md` only (both LF in the
   index today — confirm with `git ls-files --eol`), in the style of the lines already there, with a dated comment. No `merge=` line.
5. **The lists that must name the new scripts:** `.github/workflows/deploy.yml`'s docs-only list (its `paths-ignore` already lists
   `backlog-archive.mjs` and the `docsize*.mjs` scripts) and the matching list in `raptor-port/scripts/ci/checks-passed.mjs` — a test
   keeps the two equal; add the new script(s) to both, and run `node --test raptor-port/scripts/ci/checks-passed.test.mjs`. Add each new
   file to `raptor-port/docs/file-map.md`.
6. **The words** (a working guide — the host has it read; draft it, keep it short, in the file's own style):
   - `.claude/rules/shipping.md` §"Push" and "merge live", step 2's "Behind: … bring `main` in": add that a merge that stops on record
     files runs the settle step first, then the rulings merge it names, then the chat's own edits — one short sentence and the command.
   - `.claude/rules/shipping.md` §The loop: Part 3's merge-once rule, as the plan words it, in at most six lines.
   - `raptor-port/docs/gates-and-deploy.md`: one short paragraph under a fitting heading — what the settle step does and leaves, and that
     GitHub ignores attributes (why there is no `merge=union`).

## When done
Run, from `raptor-port/`: `npm run docsize`, `npm run rulecheck`, `node --test scripts/records-merge.test.mjs`,
`node --test scripts/ci/checks-passed.test.mjs`, and the replay. No full unit or browser suite (nothing under `src` changes — if you
find you must change anything under `src`, stop and ask). Return to the host: the commits (one line each), every test count with
red-before-green noted, the replay's counts and the full list of differences, anything you could not do, and every place you departed
from the plan with the reason. No file dumps.
