# The small schedule-and-board fixes — the builder's brief for the two reads' findings (11 Nov 26, chat 64)

**Who:** one fresh builder helper, in the night's one checkout
`C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8`, branch
`claude/next-jobs-recommendation-c110df` (pull request 756 into `main`). Full paths or `git -C`; never `cd ..`.

**Read first:** the two reports, whole — `2026-11-11-sched-board-small-read-astra.md` and
`2026-11-11-sched-board-small-read-opus.md` (beside this brief); the readers' brief `…-read-brief.md` for what the
change is meant to do; `raptor-port/CLAUDE.md` (the project guide); `.claude/rules/raptor-executor.md`; the full row of
D672 (`grep -h '^| D672 |' .claude/decisions-full/*.md`, the shell). The code: `raptor-port/src/ui/boardland.ts`,
`src/state/undo-wire.ts` (`snapView`, `toBox`), `src/ui/pinchzoom.ts` (`scaleOf`, `scrollChain`),
`src/ui/histbubble.ts`, `src/ui/changesjump.ts` (`jumpOf` — what a tap on a change already does before it lands),
`e2e/board-undo-land.spec.ts`, `src/ui/boardland.test.ts`.

## The findings, each to be REPRODUCED by a failing test before anything is changed

A finding counts only once a test written for it has been SEEN red on the code as it stands (D790). One you cannot make
fail is not fixed: report it "not reproduced", with what you tried. Keep each red run's line for your report.

| id | finding | from |
|---|---|---|
| 1 | The board's desktop layout pinched on a phone: the landing measures on screen but scrolls in the zoomed box's own units, so at half size it moves half as far and at double size twice too far. Divide by the scroller's scale (`scaleOf`), as `pinchzoom.ts` does. Test at 0.5 and at 2; a box already in view still moves nothing. | Astra 1, Opus F1 |
| 2 | An Undo or Redo of a row REORDER (a drag by the grip, Auto sort, Sort all) names no box, so nothing lands. Give a reorder a destination in `boardland.ts` — never in `src/engine/` — by matching the surviving rows by their hidden ids and landing on the first whose place differs. Both directions. | Astra 2, Opus F2a |
| 3 | A changed Personal Input whose panel is folded: Undo restores it but the panel stays folded, so there is no drawn row to land on. Open the panel on the destination day first, with the same eligibility checks the changes window's tap uses (an unrelated leave, or a row already shown on the programme, must not open it), repaint, then land. | Astra 3 |
| 4 | A sign-off, a publish mark or a hidden warning undone on the board when out of view names no box (`sched.book`, `sched.mutes` steps). On a phone the sign-off line and the issues list head the board's one scroller. Land on the sign-off line or the day's issues bar when it is out of view. | Opus F2b |
| 5 | A SANS availability card changed from the board's SANS panel: the key is pushed but the card (`data-inpedit`) is found by neither finder. Find the card too. | Opus F2c |
| 6 | A REFUSED Undo or Redo can still scroll the board (the landing is scheduled before the restore is known to have gone through). Land only once the step has actually been applied. | Opus F3 |
| 7 | The first cell found ends the search even when it is not laid out (height 0), so a visible fall-back is never tried. | Opus F4 |
| 8 | `boardLandKeys` checks the day number but never the week. Skip a change whose week is not the one loaded. | Opus F5 |

**Two cases the Opus reader could not settle by reading — settle each with a browser test (`e2e/board-undo-land.spec.ts`),
and fix red-first only if it fails:** (S1) an accepted input shown on the Ground or Common Programme, its time retyped on
that row while in view, Personal Inputs out of view lower down, then Undo — the screen must not move (D672); (S2) on a
desktop with the changes window open over the board, a box above the screen brought down "just under the bar" must not
land beneath that window.

## The limits

- **Nothing new a person sees:** no new words, marks, buttons or looks. The fixes only change where the board scrolls,
  and (3) unfold a panel the app already unfolds on a tap of a change. If a fix seems to need something new on screen,
  stop that finding and report it.
- `src/engine/` is not touched. No change to tests' assertions to make them pass; no weakened test.
- D672 holds throughout: a box in view never moves the screen. Every fix has its "in view → nothing moves" test too.
- The two known limits stay as told to him: a step that only REMOVES a row lands nowhere; sideways is not handled.
- Do not edit `HANDOFF.md`, `OUTSTANDING.md`, the evidence sheet, any rulings file, any hook, setting or guide. Do not
  push, do not open or touch the pull request, do not merge anything. Commit on the branch (one commit per finding or a
  few sensible ones; end each message with `Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>`).
- Low: start no helper of your own.

## The checks you run before you stop

1. Each touched unit test file alone (`npx vitest run <file>`), then the unit files of `src/ui` and `src/state` that
   import what you changed.
2. `npm run build` from `raptor-port/` (the type check that counts — `tsc --noEmit` is hollow here) and
   `npm run lint:changed` (no new finding).
3. The browser file, under the checks lock, on a port you have checked is free (4463 was chat 63's; 4173, 4188, 4191,
   4197 were other chats'): from the repo root
   `node raptor-port/scripts/gatelock.mjs exec "claude/next-jobs-recommendation-c110df — board-undo-land" -- <the command>`
   (read `raptor-port/docs/gates-and-deploy.md` for how a browser test picks its port and browser). Send long output to
   a file in the scratch folder `C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/job1/`
   and read the file; test each command's own exit code, never through a pipe.
4. Leave a fresh `raptor-port/dist` of your last commit (the re-walk drives it next).

## What to hand back (your final message, under 500 words)

Per finding 1–8 and case S1, S2: reproduced or not (the red test's name and file), what was changed (file and function),
and the "in view → nothing moves" test beside it. Then: every check's result with its counts; the commits; anything you
left, could not do, or think needs his answer (a question for him is written with the case first — a named row, what was
pressed, what the screen does — and your recommended answer); any fix that REWROTE logic rather than adding a guard
(those get a narrow fresh read next).
