# [LW-PIN-LAST-FRAME] (D1870) — the code read's brief (Astra and a fresh, blind Opus reader, the same brief)

Written by the host (chat 16, Opus — the chat that built it, so it does not read it) on 8 Nov 26. Two readers, blind to
each other: Astra (Codex), the standing reviewer, and a fresh Opus reader. Neither has seen the walk's report or the
other's. **Read only; change no file; do not commit, push or start a server.** Report to the file named at the end.

## What to read

The repository `C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07`, branch `claude/lw-pin-last-frame`,
**at the commit handed to you in the message that starts you**. The change is everything between `main`'s merge-base
and that commit, in `raptor-port/`:

`git diff $(git merge-base origin/main <commit>) <commit> -- raptor-port/src raptor-port/e2e`

— chiefly `src/leavewar/ui/Matrix.tsx`, `src/leavewar/ui/matrix.css`, `src/ui/QualsPage.tsx`,
`src/ui/scheduler/05-quals.css`, their unit tests (`pinframe.test.tsx`, `quals-pinframe.test.tsx`) and the browser
tests (`e2e/leavewar.spec.ts`, `geometry.spec.ts`, `pinchzoom.spec.ts`, `year-leavewar.spec.ts`, `save-note.spec.ts`,
the helper `pinShown` / `expectPinned` in `e2e/app.ts`). The contract as built: `raptor-port/docs/ui-contracts.md`,
search "D1870". The rulings of the area: `.claude/rules/decisions/leave-war.md` (D1870, D1850, D1789, D1287, D1282,
D1567) and the full rows, `grep -h '^| D1870 |' .claude/decisions-full/*.md` (and D1789, D1850). Performance rules:
`raptor-port/docs/performance.md` Part 1 and §E (the Leave War grid).

## The promise (D1870's full row, quoted; the rest marked as the host's reading)

His ruling, 8 Nov 26: *"On his iPhone the Leave War's pinned dates row and Quals' heading blink for one frame on a quick
flick on the live app and not on the trial, so the pinned row the browser shows by itself on the page's own scroll is
built for keeps, with the full check, the trial's loose ends fixed."* The loose ends, from the row: *"a screen reader
never reads the hidden pinned row, a pinch still hides it, it moves when something above the grid changes height; the
phone's frames at the 33 ms mark measured again."* D1789 (still standing where D1870 does not replace it): the pinned
row takes the row's place in the same frame the row reaches the top bar, on a desktop and a phone, both pages, and the
job *"stops if scrolling gets slower"*.

**The host's reading of how it is built** (to be checked, not trusted): the copy of each heading is always in the page;
where the browser runs `animation-timeline: scroll(root block)` and `animation-range` (`pinSda`), a 1px opacity step at
`--lwy-s` (the scroll at which the real row meets the top bar's foot, written by `placeY` on the Leave War and by
Quals' own place routine) shows it; the scroll listener sets `.up` (taps, shadow) and `inert` a frame late; while two
fingers pinch the copy leaves the step and is shown by the pinch's own rule; a ResizeObserver on `document.body` and
`.topbar` re-places it when a height changes without a scroll; where the browser cannot, the old way runs (the copy
mounted and taken out by the page's code).

## The finder wording (use it)

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.

Places to enumerate at least: everything that changes the real row's place without a scroll (a fold, Manning, the
month strip, Rearrange, zoom by pinch / Ctrl+scroll / − +, the failed-save band, a window or menu, the keyboard on a
phone, a page shown again after another tab, the period changed, the war changed, a resize or rotation); everything
that can stand over or beside the copy; the keys and the screen reader while hidden and while shown; taps on the copy;
the horizontal scroll that the copy must follow; reduce motion; a page too short to scroll; WebKit; the browser without
the timeline and the partial case (one feature without the other); the effect's set-up and tear-down (listeners,
observers, timers, the class and attributes left on the copy when the page or the tab changes).

## A question for you, beside the findings

The frame measure (the host's, 4× slow CPU, an emulated phone 402 wide, a scripted finger): on the Leave War the page's
own animation frames skip one screen refresh in about 27% of frames after the change against 5% before (Quals 11%
against 4%), while long pauses got fewer (the worst 283 → 67 ms) and the page's own work dropped by about a third.
**From the code, why might the page's frames halve while its work drops, and can the always-present copy cost less
without bringing back the blink?** Name what you would measure to tell. This is a question, not a finding, unless you
can name the line that does it.

## What is NOT a finding (D56)

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. Also not a finding: a scheduler who is
not an admin (D785); the original app under `reference/`.

## What to hand back

- Each finding: where, the concrete failure (setup, action, what is seen, what should be), its cause, and **exact,
  step-by-step fix instructions** — not a direction; whether `main` does it too (compare the merge-base).
- **Explicit negatives:** "I checked X and found nothing", for each place in the list above.
- Your sandbox: if you cannot run the app or the tests, say so and name the exact input you would run; the host runs it.
- A tidiness note (D489): three questions of the changed lines — is anything duplicated that one helper would hold, is
  anything left that nothing uses, is any comment now untrue — filed, not fixed.

Write the whole report once, to the file named in the message that starts you.
