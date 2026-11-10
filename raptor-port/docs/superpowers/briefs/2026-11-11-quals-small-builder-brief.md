# Job 3 — two small Quals faults: the builder's brief (chat 64, the night of 11 Nov 26)

You are the builder of one small job in a flying-schedule app (React + TypeScript, `raptor-port/`). You build it
red-first, check it, commit it on its branch, and STOP — the coordinator opens the pull request, runs the walk and the
code reads, and sends their findings back to you.

**The checkout:** `C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8`, already on
branch `claude/quals-small-1111` (cut from `main`). Never switch branch, never push, never stash, never touch `main`.
Full paths or `git -C`; never `cd ..`. Run npm commands from `…/raptor-port` by `cd` to its FULL path inside each command.

## Read first

1. `raptor-port/CLAUDE.md` (the project guide — it loads when you open a file there) and
   `.claude/rules/raptor-executor.md` (the builder's policy).
2. `.claude/rules/decisions/people-accounts.md` (the rulings of Quals — open the full row of any ruling you lean on:
   `grep -h '^| D149 |' .claude/decisions-full/*.md`, with the shell) and `.claude/rules/decisions/design.md`
   (screen rules — above all "Undo and Redo, everywhere, leave the screen where it is when what they change is in view,
   moving to the change only when it is out of view" [D672], and the drag rules [D895]).
3. The two backlog items in `OUTSTANDING.md` (grep their ids; never read the file whole):
   - `[QUALS-OUTLINE-RESCROLL]` — Quals' outline after "Check his quals" or an Undo is never cleared, and runs after
     every repaint: a later change (ticking another man's box) with that row off screen may scroll the page back to it.
     Found by reading (`raptor-port/docs/handpass/parts/pq1106/read-opus.md` — read its passage on this), not walked.
   - `[QUALS-PINNED-HEAD-NO-DRAG]` — in Edit quals with the page scrolled down, a heading in the pinned row under the
     top bar cannot be pressed to start a column drag: the press listener is on the table alone. Scrolling up to the
     table's own heading row works. (`raptor-port/docs/handpass/2026-11-06-people-quals.md` names it.)
4. The Quals screen's source and its tests (find them through `raptor-port/docs/file-map.md` — grep "quals").

## What "right" is (outcomes — the mechanism is yours)

- **A. The outline:** after "Check his quals" (or an Undo that outlines a row), the page goes to that row ONCE. Any
  later repaint for another reason — ticking another man's box, a sort, a filter, a column drag — never scrolls the page
  back to the outlined row. The outline itself (the mark) keeps whatever life it has today unless that life is the
  cause; do not change how the mark looks or how long it shows unless the fix needs it, and if it does, say so in your
  hand-back (a change of look is the owner's call — then stop and report instead of building it).
  First REPRODUCE it: a failing test (a browser test in `raptor-port/e2e/` at a desktop's and a phone's size, since
  scrolling needs a real layout — copy the sign-in and Quals steps from the passing Quals browser tests). If you cannot
  make it fail in a real browser, do not "fix" it: report exactly what you tried.
- **B. The pinned heading:** in Edit quals with the page scrolled down, pressing a column's heading in the PINNED row
  starts the same column drag as pressing the table's own heading — same drag, same landing line, same result, same
  Undo — at a desktop's size by mouse and a phone's by touch if the table's own heading drags by touch today (match
  what the table's own heading does; add nothing new). A press on the pinned heading that is not a drag (a tap, a
  press on a control inside the heading) does what it does today. First REPRODUCE it with a failing browser test.
- Nothing a person sees changes except those two behaviours. No new words, marks or buttons on screen.

## How

- Red first, each fault: write the test, SEE it fail for the right reason, keep the red line for your hand-back; then
  the smallest fix; then green. Never weaken an existing assertion; if one must change, say which and why.
- Every write goes through the app's existing funnels; no new store, no new undo. Comments say WHY, above the code.
  `src/ui/` style: 2-space indent, no semicolons, single quotes.
- Keep the records true in the same change: `raptor-port/docs/file-map.md` if you add a file; `raptor-port/docs/ui-contracts.md`
  or the Quals behaviour register only if a line there now reads wrong (a correction, never a trim).
- Before you hand back, in this order, each output to a file under
  `C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/job3/` and
  its exit code read by itself (never through a pipe):
  1. your new and touched test files alone;
  2. `npx tsc -b` (the plain `tsc --noEmit` is hollow here);
  3. `npm run lint:changed`;
  4. the WHOLE unit suite and the build under the checks lock — from `raptor-port`:
     `node scripts/gatelock.mjs exec "claude/quals-small-1111 — unit" -- npm test` and then
     `node scripts/gatelock.mjs exec "claude/quals-small-1111 — build" -- npm run build`; then your browser test file(s)
     under the lock too (`… exec "claude/quals-small-1111 — e2e" -- npx playwright test <your file(s)>`), on a port you
     have checked is free if the config lets you choose one. If the lock is held, wait and check every few minutes.
  `raptor-port/dist` must be left built from your last commit (the walker drives it).
- Commit on the branch in small commits, each message ending with the line
  `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`. Do not edit `HANDOFF.md`, `OUTSTANDING.md`, any file
  under `.claude/`, any guide or rule file. Start no helper of your own. A multi-line script goes in a file (Write
  tool), never a heredoc or `node -e`; never `sed -i` on a tracked file (use the Edit tool).
- A choice that is the owner's (how something looks, a new behaviour nobody ruled) is never yours: leave that piece
  unbuilt and put the question, with its case, in your hand-back.

## Hand back (final message, under 350 words)

For A and for B: reproduced or not (the red line you saw), the cause in one sentence, the fix in one sentence, the
tests (file and titles). Then: the commits; the counts of each check (whole unit suite: files, pass, skipped, failed;
`tsc -b`; `lint:changed`; the browser files); any existing assertion you changed and why; anything left unbuilt and
its question; every place in the app that draws or uses what you touched (a short roll-call: the screens and windows
where Quals' outline or its headings appear), so the walk can be sized.
