# Fresh, blind Opus read — lean working copies ([HELPER-COPIES-NO-PICTURES], D2290, D2292), 22 Nov 26

Reader: a fresh Opus reader that did not write the change and has not seen any other reader's report. Read-only: no
repo file changed except this report. Scope: `git diff origin/main...claude/helper-copies-no-pictures-134` at the
branch's head `b7fe7de1c` (the branch moved on from `93cc39a64` during the read with D2292's commit; both were read).
Every claim below was reproduced with real git in throwaway repos or real copies under the reader's temp folder, unless
it is labelled **unproven**. The probe scripts are in the reader's scratchpad (`lc/probe*.mjs`, `big*.sh`, `kill.sh`,
`ds.sh`) and are not part of the repo.

## Findings, ranked by harm

### 1. A re-walk that REPLACES pictures in an old walk's folder is silently left out of the commit (high)

- **What someone does:** a walker re-walks a fix (the bug-check order's "re-walk what the fixes touched") in a new
  helper's lean copy, made after the first walk was committed; the walk script writes the same file names into the
  same walk folder; the walker commits the usual way, `git add -A && git commit`.
- **What goes wrong:** `git add -A` exits 0 and stages nothing from that folder; the commit succeeds holding only the
  other files (the evidence sheet). The committed picture is still the FIRST walk's. Proven (`probe3.mjs`): `add -A
  exit 0 | commit exit 0 | committed files: notes.md`, `committed picture holds: orig`; `git status` afterwards shows
  ` M docs/pics/walk-a/s01.png`. `git commit -a` alone also commits nothing ("You are in a sparse checkout…", exit 1).
  So the evidence sheet describes the re-walk while the pictures in the commit show the state before the fix — and the
  re-walk's pictures exist only on the helper's disk, lost when that copy is removed. Only an explicit
  `git add <that path>` is refused loudly.
- **Cause:** git (2.55 here) clears the skip flag of a left-out file that reappears on disk, so it shows as modified, but
  `git add -A` / `commit -a` skip paths outside the sparse set without a word. The script's tests cover only a NEW file
  in an old folder (`s03.png`, which `add -A` does refuse); not a replaced one.
- **The notes say the opposite:** "an old walk's folder is refused by `git add`, loudly" — `gates-and-deploy.md`
  §Lean working copies, the script's header comment, and `note()` ("adding to an OLD walk's folder needs that folder
  fetched first"); `walk-scripts.md` §2 names only "a re-walk adding to an old walk's folder".
- **Fix:** (a) a check that cannot be missed: `lean-copy.mjs check`, listing every picture path that is modified or
  untracked inside a folder the copy leaves out (`git status --porcelain -z -- <PICS>` filtered to paths under a
  `!/…/` pattern of the copy's sparse file), run from a SubagentStop hook and the Stop hook in a lean copy, printing
  "N pictures in left-out walk folders are NOT committed: run `lean-copy.mjs get <folder>`, then `git add`" (exit 0,
  advisory, like the code check); (b) the notes say plainly that a picture *replaced* in an old walk's folder is NOT
  refused — `git add -A` leaves it out without a word — so a brief that re-walks into an existing folder runs `get`
  before the walk writes (all four places above); (c) a test: replace a picture in an old folder, `add -A`, commit,
  and assert the check names it. After `get`, the same `add -A` does stage it (proven), so `get` is the right remedy.

### 2. A slim cut off part-way leaves a broken copy that every tool reports as fine (medium–high)

- **Measured** on his C drive, real 8.4 GB copies of this repo: one slim alone 37 s; three helpers' copies slimmed at
  once, 112 s each (`big.log`, `big2.log`). The time grows with the number started together; a fan-out of about eight
  helpers at once would reach the hook's 300-second limit — **unproven** (only three were measured).
- **What goes wrong if the git step is killed mid-way** (proven by killing the `git sparse-checkout set` process during
  a real slim, `kill.sh`): `index.lock` is left in the copy; every `git add` / `git commit` then fails ("Unable to
  create …/index.lock: File exists"), so the helper cannot commit its walk; `git status` lists thousands of deleted
  pictures; yet `lean-copy.mjs status` says "This copy is lean", `slim` says "already lean", and the slim's own result
  said "left whole: Command failed…" — none of it true. Whether the app kills the hook's child processes when the
  300 s run out is **unproven** (the app's hooks page says only that a timed-out hook is cancelled); if it kills only
  the hook's shell, git finishes on its own and nothing breaks.
- **Cause:** the long git step runs inside the hook's time limit; `isLean` reads only the setting git writes first;
  the catch reports "left whole" whatever stage failed.
- **Fix:** run the `sparse-checkout set` as a detached child the hook does not own (spawn `detached: true`, unref), the
  hook waiting for it up to about 240 s and, if it is still running, handing over a note "this copy is still being
  slimmed — wait until `<git-dir>/index.lock` is gone before using git"; the catch says "may be half-done — run
  `lean-copy.mjs full`" once the set step has started; `status` reports an `index.lock` with no git running. A test
  that kills the set step and asserts `status` does not say "lean" and the copy is recoverable.

### 3. A chat started in an EXISTING copy slims it — pictures go from under a copy already in use (medium)

- **What someone does:** a new chat starts in a worktree folder that already exists — the repo's own guide says
  "worktree folders are reused by other chats" (`walk-scripts.md`, the paths bullet), and his PC shows it (the folder
  `.claude/worktrees/lw-balances-hover-275293` now holds the disk-space chat's branch). The SessionStart `startup`
  hook runs `slim`, whose only guard is "no uncommitted picture changes".
- **What goes wrong** (proven, `probe.mjs` "existing"): a parallel chat's copy whose branch has its own committed walk
  is slimmed; the walk's pictures vanish from its disk; the note handed over says to open them in the main folder,
  where they do not exist (the main folder is on another branch). If a chat is still working in that folder, its
  pictures disappear under it with no note at all (a walk script, the drawing check or the host's picture look then
  fail or read nothing). This also contradicts the backlog item's own line (5): "whether to slim the copies already on
  his PC — his call, none touched".
- **Cause:** `onAppHook` treats every `startup` in a linked copy as a new copy; the comment in `slim` ("a copy already
  in use … is never touched (a new copy has none)") claims more than the check does.
- **Fix:** slim on SessionStart only a copy made in the last few minutes — for example the modification time of the
  copy's `<git-dir>/gitdir` file (written when the copy is made, not after) within 10 minutes — and add the test: a
  copy with a commit of its own, a chat started in it, left whole. (The HEAD reflog's length does not work on its own:
  a fresh copy made with `-b` already has two entries — proven, `probe4.mjs`.) The fix's exact test is **unproven**
  against the desktop app's own copies.

### 4. Typed copies and Codex's are slimmed with no note — D2292's "each is told" is not met (medium)

- D2292 (his, 22 Nov 26): a chat's own copy — "a desktop worktree chat, a parallel chat's folder, Codex's" — leaves
  the pictures out, and "each is told how to open one in the main folder or fetch one walk's folder".
- **What goes wrong:** copies made by `git worktree add` — the session-handoff skill's parallel-chat folders (its
  opening line types `git worktree add C:/Users/User/projects/Raptor-<short> claude/<name>` for a continuing job),
  the walk guide's break-test copies, and Codex's copies if Codex makes them that way — are slimmed by git's hook,
  whose text sends every output to nothing (`>/dev/null 2>&1`, and `onGitHook` returns the result without printing
  it). The chat or Codex is told nothing; a continuing chat finds its own branch's earlier walk pictures gone with
  `git status` clean. `AGENTS.md` and `docs/codex-guide.md` do not mention lean copies, and Codex loads nothing by
  itself. (Proven by reading the hook text; that git shows a hook's error-stream text to whoever typed the command is
  git's documented behaviour, not re-tested here.)
- **Fix:** when `onGitHook` slims, print `note(main)` on the error stream and stop the hook text discarding it (keep
  `>/dev/null`, drop `2>&1`); one line in `AGENTS.md`'s read-first list (and `codex-guide.md`) that a copy may be lean
  and how to fetch.

### 5. "Open it in the main folder" is wrong whenever the main folder is on another commit (low–medium)

- The note, D2290's row and `walk-scripts.md` send a helper to the main folder for an old picture. The main folder
  shows only what its own checkout holds: a walk committed only on the copy's branch is not there (finding 3), and a
  picture re-walked on the branch shows the other version there — a reviewer comparing "before" and "after" would
  compare the wrong pictures. Fix: the note says "in the main folder when it is on the same commit as this copy;
  otherwise `get` the folder" (or the note prints the main folder's commit beside the copy's).

### 6. `full` run in the main folder writes sparse settings there (low)

- "Never touches the main folder" holds for `slim`, `get` and the hooks, but `full` runs `git sparse-checkout disable`
  wherever it is typed. In the main folder it exits 0 and leaves `core.sparseCheckout=false`,
  `core.sparseCheckoutCone=false` and `index.sparse=false` in the main folder's own config (proven, `probe.mjs`
  "full_in_main"). Harmless today, but it is a write to the main folder the notes say never happens. Fix: `full`
  refuses, like `slim`, when the copy is not linked; a test.

### 7. More than pictures leaves the copy, and the drawing check's message misleads there (low)

- The folder holds 1,558 JSON results, 164 Markdown notes, 57 scripts, 43 PDFs and 24 HTML pages beside 64,000
  pictures; D1575's home is a mock page there. Three drawing-check specs (`chat9-tracker`, `oil-earn-board`,
  `sched-marks`) read their drawing records from old walk folders: in a lean copy the drawing check goes red with
  "NO DRAWING RECORD — record the drawing first (record.mjs)" (read from `scripts/drawcheck/check.mjs`) — loud, but it
  tells a helper to re-record the drawing rather than fetch it. Fix: the walk-scripts bullet names the drawing check
  and these specs; the check's "no record" line adds "in a lean copy, `lean-copy.mjs get <folder>` first".
- Not new, for the record: the Leave War browser test writes two tracked pictures into the old folder
  `2026-10-27-lw-m4/d1444/` on every run (they show as changed in the main folder today); in a lean copy the same.

### 8. The full space is needed first on every path, not only typed copies (low, notes)

- `gates-and-deploy.md` says "the copy is still written whole first … so it briefly needs the full space" only under
  the typed-copy bullet. It is true of the app's helpers too (SubagentStart runs after the app has written the whole
  copy): three helpers at once need about 25 GB free for a minute or two — the situation of 22 Nov (3 GB free) would
  still fail. Fix: say it once, for all three paths.

### 9. Outside the brief's list, but it lands on `main` with this pull request (low, records)

- The second merge of `main` into the branch (`6db969123`) collapsed `DECISIONS-ARCHIVE.md`'s "Moved 19 Nov 26",
  "Moved 20 Nov 26" and "Moved 21 Nov 26" headings into one "Moved 22 Nov 26", and reordered full rows against
  "newest first" (D2212 in the scheduler's full rows; D2224, D2229, D2290 in How we work's) and the map's lists in
  `DECISIONS.md`. No row is lost or changed (counted and compared against `origin/main`). Fix: take those files' order
  and headings from `origin/main` and re-apply only the branch's own rows (D2292), or re-run the settle step.

## What I checked and found sound

- **The main folder is never slimmed** by `slim`, the app's hooks or git's hook (code, the builder's tests, and the
  main-folder probes); the SubagentStart guard acts only on a folder named `agent-<the helper's id>`, so a helper
  without its own copy never touches its chat's copy (code and tests; that the app passes the helper's own folder as
  `cwd` is the builder's test, **not re-proven** here).
- **A new walk's pictures** in a new folder save and commit with no step; a new file in an old folder is refused by
  `git add -A`; `get` fetches a top folder, a nested one (`walk-a/B`) or a whole path, alone, in about 10 s on the real
  repo, and keeps a re-walked picture already on disk (proven).
- **No uncommitted work is lost by `slim`** in a new copy: it touches only the pictures folder and refuses a copy with
  picture changes; files elsewhere are untouched; a merge or branch switch in a lean copy behaves (0.6 s; a merged-in
  new walk folder arrives on disk; a changed old picture stays out, clean).
- **Odd names and Windows paths:** all 346 top-level names are plain; `ls-tree -z` and `esc()` handle the rest;
  `resolve()` on git's absolute paths, a copy on another drive and the note's slashes are fine. A commit with no
  pictures folder: "left whole" (proven).
- **Two at once:** his repo already has `extensions.worktreeConfig` on, so each slim writes only its own copy's
  settings — no shared-config race; timing is the only cost (finding 2).
- **The hook always exits 0** on every path read (stdin parse errors, git failures, a missing script); its output is
  the documented `hookSpecificOutput.additionalContext` shape.
- **Measured:** a real copy 8.4 GB → 809 MB after the slim (the notes' 815 MB holds).
- **The document check's change (question 3) is sound:** a skip-flagged file is one still in the index, so a home that
  is really gone — deleted and staged, or `git rm --sparse` — is not listed and still fails. Proven on a real lean copy
  against `origin/main`: the old check fails ("D340 … no such file", "D1575 … no such file"), the new one passes.
  (Run against the clone's default base, an unrelated `Docs-guard-allow: homes` trailer on `main` skipped the check —
  use `DOCSGUARD_BASE` when re-testing.)
- **Reviewers' exported read-copies** (`codex-guide.md` §Reading a commit…) already leave out PNG, JPG, GIF, MP4 and
  WebM — the note is true (WebP and PDF stay; trivial).
- The builder's 13 tests pass on his PC (8.5 s).

## Tidiness note (D489 — filed, not fixed)

1. Need not be there: none found in the code; the settings description repeats the gates note at length (as its
   neighbours do).
2. Said twice: the "refused loudly" claim is in four places (script header, `note()`, gates note, walk-scripts) — and
   wrong in all four (finding 1); one statement and pointers would have needed one fix.
3. Unclear names: `where().main` is "the folder holding the shared `.git`", assuming `<main>/.git`; `S` in the hook
   text; `slim`'s comment promises more than its guard (finding 3).
