# Walk brief — the Leave War's decided Approve / Refuse look (pull request 861, WALK tier)

You walk the RUNNING app and take pictures. You do not read code for bugs and you change no source file.

## The build
- Branch `claude/lw-decide-look-197`, checked out at `C:\Users\User\projects\Raptor\.claude\worktrees\agent-a1fbc1caadb289d7a`
  (its `raptor-port/dist` is the branch's build; rebuild with `npm run build` there only if it is stale vs HEAD 35674d625 —
  check the lock first, `node raptor-port/scripts/gatelock.mjs status`; a build waits while another chat holds it).
- Serve it: from that worktree's `raptor-port/`, `npx vite preview --host 127.0.0.1 --port <free port>` (check the port
  is free first; NOT 4181, another chat's). Stop it by its port when done.
- For a comparison with `main` (some scenarios say "compare with main"): add a worktree of `origin/main` on the D: drive
  (`git -C <branch worktree> worktree add D:\raptor-walk-main origin/main --detach`), `npm ci` and `npm run build` there
  (lock first), serve on another free port. Remove that worktree when done (unlink `node_modules` first if it is a junction).
- Sign in: admin `ad`/`a` (Saber), member `us`/`us` (Ranger). Login `#luser` `#lpass` `#loginForm button[type=submit]`.
- Write walk scripts as files (never `node -e`); follow `raptor-port/docs/walk-scripts.md` (read it first, whole); use
  the repo's browser fallback from `playwright.config.ts`. Phone: 390x844 and his iPhone 402x874 (WebKit, touch, scale 3);
  desktop 1536x864. Watch console errors, page errors and 4xx.

## What to walk — the host's combined list
Two blind designers wrote scenario lists; walk BOTH, deduplicated:
- Fable: `C:\Users\User\AppData\Local\Temp\claude\7882e100a472846f\0e31387a-f363-4549-8d4c-24087fed540d\scratchpad\lwdl-scen-fable.md` (25)
- Astra: `C:\Users\User\AppData\Local\Temp\claude\7882e100a472846f\0e31387a-f363-4549-8d4c-24087fed540d\scratchpad\lwdl-scen-astra.md` (22)
Where two scenarios test the same thing, walk it once and credit both numbers. Most important first: the keyboard ring on
a decided / greyed button (one ring, the app's cyan), a ring cut by its list's edge, buttons moving or changing size
across waiting / approved / refused (measure boxes), the greyed one pressed deciding the other way in one press, the
second tap back to waiting, Approvals' line staying put, a member seeing nothing to decide, Approvals' phone date line.
Then the rest.
**The plain-user round** (`raptor-port/docs/bug-check-order.md` §7.0a — read it): an admin's everyday deciding, start
to finish, on a phone and a desktop: open a day, approve, change his mind, refuse, Approvals through a few lines, Approve
all, Undo — every control that opens or closes pressed, and the grid cell and Approvals counts looked at after each.
**The drawing check:** the bid window against `raptor-port/docs/mock/2026-11-27-decide-buttons/img/trio-E3-phone.png` and
`-desktop.png` (in `C:\Users\User\projects\Raptor\.claude\worktrees\leave-points-notifications-7a2f04-b1b885\`): list
every difference over about 2px in place, size, colour or text alignment, with marked pictures side by side.

Known, his call already put to him (report, do not treat as new): on Approvals at 390 wide a half-day date's "›" drops to
a second line (one line at 402); desktop Approvals' Approve is ~14px wider than before.
Not a finding: a problem only in stored demo data (D56); a scheduler who is not an admin (D785).

## Where things go
- Pictures: `C:\Users\User\projects\Raptor\.claude\worktrees\agent-a1fbc1caadb289d7a\raptor-port\docs\img\handpass\2026-11-28-lw-decide-look\`
  (cropped to the area that matters; name each by scenario, e.g. `F1-A3-keyboard-ring-desktop.png`).
- Walk scripts: `...\agent-a1fbc1caadb289d7a\raptor-port\scripts\handpass\lwdl-*.mjs`.
- Raw logs and dumps: OUTSIDE the checkout, in the scratchpad folder above.
- Commit nothing; push nothing.

## Your final reply (your report)
Start with `WALK lw-decide-look`. A table, one row per scenario walked (both lists' numbers): size(s), PASS / FAIL /
REPORT-FOR-HIS-CALL, the picture file(s), one line of what was seen. Then each FAIL in full: steps to reproduce,
expected, seen, picture, and whether `main` does the same. Then the drawing-check differences, the plain-user round's
result, console/page errors, anything you could not walk and why, and the walk's duration.
