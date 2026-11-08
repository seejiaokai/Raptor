You are a fresh, blind code reader for one change in the Raptor app (repo worktree
`C:\Users\User\projects\Raptor\.claude\worktrees\pr-leave-war-4988a8`, branch `claude/pr-leave-war-4988a8`). You did not
write it and have seen no walk report or other reader's view. Read only; change, build, commit nothing in that folder.
You may RUN single unit test files there (`cd raptor-port && npx vitest run <file>`) — no browser tests, no builds.
Windows + Git Bash: write any script you need to a file in your own scratch folder and run it there.

## The change
Read it as `git -C <worktree> diff origin/main...COMMIT -- raptor-port/src raptor-port/e2e`, where COMMIT is given below.
It builds two of the owner's rulings of 8 Nov 26. Their full text — read both rows whole:
`grep -h '^| D1788 |\|^| D1789 |\|^| D1295 |' <worktree>/.claude/decisions-full/*.md`. The area's rulings:
`<worktree>/.claude/rules/decisions/leave-war.md`; its architecture: `<worktree>/.claude/rules/seams/leave-war.md`; the
speed rules every grid change keeps: `<worktree>/raptor-port/docs/performance.md` Part 1 (and its ledger entry 28).
In short:
- **D1788:** the Leave War day panel's "↓ N more" cue takes the bell's own foot: under the list and outside it, a
  hairline above and small grey words at the left, not pressable, counting the lines not wholly in view, and gone at
  the list's end. The bell's own cue follows the same rule. As built (the host's description, to be checked): a shared
  counter `src/ui/morebelow.ts` (`countNotWhollyInView`, `useMoreBelow` — recount on the scroller's scroll, after every
  render, on the scroller's resize); the bell (`src/ui/topbits.tsx`) switched to it; the floating window
  (`src/ui/FloatWindow.tsx`) gains an optional `foot` drawn after its scrolling body; the day panel
  (`src/leavewar/ui/DayPanel.tsx`) passes the foot when N > 0, counting `.lwday-away .ll-row` against the window's body;
  its look in `src/leavewar/ui/bidpicker.css` (`#page-leavewar .lwday-more`, the words the bell's `.bl-more`).
- **D1789:** the Leave War grid's pinned dates row takes the row's place in the same frame the row reaches the top bar,
  on a desktop and on a phone, and Quals' header the same, so the dates never blink cut or missing; scrolling must not
  get slower. As built (the host's description): `pin()` in `src/leavewar/ui/Matrix.tsx` and `src/ui/QualsPage.tsx`
  commits the stuck-or-not flip with React's `flushSync`, only when it flips and only from the window's scroll listener
  (never from an effect). Tests: `src/leavewar/ui/daypanel-more.test.tsx`; the "same frame" tests in
  `e2e/leavewar.spec.ts` and `e2e/geometry.spec.ts`.

## Do not merely review the changed code
Starting from the user promise and the applicable rulings, enumerate every qualifying object, renderer, visible door,
writer, reader, downstream consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
correct and the defect may be a MISSING call site.** For each item, state where the visible sign and the working gesture
should exist in the production app. Then rank concrete failure scenarios with setup, action, expected result, and the
observation that would disprove correctness. Start with the least-shared or most specialised surface.

Specific absences worth hunting: a moment when the count is stale — the list's contents change while the window stays
open (stepping days with ‹ ›, a record added, decided or removed elsewhere, an Undo, the roster or the period changing),
fonts or pictures settling after the first count, the window resized, moved or brought to a phone's other resting
height, the foot itself changing the body's height so the count it shows is off by one, an observer or listener left
behind after the window closes or the day changes; the foot shown where it must not be (another floating window
growing a foot, a day whose list fits, the list at its end) or covering a line; the foot being pressable or focusable
in any way; the bell's foot and "Mark all read" changing on screen; the stylesheet rule reaching outside the day
window or losing to another rule; for D1789, a path that flips the pinned row without the synchronous commit (a scroll
that is not the window's — the grid's own sideways scroll, a pinch or zoom, Rearrange, a jump to a date, the window
resized, the page shown again after another tab), a `flushSync` reached from inside a React render or effect (React
warns and does nothing), a commit on every scroll event rather than only on a flip (the grid re-renders: that is the
"scrolling gets slower" the owner forbade), the Leave War's second store and its memo firewall disturbed
(`performance.md` Part 1), and Quals' pinned heading drifting from its columns after the change.

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it. Nothing in this change saves data,
touches OIL, roles or the published record — say so if you find otherwise.

A claim is a finding only with a concrete failure, its cause and its fix. Give **exact, step-by-step fix instructions
per finding** (file, what to change), its severity, and whether it is new in this change or already on main. Where you
cannot run something (a browser, a phone), name the exact input you would run, so the host can run it. Also give
**explicit negatives**: list what you checked and found nothing in. Report back in plain text, findings ranked most
serious first.
