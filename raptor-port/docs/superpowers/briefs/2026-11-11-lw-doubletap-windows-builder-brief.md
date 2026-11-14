# Job 4 — the Leave War's double tap on its other windows: the builder's brief (chat 64, the night of 11 Nov 26)

You are the builder of one small job in a flying-schedule app (React + TypeScript, `raptor-port/`). You build it
tests-first, check it, commit it on its branch, and STOP — the coordinator opens the pull request, runs the walk and the
code reads, and sends their findings back to you.

**The checkout:** `C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8`, already on
branch `claude/lw-doubletap-windows` (cut from `main`). Never switch branch, never push, never stash, never touch
`main`. Full paths or `git -C`; never `cd ..`. Run npm commands from `…/raptor-port` by `cd` to its FULL path inside
each command.

## Read first

1. `raptor-port/CLAUDE.md` (the project guide) and `.claude/rules/raptor-executor.md` (the builder's policy).
2. `.claude/rules/decisions/leave-war.md` and `.claude/rules/seams/leave-war.md` (the Leave War's rulings and its
   architecture — it is a second app with its own store; open the full row of any ruling you lean on with the shell:
   `grep -h '^| D149 |' .claude/decisions-full/*.md`), and `.claude/rules/decisions/design.md`.
3. The backlog item `[LW-DOUBLETAP-OTHER-WINDOWS]` in `OUTSTANDING.md` (grep it): "The guard built for the one-day and
   drag windows (`claude/lw-faults-1106`) does not cover the person window, ⚙ Settings, the event window, the counter
   form, the Events list, the Manning sheet, the OIL tracker and the event peek: a fast second tap after one closes
   still reaches the grid behind. To do: extend the same place-checked guard, tests first, walked on a phone."
4. The guard as built: find it from the merged work of `claude/lw-faults-1106` (`git log origin/main --oneline --grep`
   for "double tap" / "doubletap" / the item's id; then its source in `raptor-port/src/leavewar/` and its unit and
   browser tests), and its evidence sheet under `raptor-port/docs/handpass/` (grep "lw-faults-1106" or "double tap") —
   read how the fault was reproduced (which browser, which gesture, the timing) and what "place-checked" means there.

## What "right" is (outcomes — the mechanism is yours, but it is the SAME guard, not a second one)

- On a phone, after any of these windows closes by a tap — the person window, ⚙ Settings, the event window, the
  counter form, the Events list, the Manning sheet, the OIL tracker (the full-screen one, its close), the event peek —
  a fast second tap landing where the window was does NOT reach the grid behind (no day sheet opens, no cell is
  selected, no drag starts, nothing is written).
- A deliberate tap on the grid after the guard's short time, or a tap elsewhere than the closed window's place if the
  built guard is place-checked that way, works as today. The guard never eats a tap on the top bar's Undo / Redo or on
  another window's own controls beyond what the built guard already does for the one-day and drag windows.
- Every way each window closes is covered where a second tap could follow: its ✕, its Done / Save / Cancel, a tap
  outside it, and — where it applies — its own action that closes it (Save on the counter form, Delete on an event).
  List each window × each way of closing in a small table in your hand-back: guarded / not needed, because… / could
  not be done, because…  No blank cells.
- Nothing a person sees changes. No new words, marks or timings he would notice.

## How

- Tests first, window by window: a unit test where the guard's logic can be driven, and a browser test in
  `raptor-port/e2e/` at the phone's size by touch (copy the set-up of the built guard's browser test) that SEES the
  second tap reach the grid before your change — keep each red line. If a window's fall-through cannot be made to fail
  in the test browser, say exactly what you tried and still extend the guard to it, marking it "not reproduced".
- Never weaken an existing assertion; if one must change, say which and why. Every write goes through the Leave War's
  own store and funnels. Comments say WHY, above the code. 2-space indent, no semicolons, single quotes.
- Keep the records true in the same change: `raptor-port/docs/file-map.md` if you add a file;
  `raptor-port/docs/ui-contracts.md` / `feature-impact.md` only if a line there now reads wrong (a correction, never a trim).
- Before you hand back, in this order, each output to a file under
  `C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/job4/` and
  its exit code read by itself (never through a pipe):
  1. your new and touched test files alone;
  2. `npx tsc -b` (the plain `tsc --noEmit` is hollow here);
  3. `npm run lint:changed`;
  4. under the checks lock, from `raptor-port`: `node scripts/gatelock.mjs exec "claude/lw-doubletap-windows — unit" -- npm test`,
     then `… exec "claude/lw-doubletap-windows — build" -- npm run build`, then your browser test file(s) and the built
     guard's own browser test (`… exec "claude/lw-doubletap-windows — e2e" -- npx playwright test <files>`). If the
     lock is held, wait and check every few minutes. A Leave War desktop timeout gets one re-run of the failed group.
  `raptor-port/dist` must be left built from your last commit (the walker drives it).
- Commit on the branch in small commits, each message ending with the line
  `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`. Do not edit `HANDOFF.md`, `OUTSTANDING.md`, any file
  under `.claude/`, any guide or rule file. Start no helper of your own. A multi-line script goes in a file (Write
  tool), never a heredoc or `node -e`; never `sed -i` on a tracked file (use the Edit tool).
- A choice that is the owner's (how something looks, a new behaviour nobody ruled, a longer wait a person would
  notice) is never yours: leave that piece unbuilt and put the question, with its case, in your hand-back.

## Hand back (final message, under 400 words)

The table (window × way of closing); for each window: reproduced or not (the red line), the tests (file and titles);
the cause and the fix in two sentences; the commits; the counts of each check (whole unit suite: files, pass, skipped,
failed; `tsc -b`; `lint:changed`; the browser files); any existing assertion you changed and why; anything left unbuilt
and its question.
