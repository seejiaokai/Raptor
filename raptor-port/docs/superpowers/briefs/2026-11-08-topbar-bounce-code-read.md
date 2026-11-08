# [TOPBAR-BOUNCE-AWAY] (D1873) — the code read's brief (a fresh, blind Opus reader)

Written by the host (chat 16, Opus) on 8 Nov 26. **Astra (Codex) wrote this code** (rounds 1 and 2, his D1872/D1873),
so the read is Opus's (D67, D590, D790): one fresh reader that wrote none of it and has seen neither the walk's report
nor any other reader's. **Read only; change no file; do not commit, push or start a server.** Report to the file named
at the end.

## What to read

The repository `C:/Users/User/projects/Raptor/.claude/worktrees/pr-oil-earn-ffbf07`, branch `claude/lw-pin-last-frame`,
**at the commit handed to you in the message that starts you**. The change is everything from `b0968d50d` (the last
commit before the top-bar work) to that commit, in `raptor-port/`:

`git diff b0968d50d <commit> -- raptor-port/src raptor-port/e2e`

— chiefly `src/ui/scheduler/02-shell.css` (the bar fixed to the screen and the spacer before the page), `src/ui/topbarvar.ts`
(the one writer of `--topbar-h`), `src/ui/Shell.tsx` and `src/ui/GuestApp.tsx` (who calls it, and when), their unit
tests (`topbarvar.test.ts`, `topbar-css.test.ts`, `accounts-ui.test.tsx`, `sidegrip.test.ts`) and the browser case in
`e2e/topbar-names.spec.ts`. Every reader of `--topbar-h`: `grep -rn -- '--topbar-h' raptor-port/src`. The rulings:
`.claude/rules/decisions/design.md` §The top bar (D1873, D1645, D1126, D1641–D1643) and §Saving — the "Not saved" band
(D587, D841, D1655, D1523); the full row `grep -h '^| D1873 |' .claude/decisions-full/*.md`. Performance rules:
`raptor-port/docs/performance.md` Part 1. The Leave War's and Quals' pinned rows read the bar's height
(`src/leavewar/ui/Matrix.tsx`, `src/ui/QualsPage.tsx`, search `barFoot` and `--lwy-s`).

## The promise

His ruling, 8 Nov 26 (D1873), after his iPhone recording: *on his iPhone the top bar stays on screen, on every page,
when a flick reaches a page's foot and the page springs past its end.* **The host's reading, to be checked, not
trusted:** at rest nothing he sees may change on any page — the bar, the first line under it, every window, menu and
pinned row land exactly where they did when the bar was `position: sticky`; the page goes under the bar on every
scroll and never shows through it; the page's own spring and Safari's pull-down-to-reload stay; print keeps the old
sticky bar with no empty block at the top; the "Not saved" band (and the OIL answer's bar) grows the bar and moves the
page down by the same amount in the same frame, never covering a line, and gives it back when it goes.

**How it is built (the host's reading):** on screen only, `#shell > .topbar` and `#guestApp > .topbar` are
`position: fixed` at the top, and `#shell::before` / `#guestApp::before` is an empty block `var(--topbar-h)` tall in the
bar's old place; `wireTopbarVar` writes the bar's exact border-box height to `--topbar-h` (only when it changes) at
mount, on the window's resize and from a ResizeObserver on the bar, and clears it on unmount; Shell and GuestApp call it
in a layout effect, before paint. **Round 2** changed the observer's write to wait for the next animation frame (to end
a "ResizeObserver loop" error) and whatever else its report names.

## The finder wording (use it)

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.

Places to enumerate at least: every screen that has the app's top bar (each page; the guest page; the sign-in and access
screens, which have none or another) and every one that covers it (the Scheduler Board, the Leave War's full-screen OIL
tracker, grid and settings); everything that changes the bar's height (the "Not saved" band and "Not kept", the OIL
answer's bar, the page names wrapping or folding into ☰, the phone on its side, a resize, the browser's zoom, the
claw's overlay) and whether the page moves in the SAME frame; every reader of `--topbar-h` and what it does in the first
frame and when the value is a fraction; anything else `position: fixed` or `sticky` that measured itself against the old
sticky bar (windows that open under the bar — D1645, the side menu, the bell's list, passing notes, the pinned rows,
the desktop week's ‹ › arrows, Edit Schedule's day strip); scroll restoration and "scroll into view" landing under the
bar (Undo's D672, the Approvals jump, Find); the keyboard opening on a phone; print; reduce motion; a page too short to
scroll; WebKit; sign-out and sign-in again (the variable cleared, then written), the guest page then the main app; the
effect's set-up and tear-down (listeners, observers, the animation frame, React's strict double-run).

## What is NOT a finding (D56)

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward.** If the app would do it again to NEW data, report it. Also not a finding: a scheduler who is not an admin
(D785); the original app under `reference/`.

## What to hand back

- Each finding: where, the concrete failure (setup, action, what is seen, what should be), its cause, and **exact,
  step-by-step fix instructions** — not a direction; whether `b0968d50d` (the sticky bar) did it too.
- **Explicit negatives:** "I checked X and found nothing", for each place in the list above.
- Your sandbox: if you cannot run the app or the tests, say so and name the exact input you would run; the host runs it.
- A tidiness note (D489): three questions of the changed lines — is anything duplicated that one helper would hold, is
  anything left that nothing uses, is any comment now untrue — filed, not fixed.

Write the whole report once, to the file named in the message that starts you.
