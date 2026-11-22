# Fable's read — lean working copies ([HELPER-COPIES-NO-PICTURES], his D2290, D2292), 22 Nov 26

Reader: Fable, called on his word; did not write the change; opened no other reader's report. Read: the brief, the
whole diff `origin/main...claude/helper-copies-no-pictures-134` and the branch head `b7fe7de1c` (the D2292 commit).
Changed no file in the repo but this one.

**How each claim was proved.** Real git (2.55, Windows) on throwaway repos under `D:/fable-lean/`, driving the
branch's own `lean-copy.mjs`; and one real-size copy — a shared clone of the project on D:, a linked copy of the branch
head (8.6 GB, 100 s to make), slimmed through the `hook` command (20 s, 845 MB after), the document check run inside
it. The throwaway scripts are kept outside the repo, `D:/fable-lean/t1.mjs` … `t4.mjs` (run `t1` first; it makes the
folder the others use). Nothing in the main folder, its worktree list or its settings was touched (26 copies before
and after). What is not proved is marked **unproven**.

## Findings, by harm

### 1. A picture that is REWRITTEN in a left-out walk folder is silently left out of the commit — HIGH

**The failure.** In a lean copy, a script writes a picture over one the commit already holds in an old walk's folder
(a re-walk after a fix, which the bug-check order requires; the drawing check re-run with the same `--out` folder,
which empties and rewrites it — `walk-scripts.md` §10; `e2e/leavewar.spec.ts` lines 8384 and 8388, which rewrite two
pictures in `2026-10-27-lw-m4/d1444/` on every Leave War browser run). The helper then commits the usual way. Proved
(`t2.mjs`):

| command in the lean copy | exit | the rewritten picture |
|---|---|---|
| `git add -A` | 0, no message | not staged |
| `git add .` | 0, no message | not staged |
| `git add -u` | 0, no message | not staged |
| `git commit -am …` | 0, no message | not committed; the other changes are |
| `git add <that file>` or `git add <pictures folder>` | 1, git's sparse-checkout message | not staged |
| the same `git add -A` in a whole copy | 0 | staged |

So the fix is committed with its OLD pictures and nothing says so; the evidence sheet then shows pictures from before
the fix. `git status` still lists the file as changed, which is the only sign. A picture the re-run no longer makes is
not removed from the commit either (in a whole copy `add -A` stages that removal).

**Cause.** Git clears its "left out" mark on a file that is on disk, but `add -A`, `add -u`, `add .` and `commit -a`
skip, without a word, every path outside the sparse rules. Only a NEW file in an old folder, or a path named outright,
is refused aloud. The header of `lean-copy.mjs` (lines 10–11), the note it hands a helper (line 105),
`gates-and-deploy.md` §Lean working copies ("refused by `git add`, loudly") and `walk-scripts.md` §2 all say or imply
the refusal is loud. The test "an old walk's folder is refused until fetched" covers only a new file.

**Fix, step by step.**
1. In `slim()`, keep the job's own walk folders in the copy: before building the patterns, list the top folders under
   `PICS` that this branch added or changed since it left `main` —
   `git diff --name-only $(git merge-base HEAD origin/main) HEAD -- <PICS>/` (if either command fails, the list is
   empty) — and leave their `!/…/` lines out of `patterns()`. A re-walk or a re-run of the drawing check then lands in
   a folder that is in the copy. These folders are one job's, megabytes.
2. Add a `check` command: read `git status --porcelain -z --untracked-files=all -- <PICS>`, pass the paths to
   `git sparse-checkout check-rules` (it prints the paths INSIDE the rules — tried on the real copy), and for every
   path it does not print, name its walk folder and say `node raptor-port/scripts/lean-copy.mjs get <folder>`; exit 1.
3. Have `install` also put a `pre-commit` hook in place (same marker, same never-replace rule) that runs `check` when
   the copy is lean and refuses the commit on exit 1. Run the same `check` from the turn-end hook beside the document
   check, since the app's helpers' copies get no git hook until `install` is run.
4. `get` after the fact is safe — proved: the rewritten file is kept and `git add -A` then stages it. Say so in the
   `check` message.
5. Correct the four texts: "a NEW file in an old folder is refused aloud; a picture written over an old one is skipped
   silently by `git add -A` and `git commit -a` — `check` and the commit hook catch it."
6. The failing test to add first (`lean-copy.test.mjs`): slim a copy; write over `2026-10-01-walk-a/s01.png`; change
   another file; `git add -A`; assert that `check` exits 1 and names `2026-10-01-walk-a` (today: there is no `check`,
   and `git status --porcelain` shows ` M docs/pics/2026-10-01-walk-a/s01.png` after an exit-0 add).

### 2. The branch head fails the document check — HIGH for the merge, small to fix

**The failure.** `npm run docsize` on `b7fe7de1c` exits 1, in the main folder and in the real lean copy alike:
`.claude/rules/decisions/how-we-work.md` is 41,254 bytes, 4 over its hard limit of 41,250 (41,206 on `main`). Pull
request 821's `docs-guard` check shows failed.

**Cause.** The D2292 commit lengthened D2290's line ("; so does a chat's own copy, never the main folder [D2292]").
The limit is a hard one, raised only on his word (D1932).

**Fix.** Tighten that one line by at least 4 bytes without dropping a rule or a citation — for example "Helpers',
reviewers' and chats' own working copies leave out the walk pictures, never the main folder; none is deleted; a task
that needs some fetches them, `lean-copy.mjs get` [D2290, D2292]." — run `npm run docsize`, push once no run is in
progress. A raise of the limit instead needs his word and its line in `PAGE_LIMITS`.

### 3. A new chat started in a copy already in use slims it, and undoes `full` — MEDIUM

**The failure, two forms** (`t1.mjs` T2, T3).
- A chat runs `lean-copy.mjs full` because its job needs every picture. The next chat started in that copy (a
  handoff) finds them gone again: SessionStart on `startup` runs `slim`, which sees an ordinary whole copy.
- Any copy already on his PC (the parallel chats' folders, the desktop's worktree chats) is slimmed the first time a
  new chat starts in it. Work not yet committed is kept (proved: changed, staged and untracked files all survive), but
  the job's own committed walk folder leaves the disk, which sets up finding 1. `OUTSTANDING.md` says of the copies
  already on his PC "his call, none touched" (item's Left (5)), and the brief says none is touched; neither is true
  once this merges.

**Cause.** `slim()` cannot tell a new copy from one made whole on purpose or made before this change; `full` leaves no
mark.

**Fix.** (a) `full` writes `git config --worktree leancopy.whole true` after disabling; `slim()` returns "left whole:
`full` was asked for" when it is set; the `slim` command typed by hand clears it first. (b) Either say plainly in
`OUTSTANDING.md` and `gates-and-deploy.md` that an existing copy is slimmed when a new chat next starts in it (D2292
covers it), or, if "none touched" is to hold, have the SessionStart path skip a copy whose branch has commits of its
own. The first is simpler and matches D2292. (c) Tests: `full` then the SessionStart hook leaves the pictures; a copy
with a committed walk of its own keeps that folder (with finding 1's step 1).

### 4. The drawing check goes red in a lean copy with advice that points the wrong way — MEDIUM

**The failure.** Three of the 21 drawing-check part lists keep their drawing records inside old walk folders
(`chat9-tracker`, `oil-earn-board`, `sched-marks`: 8, 14 and 30 files). In the real lean copy all three folders are
absent (checked). `check.mjs` line 98 then prints "NO DRAWING RECORD … record the drawing first (record.mjs)" and
reports RED. A helper following that advice re-records the approved drawing from today's code instead of fetching the
approved record — against D1478 (the approved drawing is the sole source). Running `check.mjs` itself in the lean copy
was not done (it needs a build); the absence of the files and the code path are proved, the helper's reaction is
**unproven**.

**Cause.** The check does not know a record can be left out rather than never made.

**Fix.** In `check.mjs` at that line, when `recFile` lies under `docs/img/handpass/`, print instead: "this copy
leaves out old walk pictures — run `node raptor-port/scripts/lean-copy.mjs get <that walk folder>` and run again";
add one sentence to `walk-scripts.md` §10 naming the three part lists; keep new records under `docs/mock/…/drawcheck/`
as §10 already says.

### 5. Typed copies and Codex's are slimmed without being told, and two kinds are missed — LOW to MEDIUM

- **Never told.** D2292: each chat "is told how to open one in the main folder or fetch one walk's folder". A copy
  slimmed by git's hook gets no note: the hook sends all output to nowhere, the chat's SessionStart ran earlier in the
  main folder, and neither `codex-guide.md`, `AGENTS.md` nor the session-handoff skill mentions lean copies (searched).
  A parallel chat or Codex meets it first as a missing folder. **Fix:** let `git-hook` print the note's four lines to
  stderr when it slimmed (drop `2>&1` from the hook line; git shows a hook's stderr to whoever typed the command); add
  one line each to `AGENTS.md` §Hard limits or `codex-guide.md`, and to the session-handoff skill's parallel-folder
  step. These are working guides — read as such.
- **`git worktree add --no-checkout` is never slimmed** (proved, T11b: git runs no checkout hook). No recipe in the
  repo uses it today (searched). **Fix:** one sentence in the notes; nothing to build.
- **Codex's copies:** that Codex makes them through git's own checkout hook is **unproven** — the notes state it as
  fact; the app's helpers were found not to. **Fix:** make one Codex copy after `install`, run `status` in it, and
  write what was seen.
- **Until `install` is run** typed copies stay whole; it is listed as his step (4). Sound as a record; say in the
  closing report that it is owed.

### 6. On a PC that has never had a lean copy, helpers started together can stay whole, unseen — LOW

**The failure.** Four copies slimmed at the same moment in a project with no lean copy yet: 6 of 40 were left whole
(`t3.mjs`), git's reason "could not lock config file …/.git/config" or "Permission denied". With one lean copy already
made: 40 of 40 slimmed. His PC's project already has the setting (checked: `extensions.worktreeConfig true`), so this
bites only a fresh clone or another PC.

**Cause.** The first sparse checkout in a project writes one shared setting; two at once collide. And nobody would
know: both hooks throw `slim()`'s answer away, and its message keeps only "Command failed: git …", not git's reason.

**Fix.** In `slim()`, on a failure of the `sparse-checkout set` call, wait a second and try once more (twice at most);
have `install` run `git config extensions.worktreeConfig true`; keep `e.stderr`'s first line in the message; in the
`hook` path write a "left whole: …" result to stderr (SubagentStart and SessionStart show stderr to the user only, and
exit 0 stands).

### 7. A long-lived lean copy fills up again — LOW

Bringing `main` in lays down every walk folder added on `main` since the copy was slimmed (proved, T6), and `slim`
answers "already lean" without looking. No fault, only space. **Fix:** on an already-lean copy let the typed `slim`
add `!/…/` lines for folders the commit now holds that are neither listed nor fetched nor changed locally; leave the
hooks as they are.

## Checked and found sound

- **The main folder is never slimmed** — by the function, by both hooks, by a branch switch with git's hook installed;
  on the real project the only shared thing a slim writes is the one setting above, already there.
- **A helper without a copy of its own** leaves the chat's copy alone (the folder-name test); existing helper copies on
  his PC are named `agent-<id>` as the code expects. That `cwd` in SubagentStart is the helper's own copy rests on the
  author's test — **unproven** by me; the hooks page says only that `cwd` follows Claude into a worktree.
- **Nothing uncommitted is lost:** changed, staged and untracked files outside the pictures survive a slim; any change
  or untracked file under the pictures stops it ("picture changes of its own").
- **A new walk's folder** saves and commits with no step; **`get`** works for a walk, a nested folder, a whole path,
  names with spaces, brackets, `#`, `!` and accents, and a copy on another drive; it refuses a folder the commit lacks
  with a clear message.
- **A copy path with spaces and brackets** is slimmed through git's hook. **An old commit without the folder** is left
  whole and stays so after moving to a newer commit (space only).
- **The hook always exits 0:** bad JSON, empty input, a folder that does not exist, a folder that is no project. On the
  real 8.6 GB copy it took 20 s against the 300 s limit.
- **The document check's change:** in the real lean copy "homes OK". A home really removed — in the copy with
  `git rm --sparse`, or on `main` and merged in — loses its mark and is not counted (proved, `t4.mjs`); only a file git
  still holds in the commit can be counted while absent, so a home that is really gone is not hidden.
- **The reviewers' read-copies:** `codex-guide.md`'s recipe does export without pictures, as the note says.
- **The notes otherwise** say what the change does; none drops a safeguard; the §Lean working copies section is at
  home in `gates-and-deploy.md`. Untrue or incomplete lines are the ones named in findings 1, 3 and 5.

## Tidiness (D489 — filed, not fixed)

- **Need not be there:** `esc()`'s branch for a leading `#` or `!` can never fire — every caller puts `/` or `!/` in
  front of the path. The `flag`-less second element in `onGitHook`'s argument is fine; `basename`-only imports are all
  used.
- **Said twice:** the long shell command is written out twice in `.claude/settings.json` (SessionStart and
  SubagentStart); `full` is written inline in `main()` while every other command has a function.
- **Unclear name:** `where()` returns `main` (a folder) beside `common` — `mainFolder` would read better; the note's
  "open it in the main folder" does not say the main folder may be on another branch, where a newer walk's pictures
  are not on disk.
