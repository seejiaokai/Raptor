# The Tracker tidy — the code reader's brief (5 Nov 26, `claude/tracker-standalone-tidy`, pull request 637)

You are a FRESH, BLIND Opus reader. You did not write this change and you have not seen the chat that did. Read-only:
change no file except the one you write (below); do not commit, push, build, or start a server.

Checkout: `C:\Users\User\projects\Raptor\.claude\worktrees\week-drag-edge-pan-review-d26775`.

## What to read
- The change: `git diff c7ddf441b..HEAD -- raptor-port/src raptor-port/scripts raptor-port/e2e` (the walk's own scripts
  under `scripts/handpass/trk1105-*` are not part of the app; skim them only if useful).
- The evidence sheet so far, with the rulings swept (§2), the roll-call (§3), the sizing (§4) and the walk (§6):
  `raptor-port/docs/handpass/2026-11-05-tracker-tidy.md`.
- The Tracker's rulings and architecture: `.claude/rules/decisions/tracker.md` (and D347–D349 in
  `.claude/rules/decisions/design.md`). Full rows on request: `grep -h '^| D1538 |' .claude/decisions-full/*.md`.
- Around the change as you need: `raptor-port/src/boot.ts`, `src/main.tsx`, `src/storage/` (whiteboard, adapters,
  browser, boot), `src/tracker/app/core.js` (large — grep it), `src/tracker/TrackerPage.tsx`, `src/ui/Shell.tsx`,
  `src/ui/topstate.ts`, `src/ui/logout.ts`, `src/tracker/undo-bridge.js`.

## What the change claims
1. The Tracker's storage doorway (`src/tracker/storage.js`) no longer writes the browser's storage under `ocu:` when no
   target is plugged in; with none it keeps an in-memory map; `setStorageImpl(null)` starts a fresh one. Claimed safe
   because the running app ALWAYS plugs the whiteboard first (`bootBody`), on every backend, before `main.tsx` draws.
2. The save-health setter renamed `useSaveHealth` → `setSaveHealth` (it is not a React hook); `main.tsx` hands it the
   postman after the boot.
3. The Tracker bar's own Undo / Redo pair (`OwnUndoRedo`) and the `hosted` flag (`setTrackerHosted` / `trackerHosted`)
   removed; the top bar's pair (`Shell.tsx` UndoPair with ids `trUndoBtn`/`trRedoBtn`, `trackerUndoEngine`) is the one.
4. Comments and test titles re-grounded; + Add's no-roster prompt kept (reachable: the roster offers aircrew only).
5. Test-only: JSON clones → `structuredClone` in seven places, three kept with a disable comment and reason.
Nothing a person sees is meant to change, and nothing saved may be lost or read differently.

## What to look for — ABSENCES first
- **What does the changed path no longer do?** For each removed line: what did it give, to whom, and who gives it now?
  (The old no-target path: a write survived a reload; a read saw old `ocu:` keys; `set` threw "no storage" when the
  browser had none. The removed pair: an undo control wherever `hosted` was false.)
- Any route in the RUNNING app — any entry point, lazy chunk, a page module evaluated early, a remount after sign-in, a
  page-download retry, a test-only bridge, `?fresh=1`, a failed or partial boot, an error path — that reaches the doorway
  with no target plugged, or after one is unplugged. Name the file and line, and the exact sequence.
- Any reader of the old `ocu:` keys or of `trackerHosted` / `useSaveHealth` / `setTrackerHosted` left anywhere (src,
  scripts, e2e, probes) — a dangling import is a build break, a dangling name in a walk script a broken tool.
- Whether `setSaveHealth` is wired exactly as `useSaveHealth` was (same object, same moment), and what would show if not.
- Whether the in-memory fallback differs from the whiteboard target in a way a test relied on (stored value types,
  key order of `keys()`, `null` vs missing, isolation between test files) — a test that now passes for a different reason
  is a finding.
- Whether any test was weakened (an assertion removed or loosened without the behaviour going away).
- The roll-call (§3 of the sheet): a row missing, a "Plugged before? YES" that is not true, a place that draws the pair
  that is not listed.

**A claim is a finding only with a concrete failure, its cause and its fix** (D489): say what a person or a stored
record would suffer, in what sequence, the cause in the code (file and line), and the fix you recommend, step by step.
Grade each HIGH / MEDIUM / LOW.

**What is NOT a finding (owner, D56):** a problem that lives ONLY in data already stored, where the code is already
correct going forward — the demo data is cleared before the database step. Do not report it. "Pre-existing" alone is not
this rule: an older fault that this change makes reachable IS a finding.

**The tidiness note (filed, never fixed — D489):** three questions of the CHANGED lines only, never the rules engine:
is anything now dead or duplicated; is a name or comment now untrue; is anything harder to follow than before. List
what you see; it is filed, not fixed.

## Output
Write your report to `raptor-port/docs/handpass/parts/trk1105/read-opus.md` — write the file EARLY and add to it as you
go. Shape: a one-paragraph verdict; findings (each: grade, title, the failure, the cause with file and line, the fix);
the roll-call gaps; the tidiness note; what you read and what you did not. Your final message: the verdict, the count of
findings by grade, and the file path.
