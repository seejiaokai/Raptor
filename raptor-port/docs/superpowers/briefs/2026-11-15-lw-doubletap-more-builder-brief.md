# Job 3 — the Leave War's double tap on six more windows: the builder's brief (chat 81, the night of 15 Nov 26)

You are the builder of one small job in a flying-schedule app (React + TypeScript, `raptor-port/`). You build it
tests-first, check it, commit it on its branch, and STOP — the coordinator opens the pull request, runs the walk and the
code reads, and sends their findings back to you.

**The checkout:** `C:/Users/User/projects/Raptor`, already on branch `claude/lw-doubletap-more` (cut from `main` at
`9cc49fcca`). Never switch branch, never push, never stash, never touch `main`. Full paths or `git -C`; never `cd ..`.
Run npm commands from `C:/Users/User/projects/Raptor/raptor-port` by `cd` to that FULL path inside each command. Leave
the untracked pictures under `raptor-port/docs/img/handpass/2026-10-12-one-rule/` alone (not yours; never `git add -A`
or `git add .` — add your files by name).

## Read first

1. `raptor-port/CLAUDE.md` (the project guide) and `.claude/rules/raptor-executor.md` (the builder's policy).
2. `.claude/rules/decisions/leave-war.md` and `.claude/rules/seams/leave-war.md` (the Leave War's rulings and its
   architecture — a second app with its own store; open the full row of any ruling you lean on with the shell:
   `grep -h '^| D149 |' .claude/decisions-full/*.md`), and `.claude/rules/decisions/design.md`.
3. The backlog item `[LW-DOUBLETAP-MORE-WINDOWS]` in `OUTSTANDING.md` (grep its `### ` heading) — the six windows and
   the To do.
4. The guard as built: `raptor-port/src/leavewar/ui/Matrix.tsx` (grep `winsUp`, `winUpRef`, "double tap"), its unit and
   browser tests (grep `raptor-port/src` and `raptor-port/e2e` for the same), and the evidence sheet
   `raptor-port/docs/handpass/2026-11-11-lw-doubletap-windows.md` — how the fault was reproduced (browser, gesture,
   timing) and what "place-checked" and "a fresh press only" mean there.
5. The reads that found these six: `raptor-port/docs/superpowers/briefs/2026-11-11-lw-doubletap-windows-read-opus.md`
   F1 (its steps) and `…-read-astra.md` §1 (its table of every window). Where they differ, say which you followed.

## What "right" is (outcomes — the mechanism is yours, but it is the SAME guard, not a second one)

- One small shared door (a function or hook the windows call, wherever their open state lives) that arms the same guard
  the eight windows already use, and their presses counted as inside a window, so the guard's place check sees them.
- On a phone, after any of these closes by a tap, a fast second tap landing where it was does NOT reach the grid behind
  (no day sheet opens, no cell is selected, no drag starts, nothing is written):
  - the Required rows' selection panel (✕, Apply, Clear);
  - their rename form (✕, Save, Cancel);
  - their figure editor and the phone number pad (Done);
  - the day-details panel (✕, and ‹ › where a press moves or closes it);
  - the under-manned days list (a row tapped — it takes the grid to that day and closes the list — then a second tap);
  - the move banners' Confirm and Cancel;
  - New period (✕, Create) where a grid lies beneath;
  - Open for bidding on a desktop or tablet width (a phone's fills the screen — say whether it needs the guard there).
- A deliberate tap on the grid after the guard's short time works as today; the guard never eats a tap the built guard
  does not already eat (the top bar's Undo / Redo, another window's own controls).
- Every way each window closes is covered where a second tap could follow — its ✕, Done / Save / Cancel / Apply /
  Clear / Create / Confirm, a tap outside it, and its own action that closes it. List each window × each way of closing
  in a small table in your hand-back: guarded / not needed, because… / could not be done, because… No blank cells.
- Nothing a person sees changes. No new words, marks or timings he would notice.
- **Not this job, leave filed:** the item's "also found" (1) (a double tap on the event box's Edit opens the event
  window and the second tap closes it — the mirror of the guard), (2) and (3). If your door makes (3)'s tidiness note
  (the bits are bare numbers; `winsUp` / `winUpRef` are named for one flag) naturally right, say so; do not go out of
  your way.

## How

- Tests first, window by window: a unit test where the guard's logic can be driven, and a browser test in
  `raptor-port/e2e/` at the phone's size by touch (copy the set-up of the built guard's browser test) that SEES the
  second tap reach the grid before your change — keep each red line (the failing output, saved). If a window's
  fall-through cannot be made to fail in the test browser, say exactly what you tried and still give it the door,
  marked "not reproduced".
- Never weaken an existing assertion; if one must change, say which and why. Every write goes through the Leave War's
  own store and funnels. Comments say WHY, above the code. 2-space indent, no semicolons, single quotes.
- Keep the records true in the same change: `raptor-port/docs/file-map.md` if you add a file;
  `raptor-port/docs/ui-contracts.md` / `feature-impact.md` only if a line there now reads wrong (a correction, never a
  trim).
- Before you hand back, in this order, each output to a file under
  `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/job3/` and
  its exit code read by itself (never through a pipe):
  1. your new and touched test files alone;
  2. `npm run build` (typecheck + build; the plain `tsc --noEmit` is hollow here);
  3. `npm run lint:changed`;
  4. under the checks lock, from `raptor-port`: `node scripts/gatelock.mjs exec "claude/lw-doubletap-more — unit" -- npm test`,
     then `… exec "claude/lw-doubletap-more — build" -- npm run build`, then your browser test file(s) and the built
     guard's own browser test (`… exec "claude/lw-doubletap-more — e2e" -- npx playwright test <files>`). If the lock
     is held, wait and check every few minutes. A Leave War desktop timeout gets one re-run of the failed group.
  `raptor-port/dist` must be left built from your last commit (the walker drives it).
- Commit on the branch in small commits, each message ending with the line
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not edit `HANDOFF.md`, `OUTSTANDING.md`, any file
  under `.claude/`, any guide or rule file. Start no helper of your own. A multi-line script goes in a file (Write
  tool), never a heredoc or `node -e`; never `sed -i` on a tracked file (use the Edit tool).
- A choice that is the owner's (how something looks, a new behaviour nobody ruled, a longer wait a person would notice)
  is never yours: leave that piece unbuilt and put the question, with its case, in your hand-back.

## Hand back (final message, under 450 words)

The table (window × way of closing); for each window: reproduced or not (the red line's file), the tests (file and
titles); the cause and the fix in two sentences; the commits; the counts of each check (whole unit suite: files, pass,
skipped, failed; build; `lint:changed`; the browser files); any existing assertion you changed and why; anything left
unbuilt and its question.
