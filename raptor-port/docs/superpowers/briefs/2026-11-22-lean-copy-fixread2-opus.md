# Fresh, blind Opus read of the second fix round — lean working copies ([HELPER-COPIES-NO-PICTURES], D2290, D2292), 22 Nov 26

Reader: a fresh Opus reader that wrote none of this. Read: `git diff 3412702dc 8b9d3700f` for `lean-copy.mjs` and
`lean-copy.test.mjs`, the whole script at `8b9d3700f`, the fix-round brief and its two reports (Astra's, Opus's),
`gates-and-deploy.md` §Lean working copies, `codex-guide.md` §Reading a commit that is not the branch head, the two app
hooks in `.claude/settings.json`, and the real pictures folder's file types. No repo file changed but this one.
Reproductions: real git 2.55 on Windows, node 24, throwaway repos under `D:/opus-fixread2/` (`probe1.mjs`,
`probe3.mjs`, each standalone beside a copy of the branch's script). Unproven claims are marked.

## Findings, ranked by harm

### 1. A lean copy switched to a branch that has no `lean-copy.mjs` loses the commit guard without a word (medium–high)

- **What someone does:** a fresh chat starts in a copy of its own (slimmed at SessionStart, from a commit that has the
  script), and its opening line switches it to the unmerged `claude/<name>` branch it continues (D975) — a branch cut
  before this job merged, so its commit holds no `raptor-port/scripts/lean-copy.mjs`. It re-walks a fix, writing into
  an old walk's folder, and commits the usual way. The same happens to any lean copy that checks out an older commit.
- **What goes wrong** (proven, `probe1.mjs` P2): control on the commit with the script — the guard stops the commit
  (exit 1). After `git switch old-branch`: the copy is still lean (the patterns stay), the script is gone from the
  checkout, `git add -A` exit 0, `git commit` exit 0, the commit holds the OLD picture, and `git status` shows the new
  one left behind (` M …/s01.png`). The first round's top finding, alive for every branch cut before the merge.
- **Cause:** the `pre-commit` text runs `$(git rev-parse --show-toplevel)/raptor-port/scripts/lean-copy.mjs` and ends
  `[ -f "$S" ] && command -v node … || exit 0` — the guard lives in the checkout, so it fails open whenever the
  checked-out commit lacks the script (or node is missing), though the sparse patterns, which live outside the
  checkout, still apply. `guarded()` only checks the hook file, so it reports a guard that will not run.
- **Fix, step by step:**
  1. `install` also writes the script itself into the hooks folder (`<common>/hooks/lean-copy.mjs`, outside every
     checkout; `uninstall` removes it, re-running `install` refreshes it).
  2. Both hook texts use the checkout's script when present and the hooks folder's copy otherwise.
  3. In the `pre-commit` text, before any `exit 0`: if the copy is lean
     (`git config --worktree --get core.sparseCheckout` prints `true`) and no script or no `node` can be found, print
     one line ("lean-copy: commit stopped — the commit guard cannot run here; run node … full, or set
     LEAN_COPY_GUARD=off for one commit") and `exit 1`. A whole copy and the main folder still pass at once.
  4. A test, failing first: the P2 sequence (a commit without the script, branch it, add the script, install, slim a
     copy, switch it to the old branch, re-write a picture, commit → exit 1).

### 2. In the real project an exported read-copy still calls itself "the main folder", and `get` says every picture is here (medium–low)

- **What someone does:** Codex, as a reader of a commit that is not the branch head, makes the exported read-copy by
  `codex-guide.md`'s recipe and runs `status`, or `get` for the walk an evidence sheet cites.
- **What goes wrong** (proven, `probe1.mjs` P1, a walk folder holding one `.png` and one `.webp`, as the real
  `2026-11-03-week-cross-end-cards/` does — 1 png, 27 webp): `status` → "The main folder: it keeps every picture.";
  `slim` → "this is the main folder"; `get 2026-11-03-cards` → "This copy already holds every picture." while its png is
  not on disk. A reader told every picture is present can report a picture the sheet names as missing from the commit —
  a false finding, the case this round's fix was for. The test misses it: its export holds no picture of any type.
- **Cause:** the recipe excludes png, jpg, gif, mp4 and webm, but not webp or jpeg (both in `MEDIA`); `noPictures()`
  and `get()`'s check decide "exported" by "no picture of any kind", so the 27 webp files the export keeps defeat them.
- **Fix:** (a) in `noPictures()` and `get()`'s non-lean check, look for `.png` only — the type every walk has and the
  recipe always strips — or better, have the recipe mark the copy (`git -C <copy> config raptor.readCopy <commit>`) and
  test for that mark first; (b) add `':(exclude,glob)**/*.webp' ':(exclude,glob)**/*.jpeg'` to the recipe's step 1 so
  it matches `MEDIA`; (c) in the exported-copy test, keep a `.webp` in the export.

### 3. The note's and the guard's commands fail when run from `raptor-port/` (low — loud)

- Proven: from `raptor-port/`, where the house rule runs commands, `node raptor-port/scripts/lean-copy.mjs …` fails
  (module not found) and the guard's remedy `git add -- raptor-port/docs/img/handpass` only warns "could not open
  directory 'raptor-port/raptor-port/…'" and exits 0, adding nothing. Loud enough to cost only time; the first fix
  round's `get` path change does not reach these two.
- **Fix:** in `note()` and the guard's message write `git add -- ':/raptor-port/docs/img/handpass'` (works from any
  sub-folder — proven) and say the `node` command runs from the project's top folder.

### 4. A first slim that fails after git marks the copy lean leaves every commit stopped, and `status` calls it lean (low — unproven)

- By git's own order (`sparse-checkout set` writes `core.sparseCheckout=true` before laying the files down, and keeps
  the old patterns file — none, in a new copy — when that step fails), such a copy is whole but marked lean. The guard
  then stops every commit ("could not check" — the round's own test removes the same file), and `status` answers "This
  copy is lean. No picture folder fetched." with no pointer to `full`; a later hook in it within 15 minutes hands the
  plain "lean" note. The first hook's "may be half-done" note does say `full`. Not reproduced (no way found to make the
  step fail after the mark; the lock retry covers the likely cause).
- **Fix:** in `status()` and `slim()`'s `auto` path, a copy marked lean whose patterns file is missing is "stopped
  part-way — run … full"; the guard's "could not check" message names `full` as well as `status`.

## The fix-round findings — truly fixed?

| Finding (fix round) | Now |
|---|---|
| Opus 1 — slimmed before `install`, note promising a guard | Fixed: `guarded()` before any change, both hooks and `slim` by hand; test. Residue: finding 1 (a guard installed but not able to run). |
| Astra 1 — the guard waves a commit through when it cannot check | Fixed: `cfgStrict` and the patterns read throw, `onPreCommit` returns 1, `LEAN_COPY_GUARD=off` lets one through; test. A failing `where()` still passes (git itself cannot run then). |
| Astra 2 / Opus 4 — a loose picture re-written passes | Fixed: `!/<path>` lines read; the message's `get <name>` fetches a loose file (a blob line); test. |
| Astra 3 / Opus 5 — busy or failed slim reported as lean | Fixed for the lock: busy is tested before whole/lean, and "still slimming"/"may be half-done" reach the note by both routes; tests. Residue: finding 4 (unproven). |
| Astra 4 / Opus 7 — no one deadline | Fixed: one deadline set at the hook's start, every git read bounded by what is left (a minute at most), the child's wait and the retry by what is left, reset in `finally`; the typed commands have none (Opus 2 fixed: `timeout` undefined, the child waited to its end). The test proves the hook returns at once and a later `slim` is unbounded. Budget arithmetic: at most 230 s plus a few one-second minimum reads, inside the 300 s set in `settings.json`. |
| Astra 5 — the whole mark in shared settings | Fixed: per-copy settings switched on first, the mark written per copy, `false` returned when either fails; test checks `.git/config` and that a second copy still slims. |
| Astra 6 / Opus 3 — exported read-copies | Fixed in the test's export; defeated in the real project by the webp files (finding 2). |
| Opus 6 — `get`'s path forms | Fixed for `get`: a name, from the top, from `raptor-port/`, absolute, with `./`, back-slashes; test. The note's other commands: finding 3. |

## Checked and found sound

- The guard, installed, on the commit that has the script (`probe3.mjs`): stops `commit -am`, a pathspec commit
  (`commit -- n.md`), `add .` from `raptor-port/` then commit, and an untracked new picture after `add -A` (which also
  refuses aloud); the main folder's commit and a copy set whole by `full` pass (exit 0). The hook strips
  `GIT_INDEX_FILE`, so it reads the copy's own index during `commit -a`; the set it finds is the same.
- `install` refuses if either hook is foreign; `uninstall` leaves a foreign hook; per-copy settings switched on once.
- The app hooks: SessionStart only on `startup`; SubagentStart only on the copy named `agent-<id>`; 300 s set for both.
- The note and the docs (`gates-and-deploy.md`) now say the guard comes first and the hooks' deadline; true to the code
  apart from findings 1–3.

## What a helper, chat or Codex will meet that the 24 tests miss

A lean copy switched to a branch or commit without the script (finding 1); an export holding webp (finding 2); the note's
commands run from `raptor-port/` (finding 3); a slim that fails after the mark (finding 4). Also, unproven and not
ranked: the app's own momentary `git status` in a new copy holding `index.lock` as the hook looks would leave the copy
whole without a note (safe, only the disk gain lost).

## Tidiness note (D489 — filed, not fixed)

1. Need not be there: none. 2. Said twice: what counts as "exported" is decided in three places (`noPictures`, `get`'s
check, the recipe's exclude list) — one shared test would have kept them in step. 3. Unclear names: `guarded()` means
"the hook file is there", not "the guard will run".

Walk: not performed — a read-only review of tooling, with reproductions in throwaway repos.
Rulings: none this session.
