# Fresh, blind Opus read of the fix round — lean working copies ([HELPER-COPIES-NO-PICTURES], D2290, D2292), 22 Nov 26

Reader: a fresh Opus reader that wrote none of this and opened no `2026-11-22-lean-copy-fixread-*` file but the brief.
Read: the brief, the first round's brief and its three reports, `git diff b7fe7de1c 90c3a0ec8`, the whole of
`lean-copy.mjs` and `lean-copy.test.mjs` at `90c3a0ec8`, the two app hooks in `.claude/settings.json`, the drawing
check's specs. Changed no file in the repo but this one (the two Leave War pictures shown changed in the main folder were
changed before the read). Every claim was reproduced with real git 2.55 on Windows in throwaway repos under
`D:/opus-fixread/`, and on one real-size copy (a `--shared` clone of the project on D:, a linked copy of `90c3a0ec8`,
8.4 GB → 932 MB after `slim`, removed afterwards). The probe scripts are kept there (`probe1.mjs` … `probe6.mjs`, each
standalone, beside a copy of the branch's script). What is not proved is marked **unproven**.

## Findings, ranked by harm

### 1. Until `install` has run, every lean copy has no commit guard — and the note tells the helper it has one (high)

- **What someone does:** after "merge live" and before he types `lean-copy.mjs install` (the backlog item's step 3,
  his to do), a helper re-walks a fix in its new copy, writing the same picture names into the old walk's folder, and
  commits the usual way.
- **What goes wrong** (proven, `probe3.mjs`): the app's own hooks slim the helper's copy without regard to `install`,
  and hand it the note "git skips a re-written picture there without a word, and the commit guard stops the commit".
  There is no guard: `git add -A` exit 0, `git commit` exit 0, the commit holds only the evidence sheet, and the
  committed picture is still the one from before the fix (`BEFORE-FIX`); `git status` shows the new one unstaged. This
  is the first round's top finding, alive again for the whole window — and on any other PC, clone or D:-drive project
  where `install` was never run.
- **Cause:** the guard lives only in git's hooks, which `install` puts in place; `slim()` and `onAppHook()` never check
  that it is there, and `note()` states it unconditionally. The first round's other half of the fix (a turn-end check)
  was not built, so nothing covers the gap.
- **Fix, step by step:**
  1. Add `guardIn(common)`: true when `<common>/hooks/pre-commit` exists and contains `MARK`.
  2. In `slim()`, after the main-folder check: `if (!guardIn(w.common)) return 'left whole: the commit guard is not in
     place — run node raptor-port/scripts/lean-copy.mjs install once, from the main folder'` — for the hooks' path
     (`auto`) and the typed `slim` alike (`git-hook` cannot run without `install` anyway).
  3. Tests, failing first: a repo with no `install` → `onAppHook` SubagentStart and SessionStart return null and the
     copy keeps `loose.png`; after `install` → slimmed. Re-point the existing app-hook tests to call `L.install(root)`
     first.
  4. Notes: `gates-and-deploy.md` §Lean working copies and the backlog item say the app's hooks slim only once the
     guard is in place; the merging chat names `install` as due at once after the merge, before the disk gain starts.

### 2. `full` on a real copy is cut off after 60 seconds and leaves the copy unable to commit (medium)

- **What someone does:** a chat whose job needs every picture, or one told by the "may be half-done" message, runs
  `node raptor-port/scripts/lean-copy.mjs full` — the documented way back.
- **What goes wrong** (proven on the real-size copy): `lean-copy: spawnSync git ETIMEDOUT` after 1 min 0.7 s, exit 1;
  git was killed while writing the 8 GB back, `index.lock` is left behind (no git running), so `git add` fails
  ("Unable to create … index.lock: File exists"), `full` again fails the same way, and `status` blames "a slim stopped
  part-way … see lean-copy.log" — the log of the slim, not of this. The copy is already marked whole, so no hook will
  touch it again. Recovery, once found: delete the lock and run `full` again (8 s).
- **Cause:** the fix for Astra's finding 4 put a 60-second cap on every git call (`git()`, `timeout: 60_000`), and the
  by-hand long steps use it: `full`'s `sparse-checkout disable` and `get`'s `sparse-checkout add`. `get` of the largest
  walk (2,166 files, 240 MB) took 10.3 s on the real copy; several folders in one `get` (the guard's command can list
  several) nearing 60 s is **unproven**.
- **Fix:** give `git()` an options argument and call the two long steps with `timeout: 0` (a person or chat typed them
  and is waiting; the hooks never call them); keep 60 s for the short reads. A test: set a test-only override of the
  short cap (for example `LEAN_COPY_SHORT_MS=1`) and assert `full` and `get` still complete on the test repo.

### 3. In a reviewer's exported read-copy, `status` says "The main folder: it keeps every picture" (low–medium)

- **What someone does:** Codex, following AGENTS.md's new bullet ("`… status` says"), runs `status` in the read-copy
  the Codex guide has it make for a commit that is not the branch head — a repo of its own, made without pictures.
- **What goes wrong** (proven, `probe1.mjs` P3): `status` answers "The main folder: it keeps every picture.", and
  `slim` answers "this is the main folder". Told the pictures are all there, a reviewer that then misses a picture an
  evidence sheet names can report it as missing from the commit — a false finding. (`get` there is right: it says the
  pictures were never in it.)
- **Cause:** `status()` and `slim()` take "not a linked copy" to mean "the main folder".
- **Fix:** in `status()` (and `slim()`'s message), when the copy is not linked and the commit's pictures folder holds no
  picture (`ls-tree -r --name-only HEAD -- PICS`, none `isMedia`), say "This copy was made without the walk pictures
  (an exported read-copy): open them in the main folder"; add `status` to the existing exported-copy test.

### 4. A loose picture straight under the pictures folder, re-written, passes the guard (low — latent)

- Proven (`probe6.mjs`): re-written `docs/pics/loose.png` in a lean copy — `git add -A` exit 0, stages only the other
  file; `stranded()` returns `[]`; the guard exits 0. The project holds no loose picture today (counted: 0), so nothing
  is lost now; one added later would be.
- **Cause:** `patterns()` leaves a loose picture out by its own line (`!/<path>`), but `stranded()` reads only the
  `!/<folder>/**/*.<ext>` lines.
- **Fix:** in `stranded()`, also collect `!/<path>` lines without `/**/` as left-out files (unescaped) and count a
  changed file equal to one of them; the test is `probe6.mjs` as a unit test.

### 5. A second hook during a slim still running says "already lean", without the wait warning (low)

- Proven (`probe1.mjs` P4): a slim past its budget ("still slimming"), then SessionStart in the same new copy: the note
  handed over has no "still being slimmed" line while `index.lock` is held; the chat's first `git add` then fails on the
  lock (loud). **Fix:** in `slim()`'s `auto` path, test `busy()` before `isLean()` and return the "still slimming" line
  when both hold; one test.

### 6. `get` refuses a folder written from `raptor-port/`, absolute or with `./` (low — loud)

- Proven (`probe4.mjs`): `get docs/img/handpass/<walk>`-style, absolute and `./…` paths all fail with "no folder
  …/…/…". The house rule runs commands from `raptor-port/`, where the note's own `node raptor-port/scripts/…` also
  fails (no such file) — both loud, so only time is lost. **Fix:** in `get()`, strip everything up to and including the
  last `img/handpass/` when present, and resolve an absolute path against the copy's top; the note says "from the
  project's top folder".

### 7. The 200-second wait is per attempt, not per hook (low — unproven)

- The lock retry in `setSparse()` gets a second full budget: a first attempt that fails late with "lock" in its log
  would wait about 400 s, past the hooks' 300. If the app then ends the hook's process tree while node still waits, git
  dies mid-way (the first round's broken copy). No such late failure was seen. **Fix:** one deadline from the hook's
  start; the retry gets only what remains.

## What I checked and found sound

- **The guard, once installed** (question 1's first point): stops `git add -A` + `commit`, a plain `git add notes.md` +
  `commit -m` (P2), and `commit -am`; its remedy `git add -- <pictures folder>` works after `get` with the other walks
  still out (P1, exit 0, the picture staged); `full` keeps a re-written picture (P8). On the real-size copy the guard
  takes 0.75 s, passes a clean commit and names the Leave War test's re-drawn picture with the right command.
- **Exit codes:** 1 in a lean copy with a stranded picture, 0 in the main folder and in a whole copy (test suite; real
  copy). The main folder's commits and branch switches run both hooks and stay whole.
- **The detached step on Windows** (question 1's third point): run as the app runs a hook (`bash -c`, piped stdio,
  waiting for every pipe to close), the hook came back at its budget — exit and every pipe closed at 1.96 s for a
  1.5 s budget — `git.exe` lived on, finished, and the copy ended lean with a clean `git status` (`probe2.mjs`). A typed
  `git worktree add` came back with the note on its error stream and every pipe closed, and the copy ended lean
  (`probe5.mjs`). Nothing hangs either caller. That the app ends no process tree at a hook's normal exit is
  **unproven** (it did not matter in the probes, where no app was involved).
- **Only new copies, never one set whole:** `isNew` (the `commondir` file's time), the `whole` mark, `RAPTOR_FULL_COPY`
  and the by-hand `slim` clearing the mark — code and tests. A heuristic still: a copy reused by a second chat within
  15 minutes of its making is slimmed — not reproduced as harm, noted only.
- **Only pictures leave:** results, notes, scripts, PDFs stay; the drawing check's record folders come back whole by
  name — the three specs that keep records in old walk folders read `…/2026-11-08-chat9-tracker/drawcheck-records/`,
  `…/2026-11-08-sched-marks/drawcheck-records/` and `…/2026-11-07-pictures-round/drawcheck/`, all three matched; the
  board's drawing check reads a JSON file, kept. The pattern lines that bring files back end `/**` and win over the
  picture lines (test). Real copy 8.4 GB → 932 MB, slim 20.7 s alone on D:.
- **`get`, `status`, `full`, `slim` by hand:** correct in the synthetic repos and on the real copy apart from
  findings 2, 3 and 6; `full` refuses in the main folder (the first round's finding 6, fixed).
- **`install` / `uninstall`:** two hooks, idempotent, a foreign hook refuses the whole install and is left by
  `uninstall` (tests). His project has no `core.hooksPath` and no hooks of its own, and `extensions.worktreeConfig` is
  already on, so `install` will succeed there. Hooks run the copy's own script; a branch whose script predates the
  `pre-commit` command (this branch's own `b7fe7de1c`) would refuse commits there with the usage line — this branch's
  history only, so noted, not ranked.
- **The 18 tests** pass on his PC (15 s).
- **The records** against `origin/main` (239e830e7): `DECISIONS-ARCHIVE.md` and `.claude/decisions-full/scheduler.md`
  identical; `.claude/decisions-full/how-we-work.md` differs only by D2292's new row and D2290's "— WIDENED … BY D2292"
  mark and last cell; `DECISIONS.md` only by D2292 at the head of How we work's list. Nothing lost, changed or out of
  order. `npm run docsize` passes at the branch head: always-loaded rulings 41,231 bytes against the 41,250 limit (the
  first round's Fable finding 2, fixed).
- **The How-we-work line** ("Helpers', reviewers' and chats' own working copies leave out the walk pictures, never the
  main folder; none is deleted; a task fetches what it needs, `lean-copy.mjs get`"): the same meaning as the two lines
  it replaced and as D2290's and D2292's rows at a short line's depth. Like the line before it, it leaves out D2290's
  second way in — opening a picture in the main folder — which the rows, the note and the walk guide keep; not new, not
  a change of meaning.
- **The notes and AGENTS.md's bullet** (question 3): true to the code except where findings 1 (the guard stated
  unconditionally in the note, `gates-and-deploy.md` and `walk-scripts.md` §2) and 3 (`status` in a read-copy) say;
  no clash with a guide or ruling found; no safeguard dropped; not bulky. The 15-minute rule, the 200-second wait, the
  full space first, `--no-checkout` and Codex's unproven route are stated as they are.

## Still missing from the 18 tests (question 2)

A copy slimmed with no `install` (finding 1); `full` and `get` under the short-call cap (2); `status` in an exported
read-copy (3); a re-written loose picture (4); a second hook during a running slim (5); `get` with a path written from
`raptor-port/` (6); the hook run the way the app runs it — `bash -c`, piped, waiting for the pipes — which `probe2.mjs`
does in 2 s and could join the suite.

## Tidiness note (D489 — filed, not fixed)

1. Need not be there: none found.
2. Said twice: the "the commit guard stops the commit" promise is in four places (header comment, `note()`, the gates
   note, the walk guide) — finding 1 needs each made conditional, or one statement and pointers.
3. Unclear names: `git()`'s "a minute at most" comment reads as a safety net but is a hard cut for `full` (finding 2);
   `BUDGET_MS` is per attempt, not per hook (finding 7).
